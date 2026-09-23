import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ItemCard } from '../components/items/ItemCard';
import { ItemFilters, FilterState } from '../components/items/ItemFilters';
import { ItemMapRadar } from '../components/items/ItemMapRadar';
import { calculateDistanceKm } from '../utils/formatters';
import { Compass, RotateCcw } from 'lucide-react';

interface ExplorePageProps {
  onNavigate: (view: string, itemId?: string) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ onNavigate }) => {
  const { items, currentUser, openSwapModal } = useApp();

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    gender: 'all',
    condition: 'all',
    maxDistanceKm: 0,
    sortBy: 'recommended',
    viewMode: 'grid',
  });

  // Filtered & Sorted Items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search query filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        item =>
          item.title.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.material?.toLowerCase().includes(q) ||
          item.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter(item => item.category === filters.category);
    }

    // Gender filter
    if (filters.gender !== 'all') {
      result = result.filter(item => item.gender === filters.gender || item.gender === 'Unisex');
    }

    // Condition filter
    if (filters.condition !== 'all') {
      result = result.filter(item => item.condition === filters.condition);
    }

    const userLat = currentUser?.location.lat ?? 40.7128;
    const userLng = currentUser?.location.lng ?? -74.0060;

    // Distance filter
    if (filters.maxDistanceKm > 0) {
      result = result.filter(item => {
        const dist = calculateDistanceKm(
          userLat,
          userLng,
          item.coordinates.lat,
          item.coordinates.lng
        );
        return dist <= filters.maxDistanceKm;
      });
    }

    // Sorting
    if (filters.sortBy === 'nearest') {
      result.sort((a, b) => {
        const distA = calculateDistanceKm(userLat, userLng, a.coordinates.lat, a.coordinates.lng);
        const distB = calculateDistanceKm(userLat, userLng, b.coordinates.lat, b.coordinates.lng);
        return distA - distB;
      });
    } else if (filters.sortBy === 'value_high') {
      result.sort((a, b) => b.estimatedSwapValue - a.estimatedSwapValue);
    } else if (filters.sortBy === 'value_low') {
      result.sort((a, b) => a.estimatedSwapValue - b.estimatedSwapValue);
    } else if (filters.sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [items, filters, currentUser]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="mb-6 space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-700">
          <Compass className="w-4 h-4" />
          <span>Circular Marketplace</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
          Explore Garments for Direct Swap
        </h1>
        <p className="text-sm text-stone-600">
          Browse items offered by conscious fashion lovers across New York and nationwide.
        </p>
      </div>

      {/* Filter Bar */}
      <ItemFilters
        filters={filters}
        onChange={setFilters}
        totalResults={filteredItems.length}
      />

      {/* View Switch: Grid vs Map */}
      {filters.viewMode === 'map' ? (
        <ItemMapRadar
          items={filteredItems}
          onSelectItem={(id) => onNavigate('item_detail', id)}
          onProposeSwap={(it) => openSwapModal(it)}
        />
      ) : (
        <>
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                No matching garments found
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Try widening your distance radius, searching for different brand keywords, or clearing selected categories.
              </p>
              <button
                onClick={() => setFilters({
                  searchQuery: '',
                  category: 'all',
                  gender: 'all',
                  condition: 'all',
                  maxDistanceKm: 0,
                  sortBy: 'recommended',
                  viewMode: 'grid',
                })}
                className="px-4 py-2 text-xs font-bold text-forest-800 bg-forest-50 hover:bg-forest-100 rounded-xl inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onViewDetails={(id) => onNavigate('item_detail', id)}
                  onProposeSwap={(it) => openSwapModal(it)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
