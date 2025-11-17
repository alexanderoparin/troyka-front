"use client"

import React, { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { apiClient, ImageRequest, EnhancePromptRequest, ArtStyle } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { Wand2, UploadCloud, Layers, FileImage, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { getPointsText } from "@/lib/grammar"
import { getRequiredPoints } from "@/lib/config"
import { formatApiError } from "@/lib/errors"

const generationSchema = z.object({
  prompt: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  numImages: z.number().min(1).max(4).default(1),
  outputFormat: z.enum(['JPEG', 'PNG']).default('JPEG'),
})

type GenerationFormData = z.infer<typeof generationSchema>

const ART_STYLES = [
  { name: 'Без стиля', prompt: '' },
  { name: 'Реалистичный', prompt: 'photorealistic, high quality, detailed, professional photography' },
  { name: 'Аниме', prompt: 'anime style, manga art, vibrant colors, Japanese animation' },
  { name: 'Пиксель-арт', prompt: 'pixel art, 8-bit style, retro gaming aesthetic' },
  { name: 'Масляная живопись', prompt: 'oil painting, classical art style, brushstrokes visible' },
  { name: 'Акварель', prompt: 'watercolor painting, soft brushstrokes, translucent colors' },
  { name: 'Цифровая живопись', prompt: 'digital art, concept art style, clean lines' },
  { name: 'Карандашный рисунок', prompt: 'pencil sketch, hand-drawn illustration, graphite shading' },
  { name: 'Портрет', prompt: 'professional portrait photography, studio lighting, sharp focus' },
  { name: 'Пейзаж', prompt: 'landscape photography, golden hour lighting, wide angle' },
  { name: 'Макро', prompt: 'macro photography, extreme close-up, detailed textures' },
  { name: 'Черно-белое', prompt: 'black and white photography, monochrome, high contrast' },
  { name: 'HDR', prompt: 'HDR photography, high dynamic range, vibrant colors' },
  { name: 'Винтаж', prompt: 'vintage photography, film grain, retro aesthetic' },
  { name: 'Кинематографичный', prompt: 'cinematic lighting, movie still, dramatic composition' },
  { name: 'Сюрреализм', prompt: 'surreal art, dreamlike atmosphere, impossible elements' },
  { name: 'Минимализм', prompt: 'minimalist art, clean composition, simple background' },
  { name: 'Готика', prompt: 'gothic art, dark atmosphere, mysterious mood' },
  { name: 'Футуризм', prompt: 'futuristic style, sci-fi aesthetic, cyberpunk elements' }
]

interface GenerationFormProps {
  onGenerationComplete: (images: string[]) => void
  initialPrompt?: string
  initialImages?: string[]
  sessionId?: number
}

export function GenerationForm({ onGenerationComplete, initialPrompt = "", initialImages = [], sessionId }: GenerationFormProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>(initialImages)
  const [artStyle, setArtStyle] = useState('Реалистичный')
  const [artStyles, setArtStyles] = useState<ArtStyle[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { points, refreshPoints, setBalance } = useAuth()

  // Загружаем стили из API при монтировании компонента
  React.useEffect(() => {
    const loadArtStyles = async () => {
      const response = await apiClient.getArtStyles()
      if (response.data && response.data.length > 0) {
        setArtStyles(response.data)
      }
    }
    loadArtStyles()
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GenerationFormData>({
    resolver: zodResolver(generationSchema),
    defaultValues: {
      prompt: initialPrompt,
      numImages: 1,
      outputFormat: 'JPEG',
    },
  })

  // Обновляем промпт при изменении initialPrompt
  React.useEffect(() => {
    if (initialPrompt) {
      setValue("prompt", initialPrompt)
    }
  }, [initialPrompt, setValue])

  const prompt = watch("prompt")
  const numImages = watch("numImages")
  const outputFormat = watch("outputFormat")
  const canGenerate = true // Пока что убираем проверку поинтов

  const onSubmit = async (data: GenerationFormData) => {
    if (!canGenerate) {
      toast({
        title: "Ошибка",
        description: "Генерация временно недоступна",
        variant: "destructive",
      })
      return
    }

    // Проверяем баланс
    const requiredPoints = getRequiredPoints(data.numImages)
    if (points < requiredPoints) {
      toast({
        title: "Недостаточно поинтов",
        description: `Требуется ${getPointsText(requiredPoints)}, у вас ${getPointsText(points)}`,
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Находим стиль и получаем его id (нужно будет получить из API, пока используем fallback)
      // Для generation-form нужно получить стили из API или использовать fallback
      // Пока используем дефолтное значение 1 (Без стиля)
      const selectedStyle = ART_STYLES.find(style => style.name === artStyle)
      // TODO: Получать id стиля из API, пока используем дефолтное значение
      const styleId = 1 // Будет обновлено после получения стилей из API
      
      // Обрабатываем загруженные изображения - загружаем blob URL'ы на сервер
      let processedImageUrls: string[] = []
      if (uploadedImages.length > 0) {
        const uploadPromises = uploadedImages.map(async (url) => {
          if (url.startsWith('blob:')) {
            // Если это blob URL, нужно загрузить файл на сервер
            try {
              const response = await fetch(url)
              const blob = await response.blob()
              const file = new File([blob], 'image.jpg', { type: blob.type })
              const uploadResponse = await apiClient.uploadFile(file)
              if (uploadResponse.data) {
                return uploadResponse.data
              } else {
                throw new Error(uploadResponse.error || 'Ошибка загрузки файла')
              }
            } catch (error) {
              console.error('Ошибка загрузки blob URL:', error)
              throw error
            }
          } else {
            // Обычный URL - возвращаем как есть
            return url
          }
        })
        
        processedImageUrls = await Promise.all(uploadPromises)
      }
      
      const request: ImageRequest = {
        prompt: data.prompt, // Оригинальный промпт пользователя (промпт стиля добавится на бэке перед отправкой в FalAI)
        inputImageUrls: processedImageUrls,
        numImages: data.numImages,
        outputFormat: data.outputFormat,
        sessionId: sessionId,
        styleId: styleId
      }

      const response = await apiClient.generateImage(request)

      if (response.data) {
        // Вызываем callback для обновления родительского компонента
        onGenerationComplete(response.data.imageUrls)
        
        // Обновляем баланс из ответа API, если он есть
        if (response.data.balance !== undefined) {
          setBalance(response.data.balance)
        } else {
          // Fallback: запрашиваем баланс если его нет в ответе
          setTimeout(() => {
            refreshPoints().catch(err => console.error('Ошибка обновления баланса:', err))
          }, 500)
        }
        
        toast({
          title: "Изображение создано!",
          description: `Списано ${getPointsText(requiredPoints)}`,
          duration: 1000,
        })
        // Очищаем форму после успешной генерации
        setValue("prompt", "")
        setUploadedImages([])
      } else {
        throw { status: response.status, message: response.error }
      }
      
    } catch (error: any) {
      const formatted = formatApiError(error?.status ? error : (error?.message || error))
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
  }


  const handleFileUpload = async (file: File) => {
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
      const response = await apiClient.uploadFile(file)
      if (response.data) {
        setUploadedImages([response.data])
        toast({
          title: "Изображение загружено",
          description: file.name,
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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    await handleFileUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      await handleFileUpload(file)
    }
  }

  const handleEnhancePrompt = async () => {
    const currentPrompt = prompt?.trim() || ""
    
    // Проверяем, что промпт не пустой (минимум 10 символов)
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
      // Находим выбранный стиль и получаем его id
      const selectedStyle = artStyles.find(style => style.name === artStyle)
      const styleId = selectedStyle?.id || 1 // По умолчанию id = 1 (Без стиля)

      // Подготавливаем изображения для запроса (если есть)
      let imageUrls: string[] | undefined = undefined
      if (uploadedImages.length > 0) {
        // Обрабатываем blob URL'ы, если есть
        const processedUrls = await Promise.all(
          uploadedImages.map(async (url) => {
            if (url.startsWith('blob:')) {
              try {
                const response = await fetch(url)
                const blob = await response.blob()
                const file = new File([blob], 'image.jpg', { type: blob.type })
                const uploadResponse = await apiClient.uploadFile(file)
                if (uploadResponse.data) {
                  return uploadResponse.data
                } else {
                  throw new Error(uploadResponse.error || 'Ошибка загрузки файла')
                }
              } catch (error) {
                console.error('Ошибка загрузки blob URL:', error)
                return url // Возвращаем оригинальный URL при ошибке
              }
            } else {
              return url
            }
          })
        )
        imageUrls = processedUrls
      }

      const request: EnhancePromptRequest = {
        prompt: currentPrompt,
        imageUrls: imageUrls,
        styleId: styleId,
      }

      const response = await apiClient.enhancePrompt(request)

      if (response.data) {
        // Подставляем улучшенный промпт в поле
        setValue("prompt", response.data.enhancedPrompt)
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
  }


  return (
    <div 
      className={`generation-form space-y-6 ${isDragOver ? 'bg-primary/5 border-2 border-dashed border-primary/60 rounded-lg p-4' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Prompt Input with Upload Button */}
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              {...register("prompt")}
              placeholder={isDragOver 
                ? "Отпустите файл для загрузки..."
                : uploadedImages.length > 0
                  ? "Опишите, как изменить изображение..."
                  : initialPrompt 
                    ? "Опишите изменения для изображения..."
                    : "Опишите изображение, которое хотите создать..."
              }
              className={cn(
                "min-h-[150px] text-base resize-none border-2 rounded-2xl px-6 py-4 pr-40",
                "focus:ring-4 focus:ring-primary/20 focus:border-primary",
                "placeholder:text-muted-foreground/60",
                "bg-background/70 backdrop-blur-sm transition-all duration-200",
                "shadow-lg hover:shadow-xl dark:shadow-2xl dark:hover:shadow-primary/10",
                "border-border/50 hover:border-border",
                errors.prompt && "border-destructive focus:border-destructive"
              )}
            />
            
            {/* Upload Button, Image Count and Format inside prompt area */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              {/* Первый ряд - 4 кнопки */}
              <div className="flex items-center gap-2">
                {/* Enhance Prompt Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing || isGenerating || !prompt?.trim() || prompt.trim().length < 10}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Улучшить промпт с помощью ИИ"
                >
                  {isEnhancing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-medium">Улучшить</span>
                    </>
                  )}
                </Button>
                
                {/* Format Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFormat = outputFormat === 'JPEG' ? 'PNG' : 'JPEG'
                    setValue("outputFormat", newFormat)
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent-foreground border border-accent/20 transition-colors"
                >
                  <FileImage className="w-4 h-4" />
                  <span className="text-sm font-medium">{outputFormat}</span>
                </Button>
                
                {/* Image Count Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newCount = numImages >= 4 ? 1 : numImages + 1
                    setValue("numImages", newCount)
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary-foreground border border-secondary/20 transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  <span className="text-sm font-medium">{numImages}</span>
                </Button>
                
                {/* Upload Button */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  ref={fileInputRef}
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span className="text-sm font-medium">Фото</span>
                </Button>
              </div>
              
              {/* Второй ряд - кнопка стиля (широкая) */}
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentIndex = ART_STYLES.findIndex(style => style.name === artStyle)
                    const nextIndex = (currentIndex + 1) % ART_STYLES.length
                    setArtStyle(ART_STYLES[nextIndex].name)
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent-foreground border border-accent/20 transition-colors w-full"
                >
                  <FileImage className="w-4 h-4" />
                  <span className="text-sm font-medium">{artStyle}</span>
                </Button>
              </div>
            </div>
          </div>
          
          {errors.prompt && (
            <p className="text-sm text-destructive">{errors.prompt.message}</p>
          )}
          
          {/* Миниатюры загруженных изображений */}
          {uploadedImages.length > 0 && (
            <div className="mt-3 flex gap-2">
              {uploadedImages.map((imageUrl, index) => (
                <div key={index} className="relative w-8 h-8 rounded-lg overflow-hidden border border-border/50 group">
                  <img
                    src={imageUrl}
                    alt={`Загруженное изображение ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Generate Button */}
        <Button
          type="submit"
          disabled={isGenerating || !canGenerate || !prompt?.trim()}
          className={cn(
            "generate-button relative w-full h-16 text-lg font-bold rounded-2xl overflow-hidden",
            "bg-gradient-to-r from-primary via-primary to-primary/90",
            "hover:from-primary/90 hover:via-primary/80 hover:to-primary/70",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]",
            "shadow-2xl hover:shadow-3xl hover:shadow-primary/25",
            "dark:shadow-primary/30 dark:hover:shadow-primary/40",
            "border border-primary/20"
          )}
        >
          {isGenerating ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Генерация...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Wand2 className="w-5 h-5" />
              <span>Генерировать</span>
            </div>
          )}
        </Button>

      </form>
    </div>
  )
}