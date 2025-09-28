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
  title: 'TROYKA.AI - Генерация изображений товаров с ИИ',
  description: 'Создавайте профессиональные изображения товаров с помощью искусственного интеллекта. Получите +6 поинтов при регистрации!',
  keywords: 'ИИ, генерация изображений, товары, искусственный интеллект, фотосъемка товаров',
  authors: [{ name: 'TROYKA.AI' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'TROYKA.AI - Генерация изображений товаров с ИИ',
    description: 'Создавайте профессиональные изображения товаров с помощью искусственного интеллекта',
    url: 'https://troyka-ai.ru',
    siteName: 'TROYKA.AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TROYKA.AI',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TROYKA.AI - Генерация изображений товаров с ИИ',
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
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
                <Header />
                <main className="container mx-auto px-4 py-8">
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
