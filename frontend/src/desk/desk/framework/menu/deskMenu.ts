/** One row in the Desk menu. The host fills this from its own menu tree. */
export interface DeskMenuNode {
  label: string;
  route?: string;
  /** Single letter used by the Alt tap. */
  letter?: string;
  children?: DeskMenuNode[];
}

export interface DeskMenuLetterResult {
  openPath: number[];
  navigate?: string;
  /** Keep the Alt tap armed so the next letter can walk into the open submenu. */
  stayArmed: boolean;
}

function nodeAt(items: DeskMenuNode[], openPath: number[]): DeskMenuNode | undefined {
  let level = items;
  let current: DeskMenuNode | undefined;
  for (const index of openPath) {
    current = level[index];
    if (!current) return undefined;
    level = current.children ?? [];
  }
  return current;
}

/**
 * Apply one Alt-tap letter.
 * With nothing open, the letter opens a top menu or navigates.
 * With a menu open, the letter picks a row in that menu.
 */
export function applyDeskMenuLetter(
  items: DeskMenuNode[],
  openPath: number[],
  letter: string,
): DeskMenuLetterResult {
  const key = letter.toLowerCase();
  const level = openPath.length === 0 ? items : (nodeAt(items, openPath)?.children ?? []);
  const index = level.findIndex((item) => item.letter === key);
  if (index < 0) return { openPath: [], stayArmed: false };
  const item = level[index];
  if (!item) return { openPath: [], stayArmed: false };
  if (item.route) return { openPath: [], navigate: item.route, stayArmed: false };
  if (item.children && item.children.length > 0) {
    return { openPath: [...openPath, index], stayArmed: true };
  }
  return { openPath: [], stayArmed: false };
}

export type DeskMenuNavKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'Enter' | 'Escape';

export interface DeskMenuKeyResult {
  openPath: number[];
  navigate?: string;
}

interface MenuLevel {
  list: DeskMenuNode[];
  selected: number;
  prefix: number[];
}

function currentLevel(items: DeskMenuNode[], openPath: number[]): MenuLevel {
  if (openPath.length <= 1) {
    const top = nodeAt(items, openPath.slice(0, 1));
    return { list: top?.children ?? [], selected: -1, prefix: openPath.slice(0, 1) };
  }
  const prefix = openPath.slice(0, -1);
  const parent = nodeAt(items, prefix);
  return { list: parent?.children ?? [], selected: openPath[openPath.length - 1] ?? -1, prefix };
}

function shiftTop(items: DeskMenuNode[], openPath: number[], delta: number): DeskMenuKeyResult {
  if (items.length === 0) return { openPath: [] };
  const current = openPath[0] ?? 0;
  const next = (current + delta + items.length) % items.length;
  return { openPath: [next] };
}

/**
 * Arrow, Enter, and Escape handling while a menu is open.
 * Down and Up move inside the open list. Right enters a submenu or the next top menu.
 * Left closes one level. Returns null when no menu is open.
 */
export function applyDeskMenuKey(
  items: DeskMenuNode[],
  openPath: number[],
  key: DeskMenuNavKey,
): DeskMenuKeyResult | null {
  if (openPath.length === 0) return null;
  if (key === 'Escape') return { openPath: [] };

  const level = currentLevel(items, openPath);
  if (key === 'ArrowDown' || key === 'ArrowUp') {
    if (level.list.length === 0) return { openPath };
    let selected = level.selected;
    if (key === 'ArrowDown') {
      selected = selected < 0 ? 0 : Math.min(level.list.length - 1, selected + 1);
    } else if (selected < 0) {
      selected = level.list.length - 1;
    } else if (selected === 0) {
      selected = level.list.length - 1;
    } else {
      selected -= 1;
    }
    return { openPath: [...level.prefix, selected] };
  }

  if (key === 'ArrowRight') {
    const item = level.selected >= 0 ? level.list[level.selected] : undefined;
    if (item?.children && item.children.length > 0) {
      return { openPath: [...level.prefix, level.selected, 0] };
    }
    return shiftTop(items, openPath, 1);
  }

  if (key === 'ArrowLeft') {
    if (level.selected >= 0) return { openPath: level.prefix };
    return shiftTop(items, openPath, -1);
  }

  const item = level.selected >= 0 ? level.list[level.selected] : nodeAt(items, openPath.slice(0, 1));
  if (!item) return { openPath };
  if (item.route) return { openPath: [], navigate: item.route };
  if (item.children && item.children.length > 0 && level.selected >= 0) {
    return { openPath: [...level.prefix, level.selected, 0] };
  }
  return { openPath };
}

export function splitAccessLabel(label: string, letter?: string): { text: string; mark: boolean }[] {
  if (!letter) return [{ text: label, mark: false }];
  const index = label.toLowerCase().indexOf(letter.toLowerCase());
  if (index < 0) return [{ text: label, mark: false }];
  const parts: { text: string; mark: boolean }[] = [];
  if (index > 0) parts.push({ text: label.slice(0, index), mark: false });
  parts.push({ text: label.slice(index, index + 1), mark: true });
  if (index + 1 < label.length) parts.push({ text: label.slice(index + 1), mark: false });
  return parts;
}

function nodeContainsPath(item: DeskMenuNode, path: string): boolean {
  if (!path) return false;
  if (item.route && (path === item.route || path.startsWith(`${item.route}/`))) return true;
  return item.children?.some((child) => nodeContainsPath(child, path)) ?? false;
}

/** Top menu that contains the current page. The first top menu when nothing matches. */
export function deskMenuTopIndex(items: DeskMenuNode[], path: string): number {
  const index = items.findIndex((item) => nodeContainsPath(item, path));
  return index >= 0 ? index : 0;
}

/** Move along the top menu bar, wrapping at both ends. */
export function moveDeskMenuTop(count: number, index: number, delta: number): number {
  if (count <= 0) return -1;
  const current = index >= 0 && index < count ? index : 0;
  return (current + delta + count) % count;
}

/** Every route on the menu tree. Paths that are not menu items are absent. */
export function menuRoutes(items: DeskMenuNode[]): string[] {
  return items.flatMap((item) => {
    const nested = item.children ? menuRoutes(item.children) : [];
    return item.route ? [item.route, ...nested] : nested;
  });
}
