"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Star, Sparkles } from "lucide-react"
import { PricingCard } from "@/components/pricing-card"
import { usePricingPlans } from "@/hooks/use-pricing-plans"
import { useAuth } from "@/contexts/auth-context"
import { getPointsText } from "@/lib/grammar"
import { PricingPlanResponse } from "@/lib/api-client"

export default function PricingPage() {
  const { data: plans = [], isLoading, error } = usePricingPlans()
  const { isAuthenticated, points } = useAuth()

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="mb-4">
          <Zap className="w-4 h-4 mr-2" />
          Простые и честные цены
        </Badge>
        <h1 className="text-4xl font-bold">Выберите ваш тариф</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Платите только за то, что используете. Без скрытых комиссий и подписок.
          {!isAuthenticated && " Получите +6 поинтов при регистрации!"}
        </p>
      </div>

      {/* Pricing Cards */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </div>
                <div className="h-10 bg-muted rounded mt-4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Ошибка загрузки тарифов</p>
          <Button onClick={() => window.location.reload()}>
            Попробовать снова
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isPopular={plan.isPopular}
              className={plan.isPopular ? "border-primary shadow-lg scale-105" : ""}
            />
          ))}
        </div>
      )}

      {/* Features */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Что входит во все тарифы</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Sparkles className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">100% Product Fidelity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Точная передача всех деталей товара
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Реалистичные цвета и текстуры
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Профессиональное освещение
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Высокая скорость</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Результат за 5-10 секунд
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Высокое разрешение 3:4
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Множество стилей фонов
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Star className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Премиум качество</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Студийное качество
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Готово для маркетплейсов
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Коммерческое использование
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Часто задаваемые вопросы</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Как работает система поинтов?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              1 генерация изображения = 3 поинта. Поинты не сгорают и остаются на вашем счету навсегда.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Можно ли вернуть деньги?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Да, мы возвращаем деньги в течение 14 дней, если вы не использовали приобретенные поинты.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Есть ли ограничения по использованию?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Нет ограничений. Вы можете использовать созданные изображения в коммерческих целях.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Как получить +6 поинтов при регистрации?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Поинты автоматически начисляются на ваш счет сразу после создания аккаунта.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-12 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-3xl">
        <h2 className="text-2xl font-bold mb-4">Готовы начать?</h2>
        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-muted-foreground mb-6">
              У вас {getPointsText(points)}. Начните создавать изображения прямо сейчас!
            </p>
            <Button size="lg" asChild>
              <a href="/studio">
                <Sparkles className="w-5 h-5 mr-2" />
                Начать создавать
              </a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground mb-6">
              Зарегистрируйтесь и получите +6 поинтов для бесплатного тестирования
            </p>
            <Button size="lg" asChild>
              <a href="/studio">
                <Sparkles className="w-5 h-5 mr-2" />
                Начать создавать
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
