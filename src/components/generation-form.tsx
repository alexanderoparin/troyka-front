"use client"

import React, { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { apiClient, ImageRequest } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { Wand2, UploadCloud, Layers, FileImage } from "lucide-react"
import { cn } from "@/lib/utils"
import { getPointsText } from "@/lib/grammar"

const generationSchema = z.object({
  prompt: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  numImages: z.number().min(1).max(4).default(2),
  outputFormat: z.enum(['JPEG', 'PNG']).default('JPEG'),
})

type GenerationFormData = z.infer<typeof generationSchema>

const STYLE_PRESETS = [
  {
    name: "Студийная съёмка",
    prompt: "профессиональная фотография товара, чистый белый фон, студийное освещение, высокое качество, коммерческий стиль",
    icon: "📸"
  },
  {
    name: "Минимализм", 
    prompt: "минималистичный снимок товара, мягкие тени, нейтральный фон, чистый эстетичный стиль, современный дизайн",
    icon: "🎨"
  },
  {
    name: "Премиум",
    prompt: "роскошная фотография товара, элегантная подача, драматичное освещение, премиум качество, изысканный стиль",
    icon: "✨"
  },
  {
    name: "Lifestyle",
    prompt: "жизненная фотография товара, естественная обстановка, теплое освещение, повседневная атмосфера, аутентичный стиль",
    icon: "🌟"
  },
]

interface GenerationFormProps {
  onGenerationComplete: (images: string[], prompt: string) => void
  initialPrompt?: string
  initialImages?: string[]
  sessionId?: number
}

export function GenerationForm({ onGenerationComplete, initialPrompt = "", initialImages = [], sessionId }: GenerationFormProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>(initialImages)
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { points, refreshPoints } = useAuth()

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
      numImages: 2,
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
    const requiredPoints = data.numImages * 3
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
      // Добавляем соотношение сторон в конец промпта
      const promptWithAspectRatio = `${data.prompt}. Соотношение сторон изображения - ${aspectRatio}`
      
      const request: ImageRequest = {
        prompt: promptWithAspectRatio,
        inputImageUrls: uploadedImages.length > 0 ? uploadedImages : [],
        numImages: data.numImages,
        outputFormat: data.outputFormat,
        sessionId: sessionId
      }

      const response = await apiClient.generateImage(request)

      if (response.data) {
        // Вызываем callback для обновления родительского компонента
        onGenerationComplete(response.data.imageUrls, data.prompt)
        // Обновляем баланс после успешной генерации с небольшой задержкой
        setTimeout(async () => {
          await refreshPoints()
        }, 1000)
        toast({
          title: "Изображение создано!",
          description: `Списано ${getPointsText(requiredPoints)}. Баланс обновится через секунду`,
        })
        // Очищаем форму после успешной генерации
        setValue("prompt", "")
        setUploadedImages([])
      } else {
        throw new Error(response.error || "Ошибка генерации")
      }
      
    } catch (error: any) {
      toast({
        title: "Ошибка генерации",
        description: error.message || "Не удалось создать изображение",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }


  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
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

  const applyStylePreset = (preset: typeof STYLE_PRESETS[0]) => {
    const currentPrompt = prompt?.trim() || ""
    const newPrompt = currentPrompt 
      ? `${currentPrompt}, ${preset.prompt}`
      : preset.prompt
    setValue("prompt", newPrompt)
  }

  return (
    <div className="generation-form space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Prompt Input with Upload Button */}
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              {...register("prompt")}
              placeholder={uploadedImages.length > 0
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
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
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
              
              {/* Соотношение сторон */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const aspectRatios = ['1:1', '4:3', '4:5', '3:2', '2:3', '16:9', '9:16', '7.5:2']
                  const currentIndex = aspectRatios.indexOf(aspectRatio)
                  const nextIndex = (currentIndex + 1) % aspectRatios.length
                  setAspectRatio(aspectRatios[nextIndex])
                }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent-foreground border border-accent/20 transition-colors"
              >
                <FileImage className="w-4 h-4" />
                <span className="text-sm font-medium">{aspectRatio}</span>
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