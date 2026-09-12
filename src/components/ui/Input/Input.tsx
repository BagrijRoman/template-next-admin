import { type InputHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/cn';

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string;
  /** Validation message; when set the field is marked invalid and the message is announced. */
  error?: string;
  hint?: string;
};

const inputClassName =
  'h-10 w-full rounded-control border border-emphasis bg-surface px-3 text-sm text-foreground outline-none transition-colors duration-(--duration-fast) placeholder:text-subtle focus:border-ring focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60';

export const Input = ({ label, error, hint, className, ...props }: InputProps) => {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : undefined, hint ? hintId : undefined].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(inputClassName, error && 'border-danger focus:border-danger focus:ring-danger')}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-xs text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
};
