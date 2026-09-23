import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClothingItem, ExchangeMethod, MeetupLocation } from '../../types';
import { MOCK_SWAP_HUBS } from '../../data/mockData';
import { ValueMeter } from '../common/ValueMeter';
import { ConditionBadge } from '../common/ConditionBadge';
import { 
  X, 
  ArrowLeftRight, 
  MapPin, 
  Truck, 
  Check, 
  AlertCircle,
  ShieldCheck 
} from 'lucide-react';

interface SwapProposalModalProps {
  targetItem: ClothingItem | null;
  onClose: () => void;
  onSuccess?: (swapId: string) => void;
}

export const SwapProposalModal: React.FC<SwapProposalModalProps> = ({
  targetItem,
  onClose,
  onSuccess,
}) => {
  const { currentUser, items, proposeSwap, showToast } = useApp();

  // Find user's available closet items
  const myAvailableItems = currentUser 
    ? items.filter(i => i.ownerId === currentUser.id && i.status === 'available')
    : [];

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [exchangeMethod, setExchangeMethod] = useState<ExchangeMethod>('local_meetup');
  const [selectedHub, setSelectedHub] = useState<MeetupLocation>(MOCK_SWAP_HUBS[0]);
  const [proposalMessage, setProposalMessage] = useState<string>('');

  if (!targetItem) return null;

  const toggleItemSelection = (itemId: string) => {
    if (selectedItemIds.includes(itemId)) {
      setSelectedItemIds(selectedItemIds.filter(id => id !== itemId));
    } else {
      setSelectedItemIds([...selectedItemIds, itemId]);
    }
  };

  const selectedItems = items.filter(i => selectedItemIds.includes(i.id));
  const offeredTotalValue = selectedItems.reduce((acc, i) => acc + i.estimatedSwapValue, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Please sign in to propose a swap!');
      return;
    }

    if (selectedItemIds.length === 0) {
      showToast('Please select at least one garment from your closet to offer.');
      return;
    }

    const defaultMsg = proposalMessage.trim() || 
      `Hi ${targetItem.ownerName}! I would love to trade my ${selectedItems.map(i => i.title).join(' & ')} for your ${targetItem.title}.`;

    const newSwap = proposeSwap(
      targetItem.id,
      selectedItemIds,
      exchangeMethod,
      defaultMsg,
      exchangeMethod === 'local_meetup' ? selectedHub : undefined
    );

    if (newSwap && onSuccess) {
      onSuccess(newSwap.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Propose a Clothing Swap
              </h2>
              <p className="text-xs text-stone-500">
                Offering to swap with {targetItem.ownerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Target Item Summary */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-3">
            <img
              src={targetItem.images[0]}
              alt={targetItem.title}
              className="w-16 h-20 rounded-xl object-cover ring-1 ring-stone-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-forest-800 truncate">
                  {targetItem.brand}
                </span>
                <ConditionBadge condition={targetItem.condition} showDot={false} className="text-[10px] py-0" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900 truncate">
                {targetItem.title}
              </h4>
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className="text-stone-500">Size {targetItem.size}</span>
                <span className="font-bold text-forest-800 bg-forest-100/60 px-2 py-0.5 rounded-md">
                  {targetItem.estimatedSwapValue} pts value
                </span>
              </div>
            </div>
          </div>

          {/* Select from closet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                Select Garments from Your Closet to Offer:
              </label>
              <span className="text-xs text-stone-500">
                {selectedItemIds.length} item{selectedItemIds.length === 1 ? '' : 's'} selected
              </span>
            </div>

            {myAvailableItems.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-semibold">Your closet currently has no available garments.</p>
                  <p className="mt-0.5">Please list a piece from your wardrobe first so you have an item to trade!</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {myAvailableItems.map((closetItem) => {
                  const isSelected = selectedItemIds.includes(closetItem.id);
                  return (
                    <div
                      key={closetItem.id}
                      onClick={() => toggleItemSelection(closetItem.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-forest-600 bg-forest-50/50 ring-1 ring-forest-600 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={closetItem.images[0]}
                          alt={closetItem.title}
                          className="w-12 h-14 rounded-lg object-cover ring-1 ring-stone-200 shrink-0"
                        />
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-forest-700 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-semibold text-slate-800 block truncate">
                          {closetItem.title}
                        </span>
                        <div className="flex items-center justify-between text-[10px] text-stone-500 mt-0.5">
                          <span>{closetItem.brand} (Sz {closetItem.size})</span>
                          <span className="font-bold text-forest-700">{closetItem.estimatedSwapValue} pts</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Fairness Live Meter */}
          {selectedItemIds.length > 0 && (
            <div className="animate-in fade-in duration-200">
              <ValueMeter
                requestedValue={targetItem.estimatedSwapValue}
                offeredValue={offeredTotalValue}
                requestedTitle={targetItem.title}
                offeredTitle={selectedItems.map(i => i.title).join(' + ')}
              />
            </div>
          )}

          {/* Exchange Method */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
              Preferred Exchange Method:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExchangeMethod('local_meetup')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  exchangeMethod === 'local_meetup'
                    ? 'border-forest-600 bg-forest-50/60 ring-1 ring-forest-600'
                    : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50'
                }`}
              >
                <MapPin className={`w-4 h-4 mt-0.5 ${exchangeMethod === 'local_meetup' ? 'text-forest-700' : 'text-stone-400'}`} />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Local Safe Swap Hub
                  </span>
                  <span className="text-[11px] text-stone-500 block mt-0.5">
                    0 carbon emissions, meet in person
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExchangeMethod('courier_shipping')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  exchangeMethod === 'courier_shipping'
                    ? 'border-forest-600 bg-forest-50/60 ring-1 ring-forest-600'
                    : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50'
                }`}
              >
                <Truck className={`w-4 h-4 mt-0.5 ${exchangeMethod === 'courier_shipping' ? 'text-forest-700' : 'text-stone-400'}`} />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Courier Shipping
                  </span>
                  <span className="text-[11px] text-stone-500 block mt-0.5">
                    Tracked peer-to-peer parcel
                  </span>
                </div>
              </button>
            </div>

            {/* If local meetup, select hub */}
            {exchangeMethod === 'local_meetup' && (
              <div className="mt-3 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                <label className="text-stone-600 font-medium block mb-1">
                  Select Community Safe Zone:
                </label>
                <select
                  value={selectedHub.name}
                  onChange={(e) => {
                    const hub = MOCK_SWAP_HUBS.find(h => h.name === e.target.value);
                    if (hub) setSelectedHub(hub);
                  }}
                  className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-forest-500"
                >
                  {MOCK_SWAP_HUBS.map(hub => (
                    <option key={hub.name} value={hub.name}>
                      📍 {hub.name} ({hub.address})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Proposal Message */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
              Personalized Note to Owner:
            </label>
            <textarea
              rows={2}
              value={proposalMessage}
              onChange={(e) => setProposalMessage(e.target.value)}
              placeholder={`Hi ${targetItem.ownerName}, I'm interested in trading! Let me know if this works for you...`}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
            />
          </div>

          {/* Footer CTA */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero transaction fees</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={selectedItemIds.length === 0}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedItemIds.length > 0
                    ? 'bg-forest-800 text-white hover:bg-forest-900 active:scale-95 shadow-md'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Send Swap Request</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
