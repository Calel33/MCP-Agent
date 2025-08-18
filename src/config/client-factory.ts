/**
 * MCP Client factory for creating and managing multiple MCP server connections
 */

import { MCPClient } from 'mcp-use';
import type { MCPServerConfig, MCPMultiAgentConfig } from './types.js';

/**
 * Factory for creating MCP clients with proper configuration
 */
export class MCPClientFactory {
  private config: MCPMultiAgentConfig;
  private client: MCPClient | null = null;

  constructor(config: MCPMultiAgentConfig) {
    this.config = config;
  }

  /**
   * Create a single MCP client configured with all enabled servers
   */
  createClient(): MCPClient {
    if (this.client) {
      return this.client;
    }

    // Convert our server configs to mcp-use format
    const mcpConfig: Record<string, any> = {};

    const enabledServers = this.config.servers.filter(server => server.enabled);

    enabledServers.forEach(server => {
      mcpConfig[server.id] = this.convertServerConfig(server);
    });

    // Create client with all server configurations
    this.client = MCPClient.fromDict(mcpConfig);

    return this.client;
  }

  /**
   * Convert our server config format to mcp-use format
   */
  private convertServerConfig(serverConfig: MCPServerConfig): Record<string, any> {
    const config: Record<string, any> = {
      name: serverConfig.name,
      description: serverConfig.description,
    };

    // Configure based on connection type
    switch (serverConfig.connectionType) {
      case 'stdio':
        config['connector'] = {
          type: 'stdio',
          command: serverConfig.command,
          args: serverConfig.args || [],
          env: serverConfig.env || {},
        };
        break;

      case 'http':
        config['connector'] = {
          type: 'http',
          url: serverConfig.url,
          headers: serverConfig.headers || {},
        };
        break;

      case 'websocket':
        config['connector'] = {
          type: 'websocket',
          url: serverConfig.url,
          headers: serverConfig.headers || {},
        };
        break;

      case 'sse':
        config['connector'] = {
          type: 'sse',
          url: serverConfig.url,
          headers: serverConfig.headers || {},
        };
        break;

      default:
        throw new Error(`Unsupported connection type: ${serverConfig.connectionType}`);
    }

    // Add timeout if specified
    if (serverConfig.timeout) {
      config['connector']['timeout'] = serverConfig.timeout;
    }

    return config;
  }

  /**
   * Create sessions for all enabled servers
   */
  async createAllSessions(autoInitialize: boolean = true): Promise<Record<string, any>> {
    const client = this.createClient();

    try {
      const sessions = await client.createAllSessions(autoInitialize);
      console.log(`Successfully initialized ${Object.keys(sessions).length} server sessions`);
      return sessions;
    } catch (error) {
      console.error('Failed to create server sessions:', error);
      throw error;
    }
  }

  /**
   * Create a session for a specific server
   */
  async createSession(serverId: string, autoInitialize: boolean = true): Promise<any> {
    const client = this.createClient();

    try {
      const session = await client.createSession(serverId, autoInitialize);
      console.log(`Successfully initialized session for server: ${serverId}`);
      return session;
    } catch (error) {
      console.error(`Failed to create session for server ${serverId}:`, error);
      throw error;
    }
  }

  /**
   * Get the underlying MCPClient instance
   */
  getClient(): MCPClient | null {
    return this.client;
  }

  /**
   * Get server configuration by ID
   */
  getServerConfig(serverId: string): MCPServerConfig | undefined {
    return this.config.servers.find(server => server.id === serverId);
  }

  /**
   * Get all enabled server configurations
   */
  getEnabledServers(): MCPServerConfig[] {
    return this.config.servers.filter(server => server.enabled);
  }

  /**
   * Get all server names configured in the client
   */
  getServerNames(): string[] {
    const client = this.createClient();
    return client.getServerNames();
  }

  /**
   * Close all sessions
   */
  async closeAll(): Promise<void> {
    if (this.client) {
      try {
        await this.client.closeAllSessions();
        console.log('All server sessions closed');
      } catch (error) {
        console.error('Error closing sessions:', error);
      }
    }
  }

  /**
   * Close a specific session
   */
  async closeSession(serverId: string): Promise<void> {
    if (this.client) {
      try {
        await this.client.closeSession(serverId);
        console.log(`Session closed for server: ${serverId}`);
      } catch (error) {
        console.error(`Error closing session for ${serverId}:`, error);
      }
    }
  }

  /**
   * Check if a server session is active
   */
  isConnected(serverId: string): boolean {
    if (!this.client) {
      return false;
    }

    const session = this.client.getSession(serverId);
    return session !== null;
  }

  /**
   * Get connection status for all servers
   */
  getConnectionStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};

    this.config.servers.forEach(server => {
      status[server.id] = this.isConnected(server.id);
    });

    return status;
  }

  /**
   * Get all active sessions
   */
  getAllActiveSessions(): Record<string, any> {
    if (!this.client) {
      return {};
    }

    return this.client.getAllActiveSessions();
  }
}
