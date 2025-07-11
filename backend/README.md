# Re-Lease Backend

A FastAPI backend for the Re-Lease student housing platform.

## Features

- **User Authentication**: JWT-based authentication with signup/login
- **Property Listings**: CRUD operations for housing listings
- **Messaging System**: Direct messaging between users
- **Search & Filtering**: Advanced search with price, location, and bedroom filters
- **User Management**: User profiles and preferences

## API Endpoints

### Authentication
- `POST /auth/` - Create new user account
- `POST /auth/token` - Login and get access token
- `GET /auth/me` - Get current user profile

### Listings
- `GET /listings/` - Get all listings with optional filters
- `POST /listings/` - Create new listing
- `GET /listings/{id}` - Get specific listing
- `PUT /listings/{id}` - Update listing
- `DELETE /listings/{id}` - Delete listing
- `GET /listings/my/listings` - Get user's own listings
- `POST /listings/{id}/interested` - Mark listing as interested

### Messages
- `POST /listings/messages` - Send message to listing owner
- `GET /listings/messages/conversations` - Get user conversations
- `GET /listings/messages/{user_id}/{listing_id}` - Get conversation messages

## Setup

1. Install dependencies:
```bash
uv sync
```

2. Set up environment variables (create `.env` file):
```
AUTH_SECRET_KEY=your-secret-key-here
AUTH_ALGORITHM=HS256
DATABASE_URL=sqlite:///./Re-lease.db
```

3. Run the development server:
```bash
uv run dev
```

The server will start on `http://localhost:8000` and automatically seed the database with sample data.

## Sample Data

The backend comes with pre-seeded sample data including:
- 5 sample users with credentials (username: password123)
- 6 sample property listings
- Various amenities and locations

## Database

The application uses SQLite by default with the following main tables:
- `users` - User accounts and profiles
- `listings` - Property listings with details
- `messages` - Direct messages between users

## API Documentation

Once the server is running, visit:
- `http://localhost:8000/docs` - Interactive API documentation (Swagger UI)
- `http://localhost:8000/redoc` - Alternative API documentation
