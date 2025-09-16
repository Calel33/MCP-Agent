name: "Chat Rename Feature PRP"
description: |
  Implement inline chat renaming functionality in the MCP Multi-Agent chat application, allowing users to rename chat conversations directly from the sidebar with a smooth, accessible user experience.

## Goal
Add inline chat rename functionality that allows users to rename conversations directly from the chat sidebar using right-click context menu or double-click, with real-time validation, character limits, and proper accessibility support.

## Why
- **User Experience**: Users need to organize and identify their conversations easily
- **Integration**: Seamlessly integrates with existing chat sidebar without disrupting current workflow  
- **Problems Solved**: Currently conversations have generic/hardcoded names, making it difficult to distinguish between different chat sessions

## What
Users can rename chat conversations through:
- Right-click context menu with "Rename" option
- Double-click on chat title for quick edit
- Inline editing with contentEditable
- Real-time character validation (50 char limit)
- Immediate persistence to React state
- Full keyboard accessibility (Enter to save, Escape to cancel)

### Success Criteria
- [ ] Users can rename chats via right-click context menu
- [ ] Double-click activates inline editing mode
- [ ] Character limit validation with real-time feedback
- [ ] Changes persist across page interactions
- [ ] Full keyboard navigation support
- [ ] Smooth animations and visual feedback

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- file: mcp-agent-ui/src/app/chat/page.tsx
  why: Contains current conversation list implementation (lines 226-243), state management patterns, and UI structure
  critical: Conversations are currently hardcoded, need to modify conversation rendering and add state management

- url: https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable
  why: React controlled components pattern for form inputs
  section: Controlled vs uncontrolled components

- doc: React contentEditable best practices
  section: Event handling with onBlur, onInput, onKeyDown
  critical: Avoid managing children with React when using contentEditable, use suppressContentEditableWarning

- file: mcp-agent-ui/src/components/ui/
  why: Existing UI component patterns (Radix UI + Tailwind CSS)
  critical: Follow established design system and component structure
```

### Current Codebase tree
```bash
mcp-agent-ui/
├── src/
│   ├── app/
│   │   └── chat/
│   │       └── page.tsx                 # Main chat interface with sidebar
│   ├── components/
│   │   ├── ui/                         # Radix UI components
│   │   └── settings/                   # Settings components
│   ├── hooks/                          # Custom React hooks
│   ├── lib/                           # Utilities and services
│   └── types/
│       └── mcp.ts                     # Type definitions
```

### Desired Codebase tree with files to be added
```bash
mcp-agent-ui/
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── InlineEdit.tsx         # Reusable inline editing component
│   │   │   ├── ConversationItem.tsx   # Individual conversation list item
│   │   │   └── ContextMenu.tsx        # Right-click context menu
│   │   └── ui/                        # (existing)
│   ├── hooks/
│   │   └── use-conversation-rename.ts  # Custom hook for rename logic
│   └── types/
│       └── chat.ts                    # Chat-specific type definitions
```

### Known Gotchas of our codebase & Library Quirks
```typescript
// CRITICAL: React 19 with Next.js 15 - use latest patterns
// Example: contentEditable requires suppressContentEditableWarning={true}
// Example: Tailwind CSS v4 - use modern class patterns
// Example: TypeScript strict mode enabled - all types must be properly defined

// CRITICAL: Current conversations are hardcoded in state
const [conversations, setConversations] = useState<Conversation[]>([
  { id: '1', title: 'Explaining quantum computing', lastMessage: 'What is quantum computing?' },
  { id: '2', title: 'Creative writing prompts', lastMessage: 'Give me some writing ideas' }
]);

// GOTCHA: Conversation interface only has id, title, lastMessage - may need extension
interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
}
```

## Implementation Blueprint

### Data models and structure

Extend the existing conversation data model to support renaming functionality:
```typescript
// Update existing Conversation interface
interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Add rename-specific types
interface ConversationRenameState {
  editingId: string | null;
  originalTitle: string;
  currentTitle: string;
}

// Validation schema
const validateChatName = (name: string): { isValid: boolean; error?: string } => {
  if (!name.trim()) return { isValid: false, error: "Name cannot be empty" };
  if (name.length > 50) return { isValid: false, error: "Name too long (50 chars max)" };
  return { isValid: true };
};
```

### List of tasks to be completed in order

```yaml
Task 1:
CREATE src/components/chat/InlineEdit.tsx:
  - PATTERN: Use contentEditable with React best practices
  - IMPLEMENT: onBlur save, onKeyDown (Enter/Escape), character validation
  - PRESERVE: Accessibility attributes and keyboard navigation

Task 2:
CREATE src/hooks/use-conversation-rename.ts:
  - MIRROR pattern from: existing hooks in src/hooks/
  - IMPLEMENT: rename state management, validation logic
  - KEEP: TypeScript strict typing and error handling

