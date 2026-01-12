# Components Directory

This directory contains reusable UI components for the ClinicALL application.

## Files

| File | Description |
|------|-------------|
| `ui.tsx` | Core design system components (Button, Input, Card, Dialog, etc.) |
| `FaceMap.tsx` | SVG-based injectable face diagram for clinical notes |
| `ProtectedRoute.tsx` | Auth guard wrapper for protected routes |
| `ImageSlider.tsx` | Image carousel/slider component |
| `ui/` | shadcn/ui components directory (Radix-based) |
| `layout/` | Admin dashboard layout components (see `layout/CLAUDE.md`) |
| `ErrorBoundary.tsx` | React error boundary for graceful error handling |

## Layout Components (`layout/`)

Admin dashboard layout components including sidebar, header, and dialogs. See `layout/CLAUDE.md` for detailed documentation.

| File | Description |
|------|-------------|
| `AdminLayout.tsx` | Main layout wrapper composing sidebar, header, and dialogs |
| `AdminSidebar.tsx` | Sidebar navigation with plan widget and logout |
| `AdminHeader.tsx` | Header with menu toggle, notifications, and user profile |
| `PageLoader.tsx` | Loading spinner for lazy-loaded routes |
| `RoleProtectedPage.tsx` | Role-based access control wrapper |
| `dialogs/` | Dialog components (LogoutDialog, SessionTimeoutDialog, DeclarationShareDialog) |

### Usage

```tsx
import { AdminLayout, PageLoader, RoleProtectedPage } from './components/layout';

// In App.tsx routes:
<AdminLayout>
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="settings" element={
        <RoleProtectedPage requiredRole="owner">
          <SettingsPage />
        </RoleProtectedPage>
      } />
    </Routes>
  </Suspense>
</AdminLayout>
```

## shadcn/ui Components (`ui/`)

Comprehensive Radix UI-based components following shadcn/ui patterns:

### Primitives

| File | Description |
|------|-------------|
| `accordion.tsx` | Collapsible content sections |
| `alert.tsx` | Alert banners with variants (default, destructive) |
| `alert-dialog.tsx` | Confirmation dialogs for destructive actions |
| `aspect-ratio.tsx` | Maintain aspect ratios for images/videos |
| `avatar.tsx` | User profile images with fallback |
| `checkbox.tsx` | Checkbox input with indeterminate state |
| `collapsible.tsx` | Show/hide content sections |
| `command.tsx` | Command palette/search (cmdk-based) |
| `context-menu.tsx` | Right-click context menus |
| `dialog.tsx` | Radix-based modal dialog |
| `drawer.tsx` | Mobile-friendly bottom drawer (vaul-based) |
| `dropdown-menu.tsx` | Context menus and action dropdowns |
| `hover-card.tsx` | Preview cards on hover |
| `popover.tsx` | Floating content panels |
| `progress.tsx` | Progress bar indicator |
| `radio-group.tsx` | Radio button groups |
| `scroll-area.tsx` | Custom styled scrollbars |
| `select.tsx` | Enhanced select dropdowns |
| `separator.tsx` | Visual dividers |
| `slider.tsx` | Range slider input |
| `spinner.tsx` | Loading spinner indicator (Loader2Icon) |
| `toggle.tsx` | Toggle button |
| `toggle-group.tsx` | Group of toggle buttons |
| `tooltip.tsx` | Hover tooltips |

### Forms & Inputs

| File | Description |
|------|-------------|
| `calendar.tsx` | Date picker calendar (react-day-picker) |
| `date-picker.tsx` | Date picker with popover + DateRangePicker |
| `field.tsx` | Accessible form field composition |

### Blocks & Custom Components

| File | Description |
|------|-------------|
| `empty.tsx` | Empty state placeholder component |
| `calendar-appointment.tsx` | Full appointment calendar view (calendar-31 style) |
| `time-slot-picker.tsx` | Time slot booking interface (calendar-32 style) |
| `index.ts` | Barrel export for all shadcn/ui components |

### Usage

```tsx
// Import from ui/ directory
import { AlertDialog, AlertDialogTrigger, AlertDialogContent } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Empty } from '@/components/ui/empty';

// Or import everything from the barrel
import { AlertDialog, Tooltip, Empty } from '@/components/ui';
```

### AlertDialog Example

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">מחק מטופל</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
      <AlertDialogDescription>
        פעולה זו לא ניתנת לביטול.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>ביטול</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>מחק</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Empty State Example

