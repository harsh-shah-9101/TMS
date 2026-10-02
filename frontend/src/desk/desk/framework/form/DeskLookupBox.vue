<template>
  <div class="desk-lookup" :class="{ 'desk-combo-grid': variant === 'grid' }">
    <input
      ref="box"
      v-bind="inputAttrs"
      :class="{ 'input-box': variant === 'grid' }"
      :value="draft"
      autocomplete="off"
      @focus="onFocus"
      @input="onType"
      @blur="onBlur"
      @keydown="onKey"
    />
    <DeskMark kind="search" @press="onMark" />
    <div
      v-if="open"
      ref="suggest"
      class="desk-suggest"
      :style="{ top: `${top}px`, left: `${left}px`, minWidth: `${width}px` }"
    >
      <div v-if="loading" class="hit">Searching…</div>
      <div v-else-if="hits.length === 0" class="hit">No matches</div>
      <template v-else>
        <div v-if="lookup.columns.length > 1" class="hit head">
          <span v-for="column in lookup.columns" :key="column.id">{{ column.header }}</span>
        </div>
        <div
          v-for="(hit, index) in hits"
          :key="index"
          class="hit"
          :class="{ active: index === active }"
          @mousedown.prevent="choose(hit)"
        >
          <span v-for="column in lookup.columns" :key="column.id">{{ lookupField(hit, column.field) }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { deskHost } from '../host';
import type { DeskLookupConfig } from '../grid/types';
import { isDeskNavKey } from '../focus/useDeskFocus';
import { lookupField } from './lookupField';
import DeskMark from './DeskMark.vue';

const text = defineModel<string>({ required: true });
const picked = defineModel<Record<string, unknown> | null>('picked', { default: null });
const props = withDefaults(
  defineProps<{
    lookup: DeskLookupConfig;
    fieldId?: string;
    variant?: 'form' | 'grid';
    selectAll?: boolean;
    /** Marks this field as the one to focus when the page or dialog opens. */
    initial?: boolean;
  }>(),
  { variant: 'form', selectAll: true },
);
const emit = defineEmits<{ advance: [via: 'enter' | 'tab']; back: []; pick: [Record<string, unknown>]; cancel: [] }>();

const inputAttrs = computed(() => {
  const attrs: Record<string, string> = {};
  if (props.fieldId) {
    attrs.id = props.fieldId;
    attrs['data-desk-field'] = props.fieldId;
  }
  if (props.initial) attrs['data-desk-initial'] = '';
  return attrs;
});

const box = ref<HTMLInputElement | null>(null);
const suggest = ref<HTMLElement | null>(null);
const draft = ref(text.value);
const hits = ref<Record<string, unknown>[]>([]);
const loading = ref(false);
const open = ref(false);
const active = ref(0);
const browsing = ref(false);
const top = ref(0);
const left = ref(0);
const width = ref(280);
let timer: ReturnType<typeof setTimeout> | null = null;
let generation = 0;
let blurTimer: ReturnType<typeof setTimeout> | null = null;

const least = (): number => props.lookup.minChars ?? 1;

/** The open list should rest on the value already in the box, not the first row. */
function indexOfCurrent(rows: Record<string, unknown>[]): number {
  const current = text.value.trim();
  if (!current) return 0;
  const index = rows.findIndex((row) => {
    if (lookupField(row, props.lookup.labelKey) === current) return true;
    return props.lookup.labelKey !== 'code' && lookupField(row, 'code') === current;
  });
  return index >= 0 ? index : 0;
}

function showActive(): void {
  void nextTick(() => {
    suggest.value?.querySelector('.hit.active')?.scrollIntoView({ block: 'nearest' });
  });
}

function place(): void {
  const rect = box.value?.getBoundingClientRect();
  if (!rect) return;
  top.value = rect.bottom;
  left.value = rect.left;
  width.value = Math.max(rect.width, 280);
}

watch(text, (value) => {
  if (browsing.value) return;
  draft.value = value;
});

function schedule(query: string): void {
  if (timer) clearTimeout(timer);
  const trimmed = query.trim();
  if (trimmed.length < least()) {
    if (least() === 0) {
      timer = setTimeout(() => {
        void runSearch('');
      }, 200);
      return;
    }
    hits.value = [];
    open.value = false;
    return;
  }
  timer = setTimeout(() => {
    void runSearch(trimmed);
  }, 200);
}

function onMark(): void {
  const wasOpen = open.value;
  const hadFocus = document.activeElement === box.value;
  box.value?.focus();
  if (wasOpen) {
    open.value = false;
    browsing.value = false;
    draft.value = text.value;
    return;
  }
  if (!hadFocus && least() === 0) return;
  browsing.value = true;
  const query = draft.value.trim();
  void runSearch(query.length >= least() ? query : '');
}

function onFocus(): void {
  if (least() > 0) return;
  if (props.variant !== 'grid') box.value?.select();
  void runSearch('');
}

function onType(event: Event): void {
  draft.value = (event.target as HTMLInputElement).value;
  browsing.value = true;
  // A grid cell keeps what was typed when focus leaves, the same as Enter.
  if (props.variant === 'grid') {
    text.value = draft.value;
    picked.value = null;
  }
  schedule(draft.value);
}

function onBlur(): void {
  if (blurTimer) clearTimeout(blurTimer);
  blurTimer = setTimeout(() => {
    if (document.activeElement === box.value) return;
    open.value = false;
    browsing.value = false;
    if (props.variant !== 'grid') draft.value = text.value;
  }, 150);
}

async function runSearch(query: string): Promise<void> {
  const ticket = ++generation;
  loading.value = true;
  open.value = true;
  place();
  try {
    const search = deskHost().searchLookup;
    const rows = search ? await search(props.lookup, query) : [];
    if (ticket !== generation) return;
    hits.value = rows;
    const typed = query.trim();
    active.value = typed === '' || typed === text.value.trim() ? indexOfCurrent(rows) : 0;
    showActive();
  } catch {
    if (ticket !== generation) return;
    hits.value = [];
  } finally {
    if (ticket === generation) loading.value = false;
  }
}

function choose(hit: Record<string, unknown>): void {
  if (blurTimer) clearTimeout(blurTimer);
  const label = lookupField(hit, props.lookup.labelKey);
  browsing.value = false;
  draft.value = label;
  text.value = label;
  picked.value = hit;
  open.value = false;
  emit('pick', hit);
  void nextTick(() => box.value?.select());
}

function onKey(event: KeyboardEvent): void {
  if (isDeskNavKey(event)) return;
  event.stopPropagation();
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    if (!open.value) {
      browsing.value = true;
      const query = draft.value.trim();
      void runSearch(query.length >= least() ? query : '');
      return;
    }
    const count = hits.value.length;
    if (count === 0) return;
    const delta = event.key === 'ArrowDown' ? 1 : -1;
    active.value = (active.value + delta + count) % count;
    browsing.value = true;
    return;
  }
  if (event.key === 'Escape') {
    event.preventDefault();
    if (open.value) {
      open.value = false;
      browsing.value = false;
      draft.value = text.value;
      return;
    }
    emit('cancel');
    return;
  }
  if (event.key === 'Tab') {
    event.preventDefault();
    const highlighted = open.value && !loading.value ? hits.value[active.value] : undefined;
    if (highlighted && lookupField(highlighted, props.lookup.labelKey) !== text.value) choose(highlighted);
    open.value = false;
    browsing.value = false;
    if (event.shiftKey) emit('back');
    else emit('advance', 'tab');
    return;
  }
  if (event.key !== 'Enter' || event.shiftKey) return;
  event.preventDefault();
  if (open.value) {
    if (loading.value) return;
    const highlighted = hits.value[active.value];
    if (!highlighted) {
      open.value = false;
      browsing.value = false;
      draft.value = text.value;
      return;
    }
    const label = lookupField(highlighted, props.lookup.labelKey);
    if (label === text.value) {
      open.value = false;
      browsing.value = false;
      draft.value = text.value;
      emit('advance', 'enter');
      return;
    }
    choose(highlighted);
    return;
  }
  emit('advance', 'enter');
}

onMounted(() => {
  if (props.variant !== 'grid') return;
  box.value?.focus();
  if (props.selectAll !== false) box.value?.select();
  else {
    const length = box.value?.value.length ?? 0;
    box.value?.setSelectionRange(length, length);
  }
});

onUnmounted(() => {
  if (blurTimer) clearTimeout(blurTimer);
});
</script>
