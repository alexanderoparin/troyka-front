"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { User, Camera, X, MessageCircle, Upload } from "lucide-react"
import { AvatarUpload } from "./avatar-upload"

interface TelegramAvatarProps {
  userName?: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function TelegramAvatar({ 
  userName, 
  className = "",
  size = "md" 
}: TelegramAvatarProps) {
  const [telegramAvatar, setTelegramAvatar] = useState<string | null>(null)
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { user, refreshUserInfo } = useAuth()

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-20 w-20"
  }

  // Загружаем аватары при монтировании компонента
  useEffect(() => {
    const loadAvatars = async () => {
      setIsLoading(true)
      try {
        // Загружаем загруженный аватар
        const uploadedResponse = await apiClient.getUserAvatar()
        if (uploadedResponse.data) {
          setUploadedAvatar(uploadedResponse.data)
        }

        // Загружаем Telegram аватар (если есть telegramPhotoUrl)
        if (user?.telegramPhotoUrl) {
          setTelegramAvatar(user.telegramPhotoUrl)
        }
      } catch (error) {
        console.error('Ошибка загрузки аватаров:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAvatars()
  }, [user?.telegramPhotoUrl])

  const getInitials = (name?: string) => {
    if (!name) return null
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Определяем, какой аватар показывать (приоритет: Telegram > загруженный)
  const displayAvatar = telegramAvatar || uploadedAvatar
  const avatarSource = telegramAvatar ? 'telegram' : uploadedAvatar ? 'uploaded' : 'none'

  const handleAvatarChange = async (newAvatarUrl: string) => {
    setUploadedAvatar(newAvatarUrl)
    await refreshUserInfo()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Аватар профиля
        </CardTitle>
        <CardDescription>
          Отображение аватара из Telegram или загруженного файла
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar 
            className={`${sizeClasses[size]} ${className}`}
          >
            <AvatarImage 
              src={displayAvatar || undefined} 
              alt="Аватар пользователя"
            />
            <AvatarFallback className="text-xs font-medium">
              {getInitials(userName) || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Источник аватара:</span>
              {avatarSource === 'telegram' && (
                <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  Telegram
                </Badge>
              )}
              {avatarSource === 'uploaded' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  Загруженный
                </Badge>
              )}
              {avatarSource === 'none' && (
                <Badge variant="outline">
                  Не установлен
                </Badge>
              )}
            </div>
            
            {telegramAvatar && (
              <p className="text-xs text-muted-foreground">
                Аватар из Telegram имеет приоритет над загруженным
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Управление аватаром</h4>
          <div className="flex gap-2">
            <AvatarUpload 
              currentAvatar={uploadedAvatar || undefined}
              userName={userName}
              size="sm"
              onAvatarChange={handleAvatarChange}
            />
            <div className="text-xs text-muted-foreground flex items-center">
              <span>Загрузить новый аватар</span>
            </div>
          </div>
        </div>

        {telegramAvatar && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Аватар из Telegram
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Ваш аватар автоматически синхронизируется с Telegram профилем. 
                  Чтобы изменить аватар, обновите его в Telegram.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
