export type PivotAggregate = 'sum' | 'count' | 'avg' | 'min' | 'max' | 'distinct';

export interface PivotValue {
  field: string;
  aggregate: PivotAggregate;
}

export interface PivotRequest {
  rows: Record<string, unknown>[];
  groupBy: string[];
  splitBy: string[];
  values: PivotValue[];
  filters: { field: string; value: string }[];
}

export interface PivotColumn {
  id: string;
  header: string;
  group?: string;
  field: string;
}

export interface PivotResult {
  columns: PivotColumn[];
  rows: Record<string, unknown>[];
}

function text(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return '';
}

function numberOf(value: unknown): number {
  return typeof value === 'number' ? value : Number(value) || 0;
}

function aggregate(values: unknown[], kind: PivotAggregate): number {
  if (kind === 'count') return values.length;
  if (kind === 'distinct') return new Set(values.map(text)).size;
  const nums = values.map(numberOf);
  if (nums.length === 0) return 0;
  if (kind === 'min') return Math.min(...nums);
  if (kind === 'max') return Math.max(...nums);
  const total = nums.reduce((sum, value) => sum + value, 0);
  if (kind === 'avg') return total / nums.length;
  return total;
}

/** group_by / split_by / aggregates, the same shape as a Perspective view config. */
export function pivotLocally(request: PivotRequest): PivotResult {
  const filtered = request.rows.filter((row) =>
    request.filters.every((filter) => !filter.value || text(row[filter.field]).toLowerCase().includes(filter.value.toLowerCase())),
  );
  const splitKeys = [...new Set(filtered.map((row) => request.splitBy.map((field) => text(row[field])).join(' | ') || 'All'))];
  const columns: PivotColumn[] = request.groupBy.map((field) => ({
    id: field,
    header: field,
    field,
  }));
  splitKeys.forEach((split) => {
    request.values.forEach((value) => {
      columns.push({
        id: `${split}__${value.field}__${value.aggregate}`,
        header: `${value.aggregate} ${value.field}`,
        group: split,
        field: value.field,
      });
    });
  });

  const buckets = new Map<string, Record<string, unknown>[]>();
  filtered.forEach((row) => {
    const key = request.groupBy.map((field) => text(row[field])).join(' | ') || 'Total';
    const list = buckets.get(key) ?? [];
    list.push(row);
    buckets.set(key, list);
  });

  const rows = [...buckets.entries()].map(([key, items]) => {
    const record: Record<string, unknown> = { id: key, __group: true };
    const parts = key.split(' | ');
    request.groupBy.forEach((field, index) => {
      record[field] = parts[index] ?? key;
    });
    splitKeys.forEach((split) => {
      const subset = items.filter((row) => (request.splitBy.map((field) => text(row[field])).join(' | ') || 'All') === split);
      request.values.forEach((value) => {
        record[`${split}__${value.field}__${value.aggregate}`] = aggregate(subset.map((row) => row[value.field]), value.aggregate);
      });
    });
    return record;
  });

  const total: Record<string, unknown> = { id: '__total', __group: true };
  request.groupBy.forEach((field, index) => {
    total[field] = index === 0 ? 'Grand total' : '';
  });
  splitKeys.forEach((split) => {
    const subset = filtered.filter((row) => (request.splitBy.map((field) => text(row[field])).join(' | ') || 'All') === split);
    request.values.forEach((value) => {
      total[`${split}__${value.field}__${value.aggregate}`] = aggregate(subset.map((row) => row[value.field]), value.aggregate);
    });
  });
  rows.push(total);
  return { columns, rows };
}
