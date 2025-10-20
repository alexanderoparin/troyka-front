"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import NextImage from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Image as ImageIcon, 
  Download, 
  Eye, 
  Loader2,
  Sparkles,
  User,
  Bot,
  Copy,
  Check,
  Maximize2,
  X,
  Pencil,
  Settings,
  ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSessionHistory } from "@/hooks/use-session-detail"
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
  const { avatar } = useAuth()
  const [prompt, setPrompt] = useState(() => {
    // Загружаем промпт из localStorage только при инициализации
    if (typeof window !== 'undefined') {
      return localStorage.getItem('studio-prompt') || ""
    }
    return ""
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [copiedImageUrl, setCopiedImageUrl] = useState<string | null>(null)
  const [numImages, setNumImages] = useState(2)
  const [outputFormat, setOutputFormat] = useState<'JPEG' | 'PNG'>('JPEG')
  const [artStyle, setArtStyle] = useState('Реалистичный')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [selectedImageForModal, setSelectedImageForModal] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isEditingMode, setIsEditingMode] = useState(false)
  
  // Очищаем промпт и изображения при смене сессии
  useEffect(() => {
    setPrompt("")
    setUploadedImages([])
    setSelectedImages([])
    setIsEditingMode(false)
    // Очищаем localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('studio-prompt')
    }
  }, [sessionId])

  // Очищаем промпт и изображения при обновлении страницы (монтирование компонента)
  useEffect(() => {
    // Очищаем localStorage при загрузке страницы
    if (typeof window !== 'undefined') {
      localStorage.removeItem('studio-prompt')
    }
  }, [])
  
  const artStyles = [
    { name: 'Реалистичный', prompt: ', photorealistic, high quality, detailed, professional photography' },
    { name: 'Аниме', prompt: ', anime style, manga art, vibrant colors, Japanese animation' },
    { name: 'Пиксель-арт', prompt: ', pixel art, 8-bit style, retro gaming aesthetic' },
    { name: 'Масляная живопись', prompt: ', oil painting, classical art style, brushstrokes visible' },
    { name: 'Акварель', prompt: ', watercolor painting, soft brushstrokes, translucent colors' },
    { name: 'Цифровая живопись', prompt: ', digital art, concept art style, clean lines' },
    { name: 'Карандашный рисунок', prompt: ', pencil sketch, hand-drawn illustration, graphite shading' },
    { name: 'Портрет', prompt: ', professional portrait photography, studio lighting, sharp focus' },
    { name: 'Пейзаж', prompt: ', landscape photography, golden hour lighting, wide angle' },
    { name: 'Макро', prompt: ', macro photography, extreme close-up, detailed textures' },
    { name: 'Черно-белое', prompt: ', black and white photography, monochrome, high contrast' },
    { name: 'HDR', prompt: ', HDR photography, high dynamic range, vibrant colors' },
    { name: 'Винтаж', prompt: ', vintage photography, film grain, retro aesthetic' },
    { name: 'Кинематографичный', prompt: ', cinematic lighting, movie still, dramatic composition' },
    { name: 'Сюрреализм', prompt: ', surreal art, dreamlike atmosphere, impossible elements' },
    { name: 'Минимализм', prompt: ', minimalist art, clean composition, simple background' },
    { name: 'Готика', prompt: ', gothic art, dark atmosphere, mysterious mood' },
    { name: 'Футуризм', prompt: ', futuristic style, sci-fi aesthetic, cyberpunk elements' }
  ]
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Сохраняем промпт в localStorage при изменении
  const handlePromptChange = (value: string) => {
    setPrompt(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem('studio-prompt', value)
    }
  }

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

  const {
    history,
    hasMore,
    isLoading,
    loadMoreHistory,
    updateHistoryAfterGeneration,
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

  // Очищаем localStorage при размонтировании компонента (перезагрузка страницы)
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('studio-prompt')
      }
    }
  }, [])

  // Проверяем, что input рендерится
  useEffect(() => {
    console.log('StudioChat mounted, fileInputRef:', fileInputRef.current)
  }, [])

  // Проверяем ref после каждого рендера
  useEffect(() => {
    console.log('After render, fileInputRef:', fileInputRef.current)
  })

  const handleFileUpload = useCallback(async (file: File) => {
    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите изображение",
        variant: "destructive",
      })
      return
    }

    // Проверяем размер файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Ошибка",
        description: "Файл слишком большой (максимум 10MB)",
        variant: "destructive",
      })
      return
    }

    try {
      // Загружаем файл на сервер
      const response = await apiClient.uploadFile(file)
      if (response.data) {
        setUploadedImages([response.data])
        toast({
          title: "Изображение загружено",
          description: "Изображение готово для использования",
        })
      } else {
        throw new Error(response.error || "Ошибка загрузки файла")
      }
    } catch (error: any) {
      toast({
        title: "Ошибка загрузки",
        description: error.message || "Не удалось загрузить файл",
        variant: "destructive",
      })
    }
  }, [toast])

  const handleFileInputChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed:', event.target.files)
    const file = event.target.files?.[0]
    if (!file) {
      console.log('No file selected')
      return
    }
    console.log('Selected file:', file.name, file.type, file.size)
    await handleFileUpload(file)
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      await handleFileUpload(file)
    }
  }, [handleFileUpload])

  const handlePaste = useCallback(async (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          try {
            // Загружаем файл на сервер
            const response = await apiClient.uploadFile(file)
            if (response.data) {
              setUploadedImages([response.data])
              toast({
                title: "Изображение загружено",
                description: "Изображение из буфера обмена загружено",
              })
            } else {
              throw new Error(response.error || "Ошибка загрузки файла")
            }
          } catch (error: any) {
            toast({
              title: "Ошибка загрузки",
              description: error.message || "Не удалось загрузить файл",
              variant: "destructive",
            })
          }
        }
        break
      }
    }
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
      // Добавляем стиль к промпту
      const selectedStyle = artStyles.find(style => style.name === artStyle)
      const promptWithStyle = `${prompt}${selectedStyle?.prompt || ''}`
      
      // Вызываем API для генерации
      const request = {
        prompt: promptWithStyle,
        inputImageUrls: uploadedImages.length > 0 ? uploadedImages : [],
        numImages: numImages,
        outputFormat: outputFormat,
        sessionId: sessionId
      }
      
      const response = await apiClient.generateImage(request)
      
      if (response.data) {
        onGenerationComplete(response.data.imageUrls, promptWithStyle)
        // НЕ очищаем промпт - он остается в поле ввода
        
        // В режиме редактирования прикрепляем НОВЫЕ сгенерированные изображения
        if (isEditingMode) {
          setUploadedImages(response.data.imageUrls)
          setSelectedImages(response.data.imageUrls)
        } else {
          // В обычном режиме очищаем загруженные изображения
          setUploadedImages([])
        }
        
        // Обновляем историю после успешной генерации
        updateHistoryAfterGeneration()
        
        toast({
          title: "Изображения созданы!",
          description: `Создано ${response.data.imageUrls.length} ${getImageText(response.data.imageUrls.length)} в формате ${outputFormat} (${artStyle})`,
        })
      } else {
        throw new Error(response.error || 'Ошибка генерации')
      }
    } catch (error) {
      const message = (error as any)?.message as string | undefined
      const notEnoughPoints = message?.toLowerCase().includes("недостаточно поинтов")

      if (notEnoughPoints) {
        toast({
          title: "Недостаточно поинтов",
          description: "Для генерации не хватает поинтов. Купите пакет, чтобы продолжить.",
          action: (
            <a
              href="/pricing"
              className="ml-2 inline-flex h-12 items-center justify-center rounded-md bg-primary px-4 text-base font-medium text-primary-foreground hover:opacity-90"
            >
              Купить поинты
            </a>
          ),
          variant: "default",
          duration: 20000,
        })
      } else {
        toast({
          title: "Ошибка генерации",
          description: "Не удалось создать изображения",
          variant: "destructive",
        })
      }
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, numImages, outputFormat, onGenerationComplete, toast, artStyle, sessionId, uploadedImages, updateHistoryAfterGeneration, isEditingMode])

  const handleImageExpand = (imageUrl: string) => {
    setSelectedImageForModal(imageUrl)
  }

  const handleImageDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `generated-image-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Изображение скачано",
        description: "Файл сохранен в папку загрузок",
      })
    } catch (error) {
      toast({
        title: "Ошибка скачивания",
        description: "Не удалось скачать изображение",
        variant: "destructive",
      })
    }
  }

  const handleImageSelect = (imageUrl: string) => {
    if (selectedImages.includes(imageUrl)) {
      // Удаляем изображение из выбора и из загруженных
      setSelectedImages(prev => prev.filter(url => url !== imageUrl))
      setUploadedImages(prev => prev.filter(url => url !== imageUrl))
      // Если больше нет выбранных изображений, выходим из режима редактирования
      if (selectedImages.length === 1) {
        setIsEditingMode(false)
        setUploadedImages([])
      }
    } else if (selectedImages.length < 4) {
      // Добавляем изображение в выбор и сразу в загруженные для редактирования
      setSelectedImages(prev => [...prev, imageUrl])
      setUploadedImages(prev => [...prev, imageUrl])
      // Включаем режим редактирования
      setIsEditingMode(true)
    } else {
      toast({
        title: "Максимум изображений",
        description: "Можно выбрать не более 4 изображений",
        variant: "destructive",
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
      <div className={cn("h-full flex flex-col", className)} onPaste={handlePaste}>
      {/* Скрытый input для загрузки файлов */}
      <input
        ref={fileInputRef}
        id="studio-file-input"
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      {/* История диалога */}
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="space-y-4 pb-40 p-3 sm:pb-32 sm:p-6">
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
              <div key={message.id} className="mb-4">
                {/* Промпт слева, изображения справа */}
                <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
                  {/* Левая часть - промпт */}
                  <div className="flex-1 lg:max-w-64">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 relative z-0">
                        {avatar ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden relative">
                            <NextImage
                              src={avatar}
                              alt="Аватар пользователя"
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center relative">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Card className="p-3 bg-muted/50 dark:bg-muted/20">
                          <p className="text-sm leading-relaxed text-foreground">
                            {message.prompt.replace(/, (photorealistic|anime style|pixel art|oil painting|watercolor painting|digital art|pencil sketch|professional portrait|landscape photography|macro photography|black and white|HDR photography|vintage photography|cinematic lighting|surreal art|minimalist art|gothic art|futuristic style).*$/, '')}
                          </p>
                          
                          {/* Миниатюры входных изображений */}
                          {message.inputImageUrls && message.inputImageUrls.length > 0 && (
                            <div className="mt-3 flex gap-2">
                              {message.inputImageUrls.map((imageUrl, index) => (
                                <div 
                                  key={index} 
                                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-border/50 cursor-pointer hover:border-primary/50 transition-colors group"
                                  onClick={() => handleImageExpand(imageUrl)}
                                >
                                  <Image
                                    src={imageUrl}
                                    alt={`Входное изображение ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                  {/* Кнопка редактирования в правом верхнем углу */}
                                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          className="h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white border-0"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleImageSelect(imageUrl)
                                          }}
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="z-[140]">
                                        <p>Редактировать изображение</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                            <span>{formatDate(message.createdAt)}</span>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>

                  {/* Правая часть - изображения */}
                  <div className="flex-1">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <Bot className="h-4 w-4 text-secondary-foreground" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <Card className="p-3 bg-muted/50 dark:bg-muted/20">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                        {message.imageUrls.map((imageUrl, index) => (
                          <div
                            key={index}
                            className={cn(
                              "relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                              selectedImages.includes(imageUrl) 
                                ? "border-primary ring-2 ring-primary/20" 
                                : "border-border hover:border-primary/50"
                            )}
                            onClick={() => handleImageExpand(imageUrl)}
                          >
                            <div className="w-full aspect-square relative">
                              <Image
                                src={imageUrl}
                                alt={`Сгенерированное изображение ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                              
                              {/* Overlay с действиями в правом верхнем углу */}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="h-7 w-7 p-0 bg-black/50 hover:bg-black/70 text-white border-0"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleImageSelect(imageUrl)
                                      }}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="z-[140]">
                                    <p>Редактировать изображение</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="h-7 w-7 p-0 bg-black/50 hover:bg-black/70 text-white border-0"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleImageDownload(imageUrl)
                                      }}
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="z-[140]">
                                    <p>Скачать изображение</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>

                              {/* Индикатор выбора */}
                              {selectedImages.includes(imageUrl) && (
                                <div className="absolute top-2 left-2">
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
                      
                          {message.imageUrls && Array.isArray(message.imageUrls) && message.imageUrls.length > 0 && (
                            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                              <ImageIcon className="h-3 w-3" />
                              <span>{message.imageUrls.length} {getImageText(message.imageUrls.length)}</span>
                              <span>•</span>
                              <span>{message.outputFormat || 'JPEG'}</span>
                            </div>
                          )}
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

            {/* Плавающее окно ввода промпта */}
            <div className="fixed bottom-2 left-0 right-0" style={{ zIndex: 10 }}>
              <div className="flex justify-center px-2 sm:px-6">
                <div 
                  className={`${isFocused ? 'bg-background/95' : 'bg-background/60'} backdrop-blur-md border border-border/40 rounded-lg shadow-lg px-2 py-1 w-full max-w-[700px] transition-all duration-200 ${
                    isDragOver ? 'border-primary/60 bg-primary/5' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
          {/* Загруженные изображения */}
          {uploadedImages.length > 0 && (
            <div className="mb-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary">
                  {uploadedImages.length} {getImageText(uploadedImages.length)} прикреплено для редактирования
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setUploadedImages([])
                    setSelectedImages([])
                    setIsEditingMode(false)
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Очистить
                </Button>
                {/* Миниатюры изображений справа от текста */}
                <div className="flex gap-1">
                  {uploadedImages.map((imageUrl, index) => (
                    <div key={index} className="relative w-6 h-6 rounded overflow-hidden border group">
                      <Image
                        src={imageUrl}
                        alt={`Загруженное изображение ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <Button
                        onClick={() => {
                          const imageUrl = uploadedImages[index]
                          setUploadedImages(prev => prev.filter((_, i) => i !== index))
                          setSelectedImages(prev => prev.filter(url => url !== imageUrl))
                        }}
                        size="sm"
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-3 w-3 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={() => {
                    setUploadedImages([])
                    setSelectedImages([])
                  }} 
                  size="sm" 
                  variant="outline"
                >
                  Удалить все
                </Button>
              </div>
            </div>
          )}


                  {/* Поле ввода промпта */}
                  <div className="mb-0">
                    {/* Мобильная версия - минималистичный layout */}
                    <div className="flex items-start gap-2 sm:hidden">
                      {/* Поле ввода - полная ширина */}
                      <Textarea
                        value={prompt}
                        onChange={(e) => handlePromptChange(e.target.value)}
                        placeholder={isDragOver ? "Отпустите файл для загрузки..." : isEditingMode ? "Опишите изменения для прикрепленного изображения..." : "Опишите изображение, которое хотите создать..."}
                        className="h-12 resize-none text-sm flex-1 bg-muted/80 border border-border/80 focus:border-primary/80 focus:bg-muted/95"
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault()
                            handleGenerate()
                          }
                        }}
                      />
                      
                      {/* Кнопки управления - вертикально */}
                      <div className="flex flex-col gap-1">
                        {/* Кнопка настроек - сверху */}
                        <DropdownMenu open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-10 w-10 p-0 bg-muted/80 hover:bg-muted/95 border border-border/80"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56 z-[150]" align="end">
                            <DropdownMenuLabel>Настройки генерации</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            {/* Формат изображения */}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault()
                                setOutputFormat(prev => prev === 'JPEG' ? 'PNG' : 'JPEG')
                              }}
                              className="flex items-center justify-between"
                            >
                              <span>Формат</span>
                              <span className="text-muted-foreground">{outputFormat}</span>
                            </DropdownMenuItem>
                            
                            {/* Количество изображений */}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault()
                                setNumImages(prev => prev >= 4 ? 1 : prev + 1)
                              }}
                              className="flex items-center justify-between"
                            >
                              <span>Количество</span>
                              <span className="text-muted-foreground">{numImages}</span>
                            </DropdownMenuItem>
                            
                            {/* Стиль */}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault()
                                const currentIndex = artStyles.findIndex(style => style.name === artStyle)
                                const nextIndex = (currentIndex + 1) % artStyles.length
                                setArtStyle(artStyles[nextIndex].name)
                              }}
                              className="flex items-center justify-between"
                            >
                              <span>Стиль</span>
                              <span className="text-muted-foreground text-xs">{artStyle}</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Загрузка изображения - input перенесен наверх */}
                            <DropdownMenuItem
                              onClick={() => {
                                console.log('Dropdown upload clicked')
                                console.log('fileInputRef.current:', fileInputRef.current)
                                
                                // Пробуем через ref
                                if (fileInputRef.current) {
                                  fileInputRef.current.click()
                                } else {
                                  // Fallback через querySelector
                                  const input = document.getElementById('studio-file-input') as HTMLInputElement
                                  console.log('Fallback input found:', input)
                                  if (input) {
                                    input.click()
                                  } else {
                                    console.error('No file input found!')
                                  }
                                }
                              }}
                              className="flex items-center gap-2"
                            >
                              <ImageIcon className="h-4 w-4" />
                              <span>Загрузить изображение</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Кнопка генерации - снизу */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              className="h-10 w-10 p-0 bg-primary hover:bg-primary/90 text-primary-foreground"
                              onClick={handleGenerate}
                              disabled={isGenerating || !prompt.trim()}
                            >
                              {isGenerating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Sparkles className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="z-[9998]">
                            <p>{isGenerating ? "Генерация..." : "Генерировать"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Десктопная версия - горизонтальный layout */}
                    <div className="hidden sm:flex items-center gap-2">
                      {/* Поле ввода - слева */}
                      <Textarea
                        value={prompt}
                        onChange={(e) => handlePromptChange(e.target.value)}
                        placeholder={isDragOver ? "Отпустите файл для загрузки..." : isEditingMode ? "Опишите изменения для прикрепленного изображения..." : "Опишите изображение, которое хотите создать..."}
                        className="h-[54px] resize-none text-base flex-1 bg-muted/80 border border-border/80 focus:border-primary/80 focus:bg-muted/95"
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault()
                            handleGenerate()
                          }
                        }}
                      />
                      
                      {/* Кнопки управления - справа в 2 ряда */}
                      <div className="flex flex-col gap-1">
                        {/* Первый ряд - 3 кнопки */}
                        <div className="flex items-center gap-1">
                          {/* Формат изображения */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-14 p-0 text-sm bg-muted/80 hover:bg-muted/95 border border-border/80"
                                onClick={() => setOutputFormat(prev => prev === 'JPEG' ? 'PNG' : 'JPEG')}
                              >
                                {outputFormat}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="z-[140]">
                              <p>Формат изображения (нажмите для смены)</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          {/* Количество изображений */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-12 p-0 text-sm bg-muted/80 hover:bg-muted/95 border border-border/80"
                                onClick={() => setNumImages(prev => prev >= 4 ? 1 : prev + 1)}
                              >
                                {numImages}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="z-[140]">
                              <p>Количество изображений (нажмите для смены)</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          {/* Загрузка изображения - input перенесен наверх */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-12 p-0 bg-muted/80 hover:bg-muted/95 border border-border/80"
                                onClick={() => {
                                  console.log('Upload button clicked')
                                  console.log('fileInputRef.current:', fileInputRef.current)
                                  
                                  // Пробуем через ref
                                  if (fileInputRef.current) {
                                    fileInputRef.current.click()
                                  } else {
                                    // Fallback через querySelector
                                    const input = document.getElementById('studio-file-input') as HTMLInputElement
                                    console.log('Fallback input found:', input)
                                    if (input) {
                                      input.click()
                                    } else {
                                      console.error('No file input found!')
                                    }
                                  }
                                }}
                              >
                                <ImageIcon className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="z-[140]">
                              <p>Загрузить изображение</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        
                        {/* Второй ряд - кнопка стиля (широкая) */}
                        <div className="flex items-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-full p-0 text-sm bg-muted/80 hover:bg-muted/95 border border-border/80"
                                onClick={() => {
                                  const currentIndex = artStyles.findIndex(style => style.name === artStyle)
                                  const nextIndex = (currentIndex + 1) % artStyles.length
                                  setArtStyle(artStyles[nextIndex].name)
                                }}
                              >
                                {artStyle}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="z-[140]">
                              <p>Стиль изображения (нажмите для смены)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      {/* Кнопка генерации - отдельно справа */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            className="h-[80px] w-[80px] p-0 bg-primary hover:bg-primary/90 text-primary-foreground"
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
                        <TooltipContent className="z-[9998]">
                          <p>{isGenerating ? "Генерация изображений..." : "Генерировать изображения"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

          </div>
        </div>
      </div>
      </div>

      {/* Модальное окно для просмотра изображения */}
      {selectedImageForModal && (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10"
              onClick={() => setSelectedImageForModal(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="w-full h-full flex items-center justify-center">
              <Image
                src={selectedImageForModal}
                alt="Полноразмерное изображение"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  )
}
