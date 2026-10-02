import type { DeskBox, DeskDir, DeskJumpStop } from '../focus/jump';

/** Where Enter or Tab goes: field ids tried in order. A hidden or missing field is skipped. */
export type DeskFocusTarget = string | string[];

export interface DeskFocusField {
  id: string;
  onEnter?: DeskFocusTarget;
  /** Where Tab goes. Omit to follow `onEnter`, so Tab works like Enter. */
  onTab?: DeskFocusTarget;
  /** Where Ctrl+Enter jumps. Omit to jump to the next section. */
  onJump?: DeskFocusTarget;
  /**
   * This field handles the jump itself, for example a grid cell that opens a line dialog.
   * Return null to keep the normal section jump.
   */
  jumpFrom?: () => DeskJumpStop | null;
  /** Where a jump that lands on this field actually goes, for example the first blank item row. */
  jumpTo?: () => DeskJumpStop | null;
  /** Ctrl+Arrow landed on this field from a neighbour. Return true when it took focus. */
  focusNear?: (from: DeskBox, dir: DeskDir) => boolean;
  visible?: () => boolean;
  /** Custom focus, used by a grid so it lands on its first cell instead of an input. */
  focus?: () => boolean;
  /** Takes focus when its page or dialog opens. The first such field wins. */
  initial?: boolean;
  /** Left out of the initial-focus pass. Still reachable by Enter and Tab. */
  noAutoFocus?: boolean;
}

export interface DeskKeyHandler {
  run: () => void;
  /** Still runs while a modal layer (a dialog) is open above this one. */
  always?: boolean;
}

export type DeskHandlerInput = (() => void) | DeskKeyHandler;

/** One page, dialog or the shell. Owns its key handlers and its focus scope. */
export interface DeskLayer {
  readonly id: number;
  modal: boolean;
  root: HTMLElement | null;
  handlers: Map<string, DeskKeyHandler>;
  fields: Map<string, DeskFocusField>;
  initialFocus: string | undefined;
  disableInitialFocus: boolean;
  /** Ctrl+Arrow is not a field move while this layer is on top, so the caret keeps the browser's word jump. */
  disableSpatialMove: boolean;
  /** Enter on the last field of a modal layer. */
  onAccept: (() => void) | undefined;
}

let nextId = 1;
let nextAutoField = 1;
const stack: DeskLayer[] = [];

/** Field id for a widget that has none, such as a grid without `fieldId`. */
export function autoDeskFieldId(prefix: string): string {
  const id = `${prefix}-${nextAutoField}`;
  nextAutoField += 1;
  return id;
}

export function createDeskLayer(modal = false): DeskLayer {
  const layer: DeskLayer = {
    id: nextId,
    modal,
    root: null,
    handlers: new Map(),
    fields: new Map(),
    initialFocus: undefined,
    disableInitialFocus: false,
    disableSpatialMove: false,
    onAccept: undefined,
  };
  nextId += 1;
  return layer;
}

export function pushDeskLayer(layer: DeskLayer): void {
  if (!stack.includes(layer)) stack.push(layer);
}

export function popDeskLayer(layer: DeskLayer): void {
  const index = stack.indexOf(layer);
  if (index >= 0) stack.splice(index, 1);
}

export function deskLayers(): readonly DeskLayer[] {
  return stack;
}

export function topDeskLayer(): DeskLayer | null {
  return stack[stack.length - 1] ?? null;
}

export function hasModalDeskLayer(): boolean {
  return stack.some((layer) => layer.modal);
}

function asHandler(input: DeskHandlerInput): DeskKeyHandler {
  return typeof input === 'function' ? { run: input } : input;
}

/** Register handlers on a layer. The returned function removes only what it added. */
export function addDeskHandlers(layer: DeskLayer, handlers: Record<string, DeskHandlerInput>): () => void {
  const added = Object.entries(handlers).map(([id, input]) => {
    const handler = asHandler(input);
    layer.handlers.set(id, handler);
    return [id, handler] as const;
  });
  return () => {
    for (const [id, handler] of added) {
      if (layer.handlers.get(id) === handler) layer.handlers.delete(id);
    }
  };
}

export function addDeskFields(layer: DeskLayer, fields: DeskFocusField[]): () => void {
  for (const field of fields) layer.fields.set(field.id, field);
  return () => {
    for (const field of fields) {
      if (layer.fields.get(field.id) === field) layer.fields.delete(field.id);
    }
  };
}

/**
 * First handler for any of the action ids, walking from the top layer down.
 * Below a modal layer only handlers marked `always` still run.
 */
export function resolveLayerHandler(layers: readonly DeskLayer[], actionIds: readonly string[]): DeskKeyHandler | null {
  let blocked = false;
  for (let index = layers.length - 1; index >= 0; index -= 1) {
    const layer = layers[index];
    if (!layer) continue;
    for (const id of actionIds) {
      const handler = layer.handlers.get(id);
      if (handler && (!blocked || handler.always)) return handler;
    }
    if (layer.modal) blocked = true;
  }
  return null;
}

/** Run an action through the same stack a key press uses. Used by toolbar buttons. */
export function runDeskAction(actionId: string): boolean {
  const handler = resolveLayerHandler(stack, [actionId]);
  if (!handler) return false;
  handler.run();
  return true;
}
