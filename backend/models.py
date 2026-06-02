from sqlalchemy import create_engine, Column, String, Date, Text, Numeric, DateTime, ForeignKey, Integer, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

Base = declarative_base()

class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(String(100), primary_key=True)
    full_name = Column(String(100))
    dob = Column(Date)
    age = Column(Integer)
    city = Column(Text)
    state = Column(Text)
    zip_code = Column(Text)
    country = Column(Text)
    employment = Column(Text)
    total_assets = Column(Numeric)
    total_liabilities = Column(Numeric)
    net_worth = Column(Numeric)
    estimated_income = Column(Text)
    consumer_segment = Column(Text)
    housing_status = Column(Text)
    marital_status = Column(Text)
    student = Column(Text)
    account_created = Column(Date)
    length_of_residence = Column(Text)
    has_dependents = Column(Text)
    number_of_adults = Column(Integer)
    company_employee = Column(Text)
    has_mortgage = Column(Text)
    phone_num = Column(Text)
    email = Column(Text)
    do_not_call = Column(Boolean)
    total_rewards_status = Column(Text)
    relationships = Column(Text)
    opportunities = Column(Text)
    client_summary = Column(Text)
    campaign_referrals = Column(Text)

    accounts = relationship("Account", back_populates="customer")
    appointments = relationship("Appointment", back_populates="customer")
    interactions = relationship("Interaction", back_populates="customer")
    goals = relationship("Goal", back_populates="customer")
    transactions = relationship("Transaction", back_populates="customer")

class Account(Base):
    __tablename__ = "accounts"

    account_id = Column(String(100), primary_key=True)
    customer_id = Column(String(100), ForeignKey("customers.customer_id"))
    is_joint = Column(String(10))
    joint_customer_id = Column(String(100))
    account_category = Column(String(100))
    account_type = Column(String(100))
    balance = Column(Numeric)
    date_opened = Column(Date)
    maturity_date = Column(Date)
    interest_rate = Column(Numeric)
    last_activity_amount = Column(Numeric)
    last_activity_date = Column(Date)

    customer = relationship("Customer", back_populates="accounts")

class Appointment(Base):
    __tablename__ = "appointments"

    appointment_id = Column(Integer, primary_key=True)
    customer_id = Column(String(100), ForeignKey("customers.customer_id"))
    appointment_date = Column(DateTime)
    type = Column(String(100))
    notes = Column(Text)

    customer = relationship("Customer", back_populates="appointments")

class Interaction(Base):
    __tablename__ = "interactions"

    interaction_id = Column(Integer, primary_key=True)
    customer_id = Column(String(100), ForeignKey("customers.customer_id"))
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

class Goal(Base):
    __tablename__ = "goals"

    goal_id = Column(Integer, primary_key=True)
    customer_id = Column(String(100), ForeignKey("customers.customer_id"))
    goal_name = Column(Text, nullable=False)
    goal_type = Column(Text, nullable=False)
    linked_account = Column(String(100))
    target_amount = Column(Numeric(12, 2))
    starting_amount = Column(Numeric(12, 2))
    due_date = Column(Date)

    customer = relationship("Customer", back_populates="goals")

class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True)
    account_id = Column(String(100))
    account_category = Column(String(100))
    account_type = Column(String(100))
    customer_id = Column(String(100), ForeignKey("customers.customer_id"))
    description = Column(Text)
    category = Column(Text)
    transaction_type = Column(String(100))
    transaction_amt = Column(Numeric)
    acct_balance = Column(Numeric)
    transaction_date = Column(Date)
    transaction_made_by = Column(String(100))

    customer = relationship("Customer", back_populates="transactions")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://ilb3010tdpteam1postgresserver.postgres.database.azure.com:5432/postgres?sslmode=require")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()