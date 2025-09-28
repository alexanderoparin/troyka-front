"use client"

import { useState, useEffect, useCallback } from 'react'
import { apiClient, ImageGenerationHistory } from '@/lib/api-client'

interface ImageHistoryState {
  history: ImageGenerationHistory[]
  isLoading: boolean
  error: string | null
}

export function useImageHistory() {
  const [state, setState] = useState<ImageHistoryState>({
    history: [],
    isLoading: false,
    error: null,
  })

  const fetchHistory = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await apiClient.getImageHistory()
      
      if (response.data) {
        setState({
          history: response.data,
          isLoading: false,
          error: null,
        })
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Ошибка загрузки истории',
        }))
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Ошибка загрузки истории',
      }))
    }
  }, [])

  // Загружаем историю при монтировании компонента
  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return {
    ...state,
    refetch: fetchHistory,
  }
}
