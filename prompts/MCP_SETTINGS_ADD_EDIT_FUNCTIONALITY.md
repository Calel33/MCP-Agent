# Feature: MCP Settings Interface - Add Server Button & Edit Icon Functionality

## Persona & Stack
- **Persona**: Senior Next.js/React Developer with MCP Integration Expertise
- **Frameworks**: Next.js 15.4.6, React 19.1.0, TypeScript
- **UI Library**: Radix UI, Tailwind CSS 4, Lucide Icons
- **Backend**: Node.js File System API, Zod Validation
- **Architecture**: Component-based with custom hooks pattern

## Goal
Implement two critical functionalities for the MCP Settings Interface:
1. **Add Server Button**: Switch to "Add New Server" tab when clicked (instead of current placeholder)
2. **Edit Icon**: Open a modal with JSON editor pre-filled with selected server configuration for editing

## Scope & Constraints
- **Scope**: Only edit the following files:
  - `mcp-agent-ui/src/components/settings/SettingsModal.tsx`
  - `mcp-agent-ui/src/components/settings/ServerList.tsx`
  - Create new: `mcp-agent-ui/src/components/settings/ServerEditor.tsx` (JSON Editor Modal)
- **Limitations**: No API route changes needed (existing endpoints support these features)
- **Integration**: Must integrate with existing JSON editor patterns and configuration service

## Context
- **Memory Recall**: Recall Session 2025-01-10 MCP Settings Interface implementation for architecture context and existing component patterns. Reference the comprehensive implementation document for technical specifications and Monaco editor integration patterns.
- **Code Injection**: 
  - `@file mcp-agent-ui/src/components/settings/SettingsModal.tsx` - Current modal with tab navigation
  - `@file mcp-agent-ui/src/components/settings/ServerList.tsx` - Current server list with placeholder functionality
  - `@file mcp-agent-ui/src/hooks/use-mcp-servers.ts` - Existing server management hook
  - `@file mcp-agent-ui/src/types/mcp.ts` - Type definitions for server interfaces

## Plan
Create a clear, step-by-step TODO list before implementation:

### Phase 1: Add Server Tab Navigation
- [ ] Modify ServerList component to accept tab navigation prop
- [ ] Update SettingsModal to pass tab change function to ServerList
- [ ] Replace placeholder onClick with actual tab switching functionality
- [ ] Test tab navigation works correctly

### Phase 2: JSON Editor Modal Component
- [ ] Create ServerEditor.tsx component with Monaco Editor integration
- [ ] Implement JSON validation using existing patterns
- [ ] Add save/cancel functionality with API integration
- [ ] Include pre-fill logic for existing server editing vs new server creation

### Phase 3: Edit Icon Integration
- [ ] Modify edit icon onClick to trigger ServerEditor modal
- [ ] Pass selected server data to editor component
- [ ] Implement modal state management in ServerList
- [ ] Test editing functionality with real server data

### Phase 4: Add New Server Integration
- [ ] Integrate ServerEditor with "Add New Server" tab
- [ ] Provide default template for new server creation
- [ ] Ensure consistent UX between edit modal and add tab
- [ ] Test complete add/edit workflow

## Requirements

### Add Server Button Functionality
- **Behavior**: When "Add Server" button clicked, switch to "Add New Server" tab
- **Implementation**: Use existing tab state management in SettingsModal
- **UX**: Smooth tab transition with no modal closing
- **Validation**: No additional validation needed for tab switching

### Edit Icon Functionality  
- **Behavior**: When edit icon clicked, open modal with JSON editor
- **Pre-fill**: Load selected server configuration into editor
- **Validation**: Real-time JSON validation with error messaging
- **Actions**: Save changes to update server, Cancel to close without changes
- **Integration**: Use existing Monaco Editor patterns from implementation document

### JSON Editor Integration
- **Component**: Monaco Editor with JSON syntax highlighting
- **Theme**: VS Dark theme for consistency
- **Validation**: Zod schema validation for server configuration
- **Features**: Auto-formatting, error highlighting, type safety
- **Templates**: Default templates for new servers by type (stdio, http, websocket)

### Server Configuration Schema
```typescript
interface MCPServer {
  id: string;
  name: string;
  type: 'stdio' | 'http' | 'websocket';
  command?: string;
  args?: string[];
  url?: string;
  enabled: boolean;
  timeout: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

## External Libraries
The following libraries are already installed and configured:
- [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) – Monaco Editor React integration for JSON editing
- [zod](https://zod.dev/) – Runtime validation for server configuration
- [@radix-ui/react-dialog](https://radix-ui.com/docs/primitives/components/dialog) – Modal component primitives

## Verification & Output

### Output Expectation
- **Files Created**: 
  - `mcp-agent-ui/src/components/settings/ServerEditor.tsx` - Complete JSON editor modal component
- **Files Modified**:
  - `mcp-agent-ui/src/components/settings/SettingsModal.tsx` - Add tab navigation prop passing
  - `mcp-agent-ui/src/components/settings/ServerList.tsx` - Implement button functionality and edit modal integration
- **Naming Conventions**: Follow existing component patterns (PascalCase, descriptive names)
- **Styling**: Maintain existing macOS-style design consistency with Tailwind classes
- **Interactivity**: Smooth modal transitions, proper focus management, keyboard navigation support

### Verification Plan

#### Manual Testing Checklist
1. **Add Server Button Test**:
   ```bash
   # Steps:
   1. Open Settings Modal (click Settings button in chat sidebar)
   2. Verify "Current Servers" tab is active
   3. Click "Add Server" button
   4. Verify tab switches to "Add New Server"
   5. Verify no console errors
   ```

2. **Edit Icon Test**:
   ```bash
   # Steps:
   1. Open Settings Modal
   2. Hover over server card edit icon
   3. Click edit icon (pencil)
   4. Verify modal opens with JSON editor
   5. Verify server configuration is pre-filled
   6. Test JSON validation (introduce syntax error)
   7. Test save/cancel functionality
   ```

3. **JSON Editor Integration Test**:
   ```bash
   # Steps:
   1. Open edit modal for existing server
   2. Modify server name in JSON
   3. Click Save
   4. Verify server list updates
   5. Verify configuration files are updated
   6. Test error handling (invalid JSON)
   ```

#### API Integration Verification
- **Server Update**: Verify PUT `/api/servers/[id]` endpoint is called correctly
- **Configuration Sync**: Verify both `mcp-config.json` and `mcp-agent.config.json` are updated
- **Error Handling**: Test invalid configurations are rejected with proper error messages
- **Optimistic Updates**: Verify UI updates immediately with server-side confirmation

#### TypeScript Compliance
- **Strict Mode**: All code must compile with TypeScript strict mode
- **Type Safety**: No `any` types, proper interface usage
- **ESLint**: No linting errors or warnings
- **Build Success**: `npm run build` must complete successfully

### Success Criteria
✅ Add Server button switches to correct tab  
✅ Edit icon opens JSON editor modal  
✅ JSON editor pre-fills with server data  
✅ Save functionality updates server configuration  
✅ Cancel functionality closes modal without changes  
✅ Real-time JSON validation works correctly  
✅ UI maintains existing design consistency  
✅ No TypeScript or build errors  
✅ All manual tests pass successfully  
✅ API integration verified working
