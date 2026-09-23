import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { baseClassName, type ButtonSize, type ButtonVariant, sizeClassName, variantClassName } from '../Button';

export type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/** A navigation action that looks like a Button: still a real link, so middle-click and copy-link work. */
export const ButtonLink = ({ variant = 'primary', size = 'md', className, children, ...props }: ButtonLinkProps) => (
  <Link className={cn(baseClassName, variantClassName[variant], sizeClassName[size], className)} {...props}>
    {children}
  </Link>
);
