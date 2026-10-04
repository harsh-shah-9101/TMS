<template>
  <DeskGrid
    v-model:rows="rows"
    mode="list"
    show-filter
    :columns="deskColumns"
    :loading="loading ?? false"
    :page="page ?? 1"
    :page-count="pageCount ?? 1"
    :page-size="pageSize ?? 0"
    :storage-key="storageKey ?? ''"
    @open="emit('open', $event)"
    @edit-record="emit('edit', $event)"
    @page="emit('page', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DeskGrid from './DeskGrid.vue';
import type { DeskColumn, DeskGridRow } from './types';

/** Drop-in list surface for new pages. Existing DataTableComponent is left unchanged. */
export interface DeskDataColumn {
  name: string;
  label: string;
  align?: 'left' | 'right' | 'center';
}

const rows = defineModel<DeskGridRow[]>('rows', { required: true });
const props = defineProps<{
  columns: DeskDataColumn[];
  loading?: boolean;
  page?: number;
  pageCount?: number;
  pageSize?: number;
  storageKey?: string;
}>();
const emit = defineEmits<{ open: [DeskGridRow]; edit: [DeskGridRow]; page: [number] }>();

const deskColumns = computed<DeskColumn[]>(() =>
  props.columns.map((column) => {
    const defined: DeskColumn = {
      id: column.name,
      header: column.label,
      readonly: true,
      width: 140,
    };
    if (column.align) defined.align = column.align;
    return defined;
  }),
);
</script>
