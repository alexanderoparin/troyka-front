"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { apiClient, ImageRequest } from "@/lib/api-client"
import { FileUpload } from "@/components/file-upload"
import { useAuth } from "@/contexts/auth-context"
import { Sparkles, Wand2, UploadCloud } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { getPointsText } from "@/lib/grammar"

const generationSchema = z.object({
  prompt: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  numImages: z.number().min(1).max(4).default(1),
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
}

export function GenerationForm({ onGenerationComplete, initialPrompt = "" }: GenerationFormProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null)
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
      const request: ImageRequest = {
        prompt: data.prompt,
        imageUrls: uploadedImages.length > 0 ? uploadedImages : undefined,
        numImages: data.numImages,
        outputFormat: data.outputFormat
      }

      const response = await apiClient.generateImage(request)

      if (response.data) {
        setGeneratedImages(response.data.imageUrls)
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
        setUploadedFile(null)
        setUploadedFilePreview(null)
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

  const handleFileUploaded = (fileUrl: string) => {
    setUploadedImages(prev => [...prev, fileUrl])
  }

  const handleFileRemoved = (fileUrl: string) => {
    setUploadedImages(prev => prev.filter(url => url !== fileUrl))
  }

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0]
      setUploadedFile(file)
      setUploadedFilePreview(URL.createObjectURL(file))
      toast({
        title: "Изображение загружено",
        description: file.name,
      })
    }
  }

  const handleFileRemovedFromPreview = () => {
    setUploadedFile(null)
    setUploadedFilePreview(null)
    toast({
      title: "Изображение удалено",
      description: "Файл был удален из формы.",
    })
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
        {/* Prompt Input - Main Required Field */}
        <div className="space-y-4">
          <Textarea
            {...register("prompt")}
            placeholder={uploadedFilePreview
              ? "Опишите, как изменить изображение..."
              : "Опишите изображение, которое хотите создать..."
            }
            className={cn(
              "min-h-[150px] text-base resize-none border-2 rounded-2xl px-6 py-4",
              "focus:ring-4 focus:ring-primary/20 focus:border-primary",
              "placeholder:text-muted-foreground/60",
              "bg-background/70 transition-all duration-200",
              errors.prompt && "border-destructive focus:border-destructive"
            )}
          />
          
          {errors.prompt && (
            <p className="text-sm text-destructive">{errors.prompt.message}</p>
          )}
        </div>

        {/* Image Upload or Preview */}
        <div className="space-y-4">
          {uploadedFilePreview ? (
            <div className="relative w-full h-64 rounded-2xl overflow-hidden border-2 border-primary/50 group">
              <Image
                src={uploadedFilePreview}
                alt="Uploaded preview"
                fill
                className="object-contain bg-muted"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleFileRemovedFromPreview}
              >
                ×
              </Button>
            </div>
          ) : (
            <FileUpload
              onFileUploaded={handleFileSelected}
              onFileRemoved={handleFileRemoved}
              uploadedFiles={uploadedImages}
              maxFiles={1}
              accept="image/*"
              className="w-full h-48 flex items-center justify-center border-2 border-dashed border-border/50 rounded-2xl bg-background/70 hover:bg-background/50 transition-colors"
            >
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="w-8 h-8" />
                <span className="text-sm">Нажмите или перетащите файл для загрузки</span>
                <span className="text-xs">(Макс. 20MB, JPG, PNG)</span>
              </div>
            </FileUpload>
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