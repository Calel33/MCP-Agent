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
  description?: string;
  priority?: number;
  tags?: string[];
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

    // Run all health checks in parallel for better performance
    const statusPromises = servers.map(async (server) => {
      try {
        return await this.checkServerHealth(server);
      } catch (error: unknown) {
        return {
          id: server.id,
          status: 'error' as const,
          lastChecked: new Date().toISOString(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const statuses = await Promise.all(statusPromises);
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
        // Use a much shorter timeout for health checks (3 seconds max)
        const healthCheckTimeout = Math.min(server.timeout, 3000);

        try {
          const response = await fetch(server.url, {
            method: 'HEAD',
            signal: AbortSignal.timeout(healthCheckTimeout),
          });

          const responseTime = Date.now() - startTime;

          return {
            id: server.id,
            status: response.ok ? 'online' : 'error',
            lastChecked: new Date().toISOString(),
            responseTime,
            errorMessage: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
          };
        } catch (fetchError) {
          const responseTime = Date.now() - startTime;
          return {
            id: server.id,
            status: 'error',
            lastChecked: new Date().toISOString(),
            responseTime,
            errorMessage: fetchError instanceof Error ? fetchError.message : 'Network error',
          };
        }
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
      const responseTime = Date.now() - startTime;
      return {
        id: server.id,
        status: 'error',
        lastChecked: new Date().toISOString(),
        responseTime,
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
      
      // Create the CLI-compatible agent config format
      const agentConfig = {
        llm: {
          provider: "openai",
          model: "gpt-4o",
          apiKey: "${OPENAI_API_KEY}",
          temperature: 0.1,
          maxTokens: 4096
        },
        agent: {
          maxSteps: 10,
          timeout: 60000,
          autoInitialize: true,
          verbose: true
        },
        serverManager: {
          enabled: true,
          maxConcurrentServers: 3,
          serverStartupTimeout: 30,
          healthMonitoring: true,
          healthCheckInterval: 30000,
          autoReconnect: true
        },
        servers: servers.map(server => ({
          id: server.id,
          name: server.name,
          description: server.description || `${server.name} server`,
          connectionType: server.type,
          command: server.command,
          args: server.args,
          url: server.url,
          enabled: server.enabled,
          priority: server.priority || 5,
          tags: server.tags || [server.type],
          timeout: server.timeout,
          retry: {
            maxAttempts: 3,
            delayMs: 1500,
            backoffMultiplier: 2
          },
          ...(server.type === 'http' && server.url && {
            preferSse: false,
            requestInit: {
              headers: {
                "Content-Type": "application/json"
              }
            }
          })
        })),
        logging: {
          level: "info",
          format: "text"
        }
      };

      // Also create the simplified mcpServers format for backward compatibility
      const simplifiedConfig = {
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

      // Write both formats
      await fs.writeFile(this.AGENT_CONFIG_PATH, JSON.stringify(agentConfig, null, 2));
      
      // Also create a simplified version for backward compatibility
      const simplifiedPath = path.join(process.cwd(), 'mcp-agent-simple.config.json');
      await fs.writeFile(simplifiedPath, JSON.stringify(simplifiedConfig, null, 2));
      
    } catch (error) {
      console.error('Failed to sync agent config:', error);
    }
  }
}
