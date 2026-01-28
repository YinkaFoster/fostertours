# JourneyQuest - Travel & Tours Application

## Problem Statement
Create a full-featured Travel and Tours web application with comprehensive travel booking features including flights, hotels, events, vehicle rentals, visa services, blog, gallery, e-commerce store, and wallet system.

## User Choices
- **Payment Integration**: Stripe, PayPal, Paystack (all three)
- **Authentication**: JWT + Google OAuth (both)
- **Admin Panel**: Yes
- **Design**: Light/Dark theme switchable
- **Data**: Mock data for demo (real API integration ready)

## Architecture

### Tech Stack
- **Frontend**: React 18 + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Payments**: Stripe (emergentintegrations), PayPal, Paystack

### API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | JWT login |
| `/api/auth/session` | POST | OAuth session exchange |
| `/api/auth/me` | GET | Get current user |
| `/api/flights/search` | POST | Search flights |
| `/api/hotels/search` | POST | Search hotels |
| `/api/events` | GET | List events |
| `/api/vehicles` | GET | List vehicles |
| `/api/visa-packages` | GET | List visa packages |
| `/api/blog/posts` | GET | List blog posts |
| `/api/store/products` | GET | List products |
| `/api/gallery` | GET | Gallery items |
| `/api/wallet` | GET | Wallet balance & transactions |
| `/api/wallet/topup` | POST | Top up wallet |
| `/api/bookings` | GET/POST | User bookings |
| `/api/itineraries` | GET/POST/PUT/DELETE | Itineraries |
| `/api/payments/stripe/checkout` | POST | Stripe checkout |
| `/api/admin/*` | Various | Admin endpoints |

## User Personas
1. **Traveler**: Searches and books flights, hotels, events
2. **Adventure Seeker**: Plans custom itineraries, books tours
3. **Shopper**: Purchases travel gear from e-commerce store
4. **Admin**: Manages listings, bookings, and content

## Core Requirements (Static)
- [x] User authentication (JWT + Google OAuth)
- [x] Flight booking search with filters
- [x] Hotel reservation with filters
- [x] Event/tour booking
- [x] Vehicle rental listings
- [x] Visa package services
- [x] Travel blog with categories
- [x] Photo/video gallery
- [x] E-commerce store
- [x] Wallet system with top-up
- [x] Stripe payment integration
- [x] Light/dark theme toggle
- [x] Responsive design

## What's Been Implemented

### January 28, 2025 - MVP Launch
- ✅ Landing page with hero, services, destinations, events, blog sections
- ✅ Navigation with theme toggle and cart icon
- ✅ Flight search page with filters (price, stops, airlines)
- ✅ Hotel search page with filters (price, rating, amenities)
- ✅ Events/experiences page with category filters
- ✅ Vehicle rental page with type filters
- ✅ Visa packages page with application flow
- ✅ Travel blog with featured articles
- ✅ Photo gallery with lightbox viewer
- ✅ E-commerce store with categories
- ✅ User authentication (JWT + Google OAuth)
- ✅ User dashboard with bookings/itineraries
- ✅ Wallet page with top-up (Stripe checkout)
- ✅ Payment success/cancel pages
- ✅ Stripe integration via emergentintegrations
- ✅ MongoDB integration for users/bookings/wallet

## Prioritized Backlog

### P0 - Critical
- ✅ All core pages implemented
- ✅ Authentication working
- ✅ Payment integration working

### P1 - High Priority
- [ ] Admin panel implementation
- [ ] Real flight/hotel API integration (Amadeus, Booking.com)
- [ ] PayPal payment integration
- [ ] Paystack payment integration
- [ ] Booking detail pages

### P2 - Medium Priority
- [ ] Itinerary builder with drag-and-drop
- [ ] Blog post detail page with comments
- [ ] Product detail page
- [ ] Cart & checkout flow
- [ ] Order history
- [ ] User profile settings

### P3 - Nice to Have
- [ ] Email notifications
- [ ] Push notifications
- [ ] Social sharing
- [ ] Reviews & ratings system
- [ ] Wishlist functionality
- [ ] Price alerts

## Next Tasks
1. Implement Admin Panel with dashboard, user management, booking management
2. Add PayPal and Paystack payment integrations
3. Create booking confirmation flow with email
4. Build itinerary drag-and-drop builder
5. Add real flight/hotel API integration
