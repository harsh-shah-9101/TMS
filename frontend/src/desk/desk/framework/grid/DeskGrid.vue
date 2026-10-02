<template>
  <div class="desk-grid component-content" :class="{ 'pin-foot': footPinned }" @mousedown="settingsOpen = false">
    <div
      ref="scroller"
      class="table-content"
      tabindex="0"
      :data-desk-field="gridId"
      data-desk-entry
      v-bind="focusAttrs"
      @keydown="onKey"
      @focus="onGridFocus"
      @focusout="onGridBlur"
      @copy.prevent="copyRange"
    >
      <table class="systable">
        <thead>
          <tr v-for="(group, groupIndex) in headerGroups" :key="group.id">
            <th
              v-if="groupIndex === 0"
              class="first-col"
              :class="{ 'column-picker': hasMenu }"
              :rowspan="headerGroups.length + (showFilter ? 1 : 0)"
              v-bind="hasMenu ? { title: 'Grid options', 'aria-expanded': settingsOpen } : {}"
              @mousedown.stop
              @click.stop="hasMenu && toggleMenu()"
            >
              <template v-if="hasMenu">≡</template>
            </th>
            <th
              v-for="header in group.headers"
              :key="header.id"
              :colspan="header.colSpan"
              :class="headerClass(header.column.id, header.isPlaceholder, groupIndex)"
              :style="colStyle(header.column.id)"
              @click="onHeaderClick(header)"
            >
              <template v-if="!header.isPlaceholder">
                <span class="desk-col-head">
                  <span>{{ headerLabel(header) }}<span v-if="mode === 'list' && sortColumn === header.column.id">{{ sortDescending ? ' ▼' : ' ▲' }}</span></span>
                  <span v-if="columnHasDialog(header.column.id)" class="desk-col-dialog" title="Dialog">
                    <svg viewBox="0 0 12 12" aria-hidden="true">
                      <rect x="1.2" y="1.6" width="9.6" height="8.8" rx="1" fill="none" stroke="currentColor" stroke-width="1.2" />
                      <path d="M1.2 4.4h9.6" fill="none" stroke="currentColor" stroke-width="1.2" />
                    </svg>
                  </span>
                </span>
              </template>
            </th>
            <th v-if="rowActions" class="actions-col">Actions</th>
          </tr>
          <tr v-if="showFilter">
            <td v-for="column in visibleColumns" :key="column.id" class="column-filter">
              <input
                :value="filters[column.id] ?? ''"
                style="width: 100%; border: 0; background: transparent; font-size: 0.88rem"
                @input="onFilter(column.id, $event)"
              />
            </td>
            <td v-if="rowActions" />
          </tr>
        </thead>
        <tbody>
          <template v-for="item in windowRows" :key="item.key">
          <tr
            :class="{ select: selectedRows.has(item.index) }"
          >
            <td class="first-col" :class="{ focus: cursor.row === item.index }">{{ item.index + 1 }}</td>
            <template v-for="(column, colIndex) in visibleColumns" :key="column.id">
              <td
                v-if="spanOf(item.row, column, item.index) !== 0"
                :rowspan="spanOf(item.row, column, item.index)"
                :data-cell="`${item.index}-${colIndex}`"
                :class="cellClass(item.row, column, item.index, colIndex)"
                :style="colStyle(column.id)"
                :title="errorOf(item.row, column) ?? ''"
                @mousedown.prevent="onCellMouse(item.index, colIndex, $event)"
              >
                <span class="desk-cell-value">{{ optionLabel(column, item.row) }}</span>
                <DeskMark v-if="markOf(column, item.row)" decorative :kind="markOf(column, item.row) === 'search' ? 'search' : 'select'" />
                <span v-if="captionOf(column, item.row)" class="desk-cell-caption">{{ captionOf(column, item.row) }}</span>
                <span v-if="tagsOf(column, item.row).length" class="desk-cell-tags">
                  <button
                    v-for="tag in tagsOf(column, item.row)"
                    :key="tag.id"
                    type="button"
                    class="desk-tag"
                    :class="tag.tone"
                    @mousedown.stop.prevent="onTag(item.index, tag.focus)"
                  >
                    {{ tag.text }}
                  </button>
                </span>
              </td>
            </template>
            <td v-if="rowActions" class="actions-col" @mousedown.stop>
              <button
                v-for="action in rowActions(item.row)"
                :key="action.name"
                type="button"
                :disabled="action.disabled"
                @click="emit('action', { name: action.name, row: item.row })"
              >
                {{ action.label }}
              </button>
            </td>
          </tr>
          <tr v-if="showDrawer(item.row, item.index)" class="desk-row-drawer">
            <td class="first-col" />
            <td :colspan="visibleColumns.length + (rowActions ? 1 : 0)" @mousedown.stop>
              <slot name="drawer" :row="item.row" :index="item.index" />
            </td>
          </tr>
          </template>
          <tr v-if="footPinned && padHeight > 0" class="desk-pad" aria-hidden="true">
            <td :colspan="padSpan" :style="{ height: `${padHeight}px` }" />
          </tr>
        </tbody>
        <tfoot v-if="hasSummary || slots.foot">
          <tr v-if="hasSummary">
            <td class="first-col row-summary" />
            <td
              v-for="column in visibleColumns"
              :key="column.id"
              class="row-summary"
              :class="alignClass(column)"
            >
              {{ summaryText(column) }}
            </td>
            <td v-if="rowActions" />
          </tr>
          <slot name="foot" />
        </tfoot>
      </table>
      <div v-show="square.visible && gridActive" class="input-square" :class="{ editing, idle: !editing }" :style="square.style">
        <DeskCellEditor
          v-if="editing && activeColumn && activeColumn.editor !== 'lookup'"
          :key="`${cursor.row}-${cursor.col}`"
          v-model="draft"
          :kind="activeColumn.editor || activeColumn.type || 'text'"
          :options="activeColumn.options ?? []"
          :select-all="editSelectAll"
          @commit="commitEdit(true)"
          @tab="onEditorTab"
          @cancel="cancelEdit"
          @dialog="openCellDialog"
        />
        <DeskLookupBox
          v-else-if="editing && activeColumn?.lookup"
          :key="`${cursor.row}-${cursor.col}`"
          v-model="draft"
          v-model:picked="lookupPick"
          variant="grid"
          :lookup="activeColumn.lookup"
          :select-all="editSelectAll"
          @advance="commitLookup"
          @back="commitLookup('back')"
          @cancel="cancelEdit"
        />
        <div class="rb-square" title="Fill down" @mousedown.stop.prevent="fillDown" />
      </div>
      <div
        v-if="settingsOpen"
        ref="menuEl"
        class="desk-grid-menu"
        tabindex="-1"
        role="menu"
        @mousedown.stop
        @keydown.stop="onMenuKey"
      >
        <button
          v-for="(item, index) in menuItems"
          :key="item.id"
          type="button"
          class="desk-grid-menu-item"
          role="menuitemcheckbox"
          :class="{ on: menuIndex === index }"
          :aria-checked="item.checked"
          @mouseenter="menuIndex = index"
          @click="chooseMenu(item)"
        >
          <span class="desk-grid-menu-check">{{ item.checked ? '✓' : '' }}</span>
          <span>{{ item.label }}</span>
        </button>
      </div>
    </div>
    <div class="footer">
      <span>{{ statusText }}</span>
      <template v-if="mode === 'list'">
        <a :class="{ disabled: (page ?? 1) <= 1 }" @click="emit('page', (page ?? 1) - 1)">Prev</a>
        <span>Page {{ page ?? 1 }}</span>
        <a :class="{ disabled: (page ?? 1) >= (pageCount ?? 1) }" @click="emit('page', (page ?? 1) + 1)">Next</a>
      </template>
      <span class="footer-end">
        <slot name="status">{{ loading ? 'Loading…' : hint }}</slot>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, useSlots, watch } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { isDeskDialogTarget, type DeskCellTag, type DeskColumn, type DeskCursor, type DeskGridApi, type DeskGridMode, type DeskGridOption, type DeskGridRow, type DeskNextFocus, type DeskRange, type DeskRowAction } from './types';
