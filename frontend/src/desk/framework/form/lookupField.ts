/** Read a dotted field from a lookup row, for example `account.name`. */
export function lookupField(row: Record<string, unknown>, path: string): string {
  const value = path.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[part];
  }, row);
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return '';
}
