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
  if (pathname === '/studio') {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
        {children}
      </div>
    )
  }
  
  // Для остальных страниц используем обычный layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 mobile-container flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-4 sm:py-8 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
