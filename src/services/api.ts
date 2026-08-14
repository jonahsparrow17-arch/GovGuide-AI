import {
  GovernmentService,
  GovernmentScheme,
  CitizenProfile,
  SchemeMatchResult,
  ChatRequest,
  ChatResponse
} from '../types';

export async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchServices(): Promise<GovernmentService[]> {
  const res = await fetch('/api/services');
  if (!res.ok) throw new Error('Failed to load services');
  return res.json();
}

export async function fetchServiceBySlug(slug: string): Promise<GovernmentService> {
  const res = await fetch(`/api/services/${slug}`);
  if (!res.ok) throw new Error(`Failed to load service '${slug}'`);
  return res.json();
}

export async function fetchSchemes(category?: string, status?: string): Promise<GovernmentScheme[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (status) params.append('status', status);

  const url = `/api/schemes${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load schemes');
  return res.json();
}

export async function fetchSchemeBySlug(slug: string): Promise<GovernmentScheme> {
  const res = await fetch(`/api/schemes/${slug}`);
  if (!res.ok) throw new Error(`Failed to load scheme '${slug}'`);
  return res.json();
}

export async function findSchemesWizard(profile: CitizenProfile): Promise<{
  profile: CitizenProfile;
  matchedCount: number;
  disclaimer: string;
  results: SchemeMatchResult[];
}> {
  const res = await fetch('/api/schemes/find', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  if (!res.ok) throw new Error('Failed to query matching schemes');
  return res.json();
}

export async function searchUnifiedApi(query: string): Promise<{
  services: GovernmentService[];
  schemes: GovernmentScheme[];
}> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search');
  return res.json();
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  if (!res.ok) throw new Error('Failed to communicate with AI Assistant');
  return res.json();
}
