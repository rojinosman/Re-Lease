from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ListingBase(BaseModel):
    title: str
    description: str
    price: float
    location: str
    bedrooms: int
    bathrooms: float
    available_from: datetime
    amenities: Optional[List[str]] = []
    images: Optional[List[str]] = []

class ListingCreate(ListingBase):
    pass

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    location: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    available_from: Optional[datetime] = None
    amenities: Optional[List[str]] = None
    images: Optional[List[str]] = None
    status: Optional[str] = None

class ListingResponse(ListingBase):
    id: int
    status: str
    views: int
    interested: int
    created_at: datetime
    updated_at: Optional[datetime]
    user_id: int
    user_username: str

    class Config:
        from_attributes = True

class MessageBase(BaseModel):
    text: str
    listing_id: int
    receiver_id: int

class MessageCreate(MessageBase):
    pass

class MessageResponse(BaseModel):
    id: int
    text: str
    sender_id: int
    receiver_id: int
    listing_id: int
    is_read: bool
    created_at: datetime
    sender_username: str
    receiver_username: str

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: int
    other_user_id: int
    other_user_name: str
    listing_id: int
    listing_title: str
    last_message: str
    last_message_time: datetime
    unread_count: int

    class Config:
        from_attributes = True 