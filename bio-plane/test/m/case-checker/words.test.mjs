/* case-checker: the checker's words by key (R27; T51-151; N1222, K3725, K3930, K3949), at the interface: every sentence a reader
   of a result reads is `word(key)` or `localize(id, en)` of `setup-words`, the standalone program reads the same rows as data,
   and the library and the program answer the same bytes. No test here holds a sentence's text (K3810): it compares keys,
   fills and bytes, and reads each expected sentence from the word table or from the call that writes it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as CC from "../../../src/case-checker/index.mjs";
import { buildProgram } from "../../../src/case-checker/build-program.mjs";
import { callsOf } from "../../../src/setup-words/build.mjs";
import { wordKeysOf } from "../../../scripts/fleet-bundle.mjs";
import { parse } from "../../../src/setup-words/vendor/acorn.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";
import { allCases, libraryAnswer, keyLines, BAD_PARTS } from "./battery.mjs";
import { like, sentenceOf, W } from "./fixture.mjs";
import { WORD_ROWS } from "../../../src/setup-words/rows.mjs";
const TABLE = new Map(WORD_ROWS.map((r) => [r[0], r[1]]));

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "..", "..", "..", "src", "case-checker");
/* the files whose sentences a reader of an answer reads (R27); `spec.mjs` is the specification of a format, a public document (reported) */
const READ = ["account.mjs", "check.mjs", "index.mjs", "lens.mjs", "main.mjs", "standards.mjs", "zip.mjs"];
const FIVE = ["check.mjs", "account.mjs", "lens.mjs", "zip.mjs", "index.mjs"];
const placeholders = (text) => [...text.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((m) => m[1]);

/* the files of the standalone program (`index.mjs` serves the public reads in the library and is not in it) */
const PROGRAM = READ.filter((f) => f !== "index.mjs");

/** Every key the source reads: `{key, en}`, `en` the sentence of a `localize` call and null for a key read by `word`. */
function keysRead(files = READ) {
  const out = new Map();
  for (const f of files) {
    const source = readFileSync(join(SRC, f), "utf8");
    for (const c of callsOf(source, f)) out.set(c.id, { key: c.id, en: c.en });
    for (const key of wordKeysOf(source, f).exact) if (!out.has(key)) out.set(key, { key, en: null });
  }
  return [...out.values()].sort((a, b) => (a.key < b.key ? -1 : 1));
}

/* The calls of `word(` and `localize(` in one source, by acorn: the key, and the names of the fills when they are an object literal
   (null when they are not, as the relay of a departure's own `says`). */
function callsIn(source) {
  const ast = parse(source, { ecmaVersion: "latest", sourceType: "module" });
  const out = [];
  const visit = (n) => {
    if (!n || typeof n.type !== "string") return;
    if (n.type === "CallExpression" && n.callee.type === "Identifier" && (n.callee.name === "word" || n.callee.name === "localize")) {
      const [k, a, b] = n.arguments;
      const vars = n.callee.name === "word" ? a : b;
      const key = k && k.type === "Literal" && typeof k.value === "string" ? k.value : null;
      const names = vars === undefined ? [] : vars.type === "ObjectExpression" && vars.properties.every((p) => p.type === "Property" && !p.computed)
        ? vars.properties.map((p) => (p.key.type === "Identifier" ? p.key.name : String(p.key.value))) : null;
      out.push({ key, vars: names });
    }
    for (const k of Object.keys(n)) { const v = n[k]; if (Array.isArray(v)) v.forEach(visit); else if (v && typeof v.type === "string") visit(v); }
  };
  visit(ast);
  return out;
}

test("R27: every key the source reads is a row of the word table or a localize call's own sentence, and a key read by word() has its row in the table", () => {
  const keys = keysRead();
  assert.ok(keys.length > 100, `${keys.length} keys`);
  for (const { key, en } of keys) {
    if (en === null) assert.doesNotThrow(() => sentenceOf(key), `${key} is read by word() and the word table has no row for it`);
    assert.ok(sentenceOf(key).length > 0, key);
  }
  /* R26's four keys among them (main.mjs relays a departure's own key, so they are named by the codes) */
  for (const k of CC.STANDARDS_USE_KEYS) assert.doesNotThrow(() => sentenceOf(k), k);
  /* control: a key that nothing writes has no sentence */
  assert.throws(() => sentenceOf("case-checker.nothing.writes.this"), /no sentence/);
});

test("R27: each call's fills are exactly the placeholders of its sentence, in every file of the source: nothing a sentence names is left unfilled, nothing is filled that no sentence names", () => {
  let seen = 0;
  for (const f of READ) {
    for (const c of callsIn(readFileSync(join(SRC, f), "utf8"))) {
      if (c.key === null || c.vars === null) continue;    /* the relay of a departure's own says (main.mjs), whose vars are R26's */
      assert.deepEqual([...new Set(c.vars)].sort(), [...new Set(placeholders(sentenceOf(c.key)))].sort(), `${f}: ${c.key}`);
      seen++;
    }
  }
  assert.ok(seen > 150, `${seen} calls checked`);
});

test("R27 (control): the five files hold no English string literal that reaches an answer outside word() and localize(): every run of three words or more is a call's own", () => {
  const found = [];
  for (const f of FIVE) {
    const ast = parse(readFileSync(join(SRC, f), "utf8"), { ecmaVersion: "latest", sourceType: "module", locations: true });
    const visit = (n, parent) => {
      if (!n || typeof n.type !== "string") return;
      const texts = n.type === "Literal" && typeof n.value === "string" ? [n.value]
        : n.type === "TemplateLiteral" ? n.quasis.map((q) => q.value.cooked) : [];
      const own = parent && parent.type === "CallExpression" && parent.callee.type === "Identifier" && ["word", "localize"].includes(parent.callee.name)
        && (parent.arguments[0] === n || parent.arguments[1] === n);
      const key = parent && parent.type === "Property" && parent.key === n && !parent.computed;
      const load = parent && (parent.type === "ImportDeclaration" || parent.type === "ExportNamedDeclaration" || parent.type === "ExportAllDeclaration");
      if (!own && !key && !load) for (const t of texts)
        if (t.trim().split(/\s+/).filter((w) => /^[A-Za-z][A-Za-z'’-]*[.,;:]?$/.test(w)).length >= 3) found.push(`${f}:${n.loc.start.line} ${JSON.stringify(t.slice(0, 60))}`);
      for (const k of Object.keys(n)) { const v = n[k]; if (Array.isArray(v)) v.forEach((c) => visit(c, n)); else if (v && typeof v.type === "string") visit(v, n); }
    };
    visit(ast, null);
  }
  assert.deepEqual(found, []);
});

/* Keys no fixture can reach through the interface: each answers a contract this module defends and its provider keeps. */
const DEFENSIVE = Object.freeze({
  "case-checker.detail.checker_render_complete": "case-grammar completeEditionOf always answers a page, so the rendering is never missing",
  "case-checker.check.grade_not_recomputed": "strength recomputePair answers RECOMPUTE_FAILED only for an exception its own code does not raise on any leg the facts can state",
});

test("R27: a fixture of the battery reaches each key the source reads, through the interface, but the keys defended against a provider's broken contract", () => {
  const r = spawnSync(process.execPath, ["--import", join(HERE, "trace-register.mjs"), join(HERE, "battery.mjs"), "--battery"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  assert.equal(r.status, 0, r.stderr);
  const { reached, cases } = JSON.parse(r.stdout.slice(r.stdout.indexOf("{")));
  assert.ok(cases > 80, `${cases} cases`);
  const mine = keysRead().map((x) => x.key);
  assert.deepEqual(mine.filter((k) => !reached.includes(k) && !Object.hasOwn(DEFENSIVE, k)), []);
  /* control: a key the list defends is really not reached, so the list hides no fixture that does reach it */
  for (const k of Object.keys(DEFENSIVE)) { assert.ok(mine.includes(k), k); assert.equal(reached.includes(k), false, k); }
});

test("R27 R16: the program carries the sentence of each key it reads, and for every case of the battery the library and the program answer the same bytes", async () => {
  const built = await buildProgram();
  /* the program carries each sentence: its text, between the placeholders, is in the bundle (a row of the word table, or the call's own) */
  for (const { key } of keysRead(PROGRAM)) for (const piece of sentenceOf(key).split(/\{[A-Za-z0-9_]+\}/).filter((p) => p.length > 6 && /^[\x20-\x7e]+$/.test(p) && !/["\\]/.test(p)))
    assert.ok(built.text.includes(piece), `${key}: the program lacks "${piece}"`);
  const dir = mkdtempSync(join(tmpdir(), "case-checker-words-"));
  try {
    writeFileSync(join(dir, "case-checker.mjs"), built.text);
    let n = 0;
    for (const c of allCases()) {
      const argv = [];
      c.parts.forEach((p, i) => { writeFileSync(join(dir, `part${i + 1}.zip`), p); argv.push(`part${i + 1}.zip`); });
      const docs = (c.args.documents ?? []).filter((d) => d instanceof Uint8Array);
      docs.forEach((d, i) => { writeFileSync(join(dir, `doc${i}`), d); argv.push("--document", `doc${i}`); });
      const keys = keyLines(c);
      if (keys) { writeFileSync(join(dir, "keys.txt"), `${keys.join("\n")}\n`); argv.push("--keys", "keys.txt"); }
      if (c.args.lens !== undefined) {
        if (c.args.lens === "removed" || c.args.lens === "as_published") argv.push("--lens", c.args.lens);
        else { writeFileSync(join(dir, "lens.json"), JSON.stringify(c.args.lens)); argv.push("--lens", "lens.json"); }
      }
      const out = execFileSync(process.execPath, ["case-checker.mjs", ...argv], { cwd: dir, encoding: "utf8", env: { PATH: process.env.PATH } });
      const expected = await libraryAnswer({ ...c, args: { ...c.args, documents: docs } });
      assert.equal(canonicalJson(JSON.parse(out.slice(out.indexOf("\n{") + 1))), canonicalJson(expected), c.name);
      n++;
    }
    assert.ok(n > 80, `${n} cases`);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("R27 (control): every part that is no stored ZIP this checker reads is named by its own problem, whose sentence is a key of the source", () => {
  const rowKeys = { "not bytes": "case-checker.problem.part_bytes", "not a ZIP": "case-checker.problem.part_zip_archive",
    "a central directory outside the archive": "case-checker.problem.part_central_directory", "a central directory cut short": "case-checker.problem.part_central_directory_cut",
    "a name twice": "case-checker.push.part_names_twice", "an encrypted entry": "case-checker.zip.encrypted", "a compressed entry": "case-checker.push.compressed_case_file",
    "an entry with no local header": "case-checker.push.local_header", "an entry cut short": "case-checker.push.cut_short", "an entry that fails its CRC": "case-checker.zip.crc_fails" };
  const prefix = W("case-checker.check.part_given_problem", { given: 1, problem: "" });
  for (const [name, part] of Object.entries(BAD_PARTS())) {
    const departures = CC.readCaseFile([part]).departures;
    assert.ok(departures.some((d) => d.startsWith(prefix) && like(rowKeys[name], { name: "a.txt" }).test(d.slice(prefix.length))), `${name}: ${departures.join(" | ")}`);
  }
});

test("R27 (K4024, K4027): the program carries the words of case-grammar's manifest reasons, and answers a manifest fault offline with the row's words", async () => {
  const built = await buildProgram();
  const ids = callsOf(readFileSync(join(SRC, "..", "case-grammar", "casefile.mjs"), "utf8"), "casefile.mjs").filter((c) => c.id.startsWith("case-grammar.casefile."));
  assert.ok(ids.length >= 40, `${ids.length} ids`);
  for (const { id, en } of ids) for (const piece of (TABLE.get(id) ?? en).split(/\{[A-Za-z0-9_]+\}/).filter((p) => p.length > 6 && /^[\x20-\x7e]+$/.test(p) && !/["\\]/.test(p)))
    assert.ok(built.text.includes(piece), `${id}: the program lacks "${piece}"`);
  const c = allCases().find((x) => x.name === "a manifest that is not the format");
  const dir = mkdtempSync(join(tmpdir(), "case-checker-manifest-"));
  try {
    writeFileSync(join(dir, "case-checker.mjs"), built.text);
    writeFileSync(join(dir, "p.zip"), c.parts[0]);
    const out = execFileSync(process.execPath, ["case-checker.mjs", "p.zip"], { cwd: dir, encoding: "utf8", env: { PATH: process.env.PATH } });
    const offline = JSON.parse(out.slice(out.indexOf("\n{") + 1)).integrity.departures;
    const library = (await libraryAnswer(c)).integrity.departures;
    assert.ok(library.length > 0);
    assert.deepEqual(offline, library);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
