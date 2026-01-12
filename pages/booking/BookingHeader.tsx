import { ChevronRight, X } from 'lucide-react';
import { BookingStep } from '../../types';

export type BookingHeaderProps = {
  step: BookingStep;
  mode: 'page' | 'modal';
  hasPreSelectedService: boolean;
  onBack: () => void;
  onClose?: () => void;
};

export function BookingHeader({
  step,
  mode,
  hasPreSelectedService,
  onBack,
  onClose,
}: BookingHeaderProps) {
  const showBackButton = step !== 'service' && !(step === 'staff' && hasPreSelectedService);

  const stepIndicators: Record<BookingStep, string> = {
    service: '1/5',
    staff: '2/5',
    datetime: '3/5',
    auth: '4/5',
    checkout: '5/5',
    success: '',
  };
  const stepIndicator = stepIndicators[step];

  return (
    <header
      className={`p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10 ${
        mode === 'modal' ? 'px-6 py-5' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        {showBackButton ? (
          <button
            onClick={onBack}
            className="p-2 -mr-2 rounded-full hover:bg-gray-100"
            aria-label="חזור"
          >
            <ChevronRight />
          </button>
        ) : (
          <div className="w-2" />
        )}
        <h1 className="font-bold text-lg">קביעת תור</h1>
      </div>

      {mode === 'modal' && onClose ? (
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 bg-gray-50"
          aria-label="סגור"
        >
          <X size={20} />
        </button>
      ) : (
        <div className="w-10 text-center text-xs font-medium text-gray-500">
          {stepIndicator}
        </div>
      )}
    </header>
  );
}
