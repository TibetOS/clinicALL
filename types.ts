

export type Role = 'admin' | 'client' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  clinicId?: string;
}

// New Profile Type for the Public Landing Page
export interface ClinicProfile {
  id: string;
  name: string;
  slug: string; // e.g., 'dr-sarah'
  businessId?: string; // Israeli ID (T.Z.) or Company ID (H.P.)
  tagline: string;
  description: string;
  logoUrl?: string;
  coverUrl?: string; // Hero image
  brandColor: string; // Hex code
  address: string;
  googleMapsUrl?: string;
  phone: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  openingHours: {
    [key: string]: string; // "Sunday": "09:00-18:00"
  };
  services: string[]; // IDs of highlighted services
}

export type RiskLevel = 'low' | 'medium' | 'high';
export type DeclarationStatus = 'valid' | 'expired' | 'pending' | 'none';

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  riskLevel: RiskLevel;
  lastVisit: string;
  upcomingAppointment?: string;
  memberSince: string;
  birthDate?: string; // ISO date string (YYYY-MM-DD)
  age?: number;
  gender?: string;
  aestheticInterests?: string[];
  skinType?: string;
  // Health Declaration fields
  lastDeclarationDate?: string; // ISO date when last signed
  declarationStatus?: DeclarationStatus; // Current status
  pendingDeclarationToken?: string; // Token if declaration is pending
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
export type AppointmentDeclarationStatus = 'required' | 'pending' | 'received' | 'not_required';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  serviceId: string;
  serviceName: string;
  date: string; // ISO date string
  time: string;
  duration: number; // minutes
  status: AppointmentStatus;
  notes?: string;
  // Health Declaration tracking for appointments
  declarationStatus?: AppointmentDeclarationStatus;
  declarationTokenId?: string; // Reference to the token sent for this appointment
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  category: string;
  image?: string;
}

export interface Declaration {
  id: string;
  patientId: string;
  patientName: string;
  submittedAt: string; // ISO Date
  status: 'reviewed' | 'pending' | 'signed';
  formData: {
    personalInfo: {
      firstName: string;
      lastName: string;
      phone: string;
      gender: string;
    };
    medicalHistory: {
      conditions: string[];
      medications: string;
    };
    signature: string; // Base64 or simple boolean for mock
  }
}

/** Icon component type for use in Stat interface */
export type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

export interface Stat {
  label: string;
  value: string | number;
  change?: number;
  icon: IconComponent;
  trend?: 'up' | 'down' | 'neutral';
}

// New Types for Clinical Module
export interface InjectionPoint {
  id: string;
  x: number;
  y: number;
  product?: string;
  units?: number;
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  date: string;
  providerName: string;
  treatmentType: string;
  notes: string;
  injectionPoints: InjectionPoint[];
  images?: string[];
}

// -- NEW TYPES --

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  expiryDate: string;
  supplier: string;
  status: 'ok' | 'low' | 'critical';
}

export type NotificationAction = 'send_declaration' | 'view_appointment' | 'view_patient' | 'none';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
  // Actionable notification support
  action?: NotificationAction;
  metadata?: {
    appointmentId?: string;
    patientId?: string;
    patientName?: string;
    patientPhone?: string;
    patientEmail?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    serviceName?: string;
  };
}

// Booking App Types
export type BookingStep = 'service' | 'staff' | 'datetime' | 'auth' | 'checkout' | 'success';

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

// Leads
export type LeadStage = 'new' | 'contacted' | 'consultation' | 'won';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: string;
  stage: LeadStage;
  notes?: string;
  value?: number;
  createdAt: string; // ISO Date
}

// Finance
export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId?: string;
  patientName: string;
  date: string; // ISO Date
  items: InvoiceItem[];
  total: number;
  status: 'paid' | 'pending' | 'overdue' | 'refunded';
}

// Marketing
export interface Campaign {
  id: string;
  name: string;
  type: 'sms' | 'whatsapp' | 'email';
  status: 'active' | 'completed' | 'scheduled' | 'draft';
  audience: string;
  sentCount: number;
  openRate?: number;
  scheduledDate?: string;
}

// Health Declaration Token for secure form access
export interface HealthDeclarationToken {
  id: string;
  token: string; // Unique URL-safe token
  clinicId: string;
  patientId?: string; // Optional - for existing patients
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
  createdAt: string; // ISO Date
  expiresAt: string; // ISO Date
  status: 'active' | 'used' | 'expired';
  usedAt?: string; // ISO Date - when the form was submitted
}

// Activity Log for healthcare compliance audit trail
export type ActivityAction = 'view' | 'create' | 'update' | 'delete' | 'export' | 'login' | 'logout' | 'send_declaration';
export type ActivityResourceType =
  | 'patient'
  | 'appointment'
  | 'clinical_note'
  | 'declaration'
  | 'invoice'
  | 'health_token'
  | 'service'
  | 'inventory'
  | 'settings'
  | 'user';

export interface ActivityLog {
  id: string;
  clinicId: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: ActivityAction;
  resourceType: ActivityResourceType;
  resourceId?: string;
  resourceName?: string; // Human-readable name for display
  details?: Record<string, unknown>; // Additional context
  ipAddress?: string;
  userAgent?: string;
  createdAt: string; // ISO Date
}