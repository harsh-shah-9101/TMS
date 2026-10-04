import { computed, onUnmounted, ref, type Ref } from 'vue';
import { apiFailure } from '../api/errors';
import type { ListParams, ResourceApi } from '../api/resource';
import type { DeskColumn } from '../ui';
import { columnKey } from '../ui';

export interface ResourceListOptions {
  columns: DeskColumn[];
  pageSize?: number;
  /** Module filters added to every request, such as `{ subtype: 'driver' }`. Reactive reads are fine. */
  params?: () => ListParams;
  sortColumn?: string;
  sortDescending?: boolean;
}

/**
 * One server-paged DeskGrid list: paging, column filters, sort, and stale-response guarding.
 * The requestId counter ensures a late response from a previous request never overwrites a newer one.
 */
export function useResourceList<T>(api: ResourceApi<T, unknown>, options: ResourceListOptions) {
  const rows = ref([]) as Ref<T[]>;
  const count = ref(0);
  const loading = ref(false);
  const error = ref('');
  const page = ref(1);
  const pageSize = ref(options.pageSize ?? 50);
  const sortColumn = ref(options.sortColumn ?? '');
  const sortDescending = ref(options.sortDescending ?? false);
  const filters = ref<Record<string, string>>({});
  const pageCount = computed(() => Math.max(1, Math.ceil(count.value / pageSize.value)));
  let requestId = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function serverKey(columnId: string): string {
    const column = options.columns.find((c) => c.id === columnId);
    return column ? columnKey(column) : columnId;
  }

  async function fetchPage(): Promise<void> {
    const id = ++requestId;
    loading.value = true;
    error.value = '';
    const columnFilters = Object.fromEntries(
      Object.entries(filters.value).map(([columnId, text]) => [serverKey(columnId), text]),
    );
    try {
      const result = await api.list({
        ...(options.params?.() ?? {}),
        limit: pageSize.value,
        offset: (page.value - 1) * pageSize.value,
        filters: columnFilters,
        ...(sortColumn.value ? { sort: serverKey(sortColumn.value), dir: sortDescending.value ? 'DESC' : 'ASC' } : {}),
      });
      if (id !== requestId) return; // discard stale response
      rows.value = result.rows;
      count.value = result.count;
    } catch (caught) {
      if (id !== requestId) return;
      error.value = apiFailure(caught).message;
      rows.value = [];
    } finally {
      if (id === requestId) loading.value = false;
    }
  }

  function onFilter(next: Record<string, string>): void {
    filters.value = next;
    page.value = 1;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void fetchPage(), 300); // 300ms debounce
  }

  function onSort(columnId: string): void {
    if (sortColumn.value === columnId) sortDescending.value = !sortDescending.value;
    else { sortColumn.value = columnId; sortDescending.value = false; }
    void fetchPage();
  }

  function changePage(next: number): void {
    const target = Math.min(Math.max(1, next), pageCount.value);
    if (target === page.value) return;
    page.value = target;
    void fetchPage();
  }

  onUnmounted(() => { if (timer) clearTimeout(timer); });

  return { rows, count, loading, error, page, pageSize, pageCount, sortColumn, sortDescending, fetchPage, onFilter, onSort, changePage };
}
