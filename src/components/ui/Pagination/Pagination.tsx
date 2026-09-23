import { FIRST_PAGE } from '@/lib/constants';
import { Button } from '../Button';

export type PaginationProps = {
  /** 1-based, the way it appears in the URL. */
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  /** Blocks both steps while a page is in flight, so a fast clicker cannot outrun the request. */
  isBusy?: boolean;
};

const NO_RESULTS_LABEL = 'No results';

/** Range label plus one step in each direction — the pager every list screen uses. */
export const Pagination = ({ page, pageSize, total, onPageChange, isBusy = false }: PaginationProps) => {
  const pageCount = Math.max(FIRST_PAGE, Math.ceil(total / pageSize));
  const firstOnPage = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastOnPage = Math.min(page * pageSize, total);

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted">
        {total === 0 ? NO_RESULTS_LABEL : `${firstOnPage}–${lastOnPage} of ${total}`}
      </p>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted">
          Page {page} of {pageCount}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={isBusy || page <= FIRST_PAGE}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={isBusy || page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
};
