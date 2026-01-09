-- =====================================================
-- ClinicALL Row-Level Security (RLS) Policies
-- =====================================================
-- CRITICAL: Run this BEFORE deploying to production
-- These policies ensure multi-tenant data isolation
-- =====================================================

-- =====================================================
-- HELPER FUNCTION: Get current user's clinic_id
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =====================================================
-- CLINICS TABLE
-- =====================================================
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- Users can only view their own clinic
CREATE POLICY "users_view_own_clinic" ON public.clinics
  FOR SELECT USING (id = public.get_user_clinic_id());

-- Only owners can update clinic settings
CREATE POLICY "owners_update_clinic" ON public.clinics
  FOR UPDATE USING (
    id = public.get_user_clinic_id() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- =====================================================
-- USERS TABLE
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view colleagues in same clinic
CREATE POLICY "users_view_clinic_colleagues" ON public.users
  FOR SELECT USING (clinic_id = public.get_user_clinic_id());

-- Users can update own profile
CREATE POLICY "users_update_own_profile" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Only owners can manage clinic users
CREATE POLICY "owners_manage_users" ON public.users
  FOR ALL USING (
    clinic_id = public.get_user_clinic_id() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- PATIENTS TABLE (CRITICAL - Contains PII)
-- =====================================================
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Staff+ can view clinic's patients
CREATE POLICY "staff_view_patients" ON public.patients
  FOR SELECT USING (clinic_id = public.get_user_clinic_id());

-- Staff+ can insert patients
CREATE POLICY "staff_insert_patients" ON public.patients
  FOR INSERT WITH CHECK (clinic_id = public.get_user_clinic_id());

-- Staff+ can update patients
CREATE POLICY "staff_update_patients" ON public.patients
  FOR UPDATE USING (clinic_id = public.get_user_clinic_id());

-- Only admin+ can delete patients
CREATE POLICY "admin_delete_patients" ON public.patients
  FOR DELETE USING (
    clinic_id = public.get_user_clinic_id() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- APPOINTMENTS TABLE
-- =====================================================
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Staff+ can view clinic's appointments
CREATE POLICY "staff_view_appointments" ON public.appointments
  FOR SELECT USING (clinic_id = public.get_user_clinic_id());

-- Staff+ can manage appointments
CREATE POLICY "staff_manage_appointments" ON public.appointments
  FOR ALL USING (clinic_id = public.get_user_clinic_id());

-- =====================================================
-- SERVICES TABLE
-- =====================================================
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view clinic's services
CREATE POLICY "authenticated_view_services" ON public.services
  FOR SELECT USING (clinic_id = public.get_user_clinic_id());

-- Admin+ can manage services
CREATE POLICY "admin_manage_services" ON public.services
  FOR ALL USING (
    clinic_id = public.get_user_clinic_id() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- CLINICAL NOTES TABLE (CRITICAL - Contains PHI)
-- =====================================================
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;

-- Staff+ can view clinic's clinical notes
CREATE POLICY "staff_view_clinical_notes" ON public.clinical_notes
  FOR SELECT USING (clinic_id = public.get_user_clinic_id());

-- Staff+ can insert clinical notes
CREATE POLICY "staff_insert_clinical_notes" ON public.clinical_notes
  FOR INSERT WITH CHECK (clinic_id = public.get_user_clinic_id());

-- Staff+ can update clinical notes
CREATE POLICY "staff_update_clinical_notes" ON public.clinical_notes
  FOR UPDATE USING (clinic_id = public.get_user_clinic_id());

-- Only admin+ can delete clinical notes
CREATE POLICY "admin_delete_clinical_notes" ON public.clinical_notes
  FOR DELETE USING (
    clinic_id = public.get_user_clinic_id() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- DECLARATIONS TABLE (CRITICAL - Contains Health Data)
-- =====================================================
ALTER TABLE public.declarations ENABLE ROW LEVEL SECURITY;

-- Staff+ can view clinic's declarations
CREATE POLICY "staff_view_declarations" ON public.declarations
  FOR SELECT USING (clinic_id = public.get_user_clinic_id());

-- Allow anonymous insert via health declaration form (token validated separately)
CREATE POLICY "anon_insert_declarations" ON public.declarations
  FOR INSERT TO anon WITH CHECK (true);

-- Staff+ can update declaration status
CREATE POLICY "staff_update_declarations" ON public.declarations
  FOR UPDATE USING (clinic_id = public.get_user_clinic_id());

-- =====================================================
-- HEALTH DECLARATION TOKENS TABLE (CRITICAL)
-- =====================================================
ALTER TABLE public.health_declaration_tokens ENABLE ROW LEVEL SECURITY;

-- Staff+ can view clinic's tokens
CREATE POLICY "staff_view_tokens" ON public.health_declaration_tokens
  FOR SELECT USING (clinic_id = public.get_user_clinic_id());

-- Anonymous users can ONLY look up ACTIVE, NON-EXPIRED tokens
-- This is the critical security fix - validates token at database level
CREATE POLICY "anon_lookup_valid_tokens" ON public.health_declaration_tokens
  FOR SELECT TO anon
  USING (
    status = 'active' AND
    expires_at > NOW()
  );

-- Staff+ can create tokens
CREATE POLICY "staff_create_tokens" ON public.health_declaration_tokens
  FOR INSERT WITH CHECK (clinic_id = public.get_user_clinic_id());

-- Allow anonymous users to mark tokens as used (after submission)
CREATE POLICY "anon_use_token" ON public.health_declaration_tokens
  FOR UPDATE TO anon
  USING (status = 'active' AND expires_at > NOW())
  WITH CHECK (status = 'used');

-- Staff+ can manage tokens
CREATE POLICY "staff_manage_tokens" ON public.health_declaration_tokens
  FOR UPDATE USING (clinic_id = public.get_user_clinic_id());

CREATE POLICY "staff_delete_tokens" ON public.health_declaration_tokens
  FOR DELETE USING (clinic_id = public.get_user_clinic_id());

-- =====================================================
-- INVENTORY ITEMS TABLE
-- =====================================================
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Staff+ can view clinic's inventory
CREATE POLICY "staff_view_inventory" ON public.inventory_items
  FOR SELECT USING (clinic_id = public.get_user_clinic_id());

-- Admin+ can manage inventory
CREATE POLICY "admin_manage_inventory" ON public.inventory_items
  FOR ALL USING (
    clinic_id = public.get_user_clinic_id() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- INVOICES TABLE
-- =====================================================
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Staff+ can view clinic's invoices
CREATE POLICY "staff_view_invoices" ON public.invoices
  FOR SELECT USING (clinic_id = public.get_user_clinic_id());

-- Admin+ can manage invoices
CREATE POLICY "admin_manage_invoices" ON public.invoices
  FOR ALL USING (
    clinic_id = public.get_user_clinic_id() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- LEADS TABLE
-- =====================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Staff+ can view clinic's leads
CREATE POLICY "staff_view_leads" ON public.leads
  FOR SELECT USING (clinic_id = public.get_user_clinic_id());

-- Staff+ can manage leads
CREATE POLICY "staff_manage_leads" ON public.leads
  FOR ALL USING (clinic_id = public.get_user_clinic_id());

-- =====================================================
-- CAMPAIGNS TABLE
-- =====================================================
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Staff+ can view clinic's campaigns
CREATE POLICY "staff_view_campaigns" ON public.campaigns
  FOR SELECT USING (clinic_id = public.get_user_clinic_id());

-- Admin+ can manage campaigns
CREATE POLICY "admin_manage_campaigns" ON public.campaigns
  FOR ALL USING (
    clinic_id = public.get_user_clinic_id() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their clinic's notifications
CREATE POLICY "users_view_notifications" ON public.notifications
  FOR SELECT USING (clinic_id = public.get_user_clinic_id());

-- System can insert notifications (via service role)
CREATE POLICY "system_insert_notifications" ON public.notifications
  FOR INSERT WITH CHECK (clinic_id = public.get_user_clinic_id());

-- Users can mark notifications as read
CREATE POLICY "users_update_notifications" ON public.notifications
  FOR UPDATE USING (clinic_id = public.get_user_clinic_id());

-- =====================================================
-- PUBLIC CLINIC PROFILES (for landing pages)
-- =====================================================
-- Create a view for public clinic data (no sensitive info)
CREATE OR REPLACE VIEW public.public_clinic_profiles AS
SELECT
  id,
  name,
  slug,
  tagline,
  description,
  address,
  phone,
  instagram,
  brand_color
FROM public.clinics;

-- Allow anonymous access to public profiles
GRANT SELECT ON public.public_clinic_profiles TO anon;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify RLS is enabled on all tables:
/*
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
*/

-- List all policies:
/*
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
*/
