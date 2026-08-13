import React from 'react';
import { CommonMistake } from '../types';
import { AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';

interface CommonMistakesProps {
  mistakes: CommonMistake[];
}

export const CommonMistakes: React.FC<CommonMistakesProps> = ({ mistakes }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Common Application Mistakes to Avoid</h3>
      </div>
      <p className="text-xs text-slate-500 mb-6">
        Avoid these frequent errors that cause application rejection, fee loss, or verification delays.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mistakes.map((m) => (
          <div key={m.id} className="bg-rose-50/30 border border-rose-200/80 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start gap-2 mb-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{m.mistake}</h4>
              </div>

              <div className="mb-3 text-xs text-slate-600 pl-6">
                <strong className="text-rose-800">Impact: </strong>
                <span>{m.impact}</span>
              </div>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200/80 p-2.5 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-800 font-semibold block text-[11px]">How to Avoid:</strong>
                <span>{m.prevention}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
