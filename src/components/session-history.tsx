"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  MessageSquare, 
  User, 
  Bot, 
  Image as ImageIcon,
  Download,
  Copy,
  Check,
  Loader2,
  ArrowUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSessionHistory } from "@/hooks/use-session-detail"
import { SessionMessage } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"

interface SessionHistoryProps {
  sessionId: number | null
  onImageSelect: (imageUrl: string) => void
  onImagesSelect: (imageUrls: string[]) => void
  className?: string
}

export function SessionHistory({ 
  sessionId, 
  onImageSelect, 
  onImagesSelect,
  className 
}: SessionHistoryProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [copiedImageUrl, setCopiedImageUrl] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const {
    history,
    totalMessages,
    hasMore,
    isLoading,
    loadMoreHistory,
    updateHistoryAfterGeneration,
  } = useSessionHistory(sessionId, 20)

  // Автоматическая прокрутка к низу при загрузке новых сообщений
  useEffect(() => {
    if (scrollAreaRef.current && history.length > 0) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [history.length])

  const handleImageClick = (imageUrl: string) => {
    if (selectedImages.includes(imageUrl)) {
      setSelectedImages(prev => prev.filter(url => url !== imageUrl))
    } else if (selectedImages.length < 4) {
      setSelectedImages(prev => [...prev, imageUrl])
    } else {
      toast({
        title: "Максимум изображений",
        description: "Можно выбрать не более 4 изображений",
        variant: "destructive",
      })
    }
  }

  const handleUseSelectedImages = () => {
    if (selectedImages.length > 0) {
      onImagesSelect(selectedImages)
      setSelectedImages([])
      toast({
        title: "Изображения выбраны",
        description: `${selectedImages.length} изображений добавлено в форму`,
      })
    }
  }

  const handleUseImage = (imageUrl: string) => {
    onImageSelect(imageUrl)
    toast({
      title: "Изображение выбрано",
      description: "Изображение добавлено в форму",
    })
  }

  const handleCopyImageUrl = async (imageUrl: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl)
      setCopiedImageUrl(imageUrl)
      setTimeout(() => setCopiedImageUrl(null), 2000)
      toast({
        title: "URL скопирован",
        description: "Ссылка на изображение скопирована в буфер обмена",
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать ссылку",
        variant: "destructive",
      })
    }
  }

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return
    
    setIsLoadingMore(true)
    try {
      const nextPage = currentPage + 1
      await loadMoreHistory(nextPage)
      setCurrentPage(nextPage)
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить больше сообщений",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMore(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const downloadImage = async (imageUrl: string, filename?: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || `image-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Изображение скачано",
        description: "Изображение сохранено на устройство",
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось скачать изображение",
        variant: "destructive",
      })
    }
  }

  if (!sessionId) {
    return (
      <Card className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Выберите сессию</p>
          <p className="text-sm">История диалога появится здесь</p>
        </div>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p className="text-muted-foreground">Загрузка истории...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      {/* Заголовок */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">История диалога</h3>
            <p className="text-sm text-muted-foreground">
              {totalMessages} сообщений
            </p>
          </div>
          
          {selectedImages.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedImages.length} выбрано
              </Badge>
              <Button
                size="sm"
                onClick={handleUseSelectedImages}
              >
                Использовать
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* История сообщений */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-6">
          {/* Кнопка загрузки предыдущих сообщений */}
          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Загрузить предыдущие
                  </>
                )}
              </Button>
            </div>
          )}

          {history.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>История пуста</p>
              <p className="text-sm">Начните диалог с генерации изображения</p>
            </div>
          ) : (
            history.map((message) => (
              <div key={message.id} className="space-y-4">
                {/* Сообщение пользователя (промпт) */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Card className="p-3">
                      <p className="text-sm">{message.prompt}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{formatDate(message.createdAt)}</span>
                        {message.inputImageUrls && message.inputImageUrls.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {message.inputImageUrls.length} входных изображений
                          </Badge>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Ответ AI (изображения) */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <Bot className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Card className="p-3">
                      <div className="grid grid-cols-2 gap-2">
                        {message.imageUrls.map((imageUrl, index) => (
                          <div
                            key={index}
                            className={cn(
                              "relative group cursor-pointer rounded-lg overflow-hidden",
                              selectedImages.includes(imageUrl) && "ring-2 ring-primary"
                            )}
                            onClick={() => handleImageClick(imageUrl)}
                          >
                            <img
                              src={imageUrl}
                              alt={`Сгенерированное изображение ${index + 1}`}
                              className="w-full h-32 object-cover"
                            />
                            
                            {/* Overlay с действиями */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUseImage(imageUrl)
                                }}
                              >
                                Использовать
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  downloadImage(imageUrl, `generated-${message.id}-${index + 1}.jpg`)
                                }}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopyImageUrl(imageUrl)
                                }}
                              >
                                {copiedImageUrl === imageUrl ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>

                            {/* Индикатор выбора */}
                            {selectedImages.includes(imageUrl) && (
                              <div className="absolute top-2 right-2">
                                <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                  <Check className="h-2 w-2 text-primary-foreground" />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <ImageIcon className="h-3 w-3" />
                        <span>{message.imageCount} изображений</span>
                        <span>•</span>
                        <span>{message.outputFormat}</span>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
