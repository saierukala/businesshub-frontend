// Areas are free text, matched exactly between technician service areas and customer addresses.
// These helpers catch spelling slips ("Kondapor" for "Kondapur") before they are saved.

export type AreaInUse = { area: string; technicians: number; addresses?: number };

// Same spelling rule as the backend ("  kondapur " -> "Kondapur"), so we compare what will be saved.
export const tidyArea = (v: string) => v.trim().replace(/\s+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Number of single-letter edits between two words (Levenshtein distance).
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cur = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
  }
  return row[b.length];
}

// The known area this one is probably a misspelling of (1-2 letters off), if any.
export function closeMatch(area: string, known: AreaInUse[]): AreaInUse | undefined {
  const a = area.toLowerCase();
  const limit = a.length <= 5 ? 1 : 2;
  return known
    .filter((k) => k.area !== area)
    .map((k) => ({ k, d: distance(a, k.area.toLowerCase()) }))
    .filter((x) => x.d <= limit)
    .sort((x, y) => x.d - y.d)[0]?.k;
}

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const describeUse = (k: AreaInUse) =>
  [count(k.technicians, "technician", "technicians"), k.addresses !== undefined && count(k.addresses, "address", "addresses")]
    .filter(Boolean)
    .join(", ");
