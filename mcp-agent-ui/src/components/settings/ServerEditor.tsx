'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, X, AlertCircle } from 'lucide-react';
import { MCPServer } from '@/types/mcp';
import { z } from 'zod';

// Dynamic import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }
);

// Server validation schema
const serverSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['stdio', 'http', 'websocket'], {
    errorMap: () => ({ message: 'Type must be stdio, http, or websocket' })
  }),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  url: z.string().url().optional(),
  enabled: z.boolean().default(true),
  timeout: z.number().min(1000).max(300000).default(30000),
  description: z.string().optional(),
  version: z.string().optional(),
});

interface ServerEditorProps {
  server?: MCPServer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: Partial<MCPServer>) => Promise<void>;
}

export function ServerEditor({ server, open, onOpenChange, onSave }: ServerEditorProps) {
  const [jsonValue, setJsonValue] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize JSON value when server or modal opens
  useEffect(() => {
    if (open) {
      if (server) {
        // Edit existing server - pre-fill with server data
        const editableData = {
          name: server.name,
          type: server.type,
          command: server.command,
          args: server.args,
          url: server.url,
          enabled: server.enabled,
          timeout: server.timeout,
          description: server.description,
          version: server.version,
        };
        setJsonValue(JSON.stringify(editableData, null, 2));
      } else {
        // Create new server - provide template
        const template = {
          name: "New Server",
          type: "stdio",
          command: "npx",
          args: ["@example/mcp-server"],
          enabled: true,
          timeout: 30000,
          description: "New MCP server configuration"
        };
        setJsonValue(JSON.stringify(template, null, 2));
      }
      setValidationErrors([]);
      setHasUnsavedChanges(false);
    }
  }, [server, open]);

  // Validate JSON and schema
  const validateJson = useCallback((value: string) => {
    const errors: string[] = [];

    // Check JSON syntax
    try {
      const parsed = JSON.parse(value);
      
      // Validate against schema
      const result = serverSchema.safeParse(parsed);
      if (!result.success) {
        result.error.errors.forEach(err => {
          errors.push(`${err.path.join('.')}: ${err.message}`);
        });
      }

      // Additional validation rules
      if (parsed.type === 'stdio' && !parsed.command) {
        errors.push('command: Required for stdio type');
      }
      if ((parsed.type === 'http' || parsed.type === 'websocket') && !parsed.url) {
        errors.push('url: Required for http/websocket type');
      }
    } catch (syntaxError) {
      errors.push(`JSON Syntax Error: ${syntaxError instanceof Error ? syntaxError.message : 'Invalid JSON'}`);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, []);

  // Handle JSON change
  const handleJsonChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setJsonValue(value);
      setHasUnsavedChanges(true);
      validateJson(value);
    }
  }, [validateJson]);

  // Handle save
  const handleSave = async () => {
    if (validationErrors.length > 0) {
      return;
    }

    setIsSaving(true);
    try {
      const parsed = JSON.parse(jsonValue);
      await onSave(parsed);
      setHasUnsavedChanges(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Save failed:', error);
      setValidationErrors(['Save failed: ' + (error instanceof Error ? error.message : 'Unknown error')]);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  // Monaco editor options
  const editorOptions = {
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    tabSize: 2,
    detectIndentation: false,
    insertSpaces: true,
    wordWrap: 'on' as const,
    bracketPairColorization: { enabled: true },
    renderWhitespace: 'selection' as const,
    folding: true,
    lineNumbers: 'on' as const,
    theme: 'vs-dark',
    language: 'json',
    formatOnPaste: true,
    formatOnType: true,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {server ? 'Edit Server Configuration' : 'Create New Server'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {validationErrors.map((error, idx) => (
                    <div key={idx} className="text-sm">{error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Monaco Editor */}
          <div className="flex-1 border rounded-md overflow-hidden">
            <MonacoEditor
              height="100%"
              value={jsonValue}
              onChange={handleJsonChange}
              options={editorOptions}
              theme="vs-dark"
              language="json"
            />
          </div>

          {/* Help Text */}
          <div className="text-sm text-muted-foreground">
            <p><strong>Configuration Guide:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li><strong>stdio:</strong> Requires <code>command</code> and optional <code>args</code></li>
              <li><strong>http/websocket:</strong> Requires <code>url</code></li>
              <li><strong>timeout:</strong> Connection timeout in milliseconds (1000-300000)</li>
              <li><strong>enabled:</strong> Whether the server is active</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={validationErrors.length > 0 || isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
