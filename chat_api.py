from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Izocrete AI Chatbot API",
    description="AI-powered chatbot for Izocrete construction products",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ChatRequest(BaseModel):
    question: str
    stream: bool = False
    temperature: Optional[float] = 0.7

class ChatResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]
    question: str
    error: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    message: str
    vector_store_loaded: bool
    llm_available: bool
    llm_provider: str
    llm_model: str

# Simple response system for initial deployment
def get_simple_response(question: str) -> str:
    """Get a simple response based on keywords in the question."""
    question_lower = question.lower()
    
    responses = {
        "izocrete": "Izocrete is a next-generation building material that combines the strength of concrete with the low density of polystyrene, creating a lightweight, highly insulating, and fire-resistant material.",
        "thermal": "Izocrete blocks have a thermal conductivity of 0.06 W/m·K, meaning only 6% of one watt penetrates Izocrete per square meter per degree Celsius temperature difference.",
        "insulation": "Izocrete provides eight times the insulation of red bricks, ten times that of Ponza blocks, and twice that of German AAC (Thermstone).",
        "energy": "Izocrete reduces heating and cooling costs by up to 70%. It helps maintain stable indoor temperatures and prevents heat retention.",
        "cost": "While Izocrete blocks may have a higher initial cost compared to traditional materials, they provide significant long-term savings through reduced energy costs.",
        "installation": "Izocrete blocks are easy to install and cut. They can be cut with a conventional saw or carpenter's cutter in millimeters.",
        "weight": "Izocrete blocks are half the weight of Thermostone or Ponza blocks and a quarter of the weight of red or Republican bricks.",
        "fire": "Izocrete blocks are non-combustible, enhancing building safety. They are moisture-resistant and do not rot, burn, or degrade over time.",
        "climate": "Izocrete is especially suitable for Iraq's hot climate because it does not retain heat energy, allowing buildings to cool down quickly.",
        "application": "Izocrete blocks are ideal for residential, commercial, and industrial buildings. They're perfect for walls, partitions, floors, roofs, and façade cladding."
    }
    
    for keyword, response in responses.items():
        if keyword in question_lower:
            return response
    
    return "Izocrete is a revolutionary building material that combines the strength of concrete with the low density of polystyrene. It provides superior thermal insulation, reduces energy costs by up to 70%, and is perfect for modern construction projects. How can I help you learn more about Izocrete?"

@app.on_event("startup")
async def startup_event():
    """Initialize API on startup."""
    logger.info("Starting Izocrete AI Chatbot API (light mode)...")

@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint."""
    return {
        "message": "Izocrete AI Chatbot API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        message="API is running (light mode)",
        vector_store_loaded=False,
        llm_available=False,
        llm_provider="none",
        llm_model="simple"
    )

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Chat endpoint for asking questions about Izocrete products.
    """
    try:
        # Get simple response
        answer = get_simple_response(request.question)
        
        return ChatResponse(
            answer=answer,
            sources=[],
            question=request.question
        )
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat request: {str(e)}"
        )



@app.get("/chat/history")
async def get_chat_history():
    """Get the current chat history."""
    return {"history": []}

@app.delete("/chat/history")
async def clear_chat_history():
    """Clear the current chat history."""
    return {"message": "Chat history cleared successfully"}

@app.get("/qa-pairs")
async def get_qa_pairs():
    """Get information about available Q&A pairs."""
    return {
        "total_qa_pairs": 0,
        "sample_qa_pairs": [],
        "message": "Light mode - using simple responses"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 