import os
import time
import requests
import json
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from openai import AzureOpenAI

load_dotenv()

FOUNDRY_ENDPOINT = os.getenv("FOUNDRY_ENDPOINT")
FOUNDRY_API_KEY = os.getenv("FOUNDRY_API_KEY")
AI_CACHE_TTL = int(os.getenv("AI_CACHE_TTL", 3600))  # Cache TTL in seconds (default: 1 hour)

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
    _ai_cache[key] = {
        "value": value,
        "expires_at": time.time() + ttl
    }

def call_foundry(prompt: str, system_instructions: str = "", max_tokens: int = 400, temperature: float = 0.2) -> Dict[str, Any]:
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
            {"role": "user", "content": prompt}
        ],
        max_tokens=max_tokens,
        temperature=temperature,
    )

    return completion.output[1].content[0]

def build_client_insights_prompt(client_obj: Dict[str, Any]) -> str:
    clean_payload = {
        "id": client_obj.get("id"),
        "name": client_obj.get("name"),
        "relationship": client_obj.get("relationship"),
        "age": client_obj.get("age"),
        "employment": client_obj.get("employment"),
        "totalAssets": client_obj.get("totalAssets"),
        "netWorth": client_obj.get("netWorth"),
        "liquidity": client_obj.get("liquidity"),
        "creditScore": client_obj.get("creditScore"),
        "riskLevel": client_obj.get("riskLevel"),
        "clientGoals": client_obj.get("clientGoals"),
        "accounts": client_obj.get("accounts"),
        "spendTransactions": client_obj.get("spendTransactions"),
        "alerts": client_obj.get("alerts"),
        "campaignReferrals": client_obj.get("campaignReferrals"),
        "appointments": client_obj.get("appointments"),
        "opportunities": client_obj.get("opportunities"),
        "clientSummary": client_obj.get("clientSummary"),
        "notes": client_obj.get("notes"),
    }

    return f"""
    You are a helpful, risk-aware financial insights assistent for branch bankers.
    You will receive a client profile as JSON. Produce a JSON object only with the keys:
    - headline
    - summary
    - recommendations (array of objects with title, rationale, priority)
    - riskFlags (array of strings)

    Client Profile:
    {json.dumps(clean_payload, indent=2)}
    """

def parse_ai_response(response: Dict[str, Any]) -> Dict[str, Any]:
    if isinstance(response, dict):
        if "json" in response and isinstance(response["json"], dict):
            return response["json"]
        if "text" in response:
            try:
                return json.loads(response["text"])
            except json.JSONDecodeError:
                return {
                    "headline": "AI insight unavailable",
                    "summary": response["text"][:500],
                    "recommendations": [],
                    "riskFlags": []
                }

def generate_insights(client_obj: Dict[str, Any]) -> Dict[str, Any]:
    cache_key = f"ai_insights:{client_obj.get('id')}"
    cached = _get_cached(cache_key)
    if cached:
        return cached
    
    system = (
        "You are a concise, professional financial insights assistant for branch bankers. "
        "Return JSON only."
    )

    prompt = build_client_insights_prompt(client_obj)
    response = call_foundry(prompt=prompt, system_instructions=system)
    insights = parse_ai_response(response)
    _set_cached(cache_key, insights)
    return insights

if __name__ == "__main__":
    from data import clients
    sample = clients[0]
    print(generate_insights(sample))