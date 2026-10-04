/**
 * The single unified door into the desk framework for TMS pages.
 * Import everything from here — never import internal framework files directly.
 */

import './theme';

export { default as DeskShell } from '../../framework/layout/DeskShell.vue';
export { default as DeskMenuBar } from '../../framework/layout/DeskMenuBar.vue';
export { default as DeskFKeyBar } from '../../framework/layout/DeskFKeyBar.vue';
export { default as DeskPageLayer } from '../../framework/layout/DeskPageLayer.vue';
export { default as DeskKeysDialog } from '../../framework/keys/DeskKeysDialog.vue';
export { default as DeskJumpPeek } from '../../framework/focus/DeskJumpPeek.vue';
export { default as DeskForm } from '../../framework/form/DeskForm.vue';
export { default as DeskSection } from '../../framework/form/DeskSection.vue';
export { default as DeskField } from '../../framework/form/DeskField.vue';
export { default as DeskCombo } from '../../framework/form/DeskCombo.vue';
export { default as DeskLookupBox } from '../../framework/form/DeskLookupBox.vue';
export { default as DeskDialog } from '../../framework/form/DeskDialog.vue';
export { default as DeskGrid } from '../../framework/grid/DeskGrid.vue';
export { default as TmsDialog } from './TmsDialog.vue';
export { default as TmsPasswordField } from './TmsPasswordField.vue';

export { configureDesk } from '../../framework/host';
export { deskMenuArmed, installDeskKeys } from '../../framework/keys/dispatcher';
export { deskKeyLabel, loadDeskKeymap } from '../../framework/keys/deskKeymap';
export { provideDeskLayer, useDeskLayer } from '../../framework/keys/useDeskLayer';
export { runDeskAction } from '../../framework/keys/layers';
export { issuesFromErrors } from '../../framework/form/issues';
export { YES_NO } from '../../framework/form/yesNo';

export type { DeskIssue } from '../../framework/form/issues';
export type { DeskHandlerInput } from '../../framework/keys/layers';
export type { DeskBindings } from '../../framework/keys/keymap';
export type { DeskMenuNode } from '../../framework/menu/deskMenu';
export type { DeskColumn, DeskGridApi, DeskGridRow, DeskRowAction, DeskSelectOption } from '../../framework/grid/types';

export { columnKey, relation } from './columns';
export { lookupParams, tmsLookup, type DeskLookup, type TmsLookup } from './lookup';
