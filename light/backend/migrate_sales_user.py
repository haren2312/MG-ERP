"""
Migration script to add sales_user_id column to pos_transactions table
Run this if you get "no such column: pos_transactions.sales_user_id" error
"""
import sqlite3
from pathlib import Path

def migrate_database():
    """Add sales_user_id column to pos_transactions table"""
    db_path = Path(__file__).parent / "light_erp.db"
    
    if not db_path.exists():
        print("❌ Database file not found. Run setup_database.py first.")
        return
    
    print("=" * 60)
    print("Database Migration - Adding sales_user_id column")
    print("=" * 60)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if column already exists
        cursor.execute("PRAGMA table_info(pos_transactions)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'sales_user_id' in columns:
            print("✅ Column 'sales_user_id' already exists. No migration needed.")
        else:
            print("\n[1/1] Adding 'sales_user_id' column to pos_transactions table...")
            cursor.execute("""
                ALTER TABLE pos_transactions 
                ADD COLUMN sales_user_id INTEGER
            """)
            conn.commit()
            print("✅ Column added successfully!")
        
        print("\n" + "=" * 60)
        print("✅ Migration completed successfully!")
        print("=" * 60)
        
    except sqlite3.Error as e:
        print(f"\n❌ Migration failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
