'use client';

import type { ReactNode } from 'react';
import { Button } from '../Button';
import { useModal } from './useModal';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Action buttons; the close button is always present. */
  footer?: ReactNode;
};

export const Modal = ({ isOpen, onClose, title, children, footer }: ModalProps) => {
  const { dialogRef, handleClose, handleBackdropClick } = useModal({ isOpen, onClose });

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={handleBackdropClick}
      aria-labelledby="modal-title"
      className="m-auto w-full max-w-form rounded-card border border-default bg-surface p-0 text-foreground shadow-overlay backdrop:bg-overlay"
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 id="modal-title" className="text-lg font-semibold">
          {title}
        </h2>
        <div className="text-sm text-muted">{children}</div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => dialogRef.current?.close()}>
            Close
          </Button>
          {footer}
        </div>
      </div>
    </dialog>
  );
};
