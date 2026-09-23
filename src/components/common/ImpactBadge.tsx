import React from 'react';
import { Droplet, Wind, Trash2 } from 'lucide-react';

interface ImpactBadgeProps {
  waterLiters?: number;
  co2Kg?: number;
  wasteKg?: number;
  compact?: boolean;
}

export const ImpactBadge: React.FC<ImpactBadgeProps> = ({
  waterLiters,
  co2Kg,
  wasteKg,
  compact = false,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {waterLiters !== undefined && (
        <span 
          title="Fresh water conserved vs. manufacturing new garment"
          className={`inline-flex items-center gap-1 font-medium text-cyan-800 bg-cyan-50 border border-cyan-200 rounded-lg ${
            compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <Droplet className="w-3.5 h-3.5 text-cyan-600" />
          <span>{waterLiters.toLocaleString()}L water</span>
        </span>
      )}
      {co2Kg !== undefined && (
        <span 
          title="Greenhouse gas emissions avoided"
          className={`inline-flex items-center gap-1 font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg ${
            compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <Wind className="w-3.5 h-3.5 text-emerald-600" />
          <span>{co2Kg} kg CO₂</span>
        </span>
      )}
      {wasteKg !== undefined && (
        <span 
          title="Textiles diverted from landfill incinerators"
          className={`inline-flex items-center gap-1 font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg ${
            compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5 text-amber-600" />
          <span>{wasteKg} kg diverted</span>
        </span>
      )}
    </div>
  );
};
