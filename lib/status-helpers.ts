/**
 * Status helpers for translating and styling status values
 * Used across admin pages for consistent Hebrew translations and badge variants
 */

/** Badge variant types (matches Badge component in components/ui.tsx) */
type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary';

// Risk level translations
const RISK_LEVEL_LABELS: Record<string, string> = {
  low: 'נמוך',
  medium: 'בינוני',
  high: 'גבוה',
};

// Appointment status translations
const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  confirmed: 'מאושר',
  pending: 'ממתין',
  completed: 'הושלם',
  cancelled: 'בוטל',
  'no-show': 'לא הגיע',
};

// Invoice status translations
const INVOICE_STATUS_LABELS: Record<string, string> = {
  paid: 'שולם',
  pending: 'ממתין',
  overdue: 'באיחור',
  refunded: 'החזר',
  cancelled: 'בוטל',
};

// Inventory status translations
const INVENTORY_STATUS_LABELS: Record<string, string> = {
  ok: 'תקין',
  low: 'נמוך',
  critical: 'קריטי',
};

// Declaration status translations
const DECLARATION_STATUS_LABELS: Record<string, string> = {
  pending: 'ממתין',
  submitted: 'הוגש',
  expired: 'פג תוקף',
};

/**
 * Get Hebrew label for any status value
 * Searches through all status dictionaries
 */
export function getStatusLabel(status: string): string {
  return (
    RISK_LEVEL_LABELS[status] ??
    APPOINTMENT_STATUS_LABELS[status] ??
    INVOICE_STATUS_LABELS[status] ??
    INVENTORY_STATUS_LABELS[status] ??
    DECLARATION_STATUS_LABELS[status] ??
    status
  );
}

/**
 * Get specific status label by category
 */
export function getRiskLevelLabel(level: string): string {
  return RISK_LEVEL_LABELS[level] ?? level;
}

export function getAppointmentStatusLabel(status: string): string {
  return APPOINTMENT_STATUS_LABELS[status] ?? status;
}

export function getInvoiceStatusLabel(status: string): string {
  return INVOICE_STATUS_LABELS[status] ?? status;
}

export function getInventoryStatusLabel(status: string): string {
  return INVENTORY_STATUS_LABELS[status] ?? status;
}

export function getDeclarationStatusLabel(status: string): string {
  return DECLARATION_STATUS_LABELS[status] ?? status;
}

/**
 * Get badge variant for status values
 */
export function getRiskLevelVariant(level: string): BadgeVariant {
  switch (level) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
}

export function getAppointmentStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'confirmed':
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
    case 'no-show':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export function getInvoiceStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'paid':
      return 'success';
    case 'pending':
      return 'warning';
    case 'overdue':
      return 'destructive';
    case 'refunded':
    case 'cancelled':
      return 'secondary';
    default:
      return 'default';
  }
}

export function getInventoryStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'ok':
      return 'success';
    case 'low':
      return 'warning';
    case 'critical':
      return 'destructive';
    default:
      return 'default';
  }
}
