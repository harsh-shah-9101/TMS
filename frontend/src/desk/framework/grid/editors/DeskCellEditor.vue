<template>
  <DeskCombo
    v-if="kind === 'select' || kind === 'check'"
    v-model="text"
    variant="grid"
    :options="kind === 'check' ? YES_NO : options"
    :select-all="selectAll ?? true"
    @advance="(via) => (via === 'tab' ? emit('tab', false) : emit('commit'))"
    @back="emit('tab', true)"
    @cancel="emit('cancel')"
  />
  <input
    v-else
    ref="box"
    class="input-box"
    :value="text"
    @input="onInput"
    @keydown="onKey"
  />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { DeskSelectOption } from '../types';
import DeskCombo from '../../form/DeskCombo.vue';
import { YES_NO } from '../../form/yesNo';
import { claimDeskKey, isDeskNavKey } from '../../focus/useDeskFocus';
import { keyInputOf, toCombo } from '../../keys/combo';
import { deskActionsFor } from '../../keys/deskKeymap';

const text = defineModel<string>({ required: true });
const props = defineProps<{
  kind: string;
  options: DeskSelectOption[];
  selectAll?: boolean;
}>();
const emit = defineEmits<{
  commit: [];
  cancel: [];
  /** Tab or Shift+Tab (`back`). The grid decides where that goes. */
  tab: [back: boolean];
  /** The open-dialog shortcut. The grid commits, then opens even if the value did not change. */
  dialog: [];
}>();

const box = ref<HTMLInputElement | null>(null);

function onInput(event: Event): void {
  text.value = (event.target as HTMLInputElement).value;
}

function onKey(event: KeyboardEvent): void {
  if (isDeskNavKey(event)) return;
  claimDeskKey(event);
  if (event.key === 'Escape') {
    event.preventDefault();
    emit('cancel');
    return;
  }
  const combo = toCombo(keyInputOf(event));
  if (combo && deskActionsFor(combo).includes('grid-cell-dialog')) {
    event.preventDefault();
    emit('dialog');
    return;
  }
  if (event.key === 'Enter') {
    event.preventDefault();
    emit('commit');
    return;
  }
  if (event.key === 'Tab') {
    event.preventDefault();
    emit('tab', event.shiftKey);
  }
}

onMounted(() => {
  const input = box.value;
  if (!input) return;
  input.focus();
  const end = input.value.length;
  if (props.selectAll === false) input.setSelectionRange(end, end);
  else input.select();
});
</script>
