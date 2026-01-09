import { useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ActivityLog, ActivityAction, ActivityResourceType } from '../types';
import { createLogger } from '../lib/logger';

const logger = createLogger('useActivityLog');

/**
 * Activity Logging Hook for Healthcare Compliance
 *
 * This hook provides methods to log user activities for HIPAA compliance audit trails.
 * All PHI access should be logged using this hook.
 *
 * IMPORTANT:
 * - Never log actual PHI content in the details field
 * - Only log IDs, action types, and non-sensitive metadata
 * - Logs are immutable (no updates or deletes)
 *
 * Usage:
 * ```typescript
 * const { logActivity } = useActivityLog();
 *
 * // Log viewing a patient record
 * await logActivity('view', 'patient', patientId, patientName);
 *
 * // Log creating a clinical note
 * await logActivity('create', 'clinical_note', noteId, 'Clinical note for John D.');
 * ```
 */

interface LogActivityInput {
  action: ActivityAction;
  resourceType: ActivityResourceType;
  resourceId?: string;
  resourceName?: string;
  details?: Record<string, unknown>;
}

interface UseActivityLog {
  logActivity: (
    action: ActivityAction,
    resourceType: ActivityResourceType,
    resourceId?: string,
    resourceName?: string,
    details?: Record<string, unknown>
  ) => Promise<void>;
  logBatch: (activities: LogActivityInput[]) => Promise<void>;
}

// In-memory buffer for development/mock mode
const mockActivityLogs: ActivityLog[] = [];

export function useActivityLog(): UseActivityLog {
  const { user, profile } = useAuth();

  /**
   * Log a single activity
   */
  const logActivity = useCallback(async (
    action: ActivityAction,
    resourceType: ActivityResourceType,
    resourceId?: string,
    resourceName?: string,
    details?: Record<string, unknown>
  ): Promise<void> => {
    // SECURITY: Never log in production if not configured properly
    if (!isSupabaseConfigured()) {
      // In mock mode, just store in memory for debugging
      const mockLog: ActivityLog = {
        id: `mock-log-${Date.now()}`,
        clinicId: profile?.clinic_id || 'mock-clinic',
        userId: user?.id,
        userEmail: user?.email,
        userRole: profile?.role,
        action,
        resourceType,
        resourceId,
        resourceName,
        details,
        createdAt: new Date().toISOString(),
      };
      mockActivityLogs.push(mockLog);
      logger.debug('Activity logged (mock):', { action, resourceType, resourceId });
      return;
    }

    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          clinic_id: profile?.clinic_id,
          user_id: user?.id,
          user_email: user?.email,
          user_role: profile?.role,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          resource_name: resourceName,
          details: details || {},
          // Note: IP address and user agent should be captured server-side
          // via Supabase Edge Functions for accuracy
        });

      if (error) {
        // Log error but don't throw - activity logging should not break the app
        logger.error('Failed to log activity:', error);
      }
    } catch (err) {
      // Silently fail - activity logging should never break the main functionality
      logger.error('Exception logging activity:', err);
    }
  }, [user, profile]);

  /**
   * Log multiple activities in a batch
   * Useful for bulk operations
   */
  const logBatch = useCallback(async (activities: LogActivityInput[]): Promise<void> => {
    if (!isSupabaseConfigured()) {
      // Mock mode - just log individually
      for (const activity of activities) {
        await logActivity(
          activity.action,
          activity.resourceType,
          activity.resourceId,
          activity.resourceName,
          activity.details
        );
      }
      return;
    }

    try {
      const records = activities.map(activity => ({
        clinic_id: profile?.clinic_id,
        user_id: user?.id,
        user_email: user?.email,
        user_role: profile?.role,
        action: activity.action,
        resource_type: activity.resourceType,
        resource_id: activity.resourceId,
        resource_name: activity.resourceName,
        details: activity.details || {},
      }));

      const { error } = await supabase
        .from('activity_logs')
        .insert(records);

      if (error) {
        logger.error('Failed to log batch activities:', error);
      }
    } catch (err) {
      logger.error('Exception logging batch activities:', err);
    }
  }, [user, profile, logActivity]);

  return {
    logActivity,
    logBatch,
  };
}

/**
 * Helper to get human-readable activity descriptions
 */
export function getActivityDescription(log: ActivityLog, lang: 'he' | 'en' = 'he'): string {
  const actionLabels: Record<ActivityAction, { he: string; en: string }> = {
    view: { he: 'צפייה', en: 'Viewed' },
    create: { he: 'יצירה', en: 'Created' },
    update: { he: 'עדכון', en: 'Updated' },
    delete: { he: 'מחיקה', en: 'Deleted' },
    export: { he: 'ייצוא', en: 'Exported' },
    login: { he: 'התחברות', en: 'Logged in' },
    logout: { he: 'התנתקות', en: 'Logged out' },
    send_declaration: { he: 'שליחת הצהרה', en: 'Sent declaration' },
  };

  const resourceLabels: Record<ActivityResourceType, { he: string; en: string }> = {
    patient: { he: 'מטופל', en: 'patient' },
    appointment: { he: 'תור', en: 'appointment' },
    clinical_note: { he: 'רשומה קלינית', en: 'clinical note' },
    declaration: { he: 'הצהרת בריאות', en: 'health declaration' },
    invoice: { he: 'חשבונית', en: 'invoice' },
    health_token: { he: 'טוקן הצהרה', en: 'declaration token' },
    service: { he: 'שירות', en: 'service' },
    inventory: { he: 'מלאי', en: 'inventory item' },
    settings: { he: 'הגדרות', en: 'settings' },
    user: { he: 'משתמש', en: 'user' },
  };

  const action = actionLabels[log.action]?.[lang] || log.action;
  const resource = resourceLabels[log.resourceType]?.[lang] || log.resourceType;
  const name = log.resourceName ? ` "${log.resourceName}"` : '';

  if (lang === 'he') {
    return `${action} ${resource}${name}`;
  }
  return `${action} ${resource}${name}`;
}
