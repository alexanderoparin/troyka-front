"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { MessageCircle, Link, Unlink, CheckCircle, AlertCircle } from "lucide-react"
import { TelegramLoginButton } from "./telegram-login-button"

interface TelegramLinkProps {
  user: {
    telegramId?: number
    telegramUsername?: string
    telegramFirstName?: string
    telegramPhotoUrl?: string
    email?: string
  }
  onUpdate?: () => void
}

export function TelegramLink({ user, onUpdate }: TelegramLinkProps) {
  const [isLinking, setIsLinking] = useState(false)
  const [isUnlinking, setIsUnlinking] = useState(false)
  const { toast } = useToast()
  const { refreshUserInfo } = useAuth()

  const isTelegramLinked = !!user.telegramId

  const handleTelegramAuth = async (telegramData: any) => {
    setIsLinking(true)
    try {
      const response = await apiClient.linkTelegram({
        id: telegramData.id,
        first_name: telegramData.first_name,
        last_name: telegramData.last_name,
        username: telegramData.username,
        photo_url: telegramData.photo_url,
        auth_date: telegramData.auth_date,
        hash: telegramData.hash,
        email: user.email || undefined
      })

      if (response.data) {
        toast({
          title: "Успешно",
          description: "Telegram успешно привязан к аккаунту"
        })
        
        // Обновляем информацию о пользователе
        await refreshUserInfo()
        await refreshPoints()
        onUpdate?.()
      } else {
        throw new Error(response.error || 'Ошибка привязки Telegram')
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось привязать Telegram",
        variant: "destructive"
      })
    } finally {
      setIsLinking(false)
    }
  }

  const handleUnlinkTelegram = async () => {
    if (!window.confirm('Вы уверены, что хотите отвязать Telegram от аккаунта?')) {
      return
    }

    setIsUnlinking(true)
    try {
      const response = await apiClient.unlinkTelegram()
      
      if (response.data) {
        toast({
          title: "Успешно",
          description: "Telegram отвязан от аккаунта"
        })
        
        // Обновляем информацию о пользователе
        await refreshUserInfo()
        await refreshPoints()
        onUpdate?.()
      } else {
        throw new Error(response.error || 'Ошибка отвязки Telegram')
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отвязать Telegram",
        variant: "destructive"
      })
    } finally {
      setIsUnlinking(false)
    }
  }

  return (
    <div className="space-y-4">
        {isTelegramLinked ? (
          <div className="space-y-4">
            {/* Статус привязки */}
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Telegram привязан
              </Badge>
            </div>

            {/* Информация о привязанном аккаунте */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              {user.telegramPhotoUrl && (
                <img 
                  src={user.telegramPhotoUrl} 
                  alt="Telegram аватар" 
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-foreground">
                  {user.telegramFirstName || 'Пользователь Telegram'}
                </p>
                <p className="text-sm text-muted-foreground">
                  @{user.telegramUsername || 'username'}
                </p>
              </div>
            </div>

            {/* Кнопка отвязки */}
            <Button
              variant="outline"
              onClick={handleUnlinkTelegram}
              disabled={isUnlinking}
              className="w-full"
            >
              {isUnlinking ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              ) : (
                <Unlink className="h-4 w-4 mr-2" />
              )}
              {isUnlinking ? 'Отвязка...' : 'Отвязать Telegram'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Статус */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Telegram не привязан
              </Badge>
            </div>


            {/* Кнопка привязки */}
            <div className="flex justify-center">
              <TelegramLoginButton
                botName="reshai24_bot"
                buttonSize="large"
                cornerRadius={8}
                onAuthCallback={handleTelegramAuth}
                requestAccess={false}
                usePic={true}
                lang="ru"
              />
            </div>

            {isLinking && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                Привязка Telegram...
              </div>
            )}
          </div>
        )}
    </div>
  )
}