Task 3:
MODIFY src/app/chat/page.tsx:
  - FIND pattern: "conversations.map((conversation) => ("
  - REPLACE: conversation item rendering with new ConversationItem component
  - PRESERVE: existing conversation state and styling patterns

Task 4:
CREATE src/components/chat/ConversationItem.tsx:
  - EXTRACT: conversation item rendering from page.tsx
  - ADD: inline edit functionality, right-click context menu
  - MAINTAIN: existing hover states and styling

Task 5:
CREATE src/components/chat/ContextMenu.tsx:
  - IMPLEMENT: Portal-based context menu with "Rename" option
  - PATTERN: Follow existing UI component patterns from components/ui/
  - ADD: keyboard navigation and proper positioning

Task 6:
UPDATE src/types/chat.ts:
  - CREATE: new file with chat-specific type definitions
  - MOVE: Conversation interface from page.tsx
  - ADD: rename-related types and validation schemas
```

### Per task pseudocode

```typescript
// Task 1: InlineEdit Component
interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => void;
  onCancel: () => void;
  maxLength?: number;
  isEditing: boolean;
}

const InlineEdit: React.FC<InlineEditProps> = ({ value, onSave, onCancel, maxLength = 50, isEditing }) => {
  // PATTERN: Use contentEditable with suppressContentEditableWarning
  // CRITICAL: Handle onBlur, onKeyDown (Enter saves, Escape cancels)
  // VALIDATION: Real-time character count, prevent invalid input
  // ACCESSIBILITY: proper ARIA labels, role="textbox"
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Save logic with validation
    } else if (e.key === 'Escape') {
      // Cancel and revert
    }
  };
};

// Task 2: Rename Hook
const useConversationRename = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [originalTitle, setOriginalTitle] = useState<string>('');
  
  const startRename = (conversationId: string, currentTitle: string) => {
    // PATTERN: Set editing state, store original for cancel
  };
  
  const saveRename = (newTitle: string) => {
    // VALIDATION: Check title validity
    // UPDATE: conversation in parent state
    // CLEANUP: reset editing state
  };
  
  const cancelRename = () => {
    // REVERT: to original title, clear editing state
  };
  
  return { editingId, startRename, saveRename, cancelRename };
};
```

### Integration Points
```yaml
STATE_MANAGEMENT:
  - modify: page.tsx conversations state
  - pattern: "setConversations(prev => prev.map(...))"
  
STYLING:
  - add to: globals.css or component styles
  - pattern: "Tailwind CSS classes following existing design system"
  
COMPONENTS:
  - integrate: InlineEdit into ConversationItem
  - pattern: "Conditional rendering based on editing state"
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
npx tsc --noEmit                     # TypeScript compilation check
npm run lint                         # ESLint checking
npm run build                        # Next.js build verification

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Component Tests
```typescript
// CREATE __tests__/InlineEdit.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { InlineEdit } from '../InlineEdit';

test('saves on Enter key', () => {
  const onSave = jest.fn();
  render(<InlineEdit value="test" onSave={onSave} onCancel={jest.fn()} isEditing={true} />);
  
  const input = screen.getByRole('textbox');
  fireEvent.keyDown(input, { key: 'Enter' });
  
  expect(onSave).toHaveBeenCalled();
});

test('cancels on Escape key', () => {
  const onCancel = jest.fn();
  render(<InlineEdit value="test" onSave={jest.fn()} onCancel={onCancel} isEditing={true} />);
  
  const input = screen.getByRole('textbox');
  fireEvent.keyDown(input, { key: 'Escape' });
  
  expect(onCancel).toHaveBeenCalled();
});

test('validates character limit', () => {
  const longText = 'a'.repeat(51);
  // Test validation logic
});
```

```bash
# Run and iterate until passing:
npm test -- --testPathPattern=InlineEdit
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Test
```bash
# Start the development server
npm run dev

# Manual testing checklist:
# 1. Right-click on conversation item
# 2. Click "Rename" from context menu
# 3. Edit the title inline
# 4. Press Enter to save
# 5. Press Escape to cancel
# 6. Double-click to quick edit

# Expected: Smooth editing experience with proper validation
```

## Final validation Checklist
- [ ] All TypeScript compilation passes: `npx tsc --noEmit`
- [ ] No linting errors: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Component tests pass: `npm test`
- [ ] Manual testing successful: All interaction patterns work
- [ ] Character limit validation works
- [ ] Keyboard accessibility verified
- [ ] Visual feedback and animations smooth

---

## Anti-Patterns to Avoid
- ❌ Don't use uncontrolled components for contentEditable
- ❌ Don't skip suppressContentEditableWarning with contentEditable
- ❌ Don't modify DOM directly - use React patterns
- ❌ Don't ignore keyboard accessibility requirements
- ❌ Don't hardcode styles - follow existing Tailwind patterns
- ❌ Don't skip validation - always validate user input