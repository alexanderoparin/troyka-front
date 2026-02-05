"use client"

import { Badge } from '@/components/ui/badge'
import { Sparkles, Shield, ArrowRight, Star, Users, Clock, Target, Zap, Wand2, Brain, Rocket, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { useGenerationPoints } from '@/hooks/use-generation-points'
import { ImageGallery } from '@/components/image-gallery'
import { getPointsText } from '@/lib/grammar'

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const { pointsPerImage, pointsOnRegistration, data } = useGenerationPoints()
  const pro = data.pointsPerImagePro
  const minProPoints = Math.min(pro['1K'], pro['2K'], pro['4K'])

  return (
    <div className="relative space-y-8 sm:space-y-12 lg:space-y-16 min-h-screen">
      {/* Background for entire page */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.3)_0%,_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.3)_0%,_transparent_70%)] pointer-events-none -z-10" />
      
      {/* Decorative stars/particles - равномерно по всей странице, на заднем фоне */}
      <div className="absolute top-20 left-[15%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none"></div>
      <div className="absolute top-32 left-[85%] w-3 h-3 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-[400px] left-[25%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-[600px] left-[75%] w-3 h-3 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-[500px] left-1/2 w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '0.3s' }}></div>
      <div className="absolute top-[300px] left-[35%] w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '0.8s' }}></div>
      <div className="absolute top-[250px] left-[65%] w-1.5 h-1.5 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '1.2s' }}></div>
      <div className="absolute top-[750px] left-[45%] w-1.5 h-1.5 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '0.7s' }}></div>
      <div className="absolute top-[150px] left-[55%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '1.8s' }}></div>
      <div className="absolute top-[850px] left-[20%] w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '0.4s' }}></div>
      <div className="absolute top-[550px] left-[80%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '1.1s' }}></div>
      <div className="absolute top-[900px] left-[40%] w-1.5 h-1.5 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '0.9s' }}></div>
      <div className="absolute top-[1200px] left-[60%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '0.2s' }}></div>
      <div className="absolute top-[1100px] left-[30%] w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '1.3s' }}></div>
      <div className="absolute top-[1300px] left-[70%] w-1.5 h-1.5 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '0.6s' }}></div>
      <div className="absolute top-[1400px] left-[18%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '1.4s' }}></div>
      <div className="absolute top-[1500px] left-[50%] w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '0.1s' }}></div>
      <div className="absolute top-[1600px] left-[82%] w-1.5 h-1.5 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '1.6s' }}></div>
      <div className="absolute top-[1700px] left-[28%] w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '0.9s' }}></div>
      <div className="absolute top-[1800px] left-[62%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '1.7s' }}></div>
      <div className="absolute top-[1900px] left-[38%] w-1.5 h-1.5 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-[2000px] left-[72%] w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '1.2s' }}></div>

      {/* Hero Section - Modern Design */}
      <section className="hero-section relative py-12 sm:py-16 lg:py-24 px-4 overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-blue-500/5 to-purple-500/5 dark:from-primary/20 dark:via-blue-500/10 dark:to-purple-500/10 -z-10" />
        
        {/* Animated Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-blob-1 -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob-2 -z-10" />

        <div className="max-w-7xl mx-auto w-full px-4 relative z-[1]">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-8 lg:gap-12">
            {/* Left Side - Content */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 lg:w-1/2">
              <Badge variant="secondary" className="text-sm bg-gradient-to-r from-primary/10 to-blue-500/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary-foreground dark:border-primary/30 px-4 py-2 rounded-full w-fit animate-ios-fade-in">
                <Sparkles className="w-3 h-3 mr-2" />
                Революция в создании изображений с искусственным интеллектом
              </Badge>
              
              <div className="space-y-4 max-w-2xl">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent animate-ios-slide-up">
                  AI-платформа для реализации ваших идей
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 animate-ios-fade-in" style={{ animationDelay: '0.1s' }}>
                  От товаров до портретов, от интерьеров до еды — превращайте любые идеи в профессиональные изображения. 
                  Искусственный интеллект создает студийное качество, реалистичные сцены и идеальные детали за секунды.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md lg:max-w-none animate-ios-fade-in" style={{ animationDelay: '0.2s' }}>
                <Link href="/studio" className="flex-1">
                  <button className="btn-ios-primary px-8 py-4 text-headline w-full flex items-center justify-center group">
                    <Sparkles className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                    {isAuthenticated ? "Перейти в студию" : "Начать бесплатно"}
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>

              {/* Модель | Стоимость | Результат */}
              <div className="w-full max-w-md lg:max-w-none animate-ios-fade-in" style={{ animationDelay: '0.3s' }}>
                {!isAuthenticated && (
                  <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-muted/50 dark:bg-muted/20 border border-border/50 mb-4">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{getPointsText(pointsOnRegistration)} за регистрацию</span>
                  </div>
                )}
                <div className="rounded-xl border border-border/50 overflow-hidden bg-muted/30 dark:bg-muted/10 shadow-sm">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 px-4 py-3 text-xs sm:text-sm font-semibold text-muted-foreground border-b border-border/50 bg-gradient-to-r from-muted/80 to-muted/40 dark:from-muted/30 dark:to-muted/10">
                    <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Модель</span>
                    <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Стоимость</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Результат</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 px-4 py-3.5 items-center bg-blue-500/5 dark:bg-blue-500/10 border-b border-border/30">
                    <span className="font-semibold text-foreground flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-blue-500/20 dark:bg-blue-500/30 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </span>
                      Nano Banana
                    </span>
                    <span className="text-sm">{pointsPerImage} поинта за 1 генерацию</span>
                    <span className="text-sm flex items-center gap-1.5 text-green-600 dark:text-green-400">
                      <Clock className="w-3.5 h-3.5" /> 5-10 сек
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 px-4 py-3.5 items-center bg-primary/5 dark:bg-primary/10">
                    <span className="font-semibold text-foreground flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-primary/20 dark:bg-primary/30 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </span>
                      Nano Banana PRO
                    </span>
                    <span className="text-sm">от {minProPoints} поинтов за 1 генерацию</span>
                    <span className="text-sm flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                      <Clock className="w-3.5 h-3.5" /> 10-100 сек
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Image Gallery */}
            <div className="w-full lg:w-1/2 lg:max-w-lg animate-ios-fade-in" style={{ animationDelay: '0.2s' }}>
              <ImageGallery />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="space-y-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="card-ios p-6 text-center animate-ios-fade-in">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">5-10 сек</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Время генерации</div>
            </div>
            
            <div className="card-ios p-6 text-center animate-ios-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Wand2 className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Студийное</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Качество</div>
            </div>
            
            <div className="card-ios p-6 text-center animate-ios-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-purple-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">AI</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Технологии</div>
            </div>
            
            <div className="card-ios p-6 text-center animate-ios-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-orange-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">100%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Удовлетворенность</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-8 sm:space-y-12 px-4">
        <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Почему выбирают 24reshai
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Мы используем передовые технологии ИИ для создания изображений студийного качества
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          <div className="card-ios p-8 animate-ios-fade-in group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-title-3 text-foreground mb-3 font-semibold">100% Точность товара</h3>
            <p className="text-body text-muted-foreground mb-6">
              Каждая деталь товара передается с максимальной точностью и реализмом
            </p>
            <ul className="space-y-3 text-callout text-muted-foreground">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>Сохранение всех характеристик товара</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>Точная передача цветов и текстур</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>Реалистичное освещение и тени</span>
              </li>
            </ul>
          </div>

          <div className="card-ios p-8 animate-ios-fade-in group hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300" style={{ animationDelay: '0.1s' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-title-3 text-foreground mb-3 font-semibold">Мгновенная генерация</h3>
            <p className="text-body text-muted-foreground mb-6">
              От идеи до готового изображения всего за 5-10 секунд без ожидания
            </p>
            <ul className="space-y-3 text-callout text-muted-foreground">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Быстрая обработка запросов</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Множество стилей и фонов</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Профессиональное качество</span>
              </li>
            </ul>
          </div>

          <div className="card-ios p-8 animate-ios-fade-in group hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 sm:col-span-2 lg:col-span-1" style={{ animationDelay: '0.2s' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-title-3 text-foreground mb-3 font-semibold">Безопасность данных</h3>
            <p className="text-body text-muted-foreground mb-6">
              Ваши изображения защищены и доступны только вам с полной конфиденциальностью
            </p>
            <ul className="space-y-3 text-callout text-muted-foreground">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span>Приватное хранилище</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span>Защищенная передача данных</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span>Соответствие GDPR</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="space-y-8 sm:space-y-12 px-4 py-12 sm:py-16 bg-gradient-to-b from-transparent via-primary/5 to-transparent dark:via-primary/10">
        <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Для кого создан 24reshai
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Решайте любые задачи по созданию изображений с помощью искусственного интеллекта
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {[
            { title: 'E-commerce магазины', desc: 'Профессиональные фото товаров для каталогов и рекламы', icon: Target },
            { title: 'Дизайнеры и маркетологи', desc: 'Быстрое создание визуального контента для проектов', icon: Wand2 },
            { title: 'Контент-мейкеры', desc: 'Уникальные изображения для соцсетей и блогов', icon: Sparkles },
            { title: 'Стартапы', desc: 'Прототипы и визуализации без дорогостоящих фотосессий', icon: Rocket },
            { title: 'Бренды', desc: 'Консистентный визуальный стиль для всей продукции', icon: Brain },
            { title: 'Фрилансеры', desc: 'Быстрое создание портфолио и демо-материалов', icon: Users },
          ].map((item, index) => (
            <div 
              key={index}
              className="card-ios p-6 sm:p-8 animate-ios-fade-in group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
