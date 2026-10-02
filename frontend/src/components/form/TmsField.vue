<!--
  TmsField.vue
  ─────────────
  Keyboard-first input field.

  Features:
  - Enter → moves focus to the next [data-tms-field] in the container
  - Shift+Tab → moves to previous, Tab → moves to next
  - Required star * shown in label
  - Turns red after user leaves an empty required field
  - Works with q-input under the hood (outlined, dense)

  Props:
    fieldId     unique string id — must match data-tms-field attr
    label       visible label text
    modelValue  v-model value
    type        'text' | 'number' | 'date' | 'email' | 'tel' | 'password'
    required    shows * and validates on blur
    readonly    greys out the field
    initial     marks this field to receive auto-focus when the form opens
    hint        helper text below field
    rules       Quasar validation rules array
    focusNext   function from useTmsFormFocus — called on Enter/Tab
    focusPrev   function from useTmsFormFocus — called on Shift+Tab
-->

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  fieldId: string
  label: string
  type?: 'text' | 'number' | 'date' | 'email' | 'tel' | 'password'
  required?: boolean
  readonly?: boolean
  initial?: boolean
  hint?: string
  rules?: ((v: any) => boolean | string)[]
  placeholder?: string
  maxlength?: number | string
  focusNext: (id: string) => void
  focusPrev: (id: string) => void
}>(), {
  type: 'text',
})

const model = defineModel<string | number | null>({ required: true })

const touched = ref(false)
const inputRef = ref<any>(null)

const isEmpty = computed(() =>
  model.value === null || model.value === undefined || String(model.value).trim() === ''
)
const showError = computed(() => props.required && touched.value && isEmpty.value)

const effectiveRules = computed(() => {
  const r = props.rules ? [...props.rules] : []
  if (props.required) {
    r.unshift((v: any) => !!v || `${props.label} is required`)
  }
  return r
})

function onEnter() {
  props.focusNext(props.fieldId)
}

function onTab(e: KeyboardEvent) {
  e.preventDefault()
  if (e.shiftKey) props.focusPrev(props.fieldId)
  else props.focusNext(props.fieldId)
}

function onBlur() {
  touched.value = true
}
</script>

<template>
  <div class="tms-field-wrap">
    <q-input
      :ref="(el) => inputRef = el"
      v-model="model"
      :type="type"
      :label="required ? label + ' *' : label"
      :placeholder="placeholder"
      :readonly="readonly"
      :hint="hint"
      :rules="effectiveRules"
      :error="showError"
      :error-message="showError ? `${label} is required` : undefined"
      outlined
      dense
      lazy-rules
      :input-attrs="{
        'data-tms-field': fieldId,
        ...(initial ? { 'data-tms-initial': '' } : {}),
        ...(maxlength ? { maxlength: String(maxlength) } : {}),
      }"
      @keydown.enter.exact.prevent="onEnter"
      @keydown.tab.prevent="onTab"
      @blur="onBlur"
    />
  </div>
</template>
