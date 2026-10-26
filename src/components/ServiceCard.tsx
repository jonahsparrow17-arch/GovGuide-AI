import React from 'react';
import { GovernmentService } from '../types';
import { ServiceIcon } from './ServiceIcon';
import { ArrowRight, Clock, Tag, ExternalLink, Sparkles } from 'lucide-react';

interface ServiceCardProps {
  service: GovernmentService;
  onViewGuide?: (slug: string) => void;
  onSelect?: (slug: string) => void;
  onAskAI?: (serviceName: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onViewGuide,
  onSelect,
  onAskAI
}) => {
  const handleViewGuide = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof onViewGuide === 'function') {
      onViewGuide(service.slug);
    } else if (typeof onSelect === 'function') {
      onSelect(service.slug);
    } else {
      console.warn(`[ServiceCard] No navigation callback provided for service "${service.slug}"`);
    }
  };

  const handleAskAI = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onAskAI === 'function') {
      onAskAI(service.name);
    }
  };

  return (
    <div
      id={`service-card-${service.slug}`}
      className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between group cursor-pointer"
      onClick={handleViewGuide}
    >
      <div>
        {/* Top bar with Icon and Category */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
            <ServiceIcon name={service.icon} className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/80">
            {service.category}
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={handleViewGuide}
          className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors"
        >
          {service.name}
        </h3>

        {/* Short description */}
        <p className="text-xs text-slate-600 leading-relaxed mb-5 line-clamp-3">
          {service.short_description}
        </p>

        {/* Processing Info Badges */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl mb-5 border border-slate-100">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Estimated Fee</span>
            <span className="font-semibold text-slate-800 text-[11px] line-clamp-1">{service.processing_fee}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Timeline</span>
            <span className="font-semibold text-slate-800 text-[11px] line-clamp-1">{service.processing_time}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {onAskAI && (
          <button
            type="button"
            id={`service-ask-ai-${service.slug}`}
            onClick={handleAskAI}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 py-1.5 px-2 rounded-lg hover:bg-indigo-50 transition-colors"
            title={`Ask AI about ${service.name}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>
        )}

        <button
          type="button"
          id={`service-view-guide-${service.slug}`}
          onClick={handleViewGuide}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl group-hover:bg-indigo-600 transition-colors shadow-sm"
        >
          <span>View Complete Guide</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
