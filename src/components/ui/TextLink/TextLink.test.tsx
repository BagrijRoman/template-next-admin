import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TextLink } from './TextLink';

describe('TextLink', () => {
  it('renders an underlined link that keeps extra classes', () => {
    render(
      <TextLink href="/login" className="mt-4">
        Back to sign in
      </TextLink>,
    );

    const link = screen.getByRole('link', { name: 'Back to sign in' });
    expect(link).toHaveAttribute('href', '/login');
    expect(link.className).toContain('underline');
    expect(link.className).toContain('mt-4');
  });
});
