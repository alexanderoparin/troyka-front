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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
import Image from "next/image"

interface StudioSessionsProps {
  currentSessionId?: number
  onSessionSelect: (sessionId: number) => void
  onNewSession: () => void
  className?: string
}

export function StudioSessions({ 
  currentSessionId, 
  onSessionSelect, 
  onNewSession,
  className 
}: StudioSessionsProps) {
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
  } = useSessionsList(page, 20)

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
      await createSession({ name: newSessionName.trim() })
      setIsCreateDialogOpen(false)
      setNewSessionName("")
      toast({
        title: "Сессия создана",
        description: `Сессия "${newSessionName.trim()}" успешно создана`,
      })
      onNewSession()
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
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  if (error) {
    return (
      <div className={cn("p-4", className)}>
        <div className="text-center text-red-500">
          Ошибка загрузки сессий
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn("h-full flex flex-col bg-background/80 backdrop-blur-sm rounded-r-xl border-r border-border/20 shadow-lg", className)}>
        {/* Кнопка создания */}
        <div className="p-1.5 border-b border-border/20">
          <div className="flex justify-center">
            <Button
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
              disabled={isCreating}
              className="h-5 w-5 p-0 rounded-full bg-primary/90 hover:bg-primary shadow-sm border border-primary/30"
            >
              <Plus className="h-2.5 w-2.5 text-primary-foreground" />
            </Button>
          </div>
        </div>

        {/* Сетка сессий в стиле Krea.ai */}
        <div className="flex-1 overflow-y-auto p-1">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-4">
              <div className="text-xs opacity-50">...</div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              <MessageSquare className="h-6 w-6 mx-auto mb-1 opacity-20" />
              <p className="text-xs opacity-50">Нет сессий</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-0.5">
              {sessions.map((session) => (
                <Tooltip key={session.id}>
                    <TooltipTrigger asChild>
                      <Card
                        className={cn(
                          "relative cursor-pointer transition-all hover:shadow-md group border-0 bg-transparent shadow-none p-0",
                          currentSessionId === session.id && "ring-2 ring-blue-500 shadow-lg"
                        )}
                        onClick={() => onSessionSelect(session.id)}
                      >
                        {/* Миниатюра сессии - занимает всю ширину */}
                        <div className="aspect-square relative rounded-xl overflow-hidden">
                          {session.lastImageUrl ? (
                            <Image
                              src={session.lastImageUrl}
                              alt={session.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          
                          {/* Overlay с действиями - только при hover */}
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-white hover:bg-white/20 rounded-full"
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
                            
                            <div className="text-white text-xs">
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{session.messageCount}</span>
                              </div>
                            </div>
                          </div>

                          {/* Индикатор активной сессии */}
                          {currentSessionId === session.id && (
                            <div className="absolute top-1 left-1">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </TooltipTrigger>
                         <TooltipContent side="right" className="max-w-xs z-[9999]">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{session.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(session.updatedAt)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.messageCount} сообщений
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
              ))}
            </div>
          )}
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="p-2 border-t border-border/20">
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="h-6 w-6 p-0 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
              >
                ←
              </Button>
              <span className="text-xs text-muted-foreground">
                {page + 1}/{totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!hasNext}
                className="h-6 w-6 p-0 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
              >
                →
              </Button>
            </div>
          </div>
        )}
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
    </TooltipProvider>
  )
}
