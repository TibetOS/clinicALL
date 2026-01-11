# Admin Pages Directory

This directory contains admin dashboard pages, all lazy-loaded for performance.

## Files

| File | Description | Route |
|------|-------------|-------|
| `index.ts` | Re-exports all admin pages |  |
| `Dashboard.tsx` | Main dashboard with stats | `/admin/dashboard` |
| `PatientList.tsx` | Patient management | `/admin/patients` |
| `Calendar.tsx` | Appointment calendar | `/admin/calendar` |
| `Services.tsx` | Services & pricing management | `/admin/services` |
| `Inventory.tsx` | Inventory management | `/admin/inventory` |
| `SettingsPage.tsx` | Clinic settings | `/admin/settings` |

## Route Structure

All routes are under `/admin/*` and protected by `ProtectedRoute`:

```
/admin/dashboard      → Dashboard.tsx
/admin/patients       → PatientList.tsx
/admin/patients/:id   → PatientDetails.tsx (in pages/)
/admin/calendar       → Calendar.tsx
/admin/services       → Services.tsx
/admin/inventory      → Inventory.tsx
/admin/settings       → SettingsPage.tsx
/admin/settings?tab=billing → Billing tab
```

## Lazy Loading

All admin pages must be lazy-loaded in `App.tsx`:

```tsx
const Dashboard = lazy(() =>
  import('./pages/admin/Dashboard').then(m => ({ default: m.Dashboard }))
);

// In routes:
<Suspense fallback={<LoadingSpinner />}>
  <Route path="dashboard" element={<Dashboard />} />
</Suspense>
```

## Page Structure Pattern

```tsx
import { useState } from 'react';
import { usePatients, useAppointments } from '../../hooks';
import { Card, Button, Badge, Dialog } from '../../components/ui';
import { Plus, Search } from 'lucide-react';

export function AdminPage() {
  const { data, loading, error } = useHook();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      {/* Header with title and actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">כותרת העמוד</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          הוסף חדש
        </Button>
      </div>

      {/* Content */}
      <Card>
        {/* Table or grid */}
      </Card>

      {/* Dialogs */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="כותרת">
        {/* Form content */}
      </Dialog>
    </div>
  );
}
```

## Hebrew Status Labels

Use translation helpers for status labels:

```tsx
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    scheduled: 'מתוכנן',
    confirmed: 'מאושר',
    completed: 'הושלם',
    cancelled: 'בוטל',
    pending: 'ממתין',
  };
  return labels[status] || status;
};

const getStatusVariant = (status: string) => {
  const variants: Record<string, 'success' | 'warning' | 'destructive'> = {
    completed: 'success',
    pending: 'warning',
    cancelled: 'destructive',
  };
  return variants[status] || 'default';
};
```

## Adding New Admin Pages

1. Create component in `pages/admin/`
2. Export from `pages/admin/index.ts`:
   ```tsx
   export { NewPage } from './NewPage';
   ```
3. Add lazy import in `App.tsx`:
   ```tsx
   const NewPage = lazy(() =>
     import('./pages/admin/NewPage').then(m => ({ default: m.NewPage }))
   );
   ```
4. Add route in admin section:
   ```tsx
   <Route path="new-page" element={<NewPage />} />
   ```
5. Add sidebar link in `AdminLayout` (in `App.tsx`)

## RTL Considerations

- Icon spacing: Use `ml-2` (not `mr-2`) for icons before text
- Sidebar is on the right
- Tables scroll left-to-right
- Use `text-right` for aligned content

## AdminLayout

The `AdminLayout` component (defined in `App.tsx`) provides:

- RTL sidebar navigation on the right
- Header with user info and logout
- Main content area
- Responsive design (sidebar collapses on mobile)

## Dependencies

- `../../hooks` - Data fetching (usePatients, useAppointments, etc.)
- `../../components/ui` - UI components
- `../../contexts/AuthContext` - useAuth() for user/role
- `lucide-react` - Icons
- `recharts` - Charts (Dashboard only)
