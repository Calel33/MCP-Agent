import * as React from "react"
import { useState } from "react"
import { Trash2, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { InlineEdit } from "@/components/ui/inline-edit"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ChatItemProps } from "@/types/chat"

export function ChatItem({
  chat,
  isActive,
  onSelect,
  onRename,
  onDelete,
  className
}: ChatItemProps) {
  const [showActions, setShowActions] = useState(false)

  const handleRename = async (name: string) => {
    try {
      await onRename(name)
    } catch (error) {
      throw error // Let InlineEdit handle the error display
    }
  }

  const handleDelete = () => {
    onDelete()
  }

  const handleClick = () => {
    onSelect()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect()
    } else if (e.key === 'Delete') {
      e.preventDefault()
      handleDelete()
    }
  }

  return (
    <div
      className={cn(
        "group relative flex items-center justify-between rounded-lg p-3 transition-all duration-200 cursor-pointer",
        "hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        isActive && "bg-gray-600 shadow-sm border border-gray-500",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      tabIndex={0}
      role="button"
      aria-label={`Chat: ${chat.name}. ${isActive ? 'Currently active.' : 'Click to select.'}`}
    >
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center space-x-2">
          <InlineEdit
            value={chat.name}
            onSave={handleRename}
            placeholder="Chat name..."
            maxLength={100}
            className={cn(
              "flex-1 text-sm font-medium text-gray-200 truncate",
              isActive && "text-white"
            )}
          />
        </div>
        
        {/* Last message preview */}
        {chat.lastMessage && (
          <p className={cn(
            "mt-1 text-xs text-gray-400 truncate",
            isActive && "text-gray-300"
          )}>
            {chat.lastMessage}
          </p>
        )}
        
        {/* Chat metadata */}
        <div className="flex items-center mt-1 space-x-2 text-xs text-gray-500">
          <span>{chat.messageCount} messages</span>
          <span>•</span>
          <span>{new Date(chat.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Action buttons - show on hover or when active */}
      <div className={cn(
        "flex items-center space-x-1 transition-opacity duration-200",
        showActions || isActive ? "opacity-100" : "opacity-0"
      )}>
        {/* More actions button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-600"
          onClick={(e) => {
            e.stopPropagation()
            // Could expand to show more actions in the future
          }}
          aria-label="More actions"
        >
          <MoreHorizontal className="h-3 w-3" />
        </Button>

        {/* Delete button with confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Delete chat: ${chat.name}`}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Chat</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &ldquo;{chat.name}&rdquo;? This action cannot be undone and all messages in this chat will be permanently lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Chat
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
