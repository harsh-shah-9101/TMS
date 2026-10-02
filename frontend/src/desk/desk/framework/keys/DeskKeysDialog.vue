<template>
  <DeskDialog v-model:open="open" initial-focus="keys-grid" :keys="dialogKeys">
    <h3>Keyboard shortcuts</h3>
    <DeskField v-model="presetValue" field-id="keys-preset" label="Preset" kind="select" :options="presetOptions" />
    <DeskField v-model="previewValue" field-id="keys-preview" label="Jump preview" kind="select" :options="YES_NO" />
    <DeskGrid
      ref="grid"
      v-model:rows="rows"
      field-id="keys-grid"
      mode="list"
      show-filter
      :columns="columns"
      hint="Enter changes keys · Del clears · type to search"
      style="height: 320px"
      @open="startCapture"
      @filter="onFilter"
    />
    <div
      v-if="capturing"
      ref="captureBox"
      class="capture"
      tabindex="0"
      @keydown.prevent.stop="onCapture"
      @blur="stopCapture"
    >
      Press the new keys for {{ capturing.action }}. Esc cancels.
    </div>
    <p v-if="warning" class="warning">{{ warning }}</p>
    <div class="buttons">
      <button type="button" @click="startCurrent">Change</button>
      <button type="button" @click="clearCurrent">Clear</button>
      <button type="button" @click="reset">Reset to preset</button>
      <button type="button" @click="open = false">Close</button>
    </div>
  </DeskDialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { deskHost } from '../host';
import DeskDialog from '../form/DeskDialog.vue';
import DeskField from '../form/DeskField.vue';
import { YES_NO } from '../form/yesNo';
import DeskGrid from '../grid/DeskGrid.vue';
import type { DeskColumn, DeskGridApi, DeskGridRow } from '../grid/types';
import { comboToPreset, formatCombo, keyInputOf, toCombo } from './combo';
import {
  deskBindingRows,
  deskConflicts,
  deskJumpPreview,
  deskPresetId,
  resetDeskBindings,
  setDeskJumpPreview,
  setDeskBinding,
  setDeskPreset,
  type DeskBindingRow,
} from './deskKeymap';

const open = defineModel<boolean>('open', { required: true });
const grid = ref<DeskGridApi | null>(null);
const captureBox = ref<HTMLElement | null>(null);
const capturing = ref<DeskBindingRow | null>(null);
const warning = ref('');
const search = ref<Record<string, string>>({});

const presetOptions = computed(() =>
  deskHost().presetLabels.map((preset) => ({ label: preset.label, value: preset.id })),
);
const presetValue = computed<string | number | null>({
  get: () => deskPresetId(),
  set: (value) => {
    if (typeof value === 'string') setDeskPreset(value);
  },
});
const previewValue = computed<string | number | null>({
  get: () => (deskJumpPreview() ? 'Yes' : 'No'),
  set: (value) => setDeskJumpPreview(value === 'Yes'),
});

const SOURCE_LABELS = { preset: 'Preset', custom: 'Custom', desk: 'Desk' } as const;
const columns: DeskColumn[] = [
  { id: 'action', header: 'Action', width: 260 },
  { id: 'keys', header: 'Keys', width: 150 },
  { id: 'source', header: 'Source', width: 90, format: (value) => SOURCE_LABELS[value as DeskBindingRow['source']] ?? '' },
];

const rows = computed<DeskGridRow[]>({
  get: () => {
    const needles = Object.entries(search.value).filter(([, text]) => text.trim() !== '');
    return deskBindingRows().filter((row) =>
      needles.every(([id, text]) => {
        const value = row[id];
        return typeof value === 'string' && value.toLowerCase().includes(text.trim().toLowerCase());
      }),
    );
  },
  set: () => undefined,
});

const dialogKeys = { 'action-delete': clearCurrent };

function asBinding(row: DeskGridRow | null | undefined): DeskBindingRow | null {
  if (!row || typeof row.id !== 'string') return null;
  return row as DeskBindingRow;
}

function onFilter(next: Record<string, string>): void {
  search.value = next;
}

function startCapture(row: DeskGridRow): void {
  const binding = asBinding(row);
  if (!binding) return;
  warning.value = '';
  capturing.value = binding;
  void nextTick(() => captureBox.value?.focus());
}

function startCurrent(): void {
  const row = grid.value?.currentRow();
  if (row) startCapture(row);
}

function stopCapture(): void {
  if (!capturing.value) return;
  capturing.value = null;
  void nextTick(() => grid.value?.focusGrid());
}

function onCapture(event: KeyboardEvent): void {
  const target = capturing.value;
  const combo = toCombo(keyInputOf(event));
  if (!target || !combo) return;
  if (combo === 'escape') {
    stopCapture();
    return;
  }
  setDeskBinding(target.id, comboToPreset(combo));
  const others = deskConflicts(target.id, combo);
  warning.value = others.length
    ? `${formatCombo(combo)} is also used by ${others.map((id) => deskHost().label(id)).join(', ')}.`
    : '';
  stopCapture();
}

function clearCurrent(): void {
  const binding = asBinding(grid.value?.currentRow());
  if (!binding) return;
  setDeskBinding(binding.id, []);
  warning.value = '';
}

function reset(): void {
  resetDeskBindings();
  warning.value = '';
}
</script>

<style scoped>
.capture {
  margin-top: 6px;
  padding: 6px 8px;
  border: 1px dashed var(--desk-cursor, rgb(108, 143, 108));
  outline: none;
}
.warning {
  color: darkorange;
  font-size: 0.88rem;
  margin: 4px 0;
}
.buttons {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}
</style>
