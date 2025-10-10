"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GenerationForm } from "@/components/generation-form"
import { EmailVerificationBanner } from "@/components/email-verification-banner"
import { Sparkles, AlertCircle, User } from "lucide-react"
import Link from "next/link"

export default function StudioPage() {
  const { user, isAuthenticated, isLoading, isEmailVerified } = useAuth()
  const router = useRouter()

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
    <div className="studio-page min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Email Verification Banner */}
      {isAuthenticated && user && !isEmailVerified() && (
        <EmailVerificationBanner email={user.email} />
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        
        {/* Header */}
        <div className="relative studio-header text-center space-y-6 py-16 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-medium">
            <Sparkles className="w-4 h-4" />
            Студия генерации
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Создайте изображение товара
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Просто опишите ваш товар текстом и получите профессиональное изображение за 5-10 секунд. 
              Загрузка изображения необязательна — только для редактирования существующих фото.
            </p>
          </div>
          
          {/* User Info */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full">
              <User className="w-3 h-3 text-primary" />
              <span className="font-medium">{user?.username || 'Пользователь'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Готов к генерации</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Main Generation Interface */}
        <div className="generation-form-container relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-8 mb-12 shadow-2xl">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
          
          <GenerationForm />
        </div>

        {/* Quick Actions */}
        <div className="quick-actions bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Быстрые действия</h3>
              <p className="text-muted-foreground">Дополнительные возможности</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/history" className="group">
              <div className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border border-border/30 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                      История генераций
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Просмотрите все созданные изображения и управляйте ими
                    </p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/account" className="group">
              <div className="relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border border-border/30 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                      Мой аккаунт
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Управление профилем, настройками и балансом
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

