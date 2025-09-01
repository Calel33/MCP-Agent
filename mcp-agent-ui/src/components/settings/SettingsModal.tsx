'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { ServerList } from './ServerList';
import { ServerEditor } from './ServerEditor';
import { useMCPServers } from '@/hooks/use-mcp-servers';
import { MCPServer } from '@/types/mcp';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState('servers');
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [showAddServerEditor, setShowAddServerEditor] = useState(false);
  const { servers, isLoading, error, addServer } = useMCPServers();

  const selectedServer = selectedServerId 
    ? servers.find(s => s.id === selectedServerId) 
    : null;

  // Handle adding a new server
  const handleAddServer = async (serverData: Partial<MCPServer>) => {
    try {
      await addServer(serverData as Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt'>);
      setShowAddServerEditor(false);
      setActiveTab('servers'); // Switch back to servers list after adding
    } catch (error) {
      console.error('Failed to add server:', error);
      // Error handling is done in the ServerEditor component
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            MCP Server Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList>
            <TabsTrigger value="servers">Current Servers</TabsTrigger>
            <TabsTrigger value="add">Add New Server</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="servers" className="flex-1">
            <ServerList
              servers={servers}
              isLoading={isLoading}
              error={error}
              selectedServerId={selectedServerId}
              onSelectServer={setSelectedServerId}
              onSwitchToAddTab={() => setActiveTab("add")}
            />
          </TabsContent>

          <TabsContent value="add" className="flex-1">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Add New MCP Server</h3>
                <Button 
                  onClick={() => setShowAddServerEditor(true)}
                  className="flex items-center gap-2"
                >
                  Configure Server
                </Button>
              </div>
              
              <div className="rounded-lg border p-6 text-center text-muted-foreground">
                <p className="mb-4">Click &quot;Configure Server&quot; to add a new MCP server to your configuration.</p>
                <div className="text-sm space-y-2">
                  <p><strong>Supported Types:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>stdio:</strong> Local command-line MCP servers</li>
                    <li><strong>http:</strong> HTTP-based MCP servers</li>
                    <li><strong>websocket:</strong> WebSocket-based MCP servers</li>
                  </ul>
                </div>
              </div>

              {/* Server Editor Modal for Adding */}
              <ServerEditor
                server={null} // null indicates creating a new server
                open={showAddServerEditor}
                onOpenChange={setShowAddServerEditor}
                onSave={handleAddServer}
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="flex-1">
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Advanced Settings with JSON editor coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export function SettingsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
      >
        <Settings className="h-4 w-4" />
        Settings
      </Button>
      <SettingsModal open={open} onOpenChange={setOpen} />
    </>
  );
}
