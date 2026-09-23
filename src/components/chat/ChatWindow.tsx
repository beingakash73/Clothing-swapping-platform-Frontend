import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SwapProposal } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';
import { 
  Send, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

interface ChatWindowProps {
  swap: SwapProposal;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ swap }) => {
  const { 
    currentUser, 
    users, 
    items, 
    messages, 
    sendMessage, 
    acceptSwap, 
    rejectSwap, 
    confirmAgreement, 
    completeSwap 
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const requestedItem = items.find(i => i.id === swap.requestedItemId);
  const offeredItems = items.filter(i => swap.offeredItemIds.includes(i.id));

  const otherUserId = currentUser 
    ? (swap.requesterId === currentUser.id ? swap.receiverId : swap.requesterId)
    : swap.receiverId;
  const otherUser = users.find(u => u.id === otherUserId) || users[0];

  const swapMessages = messages.filter(m => m.swapId === swap.id);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [swapMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(swap.id, inputMessage);
    setInputMessage('');
  };

  const handleQuickReply = (text: string) => {
    sendMessage(swap.id, text);
  };

  const isReceiver = currentUser ? swap.receiverId === currentUser.id : false;

  const quickReplies = [
    'Can we meet at the Community Safe Hub this Saturday?',
    'Happy with this 1-for-1 trade! Ready to confirm agreement.',
    'I have dry-cleaned the garment and packed it safely.',
    'Could you share the tracking number once shipped?'
  ];

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[740px]">
      {/* Pinned Swap Proposal Card Header */}
      <div className="p-4 sm:p-5 bg-stone-50/90 border-b border-stone-200">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Negotiation Thread #{swap.id.slice(-4)}
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-xs text-stone-500">
              Trading with <strong className="text-slate-800 font-semibold">{otherUser.name}</strong>
            </span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              swap.status === 'completed'
                ? 'bg-emerald-100 text-emerald-800'
                : swap.status === 'accepted'
                ? 'bg-blue-100 text-blue-800'
                : swap.status === 'negotiating'
                ? 'bg-purple-100 text-purple-800'
                : swap.status === 'rejected'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {swap.status.replace('_', ' ')}
            </span>

            <span className="text-xs font-bold bg-white px-2 py-0.5 rounded-md border border-stone-200 text-forest-800">
              {swap.fairnessScore}% Fair Match
            </span>
          </div>
        </div>

        {/* Garment Exchange Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Requested Item */}
          {requestedItem && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs">
              <img
                src={requestedItem.images[0]}
                alt={requestedItem.title}
                className="w-12 h-14 rounded-lg object-cover ring-1 ring-stone-100 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 block truncate">
                  Target: {requestedItem.brand}
                </span>
                <h4 className="text-xs font-bold text-slate-800 truncate">
                  {requestedItem.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-stone-500 mt-0.5">
                  <span>Size {requestedItem.size}</span>
                  <span className="font-bold text-forest-700">{requestedItem.estimatedSwapValue} pts</span>
                </div>
              </div>
            </div>
          )}

          {/* Offered Items */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs">
            <div className="flex -space-x-4 shrink-0">
              {offeredItems.map(item => (
                <img
                  key={item.id}
                  src={item.images[0]}
                  alt={item.title}
                  className="w-12 h-14 rounded-lg object-cover ring-2 ring-white"
                />
              ))}
            </div>
            <div className="min-w-0 flex-1 pl-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block truncate">
                Offered ({offeredItems.length} item{offeredItems.length > 1 ? 's' : ''})
              </span>
              <h4 className="text-xs font-bold text-slate-800 truncate">
                {offeredItems.map(i => i.title).join(' + ')}
              </h4>
              <div className="flex items-center justify-between text-[11px] text-stone-500 mt-0.5">
                <span>{offeredItems[0]?.brand}</span>
                <span className="font-bold text-forest-700">
                  {offeredItems.reduce((acc, i) => acc + i.estimatedSwapValue, 0)} pts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Exchange Logistics Pill */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600 bg-white/70 p-2 rounded-xl border border-stone-200/70">
          <div className="flex items-center gap-1.5">
            {swap.exchangeMethod === 'local_meetup' ? (
              <>
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-medium">
                  {swap.meetupLocation?.name || 'Local Community Safe Hub'}
                </span>
              </>
            ) : (
              <>
                <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-medium">
                  Courier Delivery (Tracked Carbon-Neutral Parcel)
                </span>
              </>
            )}
          </div>

          {/* Action Button Bar based on status */}
          <div className="flex items-center gap-2">
            {swap.status === 'pending' && isReceiver && (
              <>
                <button
                  onClick={() => acceptSwap(swap.id)}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-forest-800 text-white hover:bg-forest-900 shadow-xs"
                >
                  Accept Offer
                </button>
                <button
                  onClick={() => rejectSwap(swap.id)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Decline
                </button>
              </>
            )}

            {swap.status === 'negotiating' && (
              <button
                onClick={() => confirmAgreement(swap.id)}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-forest-800 text-white hover:bg-forest-900 shadow-xs flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Confirm Deal Agreement</span>
              </button>
            )}

            {swap.status === 'accepted' && (
              <button
                onClick={() => completeSwap(swap.id)}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Mark Swap Completed 🎉</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-stone-50/40">
        {swapMessages.map((msg) => {
          const isSender = currentUser ? msg.senderId === currentUser.id : false;
          const senderUser = users.find(u => u.id === msg.senderId) || currentUser || users[0];

          if (msg.isSystem) {
            return (
              <div key={msg.id} className="flex items-center justify-center my-2">
                <div className="px-4 py-1.5 rounded-full bg-forest-100/70 border border-forest-200 text-forest-900 text-xs font-medium max-w-md text-center shadow-2xs">
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isSender ? 'justify-end' : 'justify-start'}`}
            >
              {!isSender && (
                <img
                  src={senderUser.avatar}
                  alt={senderUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-stone-200 shrink-0 mb-1"
                />
              )}

              <div className={`max-w-[78%] sm:max-w-md space-y-1 ${isSender ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isSender
                      ? 'bg-forest-800 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-stone-200/80 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-stone-400 block px-1">
                  {formatRelativeTime(msg.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Replies */}
      <div className="px-4 py-2 bg-white border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold uppercase text-stone-400 shrink-0">
          Quick replies:
        </span>
        {quickReplies.map((reply, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickReply(reply)}
            className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-forest-50 hover:text-forest-800 text-[11px] text-stone-600 whitespace-nowrap transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-stone-200 flex items-center gap-2">
        <input
          type="text"
          placeholder={`Message ${otherUser.name} about garment condition, meetup spot, or shipping...`}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className={`p-2.5 rounded-2xl font-bold transition-all ${
            inputMessage.trim()
              ? 'bg-forest-800 text-white hover:bg-forest-900 active:scale-95 shadow-sm'
              : 'bg-stone-100 text-stone-300 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
