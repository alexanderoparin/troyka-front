"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useImageHistory } from '@/hooks/use-image-history'
import { apiClient } from '@/lib/api-client'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface GenerationHistorySidebarProps {
  onNewGeneration: () => void
}

export const GenerationHistorySidebar: React.FC<GenerationHistorySidebarProps> = ({ onNewGeneration }) => {
  const { history, isLoading } = useImageHistory()

  return (
    <aside className="w-24 bg-card border-r border-border/50 flex flex-col items-center py-6 space-y-4 shadow-lg">
      {/* Krea Logo */}
      <div className="mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
          <ImageIcon className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* New Generation Button */}
      <Button
        variant="ghost"
        size="icon"
        className="w-16 h-16 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 group"
        onClick={onNewGeneration}
      >
        <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
      </Button>

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
          history.map((item, index) => (
            <TooltipProvider key={item.imageUrl + index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "relative w-full aspect-[3/4] rounded-lg overflow-hidden cursor-pointer group",
                      "border-2 border-transparent hover:border-primary/50 transition-all duration-200",
                      index === 0 && "animate-pulse-border border-primary" // Подсветка последнего изображения
                    )}
                  >
                    <Image
                      src={apiClient.getFileUrl(item.imageUrl)}
                      alt={item.prompt || "Generated image"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200"></div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="font-semibold mb-1">Промпт:</p>
                  <p className="text-sm text-muted-foreground">{item.prompt}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))
        )}
      </div>

      {/* Bottom Section */}
      <div className="mt-auto text-xs text-muted-foreground text-center">
        <p>Krea 1</p>
      </div>
    </aside>
  )
}
