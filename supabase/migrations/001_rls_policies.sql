-- ============================================================================
-- Row Level Security (RLS) Policies for ClinicALL
-- ============================================================================
-- This file documents the required RLS policies for multi-tenant data isolation
-- and security in the ClinicALL healthcare application.
--
-- IMPORTANT: These policies MUST be applied to your Supabase project before
-- production deployment. Run this migration using the Supabase CLI or dashboard.
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_declaration_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PATIENTS TABLE
-- ============================================================================

-- Clinic staff can view their clinic's patients
CREATE POLICY "patients_select_own_clinic" ON patients
  FOR SELECT
  USING (clinic_id = auth.jwt() ->> 'clinic_id');

-- Clinic staff can insert patients for their clinic
CREATE POLICY "patients_insert_own_clinic" ON patients
  FOR INSERT
  WITH CHECK (clinic_id = auth.jwt() ->> 'clinic_id');

-- Clinic staff can update their clinic's patients
CREATE POLICY "patients_update_own_clinic" ON patients
  FOR UPDATE
  USING (clinic_id = auth.jwt() ->> 'clinic_id');

-- Only owners/admins can delete patients
CREATE POLICY "patients_delete_admin_only" ON patients
  FOR DELETE
  USING (
    clinic_id = auth.jwt() ->> 'clinic_id'
    AND (auth.jwt() ->> 'role')::text IN ('owner', 'admin')
  );

-- ============================================================================
-- APPOINTMENTS TABLE
-- ============================================================================

CREATE POLICY "appointments_select_own_clinic" ON appointments
  FOR SELECT
  USING (clinic_id = auth.jwt() ->> 'clinic_id');

CREATE POLICY "appointments_insert_own_clinic" ON appointments
  FOR INSERT
  WITH CHECK (clinic_id = auth.jwt() ->> 'clinic_id');

CREATE POLICY "appointments_update_own_clinic" ON appointments
  FOR UPDATE
  USING (clinic_id = auth.jwt() ->> 'clinic_id');

CREATE POLICY "appointments_delete_own_clinic" ON appointments
  FOR DELETE
  USING (clinic_id = auth.jwt() ->> 'clinic_id');

-- ============================================================================
-- SERVICES TABLE
-- ============================================================================

CREATE POLICY "services_select_own_clinic" ON services
  FOR SELECT
  USING (clinic_id = auth.jwt() ->> 'clinic_id');

CREATE POLICY "services_insert_own_clinic" ON services
  FOR INSERT
  WITH CHECK (
    clinic_id = auth.jwt() ->> 'clinic_id'
    AND (auth.jwt() ->> 'role')::text IN ('owner', 'admin')
  );

CREATE POLICY "services_update_own_clinic" ON services
  FOR UPDATE
  USING (
    clinic_id = auth.jwt() ->> 'clinic_id'
    AND (auth.jwt() ->> 'role')::text IN ('owner', 'admin')
  );

CREATE POLICY "services_delete_own_clinic" ON services
  FOR DELETE
  USING (
    clinic_id = auth.jwt() ->> 'clinic_id'
    AND (auth.jwt() ->> 'role')::text IN ('owner', 'admin')
  );

-- ============================================================================
-- CLINICAL NOTES TABLE (PHI - Protected Health Information)
-- ============================================================================

-- Only clinic owners and admins can access clinical notes
CREATE POLICY "clinical_notes_select_own_clinic" ON clinical_notes
  FOR SELECT
  USING (
    clinic_id = auth.jwt() ->> 'clinic_id'
    AND (auth.jwt() ->> 'role')::text IN ('owner', 'admin')
  );

CREATE POLICY "clinical_notes_insert_own_clinic" ON clinical_notes
  FOR INSERT
  WITH CHECK (
    clinic_id = auth.jwt() ->> 'clinic_id'
    AND (auth.jwt() ->> 'role')::text IN ('owner', 'admin')
  );

CREATE POLICY "clinical_notes_update_own_clinic" ON clinical_notes
  FOR UPDATE
  USING (
    clinic_id = auth.jwt() ->> 'clinic_id'
    AND (auth.jwt() ->> 'role')::text IN ('owner', 'admin')
  );

-- Only owners can delete clinical notes (audit trail requirement)
CREATE POLICY "clinical_notes_delete_owner_only" ON clinical_notes
  FOR DELETE
  USING (
    clinic_id = auth.jwt() ->> 'clinic_id'
    AND (auth.jwt() ->> 'role')::text = 'owner'
  );

