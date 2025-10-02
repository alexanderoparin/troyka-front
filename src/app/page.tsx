"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Zap, Shield, ArrowRight, Star, Users, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/auth-context'
import { getPointsText } from '@/lib/grammar'

export default function HomePage() {
  const { isAuthenticated, isLoading, points, user } = useAuth()

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-20">
        <div className="space-y-4">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Новое поколение ИИ для товаров
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="gradient-text">24reshai</span>
            <br />
            Генерация изображений товаров
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Создавайте профессиональные изображения товаров с помощью искусственного интеллекта. 
            100% точность деталей, реалистичные фоны, студийное качество за секунды.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {isLoading ? (
            <div className="w-32 h-12 animate-pulse bg-muted rounded-lg" />
          ) : isAuthenticated ? (
            <>
              <Link href="/studio">
                <Button size="lg" className="text-lg px-8 py-6">
                  <Zap className="w-5 h-5 mr-2" />
                  Открыть студию
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  Посмотреть цены
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 py-6">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Начать бесплатно
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  Войти в аккаунт
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
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
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Почему выбирают 24reshai</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Мы используем передовые технологии ИИ для создания изображений товаров студийного качества
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="glass-card">
            <CardHeader>
              <Sparkles className="w-12 h-12 text-primary mb-4" />
              <CardTitle>100% Product Fidelity</CardTitle>
              <CardDescription>
                Каждая деталь товара передается с максимальной точностью
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Сохранение всех характеристик товара</li>
                <li>• Точная передача цветов и текстур</li>
                <li>• Реалистичное освещение</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <Zap className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Мгновенная генерация</CardTitle>
              <CardDescription>
                От идеи до готового изображения за 5-10 секунд
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Быстрая обработка запросов</li>
                <li>• Множество стилей и фонов</li>
                <li>• Высокое разрешение 3:4</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <Shield className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Безопасность данных</CardTitle>
              <CardDescription>
                Ваши изображения защищены и доступны только вам
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Приватное хранилище</li>
                <li>• Защищенная передача данных</li>
                <li>• Соответствие GDPR</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Простые и честные цены</h2>
          <p className="text-lg text-muted-foreground">
            Платите только за то, что используете. Без скрытых комиссий.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Стартер</CardTitle>
              <div className="space-y-2">
                <div className="text-3xl font-bold">990 ₽</div>
                <div className="text-sm text-muted-foreground">100 поинтов • ~33 генерации</div>
              </div>
            </CardHeader>
          </Card>
          
          <Card className="border-2 border-primary/50 relative">
            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">Популярный</Badge>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Профи</CardTitle>
              <div className="space-y-2">
                <div className="text-3xl font-bold">2990 ₽</div>
                <div className="text-sm text-muted-foreground">300 поинтов • ~100 генераций</div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Бизнес</CardTitle>
              <div className="space-y-2">
                <div className="text-3xl font-bold">5490 ₽</div>
                <div className="text-sm text-muted-foreground">600 поинтов • ~200 генераций</div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Премиум</CardTitle>
              <div className="space-y-2">
                <div className="text-3xl font-bold">8990 ₽</div>
                <div className="text-sm text-muted-foreground">1000 поинтов • ~333 генерации</div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/pricing">
            <Button variant="outline" size="lg">
              Подробнее о тарифах
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-8 py-20 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-3xl">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Готовы начать?</h2>
          {isAuthenticated ? (
            <div className="space-y-2">
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Добро пожаловать, {user?.username}! Начните создавать профессиональные изображения товаров прямо сейчас
              </p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <Zap className="w-3 h-3 mr-1" />
                  {getPointsText(points)} доступно
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Зарегистрируйтесь сейчас и получите +6 поинтов для бесплатного тестирования
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isLoading ? (
            <div className="w-32 h-12 animate-pulse bg-muted rounded-lg" />
          ) : isAuthenticated ? (
            <Link href="/studio">
              <Button size="lg" className="text-lg px-8 py-6">
                <Sparkles className="w-5 h-5 mr-2" />
                Начать создавать
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 py-6">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Зарегистрироваться
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  Уже есть аккаунт?
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
