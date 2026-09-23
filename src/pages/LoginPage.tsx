import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Leaf, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  User as UserIcon, 
  MapPin, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Repeat, 
  Droplet,
  LogIn
} from 'lucide-react';

interface LoginPageProps {
  onNavigate: (view: string) => void;
  initialMode?: 'login' | 'register';
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, initialMode = 'login' }) => {
  const { users, login, register, isAuthenticated, currentUser } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('maya@threadloop.org');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCity, setRegCity] = useState('New York');
  const [regState, setRegState] = useState('NY');
  const [regBio, setRegBio] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);

  // If already logged in, show quick switch or redirect
  const handleQuickLogin = async (userId: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await login(userId);
      if (res.success) {
        onNavigate('dashboard');
      } else {
        setErrorMessage(res.message || 'Login failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier) {
      setErrorMessage('Please enter your email or username.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await login(loginIdentifier, loginPassword);
      if (res.success) {
        onNavigate('dashboard');
      } else {
        setErrorMessage(res.message || 'Account not found. Please check credentials or use a demo account.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) {
      setErrorMessage('Please provide your name and email address.');
      return;
    }
    if (!agreedTerms) {
      setErrorMessage('Please accept the sustainable community charter to proceed.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await register({
        name: regName,
        email: regEmail,
        city: regCity,
        state: regState,
        bio: regBio,
      });
      if (res.success) {
        onNavigate('dashboard');
      } else {
        setErrorMessage(res.message || 'Registration could not be completed.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F7F4EE] via-[#FAF8F5] to-white flex items-center justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Col: Sustainable Brand Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-forest-900 via-forest-800 to-forest-950 rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl border border-forest-700/50">
          {/* Subtle eco background glow */}
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-forest-400/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold tracking-wide uppercase">
              <Leaf className="w-3.5 h-3.5" /> Pure Circular Wardrobe
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                Swap Clothes. <br />
                <span className="text-emerald-400">Zero Money.</span> <br />
                Infinite Style.
              </h2>
              <p className="mt-3 text-sm text-stone-300 leading-relaxed">
                Join a community of conscious fashion enthusiasts trading quality garments directly using fair exchange valuations.
              </p>
            </div>

            {/* Impact Highlights */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Save ~2,700L Water Per Swap</h4>
                  <p className="text-[11px] text-stone-300">Equal to 3 years of average human drinking water.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Repeat className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Algorithmic Fair Swap Value</h4>
                  <p className="text-[11px] text-stone-300">Objective parity based on condition, brand tier, and material.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Escrow-Style Double Confirmation</h4>
                  <p className="text-[11px] text-stone-300">Both parties verify received garments before completion.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-forest-700/60 mt-6 flex items-center justify-between text-xs text-stone-300">
            <span>ThreadLoop Platform</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" /> 100% Circular
            </span>
          </div>
        </div>

        {/* Right Col: Auth Forms & Persona Quick Logins */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-xl flex flex-col justify-between">
          <div>
            {/* Header & Tabs */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 font-serif">
                  {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {mode === 'login' 
                    ? 'Enter your credentials or choose a quick demo persona.' 
                    : 'Start swapping garments with zero monetary transactions.'}
                </p>
              </div>

              {/* Toggle Switch */}
              <div className="flex p-1 bg-stone-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMessage(null); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mode === 'login' 
                      ? 'bg-white text-forest-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMessage(null); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mode === 'register' 
                      ? 'bg-white text-forest-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold">!</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Currently Logged In Banner */}
            {isAuthenticated && currentUser && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/30"
                  />
                  <div>
                    <span className="text-xs text-emerald-800 font-semibold block">
                      Currently active as: <strong className="text-emerald-950">{currentUser.name}</strong>
                    </span>
                    <span className="text-[11px] text-emerald-700 block">
                      {currentUser.role === 'admin' ? '🛡️ Administrator' : `${currentUser.completedSwaps} completed trades`} • {currentUser.location.city}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-sm"
                >
                  Go to Dashboard →
                </button>
              </div>
            )}

            {/* FORM: Sign In */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Email or User Handle
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. maya@threadloop.org or user_maya"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:border-forest-600 bg-stone-50/50"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Password
                    </label>
                    <span className="text-[11px] text-forest-700 hover:underline cursor-pointer font-medium">
                      Demo password auto-filled
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:border-forest-600 bg-stone-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                    <input type="checkbox" defaultChecked className="rounded text-forest-700 focus:ring-forest-500" />
                    <span>Remember my session</span>
                  </label>
                  <button 
                    type="button"
                    onClick={() => {
                      setLoginIdentifier('maya@threadloop.org');
                      setLoginPassword('password123');
                    }}
                    className="text-forest-700 hover:text-forest-900 font-semibold underline underline-offset-2"
                  >
                    Reset to Default Demo
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  {isSubmitting ? 'Authenticating...' : 'Sign In to Marketplace'}
                </button>
              </form>
            ) : (
              /* FORM: Register */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Clara Oswald"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-forest-500/40 bg-stone-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="clara@example.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-forest-500/40 bg-stone-50/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      City
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        placeholder="New York"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-forest-500/40 bg-stone-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={regState}
                      onChange={(e) => setRegState(e.target.value)}
                      placeholder="NY"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-forest-500/40 bg-stone-50/50 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Create a secure password"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-forest-500/40 bg-stone-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Style Bio / Closet Philosophy <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={regBio}
                    onChange={(e) => setRegBio(e.target.value)}
                    placeholder="e.g. Love 90s vintage knitwear and minimal Scandinavian tailoring."
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-forest-500/40 bg-stone-50/50"
                  />
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 rounded text-forest-700 focus:ring-forest-500"
                    />
                    <span>
                      I commit to honest condition descriptions and zero-cash circular garment swapping.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  {isSubmitting ? 'Creating Profile...' : 'Complete Registration & Start Swapping'}
                </button>
              </form>
            )}

            {/* Quick Demo Personas Selector */}
            <div className="mt-8 pt-6 border-t border-stone-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  ⚡ 1-Click Demo Profiles
                </span>
                <span className="text-[11px] text-slate-400">
                  Instant switch for testing
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {users.slice(0, 4).map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(u.id)}
                      className={`p-2.5 rounded-2xl border text-left transition-all relative flex flex-col items-center sm:items-start text-center sm:text-left ${
                        isCurrent
                          ? 'border-forest-600 bg-forest-50/80 ring-1 ring-forest-500 shadow-sm'
                          : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-9 h-9 rounded-xl object-cover mb-1.5 ring-1 ring-stone-200"
                      />
                      <span className="text-xs font-bold text-slate-900 block truncate max-w-full">
                        {u.name}
                      </span>
                      <span className="text-[10px] text-forest-700 font-medium block">
                        {u.role === 'admin' ? '🛡️ Admin' : `${u.completedSwaps} Swaps`}
                      </span>
                      {isCurrent && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-4">
            <button onClick={() => onNavigate('home')} className="hover:text-forest-700 underline underline-offset-2">
              ← Return to Marketplace Home
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('prd')} className="hover:text-forest-700 underline underline-offset-2">
              Platform PRD Spec
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
