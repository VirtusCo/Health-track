"""
FastAPI server for HealthScan LLM integration with latest Gemini API
Integrated with Gemini 2.5 Flash and streaming capabilities
Run with: python fastapi-gemini-server.py
"""

import asyncio
import base64
import io
import json
import os
import re
import time
from typing import List, Dict, Any, Optional, AsyncGenerator
from PIL import Image

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# Import the latest Gemini API client
from google import genai
from google.genai import types

app = FastAPI(
    title="HealthScan AI API with Gemini 2.5",
    version="2.0.0",
    description="Advanced food analysis API powered by Google Gemini AI"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is required")

client = genai.Client(api_key=GEMINI_API_KEY)

# Models configuration
VISION_MODEL = "gemini-2.5-flash"  # Latest stable model for vision tasks
CHAT_MODEL = "gemini-2.5-flash"    # Latest stable model for chat

# Request/Response Models
class FoodAnalysisRequest(BaseModel):
    image_data: str  # Base64 encoded image
    prompt: Optional[str] = None
    user_preferences: Optional[Dict[str, Any]] = None

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    messages: List[Dict[str, Any]]
    context: Optional[Dict[str, Any]] = None
    stream: bool = True
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1000


def decode_base64_image(image_data: str) -> Image.Image:
    """Decode base64 image data to PIL Image"""
    try:
        # Remove data URL prefix if present
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]

        # Decode base64
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        return image
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")


def create_food_analysis_prompt(user_preferences: Optional[Dict] = None) -> str:
    """Create a comprehensive food analysis prompt"""
    base_prompt = """
    You are an expert nutritionist and food analyst. Analyze the food image provided and give a comprehensive nutritional analysis.

    Please provide your analysis in the following structured format:

    ## Food Identification
    - **Primary Food Items**: List all main food items visible
    - **Preparation Method**: How the food appears to be prepared
    - **Estimated Portion Size**: Approximate serving size

    ## Nutritional Analysis
    - **Calories**: Estimated total calories
    - **Macronutrients**:
      - Protein: X grams
      - Carbohydrates: X grams  
      - Fat: X grams
      - Fiber: X grams
    - **Key Micronutrients**: Important vitamins and minerals present

    ## Health Assessment
    - **Health Score**: Rate from 1-100 (100 being extremely healthy)
    - **Health Benefits**: Key nutritional benefits
    - **Potential Concerns**: Any nutritional concerns or allergens

    ## Recommendations
    - **Dietary Advice**: Suggestions for this food choice
    - **Pairing Suggestions**: Foods that would complement this meal
    - **Portion Guidance**: Appropriate serving size recommendations
    """

    if user_preferences:
        base_prompt += f"\n\n## User Context\nConsider these user preferences: {user_preferences}"

    base_prompt += "\n\nProvide accurate, evidence-based nutritional information. If uncertain about specific values, provide reasonable estimates with appropriate disclaimers."

    return base_prompt


async def analyze_food_with_gemini(image: Image.Image, prompt: str) -> Dict[str, Any]:
    """Analyze food image using Gemini 2.5 Flash Vision"""
    try:
        # Convert PIL image to format suitable for Gemini
        response = client.models.generate_content(
            model=VISION_MODEL,
            contents=[image, prompt],
            config=types.GenerateContentConfig(
                temperature=0.4,  # Lower temperature for more consistent analysis
                max_output_tokens=2000,
                candidate_count=1
            )
        )

        analysis_text = response.text

        # Parse key metrics from the response (simplified parsing)
        # In production, you might want more sophisticated parsing
        health_score = extract_health_score(analysis_text)
        calories = extract_calories(analysis_text)

        return {
            "success": True,
            "analysis": analysis_text,
            "health_score": health_score,
            "estimated_calories": calories,
            "model_used": VISION_MODEL,
            "timestamp": time.time()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Food analysis failed: {str(e)}")


def extract_health_score(text: str) -> int:
    """Extract health score from analysis text"""
    # Look for patterns like "Health Score: 85" or "Score: 85/100"
    patterns = [
        r"Health Score[:\s]+(\d+)",
        r"Score[:\s]+(\d+)",
        r"(\d+)/100",
        r"rated?\s+(\d+)\s*out\s*of\s*100"
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1))

    # Default score if not found
    return 75


