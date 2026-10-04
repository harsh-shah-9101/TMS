<template>
  <TmsDialog v-model:open="open" :title="`${action?.label ?? ''} · ${subject}`" initial-focus="action-ok" @accept="run">
    <DeskForm :server-issues="issues" @save="run">
      <p v-if="action?.confirm && !failure">{{ action.confirm }}</p>
      <DeskField
        v-for="input in action?.inputs ?? []"
        :key="input.id"
        :model-value="values[input.id] ?? ''"
        @update:model-value="(value) => (values[input.id] = value)"
        :field-id="input.id"
        :label="input.label"
        :kind="input.kind === 'date' ? 'date' : input.kind === 'textarea' ? 'textarea' : 'text'"
        :required="input.required === true"
      />
      <div v-if="failure" class="tms-action-issues" role="alert">
        <strong>{{ failure.warnings.length ? 'Please confirm' : failure.message }}</strong>
        <ul>
          <li v-for="item in [...failure.blockers, ...failure.warnings]" :key="item.code + item.message">{{ item.message }}</li>
        </ul>
      </div>
      <div class="desk-dialog-actions">
        <button type="button" class="is-primary" data-desk-field="action-ok" :disabled="busy || blocked" @click="run">
          {{ confirming ? 'Confirm' : action?.label }}
        </button>
        <button type="button" data-desk-field="action-cancel" @click="open = false">{{ blocked ? 'Close' : 'Cancel' }}</button>
      </div>
    </DeskForm>
  </TmsDialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { DeskField, DeskForm, TmsDialog, type DeskIssue } from '../ui';
import { apiFailure, type ApiFailure } from '../api/errors';
import type { ActionInfo } from '../api/resource';

const open = defineModel<boolean>('open', { required: true });
const props = defineProps<{
  action: ActionInfo | null;
  /** Row label for the title. */
  subject: string;
  /** Runs the action with the collected inputs; throws on refusal. */
  perform: (name: string, input: Record<string, unknown>) => Promise<unknown>;
}>();
const emit = defineEmits<{ done: [] }>();

const values = reactive<Record<string, string | number | null>>({});
const failure = ref<ApiFailure | null>(null);
const issues = ref<DeskIssue[]>([]);
const busy = ref(false);
const confirming = computed(() => (failure.value?.warnings.length ?? 0) > 0);
/** Hard stops: nothing the user can confirm away. */
const blocked = computed(() => (failure.value?.blockers.length ?? 0) > 0);

watch(open, (shown) => {
  if (!shown) return;
  failure.value = null;
  issues.value = [];
  for (const key of Object.keys(values)) delete values[key];
  for (const input of props.action?.inputs ?? []) values[input.id] = '';
});

async function run(): Promise<void> {
  if (!props.action || busy.value || blocked.value) return;
  const missing = (props.action.inputs ?? []).filter((input) => input.required && !String(values[input.id] ?? '').trim());
  if (missing.length) {
    issues.value = missing.map((input) => ({ fieldId: input.id, message: `${input.label} is required` }));
    return;
  }
  busy.value = true;
  try {
    await props.perform(props.action.name, { ...values, ...(confirming.value ? { confirm: true } : {}) });
    open.value = false;
    emit('done');
  } catch (caught) {
    const result = apiFailure(caught);
    failure.value = result.blockers.length || result.warnings.length ? result : null;
    issues.value = failure.value ? [] : result.issues;
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.tms-action-issues {
  margin: 10px 0;
  padding: 8px 12px;
  background: var(--desk-danger-bg);
  border-radius: 4px;
  color: var(--desk-danger);
}

.tms-action-issues ul {
  margin: 4px 0 0;
  padding-left: 18px;
}
</style>