-- ============================================================================
-- DECLARATIONS TABLE (PHI - Health Declarations)
-- ============================================================================

CREATE POLICY "declarations_select_own_clinic" ON declarations
  FOR SELECT
  USING (clinic_id = auth.jwt() ->> 'clinic_id');

CREATE POLICY "declarations_insert_own_clinic" ON declarations
  FOR INSERT
  WITH CHECK (clinic_id = auth.jwt() ->> 'clinic_id');

CREATE POLICY "declarations_update_own_clinic" ON declarations
  FOR UPDATE
  USING (clinic_id = auth.jwt() ->> 'clinic_id');

-- ============================================================================
-- HEALTH DECLARATION TOKENS TABLE
-- ============================================================================

-- Clinic staff can manage tokens for their clinic
CREATE POLICY "tokens_select_own_clinic" ON health_declaration_tokens
  FOR SELECT
  USING (clinic_id = auth.jwt() ->> 'clinic_id');

CREATE POLICY "tokens_insert_own_clinic" ON health_declaration_tokens
  FOR INSERT
  WITH CHECK (clinic_id = auth.jwt() ->> 'clinic_id');

CREATE POLICY "tokens_update_own_clinic" ON health_declaration_tokens
  FOR UPDATE
  USING (clinic_id = auth.jwt() ->> 'clinic_id');

CREATE POLICY "tokens_delete_own_clinic" ON health_declaration_tokens
  FOR DELETE
  USING (clinic_id = auth.jwt() ->> 'clinic_id');

-- CRITICAL: Anonymous users can only look up ACTIVE, non-expired tokens
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
-- INVOICES TABLE
-- ============================================================================

CREATE POLICY "invoices_select_own_clinic" ON invoices
  FOR SELECT
  USING (clinic_id = auth.jwt() ->> 'clinic_id');

CREATE POLICY "invoices_insert_own_clinic" ON invoices
  FOR INSERT
  WITH CHECK (clinic_id = auth.jwt() ->> 'clinic_id');

CREATE POLICY "invoices_update_own_clinic" ON invoices
  FOR UPDATE
  USING (clinic_id = auth.jwt() ->> 'clinic_id');

-- ============================================================================
-- INVENTORY TABLE
-- ============================================================================

CREATE POLICY "inventory_select_own_clinic" ON inventory
  FOR SELECT
  USING (clinic_id = auth.jwt() ->> 'clinic_id');

CREATE POLICY "inventory_insert_own_clinic" ON inventory
  FOR INSERT
  WITH CHECK (clinic_id = auth.jwt() ->> 'clinic_id');

CREATE POLICY "inventory_update_own_clinic" ON inventory
  FOR UPDATE
  USING (clinic_id = auth.jwt() ->> 'clinic_id');

-- ============================================================================
-- CLINIC PROFILES TABLE
-- ============================================================================

-- Public can view clinic profiles (for public landing pages)
CREATE POLICY "clinic_profiles_public_read" ON clinic_profiles
  FOR SELECT
  USING (true);

-- Only clinic owners can update their profile
CREATE POLICY "clinic_profiles_owner_update" ON clinic_profiles
  FOR UPDATE
  USING (
    id = auth.jwt() ->> 'clinic_id'
    AND (auth.jwt() ->> 'role')::text = 'owner'
  );

-- ============================================================================
-- ACTIVITY LOGS TABLE (Audit Trail)
-- ============================================================================

-- Activity logs are append-only - no updates or deletes
CREATE POLICY "activity_logs_select_own_clinic" ON activity_logs
  FOR SELECT
  USING (
    clinic_id = auth.jwt() ->> 'clinic_id'
    AND (auth.jwt() ->> 'role')::text IN ('owner', 'admin')
  );

CREATE POLICY "activity_logs_insert_any_user" ON activity_logs
  FOR INSERT
  WITH CHECK (clinic_id = auth.jwt() ->> 'clinic_id');

-- NO UPDATE OR DELETE policies - audit logs are immutable

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify RLS is properly configured:

-- Check RLS is enabled on all tables:
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public';

-- Check policies on a specific table:
-- SELECT * FROM pg_policies WHERE tablename = 'patients';

-- Test anonymous token lookup (should only return active, non-expired tokens):
-- SET ROLE anon;
-- SELECT * FROM health_declaration_tokens WHERE token = 'test-token';
-- RESET ROLE;
