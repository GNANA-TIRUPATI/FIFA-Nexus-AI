import os
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import httpx
from app.core.config import settings

router = APIRouter()

class ChatMessage(BaseModel):
  role: str # 'user' or 'model'
  text: str

class ChatRequest(BaseModel):
  message: str
  history: List[ChatMessage] = []

SYSTEM_PROMPT = """You are the FIFA NEXUS AI digital stadium assistant. Your task is to assist fans, security officers, volunteers, and maintenance crew at MetLife Stadium for the FIFA World Cup 2026.
Here is your stadium knowledge base:
- Gate 5: Main northern entrance, closest to the metro transit station. Has accessible wheelchair ramps and elevators.
- Gate 1: Southern entrance, closest to Parking Lot A/B and Taxi stands.
- First Aid: Located on Sector Concourse A (next to Gate 1) and Sector Concourse C (next to Gate 5).
- Food Stand: 'Nexus Bites' stand located near Section 112A serves Vegan, Halal, and Vegetarian burgers.
- Elevator 2: Located in the western lobby, provides wheelchair access to premium suites and Section 200 tiers.
- Metro Transit: Trains depart every 5 minutes from MetLife Station outside Gate 5.
- SOS/Emergency: Medical/Security teams can be dispatched immediately by clicking the SOS panic button.

If you don't know the answer, tell them to contact nearest volunteer. Answer concisely, in a friendly and professional manner. Be extremely direct."""

def get_simulated_ai_response(query: str) -> str:
    """Fallback stadium expert system if Gemini API key is invalid or unconfigured."""
    q = query.lower()
    if "gate 5" in q:
        return "Gate 5 is the main northern entrance. It is located right outside the MetLife Metro Transit station and includes accessible wheelchair ramps."
    elif "gate 1" in q:
        return "Gate 1 is the southern entrance, closest to Parking Lot A/B and the designated Taxi pickup zone."
    elif "first aid" in q or "medical" in q:
        return "First Aid stations are located on Sector Concourse A (near Gate 1) and Sector Concourse C (near Gate 5)."
    elif "food" in q or "vegetarian" in q or "halal" in q or "vegan" in q:
        return "You can find Vegan, Halal, and Vegetarian options at the 'Nexus Bites' stand located near Section 112A."
    elif "wheelchair" in q or "elevator" in q or "accessible" in q:
        return "Elevator 2 in the western lobby provides wheelchair access. Gate 5 also features accessible ramps."
    elif "metro" in q or "transit" in q or "bus" in q:
        return "Metro trains depart every 5 minutes from MetLife Station directly outside Gate 5."
    elif "emergency" in q or "sos" in q:
        return "If there is an emergency, please trigger the SOS button on your screen. A stadium security or medical unit will be dispatched immediately."
    else:
        return "Welcome to MetLife Stadium. You can locate Gate 5 on the north side, Gate 1 on the south, or ask any volunteer in a green jacket for navigation support."

@router.post("/chat")
def chat_with_gemini(request: ChatRequest):
    """Query Gemini 2.5 Flash API with chat history and stadium system prompt."""
    api_key = settings.GEMINI_API_KEY
    
    # If the key is dummy/missing, fall back to our local rule-based expert system
    if not api_key or api_key == "mock-key":
        return {"response": get_simulated_ai_response(request.message)}

    # Map history to Gemini content blocks
    contents = []
    for msg in request.history:
        contents.append({
            "role": "user" if msg.role == "user" else "model",
            "parts": [{"text": msg.text}]
        })
        
    # Append the new user message
    contents.append({
        "role": "user",
        "parts": [{"text": request.message}]
    })

    # Prepare Gemini 2.5 Flash request body
    payload = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{"text": SYSTEM_PROMPT}]
        },
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 300
        }
    }

    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    try:
        with httpx.Client() as client:
            response = client.post(gemini_url, json=payload, timeout=8.0)
            
            if response.status_code == 200:
                data = response.json()
                text_reply = data["candidates"][0]["content"]["parts"][0]["text"]
                return {"response": text_reply.strip()}
            else:
                print(f"Gemini API returned error status {response.status_code}: {response.text}")
                # Fall back to local expert system on remote error
                return {"response": get_simulated_ai_response(request.message)}
    except Exception as e:
        print(f"Failed to communicate with Gemini API: {e}")
        return {"response": get_simulated_ai_response(request.message)}
