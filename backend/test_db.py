
"""
Test script to verify database connection and data access.
Run this before starting the FastAPI server to ensure everything works.
"""

import os
from dotenv import load_dotenv
from sqlalchemy.orm import sessionmaker
from models import engine, Customer, Account, Transaction, Interaction, Opportunity

def test_database_connection():
    """Test database connection and basic queries"""

    # Load environment variables
    load_dotenv()

    print("Testing database connection...")

    try:
        # Test connection
        with engine.connect() as conn:
            print("Database connection successful")

        # Create session
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()

        # Test queries
        customer_count = db.query(Customer).count()
        print(f"Found {customer_count} customers")

        # Get sample customer
        customer = db.query(Customer).first()
        if customer:
            print(f"Sample customer: {customer.name} (ID: {customer.customer_id})")

            # Get related data
            accounts = db.query(Account).filter(Account.customer_id == customer.customer_id).all()
            print(f"- Customer has {len(accounts)} accounts")

            transactions = db.query(Transaction).filter(Transaction.customer_id == customer.customer_id).all()
            print(f"- Customer has {len(transactions)} transactions")

            interactions = db.query(Interaction).filter(Interaction.customer_id == customer.customer_id).all()
            print(f"- Customer has {len(interactions)} interactions")

            opportunities = db.query(Opportunity).filter(Opportunity.customer_id == customer.customer_id).all()
            print(f"- Customer has {len(opportunities)} opportunities")

        db.close()
        print("\nAll database tests passed!")

    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

    return True

if __name__ == "__main__":
    test_database_connection()