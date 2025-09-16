# 🚀 Integrated Implementation Guide: Chat Management Feature

## 📋 **Quick Reference**
- **Goal**: Add create, rename, delete chats with localStorage persistence
- **Stack**: Next.js + React + TypeScript + Radix UI + Tailwind
- **Pattern**: Follow existing MCPConfigService + useMCPServers patterns
- **Integration**: Enhance existing chat page without breaking MCP streaming

## 🎯 **Implementation Steps**

### **Step 1: Types & Storage (30 min)**
```typescript
// src/types/chat.ts
export interface StoredChat {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  lastMessage: string;
}

// src/lib/chat-storage-service.ts
export class ChatStorageService {
  private static readonly STORAGE_KEY = 'mcp-agent-chats';
  private static readonly MAX_CHATS = 100;
  
  static getAllChats(): StoredChat[]
  static saveChat(chat: Partial<StoredChat>): StoredChat
  static deleteChat(id: string): boolean
  static createChat(name?: string): StoredChat
}

// src/hooks/use-local-storage.ts
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void]
```

### **Step 2: Chat Manager Hook (45 min)**
```typescript
// src/hooks/use-chat-manager.ts
export function useChatManager() {
  const [chats, setChats] = useLocalStorage('mcp-agent-chats', []);
  const [currentChatId, setCurrentChatId] = useLocalStorage('current-chat', null);
  
  const currentChat = useMemo(() => chats.find(c => c.id === currentChatId), [chats, currentChatId]);
  
  const createChat = useCallback((name?: string) => {
    const newChat = ChatStorageService.createChat(name);
    setChats(prev => [...prev, newChat]);
    setCurrentChatId(newChat.id);
    return newChat;
  }, [setChats, setCurrentChatId]);
  
  // ... other CRUD operations
  
  return { chats, currentChat, createChat, updateChatName, deleteChat, switchToChat };
}
```

### **Step 3: UI Components (60 min)**
```typescript
// src/components/ui/inline-edit.tsx
export function InlineEdit({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  
  const handleSave = () => {
    if (editValue.trim() && editValue !== value) onSave(editValue.trim());
    setEditing(false);
  };
  
  return editing ? (
    <input value={editValue} onChange={e => setEditValue(e.target.value)} 
           onKeyDown={e => e.key === 'Enter' ? handleSave() : e.key === 'Escape' && setEditing(false)}
           onBlur={handleSave} autoFocus />
  ) : (
    <span onClick={() => setEditing(true)}>{value}</span>
  );
}

// src/components/chat/ChatList.tsx
export function ChatList({ chats, currentChatId, onSelect, onRename, onDelete }: ChatListProps) {
  return (
    <div className="space-y-1">
      {chats.map(chat => (
        <div key={chat.id} className={cn("p-2 rounded hover:bg-gray-700", 
                                         currentChatId === chat.id && "bg-gray-600")}>
          <InlineEdit value={chat.name} onSave={name => onRename(chat.id, name)} />
          <button onClick={() => onDelete(chat.id)} className="ml-2 text-red-400">×</button>
        </div>
      ))}
    </div>
  );
}
```

### **Step 4: Integrate with Chat Page (45 min)**
```typescript
// src/app/chat/page.tsx - Key changes
export default function ChatPage() {
  const { chats, currentChat, createChat, switchToChat, updateChatName, deleteChat, addMessageToCurrentChat } = useChatManager();
  
  // Use current chat messages instead of hardcoded
  const messages = currentChat?.messages || [];
  
  // Enhanced handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    // ... existing logic ...
    
    // After successful message exchange
    if (currentChat) {
      addMessageToCurrentChat(userMessageObj);
      addMessageToCurrentChat(assistantMessageObj);
    }
  };
  
  // Enhanced sidebar
  const renderSidebar = () => (
    <div className="w-64 bg-gray-800 flex flex-col">
      {/* New Chat Button */}
      <button onClick={createChat} className="m-4 p-2 border rounded hover:bg-gray-700">
        + New chat
      </button>
      
      {/* Chat List */}
      <ChatList 
        chats={chats}
        currentChatId={currentChat?.id}
        onSelect={switchToChat}
        onRename={updateChatName}
        onDelete={deleteChat}
      />
      
      {/* Existing MCP Status */}
    </div>
  );
}
```

### **Step 5: Data Migration & Polish (30 min)**
```typescript
// Convert existing hardcoded conversations
const migrateExistingChats = () => {
  const legacy = [
    { title: 'Explaining quantum computing', lastMessage: 'What is quantum computing?' },
    { title: 'Creative writing prompts', lastMessage: 'Give me some writing ideas' }
  ];
  
  if (ChatStorageService.getAllChats().length === 0) {
    legacy.forEach(chat => ChatStorageService.createChat(chat.title));
  }
};

// Add confirmation dialog for delete
const handleDelete = (id: string) => {
  if (confirm('Delete this chat?')) {
    deleteChat(id);
  }
};
```

## ✅ **Validation Checklist**
- [ ] Can create new chats (auto-named from first message)
- [ ] Can rename chats inline (click to edit)
- [ ] Can delete chats (with confirmation)
- [ ] Can switch between chats (preserves messages)
- [ ] All existing MCP streaming works unchanged
- [ ] Data persists across browser sessions
- [ ] Cross-tab synchronization works

## 🎯 **Key Patterns from Research**
- **localStorage Hook**: React DevTools pattern with cross-tab sync
- **Class Service**: MCPConfigService pattern for data operations
- **State Management**: Cline pattern with useMemo/useCallback optimization
- **UI Components**: Radix UI patterns with dark theme consistency
- **Error Handling**: Goose pattern with try/catch and fallbacks

## 🚨 **Critical Integration Points**
1. **Preserve MCP Streaming**: Don't modify existing `/api/chat` flow
2. **Message Integration**: Add messages to current chat after streaming
3. **State Consistency**: Use currentChat.messages instead of hardcoded messages
4. **UI Consistency**: Follow existing dark theme and Radix patterns
5. **Performance**: Memoize expensive operations and debounce saves

---

**Total Implementation Time**: ~3.5 hours
**Files to Create/Modify**: 8 files
**Testing**: Create, rename, delete, switch chats + verify MCP streaming works
