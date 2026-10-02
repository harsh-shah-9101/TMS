import {
  isDeskDialogTarget,
  type DeskColumn,
  type DeskCursor,
  type DeskEnterTarget,
  type DeskGridMode,
  type DeskGridRow,
  type DeskNextFocus,
} from './types';

export interface GridKeyInput {
  key: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  alt: boolean;
}

export interface GridKeyState {
  mode: DeskGridMode;
  rowCount: number;
  colCount: number;
  cursor: DeskCursor;
  editing: boolean;
  pageSize: number;
  /** The column that must be filled before Enter may start another row is empty. */
  blankOnNewRow?: boolean;
  /** `enter`: Tab does what Enter does. `field`: Tab leaves the grid for the next form field. */
  tabFlow?: DeskTabFlow;
  /** The current cell is a dropdown, so the first Enter opens it instead of moving on. */
  dropdown?: boolean;
}

export type DeskTabFlow = 'enter' | 'field';

export type GridKeyAction =
  | { type: 'move'; row: number; col: number; extend: boolean }
  | { type: 'startEdit'; seed?: string }
  | { type: 'commitMove'; row: number; col: number; addRow: boolean }
  | { type: 'cancelEdit' }
  | { type: 'insertRow' }
  | { type: 'deleteRow' }
  | { type: 'copy' }
  | { type: 'paste' }
  | { type: 'fillDown' }
  | { type: 'openRecord' }
  | { type: 'editRecord' }
  | { type: 'exitGrid'; via?: 'tab'; back?: boolean }
  | { type: 'filterKey'; seed?: string; backspace?: boolean; clear?: boolean }
  | { type: 'none' };

function mod(input: GridKeyInput): boolean {
  return input.ctrl || input.meta;
}

function clamp(value: number, max: number): number {
  if (max < 0) return 0;
  return Math.max(0, Math.min(max, value));
}

function move(
  state: GridKeyState,
  row: number,
  col: number,
  extend: boolean,
): GridKeyAction {
  return {
    type: 'move',
    row: clamp(row, Math.max(0, state.rowCount - 1)),
    col: clamp(col, Math.max(0, state.colCount - 1)),
    extend,
  };
}

/** Next cell to the right, wrapping onto the next row. */
export function cellToTheRight(state: GridKeyState): { row: number; col: number; addRow: boolean } {
  const { cursor, colCount, rowCount, mode } = state;
  if (cursor.col < colCount - 1) {
    return { row: cursor.row, col: cursor.col + 1, addRow: false };
  }
  const nextRow = cursor.row + 1;
  if (nextRow < rowCount) {
    return { row: nextRow, col: 0, addRow: false };
  }
  if (mode === 'entry') {
    return { row: rowCount, col: 0, addRow: true };
  }
  return { row: cursor.row, col: cursor.col, addRow: false };
}

/** Previous cell, wrapping onto the end of the previous row. */
export function cellToTheLeft(state: GridKeyState): { row: number; col: number } {
  const { cursor, colCount } = state;
  if (cursor.col > 0) return { row: cursor.row, col: cursor.col - 1 };
  if (cursor.row > 0) return { row: cursor.row - 1, col: Math.max(0, colCount - 1) };
  return { row: cursor.row, col: cursor.col };
}

function isPrintable(input: GridKeyInput): boolean {
  return input.key.length === 1 && !mod(input) && !input.alt;
}

/**
 * FoxPro / Marg style key map. Enter moves right. List mode Enter opens the row.
 */
