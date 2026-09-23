import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Repeat, 
  PlusCircle, 
  MessageSquare, 
  ArrowLeftRight, 
  User as UserIcon, 
  ShieldCheck, 
  Compass, 
  Calculator, 
  FileText, 
  ChevronDown, 
  Sparkles, 
  MapPin,
  LogIn,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, itemId?: string) => void;
  onOpenCreateListing: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  onNavigate, 
  onOpenCreateListing 
}) => {
  const { currentUser, isAuthenticated, users, switchUser, swaps, isApiConnected, logout } = useApp();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Count active pending swaps for current user if logged in
  const pendingSwapsCount = currentUser ? swaps.filter(
    s => (s.receiverId === currentUser.id && s.status === 'pending') || 
         (s.status === 'negotiating' && (s.receiverId === currentUser.id || s.requesterId === currentUser.id))
  ).length : 0;

  const navItems = [
    { id: 'home', label: 'Home', icon: Sparkles },
    { id: 'explore', label: 'Explore Closet', icon: Compass },
    { id: 'calculator', label: 'Value Calculator', icon: Calculator },
    { 
      id: 'swaps', 
      label: 'My Swaps', 
      icon: ArrowLeftRight, 
      badge: pendingSwapsCount > 0 ? pendingSwapsCount : undefined 
    },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'dashboard', label: 'My Closet', icon: UserIcon },
    { id: 'prd', label: 'PRD Docs', icon: FileText },
  ];

  if (currentUser && currentUser.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Hub', icon: ShieldCheck });
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      {/* Top micro-bar: Environmental commitment banner */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-900 text-stone-200 px-4 py-1 text-xs font-medium flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-300 font-semibold">Zero Cash • Pure Circular Barter</span> — Over 12,450 kg of clothing saved from landfills!
          </span>

          <div className="hidden md:flex items-center gap-4 text-stone-300">
            <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase transition-colors ${
              isApiConnected 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isApiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isApiConnected ? 'Spring Boot & MongoDB: Live' : 'Backend: Disconnected (Offline)'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              Active in New York & Local Swap Hubs
            </span>
            <button 
              onClick={() => onNavigate('prd')}
              className="text-emerald-300 hover:text-white transition-colors underline underline-offset-2"
            >
              View System PRD
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-forest-800 to-forest-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Repeat className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="font-serif font-bold text-xl text-forest-900 tracking-tight block leading-tight">
                ThreadLoop
              </span>
              <span className="text-[10px] text-stone-400 tracking-wider uppercase font-semibold block">
                Circular Garment Exchange
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-forest-50 text-forest-800 font-semibold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-forest-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-0.5 px-1.5 py-0.2 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons & Authentication / Role Switcher */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* List An Item Button */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  onNavigate('login');
                } else {
                  onOpenCreateListing();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-forest-700 text-white hover:bg-forest-800 active:scale-95 transition-all shadow-sm hover:shadow-md"
            >
              <PlusCircle className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">List Garment</span>
            </button>

            {isAuthenticated && currentUser ? (
              /* Authenticated User Menu Dropdown */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-300 transition-all text-left focus:outline-none shadow-2xs"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-forest-600/30"
                  />
                  <div className="hidden xl:block">
                    <span className="text-xs font-semibold text-slate-800 block truncate max-w-[90px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-forest-700 block capitalize font-medium">
                      {currentUser.role === 'admin' ? '🛡️ Admin' : `${currentUser.completedSwaps} swaps`}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Persona Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                          Signed in as
                        </span>
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {currentUser.name} ({currentUser.email})
                        </span>
                      </div>
                    </div>

                    <div className="p-1 border-b border-stone-100">
                      <button
                        onClick={() => {
                          onNavigate('dashboard');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-700 hover:bg-stone-50"
                      >
                        <UserIcon className="w-4 h-4 text-forest-700" />
                        <span>My Closet & Eco Scorecard</span>
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('swaps');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-700 hover:bg-stone-50"
                      >
                        <ArrowLeftRight className="w-4 h-4 text-forest-700" />
                        <span>My Active Swaps</span>
                        {pendingSwapsCount > 0 && (
                          <span className="ml-auto px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                            {pendingSwapsCount}
                          </span>
                        )}
                      </button>
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium text-purple-700 hover:bg-purple-50"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>Admin Moderation Hub</span>
                        </button>
                      )}
                    </div>

                    {/* Switch Persona Sub-section */}
                    <div className="px-3 pt-2 pb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Switch Demo Persona
                      </span>
                    </div>

                    <div className="px-1 max-h-40 overflow-y-auto">
                      {users.map((u) => {
                        const isSelected = u.id === currentUser.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              switchUser(u.id);
                              setUserMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left transition-colors ${
                              isSelected ? 'bg-forest-50 border border-forest-200' : 'hover:bg-stone-50'
                            }`}
                          >
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-7 h-7 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-semibold text-slate-800 truncate block">
                                {u.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {u.role === 'admin' ? '🛡️ Admin' : `${u.completedSwaps} swaps • ${u.location.city}`}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Sign Out Button */}
                    <div className="px-2 pt-2 mt-1 border-t border-stone-100">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onNavigate('logout');
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Unauthenticated Login / Register CTAs */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-forest-800 hover:bg-stone-100 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-xs"
                >
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-stone-100 gap-2 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive 
                    ? 'bg-forest-800 text-white font-semibold' 
                    : 'bg-stone-100 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          {!isAuthenticated && (
            <button
              onClick={() => onNavigate('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-emerald-600 text-white"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
