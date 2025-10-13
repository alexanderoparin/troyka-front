"use client"

import React, { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Send, 
  Image as ImageIcon, 
  Download, 
  Eye, 
  Loader2,
  Sparkles,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { GenerationForm } from "@/components/generation-form"
import { SessionMessage } from "@/lib/api-client"
import Image from "next/image"

interface StudioDialogProps {
  sessionId?: number
  onGenerationComplete: (images: string[], prompt: string) => void
  className?: string
}

export function StudioDialog({ 
  sessionId, 
  onGenerationComplete,
  className 
}: StudioDialogProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const { toast } = useToast()

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
      const mockImages = [
        "https://via.placeholder.com/400x600/4F46E5/FFFFFF?text=Generated+1",
        "https://via.placeholder.com/400x600/7C3AED/FFFFFF?text=Generated+2"
      ]
      
      setGeneratedImages(mockImages)
      onGenerationComplete(mockImages, prompt)
      
      toast({
        title: "Изображения созданы!",
        description: `Создано ${mockImages.length} изображений`,
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
  }, [prompt, onGenerationComplete, toast])

  const handleImageSelect = (imageUrl: string) => {
    if (selectedImages.includes(imageUrl)) {
      setSelectedImages(prev => prev.filter(url => url !== imageUrl))
    } else {
      setSelectedImages(prev => [...prev, imageUrl])
    }
  }

  const handleEditSelected = () => {
    if (selectedImages.length === 0) {
      toast({
        title: "Выберите изображения",
        description: "Сначала выберите изображения для редактирования",
        variant: "destructive",
      })
      return
    }
    
    // Переключаемся в режим редактирования
    setPrompt("")
    toast({
      title: "Режим редактирования",
      description: `Выбрано ${selectedImages.length} изображений для редактирования`,
    })
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Область сгенерированных изображений */}
      {generatedImages.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {generatedImages.map((imageUrl, index) => (
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
                        // Скачивание изображения
                      }}
                    >
                      <Download className="h-3 w-3" />
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

          {/* Кнопки действий */}
          {selectedImages.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Button onClick={handleEditSelected} size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Редактировать выбранные
              </Button>
              <Badge variant="secondary">
                {selectedImages.length} выбрано
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Область ввода промпта */}
      <div className="flex-1 flex flex-col">
        <div className="space-y-4">
          {/* Поле ввода промпта */}
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Опишите изображение, которое хотите создать..."
              className="min-h-[120px] resize-none pr-12"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  handleGenerate()
                }
              }}
            />
            <Button
              size="sm"
              className="absolute bottom-2 right-2"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Подсказки */}
          <div className="text-xs text-muted-foreground">
            Нажмите Ctrl+Enter для быстрой генерации
          </div>

          {/* Опции генерации */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm">
              <ImageIcon className="h-4 w-4 mr-2" />
              Загрузить изображение
            </Button>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Стиль
            </Button>
            <Badge variant="outline">3:4</Badge>
            <Badge variant="outline">1K</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
