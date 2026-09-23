import React from 'react';
import { useApp } from '../context/AppContext';
import { ItemCard } from '../components/items/ItemCard';
import { 
  Repeat, 
  Sparkles, 
  ShieldCheck, 
  Calculator, 
  ArrowRight, 
  Droplet, 
  Wind, 
  Trash2, 
  CheckCircle2,
  Compass
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: string, itemId?: string) => void;
  onOpenCreateListing: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  onNavigate, 
  onOpenCreateListing 
}) => {
  const { items, kpis, openSwapModal } = useApp();

  // Curated featured items
  const featuredItems = items.slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-16 pb-20 px-4 sm:px-6">
        {/* Soft atmospheric gradient background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#F2ECE1]/60 via-[#FAF8F5] to-[#FAF8F5]" />
        
        <div className="container mx-auto max-w-6xl text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-100/80 border border-forest-200 text-forest-900 text-xs font-semibold animate-pulse-subtle">
            <Sparkles className="w-3.5 h-3.5 text-forest-700" />
            <span>The Zero-Monetary Fashion Barter Economy</span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] max-w-4xl mx-auto">
            Trade Clothes You Have <br />
            <span className="italic font-normal text-forest-800">For Clothes You’ll Love.</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Eliminate fast fashion waste. Swap pre-loved designer, vintage, and high-street garments directly with zero transaction fees. Value-balanced, location-aware, and community-verified.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('explore')}
              className="px-7 py-3.5 rounded-2xl bg-forest-800 text-white font-bold text-sm hover:bg-forest-900 active:scale-95 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-emerald-300" />
              <span>Explore Marketplace</span>
            </button>

            <button
              onClick={onOpenCreateListing}
              className="px-6 py-3.5 rounded-2xl bg-white text-stone-800 border border-stone-200/90 font-bold text-sm hover:bg-stone-50 active:scale-95 transition-all shadow-sm flex items-center gap-2"
            >
              <span>List a Garment</span>
              <ArrowRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              onClick={() => onNavigate('calculator')}
              className="px-5 py-3.5 rounded-2xl bg-forest-50/80 text-forest-800 border border-forest-200 font-bold text-sm hover:bg-forest-100 active:scale-95 transition-all flex items-center gap-2"
            >
              <Calculator className="w-4 h-4 text-forest-700" />
              <span>Swap Calculator</span>
            </button>
          </div>

          {/* Visual Trust Indicators */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-stone-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Cash-Free Trading
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Safe Meetup Hubs
            </span>
            <span className="flex items-center gap-1.5">
              <Repeat className="w-4 h-4 text-emerald-600" /> Algorithmic Fair Valuation
            </span>
          </div>
        </div>
      </section>

      {/* Real-Time Environmental Impact Ticker */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-stone-900 via-forest-950 to-stone-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-stone-800">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-stone-800 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-1">
                  Collective Environmental Ticker
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  Real Measurable Impact Diverted Together
                </h2>
              </div>
              <div className="text-xs text-stone-400">
                Data calibrated against WRAP & Ellen MacArthur Foundation benchmarks
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-cyan-400 mb-1">
                  <Droplet className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Water Saved
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {(kpis.totalLitersWaterSaved / 1000000).toFixed(1)}M
                </div>
                <p className="text-xs text-stone-400">
                  Liters of drinking water conserved
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                  <Wind className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    CO₂ Avoided
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {(kpis.totalKgCo2Avoided / 1000).toFixed(1)}t
                </div>
                <p className="text-xs text-stone-400">
                  Tonnes greenhouse gas emissions prevented
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-400 mb-1">
                  <Trash2 className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Textiles Diverted
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {(kpis.totalKgWasteDiverted / 1000).toFixed(2)}t
                </div>
                <p className="text-xs text-stone-400">
                  Landfill incinerations prevented
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-purple-400 mb-1">
                  <Repeat className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Successful Swaps
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {kpis.completedSwaps.toLocaleString()}
                </div>
                <p className="text-xs text-stone-400">
                  {kpis.swapSuccessRate}% barter agreement rate
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Direct Barter Works Section */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
            Frictionless Circular Lifecycle
          </span>
          <h2 className="font-serif text-3xl font-bold text-slate-900">
            How Clothing Swapping Works
          </h2>
          <p className="text-stone-600 text-sm">
            Swap pre-loved clothes in four transparent steps without spending a single dollar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'List Your Wardrobe',
              desc: 'Upload high-resolution photos of clean, wearable clothes you no longer wear. Our algorithm estimates fair swap points.',
              icon: '📸',
            },
            {
              step: '02',
              title: 'Discover Nearby Matches',
              desc: 'Browse by category, size, style aesthetic, or radius. Use the live map to pinpoint items in your local area.',
              icon: '🗺️',
            },
            {
              step: '03',
              title: 'Propose & Value Balance',
              desc: 'Select 1 or more items from your closet to offer. The live Fairness Meter verifies balanced value before proposing.',
              icon: '⚖️',
            },
            {
              step: '04',
              title: 'Negotiate & Safe Swap',
              desc: 'Chat in our negotiation room, lock the agreement, and swap at a verified community hub or via tracked courier shipping.',
              icon: '🤝',
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs hover:shadow-md transition-shadow relative"
            >
              <span className="text-xs font-mono font-bold text-forest-600 mb-3 block">
                STEP {card.step}
              </span>
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="font-bold text-slate-900 text-base mb-2">
                {card.title}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Swaps Showcase */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
              Freshly Listed Pieces
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-900">
              Curated Garments Ready for Swap
            </h2>
          </div>

          <button
            onClick={() => onNavigate('explore')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-forest-800 hover:text-forest-900 hover:underline"
          >
            <span>View All Marketplace Listings ({items.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onViewDetails={(id) => onNavigate('item_detail', id)}
              onProposeSwap={(it) => openSwapModal(it)}
            />
          ))}
        </div>
      </section>

      {/* Value Calculator Teaser Banner */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="bg-forest-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Transparent Algorithm
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              Wondering what your closet pieces are worth in swaps?
            </h3>
            <p className="text-stone-300 text-sm leading-relaxed">
              Use our Algorithmic Swap Value Estimator. Input brand tier, garment condition, original price, and age to compute your trading points and explore instant fair matches.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('calculator')}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-forest-950 font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 inline-flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                <span>Launch Swap Value Calculator</span>
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-sm w-full space-y-4">
            <span className="text-xs uppercase font-bold text-emerald-300">
              Fair Trade Index Formula
            </span>
            <div className="space-y-2 text-xs text-stone-200">
              <div className="flex justify-between py-1 border-b border-white/10">
                <span>Brand Multiplier:</span>
                <span className="font-mono text-emerald-300">0.55x - 1.55x</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span>Condition Weight:</span>
                <span className="font-mono text-emerald-300">0.36x - 0.85x</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span>Category Factor:</span>
                <span className="font-mono text-emerald-300">0.85x - 1.25x</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Fairness Tolerance:</span>
                <span className="font-mono text-emerald-300">±15% Parity</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
