/* doctypes — requirement-named tests for R37 (a type's own work over a large text is bounded), at the module's
 * interface: the types' `detect` and `parse`, and docprofile's `readText` over the types. Memory is measured in
 * children (./r37-child.mjs) with the old-space heap capped at what the caller holds plus the bound, so garbage cannot
 * lie: a reading that needs more than the bound dies. The real files are the govinfo budget volumes pdf-reader's
 * memory test fetches (fetched once into BIO_FIXTURE_CACHE, default the temporary directory, checked by SHA-256). */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { DOCTYPES } from "../index.mjs";
import { allMatches, flatten } from "../../docprofile/doctypes/index.mjs";
import { readText, flattenText } from "../../docprofile/readtext.mjs";
import { registerDoctype } from "../../docprofile/doctypes/registry.mjs";
import { flatHas, flatCount, flatFirst, flatPrefix, mergedHits, eachLine, lineTable, lineIndex, flatWindows } from "../windows.mjs";
import { sha256Hex, textDigest } from "../sections.mjs";
import { fixtureReadings, answerOf } from "./r37-readings.mjs";
import { parsesOf } from "./r38-readings.mjs";
import { KINDS } from "./r38-texts.mjs";
import { CASES } from "./golden-cases.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const CHILD = here("./r37-child.mjs");
const CHILD38 = here("./r38-child.mjs");
const CACHE = process.env.BIO_FIXTURE_CACHE || path.join(os.tmpdir(), "bio-test-fixtures");
const GOVINFO = (n) => `https://www.govinfo.gov/content/pkg/${n}/pdf/${n}.pdf`;
const BOUND_MB = 16;

/* ------------------------------------------------------------------ the answers are the tranche tip's */

test("R37 every type's detect, and the registry's verdict with the winner's parse, equal the tranche tip's on every fixture", () => {
  const gold = JSON.parse(fs.readFileSync(here("./fixtures/r37-answers.json"), "utf8")).readings;
  const readings = fixtureReadings();
  assert.ok(readings.length >= 150);
  for (const r of readings) assert.deepEqual(answerOf(r), gold[r.id], r.id);
  assert.equal(Object.keys(gold).length, readings.length);
});

/* The windows are the whole text's: every primitive, over texts whose runs of white space, phrases and matches fall on
   the cuts, with windows of a few characters. */
test("R37 the windows give the answers a pass over the whole flattened text gives, whatever the cuts", () => {
  const words = ["alpha", "WHEREAS", "motion was", "made by", "Aye:", "No :", "x", "  ", "\n", "\t\n ", "NOW,", "THEREFORE", "DOES", "ORDAIN", "42", "_"];
  let seed = 7;
  const rnd = (n) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
  const re = /\bWHEREAS\b|\bmotion\s+was\s+made\b|\b(Aye|No)\s*:/gi;
  for (let round = 0; round < 60; round++) {
    let text = "";
    for (let i = 0, n = 20 + rnd(200); i < n; i++) text += words[rnd(words.length)] + (rnd(3) ? " " : "");
    const flat = flatten(text);
    for (const opts of [{ chunk: 1, pad: 24 }, { chunk: 5, pad: 40 }, { chunk: 17, pad: 64 }, { chunk: 64, pad: 64 }, {}]) {
      const g = new RegExp(re.source, re.flags);
      const all = [...flat.matchAll(g)];
      assert.equal(flatCount(text, re, Infinity, opts), all.length, JSON.stringify([text, opts]));
      assert.equal(flatHas(text, /\bmotion\s+was\s+made\b/i, opts), /\bmotion\s+was\s+made\b/i.test(flat));
      const first = flatFirst(text, /NOW,\s+THEREFORE\s+DOES/i, opts);
      const m = /NOW,\s+THEREFORE\s+DOES/i.exec(flat);
      assert.equal(first ? first.m[0] : null, m ? m[0] : null);
      assert.equal(first ? first.abs : -1, m ? m.index : -1);
      assert.equal(flatPrefix(text, 30), flat.slice(0, 30));
      const mine = [], ref = allMatches([{ re: new RegExp(re.source, re.flags), tag: 1 }, { re: /\bNOW,\s+THEREFORE\b/gi, tag: 2 }], flat);
      mergedHits(text, [{ re: new RegExp(re.source, re.flags), tag: 1 }, { re: /\bNOW,\s+THEREFORE\b/gi, tag: 2 }],
                 ({ m: hit, tag }, abs) => { mine.push([abs, hit[0], tag]); }, opts);
      assert.deepEqual(mine, ref.map((h) => [h.m.index, h.m[0], h.tag]));
      assert.equal([...flatWindows(text, opts)].map((w) => w.buf.slice(w.from, w.to)).join(""), flat, "the windows' cores are the flatten");
    }
    const lines = text.split(/\r?\n/);
    const seen = [];
    eachLine(text, (l, at, i) => { seen.push(l); assert.equal(text.slice(at, at + l.length), l); assert.equal(seen.length - 1, i); });
    assert.deepEqual(seen, lines);
    const table = lineTable(text);
    assert.equal(table.length, lines.length);
    for (let i = 0; i < lines.length; i++) assert.equal(table.get(i), lines[i].trim());
  }
});

