import os
import re
import json
import time
from typing import Dict, Any, List, Optional
from collections import defaultdict
from dotenv import load_dotenv
from openai import AzureOpenAI

load_dotenv()

FOUNDRY_ENDPOINT = os.getenv("FOUNDRY_ENDPOINT")
FOUNDRY_API_KEY = os.getenv("FOUNDRY_API_KEY")
AI_CACHE_TTL = int(os.getenv("AI_CACHE_TTL", 3600))

_ai_cache: Dict[str, Dict[str, Any]] = {}


def _get_cached(key: str) -> Optional[Dict[str, Any]]:
    item = _ai_cache.get(key)
    if not item:
        return None
    if time.time() > item["expires_at"]:
        del _ai_cache[key]
        return None
    return item["value"]


def _set_cached(key: str, value: Dict[str, Any], ttl: int = AI_CACHE_TTL):
    _ai_cache[key] = {"value": value, "expires_at": time.time() + ttl}


def _bucket_amount(amount: float) -> str:
    if amount is None:
        return "unknown"
    try:
        a = float(amount)
    except Exception:
        return "unknown"
    if a < 1_000:
        return "<1k"
    if a < 10_000:
        return "1k-10k"
    if a < 100_000:
        return "10k-100k"
    if a < 1_000_000:
        return "100k-1M"
    return "1M+"


