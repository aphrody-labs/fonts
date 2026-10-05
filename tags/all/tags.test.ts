import { describe, expect, test } from "bun:test";
import { median, parseCsvLine, pyFloat, pyList, readFamilyTags, stdev } from "./tags.ts";

describe("parseCsvLine", () => {
  test("splits plain fields", () => {
    expect(parseCsvLine("ABeeZee,,/Expressive/Active,10")).toEqual(["ABeeZee", "", "/Expressive/Active", "10"]);
  });
  test("keeps commas inside quoted fields", () => {
    expect(parseCsvLine('Advent Pro,"wdth,wght@100,900",/Expressive/Active,40')).toEqual([
      "Advent Pro",
      "wdth,wght@100,900",
      "/Expressive/Active",
      "40",
    ]);
  });
  test("unescapes doubled quotes", () => {
    expect(parseCsvLine('"a ""b""",c')).toEqual(['a "b"', "c"]);
  });
});

describe("statistics match Python's statistics module", () => {
  test("median of odd and even lists", () => {
    expect(median([1, 2, 3])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });
  test("sample standard deviation", () => {
    // statistics.stdev([2, 4, 4, 4, 5, 5, 7, 9]) == 2.138089935299395
    expect(stdev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138089935299395, 12);
  });
  test("python-style formatting", () => {
    expect(pyFloat(5)).toBe("5.0");
    expect(pyFloat(2.5)).toBe("2.5");
    expect(pyList(["/A", "/B"])).toBe("['/A', '/B']");
  });
});

test("families.csv parses into four-column records", async () => {
  const records = await readFamilyTags();
  expect(records.length).toBeGreaterThan(1000);
  for (const r of records) {
    expect(r.family).not.toBe("");
    expect(r.tag.startsWith("/")).toBe(true);
    expect(Number.isFinite(Number(r.weight))).toBe(true);
  }
});
