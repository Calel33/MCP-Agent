# MCP Multi-Agent UI - Beautiful macOS ChatGPT Interface

A stunning macOS-style ChatGPT interface for the Multiple MCP Servers General Purpose Agent, built with Next.js 15, React 19, and custom macOS UI components.

## 🚀 Features

- **🖥️ macOS ChatGPT Interface**: Beautiful ChatGPT-style design with traffic light window controls
- **🎨 Professional Dark Theme**: Sophisticated gray color palette matching macOS aesthetics
- **📱 Sidebar Layout**: Conversation history, user profile, and MCP status monitoring
- **⌨️ Enhanced Input**: Auto-resizing textarea with Enter/Shift+Enter keyboard shortcuts
- **🔄 Smooth Animations**: Typing indicators, auto-scroll behavior, and fluid transitions
- **🎯 Real-time Streaming**: Live AI responses with word-by-word streaming
- **🔧 MCP Integration**: Full integration with MCP Multi-Agent backend and filesystem server
- **📱 Responsive Design**: Desktop-optimized with macOS feel and professional typography
- **⚡ Next.js 15 + React 19**: Latest versions with App Router and Server Components
- **🔒 TypeScript**: Full type safety throughout the application

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **UI Components**: Custom macOS ChatGPT-style React components
- **Styling**: Tailwind CSS with custom macOS design system
- **Typography**: Inter font via Next.js font optimization
- **AI Integration**: AI SDK (`@ai-sdk/react`, `@ai-sdk/rsc`, `@ai-sdk/openai`)
- **MCP Bridge**: `mcp-use` library for MCP server integration
- **Language**: TypeScript with full type safety
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
   Navigate to [http://localhost:3000/chat](http://localhost:3000/chat) for the beautiful macOS ChatGPT interface

## 🎯 Usage

### Beautiful macOS ChatGPT Interface

The application provides a stunning macOS-style ChatGPT interface where you can:

- **🖥️ macOS Window Design**: Traffic light controls and professional dark theme
- **💬 Natural Conversations**: Chat with AI assistant in familiar ChatGPT-style interface
- **⚡ Real-time Streaming**: Watch responses appear word-by-word with typing indicators
- **📱 Sidebar Navigation**: Access conversation history and user profile
- **⌨️ Keyboard Shortcuts**: Enter to send, Shift+Enter for new lines
- **🔄 Auto-scroll**: Messages automatically scroll to bottom with smooth animations
- **🔧 MCP Integration**: Real file operations and tool execution through MCP servers

### Key Components

- **`/chat`**: Beautiful macOS ChatGPT interface with sidebar and conversation history
- **`/api/chat`**: API route handling OpenAI integration and MCP server communication
- **Custom macOS UI**: Traffic light controls, dark theme, and professional typography
- **MCP Integration**: Real-time file operations and tool execution capabilities

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
