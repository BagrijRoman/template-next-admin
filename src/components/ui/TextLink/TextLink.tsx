import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export type TextLinkProps = ComponentProps<typeof Link>;

const textLinkClassName =
  'rounded-control text-sm font-medium text-foreground underline underline-offset-4 outline-none transition-colors duration-(--duration-fast) hover:text-muted focus-visible:ring-2 focus-visible:ring-ring';

/** An inline navigation link: the one styling for links that sit in prose, not in a button. */
export const TextLink = ({ className, ...props }: TextLinkProps) => (
  <Link className={cn(textLinkClassName, className)} {...props} />
);
