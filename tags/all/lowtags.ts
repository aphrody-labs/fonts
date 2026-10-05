#!/usr/bin/env bun
/**
 * Lists families with fewer than the median # tags.
 *
 * Pass a # to cutoff at <= that # of tags. By default lists items
 * with < median #tags.
 *
 * Usage:
 *
 *   # list families with < median tags
 *   $ bun lowtags.ts
 *   # list families with 0 tags
 *   $ bun lowtags.ts 0
 */
import { median, pyList, readFamilyTags } from "./tags.ts";

const args = Bun.argv.slice(2);
if (args.length > 1) {
  console.error("Too many args");
  process.exit(1);
}

const records = await readFamilyTags();

const countByFamily = new Map<string, number>();
const tagsByFamily = new Map<string, string[]>();

// we want a result for every public family, even if it's 0 tags
const resp = await fetch("https://fonts.google.com/metadata/fonts");
if (!resp.ok) throw new Error(`metadata request failed: ${resp.status} ${resp.statusText}`);
const metadata = (await resp.json()) as { familyMetadataList: Array<{ family: string }> };
for (const family of metadata.familyMetadataList) {
  countByFamily.set(family.family, 0);
}

for (const r of records) {
  countByFamily.set(r.family, (countByFamily.get(r.family) ?? 0) + 1);
  const tags = tagsByFamily.get(r.family) ?? [];
  tags.push(r.tag);
  tagsByFamily.set(r.family, tags);
}
const counts = [...countByFamily.values()].sort((a, b) => a - b);

let cutoff: number;
if (args.length === 1) {
  cutoff = Number.parseInt(args[0]!, 10);
  if (Number.isNaN(cutoff)) {
    console.error(`invalid cutoff: ${args[0]}`);
    process.exit(1);
  }
} else {
  cutoff = median(counts) - 1;
}

const codepointCompare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
for (const family of [...countByFamily.keys()].sort(codepointCompare)) {
  const count = countByFamily.get(family)!;
  if (count > cutoff) continue;
  console.log(family, count, pyList([...(tagsByFamily.get(family) ?? [])].sort(codepointCompare)));
}
