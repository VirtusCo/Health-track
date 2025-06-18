"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Camera,
  Upload,
  Heart,
  TrendingUp,
  History,
  Settings,
  Lightbulb,
  Apple,
  Cherry,
  Grape,
  Carrot,
  Salad,
  Scale,
  Activity,
  Shield,
  Sparkles,
  User,
  Target,
  Award,
  Bot,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CameraCapture } from "@/components/camera-capture"
import { GalleryUpload } from "@/components/gallery-upload"
import { LLMChat } from "@/components/llm-chat"
import { ThinkingBox } from "@/components/thinking-box"
import { MarkdownRenderer } from "@/components/markdown-renderer"

// Floating food icons data
const floatingFoods = [
  { icon: Apple, delay: 0, duration: 20 },
  { icon: Cherry, delay: 3, duration: 25 },
  { icon: Grape, delay: 6, duration: 22 },
  { icon: Carrot, delay: 9, duration: 24 },
  { icon: Salad, delay: 12, duration: 21 },
]

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const floatingVariants = {
  animate: {
    y: [0, -4, 0],
    transition: {
      duration: 6,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}

const FloatingFood = ({ icon: Icon, delay, duration }: { icon: any; delay: number; duration: number }) => {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 })

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })

      const handleResize = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }

      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <motion.div
      className="absolute text-green-200/20 pointer-events-none"
      initial={{
        x: -50,
        y: Math.random() * dimensions.height,
        rotate: 0,
        scale: 0.8,
      }}
      animate={{
        x: dimensions.width + 50,
        y: Math.random() * dimensions.height,
        rotate: 360,
        scale: [0.8, 1.2, 0.8],
      }}
      transition={{
        duration,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      }}
    >
      <Icon size={32} />
    </motion.div>
  )
}

