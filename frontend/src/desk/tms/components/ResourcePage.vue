<template>
  <div class="desk-page">
    <div class="desk-toolbar">
      <strong>{{ title }}</strong>
      <button v-if="canCreate" type="button" class="is-primary" @click="emit('new')">
        + New <small>{{ newKey }}</small>
      </button>
      <slot name="toolbar" />
      <button type="button" @click="reload">Refresh <small>F5</small></button>
      <span class="desk-toolbar-count">{{ list.count.value }} records</span>
      <span v-if="message" class="desk-error" style="color: var(--desk-danger); font-size: 12px; margin-left: 12px;">{{ message }}</span>
    </div>
    <DeskGrid
      ref="grid"
      v-model:rows="list.rows.value"
      mode="list"
      show-filter
      :storage-key="`tms-cols-${storageKey}`"
      :columns="columns"
      :loading="list.loading.value"
      :page="list.page.value"
      :page-count="list.pageCount.value"
      :page-size="list.pageSize.value"
      :sort-column="list.sortColumn.value"
      :sort-descending="list.sortDescending.value"
      :row-actions="rowActions"
      hint="Enter: open · Ctrl+Enter: edit · Del: delete · Arrows: navigate"
      @open="(row) => emit('open', row as T)"
      @edit-record="(row) => canUpdate && emit('edit', row as T)"
      @page="list.changePage"
      @filter="list.onFilter"
      @sort="list.onSort"
      @action="onAction"
    />
    <ConfirmDialog
      v-model:open="confirmOpen"
      title="Confirm Delete"
      :message="confirmText"
      confirm-label="Delete"
      @confirm="removePending"
    />
    <ActionDialog
      v-model:open="actionOpen"
      :action="activeAction"
      :subject="actionSubject"
      :perform="performAction"
      @done="reload"
    />
  </div>
</template>

<script setup lang="ts" generic="T extends DeskGridRow">
import { computed, onMounted, ref } from 'vue';
import {
  DeskGrid,
  deskKeyLabel,
  useDeskLayer,
  type DeskColumn,
  type DeskGridApi,
  type DeskGridRow,
  type DeskRowAction,
} from '../ui';
import { useAuthStore } from '@/stores/auth';
import { apiFailure } from '../api/errors';
import type { ActionInfo, ListParams, ResourceApi } from '../api/resource';
import { asRow, cellText, rowText } from '../data/rows';
import { useResourceList } from '../data/useResourceList';
import ActionDialog from './ActionDialog.vue';
import ConfirmDialog from './ConfirmDialog.vue';

const props = withDefaults(
  defineProps<{
    title: string;
    api: ResourceApi<T, unknown>;
    columns: DeskColumn[];
    /** Permission resource, such as `vehicles` */
    permission?: string;
    storageKey: string;
    params?: () => ListParams;
    sortColumn?: string;
    sortDescending?: boolean;
    rowLabel?: (row: T) => string;
  }>(),
  { sortColumn: '', sortDescending: false, permission: '' },
);
const emit = defineEmits<{ new: []; open: [row: T]; edit: [row: T] }>();

const auth = useAuthStore();
const grid = ref<DeskGridApi | null>(null);
const confirmOpen = ref(false);
const pending = ref<T | null>(null);
const actionError = ref('');
const list = useResourceList<T>(props.api, {
  columns: props.columns,
  ...(props.params ? { params: props.params } : {}),
  sortColumn: props.sortColumn,
  sortDescending: props.sortDescending,
});

// Permissions check (defaults to true if no permission specified)
const canCreate = computed(() => (!props.permission ? true : (auth.can(props.permission ? `${props.permission}.create` : undefined) ?? true)));
const canUpdate = computed(() => (!props.permission ? true : (auth.can(props.permission ? `${props.permission}.update` : undefined) ?? true)));
const canDelete = computed(() => (!props.permission ? true : (auth.can(props.permission ? `${props.permission}.delete` : undefined) ?? true)));
const newKey = computed(() => deskKeyLabel('action-new') || 'Alt+N');
const message = computed(() => actionError.value || list.error.value);
const confirmText = computed(() => (pending.value ? `Delete ${(props.rowLabel ?? rowText)(pending.value as T)}?` : ''));

const entityActions = ref<ActionInfo[]>([]);
const actionOpen = ref(false);
const activeAction = ref<ActionInfo | null>(null);
const actionRow = ref<T | null>(null);
const labelOf = (row: T): string => (props.rowLabel ?? rowText)(row);
const actionSubject = computed(() => (actionRow.value ? labelOf(actionRow.value) : ''));

function startsFrom(action: ActionInfo, row: DeskGridRow): boolean {
  return Object.entries(action.from ?? {}).every(([field, allowed]) => allowed.includes(cellText(row[field])));
}

function rowActions(row: DeskGridRow): DeskRowAction[] {
  const out: DeskRowAction[] = [];
  if (canUpdate.value) out.push({ name: 'edit', label: 'Edit', disabled: false });
  for (const action of entityActions.value) {
    if (startsFrom(action, row)) out.push({ name: `action:${action.name}`, label: action.label, disabled: false });
  }
  if (canDelete.value) out.push({ name: 'delete', label: 'Delete', disabled: false });
  return out;
}

async function loadActions(): Promise<void> {
  try {
    entityActions.value = (await props.api.actions()).filter((action) => action.kind === 'row');
  } catch {
    entityActions.value = [];
  }
}

function startAction(name: string, row: T): void {
  const action = entityActions.value.find((item) => item.name === name);
  if (!action) return;
  activeAction.value = action;
  actionRow.value = row;
  actionOpen.value = true;
}

function performAction(name: string, input: Record<string, unknown>): Promise<unknown> {
  return props.api.perform(String(actionRow.value?.id), name, input);
}

function askRemove(row: T | null): void {
  if (!row || !canDelete.value) return;
  pending.value = row;
  confirmOpen.value = true;
}

async function removePending(): Promise<void> {
  const row = pending.value;
  pending.value = null;
  if (!row?.id) return;
  actionError.value = '';
  try {
    await props.api.remove(String(row.id));
    await list.fetchPage();
  } catch (caught) {
    actionError.value = apiFailure(caught).message;
  }
}

function onAction(payload: { name: string; row: DeskGridRow }): void {
  if (payload.name === 'edit') emit('edit', asRow<T>(payload.row));
  if (payload.name === 'delete') askRemove(asRow<T>(payload.row));
  if (payload.name.startsWith('action:')) startAction(payload.name.slice('action:'.length), asRow<T>(payload.row));
}

function reload(): void {
  actionError.value = '';
  void list.fetchPage();
}

useDeskLayer({
  handlers: {
    'action-new': () => {
      if (canCreate.value) emit('new');
    },
    'action-delete': () => askRemove((grid.value?.currentRow() as T | null) ?? null),
    'action-refresh': reload,
  },
});

onMounted(() => {
  reload();
  void loadActions();
});

defineExpose({ reload, focusGrid: () => grid.value?.focusGrid() });
</script>

<style scoped>
.desk-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: var(--desk-bg);
}
</style>
