'use client';

import type { ReactNode } from 'react';
import {
  AMBIENT_TONES,
  AmbientBackdrop,
  Button,
  ButtonLink,
  DataTable,
  type DataTableColumn,
  Input,
  Modal,
  Spinner,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { ROUTES } from '@/lib/constants';
import {
  BORDER_SWATCHES,
  COLOR_SWATCHES,
  MOTION_SAMPLES,
  RADIUS_SAMPLES,
  SAMPLE_ERROR,
  SAMPLE_ROWS,
  type SampleRow,
  SHADOW_SAMPLES,
  TEXT_SWATCHES,
  TYPOGRAPHY_SAMPLES,
} from '../../designSystem.constants';
import { useDesignSystemShowcase } from './useDesignSystemShowcase';

type SectionProps = { title: string; children: ReactNode };

const Section = ({ title, children }: SectionProps) => (
  <section className="flex flex-col gap-4">
    <h2 className="text-lg font-semibold text-foreground">{title}</h2>
    {children}
  </section>
);

const columns: DataTableColumn<SampleRow>[] = [
  { key: 'name', header: 'Name', render: (row) => row.name },
  { key: 'email', header: 'Email', render: (row) => <span className="text-muted">{row.email}</span> },
  { key: 'role', header: 'Role', render: (row) => row.role },
];

const getRowKey = (row: SampleRow) => row.id;

/** Living reference of every token and UI-kit component — the place to look before building a screen. */
export const DesignSystemShowcase = () => {
  const { isModalOpen, openModal, closeModal, showSuccessToast, showErrorToast, showInfoToast } =
    useDesignSystemShowcase();

  return (
    <div className="flex flex-col gap-10">
      <Section title="Colours">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {COLOR_SWATCHES.map(({ name, className }) => (
            <div key={name} className="flex flex-col gap-1">
              <div className={cn('h-12 rounded-control border border-default', className)} />
              <span className="font-mono text-xs text-muted">{name}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-6">
          {TEXT_SWATCHES.map(({ name, className }) => (
            <span key={name} className={cn('font-mono text-sm', className)}>
              text-{name}
            </span>
          ))}
          {BORDER_SWATCHES.map(({ name, className }) => (
            <span key={name} className={cn('rounded-control border-2 px-2 py-1 font-mono text-sm', className)}>
              border-{name}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="flex flex-col gap-2">
          {TYPOGRAPHY_SAMPLES.map(({ name, className }) => (
            <p key={name} className={cn('text-foreground', className)}>
              {name} — The quick brown fox jumps over the lazy dog
            </p>
          ))}
        </div>
      </Section>

      <Section title="Radii & elevation">
        <div className="flex flex-wrap gap-6">
          {RADIUS_SAMPLES.map(({ name, className }) => (
            <div key={name} className={cn('flex size-24 items-center justify-center bg-surface-muted', className)}>
              <span className="font-mono text-xs text-muted">{name}</span>
            </div>
          ))}
          {SHADOW_SAMPLES.map(({ name, className }) => (
            <div
              key={name}
              className={cn('flex size-24 items-center justify-center rounded-card bg-surface', className)}
            >
              <span className="font-mono text-xs text-muted">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="sm">Small</Button>
          <Button isLoading>Loading</Button>
          <Button disabled>Disabled</Button>
          <ButtonLink href={ROUTES.DESIGN_SYSTEM}>Link</ButtonLink>
          <ButtonLink href={ROUTES.DESIGN_SYSTEM} variant="secondary" size="sm">
            Link, secondary
          </ButtonLink>
          <Spinner size="sm" />
        </div>
      </Section>

      <Section title="Motion">
        <p className="text-sm text-muted">
          Entrances play once on mount; ambient loops run forever. All of them stop under{' '}
          <span className="font-mono">prefers-reduced-motion</span>, so nothing may depend on them to be readable.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {MOTION_SAMPLES.map(({ name, className }) => (
            <div key={name} className="flex flex-col items-center gap-2 rounded-card bg-surface-muted p-4">
              <span className={cn('size-10 rounded-control bg-primary', className)} />
              <span className="font-mono text-xs text-muted">{name}</span>
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {AMBIENT_TONES.map((tone) => (
            <div key={tone} className="relative h-32 overflow-hidden rounded-card border border-default">
              <AmbientBackdrop tone={tone} />
              <span className="relative flex h-full items-center justify-center font-mono text-xs text-muted">
                AmbientBackdrop · {tone}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Inputs">
        <div className="grid max-w-form gap-4">
          <Input label="Default" placeholder="Type here" />
          <Input label="With hint" hint="We never share your email." defaultValue="ada@example.com" />
          <Input label="Invalid" error="Enter a valid email address" defaultValue="ada@" />
          <Input label="Disabled" disabled defaultValue="Read only" />
        </div>
      </Section>

      <Section title="Table — four states">
        <div className="grid gap-4 lg:grid-cols-2">
          <DataTable columns={columns} rows={undefined} getRowKey={getRowKey} isLoading />
          <DataTable columns={columns} rows={undefined} getRowKey={getRowKey} error={SAMPLE_ERROR} />
          <DataTable columns={columns} rows={[]} getRowKey={getRowKey} emptyMessage="No users yet." />
          <DataTable columns={columns} rows={[...SAMPLE_ROWS]} getRowKey={getRowKey} />
        </div>
      </Section>

      <Section title="Modal & toasts">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={openModal}>
            Open modal
          </Button>
          <Button variant="secondary" onClick={showSuccessToast}>
            Success toast
          </Button>
          <Button variant="secondary" onClick={showErrorToast}>
            Error toast
          </Button>
          <Button variant="secondary" onClick={showInfoToast}>
            Info toast
          </Button>
        </div>
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Delete user?"
          footer={
            <Button variant="danger" onClick={closeModal}>
              Delete
            </Button>
          }
        >
          This action cannot be undone. The user loses access immediately.
        </Modal>
      </Section>
    </div>
  );
};
