import os
import sys  # <--- ADDED for command-line arguments
import json
import warnings
from datetime import datetime, date
from typing import Generator, List, Optional

import requests 
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel

# Suppress LangChain legacy deprecation warnings cluttering output
warnings.filterwarnings("ignore", category=DeprecationWarning)

from sqlalchemy import (
    create_engine,
    Column,
    String,
    Date,
    Text,
    Numeric,
    DateTime,
    ForeignKey,
    Integer,
    Boolean,
)
from sqlalchemy.orm import sessionmaker, relationship, Session, declarative_base

# -------------------------------------------------------------------
# Environment & setup
# -------------------------------------------------------------------
load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://ilb3010tdpteam1postgresserver.postgres.database.azure.com:5432/postgres?sslmode=require",
)

FOUNDRY_ENDPOINT = os.getenv("FOUNDRY_ENDPOINT")
FOUNDRY_API_KEY = os.getenv("FOUNDRY_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")  # for embeddings

if not FOUNDRY_ENDPOINT or not FOUNDRY_API_KEY:
    raise RuntimeError("FOUNDRY_ENDPOINT and FOUNDRY_API_KEY must be set")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY must be set for embeddings")

# -------------------------------------------------------------------
# SQLAlchemy models matching the actual database schema
# -------------------------------------------------------------------
Base = declarative_base()


class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(String, primary_key=True)
    full_name = Column(String)
    dob = Column(Date)
    age = Column(Integer)
    city = Column(String)
    state = Column(String)
    zip_code = Column(String)
    country = Column(String)
    employment = Column(String)
    total_assets = Column(Numeric)
    total_liabilities = Column(Numeric)  
    net_worth = Column(Numeric)          
    estimated_income = Column(String)
    consumer_segment = Column(String)
    housing_status = Column(String)
    marital_status = Column(String)
    student = Column(String)
    account_created = Column(Date)
    length_of_residence = Column(String)
    has_dependents = Column(String)      
    number_of_adults = Column(Integer)
    company_employee = Column(String)
    has_mortgage = Column(String)
    phone_num = Column(String)           
    email = Column(String)               
    do_not_call = Column(Boolean)        
    total_rewards_status = Column(String)
    relationships = Column(Text)
    opportunities = Column(Text)
    client_summary = Column(Text)

    accounts = relationship("Account", back_populates="customer")
    interactions = relationship("Interaction", back_populates="customer")
    transactions = relationship("Transaction", back_populates="customer")


class Account(Base):
    __tablename__ = "accounts"

    account_id = Column(String, primary_key=True)
    customer_id = Column(String, ForeignKey("customers.customer_id"))
    is_joint = Column(String)
    joint_customer_id = Column(String)
    account_category = Column(String)
    account_type = Column(String)
    balance = Column(Numeric)
    date_opened = Column(Date)
    maturity_date = Column(Date)
    interest_rate = Column(Numeric)
    last_activity_amount = Column(Numeric)
    last_activity_date = Column(Date)

    customer = relationship("Customer", back_populates="accounts")


class Interaction(Base):
    __tablename__ = "interactions"

    interaction_id = Column(Integer, primary_key=True)
    customer_id = Column(String, ForeignKey("customers.customer_id"))
    interaction_date = Column(Date)
    prep_notes = Column(Text)
    track_expenses = Column(Boolean)
    track_expenses_desc = Column(Text)
    borrow_money = Column(Boolean)
    borrow_money_desc = Column(Text)
    save_retirement = Column(Boolean)
    save_retirement_desc = Column(Text)
    income_srcs = Column(Text)
    current_save = Column(Text)
    typ_purchase = Column(Text)
    banker_notes = Column(Text)
    pnc_notes = Column(Text)

    customer = relationship("Customer", back_populates="interactions")


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True)
    account_id = Column(String)
    account_category = Column(String)
    account_type = Column(String)
    customer_id = Column(String, ForeignKey("customers.customer_id"))
    description = Column(Text)
    category = Column(String)
    transaction_type = Column(String)
    transaction_amt = Column(Numeric)
    acct_balance = Column(Numeric)
    transaction_date = Column(Date)
    transaction_made_by = Column(String)

    customer = relationship("Customer", back_populates="transactions")


