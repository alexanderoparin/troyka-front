import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Session, CreateSessionRequest, RenameSessionRequest, DeleteSessionResponse } from '@/lib/api-client';

/**
 * Хук для работы со списком сессий пользователя.
 * Предоставляет методы для получения, создания, переименования и удаления сессий.
 */
export function useSessionsList(page: number = 0, size: number = 10) {
  const queryClient = useQueryClient();

  // Получение списка сессий
  const {
    data: sessionsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['sessions', page, size],
    queryFn: () => apiClient.getSessionsList(page, size),
    staleTime: 30000, // 30 секунд
  });

  // Создание новой сессии
  const createSessionMutation = useMutation({
    mutationFn: (request: CreateSessionRequest) => apiClient.createSession(request),
    onSuccess: () => {
      // Обновляем список сессий после создания и сбрасываем на первую страницу
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      // Принудительно обновляем первую страницу
      queryClient.refetchQueries({ queryKey: ['sessions', 0, size] });
    },
  });

  // Переименование сессии
  const renameSessionMutation = useMutation({
    mutationFn: ({ sessionId, request }: { sessionId: number; request: RenameSessionRequest }) =>
      apiClient.renameSession(sessionId, request),
    onSuccess: () => {
      // Обновляем список сессий и детали сессии после переименования
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessionDetail'] });
    },
  });

  // Удаление сессии
  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: number) => apiClient.deleteSession(sessionId),
    onSuccess: () => {
      // Обновляем список сессий после удаления
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  return {
    // Данные
    sessions: sessionsData?.data?.content || [],
    totalElements: sessionsData?.data?.totalElements || 0,
    totalPages: sessionsData?.data?.totalPages || 0,
    hasNext: sessionsData?.data?.hasNext || false,
    hasPrevious: sessionsData?.data?.hasPrevious || false,
    isFirst: sessionsData?.data?.isFirst || true,
    isLast: sessionsData?.data?.isLast || true,

    // Состояния загрузки
    isLoading,
    isCreating: createSessionMutation.isPending,
    isRenaming: renameSessionMutation.isPending,
    isDeleting: deleteSessionMutation.isPending,

    // Ошибки
    error: error || createSessionMutation.error || renameSessionMutation.error || deleteSessionMutation.error,

    // Методы
    createSession: createSessionMutation.mutate,
    renameSession: renameSessionMutation.mutate,
    deleteSession: deleteSessionMutation.mutate,
    refetch,

    // Результаты мутаций
    createSessionResult: createSessionMutation.data,
    renameSessionResult: renameSessionMutation.data,
    deleteSessionResult: deleteSessionMutation.data,
  };
}

/**
 * Хук для получения дефолтной сессии пользователя.
 * Используется для получения или создания первой сессии.
 */
export function useDefaultSession() {
  const queryClient = useQueryClient();

  const {
    data: defaultSessionData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['defaultSession'],
    queryFn: () => apiClient.getDefaultSession(),
    staleTime: 60000, // 1 минута
  });

  return {
    defaultSession: defaultSessionData?.data,
    isLoading,
    error,
    refetch,
    // Метод для обновления дефолтной сессии после создания новой
    invalidateDefaultSession: () => {
      queryClient.invalidateQueries({ queryKey: ['defaultSession'] });
    },
  };
}
