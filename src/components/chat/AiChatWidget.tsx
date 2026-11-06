import React, { useState, useEffect } from 'react';
import { AiChatBox } from './AiChatBox';
import { Bot, Sparkles } from 'lucide-react';

interface AiChatWidgetProps {
  onNavigate?: (view: string, itemId?: string) => void;
}

export const AiChatWidget: React.FC<AiChatWidgetProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnreadHint, setHasUnreadHint] = useState(true);

  // Allow other components to trigger opening the AI chat via custom event
  useEffect(() => {
    const handleOpenAiChat = () => {
      setIsOpen(true);
      setHasUnreadHint(false);
    };

    window.addEventListener('open-ai-chat', handleOpenAiChat);
    return () => {
      window.removeEventListener('open-ai-chat', handleOpenAiChat);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnreadHint(false);
    }
  };

  return (
    <>
      {/* Floating Action Button when closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {hasUnreadHint && (
            <div className="hidden sm:flex items-center gap-1.5 bg-white text-forest-900 border border-forest-200/90 px-3.5 py-1.5 rounded-full shadow-lg text-xs font-semibold animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Looking for clothes? Ask AI!</span>
            </div>
          )}

          <button
            onClick={handleToggle}
            className="group relative flex items-center gap-2.5 bg-gradient-to-r from-forest-900 via-forest-800 to-forest-900 text-white pl-4 pr-5 py-3.5 rounded-full shadow-2xl hover:shadow-forest-900/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-emerald-500/30"
            aria-label="Open AI Assistant"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-forest-950 transition-colors">
                <Bot className="w-4 h-4" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-forest-900 animate-ping" />
            </div>

            <div className="text-left">
              <span className="block text-xs font-bold leading-tight tracking-wide">
                AI Assistant
              </span>
              <span className="block text-[10px] text-emerald-300 font-medium">
                Find Clothes & Swaps
              </span>
            </div>
          </button>
        </div>
      )}

      {/* The AI Chat Box */}
      <AiChatBox
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
};

