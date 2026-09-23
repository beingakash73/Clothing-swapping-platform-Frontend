import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChatWindow } from '../components/chat/ChatWindow';
import { MessageSquare, ArrowLeftRight } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters';

interface MessagesPageProps {
  selectedSwapId?: string;
  onNavigate: (view: string) => void;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({ 
  selectedSwapId, 
  onNavigate 
}) => {
  const { currentUser, swaps, users, items, messages, isAuthenticated } = useApp();

  if (!currentUser || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-16 text-center max-w-lg">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Sign In for Negotiation Chat
          </h2>
          <p className="text-xs text-stone-500">
            Communicate directly with other swappers, adjust trade packages, and coordinate safe meetup spots.
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="w-full py-3 px-4 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold shadow-md transition-colors"
          >
            Sign In / Choose Persona →
          </button>
        </div>
      </div>
    );
  }

  // Swaps involving currentUser
  const mySwaps = swaps.filter(
    s => s.requesterId === currentUser.id || s.receiverId === currentUser.id
  );

  const [activeSwapId, setActiveSwapId] = useState<string>(
    selectedSwapId || (mySwaps[0] ? mySwaps[0].id : '')
  );

  const activeSwap = swaps.find(s => s.id === activeSwapId) || mySwaps[0];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Page Heading */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-700">
          <MessageSquare className="w-4 h-4" />
          <span>Real-Time Barter Negotiation</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-slate-900">
          Negotiation Messenger
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Directly coordinate condition inspection, Safe Hub pickup, or courier delivery.
        </p>
      </div>

      {mySwaps.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-stone-200 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No active negotiations yet
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            When you propose a swap or receive a request from another member, a dedicated negotiation thread is opened here.
          </p>
          <button
            onClick={() => onNavigate('explore')}
            className="mt-2 px-4 py-2 bg-forest-800 text-white text-xs font-semibold rounded-xl"
          >
            Explore Garments
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar: Conversations List (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-stone-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Active Swap Threads ({mySwaps.length})
              </span>
            </div>

            <div className="space-y-2 max-h-[660px] overflow-y-auto pr-1">
              {mySwaps.map((swap) => {
                const isSelected = activeSwap && activeSwap.id === swap.id;
                const otherUserId = swap.requesterId === currentUser.id ? swap.receiverId : swap.requesterId;
                const otherUser = users.find(u => u.id === otherUserId) || users[0];
                const targetItem = items.find(i => i.id === swap.requestedItemId);
                const swapMsgs = messages.filter(m => m.swapId === swap.id);
                const lastMsg = swapMsgs[swapMsgs.length - 1];

                return (
                  <div
                    key={swap.id}
                    onClick={() => setActiveSwapId(swap.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-forest-600 bg-forest-50/70 ring-1 ring-forest-600 shadow-xs'
                        : 'border-stone-200/80 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={otherUser.avatar}
                          alt={otherUser.name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-stone-200"
                        />
                        <span className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                          {otherUser.name}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        swap.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : swap.status === 'negotiating'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {swap.status}
                      </span>
                    </div>

                    {/* Garment snippet */}
                    {targetItem && (
                      <div className="flex items-center gap-2 my-1 text-[11px] text-stone-600 font-medium">
                        <ArrowLeftRight className="w-3 h-3 text-forest-700 shrink-0" />
                        <span className="truncate">{targetItem.title}</span>
                      </div>
                    )}

                    {/* Last message preview */}
                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100 mt-1.5">
                      <span className="truncate max-w-[180px]">
                        {lastMsg ? lastMsg.text : 'Negotiation initiated'}
                      </span>
                      <span className="text-[10px] text-stone-400 shrink-0 ml-1">
                        {lastMsg ? formatRelativeTime(lastMsg.timestamp) : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Area: Interactive Chat Window (8 cols) */}
          <div className="lg:col-span-8">
            {activeSwap ? (
              <ChatWindow swap={activeSwap} />
            ) : (
              <div className="p-12 bg-white rounded-3xl border border-stone-200 text-center">
                Select a conversation from the left to start negotiating.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
