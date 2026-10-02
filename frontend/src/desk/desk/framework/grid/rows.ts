import type { DeskGridRow } from './types';

/** What `clearRowData` needs from a column. */
export interface ClearColumn {
  id: string;
  type?: string;
  editor?: string;
  /** Present when the cell stores a related record id in `${id}Id`. */
  lookup?: unknown;
}

/** Empty value for a cell, from its editor. */
export function emptyColumnValue(column: ClearColumn): unknown {
  const kind = column.editor ?? column.type;
  if (kind === 'number') return 0;
  if (kind === 'check') return false;
  return '';
}

function emptyStoredValue(key: string, value: unknown): unknown {
  if (key.endsWith('Id')) return null;
  if (typeof value === 'string') return '';
  if (typeof value === 'number') return 0;
  if (typeof value === 'boolean') return false;
  if (Array.isArray(value)) return [];
  return null;
}

/**
 * Blank a row but keep its id.
 * Column cells go back to an empty editor value. Keys ending in `Id`
 * (the row id aside) and lookup companions (`productNameId`) become null.
 */
export function clearRowData(row: DeskGridRow, columns: ClearColumn[]): DeskGridRow {
  const next: DeskGridRow = { ...row };
  for (const key of Object.keys(next)) {
    if (key === 'id') continue;
    next[key] = emptyStoredValue(key, next[key]);
  }
  for (const column of columns) {
    next[column.id] = emptyColumnValue(column);
    if (column.lookup) next[`${column.id}Id`] = null;
  }
  return next;
}
