"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { apiClient, ImageRequest } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { useGenerationPoints } from "@/hooks/use-generation-points";
import { Edit3, Wand2, Loader2, CreditCard } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getPointsText } from "@/lib/grammar";
import { formatApiError } from "@/lib/errors";

interface ImageEditButtonProps {
  imageUrl: string;
  originalPrompt?: string;
  onImageEdited?: (newImages: string[]) => void;
  className?: string;
}

export function ImageEditButton({ 
  imageUrl, 
  originalPrompt = "", 
  onImageEdited,
  className 
}: ImageEditButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [numImages, setNumImages] = useState(1);
  const { toast } = useToast();
  const { points, refreshPoints, setBalance } = useAuth();
  const { getRequiredPoints } = useGenerationPoints();

  const handleEdit = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите описание изменений",
        variant: "destructive",
      });
      return;
    }

    // Проверяем баланс (используем дефолтную модель nano-banana)
    const requiredPoints = getRequiredPoints(numImages, 'nano-banana', '1K');
    if (points < requiredPoints) {
      toast({
        title: "Недостаточно поинтов",
        description: `Требуется ${getPointsText(requiredPoints)}, у вас ${getPointsText(points)}`,
        variant: "destructive",
      });
      return;
    }

    setIsEditing(true);

    try {
      // Обрабатываем imageUrl - если это blob URL, загружаем файл на сервер
      let processedImageUrl = imageUrl;
      if (imageUrl.startsWith('blob:')) {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], 'image.jpg', { type: blob.type });
          const uploadResponse = await apiClient.uploadFile(file);
          if (uploadResponse.data) {
            processedImageUrl = uploadResponse.data;
          } else {
            throw new Error(uploadResponse.error || 'Ошибка загрузки файла');
          }
        } catch (error) {
          console.error('Ошибка загрузки blob URL:', error);
          throw error;
        }
      }

      const request: ImageRequest = {
        prompt: prompt.trim(),
        inputImageUrls: [processedImageUrl],
        numImages,
        model: 'nano-banana' // Дефолтная модель для редактирования
      };

      const response = await apiClient.generateImage(request);

      if (response.data) {
        // Обновляем баланс из ответа API, если он есть
        if (response.data.balance !== undefined) {
          setBalance(response.data.balance);
        } else {
          // Fallback: запрашиваем баланс если его нет в ответе
          setTimeout(() => {
            refreshPoints().catch(err => console.error('Ошибка обновления баланса:', err));
          }, 500);
        }
        
        toast({
          title: "Изображение отредактировано!",
          description: `Списано ${getPointsText(requiredPoints)}`,
          duration: 1000,
        });
        if (onImageEdited) {
          onImageEdited(response.data.imageUrls);
        }
        
        setIsOpen(false);
        setPrompt("");
      } else {
        throw { status: response.status, message: response.error };
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
      setIsEditing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={cn("h-8 w-8 p-0", className)}
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Редактировать изображение
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Превью изображения */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48 rounded-lg overflow-hidden border bg-muted">
              <Image
                src={apiClient.getFileUrl(imageUrl)}
                alt="Изображение для редактирования"
                fill
                className="object-cover"
                quality={95}
                sizes="192px"
              />
            </div>
          </div>

          {/* Оригинальный промпт */}
          {originalPrompt && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Оригинальное описание:</Label>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {originalPrompt}
              </p>
            </div>
          )}

          {/* Информация о балансе */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Ваш баланс:</span>
              <span className="text-sm font-bold text-primary">{getPointsText(points)}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Стоимость: {getPointsText(getRequiredPoints(numImages, 'nano-banana', '1K'))}
            </div>
          </div>

          {/* Поле для описания изменений */}
          <div className="space-y-2">
            <Label htmlFor="edit-prompt" className="text-sm font-medium">
              Опишите изменения:
            </Label>
            <Textarea
              id="edit-prompt"
              placeholder="Например: добавь закат на задний план, сделай изображение более ярким, добавь цветы..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Опишите, как именно вы хотите изменить изображение
            </p>
          </div>

          {/* Настройки генерации */}
          <div className="space-y-2">
            <Label htmlFor="edit-num-images" className="text-sm font-medium">
              Количество вариантов
            </Label>
            <Select
              value={numImages.toString()}
              onValueChange={(value) => setNumImages(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 вариант</SelectItem>
                <SelectItem value="2">2 варианта</SelectItem>
                <SelectItem value="3">3 варианта</SelectItem>
                <SelectItem value="4">4 варианта</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Кнопки действий */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isEditing}
            >
              Отмена
            </Button>
            <Button
              onClick={handleEdit}
              disabled={isEditing || !prompt.trim()}
              className="min-w-[140px]"
            >
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Редактирую...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Редактировать
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
