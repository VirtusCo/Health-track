"""
FastAPI server for HealthScan LLM integration
Run with: python fastapi-server.py
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import asyncio
import base64
import io
from PIL import Image
import time

app = FastAPI(title="HealthScan AI API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FoodAnalysisRequest(BaseModel):
    image_data: str  # Base64 encoded image
    prompt: Optional[str] = None

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    messages: List[Dict[str, Any]]
    context: Optional[Dict[str, Any]] = None
    stream: bool = True

# Mock LLM responses for demonstration
NUTRITION_RESPONSES = [
    "Based on the nutritional analysis, this food contains several important nutrients that support overall health.",
    "The caloric content appears to be moderate, making it suitable for most dietary plans.",
    "I notice this food has a good balance of macronutrients including proteins, carbohydrates, and healthy fats.",
    "From a health perspective, this food provides essential vitamins and minerals your body needs.",
    "The fiber content in this food can help support digestive health and maintain stable blood sugar levels.",
    "This food contains antioxidants that may help protect your cells from oxidative stress.",
    "The protein content makes this a good choice for muscle maintenance and repair.",
    "Consider pairing this with complementary foods to create a more balanced nutritional profile."
]

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

def analyze_food_image(image: Image.Image, prompt: str) -> Dict[str, Any]:
    """
    Mock food analysis function
    In production, integrate with your preferred LLM/Vision model:
    - OpenAI GPT-4 Vision
    - Google Gemini Vision
    - Anthropic Claude Vision
    - Custom trained models
    """
    
    # Simulate processing time
    time.sleep(1)
    
    # Mock analysis results
    food_names = ["Apple", "Banana", "Salad", "Sandwich", "Pizza", "Pasta", "Rice Bowl", "Smoothie"]
    food_name = food_names[hash(str(image.size)) % len(food_names)]
    
    health_score = hash(food_name) % 40 + 60  # Score between 60-100
    calories = hash(food_name) % 300 + 100    # Calories between 100-400
    
    analysis = f"""## Nutritional Analysis: {food_name}

**Health Score: {health_score}/100**

### Nutritional Breakdown
- **Calories:** {calories} kcal
- **Protein:** {hash(food_name) % 20 + 5}g
- **Carbohydrates:** {hash(food_name) % 40 + 20}g
- **Fat:** {hash(food_name) % 15 + 5}g
- **Fiber:** {hash(food_name) % 8 + 2}g

### Health Benefits
- Rich in essential vitamins and minerals
- Good source of dietary fiber
- Contains beneficial antioxidants
- Supports overall wellness

### Recommendations
- Best consumed as part of a balanced diet
- Consider portion size for optimal benefits
- Pair with complementary foods for enhanced nutrition

This food choice aligns well with healthy eating patterns and can contribute positively to your daily nutritional goals."""

    return {
        "food_name": food_name,
        "health_score": health_score,
        "calories": calories,
        "analysis": analysis,
        "nutritional_info": {
            "protein": f"{hash(food_name) % 20 + 5}g",
            "carbs": f"{hash(food_name) % 40 + 20}g",
            "fat": f"{hash(food_name) % 15 + 5}g",
            "fiber": f"{hash(food_name) % 8 + 2}g"
        },
        "health_benefits": [
            "Supports immune system function",
            "Promotes digestive health",
            "Rich in antioxidants",
            "Good source of essential nutrients"
        ],
        "recommendations": [
            "Include as part of balanced meals",
            "Monitor portion sizes",
            "Combine with other nutrient-dense foods"
        ]
    }

async def generate_chat_response(messages: List[Dict], context: Optional[Dict] = None):
    """
    Mock chat response generator
    In production, integrate with your preferred LLM:
    - OpenAI GPT-4
    - Anthropic Claude
    - Google Gemini
    - Local models via Ollama/LM Studio
    """
    
    # Get the last user message
    last_message = messages[-1]["content"] if messages else ""
    
    # Generate contextual response based on food analysis
    if context and "food_name" in context:
        food_name = context["food_name"]
        health_score = context.get("health_score", 75)
        
        if "calories" in last_message.lower():
            response = f"The {food_name} contains approximately {context.get('calories', 'unknown')} calories. This is considered a moderate caloric content that fits well into most daily meal plans."
        elif "health" in last_message.lower() or "benefit" in last_message.lower():
            response = f"The {food_name} has a health score of {health_score}/100. It offers several health benefits including essential nutrients, vitamins, and minerals that support your overall wellness."
        elif "protein" in last_message.lower():
            response = f"This {food_name} contains {context.get('nutritional_info', {}).get('protein', 'unknown')} of protein, which is important for muscle maintenance and repair."
        elif "recommend" in last_message.lower():
            response = f"For the {food_name}, I recommend consuming it as part of a balanced meal. You could pair it with complementary foods to enhance its nutritional value."
        else:
            response = f"Regarding the {food_name} you scanned, it's a nutritious choice with a health score of {health_score}/100. What specific aspect would you like to know more about?"
    else:
        # General nutrition advice
        import random
        response = random.choice(NUTRITION_RESPONSES)
    
    # Simulate streaming by yielding words
    words = response.split()
    for i, word in enumerate(words):
        chunk = word + (" " if i < len(words) - 1 else "")
        yield json.dumps({"content": chunk}) + "\n"
        await asyncio.sleep(0.05)  # Simulate typing delay

@app.post("/analyze-food")
async def analyze_food(request: FoodAnalysisRequest):
    """Analyze food image and return nutritional information"""
    try:
        # Decode the image
        image = decode_base64_image(request.image_data)
        
        # Analyze the food
        result = analyze_food_image(image, request.prompt or "Analyze this food")
        
        return {
            "success": True,
            **result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """Chat with AI about nutrition and food"""
    try:
        if request.stream:
            # Return streaming response
            async def generate():
                yield "data: "
                async for chunk in generate_chat_response(request.messages, request.context):
                    yield f"data: {chunk}"
                yield "data: [DONE]\n"
            
            return StreamingResponse(
                generate(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                }
            )
        else:
            # Return complete response
            response_parts = []
            async for chunk in generate_chat_response(request.messages, request.context):
                chunk_data = json.loads(chunk)
                response_parts.append(chunk_data["content"])
            
            return {
                "success": True,
                "response": "".join(response_parts)
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "HealthScan AI API"}

if __name__ == "__main__":
    import uvicorn
    print("Starting HealthScan FastAPI server...")
    print("API Documentation: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
