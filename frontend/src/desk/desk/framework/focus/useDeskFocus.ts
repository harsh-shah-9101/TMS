import { keyInputOf, toCombo } from '../keys/combo';
import { deskActionsFor } from '../keys/deskKeymap';
import { deskLayers, resolveLayerHandler, topDeskLayer, type DeskFocusField, type DeskFocusTarget, type DeskLayer } from '../keys/layers';
import { deskJumpLabel, pickToward, type DeskBox, type DeskDir, type DeskJumpStop } from './jump';

export type { DeskFocusField, DeskFocusTarget, DeskBox, DeskDir, DeskJumpStop };
export type DeskFocusVia = 'enter' | 'tab';

const NAV_MOVE: Record<string, DeskDir> = {
  'desk-move-up': 'up',
  'desk-move-down': 'down',
  'desk-move-left': 'left',
  'desk-move-right': 'right',
};

const NAV_TAB = ['desk-tab-prev', 'desk-tab-next'];

function targetList(targets: DeskFocusTarget | undefined): string[] {
  if (targets === undefined) return [];
  return Array.isArray(targets) ? targets : [targets];
}

/**
 * Next target for Enter or Tab. Explicit targets are tried first, then later fields in order.
 * A field that cannot be focused is skipped. An id outside the list has no next field.
 */
export function resolveDeskEnter(
  orderedIds: readonly string[],
  currentId: string,
  targets: DeskFocusTarget | undefined,
  canFocus: (id: string) => boolean,
): string | null {
  const index = orderedIds.indexOf(currentId);
  if (index < 0) return null;
  for (const id of targetList(targets)) {
    if (id !== 'next' && canFocus(id)) return id;
  }
  for (const id of orderedIds.slice(index + 1)) {
    if (canFocus(id)) return id;
  }
  return null;
}

/** Previous focusable field for Shift+Tab. */
export function resolveDeskPrev(
  orderedIds: readonly string[],
  currentId: string,
  canFocus: (id: string) => boolean,
): string | null {
  const index = orderedIds.indexOf(currentId);
  if (index <= 0) return null;
  for (let at = index - 1; at >= 0; at -= 1) {
    const id = orderedIds[at];
    if (id && canFocus(id)) return id;
  }
  return null;
}

/**
 * Which field opens with focus.
 * False focuses nothing. A field id wins when that field can be focused.
 * Otherwise a field marked initial, otherwise the first focusable field.
 */
export function pickInitialFieldId(
  orderedIds: readonly string[],
  preference: string | false | undefined,
  markedId: string | null,
  canFocus: (id: string) => boolean,
): string | null {
  if (preference === false) return null;
  if (typeof preference === 'string' && canFocus(preference)) return preference;
  if (markedId && canFocus(markedId)) return markedId;
  return orderedIds.find((id) => canFocus(id)) ?? null;
}

function shown(node: HTMLElement): boolean {
  return node.getClientRects().length > 0;
}

/** Field nodes that belong to this layer, not to a dialog layer nested inside it. */
function ownNodes(layer: DeskLayer): HTMLElement[] {
  const root = layer.root;
  if (!root) return [];
  return [...root.querySelectorAll<HTMLElement>('[data-desk-field]')].filter(
    (node) => node.parentElement?.closest('[data-desk-layer]') === root,
  );
}

function nodeIn(layer: DeskLayer, id: string): HTMLElement | null {
  return ownNodes(layer).find((node) => node.getAttribute('data-desk-field') === id) ?? null;
}

/** Field ids of a layer in page order. */
function layerIds(layer: DeskLayer): string[] {
  return ownNodes(layer)
    .map((node) => node.getAttribute('data-desk-field') ?? '')
    .filter((id) => id !== '');
}

function layerOf(id: string): DeskLayer | null {
  const layers = deskLayers();
  for (let index = layers.length - 1; index >= 0; index -= 1) {
    const layer = layers[index];
    if (layer && nodeIn(layer, id)) return layer;
  }
  return null;
}

