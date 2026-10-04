<template>
  <div class="panel">
    <div>
      <strong>Fields</strong>
      <button v-for="field in fields" :key="field" type="button" @click="add(field)">{{ field }}</button>
    </div>
    <label>Rows <input v-model="groupByText" @keydown.enter.prevent="emitRun" /></label>
    <label>Columns <input v-model="splitByText" @keydown.enter.prevent="emitRun" /></label>
    <label>
      Value
      <select v-model="valueField">
        <option v-for="field in fields" :key="field" :value="field">{{ field }}</option>
      </select>
      <select v-model="aggregate">
        <option value="sum">sum</option>
        <option value="count">count</option>
        <option value="avg">avg</option>
        <option value="min">min</option>
        <option value="max">max</option>
        <option value="distinct">distinct count</option>
      </select>
    </label>
    <button type="button" @click="emitRun">Pivot</button>
    <button type="button" @click="saveLayout">Save layout</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { PivotAggregate } from './pivotEngine';

const props = defineProps<{ fields: string[]; storageKey: string }>();
const emit = defineEmits<{
  run: [payload: { groupBy: string[]; splitBy: string[]; valueField: string; aggregate: PivotAggregate }];
}>();

const groupByText = ref('party');
const splitByText = ref('month');
const valueField = ref(props.fields.includes('net') ? 'net' : (props.fields[0] ?? ''));
const aggregate = ref<PivotAggregate>('sum');

function split(text: string): string[] {
  return text.split(',').map((part) => part.trim()).filter(Boolean);
}

function add(field: string): void {
  groupByText.value = groupByText.value ? `${groupByText.value}, ${field}` : field;
}

function emitRun(): void {
  emit('run', {
    groupBy: split(groupByText.value),
    splitBy: split(splitByText.value),
    valueField: valueField.value,
    aggregate: aggregate.value,
  });
}

function saveLayout(): void {
  localStorage.setItem(
    props.storageKey,
    JSON.stringify({ groupBy: groupByText.value, splitBy: splitByText.value, valueField: valueField.value, aggregate: aggregate.value }),
  );
}

const saved = localStorage.getItem(props.storageKey);
if (saved) {
  try {
    const parsed = JSON.parse(saved) as { groupBy?: string; splitBy?: string; valueField?: string; aggregate?: PivotAggregate };
    if (parsed.groupBy) groupByText.value = parsed.groupBy;
    if (parsed.splitBy) splitByText.value = parsed.splitBy;
    if (parsed.valueField) valueField.value = parsed.valueField;
    if (parsed.aggregate) aggregate.value = parsed.aggregate;
  } catch {
    groupByText.value = 'party';
  }
}
</script>

<style scoped>
.panel {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  font-size: 0.88rem;
}
.panel input, .panel select { height: 24px; font-size: 0.88rem; }
</style>
