"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, X, ImageIcon, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface GalleryUploadProps {
  onUpload: (imageData: string) => void
  onClose: () => void
}

export function GalleryUpload({ onUpload, onClose }: GalleryUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setSelectedImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const confirmUpload = () => {
    if (selectedImage) {
      onUpload(selectedImage)
    }
  }

  const resetSelection = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden">
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Upload Image</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Upload Area */}
          <div className="p-6">
            {selectedImage ? (
              <div className="space-y-4">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
                  <img
                    src={selectedImage || "/placeholder.svg"}
                    alt="Selected"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={resetSelection} className="flex-1 rounded-xl">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Different
                  </Button>
                  <Button
                    onClick={confirmUpload}
                    className="flex-1 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-xl"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Use Image
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors duration-200 ${
                  isDragging
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 hover:border-green-400 hover:bg-green-50"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Food Image</h3>
                <p className="text-sm text-gray-500 mb-4">Drag and drop an image here, or click to select</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-xl"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
