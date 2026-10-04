<template>
  <div class="desk-fkey">
    <span class="label">Toolbar</span>
  </div>
</template>

<style scoped>
.desk-fkey {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 4px 8px;
  background: var(--desk-header-bg, #e9ecef);
  border-bottom: 1px solid var(--desk-grid-line, lightgray);
  min-height: 33px;
}
.label {
  font-size: 0.88rem;
  color: var(--desk-muted, dimgray);
}
</style>
