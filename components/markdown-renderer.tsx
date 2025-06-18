"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface MarkdownRendererProps {
  content: string
  streaming?: boolean
}

export function MarkdownRenderer({ content, streaming = false }: MarkdownRendererProps) {
  const [displayedContent, setDisplayedContent] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (streaming && currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(content.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, 20) // Typing speed

      return () => clearTimeout(timer)
    } else if (!streaming) {
      setDisplayedContent(content)
    }
  }, [content, currentIndex, streaming])

  // Simple markdown parsing for basic formatting
  const parseMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-semibold text-gray-900 mt-4 mb-2">$1</h3>')
      .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-semibold text-gray-900 mt-4 mb-2">$1</h2>')
      .replace(/# (.*?)(\n|$)/g, '<h1 class="text-2xl font-bold text-gray-900 mt-4 mb-2">$1</h1>')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, "<br>")
  }

  return (
    <motion.div
      className="prose prose-sm max-w-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: `<p class="mb-3">${parseMarkdown(displayedContent)}</p>`,
        }}
      />
      {streaming && currentIndex < content.length && (
        <motion.span
          className="inline-block w-2 h-5 bg-blue-500 ml-1"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
        />
      )}
    </motion.div>
  )
}
