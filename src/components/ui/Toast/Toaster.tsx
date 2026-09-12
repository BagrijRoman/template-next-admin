'use client';

import { cn } from '@/lib/cn';
import { type ToastVariant, useToastStore } from './toast.store';

const variantClassName: Record<ToastVariant, string> = {
  success: 'border-success bg-success-soft',
  error: 'border-danger bg-danger-soft',
  info: 'border-info bg-info-soft',
};

/** Mount once, in the root layout: renders every active toast in the corner of the viewport. */
export const Toaster = () => {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed right-4 bottom-4 z-(--z-toast) flex w-full max-w-form flex-col gap-2"
    >
      {toasts.map(({ id, variant, title, description }) => (
        <div
          key={id}
          role="status"
          className={cn(
            'pointer-events-auto flex items-start justify-between gap-3 rounded-card border p-4 text-sm text-foreground shadow-overlay',
            variantClassName[variant],
          )}
        >
          <div className="flex flex-col gap-1">
            <p className="font-medium">{title}</p>
            {description && <p className="text-muted">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => dismiss(id)}
            className="text-muted transition-colors duration-(--duration-fast) hover:text-foreground"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
