import type { DeskColumn } from '../grid/types';
import type { PivotColumn } from './pivotEngine';

export function pivotColumnsToGrid(columns: PivotColumn[]): DeskColumn[] {
  return columns.map((column) => {
    const defined: DeskColumn = {
      id: column.id,
      header: column.header,
      width: 120,
      align: column.group ? 'right' : 'left',
      type: column.group ? 'number' : 'text',
      readonly: true,
    };
    if (column.group) {
      defined.group = column.group;
      defined.format = (value: unknown) => (typeof value === 'number' ? value.toFixed(2) : '');
    }
    return defined;
  });
}
