
import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, ChevronRight, ChevronLeft, 
  MapPin, Star, User, Check, CreditCard, ShieldCheck, Lock, Smartphone, X 
} from 'lucide-react';
import { Button, Card, Input, Badge } from '../components/ui';
import { MOCK_SERVICES } from '../data';
import { Service, BookingStep, StaffMember, TimeSlot } from '../types';

// Mock Data for Booking
const MOCK_STAFF: StaffMember[] = [
  { id: '1', name: 'ד״ר שרה כהן', role: 'רופאה', avatar: 'https://ui-avatars.com/api/?name=Sarah+Cohen&background=random' },
  { id: '2', name: 'רונית לוי', role: 'קוסמטיקאית', avatar: 'https://ui-avatars.com/api/?name=Ronit+Levi&background=random' }
];

const MOCK_SLOTS: TimeSlot[] = [
  { time: '09:00', available: true },
  { time: '09:30', available: true },
  { time: '10:00', available: false },
  { time: '10:30', available: true },
  { time: '11:00', available: true },
  { time: '11:30', available: true },
  { time: '13:00', available: true },
  { time: '14:00', available: false },
  { time: '15:30', available: true },
];

interface BookingAppProps {
  mode?: 'page' | 'modal';
  onClose?: () => void;
  preSelectedService?: Service | null;
  clinicName?: string;
}

