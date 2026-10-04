import { computed, type ComputedRef, type Ref } from 'vue';
import {
  createColumnHelper,
  createExpandedRowModel,
  createGroupedRowModel,
  createSortedRowModel,
  sortFns,
  stockFeatures,
  tableFeatures,
  useTable,
  type ColumnDef,
} from '@tanstack/vue-table';
import type { DeskColumn, DeskGridRow } from './types';

export const deskTableFeatures = tableFeatures({
  ...stockFeatures,
  sortedRowModel: createSortedRowModel(),
  groupedRowModel: createGroupedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  sortFns,
});

type DeskFeatures = typeof deskTableFeatures;

function buildColumnDefs(columns: DeskColumn[], sortable: boolean): ColumnDef<DeskFeatures, DeskGridRow>[] {
  const helper = createColumnHelper<DeskFeatures, DeskGridRow>();
  const leaves = columns.map((col) =>
    helper.accessor((row) => row[col.id], {
      id: col.id,
      header: col.header,
      size: col.width ?? 120,
      enableSorting: sortable,
    }),
  );

  const groups: ColumnDef<DeskFeatures, DeskGridRow>[] = [];
  let index = 0;
  while (index < columns.length) {
    const group = columns[index]?.group;
    if (!group) {
      const leaf = leaves[index];
      if (leaf) groups.push(leaf);
      index += 1;
      continue;
    }
    const start = index;
    while (index < columns.length && columns[index]?.group === group) index += 1;
    groups.push(
      helper.group({
        id: `group-${group}-${start}`,
        header: group,
        columns: leaves.slice(start, index),
      }),
    );
  }
  return groups;
}

export function useDeskTable(columns: ComputedRef<DeskColumn[]>, data: Ref<DeskGridRow[]>, sortable: boolean) {
  const columnDefs = computed(() => buildColumnDefs(columns.value, sortable));
  const table = useTable<DeskFeatures, DeskGridRow>({
    features: deskTableFeatures,
    columns: columnDefs,
    data,
    getRowId: (row, index) => String(row.id ?? index),
  });

  const headerGroups = computed(() => table.getHeaderGroups());
  const rows = computed(() => table.getRowModel().rows);

  return { table, headerGroups, rows };
}
