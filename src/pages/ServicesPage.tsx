import React, { useState } from 'react';
import { GovernmentService } from '../types';
import { ServiceCard } from '../components/ServiceCard';
import { Search, Filter, Compass } from 'lucide-react';

interface ServicesPageProps {
  services: GovernmentService[];
  onSelectService: (slug: string) => void;
  onOpenAIQuery: (query: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  services,
  onSelectService,
  onOpenAIQuery
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(services.map(s => s.category)))];

  const filtered = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.short_description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Compass className="w-4 h-4" />
          <span>Government Services Directory</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold mb-3">
          Explore Government Service Guides
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Detailed checklists, eligibility criteria, step-by-step procedures, and official portal links for all supported Indian government services.
        </p>

        {/* Filter & Search Bar */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by service name or keyword..."
              className="w-full bg-slate-800 text-white placeholder-slate-400 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-white text-xs font-medium focus:outline-none w-full py-2 cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-slate-800 text-white">
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(service => (
          <ServiceCard
            key={service.id}
            service={service}
            onViewGuide={onSelectService}
            onSelect={onSelectService}
            onAskAI={(name) => onOpenAIQuery(`What are the steps and documents for ${name}?`)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
            <p className="text-sm font-semibold mb-2">No matching government services found.</p>
            <p className="text-xs">Try searching for "Passport", "Aadhaar", "PAN", "Licence", or "Voter ID".</p>
          </div>
        )}
      </div>
    </div>
  );
};
