import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from '../Spinner';
import { baseClassName, type ButtonSize, type ButtonVariant, sizeClassName, variantClassName } from './Button.styles';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and blocks interaction while an action is in flight. */
  isLoading?: boolean;
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  type = 'button',
  disabled,
  className,
  children,
  ...props
}: ButtonProps) => (
  <button
    type={type}
    disabled={disabled || isLoading}
    aria-busy={isLoading || undefined}
    className={cn(baseClassName, variantClassName[variant], sizeClassName[size], className)}
    {...props}
  >
    {isLoading && <Spinner size="sm" decorative className="border-current/30 border-t-current" />}
    {children}
  </button>
);
