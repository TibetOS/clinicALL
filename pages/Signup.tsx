import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { isValidEmail, isValidIsraeliPhone, isStrongPassword } from '../lib/validation';
import { checkPhoneExists, checkEmailExists } from '../lib/supabase';
import {
  SignupStepIndicator,
  PhoneStep,
  CredentialsStep,
  BusinessInfoStep,
  BusinessTypeStep,
  BusinessHoursStep,
  ServicesStep,
  LandingSetupStep,
  SignupPreview,
  INITIAL_SIGNUP_FORM_DATA,
  type SignupFormData,
} from '../components/auth';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<SignupFormData>(INITIAL_SIGNUP_FORM_DATA);

  // Type-safe form field update handler
  const handleChange = <K extends keyof SignupFormData>(field: K, value: SignupFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user types
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Step 1: Phone validation
  const validateStep1 = async () => {
    const errors: Record<string, string> = {};

    if (!formData.phone.trim()) {
      errors.phone = 'נא להזין מספר טלפון';
    } else if (!isValidIsraeliPhone(formData.phone)) {
      errors.phone = 'מספר טלפון אינו תקין';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return false;

    // Check database for existing phone
    setLoading(true);
    try {
      const phoneExists = await checkPhoneExists(formData.phone);
      if (phoneExists) {
        toast.error('יש בעיה עם מספר הטלפון הזה');
        setLoading(false);
        return false;
      }
    } catch {
      // Continue even if check fails
    }
    setLoading(false);
    return true;
  };

  // Step 2: Credentials validation
  const validateStep2 = async () => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = 'נא להזין כתובת אימייל';
    } else if (!isValidEmail(formData.email.trim())) {
      errors.email = 'כתובת האימייל אינה תקינה';
    }

    if (!formData.password) {
      errors.password = 'נא להזין סיסמה';
    } else {
      const passwordCheck = isStrongPassword(formData.password);
      if (!passwordCheck.valid) {
        errors.password = passwordCheck.message;
      }
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'נא לאשר סיסמה';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'הסיסמאות אינן תואמות';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return false;

    // Check database for existing email
    setLoading(true);
    try {
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        toast.error('יש בעיה עם כתובת האימייל הזו');
        setLoading(false);
        return false;
      }
    } catch {
      // Continue even if check fails
    }
    setLoading(false);
    return true;
  };

  // Step 3: Business Info validation
  const validateStep3 = () => {
    const errors: Record<string, string> = {};

    if (!formData.businessName.trim()) {
      errors.businessName = 'נא להזין שם עסק';
    } else if (formData.businessName.trim().length < 2) {
      errors.businessName = 'שם העסק חייב להכיל לפחות 2 תווים';
    }

    if (!formData.businessPhone.trim()) {
      errors.businessPhone = 'נא להזין טלפון עסק';
    } else if (!isValidIsraeliPhone(formData.businessPhone)) {
      errors.businessPhone = 'מספר טלפון אינו תקין';
    }

    if (!formData.city) {
      errors.city = 'נא לבחור עיר';
    }

    if (!formData.address.trim()) {
      errors.address = 'נא להזין כתובת';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 4: Business Types validation
  const validateStep4 = () => {
    const errors: Record<string, string> = {};

    if (formData.businessTypes.length === 0) {
      errors.businessTypes = 'יש לבחור לפחות סוג עסק אחד';
      toast.error('יש לבחור לפחות סוג עסק אחד');
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 5: Operating Hours validation
  const validateStep5 = () => {
    const errors: Record<string, string> = {};

    const activeDays = formData.operatingHours.filter((d) => d.isOpen);
    if (activeDays.length === 0) {
      errors.operatingHours = 'יש לבחור לפחות יום פעילות אחד';
      toast.error('יש לבחור לפחות יום פעילות אחד');
    }

    // Validate end time is after start time for active days
    for (const day of activeDays) {
      if (day.endTime <= day.startTime) {
        errors.operatingHours = `שעת סיום חייבת להיות אחרי שעת התחלה ביום ${day.dayLabel}`;
        toast.error(errors.operatingHours);
        break;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 6: Services validation
  const validateStep6 = () => {
    const errors: Record<string, string> = {};

    if (formData.services.length === 0) {
      errors.services = 'יש להוסיף לפחות שירות אחד';
      toast.error('יש להוסיף לפחות שירות אחד');
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 7: Landing page (optional validation)
  const validateStep7 = () => {
    // All fields in step 7 are optional
    return true;
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleNextStep = async (validator: () => boolean | Promise<boolean>) => {
    const isValid = await validator();
    if (isValid) {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { error } = await signUp({
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        businessName: formData.businessName,
        businessPhone: formData.businessPhone,
        slug: formData.slug,
        address: formData.address,
        city: formData.city,
        businessTypes: formData.businessTypes,
        operatingHours: formData.operatingHours,
        services: formData.services,
        logo: formData.logo,
        coverImage: formData.coverImage,
        galleryImages: formData.galleryImages,
        tagline: formData.tagline,
      });

      if (error) {
        toast.error(error.message || 'אירעה שגיאה ביצירת החשבון');
        setLoading(false);
      } else {
        toast.success('החשבון נוצר בהצלחה!');
        // Redirect to clinic landing page
        navigate(`/c/${formData.slug}`);
      }
    } catch {
      toast.error('אירעה שגיאה ביצירת החשבון');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simplified Nav */}
      <div className="p-4 flex justify-between items-center max-w-6xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
            C
          </div>
          <span className="font-bold text-gray-900">ClinicALL</span>
        </Link>
        <div className="text-sm text-gray-500">
          כבר יש לך חשבון?{' '}
          <Link to="/login" className="text-primary hover:underline">
            התחבר
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Form */}
          <Card className="w-full p-0 shadow-xl border-0 overflow-hidden order-2 lg:order-1">
            <SignupStepIndicator currentStep={step} />

            <div className="p-8 min-h-112.5">
              {step === 1 && (
                <PhoneStep
                  formData={formData}
                  fieldErrors={fieldErrors}
                  onChange={handleChange}
                  onNext={() => handleNextStep(validateStep1)}
                  loading={loading}
                />
              )}

              {step === 2 && (
                <CredentialsStep
                  formData={formData}
                  fieldErrors={fieldErrors}
                  onChange={handleChange}
                  onNext={() => handleNextStep(validateStep2)}
                  onBack={prevStep}
                  loading={loading}
                />
              )}

              {step === 3 && (
                <BusinessInfoStep
                  formData={formData}
                  fieldErrors={fieldErrors}
                  onChange={handleChange}
                  onNext={() => handleNextStep(validateStep3)}
                  onBack={prevStep}
                />
              )}

              {step === 4 && (
                <BusinessTypeStep
                  formData={formData}
                  fieldErrors={fieldErrors}
                  onChange={handleChange}
                  onNext={() => handleNextStep(validateStep4)}
                  onBack={prevStep}
                />
              )}

              {step === 5 && (
                <BusinessHoursStep
                  formData={formData}
                  fieldErrors={fieldErrors}
                  onChange={handleChange}
                  onNext={() => handleNextStep(validateStep5)}
                  onBack={prevStep}
                />
              )}

              {step === 6 && (
                <ServicesStep
                  formData={formData}
                  fieldErrors={fieldErrors}
                  onChange={handleChange}
                  onNext={() => handleNextStep(validateStep6)}
                  onBack={prevStep}
                />
              )}

              {step === 7 && (
                <LandingSetupStep
                  formData={formData}
                  fieldErrors={fieldErrors}
                  onChange={handleChange}
                  onNext={handleSubmit}
                  onBack={prevStep}
                  loading={loading}
                />
              )}
            </div>
          </Card>

          {/* Right Column: Live Preview */}
          <SignupPreview formData={formData} />
        </div>
      </div>
    </div>
  );
};
