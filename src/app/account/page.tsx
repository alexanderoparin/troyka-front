"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { EmailVerificationBanner } from "@/components/email-verification-banner"
import { 
  User, 
  LogOut,
  History,
  Image as ImageIcon,
  CreditCard,
  Plus,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Edit,
  Settings
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, logout, avatar, isEmailVerified, points } = useAuth()
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
            Войдите в аккаунт, чтобы управлять настройками
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => router.push("/login")}>
            <User className="w-5 h-5 mr-2" />
            Войти в аккаунт
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/">На главную</Link>
          </Button>
        </div>
      </div>
    )
  }

  const getRoleDisplayName = (role: string) => {
    const roles: Record<string, string> = {
      ADMIN: "Администратор",
      USER: "Пользователь",
    }
    return roles[role] || role
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24">
      {/* Баннер подтверждения email убран: подтверждение необязательно */}

      {/* Header */}
      <div className="space-y-2 sm:space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Мой аккаунт</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Управляйте настройками аккаунта
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {user.telegramPhotoUrl ? (
                      <img 
                        src={user.telegramPhotoUrl} 
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      avatar ? (
                        <img 
                          src={avatar} 
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      )
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{user.username}</h3>
                    <p className="text-sm text-muted-foreground">{user.email || 'Email не указан'}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                  <Link href="/account/edit">
                    <Edit className="w-4 h-4 mr-2" />
                    Редактировать
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Telegram Info */}
              {user.telegramId && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Telegram подключен</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    @{user.telegramUsername} • {user.telegramFirstName}
                  </p>
                </div>
              )}

              {/* Profile Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Роль</p>
                  <Badge variant="secondary">
                    {getRoleDisplayName(user.role)}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Статус email</p>
                  {isEmailVerified() ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 flex items-center gap-1 w-fit">
                      <CheckCircle className="w-3 h-3" />
                      Подтвержден
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="destructive" className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" />
                        Не подтвержден
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/verify-email">Подтвердить</Link>
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground">Дата регистрации</p>
                  <p className="font-medium">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Баланс</p>
                  <p className="font-medium text-lg">
                    {points || 0} поинтов
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Быстрые действия</CardTitle>
              <CardDescription className="text-sm">
                Основные функции и навигация
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/studio">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Создать изображение
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/history">
                  <History className="w-4 h-4 mr-2" />
                  История генерации
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/payment-history">
                  <CreditCard className="w-4 h-4 mr-2" />
                  История платежей
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/pricing">
                  <Plus className="w-4 h-4 mr-2" />
                  Пополнить баланс
                </Link>
              </Button>
              
              <Separator />
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => {
                  logout()
                  router.push('/')
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти из аккаунта
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
