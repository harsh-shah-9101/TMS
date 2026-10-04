import { isAxiosError } from 'axios';
import { issuesFromErrors, type DeskIssue } from '../ui';

/** A reason the server refused an operation (dues, open work), or a warning to confirm. */
export interface Blocker {
  code: string;
  message: string;
  count?: number;
}

export interface ApiFailure {
  message: string;
  /** Hard stops from the server: unpaid dues, open trips and so on. */
  blockers: Blocker[];
  /** The server will go ahead if the user confirms (HTTP 409 `needsConfirm`). */
  warnings: Blocker[];
  /** Field problems from a 422, ready for `DeskForm :server-issues`. */
  issues: DeskIssue[];
}

function textOf(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join('; ');
  return typeof value === 'string' ? value : '';
}

/** Any thrown value to a message plus field issues. */
export function apiFailure(error: unknown, fieldFor?: (key: string) => string | undefined): ApiFailure {
  if (!isAxiosError(error)) {
    return { message: error instanceof Error ? error.message : 'Something went wrong', blockers: [], warnings: [], issues: [] };
  }
  if (!error.response) return { message: 'Server is not reachable', blockers: [], warnings: [], issues: [] };
  const body = (error.response.data ?? {}) as {
    message?: unknown;
    errors?: Record<string, unknown>;
    blockers?: Blocker[];
    warnings?: Blocker[];
  };
  const message = textOf(body.message) || error.message;
  const issues = body.errors ? issuesFromErrors(body.errors, fieldFor) : [];
  return {
    message,
    blockers: body.blockers ?? [],
    warnings: body.warnings ?? [],
    issues: issues.length ? issues : [{ message }],
  };
}
