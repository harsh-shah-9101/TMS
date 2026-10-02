export interface DrawerKeyInput {
  key: string;
  shift: boolean;
}

/**
 * Where the key landed.
 * `grid-last` is Tab on the Net cell. The drawer places are the focused control.
 */
export type DrawerPlace = 'grid-last' | 'drawer-first' | 'drawer-mid' | 'drawer-last';

export type DrawerKeyResult =
  | { type: 'enter-drawer' }
  | { type: 'next-field' }
  | { type: 'next-row' }
  | { type: 'leave-drawer' }
  | { type: 'move-row'; dir: 1 | -1 }
  | { type: 'ignore' };

/**
 * Enter and Tab on Net open the drawer. Enter and Tab then walk its controls.
 * Enter or Tab on the last control goes to the next item row. Esc returns to the row.
 * Arrow keys move between item rows, except inside a select, which the grid leaves alone.
 */
export function resolveDrawerKey(input: DrawerKeyInput, place: DrawerPlace): DrawerKeyResult {
  if (place === 'grid-last') {
    if ((input.key === 'Tab' || input.key === 'Enter') && !input.shift) return { type: 'enter-drawer' };
    return { type: 'ignore' };
  }
  if (input.key === 'Escape') return { type: 'leave-drawer' };
  if (input.key === 'ArrowUp') return { type: 'move-row', dir: -1 };
  if (input.key === 'ArrowDown') return { type: 'move-row', dir: 1 };
  if ((input.key === 'Tab' || input.key === 'Enter') && !input.shift) {
    return place === 'drawer-last' ? { type: 'next-row' } : { type: 'next-field' };
  }
  if (input.key === 'Tab' && input.shift && place === 'drawer-first') return { type: 'leave-drawer' };
  return { type: 'ignore' };
}
