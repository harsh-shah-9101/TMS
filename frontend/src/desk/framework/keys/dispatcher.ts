import { ref, shallowRef } from 'vue';
import { isDeskMoveAction, isDeskMoveOff, resolveDeskJump } from '../focus/useDeskFocus';
import {
  JUMP_HOLD_IDLE,
  JUMP_HOLD_MS,
  jumpHoldKeyDown,
  jumpHoldKeyUp,
  jumpHoldShow,
  jumpModifier,
  type JumpHoldState,
} from '../focus/jump';
import { ALT_IDLE, altTapKeyDown, altTapKeyUp, type AltTapState } from './altTap';
import { isEditableTarget, keyInputOf, mayDispatch, toCombo } from './combo';
import { deskActionsFor, deskComboFor, deskJumpPreview } from './deskKeymap';
import { deskLayers, hasModalDeskLayer, resolveLayerHandler } from './layers';

/** The one outline for a section jump. Null unless the jump key is being held. */
export const deskJumpPeek = shallowRef<{ left: number; top: number; width: number; height: number; label: string } | null>(null);

/** True between an Alt tap and the next key. The shell underlines menu letters while it is set. */
export const deskMenuArmed = ref(false);

let installed = false;
let disarmDeskMenuImpl = (): void => {
  deskMenuArmed.value = false;
};

/** Leave the Alt-tap menu mode so the next keys go back to the page. */
export function disarmDeskMenu(): void {
  disarmDeskMenuImpl();
}

/**
 * What a desk page did with a key.
 * - `handled`: a desk handler ran.
 * - `blocked`: nobody else may act, for example a desk dialog is open or the user is typing.
 * - `pass`: desk has no use for it, so a host with its own global keys may run them.
 */
export type DeskKeyVerdict = 'handled' | 'blocked' | 'pass';

/**
 * Run a key through the desk layer stack. The standalone shell calls it from its own
 * listener. A host that owns other global keys calls it from its listener and runs
 * those keys only on `pass`.
 */
export function dispatchDeskKey(event: KeyboardEvent): DeskKeyVerdict {
  if (event.isComposing || event.repeat) return 'blocked';
  const combo = toCombo(keyInputOf(event));
  if (!combo) return 'pass';
  if (!mayDispatch(combo, isEditableTarget(event.target))) return 'blocked';
  const moveOff = isDeskMoveOff(event.target);
  const ids = deskActionsFor(combo).filter((id) => !(moveOff && isDeskMoveAction(id)));
  const handler = ids.length > 0 ? resolveLayerHandler(deskLayers(), ids) : null;
  if (handler) {
    event.preventDefault();
    handler.run();
    return 'handled';
  }
  return hasModalDeskLayer() ? 'blocked' : 'pass';
}

/**
 * Install desk keyboard handling once for the shell. Returns the uninstall function.
 *
 * Capture keydown and keyup only track the Alt tap, so a widget that stops propagation
 * cannot confuse it. Shortcuts run on bubble keydown, after the focused widget: anything
 * it consumed with `preventDefault` never reaches a shortcut.
 *
 * `embedded` is for desk pages inside another shell. That shell keeps its own menu bar and
 * calls `dispatchDeskKey` itself, so only the jump preview is tracked here.
 */
