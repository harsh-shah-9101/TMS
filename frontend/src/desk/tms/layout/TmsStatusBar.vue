<template>
  <div class="desk-status">
    <span class="status-item org-name">
      <span class="status-dot"></span>
      {{ auth.user?.organization?.name ?? 'TMS Fleet Console' }}
    </span>
    <span class="status-item branch-name">
      {{ auth.user?.branch?.name ?? 'HQ Branch' }}
    </span>
    <span class="status-item user-info">
      {{ auth.user?.name ?? 'User' }}
      <span class="role-badge">{{ auth.user?.role ?? 'Admin' }}</span>
    </span>
    <span class="status-item end-keys">
      <kbd>Alt</kbd> Menu &nbsp;·&nbsp;
      <kbd>Ctrl+K</kbd> Find &nbsp;·&nbsp;
      <kbd>Ctrl+Alt+K</kbd> Keybindings
    </span>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
</script>

<style scoped>
.desk-status {
  display: flex;
  gap: 16px;
  height: 28px;
  align-items: center;
  padding: 0 14px;
  background: #f1f5f9;
  border-top: 1px solid var(--desk-grid-line);
  font-size: 11px;
  color: #475569;
  user-select: none;
}

.status-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
}

.org-name {
  font-weight: 650;
  color: #1e293b;
}

.role-badge {
  background: #e2e8f0;
  color: #334155;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 3px;
  margin-left: 4px;
  font-weight: 600;
  text-transform: uppercase;
}

.end-keys {
  margin-left: auto;
  font-family: var(--desk-font-mono);
  color: #64748b;
}

kbd {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 3px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  font-family: var(--desk-font-mono);
  font-size: 10px;
  padding: 1px 4px;
  color: #1e293b;
}
</style>
