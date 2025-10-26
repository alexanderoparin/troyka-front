"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { EmailVerificationBanner } from "@/components/email-verification-banner"
import { StudioSessions } from "@/components/studio-sessions"
import { StudioChat } from "@/components/studio-chat"
import { Header } from "@/components/header"
import { AlertCircle, User, Eye, Menu } from "lucide-react"
import { getPointsText } from "@/lib/grammar"
import Link from "next/link"
import { useState, useCallback, useEffect } from "react"
import { useDefaultSession, useSessionsList } from "@/hooks/use-sessions-list"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function StudioPage() {
  const { user, isAuthenticated, isEmailVerified, points } = useAuth()
  const { toast } = useToast()
  
  // Состояние сессий
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSessionsVisible, setIsSessionsVisible] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newSessionName, setNewSessionName] = useState("")
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [renameSessionName, setRenameSessionName] = useState("")
  
  // Получаем дефолтную сессию
  const { defaultSession, isLoading: isLoadingDefaultSession } = useDefaultSession()
  
  // Хук для работы с сессиями
  const { createSession, isCreating, renameSession, deleteSession, isRenaming, isDeleting } = useSessionsList(0, 20)

  // Устанавливаем дефолтную сессию при загрузке
  useEffect(() => {
    if (defaultSession) {
      // Всегда устанавливаем дефолтную сессию, если она загружена
      setCurrentSessionId(defaultSession.id)
    }
  }, [defaultSession])

  // Обработчик завершения генерации
  const handleGenerationComplete = useCallback((images: string[]) => {
    toast({
      title: "Изображения созданы!",
      description: `Создано ${images.length} изображений`,
    })
  }, [toast])

  // Обработчик выбора сессии
  const handleSessionSelect = useCallback((sessionId: number) => {
    setCurrentSessionId(sessionId)
  }, [])

  // Обработчик создания новой сессии
  const handleNewSession = useCallback(() => {
    // Логика создания новой сессии
  }, [])

  // Обработчик открытия диалога создания сессии
  const handleOpenCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(true)
  }, [])

  // Обработчик создания сессии
  const handleCreateSession = useCallback(() => {
    if (!newSessionName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название сессии",
        variant: "destructive",
      })
      return
    }

    // Создаем сессию через API
    createSession(
      { name: newSessionName.trim() },
      {
        onSuccess: (result) => {
          if (result?.data?.id) {
            setIsCreateDialogOpen(false)
            setNewSessionName("")
            
            // Переключаемся на новую сессию
            setCurrentSessionId(result.data.id)
            
            toast({
              title: "Сессия создана",
              description: `Сессия "${newSessionName.trim()}" успешно создана`,
            })
          } else {
            toast({
              title: "Ошибка",
              description: "Не удалось получить ID созданной сессии",
              variant: "destructive",
            })
          }
        },
        onError: (error) => {
          toast({
            title: "Ошибка",
            description: "Не удалось создать сессию",
            variant: "destructive",
          })
        }
      }
    )
  }, [newSessionName, toast, createSession])

  // Обработчик скрытия блока с сессиями
  const handleHideSessions = useCallback(() => {
    console.log('handleHideSessions called, setting isSessionsVisible to false')
    setIsSessionsVisible(false)
    setIsCreateDialogOpen(true) // Открываем диалог создания сессии
  }, [])

  // Обработчики для переименования и удаления сессий
  const handleOpenRenameDialog = useCallback((session: any) => {
    console.log('Opening rename dialog for session:', session.name)
    setSelectedSession(session)
    setRenameSessionName(session.name)
    setIsRenameDialogOpen(true)
  }, [])

  const handleOpenDeleteDialog = useCallback((session: any) => {
    console.log('Opening delete dialog for session:', session.name)
    setSelectedSession(session)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleRenameSession = useCallback(() => {
    if (!selectedSession || !renameSessionName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название сессии",
        variant: "destructive",
      })
      return
    }

    renameSession(
      { sessionId: selectedSession.id, request: { name: renameSessionName.trim() } },
      {
        onSuccess: () => {
          setIsRenameDialogOpen(false)
          setRenameSessionName("")
          setSelectedSession(null)
          toast({
            title: "Сессия переименована",
            description: `Сессия переименована в "${renameSessionName.trim()}"`,
          })
        },
        onError: (error) => {
          toast({
            title: "Ошибка",
            description: "Не удалось переименовать сессию",
            variant: "destructive",
          })
        }
      }
    )
  }, [selectedSession, renameSessionName, toast, renameSession])

  const handleDeleteSession = useCallback(() => {
    if (!selectedSession) return

    deleteSession(
      selectedSession.id,
      {
        onSuccess: () => {
          setIsDeleteDialogOpen(false)
          setSelectedSession(null)
          toast({
            title: "Сессия удалена",
            description: `Сессия "${selectedSession.name}" удалена`,
          })
        },
        onError: (error) => {
          toast({
            title: "Ошибка",
            description: "Не удалось удалить сессию",
            variant: "destructive",
          })
        }
      }
    )
  }, [selectedSession, toast, deleteSession])

  // Если пользователь не авторизован
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="text-center space-y-6 p-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Добро пожаловать в студию!</h1>
            <p className="text-muted-foreground text-lg">
              Войдите в аккаунт, чтобы начать создавать изображения
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg">Войти</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg">Регистрация</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Ранее блокировали доступ без подтверждения email. По новой политике — доступ открыт.

  // Загрузка дефолтной сессии
  if (isLoadingDefaultSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Eye className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground">Загрузка студии...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen relative">
      {/* Floating Header */}
      <Header />
      {/* Мобильное меню - Все элементы */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} style={{ zIndex: 10000 }}>
          <div className="absolute left-0 top-0 bottom-0 w-40 bg-background border-r flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Заголовок с кнопкой закрытия */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Мои сессии</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            
            {/* История сессий */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <StudioSessions
                  currentSessionId={currentSessionId || undefined}
                  onSessionSelect={(sessionId) => {
                    handleSessionSelect(sessionId)
                    setIsMobileMenuOpen(false)
                  }}
                  onNewSession={() => {
                    handleNewSession()
                    setIsMobileMenuOpen(false)
                  }}
                  onHideSessions={() => {
                    handleHideSessions()
                    setIsMobileMenuOpen(false)
                  }}
                  onRenameSession={handleOpenRenameDialog}
                  onDeleteSession={handleOpenDeleteDialog}
                  className="h-full"
                  isMobile={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Левая панель - Сессии (скрыта на мобильных) */}
      {isSessionsVisible && (
        <div className="hidden md:block w-16 border-r bg-muted/5 flex flex-col">
          <StudioSessions
            currentSessionId={currentSessionId || undefined}
            onSessionSelect={handleSessionSelect}
            onNewSession={handleNewSession}
            onHideSessions={handleHideSessions}
            onRenameSession={handleOpenRenameDialog}
            onDeleteSession={handleOpenDeleteDialog}
            className="h-full"
          />
        </div>
      )}

      {/* Центральная область - Диалог */}
      <div className="flex-1 flex flex-col">
        {/* Мобильная кнопка меню */}
        <div className="md:hidden absolute top-4 left-4" style={{ zIndex: 50 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileMenuOpen(true)}
            className="h-10 w-10 p-0 bg-background/90 backdrop-blur-sm border-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Кнопка показа сессий (только на десктопе, когда сессии скрыты) */}
        {!isSessionsVisible && (
          <div className="hidden md:block absolute top-4 left-4" style={{ zIndex: 50 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSessionsVisible(true)}
              className="h-10 w-10 p-0 bg-background/90 backdrop-blur-sm border-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        <StudioChat
          sessionId={currentSessionId || undefined}
          onGenerationComplete={handleGenerationComplete}
          className="h-full"
        />
      </div>

      {/* Диалог создания сессии */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новую сессию</DialogTitle>
            <DialogDescription>
              Создайте новую сессию для организации ваших генераций
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sessionName">Название сессии</Label>
              <Input
                id="sessionName"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="Введите название сессии"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateSession()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleCreateSession}
              disabled={!newSessionName.trim() || isCreating}
            >
              {isCreating ? "Создание..." : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог переименования */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="z-[10000]">
          <DialogHeader>
            <DialogTitle>Переименовать сессию</DialogTitle>
            <DialogDescription>
              Измените название сессии
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="renameSessionName">Название сессии</Label>
              <Input
                id="renameSessionName"
                value={renameSessionName}
                onChange={(e) => setRenameSessionName(e.target.value)}
                placeholder="Введите новое название"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameSession()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleRenameSession}
              disabled={isRenaming || !renameSessionName.trim()}
            >
              {isRenaming ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="z-[10000]">
          <DialogHeader>
            <DialogTitle>Удалить сессию</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить сессию "{selectedSession?.name}"? 
              Это действие нельзя отменить. Все изображения и история этой сессии будут удалены.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSession}
              disabled={isDeleting}
            >
              {isDeleting ? "Удаление..." : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}