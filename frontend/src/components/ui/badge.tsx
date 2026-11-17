import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center border px-2 py-0.5 text-xs font-semibold font-[var(--font-heading)] uppercase tracking-wider transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-[var(--ecu-accent)] bg-[var(--ecu-accent-bg)] text-[var(--ecu-accent)]',
        secondary:
          'border-[var(--ecu-border-accent)] bg-[var(--ecu-surface-2)] text-[var(--ecu-text-secondary)]',
        destructive:
          'border-[var(--ecu-danger)] bg-[var(--ecu-danger)]/10 text-[var(--ecu-danger)]',
        success:
          'border-[var(--ecu-success)] bg-[var(--ecu-success)]/10 text-[var(--ecu-success)]',
        info:
          'border-[var(--ecu-info)] bg-[var(--ecu-info)]/10 text-[var(--ecu-info)]',
        outline:
          'border-[var(--ecu-border-accent)] text-[var(--ecu-text-secondary)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
