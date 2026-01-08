# Components Directory

This directory contains reusable UI components for the ClinicALL application.

## Files

| File | Description |
|------|-------------|
| `ui.tsx` | Core design system components (Button, Input, Card, Dialog, etc.) |
| `FaceMap.tsx` | SVG-based injectable face diagram for clinical notes |
| `ProtectedRoute.tsx` | Auth guard wrapper for protected routes |
| `ImageSlider.tsx` | Image carousel/slider component |

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
