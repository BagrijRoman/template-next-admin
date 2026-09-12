import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

// jsdom does not implement the <dialog> API: emulate the parts the component relies on.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  });
});

describe('Modal', () => {
  it('opens as a modal dialog with its title and content', () => {
    render(
      <Modal isOpen onClose={() => undefined} title="Delete user?">
        Are you sure?
      </Modal>,
    );

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Delete user?' })).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('reports the close button through onClose', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Delete user?">
        Are you sure?
      </Modal>,
    );

    await userEvent.setup().click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('stays closed while isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => undefined} title="Delete user?">
        Are you sure?
      </Modal>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
