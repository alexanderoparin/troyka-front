"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Check, Zap, Star } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { PricingPlan } from "@/lib/pricing"

interface PricingCardProps {
  plan: PricingPlan
  isPopular?: boolean
  className?: string
}

export function PricingCard({ plan, isPopular = false, className }: PricingCardProps) {
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const generationsCount = Math.floor(plan.credits / 3)
  const pricePerGeneration = plan.priceRub / generationsCount

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в аккаунт для покупки поинтов",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // TODO: Реализовать покупку поинтов через Java бэкенд
      toast({
        title: "Функция в разработке",
        description: "Покупка поинтов будет доступна в ближайшее время",
        variant: "destructive",
      })
    } catch (error) {
      toast({
        title: "Ошибка покупки",
        description: "Не удалось создать заказ. Попробуйте еще раз.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className={cn("relative", isPopular && "border-primary shadow-lg", className)}>
      {isPopular && (
        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
          <Star className="w-3 h-3 mr-1" />
          Популярный
        </Badge>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <div className="space-y-2">
          <div className="text-3xl font-bold">
            {formatCurrency(plan.priceRub / 100)}
          </div>
          <CardDescription className="text-sm">
            {plan.credits} поинтов • ~{generationsCount} генераций
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Features */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>{generationsCount} изображений</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>~{formatCurrency(pricePerGeneration / 100)} за генерацию</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>Высокое разрешение</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>Коммерческое использование</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>Поинты не сгорают</span>
          </div>
        </div>

        {/* Purchase Button */}
        <Button
          className="w-full"
          onClick={handlePurchase}
          disabled={isProcessing}
          variant={isPopular ? "default" : "outline"}
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          ) : (
            <Zap className="w-4 h-4 mr-2" />
          )}
          {isProcessing ? "Обработка..." : "Купить поинты"}
        </Button>

        {/* Price per generation */}
        <p className="text-xs text-muted-foreground text-center">
          Экономия до {Math.round(((30 - pricePerGeneration / 100) / 30) * 100)}% 
          по сравнению с разовыми покупками
        </p>
      </CardContent>
    </Card>
  )
}
