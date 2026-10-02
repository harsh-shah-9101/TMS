/**
 * useTmsFormFocus
 * ---------------
 * Keyboard-first form navigation inspired by the Desk framework.
 * - Enter / Tab  → move to next field
 * - Shift+Tab    → move to previous field
 * - Auto-focuses the [data-tms-initial] field when the form container mounts.
 *
 * Usage:
 *   Mark every field element with:   data-tms-field="myFieldId"
 *   Mark the first field with:       data-tms-initial
 *   Call focusInitial() when the drawer/dialog opens.
 */

import { type Ref } from 'vue'

export interface TmsFormFocus {
  focusNext: (currentId: string) => void
  focusPrev: (currentId: string) => void
  focusInitial: () => void
}

/** All visible [data-tms-field] elements inside the container, in DOM order */
function getFields(container: HTMLElement | null): HTMLElement[] {
  if (!container) return []
  const all = Array.from(
    container.querySelectorAll<HTMLElement>('[data-tms-field]'),
  )
  return all.filter((el) => {
    // skip hidden / disabled / readonly
    if ((el as HTMLInputElement).disabled) return false
    if ((el as HTMLInputElement).readOnly) return false
    if (el.getClientRects().length === 0) return false
    return true
  })
}

function focusEl(el: HTMLElement): void {
  el.focus()
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    el.select()
  }
}

export function useTmsFormFocus(containerRef: Ref<HTMLElement | null>): TmsFormFocus {
  function focusNext(currentId: string): void {
    const fields = getFields(containerRef.value)
    const idx = fields.findIndex((el) => el.dataset.tmsField === currentId)
    if (idx === -1) return
    const next = fields[idx + 1]
    if (next) focusEl(next)
  }

  function focusPrev(currentId: string): void {
    const fields = getFields(containerRef.value)
    const idx = fields.findIndex((el) => el.dataset.tmsField === currentId)
    if (idx <= 0) return
    const prev = fields[idx - 1]
    if (prev) focusEl(prev)
  }

  function focusInitial(): void {
    // Small delay so the DOM is rendered (drawer transition)
    setTimeout(() => {
      const container = containerRef.value
      if (!container) return
      // prefer [data-tms-initial] field
      const marked = container.querySelector<HTMLElement>('[data-tms-initial]')
      if (marked) { focusEl(marked); return }
      // fallback: first visible field
      const first = getFields(container)[0]
      if (first) focusEl(first)
    }, 120)
  }

  return { focusNext, focusPrev, focusInitial }
}
