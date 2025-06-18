# HealthScan FastAPI Server with Gemini 2.5 Integration

This is an advanced FastAPI server that integrates with Google's latest Gemini 2.5 API for food image analysis and conversational AI capabilities.

## Features

### 🔥 Latest Gemini 2.5 Integration
- **Gemini 2.5 Flash**: Latest stable model with enhanced performance
- **Streaming Responses**: Real-time streaming for chat interactions
- **Vision Analysis**: Advanced food image recognition and nutritional analysis
- **Multimodal Support**: Handles text, images, and complex prompts

### 🚀 Advanced Capabilities
- **Smart Food Analysis**: Comprehensive nutritional breakdown with health scores
- **Context-Aware Chat**: AI remembers previous food analysis for follow-up questions
- **Customizable Prompts**: Tailored analysis based on user preferences
- **Production Ready**: Proper error handling, logging, and health checks

### 📊 API Endpoints
- `POST /analyze-food`: Analyze food images with Gemini Vision
- `POST /chat`: Stream-enabled chat with nutrition AI
- `GET /health`: Health check and API status
- `GET /models`: List available Gemini models

## Setup Instructions

### 1. Install Dependencies

```bash
# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Get Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new project or select existing one
3. Generate an API key
4. Copy the API key for next step

### 3. Set Environment Variables

**Option 1: Using .env file (Recommended)**
```bash
# Create .env file in the project root
echo "GEMINI_API_KEY=your_actual_api_key_here" > .env
```

**Option 2: Export environment variable**
```bash
export GEMINI_API_KEY="your_actual_api_key_here"
```

### 4. Run the Server

```bash
python fastapi-gemini-server.py
```

The server will start on `http://localhost:8000`

### 5. Test the API

**Interactive Documentation:**
- Open `http://localhost:8000/docs` for Swagger UI
- Open `http://localhost:8000/redoc` for ReDoc

**Health Check:**
```bash
curl http://localhost:8000/health
```

## API Usage Examples

### Food Analysis

```python
import requests
import base64

# Read and encode image
with open("food_image.jpg", "rb") as img_file:
    image_data = base64.b64encode(img_file.read()).decode()

# Analyze food
response = requests.post(
    "http://localhost:8000/analyze-food",
    json={
        "image_data": image_data,
        "user_preferences": {
            "dietary_restrictions": ["vegetarian"],
            "health_goals": ["weight_loss"]
        }
    }
)

result = response.json()
print(f"Health Score: {result['health_score']}")
print(f"Analysis: {result['analysis']}")
```

### Streaming Chat

```python
import requests
import json

# Chat with streaming
response = requests.post(
    "http://localhost:8000/chat",
    json={
        "messages": [
            {"role": "user", "content": "What are the benefits of the food I just analyzed?"}
        ],
        "context": {
            "food_name": "Grilled Salmon",
            "health_score": 92,
            "calories": 367
        },
        "stream": True
    },
    stream=True
)

# Process streaming response
for line in response.iter_lines():
    if line:
        data = line.decode('utf-8')
        if data.startswith('data: '):
            content = data[6:]  # Remove 'data: ' prefix
            if content != '[DONE]':
                chunk = json.loads(content)
                print(chunk['content'], end='', flush=True)
```

### JavaScript Frontend Example

```javascript
// Analyze food image
async function analyzeFood(imageFile) {
    const base64 = await fileToBase64(imageFile);

    const response = await fetch('/analyze-food', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            image_data: base64,
            user_preferences: {
                dietary_restrictions: ['gluten-free'],
                health_goals: ['muscle_gain']
            }
        })
    });

    return await response.json();
}

// Stream chat response
async function streamChat(messages, context) {
    const response = await fetch('/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            messages: messages,
            context: context,
            stream: true
        })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') return;

                try {
                    const parsed = JSON.parse(data);
                    console.log(parsed.content); // Display streaming text
                } catch (e) {
                    // Handle parsing errors
                }
            }
        }
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}
```

## Key Improvements Over Original

### 🆕 Latest Gemini 2.5 Features
- **Enhanced Performance**: 2x faster than previous models
- **Better Accuracy**: Improved food recognition and analysis
- **Advanced Reasoning**: More sophisticated nutritional insights
- **Native Streaming**: Built-in streaming support

### 🔧 Technical Enhancements
- **Modern SDK**: Uses latest `google-genai` client library
- **Async/Await**: Full async support for better performance
- **Type Safety**: Complete Pydantic models for request/response
- **Error Handling**: Comprehensive error handling and logging

### 🎯 Production Features
- **Health Monitoring**: Built-in health checks and status endpoints
- **Model Management**: Dynamic model configuration and listing
- **CORS Support**: Properly configured for frontend integration
- **Streaming SSE**: Server-Sent Events for real-time communication

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Your Google Gemini API key |
| `PORT` | No | Server port (default: 8000) |
| `HOST` | No | Server host (default: 0.0.0.0) |

## Model Configuration

The server uses the latest Gemini models:
- **Vision Model**: `gemini-2.5-flash` for food image analysis
- **Chat Model**: `gemini-2.5-flash` for conversational AI

You can modify these in the code or make them configurable via environment variables.

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure `GEMINI_API_KEY` is set correctly
2. **Import Error**: Make sure all dependencies are installed: `pip install -r requirements.txt`
3. **Image Format**: Ensure images are in supported formats (JPEG, PNG, WebP)
4. **Rate Limits**: Check Gemini API quotas and limits

### Performance Optimization

1. **Image Size**: Resize large images before sending to API
2. **Caching**: Implement caching for repeated analyses
3. **Async Processing**: Use async/await for concurrent requests
4. **Connection Pooling**: Configure HTTP client connection pooling

## License

This project is open source and available under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
- Check the [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- Review [FastAPI Documentation](https://fastapi.tiangolo.com/)
- Open an issue in this repository
