// Shared helpers for the tags/all tooling (Bun).
//
// families.csv has no header row; its columns are:
//   Family, Axes (optionally quoted, e.g. "wdth,wght@100,900"), Group/Tag, Weight

export interface TagRecord {
  family: string;
  axes: string;
  tag: string;
  weight: string;
}

/** Parse one CSV line, honouring double-quoted fields and "" escapes. */
export function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      fields.push(field);
      field = "";
    } else {
      field += ch;
    }
  }
  fields.push(field);
  return fields;
}

export async function readFamilyTags(path = `${import.meta.dir}/families.csv`): Promise<TagRecord[]> {
  const text = await Bun.file(path).text();
  const records: TagRecord[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (line.trim() === "") continue;
    const [family = "", axes = "", tag = "", weight = ""] = parseCsvLine(line);
    // Tolerate an optional header row.
    if (family === "Family" && tag === "Group/Tag") continue;
    records.push({ family, axes, tag, weight });
  }
  return records;
}

export function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Median of an ascending-sorted list (same semantics as Python's statistics.median). */
export function median(sorted: number[]): number {
  const n = sorted.length;
  if (n === 0) throw new Error("median of empty data");
  const mid = Math.floor(n / 2);
  return n % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/** Sample standard deviation (same semantics as Python's statistics.stdev). */
export function stdev(values: number[]): number {
  if (values.length < 2) throw new Error("stdev requires at least two data points");
  const m = mean(values);
  const sq = values.reduce((acc, v) => acc + (v - m) ** 2, 0);
  return Math.sqrt(sq / (values.length - 1));
}

/** Format a float the way Python prints it (5 -> "5.0"). */
export function pyFloat(value: number): string {
  return Number.isInteger(value) ? value.toFixed(1) : String(value);
}

/** Format a list of strings the way Python prints a list (['a', 'b']). */
export function pyList(items: string[]): string {
  const repr = (s: string) => (s.includes("'") && !s.includes('"') ? `"${s}"` : `'${s.replaceAll("'", "\\'")}'`);
  return `[${items.map(repr).join(", ")}]`;
}
