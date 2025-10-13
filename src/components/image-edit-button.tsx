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
import { Edit3, Wand2, Loader2, CreditCard } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getPointsText } from "@/lib/grammar";

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
  const [outputFormat, setOutputFormat] = useState<'JPEG' | 'PNG'>('JPEG');
  const { toast } = useToast();
  const { points, refreshPoints } = useAuth();

  const handleEdit = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите описание изменений",
        variant: "destructive",
      });
      return;
    }

    // Проверяем баланс
    const requiredPoints = numImages * 3;
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
      const request: ImageRequest = {
        prompt: prompt.trim(),
        inputImageUrls: [imageUrl],
        numImages,
        outputFormat
      };

      const response = await apiClient.generateImage(request);

      if (response.data) {
        // Обновляем баланс после успешного редактирования с небольшой задержкой
        setTimeout(async () => {
          await refreshPoints();
        }, 1000);
        toast({
          title: "Изображение отредактировано!",
          description: `Списано ${getPointsText(requiredPoints)}. Баланс обновится через секунду`,
        });
        
        if (onImageEdited) {
          onImageEdited(response.data.imageUrls);
        }
        
        setIsOpen(false);
        setPrompt("");
      } else {
        throw new Error(response.error || "Ошибка редактирования");
      }
      
    } catch (error: any) {
      toast({
        title: "Ошибка редактирования",
        description: error.message || "Не удалось отредактировать изображение",
        variant: "destructive",
      });
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
              Стоимость: {getPointsText(numImages * 3)}
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
          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="edit-format" className="text-sm font-medium">
                Формат изображения
              </Label>
              <Select
                value={outputFormat}
                onValueChange={(value) => setOutputFormat(value as 'JPEG' | 'PNG')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JPEG">JPEG</SelectItem>
                  <SelectItem value="PNG">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
