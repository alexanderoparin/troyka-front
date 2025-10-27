"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { getPointsText } from "@/lib/grammar"
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
    <div className="space-y-6 w-full px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24">
      {/* Баннер подтверждения email убран: подтверждение необязательно */}

      {/* Header */}
      <div className="space-y-2 sm:space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Мой аккаунт</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Управляйте настройками аккаунта
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column - Profile Info */}
        <div className="space-y-6 flex flex-col">
          {/* Profile Card */}
          <Card className="flex-1">
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
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                      <span>{user.email || 'Email не указан'}</span>
                    </div>
                    {/* Telegram Info */}
                    {user.telegramId && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.61 7.59c-.12.54-.44.68-.9.42l-2.49-1.84-1.2 1.16c-.13.13-.24.24-.49.24l.18-2.56 4.64-4.19c.2-.18-.04-.28-.31-.1l-5.74 3.61-2.47-.77c-.54-.17-.55-.54.11-.8l9.71-3.74c.45-.17.84.11.7.8z"/>
                        </svg>
                        <span>@{user.telegramUsername}</span>
                      </div>
                    )}
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
            <CardContent className="space-y-8">
              {/* Profile Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <p className="text-muted-foreground">Роль</p>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {getRoleDisplayName(user.role)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">Статус email</p>
                  {isEmailVerified() ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 flex items-center gap-1 w-fit text-sm px-3 py-1">
                      <CheckCircle className="w-3 h-3" />
                      Подтвержден
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="destructive" className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 flex items-center gap-1 w-fit text-sm px-3 py-1">
                        <AlertTriangle className="w-3 h-3" />
                        Не подтвержден
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/verify-email">Подтвердить</Link>
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">Дата регистрации</p>
                  <p className="font-medium text-base">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">Баланс</p>
                  <p className="font-medium text-xl">
                    {getPointsText(points || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-4 sm:space-y-6 flex flex-col">
          <Card className="flex-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <Button variant="outline" className="w-full justify-start h-12 px-4 py-3" asChild>
                  <Link href="/studio">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm">Создать изображение</span>
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start h-12 px-4 py-3" asChild>
                  <Link href="/history">
                    <History className="w-4 h-4 mr-2" />
                    <span className="text-sm">История генерации</span>
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start h-12 px-4 py-3" asChild>
                  <Link href="/payment-history">
                    <CreditCard className="w-4 h-4 mr-2" />
                    <span className="text-sm">История платежей</span>
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start h-12 px-4 py-3" asChild>
                  <Link href="/pricing">
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="text-sm">Пополнить баланс</span>
                  </Link>
                </Button>
              </div>
              
              <Separator />
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:text-destructive h-12 px-4 py-3"
                onClick={() => {
                  logout()
                  router.push('/')
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="text-sm">Выйти из аккаунта</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
