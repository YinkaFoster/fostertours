#!/usr/bin/env python3

import sys
sys.path.append('/app')

from backend_test import TravelToursAPITester

def main():
    print("🎫 Testing Seat Selection APIs Only")
    print("=" * 50)
    
    tester = TravelToursAPITester()
    
    # First login to get authentication token
    print("\n🔐 Getting authentication token...")
    admin_credentials = {
        "email": "admin@fostertours.com",
        "password": "Admin@Foster2024!"
    }
    
    success, response = tester.run_test("Admin Login", "POST", "auth/login", 200, admin_credentials)
    
    if success and response:
        tester.token = response.get('access_token')
        print(f"✅ Authentication successful")
        
        # Now run seat selection tests
        tester.run_seat_selection_tests()
        
        # Print final summary
        print(f"\n🎯 SEAT SELECTION TEST SUMMARY")
        print("=" * 50)
        print(f"Total Tests Run: {tester.tests_run}")
        print(f"Tests Passed: {tester.tests_passed}")
        print(f"Tests Failed: {len(tester.failed_tests)}")
        print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
        
        if tester.failed_tests:
            print(f"\n❌ Failed Tests:")
            for failed in tester.failed_tests:
                print(f"   • {failed['test']}: {failed['error']}")
        else:
            print(f"\n✅ All seat selection tests PASSED!")
    else:
        print("❌ Failed to authenticate")

if __name__ == "__main__":
    main()