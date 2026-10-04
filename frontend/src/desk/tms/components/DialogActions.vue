<template>
  <div class="desk-dialog-actions">
    <span v-if="hint" class="desk-dialog-hint">{{ hint }}</span>
    <button type="button" class="is-primary" :disabled="saving || readonly" @click="emit('save')">
      {{ saving ? 'Saving…' : saveLabel }} <small>{{ saveKey }}</small>
    </button>
    <button type="button" @click="emit('cancel')">Cancel <small>Esc</small></button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { deskKeyLabel } from '../ui';

withDefaults(defineProps<{ saving?: boolean; readonly?: boolean; saveLabel?: string; hint?: string }>(), {
  saving: false,
  readonly: false,
  saveLabel: 'Save',
  hint: '',
});
const emit = defineEmits<{ save: []; cancel: [] }>();
const saveKey = computed(() => deskKeyLabel('action-form-save'));
</script>
