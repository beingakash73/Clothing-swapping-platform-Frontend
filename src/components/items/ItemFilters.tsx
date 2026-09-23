import React from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  LayoutGrid, 
  Map, 
  X, 
  RotateCcw 
} from 'lucide-react';

export interface FilterState {
  searchQuery: string;
  category: string;
  gender: string;
  condition: string;
  maxDistanceKm: number; // 0 means any
  sortBy: string;
  viewMode: 'grid' | 'map';
}

interface ItemFiltersProps {
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  totalResults: number;
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'All Garments', value: 'all' },
  { label: 'Jackets & Coats', value: 'Jackets & Coats' },
  { label: 'Sweaters & Knitwear', value: 'Sweaters & Knitwear' },
  { label: 'Dresses & Jumpsuits', value: 'Dresses & Jumpsuits' },
  { label: 'Pants & Denim', value: 'Pants & Denim' },
  { label: 'Tops & Shirts', value: 'Tops & Shirts' },
  { label: 'Footwear', value: 'Footwear' },
  { label: 'Bags & Accessories', value: 'Bags & Accessories' },
];

export const ItemFilters: React.FC<ItemFiltersProps> = ({
  filters,
  onChange,
  totalResults,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, searchQuery: e.target.value });
  };

  const handleCategorySelect = (cat: string) => {
    onChange({ ...filters, category: cat });
  };

  const handleDistanceSelect = (km: number) => {
    onChange({ ...filters, maxDistanceKm: km });
  };

  const resetFilters = () => {
    onChange({
      searchQuery: '',
      category: 'all',
      gender: 'all',
      condition: 'all',
      maxDistanceKm: 0,
      sortBy: 'recommended',
      viewMode: filters.viewMode,
    });
  };

  const hasActiveFilters = 
    filters.searchQuery !== '' || 
    filters.category !== 'all' || 
    filters.gender !== 'all' || 
    filters.condition !== 'all' || 
    filters.maxDistanceKm !== 0;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs mb-8 space-y-4">
      {/* Top Search & Controls Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by brand, garment title, material, or aesthetic..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-9 py-2.5 bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200 focus:border-forest-500 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-forest-500/20"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode Toggle (Grid vs Map) */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200">
            <button
              onClick={() => onChange({ ...filters, viewMode: 'grid' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filters.viewMode === 'grid'
                  ? 'bg-white text-forest-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => onChange({ ...filters, viewMode: 'map' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filters.viewMode === 'map'
                  ? 'bg-white text-forest-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Nearby Map</span>
            </button>
          </div>

          {/* Sort By Selector */}
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
            className="bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:border-forest-500"
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="nearest">Sort: Nearest Distance</option>
            <option value="value_high">Value: High to Low</option>
            <option value="value_low">Value: Low to High</option>
            <option value="newest">Recently Listed</option>
          </select>

          {/* Filter toggle button */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
              showAdvanced || hasActiveFilters
                ? 'bg-forest-50 border-forest-300 text-forest-800'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {CATEGORIES.map((cat) => {
          const isSelected = filters.category === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => handleCategorySelect(cat.value)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
                isSelected
                  ? 'bg-forest-800 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Distance Radius Quick Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-stone-400 font-medium flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            Distance Radius:
          </span>
          <div className="flex items-center gap-1">
            {[
              { label: 'Anywhere', km: 0 },
              { label: 'Within 5km', km: 5 },
              { label: 'Within 15km', km: 15 },
              { label: 'Within 50km', km: 50 },
            ].map((d) => (
              <button
                key={d.km}
                onClick={() => handleDistanceSelect(d.km)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filters.maxDistanceKm === d.km
                    ? 'bg-emerald-100 text-emerald-900 font-semibold'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter & Reset */}
        <div className="flex items-center gap-3">
          <span className="text-stone-500 font-medium">
            Showing <strong className="text-slate-900 font-semibold">{totalResults}</strong> garments
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Drawer (Condition & Gender) */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stone-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1.5">
              Garment Condition
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Any Condition', value: 'all' },
                { label: 'New with Tags', value: 'new_with_tags' },
                { label: 'Like New', value: 'like_new' },
                { label: 'Gently Used', value: 'gently_used' },
                { label: 'Worn with Love', value: 'worn_with_love' },
              ].map((c) => (
                <button
                  key={c.value}
                  onClick={() => onChange({ ...filters, condition: c.value })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filters.condition === c.value
                      ? 'bg-forest-700 text-white font-semibold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1.5">
              Gender / Fit
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'All Fits', value: 'all' },
                { label: 'Women', value: 'Women' },
                { label: 'Men', value: 'Men' },
                { label: 'Unisex', value: 'Unisex' },
              ].map((g) => (
                <button
                  key={g.value}
                  onClick={() => onChange({ ...filters, gender: g.value })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filters.gender === g.value
                      ? 'bg-forest-700 text-white font-semibold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
