export type BusinessType = '' | 'exempt' | 'authorized' | 'company' | 'partnership';
export type PractitionerType = '' | 'doctor' | 'nurse' | 'aesthetician' | 'cosmetician' | 'other';

export type SignupFormData = {
  // Step 1: Account
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  // Step 2: Clinic & Business
  clinicName: string;
  businessId: string;
  businessType: BusinessType;
  slug: string;
  city: string;
  address: string;
  // Step 3: Contact & Social
  phone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  // Step 4: Professional
  practitionerType: PractitionerType;
  licenseNumber: string;
  specializations: string[];
  languages: string[];
  // Step 5: Branding & Final
  brandColor: string;
  coverImage: string;
  operatingHours: string;
  referralSource: string;
  termsAccepted: boolean;
  niche: string;
};

export type SignupStepProps = {
  formData: SignupFormData;
  fieldErrors: Record<string, string>;
  onChange: <K extends keyof SignupFormData>(field: K, value: SignupFormData[K]) => void;
  onNext: () => void;
  onBack?: () => void;
};

export const INITIAL_SIGNUP_FORM_DATA: SignupFormData = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  clinicName: '',
  businessId: '',
  businessType: '',
  slug: '',
  city: '',
  address: '',
  phone: '',
  whatsapp: '',
  instagram: '',
  facebook: '',
  practitionerType: '',
  licenseNumber: '',
  specializations: [],
  languages: [],
  brandColor: '#0D9488',
  coverImage: 'default',
  operatingHours: '',
  referralSource: '',
  termsAccepted: false,
  niche: 'aesthetics',
};

export const STEPS = [
  { title: 'פרטי חשבון', icon: 'User' },
  { title: 'פרטי עסק', icon: 'Building2' },
  { title: 'יצירת קשר', icon: 'Phone' },
  { title: 'פרופיל מקצועי', icon: 'Award' },
  { title: 'מיתוג ואישורים', icon: 'Palette' },
  { title: 'סיום', icon: 'Check' },
] as const;
