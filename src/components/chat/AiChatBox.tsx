import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import {
  Bot,
  Sparkles,
  Send,
  X,
  RotateCcw,
  Maximize2,
  Minimize2,
  Shirt,
  Search,
  ExternalLink,
  ChevronDown,
  Info,
  AlertCircle,
  HelpCircle,
  Tag,
  CheckCircle2
} from 'lucide-react';

export interface AiMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

interface AiChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: string, itemId?: string) => void;
}

export const AiChatBox: React.FC<AiChatBoxProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { currentUser, items } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>(() => [
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `👋 **Welcome to ThreadLoop AI!**\n\nI am your circular fashion assistant powered by Spring AI & MCP Tools. I can search our live clothing inventory, verify sizes, match brands, evaluate swap values, and help you find great zero-cash trades.\n\n*What kind of clothing are you looking for today?*`,
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMessage: AiMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.ai.chat(text);
      const answer = response.answer || "I received an empty response. Please try asking again.";

      const aiMessage: AiMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('AI chat failed:', err);
      const errorMessage =
        err?.data?.error ||
        err?.message ||
        "I'm having trouble connecting to the AI service. If you are running locally, please ensure Ollama (`ollama run qwen2.5:3b`) and backend are online.";

      const aiErrorMessage: AiMessage = {
        id: `assistant-err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Connection Note:** ${errorMessage}`,
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, aiErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation restarted! How can I help you discover clothes or coordinate a swap?`,
        timestamp: new Date(),
      },
    ]);
  };

  const quickPrompts = [
    { label: '🧥 Vintage Jackets', prompt: 'Find vintage jackets or denim coats available for swap' },
    { label: '🌿 Sustainable Tops', prompt: 'Show me cotton or linen tops and shirts' },
    { label: '🏷️ Under $30 Value', prompt: 'Search clothes with maximum swap value 30' },
    { label: '👗 Dresses in size M', prompt: 'Are there any dresses or jumpsuits in size M?' },
  ];

  if (!isOpen) return null;

  // Simple Markdown parser to format bold, bullets, links, item IDs
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');

    return (
      <div className="space-y-1.5 text-xs leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;

          // Bullet points
          const isBullet = line.trim().startsWith('•') || line.trim().startsWith('- ');
          const lineText = isBullet ? line.trim().replace(/^[•\-]\s*/, '') : line;

          // Replace **bold** with bold spans
          const parts = lineText.split(/(\*\*.*?\*\*)/g);

          const content = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-semibold text-stone-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return (
                <em key={pIdx} className="italic text-stone-600">
                  {part.slice(1, -1)}
                </em>
              );
            }
            return part;
          });

          // Check if line mentions an item ID (e.g. ID: item_01 or ID: 67...)
          const idMatch = lineText.match(/ID:\s*([a-zA-Z0-9_\-]+)/);
          const matchedItemId = idMatch ? idMatch[1] : null;
          const foundItem = matchedItemId ? items.find((i) => i.id === matchedItemId) : null;

          return (
            <div key={idx} className={isBullet ? 'flex items-start gap-1.5 pl-1' : ''}>
              {isBullet && <span className="text-emerald-600 font-bold">•</span>}
              <div className="flex-1">
                <span>{content}</span>
                {foundItem && onNavigate && (
                  <button
                    onClick={() => onNavigate('item_detail', foundItem.id)}
                    className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-md bg-forest-50 hover:bg-forest-100 text-forest-700 font-medium text-[11px] transition-colors border border-forest-200"
                  >
                    <Shirt className="w-3 h-3" />
                    <span>View {foundItem.title}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`fixed z-50 transition-all duration-300 flex flex-col ${
        isExpanded
          ? 'inset-3 sm:inset-6 md:inset-10'
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[420px] h-[600px] max-h-[85vh]'
      }`}
    >
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xl overflow-hidden flex flex-col h-full ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-900 text-white p-4 flex items-center justify-between border-b border-forest-700/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-forest-950 shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-forest-900 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif font-bold text-sm text-stone-100 leading-tight">
                  ThreadLoop AI
                </h3>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Assistant
                </span>
              </div>
              <p className="text-[11px] text-stone-300 flex items-center gap-1">
                <span>Spring AI</span>
                <span>•</span>
                <span className="text-emerald-400">MCP Live Tools</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-stone-300">
            <button
              onClick={handleClearHistory}
              title="Reset conversation"
              className="p-1.5 hover:bg-white/10 rounded-xl transition-colors hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Minimize' : 'Maximize'}
              className="p-1.5 hover:bg-white/10 rounded-xl transition-colors hover:text-white"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              title="Close chat"
              className="p-1.5 hover:bg-white/10 rounded-xl transition-colors hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Suggestion Chips Banner */}
        <div className="bg-stone-50 border-b border-stone-200/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider flex items-center gap-1 pl-1 shrink-0">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Suggested:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.prompt)}
              disabled={isLoading}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-forest-50 hover:text-forest-800 hover:border-forest-300 text-stone-600 border border-stone-200 transition-colors shadow-2xs shrink-0"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FAF8F5]/60">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className="shrink-0 mb-0.5">
                  {isUser ? (
                    currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt="User"
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-stone-300"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-forest-800 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                      </div>
                    )
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-forest-800 to-forest-600 text-emerald-300 flex items-center justify-center shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs ${
                    isUser
                      ? 'bg-forest-800 text-white rounded-br-xs'
                      : msg.isError
                      ? 'bg-amber-50 text-amber-900 border border-amber-200 rounded-bl-xs'
                      : 'bg-white text-stone-800 border border-stone-200/80 rounded-bl-xs'
                  }`}
                >
                  {isUser ? (
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    renderMessageContent(msg.text)
                  )}

                  <div
                    className={`mt-1.5 text-[9px] flex items-center gap-1 justify-end ${
                      isUser ? 'text-forest-200' : 'text-stone-400'
                    }`}
                  >
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isUser && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-300" />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-2.5 items-end">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-forest-800 to-forest-600 text-emerald-300 flex items-center justify-center shrink-0 shadow-xs mb-0.5">
                <Bot className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="bg-white border border-stone-200/80 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-stone-500 ml-2 font-medium">
                    ThreadLoop AI is querying closet & tools...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-stone-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about clothing, sizes, swap values, or brands..."
                disabled={isLoading}
                className="w-full text-xs pl-3.5 pr-8 py-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white text-stone-800 placeholder:text-stone-400 transition-all"
              />
              {inputMessage && (
                <button
                  type="button"
                  onClick={() => setInputMessage('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm transition-all"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-1.5 px-1 flex items-center justify-between text-[10px] text-stone-400">
            <span>Powered by Spring AI + Ollama (qwen2.5:3b)</span>
            <span>Zero Cash Barter</span>
          </div>
        </div>
      </div>
    </div>
  );
};