class Insight(Base):
    """SQLAlchemy model explicitly using Text for priority values."""
    __tablename__ = "insights"

    customer_id = Column(String(20), primary_key=True, nullable=False)
    summary = Column(Text, nullable=True)
    category = Column(Text, nullable=True)
    
    # Opportunity 1 Columns
    opportunity_1_title = Column(Text, nullable=True)
    opportunity_1_rationale = Column(Text, nullable=True)
    opportunity_1_priority = Column(Text, nullable=True)  # <-- Direct raw string storage ('High', 'Medium', 'Low')
    
    # Opportunity 2 Columns
    opportunity_2_title = Column(Text, nullable=True)
    opportunity_2_rationale = Column(Text, nullable=True)
    opportunity_2_priority = Column(Text, nullable=True)  # <-- Direct raw string storage ('High', 'Medium', 'Low')
    
    # Opportunity 3 Columns
    opportunity_3_title = Column(Text, nullable=True)
    opportunity_3_rationale = Column(Text, nullable=True)
    opportunity_3_priority = Column(Text, nullable=True)  # <-- Direct raw string storage ('High', 'Medium', 'Low')


# -------------------------------------------------------------------
# Database session
# -------------------------------------------------------------------
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Automatically ensures the insights table exists matching your layout
Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------------------------------------------------
# Vector store (RAG) setup
# -------------------------------------------------------------------
from langchain_core.embeddings import FakeEmbeddings
from langchain_community.vectorstores import FAISS

embeddings = FakeEmbeddings(size=1536)

vector_store = FAISS.from_texts(
    texts=["initialization payload"], 
    embedding=embeddings
)
vector_store.delete([list(vector_store.docstore._dict.keys())[0]])


def index_customer_documents(db: Session, customer_id: str) -> None:
    """Index all relevant text for a customer into the vector store."""
    customer = (
        db.query(Customer).filter(Customer.customer_id == customer_id).first()
    )
    if not customer_id or not customer:
        return

    docs: List[str] = []
    metas: List[dict] = []

    for i in customer.interactions:
        interaction_text_segments = []
        if i.prep_notes: interaction_text_segments.append(f"Prep Notes: {i.prep_notes}")
        if i.track_expenses_desc: interaction_text_segments.append(f"Expenses Tracking: {i.track_expenses_desc}")
        if i.borrow_money_desc: interaction_text_segments.append(f"Borrowing Strategy: {i.borrow_money_desc}")
        if i.save_retirement_desc: interaction_text_segments.append(f"Retirement Goals: {i.save_retirement_desc}")
        if i.income_srcs: interaction_text_segments.append(f"Income Sources: {i.income_srcs}")
        if i.current_save: interaction_text_segments.append(f"Current Savings Behavior: {i.current_save}")
        if i.typ_purchase: interaction_text_segments.append(f"Typical Purchases: {i.typ_purchase}")
        if i.banker_notes: interaction_text_segments.append(f"Banker Discovery Summary: {i.banker_notes}")
        if i.pnc_notes: interaction_text_segments.append(f"PNC Advisory Notes: {i.pnc_notes}")

        if interaction_text_segments:
            combined_notes = " | ".join(interaction_text_segments)
            docs.append(f"Interaction on {i.interaction_date or 'Unknown Date'}: {combined_notes}")
            metas.append({"customer_id": customer_id, "type": "interaction"})

    for t in customer.transactions:
        if t.description:
            docs.append(
                f"Transaction on {t.transaction_date} ({t.transaction_type} - {t.category}) of ${t.transaction_amt}: {t.description}"
            )
            metas.append(
                {"customer_id": customer_id, "type": "transaction"}
            )

    if docs:
        vector_store.add_texts(texts=docs, metadatas=metas)


def retrieve_context(customer_id: str, query: str) -> str:
    """Retrieve top-k relevant chunks for a customer."""
    results = vector_store.similarity_search(
        query=query,
        k=5,
        filter={"customer_id": customer_id},
    )
    return "\n\n".join([r.page_content for r in results])


