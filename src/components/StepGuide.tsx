import React from 'react';
import { ApplicationStep } from '../types';
import { CheckCircle2, Globe, MapPin, Lightbulb, ArrowDown } from 'lucide-react';

interface StepGuideProps {
  steps: ApplicationStep[];
}

export const StepGuide: React.FC<StepGuideProps> = ({ steps }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-2">Step-by-Step Application Process</h3>
      <p className="text-xs text-slate-500 mb-6">
        Follow these clear, sequential steps to complete your application efficiently.
      </p>

      <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-indigo-100 before:z-0">
        {steps.map((step, index) => {
          const isOnline = step.location_type === 'Online';
          const isOffline = step.location_type === 'Visit Center';

          return (
            <div key={step.id} className="relative z-10 flex items-start gap-4">
              {/* Step circle */}
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 shadow-md shadow-indigo-100 text-sm">
                {step.step_number}
              </div>

              {/* Step Card */}
              <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">{step.title}</h4>

                  {/* Location badge */}
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      isOnline
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isOffline
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    {isOnline ? <Globe className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                    <span>{step.location_type}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">{step.description}</p>

                {/* Tip box */}
                {step.tip && (
                  <div className="flex items-start gap-2 bg-amber-50/70 border border-amber-200/70 p-2.5 rounded-xl text-xs text-amber-900 font-medium">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Pro Tip:</strong> {step.tip}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
