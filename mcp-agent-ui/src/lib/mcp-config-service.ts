import fs from 'fs/promises';
import path from 'path';

export interface MCPServer {
  id: string;
  name: string;
  type: 'stdio' | 'http' | 'websocket';
  command?: string;
  args?: string[];
  url?: string;
  enabled: boolean;
  timeout: number;
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

export class MCPConfigService {
  private static readonly CONFIG_PATH = path.join(process.cwd(), 'mcp-config.json');
  private static readonly AGENT_CONFIG_PATH = path.join(process.cwd(), 'mcp-agent.config.json');

  static async getAllServers(): Promise<MCPServer[]> {
    try {
      const config = await this.readConfig();
      return config.servers || [];
    } catch (error) {
      console.error('Error reading servers:', error);
      return [];
    }
  }

  static async getServer(id: string): Promise<MCPServer | null> {
    const servers = await this.getAllServers();
    return servers.find(server => server.id === id) || null;
  }

  static async addServer(serverData: Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt'>): Promise<MCPServer> {
    const servers = await this.getAllServers();
    const newServer: MCPServer = {
      ...serverData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    servers.push(newServer);
    await this.saveConfig({ servers });
    await this.syncAgentConfig();

    return newServer;
  }

  static async updateServer(id: string, updates: Partial<MCPServer>): Promise<MCPServer> {
    const servers = await this.getAllServers();
    const serverIndex = servers.findIndex(server => server.id === id);
    
    if (serverIndex === -1) {
      throw new Error('Server not found');
    }

    servers[serverIndex] = {
      ...servers[serverIndex],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    await this.saveConfig({ servers });
    await this.syncAgentConfig();

    return servers[serverIndex];
  }

  static async deleteServer(id: string): Promise<void> {
    const servers = await this.getAllServers();
    const filteredServers = servers.filter(server => server.id !== id);
    
    if (filteredServers.length === servers.length) {
      throw new Error('Server not found');
    }

    await this.saveConfig({ servers: filteredServers });
    await this.syncAgentConfig();
  }

  static async toggleServer(id: string, enabled: boolean): Promise<MCPServer> {
    return this.updateServer(id, { enabled });
  }

  static async getServerStatuses(): Promise<ServerStatus[]> {
    const servers = await this.getAllServers();
    const statuses: ServerStatus[] = [];

    for (const server of servers) {
      try {
        const status = await this.checkServerHealth(server);
        statuses.push(status);
      } catch (error: unknown) {
        statuses.push({
          id: server.id,
          status: 'error',
          lastChecked: new Date().toISOString(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return statuses;
  }

  private static async checkServerHealth(server: MCPServer): Promise<ServerStatus> {
    const startTime = Date.now();
    
    try {
      if (!server.enabled) {
        return {
          id: server.id,
          status: 'offline',
          lastChecked: new Date().toISOString(),
        };
      }

      if (server.type === 'http' && server.url) {
        const response = await fetch(server.url, {
          method: 'HEAD',
          signal: AbortSignal.timeout(server.timeout),
        });
        
        const responseTime = Date.now() - startTime;
        
        return {
          id: server.id,
          status: response.ok ? 'online' : 'error',
          lastChecked: new Date().toISOString(),
          responseTime,
        };
      }

      // For stdio and websocket, assume online if enabled
      // In a real implementation, you'd check the actual connection
      return {
        id: server.id,
        status: 'online',
        lastChecked: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      };
    } catch (error: unknown) {
      return {
        id: server.id,
        status: 'error',
        lastChecked: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private static async readConfig(): Promise<{ servers: MCPServer[] }> {
    try {
      const data = await fs.readFile(this.CONFIG_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return { servers: [] };
      }
      throw error;
    }
  }

  private static async saveConfig(config: { servers: MCPServer[] }): Promise<void> {
    await fs.writeFile(this.CONFIG_PATH, JSON.stringify(config, null, 2));
  }

  private static async syncAgentConfig(): Promise<void> {
    try {
      const servers = await this.getAllServers();
      const agentConfig = {
        mcpServers: servers.reduce((acc, server) => {
          if (server.enabled) {
            acc[server.name] = {
              type: server.type,
              command: server.command,
              args: server.args,
              url: server.url,
              timeout: server.timeout,
            };
          }
          return acc;
        }, {} as Record<string, unknown>),
        updatedAt: new Date().toISOString(),
      };

      await fs.writeFile(this.AGENT_CONFIG_PATH, JSON.stringify(agentConfig, null, 2));
    } catch (error) {
      console.error('Failed to sync agent config:', error);
    }
  }
}
