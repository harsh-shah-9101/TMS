<template>
  <DeskShell>
    <template #header>
      <DeskMenuBar ref="menuBar" :items="menuItems" :armed="menuArmed" :current-path="route.path" @go="go">
        <button type="button" class="header-action-btn" title="Command Palette (Ctrl+K)" @click="paletteOpen = true">
          <span class="btn-icon">🔍</span>
          <span class="btn-text">Search</span>
          <kbd>Ctrl+K</kbd>
        </button>
        <button type="button" class="header-action-btn" title="Keyboard Shortcuts (Ctrl+Alt+K)" @click="keysOpen = true">
          Keys
        </button>
        <button type="button" class="header-action-btn logout-btn" title="Sign out" @click="logout">
          Sign out
        </button>
      </DeskMenuBar>
    </template>

    <template #bar>
      <DeskFKeyBar />
    </template>

    <router-view #default="{ Component }">
      <DeskPageLayer :key="route.path">
        <component :is="Component" />
      </DeskPageLayer>
    </router-view>

    <template #status>
      <TmsStatusBar />
    </template>

    <template #overlay>
      <DeskKeysDialog v-model:open="keysOpen" />
      <DeskJumpPeek />

      <!-- Global Command Palette (Ctrl+K) -->
      <div v-if="paletteOpen" class="palette-backdrop" @click.self="paletteOpen = false">
        <div class="palette-modal">
          <div class="palette-input-wrap">
            <span class="palette-search-icon">🔍</span>
            <input
              ref="paletteInput"
              v-model="paletteQuery"
              type="text"
              class="palette-input"
              placeholder="Jump to any screen or action..."
              @keydown.down.prevent="paletteNext"
              @keydown.up.prevent="palettePrev"
              @keydown.enter.prevent="paletteSelect"
              @keydown.esc.prevent="paletteOpen = false"
            />
            <kbd class="palette-esc-hint">Esc</kbd>
          </div>
          <div class="palette-results">
            <div
              v-for="(item, idx) in filteredNavs"
              :key="item.route"
              :class="['palette-item', { 'is-active': idx === paletteIndex }]"
              @click="selectNav(item.route)"
              @mouseenter="paletteIndex = idx"
            >
              <span class="palette-item-label">{{ item.label }}</span>
              <span class="palette-item-route">{{ item.route }}</span>
            </div>
            <div v-if="!filteredNavs.length" class="palette-empty">
              No matching screens found
            </div>
          </div>
        </div>
      </div>
    </template>
  </DeskShell>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  DeskFKeyBar,
  DeskJumpPeek,
  DeskKeysDialog,
  DeskMenuBar,
  DeskPageLayer,
  DeskShell,
  deskMenuArmed as menuArmed,
  installDeskKeys,
  provideDeskLayer,
  type DeskHandlerInput,
} from '@/desk/tms/ui';
import TmsStatusBar from '@/desk/tms/layout/TmsStatusBar.vue';
import { NAV_TARGETS, TMS_MENU, visibleMenu } from '@/desk/tms/menu/menu';
import { setupTmsDesk } from '@/desk/tms/setup';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const keysOpen = ref(false);
const paletteOpen = ref(false);
const paletteQuery = ref('');
const paletteIndex = ref(0);
const paletteInput = ref<HTMLInputElement | null>(null);
const menuBar = ref<{ letter: (key: string) => boolean | 'stay' } | null>(null);

const menuItems = computed(() => visibleMenu(TMS_MENU, auth.can));

const navList = computed(() =>
  Object.values(NAV_TARGETS).filter((target) => auth.can(target.permission)),
);

const filteredNavs = computed(() => {
  const q = paletteQuery.value.trim().toLowerCase();
  if (!q) return navList.value;
  return navList.value.filter(
    (item) => item.label.toLowerCase().includes(q) || item.route.toLowerCase().includes(q),
  );
});

watch(paletteOpen, (isOpen) => {
  if (isOpen) {
    paletteQuery.value = '';
    paletteIndex.value = 0;
    nextTick(() => paletteInput.value?.focus());
  }
});

function paletteNext(): void {
  if (paletteIndex.value < filteredNavs.value.length - 1) paletteIndex.value++;
}

function palettePrev(): void {
  if (paletteIndex.value > 0) paletteIndex.value--;
}

function paletteSelect(): void {
  const chosen = filteredNavs.value[paletteIndex.value];
  if (chosen) selectNav(chosen.route);
}

function selectNav(path: string): void {
  paletteOpen.value = false;
  go(path);
}

function go(path: string): void {
  void router.push(path);
}

function logout(): void {
  auth.logout();
  void router.push('/auth/login');
}

const navHandlers: Record<string, DeskHandlerInput> = Object.fromEntries(
  Object.entries(NAV_TARGETS).map(([id, target]) => [
    id,
    () => {
      if (auth.can(target.permission)) go(target.route);
    },
  ]),
);

provideDeskLayer({
  root: ref(null),
  handlers: {
    ...navHandlers,
    'desk-keys': {
      always: true,
      run: () => {
        keysOpen.value = true;
      },
    },
  },
  disableInitialFocus: () => true,
});

setupTmsDesk(auth.user?.id);

// Global shortcut handler for Ctrl+K
function onGlobalKeyDown(e: KeyboardEvent): void {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && !e.altKey) {
    e.preventDefault();
    paletteOpen.value = !paletteOpen.value;
  }
}

let uninstall: (() => void) | null = null;
onMounted(() => {
  uninstall = installDeskKeys({ menuLetter: (letter) => menuBar.value?.letter(letter) ?? false });
  window.addEventListener('keydown', onGlobalKeyDown);
});

onUnmounted(() => {
  uninstall?.();
  window.removeEventListener('keydown', onGlobalKeyDown);
});
</script>

<style scoped>
.header-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 11.5px;
  color: var(--desk-text);
  cursor: pointer;
  margin-left: 6px;
  transition: all 0.15s ease;
}

.header-action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.header-action-btn kbd {
  font-family: var(--desk-font-mono);
  font-size: 10px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 3px;
  padding: 0 4px;
}

.logout-btn:hover {
  color: var(--desk-danger);
  border-color: var(--desk-danger);
}

/* Command Palette Overlay */
.palette-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 12vh;
}

.palette-modal {
  width: min(560px, calc(100vw - 32px));
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #cbd5e1;
  overflow: hidden;
  animation: paletteIn 0.15s ease-out;
}

@keyframes paletteIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.palette-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.palette-search-icon {
  font-size: 15px;
  color: #64748b;
}

.palette-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #0f172a;
}

.palette-esc-hint {
  font-family: var(--desk-font-mono);
  font-size: 11px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 3px;
  padding: 2px 6px;
  color: #64748b;
}

.palette-results {
  max-height: 320px;
  overflow-y: auto;
  padding: 6px;
}

.palette-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  color: #1e293b;
  transition: background 0.1s ease;
}

.palette-item.is-active {
  background: var(--desk-primary);
  color: #ffffff;
}

.palette-item-route {
  font-family: var(--desk-font-mono);
  font-size: 11px;
  opacity: 0.65;
}

.palette-empty {
  padding: 24px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}
</style>
