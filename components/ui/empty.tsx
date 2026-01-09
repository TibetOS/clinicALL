import * as React from 'react';
import { cn } from '../ui';

interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  ({ className, icon, title, description, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50',
          className
        )}
        {...props}
      >
        {icon && (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            {icon}
          </div>
        )}
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mt-2 mb-4 text-sm text-muted-foreground max-w-sm">
            {description}
          </p>
        )}
        {action && <div className="mt-4">{action}</div>}
        {children}
      </div>
    );
  }
);
Empty.displayName = 'Empty';

export { Empty };
export type { EmptyProps };
