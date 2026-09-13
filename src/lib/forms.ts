import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from './apiError';
import { getErrorMessage } from './errors';

const SERVER_ERROR_TYPE = 'server';

/**
 * Lands backend field errors on the form: every `details` entry whose field the form knows goes
 * under that field (typed `server`, so it clears on the next edit); whatever is left — details for
 * unknown fields, or an error without details — comes back as the message for the form-level alert.
 * Returns `null` when everything found a field, so the caller shows nothing extra.
 */
export const applyFieldErrors = <Values extends FieldValues>(
  setError: UseFormSetError<Values>,
  error: unknown,
  fields: readonly Path<Values>[],
): string | null => {
  if (!(error instanceof ApiError) || error.details.length === 0) {
    return getErrorMessage(error);
  }

  const known = new Set<string>(fields);
  let placed = 0;
  error.details.forEach(({ field, rule, message }) => {
    if (known.has(field)) {
      setError(field as Path<Values>, { type: `${SERVER_ERROR_TYPE}:${rule}`, message });
      placed += 1;
    }
  });

  if (placed === error.details.length) {
    return null;
  }
  return error.isValidation ? getErrorMessage(error) : error.message;
};
