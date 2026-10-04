<template>
  <div class="desk-field" :class="{ 'is-invalid': invalid, 'is-focus': hasFocus }">
    <label v-if="label" :for="fieldId" class="desk-field-label">
      {{ label }}
      <span v-if="required" class="desk-field-req">*</span>
    </label>
    <div class="desk-field-control desk-password-control">
      <input
        :id="fieldId"
        ref="input"
        :type="revealed ? 'text' : 'password'"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :data-desk-field="fieldId"
        class="desk-input"
        autocomplete="current-password"
        @input="onInput"
        @focus="hasFocus = true"
        @blur="hasFocus = false"
      />
      <button
        type="button"
        tabindex="-1"
        class="desk-pw-toggle"
        :title="revealed ? 'Hide password' : 'Show password'"
        @click="revealed = !revealed"
      >
        {{ revealed ? 'Hide' : 'Show' }}
      </button>
    </div>
    <span v-if="hint" class="desk-field-hint">{{ hint }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const modelValue = defineModel<string>({ default: '' });
withDefaults(
  defineProps<{
    fieldId: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    hint?: string;
  }>(),
  {
    label: '',
    placeholder: '',
    required: false,
    disabled: false,
    invalid: false,
    hint: '',
  },
);

const input = ref<HTMLInputElement | null>(null);
const revealed = ref(false);
const hasFocus = ref(false);

function onInput(e: Event): void {
  modelValue.value = (e.target as HTMLInputElement).value;
}

defineExpose({ focus: () => input.value?.focus() });
</script>

<style scoped>
.desk-password-control {
  position: relative;
  display: flex;
  align-items: center;
}
.desk-password-control input {
  padding-right: 48px;
}
.desk-pw-toggle {
  position: absolute;
  right: 6px;
  background: transparent;
  border: none;
  font-size: 11px;
  color: var(--desk-muted);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 3px;
}
.desk-pw-toggle:hover {
  background: rgba(0, 0, 0, 0.05);
}
</style>
