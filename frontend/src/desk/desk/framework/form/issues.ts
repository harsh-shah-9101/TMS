import type { InjectionKey } from 'vue';

/**
 * One problem a page wants the user to see. With a `fieldId` it shows on that field while the
 * field is on screen. Without one, or while the field is not mounted (a closed tab), it shows
 * as a toast until the field appears or the problem is gone.
 */
export interface DeskIssue {
  message: string;
  fieldId?: string;
}

/** What a `DeskForm` gives the fields inside it. */
export interface DeskFormIssues {
  /** The message for a field, or null. */
  issueFor(fieldId: string): string | null;
  /** A field announces itself when it mounts. Call the result when it unmounts. */
  mount(fieldId: string): () => void;
  /** The user changed this field, so its server error hides until the next save. */
  edited(fieldId: string): void;
}

export const DESK_FORM_ISSUES: InjectionKey<DeskFormIssues> = Symbol('desk-form-issues');

/** The issues no mounted field can show, one per message and field. */
export function unplacedIssues(issues: readonly DeskIssue[], isMounted: (fieldId: string) => boolean): DeskIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    if (issue.fieldId !== undefined && isMounted(issue.fieldId)) return false;
    const key = `${issue.fieldId ?? ''}|${issue.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** `bankDetail.bankName` and `items[0].qty` both end at the last name. */
function lastSegment(key: string): string {
  const parts = key.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  return parts[parts.length - 1] ?? key;
}

function messageOf(value: unknown): string {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean).join('; ');
  if (typeof value === 'string') return value;
  return '';
}

/**
 * One issue per key in a server `errors` map. `fieldFor` turns a server key into a field id.
 * A full path is tried, then its last segment (`bankDetail.bankName` looks up `bankName`), then
 * the key itself. A key no field uses, such as `Error`, never mounts, so it shows as a toast.
 */
export function issuesFromErrors(
  errors: Record<string, unknown>,
  fieldFor: (key: string) => string | undefined = (key) => key,
): DeskIssue[] {
  const issues: DeskIssue[] = [];
  for (const [key, value] of Object.entries(errors)) {
    const message = messageOf(value);
    if (!message) continue;
    const segment = lastSegment(key);
    const fieldId = fieldFor(key) || (segment !== key ? fieldFor(segment) : undefined) || key;
    issues.push({ message, fieldId });
  }
  return issues;
}
