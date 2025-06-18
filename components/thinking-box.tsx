"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, ChevronDown, ChevronUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ThinkingBoxProps {
  thinkingContent?: string
  isVisible?: boolean
  onComplete?: () => void
}

export function ThinkingBox({ thinkingContent = "", isVisible = true, onComplete }: ThinkingBoxProps) {
  const [displayedContent, setDisplayedContent] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(true)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (thinkingContent && currentIndex < thinkingContent.length && isVisible) {
      const timer = setTimeout(() => {
        setDisplayedContent(thinkingContent.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, 30) // Typing speed

      return () => clearTimeout(timer)
    } else if (currentIndex >= thinkingContent.length && !isComplete) {
      setIsComplete(true)
      setTimeout(() => {
        onComplete?.()
      }, 1000)
    }
  }, [thinkingContent, currentIndex, isVisible, isComplete, onComplete])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-2xl px-4"
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card className="bg-gray-900 text-white border-gray-700 shadow-2xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Analyzing nutrition data</h3>
                <div className="flex items-center space-x-2">
                  {!isComplete && (
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((index) => (
                        <motion.div
                          key={index}
                          className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: index * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {isComplete && <span className="text-xs text-green-400">Analysis complete</span>}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>

          {/* Thinking Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 max-h-60 overflow-y-auto">
                  <div className="text-sm text-gray-300 leading-relaxed">
                    {displayedContent}
                    {!isComplete && currentIndex < thinkingContent.length && (
                      <motion.span
                        className="inline-block w-2 h-4 bg-blue-400 ml-1"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
