from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    bio = Column(String(255), nullable=True)
    verified = Column(Boolean, default=False)
    verification_code = Column(String(10), nullable=True)  # New field for email verification code
    verification_code_expires_at = Column(DateTime, nullable=True)  # Expiration for verification code
    # Relationships
    listings = relationship("Listing", back_populates="user")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")
    liked_listings = relationship("Listing", secondary="liked_listings", back_populates="liked_by")
