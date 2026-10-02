<!--
  TmsCombo.vue
  ─────────────
  Keyboard-first select/combo — replaces q-select in forms.
  Inspired by DeskCombo from the Desk framework.

  Behaviour:
  - Focus → opens dropdown showing all options
  - Type letters → filters options in real time
  - ArrowDown / ArrowUp → highlights an option
  - Enter (1st press) → picks highlighted option, closes dropdown
  - Enter (2nd press) → moves to next field (like Tally)
  - Tab → picks + moves next
  - Shift+Tab → picks + moves prev
  - Escape → closes without picking

  Props:
    fieldId       unique id
    label         visible label
    options       { label: string; value: string }[]
    required      shows * and validates
    initial       marks as auto-focus target
    focusNext     from useTmsFormFocus
    focusPrev     from useTmsFormFocus
-->

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

export interface TmsOption {
  label: string
  value: string
}

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

// ── Internal state ─────────────────────────────────────────────────────────────
const inputRef = ref<HTMLInputElement | null>(null)
const query = ref('')
const open = ref(false)
const activeIdx = ref(0)
const accepted = ref(false) // true after first Enter picks; second Enter advances
const touched = ref(false)

// ── Filtered options ──────────────────────────────────────────────────────────
const filtered = computed<TmsOption[]>(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return props.options
  return props.options.filter(
    (o) => o.label.toLowerCase().includes(needle) || o.value.toLowerCase().includes(needle)
  )
})

// ── Display label of current model value ──────────────────────────────────────
function committedLabel(): string {
  return props.options.find((o) => o.value === model.value)?.label ?? model.value ?? ''
}

// ── Validation ────────────────────────────────────────────────────────────────
const isEmpty = computed(() => !model.value)
const showError = computed(() => props.required && touched.value && isEmpty.value)

// ── Dropdown position ─────────────────────────────────────────────────────────
const dropTop = ref(0)
const dropLeft = ref(0)
const dropWidth = ref(160)

function place() {
  const rect = inputRef.value?.getBoundingClientRect()
  if (!rect) return
  dropTop.value = rect.bottom + window.scrollY
  dropLeft.value = rect.left + window.scrollX
  dropWidth.value = Math.max(rect.width, 180)
}

// ── Open / close ──────────────────────────────────────────────────────────────
function openList() {
  query.value = committedLabel()
  activeIdx.value = Math.max(0, props.options.findIndex((o) => o.value === model.value))
  open.value = true
  place()
}

function closeList() {
  open.value = false
  query.value = committedLabel()
  accepted.value = false
}

// ── Pick an option ────────────────────────────────────────────────────────────
function choose(option: TmsOption) {
  model.value = option.value
  query.value = option.label
  open.value = false
  accepted.value = true
  nextTick(() => inputRef.value?.select())
}

// ── Keyboard handler ──────────────────────────────────────────────────────────
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    accepted.value = false
    if (!open.value) openList()
    const count = filtered.value.length
    if (!count) return
    activeIdx.value = (activeIdx.value + (e.key === 'ArrowDown' ? 1 : -1) + count) % count
    return
  }

  if (e.key === 'Escape') {
    e.preventDefault()
    if (open.value) closeList()
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

function onFocus() {
  accepted.value = false
  openList()
  inputRef.value?.select()
}

function onType(e: Event) {
  const val = (e.target as HTMLInputElement).value
  query.value = val
  accepted.value = false
  activeIdx.value = 0
  open.value = true
  place()
}

function onBlur(e: FocusEvent) {
  // if focus moved to inside the dropdown (mousedown.prevent), don't close
  setTimeout(() => {
    if (!inputRef.value?.closest('.tms-combo')?.contains(document.activeElement)) {
      closeList()
      touched.value = true
    }
  }, 150)
}

// Sync display when model changes externally
watch(() => model.value, () => {
  if (!open.value) query.value = committedLabel()
})
</script>

<template>
  <div class="tms-combo">
    <!-- Label -->
    <div class="tms-combo-label text-caption text-grey-7 q-mb-xs">
      {{ label }}<span v-if="required" class="text-negative"> *</span>
    </div>

    <!-- Input wrapper -->
    <div class="tms-combo-input-wrap" :class="{ 'tms-combo-open': open, 'tms-combo-error': showError }">
      <input
        ref="inputRef"
        :id="fieldId"
        :data-tms-field="fieldId"
        v-bind="initial ? { 'data-tms-initial': '' } : {}"
        :value="query"
        autocomplete="off"
        class="tms-combo-input"
        :placeholder="committedLabel() || 'Select...'"
        @focus="onFocus"
        @input="onType"
        @blur="onBlur"
        @keydown="onKey"
      />
      <q-icon
        name="arrow_drop_down"
        class="tms-combo-arrow"
        :class="{ 'tms-combo-arrow-open': open }"
        @mousedown.prevent="open ? closeList() : openList()"
      />
    </div>

    <!-- Error message -->
    <div v-if="showError" class="tms-combo-errmsg text-negative text-caption q-mt-xs">
      {{ label }} is required
    </div>

    <!-- Dropdown (teleported to body so it's never clipped) -->
    <Teleport to="body">
      <div
        v-if="open && filtered.length"
        class="tms-combo-dropdown"
        :style="{
          top: `${dropTop}px`,
          left: `${dropLeft}px`,
          minWidth: `${dropWidth}px`,
        }"
        @mousedown.prevent
      >
        <div
          v-for="(option, idx) in filtered"
          :key="option.value"
          class="tms-combo-option"
          :class="{ 'tms-combo-option-active': idx === activeIdx }"
          @mousedown.prevent="choose(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.tms-combo { position: relative; }

.tms-combo-label { font-size: 12px; font-weight: 500; }

.tms-combo-input-wrap {
  display: flex;
  align-items: center;
  border: 1px solid #c0c0c0;
  border-radius: 4px;
  background: #fff;
  transition: border-color .15s;
}
.tms-combo-input-wrap:focus-within,
.tms-combo-open {
  border-color: var(--q-primary);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, .12);
}
.tms-combo-error { border-color: var(--q-negative) !important; }

.tms-combo-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 7px 8px;
  font-size: 14px;
  color: #1a1a1a;
  min-width: 0;
}

.tms-combo-arrow {
  padding: 0 6px;
  color: #888;
  cursor: pointer;
  transition: transform .15s;
}
.tms-combo-arrow-open { transform: rotate(180deg); }

.tms-combo-errmsg { font-size: 11px; }
</style>

<!-- Global dropdown styles (cannot be scoped since teleported outside component) -->
<style>
.tms-combo-dropdown {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,.12);
  max-height: 240px;
  overflow-y: auto;
}
.tms-combo-option {
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
  color: #1a1a1a;
  transition: background .1s;
}
.tms-combo-option:hover { background: #f0f4ff; }
.tms-combo-option-active {
  background: #e8f0fe;
  color: var(--q-primary);
  font-weight: 500;
}
</style>
