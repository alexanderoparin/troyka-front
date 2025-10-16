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
      <div className="relative h-16 flex items-center justify-between px-4">


        {/* Right Floating Block - User Avatar */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2" style={{ zIndex: 20 }}>
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
