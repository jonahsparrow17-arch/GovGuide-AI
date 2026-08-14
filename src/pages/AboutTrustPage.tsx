import React from 'react';
import { ShieldCheck, CheckCircle2, Info, AlertTriangle, Clock, HelpCircle, HeartHandshake, FileText, ExternalLink } from 'lucide-react';
import { TrustBadge } from '../components/TrustBadge';

export const AboutTrustPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold text-blue-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Civic-Tech Independence & Trust Framework</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          About GovGuide AI & <span className="text-blue-300">Data Trust System</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
          GovGuide AI is an independent, student-built civic technology project engineered to make public service procedures and welfare schemes transparent, accessible, and understandable for every Indian citizen.
        </p>
      </div>

      {/* Core Principles */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900">
          Our Guiding Philosophy: <span className="text-blue-900">"Understand. Prepare. Navigate."</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base">Understand</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We translate complex legal circulars and administrative jargon into crystal-clear, plain-language guides for students, parents, and first-time applicants.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base">Prepare</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Interactive document checklists and common mistake warnings ensure citizens arrive at enrollment centers with 100% complete and valid proofs.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base">Navigate</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We guide citizens directly to authentic, authorized <code>.gov.in</code> portals and regional offices, eliminating exploitation by unauthorized brokers.
            </p>
          </div>
        </div>
      </div>

      {/* Scheme Data Trust System */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-1">
            The 5-Tier Data Trust System
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Every service and government scheme in our catalog is classified under an explicit verification status to ensure zero misinformation.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 flex items-start gap-4">
            <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-900 text-sm">🟢 VERIFIED</span>
                <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-semibold">Highest Trust</span>
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed">
                Official government gazettes, department orders, or verified <code>.gov.in</code> websites confirm the eligibility, benefits, and application procedure.
              </p>
            </div>
          </div>

          <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 flex items-start gap-4">
            <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-900 text-sm">🔵 ACTIVE</span>
                <span className="text-[11px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md font-semibold">Current Scheme</span>
              </div>
              <p className="text-xs text-blue-950 leading-relaxed">
                Existing active welfare scheme with operational guidelines and active beneficiary disbursals.
              </p>
            </div>
          </div>

          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex items-start gap-4">
            <div className="w-3 h-3 rounded-full bg-amber-500 mt-1.5 shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-900 text-sm">🟡 ANNOUNCED</span>
                <span className="text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md font-semibold">In Rollout</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed">
                Announced by government leadership or budget speech; specific operational details or registration dates may undergo administrative adjustment.
              </p>
            </div>
          </div>

          <div className="bg-orange-50/60 border border-orange-200 rounded-2xl p-4 flex items-start gap-4">
            <div className="w-3 h-3 rounded-full bg-orange-500 mt-1.5 shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-orange-900 text-sm">🟠 DETAILS PENDING</span>
                <span className="text-[11px] text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md font-semibold">Guidelines Awaited</span>
              </div>
              <p className="text-xs text-orange-950 leading-relaxed">
                Scheme policy exists or is announced in principle; executive guidelines or official portal enrollment links are yet to be finalized.
              </p>
            </div>
          </div>

          <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 flex items-start gap-4">
            <div className="w-3 h-3 rounded-full bg-rose-500 mt-1.5 shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-rose-900 text-sm">🔴 NEEDS VERIFICATION</span>
                <span className="text-[11px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md font-semibold">Review Required</span>
              </div>
              <p className="text-xs text-rose-950 leading-relaxed">
                Information is not confirmed by an official authority and must not be presented as definitive.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Non-Government Identity & Ethical Rules */}
      <div className="bg-slate-900 text-slate-300 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>Independent Civic-Tech Boundaries</span>
        </div>
        <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
          <li><strong>No Government Ownership or Endorsement:</strong> GovGuide AI is an academic and civic-tech educational project. It does not represent any Ministry, State Government, or National Informatics Centre (NIC).</li>
          <li><strong>No User Identity Document Storage:</strong> GovGuide AI does NOT collect, store, or process Aadhaar numbers, Passports, or user documents.</li>
          <li><strong>Responsible Language Rule:</strong> We never declare "You are eligible." We state "You may be eligible based on the information provided" to ensure users always verify active government guidelines.</li>
          <li><strong>Official Source Citing:</strong> Every service and scheme page includes verifiable links to official <code>.gov.in</code> websites.</li>
        </ul>
      </div>
    </div>
  );
};
