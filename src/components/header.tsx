"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AvatarUpload } from "@/components/avatar-upload"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  User, 
  LogOut, 
  CreditCard,
  Plus
} from "lucide-react"
import { getPointsText } from "@/lib/grammar"
import { cn } from "@/lib/utils"

export function Header() {
  const { user, isAuthenticated, isLoading, logout, points, avatar } = useAuth()
  const pathname = usePathname()

  return (
    <header className="absolute top-0 left-0 right-0 z-50 w-full">
      <div className="relative h-16 flex items-center justify-between px-4">

        {/* Center Floating Block - Navigation */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-background/60 backdrop-blur-xl border border-border/30 shadow-lg dark:bg-background/70 dark:border-border/15">
              <Link href="/studio">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-lg transition-all duration-200 relative",
                    "hover:bg-primary/15 hover:scale-110",
                    "dark:hover:bg-primary/25",
                    "active:scale-95",
                    pathname === "/studio" && "!bg-primary !text-primary-foreground scale-110"
                  )}
                  title="Студия"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </Button>
              </Link>
              
              <Link href="/history">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-lg transition-all duration-200 relative",
                    "hover:bg-primary/15 hover:scale-110",
                    "dark:hover:bg-primary/25",
                    "active:scale-95",
                    pathname === "/history" && "!bg-primary !text-primary-foreground scale-110"
                  )}
                  title="История"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </Button>
              </Link>
              
              <Link href="/pricing">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-lg transition-all duration-200 relative",
                    "hover:bg-primary/15 hover:scale-110",
                    "dark:hover:bg-primary/25",
                    "active:scale-95",
                    pathname === "/pricing" && "!bg-primary !text-primary-foreground scale-110"
                  )}
                  title="Цены"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </Button>
              </Link>
              
              <Link href="/contacts">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-lg transition-all duration-200 relative",
                    "hover:bg-primary/15 hover:scale-110",
                    "dark:hover:bg-primary/25",
                    "active:scale-95",
                    pathname === "/contacts" && "!bg-primary !text-primary-foreground scale-110"
                  )}
                  title="Контакты"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </Button>
              </Link>
              
            </div>
          </div>

        {/* Right Floating Block - User Info */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background/60 backdrop-blur-xl border border-border/30 shadow-lg dark:bg-background/70 dark:border-border/15">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Info Display */}
            {isAuthenticated && (
              <div className="hidden sm:flex flex-col items-end text-sm">
                <div className="font-medium text-foreground">
                  {user?.username || 'Пользователь'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getPointsText(points)}
                </div>
              </div>
            )}

            {/* Auth Section */}
            {isLoading ? (
              <div className="w-8 h-8 animate-pulse bg-muted rounded-full" />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                    <AvatarUpload 
                      currentAvatar={avatar || undefined}
                      userName={user?.username}
                      size="sm"
                      className="h-8 w-8"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 leading-none p-2">
                    {user?.username && (
                      <p className="font-medium">{user.username}</p>
                    )}
                    {user?.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  
                  {/* User info for mobile */}
                  <div className="sm:hidden">
                    <DropdownMenuItem disabled>
                      <User className="mr-2 h-4 w-4" />
                      {user?.username || 'Пользователь'}
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {getPointsText(points)}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </div>

                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <User className="mr-2 h-4 w-4" />
                      Аккаунт
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/payment-history">
                      <CreditCard className="mr-2 h-4 w-4" />
                      История платежей
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/pricing">
                      <Plus className="mr-2 h-4 w-4" />
                      Пополнить баланс
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild size="sm" className="text-sm px-4 py-2 h-8">
                  <Link href="/login">Войти</Link>
                </Button>
                <Button variant="outline" asChild size="sm" className="text-sm px-4 py-2 h-8">
                  <Link href="/register">Регистрация</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Floating Toolbar */}
        <div className="md:hidden flex items-center justify-center flex-1 px-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background/90 backdrop-blur-xl border border-border/40 shadow-lg dark:bg-background/95 dark:border-border/20">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-lg transition-all duration-200 relative",
                  "hover:bg-primary/15 hover:scale-110",
                  "dark:hover:bg-primary/25",
                  "active:scale-95",
                  pathname === "/" && "!bg-primary !text-primary-foreground scale-110"
                )}
                title="Главная"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Button>
            </Link>
            
            <Link href="/studio">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-lg transition-all duration-200 relative",
                  "hover:bg-primary/15 hover:scale-110",
                  "dark:hover:bg-primary/25",
                  "active:scale-95",
                  pathname === "/studio" && "!bg-primary !text-primary-foreground scale-110"
                )}
                title="Студия"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </Button>
            </Link>
            
            <Link href="/history">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-lg transition-all duration-200 relative",
                  "hover:bg-primary/15 hover:scale-110",
                  "dark:hover:bg-primary/25",
                  "active:scale-95",
                  pathname === "/history" && "!bg-primary !text-primary-foreground scale-110"
                )}
                title="История"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Button>
            </Link>
            
            <Link href="/pricing">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-lg transition-all duration-200 relative",
                  "hover:bg-primary/15 hover:scale-110",
                  "dark:hover:bg-primary/25",
                  "active:scale-95",
                  pathname === "/pricing" && "!bg-primary !text-primary-foreground scale-110"
                )}
                title="Цены"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </Button>
            </Link>
            
            <Link href="/contacts">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-lg transition-all duration-200 relative",
                  "hover:bg-primary/15 hover:scale-110",
                  "dark:hover:bg-primary/25",
                  "active:scale-95",
                  pathname === "/contacts" && "!bg-primary !text-primary-foreground scale-110"
                )}
                title="Контакты"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
