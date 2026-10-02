/**
 * How far to scroll so a block sits in the open band between a sticky header and a sticky footer.
 * `cellBottom` may be the bottom of the drawer under the cell.
 * Positive scrolls down. Negative scrolls up. Zero when the block is already clear.
 * When the block is taller than the band, the bottom stays in view so the drawer is not left covered.
 */
export function scrollDeltaToClear(cellTop: number, cellBottom: number, viewTop: number, viewBottom: number): number {
  if (viewBottom <= viewTop) return 0;
  if (cellBottom > viewBottom) return cellBottom - viewBottom;
  if (cellTop < viewTop) return cellTop - viewTop;
  return 0;
}

export interface FootPinRow {
  height: number;
  /** Row span of each cell in this row. 1 for a normal cell. */
  spans: number[];
}

/**
 * Bottom offset for each footer cell so the rows stack above one another.
 * A cell that spans later rows sticks with those rows, not on top of them.
 */
export function footCellBottoms(rows: FootPinRow[]): number[][] {
  const bottoms: number[][] = rows.map((row) => row.spans.map(() => 0));
  let below = 0;
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const row = rows[index];
    if (!row) continue;
    row.spans.forEach((span, cellIndex) => {
      let under = below;
      if (span > 1) {
        let spanned = 0;
        for (let offset = 1; offset < span && index + offset < rows.length; offset += 1) {
          spanned += rows[index + offset]?.height ?? 0;
        }
        under = Math.max(0, below - spanned);
      }
      const line = bottoms[index];
      if (line) line[cellIndex] = under;
    });
    below += row.height;
  }
  return bottoms;
}
