import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Globe, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button, Card } from '../components/ui';
import {
  PersonalInfoStep,
  LifestyleStep,
  ConsentStep,
  LoadingState,
  ErrorState,
  SuccessState,
  INITIAL_HEALTH_FORM_DATA,
  type HealthDeclarationFormData,
  type TokenValidationState,
} from '../components/health-declaration';
import { MOCK_PATIENTS } from '../data';
import { useHealthTokens } from '../hooks';
import { isValidEmail, isValidIsraeliPhone } from '../lib/validation';

export const HealthDeclarationPage = () => {
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState<'he' | 'en'>('he');
  const { token: tokenParam } = useParams<{ token?: string }>();
  const { validateToken, markTokenAsUsed } = useHealthTokens();

  // Token validation state
  const [tokenValidation, setTokenValidation] = useState<TokenValidationState>({
    loading: !!tokenParam,
    valid: false,
  });

  // Validate token on mount
  useEffect(() => {
    const checkToken = async () => {
      if (!tokenParam) {
        // No token provided - show access denied
        setTokenValidation({ loading: false, valid: false, reason: 'NO_TOKEN' });
        return;
      }

      const result = await validateToken(tokenParam);
      setTokenValidation({ loading: false, ...result });
    };

    checkToken();
  }, [tokenParam, validateToken]);

  // Get patient data from token or mock
  const patient = tokenValidation.token?.patientId
    ? MOCK_PATIENTS.find(p => p.id === tokenValidation.token?.patientId)
    : undefined;

  // Form State
  const [formData, setFormData] = useState<HealthDeclarationFormData>(INITIAL_HEALTH_FORM_DATA);

  // Validation error state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Update form data when token validation completes
  useEffect(() => {
    if (tokenValidation.valid && tokenValidation.token) {
      setFormData(prev => ({
        ...prev,
        fullName: tokenValidation.token?.patientName || patient?.name || prev.fullName,
        phone: tokenValidation.token?.patientPhone || patient?.phone || prev.phone,
        email: tokenValidation.token?.patientEmail || patient?.email || prev.email,
      }));
    }
  }, [tokenValidation.valid, tokenValidation.token, patient]);

  const updateForm = <K extends keyof HealthDeclarationFormData>(key: K, value: HealthDeclarationFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const updateNested = <K extends 'lifestyle' | 'treatments' | 'healthQuestions' | 'healthDetails'>(
    category: K,
    key: string,
    value: boolean | string
  ) => {
    setFormData(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: value }
    }));
  };

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'he' : 'en';
    setLang(newLang);
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const nextStep = async () => {
    // Clear previous validation errors
    setValidationErrors({});
    const errors: Record<string, string> = {};

    if (step === 1) {
      // Validate required fields
      if (!formData.fullName.trim()) {
        errors.fullName = lang === 'he' ? 'שם מלא הוא שדה חובה' : 'Full name is required';
      }
      if (!formData.phone.trim()) {
        errors.phone = lang === 'he' ? 'מספר טלפון הוא שדה חובה' : 'Phone number is required';
      } else if (!isValidIsraeliPhone(formData.phone)) {
        errors.phone = lang === 'he' ? 'מספר טלפון לא תקין' : 'Invalid phone number format';
      }
      // Optional email validation
      if (formData.email && !isValidEmail(formData.email)) {
        errors.email = lang === 'he' ? 'כתובת אימייל לא תקינה' : 'Invalid email address';
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
    }

    if (step === 3) {
      if (!formData.consent) {
        errors.consent = lang === 'he' ? 'יש לאשר את התנאים' : 'You must agree to the terms';
      }
      if (!formData.signature) {
        errors.signature = lang === 'he' ? 'נדרשת חתימה' : 'Signature is required';
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      // On final submission, mark token as used
      if (tokenValidation.token) {
        await markTokenAsUsed(tokenValidation.token.id);
      }
    }

    setStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => setStep(prev => prev - 1);

  // Translations helper
  const t = (he: string, en: string) => lang === 'he' ? he : en;

  // Loading state while validating token
  if (tokenValidation.loading) {
    return <LoadingState lang={lang} />;
  }

  // Invalid/expired token states
  if (!tokenValidation.valid) {
    return <ErrorState lang={lang} reason={tokenValidation.reason} />;
  }

  // Success state after submission
  if (step === 4) {
    return <SuccessState lang={lang} />;
  }

  const stepProps = {
    formData,
    validationErrors,
    lang,
    t,
    updateForm,
    updateNested,
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 font-sans text-stone-800">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">C</div>
            <span className="font-bold text-xl text-gray-800">ClinicALL</span>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleLang} className="gap-2 text-gray-600 hover:bg-white">
            <Globe size={16} /> {lang === 'en' ? 'עברית' : 'English'}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs font-medium text-gray-400">
            <span className={step >= 1 ? 'text-primary' : ''}>{t('פרטים אישיים', 'Personal Info')}</span>
            <span className={step >= 2 ? 'text-primary' : ''}>{t('אורח חיים', 'Lifestyle')}</span>
            <span className={step >= 3 ? 'text-primary' : ''}>{t('חתימה', 'Signature')}</span>
          </div>
        </div>

        <Card className="overflow-hidden border-0 shadow-lg">
          {step === 1 && (
            <PersonalInfoStep
              {...stepProps}
              patient={patient}
              token={tokenValidation.token}
            />
          )}

          {step === 2 && <LifestyleStep {...stepProps} />}

          {step === 3 && <ConsentStep {...stepProps} />}

          {/* Footer Navigation */}
          <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
            {step > 1 ? (
              <Button variant="ghost" onClick={prevStep} className="text-gray-500">
                <ChevronRight size={16} className="ml-1"/> {t('חזור', 'Back')}
              </Button>
            ) : <div></div>}

            <Button onClick={nextStep} className="px-8 shadow-lg shadow-primary/20" disabled={step === 3 && (!formData.consent || !formData.signature)}>
              {step === 3 ? t('שלח הצהרה', 'Submit') : t('המשך', 'Next')}
              {step !== 3 && <ChevronLeft size={16} className="mr-1" />}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
