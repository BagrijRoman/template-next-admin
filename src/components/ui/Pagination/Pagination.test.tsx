import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Pagination } from './Pagination';

const PAGE_SIZE = 20;
const TOTAL = 42;
const onPageChange = vi.fn();

const renderPager = (page: number, total = TOTAL, isBusy = false) =>
  render(<Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={onPageChange} isBusy={isBusy} />);

describe('Pagination', () => {
  beforeEach(() => vi.clearAllMocks());

  it('names the visible range and the page count', () => {
    renderPager(2);

    expect(screen.getByText('21–40 of 42')).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });

  it('steps in both directions', async () => {
    const user = userEvent.setup();
    renderPager(2);

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Previous' }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 3);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 1);
  });

  it('stops at both ends and while a page is loading', () => {
    const { unmount } = renderPager(1);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    unmount();

    const last = renderPager(3);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    last.unmount();

    renderPager(2, TOTAL, true);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('says so when there is nothing to page through', () => {
    renderPager(1, 0);

    expect(screen.getByText('No results')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
  });
});
