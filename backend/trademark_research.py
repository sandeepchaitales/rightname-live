"""
Trademark Research Module
========================
Performs comprehensive trademark research using web search and data aggregation
to identify real trademark conflicts, company registrations, and legal precedents.

Mimics Perplexity's approach:
1. Generate strategic search queries
2. Execute web searches
3. Extract structured conflict data
4. Synthesize findings into actionable intelligence
"""

import logging
import asyncio
import re
import json
import httpx
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field, asdict
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class TrademarkConflict:
    """Represents a discovered trademark conflict"""
    name: str
    source: str  # e.g., "IP India", "Tofler", "Web Search"
    conflict_type: str  # "trademark_application", "registered_company", "common_law", "international"
    application_number: Optional[str] = None
    status: Optional[str] = None  # "REGISTERED", "PENDING", "OBJECTED", "ABANDONED"
    owner: Optional[str] = None
    class_number: Optional[str] = None
    filing_date: Optional[str] = None
    similarity_score: Optional[str] = None  # "HIGH", "MEDIUM", "LOW"
    industry_overlap: Optional[str] = None
    geographic_overlap: Optional[str] = None
    risk_level: str = "MEDIUM"  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    details: Optional[str] = None
    url: Optional[str] = None


@dataclass
class CompanyConflict:
    """Represents a discovered company with similar name"""
    name: str
    cin: Optional[str] = None  # Corporate Identification Number
    status: str = "ACTIVE"  # "ACTIVE", "INACTIVE", "DISSOLVED"
    incorporation_date: Optional[str] = None
    industry: Optional[str] = None
    state: Optional[str] = None
    source: str = "Company Registry"
    overlap_analysis: Optional[str] = None
    risk_level: str = "MEDIUM"
    url: Optional[str] = None


@dataclass
class LegalPrecedent:
    """Represents a relevant legal case or precedent"""
    case_name: str
    court: Optional[str] = None
    year: Optional[str] = None
    relevance: str = ""  # Why this case is relevant
    outcome: Optional[str] = None
    key_principle: Optional[str] = None
    source: Optional[str] = None
    url: Optional[str] = None


@dataclass
class TrademarkResearchResult:
    """Complete trademark research findings"""
    brand_name: str
    industry: str
    category: str
    countries: List[str]
    research_timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    
    # Conflicts discovered
    trademark_conflicts: List[TrademarkConflict] = field(default_factory=list)
    company_conflicts: List[CompanyConflict] = field(default_factory=list)
    common_law_conflicts: List[Dict[str, Any]] = field(default_factory=list)
    
    # Legal analysis
    legal_precedents: List[LegalPrecedent] = field(default_factory=list)
    nice_classification: Optional[Dict[str, Any]] = None
    
    # Risk assessment
    overall_risk_score: int = 5  # 1-10
    registration_success_probability: int = 50  # 0-100%
    opposition_probability: int = 50  # 0-100%
    
    # Summary
    critical_conflicts_count: int = 0
    high_risk_conflicts_count: int = 0
    total_conflicts_found: int = 0
    
    # Raw search data for LLM synthesis
    search_results_summary: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "brand_name": self.brand_name,
            "industry": self.industry,
            "category": self.category,
            "countries": self.countries,
            "research_timestamp": self.research_timestamp,
            "trademark_conflicts": [asdict(c) for c in self.trademark_conflicts],
            "company_conflicts": [asdict(c) for c in self.company_conflicts],
            "common_law_conflicts": self.common_law_conflicts,
            "legal_precedents": [asdict(p) for p in self.legal_precedents],
            "nice_classification": self.nice_classification,
            "overall_risk_score": self.overall_risk_score,
            "registration_success_probability": self.registration_success_probability,
            "opposition_probability": self.opposition_probability,
            "critical_conflicts_count": self.critical_conflicts_count,
            "high_risk_conflicts_count": self.high_risk_conflicts_count,
            "total_conflicts_found": self.total_conflicts_found,
            "search_results_summary": self.search_results_summary
        }


