import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import text
from app.core.database import engine

def test_connection():
    print("Testing connection to database...")
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version();"))
            row = result.fetchone()
            print("\n[SUCCESS] Connection established!")
            print(f"PostgreSQL version: {row[0]}")
            return True
    except Exception as e:
        print("\n[ERROR] Connection failed!")
        print(f"Details: {e}")
        return False

if __name__ == "__main__":
    test_connection()
