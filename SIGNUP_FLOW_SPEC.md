# Multi-Step Signup/Onboarding Flow Specification

## Overview

Refactor the signup flow to implement a 7-step business onboarding stepper. The new flow prioritizes phone-first registration with database validation at each credential step. Upon completion, users are redirected to their newly created clinic landing page.

**Key Changes from Current Flow:**
- Phone-first registration (instead of email-first)
- Database uniqueness validation for phone and email with `sonner` toast feedback
- Visual business type selector (grid with icons, max 3 selections)
- Per-day business hours configuration with toggles
- Service creation during onboarding
- Media uploads (logo, cover image, gallery) for landing page customization

---

## Step Structure

| Step | Hebrew Title | Key Fields | Validation |
|------|--------------|------------|------------|
| 1 | מספר טלפון | `phone` | Israeli phone format, DB uniqueness check |
| 2 | אימייל וסיסמה | `email`, `password`, `confirmPassword` | Email format, password strength, DB uniqueness check |
| 3 | פרטי העסק | `businessName`, `businessPhone`, `address`, `city` | All required |
| 4 | סוג העסק | `businessTypes[]` | At least 1, max 3 selections |
| 5 | שעות פעילות | `operatingHours[]` | At least 1 day active |
| 6 | שירותים | `services[]` | At least 1 service |
| 7 | דף הנחיתה שלך | `logo`, `coverImage`, `galleryImages[]`, `tagline` | Optional media, preview + submit |

---

## Data Model Requirements

### Form Data Fields

**Step 1 - Phone:**
- `phone` (string): User's personal phone number

**Step 2 - Credentials:**
- `email` (string): User's email address
- `password` (string): Account password
- `confirmPassword` (string): Password confirmation

**Step 3 - Business Info:**
- `businessName` (string): Name of the business
- `businessPhone` (string): Business contact phone
- `address` (string): Street address
- `city` (string): City from predefined Israeli cities list

**Step 4 - Business Types:**
- `businessTypes` (array, max 3): Selected business categories

**Step 5 - Operating Hours:**
- `operatingHours` (array of 7 day objects): Each containing:
  - `day`: Day identifier (sunday through saturday)
  - `dayLabel`: Hebrew abbreviation (א׳, ב׳, ג׳, ד׳, ה׳, ו׳, שבת)
  - `isOpen`: Boolean toggle
  - `startTime`: Opening time in HH:MM format
  - `endTime`: Closing time in HH:MM format

**Step 6 - Services:**
- `services` (array): Each containing:
  - `id`: Unique identifier
  - `name`: Service name in Hebrew
  - `duration`: Duration in minutes
  - `price`: Price in ILS (₪)

**Step 7 - Landing Page:**
- `logo` (File): Business logo image
- `logoPreview` (string): Preview URL for display
- `coverImage` (File): Cover/banner image
- `coverImagePreview` (string): Preview URL for display
- `galleryImages` (File array, max 6): Gallery images
- `galleryPreviews` (string array): Preview URLs for display
- `tagline` (string, max 150 chars): Short business description

**Generated:**
- `slug` (string): URL-friendly identifier auto-generated from business name

---

## Business Types List

Based on the reference images, include these business categories with appropriate icons:

| Type Key | Hebrew Label | Icon |
|----------|--------------|------|
| nails | ציפורניים | Hand/nail icon |
| barber | ברבר / מספרת גברים | Barber chair icon |
| lashes | ריסים | Eyelash icon |
| eyebrows | גבות | Eyebrow icon |
| hair_stylist | מעצבי שיער | Hair dryer icon |
| skincare | טיפוח עור | Skincare/cream icon |
| makeup | איפור | Makeup/mirror icon |
| hair_removal | הסרת שיער | Laser/zap icon |
| massage | עיסוי | Massage/spa icon |
| tattoo_piercing | קעקועים ופירסינג | Tattoo icon |
| medical_dental | רפואה ורופאי שיניים | Tooth/medical icon |
| injections | הזרקות ומילויים | Syringe icon |
| holistic | ייעוץ וטיפול הוליסטי | Leaf/wellness icon |
| pet_grooming | מספרת לכלבים | Dog icon |
| optician | אופטיקה | Glasses icon |
| fitness | פיטנס | Dumbbell icon |
| other | אחר | More/ellipsis icon |

