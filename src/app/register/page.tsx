"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Sparkles, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

const registerSchema = z.object({
  username: z.string().min(3, "Логин должен содержать минимум 3 символа"),
  email: z.string().email("Введите корректный email"),
  password: z.string()
    .min(8, "Пароль должен содержать минимум 8 символов")
    .regex(/[a-zа-я]/, "Пароль должен содержать строчные буквы")
    .regex(/[A-ZА-Я]/, "Пароль должен содержать заглавные буквы")
    .regex(/\d/, "Пароль должен содержать цифры"),
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { register: registerUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)

    try {
      const result = await registerUser(data)

      if (result.success) {
        toast({
          title: "Регистрация успешна!",
          description: "Проверьте почту для подтверждения email",
        })
        router.push("/verify-email?email=" + encodeURIComponent(data.email))
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
          <h1 className="text-xl sm:text-2xl font-bold">Создание аккаунта</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Зарегистрируйтесь, чтобы начать создавать изображения
          </p>
        </div>

        {/* Register Form */}
        <Card>
          <CardHeader>
            <CardTitle>Регистрация</CardTitle>
            <CardDescription>
              Создайте новый аккаунт для доступа к сервису
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Логин *</Label>
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
                <Label htmlFor="email">Email *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="password">Пароль *</Label>
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

              <Button
                type="submit"
                className="w-full"
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

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Уже есть аккаунт?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Войти
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
