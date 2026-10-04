import { presetToCombo, type DeskCombo } from './combo';

/** Action id to key list, the same shape as the preset JSON files. An empty list means unbound. */
export type DeskBindings = Record<string, string[]>;

export type DeskBindingSource = 'preset' | 'custom' | 'desk';

/** Desk-only actions with their default keys. Presets and user overrides win over these. */
export const DESK_EXTRA: DeskBindings = {
  'desk-keys': ['ctrl', 'alt', 'k'],
  'grid-cell-dialog': ['ctrl', 'enter'],
  'desk-jump': ['ctrl', 'enter'],
  'desk-move-up': ['ctrl', 'arrowup'],
  'desk-move-down': ['ctrl', 'arrowdown'],
  'desk-move-left': ['ctrl', 'arrowleft'],
  'desk-move-right': ['ctrl', 'arrowright'],
  'desk-tab-prev': ['ctrl', 'shift', 'arrowleft'],
  'desk-tab-next': ['ctrl', 'shift', 'arrowright'],
};

export function mergeBindings(preset: DeskBindings, overrides: DeskBindings): DeskBindings {
  return { ...DESK_EXTRA, ...preset, ...overrides };
}

/** Combo to the action ids bound to it, in binding order. Built once per keymap change. */
export function indexBindings(bindings: DeskBindings): Map<DeskCombo, string[]> {
  const index = new Map<DeskCombo, string[]>();
  for (const [id, keys] of Object.entries(bindings)) {
    const combo = presetToCombo(keys);
    if (!combo) continue;
    const ids = index.get(combo);
    if (ids) ids.push(id);
    else index.set(combo, [id]);
  }
  return index;
}

export function bindingSource(id: string, overrides: DeskBindings): DeskBindingSource {
  if (id in overrides) return 'custom';
  if (id in DESK_EXTRA) return 'desk';
  return 'preset';
}

/** Navigation runs from the shell; everything else runs on a page or dialog. */
export function scopeClass(id: string): 'global' | 'page' {
  return id.startsWith('nav-') || id.startsWith('quick-') || id.startsWith('desk-') ? 'global' : 'page';
}

/** Other actions in the same scope class that already use this combo. */
export function comboConflicts(bindings: DeskBindings, actionId: string, combo: DeskCombo): string[] {
  const scope = scopeClass(actionId);
  return Object.entries(bindings)
    .filter(([id, keys]) => id !== actionId && scopeClass(id) === scope && presetToCombo(keys) === combo)
    .map(([id]) => id);
}
