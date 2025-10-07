"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Mail, 
  Phone,
  LogOut,
  AlertCircle,
  Calendar,
  Shield,
  History,
  Image as ImageIcon,
  CreditCard
} from "lucide-react"
import { AvatarUpload } from "@/components/avatar-upload"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, logout, avatar } = useAuth()
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
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Мой аккаунт</h1>
        <p className="text-muted-foreground">
          Управляйте настройками аккаунта
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Profile Info */}
        <div className="space-y-6">
          <Card>
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {user.phone}
                    </div>
                  )}
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
              </div>

              {(user.firstName || user.lastName || user.phone) && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {user.firstName && (
                    <div>
                      <p className="text-muted-foreground">Имя</p>
                      <p className="font-medium">{user.firstName}</p>
                    </div>
                  )}
                  {user.lastName && (
                    <div>
                      <p className="text-muted-foreground">Фамилия</p>
                      <p className="font-medium">{user.lastName}</p>
                    </div>
                  )}
                  {user.phone && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Телефон</p>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Информация об аккаунте
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Статус:</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Активен
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Тип аккаунта:</span>
                <span className="font-medium">{getRoleDisplayName(user.role)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Дата регистрации:</span>
                <span className="font-medium">
                  {formatDate(new Date(user.createdAt))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <Card>
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
                  <CreditCard className="w-4 h-4 mr-2" />
                  Купить поинты
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

          {/* Additional Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Статистика
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Статус аккаунта:</span>
                <span className="font-medium">Активен</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Дата регистрации:</span>
                <span className="font-medium">
                  {formatDate(new Date(user.createdAt))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
