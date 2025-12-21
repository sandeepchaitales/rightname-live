import whois
import sys

domains = ["google.com", "dhsjkahdkjahsdkhsakjdh.com", "chaibunk.com"]

for d in domains:
    print(f"Checking {d}...")
    try:
        w = whois.whois(d)
        if w.domain_name:
            print(f"  -> TAKEN. {w.creation_date}")
        else:
            print(f"  -> AVAILABLE (Empty response)")
    except Exception as e:
        print(f"  -> AVAILABLE (Exception: {e})")
