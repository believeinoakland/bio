/* The interface's word list (R1–R4; DEC-179; K2200 (4)) at the module's interface: `WORD_ROWS` read against
   `docs/development/ux-substrate/screens/words.json` as PR #19 (DEC-188) merged it (3660c18803), word by word. The file is read
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
  try { return JSON.parse(execFileSync("git", ["show", `3660c18803:${PATH}`], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 24 })); }
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

/* R1's full check, as a list of failures, so a negative control can show it refusing a list that is wrong. */
function r1Failures(rows, file) {
  const out = [];
  const byKey = new Map(file.words.map((w) => [w.key, w]));
  if (rows.length !== 1006) out.push(`rows ${rows.length}, not 1006`);
  if (rows.filter((r) => r[4] === true).length !== 388) out.push("protected count not 388");
  if (new Set(rows.map((r) => r[0])).size !== rows.length) out.push("keys not distinct");
  if (rows.length !== file.words.length) out.push("not one row per word");
  file.words.forEach((f, i) => {
    const want = [f.key, f.en, f.note ?? null, siblingOf(f.key, byKey), f.protected === true];
    try { assert.deepEqual(rows[i], want); } catch { out.push(`row ${i} (${f.key})`); }
  });
  for (const r of rows) {
    if (!Array.isArray(r) || r.length !== 5) { out.push(`${r?.[0]}: not five fields`); continue; }
    if (typeof r[0] !== "string" || typeof r[1] !== "string") out.push(`${r[0]}: key or en not a string`);
    if (!(r[2] === null || typeof r[2] === "string")) out.push(`${r[0]}: note`);
    if (!(r[3] === null || typeof r[3] === "string")) out.push(`${r[0]}: means`);
    if (typeof r[4] !== "boolean") out.push(`${r[0]}: protected`);
  }
  return out;
}

/* The acts DEC-188 (8) retires: the file's rows for them, carried as the file gives them (R2; K2484). */
const RETIRED = /^act\.(accountswitchset|groupswitchset|aiceilingset|aicopyceilingset)\./;
function r2Failures(rows, file) {
  const out = [];
  const want = file.words.filter((w) => RETIRED.test(w.key));
  const got = rows.filter((r) => RETIRED.test(r[0]));
  if (got.length !== want.length) out.push(`retired rows ${got.length}, file ${want.length}`);
  for (const w of want) {
    const r = rows.find((x) => x[0] === w.key);
    if (!r) out.push(`${w.key} missing`);
    else if (r[1] !== w.en || r[4] !== (w.protected === true) || r[2] !== (w.note ?? null)) out.push(`${w.key} not as given`);
  }
  return out;
}

test("R1 R2 WORD_ROWS equals words.json at WORDS_COMMIT 3660c18803 (PR #19, DEC-188) word by word: 1,006 rows, 388 protected, in the file's order, keys distinct, each [key, en, note, means, protected] with key, en, protected and note (or null) as the file gives them and means the en of its sibling .means or .does entry, or null", () => {
  const file = theFile();
  const byKey = new Map(file.words.map((w) => [w.key, w]));
  assert.equal(WORDS_COMMIT, "3660c18803");
  assert.equal(file.counts.total, 1006);
  assert.equal(file.counts.protected, 388);
  assert.equal(file.words.length, 1006);
  assert.equal(file.words.filter((w) => w.protected === true).length, 388);
  assert.deepEqual(r1Failures(WORD_ROWS, file), []);
  /* the readings the sibling rule gives, by example */
  const at = (k) => WORD_ROWS.find((r) => r[0] === k);
  assert.equal(at("weight.reversible.name")[3], byKey.get("weight.reversible.means").en);
  assert.equal(at("act.publish.label.ceremony")[3], byKey.get("act.publish.does").en);
  assert.equal(at("weight.reversible.means")[3], null);
  assert.equal(at("act.publish.does")[3], null);
  assert.equal(at("state.undetermined")[2], "the reason always follows");
  assert.equal(at("state.empty")[2], null);
});

test("R1 negative control: the check refuses a list that differs from the file in one word, its order, a count, a note, a means or a protected mark, and the list at the earlier commit", () => {
  const file = theFile();
  const rows = WORD_ROWS.map((r) => [...r]);
  const swap = (f) => { const c = rows.map((r) => [...r]); f(c); return c; };
  assert.notDeepEqual(r1Failures(swap((c) => { c[3][1] = c[3][1] + "!"; }), file), []);
  assert.notDeepEqual(r1Failures(swap((c) => { [c[0], c[1]] = [c[1], c[0]]; }), file), []);
  assert.notDeepEqual(r1Failures(swap((c) => { c.pop(); }), file), []);
  assert.notDeepEqual(r1Failures(swap((c) => { c.push([...c[0]]); }), file), []);
  const noted = rows.findIndex((r) => r[2] !== null);
  assert.notDeepEqual(r1Failures(swap((c) => { c[noted][2] = null; }), file), []);
  const meant = rows.findIndex((r) => r[3] !== null);
  assert.notDeepEqual(r1Failures(swap((c) => { c[meant][3] = null; }), file), []);
  assert.notDeepEqual(r1Failures(swap((c) => { c[0][4] = !c[0][4]; }), file), []);
  /* the list frozen at the earlier commit (e08cd35ecb: 921 rows, 345 protected) is not this one */
  let earlier;
  try { earlier = JSON.parse(execFileSync("git", ["show", `e08cd35ecb:${PATH}`], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 24 })); } catch {}
  if (earlier) {
    const eByKey = new Map(earlier.words.map((w) => [w.key, w]));
    const old = earlier.words.map((w) => [w.key, w.en, w.note ?? null, siblingOf(w.key, eByKey), w.protected === true]);
    assert.equal(old.length, 921);
    assert.notDeepEqual(r1Failures(old, file), []);
  }
});

test("R2 WORDS_COMMIT is \"3660c18803\", the commit R1's file is read at; the file's rows for the acts DEC-188 (8) retires (act.accountswitchset.*, act.groupswitchset.*, act.aiceilingset.*, act.aicopyceilingset.*) are carried as the file gives them, not re-keyed; negative control: a list with one re-keyed or dropped refuses", () => {
  assert.equal(WORDS_COMMIT, "3660c18803");
  assert.equal(typeof WORDS_COMMIT, "string");
  const file = theFile();
  const given = file.words.filter((w) => RETIRED.test(w.key)).map((w) => w.key).sort();
  assert.deepEqual(given, ["act.accountswitchset.does", "act.aiceilingset.does", "act.aicopyceilingset.does", "act.groupswitchset.does"]);
  assert.deepEqual(r2Failures(WORD_ROWS, file), []);
  /* negative controls: one re-keyed to its successor, one dropped, one re-worded */
  const rekeyed = WORD_ROWS.map((r) => (r[0] === "act.accountswitchset.does" ? ["act.accountusesset.does", ...r.slice(1)] : r));
  assert.notDeepEqual(r2Failures(rekeyed, file), []);
  assert.notDeepEqual(r2Failures(WORD_ROWS.filter((r) => r[0] !== "act.aiceilingset.does"), file), []);
  const reworded = WORD_ROWS.map((r) => (r[0] === "act.groupswitchset.does" ? [r[0], "changed", ...r.slice(2)] : r));
  assert.notDeepEqual(r2Failures(reworded, file), []);
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
  assert.equal(WORD_ROWS.length, 1006);
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
