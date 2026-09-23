'use client';

import { AmbientBackdrop, Button, ButtonLink } from '@/components/ui';
import { cn } from '@/lib/cn';
import { ROUTES } from '@/lib/constants';
import { NOT_FOUND_CODE } from '../../notFound.constants';
import { useNotFoundScreen } from './useNotFoundScreen';

const digitClassName = 'bg-linear-to-br from-primary via-info to-primary bg-clip-text text-transparent';

/** The 404 screen: the missing path, a way out, and motion that is decoration only. */
export const NotFoundScreen = () => {
  const { pathname, goBack } = useNotFoundScreen();

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      <AmbientBackdrop />

      <div className="relative flex flex-col items-center gap-8">
        <p className="flex items-center gap-4 text-8xl leading-none font-bold tracking-tight sm:text-9xl">
          <span className="sr-only">{NOT_FOUND_CODE}</span>
          <span aria-hidden className={cn('animate-bob', digitClassName)}>
            4
          </span>
          <span
            aria-hidden
            className="size-20 shrink-0 animate-spin-slow rounded-full border-8 border-emphasis border-t-primary sm:size-28"
          />
          <span aria-hidden className={cn('animate-bob-late', digitClassName)}>
            4
          </span>
        </p>

        <div className="flex animate-rise flex-col items-center gap-2">
          <h1 className="text-2xl font-semibold text-foreground">This page went missing</h1>
          <p className="max-w-form text-sm text-muted">
            Nothing lives at <span className="font-mono text-foreground">{pathname}</span>. The link may be out of date,
            or the page moved somewhere else.
          </p>
        </div>

        <div className="flex animate-rise-delayed flex-wrap items-center justify-center gap-3">
          <ButtonLink href={ROUTES.HOME}>Go home</ButtonLink>
          <Button variant="secondary" onClick={goBack}>
            Go back
          </Button>
        </div>
      </div>
    </main>
  );
};
