from datetime import timedelta, datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from dotenv import load_dotenv
import os
from re_lease.models.users import User
from re_lease.deps import db_dependency, bcrypt_context, user_dependency
from re_lease.schemas.users import UserCreateRequest, Token
from re_lease.services.users import create_access_token, authenticate_user
import random
import smtplib
from email.mime.text import MIMEText

load_dotenv()

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

SECRET_KEY = os.getenv("AUTH_SECRET_KEY")
ALGORITHM = os.getenv("AUTH_ALGORITHM")

# In-memory store for verification codes (for mock/demo)
verification_codes = {}

def send_verification_email(to_email, code):
    EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
    msg = MIMEText(f"Your verification code is: {code}")
    msg["Subject"] = "Your Release Verification Code"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        smtp.send_message(msg)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(db: db_dependency, create_user_request: UserCreateRequest):
    if not create_user_request.email.endswith("@gmail.com"):
        raise HTTPException(status_code=400, detail="Only @gmail.com emails are allowed")
    code = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    send_verification_email(create_user_request.email, code)
    create_user_model = User(
        username=create_user_request.username,
        email=create_user_request.email,
        password_hash=bcrypt_context.hash(create_user_request.password),
        verified=False,
        verification_code=code,
        verification_code_expires_at=expires_at
    )
    db.add(create_user_model)
    db.commit()
    return {"message": "User created. Please check your email for the verification code."}

@router.post("/verify")
async def verify_email(request: Request, db: db_dependency):
    data = await request.json()
    email = data.get("email")
    code = data.get("code")
    if not email or not code:
        raise HTTPException(status_code=400, detail="Email and code are required")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.verification_code or not user.verification_code_expires_at:
        raise HTTPException(status_code=400, detail="No verification code found. Please request a new one.")
    if datetime.utcnow() > user.verification_code_expires_at:
        raise HTTPException(status_code=400, detail="Verification code expired. Please request a new one.")
    if str(user.verification_code).strip() != str(code).strip():
        raise HTTPException(status_code=400, detail="Invalid verification code")
    user.verified = True
    user.verification_code = None  # Clear the code after successful verification
    user.verification_code_expires_at = None
    db.commit()
    return {"message": "Email verified successfully."}

@router.post('/token', response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: db_dependency):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate user")
    if not user.verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not verified. Please check your email and verify your account.")
    token = create_access_token(user.username, user.id, timedelta(minutes=20))
    return {'access_token': token, 'token_type': 'bearer'}

@router.get("/me")
def get_me(user: user_dependency):
    return user
