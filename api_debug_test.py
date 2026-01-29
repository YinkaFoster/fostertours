#!/usr/bin/env python3

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

BASE_URL = "https://trip-planner-pro-6.preview.emergentagent.com/api"

def test_amadeus_integration():
    """Test Amadeus API integration with detailed debugging"""
    print("🔍 Testing Amadeus Integration...")
    
    # Test flight search
    flight_data = {
        "origin": "JFK",
        "destination": "LAX",
        "departure_date": "2025-02-15",
        "passengers": 1,
        "cabin_class": "economy"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/flights/search", json=flight_data, timeout=30)
        print(f"Flight Search Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Source: {data.get('source', 'unknown')}")
            print(f"Total flights: {data.get('total', 0)}")
            
            if data.get('flights'):
                first_flight = data['flights'][0]
                print(f"Sample flight: {first_flight.get('airline')} - ${first_flight.get('price')}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Flight search error: {e}")
    
    # Test hotel search
    hotel_data = {
        "location": "Paris",
        "check_in": "2025-02-15",
        "check_out": "2025-02-18",
        "guests": 2,
        "rooms": 1
    }
    
    try:
        response = requests.post(f"{BASE_URL}/hotels/search", json=hotel_data, timeout=30)
        print(f"\nHotel Search Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Source: {data.get('source', 'unknown')}")
            print(f"Total hotels: {data.get('total', 0)}")
            
            if data.get('hotels'):
                first_hotel = data['hotels'][0]
                print(f"Sample hotel: {first_hotel.get('name')} - ${first_hotel.get('price_per_night')}/night")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Hotel search error: {e}")

def test_email_integration():
    """Test SendGrid email integration"""
    print("\n📧 Testing SendGrid Integration...")
    
    # First register a user to get auth token
    user_data = {
        "email": f"emailtest_{os.urandom(4).hex()}@example.com",
        "password": "TestPass123!",
        "name": "Email Test User"
    }
    
    try:
        # Register user
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data, timeout=30)
        if response.status_code != 200:
            print(f"Registration failed: {response.text}")
            return
            
        auth_data = response.json()
        token = auth_data.get('access_token')
        
        if not token:
            print("No token received")
            return
            
        headers = {'Authorization': f'Bearer {token}'}
        
        # Test email status (should fail - requires admin)
        response = requests.get(f"{BASE_URL}/email/status", headers=headers, timeout=30)
        print(f"Email Status (Non-Admin): {response.status_code}")
        
        # Test send welcome email
        response = requests.post(f"{BASE_URL}/email/welcome", headers=headers, timeout=30)
        print(f"Send Welcome Email: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {data}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Email test error: {e}")

def test_direct_amadeus():
    """Test Amadeus API directly"""
    print("\n🌍 Testing Amadeus API Directly...")
    
    try:
        from amadeus import Client as AmadeusClient, ResponseError
        
        client = AmadeusClient(
            client_id=os.environ.get('AMADEUS_API_KEY'),
            client_secret=os.environ.get('AMADEUS_API_SECRET')
        )
        
        # Test with different airports
        test_routes = [
            ("NYC", "LAX"),
            ("LHR", "CDG"),
            ("JFK", "LHR")
        ]
        
        for origin, dest in test_routes:
            try:
                print(f"Testing route: {origin} -> {dest}")
                response = client.shopping.flight_offers_search.get(
                    originLocationCode=origin,
                    destinationLocationCode=dest,
                    departureDate='2025-02-15',
                    adults=1
                )
                print(f"  ✅ Success: {len(response.data)} flights found")
                break
            except ResponseError as e:
                print(f"  ❌ Error: {e}")
            except Exception as e:
                print(f"  ❌ Exception: {e}")
                
    except Exception as e:
        print(f"Direct Amadeus test error: {e}")

def test_direct_sendgrid():
    """Test SendGrid API directly"""
    print("\n📧 Testing SendGrid API Directly...")
    
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail, Email, To, Content
        
        sg = SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))
        
        # Test with a simple email
        message = Mail(
            from_email=Email('noreply@journeyquest.app', 'JourneyQuest'),
            to_emails=To('test@example.com'),
            subject='Test Email',
            html_content=Content("text/html", "<p>Test email content</p>")
        )
        
        response = sg.send(message)
        print(f"SendGrid Status: {response.status_code}")
        
        if response.status_code == 202:
            print("✅ SendGrid API working correctly")
        else:
            print(f"❌ SendGrid error: {response.body}")
            
    except Exception as e:
        print(f"Direct SendGrid test error: {e}")

if __name__ == "__main__":
    print("🚀 API Integration Debug Tests")
    print("=" * 50)
    
    test_amadeus_integration()
    test_email_integration()
    test_direct_amadeus()
    test_direct_sendgrid()