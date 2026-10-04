import { computed, ref, type Ref } from 'vue';
import { apiFailure } from '../api/errors';
import type { ResourceApi } from '../api/resource';

export interface DeskIssue {
  message: string;
  fieldId?: string;
}

export interface ResourceDialogOptions<T, TForm, TSave> {
  blank: () => TForm;
  toForm: (record: T) => TForm;
  toPayload: (form: TForm, editingId: number | string | null) => TSave;
  /** Client-side validation. Runs after the first Save attempt and rechecks as the user types. */
  validate?: (form: TForm, editingId: number | string | null) => DeskIssue[];
  onSaved?: (record: T) => void;
}

/** Create and edit in a DeskDialog: load, validate, save, and server issues. */
export function useResourceDialog<T extends { id?: unknown }, TForm extends object, TSave>(
  api: ResourceApi<T, TSave>,
  options: ResourceDialogOptions<T, TForm, TSave>,
) {
  const open = ref(false);
  const editingId = ref<number | string | null>(null);
  const form = ref(options.blank()) as Ref<TForm>;
  const record = ref<T | null>(null) as Ref<T | null>;
  const loading = ref(false);
  const saving = ref(false);
  const checked = ref(false);
  const serverIssues = ref<DeskIssue[]>([]);
  const issues = computed(() => (checked.value && options.validate ? options.validate(form.value, editingId.value) : []));

  function reset(): void {
    checked.value = false;
    serverIssues.value = [];
  }

  function openNew(seed?: Partial<TForm>): void {
    reset();
    editingId.value = null;
    record.value = null;
    form.value = { ...options.blank(), ...(seed ?? {}) };
    open.value = true;
  }

  async function openEdit(id: number | string): Promise<void> {
    reset();
    editingId.value = id;
    loading.value = true;
    try {
      const loaded = await api.get(id);
      record.value = loaded;
      form.value = options.toForm(loaded);
      open.value = true;
    } catch (caught) {
      serverIssues.value = apiFailure(caught).issues;
      open.value = true;
    } finally {
      loading.value = false;
    }
  }

  async function save(): Promise<T | null> {
    if (saving.value) return null;
    checked.value = true;
    if (issues.value.length) return null;
    saving.value = true;
    try {
      const payload = options.toPayload(form.value, editingId.value);
      const saved =
        editingId.value === null
          ? await api.create(payload)
          : await api.update(editingId.value, payload);
      open.value = false;
      options.onSaved?.(saved);
      return saved;
    } catch (caught) {
      const failure = apiFailure(caught);
      serverIssues.value = failure.issues;
      return null;
    } finally {
      saving.value = false;
    }
  }

  return { open, editingId, form, record, loading, saving, issues, serverIssues, openNew, openEdit, save };
}
