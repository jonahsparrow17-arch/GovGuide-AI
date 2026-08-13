import { GovernmentService, ChatRequest, ChatResponse } from '../types';

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

export async function searchServicesApi(query: string): Promise<GovernmentService[]> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search services');
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
