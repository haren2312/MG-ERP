"""
Initialize database with default admin user
"""
from sqlalchemy.orm import Session
from models import User, UserRole, Base
from auth import get_password_hash
from database import engine, SessionLocal


def init_database():
    """Create all tables and add default users"""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    db = SessionLocal()
    
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            # Create default super admin
            admin = User(
                username="admin",
                email="admin@lighterp.local",
                hashed_password=get_password_hash("admin123"),  # Change this!
                full_name="System Administrator",
                role=UserRole.SUPER_ADMIN,
                is_active=True
            )
            db.add(admin)
            print("✅ Created default admin user: admin / admin123")
        
        # Check if manager exists
        manager = db.query(User).filter(User.username == "manager").first()
        if not manager:
            # Create default manager
            manager = User(
                username="manager",
                email="manager@lighterp.local",
                hashed_password=get_password_hash("manager123"),
                full_name="Store Manager",
                role=UserRole.MANAGER,
                is_active=True
            )
            db.add(manager)
            print("✅ Created default manager user: manager / manager123")
        
        # Check if cashier exists
        cashier = db.query(User).filter(User.username == "cashier").first()
        if not cashier:
            # Create default cashier
            cashier = User(
                username="cashier",
                email="cashier@lighterp.local",
                hashed_password=get_password_hash("cashier123"),
                full_name="Store Cashier",
                role=UserRole.CASHIER,
                is_active=True
            )
            db.add(cashier)
            print("✅ Created default cashier user: cashier / cashier123")
        
        db.commit()
        print("\n✅ Database initialized successfully!")
        print("\nDefault Users:")
        print("  - admin / admin123 (Super Admin)")
        print("  - manager / manager123 (Manager)")
        print("  - cashier / cashier123 (Cashier)")
        print("\n⚠️  Please change these passwords in production!")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_database()
