<template>
  <div class="desk-field" @focusout="onFocusOut">
    
    <q-select
      v-if="kind === 'select'"
      v-model="selectValue"
      :options="options ?? []"
      :label="label + (required ? ' *' : '')"
      :error="invalid"
      :error-message="issue ?? 'Required'"
      :readonly="readonly"
      hide-bottom-space
      outlined
      dense
      emit-value
      map-options
      :data-desk-field="fieldId"
      :data-desk-initial="initial ? '' : null"
      @keydown.enter.exact.prevent="focusNextDeskField(fieldId)"
      @keydown.tab.prevent="onTab"
    />
    
    <!-- We will map lookup to a searchable q-select for now if needed, but the original DeskLookupBox can be preserved if required. Since user complained about UI, let's use q-input for everything else for now. -->
    
    <q-input
      v-else-if="kind === 'textarea'"
      v-model="textValue"
      type="textarea"
      :label="label + (required ? ' *' : '')"
      :error="invalid"
      :error-message="issue ?? 'Required'"
      :readonly="readonly"
      hide-bottom-space
      outlined
      dense
      rows="2"
      :data-desk-field="fieldId"
      :data-desk-initial="initial ? '' : null"
      @keydown.enter.exact.prevent="focusNextDeskField(fieldId)"
      @keydown.tab.prevent="onTab"
    />

    <q-input
      v-else
      v-model="textValue"
      :type="kind === 'date' ? 'date' : 'text'"
      :label="label + (required ? ' *' : '')"
      :error="invalid"
      :error-message="issue ?? 'Required'"
      :readonly="readonly"
      hide-bottom-space
      outlined
      dense
      :data-desk-field="fieldId"
      :data-desk-initial="initial ? '' : null"
      @keydown.enter.exact.prevent="focusNextDeskField(fieldId)"
      @keydown.tab.prevent="onTab"
    />

  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watchEffect } from 'vue';
import type { DeskLookupConfig, DeskSelectOption } from '../grid/types';
import { focusNextDeskField, focusPrevDeskField } from '../focus/useDeskFocus';
import { DESK_FORM_ISSUES } from './issues';

const model = defineModel<string | number | null>({ required: true });
const props = defineProps<{
  fieldId: string;
  label: string;
  kind?: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'lookup';
  options?: DeskSelectOption[];
  lookup?: DeskLookupConfig;
  initial?: boolean;
  readonly?: boolean;
  noMove?: boolean;
  required?: boolean;
}>();
const emit = defineEmits<{ pick: [Record<string, unknown>] }>();

const form = inject(DESK_FORM_ISSUES, null);
const shown = computed(() => (model.value === null || model.value === undefined ? '' : String(model.value)));

const textValue = computed({
  get: () => shown.value,
  set: (value: string) => {
    form?.edited(props.fieldId);
    model.value = value;
  },
});

const selectValue = computed({
  get: () => shown.value,
  set: (value: string) => {
    form?.edited(props.fieldId);
    model.value = value;
  },
});

const issue = computed(() => form?.issueFor(props.fieldId) ?? null);
const touched = ref(false);
const invalid = computed(() => issue.value !== null || (props.required === true && touched.value && shown.value.trim() === ''));

watchEffect((onCleanup) => {
  if (form) onCleanup(form.mount(props.fieldId));
});

function onFocusOut(event: FocusEvent): void {
  if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) touched.value = true;
}

function onTab(event: KeyboardEvent): void {
  if (event.shiftKey) focusPrevDeskField(props.fieldId);
  else focusNextDeskField(props.fieldId, 'tab');
}
</script>
