import React, { ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Link } from 'react-router-dom';
import { ChevronLeft, CheckCircle, XCircle, X } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Button with loading state
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm border border-transparent hover:shadow-md transform active:scale-95',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent',
      ghost: 'hover:bg-accent hover:text-accent-foreground text-gray-700',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm border border-transparent',
      outline: 'border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300',
    };
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2 text-sm',
      lg: 'h-12 px-8 text-lg',
      icon: 'h-10 w-10 p-2 flex items-center justify-center',
    };
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          loading && 'relative',
          className
        )}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        )}
        <span className={loading ? 'invisible' : ''}>{children}</span>
      </button>
    );
  }
);
Button.displayName = 'Button';

// Input
export const Input = React.forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

// Label (improved contrast: gray-700 → gray-800)
export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-800 mb-2 block", className)}
      {...props}
    />
  )
);
Label.displayName = "Label";

// Switch
export const Switch = React.forwardRef<HTMLButtonElement, { checked?: boolean; onCheckedChange?: (checked: boolean) => void } & React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, checked, onCheckedChange, ...props }, ref) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-gray-200",
        className
      )}
      ref={ref}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
          checked ? "translate-x-0" : "-translate-x-5" // RTL logic: negative translate moves left
        )}
      />
    </button>
  )
);
Switch.displayName = "Switch";

// Tabs (Simplified)
export const Tabs = ({ value, onValueChange, children, className }: { value: string, onValueChange: (v: string) => void, children?: React.ReactNode, className?: string }) => {
  return <div className={cn("w-full", className)}>{children}</div>
};

export const TabsList = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <div className={cn("inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500", className)}>
    {children}
  </div>
);

interface TabsTriggerProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  value: string;
  activeValue?: string;
  onClick?: (v: string) => void;
}

export const TabsTrigger = ({ value, activeValue, onClick, children, ...props }: TabsTriggerProps) => (
  <button
    onClick={() => onClick?.(value)}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      activeValue === value ? "bg-white text-gray-900 shadow-sm" : "hover:bg-gray-200/50 hover:text-gray-900"
    )}
    {...props}
  >
    {children}
  </button>
);

// Card
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-xl border border-gray-100 bg-white text-gray-900 shadow-sm hover:shadow-md transition-shadow duration-200', className)}
    {...props}
  />
));
Card.displayName = 'Card';

// Badge
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'border-transparent bg-primary/10 text-primary hover:bg-primary/20',
      secondary: 'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200',
      destructive: 'border-transparent bg-red-50 text-red-700 hover:bg-red-100',
      success: 'border-transparent bg-green-50 text-green-700 hover:bg-green-100',
      warning: 'border-transparent bg-amber-50 text-amber-700 hover:bg-amber-100',
      outline: 'text-gray-700 border-gray-200 border',
    };
    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', variants[variant], className)}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

// Modal/Dialog with focus trap and ARIA
export const Dialog = ({ open, onClose, children, title }: { open: boolean; onClose: () => void; children?: React.ReactNode; title?: string }) => {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();

  // Focus trap and escape key handler
  React.useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // Store previously focused element
    const previouslyFocused = document.activeElement as HTMLElement;

    // Focus the dialog
    dialog.focus();

    // Handle escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === 'Tab') {
        const focusableElements = dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      // Restore focus to previously focused element
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className="w-full max-w-lg rounded-xl bg-white border border-gray-200 p-0 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          {title && <h2 id={titleId} className="text-xl font-bold text-gray-900">{title}</h2>}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 transition-colors bg-gray-100 p-1.5 rounded-full hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="סגור חלון"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Skeleton loading placeholder
export const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("animate-pulse bg-gray-200 rounded", className)} {...props} />
  )
);
Skeleton.displayName = "Skeleton";

// Breadcrumb navigation
interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const Breadcrumb = ({ items }: { items: BreadcrumbItem[] }) => (
  <nav aria-label="ניווט" className="flex items-center gap-2 text-sm text-gray-500 mb-4">
    {items.map((item, i) => (
      <React.Fragment key={i}>
        {i > 0 && <ChevronLeft size={14} className="text-gray-300 rtl:rotate-180" />}
        {item.href ? (
          <Link to={item.href} className="hover:text-primary transition-colors">
            {item.label}
          </Link>
        ) : (
          <span className="text-gray-900 font-medium">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

// Toast notification with auto-dismiss
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ type, message, onClose, duration = 4000 }: ToastProps) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <XCircle size={20} />,
    info: <CheckCircle size={20} />,
  };

  const styles = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-blue-600 text-white',
  };

  return (
    <div className={cn(
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg",
      "animate-in slide-in-from-bottom-4 duration-300",
      styles[type]
    )}>
      {icons[type]}
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="mr-2 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="סגור"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Toast container hook for managing multiple toasts
export const useToast = () => {
  const [toasts, setToasts] = React.useState<Array<{ id: string; type: ToastProps['type']; message: string }>>([]);

  const showToast = React.useCallback((type: ToastProps['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const ToastContainer = () => (
    <>
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ bottom: `${24 + index * 60}px` }} className="fixed left-1/2 -translate-x-1/2 z-[100]">
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </>
  );

  return { showToast, ToastContainer };
};