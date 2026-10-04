import type { DeskLookupColumn, DeskLookupConfig } from '../../framework/grid/types';

export type DeskLookup = DeskLookupConfig;

/** A lookup against a TMS REST collection: `GET /{endpoint}?q=…` plus fixed params. */
export interface TmsLookup {
  endpoint: string;
  labelKey: string;
  valueKey?: string;
  columns: DeskLookupColumn[];
  /** Fixed list filters, such as `{ status: 'AVAILABLE' }`. */
  params?: Record<string, string | number | boolean>;
  limit?: number;
  minChars?: number;
}

/** The framework's lookup shape. `extraWhere` carries the REST params; `model` is unused by TMS. */
export function tmsLookup(lookup: TmsLookup): DeskLookupConfig {
  return {
    model: lookup.endpoint,
    endpoint: lookup.endpoint,
    labelKey: lookup.labelKey,
    valueKey: lookup.valueKey ?? 'id',
    columns: lookup.columns,
    ...(lookup.params ? { extraWhere: lookup.params } : {}),
    ...(lookup.limit !== undefined ? { limit: lookup.limit } : {}),
    ...(lookup.minChars !== undefined ? { minChars: lookup.minChars } : {}),
  };
}

/** Query params a framework lookup asks for, read back by the host search. */
export function lookupParams(lookup: DeskLookupConfig): Record<string, unknown> {
  return { ...(lookup.extraWhere ?? {}) };
}
