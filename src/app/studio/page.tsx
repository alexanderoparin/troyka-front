"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GenerationForm } from "@/components/generation-form"
import { EmailVerificationBanner } from "@/components/email-verification-banner"
import { Sparkles, AlertCircle, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"
import { apiClient } from "@/lib/api-client"
import { GenerationHistorySidebar } from "@/components/generation-history-sidebar"

export default function StudioPage() {
  const { user, isAuthenticated, isLoading, isEmailVerified } = useAuth()
  const router = useRouter()
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [currentPrompt, setCurrentPrompt] = useState<string>("")

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

  const handleGenerationComplete = (images: string[], prompt: string) => {
    setGeneratedImages(images)
    setCurrentPrompt(prompt)
  }

  const handleNewGeneration = () => {
    setGeneratedImages([])
    setCurrentPrompt("")
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Left Sidebar - Generation History */}
      <GenerationHistorySidebar onNewGeneration={handleNewGeneration} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-blob-1"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl animate-blob-2"></div>

        <div className="relative z-10 w-full max-w-3xl mx-auto">
          {/* Email Verification Banner */}
          {isAuthenticated && user && !isEmailVerified() && (
            <EmailVerificationBanner email={user.email} />
          )}

          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary">
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              Студия генерации
            </Badge>
            <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
              Krea 1
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Опишите вашу идею и получите профессиональное изображение за секунды.
            </p>
          </div>

          {/* Main Generation Interface or Generated Results */}
          {generatedImages.length === 0 ? (
            <GenerationForm onGenerationComplete={handleGenerationComplete} />
          ) : (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-center">Ваши сгенерированные изображения</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedImages.map((imageUrl, index) => (
                  <div key={index} className="relative group rounded-2xl overflow-hidden shadow-xl border border-border/50">
                    <Image
                      src={apiClient.getFileUrl(imageUrl)}
                      alt={`Generated image ${index + 1}`}
                      width={600}
                      height={800}
                      className="w-full h-auto object-cover aspect-[3/4]"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                      <Button size="icon" variant="secondary" className="rounded-full w-10 h-10">
                        <Sparkles className="w-5 h-5" />
                      </Button>
                      <Button size="icon" variant="secondary" className="rounded-full w-10 h-10">
                        <User className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-center mb-6">Продолжить редактирование?</h3>
                <GenerationForm onGenerationComplete={handleGenerationComplete} initialPrompt={currentPrompt} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

