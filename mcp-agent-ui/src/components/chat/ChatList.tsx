import * as React from "react"
import { Plus, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChatItem } from "./ChatItem"
import { ChatListProps } from "@/types/chat"

export function ChatList({
  chats,
  currentChatId,
  onChatSelect,
  onChatRename,
  onChatDelete,
  onNewChat,
  className
}: ChatListProps) {
  const handleNewChat = () => {
    onNewChat()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleNewChat()
    }
  }

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-sm font-medium text-gray-300 mb-2">No chats yet</h3>
      <p className="text-xs text-gray-500 mb-4">
        Create your first chat to get started
      </p>
      <Button
        onClick={handleNewChat}
        variant="outline"
        size="sm"
        className="text-xs"
      >
        <Plus className="h-3 w-3 mr-1" />
        New Chat
      </Button>
    </div>
  )

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-3 p-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-lg bg-gray-700/30 p-3"
        >
          <div className="h-4 bg-gray-600 rounded mb-2" />
          <div className="h-3 bg-gray-700 rounded w-3/4 mb-1" />
          <div className="h-2 bg-gray-700 rounded w-1/2" />
        </div>
      ))}
    </div>
  )

  return (
    <div 
      className={cn("flex flex-col h-full", className)}
      onKeyDown={handleKeyDown}
    >
      {/* Header with New Chat button */}
      <div className="p-4 border-b border-gray-700">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start text-sm font-medium"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat list content */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="p-2 space-y-1">
            {chats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === currentChatId}
                onSelect={() => onChatSelect(chat.id)}
                onRename={(name) => onChatRename(chat.id, name)}
                onDelete={() => onChatDelete(chat.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with chat count */}
      {chats.length > 0 && (
        <div className="p-3 border-t border-gray-700 text-xs text-gray-500 text-center">
          {chats.length} chat{chats.length !== 1 ? 's' : ''}
          {chats.length >= 90 && (
            <div className="text-yellow-400 mt-1">
              Approaching storage limit
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Export a loading version for use during initialization
export function ChatListLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="p-4 border-b border-gray-700">
        <div className="animate-pulse h-9 bg-gray-700/30 rounded" />
      </div>
      <div className="flex-1">
        <div className="space-y-3 p-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-lg bg-gray-700/30 p-3"
            >
              <div className="h-4 bg-gray-600 rounded mb-2" />
              <div className="h-3 bg-gray-700 rounded w-3/4 mb-1" />
              <div className="h-2 bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Export an error version for error states
export function ChatListError({ 
  error, 
  onRetry, 
  className 
}: { 
  error: string
  onRetry: () => void
  className?: string 
}) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex flex-col items-center justify-center p-6 text-center flex-1">
        <div className="text-red-400 mb-4">⚠️</div>
        <h3 className="text-sm font-medium text-gray-300 mb-2">
          Failed to load chats
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          {error}
        </p>
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          Try Again
        </Button>
      </div>
    </div>
  )
}
