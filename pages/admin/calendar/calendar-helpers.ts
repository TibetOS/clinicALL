import { FileCheck, Clock, AlertCircle } from 'lucide-react';
import { AppointmentDeclarationStatus } from '../../../types';

export type DeclarationIndicator = {
  color: string;
  title: string;
  Icon: typeof FileCheck | typeof Clock | typeof AlertCircle;
};

export const getDeclarationIndicator = (
  status?: AppointmentDeclarationStatus
): DeclarationIndicator | null => {
  switch (status) {
    case 'received':
      return { color: 'bg-green-500', title: 'הצהרה התקבלה', Icon: FileCheck };
    case 'pending':
      return { color: 'bg-yellow-500', title: 'ממתין להצהרה', Icon: Clock };
    case 'required':
      return { color: 'bg-red-500', title: 'נדרשת הצהרה', Icon: AlertCircle };
    case 'not_required':
    default:
      return null;
  }
};
