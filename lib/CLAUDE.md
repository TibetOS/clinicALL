# Lib Directory

This directory contains utility libraries and external service configurations.

## Files

| File | Description |
|------|-------------|
| `supabase.ts` | Supabase client configuration |

## Supabase Client (`supabase.ts`)

Configures and exports the Supabase client for database and authentication.

### Exports

```tsx
import { supabase, isSupabaseConfigured } from '../lib/supabase';
```

| Export | Description |
|--------|-------------|
| `supabase` | Configured Supabase client instance |
| `isSupabaseConfigured()` | Returns `true` if environment variables are set |

### Environment Variables

Required in `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Configuration Options

```tsx
{
  auth: {
    persistSession: true,      // Save session to localStorage
    autoRefreshToken: true,    // Automatically refresh expired tokens
    detectSessionInUrl: true,  // Handle OAuth redirects
  }
}
```

### Mock Mode

When environment variables are missing:
- Console warning is logged
- Client is created with placeholder values
- App falls back to mock data from `data.ts`
- Use `isSupabaseConfigured()` to detect this state

### Usage Pattern

```tsx
import { supabase, isSupabaseConfigured } from '../lib/supabase';

if (!isSupabaseConfigured()) {
  // Use mock data
  return MOCK_DATA;
}

// Use real Supabase
const { data, error } = await supabase
  .from('table')
  .select('*');
```

## Adding New Libraries

If you need to add a new utility library:

1. Create a new file in this directory (e.g., `gemini.ts`, `analytics.ts`)
2. Follow the same pattern:
   - Check for required environment variables
   - Provide a configuration check function
   - Log warnings for missing configuration
   - Allow app to function in degraded mode if possible

### Example: Adding a New Service

```tsx
// lib/newservice.ts
const apiKey = import.meta.env.VITE_NEWSERVICE_KEY;

if (!apiKey) {
  console.warn('Missing VITE_NEWSERVICE_KEY. Service will be disabled.');
}

export const newServiceClient = createClient(apiKey || 'placeholder');

export const isNewServiceConfigured = () => !!apiKey;
```

## Security Notes

- Never import `supabase` directly in components—use hooks instead
- The anon key is safe to expose (RLS policies protect data)
- Use `supabase.auth` methods for authentication operations
- All database operations should go through hooks in `hooks/`
