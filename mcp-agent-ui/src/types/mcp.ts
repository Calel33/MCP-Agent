export interface MCPServer {
  id: string;
  name: string;
  type: 'stdio' | 'http' | 'websocket';
  command?: string;
  args?: string[];
  url?: string;
  enabled: boolean;
  timeout: number;
  description?: string;
  priority?: number;
  tags?: string[];
  version?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServerStatus {
  id: string;
  status: 'online' | 'offline' | 'error' | 'connecting';
  lastChecked: string;
  responseTime?: number;
  errorMessage?: string;
}

export interface MCPServerConfig {
  type: 'stdio' | 'http' | 'websocket';
  command?: string;
  args?: string[];
  url?: string;
  timeout?: number;
  env?: Record<string, string>;
  cwd?: string;
}

export interface ServerFormData {
  name: string;
  type: 'stdio' | 'http' | 'websocket';
  command: string;
  args: string;
  url: string;
  enabled: boolean;
  timeout: number;
  description: string;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export interface ServerListResponse {
  success: boolean;
  servers: MCPServer[];
}

export interface ServerStatusResponse {
  success: boolean;
  statuses: ServerStatus[];
  timestamp: string;
}
