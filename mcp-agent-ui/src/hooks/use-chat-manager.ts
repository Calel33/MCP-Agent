import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';
import { ChatStorageService } from '@/lib/chat-storage-service';
import { StoredChat, ChatMessage, UseChatManagerReturn, ChatOperationResult } from '@/types/chat';

// Based on Cline pattern with comprehensive state management and performance optimization
export function useChatManager(): UseChatManagerReturn {
  // Core state using localStorage for persistence
  const [chats, setChats] = useLocalStorage<StoredChat[]>('mcp-agent-chats-list', []);
  const [currentChatId, setCurrentChatId] = useLocalStorage<string | null>('mcp-agent-current-chat', null);
  
  // UI state - start with loading true to prevent hydration mismatch
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Derived state with performance optimization
  const currentChat = useMemo(() => {
    return chats.find(chat => chat.id === currentChatId) || null;
  }, [chats, currentChatId]);

  // Prevent hydration mismatch by ensuring loading state during SSR
  const isHydrated = typeof window !== 'undefined';
  const shouldShowLoading = !isHydrated || isLoading;

  // Initialize chats from storage service on mount - only on client side
  useEffect(() => {
    const initializeChats = async () => {
      // Skip if already initialized or if we're on the server
      if (isInitialized || typeof window === 'undefined') {
        return;
      }

      try {
        setIsLoading(true);
        const storedChats = ChatStorageService.getAllChats();
        const activeChat = ChatStorageService.getActiveChat();
        
        setChats(storedChats);
        setCurrentChatId(activeChat);
        
        // If no chats exist, create a default one
        if (storedChats.length === 0) {
          const result = ChatStorageService.createChat('Welcome Chat');
          if (result.success && result.data) {
            setChats([result.data]);
            setCurrentChatId(result.data.id);
          }
        }
        
        setIsInitialized(true);
      } catch (err) {
        console.error('Error initializing chats:', err);
        setError('Failed to load chats');
      } finally {
        setIsLoading(false);
      }
    };

    initializeChats();
  }, [isInitialized, setChats, setCurrentChatId]); // Include dependencies

  // Sync chats with storage service
  const syncChats = useCallback(() => {
    const storedChats = ChatStorageService.getAllChats();
    setChats(storedChats);
  }, [setChats]);

  // CRUD operations
  const createChat = useCallback(async (name?: string): Promise<ChatOperationResult<StoredChat>> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = ChatStorageService.createChat(name);
      
      if (result.success && result.data) {
        // Update local state
        setChats(prev => [result.data!, ...prev]);
        setCurrentChatId(result.data.id);
        
        // Update storage service active chat
        ChatStorageService.setActiveChat(result.data.id);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create chat';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [setChats, setCurrentChatId]);

  const updateChatName = useCallback(async (id: string, name: string): Promise<ChatOperationResult<StoredChat>> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!name.trim()) {
        return { success: false, error: 'Chat name cannot be empty' };
      }
      
      const result = ChatStorageService.updateChat(id, { name: name.trim() });
      
      if (result.success && result.data) {
        // Update local state
        setChats(prev => prev.map(chat => 
          chat.id === id ? result.data! : chat
        ));
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update chat name';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [setChats]);

  const deleteChat = useCallback(async (id: string): Promise<ChatOperationResult<boolean>> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Prevent deleting the last chat
      if (chats.length <= 1) {
        return { success: false, error: 'Cannot delete the last chat' };
      }
      
      const result = ChatStorageService.deleteChat(id);
      
      if (result.success) {
        // Update local state
        setChats(prev => prev.filter(chat => chat.id !== id));
        
        // If deleting current chat, switch to the most recent remaining chat
        if (currentChatId === id) {
          const remainingChats = chats.filter(chat => chat.id !== id);
          const nextChat = remainingChats[0] || null;
          setCurrentChatId(nextChat?.id || null);
          ChatStorageService.setActiveChat(nextChat?.id || null);
        }
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete chat';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [chats, currentChatId, setChats, setCurrentChatId]);

  const switchToChat = useCallback((id: string) => {
    const chat = chats.find(c => c.id === id);
    if (chat) {
      setCurrentChatId(id);
      ChatStorageService.setActiveChat(id);
      setError(null);
    }
  }, [chats, setCurrentChatId]);

  // Message operations
  const addMessageToCurrentChat = useCallback((message: ChatMessage) => {
    if (!currentChat) return;
    
    const updatedMessages = [...currentChat.messages, message];
    const lastMessage = message.role === 'user' ? message.content : currentChat.lastMessage;
    
    // Update storage
    ChatStorageService.updateChat(currentChat.id, {
      messages: updatedMessages,
      lastMessage,
      messageCount: updatedMessages.length,
    });
    
    // Update local state
    setChats(prev => prev.map(chat => 
      chat.id === currentChat.id 
        ? { 
            ...chat, 
            messages: updatedMessages, 
            lastMessage,
            messageCount: updatedMessages.length,
            updatedAt: new Date().toISOString()
          }
        : chat
    ));
  }, [currentChat, setChats]);

  const getCurrentChatMessages = useCallback((): ChatMessage[] => {
    return currentChat?.messages || [];
  }, [currentChat]);

  const updateChatWithMessages = useCallback((messages: ChatMessage[]) => {
    if (!currentChat) return;
    
    const lastMessage = messages.length > 0 
      ? messages[messages.length - 1].content 
      : '';
    
    // Update storage
    ChatStorageService.updateChat(currentChat.id, {
      messages,
      lastMessage,
      messageCount: messages.length,
    });
    
    // Update local state
    setChats(prev => prev.map(chat => 
      chat.id === currentChat.id 
        ? { 
            ...chat, 
            messages, 
            lastMessage,
            messageCount: messages.length,
            updatedAt: new Date().toISOString()
          }
        : chat
    ));
  }, [currentChat, setChats]);

  // Auto-generate chat name from first user message
  const updateChatNameFromFirstMessage = useCallback((message: ChatMessage) => {
    if (!currentChat || message.role !== 'user' || currentChat.messages.length > 0) return;
    
    const generatedName = ChatStorageService.generateChatName(message.content);
    if (generatedName !== currentChat.name) {
      updateChatName(currentChat.id, generatedName);
    }
  }, [currentChat, updateChatName]);

  // Enhanced addMessageToCurrentChat with auto-naming
  const addMessageToCurrentChatWithNaming = useCallback((message: ChatMessage) => {
    // Auto-generate name from first user message
    updateChatNameFromFirstMessage(message);
    // Add the message
    addMessageToCurrentChat(message);
  }, [addMessageToCurrentChat, updateChatNameFromFirstMessage]);

  // Utility operations
  const exportAllChats = useCallback((): string => {
    return ChatStorageService.exportChats();
  }, []);

  const importChats = useCallback(async (data: string): Promise<ChatOperationResult<number>> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = ChatStorageService.importChats(data);
      
      if (result.success) {
        // Refresh local state
        syncChats();
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to import chats';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [syncChats]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Return the complete interface
  return {
    // Chat data
    chats: isHydrated ? chats : [], // Return empty array during SSR
    currentChatId: isHydrated ? currentChatId : null, // Return null during SSR
    currentChat: isHydrated ? currentChat : null, // Return null during SSR
    
    // CRUD operations
    createChat,
    updateChatName,
    deleteChat,
    switchToChat,
    
    // Message operations (with auto-naming enhancement)
    addMessageToCurrentChat: addMessageToCurrentChatWithNaming,
    getCurrentChatMessages,
    updateChatWithMessages,
    
    // UI state
    isLoading: shouldShowLoading, // Use hydration-safe loading state
    error,
    
    // Utility operations
    exportAllChats,
    importChats,
    clearError,
  };
}
