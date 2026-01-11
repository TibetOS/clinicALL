-- ============================================================================
-- Handle New User Signup - Auto-create clinic and user profile
-- ============================================================================
-- This trigger automatically creates:
-- 1. A new clinic when a user signs up
-- 2. A user profile with role='owner' linked to that clinic
-- ============================================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  new_clinic_id UUID;
  user_full_name TEXT;
  user_clinic_name TEXT;
  user_slug TEXT;
BEGIN
  -- Extract metadata from the new user
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  user_clinic_name := COALESCE(NEW.raw_user_meta_data->>'clinic_name', 'קליניקה חדשה');
  user_slug := COALESCE(NEW.raw_user_meta_data->>'slug', 'clinic-' || substr(NEW.id::text, 1, 8));

  -- Create a new clinic for the user
  INSERT INTO public.clinics (
    name,
    slug,
    business_id,
    address,
    phone,
    whatsapp,
    instagram,
    facebook
  ) VALUES (
    user_clinic_name,
    user_slug,
    NEW.raw_user_meta_data->>'business_id',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'whatsapp',
    NEW.raw_user_meta_data->>'instagram',
    NEW.raw_user_meta_data->>'facebook'
  )
  RETURNING id INTO new_clinic_id;

  -- Create the user profile with 'owner' role
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    clinic_id
  ) VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    'owner',  -- New users who create a clinic are owners
    new_clinic_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to run after user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.clinics TO postgres, service_role;
GRANT ALL ON public.users TO postgres, service_role;

-- ============================================================================
-- Notes:
-- - SECURITY DEFINER allows the function to bypass RLS policies
-- - The trigger runs AFTER INSERT to ensure the auth.users row exists
-- - New users automatically get 'owner' role for their clinic
-- - If a user should be added to an existing clinic (staff/admin),
--   use a separate invite flow instead of the signup flow
-- ============================================================================
