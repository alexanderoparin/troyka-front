"use client"

import { useState, useEffect, useCallback } from 'react'
import { apiClient, ImageGenerationHistory } from '@/lib/api-client'

interface ImageHistoryState {
  history: ImageGenerationHistory[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  hasMore: boolean
  page: number
}

const ITEMS_PER_PAGE = 10

export function useImageHistory() {
  const [state, setState] = useState<ImageHistoryState>({
    history: [],
    isLoading: false,
    isLoadingMore: false,
    error: null,
    hasMore: true,
    page: 0,
  })

  const fetchHistory = useCallback(async (page: number = 0, append: boolean = false) => {
    if (append) {
      setState(prev => ({ ...prev, isLoadingMore: true, error: null }))
    } else {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
    }
    
    try {
      const response = await apiClient.getImageHistory(page, ITEMS_PER_PAGE)
      
      if (response.data && Array.isArray(response.data)) {
        const data = response.data as ImageGenerationHistory[]
        setState(prev => ({
          history: append ? [...prev.history, ...data] : data,
          isLoading: false,
          isLoadingMore: false,
          error: null,
          hasMore: data.length === ITEMS_PER_PAGE,
          page: page,
        }))
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isLoadingMore: false,
          error: response.error || 'Ошибка загрузки истории',
        }))
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isLoadingMore: false,
        error: error.message || 'Ошибка загрузки истории',
      }))
    }
  }, [])

  const loadMore = useCallback(() => {
    if (!state.isLoadingMore && state.hasMore) {
      fetchHistory(state.page + 1, true)
    }
  }, [state.isLoadingMore, state.hasMore, state.page, fetchHistory])

  const refetch = useCallback(() => {
    setState(prev => ({ ...prev, page: 0, hasMore: true }))
    fetchHistory(0, false)
  }, [fetchHistory])

  // Загружаем первую страницу при монтировании компонента
  useEffect(() => {
    fetchHistory(0, false)
  }, [fetchHistory])

  return {
    ...state,
    loadMore,
    refetch,
  }
}
