import { useQuery } from '@tanstack/react-query'
import { apiClient, PricingPlanResponse } from '@/lib/api-client'

export function usePricingPlans() {
  return useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async (): Promise<PricingPlanResponse[]> => {
      const response = await apiClient.getPricingPlans()
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data || []
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    cacheTime: 10 * 60 * 1000, // 10 минут
  }) as {
    data: PricingPlanResponse[] | undefined
    isLoading: boolean
    error: Error | null
  }
}

export function useAllPricingPlans() {
  return useQuery<PricingPlanResponse[], Error>({
    queryKey: ['all-pricing-plans'],
    queryFn: async (): Promise<PricingPlanResponse[]> => {
      const response = await apiClient.getAllPricingPlans()
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data || []
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    cacheTime: 10 * 60 * 1000, // 10 минут
  })
}
