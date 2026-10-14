/* The module's words (interface-shell R5): every key its parts name is a word the page carries (R1, R2). */
import test from "node:test";
import assert from "node:assert/strict";
import { SCREENS, GUIDE, SCREEN_WORDS } from "../../../src/screens-wizards/index.mjs";
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
import { readFileSync } from "node:fs";

const HELD = new Set(WORD_ROWS.map((r) => r[0]));
const OWN = new Set(SCREEN_WORDS.map((r) => r[0]));

test("R1 R2 each word the library and the guide draw is a WORD_ROWS key or the module's own row, and every own row is drawn", () => {
  assert.equal(OWN.size, SCREEN_WORDS.length, "own keys are distinct");
  for (const r of SCREEN_WORDS) assert.ok(Array.isArray(r) && r.length === 3 && typeof r[1] === "string" && r[1] && typeof r[2] === "boolean", r[0]);
  for (const part of [...SCREENS, GUIDE]) for (const x of part.words) {
    const k = Array.isArray(x) ? x[0] : x;
    assert.ok(HELD.has(k) || OWN.has(k), `${part.id}: ${k}`);
  }
  // every key the source names literally is listed by its part
  const listed = new Set([...SCREENS, GUIDE].flatMap((p) => p.words.map((x) => (Array.isArray(x) ? x[0] : x))));
  for (const f of ["library.mjs", "guide.mjs"]) {
    const src = readFileSync(new URL(`../../../src/screens-wizards/${f}`, import.meta.url), "utf8");
    for (const m of src.matchAll(/"((?:screen\.(?:wizards|guide)|guide|ai\.label)\.[\w.]+)"/g)) assert.ok(listed.has(m[1]) || m[1].endsWith("."), `${f}: ${m[1]}`);
  }
  // R2: Civicsmith's step words are carried for every library script
  assert.ok([...listed].some((k) => /^wizard\.WIZ-[0-9a-f]+\.step1\.what$/.test(k)));
});
