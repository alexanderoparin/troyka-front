"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Если компонент ещё не смонтирован, используем тёмную тему как fallback
  if (!mounted) {
    return (
      <div className="dark">
        {children}
      </div>
    )
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
