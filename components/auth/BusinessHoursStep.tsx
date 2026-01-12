import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Input, Switch, cn } from '../ui';
import type { SignupStepProps, DaySchedule } from './types';

export const BusinessHoursStep = ({
  formData,
  fieldErrors,
  onChange,
  onNext,
  onBack,
}: SignupStepProps) => {
  const operatingHours = formData.operatingHours;

  const handleDayChange = (
    dayIndex: number,
    field: keyof DaySchedule,
    value: string | boolean
  ) => {
    const updated = operatingHours.map((day, idx) =>
      idx === dayIndex ? { ...day, [field]: value } : day
    );
    onChange('operatingHours', updated);
  };

  const activeDaysCount = operatingHours.filter((d) => d.isOpen).length;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">מתי אפשר לקבוע לך תורים?</h2>
        <p className="text-gray-500 mt-2 text-sm">
          אפשר לשנות את שעות הפעילות גם בהמשך, הפסקות ניתן להגדיר בקלות ביומן.
        </p>
      </div>

      {fieldErrors.operatingHours && (
        <p className="text-red-500 text-sm text-center">{fieldErrors.operatingHours}</p>
      )}

      <div className="space-y-3">
        {/* Header row */}
        <div className="grid grid-cols-[60px_1fr_1fr_50px] gap-2 text-xs text-gray-500 font-medium px-1">
          <div>יום</div>
          <div>התחלה</div>
          <div>סיום</div>
          <div className="text-center">פתוח</div>
        </div>

        {operatingHours.map((day, idx) => (
          <div
            key={day.day}
            className={cn(
              'grid grid-cols-[60px_1fr_1fr_50px] gap-2 items-center p-2 rounded-lg border transition-all',
              day.isOpen ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
            )}
          >
            <div className={cn('font-medium', day.isOpen ? 'text-gray-900' : 'text-gray-400')}>
              {day.dayLabel}
            </div>

            <Input
              type="time"
              value={day.startTime}
              onChange={(e) => handleDayChange(idx, 'startTime', e.target.value)}
              disabled={!day.isOpen}
              className={cn(
                'h-9 text-sm',
                !day.isOpen && 'opacity-50 cursor-not-allowed'
              )}
              dir="ltr"
            />

            <Input
              type="time"
              value={day.endTime}
              onChange={(e) => handleDayChange(idx, 'endTime', e.target.value)}
              disabled={!day.isOpen}
              className={cn(
                'h-9 text-sm',
                !day.isOpen && 'opacity-50 cursor-not-allowed'
              )}
              dir="ltr"
            />

            <div className="flex justify-center">
              <Switch
                checked={day.isOpen}
                onCheckedChange={(checked) => handleDayChange(idx, 'isOpen', checked)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        {activeDaysCount} ימים פעילים
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12"
        >
          <span className="flex items-center justify-center gap-2">
            <ChevronRight size={20} /> חזרה
          </span>
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 h-12"
        >
          <span className="flex items-center justify-center gap-2">
            המשך <ChevronLeft size={20} />
          </span>
        </Button>
      </div>
    </div>
  );
};
