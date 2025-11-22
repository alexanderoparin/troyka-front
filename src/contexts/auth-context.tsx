"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { apiClient, LoginRequest, RegisterRequest, UserInfo, TelegramAuthRequest } from '@/lib/api-client'

interface AuthState {
  user: UserInfo | null
  isAuthenticated: boolean
  isLoading: boolean
  points: number
  avatar: string | null
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error: string | null }>
  register: (userData: RegisterRequest) => Promise<{ success: boolean; error: string | null }>
  loginWithTelegram: (telegramData: TelegramAuthRequest) => Promise<{ success: boolean; error: string | null; data?: { isNewUser?: boolean } }>
  linkTelegram: (telegramData: TelegramAuthRequest) => Promise<{ success: boolean; error: string | null }>
  unlinkTelegram: () => Promise<{ success: boolean; error: string | null }>
  logout: () => Promise<void>
  refreshPoints: () => Promise<void>
  setBalance: (newBalance: number) => void
  refreshUserInfo: () => Promise<void>
  isEmailVerified: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    points: 0,
    avatar: null,
  })

  // Флаг для предотвращения запросов во время logout
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  // Ref для предотвращения дублирующих запросов в StrictMode (синхронная проверка)
  const isCheckingAuthRef = useRef(false)
  // Ref для отслеживания инициализации (не вызывает ре-рендеры)
  const hasInitializedRef = useRef(false)
  // Ref для предотвращения одновременных вызовов refreshPoints
  const isRefreshingPointsRef = useRef(false)
  // Ref для хранения времени последнего вызова (для debounce)
  const lastRefreshTimeRef = useRef(0)
  const REFRESH_DEBOUNCE_MS = 1000 // Минимальный интервал между вызовами - 1 секунда

  // Устанавливаем callback для обработки 401 ошибок
  useEffect(() => {
    const handleUnauthorized = () => {
      // При получении 401 автоматически разлогиниваем пользователя
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        points: 0,
        avatar: null,
      })
    }
    
    apiClient.setOnUnauthorized(handleUnauthorized)
    
    return () => {
      apiClient.setOnUnauthorized(() => {})
    }
  }, [])

  // Проверяем аутентификацию при загрузке (только один раз)
  useEffect(() => {
    // Предотвращаем повторные вызовы: если уже инициализировали или проверяем, или идет logout
    if (hasInitializedRef.current || isLoggingOut || isCheckingAuthRef.current) {
      return
    }
    
    // Устанавливаем флаги синхронно, чтобы предотвратить параллельные запросы
    isCheckingAuthRef.current = true
    hasInitializedRef.current = true
    
    const checkAuth = async () => {
      try {
        if (apiClient.isAuthenticated()) {
          try {
            const [userResponse, pointsResponse, avatarResponse] = await Promise.all([
              apiClient.getUserInfo(),
              apiClient.getUserPoints(),
              apiClient.getUserAvatar()
            ])
            
            // Проверяем, не получили ли мы 401 ошибку
            if (userResponse.status === 401 || pointsResponse.status === 401 || avatarResponse.status === 401) {
              // Токен истек или недействителен - разлогиниваем
              console.log('Токен истек (401), разлогиниваем пользователя')
              apiClient.logout()
              setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                points: 0,
                avatar: null,
              })
              return
            }
            
            // Проверяем наличие данных пользователя
            if (userResponse.data && userResponse.status === 200) {
              // Данные пользователя получены успешно
              setState({
                user: userResponse.data,
                isAuthenticated: true,
                isLoading: false,
                points: (pointsResponse.status === 200 && pointsResponse.data !== undefined) ? pointsResponse.data : 0,
                avatar: (avatarResponse.status === 200 && avatarResponse.data) ? avatarResponse.data : null,
              })
            } else {
              // Данные пользователя не получены или ошибка
              console.warn('Не удалось получить данные пользователя:', {
                userStatus: userResponse.status,
                userError: userResponse.error,
                pointsStatus: pointsResponse.status,
                pointsError: pointsResponse.error
              })
              apiClient.logout()
              setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                points: 0,
                avatar: null,
              })
            }
          } catch (error) {
            // Ошибка при получении данных пользователя
            console.error('Ошибка при проверке аутентификации:', error)
            apiClient.logout()
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              points: 0,
              avatar: null,
            })
          }
        } else {
          // Токена нет, пользователь не авторизован
          setState(prev => ({
            ...prev,
            isAuthenticated: false,
            isLoading: false,
            points: 0,
            avatar: null,
          }))
        }
      } finally {
        // Сбрасываем флаг проверки после завершения (успешного или с ошибкой)
        isCheckingAuthRef.current = false
      }
    }

    checkAuth()
  }, [isLoggingOut]) // Убрали hasInitialized из зависимостей, используем ref

  const login = useCallback(async (credentials: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    const response = await apiClient.login(credentials)
    
    if (response.data) {
      // После успешного логина получаем полную информацию о пользователе
      try {
        const [userInfoResponse, pointsResponse, avatarResponse] = await Promise.all([
          apiClient.getUserInfo(),
          apiClient.getUserPoints(),
          apiClient.getUserAvatar()
        ])
        
        if (userInfoResponse.data) {
          setState({
            user: userInfoResponse.data,
            isAuthenticated: true,
            isLoading: false,
            points: pointsResponse.data || 0,
            avatar: avatarResponse.data || null,
          })
          return { success: true, error: null }
        }
      } catch (error) {
        // Если не удалось получить информацию о пользователе, используем данные из логина
        setState({
          user: {
            username: response.data.username,
            email: response.data.email,
            role: response.data.role,
          },
          isAuthenticated: true,
          isLoading: false,
          points: 6, // Новые пользователи получают 6 баллов при регистрации
          avatar: null,
        })
        return { success: true, error: null }
      }
    }
    
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      isLoading: false,
      points: 0,
      avatar: null,
    }))
    return { success: false, error: response.error || 'Неизвестная ошибка' }
  }, [])

  const register = useCallback(async (userData: RegisterRequest) => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    const response = await apiClient.register(userData)
    
    if (response.data) {
      // После успешной регистрации получаем полную информацию о пользователе
      try {
        const [userInfoResponse, pointsResponse, avatarResponse] = await Promise.all([
          apiClient.getUserInfo(),
          apiClient.getUserPoints(),
          apiClient.getUserAvatar()
        ])
        
        if (userInfoResponse.data) {
          setState({
            user: userInfoResponse.data,
            isAuthenticated: true,
            isLoading: false,
            points: pointsResponse.data || 0,
            avatar: avatarResponse.data || null,
          })
          return { success: true, error: null }
        }
      } catch (error) {
        // Если не удалось получить информацию о пользователе, используем данные из регистрации
        setState({
          user: {
            username: response.data.username,
            email: response.data.email,
            role: response.data.role,
          },
          isAuthenticated: true,
          isLoading: false,
          points: 6, // Новые пользователи получают 6 баллов при регистрации
          avatar: null,
        })
        return { success: true, error: null }
      }
    }
    
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      isLoading: false,
      points: 0,
      avatar: null,
    }))
    return { success: false, error: response.error || 'Неизвестная ошибка' }
  }, [])

  const logout = useCallback(async () => {
    setIsLoggingOut(true) // Устанавливаем флаг logout
    
    try {
      // Сначала пытаемся сделать logout на сервере
      await apiClient.logoutWithServer()
    } catch (error) {
      // Если сервер недоступен, все равно делаем локальный logout
      console.warn('Ошибка при logout на сервере:', error)
    }
    
    // Локальный logout (удаление токена и очистка состояния)
    apiClient.logout()
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      points: 0,
      avatar: null,
    })
    
    // Сбрасываем флаги инициализации для возможности повторной проверки при следующем входе
    hasInitializedRef.current = false
    isCheckingAuthRef.current = false
    
    // Сбрасываем флаг через небольшую задержку
    setTimeout(() => setIsLoggingOut(false), 1000)
  }, [])

  const setBalance = useCallback((newBalance: number) => {
    setState(prev => ({
      ...prev,
      points: newBalance,
    }))
  }, [])

  const refreshPoints = useCallback(async () => {
    // Защита от одновременных вызовов
    if (isRefreshingPointsRef.current) {
      return
    }
    
    // Debounce: проверяем, не слишком ли рано после последнего вызова
    const now = Date.now()
    const timeSinceLastCall = now - lastRefreshTimeRef.current
    if (timeSinceLastCall < REFRESH_DEBOUNCE_MS) {
      return
    }
    
    if (!state.isAuthenticated || isLoggingOut) {
      return
    }
    
    isRefreshingPointsRef.current = true
    lastRefreshTimeRef.current = now
    
    try {
      const response = await apiClient.getUserPoints()
      if (response.data !== undefined) {
        setState(prev => ({
          ...prev,
          points: response.data || 0,
        }))
      }
    } catch (error) {
      console.error('Ошибка обновления поинтов:', error)
    } finally {
      // Сбрасываем флаг через небольшую задержку, чтобы предотвратить слишком частые вызовы
      setTimeout(() => {
        isRefreshingPointsRef.current = false
      }, 500)
    }
  }, [state.isAuthenticated, isLoggingOut])

  const refreshUserInfo = useCallback(async () => {
    if (state.isAuthenticated && !isLoggingOut) {
      try {
        const [userResponse, avatarResponse] = await Promise.all([
          apiClient.getUserInfo(),
          apiClient.getUserAvatar()
        ])
        if (userResponse.data) {
          setState(prev => ({
            ...prev,
            user: userResponse.data!,
            avatar: avatarResponse.data || null,
          }))
        }
      } catch (error) {
        console.error('Ошибка обновления информации о пользователе:', error)
      }
    }
  }, [state.isAuthenticated, isLoggingOut])

  const isEmailVerified = useCallback(() => {
    return state.user?.emailVerified === true
  }, [state.user?.emailVerified])

  const loginWithTelegram = useCallback(async (telegramData: TelegramAuthRequest) => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    const response = await apiClient.loginWithTelegram(telegramData)
    
    if (response.data) {
      try {
        const [userInfoResponse, pointsResponse, avatarResponse] = await Promise.all([
          apiClient.getUserInfo(),
          apiClient.getUserPoints(),
          apiClient.getUserAvatar()
        ])
        
        if (userInfoResponse.data) {
          setState({
            user: userInfoResponse.data,
            isAuthenticated: true,
            isLoading: false,
            points: pointsResponse.data || 0,
            avatar: avatarResponse.data || null,
          })
          return { success: true, error: null, data: { isNewUser: response.data?.isNewUser } }
        }
      } catch (error) {
        console.error('Ошибка получения данных пользователя после Telegram входа:', error)
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
          points: 0,
          avatar: null,
        }))
        return { success: false, error: 'Ошибка получения данных пользователя' }
      }
    }
    
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      isLoading: false,
      points: 0,
      avatar: null,
    }))
    return { success: false, error: response.error || 'Ошибка входа через Telegram' }
  }, [])

  const linkTelegram = useCallback(async (telegramData: TelegramAuthRequest) => {
    const response = await apiClient.linkTelegram(telegramData)
    
    if (response.data) {
      // Обновляем информацию о пользователе после привязки
      await refreshUserInfo()
      return { success: true, error: null }
    }
    
    return { success: false, error: response.error || 'Ошибка привязки Telegram' }
  }, [refreshUserInfo])

  const unlinkTelegram = useCallback(async () => {
    const response = await apiClient.unlinkTelegram()
    
    if (response.data) {
      // Обновляем информацию о пользователе после отвязки
      await refreshUserInfo()
      return { success: true, error: null }
    }
    
    return { success: false, error: response.error || 'Ошибка отвязки Telegram' }
  }, [refreshUserInfo])

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      loginWithTelegram,
      linkTelegram,
      unlinkTelegram,
      logout,
      refreshPoints,
      setBalance,
      refreshUserInfo,
      isEmailVerified,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}