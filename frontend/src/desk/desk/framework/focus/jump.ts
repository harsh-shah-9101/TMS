import { commandStandsForCtrl, type DeskKeyInput } from '../keys/combo';

/** One step of Ctrl+Arrow movement. */
export type DeskDir = 'up' | 'down' | 'left' | 'right';

/** A box on screen, in viewport coordinates. */
export interface DeskBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface DeskJumpCandidate<T> {
  id: T;
  box: DeskBox;
}

/** Where a section jump will land. `go` moves focus there. */
export interface DeskJumpStop {
  rect: DeskBox;
  label: string;
  go: () => boolean;
}

/** "items" and "line-dialog" become "Items" and "Line Dialog". */
export function deskJumpLabel(id: string): string {
  const words = id.replace(/[-_]/g, ' ').trim();
  if (!words) return id;
  return words.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const SLACK = 1;
const SIDE_WEIGHT = 2;

function overlaps(start: number, end: number, otherStart: number, otherEnd: number): boolean {
  return Math.min(end, otherEnd) - Math.max(start, otherStart) > SLACK;
}

/** Distance from `from`'s far edge to `box`'s near edge. Negative means the box is not that way. */
function ahead(from: DeskBox, box: DeskBox, dir: DeskDir): number {
  if (dir === 'down') return box.top - from.bottom;
  if (dir === 'up') return from.top - box.bottom;
  if (dir === 'right') return box.left - from.right;
  return from.left - box.right;
}

/** How far the box sits off the axis. Zero when the two ranges overlap. */
function sideOffset(from: DeskBox, box: DeskBox, dir: DeskDir): number {
  const vertical = dir === 'up' || dir === 'down';
  const fromStart = vertical ? from.left : from.top;
  const fromEnd = vertical ? from.right : from.bottom;
  const boxStart = vertical ? box.left : box.top;
  const boxEnd = vertical ? box.right : box.bottom;
  if (overlaps(fromStart, fromEnd, boxStart, boxEnd)) return 0;
  if (boxStart >= fromEnd) return boxStart - fromEnd;
  return fromStart - boxEnd;
}

/**
 * Nearest box in a direction.
 * Score is the gap along the direction plus twice the sideways offset.
 * Left and Right only consider boxes on the same visual row, so a row ends like a grid.
 */
export function pickToward<T>(from: DeskBox, candidates: readonly DeskJumpCandidate<T>[], dir: DeskDir): T | null {
  const horizontal = dir === 'left' || dir === 'right';
  let bestId: T | null = null;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    const box = candidate.box;
    const gap = ahead(from, box, dir);
    if (gap < -SLACK) continue;
    if (horizontal && !overlaps(from.top, from.bottom, box.top, box.bottom)) continue;
    const score = Math.max(0, gap) + SIDE_WEIGHT * sideOffset(from, box, dir);
    if (score < bestScore) {
      bestScore = score;
      bestId = candidate.id;
    }
  }
  return bestId;
}

/** The section after `currentIndex`. -1 means "before the first", so the first section is next. */
export function nextSection<T>(sections: readonly T[], currentIndex: number): T | null {
  const next = currentIndex + 1;
  if (next < 0 || next >= sections.length) return null;
  return sections[next] ?? null;
}

/** How long Ctrl must be held before the landing spot is outlined. */
export const JUMP_HOLD_MS = 150;

export type DeskJumpModifier = 'ctrl' | 'meta';

/** The modifier of the jump binding. Anything else has no preview. */
export function jumpModifier(combo: string | null): DeskJumpModifier | null {
  if (!combo) return null;
  const parts = combo.split('+');
  if (parts.includes('ctrl')) return 'ctrl';
  if (parts.includes('meta')) return 'meta';
  return null;
}

export interface JumpHoldState {
  holding: boolean;
  /** No other key has been pressed since the modifier went down. */
  clean: boolean;
  showing: boolean;
}

export const JUMP_HOLD_IDLE: JumpHoldState = { holding: false, clean: false, showing: false };

export interface JumpHoldStep {
  state: JumpHoldState;
  /** Start the preview timer. */
  arm: boolean;
  /** Hide an outline that is already showing. */
  hide: boolean;
  /** Drop a timer that has not fired yet. */
  cancel: boolean;
}

function holdStep(state: JumpHoldState, arm: boolean, hide: boolean, cancel: boolean): JumpHoldStep {
  return { state, arm, hide, cancel };
}

/** Keyup of Ctrl has `ctrlKey` false, so the key name is what counts. On a Mac, Command is that key. */
function isHold(input: DeskKeyInput, modifier: DeskJumpModifier | null): boolean {
  if (input.alt || input.shift) return false;
  if (modifier === 'ctrl') {
    if (commandStandsForCtrl() && input.key === 'Meta' && !input.ctrl) return true;
    return input.key === 'Control' && !input.meta;
  }
  if (modifier === 'meta') return input.key === 'Meta' && !input.ctrl;
  return false;
}

/** Ctrl going down arms the preview. Any other key cancels it, so Ctrl+S never flashes. */
export function jumpHoldKeyDown(state: JumpHoldState, input: DeskKeyInput, modifier: DeskJumpModifier | null): JumpHoldStep {
  if (isHold(input, modifier)) {
    if (state.holding) return holdStep(state, false, false, false);
    return holdStep({ holding: true, clean: true, showing: false }, true, false, false);
  }
  if (!state.holding && !state.showing) return holdStep(state, false, false, false);
  return holdStep({ holding: false, clean: false, showing: false }, false, state.showing, true);
}

/** Releasing the modifier hides the outline. */
export function jumpHoldKeyUp(state: JumpHoldState, input: DeskKeyInput, modifier: DeskJumpModifier | null): JumpHoldStep {
  if (!isHold(input, modifier)) return holdStep(state, false, false, false);
  return holdStep(JUMP_HOLD_IDLE, false, state.showing, true);
}

/** Called when the hold timer fires. Does nothing if another key already landed. */
export function jumpHoldShow(state: JumpHoldState): JumpHoldState {
  if (!state.holding || !state.clean) return state;
  return { ...state, showing: true };
}
