import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from '../Spinner';

export const Table = ({ className, ...props }: HTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-x-auto rounded-card border border-default bg-surface">
    <table className={cn('w-full text-left text-sm', className)} {...props} />
  </div>
);

export const TableHead = (props: HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className="bg-surface-muted text-xs tracking-wide text-muted uppercase" {...props} />
);

export const TableBody = (props: HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className="divide-y divide-default" {...props} />
);

export const TableRow = ({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn('transition-colors duration-(--duration-fast) hover:bg-surface-muted', className)} {...props} />
);

export const TableHeaderCell = ({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) => (
  <th scope="col" className={cn('px-4 py-3 font-medium', className)} {...props} />
);

export const TableCell = ({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('px-4 py-3 text-foreground', className)} {...props} />
);

type TableStateRowProps = {
  colSpan: number;
  children: ReactNode;
  className?: string;
};

/** A full-width row for the loading / empty / error states of a table. */
export const TableStateRow = ({ colSpan, children, className }: TableStateRowProps) => (
  <tr>
    <td colSpan={colSpan} className={cn('px-4 py-10 text-center text-sm text-muted', className)}>
      {children}
    </td>
  </tr>
);

export type DataTableColumn<Row> = {
  key: string;
  header: ReactNode;
  render: (row: Row) => ReactNode;
  className?: string;
};

export type DataTableProps<Row> = {
  columns: DataTableColumn<Row>[];
  rows: Row[] | undefined;
  getRowKey: (row: Row) => string;
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
};

const DEFAULT_EMPTY_MESSAGE = 'Nothing to show yet.';

/**
 * The four-states convention in one component: loading → error → empty → data. Screens pass the
 * query's `data`, `isPending` and error message and never branch on those states themselves.
 */
export const DataTable = <Row,>({
  columns,
  rows,
  getRowKey,
  isLoading = false,
  error = null,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
}: DataTableProps<Row>) => {
  const renderBody = () => {
    if (isLoading) {
      return (
        <TableStateRow colSpan={columns.length}>
          <Spinner size="sm" className="mx-auto" />
        </TableStateRow>
      );
    }
    if (error) {
      return (
        <TableStateRow colSpan={columns.length} className="text-danger">
          {error}
        </TableStateRow>
      );
    }
    if (!rows?.length) {
      return <TableStateRow colSpan={columns.length}>{emptyMessage}</TableStateRow>;
    }
    return rows.map((row) => (
      <TableRow key={getRowKey(row)}>
        {columns.map((column) => (
          <TableCell key={column.key} className={column.className}>
            {column.render(row)}
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <Table>
      <TableHead>
        <tr>
          {columns.map((column) => (
            <TableHeaderCell key={column.key} className={column.className}>
              {column.header}
            </TableHeaderCell>
          ))}
        </tr>
      </TableHead>
      <TableBody>{renderBody()}</TableBody>
    </Table>
  );
};
