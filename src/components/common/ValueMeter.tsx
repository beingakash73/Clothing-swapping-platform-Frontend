import React from 'react';
import { evaluateSwapFairness } from '../../utils/calculator';
import { Scale, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ValueMeterProps {
  requestedValue: number;
  offeredValue: number;
  requestedTitle?: string;
  offeredTitle?: string;
  showDetails?: boolean;
}

export const ValueMeter: React.FC<ValueMeterProps> = ({
  requestedValue,
  offeredValue,
  requestedTitle = 'Requested Item',
  offeredTitle = 'Offered Item(s)',
  showDetails = true,
}) => {
  const fairness = evaluateSwapFairness(requestedValue, offeredValue);

  const getBarColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 65) return 'bg-teal-500';
    if (score >= 45) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getStatusIcon = () => {
    if (fairness.score >= 85) return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    if (fairness.score >= 60) return <Scale className="w-4 h-4 text-teal-600" />;
    return <AlertCircle className="w-4 h-4 text-amber-600" />;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-semibold text-slate-800">
            Fairness Score: {fairness.score}%
          </span>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {fairness.message}
        </span>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
        <div 
          className={`h-full transition-all duration-500 rounded-full ${getBarColor(fairness.score)}`}
          style={{ width: `${Math.min(100, Math.max(5, fairness.score))}%` }}
        />
      </div>

      {showDetails && (
        <>
          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-3 pt-1">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block truncate">{offeredTitle}</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-bold text-sm text-slate-800">{offeredValue} pts</span>
                <span className="text-slate-400">value</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block truncate">{requestedTitle}</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-bold text-sm text-slate-800">{requestedValue} pts</span>
                <span className="text-slate-400">value</span>
              </div>
            </div>
          </div>

          {/* Advice Pill */}
          <div className="flex items-start gap-2 text-xs text-slate-600 bg-emerald-50/70 border border-emerald-100/80 rounded-lg p-2.5">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{fairness.advice}</p>
          </div>
        </>
      )}
    </div>
  );
};
