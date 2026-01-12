import { Calendar as CalendarIcon, ShieldCheck, Check, Loader2 } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import { Service, StaffMember } from '../../types';

export type CheckoutSummaryProps = {
  selectedService: Service;
  selectedStaff: StaffMember | null;
  selectedDate: Date;
  selectedTime: string;
  customerName: string;
  authPhone: string;
  bookingError: string | null;
  isBooking: boolean;
  onConfirm: () => void;
};

export function CheckoutSummary({
  selectedService,
  selectedStaff,
  selectedDate,
  selectedTime,
  customerName,
  authPhone,
  bookingError,
  isBooking,
  onConfirm,
}: CheckoutSummaryProps) {
  return (
    <div className="p-4 animate-in fade-in slide-in-from-right-4 pb-24">
      <h2 className="text-xl font-bold mb-6">סיכום ואישור</h2>

      <Card className="p-4 mb-6 bg-gray-50 border-gray-200">
        <div className="flex gap-4 border-b border-gray-200 pb-4 mb-4">
          <div className="h-16 w-16 bg-white rounded-lg border flex items-center justify-center shadow-sm">
            <CalendarIcon className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{selectedService.name}</h3>
            <p className="text-sm text-gray-500">{selectedService.duration} דקות</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">תאריך ושעה</span>
            <span className="font-medium">
              {selectedDate.toLocaleDateString('he-IL')} בשעה {selectedTime}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">מטפל</span>
            <span className="font-medium">{selectedStaff?.name || 'התור הפנוי הראשון'}</span>
          </div>
          {customerName && (
            <div className="flex justify-between">
              <span className="text-gray-500">שם</span>
              <span className="font-medium">{customerName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">טלפון</span>
            <span className="font-medium">{authPhone}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
            <span className="font-bold text-gray-900">מחיר הטיפול</span>
            <span className="font-bold text-primary text-lg">₪{selectedService.price}</span>
          </div>
        </div>
      </Card>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="text-blue-600 mt-0.5" size={20} />
          <div>
            <h4 className="font-medium text-blue-900 text-sm">הזמנה ללא תשלום מראש</h4>
            <p className="text-blue-700 text-xs mt-1">התשלום יתבצע בקליניקה לאחר הטיפול</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-xs text-gray-500 mb-6">
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-0.5 accent-primary" defaultChecked />
          <span>אני מאשר/ת את מדיניות הביטולים של הקליניקה. ביטול עד 24 שעות לפני המועד ללא חיוב.</span>
        </label>
      </div>

      {bookingError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
          {bookingError}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-md mx-auto">
          <Button className="w-full h-12 text-lg shadow-lg" onClick={onConfirm} disabled={isBooking}>
            {isBooking ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                שומר...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                אישור הזמנה <Check size={18} />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
