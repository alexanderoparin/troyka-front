"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Home, 
  Image, 
  Video, 
  PenTool, 
  Wand2, 
  Ruler,
  Folder,
  Plus,
  Sparkles,
  CreditCard,
  User
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getPointsText } from "@/lib/grammar"
import { cn } from "@/lib/utils"

interface FloatingToolbarProps {
  className?: string
}

export function FloatingToolbar({ className }: FloatingToolbarProps) {
  const { isAuthenticated, points, user } = useAuth()
  const pathname = usePathname()
  const [isToolbarHovered, setIsToolbarHovered] = useState(false)

  const toolbarItems = [
    {
      icon: Home,
      label: "Главная",
      href: "/",
      isActive: pathname === "/",
      isNew: false
    },
    {
      icon: Image,
      label: "Студия",
      href: "/studio",
      isActive: pathname === "/studio",
      isNew: false
    },
    {
      icon: Video,
      label: "История",
      href: "/history",
      isActive: pathname === "/history",
      isNew: false
    },
    {
      icon: CreditCard,
      label: "Цены",
      href: "/pricing",
      isActive: pathname === "/pricing",
      isNew: false
    },
    {
      icon: Ruler,
      label: "Настройки",
      href: "/account",
      isActive: pathname === "/account",
      isNew: false
    }
  ]

  return (
    <div className={cn("relative", className)}>
      {/* Floating Toolbar Container */}
      <div 
        className={cn(
          "inline-flex items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-300",
          "bg-background/85 backdrop-blur-xl border border-border/40",
          "shadow-lg hover:shadow-xl hover:shadow-primary/10",
          "dark:bg-background/90 dark:border-border/20",
          "dark:hover:shadow-primary/20",
          isToolbarHovered && "scale-105 shadow-xl shadow-primary/15 dark:shadow-primary/25"
        )}
        onMouseEnter={() => setIsToolbarHovered(true)}
        onMouseLeave={() => setIsToolbarHovered(false)}
      >
        {/* Toolbar Buttons */}
        {toolbarItems.map((item, index) => {
          const Icon = item.icon
          return (
            <Link key={item.href + index} href={item.href}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-lg transition-all duration-200 relative",
                  "hover:bg-primary/15 hover:scale-110",
                  "dark:hover:bg-primary/25",
                  "active:scale-95",
                  item.isActive && "bg-primary/20 text-primary scale-110 ring-1 ring-primary/30"
                )}
                title={item.label}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.isNew && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </Button>
            </Link>
          )
        })}
      </div>

      {/* User Info Badge (if authenticated) - Only show on toolbar hover */}
      {isAuthenticated && isToolbarHovered && (
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 z-50">
          <div className="floating-user-info">
            <Badge variant="outline" className="flex items-center gap-1.5 bg-primary/10 text-primary border-primary/20 text-xs px-2 py-1">
              <User className="h-3 w-3" />
              <span className="hidden sm:inline font-medium">{user?.username || 'Пользователь'}</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1.5 text-xs px-2 py-1 font-medium">
              <CreditCard className="h-3 w-3" />
              <span>{getPointsText(points)}</span>
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}
