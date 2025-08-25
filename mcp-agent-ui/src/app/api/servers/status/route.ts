import { NextResponse } from 'next/server';
import { MCPConfigService } from '@/lib/mcp-config-service';

export async function GET() {
  try {
    const serverStatuses = await MCPConfigService.getServerStatuses();
    
    return NextResponse.json({
      success: true,
      statuses: serverStatuses,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to get server statuses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get server statuses' },
      { status: 500 }
    );
  }
}