import { cellText, editorText, isReadonly, optionLabel, parseEditorValue, summaryValue, asNumber } from './display';
import { cellToTheLeft, resolveCellEnter, resolveGridKey, type DeskTabFlow, type GridKeyAction } from './keyboard';
import { resolveDrawerKey, type DrawerPlace } from './drawerKey';
import { footCellBottoms, scrollDeltaToClear } from './footPin';
import { clearRowData, emptyColumnValue } from './rows';
import { normalizeRange, parseTsv, rangeToTsv } from './clipboard';
import { useDeskTable } from './useDeskTable';
import { deskJumpLabel, pickToward, type DeskBox, type DeskDir, type DeskJumpStop } from '../focus/jump';
import { deskMoveDir, focusDeskField, focusDeskToward, focusNextDeskField, focusPrevDeskField, isDeskJumpKey, isDeskTabKey } from '../focus/useDeskFocus';
import { keyInputOf, toCombo } from '../keys/combo';
import { deskActionsFor, deskComboFor } from '../keys/deskKeymap';
import { autoDeskFieldId } from '../keys/layers';
import { useDeskLayer } from '../keys/useDeskLayer';
import DeskMark from '../form/DeskMark.vue';
import DeskCellEditor from './editors/DeskCellEditor.vue';
import DeskLookupBox from '../form/DeskLookupBox.vue';

const rows = defineModel<DeskGridRow[]>('rows', { required: true });

const props = withDefaults(
  defineProps<{
    columns: DeskColumn[];
    mode?: DeskGridMode;
    loading?: boolean;
    showFilter?: boolean;
    page?: number;
    pageCount?: number;
    storageKey?: string;
    hint?: string;
    /** Column that must be filled before Enter starts another row. Defaults to the first column. */
    exitWhenBlank?: string;
    /** Desk field to focus when Enter leaves the grid instead of adding a row. */
    exitField?: string;
    /** Column a section jump lands on. Defaults to `exitWhenBlank`, then the first column. */
    jumpColumn?: string;
    /** Field id in the page focus order. Omit for an automatic id. */
    fieldId?: string;
    /** `enter` (default): Tab does what Enter does. `field`: Tab leaves the grid for the next field. */
    tabFlow?: DeskTabFlow;
    /** Takes focus when the page or dialog opens, ahead of earlier fields. */
    initial?: boolean;
    /** Leave this grid out of the initial-focus pass. */
    disableAutoFocus?: boolean;
    /**
     * Lines under the items, such as discount and tax. Down from the last item
     * row moves here. Enter on a line with `edit` opens that dialog.
     */
    foot?: { id: string; edit?: string }[];
    /**
     * Never go below this many rows. Delete on the last of them clears the row
     * (including lookup ids) instead of removing it. 0 means rows can all be deleted.
     */
    minRows?: number;
    /** Show the column list in the corner menu. Off when the page already decides which columns exist. */
    columnPicker?: boolean;
    /** Extra toggles in the corner menu. The page owns the checked state. */
    options?: DeskGridOption[];
    /** When set, the status line counts these items instead of every row. */
    itemCount?: number | null;
    /** Column id currently sorted on the server. */
    sortColumn?: string;
    sortDescending?: boolean;
    rowActions?: (row: DeskGridRow) => DeskRowAction[];
    /**
     * Where Enter goes from a cell. A target replaces the column's `enter`.
     * `null` moves to the next cell. `undefined` keeps the column's `enter`.
     */
    onNextFocus?: DeskNextFocus;
    /** When this returns true for the cursor row, the drawer slot is shown under that row. */
    drawerFor?: (row: DeskGridRow) => boolean;
  }>(),
  {
    mode: 'entry',
    loading: false,
    showFilter: false,
    page: 1,
    pageCount: 1,
    storageKey: '',
    hint: 'Enter moves right · F2 edit · Ctrl+C/V · Ctrl+D fill',
    exitWhenBlank: '',
    exitField: '',
    jumpColumn: '',
    fieldId: '',
    tabFlow: 'enter',
    initial: false,
    disableAutoFocus: false,
    minRows: 0,
    columnPicker: true,
    options: () => [],
    itemCount: null,
    sortColumn: '',
    sortDescending: true,
    foot: () => [],
  },
);

const emit = defineEmits<{
  open: [row: DeskGridRow];
  'edit-record': [row: DeskGridRow];
  change: [payload: { row: number; columnId: string; value: unknown; record: DeskGridRow }];
  page: [page: number];
  filter: [filters: Record<string, string>];
  sort: [columnId: string];
  action: [payload: { name: string; row: DeskGridRow }];
  dialog: [payload: { dialog: string; row: DeskGridRow; rowIndex: number; columnId: string }];
  'create-lookup': [payload: { columnId: string; rowIndex: number }];
  lookup: [payload: { columnId: string; rowIndex: number; record: Record<string, unknown>; row: DeskGridRow }];
  cursor: [payload: { rowIndex: number; columnId: string; record: DeskGridRow }];
  exit: [];
  foot: [edit: string];
  option: [id: string];
}>();

/** Keep the table foot at the bottom of the scroller, with a blank pad above it. */
const footPinned = defineModel<boolean>('pinFoot', { default: false });

