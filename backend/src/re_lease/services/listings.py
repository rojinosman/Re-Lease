import json
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc
from ..models.listings import Listing, Message
from ..models.users import User
from ..schemas.listings import ListingCreate, ListingUpdate, MessageCreate

def create_listing(db: Session, listing_data: ListingCreate, user_id: int) -> Listing:
    """Create a new listing"""
    db_listing = Listing(
        title=listing_data.title,
        description=listing_data.description,
        price=listing_data.price,
        location=listing_data.location,
        bedrooms=listing_data.bedrooms,
        bathrooms=listing_data.bathrooms,
        available_from=listing_data.available_from,
        amenities=json.dumps(listing_data.amenities) if listing_data.amenities else None,
        images=json.dumps(listing_data.images) if listing_data.images else None,
        user_id=user_id
    )
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    return db_listing

def get_listings(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    location: Optional[str] = None,
    bedrooms: Optional[int] = None
) -> List[Listing]:
    """Get listings with optional filters"""
    query = db.query(Listing).filter(Listing.status == 'active')
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Listing.title.ilike(search_term),
                Listing.description.ilike(search_term),
                Listing.location.ilike(search_term)
            )
        )
    
    if min_price is not None:
        query = query.filter(Listing.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Listing.price <= max_price)
    
    if location and location != "Any location":
        query = query.filter(Listing.location == location)
    
    if bedrooms is not None:
        query = query.filter(Listing.bedrooms == bedrooms)
    
    return query.offset(skip).limit(limit).all()

def get_listing_by_id(db: Session, listing_id: int) -> Optional[Listing]:
    """Get a specific listing by ID"""
    return db.query(Listing).filter(Listing.id == listing_id).first()

def get_user_listings(db: Session, user_id: int) -> List[Listing]:
    """Get all listings created by a specific user"""
    return db.query(Listing).filter(Listing.user_id == user_id).order_by(desc(Listing.created_at)).all()

def update_listing(db: Session, listing_id: int, listing_data: ListingUpdate, user_id: int) -> Optional[Listing]:
    """Update a listing"""
    db_listing = db.query(Listing).filter(
        and_(Listing.id == listing_id, Listing.user_id == user_id)
    ).first()
    
    if not db_listing:
        return None
    
    update_data = listing_data.dict(exclude_unset=True)
    
    # Handle JSON fields
    if 'amenities' in update_data:
        update_data['amenities'] = json.dumps(update_data['amenities'])
    if 'images' in update_data:
        update_data['images'] = json.dumps(update_data['images'])
    
    for field, value in update_data.items():
        setattr(db_listing, field, value)
    
    db.commit()
    db.refresh(db_listing)
    return db_listing

def delete_listing(db: Session, listing_id: int, user_id: int) -> bool:
    """Delete a listing"""
    db_listing = db.query(Listing).filter(
        and_(Listing.id == listing_id, Listing.user_id == user_id)
    ).first()
    
    if not db_listing:
        return False
    
    db.delete(db_listing)
    db.commit()
    return True

def increment_listing_views(db: Session, listing_id: int):
    """Increment the view count for a listing"""
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if db_listing:
        db_listing.views += 1
        db.commit()

def increment_listing_interested(db: Session, listing_id: int):
    """Increment the interested count for a listing"""
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if db_listing:
        db_listing.interested += 1
        db.commit()

# Message functions
def create_message(db: Session, message_data: MessageCreate, sender_id: int) -> Message:
    """Create a new message"""
    db_message = Message(
        text=message_data.text,
        sender_id=sender_id,
        receiver_id=message_data.receiver_id,
        listing_id=message_data.listing_id
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_conversation_messages(db: Session, user1_id: int, user2_id: int, listing_id: int) -> List[Message]:
    """Get messages between two users for a specific listing"""
    return db.query(Message).options(
        joinedload(Message.sender),
        joinedload(Message.receiver)
    ).filter(
        and_(
            Message.listing_id == listing_id,
            or_(
                and_(Message.sender_id == user1_id, Message.receiver_id == user2_id),
                and_(Message.sender_id == user2_id, Message.receiver_id == user1_id)
            )
        )
    ).order_by(Message.created_at).all()

def get_user_conversations(db: Session, user_id: int) -> List[dict]:
    """Get all conversations for a user"""
    # Get all messages where user is sender or receiver
    messages = db.query(Message).filter(
        or_(Message.sender_id == user_id, Message.receiver_id == user_id)
    ).order_by(desc(Message.created_at)).all()
    
    conversations = {}
    
    for message in messages:
        # Determine the other user in the conversation
        other_user_id = message.receiver_id if message.sender_id == user_id else message.sender_id
        
        # Create a unique conversation key
        conv_key = f"{min(user_id, other_user_id)}_{max(user_id, other_user_id)}_{message.listing_id}"
        
        if conv_key not in conversations:
            # Get the other user's info
            other_user = db.query(User).filter(User.id == other_user_id).first()
            listing = db.query(Listing).filter(Listing.id == message.listing_id).first()
            
            conversations[conv_key] = {
                'other_user_id': other_user_id,
                'other_user_name': other_user.username if other_user else "Unknown",
                'listing_id': message.listing_id,
                'listing_title': listing.title if listing else "Unknown Listing",
                'last_message': message.text,
                'last_message_time': message.created_at,
                'unread_count': 0
            }
        else:
            # Update with more recent message if this one is newer
            if message.created_at > conversations[conv_key]['last_message_time']:
                conversations[conv_key]['last_message'] = message.text
                conversations[conv_key]['last_message_time'] = message.created_at
    
    # Count unread messages
    for conv_key, conv in conversations.items():
        unread_count = db.query(Message).filter(
            and_(
                Message.receiver_id == user_id,
                Message.sender_id == conv['other_user_id'],
                Message.listing_id == conv['listing_id'],
                Message.is_read == False
            )
        ).count()
        conv['unread_count'] = unread_count
    
    return list(conversations.values())

def mark_messages_as_read(db: Session, sender_id: int, receiver_id: int, listing_id: int):
    """Mark messages as read"""
    db.query(Message).filter(
        and_(
            Message.sender_id == sender_id,
            Message.receiver_id == receiver_id,
            Message.listing_id == listing_id,
            Message.is_read == False
        )
    ).update({"is_read": True})
    db.commit() 