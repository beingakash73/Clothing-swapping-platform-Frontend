import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ConditionBadge } from '../components/common/ConditionBadge';
import { 
  Droplet, 
  Wind, 
  Trash2, 
  PlusCircle, 
  Trash, 
  Award, 
  Star,
  Layers,
  ArrowLeftRight
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (view: string, itemId?: string) => void;
  onOpenCreateListing: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  onNavigate, 
  onOpenCreateListing 
}) => {
  const { currentUser, items, users, switchUser, deleteClothingItem, isAuthenticated } = useApp();

  const [closetTab, setClosetTab] = useState<'available' | 'in_negotiation' | 'swapped' | 'all'>('available');

  if (!currentUser || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-16 text-center max-w-lg">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Sign In to Access Your Closet
          </h2>
          <p className="text-xs text-stone-500">
            View your listed garments, track personal water & CO₂ savings, and manage trade proposals.
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

  // Items owned by current user
  const myItems = items.filter(i => i.ownerId === currentUser.id);

  const filteredItems = myItems.filter(item => {
    if (closetTab === 'all') return true;
    return item.status === closetTab;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Profile Overview & Eco Scorecard Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* User Info */}
          <div className="flex items-start gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-forest-600/30 shrink-0 shadow-sm"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                  {currentUser.name}
                </h1>
                {currentUser.role === 'admin' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                    🛡️ Administrator
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    🌱 Eco Level {Math.floor(currentUser.ecoScore / 100)}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-stone-600 max-w-xl leading-relaxed">
                {currentUser.bio}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-1">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {currentUser.rating} ({currentUser.reviewCount} reviews)
                </span>
                <span>•</span>
                <span>{currentUser.completedSwaps} completed trades</span>
                <span>•</span>
                <span>Based in {currentUser.location.city}, {currentUser.location.state}</span>
              </div>
            </div>
          </div>

          {/* Quick List Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              onClick={onOpenCreateListing}
              className="px-5 py-3 rounded-2xl bg-forest-800 text-white font-bold text-xs hover:bg-forest-900 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>List New Garment</span>
            </button>
            <button
              onClick={() => onNavigate('swaps')}
              className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeftRight className="w-4 h-4 text-forest-700" />
              <span>Track Swaps</span>
            </button>
          </div>
        </div>

        {/* Environmental Scorecard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-stone-100">
          <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200/80 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-800 flex items-center gap-1">
              <Droplet className="w-4 h-4 text-cyan-600" /> Water Conserved
            </span>
            <div className="text-2xl font-extrabold text-cyan-950">
              {currentUser.waterSavedLiters.toLocaleString()} L
            </div>
            <p className="text-[11px] text-cyan-800/80">
              Equivalent to drinking water for {Math.round(currentUser.waterSavedLiters / 1000)} people for a year
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <Wind className="w-4 h-4 text-emerald-600" /> CO₂ Emissions Prevented
            </span>
            <div className="text-2xl font-extrabold text-emerald-950">
              {currentUser.co2SavedKg} kg
            </div>
            <p className="text-[11px] text-emerald-800/80">
              Avoided vs. virgin fast fashion garment manufacturing
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
              <Trash2 className="w-4 h-4 text-amber-600" /> Textiles Diverted
            </span>
            <div className="text-2xl font-extrabold text-amber-950">
              {currentUser.wasteDivertedKg} kg
            </div>
            <p className="text-[11px] text-amber-800/80">
              Kept out of municipal incinerators and landfills
            </p>
          </div>
        </div>

        {/* Unlocked Green Badges */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-forest-700" />
            <span>Unlocked Sustainability Badges</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentUser.badges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/80"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                  🏅
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {badge.name}
                  </span>
                  <span className="text-[11px] text-stone-500 block leading-tight">
                    {badge.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Closet Inventory Management */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-slate-900">
              My Digital Closet ({myItems.length} pieces)
            </h2>
            <p className="text-xs text-stone-500">
              Garments available to offer in swaps or currently reserved in active trades.
            </p>
          </div>

          {/* Closet Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold self-start sm:self-auto">
            {[
              { id: 'available', label: 'Available' },
              { id: 'in_negotiation', label: 'In Trade' },
              { id: 'swapped', label: 'Swapped' },
              { id: 'all', label: 'All' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setClosetTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  closetTab === tab.id
                    ? 'bg-white text-forest-900 shadow-2xs font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              No garments in this closet tab
            </h3>
            <p className="text-xs text-stone-500">
              List an unused jacket, dress, or sweater to start exchanging with other members.
            </p>
            <button
              onClick={onOpenCreateListing}
              className="mt-2 px-4 py-2 bg-forest-800 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              List an Item Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <ConditionBadge condition={item.condition} className="bg-white/95" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-forest-900 text-white">
                      {item.estimatedSwapValue} pts
                    </span>
                  </div>

                  {item.status !== 'available' && (
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="px-3 py-1 rounded-lg bg-white text-xs font-bold text-slate-800 uppercase">
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">
                      {item.brand} • Size {item.size}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {item.title}
                    </h4>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                    <button
                      onClick={() => onNavigate('item_detail', item.id)}
                      className="text-forest-700 font-semibold hover:underline"
                    >
                      View Public Page
                    </button>
                    <button
                      onClick={() => deleteClothingItem(item.id)}
                      title="Remove from marketplace"
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Demo Persona Quick Switcher Banner */}
      <div className="p-6 rounded-3xl bg-stone-100/80 border border-stone-200 text-xs space-y-3">
        <span className="font-bold uppercase tracking-wider text-stone-500 block">
          Demo Persona Switcher (For Pair Programming / Evaluation)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => switchUser(u.id)}
              className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                u.id === currentUser.id
                  ? 'bg-white border-forest-600 ring-2 ring-forest-600 shadow-xs'
                  : 'bg-white/60 border-stone-200 hover:bg-white'
              }`}
            >
              <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-lg object-cover" />
              <div className="min-w-0">
                <span className="font-bold text-slate-800 block truncate">{u.name}</span>
                <span className="text-[10px] text-stone-500 capitalize">{u.role}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
