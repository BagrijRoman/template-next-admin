import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('links the label to the field', () => {
    render(<Input label="Email" />);

    expect(screen.getByLabelText('Email')).toHaveAttribute('id');
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid');
  });

  it('shows the hint and describes the field with it', () => {
    render(<Input label="Email" hint="Work address" />);

    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Work address');
  });

  it('marks the field invalid and replaces the hint with the error', () => {
    render(<Input label="Email" hint="Work address" error="Enter a valid email address" />);

    const field = screen.getByLabelText('Email');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription('Enter a valid email address');
    expect(screen.queryByText('Work address')).not.toBeInTheDocument();
  });
});
