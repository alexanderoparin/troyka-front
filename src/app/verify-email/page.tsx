"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle, Mail, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null)
  const [processedToken, setProcessedToken] = useState<string | null>(null)
  const isProcessingRef = useRef(false)

  // Авто-редирект в студию после успешной верификации
  useEffect(() => {
    if (isVerified) {
      const timer = setTimeout(() => {
        router.push('/studio')
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [isVerified, router])

  useEffect(() => {
    const token = searchParams.get('token')
    const emailParam = searchParams.get('email')
    
    console.log('useEffect triggered:', { token, emailParam, verificationResult, processedToken, isVerifying, isProcessingRef: isProcessingRef.current })
    
    // Если уже обработали результат, не делаем повторные запросы
    if (verificationResult !== null) {
      console.log('Already processed, skipping')
      return
    }

    // Если уже обрабатываем этот токен, не делаем повторные запросы
    if (token && processedToken === token) {
      console.log('Token already being processed, skipping')
      return
    }

    // Дополнительная защита через useRef
    if (isProcessingRef.current) {
      console.log('Already processing (ref), skipping')
      return
    }

    // Дополнительная защита через localStorage
    const storageKey = `verification_${token}`
    const stored = token ? localStorage.getItem(storageKey) : null
    if (stored) {
      console.log('Token already processed (localStorage), skipping')
      // Считаем, что в предыдущей попытке подтверждение уже прошло или обрабатывается;
      // в любом случае прекращаем спиннер на UI
      setIsLoading(false)
      setVerificationResult(true)
      setIsVerified(true)
      return
    }
    
    if (emailParam) {
      setEmail(emailParam)
    }
    
    if (!token) {
      // Если нет токена, но есть email - это нормальная ситуация после регистрации
      if (emailParam) {
        setIsLoading(false)
        setVerificationResult(false)
        return
      }
      // Если нет ни токена, ни email - это ошибка
      setError('Токен подтверждения не найден')
      setIsLoading(false)
      setVerificationResult(false)
      return
    }

    // Отмечаем токен как обрабатываемый СРАЗУ
    isProcessingRef.current = true
    localStorage.setItem(storageKey, 'processing')
    setProcessedToken(token)
    verifyEmail(token)
  }, [searchParams]) // Убираем лишние зависимости

  const verifyEmail = async (token: string) => {
    console.log('verifyEmail called with token:', token, 'isVerifying:', isVerifying, 'processedToken:', processedToken)
    
    // Защита от повторных запросов
    if (isVerifying) {
      console.log('Already verifying, skipping')
      return
    }

    // Дополнительная защита - если токен уже обрабатывался
    if (processedToken && processedToken !== token) {
      console.log('Different token already processed, skipping')
      return
    }

    try {
      console.log('Starting verification for token:', token)
      setIsVerifying(true)
      setIsLoading(true)
      const response = await apiClient.verifyEmail(token)
      
      if (response.data) {
        console.log('Verification successful for token:', token)
        setIsVerified(true)
        setVerificationResult(true)
        setIsLoading(false) // Убираем загрузку при успехе
        // Сохраняем факт успешного подтверждения, чтобы не показывать спиннер при повторном маунте
        try { localStorage.setItem(`verification_${token}`, 'done') } catch {}
        toast({
          title: "Email подтвержден!",
          description: "Ваш email адрес успешно подтвержден",
        })
      } else {
        console.log('Verification failed for token:', token, 'error:', response.error)
        setError(response.error || 'Ошибка подтверждения email')
        setVerificationResult(false)
        setIsLoading(false) // Убираем загрузку при ошибке
        toast({
          title: "Ошибка подтверждения",
          description: response.error || 'Не удалось подтвердить email',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.log('Verification error for token:', token, 'error:', error)
      setError('Произошла ошибка при подтверждении email')
      setVerificationResult(false)
      setIsLoading(false) // Убираем загрузку при ошибке
      toast({
        title: "Ошибка",
        description: "Произошла непредвиденная ошибка",
        variant: "destructive",
      })
    } finally {
      console.log('Verification completed for token:', token)
      setIsVerifying(false)
      isProcessingRef.current = false
      // Не удаляем ключ 'done', чтобы избежать повторного спиннера при F5
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
            ) : error && error !== 'Токен подтверждения не найден' ? (
              <XCircle className="w-8 h-8 text-red-600" />
            ) : (
              <Mail className="w-8 h-8 text-blue-600" />
            )}
          </div>
          
          <CardTitle className="text-2xl">
            {isLoading ? 'Подтверждение email...' : 
             isVerified ? 'Email подтвержден!' : 
             error && error !== 'Токен подтверждения не найден' ? 'Ошибка подтверждения' :
             'Проверьте почту'}
          </CardTitle>
          
          <CardDescription>
            {isLoading ? 'Пожалуйста, подождите...' :
             isVerified ? 'Ваш email адрес успешно подтвержден' :
             error && error !== 'Токен подтверждения не найден' ? 'Не удалось подтвердить email адрес' :
             email ? `Письмо с подтверждением отправлено на ${email}` :
             'Письмо с подтверждением отправлено на ваш email'}
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
          ) : error && error !== 'Токен подтверждения не найден' ? (
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">Ошибка подтверждения</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                  {error}
                </p>
              </div>
              
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
          ) : error === 'Токен подтверждения не найден' ? (
            <div className="space-y-4">
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
