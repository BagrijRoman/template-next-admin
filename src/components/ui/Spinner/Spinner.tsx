import { cn } from '@/lib/cn';

type SpinnerSize = 'sm' | 'md';

type SpinnerProps = {
  size?: SpinnerSize;
  className?: string;
  /** Purely visual (e.g. inside a button that already reports aria-busy): hidden from assistive tech. */
  decorative?: boolean;
};

const sizeClassName: Record<SpinnerSize, string> = {
  sm: 'size-4 border-2',
  md: 'size-8 border-2',
};

export const Spinner = ({ size = 'md', className, decorative = false }: SpinnerProps) => (
  <span
    role={decorative ? undefined : 'status'}
    aria-label={decorative ? undefined : 'Loading'}
    aria-hidden={decorative || undefined}
    className={cn(
      'inline-block animate-spin rounded-full border-default border-t-foreground',
      sizeClassName[size],
      className,
    )}
  />
);
