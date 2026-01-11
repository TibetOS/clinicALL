-- ============================================================================
-- Remove 'staff' role from RLS policies
-- ============================================================================
-- The staff role has been removed from the application.
-- Role hierarchy is now: owner > admin > client
-- ============================================================================

-- Drop existing clinical_notes policies that include 'staff'
DROP POLICY IF EXISTS "clinical_notes_select_own_clinic" ON clinical_notes;
DROP POLICY IF EXISTS "clinical_notes_insert_own_clinic" ON clinical_notes;
DROP POLICY IF EXISTS "clinical_notes_update_own_clinic" ON clinical_notes;

-- Recreate policies with only owner and admin roles
-- Only clinic owners and admins can access clinical notes
CREATE POLICY "clinical_notes_select_own_clinic" ON clinical_notes
  FOR SELECT
  USING (
    clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
    AND (auth.jwt() ->> 'role')::text IN ('owner', 'admin')
  );

CREATE POLICY "clinical_notes_insert_own_clinic" ON clinical_notes
  FOR INSERT
  WITH CHECK (
    clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
    AND (auth.jwt() ->> 'role')::text IN ('owner', 'admin')
  );

CREATE POLICY "clinical_notes_update_own_clinic" ON clinical_notes
  FOR UPDATE
  USING (
    clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
    AND (auth.jwt() ->> 'role')::text IN ('owner', 'admin')
  );

-- Note: clinical_notes_delete_owner_only policy remains unchanged
-- (already restricted to owner role only)
