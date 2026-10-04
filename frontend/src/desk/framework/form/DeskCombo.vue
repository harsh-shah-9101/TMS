<template>
  <div class="desk-combo" :class="{ 'desk-combo-grid': variant === 'grid' }" @focusout="onFocusOut">
    <input
      ref="box"
      v-bind="inputAttrs"
      :class="{ 'input-box': variant === 'grid' }"
      :value="query"
      autocomplete="off"
      @focus="onFocus"
      @input="onType"
      @keydown="onKey"
    />
    <DeskMark kind="select" @press="onMark" />
    <div
      v-if="open && filtered.length"
      class="desk-suggest"
      :style="{ top: `${top}px`, left: `${left}px`, minWidth: `${width}px` }"
      @mousedown.prevent="holdList"
    >
      <div
        v-for="(option, index) in filtered"
        :key="option.value"
        class="hit"
        :class="{ active: index === active }"
        @mousedown.prevent="choose(option)"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import type { DeskSelectOption } from '../grid/types';
import { claimDeskKey, isDeskNavKey } from '../focus/useDeskFocus';
import DeskMark from './DeskMark.vue';

const model = defineModel<string>({ required: true });
const props = withDefaults(
  defineProps<{
    options: DeskSelectOption[];
    fieldId?: string;
    variant?: 'form' | 'grid';
    selectAll?: boolean;
    /** Marks this field as the one to focus when the page or dialog opens. */
    initial?: boolean;
  }>(),
  { variant: 'form', selectAll: true },
);
const emit = defineEmits<{ advance: [via: 'enter' | 'tab']; back: []; cancel: [] }>();

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
const query = ref('');
const open = ref(false);
const active = ref(0);
const picking = ref(false);
/**
 * True after Enter accepts the highlighted option during this visit.
 * The next Enter then moves on. Focus and blur clear it, so coming back opens the list again.
 */
const accepted = ref(false);
/** Pointer is on the list, so that press is not a blur that should hide the options. */
let holdingList = false;
const top = ref(0);
const left = ref(0);
const width = ref(160);

function strictSelect(): boolean {
  return props.selectAll !== false;
}

const filtered = computed(() => {
  const needle = picking.value ? query.value.trim().toLowerCase() : '';
  if (!needle) return props.options;
  return props.options.filter(
    (option) => option.label.toLowerCase().includes(needle) || option.value.toLowerCase().includes(needle),
  );
});

function committedLabel(): string {
  const match = props.options.find((option) => option.value === model.value || option.label === model.value);
  return match?.label ?? model.value;
}

function place(): void {
  const rect = box.value?.getBoundingClientRect();
  if (!rect) return;
  top.value = rect.bottom;
  left.value = rect.left;
  width.value = Math.max(rect.width, 160);
}

function showCurrent(): void {
  query.value = committedLabel();
  picking.value = false;
  open.value = true;
  const index = props.options.findIndex((option) => option.value === model.value || option.label === model.value);
  active.value = index >= 0 ? index : 0;
  place();
}

function onMark(): void {
  const wasOpen = open.value;
  box.value?.focus();
  if (wasOpen) hideList();
  else showCurrent();
}

function onFocus(): void {
  accepted.value = false;
  if (!strictSelect() && model.value && !props.options.some((option) => option.value === model.value)) {
    query.value = model.value;
    picking.value = true;
    open.value = true;
    active.value = 0;
    place();
    return;
  }
  showCurrent();
  if (strictSelect()) box.value?.select();
}

function hideList(): void {
  open.value = false;
  picking.value = false;
  accepted.value = false;
  query.value = committedLabel();
}

function holdList(): void {
  holdingList = true;
  window.addEventListener('mouseup', releaseList, { once: true });
}

function releaseList(): void {
  holdingList = false;
}

function onFocusOut(event: FocusEvent): void {
  if (holdingList) return;
  const next = event.relatedTarget;
  if (next instanceof Node && event.currentTarget instanceof Node && event.currentTarget.contains(next)) return;
  hideList();
}

function onType(event: Event): void {
  const input = event.target as HTMLInputElement;
  const typed = input.value;
  accepted.value = false;
  if (strictSelect()) {
    const needle = typed.trim().toLowerCase();
    const matches = needle
      ? props.options.filter(
          (option) => option.label.toLowerCase().includes(needle) || option.value.toLowerCase().includes(needle),
        )
      : props.options;
    if (needle && matches.length === 0) {
      input.value = query.value;
      return;
    }
  }
  query.value = typed;
  picking.value = query.value !== committedLabel();
  open.value = true;
  active.value = 0;
  place();
}

function choose(option: DeskSelectOption): void {
  model.value = option.value;
  query.value = option.label;
  picking.value = false;
  open.value = false;
  accepted.value = true;
  void nextTick(() => {
    if (document.activeElement === box.value) box.value?.select();
  });
}

function onKey(event: KeyboardEvent): void {
  if (isDeskNavKey(event)) return;
  claimDeskKey(event);
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    accepted.value = false;
    open.value = true;
    place();
    const count = filtered.value.length;
    if (count === 0) return;
    const delta = event.key === 'ArrowDown' ? 1 : -1;
    active.value = (active.value + delta + count) % count;
    return;
  }
  if (event.key === 'Escape') {
    event.preventDefault();
    if (open.value) {
      query.value = committedLabel();
      picking.value = false;
      open.value = false;
      return;
    }
    emit('cancel');
    return;
  }
  if (event.key === 'Tab') {
    event.preventDefault();
    if (open.value && (picking.value || strictSelect())) {
      const highlighted = filtered.value[active.value];
      if (highlighted) choose(highlighted);
      else query.value = committedLabel();
    }
    open.value = false;
    accepted.value = false;
    if (event.shiftKey) emit('back');
    else emit('advance', 'tab');
    return;
  }
  if (event.key !== 'Enter' || event.shiftKey) return;
  event.preventDefault();
  if (open.value) {
    const highlighted = filtered.value[active.value];
    if (highlighted) {
      choose(highlighted);
      // A grid cell confirms and moves on this Enter. A form field waits for one more.
      if (props.variant === 'grid') emit('advance', 'enter');
    } else showCurrent();
    return;
  }
  if (accepted.value) {
    emit('advance', 'enter');
    return;
  }
  showCurrent();
}

watch(
  () => [model.value, props.options] as const,
  () => {
    if (open.value || picking.value) return;
    query.value = committedLabel();
  },
);

onMounted(() => {
  query.value = committedLabel();
  if (props.variant !== 'grid') return;
  box.value?.focus();
  onFocus();
});
</script>
