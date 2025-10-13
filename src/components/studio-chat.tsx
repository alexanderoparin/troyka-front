"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Send, 
  Image as ImageIcon, 
  Download, 
  Eye, 
  Loader2,
  Sparkles,
  User,
  Bot,
  Copy,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSessionHistory } from "@/hooks/use-session-detail"
import { SessionMessage } from "@/lib/api-client"
import Image from "next/image"

interface StudioChatProps {
  sessionId?: number
  onGenerationComplete: (images: string[], prompt: string) => void
  className?: string
}

export function StudioChat({ 
  sessionId, 
  onGenerationComplete,
  className 
}: StudioChatProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [copiedImageUrl, setCopiedImageUrl] = useState<string | null>(null)
  const [numImages, setNumImages] = useState(2)
  const [outputFormat, setOutputFormat] = useState<'JPEG' | 'PNG'>('JPEG')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  
  const aspectRatios = ['1:1', '4:3', '4:5', '3:2', '2:3', '16:9', '9:16', '7.5:2']
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const {
    history,
    totalMessages,
    hasMore,
    isLoading,
    loadMoreHistory,
  } = useSessionHistory(sessionId || null, 20)

  // Автоматическая прокрутка к низу при новых сообщениях
  useEffect(() => {
    if (scrollAreaRef.current && history.length > 0) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [history.length])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите изображение",
        variant: "destructive",
      })
      return
    }

    // Создаем URL для предварительного просмотра
    const imageUrl = URL.createObjectURL(file)
    setUploadedImage(imageUrl)
    
    toast({
      title: "Изображение загружено",
      description: "Изображение готово для использования",
    })
  }, [toast])

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите описание изображения",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      // Здесь будет вызов API для генерации
      // Пока что симуляция
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Симулируем результат
      const mockImages = Array.from({ length: numImages }, (_, i) => 
        `https://via.placeholder.com/400x600/4F46E5/FFFFFF?text=Generated+${i + 1}`
      )
      
      onGenerationComplete(mockImages, prompt)
      setPrompt("")
      setUploadedImage(null)
      
      toast({
        title: "Изображения созданы!",
        description: `Создано ${numImages} изображений в формате ${outputFormat} (${aspectRatio})`,
      })
    } catch (error) {
      toast({
        title: "Ошибка генерации",
        description: "Не удалось создать изображения",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, numImages, outputFormat, onGenerationComplete, toast])

  const handleImageSelect = (imageUrl: string) => {
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
      setPrompt("") // Очищаем промпт для нового редактирования
      toast({
        title: "Изображения выбраны",
        description: `${selectedImages.length} изображений выбрано для редактирования`,
      })
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!sessionId) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center text-muted-foreground">
          <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Выберите сессию</p>
          <p className="text-sm">Диалог появится здесь</p>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn("h-full flex flex-col", className)}>
      {/* История диалога */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
        <div className="space-y-6 pb-6">
          {/* Кнопка загрузки предыдущих сообщений */}
          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadMoreHistory(0)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  "Загрузить предыдущие"
                )}
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
              <p>Загрузка диалога...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Начните диалог</p>
              <p className="text-sm">Опишите изображение, которое хотите создать</p>
            </div>
          ) : (
            history.map((message) => (
              <div key={message.id} className="space-y-4">
                {/* Сообщение пользователя (промпт) */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Card className="p-4">
                      <p className="text-sm leading-relaxed">{message.prompt}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
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
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <Bot className="h-5 w-5 text-secondary-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Card className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {message.imageUrls.map((imageUrl, index) => (
                          <div
                            key={index}
                            className={cn(
                              "relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                              selectedImages.includes(imageUrl) 
                                ? "border-primary ring-2 ring-primary/20" 
                                : "border-border hover:border-primary/50"
                            )}
                            onClick={() => handleImageSelect(imageUrl)}
                          >
                            <div className="w-24 h-32 sm:w-32 sm:h-40 relative">
                              <Image
                                src={imageUrl}
                                alt={`Сгенерированное изображение ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                              
                              {/* Overlay с действиями */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    window.open(imageUrl, '_blank')
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-6 w-6 p-0"
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
                                  className="h-6 w-6 p-0"
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
                                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-primary-foreground text-xs font-bold">
                                      {selectedImages.indexOf(imageUrl) + 1}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
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

            {/* Плавающее окно ввода промпта */}
            <div className="fixed bottom-12 left-0 right-0 z-50">
              <div className="flex justify-center px-6">
                <div className="bg-background/95 backdrop-blur-md border border-border/20 rounded-2xl shadow-2xl px-4 pt-4 pb-3 min-w-[600px] max-w-[700px] w-full">
          {/* Загруженное изображение */}
          {uploadedImage && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">
                  Изображение загружено
                </Badge>
                <Button 
                  onClick={() => setUploadedImage(null)} 
                  size="sm" 
                  variant="outline"
                >
                  Удалить
                </Button>
              </div>
              <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                <Image
                  src={uploadedImage}
                  alt="Загруженное изображение"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Выбранные изображения */}
          {selectedImages.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">
                  {selectedImages.length} изображений выбрано
                </Badge>
                <Button onClick={handleUseSelectedImages} size="sm" variant="outline">
                  Использовать для редактирования
                </Button>
              </div>
            </div>
          )}

                  {/* Поле ввода промпта */}
                  <div className="mb-3">
                    <div className="flex gap-2">
                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Опишите изображение, которое хотите создать..."
                        className="h-[88px] resize-none text-base flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault()
                            handleGenerate()
                          }
                        }}
                      />
                      {/* Опции генерации */}
                      <div className="flex flex-col gap-2">
                        {/* Первый ряд */}
                        <div className="flex items-center gap-2">
                          {/* Формат изображения */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-16 p-0"
                                onClick={() => setOutputFormat(prev => prev === 'JPEG' ? 'PNG' : 'JPEG')}
                              >
                                {outputFormat}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="z-[9999]">
                              <p>Формат изображения (нажмите для смены)</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          {/* Количество изображений */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-12 p-0"
                                onClick={() => setNumImages(prev => prev >= 4 ? 1 : prev + 1)}
                              >
                                {numImages}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="z-[9999]">
                              <p>Количество изображений (нажмите для смены)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        
                        {/* Второй ряд */}
                        <div className="flex items-center gap-2">
                          {/* Соотношение сторон */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-16 p-0"
                                onClick={() => {
                                  const currentIndex = aspectRatios.indexOf(aspectRatio)
                                  const nextIndex = (currentIndex + 1) % aspectRatios.length
                                  setAspectRatio(aspectRatios[nextIndex])
                                }}
                              >
                                {aspectRatio}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="z-[9999]">
                              <p>Соотношение сторон (нажмите для смены)</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          {/* Загрузка изображения */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-12 p-0"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <ImageIcon className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                          <TooltipContent className="z-[9999]">
                            <p>Загрузить изображение</p>
                          </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                        {/* Кнопка генерации */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="lg"
                              className="h-[88px] w-[88px] p-0 bg-primary hover:bg-primary/90 text-primary-foreground"
                              onClick={handleGenerate}
                              disabled={isGenerating || !prompt.trim()}
                            >
                              {isGenerating ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                              ) : (
                                <Sparkles className="h-6 w-6" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="z-[9999]">
                            <p>{isGenerating ? "Генерация изображений..." : "Генерировать изображения"}</p>
                          </TooltipContent>
                        </Tooltip>
                    </div>
                  </div>

          </div>
        </div>
      </div>
      </div>
    </TooltipProvider>
  )
}
