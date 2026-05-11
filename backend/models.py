from sqlalchemy import create_engine, Column, String, Date, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from typing import Optional
from datetime import date, datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

Base = declarative_base()

class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(String(20), primary_key=True)
    name = Column(String(100))
    dob = Column(Date)
    address = Column(Text)
    zip_code = Column(String(10))
    phone_number = Column(String(50))
    email = Column(String(100))
    date_joined = Column(Date)
    segment = Column(String(50))
    preferred_language = Column(String(20))
    relationship_status = Column(String(20))

    # Relationships
    accounts = relationship("Account", back_populates="customer")
    interactions = relationship("Interaction", back_populates="customer")
    opportunities = relationship("Opportunity", back_populates="customer")
    transactions = relationship("Transaction", back_populates="customer")

class Account(Base):
    __tablename__ = "accounts"

    account_id = Column(String(20), primary_key=True)
    customer_id = Column(String(20), ForeignKey("customers.customer_id"))
    account_type = Column(String(50))
    account_status = Column(String(20))
    balance = Column(Numeric(15, 2))
    interest_rate = Column(Numeric(5, 4))
    opened_date = Column(DateTime)
    last_activity_date = Column(DateTime)

    # Relationships
    customer = relationship("Customer", back_populates="accounts")
    products = relationship("Product", back_populates="account")

class Product(Base):
    __tablename__ = "products"

    product_id = Column(String, primary_key=True)
    product_name = Column(String)
    product_type = Column(String)
    fee_structure = Column(String)
    eligibility_rules = Column(Text)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    account_id = Column(String, ForeignKey("accounts.account_id"))

    # Relationships
    account = relationship("Account", back_populates="products")

class Interaction(Base):
    __tablename__ = "interactions"

    interaction_id = Column(String(20), primary_key=True)
    customer_id = Column(String(20), ForeignKey("customers.customer_id"))
    channel = Column(String(20))
    banker_id = Column(String(20))
    interaction_date = Column(DateTime)
    interaction_reason = Column(String(50))
    outcome = Column(String(20))
    notes = Column(Text)

    # Relationships
    customer = relationship("Customer", back_populates="interactions")

class Opportunity(Base):
    __tablename__ = "opportunities"

    insight_id = Column(String(20), primary_key=True)
    customer_id = Column(String(20), ForeignKey("customers.customer_id"))
    insight_type = Column(String(50))
    confidence_score = Column(Numeric(3, 2))
    insight_summary = Column(Text)
    generated_date = Column(DateTime)

    # Relationships
    customer = relationship("Customer", back_populates="opportunities")

class Transaction(Base):
    __tablename__ = "transactions"

    activity_id = Column(String(20), primary_key=True)
    customer_id = Column(String(20), ForeignKey("customers.customer_id"))
    activity_type = Column(String(50))
    activity_date = Column(DateTime)
    description = Column(Text)
    severity = Column(String(10))

    # Relationships
    customer = relationship("Customer", back_populates="transactions")

# Database connection - using environment variables for security
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://ilb3010tdpteam1postgresserver.postgres.database.azure.com:5432/postgres?sslmode=require")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()