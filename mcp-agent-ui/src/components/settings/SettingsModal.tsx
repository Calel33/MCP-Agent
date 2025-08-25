'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { ServerList } from './ServerList';
import { useMCPServers } from '@/hooks/use-mcp-servers';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState('servers');
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const { servers, isLoading, error } = useMCPServers();

  const selectedServer = selectedServerId 
    ? servers.find(s => s.id === selectedServerId) 
    : null;

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
            />
          </TabsContent>

          <TabsContent value="add" className="flex-1">
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Add New Server form coming soon...
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
