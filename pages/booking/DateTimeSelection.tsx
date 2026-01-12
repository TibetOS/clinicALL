import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui';
import { TimeSlot } from '../../types';

export type DateTimeSelectionProps = {
  selectedDate: Date;
  selectedTime: string | null;
  availableSlots: TimeSlot[];
  loading: boolean;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
  onContinue: () => void;
};

export function DateTimeSelection({
  selectedDate,
  selectedTime,
  availableSlots,
  loading,
  onDateChange,
  onTimeChange,
  onContinue,
}: DateTimeSelectionProps) {
  return (
    <div className="p-4 animate-in fade-in slide-in-from-right-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-6">בחר מועד</h2>

      {/* Date Strip */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
        {Array.from({ length: 14 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i);
          const isSelected = d.getDate() === selectedDate.getDate();
          const isToday = i === 0;

          return (
            <div
              key={i}
              onClick={() => onDateChange(d)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onDateChange(d)}
              className={`
                flex flex-col items-center justify-center min-w-[60px] h-[80px] rounded-xl border cursor-pointer transition-all
                ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-md transform scale-105'
                    : 'bg-white border-gray-200 text-gray-600'
                }
              `}
            >
              <span className="text-xs">
                {isToday ? 'היום' : d.toLocaleDateString('he-IL', { weekday: 'short' })}
              </span>
              <span className="text-xl font-bold">{d.getDate()}</span>
            </div>
          );
        })}
      </div>

      {/* Time Slots */}
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 mb-3">שעות פנויות:</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">אין שעות פנויות בתאריך זה</div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {availableSlots.map((slot, idx) => (
              <button
                key={idx}
                disabled={!slot.available}
                onClick={() => onTimeChange(slot.time)}
                className={`
                  py-3 rounded-lg text-sm font-medium transition-all
                  ${
                    !slot.available
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed decoration-slice'
                      : selectedTime === slot.time
                        ? 'bg-primary text-white shadow-md ring-2 ring-primary ring-offset-2'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-primary'
                  }
                `}
              >
                {slot.time}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 sticky bottom-0 bg-white pt-4 border-t">
        <Button className="w-full h-12 text-lg shadow-lg" disabled={!selectedTime} onClick={onContinue}>
          <span className="flex items-center justify-center gap-2">
            המשך <ChevronLeft size={18} />
          </span>
        </Button>
      </div>
    </div>
  );
}
