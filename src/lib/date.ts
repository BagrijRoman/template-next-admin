/** Fixed locale, not the visitor's: a date rendered on the server must match the client's. */
const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const INVALID_DATE_PLACEHOLDER = '—';

/** Renders an ISO timestamp from the API as a short date, never as a crash. */
export const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? INVALID_DATE_PLACEHOLDER : dateFormatter.format(date);
};
