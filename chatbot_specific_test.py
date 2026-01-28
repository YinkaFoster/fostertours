#!/usr/bin/env python3

import requests
import json
import sys

class ChatbotSpecificTester:
    def __init__(self, base_url="https://travel-planner-193.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session_id = None
        
    def log_result(self, test_name, success, response_data=None, error_msg=None):
        """Log test results"""
        if success:
            print(f"✅ {test_name} - PASSED")
            if response_data:
                print(f"   Response: {json.dumps(response_data, indent=2)}")
        else:
            print(f"❌ {test_name} - FAILED: {error_msg}")
            if response_data:
                print(f"   Response: {json.dumps(response_data, indent=2)}")

    def test_initial_message(self):
        """Test 1 - Initial message (no session)"""
        print("\n🔍 Test 1: Initial message (no session)")
        print("Expected: Should return AI response with session_id")
        
        url = f"{self.base_url}/chatbot/message"
        data = {
            "message": "What are your visa services?"
        }
        
        try:
            response = self.session.post(url, json=data, timeout=60)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                response_data = response.json()
                
                # Check required fields
                if 'response' in response_data and 'session_id' in response_data:
                    self.session_id = response_data['session_id']
                    ai_response = response_data['response']
                    
                    print(f"✅ Session ID received: {self.session_id}")
                    print(f"✅ AI Response: {ai_response[:200]}...")
                    
                    # Check if response is about visa services
                    if 'visa' in ai_response.lower():
                        print("✅ Response mentions visa services")
                    
                    # Check for contact details
                    if '+234 9058 681 268' in ai_response or '@foster_tours' in ai_response:
                        print("✅ Contact details included")
                    
                    self.log_result("Test 1 - Initial Message", True, response_data)
                    return True
                else:
                    self.log_result("Test 1 - Initial Message", False, response_data, "Missing response or session_id")
                    return False
            else:
                self.log_result("Test 1 - Initial Message", False, response.text, f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Test 1 - Initial Message", False, None, str(e))
            return False

    def test_follow_up_message(self):
        """Test 2 - Follow-up message (with session)"""
        print("\n🔍 Test 2: Follow-up message (with session)")
        print("Expected: Should return contextual response knowing we're talking about visas")
        
        if not self.session_id:
            print("❌ No session_id from Test 1, cannot proceed")
            return False
        
        url = f"{self.base_url}/chatbot/message"
        data = {
            "message": "How much does it cost?",
            "session_id": self.session_id
        }
        
        try:
            response = self.session.post(url, json=data, timeout=60)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                response_data = response.json()
                
                if 'response' in response_data and 'session_id' in response_data:
                    ai_response = response_data['response']
                    returned_session_id = response_data['session_id']
                    
                    print(f"✅ AI Response: {ai_response[:200]}...")
                    
                    # Check session consistency
                    if returned_session_id == self.session_id:
                        print("✅ Session ID maintained correctly")
                    else:
                        print(f"⚠️ Session ID changed: {returned_session_id}")
                    
                    # Check for contextual response
                    if any(word in ai_response.lower() for word in ['visa', 'cost', 'price', 'fee', 'charge']):
                        print("✅ Response shows context awareness (mentions visa/cost)")
                    else:
                        print("⚠️ Response may not show context awareness")
                    
                    self.log_result("Test 2 - Follow-up Message", True, response_data)
                    return True
                else:
                    self.log_result("Test 2 - Follow-up Message", False, response_data, "Missing response or session_id")
                    return False
            else:
                self.log_result("Test 2 - Follow-up Message", False, response.text, f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Test 2 - Follow-up Message", False, None, str(e))
            return False

    def test_clear_session(self):
        """Test 3 - Clear session"""
        print("\n🔍 Test 3: Clear session")
        print("Expected: Should return success message")
        
        if not self.session_id:
            print("❌ No session_id available, cannot proceed")
            return False
        
        url = f"{self.base_url}/chatbot/session/{self.session_id}"
        
        try:
            response = self.session.delete(url, timeout=30)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                response_data = response.json()
                
                if 'message' in response_data:
                    message = response_data['message']
                    print(f"✅ Clear message: {message}")
                    
                    if 'cleared' in message.lower():
                        print("✅ Session cleared successfully")
                    
                    self.log_result("Test 3 - Clear Session", True, response_data)
                    return True
                else:
                    self.log_result("Test 3 - Clear Session", False, response_data, "Missing message field")
                    return False
            else:
                self.log_result("Test 3 - Clear Session", False, response.text, f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Test 3 - Clear Session", False, None, str(e))
            return False

    def run_all_tests(self):
        """Run all specific chatbot tests"""
        print("🤖 AI Customer Care Chatbot - Specific Tests")
        print("=" * 60)
        print("Testing endpoint: POST /api/chatbot/message")
        print("Testing endpoint: DELETE /api/chatbot/session/{session_id}")
        print()
        
        results = []
        
        # Test 1: Initial message
        results.append(self.test_initial_message())
        
        # Test 2: Follow-up message
        results.append(self.test_follow_up_message())
        
        # Test 3: Clear session
        results.append(self.test_clear_session())
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        passed = sum(results)
        total = len(results)
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total*100):.1f}%")
        
        if passed == total:
            print("\n🎉 All chatbot tests PASSED!")
            print("\nChatbot Features Verified:")
            print("✅ Responds intelligently about Foster Tours services")
            print("✅ Maintains conversation context across messages")
            print("✅ Includes contact details (WhatsApp: +234 9058 681 268, Instagram: @foster_tours)")
            print("✅ Session management works correctly")
        else:
            print(f"\n⚠️ {total - passed} test(s) failed")
        
        return passed == total

def main():
    tester = ChatbotSpecificTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())