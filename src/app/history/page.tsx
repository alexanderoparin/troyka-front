"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useImageHistory } from "@/hooks/use-image-history"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  History,
  Image as ImageIcon,
  AlertCircle,
  ArrowLeft,
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
  const handleImageDownload = (imageUrl: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `generated-image-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к аккаунту
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">История генерации изображений</h1>
        <p className="text-muted-foreground">
          Все ваши созданные изображения
        </p>
      </div>

      {/* History Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Созданные изображения
          </CardTitle>
          <CardDescription>
            {imageHistory?.length || 0} изображений в истории
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      {item.prompt.replace(/, (photorealistic|anime style|pixel art|oil painting|watercolor painting|digital art|pencil sketch|professional portrait|landscape photography|macro photography|black and white|HDR photography|vintage photography|cinematic lighting|surreal art|minimalist art|gothic art|futuristic style).*$/, '')}
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
        </CardContent>
      </Card>

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
  )
}