import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { QueryProvider } from '@/components/query-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/toaster'
import { ConditionalLayout } from '@/components/conditional-layout'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://24reshai.ru'),
  title: '24reshai - Генерация изображений товаров с ИИ',
  description: 'Создавайте профессиональные изображения товаров с помощью искусственного интеллекта. Получите +6 поинтов при регистрации! Подтвердите email для доступа ко всем функциям.',
  keywords: 'ИИ, генерация изображений, товары, искусственный интеллект, фотосъемка товаров',
  authors: [{ name: '24reshai' }],
  robots: 'index, follow',
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="24reshai-theme"
        >
          <QueryProvider>
            <AuthProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
              <Toaster />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
