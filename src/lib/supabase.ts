import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'applicant' | 'hr';
  phone?: string;
  created_at: string;
  updated_at: string;
};

export type Job = {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string;
  location: string;
  salary_range: string;
  employment_type: 'Full-time' | 'Part-time' | 'Contract';
  deadline: string;
  status: 'open' | 'closed' | 'draft';
  posted_by: string;
  created_at: string;
  updated_at: string;
};

export type Application = {
  id: string;
  job_id: string;
  applicant_id: string;
  cover_letter: string;
  resume_url?: string;
  document_ids?: string[];
  is_complete?: boolean;
  submitted_at?: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'accepted';
  applied_at: string;
  updated_at: string;
};

export type DocumentType =
  | 'application_letter'
  | 'pds'
  | 'wes'
  | 'eligibility'
  | 'transcript'
  | 'diploma'
  | 'performance_rating'
  | 'training_certificates'
  | 'service_record'
  | 'other';

export type Document = {
  id: string;
  user_id: string;
  name: string;
  file_url: string;
  file_type: DocumentType;
  file_size: number;
  document_category?: string;
  mime_type?: string;
  created_at: string;
  updated_at: string;
};

export const REQUIRED_DOCUMENTS: { type: DocumentType; label: string; description: string; required: boolean }[] = [
  {
    type: 'application_letter',
    label: 'Application Letter',
    description: 'Indicate the position, plantilla number, and place of assignment',
    required: true
  },
  {
    type: 'pds',
    label: 'Personal Data Sheet (CSC Form 212, Revised)',
    description: 'Fully accomplished and signed',
    required: true
  },
  {
    type: 'wes',
    label: 'Work Experience Sheet (WES)',
    description: 'Required for supervisory or technical positions',
    required: false
  },
  {
    type: 'eligibility',
    label: 'Eligibility / License / Rating Certificate',
    description: 'Authenticated copy (if applicable)',
    required: false
  },
  {
    type: 'transcript',
    label: 'Transcript of Records',
    description: 'Certified true copy',
    required: true
  },
  {
    type: 'diploma',
    label: 'Diploma',
    description: 'Certified true copy',
    required: true
  },
  {
    type: 'performance_rating',
    label: 'Performance Rating',
    description: 'For current government employees',
    required: false
  },
  {
    type: 'training_certificates',
    label: 'Certificates of Training',
    description: 'Relevant to the position applied for',
    required: false
  },
  {
    type: 'service_record',
    label: 'Service Record / Certificate of Employment',
    description: 'Service Record for government employees or Certificate of Employment for non-government',
    required: true
  }
];
