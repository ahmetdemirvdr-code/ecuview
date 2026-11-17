import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'card' | 'table-row' | 'chart';
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  const baseClasses = 'skeleton-shimmer rounded-none';

  const variants: Record<string, string> = {
    text: 'h-4 w-full',
    circle: 'h-10 w-10 rounded-full',
    card: 'h-24 w-full',
    'table-row': 'h-8 w-full',
    chart: 'h-64 w-full',
  };

  return (
    <div
      className={cn(baseClasses, variants[variant], className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonFileCard() {
  return (
    <div className="border border-[var(--ecu-border)] p-3 space-y-2">
      <div className="flex items-start gap-3">
        <Skeleton className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-1 p-2">
      <Skeleton className="h-8 w-full mb-2" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="table-row" className="h-7" />
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton variant="chart" className="h-[400px]" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}
