<template>
  <DeskDialog
    v-model:open="open"
    v-bind="initialFocus === undefined ? {} : { initialFocus }"
    :disable-initial-focus="disableInitialFocus"
    :disable-spatial-move="disableSpatialMove"
    :keys="keys"
    @accept="emit('accept')"
    @close="emit('close')"
  >
    <div class="tms-dialog" :class="`is-${size}`">
      <div v-if="title" class="tms-dialog-header">
        <h3 class="tms-dialog-title">{{ title }}</h3>
        <button type="button" class="tms-dialog-close-btn" title="Close (Escape)" @click="open = false">✕</button>
      </div>
      <div class="tms-dialog-scroll-body">
        <slot />
      </div>
    </div>
  </DeskDialog>
</template>

<script setup lang="ts">
import DeskDialog from '../../framework/form/DeskDialog.vue';
import type { DeskHandlerInput } from '../../framework/keys/layers';

const open = defineModel<boolean>('open', { required: true });
withDefaults(
  defineProps<{
    title?: string;
    /** `wide` fits a two-column form, `full` a grid. */
    size?: 'normal' | 'wide' | 'full';
    initialFocus?: string;
    disableInitialFocus?: boolean;
    disableSpatialMove?: boolean;
    keys?: Record<string, DeskHandlerInput>;
  }>(),
  {
    title: '',
    size: 'normal',
    disableInitialFocus: false,
    disableSpatialMove: false,
    keys: () => ({}),
  },
);
const emit = defineEmits<{ accept: []; close: [] }>();
</script>