# Nice Classification mapping for common categories
NICE_CLASSIFICATION = {
    "fashion": {"class": 25, "description": "Clothing, footwear, headgear"},
    "apparel": {"class": 25, "description": "Clothing, footwear, headgear"},
    "streetwear": {"class": 25, "description": "Clothing, footwear, headgear"},
    "clothing": {"class": 25, "description": "Clothing, footwear, headgear"},
    "footwear": {"class": 25, "description": "Clothing, footwear, headgear"},
    "jewelry": {"class": 14, "description": "Precious metals, jewelry, watches"},
    "cosmetics": {"class": 3, "description": "Cosmetics, cleaning preparations"},
    "skincare": {"class": 3, "description": "Cosmetics, cleaning preparations"},
    "beauty": {"class": 3, "description": "Cosmetics, cleaning preparations"},
    "software": {"class": 9, "description": "Scientific apparatus, computers, software"},
    "technology": {"class": 9, "description": "Scientific apparatus, computers, software"},
    "tech": {"class": 9, "description": "Scientific apparatus, computers, software"},
    "app": {"class": 9, "description": "Scientific apparatus, computers, software"},
    "saas": {"class": 42, "description": "Scientific and technological services"},
    "food": {"class": 29, "description": "Meat, fish, preserved foods"},
    "restaurant": {"class": 43, "description": "Food and drink services"},
    "cafe": {"class": 43, "description": "Food and drink services"},
    "beverages": {"class": 32, "description": "Beers, mineral waters, soft drinks"},
    "pharmaceutical": {"class": 5, "description": "Pharmaceuticals, medical preparations"},
    "pharma": {"class": 5, "description": "Pharmaceuticals, medical preparations"},
    "healthcare": {"class": 44, "description": "Medical and healthcare services"},
    "education": {"class": 41, "description": "Education, training, entertainment"},
    "edtech": {"class": 41, "description": "Education, training, entertainment"},
    "finance": {"class": 36, "description": "Insurance, financial affairs"},
    "fintech": {"class": 36, "description": "Insurance, financial affairs"},
    "banking": {"class": 36, "description": "Insurance, financial affairs"},
    "real estate": {"class": 36, "description": "Insurance, financial affairs, real estate"},
    "automotive": {"class": 12, "description": "Vehicles, apparatus for locomotion"},
    "toys": {"class": 28, "description": "Games, toys, sporting goods"},
    "gaming": {"class": 28, "description": "Games, toys, sporting goods"},
    "furniture": {"class": 20, "description": "Furniture, mirrors, picture frames"},
    "home decor": {"class": 20, "description": "Furniture, mirrors, picture frames"},
}


def get_nice_classification(category: str, industry: str = "") -> Dict[str, Any]:
    """Get Nice Classification for a category/industry"""
    search_terms = [category.lower(), industry.lower()]
    
    for term in search_terms:
        for key, value in NICE_CLASSIFICATION.items():
            if key in term or term in key:
                return {
                    "class_number": value["class"],
                    "class_description": value["description"],
                    "matched_term": key
                }
    
    # Default to Class 35 (Advertising, business management) if no match
    return {
        "class_number": 35,
        "class_description": "Advertising, business management, office functions",
        "matched_term": "general business"
    }


