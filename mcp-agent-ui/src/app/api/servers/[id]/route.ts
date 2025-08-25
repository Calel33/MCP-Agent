import { NextRequest, NextResponse } from 'next/server';
import { MCPConfigService } from '@/lib/mcp-config-service';

interface RouteParams {
  params: { id: string };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const server = await MCPConfigService.getServer(id);
    if (!server) {
      return NextResponse.json(
        { success: false, error: 'Server not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, server });
  } catch (error) {
    console.error('Failed to get server:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve server' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedServer = await MCPConfigService.updateServer(id, body);
    
    return NextResponse.json({ success: true, server: updatedServer });
  } catch (error) {
    console.error('Failed to update server:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update server' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    await MCPConfigService.deleteServer(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete server:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete server' },
      { status: 500 }
    );
  }
}
