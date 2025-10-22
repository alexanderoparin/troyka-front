"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileEditForm } from "@/components/profile-edit-form"
import { TelegramLink } from "@/components/telegram-link"
import { 
  ArrowLeft,
  AlertCircle,
  User
} from "lucide-react"

export default function AccountEditPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center space-y-8 py-20">
        <div className="space-y-4">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-3xl font-bold">Требуется авторизация</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Войдите в аккаунт, чтобы редактировать настройки
          </p>
        </div>
        <Button size="lg" onClick={() => router.push("/login")}>
          <User className="w-5 h-5 mr-2" />
          Войти в аккаунт
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24">
      {/* Back Button */}
      <div className="flex items-center gap-2">
          <button 
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Кнопка назад нажата')
              window.location.href = '/account'
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад к аккаунту</span>
          </button>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Редактирование аккаунта</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Измените информацию о своем аккаунте
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Profile Edit Form */}
        <Card>
          <CardContent className="pt-6">
            <ProfileEditForm 
              user={{
                username: user.username,
                email: user.email || ''
              }}
            />
          </CardContent>
        </Card>

        {/* Telegram Link */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Telegram</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <TelegramLink 
              user={{
                telegramId: user.telegramId,
                telegramUsername: user.telegramUsername,
                telegramFirstName: user.telegramFirstName,
                telegramPhotoUrl: user.telegramPhotoUrl,
                email: user.email
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
