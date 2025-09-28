"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiClient, AuthResponse, LoginRequest, RegisterRequest, UserInfo } from '@/lib/api-client'

interface AuthState {
  user: UserInfo | null
  isAuthenticated: boolean
  isLoading: boolean
  points: number
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error: string | null }>
  register: (userData: RegisterRequest) => Promise<{ success: boolean; error: string | null }>
  logout: () => void
  refreshPoints: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    points: 0,
  })

  // Проверяем аутентификацию при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          const [userResponse, pointsResponse] = await Promise.all([
            apiClient.getUserInfo(),
            apiClient.getUserPoints()
          ])
          
          if (userResponse.data) {
            setState({
              user: userResponse.data,
              isAuthenticated: true,
              isLoading: false,
              points: pointsResponse.data || 0,
            })
          } else {
            // Токен недействителен
            apiClient.logout()
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              points: 0,
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
          })
        }
      } else {
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
          points: 0,
        }))
      }
    }

    checkAuth()
  }, [])

  const login = useCallback(async (credentials: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    const response = await apiClient.login(credentials)
    
    if (response.data) {
      // После успешного логина получаем полную информацию о пользователе
      try {
        const [userInfoResponse, pointsResponse] = await Promise.all([
          apiClient.getUserInfo(),
          apiClient.getUserPoints()
        ])
        
        if (userInfoResponse.data) {
          setState({
            user: userInfoResponse.data,
            isAuthenticated: true,
            isLoading: false,
            points: pointsResponse.data || 0,
          })
          return { success: true, error: null }
        }
      } catch (error) {
        // Если не удалось получить информацию о пользователе, используем данные из логина
        setState({
          user: {
            username: response.data.username,
            email: response.data.email,
            firstName: '',
            lastName: '',
            role: response.data.role,
          },
          isAuthenticated: true,
          isLoading: false,
          points: 0,
        })
        return { success: true, error: null }
      }
    }
    
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      isLoading: false,
      points: 0,
    }))
    return { success: false, error: response.error }
  }, [])

  const register = useCallback(async (userData: RegisterRequest) => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    const response = await apiClient.register(userData)
    
    if (response.data) {
      // После успешной регистрации получаем полную информацию о пользователе
      try {
        const [userInfoResponse, pointsResponse] = await Promise.all([
          apiClient.getUserInfo(),
          apiClient.getUserPoints()
        ])
        
        if (userInfoResponse.data) {
          setState({
            user: userInfoResponse.data,
            isAuthenticated: true,
            isLoading: false,
            points: pointsResponse.data || 0,
          })
          return { success: true, error: null }
        }
      } catch (error) {
        // Если не удалось получить информацию о пользователе, используем данные из регистрации
        setState({
          user: {
            username: response.data.username,
            email: response.data.email,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            role: response.data.role,
          },
          isAuthenticated: true,
          isLoading: false,
          points: 6, // Новые пользователи получают 6 баллов при регистрации
        })
        return { success: true, error: null }
      }
    }
    
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      isLoading: false,
      points: 0,
    }))
    return { success: false, error: response.error }
  }, [])

  const logout = useCallback(() => {
    apiClient.logout()
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      points: 0,
    })
  }, [])

  const refreshPoints = useCallback(async () => {
    if (state.isAuthenticated) {
      try {
        const response = await apiClient.getUserPoints()
        if (response.data !== undefined) {
          setState(prev => ({
            ...prev,
            points: response.data,
          }))
          console.log('Поинты обновлены:', response.data)
        }
      } catch (error) {
        console.error('Ошибка обновления поинтов:', error)
      }
    }
  }, [state.isAuthenticated])

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      refreshPoints,
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