---

## Default Operating Hours

- Sunday through Thursday: Open, 09:00 - 18:00
- Friday: Open, 09:00 - 14:00
- Saturday (שבת): Closed, 00:00 - 00:00

---

## Duration Options for Services

| Minutes | Hebrew Label |
|---------|--------------|
| 15 | 15 דקות |
| 30 | חצי שעה |
| 45 | 45 דקות |
| 60 | שעה |
| 90 | שעה וחצי |
| 120 | שעתיים |

---

## Step-by-Step UI Specifications

### Step 1: Phone Number (מספר טלפון)

**Header:** "מה מספר הטלפון שלך?"
**Subheader:** "נשתמש במספר הזה להתחברות לחשבון"

**UI Elements:**
- Phone input field with Israeli format placeholder (050-1234567)
- Error message display area below input
- "המשך" (Continue) button with left arrow icon

**Behavior:**
1. Validate phone format using existing `isValidIsraeliPhone()` validator
2. On continue click, check database for existing phone
3. If phone exists: show toast "יש בעיה עם מספר הטלפון הזה"
4. If phone available: proceed to step 2

---

### Step 2: Email & Password (אימייל וסיסמה)

**Header:** "פרטי התחברות"
**Subheader:** "צור סיסמה חזקה לחשבון שלך"

**UI Elements:**
- Email input (LTR direction, left-aligned text)
- Password input with show/hide toggle
- Password requirements hint: "לפחות 8 תווים, אות גדולה, אות קטנה ומספר"
- Confirm password input with show/hide toggle
- Back button (right side): "חזרה" with right arrow
- Continue button (left side): "המשך" with left arrow

**Behavior:**
1. Validate email format using existing `isValidEmail()` validator
2. Validate password strength using existing `isStrongPassword()` validator
3. Verify passwords match
4. On continue click, check database for existing email
5. If email exists: show toast "יש בעיה עם כתובת האימייל הזו"
6. If email available: proceed to step 3

---

### Step 3: Business Details (פרטי העסק)

**Header:** "פרטי העסק שלך"
**Subheader:** "המידע יופיע בדף הנחיתה שלך"

**UI Elements:**
- Business name input field
- Business phone input field
- City dropdown/select with Israeli cities
- Address input field
- Back and Continue navigation buttons

**Behavior:**
1. Validate all fields are filled
2. Validate business phone format
3. Auto-generate URL slug from business name
4. Proceed to step 4

---

### Step 4: Business Type (סוג העסק)

**Header:** "מה סוג העסק שלך?"
**Subheader:** "בחר/י את סוג העסק שלך. ניתן לבחור עד 3 סוגי עסקים"

**UI Elements:**
- 2-column grid of selectable cards
- Each card contains: icon (centered), Hebrew label (below icon)
- Selected state: teal border, light teal background tint
- Unselected state: gray border, white background
- Back and Continue navigation buttons

**Behavior:**
1. Click card to select/deselect
2. When 3 types selected, disable remaining unselected cards (gray out, not clickable)
3. Click selected card to deselect and re-enable others
4. Validate at least 1 type selected before proceeding
5. If no selection: show toast "יש לבחור לפחות סוג עסק אחד"

---

### Step 5: Business Hours (שעות פעילות)

**Header:** "מתי אפשר לקבוע לך תורים?"
**Subheader:** "אפשר לשנות את שעות הפעילות גם בהמשך, הפסקות ניתן להגדיר בקלות ביומן."

**UI Elements:**
- Table/list with 7 rows (one per day)
- Each row contains (right to left in RTL):
  - Day label (א׳, ב׳, ג׳, ד׳, ה׳, ו׳, שבת)
  - Start time input labeled "התחלה"
  - End time input labeled "סיום"
  - Toggle switch (on/off)
- Back and Continue navigation buttons

**Behavior:**
1. Toggle controls whether day is active
2. When toggle off: gray out time inputs, make them non-interactive
3. When toggle on: enable time inputs
4. Validate end time is after start time for active days
5. Validate at least 1 day is active before proceeding
6. If no active days: show toast "יש לבחור לפחות יום פעילות אחד"

---

### Step 6: Services (שירותים)

**Header:** "נתחיל להוסיף שירותים"
**Subheader:** "הגדירו עכשיו שירות אחד לפחות, בהמשך יהיה ניתן להוסיף שירותים נוספים."

