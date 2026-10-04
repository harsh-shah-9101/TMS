<template>
  <DeskDialog v-model:open="open" :initial-focus="initialFocus" @accept="emit('save')">
    <div :class="['tms-dialog', size === 'wide' ? 'is-wide' : size === 'full' ? 'is-full' : '']">
      <div class="tms-dialog-header">
        <h2 class="tms-dialog-title">{{ title }}</h2>
        <button type="button" class="tms-dialog-close-btn" title="Close (Escape)" @click="open = false">✕</button>
      </div>
      <DeskForm :issues="issues" :server-issues="serverIssues" @save="emit('save')">
        <p v-if="loading" class="tms-dialog-loading">Loading…</p>
        <div v-else class="tms-dialog-scroll-body">
          <slot />
        </div>
        <div class="desk-dialog-actions">
          <span v-if="hint" class="desk-dialog-hint">{{ hint }}</span>
          <button type="button" @click="open = false">Cancel <small>Ctrl+X</small></button>
          <button type="button" class="is-primary" :disabled="saving" @click="emit('save')">
            {{ saving ? 'Saving…' : 'Save' }} <small>F12</small>
          </button>
        </div>
      </DeskForm>
    </div>
  </DeskDialog>
</template>

<script setup lang="ts">
import { DeskDialog, DeskForm } from '../ui';
import type { DeskIssue } from '../ui';

const open = defineModel<boolean>('open', { required: true });
withDefaults(
  defineProps<{
    title: string;
    size?: 'normal' | 'wide' | 'full';
    issues?: readonly DeskIssue[];
    serverIssues?: readonly DeskIssue[];
    saving?: boolean;
    loading?: boolean;
    hint?: string;
    initialFocus?: string;
  }>(),
  { size: 'normal', issues: () => [], serverIssues: () => [], saving: false, loading: false, hint: '' },
);
const emit = defineEmits<{ save: [] }>();
</script>
