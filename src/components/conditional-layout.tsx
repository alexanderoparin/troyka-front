"use client"

import { usePathname } from 'next/navigation'
import { Header } from '@/components/header'
import Footer from '@/components/footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Для студии используем специальный layout без header и footer
  // Баннер будет показан через SystemStatusBanner в layout.tsx
  if (pathname === '/studio') {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
        {children}
      </div>
    )
  }
  
  // Для остальных страниц используем обычный layout
  const isAuthPage = pathname === '/login' || pathname === '/register'
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 mobile-container flex flex-col">
      <Header />
      <main className={`${isAuthPage ? 'w-full px-0 pt-2 pb-0 sm:pt-2 sm:pb-0' : 'container mx-auto px-0 py-2 sm:py-2'} flex-1 overflow-visible`}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
