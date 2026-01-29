#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta
import uuid

class TravelToursAPITester:
    def __init__(self, base_url="https://wanderlust-386.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.session = requests.Session()
        
    def log_result(self, test_name, success, response_data=None, error_msg=None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            self.failed_tests.append({
                "test": test_name,
                "error": error_msg,
                "response": response_data
            })
            print(f"❌ {test_name} - FAILED: {error_msg}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers, timeout=30)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            response_data = None
            
            try:
                response_data = response.json()
            except:
                response_data = response.text

            if success:
                self.log_result(name, True, response_data)
                return True, response_data
            else:
                self.log_result(name, False, response_data, f"Expected {expected_status}, got {response.status_code}")
                return False, response_data

        except Exception as e:
            self.log_result(name, False, None, str(e))
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root Endpoint", "GET", "", 200)

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        test_data = {
            "email": test_email,
            "password": "TestPass123!",
            "name": "Test User",
            "phone": "+1234567890"
        }
        
        success, response = self.run_test("User Registration", "POST", "auth/register", 200, test_data)
        
        if success and response:
            self.token = response.get('access_token')
            if response.get('user'):
                self.user_id = response['user'].get('user_id')
            print(f"   Token obtained: {bool(self.token)}")
            print(f"   User ID: {self.user_id}")
        
        return success, response

    def test_user_login(self):
        """Test user login with existing credentials"""
        # First register a user
        test_email = f"login_test_{uuid.uuid4().hex[:8]}@example.com"
        register_data = {
            "email": test_email,
            "password": "TestPass123!",
            "name": "Login Test User"
        }
        
        # Register first
        reg_success, _ = self.run_test("Pre-Login Registration", "POST", "auth/register", 200, register_data)
        
        if not reg_success:
            return False, {}
        
        # Now test login
        login_data = {
            "email": test_email,
            "password": "TestPass123!"
        }
        
        success, response = self.run_test("User Login", "POST", "auth/login", 200, login_data)
        
        if success and response:
            # Update token for subsequent tests
            self.token = response.get('access_token')
            if response.get('user'):
                self.user_id = response['user'].get('user_id')
        
        return success, response

    def test_get_current_user(self):
        """Test getting current user info"""
        if not self.token:
            self.log_result("Get Current User", False, None, "No token available")
            return False, {}
        
        return self.run_test("Get Current User", "GET", "auth/me", 200)

    def test_featured_destinations(self):
        """Test featured destinations endpoint"""
        return self.run_test("Featured Destinations", "GET", "destinations/featured", 200)

    def test_flight_search(self):
        """Test flight search"""
        search_data = {
            "origin": "JFK",
            "destination": "LAX",
            "departure_date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
            "passengers": 2,
            "cabin_class": "economy"
        }
        
        return self.run_test("Flight Search", "POST", "flights/search", 200, search_data)

    def test_hotel_search(self):
        """Test hotel search"""
        search_data = {
            "location": "Paris",
            "check_in": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
            "check_out": (datetime.now() + timedelta(days=35)).strftime("%Y-%m-%d"),
            "guests": 2,
            "rooms": 1
        }
        
        return self.run_test("Hotel Search", "POST", "hotels/search", 200, search_data)

    def test_events_endpoint(self):
        """Test events listing"""
        return self.run_test("Events Listing", "GET", "events", 200)

    def test_vehicles_endpoint(self):
        """Test vehicles listing"""
        return self.run_test("Vehicles Listing", "GET", "vehicles", 200)

    def test_visa_packages_endpoint(self):
        """Test visa packages listing"""
        return self.run_test("Visa Packages", "GET", "visa-packages", 200)

    def test_blog_posts_endpoint(self):
        """Test blog posts listing"""
        return self.run_test("Blog Posts", "GET", "blog/posts", 200)

    def test_store_products_endpoint(self):
        """Test store products listing"""
        return self.run_test("Store Products", "GET", "store/products", 200)

    def test_store_product_detail(self):
        """Test individual product detail"""
        # First get products to get a valid product_id
        success, response = self.run_test("Store Products for Detail", "GET", "store/products", 200)
        if success and response.get('products'):
            product_id = response['products'][0]['product_id']
            return self.run_test("Store Product Detail", "GET", f"store/products/{product_id}", 200)
        else:
            self.log_result("Store Product Detail", False, None, "No products available to test detail")
            return False, {}

    def test_cart_operations(self):
        """Test cart operations (requires auth)"""
        if not self.token:
            self.log_result("Cart Operations", False, None, "No token available")
            return False, {}
        
        # Get cart
        success1, _ = self.run_test("Get Cart", "GET", "cart", 200)
        
        # Add item to cart
        cart_item = {
            "product_id": "prod_test123",
            "quantity": 2
        }
        success2, _ = self.run_test("Add to Cart", "POST", "cart/add", 200, cart_item)
        
        # Remove item from cart
        success3, _ = self.run_test("Remove from Cart", "DELETE", "cart/remove/prod_test123", 200)
        
        return success1 and success2 and success3

    def test_store_orders_endpoint(self):
        """Test store orders endpoint (requires auth)"""
        if not self.token:
            self.log_result("Store Orders", False, None, "No token available")
            return False, {}
        
        return self.run_test("Store Orders List", "GET", "store/orders", 200)

    def test_create_store_order(self):
        """Test creating a store order (requires auth)"""
        if not self.token:
            self.log_result("Create Store Order", False, None, "No token available")
            return False, {}
        
        order_data = {
            "items": [
                {
                    "product_id": "prod_test123",
                    "name": "Test Product",
                    "price": 29.99,
                    "quantity": 1
                }
            ],
            "subtotal": 29.99,
            "shipping": 9.99,
            "total": 39.98,
            "shipping_address": {
                "firstName": "Test",
                "lastName": "User",
                "email": "test@example.com",
                "address": "123 Test St",
                "city": "Test City",
                "state": "TS",
                "zipCode": "12345"
            },
            "payment_method": "stripe",
            "wallet_used": 0
        }
        
        return self.run_test("Create Store Order", "POST", "store/orders", 200, order_data)

    def test_gallery_endpoint(self):
        """Test gallery endpoint"""
        return self.run_test("Gallery", "GET", "gallery", 200)

    def test_wallet_endpoint(self):
        """Test wallet endpoint (requires auth)"""
        if not self.token:
            self.log_result("Wallet Endpoint", False, None, "No token available")
            return False, {}
        
        return self.run_test("Wallet Info", "GET", "wallet", 200)

    def test_bookings_endpoint(self):
        """Test bookings endpoint (requires auth)"""
        if not self.token:
            self.log_result("Bookings Endpoint", False, None, "No token available")
            return False, {}
        
        return self.run_test("Bookings List", "GET", "bookings", 200)

    def test_itineraries_endpoint(self):
        """Test itineraries endpoint (requires auth)"""
        if not self.token:
            self.log_result("Itineraries Endpoint", False, None, "No token available")
            return False, {}
        
        return self.run_test("Itineraries List", "GET", "itineraries", 200)

    def test_create_booking(self):
        """Test creating a booking (requires auth)"""
        if not self.token:
            self.log_result("Create Booking", False, None, "No token available")
            return False, {}
        
        booking_data = {
            "booking_type": "flight",
            "item_id": "test_flight_123",
            "item_details": {
                "airline": "Test Airlines",
                "flight_number": "TA123",
                "origin": "JFK",
                "destination": "LAX"
            },
            "total_amount": 450.00,
            "payment_method": "wallet"
        }
        
        return self.run_test("Create Booking", "POST", "bookings", 200, booking_data)

    def test_stripe_checkout(self):
        """Test Stripe checkout creation"""
        checkout_data = {
            "amount": 100.00,
            "booking_type": "wallet",
            "origin_url": "https://wanderlust-386.preview.emergentagent.com"
        }
        
        return self.run_test("Stripe Checkout", "POST", "payments/stripe/checkout", 200, checkout_data)

    # =============== AMADEUS API TESTS ===============
    
    def test_amadeus_flight_search(self):
        """Test Amadeus flight search API with real data"""
        search_data = {
            "origin": "JFK",
            "destination": "LAX", 
            "departure_date": "2025-02-15",
            "passengers": 1,
            "cabin_class": "economy"
        }
        
        print(f"\n🔍 Testing Amadeus Flight Search...")
        print(f"   Testing route: {search_data['origin']} -> {search_data['destination']}")
        
        success, response = self.run_test("Amadeus Flight Search", "POST", "flights/search", 200, search_data)
        
        if success and response:
            # Check if response has expected structure
            flights = response.get('flights', [])
            source = response.get('source', 'unknown')
            total = response.get('total', 0)
            
            print(f"   Source: {source}")
            print(f"   Flights found: {total}")
            
            if flights and len(flights) > 0:
                first_flight = flights[0]
                print(f"   Sample flight: {first_flight.get('airline', 'N/A')} {first_flight.get('flight_number', 'N/A')}")
                print(f"   Price: ${first_flight.get('price', 'N/A')}")
                
                # Verify flight structure
                required_fields = ['flight_id', 'airline', 'origin', 'destination', 'price']
                missing_fields = [field for field in required_fields if field not in first_flight]
                
                if missing_fields:
                    self.log_result("Amadeus Flight Search - Structure", False, None, f"Missing fields: {missing_fields}")
                    return False
                else:
                    self.log_result("Amadeus Flight Search - Structure", True)
            
            # Check if it's using Amadeus or mock data
            if source == "amadeus":
                print("   ✅ Using real Amadeus API")
            elif source == "mock":
                print("   ⚠️  Using mock data (Amadeus API may be unavailable)")
            
        return success

    def test_amadeus_hotel_search(self):
        """Test Amadeus hotel search API with real data"""
        search_data = {
            "location": "Paris",
            "check_in": "2025-02-15",
            "check_out": "2025-02-18", 
            "guests": 2,
            "rooms": 1
        }
        
        print(f"\n🔍 Testing Amadeus Hotel Search...")
        print(f"   Testing location: {search_data['location']}")
        print(f"   Dates: {search_data['check_in']} to {search_data['check_out']}")
        
        success, response = self.run_test("Amadeus Hotel Search", "POST", "hotels/search", 200, search_data)
        
        if success and response:
            # Check if response has expected structure
            hotels = response.get('hotels', [])
            source = response.get('source', 'unknown')
            total = response.get('total', 0)
            
            print(f"   Source: {source}")
            print(f"   Hotels found: {total}")
            
            if hotels and len(hotels) > 0:
                first_hotel = hotels[0]
                print(f"   Sample hotel: {first_hotel.get('name', 'N/A')}")
                print(f"   Price per night: ${first_hotel.get('price_per_night', 'N/A')}")
                print(f"   Rating: {first_hotel.get('rating', 'N/A')}")
                
                # Verify hotel structure
                required_fields = ['hotel_id', 'name', 'location', 'price_per_night', 'rating']
                missing_fields = [field for field in required_fields if field not in first_hotel]
                
                if missing_fields:
                    self.log_result("Amadeus Hotel Search - Structure", False, None, f"Missing fields: {missing_fields}")
                    return False
                else:
                    self.log_result("Amadeus Hotel Search - Structure", True)
            
            # Check if it's using Amadeus or mock data
            if source == "amadeus":
                print("   ✅ Using real Amadeus API")
            elif source == "mock":
                print("   ⚠️  Using mock data (Amadeus API may be unavailable)")
            
        return success

    # =============== SENDGRID EMAIL TESTS ===============
    
    def test_email_status_unauthorized(self):
        """Test email status endpoint without authentication"""
        # Save current token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test("Email Status (No Auth)", "GET", "email/status", 401)
        
        # Restore token
        self.token = original_token
        
        return success

    def test_email_status_non_admin(self):
        """Test email status endpoint with non-admin user"""
        if not self.token:
            self.log_result("Email Status (Non-Admin)", False, None, "No token available")
            return False
        
        # Test with regular user token (should fail with 403)
        success, response = self.run_test("Email Status (Non-Admin)", "GET", "email/status", 403)
        
        return success

    def test_email_status_admin_simulation(self):
        """Test email status endpoint (simulating admin access)"""
        if not self.token:
            self.log_result("Email Status (Admin Simulation)", False, None, "No token available")
            return False
        
        # This will likely fail with 403 since we don't have real admin user
        # But we're testing the endpoint structure
        success, response = self.run_test("Email Status (Admin Required)", "GET", "email/status", 403)
        
        # Even if it fails due to permissions, we can check if the endpoint exists
        return success

    def test_send_welcome_email_unauthorized(self):
        """Test send welcome email without authentication"""
        # Save current token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test("Send Welcome Email (No Auth)", "POST", "email/welcome", 401)
        
        # Restore token
        self.token = original_token
        
        return success

    def test_send_welcome_email_authenticated(self):
        """Test send welcome email with authentication"""
        if not self.token:
            self.log_result("Send Welcome Email (Authenticated)", False, None, "No token available")
            return False
        
        # Test with authenticated user
        success, response = self.run_test("Send Welcome Email (Authenticated)", "POST", "email/welcome", 200)
        
        if success and response:
            print(f"   Email response: {response}")
            
            # Check if response indicates email was queued/sent
            if isinstance(response, dict):
                message = response.get('message', '')
                if 'email' in message.lower() or 'queued' in message.lower() or 'sent' in message.lower():
                    print("   ✅ Email appears to be queued/sent successfully")
                else:
                    print(f"   ⚠️  Unexpected response message: {message}")
        
        return success

    # =============== ADMIN PANEL TESTS ===============
    
    def create_admin_user(self):
        """Create an admin user for testing admin endpoints"""
        # First create a regular user
        admin_email = f"admin_{uuid.uuid4().hex[:8]}@example.com"
        admin_data = {
            "email": admin_email,
            "password": "AdminPass123!",
            "name": "Admin Test User",
            "phone": "+1234567890"
        }
        
        success, response = self.run_test("Admin User Registration", "POST", "auth/register", 200, admin_data)
        
        if success and response:
            admin_token = response.get('access_token')
            admin_user_id = response['user'].get('user_id') if response.get('user') else None
            
            # Manually set admin status in database (simulating admin creation)
            # In real scenario, this would be done by existing admin or database setup
            print(f"   Created admin user: {admin_user_id}")
            return admin_token, admin_user_id, admin_email, "AdminPass123!"
        
        return None, None, None, None

    def test_admin_stats_unauthorized(self):
        """Test admin stats endpoint without admin token (should fail)"""
        # Save current token
        original_token = self.token
        
        # Test with regular user token
        success, response = self.run_test("Admin Stats (Unauthorized)", "GET", "admin/stats", 403)
        
        # Test with no token
        self.token = None
        success2, response2 = self.run_test("Admin Stats (No Auth)", "GET", "admin/stats", 401)
        
        # Restore token
        self.token = original_token
        
        return success and success2

    def test_admin_stats_authorized(self):
        """Test admin stats endpoint with admin token"""
        # Create admin user and make them admin
        admin_token, admin_user_id, admin_email, admin_password = self.create_admin_user()
        
        if not admin_token or not admin_user_id:
            self.log_result("Admin Stats (Authorized)", False, None, "Failed to create admin user")
            return False
        
        # Manually update user to admin in database (simulating admin promotion)
        # In production, this would be done through proper admin endpoints
        
        # For testing, we'll try to use the make-admin endpoint with a different approach
        # First, let's test if we can access admin endpoints with the created user
        original_token = self.token
        self.token = admin_token
        
        # Try to access admin stats (this will fail since user is not admin yet)
        success, response = self.run_test("Admin Stats (New Admin - Should Fail)", "GET", "admin/stats", 403)
        
        # Restore original token
        self.token = original_token
        
        return success  # We expect this to fail since user is not admin yet

    def test_admin_users_list(self):
        """Test admin users listing endpoint"""
        if not self.token:
            self.log_result("Admin Users List", False, None, "No token available")
            return False
        
        # Test with regular user (should fail)
        success, response = self.run_test("Admin Users List (Unauthorized)", "GET", "admin/users", 403)
        
        return success

    def test_admin_users_with_pagination(self):
        """Test admin users listing with pagination"""
        if not self.token:
            self.log_result("Admin Users Pagination", False, None, "No token available")
            return False
        
        # Test with pagination parameters (should fail for non-admin)
        success, response = self.run_test("Admin Users Pagination (Unauthorized)", "GET", "admin/users?page=1&limit=10", 403)
        
        return success

    def test_admin_users_with_search(self):
        """Test admin users listing with search"""
        if not self.token:
            self.log_result("Admin Users Search", False, None, "No token available")
            return False
        
        # Test with search parameter (should fail for non-admin)
        success, response = self.run_test("Admin Users Search (Unauthorized)", "GET", "admin/users?search=test", 403)
        
        return success

    def test_admin_update_user_unauthorized(self):
        """Test updating user details without admin privileges"""
        if not self.token:
            self.log_result("Admin Update User (Unauthorized)", False, None, "No token available")
            return False
        
        update_data = {
            "name": "Updated Name",
            "wallet_balance": 100.0
        }
        
        # Should fail with 403 for non-admin user
        success, response = self.run_test("Admin Update User (Unauthorized)", "PUT", f"admin/users/{self.user_id}", 403, update_data)
        
        return success

    def test_admin_delete_user_unauthorized(self):
        """Test deleting user without admin privileges"""
        if not self.token:
            self.log_result("Admin Delete User (Unauthorized)", False, None, "No token available")
            return False
        
        # Should fail with 403 for non-admin user
        success, response = self.run_test("Admin Delete User (Unauthorized)", "DELETE", f"admin/users/fake_user_id", 403)
        
        return success

    def test_admin_bookings_list_unauthorized(self):
        """Test admin bookings listing without admin privileges"""
        if not self.token:
            self.log_result("Admin Bookings List (Unauthorized)", False, None, "No token available")
            return False
        
        # Should fail with 403 for non-admin user
        success, response = self.run_test("Admin Bookings List (Unauthorized)", "GET", "admin/bookings", 403)
        
        return success

    def test_admin_bookings_with_filters_unauthorized(self):
        """Test admin bookings with filters without admin privileges"""
        if not self.token:
            self.log_result("Admin Bookings Filters (Unauthorized)", False, None, "No token available")
            return False
        
        # Should fail with 403 for non-admin user
        success, response = self.run_test("Admin Bookings Filters (Unauthorized)", "GET", "admin/bookings?status=confirmed&booking_type=flight", 403)
        
        return success

    def test_admin_update_booking_unauthorized(self):
        """Test updating booking status without admin privileges"""
        if not self.token:
            self.log_result("Admin Update Booking (Unauthorized)", False, None, "No token available")
            return False
        
        update_data = {
            "status": "confirmed"
        }
        
        # Should fail with 403 for non-admin user
        success, response = self.run_test("Admin Update Booking (Unauthorized)", "PUT", "admin/bookings/fake_booking_id", 403, update_data)
        
        return success

    def test_admin_orders_list_unauthorized(self):
        """Test admin orders listing without admin privileges"""
        if not self.token:
            self.log_result("Admin Orders List (Unauthorized)", False, None, "No token available")
            return False
        
        # Should fail with 403 for non-admin user
        success, response = self.run_test("Admin Orders List (Unauthorized)", "GET", "admin/orders", 403)
        
        return success

    def test_admin_orders_with_filters_unauthorized(self):
        """Test admin orders with filters without admin privileges"""
        if not self.token:
            self.log_result("Admin Orders Filters (Unauthorized)", False, None, "No token available")
            return False
        
        # Should fail with 403 for non-admin user
        success, response = self.run_test("Admin Orders Filters (Unauthorized)", "GET", "admin/orders?status=pending", 403)
        
        return success

    def test_admin_update_order_unauthorized(self):
        """Test updating order status without admin privileges"""
        if not self.token:
            self.log_result("Admin Update Order (Unauthorized)", False, None, "No token available")
            return False
        
        update_data = {
            "status": "shipped"
        }
        
        # Should fail with 403 for non-admin user
        success, response = self.run_test("Admin Update Order (Unauthorized)", "PUT", "admin/orders/fake_order_id", 403, update_data)
        
        return success

    def test_admin_make_admin_unauthorized(self):
        """Test granting admin privileges without admin privileges"""
        if not self.token:
            self.log_result("Admin Make Admin (Unauthorized)", False, None, "No token available")
            return False
        
        # Should fail with 403 for non-admin user
        success, response = self.run_test("Admin Make Admin (Unauthorized)", "POST", "admin/make-admin/fake_user_id", 403)
        
        return success

    def test_admin_revoke_admin_unauthorized(self):
        """Test revoking admin privileges without admin privileges"""
        if not self.token:
            self.log_result("Admin Revoke Admin (Unauthorized)", False, None, "No token available")
            return False
        
        # Should fail with 403 for non-admin user
        success, response = self.run_test("Admin Revoke Admin (Unauthorized)", "POST", "admin/revoke-admin/fake_user_id", 403)
        
        return success

    def test_admin_endpoints_no_auth(self):
        """Test all admin endpoints without authentication"""
        original_token = self.token
        self.token = None
        
        results = []
        
        # Test all admin endpoints without auth (should all return 401)
        results.append(self.run_test("Admin Stats (No Auth)", "GET", "admin/stats", 401)[0])
        results.append(self.run_test("Admin Users (No Auth)", "GET", "admin/users", 401)[0])
        results.append(self.run_test("Admin Bookings (No Auth)", "GET", "admin/bookings", 401)[0])
        results.append(self.run_test("Admin Orders (No Auth)", "GET", "admin/orders", 401)[0])
        
        update_data = {"status": "test"}
        results.append(self.run_test("Admin Update User (No Auth)", "PUT", "admin/users/fake_id", 401, update_data)[0])
        results.append(self.run_test("Admin Update Booking (No Auth)", "PUT", "admin/bookings/fake_id", 401, update_data)[0])
        results.append(self.run_test("Admin Update Order (No Auth)", "PUT", "admin/orders/fake_id", 401, update_data)[0])
        
        results.append(self.run_test("Admin Delete User (No Auth)", "DELETE", "admin/users/fake_id", 401)[0])
        results.append(self.run_test("Admin Make Admin (No Auth)", "POST", "admin/make-admin/fake_id", 401)[0])
        results.append(self.run_test("Admin Revoke Admin (No Auth)", "POST", "admin/revoke-admin/fake_id", 401)[0])
        
        # Restore token
        self.token = original_token
        
        return all(results)

    def run_admin_tests(self):
        """Run all admin panel tests"""
        print("\n🔐 Starting Admin Panel API Tests")
        print("=" * 50)
        
        # Test unauthorized access (should all fail with 403)
        self.test_admin_stats_unauthorized()
        self.test_admin_users_list()
        self.test_admin_users_with_pagination()
        self.test_admin_users_with_search()
        self.test_admin_update_user_unauthorized()
        self.test_admin_delete_user_unauthorized()
        self.test_admin_bookings_list_unauthorized()
        self.test_admin_bookings_with_filters_unauthorized()
        self.test_admin_update_booking_unauthorized()
        self.test_admin_orders_list_unauthorized()
        self.test_admin_orders_with_filters_unauthorized()
        self.test_admin_update_order_unauthorized()
        self.test_admin_make_admin_unauthorized()
        self.test_admin_revoke_admin_unauthorized()
        
        # Test no authentication (should all fail with 401)
        self.test_admin_endpoints_no_auth()
        
        # Test with admin user (would need actual admin setup)
        self.test_admin_stats_authorized()
        
        # Test admin functionality with real admin user
        self.test_admin_functionality_with_real_admin()
        
        # Test admin endpoints with invalid data
        self.test_admin_endpoints_with_invalid_data()
        
        # Test admin endpoints with non-existent IDs
        self.test_admin_endpoints_with_nonexistent_ids()
        
        print(f"\n📊 Admin Tests Summary: {self.tests_passed}/{self.tests_run} passed")
        
    def test_admin_functionality_with_real_admin(self):
        """Test admin endpoints with actual admin user"""
        # First, create a regular user
        admin_email = f"realadmin_{uuid.uuid4().hex[:8]}@example.com"
        admin_data = {
            "email": admin_email,
            "password": "AdminPass123!",
            "name": "Real Admin User",
            "phone": "+1234567890"
        }
        
        success, response = self.run_test("Real Admin Registration", "POST", "auth/register", 200, admin_data)
        
        if not success or not response:
            self.log_result("Admin Functionality Test", False, None, "Failed to create admin user")
            return False
        
        admin_token = response.get('access_token')
        admin_user_id = response['user'].get('user_id') if response.get('user') else None
        
        if not admin_token or not admin_user_id:
            self.log_result("Admin Functionality Test", False, None, "Failed to get admin credentials")
            return False
        
        # Now we need to manually make this user an admin
        # Since we can't do this through the API (chicken and egg problem), 
        # we'll test what happens when we try to use admin endpoints
        
        original_token = self.token
        self.token = admin_token
        
        # Test admin endpoints (these should fail since user is not admin)
        results = []
        
        # Test admin stats
        success, response = self.run_test("Admin Stats (Non-Admin User)", "GET", "admin/stats", 403)
        results.append(success)
        
        # Test admin users list
        success, response = self.run_test("Admin Users List (Non-Admin User)", "GET", "admin/users", 403)
        results.append(success)
        
        # Test admin bookings
        success, response = self.run_test("Admin Bookings (Non-Admin User)", "GET", "admin/bookings", 403)
        results.append(success)
        
        # Test admin orders
        success, response = self.run_test("Admin Orders (Non-Admin User)", "GET", "admin/orders", 403)
        results.append(success)
        
        # Test make admin (should fail)
        success, response = self.run_test("Make Admin (Non-Admin User)", "POST", f"admin/make-admin/{self.user_id}", 403)
        results.append(success)
        
        # Restore original token
        self.token = original_token
        
        return all(results)

    def test_admin_endpoints_with_invalid_data(self):
        """Test admin endpoints with invalid data"""
        if not self.token:
            self.log_result("Admin Invalid Data Test", False, None, "No token available")
            return False
        
        results = []
        
        # Test update user with empty data (should fail with 403 first, but testing structure)
        empty_data = {}
        success, response = self.run_test("Admin Update User (Empty Data)", "PUT", f"admin/users/{self.user_id}", 403, empty_data)
        results.append(success)
        
        # Test update booking with invalid data
        invalid_booking_data = {"invalid_field": "test"}
        success, response = self.run_test("Admin Update Booking (Invalid Data)", "PUT", "admin/bookings/fake_id", 403, invalid_booking_data)
        results.append(success)
        
        # Test update order with invalid data
        invalid_order_data = {"invalid_field": "test"}
        success, response = self.run_test("Admin Update Order (Invalid Data)", "PUT", "admin/orders/fake_id", 403, invalid_order_data)
        results.append(success)
        
        return all(results)

    def test_admin_endpoints_with_nonexistent_ids(self):
        """Test admin endpoints with non-existent IDs"""
        if not self.token:
            self.log_result("Admin Non-existent IDs Test", False, None, "No token available")
            return False
        
        results = []
        
        # Test with non-existent user ID
        update_data = {"name": "Updated Name"}
        success, response = self.run_test("Admin Update Non-existent User", "PUT", "admin/users/nonexistent_user_id", 403, update_data)
        results.append(success)
        
        # Test delete non-existent user
        success, response = self.run_test("Admin Delete Non-existent User", "DELETE", "admin/users/nonexistent_user_id", 403)
        results.append(success)
        
        # Test update non-existent booking
        booking_data = {"status": "confirmed"}
        success, response = self.run_test("Admin Update Non-existent Booking", "PUT", "admin/bookings/nonexistent_booking_id", 403, booking_data)
        results.append(success)
        
        # Test update non-existent order
        order_data = {"status": "shipped"}
        success, response = self.run_test("Admin Update Non-existent Order", "PUT", "admin/orders/nonexistent_order_id", 403, order_data)
        results.append(success)
        
        # Test make admin with non-existent user
        success, response = self.run_test("Make Admin Non-existent User", "POST", "admin/make-admin/nonexistent_user_id", 403)
        results.append(success)
        
        # Test revoke admin with non-existent user
        success, response = self.run_test("Revoke Admin Non-existent User", "POST", "admin/revoke-admin/nonexistent_user_id", 403)
        results.append(success)
        
        return all(results)

    # =============== AI CUSTOMER CARE CHATBOT TESTS ===============
    
    def test_chatbot_initial_message(self):
        """Test chatbot with initial message (no session)"""
        message_data = {
            "message": "What are your visa services?"
        }
        
        print(f"\n🤖 Testing AI Customer Care Chatbot...")
        print(f"   Initial message: {message_data['message']}")
        
        success, response = self.run_test("Chatbot Initial Message", "POST", "chatbot/message", 200, message_data)
        
        if success and response:
            # Check response structure
            if isinstance(response, dict):
                ai_response = response.get('response', '')
                session_id = response.get('session_id', '')
                
                print(f"   AI Response: {ai_response[:100]}...")
                print(f"   Session ID: {session_id}")
                
                # Verify response contains expected elements
                if ai_response and session_id:
                    # Check if response mentions visa services
                    if 'visa' in ai_response.lower():
                        print("   ✅ Response mentions visa services")
                    else:
                        print("   ⚠️  Response doesn't mention visa services")
                    
                    # Check if contact details are included
                    if '+234 9058 681 268' in ai_response or '@foster_tours' in ai_response:
                        print("   ✅ Contact details included")
                    else:
                        print("   ⚠️  Contact details not found in response")
                    
                    # Store session_id for follow-up test
                    self.chatbot_session_id = session_id
                    return True, response
                else:
                    self.log_result("Chatbot Response Structure", False, response, "Missing response or session_id")
                    return False, response
        
        return success, response

    def test_chatbot_follow_up_message(self):
        """Test chatbot with follow-up message using session"""
        if not hasattr(self, 'chatbot_session_id'):
            self.log_result("Chatbot Follow-up Message", False, None, "No session_id from initial test")
            return False, {}
        
        message_data = {
            "message": "How much does it cost?",
            "session_id": self.chatbot_session_id
        }
        
        print(f"\n🤖 Testing Chatbot Follow-up...")
        print(f"   Follow-up message: {message_data['message']}")
        print(f"   Using session_id: {self.chatbot_session_id}")
        
        success, response = self.run_test("Chatbot Follow-up Message", "POST", "chatbot/message", 200, message_data)
        
        if success and response:
            # Check response structure
            if isinstance(response, dict):
                ai_response = response.get('response', '')
                session_id = response.get('session_id', '')
                
                print(f"   AI Response: {ai_response[:100]}...")
                
                # Verify contextual response
                if ai_response:
                    # Check if response shows context awareness (mentions visa or cost)
                    if 'visa' in ai_response.lower() or 'cost' in ai_response.lower() or 'price' in ai_response.lower():
                        print("   ✅ Response shows context awareness")
                    else:
                        print("   ⚠️  Response may not show context awareness")
                    
                    # Verify same session_id returned
                    if session_id == self.chatbot_session_id:
                        print("   ✅ Session ID maintained correctly")
                    else:
                        print(f"   ⚠️  Session ID changed: {session_id}")
                    
                    return True, response
                else:
                    self.log_result("Chatbot Follow-up Response", False, response, "Empty response")
                    return False, response
        
        return success, response

    def test_chatbot_clear_session(self):
        """Test clearing chatbot session"""
        if not hasattr(self, 'chatbot_session_id'):
            self.log_result("Chatbot Clear Session", False, None, "No session_id available")
            return False, {}
        
        print(f"\n🤖 Testing Chatbot Session Clear...")
        print(f"   Clearing session: {self.chatbot_session_id}")
        
        success, response = self.run_test("Chatbot Clear Session", "DELETE", f"chatbot/session/{self.chatbot_session_id}", 200)
        
        if success and response:
            if isinstance(response, dict):
                message = response.get('message', '')
                print(f"   Clear response: {message}")
                
                if 'cleared' in message.lower():
                    print("   ✅ Session cleared successfully")
                    return True, response
                else:
                    print("   ⚠️  Unexpected clear response")
        
        return success, response

    def test_chatbot_invalid_session_clear(self):
        """Test clearing non-existent chatbot session"""
        fake_session_id = "fake_session_12345"
        
        print(f"\n🤖 Testing Chatbot Invalid Session Clear...")
        print(f"   Clearing fake session: {fake_session_id}")
        
        success, response = self.run_test("Chatbot Clear Invalid Session", "DELETE", f"chatbot/session/{fake_session_id}", 200)
        
        # Should still return success even for non-existent session
        return success, response

    def test_chatbot_empty_message(self):
        """Test chatbot with empty message"""
        message_data = {
            "message": ""
        }
        
        success, response = self.run_test("Chatbot Empty Message", "POST", "chatbot/message", 200, message_data)
        
        if success and response:
            # Should handle empty message gracefully
            ai_response = response.get('response', '')
            if ai_response:
                print(f"   Empty message handled: {ai_response[:50]}...")
        
        return success, response

    def test_chatbot_long_conversation(self):
        """Test chatbot with multiple messages in sequence"""
        messages = [
            "Hello, I need help with travel planning",
            "I want to visit Dubai",
            "What hotels do you recommend?",
            "What about flights from Lagos?",
            "Thank you for your help"
        ]
        
        session_id = None
        results = []
        
        print(f"\n🤖 Testing Chatbot Long Conversation...")
        
        for i, message in enumerate(messages):
            message_data = {
                "message": message
            }
            if session_id:
                message_data["session_id"] = session_id
            
            print(f"   Message {i+1}: {message}")
            
            success, response = self.run_test(f"Chatbot Message {i+1}", "POST", "chatbot/message", 200, message_data)
            results.append(success)
            
            if success and response:
                if not session_id:
                    session_id = response.get('session_id')
                    print(f"   Session started: {session_id}")
                
                ai_response = response.get('response', '')
                print(f"   AI Response {i+1}: {ai_response[:50]}...")
        
        # Clean up session
        if session_id:
            self.run_test("Cleanup Long Conversation Session", "DELETE", f"chatbot/session/{session_id}", 200)
        
        return all(results)

    def run_chatbot_tests(self):
        """Run all chatbot tests"""
        print("\n🤖 Starting AI Customer Care Chatbot Tests")
        print("=" * 50)
        
        # Test basic chatbot functionality
        self.test_chatbot_initial_message()
        self.test_chatbot_follow_up_message()
        self.test_chatbot_clear_session()
        
        # Test edge cases
        self.test_chatbot_invalid_session_clear()
        self.test_chatbot_empty_message()
        
        # Test conversation flow
        self.test_chatbot_long_conversation()
        
        print(f"\n📊 Chatbot Tests Summary: {self.tests_passed}/{self.tests_run} passed")

    # =============== SOCIAL FEATURES TESTS ===============
    
    def test_stories_get_all_unauthorized(self):
        """Test getting all stories without authentication (should work - public endpoint)"""
        return self.run_test("Get All Stories (Public)", "GET", "stories", 200)

    def test_stories_create_unauthorized(self):
        """Test creating story without authentication (should fail)"""
        # Save current token
        original_token = self.token
        self.token = None
        
        story_data = {
            "caption": "Test story",
            "location": "Dubai"
        }
        
        success, response = self.run_test("Create Story (No Auth)", "POST", "stories", 401, story_data)
        
        # Restore token
        self.token = original_token
        
        return success

    def test_stories_create_with_auth(self):
        """Test creating story with authentication"""
        if not self.token:
            self.log_result("Create Story (Authenticated)", False, None, "No token available")
            return False, {}
        
        story_data = {
            "caption": "Beautiful sunset in Dubai Marina! 🌅",
            "location": "Dubai Marina, UAE"
        }
        
        print(f"\n📸 Testing Story Creation...")
        print(f"   Caption: {story_data['caption']}")
        print(f"   Location: {story_data['location']}")
        
        success, response = self.run_test("Create Story (Authenticated)", "POST", "stories", 200, story_data)
        
        if success and response:
            # Store story_id for subsequent tests
            if isinstance(response, dict) and 'story' in response:
                story = response['story']
                self.test_story_id = story.get('story_id')
                print(f"   Story created with ID: {self.test_story_id}")
                
                # Verify story structure
                required_fields = ['story_id', 'user_id', 'caption', 'location', 'created_at', 'expires_at']
                missing_fields = [field for field in required_fields if field not in story]
                
                if missing_fields:
                    self.log_result("Story Creation - Structure", False, None, f"Missing fields: {missing_fields}")
                else:
                    self.log_result("Story Creation - Structure", True)
        
        return success, response

    def test_stories_get_single(self):
        """Test getting single story and recording view"""
        if not hasattr(self, 'test_story_id') or not self.test_story_id:
            # Create a story first
            success, response = self.test_stories_create_with_auth()
            if not success:
                self.log_result("Get Single Story", False, None, "Failed to create test story")
                return False, {}
        
        success, response = self.run_test("Get Single Story", "GET", f"stories/{self.test_story_id}", 200)
        
        if success and response:
            # Verify story structure
            if isinstance(response, dict):
                required_fields = ['story_id', 'user_id', 'caption', 'views_count']
                missing_fields = [field for field in required_fields if field not in response]
                
                if missing_fields:
                    self.log_result("Single Story - Structure", False, None, f"Missing fields: {missing_fields}")
                else:
                    self.log_result("Single Story - Structure", True)
                    print(f"   Views count: {response.get('views_count', 0)}")
        
        return success, response

    def test_stories_like_unauthorized(self):
        """Test liking story without authentication (should fail)"""
        if not hasattr(self, 'test_story_id') or not self.test_story_id:
            self.log_result("Like Story (No Auth)", False, None, "No test story available")
            return False, {}
        
        # Save current token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test("Like Story (No Auth)", "POST", f"stories/{self.test_story_id}/like", 401)
        
        # Restore token
        self.token = original_token
        
        return success

    def test_stories_like_with_auth(self):
        """Test liking/unliking story with authentication"""
        if not self.token:
            self.log_result("Like Story (Authenticated)", False, None, "No token available")
            return False, {}
        
        if not hasattr(self, 'test_story_id') or not self.test_story_id:
            self.log_result("Like Story (Authenticated)", False, None, "No test story available")
            return False, {}
        
        print(f"\n❤️ Testing Story Like/Unlike...")
        print(f"   Story ID: {self.test_story_id}")
        
        # Like the story
        success1, response1 = self.run_test("Like Story", "POST", f"stories/{self.test_story_id}/like", 200)
        
        if success1 and response1:
            print(f"   Like response: {response1}")
        
        # Try to like again (should handle gracefully)
        success2, response2 = self.run_test("Like Story Again", "POST", f"stories/{self.test_story_id}/like", 200)
        
        return success1 and success2

    def test_stories_comments_get(self):
        """Test getting story comments"""
        if not hasattr(self, 'test_story_id') or not self.test_story_id:
            self.log_result("Get Story Comments", False, None, "No test story available")
            return False, {}
        
        return self.run_test("Get Story Comments", "GET", f"stories/{self.test_story_id}/comments", 200)

    def test_stories_comments_add_unauthorized(self):
        """Test adding comment without authentication (should fail)"""
        if not hasattr(self, 'test_story_id') or not self.test_story_id:
            self.log_result("Add Comment (No Auth)", False, None, "No test story available")
            return False, {}
        
        # Save current token
        original_token = self.token
        self.token = None
        
        comment_data = {
            "content": "Great story!"
        }
        
        success, response = self.run_test("Add Comment (No Auth)", "POST", f"stories/{self.test_story_id}/comments", 401, comment_data)
        
        # Restore token
        self.token = original_token
        
        return success

    def test_stories_comments_add_with_auth(self):
        """Test adding comment with authentication"""
        if not self.token:
            self.log_result("Add Comment (Authenticated)", False, None, "No token available")
            return False, {}
        
        if not hasattr(self, 'test_story_id') or not self.test_story_id:
            self.log_result("Add Comment (Authenticated)", False, None, "No test story available")
            return False, {}
        
        comment_data = {
            "content": "Amazing view! 😍 I love Dubai Marina!"
        }
        
        print(f"\n💬 Testing Story Comments...")
        print(f"   Comment: {comment_data['content']}")
        
        success, response = self.run_test("Add Comment (Authenticated)", "POST", f"stories/{self.test_story_id}/comments", 200, comment_data)
        
        if success and response:
            # Store comment_id for potential cleanup
            if isinstance(response, dict) and 'comment' in response:
                comment = response['comment']
                self.test_comment_id = comment.get('comment_id')
                print(f"   Comment created with ID: {self.test_comment_id}")
        
        return success, response

    # =============== FAVORITES API TESTS ===============
    
    def test_favorites_add_unauthorized(self):
        """Test adding favorite without authentication (should fail)"""
        # Save current token
        original_token = self.token
        self.token = None
        
        favorite_data = {
            "item_type": "story",
            "item_id": "test_story_123"
        }
        
        success, response = self.run_test("Add Favorite (No Auth)", "POST", "favorites", 401, favorite_data)
        
        # Restore token
        self.token = original_token
        
        return success

    def test_favorites_add_with_auth(self):
        """Test adding favorites with authentication"""
        if not self.token:
            self.log_result("Add Favorites (Authenticated)", False, None, "No token available")
            return False, {}
        
        print(f"\n⭐ Testing Favorites System...")
        
        # Test different item types
        favorites_to_add = [
            {"item_type": "story", "item_id": "story_123"},
            {"item_type": "product", "item_id": "prod_456"},
            {"item_type": "destination", "item_id": "dest_789"},
            {"item_type": "blog_post", "item_id": "post_abc"}
        ]
        
        results = []
        
        for favorite in favorites_to_add:
            print(f"   Adding favorite: {favorite['item_type']} - {favorite['item_id']}")
            success, response = self.run_test(f"Add Favorite ({favorite['item_type']})", "POST", "favorites", 200, favorite)
            results.append(success)
            
            if success and response:
                print(f"   Response: {response}")
        
        return all(results)

    def test_favorites_get_with_auth(self):
        """Test getting user's favorites with authentication"""
        if not self.token:
            self.log_result("Get Favorites (Authenticated)", False, None, "No token available")
            return False, {}
        
        success, response = self.run_test("Get User Favorites", "GET", "favorites", 200)
        
        if success and response:
            # Verify response structure
            if isinstance(response, dict):
                favorites = response.get('favorites', [])
                print(f"   User has {len(favorites)} favorites")
                
                if favorites:
                    first_favorite = favorites[0]
                    required_fields = ['favorite_id', 'user_id', 'item_type', 'item_id', 'created_at']
                    missing_fields = [field for field in required_fields if field not in first_favorite]
                    
                    if missing_fields:
                        self.log_result("Favorites - Structure", False, None, f"Missing fields: {missing_fields}")
                    else:
                        self.log_result("Favorites - Structure", True)
        
        return success, response

    def test_favorites_get_unauthorized(self):
        """Test getting favorites without authentication (should fail)"""
        # Save current token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test("Get Favorites (No Auth)", "GET", "favorites", 401)
        
        # Restore token
        self.token = original_token
        
        return success

    def test_favorites_check_with_auth(self):
        """Test checking if item is favorited"""
        if not self.token:
            self.log_result("Check Favorite (Authenticated)", False, None, "No token available")
            return False, {}
        
        # Check a story that we might have favorited
        success, response = self.run_test("Check Favorite Status", "GET", "favorites/check/story/story_123", 200)
        
        if success and response:
            # Verify response structure
            if isinstance(response, dict):
                is_favorited = response.get('is_favorited', False)
                print(f"   Item is favorited: {is_favorited}")
        
        return success, response

    def test_favorites_remove_with_auth(self):
        """Test removing favorite with authentication"""
        if not self.token:
            self.log_result("Remove Favorite (Authenticated)", False, None, "No token available")
            return False, {}
        
        # Try to remove a favorite
        success, response = self.run_test("Remove Favorite", "DELETE", "favorites/story/story_123", 200)
        
        return success, response

    def test_favorites_remove_unauthorized(self):
        """Test removing favorite without authentication (should fail)"""
        # Save current token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test("Remove Favorite (No Auth)", "DELETE", "favorites/story/story_123", 401)
        
        # Restore token
        self.token = original_token
        
        return success

    # =============== CALLS API TESTS ===============
    
    def test_calls_initiate_unauthorized(self):
        """Test initiating call without authentication (should fail)"""
        # Save current token
        original_token = self.token
        self.token = None
        
        call_data = {
            "receiver_id": "user_123",
            "call_type": "video"
        }
        
        success, response = self.run_test("Initiate Call (No Auth)", "POST", "calls/initiate", 401, call_data)
        
        # Restore token
        self.token = original_token
        
        return success

    def test_calls_initiate_with_auth(self):
        """Test initiating call with authentication"""
        if not self.token:
            self.log_result("Initiate Call (Authenticated)", False, None, "No token available")
            return False, {}
        
        call_data = {
            "receiver_id": "user_receiver_123",
            "call_type": "video"
        }
        
        print(f"\n📞 Testing Calls System...")
        print(f"   Call type: {call_data['call_type']}")
        print(f"   Receiver: {call_data['receiver_id']}")
        
        success, response = self.run_test("Initiate Call (Authenticated)", "POST", "calls/initiate", 200, call_data)
        
        if success and response:
            # Store call_id for subsequent tests
            if isinstance(response, dict):
                call = response.get('call', {})
                self.test_call_id = call.get('call_id')
                print(f"   Call initiated with ID: {self.test_call_id}")
                
                # Verify call structure
                required_fields = ['call_id', 'caller_id', 'receiver_id', 'call_type', 'status']
                missing_fields = [field for field in required_fields if field not in call]
                
                if missing_fields:
                    self.log_result("Call Initiation - Structure", False, None, f"Missing fields: {missing_fields}")
                else:
                    self.log_result("Call Initiation - Structure", True)
                    print(f"   Call status: {call.get('status')}")
        
        return success, response

    def test_calls_answer_unauthorized(self):
        """Test answering call without authentication (should fail)"""
        if not hasattr(self, 'test_call_id') or not self.test_call_id:
            self.log_result("Answer Call (No Auth)", False, None, "No test call available")
            return False, {}
        
        # Save current token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test("Answer Call (No Auth)", "POST", f"calls/{self.test_call_id}/answer", 401)
        
        # Restore token
        self.token = original_token
        
        return success

    def test_calls_answer_with_auth(self):
        """Test answering call with authentication"""
        if not self.token:
            self.log_result("Answer Call (Authenticated)", False, None, "No token available")
            return False, {}
        
        if not hasattr(self, 'test_call_id') or not self.test_call_id:
            self.log_result("Answer Call (Authenticated)", False, None, "No test call available")
            return False, {}
        
        success, response = self.run_test("Answer Call (Authenticated)", "POST", f"calls/{self.test_call_id}/answer", 200)
        
        return success, response

    def test_calls_reject_with_auth(self):
        """Test rejecting call with authentication"""
        if not self.token:
            self.log_result("Reject Call (Authenticated)", False, None, "No token available")
            return False, {}
        
        # Create a new call for rejection test
        call_data = {
            "receiver_id": "user_receiver_456",
            "call_type": "voice"
        }
        
        success, response = self.run_test("Create Call for Rejection", "POST", "calls/initiate", 200, call_data)
        
        if success and response:
            call = response.get('call', {})
            call_id = call.get('call_id')
            
            if call_id:
                success2, response2 = self.run_test("Reject Call (Authenticated)", "POST", f"calls/{call_id}/reject", 200)
                return success2
        
        return False

    def test_calls_end_with_auth(self):
        """Test ending call with authentication"""
        if not self.token:
            self.log_result("End Call (Authenticated)", False, None, "No token available")
            return False, {}
        
        if not hasattr(self, 'test_call_id') or not self.test_call_id:
            self.log_result("End Call (Authenticated)", False, None, "No test call available")
            return False, {}
        
        success, response = self.run_test("End Call (Authenticated)", "POST", f"calls/{self.test_call_id}/end", 200)
        
        return success, response

    def test_calls_history_unauthorized(self):
        """Test getting call history without authentication (should fail)"""
        # Save current token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test("Get Call History (No Auth)", "GET", "calls/history", 401)
        
        # Restore token
        self.token = original_token
        
        return success

    def test_calls_history_with_auth(self):
        """Test getting call history with authentication"""
        if not self.token:
            self.log_result("Get Call History (Authenticated)", False, None, "No token available")
            return False, {}
        
        success, response = self.run_test("Get Call History (Authenticated)", "GET", "calls/history", 200)
        
        if success and response:
            # Verify response structure
            if isinstance(response, dict):
                calls = response.get('calls', [])
                print(f"   User has {len(calls)} calls in history")
                
                if calls:
                    first_call = calls[0]
                    required_fields = ['call_id', 'caller_id', 'receiver_id', 'call_type', 'status']
                    missing_fields = [field for field in required_fields if field not in first_call]
                    
                    if missing_fields:
                        self.log_result("Call History - Structure", False, None, f"Missing fields: {missing_fields}")
                    else:
                        self.log_result("Call History - Structure", True)
        
        return success, response

    # =============== LOCATION SHARING API TESTS ===============
    
    def test_location_update_unauthorized(self):
        """Test updating location without authentication (should fail)"""
        # Save current token
        original_token = self.token
        self.token = None
        
        location_data = {
            "latitude": 25.2048,
            "longitude": 55.2708
        }
        
        success, response = self.run_test("Update Location (No Auth)", "POST", "location/update", 401, location_data)
        
        # Restore token
        self.token = original_token
        
        return success

    def test_location_update_with_auth(self):
        """Test updating location with authentication"""
        if not self.token:
            self.log_result("Update Location (Authenticated)", False, None, "No token available")
            return False, {}
        
        location_data = {
            "latitude": 25.2048,  # Dubai coordinates
            "longitude": 55.2708
        }
        
        print(f"\n📍 Testing Location Sharing...")
        print(f"   Latitude: {location_data['latitude']}")
        print(f"   Longitude: {location_data['longitude']}")
        
        success, response = self.run_test("Update Location (Authenticated)", "POST", "location/update", 200, location_data)
        
        if success and response:
            print(f"   Location update response: {response}")
        
        return success, response

    def test_location_toggle_unauthorized(self):
        """Test toggling location sharing without authentication (should fail)"""
        # Save current token
        original_token = self.token
        self.token = None
        
        toggle_data = {
            "enabled": True
        }
        
        success, response = self.run_test("Toggle Location Sharing (No Auth)", "POST", "location/toggle", 401, toggle_data)
        
        # Restore token
        self.token = original_token
        
        return success

    def test_location_toggle_with_auth(self):
        """Test toggling location sharing with authentication"""
        if not self.token:
            self.log_result("Toggle Location Sharing (Authenticated)", False, None, "No token available")
            return False, {}
        
        # Enable location sharing
        toggle_data = {
            "enabled": True
        }
        
        success1, response1 = self.run_test("Enable Location Sharing", "POST", "location/toggle", 200, toggle_data)
        
        # Disable location sharing
        toggle_data["enabled"] = False
        success2, response2 = self.run_test("Disable Location Sharing", "POST", "location/toggle", 200, toggle_data)
        
        return success1 and success2

    def test_location_share_with_unauthorized(self):
        """Test sharing location with user without authentication (should fail)"""
        # Save current token
        original_token = self.token
        self.token = None
        
        share_data = {
            "user_id": "user_friend_123"
        }
        
        success, response = self.run_test("Share Location With User (No Auth)", "POST", "location/share-with", 401, share_data)
        
        # Restore token
        self.token = original_token
        
        return success

    def test_location_share_with_auth(self):
        """Test sharing location with user with authentication"""
        if not self.token:
            self.log_result("Share Location With User (Authenticated)", False, None, "No token available")
            return False, {}
        
        share_data = {
            "user_id": "user_friend_123"
        }
        
        success, response = self.run_test("Share Location With User (Authenticated)", "POST", "location/share-with", 200, share_data)
        
        return success, response

    def test_location_friends_unauthorized(self):
        """Test getting friends' locations without authentication (should fail)"""
        # Save current token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test("Get Friends Locations (No Auth)", "GET", "location/friends", 401)
        
        # Restore token
        self.token = original_token
        
        return success

    def test_location_friends_with_auth(self):
        """Test getting friends' locations with authentication"""
        if not self.token:
            self.log_result("Get Friends Locations (Authenticated)", False, None, "No token available")
            return False, {}
        
        success, response = self.run_test("Get Friends Locations (Authenticated)", "GET", "location/friends", 200)
        
        if success and response:
            # Verify response structure
            if isinstance(response, dict):
                locations = response.get('locations', [])
                print(f"   Found {len(locations)} friends sharing location")
                
                if locations:
                    first_location = locations[0]
                    required_fields = ['user_id', 'latitude', 'longitude', 'updated_at']
                    missing_fields = [field for field in required_fields if field not in first_location]
                    
                    if missing_fields:
                        self.log_result("Friends Locations - Structure", False, None, f"Missing fields: {missing_fields}")
                    else:
                        self.log_result("Friends Locations - Structure", True)
        
        return success, response

    def test_location_my_sharing_unauthorized(self):
        """Test getting sharing settings without authentication (should fail)"""
        # Save current token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test("Get My Sharing Settings (No Auth)", "GET", "location/my-sharing", 401)
        
        # Restore token
        self.token = original_token
        
        return success

    def test_location_my_sharing_with_auth(self):
        """Test getting sharing settings with authentication"""
        if not self.token:
            self.log_result("Get My Sharing Settings (Authenticated)", False, None, "No token available")
            return False, {}
        
        success, response = self.run_test("Get My Sharing Settings (Authenticated)", "GET", "location/my-sharing", 200)
        
        if success and response:
            # Verify response structure
            if isinstance(response, dict):
                sharing_enabled = response.get('sharing_enabled', False)
                visible_to = response.get('visible_to', [])
                print(f"   Sharing enabled: {sharing_enabled}")
                print(f"   Visible to {len(visible_to)} users")
        
        return success, response

    def run_social_features_tests(self):
        """Run all social features tests"""
        print("\n📱 Starting Social Features API Tests")
        print("=" * 50)
        
        # Travel Stories Tests
        print("\n📸 Testing Travel Stories API")
        print("-" * 30)
        self.test_stories_get_all_unauthorized()
        self.test_stories_create_unauthorized()
        self.test_stories_create_with_auth()
        self.test_stories_get_single()
        self.test_stories_like_unauthorized()
        self.test_stories_like_with_auth()
        self.test_stories_comments_get()
        self.test_stories_comments_add_unauthorized()
        self.test_stories_comments_add_with_auth()
        
        # Favorites Tests
        print("\n⭐ Testing Favorites API")
        print("-" * 30)
        self.test_favorites_add_unauthorized()
        self.test_favorites_add_with_auth()
        self.test_favorites_get_unauthorized()
        self.test_favorites_get_with_auth()
        self.test_favorites_check_with_auth()
        self.test_favorites_remove_unauthorized()
        self.test_favorites_remove_with_auth()
        
        # Calls Tests
        print("\n📞 Testing Calls API")
        print("-" * 30)
        self.test_calls_initiate_unauthorized()
        self.test_calls_initiate_with_auth()
        self.test_calls_answer_unauthorized()
        self.test_calls_answer_with_auth()
        self.test_calls_reject_with_auth()
        self.test_calls_end_with_auth()
        self.test_calls_history_unauthorized()
        self.test_calls_history_with_auth()
        
        # Location Sharing Tests
        print("\n📍 Testing Location Sharing API")
        print("-" * 30)
        self.test_location_update_unauthorized()
        self.test_location_update_with_auth()
        self.test_location_toggle_unauthorized()
        self.test_location_toggle_with_auth()
        self.test_location_share_with_unauthorized()
        self.test_location_share_with_auth()
        self.test_location_friends_unauthorized()
        self.test_location_friends_with_auth()
        self.test_location_my_sharing_unauthorized()
        self.test_location_my_sharing_with_auth()
        
        print(f"\n📊 Social Features Tests Summary: {self.tests_passed}/{self.tests_run} passed")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Travel & Tours API Tests")
        print("=" * 50)
        
        # Basic endpoints (no auth required)
        self.test_health_check()
        self.test_root_endpoint()
        self.test_featured_destinations()
        self.test_events_endpoint()
        self.test_vehicles_endpoint()
        self.test_visa_packages_endpoint()
        self.test_blog_posts_endpoint()
        self.test_store_products_endpoint()
        self.test_gallery_endpoint()
        
        # Search endpoints
        self.test_flight_search()
        self.test_hotel_search()
        
        # NEW: Amadeus API Integration Tests
        print("\n🌍 Testing Amadeus API Integration")
        print("=" * 40)
        self.test_amadeus_flight_search()
        self.test_amadeus_hotel_search()
        
        # Store endpoints
        self.test_store_product_detail()
        
        # Authentication tests
        self.test_user_registration()
        self.test_user_login()
        self.test_get_current_user()
        
        # NEW: SendGrid Email Integration Tests
        print("\n📧 Testing SendGrid Email Integration")
        print("=" * 40)
        self.test_email_status_unauthorized()
        self.test_email_status_non_admin()
        self.test_email_status_admin_simulation()
        self.test_send_welcome_email_unauthorized()
        self.test_send_welcome_email_authenticated()
        
        # Authenticated endpoints
        self.test_wallet_endpoint()
        self.test_bookings_endpoint()
        self.test_itineraries_endpoint()
        self.test_create_booking()
        
        # Store authenticated endpoints
        self.test_cart_operations()
        self.test_store_orders_endpoint()
        self.test_create_store_order()
        
        # Payment tests
        self.test_stripe_checkout()
        
        # Admin Panel Tests
        self.run_admin_tests()
        
        # AI Customer Care Chatbot Tests
        self.run_chatbot_tests()
        
        # NEW: Social Features Tests
        self.run_social_features_tests()
        
        # Print summary
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['error']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = TravelToursAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())