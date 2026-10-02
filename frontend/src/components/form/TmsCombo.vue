<!--
  TmsCombo.vue — keyboard-first select field
  Styled IDENTICALLY to TmsField / q-input outlined dense.
  Enter(1st) picks, Enter(2nd) advances. Tab picks+advances.
-->
<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

export interface TmsOption { label: string; value: string }

const props = withDefaults(defineProps<{
  fieldId: string
  label: string
  options: TmsOption[]
  required?: boolean
  initial?: boolean
  focusNext: (id: string) => void
  focusPrev: (id: string) => void
}>(), {})

const model = defineModel<string | null>({ required: true })

// ── State ──────────────────────────────────────────────────────────────────────
const inputRef = ref<HTMLInputElement | null>(null)
const query = ref('')
const open = ref(false)
const activeIdx = ref(0)
const accepted = ref(false)
const focused = ref(false)
const touched = ref(false)

// ── Validation ─────────────────────────────────────────────────────────────────
const isEmpty = computed(() => !model.value)
const showError = computed(() => props.required && touched.value && isEmpty.value)
const labelUp = computed(() => focused.value || !!model.value)

// ── Filtered options ───────────────────────────────────────────────────────────
const filtered = computed<TmsOption[]>(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return props.options
  return props.options.filter(o =>
    o.label.toLowerCase().includes(needle) || o.value.toLowerCase().includes(needle)
  )
})

// ── Committed label ────────────────────────────────────────────────────────────
function committedLabel() {
  return props.options.find(o => o.value === model.value)?.label ?? ''
}

// ── Dropdown position ──────────────────────────────────────────────────────────
const dropStyle = ref({ top: '0px', left: '0px', width: '0px' })

