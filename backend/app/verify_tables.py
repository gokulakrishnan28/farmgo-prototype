import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import inspect
from app.core.database import engine

def verify_tables():
    print("Checking database tables...")
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"\nFound tables in database: {tables}")
        
        required_tables = ["users", "farmer_profiles", "transporter_profiles"]
        missing_tables = [t for t in required_tables if t not in tables]
        
        if not missing_tables:
            print("\n[SUCCESS] All tables are successfully verified in your Supabase database!")
            for table in required_tables:
                columns = [c["name"] for c in inspector.get_columns(table)]
                print(f" - Table '{table}' columns: {columns}")
            return True
        else:
            print(f"\n[ERROR] Missing tables: {missing_tables}")
            return False
    except Exception as e:
        print(f"\n[ERROR] Verification failed: {e}")
        return False

if __name__ == "__main__":
    verify_tables()
