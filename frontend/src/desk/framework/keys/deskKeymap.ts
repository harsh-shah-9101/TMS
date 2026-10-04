import { ref } from 'vue';
import { deskHost } from '../host';
import { formatCombo, presetToCombo, type DeskCombo } from './combo';
import { bindingSource, comboConflicts, indexBindings, mergeBindings, type DeskBindingSource, type DeskBindings } from './keymap';

/** Bumped on every keymap change so labels re-render. Nothing reads it per keystroke. */
export const deskKeymapRevision = ref(0);

let storageKey = '';
let preset = '';
let overrides: DeskBindings = {};
let bindings: DeskBindings = mergeBindings({}, {});
let index = indexBindings(bindings);

interface StoredKeymap {
  preset?: unknown;
  bindings?: unknown;
  jumpPreview?: unknown;
}

/** Outlining the jump target while its modifier is held. On unless the user turned it off. */
let jumpPreview = true;

function rebuild(): void {
  bindings = mergeBindings(deskHost().presets[preset] ?? {}, overrides);
  index = indexBindings(bindings);
  deskKeymapRevision.value += 1;
}

function parseBindings(raw: unknown): DeskBindings {
  if (!raw || typeof raw !== 'object') return {};
  const out: DeskBindings = {};
  for (const [id, keys] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(keys) && keys.every((key) => typeof key === 'string')) out[id] = keys;
  }
  return out;
}

function readStored(): StoredKeymap {
  if (!storageKey) return {};
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? '{}') as StoredKeymap;
  } catch {
    return {};
  }
}

function write(): void {
  if (!storageKey) return;
  localStorage.setItem(storageKey, JSON.stringify({ preset, bindings: overrides, jumpPreview }));
}

/**
 * Load this user's preset and custom bindings. Called once when the desk shell mounts.
 * Call `configureDesk` first. The host may supply a starting preset when none is stored.
 */
export function loadDeskKeymap(userId: string | number | null | undefined): void {
  storageKey = userId === null || userId === undefined || userId === '' ? '' : `desk.keys.${String(userId)}`;
  const stored = readStored();
  const seeded = deskHost().initialPreset?.() ?? null;
  const wanted = typeof stored.preset === 'string' ? stored.preset : seeded;
  const available = deskHost().presets;
  preset = wanted && available[wanted] ? wanted : deskHost().defaultPreset;
  overrides = parseBindings(stored.bindings);
  jumpPreview = stored.jumpPreview !== false;
  rebuild();
}

/** Whether holding the jump key outlines where it will land. */
export function deskJumpPreview(): boolean {
  void deskKeymapRevision.value;
  return jumpPreview;
}

export function setDeskJumpPreview(on: boolean): void {
  jumpPreview = on;
  write();
  deskKeymapRevision.value += 1;
}

export function deskPresetId(): string {
  void deskKeymapRevision.value;
  return preset;
}

export function setDeskPreset(id: string): void {
  if (!deskHost().presets[id]) return;
  preset = id;
  write();
  rebuild();
}

export function deskActionsFor(combo: DeskCombo): readonly string[] {
  return index.get(combo) ?? [];
}

export function deskComboFor(actionId: string): DeskCombo | null {
  return presetToCombo(bindings[actionId] ?? []);
}

/** Display label such as `Ctrl+S`. Reactive through `deskKeymapRevision`. */
export function deskKeyLabel(actionId: string): string {
  void deskKeymapRevision.value;
  return formatCombo(deskComboFor(actionId));
}

/** An empty list unbinds the action. */
export function setDeskBinding(actionId: string, keys: string[]): void {
  overrides = { ...overrides, [actionId]: keys };
  write();
  rebuild();
}

export function resetDeskBindings(): void {
  overrides = {};
  write();
  rebuild();
}

export function deskConflicts(actionId: string, combo: DeskCombo): string[] {
  return comboConflicts(bindings, actionId, combo);
}

export interface DeskBindingRow extends Record<string, unknown> {
  id: string;
  action: string;
  keys: string;
  source: DeskBindingSource;
}

export function deskBindingRows(): DeskBindingRow[] {
  void deskKeymapRevision.value;
  const label = deskHost().label;
  return Object.keys(bindings)
    .map((id) => ({
      id,
      action: label(id),
      keys: formatCombo(deskComboFor(id)),
      source: bindingSource(id, overrides),
    }))
    .sort((a, b) => a.action.localeCompare(b.action));
}
