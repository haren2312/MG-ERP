"""
Add sample/dummy data to the database
Run this after init_database.py to populate with test products
"""
from database import SessionLocal
from models import InventoryItem

def add_sample_data():
    """Add sample inventory items for testing"""
    print("=" * 60)
    print("Light ERP - Add Sample Data")
    print("=" * 60)
    
    db = SessionLocal()
    
    try:
        print("\n[1/1] Adding sample inventory items...")
        
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
        
        items_added = 0
        items_skipped = 0
        
        for item_data in inventory_items:
            existing = db.query(InventoryItem).filter(
                InventoryItem.sku == item_data["sku"]
            ).first()
            if not existing:
                item = InventoryItem(**item_data)
                db.add(item)
                print(f"  ✅ Added: {item_data['name']} (${item_data['unit_price']}) - Stock: {item_data['quantity']}")
                items_added += 1
            else:
                print(f"  ⏭️  Skipped: {item_data['name']} (already exists)")
                items_skipped += 1
        
        db.commit()
        
        # Success summary
        print("\n" + "=" * 60)
        print("✅ Sample data added successfully!")
        print("=" * 60)
        print(f"\n📦 Summary:")
        print(f"   • {items_added} products added")
        print(f"   • {items_skipped} products skipped (already exist)")
        print("\n💡 You can now:")
        print("   • Start the backend: python main.py")
        print("   • Login with: admin/admin123 or manager/manager123")
        print("   • View products in the Inventory page")
        print("   • Make test sales in the POS page")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error adding sample data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_data()
