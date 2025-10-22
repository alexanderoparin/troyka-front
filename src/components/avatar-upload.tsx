"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import { Camera, X, User, MoreVertical } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface AvatarUploadProps {
  currentAvatar?: string
  userName?: string
  onAvatarChange?: (newAvatarUrl: string) => void
  size?: "sm" | "md" | "lg"
  className?: string
  telegramPhotoUrl?: string
}

export function AvatarUpload({ 
  currentAvatar, 
  userName,
  onAvatarChange, 
  size = "md",
  className = "",
  telegramPhotoUrl
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
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
      const response = await apiClient.uploadFile(file)
      
      if (response.data) {
        // Сохраняем аватар через ваш endpoint
        try {
          const formData = new FormData()
          formData.append('file', file)
          
          const saveResponse = await fetch(`${apiClient.getBaseUrl()}/api/users/avatar/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiClient.getAuthToken()}`,
            },
            body: formData
          })
          
          if (saveResponse.ok) {
            toast({
              title: "Успешно",
              description: "Аватар загружен и сохранен"
            })
          } else {
            toast({
              title: "Частично успешно",
              description: "Файл загружен, но не сохранен как аватар"
            })
          }
        } catch (error) {
          console.warn('Не удалось сохранить аватар:', error)
          toast({
            title: "Частично успешно",
            description: "Файл загружен, но не сохранен как аватар"
          })
        }
        
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

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Если нет аватара, сразу открываем загрузку
    if (!currentAvatar) {
      handleUploadClick()
    }
    // Если есть аватар, показываем меню
    else {
      setShowMenu(!showMenu)
    }
  }

  const handleUploadClick = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    fileInputRef.current?.click()
    setShowMenu(false)
  }

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Подтверждение удаления
    if (window.confirm('Вы уверены, что хотите удалить аватар?')) {
      handleRemoveAvatar()
    }
    setShowMenu(false)
  }

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Закрываем меню при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && !(event.target as Element).closest('.avatar-upload-container')) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  return (
    <div className={`relative inline-block avatar-upload-container ${className}`}>
      <Avatar 
        className={`${sizeClasses[size]} cursor-pointer group hover:ring-2 hover:ring-primary/50 transition-all duration-200 ${isMobile && !showMenu ? 'ring-2 ring-blue-500/50' : ''}`}
        onClick={handleAvatarClick}
      >
        <AvatarImage 
          src={previewUrl || telegramPhotoUrl || currentAvatar || undefined} 
          alt="Аватар пользователя"
        />
        <AvatarFallback className="text-xs font-medium">
          {getInitials(userName) || <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      
      {/* Выпадающее меню */}
      {showMenu && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 min-w-[160px]">
          <div className="py-1">
            <Button
              variant="ghost"
              className="w-full justify-start px-3 py-2 h-auto text-sm"
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              ) : (
                <Camera className="h-4 w-4 mr-2" />
              )}
              {isUploading ? 'Загрузка...' : 'Изменить аватар'}
            </Button>
            
            {currentAvatar && (
              <Button
                variant="ghost"
                className="w-full justify-start px-3 py-2 h-auto text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleRemoveClick}
              >
                <X className="h-4 w-4 mr-2" />
                Удалить аватар
              </Button>
            )}
          </div>
        </div>
      )}

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
