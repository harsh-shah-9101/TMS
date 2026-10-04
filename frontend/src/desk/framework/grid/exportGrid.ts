import * as XLSX from 'xlsx-js-style';
import type { DeskColumn, DeskGridRow } from './types';
import { cellText } from './display';

export function exportGridXlsx(
  columns: DeskColumn[],
  rows: DeskGridRow[],
  fileName: string,
): void {
  const groups = columns.some((column) => column.group);
  const headerRow = columns.map((column) => column.header);
  const groupRow = columns.map((column) => column.group ?? '');
  const body = rows.map((row) => columns.map((column) => cellText(column, row)));
  const aoa = groups ? [groupRow, headerRow, ...body] : [headerRow, ...body];
  const sheet = XLSX.utils.aoa_to_sheet(aoa);
  if (groups) {
    const merges: XLSX.Range[] = [];
    let start = 0;
    while (start < columns.length) {
      const label = columns[start]?.group;
      if (!label) {
        start += 1;
        continue;
      }
      let end = start;
      while (end + 1 < columns.length && columns[end + 1]?.group === label) end += 1;
      if (end > start) merges.push({ s: { r: 0, c: start }, e: { r: 0, c: end } });
      start = end + 1;
    }
    sheet['!merges'] = merges;
  }
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Desk');
  XLSX.writeFile(book, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
}
