import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { QueryProvider } from '@/components/query-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/toaster'
import { Header } from '@/components/header'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: '24reshai - Генерация изображений товаров с ИИ',
  description: 'Создавайте профессиональные изображения товаров с помощью искусственного интеллекта. Получите +6 поинтов при регистрации!',
  keywords: 'ИИ, генерация изображений, товары, искусственный интеллект, фотосъемка товаров',
  authors: [{ name: '24reshai' }],
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  openGraph: {
    title: '24reshai - Генерация изображений товаров с ИИ',
    description: 'Создавайте профессиональные изображения товаров с помощью искусственного интеллекта',
    url: 'https://24reshai.ru',
    siteName: '24reshai',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '24reshai',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '24reshai - Генерация изображений товаров с ИИ',
    description: 'Создавайте профессиональные изображения товаров с помощью искусственного интеллекта',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, shrink-to-fit=no" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 mobile-container">
                <Header />
                <main className="container mx-auto px-4 py-8 flex-1 mobile-scroll">
                  {children}
                </main>
              </div>
              <Toaster />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