export const BookingApp: React.FC<BookingAppProps> = ({ 
  mode = 'page', 
  onClose, 
  preSelectedService = null,
  clinicName = "ClinicALL Aesthetics"
}) => {
  const [step, setStep] = useState<BookingStep>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [authPhone, setAuthPhone] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [isAuthVerify, setIsAuthVerify] = useState(false);

  // If preSelectedService is passed, jump to staff selection immediately
  useEffect(() => {
    if (preSelectedService && step === 'service') {
      setSelectedService(preSelectedService);
      setStep('staff');
    }
  }, [preSelectedService]);

  // Helper to go back
  const goBack = () => {
    if (step === 'staff') {
       if (preSelectedService) {
         onClose?.(); 
       } else {
         setStep('service');
       }
    }
    if (step === 'datetime') setStep('staff');
    if (step === 'auth') setStep('datetime');
    if (step === 'checkout') setStep('auth');
  };

  const categories = Array.from(new Set(MOCK_SERVICES.map(s => s.category)));

  const containerClass = mode === 'page' 
    ? "min-h-screen bg-gray-50 flex justify-center py-8" 
    : "h-full bg-white flex flex-col";

  const wrapperClass = mode === 'page'
    ? "w-full max-w-md bg-white min-h-[800px] shadow-xl relative flex flex-col rounded-2xl overflow-hidden"
    : "flex-1 flex flex-col overflow-hidden";

  return (
    <div className={containerClass}>
      <div className={wrapperClass}>
        
        {/* Header (Except Success) */}
        {step !== 'success' && (
          <header className={`p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10 ${mode === 'modal' ? 'px-6 py-5' : ''}`}>
            <div className="flex items-center gap-2">
              {step !== 'service' && !(step === 'staff' && preSelectedService) ? (
                <button onClick={goBack} className="p-2 -mr-2 rounded-full hover:bg-gray-100">
                  <ChevronRight />
                </button>
              ) : (
                <div className="w-2" /> 
              )}
              <h1 className="font-bold text-lg">קביעת תור</h1>
            </div>

            {mode === 'modal' && onClose ? (
               <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 bg-gray-50">
                  <X size={20} />
               </button>
            ) : (
               <div className="w-10 text-center text-xs font-medium text-gray-500">
                  {step === 'service' && '1/5'}
                  {step === 'staff' && '2/5'}
                  {step === 'datetime' && '3/5'}
                  {step === 'auth' && '4/5'}
                  {step === 'checkout' && '5/5'}
               </div>
            )}
          </header>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
          
          {/* STEP 1: SELECT SERVICE */}
          {step === 'service' && (
            <div className="p-4 space-y-6 animate-in fade-in slide-in-from-right-4">
              {mode === 'page' && (
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-3">C</div>
                  <h2 className="font-bold text-xl text-gray-900">{clinicName}</h2>
                  <div className="flex items-center justify-center gap-1 text-gray-500 text-sm mt-1">
                    <MapPin size={14} /> תל אביב, שדרות רוטשילד 45
                  </div>
                  <div className="flex items-center justify-center gap-1 text-amber-500 text-sm mt-1">
                    <Star size={14} fill="currentColor" /> 4.9 (128 ביקורות)
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-bold text-lg mb-4">בחר טיפול</h3>
                {categories.map(cat => (
                  <div key={cat} className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-500 mb-3 sticky top-0 bg-white/95 p-2 backdrop-blur-sm rounded z-10 shadow-sm border">{cat}</h4>
                    <div className="space-y-3">
                      {MOCK_SERVICES.filter(s => s.category === cat).map(service => (
                        <div 
                          key={service.id}
                          onClick={() => {
                            setSelectedService(service);
                            setStep('staff');
                          }}
                          className="bg-white border rounded-xl p-4 flex justify-between items-center shadow-sm hover:border-primary hover:shadow-md transition-all cursor-pointer active:scale-95"
                        >
                          <div>
                            <div className="font-bold text-gray-900">{service.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{service.duration} דקות • <span className="text-primary font-medium">₪{service.price}</span></div>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <ChevronLeft size={16} className="text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT STAFF */}
          {step === 'staff' && (
            <div className="p-4 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold mb-6">בחר מטפל</h2>
              <div className="grid grid-cols-2 gap-4">
                <div 
                   onClick={() => { setSelectedStaff(null); setStep('datetime'); }}
                   className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all aspect-square"
                >
                   <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <CalendarIcon />
                   </div>
                   <span className="font-medium text-sm">התור הפנוי הראשון</span>
                </div>
                {MOCK_STAFF.map(staff => (
                  <div 
                    key={staff.id}
                    onClick={() => { setSelectedStaff(staff); setStep('datetime'); }}
                    className="border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:shadow-md transition-all aspect-square bg-white"
                  >
                    <img src={staff.avatar} className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-sm" />
                    <div className="text-center">
                      <div className="font-bold text-sm text-gray-900">{staff.name}</div>
                      <div className="text-xs text-gray-500">{staff.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: DATE & TIME */}
          {step === 'datetime' && (
            <div className="p-4 animate-in fade-in slide-in-from-right-4 h-full flex flex-col">
              <h2 className="text-xl font-bold mb-6">בחר מועד</h2>
              
              {/* Date Strip */}
              <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
                {Array.from({length: 14}).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() + i);
                  const isSelected = d.getDate() === selectedDate.getDate();
                  const isToday = i === 0;
                  
                  return (
                    <div 
                      key={i}
                      onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                      className={`
                        flex flex-col items-center justify-center min-w-[60px] h-[80px] rounded-xl border cursor-pointer transition-all
                        ${isSelected ? 'bg-primary text-white border-primary shadow-md transform scale-105' : 'bg-white border-gray-200 text-gray-600'}
                      `}
                    >
                      <span className="text-xs">{isToday ? 'היום' : d.toLocaleDateString('he-IL', {weekday: 'short'})}</span>
                      <span className="text-xl font-bold">{d.getDate()}</span>
                    </div>
                  )
                })}
              </div>

              {/* Time Slots */}
              <div className="flex-1">
                 <h3 className="font-medium text-gray-900 mb-3">שעות פנויות:</h3>
                 <div className="grid grid-cols-3 gap-3">
                    {MOCK_SLOTS.map((slot, idx) => (
                      <button
                        key={idx}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`
                           py-3 rounded-lg text-sm font-medium transition-all
                           ${!slot.available ? 'bg-gray-100 text-gray-300 cursor-not-allowed decoration-slice' : 
                             selectedTime === slot.time ? 'bg-primary text-white shadow-md ring-2 ring-primary ring-offset-2' : 'bg-white border border-gray-200 text-gray-700 hover:border-primary'}
                        `}
                      >
                         {slot.time}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="mt-6 sticky bottom-0 bg-white pt-4 border-t">
                 <Button 
                    className="w-full h-12 text-lg shadow-lg" 
                    disabled={!selectedTime}
                    onClick={() => setStep('auth')}
                 >
                    המשך <ChevronLeft className="mr-2" />
                 </Button>
              </div>
            </div>
          )}

          {/* STEP 4: AUTHENTICATION */}
          {step === 'auth' && (
             <div className="p-4 animate-in fade-in slide-in-from-right-4">
                <div className="text-center mb-8 mt-4">
                   <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Smartphone size={32} />
                   </div>
                   <h2 className="text-2xl font-bold text-gray-900">הזדהות</h2>
                   <p className="text-gray-500 text-sm mt-1">אנו שולחים קוד אימות לנייד שלך</p>
                </div>

                {!isAuthVerify ? (
                   <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-sm font-medium">מספר נייד</label>
                         <Input 
                            value={authPhone} 
                            onChange={(e) => setAuthPhone(e.target.value)}
                            className="text-center text-lg tracking-widest h-12 direction-ltr" 
                            placeholder="050-000-0000"
                            autoFocus
                         />
                      </div>
                      <Button className="w-full h-12" onClick={() => setIsAuthVerify(true)} disabled={authPhone.length < 9}>
                         שלח קוד ב-SMS
                      </Button>
                   </div>
                ) : (
                   <div className="space-y-4 animate-in fade-in">
                      <div className="space-y-2">
                         <label className="text-sm font-medium">קוד אימות</label>
                         <Input 
                            value={authCode} 
                            onChange={(e) => setAuthCode(e.target.value)}
                            className="text-center text-2xl tracking-[1em] h-14" 
                            placeholder="____"
                            maxLength={4}
                            autoFocus
                         />
                      </div>
                      <Button className="w-full h-12" onClick={() => setStep('checkout')} disabled={authCode.length < 4}>
                         אמת והמשך
                      </Button>
                      <button onClick={() => setIsAuthVerify(false)} className="w-full text-center text-sm text-gray-500 mt-4 underline">
                         שינוי מספר טלפון
                      </button>
                   </div>
                )}
             </div>
          )}

          {/* STEP 5: CHECKOUT */}
          {step === 'checkout' && selectedService && (
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
                         <span className="font-medium">{selectedDate.toLocaleDateString('he-IL')} בשעה {selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-gray-500">מטפל</span>
                         <span className="font-medium">{selectedStaff?.name || 'התור הפנוי הראשון'}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                         <span className="font-bold text-gray-900">סה״כ לתשלום</span>
                         <span className="font-bold text-primary text-lg">₪{selectedService.price}</span>
                      </div>
                   </div>
                </Card>

                <div className="space-y-4 mb-8">
                   <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      <CreditCard size={16} /> פרטי אשראי לביטחון
                   </h3>
                   <div className="bg-white border rounded-xl p-4 space-y-4">
                      <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded mb-2">
                         <Lock size={12} />
                         תשלום מאובטח בתקן PCI DSS. לא יבוצע חיוב כעת.
                      </div>
                      <Input placeholder="מספר כרטיס" className="h-12 text-left direction-ltr" />
                      <div className="grid grid-cols-2 gap-4">
                         <Input placeholder="MM/YY" className="h-12 text-center direction-ltr" />
                         <Input placeholder="CVC" className="h-12 text-center direction-ltr" />
                      </div>
                   </div>
                </div>

                <div className="space-y-2 text-xs text-gray-500">
                   <label className="flex items-start gap-2">
                      <input type="checkbox" className="mt-0.5 accent-primary" defaultChecked />
                      <span>אני מאשר/ת את מדיניות הביטולים של הקליניקה. ביטול עד 24 שעות לפני המועד ללא חיוב.</span>
                   </label>
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-20">
                   <div className="max-w-md mx-auto">
                      <Button className="w-full h-12 text-lg shadow-lg" onClick={() => setStep('success')}>
                         שריין תור בקליק <ShieldCheck size={18} className="mr-2" />
                      </Button>
                   </div>
                </div>
             </div>
          )}

          {/* SUCCESS SCREEN */}
          {step === 'success' && (
             <div className="h-full bg-primary flex flex-col items-center justify-center text-white p-6 text-center animate-in fade-in zoom-in-95">
                <div className="w-24 h-24 bg-white text-primary rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce">
                   <Check size={48} strokeWidth={4} />
                </div>
                <h1 className="text-3xl font-bold mb-2">התור נקבע בהצלחה!</h1>
                <p className="text-primary-100 mb-8 max-w-xs">שלחנו לך אישור הזמנה ופרטים נוספים לנייד.</p>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full max-w-sm border border-white/20 mb-8">
                   <p className="text-sm opacity-80 mb-1">מתי?</p>
                   <p className="font-bold text-xl mb-4">{selectedDate.toLocaleDateString('he-IL')} בשעה {selectedTime}</p>
                   <p className="text-sm opacity-80 mb-1">מה?</p>
                   <p className="font-bold text-xl">{selectedService?.name}</p>
                </div>

                <div className="space-y-3 w-full max-w-xs">
                   <Button className="w-full bg-white text-primary hover:bg-gray-100 h-12 shadow-lg">
                      הוסף ליומן
                   </Button>
                   <Button variant="ghost" className="w-full text-white hover:bg-white/10" onClick={() => onClose ? onClose() : window.location.reload()}>
                      חזרה
                   </Button>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
