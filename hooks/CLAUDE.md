# Hooks Directory

This directory contains custom React hooks for data fetching and state management.

## Files

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all hooks |
| `usePatients.ts` | Patient CRUD operations |
| `useAppointments.ts` | Appointment management |
| `useServices.ts` | Service/treatment catalog |
| `useClinic.ts` | Clinic profile data |
| `useInventory.ts` | Inventory management |
| `useLeads.ts` | Lead/CRM tracking |
| `useInvoices.ts` | Invoice management |
| `useCampaigns.ts` | Marketing campaigns |
| `useClinicalNotes.ts` | Clinical documentation |
| `useDeclarations.ts` | Health declarations |
| `useNotifications.ts` | In-app notifications |
| `useStaff.ts` | Staff management |
| `useBooking.ts` | Public booking flow |
| `useHealthTokens.ts` | Token-based health declaration system |
| `useActivityLog.ts` | Activity logging for audit trail |
| `useSessionTimeout.ts` | HIPAA-compliant session timeout |
| `useDialogState.ts` | Dialog/modal state management |

## Hook Pattern

All hooks follow a consistent pattern:

```tsx
export function useResource(): UseResource {
  const [data, setData] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchData = useCallback(async () => {
    // 1. Always check for mock mode first
    if (!isSupabaseConfigured()) {
      setData(MOCK_DATA);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('table_name')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 2. Transform snake_case to camelCase
      const transformed = data.map(item => ({
        id: item.id,
        clinicId: item.clinic_id,
        createdAt: item.created_at,
      }));

      setData(transformed);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, fetchData, /* CRUD methods */ };
}
```

## Key Rules

### 1. Always Support Mock Mode

```tsx
if (!isSupabaseConfigured()) {
  return MOCK_DATA; // from data.ts
}
```

### 2. Transform Database Fields

Database uses `snake_case`, app uses `camelCase`:

```tsx
// DB → App
const item = {
  clinicId: data.clinic_id,
  lastName: data.last_name,
  createdAt: data.created_at,
};

// App → DB
const dbRecord = {
  clinic_id: item.clinicId,
  last_name: item.lastName,
};
```

### 3. Use clinic_id for Multi-Tenancy

```tsx
const { profile } = useAuth();
// ...
.insert({
  clinic_id: profile?.clinic_id,
  // other fields
})
```

### 4. Export from index.ts

When creating a new hook, add it to `hooks/index.ts`:

```tsx
export { useNewHook } from './useNewHook';
```

## Adding a New Hook

1. Create file: `hooks/useNewResource.ts`
2. Define interface: `interface UseNewResource { ... }`
3. Implement hook following the pattern above
4. Add mock data to `data.ts`
5. Export from `hooks/index.ts`
6. Add type definitions to `types.ts` if needed

## Common Operations

### CRUD Pattern

```tsx
// Fetch all
const { data, error } = await supabase.from('table').select('*');

// Fetch one
const { data, error } = await supabase.from('table').select('*').eq('id', id).single();

// Insert
const { data, error } = await supabase.from('table').insert({ ... }).select().single();

// Update
const { data, error } = await supabase.from('table').update({ ... }).eq('id', id).select().single();

// Delete
const { error } = await supabase.from('table').delete().eq('id', id);
```

## useDialogState Hook

A utility hook for managing dialog/modal open state, reducing boilerplate in admin pages.

### Basic Usage

```tsx
import { useDialogState } from '../hooks';

function MyPage() {
  const addDialog = useDialogState();

  return (
    <>
      <Button onClick={addDialog.open}>Add Item</Button>
      <Dialog open={addDialog.isOpen} onClose={addDialog.close} title="Add">
        {/* Form content */}
      </Dialog>
    </>
  );
}
```

### With Associated Data

```tsx
const editDialog = useDialogState<Service>();

// Open with data
<Button onClick={() => editDialog.openWith(service)}>Edit</Button>

// Access data in dialog
<Dialog open={editDialog.isOpen} onClose={editDialog.close}>
  {editDialog.data && <EditForm service={editDialog.data} />}
</Dialog>
```

### API

| Property/Method | Description |
|-----------------|-------------|
| `isOpen` | Whether dialog is open |
| `data` | Associated data (when using generic type) |
| `open()` | Open the dialog |
| `openWith(data)` | Open with associated data |
| `close()` | Close and clear data |
| `toggle()` | Toggle open/closed |

## Dependencies

- `@supabase/supabase-js` - Database client
- `../lib/supabase` - Configured client and `isSupabaseConfigured()`
- `../contexts/AuthContext` - `useAuth()` for `profile.clinic_id`
- `../types` - TypeScript interfaces
- `../data` - Mock data constants
