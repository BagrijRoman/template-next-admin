import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AmbientBackdrop } from './AmbientBackdrop';

const orbsOf = (container: HTMLElement) => Array.from(container.querySelectorAll('span'));

describe('AmbientBackdrop', () => {
  it('renders drifting orbs that assistive tech ignores', () => {
    const { container } = render(<AmbientBackdrop />);

    expect(screen.getByTestId('ambient-backdrop')).toHaveAttribute('aria-hidden');
    const orbs = orbsOf(container);
    expect(orbs).toHaveLength(2);
    expect(orbs.map((orb) => orb.className).join(' ')).toContain('animate-drift-slow');
  });

  it('tints the orbs for the requested tone', () => {
    const { container } = render(<AmbientBackdrop tone="danger" />);

    const classNames = orbsOf(container)
      .map((orb) => orb.className)
      .join(' ');
    expect(classNames).toContain('bg-danger/10');
    expect(classNames).not.toContain('bg-primary/10');
  });
});
