from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth
from .routers import users
from .routers import listings
from .models import users as user_models
from .models import listings as listing_models
from .seed_data import seed_database

from .database import Base, engine

app = FastAPI()

Base.metadata.create_all(bind=engine)

# Seed the database with sample data
seed_database()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.get("/")
def health_check():
    return 'Health check complete'

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(listings.router)
