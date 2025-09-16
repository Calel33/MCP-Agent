'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { MCPServer } from '@/types/mcp';
import { StatusIndicator } from './StatusIndicator';
import { ConfirmDialog } from './ConfirmDialog';
import { ServerEditor } from './ServerEditor';
import { useMCPServers } from '@/hooks/use-mcp-servers';

interface ServerListProps {
  servers: MCPServer[];
  isLoading: boolean;
  error?: string | null;
  selectedServerId?: string | null;
  onSelectServer: (id: string | null) => void;
  onSwitchToAddTab?: () => void;
}

export function ServerList({
  servers,
  isLoading,
  error,
  selectedServerId,
  onSelectServer,
  onSwitchToAddTab,
}: ServerListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingServer, setEditingServer] = useState<MCPServer | null>(null); // NEW STATE
  const { deleteServer, toggleServer, updateServer, isUpdating } = useMCPServers();

  const handleDelete = async (id: string) => {
    await deleteServer(id);
    setDeleteConfirm(null);
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    await toggleServer(id, enabled);
  };

  // Server Editor save handler
  const handleSaveServer = async (serverData: Partial<MCPServer>) => {
    if (editingServer) {
      await updateServer(editingServer.id, serverData);
    }
    setEditingServer(null);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading servers...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">MCP Servers ({servers.length})</h3>
        <Button onClick={onSwitchToAddTab}>
          <Plus className="h-4 w-4 mr-2" />
          Add Server
        </Button>
      </div>

      <div className="grid gap-4 w-full max-w-full overflow-hidden" style={{maxWidth: '100%'}}>
        {servers.map((server) => (
          <Card
            key={server.id}
            className={`cursor-pointer transition-colors overflow-hidden w-full max-w-full ${
              selectedServerId === server.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelectServer(server.id)}
            style={{maxWidth: '100%', width: '100%'}}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4 min-w-0">
                <CardTitle className="flex items-center gap-2 min-w-0 flex-1">
                  <StatusIndicator serverId={server.id} className="flex-shrink-0" />
                  <span className="truncate">{server.name}</span>
                  <Badge variant="outline" className="flex-shrink-0">{server.type}</Badge>
                </CardTitle>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Switch
                    checked={server.enabled}
                    onCheckedChange={(enabled) => handleToggle(server.id, enabled)}
                    disabled={isUpdating}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingServer(server); // Trigger modal with server data
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(server.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="text-sm text-muted-foreground space-y-1 min-w-0 max-w-full">
                {server.type === 'stdio' && server.command && (
                  <div className="force-break-words">
                    <span className="font-medium">Command:</span> {server.command}
                  </div>
                )}
                {server.type === 'http' && server.url && (
                  <div className="force-break-all">
                    <span className="font-medium">URL:</span> {server.url}
                  </div>
                )}
                {server.description && (
                  <div className="force-break-words">
                    <span className="font-medium">Description:</span> {server.description}
                  </div>
                )}
                <div className="force-break-words">
                  <span className="font-medium">Updated:</span> {new Date(server.updatedAt).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Delete Server"
        description={`Are you sure you want to delete "${
          servers.find(s => s.id === deleteConfirm)?.name
        }"? This action cannot be undone.`}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
      />

      <ServerEditor
        server={editingServer}
        open={editingServer !== null}
        onOpenChange={(open) => !open && setEditingServer(null)}
        onSave={handleSaveServer}
      />
    </div>
  );
}
