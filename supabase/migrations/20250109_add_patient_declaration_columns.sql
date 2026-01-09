-- Migration: Add patient declaration tracking columns
-- Date: 2025-01-09
-- Description: Adds columns to track health declaration status directly on patients

-- ===========================================
-- ADD DECLARATION COLUMNS TO PATIENTS TABLE
-- ===========================================

-- Add declaration status column (enum-like text with check constraint)
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS declaration_status TEXT
CHECK (declaration_status IN ('valid', 'expired', 'pending', 'none'));

-- Add last declaration date column
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS last_declaration_date TIMESTAMPTZ;

-- Add pending declaration token reference
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS pending_declaration_token TEXT;

-- Set default declaration_status for existing patients
UPDATE public.patients
SET declaration_status = 'none'
WHERE declaration_status IS NULL;

-- Add index for efficient filtering by declaration status
CREATE INDEX IF NOT EXISTS idx_patients_declaration_status
ON public.patients(clinic_id, declaration_status);

-- ===========================================
-- COMMENTS FOR DOCUMENTATION
-- ===========================================
COMMENT ON COLUMN public.patients.declaration_status IS
  'Current health declaration status: valid, expired, pending, or none';

COMMENT ON COLUMN public.patients.last_declaration_date IS
  'Date when the patient last signed a valid health declaration';

COMMENT ON COLUMN public.patients.pending_declaration_token IS
  'Token value if a health declaration request is pending';