export function resolveGridKey(input: GridKeyInput, state: GridKeyState): GridKeyAction {
  const { cursor } = state;
  if (state.colCount === 0) return { type: 'none' };

  if (input.key === 'Escape') {
    if (state.editing) return { type: 'cancelEdit' };
    if (state.mode === 'list') return { type: 'filterKey', clear: true };
    return { type: 'none' };
  }
  if (input.key === 'F2' && !state.editing) {
    if (state.mode === 'list') return { type: 'none' };
    return { type: 'startEdit' };
  }
  if (mod(input) && input.key.toLowerCase() === 'c') return { type: 'copy' };
  if (mod(input) && input.key.toLowerCase() === 'v') {
    if (state.mode === 'list') return { type: 'none' };
    return { type: 'paste' };
  }
  if (mod(input) && input.key.toLowerCase() === 'd' && state.mode === 'entry') {
    return { type: 'fillDown' };
  }
  if (mod(input) && input.key === 'Enter' && state.mode === 'list') {
    return { type: 'editRecord' };
  }
  if ((input.key === 'Insert' || (mod(input) && input.key === 'Insert')) && state.mode === 'entry') {
    return { type: 'insertRow' };
  }
  if (
    state.mode === 'entry' &&
    !state.editing &&
    ((mod(input) && input.key === 'Delete') || input.key === 'Delete')
  ) {
    return { type: 'deleteRow' };
  }

  if (input.key === 'Tab') {
    if (state.tabFlow === 'field') return { type: 'exitGrid', via: 'tab', back: input.shift };
    if (input.shift) {
      const prev = cellToTheLeft(state);
      if (state.editing) return { type: 'commitMove', row: prev.row, col: prev.col, addRow: false };
      return move(state, prev.row, prev.col, false);
    }
    if (state.mode !== 'entry') {
      const next = cellToTheRight(state);
      return move(state, next.row, next.col, false);
    }
    return resolveGridKey({ ...input, key: 'Enter' }, state);
  }

  if (input.key === 'Enter') {
    if (state.mode === 'list' && !state.editing && !input.shift) {
      return { type: 'openRecord' };
    }
    if (!state.editing && !input.shift && state.dropdown && state.mode === 'entry') {
      return { type: 'startEdit' };
    }
    const next = cellToTheRight(state);
    const leavingRow = next.addRow || next.row !== cursor.row;
    if (leavingRow && state.blankOnNewRow) return { type: 'exitGrid' };
    if (state.editing) {
      return { type: 'commitMove', row: next.row, col: next.col, addRow: next.addRow };
    }
    if (next.addRow) {
      return { type: 'commitMove', row: next.row, col: next.col, addRow: true };
    }
    return move(state, next.row, next.col, false);
  }

  if (state.editing && (input.key === 'ArrowUp' || input.key === 'ArrowDown' || input.key === 'ArrowLeft' || input.key === 'ArrowRight')) {
    const delta = arrowDelta(input.key);
    return {
      type: 'commitMove',
      row: clamp(cursor.row + delta.row, Math.max(0, state.rowCount - 1)),
      col: clamp(cursor.col + delta.col, Math.max(0, state.colCount - 1)),
      addRow: false,
    };
  }

  if (!state.editing && input.key === 'Backspace' && state.mode === 'list') {
    return { type: 'filterKey', backspace: true };
  }

  if (!state.editing && isPrintable(input) && state.mode === 'list') {
    return { type: 'filterKey', seed: input.key };
  }

  if (!state.editing && isPrintable(input) && state.mode !== 'report') {
    return { type: 'startEdit', seed: input.key };
  }

  if (input.key === 'Home') {
    if (mod(input)) return move(state, 0, 0, input.shift);
    return move(state, cursor.row, 0, input.shift);
  }
  if (input.key === 'End') {
    if (mod(input)) return move(state, state.rowCount - 1, state.colCount - 1, input.shift);
    return move(state, cursor.row, state.colCount - 1, input.shift);
  }
  if (input.key === 'PageDown') {
    return move(state, cursor.row + state.pageSize, cursor.col, input.shift);
  }
  if (input.key === 'PageUp') {
    return move(state, cursor.row - state.pageSize, cursor.col, input.shift);
  }

  const delta = arrowDelta(input.key);
  if (delta.row !== 0 || delta.col !== 0) {
    return move(state, cursor.row + delta.row, cursor.col + delta.col, input.shift);
  }
  return { type: 'none' };
}

/** Where Enter goes after the page hook and the column's `enter` are applied. */
export type CellEnterResult =
  | { type: 'dialog'; dialog: string; returnTo?: string }
  | { type: 'cell'; columnId: string; rowDelta?: number }
  | { type: 'next' };

/**
 * Page hook first, then the column. A dialog opens when its `when` is not `change`,
 * the cell value changed, or the open-dialog shortcut forced it.
 */
export function resolveCellEnter(
  ctx: { row: DeskGridRow; rowIndex: number; changed: boolean; force: boolean },
  column: DeskColumn,
  nextFocus?: DeskNextFocus,
): CellEnterResult {
  const fromPage = nextFocus?.({ ...ctx, column });
  const target: DeskEnterTarget | null | undefined = fromPage === undefined ? column.enter : fromPage;
  if (!target) return { type: 'next' };
  if (target.type === 'cell') {
    return target.rowDelta === undefined
      ? { type: 'cell', columnId: target.columnId }
      : { type: 'cell', columnId: target.columnId, rowDelta: target.rowDelta };
  }
  if (!isDeskDialogTarget(target)) return { type: 'next' };
  if (target.when === 'change' && !ctx.changed && !ctx.force) return { type: 'next' };
  return target.returnTo === undefined
    ? { type: 'dialog', dialog: target.dialog }
    : { type: 'dialog', dialog: target.dialog, returnTo: target.returnTo };
}

function arrowDelta(key: string): { row: number; col: number } {
  if (key === 'ArrowUp') return { row: -1, col: 0 };
  if (key === 'ArrowDown') return { row: 1, col: 0 };
  if (key === 'ArrowLeft') return { row: 0, col: -1 };
  if (key === 'ArrowRight') return { row: 0, col: 1 };
  return { row: 0, col: 0 };
}
