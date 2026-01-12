import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { StaffMember } from '../../types';

export type StaffSelectionProps = {
  staff: StaffMember[];
  loading: boolean;
  onSelect: (staffMember: StaffMember | null) => void;
};

export function StaffSelection({ staff, loading, onSelect }: StaffSelectionProps) {
  return (
    <div className="p-4 animate-in fade-in slide-in-from-right-4">
      <h2 className="text-xl font-bold mb-6">בחר מטפל</h2>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => onSelect(null)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(null)}
            className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all aspect-square"
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CalendarIcon />
            </div>
            <span className="font-medium text-sm">התור הפנוי הראשון</span>
          </div>
          {staff.map((staffMember) => (
            <div
              key={staffMember.id}
              onClick={() => onSelect(staffMember)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(staffMember)}
              className="border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:shadow-md transition-all aspect-square bg-white"
            >
              <img
                src={staffMember.avatar}
                alt={`תמונת פרופיל של ${staffMember.name}`}
                loading="lazy"
                className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div className="text-center">
                <div className="font-bold text-sm text-gray-900">{staffMember.name}</div>
                <div className="text-xs text-gray-500">{staffMember.role}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
