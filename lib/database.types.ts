/**
 * Database row types for Supabase tables
 * These types represent the snake_case column names used in the database
 */

import { RiskLevel, AppointmentStatus, AppointmentDeclarationStatus, DeclarationStatus, LeadStage } from '../types';

// Helper type for extracting error messages safely
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unknown error occurred';
}

// Patient table row
export interface PatientRow {
  id: string;
  clinic_id: string;
  name: string;
  email: string | null;
  phone: string;
  avatar_url: string | null;
  risk_level: RiskLevel | null;
  last_visit: string | null;
  upcoming_appointment: string | null;
  member_since: string | null;
  birth_date: string | null;
  age: number | null;
  gender: string | null;
  aesthetic_interests: string[] | null;
  skin_type: string | null;
  // Health declaration fields
  last_declaration_date: string | null;
  declaration_status: DeclarationStatus | null;
  pending_declaration_token: string | null;
  created_at: string;
  updated_at: string;
}

// Appointment table row
export interface AppointmentRow {
  id: string;
  clinic_id: string;
  patient_id: string;
  patient_name: string;
  service_id: string;
  service_name: string;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  notes: string | null;
  declaration_status: AppointmentDeclarationStatus | null;
  declaration_token_id: string | null;
  created_at: string;
  updated_at: string;
}

// Service table row
export interface ServiceRow {
  id: string;
  clinic_id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Declaration table row
export interface DeclarationRow {
  id: string;
  clinic_id: string;
  patient_id: string;
  patient_name: string;
  submitted_at: string;
  status: 'reviewed' | 'pending' | 'signed';
  form_data: {
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
    signature: string;
  };
}

// Clinical note table row
export interface ClinicalNoteRow {
  id: string;
  clinic_id: string;
  patient_id: string;
  date: string;
  provider_name: string;
  treatment_type: string;
  notes: string;
  injection_points: Array<{
    id: string;
    x: number;
    y: number;
    product?: string;
    units?: number;
  }>;
  images: string[] | null;
  created_at: string;
  updated_at: string;
}

// Inventory item table row
export interface InventoryItemRow {
  id: string;
  clinic_id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit: string;
  expiry_date: string;
  supplier: string;
  status: 'ok' | 'low' | 'critical';
  created_at: string;
  updated_at: string;
}

// Lead table row
export interface LeadRow {
  id: string;
  clinic_id: string;
  name: string;
  phone: string;
  email: string | null;
  source: string;
  stage: LeadStage;
  notes: string | null;
  value: number | null;
  created_at: string;
  updated_at: string;
}

// Invoice table row
export interface InvoiceRow {
  id: string;
  clinic_id: string;
  invoice_number: string;
  patient_id: string | null;
  patient_name: string;
  date: string;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'paid' | 'pending' | 'overdue' | 'refunded';
  created_at: string;
  updated_at: string;
}

// Campaign table row
export interface CampaignRow {
  id: string;
  clinic_id: string;
  name: string;
  type: 'sms' | 'whatsapp' | 'email';
  status: 'active' | 'completed' | 'scheduled' | 'draft';
  audience: string;
  sent_count: number;
  open_rate: number | null;
  scheduled_date: string | null;
  created_at: string;
  updated_at: string;
}

// Notification table row
export interface NotificationRow {
  id: string;
  clinic_id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  action: 'send_declaration' | 'view_appointment' | 'view_patient' | 'none' | null;
  metadata: {
    appointmentId?: string;
    patientId?: string;
    patientName?: string;
    patientPhone?: string;
    patientEmail?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    serviceName?: string;
  } | null;
  created_at: string;
}

// Health declaration token table row
export interface HealthTokenRow {
  id: string;
  token: string;
  clinic_id: string;
  patient_id: string | null;
  patient_name: string | null;
  patient_phone: string | null;
  patient_email: string | null;
  created_at: string;
  expires_at: string;
  status: 'active' | 'used' | 'expired';
  used_at: string | null;
}

// User/Staff table row
export interface UserRow {
  id: string;
  clinic_id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'admin' | 'client';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Partial update types for database updates
export interface PatientRowUpdate {
  name?: string;
  email?: string | null;
  phone?: string;
  risk_level?: RiskLevel;
  birth_date?: string | null;
  age?: number | null;
  gender?: string | null;
  aesthetic_interests?: string[] | null;
  skin_type?: string | null;
  // Health declaration fields
  last_declaration_date?: string | null;
  declaration_status?: DeclarationStatus | null;
  pending_declaration_token?: string | null;
}

export interface AppointmentRowUpdate {
  patient_id?: string;
  patient_name?: string;
  service_id?: string;
  service_name?: string;
  date?: string;
  time?: string;
  duration?: number;
  status?: AppointmentStatus;
  notes?: string | null;
  declaration_status?: AppointmentDeclarationStatus | null;
}

export interface ServiceRowUpdate {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  category?: string;
  image?: string | null;
  is_active?: boolean;
}

export interface InventoryItemRowUpdate {
  name?: string;
  sku?: string;
  category?: string;
  quantity?: number;
  min_quantity?: number;
  unit?: string;
  expiry_date?: string;
  supplier?: string;
  status?: 'ok' | 'low' | 'critical';
}

export interface LeadRowUpdate {
  name?: string;
  phone?: string;
  email?: string | null;
  source?: string;
  stage?: LeadStage;
  notes?: string | null;
  value?: number | null;
}

export interface InvoiceRowUpdate {
  invoice_number?: string;
  patient_id?: string | null;
  patient_name?: string;
  date?: string;
  items?: Array<{ description: string; quantity: number; price: number }>;
  total?: number;
  status?: 'paid' | 'pending' | 'overdue' | 'refunded';
}

export interface CampaignRowUpdate {
  name?: string;
  type?: 'sms' | 'whatsapp' | 'email';
  status?: 'active' | 'completed' | 'scheduled' | 'draft';
  audience?: string;
  sent_count?: number;
  open_rate?: number | null;
  scheduled_date?: string | null;
}

export interface DeclarationRowUpdate {
  patient_id?: string;
  patient_name?: string;
  status?: 'reviewed' | 'pending' | 'signed';
  form_data?: DeclarationRow['form_data'];
}

export interface ClinicalNoteRowUpdate {
  patient_id?: string;
  date?: string;
  provider_name?: string;
  treatment_type?: string;
  notes?: string;
  injection_points?: ClinicalNoteRow['injection_points'];
  images?: string[] | null;
}
