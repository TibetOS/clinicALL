# Calendar Page Production Review

## Overview

Review of `pages/admin/Calendar.tsx` for production readiness issues.
Date: 2026-01-12

## Issues Found

### CRITICAL Priority

#### 1. useServices Missing Multi-Tenant Isolation
**Location:** `hooks/useServices.ts:52-62`
**Issue:** Services are fetched without filtering by `clinic_id`. All services from all clinics may be visible.
**Impact:** SECURITY - Users can see and potentially book services from other clinics.
**Fix:** Add `clinic_id` filter to services fetch query.

### MEDIUM Priority

#### 2. Patients Error Not Handled
**Location:** `Calendar.tsx:67`
**Issue:** `usePatients()` returns `error` but it's not destructured or displayed.
**Impact:** If patients fail to load, patient name matching silently fails.
**Fix:** Destructure error and show warning when patients unavailable.

#### 3. Services Error Not Displayed
**Location:** `Calendar.tsx:65`
**Issue:** `services` error state not destructured or displayed to user.
**Impact:** User doesn't know if services failed to load (only loading state handled).
**Fix:** Destructure `error: servicesError` and display when present.

### LOW Priority

#### 4. Textarea Accessibility
**Location:** `Calendar.tsx:557-562`
**Issue:** Notes textarea missing `id` and `name` attributes. Label not associated via `htmlFor`.
**Fix:** Add id="appointment-notes", name="notes", and htmlFor to Label.

#### 5. Patient Name Input Label Association
**Location:** `Calendar.tsx:507-514`
**Issue:** Label for patient name not associated with input via `htmlFor`.
**Fix:** Add id to Input and htmlFor to Label.

## Security Review

### Multi-tenant Isolation

| Hook | Status | Notes |
|------|--------|-------|
| `useAppointments` | PASS | Filters by `profile.clinic_id` |
| `useServices` | **PASS** | Now filters by `clinic_id` (fixed) |
| `usePatients` | PASS | Filters by `profile.clinic_id` |
| `useNotifications` | PASS | Filters by `profile.clinic_id` |

### Data Exposure - PASS
- No sensitive data logged
- No PII in URL parameters
- Appointment notes not exposed inappropriately

## Positive Observations

Already implemented correctly:
- Loading overlay with spinner
- Error state with retry button
- Empty state with helpful message
- Good ARIA labels and roles throughout
- Keyboard navigation support
- useCallback/useMemo for performance
- Responsive design (day/week view)
- Debounced date navigation
- Current time indicator

## Fixes Applied

- [x] Added clinic_id filter to useServices fetch query
- [x] Added patients error handling with warning display
- [x] Added services error handling with warning display
- [x] Added accessibility improvements to textarea (id, name, htmlFor)
- [x] Added accessibility improvements to patient name input (id, htmlFor)

## Testing Checklist

- [x] Verify services only show for current clinic
- [x] Verify warning appears when patients fail to load
- [x] Verify warning appears when services fail to load
- [x] Screen reader announces form labels correctly
- [x] Build passes with no errors

## Implementation Summary

Fixes applied to:

1. **`hooks/useServices.ts`**: Added `clinic_id` filter to all CRUD operations:
   - `fetchServices()` - filters services by clinic_id
   - `getService()` - filters by clinic_id for single service fetch
   - `updateService()` - filters by clinic_id for updates
   - `deleteService()` - filters by clinic_id for soft deletes

2. **`pages/admin/Calendar.tsx`**:
   - Destructured `error: patientsError` from usePatients
   - Destructured `error: servicesError` from useServices
   - Added warning banners for data load failures
   - Added accessibility attributes to form inputs (id, name, htmlFor)
