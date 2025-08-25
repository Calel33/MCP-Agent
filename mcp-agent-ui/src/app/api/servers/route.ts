import { NextRequest, NextResponse } from 'next/server';
import { MCPConfigService } from '@/lib/mcp-config-service';
import { z } from 'zod';

const serverSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['stdio', 'http', 'websocket']),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  url: z.string().url().optional(),
  enabled: z.boolean().default(true),
  timeout: z.number().default(30000),
});

export async function GET() {
  try {
    const servers = await MCPConfigService.getAllServers();
    return NextResponse.json({ success: true, servers });
  } catch (error) {
    console.error('Failed to get servers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve servers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = serverSchema.parse(body);
    
    const newServer = await MCPConfigService.addServer(validatedData);
    
    return NextResponse.json(
      { success: true, server: newServer },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Failed to create server:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create server' },
      { status: 500 }
    );
  }
}
