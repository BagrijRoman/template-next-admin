import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

// The only handler for "/": it sends visitors into the app, where AuthGuard decides whether
// they may stay or must sign in first.
const Home = () => redirect(ROUTES.DASHBOARD);

export default Home;
