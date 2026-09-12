import type { Metadata } from 'next';
import { DesignSystemShowcase } from '@/features/designSystem';

export const metadata: Metadata = {
  title: 'Design system',
};

const DesignSystemPage = () => (
  <div className="flex flex-col gap-6">
    <h1 className="text-2xl font-semibold text-foreground">Design system</h1>
    <DesignSystemShowcase />
  </div>
);

export default DesignSystemPage;
