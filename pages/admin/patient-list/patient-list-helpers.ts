import { FileCheck, Clock, AlertCircle, FileHeart, LucideIcon } from 'lucide-react';
import { DeclarationStatus, Patient, RiskLevel } from '../../../types';
import { getRiskLevelLabel } from '../../../lib/status-helpers';
import { exportToCSV } from '../../../lib/csv-export';

// Declaration status configuration
type DeclarationStatusConfig = {
  label: string;
  variant: 'success' | 'warning' | 'destructive' | 'outline';
  icon: LucideIcon;
};

export const getDeclarationStatusConfig = (status?: DeclarationStatus): DeclarationStatusConfig => {
  switch (status) {
    case 'valid':
      return { label: 'תקין', variant: 'success', icon: FileCheck };
    case 'pending':
      return { label: 'ממתין', variant: 'warning', icon: Clock };
    case 'expired':
      return { label: 'פג תוקף', variant: 'destructive', icon: AlertCircle };
    case 'none':
    default:
      return { label: 'חסר', variant: 'outline', icon: FileHeart };
  }
};

// Patient CSV export helper
export const exportPatientsToCsv = (patients: Patient[], filename: string) => {
  const headers = ['שם', 'טלפון', 'אימייל', 'ביקור אחרון', 'תור קרוב', 'רמת סיכון', 'תאריך הצטרפות'];
  const rows = patients.map(p => [
    p.name,
    p.phone,
    p.email,
    p.lastVisit ? new Date(p.lastVisit).toLocaleDateString('he-IL') : '',
    p.upcomingAppointment ? new Date(p.upcomingAppointment).toLocaleDateString('he-IL') : '',
    getRiskLevelLabel(p.riskLevel),
    p.memberSince ? new Date(p.memberSince).toLocaleDateString('he-IL') : '',
  ]);
  exportToCSV(headers, rows, { filename });
};

// Form interfaces
export type PatientFormData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: string;
};

export const INITIAL_PATIENT_FORM: PatientFormData = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  birthDate: '',
  gender: 'נקבה',
};

export type FilterState = {
  riskLevel: RiskLevel | 'all';
  lastVisitFrom: string;
  lastVisitTo: string;
  hasUpcomingAppointment: 'all' | 'yes' | 'no';
};

export const INITIAL_FILTERS: FilterState = {
  riskLevel: 'all',
  lastVisitFrom: '',
  lastVisitTo: '',
  hasUpcomingAppointment: 'all',
};

export type HealthDeclarationFormData = {
  patientId?: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
};

export const INITIAL_HEALTH_FORM: HealthDeclarationFormData = {
  patientId: undefined,
  patientName: '',
  patientPhone: '',
  patientEmail: '',
};
