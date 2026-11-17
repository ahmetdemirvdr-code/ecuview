import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ecu-accent)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-[var(--font-heading)] uppercase tracking-wider',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--ecu-accent)] text-[#0a0a0f] hover:bg-[var(--ecu-accent-hover)] border border-[var(--ecu-accent)]',
        destructive:
          'bg-[var(--ecu-danger)] text-white hover:bg-[var(--ecu-danger)]/90 border border-[var(--ecu-danger)]',
        outline:
          'border border-[var(--ecu-border-accent)] bg-transparent text-[var(--ecu-text)] hover:bg-[var(--ecu-surface-2)] hover:border-[var(--ecu-accent)]',
        secondary:
          'bg-[var(--ecu-surface-2)] text-[var(--ecu-text)] border border-[var(--ecu-border)] hover:bg-[var(--ecu-surface-3)]',
        ghost:
          'text-[var(--ecu-text-secondary)] hover:bg-[var(--ecu-surface-2)] hover:text-[var(--ecu-text)]',
        link: 'text-[var(--ecu-accent)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 px-3 text-xs',
        lg: 'h-11 px-8 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