```tsx
<Empty
  icon={<Users className="h-6 w-6 text-muted-foreground" />}
  title="אין מטופלים"
  description="הוסף מטופל חדש כדי להתחיל"
  action={<Button>הוסף מטופל</Button>}
/>
```

### Tooltip Example

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon">
        <HelpCircle className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>עזרה נוספת</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Alert Example

Display important messages with semantic styling:

```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

// Error alert (destructive variant)
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>שגיאה בטעינת נתונים</AlertTitle>
  <AlertDescription>לא ניתן לטעון את רשימת המטופלים. נסה שוב מאוחר יותר.</AlertDescription>
</Alert>

// Success alert (default variant)
<Alert>
  <CheckCircle2 className="h-4 w-4" />
  <AlertTitle>הצלחה</AlertTitle>
  <AlertDescription>הנתונים נשמרו בהצלחה.</AlertDescription>
</Alert>

// Info alert (default variant with different icon)
<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>שים לב</AlertTitle>
  <AlertDescription>יש להשלים את ההצהרה לפני התור.</AlertDescription>
</Alert>
```

### Spinner Example

Loading indicator for async operations:

```tsx
import { Spinner } from '@/components/ui/spinner';

// Default size (size-4)
<Spinner />

// Larger spinner for loading states
<div className="flex items-center justify-center py-8">
  <Spinner className="size-8" />
</div>

// With loading text
<div className="flex items-center gap-2">
  <Spinner className="size-4" />
  <span>טוען...</span>
</div>
```

### Card with Subcomponents Example

Structured card layout with semantic sections:

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <CalendarIcon className="h-5 w-5 text-teal-500" />
      התור הבא
    </CardTitle>
    <CardDescription>פרטי התור הקרוב שלך</CardDescription>
    <CardAction>
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <p className="font-medium">בוטוקס - אזור מצח</p>
      <p className="text-sm text-muted-foreground">יום ראשון, 15 בינואר 2024 בשעה 10:00</p>
    </div>
  </CardContent>
  <CardFooter>
    <Button variant="outline" className="w-full">צפה בפרטים</Button>
  </CardFooter>
</Card>

// Loading state with Spinner
<Card>
  <CardHeader>
    <CardTitle>התור הבא</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex items-center justify-center py-8">
      <Spinner className="size-8" />
    </div>
  </CardContent>
</Card>
```

### Field Example

Compose accessible form fields with automatic label-input association and error handling:

```tsx
import { Field, FieldLabel, FieldControl, FieldDescription, FieldError, Fieldset } from '@/components/ui/field';

// Basic field with label and help text
<Field>
  <FieldLabel required>אימייל</FieldLabel>
  <FieldControl>
    <Input type="email" placeholder="name@example.com" />
  </FieldControl>
  <FieldDescription>נשתמש באימייל זה ליצירת קשר</FieldDescription>
</Field>

// Field with error
<Field error="שדה חובה">
  <FieldLabel required>שם מלא</FieldLabel>
  <FieldControl>
    <Input />
  </FieldControl>
</Field>

// Grouped fields with Fieldset
<Fieldset legend="פרטים אישיים">
  <Field>
    <FieldLabel>שם פרטי</FieldLabel>
    <FieldControl>
      <Input />
    </FieldControl>
  </Field>
  <Field>
    <FieldLabel>שם משפחה</FieldLabel>
    <FieldControl>
      <Input />
    </FieldControl>
  </Field>
</Fieldset>
```

### Calendar Appointment Example

Full week view calendar for scheduling:

```tsx
import { CalendarAppointment, Appointment } from '@/components/ui/calendar-appointment';

const appointments: Appointment[] = [
  {
    id: '1',
    title: 'בוטוקס',
    start: new Date(2024, 0, 15, 10, 0),
    end: new Date(2024, 0, 15, 10, 30),
    patientName: 'דנה כהן',
    status: 'confirmed',
  },
];

<CalendarAppointment
  appointments={appointments}
  onAppointmentClick={(apt) => console.log(apt)}
  onTimeSlotClick={(date, hour) => console.log(date, hour)}
/>
```

### Time Slot Picker Example

Compact booking interface:

```tsx
import { TimeSlotPicker } from '@/components/ui/time-slot-picker';

<TimeSlotPicker
  selectedDate={new Date()}
  selectedTime="10:00"
  onDateSelect={(date) => setDate(date)}
  onTimeSelect={(time) => setTime(time)}
  disablePastDates
