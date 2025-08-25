'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useMCPServers } from '@/hooks/use-mcp-servers';

interface StatusIndicatorProps {
  serverId: string;
  className?: string;
}

export function StatusIndicator({ serverId, className }: StatusIndicatorProps) {
  const { statuses } = useMCPServers();
  const status = statuses.find(s => s.id === serverId);

  const getStatusIcon = () => {
    switch (status?.status) {
      case 'online':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'offline':
        return <XCircle className="h-3 w-3 text-gray-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'connecting':
        return <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusVariant = () => {
    switch (status?.status) {
      case 'online':
        return 'default' as const;
      case 'offline':
        return 'secondary' as const;
      case 'error':
        return 'destructive' as const;
      case 'connecting':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getTooltipContent = () => {
    if (!status) return 'Status unknown';
    
    let content = `Status: ${status.status}`;
    if (status.lastChecked) {
      content += `\nLast checked: ${new Date(status.lastChecked).toLocaleString()}`;
    }
    if (status.responseTime) {
      content += `\nResponse time: ${status.responseTime}ms`;
    }
    if (status.errorMessage) {
      content += `\nError: ${status.errorMessage}`;
    }
    
    return content;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getStatusVariant()} className={`flex items-center gap-1 ${className}`}>
            {getStatusIcon()}
            {status?.status || 'unknown'}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="whitespace-pre-line">{getTooltipContent()}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
