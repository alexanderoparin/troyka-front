"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Mail, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"

interface EmailVerificationBannerProps {
  email: string
  onDismiss?: () => void
}

export function EmailVerificationBanner({ email, onDismiss }: EmailVerificationBannerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const router = useRouter()

  const handleResendEmail = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.resendVerificationEmail()
      
      if (response.data) {
        toast({
          title: "Письмо отправлено!",
          description: "Проверьте почту для подтверждения email",
        })
      } else {
        toast({
          title: "Ошибка отправки",
          description: response.error || "Не удалось отправить письмо",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла непредвиденная ошибка",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  const handleGoToVerification = () => {
    router.push('/verify-email')
  }

  if (isDismissed) {
    return null
  }

  return (
    <div className="border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            Подтвердите ваш email адрес
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            Подтверждение email <strong>{email}</strong> необязательно. Это поможет восстановить доступ к аккаунту.
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToVerification}
            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/50"
          >
            <Mail className="w-4 h-4 mr-2" />
            Подтвердить (необязательно)
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResendEmail}
            disabled={isLoading}
            className="text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/50"
          >
            {isLoading ? "Отправка..." : "Отправить повторно"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