**UI Elements:**
- "הוספת שירות +" button (aligned right)
- Service list, each row containing (right to left):
  - Delete icon (red trash)
  - Service name
  - Duration
  - Price with ₪ symbol
  - Chevron/arrow indicator
- Back and Continue navigation buttons

**Add Service Dialog/Form:**
- Service name input field
- Duration dropdown with predefined options
- Price input with ₪ prefix
- Cancel and Add buttons

**Behavior:**
1. Click "+ הוספת שירות" to open add service form
2. Fill service details and confirm to add to list
3. Click delete icon to remove service (confirm before removing)
4. Validate at least 1 service exists before proceeding
5. If no services: show toast "יש להוסיף לפחות שירות אחד"

---

### Step 7: Landing Page Setup (דף הנחיתה שלך)

**Header:** "דף הנחיתה שלך"
**Subheader:** "התאם אישית את העמוד שלך לפני הפרסום"

**UI Elements:**

**Logo Upload Section:**
- Label: "לוגו העסק"
- Upload area/button with camera icon
- Hint text: "מומלץ: 200x200"
- Preview of uploaded logo

**Cover Image Upload Section:**
- Label: "תמונת כיסוי"
- Wider upload area for banner image
- Hint text: "1200x400"
- Preview of uploaded cover

**Gallery Upload Section:**
- Label: "גלריית תמונות (עד 6 תמונות)"
- Grid of upload slots (show uploaded + empty slots up to 6)
- Each slot can display preview or upload trigger

**Tagline Section:**
- Label: "תיאור קצר (אופציונלי)"
- Textarea input
- Character counter (max 150)
- Placeholder: "מומחים לטיפולי פנים ואסתטיקה..."

**Preview Section:**
- Divider with label: "תצוגה מקדימה"
- Phone frame mockup showing the landing page with:
  - Uploaded cover image as header
  - Uploaded logo
  - Business name
  - Tagline
  - Services list
  - Contact information
- URL display: "clinicall.co.il/c/{slug}"

**Navigation:**
- Back button: "חזרה"
- Submit button: "סיום והפעלת העמוד"

**Image Validation Rules:**

| Field | Max Size | Recommended Dimensions | Required |
|-------|----------|------------------------|----------|
| Logo | 2MB | 200×200px, square | No |
| Cover Image | 5MB | 1200×400px, 3:1 ratio | No |
| Gallery (each) | 5MB | 800×600px min | No |

**Error Messages:**
- Non-image file: "יש להעלות קובץ תמונה בלבד"
- File too large: "גודל הקובץ חייב להיות עד XMB"

---

## Database Validation Requirements

**Phone Uniqueness Check:**
- Query profiles table for matching phone number
- Normalize phone (remove dashes/spaces) before comparison
- Return true if phone exists (unavailable), false if available
- In mock mode: always return false (available)

**Email Uniqueness Check:**
- Query profiles table for matching email (case-insensitive)
- Return true if email exists (unavailable), false if available
- In mock mode: always return false (available)

---

## Image Upload Requirements

**Storage Location:** Supabase Storage bucket named "clinic-assets"

**File Organization:**
- Logo: `{clinic_id}/logo.{extension}`
- Cover: `{clinic_id}/cover.{extension}`
- Gallery: `{clinic_id}/gallery/{index}.{extension}`

**Upload Flow:**
1. Store File objects in form state during signup
2. Generate preview URLs using `URL.createObjectURL()` for display
3. On final submission, upload all images to Supabase Storage
4. Get public URLs for uploaded files
5. Store URLs in clinic_profiles record

---

## Flow Completion Sequence

After step 7 "סיום והפעלת העמוד" button click:

1. Create user account in Supabase Auth with email/password
2. Create profile record with phone number
3. Upload images to Supabase Storage and get URLs
4. Create clinic_profiles record with:
   - Business name, phone, address, city
   - Business types array
   - Operating hours array
   - Image URLs (logo, cover, gallery)
   - Tagline
   - Generated slug
5. Create service records in services table
6. Show success toast: "החשבון נוצר בהצלחה!"
7. Redirect to `/c/{slug}` (clinic landing page)

---

## Progress Indicator

