"""
Initialize database with essential structure and users
Run this on first setup - creates tables, auth users, and sales users only
"""
from database import init_db, SessionLocal
from models import User, UserRole, SalesUser
from auth import get_password_hash

def initialize_database():
    """Initialize database with tables and essential users (no sample products)"""
    print("=" * 60)
    print("Light ERP - Database Initialization")
    print("=" * 60)
    
    # Step 1: Create all tables
    print("\n[1/3] Creating database tables...")
    init_db()
    print("✅ All tables created successfully!")
    
    db = SessionLocal()
    
    try:
        # Step 2: Create authentication users
        print("\n[2/3] Setting up authentication users...")
        auth_users = [
            {
                "username": "admin",
                "email": "admin@lighterp.local",
                "password": "admin123",
                "full_name": "System Administrator",
                "role": UserRole.SUPER_ADMIN
            },
            {
                "username": "manager",
                "email": "manager@lighterp.local",
                "password": "manager123",
                "full_name": "Store Manager",
                "role": UserRole.MANAGER
            },
            {
                "username": "cashier",
                "email": "cashier@lighterp.local",
                "password": "cashier123",
                "full_name": "Store Cashier",
                "role": UserRole.CASHIER
            }
        ]
        
        for user_data in auth_users:
            existing = db.query(User).filter(User.username == user_data["username"]).first()
            if not existing:
                user = User(
                    username=user_data["username"],
                    email=user_data["email"],
                    hashed_password=get_password_hash(user_data["password"]),
                    full_name=user_data["full_name"],
                    role=user_data["role"],
                    is_active=True
                )
                db.add(user)
                print(f"  ✅ Created: {user_data['username']} / {user_data['password']}")
            else:
                print(f"  ⏭️  Skipped: {user_data['username']} (already exists)")
        
        db.commit()
        
        # Step 3: Create sample sales users
        print("\n[3/3] Setting up sample sales users...")
        sales_users = [
            {
                "name": "John Smith",
                "employee_code": "EMP001",
                "position": "Senior Cashier",
                "phone": "+1-555-0101",
                "email": "john.smith@example.com",
                "is_active": True
            },
            {
                "name": "Sarah Johnson",
                "employee_code": "EMP002",
                "position": "Sales Associate",
                "phone": "+1-555-0102",
                "email": "sarah.johnson@example.com",
                "is_active": True
            },
            {
                "name": "Mike Davis",
                "employee_code": "EMP003",
                "position": "Cashier",
                "phone": "+1-555-0103",
                "email": "mike.davis@example.com",
                "is_active": True
            }
        ]
        
        for user_data in sales_users:
            existing = db.query(SalesUser).filter(
                SalesUser.employee_code == user_data["employee_code"]
            ).first()
            if not existing:
                user = SalesUser(**user_data)
                db.add(user)
                print(f"  ✅ Created: {user_data['name']} ({user_data['employee_code']})")
            else:
                print(f"  ⏭️  Skipped: {user_data['name']} (already exists)")
        
        db.commit()
        
        # Success summary
        print("\n" + "=" * 60)
        print("✅ Database initialization completed successfully!")
        print("=" * 60)
        print("\n📝 Authentication Users:")
        print("   • admin / admin123 (Super Admin) - Full access")
        print("   • manager / manager123 (Manager) - Manage inventory, expenses, reports")
        print("   • cashier / cashier123 (Cashier) - POS and dashboard only")
        print("\n👥 Sales Users:")
        print("   • John Smith (EMP001) - Senior Cashier")
        print("   • Sarah Johnson (EMP002) - Sales Associate")
        print("   • Mike Davis (EMP003) - Cashier")
        print("\n💡 Next Steps:")
        print("   • Run 'python add_sample_data.py' to add dummy products")
        print("   • Or add your own products through the web interface")
        print("\n⚠️  IMPORTANT: Change default passwords in production!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error during initialization: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    initialize_database()
