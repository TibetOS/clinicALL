# Settings Page Production Review

## Overview

Review of `pages/admin/SettingsPage.tsx` for production readiness issues.
Date: 2026-01-12

## Issues Found

### HIGH Priority

#### 1. Missing Loading State for Clinic Data
**Location:** `SettingsPage.tsx:29-33`
**Issue:** Forms render with empty values, then suddenly populate when clinic data arrives. This creates a jarring UX.
**Fix:** Add loading state check from useMyClinic and show skeleton while loading.

#### 2. Error States Not Handled
**Location:** `SettingsPage.tsx:29`
**Issue:** `useMyClinic()` returns `error` but it's not destructured or displayed.
**Impact:** Users see no feedback when clinic data fails to load.
**Fix:** Destructure error, show error alert when present.

### MEDIUM Priority

#### 3. Shared Saving State Across Tabs
**Location:** `SettingsPage.tsx:25`
**Issue:** Single `saving` state is shared across all tabs. Saving in one tab disables buttons in all tabs.
**Fix:** Use separate saving states per form or per-save-action tracking.

#### 4. Email Field Not Saved in Business Form
**Location:** `SettingsPage.tsx:102-116`
**Issue:** `businessForm.email` is collected from user but never passed to `updateClinic()`.
**Impact:** User thinks email is saved, but it's not persisted.
**Fix:** Either save email to a separate field or remove the field if not supported.

#### 5. URL Slug Validation Missing
**Location:** `SettingsPage.tsx:253-258`
**Issue:** No validation that slug contains only URL-safe characters (lowercase alphanumeric and hyphens).
**Impact:** Invalid slugs could break public clinic URLs.
**Fix:** Add validation before save, show error for invalid characters.

### LOW Priority

#### 6. Input Validation Missing
**Location:** Various form inputs
**Issue:** Phone, email, tax ID lack format validation.
**Recommendation:** Add HTML5 validation patterns or controlled validation.

#### 7. Accessibility: Color Picker
**Location:** `SettingsPage.tsx:219-227`
**Issue:** Color input lacks proper label association (uses sibling Label, not htmlFor).
**Fix:** Add id to input, htmlFor to label.

#### 8. Accessibility: Textarea
**Location:** `SettingsPage.tsx:232-237`
**Issue:** Textarea missing id and name attributes.
**Fix:** Add appropriate attributes.

## Security Review

### Multi-tenant Isolation - PASS

All hooks used in SettingsPage properly filter by `clinic_id`:

| Hook | Status | Notes |
|------|--------|-------|
| `useMyClinic` | ✅ PASS | Uses `profile.clinic_id` for fetch/update |
| `useStaff` | ✅ PASS | Receives `profile.clinic_id` as parameter |
| `usePatients` | ✅ PASS | Filters by `profile.clinic_id` |
| `useAppointments` | ✅ PASS | Filters by `profile.clinic_id` |
| `useInvoices` | ✅ PASS | Filters by `profile.clinic_id` |

### Data Exposure - PASS
- No sensitive data logged
- No PII in URL parameters
- Forms use appropriate autocomplete attributes

## Fixes Applied

- [x] Added clinic loading state with skeleton
- [x] Added error state display from useMyClinic
- [x] Split saving state per form (profileSaving, businessSaving, billingSaving)
- [x] Fixed email field (added note that email is display-only, from auth profile)
- [x] Added slug validation (URL-safe characters only)
- [x] Added accessibility improvements to color picker and textarea

## Testing Checklist

- [x] Verify skeleton shows while clinic data loads
- [x] Verify error message appears if clinic fetch fails
- [x] Test saving in profile tab doesn't affect business tab buttons
- [x] Test slug validation rejects spaces and special characters
- [x] Test slug validation accepts valid slugs (lowercase, numbers, hyphens)
- [x] Screen reader announces color picker and textarea labels

## Implementation Summary

All fixes have been applied to `SettingsPage.tsx`:

1. **Loading state**: Added `clinicLoading` check with skeleton placeholder
2. **Error state**: Added `clinicError` check with error card and retry button
3. **Per-form saving**: Split `saving` into `profileSaving`, `businessSaving`, `billingSaving`
4. **Email field**: Made read-only with note that it comes from auth profile
5. **Slug validation**: Added `isValidSlug()` function and error display
6. **Accessibility**: Added `id`, `name`, `htmlFor`, `aria-label` to color picker and textarea
