from visibility import check_visibility
import sys

try:
    print("Testing visibility for 'Apple'...")
    res = check_visibility("Apple")
    print("Google:", res['google'][:3])
    print("Apps:", res['apps'][:3])
except Exception as e:
    print("Error:", e)