def generate_search_queries(brand_name: str, industry: str, category: str, countries: List[str]) -> List[Dict[str, str]]:
    """
    Generate strategic search queries for trademark research.
    Mimics Perplexity's query generation strategy.
    """
    queries = []
    
    # Get phonetic variants
    phonetic_variants = generate_phonetic_variants(brand_name)
    
    # Primary country (first in list)
    primary_country = countries[0] if countries else "India"
    
    # Batch 1: Direct trademark searches
    queries.extend([
        {
            "query": f'"{brand_name}" trademark registered {primary_country}',
            "purpose": "Find registered trademarks with exact name"
        },
        {
            "query": f'"{brand_name}" trademark application status',
            "purpose": "Find pending trademark applications"
        },
        {
            "query": f'{brand_name} trademark class {get_nice_classification(category, industry)["class_number"]}',
            "purpose": "Find trademarks in same Nice class"
        }
    ])
    
    # Batch 2: Brand/business searches
    queries.extend([
        {
            "query": f'"{brand_name}" brand {industry}',
            "purpose": "Find existing brands with same name in industry"
        },
        {
            "query": f'"{brand_name}" {category} company',
            "purpose": "Find companies operating with this name"
        },
        {
            "query": f'{brand_name} {category} existing brands competitors',
            "purpose": "Find market competitors with similar names"
        }
    ])
    
    # Batch 3: Company registry searches
    queries.extend([
        {
            "query": f'"{brand_name}" private limited company {primary_country}',
            "purpose": "Find registered companies"
        },
        {
            "query": f'site:tofler.in "{brand_name}"',
            "purpose": "Search Tofler company database"
        },
        {
            "query": f'site:zaubacorp.com "{brand_name}"',
            "purpose": "Search Zauba Corp company database"
        }
    ])
    
    # Batch 4: Phonetic similarity searches
    if phonetic_variants:
        variant_str = " OR ".join([f'"{v}"' for v in phonetic_variants[:3]])
        queries.append({
            "query": f'({variant_str}) trademark {primary_country} {industry}',
            "purpose": "Find phonetically similar trademarks"
        })
    
    # Batch 5: Legal precedent searches
    queries.extend([
        {
            "query": f'{primary_country} trademark phonetic similarity legal case {category}',
            "purpose": "Find relevant legal precedents"
        },
        {
            "query": f'trademark opposition {category} {primary_country} case law',
            "purpose": "Find opposition case precedents"
        }
    ])
    
    # Batch 6: International searches (if multiple countries)
    if len(countries) > 1:
        for country in countries[1:4]:  # Limit to first 4 countries
            queries.append({
                "query": f'"{brand_name}" trademark {country} {category}',
                "purpose": f"Find trademarks in {country}"
            })
    
    # Batch 7: Aggregator-specific searches
    queries.extend([
        {
            "query": f'site:trademarking.in "{brand_name}"',
            "purpose": "Search trademark aggregator"
        },
        {
            "query": f'site:ipindia.gov.in "{brand_name}"',
            "purpose": "Search IP India official site"
        }
    ])
    
    return queries


def generate_phonetic_variants(brand_name: str) -> List[str]:
    """Generate phonetic variants of a brand name for similarity searches"""
    variants = []
    name = brand_name.lower()
    
    # Common phonetic substitutions
    substitutions = [
        ("i", "ee"), ("i", "y"), ("ee", "i"),
        ("a", "ah"), ("a", "e"),
        ("c", "k"), ("k", "c"),
        ("ph", "f"), ("f", "ph"),
        ("s", "z"), ("z", "s"),
        ("x", "ks"), ("ks", "x"),
        ("ou", "u"), ("u", "ou"),
        ("oo", "u"), ("u", "oo"),
        ("ae", "e"), ("e", "ae"),
    ]
    
    for old, new in substitutions:
        if old in name:
            variants.append(name.replace(old, new, 1))
    
    # Add common suffixes/prefixes variants
    if name.endswith("a"):
        variants.append(name + "e")
        variants.append(name[:-1])
    if name.endswith("e"):
        variants.append(name + "a")
        variants.append(name[:-1])
    
    # Remove duplicates and the original
    variants = list(set([v for v in variants if v != name and v]))
    
    return variants[:5]  # Return top 5 variants


async def execute_web_search(query: str, timeout: int = 30) -> List[Dict[str, Any]]:
    """
    Execute a web search query.
    Uses DuckDuckGo search as a fallback-friendly option.
    """
    try:
        from duckduckgo_search import DDGS
        
        results = []
        with DDGS() as ddgs:
            search_results = list(ddgs.text(query, max_results=10))
            for r in search_results:
                results.append({
                    "title": r.get("title", ""),
                    "url": r.get("href", r.get("link", "")),
                    "snippet": r.get("body", r.get("snippet", "")),
                    "source": "DuckDuckGo"
                })
        
        return results
    
    except Exception as e:
        logger.warning(f"Web search failed for query '{query}': {str(e)}")
        return []


