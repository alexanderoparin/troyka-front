"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import { Camera, Upload, X, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface AvatarUploadProps {
  currentAvatar?: string
  userName?: string
  onAvatarChange?: (newAvatarUrl: string) => void
  size?: "sm" | "md" | "lg"
  className?: string
}

export function AvatarUpload({ 
  currentAvatar, 
  userName,
  onAvatarChange, 
  size = "md",
  className = "" 
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { refreshUserInfo } = useAuth()

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-20 w-20"
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите изображение",
        variant: "destructive"
      })
      return
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Ошибка", 
        description: "Размер файла не должен превышать 5MB",
        variant: "destructive"
      })
      return
    }

    // Создаем превью
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Загружаем файл
    setIsUploading(true)
    try {
      const response = await apiClient.uploadAvatar(file)
      
      if (response.data) {
        // Сохраняем аватар через отдельный API вызов
        try {
          const saveResponse = await fetch(`${apiClient.getBaseUrl()}/users/avatar/save`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiClient.getAuthToken()}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ avatarUrl: response.data })
          })
          
          if (!saveResponse.ok) {
            throw new Error('Ошибка сохранения аватара')
          }
        } catch (error) {
          console.warn('Не удалось сохранить аватар в профиле:', error)
          // Продолжаем выполнение, так как файл уже загружен
        }
        
        toast({
          title: "Успешно",
          description: "Аватар обновлен"
        })
        
        // Обновляем информацию о пользователе
        await refreshUserInfo()
        
        // Уведомляем родительский компонент
        onAvatarChange?.(response.data)
        
        // Очищаем превью
        setPreviewUrl(null)
      } else {
        throw new Error(response.error || 'Ошибка загрузки')
      }
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить аватар",
        variant: "destructive"
      })
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
      // Очищаем input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      const response = await apiClient.deleteUserAvatar()
      
      if (response.status === 200) {
        toast({
          title: "Успешно",
          description: "Аватар удален"
        })
        
        // Обновляем информацию о пользователе
        await refreshUserInfo()
        
        // Уведомляем родительский компонент
        onAvatarChange?.('')
      } else {
        throw new Error(response.error || 'Ошибка удаления')
      }
    } catch (error) {
      console.error('Ошибка удаления аватара:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить аватар",
        variant: "destructive"
      })
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return null
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <Avatar className={`${sizeClasses[size]} cursor-pointer group`}>
        <AvatarImage 
          src={previewUrl || currentAvatar} 
          alt="Аватар пользователя"
        />
        <AvatarFallback className="text-xs font-medium">
          {getInitials(userName) || <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      
      {/* Overlay с кнопками */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            className="h-6 w-6 p-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
            ) : (
              <Camera className="h-3 w-3" />
            )}
          </Button>
          
          {currentAvatar && (
            <Button
              size="sm"
              variant="destructive"
              className="h-6 w-6 p-0"
              onClick={handleRemoveAvatar}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Скрытый input для выбора файла */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
