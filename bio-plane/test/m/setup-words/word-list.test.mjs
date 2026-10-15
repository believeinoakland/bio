/* The interface's word list at the module's interface (R3, R4, R10–R13; DEC-179, DEC-257; K3366). `WORD_ROWS` is read
   against `docs/development/ux-substrate/screens/words.json` as it stands in the tree, word by word, with R1's rule
   stated here independently of the generator. Nothing here pins a commit, a count or a key: the file is the contract. */
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import * as words from "../../../src/setup-words/index.mjs";
import { WORD_ROWS, WORDS_COMMIT, word, hasWord } from "../../../src/setup-words/index.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const SOURCE = join(ROOT, "bio-plane/src/setup-words/index.mjs");
const BUILD = join(ROOT, "bio-plane/src/setup-words/build.mjs");
const FILE = join(ROOT, "docs/development/ux-substrate/screens/words.json");
const bytes = readFileSync(FILE);
const file = JSON.parse(bytes.toString("utf8"));

/* The sibling a word's meaning is read from: the nearest dotted prefix (at least two segments) holding a `.means` or
   `.does` entry other than the word itself; none for a `.means`/`.does` entry. */
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

/* R10's full check, as a list of failures, so a control can show it refusing a list that is wrong. */
function failures(rows, f) {
  const out = [];
  const byKey = new Map(f.words.map((w) => [w.key, w]));
  if (rows.length !== f.words.length) out.push(`rows ${rows.length}, file ${f.words.length}`);
  if (new Set(rows.map((r) => r[0])).size !== rows.length) out.push("keys not distinct");
  f.words.forEach((w, i) => {
    const want = [w.key, w.en, w.note ?? null, siblingOf(w.key, byKey), w.protected === true];
    try { assert.deepEqual(rows[i], want); } catch { out.push(`row ${i} (${w.key})`); }
  });
  return out;
}

const run = (...args) => {
  try { return { code: 0, out: execFileSync("node", [BUILD, ...args], { cwd: ROOT, encoding: "utf8", stdio: "pipe" }) }; }
  catch (e) { return { code: e.status, out: `${e.stdout}${e.stderr}` }; }
};

test("R10 WORD_ROWS equals words.json in the tree word by word: one row per word of the file, in its order, keys distinct, each [key, en, note, means, protected] with key, en, protected and note (or null) as the file gives them and means the en of its sibling .means or .does entry, or null", () => {
  assert.ok(file.words.length > 0);
  assert.deepEqual(failures(WORD_ROWS, file), []);
  assert.equal(WORD_ROWS.length, file.counts.total);
  assert.equal(WORD_ROWS.filter((r) => r[4]).length, file.counts.protected);
  WORD_ROWS.forEach((r) => {
    assert.equal(r.length, 5);
    assert.equal(typeof r[0], "string");
    assert.equal(typeof r[1], "string");
    assert.ok(r[2] === null || typeof r[2] === "string");
    assert.ok(r[3] === null || typeof r[3] === "string");
    assert.equal(typeof r[4], "boolean");
  });
  /* the sibling rule by example */
  const at = (k) => WORD_ROWS.find((r) => r[0] === k);
  assert.equal(at("weight.reversible.name")[3], at("weight.reversible.means")[1]);
  assert.equal(at("act.publish.label.ceremony")[3], at("act.publish.does")[1]);
  assert.equal(at("weight.reversible.means")[3], null);
  assert.equal(at("act.publish.does")[3], null);
  assert.equal(at("state.undetermined")[2], "the reason always follows");
  assert.equal(at("state.empty")[2], null);
});

test("R10 WORDS_COMMIT is the first 10 hex digits of the SHA-256 of the file's bytes, the list's version; the generator's --check passes on the tree", () => {
  assert.equal(WORDS_COMMIT, createHash("sha256").update(bytes).digest("hex").slice(0, 10));
  assert.match(WORDS_COMMIT, /^[0-9a-f]{10}$/);
  const r = run("--check");
  assert.equal(r.code, 0, r.out);
});

