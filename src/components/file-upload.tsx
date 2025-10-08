"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";

interface FileUploadProps {
  onFileUploaded: (fileUrl: string) => void;
  onFileRemoved: (fileUrl: string) => void;
  uploadedFiles: string[];
  maxFiles?: number;
  accept?: string;
  className?: string;
}

export function FileUpload({
  onFileUploaded,
  onFileRemoved,
  uploadedFiles,
  maxFiles = 5,
  accept = "image/*",
  className = "",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxFiles - uploadedFiles.length;
    const filesToUpload = fileArray.slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      toast({
        title: "Ошибка",
        description: `Максимум ${maxFiles} файлов`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      for (const file of filesToUpload) {
        // Проверяем тип файла
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Ошибка",
            description: `Файл ${file.name} не является изображением`,
            variant: "destructive",
          });
          continue;
        }

        // Проверяем размер файла (максимум 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "Ошибка",
            description: `Файл ${file.name} слишком большой (максимум 10MB)`,
            variant: "destructive",
          });
          continue;
        }

        // Проверяем, что файл не пустой
        if (file.size === 0) {
          toast({
            title: "Ошибка",
            description: `Файл ${file.name} пустой`,
            variant: "destructive",
          });
          continue;
        }

        const response = await apiClient.uploadFile(file);
        
        if (response.data) {
          onFileUploaded(response.data);
          toast({
            title: "Успех",
            description: `Файл ${file.name} загружен`,
          });
        } else {
          toast({
            title: "Ошибка",
            description: `Ошибка загрузки ${file.name}: ${response.error}`,
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Ошибка при загрузке файлов",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Очищаем input для возможности повторной загрузки того же файла
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileUrl: string) => {
    onFileRemoved(fileUrl);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <Card
        className={`relative border-2 border-dashed transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-muted p-3">
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {isUploading ? "Загрузка..." : "Загрузите изображения"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Перетащите файлы сюда или нажмите для выбора
              </p>
              <p className="text-xs text-muted-foreground">
                Поддерживаются: JPG, PNG, GIF (максимум 10MB)
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={openFileDialog}
              disabled={isUploading || uploadedFiles.length >= maxFiles}
            >
              Выбрать файлы
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={accept}
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </div>
      </Card>

      {/* Превью загруженных файлов */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Загруженные файлы:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {uploadedFiles.map((fileUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={apiClient.getFileUrl(fileUrl)}
                    alt={`Загруженное изображение ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(fileUrl)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
