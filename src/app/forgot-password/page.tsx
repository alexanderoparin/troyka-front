"use client"

import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import { Sparkles, ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"

const forgotPasswordSchema = z.object({
  email: z.string().email("Введите корректный email"),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [cooldownEndTime, setCooldownEndTime] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  // const router = useRouter()
  const { toast } = useToast()

  // Отслеживаем оставшееся время кулдауна
  useEffect(() => {
    if (!cooldownEndTime) return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = Math.max(0, cooldownEndTime.getTime() - now.getTime())
      setTimeLeft(Math.ceil(diff / 1000))

      if (diff <= 0) {
        setCooldownEndTime(null)
        setTimeLeft(0)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [cooldownEndTime])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)

    try {
      const response = await apiClient.requestPasswordReset(data.email)
      
      // Отладочная информация
      // console.log('Password reset response:', response)

      if (response.data && response.data.message) {
        const message = response.data.message;
        
        if (message.includes("отправлены")) {
          setIsEmailSent(true)
          // Устанавливаем кулдаун на 5 минут
          const cooldownEnd = new Date(Date.now() + 5 * 60 * 1000)
          setCooldownEndTime(cooldownEnd)
          toast({
            title: "Инструкции отправлены!",
            description: "Проверьте вашу почту и следуйте инструкциям",
          })
        } else if (message.includes("не найден")) {
          toast({
            title: "Пользователь не найден",
            description: message,
            variant: "destructive",
          })
        } else if (message.includes("частые запросы")) {
          toast({
            title: "Слишком частые запросы",
            description: message,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Ошибка",
            description: message,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Ошибка",
          description: response.error || "Не удалось отправить инструкции",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Произошла непредвиденная ошибка",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Success State */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold">Проверьте почту</h1>
            <p className="text-muted-foreground">
              Мы отправили инструкции по восстановлению пароля на вашу почту
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Не получили письмо? Проверьте папку "Спам" или попробуйте еще раз
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEmailSent(false)}
                    className="w-full"
                    disabled={timeLeft > 0}
                  >
                    {timeLeft > 0 ? `Повторить через ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : 'Отправить еще раз'}
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/login">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Вернуться к входу
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6">
      <div className="w-full max-w-md space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </div>
            <span className="text-lg sm:text-xl font-bold">24reshai</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">Восстановление пароля</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Введите email для получения инструкций по восстановлению пароля
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Забыли пароль?</CardTitle>
            <CardDescription>
              Не волнуйтесь! Мы отправим инструкции по восстановлению на вашу почту
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Введите ваш email"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || timeLeft > 0}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Отправляем...
                  </div>
                ) : timeLeft > 0 ? (
                  `Повторить через ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Отправить инструкции
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Вспомнили пароль?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Войти в аккаунт
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              На главную
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
