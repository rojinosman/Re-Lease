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
        
        # Create sample users
        users_data = [
            {
                "username": "sarah_j",
                "email": "sarah.j@email.com",
                "password": "password123",
                "bio": "UC Berkeley student looking for roommates"
            },
            {
                "username": "mike_r",
                "email": "mike.r@email.com", 
                "password": "password123",
                "bio": "NYU student with a room to sublet"
            },
            {
                "username": "alex_k",
                "email": "alex.k@email.com",
                "password": "password123",
                "bio": "UCLA student with modern apartment"
            },
            {
                "username": "emma_w",
                "email": "emma.w@email.com",
                "password": "password123",
                "bio": "Downtown luxury apartment owner"
            },
            {
                "username": "john_d",
                "email": "john.d@email.com",
                "password": "password123",
                "bio": "Budget-friendly housing provider"
            }
        ]
        
        created_users = []
        for user_data in users_data:
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                password_hash=bcrypt_context.hash(user_data["password"]),
                bio=user_data["bio"]
            )
            db.add(user)
            created_users.append(user)
        
        db.commit()
        
        # Create sample listings
        listings_data = [
            {
                "title": "Cozy Studio Near Campus",
                "description": "Perfect for students! Walking distance to campus with all utilities included.",
                "price": 800.0,
                "location": "University District",
                "bedrooms": 1,
                "bathrooms": 1.0,
                "available_from": datetime.now() + timedelta(days=30),
                "amenities": ["WiFi", "Parking", "Kitchen"],
                "images": ["/placeholder.svg?height=400&width=300"],
                "user_id": 1
            },
            {
                "title": "Shared House Room",
                "description": "Room in a 4-bedroom house with friendly roommates. Great location!",
                "price": 600.0,
                "location": "Downtown",
                "bedrooms": 1,
                "bathrooms": 2.0,
                "available_from": datetime.now() + timedelta(days=45),
                "amenities": ["WiFi", "Kitchen", "Laundry"],
                "images": ["/placeholder.svg?height=400&width=300"],
                "user_id": 2
            },
            {
                "title": "Modern Apartment",
                "description": "Newly renovated apartment with modern amenities and great views.",
                "price": 1200.0,
                "location": "Midtown",
                "bedrooms": 2,
                "bathrooms": 1.0,
                "available_from": datetime.now() + timedelta(days=60),
                "amenities": ["WiFi", "Parking", "Kitchen", "Gym"],
                "images": ["/placeholder.svg?height=400&width=300"],
                "user_id": 3
            },
            {
                "title": "Luxury Studio Downtown",
                "description": "High-end studio with premium amenities and city views.",
                "price": 1500.0,
                "location": "Downtown",
                "bedrooms": 1,
                "bathrooms": 1.0,
                "available_from": datetime.now() + timedelta(days=90),
                "amenities": ["WiFi", "Parking", "Kitchen", "Gym", "Pool"],
                "images": ["/placeholder.svg?height=400&width=300"],
                "user_id": 4
            },
            {
                "title": "Budget-Friendly Room",
                "description": "Affordable option for students on a budget. Clean and safe.",
                "price": 450.0,
                "location": "University District",
                "bedrooms": 1,
                "bathrooms": 1.0,
                "available_from": datetime.now() + timedelta(days=15),
                "amenities": ["WiFi", "Kitchen"],
                "images": ["/placeholder.svg?height=400&width=300"],
                "user_id": 5
            },
            {
                "title": "Spacious 3BR House",
                "description": "Perfect for group of friends. Large house with backyard.",
                "price": 2000.0,
                "location": "Suburbs",
                "bedrooms": 3,
                "bathrooms": 2.0,
                "available_from": datetime.now() + timedelta(days=120),
                "amenities": ["WiFi", "Parking", "Kitchen", "Laundry", "Yard"],
                "images": ["/placeholder.svg?height=400&width=300"],
                "user_id": 1
            }
        ]
        
        for listing_data in listings_data:
            listing = Listing(
                title=listing_data["title"],
                description=listing_data["description"],
                price=listing_data["price"],
                location=listing_data["location"],
                bedrooms=listing_data["bedrooms"],
                bathrooms=listing_data["bathrooms"],
                available_from=listing_data["available_from"],
                amenities=json.dumps(listing_data["amenities"]),
                images=json.dumps(listing_data["images"]),
                user_id=listing_data["user_id"],
                status="active",
                views=0,
                interested=0
            )
            db.add(listing)
        
        db.commit()
        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database() 