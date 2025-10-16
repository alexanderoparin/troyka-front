"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { EmailVerificationBanner } from "@/components/email-verification-banner"
import { StudioSessions } from "@/components/studio-sessions"
import { StudioChat } from "@/components/studio-chat"
import { Header } from "@/components/header"
import { AlertCircle, User, Eye, Menu } from "lucide-react"
import { getPointsText } from "@/lib/grammar"
import Link from "next/link"
import { useState, useCallback, useEffect } from "react"
import { useDefaultSession } from "@/hooks/use-sessions-list"
import { useToast } from "@/components/ui/use-toast"

export default function StudioPage() {
  const { user, isAuthenticated, isEmailVerified, points } = useAuth()
  const { toast } = useToast()
  
  // Состояние сессий
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Получаем дефолтную сессию
  const { defaultSession, isLoading: isLoadingDefaultSession } = useDefaultSession()

  // Устанавливаем дефолтную сессию при загрузке
  useEffect(() => {
    if (defaultSession && !currentSessionId) {
      setCurrentSessionId(defaultSession.id)
    }
  }, [defaultSession, currentSessionId])

  // Обработчик завершения генерации
  const handleGenerationComplete = useCallback((images: string[]) => {
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
    <div className="flex h-screen relative">
      {/* Floating Header */}
      <Header />
      {/* Мобильное меню - Все элементы */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} style={{ zIndex: 10000 }}>
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-background border-r" onClick={(e) => e.stopPropagation()}>
            {/* Заголовок с кнопкой закрытия */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Меню</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Навигация */}
            <div className="p-4 border-b">
              <div className="space-y-2">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Главная
                  </Button>
                </Link>
                
                <Link href="/account" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Аккаунт
                  </Button>
                </Link>
                
                <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Пополнить баланс
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Информация о пользователе и балансе */}
            {isAuthenticated && (
              <div className="p-4 border-b bg-muted/50">
                <div className="space-y-1">
                  <div className="font-medium text-foreground">
                    {user?.username || 'Пользователь'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getPointsText(points)}
                  </div>
                </div>
              </div>
            )}
            
            {/* История сессий */}
            <div className="flex-1 overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-sm font-medium text-muted-foreground">Сессии</h3>
              </div>
              <div className="h-64 overflow-y-auto">
                <StudioSessions
                  currentSessionId={currentSessionId || undefined}
                  onSessionSelect={(sessionId) => {
                    handleSessionSelect(sessionId)
                    setIsMobileMenuOpen(false)
                  }}
                  onNewSession={() => {
                    handleNewSession()
                    setIsMobileMenuOpen(false)
                  }}
                  className="h-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Левая панель - Сессии (скрыта на мобильных) */}
      <div className="hidden md:block w-16 border-r bg-muted/5 flex flex-col">
        <StudioSessions
          currentSessionId={currentSessionId || undefined}
          onSessionSelect={handleSessionSelect}
          onNewSession={handleNewSession}
          className="h-full"
        />
      </div>

      {/* Центральная область - Диалог */}
      <div className="flex-1 flex flex-col">
        {/* Мобильная кнопка меню */}
        <div className="md:hidden absolute top-4 left-4" style={{ zIndex: 50 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileMenuOpen(true)}
            className="h-10 w-10 p-0 bg-background/90 backdrop-blur-sm border-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <StudioChat
          sessionId={currentSessionId || undefined}
          onGenerationComplete={handleGenerationComplete}
          className="h-full"
        />
      </div>
    </div>
  )
}