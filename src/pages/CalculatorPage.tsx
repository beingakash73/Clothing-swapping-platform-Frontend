import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BrandTier, Category, ClothingCondition } from '../types';
import { 
  calculateSwapValue, 
  BRAND_TIER_LABELS, 
  CONDITION_LABELS, 
  CATEGORY_FACTORS 
} from '../utils/calculator';
import { ItemCard } from '../components/items/ItemCard';
import { 
  Calculator, 
  Sparkles, 
  ArrowRight, 
  Scale, 
  ShieldCheck, 
  Leaf 
} from 'lucide-react';

interface CalculatorPageProps {
  onNavigate: (view: string, itemId?: string) => void;
}

export const CalculatorPage: React.FC<CalculatorPageProps> = ({ onNavigate }) => {
  const { items, openSwapModal } = useApp();

  const [category, setCategory] = useState<Category>('Jackets & Coats');
  const [brandTier, setBrandTier] = useState<BrandTier>('designer_sustainable');
  const [condition, setCondition] = useState<ClothingCondition>('like_new');
  const [originalPrice, setOriginalPrice] = useState(250);
  const [ageYears, setAgeYears] = useState(1);
  const [isVintage, setIsVintage] = useState(false);

  // Compute valuation
  const result = useMemo(() => {
    return calculateSwapValue({
      category,
      brandTier,
      condition,
      originalPrice: Number(originalPrice) || 50,
      ageYears: Number(ageYears) || 1,
      isVintage,
    });
  }, [category, brandTier, condition, originalPrice, ageYears, isVintage]);

  // Find real items in marketplace matching this calculated points bracket
  const matchingItems = useMemo(() => {
    const targetVal = result.estimatedSwapValue;
    return items
      .filter(i => i.status === 'available')
      .map(item => ({
        item,
        diff: Math.abs(item.estimatedSwapValue - targetVal),
      }))
      .sort((a, b) => a.diff - b.diff)
      .slice(0, 4)
      .map(r => r.item);
  }, [items, result.estimatedSwapValue]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-700">
          <Calculator className="w-4 h-4" />
          <span>Algorithmic Valuation Engine</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
          Interactive Swap Value Calculator
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed">
          Remove subjective pricing arguments. Our mathematical model weighs brand heritage, garment condition, material tier, and seasonality to determine fair swap credit parity.
        </p>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Scale className="w-4 h-4 text-forest-700" />
            <span>Garment Parameters</span>
          </h3>

          {/* Category */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
              Garment Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {Object.keys(CATEGORY_FACTORS).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat as Category)}
                  className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                    category === cat
                      ? 'bg-forest-800 text-white border-forest-800 shadow-2xs font-semibold'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Tier */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
              Brand Provenance / Tier
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(BRAND_TIER_LABELS).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setBrandTier(key as BrandTier)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    brandTier === key
                      ? 'bg-forest-50 border-forest-600 ring-1 ring-forest-600'
                      : 'bg-stone-50/70 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{val.name}</span>
                    <span className="text-[10px] font-mono font-bold text-forest-700">{val.multiplier}x</span>
                  </div>
                  <span className="text-[11px] text-stone-500 block mt-0.5 truncate">
                    {val.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
              Physical Condition
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(CONDITION_LABELS).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCondition(key as ClothingCondition)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    condition === key
                      ? 'bg-forest-50 border-forest-600 ring-1 ring-forest-600'
                      : 'bg-stone-50/70 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{val.name}</span>
                    <span className="text-[10px] font-mono font-bold text-forest-700">{val.multiplier * 100}%</span>
                  </div>
                  <span className="text-[11px] text-stone-500 block mt-0.5">
                    {val.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Original Retail Value ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                <input
                  type="number"
                  min={10}
                  max={4000}
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-forest-500 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Age in Years
              </label>
              <select
                value={ageYears}
                onChange={(e) => setAgeYears(Number(e.target.value))}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-forest-500"
              >
                <option value={1}>Current season (&lt; 1 year)</option>
                <option value={2}>1 - 2 years old</option>
                <option value={3}>3 - 4 years old</option>
                <option value={5}>5+ years old</option>
              </select>
            </div>
          </div>

          {/* Vintage Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="vintageToggle"
              checked={isVintage}
              onChange={(e) => setIsVintage(e.target.checked)}
              className="w-4 h-4 text-forest-700 rounded border-stone-300 focus:ring-forest-500"
            />
            <label htmlFor="vintageToggle" className="text-xs font-medium text-stone-700 cursor-pointer">
              Curated Authentic Vintage (15+ years collectible archive piece)
            </label>
          </div>
        </div>

        {/* Right Output Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Result Card */}
          <div className="bg-gradient-to-br from-forest-900 via-forest-800 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-forest-700">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-300 block mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Calculated Barter Parity
            </span>
            
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-5xl sm:text-6xl font-extrabold text-white">
                {result.estimatedSwapValue}
              </span>
              <span className="text-lg font-bold text-emerald-400">
                Swap Points
              </span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed mb-6">
              This garment holds approximately <strong>${result.estimatedSwapValue}</strong> in fair exchange purchasing power on ThreadLoop.
            </p>

            {/* Sub metrics */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-forest-700/80 text-xs">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                <span className="text-stone-300 block mb-0.5">Circular Retained Value</span>
                <span className="font-bold text-base text-white">
                  {100 - result.depreciationRatio}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                <span className="text-stone-300 block mb-0.5 flex items-center gap-1">
                  <Leaf className="w-3 h-3 text-emerald-400" /> Sustainability Rating
                </span>
                <span className="font-bold text-base text-emerald-300">
                  {result.sustainabilityScore} / 100
                </span>
              </div>
            </div>

            {/* Formula Multipliers Breakdown */}
            <div className="mt-6 pt-4 border-t border-forest-700/80 text-[11px] text-stone-300 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span>Brand Multiplier:</span>
                <span className="text-emerald-300">{result.breakdown.brandTierMultiplier}x</span>
              </div>
              <div className="flex justify-between">
                <span>Condition Retained:</span>
                <span className="text-emerald-300">{(result.breakdown.conditionMultiplier * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Category Weight:</span>
                <span className="text-emerald-300">{result.breakdown.categoryWeight}x</span>
              </div>
              <div className="flex justify-between">
                <span>Age / Vintage Factor:</span>
                <span className="text-emerald-300">{result.breakdown.ageMultiplier}x</span>
              </div>
            </div>
          </div>

          {/* Quick Explanation */}
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 text-xs text-stone-600 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Why Swap Value Parity Matters
            </h4>
            <p className="leading-relaxed">
              Resale platforms force users to compete in a race to the bottom on price. ThreadLoop’s algorithmic valuation ensures both swappers feel respected and guarantees that a $160 designer fleece trades cleanly for an equivalent wool knit or selvedge denim.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Fair Matches in Current Marketplace */}
      <section className="space-y-4 pt-4 border-t border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
              Live Marketplace Equivalence
            </span>
            <h3 className="font-serif text-2xl font-bold text-slate-900">
              Available Items Fairly Matched to Your {result.estimatedSwapValue} pts
            </h3>
          </div>

          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-bold text-forest-800 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Explore All Marketplace Listings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {matchingItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onViewDetails={(id) => onNavigate('item_detail', id)}
              onProposeSwap={(it) => openSwapModal(it)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
