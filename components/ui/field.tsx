import * as React from 'react';
import { cn } from '../ui';

// Field context for connecting label, control, and help text
interface FieldContextValue {
  id: string;
  descriptionId: string;
  errorId: string;
  hasError: boolean;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

function useFieldContext() {
  const context = React.useContext(FieldContext);
  if (!context) {
    throw new Error('Field components must be used within a Field');
  }
  return context;
}

// Main Field wrapper
interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: string | boolean;
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, error, children, ...props }, ref) => {
    const id = React.useId();
    const descriptionId = `${id}-description`;
    const errorId = `${id}-error`;
    const hasError = Boolean(error);

    return (
      <FieldContext.Provider value={{ id, descriptionId, errorId, hasError }}>
        <div
          ref={ref}
          className={cn('space-y-2', className)}
          {...props}
        >
          {children}
          {typeof error === 'string' && error && (
            <FieldError>{error}</FieldError>
          )}
        </div>
      </FieldContext.Provider>
    );
  }
);
Field.displayName = 'Field';

// Field Label
interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, required, children, ...props }, ref) => {
    const { id, hasError } = useFieldContext();

    return (
      <label
        ref={ref}
        htmlFor={id}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          hasError && 'text-destructive',
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-destructive mr-1">*</span>}
      </label>
    );
  }
);
FieldLabel.displayName = 'FieldLabel';

// Field Control wrapper - adds accessibility attributes to child input
interface FieldControlProps {
  children: React.ReactElement;
}

const FieldControl = ({ children }: FieldControlProps) => {
  const { id, descriptionId, errorId, hasError } = useFieldContext();

  return React.cloneElement(children, {
    id,
    'aria-describedby': `${descriptionId} ${hasError ? errorId : ''}`.trim() || undefined,
    'aria-invalid': hasError || undefined,
  });
};
FieldControl.displayName = 'FieldControl';

// Field Description / Help text
const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { descriptionId } = useFieldContext();

  return (
    <p
      ref={ref}
      id={descriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});
FieldDescription.displayName = 'FieldDescription';

// Field Error message
const FieldError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { errorId } = useFieldContext();

  return (
    <p
      ref={ref}
      id={errorId}
      role="alert"
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    />
  );
});
FieldError.displayName = 'FieldError';

// Fieldset for grouping related fields
interface FieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend?: string;
}

const Fieldset = React.forwardRef<HTMLFieldSetElement, FieldsetProps>(
  ({ className, legend, children, ...props }, ref) => {
    return (
      <fieldset
        ref={ref}
        className={cn('space-y-4', className)}
        {...props}
      >
        {legend && (
          <legend className="text-sm font-semibold leading-none mb-4">
            {legend}
          </legend>
        )}
        {children}
      </fieldset>
    );
  }
);
Fieldset.displayName = 'Fieldset';

export {
  Field,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldError,
  Fieldset,
};
export type { FieldProps, FieldLabelProps, FieldsetProps };
