import { Check } from 'lucide-react';
import { Button } from '../../components/ui';
import { Service } from '../../types';

export type SuccessScreenProps = {
  selectedDate: Date;
  selectedTime: string | null;
  selectedService: Service | null;
  onClose?: () => void;
};

export function SuccessScreen({
  selectedDate,
  selectedTime,
  selectedService,
  onClose,
}: SuccessScreenProps) {
  const handleReturn = () => {
    if (onClose) {
      onClose();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="h-full bg-primary flex flex-col items-center justify-center text-white p-6 text-center animate-in fade-in zoom-in-95">
      <div className="w-24 h-24 bg-white text-primary rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce">
        <Check size={48} strokeWidth={4} />
      </div>
      <h1 className="text-3xl font-bold mb-2">התור נקבע בהצלחה!</h1>
      <p className="text-primary-100 mb-8 max-w-xs">שלחנו לך אישור הזמנה ופרטים נוספים לנייד.</p>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full max-w-sm border border-white/20 mb-8">
        <p className="text-sm opacity-80 mb-1">מתי?</p>
        <p className="font-bold text-xl mb-4">
          {selectedDate.toLocaleDateString('he-IL')} בשעה {selectedTime}
        </p>
        <p className="text-sm opacity-80 mb-1">מה?</p>
        <p className="font-bold text-xl">{selectedService?.name}</p>
      </div>

      <div className="space-y-3 w-full max-w-xs">
        <Button className="w-full bg-white text-primary hover:bg-gray-100 h-12 shadow-lg">
          הוסף ליומן
        </Button>
        <Button variant="ghost" className="w-full text-white hover:bg-white/10" onClick={handleReturn}>
          חזרה
        </Button>
      </div>
    </div>
  );
}
