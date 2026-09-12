import { type SyntheticEvent, useEffect, useRef } from 'react';

type UseModalOptions = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Drives a native <dialog>: `showModal()` gives focus trapping, Escape handling and the ::backdrop
 * for free; the `close` event is the single place the parent learns the dialog went away.
 */
export const useModal = ({ isOpen, onClose }: UseModalOptions) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleClose = () => onClose();

  /** Clicking the backdrop (the dialog element itself, outside its content box) closes the dialog. */
  const handleBackdropClick = (event: SyntheticEvent<HTMLDialogElement, MouseEvent>) => {
    if (event.target === dialogRef.current) {
      dialogRef.current?.close();
    }
  };

  return { dialogRef, handleClose, handleBackdropClick };
};
