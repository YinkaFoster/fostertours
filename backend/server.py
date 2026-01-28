from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, BackgroundTasks, Query
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'travel_tours_secret_key_2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Create the main app
app = FastAPI(title="Travel & Tours API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# =============== MODELS ===============

# User Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    phone: Optional[str] = None
    picture: Optional[str] = None
    wallet_balance: float = 0.0
    created_at: datetime
    is_admin: bool = False

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Flight Models
class FlightSearch(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    passengers: int = 1
    cabin_class: str = "economy"

class Flight(BaseModel):
    flight_id: str
    airline: str
    airline_logo: str
    flight_number: str
    origin: str
    origin_city: str
    destination: str
    destination_city: str
    departure_time: str
    arrival_time: str
    duration: str
    price: float
    stops: int
    cabin_class: str
    available_seats: int

# Hotel Models
class HotelSearch(BaseModel):
    location: str
    check_in: str
    check_out: str
    guests: int = 2
    rooms: int = 1

class Hotel(BaseModel):
    hotel_id: str
    name: str
    location: str
    city: str
    rating: float
    reviews_count: int
    price_per_night: float
    image_url: str
    images: List[str]
    amenities: List[str]
    description: str
    room_types: List[Dict[str, Any]]

# Booking Models
class BookingCreate(BaseModel):
    booking_type: str  # flight, hotel, event, vehicle, visa
    item_id: str
    item_details: Dict[str, Any]
    total_amount: float
    payment_method: str  # wallet, stripe, paypal, paystack
    guest_info: Optional[Dict[str, Any]] = None

class Booking(BaseModel):
    booking_id: str
    user_id: str
    booking_type: str
    item_id: str
    item_details: Dict[str, Any]
    total_amount: float
    status: str  # pending, confirmed, cancelled, completed
    payment_status: str  # pending, paid, refunded
    payment_method: str
    created_at: datetime
    updated_at: datetime

# Wallet Models
class WalletTopUp(BaseModel):
    amount: float
    payment_method: str  # stripe, paypal, paystack

class WalletTransaction(BaseModel):
    transaction_id: str
    user_id: str
    amount: float
    transaction_type: str  # credit, debit
    description: str
    reference: Optional[str] = None
    status: str
    created_at: datetime

# Event Models
class Event(BaseModel):
    event_id: str
    title: str
    description: str
    location: str
    city: str
    date: str
    time: str
    duration: str
    price: float
    image_url: str
    category: str
    available_spots: int
    organizer: str

# Vehicle Models
class Vehicle(BaseModel):
    vehicle_id: str
    name: str
    type: str  # car, suv, bike, van
    brand: str
    model: str
    year: int
    price_per_day: float
    image_url: str
    location: str
    features: List[str]
    available: bool
    seats: int
    transmission: str

# Visa Package Models
class VisaPackage(BaseModel):
    package_id: str
    country: str
    visa_type: str  # tourist, business, student, work
    processing_time: str
    price: float
    documents_required: List[str]
    description: str
    image_url: str

# Blog Models
class BlogPost(BaseModel):
    post_id: str
    title: str
    slug: str
    excerpt: str
    content: str
    author: str
    author_image: str
    image_url: str
    category: str
    tags: List[str]
    created_at: datetime
    read_time: str
    views: int
    featured: bool = False

class BlogComment(BaseModel):
    comment_id: str
    post_id: str
    user_id: str
    user_name: str
    content: str
    created_at: datetime

# Store Models
class Product(BaseModel):
    product_id: str
    name: str
    description: str
    price: float
    sale_price: Optional[float] = None
    image_url: str
    images: List[str]
    category: str
    stock: int
    rating: float
    reviews_count: int

class CartItem(BaseModel):
    product_id: str
    quantity: int

class Order(BaseModel):
    order_id: str
    user_id: str
    items: List[Dict[str, Any]]
    subtotal: float
    shipping: float
    total: float
    status: str
    shipping_address: Dict[str, str]
    payment_status: str
    created_at: datetime

# Itinerary Models
class ItineraryDay(BaseModel):
    day: int
    date: str
    destination: str
    activities: List[Dict[str, Any]]
    accommodation: Optional[str] = None
    notes: Optional[str] = None

class Itinerary(BaseModel):
    itinerary_id: str
    user_id: str
    title: str
    description: Optional[str] = None
    start_date: str
    end_date: str
    destinations: List[str]
    days: List[ItineraryDay]
    total_budget: Optional[float] = None
    is_public: bool = False
    created_at: datetime
    updated_at: datetime

# Payment Transaction Model
class PaymentTransaction(BaseModel):
    transaction_id: str
    user_id: Optional[str] = None
    amount: float
    currency: str
    payment_method: str
    session_id: Optional[str] = None
    reference: Optional[str] = None
    status: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

# =============== HELPER FUNCTIONS ===============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, is_admin: bool = False) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "is_admin": is_admin,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> Optional[dict]:
    # Check cookie first
    session_token = request.cookies.get("session_token")
    if session_token:
        session = await db.user_sessions.find_one(
            {"session_token": session_token},
            {"_id": 0}
        )
        if session:
            expires_at = session.get("expires_at")
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at > datetime.now(timezone.utc):
                user = await db.users.find_one(
                    {"user_id": session["user_id"]},
                    {"_id": 0, "password": 0}
                )
                return user
    
    # Check Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user = await db.users.find_one(
                {"user_id": payload["user_id"]},
                {"_id": 0, "password": 0}
            )
            return user
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    return None

async def require_auth(request: Request) -> dict:
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

async def require_admin(request: Request) -> dict:
    user = await require_auth(request)
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# =============== AUTH ROUTES ===============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "phone": user_data.phone,
        "picture": None,
        "wallet_balance": 0.0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_admin": False
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user_data.email)
    user_response = UserResponse(
        user_id=user_id,
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        wallet_balance=0.0,
        created_at=datetime.now(timezone.utc),
        is_admin=False
    )
    
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["user_id"], user["email"], user.get("is_admin", False))
    
    created_at = user.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    user_response = UserResponse(
        user_id=user["user_id"],
        email=user["email"],
        name=user["name"],
        phone=user.get("phone"),
        picture=user.get("picture"),
        wallet_balance=user.get("wallet_balance", 0.0),
        created_at=created_at,
        is_admin=user.get("is_admin", False)
    )
    
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/session")
async def create_session(request: Request):
    """Handle Emergent OAuth session - exchange session_id for session_token"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Exchange session_id with Emergent Auth
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id},
                timeout=30.0
            )
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            auth_data = response.json()
        except httpx.HTTPError as e:
            logger.error(f"Auth exchange error: {e}")
            raise HTTPException(status_code=500, detail="Authentication service error")
    
    email = auth_data.get("email")
    name = auth_data.get("name")
    picture = auth_data.get("picture")
    session_token = auth_data.get("session_token")
    
    # Find or create user
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info if needed
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "password": None,  # OAuth user, no password
            "wallet_balance": 0.0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_admin": False
        }
        await db.users.insert_one(user_doc)
    
    # Store session
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Get user data
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    
    response = JSONResponse(content={
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "picture": user.get("picture"),
        "wallet_balance": user.get("wallet_balance", 0.0),
        "is_admin": user.get("is_admin", False)
    })
    
    # Set httpOnly cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60  # 7 days
    )
    
    return response

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    created_at = user.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "phone": user.get("phone"),
        "picture": user.get("picture"),
        "wallet_balance": user.get("wallet_balance", 0.0),
        "is_admin": user.get("is_admin", False),
        "created_at": created_at.isoformat() if created_at else None
    }

@api_router.post("/auth/logout")
async def logout(request: Request):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response = JSONResponse(content={"message": "Logged out successfully"})
    response.delete_cookie("session_token", path="/")
    return response

# =============== FLIGHTS ROUTES ===============

# Mock flight data generator
def generate_mock_flights(origin: str, destination: str, date: str, passengers: int) -> List[dict]:
    airlines = [
        {"name": "Emirates", "code": "EK", "logo": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Emirates_logo.svg"},
        {"name": "Qatar Airways", "code": "QR", "logo": "https://upload.wikimedia.org/wikipedia/en/9/9b/Qatar_Airways_Logo.svg"},
        {"name": "Singapore Airlines", "code": "SQ", "logo": "https://upload.wikimedia.org/wikipedia/en/6/6b/Singapore_Airlines_Logo_2.svg"},
        {"name": "Lufthansa", "code": "LH", "logo": "https://upload.wikimedia.org/wikipedia/commons/b/b8/Lufthansa_Logo_2018.svg"},
        {"name": "British Airways", "code": "BA", "logo": "https://upload.wikimedia.org/wikipedia/en/4/42/British_Airways_Logo.svg"},
    ]
    
    cities = {
        "NYC": "New York", "LAX": "Los Angeles", "LHR": "London", "DXB": "Dubai",
        "SIN": "Singapore", "HKG": "Hong Kong", "CDG": "Paris", "NRT": "Tokyo",
        "SYD": "Sydney", "JFK": "New York", "ORD": "Chicago", "MIA": "Miami"
    }
    
    flights = []
    base_prices = [450, 520, 680, 890, 1200, 350, 750]
    
    for i, airline in enumerate(airlines):
        for j in range(2):  # 2 flights per airline
            flight_num = f"{airline['code']}{100 + i * 10 + j}"
            stops = j % 3
            base_price = base_prices[(i + j) % len(base_prices)]
            
            flights.append({
                "flight_id": f"fl_{uuid.uuid4().hex[:8]}",
                "airline": airline["name"],
                "airline_logo": airline["logo"],
                "flight_number": flight_num,
                "origin": origin,
                "origin_city": cities.get(origin, origin),
                "destination": destination,
                "destination_city": cities.get(destination, destination),
                "departure_time": f"{6 + i * 3}:{'00' if j == 0 else '30'}",
                "arrival_time": f"{14 + i * 2}:{'45' if j == 0 else '15'}",
                "duration": f"{8 + stops * 2}h {30 + j * 15}m",
                "price": base_price * passengers,
                "stops": stops,
                "cabin_class": "economy",
                "available_seats": 15 + i * 5
            })
    
    return flights

@api_router.post("/flights/search")
async def search_flights(search: FlightSearch):
    flights = generate_mock_flights(
        search.origin,
        search.destination,
        search.departure_date,
        search.passengers
    )
    return {"flights": flights, "total": len(flights)}

@api_router.get("/flights/{flight_id}")
async def get_flight(flight_id: str):
    # Generate a mock flight detail
    return {
        "flight_id": flight_id,
        "airline": "Emirates",
        "airline_logo": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Emirates_logo.svg",
        "flight_number": "EK101",
        "origin": "JFK",
        "origin_city": "New York",
        "destination": "DXB",
        "destination_city": "Dubai",
        "departure_time": "09:00",
        "arrival_time": "07:30+1",
        "duration": "12h 30m",
        "price": 850.00,
        "stops": 0,
        "cabin_class": "economy",
        "available_seats": 25,
        "aircraft": "Boeing 777-300ER",
        "amenities": ["WiFi", "Entertainment", "Meals", "USB Charging"]
    }

# =============== HOTELS ROUTES ===============

def generate_mock_hotels(location: str) -> List[dict]:
    hotels_data = [
        {
            "name": "The Grand Resort & Spa",
            "rating": 4.8,
            "price": 299,
            "amenities": ["Pool", "Spa", "Restaurant", "Gym", "WiFi", "Beach Access"]
        },
        {
            "name": "Ocean View Hotel",
            "rating": 4.5,
            "price": 189,
            "amenities": ["Pool", "Restaurant", "WiFi", "Bar", "Room Service"]
        },
        {
            "name": "City Center Inn",
            "rating": 4.2,
            "price": 129,
            "amenities": ["WiFi", "Restaurant", "Parking", "Business Center"]
        },
        {
            "name": "Luxury Palace Hotel",
            "rating": 4.9,
            "price": 459,
            "amenities": ["Pool", "Spa", "Golf", "Restaurant", "WiFi", "Concierge", "Private Beach"]
        },
        {
            "name": "Budget Traveler's Inn",
            "rating": 3.8,
            "price": 79,
            "amenities": ["WiFi", "Parking", "Breakfast"]
        },
        {
            "name": "Boutique Paradise",
            "rating": 4.6,
            "price": 219,
            "amenities": ["Pool", "Restaurant", "WiFi", "Spa", "Rooftop Bar"]
        }
    ]
    
    hotels = []
    for i, h in enumerate(hotels_data):
        hotels.append({
            "hotel_id": f"htl_{uuid.uuid4().hex[:8]}",
            "name": h["name"],
            "location": location,
            "city": location,
            "rating": h["rating"],
            "reviews_count": 100 + i * 50,
            "price_per_night": h["price"],
            "image_url": f"https://images.unsplash.com/photo-170283049914{i}-a0634d87d6af?w=800",
            "images": [
                f"https://images.unsplash.com/photo-170283049914{i}-a0634d87d6af?w=800",
                f"https://images.unsplash.com/photo-170918751605{i}-d4929b67e89f?w=800"
            ],
            "amenities": h["amenities"],
            "description": f"Experience luxury and comfort at {h['name']}. Located in the heart of {location}.",
            "room_types": [
                {"type": "Standard", "price": h["price"], "beds": "1 Queen"},
                {"type": "Deluxe", "price": h["price"] * 1.5, "beds": "1 King"},
                {"type": "Suite", "price": h["price"] * 2.5, "beds": "1 King + Living"}
            ]
        })
    
    return hotels

@api_router.post("/hotels/search")
async def search_hotels(search: HotelSearch):
    hotels = generate_mock_hotels(search.location)
    return {"hotels": hotels, "total": len(hotels)}

@api_router.get("/hotels/{hotel_id}")
async def get_hotel(hotel_id: str):
    return {
        "hotel_id": hotel_id,
        "name": "The Grand Resort & Spa",
        "location": "Maldives",
        "city": "Maldives",
        "rating": 4.8,
        "reviews_count": 324,
        "price_per_night": 299,
        "image_url": "https://images.unsplash.com/photo-1702830499141-a0634d87d6af?w=800",
        "images": [
            "https://images.unsplash.com/photo-1702830499141-a0634d87d6af?w=800",
            "https://images.unsplash.com/photo-1709187516056-d4929b67e89f?w=800"
        ],
        "amenities": ["Pool", "Spa", "Restaurant", "Gym", "WiFi", "Beach Access", "Water Sports"],
        "description": "Experience paradise at The Grand Resort & Spa. Nestled in pristine waters with overwater villas and world-class amenities.",
        "room_types": [
            {"type": "Beach Villa", "price": 299, "beds": "1 King", "size": "45 sqm"},
            {"type": "Overwater Villa", "price": 499, "beds": "1 King", "size": "65 sqm"},
            {"type": "Presidential Suite", "price": 899, "beds": "1 King + Living", "size": "120 sqm"}
        ]
    }

# =============== EVENTS ROUTES ===============

@api_router.get("/events")
async def get_events(
    category: Optional[str] = None,
    city: Optional[str] = None,
    limit: int = Query(default=10, le=50)
):
    events = [
        {
            "event_id": f"evt_{uuid.uuid4().hex[:8]}",
            "title": "Sunset Safari Experience",
            "description": "Witness the African savanna come alive at sunset with our exclusive safari tour.",
            "location": "Serengeti National Park",
            "city": "Tanzania",
            "date": "2025-02-15",
            "time": "16:00",
            "duration": "4 hours",
            "price": 150.00,
            "image_url": "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
            "category": "Safari",
            "available_spots": 12,
            "organizer": "African Adventures"
        },
        {
            "event_id": f"evt_{uuid.uuid4().hex[:8]}",
            "title": "Tokyo Food Walking Tour",
            "description": "Explore the hidden culinary gems of Tokyo with local guides.",
            "location": "Shibuya District",
            "city": "Tokyo",
            "date": "2025-02-20",
            "time": "18:00",
            "duration": "3 hours",
            "price": 85.00,
            "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
            "category": "Food & Culture",
            "available_spots": 8,
            "organizer": "Tokyo Tastes"
        },
        {
            "event_id": f"evt_{uuid.uuid4().hex[:8]}",
            "title": "Northern Lights Adventure",
            "description": "Chase the Aurora Borealis across the Arctic wilderness.",
            "location": "Tromsø",
            "city": "Norway",
            "date": "2025-03-01",
            "time": "20:00",
            "duration": "6 hours",
            "price": 220.00,
            "image_url": "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800",
            "category": "Nature",
            "available_spots": 15,
            "organizer": "Arctic Expeditions"
        },
        {
            "event_id": f"evt_{uuid.uuid4().hex[:8]}",
            "title": "Machu Picchu Sunrise Trek",
            "description": "Witness the sunrise over the ancient Incan citadel.",
            "location": "Machu Picchu",
            "city": "Peru",
            "date": "2025-03-10",
            "time": "04:00",
            "duration": "8 hours",
            "price": 180.00,
            "image_url": "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800",
            "category": "Adventure",
            "available_spots": 10,
            "organizer": "Inca Trail Tours"
        }
    ]
    
    if category:
        events = [e for e in events if e["category"].lower() == category.lower()]
    if city:
        events = [e for e in events if city.lower() in e["city"].lower()]
    
    return {"events": events[:limit], "total": len(events)}

@api_router.get("/events/{event_id}")
async def get_event(event_id: str):
    return {
        "event_id": event_id,
        "title": "Sunset Safari Experience",
        "description": "Witness the African savanna come alive at sunset with our exclusive safari tour. Expert guides will take you through the heart of Serengeti, where you'll encounter lions, elephants, zebras, and more in their natural habitat.",
        "location": "Serengeti National Park",
        "city": "Tanzania",
        "date": "2025-02-15",
        "time": "16:00",
        "duration": "4 hours",
        "price": 150.00,
        "image_url": "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
        "images": [
            "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
            "https://images.unsplash.com/photo-1534177616064-ef1dcaabdfc9?w=800"
        ],
        "category": "Safari",
        "available_spots": 12,
        "organizer": "African Adventures",
        "includes": ["Transport", "Guide", "Refreshments", "Binoculars"],
        "meeting_point": "Serengeti Park Gate"
    }

# =============== VEHICLES ROUTES ===============

@api_router.get("/vehicles")
async def get_vehicles(
    location: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    limit: int = Query(default=10, le=50)
):
    vehicles = [
        {
            "vehicle_id": f"veh_{uuid.uuid4().hex[:8]}",
            "name": "Toyota Land Cruiser",
            "type": "suv",
            "brand": "Toyota",
            "model": "Land Cruiser",
            "year": 2024,
            "price_per_day": 120.00,
            "image_url": "https://images.unsplash.com/photo-1674476459501-47466da1dbbc?w=800",
            "location": "Dubai",
            "features": ["4WD", "GPS", "Air Conditioning", "Bluetooth"],
            "available": True,
            "seats": 7,
            "transmission": "Automatic"
        },
        {
            "vehicle_id": f"veh_{uuid.uuid4().hex[:8]}",
            "name": "Mercedes-Benz S-Class",
            "type": "car",
            "brand": "Mercedes-Benz",
            "model": "S-Class",
            "year": 2024,
            "price_per_day": 250.00,
            "image_url": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
            "location": "Paris",
            "features": ["Leather Seats", "GPS", "Premium Audio", "Sunroof"],
            "available": True,
            "seats": 5,
            "transmission": "Automatic"
        },
        {
            "vehicle_id": f"veh_{uuid.uuid4().hex[:8]}",
            "name": "Vespa Primavera",
            "type": "bike",
            "brand": "Vespa",
            "model": "Primavera 150",
            "year": 2024,
            "price_per_day": 45.00,
            "image_url": "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=800",
            "location": "Rome",
            "features": ["Helmet Included", "Storage Box"],
            "available": True,
            "seats": 2,
            "transmission": "Automatic"
        },
        {
            "vehicle_id": f"veh_{uuid.uuid4().hex[:8]}",
            "name": "Ford Transit Van",
            "type": "van",
            "brand": "Ford",
            "model": "Transit",
            "year": 2023,
            "price_per_day": 85.00,
            "image_url": "https://images.unsplash.com/photo-1532593400-3f0b1f3b2c2a?w=800",
            "location": "London",
            "features": ["Large Cargo", "GPS", "Air Conditioning"],
            "available": True,
            "seats": 9,
            "transmission": "Automatic"
        }
    ]
    
    if location:
        vehicles = [v for v in vehicles if location.lower() in v["location"].lower()]
    if vehicle_type:
        vehicles = [v for v in vehicles if v["type"] == vehicle_type]
    
    return {"vehicles": vehicles[:limit], "total": len(vehicles)}

@api_router.get("/vehicles/{vehicle_id}")
async def get_vehicle(vehicle_id: str):
    return {
        "vehicle_id": vehicle_id,
        "name": "Toyota Land Cruiser",
        "type": "suv",
        "brand": "Toyota",
        "model": "Land Cruiser",
        "year": 2024,
        "price_per_day": 120.00,
        "image_url": "https://images.unsplash.com/photo-1674476459501-47466da1dbbc?w=800",
        "images": [
            "https://images.unsplash.com/photo-1674476459501-47466da1dbbc?w=800"
        ],
        "location": "Dubai",
        "features": ["4WD", "GPS", "Air Conditioning", "Bluetooth", "Cruise Control", "Backup Camera"],
        "available": True,
        "seats": 7,
        "transmission": "Automatic",
        "fuel_type": "Petrol",
        "mileage_limit": "Unlimited",
        "insurance_included": True,
        "deposit_required": 500.00
    }

# =============== VISA PACKAGES ROUTES ===============

@api_router.get("/visa-packages")
async def get_visa_packages(country: Optional[str] = None):
    packages = [
        {
            "package_id": f"visa_{uuid.uuid4().hex[:8]}",
            "country": "United States",
            "visa_type": "Tourist (B1/B2)",
            "processing_time": "3-5 business days",
            "price": 199.00,
            "documents_required": ["Valid Passport", "Photo", "Bank Statement", "Travel Itinerary", "Employment Letter"],
            "description": "Complete US tourist visa assistance including application review and interview preparation.",
            "image_url": "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800"
        },
        {
            "package_id": f"visa_{uuid.uuid4().hex[:8]}",
            "country": "United Kingdom",
            "visa_type": "Standard Visitor",
            "processing_time": "15 working days",
            "price": 149.00,
            "documents_required": ["Valid Passport", "Photo", "Bank Statement", "Accommodation Proof", "Return Ticket"],
            "description": "UK visitor visa processing with document verification and submission support.",
            "image_url": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800"
        },
        {
            "package_id": f"visa_{uuid.uuid4().hex[:8]}",
            "country": "Schengen Area",
            "visa_type": "Short Stay (C)",
            "processing_time": "10-15 working days",
            "price": 129.00,
            "documents_required": ["Valid Passport", "Photo", "Travel Insurance", "Hotel Booking", "Flight Itinerary"],
            "description": "Schengen visa for travel across 27 European countries.",
            "image_url": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800"
        },
        {
            "package_id": f"visa_{uuid.uuid4().hex[:8]}",
            "country": "Australia",
            "visa_type": "Visitor (subclass 600)",
            "processing_time": "20-30 days",
            "price": 179.00,
            "documents_required": ["Valid Passport", "Photo", "Financial Evidence", "Health Insurance", "Character Documents"],
            "description": "Australian visitor visa with comprehensive application support.",
            "image_url": "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800"
        }
    ]
    
    if country:
        packages = [p for p in packages if country.lower() in p["country"].lower()]
    
    return {"packages": packages, "total": len(packages)}

# =============== BLOG ROUTES ===============

@api_router.get("/blog/posts")
async def get_blog_posts(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = Query(default=10, le=50)
):
    posts = [
        {
            "post_id": f"post_{uuid.uuid4().hex[:8]}",
            "title": "10 Hidden Gems in Southeast Asia You Must Visit",
            "slug": "hidden-gems-southeast-asia",
            "excerpt": "Discover the most beautiful off-the-beaten-path destinations in Southeast Asia.",
            "content": "Southeast Asia is a treasure trove of incredible destinations...",
            "author": "Sarah Johnson",
            "author_image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
            "image_url": "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800",
            "category": "Destinations",
            "tags": ["Asia", "Adventure", "Hidden Gems"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "read_time": "8 min read",
            "views": 2340,
            "featured": True
        },
        {
            "post_id": f"post_{uuid.uuid4().hex[:8]}",
            "title": "The Ultimate Packing Guide for Long-Term Travel",
            "slug": "ultimate-packing-guide",
            "excerpt": "Everything you need to know about packing light for extended adventures.",
            "content": "Packing for long-term travel can be overwhelming...",
            "author": "Mike Chen",
            "author_image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
            "category": "Tips & Guides",
            "tags": ["Packing", "Tips", "Budget Travel"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "read_time": "6 min read",
            "views": 1890,
            "featured": False
        },
        {
            "post_id": f"post_{uuid.uuid4().hex[:8]}",
            "title": "Sustainable Travel: How to Reduce Your Carbon Footprint",
            "slug": "sustainable-travel-guide",
            "excerpt": "Learn how to travel responsibly while still having amazing experiences.",
            "content": "Sustainable travel is more important than ever...",
            "author": "Emma Wilson",
            "author_image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
            "image_url": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
            "category": "Sustainability",
            "tags": ["Eco-friendly", "Green Travel", "Tips"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "read_time": "5 min read",
            "views": 1456,
            "featured": True
        }
    ]
    
    if category:
        posts = [p for p in posts if category.lower() in p["category"].lower()]
    if featured is not None:
        posts = [p for p in posts if p["featured"] == featured]
    
    return {"posts": posts[:limit], "total": len(posts)}

@api_router.get("/blog/posts/{slug}")
async def get_blog_post(slug: str, request: Request):
    user = await get_current_user(request)
    user_id = user["user_id"] if user else None
    
    post = {
        "post_id": f"post_{slug[:8]}",
        "title": "10 Hidden Gems in Southeast Asia You Must Visit",
        "slug": slug,
        "excerpt": "Discover the most beautiful off-the-beaten-path destinations in Southeast Asia.",
        "content": """
        <h2>Introduction</h2>
        <p>Southeast Asia is a treasure trove of incredible destinations that go far beyond the typical tourist spots. While places like Bali and Bangkok are certainly worth visiting, there's a whole world of hidden gems waiting to be discovered.</p>
        
        <h2>1. Kampot, Cambodia</h2>
        <p>This sleepy riverside town offers a perfect blend of French colonial architecture, pepper plantations, and stunning countryside. Rent a scooter and explore the nearby caves and beaches.</p>
        
        <h2>2. Siargao, Philippines</h2>
        <p>Known as the surfing capital of the Philippines, Siargao offers more than just waves. Discover pristine lagoons, coconut forests, and some of the friendliest locals you'll ever meet.</p>
        
        <h2>3. Ninh Binh, Vietnam</h2>
        <p>Often called "Ha Long Bay on land," this stunning region features limestone karsts, ancient temples, and peaceful boat rides through flooded rice paddies.</p>
        """,
        "author": "Sarah Johnson",
        "author_id": "user_sarah123",
        "author_image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        "image_url": "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800",
        "category": "Destinations",
        "tags": ["Asia", "Adventure", "Hidden Gems"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "read_time": "8 min read",
        "views": 2340,
        "featured": True,
        "related_posts": []
    }
    
    # Get like count and check if user liked
    likes_count = await db.post_likes.count_documents({"post_id": post["post_id"]})
    user_liked = False
    if user_id:
        user_liked = await db.post_likes.find_one({"post_id": post["post_id"], "user_id": user_id}) is not None
    
    # Get comments
    comments = await db.post_comments.find(
        {"post_id": post["post_id"]},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    # Get share count
    shares_count = await db.post_shares.count_documents({"post_id": post["post_id"]})
    
    post["likes_count"] = likes_count
    post["user_liked"] = user_liked
    post["comments"] = comments
    post["comments_count"] = len(comments)
    post["shares_count"] = shares_count
    
    return post

# =============== SOCIAL FEATURES ===============

# Follow/Unfollow
@api_router.post("/social/follow/{target_user_id}")
async def follow_user(request: Request, target_user_id: str):
    user = await require_auth(request)
    
    if user["user_id"] == target_user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    # Check if already following
    existing = await db.follows.find_one({
        "follower_id": user["user_id"],
        "following_id": target_user_id
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Already following this user")
    
    follow_doc = {
        "follower_id": user["user_id"],
        "following_id": target_user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.follows.insert_one(follow_doc)
    
    return {"message": "Successfully followed user", "following": True}

@api_router.delete("/social/follow/{target_user_id}")
async def unfollow_user(request: Request, target_user_id: str):
    user = await require_auth(request)
    
    result = await db.follows.delete_one({
        "follower_id": user["user_id"],
        "following_id": target_user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not following this user")
    
    return {"message": "Successfully unfollowed user", "following": False}

@api_router.get("/social/followers/{user_id}")
async def get_followers(user_id: str, limit: int = Query(default=50, le=100)):
    followers = await db.follows.find(
        {"following_id": user_id},
        {"_id": 0}
    ).limit(limit).to_list(limit)
    
    # Get follower details
    follower_ids = [f["follower_id"] for f in followers]
    users = await db.users.find(
        {"user_id": {"$in": follower_ids}},
        {"_id": 0, "password": 0}
    ).to_list(len(follower_ids))
    
    return {"followers": users, "count": len(users)}

@api_router.get("/social/following/{user_id}")
async def get_following(user_id: str, limit: int = Query(default=50, le=100)):
    following = await db.follows.find(
        {"follower_id": user_id},
        {"_id": 0}
    ).limit(limit).to_list(limit)
    
    # Get following details
    following_ids = [f["following_id"] for f in following]
    users = await db.users.find(
        {"user_id": {"$in": following_ids}},
        {"_id": 0, "password": 0}
    ).to_list(len(following_ids))
    
    return {"following": users, "count": len(users)}

@api_router.get("/social/is-following/{target_user_id}")
async def check_following(request: Request, target_user_id: str):
    user = await get_current_user(request)
    if not user:
        return {"is_following": False}
    
    existing = await db.follows.find_one({
        "follower_id": user["user_id"],
        "following_id": target_user_id
    })
    
    return {"is_following": existing is not None}

# Likes
@api_router.post("/social/like/{post_id}")
async def like_post(request: Request, post_id: str):
    user = await require_auth(request)
    
    # Check if already liked
    existing = await db.post_likes.find_one({
        "post_id": post_id,
        "user_id": user["user_id"]
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Already liked this post")
    
    like_doc = {
        "post_id": post_id,
        "user_id": user["user_id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.post_likes.insert_one(like_doc)
    
    likes_count = await db.post_likes.count_documents({"post_id": post_id})
    
    return {"message": "Post liked", "liked": True, "likes_count": likes_count}

@api_router.delete("/social/like/{post_id}")
async def unlike_post(request: Request, post_id: str):
    user = await require_auth(request)
    
    result = await db.post_likes.delete_one({
        "post_id": post_id,
        "user_id": user["user_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Haven't liked this post")
    
    likes_count = await db.post_likes.count_documents({"post_id": post_id})
    
    return {"message": "Post unliked", "liked": False, "likes_count": likes_count}

# Comments
@api_router.post("/social/comment/{post_id}")
async def add_comment(request: Request, post_id: str):
    user = await require_auth(request)
    body = await request.json()
    
    content = body.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Comment cannot be empty")
    
    comment_id = f"cmt_{uuid.uuid4().hex[:12]}"
    comment_doc = {
        "comment_id": comment_id,
        "post_id": post_id,
        "user_id": user["user_id"],
        "user_name": user["name"],
        "user_image": user.get("picture"),
        "content": content,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "likes_count": 0
    }
    
    await db.post_comments.insert_one(comment_doc)
    
    # Return without _id
    comment_doc.pop("_id", None)
    
    return {"message": "Comment added", "comment": comment_doc}

@api_router.get("/social/comments/{post_id}")
async def get_comments(post_id: str, limit: int = Query(default=50, le=100)):
    comments = await db.post_comments.find(
        {"post_id": post_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {"comments": comments, "count": len(comments)}

@api_router.delete("/social/comment/{comment_id}")
async def delete_comment(request: Request, comment_id: str):
    user = await require_auth(request)
    
    result = await db.post_comments.delete_one({
        "comment_id": comment_id,
        "user_id": user["user_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found or not authorized")
    
    return {"message": "Comment deleted"}

# Shares
@api_router.post("/social/share/{post_id}")
async def share_post(request: Request, post_id: str):
    user = await get_current_user(request)
    body = await request.json()
    
    share_doc = {
        "share_id": f"shr_{uuid.uuid4().hex[:12]}",
        "post_id": post_id,
        "user_id": user["user_id"] if user else None,
        "platform": body.get("platform", "link"),  # twitter, facebook, linkedin, link
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.post_shares.insert_one(share_doc)
    
    shares_count = await db.post_shares.count_documents({"post_id": post_id})
    
    return {"message": "Share recorded", "shares_count": shares_count}

# =============== USER PROFILE ===============

@api_router.get("/users/{user_id}/profile")
async def get_user_profile(user_id: str, request: Request):
    current_user = await get_current_user(request)
    
    user = await db.users.find_one(
        {"user_id": user_id},
        {"_id": 0, "password": 0}
    )
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get follower/following counts
    followers_count = await db.follows.count_documents({"following_id": user_id})
    following_count = await db.follows.count_documents({"follower_id": user_id})
    
    # Check if current user is following
    is_following = False
    if current_user and current_user["user_id"] != user_id:
        existing = await db.follows.find_one({
            "follower_id": current_user["user_id"],
            "following_id": user_id
        })
        is_following = existing is not None
    
    # Get user's posts count (if they have any)
    posts_count = await db.user_posts.count_documents({"user_id": user_id})
    
    created_at = user.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    return {
        "user_id": user["user_id"],
        "name": user["name"],
        "email": user["email"],
        "phone": user.get("phone"),
        "picture": user.get("picture"),
        "bio": user.get("bio", ""),
        "location": user.get("location", ""),
        "website": user.get("website", ""),
        "created_at": created_at.isoformat() if created_at else None,
        "followers_count": followers_count,
        "following_count": following_count,
        "posts_count": posts_count,
        "is_following": is_following,
        "is_own_profile": current_user["user_id"] == user_id if current_user else False
    }

@api_router.put("/users/profile")
async def update_profile(request: Request):
    user = await require_auth(request)
    body = await request.json()
    
    # Fields that can be updated
    allowed_fields = ["name", "phone", "bio", "location", "website", "picture"]
    update_data = {k: v for k, v in body.items() if k in allowed_fields}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Return updated user
    updated_user = await db.users.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0, "password": 0}
    )
    
    return {"message": "Profile updated", "user": updated_user}

@api_router.put("/users/password")
async def change_password(request: Request):
    user = await require_auth(request)
    body = await request.json()
    
    current_password = body.get("current_password")
    new_password = body.get("new_password")
    
    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Both current and new password required")
    
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    
    # Get user with password
    full_user = await db.users.find_one({"user_id": user["user_id"]})
    
    if not full_user.get("password"):
        raise HTTPException(status_code=400, detail="OAuth users cannot change password")
    
    if not verify_password(current_password, full_user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Update password
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {
            "password": hash_password(new_password),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Password updated successfully"}

# =============== STORE (E-COMMERCE) ROUTES ===============

@api_router.get("/store/products")
async def get_products(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    limit: int = Query(default=12, le=50)
):
    products = [
        {
            "product_id": f"prod_{uuid.uuid4().hex[:8]}",
            "name": "Travel Backpack 40L",
            "description": "Durable, waterproof backpack perfect for extended travel.",
            "price": 129.99,
            "sale_price": 99.99,
            "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
            "images": ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"],
            "category": "Bags",
            "stock": 45,
            "rating": 4.7,
            "reviews_count": 128
        },
        {
            "product_id": f"prod_{uuid.uuid4().hex[:8]}",
            "name": "Noise Cancelling Headphones",
            "description": "Premium wireless headphones for peaceful travels.",
            "price": 249.99,
            "sale_price": None,
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
            "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
            "category": "Electronics",
            "stock": 32,
            "rating": 4.9,
            "reviews_count": 256
        },
        {
            "product_id": f"prod_{uuid.uuid4().hex[:8]}",
            "name": "Packing Cubes Set",
            "description": "Keep your luggage organized with this 6-piece packing cube set.",
            "price": 34.99,
            "sale_price": 24.99,
            "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
            "images": ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
            "category": "Accessories",
            "stock": 120,
            "rating": 4.5,
            "reviews_count": 89
        },
        {
            "product_id": f"prod_{uuid.uuid4().hex[:8]}",
            "name": "Travel Journal - Leather Bound",
            "description": "Document your adventures in this premium leather journal.",
            "price": 45.99,
            "sale_price": None,
            "image_url": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
            "images": ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"],
            "category": "Books",
            "stock": 78,
            "rating": 4.8,
            "reviews_count": 67
        },
        {
            "product_id": f"prod_{uuid.uuid4().hex[:8]}",
            "name": "Universal Travel Adapter",
            "description": "Works in 150+ countries with USB-C and USB-A ports.",
            "price": 39.99,
            "sale_price": 29.99,
            "image_url": "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800",
            "images": ["https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800"],
            "category": "Electronics",
            "stock": 200,
            "rating": 4.6,
            "reviews_count": 312
        },
        {
            "product_id": f"prod_{uuid.uuid4().hex[:8]}",
            "name": "Quick-Dry Travel Towel",
            "description": "Compact, super absorbent microfiber towel.",
            "price": 24.99,
            "sale_price": None,
            "image_url": "https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?w=800",
            "images": ["https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?w=800"],
            "category": "Accessories",
            "stock": 95,
            "rating": 4.4,
            "reviews_count": 54
        }
    ]
    
    if category:
        products = [p for p in products if category.lower() in p["category"].lower()]
    if min_price:
        products = [p for p in products if (p.get("sale_price") or p["price"]) >= min_price]
    if max_price:
        products = [p for p in products if (p.get("sale_price") or p["price"]) <= max_price]
    
    return {"products": products[:limit], "total": len(products)}

@api_router.get("/store/products/{product_id}")
async def get_product(product_id: str):
    return {
        "product_id": product_id,
        "name": "Travel Backpack 40L",
        "description": "Durable, waterproof backpack perfect for extended travel. Features include padded laptop compartment, multiple organization pockets, and comfortable ergonomic straps.",
        "price": 129.99,
        "sale_price": 99.99,
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
        "images": [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
            "https://images.unsplash.com/photo-1581605405669-fcdf81165bc0?w=800"
        ],
        "category": "Bags",
        "stock": 45,
        "rating": 4.7,
        "reviews_count": 128,
        "specifications": {
            "Capacity": "40 Liters",
            "Material": "Waterproof Nylon",
            "Weight": "1.2 kg",
            "Dimensions": "55 x 35 x 25 cm"
        }
    }

# =============== CART ROUTES ===============

@api_router.get("/cart")
async def get_cart(request: Request):
    user = await require_auth(request)
    cart = await db.carts.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not cart:
        return {"items": [], "total": 0}
    return cart

@api_router.post("/cart/add")
async def add_to_cart(request: Request, item: CartItem):
    user = await require_auth(request)
    
    cart = await db.carts.find_one({"user_id": user["user_id"]}, {"_id": 0})
    
    if not cart:
        cart = {
            "user_id": user["user_id"],
            "items": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    
    # Check if item already in cart
    existing_item = next((i for i in cart["items"] if i["product_id"] == item.product_id), None)
    
    if existing_item:
        existing_item["quantity"] += item.quantity
    else:
        cart["items"].append({"product_id": item.product_id, "quantity": item.quantity})
    
    cart["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.carts.update_one(
        {"user_id": user["user_id"]},
        {"$set": cart},
        upsert=True
    )
    
    return {"message": "Item added to cart", "items": cart["items"]}

@api_router.delete("/cart/remove/{product_id}")
async def remove_from_cart(request: Request, product_id: str):
    user = await require_auth(request)
    
    await db.carts.update_one(
        {"user_id": user["user_id"]},
        {"$pull": {"items": {"product_id": product_id}}}
    )
    
    return {"message": "Item removed from cart"}

@api_router.delete("/cart/clear")
async def clear_cart(request: Request):
    user = await require_auth(request)
    await db.carts.delete_one({"user_id": user["user_id"]})
    return {"message": "Cart cleared"}

# =============== STORE ORDERS ROUTES ===============

@api_router.post("/store/orders")
async def create_store_order(request: Request):
    user = await require_auth(request)
    body = await request.json()
    
    order_id = f"ord_{uuid.uuid4().hex[:12]}"
    order_doc = {
        "order_id": order_id,
        "user_id": user["user_id"],
        "items": body.get("items", []),
        "subtotal": body.get("subtotal", 0),
        "shipping": body.get("shipping", 0),
        "total": body.get("total", 0),
        "shipping_address": body.get("shipping_address", {}),
        "payment_method": body.get("payment_method", "stripe"),
        "wallet_used": body.get("wallet_used", 0),
        "status": "pending",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.store_orders.insert_one(order_doc)
    
    # If wallet was used, deduct from balance
    if body.get("wallet_used", 0) > 0:
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$inc": {"wallet_balance": -body["wallet_used"]}}
        )
        
        # Record wallet transaction
        wallet_tx = {
            "transaction_id": f"wtx_{uuid.uuid4().hex[:12]}",
            "user_id": user["user_id"],
            "amount": body["wallet_used"],
            "transaction_type": "debit",
            "description": f"Store order payment - {order_id}",
            "reference": order_id,
            "status": "completed",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.wallet_transactions.insert_one(wallet_tx)
    
    # Clear cart after order creation
    await db.carts.delete_one({"user_id": user["user_id"]})
    
    return {"order_id": order_id, "status": "pending", "message": "Order created successfully"}

@api_router.get("/store/orders")
async def get_store_orders(request: Request):
    user = await require_auth(request)
    
    orders = await db.store_orders.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {"orders": orders}

@api_router.get("/store/orders/{order_id}")
async def get_store_order(request: Request, order_id: str):
    user = await require_auth(request)
    
    order = await db.store_orders.find_one(
        {"order_id": order_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order

# =============== WALLET ROUTES ===============

@api_router.get("/wallet")
async def get_wallet(request: Request):
    user = await require_auth(request)
    
    user_data = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    transactions = await db.wallet_transactions.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    return {
        "balance": user_data.get("wallet_balance", 0.0),
        "transactions": transactions
    }

@api_router.post("/wallet/topup")
async def topup_wallet(request: Request, topup: WalletTopUp):
    user = await require_auth(request)
    
    if topup.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")
    
    # Create pending transaction
    transaction_id = f"wtx_{uuid.uuid4().hex[:12]}"
    transaction = {
        "transaction_id": transaction_id,
        "user_id": user["user_id"],
        "amount": topup.amount,
        "transaction_type": "credit",
        "description": f"Wallet top-up via {topup.payment_method}",
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.wallet_transactions.insert_one(transaction)
    
    # Return info for frontend to initiate payment
    return {
        "transaction_id": transaction_id,
        "amount": topup.amount,
        "payment_method": topup.payment_method,
        "status": "pending"
    }

# =============== BOOKINGS ROUTES ===============

@api_router.get("/bookings")
async def get_bookings(request: Request):
    user = await require_auth(request)
    
    bookings = await db.bookings.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"bookings": bookings}

@api_router.post("/bookings")
async def create_booking(request: Request, booking: BookingCreate):
    user = await require_auth(request)
    
    booking_id = f"bk_{uuid.uuid4().hex[:12]}"
    booking_doc = {
        "booking_id": booking_id,
        "user_id": user["user_id"],
        "booking_type": booking.booking_type,
        "item_id": booking.item_id,
        "item_details": booking.item_details,
        "total_amount": booking.total_amount,
        "status": "pending",
        "payment_status": "pending",
        "payment_method": booking.payment_method,
        "guest_info": booking.guest_info,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.bookings.insert_one(booking_doc)
    
    return {"booking_id": booking_id, "status": "pending", "message": "Booking created successfully"}

@api_router.get("/bookings/{booking_id}")
async def get_booking(request: Request, booking_id: str):
    user = await require_auth(request)
    
    booking = await db.bookings.find_one(
        {"booking_id": booking_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return booking

# =============== ITINERARY ROUTES ===============

@api_router.get("/itineraries")
async def get_itineraries(request: Request):
    user = await require_auth(request)
    
    itineraries = await db.itineraries.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {"itineraries": itineraries}

@api_router.post("/itineraries")
async def create_itinerary(request: Request):
    user = await require_auth(request)
    body = await request.json()
    
    itinerary_id = f"itn_{uuid.uuid4().hex[:12]}"
    itinerary_doc = {
        "itinerary_id": itinerary_id,
        "user_id": user["user_id"],
        "title": body.get("title", "My Trip"),
        "description": body.get("description"),
        "start_date": body.get("start_date"),
        "end_date": body.get("end_date"),
        "destinations": body.get("destinations", []),
        "days": body.get("days", []),
        "total_budget": body.get("total_budget"),
        "is_public": body.get("is_public", False),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.itineraries.insert_one(itinerary_doc)
    
    return {"itinerary_id": itinerary_id, "message": "Itinerary created successfully"}

@api_router.put("/itineraries/{itinerary_id}")
async def update_itinerary(request: Request, itinerary_id: str):
    user = await require_auth(request)
    body = await request.json()
    
    # Remove _id from update
    update_data = {k: v for k, v in body.items() if k != "_id" and k != "itinerary_id"}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.itineraries.update_one(
        {"itinerary_id": itinerary_id, "user_id": user["user_id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    
    return {"message": "Itinerary updated successfully"}

@api_router.delete("/itineraries/{itinerary_id}")
async def delete_itinerary(request: Request, itinerary_id: str):
    user = await require_auth(request)
    
    result = await db.itineraries.delete_one(
        {"itinerary_id": itinerary_id, "user_id": user["user_id"]}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    
    return {"message": "Itinerary deleted successfully"}

# =============== PAYMENT ROUTES (STRIPE) ===============

@api_router.post("/payments/stripe/checkout")
async def create_stripe_checkout(request: Request):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    
    body = await request.json()
    user = await get_current_user(request)
    
    stripe_api_key = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    # Get origin from request
    origin = body.get("origin_url", str(request.headers.get("origin", host_url)))
    
    amount = float(body.get("amount", 0))
    booking_type = body.get("booking_type", "general")
    booking_id = body.get("booking_id")
    
    success_url = f"{origin}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/payment/cancel"
    
    metadata = {
        "booking_type": booking_type,
        "booking_id": booking_id or "",
        "user_id": user["user_id"] if user else ""
    }
    
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction_doc = {
        "transaction_id": f"ptx_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"] if user else None,
        "amount": amount,
        "currency": "usd",
        "payment_method": "stripe",
        "session_id": session.session_id,
        "status": "pending",
        "payment_status": "initiated",
        "metadata": metadata,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payment_transactions.insert_one(transaction_doc)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/stripe/status/{session_id}")
async def get_stripe_status(session_id: str):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    stripe_api_key = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction in database
    update_data = {
        "status": status.status,
        "payment_status": status.payment_status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": update_data}
    )
    
    # If payment successful, update related booking/wallet
    if status.payment_status == "paid":
        transaction = await db.payment_transactions.find_one(
            {"session_id": session_id},
            {"_id": 0}
        )
        
        if transaction and transaction.get("metadata", {}).get("booking_type") == "wallet":
            # Credit wallet
            user_id = transaction.get("user_id")
            if user_id:
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$inc": {"wallet_balance": transaction["amount"]}}
                )
        elif transaction and transaction.get("metadata", {}).get("booking_id"):
            # Update booking status
            await db.bookings.update_one(
                {"booking_id": transaction["metadata"]["booking_id"]},
                {"$set": {"payment_status": "paid", "status": "confirmed"}}
            )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    stripe_api_key = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {
                    "status": "completed",
                    "payment_status": "paid",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
        
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error"}

# =============== GALLERY ROUTES ===============

@api_router.get("/gallery")
async def get_gallery(category: Optional[str] = None, limit: int = Query(default=20, le=50)):
    gallery_items = [
        {
            "id": f"gal_{uuid.uuid4().hex[:8]}",
            "type": "image",
            "url": "https://images.unsplash.com/photo-1653959747793-c7c3775665f0?w=800",
            "thumbnail": "https://images.unsplash.com/photo-1653959747793-c7c3775665f0?w=400",
            "title": "Tropical Paradise",
            "location": "Maldives",
            "category": "Beaches"
        },
        {
            "id": f"gal_{uuid.uuid4().hex[:8]}",
            "type": "image",
            "url": "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
            "thumbnail": "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400",
            "title": "African Safari",
            "location": "Serengeti",
            "category": "Wildlife"
        },
        {
            "id": f"gal_{uuid.uuid4().hex[:8]}",
            "type": "image",
            "url": "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800",
            "thumbnail": "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400",
            "title": "Northern Lights",
            "location": "Norway",
            "category": "Nature"
        },
        {
            "id": f"gal_{uuid.uuid4().hex[:8]}",
            "type": "image",
            "url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
            "thumbnail": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400",
            "title": "Tokyo Nights",
            "location": "Japan",
            "category": "Cities"
        },
        {
            "id": f"gal_{uuid.uuid4().hex[:8]}",
            "type": "image",
            "url": "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800",
            "thumbnail": "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400",
            "title": "Machu Picchu",
            "location": "Peru",
            "category": "Historical"
        },
        {
            "id": f"gal_{uuid.uuid4().hex[:8]}",
            "type": "image",
            "url": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800",
            "thumbnail": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400",
            "title": "Swiss Alps",
            "location": "Switzerland",
            "category": "Mountains"
        }
    ]
    
    if category:
        gallery_items = [g for g in gallery_items if category.lower() in g["category"].lower()]
    
    return {"items": gallery_items[:limit], "total": len(gallery_items)}

# =============== ADMIN ROUTES ===============

@api_router.get("/admin/stats")
async def get_admin_stats(request: Request):
    await require_admin(request)
    
    users_count = await db.users.count_documents({})
    bookings_count = await db.bookings.count_documents({})
    transactions_count = await db.payment_transactions.count_documents({})
    
    # Revenue calculation
    paid_transactions = await db.payment_transactions.find(
        {"payment_status": "paid"},
        {"_id": 0, "amount": 1}
    ).to_list(1000)
    
    total_revenue = sum(t.get("amount", 0) for t in paid_transactions)
    
    return {
        "users": users_count,
        "bookings": bookings_count,
        "transactions": transactions_count,
        "total_revenue": total_revenue
    }

@api_router.get("/admin/users")
async def get_admin_users(request: Request, limit: int = Query(default=50, le=100)):
    await require_admin(request)
    
    users = await db.users.find(
        {},
        {"_id": 0, "password": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {"users": users}

@api_router.get("/admin/bookings")
async def get_admin_bookings(request: Request, limit: int = Query(default=50, le=100)):
    await require_admin(request)
    
    bookings = await db.bookings.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {"bookings": bookings}

@api_router.put("/admin/bookings/{booking_id}/status")
async def update_booking_status(request: Request, booking_id: str):
    await require_admin(request)
    body = await request.json()
    
    status = body.get("status")
    if status not in ["pending", "confirmed", "cancelled", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.bookings.update_one(
        {"booking_id": booking_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {"message": "Booking status updated"}

# =============== DESTINATIONS (Featured) ===============

@api_router.get("/destinations/featured")
async def get_featured_destinations():
    destinations = [
        {
            "id": "dest_1",
            "name": "Maldives",
            "country": "Maldives",
            "description": "Paradise islands with crystal clear waters",
            "image_url": "https://images.unsplash.com/photo-1653959747793-c7c3775665f0?w=800",
            "rating": 4.9,
            "price_from": 299
        },
        {
            "id": "dest_2",
            "name": "Santorini",
            "country": "Greece",
            "description": "Iconic white buildings and stunning sunsets",
            "image_url": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800",
            "rating": 4.8,
            "price_from": 199
        },
        {
            "id": "dest_3",
            "name": "Bali",
            "country": "Indonesia",
            "description": "Tropical paradise with rich culture",
            "image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
            "rating": 4.7,
            "price_from": 149
        },
        {
            "id": "dest_4",
            "name": "Tokyo",
            "country": "Japan",
            "description": "Where tradition meets ultra-modern",
            "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
            "rating": 4.8,
            "price_from": 259
        },
        {
            "id": "dest_5",
            "name": "Dubai",
            "country": "UAE",
            "description": "Luxury, adventure, and innovation",
            "image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
            "rating": 4.6,
            "price_from": 189
        },
        {
            "id": "dest_6",
            "name": "Paris",
            "country": "France",
            "description": "The city of lights and romance",
            "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
            "rating": 4.7,
            "price_from": 179
        }
    ]
    
    return {"destinations": destinations}

# Health check endpoint
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "Travel & Tours API", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
