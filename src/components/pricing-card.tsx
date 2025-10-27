"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Check, Star, Plus } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { PricingPlanResponse, apiClient } from "@/lib/api-client"
import { config } from "@/lib/config"

interface PricingCardProps {
  plan: PricingPlanResponse
  isPopular?: boolean
  className?: string
}

export function PricingCard({ plan, isPopular = false, className }: PricingCardProps) {
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const generationsCount = Math.floor(plan.credits / config.GENERATION_POINTS_PER_IMAGE)
  // Используем unitPriceRubComputed с бэка (цена за генерацию в копейках), если есть, иначе считаем на фронте
  const pricePerGeneration = plan.unitPriceRubComputed ? plan.unitPriceRubComputed : (plan.priceRub / generationsCount)
  const isPlanPopular = isPopular || plan.isPopular

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
      const response = await apiClient.createPayment({
        amount: plan.priceRub / 100, // Конвертируем из копеек в рубли
        description: `Пополнение баланса - ${plan.name} (${plan.credits} поинтов)`,
        credits: plan.credits, // Передаем количество поинтов
      })

      if (response.data) {
        // Перенаправляем на страницу оплаты Робокассы
        window.location.href = response.data.paymentUrl
      } else {
        toast({
          title: "Ошибка создания платежа",
          description: response.error || "Не удалось создать заказ. Попробуйте еще раз.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Payment error:', error)
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
    <div className={cn(
      "card-ios p-8 relative animate-ios-fade-in bg-slate-50 dark:bg-card border-slate-200 dark:border-border",
      isPlanPopular && "card-ios-elevated",
      className
    )}>
      {isPlanPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-callout font-medium">
          <Star className="w-3 h-3 mr-1 inline" />
          Популярный
        </div>
      )}
      
      <div className="text-center mb-8">
        <h3 className="text-title-3 text-foreground mb-4">{plan.name}</h3>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-foreground">
            {formatCurrency(plan.priceRub / 100)}
          </div>
          <p className="text-callout text-muted-foreground">
            {plan.credits} поинтов • ~{generationsCount} генераций
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Features */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-blue-500" />
            <span className="text-body text-foreground">{generationsCount} изображений</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-blue-500" />
            <span className="text-body text-foreground">~{formatCurrency(pricePerGeneration / 100)} за генерацию</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-blue-500" />
            <span className="text-body text-foreground">Высокое разрешение</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-blue-500" />
            <span className="text-body text-foreground">Коммерческое использование</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-blue-500" />
            <span className="text-body text-foreground">Поинты не сгорают</span>
          </div>
        </div>

        {/* Purchase Button */}
        <button
          className={cn(
            "w-full btn-ios transition-ios",
            isPlanPopular ? "btn-ios-primary" : "btn-ios-ghost"
          )}
          onClick={handlePurchase}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <div className="ios-spinner mr-3" />
          ) : (
            <Plus className="w-5 h-5 mr-3" />
          )}
          {isProcessing ? "Обработка..." : "Купить поинты"}
        </button>

        {/* Description from DB */}
        {plan.description && (
          <p className="text-footnote text-muted-foreground text-center">
            {plan.description}
          </p>
        )}
      </div>
    </div>
  )
}
