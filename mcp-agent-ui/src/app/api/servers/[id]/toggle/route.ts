import { NextRequest, NextResponse } from 'next/server';
import { MCPConfigService } from '@/lib/mcp-config-service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const { enabled } = await request.json();
    const updatedServer = await MCPConfigService.toggleServer(id, enabled);
    
    return NextResponse.json({ success: true, server: updatedServer });
  } catch (error) {
    console.error('Failed to toggle server:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle server' },
      { status: 500 }
    );
  }
}
