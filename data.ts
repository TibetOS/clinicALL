

import { Patient, Appointment, Service, Declaration, ClinicalNote, InventoryItem, Notification, Lead, Invoice, Campaign, HealthDeclarationToken } from './types';

/**
 * SECURITY: Generate random tokens at runtime for mock data
 * This prevents predictable token values that could be guessed
 */
const generateMockToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const tokenLength = 12;
  let token = 'mock_'; // Prefix to identify mock tokens

  // Use crypto.getRandomValues for secure random generation
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(tokenLength);
    crypto.getRandomValues(array);
    for (let i = 0; i < tokenLength; i++) {
      token += chars[array[i] % chars.length];
    }
  } else {
    // Fallback for environments without crypto (should not happen in browsers)
    for (let i = 0; i < tokenLength; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return token;
};

// Pre-generate mock tokens at module load time
// These are regenerated on each page refresh, making them unpredictable
const MOCK_TOKEN_1 = generateMockToken();
const MOCK_TOKEN_2 = generateMockToken();
const MOCK_TOKEN_3 = generateMockToken();

// Helper to create dates relative to today for mock data
const getRelativeDate = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const isoString = date.toISOString();
  return isoString.split('T')[0] ?? isoString.substring(0, 10);
};

// Helper to create a birthDate that falls within N days from today (same month/day, any year)
const getBirthdayInDays = (daysFromNow: number, year: number = 1990): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return `${year}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// MOCK DATA - Generic placeholder data for development/demo mode only
// Do NOT use real patient information in mock data
export const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'מטופל/ת לדוגמה א',
    email: 'demo-patient-1@example.test',
    phone: '050-000-0001',
    riskLevel: 'low',
    lastVisit: getRelativeDate(-14),
    upcomingAppointment: undefined,
    memberSince: '2022-01-15',
    birthDate: getBirthdayInDays(3, 1989),
    age: 34,
    gender: 'נקבה',
    aestheticInterests: ['בוטוקס', 'פיסול שפתיים'],
    avatar: 'https://ui-avatars.com/api/?name=Demo+A&background=0D9488&color=fff',
    lastDeclarationDate: getRelativeDate(-60),
    declarationStatus: 'valid'
  },
  {
    id: '2',
    name: 'מטופל/ת לדוגמה ב',
    email: 'demo-patient-2@example.test',
    phone: '050-000-0002',
    riskLevel: 'medium',
    lastVisit: getRelativeDate(-70),
    memberSince: '2021-11-05',
    birthDate: getBirthdayInDays(5, 1981),
    age: 42,
    gender: 'נקבה',
    aestheticInterests: ['מיצוק עור', 'פיגמנטציה'],
    avatar: 'https://ui-avatars.com/api/?name=Demo+B&background=0D9488&color=fff',
    declarationStatus: 'pending',
    pendingDeclarationToken: MOCK_TOKEN_1
  },
  {
    id: '3',
    name: 'מטופל/ת לדוגמה ג',
    email: 'demo-patient-3@example.test',
    phone: '050-000-0003',
    riskLevel: 'low',
    lastVisit: getRelativeDate(-5),
    memberSince: '2023-05-10',
    birthDate: '1994-03-15',
    age: 29,
    gender: 'זכר',
    aestheticInterests: ['עיצוב לסת', 'הסרת שיער'],
    avatar: 'https://ui-avatars.com/api/?name=Demo+C&background=0D9488&color=fff',
    lastDeclarationDate: getRelativeDate(-7),
    declarationStatus: 'valid'
  },
  {
    id: '4',
    name: 'מטופל/ת לדוגמה ד',
    email: 'demo-patient-4@example.test',
    phone: '050-000-0004',
    riskLevel: 'low',
    lastVisit: getRelativeDate(-13),
    memberSince: '2022-06-20',
    birthDate: getBirthdayInDays(1, 1985),
    age: 38,
    gender: 'נקבה',
    aestheticInterests: ['בוטוקס', 'מזותרפיה'],
    avatar: 'https://ui-avatars.com/api/?name=Demo+D&background=0D9488&color=fff',
    lastDeclarationDate: getRelativeDate(-420),
    declarationStatus: 'expired'
  },
  {
    id: '5',
    name: 'מטופל/ת לדוגמה ה',
    email: 'demo-patient-5@example.test',
    phone: '050-000-0005',
    riskLevel: 'high',
    lastVisit: getRelativeDate(-15),
    memberSince: '2021-03-10',
    birthDate: '1978-08-22',
    age: 45,
    gender: 'נקבה',
    aestheticInterests: ['בוטוקס', 'פילינג'],
    avatar: 'https://ui-avatars.com/api/?name=Demo+E&background=0D9488&color=fff',
    declarationStatus: 'none'
  },
  {
    id: '6',
    name: 'מטופל/ת לדוגמה ו',
    email: 'demo-patient-6@example.test',
    phone: '050-000-0006',
    riskLevel: 'low',
    lastVisit: getRelativeDate(-12),
    memberSince: '2023-01-15',
    birthDate: '1982-12-05',
    age: 41,
    gender: 'זכר',
    aestheticInterests: ['בוטוקס'],
    avatar: 'https://ui-avatars.com/api/?name=Demo+F&background=0D9488&color=fff',
    declarationStatus: 'none'
  }
];

export const MOCK_SERVICES: Service[] = [
  { id: '1', name: 'בוטוקס - אזור אחד', description: 'טיפול בקמטי הבעה במצח או צידי העיניים', duration: 15, price: 600, category: 'הזרקות' },
  { id: '2', name: 'פיסול שפתיים', description: 'עיצוב ומילוי שפתיים בחומצה היאלורונית', duration: 30, price: 1800, category: 'הזרקות' },
  { id: '3', name: 'פיסול אף', description: 'תיקון מראה האף ללא ניתוח', duration: 45, price: 2200, category: 'הזרקות' },
  { id: '4', name: 'טיפול פנים קלאסי', description: 'ניקוי עמוק והזנה', duration: 60, price: 450, category: 'קוסמטיקה' },
  { id: '5', name: 'מזותרפיה', description: 'החדרת ויטמינים לעור הפנים', duration: 45, price: 800, category: 'טיפולי פנים' },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  // Today's appointments
  { id: '101', patientId: '3', patientName: 'מטופל/ת לדוגמה ג', serviceId: '5', serviceName: 'מזותרפיה', date: getRelativeDate(0), time: '09:00', duration: 45, status: 'confirmed', declarationStatus: 'received' },
  { id: '102', patientId: '2', patientName: 'מטופל/ת לדוגמה ב', serviceId: '4', serviceName: 'טיפול פנים קלאסי', date: getRelativeDate(0), time: '10:00', duration: 60, status: 'pending', declarationStatus: 'pending' },
  // Past botox appointments (completed ~2 weeks ago - due for follow-up)
  { id: '103', patientId: '1', patientName: 'מטופל/ת לדוגמה א', serviceId: '1', serviceName: 'בוטוקס - אזור אחד', date: getRelativeDate(-14), time: '10:00', duration: 15, status: 'completed', declarationStatus: 'received' },
  { id: '104', patientId: '4', patientName: 'מטופל/ת לדוגמה ד', serviceId: '1', serviceName: 'בוטוקס - אזור אחד', date: getRelativeDate(-13), time: '11:00', duration: 15, status: 'completed', declarationStatus: 'required' },
  { id: '105', patientId: '5', patientName: 'מטופל/ת לדוגמה ה', serviceId: '1', serviceName: 'בוטוקס - אזור אחד', date: getRelativeDate(-15), time: '14:00', duration: 15, status: 'completed', declarationStatus: 'required' },
  { id: '106', patientId: '6', patientName: 'מטופל/ת לדוגמה ו', serviceId: '1', serviceName: 'בוטוקס - אזור אחד', date: getRelativeDate(-12), time: '15:00', duration: 15, status: 'completed', declarationStatus: 'required' },
  // Other past appointments
  { id: '107', patientId: '3', patientName: 'מטופל/ת לדוגמה ג', serviceId: '2', serviceName: 'פיסול שפתיים', date: getRelativeDate(-5), time: '09:30', duration: 30, status: 'completed', declarationStatus: 'received' },
];

export const MOCK_DECLARATIONS: Declaration[] = [
  {
    id: 'dec-1',
    patientId: '1',
    patientName: 'מטופל/ת לדוגמה א',
    submittedAt: '2023-10-23T18:30:00',
    status: 'signed',
    formData: {
      personalInfo: { firstName: 'דוגמה', lastName: 'א', phone: '050-000-0001', gender: 'נקבה' },
      medicalHistory: { conditions: ['רגישות (לדוגמה)'], medications: 'תרופה לדוגמה' },
      signature: 'signed'
    }
  }
];

export const MOCK_CLINICAL_NOTES: ClinicalNote[] = [
  {
    id: 'cn-1',
    patientId: '1',
    date: '2023-06-15',
    providerName: 'מטפל/ת לדוגמה',
    treatmentType: 'בוטוקס מלא',
    notes: 'תיעוד טיפול לדוגמה - הוזרק 50 יחידות. 20 במצח, 15 בין הגבות, 15 בצידי העיניים.',
    injectionPoints: [
      { id: 'p1', x: 50, y: 30, units: 20 },
      { id: 'p2', x: 35, y: 45, units: 15 },
      { id: 'p3', x: 65, y: 45, units: 15 }
    ],
    images: ['https://picsum.photos/200/200?random=101', 'https://picsum.photos/200/200?random=102']
  }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', name: 'Dysport 500u', sku: 'DYS-500', category: 'רעלנים', quantity: 12, minQuantity: 5, unit: 'בקבוקון', expiryDate: '2024-12-01', supplier: 'מדיסון', status: 'ok' },
  { id: 'inv-2', name: 'Juvederm Voluma', sku: 'JUV-VOL', category: 'חומרי מילוי', quantity: 3, minQuantity: 4, unit: 'מזרק', expiryDate: '2024-06-15', supplier: 'אלרגן', status: 'low' },
  { id: 'inv-3', name: 'לידוקאין משחה', sku: 'LID-CRM', category: 'ציוד מתכלה', quantity: 1, minQuantity: 2, unit: 'שפופרת', expiryDate: '2023-12-30', supplier: 'טבע', status: 'critical' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n0',
    title: 'תור חדש נקבע',
    message: 'מטופל/ת לדוגמה ב קבע/ה תור לטיפול פנים קלאסי. האם לשלוח הצהרת בריאות?',
    type: 'info',
    timestamp: new Date().toISOString(),
    read: false,
    action: 'send_declaration',
    metadata: {
      appointmentId: '102',
      patientId: '2',
      patientName: 'מטופל/ת לדוגמה ב',
      patientPhone: '050-000-0002',
      patientEmail: 'demo-patient-2@example.test',
      appointmentDate: getRelativeDate(0),
      appointmentTime: '10:00',
      serviceName: 'טיפול פנים קלאסי'
    }
  },
  { id: 'n1', title: 'התראה על מלאי נמוך', message: 'מלאי לידוקאין משחה הגיע לסף המינימום.', type: 'warning', timestamp: '2023-10-24T08:30:00', read: false },
  { id: 'n2', title: 'ליד חדש התקבל', message: 'ליד חדש השאיר פרטים באינסטגרם.', type: 'success', timestamp: '2023-10-24T09:15:00', read: false },
  { id: 'n3', title: 'הצהרת בריאות', message: 'מטופל/ת לדוגמה א חתמ/ה על טופס הצהרת בריאות.', type: 'info', timestamp: '2023-10-23T18:30:00', read: true },
];

export const MOCK_LEADS: Lead[] = [
  { id: 'l1', name: 'ליד לדוגמה א', phone: '050-000-1001', source: 'Instagram', stage: 'new', createdAt: '2023-10-25', notes: 'התעניינות בטיפול בוטוקס' },
  { id: 'l2', name: 'ליד לדוגמה ב', phone: '050-000-1002', source: 'Facebook', stage: 'contacted', createdAt: '2023-10-24', notes: 'בקשת הצעת מחיר' },
  { id: 'l3', name: 'ליד לדוגמה ג', phone: '050-000-1003', source: 'חברה מביאה חברה', stage: 'consultation', createdAt: '2023-10-20', notes: 'נקבעה פגישת ייעוץ', value: 1500 },
  { id: 'l4', name: 'ליד לדוגמה ד', phone: '050-000-1004', source: 'Google', stage: 'won', createdAt: '2023-10-15', value: 2200, notes: 'סגירת עסקה - טיפולי פנים' }
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-1001',
    patientName: 'מטופל/ת לדוגמה א',
    date: '2023-10-24',
    items: [{ description: 'בוטוקס - אזור אחד', quantity: 1, price: 600 }],
    total: 600,
    status: 'paid'
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-1002',
    patientName: 'מטופל/ת לדוגמה ב',
    date: '2023-10-23',
    items: [{ description: 'טיפול פנים קלאסי', quantity: 1, price: 450 }, { description: 'קרם לחות', quantity: 1, price: 250 }],
    total: 700,
    status: 'pending'
  },
  {
    id: 'inv-003',
    invoiceNumber: 'INV-1003',
    patientName: 'מטופל/ת לדוגמה ג',
    date: '2023-10-10',
    items: [{ description: 'מזותרפיה', quantity: 1, price: 800 }],
    total: 800,
    status: 'overdue'
  }
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'c1', name: 'מבצע חורף', type: 'sms', status: 'active', audience: 'לקוחות שלא ביקרו 3 חודשים', sentCount: 150, openRate: 25 },
  { id: 'c2', name: 'הטבת יום הולדת נובמבר', type: 'whatsapp', status: 'scheduled', audience: 'ילידי נובמבר', sentCount: 45, scheduledDate: '2023-11-01' },
  { id: 'c3', name: 'ניוזלטר חגיגי', type: 'email', status: 'completed', audience: 'כל הלקוחות', sentCount: 1200, openRate: 42 },
  { id: 'c4', name: 'השקת טיפול חדש', type: 'whatsapp', status: 'draft', audience: 'לקוחות VIP', sentCount: 0 }
];

// Helper to generate a future date for token expiry
const getExpiryDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
};

// SECURITY: Mock tokens are generated randomly at runtime
// See generateMockToken() at the top of this file
export const MOCK_HEALTH_TOKENS: HealthDeclarationToken[] = [
  {
    id: 'hdt-1',
    token: MOCK_TOKEN_1, // Randomly generated at runtime
    clinicId: 'clinic-1',
    patientId: '1',
    patientName: 'מטופל/ת לדוגמה א',
    patientPhone: '050-000-0001',
    patientEmail: 'demo-patient-1@example.test',
    createdAt: getRelativeDate(-7) + 'T10:00:00.000Z',
    expiresAt: getExpiryDate(-1),
    status: 'used',
    usedAt: getRelativeDate(-6) + 'T14:30:00.000Z'
  },
  {
    id: 'hdt-2',
    token: MOCK_TOKEN_2, // Randomly generated at runtime
    clinicId: 'clinic-1',
    patientName: 'מטופל/ת חדש/ה לדוגמה',
    patientPhone: '050-000-1005',
    createdAt: new Date().toISOString(),
    expiresAt: getExpiryDate(7),
    status: 'active'
  },
  {
    id: 'hdt-3',
    token: MOCK_TOKEN_3, // Randomly generated at runtime
    clinicId: 'clinic-1',
    patientId: '2',
    patientName: 'מטופל/ת לדוגמה ב',
    patientPhone: '050-000-0002',
    patientEmail: 'demo-patient-2@example.test',
    createdAt: new Date().toISOString(),
    expiresAt: getExpiryDate(7),
    status: 'active'
  }
];