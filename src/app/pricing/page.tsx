"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Star, Sparkles } from "lucide-react"
import { PricingCard } from "@/components/pricing-card"
import { usePricingPlans } from "@/hooks/use-pricing-plans"
import { useAuth } from "@/contexts/auth-context"
import { getPointsText } from "@/lib/grammar"
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';

export default function PricingPage() {
  const { data: plans = [], isLoading, error } = usePricingPlans()
  const { isAuthenticated, points } = useAuth()

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-6">
        <Badge variant="secondary" className="mb-4 text-callout bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-700 px-4 py-2 rounded-full">
          <Zap className="w-4 h-4 mr-2" />
          Простые и честные цены
        </Badge>
        <h1 className="text-large-title sm:text-5xl font-bold text-foreground">Выберите ваш тариф</h1>
        <p className="text-headline text-muted-foreground max-w-3xl mx-auto">
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
          <div className="card-ios p-8 animate-ios-fade-in">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-title-3 text-foreground mb-4">100% Product Fidelity</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-blue-500" />
                <span className="text-body text-foreground">Точная передача всех деталей товара</span>
                </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-blue-500" />
                <span className="text-body text-foreground">Реалистичные цвета и текстуры</span>
                </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-blue-500" />
                <span className="text-body text-foreground">Профессиональное освещение</span>
                </li>
              </ul>
          </div>

          <div className="card-ios p-8 animate-ios-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-title-3 text-foreground mb-4">Высокая скорость</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-body text-foreground">Результат за 5-10 секунд</span>
                </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-body text-foreground">Высокое разрешение 3:4</span>
                </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-body text-foreground">Множество стилей фонов</span>
                </li>
              </ul>
          </div>

          <div className="card-ios p-8 animate-ios-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Star className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-title-3 text-foreground mb-4">Премиум качество</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-purple-500" />
                <span className="text-body text-foreground">Студийное качество</span>
                </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-purple-500" />
                <span className="text-body text-foreground">Готово для маркетплейсов</span>
                </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-purple-500" />
                <span className="text-body text-foreground">Коммерческое использование</span>
                </li>
              </ul>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-12">
        <div className="text-center">
          <h2 className="text-title-1 text-foreground mb-4">Часто задаваемые вопросы</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-ios p-6 animate-ios-fade-in">
            <h3 className="text-title-3 text-foreground mb-4">Как работает система поинтов?</h3>
            <p className="text-body text-muted-foreground">
              1 генерация изображения = 3 поинта. Поинты не сгорают и остаются на вашем счету навсегда.
            </p>
          </div>

          <div className="card-ios p-6 animate-ios-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-title-3 text-foreground mb-4">Безопасны ли платежи?</h3>
            <p className="text-body text-muted-foreground">
              Да, все платежи проходят через защищенный шлюз Робокассы с SSL-шифрованием. Мы не храним данные ваших карт.
            </p>
          </div>

          <div className="card-ios p-6 animate-ios-fade-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-title-3 text-foreground mb-4">Есть ли ограничения по использованию?</h3>
            <p className="text-body text-muted-foreground">
              Нет ограничений. Вы можете использовать созданные изображения в коммерческих целях.
            </p>
          </div>

          <div className="card-ios p-6 animate-ios-fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-title-3 text-foreground mb-4">Как получить +6 поинтов при регистрации?</h3>
            <p className="text-body text-muted-foreground">
              Поинты автоматически начисляются на ваш счет сразу после создания аккаунта.
            </p>
          </div>

          <div className="card-ios p-6 animate-ios-fade-in" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-title-3 text-foreground mb-4">Можно ли вернуть деньги?</h3>
            <p className="text-body text-muted-foreground">
              Да, возврат денежных средств возможен. Подробные условия возврата 
              указаны в <a href="/legal" className="text-primary hover:underline">пользовательском соглашении</a>.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-16 card-ios-elevated">
        <h2 className="text-title-1 text-foreground mb-6">Готовы начать?</h2>
        {isAuthenticated ? (
          <div className="space-y-6">
            <p className="text-headline text-muted-foreground">
              У вас {getPointsText(points)}. Начните создавать изображения прямо сейчас!
            </p>
            <a href="/studio" className="btn-ios-primary px-8 py-3 text-headline inline-flex items-center">
              <Sparkles className="w-5 h-5 mr-3" />
                Начать создавать
              </a>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-headline text-muted-foreground">
              Зарегистрируйтесь и получите +6 поинтов для бесплатного тестирования
            </p>
            <a href="/studio" className="btn-ios-primary px-8 py-3 text-headline inline-flex items-center">
              <Sparkles className="w-5 h-5 mr-3" />
                Начать создавать
              </a>
          </div>
        )}
      </div>
    </div>
  )
}
