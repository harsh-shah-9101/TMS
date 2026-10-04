import type { DeskMenuNode } from '../ui';

/** A menu row plus what the user needs to see it and the shortcut action that opens it. */
export interface TmsMenuNode extends DeskMenuNode {
  navId?: string;
  permission?: string;
  children?: TmsMenuNode[];
}

/** The full TMS navigation menu. Letters are unique inside each level (Alt tap). */
export const TMS_MENU: TmsMenuNode[] = [
  { label: 'Dashboard', letter: 'd', route: '/', navId: 'nav-dashboard' },
  {
    label: 'Masters',
    letter: 'm',
    children: [
      { label: 'Vehicles', letter: 'v', route: '/vehicles', navId: 'nav-vehicles' },
      { label: 'Vehicle Types', letter: 't', route: '/vehicle-types', navId: 'nav-vehicle-types' },
      { label: 'Parties', letter: 'p', route: '/parties', navId: 'nav-parties' },
      { label: 'Drivers', letter: 'r', route: '/drivers', navId: 'nav-drivers' },
      { label: 'Routes', letter: 'o', route: '/routes', navId: 'nav-routes' },
      { label: 'Carriers', letter: 'c', route: '/carriers', navId: 'nav-carriers' },
    ],
  },
  {
    label: 'Operations',
    letter: 'o',
    children: [
      { label: 'Trips & Dispatch', letter: 't', route: '/trips', navId: 'nav-trips' },
      { label: 'Bookings / LR', letter: 'b', route: '/bookings', navId: 'nav-bookings' },
      { label: 'Tracking', letter: 'k', route: '/tracking', navId: 'nav-tracking' },
      { label: 'Fuel Entries', letter: 'f', route: '/fuel', navId: 'nav-fuel' },
      { label: 'Advances & expenses', letter: 'a', route: '/advances', navId: 'nav-advances' },
      { label: 'Proof of Delivery (POD)', letter: 'p', route: '/pod', navId: 'nav-pod' },
    ],
  },
  {
    label: 'Finance',
    letter: 'f',
    children: [
      { label: 'Billing / Invoices', letter: 'b', route: '/billing', navId: 'nav-billing' },
      { label: 'Purchase Bills', letter: 'p', route: '/purchase-bills', navId: 'nav-purchase-bills' },
      { label: 'Settlements', letter: 's', route: '/settlements', navId: 'nav-settlements' },
    ],
  },
  {
    label: 'Insights',
    letter: 'i',
    children: [
      { label: 'Reports & Analytics', letter: 'r', route: '/reports', navId: 'nav-reports' },
      { label: 'Exceptions', letter: 'x', route: '/exceptions', navId: 'nav-exceptions' },
    ],
  },
  {
    label: 'Admin',
    letter: 'a',
    children: [
      { label: 'User Management', letter: 'u', route: '/access', navId: 'nav-users' },
      { label: 'Company Profile', letter: 'p', route: '/profile', navId: 'nav-profile' },
      { label: 'Settings', letter: 's', route: '/settings', navId: 'nav-settings' },
    ],
  },
];

/** Rows the user may open; groups left empty are dropped. */
export function visibleMenu(nodes: TmsMenuNode[], can?: (code: string | undefined) => boolean): TmsMenuNode[] {
  return nodes.flatMap((node) => {
    if (!node.children) {
      if (!can || !node.permission) return [node];
      return can(node.permission) ? [node] : [];
    }
    const children = visibleMenu(node.children, can);
    return children.length ? [{ ...node, children }] : [];
  });
}

function leaves(nodes: TmsMenuNode[]): TmsMenuNode[] {
  return nodes.flatMap((node) => (node.children ? leaves(node.children) : [node]));
}

/** `nav-*` id to route, for the shell's shortcut handlers. */
export const NAV_TARGETS: Record<string, { route: string; permission?: string; label: string }> = Object.fromEntries(
  leaves(TMS_MENU)
    .filter((node) => node.navId && node.route)
    .map((node) => [
      node.navId as string,
      { route: node.route as string, label: node.label, ...(node.permission ? { permission: node.permission } : {}) },
    ]),
);

/** Human-readable label for any TMS action id. */
export function tmsActionLabel(actionId: string): string {
  const nav = NAV_TARGETS[actionId];
  if (nav) return `Go to ${nav.label}`;
  const LABELS: Record<string, string> = {
    'action-save': 'Save / Accept',
    'action-form-save': 'Form save',
    'action-new': 'New',
    'action-edit': 'Edit / Alter',
    'action-delete': 'Delete',
    'action-refresh': 'Refresh',
    'action-export': 'Export',
    'action-help': 'Help',
    'action-cancel': 'Cancel / Exit',
    'desk-keys': 'Keyboard shortcuts',
    'desk-jump': 'Jump to next section',
    'desk-move-up': 'Move to field above',
    'desk-move-down': 'Move to field below',
    'desk-move-left': 'Move to field on the left',
    'desk-move-right': 'Move to field on the right',
  };
  return LABELS[actionId] ?? actionId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}
