<template>
  <div ref="root" class="desk-page-layer" data-desk-layer>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { provideDeskLayer } from '../keys/useDeskLayer';

/** Every routed desk page gets its own key and focus layer, and initial focus on open. */
const root = ref<HTMLElement | null>(null);
provideDeskLayer({ root });
</script>

<style scoped>
.desk-page-layer {
  display: contents;
}
</style>
