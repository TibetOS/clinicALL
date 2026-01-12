# PatientList Page Production Review

## Summary

Production readiness review for `pages/admin/PatientList.tsx` and related hooks.

**Files Reviewed:**
- `pages/admin/PatientList.tsx` (1110 lines)
- `hooks/usePatients.ts` (309 lines)
- `hooks/useHealthTokens.ts` (389 lines)

## Issues Found

### 1. CRITICAL: Multi-tenant Security Vulnerabilities

**Location:** `hooks/usePatients.ts` lines 248-253, 275-278

The `updatePatient` and `deletePatient` functions do NOT filter by `clinic_id`, allowing potential cross-tenant operations:

```typescript
// VULNERABLE - No clinic_id filter on update (lines 248-253)
const { data, error: updateError } = await supabase
  .from('patients')
  .update(dbUpdates)
  .eq('id', id)  // Missing: .eq('clinic_id', profile?.clinic_id)
  .select()
  .single();

// VULNERABLE - No clinic_id filter on delete (lines 275-278)
const { error: deleteError } = await supabase
  .from('patients')
  .delete()
  .eq('id', id);  // Missing: .eq('clinic_id', profile?.clinic_id)
```

**Risk:** A malicious user could potentially update or delete patients belonging to other clinics by guessing patient IDs.

**Fix:** Add `clinic_id` filter to both operations.

---

### 2. CRITICAL: Multi-tenant Security in Health Tokens

**Location:** `hooks/useHealthTokens.ts` lines 306-309, 331-334

The `markTokenAsUsed` and `deleteToken` functions do NOT filter by `clinic_id`:

```typescript
// VULNERABLE - No clinic_id filter on markAsUsed (lines 306-309)
const { error: updateError } = await supabase
  .from('health_declaration_tokens')
  .update({ status: 'used', used_at: usedAt })
  .eq('id', tokenId);  // Missing: .eq('clinic_id', profile?.clinic_id)

// VULNERABLE - No clinic_id filter on delete (lines 331-334)
const { error: deleteError } = await supabase
  .from('health_declaration_tokens')
  .delete()
  .eq('id', tokenId);  // Missing: .eq('clinic_id', profile?.clinic_id)
```

**Risk:** A malicious user could potentially mark or delete tokens belonging to other clinics.

**Fix:** Add `clinic_id` filter to both operations.

---

### 3. MEDIUM: CSV Injection Vulnerability

**Location:** `pages/admin/PatientList.tsx` lines 98-120

The `exportToCSV` function does not sanitize data for CSV injection attacks:

```typescript
const exportToCSV = (patients: Patient[], filename: string) => {
  const rows = patients.map(p => [
    p.name,    // Could contain =, +, -, @ which execute formulas
    p.phone,
    p.email,   // Could contain =HYPERLINK(...) or similar
    // ...
  ]);
```

**Risk:** If patient names or emails contain characters like `=`, `+`, `-`, `@`, they could execute formulas when the CSV is opened in Excel.

**Example Attack:** A patient name like `=cmd|'/C calc'!A0` could execute commands on Windows.

**Fix:** Sanitize CSV values by escaping or prefixing dangerous characters.

---

### 4. MEDIUM: Form Accessibility Issues

**Location:** Multiple dialogs in `pages/admin/PatientList.tsx`

Labels are not properly associated with their form inputs using `htmlFor`:

- Add Patient Dialog (lines 787-829)
- Health Declaration Dialog (lines 964-992)
- Filter Dialog (lines 878-930)

**Impact:** Screen reader users cannot navigate forms properly, and clicking labels doesn't focus inputs.

**Fix:** Add `id` attributes to inputs and `htmlFor` attributes to labels.

---

## Verified Working Features

The following production requirements are already met:

| Feature | Status | Location |
|---------|--------|----------|
| Error banner with retry | ✅ | Lines 371-379 |
| Loading skeletons (desktop) | ✅ | Lines 471-492 |
| Loading skeletons (mobile) | ✅ | Lines 627-653 |
| Empty states with actions | ✅ | Lines 495-516, 656-674 |
| Tabnabbing protection | ✅ | Lines 329-330, 336-337 |
| Debounced search | ✅ | Lines 144-147 |
| Pagination support | ✅ | Lines 751-780 |
| Multi-select with bulk operations | ✅ | Lines 204-251 |
| Delete confirmation dialog | ✅ | Lines 1079-1106 |

---

## Security Checklist

| Item | Status |
|------|--------|
| Multi-tenant isolation (fetch) | ✅ |
| Multi-tenant isolation (update) | ❌ Fix needed |
| Multi-tenant isolation (delete) | ❌ Fix needed |
| Token security (create) | ✅ |
| Token security (delete) | ❌ Fix needed |
| Tabnabbing protection | ✅ |
| CSV injection protection | ❌ Fix needed |
| Rate limiting (token creation) | ✅ |
| Form input sanitization | ✅ |

---

## Fixes Applied

1. ✅ Added `clinic_id` filter to `updatePatient` in `usePatients.ts`
2. ✅ Added `clinic_id` filter to `deletePatient` in `usePatients.ts`
3. ✅ Added `clinic_id` filter to `markTokenAsUsed` in `useHealthTokens.ts`
4. ✅ Added `clinic_id` filter to `deleteToken` in `useHealthTokens.ts`
5. ✅ Added CSV sanitization to `exportToCSV` function
6. ✅ Fixed form accessibility with proper `id` and `htmlFor` attributes

---

## Testing Notes

After applying fixes:
1. Run `pnpm build` to verify no TypeScript errors
2. Test patient CRUD operations in dev mode
3. Test CSV export with special characters
4. Test health declaration token flow
5. Verify form labels are clickable and focusable
