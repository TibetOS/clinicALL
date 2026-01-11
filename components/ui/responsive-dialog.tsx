import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from './drawer';
import { cn } from '../ui';

// Hook to detect mobile screen
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [breakpoint]);

  return isMobile;
}

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Responsive Dialog - uses Drawer on mobile, Dialog on desktop
 * Based on shadcn/ui pattern: https://ui.shadcn.com/docs/components/dialog#responsive-dialog
 */
export function ResponsiveDialog({
  open,
  onOpenChange,
  children,
  title,
  description,
  className,
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className={cn('max-h-[85vh]', className)}>
          {(title || description) && (
            <DrawerHeader className="text-right">
              {title && <DrawerTitle>{title}</DrawerTitle>}
              {description && <DrawerDescription>{description}</DrawerDescription>}
            </DrawerHeader>
          )}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-[900px] sm:w-[90vw] max-h-[90vh] overflow-hidden flex flex-col', className)}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Re-export for convenience
export { useIsMobile };
