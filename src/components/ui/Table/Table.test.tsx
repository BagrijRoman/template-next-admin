import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataTable, type DataTableColumn } from './Table';

type Row = { id: string; name: string };

const columns: DataTableColumn<Row>[] = [{ key: 'name', header: 'Name', render: (row) => row.name }];
const getRowKey = (row: Row) => row.id;
const rows: Row[] = [
  { id: '1', name: 'Ada' },
  { id: '2', name: 'Grace' },
];

describe('DataTable', () => {
  it('renders the loading state', () => {
    render(<DataTable columns={columns} rows={undefined} getRowKey={getRowKey} isLoading />);

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('renders the error state above everything else', () => {
    render(<DataTable columns={columns} rows={rows} getRowKey={getRowKey} error="Failed" />);

    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.queryByText('Ada')).not.toBeInTheDocument();
  });

  it('renders the empty state', () => {
    render(<DataTable columns={columns} rows={[]} getRowKey={getRowKey} emptyMessage="No rows" />);

    expect(screen.getByText('No rows')).toBeInTheDocument();
  });

  it('renders one row per item with the column headers', () => {
    render(<DataTable columns={columns} rows={rows} getRowKey={getRowKey} />);

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(rows.length + 1);
    expect(screen.getByText('Grace')).toBeInTheDocument();
  });
});
