

import { Patient, Appointment, Service, Declaration, ClinicalNote, InventoryItem, Notification, Lead, Invoice, Campaign, HealthDeclarationToken } from './types';

// Helper to create dates relative to today for mock data
const getRelativeDate = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

// Helper to create a birthDate that falls within N days from today (same month/day, any year)
const getBirthdayInDays = (daysFromNow: number, year: number = 1990): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return `${year}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'שרה כהן',
    email: 'sarah.c@example.com',
    phone: '050-123-4567',
    riskLevel: 'low',
    lastVisit: getRelativeDate(-14), // Had botox 2 weeks ago - due for follow-up
    upcomingAppointment: undefined,
    memberSince: '2022-01-15',
    birthDate: getBirthdayInDays(3, 1989), // Birthday in 3 days
    age: 34,
    gender: 'נקבה',
    aestheticInterests: ['בוטוקס', 'פיסול שפתיים'],
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Cohen&background=random',
    // Declaration: Valid (signed 2 months ago)
    lastDeclarationDate: getRelativeDate(-60),
    declarationStatus: 'valid'
  },
  {
    id: '2',
    name: 'מיכל לוי',
    email: 'michal.l@example.com',
    phone: '052-987-6543',
    riskLevel: 'medium',
    lastVisit: getRelativeDate(-70), // Lapsed client
    memberSince: '2021-11-05',
    birthDate: getBirthdayInDays(5, 1981), // Birthday in 5 days
    age: 42,
    gender: 'נקבה',
    aestheticInterests: ['מיצוק עור', 'פיגמנטציה'],
    avatar: 'https://ui-avatars.com/api/?name=Michal+Levi&background=random',
    // Declaration: Pending (sent, not yet filled)
    declarationStatus: 'pending',
    pendingDeclarationToken: 'demo12345678'
  },
  {
    id: '3',
    name: 'דניאל אברהם',
    email: 'daniel.a@example.com',
    phone: '054-555-4433',
    riskLevel: 'low',
    lastVisit: getRelativeDate(-5),
    memberSince: '2023-05-10',
    birthDate: '1994-03-15', // Not this week
    age: 29,
    gender: 'זכר',
    aestheticInterests: ['עיצוב לסת', 'הסרת שיער'],
    avatar: 'https://ui-avatars.com/api/?name=Daniel+Avraham&background=random',
    // Declaration: Valid (signed last week)
    lastDeclarationDate: getRelativeDate(-7),
    declarationStatus: 'valid'
  },
  {
    id: '4',
    name: 'רונית שמעון',
    email: 'ronit.s@example.com',
    phone: '050-222-3344',
    riskLevel: 'low',
    lastVisit: getRelativeDate(-13), // Had botox ~2 weeks ago
    memberSince: '2022-06-20',
    birthDate: getBirthdayInDays(1, 1985), // Birthday tomorrow
    age: 38,
    gender: 'נקבה',
    aestheticInterests: ['בוטוקס', 'מזותרפיה'],
    avatar: 'https://ui-avatars.com/api/?name=Ronit+Shimon&background=random',
    // Declaration: Expired (signed 14 months ago)
    lastDeclarationDate: getRelativeDate(-420),
    declarationStatus: 'expired'
  },
  {
    id: '5',
    name: 'יעל גולן',
    email: 'yael.g@example.com',
    phone: '053-444-5566',
    riskLevel: 'high',
    lastVisit: getRelativeDate(-15), // Had botox 2 weeks ago
    memberSince: '2021-03-10',
    birthDate: '1978-08-22', // Not this week
    age: 45,
    gender: 'נקבה',
    aestheticInterests: ['בוטוקס', 'פילינג'],
    avatar: 'https://ui-avatars.com/api/?name=Yael+Golan&background=random',
    // Declaration: None (never signed)
    declarationStatus: 'none'
  },
  {
    id: '6',
    name: 'אבי כהן',
    email: 'avi.c@example.com',
    phone: '054-666-7788',
    riskLevel: 'low',
    lastVisit: getRelativeDate(-12), // Had botox ~2 weeks ago
    memberSince: '2023-01-15',
    birthDate: '1982-12-05', // Not this week
    age: 41,
    gender: 'זכר',
    aestheticInterests: ['בוטוקס'],
    avatar: 'https://ui-avatars.com/api/?name=Avi+Cohen&background=random',
    // Declaration: None (never signed)
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
  { id: '101', patientId: '3', patientName: 'דניאל אברהם', serviceId: '5', serviceName: 'מזותרפיה', date: getRelativeDate(0), time: '09:00', duration: 45, status: 'confirmed', declarationStatus: 'received' },
  { id: '102', patientId: '2', patientName: 'מיכל לוי', serviceId: '4', serviceName: 'טיפול פנים קלאסי', date: getRelativeDate(0), time: '10:00', duration: 60, status: 'pending', declarationStatus: 'pending' },
  // Past botox appointments (completed ~2 weeks ago - due for follow-up)
  { id: '103', patientId: '1', patientName: 'שרה כהן', serviceId: '1', serviceName: 'בוטוקס - אזור אחד', date: getRelativeDate(-14), time: '10:00', duration: 15, status: 'completed', declarationStatus: 'received' },
  { id: '104', patientId: '4', patientName: 'רונית שמעון', serviceId: '1', serviceName: 'בוטוקס - אזור אחד', date: getRelativeDate(-13), time: '11:00', duration: 15, status: 'completed', declarationStatus: 'required' },
  { id: '105', patientId: '5', patientName: 'יעל גולן', serviceId: '1', serviceName: 'בוטוקס - אזור אחד', date: getRelativeDate(-15), time: '14:00', duration: 15, status: 'completed', declarationStatus: 'required' },
  { id: '106', patientId: '6', patientName: 'אבי כהן', serviceId: '1', serviceName: 'בוטוקס - אזור אחד', date: getRelativeDate(-12), time: '15:00', duration: 15, status: 'completed', declarationStatus: 'required' },
  // Other past appointments
  { id: '107', patientId: '3', patientName: 'דניאל אברהם', serviceId: '2', serviceName: 'פיסול שפתיים', date: getRelativeDate(-5), time: '09:30', duration: 30, status: 'completed', declarationStatus: 'received' },
];

export const MOCK_DECLARATIONS: Declaration[] = [
  {
    id: 'dec-1',
    patientId: '1',
    patientName: 'שרה כהן',
    submittedAt: '2023-10-23T18:30:00',
    status: 'signed',
    formData: {
      personalInfo: { firstName: 'שרה', lastName: 'כהן', phone: '050-1234567', gender: 'נקבה' },
      medicalHistory: { conditions: ['רגישות לפניצילין'], medications: 'גלולות' },
      signature: 'signed'
    }
  }
];

export const MOCK_CLINICAL_NOTES: ClinicalNote[] = [
  {
    id: 'cn-1',
    patientId: '1',
    date: '2023-06-15',
    providerName: 'ד״ר שרה',
    treatmentType: 'בוטוקס מלא',
    notes: 'הוזרק 50 יחידות דיספורט. 20 במצח, 15 בין הגבות, 15 בצידי העיניים. המטופלת דיווחה על רגישות קלה בצד ימין.',
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
    message: 'מיכל לוי קבעה תור לטיפול פנים קלאסי. האם לשלוח הצהרת בריאות?',
    type: 'info',
    timestamp: new Date().toISOString(),
    read: false,
    action: 'send_declaration',
    metadata: {
      appointmentId: '102',
      patientId: '2',
      patientName: 'מיכל לוי',
      patientPhone: '052-987-6543',
      patientEmail: 'michal.l@example.com',
      appointmentDate: getRelativeDate(0),
      appointmentTime: '10:00',
      serviceName: 'טיפול פנים קלאסי'
    }
  },
  { id: 'n1', title: 'התראה על מלאי נמוך', message: 'מלאי לידוקאין משחה הגיע לסף המינימום.', type: 'warning', timestamp: '2023-10-24T08:30:00', read: false },
  { id: 'n2', title: 'ליד חדש התקבל', message: 'רונית שמעוני השאירה פרטים באינסטגרם.', type: 'success', timestamp: '2023-10-24T09:15:00', read: false },
  { id: 'n3', title: 'הצהרת בריאות', message: 'שרה כהן חתמה על טופס הצהרת בריאות.', type: 'info', timestamp: '2023-10-23T18:30:00', read: true },
];

export const MOCK_LEADS: Lead[] = [
  { id: 'l1', name: 'דנה רון', phone: '052-111-2222', source: 'Instagram', stage: 'new', createdAt: '2023-10-25', notes: 'התעניינה בטיפול בוטוקס למצח' },
  { id: 'l2', name: 'גלית כהן', phone: '054-333-4444', source: 'Facebook', stage: 'contacted', createdAt: '2023-10-24', notes: 'ביקשה הצעת מחיר, לחזור אליה בראשון' },
  { id: 'l3', name: 'נועה לוי', phone: '050-555-6666', source: 'חברה מביאה חברה', stage: 'consultation', createdAt: '2023-10-20', notes: 'נקבעה פגישה ל-28.10', value: 1500 },
  { id: 'l4', name: 'שירה אברהם', phone: '053-777-8888', source: 'Google', stage: 'won', createdAt: '2023-10-15', value: 2200, notes: 'סגרה סדרת טיפולי פנים' }
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-1001',
    patientName: 'שרה כהן',
    date: '2023-10-24',
    items: [{ description: 'בוטוקס - אזור אחד', quantity: 1, price: 600 }],
    total: 600,
    status: 'paid'
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-1002',
    patientName: 'מיכל לוי',
    date: '2023-10-23',
    items: [{ description: 'טיפול פנים קלאסי', quantity: 1, price: 450 }, { description: 'קרם לחות', quantity: 1, price: 250 }],
    total: 700,
    status: 'pending'
  },
  {
    id: 'inv-003',
    invoiceNumber: 'INV-1003',
    patientName: 'דניאל אברהם',
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

export const MOCK_HEALTH_TOKENS: HealthDeclarationToken[] = [
  {
    id: 'hdt-1',
    token: 'abc123def456',
    clinicId: 'clinic-1',
    patientId: '1',
    patientName: 'שרה כהן',
    patientPhone: '050-123-4567',
    patientEmail: 'sarah.c@example.com',
    createdAt: getRelativeDate(-7) + 'T10:00:00.000Z',
    expiresAt: getExpiryDate(-1), // Expired
    status: 'used',
    usedAt: getRelativeDate(-6) + 'T14:30:00.000Z'
  },
  {
    id: 'hdt-2',
    token: 'xyz789ghi012',
    clinicId: 'clinic-1',
    patientName: 'לקוח חדש',
    patientPhone: '052-111-2222',
    createdAt: new Date().toISOString(),
    expiresAt: getExpiryDate(7), // Valid for 7 days
    status: 'active'
  },
  {
    id: 'hdt-3',
    token: 'demo12345678',
    clinicId: 'clinic-1',
    patientId: '2',
    patientName: 'מיכל לוי',
    patientPhone: '052-987-6543',
    patientEmail: 'michal.l@example.com',
    createdAt: new Date().toISOString(),
    expiresAt: getExpiryDate(7),
    status: 'active'
  }
];