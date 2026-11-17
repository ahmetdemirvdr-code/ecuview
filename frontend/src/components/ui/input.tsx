import * as React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full border bg-transparent px-3 py-1 text-sm transition-colors',
          'border-[var(--ecu-border-accent)] text-[var(--ecu-text)]',
          'placeholder:text-[var(--ecu-text-muted)]',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ecu-accent)] focus-visible:border-[var(--ecu-accent)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
