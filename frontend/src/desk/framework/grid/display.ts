import type { DeskColumn, DeskGridRow, DeskSummary } from './types';

function formatRawValue(raw: unknown): string {
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'boolean') return raw ? 'Yes' : 'No';
  if (typeof raw === 'number') return Number.isFinite(raw) ? String(raw) : '';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object' && 'name' in raw) {
    const name = (raw as { name?: unknown }).name;
    return typeof name === 'string' ? name : '';
  }
  return '';
}

export function cellText(column: DeskColumn, row: DeskGridRow): string {
  const raw = column.relation
    ? (row[column.relation.as] as Record<string, unknown> | undefined)?.[column.relation.field]
    : row[column.id];
  if (column.format) return column.format(raw, row);
  return formatRawValue(raw);
}

/** Value an editor should open with. A formatted face, such as an applied rate, stays on screen only. */
export function editorText(column: DeskColumn, row: DeskGridRow): string {
  if (!column.editor) return cellText(column, row);
  const raw = row[column.id];
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'number') return Number.isFinite(raw) ? String(raw) : '';
  if (typeof raw === 'string') return raw;
  return cellText(column, row);
}

/** Label shown in a resting dropdown cell. The stored value stays what the editor commits. */
export function optionLabel(column: DeskColumn, row: DeskGridRow): string {
  const text = cellText(column, row);
  const option = column.options?.find((item) => item.value === text);
  return option?.label ?? text;
}

export function isReadonly(column: DeskColumn, row: DeskGridRow): boolean {
  if (typeof column.readonly === 'function') return column.readonly(row);
  return column.readonly === true;
}

export function summaryValue(kind: DeskSummary, values: number[]): number {
  if (values.length === 0) return 0;
  if (kind === 'count') return values.length;
  if (kind === 'min') return Math.min(...values);
  if (kind === 'max') return Math.max(...values);
  const total = values.reduce((sum, value) => sum + value, 0);
  if (kind === 'avg') return total / values.length;
  return total;
}

export function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

export function parseEditorValue(kind: string | undefined, text: string): unknown {
  if (kind === 'number') {
    if (text.trim() === '') return null;
    const value = Number(text);
    return Number.isFinite(value) ? value : text;
  }
  if (kind === 'check') return text === 'Yes' || text === 'Y' || text === '1' || text.toLowerCase() === 'true';
  return text;
}
