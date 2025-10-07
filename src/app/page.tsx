"use client"

import { Badge } from '@/components/ui/badge'
import { Sparkles, Zap, Shield, ArrowRight, Star, Users, Clock, Target } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { getPointsText } from '@/lib/grammar'

export default function HomePage() {
  const { isAuthenticated, isLoading, points, user } = useAuth()

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="hero-section text-center space-y-6 sm:space-y-8 md:space-y-12 py-12 sm:py-16 md:py-24 px-4">
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          <Badge variant="secondary" className="mb-4 text-callout bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-700 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 mr-2" />
            Новое поколение ИИ для товаров
          </Badge>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">24reshai</span>
            <br />
            <span className="text-2xl sm:text-4xl md:text-5xl text-foreground">Генерация изображений товаров</span>
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Создавайте профессиональные изображения товаров с помощью искусственного интеллекта. 
            100% точность деталей, реалистичные фоны, студийное качество за секунды.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center w-full max-w-lg sm:max-w-none mx-auto px-2 sm:px-0">
          {isLoading ? (
            <div className="w-full sm:w-44 h-11 animate-pulse bg-muted rounded-xl" />
          ) : isAuthenticated ? (
            <>
              <Link href="/studio" className="w-full sm:w-auto">
                <button className="btn-ios-primary w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-headline">
                  <Sparkles className="w-5 h-5 mr-3" />
                  Открыть студию
                  <ArrowRight className="w-5 h-5 ml-3" />
                </button>
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto">
                <button className="btn-ios-ghost w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-headline">
                  Посмотреть цены
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/register" className="w-full sm:w-auto">
                <button className="btn-ios-primary w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-headline">
                  <Sparkles className="w-5 h-5 mr-3" />
                  Начать бесплатно
                  <ArrowRight className="w-5 h-5 ml-3" />
                </button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <button className="btn-ios-ghost w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-headline">
                  Войти в аккаунт
                </button>
              </Link>
            </>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-muted-foreground px-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>+6 поинтов при регистрации</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-500" />
            <span>3 поинта = 1 генерация</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Результат за 5-10 секунд</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-8 sm:space-y-12 px-4">
        <div className="text-center space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold">Почему выбирают 24reshai</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Мы используем передовые технологии ИИ для создания изображений товаров студийного качества
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="card-ios p-8 animate-ios-fade-in">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-title-3 text-foreground mb-3">100% Точность товара</h3>
            <p className="text-body text-muted-foreground mb-6">
              Каждая деталь товара передается с максимальной точностью
            </p>
            <ul className="space-y-3 text-callout text-muted-foreground">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Сохранение всех характеристик товара
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Точная передача цветов и текстур
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Реалистичное освещение
              </li>
            </ul>
          </div>

          <div className="card-ios p-8 animate-ios-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-title-3 text-foreground mb-3">Мгновенная генерация</h3>
            <p className="text-body text-muted-foreground mb-6">
              От идеи до готового изображения за 5-10 секунд
            </p>
            <ul className="space-y-3 text-callout text-muted-foreground">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Быстрая обработка запросов
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Множество стилей и фонов
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Высокое разрешение 3:4
              </li>
            </ul>
          </div>

          <div className="card-ios p-8 animate-ios-fade-in sm:col-span-2 lg:col-span-1" style={{ animationDelay: '0.2s' }}>
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-title-3 text-foreground mb-3">Безопасность данных</h3>
            <p className="text-body text-muted-foreground mb-6">
              Ваши изображения защищены и доступны только вам
            </p>
            <ul className="space-y-3 text-callout text-muted-foreground">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Приватное хранилище
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Защищенная передача данных
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Соответствие GDPR
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="space-y-16">
        <div className="text-center space-y-6">
          <h2 className="text-title-1 text-foreground">Простые и честные цены</h2>
          <p className="text-headline text-muted-foreground max-w-2xl mx-auto">
            Платите только за то, что используете. Без скрытых комиссий.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-ios p-6 text-center animate-ios-fade-in">
            <h3 className="text-title-3 text-foreground mb-4">Стартер</h3>
            <div className="space-y-2 mb-6">
              <div className="text-3xl font-bold text-foreground">990 ₽</div>
              <div className="text-callout text-muted-foreground">100 поинтов • ~33 генерации</div>
            </div>
            <Link href="/pricing">
              <button className="btn-ios-ghost w-full px-4 py-2 text-sm">
                Купить
              </button>
            </Link>
          </div>
          
          <div className="card-ios-elevated p-6 text-center relative animate-ios-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-callout font-medium">
              Популярный
            </div>
            <h3 className="text-title-3 text-foreground mb-4">Профи</h3>
            <div className="space-y-2 mb-6">
              <div className="text-3xl font-bold text-foreground">2990 ₽</div>
              <div className="text-callout text-muted-foreground">300 поинтов • ~100 генераций</div>
            </div>
            <Link href="/pricing">
              <button className="btn-ios-primary w-full px-4 py-2 text-sm">
                Купить
              </button>
            </Link>
          </div>

          <div className="card-ios p-6 text-center animate-ios-fade-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-title-3 text-foreground mb-4">Бизнес</h3>
            <div className="space-y-2 mb-6">
              <div className="text-3xl font-bold text-foreground">5490 ₽</div>
              <div className="text-callout text-muted-foreground">600 поинтов • ~200 генераций</div>
            </div>
            <Link href="/pricing">
              <button className="btn-ios-ghost w-full px-4 py-2 text-sm">
                Купить
              </button>
            </Link>
          </div>

          <div className="card-ios p-6 text-center animate-ios-fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-title-3 text-foreground mb-4">Премиум</h3>
            <div className="space-y-2 mb-6">
              <div className="text-3xl font-bold text-foreground">8990 ₽</div>
              <div className="text-callout text-muted-foreground">1000 поинтов • ~333 генерации</div>
            </div>
            <Link href="/pricing">
              <button className="btn-ios-ghost w-full px-4 py-2 text-sm">
                Купить
              </button>
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link href="/pricing">
            <button className="btn-ios-ghost px-8 py-3 text-headline">
              Подробнее о тарифах
              <ArrowRight className="w-5 h-5 ml-3" />
            </button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-8 sm:space-y-12 py-16 sm:py-20 card-ios-elevated px-4">
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-title-1 text-foreground">Готовы начать?</h2>
          {isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-base sm:text-headline text-muted-foreground max-w-2xl mx-auto">
                Добро пожаловать, {user?.username}! Начните создавать профессиональные изображения товаров прямо сейчас
              </p>
              <div className="flex items-center justify-center">
                <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-callout font-medium border border-blue-200 dark:border-blue-700">
                  <Sparkles className="w-4 h-4 mr-2 inline" />
                  {getPointsText(points)} доступно
                </div>
              </div>
            </div>
          ) : (
            <p className="text-base sm:text-headline text-muted-foreground max-w-2xl mx-auto">
              Зарегистрируйтесь сейчас и получите +6 поинтов для бесплатного тестирования
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-lg sm:max-w-none mx-auto px-2 sm:px-0">
          {isLoading ? (
            <div className="w-44 h-11 animate-pulse bg-muted rounded-xl" />
          ) : isAuthenticated ? (
            <Link href="/studio" className="w-full sm:w-auto">
              <button className="btn-ios-primary w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-headline">
                <Sparkles className="w-5 h-5 mr-3" />
                Начать создавать
              </button>
            </Link>
          ) : (
            <>
              <Link href="/register" className="w-full sm:w-auto">
                <button className="btn-ios-primary w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-headline">
                  <Sparkles className="w-5 h-5 mr-3" />
                  Зарегистрироваться
                </button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <button className="btn-ios-ghost w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-headline">
                  Уже есть аккаунт?
                </button>
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
