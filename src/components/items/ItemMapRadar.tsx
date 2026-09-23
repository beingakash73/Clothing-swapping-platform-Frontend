import React, { useState } from 'react';
import { ClothingItem, MeetupLocation } from '../../types';
import { MOCK_SWAP_HUBS } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { calculateDistanceKm } from '../../utils/formatters';
import { ShieldCheck, ArrowLeftRight, Navigation } from 'lucide-react';

interface ItemMapRadarProps {
  items: ClothingItem[];
  onSelectItem: (itemId: string) => void;
  onProposeSwap: (item: ClothingItem) => void;
}

export const ItemMapRadar: React.FC<ItemMapRadarProps> = ({
  items,
  onSelectItem,
  onProposeSwap,
}) => {
  const { currentUser } = useApp();
  const [selectedPin, setSelectedPin] = useState<ClothingItem | null>(items[0] || null);
  const [selectedHub, setSelectedHub] = useState<MeetupLocation | null>(null);

  // Approximate relative mapping inside an illustrated canvas grid for Brooklyn/Manhattan/Queens coordinates:
  // Lat: 40.67 to 40.75 (span 0.08)
  // Lng: -74.01 to -73.93 (span 0.08)
  const getCoordinatesPct = (lat: number, lng: number) => {
    const minLat = 40.665;
    const maxLat = 40.755;
    const minLng = -74.005;
    const maxLng = -73.935;

    const x = Math.max(5, Math.min(95, ((lng - minLng) / (maxLng - minLng)) * 100));
    // Invert Y because higher latitude is North
    const y = Math.max(5, Math.min(95, (1 - (lat - minLat) / (maxLat - minLat)) * 100));
    return { x, y };
  };

  const userLat = currentUser?.location.lat ?? 40.7128;
  const userLng = currentUser?.location.lng ?? -74.0060;
  const userCity = currentUser?.location.city ?? 'New York';
  const userPos = getCoordinatesPct(userLat, userLng);

  return (
    <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
      {/* Map Header */}
      <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-emerald-600" />
            Location-Based Radar & Local Safe Hubs
          </h3>
          <p className="text-xs text-stone-500">
            Discover garments in your neighborhood to minimize shipping emissions
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-slate-700">
            <span className="w-3 h-3 rounded-full bg-forest-700 border-2 border-white shadow-xs" />
            Clothing Items ({items.length})
          </span>
          <span className="flex items-center gap-1 text-slate-700">
            <span className="w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow-xs" />
            Safe Swap Hubs ({MOCK_SWAP_HUBS.length})
          </span>
          <span className="flex items-center gap-1 text-slate-700 font-semibold text-emerald-700">
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-300 shadow-xs" />
            You ({userCity})
          </span>
        </div>
      </div>

      {/* Interactive Map Canvas Simulator */}
      <div className="relative w-full h-[520px] bg-[#E8ECE9] overflow-hidden select-none">
        {/* Subtle Map Grid / Water / City Vector Backdrop */}
        <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#A7B5A9" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* East River Path simulation */}
          <path
            d="M 280 0 Q 340 180 390 320 T 420 520"
            fill="none"
            stroke="#BDD3C5"
            strokeWidth="50"
            strokeLinecap="round"
          />
        </svg>

        {/* Neighborhood Labels */}
        <span className="absolute top-10 left-12 text-[10px] font-bold tracking-widest uppercase text-stone-500/70">
          Manhattan
        </span>
        <span className="absolute top-44 right-16 text-[10px] font-bold tracking-widest uppercase text-stone-500/70">
          Queens (LIC)
        </span>
        <span className="absolute bottom-12 left-28 text-[10px] font-bold tracking-widest uppercase text-stone-500/70">
          Brooklyn
        </span>

        {/* User Location Radar Pulse */}
        <div
          style={{ left: `${userPos.x}%`, top: `${userPos.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 animate-ping absolute -inset-0 m-auto" />
          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shadow-lg ring-4 ring-emerald-300/60">
            YOU
          </div>
        </div>

        {/* Community Safe Hub Pins */}
        {MOCK_SWAP_HUBS.map((hub, idx) => {
          const pos = getCoordinatesPct(hub.lat, hub.lng);
          const isSelected = selectedHub?.name === hub.name;
          return (
            <button
              key={idx}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onClick={() => {
                setSelectedHub(hub);
                setSelectedPin(null);
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-transform ${
                isSelected ? 'scale-125 z-30' : 'hover:scale-115'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="p-1.5 rounded-full bg-amber-500 text-white shadow-md ring-2 ring-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="mt-0.5 text-[9px] font-bold bg-white/90 px-1.5 py-0.2 rounded-md shadow-2xs text-stone-800 whitespace-nowrap">
                  {hub.name.split(' ')[0]} Hub
                </span>
              </div>
            </button>
          );
        })}

        {/* Garment Pins */}
        {items.map((item) => {
          const pos = getCoordinatesPct(item.coordinates.lat, item.coordinates.lng);
          const isSelected = selectedPin?.id === item.id;
          return (
            <button
              key={item.id}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onClick={() => {
                setSelectedPin(item);
                setSelectedHub(null);
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all ${
                isSelected ? 'scale-125 z-30' : 'hover:scale-115'
              }`}
            >
              <div className="relative group">
                <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-forest-700 bg-white shadow-md">
                  <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <span className="absolute -bottom-1 -right-1 px-1 rounded-md bg-forest-900 text-[9px] text-white font-bold shadow-2xs">
                  {item.estimatedSwapValue}p
                </span>
              </div>
            </button>
          );
        })}

        {/* Selected Item Floating Preview Card */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200 p-4 shadow-xl z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex gap-3">
              <img
                src={selectedPin.images[0]}
                alt={selectedPin.title}
                className="w-16 h-20 rounded-xl object-cover ring-1 ring-stone-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold uppercase text-forest-800 truncate">
                    {selectedPin.brand}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {calculateDistanceKm(
                      userLat,
                      userLng,
                      selectedPin.coordinates.lat,
                      selectedPin.coordinates.lng
                    )} km away
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {selectedPin.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-stone-500 mt-1">
                  <span>Size {selectedPin.size}</span>
                  <span className="font-bold text-forest-900">{selectedPin.estimatedSwapValue} pts</span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => onSelectItem(selectedPin.id)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors text-center"
                  >
                    View Details
                  </button>
                  {currentUser && selectedPin.ownerId !== currentUser.id && (
                    <button
                      onClick={() => onProposeSwap(selectedPin)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white bg-forest-800 hover:bg-forest-900 transition-colors flex items-center justify-center gap-1 shadow-xs"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>Swap</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Hub Floating Preview Card */}
        {selectedHub && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl border border-amber-200 p-4 shadow-xl z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                  Verified Safe Hub
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  {selectedHub.name}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  {selectedHub.address}
                </p>
                <p className="text-[11px] text-stone-600 mt-2 bg-stone-50 p-2 rounded-lg border border-stone-200">
                  Public, well-lit swap venue with seating and garment inspection tables.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