const hidden = ref<Set<string>>(new Set());
const filters = reactive<Record<string, string>>({});
const settingsOpen = ref(false);
const menuEl = ref<HTMLElement | null>(null);
const menuIndex = ref(0);
const cursor = ref<DeskCursor>({ row: 0, col: 0 });
/** Index into `foot` when the cursor is on a total line. Null while it is on an item row. */
const footIndex = ref<number | null>(null);
const range = ref<DeskRange | null>(null);
const editing = ref(false);
const gridActive = ref(false);
const editSelectAll = ref(true);
const draft = ref('');
/** Cell value when editing started, so Enter can tell a real change from a re-commit. */
let editStart: unknown;
const lookupPick = ref<Record<string, unknown> | null>(null);
const selectedRows = ref<Set<number>>(new Set());
const scroller = ref<HTMLElement | null>(null);
const gridId = props.fieldId || autoDeskFieldId('grid');
const focusAttrs = computed(() => {
  const attrs: Record<string, string> = {};
  if (props.initial) attrs['data-desk-initial'] = '';
  if (props.disableAutoFocus) attrs['data-desk-noauto'] = '';
  return attrs;
});
const square = reactive({
  visible: false,
  bottom: 0,
  left: 0,
  style: {} as Record<string, string>,
});

const visibleColumns = computed(() =>
  props.columns.filter((column) => !hidden.value.has(column.id) && (column.visible ? column.visible() : true)),
);

const sortedView = computed(() => rows.value);
const { headerGroups, rows: tableRows } = useDeskTable(visibleColumns, sortedView, props.mode !== 'entry');

const orderedRows = computed(() => tableRows.value.map((row) => row.original));
const slots = useSlots();

function showDrawer(row: DeskGridRow | undefined, index: number): boolean {
  if (!row || !slots.drawer || !props.drawerFor || index !== cursor.value.row) return false;
  return props.drawerFor(row);
}

const virtualizer = useVirtualizer(
  computed(() => ({
    count: orderedRows.value.length,
    getScrollElement: () => scroller.value,
    estimateSize: (index: number) => {
      const row = orderedRows.value[index];
      return row && showDrawer(row, index) ? 100 : 28;
    },
    overscan: 12,
  })),
);

const windowRows = computed(() => {
  const all = orderedRows.value.map((row, index) => ({ row, index, key: String(row.id ?? index) }));
  if (all.length < 80) return all;
  const items = virtualizer.value.getVirtualItems();
  if (items.length === 0) return all.slice(0, 40);
  return items.map((item) => {
    const row = orderedRows.value[item.index];
    return { row: row ?? {}, index: item.index, key: String(row?.id ?? item.index) };
  });
});

const activeColumn = computed(() => visibleColumns.value[cursor.value.col] ?? null);
const hasSummary = computed(() => visibleColumns.value.some((column) => column.summary));

interface GridMenuItem {
  id: string;
  label: string;
  checked: boolean;
  kind: 'pin' | 'option' | 'column';
}

const menuItems = computed((): GridMenuItem[] => {
  const items: GridMenuItem[] = [];
  if (slots.foot) items.push({ id: 'pin-foot', label: 'Pin totals', checked: footPinned.value === true, kind: 'pin' });
  for (const option of props.options) {
    items.push({ id: option.id, label: option.label, checked: option.checked, kind: 'option' });
  }
  if (props.columnPicker) {
    for (const column of props.columns) {
      items.push({ id: `column:${column.id}`, label: column.header, checked: !hidden.value.has(column.id), kind: 'column' });
    }
  }
  return items;
});
const hasMenu = computed(() => menuItems.value.length > 0);

function toggleMenu(): void {
  settingsOpen.value = !settingsOpen.value;
}

function chooseMenu(item: GridMenuItem): void {
  if (item.kind === 'pin') footPinned.value = !footPinned.value;
  else if (item.kind === 'option') emit('option', item.id);
  else toggleColumn(item.id.slice('column:'.length));
}

function onMenuKey(event: KeyboardEvent): void {
  const items = menuItems.value;
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    menuIndex.value = Math.min(items.length - 1, menuIndex.value + 1);
    return;
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    menuIndex.value = Math.max(0, menuIndex.value - 1);
    return;
  }
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    const item = items[menuIndex.value];
    if (item) chooseMenu(item);
    return;
  }
  if (event.key === 'Escape') {
    event.preventDefault();
    settingsOpen.value = false;
    focusGrid();
  }
}

watch(settingsOpen, (open) => {
  if (!open) return;
  menuIndex.value = 0;
  void nextTick(() => menuEl.value?.focus());
});
const padHeight = ref(0);
const padSpan = computed(() => visibleColumns.value.length + 1 + (props.rowActions ? 1 : 0));
const statusText = computed(() => {
  if (props.itemCount === null) return `${rows.value.length} rows`;
  return props.itemCount === 1 ? '1 item' : `${props.itemCount} items`;
});

function setFootCell(cell: HTMLTableCellElement, bottom: number | null): void {
  if (bottom === null) {
    cell.style.position = '';
    cell.style.bottom = '';
    cell.style.zIndex = '';
    return;
  }
  const next = `${bottom}px`;
  if (cell.style.position !== 'sticky') cell.style.position = 'sticky';
  if (cell.style.bottom !== next) cell.style.bottom = next;
  if (cell.style.zIndex !== '4') cell.style.zIndex = '4';
}

/** Stick the whole totals block, from the first footer line through the last, plus any rowspan beside it. */
function pinFootRows(): void {
  const foot = scroller.value?.querySelector('tfoot');
  if (!foot) return;
  const rows = [...foot.querySelectorAll<HTMLTableRowElement>(':scope > tr')];
  if (!footPinned.value) {
    rows.forEach((row) => {
      for (const cell of row.cells) setFootCell(cell, null);
    });
    return;
  }
  const bottoms = footCellBottoms(
    rows.map((row) => ({
      height: row.getBoundingClientRect().height,
      spans: [...row.cells].map((cell) => (cell.rowSpan > 1 ? cell.rowSpan : 1)),
    })),
  );
  rows.forEach((row, index) => {
    const line = bottoms[index] ?? [];
    [...row.cells].forEach((cell, cellIndex) => setFootCell(cell, line[cellIndex] ?? 0));
  });
}

function syncPad(): void {
  pinFootRows();
  const host = scroller.value;
  if (!footPinned.value || !host || orderedRows.value.length >= 80) {
    padHeight.value = 0;
    return;
  }
  const thead = host.querySelector('thead')?.getBoundingClientRect().height ?? 0;
  const tfoot = host.querySelector('tfoot')?.getBoundingClientRect().height ?? 0;
  let body = 0;
  host.querySelectorAll<HTMLElement>('tbody tr:not(.desk-pad)').forEach((row) => {
    body += row.getBoundingClientRect().height;
  });
  const next = Math.max(0, Math.floor(host.clientHeight - thead - body - tfoot));
  if (next !== padHeight.value) padHeight.value = next;
}

function headerLabel(header: { column: { columnDef: { header?: unknown } } }): string {
  const value = header.column.columnDef.header;
  return typeof value === 'string' ? value : '';
}

function columnHasDialog(id: string): boolean {
  const column = visibleColumns.value.find((item) => item.id === id);
  return Boolean(column?.enter && isDeskDialogTarget(column.enter));
}

function headerClass(id: string, placeholder: boolean, groupIndex: number): string[] {
  const column = visibleColumns.value.find((item) => item.id === id);
  return [
    groupIndex === 0 && column?.group ? 'group-head' : '',
    !placeholder && activeColumn.value?.id === id ? 'focus' : '',
    column ? alignClass(column) : '',
  ];
}