def extract_trademark_conflicts(search_results: List[Dict[str, Any]], brand_name: str) -> List[TrademarkConflict]:
    """Extract trademark conflict information from search results"""
    conflicts = []
    seen_names = set()
    
    for result in search_results:
        title = result.get("title", "").lower()
        snippet = result.get("snippet", "").lower()
        url = result.get("url", "")
        combined = f"{title} {snippet}"
        
        # Look for trademark application numbers (Indian format: 7 digits)
        app_numbers = re.findall(r'\b(\d{7})\b', combined)
        
        # Look for trademark status keywords
        status = None
        if "registered" in combined:
            status = "REGISTERED"
        elif "pending" in combined:
            status = "PENDING"
        elif "objected" in combined:
            status = "OBJECTED"
        elif "opposed" in combined:
            status = "OPPOSED"
        elif "abandoned" in combined:
            status = "ABANDONED"
        
        # Look for class numbers
        class_match = re.search(r'class\s*(\d{1,2})', combined)
        class_number = class_match.group(1) if class_match else None
        
        # Check if this result mentions the brand name or similar
        brand_lower = brand_name.lower()
        if brand_lower in combined or any(v in combined for v in generate_phonetic_variants(brand_name)):
            # Extract the conflicting name from title
            conflict_name = extract_brand_name_from_text(result.get("title", ""), brand_name)
            
            if conflict_name and conflict_name.lower() not in seen_names:
                seen_names.add(conflict_name.lower())
                
                # Determine source
                source = "Web Search"
                if "trademarking.in" in url:
                    source = "Trademarking.in"
                elif "ipindia" in url:
                    source = "IP India"
                elif "justia" in url:
                    source = "USPTO/Justia"
                
                # Determine risk level
                risk_level = "MEDIUM"
                if status == "REGISTERED":
                    risk_level = "HIGH"
                elif status == "PENDING":
                    risk_level = "MEDIUM"
                elif status == "OBJECTED":
                    risk_level = "LOW"
                
                conflicts.append(TrademarkConflict(
                    name=conflict_name,
                    source=source,
                    conflict_type="trademark_application",
                    application_number=app_numbers[0] if app_numbers else None,
                    status=status,
                    class_number=class_number,
                    risk_level=risk_level,
                    details=result.get("snippet", "")[:200],
                    url=url
                ))
    
    return conflicts


def extract_company_conflicts(search_results: List[Dict[str, Any]], brand_name: str) -> List[CompanyConflict]:
    """Extract company registration information from search results"""
    conflicts = []
    seen_companies = set()
    
    for result in search_results:
        title = result.get("title", "")
        snippet = result.get("snippet", "")
        url = result.get("url", "")
        combined = f"{title} {snippet}".lower()
        
        # Look for CIN (Corporate Identification Number) - Indian format
        cin_match = re.search(r'[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}', f"{title} {snippet}", re.IGNORECASE)
        
        # Look for company type indicators
        is_company = any(x in combined for x in [
            "private limited", "pvt ltd", "limited", "llp", 
            "incorporated", "company", "enterprises", "corporation"
        ])
        
        # Check if mentions the brand
        brand_lower = brand_name.lower()
        if (brand_lower in combined or any(v in combined for v in generate_phonetic_variants(brand_name))) and is_company:
            # Extract company name
            company_name = extract_company_name_from_text(title, brand_name)
            
            if company_name and company_name.lower() not in seen_companies:
                seen_companies.add(company_name.lower())
                
                # Determine source
                source = "Web Search"
                if "tofler.in" in url:
                    source = "Tofler"
                elif "zaubacorp" in url:
                    source = "Zauba Corp"
                elif "mca.gov.in" in url:
                    source = "MCA"
                
                # Extract state/location
                state = None
                indian_states = ["maharashtra", "delhi", "karnataka", "tamil nadu", "telangana", 
                               "gujarat", "west bengal", "rajasthan", "kerala", "andhra pradesh"]
                for s in indian_states:
                    if s in combined:
                        state = s.title()
                        break
                
                conflicts.append(CompanyConflict(
                    name=company_name,
                    cin=cin_match.group(0) if cin_match else None,
                    status="ACTIVE" if "active" in combined else "UNKNOWN",
                    industry=extract_industry_from_text(snippet),
                    state=state,
                    source=source,
                    risk_level="HIGH" if brand_lower in company_name.lower() else "MEDIUM",
                    url=url
                ))
    
    return conflicts


