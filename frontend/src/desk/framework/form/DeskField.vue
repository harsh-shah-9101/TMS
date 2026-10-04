<template>
  <div
    class="desk-field"
    :class="{ 'is-invalid': invalid }"
    v-bind="noMove ? { 'data-desk-no-move': '' } : {}"
    @focusout="onFocusOut"
  >
    <label :for="fieldId">{{ label }}<span v-if="required" class="desk-req" aria-hidden="true"> *</span></label>
    <div class="desk-field-control">
    <DeskCombo
      v-if="kind === 'select'"
      v-model="selectValue"
      :field-id="fieldId"
      :options="options ?? []"
      v-bind="initial ? { initial: true } : {}"
      @advance="(via) => focusNextDeskField(fieldId, via)"
      @back="focusPrevDeskField(fieldId)"
    />
    <DeskLookupBox
      v-else-if="kind === 'lookup' && lookup"
      v-model="textValue"
      :field-id="fieldId"
      :lookup="lookup"
      v-bind="initial ? { initial: true } : {}"
      @pick="emit('pick', $event)"
      @advance="(via) => focusNextDeskField(fieldId, via)"
      @back="focusPrevDeskField(fieldId)"
    />
    <textarea
      v-else-if="kind === 'textarea'"
      :id="fieldId"
      :data-desk-field="fieldId"
      v-bind="initial ? { 'data-desk-initial': '' } : {}"
      :value="shown"
      rows="2"
      @input="onInput"
      @keydown.enter.exact.prevent="focusNextDeskField(fieldId)"
      @keydown.tab.prevent="onTab"
    />
    <input
      v-else
      :id="fieldId"
      :data-desk-field="fieldId"
      :type="kind === 'date' ? 'date' : 'text'"
      :value="shown"
      v-bind="{
        ...(initial ? { 'data-desk-initial': '' } : {}),
        ...(readonly ? { readonly: true } : {}),
      }"
      @input="onInput"
      @keydown.enter.exact.prevent="focusNextDeskField(fieldId)"
      @keydown.tab.prevent="onTab"
    />
    <slot name="suffix" />
    </div>
    <span v-if="issue" class="desk-field-msg" :title="issue">{{ issue }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watchEffect } from 'vue';
import type { DeskLookupConfig, DeskSelectOption } from '../grid/types';
import { focusNextDeskField, focusPrevDeskField } from '../focus/useDeskFocus';
import { DESK_FORM_ISSUES } from './issues';
import DeskCombo from './DeskCombo.vue';
import DeskLookupBox from './DeskLookupBox.vue';

const model = defineModel<string | number | null>({ required: true });
const props = defineProps<{
  fieldId: string;
  label: string;
  kind?: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'lookup';
  options?: DeskSelectOption[];
  lookup?: DeskLookupConfig;
  /** This field takes focus when its page or dialog opens. */
  initial?: boolean;
  readonly?: boolean;
  /** Ctrl+Arrow is not a field move while this field has focus. */
  noMove?: boolean;
  /** Shows * on the label. Leaving it empty turns the field reddish. */
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

/** The form's message for this field, or null. */
const issue = computed(() => form?.issueFor(props.fieldId) ?? null);
/** Set once focus has left the field, so a required field is not red before anyone touched it. */
const touched = ref(false);
const invalid = computed(() => issue.value !== null || (props.required === true && touched.value && shown.value.trim() === ''));

// The form learns this field is on screen, so its issue shows here and not as a toast.
watchEffect((onCleanup) => {
  if (form) onCleanup(form.mount(props.fieldId));
});

function onFocusOut(event: FocusEvent): void {
  if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) touched.value = true;
}

function onInput(event: Event): void {
  form?.edited(props.fieldId);
  model.value = (event.target as HTMLInputElement).value;
}

function onTab(event: KeyboardEvent): void {
  if (event.shiftKey) focusPrevDeskField(props.fieldId);
  else focusNextDeskField(props.fieldId, 'tab');
}
</script>
