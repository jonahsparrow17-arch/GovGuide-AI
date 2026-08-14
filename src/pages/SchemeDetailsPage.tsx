import React, { useState, useEffect } from 'react';
import { GovernmentScheme } from '../types';
import { fetchSchemeBySlug } from '../services/api';
import { TrustBadge } from '../components/TrustBadge';
import {
  ArrowLeft,
  Gift,
  Users,
  CheckCircle2,
  ListOrdered,
  FileText,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  Copy,
  Check,
  Sparkles,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

interface SchemeDetailsPageProps {
  slug: string;
  onBack: () => void;
  onAskAI: (query: string) => void;
  onOpenChecklist?: (slug: string) => void;
}

export const SchemeDetailsPage: React.FC<SchemeDetailsPageProps> = ({
  slug,
  onBack,
  onAskAI,
  onOpenChecklist
}) => {
  const [scheme, setScheme] = useState<GovernmentScheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedChecklist, setCopiedChecklist] = useState(false);
  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchSchemeBySlug(slug);
        setScheme(data);
      } catch (err) {
        console.error('Failed to load scheme details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse" />
        <div className="h-12 bg-slate-200 rounded w-3/4 animate-pulse" />
        <div className="h-48 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Scheme not found</h2>
        <p className="text-sm text-slate-500">The requested scheme guide could not be located.</p>
        <button
          onClick={onBack}
          className="text-xs font-bold text-blue-900 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100"
        >
          Return to Schemes Directory
        </button>
      </div>
    );
  }

  const toggleDoc = (index: number) => {
    setCheckedDocs(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleCopyChecklist = () => {
    const text = `Document Checklist for ${scheme.name}:\n` +
      scheme.documents.map((d, i) => `${i + 1}. ${d}`).join('\n') +
      `\n\nOfficial Source: ${scheme.official_source}\n(Verified via GovGuide AI)`;
    navigator.clipboard.writeText(text);
    setCopiedChecklist(true);
    setTimeout(() => setCopiedChecklist(false), 2500);
  };

  const completedDocsCount = scheme.documents.filter((_, i) => checkedDocs[i]).length;
  const progressPercent = scheme.documents.length > 0
    ? Math.round((completedDocsCount / scheme.documents.length) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          id="scheme-back-button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Schemes</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAskAI(`What are the key benefits, eligibility rules, and required documents for ${scheme.name}?`)}
            className="inline-flex items-center gap-1.5 bg-blue-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-blue-950 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ask AI About This</span>
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
              {scheme.category}
            </span>
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              {scheme.state_or_central}
            </span>
          </div>

          <TrustBadge status={scheme.status} showDescription={false} size="md" />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight leading-snug">
            {scheme.name}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{scheme.department}</span>
          </div>
        </div>

        {/* BENEFIT Callout Box */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-300/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 uppercase tracking-wider mb-1">
            <Gift className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Primary Benefit</span>
          </div>
          <p className="text-lg sm:text-xl font-extrabold text-slate-900">
            {scheme.benefit}
          </p>
        </div>

        {/* WHO CAN APPLY? */}
        <div className="space-y-3 pt-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-800" />
            <span>Who Can Apply? (Eligibility Criteria)</span>
          </h2>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
            <p className="text-xs sm:text-sm font-semibold text-slate-800 mb-2">
              {scheme.who_can_apply}
            </p>
            <ul className="space-y-2">
              {scheme.eligibility.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* WHAT DO YOU GET? */}
        <div className="space-y-3 pt-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Gift className="w-4 h-4 text-blue-800" />
            <span>What Do You Get? (Entitlement Details)</span>
          </h2>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {scheme.what_you_get}
          </div>
        </div>

        {/* HOW TO APPLY? (Application Steps) */}
        <div className="space-y-4 pt-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-blue-800" />
            <span>How to Apply? (Step-by-Step Procedure)</span>
          </h2>
          <div className="space-y-3">
            {scheme.application_steps.map((step) => (
              <div
                key={step.step_number}
                className="bg-white rounded-2xl p-4 border border-slate-200 flex items-start gap-3 shadow-xs"
              >
                <div className="w-7 h-7 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {step.step_number}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {step.title}
                    </h3>
                    {step.location_type && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {step.location_type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REQUIRED DOCUMENTS WITH INTERACTIVE CHECKLIST */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-800" />
              <span>Required Documents Checklist</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                id="copy-scheme-checklist-btn"
                onClick={handleCopyChecklist}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                {copiedChecklist ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy List</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Preparation Progress:</span>
              <span className="text-blue-900 font-bold">{completedDocsCount} of {scheme.documents.length} prepared ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="space-y-2 pt-2">
              {scheme.documents.map((doc, idx) => {
                const isChecked = !!checkedDocs[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleDoc(idx)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleDoc(idx)}
                      className="w-4 h-4 rounded text-blue-900 mt-0.5 cursor-pointer"
                    />
                    <span className={`text-xs sm:text-sm font-medium ${isChecked ? 'line-through text-slate-500' : ''}`}>
                      {doc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* IMPORTANT NOTES */}
        {scheme.important_notes && (
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs sm:text-sm text-blue-950">
            <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">Key Operational Note:</span>
              <p className="leading-relaxed">{scheme.important_notes}</p>
            </div>
          </div>
        )}

        {/* VERIFICATION & OFFICIAL SOURCE FOOTER */}
        <div className="bg-slate-900 text-slate-300 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block mb-1">Verification Status:</span>
              <TrustBadge status={scheme.status} showDescription={false} size="sm" />
            </div>
            <div>
              <span className="text-slate-400 font-semibold block mb-1">Verified Authority:</span>
              <span className="text-slate-200 font-medium">{scheme.source_verified_authority}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block mb-1">Last Verified:</span>
              <span className="text-slate-200 font-medium">{scheme.last_verified}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              <span>Official Government Portal:</span>
            </div>
            <a
              id="official-scheme-portal-link"
              href={scheme.official_source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <span>Open Official Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* RESPONSIBLE CIVIC DISCLAIMER BANNER */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Educational Civic Disclaimer:</strong> You may be eligible based on the information provided. GovGuide AI is an independent guidance platform and does not sanction benefits or process government applications. Please verify current rules and guidelines on the designated official government portal before applying.
          </p>
        </div>
      </div>
    </div>
  );
};
