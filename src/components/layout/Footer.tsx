import React from 'react';
import { useApp } from '../../context/AppContext';
import { Repeat, Heart, Shield, RefreshCw, Sparkles, Droplet, Wind } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { kpis, resetToSampleData, isApiConnected } = useApp();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-14 pb-8 border-t border-stone-800">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-forest-700 text-white flex items-center justify-center">
                <Repeat className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <span className="font-serif text-xl font-bold tracking-tight text-white block">
                  ThreadLoop
                </span>
                <span className="text-xs font-semibold text-emerald-400 block uppercase tracking-wider">
                  Clothing Exchange & Swap Marketplace
                </span>
              </div>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed max-w-md">
              Democratizing sustainable fashion through zero-monetary barter. Swap pre-loved, high-quality garments directly with local neighbors or nationwide collectors.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-stone-400">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-emerald-400" /> Verified Safe Hubs
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Algorithmic Fair Value
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-emerald-400 transition-colors">
                  Explore All Garments
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('calculator')} className="hover:text-emerald-400 transition-colors">
                  Swap Value Calculator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('swaps')} className="hover:text-emerald-400 transition-colors">
                  Active Swap Offers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-emerald-400 transition-colors">
                  My Closet & Badges
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Documentation */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              Architecture & Trust
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('prd')} className="text-emerald-400 hover:underline flex items-center gap-1">
                  Product PRD Document ↗
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-emerald-400 transition-colors">
                  Admin Moderation Hub
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('messages')} className="hover:text-emerald-400 transition-colors">
                  Negotiation Messenger
                </button>
              </li>
              <li>
                <button onClick={resetToSampleData} className="text-stone-400 hover:text-amber-400 transition-colors flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Sample Data
                </button>
              </li>
              <li className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-800 text-stone-300 border border-stone-700">
                  <span className={`w-1.5 h-1.5 rounded-full ${isApiConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  {isApiConnected ? 'Backend: Spring Boot + MongoDB' : 'Backend: Disconnected'}
                </span>
              </li>
            </ul>
          </div>

          {/* Eco Ticker */}
          <div className="bg-stone-800/80 rounded-2xl p-4 border border-stone-700/80 space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">
              Collective Impact
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-400 flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-cyan-400" /> Water Saved
                </span>
                <span className="font-semibold text-white">{(kpis.totalLitersWaterSaved / 1000000).toFixed(1)}M Liters</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400 flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-emerald-400" /> CO₂ Avoided
                </span>
                <span className="font-semibold text-white">{(kpis.totalKgCo2Avoided / 1000).toFixed(1)} Tonnes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Textiles Diverted</span>
                <span className="font-semibold text-emerald-300">{(kpis.totalKgWasteDiverted / 1000).toFixed(2)} Tonnes</span>
              </div>
            </div>
            <div className="pt-2 border-t border-stone-700">
              <span className="text-[11px] text-emerald-400 font-medium block">
                {kpis.completedSwaps.toLocaleString()} successful trades completed
              </span>
            </div>
          </div>
        </div>

        {/* Bottom credits */}
        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>
            © 2026 ThreadLoop Platform. Built for the Circular Barter Economy.
          </p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for zero textile waste</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
