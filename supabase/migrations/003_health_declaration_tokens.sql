-- ============================================================================
-- Health Declaration Tokens Table
-- ============================================================================
-- This table stores secure tokens for health declaration forms.
-- Tokens allow patients to submit health declarations without logging in.
-- Tokens expire after a configurable period (default 7 days).
-- ============================================================================

-- Create enum for token status (if not exists)
DO $$ BEGIN
  CREATE TYPE health_token_status AS ENUM ('active', 'used', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create the table
CREATE TABLE IF NOT EXISTS health_declaration_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,           -- Unique URL-safe token (12 chars)
  clinic_id UUID NOT NULL,              -- References clinic_profiles(id)

  -- Patient info (optional - for existing patients or pre-filled data)
  patient_id UUID,                      -- Optional reference to patients table
  patient_name TEXT,
  patient_phone TEXT,
  patient_email TEXT,

  -- Token lifecycle
  status health_token_status DEFAULT 'active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ                   -- When the form was submitted
);

-- Add foreign key constraints (may already exist)
DO $$ BEGIN
  ALTER TABLE health_declaration_tokens
    ADD CONSTRAINT fk_health_tokens_clinic
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Optional: Add patients FK only if patients table exists
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'patients') THEN
    ALTER TABLE health_declaration_tokens
      ADD CONSTRAINT fk_health_tokens_patient
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Indexes for efficient querying (IF NOT EXISTS for safety)
CREATE INDEX IF NOT EXISTS idx_health_tokens_clinic_id ON health_declaration_tokens(clinic_id);
CREATE INDEX IF NOT EXISTS idx_health_tokens_token ON health_declaration_tokens(token);
CREATE INDEX IF NOT EXISTS idx_health_tokens_patient_id ON health_declaration_tokens(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_tokens_status ON health_declaration_tokens(status);
CREATE INDEX IF NOT EXISTS idx_health_tokens_expires_at ON health_declaration_tokens(expires_at);

-- Enable RLS (safe to run multiple times)
ALTER TABLE health_declaration_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies (drop and recreate to ensure correct configuration)
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "tokens_select_own_clinic" ON health_declaration_tokens;
DROP POLICY IF EXISTS "tokens_insert_own_clinic" ON health_declaration_tokens;
DROP POLICY IF EXISTS "tokens_update_own_clinic" ON health_declaration_tokens;
DROP POLICY IF EXISTS "tokens_delete_own_clinic" ON health_declaration_tokens;
DROP POLICY IF EXISTS "anon_lookup_valid_tokens" ON health_declaration_tokens;
DROP POLICY IF EXISTS "anon_mark_token_used" ON health_declaration_tokens;
DROP POLICY IF EXISTS "health_tokens_staff_all" ON health_declaration_tokens;
DROP POLICY IF EXISTS "health_tokens_anon_lookup" ON health_declaration_tokens;
DROP POLICY IF EXISTS "health_tokens_anon_mark_used" ON health_declaration_tokens;

-- Staff can view tokens for their clinic
CREATE POLICY "tokens_select_own_clinic" ON health_declaration_tokens
  FOR SELECT
  USING (clinic_id::text = auth.jwt() ->> 'clinic_id');

-- Staff can insert tokens for their clinic
CREATE POLICY "tokens_insert_own_clinic" ON health_declaration_tokens
  FOR INSERT
  WITH CHECK (clinic_id::text = auth.jwt() ->> 'clinic_id');

-- Staff can update tokens for their clinic
CREATE POLICY "tokens_update_own_clinic" ON health_declaration_tokens
  FOR UPDATE
  USING (clinic_id::text = auth.jwt() ->> 'clinic_id');

-- Staff can delete tokens for their clinic
CREATE POLICY "tokens_delete_own_clinic" ON health_declaration_tokens
  FOR DELETE
  USING (clinic_id::text = auth.jwt() ->> 'clinic_id');

-- CRITICAL: Anonymous users can ONLY look up ACTIVE, non-expired tokens
-- This prevents token enumeration and ensures expired/used tokens are not accessible
CREATE POLICY "anon_lookup_valid_tokens" ON health_declaration_tokens
  FOR SELECT
  USING (
    auth.role() = 'anon'
    AND status = 'active'
    AND expires_at > now()
  );

-- Anonymous users can mark tokens as used (for health declaration submission)
CREATE POLICY "anon_mark_token_used" ON health_declaration_tokens
  FOR UPDATE
  USING (
    auth.role() = 'anon'
    AND status = 'active'
    AND expires_at > now()
  )
  WITH CHECK (
    status = 'used'  -- Can only change to 'used'
  );

-- ============================================================================
-- Automatic Token Expiration Function
-- ============================================================================

CREATE OR REPLACE FUNCTION expire_health_tokens()
RETURNS void AS $$
BEGIN
  UPDATE health_declaration_tokens
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: To automatically run this function, set up a Supabase cron job:
-- SELECT cron.schedule('expire-health-tokens', '0 * * * *', 'SELECT expire_health_tokens()');
-- This runs every hour to expire old tokens.

-- ============================================================================
-- Comments for documentation
-- ============================================================================
COMMENT ON TABLE health_declaration_tokens IS 'Secure tokens for patient health declaration forms';
COMMENT ON COLUMN health_declaration_tokens.token IS 'Unique URL-safe token (12 alphanumeric characters)';
COMMENT ON COLUMN health_declaration_tokens.status IS 'Token lifecycle: active (can be used), used (form submitted), expired (past expiration)';
COMMENT ON COLUMN health_declaration_tokens.expires_at IS 'Token expiration timestamp (default 7 days from creation)';
