import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { messages, analysisResult } = await request.json()

    // FastAPI endpoint URL - replace with your actual FastAPI server URL
    const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000"

    const response = await fetch(`${FASTAPI_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        context: analysisResult,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`FastAPI request failed: ${response.status}`)
    }

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader()
          if (!reader) throw new Error("No reader available")

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                controller.enqueue(encoder.encode(line + "\n"))
              }
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n"))
          controller.close()
        } catch (error) {
          console.error("Streaming error:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)

    // Fallback streaming response for development
    const encoder = new TextEncoder()
    const fallbackResponse =
      "I'm a nutrition AI assistant. I can help you understand the nutritional value of your food, suggest healthy alternatives, and answer questions about diet and wellness. What would you like to know?"

    const stream = new ReadableStream({
      start(controller) {
        // Simulate streaming by sending chunks
        const words = fallbackResponse.split(" ")
        let index = 0

        const sendChunk = () => {
          if (index < words.length) {
            const chunk = words[index] + " "
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n`))
            index++
            setTimeout(sendChunk, 50) // Simulate typing delay
          } else {
            controller.enqueue(encoder.encode("data: [DONE]\n"))
            controller.close()
          }
        }

        sendChunk()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  }
}
