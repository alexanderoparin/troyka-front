"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AvatarUpload } from "@/components/avatar-upload"
import { 
  User, 
  LogOut, 
  CreditCard,
  Plus
} from "lucide-react"
import { getPointsText } from "@/lib/grammar"

export function Header() {
  const { user, isAuthenticated, isLoading, logout, points, avatar } = useAuth()

  return (
    <header className="absolute top-0 left-0 right-0 w-full" style={{ zIndex: 30 }}>
      <div className="relative h-16 flex items-center justify-center px-4">

        {/* Central Navigation Block - Desktop Only */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-background/20 backdrop-blur-xl border border-border/20 shadow-lg dark:bg-background/30 dark:border-border/10 hover:bg-background/60 hover:border-border/30 dark:hover:bg-background/70 dark:hover:border-border/15 transition-all duration-300">
          <Button asChild variant="ghost" size="sm" className="h-8 px-3">
            <Link href="/">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="ml-2">Главная</span>
            </Link>
          </Button>

          <Button asChild variant="ghost" size="sm" className="h-8 px-3">
            <Link href="/studio">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 4V2" />
                <path d="M15 16v-2" />
                <path d="M8 9h2" />
                <path d="M20 9h2" />
                <path d="M17.8 11.8 19 13" />
                <path d="M15 9h0" />
                <path d="M17.8 6.2 19 5" />
                <path d="m3 21 9-9" />
                <path d="M12.2 6.2 11 5" />
              </svg>
              <span className="ml-2">Студия</span>
            </Link>
          </Button>

          <Button asChild variant="ghost" size="sm" className="h-8 px-3">
            <Link href="/history">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              <span className="ml-2">История генераций</span>
            </Link>
          </Button>

          <Button asChild variant="ghost" size="sm" className="h-8 px-3">
            <Link href="/pricing">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span className="ml-2">Цены</span>
            </Link>
          </Button>
        </div>


        {/* Mobile - Only Avatar */}
        <div className="md:hidden absolute right-4 top-1/2 transform -translate-y-1/2" style={{ zIndex: 20 }}>
          {isLoading ? (
            <div className="w-10 h-10 animate-pulse bg-muted rounded-full" />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-background/20">
                  <AvatarUpload 
                    currentAvatar={avatar || undefined}
                    userName={user?.username}
                    size="sm"
                    className="h-10 w-10"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount style={{ zIndex: 100 }}>
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
    </header>
  )
}
