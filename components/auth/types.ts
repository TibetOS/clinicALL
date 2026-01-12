// Business type categories with icons for visual selector
export type BusinessTypeKey =
  | 'nails'
  | 'barber'
  | 'lashes'
  | 'eyebrows'
  | 'hair_stylist'
  | 'skincare'
  | 'makeup'
  | 'hair_removal'
  | 'massage'
  | 'tattoo_piercing'
  | 'medical_dental'
  | 'injections'
  | 'holistic'
  | 'pet_grooming'
  | 'optician'
  | 'fitness'
  | 'other';

export type BusinessTypeOption = {
  key: BusinessTypeKey;
  label: string;
  icon: string;
};

export const BUSINESS_TYPES: BusinessTypeOption[] = [
  { key: 'nails', label: 'ציפורניים', icon: 'Hand' },
  { key: 'barber', label: 'ברבר / מספרת גברים', icon: 'Scissors' },
  { key: 'lashes', label: 'ריסים', icon: 'Eye' },
  { key: 'eyebrows', label: 'גבות', icon: 'Sparkles' },
  { key: 'hair_stylist', label: 'מעצבי שיער', icon: 'Wind' },
  { key: 'skincare', label: 'טיפוח עור', icon: 'Droplet' },
  { key: 'makeup', label: 'איפור', icon: 'Palette' },
  { key: 'hair_removal', label: 'הסרת שיער', icon: 'Zap' },
  { key: 'massage', label: 'עיסוי', icon: 'Heart' },
  { key: 'tattoo_piercing', label: 'קעקועים ופירסינג', icon: 'Pen' },
  { key: 'medical_dental', label: 'רפואה ורופאי שיניים', icon: 'Stethoscope' },
  { key: 'injections', label: 'הזרקות ומילויים', icon: 'Syringe' },
  { key: 'holistic', label: 'ייעוץ וטיפול הוליסטי', icon: 'Leaf' },
  { key: 'pet_grooming', label: 'מספרת לכלבים', icon: 'Dog' },
  { key: 'optician', label: 'אופטיקה', icon: 'Glasses' },
  { key: 'fitness', label: 'פיטנס', icon: 'Dumbbell' },
  { key: 'other', label: 'אחר', icon: 'MoreHorizontal' },
];

// Operating hours for each day
export type DaySchedule = {
  day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  dayLabel: string;
  isOpen: boolean;
  startTime: string;
  endTime: string;
};

export const DEFAULT_OPERATING_HOURS: DaySchedule[] = [
  { day: 'sunday', dayLabel: 'א׳', isOpen: true, startTime: '09:00', endTime: '18:00' },
  { day: 'monday', dayLabel: 'ב׳', isOpen: true, startTime: '09:00', endTime: '18:00' },
  { day: 'tuesday', dayLabel: 'ג׳', isOpen: true, startTime: '09:00', endTime: '18:00' },
  { day: 'wednesday', dayLabel: 'ד׳', isOpen: true, startTime: '09:00', endTime: '18:00' },
  { day: 'thursday', dayLabel: 'ה׳', isOpen: true, startTime: '09:00', endTime: '18:00' },
  { day: 'friday', dayLabel: 'ו׳', isOpen: true, startTime: '09:00', endTime: '14:00' },
  { day: 'saturday', dayLabel: 'שבת', isOpen: false, startTime: '00:00', endTime: '00:00' },
];

// Service input during signup
export type ServiceInput = {
  id: string;
  name: string;
  duration: number;
  price: number;
};

// Duration options for services
export const DURATION_OPTIONS = [
  { value: 15, label: '15 דקות' },
  { value: 30, label: 'חצי שעה' },
  { value: 45, label: '45 דקות' },
  { value: 60, label: 'שעה' },
  { value: 90, label: 'שעה וחצי' },
  { value: 120, label: 'שעתיים' },
] as const;

// Israeli cities list (commonly used)
export const ISRAELI_CITIES = [
  'תל אביב',
  'ירושלים',
  'חיפה',
  'ראשון לציון',
  'פתח תקווה',
  'אשדוד',
  'נתניה',
  'באר שבע',
  'בני ברק',
  'חולון',
  'רמת גן',
  'אשקלון',
  'רחובות',
  'בת ים',
  'הרצליה',
  'כפר סבא',
  'מודיעין',
  'רעננה',
  'גבעתיים',
  'הוד השרון',
  'רמת השרון',
  'נהריה',
  'עכו',
  'קריית אתא',
  'קריית גת',
  'קריית מוצקין',
  'אילת',
  'נצרת',
  'טבריה',
  'צפת',
  'כרמיאל',
  'עפולה',
  'יבנה',
  'לוד',
  'רמלה',
  'אחר',
] as const;

// New Signup Form Data structure for 7-step flow
export type SignupFormData = {
  // Step 1: Phone
  phone: string;
  // Step 2: Credentials
  email: string;
  password: string;
  confirmPassword: string;
  // Step 3: Business Info
  businessName: string;
  businessPhone: string;
  address: string;
  city: string;
  // Step 4: Business Types (max 3)
  businessTypes: BusinessTypeKey[];
  // Step 5: Operating Hours
  operatingHours: DaySchedule[];
  // Step 6: Services
  services: ServiceInput[];
  // Step 7: Landing Page
  logo: File | null;
  logoPreview: string;
  coverImage: File | null;
  coverImagePreview: string;
  galleryImages: File[];
  galleryPreviews: string[];
  tagline: string;
  // Generated
  slug: string;
};

export type SignupStepProps = {
  formData: SignupFormData;
  fieldErrors: Record<string, string>;
  onChange: <K extends keyof SignupFormData>(field: K, value: SignupFormData[K]) => void;
  onNext: () => void;
  onBack?: () => void;
  loading?: boolean;
};

export const INITIAL_SIGNUP_FORM_DATA: SignupFormData = {
  // Step 1
  phone: '',
  // Step 2
  email: '',
  password: '',
  confirmPassword: '',
  // Step 3
  businessName: '',
  businessPhone: '',
  address: '',
  city: '',
  // Step 4
  businessTypes: [],
  // Step 5
  operatingHours: DEFAULT_OPERATING_HOURS,
  // Step 6
  services: [],
  // Step 7
  logo: null,
  logoPreview: '',
  coverImage: null,
  coverImagePreview: '',
  galleryImages: [],
  galleryPreviews: [],
  tagline: '',
  // Generated
  slug: '',
};

// Step configuration for the indicator
export const STEPS = [
  { title: 'מספר טלפון', icon: 'Phone' },
  { title: 'אימייל וסיסמה', icon: 'Mail' },
  { title: 'פרטי העסק', icon: 'Building2' },
  { title: 'סוג העסק', icon: 'Grid3X3' },
  { title: 'שעות פעילות', icon: 'Clock' },
  { title: 'שירותים', icon: 'Scissors' },
  { title: 'דף הנחיתה שלך', icon: 'Globe' },
] as const;

// Helper to generate slug from business name
export function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/[^\w\u0590-\u05FF-]/g, '') // Keep Hebrew, alphanumeric and hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// ---- Legacy types kept for backwards compatibility during migration ----
// These will be removed after migration is complete

export type BusinessType = '' | 'exempt' | 'authorized' | 'company' | 'partnership';
export type PractitionerType = '' | 'doctor' | 'nurse' | 'aesthetician' | 'cosmetician' | 'other';

export type LegacySignupFormData = {
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