export default function HealthScanApp() {
  const [activeTab, setActiveTab] = useState("scan")
  const [isScanning, setIsScanning] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [showLLMChat, setShowLLMChat] = useState(false)
  const [healthScore, setHealthScore] = useState(78)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [scanHistory, setScanHistory] = useState([
    { id: 1, food: "Apple", score: 95, date: "Today", time: "2:30 PM", calories: 52 },
    { id: 2, food: "Banana", score: 88, date: "Today", time: "1:15 PM", calories: 89 },
    { id: 3, food: "Chocolate Bar", score: 35, date: "Yesterday", time: "8:45 PM", calories: 235 },
  ])

  const [thinkingContent, setThinkingContent] = useState("")
  const [showThinking, setShowThinking] = useState(false)

  const handleScan = async () => {
    if (!capturedImage && !uploadedImage) {
      setShowCamera(true)
      return
    }

    setIsScanning(true)
    setShowThinking(true)
    setThinkingContent("")

    // Simulate AI thinking process
    const thinkingText = `I'm analyzing the food image provided. First, I need to identify the food items present in the image. I can see what appears to be a food item that I should categorize and analyze for nutritional content. Let me process the visual elements and cross-reference with nutritional databases to provide accurate calorie counts, health scores, and dietary recommendations. I'll also consider portion sizes and preparation methods that might affect the nutritional profile.`

    // Type out thinking content
    for (let i = 0; i <= thinkingText.length; i++) {
      setThinkingContent(thinkingText.slice(0, i))
      await new Promise((resolve) => setTimeout(resolve, 25))
    }

    try {
      const imageToAnalyze = capturedImage || uploadedImage
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageToAnalyze,
          prompt:
            "Analyze this food image and provide detailed nutritional information including calories, health score (0-100), macronutrients, and health benefits.",
        }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const result = await response.json()
      setAnalysisResult(result)

      // Add to scan history
      const newScan = {
        id: scanHistory.length + 1,
        food: result.food_name || "Unknown Food",
        score: result.health_score || Math.floor(Math.random() * 40 + 60),
        date: "Today",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        calories: result.calories || Math.floor(Math.random() * 200 + 50),
      }
      setScanHistory([newScan, ...scanHistory])
    } catch (error) {
      console.error("Analysis error:", error)
      // Fallback to mock data
      const newScan = {
        id: scanHistory.length + 1,
        food: "Analyzed Food",
        score: Math.floor(Math.random() * 40 + 60),
        date: "Today",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        calories: Math.floor(Math.random() * 200 + 50),
      }
      setScanHistory([newScan, ...scanHistory])
    } finally {
      setTimeout(() => {
        setShowThinking(false)
        setIsScanning(false)
      }, 1000)
    }
  }

  const handleCameraCapture = (imageData: string) => {
    setCapturedImage(imageData)
    setUploadedImage(null)
    setShowCamera(false)
  }

  const handleGalleryUpload = (imageData: string) => {
    setUploadedImage(imageData)
    setCapturedImage(null)
    setShowGallery(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-500"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100"
    if (score >= 60) return "bg-yellow-100"
    return "bg-red-100"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Floating Food Icons */}
      {floatingFoods.map((food, index) => (
        <FloatingFood key={index} {...food} />
      ))}

      {/* Enhanced Thinking Box */}
      {showThinking && (
        <ThinkingBox
          thinkingContent={thinkingContent}
          isVisible={showThinking}
          onComplete={() => setShowThinking(false)}
        />
      )}

      {/* Subtle Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%2334d399' fillOpacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Camera Modal */}
      {showCamera && <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />}

      {/* Gallery Modal */}
      {showGallery && <GalleryUpload onUpload={handleGalleryUpload} onClose={() => setShowGallery(false)} />}

      {/* LLM Chat Modal */}
      {showLLMChat && <LLMChat onClose={() => setShowLLMChat(false)} analysisResult={analysisResult} />}

      {/* Thinking Box */}
      {isThinking && <ThinkingBox />}

      {/* Header */}
      <motion.header
        className="sticky top-0 z-40 backdrop-blur-sm bg-white/80 border-b border-gray-100"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg"
                variants={floatingVariants}
                animate="animate"
              >
                <Heart className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HealthScan</h1>
                <p className="text-xs text-gray-500">Smart nutrition tracking</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Card className="px-3 py-1 bg-white/70 border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500">Score</p>
                <p className={`text-sm font-bold ${getScoreColor(healthScore)}`}>{healthScore}</p>
              </Card>
              <Card className="px-3 py-1 bg-white/70 border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500">Streak</p>
                <p className="text-sm font-bold text-orange-600">7d</p>
              </Card>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-white/70 backdrop-blur-sm rounded-2xl p-1 shadow-sm">
            <TabsTrigger
              value="scan"
              className="rounded-xl data-[state=active]:bg-green-400 data-[state=active]:text-white transition-all duration-200"
            >
              <Camera className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger
              value="score"
              className="rounded-xl data-[state=active]:bg-blue-400 data-[state=active]:text-white transition-all duration-200"
            >
              <TrendingUp className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-xl data-[state=active]:bg-purple-400 data-[state=active]:text-white transition-all duration-200"
            >
              <History className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-xl data-[state=active]:bg-orange-400 data-[state=active]:text-white transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          {/* Scanner Tab */}
          <TabsContent value="scan" className="space-y-6">
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
              {/* Scanner Interface */}
              <motion.div variants={cardVariants}>
                <Card className="bg-white/80 backdrop-blur-sm border-gray-100 rounded-3xl shadow-lg p-8">
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <motion.div
                        className="w-48 h-48 mx-auto border-2 border-dashed border-gray-300 rounded-3xl flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 hover:border-green-400 transition-colors duration-300 overflow-hidden"
                        whileHover={{ scale: 1.02 }}
                      >
                        {capturedImage || uploadedImage ? (
                          <img
                            src={capturedImage || uploadedImage || ""}
                            alt="Captured food"
                            className="w-full h-full object-cover rounded-3xl"
                          />
                        ) : isScanning ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="text-green-500"
                          >
                            <Camera className="w-12 h-12" />
                          </motion.div>
                        ) : (
                          <div className="text-center space-y-2">
                            <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                            <p className="text-sm text-gray-500">Point camera at food</p>
                          </div>
                        )}
                      </motion.div>
                    </div>

                    <motion.div variants={floatingVariants} animate="animate">
                      <Button
                        onClick={handleScan}
                        disabled={isScanning}
                        className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-2xl py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {isScanning ? "Analyzing..." : capturedImage || uploadedImage ? "Analyze Food" : "Scan Food"}
                      </Button>
                    </motion.div>

                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl border-gray-200 hover:bg-gray-50"
                        onClick={() => setShowCamera(true)}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Camera
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl border-gray-200 hover:bg-gray-50"
                        onClick={() => setShowGallery(true)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Gallery
                      </Button>
                    </div>

                    {/* AI Chat Button */}
                    {analysisResult && (
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-blue-200 hover:bg-blue-50 text-blue-600"
                        onClick={() => setShowLLMChat(true)}
                      >
                        <Bot className="w-4 h-4 mr-2" />
                        Ask AI about this food
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Analysis Result */}
              {analysisResult && (
                <motion.div variants={cardVariants}>
                  <Card className="bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium text-gray-900">Analysis Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MarkdownRenderer content={analysisResult.analysis || "Food analysis completed successfully!"} />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Health Tips */}
              <motion.div variants={cardVariants}>
                <Card className="bg-gradient-to-r from-green-400/10 to-blue-400/10 backdrop-blur-sm border-green-200 rounded-2xl shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                        <Lightbulb className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">Daily Tip</h3>
                        <p className="text-sm text-gray-600">
                          Eating colorful fruits and vegetables provides essential vitamins and antioxidants for optimal
                          health.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Health Score Tab */}
          <TabsContent value="score" className="space-y-6">
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
              {/* Overall Score */}
              <motion.div variants={cardVariants}>
                <Card className="bg-white/80 backdrop-blur-sm border-gray-100 rounded-3xl shadow-lg p-8 text-center">
                  <div className="space-y-4">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white">{healthScore}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Health Score</h2>
                      <p className="text-gray-600">Great job! Keep it up</p>
                    </div>
                    <Progress value={healthScore} className="w-full h-2" />
                  </div>
                </Card>
              </motion.div>

              {/* Score Breakdown */}
              <motion.div variants={cardVariants} className="grid grid-cols-2 gap-4">
                <Card className="bg-white/70 backdrop-blur-sm border-gray-100 rounded-2xl shadow-sm p-4">
                  <div className="text-center space-y-2">
                    <Target className="w-6 h-6 text-blue-500 mx-auto" />
                    <p className="text-sm text-gray-600">Daily Goal</p>
                    <p className="text-xl font-bold text-gray-900">85%</p>
                  </div>
                </Card>
                <Card className="bg-white/70 backdrop-blur-sm border-gray-100 rounded-2xl shadow-sm p-4">
                  <div className="text-center space-y-2">
                    <Award className="w-6 h-6 text-yellow-500 mx-auto" />
                    <p className="text-sm text-gray-600">This Week</p>
                    <p className="text-xl font-bold text-gray-900">82</p>
                  </div>
                </Card>
              </motion.div>

              {/* Weekly Progress */}
              <motion.div variants={cardVariants}>
                <Card className="bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium text-gray-900">Weekly Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                      <div key={day} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{day}</span>
                        <div className="flex-1 mx-3">
                          <Progress value={Math.random() * 100} className="h-2" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{Math.floor(Math.random() * 40 + 60)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
              {scanHistory.map((scan, index) => (
                <motion.div key={scan.id} variants={cardVariants}>
                  <Card className="bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-12 h-12 rounded-xl ${getScoreBg(scan.score)} flex items-center justify-center`}
                          >
                            <span className={`text-lg font-bold ${getScoreColor(scan.score)}`}>{scan.score}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{scan.food}</h3>
                            <p className="text-sm text-gray-500">{scan.calories} calories</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{scan.date}</p>
                          <p className="text-xs text-gray-500">{scan.time}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
              {/* Profile Card */}
              <motion.div variants={cardVariants}>
                <Card className="bg-white/80 backdrop-blur-sm border-gray-100 rounded-3xl shadow-lg p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">John Doe</h2>
                      <p className="text-gray-600">Health enthusiast</p>
                      <Badge className="mt-1 bg-green-100 text-green-700 hover:bg-green-100">Premium Member</Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Settings Options */}
              <motion.div variants={cardVariants} className="space-y-3">
                {[
                  { icon: Scale, title: "Weight Goal", subtitle: "Target: 70kg" },
                  { icon: Activity, title: "Activity Level", subtitle: "Moderately Active" },
                  { icon: Shield, title: "Privacy", subtitle: "Manage data sharing" },
                  { icon: Sparkles, title: "Preferences", subtitle: "Dietary restrictions" },
                ].map((item, index) => (
                  <Card
                    key={index}
                    className="bg-white/70 backdrop-blur-sm border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-500">{item.subtitle}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
