import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, SessionDetail } from '@/lib/api-client';

/**
 * Хук для работы с деталями конкретной сессии.
 * Предоставляет методы для получения истории сессии с поддержкой пагинации.
 */
export function useSessionDetail(sessionId: number | null, page: number = 0, size: number = 20) {
  const queryClient = useQueryClient();

  const {
    data: sessionDetailData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['sessionDetail', sessionId, page, size],
    queryFn: () => {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      return apiClient.getSessionDetail(sessionId, page, size);
    },
    enabled: !!sessionId, // Запрос выполняется только если sessionId задан
    staleTime: 30000, // 30 секунд
  });

  return {
    // Данные сессии
    sessionDetail: sessionDetailData?.data,
    sessionId: sessionDetailData?.data?.id,
    sessionName: sessionDetailData?.data?.name,
    createdAt: sessionDetailData?.data?.createdAt,
    updatedAt: sessionDetailData?.data?.updatedAt,

    // История сообщений
    history: sessionDetailData?.data?.history || [],
    totalMessages: sessionDetailData?.data?.totalMessages || 0,
    hasMore: sessionDetailData?.data?.hasMore || false,

    // Состояния
    isLoading,
    error,

    // Методы
    refetch,
    
    // Метод для обновления истории после генерации
    invalidateHistory: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionDetail', sessionId] });
    },

    // Метод для обновления конкретной страницы истории
    invalidatePage: (pageNumber: number) => {
      queryClient.invalidateQueries({ queryKey: ['sessionDetail', sessionId, pageNumber, size] });
    },

    // Метод для обновления всех данных сессии
    invalidateSession: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionDetail', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  };
}

/**
 * Хук для работы с историей сессии с поддержкой ленивой загрузки.
 * Автоматически загружает дополнительные страницы при необходимости.
 */
export function useSessionHistory(sessionId: number | null, initialPageSize: number = 20) {
  const queryClient = useQueryClient();

  // Получаем первую страницу истории
  const firstPage = useSessionDetail(sessionId, 0, initialPageSize);

  // Функция для загрузки следующей страницы
  const loadMoreHistory = async (page: number) => {
    if (!sessionId) return null;

    try {
      const response = await apiClient.getSessionDetail(sessionId, page, initialPageSize);
      return response.data;
    } catch (error) {
      console.error('Error loading more history:', error);
      return null;
    }
  };

  return {
    ...firstPage,
    loadMoreHistory,
    
    // Метод для добавления нового сообщения в историю (после генерации)
    addMessageToHistory: (newMessage: any) => {
      queryClient.setQueryData(['sessionDetail', sessionId, 0, initialPageSize], (oldData: any) => {
        if (!oldData?.data) return oldData;
        
        return {
          ...oldData,
          data: {
            ...oldData.data,
            history: [newMessage, ...oldData.data.history],
            totalMessages: oldData.data.totalMessages + 1,
          },
        };
      });
    },

    // Метод для обновления истории после генерации
    updateHistoryAfterGeneration: () => {
      // Обновляем все страницы истории
      queryClient.invalidateQueries({ queryKey: ['sessionDetail', sessionId] });
      // Обновляем список сессий (для обновления времени последнего обновления)
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  };
}
