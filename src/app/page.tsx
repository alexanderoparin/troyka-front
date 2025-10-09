"use client"

import { Badge } from '@/components/ui/badge'
import { Sparkles, Shield, ArrowRight, Star, Users, Clock, Target, Zap, X } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { getPointsText } from '@/lib/grammar'
import { useState } from 'react'

export default function HomePage() {
  const { isAuthenticated, isLoading, points, user } = useAuth()
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; label: string } | null>(null)

  return (
    <div className="space-y-20">
      {/* Hero Section - Compact Layout */}
      <section className="hero-section py-8 sm:py-12 px-4">
        <div className="max-w-none mx-auto w-full px-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 lg:gap-8">
            {/* Left Side - Content */}
            <div className="flex flex-col items-center text-center space-y-4 sm:space-y-5">
              <Badge variant="secondary" className="text-sm bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-700 px-3 py-1.5 rounded-full w-fit">
                <Sparkles className="w-3 h-3 mr-2" />
                Революция в создании изображений
              </Badge>
              
              <div className="space-y-2 sm:space-y-3 max-w-2xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                  <span className="gradient-text">24reshai</span>
                </h1>
                <h2 className="text-lg sm:text-xl md:text-2xl text-foreground font-semibold">
                  ИИ-платформа для реализации ваших идей
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                  От товаров до портретов, от интерьеров до еды — превращайте любые идеи в профессиональные изображения. 
                  Мощный ИИ создает студийное качество, реалистичные сцены и идеальные детали за секунды.
                </p>
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="flex flex-col items-center space-y-4 sm:space-y-5 lg:items-end">
              <div className="space-y-2 sm:space-y-3 w-full max-w-sm">
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="w-full h-10 animate-pulse bg-muted rounded-xl" />
                    <div className="w-full h-10 animate-pulse bg-muted rounded-xl" />
                  </div>
                ) : isAuthenticated ? (
                  <div className="space-y-2">
                    <Link href="/studio" className="block">
                      <button className="btn-ios-primary w-full px-4 py-2.5 text-sm flex items-center justify-center">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Открыть студию
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </Link>
                    <Link href="/pricing" className="block">
                      <button className="btn-ios-ghost w-full px-4 py-2.5 text-sm flex items-center justify-center">
                        Посмотреть цены
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/register" className="block">
                      <button className="btn-ios-primary w-full px-4 py-2.5 text-sm flex items-center justify-center">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Начать бесплатно
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </Link>
                    <Link href="/login" className="block">
                      <button className="btn-ios-ghost w-full px-4 py-2.5 text-sm flex items-center justify-center">
                        Войти в аккаунт
                      </button>
                    </Link>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-sm sm:text-base text-muted-foreground text-center">
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
          </div>
        </div>
      </section>

      {/* Examples Section - Horizontal Scroll */}
      <section className="space-y-8">
        <div className="text-center space-y-2 px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Примеры работ</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            От промпта до результата — один клик
          </p>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative overflow-hidden">
          <div className="scroll-horizontal flex space-x-8 py-4 pl-4">
            {/* Duplicate the set for seamless loop */}
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex space-x-8 flex-shrink-0">
                {/* Example 1: Jacket - Before/After Pair */}
                <div className="flex space-x-4">
                  {/* Before */}
                  <div className="group relative">
                    <div 
                      className="w-64 h-80 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-shadow duration-300"
                      onClick={() => setSelectedImage({
                        src: "https://24reshai.ru/files/examples/jacket-before.jpg",
                        alt: "До обработки",
                        label: "До"
                      })}
                    >
                      <img 
                        src="https://24reshai.ru/files/examples/jacket-before.jpg" 
                        alt="До обработки" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 flex items-center justify-center hidden">
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-xl">👔</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Загрузите изображение</p>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                        До
                      </div>
                    </div>
                  </div>

                  {/* After */}
                  <div className="group relative">
                    <div 
                      className="w-64 h-80 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-shadow duration-300"
                      onClick={() => setSelectedImage({
                        src: "https://24reshai.ru/files/examples/jacket-after.jpg",
                        alt: "После обработки",
                        label: "После"
                      })}
                    >
                      <img 
                        src="https://24reshai.ru/files/examples/jacket-after.jpg" 
                        alt="После обработки" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 flex items-center justify-center hidden">
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-xl">✨</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Загрузите изображение</p>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 bg-primary/90 text-white px-2 py-1 rounded text-xs font-medium">
                        После
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Separator */}
                <div className="flex items-center justify-center">
                  <div className="w-px h-16 bg-gradient-to-b from-transparent via-primary/30 to-transparent"></div>
                </div>

                {/* Example 2: Winter - Before/After Pair */}
                <div className="flex space-x-4">
                  {/* Before */}
                  <div className="group relative">
                    <div 
                      className="w-64 h-80 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-shadow duration-300"
                      onClick={() => setSelectedImage({
                        src: "https://24reshai.ru/files/examples/winter-before.jpg",
                        alt: "До обработки",
                        label: "До"
                      })}
                    >
                      <img 
                        src="https://24reshai.ru/files/examples/winter-before.jpg" 
                        alt="До обработки" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 flex items-center justify-center hidden">
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-xl">🧥</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Загрузите изображение</p>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                        До
                      </div>
                    </div>
                  </div>

                  {/* After */}
                  <div className="group relative">
                    <div 
                      className="w-64 h-80 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-shadow duration-300"
                      onClick={() => setSelectedImage({
                        src: "https://24reshai.ru/files/examples/winter-after.jpg",
                        alt: "После обработки",
                        label: "После"
                      })}
                    >
                      <img 
                        src="https://24reshai.ru/files/examples/winter-after.jpg" 
                        alt="После обработки" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 flex items-center justify-center hidden">
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-xl">❄️</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Загрузите изображение</p>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 bg-primary/90 text-white px-2 py-1 rounded text-xs font-medium">
                        После
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Separator */}
                <div className="flex items-center justify-center">
                  <div className="w-px h-16 bg-gradient-to-b from-transparent via-primary/30 to-transparent"></div>
                </div>

                {/* Example 3: Dress - Before/After Pair */}
                <div className="flex space-x-4">
                  {/* Before */}
                  <div className="group relative">
                    <div 
                      className="w-64 h-80 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-shadow duration-300"
                      onClick={() => setSelectedImage({
                        src: "https://24reshai.ru/files/examples/dress-before.jpg",
                        alt: "До обработки",
                        label: "До"
                      })}
                    >
                      <img 
                        src="https://24reshai.ru/files/examples/dress-before.jpg" 
                        alt="До обработки" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 flex items-center justify-center hidden">
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-xl">👗</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Загрузите изображение</p>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                        До
                      </div>
                    </div>
                  </div>

                  {/* After */}
                  <div className="group relative">
                    <div 
                      className="w-64 h-80 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-shadow duration-300"
                      onClick={() => setSelectedImage({
                        src: "https://24reshai.ru/files/examples/dress-after.jpg",
                        alt: "После обработки",
                        label: "После"
                      })}
                    >
                      <img 
                        src="https://24reshai.ru/files/examples/dress-after.jpg" 
                        alt="После обработки" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 flex items-center justify-center hidden">
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-xl">✨</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Загрузите изображение</p>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 bg-primary/90 text-white px-2 py-1 rounded text-xs font-medium">
                        После
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Separator */}
                <div className="flex items-center justify-center">
                  <div className="w-px h-16 bg-gradient-to-b from-transparent via-primary/30 to-transparent"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/pricing">
              <button className="btn-ios-primary px-8 py-3 text-headline">
                <Sparkles className="w-5 h-5 mr-3" />
                Посмотреть тарифы
                <ArrowRight className="w-5 h-5 ml-3" />
              </button>
            </Link>
            <Link href="/studio">
              <button className="btn-ios-ghost px-8 py-3 text-headline">
                Попробовать бесплатно
              </button>
            </Link>
          </div>
          <p className="text-callout text-muted-foreground">
            Начните с +6 поинтов при регистрации
          </p>
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

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Image Label */}
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-primary/90 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                {selectedImage.label}
              </span>
            </div>
            
            {/* Image */}
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}

    </div>
  )
}
