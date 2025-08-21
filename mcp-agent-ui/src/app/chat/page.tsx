'use client';

import { useState, useRef, useEffect } from 'react';
import { useMCPStatus } from '@/hooks/use-mcp-status';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your MCP Multi-Agent AI assistant. I'm here to provide information, answer questions, assist with tasks, and engage in conversations on a wide range of topics. I can help with file operations, web research, project management, and more through integrated MCP servers. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: '1', title: 'Explaining quantum computing', lastMessage: 'What is quantum computing?' },
    { id: '2', title: 'Creative writing prompts', lastMessage: 'Give me some writing ideas' }
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { status: mcpStatus, isLoading: mcpLoading, refresh: refreshMCP } = useMCPStatus();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const userMessageObj: ChatMessage = {
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
      const assistantMessageObj: ChatMessage = {
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
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Close sidebar on mobile when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your MCP Multi-Agent AI assistant. I'm here to provide information, answer questions, assist with tasks, and engage in conversations on a wide range of topics. I can help with file operations, web research, project management, and more through integrated MCP servers. How can I help you today?"
    }]);
  };

  return (
    <div className="h-screen w-screen bg-[#1E1E1E] overflow-hidden relative">
      <div className="w-full h-full bg-[#1E1E1E] overflow-hidden relative">
        {/* Window Controls Bar */}
        <div className="h-6 bg-[#2A2A2A] flex items-center px-3">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* App Content */}
        <div className="flex h-[calc(100%-1.5rem)]">
          {/* Sidebar */}
          <div className={`
            w-64 sm:w-72 bg-gray-800 flex flex-col border-r border-gray-700 transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:static lg:z-auto
            fixed inset-y-0 left-0 z-50
            max-w-[80vw] sm:max-w-none
          `}>
            {/* Mobile Close Button */}
            <div className="lg:hidden p-4 border-b border-gray-700">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="w-full flex items-center justify-center rounded-md border border-gray-600 px-3 py-2 text-sm font-medium hover:bg-gray-700 text-white"
              >
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Close
              </button>
            </div>

            {/* New Chat Button */}
            <div className="p-4">
              <button
                onClick={clearChat}
                className="w-full flex items-center justify-between rounded-md border border-gray-600 px-3 py-2 text-sm font-medium hover:bg-gray-700 text-white"
              >
                <span className="flex items-center">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4.5v15m7.5-7.5h-15"></path>
                  </svg>
                  New chat
                </span>
              </button>
            </div>

            {/* Recent Conversations */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-3 py-2">
                <h3 className="text-xs text-gray-400 font-medium mb-2">Today</h3>
                <div className="space-y-1">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-gray-700 flex items-center justify-between group text-gray-300"
                    >
                      <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        {conversation.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* User Profile */}
            <div className="border-t border-gray-700 pt-2 pb-4">
              <div className="px-3 py-2">
                {/* MCP Status */}
                <div className="mb-2 px-3 py-2 rounded-md bg-gray-700/50">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      mcpLoading
                        ? 'bg-yellow-500 animate-pulse'
                        : mcpStatus.healthy
                          ? 'bg-green-500'
                          : 'bg-red-500'
                    }`}></div>
                    <span className="text-xs text-gray-300">
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
                        className="text-xs text-gray-400 hover:text-gray-200 ml-1"
                        title="Refresh MCP Status"
                      >
                        ↻
                      </button>
                    )}
                  </div>
                </div>

                <button className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-gray-700 flex items-center text-gray-300">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a9 9 0 0 0 5.636-1.968m-11.272 0A9 9 0 0 0 12 21Z"></path>
                    <circle cx="12" cy="9" r="3"></circle>
                  </svg>
                  MCP Multi-Agent
                </button>
                <button className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-gray-700 flex items-center justify-between text-white">
                  <div className="flex items-center">
                    <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                      <span className="text-xs font-medium">U</span>
                    </div>
                    <span>User</span>
                  </div>
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12h.01M12 6h.01M12 18h.01"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Chat Header */}
            <div className="border-b border-gray-700 p-3 sm:p-4 flex items-center justify-between bg-gray-800">
              <div className="flex items-center min-w-0 flex-1">
                {/* Mobile Hamburger Menu */}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden p-2 rounded-md hover:bg-gray-700 text-gray-300 mr-2 sm:mr-3 flex-shrink-0"
                >
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 12h18M3 6h18M3 18h18"></path>
                  </svg>
                </button>
                <span className="font-medium text-white truncate">MCP Multi-Agent</span>
                <span className="ml-2 px-2 py-1 rounded-md bg-gray-700 text-xs text-gray-300 flex-shrink-0">AI</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1.5 rounded-md hover:bg-gray-700 text-gray-300">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5v14m-7-7h14"></path>
                  </svg>
                </button>
                <button className="p-1.5 rounded-md hover:bg-gray-700 text-gray-300">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"></path>
                    <path d="M12 12h.01M12 8h.01M12 16h.01"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div ref={chatMessagesRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-900">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3 ${
                    message.role === 'user' ? 'bg-blue-600' : 'bg-green-600'
                  }`}>
                    {message.role === 'user' ? (
                      <span className="text-xs font-medium text-white">U</span>
                    ) : (
                      <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-13v4h-3v2h3v4h2v-4h3v-2h-3V7h-2z"></path>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-200">
                      <p className="mb-2">
                        <strong>{message.role === 'user' ? 'You' : 'MCP Multi-Agent'}</strong>
                      </p>
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mr-3">
                    <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-13v4h-3v2h3v4h2v-4h3v-2h-3V7h-2z"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-200">
                      <p className="mb-2"><strong>MCP Multi-Agent</strong></p>
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


            {/* Input Area */}
            <div className="p-3 sm:p-4 border-t border-gray-700 bg-gray-800">
              <form onSubmit={handleSubmit} className="relative rounded-lg border border-gray-600 bg-gray-700 shadow-sm">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full p-3 pr-12 text-sm bg-transparent focus:outline-none resize-none text-white min-h-[44px]"
                  rows={1}
                  placeholder="Message MCP Multi-Agent..."
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 bottom-2 p-2 rounded-md text-gray-400 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"></path>
                  </svg>
                </button>
              </form>
              <div className="mt-2 text-xs text-center text-gray-400 px-2">
                MCP Multi-Agent can make mistakes. Consider checking important information.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
