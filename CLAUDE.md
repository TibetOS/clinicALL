# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClinicALL is an aesthetic clinic management system built with React 19, TypeScript, and Vite. It's an RTL (Hebrew) application featuring:

- **Supabase** backend for authentication and data persistence
- **Google Gemini AI** for AI assistant features
- Multi-tenant clinic support with public landing pages
- Token-based health declaration system

The app was originally created with Google AI Studio.

- Always keep files organized and documented in their respective directories.
- Always keep files, functions and components under 500 lines for maintainability.
- Always keep code idiomatic and consistent with existing patterns.
- DO NOT REPEAT YOURSELF - reuse existing components, hooks, and types wherever possible.

## Development Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server on port 3000
pnpm build            # Production build
pnpm preview          # Preview production build
```

## Environment Setup

Create `.env.local` with:

```
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Note: The app works in mock mode without Supabase credentials (uses `data.ts` mock data).

## Architecture

### Routing (BrowserRouter)

- `/` - Landing page (public)
- `/pricing` - Pricing page
- `/login`, `/signup` - Auth pages
- `/reset-password` - Password reset flow
- `/c/:slug` - Public clinic landing page (e.g., `/c/dr-sarah`)
- `/book/:clinicId` - Booking flow
- `/health/:token` - Health declaration form (token-based access)
- `/health` - Health declaration form (generic)
- `/locked` - Lock screen
- `/admin/*` - Admin dashboard (protected, wrapped in `AdminLayout`)
  - `/admin/dashboard` - Main dashboard
  - `/admin/patients` - Patient list
  - `/admin/patients/:id` - Patient details
  - `/admin/calendar` - Appointment calendar
  - `/admin/services` - Services & pricing
  - `/admin/inventory` - Inventory management
  - `/admin/settings` - Clinic settings (with `?tab=billing` for billing)

### Key Directories

- `components/` - Reusable UI components
- `pages/` - Route-level components
- `pages/admin/` - Admin dashboard pages (lazy loaded)
- `hooks/` - Custom React hooks for data fetching
- `contexts/` - React contexts (AuthContext)
- `lib/` - Utility libraries (Supabase client)
- `types.ts` - All TypeScript interfaces
- `data.ts` - Mock data fallback

### Components (`components/ui.tsx`)

- `Button` - With variants (primary, secondary, ghost, destructive, outline) and loading state
- `Input` - Form input with consistent styling
- `Label` - Form label
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` - Card components
- `Badge` - Status badges with variants
- `Dialog` - Modal dialog
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` - Tab navigation
- `Switch` - Toggle switch
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` - Custom select
- `Checkbox` - Checkbox input
- `Textarea` - Multi-line input
- `Breadcrumb` - Navigation breadcrumb
- `cn()` - Class merging utility (clsx + tailwind-merge)

### Special Components

- `FaceMap` - SVG-based injectable face diagram for clinical notes
- `AdminLayout` - Dashboard shell with RTL sidebar navigation (defined in `App.tsx`)
- `ProtectedRoute` - Auth guard for protected routes
- `ImageSlider` - Image carousel component

### Custom Hooks (`hooks/`)

Data fetching hooks with Supabase integration and mock fallback:

- `usePatients` - Patient CRUD operations
- `useAppointments` - Appointment management
- `useServices` - Service/treatment catalog
- `useClinic` - Clinic profile data
- `useInventory` - Inventory management
- `useLeads` - Lead/CRM tracking
- `useInvoices` - Invoice management
- `useCampaigns` - Marketing campaigns
- `useClinicalNotes` - Clinical documentation
- `useDeclarations` - Health declarations
- `useNotifications` - In-app notifications
- `useHealthTokens` - Token-based health declaration system

### Authentication (`contexts/AuthContext.tsx`)

- `AuthProvider` - Wraps app with auth state
- `useAuth()` - Hook providing: `user`, `profile`, `session`, `loading`, `signIn`, `signUp`, `signOut`, `resetPassword`, `updatePassword`, `isConfigured`
- User roles: `owner` (app owner), `admin` (clinic owner), `client` (patient)

### Styling

- Tailwind CSS via CDN (configured in `index.html`)
- Custom theme with teal primary color (`#0D9488`)
- Stone color palette for warm neutral backgrounds
- CSS variables for theming in `index.html`

