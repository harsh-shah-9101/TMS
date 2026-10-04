# Desk framework

Keyboard-first UI for a Quasar app: shortcuts, focus order, dialogs, menu bar, and the spreadsheet grid. Ankpal's pages, vouchers, and Nest calls live in `src/desk/ankpal` and are not part of this folder.

The framework always runs inside Quasar. `vue` and `quasar` are peer dependencies when this folder is later lifted into its own package. It also uses `@tanstack/vue-virtual`, `@tanstack/vue-table`, and `xlsx-js-style`.

## Import rule

Files under `framework/` may import Vue, Quasar, those libraries, and other `framework/` files. They must not import the ERP app (`src/...` outside desk) or `ankpal/`. ESLint enforces that with `no-restricted-imports`.

## Host

Call `configureDesk` once, before `loadDeskKeymap` and before a lookup opens. Ankpal does this in `ankpal/layout/DeskLayout.vue`.

```ts
configureDesk({
  presets, // action id -> key list
  presetLabels, // { id, label } shown in the keys dialog
  defaultPreset,
  label: (actionId) => 'Human name',
  initialPreset: () => null, // used only when this user has no stored preset
  searchLookup: async (lookup, query) => [],
});
```

The shell is `layout/DeskShell.vue` (`q-layout`). The host fills the header, toolbar, page, and status slots, and installs keys with `installDeskKeys`.

## Required fields and errors

Any page can use this. It does not know what a page is about.

- **Required:** pass `required` to `DeskField`. The label shows `*`. After focus leaves an empty required field, it turns reddish (`--desk-invalid-bg`, `--desk-error` in `theme/desk-tokens.css`).
- **Errors:** the page builds a list of `DeskIssue` (`{ message, fieldId? }`, see `form/issues.ts`) and passes it to `DeskForm` as `:issues`.
  - An issue whose `fieldId` is on screen shows under that field.
  - Any other issue (no `fieldId`, or its field is not mounted, like a closed tab) shows as a stacked toast. Toasts have no timeout. An issue leaves the toasts when its field mounts, and disappears when it leaves the list.
- **When to check:** the page decides. The usual pattern is a `checked` ref set by the first Save, and `computed(() => checked.value ? validate(...) : [])`, so the list rechecks as the user types and a fresh form is not red.
- **Server errors:** pass them as `:server-issues`. `issuesFromErrors` in `form/issues.ts` turns a qnatk `errors` map (`{ key: string[] }`) into that list. A full path is tried, then its last segment (`bankDetail.bankName` looks up `bankName`), then the key itself. A key no field uses, such as `Error`, never mounts, so it stays a toast. Editing a field hides its server error until the page replaces the list (the next save). A load or autofill does not count as an edit.

Examples: `validateAccount` (`ankpal/pages/accounts/accountForm.ts`) and `validateVoucher` (`ankpal/voucher/validate.ts`). Grid cells are not marked yet, so a grid problem is an issue without `fieldId`.

## Grid corner menu

`DeskGrid` puts `≡` in the top-left header cell when there is something to choose. The menu holds:

- **Pin totals**, when the page fills the `#foot` slot. Bind it with `v-model:pin-foot`.
- **Page toggles**, from the `options` prop (`{ id, label, checked }`). Choosing one emits `option` with that id. The page stores the checked state.
- **Columns**, when `columnPicker` is on (the default). Hidden columns are remembered in `localStorage` under `storageKey`.

Arrow keys move in the menu. Enter or Space toggles the highlighted row. Escape closes it.

## Hosting

`DeskShell` is the standalone host. Both it and the in-app embed host call `useDeskShellLayer()` (`layout/useDeskShellLayer.ts`), which owns the field-move and section-jump keys. A page that builds URLs must not write `/desk` itself. It asks `useDeskBase()` (`ankpal/router/deskBase.ts`) for a `deskUrl('accounts/new')`, so the same page works under `.../desk` and inside the classic app. See `../ankpal/README.md`.

## Preferences

`storage/deskPrefs.ts` reads and writes one JSON value per key in the `ankpal-desk-prefs` IndexedDB. `readDeskPref` returns null when the browser has no IndexedDB. These values are not cleared on logout.
