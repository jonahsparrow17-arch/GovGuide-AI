import React, { useState, useEffect } from 'react';
import { Header, NavTab } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailsPage } from './pages/ServiceDetailsPage';
import { SchemesPage } from './pages/SchemesPage';
import { SchemeDetailsPage } from './pages/SchemeDetailsPage';
import { FindSchemesPage } from './pages/FindSchemesPage';
import { ChecklistPage } from './pages/ChecklistPage';
import { AboutTrustPage } from './pages/AboutTrustPage';
import { AIChatPage } from './pages/AIChatPage';
import { fetchServices, fetchSchemes } from './services/api';
import { GovernmentService, GovernmentScheme } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string | null>(null);
  const [selectedSchemeSlug, setSelectedSchemeSlug] = useState<string | null>(null);
  const [checklistTargetSlug, setChecklistTargetSlug] = useState<string | undefined>(undefined);
  const [initialAiQuery, setInitialAiQuery] = useState<string>('');

  const [services, setServices] = useState<GovernmentService[]>([]);
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [srvs, schms] = await Promise.all([fetchServices(), fetchSchemes()]);
        setServices(srvs);
        setSchemes(schms);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectService = (slug: string) => {
    setSelectedServiceSlug(slug);
    setSelectedSchemeSlug(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectScheme = (slug: string) => {
    setSelectedSchemeSlug(slug);
    setSelectedServiceSlug(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenChecklist = (slug: string) => {
    setChecklistTargetSlug(slug);
    setSelectedServiceSlug(null);
    setSelectedSchemeSlug(null);
    setActiveTab('checklist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAIQuery = (query: string) => {
    setInitialAiQuery(query);
    setSelectedServiceSlug(null);
    setSelectedSchemeSlug(null);
    setActiveTab('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavTab = (tab: NavTab) => {
    setActiveTab(tab);
    setSelectedServiceSlug(null);
    setSelectedSchemeSlug(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100/60 font-sans text-slate-900 flex flex-col justify-between selection:bg-amber-200 selection:text-slate-900">
      <div>
        <Header
          activeTab={activeTab}
          setActiveTab={handleNavTab}
          onOpenQuickAI={() => handleNavTab('chat')}
        />

        <main className="pb-12">
          {/* Individual Service Details View */}
          {selectedServiceSlug ? (
            <ServiceDetailsPage
              slug={selectedServiceSlug}
              onBack={() => setSelectedServiceSlug(null)}
              onAskAI={handleOpenAIQuery}
            />
          ) : selectedSchemeSlug ? (
            /* Individual Scheme Details View */
            <SchemeDetailsPage
              slug={selectedSchemeSlug}
              onBack={() => setSelectedSchemeSlug(null)}
              onAskAI={handleOpenAIQuery}
              onOpenChecklist={handleOpenChecklist}
            />
          ) : activeTab === 'home' ? (
            <HomePage
              services={services}
              schemes={schemes}
              onSelectService={handleSelectService}
              onSelectScheme={handleSelectScheme}
              onOpenAIQuery={handleOpenAIQuery}
              setActiveTab={handleNavTab}
            />
          ) : activeTab === 'services' ? (
            <ServicesPage
              services={services}
              onSelectService={handleSelectService}
              onOpenAIQuery={handleOpenAIQuery}
            />
          ) : activeTab === 'schemes' ? (
            <SchemesPage
              onSelectScheme={handleSelectScheme}
              onOpenWizard={() => handleNavTab('wizard')}
              onOpenChecklist={handleOpenChecklist}
              onAskAI={handleOpenAIQuery}
            />
          ) : activeTab === 'wizard' ? (
            <FindSchemesPage
              onSelectScheme={handleSelectScheme}
              onOpenChecklist={handleOpenChecklist}
              onAskAI={handleOpenAIQuery}
            />
          ) : activeTab === 'checklist' ? (
            <ChecklistPage
              initialServiceOrSchemeSlug={checklistTargetSlug}
              onAskAI={handleOpenAIQuery}
            />
          ) : activeTab === 'trust' ? (
            <AboutTrustPage />
          ) : (
            <AIChatPage
              initialMessage={initialAiQuery}
              availableServices={services}
              onSelectService={handleSelectService}
            />
          )}
        </main>
      </div>

      <Footer
        onSelectService={(slug) => {
          handleSelectService(slug);
        }}
        onSelectScheme={(slug) => {
          handleSelectScheme(slug);
        }}
        setActiveTab={handleNavTab}
      />
    </div>
  );
}
