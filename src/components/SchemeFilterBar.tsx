import React from 'react';
import { SchemeCategory, TrustStatus } from '../types';
import {
  GraduationCap,
  Users,
  Briefcase,
  Accessibility,
  HeartHandshake,
  Home,
  Sprout,
  Landmark,
  Layers,
  Filter,
  X
} from 'lucide-react';

interface SchemeFilterBarProps {
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  selectedStatus: TrustStatus | null;
  onSelectStatus: (status: TrustStatus | null) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalResults: number;
}

const CATEGORIES: { name: SchemeCategory; icon: any }[] = [
  { name: 'Education & Students', icon: GraduationCap },
  { name: 'Women & Family', icon: Users },
  { name: 'Employment & Skills', icon: Briefcase },
  { name: 'Differently Abled', icon: Accessibility },
  { name: 'Senior Citizens', icon: HeartHandshake },
  { name: 'Housing / Welfare', icon: Home },
  { name: 'Livelihood', icon: Sprout },
  { name: 'Other Government Schemes', icon: Landmark }
];

export const SchemeFilterBar: React.FC<SchemeFilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  totalResults
}) => {
  const hasActiveFilters = selectedCategory !== null || selectedStatus !== null || searchQuery !== '';

  const clearAll = () => {
    onSelectCategory(null);
    onSelectStatus(null);
    onSearchChange('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5 shadow-sm">
      {/* Search & Status Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            id="scheme-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search schemes by name, keyword, or benefit (e.g. ₹1000, bus pass, laptop, pension)..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </span>
          <select
            id="scheme-status-filter"
            value={selectedStatus || ''}
            onChange={(e) => onSelectStatus((e.target.value as TrustStatus) || null)}
            className="bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Verification Statuses</option>
            <option value="VERIFIED">🟢 VERIFIED (Official Source Confirmed)</option>
            <option value="ACTIVE">🔵 ACTIVE (Current Scheme)</option>
            <option value="ANNOUNCED">🟡 ANNOUNCED (Details in Progress)</option>
            <option value="DETAILS_PENDING">🟠 DETAILS PENDING</option>
            <option value="NEEDS_VERIFICATION">🔴 NEEDS VERIFICATION</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Filter by Category (8 Schemes Sectors):
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-900">{totalResults}</strong> schemes
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            id="category-pill-all"
            onClick={() => onSelectCategory(null)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === null
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </button>

          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                id={`category-pill-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => onSelectCategory(isSelected ? null : cat.name)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-blue-900 text-white shadow-sm ring-2 ring-blue-600/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
