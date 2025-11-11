from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from dotenv import load_dotenv
import os
import json
from pathlib import Path
from openai import OpenAI

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# Get the base directory (where main.py is located)
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
STATIC_DIR = BASE_DIR / "static"

# Ensure data directory exists
DATA_DIR.mkdir(exist_ok=True)
FEEDBACK_FILE = DATA_DIR / "feedback.json"


# Pydantic models for request validation
class FeedbackModel(BaseModel):
    slide_id: Optional[int] = None
    rating: Optional[str] = None
    comment: Optional[str] = None
    course_id: Optional[int] = None
    
    class Config:
        extra = "allow"

# Initialize FastAPI
app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static directory for images/audio
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# --- API Endpoints ---

@app.get("/")
def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "FastAPI backend is running"}


@app.get("/api/feedback")
def get_feedback():
    """Get all saved feedback entries (for debugging/testing)"""
    if not FEEDBACK_FILE.exists():
        return {"feedback": [], "count": 0}
    
    try:
        with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
            feedback_list = json.load(f)
            if not isinstance(feedback_list, list):
                feedback_list = []
    except json.JSONDecodeError:
        # If file is corrupted or empty, return empty list
        feedback_list = []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read feedback: {str(e)}")
    
    return {"feedback": feedback_list, "count": len(feedback_list)}


@app.get("/api/course/{course_id}")
def get_course(course_id: int):
    """Return the JSON content for a specific course"""
    course_file = DATA_DIR / f"course_{course_id}.json"
    if not course_file.exists():
        raise HTTPException(status_code=404, detail=f"Course {course_id} not found")
    with open(course_file, "r", encoding="utf-8") as f:
        return json.load(f)


async def fetch_real_news_summaries(keywords: List[str], max_items: int = 3) -> List[Dict[str, Any]]:
    """
    Fetch real news summaries using OpenAI with enhanced prompts.
    Uses OpenAI's knowledge to generate realistic, current news summaries.
    """
    try:
        # Combine keywords into a search query
        query = " ".join(keywords[:3])  # Use top 3 keywords
        primary_keyword = keywords[0] if keywords else "technology"
        
        # Enhanced prompt for realistic news summaries
        system_prompt = """You are a professional news analyst for a corporate learning platform. 
Your task is to provide concise, accurate summaries of REAL, CURRENT news related to the given topics.
Base your summaries on actual recent news events, regulatory changes, and industry developments.
Focus on practical implications for businesses and professionals.
Keep summaries to 2-3 sentences maximum. Be factual, relevant, and specific."""
        
        user_prompt = f"""Based on REAL and RECENT news events (as of your knowledge cutoff), provide {max_items} concise news summaries about: {query}

Requirements:
1. Use ACTUAL recent news - base summaries on real events, not generic information
2. Each summary should be 2-3 sentences covering key developments
3. Focus on: {primary_keyword} and related topics
4. Make titles specific and informative (10-15 words)
5. Include practical implications for businesses when relevant

Return your response as a JSON object with a "news" key containing an array of news items.
Each item must have: "title", "summary", and "keywords" fields.

Example format:
{{
  "news": [
    {{
      "title": "Specific news title about actual recent event",
      "summary": "Concise 2-3 sentence summary of the real news event with key details and implications.",
      "keywords": ["relevant", "keywords"]
    }}
  ]
}}

Focus on REAL, SPECIFIC news events rather than general information."""
        
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        
        response_text = completion.choices[0].message.content.strip()
        
        # Parse JSON response
        try:
            data = json.loads(response_text)
            
            # Extract news items from the response
            if isinstance(data, dict):
                # Look for common keys that might contain the array
                news_items = None
                for key in ['news', 'items', 'results', 'data']:
                    if key in data and isinstance(data[key], list):
                        news_items = data[key]
                        break
                
                # If no key found, try to find the first list value
                if news_items is None:
                    news_items = next((v for v in data.values() if isinstance(v, list)), [])
            else:
                news_items = data if isinstance(data, list) else []
            
            # Ensure we have a list
            if not isinstance(news_items, list):
                news_items = []
            
            # Validate and format news items
            formatted_news = []
            for item in news_items[:max_items]:
                if isinstance(item, dict) and 'title' in item:
                    # Ensure summary exists and is concise
                    summary = item.get("summary", "").strip()
                    if not summary and 'title' in item:
                        # If no summary, create a brief one from the title
                        summary = f"Recent developments in {primary_keyword} related to {item.get('title', '')}."
                    
                    # Ensure summary is concise (max 3 sentences, ~300 chars)
                    if summary:
                        sentences = summary.split('. ')
                        if len(sentences) > 3:
                            summary = '. '.join(sentences[:3]) + '.'
                        # Truncate if too long
                        if len(summary) > 300:
                            summary = summary[:297] + '...'
                    
                    # Only add if we have both title and summary
                    if summary:
                        formatted_news.append({
                            "title": item.get("title", "").strip(),
                            "summary": summary,
                            "keywords": item.get("keywords", keywords),
                            "url": item.get("url")  # Optional URL if provided
                        })
            
            return formatted_news if formatted_news else []
            
        except json.JSONDecodeError as e:
            # If JSON parsing fails, try to extract information from text
            print(f"JSON decode error: {str(e)}")
            print(f"Response text: {response_text[:500]}")
            # Fallback: generate a single summary from the response
            return [{
                "title": f"Latest Updates on {primary_keyword.title()}",
                "summary": response_text[:300] + "..." if len(response_text) > 300 else response_text,
                "keywords": keywords,
                "url": None
            }]
            
    except Exception as e:
        print(f"Error fetching news summaries: {str(e)}")
        return []