Update the step indicator component to show 7 steps with these icons:
1. Phone icon
2. Mail icon
3. Building icon
4. Grid icon
5. Clock icon
6. Scissors icon
7. Globe icon

Show progress bar that fills proportionally based on current step.

---

## Files to Create

| File | Purpose |
|------|---------|
| `components/auth/PhoneStep.tsx` | Step 1 component |
| `components/auth/CredentialsStep.tsx` | Step 2 component |
| `components/auth/BusinessInfoStep.tsx` | Step 3 component |
| `components/auth/BusinessTypeStep.tsx` | Step 4 component |
| `components/auth/BusinessHoursStep.tsx` | Step 5 component |
| `components/auth/ServicesStep.tsx` | Step 6 component |
| `components/auth/LandingSetupStep.tsx` | Step 7 component |

## Files to Modify

| File | Changes |
|------|---------|
| `pages/Signup.tsx` | Complete rewrite with new 7-step structure |
| `components/auth/types.ts` | Add new types for business types, day schedules, service inputs |
| `components/auth/index.ts` | Export new step components |
| `components/auth/SignupStepIndicator.tsx` | Update for 7 steps with new icons |
| `components/auth/SignupPreview.tsx` | Update to display uploaded media |
| `lib/supabase.ts` | Add phone check, email check, and image upload functions |
| `lib/validation.ts` | Add image file validation helper |
| `contexts/AuthContext.tsx` | Update signUp function to handle new data structure |

---

## Database Schema Updates

**profiles table:**
- Add `phone` column (VARCHAR, unique constraint)

**clinic_profiles table:**
- Add `business_types` column (JSONB array)
- Add `operating_hours` column (JSONB array)
- Add `logo_url` column (TEXT)
- Add `cover_url` column (TEXT)
- Add `gallery_urls` column (JSONB array)
- Add `tagline` column (TEXT)

**Supabase Storage:**
- Create "clinic-assets" bucket with public read access
- Add upload policy for authenticated users

---

## Existing Patterns to Reuse

| Pattern | Source File | Usage |
|---------|-------------|-------|
| Form inputs and buttons | `components/ui.tsx` | All form elements |
| Class merging utility | `components/ui.tsx` (`cn()`) | Conditional styling |
| Phone validation | `lib/validation.ts` | Steps 1 and 3 |
| Email validation | `lib/validation.ts` | Step 2 |
| Password validation | `lib/validation.ts` | Step 2 |
| Toast notifications | sonner (installed) | Error/success feedback |
| Switch component | `components/ui.tsx` | Step 5 day toggles |
| Card component | `components/ui.tsx` | Step 4 type selector |
| RTL layout conventions | Existing components | All steps |

---

## RTL/Hebrew Considerations

- All visible text in Hebrew
- Email and password inputs use LTR direction with left-aligned text
- Phone inputs can remain RTL
- Use `ml-*` classes for left margins (reversed in RTL)
- Navigation: "חזרה" (back) button on right, "המשך" (continue) on left
- Directional icons should rotate 180° for RTL context

---

## Error Handling

**Toast Messages (via sonner):**
- Phone exists: "יש בעיה עם מספר הטלפון הזה"
- Email exists: "יש בעיה עם כתובת האימייל הזו"
- No business type selected: "יש לבחור לפחות סוג עסק אחד"
- No active day: "יש לבחור לפחות יום פעילות אחד"
- No services: "יש להוסיף לפחות שירות אחד"
- Invalid image file: "יש להעלות קובץ תמונה בלבד"
- Image too large: "גודל הקובץ חייב להיות עד XMB"
- Signup error: "אירעה שגיאה ביצירת החשבון"
- Success: "החשבון נוצר בהצלחה!"

**Field Error Display:**
- Show inline error message below the relevant input field
- Use red text color for error messages
- Clear error when user starts typing in that field

---

## Summary

This specification provides all the requirements needed to implement the complete 7-step signup flow:

1. **Phone** - Collect and validate phone number uniqueness
2. **Credentials** - Collect email/password with validation
3. **Business Info** - Collect business details
4. **Business Type** - Visual category selection (max 3)
5. **Business Hours** - Weekly schedule configuration
6. **Services** - Initial service catalog setup
7. **Landing Page** - Media uploads and final preview

The flow follows existing codebase patterns and conventions while introducing new functionality for a complete business onboarding experience.
