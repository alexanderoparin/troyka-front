"use client"

import { useEffect, useState } from "react"
import { X, AlertTriangle, AlertCircle } from "lucide-react"
import { apiClient, SystemStatusResponse } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "system_status_banner_dismissed"

export function SystemStatusBanner() {
  const [status, setStatus] = useState<SystemStatusResponse | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStatus = () => {
      // Добавляем timestamp для предотвращения кэширования
      const url = '/api/system/status?' + new Date().getTime()
      apiClient.getSystemStatus()
        .then(response => {
          console.log('[SystemStatusBanner] Ответ от API:', JSON.stringify(response, null, 2))
          console.log('[SystemStatusBanner] response.data:', response.data)
          console.log('[SystemStatusBanner] response.status:', response.status)
          console.log('[SystemStatusBanner] response.error:', response.error)
          
          if (response.data) {
            // Если поле status отсутствует или undefined, считаем что статус ACTIVE
            const currentStatus = response.data.status || 'ACTIVE'
            console.log('[SystemStatusBanner] Статус:', currentStatus, 'Сообщение:', response.data.message)
            
            // Если статус изменился с ACTIVE на проблемный, сбрасываем флаг dismissed
            const dismissedStatus = localStorage.getItem(`${STORAGE_KEY}_status`)
            if (dismissedStatus && dismissedStatus !== currentStatus) {
              console.log('[SystemStatusBanner] Статус изменился, сбрасываем dismissed')
              localStorage.removeItem(STORAGE_KEY)
              setIsDismissed(false)
            }
            
            // Показываем баннер только если статус не ACTIVE
            if (currentStatus !== 'ACTIVE') {
              console.log('[SystemStatusBanner] Устанавливаем статус:', response.data)
              setStatus(response.data)
            } else {
              console.log('[SystemStatusBanner] Статус ACTIVE, скрываем баннер')
              setStatus(null)
            }
          } else {
            console.log('[SystemStatusBanner] Нет данных в ответе, response:', response)
            // Если нет данных, считаем что статус ACTIVE
            setStatus(null)
          }
          setIsLoading(false)
        })
        .catch(error => {
          console.error('[SystemStatusBanner] Ошибка загрузки статуса системы:', error)
          console.error('[SystemStatusBanner] Детали ошибки:', JSON.stringify(error, null, 2))
          setIsLoading(false)
          // При ошибке не показываем баннер
          setStatus(null)
        })
    }

    // Проверяем, был ли баннер закрыт пользователем для текущего статуса
    const dismissed = localStorage.getItem(STORAGE_KEY)
    const dismissedStatus = localStorage.getItem(`${STORAGE_KEY}_status`)
    
    console.log('[SystemStatusBanner] Инициализация. dismissed:', dismissed, 'dismissedStatus:', dismissedStatus)
    
    loadStatus()
    
    // Если баннер был закрыт, проверяем, не изменился ли статус
    if (dismissed) {
      console.log('[SystemStatusBanner] Баннер был закрыт для статуса:', dismissedStatus)
      setIsDismissed(true)
    }

    // Периодически проверяем статус (каждые 30 секунд)
    const interval = setInterval(loadStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem(STORAGE_KEY, 'true')
    // Сохраняем статус, для которого баннер был закрыт
    if (status) {
      localStorage.setItem(`${STORAGE_KEY}_status`, status.status)
    }
  }

  // Не показываем баннер если загрузка, закрыт пользователем или статус ACTIVE
  console.log('[SystemStatusBanner] Рендер. isLoading:', isLoading, 'isDismissed:', isDismissed, 'status:', status)
  if (isLoading || isDismissed || !status || status.status === 'ACTIVE') {
    console.log('[SystemStatusBanner] Баннер скрыт. Причина:', isLoading ? 'загрузка' : isDismissed ? 'закрыт пользователем' : !status ? 'нет статуса' : 'статус ACTIVE')
    return null
  }

  const isDegraded = status.status === 'DEGRADED'
  const isMaintenance = status.status === 'MAINTENANCE'

  return (
    <div
      className={cn(
        "fixed top-16 left-0 right-0 z-40 border-b shadow-sm",
        isDegraded && "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/50",
        isMaintenance && "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50"
      )}
      style={{ top: '4rem' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {isDegraded && (
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            )}
            {isMaintenance && (
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm font-medium",
              isDegraded && "text-yellow-800 dark:text-yellow-200",
              isMaintenance && "text-red-800 dark:text-red-200"
            )}>
              {status.message || (isDegraded 
                ? "Система работает с ограничениями, возможны задержки"
                : "Серьезные проблемы с инфраструктурой, сервис может быть недоступен")}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className={cn(
              "flex-shrink-0 h-8 w-8 p-0",
              isDegraded && "hover:bg-yellow-100 dark:hover:bg-yellow-900/30",
              isMaintenance && "hover:bg-red-100 dark:hover:bg-red-900/30"
            )}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

