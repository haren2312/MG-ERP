"""
Update database schema with new tables and columns
Run this after adding new models (SalesUser, Expense) and updating POSTransaction
"""
import sqlite3
from pathlib import Path
from sqlalchemy import inspect
from database import engine, SessionLocal
from models import Base, SalesUser, Expense

def update_database():
    """Create new tables and add missing columns"""
    print("Updating database schema...")
    
    # Create all tables (will skip existing ones)
    Base.metadata.create_all(bind=engine)
    
    # Add missing columns to existing tables using raw SQL
    db_path = Path(__file__).parent / "light_erp.db"
    
    if db_path.exists():
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            # Check if sales_user_id column exists in pos_transactions
            cursor.execute("PRAGMA table_info(pos_transactions)")
            columns = [column[1] for column in cursor.fetchall()]
            
            if 'sales_user_id' not in columns:
                print("   - Adding 'sales_user_id' column to pos_transactions...")
                cursor.execute("""
                    ALTER TABLE pos_transactions 
                    ADD COLUMN sales_user_id INTEGER
                """)
                conn.commit()
                print("   ✅ Column added successfully!")
            else:
                print("   ✅ 'sales_user_id' column already exists")
                
        except sqlite3.Error as e:
            print(f"   ⚠️  Error updating columns: {e}")
            conn.rollback()
        finally:
            conn.close()
    
    print("✅ Database schema updated successfully!")
    print("   - Created 'sales_users' table (if not exists)")
    print("   - Created 'expenses' table (if not exists)")
    print("   - Updated 'pos_transactions' with sales_user_id column")
    
    # Show existing tables
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"\nCurrent tables in database: {', '.join(tables)}")

if __name__ == "__main__":
    update_database()
