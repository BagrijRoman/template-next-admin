import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { DesignSystemShowcase } from './DesignSystemShowcase';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe('DesignSystemShowcase', () => {
  it('renders every section of the living reference', () => {
    render(<DesignSystemShowcase />);

    [
      'Colours',
      'Typography',
      'Radii & elevation',
      'Buttons',
      'Motion',
      'Inputs',
      'Table — four states',
      'Modal & toasts',
    ].forEach((title) => expect(screen.getByRole('heading', { name: title })).toBeInTheDocument());
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });
});
