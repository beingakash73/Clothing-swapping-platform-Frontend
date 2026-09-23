import React from 'react';
import { ClothingCondition } from '../../types';

interface ConditionBadgeProps {
  condition: ClothingCondition;
  className?: string;
  showDot?: boolean;
}

export const ConditionBadge: React.FC<ConditionBadgeProps> = ({ 
  condition, 
  className = '', 
  showDot = true 
}) => {
  const getBadgeConfig = () => {
    switch (condition) {
      case 'new_with_tags':
        return {
          label: 'New With Tags',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'like_new':
        return {
          label: 'Like New',
          bg: 'bg-teal-50 text-teal-800 border-teal-200',
          dot: 'bg-teal-500',
        };
      case 'gently_used':
        return {
          label: 'Gently Used',
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'worn_with_love':
        return {
          label: 'Worn With Love',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
      default:
        return {
          label: condition,
          bg: 'bg-gray-50 text-gray-800 border-gray-200',
          dot: 'bg-gray-400',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      {config.label}
    </span>
  );
};
