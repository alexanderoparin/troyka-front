"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle, Mail, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  // const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    const emailParam = searchParams.get('email')
    
    if (emailParam) {
      setEmail(emailParam)
    }
    
    if (!token) {
      setError('Токен подтверждения не найден')
      setIsLoading(false)
      return
    }

    verifyEmail(token)
  }, [searchParams])

  const verifyEmail = async (token: string) => {
    try {
      setIsLoading(true)
      const response = await apiClient.verifyEmail(token)
      
      if (response.data) {
        setIsVerified(true)
        toast({
          title: "Email подтвержден!",
          description: "Ваш email адрес успешно подтвержден",
        })
      } else {
        setError(response.error || 'Ошибка подтверждения email')
        toast({
          title: "Ошибка подтверждения",
          description: response.error || 'Не удалось подтвердить email',
          variant: "destructive",
        })
      }
    } catch (error) {
      setError('Произошла ошибка при подтверждении email')
      toast({
        title: "Ошибка",
        description: "Произошла непредвиденная ошибка",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
            {isLoading ? (
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            ) : isVerified ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
          
          <CardTitle className="text-2xl">
            {isLoading ? 'Подтверждение email...' : 
             isVerified ? 'Email подтвержден!' : 
             'Ошибка подтверждения'}
          </CardTitle>
          
          <CardDescription>
            {isLoading ? 'Пожалуйста, подождите...' :
             isVerified ? 'Ваш email адрес успешно подтвержден' :
             email ? `Письмо с подтверждением отправлено на ${email}` :
             'Не удалось подтвердить email адрес'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isVerified ? (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Подтверждение успешно!</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                  Теперь вы можете пользоваться всеми функциями сервиса
                </p>
              </div>
              
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/studio">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Перейти в студию
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/account">Мой аккаунт</Link>
                </Button>
              </div>
            </div>
          ) : error ? (
            <div className="space-y-4">
              {error === 'Токен подтверждения не найден' ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">Проверьте почту</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                    {email ? 
                      `Письмо с подтверждением отправлено на ${email}. Перейдите по ссылке в письме для завершения регистрации.` :
                      'Письмо с подтверждением отправлено на ваш email. Перейдите по ссылке в письме для завершения регистрации.'
                    }
                  </p>
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Ошибка подтверждения</span>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                    {error}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Button onClick={handleResendEmail} className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Отправить письмо повторно
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/register">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Вернуться к регистрации
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Подтверждение email...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
