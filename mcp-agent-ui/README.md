# MCP Multi-Agent UI

A modern web interface for the Multiple MCP Servers General Purpose Agent, built with Next.js 15, React 19, and AI SDK UI elements.

## 🚀 Features

- **Modern AI Chat Interface**: Built with AI SDK UI components for streaming conversations
- **Next.js 15 + React 19**: Latest versions with App Router and Server Components
- **Real-time Streaming**: Powered by AI SDK's `useChat` hook and streaming responses
- **Responsive Design**: Tailwind CSS for mobile-first responsive design
- **MCP Integration Ready**: Prepared for integration with MCP Multi-Agent backend
- **TypeScript**: Full type safety throughout the application

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19 with AI SDK UI elements
- **Styling**: Tailwind CSS v4
- **AI Integration**: AI SDK (`@ai-sdk/react`, `@ai-sdk/rsc`, `@ai-sdk/openai`)
- **MCP Bridge**: `mcp-use` library for MCP server integration
- **Language**: TypeScript
- **Package Manager**: npm

## 📦 Installation

1. **Clone and navigate to the project**:
   ```bash
   cd mcp-agent-ui
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Basic Chat Interface

The application provides a clean, modern chat interface where you can:

- **Start conversations** with the AI assistant
- **Stream responses** in real-time using AI SDK
- **View conversation history** with proper message threading
- **Responsive design** that works on desktop and mobile

### Key Components

- **`/chat`**: Main chat interface with streaming support
- **`/api/chat`**: API route handling OpenAI integration
- **AI SDK Integration**: Real-time streaming with `useChat` hook

## 🔧 Development

### Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts     # Chat API endpoint
│   ├── chat/page.tsx         # Main chat interface
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page (redirects to chat)
│   └── globals.css           # Global styles
```

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔗 Integration with MCP Multi-Agent

This UI is designed to integrate with the existing MCP Multi-Agent backend:

1. **MCP Server Connection**: Ready for `mcp-use` library integration
2. **Tool Integration**: Prepared for real-time tool execution display
3. **Server Monitoring**: Framework for server status monitoring
4. **Streaming Bridge**: Uses `streamEventsToAISDK` for MCP integration

## 🎨 Customization

### Styling

The application uses Tailwind CSS v4 for styling. Key design elements:

- **Color Scheme**: Blue primary with gray neutrals
- **Typography**: System fonts with proper hierarchy
- **Components**: Clean, modern chat bubbles and forms
- **Responsive**: Mobile-first design approach

### AI Configuration

Modify the AI behavior in `src/app/api/chat/route.ts`:

```typescript
const result = streamText({
  model: openai('gpt-4o'),
  messages,
  system: `Your custom system prompt here...`,
});
```

## 📚 Documentation

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [MCP Use Library](https://github.com/dmitryrechkin/mcp-use)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The application can be deployed to any platform supporting Node.js:

- **Netlify**: Use `npm run build` and deploy `out/` folder
- **Railway**: Connect GitHub repository
- **DigitalOcean**: Use App Platform with Node.js buildpack

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for chat functionality | Yes |
| `MCP_SERVER_URL` | URL for MCP server connection | No |
| `MCP_SERVER_ENABLED` | Enable MCP server integration | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the MCP Multi-Agent system and follows the same licensing terms.

---

**Built with ❤️ using Next.js 15, React 19, and AI SDK UI elements**
