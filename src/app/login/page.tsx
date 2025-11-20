"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { TelegramLoginButton } from "@/components/telegram-login-button"
import { Separator } from "@/components/ui/separator"

const loginSchema = z.object({
  username: z.string()
    .min(1, "Логин обязателен")
    .refine((val) => val.trim().length >= 3, {
      message: "Логин должен содержать минимум 3 символа (без учета пробелов)",
    })
    .refine((val) => val.trim() === val, {
      message: "Логин не может начинаться или заканчиваться пробелом",
    })
    .transform((val) => val.trim()),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login, loginWithTelegram } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      const result = await login(data)

      if (result.success) {
        toast({
          title: "Успешный вход!",
          description: "Добро пожаловать в 24reshai",
        })
        router.push("/studio")
      } else {
        toast({
          title: "Ошибка входа",
          description: result.error || "Неверные учетные данные",
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
    console.log('Telegram auth received:', user)
    setIsLoading(true)
    
    try {
      const result = await loginWithTelegram(user)
      
      if (result.success) {
        toast({
          title: "Успешный вход через Telegram!",
          description: "Добро пожаловать в 24reshai",
        })
        router.push("/studio")
      } else {
        toast({
          title: "Ошибка входа через Telegram",
          description: result.error || "Не удалось войти через Telegram",
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
      <div className="flex justify-center relative z-10 py-1 sm:py-3 lg:py-1">
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
          <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
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

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-3/5 flex items-center justify-center relative z-10 p-3 sm:p-5 lg:p-6 lg:px-5">
          <div className="w-full max-w-md lg:max-w-lg space-y-4">
            {/* Header */}
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold">Вход в аккаунт</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Войдите, чтобы начать создавать изображения
              </p>
            </div>

            {/* Login Card */}
            <Card className="border-0 shadow-lg overflow-visible">
              <CardContent className="overflow-visible p-4 sm:p-6">
                {/* Telegram Login - First */}
                <div className="mt-2 mb-4 w-full flex justify-center items-center overflow-visible">
                  <div className="flex justify-center pr-3 pl-3 py-2 overflow-visible">
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

                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-sm">Логин</Label>
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
                    <Label htmlFor="password" className="text-sm">Пароль</Label>
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
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
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
                        Вход...
                      </div>
                    ) : (
                      "Войти"
                    )}
                  </Button>
                </form>

                <div className="mt-4 text-center space-y-1.5">
                  <p className="text-xs text-muted-foreground">
                    Нет аккаунта?{" "}
                    <Link href="/register" className="text-primary hover:underline">
                      Зарегистрироваться
                    </Link>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <Link href="/forgot-password" className="text-primary hover:underline">
                      Забыли пароль?
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
