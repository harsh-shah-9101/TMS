<template>
  <div ref="root" class="desk-menu" :class="{ armed }" @focusin="onMenuFocus" @focusout="onMenuBlur">
    <div v-for="(item, index) in nodes" :key="item.label" class="desk-menu-item">
      <button
        :ref="(el) => rememberTop(index, el)"
        type="button"
        :class="{ on: topOn(index) }"
        @click="onTop(item, index)"
      >
        <template v-for="(part, partIndex) in splitAccessLabel(item.label, item.letter)" :key="partIndex">
          <u v-if="part.mark">{{ part.text }}</u>
          <template v-else>{{ part.text }}</template>
        </template>
      </button>
      <DeskMenuFlyout
        v-if="item.children?.length && openPath[0] === index"
        :items="item.children"
        :path="openPath.slice(1)"
        @path="(next) => (openPath = [index, ...next])"
        @pick="pick"
      />
    </div>
    <span class="spacer" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { disarmDeskMenu } from '../keys/dispatcher';
import {
  applyDeskMenuKey,
  applyDeskMenuLetter,
  deskMenuTopIndex,
  moveDeskMenuTop,
  splitAccessLabel,
  type DeskMenuNavKey,
  type DeskMenuNode,
} from '../menu/deskMenu';
import DeskMenuFlyout from './DeskMenuFlyout.vue';

const props = defineProps<{
  items: DeskMenuNode[];
  armed: boolean;
  currentPath: string;
}>();

const emit = defineEmits<{
  go: [path: string];
}>();

const root = ref<HTMLElement | null>(null);
const openPath = ref<number[]>([]);
/** Highlighted top menu while Alt is held as a menu focus, before or without a dropdown. */
const menuFocus = ref(-1);
const topButtons: HTMLButtonElement[] = [];
/** Page element that had focus before Alt moved it onto the menu bar. */
let returnFocus: HTMLElement | null = null;
const nodes = computed(() => props.items);

watch(
  () => props.armed,
  (isArmed) => {
    if (isArmed) {
      if (openPath.value.length > 0) return;
      menuFocus.value = deskMenuTopIndex(nodes.value, props.currentPath);
      focusTop(menuFocus.value);
      return;
    }
    // An arrow used to turn the Alt tap off and wipe the menu. An open dropdown stays.
    if (openPath.value.length > 0) return;
    menuFocus.value = -1;
  },
);

function rememberTop(index: number, el: unknown): void {
  if (el instanceof HTMLButtonElement) topButtons[index] = el;
}

function focusTop(index: number): void {
  const button = topButtons[index];
  if (!button) return;
  const active = document.activeElement;
  if (active instanceof HTMLElement && !root.value?.contains(active)) returnFocus = active;
  button.focus();
}

function restoreFocus(): void {
  const back = returnFocus;
  returnFocus = null;
  if (back?.isConnected) back.focus();
}

function closeMenu(restore: boolean): void {
  openPath.value = [];
  menuFocus.value = -1;
  disarmDeskMenu();
  if (restore) restoreFocus();
}

function isCurrent(item: DeskMenuNode | undefined): boolean {
  if (!item?.route || !props.currentPath) return false;
  return props.currentPath === item.route || props.currentPath.startsWith(`${item.route}/`);
}

function topOn(index: number): boolean {
  if (openPath.value.length > 0) return openPath.value[0] === index;
  if (menuFocus.value >= 0) return menuFocus.value === index;
  return isCurrent(nodes.value[index]);
}

function onTop(item: DeskMenuNode, index: number): void {
  menuFocus.value = index;
  if (item.route) {
    pick(item.route);
    return;
  }
  openPath.value = openPath.value[0] === index ? [] : [index];
  focusTop(index);
}

function pick(path: string): void {
  closeMenu(true);
  emit('go', path);
}

function onDocClick(event: MouseEvent): void {
  if (root.value?.contains(event.target as Node)) return;
  if (openPath.value.length === 0 && menuFocus.value < 0) return;
  closeMenu(false);
}

function onMenuFocus(event: FocusEvent): void {
  const prev = event.relatedTarget;
  if (prev instanceof HTMLElement && root.value && !root.value.contains(prev)) returnFocus = prev;
}

