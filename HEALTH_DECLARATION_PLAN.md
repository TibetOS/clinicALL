# Health Declaration System - Complete Implementation Plan

## Overview

This plan covers the complete health declaration workflow for ClinicALL, addressing three main scenarios:
1. **New Client** - Comes from Instagram, books appointment
2. **Returning Client** - Existing client books again
3. **Migration** - Importing existing clients from another system

---

## Current State (Completed)

### What's Already Built
- [x] `HealthDeclarationToken` type with token, expiry, status tracking
- [x] `useHealthTokens` hook for token CRUD operations
- [x] Token-based route `/health/:token` with validation
- [x] Error screens for invalid/expired/used tokens
- [x] Admin UI in PatientList to generate and send links
- [x] Share via WhatsApp and Email
- [x] Token expires after 7 days, single-use only

---

## Phase 1: Patient Declaration Status

**Goal:** Show at a glance which patients have valid health declarations

### 1.1 Extend Patient Type
```typescript
// In types.ts - extend Patient interface
interface Patient {
  // ... existing fields
  lastDeclarationDate?: string;      // When they last signed
  declarationStatus: 'valid' | 'expired' | 'pending' | 'none';
}
```

### 1.2 Add Declaration Status to Patient List
- Show badge next to each patient:
  - ✅ `תקין` (green) - Valid declaration (< 1 year old)
  - ⏳ `ממתין` (yellow) - Declaration sent, not yet filled
  - ❌ `פג תוקף` (orange) - Declaration expired (> 1 year)
  - ⚪ `חסר` (gray) - No declaration on file

### 1.3 Quick Action on Patient Row
- Add "שלח הצהרה" button on each patient row
- Pre-fills patient details in the dialog
- Shows status of last declaration

### 1.4 Filter by Declaration Status
- Add filter option: "הצג רק ללא הצהרה תקפה"
- Useful for sending bulk reminders

---

## Phase 2: Link Declarations to Patients

**Goal:** Track declaration history per patient

### 2.1 Update Declaration Type
```typescript
// In types.ts - update Declaration interface
interface Declaration {
  id: string;
  patientId: string;
  patientName: string;
  tokenId?: string;           // Link to the token used
  submittedAt: string;
  expiresAt: string;          // 1 year from submission
  status: 'valid' | 'expired';
  formData: { ... };
}
```

### 2.2 Create Declaration on Form Submit
When client submits health form:
1. Create Declaration record linked to patient
2. Mark token as used
3. Update patient's `lastDeclarationDate`
4. Update patient's `declarationStatus` to 'valid'

### 2.3 Patient Detail Page - Declarations Tab
- Show list of all declarations for this patient
- View each declaration's details
- Download/print declaration PDF
- Manually mark as reviewed

---

## Phase 3: Auto-Send After Booking

**Goal:** Automatically request health declaration when someone books

### 3.1 Update Booking Success Flow
```
Client completes booking
    ↓
Check: Does this phone number exist in patients?
    ↓
YES → Check declaration status
    ├── Valid → No action needed
    └── Expired/None → Generate token, send WhatsApp
    ↓
NO → Create new patient record
    → Generate token
    → Send WhatsApp with declaration link
```

### 3.2 Booking Confirmation Message
Update the WhatsApp message sent after booking:
```
שלום [שם],

התור שלך אושר:
📅 [תאריך] בשעה [שעה]
💆 [שם הטיפול]

לפני הגעתך, אנא מלא/י הצהרת בריאות:
🔗 [קישור]

נתראה!
[שם המרפאה]
```

### 3.3 Update Appointment Type
```typescript
interface Appointment {
  // ... existing fields
  declarationStatus: 'required' | 'pending' | 'received' | 'not_required';
  declarationTokenId?: string;
}
```

### 3.4 Calendar View Updates
Show declaration status on calendar:
- 🟢 Green dot - Declaration received
- 🟡 Yellow dot - Pending (sent, not filled)
- 🔴 Red dot - Required but not sent

---

## Phase 4: Migration & Import

**Goal:** Help clinic owners import existing clients

### 4.1 CSV Import Feature
Admin → Patients → "ייבוא מקובץ"

**Supported columns:**
- שם מלא (required)
- טלפון (required)
- אימייל
- תאריך לידה
- מגדר
- תאריך הצטרפות
- תאריך הצהרה אחרונה (for paper declarations)

### 4.2 Import Wizard
1. Upload CSV file
2. Map columns to fields
3. Preview first 5 rows
4. Handle duplicates (by phone number)
5. Import with progress bar

### 4.3 Mark Existing Paper Declarations
For clients with paper declarations:
- Option to enter "תאריך הצהרה קיימת"
- Calculates expiry (1 year from that date)
- Shows as valid until expiry

---

