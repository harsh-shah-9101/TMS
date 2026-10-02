# Desk keys

One small keyboard system for the desk ERP. It handles shortcuts, focus order (Enter and Tab), and first focus when a page or dialog opens.

It does not use or change the classic app's shortcut code. Presets and action labels come from the host through `configureDesk` in `../host.ts`. Ankpal keeps its copies of `src/layouts/*-shortcuts.json` in `src/desk/ankpal/keys/presets/`.

## Words used here

- **Action id**: a name such as `action-save` or `nav-sales-invoice-add`. Presets map action ids to keys.
- **Combo**: a key string such as `ctrl+s` or `alt+f2`. Letters and digits come from `event.code`, so the keyboard layout does not matter.
- **Layer**: one level of keys and fields. The shell, each routed page, and each open dialog are layers. They stack like this: shell, then page, then dialog.
- **Modal layer**: a dialog. Keys and fields below it are off, except handlers marked `always`.

## Files

| File | What it does |
|------|--------------|
| `combo.ts` | Turns a key event or preset array into a combo, and formats combos for display |
| `keymap.ts` | Pure helpers: merge a preset with overrides, find conflicts |
| `deskKeymap.ts` | The active keymap for the signed-in user, stored in `localStorage` |
| `../host.ts` | Presets, labels, and lookup search supplied by the host app |
| `layers.ts` | The layer stack and handler lookup |
| `useDeskLayer.ts` | `provideDeskLayer` for layer owners, `useDeskLayer` for children |
| `dispatcher.ts` | The only key listeners (installed once by `DeskLayout`) |
| `altTap.ts` | Tap Alt, then a letter, to open a menu |
| `DeskKeysDialog.vue` | Lets the user pick a preset and change keys (Ctrl+Alt+K) |

## How a key press is handled

`installDeskKeys` adds a keydown listener on `window` (bubble phase), so focused widgets such as the grid, combo and lookup see the key first. If a widget calls `preventDefault`, the shortcut does not run.

Then the dispatcher:

1. Builds the combo. It skips repeated and IME keys.
2. While you type in an input, it skips bare keys (no Ctrl, Alt or Meta, and not F1 to F12) and copy, paste, cut, undo and redo.
3. Finds the action ids bound to the combo.
4. Walks the layers from the top down. The first layer with a handler for one of those ids wins. Below a modal layer, only `always` handlers count.

Ctrl+R and Ctrl+Shift+R are never taken.

There are two more listeners (keydown and keyup in capture phase) for the Alt tap, plus a `blur` listener that resets it. That is all.

## Menus: the Alt tap

Press and release Alt on its own to focus the top menu for the page you are on, the same as tabbing to that menu and pressing Enter. Left and Right move across the top menus. Down or Enter opens the highlighted menu. A letter still opens that menu directly (Alt, then M, opens Masters). While a menu is open, the arrow keys stay in the menu and do not move the grid. Esc closes it. Alt+key combos still go to the preset. The Alt tap is off while a dialog is open.

## Registering keys

A page registers its keys with `useDeskLayer`. Each routed page already has its own layer (`DeskPageLayer` in `DeskLayout`).

```ts
useDeskLayer({
  handlers: {
    'action-save': save,
    'action-cancel': () => router.push(listPath()),
  },
});
```

A dialog passes extra keys with the `keys` prop. `DeskDialog` already binds `action-save` and `action-form-save` to accept, and `action-cancel` to close.

```vue
<DeskDialog v-model:open="open" :keys="{ 'action-delete': clearCurrent }" @accept="apply" />
```

List actions from `useDeskActions` bind themselves: create goes to `action-new`, edit to `action-edit`, delete to `action-delete`, plus the action's own `shortcutKeyCode`.

Global shortcuts live in the shell layer. `nav-*` ids open the matching desk page from `router/desk-nav.ts`, and ids with no desk page do nothing.

To run an action from a button, call `runDeskAction(id)`. To show its keys, use `deskKeyLabel(id)`.

## Focus order: Enter and Tab

Fields are elements with `data-desk-field`. The order is their DOM order inside the top layer. Fields inside a nested layer (such as an open dialog) are left out.

- **Enter** goes to the field's `onEnter` target, otherwise to the next field.
- **Tab** goes to the field's `onTab` target, otherwise it acts like Enter.
- **Shift+Tab** goes back one field.
- In a dialog, Enter on the last field accepts the dialog, and Tab wraps to the first field.

You add field options with `useDeskLayer({ fields: [...] })`:

```ts
useDeskLayer({
  fields: [
    { id: 'party', onEnter: 'date' },
    { id: 'notes', onTab: 'save' },
  ],
});
```

A target can be a list. The first one that can take focus wins.

### Grids

`DeskGrid` is a single field (its `field-id`). The `tab-flow` prop decides what Tab does inside it:

- `enter` (default): in entry mode Tab acts like Enter. In list and report mode Tab moves one cell right. Shift+Tab moves left.
- `field`: Tab leaves the grid to the next field (or `exit-field`). Shift+Tab goes to the field before the grid. Use this only when Tab should leave the grid. By default Tab stays in the grid and moves like Enter, including the contacts grid and invoice lines.

