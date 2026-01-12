import { useState, useEffect } from 'react';
import { Service, BookingStep, StaffMember, TimeSlot } from '../types';
import { useServices, useStaff, useBooking } from '../hooks';
import { isValidIsraeliPhone } from '../lib/validation';
import { BookingHeader } from './booking/BookingHeader';
import { ServiceSelection } from './booking/ServiceSelection';
import { StaffSelection } from './booking/StaffSelection';
import { DateTimeSelection } from './booking/DateTimeSelection';
import { AuthenticationForm } from './booking/AuthenticationForm';
import { CheckoutSummary } from './booking/CheckoutSummary';
import { SuccessScreen } from './booking/SuccessScreen';

type BookingAppProps = {
  mode?: 'page' | 'modal';
  onClose?: () => void;
  preSelectedService?: Service | null;
  clinicName?: string;
  clinicId?: string;
};

export const BookingApp: React.FC<BookingAppProps> = ({
  mode = 'page',
  onClose,
  preSelectedService = null,
  clinicName = 'ClinicALL Aesthetics',
  clinicId = '11111111-1111-1111-1111-111111111111',
}) => {
  const [step, setStep] = useState<BookingStep>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [authPhone, setAuthPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [phoneValidationError, setPhoneValidationError] = useState<string | null>(null);

  // Fetch data from hooks
  const { services, loading: servicesLoading } = useServices();
  const { staff, loading: staffLoading } = useStaff(clinicId);
  const { getAvailableSlots, createBooking } = useBooking();

  // If preSelectedService is passed, jump to staff selection immediately
  useEffect(() => {
    if (preSelectedService && step === 'service') {
      setSelectedService(preSelectedService);
      setStep('staff');
    }
  }, [preSelectedService, step]);

  // Fetch available slots when date or service changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedService || step !== 'datetime') return;

      setSlotsLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0] ?? '';
      const slots = await getAvailableSlots(
        dateStr,
        selectedService.duration,
        selectedStaff?.id,
        clinicId
      );
      setAvailableSlots(slots);
      setSlotsLoading(false);
    };

    fetchSlots();
  }, [selectedDate, selectedService, selectedStaff, step, clinicId, getAvailableSlots]);

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

  // Handle service selection
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep('staff');
  };

  // Handle staff selection
  const handleStaffSelect = (staffMember: StaffMember | null) => {
    setSelectedStaff(staffMember);
    setStep('datetime');
  };

  // Handle date change
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  // Handle phone change
  const handlePhoneChange = (phone: string) => {
    setAuthPhone(phone);
    setPhoneValidationError(null);
  };

  // Handle auth continue
  const handleAuthContinue = () => {
    if (!isValidIsraeliPhone(authPhone)) {
      setPhoneValidationError('מספר טלפון לא תקין');
      return;
    }
    setStep('checkout');
  };

  // Handle booking submission
  const handleBookingSubmit = async () => {
    if (!selectedService || !selectedTime) return;

    setIsBooking(true);
    setBookingError(null);

    const result = await createBooking({
      clinicId,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      serviceDuration: selectedService.duration,
      staffId: selectedStaff?.id,
      staffName: selectedStaff?.name,
      date: selectedDate.toISOString().split('T')[0] ?? '',
      time: selectedTime,
      customerPhone: authPhone,
      customerName: customerName || undefined,
      notes: `הזמנה מקוונת`,
    });

    setIsBooking(false);

    if (result.success) {
      setStep('success');
    } else {
      setBookingError(result.error || 'שגיאה ביצירת ההזמנה');
    }
  };

  const containerClass =
    mode === 'page'
      ? 'min-h-screen bg-gray-50 flex justify-center py-8'
      : 'h-full bg-white flex flex-col';

  const wrapperClass =
    mode === 'page'
      ? 'w-full max-w-md bg-white min-h-[800px] shadow-xl relative flex flex-col rounded-2xl overflow-hidden'
      : 'flex-1 flex flex-col overflow-hidden';

  return (
    <div className={containerClass}>
      <div className={wrapperClass}>
        {/* Header (Except Success) */}
        {step !== 'success' && (
          <BookingHeader
            step={step}
            mode={mode}
            hasPreSelectedService={!!preSelectedService}
            onBack={goBack}
            onClose={onClose}
          />
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
          {/* STEP 1: SELECT SERVICE */}
          {step === 'service' && (
            <ServiceSelection
              mode={mode}
              clinicName={clinicName}
              services={services}
              loading={servicesLoading}
              onSelect={handleServiceSelect}
            />
          )}

          {/* STEP 2: SELECT STAFF */}
          {step === 'staff' && (
            <StaffSelection staff={staff} loading={staffLoading} onSelect={handleStaffSelect} />
          )}

          {/* STEP 3: DATE & TIME */}
          {step === 'datetime' && (
            <DateTimeSelection
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              availableSlots={availableSlots}
              loading={slotsLoading}
              onDateChange={handleDateChange}
              onTimeChange={setSelectedTime}
              onContinue={() => setStep('auth')}
            />
          )}

          {/* STEP 4: AUTHENTICATION */}
          {step === 'auth' && (
            <AuthenticationForm
              customerName={customerName}
              authPhone={authPhone}
              phoneValidationError={phoneValidationError}
              onNameChange={setCustomerName}
              onPhoneChange={handlePhoneChange}
              onContinue={handleAuthContinue}
            />
          )}

          {/* STEP 5: CHECKOUT */}
          {step === 'checkout' && selectedService && selectedTime && (
            <CheckoutSummary
              selectedService={selectedService}
              selectedStaff={selectedStaff}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              customerName={customerName}
              authPhone={authPhone}
              bookingError={bookingError}
              isBooking={isBooking}
              onConfirm={handleBookingSubmit}
            />
          )}

          {/* SUCCESS SCREEN */}
          {step === 'success' && (
            <SuccessScreen
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedService={selectedService}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};
