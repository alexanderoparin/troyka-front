"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
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
  ArrowUp,
  Plus
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { useSessionHistory } from "@/hooks/use-session-detail"

// Функция для правильного склонения слова "изображение"
const getImageText = (count: number) => {
  if (count === 1) return 'изображение'
  if (count >= 2 && count <= 4) return 'изображения'
  return 'изображений'
}

// Функция для правильного склонения слова "входное изображение"
const getInputImageText = (count: number) => {
  if (count === 1) return 'входное изображение'
  if (count >= 2 && count <= 4) return 'входных изображения'
  return 'входных изображений'
}
import { useToast } from "@/components/ui/use-toast"

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
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [copiedImageUrl, setCopiedImageUrl] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const {
    history,
    hasMore,
    isLoading,
    loadMoreHistory,
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
        description: `${selectedImages.length} ${getImageText(selectedImages.length)} добавлено в форму`,
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
      // Проксируем URL только для FAL AI изображений, для остальных используем оригинальный URL
      const proxiedUrl = apiClient.proxyFalMediaUrlIfNeeded(imageUrl)
      const response = await fetch(proxiedUrl)
      
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
      const a = document.createElement('a')
      a.href = url
      // Определяем расширение из URL, если имя файла не указано
      if (!filename) {
        const extension = imageUrl.toLowerCase().endsWith('.png') ? 'png' : 'jpg'
        a.download = `image-${Date.now()}.${extension}`
      } else {
        // Если имя файла указано, но без расширения - добавляем его
        const urlExtension = imageUrl.toLowerCase().endsWith('.png') ? 'png' : 'jpg'
        const hasExtension = filename.includes('.')
        a.download = hasExtension ? filename : `${filename}.${urlExtension}`
      }
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Изображение скачано",
        description: "Изображение сохранено на устройство",
      })
    } catch (error) {
      console.error('Ошибка скачивания изображения:', error)
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось скачать изображение",
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
              {history.length} сообщений
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
            history.map((message, messageIndex) => (
              <div key={message.id} className="space-y-4">
                {/* Сообщение пользователя (промпт) */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Card className="p-3 bg-muted/50 dark:bg-muted/20">
                        <p className="text-sm">
                          {message.prompt}
                        </p>
                        
                        {/* Информация о стиле, если есть */}
                        {message.styleName && (
                          <div className="mt-3 text-xs text-muted-foreground">
                            {message.styleName}
                          </div>
                        )}
                        
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{formatDate(message.createdAt)}</span>
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
                    <Card className="p-3 bg-muted/50 dark:bg-muted/20">
                      <div className="flex flex-wrap gap-2">
                        {message.imageUrls.map((imageUrl, index) => (
                          <div
                            key={index}
                            className={cn(
                              "relative group cursor-pointer rounded-lg overflow-hidden",
                              selectedImages.includes(imageUrl) && "ring-2 ring-primary"
                            )}
                            onClick={() => handleImageClick(imageUrl)}
                          >
                            <div className="w-36 h-44 sm:w-40 sm:h-48 bg-muted flex items-center justify-center rounded-lg relative">
                              {!imageErrors.has(imageUrl) ? (
                                <Image
                                  src={apiClient.getFileUrl(imageUrl)}
                                  alt={`Сгенерированное изображение ${index + 1}`}
                                  width={160}
                                  height={192}
                                  className="w-full h-full object-cover rounded-lg"
                                  quality={95}
                                  sizes="(max-width: 640px) 144px, 160px"
                                  onError={() => {
                                    console.error('Image load error:', imageUrl);
                                    setImageErrors(prev => new Set(prev).add(imageUrl));
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center rounded-lg">
                                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            
                            {/* Overlay с действиями */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-5 w-5 p-0 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUseImage(imageUrl)
                                }}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-5 w-5 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const extension = imageUrl.toLowerCase().endsWith('.png') ? 'png' : 'jpg'
                                  downloadImage(imageUrl, `generated-${message.id}-${index + 1}.${extension}`)
                                }}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-5 w-5 p-0"
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
                        <span>{message.imageCount} {getImageText(message.imageCount)}</span>
                        {(() => {
                          const modelName = message.modelType 
                            ? (message.modelType === 'nano-banana' ? 'Nano Banana' : message.modelType === 'nano-banana-pro' ? 'Nano Banana PRO' : message.modelType === 'seedream-4.5' ? 'Seedream 4.5' : 'Nano Banana')
                            : 'Nano Banana';
                          return (
                            <>
                              <span>•</span>
                              <span>{modelName}</span>
                            </>
                          );
                        })()}
                        {message.aspectRatio && (
                          <>
                            <span>•</span>
                            <span>{message.aspectRatio}</span>
                          </>
                        )}
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
