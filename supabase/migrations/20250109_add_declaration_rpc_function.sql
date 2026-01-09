-- Migration: Add RPC function for anonymous health declaration submission
-- Date: 2025-01-09
-- Description: Allows patients to submit health declarations via token-based access

-- ===========================================
-- RPC FUNCTION: Submit Health Declaration
-- ===========================================
-- This function can be called anonymously (by patients filling out the form)
-- It validates the token and saves the declaration data

CREATE OR REPLACE FUNCTION public.submit_health_declaration(
  p_token TEXT,
  p_form_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token_record RECORD;
  v_declaration_id UUID;
  v_patient_name TEXT;
  v_clinic_id UUID;
BEGIN
  -- 1. Validate token exists and is active
  SELECT * INTO v_token_record
  FROM public.health_declaration_tokens
  WHERE token = p_token
    AND status = 'active'
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_TOKEN',
      'message', 'Token is invalid, expired, or already used'
    );
  END IF;

  -- 2. Get patient name and clinic_id
  v_patient_name := COALESCE(v_token_record.patient_name, 'Unknown');
  v_clinic_id := v_token_record.clinic_id;

  -- 3. Insert the declaration
  INSERT INTO public.declarations (
    clinic_id,
    patient_id,
    patient_name,
    status,
    form_data,
    submitted_at
  ) VALUES (
    v_clinic_id,
    v_token_record.patient_id,
    v_patient_name,
    'signed',
    p_form_data,
    NOW()
  )
  RETURNING id INTO v_declaration_id;

  -- 4. Mark token as used
  UPDATE public.health_declaration_tokens
  SET status = 'used',
      used_at = NOW()
  WHERE id = v_token_record.id;

  -- 5. Update patient record if patient_id exists
  IF v_token_record.patient_id IS NOT NULL THEN
    UPDATE public.patients
    SET declaration_status = 'valid',
        last_declaration_date = NOW(),
        pending_declaration_token = NULL
    WHERE id = v_token_record.patient_id;
  END IF;

  -- 6. Return success
  RETURN jsonb_build_object(
    'success', true,
    'declaration_id', v_declaration_id,
    'message', 'Declaration submitted successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'SUBMISSION_ERROR',
      'message', SQLERRM
    );
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.submit_health_declaration(TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_health_declaration(TEXT, JSONB) TO authenticated;

-- ===========================================
-- COMMENTS FOR DOCUMENTATION
-- ===========================================
COMMENT ON FUNCTION public.submit_health_declaration IS
  'Allows patients to submit health declarations via token-based access. '
  'Validates the token, saves the declaration, marks token as used, '
  'and updates the patient record with valid declaration status.';
