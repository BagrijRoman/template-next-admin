import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

// proxy.ts normally handles "/" before this renders; kept as a fallback.
const Home = () => redirect(ROUTES.DASHBOARD);

export default Home;
