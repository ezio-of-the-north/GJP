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
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'accepted';
  applied_at: string;
  updated_at: string;
};

export type Document = {
  id: string;
  user_id: string;
  name: string;
  file_url: string;
  file_type: 'resume' | 'certificate' | 'cover_letter' | 'other';
  file_size: number;
  created_at: string;
  updated_at: string;
};
