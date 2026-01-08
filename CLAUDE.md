# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClinicALL is an aesthetic clinic management system built with React 19, TypeScript, and Vite. It's an RTL (Hebrew) application featuring:
- **Supabase** backend for authentication and data persistence
- **Google Gemini AI** for AI assistant features
- Multi-tenant clinic support with public landing pages
- Token-based health declaration system

The app was originally created with Google AI Studio.

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
- User roles: `owner`, `admin`, `staff`, `client`

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
const Dashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.Dashboard })));
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
