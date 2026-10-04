import { toCombo, type DeskKeyInput } from './combo';

/** Tap and release Alt alone to arm the menu, or press Alt+letter directly. */
export interface AltTapState {
  holding: boolean;
  clean: boolean;
  armed: boolean;
}

export const ALT_IDLE: AltTapState = { holding: false, clean: false, armed: false };

export interface AltTapStep {
  state: AltTapState;
  /** Letter or digit pressed while armed. The caller decides if the menu takes it. */
  letter?: string;
  /** Swallow the event (Escape while armed, Alt release). */
  consume: boolean;
}

function isAlt(input: DeskKeyInput): boolean {
  return input.key === 'Alt' && !input.ctrl && !input.meta && !input.shift;
}

export function altTapKeyDown(state: AltTapState, input: DeskKeyInput, allowed: boolean): AltTapStep {
  if (isAlt(input)) return { state: { ...state, holding: true, clean: true }, consume: false };

  // Support direct Alt+Letter combination (e.g. Alt+M, Alt+O, Alt+D, Alt+F, Alt+I, Alt+A)
  // Exclude action-bound keys like 'n' (action-new), 'r' (action-refresh), 'e' (export), 'c' (tally new)
  if (input.alt && !input.ctrl && !input.meta && allowed) {
    const rawKey = (input.key || '').toLowerCase();
    if (/^[a-z0-9]$/.test(rawKey) && !['n', 'c', 'r', 'e', 's', 'x'].includes(rawKey)) {
      return {
        state: { holding: true, clean: false, armed: true },
        letter: rawKey,
        consume: true,
      };
    }
  }

  if (state.holding) return { state: { ...state, clean: false, armed: false }, consume: false };
  if (!state.armed) return { state, consume: false };
  const next = { ...state, armed: false };
  if (!allowed) return { state: next, consume: false };
  if (input.key === 'Escape') return { state: next, consume: true };
  const combo = toCombo(input);
  if (combo && /^[a-z0-9]$/.test(combo)) return { state: next, letter: combo, consume: false };
  return { state: next, consume: false };
}

export function altTapKeyUp(state: AltTapState, input: DeskKeyInput, allowed: boolean): AltTapStep {
  if (input.key !== 'Alt') return { state, consume: false };
  const tapped = state.holding && state.clean;
  return {
    state: { holding: false, clean: false, armed: tapped && allowed ? !state.armed : false },
    consume: tapped,
  };
}