# -------------------------------------------------------------------
# Client profile builder
# -------------------------------------------------------------------
def build_client_profile(db: Session, customer_id: str) -> dict:
    c = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if not c:
        raise HTTPException(status_code=404, detail=f"Customer with ID '{customer_id}' not found in database.")

    profile = {
        "id": c.customer_id,
        "name": c.full_name,
        "dob": c.dob.isoformat() if isinstance(c.dob, date) else None,
        "age": c.age,
        "location": f"{c.city or ''}, {c.state or ''} {c.zip_code or ''}".strip(),
        "employment": c.employment,
        "estimated_income": c.estimated_income,
        "segment": c.consumer_segment,
        "marital_status": c.marital_status,
        "total_assets": float(c.total_assets) if c.total_assets is not None else 0.0,
        "account_created": c.account_created.isoformat() if isinstance(c.account_created, date) else None,
        "accounts": [
            {
                "id": a.account_id,
                "category": a.account_category,
                "type": a.account_type,
                "is_joint": a.is_joint,
                "balance": float(a.balance) if a.balance is not None else None,
                "interest_rate": float(a.interest_rate) if a.interest_rate is not None else None,
                "date_opened": a.date_opened.isoformat() if isinstance(a.date_opened, date) else None,
                "last_activity_date": a.last_activity_date.isoformat() if isinstance(a.last_activity_date, date) else None,
            }
            for a in c.accounts
        ],
        "transactions": [
            {
                "id": t.transaction_id,
                "account_id": t.account_id,
                "type": t.transaction_type,
                "category": t.category,
                "amount": float(t.transaction_amt) if t.transaction_amt is not None else 0.0,
                "date": t.transaction_date.isoformat() if isinstance(t.transaction_date, date) else None,
                "description": t.description,
            }
            for t in c.transactions
        ],
        "interactions": [
            {
                "id": i.interaction_id,
                "date": i.interaction_date.isoformat() if isinstance(i.interaction_date, (date, datetime)) else None,
                "prep_notes": i.prep_notes,
                "track_expenses": i.track_expenses,
                "track_expenses_desc": i.track_expenses_desc,
                "borrow_money": i.borrow_money,
                "borrow_money_desc": i.borrow_money_desc,
                "save_retirement": i.save_retirement,
                "save_retirement_desc": i.save_retirement_desc,
                "income_srcs": i.income_srcs,
                "current_save": i.current_save,
                "typ_purchase": i.typ_purchase,
                "banker_notes": i.banker_notes,
                "pnc_notes": i.pnc_notes,
            }
            for i in c.interactions
        ],
    }
    return profile


# -------------------------------------------------------------------
# Azure Studio / Foundry Client Alignment
# -------------------------------------------------------------------
clean_endpoint = FOUNDRY_ENDPOINT.split("/openai")[0].strip()
TARGET_API_URL = f"{clean_endpoint}/openai/responses"


class RecommendationService(BaseModel):
    category: str
    label: Optional[str] = None
    id: Optional[str] = None
    team: Optional[str] = None


class RecommendationItem(BaseModel):
    title: str
    rationale: str
    priority: str
    service: RecommendationService


class InsightResponse(BaseModel):
    headline: str
    summary: str
    recommendations: List[RecommendationItem]


def generate_client_insights(profile: dict, rag_context: str) -> InsightResponse:
    system = """
    You are an elite, proactive Bank Sales Officer and Relationship Manager. Your primary goal is to scan the customer's financial profile, transaction histories, and interactions to discover revenue-generating opportunities and product cross-sell gaps.
    
    Analyze what products or financial upgrades this customer lacks or qualifies for based on their assets, segment, and lifestyle needs. You must specify exact, actionable banking product offerings (e.g., 'Cashback Credit Card', 'High-Yield Savings Growth Account', 'Premium Student Checking', 'Home Equity Line of Credit (HELOC)', or 'Personal Wealth Advisory Review').

    Make the only 3 reccomendations, and they should be one sentence only. Also, do not reccommend produts which a customer is already enrolled or does not reflect their finances in:
    For example: Do not reccommend a checking account if they already have one.
    Do not use words like "Your" since a banker has to refer to the client by their name.
    Output only valid JSON (no markdown wrapping, no conversational explanation). Use this schema structure exactly:
    {
      "headline": string, 
      "summary": string,  
      "recommendations": [
        {
          "title": string,  
          "rationale": string, 
          "priority": "High"|"Medium"|"Low",
          "service": {
            "category": "Personal Banking"|"Wealth Management"|"Business and Institutional",
            "label": string|null,
            "id": string|null,
            "team": string|null
          }
        }
      ],
    }
    Be highly concise. Do not include markdown codeblocks or '```json' wrapper formatting.
    """

    prompt = f"""
    Client Profile Data (JSON):
    {json.dumps(profile, indent=2)}

    Retrieved Context History Chunks:
    {rag_context}
    """

    try:
        headers = {
            "Authorization": f"Bearer {FOUNDRY_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "gpt-5.4-pro",
            "input": [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ],
            "max_output_tokens": 4000
        }
        
        params = {
            "api-version": "2025-04-01-preview"
        }
        
        response = requests.post(TARGET_API_URL, headers=headers, json=payload, params=params)
        response.raise_for_status()
        
        response_json = response.json()
        
        if "choices" in response_json:
            text = response_json["choices"][0]["message"]["content"].strip()
        elif "output" in response_json and isinstance(response_json["output"], list):
            text = None
            for item in response_json["output"]:
                if item.get("type") == "message" and "content" in item:
                    for content_item in item["content"]:
                        if content_item.get("type") == "output_text":
                            text = content_item.get("text", "").strip()
                            break
                if text:
                    break
            if not text:
                raise KeyError("Could not find 'output_text' block within server output payload entries.")
        else:
            raise KeyError("Unknown response layout schema archetype received.")
        
    except Exception as raw_err:
        if 'response' in locals() and hasattr(response, 'text'):
            raise RuntimeError(f"{raw_err}\nServer Response Summary: {response.text}")
        raise RuntimeError(raw_err)

    try:
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()
            if text.endswith("```"):
                text = text[:-3].strip()
                
        data = json.loads(text)
        return InsightResponse(**data)
        
    except Exception as parse_err:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to cleanly interpret raw structural response payload: {parse_err}. Raw text was: {text}",
        )


