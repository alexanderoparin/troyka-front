"use client"

import { useAuth } from "@/contexts/auth-context"
import { useImageHistory } from "@/hooks/use-image-history"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Mail, 
  LogOut,
  AlertCircle,
  Calendar,
  Shield,
  History,
  Image as ImageIcon,
  ExternalLink
} from "lucide-react"
import { ImageEditButton } from "@/components/image-edit-button"
import { AvatarUpload } from "@/components/avatar-upload"
import { formatDate } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import Link from "next/link"
import Image from "next/image"

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, logout, avatar } = useAuth()
  const { history: imageHistory, isLoading: historyLoading, error: historyError } = useImageHistory()
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
        {/* Profile Info */}
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

              {(user.firstName || user.lastName) && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Имя</p>
                    <p className="font-medium">{user.firstName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Фамилия</p>
                    <p className="font-medium">{user.lastName || "—"}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image Generation History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                История генерации изображений
              </CardTitle>
              <CardDescription>
                Ваши последние созданные изображения
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : historyError ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Ошибка загрузки истории: {historyError}</p>
                </div>
              ) : imageHistory && imageHistory.length > 0 ? (
                <div className="space-y-4">
                  {imageHistory.slice(0, 6).map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={apiClient.getFileUrl(item.imageUrl)}
                          alt={item.prompt}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" title={item.prompt}>
                          {item.prompt}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(new Date(item.createdAt))}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 w-8 p-0"
                        >
                          <a
                            href={apiClient.getFileUrl(item.imageUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <ImageEditButton
                          imageUrl={item.imageUrl}
                          originalPrompt={item.prompt}
                          onImageEdited={() => {
                            // Обновляем историю после редактирования
                            window.location.reload();
                          }}
                          className="h-8 w-8"
                        />
                      </div>
                    </div>
                  ))}
                  {imageHistory.length > 6 && (
                    <div className="text-center pt-2">
                      <Button variant="outline" asChild>
                        <Link href="/history">
                          <History className="w-4 h-4 mr-2" />
                          Показать всю историю
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>История генерации пуста</p>
                  <p className="text-sm">Создайте первое изображение в студии</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