function canFocusIn(layer: DeskLayer, id: string): boolean {
  const field = layer.fields.get(id);
  if (field?.visible && !field.visible()) return false;
  const node = nodeIn(layer, id);
  return Boolean(node && shown(node));
}

function focusNode(node: HTMLElement): boolean {
  const inner = node.matches('input, textarea, select') ? node : node.querySelector<HTMLElement>('input, textarea, select');
  const target = inner && shown(inner) ? inner : node;
  target.focus();
  return document.activeElement === target || node.contains(document.activeElement);
}

function focusIn(layer: DeskLayer, id: string): boolean {
  if (!canFocusIn(layer, id)) return false;
  const field = layer.fields.get(id);
  if (field?.focus) return field.focus();
  const node = nodeIn(layer, id);
  return node ? focusNode(node) : false;
}

/** Enter on a checkbox moves to the next field. Space still toggles the box. Modified Enter is left for jump. */
export function onDeskCheckboxKey(event: KeyboardEvent): void {
  if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey || event.defaultPrevented) return;
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || target.type !== 'checkbox') return;
  const id = target.getAttribute('data-desk-field');
  if (!id) return;
  event.preventDefault();
  focusNextDeskField(id);
}

/** Focus a field in the topmost layer that owns it. */
export function focusDeskField(id: string): boolean {
  const layer = layerOf(id);
  return layer ? focusIn(layer, id) : false;
}

/**
 * Enter or Tab from a field. Tab follows `onTab`, else the Enter path.
 * At the end of a dialog, Enter accepts it and Tab wraps to its first field.
 */
export function focusNextDeskField(id: string, via: DeskFocusVia = 'enter'): boolean {
  const layer = layerOf(id);
  if (!layer) return false;
  const ids = layerIds(layer);
  const field = layer.fields.get(id);
  const can = (target: string): boolean => canFocusIn(layer, target);
  const targets = via === 'tab' ? (field?.onTab ?? field?.onEnter) : field?.onEnter;
  const next = resolveDeskEnter(ids, id, targets, can);
  if (next) return focusIn(layer, next);
  if (!layer.modal) return false;
  if (via === 'enter') {
    layer.onAccept?.();
    return true;
  }
  const first = ids.find(can);
  return first ? focusIn(layer, first) : false;
}

/** Shift+Tab. Wraps to the last field inside a dialog. */
export function focusPrevDeskField(id: string): boolean {
  const layer = layerOf(id);
  if (!layer) return false;
  const ids = layerIds(layer);
  const can = (target: string): boolean => canFocusIn(layer, target);
  const prev = resolveDeskPrev(ids, id, can) ?? (layer.modal ? [...ids].reverse().find(can) ?? null : null);
  return prev ? focusIn(layer, prev) : false;
}

function skipsAutoFocus(layer: DeskLayer, id: string): boolean {
  if (layer.fields.get(id)?.noAutoFocus) return true;
  return nodeIn(layer, id)?.hasAttribute('data-desk-noauto') ?? false;
}

function markedInitial(layer: DeskLayer, ids: string[]): string | null {
  return ids.find((id) => layer.fields.get(id)?.initial || nodeIn(layer, id)?.hasAttribute('data-desk-initial')) ?? null;
}

function boxOf(rect: DOMRect): DeskBox | null {
  if (rect.width === 0 && rect.height === 0) return null;
  return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
}

function fieldBox(layer: DeskLayer, id: string): DeskBox | null {
  const node = nodeIn(layer, id);
  if (!node) return null;
  const inner = node.matches('input, textarea, select, button')
    ? node
    : node.querySelector<HTMLElement>('input, textarea, select, button');
  const target = inner instanceof HTMLElement && shown(inner) ? inner : node;
  return boxOf(target.getBoundingClientRect());
}

function labelText(node: HTMLElement): string {
  const wrapping = node.closest('label');
  const own = wrapping ? textOf(wrapping) : '';
  if (own) return own;
  const id = node.id || node.getAttribute('data-desk-field') || '';
  if (!id) return '';
  const root = node.closest('[data-desk-layer]');
  const labeled = root?.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(id)}"]`);
  return labeled ? textOf(labeled) : '';
}

