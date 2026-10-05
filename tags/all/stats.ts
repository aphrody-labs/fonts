#!/usr/bin/env bun
/**
 * Gives basic stats about tags.
 *
 * Usage:
 *
 *   $ bun stats.ts
 *   Num tags 9125
 *   Mean tags  5.086399108138239
 *   Median tags 5.0
 *   Stdev tags 2.474364733745681
 *   Max tags 27
 */
import { mean, median, pyFloat, readFamilyTags, stdev } from "./tags.ts";

const records = await readFamilyTags();

const countByFamily = new Map<string, number>();
for (const r of records) {
  countByFamily.set(r.family, (countByFamily.get(r.family) ?? 0) + 1);
}

const counts = [...countByFamily.values()].sort((a, b) => a - b);

console.log("Num tags", records.length);
console.log("Mean tags ", pyFloat(mean(counts)));
console.log("Median tags", pyFloat(median(counts)));
console.log("Stdev tags", pyFloat(stdev(counts)));
console.log("Max tags", counts.at(-1));
