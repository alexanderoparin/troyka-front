"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { config } from "@/lib/config"
import { getPointsText } from "@/lib/grammar"
import { TelegramLoginButton } from "@/components/telegram-login-button"
import { Separator } from "@/components/ui/separator"
import { useQueryClient } from "@tanstack/react-query"

const registerSchema = z.object({
  username: z.string().min(3, "Логин должен содержать минимум 3 символа"),
  email: z.string().email("Введите корректный email"),
  password: z.string()
    .min(8, "Пароль должен содержать минимум 8 символов")
    .regex(/[a-zа-я]/, "Пароль должен содержать строчные буквы")
    .regex(/[A-ZА-Я]/, "Пароль должен содержать заглавные буквы")
    .regex(/\d/, "Пароль должен содержать цифры"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "Необходимо принять пользовательское соглашение, политику конфиденциальности и политику возврата",
  }),
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { register: registerUser, loginWithTelegram } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      agreeToTerms: false,
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)

    try {
      const result = await registerUser(data)

      if (result.success) {
        toast({
          title: "Регистрация успешна!",
          description: "Можете сразу пользоваться студией. Письмо подтверждения отправлено на почту (необязательно).",
        })
        router.push("/studio")
      } else {
        toast({
          title: "Ошибка регистрации",
          description: result.error || "Не удалось создать аккаунт",
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

  const handleTelegramAuth = async (user: any) => {
    setIsLoading(true)
    
    try {
      const result = await loginWithTelegram(user)
      
      if (result.success) {
        // Инвалидируем кэш сессий для обновления списка после создания дефолтной сессии
        queryClient.invalidateQueries({ queryKey: ['sessions'] })
        queryClient.invalidateQueries({ queryKey: ['defaultSession'] })
        
        // Проверяем, является ли пользователь новым
        if (result.data?.isNewUser) {
          toast({
            title: "Успешная регистрация через Telegram!",
            description: `Добро пожаловать в 24reshai! Вы получили ${getPointsText(config.REGISTRATION_POINTS)} при регистрации.`,
          })
        } else {
          toast({
            title: "Успешный вход через Telegram!",
            description: "Добро пожаловать обратно в 24reshai!",
          })
        }
        router.push("/studio")
      } else {
        toast({
          title: "Ошибка регистрации через Telegram",
          description: result.error || "Не удалось зарегистрироваться через Telegram",
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
    <div className="relative bg-white dark:bg-slate-900">
      {/* Background radial gradient - только для контента страницы */}
      <div className="fixed inset-0 bg-white dark:bg-slate-900 pointer-events-none -z-10"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.3)_0%,_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.3)_0%,_transparent_70%)] pointer-events-none -z-10"></div>
      
      {/* Container для центрирования */}
      <div className="flex justify-center relative z-10 py-8">
        <div className="w-full max-w-5xl flex">
        {/* Left Side - Hero Panel */}
        <div className="hidden lg:flex lg:w-2/5 lg:h-screen relative overflow-hidden">
          {/* Decorative stars/particles */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-10"></div>
          <div className="absolute top-32 right-32 w-3 h-3 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-10" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-32 left-32 w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-10" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 right-20 w-3 h-3 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-10" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-10" style={{ animationDelay: '0.3s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-10" style={{ animationDelay: '0.8s' }}></div>
          
          {/* Logo Image - Reduced size */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-12">
            <div className="relative w-72 h-72 max-w-full max-h-full">
              <Image
                src="/login-hero.png"
                alt="24reshai Logo"
                fill
                className="object-contain drop-shadow-2xl"
                priority
                sizes="320px"
              />
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full lg:w-3/5 flex items-center justify-center relative z-10 p-4 sm:p-6 lg:p-8 lg:px-6">
          <div className="w-full max-w-md lg:max-w-lg space-y-4">
            {/* Header */}
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold">Создание аккаунта</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Зарегистрируйтесь, чтобы начать создавать изображения
              </p>
            </div>

            {/* Register Card */}
            <Card className="border-0 shadow-lg overflow-visible">
              <CardContent className="overflow-visible p-4 sm:p-6">
                {/* Telegram Login - First */}
                <div className="mt-2 mb-4 w-full flex justify-center items-center px-2 overflow-visible">
                  <div className="w-full max-w-[280px] flex justify-center p-2 overflow-visible">
                    <TelegramLoginButton
                      onAuthCallback={handleTelegramAuth}
                      botName={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "reshai24_bot"}
                      buttonSize="large"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Separator */}
                <div className="relative mb-4 mt-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      или
                    </span>
                  </div>
                </div>

                {/* Register Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-sm">Логин *</Label>
                    <Input
                      id="username"
                      {...register("username")}
                      placeholder="Введите логин"
                      disabled={isLoading}
                    />
                    {errors.username && (
                      <p className="text-sm text-destructive">{errors.username.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="Введите email"
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm">Пароль *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        placeholder="Введите пароль"
                        disabled={isLoading}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы и цифры
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agree-to-terms"
                        {...register("agreeToTerms")}
                      />
                      <Label
                        htmlFor="agree-to-terms"
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Я принимаю{" "}
                        <Link href="/legal" className="text-primary hover:underline" target="_blank">
                          пользовательское соглашение
                        </Link>
                        {", "}
                        <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                          политику конфиденциальности
                        </Link>
                        {" "}и{" "}
                        <Link href="/refund" className="text-primary hover:underline" target="_blank">
                          политику возврата
                        </Link>
                      </Label>
                    </div>
                    {errors.agreeToTerms && (
                      <p className="text-sm text-destructive">{errors.agreeToTerms.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-2 text-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Регистрация...
                      </div>
                    ) : (
                      "Зарегистрироваться"
                    )}
                  </Button>
                </form>

                <div className="mt-4 text-center space-y-1.5">
                  <p className="text-xs text-muted-foreground">
                    Уже есть аккаунт?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                      Войти
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Back to Home */}
            <div className="text-center pt-4">
              <Button variant="ghost" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  На главную
                </Link>
              </Button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
