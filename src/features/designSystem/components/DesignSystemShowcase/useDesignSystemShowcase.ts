import { useState } from 'react';
import { toast } from '@/components/ui';

export const useDesignSystemShowcase = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const showSuccessToast = () => toast.success('Saved', 'Your changes are live.');
  const showErrorToast = () => toast.error('Something failed', 'The server did not respond.');
  const showInfoToast = () => toast.info('Heads up');

  return { isModalOpen, openModal, closeModal, showSuccessToast, showErrorToast, showInfoToast };
};
