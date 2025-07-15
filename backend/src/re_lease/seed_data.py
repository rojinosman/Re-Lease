import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models.users import User
from .models.listings import Listing
from .deps import bcrypt_context

def seed_database():
    """Seed the database with sample data"""
    db = SessionLocal()
    
    try:
        # Check if we already have data
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("Database already has data, skipping seed...")
            return
        

        

        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database() 