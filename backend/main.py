from datetime import date, datetime
from decimal import Decimal
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from models import get_db, Customer

app = FastAPI(title="Branch Banker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def safe_float(value):
    if value is None:
        return None
    if isinstance(value, Decimal):
        return float(value)
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def format_date(value):
    if value is None:
        return None
    if isinstance(value, date):
        return value.strftime("%m/%d/%Y")
    return str(value)


def serialize_account(account):
    return {
        "account_id": account.account_id,
        "customer_id": account.customer_id,
        "type": account.account_type or account.account_category or "Unknown",
        "category": account.account_category,
        "balance": safe_float(account.balance),
        "interestRate": safe_float(account.interest_rate),
        "dateOpened": format_date(account.date_opened),
        "maturityDate": format_date(account.maturity_date),
        "lastActivityAmount": safe_float(account.last_activity_amount),
        "lastActivityDate": format_date(account.last_activity_date),
        "isJoint": account.is_joint,
        "jointCustomerId": account.joint_customer_id,
    }


def serialize_transaction(transaction):
    tx_type = (transaction.transaction_type or "").lower()
    if "income" in tx_type or "deposit" in tx_type:
        simple_type = "income"
    elif "payment" in tx_type or "withdraw" in tx_type or "expense" in tx_type:
        simple_type = "expense"
    else:
        simple_type = transaction.transaction_type or "transaction"

    return {
        "transaction_id": transaction.transaction_id,
        "account_id": transaction.account_id,
        "account_category": transaction.account_category,
        "account_type": transaction.account_type,
        "customer_id": transaction.customer_id,
        "description": transaction.description,
        "category": transaction.category,
        "type": simple_type,
        "transaction_type": transaction.transaction_type,
        "transaction_amt": safe_float(transaction.transaction_amt),
        "acct_balance": safe_float(transaction.acct_balance),
        "transaction_date": format_date(transaction.transaction_date),
        "transaction_made_by": transaction.transaction_made_by,
        "date": format_date(transaction.transaction_date),
        "amount": safe_float(transaction.transaction_amt),
    }


def serialize_goal(goal):
    amount = safe_float(goal.target_amount)
    current = safe_float(goal.starting_amount)
    return {
        "goal_id": goal.goal_id,
        "customer_id": goal.customer_id,
        "goal": goal.goal_name,
        "type": goal.goal_type,
        "isSavingsGoal": goal.goal_type and "savings" in goal.goal_type.lower(),
        "description": goal.goal_name,
        "startDate": format_date(goal.start_date),
        "date": format_date(goal.due_date),
        "linkedAccount": goal.linked_account,
        "targetAmount": amount,
        "currentAmount": current,
        "completed": bool(amount is not None and current is not None and amount <= current),
    }


def serialize_interaction(interaction):
    return {
        "interaction_id": interaction.interaction_id,
        "customer_id": interaction.customer_id,
        "interaction_date": format_date(interaction.interaction_date),
        "prep_notes": interaction.prep_notes,
        "track_expenses": interaction.track_expenses,
        "track_expenses_desc": interaction.track_expenses_desc,
        "borrow_money": interaction.borrow_money,
        "borrow_money_desc": interaction.borrow_money_desc,
        "save_retirement": interaction.save_retirement,
        "save_retirement_desc": interaction.save_retirement_desc,
        "income_srcs": interaction.income_srcs,
        "current_save": interaction.current_save,
        "typ_purchase": interaction.typ_purchase,
        "banker_notes": interaction.banker_notes,
        "pnc_notes": interaction.pnc_notes,
    }


def serialize_insights(insights):
    return {
        "customer_id": insights.customer_id,
        "summary": insights.summary,
        "category": insights.category,
        "opportunity_1_title": insights.opportunity_1_title,
        "opportunity_1_rationale": insights.opportunity_1_rationale,
        "opportunity_1_priority": insights.opportunity_1_priority,
        "opportunity_2_title": insights.opportunity_2_title,
        "opportunity_2_rationale": insights.opportunity_2_rationale,
        "opportunity_2_priority": insights.opportunity_2_priority,
        "opportunity_3_title": insights.opportunity_3_title,
        "opportunity_3_rationale": insights.opportunity_3_rationale,
        "opportunity_3_priority": insights.opportunity_3_priority,
    }

def serialize_appointment(appointment):
    if appointment.appointment_date is None:
        date_str = None
    elif isinstance(appointment.appointment_date, datetime):
        date_str = appointment.appointment_date.strftime("%Y-%m-%d %H:%M")
    else:
        date_str = str(appointment.appointment_date)
    return {
        "date": date_str,
        "title": appointment.title,
        "notes": appointment.notes,
        "type": appointment.type,

    }


def serialize_customer(customer):
    accounts = [serialize_account(account) for account in customer.accounts]
    transactions = [serialize_transaction(tx) for tx in customer.transactions]
    goals = [serialize_goal(goal) for goal in customer.goals]
    interactions = [serialize_interaction(interaction) for interaction in customer.interactions]
    appointments = [serialize_appointment(appointment) for appointment in customer.appointments]
    insights = [serialize_insights(insight) for insight in customer.insights]

    # Filter transactions by account type
    spend_transactions = [tx for tx in transactions if tx.get("account_type") == "Spend"]
    auto_loan_transactions = [tx for tx in transactions if tx.get("account_type") == "Auto Loan"]
    growth_transactions = [tx for tx in transactions if tx.get("account_type") == "Growth"]
    reserve_transactions = [tx for tx in transactions if tx.get("account_type") == "Reserve"]

    raw_transaction_dates = [
        tx.transaction_date if isinstance(tx.transaction_date, date) else tx.transaction_date.date()
        for tx in customer.transactions
        if tx.transaction_date
    ]
    raw_appointment_dates = [
        appt.appointment_date.date()
        for appt in customer.appointments
        if appt.appointment_date
    ]
    most_recent_dates = raw_transaction_dates + raw_appointment_dates
    last_visit = format_date(max(most_recent_dates)) if most_recent_dates else None

    def parse_list_field(value):
        if not value:
            return []
        return [item.strip() for item in str(value).split(",") if item.strip()]

    def parse_campaign_referrals(value):
        if not value:
            return []
        import re

        text = str(value).strip()
        if not text:
            return []

        entries = re.split(r"\s*,\s*(?=[^:]+:)", text)
        referrals = []
        for entry in entries:
            if ":" in entry:
                referral_type, description = entry.split(":", 1)
                referrals.append({
                    "type": referral_type.strip(),
                    "description": description.strip(),
                    "eligible": True,
                })
            else:
                referrals.append({
                    "type": entry.strip(),
                    "description": "",
                    "eligible": True,
                })
        return referrals

    def parse_relationships(value):
        if not value:
            return []
        items = []
        for entry in str(value).split(","):
            if ":" in entry:
                customer_id, relation = entry.split(":", 1)
                items.append({"id": customer_id.strip(), "relation": relation.strip()})
            else:
                items.append({"id": entry.strip(), "relation": ""})
        return items

    interaction_notes = []
    interaction_summary = []
    notes = None
    for interaction in interactions:
        summary_action = interaction.get("prep_notes") or interaction.get("banker_notes") or interaction.get("pnc_notes") or "Interaction recorded"
        interaction_summary.append({
            "type": "Client Interaction",
            "action": summary_action,
        })
        if interaction.get("banker_notes") or interaction.get("pnc_notes"):
            interaction_notes.append({
                "date": interaction.get("interaction_date"),
                "content": interaction.get("banker_notes") or interaction.get("pnc_notes"),
            })
        if notes is None:
            notes = interaction.get("pnc_notes") or interaction.get("banker_notes")

    recent_activity = []
    for tx in sorted(transactions, key=lambda item: item.get("transaction_date") or "", reverse=True)[:4]:
        recent_activity.append({
            "date": tx.get("transaction_date"),
            "type": tx.get("type"),
            "amount": tx.get("amount"),
        })

    today = date.today()
    relationship_items = parse_relationships(customer.relationships)
    opportunities = parse_list_field(customer.opportunities)

    if customer.account_created:
        years_with_bank = today.year - customer.account_created.year
        months_with_bank = today.month - customer.account_created.month
        if months_with_bank < 0:
            years_with_bank -= 1
            months_with_bank += 12
        time_with_bank = f"{years_with_bank} years, {months_with_bank} months"
    else:
        time_with_bank = None

    return {
        "id": customer.customer_id,
        "customer_id": customer.customer_id,
        "name": customer.full_name,
        "title": None,
        "age": customer.age,
        "employment": customer.employment,
        "maritalStatus": customer.marital_status,
        "hasDependents": customer.has_dependents,
        "housingStatus": customer.housing_status,
        "hasMortgage": customer.has_mortgage,
        "phoneNumber": customer.phone_num,
        "email": customer.email,
        "doNotCall": bool(customer.do_not_call) if customer.do_not_call is not None else False,
        "timeWithBank": time_with_bank,
        "location": ", ".join([part for part in [customer.city, customer.state] if part]).strip(", "),
        "totalAssets": safe_float(customer.total_assets),
        "totalLiabilities": safe_float(customer.total_liabilities),
        "netWorth": safe_float(customer.net_worth),
        "totalRewardsStatus": customer.total_rewards_status,
        "lastVisit": last_visit,
        "accounts": accounts,
        "campaignReferrals": parse_campaign_referrals(customer.campaign_referrals),
        "clientGoals": goals,
        "recentActivity": recent_activity,
        "relationships": relationship_items,
        "transactions": transactions,
        "spendTransactions": spend_transactions,
        "autoLoanTransactions": auto_loan_transactions,
        "growthTransactions": growth_transactions,
        "reserveTransactions": reserve_transactions,
        "clientSummary": customer.client_summary or "Customer data loaded from the database.",
        "opportunities": opportunities,  
        "interactions": interaction_summary,
        "notes": notes,
        "interactionNotes": interaction_notes,
        "appointments": appointments,
        "insights": insights,   
    }


@app.get("/api/clients")
def get_clients(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    return [serialize_customer(customer) for customer in customers]


@app.get("/api/clients/{customer_id}")
def get_client(customer_id: str, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Client not found")
    return serialize_customer(customer)

