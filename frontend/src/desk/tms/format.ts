const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const plainMoney = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const dateFormat = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const dateTimeFormat = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatMoney(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  const amount = Number(value);
  return Number.isFinite(amount) ? plainMoney.format(amount) : '';
}

export function formatCurrency(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  const amount = Number(value);
  return Number.isFinite(amount) ? money.format(amount) : '';
}

function asDate(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: unknown): string {
  const date = asDate(value);
  return date ? dateFormat.format(date) : '';
}

export function formatDateTime(value: unknown): string {
  const date = asDate(value);
  return date ? dateTimeFormat.format(date) : '';
}

/** `AVAILABLE` -> `Available`, `IN_TRANSIT` -> `In Transit`. */
export function formatStatus(value: unknown): string {
  if (typeof value !== 'string' || !value) return '';
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Status badge HTML class / variant */
export function statusColorClass(status: string | undefined | null): string {
  if (!status) return 'status-default';
  const s = String(status).toUpperCase();
  if (s === 'AVAILABLE' || s === 'ACTIVE' || s === 'DELIVERED' || s === 'COMPLETED' || s === 'PAID') {
    return 'status-success';
  }
  if (s === 'IN_TRANSIT' || s === 'ASSIGNED' || s === 'DISPATCHED' || s === 'RUNNING') {
    return 'status-info';
  }
  if (s === 'MAINTENANCE' || s === 'PENDING' || s === 'WARNING') {
    return 'status-warning';
  }
  if (s === 'OUT_OF_SERVICE' || s === 'BLOCKED' || s === 'CANCELLED' || s === 'EXPIRED') {
    return 'status-danger';
  }
  return 'status-default';
}

/** Select options from a list of codes, labelled with `formatStatus`. */
export function statusOptions(values: readonly string[]): { value: string; label: string }[] {
  return values.map((value) => ({ value, label: formatStatus(value) }));
}
