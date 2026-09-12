import { ROUTES } from '@/lib/constants';

export type NavItem = {
  label: string;
  href: string;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD },
  { label: 'Users', href: ROUTES.USERS },
  { label: 'Design system', href: ROUTES.DESIGN_SYSTEM },
];
