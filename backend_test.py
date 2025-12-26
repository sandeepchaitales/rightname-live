import requests
import sys
import json
from datetime import datetime
import uuid

class BrandEvaluationTester:
    def __init__(self, base_url="https://nameverdict.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.session_cookies = None
        self.test_user_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        self.test_user_password = "TestPass123!"
        self.test_user_name = "Test User"
        self.test_report_id = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def test_api_health(self):
        """Test basic API health"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=30)
            success = response.status_code == 200
            details = f"Status: {response.status_code}, Response: {response.text[:100]}"
            self.log_test("API Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("API Health Check", False, str(e))
            return False

    def test_evaluate_endpoint_structure(self):
        """Test /api/evaluate endpoint with mock payload"""
        payload = {
            "brand_names": ["Astra"],
            "category": "Tech",
            "positioning": "Premium",
            "market_scope": "Multi-Country",
            "countries": ["USA"]
        }
        
        try:
            print(f"\n🔍 Testing /api/evaluate with payload: {json.dumps(payload, indent=2)}")
            response = requests.post(
                f"{self.api_url}/evaluate", 
                json=payload, 
                headers={'Content-Type': 'application/json'},
                timeout=120  # LLM calls can take time
            )
            
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"Response received, checking structure...")
                    
                    # Check required fields
                    required_fields = ["executive_summary", "brand_scores", "comparison_verdict"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test("Evaluate Endpoint - Structure", False, f"Missing fields: {missing_fields}")
                        return False
                    
                    # Check brand_scores structure
                    if not data["brand_scores"] or len(data["brand_scores"]) == 0:
                        self.log_test("Evaluate Endpoint - Structure", False, "No brand scores returned")
                        return False
                    
                    brand = data["brand_scores"][0]
                    brand_required = ["brand_name", "namescore", "verdict", "summary"]
                    brand_missing = [field for field in brand_required if field not in brand]
                    
                    if brand_missing:
                        self.log_test("Evaluate Endpoint - Structure", False, f"Missing brand fields: {brand_missing}")
                        return False
                    
                    # Check if Astra is in the response
                    astra_found = any(brand.get("brand_name") == "Astra" for brand in data["brand_scores"])
                    if not astra_found:
                        self.log_test("Evaluate Endpoint - Content", False, "Brand 'Astra' not found in response")
                        return False
                    
                    # Check if NameScore is present
                    astra_brand = next((brand for brand in data["brand_scores"] if brand.get("brand_name") == "Astra"), None)
                    if astra_brand and "namescore" not in astra_brand:
                        self.log_test("Evaluate Endpoint - NameScore", False, "NameScore not found for Astra")
                        return False
                    
                    print(f"✅ Found Astra with NameScore: {astra_brand.get('namescore', 'N/A')}")
                    self.log_test("Evaluate Endpoint - Structure", True, f"All required fields present, Astra NameScore: {astra_brand.get('namescore')}")
                    return True
                    
                except json.JSONDecodeError as e:
                    self.log_test("Evaluate Endpoint - JSON Parse", False, f"Invalid JSON response: {str(e)}")
                    return False
            else:
                error_msg = f"HTTP {response.status_code}: {response.text[:200]}"
                self.log_test("Evaluate Endpoint - HTTP Status", False, error_msg)
                return False
                
        except requests.exceptions.Timeout:
            self.log_test("Evaluate Endpoint - Timeout", False, "Request timed out after 120 seconds")
            return False
        except Exception as e:
            self.log_test("Evaluate Endpoint - Exception", False, str(e))
            return False

    def test_auth_register(self):
        """Test email/password registration"""
        payload = {
            "email": self.test_user_email,
            "password": self.test_user_password,
            "name": self.test_user_name
        }
        
        try:
            response = requests.post(
                f"{self.api_url}/auth/register",
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["user_id", "email", "name", "auth_type"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Auth Register - Response Structure", False, f"Missing fields: {missing_fields}")
                    return False
                
                if data["email"] != self.test_user_email.lower():
                    self.log_test("Auth Register - Email Match", False, f"Email mismatch: {data['email']} != {self.test_user_email.lower()}")
                    return False
                
                # Store cookies for subsequent requests
                self.session_cookies = response.cookies
                
                self.log_test("Auth Register", True, f"User registered: {data['user_id']}")
                return True
            else:
                error_msg = f"HTTP {response.status_code}: {response.text[:200]}"
                self.log_test("Auth Register", False, error_msg)
                return False
                
        except Exception as e:
            self.log_test("Auth Register", False, str(e))
            return False

    def test_auth_login_email(self):
        """Test email/password login"""
        payload = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        try:
            response = requests.post(
                f"{self.api_url}/auth/login/email",
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["user_id", "email", "name", "auth_type"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Auth Login Email - Response Structure", False, f"Missing fields: {missing_fields}")
                    return False
                
                if data["email"] != self.test_user_email.lower():
                    self.log_test("Auth Login Email - Email Match", False, f"Email mismatch: {data['email']} != {self.test_user_email.lower()}")
                    return False
                
                # Update cookies for subsequent requests
                self.session_cookies = response.cookies
                
                self.log_test("Auth Login Email", True, f"User logged in: {data['user_id']}")
                return True
            else:
                error_msg = f"HTTP {response.status_code}: {response.text[:200]}"
                self.log_test("Auth Login Email", False, error_msg)
                return False
                
        except Exception as e:
            self.log_test("Auth Login Email", False, str(e))
            return False

    def test_auth_me(self):
        """Test getting current user info"""
        try:
            response = requests.get(
                f"{self.api_url}/auth/me",
                cookies=self.session_cookies,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["user_id", "email", "name"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Auth Me - Response Structure", False, f"Missing fields: {missing_fields}")
                    return False
                
                self.log_test("Auth Me", True, f"Current user: {data['email']}")
                return True
            else:
                error_msg = f"HTTP {response.status_code}: {response.text[:200]}"
                self.log_test("Auth Me", False, error_msg)
                return False
                
        except Exception as e:
            self.log_test("Auth Me", False, str(e))
            return False

    def test_generate_report_with_auth(self):
        """Test generating a report while authenticated to get report_id"""
        payload = {
            "brand_names": ["AuthTestBrand"],
            "category": "Technology",
            "positioning": "Premium",
            "market_scope": "Multi-Country",
            "countries": ["USA"]
        }
        
        try:
            print(f"\n🔍 Testing /api/evaluate with auth to get report_id...")
            response = requests.post(
                f"{self.api_url}/evaluate", 
                json=payload, 
                headers={'Content-Type': 'application/json'},
                cookies=self.session_cookies,
                timeout=120  # LLM calls can take time
            )
            
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"Response keys: {list(data.keys())}")
                    
                    if "report_id" in data:
                        self.test_report_id = data["report_id"]
                        self.log_test("Generate Report with Auth", True, f"Report generated: {self.test_report_id}")
                        return True
                    else:
                        # Check if we can find report_id in nested structure
                        print(f"Full response structure: {json.dumps(data, indent=2)[:500]}...")
                        self.log_test("Generate Report with Auth", False, "No report_id in response")
                        return False
                        
                except json.JSONDecodeError as e:
                    self.log_test("Generate Report with Auth - JSON Parse", False, f"Invalid JSON: {str(e)}")
                    return False
            else:
                error_msg = f"HTTP {response.status_code}: {response.text[:200]}"
                self.log_test("Generate Report with Auth", False, error_msg)
                return False
                
        except Exception as e:
            self.log_test("Generate Report with Auth", False, str(e))
            return False

    def test_get_report_authenticated(self):
        """Test getting report while authenticated"""
        if not self.test_report_id:
            self.log_test("Get Report Authenticated", False, "No report_id available")
            return False
            
        try:
            response = requests.get(
                f"{self.api_url}/reports/{self.test_report_id}",
                cookies=self.session_cookies,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if "is_authenticated" not in data:
                    self.log_test("Get Report Authenticated - Auth Flag", False, "Missing is_authenticated field")
                    return False
                
                if not data["is_authenticated"]:
                    self.log_test("Get Report Authenticated - Auth Status", False, "is_authenticated is False")
                    return False
                
                # Check that we have full report data
                required_fields = ["executive_summary", "brand_scores"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Get Report Authenticated - Content", False, f"Missing fields: {missing_fields}")
                    return False
                
                self.log_test("Get Report Authenticated", True, f"Full report retrieved for authenticated user")
                return True
            else:
                error_msg = f"HTTP {response.status_code}: {response.text[:200]}"
                self.log_test("Get Report Authenticated", False, error_msg)
                return False
                
        except Exception as e:
            self.log_test("Get Report Authenticated", False, str(e))
            return False

    def test_get_report_unauthenticated(self):
        """Test getting report without authentication"""
        if not self.test_report_id:
            self.log_test("Get Report Unauthenticated", False, "No report_id available")
            return False
            
        try:
            # Make request without cookies
            response = requests.get(
                f"{self.api_url}/reports/{self.test_report_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if "is_authenticated" not in data:
                    self.log_test("Get Report Unauthenticated - Auth Flag", False, "Missing is_authenticated field")
                    return False
                
                if data["is_authenticated"]:
                    self.log_test("Get Report Unauthenticated - Auth Status", False, "is_authenticated is True (should be False)")
                    return False
                
                # Should still have basic report data
                required_fields = ["executive_summary", "brand_scores"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Get Report Unauthenticated - Content", False, f"Missing fields: {missing_fields}")
                    return False
                
                self.log_test("Get Report Unauthenticated", True, f"Report retrieved with is_authenticated=False")
                return True
            else:
                error_msg = f"HTTP {response.status_code}: {response.text[:200]}"
                self.log_test("Get Report Unauthenticated", False, error_msg)
                return False
                
        except Exception as e:
            self.log_test("Get Report Unauthenticated", False, str(e))
            return False

    def test_auth_logout(self):
        """Test logout functionality"""
        try:
            response = requests.post(
                f"{self.api_url}/auth/logout",
                cookies=self.session_cookies,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_test("Auth Logout", True, f"Logout successful: {data['message']}")
                    return True
                else:
                    self.log_test("Auth Logout", False, "No message in logout response")
                    return False
            else:
                error_msg = f"HTTP {response.status_code}: {response.text[:200]}"
                self.log_test("Auth Logout", False, error_msg)
                return False
                
        except Exception as e:
            self.log_test("Auth Logout", False, str(e))
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Backend API Tests...")
        print(f"Testing against: {self.base_url}")
        print(f"Test user email: {self.test_user_email}")
        
        # Test API health first
        if not self.test_api_health():
            print("❌ API health check failed, stopping tests")
            return False
        
        # Test main evaluate endpoint
        self.test_evaluate_endpoint_structure()
        
        # Test auth endpoints
        print("\n🔐 Testing Authentication Endpoints...")
        
        # Test registration
        if not self.test_auth_register():
            print("❌ Registration failed, skipping auth-dependent tests")
            return False
        
        # Test login (using same credentials)
        self.test_auth_login_email()
        
        # Test getting current user
        self.test_auth_me()
        
        # Test report generation with auth
        self.test_generate_report_with_auth()
        
        # Test report retrieval with auth
        self.test_get_report_authenticated()
        
        # Test report retrieval without auth
        self.test_get_report_unauthenticated()
        
        # Test logout
        self.test_auth_logout()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = BrandEvaluationTester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            "summary": {
                "tests_run": tester.tests_run,
                "tests_passed": tester.tests_passed,
                "success_rate": (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0
            },
            "results": tester.test_results,
            "timestamp": datetime.now().isoformat()
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())