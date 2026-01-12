import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { isValidEmail, isValidIsraeliPhone, isStrongPassword } from '../lib/validation';
import {
  SignupStepIndicator,
  AccountStep,
  BusinessStep,
  ContactStep,
  ProfessionalStep,
  BrandingStep,
  SuccessStep,
  SignupPreview,
  INITIAL_SIGNUP_FORM_DATA,
  type SignupFormData,
} from '../components/auth';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Validation functions
  const validateStep1 = () => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'נא להזין שם מלא';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'שם חייב להכיל לפחות 2 תווים';
    }

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
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};

    if (!formData.clinicName.trim()) {
      errors.clinicName = 'נא להזין שם קליניקה';
    } else if (formData.clinicName.trim().length < 2) {
      errors.clinicName = 'שם הקליניקה חייב להכיל לפחות 2 תווים';
    }

    if (!formData.businessType) {
      errors.businessType = 'נא לבחור סוג עסק';
    }

    if (!formData.businessId.trim()) {
      errors.businessId = 'נא להזין ת.ז. או ח.פ.';
    } else if (!/^\d{9}$/.test(formData.businessId.replace(/\D/g, ''))) {
      errors.businessId = 'ת.ז. או ח.פ. חייב להכיל 9 ספרות';
    }

    if (!formData.slug.trim()) {
      errors.slug = 'נא להזין כתובת URL';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'כתובת URL יכולה להכיל רק אותיות קטנות באנגלית, מספרים ומקפים';
    }

    if (!formData.city) {
      errors.city = 'נא לבחור עיר';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors: Record<string, string> = {};

    if (!formData.phone.trim()) {
      errors.phone = 'נא להזין מספר טלפון';
    } else if (!isValidIsraeliPhone(formData.phone)) {
      errors.phone = 'מספר טלפון אינו תקין';
    }

    // WhatsApp is optional but validate if provided
    if (formData.whatsapp && !isValidIsraeliPhone(formData.whatsapp)) {
      errors.whatsapp = 'מספר וואטסאפ אינו תקין';
    }

    // Instagram validation - optional but check format if provided
    if (formData.instagram && !/^[a-zA-Z0-9._]{1,30}$/.test(formData.instagram)) {
      errors.instagram = 'שם משתמש אינסטגרם אינו תקין';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep4 = () => {
    const errors: Record<string, string> = {};

    if (!formData.practitionerType) {
      errors.practitionerType = 'נא לבחור סוג מטפל/ת';
    }

    // License number is required for medical professionals
    if (
      ['doctor', 'nurse'].includes(formData.practitionerType) &&
      !formData.licenseNumber.trim()
    ) {
      errors.licenseNumber = 'נא להזין מספר רישיון';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep5 = () => {
    const errors: Record<string, string> = {};

    if (!formData.termsAccepted) {
      errors.termsAccepted = 'נא לאשר את תנאי השימוש';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleNextStep = (validator: () => boolean) => {
    if (validator()) {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const { error } = await signUp({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      clinicName: formData.clinicName,
      slug: formData.slug,
      businessId: formData.businessId,
      address: formData.address,
      phone: formData.phone,
      whatsapp: formData.whatsapp || undefined,
      city: formData.city || undefined,
      businessType: formData.businessType || undefined,
      practitionerType: formData.practitionerType || undefined,
      licenseNumber: formData.licenseNumber || undefined,
      instagram: formData.instagram || undefined,
      facebook: formData.facebook || undefined,
      languages: formData.languages.length > 0 ? formData.languages : undefined,
      operatingHours: formData.operatingHours || undefined,
      referralSource: formData.referralSource || undefined,
      specializations: formData.specializations.length > 0 ? formData.specializations : undefined,
    });

    if (error) {
      setError(error.message || 'שגיאה בהרשמה');
      setLoading(false);
    } else {
      navigate('/admin/dashboard');
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

            <div className="p-8 min-h-[400px]">
              {step === 1 && (
                <AccountStep
                  formData={formData}
                  fieldErrors={fieldErrors}
                  onChange={handleChange}
                  onNext={() => handleNextStep(validateStep1)}
                />
              )}

              {step === 2 && (
                <BusinessStep
                  formData={formData}
                  fieldErrors={fieldErrors}
                  onChange={handleChange}
                  onNext={() => handleNextStep(validateStep2)}
                  onBack={prevStep}
                />
              )}

              {step === 3 && (
                <ContactStep
                  formData={formData}
                  fieldErrors={fieldErrors}
                  onChange={handleChange}
                  onNext={() => handleNextStep(validateStep3)}
                  onBack={prevStep}
                />
              )}

              {step === 4 && (
                <ProfessionalStep
                  formData={formData}
                  fieldErrors={fieldErrors}
                  onChange={handleChange}
                  onNext={() => handleNextStep(validateStep4)}
                  onBack={prevStep}
                />
              )}

              {step === 5 && (
                <BrandingStep
                  formData={formData}
                  fieldErrors={fieldErrors}
                  onChange={handleChange}
                  onNext={() => handleNextStep(validateStep5)}
                  onBack={prevStep}
                />
              )}

              {step === 6 && (
                <SuccessStep
                  formData={formData}
                  error={error}
                  loading={loading}
                  onSubmit={handleSubmit}
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