function textOf(label: HTMLElement): string {
  for (const child of label.childNodes) {
    if (child.nodeType !== Node.TEXT_NODE) continue;
    const text = child.textContent?.trim() ?? '';
    if (text) return text;
  }
  return '';
}

function layerSections(layer: DeskLayer): HTMLElement[] {
  const root = layer.root;
  if (!root) return [];
  return [...root.querySelectorAll<HTMLElement>('[data-desk-section]')].filter(
    (node) => node.closest('[data-desk-layer]') === root,
  );
}

function sectionFields(layer: DeskLayer, section: HTMLElement): string[] {
  return ownNodes(layer)
    .filter((node) => node.closest('[data-desk-section]') === section)
    .map((node) => node.getAttribute('data-desk-field') ?? '')
    .filter((id) => id !== '' && canFocusIn(layer, id));
}

/** The section's entry field, or its first field that can take focus. */
function sectionEntry(layer: DeskLayer, section: HTMLElement): string | null {
  const marked = [...section.querySelectorAll<HTMLElement>('[data-desk-entry]')].find(
    (node) => node.closest('[data-desk-section]') === section && node.closest('[data-desk-layer]') === layer.root,
  );
  const markedId =
    marked?.getAttribute('data-desk-field') ??
    marked?.querySelector<HTMLElement>('[data-desk-field]')?.getAttribute('data-desk-field') ??
    '';
  if (markedId && canFocusIn(layer, markedId)) return markedId;
  return sectionFields(layer, section)[0] ?? null;
}

function stopLabel(node: HTMLElement | null, section: HTMLElement | null, id: string): string {
  const fromField = node ? labelText(node) : '';
  if (fromField) return fromField;
  const sectionId = section?.getAttribute('data-desk-section') ?? id;
  return deskJumpLabel(sectionId);
}

function stopFor(layer: DeskLayer, id: string): DeskJumpStop | null {
  const custom = layer.fields.get(id)?.jumpTo?.();
  if (custom) return custom;
  if (!canFocusIn(layer, id)) return null;
  const rect = fieldBox(layer, id);
  if (!rect) return null;
  const node = nodeIn(layer, id);
  const section = node?.closest('[data-desk-section]');
  return {
    rect,
    label: stopLabel(node, section instanceof HTMLElement ? section : null, id),
    go: () => focusIn(layer, id),
  };
}

/** The field that currently has focus, when it belongs to the top layer. */
function focusedField(): { layer: DeskLayer; id: string } | null {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return null;
  const node = active.closest('[data-desk-field]');
  if (!(node instanceof HTMLElement)) return null;
  const id = node.getAttribute('data-desk-field') ?? '';
  if (!id) return null;
  const layer = layerOf(id);
  if (!layer || layer !== topDeskLayer() || !nodeIn(layer, id)) return null;
  return { layer, id };
}

/**
 * Where Ctrl+Enter will land from the focused field.
 * A field hook wins, then `onJump`, then the next section's entry.
 */
export function resolveDeskJump(): DeskJumpStop | null {
  const current = focusedField();
  if (!current) return null;
  const { layer, id } = current;
  const field = layer.fields.get(id);
  const hooked = field?.jumpFrom?.();
  if (hooked) return hooked;
  if (field?.onJump) {
    const can = (target: string): boolean => canFocusIn(layer, target);
    const chosen = resolveDeskEnter(layerIds(layer), id, field.onJump, can);
    if (chosen) {
      const stop = stopFor(layer, chosen);
      if (stop) return stop;
    }
  }
  const sections = layerSections(layer);
  const host = nodeIn(layer, id);
  const section = host?.closest('[data-desk-section]');
  const index = section instanceof HTMLElement ? sections.indexOf(section) : -1;
  for (let at = index + 1; at < sections.length; at += 1) {
    const next = sections[at];
    if (!next) continue;
    const entry = sectionEntry(layer, next);
    if (!entry) continue;
    const stop = stopFor(layer, entry);
    if (stop) return stop;
  }
  return null;
}

