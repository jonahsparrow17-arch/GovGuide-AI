import React, { useState, useEffect } from 'react';
import { GovernmentScheme, TrustStatus } from '../types';
import { fetchSchemes } from '../services/api';
import { SchemeCard } from '../components/SchemeCard';
import { SchemeFilterBar } from '../components/SchemeFilterBar';
import { Landmark, Sparkles, Compass, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';

interface SchemesPageProps {
  onSelectScheme: (slug: string) => void;
  onOpenWizard: () => void;
  onOpenChecklist: (slug: string) => void;
  onAskAI: (query: string) => void;
}

export const SchemesPage: React.FC<SchemesPageProps> = ({
  onSelectScheme,
  onOpenWizard,
  onOpenChecklist,
  onAskAI
}) => {
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TrustStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchSchemes(selectedCategory || undefined, selectedStatus || undefined);
        setSchemes(data);
      } catch (err) {
        console.error('Failed to load schemes:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedCategory, selectedStatus]);

  const filteredSchemes = schemes.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.benefit.toLowerCase().includes(q) ||
      s.who_can_apply.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold text-blue-300">
            <Landmark className="w-3.5 h-3.5 text-blue-400" />
            <span>Civic Welfare & Scheme Directory</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Government Welfare <span className="text-blue-300">Schemes Directory</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Verified, plain-language guides for education scholarships, women empowerment allowances, youth skill programs, farmer grants, senior pensions, and disability benefits.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              id="open-schemes-wizard-btn"
              onClick={onOpenWizard}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Find Schemes for Me (Smart Wizard)</span>
            </button>

            <button
              onClick={() => onAskAI("What government schemes provide ₹1,000 per month financial assistance in Tamil Nadu?")}
              className="inline-flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>Ask AI About Schemes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Component */}
      <SchemeFilterBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalResults={filteredSchemes.length}
      />

      {/* Scheme Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded w-4/5" />
              <div className="h-16 bg-slate-100 rounded-xl" />
              <div className="h-12 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : filteredSchemes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No schemes found matching criteria</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Try resetting your category filters or search for another keyword like "scholarship", "laptop", "pension", or "bus".
          </p>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSelectedStatus(null);
              setSearchQuery('');
            }}
            className="text-xs font-bold text-blue-900 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onSelect={onSelectScheme}
              onOpenChecklist={onOpenChecklist}
            />
          ))}
        </div>
      )}

      {/* Trust & Transparency Footnote */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            <strong>Data Accuracy Commitment:</strong> Every scheme in this directory is grounded in official government gazettes, department orders, and verifiable <code>.gov.in</code> websites.
          </span>
        </div>
        <button
          onClick={onOpenWizard}
          className="text-blue-900 font-bold hover:underline shrink-0 inline-flex items-center gap-1"
        >
          <span>Use Eligibility Wizard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
