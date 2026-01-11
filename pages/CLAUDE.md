# Pages Directory

This directory contains route-level components that correspond to application URLs.

## Files

| File | Description | Route |
|------|-------------|-------|
| `Public.tsx` | Landing page | `/` |
| `Pricing.tsx` | Pricing page | `/pricing` |
| `ClinicLanding.tsx` | Public clinic page | `/c/:slug` |
| `Booking.tsx` | Booking flow | `/book/:clinicId` |
| `PatientDetails.tsx` | Patient detail view | `/admin/patients/:id` |

## Subdirectories

| Directory | Description |
|-----------|-------------|
| `admin/` | Admin dashboard pages (lazy loaded) |

## Route Structure

```
/                     → Public.tsx (landing)
/pricing              → Pricing.tsx
/login, /signup       → Auth pages (in App.tsx)
/reset-password       → Password reset
/c/:slug              → ClinicLanding.tsx (public clinic pages)
/book/:clinicId       → Booking.tsx
/health/:token        → Health declaration (token access)
/health               → Health declaration (generic)
/locked               → Lock screen
/admin/*              → Admin pages (protected, see admin/CLAUDE.md)
```

## Page Patterns

### Public Pages

No authentication required:

```tsx
export function PublicPage() {
  const { slug } = useParams();
  // Fetch public data, render content
}
```

### Protected Pages

Wrapped with `ProtectedRoute` in `App.tsx`:

```tsx
<Route path="/admin/*" element={
  <ProtectedRoute>
    <AdminLayout>
      {/* Admin routes */}
    </AdminLayout>
  </ProtectedRoute>
}/>
```

### Token-Based Pages

For unauthenticated access with security tokens:

```tsx
export function TokenPage() {
  const { token } = useParams();
  // Validate token, show form
}
```

## RTL Considerations

All pages are Hebrew-first (RTL):

- Use `ml-*` instead of `mr-*` for spacing
- Text alignment defaults to right
- Icons/arrows may need `rtl:rotate-180`
- Use translation helpers for status labels

## Adding New Pages

1. Create component in `pages/` or `pages/admin/`
2. Add route in `App.tsx`
3. For admin pages:
   - Use lazy loading: `lazy(() => import('./pages/admin/NewPage'))`
   - Export from `pages/admin/index.ts`
   - Wrap with `Suspense`
4. Use existing hooks for data fetching
5. Use UI components from `components/ui.tsx`

### Example: New Admin Page

```tsx
// pages/admin/Reports.tsx
import { usePatients, useAppointments } from '../../hooks';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui';

export function Reports() {
  const { patients } = usePatients();
  const { appointments } = useAppointments();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">דוחות</h1>
      <Card>
        <CardHeader>
          <CardTitle>סיכום</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Report content */}
        </CardContent>
      </Card>
    </div>
  );
}
```

Then in `App.tsx`:

```tsx
const Reports = lazy(() => import('./pages/admin/Reports').then(m => ({ default: m.Reports })));

// In routes:
<Route path="reports" element={<Reports />} />
```

## Dependencies

- `react-router-dom` - `useParams`, `useNavigate`, `Link`
- `../hooks` - Data fetching hooks
- `../components/ui` - UI components
- `../contexts/AuthContext` - `useAuth()` for user/role
- `lucide-react` - Icons
