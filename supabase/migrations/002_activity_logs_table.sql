-- ============================================================================
-- Activity Logs Table for Healthcare Compliance Audit Trail
-- ============================================================================
-- This table records all significant actions in the system for HIPAA compliance.
-- Activity logs are immutable - no updates or deletes are allowed.
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinic_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_role TEXT,

  -- Action details
  action TEXT NOT NULL,           -- 'view', 'create', 'update', 'delete', 'export', 'login', 'logout'
  resource_type TEXT NOT NULL,    -- 'patient', 'appointment', 'clinical_note', 'declaration', 'invoice', etc.
  resource_id TEXT,               -- ID of the affected resource
  resource_name TEXT,             -- Human-readable name (for display in audit log)

  -- Additional context
  details JSONB DEFAULT '{}',     -- Additional action-specific details
  ip_address INET,                -- Client IP address (if available)
  user_agent TEXT,                -- Browser/client info

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for efficient querying
CREATE INDEX idx_activity_logs_clinic_id ON activity_logs(clinic_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies (immutable - insert only, no update/delete)
CREATE POLICY "activity_logs_insert" ON activity_logs
  FOR INSERT
  WITH CHECK (clinic_id = auth.jwt() ->> 'clinic_id');

CREATE POLICY "activity_logs_select" ON activity_logs
  FOR SELECT
  USING (
    clinic_id = auth.jwt() ->> 'clinic_id'
    AND (auth.jwt() ->> 'role')::text IN ('owner', 'admin')
  );

-- Prevent any modifications to existing logs
-- (No UPDATE or DELETE policies = immutable)

-- ============================================================================
-- Trigger to automatically log PHI access
-- ============================================================================

-- Function to log access to sensitive tables
CREATE OR REPLACE FUNCTION log_phi_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log SELECT operations on sensitive tables
  IF TG_OP = 'SELECT' THEN
    INSERT INTO activity_logs (
      clinic_id,
      user_id,
      user_email,
      action,
      resource_type,
      resource_id
    ) VALUES (
      auth.jwt() ->> 'clinic_id',
      auth.uid(),
      auth.jwt() ->> 'email',
      'view',
      TG_TABLE_NAME,
      NEW.id::TEXT
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The above trigger is commented out by default as it may impact performance.
-- Enable selectively for highly sensitive tables if required by compliance.

-- ============================================================================
-- Retention Policy (Optional)
-- ============================================================================
-- For HIPAA compliance, consider keeping logs for at least 6 years.
-- This can be implemented via Supabase scheduled functions or external cron jobs.

-- Example: Create a function to archive old logs (not delete)
-- CREATE OR REPLACE FUNCTION archive_old_activity_logs()
-- RETURNS void AS $$
-- BEGIN
--   -- Move logs older than 2 years to archive table
--   INSERT INTO activity_logs_archive
--   SELECT * FROM activity_logs
--   WHERE created_at < NOW() - INTERVAL '2 years';
--
--   -- Delete from main table (only if archive is successful)
--   DELETE FROM activity_logs
--   WHERE created_at < NOW() - INTERVAL '2 years';
-- END;
-- $$ LANGUAGE plpgsql;