/* A document with a long stretch of text before, after or around it is the same document: padded so that every cut
   falls somewhere in the fixture, each type's detect gives its answer, and a parse that reads lines gives its. */
test("R37 padding a fixture with a long text that says nothing leaves each type's answer as it was, wherever the windows cut it", () => {
  const filler = (n) => { const l = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod\n"; return l.repeat(Math.ceil(n / l.length)).slice(0, n); };
  const pads = [1, 251, 262_100, 262_143, 524_288 - 37, 900_001];
  const cases = CASES.filter((c) => c.view === "held" || c.view === "pa");
  let checked = 0;
  for (const c of cases) {
    const text = flattenText(c.supplied).text;
    if (text.length > 20_000) continue;
    for (const t of DOCTYPES) {
      if (t.key === "generic") continue;
      const base = JSON.stringify(t.detect({ ...c.ctx, text }));
      for (const n of pads) {
        const f = filler(n);
        /* A memorandum header, a title line and a code's opening heading are read from the top of a document, so a long
           text before them is a different document for those types. */
        if (["meeting_calendar", "meeting_minutes", "meeting_agenda", "policy"].includes(t.key))
          assert.equal(JSON.stringify(t.detect({ ...c.ctx, text: f + "\n" + text })), base, `${c.id} ${t.key} leading ${n}`);
        assert.equal(JSON.stringify(t.detect({ ...c.ctx, text: text + "\n" + f })), base, `${c.id} ${t.key} trailing ${n}`);
        const half = Math.floor(text.length / 2), cut = text.lastIndexOf("\n", half) + 1;
        assert.equal(JSON.stringify(t.detect({ ...c.ctx, text: text.slice(0, cut) + f + "\n" + text.slice(cut) })), base, `${c.id} ${t.key} within ${n}`);
        checked++;
      }
      if (["meeting_minutes", "meeting_agenda", "staff_report", "staff_directory"].includes(t.key)) {
        const ref = JSON.stringify(t.parse({ ...c.ctx, text, locate: (o) => ({ at: o }), alsoSatisfies: () => [] }));
        for (const n of pads)
          assert.equal(JSON.stringify(t.parse({ ...c.ctx, text: text + "\n" + filler(n), locate: (o) => ({ at: o }), alsoSatisfies: () => [] })), ref, `${c.id} ${t.key} parse ${n}`);
      }
    }
  }
  assert.ok(checked > 500, `${checked} padded readings`);
});

/* ------------------------------------------------------------------------------------------- memory */

function child(args, nodeArgs = [], file = CHILD) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [...nodeArgs, file, ...args], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code, signal) => resolve({ code, signal, out, err }));
  });
}
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
async function fixture(name, sha) {
  const file = path.join(CACHE, `${name}.pdf`);
  if (fs.existsSync(file) && sha256(fs.readFileSync(file)) === sha) return file;
  fs.mkdirSync(CACHE, { recursive: true });
  const res = await fetch(GOVINFO(name));
  assert.ok(res.ok, `${name}: ${GOVINFO(name)} answered ${res.status}`);
  const body = Buffer.from(await res.arrayBuffer());
  assert.equal(sha256(body), sha, `${name}: the file fetched is not the file measured`);
  fs.writeFileSync(`${file}.part`, body);
  fs.renameSync(`${file}.part`, file);
  return file;
}
/* The heap the child holds before the work (what the caller holds), then the work under a cap of that plus the bound:
   a reading that needs more dies, and so does this test. */
