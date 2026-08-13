import React, { useState } from 'react';
import { DocumentRequirement } from '../types';
import { CheckCircle, Circle, Copy, Check, FileText, Info } from 'lucide-react';

interface DocumentChecklistProps {
  documents: DocumentRequirement[];
  serviceName: string;
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({ documents, serviceName }) => {
  const [checkedIds, setCheckedIds] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleCheck = (id: number) => {
    setCheckedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedIds).filter(Boolean).length;
  const totalCount = documents.length;

  const handleCopy = () => {
    const text = `Document Checklist for ${serviceName}:\n` +
      documents.map((d, idx) => `${idx + 1}. ${d.name} (${d.category})${d.is_mandatory ? ' [Mandatory]' : ''}\n   Options: ${d.accepted_options.join(', ')}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Required Documents Checklist</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Check off the documents you have ready before booking your appointment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress badge */}
          <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1.5 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span>{completedCount} of {totalCount} Ready</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy List'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-6 overflow-hidden">
        <div
          className="bg-indigo-600 h-2 transition-all duration-300 rounded-full"
          style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
        />
      </div>

      {/* Document Items */}
      <div className="space-y-4">
        {documents.map((doc) => {
          const isChecked = Boolean(checkedIds[doc.id]);
          return (
            <div
              key={doc.id}
              onClick={() => toggleCheck(doc.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isChecked
                  ? 'bg-indigo-50/40 border-indigo-200 text-slate-900'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  className="mt-0.5 text-indigo-600 focus:outline-none shrink-0"
                >
                  {isChecked ? (
                    <CheckCircle className="w-5 h-5 text-indigo-600 fill-indigo-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-sm font-bold ${isChecked ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {doc.name}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {doc.category}
                    </span>
                    {doc.is_mandatory && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100">
                        Mandatory
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mb-2">{doc.description}</p>

                  {/* Accepted Options */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-700">
                    <span className="font-semibold text-slate-900 block mb-1 flex items-center gap-1 text-[11px]">
                      <Info className="w-3 h-3 text-indigo-600" /> Accepted Documents (Choose Any One):
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
                      {doc.accepted_options.map((opt, i) => (
                        <li key={i}>{opt}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
