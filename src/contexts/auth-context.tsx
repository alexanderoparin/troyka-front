"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiClient, LoginRequest, RegisterRequest, UserInfo } from '@/lib/api-client'

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
  logout: () => void
  refreshPoints: () => Promise<void>
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

  // Флаг для предотвращения дублирования запросов в Strict Mode
  const [hasInitialized, setHasInitialized] = useState(false)

  // Проверяем аутентификацию при загрузке
  useEffect(() => {
    if (hasInitialized) return // Предотвращаем повторные вызовы
    
    const checkAuth = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          const [userResponse, pointsResponse, avatarResponse] = await Promise.all([
            apiClient.getUserInfo(),
            apiClient.getUserPoints(),
            apiClient.getUserAvatar()
          ])
          
          if (userResponse.data) {
            setState({
              user: userResponse.data,
              isAuthenticated: true,
              isLoading: false,
              points: pointsResponse.data || 0,
              avatar: avatarResponse.data || null,
            })
          } else {
            // Токен недействителен
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
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
          points: 0,
          avatar: null,
        }))
      }
      
      setHasInitialized(true) // Отмечаем, что инициализация завершена
    }

    checkAuth()
  }, [hasInitialized])

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

  const logout = useCallback(() => {
    apiClient.logout()
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      points: 0,
      avatar: null,
    })
  }, [])

  const refreshPoints = useCallback(async () => {
    if (state.isAuthenticated) {
      try {
        const response = await apiClient.getUserPoints()
        if (response.data !== undefined) {
          setState(prev => ({
            ...prev,
            points: response.data || 0,
          }))
          // Поинты обновлены
        }
      } catch (error) {
        console.error('Ошибка обновления поинтов:', error)
      }
    }
  }, [state.isAuthenticated])

  const refreshUserInfo = useCallback(async () => {
    if (state.isAuthenticated) {
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
  }, [state.isAuthenticated])

  const isEmailVerified = useCallback(() => {
    return state.user?.emailVerified === true
  }, [state.user?.emailVerified])

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      refreshPoints,
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