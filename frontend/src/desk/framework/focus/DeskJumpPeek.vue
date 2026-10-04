<template>
  <div v-if="peek" class="desk-jump-peek" :data-label="peek.label" :style="style" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { deskJumpPeek } from '../keys/dispatcher';

const peek = deskJumpPeek;
const style = computed(() => {
  const box = peek.value;
  if (!box) return undefined;
  return { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` };
});
</script>

<style scoped>
.desk-jump-peek {
  position: fixed;
  z-index: 80;
  pointer-events: none;
  box-shadow: inset 0 0 0 2px var(--desk-cursor, rgb(108, 143, 108));
}
.desk-jump-peek::before {
  content: attr(data-label);
  position: absolute;
  left: 0;
  top: -14px;
  padding: 0 4px;
  background: var(--desk-cursor, rgb(108, 143, 108));
  color: #fff;
  font-size: 11px;
  line-height: 14px;
  white-space: nowrap;
}
</style>
