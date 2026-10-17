/* The module's words (interface-shell R5, R70; R13): it holds keys only, and every key it reads is a word the list holds. */
import test from "node:test";
import assert from "node:assert/strict";
import { SCREENS, GUIDE, SCREEN_WORDS } from "../../../src/screens-wizards/index.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { readFileSync } from "node:fs";

const listed = new Set([...SCREENS, GUIDE].flatMap((p) => p.words));
const READS = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words-reads.json", import.meta.url), "utf8")).modules["screens-wizards"].reads;
/* the keys R15–R17 and R14 name beyond the design merge's list */
const NAMED = ["screen.wizards.own.fold", "screen.wizards.own.says", "wizard.subject.project", "wizard.subject.question", "wizard.subject.document",
  "wizard.subject.none.project", "wizard.subject.none.summary", "refusal.uncatalogued"];

test("R13 each key the module reads is asserted with hasWord and listed by the part that draws it; it holds no row of its own", () => {
  assert.deepEqual([...SCREEN_WORDS], []);
  assert.equal(READS.length, 142, "the design merge's list for it");
  for (const k of [...READS, ...NAMED]) {
    assert.ok(hasWord(k), `${k} is a word the list holds`);
    assert.ok(listed.has(k), `${k} is listed by a part`);
  }
  for (const part of [...SCREENS, GUIDE]) for (const x of part.words) assert.ok(typeof x === "string" && hasWord(x), `${part.id}: ${x}`);
  assert.equal(new Set(READS).size, READS.length);
});

test("R1 R2 R13 every key the source names literally is a held word listed by its part; Civicsmith's step words are carried for every library script", () => {
  for (const f of ["library.mjs", "guide.mjs"]) {
    const src = readFileSync(new URL(`../../../src/screens-wizards/${f}`, import.meta.url), "utf8");
    for (const m of src.matchAll(/"((?:screen\.(?:wizards|guide)|guide|ai\.label|wizard\.(?:subject|marks?|guide)|refusal)\.[\w.]+)"/g)) {
      if (m[1].endsWith(".")) continue;
      assert.ok(hasWord(m[1]) && listed.has(m[1]), `${f}: ${m[1]}`);
    }
  }
  assert.ok([...listed].some((k) => /^wizard\.WIZ-[0-9a-f]+\.step1\.what$/.test(k)));
});