### Data Flow

- **Production**: Supabase for auth and data (configured via `lib/supabase.ts`)
- **Development/Mock**: Falls back to `data.ts` when Supabase not configured
- `isSupabaseConfigured()` helper checks environment

### Code Splitting

Admin pages are lazy loaded for better performance:

```tsx
const Dashboard = lazy(() =>
  import("./pages/admin/Dashboard").then((m) => ({ default: m.Dashboard }))
);
```

### Build Optimization

Vite config includes manual chunks for vendor splitting:

- `vendor-react` - React, React DOM, React Router
- `vendor-charts` - Recharts
- `vendor-supabase` - Supabase client

## Type Definitions (`types.ts`)

Core types:

- `Patient` - Patient data with health declaration tracking
- `Appointment` - Appointments with declaration status
- `Service` - Treatment/service catalog
- `ClinicProfile` - Multi-tenant clinic configuration
- `ClinicalNote`, `InjectionPoint` - Clinical documentation
- `InventoryItem` - Stock management
- `Notification` - Actionable notifications system
- `Lead`, `Invoice`, `Campaign` - CRM/Finance/Marketing
- `HealthDeclarationToken` - Secure form access tokens
- `Declaration` - Health declaration submissions

## RTL Considerations

- App is Hebrew-first with `dir="rtl"` on root
- Font: Heebo (Hebrew) with Inter fallback
- Sidebar is on the right side
- Translation helpers like `getStatusLabel()` in `pages/admin/` components
- Use `ml-*` instead of `mr-*` for RTL spacing (reversed)

---

## Best Practices for Claude Code

### Before Making Changes

1. **Verify mock mode works**: Always test with mock data first (`data.ts`) before testing Supabase integration
2. **Check existing patterns**: Review similar hooks/components before creating new ones
3. **Read the types**: Check `types.ts` for existing interfaces before defining new ones

### Code Patterns to Follow

#### Hooks Pattern

When creating data hooks, follow the established pattern in `hooks/`:

```tsx
export function useResource(): UseResource {
  const [data, setData] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Always check isSupabaseConfigured() and fall back to mock data
  if (!isSupabaseConfigured()) {
    return MOCK_DATA;
  }

  // Transform snake_case (DB) to camelCase (app)
  // ...
}
```

#### Component Pattern

- Use existing UI components from `components/ui.tsx`
- Use `cn()` for conditional class merging
- Keep components RTL-aware (use `ml-*` instead of `mr-*`)
- Import icons from `lucide-react`

#### State Management

- Use React hooks (`useState`, `useEffect`, `useCallback`)
- Use `useAuth()` for user/session data
- No external state libraries - keep it simple

### Naming Conventions

| Context          | Convention                  | Example                        |
| ---------------- | --------------------------- | ------------------------------ |
| TypeScript types | PascalCase                  | `Patient`, `AppointmentStatus` |
| React components | PascalCase                  | `PatientList`, `AdminLayout`   |
| Hooks            | camelCase with `use` prefix | `usePatients`, `useAuth`       |
| Database columns | snake_case                  | `clinic_id`, `created_at`      |
| App properties   | camelCase                   | `clinicId`, `createdAt`        |

### Database Field Mapping

Always transform between database (snake_case) and app (camelCase):

```tsx
// DB → App
const patient: Patient = {
  id: data.id,
  clinicId: data.clinic_id, // Transform snake_case
  lastName: data.last_name,
  createdAt: data.created_at,
};

// App → DB
const dbRecord = {
  clinic_id: patient.clinicId, // Transform camelCase
  last_name: patient.lastName,
};
```

