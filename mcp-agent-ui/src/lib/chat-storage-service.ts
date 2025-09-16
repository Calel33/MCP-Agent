import { StoredChat, ChatStorage, ChatOperationResult } from '@/types/chat';

// Based on Goose LocalMessageStorage pattern with comprehensive error handling and cleanup
export class ChatStorageService {
  private static readonly CONFIG = {
    STORAGE_KEY: 'mcp-agent-chats',
    VERSION: 1,
    MAX_CHATS: 100,
    EXPIRY_DAYS: 90,
    CLEANUP_INTERVAL_DAYS: 7,
  };

  private static readonly DEFAULT_STORAGE: ChatStorage = {
    version: ChatStorageService.CONFIG.VERSION,
    chats: {},
    settings: {
      activeChat: null,
      maxChats: ChatStorageService.CONFIG.MAX_CHATS,
      expiryDays: ChatStorageService.CONFIG.EXPIRY_DAYS,
    },
    metadata: {
      lastCleanup: new Date().toISOString(),
      totalChats: 0,
    },
  };

  // Safe localStorage operations with error handling
  private static safeGetItem(key: string): string | null {
    try {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem(key);
    } catch (error) {
      console.error(`localStorage.getItem error for key "${key}":`, error);
      return null;
    }
  }

  private static safeSetItem(key: string, value: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`localStorage.setItem error for key "${key}":`, error);
      return false;
    }
  }

  // Get storage data with validation and migration
  private static getStorage(): ChatStorage {
    const stored = this.safeGetItem(this.CONFIG.STORAGE_KEY);
    
    if (!stored) {
      return { ...this.DEFAULT_STORAGE };
    }

    try {
      const parsed = JSON.parse(stored) as ChatStorage;
      
      // Version migration if needed
      if (parsed.version !== this.CONFIG.VERSION) {
        return this.migrateData(parsed);
      }
      
      // Validate structure
      if (!this.validateStorage(parsed)) {
        console.warn('Invalid storage structure, resetting to default');
        return { ...this.DEFAULT_STORAGE };
      }
      
      // Perform cleanup if needed
      this.performCleanupIfNeeded(parsed);
      
      return parsed;
    } catch (error) {
      console.error('Error parsing chat storage:', error);
      return { ...this.DEFAULT_STORAGE };
    }
  }

  // Save storage data
  private static saveStorage(storage: ChatStorage): boolean {
    try {
      const serialized = JSON.stringify(storage);
      return this.safeSetItem(this.CONFIG.STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Error saving chat storage:', error);
      return false;
    }
  }

  // Validate storage structure
  private static validateStorage(storage: unknown): storage is ChatStorage {
    return (
      storage &&
      typeof storage === 'object' &&
      typeof storage.version === 'number' &&
      typeof storage.chats === 'object' &&
      typeof storage.settings === 'object' &&
      typeof storage.metadata === 'object'
    );
  }

  // Migrate data between versions
  private static migrateData(oldStorage: { version?: number }): ChatStorage {
    console.log(`Migrating chat storage from version ${oldStorage.version} to ${this.CONFIG.VERSION}`);
    
    // For now, just reset to default on version mismatch
    // In the future, implement specific migration logic
    return { ...this.DEFAULT_STORAGE };
  }

  // Perform cleanup if needed
  private static performCleanupIfNeeded(storage: ChatStorage): void {
    const lastCleanup = new Date(storage.metadata.lastCleanup);
    const now = new Date();
    const daysSinceCleanup = (now.getTime() - lastCleanup.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceCleanup >= this.CONFIG.CLEANUP_INTERVAL_DAYS) {
      this.cleanup(storage);
    }
  }

  // Cleanup expired chats
  private static cleanup(storage: ChatStorage): void {
    const now = new Date();
    const expiryTime = now.getTime() - (storage.settings.expiryDays * 24 * 60 * 60 * 1000);
    
    let cleanedCount = 0;
    const cleanedChats: Record<string, StoredChat> = {};
    
    Object.values(storage.chats).forEach(chat => {
      const chatTime = new Date(chat.updatedAt).getTime();
      if (chatTime > expiryTime) {
        cleanedChats[chat.id] = chat;
      } else {
        cleanedCount++;
      }
    });
    
    // If we still have too many chats, remove oldest ones
    const chatArray = Object.values(cleanedChats);
    if (chatArray.length > storage.settings.maxChats) {
      chatArray.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      const keepChats = chatArray.slice(0, storage.settings.maxChats);
      
      Object.keys(cleanedChats).forEach(key => delete cleanedChats[key]);
      keepChats.forEach(chat => {
        cleanedChats[chat.id] = chat;
      });
      
      cleanedCount += chatArray.length - keepChats.length;
    }
    
    storage.chats = cleanedChats;
    storage.metadata.lastCleanup = now.toISOString();
    storage.metadata.totalChats = Object.keys(cleanedChats).length;
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired/excess chats`);
      this.saveStorage(storage);
    }
  }

  // Generate unique chat ID
  private static generateChatId(): string {
    return `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate chat name from first message
  static generateChatName(firstMessage: string): string {
    if (!firstMessage.trim()) {
      return `New Chat ${new Date().toLocaleDateString()}`;
    }
    
    // Take first 6 words, max 50 characters
    const words = firstMessage.trim().split(/\s+/).slice(0, 6);
    let name = words.join(' ');
    
    if (name.length > 47) {
      name = name.substring(0, 47) + '...';
    } else if (words.length === 6 && firstMessage.trim().split(/\s+/).length > 6) {
      name += '...';
    }
    
    return name;
  }

  // Core CRUD operations
  static getAllChats(): StoredChat[] {
    const storage = this.getStorage();
    return Object.values(storage.chats).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  static getChat(id: string): StoredChat | null {
    const storage = this.getStorage();
    return storage.chats[id] || null;
  }

  static saveChat(chat: Partial<StoredChat>): ChatOperationResult<StoredChat> {
    try {
      const storage = this.getStorage();
      const now = new Date().toISOString();
      
      let savedChat: StoredChat;
      
      if (chat.id && storage.chats[chat.id]) {
        // Update existing chat
        savedChat = {
          ...storage.chats[chat.id],
          ...chat,
          updatedAt: now,
        };
      } else {
        // Create new chat
        const id = chat.id || this.generateChatId();
        savedChat = {
          id,
          name: chat.name || 'New Chat',
          messages: chat.messages || [],
          createdAt: chat.createdAt || now,
          updatedAt: now,
          lastMessage: chat.lastMessage || '',
          messageCount: chat.messages?.length || 0,
        };
      }
      
      storage.chats[savedChat.id] = savedChat;
      storage.metadata.totalChats = Object.keys(storage.chats).length;
      
      if (this.saveStorage(storage)) {
        return { success: true, data: savedChat };
      } else {
        return { success: false, error: 'Failed to save to localStorage' };
      }
    } catch (error) {
      console.error('Error saving chat:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static updateChat(id: string, updates: Partial<StoredChat>): ChatOperationResult<StoredChat> {
    try {
      const storage = this.getStorage();
      const existingChat = storage.chats[id];
      
      if (!existingChat) {
        return { success: false, error: 'Chat not found' };
      }
      
      const updatedChat: StoredChat = {
        ...existingChat,
        ...updates,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
      };
      
      storage.chats[id] = updatedChat;
      
      if (this.saveStorage(storage)) {
        return { success: true, data: updatedChat };
      } else {
        return { success: false, error: 'Failed to save to localStorage' };
      }
    } catch (error) {
      console.error('Error updating chat:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static deleteChat(id: string): ChatOperationResult<boolean> {
    try {
      const storage = this.getStorage();
      
      if (!storage.chats[id]) {
        return { success: false, error: 'Chat not found' };
      }
      
      delete storage.chats[id];
      storage.metadata.totalChats = Object.keys(storage.chats).length;
      
      // If this was the active chat, clear the active chat
      if (storage.settings.activeChat === id) {
        storage.settings.activeChat = null;
      }
      
      if (this.saveStorage(storage)) {
        return { success: true, data: true };
      } else {
        return { success: false, error: 'Failed to save to localStorage' };
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Utility operations
  static createChat(name?: string): ChatOperationResult<StoredChat> {
    const chatName = name || `New Chat ${new Date().toLocaleDateString()}`;
    
    // Create welcome message for new chat
    const welcomeMessage = {
      id: 'welcome-1',
      role: 'assistant' as const,
      content: "Hello! I'm your MCP Multi-Agent AI assistant. I'm here to provide information, answer questions, assist with tasks, and engage in conversations on a wide range of topics. I can help with file operations, web research, project management, and more through integrated MCP servers. How can I help you today?"
    };
    
    return this.saveChat({ 
      name: chatName, 
      messages: [welcomeMessage],
      lastMessage: "How can I help you today?",
      messageCount: 1
    });
  }

  static exportChats(): string {
    const storage = this.getStorage();
    return JSON.stringify(storage, null, 2);
  }

  static importChats(data: string): ChatOperationResult<number> {
    try {
      const imported = JSON.parse(data) as ChatStorage;
      
      if (!this.validateStorage(imported)) {
        return { success: false, error: 'Invalid chat data format' };
      }
      
      if (this.saveStorage(imported)) {
        const count = Object.keys(imported.chats).length;
        return { success: true, data: count };
      } else {
        return { success: false, error: 'Failed to save imported data' };
      }
    } catch (error) {
      console.error('Error importing chats:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Invalid JSON format' };
    }
  }

  // Active chat management
  static getActiveChat(): string | null {
    const storage = this.getStorage();
    return storage.settings.activeChat;
  }

  static setActiveChat(id: string | null): boolean {
    try {
      const storage = this.getStorage();
      storage.settings.activeChat = id;
      return this.saveStorage(storage);
    } catch (error) {
      console.error('Error setting active chat:', error);
      return false;
    }
  }
}