test("R10 control: a fixture file with one en changed makes --check fail, naming the first difference; so does one with a key dropped, one with a protected mark flipped, and one with a repeated key; the check refuses a list that differs in one word, its order, a count, a note, a means or a protected mark", () => {
  const dir = mkdtempSync(join(tmpdir(), "setup-words-"));
  try {
    const variant = (name, edit) => {
      const f = structuredClone(file);
      edit(f);
      const p = join(dir, name);
      writeFileSync(p, JSON.stringify(f));
      return p;
    };
    const rows = join(ROOT, "bio-plane/src/setup-words/rows.mjs");
    const changed = variant("en.json", (f) => { f.words[3].en += "!"; });
    const r = run("--check", "--words", changed, "--out", rows);
    assert.notEqual(r.code, 0);
    assert.match(r.out, /stale: word \d+/);
    assert.match(r.out, new RegExp(file.words[3].key.replace(/\./g, "\\.")), "names the word that differs");
    assert.notEqual(run("--check", "--words", variant("drop.json", (f) => { f.words.pop(); }), "--out", rows).code, 0);
    assert.notEqual(run("--check", "--words", variant("prot.json", (f) => { f.words[0].protected = !f.words[0].protected; }), "--out", rows).code, 0);
    const dup = run("--check", "--words", variant("dup.json", (f) => { f.words[1].key = f.words[0].key; }), "--out", rows);
    assert.notEqual(dup.code, 0);
    assert.match(dup.out, /not distinct/);
    assert.notEqual(run("--check", "--words", changed, "--out", join(dir, "absent.mjs")).code, 0);
    /* the writing form, over the fixture, agrees with the check */
    const out = join(dir, "rows.mjs");
    assert.equal(run("--words", changed, "--out", out).code, 0);
    assert.equal(run("--check", "--words", changed, "--out", out).code, 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
  const swap = (f) => { const c = WORD_ROWS.map((r) => [...r]); f(c); return c; };
  assert.notDeepEqual(failures(swap((c) => { c[3][1] += "!"; }), file), []);
  assert.notDeepEqual(failures(swap((c) => { [c[0], c[1]] = [c[1], c[0]]; }), file), []);
  assert.notDeepEqual(failures(swap((c) => { c.pop(); }), file), []);
  assert.notDeepEqual(failures(swap((c) => { c.push([...c[0]]); }), file), []);
  const noted = WORD_ROWS.findIndex((r) => r[2] !== null);
  assert.notDeepEqual(failures(swap((c) => { c[noted][2] = null; }), file), []);
  const meant = WORD_ROWS.findIndex((r) => r[3] !== null);
  assert.notDeepEqual(failures(swap((c) => { c[meant][3] = null; }), file), []);
  assert.notDeepEqual(failures(swap((c) => { c[0][4] = !c[0][4]; }), file), []);
});

test("R3 WORD_ROWS and each of its rows are frozen: no write changes the list, a row or a field", () => {
  "use strict";
  assert.ok(Object.isFrozen(WORD_ROWS));
  WORD_ROWS.forEach((r) => assert.ok(Object.isFrozen(r), r[0]));
  const first = JSON.stringify(WORD_ROWS[0]);
  const n = WORD_ROWS.length;
  assert.throws(() => { WORD_ROWS.push(["x", "x", null, null, false]); }, TypeError);
  assert.throws(() => { WORD_ROWS[0] = ["x", "x", null, null, false]; }, TypeError);
  assert.throws(() => { WORD_ROWS.length = 0; }, TypeError);
  assert.throws(() => { WORD_ROWS.sort(); }, TypeError);
  assert.throws(() => { WORD_ROWS[0][1] = "changed"; }, TypeError);
  assert.throws(() => { WORD_ROWS[0][4] = !WORD_ROWS[0][4]; }, TypeError);
  assert.throws(() => { WORD_ROWS[0].push("extra"); }, TypeError);
  assert.throws(() => { WORD_ROWS.at(-1).length = 0; }, TypeError);
  assert.equal(WORD_ROWS.length, n);
  assert.equal(JSON.stringify(WORD_ROWS[0]), first);
});

test("R4 the module does nothing when loaded beyond defining its exports and imports only its own generated list: its exports are exactly WORDS_COMMIT, WORD_ROWS, hasWord and word; its code never imports the generator or any other module; every load answers the same", async () => {
  const code = readFileSync(SOURCE, "utf8")
    .replace(/\/\*[^]*?\*\//g, " ")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""');
  const imports = [...code.matchAll(/\bimport\b[^;]*;/g)].map((m) => m[0]);
  assert.equal(imports.length, 1);
  assert.match(readFileSync(SOURCE, "utf8"), /import \{ WORD_ROWS, WORDS_COMMIT \} from "\.\/rows\.mjs";/);
  assert.doesNotMatch(code, /\brequire\b|build\.mjs|\bprocess\b|\bDate\b|\bMath\b|\bfetch\b|\bsetTimeout\b/);
  assert.deepEqual(Object.keys(words).sort(), ["WORDS_COMMIT", "WORD_ROWS", "hasWord", "word"]);
  const again = await import(`${pathToFileURL(SOURCE).href}?again`);
  assert.equal(again.WORDS_COMMIT, WORDS_COMMIT);
  assert.deepEqual(again.WORD_ROWS, WORD_ROWS);
  assert.equal(again.word("weight.reversible.name"), word("weight.reversible.name"));
});

/* two placeholders, one placeholder, and none, read from the file itself, not from a hand list */
const placeholders = (en) => [...new Set([...en.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((m) => m[1]))];
const two = WORD_ROWS.find((r) => placeholders(r[1]).length >= 2);
const one = WORD_ROWS.find((r) => placeholders(r[1]).length === 1);
const none = WORD_ROWS.find((r) => placeholders(r[1]).length === 0);

test("R11 word(key, vars) returns the English of key with each {name} placeholder filled by vars[name], a string or a number as String gives it; a word with two placeholders is filled, a word with none is returned as the list holds it", () => {
  assert.ok(two && one && none, "the file holds words of each kind");
  const [a, b] = placeholders(two[1]);
  const filled = word(two[0], { [a]: "Ada", [b]: 42 });
  assert.equal(filled, two[1].split(`{${a}}`).join("Ada").split(`{${b}}`).join("42"));
  assert.doesNotMatch(filled, /\{[A-Za-z0-9_]+\}/);
  assert.equal(word(one[0], { [placeholders(one[1])[0]]: 0 }), one[1].split(`{${placeholders(one[1])[0]}}`).join("0"));
  assert.equal(word(none[0]), none[1]);
  assert.equal(word(none[0], {}), none[1]);
  /* a name the English does not hold is ignored; a value is written as String gives it, braces in it left alone */
  assert.equal(word(none[0], { extra: "x" }), none[1]);
  const [n] = placeholders(one[1]);
  assert.equal(word(one[0], { [n]: "{other}", extra: 1 }), one[1].split(`{${n}}`).join("{other}"));
  /* a placeholder repeated in one sentence is filled everywhere */
  const rep = WORD_ROWS.find((r) => [...r[1].matchAll(/\{([A-Za-z0-9_]+)\}/g)].length > placeholders(r[1]).length);
  if (rep) assert.doesNotMatch(word(rep[0], Object.fromEntries(placeholders(rep[1]).map((p) => [p, "v"]))), /\{[A-Za-z0-9_]+\}/);
  /* every word of the list is returned whole when its placeholders are given */
  for (const r of WORD_ROWS) {
    const vars = Object.fromEntries(placeholders(r[1]).map((p) => [p, `<${p}>`]));
    assert.equal(word(r[0], vars), r[1].replace(/\{([A-Za-z0-9_]+)\}/g, (_, p) => `<${p}>`), r[0]);
  }
});

test("R11 control: an unknown key throws UNKNOWN_WORD naming the key; a missing placeholder throws WORD_VAR_MISSING naming the key and the placeholder; neither falls back to the key, another word or an empty string", () => {
  assert.throws(() => word("no.such.word"), (e) => e.code === "UNKNOWN_WORD" && /no\.such\.word/.test(e.message));
  assert.throws(() => word(""), (e) => e.code === "UNKNOWN_WORD");
  assert.throws(() => word(undefined), (e) => e.code === "UNKNOWN_WORD");
  assert.throws(() => word("constructor"), (e) => e.code === "UNKNOWN_WORD");
  assert.throws(() => word("__proto__"), (e) => e.code === "UNKNOWN_WORD");
  const [a, b] = placeholders(two[1]);
  for (const vars of [undefined, {}, { [b]: "x" }, { [a]: undefined, [b]: "x" }, { [a]: null, [b]: "x" }]) {
    assert.throws(() => word(two[0], vars), (e) => e.code === "WORD_VAR_MISSING" && e.message.includes(two[0]) && e.message.includes(`{${a}}`), JSON.stringify(vars));
  }
  assert.throws(() => word(two[0], { [a]: "x" }), (e) => e.code === "WORD_VAR_MISSING" && e.message.includes(`{${b}}`));
  /* an inherited property is not a value */
  assert.throws(() => word(two[0], Object.create({ [a]: "x", [b]: "y" })), (e) => e.code === "WORD_VAR_MISSING");
  assert.throws(() => word(one[0], { toString: "x" }), (e) => e.code === "WORD_VAR_MISSING");
});

test("R12 hasWord(key) is true exactly when the list holds key: every key of the list, and none that is not", () => {
  for (const r of WORD_ROWS) assert.equal(hasWord(r[0]), true, r[0]);
  for (const k of ["no.such.word", "", "weight.reversible", "WEIGHT.REVERSIBLE.NAME", "constructor", "__proto__", "toString", undefined, null, 7])
    assert.equal(hasWord(k), false, String(k));
  assert.equal(hasWord(WORD_ROWS[0][0]), true);
  assert.equal(hasWord(`${WORD_ROWS[0][0]} `), false);
});

test("R13 the keys-only rule at this module's interface: a sentence is read through word from the list and only from it, so every key of the list answers its English filled, an unknown key never answers a sentence, and the list holds no key whose English is empty, so a module holding keys alone has a sentence to show", () => {
  for (const r of WORD_ROWS) {
    assert.ok(r[1].length > 0, r[0]);
    assert.ok(hasWord(r[0]));
    assert.notEqual(r[1], r[0], `${r[0]}: the English is not the key`);
  }
  for (const k of ["not.a.key", "weight.reversible.nam"]) {
    assert.equal(hasWord(k), false);
    assert.throws(() => word(k), (e) => e.code === "UNKNOWN_WORD");
  }
  /* placeholders are {name} with name of letters, digits and _, and no other brace form occurs in the file (measured at T49) */
  for (const r of WORD_ROWS) assert.doesNotMatch(r[1].replace(/\{[A-Za-z0-9_]+\}/g, ""), /[{}]/, r[0]);
  /* DEC-221 (N1068): the file's English spells "labeled" */
  assert.deepEqual(WORD_ROWS.filter((r) => /labelled/i.test(r[1])).map((r) => r[0]), []);
  assert.equal(hasWord("signin.founderhint"), WORD_ROWS.some((r) => r[0] === "signin.founderhint"));
});

test("R2 R5 R6 R7 R8 (their pinned commits and counts retired by R10): WORDS_COMMIT is no earlier pinned commit but the version of the file in the tree, and WORD_ROWS moves with the file, so no earlier list or count is kept; control: no row's en holds \"labelled\" (R8) and a list with one en re-spelled refuses", () => {
  for (const pinned of ["3660c18803", "e08cd35ecb", "3f40899950", "a0fab7abf0", "6f0d88d8d5", "4664e8efd4", "f498560a37"])
    assert.notEqual(WORDS_COMMIT, pinned);
  assert.equal(WORDS_COMMIT, createHash("sha256").update(bytes).digest("hex").slice(0, 10));
  assert.equal(WORD_ROWS.length, file.words.length);
  assert.deepEqual(WORD_ROWS.filter((r) => /labelled/i.test(r[1])).map((r) => r[0]), []);
  const i = WORD_ROWS.findIndex((r) => /labeled/.test(r[1]));
  if (i >= 0) {
    const old = WORD_ROWS.map((r, j) => (j === i ? [r[0], r[1].replace("labeled", "labelled"), ...r.slice(2)] : r));
    assert.notDeepEqual(failures(old, file), []);
  }
});
