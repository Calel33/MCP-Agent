'use client';

import { useState } from 'react';
import { useMCPStatus } from '@/hooks/use-mcp-status';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { status: mcpStatus, isLoading: mcpLoading, refresh: refreshMCP } = useMCPStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const userMessageObj: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
    };

    setMessages(prev => [...prev, userMessageObj]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessageObj],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) return;

      let assistantMessage = '';
      const assistantMessageObj: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };

      setMessages(prev => [...prev, assistantMessageObj]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        assistantMessage += chunk;

        // Update the assistant message in real-time
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageObj.id
              ? { ...msg, content: assistantMessage }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MCP Multi-Agent UI</h1>
            <p className="text-sm text-gray-600">AI Assistant with Multiple MCP Server Integration</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* MCP Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                mcpLoading
                  ? 'bg-yellow-500 animate-pulse'
                  : mcpStatus.healthy
                    ? 'bg-green-500'
                    : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                {mcpLoading
                  ? 'Checking MCP...'
                  : mcpStatus.healthy
                    ? 'MCP Connected'
                    : 'MCP Disconnected'
                }
              </span>
              {!mcpLoading && (
                <button
                  onClick={refreshMCP}
                  className="text-xs text-blue-600 hover:text-blue-800 ml-1"
                  title="Refresh MCP Status"
                >
                  ↻
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to MCP Multi-Agent
              </h2>
              <p className="text-gray-600 mb-6">
                Start a conversation with your AI assistant powered by MCP (Model Context Protocol).
                I can help with file operations, web research, project management, and more through
                integrated MCP servers.
              </p>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <strong className="text-blue-900">📁 File Operations</strong>
                  <p className="text-blue-700">Read, write, and manage files through MCP filesystem server</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <strong className="text-green-900">🔧 Tool Integration</strong>
                  <p className="text-green-700">Real-time tool execution with MCP server capabilities</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <strong className="text-purple-900">🚀 Streaming Responses</strong>
                  <p className="text-purple-700">Live updates with tool execution visibility</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {message.role === 'user' ? (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">U</span>
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">AI</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-3xl px-4 py-3 rounded-lg bg-white border border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">AI</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Ask me anything about your project, code, or research..."
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 ${
                isExpanded ? 'h-32' : 'h-12'
              }`}
              onFocus={() => setIsExpanded(true)}
              onBlur={() => !input?.trim() && setIsExpanded(false)}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input?.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Send'
            )}
          </button>
        </form>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Powered by AI SDK UI • MCP Multi-Agent Backend •
          {mcpStatus.healthy ? (
            <span className="text-green-600">MCP Connected</span>
          ) : (
            <span className="text-red-600">MCP Disconnected</span>
          )}
        </div>
      </div>
    </div>
  );
}
