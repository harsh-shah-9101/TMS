import type { DeskIssue } from '../ui';

/** What a `DeskField` model holds. */
export type FieldValue = string | number | null;

export const text = (value: FieldValue | undefined): string =>
  value === null || value === undefined ? '' : String(value).trim();

export const textOrNull = (value: FieldValue | undefined): string | null => {
  const t = text(value);
  return t ? t : null;
};

export const numOrNull = (value: FieldValue | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

export const idOrNull = (value: FieldValue | undefined): number | null => {
  const parsed = Number(text(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const idText = (value: number | string | null | undefined): string => (value ? String(value) : '');

/** `required(form, ['name', 'Name'], ...)`: one issue per blank field. */
export function required<T extends object>(form: T, ...fields: Array<[keyof T & string, string]>): DeskIssue[] {
  return fields
    .filter(([field]) => text(form[field] as FieldValue) === '')
    .map(([field, label]) => ({ fieldId: field, message: `${label} is required` }));
}
