import { NextResponse } from 'next/server';
import { MCPChatService } from '@/lib/mcp-chat-service';

export async function GET() {
  try {
    const mcpService = new MCPChatService();
    const healthStatus = await mcpService.getHealthStatus();

    const status = healthStatus.healthy ? 200 : 503;

    return new Response(JSON.stringify({
      timestamp: new Date().toISOString(),
      ...healthStatus,
    }), {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Log the full error server-side
    console.error('Health check error:', error instanceof Error ? error.stack || error.message : error);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      service: 'MCP Chat Service',
      status: 'error',
      healthy: false,
      error: 'Internal server error',
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }
}