/>
```

### Dependencies

**Radix UI Primitives:**
- `@radix-ui/react-accordion` - Accordion
- `@radix-ui/react-alert-dialog` - AlertDialog
- `@radix-ui/react-aspect-ratio` - AspectRatio
- `@radix-ui/react-avatar` - Avatar
- `@radix-ui/react-checkbox` - Checkbox
- `@radix-ui/react-collapsible` - Collapsible
- `@radix-ui/react-context-menu` - ContextMenu
- `@radix-ui/react-dialog` - Dialog
- `@radix-ui/react-dropdown-menu` - DropdownMenu
- `@radix-ui/react-hover-card` - HoverCard
- `@radix-ui/react-popover` - Popover
- `@radix-ui/react-progress` - Progress
- `@radix-ui/react-radio-group` - RadioGroup
- `@radix-ui/react-scroll-area` - ScrollArea
- `@radix-ui/react-select` - Select
- `@radix-ui/react-separator` - Separator
- `@radix-ui/react-slider` - Slider
- `@radix-ui/react-slot` - Slot utility
- `@radix-ui/react-toggle` - Toggle
- `@radix-ui/react-toggle-group` - ToggleGroup
- `@radix-ui/react-tooltip` - Tooltip

**Other Libraries:**
- `cmdk` - Command palette
- `vaul` - Drawer component
- `react-day-picker` - Calendar
- `date-fns` - Date utilities
- `class-variance-authority` - Variant utilities

## Design System (`ui.tsx`)

### Available Components

- **Button** - Variants: `primary`, `secondary`, `ghost`, `destructive`, `outline`. Sizes: `sm`, `md`, `lg`, `icon`. Supports `loading` state.
- **Input** - Form input with consistent styling
- **Label** - Form label with proper contrast
- **Switch** - Toggle switch (RTL-aware)
- **Tabs, TabsList, TabsTrigger** - Tab navigation
- **Card** - Container with shadow and hover effects
- **Badge** - Status badges with variants: `default`, `success`, `warning`, `destructive`, `outline`, `secondary`
- **Dialog** - Responsive modal (Dialog on desktop, Drawer on mobile)
- **Skeleton** - Loading placeholder with shimmer animation
- **Breadcrumb** - Navigation breadcrumb (RTL-aware)
- **ComingSoon** - Wrapper for disabled buttons/elements with "בקרוב" (Coming soon) tooltip

### Re-exported from shadcn/ui

These components are imported from `components/ui/` and re-exported for convenience:

- **CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction** - Card subcomponents for structured layouts
- **Alert, AlertTitle, AlertDescription** - Alert banners with `default` and `destructive` variants
- **Spinner** - Loading spinner indicator (Loader2Icon-based)
- **Textarea** - Multi-line text input
- **ShadcnSkeleton** - shadcn/ui skeleton (aliased to avoid conflict with custom Skeleton)

### Utility Function

```tsx
cn(...inputs: ClassValue[]) // Merges Tailwind classes (clsx + tailwind-merge)
```

## Adding New Components

1. Add to `ui.tsx` if it's a generic, reusable UI component
2. Create a separate file for domain-specific components (like `FaceMap.tsx`)
3. Use `cn()` for class merging
4. Support variants via props when applicable
5. Use `React.forwardRef` for form elements
6. Include proper ARIA attributes for accessibility

## RTL Considerations

- Use `ml-*` instead of `mr-*` for spacing
- Switch component uses RTL-aware translate (`-translate-x-5` moves left in RTL)
- Breadcrumb chevrons rotate for RTL (`rtl:rotate-180`)

## Example: Adding a New Component

```tsx
interface NewComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'alternate';
}

export const NewComponent = React.forwardRef<HTMLDivElement, NewComponentProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-white border-gray-200',
      alternate: 'bg-gray-50 border-gray-300',
    };
    return (
      <div
        ref={ref}
        className={cn('rounded-lg border p-4', variants[variant], className)}
        {...props}
      />
    );
  }
);
NewComponent.displayName = 'NewComponent';
```

## Dependencies

- `clsx` - Conditional class joining
- `tailwind-merge` - Tailwind class deduplication
- `lucide-react` - Icons (ChevronLeft, CheckCircle, XCircle, X)
- `react-router-dom` - Link component for Breadcrumb