def extract_legal_precedents(search_results: List[Dict[str, Any]]) -> List[LegalPrecedent]:
    """Extract legal precedent information from search results"""
    precedents = []
    seen_cases = set()
    
    for result in search_results:
        title = result.get("title", "")
        snippet = result.get("snippet", "")
        url = result.get("url", "")
        combined = f"{title} {snippet}".lower()
        
        # Look for case indicators
        is_legal = any(x in combined for x in [
            " v ", " vs ", "case", "judgment", "court", "tribunal",
            "infringement", "passing off", "section 29", "trade marks act"
        ])
        
        if is_legal:
            # Extract case name (usually in format "X v Y" or "X vs Y")
            case_match = re.search(r'([A-Z][a-zA-Z\s]+)\s+(?:v|vs|versus)\.?\s+([A-Z][a-zA-Z\s]+)', title)
            
            if case_match:
                case_name = f"{case_match.group(1).strip()} v. {case_match.group(2).strip()}"
            else:
                case_name = title[:100]
            
            if case_name.lower() not in seen_cases:
                seen_cases.add(case_name.lower())
                
                # Determine court
                court = None
                if "supreme court" in combined:
                    court = "Supreme Court of India"
                elif "delhi" in combined and ("high court" in combined or "hc" in combined):
                    court = "Delhi High Court"
                elif "bombay" in combined and "high court" in combined:
                    court = "Bombay High Court"
                elif "high court" in combined:
                    court = "High Court"
                
                # Extract year
                year_match = re.search(r'\b(19|20)\d{2}\b', combined)
                year = year_match.group(0) if year_match else None
                
                precedents.append(LegalPrecedent(
                    case_name=case_name[:150],
                    court=court,
                    year=year,
                    relevance=snippet[:200],
                    source=url.split("/")[2] if url else "Unknown",
                    url=url
                ))
    
    return precedents[:5]  # Limit to top 5 precedents


