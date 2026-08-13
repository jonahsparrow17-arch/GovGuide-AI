import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailsPage } from './pages/ServiceDetailsPage';
import { AIChatPage } from './pages/AIChatPage';
import { fetchServices } from './services/api';
import { GovernmentService } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'services' | 'chat'>('home');
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string | null>(null);
  const [initialAiQuery, setInitialAiQuery] = useState<string>('');
  const [services, setServices] = useState<GovernmentService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchServices();
        setServices(data);
      } catch (err) {
        console.error('Failed to load services on boot:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectService = (slug: string) => {
    setSelectedServiceSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAIQuery = (query: string) => {
    setInitialAiQuery(query);
    setActiveTab('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavTab = (tab: 'home' | 'services' | 'chat') => {
    setActiveTab(tab);
    setSelectedServiceSlug(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100/60 font-sans text-slate-900 flex flex-col justify-between">
      <div>
        <Header
          activeTab={activeTab}
          setActiveTab={handleNavTab}
          onOpenQuickAI={() => handleNavTab('chat')}
        />

        <main className="pb-12">
          {selectedServiceSlug ? (
            <ServiceDetailsPage
              slug={selectedServiceSlug}
              onBack={() => setSelectedServiceSlug(null)}
              onAskAI={handleOpenAIQuery}
            />
          ) : activeTab === 'home' ? (
            <HomePage
              services={services}
              onSelectService={handleSelectService}
              onOpenAIQuery={handleOpenAIQuery}
              setActiveTab={handleNavTab}
            />
          ) : activeTab === 'services' ? (
            <ServicesPage
              services={services}
              onSelectService={handleSelectService}
              onOpenAIQuery={handleOpenAIQuery}
            />
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
          setSelectedServiceSlug(slug);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        setActiveTab={handleNavTab}
      />
    </div>
  );
}
