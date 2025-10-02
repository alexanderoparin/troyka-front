"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import { Sparkles, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, "Пароль должен содержать минимум 8 символов")
    .regex(/[a-z]/, "Пароль должен содержать строчные буквы")
    .regex(/[A-Z]/, "Пароль должен содержать заглавные буквы")
    .regex(/\d/, "Пароль должен содержать цифры")
    .regex(/[@$!%*?&]/, "Пароль должен содержать специальные символы (@$!%*?&)"),
  confirmPassword: z.string().min(8, "Подтверждение пароля обязательно"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const newPassword = watch("newPassword")

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token")
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
      setIsValidToken(true)
    } else {
      setIsValidToken(false)
    }
  }, [searchParams])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast({
        title: "Ошибка",
        description: "Токен восстановления не найден",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await apiClient.resetPassword({
        token,
        newPassword: data.newPassword,
      })

      if (response.data) {
        setIsSuccess(true)
        toast({
          title: "Пароль изменен!",
          description: "Ваш пароль успешно обновлен",
        })
      } else {
        toast({
          title: "Ошибка",
          description: response.error || "Не удалось изменить пароль",
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

  if (isValidToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold">Недействительная ссылка</h1>
            <p className="text-muted-foreground">
              Ссылка для восстановления пароля недействительна или истекла
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Запросите новую ссылку для восстановления пароля
                </p>
                <Button asChild className="w-full">
                  <Link href="/forgot-password">
                    Запросить новую ссылку
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/login">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Вернуться к входу
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold">Пароль изменен!</h1>
            <p className="text-muted-foreground">
              Ваш пароль успешно обновлен. Теперь вы можете войти в аккаунт
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Button asChild className="w-full">
                  <Link href="/login">
                    Войти в аккаунт
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    На главную
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xl font-bold">24reshai</span>
          </div>
          <h1 className="text-2xl font-bold">Новый пароль</h1>
          <p className="text-muted-foreground">
            Введите новый пароль для вашего аккаунта
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Установить новый пароль</CardTitle>
            <CardDescription>
              Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Новый пароль</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...register("newPassword")}
                  placeholder="Введите новый пароль"
                  disabled={isLoading}
                />
                <div className="text-xs text-muted-foreground">
                  Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы (@$!%*?&)
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  placeholder="Повторите новый пароль"
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Password strength indicator */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Надежность пароля:</div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          newPassword.length >= level * 2
                            ? "bg-green-500"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Изменяем пароль...
                  </div>
                ) : (
                  "Изменить пароль"
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
