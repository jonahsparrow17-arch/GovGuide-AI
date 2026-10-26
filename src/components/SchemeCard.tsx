import React from 'react';
import { GovernmentScheme } from '../types';
import { TrustBadge } from './TrustBadge';
import { ArrowRight, Sparkles, ExternalLink, Building2, CheckCircle, FileText, Gift } from 'lucide-react';

interface SchemeCardProps {
  scheme: GovernmentScheme;
  onSelect?: (slug: string) => void;
  onViewGuide?: (slug: string) => void;
  onOpenChecklist?: (slug: string) => void;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  onSelect,
  onViewGuide,
  onOpenChecklist
}) => {
  const handleSelectScheme = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof onSelect === 'function') {
      onSelect(scheme.slug);
    } else if (typeof onViewGuide === 'function') {
      onViewGuide(scheme.slug);
    } else {
      console.warn(`[SchemeCard] No navigation callback provided for scheme "${scheme.slug}"`);
    }
  };

  const handleOpenChecklist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onOpenChecklist === 'function') {
      onOpenChecklist(scheme.slug);
    } else {
      handleSelectScheme();
    }
  };

  return (
    <div
      id={`scheme-card-${scheme.slug}`}
      className="bg-white rounded-2xl border border-slate-200/80 p-6 hover:shadow-lg hover:border-blue-300 transition-all flex flex-col justify-between group cursor-pointer"
      onClick={handleSelectScheme}
    >
      <div>
        {/* Top bar with category & status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100/80">
            {scheme.category}
          </span>
          <TrustBadge status={scheme.status} size="sm" />
        </div>

        {/* Title */}
        <h3
          onClick={handleSelectScheme}
          className="text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors cursor-pointer leading-snug mb-2 font-sans"
        >
          {scheme.name}
        </h3>

        {/* Department / Authority */}
        <div className="flex items-start gap-1.5 text-xs text-slate-500 mb-4">
          <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
          <span className="line-clamp-1">{scheme.department}</span>
        </div>

        {/* Benefit Highlight Box */}
        <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/50 border border-amber-200/70 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wide mb-1">
            <Gift className="w-3.5 h-3.5 text-amber-600" />
            <span>Key Benefit</span>
          </div>
          <p className="text-sm font-semibold text-slate-900">{scheme.benefit}</p>
        </div>

        {/* Who Can Apply */}
        <div className="space-y-1.5 mb-4 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Who Can Apply:
          </span>
          <p className="text-slate-700 leading-relaxed line-clamp-2">
            {scheme.who_can_apply}
          </p>
        </div>
      </div>

      {/* Footer Area */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{scheme.documents.length} Docs</span>
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>{scheme.application_steps.length} Steps</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenChecklist && (
            <button
              type="button"
              id={`checklist-scheme-btn-${scheme.slug}`}
              onClick={handleOpenChecklist}
              className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-2 rounded-xl transition-colors"
            >
              Checklist
            </button>
          )}

          <button
            type="button"
            id={`view-scheme-btn-${scheme.slug}`}
            onClick={handleSelectScheme}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl border border-blue-200 transition-colors"
          >
            <span>View Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
