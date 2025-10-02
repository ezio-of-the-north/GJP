/*
  # Government Job Portal Database Schema

  ## Overview
  This migration creates the complete database schema for a government job portal
  with separate applicant and HR functionality.

  ## New Tables

  ### 1. `profiles`
  User profile information extending Supabase auth.users
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - Either 'applicant' or 'hr'
  - `phone` (text, optional) - Contact number
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `jobs`
  Government job postings created by HR
  - `id` (uuid, primary key) - Unique job identifier
  - `title` (text) - Job title
  - `department` (text) - Government department
  - `description` (text) - Detailed job description
  - `requirements` (text) - Job requirements and qualifications
  - `location` (text) - Job location
  - `salary_range` (text) - Salary information
  - `employment_type` (text) - Full-time, Part-time, Contract
  - `deadline` (date) - Application deadline
  - `status` (text) - open, closed, draft
  - `posted_by` (uuid) - HR user who posted the job
  - `created_at` (timestamptz) - Job creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `applications`
  Job applications submitted by applicants
  - `id` (uuid, primary key) - Unique application identifier
  - `job_id` (uuid) - References jobs table
  - `applicant_id` (uuid) - References profiles table
  - `cover_letter` (text) - Applicant's cover letter
  - `resume_url` (text, optional) - URL to uploaded resume
  - `status` (text) - pending, reviewing, shortlisted, rejected, accepted
  - `applied_at` (timestamptz) - Application submission timestamp
  - `updated_at` (timestamptz) - Last status update timestamp

  ## Security
  
  ### Row Level Security (RLS)
  All tables have RLS enabled with the following policies:

  #### Profiles Table
  - Authenticated users can view all profiles
  - Users can insert their own profile on signup
  - Users can update only their own profile
  - No delete access

  #### Jobs Table
  - Anyone (including public) can view open jobs
  - Only HR users can insert new jobs
  - Only HR users can update jobs they posted
  - Only HR users can delete jobs they posted

  #### Applications Table
  - Applicants can view their own applications
  - HR users can view all applications
  - Applicants can insert applications for open jobs
  - Applicants can update their own pending applications
  - HR users can update application status
  - No delete access for applications

  ## Important Notes
  - All tables use UUIDs for primary keys
  - Foreign key constraints ensure data integrity
  - Timestamps track creation and modification times
  - RLS policies enforce strict access control based on user roles
  - Default values prevent NULL-related issues
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'applicant' CHECK (role IN ('applicant', 'hr')),
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department text NOT NULL,
  description text NOT NULL,
  requirements text NOT NULL,
  location text NOT NULL,
  salary_range text NOT NULL,
  employment_type text NOT NULL DEFAULT 'Full-time' CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract')),
  deadline date NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft')),
  posted_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open jobs"
  ON jobs FOR SELECT
  TO authenticated, anon
  USING (status = 'open');

CREATE POLICY "HR can view all jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr'
    )
  );

CREATE POLICY "HR can insert jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr'
    )
  );

CREATE POLICY "HR can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (
    posted_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr'
    )
  )
  WITH CHECK (
    posted_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr'
    )
  );

CREATE POLICY "HR can delete own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (
    posted_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr'
    )
  );

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter text NOT NULL,
  resume_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'rejected', 'accepted')),
  applied_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Applicants can view own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (applicant_id = auth.uid());

CREATE POLICY "HR can view all applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr'
    )
  );

CREATE POLICY "Applicants can insert applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (
    applicant_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'applicant'
    ) AND
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_id
      AND jobs.status = 'open'
      AND jobs.deadline >= CURRENT_DATE
    )
  );

CREATE POLICY "Applicants can update own pending applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    applicant_id = auth.uid() AND
    status = 'pending'
  )
  WITH CHECK (
    applicant_id = auth.uid() AND
    status = 'pending'
  );

CREATE POLICY "HR can update application status"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr'
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_deadline ON jobs(deadline);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON jobs(posted_by);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();