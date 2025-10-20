"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

interface AnimatedGalleryProps {
  className?: string
}

  const gifData = [
    {
      gif: 'juxtapose-gif-1.gif',
      prompt: 'Сделай фото, как будто эта машина в заносе на заснеженной дороге ,  а за ней гонится машина ДПС в Москве, кадр из фильма'
    },
    {
      gif: 'juxtapose-gif-2.gif',
      prompt: 'Сделай фотографию этого свитера в горах с красивым осенним туманом , кадр снизу (положение камеры) девушка в белой юбке и сапогах'
    },
    {
      gif: 'juxtapose-gif-3.gif',
      prompt: 'Сделай фото в этом комплекте мужчины, портрет вид сбоку на заснеженной футбольной площадке'
    }
  ]

export function AnimatedGallery({ className }: AnimatedGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % gifData.length)
        setIsVisible(true)
      }, 300) // Время для fade out
    }, 4000) // Смена каждые 4 секунды

    return () => clearInterval(interval)
  }, [])

  const currentGif = gifData[currentIndex]

  return (
    <div className={`flex flex-col items-center space-y-4 w-full lg:w-1/2 ${className}`}>
      {/* Prompt Example */}
      <div className="w-full max-w-xl">
        <div className="bg-muted/50 dark:bg-muted/20 rounded-xl p-4 border border-gray-200 dark:border-gray-700 h-24 md:h-20 flex items-center justify-center">
          <p className="text-sm text-muted-foreground italic text-center transition-opacity duration-300">
            "{currentGif.prompt}"
          </p>
        </div>
      </div>
      
      {/* GIF Container */}
      <div className="w-full max-w-xl relative">
        <div 
          className={`transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-full h-80 bg-muted rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <img
              src={apiClient.getExampleFileUrl(currentGif.gif)}
              alt={`Пример генерации ${currentIndex + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('GIF load error:', e);
              }}
            />
          </div>
        </div>
        
        {/* Индикаторы */}
        <div className="flex justify-center mt-4 space-x-2">
          {gifData.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsVisible(false)
                setTimeout(() => {
                  setCurrentIndex(index)
                  setIsVisible(true)
                }, 300)
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary w-6' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