@app.get("/api/news")
async def get_news(topic: Optional[str] = None, keywords: Optional[str] = None):
    """
    Return real news filtered by topic or keywords.
    - topic: single topic string (for backward compatibility)
    - keywords: comma-separated list of keywords (preferred)
    Fetches real news summaries using AI based on the keywords.
    """
    # Parse keywords - prefer keywords parameter over topic
    search_keywords = []
    if keywords:
        # Split comma-separated keywords and clean them
        search_keywords = [k.strip().lower() for k in keywords.split(",") if k.strip()]
    elif topic:
        # For backward compatibility, use topic as a single keyword
        search_keywords = [topic.strip().lower()]
    
    if not search_keywords:
        return []

    # Check local news file first (for any pre-configured news)
    news_file = DATA_DIR / "news.json"
    local_news = []
    if news_file.exists():
        try:
            with open(news_file, "r", encoding="utf-8") as f:
                all_news = json.load(f)
                # Match news items where ANY search keyword exactly matches ANY news keyword
                for news_item in all_news:
                    news_keywords = [k.lower().strip() for k in news_item.get("keywords", [])]
                    search_keywords_set = set(search_keywords)
                    news_keywords_set = set(news_keywords)
                    if search_keywords_set.intersection(news_keywords_set):
                        local_news.append(news_item)
        except Exception as e:
            print(f"Error reading local news file: {str(e)}")

    # Always fetch real news summaries using AI
    try:
        real_news = await fetch_real_news_summaries(search_keywords, max_items=3)
        
        # Combine local and real news, prioritizing real news
        # Remove duplicates based on title similarity
        all_news_items = real_news + local_news
        
        # Remove duplicates (simple title-based deduplication)
        seen_titles = set()
        unique_news = []
        for item in all_news_items:
            title_lower = item.get("title", "").lower()
            # Simple deduplication: check if title is very similar
            is_duplicate = any(
                title_lower in seen_title or seen_title in title_lower
                for seen_title in seen_titles
                if len(title_lower) > 10 and len(seen_title) > 10
            )
            if not is_duplicate:
                seen_titles.add(title_lower)
                unique_news.append(item)
        
        return unique_news[:5]  # Return max 5 items
        
    except Exception as e:
        print(f"Error in get_news: {str(e)}")
        # Return local news if available, otherwise empty list
        return local_news if local_news else []


@app.post("/api/feedback")
def save_feedback(feedback: FeedbackModel):
    """Append feedback from frontend to local file with timestamp"""
    try:
        # Convert Pydantic model to dict (compatible with v1 and v2)
        try:
            feedback_dict = feedback.model_dump()  # Pydantic v2
        except AttributeError:
            feedback_dict = feedback.dict()  # Pydantic v1
        
        # Add timestamp
        feedback_dict["timestamp"] = datetime.utcnow().isoformat()
        
        # Read existing feedback or initialize empty list
        if FEEDBACK_FILE.exists():
            try:
                with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
                    feedback_list = json.load(f)
                    if not isinstance(feedback_list, list):
                        feedback_list = []
            except (json.JSONDecodeError, FileNotFoundError):
                feedback_list = []
        else:
            feedback_list = []
        
        # Append new feedback
        feedback_list.append(feedback_dict)
        
        # Write back to file
        with open(FEEDBACK_FILE, "w", encoding="utf-8") as f:
            json.dump(feedback_list, f, ensure_ascii=False, indent=2)
        
        return {"status": "received", "message": "Feedback saved successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save feedback: {str(e)}")

