import { cn } from '@/lib/cn';

export const AMBIENT_TONES = ['brand', 'danger'] as const;

export type AmbientTone = (typeof AMBIENT_TONES)[number];

const orbClassNames: Record<AmbientTone, readonly string[]> = {
  brand: [
    'top-1/4 left-1/4 size-64 animate-drift-slow bg-primary/10',
    'right-1/4 bottom-1/4 size-80 animate-drift-slower bg-info/20',
  ],
  danger: [
    'top-1/4 left-1/4 size-64 animate-drift-slow bg-danger/10',
    'right-1/4 bottom-1/4 size-80 animate-drift-slower bg-warning/20',
  ],
};

/**
 * Decorative drifting glow behind a full-page screen. Purely visual and hidden from assistive
 * tech; the parent must be positioned, since the orbs fill it.
 */
export const AmbientBackdrop = ({ tone = 'brand' }: { tone?: AmbientTone }) => (
  <div aria-hidden data-testid="ambient-backdrop" className="pointer-events-none absolute inset-0 overflow-hidden">
    {orbClassNames[tone].map((className) => (
      <span key={className} className={cn('absolute rounded-full blur-3xl', className)} />
    ))}
  </div>
);
