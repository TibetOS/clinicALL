# Contexts Directory

This directory contains React contexts for global state management.

## Files

| File | Description |
|------|-------------|
| `AuthContext.tsx` | Authentication state and methods |

## AuthContext

Provides authentication state and methods throughout the application.

### Usage

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, profile, loading, signIn, signOut } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <LoginPrompt />;

  return <div>Welcome, {profile?.full_name}</div>;
}
```

### Provided Values

| Value | Type | Description |
|-------|------|-------------|
| `user` | `User \| null` | Supabase user object |
| `profile` | `UserProfile \| null` | Extended user profile with role |
| `session` | `Session \| null` | Current auth session |
| `loading` | `boolean` | Auth initialization state |
| `isConfigured` | `boolean` | Whether Supabase is configured |
| `signIn` | `(email, password) => Promise` | Login method |
| `signUp` | `(data: SignUpData) => Promise` | Registration method |
| `signOut` | `() => Promise` | Logout method |
| `resetPassword` | `(email) => Promise` | Password reset email |
| `updatePassword` | `(newPassword) => Promise` | Update password |

### UserProfile Type

```tsx
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'admin' | 'staff' | 'client';
  clinic_id: string;
  avatar_url?: string;
}
```

### Mock Mode

When Supabase is not configured (`!isSupabaseConfigured()`), the auth context provides mock functionality:
- `signIn` creates a mock user with `owner` role
- Other auth methods return configuration errors

### Adding New Contexts

If you need to add a new context:

1. Create a new file in this directory (e.g., `ThemeContext.tsx`)
2. Follow the same pattern as `AuthContext.tsx`:
   - Create the context with `createContext`
   - Create a Provider component
   - Create a custom hook (e.g., `useTheme`)
   - Handle mock mode if applicable

```tsx
const MyContext = createContext<MyContextType | undefined>(undefined);

export function MyProvider({ children }: { children: ReactNode }) {
  // State and logic here
  return (
    <MyContext.Provider value={...}>
      {children}
    </MyContext.Provider>
  );
}

export const useMyContext = () => {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error('useMyContext must be used within a MyProvider');
  }
  return context;
};
```

## Security Notes

- Profile data includes `clinic_id` for multi-tenant isolation
- Role checking should use `profile.role`, not custom claims
- Auth initialization has a 5-second timeout to prevent infinite loading
