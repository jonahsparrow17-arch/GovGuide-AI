import React, { useState, useEffect } from 'react';
import { fetchServiceBySlug } from '../services/api';
import { GovernmentService } from '../types';
import { DocumentChecklist } from '../components/DocumentChecklist';
import { StepGuide } from '../components/StepGuide';
import { CommonMistakes } from '../components/CommonMistakes';
import { ServiceIcon } from '../components/ServiceIcon';
import { ArrowLeft, ExternalLink, ShieldCheck, Clock, CreditCard, Building, Sparkles, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface ServiceDetailsPageProps {
  slug: string;
  onBack: () => void;
  onAskAI: (query: string) => void;
}

export const ServiceDetailsPage: React.FC<ServiceDetailsPageProps> = ({ slug, onBack, onAskAI }) => {
  const [service, setService] = useState<GovernmentService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'steps' | 'mistakes' | 'faqs'>('overview');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchServiceBySlug(slug);
        setService(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load service details');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading verified service procedures...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 space-y-4">
          <p className="text-sm font-bold text-rose-800">{error || 'Service not found'}</p>
          <button
            onClick={onBack}
            className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-slate-800"
          >
            Return to Services List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Services</span>
      </button>

      {/* Top Service Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-100">
              <ServiceIcon name={service.icon} className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  {service.category}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Official Guide
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                {service.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                {service.short_description}
              </p>
            </div>
          </div>

          {/* Official Website Button */}
          <div className="shrink-0 flex flex-col gap-2">
            <a
              href={service.official_website}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-100 transition-colors"
            >
              <span>Visit Official Government Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <p className="text-[10px] text-slate-400 text-center">
              Official domain: <code className="text-indigo-600 font-semibold">{service.official_website.replace('https://', '')}</code>
            </p>
          </div>
        </div>

        {/* Processing Specs Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Government Fee</span>
              <span className="font-semibold text-slate-800 text-xs">{service.processing_fee}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-start gap-3">
            <Clock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Estimated Timeline</span>
              <span className="font-semibold text-slate-800 text-xs">{service.processing_time}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-start gap-3">
            <Building className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Issuing Authority</span>
              <span className="font-semibold text-slate-800 text-xs">{service.issuing_authority}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Overview & Eligibility
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'documents'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Required Documents ({service.documents?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('steps')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'steps'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Application Steps ({service.steps?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('mistakes')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'mistakes'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Common Mistakes ({service.mistakes?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'faqs'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          FAQs
        </button>
      </div>

      {/* Tab Content Display */}

      {/* Overview & Eligibility Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Service Overview</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {service.full_description}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Who is Eligible?</h3>
            <ul className="space-y-2">
              {service.eligibility.map((crit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <span>{crit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <DocumentChecklist documents={service.documents || []} serviceName={service.name} />
      )}

      {/* Steps Tab */}
      {activeTab === 'steps' && (
        <StepGuide steps={service.steps || []} />
      )}

      {/* Mistakes Tab */}
      {activeTab === 'mistakes' && (
        <CommonMistakes mistakes={service.mistakes || []} />
      )}

      {/* FAQs Tab */}
      {activeTab === 'faqs' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {(service.faqs || []).map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={faq.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-slate-900 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs sm:text-sm text-slate-700 border-t border-slate-200 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ask AI Banner Bar */}
      <div className="bg-indigo-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 text-white rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base">Have specific questions about {service.name}?</h4>
            <p className="text-xs text-indigo-200">Ask our AI Assistant for instant personalized guidance.</p>
          </div>
        </div>

        <button
          onClick={() => onAskAI(`What are the documents and steps for ${service.name}?`)}
          className="bg-white text-indigo-900 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors shrink-0"
        >
          Ask AI About {service.name}
        </button>
      </div>
    </div>
  );
};
