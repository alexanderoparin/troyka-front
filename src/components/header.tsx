"use client"

import { useState } from "react"
import Link from "next/link"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AvatarUpload } from "@/components/avatar-upload"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  User, 
  Settings, 
  LogOut, 
  Zap, 
  History, 
  CreditCard,
  Plus,
  Sparkles,
  Menu,
  X
} from "lucide-react"
import { getPointsText } from "@/lib/grammar"

export function Header() {
  const { user, isAuthenticated, isLoading, logout, points, avatar } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="text-lg sm:text-2xl font-bold gradient-text">24reshai</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/studio" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Студия
            </Link>
            <Link 
              href="/history" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              История генераций
            </Link>
            <Link 
              href="/pricing" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Цены
            </Link>
            <Link 
              href="/contacts" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Контакты
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0 min-w-0">
            {/* User info (if authenticated) */}
            {isAuthenticated && (
              <div className="hidden sm:flex items-center space-x-2">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>{user?.username || 'Пользователь'}</span>
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1 bg-primary/10 text-primary border-primary/20">
                  <CreditCard className="h-3 w-3" />
                  <span>{getPointsText(points)}</span>
                </Badge>
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

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
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user?.username && (
                        <p className="font-medium">{user.username}</p>
                      )}
                      {user?.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
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
                    <Link href="/history">
                      <History className="mr-2 h-4 w-4" />
                      История генераций
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
              <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
                <Button asChild size="sm" className="text-xs sm:text-sm px-1 sm:px-3 md:px-4 py-1 sm:py-2 min-w-0 h-7 sm:h-8">
                  <Link href="/login">Войти</Link>
                </Button>
                <Button variant="outline" asChild size="sm" className="text-xs sm:text-sm px-1 sm:px-3 md:px-4 py-1 sm:py-2 min-w-0 h-7 sm:h-8">
                  <Link href="/register">Регистрация</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              className="md:hidden"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/studio" 
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Студия
              </Link>
              <Link 
                href="/history" 
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                История генераций
              </Link>
              <Link 
                href="/payment-history" 
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                История платежей
              </Link>
              <Link 
                href="/pricing" 
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Цены
              </Link>
              <Link 
                href="/contacts" 
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Контакты
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
