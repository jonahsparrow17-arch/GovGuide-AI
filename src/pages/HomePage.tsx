import React, { useState } from 'react';
import { GovernmentService, GovernmentScheme } from '../types';
import { ServiceCard } from '../components/ServiceCard';
import { SchemeCard } from '../components/SchemeCard';
import { TrustBadge } from '../components/TrustBadge';
import {
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Compass,
  ExternalLink,
  GraduationCap,
  Users,
  Briefcase,
  Accessibility,
  HeartHandshake,
  Home,
  Sprout,
  Landmark,
  FileCheck,
  CheckSquare,
  Gift
} from 'lucide-react';
import { NavTab } from '../components/Header';

interface HomePageProps {
  services: GovernmentService[];
  schemes: GovernmentScheme[];
  onSelectService: (slug: string) => void;
  onSelectScheme: (slug: string) => void;
  onOpenAIQuery: (query: string) => void;
  setActiveTab: (tab: NavTab) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  services,
  schemes,
  onSelectService,
  onSelectScheme,
  onOpenAIQuery,
  setActiveTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onOpenAIQuery(searchQuery.trim());
    }
  };

  const schemeCategories = [
    { name: 'Education & Students', icon: GraduationCap, color: 'text-blue-600 bg-blue-50', count: schemes.filter(s => s.category === 'Education & Students').length },
    { name: 'Women & Family', icon: Users, color: 'text-rose-600 bg-rose-50', count: schemes.filter(s => s.category === 'Women & Family').length },
    { name: 'Employment & Skills', icon: Briefcase, color: 'text-indigo-600 bg-indigo-50', count: schemes.filter(s => s.category === 'Employment & Skills').length },
    { name: 'Differently Abled', icon: Accessibility, color: 'text-emerald-600 bg-emerald-50', count: schemes.filter(s => s.category === 'Differently Abled').length },
    { name: 'Senior Citizens', icon: HeartHandshake, color: 'text-amber-600 bg-amber-50', count: schemes.filter(s => s.category === 'Senior Citizens').length },
    { name: 'Housing / Welfare', icon: Home, color: 'text-cyan-600 bg-cyan-50', count: schemes.filter(s => s.category === 'Housing / Welfare').length },
    { name: 'Livelihood', icon: Sprout, color: 'text-green-600 bg-green-50', count: schemes.filter(s => s.category === 'Livelihood').length },
    { name: 'Other Government Schemes', icon: Landmark, color: 'text-purple-600 bg-purple-50', count: schemes.filter(s => s.category === 'Other Government Schemes').length },
  ];

  // Featured top schemes
  const featuredSchemes = schemes.slice(0, 3);

  return (
    <div className="space-y-16 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-[#0B1F3A] text-white p-8 sm:p-14 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-4 py-1.5 rounded-full text-xs font-bold text-amber-300">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Civic Technology Assistant for Indian Citizens</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white font-sans">
            Government Information, <br />
            <span className="text-amber-400">Made Easier.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Understand services, discover welfare schemes, prepare document checklists, and find official sources — all in simple, jargon-free language.
          </p>

          {/* Unified Search Box */}
          <form onSubmit={handleSearchSubmit} className="pt-2 max-w-2xl mx-auto">
            <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                id="hero-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask anything (e.g., How to apply for Pudhumai Penn, Passport tatkaal rules, Voter ID form)..."
                className="w-full text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none"
              />
              <button
                id="hero-search-ask-ai-btn"
                type="submit"
                className="bg-[#0B1F3A] hover:bg-[#1A4D8F] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Ask AI</span>
              </button>
            </div>
          </form>

          {/* Primary & Secondary Action CTA */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              id="hero-cta-services"
              onClick={() => setActiveTab('services')}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>Explore 5 Core Services</span>
            </button>
            <button
              id="hero-cta-schemes"
              onClick={() => setActiveTab('schemes')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center gap-2"
            >
              <Landmark className="w-4 h-4 text-blue-400" />
              <span>Browse Government Schemes</span>
            </button>
            <button
              id="hero-cta-wizard"
              onClick={() => setActiveTab('wizard')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Find Schemes for Me</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5 Core Services Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
              <FileCheck className="w-4 h-4 text-blue-800" />
              <span>Essential Citizen Services</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-950">5 Core Government Services</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Comprehensive, verified guides with required document checklists, step-by-step procedures, and common mistakes to avoid.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('services')}
            className="text-xs font-bold text-blue-900 hover:text-blue-950 inline-flex items-center gap-1 shrink-0"
          >
            <span>View All Service Guides</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onViewGuide={onSelectService}
              onSelect={onSelectService}
              onAskAI={(name) => onOpenAIQuery(`What are the steps and documents for ${name}?`)}
            />
          ))}
        </div>
      </section>

      {/* "Find Schemes for Me" Interactive Banner */}
      <section className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-10 border border-blue-900/50 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalized Eligibility Discovery</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Not sure which welfare schemes you qualify for?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Take our 60-second citizen discovery questionnaire to find scholarships, income allowances, pensions, and skill training programs tailored to your profile.
          </p>
        </div>
        <button
          id="home-open-wizard-btn"
          onClick={() => setActiveTab('wizard')}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-md transition-all shrink-0 flex items-center gap-2"
        >
          <span>Launch Scheme Wizard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Government Schemes 8 Categories Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
              <Landmark className="w-4 h-4 text-blue-800" />
              <span>Civic Welfare Programs</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-950">Government Schemes by Sector</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Explore financial support, educational stipends, and welfare initiatives categorized across 8 key citizen groups.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('schemes')}
            className="text-xs font-bold text-blue-900 hover:text-blue-950 inline-flex items-center gap-1 shrink-0"
          >
            <span>View All Schemes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {schemeCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                onClick={() => setActiveTab('schemes')}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 group-hover:text-blue-900">
                    {cat.count} schemes
                  </span>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                    {cat.name}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Schemes Showcase */}
      {featuredSchemes.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-950">Featured Welfare Schemes</h3>
              <p className="text-xs text-slate-500 mt-0.5">High-impact student and citizen welfare entitlements with verified guidelines.</p>
            </div>
            <button
              onClick={() => setActiveTab('schemes')}
              className="text-xs font-bold text-blue-900 hover:underline"
            >
              Browse all {schemes.length} schemes →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredSchemes.map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                onSelect={onSelectScheme}
                onViewGuide={onSelectScheme}
              />
            ))}
          </div>
        </section>
      )}

      {/* How GovGuide AI Works */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 space-y-8 shadow-xs">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
            <Compass className="w-3.5 h-3.5" />
            <span>Civic Technology Methodology</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">How GovGuide AI Works</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A three-step civic assistance pipeline designed to eliminate administrative confusion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B1F3A] text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">Understand Plain Language</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We convert complicated government circulars, legal jargon, and fee structures into simple bullet points so you know exactly what is required.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B1F3A] text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">Prepare with Smart Checklist</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use our interactive checklist tool to verify Proof of Identity, Address, and DOB documents before booking appointment slots or visiting centers.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B1F3A] text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">Navigate Official Portals</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Access verified links to official <code>.gov.in</code> websites directly. Avoid fraudulent intermediary websites and unnecessary broker fees.
            </p>
          </div>
        </div>
      </section>

      {/* Scheme Trust System Explanation Section */}
      <section className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Scheme Data Trust System</h3>
            <p className="text-xs text-slate-500">Every piece of government data is stamped with an explicit verification tier.</p>
          </div>
          <button
            onClick={() => setActiveTab('trust')}
            className="text-xs font-bold text-blue-900 hover:underline shrink-0"
          >
            Learn about our verification system →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>VERIFIED</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">Official source confirms info</p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-blue-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-blue-800">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span>ACTIVE</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">Current operational scheme</p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span>ANNOUNCED</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">In policy rollout phase</p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-orange-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-orange-800">
              <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
              <span>PENDING</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">Operational rules awaited</p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-rose-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-rose-800">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>UNCONFIRMED</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">Under review</p>
          </div>
        </div>
      </section>
    </div>
  );
};