function alignClass(column: DeskColumn): string {
  if (column.align === 'right' || column.type === 'number') return 'align-right';
  if (column.align === 'center' || column.type === 'check') return 'align-center';
  return '';
}

function colStyle(id: string): Record<string, string> {
  const column = props.columns.find((item) => item.id === id) ?? visibleColumns.value.find((item) => item.id === id);
  const width = column?.width ?? 120;
  return { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` };
}

function spanOf(row: DeskGridRow | undefined, column: DeskColumn, index: number): number {
  if (!row || !column.rowspan) return 1;
  return column.rowspan(row, index);
}

function errorOf(row: DeskGridRow | undefined, column: DeskColumn): string | null {
  if (!row || !column.error) return null;
  return column.error(row);
}

/** Search or dropdown, for a cell that opens one when you edit it. */
function markOf(column: DeskColumn, row: DeskGridRow | undefined): 'search' | 'select' | null {
  if (!row || props.mode !== 'entry' || isReadonly(column, row)) return null;
  const kind = column.editor || column.type;
  if (kind === 'lookup' || column.lookup) return 'search';
  if (kind === 'select' || kind === 'check') return 'select';
  return null;
}

function cellClass(row: DeskGridRow | undefined, column: DeskColumn, rowIndex: number, colIndex: number): string[] {
  const classes = [alignClass(column)];
  if (!row) return classes;
  const mark = markOf(column, row);
  if (mark === 'search') classes.push('marker-lookup');
  if (mark === 'select') classes.push('marker-select');
  if (column.type === 'date') classes.push('marker-date');
  if (errorOf(row, column)) classes.push('cell-error');
  if (captionOf(column, row) || tagsOf(column, row).length) classes.push('desk-cell-stack');
  if (row.__group === true) classes.push('group-row');
  const box = range.value;
  if (box) {
    const boxRange = normalizeRange(box.r1, box.c1, box.r2, box.c2);
    if (rowIndex >= boxRange.top && rowIndex <= boxRange.bottom && colIndex >= boxRange.left && colIndex <= boxRange.right) {
      classes.push('in-range');
    }
  }
  return classes;
}

function captionOf(column: DeskColumn, row: DeskGridRow | undefined): string {
  if (!row || !column.caption) return '';
  return column.caption(row);
}

function tagsOf(column: DeskColumn, row: DeskGridRow | undefined): DeskCellTag[] {
  if (!row || !column.detail) return [];
  return column.detail(row);
}

function summaryText(column: DeskColumn): string {
  if (!column.summary) return '';
  const values = orderedRows.value
    .map((row) => asNumber(row[column.id]))
    .filter((value): value is number => value !== null);
  const total = summaryValue(column.summary, values);
  return column.summary === 'count' ? String(total) : total.toFixed(2);
}

function onHeaderClick(
  header: { isPlaceholder: boolean; column: { id: string } },
): void {
  if (header.isPlaceholder || props.mode !== 'list') return;
  emit('sort', header.column.id);
}

function onFilter(id: string, event: Event): void {
  filters[id] = (event.target as HTMLInputElement).value;
  emit('filter', { ...filters });
}

function toggleColumn(id: string): void {
  const next = new Set(hidden.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  hidden.value = next;
  if (props.storageKey) {
    localStorage.setItem(props.storageKey, JSON.stringify([...next]));
  }
}

function rowAt(index: number): DeskGridRow | undefined {
  return orderedRows.value[index];
}

/** Scroll a body cell, and the drawer under it, out from under the sticky header or the pinned totals. */
function revealPastPinned(node: HTMLElement): void {
  const host = scroller.value;
  if (!host) return;
  const hostBox = host.getBoundingClientRect();
  const cell = node.getBoundingClientRect();
  const row = node.closest('tr');
  const next = row?.nextElementSibling;
  const drawer = next instanceof HTMLElement && next.classList.contains('desk-row-drawer') ? next.getBoundingClientRect() : null;
  const header = host.querySelector('thead')?.getBoundingClientRect().height ?? 0;
  const coveredByFoot = footPinned.value && !node.closest('tfoot');
  const footer = coveredByFoot ? (host.querySelector('tfoot')?.getBoundingClientRect().height ?? 0) : 0;
  host.scrollTop += scrollDeltaToClear(cell.top, drawer?.bottom ?? cell.bottom, hostBox.top + header, hostBox.bottom - footer);
}

function placeSquare(): void {
  const lines = props.foot ?? [];
  const onFoot = footIndex.value;
  const footLine = onFoot === null ? undefined : lines[onFoot];
  const node = scroller.value?.querySelector<HTMLElement>(
    footLine ? `[data-foot-line="${footLine.id}"]` : `[data-cell="${cursor.value.row}-${cursor.value.col}"]`,
  );
  if (!node || !scroller.value) {
    square.visible = false;
    return;
  }
  const drawerHasFocus = document.activeElement?.closest('.desk-row-drawer');
  if (!drawerHasFocus) {
    node.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    revealPastPinned(node);
  }
  const host = scroller.value.getBoundingClientRect();
  const cell = node.getBoundingClientRect();
  square.visible = true;
  square.left = cell.left;
  square.bottom = cell.bottom;
  square.style = {
    top: `${cell.top - host.top + scroller.value.scrollTop}px`,
    left: `${cell.left - host.left + scroller.value.scrollLeft}px`,
    width: `${cell.width}px`,
    height: `${cell.height}px`,
  };
}

/** Next total line the user can change. Display lines such as sub-total and grand total are skipped. */
function editableFoot(from: number, dir: 1 | -1): number | null {
  const lines = props.foot ?? [];
  for (let index = from + dir; index >= 0 && index < lines.length; index += dir) {
    if (lines[index]?.edit) return index;
  }
  return null;
}

/** Down from the last item row walks the total lines the user can change. Enter opens a linked dialog. */
function onFootKey(event: KeyboardEvent): boolean {
  const lines = props.foot ?? [];
  if (lines.length === 0 || editing.value) return false;
  const lastRow = Math.max(0, orderedRows.value.length - 1);
  if (footIndex.value === null) {
    if (event.key !== 'ArrowDown' || cursor.value.row < lastRow) return false;
    const next = editableFoot(-1, 1);
    if (next === null) return false;
    event.preventDefault();
    footIndex.value = next;
    placeSquare();
    return true;
  }
  event.preventDefault();
  if (event.key === 'ArrowDown') {
    const next = editableFoot(footIndex.value, 1);
    if (next !== null) footIndex.value = next;
    placeSquare();
    return true;
  }
  if (event.key === 'ArrowUp') {
    const next = editableFoot(footIndex.value, -1);
    if (next === null) {
      footIndex.value = null;
      void moveTo(lastRow, cursor.value.col, false);
    } else {
      footIndex.value = next;
      placeSquare();
    }
    return true;
  }
  if (event.key === 'Enter') {
    const line = lines[footIndex.value];
    if (line?.edit) emit('foot', line.edit);
    return true;
  }
  if (event.key === 'Escape') {
    footIndex.value = null;
    void moveTo(lastRow, cursor.value.col, false);
    return true;
  }
  return true;
}

function focusGrid(): void {
  scroller.value?.focus();
}

function onGridFocus(): void {
  gridActive.value = true;
  void nextTick(() => placeSquare());
}

function onGridBlur(event: FocusEvent): void {
  const next = event.relatedTarget;
  if (next instanceof Node && scroller.value?.contains(next)) return;
  commitInPlace();
  gridActive.value = false;
}

/** Cursor on the first cell, not editing, so the gray line shows until the user types. */
function focusEntry(): void {
  editing.value = false;
  draft.value = '';
  void moveTo(0, 0, false).then(() => focusGrid());
}

async function moveTo(row: number, col: number, extend: boolean): Promise<void> {
  footIndex.value = null;
  cursor.value = { row, col };
  const column = visibleColumns.value[col];
  const record = rowAt(row);
  if (column && record) emit('cursor', { rowIndex: row, columnId: column.id, record });
  if (extend) {
    const anchor = range.value ?? { r1: row, c1: col, r2: row, c2: col };
    range.value = { r1: anchor.r1, c1: anchor.c1, r2: row, c2: col };
  } else {
    range.value = { r1: row, c1: col, r2: row, c2: col };
  }
  selectedRows.value = new Set([row]);
  await nextTick();
  syncPad();
  await nextTick();
  placeSquare();
}

function applyFilterKey(action: { seed?: string; backspace?: boolean; clear?: boolean }): void {
  const column = activeColumn.value;
  if (!column) return;
  const current = filters[column.id] ?? '';
  if (action.clear) filters[column.id] = '';
  else if (action.backspace) filters[column.id] = current.slice(0, -1);
  else if (action.seed) filters[column.id] = current + action.seed;
  emit('filter', { ...filters });
}

function startEdit(seed?: string): void {
  const column = activeColumn.value;
  const row = rowAt(cursor.value.row);
  if (!column || !row || isReadonly(column, row) || props.mode === 'report' || props.mode === 'list') return;
  editing.value = true;
  editSelectAll.value = seed === undefined;
  editStart = row[column.id];
  draft.value = seed ?? editorText(column, row);
  void nextTick(() => placeSquare());
}

function writeCell(rowIndex: number, column: DeskColumn, value: unknown): void {
  const row = rowAt(rowIndex);
  if (!row || isReadonly(column, row)) return;
  row[column.id] = value;
  emit('change', { row: rowIndex, columnId: column.id, value, record: row });
}

function commitEdit(advance: boolean, force = false, refocus = true): void {
  const column = activeColumn.value;
  const row = rowAt(cursor.value.row);
  let changed = false;
  if (column && row) {
    const value = parseEditorValue(column.editor ?? column.type, draft.value);
    changed = value !== editStart;
    writeCell(cursor.value.row, column, value);
  }
  editing.value = false;
  draft.value = '';
  if (advance) void applyEnter(changed, force);
  else if (refocus) focusGrid();
}

function commitLookup(via: 'enter' | 'tab' | 'back' | 'stay' = 'enter'): void {
  const column = activeColumn.value;
  const row = rowAt(cursor.value.row);
  if (column && row) {
    writeCell(cursor.value.row, column, lookupPick.value ?? draft.value);
    if (lookupPick.value) {
      row[`${column.id}Id`] = lookupPick.value.id ?? lookupPick.value[column.lookup?.valueKey ?? 'id'];
      row[column.id] = draft.value;
      emit('lookup', { columnId: column.id, rowIndex: cursor.value.row, record: lookupPick.value, row });
    }
  }
  editing.value = false;
  lookupPick.value = null;
  draft.value = '';
  if (via === 'stay') return;
  if (via === 'enter') void applyEnter();
  else afterTab(via === 'back');
}

/** Write the open cell and leave the cursor where it is. Used when focus leaves without Enter. */
function commitInPlace(): void {
  if (!editing.value) return;
  const column = activeColumn.value;
  if (column?.lookup) commitLookup('stay');
  else commitEdit(false, false, false);
}

/** Tab from a cell editor, after the edit is written. */
function onEditorTab(back: boolean): void {
  const row = rowAt(cursor.value.row);
  const last = cursor.value.col >= visibleColumns.value.length - 1;
  if (!back && row && last && showDrawer(row, cursor.value.row)) {
    commitEdit(false, false, false);
    focusDrawer(cursor.value.row, '');
    return;
  }
  if (!back && props.tabFlow === 'enter') {
    commitEdit(true);
    return;
  }
  commitEdit(false);
  afterTab(back);
}

function afterTab(back: boolean): void {
  if (props.tabFlow === 'field') {
    leaveGrid('tab', back);
    return;
  }
  if (!back) {
    void applyEnter();
    return;
  }
  const prev = cellToTheLeft(keyState());
  void moveTo(prev.row, prev.col, false).then(() => focusGrid());
}

function cancelEdit(): void {
  editing.value = false;
  focusGrid();
}

async function applyEnter(changed = false, force = false): Promise<void> {
  const column = activeColumn.value;
  const row = rowAt(cursor.value.row);
  if (column && row) {
    const decision = resolveCellEnter(
      { row, rowIndex: cursor.value.row, changed, force },
      column,
      props.onNextFocus,
    );
    if (decision.type === 'dialog') {
      emit('dialog', {
        dialog: decision.dialog,
        row,
        rowIndex: cursor.value.row,
        columnId: decision.returnTo ?? column.id,
      });
      focusGrid();
      return;
    }
    if (decision.type === 'cell') {
      const col = visibleColumns.value.findIndex((item) => item.id === decision.columnId);
      if (col >= 0) {
        const rowIndex = Math.max(0, Math.min(rows.value.length - 1, cursor.value.row + (decision.rowDelta ?? 0)));
        await moveTo(rowIndex, col, false);
        focusGrid();
        return;
      }
    }
  }
  const state = keyState();
  const action = resolveGridKey(
    { key: 'Enter', ctrl: false, meta: false, shift: false, alt: false },
    { ...state, editing: false, dropdown: false },
  );
  if (action.type === 'move') await moveTo(action.row, action.col, false);
  if (action.type === 'exitGrid') {
    leaveGrid();
    return;
  }
  if (action.type === 'commitMove') {
    if (action.addRow) addRow();
    await moveTo(action.row, action.col, false);
  }
  focusGrid();
}

function leaveGrid(via: 'enter' | 'tab' = 'enter', back = false): void {
  editing.value = false;
  emit('exit');
  if (back) {
    focusPrevDeskField(gridId);
    return;
  }
  if (props.exitField && focusDeskField(props.exitField)) return;
  focusNextDeskField(gridId, via);
}

function addRow(): void {
  rows.value = [...rows.value, blankRow(rows.value.length)];
}

function insertRow(): void {
  const next = [...rows.value];
  next.splice(cursor.value.row, 0, { id: `new-${Date.now()}` });
  rows.value = next;
}

function blankRow(index: number): DeskGridRow {
  const row: DeskGridRow = { id: `row-${Date.now()}-${index}` };
  for (const column of props.columns) row[column.id] = emptyColumnValue(column);
  return row;
}

/** Keep `minRows` rows on screen. Delete of a kept row clears it instead. */
watch(
  () => rows.value.length,
  (length) => {
    if (props.minRows < 1 || length >= props.minRows) return;
    const next = rows.value.slice();
    while (next.length < props.minRows) next.push(blankRow(next.length));
    rows.value = next;
  },
  { immediate: true },
);

function deleteRow(): void {
  if (rows.value.length === 0) return;
  const index = Math.min(cursor.value.row, rows.value.length - 1);
  if (props.minRows > 0 && rows.value.length <= props.minRows) {
    const current = rows.value[index];
    if (!current) return;
    const cleared = clearRowData(current, props.columns);
    const next = rows.value.slice();
    next[index] = cleared;
    rows.value = next;
    emit('change', { row: index, columnId: props.columns[0]?.id ?? '', value: null, record: cleared });
    return;
  }
  const next = rows.value.slice();
  next.splice(index, 1);
  rows.value = next;
  void moveTo(Math.max(0, index - 1), cursor.value.col, false);
}

function gateColumnEmpty(): boolean {
  const id = props.exitWhenBlank || visibleColumns.value[0]?.id;
  if (!id) return false;
  const column = props.columns.find((item) => item.id === id);
  const row = rowAt(cursor.value.row);
  if (!column || !row) return true;
  return cellText(column, row).trim() === '';
}

function keyState() {
  return {
    mode: props.mode,
    rowCount: orderedRows.value.length,
    colCount: visibleColumns.value.length,
    cursor: cursor.value,
    editing: editing.value,
    pageSize: 12,
    blankOnNewRow: gateColumnEmpty(),
    tabFlow: props.tabFlow,
    dropdown: dropdownCell(),
  };
}

/** A select or yes/no cell. Enter opens its list; the next Enter keeps or changes the value and moves on. */
function dropdownCell(): boolean {
  const column = activeColumn.value;
  const row = rowAt(cursor.value.row);
  if (!column || !row || isReadonly(column, row)) return false;
  const kind = column.editor || column.type;
  return kind === 'select' || kind === 'check';
}

function readCell(rowIndex: number, colIndex: number): string {
  const column = visibleColumns.value[colIndex];
  const row = rowAt(rowIndex);
  if (!column || !row) return '';
  return editorText(column, row);
}

function copyRange(): void {
  const box = range.value ?? {
    r1: cursor.value.row,
    c1: cursor.value.col,
    r2: cursor.value.row,
    c2: cursor.value.col,
  };
  const text = rangeToTsv(
    orderedRows.value.length,
    visibleColumns.value.length,
    box.r1,
    box.c1,
    box.r2,
    box.c2,
    readCell,
  );
  void navigator.clipboard.writeText(text);
}

async function pasteRange(): Promise<void> {
  const text = await navigator.clipboard.readText();
  const grid = parseTsv(text);
  grid.forEach((line, rowOffset) => {
    line.forEach((value, colOffset) => {
      const column = visibleColumns.value[cursor.value.col + colOffset];
      if (!column) return;
      writeCell(cursor.value.row + rowOffset, column, parseEditorValue(column.type, value));
    });
  });
}

function fillDown(): void {
  const column = activeColumn.value;
  const row = rowAt(cursor.value.row);
  if (!column || !row) return;
  const value = row[column.id];
  const box = range.value;
  const bottom = box ? Math.max(box.r1, box.r2) : cursor.value.row;
  for (let index = cursor.value.row; index <= bottom; index += 1) writeCell(index, column, value);
}

function onCellMouse(rowIndex: number, colIndex: number, event: MouseEvent): void {
  commitInPlace();
  void moveTo(rowIndex, colIndex, event.shiftKey);
  focusGrid();
}

function applyAction(action: GridKeyAction, event: KeyboardEvent): void {
  if (action.type === 'none') return;
  // Escape with nothing to clear is left for the dialog or page around the grid.
  if (action.type === 'filterKey' && action.clear && !filters[activeColumn.value?.id ?? '']) return;
  event.preventDefault();
  if (action.type === 'move') void moveTo(action.row, action.col, action.extend);
  if (action.type === 'filterKey') applyFilterKey(action);
  if (action.type === 'startEdit') startEdit(action.seed);
  if (action.type === 'cancelEdit') cancelEdit();
  if (action.type === 'exitGrid') {
    if (editing.value) commitEdit(false);
    leaveGrid(action.via, action.back);
  }
  if (action.type === 'commitMove') {
    commitEdit(false);
    if (action.addRow) addRow();
    void moveTo(action.row, action.col, false);
  }
  if (action.type === 'insertRow') insertRow();
  if (action.type === 'deleteRow') deleteRow();
  if (action.type === 'copy') copyRange();
  if (action.type === 'paste' && props.mode !== 'list') void pasteRange();
  if (action.type === 'fillDown' && props.mode !== 'list') fillDown();
  if (action.type === 'openRecord') {
    const row = rowAt(cursor.value.row);
    if (row) emit('open', row);
  }
  if (action.type === 'editRecord') {
    const row = rowAt(cursor.value.row);
    if (row) emit('edit-record', row);
  }
}

/** The open-dialog shortcut commits an edit, then opens even when the value did not change. */
function openCellDialog(): void {
  if (editing.value) {
    commitEdit(true, true);
    return;
  }
  void applyEnter(false, true);
}

function cellHasDialog(force: boolean): boolean {
  const column = activeColumn.value;
  const row = rowAt(cursor.value.row);
  if (!column || !row) return false;
  return (
    resolveCellEnter({ row, rowIndex: cursor.value.row, changed: false, force }, column, props.onNextFocus).type ===
    'dialog'
  );
}

function cellBox(row: number, col: number): DeskBox | null {
  const node = scroller.value?.querySelector<HTMLElement>(`[data-cell="${row}-${col}"]`);
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
}

function activeBox(): DeskBox | null {
  const line = footIndex.value === null ? undefined : props.foot?.[footIndex.value];
  if (!line) return cellBox(cursor.value.row, cursor.value.col);
  const node = scroller.value?.querySelector<HTMLElement>(`[data-foot-line="${line.id}"]`);
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
}

function jumpColumnId(): string {
  return props.jumpColumn || props.exitWhenBlank || visibleColumns.value[0]?.id || '';
}

/** Section jump lands on the first blank row of the jump column, or a new row when every row is filled. */
function gridJumpTo(): DeskJumpStop | null {
  const columnId = jumpColumnId();
  const col = visibleColumns.value.findIndex((column) => column.id === columnId);
  const column = col < 0 ? undefined : visibleColumns.value[col];
  if (!column || col < 0) return null;
  const blank = orderedRows.value.findIndex((row) => cellText(column, row).trim() === '');
  const row = blank >= 0 ? blank : Math.max(0, orderedRows.value.length - 1);
  const rect = cellBox(Math.min(row, Math.max(0, orderedRows.value.length - 1)), col);
  if (!rect) return null;
  const height = rect.bottom - rect.top;
  return {
    rect: blank >= 0 ? rect : { ...rect, top: rect.bottom, bottom: rect.bottom + height },
    label: 'Items',
    go: () => {
      if (blank < 0) addRow();
      focusCell(blank >= 0 ? blank : rows.value.length - 1, columnId);
      return true;
    },
  };
}

/** On a dialog cell, the jump key opens that dialog when both shortcuts share a combo. */
function gridJumpFrom(): DeskJumpStop | null {
  if (footIndex.value !== null || props.mode === 'list') return null;
  const column = activeColumn.value;
  const row = rowAt(cursor.value.row);
  if (!column || !row) return null;
  const decision = resolveCellEnter({ row, rowIndex: cursor.value.row, changed: false, force: true }, column, props.onNextFocus);
  if (decision.type !== 'dialog' || deskComboFor('desk-jump') !== deskComboFor('grid-cell-dialog')) return null;
  const rect = cellBox(cursor.value.row, cursor.value.col);
  if (!rect) return null;
  return {
    rect,
    label: deskJumpLabel(decision.dialog),
    go: () => {
      openCellDialog();
      return true;
    },
  };
}

function gridFocusNear(from: DeskBox, dir: DeskDir): boolean {
  const columns = visibleColumns.value;
  const host = scroller.value;
  if (!host || columns.length === 0) return false;
  const x = (from.left + from.right) / 2;
  let best = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let index = 0; index < columns.length; index += 1) {
    const node = host.querySelector<HTMLElement>(`[data-cell="0-${index}"]`);
    if (!node) continue;
    const rect = node.getBoundingClientRect();
    const dist = Math.abs((rect.left + rect.right) / 2 - x);
    if (dist < bestDist) {
      bestDist = dist;
      best = index;
    }
  }
  const column = columns[best];
  if (!column) return false;
  focusCell(dir === 'up' ? Math.max(0, orderedRows.value.length - 1) : 0, column.id);
  return true;
}

/** Keep a typed cell. A lookup search is dropped, the same as leaving the cell. */
function releaseEdit(): void {
  if (!editing.value) return;
  const column = activeColumn.value;
  const row = rowAt(cursor.value.row);
  if (column && row && !column.lookup) writeCell(cursor.value.row, column, parseEditorValue(column.editor ?? column.type, draft.value));
  editing.value = false;
  lookupPick.value = null;
  draft.value = '';
  focusGrid();
}

function boxOf(node: HTMLElement): DeskBox {
  const rect = node.getBoundingClientRect();
  return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
}

function drawerFieldBoxes(): { id: string; box: DeskBox }[] {
  return drawerFields().flatMap((field) => {
    const id = field.getAttribute('data-drawer-field') ?? '';
    if (!id) return [];
    return [{ id, box: boxOf(field) }];
  });
}

/** Ctrl+Arrow inside the open drawer. Left and Right walk its fields. Up returns to the cell. */
function moveDrawerByDirection(dir: DeskDir): void {
  const active = document.activeElement;
  const host = active instanceof HTMLElement ? active.closest<HTMLElement>('[data-drawer-field]') : null;
  if (!host) return;
  const currentId = host.getAttribute('data-drawer-field') ?? '';
  const nextId = pickToward(
    boxOf(host),
    drawerFieldBoxes().filter((field) => field.id !== currentId),
    dir,
  );
  if (nextId) {
    focusControl(drawerFields().find((field) => field.getAttribute('data-drawer-field') === nextId));
    return;
  }
  if (dir === 'up') {
    focusGrid();
    return;
  }
  if (dir === 'down') {
    const next = cursor.value.row + 1;
    if (next < orderedRows.value.length) {
      void moveTo(next, cursor.value.col, false).then(() => focusGrid());
      return;
    }
    const lines = props.foot ?? [];
    const foot = lines.length > 0 ? editableFoot(-1, 1) : null;
    if (foot !== null) {
      footIndex.value = foot;
      placeSquare();
      focusGrid();
      return;
    }
  }
  focusDeskToward(dir, gridId, boxOf(host));
}

function moveByDirection(dir: DeskDir): void {
  if (drawerPlace(document.activeElement)) {
    moveDrawerByDirection(dir);
    return;
  }
  releaseEdit();
  const lines = props.foot ?? [];
  const lastRow = Math.max(0, orderedRows.value.length - 1);
  const lastCol = Math.max(0, visibleColumns.value.length - 1);
  const onFoot = footIndex.value;
  if (onFoot !== null) {
    if (dir === 'down') {
      const next = editableFoot(onFoot, 1);
      if (next !== null) {
        footIndex.value = next;
        placeSquare();
        focusGrid();
        return;
      }
    }
    if (dir === 'up') {
      const next = editableFoot(onFoot, -1);
      if (next !== null) {
        footIndex.value = next;
        placeSquare();
      } else {
        footIndex.value = null;
        void moveTo(lastRow, cursor.value.col, false);
      }
      focusGrid();
      return;
    }
  } else {
    const { row, col } = cursor.value;
    if (dir === 'left' && col > 0) {
      void moveTo(row, col - 1, false).then(() => focusGrid());
      return;
    }
    if (dir === 'right' && col < lastCol) {
      void moveTo(row, col + 1, false).then(() => focusGrid());
      return;
    }
    if (dir === 'up' && row > 0) {
      void moveTo(row - 1, col, false).then(() => focusGrid());
      return;
    }
    if (dir === 'down') {
      const record = rowAt(row);
      const from = record && showDrawer(record, row) ? cellBox(row, col) : null;
      const fieldId = from ? pickToward(from, drawerFieldBoxes(), 'down') : null;
      if (fieldId) {
        focusDrawer(row, fieldId);
        return;
      }
    }
    if (dir === 'down' && row < lastRow) {
      void moveTo(row + 1, col, false).then(() => focusGrid());
      return;
    }
    if (dir === 'down' && lines.length > 0) {
      const next = editableFoot(-1, 1);
      if (next !== null) {
        footIndex.value = next;
        placeSquare();
        focusGrid();
        return;
      }
    }
  }
  const from = activeBox();
  if (from) focusDeskToward(dir, gridId, from);
}

function onKey(event: KeyboardEvent): void {
  if (event.target instanceof HTMLElement && event.target.closest('.column-filter')) return;
  if (event.ctrlKey || event.metaKey) {
    // A page that changes tabs with this key owns it. The grid does not extend a selection.
    if (isDeskTabKey(event)) return;
    const dir = deskMoveDir(event);
    if (dir) {
      event.preventDefault();
      event.stopPropagation();
      moveByDirection(dir);
      return;
    }
    if (props.mode !== 'list' && isDeskJumpKey(event)) {
      const combo = toCombo(keyInputOf(event));
      if (combo && deskActionsFor(combo).includes('grid-cell-dialog') && cellHasDialog(true)) {
        event.preventDefault();
        openCellDialog();
        return;
      }
      releaseEdit();
      return;
    }
  }
  const place = drawerPlace(event.target);
  if (place) {
    const action = resolveDrawerKey({ key: event.key, shift: event.shiftKey }, place);
    if (
      (event.key === 'ArrowUp' || event.key === 'ArrowDown')
      && event.target instanceof HTMLSelectElement
    ) {
      return;
    }
    if (action.type === 'move-row') {
      event.preventDefault();
      const next = cursor.value.row + action.dir;
      if (next >= 0 && next < orderedRows.value.length) {
        void moveTo(next, cursor.value.col, false).then(() => focusGrid());
      }
    } else if (action.type === 'next-field') {
      event.preventDefault();
      focusDrawerStep(1);
    } else if (action.type === 'next-row') {
      event.preventDefault();
      const next = cursor.value.row + 1;
      if (next < orderedRows.value.length) void moveTo(next, 0, false).then(() => focusGrid());
      else focusGrid();
    } else if (action.type === 'leave-drawer') {
      event.preventDefault();
      focusGrid();
    } else if (event.key === 'Enter') {
      event.preventDefault();
    }
    return;
  }
  const lastColIndex = Math.max(0, visibleColumns.value.length - 1);
  const cursorRow = rowAt(cursor.value.row);
  if (
    (event.key === 'Tab' || event.key === 'Enter')
    && !event.shiftKey
    && !event.ctrlKey
    && !event.metaKey
    && cursor.value.col === lastColIndex
    && cursorRow
    && showDrawer(cursorRow, cursor.value.row)
    && !dropdownCell()
  ) {
    event.preventDefault();
    if (editing.value) commitEdit(false, false, false);
    focusDrawer(cursor.value.row, '');
    return;
  }
  if (onFootKey(event)) return;
  const combo = toCombo(keyInputOf(event));
  if (combo && deskActionsFor(combo).includes('grid-cell-dialog') && cellHasDialog(true)) {
    event.preventDefault();
    openCellDialog();
    return;
  }
  if (event.key === 'F3' && activeColumn.value?.lookup) {
    event.preventDefault();
    emit('create-lookup', { columnId: activeColumn.value.id, rowIndex: cursor.value.row });
    return;
  }
  if (event.altKey && event.key === 'ArrowDown' && activeColumn.value?.lookup) {
    event.preventDefault();
    startEdit('');
    return;
  }
  const action = resolveGridKey(
    {
      key: event.key,
      ctrl: event.ctrlKey,
      meta: event.metaKey,
      shift: event.shiftKey,
      alt: event.altKey,
    },
    keyState(),
  );
  applyAction(action, event);
}

watch(cursor, () => {
  void nextTick(() => {
    syncPad();
    requestAnimationFrame(() => placeSquare());
  });
});

watch(
  () => orderedRows.value.length,
  () => {
    void nextTick(() => placeSquare());
  },
);

function currentRow(): DeskGridRow | null {
  return rowAt(cursor.value.row) ?? null;
}

/** Put the cursor on a cell by column id and focus the grid, e.g. after a line dialog closes. */
function focusCell(rowIndex: number, columnId: string): void {
  const col = Math.max(0, visibleColumns.value.findIndex((column) => column.id === columnId));
  editing.value = false;
  void moveTo(rowIndex, col, false).then(() => focusGrid());
}

function focusDrawer(rowIndex: number, fieldId: string): void {
  editing.value = false;
  footIndex.value = null;
  void moveTo(rowIndex, cursor.value.col, false).then(() => {
    void nextTick(() => {
      const root = scroller.value?.querySelector('tr.desk-row-drawer');
      const named = fieldId ? root?.querySelector<HTMLElement>(`[data-drawer-field="${fieldId}"]`) : null;
      const first = root?.querySelector<HTMLElement>('[data-drawer-field]');
      focusControl(named ?? first);
    });
  });
}

function onTag(rowIndex: number, fieldId: string): void {
  focusDrawer(rowIndex, fieldId);
}

function drawerFields(): HTMLElement[] {
  const root = scroller.value?.querySelector('tr.desk-row-drawer');
  if (!root) return [];
  return [...root.querySelectorAll<HTMLElement>('[data-drawer-field]')];
}

function focusControl(node: HTMLElement | null | undefined): void {
  if (!node) return;
  const inner = node.matches('input, select, textarea, button')
    ? node
    : node.querySelector<HTMLElement>('input, select, textarea, button');
  (inner ?? node).focus();
}

function focusDrawerStep(dir: 1 | -1): void {
  const fields = drawerFields();
  const active = document.activeElement;
  const index = fields.findIndex((field) => field === active || field.contains(active));
  const next = fields[index + dir];
  if (next) focusControl(next);
  else if (dir < 0) focusGrid();
}

function drawerPlace(target: EventTarget | null): DrawerPlace | null {
  if (!(target instanceof HTMLElement)) return null;
  const host = target.closest('.desk-row-drawer');
  if (!host) return null;
  const fields = [...host.querySelectorAll<HTMLElement>('[data-drawer-field]')];
  const index = fields.findIndex((field) => field === target || field.contains(target));
  if (fields.length === 0 || index <= 0) return 'drawer-first';
  if (index === fields.length - 1) return 'drawer-last';
  return 'drawer-mid';
}

useDeskLayer({
  fields: [
    {
      id: gridId,
      focus: () => {
        focusEntry();
        return true;
      },
      jumpTo: gridJumpTo,
      jumpFrom: gridJumpFrom,
      focusNear: gridFocusNear,
    },
  ],
});

let padObserver: ResizeObserver | null = null;

onMounted(() => {
  if (scroller.value) {
    padObserver = new ResizeObserver(() => syncPad());
    padObserver.observe(scroller.value);
    void nextTick(() => {
      const table = scroller.value?.querySelector('table');
      if (table) padObserver?.observe(table);
      syncPad();
    });
  }
  if (props.storageKey) {
    const saved = localStorage.getItem(props.storageKey);
    if (saved) {
      try {
        const ids = JSON.parse(saved) as unknown;
        if (Array.isArray(ids)) hidden.value = new Set(ids.filter((id): id is string => typeof id === 'string'));
      } catch {
        hidden.value = new Set();
      }
    }
  }
  void nextTick(() => placeSquare());
});

watch(
  () => [footPinned.value, rows.value.length, props.foot.length, visibleColumns.value.length, hasSummary.value, cursor.value.row],
  () => {
    void nextTick(() => syncPad());
  },
);

onUnmounted(() => {
  padObserver?.disconnect();
});

defineExpose<DeskGridApi>({ focusGrid, focusEntry, focusCell, moveTo, addRow, currentRow, focusDrawer });
</script>
