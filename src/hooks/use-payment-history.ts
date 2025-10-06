"use client"

import { useState, useEffect, useCallback } from 'react'
import { apiClient, PaymentHistory } from '@/lib/api-client'

interface PaymentHistoryState {
  history: PaymentHistory[]
  isLoading: boolean
  error: string | null
}

export function usePaymentHistory() {
  const [state, setState] = useState<PaymentHistoryState>({
    history: [],
    isLoading: false,
    error: null,
  })

  const fetchHistory = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await apiClient.getPaymentHistory()
      
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
          error: response.error || 'Ошибка загрузки истории платежей',
        }))
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Ошибка загрузки истории платежей',
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
