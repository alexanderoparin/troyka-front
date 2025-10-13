"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2 } from "lucide-react"

interface DeleteSessionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  sessionName?: string
  messageCount?: number
  isDeleting?: boolean
}

export function DeleteSessionDialog({
  isOpen,
  onClose,
  onConfirm,
  sessionName = "сессия",
  messageCount = 0,
  isDeleting = false,
}: DeleteSessionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-left">
                Удалить сессию
              </DialogTitle>
              <DialogDescription className="text-left">
                Это действие нельзя отменить
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Внимание! Будут удалены:
                </p>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• Сессия "{sessionName}"</li>
                  <li>• {messageCount} сообщений в истории</li>
                  <li>• Все сгенерированные изображения</li>
                  <li>• Вся история диалога</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Если вы уверены, что хотите продолжить, нажмите "Удалить сессию".
            Это действие нельзя отменить.
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Удаление...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить сессию
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
