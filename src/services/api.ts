import {
  GovernmentService,
  GovernmentScheme,
  CitizenProfile,
  SchemeMatchResult,
  ChatRequest,
  ChatResponse,
  SchemeCategoryCount,
  EligibilityCheckRequest,
  EligibilityCheckResult,
  SourceRecord,
  ChecklistRecord
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

export async function fetchSchemeCategories(): Promise<SchemeCategoryCount[]> {
  const res = await fetch('/api/schemes/categories');
  if (!res.ok) throw new Error('Failed to load scheme categories');
  return res.json();
}

export async function fetchSchemeBySlug(slug: string): Promise<GovernmentScheme> {
  const res = await fetch(`/api/schemes/${slug}`);
  if (!res.ok) throw new Error(`Failed to load scheme '${slug}'`);
  return res.json();
}

export async function checkEligibilityApi(criteria: EligibilityCheckRequest): Promise<{
  success: boolean;
  criteria: EligibilityCheckRequest;
  evaluatedCount: number;
  disclaimer: string;
  results: EligibilityCheckResult[];
}> {
  const res = await fetch('/api/eligibility/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(criteria)
  });
  if (!res.ok) throw new Error('Failed to evaluate eligibility criteria');
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

export async function fetchOfficialSources(): Promise<SourceRecord[]> {
  const res = await fetch('/api/sources');
  if (!res.ok) throw new Error('Failed to load official sources');
  return res.json();
}

export async function fetchChecklists(): Promise<ChecklistRecord[]> {
  const res = await fetch('/api/checklists');
  if (!res.ok) throw new Error('Failed to load checklists');
  return res.json();
}

export async function fetchChecklistById(id: string): Promise<ChecklistRecord> {
  const res = await fetch(`/api/checklists/${id}`);
  if (!res.ok) throw new Error(`Failed to load checklist '${id}'`);
  return res.json();
}

export async function createChecklistApi(data: {
  title: string;
  target_slug?: string;
  target_type?: 'service' | 'scheme';
  items?: { title: string; description?: string; required?: boolean; source?: string }[];
}): Promise<ChecklistRecord> {
  const res = await fetch('/api/checklists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to save checklist');
  return res.json();
}

export async function updateChecklistItemApi(checklistId: string, itemId: string, completed: boolean): Promise<boolean> {
  const res = await fetch(`/api/checklists/${checklistId}/items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed })
  });
  if (!res.ok) throw new Error('Failed to update checklist item');
  return true;
}

export async function deleteChecklistApi(id: string): Promise<boolean> {
  const res = await fetch(`/api/checklists/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete checklist');
  return true;
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

