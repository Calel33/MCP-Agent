import { NextRequest } from 'next/server';
import { MCPChatService } from '@/lib/mcp-chat-service';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Extract the latest user message
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.role !== 'user') {
      return new Response('Invalid message format', { status: 400 });
    }

    // Initialize MCP Chat Service
    const mcpService = new MCPChatService();

    // Get streaming response from MCP Multi-Agent
    const response = await mcpService.streamChat(latestMessage.content, {
      conversationHistory: messages.slice(0, -1), // All messages except the latest
      enableToolVisibility: true,
      maxSteps: 5,
    });

    return response;
  } catch (error) {
    // Generate unique request ID for error tracking
    const requestId = crypto.randomUUID();

    // Log full error details server-side with request ID
    console.error(`MCP Chat API error [${requestId}]:`, {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    // Return minimal error response without exposing internal details
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        requestId
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    );
  }
}
