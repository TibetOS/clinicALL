import { X, Trash2 } from 'lucide-react';
import { Button, Input, Label, Dialog } from '../../../components/ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { RiskLevel } from '../../../types';
import { PatientFormData, FilterState } from './patient-list-helpers';

// Add Patient Dialog
export type AddPatientDialogProps = {
  open: boolean;
  onClose: () => void;
  formData: PatientFormData;
  onFormChange: (data: PatientFormData) => void;
  onSubmit: () => void;
  saving: boolean;
};

export function AddPatientDialog({
  open,
  onClose,
  formData,
  onFormChange,
  onSubmit,
  saving,
}: AddPatientDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="הוספת מטופל חדש">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="patient-first-name">שם פרטי</Label>
            <Input
              id="patient-first-name"
              name="given-name"
              autoComplete="given-name"
              placeholder="ישראל"
              value={formData.firstName}
              onChange={(e) => onFormChange({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="patient-last-name">שם משפחה</Label>
            <Input
              id="patient-last-name"
              name="family-name"
              autoComplete="family-name"
              placeholder="ישראלי"
              value={formData.lastName}
              onChange={(e) => onFormChange({ ...formData, lastName: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="patient-phone">טלפון נייד</Label>
          <Input
            id="patient-phone"
            type="tel"
            name="tel"
            autoComplete="tel"
            placeholder="050-0000000"
            className="direction-ltr"
            value={formData.phone}
            onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="patient-email">אימייל</Label>
          <Input
            id="patient-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="email@example.com"
            className="direction-ltr"
            value={formData.email}
            onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="patient-birthdate">תאריך לידה</Label>
            <Input
              id="patient-birthdate"
              type="date"
              name="bday"
              autoComplete="bday"
              value={formData.birthDate}
              onChange={(e) => onFormChange({ ...formData, birthDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="patient-gender">מגדר</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => onFormChange({ ...formData, gender: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר מגדר" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="נקבה">נקבה</SelectItem>
                <SelectItem value="זכר">זכר</SelectItem>
                <SelectItem value="אחר">אחר</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            ביטול
          </Button>
          <Button
            onClick={onSubmit}
            disabled={saving || !formData.firstName || !formData.phone}
          >
            {saving ? 'שומר...' : 'צור כרטיס'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

// Filter Dialog
export type FilterDialogProps = {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  hasActiveFilters: boolean;
  resultCount: number;
};

export function FilterDialog({
  open,
  onClose,
  filters,
  onFiltersChange,
  hasActiveFilters,
  resultCount,
}: FilterDialogProps) {
  const initialFilters: FilterState = {
    riskLevel: 'all',
    lastVisitFrom: '',
    lastVisitTo: '',
    hasUpcomingAppointment: 'all',
  };

  return (
    <Dialog open={open} onClose={onClose} title="סינון מטופלים">
      <div className="space-y-4">
        <div>
          <Label htmlFor="filter-risk-level">רמת סיכון</Label>
          <Select
            value={filters.riskLevel}
            onValueChange={(value) => onFiltersChange({ ...filters, riskLevel: value as RiskLevel | 'all' })}
          >
            <SelectTrigger id="filter-risk-level">
              <SelectValue placeholder="בחר רמת סיכון" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              <SelectItem value="low">נמוך</SelectItem>
              <SelectItem value="medium">בינוני</SelectItem>
              <SelectItem value="high">גבוה</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="filter-upcoming-appointment">תור קרוב</Label>
          <Select
            value={filters.hasUpcomingAppointment}
            onValueChange={(value) => onFiltersChange({ ...filters, hasUpcomingAppointment: value as 'all' | 'yes' | 'no' })}
          >
            <SelectTrigger id="filter-upcoming-appointment">
              <SelectValue placeholder="בחר סטטוס תור" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              <SelectItem value="yes">יש תור קרוב</SelectItem>
              <SelectItem value="no">אין תור קרוב</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>טווח תאריכי ביקור אחרון</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <Label htmlFor="filter-visit-from" className="text-xs text-gray-500 font-normal">מתאריך</Label>
              <Input
                id="filter-visit-from"
                type="date"
                value={filters.lastVisitFrom}
                onChange={(e) => onFiltersChange({ ...filters, lastVisitFrom: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="filter-visit-to" className="text-xs text-gray-500 font-normal">עד תאריך</Label>
              <Input
                id="filter-visit-to"
                type="date"
                value={filters.lastVisitTo}
                onChange={(e) => onFiltersChange({ ...filters, lastVisitTo: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-3 pt-4 border-t mt-4">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => onFiltersChange(initialFilters)}
            disabled={!hasActiveFilters}
          >
            נקה סינון <X size={16} />
          </Button>
          <Button onClick={onClose}>
            החל סינון ({resultCount} תוצאות)
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

// Delete Confirmation Dialog
export type DeleteConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: () => void;
  isDeleting: boolean;
};

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
  isDeleting,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !isDeleting && onOpenChange(o)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 size={24} className="text-red-600" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">האם אתה בטוח?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            פעולה זו תמחק {selectedCount} מטופלים לצמיתות.
            <br />
            לא ניתן לבטל פעולה זו.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2 sm:justify-center">
          <AlertDialogCancel disabled={isDeleting}>ביטול</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? 'מוחק...' : `מחק ${selectedCount} מטופלים`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
