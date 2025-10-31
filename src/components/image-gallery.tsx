"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageData {
  filename: string
}

interface ImageGalleryProps {
  className?: string
  images?: ImageData[]
  gridSize?: number
}

const generateImageList = (): ImageData[] => {
  const images: ImageData[] = []
  for (let i = 1; i <= 13; i++) {
    const num = i.toString().padStart(2, '0')
    images.push({ filename: `main_img_${num}.jpg` })
  }
  return images
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const getRandomDelay = (): number => {
  return 4000 + Math.random() * 4000 // 4-8 секунд
}

export function ImageGallery({ className, images, gridSize = 4 }: ImageGalleryProps) {
  const imageList = images || generateImageList()
  const [displayImages, setDisplayImages] = useState<ImageData[]>([])
  const [flippingCards, setFlippingCards] = useState<Set<number>>(new Set())
  const timersRef = useRef<Map<number, NodeJS.Timeout>>(new Map())
  const imageQueueRef = useRef<Map<number, ImageData>>(new Map())
  const usedImagesRef = useRef<Map<number, Set<string>>>(new Map())
  const isFlippingAnyRef = useRef(false)
  const pendingFlipsQueueRef = useRef<number[]>([])
  const scheduleFlipRef = useRef<((cardIndex: number) => void) | null>(null)
  const timersInitializedRef = useRef(false) // Флаг инициализации таймеров
  const displayImagesRef = useRef<ImageData[]>([]) // Ref для хранения текущих изображений

  // Инициализация
  useEffect(() => {
    const shuffled = shuffleArray(imageList)
    const initial = shuffled.slice(0, gridSize)
    setDisplayImages(initial)
    displayImagesRef.current = initial // Сохраняем в ref
    
    for (let i = 0; i < gridSize; i++) {
      usedImagesRef.current.set(i, new Set([initial[i].filename]))
    }

    // Предзагрузка всех изображений для кеширования
    imageList.forEach((img) => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.as = 'image'
      link.href = apiClient.getExampleFileUrl(img.filename)
      document.head.appendChild(link)
    })
  }, [])
  
  // Синхронизируем ref с состоянием при каждом изменении
  useEffect(() => {
    displayImagesRef.current = displayImages
  }, [displayImages])

  // Получить следующее случайное изображение, которого нет в текущей сетке
  const getNextImage = useCallback((cardIndex: number, currentImage: ImageData, allCurrentImages: ImageData[]): ImageData => {
    const imagesInGrid = allCurrentImages
      .map((img, idx) => idx !== cardIndex ? img.filename : null)
      .filter((filename): filename is string => filename !== null)
    
    let available = imageList.filter(img => 
      img.filename !== currentImage.filename && !imagesInGrid.includes(img.filename)
    )
    
    if (available.length === 0) {
      available = imageList.filter(img => img.filename !== currentImage.filename)
    }
    
    if (available.length === 0) {
      const forced = imageList.find(img => img.filename !== currentImage.filename)
      if (forced) {
        return forced
      }
      const nextIndex = (imageList.findIndex(img => img.filename === currentImage.filename) + 1) % imageList.length
      return imageList[nextIndex]
    }
    
    const randomIndex = Math.floor(Math.random() * available.length)
    const nextImg = available[randomIndex]
    
    if (nextImg.filename === currentImage.filename) {
      const otherAvailable = available.filter(img => img.filename !== currentImage.filename)
      if (otherAvailable.length > 0) {
        return otherAvailable[0]
      }
      const currentIndex = imageList.findIndex(img => img.filename === currentImage.filename)
      for (let i = 1; i < imageList.length; i++) {
        const nextIndex = (currentIndex + i) % imageList.length
        const candidate = imageList[nextIndex]
        if (candidate.filename !== currentImage.filename && !imagesInGrid.includes(candidate.filename)) {
          return candidate
        }
      }
      return imageList[(currentIndex + 1) % imageList.length]
    }
    
    const cardUsed = usedImagesRef.current.get(cardIndex) || new Set()
    cardUsed.add(nextImg.filename)
    if (cardUsed.size > 5) {
      const first = Array.from(cardUsed)[0]
      cardUsed.delete(first)
    }
    usedImagesRef.current.set(cardIndex, cardUsed)
    
    return nextImg
  }, [imageList])

  // Переворот карточки
  const flipCard = useCallback((cardIndex: number, source = 'unknown') => {
    // Удаляем карточку из очереди, если она там есть (на случай конфликта с таймером)
    const queueIndex = pendingFlipsQueueRef.current.indexOf(cardIndex)
    if (queueIndex !== -1) {
      pendingFlipsQueueRef.current.splice(queueIndex, 1)
    }
    
    // Очищаем таймер для этой карточки, если есть (на случай конфликта)
    const existingTimer = timersRef.current.get(cardIndex)
    if (existingTimer) {
      clearTimeout(existingTimer)
      timersRef.current.delete(cardIndex)
    }
    
    if (isFlippingAnyRef.current) {
      // Добавляем в очередь
      if (!pendingFlipsQueueRef.current.includes(cardIndex)) {
        pendingFlipsQueueRef.current.push(cardIndex)
      }
      return
    }

    isFlippingAnyRef.current = true

    // Используем ref для получения актуального состояния БЕЗ вызова setDisplayImages
    const current = displayImagesRef.current
    if (!current[cardIndex]) {
      isFlippingAnyRef.current = false
      return
    }
    
    const currentImage = current[cardIndex]
    const nextImg = getNextImage(cardIndex, currentImage, current)
    
    // ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА ПЕРЕД ДОБАВЛЕНИЕМ В ОЧЕРЕДЬ
    if (nextImg.filename === currentImage.filename) {
      const imagesInGrid = current
        .map((img, idx) => idx !== cardIndex ? img.filename : null)
        .filter((filename): filename is string => filename !== null)
      const forced = imageList.find(img => 
        img.filename !== currentImage.filename && !imagesInGrid.includes(img.filename)
      )
      if (forced) {
        imageQueueRef.current.set(cardIndex, forced)
      } else {
        const nextIndex = (imageList.findIndex(img => img.filename === currentImage.filename) + 1) % imageList.length
        imageQueueRef.current.set(cardIndex, imageList[nextIndex])
      }
    } else {
      imageQueueRef.current.set(cardIndex, nextImg)
    }

    setFlippingCards(prev => new Set(prev).add(cardIndex))

    // В середине анимации меняем изображение
    setTimeout(() => {
      // Получаем текущее состояние через ref БЕЗ вызова setDisplayImages
      const current = displayImagesRef.current
      if (!current[cardIndex]) {
        isFlippingAnyRef.current = false
        return
      }
      
      // Получаем изображение из очереди
      let nextImg = imageQueueRef.current.get(cardIndex)
      
      // Проверяем совпадение ДО вызова setDisplayImages
      if (!nextImg || nextImg.filename === current[cardIndex].filename) {
        nextImg = getNextImage(cardIndex, current[cardIndex], current)
        // Дополнительная проверка
        if (nextImg.filename === current[cardIndex].filename) {
          const currentIndex = imageList.findIndex(img => img.filename === current[cardIndex].filename)
          const forcedIndex = (currentIndex + 1) % imageList.length
          nextImg = imageList[forcedIndex]
        }
        imageQueueRef.current.set(cardIndex, nextImg)
      }
      
      // Теперь обновляем состояние ОДИН РАЗ
      const newImages = [...current]
      newImages[cardIndex] = nextImg
      imageQueueRef.current.delete(cardIndex)
      displayImagesRef.current = newImages // Обновляем ref сразу
      
      setDisplayImages(newImages)
    }, 1500) // Половина времени анимации (3000ms / 2)

    // Завершаем переворот
    setTimeout(() => {
      setFlippingCards(prev => {
        const newSet = new Set(prev)
        newSet.delete(cardIndex)
        return newSet
      })
      
      isFlippingAnyRef.current = false
      
      // Запускаем следующий переворот из очереди или планируем для текущей карточки
      setTimeout(() => {
        // Если уже идет переворот (возможно, запущен через таймер), пропускаем очередь
        if (isFlippingAnyRef.current) {
          return
        }
        
        if (pendingFlipsQueueRef.current.length > 0) {
          // Берем первую карточку из очереди и удаляем её
          const nextCardIndex = pendingFlipsQueueRef.current.shift()
          
          if (nextCardIndex !== undefined && !isFlippingAnyRef.current) {
            // Очищаем таймер для карточки из очереди, если есть
            const existingTimer = timersRef.current.get(nextCardIndex)
            if (existingTimer) {
              clearTimeout(existingTimer)
              timersRef.current.delete(nextCardIndex)
            }
            
            // Удаляем карточку из очереди, если она там еще есть (на случай двойного входа)
            const queueIndex = pendingFlipsQueueRef.current.indexOf(nextCardIndex)
            if (queueIndex !== -1) {
              pendingFlipsQueueRef.current.splice(queueIndex, 1)
            }
            
            flipCard(nextCardIndex, 'queue')
          }
        } else {
          // Если очереди нет, планируем следующий переворот для текущей карточки
          if (scheduleFlipRef.current && !timersRef.current.has(cardIndex)) {
            scheduleFlipRef.current(cardIndex)
          }
        }
      }, 300)
    }, 3000) // Время анимации (3 секунды)
  }, [getNextImage, imageList])

  // Создание функции scheduleFlip один раз
  const scheduleFlip = useCallback((cardIndex: number) => {
    // Не планируем, если уже есть активный таймер для этой карточки
    if (timersRef.current.has(cardIndex)) {
      return
    }
    
    const delay = getRandomDelay()
    const timer = setTimeout(() => {
      // Удаляем таймер из мапы перед использованием
      timersRef.current.delete(cardIndex)
      
      // Удаляем карточку из очереди, если она там есть (она будет обработана через flipCard)
      const queueIndex = pendingFlipsQueueRef.current.indexOf(cardIndex)
      if (queueIndex !== -1) {
        pendingFlipsQueueRef.current.splice(queueIndex, 1)
      }
      
      if (isFlippingAnyRef.current) {
        if (!pendingFlipsQueueRef.current.includes(cardIndex)) {
          pendingFlipsQueueRef.current.push(cardIndex)
        }
        // Планируем следующий переворот
        scheduleFlip(cardIndex)
      } else {
        flipCard(cardIndex, 'schedule')
      }
    }, delay)
    timersRef.current.set(cardIndex, timer)
  }, [flipCard])

  // Инициализация таймеров - только ОДИН РАЗ когда изображения загрузились
  useEffect(() => {
    if (displayImages.length === 0 || timersInitializedRef.current) return
    
    timersInitializedRef.current = true
    scheduleFlipRef.current = scheduleFlip
    
    // Планируем перевороты для всех карточек
    for (let i = 0; i < gridSize; i++) {
      if (!timersRef.current.has(i)) {
        scheduleFlip(i)
      }
    }
  }, [displayImages.length, gridSize, scheduleFlip])

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer))
      timersRef.current.clear()
      pendingFlipsQueueRef.current = []
      scheduleFlipRef.current = null
    }
  }, [])

  if (displayImages.length === 0) {
    return <div className={cn("w-full", className)} />
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {displayImages.map((image, index) => {
          const isFlipping = flippingCards.has(index)
          // Используем стабильный key БЕЗ filename, чтобы React не пересоздавал элемент при смене изображения
          const cardKey = `card-${index}`
          
          return (
            <div
              key={cardKey}
              className="relative aspect-square group"
            >
              <div
                className={cn(
                  "relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl border border-border/30 dark:border-border/20 transition-transform duration-3000",
                  isFlipping && "card-flipping"
                )}
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="relative w-full h-full bg-gradient-to-br from-primary/10 via-primary/5 to-blue-500/10" style={{ backfaceVisibility: 'hidden' }}>
                  <Image
                    key={`front-${cardKey}-${image.filename}`}
                    src={apiClient.getExampleFileUrl(image.filename)}
                    alt={`Пример генерации ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    loading={index < 4 ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {isFlipping && imageQueueRef.current.has(index) && (
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-blue-500/10"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <Image
                      key={`back-${cardKey}-${imageQueueRef.current.get(index)?.filename}`}
                      src={apiClient.getExampleFileUrl(imageQueueRef.current.get(index)?.filename || image.filename)}
                      alt={`Пример генерации ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
