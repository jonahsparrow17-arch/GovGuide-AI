import React from 'react';
import { Shield, Sparkles, Compass, ExternalLink, Bot, BookOpen } from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'services' | 'chat';
  setActiveTab: (tab: 'home' | 'services' | 'chat') => void;
  onOpenQuickAI?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenQuickAI }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      {/* Educational Notice Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span>
          <strong>Educational Guidance Tool:</strong> GovGuide AI simplifies procedures. It is not an official government agency and does not process applications.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-slate-900 font-sans">
                  GovGuide <span className="text-indigo-600">AI</span>
                </span>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none">Citizen Assistance Guide</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'home'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'services'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Services Directory
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'chat'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <Bot className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600" />
              AI Assistant
            </button>
          </nav>

          {/* Quick AI Action button for mobile/desktop */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI</span>
            </button>
          </div>
        </div>

        {/* Mobile Subnav */}
        <div className="flex md:hidden border-t border-slate-100 py-2 justify-around text-xs font-semibold">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-lg ${activeTab === 'home' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'}`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded-lg ${activeTab === 'services' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'}`}
          >
            Services
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 ${activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
          >
            <Bot className="w-3.5 h-3.5" />
            AI Assistant
          </button>
        </div>
      </div>
    </header>
  );
};
