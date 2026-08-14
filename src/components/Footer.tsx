import React from 'react';
import { ShieldAlert, ExternalLink, CheckCircle2, Compass, Landmark, CheckSquare, Sparkles } from 'lucide-react';
import { NavTab } from './Header';

interface FooterProps {
  onSelectService?: (slug: string) => void;
  onSelectScheme?: (slug: string) => void;
  setActiveTab?: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectService, onSelectScheme, setActiveTab }) => {
  return (
    <footer className="bg-[#0B1F3A] text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Compass className="w-4 h-4 text-amber-400" />
              </div>
              <span className="font-bold text-lg text-white font-sans">GovGuide AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An independent civic-tech educational platform. We translate complex government procedures and public welfare schemes into plain, simple language.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Understand. Prepare. Navigate.</span>
            </div>
          </div>

          {/* Supported Core Services */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              5 Core Services
            </h4>
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

          {/* Featured Welfare Schemes */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              Popular Schemes
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onSelectScheme?.('pudhumai-penn')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Pudhumai Penn (₹1,000/mo)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectScheme?.('tamil-pudhalvan')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Tamil Pudhalvan (₹1,000/mo)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectScheme?.('vidiyal-payanam-women-bus-travel')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Vidiyal Payanam (Free Bus Travel)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectScheme?.('kalaignar-magalir-urimai-thittam')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Magalir Urimai Thittam (₹1,000/mo)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectScheme?.('naan-mudhalvan')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Naan Mudhalvan Skill Scheme
                </button>
              </li>
            </ul>
          </div>

          {/* Official Portals & Disclaimer */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                Official Sources
              </h4>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                <a href="https://passportindia.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">passportindia.gov.in</a> •
                <a href="https://uidai.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">uidai.gov.in</a> •
                <a href="https://incometax.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">incometax.gov.in</a> •
                <a href="https://parivahan.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">parivahan.gov.in</a> •
                <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">voters.eci.gov.in</a>
              </div>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 text-[11px] text-slate-400 leading-relaxed">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>Civic Technology Notice</span>
              </div>
              GovGuide AI is an independent educational tool and not an official government service. It does not collect official user documents or submit applications.
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} GovGuide AI. Designed as an independent civic-tech public interest resource.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <button onClick={() => setActiveTab?.('home')} className="hover:text-slate-300 transition-colors">Home</button>
            <button onClick={() => setActiveTab?.('services')} className="hover:text-slate-300 transition-colors">5 Core Services</button>
            <button onClick={() => setActiveTab?.('schemes')} className="hover:text-slate-300 transition-colors">Government Schemes</button>
            <button onClick={() => setActiveTab?.('wizard')} className="hover:text-slate-300 transition-colors">Find for Me</button>
            <button onClick={() => setActiveTab?.('checklist')} className="hover:text-slate-300 transition-colors">Checklist</button>
            <button onClick={() => setActiveTab?.('trust')} className="hover:text-slate-300 transition-colors">Trust System</button>
            <button onClick={() => setActiveTab?.('chat')} className="hover:text-slate-300 transition-colors">Ask AI</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
