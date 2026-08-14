export type TrustStatus = 
  | 'VERIFIED'           // 🟢 Official source confirms the information
  | 'ACTIVE'             // 🔵 Existing scheme with current official information
  | 'ANNOUNCED'          // 🟡 Announced by government but implementation details may change
  | 'DETAILS_PENDING'    // 🟠 Scheme exists or announced, operational details not yet confirmed
  | 'NEEDS_VERIFICATION';// 🔴 Do not present information as confirmed

export type SchemeCategory =
  | 'Education & Students'
  | 'Women & Family'
  | 'Employment & Skills'
  | 'Differently Abled'
  | 'Senior Citizens'
  | 'Housing / Welfare'
  | 'Livelihood'
  | 'Other Government Schemes';

export interface DocumentRequirement {
  id: number;
  service_id?: number;
  category: string; // e.g., "Identity Proof", "Address Proof", "Date of Birth Proof"
  name: string;
  description: string;
  is_mandatory: boolean;
  accepted_options: string[];
}

export interface ApplicationStep {
  id: number;
  service_id?: number;
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
  icon: string; // Lucide icon name or identifier
  last_verified?: string;
  important_notes?: string;
  documents?: DocumentRequirement[];
  steps?: ApplicationStep[];
  mistakes?: CommonMistake[];
  faqs?: ServiceFAQ[];
}

export interface GovernmentScheme {
  id: number;
  name: string;
  slug: string;
  category: SchemeCategory;
  department: string;
  state_or_central: string;
  benefit: string;
  who_can_apply: string;
  what_you_get: string;
  eligibility: string[];
  documents: string[];
  application_steps: {
    step_number: number;
    title: string;
    description: string;
    location_type?: string;
  }[];
  status: TrustStatus;
  official_source: string;
  source_verified_authority: string;
  last_verified: string;
  effective_date?: string;
  important_notes?: string;
  target_demographics: string[];
  education_level?: string[];
  min_age?: number;
  max_age?: number;
  income_limit_annual?: number;
  gender?: 'All' | 'Female' | 'Male' | 'Transgender';
}

export interface CitizenProfile {
  user_type: string; // 'Student' | 'Parent' | 'Senior Citizen' | 'Job Seeker' | 'Woman' | 'Differently Abled' | 'Farmer / Street Vendor' | 'Other'
  education_level?: string; // 'School' | 'College' | 'ITI / Polytechnic' | 'Graduate' | 'Other'
  age?: number;
  gender?: string; // 'Female' | 'Male' | 'Transgender' | 'Any'
  annual_income?: number;
  category_interest?: string;
  is_differently_abled?: boolean;
}

export interface SchemeMatchResult {
  scheme: GovernmentScheme;
  matchScore: number;
  matchReasons: string[];
  disclaimer: string;
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

