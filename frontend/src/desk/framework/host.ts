import type { DeskLookupConfig } from './grid/types';
import type { DeskBindings } from './keys/keymap';

/** A named shortcut preset shown in the keys dialog. */
export interface DeskPresetChoice {
  id: string;
  label: string;
}

/**
 * What a host app gives the framework. The framework does not import the ERP.
 * Call `configureDesk` once, before `loadDeskKeymap` and before any lookup opens.
 */
export interface DeskHost {
  presets: Record<string, DeskBindings>;
  presetLabels: DeskPresetChoice[];
  defaultPreset: string;
  /** Human name for an action id, used in the keys dialog. */
  label: (actionId: string) => string;
  /** Preset to use when this user has none stored. Ankpal reads the classic `shortcutSet` key. */
  initialPreset?: () => string | null;
  /** Lookup search. The framework draws the box; the host talks to its API. */
  searchLookup?: (lookup: DeskLookupConfig, query: string) => Promise<Record<string, unknown>[]>;
}

const fallback: DeskHost = {
  presets: {},
  presetLabels: [],
  defaultPreset: '',
  label: (actionId) => actionId,
};

let current: DeskHost = fallback;

export function configureDesk(next: DeskHost): void {
  current = next;
}

export function deskHost(): DeskHost {
  return current;
}
