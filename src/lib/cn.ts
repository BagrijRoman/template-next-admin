import { clsx, type ClassValue } from 'clsx';

/** Joins conditional class names; the single helper for composing token utilities in components. */
export const cn = (...inputs: ClassValue[]) => clsx(inputs);
