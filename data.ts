

import { Patient, Appointment, Service, Declaration, ClinicalNote, InventoryItem, Notification, Lead, Invoice, Campaign } from './types';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'שרה כהן',
    email: 'sarah.c@example.com',
    phone: '050-123-4567',
    riskLevel: 'low',
    lastVisit: '2023-10-15',
    upcomingAppointment: '2023-11-02',
    memberSince: '2022-01-15',
    age: 34,
    gender: 'נקבה',
    aestheticInterests: ['בוטוקס', 'פיסול שפתיים'],
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Cohen&background=random'
  },
  {
    id: '2',
    name: 'מיכל לוי',
    email: 'michal.l@example.com',
    phone: '052-987-6543',
    riskLevel: 'medium',
    lastVisit: '2023-09-20',
    memberSince: '2021-11-05',
    age: 42,
    gender: 'נקבה',
    aestheticInterests: ['מיצוק עור', 'פיגמנטציה'],
    avatar: 'https://ui-avatars.com/api/?name=Michal+Levi&background=random'
  },
  {
    id: '3',
    name: 'דניאל אברהם',
    email: 'daniel.a@example.com',
    phone: '054-555-4433',
    riskLevel: 'low',
    lastVisit: '2023-10-01',
    memberSince: '2023-05-10',
    age: 29,
    gender: 'זכר',
    aestheticInterests: ['עיצוב לסת', 'הסרת שיער'],
    avatar: 'https://ui-avatars.com/api/?name=Daniel+Avraham&background=random'
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
  { id: '101', patientId: '1', patientName: 'שרה כהן', serviceId: '1', serviceName: 'בוטוקס - אזור אחד', date: '2023-10-24', time: '09:00', duration: 15, status: 'confirmed' },
  { id: '102', patientId: '2', patientName: 'מיכל לוי', serviceId: '4', serviceName: 'טיפול פנים קלאסי', date: '2023-10-24', time: '10:00', duration: 60, status: 'confirmed' },
  { id: '103', patientId: '3', patientName: 'דניאל אברהם', serviceId: '5', serviceName: 'מזותרפיה', date: '2023-10-24', time: '12:30', duration: 45, status: 'pending' },
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