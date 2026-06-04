
USERNAME = "TDPHackUser1"
PASSWORD = "SqlTeam1Pass"

from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy import create_engine, Column, String, Text
from sqlalchemy.orm import sessionmaker, declarative_base, Session

# ---------------------------------------------------------
# 1. DATABASE CONNECTION 
# ---------------------------------------------------------
USERNAME = "TDPHackUser1"
PASSWORD = "SqlTeam1Pass"


DATABASE_URL = (
    f"postgresql+psycopg2://{USERNAME}:{PASSWORD}"
    "@ilb3010tdpteam1postgresserver.postgres.database.azure.com:5432/postgres"
    "?sslmode=require"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

# ---------------------------------------------------------
# 2. SQLAlchemy Model
# ---------------------------------------------------------
class CustomerInsights(Base):
    __tablename__ = "insights"

    customer_id = Column(String(20), primary_key=True)
    summary = Column(Text)
    category = Column(Text)

    opportunity_1_title = Column(Text)
    opportunity_1_rationale = Column(Text)
    opportunity_1_priority = Column(Text)

    opportunity_2_title = Column(Text)
    opportunity_2_rationale = Column(Text)
    opportunity_2_priority = Column(Text)

    opportunity_3_title = Column(Text)
    opportunity_3_rationale = Column(Text)
    opportunity_3_priority = Column(Text)

# ---------------------------------------------------------
# 3. FastAPI App
# ---------------------------------------------------------
app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------------------------------------------
# 4. API Endpoint (frontend calls this)
# ---------------------------------------------------------
@app.get("/insights/{customer_id}")
def get_insights(customer_id: str, db: Session = Depends(get_db)):
    row = db.query(CustomerInsights).filter(
        CustomerInsights.customer_id == customer_id
    ).first()

    if not row:
        print(f"No results found for customer_id={customer_id}")
        raise HTTPException(status_code=404, detail="Customer not found")

    result = {
        "customer_id": row.customer_id,
        "summary": row.summary,
        "category": row.category,
        "opportunities": [
            {
                "title": row.opportunity_1_title,
                "rationale": row.opportunity_1_rationale,
                "priority": row.opportunity_1_priority,
            },
            {
                "title": row.opportunity_2_title,
                "rationale": row.opportunity_2_rationale,
                "priority": row.opportunity_2_priority,
            },
            {
                "title": row.opportunity_3_title,
                "rationale": row.opportunity_3_rationale,
                "priority": row.opportunity_3_priority,
            },
        ],
    }

    # Print to terminal so you see the output
    print("\n=== FETCHED CUSTOMER INSIGHTS ===")
    print(result)
    print("=================================\n")

    return result

# # ---------------------------------------------------------
# # 5. RUN DIRECTLY: print results immediately
# # ---------------------------------------------------------
# if __name__ == "__main__":
#     print("\nRunning direct DB test...\n")
#     db = SessionLocal()

#     try:
#         rows = db.query(CustomerInsights).all()

#         if not rows:
#             print("No rows found in insights table.")
#         else:
#             print("=== ALL ROWS FROM insights TABLE ===")
#             for r in rows:
#                 print(r.__dict__)
#             print("====================================\n")

#     except Exception as e:
#         print("Database connection failed:", e)

#     db.close()


