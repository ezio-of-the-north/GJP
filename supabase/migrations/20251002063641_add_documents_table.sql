/*
  # Add Documents Management System

  ## Overview
  This migration adds document management functionality allowing applicants to upload
  and manage documents (resumes, certificates, etc.) that can be attached to job applications.

  ## New Tables

  ### 1. `documents`
  Stores applicant documents that can be used for job applications
  - `id` (uuid, primary key) - Unique document identifier
  - `user_id` (uuid) - References profiles table (document owner)
  - `name` (text) - Document display name
  - `file_url` (text) - URL to the stored document file
  - `file_type` (text) - Type of document (resume, certificate, cover_letter, other)
  - `file_size` (integer) - Size of file in bytes
  - `created_at` (timestamptz) - Document upload timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Changes to Existing Tables

  ### `applications`
  - Add `document_ids` (text array) - Array of document IDs attached to the application

  ## Security

  ### Row Level Security (RLS)
  Documents table has RLS enabled with the following policies:

  #### Documents Table
  - Users can view only their own documents
  - Users can insert their own documents
  - Users can update only their own documents
  - Users can delete only their own documents

  ## Important Notes
  - Documents are personal to each user
  - Document URLs will be stored as text (for flexibility with storage solutions)
  - Applicants can attach multiple documents to their applications
  - File type categorization helps organize different document types
*/

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL DEFAULT 'other' CHECK (file_type IN ('resume', 'certificate', 'cover_letter', 'other')),
  file_size integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Add document_ids column to applications table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'document_ids'
  ) THEN
    ALTER TABLE applications ADD COLUMN document_ids text[] DEFAULT '{}';
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);

-- Create trigger for updated_at column
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
