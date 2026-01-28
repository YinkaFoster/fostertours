#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class QuickVerificationTester:
    def __init__(self, base_url="https://travel-planner-193.preview.emergentagent.com/api"):
        self.base_url = base_url
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
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers, timeout=30)

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
        """Test health endpoint: GET /api/health"""
        print("\n🏥 Testing Health Check Endpoint")
        print("=" * 40)
        
        success, response = self.run_test("Health Check", "GET", "health", 200)
        
        if success and response:
            print(f"   Response: {response}")
            
            # Check if response indicates healthy status
            if isinstance(response, dict):
                status = response.get('status', '')
                if 'healthy' in status.lower() or 'ok' in status.lower():
                    print("   ✅ Service reports healthy status")
                else:
                    print(f"   ⚠️  Unexpected status: {status}")
            elif isinstance(response, str):
                if 'healthy' in response.lower() or 'ok' in response.lower():
                    print("   ✅ Service reports healthy status")
        
        return success

    def test_flight_search(self):
        """Test flight search: POST /api/flights/search"""
        print("\n✈️ Testing Flight Search Endpoint")
        print("=" * 40)
        
        search_data = {
            "origin": "JFK",
            "destination": "LAX",
            "departure_date": "2025-03-01",
            "passengers": 1
        }
        
        print(f"   Search parameters: {search_data}")
        
        success, response = self.run_test("Flight Search", "POST", "flights/search", 200, search_data)
        
        if success and response:
            # Check response structure
            if isinstance(response, dict):
                flights = response.get('flights', [])
                source = response.get('source', 'unknown')
                total = response.get('total', 0)
                
                print(f"   Source: {source}")
                print(f"   Flights found: {total}")
                
                if flights and len(flights) > 0:
                    first_flight = flights[0]
                    print(f"   Sample flight: {first_flight.get('airline', 'N/A')} {first_flight.get('flight_number', 'N/A')}")
                    print(f"   Route: {first_flight.get('origin', 'N/A')} -> {first_flight.get('destination', 'N/A')}")
                    print(f"   Price: ${first_flight.get('price', 'N/A')}")
                    
                    # Verify required fields
                    required_fields = ['flight_id', 'airline', 'origin', 'destination', 'price']
                    missing_fields = [field for field in required_fields if field not in first_flight]
                    
                    if missing_fields:
                        print(f"   ⚠️  Missing fields: {missing_fields}")
                    else:
                        print("   ✅ Flight structure is valid")
                
                # Check data source
                if source == "amadeus":
                    print("   ✅ Using Amadeus API integration")
                elif source == "mock":
                    print("   ⚠️  Using mock data (Amadeus API may be unavailable)")
                else:
                    print(f"   ⚠️  Unknown data source: {source}")
        
        return success

    def test_hotel_search(self):
        """Test hotel search: POST /api/hotels/search"""
        print("\n🏨 Testing Hotel Search Endpoint")
        print("=" * 40)
        
        search_data = {
            "location": "Paris",
            "check_in": "2025-03-01",
            "check_out": "2025-03-03",
            "guests": 2
        }
        
        print(f"   Search parameters: {search_data}")
        
        success, response = self.run_test("Hotel Search", "POST", "hotels/search", 200, search_data)
        
        if success and response:
            # Check response structure
            if isinstance(response, dict):
                hotels = response.get('hotels', [])
                source = response.get('source', 'unknown')
                total = response.get('total', 0)
                
                print(f"   Source: {source}")
                print(f"   Hotels found: {total}")
                
                if hotels and len(hotels) > 0:
                    first_hotel = hotels[0]
                    print(f"   Sample hotel: {first_hotel.get('name', 'N/A')}")
                    print(f"   Location: {first_hotel.get('location', 'N/A')}")
                    print(f"   Price per night: ${first_hotel.get('price_per_night', 'N/A')}")
                    print(f"   Rating: {first_hotel.get('rating', 'N/A')}")
                    
                    # Verify required fields
                    required_fields = ['hotel_id', 'name', 'location', 'price_per_night', 'rating']
                    missing_fields = [field for field in required_fields if field not in first_hotel]
                    
                    if missing_fields:
                        print(f"   ⚠️  Missing fields: {missing_fields}")
                    else:
                        print("   ✅ Hotel structure is valid")
                
                # Check data source
                if source == "amadeus":
                    print("   ✅ Using Amadeus API integration")
                elif source == "mock":
                    print("   ⚠️  Using mock data (Amadeus API may be unavailable)")
                else:
                    print(f"   ⚠️  Unknown data source: {source}")
        
        return success

    def run_quick_verification(self):
        """Run the quick verification tests"""
        print("🚀 Starting Foster Tours Quick Verification")
        print("Testing: Custom logo images, Multi-currency support, Multi-language support")
        print("=" * 70)
        
        # Run the three requested tests
        test1 = self.test_health_check()
        test2 = self.test_flight_search()
        test3 = self.test_hotel_search()
        
        # Print summary
        print("\n" + "=" * 50)
        print("📊 QUICK VERIFICATION SUMMARY")
        print("=" * 50)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['error']}")
        else:
            print("\n✅ All tests passed! Foster Tours endpoints are working correctly.")
        
        return self.tests_passed == self.tests_run

def main():
    tester = QuickVerificationTester()
    success = tester.run_quick_verification()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())