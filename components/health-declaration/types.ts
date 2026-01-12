// Health Question type
export type HealthQuestion = {
  id: string;
  text: { en: string; he: string };
  details: boolean;
};

// Form data for health declaration
export type HealthDeclarationFormData = {
  fullName: string;
  dob: string;
  phone: string;
  email: string;
  healthQuestions: Record<string, boolean>;
  healthDetails: Record<string, string>;
  lifestyle: {
    smoke: boolean;
    alcohol: boolean;
    sun: boolean;
    sunReaction: 'burns' | 'tans' | 'rarely';
  };
  treatments: {
    activeIngredients: boolean;
    retinA: boolean;
    pastTreatments: boolean;
    abnormalReaction: boolean;
  };
  consent: boolean;
  signature: string | null;
};

// Initial form data
export const INITIAL_HEALTH_FORM_DATA: HealthDeclarationFormData = {
  fullName: '',
  dob: '',
  phone: '',
  email: '',
  healthQuestions: {},
  healthDetails: {},
  lifestyle: { smoke: false, alcohol: false, sun: false, sunReaction: 'burns' },
  treatments: { activeIngredients: false, retinA: false, pastTreatments: false, abnormalReaction: false },
  consent: false,
  signature: null,
};

// Step component props
export type HealthStepProps = {
  formData: HealthDeclarationFormData;
  validationErrors: Record<string, string>;
  lang: 'he' | 'en';
  t: (he: string, en: string) => string;
  updateForm: <K extends keyof HealthDeclarationFormData>(key: K, value: HealthDeclarationFormData[K]) => void;
  updateNested: <K extends 'lifestyle' | 'treatments' | 'healthQuestions' | 'healthDetails'>(
    category: K,
    key: string,
    value: boolean | string
  ) => void;
};

// Token validation state
export type TokenValidationState = {
  loading: boolean;
  valid: boolean;
  token?: import('../../types').HealthDeclarationToken;
  reason?: string;
};
