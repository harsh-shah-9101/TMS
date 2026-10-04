<template>
  <Teleport to="body">
    <div v-if="open" ref="root" class="desk-dialog" data-desk-layer @mousedown.self="close" @keydown.esc="onEscape" @keydown="onDeskCheckboxKey">
      <div class="desk-dialog-panel">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { provideDeskLayer } from '../keys/useDeskLayer';
import { onDeskCheckboxKey } from '../focus/useDeskFocus';
import type { DeskHandlerInput } from '../keys/layers';

const open = defineModel<boolean>('open', { required: true });
const props = withDefaults(
  defineProps<{
    initialFocus?: string;
    disableInitialFocus?: boolean;
    /** When true, Ctrl+Arrow is not a field move in this dialog. */
    disableSpatialMove?: boolean;
    /** Extra key handlers while this dialog is open, by action id. */
    keys?: Record<string, DeskHandlerInput>;
  }>(),
  { disableInitialFocus: false, disableSpatialMove: false, keys: () => ({}) },
);
const emit = defineEmits<{ close: []; accept: [] }>();
const root = ref<HTMLElement | null>(null);
let opener: HTMLElement | null = null;

function close(): void {
  open.value = false;
  emit('close');
}

/** A widget that used Escape (a grid clearing its search) keeps the dialog open. */
function onEscape(event: KeyboardEvent): void {
  if (event.defaultPrevented) return;
  event.preventDefault();
  event.stopPropagation();
  close();
}

function accept(): void {
  emit('accept');
}

provideDeskLayer({
  root,
  modal: true,
  active: open,
  handlers: {
    'action-save': accept,
    'action-form-save': accept,
    'action-cancel': close,
    ...props.keys,
  },
  initialFocus: () => props.initialFocus,
  disableInitialFocus: () => props.disableInitialFocus,
  disableSpatialMove: () => props.disableSpatialMove,
  onAccept: accept,
});

watch(open, (shown) => {
  if (shown) {
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return;
  }
  const back = opener;
  opener = null;
  void nextTick(() => {
    const lost = !document.activeElement || document.activeElement === document.body;
    if (lost && back?.isConnected) back.focus();
  });
}, { flush: 'sync' });
</script>
