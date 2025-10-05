"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { GenerationForm } from "@/components/generation-form"
import { Sparkles, Zap, AlertCircle, Upload } from "lucide-react"
import Link from "next/link"

export default function StudioPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

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
            <Zap className="w-5 h-5 mr-2" />
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

  const canGenerate = true // Пока что убираем проверку поинтов

  return (
    <div className="studio-page space-y-8">
      {/* Header */}
      <div className="studio-header text-center space-y-4">
        <Badge variant="secondary" className="mb-4">
          <Sparkles className="w-4 h-4 mr-2" />
          Студия генерации
        </Badge>
        <h1 className="text-3xl font-bold">Создайте изображение товара</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Просто опишите ваш товар текстом и получите профессиональное изображение за 5-10 секунд. 
          Загрузка изображения необязательна - только для редактирования существующих фото.
        </p>
        
        {/* User Info */}
        <div className="studio-user-info flex items-center justify-center gap-4 text-sm">
          <Badge variant="default" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {user?.username || 'Пользователь'}
          </Badge>
          <span className="text-muted-foreground">Готов к генерации</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Main Generation Interface */}
        <div className="generation-form-container bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-8 mb-8">
          <GenerationForm />
        </div>

        {/* Quick Actions */}
        <div className="quick-actions bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm border border-border/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Быстрые действия</h3>
              <p className="text-sm text-muted-foreground">Дополнительные возможности</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/history">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">История генераций</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Просмотрите все созданные изображения
                </p>
              </Button>
            </Link>
            <Link href="/account">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="font-medium">Мой аккаунт</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Управление профилем и настройками
                </p>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

