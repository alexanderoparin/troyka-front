"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useGenerationPoints } from "@/hooks/use-generation-points"
import { useToast } from "@/components/ui/use-toast"
import { Check, Star, Plus } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { PricingPlanResponse, apiClient } from "@/lib/api-client"

interface PricingCardProps {
  plan: PricingPlanResponse
  isPopular?: boolean
  className?: string
}

export function PricingCard({ plan, isPopular = false, className }: PricingCardProps) {
  const { isAuthenticated } = useAuth()
  const { data: generationPoints, pointsPerImage } = useGenerationPoints()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const pro = generationPoints?.pointsPerImagePro ?? { '1K': 4, '2K': 4, '4K': 5 }
  const planPriceRub = plan.priceRub / 100

  // 1K и 2К объединены в одну строку (используем поинты для 1K)
  const models: { label: string; pointsPerImage: number }[] = [
    { label: 'Nano Banana', pointsPerImage },
    { label: 'Nano Banana PRO 1K и 2K', pointsPerImage: pro['1K'] },
    { label: 'Nano Banana PRO 4K', pointsPerImage: pro['4K'] },
  ]

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
            {plan.credits} поинтов
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* По моделям: изображений и стоимость за генерацию */}
        <div className="space-y-3 rounded-lg bg-muted/40 dark:bg-muted/20 border border-border/40 p-3 sm:p-4">
          {models.map(({ label, pointsPerImage: pts }) => {
            const imagesCount = Math.floor(plan.credits / pts)
            const pricePerGen = imagesCount > 0 ? planPriceRub / imagesCount : 0
            return (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-callout font-semibold text-foreground">{label}</span>
                <span className="text-footnote text-muted-foreground block">
                  {imagesCount} изображений
                  <br />
                  ~{formatCurrency(pricePerGen)} за генерацию
                </span>
              </div>
            )
          })}
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
