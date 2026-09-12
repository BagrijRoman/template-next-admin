export type TokenSwatch = { name: string; className: string };

/** Every semantic colour token, rendered as a swatch on the showcase page. Extend when a token is added. */
export const COLOR_SWATCHES: readonly TokenSwatch[] = [
  { name: 'page', className: 'bg-page' },
  { name: 'surface', className: 'bg-surface' },
  { name: 'surface-muted', className: 'bg-surface-muted' },
  { name: 'surface-inverted', className: 'bg-surface-inverted' },
  { name: 'primary', className: 'bg-primary' },
  { name: 'primary-hover', className: 'bg-primary-hover' },
  { name: 'danger', className: 'bg-danger' },
  { name: 'danger-soft', className: 'bg-danger-soft' },
  { name: 'success', className: 'bg-success' },
  { name: 'success-soft', className: 'bg-success-soft' },
  { name: 'warning', className: 'bg-warning' },
  { name: 'warning-soft', className: 'bg-warning-soft' },
  { name: 'info', className: 'bg-info' },
  { name: 'info-soft', className: 'bg-info-soft' },
];

export const TEXT_SWATCHES: readonly TokenSwatch[] = [
  { name: 'foreground', className: 'text-foreground' },
  { name: 'muted', className: 'text-muted' },
  { name: 'subtle', className: 'text-subtle' },
  { name: 'danger', className: 'text-danger' },
];

export const BORDER_SWATCHES: readonly TokenSwatch[] = [
  { name: 'default', className: 'border-default' },
  { name: 'emphasis', className: 'border-emphasis' },
  { name: 'ring', className: 'border-ring' },
];

export const TYPOGRAPHY_SAMPLES: readonly TokenSwatch[] = [
  { name: 'text-2xl / semibold', className: 'text-2xl font-semibold' },
  { name: 'text-lg / semibold', className: 'text-lg font-semibold' },
  { name: 'text-base', className: 'text-base' },
  { name: 'text-sm', className: 'text-sm' },
  { name: 'text-xs', className: 'text-xs' },
  { name: 'font-mono', className: 'font-mono text-sm' },
];

export const RADIUS_SAMPLES: readonly TokenSwatch[] = [
  { name: 'rounded-control', className: 'rounded-control' },
  { name: 'rounded-card', className: 'rounded-card' },
];

export const SHADOW_SAMPLES: readonly TokenSwatch[] = [
  { name: 'shadow-card', className: 'shadow-card' },
  { name: 'shadow-overlay', className: 'shadow-overlay' },
];

export type SampleRow = { id: string; name: string; email: string; role: string };

export const SAMPLE_ROWS: readonly SampleRow[] = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@example.com', role: 'Admin' },
  { id: '2', name: 'Grace Hopper', email: 'grace@example.com', role: 'Editor' },
  { id: '3', name: 'Linus Torvalds', email: 'linus@example.com', role: 'Viewer' },
];

export const SAMPLE_ERROR = 'Could not load users. Try again.';
