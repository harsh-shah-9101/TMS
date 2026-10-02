<template>
  <q-layout view="hHh lpR fFf" class="desk-shell">
    <q-header class="desk-top" elevated>
      <slot name="header" />
    </q-header>
    <q-page-container>
      <slot name="bar" />
      <div class="desk-body">
        <slot />
      </div>
      <slot name="status" />
    </q-page-container>
    <slot name="overlay" />
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import '../theme/desk-tokens.css';
import '../theme/desk-grid.css';
import { focusDeskToward, resolveDeskJump } from '../focus/useDeskFocus';
import { provideDeskLayer } from '../keys/useDeskLayer';

// The shell owns the field-move and section-jump keys, so any host that mounts it gets them.
// A page turns Ctrl+Arrow off with `disable-spatial-move`, a widget with `data-desk-no-move`.
provideDeskLayer({
  root: ref(null),
  handlers: {
    'desk-jump': { always: true, run: () => resolveDeskJump()?.go() },
    'desk-move-up': { always: true, run: () => focusDeskToward('up') },
    'desk-move-down': { always: true, run: () => focusDeskToward('down') },
    'desk-move-left': { always: true, run: () => focusDeskToward('left') },
    'desk-move-right': { always: true, run: () => focusDeskToward('right') },
  },
  disableInitialFocus: () => true,
});
</script>

<style scoped>
.desk-shell {
  background: var(--desk-row-bg, #fff);
  color: var(--desk-text, #212529);
}
.desk-top {
  background: var(--desk-header-bg, #e9ecef);
  color: var(--desk-text, #212529);
  overflow: visible;
}
.desk-body {
  height: calc(100vh - 32px - 33px - 25px);
  min-height: 0;
  overflow: auto;
}
</style>
