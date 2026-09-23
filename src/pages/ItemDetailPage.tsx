import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ConditionBadge } from '../components/common/ConditionBadge';
import { ImpactBadge } from '../components/common/ImpactBadge';
import { ItemCard } from '../components/items/ItemCard';
import { calculateDistanceKm, formatRelativeTime } from '../utils/formatters';
import { BRAND_TIER_LABELS } from '../utils/calculator';
import { 
  ArrowLeft, 
  Sparkles, 
  MapPin, 
  Star, 
  ArrowLeftRight, 
  Calendar, 
  Share2, 
  Heart,
  AlertCircle
} from 'lucide-react';

interface ItemDetailPageProps {
  itemId: string;
  onNavigate: (view: string, itemId?: string) => void;
}

export const ItemDetailPage: React.FC<ItemDetailPageProps> = ({ 
  itemId, 
  onNavigate 
}) => {
  const { items, currentUser, openSwapModal, showToast, isAuthenticated } = useApp();

  const item = items.find(i => i.id === itemId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Garment Not Found</h2>
        <p className="text-xs text-stone-500 mt-1">This listing may have been swapped or removed.</p>
        <button
          onClick={() => onNavigate('explore')}
          className="mt-4 px-4 py-2 bg-forest-800 text-white rounded-xl text-xs font-semibold"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  const isOwner = currentUser ? item.ownerId === currentUser.id : false;
  const userLat = currentUser?.location.lat ?? 40.7128;
  const userLng = currentUser?.location.lng ?? -74.0060;
  const distance = calculateDistanceKm(
    userLat,
    userLng,
    item.coordinates.lat,
    item.coordinates.lng
  );

  // Similar items
  const similarItems = items
    .filter(i => i.id !== item.id && (i.category === item.category || i.brand === item.brand))
    .slice(0, 3);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Listing link copied to clipboard!');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Back button */}
      <button
        onClick={() => onNavigate('explore')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </button>

      {/* Main Item Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
        {/* Left Column: Photo Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-xs">
            <img
              src={item.images[activeImageIndex] || item.images[0]}
              alt={item.title}
              className="w-full h-full object-cover object-center"
            />

            {/* Condition overlay */}
            <div className="absolute top-4 left-4">
              <ConditionBadge condition={item.condition} className="bg-white/95 backdrop-blur-md shadow-xs" />
            </div>

            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-white/90 backdrop-blur-md text-stone-700 hover:text-stone-900 shadow-sm"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsFavorited(!isFavorited);
                  showToast(isFavorited ? 'Removed from saved wishlist.' : 'Saved to wishlist!');
                }}
                className={`p-2 rounded-full backdrop-blur-md shadow-sm transition-colors ${
                  isFavorited ? 'bg-rose-50 text-rose-600' : 'bg-white/90 text-stone-700 hover:text-rose-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            {/* Status overlay if unavailable */}
            {item.status !== 'available' && (
              <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] flex items-center justify-center">
                <span className="px-4 py-2 rounded-xl bg-white text-stone-900 font-bold text-xs uppercase tracking-wider shadow-lg">
                  {item.status.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {item.images.length > 1 && (
            <div className="flex items-center gap-3">
              {item.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx ? 'border-forest-700 ring-2 ring-forest-700/20' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Ecological Impact Card */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Circular Environmental Savings:
            </span>
            <p className="text-xs text-stone-600 leading-relaxed">
              Swapping this garment instead of buying new prevents manufacturing impact:
            </p>
            <ImpactBadge
              waterLiters={item.ecoSavedLitersWater}
              co2Kg={item.ecoSavedKgCo2}
              wasteKg={1.2}
            />
          </div>
        </div>

        {/* Right Column: Garment Specs & Swap Proposal Trigger (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header Info */}
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
              <span className="font-bold uppercase tracking-widest text-forest-800">
                {item.brand} ({BRAND_TIER_LABELS[item.brandTier]?.name || item.brandTier})
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                Listed {formatRelativeTime(item.createdAt)}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              {item.title}
            </h1>

            {/* Price vs Swap Credits Valuation */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-forest-50 via-stone-50 to-emerald-50/60 border border-forest-100 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 block">
                  Algorithmic Estimated Swap Value
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-extrabold text-forest-900">
                    {item.estimatedSwapValue} pts
                  </span>
                  <span className="text-xs text-stone-500">
                    (Original retail: ${item.originalPrice})
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-forest-700 text-white shadow-2xs">
                  Zero Cash Barter
                </span>
              </div>
            </div>
          </div>

          {/* Core Specifications Table */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-400 block mb-0.5">Size / Fit</span>
              <span className="font-bold text-slate-800 text-sm">Size {item.size}</span>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-400 block mb-0.5">Gender Style</span>
              <span className="font-bold text-slate-800 text-sm">{item.gender}</span>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-400 block mb-0.5">Category</span>
              <span className="font-bold text-slate-800 text-sm truncate block">{item.category}</span>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-400 block mb-0.5">Fabric / Material</span>
              <span className="font-bold text-slate-800 text-sm truncate block">{item.material || 'Cotton blend'}</span>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-400 block mb-0.5">Color</span>
              <span className="font-bold text-slate-800 text-sm">{item.color}</span>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-400 block mb-0.5">Location</span>
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {item.ownerCity}, {distance}km
              </span>
            </div>
          </div>

          {/* Description & Condition Notes */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Garment Description
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed bg-white p-4 rounded-2xl border border-stone-200/80">
              {item.description}
            </p>

            {item.conditionNotes && (
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <div>
                  <span className="font-bold">Condition Inspection Note: </span>
                  <span>{item.conditionNotes}</span>
                </div>
              </div>
            )}
          </div>

          {/* Owner Trust & Profile Snippet */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={item.ownerAvatar}
                alt={item.ownerName}
                className="w-12 h-12 rounded-xl object-cover ring-1 ring-stone-200"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {item.ownerName}
                </span>
                <span className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <strong>{item.ownerRating}</strong> ({item.ownerSwapsCount} successful swaps)
                </span>
                <span className="text-[11px] text-forest-700 font-medium block mt-0.5">
                  Verified Circular Member • {item.ownerCity}, {item.ownerState}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-emerald-700 bg-emerald-100 font-bold px-2.5 py-1 rounded-full">
                Safe Hub Ready
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            {isOwner ? (
              <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-center">
                <span className="text-sm font-semibold text-stone-700 block">
                  This is your listed garment.
                </span>
                <p className="text-xs text-stone-500 mt-0.5">
                  You can manage or edit this piece in your Closet Dashboard.
                </p>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="mt-3 px-5 py-2 bg-stone-800 text-white rounded-xl text-xs font-bold"
                >
                  Go to My Closet
                </button>
              </div>
            ) : (
              <button
                onClick={() => openSwapModal(item)}
                disabled={item.status !== 'available'}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                  item.status === 'available'
                    ? 'bg-forest-800 text-white hover:bg-forest-900 active:scale-98 shadow-forest-900/20'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <ArrowLeftRight className="w-5 h-5" />
                <span>
                  {item.status === 'available' ? 'Propose a Clothing Swap' : 'Currently in Negotiation'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Similar Garments Carousel */}
      {similarItems.length > 0 && (
        <section className="pt-8 border-t border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-slate-900">
              More Garments in {item.category}
            </h3>
            <button
              onClick={() => onNavigate('explore')}
              className="text-xs font-semibold text-forest-700 hover:underline"
            >
              Browse All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {similarItems.map((simItem) => (
              <ItemCard
                key={simItem.id}
                item={simItem}
                onViewDetails={(id) => onNavigate('item_detail', id)}
                onProposeSwap={(it) => openSwapModal(it)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
