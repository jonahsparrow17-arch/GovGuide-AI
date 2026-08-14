import React, { useState, useEffect } from 'react';
import { GovernmentService, GovernmentScheme } from '../types';
import { fetchServices, fetchSchemes } from '../services/api';
import {
  CheckSquare,
  FileCheck2,
  Copy,
  Check,
  Printer,
  RotateCcw,
  Sparkles,
  Info,
  ShieldAlert,
  ChevronDown,
  Layers,
  FileText
} from 'lucide-react';

interface ChecklistPageProps {
  initialServiceOrSchemeSlug?: string;
  onAskAI: (query: string) => void;
}

export const ChecklistPage: React.FC<ChecklistPageProps> = ({
  initialServiceOrSchemeSlug,
  onAskAI
}) => {
  const [services, setServices] = useState<GovernmentService[]>([]);
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [selectedType, setSelectedType] = useState<'service' | 'scheme'>('service');
  const [selectedSlug, setSelectedSlug] = useState<string>('passport');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [srvs, schms] = await Promise.all([fetchServices(), fetchSchemes()]);
        setServices(srvs);
        setSchemes(schms);

        if (initialServiceOrSchemeSlug) {
          const isSchm = schms.some((s) => s.slug === initialServiceOrSchemeSlug);
          if (isSchm) {
            setSelectedType('scheme');
            setSelectedSlug(initialServiceOrSchemeSlug);
          } else {
            setSelectedType('service');
            setSelectedSlug(initialServiceOrSchemeSlug);
          }
        }
      } catch (err) {
        console.error('Failed to load checklist data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initialServiceOrSchemeSlug]);

  // Load saved checklist progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`govguide_checklist_${selectedSlug}`);
    if (saved) {
      try {
        setCheckedItems(JSON.parse(saved));
      } catch (e) {
        setCheckedItems({});
      }
    } else {
      setCheckedItems({});
    }
  }, [selectedSlug]);

  const toggleItem = (key: string) => {
    const next = { ...checkedItems, [key]: !checkedItems[key] };
    setCheckedItems(next);
    localStorage.setItem(`govguide_checklist_${selectedSlug}`, JSON.stringify(next));
  };

  const handleReset = () => {
    setCheckedItems({});
    localStorage.removeItem(`govguide_checklist_${selectedSlug}`);
  };

  const activeService = selectedType === 'service' ? services.find((s) => s.slug === selectedSlug) : null;
  const activeScheme = selectedType === 'scheme' ? schemes.find((s) => s.slug === selectedSlug) : null;

  const currentTitle = activeService?.name || activeScheme?.name || 'Document Checklist';

  // Calculate completion percentage
  let totalDocs = 0;
  let completedDocs = 0;

  if (activeService && activeService.documents) {
    totalDocs = activeService.documents.length;
    completedDocs = activeService.documents.filter((d) => checkedItems[`doc_${d.id}`]).length;
  } else if (activeScheme) {
    totalDocs = activeScheme.documents.length;
    completedDocs = activeScheme.documents.filter((_, idx) => checkedItems[`schm_doc_${idx}`]).length;
  }

  const progressPercent = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;

  const handleCopyFormatted = () => {
    let text = `====================================================\n`;
    text += `DOCUMENT PREPARATION CHECKLIST\n`;
    text += `Target: ${currentTitle}\n`;
    text += `Progress: ${completedDocs}/${totalDocs} documents ready (${progressPercent}%)\n`;
    text += `====================================================\n\n`;

    if (activeService && activeService.documents) {
      activeService.documents.forEach((d, idx) => {
        const isDone = !!checkedItems[`doc_${d.id}`];
        text += `[${isDone ? 'X' : ' '}] ${idx + 1}. ${d.category} - ${d.name} (${d.is_mandatory ? 'MANDATORY' : 'OPTIONAL'})\n`;
        text += `    Accepted Proofs: ${d.accepted_options.join(', ')}\n\n`;
      });
    } else if (activeScheme) {
      activeScheme.documents.forEach((d, idx) => {
        const isDone = !!checkedItems[`schm_doc_${idx}`];
        text += `[${isDone ? 'X' : ' '}] ${idx + 1}. ${d}\n\n`;
      });
    }

    text += `\nVerified via GovGuide AI (Understand. Prepare. Navigate.)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold text-blue-300">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Interactive Preparation Tool</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Smart Document <span className="text-blue-300">Checklist Workspace</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Select any government service or scheme to build, review, and track your personalized document collection progress before applying.
          </p>
        </div>
      </div>

      {/* Target Selector Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Service vs Scheme Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              id="checklist-tab-services"
              onClick={() => {
                setSelectedType('service');
                if (services.length > 0) setSelectedSlug(services[0].slug);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedType === 'service'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5 Core Services
            </button>
            <button
              id="checklist-tab-schemes"
              onClick={() => {
                setSelectedType('scheme');
                if (schemes.length > 0) setSelectedSlug(schemes[0].slug);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedType === 'scheme'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Government Schemes
            </button>
          </div>

          {/* Target Dropdown */}
          <div className="flex-1 max-w-sm">
            <select
              id="checklist-target-select"
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              {selectedType === 'service' ? (
                services.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))
              ) : (
                schemes.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    [{s.category}] {s.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Progress Bar and Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="space-y-1.5 flex-1 max-w-md">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Readiness Progress:</span>
              <span className={progressPercent === 100 ? 'text-emerald-600' : 'text-blue-900'}>
                {completedDocs} of {totalDocs} Documents Ready ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-900'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-checklist-btn"
              onClick={handleCopyFormatted}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Checklist</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {completedDocs > 0 && (
              <button
                onClick={handleReset}
                title="Reset all checkboxes"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Document Checklist Cards */}
      <div className="space-y-4">
        {selectedType === 'service' && activeService ? (
          activeService.documents && activeService.documents.length > 0 ? (
            activeService.documents.map((doc, idx) => {
              const isChecked = !!checkedItems[`doc_${doc.id}`];
              return (
                <div
                  key={doc.id}
                  id={`checklist-item-${doc.id}`}
                  className={`bg-white rounded-2xl border p-5 transition-all space-y-3 ${
                    isChecked
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex items-start gap-3.5 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleItem(`doc_${doc.id}`)}
                        className="w-5 h-5 rounded text-blue-900 mt-0.5 cursor-pointer accent-blue-900"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">
                            {doc.category}
                          </span>
                          {doc.is_mandatory ? (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                              MANDATORY
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              OPTIONAL / CONDITIONAL
                            </span>
                          )}
                        </div>
                        <h3 className={`text-base font-bold text-slate-900 mt-1.5 ${isChecked ? 'line-through text-slate-500' : ''}`}>
                          {doc.name}
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {doc.description}
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Accepted Alternative Proofs */}
                  {doc.accepted_options && doc.accepted_options.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-1.5 text-xs">
                      <span className="font-bold text-slate-600 block text-[11px] uppercase tracking-wider">
                        Accepted Alternative Proofs (Submit Any One):
                      </span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {doc.accepted_options.map((opt, optIdx) => (
                          <li key={optIdx} className="flex items-center gap-1.5 text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-900 shrink-0" />
                            <span>{opt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">No specific documents registered for this service.</p>
          )
        ) : activeScheme ? (
          activeScheme.documents.map((docText, idx) => {
            const isChecked = !!checkedItems[`schm_doc_${idx}`];
            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl border p-4 transition-all ${
                  isChecked
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <label className="flex items-start gap-3.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleItem(`schm_doc_${idx}`)}
                    className="w-5 h-5 rounded text-blue-900 mt-0.5 cursor-pointer accent-blue-900"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Document Requirement #{idx + 1}
                    </span>
                    <p className={`text-sm font-semibold text-slate-900 leading-relaxed ${isChecked ? 'line-through text-slate-500' : ''}`}>
                      {docText}
                    </p>
                  </div>
                </label>
              </div>
            );
          })
        ) : null}
      </div>

      {/* Practical Citizen Verification Rules Box */}
      <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-5 space-y-2 text-xs text-blue-950">
        <div className="flex items-center gap-2 font-bold text-blue-900 text-sm">
          <Info className="w-4 h-4 text-blue-700" />
          <span>Universal Document Submission Rules (To Prevent Rejections):</span>
        </div>
        <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
          <li><strong>Spelling Consistency:</strong> Ensure your First Name, Surname, and Date of Birth match identically across your 10th marksheet, Aadhaar, and bank passbook.</li>
          <li><strong>Validity Window:</strong> Utility bills (electricity/water) and bank statements must typically be issued within the last 3 months.</li>
          <li><strong>Bank Passbook:</strong> Must clearly show your Name, Account Number, IFSC code, photo, and official branch authorization seal.</li>
          <li><strong>Originals for Verification:</strong> When visiting enrollment kendras or RTOs, always bring original documents along with self-attested photocopies.</li>
        </ul>
      </div>
    </div>
  );
};
