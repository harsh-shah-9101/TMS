import type { DeskGridRow } from '../ui';

/** Best label for a row in messages: its name, else code, registrationNumber, else id. */
export function rowText(row: DeskGridRow): string {
  const label = (row as any).name ?? (row as any).registrationNumber ?? (row as any).code ?? row.id;
  return typeof label === 'string' || typeof label === 'number' ? String(label) : '';
}

/** Grid rows are the rows a page loaded, so they have the page's row type. */
export function asRow<T extends DeskGridRow>(row: DeskGridRow): T {
  return row as T;
}

/** A cell value as plain text, for comparing against option lists. Objects are not text. */
export function cellText(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value) : '';
}
