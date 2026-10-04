export function rangeToTsv(
  rowCount: number,
  colCount: number,
  r1: number,
  c1: number,
  r2: number,
  c2: number,
  read: (row: number, col: number) => string,
): string {
  const top = Math.max(0, Math.min(r1, r2));
  const bottom = Math.min(rowCount - 1, Math.max(r1, r2));
  const left = Math.max(0, Math.min(c1, c2));
  const right = Math.min(colCount - 1, Math.max(c1, c2));
  const lines: string[] = [];
  for (let r = top; r <= bottom; r += 1) {
    const cells: string[] = [];
    for (let c = left; c <= right; c += 1) {
      cells.push(read(r, c));
    }
    lines.push(cells.join('\t'));
  }
  return lines.join('\n');
}

export function parseTsv(text: string): string[][] {
  return text.replace(/\r/g, '').split('\n').filter((line) => line.length > 0).map((line) => line.split('\t'));
}

export function normalizeRange(
  r1: number,
  c1: number,
  r2: number,
  c2: number,
): { top: number; left: number; bottom: number; right: number } {
  return {
    top: Math.min(r1, r2),
    bottom: Math.max(r1, r2),
    left: Math.min(c1, c2),
    right: Math.max(c1, c2),
  };
}
