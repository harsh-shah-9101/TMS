import type { DeskBindings } from '../ui';

/** Page actions shared by every preset. */
const ACTIONS: DeskBindings = {
  'action-form-save': ['ctrl', 's'],
  'action-edit': ['ctrl', 'enter'],
  'action-delete': ['delete'],
  'action-refresh': ['alt', 'r'],
  'action-export': ['alt', 'e'],
  'action-help': ['f1'],
};

/** Shell shortcuts that open a page from anywhere. */
const NAV: DeskBindings = {
  'nav-dashboard': ['ctrl', 'shift', 'd'],
  'nav-lrs': ['f8'],
  'nav-trips': ['f7'],
  'nav-fuel': ['f9'],
  'nav-advances': ['f5'],
  'nav-pods': ['f6'],
  'nav-invoices': ['ctrl', 'f8'],
  'nav-vehicles': ['ctrl', 'shift', 'v'],
  'nav-parties': ['ctrl', 'shift', 'a'],
  'nav-drivers': ['ctrl', 'shift', 'r'],
  'nav-routes': [],
  'nav-carriers': [],
  'nav-vehicle-types': [],
  'nav-reports': ['ctrl', 'alt', 'r'],
  'nav-users': ['ctrl', 'shift', 'u'],
};

export const TMS_PRESET_BINDINGS: Record<string, DeskBindings> = {
  tms: {
    ...ACTIONS,
    ...NAV,
    'action-new': ['alt', 'n'],
    'action-save': ['f12'],
    'action-cancel': ['ctrl', 'x'],
  },
  tally: {
    ...ACTIONS,
    ...NAV,
    'action-new': ['alt', 'c'],
    'action-save': ['ctrl', 'a'],
    'action-cancel': ['ctrl', 'q'],
  },
};

export const TMS_PRESETS = [
  { id: 'tms', label: 'TMS' },
  { id: 'tally', label: 'Tally style' },
];

export const DEFAULT_TMS_PRESET = 'tms';