/**
 * Move to the nearest field in a direction, using on-screen positions.
 * A field with `focusNear` (a grid) chooses the cell. Otherwise the field itself is focused.
 */
export function focusDeskToward(dir: DeskDir, fromId?: string, fromBox?: DeskBox): boolean {
  const layer = fromId ? layerOf(fromId) : (focusedField()?.layer ?? null);
  if (!layer || layer !== topDeskLayer()) return false;
  const originId = fromId ?? focusedField()?.id ?? '';
  const origin = fromBox ?? (originId ? fieldBox(layer, originId) : null);
  if (!origin) return false;
  const candidates = ownNodes(layer).flatMap((node) => {
    const id = node.getAttribute('data-desk-field') ?? '';
    if (!id || id === originId || !canFocusIn(layer, id)) return [];
    const box = fieldBox(layer, id);
    return box ? [{ id, box }] : [];
  });
  const id = pickToward(origin, candidates, dir);
  if (!id) return false;
  const field = layer.fields.get(id);
  if (field?.focusNear?.(origin, dir)) return true;
  return focusIn(layer, id);
}

function navActions(event: KeyboardEvent): readonly string[] {
  const combo = toCombo(keyInputOf(event));
  return combo ? deskActionsFor(combo) : [];
}

/** True for the four Ctrl+Arrow field-move action ids. */
export function isDeskMoveAction(id: string): boolean {
  return id in NAV_MOVE;
}

/**
 * True when Ctrl+Arrow is not a field move for a key pressed on this target: the top layer
 * turned it off, or the target sits inside a `data-desk-no-move` element.
 */
export function isDeskMoveOff(target: EventTarget | null): boolean {
  if (topDeskLayer()?.disableSpatialMove) return true;
  return target instanceof Element && target.closest('[data-desk-no-move]') !== null;
}

/** A tab key only counts while some page or dialog has a handler for it. Otherwise the key stays native. */
function tabHandled(id: string): boolean {
  return NAV_TAB.includes(id) && resolveLayerHandler(deskLayers(), [id]) !== null;
}

/** True when this key changes tabs on the current page. Widgets and grids let it bubble. */
export function isDeskTabKey(event: KeyboardEvent): boolean {
  if (!event.ctrlKey && !event.metaKey) return false;
  return navActions(event).some(tabHandled);
}

/**
 * True when this key is the section jump, a Ctrl+Arrow field move, or a tab change.
 * Widgets let it bubble.
 */
export function isDeskNavKey(event: KeyboardEvent): boolean {
  if (!event.ctrlKey && !event.metaKey) return false;
  const off = isDeskMoveOff(event.target);
  return navActions(event).some((id) => id === 'desk-jump' || (id in NAV_MOVE && !off) || tabHandled(id));
}

/** Direction of a Ctrl+Arrow field move, or null when this key is not one or moves are off here. */
export function deskMoveDir(event: KeyboardEvent): DeskDir | null {
  if (isDeskMoveOff(event.target)) return null;
  for (const id of navActions(event)) {
    const dir = NAV_MOVE[id];
    if (dir) return dir;
  }
  return null;
}

/** True when this key is the section jump. */
export function isDeskJumpKey(event: KeyboardEvent): boolean {
  return navActions(event).includes('desk-jump');
}

/** Initial-focus pass for a page or dialog that just opened. Fields and grids take part alike. */
export function focusLayerInitial(layer: DeskLayer | null = topDeskLayer()): boolean {
  if (!layer || layer.disableInitialFocus) return false;
  const candidates = layerIds(layer).filter((id) => !skipsAutoFocus(layer, id));
  const can = (id: string): boolean => canFocusIn(layer, id);
  const id = pickInitialFieldId(candidates, layer.initialFocus, markedInitial(layer, candidates), can);
  return id ? focusIn(layer, id) : false;
}
