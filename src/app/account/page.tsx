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
  AlertTriangle
} from "lucide-react"
import { AvatarUpload } from "@/components/avatar-upload"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, logout, avatar, isEmailVerified } = useAuth()
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
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Email Verification Banner */}
      {isAuthenticated && user && !isEmailVerified() && (
        <EmailVerificationBanner email={user.email} />
      )}

      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Мой аккаунт</h1>
        <p className="text-muted-foreground">
          Управляйте настройками аккаунта
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-stretch">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Информация о профиле
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <AvatarUpload 
                  currentAvatar={avatar || undefined}
                  userName={user?.username}
                  size="md"
                />
                <div>
                  <p className="font-medium">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.username}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Имя пользователя</p>
                  <p className="font-medium">{user.username}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Роль</p>
                  <Badge variant="secondary">
                    {getRoleDisplayName(user.role)}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Статус email</p>
                  {isEmailVerified() ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 flex items-center gap-1 w-fit">
                      <CheckCircle className="w-3 h-3" />
                      Подтвержден
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 flex items-center gap-1 w-fit">
                      <AlertTriangle className="w-3 h-3" />
                      Не подтвержден
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground">Имя</p>
                  <p className="font-medium">{user.firstName || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Фамилия</p>
                  <p className="font-medium">{user.lastName || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Телефон</p>
                  <p className="font-medium">{user.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Дата регистрации</p>
                  <p className="font-medium">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
              <CardDescription>
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
