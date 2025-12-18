"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useImageHistory } from "@/hooks/use-image-history"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Image as ImageIcon,
  AlertCircle,
  Download,
  Maximize2,
  X
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import Link from "next/link"
import Image from "next/image"

export default function HistoryPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const { history: imageHistory, isLoading: historyLoading, error: historyError, refetch } = useImageHistory()
  const router = useRouter()
  const [selectedImageForModal, setSelectedImageForModal] = useState<string | null>(null)

  // Функция для открытия изображения в полный размер
  const handleImageExpand = (imageUrl: string) => {
    setSelectedImageForModal(imageUrl)
  }

  // Функция для скачивания изображения
  const handleImageDownload = async (imageUrl: string) => {
    try {
      // getFileUrl уже проксирует FAL AI URLs, но для скачивания нужно убедиться что используется проксирование
      let finalUrl = apiClient.getFileUrl(imageUrl)
      
      // Если URL еще не проксирован (содержит v3.fal.media или v3b.fal.media), проксируем его
      if (finalUrl.includes('v3.fal.media') || finalUrl.includes('v3b.fal.media')) {
        finalUrl = apiClient.proxyFalMediaUrl(finalUrl)
      }
      
      const response = await fetch(finalUrl)
      
      // Проверяем успешность ответа
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      
      // Проверяем, что blob не пустой
      if (blob.size === 0) {
        throw new Error('Получен пустой файл. Возможно, проблема с загрузкой изображения с сервера.')
      }
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      // Определяем расширение из URL
      const extension = imageUrl.toLowerCase().endsWith('.png') ? 'png' : 'jpg'
      link.download = `generated-image-${Date.now()}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Ошибка при скачивании изображения:', error)
      // Можно добавить toast уведомление, если нужно
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center space-y-8 py-20">
        <div className="space-y-4">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-3xl font-bold">Требуется авторизация</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Войдите в аккаунт, чтобы просмотреть историю генерации
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => router.push("/login")}>
            <ImageIcon className="w-5 h-5 mr-2" />
            Войти в аккаунт
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/">На главную</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full overflow-x-hidden min-h-screen">
      {/* Background for entire page */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.3)_0%,_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.3)_0%,_transparent_70%)] pointer-events-none -z-10" />
      
      {/* Decorative stars/particles - равномерно по всей странице, на заднем фоне */}
      <div className="absolute top-20 left-[15%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none"></div>
      <div className="absolute top-32 left-[85%] w-3 h-3 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-[400px] left-[25%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-[600px] left-[75%] w-3 h-3 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-[500px] left-1/2 w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '0.3s' }}></div>
      <div className="absolute top-[300px] left-[35%] w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '0.8s' }}></div>
      <div className="absolute top-[250px] left-[65%] w-1.5 h-1.5 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '1.2s' }}></div>
      <div className="absolute top-[750px] left-[45%] w-1.5 h-1.5 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '0.7s' }}></div>
      <div className="absolute top-[150px] left-[55%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '1.8s' }}></div>
      <div className="absolute top-[850px] left-[20%] w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '0.4s' }}></div>
      <div className="absolute top-[550px] left-[80%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '1.1s' }}></div>
      <div className="absolute top-[900px] left-[40%] w-1.5 h-1.5 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '0.9s' }}></div>
      <div className="absolute top-[1200px] left-[60%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '0.2s' }}></div>
      <div className="absolute top-[1100px] left-[30%] w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '1.3s' }}></div>
      <div className="absolute top-[1300px] left-[70%] w-1.5 h-1.5 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '0.6s' }}></div>
      <div className="absolute top-[1400px] left-[18%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '1.4s' }}></div>
      <div className="absolute top-[1500px] left-[50%] w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '0.1s' }}></div>
      <div className="absolute top-[1600px] left-[82%] w-1.5 h-1.5 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '1.6s' }}></div>
      <div className="absolute top-[1700px] left-[28%] w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '0.9s' }}></div>
      <div className="absolute top-[1800px] left-[62%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '1.7s' }}></div>
      <div className="absolute top-[1900px] left-[38%] w-1.5 h-1.5 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-[2000px] left-[72%] w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '1.2s' }}></div>

      <div className="relative z-10 space-y-8 w-full px-4">
      {/* Логотип для мобильной версии */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/20 backdrop-blur-xl border border-border/20 shadow-lg dark:bg-background/30 dark:border-border/10 hover:bg-background/60 hover:border-border/30 dark:hover:bg-background/70 dark:hover:border-border/15 transition-all duration-300">
          <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">24</span>
          </div>
          <span className="text-lg font-bold gradient-text">24reshai</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-4 text-center pt-20">
        <h1 className="text-3xl font-bold">История генерации изображений</h1>
        <p className="text-muted-foreground">
          Все ваши созданные изображения
        </p>
      </div>

      {/* History Content */}
          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : historyError ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Ошибка загрузки истории</p>
              <p className="mb-4">{historyError}</p>
              <Button onClick={refetch} variant="outline">
                Попробовать снова
          </Button>
        </div>
          ) : imageHistory && imageHistory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {imageHistory.map((item, index) => (
                <div key={index} className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square bg-muted">
                    <Image
                      src={apiClient.getFileUrl(item.imageUrls[0])}
                      alt={item.prompt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    
                    {/* Overlay с действиями - только при hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleImageExpand(apiClient.getFileUrl(item.imageUrls[0]))
                        }}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleImageDownload(apiClient.getFileUrl(item.imageUrls[0]))
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium line-clamp-2 mb-2" title={item.prompt}>
                      {item.prompt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDate(new Date(item.createdAt))}</span>
                    </div>
                  </div>
                </div>
          ))}
        </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">История генерации пуста</p>
              <p className="mb-4">Создайте первое изображение в студии</p>
              <Button asChild>
                <Link href="/studio">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Создать изображение
                </Link>
          </Button>
        </div>
      )}

      {/* Модальное окно для просмотра изображения */}
      {selectedImageForModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
          onClick={() => setSelectedImageForModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedImageForModal(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Image
              src={selectedImageForModal}
              alt="Полный размер изображения"
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      )}
      </div>
    </div>
  )
}