async function capped(baseMode, mode, args = [], file = CHILD) {
  const idle = await child([baseMode, ...args], ["--expose-gc"], file);
  assert.equal(idle.code, 0, idle.err);
  const base = JSON.parse(idle.out.trim().split("\n").pop()).baseMB;
  const cap = Math.ceil(base) + BOUND_MB;
  return child([mode, ...args], ["--expose-gc", `--max-old-space-size=${cap}`, "--max-semi-space-size=2"], file);
}

test("R37 every type's detect, and the parse of those that read lines, over 14 million characters add under 16 MB", async () => {
  const r = await capped("base", "types");
  assert.equal(r.code, 0, `the types needed more than ${BOUND_MB} MB above what the caller holds: ${r.err.slice(-400)}`);
  assert.equal(JSON.parse(r.out.trim().split("\n").pop()).ok, true);
});

/* The answers of docprofile's readText over the three govinfo volumes, as the tranche tip gave them. */
const REAL = [
  { name: "BUDGET-2025-BUD", sha: "3f1df41cfa3cebfd675b2a6ed673b6f665e0848c293d8d3bb5ab1815a0bae36b",
    answer: { determined: false, chars: 3800, also: [], signals: "74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b", parsed: "74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b", parse_error: null } },
  { name: "BUDGET-2025-PER", sha: "067ad707534788e9011d4b6abdb686f1c3505888218e2ca5327c04e0ad58ae7f",
    answer: { determined: false, chars: 21326, also: [], signals: "74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b", parsed: "74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b", parse_error: null } },
  { name: "BUDGET-2024-APP", sha: "6e0b3dc5f2f3f5bbab8ae5032bbc29207a8dbb290ba25ebafe3feb20dfe13c1e",
    answer: { determined: true, chars: 13598363, type: "generic", confidence: "none", also: [], signals: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945", parsed: "7a998222246a3b8ba858155fc2e39780e9b95ee60732ae149fe4a0a418438067", parse_error: null } },
];

test("R37 readText over the three govinfo volumes, every type registered, answers as the tranche tip did", async () => {
  for (const f of REAL) {
    const file = await fixture(f.name, f.sha);
    const r = await child(["answer", file], ["--max-old-space-size=4096"]);
    assert.equal(r.code, 0, r.err.slice(-400));
    assert.deepEqual(JSON.parse(r.out.trim().split("\n").pop()), f.answer, f.name);
  }
});

/* The 16 MB is for the whole reading, docprofile's own work included, so it is asserted once docprofile hands the types
   `ctx.pages` (its R38); until then the types' own part above is what is measured. */
async function docprofileHandsPages() {
  let seen = null;
  const probe = { key: "r37_probe", label: "probe", version: 1, contract: "substance", detect(ctx) { seen = ctx.pages; return { match: false, confidence: "none" }; },
                  parse: () => ({}), assess: () => ({}) };
  registerDoctype(probe);
  readText({ document: "a\nb", pages: [{ page: 1, text: "a" }, { page: 2, text: "b" }] });
  return Array.isArray(seen);
}

test("R37 readText over BUDGET-2024-APP, every type registered, adds under 16 MB (once docprofile R38 hands the types ctx.pages)", async (t) => {
  if (!(await docprofileHandsPages())) { t.skip("docprofile R38 is not merged here: readText still makes its own whole-text copies"); return; }
  const real = REAL[2];
  const file = await fixture(real.name, real.sha);
  const json = path.join(CACHE, `${real.name}.reading.json`);
  if (!fs.existsSync(json)) {
    const d = await child(["dump", file, `${json}.part`], ["--max-old-space-size=4096"]);
    assert.equal(d.code, 0, d.err.slice(-400));
    fs.renameSync(`${json}.part`, json);
  }
  const r = await capped("readbase", "read", [json]);
  assert.equal(r.code, 0, `the reading needed more than ${BOUND_MB} MB above what the caller holds: ${r.err.slice(-400)}`);
  assert.deepEqual(JSON.parse(r.out.trim().split("\n").pop()), real.answer);
});

/* ----------------------------------------------------------------------------------------------------------- R38 */

test("R38 the policy and the regulation type parse every fixture reading as they parsed it before their lines were held as offsets", () => {
  const gold = JSON.parse(fs.readFileSync(here("./fixtures/r38-answers.json"), "utf8")).readings;
  const readings = fixtureReadings();
  assert.ok(readings.length >= 150);
  for (const r of readings) assert.deepEqual(parsesOf(r), gold[r.id], r.id);
  assert.equal(Object.keys(gold).length, readings.length);
});

/* The lines of a text, held as offsets, are the lines `split("\n")` gives, and the digest of a slice read a piece at a
   time is the digest of the slice normalised whole, whatever the pieces. */
test("R38 a text's lines held as offsets are the lines split gives, and a digest read in pieces is the whole slice's", () => {
  const words = ["alpha", " ", "  ", "\n", "\r\n", "\n\n", "\t", "x", "\u{1F600}", "\u00e9", "\u00a0", "\ud800", "\udc00", "lorem ipsum"];
  let seed = 11;
  const rnd = (n) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
  for (let round = 0; round < 300; round++) {
    let text = "";
    for (let i = 0, n = rnd(60); i < n; i++) text += words[rnd(words.length)];
    const lines = text.split("\n");
    const idx = lineIndex(text);
    assert.equal(idx.length, lines.length);
    let at = 0;
    for (let i = 0; i < lines.length; i++) {
      assert.deepEqual(idx.at(i), { start: at, end: at + lines[i].length, text: lines[i] });
      for (let o = at; o <= at + lines[i].length; o++) assert.equal(idx.lineOf(o), i, `${JSON.stringify(text)} @${o}`);
      at += lines[i].length + 1;
    }
    assert.equal(idx.lineOf(text.length + 1), -1);
    const a = rnd(text.length + 1), b = a + rnd(text.length - a + 1);
    const want = sha256Hex(text.slice(a, b).replace(/\s+/g, " ").trim());
    for (const piece of [1, 2, 3, 5, 17, undefined]) assert.equal(textDigest(text, a, b, piece), want, `${JSON.stringify(text.slice(a, b))} piece ${piece}`);
  }
  for (const len of [0, 1, 55, 56, 63, 64, 65, 119, 120, 1000, 100_003]) {
    const t = "x".repeat(len);
    assert.equal(sha256Hex(t), createHash("sha256").update(t).digest("hex"), String(len));
    assert.equal(textDigest(t, 0, len, 7), sha256Hex(t));
  }
});

/* A text of 13.6 million characters that the type recognises: a fixture document with prose put inside it
   (./r38-texts.mjs). The parse adds under 16 MB to what the caller holds, and its answer is the one the parse gave before
   (fixtures/r38-answers.json). */
for (const kind of KINDS) {
  test(`R38 the parse of a ${kind} text of 13.6 million characters recognised as ${kind === "policy" ? "a policy" : "a regulation"} adds under 16 MB, and its answer is unchanged`, async () => {
    const gold = JSON.parse(fs.readFileSync(here("./fixtures/r38-answers.json"), "utf8")).large[kind];
    const r = await capped("base", "parse", [kind], CHILD38);
    assert.equal(r.code, 0, `the parse needed more than ${BOUND_MB} MB above what the caller holds: ${r.err.slice(-400)}`);
    const got = JSON.parse(r.out.trim().split("\n").pop());
    assert.equal(got.ok, true);
    assert.ok(got.chars >= 13_600_000);
    assert.equal(got.digest, gold);
  });
}
