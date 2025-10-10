"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GenerationForm } from "@/components/generation-form"
import { EmailVerificationBanner } from "@/components/email-verification-banner"
import { Sparkles, AlertCircle, User, Eye } from "lucide-react"
import Link from "next/link"
import { useState, useCallback } from "react"
import Image from "next/image"
import { apiClient } from "@/lib/api-client"
import { GenerationHistorySidebar } from "@/components/generation-history-sidebar"
import { cn } from "@/lib/utils"

export default function StudioPage() {
  const { user, isAuthenticated, isLoading, isEmailVerified } = useAuth()
  const router = useRouter()
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [currentPrompt, setCurrentPrompt] = useState<string>("")
  const [refreshHistory, setRefreshHistory] = useState<number>(0)
  const [selectedHistoryImages, setSelectedHistoryImages] = useState<string[]>([])
  const [selectedHistoryPrompts, setSelectedHistoryPrompts] = useState<string[]>([])
  const [lastGeneratedCount, setLastGeneratedCount] = useState<number>(0)

  const handleGenerationComplete = useCallback((images: string[], prompt: string) => {
    console.log('Generation complete:', images.length, 'images')
    
    // Сначала очищаем все состояния
    setGeneratedImages([])
    setSelectedHistoryImages([])
    setSelectedHistoryPrompts([])
    setCurrentPrompt("")
    
    // Устанавливаем новые изображения сразу
    setGeneratedImages(images)
    setLastGeneratedCount(images.length)
    
    // Обновляем историю
    setRefreshHistory(prev => prev + 1)
  }, [])

  const handleImageSelect = useCallback((imageUrl: string, prompt: string) => {
    setGeneratedImages([imageUrl])
    setCurrentPrompt(prompt)
  }, [])

  const handleImagesSelect = useCallback((imageUrls: string[], prompts: string[]) => {
    console.log('handleImagesSelect called:', imageUrls.length, 'images')
    setSelectedHistoryImages(imageUrls)
    setSelectedHistoryPrompts(prompts)
    if (imageUrls.length > 0) {
      setGeneratedImages(imageUrls)
      setCurrentPrompt("") // Очищаем промпт при выборе для редактирования
    } else {
      // Очищаем изображения, если ничего не выбрано
      setGeneratedImages([])
      setCurrentPrompt("")
    }
  }, [])

  const handleNewGeneration = useCallback(() => {
    setGeneratedImages([])
    setCurrentPrompt("")
    setSelectedHistoryImages([])
    setSelectedHistoryPrompts([])
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center space-y-8 py-20">
        <div className="space-y-4">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-3xl font-bold">Требуется авторизация</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Войдите в аккаунт, чтобы начать создавать изображения с помощью ИИ
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => router.push("/login")}>
            <User className="w-5 h-5 mr-2" />
            Войти в аккаунт
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/">
              На главную
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Main Content Area */}
      <div className="flex h-screen">
        {/* Left Sidebar - Generation History */}
        <GenerationHistorySidebar 
          onNewGeneration={handleNewGeneration} 
          refreshTrigger={refreshHistory}
          onImageSelect={handleImageSelect}
          onImagesSelect={handleImagesSelect}
          selectedImages={selectedHistoryImages}
          newImagesCount={lastGeneratedCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col p-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-blob-1"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl animate-blob-2"></div>

          {/* Header Section */}
          <div className="w-full py-4">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              {/* Email Verification Banner */}
              {isAuthenticated && user && !isEmailVerified() && (
                <EmailVerificationBanner email={user.email} />
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-start overflow-y-auto">
            <div className="relative z-10 w-full max-w-3xl mx-auto py-8">
            {/* Main Generation Interface or Generated Results */}
            {generatedImages.length === 0 ? (
              <GenerationForm onGenerationComplete={handleGenerationComplete} />
            ) : (
              <div className="space-y-8">
                <div className={cn(
                  "grid gap-4",
                  generatedImages.length === 1 
                    ? "grid-cols-1 justify-center max-w-sm mx-auto" 
                    : generatedImages.length === 2
                    ? "grid-cols-1 md:grid-cols-2"
                    : generatedImages.length === 3
                    ? "grid-cols-1 md:grid-cols-3"
                    : "grid-cols-2 md:grid-cols-4"
                )}>
                  {generatedImages.map((imageUrl, index) => (
                    <div key={index} className="relative group rounded-2xl overflow-hidden shadow-xl border border-border/50">
                      <Image
                        src={apiClient.getFileUrl(imageUrl)}
                        alt={`Generated image ${index + 1}`}
                        width={generatedImages.length === 4 ? 300 : 400}
                        height={generatedImages.length === 4 ? 375 : 500}
                        className="w-full h-auto object-cover aspect-[4/5]"
                      />
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="rounded-full w-10 h-10 bg-background/90 hover:bg-background shadow-lg"
                          onClick={() => window.open(apiClient.getFileUrl(imageUrl), '_blank')}
                        >
                          <Eye className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={cn(
                  "mt-8",
                  generatedImages.length === 4 ? "mt-6" : "mt-12"
                )}>
                  <GenerationForm 
                    onGenerationComplete={handleGenerationComplete} 
                    initialPrompt={currentPrompt}
                    initialImages={selectedHistoryImages}
                  />
                </div>
              </div>
            )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

