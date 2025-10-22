"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { Edit, Save, X, User, Mail } from "lucide-react"

interface ProfileEditFormProps {
  user: {
    username: string
    email: string
  }
  onUpdate?: () => void
}

export function ProfileEditForm({ user, onUpdate }: ProfileEditFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email
  })
  const { toast } = useToast()
  const { refreshUserInfo } = useAuth()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Проверяем, что данные изменились
      const usernameChanged = formData.username !== user.username
      const emailChanged = formData.email !== user.email

      if (!usernameChanged && !emailChanged) {
        setIsEditing(false)
        return
      }

      // Обновляем username если изменился
      if (usernameChanged) {
        const usernameResponse = await apiClient.updateUsername(formData.username)
        if (!usernameResponse.data) {
          throw new Error(usernameResponse.error || 'Ошибка обновления имени пользователя')
        }
      }

      // Обновляем email если изменился
      if (emailChanged) {
        const emailResponse = await apiClient.updateEmail(formData.email)
        if (!emailResponse.data) {
          throw new Error(emailResponse.error || 'Ошибка обновления email')
        }
      }

      toast({
        title: "Успешно",
        description: "Профиль обновлен"
      })

      // Обновляем информацию о пользователе
      await refreshUserInfo()
      
      setIsEditing(false)
      onUpdate?.()
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить профиль",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      username: user.username,
      email: user.email
    })
    setIsEditing(false)
  }

  const handleInputChange = (field: 'username' | 'email', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Имя пользователя</Label>
          {isEditing ? (
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Введите имя пользователя"
              disabled={isLoading}
            />
          ) : (
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{user.username}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email адрес</Label>
          {isEditing ? (
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Введите email адрес"
              disabled={isLoading}
            />
          ) : (
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{user.email || 'Не указан'}</span>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="w-full"
            >
              <Edit className="h-4 w-4 mr-2" />
              Редактировать
            </Button>
          </div>
        )}

        {isEditing && (
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              <X className="h-4 w-4 mr-2" />
              Отмена
            </Button>
          </div>
        )}
    </div>
  )
}
