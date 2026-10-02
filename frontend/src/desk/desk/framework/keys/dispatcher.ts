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
 * Install desk keyboard handling once for the shell. Returns the uninstall function.
 *
 * Capture keydown and keyup only track the Alt tap, so a widget that stops propagation
 * cannot confuse it. Shortcuts run on bubble keydown, after the focused widget: anything
 * it consumed with `preventDefault` never reaches a shortcut.
 */
export function installDeskKeys(options: {
  /** `stay` keeps the Alt tap armed so the next letter walks the open submenu. */
  menuLetter: (letter: string) => boolean | 'stay';
}): () => void {
  if (installed) return () => undefined;
  installed = true;
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
    const step = altTapKeyDown(alt, keyInputOf(event), !hasModalDeskLayer());
    setAlt(step.state);
    if (step.letter) {
      const taken = options.menuLetter(step.letter);
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
    const step = altTapKeyUp(alt, keyInputOf(event), !hasModalDeskLayer());
    setAlt(step.state);
    if (step.consume) event.preventDefault();
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (event.defaultPrevented || event.isComposing || event.repeat) return;
    const combo = toCombo(keyInputOf(event));
    if (!combo || !mayDispatch(combo, isEditableTarget(event.target))) return;
    const moveOff = isDeskMoveOff(event.target);
    const ids = deskActionsFor(combo).filter((id) => !(moveOff && isDeskMoveAction(id)));
    if (ids.length === 0) return;
    const handler = resolveLayerHandler(deskLayers(), ids);
    if (!handler) return;
    event.preventDefault();
    handler.run();
  }

  function onBlur(): void {
    setAlt(ALT_IDLE);
    jump = JUMP_HOLD_IDLE;
    clearJumpTimer();
    hidePeek();
  }

  window.addEventListener('keydown', onCaptureDown, true);
  window.addEventListener('keyup', onCaptureUp, true);
  window.addEventListener('keydown', onKeyDown);
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
