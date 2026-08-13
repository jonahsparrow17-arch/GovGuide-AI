import React, { useState } from 'react';
import { GovernmentService } from '../types';
import { ServiceCard } from '../components/ServiceCard';
import { Search, Sparkles, ShieldCheck, CheckCircle2, ArrowRight, BookOpen, Compass, ExternalLink } from 'lucide-react';

interface HomePageProps {
  services: GovernmentService[];
  onSelectService: (slug: string) => void;
  onOpenAIQuery: (query: string) => void;
  setActiveTab: (tab: 'home' | 'services' | 'chat') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  services,
  onSelectService,
  onOpenAIQuery,
  setActiveTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onOpenAIQuery(searchQuery.trim());
    }
  };

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl">
        {/* Subtle background decoration */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-300">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>AI-Powered Citizen Assistance Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white font-sans">
            Understand Government Procedures in <span className="text-indigo-400">Simple Language</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Clear, step-by-step guidance for Students, Parents, Senior Citizens, and First-Time Applicants. Find eligibility, required documents, and official government links without jargon.
          </p>

          {/* Search / Ask AI Box */}
          <form onSubmit={handleSearchSubmit} className="pt-2 max-w-2xl mx-auto">
            <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask anything (e.g. What documents are needed for a fresh passport?)"
                className="w-full text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 shadow-md shadow-indigo-200"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask AI</span>
              </button>
            </div>
          </form>

          {/* Quick Prompt Pills */}
          <div className="pt-2 flex items-center justify-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 text-[11px] font-semibold">Popular Queries:</span>
            <button
              onClick={() => onOpenAIQuery("What documents do I need for a fresh passport?")}
              className="bg-slate-800 hover:bg-slate-700 text-indigo-300 px-3 py-1 rounded-full border border-slate-700 transition-colors"
            >
              Passport Documents
            </button>
            <button
              onClick={() => onOpenAIQuery("How do I apply for a free Instant e-PAN?")}
              className="bg-slate-800 hover:bg-slate-700 text-indigo-300 px-3 py-1 rounded-full border border-slate-700 transition-colors"
            >
              Instant e-PAN Card
            </button>
            <button
              onClick={() => onOpenAIQuery("How to update address in Aadhaar card?")}
              className="bg-slate-800 hover:bg-slate-700 text-indigo-300 px-3 py-1 rounded-full border border-slate-700 transition-colors"
            >
              Aadhaar Address Update
            </button>
            <button
              onClick={() => onOpenAIQuery("What is the procedure for a driving licence test?")}
              className="bg-slate-800 hover:bg-slate-700 text-indigo-300 px-3 py-1 rounded-full border border-slate-700 transition-colors"
            >
              Driving Licence Test
            </button>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              <span>Core Government Services</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Supported Government Services (V1)
            </h2>
          </div>

          <button
            onClick={() => setActiveTab('services')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
          >
            <span>View All Services Directory</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onViewGuide={onSelectService}
              onAskAI={(name) => onOpenAIQuery(`What are the steps and documents required for ${name}?`)}
            />
          ))}
        </div>
      </section>

      {/* How GovGuide AI Works Section */}
      <section className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Simple 3-Step Guidance
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
            How GovGuide AI Helps Citizens
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Designed to save time, eliminate confusion, and prevent common application mistakes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative text-center space-y-3">
            <div className="w-12 h-12 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center mx-auto text-lg shadow-md shadow-indigo-100">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base">Select Service or Ask AI</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Choose from Passport, Aadhaar, PAN Card, Driving Licence, or Voter ID, or type any specific question in plain language.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative text-center space-y-3">
            <div className="w-12 h-12 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center mx-auto text-lg shadow-md shadow-indigo-100">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base">Check Documents & Steps</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use our interactive document checklists and step-by-step application walkthroughs to prepare your files in advance.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative text-center space-y-3">
            <div className="w-12 h-12 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center mx-auto text-lg shadow-md shadow-indigo-100">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base">Verify & Apply Officially</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Directly click verified official government portal links (<code className="text-indigo-600">.gov.in</code>) to submit your application safely.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Official Source Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-indigo-900 text-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-300" />
              <h3 className="text-lg font-bold">100% Official Source Transparency</h3>
            </div>
            <p className="text-xs text-indigo-200 max-w-xl">
              GovGuide AI explicitly separates AI guidance explanations from verified official government websites. We never collect sensitive personal identification numbers or passwords.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('chat')}
            className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-colors shrink-0 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Try AI Guidance Assistant</span>
          </button>
        </div>
      </section>
    </div>
  );
};
