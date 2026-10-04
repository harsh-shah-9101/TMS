import { ref, type Ref } from 'vue';
import type { DeskSelectOption } from '../ui';
import type { ResourceApi } from '../api/resource';

/** Every row of a master as select options, loaded once per call site. */
export function useOptions<T extends { id: number | string }>(
  api: ResourceApi<T, unknown>,
  label: (row: T) => string,
  params: Record<string, unknown> = {},
): { options: Ref<DeskSelectOption[]>; rows: Ref<T[]>; load: () => Promise<void> } {
  const options = ref<DeskSelectOption[]>([]);
  const rows = ref([]) as Ref<T[]>;
  async function load(): Promise<void> {
    try {
      const page = await api.list({ limit: 500, ...params });
      rows.value = page.rows;
      options.value = page.rows.map((row) => ({ value: String(row.id), label: label(row) }));
    } catch {
      rows.value = [];
      options.value = [];
    }
  }
  return { options, rows, load };
}

export const YES_NO_BOOL: DeskSelectOption[] = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];

export const yesNo = (value: boolean | null | undefined): string => (value ? 'Yes' : 'No');
export const fromYesNo = (value: string | null | undefined): boolean => value === 'Yes';
