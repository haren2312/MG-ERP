"""
Complete database setup script (LEGACY - for backwards compatibility)
For new installations, use init_database.py + add_sample_data.py instead

This script combines:
- init_database.py: Creates tables and essential users
- add_sample_data.py: Adds dummy products

Run this on first setup for a complete demo environment
"""
from database import init_db, SessionLocal
from models import User, UserRole, SalesUser, InventoryItem
from auth import get_password_hash

def setup_database():
    """Initialize database with all tables, auth users, and sample data"""
    print("=" * 60)
    print("Light ERP - Complete Database Setup (with sample data)")
    print("=" * 60)
    print("💡 Tip: For production, use 'python init_database.py' instead")
    print("=" * 60)
    
    # Step 1: Create all tables
    print("\n[1/4] Creating database tables...")
    init_db()
    print("✅ All tables created successfully!")
    
    db = SessionLocal()
    
    try:
        # Step 2: Create authentication users
        print("\n[2/4] Setting up authentication users...")
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
        print("\n[3/4] Setting up sample sales users...")
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
        
        # Step 4: Create sample inventory
        print("\n[4/4] Setting up sample inventory...")
        inventory_items = [
            {
                "name": "Wireless Mouse",
                "sku": "MOUSE-001",
                "barcode": "1234567890123",
                "description": "Ergonomic wireless mouse with USB receiver",
                "category": "Electronics",
                "unit_price": 25.99,
                "cost_price": 15.00,
                "quantity": 50,
                "reorder_level": 10
            },
            {
                "name": "USB Keyboard",
                "sku": "KEYBOARD-001",
                "barcode": "1234567890124",
                "description": "Standard USB keyboard",
                "category": "Electronics",
                "unit_price": 35.99,
                "cost_price": 20.00,
                "quantity": 30,
                "reorder_level": 5
            },
            {
                "name": "Notebook A4",
                "sku": "NOTE-001",
                "barcode": "1234567890125",
                "description": "100-page ruled notebook",
                "category": "Stationery",
                "unit_price": 3.99,
                "cost_price": 1.50,
                "quantity": 200,
                "reorder_level": 50
            },
            {
                "name": "Blue Pen",
                "sku": "PEN-BLUE-001",
                "barcode": "1234567890126",
                "description": "Blue ballpoint pen",
                "category": "Stationery",
                "unit_price": 0.99,
                "cost_price": 0.30,
                "quantity": 500,
                "reorder_level": 100
            },
            {
                "name": "HDMI Cable 2m",
                "sku": "CABLE-HDMI-001",
                "barcode": "1234567890127",
                "description": "High-speed HDMI cable, 2 meters",
                "category": "Electronics",
                "unit_price": 12.99,
                "cost_price": 5.00,
                "quantity": 25,
                "reorder_level": 10
            }
        ]
        
        for item_data in inventory_items:
            existing = db.query(InventoryItem).filter(
                InventoryItem.sku == item_data["sku"]
            ).first()
            if not existing:
                item = InventoryItem(**item_data)
                db.add(item)
                print(f"  ✅ Created: {item_data['name']}")
            else:
                print(f"  ⏭️  Skipped: {item_data['name']} (already exists)")
        
        db.commit()
        
        # Success summary
        print("\n" + "=" * 60)
        print("✅ Database setup completed successfully!")
        print("=" * 60)
        print("\n📝 Authentication Users:")
        print("   • admin / admin123 (Super Admin) - Full access")
        print("   • manager / manager123 (Manager) - Manage inventory, expenses, reports")
        print("   • cashier / cashier123 (Cashier) - POS and dashboard only")
        print("\n👥 Sales Users:")
        print("   • John Smith (EMP001) - Senior Cashier")
        print("   • Sarah Johnson (EMP002) - Sales Associate")
        print("   • Mike Davis (EMP003) - Cashier")
        print("\n📦 Sample Inventory:")
        print("   • 5 sample products added")
        print("\n⚠️  IMPORTANT: Change default passwords in production!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error during setup: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    setup_database()
