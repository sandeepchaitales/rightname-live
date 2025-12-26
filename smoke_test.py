#!/usr/bin/env python3
"""
Smoke test for newly configured Emergent LLM key
This is a focused test for the review request to verify the new API key is working.
"""

import requests
import json
import sys
from datetime import datetime

def test_emergent_llm_key():
    """Test the newly configured Emergent LLM key with TestBrand"""
    
    base_url = "https://trademark-research.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    # Exact payload from review request
    payload = {
        "brand_names": ["TestBrand"],
        "category": "Technology", 
        "positioning": "Premium software solutions",
        "market_scope": "Multi-Country",
        "countries": ["USA"]
    }
    
    print("🔑 SMOKE TEST: Testing newly configured Emergent LLM key")
    print(f"🌐 Backend URL: {base_url}")
    print(f"📋 Test payload: {json.dumps(payload, indent=2)}")
    print("⏱️  Expected duration: 60-120 seconds due to real-time web searches")
    print("\n🚀 Starting test...")
    
    try:
        start_time = datetime.now()
        
        response = requests.post(
            f"{api_url}/evaluate",
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=180  # 3 minutes timeout
        )
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print(f"⏱️  Response time: {duration:.1f} seconds")
        print(f"📊 HTTP Status: {response.status_code}")
        
        # Check for budget exceeded error first
        if response.status_code == 402:
            print("❌ FAILED: Budget exceeded error - LLM key needs credits")
            print(f"Response: {response.text}")
            return False
        
        if response.status_code != 200:
            print(f"❌ FAILED: HTTP {response.status_code}")
            print(f"Response: {response.text[:500]}")
            
            # Check if error message contains budget-related keywords
            if any(keyword in response.text.lower() for keyword in ["budget", "exceeded", "credits", "quota"]):
                print("🚨 Budget-related error detected in response")
            return False
        
        # Parse JSON response
        try:
            data = response.json()
            print("✅ JSON response received successfully")
        except json.JSONDecodeError as e:
            print(f"❌ FAILED: Invalid JSON response - {str(e)}")
            print(f"Raw response: {response.text[:500]}")
            return False
        
        # Check for budget errors in response content
        response_str = json.dumps(data).lower()
        if any(keyword in response_str for keyword in ["budget exceeded", "quota exceeded", "credits"]):
            print("❌ FAILED: Budget exceeded error found in response content")
            return False
        
        print("✅ No budget errors detected")
        
        # Verify required fields
        required_fields = ["executive_summary", "brand_scores", "comparison_verdict"]
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            print(f"❌ FAILED: Missing required fields: {missing_fields}")
            return False
        
        print(f"✅ All required top-level fields present: {required_fields}")
        
        # Check brand_scores
        if not data.get("brand_scores") or len(data["brand_scores"]) == 0:
            print("❌ FAILED: No brand scores returned")
            return False
        
        brand = data["brand_scores"][0]
        
        # Verify brand name
        if brand.get("brand_name") != "TestBrand":
            print(f"❌ FAILED: Expected 'TestBrand', got '{brand.get('brand_name')}'")
            return False
        
        print("✅ Brand name matches: TestBrand")
        
        # Check name_score_index (NameScore)
        if "namescore" not in brand:
            print("❌ FAILED: namescore field missing")
            return False
        
        namescore = brand.get("namescore")
        if not isinstance(namescore, (int, float)) or not (0 <= namescore <= 100):
            print(f"❌ FAILED: Invalid namescore: {namescore} (should be 0-100)")
            return False
        
        print(f"✅ NameScore Index: {namescore}/100")
        
        # Check trademark_research
        if "trademark_research" not in brand:
            print("❌ FAILED: trademark_research field missing")
            return False
        
        tm_research = brand["trademark_research"]
        if not tm_research:
            print("❌ FAILED: trademark_research is null/empty")
            return False
        
        print("✅ Trademark research data present")
        
        # Check executive_summary
        exec_summary = data.get("executive_summary", "")
        if len(exec_summary) < 50:
            print(f"❌ FAILED: Executive summary too short: {len(exec_summary)} chars")
            return False
        
        print(f"✅ Executive summary: {len(exec_summary)} characters")
        
        # Check verdict
        if "verdict" not in brand:
            print("❌ FAILED: verdict field missing")
            return False
        
        verdict = brand.get("verdict", "")
        valid_verdicts = ["APPROVE", "CAUTION", "REJECT"]
        if verdict not in valid_verdicts:
            print(f"❌ FAILED: Invalid verdict: {verdict} (should be one of {valid_verdicts})")
            return False
        
        print(f"✅ Verdict: {verdict}")
        
        # Success summary
        print("\n🎉 SMOKE TEST PASSED!")
        print("=" * 50)
        print("✅ API responds successfully (no budget exceeded error)")
        print("✅ Response contains expected fields:")
        print(f"   - executive_summary: {len(exec_summary)} chars")
        print(f"   - name_score_index: {namescore}/100") 
        print(f"   - trademark_research: Present")
        print(f"   - verdict: {verdict}")
        print("✅ No LLM budget errors in response")
        print(f"✅ Response time: {duration:.1f} seconds")
        print("=" * 50)
        
        return True
        
    except requests.exceptions.Timeout:
        print("❌ FAILED: Request timed out after 180 seconds")
        return False
    except Exception as e:
        print(f"❌ FAILED: Exception occurred - {str(e)}")
        return False

def main():
    """Main function"""
    print("🔑 Emergent LLM Key Smoke Test")
    print("=" * 50)
    
    success = test_emergent_llm_key()
    
    if success:
        print("\n✅ SMOKE TEST RESULT: PASSED")
        print("The newly configured Emergent LLM key is working correctly!")
        return 0
    else:
        print("\n❌ SMOKE TEST RESULT: FAILED") 
        print("The newly configured Emergent LLM key has issues.")
        return 1

if __name__ == "__main__":
    sys.exit(main())