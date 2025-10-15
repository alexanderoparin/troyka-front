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

interface MobileFloatingToolbarProps {
  className?: string
}

export function MobileFloatingToolbar({ className }: MobileFloatingToolbarProps) {
  const { isAuthenticated, points, user } = useAuth()
  const pathname = usePathname()
  const [isToolbarHovered, setIsToolbarHovered] = useState(false)

  const toolbarItems = [
    {
      icon: Home,
      label: "Главная",
      href: "/",
      isActive: pathname === "/"
    },
    {
      icon: Image,
      label: "Студия",
      href: "/studio",
      isActive: pathname === "/studio"
    },
    {
      icon: Video,
      label: "История",
      href: "/history",
      isActive: pathname === "/history"
    },
    {
      icon: CreditCard,
      label: "Цены",
      href: "/pricing",
      isActive: pathname === "/pricing"
    },
    {
      icon: Ruler,
      label: "Настройки",
      href: "/account",
      isActive: pathname === "/account"
    }
  ]

  return (
    <div className={cn("relative", className)}>
      {/* Mobile Floating Toolbar Container */}
      <div 
        className={cn(
          "inline-flex items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-300",
          "bg-background/90 backdrop-blur-xl border border-border/40",
          "shadow-lg hover:shadow-xl hover:shadow-primary/10",
          "dark:bg-background/95 dark:border-border/20",
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
                  "h-7 w-7 rounded-lg transition-all duration-200",
                  "hover:bg-primary/15 hover:scale-110",
                  "dark:hover:bg-primary/25",
                  "active:scale-95",
                  item.isActive && "bg-primary/20 text-primary scale-110 ring-1 ring-primary/30"
                )}
                title={item.label}
              >
                <Icon className="h-3 w-3" />
              </Button>
            </Link>
          )
        })}
      </div>

      {/* User Info Badge (if authenticated) - Mobile version - Only show on toolbar hover */}
      {isAuthenticated && isToolbarHovered && (
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 z-50">
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full transition-all duration-300",
            "bg-background/95 backdrop-blur-xl border border-border/50 shadow-md",
            "hover:shadow-lg hover:scale-105",
            "dark:bg-background/98 dark:border-border/30"
          )}>
            <Badge variant="outline" className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20 text-xs px-1.5 py-0.5">
              <User className="h-2.5 w-2.5" />
              <span className="font-medium">{user?.username || 'User'}</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 text-xs px-1.5 py-0.5 font-medium">
              <CreditCard className="h-2.5 w-2.5" />
              <span>{getPointsText(points)}</span>
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}