## Phase 5: Reminders & Automation

**Goal:** Automated reminders for pending declarations

### 5.1 Reminder Triggers
- **24 hours before appointment** - If declaration pending
- **1 week before expiry** - For existing clients
- **Day of appointment** - Final reminder if still missing

### 5.2 Reminder Message
```
תזכורת: טרם מילאת הצהרת בריאות

התור שלך ב[שם המרפאה] מחר בשעה [שעה].
אנא מלא/י את ההצהרה לפני הגעתך:
[קישור]
```

### 5.3 Clinic Dashboard Widget
Show on main dashboard:
```
┌─────────────────────────────┐
│ הצהרות בריאות               │
├─────────────────────────────┤
│ 📋 3 ממתינות למילוי         │
│ ⚠️ 5 פגו תוקף החודש         │
│ ✅ 142 תקפות                │
└─────────────────────────────┘
```

---

## Phase 6: Advanced Features

### 6.1 Declaration Templates
- Create multiple declaration templates
- Different forms for different treatments
- Botox vs. Fillers vs. Facial treatments

### 6.2 Digital Signature Storage
- Store signature as image
- Attach to patient record
- Include in PDF export

### 6.3 Audit Trail
- Track when declaration was sent
- When it was opened (optional)
- When it was signed
- Who reviewed it

---

## Implementation Priority

### Sprint 1 (Current) ✅
- [x] Token-based health declaration
- [x] Manual send via admin UI
- [x] Token validation and expiry

### Sprint 2 (Next)
- [ ] Declaration status on patient cards
- [ ] Quick send from patient row
- [ ] Link declarations to patients
- [ ] Patient detail - declarations tab

### Sprint 3
- [ ] Auto-send after booking
- [ ] Calendar declaration status
- [ ] Appointment-level tracking

### Sprint 4
- [ ] CSV import for migration
- [ ] Mark existing paper declarations
- [ ] Bulk operations

### Sprint 5
- [ ] Automated reminders
- [ ] Dashboard widget
- [ ] Expiry notifications

### Sprint 6 (Future)
- [ ] Multiple declaration templates
- [ ] PDF export
- [ ] Audit trail

---

## User Flows Summary

### Flow A: New Client from Instagram
```
Instagram → Landing Page → Book → Phone Verify → Confirm
    ↓
System creates patient + sends declaration
    ↓
Client fills form on phone
    ↓
Clinic sees ✅ on calendar
    ↓
Client arrives → Treatment
```

### Flow B: Returning Client (Valid Declaration)
```
Client books (phone recognized)
    ↓
System checks: Declaration valid? ✅
    ↓
No action needed
    ↓
Client arrives → Treatment
```

### Flow C: Returning Client (Expired Declaration)
```
Client books (phone recognized)
    ↓
System checks: Declaration expired ❌
    ↓
Auto-send new declaration request
    ↓
Client fills form
    ↓
Client arrives → Treatment
```

### Flow D: Migration (Existing Clients)
```
Export from old system → CSV
    ↓
Import to ClinicALL
    ↓
Mark clients with paper declarations
    ↓
For clients without: Send declaration requests
    ↓
System now tracks all declarations
```

---

## Technical Notes

### Database Schema (Supabase)
```sql
-- health_declaration_tokens
CREATE TABLE health_declaration_tokens (
  id UUID PRIMARY KEY,
  token VARCHAR(12) UNIQUE NOT NULL,
  clinic_id UUID REFERENCES clinics(id),
  patient_id UUID REFERENCES patients(id),
  patient_name VARCHAR(255),
  patient_phone VARCHAR(20),
  patient_email VARCHAR(255),
  appointment_id UUID REFERENCES appointments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  used_at TIMESTAMPTZ
);

-- Add to patients table
ALTER TABLE patients ADD COLUMN last_declaration_date TIMESTAMPTZ;
ALTER TABLE patients ADD COLUMN declaration_status VARCHAR(20) DEFAULT 'none';

-- Add to appointments table
ALTER TABLE appointments ADD COLUMN declaration_status VARCHAR(20) DEFAULT 'not_required';
ALTER TABLE appointments ADD COLUMN declaration_token_id UUID REFERENCES health_declaration_tokens(id);
```

### API Endpoints
- `POST /api/tokens/create` - Generate new token
- `GET /api/tokens/:token/validate` - Validate token
- `POST /api/tokens/:token/submit` - Submit declaration
- `GET /api/patients/:id/declarations` - Get patient declarations
- `POST /api/patients/import` - Bulk import from CSV

---

## Success Metrics

1. **Compliance Rate** - % of appointments with valid declarations
2. **Fill Rate** - % of sent declarations that get filled
3. **Time to Fill** - Average time from send to submit
4. **Reminder Effectiveness** - % filled after reminder vs. first send
