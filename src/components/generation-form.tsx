"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { apiClient, ImageRequest } from "@/lib/api-client"
import { FileUpload } from "@/components/file-upload"
import { ImageEditButton } from "@/components/image-edit-button"
import { useAuth } from "@/contexts/auth-context"
import { Sparkles, Wand2, CreditCard } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { getPointsText, getImagesText } from "@/lib/grammar"

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

export function GenerationForm() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
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
      prompt: "",
      numImages: 1,
      outputFormat: 'JPEG',
    },
  })

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

  const handleFileUploaded = (fileUrl: string) => {
    setUploadedImages(prev => [...prev, fileUrl])
  }

  const handleFileRemoved = (fileUrl: string) => {
    setUploadedImages(prev => prev.filter(url => url !== fileUrl))
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
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="prompt" className="text-base font-semibold">
              Описание товара
            </Label>
            <Badge variant="destructive" className="text-xs">
              Обязательно
            </Badge>
          </div>
          <div className="relative">
            <Textarea
              {...register("prompt")}
              placeholder={uploadedImages.length > 0
                ? "Опишите, как изменить изображение: сделать фон белым, добавить мягкое освещение, убрать лишние предметы..."
                : "Опишите ваш товар: красивый смартфон на белом фоне, студийное освещение, высокое качество..."
              }
              className={cn(
                "min-h-[120px] text-base resize-none border-2 rounded-xl px-4 py-3",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "placeholder:text-muted-foreground/60",
                errors.prompt && "border-destructive focus:border-destructive"
              )}
            />
            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
              {prompt?.length || 0} символов
            </div>
          </div>
          
          {errors.prompt && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <span className="w-1 h-1 bg-destructive rounded-full"></span>
              {errors.prompt.message}
            </p>
          )}
        </div>

        {/* Optional Image Upload Area */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-base font-semibold">
              Загрузить изображение
            </Label>
            <Badge variant="secondary" className="text-xs">
              По желанию
            </Badge>
          </div>
          <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-xl bg-muted/20">
            <FileUpload
              onFileUploaded={handleFileUploaded}
              onFileRemoved={handleFileRemoved}
              uploadedFiles={uploadedImages}
              maxFiles={1}
              accept="image/*"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Загрузите изображение, если хотите его изменить, или оставьте пустым для создания нового
            </p>
          </div>
        </div>

        {/* Style Presets */}
        {uploadedImages.length === 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Стили для вдохновения:</h4>
            <div className="style-presets grid grid-cols-2 gap-2">
              {STYLE_PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  type="button"
                  variant="ghost"
                  onClick={() => applyStylePreset(preset)}
                  className={cn(
                    "h-auto p-3 flex-col items-start gap-2 text-left",
                    "hover:bg-primary/5 hover:border-primary/20 border border-transparent",
                    "transition-all duration-200"
                  )}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-lg">{preset.icon}</span>
                    <span className="text-sm font-medium">{preset.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Generation Options */}
        <div className="generation-options grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="numImages" className="text-sm font-medium">
              Количество изображений
            </Label>
            <Select
              value={watch("numImages")?.toString()}
              onValueChange={(value) => setValue("numImages", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите количество" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 изображение</SelectItem>
                <SelectItem value="2">2 изображения</SelectItem>
                <SelectItem value="3">3 изображения</SelectItem>
                <SelectItem value="4">4 изображения</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="outputFormat" className="text-sm font-medium">
              Формат изображения
            </Label>
            <Select
              value={watch("outputFormat")}
              onValueChange={(value) => setValue("outputFormat", value as 'JPEG' | 'PNG')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите формат" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JPEG">JPEG (рекомендуется)</SelectItem>
                <SelectItem value="PNG">PNG (с прозрачностью)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Balance Info */}
        <div className="balance-info flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Ваш баланс:</span>
            <span className="text-sm font-bold text-primary">{getPointsText(points)}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Стоимость: {getPointsText(watch("numImages") * 3)}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          type="submit"
          disabled={isGenerating || !canGenerate || !prompt?.trim()}
          className={cn(
            "generate-button w-full h-14 text-base font-semibold rounded-xl",
            "bg-gradient-to-r from-primary to-primary/80",
            "hover:from-primary/90 hover:to-primary/70",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]",
            "shadow-lg hover:shadow-xl"
          )}
        >
          {isGenerating ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Создаю изображение...</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce"></div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Wand2 className="w-5 h-5" />
              <span>
                {uploadedImages.length > 0 
                  ? "Изменить изображение" 
                  : `Создать ${getImagesText(watch("numImages"))}`}
              </span>
              <div className="flex items-center gap-1 text-sm opacity-80">
                <Sparkles className="w-3 h-3" />
                <span>{getPointsText(watch("numImages") * 3)}</span>
              </div>
            </div>
          )}
        </Button>

        {/* Info Message */}
        {!canGenerate && (
          <div className="rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  Генерация временно недоступна
                </p>
                <p className="text-xs text-muted-foreground">
                  Попробуйте позже
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="w-1 h-1 bg-primary rounded-full"></div>
            <span>
              {uploadedImages.length > 0 
                ? "ИИ изменит ваше изображение согласно описанию" 
                : "ИИ создаст новое изображение товара по описанию"}
            </span>
            <div className="w-1 h-1 bg-primary rounded-full"></div>
          </div>
          <p className="text-xs text-muted-foreground">
            Результат • 5-10 секунд • Высокое качество
          </p>
        </div>
      </form>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Результат генерации</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <Image
                  src={apiClient.getFileUrl(imageUrl)}
                  alt={`Generated image ${index + 1}`}
                  width={400}
                  height={533}
                  className="rounded-lg object-cover aspect-3-4 w-full shadow-lg"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.open(apiClient.getFileUrl(imageUrl), '_blank')}
                  >
                    Открыть
                  </Button>
                  <ImageEditButton
                    imageUrl={imageUrl}
                    originalPrompt={prompt}
                    onImageEdited={(newImages) => {
                      setGeneratedImages(newImages);
                      toast({
                        title: "Изображение отредактировано!",
                        description: "Новые варианты добавлены к результатам",
                      });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}