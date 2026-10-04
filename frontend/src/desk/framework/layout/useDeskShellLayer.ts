import { ref } from 'vue';
import { focusDeskToward, resolveDeskJump } from '../focus/useDeskFocus';
import { provideDeskLayer } from '../keys/useDeskLayer';

/**
 * The bottom desk layer of any host: the field-move and section-jump keys.
 * `DeskShell` and the in-app embed host both call it. A page turns Ctrl+Arrow off with
 * `disable-spatial-move`, a widget with `data-desk-no-move`.
 */
export function useDeskShellLayer(): void {
  provideDeskLayer({
    root: ref(null),
    handlers: {
      'desk-jump': { always: true, run: () => resolveDeskJump()?.go() },
      'desk-move-up': { always: true, run: () => focusDeskToward('up') },
      'desk-move-down': { always: true, run: () => focusDeskToward('down') },
      'desk-move-left': { always: true, run: () => focusDeskToward('left') },
      'desk-move-right': { always: true, run: () => focusDeskToward('right') },
    },
    disableInitialFocus: () => true,
  });
}
