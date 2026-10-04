import type { DeskColumn, DeskColumnRelation } from '../../framework/grid/types';

/** A column read from a nested object on the row, such as `role.name` or `vehicleType.name`. */
export function relation(as: string, field: string): DeskColumnRelation {
  return { model: as, as, field };
}

/**
 * Key the TMS list API filters and sorts on for a grid column: `filter.field`, then `sortField`,
 * then `as.field` for a relation, else the column id. The server whitelists these keys.
 */
export function columnKey(column: DeskColumn): string {
  if (column.filter?.field) return column.filter.field;
  if (column.sortField) return column.sortField;
  if (column.relation) return `${column.relation.as}.${column.relation.field}`;
  return column.id;
}
