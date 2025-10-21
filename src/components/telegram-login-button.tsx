"use client"

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

interface TelegramLoginButtonProps {
  onAuthCallback?: (user: TelegramUser) => void
  botName: string
  buttonSize?: 'large' | 'medium' | 'small'
  cornerRadius?: number
  requestAccess?: boolean
  usePic?: boolean
  lang?: string
  widgetVersion?: number
  className?: string
}

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUser) => void
  }
}

export const TelegramLoginButton = ({
  onAuthCallback,
  botName,
  buttonSize = 'large',
  cornerRadius = 8,
  requestAccess = true,
  usePic = true,
  lang = 'ru',
  widgetVersion = 22,
  className = ''
}: TelegramLoginButtonProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log('TelegramLoginButton: botName =', botName)
    
    if (!botName) {
      console.error('TelegramLoginButton: botName is required')
      return
    }

    if (!containerRef.current) {
      console.error('TelegramLoginButton: container not found')
      return
    }

    // Очищаем контейнер
    containerRef.current.innerHTML = ''

    // Создаем скрипт для загрузки Telegram Login Widget
    const script = document.createElement('script')
    script.src = `https://telegram.org/js/telegram-widget.js?${widgetVersion}`
    script.setAttribute('data-telegram-login', botName)
    script.setAttribute('data-size', buttonSize)
    script.setAttribute('data-radius', cornerRadius.toString())
    script.setAttribute('data-request-access', requestAccess ? 'write' : 'read')
    script.setAttribute('data-userpic', usePic.toString())
    script.setAttribute('data-lang', lang)
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.async = true

    // Добавляем скрипт в контейнер
    containerRef.current.appendChild(script)

    // Обработчики событий скрипта
    script.onload = () => {
      console.log('Telegram widget script loaded successfully')
    }
    
    script.onerror = (error) => {
      console.error('Failed to load Telegram widget script:', error)
    }

    // Глобальная функция для обработки авторизации
    window.onTelegramAuth = (user: TelegramUser) => {
      console.log('Telegram auth data:', user)
      onAuthCallback?.(user)
    }

    return () => {
      // Очистка при размонтировании
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
      delete window.onTelegramAuth
    }
  }, [botName, buttonSize, cornerRadius, requestAccess, usePic, lang, widgetVersion, onAuthCallback])

  return (
    <div className={className}>
      <div ref={containerRef} className="w-full" />
    </div>
  )
}