function onMenuBlur(event: FocusEvent): void {
  const next = event.relatedTarget;
  if (next instanceof Node && root.value?.contains(next)) return;
  if (openPath.value.length === 0 && menuFocus.value < 0) return;
  returnFocus = null;
  closeMenu(false);
}

function takeKey(event: KeyboardEvent): void {
  event.preventDefault();
  event.stopImmediatePropagation();
}

function openFocusedTop(): void {
  const index = menuFocus.value;
  const item = nodes.value[index];
  if (!item) return;
  if (item.children?.length) {
    openPath.value = [index];
    focusTop(index);
    return;
  }
  if (item.route) pick(item.route);
}

function applyNav(key: DeskMenuNavKey): void {
  const result = applyDeskMenuKey(nodes.value, openPath.value, key);
  if (!result) return;
  openPath.value = result.openPath;
  const top = result.openPath[0];
  if (top !== undefined) {
    menuFocus.value = top;
    focusTop(top);
  }
  if (result.navigate) pick(result.navigate);
}

function onMenuKey(event: KeyboardEvent): void {
  if (event.ctrlKey || event.metaKey || event.isComposing) return;
  if (openPath.value.length === 0 && menuFocus.value < 0) return;
  // If no dropdown is open and Alt+key is pressed for an action key like 'n', don't consume it
  if (openPath.value.length === 0 && event.altKey && ['n', 'c', 's', 'x'].includes(event.key.toLowerCase())) return;
  const key = event.key;
  if (key === 'Escape') {
    takeKey(event);
    closeMenu(true);
    return;
  }
  if (key === 'ArrowLeft' || key === 'ArrowRight') {
    takeKey(event);
    if (openPath.value.length <= 1) {
      const delta = key === 'ArrowRight' ? 1 : -1;
      const current = openPath.value[0] ?? menuFocus.value;
      menuFocus.value = moveDeskMenuTop(nodes.value.length, current, delta);
      openPath.value = openPath.value.length === 1 ? [menuFocus.value] : [];
      focusTop(menuFocus.value);
      return;
    }
    applyNav(key);
    return;
  }
  if (key === 'ArrowDown' || key === 'Enter') {
    takeKey(event);
    if (openPath.value.length === 0) {
      openFocusedTop();
      return;
    }
    applyNav(key);
    return;
  }
  if (key === 'ArrowUp') {
    takeKey(event);
    if (openPath.value.length === 0) return;
    applyNav(key);
    return;
  }
  if (key.length === 1 && /^[a-z0-9]$/i.test(key)) {
    takeKey(event);
    letter(key);
  }
}

function letter(key: string): boolean | 'stay' {
  const result = applyDeskMenuLetter(nodes.value, openPath.value, key);
  openPath.value = result.openPath;
  const top = result.openPath[0];
  if (top !== undefined) {
    menuFocus.value = top;
    focusTop(top);
  }
  if (result.navigate) {
    pick(result.navigate);
    return true;
  }
  return result.stayArmed ? 'stay' : false;
}

onMounted(() => {
  document.addEventListener('click', onDocClick);
  window.addEventListener('keydown', onMenuKey, true);
});
onUnmounted(() => {
  document.removeEventListener('click', onDocClick);
  window.removeEventListener('keydown', onMenuKey, true);
});

defineExpose({ letter });
</script>

<style scoped>
.desk-menu {
  display: flex;
  gap: 2px;
  align-items: center;
  min-height: 32px;
  padding: 0 6px;
  overflow: visible;
}
.desk-menu-item {
  position: relative;
}
.desk-menu u {
  text-decoration: none;
}
.desk-menu.armed u {
  text-decoration: underline;
  font-weight: 600;
}
.desk-menu-item > button {
  height: 26px;
  border: 0;
  background: transparent;
  font-size: 0.88rem;
  cursor: pointer;
  color: inherit;
  padding: 0 8px;
  white-space: nowrap;
}
.desk-menu-item > button.on {
  background: #fff;
  border: 1px solid lightgray;
}
.desk-menu :slotted(button) {
  height: 26px;
  border: 0;
  background: transparent;
  font-size: 0.88rem;
  cursor: pointer;
  color: inherit;
  padding: 0 8px;
}
.spacer {
  flex: 1;
}
</style>
