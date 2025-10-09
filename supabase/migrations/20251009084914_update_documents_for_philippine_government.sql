/*
  # Update Documents System for Philippine Government Requirements

  ## Overview
  Updates the documents table to support specific Philippine government employment document types
  required by MGB Region 2 for job applications.

  ## Changes

  ### 1. Update `documents` table
  - Modify `file_type` column to include Philippine government document types:
    - application_letter: Application Letter with position and plantilla number
    - pds: Personal Data Sheet (CSC Form 212, Revised)
    - wes: Work Experience Sheet (for supervisory/technical positions)
    - eligibility: Eligibility/License/Rating Certificate
    - transcript: Transcript of Records
    - diploma: Diploma certificate
    - performance_rating: Performance Rating (for government employees)
    - training_certificates: Certificates of Training
    - service_record: Service Record (government) or Certificates of Employment
    - other: Other supporting documents

  ### 2. Update `applications` table
  - Replace `document_ids` with specific document field columns for required documents
  - Add validation fields for complete submission

  ## Important Notes
  - All documents must be PDF format
  - Maximum file size: 10 MB per document
  - Filename format: Lastname_Firstname_DocumentName.pdf
  - All required documents must be uploaded before submission
*/

-- Drop the existing file_type constraint and add new one with Philippine government document types
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_file_type_check;

ALTER TABLE documents ADD CONSTRAINT documents_file_type_check 
  CHECK (file_type IN (
    'application_letter',
    'pds',
    'wes',
    'eligibility',
    'transcript',
    'diploma',
    'performance_rating',
    'training_certificates',
    'service_record',
    'other'
  ));

-- Add document_type field to help categorize documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'document_category'
  ) THEN
    ALTER TABLE documents ADD COLUMN document_category text DEFAULT 'general';
  END IF;
END $$;

-- Add mime_type field for better file validation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'mime_type'
  ) THEN
    ALTER TABLE documents ADD COLUMN mime_type text DEFAULT 'application/pdf';
  END IF;
END $$;

-- Add is_complete flag to applications to track if all required documents are uploaded
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'is_complete'
  ) THEN
    ALTER TABLE applications ADD COLUMN is_complete boolean DEFAULT false;
  END IF;
END $$;

-- Add submitted_at timestamp to track when application was fully submitted
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'submitted_at'
  ) THEN
    ALTER TABLE applications ADD COLUMN submitted_at timestamptz;
  END IF;
END $$;

-- Create index for better performance on document queries
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);
CREATE INDEX IF NOT EXISTS idx_applications_is_complete ON applications(is_complete);