def save_insights_to_db(db: Session, customer_id: str, insights: InsightResponse) -> None:
    """Saves structured LLM outputs into the database matching the insights table column layout."""
    
    # Avoid duplicate rows on runtime rerun loops
    existing_insight = db.query(Insight).filter(Insight.customer_id == customer_id).first()
    if existing_insight:
        print(f"⚠️ Insights for customer {customer_id} already exist. Skipping database insert to prevent unique PK crash.")
        return

    recs = insights.recommendations
    
    # Safely extract values for each distinct opportunity variable
    t1, rat1, p1 = (recs[0].title, recs[0].rationale, recs[0].priority) if len(recs) > 0 else (None, None, None)
    t2, rat2, p2 = (recs[1].title, recs[1].rationale, recs[1].priority) if len(recs) > 1 else (None, None, None)
    t3, rat3, p3 = (recs[2].title, recs[2].rationale, recs[2].priority) if len(recs) > 2 else (None, None, None)

    # Use first recommendation's service category as general table marker segment
    general_category = recs[0].service.category if len(recs) > 0 else None

    # Construct complete SQL model instantiation object mapping
    new_insight = Insight(
        customer_id=customer_id,
        summary=insights.summary,
        category=general_category,
        opportunity_1_title=t1,
        opportunity_1_rationale=rat1,
        opportunity_1_priority=p1,  # Saves direct text variable string (e.g. "High")
        opportunity_2_title=t2,
        opportunity_2_rationale=rat2,
        opportunity_2_priority=p2,  # Saves direct text variable string (e.g. "High")
        opportunity_3_title=t3,
        opportunity_3_rationale=rat3,
        opportunity_3_priority=p3   # Saves direct text variable string (e.g. "Medium")
    )

    try:
        db.add(new_insight)
        db.commit()
        print(f"✅ Successfully saved results into insights table for customer: {customer_id}")
    except Exception as e:
        db.rollback()
        print(f"❌ Failed transactional upload to PostgreSQL insights table: {e}")


# -------------------------------------------------------------------
# FastAPI app
# -------------------------------------------------------------------
app = FastAPI(title="Branch Banker RAG Insights API")


@app.get("/insights/{customer_id}", response_model=InsightResponse)
def get_insights(customer_id: str, db: Session = Depends(get_db)):
    profile = build_client_profile(db, customer_id)
    index_customer_documents(db, customer_id)
    rag_context = retrieve_context(
        customer_id, "financial behavior, needs, and product opportunities"
    )
    insights = generate_client_insights(profile, rag_context)
    
    # Save automatically on web API triggers
    save_insights_to_db(db, customer_id, insights)
    
    return insights


# -------------------------------------------------------------------
# Dynamic Command line Terminal Print Block
# -------------------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) > 1:
        TEST_CUSTOMER_ID = sys.argv[1]
    else:
        TEST_CUSTOMER_ID = "CUST0003" 
        print(f"⚠️ No ID provided in terminal command. Falling back to default: {TEST_CUSTOMER_ID}")
    
    print(f"\n🚀 Running direct test block for Customer: {TEST_CUSTOMER_ID}")
    
    db_session = SessionLocal()
    try:
        print("📥 Querying Postgres profile...")
        profile_data = build_client_profile(db_session, TEST_CUSTOMER_ID)
        
        print("🧠 Tokenizing and embedding into FAISS...")
        index_customer_documents(db_session, TEST_CUSTOMER_ID)
        
        print("🔍 Extracting vector matching blocks...")
        rag_context_data = retrieve_context(
            TEST_CUSTOMER_ID, 
            "financial behavior, needs, and product opportunities"
        )
        
        print("🤖 Requesting evaluation from GPT-5.4 Pro...")
        ai_insights = generate_client_insights(profile_data, rag_context_data)
        
        print("💾 Saving evaluation results directly to PostgreSQL tables...")
        save_insights_to_db(db_session, TEST_CUSTOMER_ID, ai_insights)
        
        print("\n✨ --- LIVE AI RESPONSE FROM TERMINAL --- ✨")
        print(json.dumps(ai_insights.model_dump(), indent=2))
        print("="*45)

    except HTTPException as http_err:
        print(f"\n❌ API Error: {http_err.detail}")
    except Exception as e:
        print(f"\n❌ Error during terminal print sequence: {e}")
    finally:
        db_session.close()
        print("\n🔌 Session recycled safely.")