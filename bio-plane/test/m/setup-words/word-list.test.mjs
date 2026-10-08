/* The interface's word list (R1–R4; DEC-179; K2200 (4)) at the module's interface: `WORD_ROWS` read against
   `docs/development/ux-substrate/screens/words.json` as PR #14 merged it (e08cd35ecb), word by word. The file is read
   from git at that commit, so a later edit of the working copy does not move the list (a later list is carried only by
   a later requirement, R2); when git cannot read it the working copy is read, and the commit's own counts still bind. */
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import * as words from "../../../src/setup-words/index.mjs";
import { WORD_ROWS, WORDS_COMMIT } from "../../../src/setup-words/index.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const SOURCE = join(ROOT, "bio-plane/src/setup-words/index.mjs");
const PATH = "docs/development/ux-substrate/screens/words.json";
function theFile() {
  try { return JSON.parse(execFileSync("git", ["show", `e08cd35ecb:${PATH}`], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 24 })); }
  catch { return JSON.parse(readFileSync(join(ROOT, PATH), "utf8")); }
}

/* The sibling a word's meaning is read from, stated independently of the module: the nearest dotted prefix (at least
   two segments) holding a `.means` or `.does` entry other than the word itself; none for a `.means`/`.does` entry. */
function siblingOf(key, byKey) {
  const s = key.split(".");
  if (s.at(-1) === "means" || s.at(-1) === "does") return null;
  for (let n = s.length - 1; n >= 2; n--)
    for (const end of ["means", "does"]) {
      const k = `${s.slice(0, n).join(".")}.${end}`;
      if (k !== key && byKey.has(k)) return byKey.get(k).en;
    }
  return null;
}

test("R1 R2 WORD_ROWS equals words.json at WORDS_COMMIT e08cd35ecb word by word: 921 rows, 345 protected, in the file's order, keys distinct, each [key, en, note, means, protected] with key, en, protected and note (or null) as the file gives them and means the en of its sibling .means or .does entry, or null", () => {
  const file = theFile();
  const byKey = new Map(file.words.map((w) => [w.key, w]));
  assert.equal(WORDS_COMMIT, "e08cd35ecb");
  assert.equal(WORD_ROWS.length, 921);
  assert.equal(WORD_ROWS.filter((r) => r[4] === true).length, 345);
  assert.equal(file.counts.total, 921);
  assert.equal(file.counts.protected, 345);
  assert.equal(WORD_ROWS.length, file.words.length);
  assert.equal(new Set(WORD_ROWS.map((r) => r[0])).size, 921);
  file.words.forEach((f, i) => {
    assert.deepEqual(WORD_ROWS[i], [f.key, f.en, f.note ?? null, siblingOf(f.key, byKey), f.protected === true], f.key);
  });
  for (const r of WORD_ROWS) {
    assert.equal(r.length, 5, r[0]);
    assert.ok(typeof r[0] === "string" && typeof r[1] === "string", r[0]);
    assert.ok(r[2] === null || typeof r[2] === "string", r[0]);
    assert.ok(r[3] === null || typeof r[3] === "string", r[0]);
    assert.equal(typeof r[4], "boolean", r[0]);
  }
  /* the readings the sibling rule gives, by example */
  const at = (k) => WORD_ROWS.find((r) => r[0] === k);
  assert.equal(at("weight.reversible.name")[3], byKey.get("weight.reversible.means").en);
  assert.equal(at("act.publish.label.ceremony")[3], byKey.get("act.publish.does").en);
  assert.equal(at("weight.reversible.means")[3], null);
  assert.equal(at("act.publish.does")[3], null);
  assert.equal(at("state.undetermined")[2], "the reason always follows");
  assert.equal(at("state.empty")[2], null);
});

test("R2 WORDS_COMMIT names the commit R1's file is read at", () => {
  assert.equal(WORDS_COMMIT, "e08cd35ecb");
  assert.equal(typeof WORDS_COMMIT, "string");
});

test("R3 WORD_ROWS and each of its rows are frozen: no write changes the list, a row or a field", () => {
  "use strict";
  assert.ok(Object.isFrozen(WORD_ROWS));
  WORD_ROWS.forEach((r) => assert.ok(Object.isFrozen(r), r[0]));
  const first = JSON.stringify(WORD_ROWS[0]);
  assert.throws(() => { WORD_ROWS.push(["x", "x", null, null, false]); }, TypeError);
  assert.throws(() => { WORD_ROWS[0] = ["x", "x", null, null, false]; }, TypeError);
  assert.throws(() => { WORD_ROWS.length = 0; }, TypeError);
  assert.throws(() => { WORD_ROWS.sort(); }, TypeError);
  assert.throws(() => { WORD_ROWS[0][1] = "changed"; }, TypeError);
  assert.throws(() => { WORD_ROWS[0][4] = !WORD_ROWS[0][4]; }, TypeError);
  assert.throws(() => { WORD_ROWS[0].push("extra"); }, TypeError);
  assert.throws(() => { WORD_ROWS.at(-1).length = 0; }, TypeError);
  assert.equal(WORD_ROWS.length, 921);
  assert.equal(JSON.stringify(WORD_ROWS[0]), first);
});

test("R4 the module imports nothing and holds no code that decides anything: its source, strings and comments set aside, is only its two frozen exports; it exports exactly WORDS_COMMIT and WORD_ROWS; every load answers the same", async () => {
  const code = readFileSync(SOURCE, "utf8")
    .replace(/\/\*[^]*?\*\//g, " ")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""');
  assert.doesNotMatch(code, /\bimport\b|\brequire\b|\bexport\s*\*|\bfrom\b/);
  const names = new Set(code.match(/[A-Za-z_$][\w$]*/g));
  const allowed = new Set(["export", "const", "WORDS_COMMIT", "WORD_ROWS", "Object", "freeze", "map", "row", "null", "true", "false"]);
  assert.deepEqual([...names].filter((n) => !allowed.has(n)), []);
  assert.deepEqual(Object.keys(words).sort(), ["WORDS_COMMIT", "WORD_ROWS"]);
  const again = await import(`${pathToFileURL(SOURCE).href}?again`);
  assert.equal(again.WORDS_COMMIT, WORDS_COMMIT);
  assert.deepEqual(again.WORD_ROWS, WORD_ROWS);
});