`min-rows` keeps at least that many rows. Delete still removes a row while more than that remain. On the last kept row, Delete clears the cells and any related ids (a lookup's `${column}Id`, and other keys ending in `Id`) and leaves the row in place. The contacts grid and the sales invoice lines use `min-rows="1"`.

### Line dialogs

A column can open a dialog on Enter with `enter: { type: 'dialog', dialog, returnTo, when }`.

- `when: 'always'` (the default) opens on every Enter.
- `when: 'change'` opens only when the committed value differs from the value when editing started. Enter on an unchanged cell moves to the next cell.

A page can override that per cell with `@next-focus`. The function receives the row, the column, whether the value changed, and `force` (the open-dialog shortcut). Return a target to use it, `null` to move to the next cell, or `undefined` to keep the column's `enter`. The sales invoice page uses this so Parameters opens only when Qty is greater than 0.

A column whose Enter opens a dialog shows a small dialog mark in its header, on the opposite side of the title. Ctrl+Enter (`grid-cell-dialog`) opens the dialog even when the value did not change. On a cell that has a dialog, that wins over the section jump, which uses the same keys by default. Change those keys in the Keys dialog. The grid takes the dialog shortcut only on a cell that has a dialog, so list pages still use Ctrl+Enter to edit a record.

## Jump and Ctrl+Arrow

Hold the jump key (Ctrl, from `desk-jump`) for a moment and one outline shows where Ctrl+Enter will land. A quick Ctrl+S never shows it. Releasing the key, scrolling, or clicking hides it. Turn the outline off with "Jump preview" in the Keys dialog. That choice is saved with your other keys.

**Ctrl+Enter** (`desk-jump`) jumps to the next section. A section is any element with `data-desk-section` in the current page or dialog. The jump lands on the element marked `data-desk-entry`, or on the first field in that section that can take focus. A field can name its own target with `onJump`, the same way as `onEnter`.

On a sales invoice the sections are the header, the item grid, and the notes. From any header field, including party, the jump lands on the Item cell of the first blank line. From an item cell it lands on Terms.

A grid decides the exact cell:

- `jumpTo` picks the landing cell. The voucher grid uses the `jump-column` prop (Item).
- `jumpFrom` runs while the grid itself is focused. On a cell that opens a line dialog, and only when that shortcut is the same keys as the jump, the outline sits on that cell and Ctrl+Enter opens the dialog.
- `focusNear` picks the column when Ctrl+Arrow enters the grid from outside.

**Ctrl+Arrow** (`desk-move-up`, `desk-move-down`, `desk-move-left`, `desk-move-right`) moves to the nearest field in that direction, using where the fields actually sit on screen. On a Mac, Control+Arrow is taken by the system, so Command+Arrow does this move instead. The Keys dialog shows Cmd there. Left and Right stay on the same row. Inside the item grid it moves one cell, including the total lines. At the edge it continues to the nearest field outside, so Ctrl+Up from the first item row reaches the header field above that column, and Ctrl+Down from the last total line reaches Terms.

These actions are registered on the shell. On a list page, that page's Edit action still wins when it uses the same keys, because the page sits above the shell.

**Turning Ctrl+Arrow off.** The shell owns the move, so a page or widget only says when it should not happen:

- A whole page, form or dialog: `disable-spatial-move` on `DeskForm` or `DeskDialog` (or `disableSpatialMove` in `useDeskLayer`). The top layer decides, so a dialog over a normal page turns it off only while it is open.
- One widget: put `data-desk-no-move` on it, or use `no-move` on a `DeskField`. Ctrl+Arrow is then left to the widget while it has focus.

The check runs before the key is claimed, so a page that turns it off keeps the native Ctrl+Arrow (word jumps in a text box).

## Tab keys

Ctrl+Shift+Left and Ctrl+Shift+Right (`desk-tab-prev`, `desk-tab-next`) switch tabs on a page that has them. They appear in the Keys dialog like any other action. Only a page that registers a handler for them claims the keys; on every other page they stay native, so text selection by word still works.

The account form registers both handlers and wraps around at either end. After a switch, focus lands on the first field of the new tab, and Ctrl+Arrow then moves between the fields of that tab (only fields that are mounted are seen). Ctrl+Enter still jumps between the top fields and the open tab.

Widgets that stop keys from leaving them (`DeskCombo`, `DeskLookupBox`, `DeskCellEditor`) let these keys through with `isDeskNavKey`. `DeskGrid` skips them with `isDeskTabKey`, so a grid never uses Ctrl+Shift+Arrow to extend a selection on a page that has tabs.

## First focus

When a page or dialog opens, its layer focuses one field. The choice goes in this order:

1. `initialFocus` (a `DeskForm` or `DeskDialog` prop).
2. The first field marked initial (`initial` prop on `DeskField` or `DeskGrid`).
3. The first field that can take focus.

A grid counts as a field, so a page whose first field is a grid opens on its first cell. To leave a grid out, use `disable-auto-focus`. To turn first focus off for a whole dialog or form, use `disable-initial-focus`.

First focus runs once, when the layer opens. Reloading data does not move focus.

## Custom keys

Open the keys dialog with Ctrl+Alt+K or the Keys button. Pick a preset, select an action, press Enter, then press the new keys. Del clears a binding, and "Reset to preset" removes all changes.

Changes are saved per user in `localStorage` as `desk.keys.<userId>` (`{ preset, bindings }`). If no preset is saved yet, the classic `shortcutSet` value is used as the default. Desk only reads that value and never writes it.
