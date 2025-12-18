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
  Lightbulb,
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
import { apiClient, ArtStyle, EnhancePromptRequest, QueueRequestStatus } from "@/lib/api-client"
import { formatApiError } from "@/lib/errors"
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
import { ASPECT_RATIOS, DEFAULT_ASPECT_RATIO, type AspectRatio } from "@/lib/constants"
import { getRequiredPoints } from "@/lib/config"
import { getPointsText } from "@/lib/grammar"

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
  const { avatar, setBalance, refreshPoints } = useAuth()
  // Используем ref для стабильной ссылки на refreshPoints, чтобы избежать пересоздания startPolling
  const refreshPointsRef = useRef(refreshPoints)
  useEffect(() => {
    refreshPointsRef.current = refreshPoints
  }, [refreshPoints])
  
  const [prompt, setPrompt] = useState(() => {
    // Загружаем промпт из localStorage только при инициализации
    if (typeof window !== 'undefined') {
      return localStorage.getItem('studio-prompt') || ""
    }
    return ""
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [copiedImageUrl, setCopiedImageUrl] = useState<string | null>(null)
  const [numImages, setNumImages] = useState(() => {
    if (typeof window !== 'undefined') {
      // Сохраняем выбор пользователя в localStorage
      const saved = localStorage.getItem('studio-numImages')
      if (saved) return parseInt(saved)
      // Мобильным устройствам (ширина < 640px) по умолчанию ставим 1 изображение
      return window.innerWidth < 640 ? 1 : 1
    }
    return 1
  })
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studio-aspectRatio')
      // Валидация: проверяем, что сохраненное значение допустимо
      if (saved && ASPECT_RATIOS.includes(saved as AspectRatio)) {
        return saved as AspectRatio
      }
      // Если значение невалидное (например, старое "auto") или отсутствует, используем дефолт
      localStorage.setItem('studio-aspectRatio', DEFAULT_ASPECT_RATIO)
      return DEFAULT_ASPECT_RATIO
    }
    return DEFAULT_ASPECT_RATIO
  })
  const [artStyle, setArtStyle] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studio-artStyle')
      return saved || 'Реалистичный'
    }
    return 'Реалистичный'
  })
  const [model, setModel] = useState<'nano-banana' | 'nano-banana-pro'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studio-model')
      if (saved) {
        // Конвертируем старые enum значения в новые
        if (saved === 'NANO_BANANA' || saved === 'nano-banana') return 'nano-banana'
        if (saved === 'NANO_BANANA_PRO' || saved === 'nano-banana-pro') return 'nano-banana-pro'
        // Если значение не распознано, возвращаем дефолт
        return 'nano-banana'
      }
      return 'nano-banana'
    }
    return 'nano-banana'
  })
  const [resolution, setResolution] = useState<'1K' | '2K' | '4K'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studio-resolution')
      if (saved) {
        // Конвертируем старые enum значения в новые
        if (saved === 'RESOLUTION_1K' || saved === '1K') return '1K'
        if (saved === 'RESOLUTION_2K' || saved === '2K') return '2K'
        if (saved === 'RESOLUTION_4K' || saved === '4K') return '4K'
        // Если значение не распознано, возвращаем дефолт
        return '1K'
      }
      return '1K'
    }
    return '1K'
  })
  
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [selectedImageForModal, setSelectedImageForModal] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [artStyles, setArtStyles] = useState<ArtStyle[]>([])
  const isInitializingStyleRef = useRef(false) // Флаг для предотвращения дублирующих запросов при инициализации
  const [activeQueueRequests, setActiveQueueRequests] = useState<Map<number, QueueRequestStatus>>(new Map())
  const pollingIntervalsRef = useRef<Map<number, NodeJS.Timeout>>(new Map())
  
  // Загружаем стили из базы данных и сохраненный стиль пользователя при монтировании компонента
  useEffect(() => {
    // Предотвращаем повторные вызовы в StrictMode
    if (isInitializingStyleRef.current) return
    isInitializingStyleRef.current = true
    
    const loadArtStyles = async () => {
      const response = await apiClient.getArtStyles()
      
      if (response.data && response.data.length > 0) {
        // Используем стили из API (включая "Без стиля" с id=1)
        setArtStyles(response.data)
        
        // Загружаем сохраненный стиль пользователя из БД
        const userStyleResponse = await apiClient.getUserArtStyle()
        if (userStyleResponse.data?.styleName) {
          const savedStyleName = userStyleResponse.data.styleName
          const savedStyleId = userStyleResponse.data.styleId
          const savedStyle = response.data.find(s => s.name === savedStyleName || s.id === savedStyleId)
          if (savedStyle) {
            setArtStyle(savedStyle.name)
            if (typeof window !== 'undefined') {
              localStorage.setItem('studio-artStyle', savedStyle.name)
            }
            isInitializingStyleRef.current = false
            return
          }
        }
        
        // Если стиль не найден в БД, проверяем localStorage или устанавливаем дефолт
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('studio-artStyle')
          if (saved) {
            // Проверяем, что сохраненный стиль существует в списке
            const savedStyle = response.data.find(s => s.name === saved)
            if (savedStyle) {
              setArtStyle(saved)
              // Сохраняем в БД для синхронизации (только один раз)
              apiClient.updateUserArtStyle(savedStyle.id).catch(() => {
                // Игнорируем ошибки при сохранении
              })
              isInitializingStyleRef.current = false
              return
            }
          }
          
          // По умолчанию ставим "Реалистичный" (id=2), иначе берем первый в списке
          const realistic = response.data.find(s => s.id === 2)
          const initialStyle = realistic?.name || response.data[0]?.name || 'Без стиля'
          setArtStyle(initialStyle)
          localStorage.setItem('studio-artStyle', initialStyle)
          // Сохраняем дефолтный стиль в БД (только один раз)
          const initialStyleObj = response.data.find(s => s.name === initialStyle)
          if (initialStyleObj) {
            apiClient.updateUserArtStyle(initialStyleObj.id).catch(() => {
              // Игнорируем ошибки при сохранении
            })
          }
        }
      }
      isInitializingStyleRef.current = false
    }
    loadArtStyles()
  }, [])
  
  const { toast } = useToast()
  
  const {
    history,
    hasMore,
    isLoading,
    loadMoreHistory,
    updateHistoryAfterGeneration,
  } = useSessionHistory(sessionId || null, 20)

  // Функция для остановки polling
  const stopPolling = useCallback((requestId: number) => {
    const interval = pollingIntervalsRef.current.get(requestId)
    if (interval) {
      clearInterval(interval)
      pollingIntervalsRef.current.delete(requestId)
    }
  }, [])

  // Функция для правильного склонения слова "изображение"
  const getImageText = useCallback((count: number) => {
    if (count === 1) return 'изображение'
    if (count >= 2 && count <= 4) return 'изображения'
    return 'изображений'
  }, [])

  // Функция для запуска polling статуса запроса
  const startPolling = useCallback((requestId: number) => {
    // Останавливаем предыдущий polling, если есть
    const existingInterval = pollingIntervalsRef.current.get(requestId)
    if (existingInterval) {
      clearInterval(existingInterval)
    }

    const pollStatus = async () => {
      try {
        const response = await apiClient.getQueueStatus(requestId)
        if (response.data) {
          const request = response.data
          setActiveQueueRequests(prev => {
            const updated = new Map(prev)
            updated.set(requestId, request)
            return updated
          })

          // Если запрос завершен, останавливаем polling
          if (request.queueStatus === 'COMPLETED') {
            stopPolling(requestId)
            // Обрабатываем завершенный запрос
            if (request.imageUrls && request.imageUrls.length > 0) {
              // Обновляем запрос в активных с актуальными imageUrls перед обработкой
              setActiveQueueRequests(prev => {
                const updated = new Map(prev)
                updated.set(requestId, request)
                return updated
              })
              
              onGenerationComplete(request.imageUrls, request.prompt)
              updateHistoryAfterGeneration()
              
              // Если не было прикрепленных изображений - прикрепляем сгенерированные
              // Используем функциональную форму setState для доступа к актуальному состоянию
              setUploadedImages(prev => {
                if (prev.length === 0 && request.imageUrls && request.imageUrls.length > 0) {
                  // Прикрепляем первое сгенерированное изображение
                  return [request.imageUrls[0]]
                }
                // Если были прикрепленные - оставляем их как есть
                return prev
              })
              
              setSelectedImages(prev => {
                if (prev.length === 0 && request.imageUrls && request.imageUrls.length > 0) {
                  // Прикрепляем первое сгенерированное изображение
                  return [request.imageUrls[0]]
                }
                // Если были прикрепленные - оставляем их как есть
                return prev
              })
              
              toast({
                title: "Изображения созданы!",
                description: `Создано ${request.imageUrls.length} ${getImageText(request.imageUrls.length)}`,
                duration: 1500,
              })
              // Обновляем баланс (используем ref для избежания зависимостей)
              setTimeout(() => {
                refreshPointsRef.current().catch(() => {})
              }, 500)
              
              // Удаляем из активных запросов через задержку, чтобы пользователь успел увидеть изображения
              setTimeout(() => {
                setActiveQueueRequests(prev => {
                  const updated = new Map(prev)
                  updated.delete(requestId)
                  return updated
                })
              }, 5000) // Увеличиваем задержку до 5 секунд, чтобы изображения успели отобразиться
            } else {
              // Если изображений нет, удаляем сразу
              setTimeout(() => {
                setActiveQueueRequests(prev => {
                  const updated = new Map(prev)
                  updated.delete(requestId)
                  return updated
                })
              }, 2000)
            }
          } else if (request.queueStatus === 'FAILED') {
            stopPolling(requestId)
            toast({
              title: "Ошибка генерации",
              description: "Не удалось создать изображения. Попробуйте еще раз.",
              variant: "destructive",
            })
            // Удаляем из активных запросов
            setTimeout(() => {
              setActiveQueueRequests(prev => {
                const updated = new Map(prev)
                updated.delete(requestId)
                return updated
              })
            }, 2000)
          }
        }
      } catch (error) {
        // Игнорируем ошибки polling
      }
    }

    // Опрашиваем сразу, затем каждые 3 секунды
    pollStatus()
    const interval = setInterval(pollStatus, 3000)
    pollingIntervalsRef.current.set(requestId, interval)
  }, [onGenerationComplete, updateHistoryAfterGeneration, toast, stopPolling, getImageText])

  // Загружаем активные запросы при монтировании компонента
  useEffect(() => {
    const loadActiveRequests = async () => {
      try {
        const response = await apiClient.getUserActiveRequests()
        if (response.data && response.data.length > 0) {
          const requestsMap = new Map<number, QueueRequestStatus>()
          response.data.forEach(request => {
            requestsMap.set(request.id, request)
            // Запускаем polling для каждого активного запроса
            startPolling(request.id)
          })
          setActiveQueueRequests(requestsMap)
        }
      } catch (error) {
        // Игнорируем ошибки при загрузке активных запросов
      }
    }
    loadActiveRequests()

    // Очищаем интервалы при размонтировании
    return () => {
      pollingIntervalsRef.current.forEach(interval => clearInterval(interval))
      pollingIntervalsRef.current.clear()
    }
  }, [startPolling])
  
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
  
  // Сохраняем настройки в localStorage при изменении
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('studio-numImages', numImages.toString())
    }
  }, [numImages])
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('studio-aspectRatio', aspectRatio)
    }
  }, [aspectRatio])
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('studio-model', model)
    }
  }, [model])
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('studio-resolution', resolution)
    }
  }, [resolution])
  
  useEffect(() => {
    // Пропускаем сохранение во время инициализации (чтобы избежать дублирования запросов)
    if (isInitializingStyleRef.current) return
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('studio-artStyle', artStyle)
      
      // Сохраняем стиль в БД при изменении (только если стили уже загружены)
      if (artStyles.length > 0) {
        const selectedStyle = artStyles.find(s => s.name === artStyle)
        if (selectedStyle) {
          apiClient.updateUserArtStyle(selectedStyle.id).catch(() => {
            // Игнорируем ошибки при сохранении (например, если пользователь не авторизован)
          })
        }
      }
    }
  }, [artStyle, artStyles])
  
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Сохраняем промпт в localStorage при изменении
  const handlePromptChange = (value: string) => {
    // Ограничиваем длину до 5000 символов
    const limitedValue = value.slice(0, 5000)
    setPrompt(limitedValue)
    if (typeof window !== 'undefined') {
      localStorage.setItem('studio-prompt', limitedValue)
    }
  }

  // Функция для правильного склонения слова "входное изображение"
  const getInputImageText = (count: number) => {
    if (count === 1) return 'входное изображение'
    if (count >= 2 && count <= 4) return 'входных изображения'
    return 'входных изображений'
  }

  // Автоматическая прокрутка к низу при новых сообщениях
  useEffect(() => {
    if (scrollAreaRef.current && history.length > 0) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [history.length])

  // Автоматическая прокрутка к низу при добавлении нового активного запроса
  useEffect(() => {
    if (scrollAreaRef.current && activeQueueRequests.size > 0) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        // Небольшая задержка для того, чтобы DOM успел обновиться
        setTimeout(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight
        }, 100)
      }
    }
  }, [activeQueueRequests.size])

  // Очищаем localStorage при размонтировании компонента (перезагрузка страницы)
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('studio-prompt')
      }
    }
  }, [])

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

    // Проверяем лимит изображений (максимум 4)
    if (uploadedImages.length >= 4) {
      toast({
        title: "Максимум изображений",
        description: "Можно загрузить не более 4 изображений",
        variant: "destructive",
      })
      return
    }

    try {
      // Загружаем файл на сервер
      const response = await apiClient.uploadFile(file)
      if (response.data) {
        setUploadedImages(prev => [...prev, response.data!])
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
  }, [toast, uploadedImages.length])

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

  const handleEnhancePrompt = useCallback(async () => {
    const currentPrompt = prompt?.trim() || ""
    
    if (currentPrompt.length < 10) {
      toast({
        title: "Ошибка",
        description: "Промпт должен содержать минимум 10 символов",
        variant: "destructive",
      })
      return
    }

    setIsEnhancing(true)

    try {
      const selectedStyle = artStyles.find(style => style.name === artStyle)
      const styleId = selectedStyle?.id || 1

      let imageUrls: string[] | undefined = undefined
      if (uploadedImages.length > 0) {
        imageUrls = uploadedImages
      }

      const request: EnhancePromptRequest = {
        prompt: currentPrompt,
        imageUrls: imageUrls,
        styleId: styleId,
      }

      const response = await apiClient.enhancePrompt(request)

      if (response.data) {
        setPrompt(response.data.enhancedPrompt)
        if (typeof window !== 'undefined') {
          localStorage.setItem('studio-prompt', response.data.enhancedPrompt)
        }
        toast({
          title: "Промпт улучшен!",
          description: "Промпт успешно улучшен. Вы можете отредактировать его перед генерацией.",
          duration: 3000,
        })
      } else {
        // Передаем объект с error и status для правильной обработки в formatApiError
        throw { error: response.error || "Ошибка улучшения промпта", status: response.status }
      }
    } catch (error: any) {
      const formatted = formatApiError(error?.status ? error : (error?.message || error))
      toast({
        title: formatted.title,
        description: formatted.description,
        variant: "destructive",
        duration: 6000,
      })
    } finally {
      setIsEnhancing(false)
    }
  }, [prompt, artStyle, artStyles, uploadedImages, toast])

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
      // Находим стиль по имени и получаем его id
      const selectedStyle = artStyles.find(style => style.name === artStyle)
      const styleId = selectedStyle?.id || 1 // По умолчанию id = 1 (Без стиля)
      
      // Фильтруем blob URL - они не могут быть использованы на сервере
      const validImageUrls = uploadedImages.filter(url => url && !url.startsWith('blob:'))
      
      // Вызываем API для отправки в очередь (передаем styleId, на бэке промпт стиля будет добавлен к промпту перед отправкой в FalAI)
      const request = {
        prompt: prompt, // Оригинальный промпт пользователя
        inputImageUrls: validImageUrls.length > 0 ? validImageUrls : [],
        numImages: numImages,
        sessionId: sessionId,
        styleId: styleId,
        aspectRatio: aspectRatio,
        model: model,
        resolution: model === 'nano-banana-pro' ? resolution : undefined
      }
      
      const response = await apiClient.submitToQueue(request)
      
      if (response.data) {
        const queueRequest = response.data
        // Сохраняем запрос в активные
        setActiveQueueRequests(prev => {
          const updated = new Map(prev)
          updated.set(queueRequest.id, queueRequest)
          return updated
        })
        // Запускаем polling статуса
        startPolling(queueRequest.id)
        
        // Показываем уведомление о начале генерации
        const statusText = queueRequest.queueStatus === 'IN_QUEUE' 
          ? (queueRequest.queuePosition ? `В очереди (позиция ${queueRequest.queuePosition})` : 'В очереди')
          : 'Обрабатывается'
        toast({
          title: "Генерация начата",
          description: `Запрос отправлен в очередь. Статус: ${statusText}`,
          duration: 3000,
        })
      } else {
        throw { status: response.status, message: response.error }
      }
    } catch (error) {
      const e: any = error
      const formatted = formatApiError(e?.status ? e : ((e as any)?.message || e))
      toast({
        title: formatted.title,
        description: formatted.description,
        variant: formatted.title === 'Недостаточно поинтов' ? 'default' : 'destructive',
        action: formatted.title === 'Недостаточно поинтов' ? (
          <a
            href="/pricing"
            className="ml-2 inline-flex h-12 items-center justify-center rounded-md bg-primary px-4 text-base font-medium text-primary-foreground hover:opacity-90"
          >
            Купить поинты
          </a>
        ) : undefined,
        duration: formatted.title === 'Недостаточно поинтов' ? 20000 : 6000,
      })
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, numImages, aspectRatio, toast, artStyle, sessionId, uploadedImages, artStyles, startPolling, model, resolution])

  const handleImageExpand = (imageUrl: string) => {
    setSelectedImageForModal(imageUrl)
  }

  const handleImageDownload = async (imageUrl: string) => {
    try {
      // Проксируем URL для корректного скачивания в браузерах
      const proxiedUrl = apiClient.proxyFalMediaUrl(imageUrl)
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
      const link = document.createElement('a')
      link.href = url
      // Определяем расширение из URL
      const extension = imageUrl.toLowerCase().endsWith('.png') ? 'png' : 'jpg'
      link.download = `generated-image-${Date.now()}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Изображение скачано",
        description: "Файл сохранен в папку загрузок",
      })
    } catch (error) {
      console.error('Ошибка скачивания изображения:', error)
      toast({
        title: "Ошибка скачивания",
        description: error instanceof Error ? error.message : "Не удалось скачать изображение",
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
      // Проксируем URL для корректного скачивания в браузерах
      const proxiedUrl = apiClient.proxyFalMediaUrl(imageUrl)
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
        a.download = filename
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
        <div className="pb-48 p-3 sm:pb-32 sm:p-6">
          {/* Кнопка загрузки предыдущих сообщений */}
          {hasMore && (
            <div className="flex justify-center mb-4">
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
          ) : history.length === 0 && Array.from(activeQueueRequests.values()).length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Начните диалог</p>
              <p className="text-sm">Опишите изображение, которое хотите создать</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((message, index) => (
              <div key={message.id} className={index === 0 ? "-mt-4 sm:mt-0" : ""}>
                {/* Промпт слева, изображения справа */}
                <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
                  {/* Левая часть - промпт */}
                  <div className="flex-1 lg:max-w-64 min-w-0">
                    <div className="flex gap-2 sm:gap-3">
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
                      <div className="flex-1 min-w-0">
                        <Card className="p-2 sm:p-3 bg-muted/50 dark:bg-muted/20">
                          <p className="text-xs sm:text-sm leading-relaxed text-foreground break-words">
                            {message.prompt}
                          </p>
                          
                          {/* Миниатюры входных изображений */}
                          {message.inputImageUrls && message.inputImageUrls.length > 0 && (
                            <div className="mt-2 sm:mt-3 flex gap-2 flex-wrap">
                              {message.inputImageUrls.map((imageUrl, index) => (
                                <div 
                                  key={index} 
                                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-border/50 cursor-pointer hover:border-primary/50 transition-colors group"
                                  onClick={() => handleImageExpand(imageUrl)}
                                >
                                  <Image
                                    src={apiClient.getFileUrl(imageUrl)}
                                    alt={`Входное изображение ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                    quality={85}
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
                          
                          {/* Информация о стиле, если есть */}
                          {message.styleName && (
                            <div className="mt-2 sm:mt-3 text-xs text-muted-foreground">
                              {message.styleName}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 mt-2 sm:mt-3 text-xs text-muted-foreground">
                            <span>{formatDate(message.createdAt)}</span>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>

                  {/* Правая часть - изображения */}
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2 sm:gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <Bot className="h-4 w-4 text-secondary-foreground" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Card className="p-2 sm:p-3 bg-muted/50 dark:bg-muted/20">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                        {message.imageUrls.map((imageUrl, index) => (
                          <div
                            key={index}
                            className={cn(
                              "relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all w-full",
                              selectedImages.includes(imageUrl) 
                                ? "border-primary ring-2 ring-primary/20" 
                                : "border-border hover:border-primary/50"
                            )}
                            onClick={() => handleImageExpand(imageUrl)}
                          >
                            <div className="relative w-full aspect-square overflow-hidden">
                              <Image
                                src={apiClient.getFileUrl(imageUrl)}
                                alt={`Сгенерированное изображение ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                quality={90}
                              />
                              
                              {/* Overlay с действиями в левом нижнем углу - показываем всегда на мобилке, при hover на десктопе */}
                              <div className="absolute bottom-2 left-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                      className="h-8 w-8 sm:h-7 sm:w-7 p-0 bg-black/70 hover:bg-black/80 text-white border-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                        handleImageSelect(imageUrl)
                                  }}
                                >
                                      <Pencil className="h-4 w-4 sm:h-3 sm:w-3" />
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
                                      className="h-8 w-8 sm:h-7 sm:w-7 p-0 bg-black/70 hover:bg-black/80 text-white border-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleImageDownload(imageUrl)
                                  }}
                                >
                                      <Download className="h-4 w-4 sm:h-3 sm:w-3" />
                                </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="z-[140]">
                                    <p>Скачать изображение</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>

                              {/* Индикатор выбора */}
                              {selectedImages.includes(imageUrl) && (
                                <div className="absolute top-2 right-2">
                                  <div className="w-7 h-7 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-primary-foreground text-xs sm:text-xs font-bold">
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
                            <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 text-xs text-muted-foreground flex-wrap">
                              <ImageIcon className="h-3 w-3 flex-shrink-0" />
                              <span>{message.imageUrls.length} {getImageText(message.imageUrls.length)}</span>
                              {(() => {
                                const modelName = message.modelType 
                                  ? (message.modelType === 'nano-banana' ? 'Nano Banana' : 'Nano Banana PRO')
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
                          )}
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ))}
              
              {/* Активные запросы в очереди (показываются внизу диалога) */}
              {Array.from(activeQueueRequests.values()).length > 0 && (
                <div className="mt-4 space-y-3">
                  {Array.from(activeQueueRequests.values()).map((request) => (
                    <div key={request.id}>
                      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
                        {/* Левая часть - промпт и статус */}
                        <div className="flex-1 lg:max-w-64 min-w-0">
                          <div className="flex gap-2 sm:gap-3">
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
                            <div className="flex-1 min-w-0">
                              <Card className="p-2 sm:p-3 bg-muted/50 dark:bg-muted/20">
                                <p className="text-xs sm:text-sm leading-relaxed text-foreground mb-2 sm:mb-3 break-words">
                                  {request.prompt}
                                </p>
                                <div className="flex items-center gap-2">
                                  {request.queueStatus === 'IN_QUEUE' && (
                                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                      {request.queuePosition ? `В очереди (${request.queuePosition})` : 'В очереди'}
                                    </Badge>
                                  )}
                                  {request.queueStatus === 'IN_PROGRESS' && (
                                    <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                      Обрабатывается
                                    </Badge>
                                  )}
                                </div>
                              </Card>
                            </div>
                          </div>
                        </div>
                        {/* Правая часть - изображения или плейсхолдер */}
                        <div className="flex-1 min-w-0">
                          <div className="flex gap-2 sm:gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                <Bot className="h-4 w-4 text-secondary-foreground" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 max-w-full">
                              <Card className="p-2 sm:p-3 bg-muted/50 dark:bg-muted/20">
                                {/* Если есть изображения - показываем их */}
                                {request.imageUrls && request.imageUrls.length > 0 ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                                    {request.imageUrls.map((imageUrl, index) => (
                                      <div
                                        key={index}
                                        className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-border hover:border-primary/50 transition-all w-full"
                                        onClick={() => handleImageExpand(imageUrl)}
                                      >
                                        <div className="relative w-full aspect-square overflow-hidden">
                                          <Image
                                            src={apiClient.getFileUrl(imageUrl)}
                                            alt={`Сгенерированное изображение ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            quality={90}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  /* Иначе показываем плейсхолдер */
                                  <div className="flex items-center justify-center py-6 sm:py-8">
                                    <div className="text-center px-2">
                                      <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
                                      <p className="text-xs sm:text-sm text-muted-foreground break-words">
                                        {request.queueStatus === 'IN_QUEUE' 
                                          ? (request.queuePosition ? `Ожидание в очереди (позиция ${request.queuePosition})` : 'Ожидание в очереди')
                                          : 'Генерация изображений...'}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </Card>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

            {/* Плавающее окно ввода промпта */}
            <div className="fixed bottom-0 left-0 right-0 ios-safe-bottom sm:pb-2" style={{ zIndex: 10 }}>
              <div className="flex justify-center px-2 sm:px-6">
                <div 
                  className={`${isFocused ? 'bg-background/95' : 'bg-background/60'} backdrop-blur-md border border-border/40 rounded-lg shadow-lg px-2 py-2 sm:py-1 w-full max-w-[700px] sm:max-w-[1000px] transition-all duration-200 ${
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
                {/* Компактный блок с миниатюрами */}
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-2 py-1">
                  {/* Миниатюры изображений */}
                  <div className="flex gap-2">
                    {uploadedImages.map((imageUrl, index) => (
                      <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border/50 group">
                        <Image
                          src={apiClient.getFileUrl(imageUrl)}
                          alt={`Прикрепленное изображение ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                          quality={85}
                        />
                        <Button
                          onClick={() => {
                            setUploadedImages(prev => prev.filter((_, i) => i !== index))
                            setSelectedImages(prev => prev.filter(url => url !== imageUrl))
                            if (uploadedImages.length === 1) {
                              setIsEditingMode(false)
                            }
                          }}
                          size="sm"
                          variant="ghost"
                          className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-red-500 hover:bg-red-600 text-white rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}


                  {/* Поле ввода промпта */}
                  <div className="mb-0">
                    {/* Мобильная версия - минималистичный layout */}
                    <div className="flex items-stretch gap-2 sm:hidden">
                      {/* Поле ввода - полная ширина */}
                      <div className="flex-1 relative min-w-0 flex flex-col">
                        <Textarea
                          value={prompt}
                          onChange={(e) => handlePromptChange(e.target.value)}
                          placeholder={isDragOver ? "Отпустите файл для загрузки..." : isEditingMode ? "Опишите изменения для прикрепленного изображения..." : "Опишите изображение, которое хотите создать..."}
                          className="h-[96px] resize-none text-sm flex-1 bg-muted/80 border border-border/80 focus:border-primary/80 focus:bg-muted/95 pr-12 min-w-0"
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                          maxLength={5000}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                              e.preventDefault()
                              handleGenerate()
                            }
                          }}
                        />
                        <div className="absolute bottom-1 right-2 text-xs text-muted-foreground pointer-events-none">
                          {prompt.length}/5000
                        </div>
                      </div>
                      
                      {/* Кнопки управления и генерации */}
                      <div className="flex gap-1.5 flex-shrink-0">
                        {/* Слева колонка: настройки + загрузка */}
                        <div className="flex flex-col gap-1.5">
                          {/* Бейджи модели и разрешения (только для PRO) */}
                          {model === 'nano-banana-pro' && (
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 text-xs px-1.5 py-0.5">
                                Pro
                              </Badge>
                              <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20 text-xs px-1.5 py-0.5">
                                {resolution}
                              </Badge>
                            </div>
                          )}
                          
                          {/* Кнопка настроек */}
                          <DropdownMenu open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-12 w-12 p-0 bg-muted/80 hover:bg-muted/95 border border-border/80"
                              >
                                <Settings className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 z-[150]" align="end">
                              <DropdownMenuLabel>Настройки генерации</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                            
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
                              
                              {/* Соотношение сторон */}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.preventDefault()
                                  const currentIndex = ASPECT_RATIOS.indexOf(aspectRatio)
                                  const nextIndex = (currentIndex + 1) % ASPECT_RATIOS.length
                                  setAspectRatio(ASPECT_RATIOS[nextIndex])
                                }}
                                className="flex items-center justify-between"
                              >
                                <span>Соотношение</span>
                                <span className="text-muted-foreground text-xs">{aspectRatio}</span>
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
                              
                              {/* Модель */}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.preventDefault()
                                  setModel(prev => prev === 'nano-banana' ? 'nano-banana-pro' : 'nano-banana')
                                }}
                                className="flex items-center justify-between"
                              >
                                <span>Модель</span>
                                <span className="text-muted-foreground text-xs">
                                  {model === 'nano-banana' ? 'Nano Banana' : 'PRO'}
                                </span>
                              </DropdownMenuItem>
                              
                              {/* Разрешение (только для PRO) */}
                              {model === 'nano-banana-pro' && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.preventDefault()
                                    const resolutions: Array<'1K' | '2K' | '4K'> = ['1K', '2K', '4K']
                                    const currentIndex = resolutions.indexOf(resolution)
                                    const nextIndex = (currentIndex + 1) % resolutions.length
                                    setResolution(resolutions[nextIndex])
                                  }}
                                  className="flex items-center justify-between"
                                >
                                  <span>Разрешение</span>
                                  <span className="text-muted-foreground text-xs">
                                    {resolution}
                                  </span>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Кнопка загрузки изображения */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-12 w-12 p-0 bg-muted/80 hover:bg-muted/95 border border-border/80"
                                onClick={() => {
                                  if (fileInputRef.current) {
                                    fileInputRef.current.click()
                                  } else {
                                    const input = document.getElementById('studio-file-input') as HTMLInputElement
                                    if (input) input.click()
                                  }
                                }}
                              >
                                <ImageIcon className="h-5 w-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="z-[9998]">
                              <p>Загрузить</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        {/* Справа колонка: улучшение + генерация */}
                        <div className="flex flex-col gap-1.5">
                          {/* Кнопка улучшения промпта */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-12 w-12 p-0 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                onClick={handleEnhancePrompt}
                                disabled={isEnhancing || isGenerating || !prompt?.trim()}
                                title="Улучшить промпт с помощью ИИ"
                              >
                                {isEnhancing ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <Lightbulb className="h-5 w-5" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="z-[9998]">
                              <p>{isEnhancing ? "Улучшение промпта с помощью ИИ..." : "Улучшить промпт с помощью ИИ"}</p>
                            </TooltipContent>
                          </Tooltip>

                          {/* Кнопка генерации */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                className="h-12 w-12 p-0 bg-primary hover:bg-primary/90 text-primary-foreground"
                                onClick={handleGenerate}
                                disabled={isGenerating || !prompt.trim()}
                              >
                                {isGenerating ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <Sparkles className="h-5 w-5" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="z-[9998]">
                              <p>
                                {isGenerating ? "Генерация..." : `Генерировать (${getPointsText(getRequiredPoints(numImages, model, resolution))})`}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>

                    {/* Десктопная версия - горизонтальный layout */}
                    <div className="hidden sm:flex items-center gap-2">
                      {/* Поле ввода - слева */}
                      <div className="flex-1 relative">
                        <Textarea
                          value={prompt}
                          onChange={(e) => handlePromptChange(e.target.value)}
                          placeholder={isDragOver ? "Отпустите файл для загрузки..." : isEditingMode ? "Опишите изменения для прикрепленного изображения..." : "Опишите изображение, которое хотите создать..."}
                          className="h-[54px] resize-none text-base flex-1 bg-muted/80 border border-border/80 focus:border-primary/80 focus:bg-muted/95 pr-16"
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                          maxLength={5000}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                              e.preventDefault()
                              handleGenerate()
                            }
                          }}
                        />
                        <div className="absolute bottom-1 right-2 text-xs text-muted-foreground pointer-events-none">
                          {prompt.length}/5000
                        </div>
                      </div>
                      
                      {/* Кнопки управления - справа в 2 ряда */}
                      <div className="flex flex-col gap-1">
                        {/* Первый ряд - 4 кнопки */}
                        <div className="flex items-center gap-1">
                          {/* Кнопка улучшения промпта */}
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <span className="inline-block">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-10 w-10 p-0 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                  onClick={handleEnhancePrompt}
                                  disabled={isEnhancing || isGenerating || !prompt?.trim()}
                                >
                                  {isEnhancing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Lightbulb className="h-4 w-4" />
                                  )}
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="z-[140]">
                              <p>{isEnhancing ? "Улучшение промпта с помощью ИИ..." : "Улучшить промпт с помощью ИИ"}</p>
                            </TooltipContent>
                          </Tooltip>

                          {/* Количество изображений */}
                          <DropdownMenu>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-10 w-12 p-0 text-sm bg-muted/80 hover:bg-muted/95 border border-border/80"
                                  >
                                    {numImages}
                                  </Button>
                                </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent className="z-[140]">
                                <p>Количество изображений</p>
                              </TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent className="w-32 z-[150]" align="start">
                              <DropdownMenuItem onClick={() => setNumImages(1)}>1</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setNumImages(2)}>2</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setNumImages(3)}>3</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setNumImages(4)}>4</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          {/* Соотношение сторон */}
                          <DropdownMenu>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-10 w-14 p-0 text-xs bg-muted/80 hover:bg-muted/95 border border-border/80"
                                  >
                                    {aspectRatio}
                                  </Button>
                                </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent className="z-[140]">
                                <p>Соотношение сторон</p>
                              </TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent className="w-32 z-[150]" align="start">
                              {ASPECT_RATIOS.map((ratio) => (
                                <DropdownMenuItem key={ratio} onClick={() => setAspectRatio(ratio)}>
                                  {ratio}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          {/* Модель */}
                          <DropdownMenu>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-10 px-2 text-xs bg-muted/80 hover:bg-muted/95 border border-border/80 whitespace-nowrap"
                                  >
                                    {model === 'nano-banana' ? 'Nano Banana' : 'PRO'}
                                  </Button>
                                </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent className="z-[140]">
                                <p>Модель генерации</p>
                              </TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent className="w-40 z-[150]" align="start">
                              <DropdownMenuItem onClick={() => setModel('nano-banana')}>
                                Nano Banana
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setModel('nano-banana-pro')}>
                                Nano Banana PRO
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          {/* Разрешение (только для PRO) */}
                          {model === 'nano-banana-pro' && (
                            <DropdownMenu>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-10 w-12 p-0 text-xs bg-muted/80 hover:bg-muted/95 border border-border/80"
                                    >
                                      {resolution}
                                    </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent className="z-[140]">
                                  <p>Разрешение изображения</p>
                                </TooltipContent>
                              </Tooltip>
                              <DropdownMenuContent className="w-32 z-[150]" align="start">
                                <DropdownMenuItem onClick={() => setResolution('1K')}>
                                  1K
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setResolution('2K')}>
                                  2K
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setResolution('4K')}>
                                  4K
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        
                        {/* Второй ряд - кнопка стиля (короче) + загрузка изображения */}
                        <div className="flex items-center gap-1">
                          <DropdownMenu>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 flex-1 p-0 text-sm bg-muted/80 hover:bg-muted/95 border border-border/80"
                                  >
                                    {artStyle}
                                  </Button>
                                </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent className="z-[140]">
                                <p>Стиль изображения</p>
                              </TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent className="w-56 z-[150]" align="start">
                              {artStyles.map((style) => (
                                <DropdownMenuItem 
                                  key={style.name}
                                  onClick={() => setArtStyle(style.name)}
                                >
                                  {style.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          {/* Загрузка изображения */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-12 p-0 bg-muted/80 hover:bg-muted/95 border border-border/80"
                                onClick={() => {
                                  if (fileInputRef.current) {
                                    fileInputRef.current.click()
                                  } else {
                                    const input = document.getElementById('studio-file-input') as HTMLInputElement
                                    if (input) {
                                      input.click()
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
                      </div>

                      {/* Кнопка генерации - отдельно справа */}
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <span className="inline-block">
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
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="z-[140]">
                            <p>
                              {isGenerating ? "Генерация изображений..." : `Генерировать изображения (${getPointsText(getRequiredPoints(numImages, model, resolution))})`}
                            </p>
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
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={apiClient.getFileUrl(selectedImageForModal)}
                alt="Полноразмерное изображение"
                fill
                className="object-contain"
                priority
                sizes="100vw"
                quality={95}
              />
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  )
}
