from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from ..deps import db_dependency, user_dependency
from ..models.users import User
from ..schemas.listings import (
    ListingCreate, 
    ListingUpdate, 
    ListingResponse, 
    MessageCreate, 
    MessageResponse,
    ConversationResponse
)
from ..services.listings import (
    create_listing,
    get_listings,
    get_listing_by_id,
    get_user_listings,
    update_listing,
    delete_listing,
    increment_listing_views,
    increment_listing_interested,
    create_message,
    get_conversation_messages,
    get_user_conversations,
    mark_messages_as_read
)
import json

router = APIRouter(
    prefix='/listings',
    tags=['listings']
)

@router.post("/", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
async def create_new_listing(
    listing_data: ListingCreate,
    db: db_dependency,
    current_user: user_dependency
):
    """Create a new listing"""
    db_listing = create_listing(db, listing_data, current_user.id)
    
    # Convert JSON fields back to lists for response
    amenities = json.loads(db_listing.amenities) if db_listing.amenities else []
    images = json.loads(db_listing.images) if db_listing.images else []
    
    return ListingResponse(
        id=db_listing.id,
        title=db_listing.title,
        description=db_listing.description,
        price=db_listing.price,
        location=db_listing.location,
        bedrooms=db_listing.bedrooms,
        bathrooms=db_listing.bathrooms,
        available_from=db_listing.available_from,
        amenities=amenities,
        images=images,
        status=db_listing.status,
        views=db_listing.views,
        interested=db_listing.interested,
        created_at=db_listing.created_at,
        updated_at=db_listing.updated_at,
        user_id=db_listing.user_id,
        user_username=current_user.username
    )

@router.get("/", response_model=List[ListingResponse])
async def get_all_listings(
    db: db_dependency,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    location: Optional[str] = Query(None),
    bedrooms: Optional[int] = Query(None, ge=1)
):
    """Get all listings with optional filters"""
    db_listings = get_listings(
        db, skip=skip, limit=limit, search=search,
        min_price=min_price, max_price=max_price,
        location=location, bedrooms=bedrooms
    )
    
    listings_response = []
    for listing in db_listings:
        amenities = json.loads(listing.amenities) if listing.amenities else []
        images = json.loads(listing.images) if listing.images else []
        
        listings_response.append(ListingResponse(
            id=listing.id,
            title=listing.title,
            description=listing.description,
            price=listing.price,
            location=listing.location,
            bedrooms=listing.bedrooms,
            bathrooms=listing.bathrooms,
            available_from=listing.available_from,
            amenities=amenities,
            images=images,
            status=listing.status,
            views=listing.views,
            interested=listing.interested,
            created_at=listing.created_at,
            updated_at=listing.updated_at,
            user_id=listing.user_id,
            user_username=listing.user.username
        ))
    
    return listings_response

@router.get("/liked", response_model=List[ListingResponse])
async def get_liked_listings(
    db: db_dependency,
    current_user: user_dependency
):
    user = db.query(User).filter(User.id == current_user.id).first()
    listings_response = []
    for listing in user.liked_listings:
        amenities = json.loads(listing.amenities) if listing.amenities else []
        images = json.loads(listing.images) if listing.images else []
        listings_response.append(ListingResponse(
            id=listing.id,
            title=listing.title,
            description=listing.description,
            price=listing.price,
            location=listing.location,
            bedrooms=listing.bedrooms,
            bathrooms=listing.bathrooms,
            available_from=listing.available_from,
            amenities=amenities,
            images=images,
            status=listing.status,
            views=listing.views,
            interested=listing.interested,
            created_at=listing.created_at,
            updated_at=listing.updated_at,
            user_id=listing.user_id,
            user_username=listing.user.username
        ))
    return listings_response


@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(
    listing_id: int,
    db: db_dependency,
    current_user: user_dependency
):
    """Get a specific listing by ID"""
    db_listing = get_listing_by_id(db, listing_id)
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Increment view count
    increment_listing_views(db, listing_id)
    
    amenities = json.loads(db_listing.amenities) if db_listing.amenities else []
    images = json.loads(db_listing.images) if db_listing.images else []
    
    return ListingResponse(
        id=db_listing.id,
        title=db_listing.title,
        description=db_listing.description,
        price=db_listing.price,
        location=db_listing.location,
        bedrooms=db_listing.bedrooms,
        bathrooms=db_listing.bathrooms,
        available_from=db_listing.available_from,
        amenities=amenities,
        images=images,
        status=db_listing.status,
        views=db_listing.views,
        interested=db_listing.interested,
        created_at=db_listing.created_at,
        updated_at=db_listing.updated_at,
        user_id=db_listing.user_id,
        user_username=db_listing.user.username
    )

@router.get("/my/listings", response_model=List[ListingResponse])
async def get_my_listings(
    db: db_dependency,
    current_user: user_dependency
):
    """Get all listings created by the current user"""
    db_listings = get_user_listings(db, current_user.id)
    
    listings_response = []
    for listing in db_listings:
        amenities = json.loads(listing.amenities) if listing.amenities else []
        images = json.loads(listing.images) if listing.images else []
        
        listings_response.append(ListingResponse(
            id=listing.id,
            title=listing.title,
            description=listing.description,
            price=listing.price,
            location=listing.location,
            bedrooms=listing.bedrooms,
            bathrooms=listing.bathrooms,
            available_from=listing.available_from,
            amenities=amenities,
            images=images,
            status=listing.status,
            views=listing.views,
            interested=listing.interested,
            created_at=listing.created_at,
            updated_at=listing.updated_at,
            user_id=listing.user_id,
            user_username=current_user.username
        ))
    
    return listings_response

@router.put("/{listing_id}", response_model=ListingResponse)
async def update_listing_by_id(
    listing_id: int,
    listing_data: ListingUpdate,
    db: db_dependency,
    current_user: user_dependency
):
    """Update a listing"""
    db_listing = update_listing(db, listing_id, listing_data, current_user.id)
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found or not authorized")
    
    amenities = json.loads(db_listing.amenities) if db_listing.amenities else []
    images = json.loads(db_listing.images) if db_listing.images else []
    
    return ListingResponse(
        id=db_listing.id,
        title=db_listing.title,
        description=db_listing.description,
        price=db_listing.price,
        location=db_listing.location,
        bedrooms=db_listing.bedrooms,
        bathrooms=db_listing.bathrooms,
        available_from=db_listing.available_from,
        amenities=amenities,
        images=images,
        status=db_listing.status,
        views=db_listing.views,
        interested=db_listing.interested,
        created_at=db_listing.created_at,
        updated_at=db_listing.updated_at,
        user_id=db_listing.user_id,
        user_username=current_user.username
    )

@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_listing_by_id(
    listing_id: int,
    db: db_dependency,
    current_user: user_dependency
):
    """Delete a listing"""
    success = delete_listing(db, listing_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Listing not found or not authorized")

@router.post("/{listing_id}/interested", status_code=status.HTTP_200_OK)
async def mark_listing_as_interested(
    listing_id: int,
    db: db_dependency,
    current_user: user_dependency
):
    """Mark a listing as interested (increment interested count)"""
    db_listing = get_listing_by_id(db, listing_id)
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    increment_listing_interested(db, listing_id)
    return {"message": "Listing marked as interested"}

@router.post("/{listing_id}/like", status_code=status.HTTP_200_OK)
async def like_listing(
    listing_id: int = Path(...),
    db: db_dependency = None,
    current_user: user_dependency = None
):
    listing = get_listing_by_id(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    user = db.query(User).filter(User.id == current_user.id).first()
    if listing in user.liked_listings:
        return {"message": "Already liked"}
    user.liked_listings.append(listing)
    db.commit()
    return {"message": "Listing liked"}

@router.post("/{listing_id}/unlike", status_code=status.HTTP_200_OK)
async def unlike_listing(
    listing_id: int = Path(...),
    db: db_dependency = None,
    current_user: user_dependency = None
):
    listing = get_listing_by_id(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    user = db.query(User).filter(User.id == current_user.id).first()
    if listing not in user.liked_listings:
        return {"message": "Not liked"}
    user.liked_listings.remove(listing)
    db.commit()
    return {"message": "Listing unliked"}


# Message endpoints
@router.post("/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    message_data: MessageCreate,
    db: db_dependency,
    current_user: user_dependency
):
    """Send a message to another user about a listing"""
    # Verify the listing exists
    listing = get_listing_by_id(db, message_data.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Verify the receiver exists
    receiver = db.query(User).filter(User.id == message_data.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    # Don't allow sending message to yourself
    if current_user.id == message_data.receiver_id:
        raise HTTPException(status_code=400, detail="Cannot send message to yourself")
    
    db_message = create_message(db, message_data, current_user.id)
    
    return MessageResponse(
        id=db_message.id,
        text=db_message.text,
        sender_id=db_message.sender_id,
        receiver_id=db_message.receiver_id,
        listing_id=db_message.listing_id,
        is_read=db_message.is_read,
        created_at=db_message.created_at,
        sender_username=current_user.username,
        receiver_username=receiver.username
    )

@router.get("/messages/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    db: db_dependency,
    current_user: user_dependency
):
    """Get all conversations for the current user"""
    conversations = get_user_conversations(db, current_user.id)
    
    conversations_response = []
    for conv in conversations:
        conversations_response.append(ConversationResponse(
            id=conv['other_user_id'],  # Using other_user_id as conversation id
            other_user_id=conv['other_user_id'],
            other_user_name=conv['other_user_name'],
            listing_id=conv['listing_id'],
            listing_title=conv['listing_title'],
            last_message=conv['last_message'],
            last_message_time=conv['last_message_time'],
            unread_count=conv['unread_count']
        ))
    
    return conversations_response

@router.get("/messages/{other_user_id}/{listing_id}", response_model=List[MessageResponse])
async def get_conversation_messages_endpoint(
    other_user_id: int,
    listing_id: int,
    db: db_dependency,
    current_user: user_dependency
):
    """Get messages between current user and another user for a specific listing"""
    messages = get_conversation_messages(db, current_user.id, other_user_id, listing_id)
    
    # Mark messages as read
    mark_messages_as_read(db, other_user_id, current_user.id, listing_id)
    
    messages_response = []
    for message in messages:
        messages_response.append(MessageResponse(
            id=message.id,
            text=message.text,
            sender_id=message.sender_id,
            receiver_id=message.receiver_id,
            listing_id=message.listing_id,
            is_read=message.is_read,
            created_at=message.created_at,
            sender_username=message.sender.username,
            receiver_username=message.receiver.username
        ))
    
    return messages_response 