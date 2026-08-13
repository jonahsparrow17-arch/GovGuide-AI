export interface DocumentRequirement {
  id: number;
  service_id: number;
  category: string; // e.g., "Identity Proof", "Address Proof", "Date of Birth Proof"
  name: string;
  description: string;
  is_mandatory: boolean;
  accepted_options: string[];
}

export interface ApplicationStep {
  id: number;
  service_id: number;
  step_number: number;
  title: string;
  description: string;
  location_type: 'Online' | 'Offline' | 'Hybrid'; // Online / Visit Center / Both
  tip?: string;
}

export interface CommonMistake {
  id: number;
  service_id: number;
  mistake: string;
  impact: string;
  prevention: string;
}

export interface ServiceFAQ {
  id: number;
  service_id: number;
  question: string;
  answer: string;
}

export interface GovernmentService {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  full_description: string;
  overview?: string;
  category: string;
  eligibility: string[];
  official_website: string;
  processing_fee: string;
  processing_time: string;
  processing_information?: string;
  issuing_authority: string;
  icon: string; // Lucide icon name or emoji identifier
  documents?: DocumentRequirement[];
  steps?: ApplicationStep[];
  mistakes?: CommonMistake[];
  faqs?: ServiceFAQ[];
}

export interface ChatRequest {
  message: string;
  serviceSlug?: string;
}

export interface ChatResponse {
  answer: string;
  service?: string;
  source?: string;
  suggestedQuestions?: string[];
  groundingContext?: string[];
}
