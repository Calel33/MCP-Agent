// Chat Management Types
// Based on research patterns from React DevTools, Cline, and Goose implementations

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface StoredChat {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  lastMessage: string;
  messageCount: number;
}

export interface ChatStorage {
  version: number;
  chats: Record<string, StoredChat>;
  settings: {
    activeChat: string | null;
    maxChats: number;
    expiryDays: number;
  };
  metadata: {
    lastCleanup: string;
    totalChats: number;
  };
}

export interface ChatOperationResult<T = StoredChat> {
  success: boolean;
  data?: T;
  error?: string;
}

// Hook return types
export interface UseChatManagerReturn {
  // Chat data
  chats: StoredChat[];
  currentChatId: string | null;
  currentChat: StoredChat | null;
  
  // CRUD operations
  createChat: (name?: string) => Promise<ChatOperationResult<StoredChat>>;
  updateChatName: (id: string, name: string) => Promise<ChatOperationResult<StoredChat>>;
  deleteChat: (id: string) => Promise<ChatOperationResult<boolean>>;
  switchToChat: (id: string) => void;
  
  // Message operations
  addMessageToCurrentChat: (message: ChatMessage) => void;
  getCurrentChatMessages: () => ChatMessage[];
  updateChatWithMessages: (messages: ChatMessage[]) => void;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Utility operations
  exportAllChats: () => string;
  importChats: (data: string) => Promise<ChatOperationResult<number>>;
  clearError: () => void;
}

// localStorage hook types
export interface UseLocalStorageOptions<T> {
  serializer?: {
    read: (value: string) => T;
    write: (value: T) => string;
  };
  onError?: (error: Error) => void;
  syncAcrossTabs?: boolean;
}

export type UseLocalStorageReturn<T> = [
  T,
  (value: T | ((prev: T) => T)) => void,
  () => void
];

// Component prop types
export interface InlineEditProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export interface ChatItemProps {
  chat: StoredChat;
  isActive: boolean;
  onSelect: () => void;
  onRename: (name: string) => Promise<void>;
  onDelete: () => void;
  className?: string;
}

export interface ChatListProps {
  chats: StoredChat[];
  currentChatId: string | null;
  onChatSelect: (id: string) => void;
  onChatRename: (id: string, name: string) => Promise<void>;
  onChatDelete: (id: string) => void;
  onNewChat: () => void;
  className?: string;
}
