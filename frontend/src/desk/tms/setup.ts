import { configureDesk, loadDeskKeymap } from './ui';
import { tmsActionLabel, TMS_MENU } from './menu/menu';
import { DEFAULT_TMS_PRESET, TMS_PRESET_BINDINGS, TMS_PRESETS } from './keys/presets';
import { searchLookup } from './lookups/search';

let configured = false;
let loadedFor: number | string | null | undefined;

/** Point the desk framework at TMS presets, labels, lookup searches, and load this user's keymap. */
export function setupTmsDesk(userId: number | string | null | undefined): void {
  if (!configured) {
    configureDesk({
      presets: TMS_PRESET_BINDINGS,
      presetLabels: TMS_PRESETS,
      defaultPreset: DEFAULT_TMS_PRESET,
      label: tmsActionLabel,
      initialPreset: () => null,
      searchLookup,
    });
    configured = true;
  }
  if (loadedFor === userId) return;
  loadDeskKeymap(userId as number | null | undefined);
  loadedFor = userId;
}

export { TMS_MENU };
