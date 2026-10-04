<template>
  <DeskDialog v-model:open="open">
    <div class="tms-dialog" style="max-width: 420px; padding: 20px;">
      <h2 class="tms-dialog-title">{{ title }}</h2>
      <p style="font-size: var(--desk-font); color: var(--desk-text); margin: 0 0 16px;">{{ message }}</p>
      <div class="desk-dialog-actions">
        <button type="button" @click="open = false">Cancel</button>
        <button type="button" class="is-primary" :disabled="loading" @click="confirm">
          {{ loading ? 'Deleting…' : confirmLabel }}
        </button>
      </div>
    </div>
  </DeskDialog>
</template>

<script setup lang="ts">
import { DeskDialog } from '../ui';

const open = defineModel<boolean>('open', { required: true });
withDefaults(
  defineProps<{ title: string; message: string; confirmLabel?: string; loading?: boolean }>(),
  { confirmLabel: 'Confirm', loading: false },
);
const emit = defineEmits<{ confirm: [] }>();

function confirm(): void {
  emit('confirm');
}
</script>