def _bucket_age(age: int) -> str:
    if age is None:
        return "unknown"
    try:
        a = int(age)
    except Exception:
        return "unknown"
    low = (a // 10) * 10
    return f"{low}-{low+9}"


def _redact_text(s: str) -> str:
    if not s:
        return ""
    # Ensure we handle non-string inputs gracefully
    if not isinstance(s, str):
        try:
            s = str(s)
        except Exception:
            return ""
    # Minimal redaction: emails, phones, sequences of digits (likely account numbers)
    s = re.sub(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b", "[REDACTED_EMAIL]", s)
    s = re.sub(r"\b(?:\+?\d[\d -]{7,}\d)\b", "[REDACTED_PHONE]", s)
    s = re.sub(r"\b\d{4,}\b", "[REDACTED_DIGITS]", s)
    return s


def _aggregate_transactions(txns: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not txns:
        return {"byCategory": {}, "monthlyAvg": None, "txnCount": 0}
    cat = defaultdict(float)
    total = 0.0
    count = 0
    for t in txns:
        if not isinstance(t, dict):
            # skip malformed txn entries
            continue
        try:
            # support alternative keys like 'amt'
            amt = t.get("amount") if "amount" in t else t.get("amt") if "amt" in t else 0
            amt = float(amt or 0)
        except Exception:
            amt = 0.0
        category = t.get("category") or t.get("type") or "other"
        try:
            key = str(category)
        except Exception:
            key = "other"
        cat[key] += abs(amt)
        total += abs(amt)
        count += 1
    monthly_avg = (total / 12.0) if total else None
    return {"byCategory": dict(cat), "monthlyAvg": (round(monthly_avg, 2) if monthly_avg is not None else None), "txnCount": count}


def sanitize_client_for_ai(client_obj: Dict[str, Any]) -> Dict[str, Any]:
    """Return a sanitized, privacy-preserving payload suitable for AI prompts.

    - Removes direct identifiers (`id`, `name`).
    - Buckets/rounds numeric values.
    - Aggregates transactions by category and redacts free text.
    """
    sanitized = {
        "id": None,
        "name": None,

        "age": _bucket_age(client_obj.get("age")) if client_obj else "unknown",
        "relationship": client_obj.get("relationship") if client_obj else None,

        "employment": {
            "role": (
                _redact_text(client_obj.get("employment", {}).get("role"))
                if isinstance(client_obj.get("employment"), dict)
                else _redact_text(client_obj.get("employment") or "")
            )
        },

        "totalAssets": _bucket_amount(client_obj.get("totalAssets")),
        "netWorth": _bucket_amount(client_obj.get("netWorth")),
        "liquidity": client_obj.get("liquidity"),
        "creditScore": (
            (lambda s: "unknown" if s is None else f"{(int(s)//50)*50}-{(int(s)//50)*50+49}")(
                client_obj.get("creditScore")
            )
            if client_obj.get("creditScore")
            else "unknown"
        ),
        "riskLevel": client_obj.get("riskLevel"),

        # clientGoals may be a list of goal dicts or strings; normalize to list of redacted strings
        "clientGoals": [
            _redact_text(g.get("goal") if isinstance(g, dict) else (g or ""))
            for g in (client_obj.get("clientGoals") or [])
        ],
        "clientSummary": _redact_text(client_obj.get("clientSummary") or ""),

        "accounts": [
            {
                "type": (a.get("type") if isinstance(a, dict) else (str(a) if a is not None else None)),
                "balanceBucket": _bucket_amount(a.get("balance") if isinstance(a, dict) else None),
            }
            for a in (client_obj.get("accounts") or [])
            if a is not None
        ],

        "spendTransactions": _aggregate_transactions(client_obj.get("spendTransactions") or []),

        # alerts may be list of strings or dicts
        "alerts": [
            ({"type": _redact_text(x), "severity": None} if isinstance(x, str) else {"type": x.get("type"), "severity": x.get("severity")})
            for x in (client_obj.get("alerts") or [])
        ],

        "opportunities": [_redact_text(o) for o in (client_obj.get("opportunities") or []) if o is not None],
        "notes": _redact_text(client_obj.get("notes") or ""),
    }

    return sanitized


def parse_ai_response(response: Any) -> Dict[str, Any]:
    """Robustly parse AI responses produced by the SDK or plain dicts.

    Handles these forms:
    - dict with `json` or `text`
    - objects with `.json` or `.text`
    - SDK Response objects with `output -> message -> content -> text`
    Returns a JSON-parsed dict when possible, otherwise a fallback structure.
    """

    def fallback(text: str):
        return {
            "headline": "AI insight unavailable",
            "summary": (text or ""),
            "recommendations": [],
            "riskFlags": [],
        }

    # 1) dict-like
    if isinstance(response, dict):
        if "json" in response and isinstance(response["json"], dict):
            return response["json"]
        if "text" in response:
            try:
                return json.loads(response["text"])
            except (TypeError, json.JSONDecodeError):
                return fallback(response.get("text"))

    # 2) object attributes .json / .text
    json_attr = getattr(response, "json", None)
    if isinstance(json_attr, dict):
        return json_attr

    text_attr = getattr(response, "text", None)
    if isinstance(text_attr, str):
        try:
            return json.loads(text_attr)
        except (TypeError, json.JSONDecodeError):
            return fallback(text_attr)

    # 3) structured `output` path used by some SDKs
    output = None
    if isinstance(response, dict):
        output = response.get("output")
    else:
        output = getattr(response, "output", None)

    if output and isinstance(output, (list, tuple)):
        for item in output:
            # item may be dict-like or object-like
            content = None
            if isinstance(item, dict):
                content = item.get("content") or item.get("contents")
            else:
                content = getattr(item, "content", None) or getattr(item, "contents", None)

            if not content:
                continue

            for c in content:
                # c may be dict-like or object-like
                text = c.get("text") if isinstance(c, dict) else getattr(c, "text", None)
                if not text:
                    if isinstance(c, str):
                        text = c
                if text:
                    try:
                        return json.loads(text)
                    except (TypeError, json.JSONDecodeError):
                        return fallback(text)

    # last resort: stringify and fallback
    try:
        return fallback(str(response))
    except Exception:
        return fallback(None)


def call_foundry(prompt: str, system_instructions: str = "", max_tokens: int = 16384, temperature: float = 0.2) -> Dict[str, Any]:
    if not FOUNDRY_ENDPOINT or not FOUNDRY_API_KEY:
        raise RuntimeError("Set secrets for Azure Foundry")

    client = AzureOpenAI(
        api_version="2025-04-01-preview",
        azure_endpoint=FOUNDRY_ENDPOINT,
        api_key=FOUNDRY_API_KEY,
    )

    completion = client.responses.create(
        model="gpt-5.4-pro",
        input=[
            {"role": "system", "content": system_instructions},
            {"role": "user", "content": prompt},
        ],
        max_output_tokens=max_tokens,
    )

    # Mirror ai_insights behavior: return the first content item
    try:
        return completion.output[1].content[0]
    except Exception:
        return completion


def build_client_insights_prompt(sanitized_payload: Dict[str, Any]) -> str:
    return f"""
    You are a helpful, risk-aware financial insights assistant for branch bankers.
    You will receive a client profile as JSON. Produce a JSON object only with the keys:
    - headline
    - summary
    - recommendations (array of objects with title, rationale, priority)
    - riskFlags (array of strings)

    Client Profile:
    {json.dumps(sanitized_payload, indent=2)}
    """


def generate_insights(client_obj: Dict[str, Any]) -> Dict[str, Any]:
    cache_key = f"new_ai_insights:{client_obj.get('id') or 'anon'}"
    cached = _get_cached(cache_key)
    if cached:
        return cached

    system = (
        "You are a concise, professional financial insights assistant for branch bankers. "
        "Return JSON only."
    )

    sanitized = sanitize_client_for_ai(client_obj)
    prompt = build_client_insights_prompt(sanitized)
    response = call_foundry(prompt=prompt, system_instructions=system)
    insights = parse_ai_response(response)
    _set_cached(cache_key, insights)
    return insights


if __name__ == "__main__":
    # Quick demonstration: sanitize a sample client dict and show output
    # sample = {
    #     "id": "client_123",
    #     "name": "Jane Doe",
    #     "age": 38,
    #     "employment": {"role": "Senior Engineer", "employer": "BigCo"},
    #     "totalAssets": 152345.12,
    #     "netWorth": 120000.5,
    #     "liquidity": "medium",
    #     "creditScore": 720,
    #     "riskLevel": "moderate",
    #     "clientGoals": "Save for child's college and early retirement",
    #     "accounts": [{"type": "checking", "balance": 2345.6}, {"type": "ira", "balance": 120000}],
    #     "spendTransactions": [{"amount": -45.2, "category": "groceries"}, {"amount": -1200, "category": "rent"}],
    #     "alerts": [{"type": "low_balance", "severity": "medium"}],
    #     "opportunities": ["Eligible for mortgage refinance"],
    #     "notes": "Called about mortgage rates; phone 555-1234; email jane@example.com",
    # }
    from data import clients
    sample = clients[0]

    sanitized = sanitize_client_for_ai(sample)
    print("Sanitized payload:\n", json.dumps(sanitized, indent=2))

    # Attempt to call the LLM (will raise if env not configured)
    try:
        out = generate_insights(sample)
        print("Insights:\n", json.dumps(out, indent=2))
    except Exception as e:
        print("LLM call skipped or failed:", str(e))
