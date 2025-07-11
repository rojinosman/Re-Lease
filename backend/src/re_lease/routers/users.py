from fastapi import APIRouter, HTTPException
from typing import List, Optional
from re_lease.deps import db_dependency, user_dependency
from re_lease.models.users import User
from pydantic import BaseModel

router = APIRouter(
    prefix='/users',
    tags=['users']
)

class SocialLink(BaseModel):
    label: str
    url: str

class UserProfileUpdate(BaseModel):
    bio: Optional[str] = None

@router.get("/me")
def get_me(db: db_dependency, user: user_dependency):
    current_user = db.query(User).filter(User.id == user.get('id')).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        #include these later for the user profile
        #"bio": current_user.bio,
        #"social_links": [{"label": link.label, "url": link.url} for link in current_user.social_links]
    }


@router.get("/search")
def search_users(query: str, db: db_dependency, user: user_dependency):
    if not query or len(query) < 2:
        return []
    users = db.query(User).filter(
        (User.username.ilike(f"%{query}%")) | (User.email.ilike(f"%{query}%"))
    ).all()
    return [{"id": u.id, "username": u.username, "email": u.email} for u in users]


@router.get("/me/friends")
def get_friends(db: db_dependency, user: user_dependency):
    current_user = db.query(User).filter(User.id == user.get('id')).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    return [{"id": f.id, "username": f.username, "email": f.email} for f in current_user.friends]

@router.get("/me/friend-requests")
def get_friend_requests(db: db_dependency, user: user_dependency):
    current_user = db.query(User).filter(User.id == user.get('id')).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    return [{"id": f.id, "username": f.username, "email": f.email} for f in current_user.received_friend_requests]

@router.post("/me/friend-requests/{user_id}")
def send_friend_request(user_id: int, db: db_dependency, user: user_dependency):
    current_user = db.query(User).filter(User.id == user.get('id')).first()
    target_user = db.query(User).filter(User.id == user_id).first()

    if not current_user or not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if target_user in current_user.friends:
        raise HTTPException(status_code=400, detail="Already friends")

    if target_user in current_user.sent_friend_requests:
        raise HTTPException(status_code=400, detail="Friend request already sent")

    current_user.sent_friend_requests.append(target_user)
    db.commit()
    return {"detail": "Friend request sent"}

@router.post("/me/friend-requests/{user_id}/accept")
def accept_friend_request(user_id: int, db: db_dependency, user: user_dependency):
    current_user = db.query(User).filter(User.id == user.get('id')).first()
    sender = db.query(User).filter(User.id == user_id).first()

    if not current_user or not sender:
        raise HTTPException(status_code=404, detail="User not found")

    if sender not in current_user.received_friend_requests:
        raise HTTPException(status_code=400, detail="No friend request from this user")

    # Add to friends (both directions)
    current_user.friends.append(sender)
    sender.friends.append(current_user)
    # Remove from friend requests
    current_user.received_friend_requests.remove(sender)
    db.commit()
    return {"detail": "Friend request accepted"}

@router.delete("/me/friend-requests/{user_id}")
def decline_friend_request(user_id: int, db: db_dependency, user: user_dependency):
    current_user = db.query(User).filter(User.id == user.get('id')).first()
    sender = db.query(User).filter(User.id == user_id).first()

    if not current_user or not sender:
        raise HTTPException(status_code=404, detail="User not found")

    if sender not in current_user.received_friend_requests:
        raise HTTPException(status_code=400, detail="No friend request from this user")

    current_user.received_friend_requests.remove(sender)
    db.commit()
    return {"detail": "Friend request declined"}

@router.delete("/me/friends/{user_id}")
def remove_friend(user_id: int, db: db_dependency, user: user_dependency):
    current_user = db.query(User).filter(User.id == user.get('id')).first()
    friend = db.query(User).filter(User.id == user_id).first()

    if not current_user or not friend:
        raise HTTPException(status_code=404, detail="User not found")

    if friend not in current_user.friends:
        raise HTTPException(status_code=400, detail="Not friends with this user")

    current_user.friends.remove(friend)
    db.commit()
    return {"detail": "Friend removed"}

"""
@router.get("/me/stats")
def get_user_stats(db: db_dependency, user: user_dependency):
    current_user = db.query(User).filter(User.id == user.get('id')).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Owned trips
    owned_trips = db.query(Trip).filter(Trip.user_id == current_user.id).all()
    # Collaborating trips (not owned)
    collab_trips = db.query(Trip).filter(Trip.collaborators.any(id=current_user.id), Trip.user_id != current_user.id).all()
    # Combine and deduplicate trips
    all_trips = {t.id: t for t in owned_trips + collab_trips}.values()

    # Count unique countries (by lat/long)
    countries = set()
    for trip in all_trips:
        if trip.latitude and trip.longitude:
            countries.add((trip.latitude, trip.longitude))

    return {
        "trips": len(all_trips),
        "countries": len(countries),
        "friends": len(current_user.friends)
    }
"""


@router.get("/me/friend-requests/sent")
def get_sent_friend_requests(db: db_dependency, user: user_dependency):
    current_user = db.query(User).filter(User.id == user.get('id')).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    return [{"id": u.id, "username": u.username, "email": u.email} for u in current_user.sent_friend_requests]


