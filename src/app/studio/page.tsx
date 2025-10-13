"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { EmailVerificationBanner } from "@/components/email-verification-banner"
import { StudioSessions } from "@/components/studio-sessions"
import { StudioChat } from "@/components/studio-chat"
import { AlertCircle, User, Eye } from "lucide-react"
import Link from "next/link"
import { useState, useCallback, useEffect } from "react"
import { useDefaultSession } from "@/hooks/use-sessions-list"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

export default function StudioPage() {
  const { user, isAuthenticated, isLoading, isEmailVerified } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  // Состояние сессий
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null)
  
  // Получаем дефолтную сессию
  const { defaultSession, isLoading: isLoadingDefaultSession } = useDefaultSession()

  // Устанавливаем дефолтную сессию при загрузке
  useEffect(() => {
    if (defaultSession && !currentSessionId) {
      setCurrentSessionId(defaultSession.id)
    }
  }, [defaultSession, currentSessionId])

  // Обработчик завершения генерации
  const handleGenerationComplete = useCallback((images: string[], prompt: string) => {
    console.log('Generation complete:', images.length, 'images')
    
    toast({
      title: "Изображения созданы!",
      description: `Создано ${images.length} изображений`,
    })
  }, [toast])

  // Обработчик выбора сессии
  const handleSessionSelect = useCallback((sessionId: number) => {
    setCurrentSessionId(sessionId)
  }, [])

  // Обработчик создания новой сессии
  const handleNewSession = useCallback(() => {
    // Логика создания новой сессии
  }, [])

  // Если пользователь не авторизован
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="text-center space-y-6 p-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Добро пожаловать в студию!</h1>
            <p className="text-muted-foreground text-lg">
              Войдите в аккаунт, чтобы начать создавать изображения
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg">Войти</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg">Регистрация</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Если email не подтвержден
  if (!isEmailVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-8">
          <EmailVerificationBanner email={user?.email || ""} />
          <div className="text-center space-y-6 py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Подтвердите email</h1>
              <p className="text-muted-foreground text-lg">
                Для доступа к студии необходимо подтвердить email адрес
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Загрузка дефолтной сессии
  if (isLoadingDefaultSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Eye className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground">Загрузка студии...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Левая панель - Сессии */}
      <div className="w-20 border-r bg-muted/5 flex flex-col">
        <StudioSessions
          currentSessionId={currentSessionId || undefined}
          onSessionSelect={handleSessionSelect}
          onNewSession={handleNewSession}
          className="h-full"
        />
      </div>

      {/* Центральная область - Диалог */}
      <div className="flex-1 flex flex-col">
        <StudioChat
          sessionId={currentSessionId || undefined}
          onGenerationComplete={handleGenerationComplete}
          className="h-full"
        />
      </div>
    </div>
  )
}