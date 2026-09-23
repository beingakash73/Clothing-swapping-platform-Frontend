import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ConditionBadge } from '../components/common/ConditionBadge';
import { 
  ShieldCheck, 
  Users, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  FileSpreadsheet, 
  Search, 
  Check
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { 
    currentUser, 
    switchUser, 
    items, 
    users, 
    disputes, 
    kpis, 
    resolveDispute, 
    deleteListingAsAdmin,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'disputes' | 'sustainability'>('overview');
  const [listingSearch, setListingSearch] = useState('');
  const [resolutionInput, setResolutionInput] = useState<{ [disputeId: string]: string }>({});

  const isAdmin = currentUser?.role === 'admin';

  const filteredListings = items.filter(item =>
    item.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
    item.brand.toLowerCase().includes(listingSearch.toLowerCase()) ||
    item.ownerName.toLowerCase().includes(listingSearch.toLowerCase())
  );

  const handleResolveDispute = (disputeId: string) => {
    const notes = resolutionInput[disputeId] || 'Reviewed by moderator. Both parties compensated with carbon credits.';
    resolveDispute(disputeId, notes);
  };

  const handleExportReport = () => {
    showToast('Platform Sustainability & Moderation Audit exported to CSV!');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Admin Notice Banner if not logged in as Admin */}
      {!isAdmin && (
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-purple-900">
            <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <span className="font-bold">You are viewing the Admin Console as a Member.</span>
              <p className="text-purple-700 mt-0.5">Switch to the Administrator persona (Sarah Connor) for full moderation privileges.</p>
            </div>
          </div>
          <button
            onClick={() => switchUser('user_admin')}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
          >
            Switch to Admin Persona
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Governance & Trust</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
            Admin Management Console
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Moderate community listings, arbitrate swap disputes, and audit real-time circular impact.
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="px-4 py-2.5 bg-stone-900 text-white hover:bg-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export Platform Audit (.CSV)</span>
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs font-semibold overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Platform KPIs & Health' },
          { id: 'listings', label: `Listing Moderation (${items.length})` },
          { id: 'disputes', label: `Dispute Resolution Hub (${disputes.filter(d => d.status !== 'resolved').length} open)` },
          { id: 'sustainability', label: 'Environmental Intelligence' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-purple-900 text-white shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview KPIs */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                <Users className="w-4 h-4 text-purple-600" /> Total Swappers
              </span>
              <div className="text-2xl font-extrabold text-slate-900">
                {kpis.totalUsers.toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium">
                +14.2% growth this month
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                <Layers className="w-4 h-4 text-blue-600" /> Active Listings
              </span>
              <div className="text-2xl font-extrabold text-slate-900">
                {kpis.activeListings.toLocaleString()}
              </div>
              <p className="text-[11px] text-stone-500">
                Across 8 fashion categories
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed Swaps
              </span>
              <div className="text-2xl font-extrabold text-slate-900">
                {kpis.completedSwaps.toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium">
                {kpis.swapSuccessRate}% barter conversion
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Open Disputes
              </span>
              <div className="text-2xl font-extrabold text-slate-900">
                {disputes.filter(d => d.status !== 'resolved').length}
              </div>
              <p className="text-[11px] text-stone-500">
                Under 0.05% dispute rate
              </p>
            </div>
          </div>

          {/* Environmental Aggregate Banner */}
          <div className="p-6 rounded-3xl bg-forest-950 text-white border border-forest-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Cumulative Ecological Milestone
              </span>
              <h3 className="font-serif text-2xl font-bold">
                12,450 kg of Textiles Diverted From Incinerators
              </h3>
              <p className="text-xs text-stone-400 max-w-lg">
                Verified zero-monetary barter trades avoid consumer fast-fashion manufacturing cycles entirely.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/10 text-center">
                <span className="block text-emerald-300 font-bold text-base">23.6M L</span>
                <span className="text-[10px] text-stone-300">Water Conserved</span>
              </div>
              <div className="p-3 rounded-xl bg-white/10 text-center">
                <span className="block text-emerald-300 font-bold text-base">48.1 Tonnes</span>
                <span className="text-[10px] text-stone-300">CO₂ Avoided</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Listing Moderation Table */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search listings, brands, or owners..."
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <span className="text-xs text-stone-500 font-medium">
              Showing {filteredListings.length} of {items.length} items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-100">
                <tr>
                  <th className="p-4">Garment</th>
                  <th className="p-4">Brand & Category</th>
                  <th className="p-4">Condition</th>
                  <th className="p-4">Swap Points</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredListings.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-10 h-12 rounded-lg object-cover ring-1 ring-stone-200 shrink-0"
                        />
                        <div className="min-w-0 max-w-[180px]">
                          <span className="font-bold text-slate-900 block truncate">{item.title}</span>
                          <span className="text-[10px] text-stone-400">Size {item.size}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-800 block">{item.brand}</span>
                      <span className="text-[10px] text-stone-500">{item.category}</span>
                    </td>
                    <td className="p-4">
                      <ConditionBadge condition={item.condition} showDot={false} className="text-[10px]" />
                    </td>
                    <td className="p-4 font-mono font-bold text-forest-800">
                      {item.estimatedSwapValue} pts
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-slate-800 block">{item.ownerName}</span>
                      <span className="text-[10px] text-stone-400">{item.ownerCity}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === 'available' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => deleteListingAsAdmin(item.id)}
                        className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Dispute Resolution */}
      {activeTab === 'disputes' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {disputes.map((disp) => {
            const reporter = users.find(u => u.id === disp.reporterId);
            const reported = users.find(u => u.id === disp.reportedUserId);
            const isResolved = disp.status === 'resolved';

            return (
              <div
                key={disp.id}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                      isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {disp.status.replace('_', ' ')}
                    </span>
                    <span className="font-bold text-slate-800">
                      Dispute Case #{disp.id}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-stone-500 uppercase font-semibold">
                      Reason: {disp.reason.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <span className="text-stone-400">
                    Opened {new Date(disp.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-xs text-stone-700 space-y-2">
                  <div className="flex items-center justify-between text-stone-500 font-medium">
                    <span>Filed by: <strong className="text-slate-800">{reporter?.name || 'Sofia Rossi'}</strong></span>
                    <span>Reported User: <strong className="text-slate-800">{reported?.name || 'External User'}</strong></span>
                  </div>
                  <p className="leading-relaxed text-slate-800 pt-1 border-t border-stone-200/60">
                    "{disp.description}"
                  </p>
                </div>

                {isResolved ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Resolution Notes: </span>
                      <span>{disp.resolutionNotes}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <input
                      type="text"
                      placeholder="Add administrative resolution ruling..."
                      value={resolutionInput[disp.id] || ''}
                      onChange={(e) => setResolutionInput({ ...resolutionInput, [disp.id]: e.target.value })}
                      className="flex-1 w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={() => handleResolveDispute(disp.id)}
                      className="px-5 py-2.5 bg-purple-900 text-white font-bold text-xs rounded-xl hover:bg-purple-950 transition-all shadow-xs shrink-0 w-full sm:w-auto"
                    >
                      Arbitrate & Resolve Dispute
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 4: Sustainability Intelligence */}
      {activeTab === 'sustainability' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900">
              Circularity Impact Breakdown by Garment Category
            </h3>
            <p className="text-xs text-stone-500">
              Water, carbon, and waste diversion metrics based on physical fiber weight.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
              <span className="font-bold text-slate-800 text-sm block">Outerwear & Coats</span>
              <p className="text-stone-500">Highest emissions avoided due to complex synthetic membranes & down fill.</p>
              <div className="pt-2 font-mono text-emerald-700 font-bold">~9.5 kg CO₂ saved / swap</div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
              <span className="font-bold text-slate-800 text-sm block">Denim & Pants</span>
              <p className="text-stone-500">Highest water conservation from heavy cotton agricultural irrigation.</p>
              <div className="pt-2 font-mono text-cyan-700 font-bold">~4,200 L water saved / swap</div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
              <span className="font-bold text-slate-800 text-sm block">Knitwear & Sweaters</span>
              <p className="text-stone-500">Virgin wool and cashmere production avoidance prevents land degradation.</p>
              <div className="pt-2 font-mono text-amber-700 font-bold">~1.4 kg landfill diverted / swap</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
