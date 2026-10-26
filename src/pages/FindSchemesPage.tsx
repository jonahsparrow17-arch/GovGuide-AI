import React, { useState } from 'react';
import { CitizenProfile, SchemeMatchResult } from '../types';
import { findSchemesWizard } from '../services/api';
import { TrustBadge } from '../components/TrustBadge';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  Users,
  Briefcase,
  Accessibility,
  HeartHandshake,
  Sprout,
  ShieldAlert,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Gift
} from 'lucide-react';

interface FindSchemesPageProps {
  onSelectScheme?: (slug: string) => void;
  onViewGuide?: (slug: string) => void;
  onOpenChecklist?: (slug: string) => void;
  onAskAI?: (query: string) => void;
}

export const FindSchemesPage: React.FC<FindSchemesPageProps> = ({
  onSelectScheme,
  onViewGuide,
  onOpenChecklist,
  onAskAI
}) => {
  const [step, setStep] = useState<number>(1);
  const [userType, setUserType] = useState<string>('Student');
  const [educationLevel, setEducationLevel] = useState<string>('College');
  const [age, setAge] = useState<number>(20);
  const [gender, setGender] = useState<string>('All');
  const [annualIncome, setAnnualIncome] = useState<number>(200000);
  const [isDifferentlyAbled, setIsDifferentlyAbled] = useState<boolean>(false);
  const [categoryInterest, setCategoryInterest] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<SchemeMatchResult[]>([]);
  const [searched, setSearched] = useState<boolean>(false);

  const handleSelectScheme = (slug: string) => {
    if (typeof onSelectScheme === 'function') {
      onSelectScheme(slug);
    } else if (typeof onViewGuide === 'function') {
      onViewGuide(slug);
    }
  };

  const handleOpenChecklist = (slug: string) => {
    if (typeof onOpenChecklist === 'function') {
      onOpenChecklist(slug);
    } else {
      handleSelectScheme(slug);
    }
  };

  const USER_TYPES = [
    { id: 'Student', label: 'Student', icon: GraduationCap, desc: 'School, College, or ITI/Polytechnic student' },
    { id: 'Woman', label: 'Woman / Homemaker', icon: Users, desc: 'Female citizen or female head of household' },
    { id: 'Job Seeker', label: 'Job Seeker / Youth', icon: Briefcase, desc: 'Looking for skill training, apprenticeships, or jobs' },
    { id: 'Senior Citizen', label: 'Senior Citizen (60+)', icon: HeartHandshake, desc: 'Elderly citizens looking for pensions and healthcare' },
    { id: 'Differently Abled', label: 'Differently Abled (Divyangjan)', icon: Accessibility, desc: 'Special assistance, allowance, and assistive devices' },
    { id: 'Farmer / Street Vendor', label: 'Farmer / Street Vendor / Livelihood', icon: Sprout, desc: 'Agricultural input support or micro-credit loans' }
  ];

  const handleRunSearch = async () => {
    setLoading(true);
    try {
      const profile: CitizenProfile = {
        user_type: userType,
        education_level: educationLevel,
        age: Number(age),
        gender: gender === 'All' ? undefined : gender,
        annual_income: Number(annualIncome),
        category_interest: categoryInterest || undefined,
        is_differently_abled: isDifferentlyAbled
      };

      const response = await findSchemesWizard(profile);
      setResults(response.results || []);
      setSearched(true);
      setStep(4);
    } catch (err) {
      console.error('Failed to run wizard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSearched(false);
    setResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Wizard Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalized Eligibility Discovery</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Find Government <span className="text-amber-400">Schemes for Me</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Answer a few quick questions about your demographic and educational background to discover schemes and benefits you may be eligible to receive.
          </p>
        </div>
      </div>

      {/* Progress Steps Indicator */}
      {!searched && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
            <div className={`p-2 rounded-xl transition-colors ${step === 1 ? 'bg-blue-900 text-white' : 'text-slate-600 bg-slate-100'}`}>
              1. Profile Type
            </div>
            <div className={`p-2 rounded-xl transition-colors ${step === 2 ? 'bg-blue-900 text-white' : 'text-slate-600 bg-slate-100'}`}>
              2. Education & Age
            </div>
            <div className={`p-2 rounded-xl transition-colors ${step === 3 ? 'bg-blue-900 text-white' : 'text-slate-600 bg-slate-100'}`}>
              3. Family & Income
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: USER TYPE */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 mb-1">Step 1: Which citizen category best describes you?</h2>
            <p className="text-xs text-slate-500">Select the primary profile to narrow down applicable government schemes.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {USER_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = userType === type.id;
              return (
                <div
                  key={type.id}
                  id={`user-type-option-${type.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => setUserType(type.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? 'border-blue-900 bg-blue-50/60 ring-2 ring-blue-900/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{type.label}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{type.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              id="wizard-next-step-1"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-sm transition-all"
            >
              <span>Continue to Step 2</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: EDUCATION & AGE */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 mb-1">Step 2: Education Level & Age</h2>
            <p className="text-xs text-slate-500">Many student scholarships and welfare schemes have age or education prerequisites.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Highest / Current Education Level:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['School', 'College', 'ITI / Polytechnic', 'Graduate', 'Other / None'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEducationLevel(lvl)}
                    className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      educationLevel === lvl
                        ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Your Current Age: <strong className="text-blue-900 text-sm">{age} years</strong>
              </label>
              <input
                type="range"
                min="5"
                max="90"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>5 yrs (Primary school)</span>
                <span>21 yrs (College)</span>
                <span>60+ yrs (Senior)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-4 py-2.5 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              id="wizard-next-step-2"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-sm transition-all"
            >
              <span>Continue to Step 3</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: FAMILY & INCOME */}
      {step === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 mb-1">Step 3: Income Bracket & Gender Details</h2>
            <p className="text-xs text-slate-500">Refine the search to include income-restricted welfare entitlements.</p>
          </div>

          <div className="space-y-5">
            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Gender:
              </label>
              <div className="grid grid-cols-4 gap-3">
                {['All', 'Female', 'Male', 'Transgender'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      gender === g
                        ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {g === 'All' ? 'Any / Prefer not to say' : g}
                  </button>
                ))}
              </div>
            </div>

            {/* Income Bracket */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Approximate Annual Family Income:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 72000, label: 'Under ₹72,000 / yr', sub: 'Destitute / Low income' },
                  { value: 250000, label: 'Under ₹2.5 Lakh / yr', sub: 'EWS / BPL ceiling' },
                  { value: 800000, label: 'Above ₹2.5 Lakh / yr', sub: 'General category' }
                ].map((inc) => (
                  <button
                    key={inc.value}
                    type="button"
                    onClick={() => setAnnualIncome(inc.value)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      annualIncome === inc.value
                        ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-xs">{inc.label}</div>
                    <div className={`text-[11px] ${annualIncome === inc.value ? 'text-blue-200' : 'text-slate-500'}`}>{inc.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Differently Abled Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={isDifferentlyAbled}
                  onChange={(e) => setIsDifferentlyAbled(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-900 cursor-pointer"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                    Person with Benchmark Disability (Divyangjan / UDID Holder)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Check this to discover specialized disability maintenance pensions and assistive equipment grants.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-4 py-2.5 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              id="wizard-submit-btn"
              onClick={handleRunSearch}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Finding Relevant Schemes...' : 'Find My Schemes Now'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: RESULTS SCREEN */}
      {step === 4 && (
        <div className="space-y-6">
          {/* Results Summary Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md">
                  Discovery Results
                </span>
                <span className="text-xs text-slate-500">
                  Profile: <strong>{userType}</strong> • Age: <strong>{age}</strong>
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-950 mt-1">
                Found <span className="text-blue-900">{results.length} Potential Schemes</span> for You
              </h2>
            </div>

            <button
              id="wizard-modify-answers-btn"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Modify Answers</span>
            </button>
          </div>

          {/* Mandatory Responsible Language Banner */}
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-950">
            <ShieldAlert className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
            <p className="leading-relaxed">
              <strong>Important Guidance Note:</strong> You may be eligible based on the information provided. GovGuide AI provides educational guidance only. Please verify the current official eligibility requirements and application windows on the designated government portals.
            </p>
          </div>

          {/* Matched Results Cards */}
          {results.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4">
              <h3 className="text-lg font-bold text-slate-900">No direct scheme matches found for this specific combination</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Try widening your income or profile parameters, or browse the entire Schemes Directory.
              </p>
              <button
                onClick={handleReset}
                className="text-xs font-bold text-blue-900 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100"
              >
                Try Different Answers
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((item, idx) => {
                const scheme = item.scheme;
                return (
                  <div
                    key={scheme.id}
                    id={`matched-scheme-item-${scheme.slug}`}
                    className="bg-white rounded-3xl border border-slate-200/90 p-6 hover:shadow-md hover:border-blue-300 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md">
                          {scheme.category}
                        </span>
                        <TrustBadge status={scheme.status} size="sm" />
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                        Match Score: {item.matchScore} pts
                      </span>
                    </div>

                    <div>
                      <h3
                        onClick={() => handleSelectScheme(scheme.slug)}
                        className="text-lg font-extrabold text-slate-900 hover:text-blue-900 cursor-pointer transition-colors"
                      >
                        {scheme.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">{scheme.department}</p>
                    </div>

                    {/* Benefit Banner */}
                    <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-900">
                        {scheme.benefit}
                      </span>
                    </div>

                    {/* Match Reasons */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Why this matches your profile:
                      </span>
                      <ul className="space-y-1">
                        {item.matchReasons.map((r, rIdx) => (
                          <li key={rIdx} className="flex items-center gap-1.5 text-xs text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500">
                        {scheme.documents.length} required documents • {scheme.application_steps.length} application steps
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenChecklist(scheme.slug)}
                          className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
                        >
                          Checklist
                        </button>
                        <button
                          type="button"
                          id={`view-guide-btn-${scheme.slug}`}
                          onClick={() => handleSelectScheme(scheme.slug)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 px-4 py-2 rounded-xl transition-colors shadow-xs"
                        >
                          <span>View Full Guide</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
