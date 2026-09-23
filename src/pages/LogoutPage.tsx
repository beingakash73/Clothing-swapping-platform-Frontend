import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LogOut, 
  LogIn, 
  Sparkles, 
  Leaf, 
  HeartHandshake, 
  RotateCcw, 
  Home, 
  Droplet, 
  Wind, 
  CheckCircle2 
} from 'lucide-react';

interface LogoutPageProps {
  onNavigate: (view: string) => void;
}

export const LogoutPage: React.FC<LogoutPageProps> = ({ onNavigate }) => {
  const { currentUser, isAuthenticated, logout, showToast } = useApp();

  // Snapshot user details before logout happens
  const previousUser = currentUser;

  const handleConfirmLogout = () => {
    logout();
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F7F4EE] via-[#FAF8F5] to-white flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/90 shadow-2xl text-center relative overflow-hidden">
        
        {/* Top Eco Badge */}
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <LogOut className="w-8 h-8" />
        </div>

        {isAuthenticated && previousUser ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              Sign Out of ThreadLoop
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Are you sure you want to end your active session as <strong className="text-slate-800">{previousUser.name}</strong>?
            </p>

            {/* Impact Summary Card */}
            <div className="mt-6 p-5 rounded-2xl bg-stone-50 border border-stone-200/80 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Your Circular Contribution
                </span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5" /> Eco Score: {previousUser.ecoScore}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2.5 rounded-xl bg-white border border-stone-100 shadow-sm">
                  <span className="text-base font-bold text-emerald-700 block">
                    {previousUser.completedSwaps}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-medium">
                    Trades Done
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-stone-100 shadow-sm">
                  <span className="text-base font-bold text-sky-700 block">
                    {previousUser.waterSavedLiters.toLocaleString()} L
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-medium">
                    Water Saved
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-stone-100 shadow-sm">
                  <span className="text-base font-bold text-teal-700 block">
                    {previousUser.co2SavedKg} kg
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-medium">
                    CO₂ Prevented
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Confirm Sign Out
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex-1 py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-semibold text-sm transition-all"
              >
                Stay Logged In
              </button>
            </div>
          </>
        ) : (
          /* When already logged out */
          <>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Signed Out Successfully
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              You're Safely Logged Out
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Thank you for keeping fashion circular and zero-waste. Come back anytime to explore new garments and negotiate trades!
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => onNavigate('login')}
                className="py-3 px-6 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-emerald-300" />
                Sign Back In
              </button>
              <button
                onClick={() => onNavigate('explore')}
                className="py-3 px-6 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Browse Marketplace
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
