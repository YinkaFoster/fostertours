#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta
import uuid

class TravelToursAPITester:
    def __init__(self, base_url="https://journeyquest-8.preview.emergentagent.com/api"):
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
            "origin_url": "https://journeyquest-8.preview.emergentagent.com"
        }
        
        return self.run_test("Stripe Checkout", "POST", "payments/stripe/checkout", 200, checkout_data)

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
        
        # Authentication tests
        self.test_user_registration()
        self.test_user_login()
        self.test_get_current_user()
        
        # Authenticated endpoints
        self.test_wallet_endpoint()
        self.test_bookings_endpoint()
        self.test_itineraries_endpoint()
        self.test_create_booking()
        
        # Payment tests
        self.test_stripe_checkout()
        
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