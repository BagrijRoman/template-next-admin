import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ButtonLink } from './ButtonLink';

describe('ButtonLink', () => {
  it('renders a real link carrying the button styles', () => {
    render(<ButtonLink href="/dashboard">Go home</ButtonLink>);

    const link = screen.getByRole('link', { name: 'Go home' });
    expect(link).toHaveAttribute('href', '/dashboard');
    expect(link.className).toContain('bg-primary');
    expect(link.className).toContain('rounded-control');
  });

  it('applies the requested variant and size and keeps extra classes', () => {
    render(
      <ButtonLink href="/users" variant="secondary" size="sm" className="w-full">
        Users
      </ButtonLink>,
    );

    const link = screen.getByRole('link', { name: 'Users' });
    expect(link.className).toContain('bg-surface');
    expect(link.className).toContain('h-8');
    expect(link.className).toContain('w-full');
  });
});
