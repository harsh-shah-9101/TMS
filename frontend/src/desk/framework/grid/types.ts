export type DeskGridMode = 'entry' | 'list' | 'report';
export type DeskAlign = 'left' | 'right' | 'center';
export type DeskEditorKind = 'text' | 'number' | 'date' | 'select' | 'lookup' | 'check';
export type DeskSummary = 'sum' | 'avg' | 'count' | 'min' | 'max';

export interface DeskSelectOption {
  label: string;
  value: string;
}

export interface DeskLookupColumn {
  id: string;
  header: string;
  field: string;
}

export interface DeskLookupConfig {
  model: string;
  endpoint: string;
  labelKey: string;
  valueKey: string;
  columns: DeskLookupColumn[];
  extraWhere?: Record<string, unknown>;
  attributes?: string[];
  include?: unknown[];
  /** Rows to ask for. Defaults to 20. */
  limit?: number;
  /** Passed through to the list body, matching the original dropdowns. */
  subQuery?: boolean;
  /** Characters before a search runs. Defaults to 1. Zero lists the filtered set immediately. */
  minChars?: number;
  /**
   * Builds the search part of `where`. Used when the original dropdown does not
   * use a single `$iLike` (party searches name and account code together).
   */
  searchWhere?: (query: string) => Record<string, unknown>;
  /**
   * When set, the query is sent as this where key (for example `_productSearch`)
   * instead of a name `$iLike`. Matches the existing autocomplete payloads.
   */
  searchParam?: string;
}

/** Where Enter goes after this cell. Defaults to the next cell on the right. */
export type DeskEnterTarget =
  | { type: 'cell'; columnId: string; rowDelta?: number }
  | {
      type: 'dialog';
      dialog: string;
      returnTo?: string;
      /** `always` (default) opens on every Enter. `change` opens only when the cell value changed. */
      when?: 'always' | 'change';
    };

export function isDeskDialogTarget(
  enter: DeskEnterTarget,
): enter is { type: 'dialog'; dialog: string; returnTo?: string; when?: 'always' | 'change' } {
  return enter.type === 'dialog' && 'dialog' in enter;
}

/** What a page's `@next-focus` sees when Enter leaves a cell. */
export interface DeskNextFocusContext<T extends Record<string, unknown> = Record<string, unknown>> {
  row: T;
  rowIndex: number;
  column: DeskColumn<T>;
  /** The committed value differs from the value when editing started. False when the cell was not being edited. */
  changed: boolean;
  /** The open-dialog shortcut (Ctrl+Enter by default) was used. */
  force: boolean;
}

/**
 * Page decision for where Enter goes.
 * A target replaces the column's `enter`. `null` moves to the next cell. `undefined` keeps the column's `enter`.
 */
export type DeskNextFocus<T extends Record<string, unknown> = Record<string, unknown>> = (
  ctx: DeskNextFocusContext<T>,
) => DeskEnterTarget | null | undefined;

/** How a list column is sent in the list-and-count `where` or `include`. */
export interface DeskColumnFilter {
  /** Root where key. Defaults to the column id. Association text uses `$alias.field$`. */
  field?: string;
  /** Put the search on this include alias instead of the root where. */
  includeAs?: string;
  /** Field inside that include. Defaults to `name`. */
  includeField?: string;
}

export type DeskSortDirection = 'ASC' | 'DESC';

/** A value read from an included model. Drives cell text, list filter and list sort. */
export interface DeskColumnRelation {
  model: string;
  as: string;
  field: string;
}

/** A read-only fact drawn under a cell value. `focus` is the drawer control a click opens. */
export interface DeskCellTag {
  id: string;
  text: string;
  tone: 'applied' | 'hint' | 'warn';
  focus: string;
}

export interface DeskColumn<T extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  header: string;
  group?: string;
  width?: number;
  align?: DeskAlign;
  type?: DeskEditorKind;
  format?: (value: unknown, row: T) => string;
  summary?: DeskSummary;
  editor?: DeskEditorKind;
  readonly?: boolean | ((row: T) => boolean);
  visible?: () => boolean;
  pinned?: boolean;
  options?: DeskSelectOption[];
  lookup?: DeskLookupConfig;
  enter?: DeskEnterTarget;
  /** Server filter for list mode. Omitted columns filter on their own id with `$iLike`. */
  filter?: DeskColumnFilter;
  /** Included model for display, filter and sort. Overrides `filter` / sort when those are omitted. */
  relation?: DeskColumnRelation;
  /** Simple sort column when it is not the column id. */
  sortField?: string;
  /** Sequelize `order` entry for an association, including direction. */
  sortOrder?: (direction: DeskSortDirection) => unknown;
  /** Row span for report body cells. 0 hides the cell (covered by a span above). */
  rowspan?: (row: T, rowIndex: number) => number;
  error?: (row: T) => string | null;
  /** Quiet line under the cell value, such as MRP under Rate. */
  caption?: (row: T) => string;
  /** Tags under the cell value. The grid draws them and does not know what they mean. */
  detail?: (row: T) => DeskCellTag[];
}

export interface DeskCursor {
  row: number;
  col: number;
}

export interface DeskRange {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
}

export interface DeskGridRow extends Record<string, unknown> {
  id?: string | number;
}

/** A toggle in the grid corner menu. The page stores the checked state. */
export interface DeskGridOption {
  id: string;
  label: string;
  checked: boolean;
}

/** A row menu action. The host decides which actions exist and whether they are enabled. */
export interface DeskRowAction {
  name: string;
  label: string;
  disabled: boolean;
}

/** What `<DeskGrid ref>` exposes to pages. */
export interface DeskGridApi {
  focusGrid(): void;
  focusEntry(): void;
  focusCell(rowIndex: number, columnId: string): void;
  moveTo(row: number, col: number, extend: boolean): Promise<void>;
  addRow(): void;
  /** Enter on the last cell of a row: next row, a new entry row, or out of the grid. */
  advanceRow(rowIndex: number): Promise<void>;
  currentRow(): DeskGridRow | null;
  /** Move to a row and focus one control in its drawer. */
  focusDrawer(rowIndex: number, fieldId: string): void;
}