### Security Considerations

This is a **healthcare application** - handle data carefully:

1. **Patient data is PII**: Never log patient names, emails, phones, or health info
2. **Health declarations are sensitive**: Treat as confidential medical records
3. **Token security**: Health declaration tokens (`/health/:token`) provide unauthenticated access - validate expiration
4. **Role-based access**: Check user roles (`owner`, `admin`, `client`) for protected operations
5. **Input validation**: Sanitize all user inputs, especially in forms

### Testing Changes

1. **Build check**: Run `pnpm build` to catch TypeScript errors
2. **Dev server**: Run `pnpm dev` and manually test the affected routes
3. **Mock mode**: Test without Supabase credentials first
4. **RTL layout**: Verify UI looks correct in right-to-left mode

### Common Pitfalls

- **Forgetting mock fallback**: Always handle `!isSupabaseConfigured()` case in hooks
- **Wrong margin direction**: Use `ml-*` (not `mr-*`) for RTL spacing
- **Missing type exports**: Add new types to `types.ts`, not inline
- **Hardcoded Hebrew**: Keep Hebrew strings in components, but consider extraction for future i18n
- **Lazy loading admin pages**: New admin pages must use `lazy()` import in `App.tsx`

### Adding New Features

1. **New hook**: Create in `hooks/`, export from `hooks/index.ts`, follow existing pattern
2. **New type**: Add to `types.ts` with JSDoc comments
3. **New admin page**: Create in `pages/admin/`, lazy load in `App.tsx`, add route
4. **New UI component**: Add to `components/ui.tsx` with variants support
5. **Mock data**: Add corresponding mock data to `data.ts`

### File Organization

```
clinicall/
├── components/       # Reusable components (see components/CLAUDE.md)
│   └── ui.tsx       # Design system components
├── contexts/        # React contexts (see contexts/CLAUDE.md)
├── hooks/           # Data fetching hooks (see hooks/CLAUDE.md)
├── lib/             # Utilities (see lib/CLAUDE.md)
├── pages/           # Route components (see pages/CLAUDE.md)
│   └── admin/       # Admin dashboard (see pages/admin/CLAUDE.md)
├── App.tsx          # Router + AdminLayout
├── data.ts          # Mock data
├── types.ts         # TypeScript interfaces
└── index.tsx        # Entry point
```

---

## Directory-Level Documentation

Each major directory contains its own `CLAUDE.md` file with specific guidance:

| Directory      | Documentation                                          |
| -------------- | ------------------------------------------------------ |
| `components/`  | UI component patterns, variants, adding new components |
| `contexts/`    | Context patterns, AuthContext API, adding new contexts |
| `hooks/`       | Hook patterns, CRUD operations, mock mode handling     |
| `lib/`         | Library configurations, environment variables          |
| `pages/`       | Route structure, page patterns, RTL considerations     |
| `pages/admin/` | Admin page patterns, lazy loading, status labels       |

### Keeping Documentation Updated

**IMPORTANT**: When making code changes, update the relevant `CLAUDE.md` files:

1. **Adding a new component** → Update `components/CLAUDE.md`
2. **Adding a new hook** → Update `hooks/CLAUDE.md` (add to files table)
3. **Adding a new admin page** → Update `pages/admin/CLAUDE.md` (add to files table)
4. **Adding a new route** → Update `pages/CLAUDE.md` (add to route structure)
5. **Adding a new context** → Update `contexts/CLAUDE.md`
6. **Adding a new library** → Update `lib/CLAUDE.md`
7. **Changing existing patterns** → Update the relevant directory's `CLAUDE.md`

**Documentation update checklist**:

- [ ] Add new files to the files table in the directory's `CLAUDE.md`
- [ ] Update route structure if routes changed
- [ ] Add new exports/APIs to the documentation
- [ ] Update examples if patterns changed
- [ ] Update this main `CLAUDE.md` if architecture changed
