import React from 'react';
import { ClothingItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { ConditionBadge } from '../common/ConditionBadge';
import { calculateDistanceKm } from '../../utils/formatters';
import { MapPin, Star, ArrowLeftRight, Sparkles } from 'lucide-react';

interface ItemCardProps {
  item: ClothingItem;
  onViewDetails: (itemId: string) => void;
  onProposeSwap?: (item: ClothingItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onViewDetails,
  onProposeSwap,
}) => {
  const { currentUser, openSwapModal } = useApp();
  const isOwner = currentUser ? item.ownerId === currentUser.id : false;

  // Calculate distance from current user
  const userLat = currentUser?.location.lat ?? 40.7128;
  const userLng = currentUser?.location.lng ?? -74.0060;
  const distance = calculateDistanceKm(
    userLat,
    userLng,
    item.coordinates.lat,
    item.coordinates.lng
  );

  const handleSwapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onProposeSwap) {
      onProposeSwap(item);
    } else {
      openSwapModal(item);
    }
  };

  return (
    <div 
      onClick={() => onViewDetails(item.id)}
      className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-float hover:border-forest-300/80 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
        <img
          src={item.images[0]}
          alt={item.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <ConditionBadge condition={item.condition} className="shadow-xs backdrop-blur-sm bg-white/90" />
          
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-forest-900/90 text-white backdrop-blur-sm shadow-xs">
            <Sparkles className="w-3 h-3 text-emerald-300" />
            {item.estimatedSwapValue} pts
          </span>
        </div>

        {/* Status Overlay if not available */}
        {item.status !== 'available' && (
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
            <span className="px-3 py-1.5 rounded-xl bg-white font-bold text-xs text-stone-800 shadow-md uppercase tracking-wider">
              {item.status === 'in_negotiation' ? '⏳ In Negotiation' : '🔄 Swapped'}
            </span>
          </div>
        )}

        {/* Distance Pill */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-900/70 text-white backdrop-blur-sm">
            <MapPin className="w-3 h-3 text-emerald-400" />
            {distance} km away
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Size */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-forest-800 truncate max-w-[150px]">
              {item.brand}
            </span>
            <span className="font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
              Size {item.size}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-medium text-slate-900 text-sm line-clamp-2 group-hover:text-forest-800 transition-colors">
            {item.title}
          </h3>
        </div>

        {/* Footer info: Owner & Swap CTA */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={item.ownerAvatar}
              alt={item.ownerName}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-stone-200"
            />
            <div className="text-[11px] leading-tight">
              <span className="font-medium text-slate-700 block truncate max-w-[90px]">
                {item.ownerName}
              </span>
              <span className="text-stone-400 flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                {item.ownerRating}
              </span>
            </div>
          </div>

          {/* Action button */}
          {isOwner ? (
            <span className="text-xs text-stone-400 font-medium bg-stone-100 px-2.5 py-1 rounded-lg">
              Your Garment
            </span>
          ) : (
            <button
              onClick={handleSwapClick}
              disabled={item.status !== 'available'}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                item.status === 'available'
                  ? 'bg-forest-50 text-forest-800 hover:bg-forest-700 hover:text-white group-hover:shadow-sm'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Swap</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
