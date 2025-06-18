"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, X, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { ThinkingBox } from "@/components/thinking-box"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface LLMChatProps {
  onClose: () => void
  analysisResult?: any
}

export function LLMChat({ onClose, analysisResult }: LLMChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [thinkingContent, setThinkingContent] = useState("")
  const [showThinking, setShowThinking] = useState(false)

  useEffect(() => {
    // Initialize with analysis result if available
    if (analysisResult) {
      const initialMessage: Message = {
        id: "1",
        role: "assistant",
        content: `I've analyzed your food image! Here's what I found:\n\n**Food:** ${analysisResult.food_name || "Unknown"}\n**Health Score:** ${analysisResult.health_score || "N/A"}\n**Calories:** ${analysisResult.calories || "N/A"}\n\nWhat would you like to know more about?`,
        timestamp: new Date(),
      }
      setMessages([initialMessage])
    }
  }, [analysisResult])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Show thinking process
    setShowThinking(true)
    setThinkingContent("")

    // Simulate thinking content
    const thinkingText = `The user is asking about "${input}". Let me analyze this question in the context of the food analysis we performed earlier. I should provide a comprehensive response that addresses their specific concern while relating it back to the nutritional information we have available. I'll structure my response to be informative and actionable.`

    // Type out thinking content
    for (let i = 0; i <= thinkingText.length; i++) {
      setThinkingContent(thinkingText.slice(0, i))
      await new Promise((resolve) => setTimeout(resolve, 30))
    }

    // Wait a moment then hide thinking and start response
    setTimeout(() => {
      setShowThinking(false)
      setIsStreaming(true)
      setStreamingMessage("")

      // Continue with existing API call logic...
      handleAPIResponse()
    }, 1000)
  }

  const handleAPIResponse = async () => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
          analysisResult,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      let accumulatedContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") {
              setIsStreaming(false)
              const assistantMessage: Message = {
                id: Date.now().toString(),
                role: "assistant",
                content: accumulatedContent,
                timestamp: new Date(),
              }
              setMessages((prev) => [...prev, assistantMessage])
              setStreamingMessage("")
              break
            }
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                accumulatedContent += parsed.content
                setStreamingMessage(accumulatedContent)
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      setIsStreaming(false)
      setStreamingMessage("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card className="w-full max-w-2xl h-[80vh] bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Nutrition AI</h2>
              <p className="text-xs text-gray-500">Ask me anything about your food</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Add this right after the header and before the messages */}
        {showThinking && (
          <ThinkingBox
            thinkingContent={thinkingContent}
            isVisible={showThinking}
            onComplete={() => setShowThinking(false)}
          />
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`flex items-start space-x-2 max-w-[80%] ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-400 to-purple-400"
                      : "bg-gradient-to-r from-green-400 to-blue-400"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <Card
                  className={`p-3 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {message.role === "user" ? (
                    <p className="text-sm">{message.content}</p>
                  ) : (
                    <MarkdownRenderer content={message.content} />
                  )}
                </Card>
              </div>
            </motion.div>
          ))}

          {/* Streaming Message */}
          {isStreaming && streamingMessage && (
            <motion.div className="flex justify-start" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-start space-x-2 max-w-[80%]">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <Card className="p-3 bg-white border-gray-200">
                  <MarkdownRenderer content={streamingMessage} streaming />
                </Card>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about nutrition, ingredients, health benefits..."
              className="flex-1 rounded-xl border-gray-200 focus:border-green-400 focus:ring-green-400"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-xl px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Thinking indicator */}
      {isLoading && !isStreaming && <ThinkingBox />}
    </motion.div>
  )
}
