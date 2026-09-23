import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRelativeTime } from '../utils/formatters';
import { 
  ArrowLeftRight, 
  MessageSquare, 
  MapPin, 
  Truck,
  ChevronRight
} from 'lucide-react';

interface SwapsPageProps {
  onNavigate: (view: string, itemId?: string) => void;
  onSelectSwapForChat: (swapId: string) => void;
}

export const SwapsPage: React.FC<SwapsPageProps> = ({ 
  onNavigate, 
  onSelectSwapForChat 
}) => {
  const { currentUser, swaps, items, users, acceptSwap, rejectSwap, isAuthenticated } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'negotiating' | 'completed'>('all');

  if (!currentUser || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-16 text-center max-w-lg">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center mx-auto">
            <ArrowLeftRight className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Sign In to View Swaps
          </h2>
          <p className="text-xs text-stone-500">
            Track your outgoing swap proposals, review offers from nearby collectors, and confirm delivered trades.
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

  // Filter swaps relevant to current user
  const mySwaps = swaps.filter(
    s => s.requesterId === currentUser.id || s.receiverId === currentUser.id
  );

  const filteredSwaps = mySwaps.filter(s => {
    if (activeTab === 'pending') return s.status === 'pending';
    if (activeTab === 'negotiating') return s.status === 'negotiating' || s.status === 'accepted';
    if (activeTab === 'completed') return s.status === 'completed';
    return true;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-700">
            <ArrowLeftRight className="w-4 h-4" />
            <span>Circular Barter Tracker</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
            My Clothing Swaps & Offers
          </h1>
          <p className="text-sm text-stone-600">
            Track active proposals, incoming requests, and completed wardrobe rotations.
          </p>
        </div>

        <button
          onClick={() => onNavigate('explore')}
          className="px-5 py-2.5 rounded-xl bg-forest-800 text-white font-bold text-xs hover:bg-forest-900 transition-all self-start sm:self-auto shadow-sm"
        >
          Explore More Clothes to Swap
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs font-semibold">
        {[
          { id: 'all', label: `All Swaps (${mySwaps.length})` },
          { id: 'pending', label: `Pending Requests (${mySwaps.filter(s => s.status === 'pending').length})` },
          { id: 'negotiating', label: `Active In Negotiation (${mySwaps.filter(s => s.status === 'negotiating' || s.status === 'accepted').length})` },
          { id: 'completed', label: `Completed Trades (${mySwaps.filter(s => s.status === 'completed').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-forest-800 text-white shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Swaps List */}
      {filteredSwaps.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-stone-200 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <ArrowLeftRight className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No swaps found in this filter
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Browse other members' closets and send your first swap proposal to initiate a trade!
          </p>
          <button
            onClick={() => onNavigate('explore')}
            className="mt-2 px-4 py-2 bg-forest-800 text-white text-xs font-semibold rounded-xl"
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSwaps.map((swap) => {
            const requestedItem = items.find(i => i.id === swap.requestedItemId);
            const offeredItems = items.filter(i => swap.offeredItemIds.includes(i.id));

            const isRequester = swap.requesterId === currentUser.id;
            const otherUserId = isRequester ? swap.receiverId : swap.requesterId;
            const otherUser = users.find(u => u.id === otherUserId) || users[0];

            return (
              <div
                key={swap.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs hover:border-forest-300 transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
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

                    <span className="font-semibold text-slate-700">
                      {isRequester ? `You proposed to ${otherUser.name}` : `${otherUser.name} proposed to you`}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-stone-400">
                      {formatRelativeTime(swap.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-forest-800 bg-forest-50 border border-forest-200 px-2.5 py-0.5 rounded-md">
                      {swap.fairnessScore}% Fair Match
                    </span>

                    <span className="text-stone-500 flex items-center gap-1">
                      {swap.exchangeMethod === 'local_meetup' ? (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Local Hub</span>
                        </>
                      ) : (
                        <>
                          <Truck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Courier</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Items Exchange Visualization */}
                <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center bg-stone-50/60 p-3.5 rounded-xl border border-stone-100">
                  {/* Item A (Requested) */}
                  <div className="md:col-span-5 flex items-center gap-3">
                    {requestedItem ? (
                      <>
                        <img
                          src={requestedItem.images[0]}
                          alt={requestedItem.title}
                          className="w-14 h-16 rounded-xl object-cover ring-1 ring-stone-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-stone-400 block">
                            Requested Piece ({isRequester ? otherUser.name : 'Your closet'})
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {requestedItem.title}
                          </h4>
                          <span className="text-[11px] text-forest-700 font-semibold">
                            {requestedItem.brand} (Sz {requestedItem.size}) • {requestedItem.estimatedSwapValue} pts
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-stone-400 italic">Item no longer listed</span>
                    )}
                  </div>

                  {/* Swap Arrow Icon */}
                  <div className="md:col-span-1 flex justify-center text-forest-700">
                    <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center">
                      <ArrowLeftRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Item B (Offered) */}
                  <div className="md:col-span-5 flex items-center gap-3">
                    <div className="flex -space-x-3 shrink-0">
                      {offeredItems.map(item => (
                        <img
                          key={item.id}
                          src={item.images[0]}
                          alt={item.title}
                          className="w-14 h-16 rounded-xl object-cover ring-2 ring-white"
                        />
                      ))}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">
                        Offered in Exchange ({isRequester ? 'Your closet' : otherUser.name})
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {offeredItems.map(i => i.title).join(' + ')}
                      </h4>
                      <span className="text-[11px] text-forest-700 font-semibold">
                        Total {offeredItems.reduce((acc, i) => acc + i.estimatedSwapValue, 0)} pts value
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-stone-100 text-xs">
                  <p className="text-stone-500 italic truncate max-w-md">
                    "{swap.initialMessage}"
                  </p>

                  <div className="flex items-center gap-2">
                    {/* Receiver can accept/reject if pending */}
                    {swap.status === 'pending' && !isRequester && (
                      <>
                        <button
                          onClick={() => acceptSwap(swap.id)}
                          className="px-3.5 py-1.5 bg-forest-800 text-white rounded-xl font-bold hover:bg-forest-900 shadow-2xs"
                        >
                          Accept Proposal
                        </button>
                        <button
                          onClick={() => rejectSwap(swap.id)}
                          className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {/* Open chat */}
                    <button
                      onClick={() => {
                        onSelectSwapForChat(swap.id);
                        onNavigate('messages');
                      }}
                      className="px-4 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-forest-700" />
                      <span>Open Negotiation Chat</span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
