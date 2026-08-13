import React from 'react';
import { ShieldAlert, ExternalLink, CheckCircle2, Compass } from 'lucide-react';

interface FooterProps {
  onSelectService?: (slug: string) => void;
  setActiveTab?: (tab: 'home' | 'services' | 'chat') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectService, setActiveTab }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white">GovGuide AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              AI-assisted educational portal providing simplified procedures, document checklists, and guidance for citizen services in India.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium bg-slate-800/80 px-2.5 py-1 rounded-md w-fit border border-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Version 1.0 — 5 Core Services Supported</span>
            </div>
          </div>

          {/* Supported Services */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Supported Services</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onSelectService?.('passport')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Indian Passport (Fresh / Tatkaal)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectService?.('aadhaar')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Aadhaar Card (Enrollment & Updates)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectService?.('pan-card')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  PAN Card (Instant e-PAN & Physical)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectService?.('driving-licence')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Driving Licence (Learner & Permanent)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectService?.('voter-id')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Voter ID Card (EPIC Registration)
                </button>
              </li>
            </ul>
          </div>

          {/* Official Portals */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Official Government Portals</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://passportindia.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 inline-flex items-center gap-1 transition-colors"
                >
                  Passport Seva Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://uidai.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 inline-flex items-center gap-1 transition-colors"
                >
                  UIDAI (Aadhaar Official) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.incometax.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 inline-flex items-center gap-1 transition-colors"
                >
                  Income Tax e-Filing (PAN) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://parivahan.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 inline-flex items-center gap-1 transition-colors"
                >
                  Parivahan Sewa (Driving Licence) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://voters.eci.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 inline-flex items-center gap-1 transition-colors"
                >
                  Election Commission Voters Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Disclaimer Box */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Important Disclaimer</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              GovGuide AI is an independent educational tool. It does not store user documents, collect official identity details, or claim authority over government procedures. Always verify fees and policies on official <code className="text-indigo-300">.gov.in</code> websites before submitting applications.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} GovGuide AI. Designed as an open educational civic tech initiative.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab?.('home')}
              className="hover:text-slate-300 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab?.('services')}
              className="hover:text-slate-300 transition-colors"
            >
              All Services
            </button>
            <button
              onClick={() => setActiveTab?.('chat')}
              className="hover:text-slate-300 transition-colors"
            >
              Ask AI Assistant
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
