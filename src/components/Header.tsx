import React from 'react';
import {
  Shield,
  Sparkles,
  Compass,
  FileCheck2,
  BookOpen,
  Landmark,
  Bot,
  HelpCircle,
  Menu,
  X,
  CheckSquare
} from 'lucide-react';

export type NavTab = 'home' | 'services' | 'schemes' | 'wizard' | 'checklist' | 'trust' | 'chat';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenQuickAI?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenQuickAI }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNav = (tab: NavTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      {/* Educational Notice Banner */}
      <div className="bg-[#0B1F3A] text-slate-200 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-slate-800">
        <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>
          <strong>Independent Civic-Tech Educational Platform:</strong> GovGuide AI simplifies procedures. It is not an official government portal.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            id="govguide-logo"
            onClick={() => handleNav('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0B1F3A] text-white flex items-center justify-center shadow-md shadow-slate-900/10 group-hover:bg-[#1A4D8F] transition-colors">
              <Compass className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-slate-950 font-sans">
                  GovGuide <span className="text-[#1A4D8F]">AI</span>
                </span>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold tracking-wide">
                Understand. Prepare. Navigate.
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
            <button
              id="nav-home"
              onClick={() => handleNav('home')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'home'
                  ? 'bg-white text-[#0B1F3A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Home
            </button>
            <button
              id="nav-services"
              onClick={() => handleNav('services')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'services'
                  ? 'bg-white text-[#0B1F3A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              5 Core Services
            </button>
            <button
              id="nav-schemes"
              onClick={() => handleNav('schemes')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'schemes'
                  ? 'bg-white text-[#0B1F3A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-blue-700" />
              <span>Government Schemes</span>
            </button>
            <button
              id="nav-wizard"
              onClick={() => handleNav('wizard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'wizard'
                  ? 'bg-white text-[#0B1F3A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Find for Me</span>
            </button>
            <button
              id="nav-checklist"
              onClick={() => handleNav('checklist')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'checklist'
                  ? 'bg-white text-[#0B1F3A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Smart Checklist</span>
            </button>
            <button
              id="nav-trust"
              onClick={() => handleNav('trust')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'trust'
                  ? 'bg-white text-[#0B1F3A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Trust System
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              id="header-ask-ai-btn"
              onClick={() => handleNav('chat')}
              className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-xs ${
                activeTab === 'chat'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-[#0B1F3A] hover:bg-[#1A4D8F] text-white'
              }`}
            >
              <Bot className="w-4 h-4 text-amber-400" />
              <span>Ask AI Guide</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-3 space-y-1">
            <button
              onClick={() => handleNav('home')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab === 'home' ? 'bg-blue-50 text-blue-900' : 'text-slate-700'}`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('services')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab === 'services' ? 'bg-blue-50 text-blue-900' : 'text-slate-700'}`}
            >
              5 Core Services Directory
            </button>
            <button
              onClick={() => handleNav('schemes')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab === 'schemes' ? 'bg-blue-50 text-blue-900' : 'text-slate-700'}`}
            >
              Government Schemes (8 Sectors)
            </button>
            <button
              onClick={() => handleNav('wizard')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab === 'wizard' ? 'bg-blue-50 text-blue-900' : 'text-slate-700'}`}
            >
              Find Schemes for Me (Smart Wizard)
            </button>
            <button
              onClick={() => handleNav('checklist')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab === 'checklist' ? 'bg-blue-50 text-blue-900' : 'text-slate-700'}`}
            >
              Smart Document Checklist Workspace
            </button>
            <button
              onClick={() => handleNav('trust')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab === 'trust' ? 'bg-blue-50 text-blue-900' : 'text-slate-700'}`}
            >
              About & Trust System
            </button>
            <button
              onClick={() => handleNav('chat')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${activeTab === 'chat' ? 'bg-blue-50 text-blue-900' : 'text-slate-700'}`}
            >
              AI Guidance Assistant
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
