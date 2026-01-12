# Layout Components Directory

This directory contains layout components for the admin dashboard.

## Files

| File | Description |
|------|-------------|
| `index.ts` | Barrel exports for all layout components |
| `AdminLayout.tsx` | Main layout wrapper composing sidebar, header, and dialogs |
| `AdminSidebar.tsx` | Sidebar navigation with plan widget and logout |
| `AdminHeader.tsx` | Header with menu toggle, notifications, and user profile |
| `PageLoader.tsx` | Loading spinner for lazy-loaded routes |
| `RoleProtectedPage.tsx` | Role-based access control wrapper |

### Dialogs Subdirectory

| File | Description |
|------|-------------|
| `dialogs/index.ts` | Barrel exports for dialog components |
| `dialogs/LogoutDialog.tsx` | Logout confirmation with activity logging |
| `dialogs/SessionTimeoutDialog.tsx` | HIPAA-compliant session timeout warning |
| `dialogs/DeclarationShareDialog.tsx` | Health declaration share via WhatsApp/Email |

## Component Architecture

```
AdminLayout (manages shared state)
├── AdminSidebar
│   ├── Logo + branding
│   ├── Navigation links
│   ├── Plan widget (links to billing)
│   └── Logout button
├── AdminHeader
│   ├── Mobile menu toggle
│   ├── Public site link
│   ├── Notifications dropdown
│   └── User profile
├── Main content area (children)
├── Mobile overlay
└── Dialogs
    ├── LogoutDialog
    ├── SessionTimeoutDialog
    └── DeclarationShareDialog
```

## State Management

`AdminLayout` manages all shared state:

- `sidebarOpen` - Sidebar visibility (auto-closes on mobile nav)
- `logoutDialogOpen` - Logout confirmation dialog
- `declarationDialog` - Health declaration share dialog state
- Session timeout via `useSessionTimeout` hook
- Notifications via `useNotifications` hook

## Usage

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

## RTL Considerations

- Sidebar is positioned on the right (`right-0`)
- Navigation uses `translate-x-full` for RTL sliding
- Mobile overlay covers left side only (`left-0 right-72`)
- Icon spacing uses `ml-*` (not `mr-*`)

## Props Reference

### AdminSidebar

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Whether sidebar is visible |
| `onClose` | `() => void` | Called when close button clicked |
| `onLogout` | `() => void` | Called when logout button clicked |

### AdminHeader

| Prop | Type | Description |
|------|------|-------------|
| `sidebarOpen` | `boolean` | Current sidebar state |
| `onToggleSidebar` | `() => void` | Toggle sidebar visibility |
| `notifications` | `Notification[]` | List of notifications |
| `unreadCount` | `number` | Count of unread notifications |
| `onMarkAsRead` | `(id: string) => void` | Mark single notification read |
| `onMarkAllAsRead` | `() => void` | Mark all notifications read |
| `onSendDeclaration` | `(notif: Notification) => void` | Handle send declaration action |

### RoleProtectedPage

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Content to render if authorized |
| `requiredRole` | `'owner' \| 'admin'` | Minimum role required |

### Dialog Components

See individual files for prop types. All use the standard `Dialog` component pattern with `open` and `onClose`/`onOpenChange` props.

## Dependencies

- `../../contexts/AuthContext` - `useAuth()` for user profile
- `../../hooks` - `useNotifications`, `useHealthTokens`, `useActivityLog`, `useSessionTimeout`
- `../ui` - UI components (`Button`, `Badge`, `Dialog`)
- `lucide-react` - Icons
- `react-router-dom` - `Link`, `useLocation`, `useNavigate`