def extract_calories(text: str) -> int:
    """Extract calorie estimate from analysis text"""
    # Look for patterns like "Calories: 350" or "350 calories"
    patterns = [
        r"Calories[:\s]+(\d+)",
        r"(\d+)\s*calories",
        r"(\d+)\s*kcal"
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1))

    # Default if not found
    return 250


async def generate_chat_response_stream(
    messages: List[Dict], 
    context: Optional[Dict] = None,
    temperature: float = 0.7,
    max_tokens: int = 1000
) -> AsyncGenerator[str, None]:
    """Generate streaming chat response using Gemini 2.5"""
    try:
        # Prepare conversation history
        conversation_parts = []

        # Add context if available
        if context:
            context_prompt = f"Context from previous food analysis: {json.dumps(context, indent=2)}\n\n"
            conversation_parts.append(context_prompt)

        # Add conversation history
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            content = msg["content"]
            if role == "user":
                conversation_parts.append(f"User: {content}")
            else:
                conversation_parts.append(f"Assistant: {content}")

        # Create the full prompt
        full_prompt = "\n".join(conversation_parts)

        # Add system instruction for nutrition expertise
        system_instruction = """You are a knowledgeable nutritionist and health advisor. 
        Provide helpful, accurate information about nutrition, food, and healthy eating. 
        Base your responses on scientific evidence and be encouraging while being honest about health implications.
        If you're discussing a specific food that was analyzed, reference the analysis context provided."""

        # Generate streaming response
        stream = client.models.generate_content_stream(
            model=CHAT_MODEL,
            contents=[system_instruction + "\n\n" + full_prompt],
            config=types.GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
                candidate_count=1
            )
        )

        # Stream the response
        for chunk in stream:
            if chunk.text:
                yield chunk.text

    except Exception as e:
        yield f"Error generating response: {str(e)}"


@app.post("/analyze-food")
async def analyze_food(request: FoodAnalysisRequest):
    """Analyze food image using Gemini 2.5 Vision API"""
    try:
        # Decode the image
        image = decode_base64_image(request.image_data)

        # Create analysis prompt
        prompt = request.prompt or create_food_analysis_prompt(request.user_preferences)

        # Analyze with Gemini
        result = await analyze_food_with_gemini(image, prompt)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """Chat with Gemini AI about nutrition and food"""
    try:
        if request.stream:
            # Return streaming response
            async def generate_stream():
                async for chunk in generate_chat_response_stream(
                    request.messages, 
                    request.context,
                    request.temperature or 0.7,
                    request.max_tokens or 1000
                ):
                    # Format as Server-Sent Events
                    yield f"data: {json.dumps({'content': chunk})}\n\n"

                # Send completion signal
                yield "data: [DONE]\n\n"

            return StreamingResponse(
                generate_stream(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no"  # Disable Nginx buffering
                }
            )
        else:
            # Return complete response
            response_parts = []
            async for chunk in generate_chat_response_stream(
                request.messages, 
                request.context,
                request.temperature or 0.7,
                request.max_tokens or 1000
            ):
                response_parts.append(chunk)

            return {
                "success": True,
                "response": "".join(response_parts),
                "model_used": CHAT_MODEL
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test Gemini API connection
        test_response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents="Hello"
        )

        return {
            "status": "healthy",
            "service": "HealthScan AI API",
            "gemini_status": "connected",
            "version": "2.0.0",
            "models": {
                "vision": VISION_MODEL,
                "chat": CHAT_MODEL
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


@app.get("/models")
async def list_models():
    """List available Gemini models"""
    try:
        # In practice, you might want to dynamically fetch available models
        return {
            "available_models": {
                "vision": [
                    "gemini-2.5-flash",
                    "gemini-2.0-flash",
                ],
                "chat": [
                    "gemini-2.5-flash", 
                    "gemini-2.0-flash",
                ],
                "multimodal": [
                    "gemini-2.5-flash",
                    "gemini-2.0-flash-live-001"
                ]
            },
            "current_config": {
                "vision_model": VISION_MODEL,
                "chat_model": CHAT_MODEL
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list models: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    print("🚀 Starting HealthScan FastAPI server with Gemini 2.5...")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔗 Health Check: http://localhost:8000/health")
    print("🧠 Models Info: http://localhost:8000/models")
    print("⚠️  Make sure to set GEMINI_API_KEY environment variable!")

    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )