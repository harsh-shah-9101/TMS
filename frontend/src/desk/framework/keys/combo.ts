/** Canonical combo: modifiers in the order ctrl, shift, alt, meta, then the key, joined by `+`. */
export type DeskCombo = string;

export interface DeskKeyInput {
  key: string;
  code?: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
}

const MODIFIER_KEYS = new Set(['control', 'shift', 'alt', 'meta', 'altgraph', 'os']);

/** macOS takes Control+Arrow for Mission Control, so Command stands in for Control there. */
export function commandStandsForCtrl(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}
const MODIFIER_ORDER = ['ctrl', 'shift', 'alt', 'meta'] as const;
const KEY_ALIASES: Record<string, string> = {
  ' ': 'space',
  spacebar: 'space',
  esc: 'escape',
  del: 'delete',
  return: 'enter',
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
};

function baseKey(input: DeskKeyInput): string {
  // Letters and digits come from the physical key so Shift and Alt (which change `key`) still match presets.
  const letter = /^Key([A-Z])$/.exec(input.code ?? '');
  if (letter?.[1]) return letter[1].toLowerCase();
  const digit = /^Digit(\d)$/.exec(input.code ?? '');
  if (digit?.[1]) return digit[1];
  const key = input.key.toLowerCase();
  return KEY_ALIASES[key] ?? key;
}

export function isModifierKey(key: string): boolean {
  return MODIFIER_KEYS.has(key.toLowerCase());
}

/**
 * Combo for a key event, or null for a lone modifier press.
 * On a Mac, Command is recorded as Ctrl so the same bindings work. Control+Arrow never arrives there.
 */
export function toCombo(input: DeskKeyInput, commandAsCtrl = commandStandsForCtrl()): DeskCombo | null {
  if (!input.key || isModifierKey(input.key)) return null;
  const commandAsControl = commandAsCtrl && input.meta && !input.ctrl;
  const parts: string[] = [];
  if (input.ctrl || commandAsControl) parts.push('ctrl');
  if (input.shift) parts.push('shift');
  if (input.alt) parts.push('alt');
  if (input.meta && !commandAsControl) parts.push('meta');
  parts.push(baseKey(input));
  return parts.join('+');
}

export function keyInputOf(event: KeyboardEvent): DeskKeyInput {
  return {
    key: event.key ?? '',
    code: event.code,
    ctrl: event.ctrlKey,
    shift: event.shiftKey,
    alt: event.altKey,
    meta: event.metaKey,
  };
}

/** Preset arrays such as `["ctrl", "s"]` in any modifier order. Empty means unbound. */
export function presetToCombo(keys: readonly string[]): DeskCombo | null {
  if (keys.length === 0) return null;
  const lower = keys.map((key) => key.toLowerCase());
  const modifiers = MODIFIER_ORDER.filter((modifier) => lower.includes(modifier));
  const rest = lower.filter((key) => !(MODIFIER_ORDER as readonly string[]).includes(key));
  if (rest.length !== 1 || !rest[0]) return null;
  return [...modifiers, KEY_ALIASES[rest[0]] ?? rest[0]].join('+');
}

export function comboToPreset(combo: DeskCombo): string[] {
  return combo.split('+');
}

const LABELS: Record<string, string> = {
  ctrl: 'Ctrl',
  shift: 'Shift',
  alt: 'Alt',
  meta: 'Meta',
  enter: 'Enter',
  escape: 'Esc',
  delete: 'Del',
  space: 'Space',
  arrowup: 'Up',
  arrowdown: 'Down',
  arrowleft: 'Left',
  arrowright: 'Right',
  pageup: 'PgUp',
  pagedown: 'PgDn',
  insert: 'Ins',
  backspace: 'Backspace',
  tab: 'Tab',
};

export function formatCombo(combo: DeskCombo | null | undefined, commandAsCtrl = commandStandsForCtrl()): string {
  if (!combo) return '';
  return combo
    .split('+')
    .map((part) => {
      if (part === 'ctrl' && commandAsCtrl) return 'Cmd';
      return LABELS[part] ?? (/^f\d{1,2}$/.test(part) ? part.toUpperCase() : part.length === 1 ? part.toUpperCase() : part);
    })
    .join('+');
}

/** A key with no Ctrl, Alt or Meta that is not a function key, such as Enter, Delete or a letter. */
export function isBareCombo(combo: DeskCombo): boolean {
  const parts = combo.split('+');
  if (parts.includes('ctrl') || parts.includes('alt') || parts.includes('meta')) return false;
  const key = parts[parts.length - 1] ?? '';
  return !/^f\d{1,2}$/.test(key);
}

/** Clipboard and undo stay native while typing, even when a preset binds them. */
const NATIVE_TEXT_COMBOS = new Set(['ctrl+c', 'ctrl+v', 'ctrl+x', 'ctrl+z', 'ctrl+y', 'meta+c', 'meta+v', 'meta+x', 'meta+z']);
/** Browser reload is never taken. */
const RESERVED_COMBOS = new Set(['ctrl+r', 'ctrl+shift+r', 'meta+r', 'meta+shift+r']);

/** Whether the global dispatcher may act on this combo, given where focus is. */
export function mayDispatch(combo: DeskCombo, inEditable: boolean): boolean {
  if (RESERVED_COMBOS.has(combo)) return false;
  if (!inEditable) return true;
  return !isBareCombo(combo) && !NATIVE_TEXT_COMBOS.has(combo);
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag !== 'INPUT') return false;
  const type = (target as HTMLInputElement).type;
  return type !== 'checkbox' && type !== 'radio' && type !== 'button' && type !== 'submit';
}
