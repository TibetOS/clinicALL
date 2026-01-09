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

## shadcn/ui Components (`ui/`)

Comprehensive Radix UI-based components following shadcn/ui patterns:

### Primitives

| File | Description |
|------|-------------|
| `accordion.tsx` | Collapsible content sections |
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
- **Dialog** - Modal with focus trap, ARIA support, and escape key handling
- **Skeleton** - Loading placeholder
- **Breadcrumb** - Navigation breadcrumb (RTL-aware)
- **Toast, useToast** - Toast notifications with auto-dismiss

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
