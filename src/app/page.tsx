"use client"

import { Badge } from '@/components/ui/badge'
import { Sparkles, Shield, ArrowRight, Star, Users, Clock, Target, Zap } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { AnimatedGallery } from '@/components/animated-gallery'
export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="space-y-8">
      {/* Логотип */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">24</span>
          </div>
          <span className="text-xl font-bold gradient-text">24reshai</span>
        </Link>
      </div>

      {/* Hero Section - Compact Layout */}
      <section className="hero-section py-16 sm:py-24 px-4">
        <div className="max-w-none mx-auto w-full px-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 lg:gap-8">
            {/* Left Side - Content */}
            <div className="flex flex-col items-center text-center space-y-6 lg:w-1/2">
              <Badge variant="secondary" className="text-sm bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-700 px-3 py-1.5 rounded-full w-fit">
                <Sparkles className="w-3 h-3 mr-2" />
                Революция в создании изображений
              </Badge>
              
              <div className="space-y-4 max-w-2xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                  ИИ-платформа для реализации ваших идей
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                  От товаров до портретов, от интерьеров до еды — превращайте любые идеи в профессиональные изображения. 
                  Мощный ИИ создает студийное качество, реалистичные сцены и идеальные детали за секунды.
                </p>
              </div>

              {/* CTA Buttons - Vertical stack */}
              <div className="flex flex-col gap-3 w-full max-w-sm">
                <Link href="/studio" className="w-full">
                  <button className="btn-ios-primary px-8 py-3 text-headline w-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 mr-3" />
                    {isAuthenticated ? "Перейти в студию" : "Начать бесплатно"}
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </button>
                </Link>
                {!isAuthenticated && (
                  <Link href="/login" className="w-full">
                    <button className="btn-ios-ghost px-8 py-3 text-headline w-full flex items-center justify-center">
                      Войти в аккаунт
                    </button>
                  </Link>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2 text-sm sm:text-base text-muted-foreground text-center">
                <div className="flex items-center justify-center gap-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>Получите 6 поинтов за регистрацию</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-3 h-3 text-green-500" />
                  <span>3 поинта = 1 генерация</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-3 h-3 text-blue-500" />
                  <span>Результат за 5-10 секунд</span>
                </div>
              </div>
            </div>

            {/* Right Side - Animated Gallery */}
            <AnimatedGallery />
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
              От идеи до готового изображения всего за 5-10 секунд
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
                Профессиональное качество
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


    </div>
  )
}
