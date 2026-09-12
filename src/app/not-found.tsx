import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

const NotFound = () => (
  <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
    <p className="text-6xl font-semibold">404</p>
    <p className="text-muted">This page could not be found.</p>
    <Link href={ROUTES.HOME} className="text-sm font-medium underline underline-offset-4">
      Go home
    </Link>
  </main>
);

export default NotFound;
