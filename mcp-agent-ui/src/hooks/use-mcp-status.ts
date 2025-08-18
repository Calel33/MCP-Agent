'use client';

import { useState, useEffect } from 'react';

interface MCPStatus {
  healthy: boolean;
  status: string;
  agent_initialized?: boolean;
  client_initialized?: boolean;
  llm_initialized?: boolean;
  error?: string;
  timestamp?: string;
}

export function useMCPStatus() {
  const [status, setStatus] = useState<MCPStatus>({
    healthy: false,
    status: 'checking',
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        healthy: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to check status',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkStatus();

    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    status,
    isLoading,
    refresh: checkStatus,
  };
}
