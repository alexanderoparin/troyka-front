'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient, GenerationPointsResponse } from '@/lib/api-client'

/** Fallback, если API ещё не ответил или ошибка — чтобы UI не ломался. */
const FALLBACK: GenerationPointsResponse = {
  pointsPerImage: 2,
  pointsPerImagePro: { '1K': 8, '2K': 9, '4K': 15 },
  pointsOnRegistration: 4,
}

export function useGenerationPoints() {
  const query = useQuery({
    queryKey: ['generation-points'],
    queryFn: async (): Promise<GenerationPointsResponse> => {
      const response = await apiClient.getGenerationPoints()
      if (response.error || !response.data) {
        throw new Error(response.error ?? 'Нет данных')
      }
      return response.data
    },
    staleTime: 10 * 60 * 1000, // 10 минут — один запрос, дальше из кэша
    gcTime: 30 * 60 * 1000, // 30 минут в кэше
    retry: 2,
  })

  const data = query.data ?? FALLBACK

  function getRequiredPoints(
    numImages: number,
    model: 'nano-banana' | 'nano-banana-pro' = 'nano-banana',
    resolution: '1K' | '2K' | '4K' = '1K'
  ): number {
    if (model === 'nano-banana-pro') {
      const pointsPerImage = data.pointsPerImagePro[resolution] ?? data.pointsPerImagePro['1K']
      return numImages * pointsPerImage
    }
    return numImages * data.pointsPerImage
  }

  return {
    /** Тарифы с бэка или fallback. */
    data,
    isLoading: query.isLoading,
    error: query.error,
    /** Поинты для N изображений (источник — data с бэка). */
    getRequiredPoints,
    /** Поинтов за 1 изображение для nano-banana (для текстов «N поинтов = 1 генерация»). */
    pointsPerImage: data.pointsPerImage,
    /** Поинтов при регистрации. */
    pointsOnRegistration: data.pointsOnRegistration,
  }
}
