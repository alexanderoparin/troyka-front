"use client"

import React, { useRef, useCallback, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useImageHistory } from '@/hooks/use-image-history'
import { apiClient } from '@/lib/api-client'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Loader2 } from 'lucide-react'

interface GenerationHistorySidebarProps {
  onNewGeneration: () => void
  refreshTrigger?: number
  onImageSelect?: (imageUrl: string, prompt: string) => void
  onImagesSelect?: (imageUrls: string[], prompts: string[]) => void
  selectedImages?: string[]
  newImagesCount?: number
}

export const GenerationHistorySidebar: React.FC<GenerationHistorySidebarProps> = ({ 
  onNewGeneration, 
  refreshTrigger = 0, 
  onImageSelect,
  onImagesSelect,
  selectedImages = [],
  newImagesCount = 0
}) => {
  const { history, isLoading, isLoadingMore, hasMore, loadMore, refetch } = useImageHistory()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const processedTriggerRef = useRef<number>(0)
  const lastRefreshTriggerRef = useRef<number>(0)

  // Intersection Observer для ленивой загрузки
  const lastItemRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore) return
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(entries => {       
      if (entries[0].isIntersecting && hasMore) {
        loadMore()
      }
    })

    if (node) observerRef.current.observe(node)
  }, [isLoadingMore, hasMore, loadMore])

  // Обновляем историю при изменении refreshTrigger
  useEffect(() => {
    if (refreshTrigger > 0) {
      refetch()
    }
  }, [refreshTrigger, refetch])

  // Отслеживаем изменения refreshTrigger
  useEffect(() => {
    if (refreshTrigger > lastRefreshTriggerRef.current) {
      console.log('RefreshTrigger changed:', refreshTrigger, '->', lastRefreshTriggerRef.current)
      lastRefreshTriggerRef.current = refreshTrigger
    }
  }, [refreshTrigger])

  // Автоматически выделяем новые изображения после генерации
  useEffect(() => {
    console.log('Sidebar useEffect triggered:', {
      historyLength: history.length,
      refreshTrigger,
      newImagesCount,
      processedTrigger: processedTriggerRef.current,
      lastRefreshTrigger: lastRefreshTriggerRef.current
    })
    
    // Проверяем, изменился ли refreshTrigger
    console.log('Condition check:', {
      refreshTrigger,
      lastRefreshTrigger: lastRefreshTriggerRef.current,
      condition1: refreshTrigger > lastRefreshTriggerRef.current,
      condition2: history.length > 0,
      condition3: newImagesCount > 0,
      allConditions: refreshTrigger > lastRefreshTriggerRef.current && history.length > 0 && newImagesCount > 0
    })
    
    if (refreshTrigger > lastRefreshTriggerRef.current && history.length > 0 && newImagesCount > 0) {
      // Находим новые изображения (первые в списке)
      const newImages = history.slice(0, newImagesCount).flatMap(item => item.imageUrls)
      const newPrompts = history.slice(0, newImagesCount).map(item => item.prompt || "")
      
      console.log('Selecting new images:', newImages)
      
      // Выделяем новые изображения
      onImagesSelect?.(newImages, newPrompts)
      
      // Обновляем отслеживаемые значения
      processedTriggerRef.current = refreshTrigger
    }
  }, [history, refreshTrigger, newImagesCount])

  const handleImageClick = (imageUrl: string, prompt: string) => {
    if (selectedImages.includes(imageUrl)) {
      // Убираем из выбранных
      const newSelected = selectedImages.filter(url => url !== imageUrl)
      const newPrompts = history
        .filter(item => item.imageUrls.some(url => newSelected.includes(url)))
        .map(item => item.prompt || "")
      onImagesSelect?.(newSelected, newPrompts)
    } else if (selectedImages.length < 4) {
      // Добавляем к выбранным
      const newSelected = [...selectedImages, imageUrl]
      const newPrompts = history
        .filter(item => item.imageUrls.some(url => newSelected.includes(url)))
        .map(item => item.prompt || "")
      onImagesSelect?.(newSelected, newPrompts)
    }
  }

  return (
    <aside className="w-24 bg-card border-r border-border/50 flex flex-col items-center py-6 space-y-4 shadow-lg h-full">
      {/* History Items */}
      <div className="flex-1 overflow-y-auto w-full px-2 space-y-3 scrollbar-hide">
        {isLoading ? (
          <div className="w-full aspect-[3/4] rounded-lg bg-muted/50 border border-border/30 flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="w-full aspect-[3/4] rounded-lg bg-muted/50 border border-border/30 flex items-center justify-center">
            <span className="text-xs text-muted-foreground text-center">Нет истории</span>
          </div>
        ) : (
          <>
            {history.map((item, index) => (
              <div key={item.prompt + index} className="space-y-2">
                {item.imageUrls.map((imageUrl, imgIndex) => (
                  <TooltipProvider key={imageUrl + imgIndex}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          ref={index === history.length - 1 && imgIndex === item.imageUrls.length - 1 ? lastItemRef : null}
                          className={cn(
                            "relative w-full aspect-[3/4] rounded-lg overflow-hidden cursor-pointer group",
                            "border-2 border-transparent hover:border-primary/50 transition-all duration-200",
                            "shadow-lg hover:shadow-xl dark:shadow-2xl dark:hover:shadow-primary/20",
                            "bg-card/50 backdrop-blur-sm",
                            index < newImagesCount && refreshTrigger > 0 && "animate-pulse-border border-primary", // Подсветка новых изображений
                            selectedImages.includes(imageUrl) && "border-primary ring-2 ring-primary/20" // Подсветка выбранного
                          )}
                          onClick={() => handleImageClick(imageUrl, item.prompt || "")}
                        >
                          <Image
                            src={apiClient.getFileUrl(imageUrl)}
                            alt={item.prompt || "Generated image"}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                            quality={95}
                            sizes="(max-width: 640px) 100vw, 300px"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200"></div>
                          {selectedImages.includes(imageUrl) && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                              {selectedImages.indexOf(imageUrl) + 1}
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="text-sm text-muted-foreground">{item.prompt}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ))}
            
            {/* Loading indicator for more items */}
            {isLoadingMore && (
              <div className="w-full aspect-[3/4] rounded-lg bg-muted/50 border border-border/30 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  )
}