def extract_brand_name_from_text(text: str, original_brand: str) -> Optional[str]:
    """Extract a brand/trademark name from text"""
    # Look for quoted names
    quoted = re.findall(r'"([^"]+)"', text)
    if quoted:
        return quoted[0]
    
    # Look for name patterns near trademark indicators
    patterns = [
        r'(\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+(?:trademark|brand|mark)',
        r'(?:trademark|brand|mark)\s+(\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1)
    
    # Fall back to returning a cleaned version of the original if found
    if original_brand.lower() in text.lower():
        return original_brand
    
    return None


def extract_company_name_from_text(text: str, original_brand: str) -> Optional[str]:
    """Extract a company name from text"""
    # Look for company name patterns
    patterns = [
        r'([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+(?:Private Limited|Pvt\.?\s*Ltd\.?|Limited|LLP|Inc\.?)',
        r'([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+(?:Enterprises|Corporation|Company)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0).strip()
    
    return None


def extract_industry_from_text(text: str) -> Optional[str]:
    """Extract industry information from text"""
    industries = {
        "fashion": ["fashion", "apparel", "clothing", "garment", "textile"],
        "technology": ["technology", "software", "tech", "it ", "digital"],
        "cosmetics": ["cosmetic", "beauty", "skincare", "personal care"],
        "food": ["food", "beverage", "restaurant", "cafe", "f&b"],
        "pharma": ["pharmaceutical", "pharma", "medicine", "drug", "healthcare"],
        "finance": ["finance", "banking", "investment", "fintech"],
        "education": ["education", "edtech", "learning", "training"],
    }
    
    text_lower = text.lower()
    for industry, keywords in industries.items():
        if any(kw in text_lower for kw in keywords):
            return industry.title()
    
    return None


def calculate_risk_scores(
    trademark_conflicts: List[TrademarkConflict],
    company_conflicts: List[CompanyConflict],
    common_law_conflicts: List[Dict]
) -> Dict[str, int]:
    """Calculate overall risk scores based on discovered conflicts"""
    
    # Count conflicts by severity
    critical_count = sum(1 for c in trademark_conflicts if c.risk_level == "CRITICAL")
    critical_count += sum(1 for c in company_conflicts if c.risk_level == "CRITICAL")
    
    high_count = sum(1 for c in trademark_conflicts if c.risk_level == "HIGH")
    high_count += sum(1 for c in company_conflicts if c.risk_level == "HIGH")
    
    medium_count = sum(1 for c in trademark_conflicts if c.risk_level == "MEDIUM")
    medium_count += sum(1 for c in company_conflicts if c.risk_level == "MEDIUM")
    
    total_conflicts = len(trademark_conflicts) + len(company_conflicts) + len(common_law_conflicts)
    
    # Calculate overall risk score (1-10)
    if critical_count > 0:
        overall_risk = min(10, 8 + critical_count)
    elif high_count > 0:
        overall_risk = min(9, 5 + high_count)
    elif medium_count > 0:
        overall_risk = min(6, 3 + medium_count)
    else:
        overall_risk = max(1, min(3, total_conflicts))
    
    # Calculate registration success probability
    if critical_count > 0:
        success_prob = max(10, 30 - (critical_count * 10))
    elif high_count > 0:
        success_prob = max(30, 60 - (high_count * 10))
    elif medium_count > 0:
        success_prob = max(50, 80 - (medium_count * 5))
    else:
        success_prob = min(90, 85 + (5 if total_conflicts == 0 else 0))
    
    # Calculate opposition probability
    if critical_count > 0 or high_count > 1:
        opposition_prob = min(90, 60 + (critical_count * 15) + (high_count * 10))
    elif high_count == 1:
        opposition_prob = 50
    elif medium_count > 0:
        opposition_prob = min(40, 20 + (medium_count * 5))
    else:
        opposition_prob = 10
    
    return {
        "overall_risk_score": overall_risk,
        "registration_success_probability": success_prob,
        "opposition_probability": opposition_prob,
        "critical_conflicts_count": critical_count,
        "high_risk_conflicts_count": high_count,
        "total_conflicts_found": total_conflicts
    }


async def conduct_trademark_research(
    brand_name: str,
    industry: str,
    category: str,
    countries: List[str]
) -> TrademarkResearchResult:
    """
    Conduct comprehensive trademark research for a brand name.
    
    This function:
    1. Generates strategic search queries
    2. Executes web searches in parallel
    3. Extracts structured conflict data
    4. Calculates risk scores
    5. Returns a comprehensive research result
    """
    logger.info(f"Starting trademark research for '{brand_name}' in {industry}/{category}")
    
    # Initialize result
    result = TrademarkResearchResult(
        brand_name=brand_name,
        industry=industry or "General",
        category=category or "General",
        countries=countries or ["India"]
    )
    
    # Get Nice Classification
    result.nice_classification = get_nice_classification(category, industry)
    
    # Generate search queries
    queries = generate_search_queries(brand_name, industry, category, countries)
    logger.info(f"Generated {len(queries)} search queries")
    
    # Execute searches in parallel (batch of 5 at a time to avoid rate limiting)
    all_search_results = []
    batch_size = 5
    
    for i in range(0, len(queries), batch_size):
        batch = queries[i:i + batch_size]
        tasks = [execute_web_search(q["query"]) for q in batch]
        
        try:
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for j, results in enumerate(batch_results):
                if isinstance(results, Exception):
                    logger.warning(f"Search failed: {str(results)}")
                    continue
                
                query_info = batch[j]
                for r in results:
                    r["query_purpose"] = query_info["purpose"]
                all_search_results.extend(results if not isinstance(results, Exception) else [])
        
        except Exception as e:
            logger.error(f"Batch search failed: {str(e)}")
        
        # Small delay between batches
        if i + batch_size < len(queries):
            await asyncio.sleep(1)
    
    logger.info(f"Collected {len(all_search_results)} search results")
    
    # Extract conflicts from search results
    result.trademark_conflicts = extract_trademark_conflicts(all_search_results, brand_name)
    result.company_conflicts = extract_company_conflicts(all_search_results, brand_name)
    result.legal_precedents = extract_legal_precedents(all_search_results)
    
    # Extract common law conflicts (businesses operating without formal trademark)
    result.common_law_conflicts = extract_common_law_conflicts(all_search_results, brand_name, industry)
    
    # Calculate risk scores
    risk_scores = calculate_risk_scores(
        result.trademark_conflicts,
        result.company_conflicts,
        result.common_law_conflicts
    )
    
    result.overall_risk_score = risk_scores["overall_risk_score"]
    result.registration_success_probability = risk_scores["registration_success_probability"]
    result.opposition_probability = risk_scores["opposition_probability"]
    result.critical_conflicts_count = risk_scores["critical_conflicts_count"]
    result.high_risk_conflicts_count = risk_scores["high_risk_conflicts_count"]
    result.total_conflicts_found = risk_scores["total_conflicts_found"]
    
    # Create search results summary for LLM
    result.search_results_summary = create_search_summary(all_search_results, brand_name)
    
    logger.info(f"Trademark research complete. Risk score: {result.overall_risk_score}/10, "
                f"Conflicts found: {result.total_conflicts_found}")
    
    return result


def extract_common_law_conflicts(
    search_results: List[Dict[str, Any]], 
    brand_name: str, 
    industry: str
) -> List[Dict[str, Any]]:
    """Extract common law (unregistered) trademark conflicts"""
    conflicts = []
    seen_businesses = set()
    
    for result in search_results:
        title = result.get("title", "")
        snippet = result.get("snippet", "")
        url = result.get("url", "")
        combined = f"{title} {snippet}".lower()
        
        # Look for business indicators that suggest operational businesses
        is_business = any(x in combined for x in [
            "shop", "store", "buy", "order", "instagram", "facebook",
            "@", "official", "website", "online", ".com", "ecommerce"
        ])
        
        # Exclude trademark registries and legal sites
        is_registry = any(x in url.lower() for x in [
            "trademark", "ipindia", "wipo", "uspto", "tofler", "mca.gov",
            "court", "legal", "law"
        ])
        
        brand_lower = brand_name.lower()
        if is_business and not is_registry and brand_lower in combined:
            # This might be an operating business without formal trademark
            business_name = extract_business_name(title, brand_name)
            
            if business_name and business_name.lower() not in seen_businesses:
                seen_businesses.add(business_name.lower())
                
                # Determine platform/type
                platform = "Website"
                if "instagram" in url or "instagram" in combined:
                    platform = "Instagram"
                elif "facebook" in url or "facebook" in combined:
                    platform = "Facebook"
                elif "amazon" in url:
                    platform = "Amazon"
                elif "flipkart" in url:
                    platform = "Flipkart"
                
                conflicts.append({
                    "name": business_name,
                    "platform": platform,
                    "industry_match": industry.lower() in combined if industry else False,
                    "url": url,
                    "snippet": snippet[:150],
                    "risk_type": "common_law",
                    "risk_level": "MEDIUM" if industry.lower() in combined else "LOW"
                })
    
    return conflicts[:10]  # Limit to top 10


def extract_business_name(text: str, original_brand: str) -> Optional[str]:
    """Extract business name from text"""
    # Try to extract from common patterns
    patterns = [
        r'(@\w+)',  # Instagram/Twitter handles
        r'([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+(?:Official|Shop|Store)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1)
    
    if original_brand.lower() in text.lower():
        return original_brand
    
    return None


def create_search_summary(search_results: List[Dict[str, Any]], brand_name: str) -> str:
    """Create a summary of search results for LLM processing"""
    summary_parts = []
    
    # Group results by purpose
    by_purpose = {}
    for r in search_results:
        purpose = r.get("query_purpose", "General")
        if purpose not in by_purpose:
            by_purpose[purpose] = []
        by_purpose[purpose].append(r)
    
    for purpose, results in by_purpose.items():
        summary_parts.append(f"\n### {purpose}")
        for r in results[:5]:  # Limit per category
            title = r.get("title", "")[:100]
            snippet = r.get("snippet", "")[:150]
            summary_parts.append(f"- {title}: {snippet}")
    
    return "\n".join(summary_parts)


def format_research_for_prompt(research_result: TrademarkResearchResult) -> str:
    """
    Format the trademark research result for inclusion in LLM prompt.
    This creates a structured context that the LLM can use to generate
    a comprehensive trademark analysis.
    """
    sections = []
    
    # Header
    sections.append(f"""
⚠️ REAL-TIME TRADEMARK RESEARCH DATA ⚠️
========================================
Brand: {research_result.brand_name}
Industry: {research_result.industry}
Category: {research_result.category}
Target Countries: {', '.join(research_result.countries)}
Nice Classification: Class {research_result.nice_classification.get('class_number', 'N/A')} - {research_result.nice_classification.get('class_description', '')}
Research Timestamp: {research_result.research_timestamp}
""")
    
    # Risk Summary
    sections.append(f"""
📊 RISK ASSESSMENT SUMMARY
--------------------------
Overall Risk Score: {research_result.overall_risk_score}/10
Registration Success Probability: {research_result.registration_success_probability}%
Opposition Probability: {research_result.opposition_probability}%
Total Conflicts Found: {research_result.total_conflicts_found}
  - Critical: {research_result.critical_conflicts_count}
  - High Risk: {research_result.high_risk_conflicts_count}
""")
    
    # Trademark Conflicts
    if research_result.trademark_conflicts:
        sections.append("\n🔴 TRADEMARK CONFLICTS FOUND:")
        for i, conflict in enumerate(research_result.trademark_conflicts[:10], 1):
            sections.append(f"""
  {i}. {conflict.name}
     Source: {conflict.source}
     Status: {conflict.status or 'Unknown'}
     Application #: {conflict.application_number or 'N/A'}
     Class: {conflict.class_number or 'N/A'}
     Risk Level: {conflict.risk_level}
     Details: {conflict.details or 'N/A'}
""")
    else:
        sections.append("\n✅ NO DIRECT TRADEMARK CONFLICTS FOUND IN SEARCH")
    
    # Company Conflicts
    if research_result.company_conflicts:
        sections.append("\n🏢 COMPANY REGISTRY CONFLICTS:")
        for i, conflict in enumerate(research_result.company_conflicts[:10], 1):
            sections.append(f"""
  {i}. {conflict.name}
     CIN: {conflict.cin or 'N/A'}
     Status: {conflict.status}
     Industry: {conflict.industry or 'N/A'}
     State: {conflict.state or 'N/A'}
     Source: {conflict.source}
     Risk Level: {conflict.risk_level}
""")
    else:
        sections.append("\n✅ NO COMPANY REGISTRY CONFLICTS FOUND")
    
    # Common Law Conflicts
    if research_result.common_law_conflicts:
        sections.append("\n📱 COMMON LAW / ONLINE PRESENCE CONFLICTS:")
        for i, conflict in enumerate(research_result.common_law_conflicts[:5], 1):
            sections.append(f"""
  {i}. {conflict.get('name', 'Unknown')}
     Platform: {conflict.get('platform', 'N/A')}
     Industry Match: {'Yes' if conflict.get('industry_match') else 'No'}
     Risk Level: {conflict.get('risk_level', 'LOW')}
""")
    
    # Legal Precedents
    if research_result.legal_precedents:
        sections.append("\n⚖️ RELEVANT LEGAL PRECEDENTS:")
        for i, precedent in enumerate(research_result.legal_precedents[:5], 1):
            sections.append(f"""
  {i}. {precedent.case_name}
     Court: {precedent.court or 'N/A'}
     Year: {precedent.year or 'N/A'}
     Relevance: {precedent.relevance[:100] if precedent.relevance else 'N/A'}
""")
    
    # Instructions for LLM
    sections.append("""
📝 INSTRUCTIONS FOR ANALYSIS:
-----------------------------
1. Use the above REAL data to populate the trademark analysis sections
2. If critical/high conflicts exist, explain their specific impact
3. Reference specific application numbers and company names where found
4. Calculate opposition risk based on the actual conflicts discovered
5. Provide mitigation strategies specific to the conflicts found
6. If conflicts exist in the same Nice class, this is HIGH priority
7. Company conflicts in the same industry = common law trademark risk
""")
    
    return "\n".join(sections)


# Export main functions
__all__ = [
    'conduct_trademark_research',
    'format_research_for_prompt',
    'TrademarkResearchResult',
    'TrademarkConflict',
    'CompanyConflict',
    'LegalPrecedent',
    'get_nice_classification'
]
