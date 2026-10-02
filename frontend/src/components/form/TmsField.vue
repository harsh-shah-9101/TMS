<!--
  TmsField.vue — keyboard-first text input
  Looks exactly like q-input outlined dense.
  Enter / Tab → next field | Shift+Tab → prev field
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
  placeholder?: string
  maxlength?: number | string
  focusNext: (id: string) => void
  focusPrev: (id: string) => void
}>(), { type: 'text' })

const model = defineModel<string | number | null>({ required: true })

const focused = ref(false)
const touched = ref(false)

const isEmpty = computed(() =>
  model.value === null || model.value === undefined || String(model.value).trim() === ''
)
const hasValue = computed(() => !isEmpty.value)
const showError = computed(() => props.required && touched.value && isEmpty.value)
const labelUp = computed(() => focused.value || hasValue.value || props.placeholder)

function onInput(e: Event) {
  model.value = (e.target as HTMLInputElement).value
}

function onFocus() { focused.value = true }
function onBlur() { focused.value = false; touched.value = true }

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    props.focusNext(props.fieldId)
  } else if (e.key === 'Tab') {
    e.preventDefault()
    if (e.shiftKey) props.focusPrev(props.fieldId)
    else props.focusNext(props.fieldId)
  }
}
</script>

<template>
  <div class="tms-field" :class="{ 'tms-field--focused': focused, 'tms-field--error': showError, 'tms-field--readonly': readonly }">
    <div class="tms-field__wrap">
      <!-- Floating label -->
      <label
        :for="fieldId"
        class="tms-field__label"
        :class="{ 'tms-field__label--up': labelUp, 'tms-field__label--focused': focused, 'tms-field__label--error': showError }"
      >
        {{ label }}<span v-if="required" class="tms-req"> *</span>
      </label>

      <!-- Native input -->
      <input
        :id="fieldId"
        :data-tms-field="fieldId"
        v-bind="initial ? { 'data-tms-initial': '' } : {}"
        class="tms-field__input"
        :type="type"
        :value="model ?? ''"
        :readonly="readonly"
        :placeholder="labelUp ? placeholder : ''"
        :maxlength="maxlength"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
      />
    </div>

    <!-- Hint / error message -->
    <div v-if="showError" class="tms-field__msg tms-field__msg--error">{{ label }} is required</div>
    <div v-else-if="hint" class="tms-field__msg">{{ hint }}</div>
  </div>
</template>

<style scoped>
.tms-field { position: relative; margin-bottom: 4px; }

/* Outer bordered box — matches q-input outlined dense */
.tms-field__wrap {
  position: relative;
  border: 1px solid rgba(0,0,0,0.24);
  border-radius: 4px;
  height: 40px;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
  cursor: text;
}
.tms-field--focused .tms-field__wrap {
  border-color: var(--q-primary, #1976d2);
  border-width: 2px;
  box-shadow: none;
}
.tms-field--error .tms-field__wrap {
  border-color: var(--q-negative, #c10015) !important;
  border-width: 2px;
}
.tms-field--readonly .tms-field__wrap {
  background: #f5f5f5;
  border-color: rgba(0,0,0,0.12);
}

/* Floating label */
.tms-field__label {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: rgba(0,0,0,0.6);
  background: transparent;
  pointer-events: none;
  transition: all 0.15s ease;
  line-height: 1;
  white-space: nowrap;
}
.tms-field__label--up {
  top: 0;
  transform: translateY(-50%);
  font-size: 11px;
  background: #fff;
  padding: 0 3px;
  left: 9px;
}
.tms-field__label--focused { color: var(--q-primary, #1976d2); }
.tms-field__label--error { color: var(--q-negative, #c10015) !important; }
.tms-req { color: var(--q-negative, #c10015); }

/* Native input */
.tms-field__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 0 12px;
  font-size: 14px;
  color: rgba(0,0,0,0.87);
  font-family: inherit;
  padding-top: 8px; /* nudge text down so label has room */
}
.tms-field__input[readonly] { cursor: default; color: rgba(0,0,0,0.54); }

/* Hint / error */
.tms-field__msg {
  font-size: 11px;
  color: rgba(0,0,0,0.54);
  padding: 2px 12px 0;
  min-height: 16px;
}
.tms-field__msg--error { color: var(--q-negative, #c10015); }
</style>
