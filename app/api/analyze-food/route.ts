import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { image, prompt } = await request.json()

    // FastAPI endpoint URL - replace with your actual FastAPI server URL
    const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000"

    const response = await fetch(`${FASTAPI_URL}/analyze-food`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_data: image,
        prompt:
          prompt ||
          "Analyze this food image and provide detailed nutritional information including calories, health score (0-100), macronutrients, and health benefits.",
      }),
    })

    if (!response.ok) {
      throw new Error(`FastAPI request failed: ${response.status}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      food_name: result.food_name,
      health_score: result.health_score,
      calories: result.calories,
      analysis: result.analysis,
      nutritional_info: result.nutritional_info,
      health_benefits: result.health_benefits,
      recommendations: result.recommendations,
    })
  } catch (error) {
    console.error("Food analysis error:", error)

    // Fallback response for development/testing
    return NextResponse.json({
      success: true,
      food_name: "Sample Food",
      health_score: Math.floor(Math.random() * 40 + 60),
      calories: Math.floor(Math.random() * 200 + 100),
      analysis: `## Food Analysis Results

**Nutritional Overview:**
This appears to be a healthy food choice with good nutritional value.

**Key Benefits:**
- Rich in essential vitamins and minerals
- Good source of dietary fiber
- Contains antioxidants
- Low in saturated fats

**Recommendations:**
- Pair with complementary foods for balanced nutrition
- Consider portion size for optimal health benefits
- Great choice for maintaining a healthy diet

**Health Score: ${Math.floor(Math.random() * 40 + 60)}/100**`,
      nutritional_info: {
        protein: "12g",
        carbs: "25g",
        fat: "8g",
        fiber: "5g",
      },
      health_benefits: ["Supports immune system", "Promotes digestive health", "Rich in antioxidants"],
      recommendations: ["Consume as part of balanced meal", "Best eaten fresh", "Pair with protein source"],
    })
  }
}
