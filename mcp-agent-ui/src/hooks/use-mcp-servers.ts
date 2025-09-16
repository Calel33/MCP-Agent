'use client';

import { useState, useEffect, useCallback } from 'react';
import { MCPServer, ServerStatus, APIResponse } from '@/types/mcp';

interface UseMCPServersReturn {
  servers: MCPServer[];
  statuses: ServerStatus[];
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  refreshServers: () => Promise<void>;
  addServer: (server: Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MCPServer>;
  updateServer: (id: string, updates: Partial<MCPServer>) => Promise<MCPServer>;
  deleteServer: (id: string) => Promise<void>;
  toggleServer: (id: string, enabled: boolean) => Promise<MCPServer>;
  refreshStatuses: () => Promise<void>;
}

export function useMCPServers(): UseMCPServersReturn {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [statuses, setStatuses] = useState<ServerStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServers = useCallback(async () => {
    try {
      const response = await fetch('/api/servers');
      const data: { success: boolean; servers?: MCPServer[]; error?: string } = await response.json();
      
      if (data.success && data.servers) {
        setServers(data.servers);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch servers');
      }
    } catch (err) {
      setError('Network error');
      console.error('Failed to fetch servers:', err);
    }
  }, []);

  const fetchStatuses = useCallback(async () => {
    let controller: AbortController | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      // Add timeout to prevent hanging requests
      controller = new AbortController();
      timeoutId = setTimeout(() => {
        if (controller && !controller.signal.aborted) {
          controller.abort();
        }
      }, 10000); // 10 second timeout

      const response = await fetch('/api/servers/status', {
        signal: controller.signal,
      });

      // Clear timeout on successful response
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setStatuses(data.statuses);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch server statuses');
      }
    } catch (err) {
      // Clean up timeout on error
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          // Don't treat timeout as an error - it's expected behavior
          console.log('Server status check timed out - continuing with graceful degradation');
          setError(null); // Clear error since timeout is acceptable
        } else {
          setError(err.message);
        }
      } else {
        setError('Network error while fetching server statuses');
      }
      console.error('Failed to fetch statuses:', err);
    }
  }, []);

  const refreshServers = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchServers(), fetchStatuses()]);
    setIsLoading(false);
  }, [fetchServers, fetchStatuses]);

  const addServer = useCallback(async (serverData: Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await refreshServers();
        return data.server;
      } else {
        throw new Error(data.error);
      }
    } finally {
      setIsUpdating(false);
    }
  }, [refreshServers]);

  const updateServer = useCallback(async (id: string, updates: Partial<MCPServer>) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/servers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await refreshServers();
        return data.server;
      } else {
        throw new Error(data.error);
      }
    } finally {
      setIsUpdating(false);
    }
  }, [refreshServers]);

  const deleteServer = useCallback(async (id: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/servers/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await refreshServers();
      } else {
        throw new Error(data.error);
      }
    } finally {
      setIsUpdating(false);
    }
  }, [refreshServers]);

  const toggleServer = useCallback(async (id: string, enabled: boolean) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/servers/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await refreshServers();
        return data.server;
      } else {
        throw new Error(data.error);
      }
    } finally {
      setIsUpdating(false);
    }
  }, [refreshServers]);

  // Initial load
  useEffect(() => {
    refreshServers();
  }, [refreshServers]);

  // Auto-refresh statuses every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchStatuses, 30000);
    return () => clearInterval(interval);
  }, [fetchStatuses]);

  return {
    servers,
    statuses,
    isLoading,
    isUpdating,
    error,
    refreshServers,
    addServer,
    updateServer,
    deleteServer,
    toggleServer,
    refreshStatuses: fetchStatuses,
  };
}
