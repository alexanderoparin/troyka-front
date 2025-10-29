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
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { TelegramLoginButton } from "@/components/telegram-login-button"
import { Separator } from "@/components/ui/separator"

const loginSchema = z.object({
  username: z.string().min(3, "Логин должен содержать минимум 3 символа"),
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6">
      <div className="w-full max-w-md space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold">Вход в аккаунт</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Войдите, чтобы начать создавать изображения
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardContent className="overflow-x-hidden">
            {/* Telegram Login - First */}
            <div className="mt-8 sm:mt-10 mb-8 sm:mb-10 w-full flex justify-center items-center px-2">
              <div className="w-full max-w-[280px] flex justify-center">
                <TelegramLoginButton
                  onAuthCallback={handleTelegramAuth}
                  botName={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "reshai24_bot"}
                  buttonSize="large"
                  className="w-full"
                />
              </div>
            </div>

            {/* Separator */}
            <div className="relative mb-6">
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Логин</Label>
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

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
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
                className="w-full py-3 sm:py-2"
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

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
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