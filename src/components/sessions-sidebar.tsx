"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { 
  Plus, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  MessageSquare,
  Calendar,
  Image as ImageIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSessionsList } from "@/hooks/use-sessions-list"
import { Session } from "@/lib/api-client"

interface SessionsSidebarProps {
  currentSessionId?: number
  onSessionSelect: (sessionId: number) => void
  onNewSession: () => void
  className?: string
}

export function SessionsSidebar({ 
  currentSessionId, 
  onSessionSelect, 
  onNewSession,
  className 
}: SessionsSidebarProps) {
  const [page, setPage] = useState(0)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [newSessionName, setNewSessionName] = useState("")
  const [renameSessionName, setRenameSessionName] = useState("")
  
  const { toast } = useToast()
  
  const {
    sessions,
    totalPages,
    hasNext,
    isLoading,
    isCreating,
    isRenaming,
    isDeleting,
    error,
    createSession,
    renameSession,
    deleteSession,
  } = useSessionsList(page, 10)

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название сессии",
        variant: "destructive",
      })
      return
    }

    try {
      setPage(0) // Сбрасываем на первую страницу перед созданием
      await createSession({ name: newSessionName.trim() })
      setIsCreateDialogOpen(false)
      setNewSessionName("")
      
      // Небольшая задержка для обновления списка
      setTimeout(() => {
        toast({
          title: "Сессия создана",
          description: `Сессия "${newSessionName.trim()}" успешно создана`,
        })
        onNewSession()
      }, 100)
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать сессию",
        variant: "destructive",
      })
    }
  }

  const handleRenameSession = async () => {
    if (!selectedSession || !renameSessionName.trim()) return

    try {
      await renameSession({
        sessionId: selectedSession.id,
        request: { name: renameSessionName.trim() }
      })
      setIsRenameDialogOpen(false)
      setRenameSessionName("")
      setSelectedSession(null)
      toast({
        title: "Сессия переименована",
        description: `Сессия переименована в "${renameSessionName.trim()}"`,
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось переименовать сессию",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSession = async () => {
    if (!selectedSession) return

    try {
      await deleteSession(selectedSession.id)
      setIsDeleteDialogOpen(false)
      setSelectedSession(null)
      toast({
        title: "Сессия удалена",
        description: `Сессия "${selectedSession.name}" и вся её история удалены`,
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить сессию",
        variant: "destructive",
      })
    }
  }

  const openRenameDialog = (session: Session) => {
    setSelectedSession(session)
    setRenameSessionName(session.name)
    setIsRenameDialogOpen(true)
  }

  const openDeleteDialog = (session: Session) => {
    setSelectedSession(session)
    setIsDeleteDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('ru-RU', { 
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: '2-digit',
        month: '2-digit'
      })
    }
  }

  if (error) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="text-center text-red-500">
          Ошибка загрузки сессий
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className={cn("h-full flex flex-col", className)}>
        {/* Заголовок */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Сессии</h3>
            <Button
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
              disabled={isCreating}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Список сессий */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              Загрузка сессий...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Нет сессий</p>
              <p className="text-sm">Создайте первую сессию</p>
            </div>
          ) : (
            sessions.map((session) => (
              <Card
                key={session.id}
                className={cn(
                  "p-3 cursor-pointer transition-all hover:shadow-md",
                  currentSessionId === session.id && "ring-2 ring-primary"
                )}
                onClick={() => onSessionSelect(session.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {session.name}
                    </h4>
                    
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(session.updatedAt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {session.messageCount} сообщений
                      </Badge>
                      {session.lastImageUrl && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ImageIcon className="h-3 w-3" />
                          <span>Есть изображения</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openRenameDialog(session)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Переименовать
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(session)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="p-2 border-t">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                Назад
              </Button>
              <span className="text-xs text-muted-foreground">
                {page + 1} из {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!hasNext}
              >
                Далее
              </Button>
            </div>
          </div>
        )}
      </Card>

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
              disabled={isCreating || !newSessionName.trim()}
            >
              {isCreating ? "Создание..." : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог переименования */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
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
        <DialogContent>
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
    </>
  )
}