function place() {
  const rect = inputRef.value?.closest('.tms-combo')?.getBoundingClientRect()
  if (!rect) return
  dropStyle.value = {
    top: `${rect.bottom + 2}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  }
}

// ── Open / close ───────────────────────────────────────────────────────────────
function openList() {
  query.value = ''
  activeIdx.value = Math.max(0, props.options.findIndex(o => o.value === model.value))
  open.value = true
  nextTick(place)
}

function closeList(restoreLabel = true) {
  open.value = false
  if (restoreLabel) query.value = committedLabel()
  accepted.value = false
}

// ── Choose ─────────────────────────────────────────────────────────────────────
function choose(option: TmsOption) {
  model.value = option.value
  query.value = option.label
  open.value = false
  accepted.value = true
  nextTick(() => inputRef.value?.select())
}

// ── Events ─────────────────────────────────────────────────────────────────────
function onFocus() {
  focused.value = true
  accepted.value = false
  openList()
}

function onBlur() {
  // Delay so mousedown on option fires first
  setTimeout(() => {
    if (document.activeElement !== inputRef.value) {
      focused.value = false
      touched.value = true
      closeList()
    }
  }, 200)
}

function onType(e: Event) {
  const val = (e.target as HTMLInputElement).value
  query.value = val
  accepted.value = false
  activeIdx.value = 0
  open.value = true
  nextTick(place)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    accepted.value = false
    if (!open.value) openList()
    const count = filtered.value.length
    if (!count) return
    activeIdx.value = (activeIdx.value + (e.key === 'ArrowDown' ? 1 : -1) + count) % count
    // Scroll active item into view
    nextTick(() => {
      const list = document.querySelector('.tms-combo-drop')
      const item = list?.querySelectorAll('.tms-combo-opt')[activeIdx.value] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    })
    return
  }

  if (e.key === 'Escape') {
    e.preventDefault()
    closeList()
    return
  }

  if (e.key === 'Tab') {
    e.preventDefault()
    if (open.value) {
      const hit = filtered.value[activeIdx.value]
      if (hit) choose(hit)
      else closeList()
    }
    touched.value = true
    if (e.shiftKey) props.focusPrev(props.fieldId)
    else props.focusNext(props.fieldId)
    return
  }

  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    if (open.value) {
      const hit = filtered.value[activeIdx.value]
      if (hit) choose(hit)
      else closeList()
      return
    }
    if (accepted.value) {
      touched.value = true
      props.focusNext(props.fieldId)
      return
    }
    openList()
  }
}

// Sync display when model changes externally
watch(() => model.value, () => {
  if (!open.value) query.value = committedLabel()
}, { immediate: true })
</script>

<template>
  <div class="tms-combo">
    <!-- Bordered box — identical look to TmsField -->
    <div
      class="tms-combo__wrap"
      :class="{
        'tms-combo__wrap--focused': focused,
        'tms-combo__wrap--error': showError
      }"
    >
      <!-- Floating label -->
      <label
        :for="fieldId"
        class="tms-combo__label"
        :class="{
          'tms-combo__label--up': labelUp,
          'tms-combo__label--focused': focused,
          'tms-combo__label--error': showError,
        }"
      >
        {{ label }}<span v-if="required" class="tms-req"> *</span>
      </label>

      <!-- Input for typing / display -->
      <input
        ref="inputRef"
        :id="fieldId"
        :data-tms-field="fieldId"
        v-bind="initial ? { 'data-tms-initial': '' } : {}"
        class="tms-combo__input"
        :value="open ? query : committedLabel()"
        :placeholder="open ? 'Type to filter…' : ''"
        autocomplete="off"
        @focus="onFocus"
        @blur="onBlur"
        @input="onType"
        @keydown="onKeydown"
      />

      <!-- Arrow icon -->
      <span class="tms-combo__arrow" @mousedown.prevent="open ? closeList() : (inputRef?.focus(), openList())">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </span>
    </div>

    <!-- Error -->
    <div v-if="showError" class="tms-field__msg tms-field__msg--error">{{ label }} is required</div>

    <!-- Dropdown teleported to body -->
    <Teleport to="body">
      <div
        v-if="open"
        class="tms-combo-drop"
        :style="dropStyle"
        @mousedown.prevent
      >
        <div v-if="filtered.length === 0" class="tms-combo-opt tms-combo-opt--empty">No matches</div>
        <div
          v-for="(opt, idx) in filtered"
          :key="opt.value"
          class="tms-combo-opt"
          :class="{ 'tms-combo-opt--active': idx === activeIdx }"
          @mousedown.prevent="choose(opt)"
        >
          {{ opt.label }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.tms-combo { position: relative; margin-bottom: 4px; }

/* Wrap — same look as TmsField */
.tms-combo__wrap {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid rgba(0,0,0,0.24);
  border-radius: 4px;
  height: 40px;
  background: #fff;
  transition: border-color 0.2s;
  cursor: pointer;
}
.tms-combo__wrap--focused {
  border-color: var(--q-primary, #1976d2);
  border-width: 2px;
}
.tms-combo__wrap--error {
  border-color: var(--q-negative, #c10015) !important;
  border-width: 2px;
}

/* Floating label */
.tms-combo__label {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: rgba(0,0,0,0.6);
  background: transparent;
  pointer-events: none;
  transition: all 0.15s ease;
  line-height: 1;
  white-space: nowrap;
  z-index: 1;
}
.tms-combo__label--up {
  top: 0;
  transform: translateY(-50%);
  font-size: 11px;
  background: #fff;
  padding: 0 3px;
  left: 9px;
}
.tms-combo__label--focused { color: var(--q-primary, #1976d2); }
.tms-combo__label--error { color: var(--q-negative, #c10015) !important; }
.tms-req { color: var(--q-negative, #c10015); }

/* Input */
.tms-combo__input {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 8px 4px 0 12px;
  font-size: 14px;
  color: rgba(0,0,0,0.87);
  font-family: inherit;
  cursor: pointer;
  min-width: 0;
}
.tms-combo__input::placeholder { color: rgba(0,0,0,0.38); }

/* Arrow */
.tms-combo__arrow {
  display: flex;
  align-items: center;
  padding: 0 8px;
  color: rgba(0,0,0,0.54);
  flex-shrink: 0;
}

/* Hint/error */
.tms-field__msg { font-size: 11px; color: rgba(0,0,0,0.54); padding: 2px 12px 0; min-height: 16px; }
.tms-field__msg--error { color: var(--q-negative, #c10015); }
</style>

<!-- Global dropdown styles — teleported outside scoped component -->
<style>
.tms-combo-drop {
  position: fixed;
  z-index: 9000;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  max-height: 220px;
  overflow-y: auto;
}
.tms-combo-opt {
  padding: 9px 14px;
  font-size: 14px;
  color: rgba(0,0,0,0.87);
  cursor: pointer;
  font-family: inherit;
  transition: background 0.1s;
}
.tms-combo-opt:hover { background: #f5f5f5; }
.tms-combo-opt--active {
  background: #e8f0fe;
  color: #1976d2;
  font-weight: 500;
}
.tms-combo-opt--empty { color: rgba(0,0,0,0.38); font-style: italic; cursor: default; }
</style>
