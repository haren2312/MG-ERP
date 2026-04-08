"""
SQLite Database Models for Light Module
Includes ledger records, inventory items, POS transactions, and users
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()


class UserRole(str, enum.Enum):
    CASHIER = "cashier"
    MANAGER = "manager"
    SUPER_ADMIN = "super_admin"


class TransactionType(str, enum.Enum):
    SALE = "sale"
    PURCHASE = "purchase"
    RETURN = "return"
    ADJUSTMENT = "adjustment"


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    CARD = "card"
    BANK_TRANSFER = "bank_transfer"
    OTHER = "other"


class ExpenseCategory(str, enum.Enum):
    RENT = "rent"
    UTILITIES = "utilities"
    SALARIES = "salaries"
    SUPPLIES = "supplies"
    MAINTENANCE = "maintenance"
    MARKETING = "marketing"
    TRANSPORTATION = "transportation"
    OTHER = "other"


class LedgerRecord(Base):
    """Main ledger table - records all financial transactions"""
    __tablename__ = "ledger_records"

    id = Column(Integer, primary_key=True, index=True)
    transaction_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    description = Column(Text, nullable=False)
    amount = Column(Float, nullable=False)
    balance = Column(Float, nullable=False)
    reference_id = Column(String(100), nullable=True)  # Reference to POS or inventory transaction
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.CASH)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class InventoryItem(Base):
    """Inventory items table"""
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    barcode = Column(String(100), unique=True, nullable=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    unit_price = Column(Float, nullable=False)
    cost_price = Column(Float, nullable=False)
    quantity = Column(Integer, default=0, nullable=False)
    reorder_level = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to POS items
    pos_items = relationship("POSItem", back_populates="inventory_item")


class POSTransaction(Base):
    """POS transactions table"""
    __tablename__ = "pos_transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_number = Column(String(50), unique=True, nullable=False, index=True)
    transaction_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    customer_name = Column(String(200), nullable=True)
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.CASH)
    payment_received = Column(Float, nullable=False)
    change_returned = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    sales_user_id = Column(Integer, ForeignKey("sales_users.id"), nullable=True)
    ledger_id = Column(Integer, ForeignKey("ledger_records.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    items = relationship("POSItem", back_populates="transaction", cascade="all, delete-orphan")
    sales_user = relationship("SalesUser", back_populates="transactions")


class POSItem(Base):
    """Individual items in a POS transaction"""
    __tablename__ = "pos_items"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("pos_transactions.id"), nullable=False)
    inventory_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=False)
    product_name = Column(String(200), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    transaction = relationship("POSTransaction", back_populates="items")
    inventory_item = relationship("InventoryItem", back_populates="pos_items")


class Refund(Base):
    """Records refunds issued against POS transactions"""
    __tablename__ = "refunds"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("pos_transactions.id"), nullable=False)
    amount = Column(Float, nullable=False)
    refund_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    reason = Column(Text, nullable=True)
    restocked = Column(Boolean, default=False)
    processed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    ledger_id = Column(Integer, ForeignKey("ledger_records.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    transaction = relationship("POSTransaction")
    processed_user = relationship("User")
    items = relationship("RefundItem", back_populates="refund", cascade="all, delete-orphan")


class RefundItem(Base):
    """Line-item details for each refund event"""
    __tablename__ = "refund_items"

    id = Column(Integer, primary_key=True, index=True)
    refund_id = Column(Integer, ForeignKey("refunds.id"), nullable=False)
    transaction_id = Column(Integer, ForeignKey("pos_transactions.id"), nullable=False)
    pos_item_id = Column(Integer, ForeignKey("pos_items.id"), nullable=False)
    inventory_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=False)
    refunded_quantity = Column(Integer, nullable=False)
    refunded_amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    refund = relationship("Refund", back_populates="items")
    transaction = relationship("POSTransaction")
    pos_item = relationship("POSItem")
    inventory_item = relationship("InventoryItem")


class User(Base):
    """User authentication and authorization"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.CASHIER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)


class Expense(Base):
    """Expense tracking table"""
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    expense_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    category = Column(Enum(ExpenseCategory), nullable=False)
    description = Column(Text, nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.CASH)
    vendor = Column(String(200), nullable=True)
    receipt_number = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    recorded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    ledger_id = Column(Integer, ForeignKey("ledger_records.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SalesUser(Base):
    """Sales staff/cashier users for POS transactions"""
    __tablename__ = "sales_users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    employee_code = Column(String(50), unique=True, nullable=True, index=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(100), nullable=True)
    position = Column(String(100), nullable=True)  # e.g., Cashier, Sales Associate
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to POS transactions
    transactions = relationship("POSTransaction", back_populates="sales_user")
