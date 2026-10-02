/**
 * useTmsFormFocus
 * ───────────────
 * Keyboard-first form navigation.
 * Scans [data-tms-field] elements inside a container and lets
 * Enter / Tab / Shift+Tab move focus between them.
 *
 * Usage:
 *   1. Wrap the form in: <div ref="formContainerRef">
 *   2. Call focusInitial() when the drawer/dialog opens.
 *   3. Pass focusNext / focusPrev as props into every TmsField / TmsCombo.
 */

import { type Ref, nextTick } from 'vue'

export interface TmsFormFocus {
  focusNext: (currentId: string) => void
  focusPrev: (currentId: string) => void
  focusInitial: () => void
}

function getFields(container: HTMLElement): HTMLInputElement[] {
  return Array.from(
    container.querySelectorAll<HTMLInputElement>('[data-tms-field]')
  ).filter(el => {
    if (el.disabled) return false
    if (el.readOnly) return false
    // must be visible
    const rect = el.getBoundingClientRect()
    return rect.width > 0 || rect.height > 0
  })
}

function focusEl(el: HTMLInputElement): void {
  el.focus()
  // select all text so typing replaces it
  try { el.select() } catch { /* textarea / date inputs may skip this */ }
}

export function useTmsFormFocus(
  containerRef: Ref<HTMLElement | null>,
  onSubmit?: () => void,
): TmsFormFocus {
  function focusNext(currentId: string): void {
    const container = containerRef.value
    if (!container) return
    const fields = getFields(container)
    const idx = fields.findIndex(el => el.dataset.tmsField === currentId)
    if (idx === -1) return
    if (idx === fields.length - 1) {
      // Last field — submit the form
      onSubmit?.()
      return
    }
    focusEl(fields[idx + 1]!)
  }

  function focusPrev(currentId: string): void {
    const container = containerRef.value
    if (!container) return
    const fields = getFields(container)
    const idx = fields.findIndex(el => el.dataset.tmsField === currentId)
    if (idx <= 0) return
    focusEl(fields[idx - 1]!)
  }

  function focusInitial(): void {
    // Wait for Vue to render the dialog content + CSS transitions to settle
    nextTick(() => {
      setTimeout(() => {
        const container = containerRef.value
        if (!container) return
        // Try the [data-tms-initial] field first
        const marked = container.querySelector<HTMLInputElement>('[data-tms-initial]')
        if (marked) { focusEl(marked); return }
        // Fallback: first visible field
        const first = getFields(container)[0]
        if (first) focusEl(first)
      }, 250)
    })
  }

  return { focusNext, focusPrev, focusInitial }
}