export function installDeskKeys(options: {
  /** `stay` keeps the Alt tap armed so the next letter walks the open submenu. */
  menuLetter?: (letter: string) => boolean | 'stay';
  embedded?: boolean;
} = {}): () => void {
  if (installed) return () => undefined;
  installed = true;
  const embedded = options.embedded === true;
  let alt: AltTapState = ALT_IDLE;
  let jump: JumpHoldState = JUMP_HOLD_IDLE;
  let jumpTimer = 0;
  disarmDeskMenuImpl = () => setAlt(ALT_IDLE);

  function clearJumpTimer(): void {
    if (!jumpTimer) return;
    clearTimeout(jumpTimer);
    jumpTimer = 0;
  }

  function hidePeek(): void {
    if (!deskJumpPeek.value) return;
    deskJumpPeek.value = null;
    window.removeEventListener('wheel', dismissPeek, true);
    window.removeEventListener('mousedown', dismissPeek, true);
  }

  function dismissPeek(): void {
    jump = { ...jump, clean: false, showing: false };
    hidePeek();
  }

  function showPeek(): void {
    const stop = resolveDeskJump();
    if (!stop) {
      jump = { ...jump, showing: false };
      return;
    }
    deskJumpPeek.value = {
      left: stop.rect.left,
      top: stop.rect.top,
      width: stop.rect.right - stop.rect.left,
      height: stop.rect.bottom - stop.rect.top,
      label: stop.label,
    };
    window.addEventListener('wheel', dismissPeek, true);
    window.addEventListener('mousedown', dismissPeek, true);
  }

  /** Preview only. The jump itself is a normal shortcut on the bubble listener. */
  function syncJump(event: KeyboardEvent, phase: 'down' | 'up'): void {
    const key = event.key;
    if (!jump.holding && !jump.showing && !event.ctrlKey && !event.metaKey && key !== 'Control' && key !== 'Meta') return;
    if (!deskJumpPreview()) {
      hidePeek();
      return;
    }
    const modifier = jumpModifier(deskComboFor('desk-jump'));
    const step =
      phase === 'down'
        ? jumpHoldKeyDown(jump, keyInputOf(event), modifier)
        : jumpHoldKeyUp(jump, keyInputOf(event), modifier);
    jump = step.state;
    if (step.cancel) clearJumpTimer();
    if (step.hide) hidePeek();
    if (!step.arm) return;
    clearJumpTimer();
    jumpTimer = window.setTimeout(() => {
      jumpTimer = 0;
      jump = jumpHoldShow(jump);
      if (jump.showing) showPeek();
    }, JUMP_HOLD_MS);
  }

  function setAlt(next: AltTapState): void {
    alt = next;
    if (deskMenuArmed.value !== next.armed) deskMenuArmed.value = next.armed;
  }

  function onCaptureDown(event: KeyboardEvent): void {
    if (event.isComposing) return;
    syncJump(event, 'down');
    if (embedded) return;
    const step = altTapKeyDown(alt, keyInputOf(event), !hasModalDeskLayer());
    setAlt(step.state);
    if (step.letter) {
      const taken = options.menuLetter?.(step.letter) ?? false;
      if (taken) {
        step.consume = true;
        if (taken === 'stay') setAlt({ ...step.state, armed: true });
      }
    }
    if (!step.consume) return;
    event.preventDefault();
    event.stopPropagation();
  }

  function onCaptureUp(event: KeyboardEvent): void {
    syncJump(event, 'up');
    if (embedded) return;
    const step = altTapKeyUp(alt, keyInputOf(event), !hasModalDeskLayer());
    setAlt(step.state);
    if (step.consume) event.preventDefault();
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (event.defaultPrevented) return;
    dispatchDeskKey(event);
  }

  function onBlur(): void {
    setAlt(ALT_IDLE);
    jump = JUMP_HOLD_IDLE;
    clearJumpTimer();
    hidePeek();
  }

  window.addEventListener('keydown', onCaptureDown, true);
  window.addEventListener('keyup', onCaptureUp, true);
  if (!embedded) window.addEventListener('keydown', onKeyDown);
  window.addEventListener('blur', onBlur);
  return () => {
    window.removeEventListener('keydown', onCaptureDown, true);
    window.removeEventListener('keyup', onCaptureUp, true);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('blur', onBlur);
    setAlt(ALT_IDLE);
    jump = JUMP_HOLD_IDLE;
    clearJumpTimer();
    hidePeek();
    disarmDeskMenuImpl = () => {
      deskMenuArmed.value = false;
    };
    installed = false;
  };
}
