/* register-readers R11: the module's invariants: pure, never throws, knows no register or place, calls no AI, assigns no
 * meaning. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import * as M from "../../../src/register-readers/index.mjs";
import { CONTRIB, CONTRIB_CSV, STREET_TYPES, enc, chunked, all } from "./fixtures.mjs";

const DIR = new URL("../../../src/register-readers/", import.meta.url);
const FILES = readdirSync(DIR).filter((f) => f.endsWith(".mjs"));
const SOURCES = FILES.map((f) => [f, readFileSync(new URL(f, DIR), "utf8")]);
const importsOf = (src) => [...src.matchAll(/^\s*(?:import|export)\s[^;]*?\sfrom\s+"([^"]+)"/gms)].map((m) => m[1]);
const ODD = [null, undefined, 5, new Uint8Array(0)];

test("R11 the imports are those in Uses: record-grammar, civil-time, id-spaces, ooxml, csv-reader; no ai-*, agent-* or skills module", () => {
  const outside = new Set();
  for (const [, src] of SOURCES) for (const spec of importsOf(src)) if (!spec.startsWith("./")) outside.add(spec);
  assert.deepEqual([...outside].sort(), ["../civil-time/index.mjs", "../csv-reader/index.mjs", "../idspaces.mjs", "../ooxml.mjs", "../record-grammar/index.mjs"]);
  for (const spec of outside) assert.doesNotMatch(spec, /ai-|agent-|skills/);
});

test("R11 pure: no store, network, clock or randomness in the module's code", () => {
  for (const [f, src] of SOURCES) {
    const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    for (const re of [/\bfetch\s*\(/, /Date\.now|new Date\b/, /Math\.random/, /crypto\.getRandomValues|randomUUID/, /\bstorage\b|\benv\.\w+/, /process\./]) {
      assert.doesNotMatch(code, re, `${f}: ${re}`);
    }
  }
});

test("R11 each public function returns for null, undefined, a number and an empty buffer without throwing", async () => {
  for (const x of ODD) {
    for (const f of [M.reduce, M.droppedColumns, M.contactShape, M.indexTerms, M.validateFilter, M.matches, M.autoWatchable, M.filterFingerprint, M.prefillFrom, M.estimate]) {
      f(x, x, x);
      f(x, CONTRIB);
    }
    const r = M.createReducer(x);
    r.write(x);
    assert.equal(r.end().ok, false);
    const r2 = M.createReducer({ definition: CONTRIB, piece: "y2025" });
    r2.write(x);
    assert.equal(r2.end().ok, false);
    for (const item of await all(M.readRows(x, x, x, x))) assert.equal(item.ok, false);
    for (const item of await all(M.readRows(chunked(enc(CONTRIB_CSV)), CONTRIB, x, x))) assert.ok(item);
    assert.equal((await M.listMembers(x)).ok, false);
    assert.equal((await all(M.streamZipMember(x, x, x))).at(-1).ok, false);
  }
  const throwing = { size: 100, read: () => { throw new Error("gone"); } };
  assert.equal((await M.listMembers(throwing)).ok, false);
  assert.equal((await all(M.streamZipMember(throwing, "a"))).at(-1).ok, false);
  async function* broken() { yield enc("Tran_ID\n"); throw new Error("gone"); }
  assert.deepEqual((await all(M.readRows(broken(), CONTRIB, "y2025"))).at(-1), { ok: false, why: "source_failed" });
});

test("R11 no output has a key score, rank or suspect", async () => {
  const seen = new Set();
  const walk = (v) => { if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) { seen.add(k); walk(x); } };
  for (const item of await all(M.readRows(chunked(enc(CONTRIB_CSV)), CONTRIB, "y2025"))) {
    walk(item);
    if (item.cells) { const r = M.reduce(item, CONTRIB, { streetTypes: STREET_TYPES }); walk(r); walk(M.indexTerms(r.kept, CONTRIB)); }
  }
  const red = M.createReducer({ definition: CONTRIB, piece: "y2025", filter: { names: ["Rosa Martinez"] } });
  red.write(enc(CONTRIB_CSV));
  walk(red.end());
  walk(M.prefillFrom({ subjects: [{ kind: "person", label: "Rosa Martinez" }] }, CONTRIB));
  walk(M.estimate({ bytes: 10, rows: 1 }, { bytes: 100 }));
  for (const k of ["score", "rank", "suspect"]) assert.ok(!seen.has(k), k);
  assert.ok(seen.has("kept") && seen.has("name_tokens"), "the walk saw the outputs");
});

test("R11 the module knows no register by name and no place: its code names none of the test definitions' registers or places", () => {
  for (const [f, src] of SOURCES) {
    for (const word of ["Oakland", "Alameda", "California", "Riverbend", "Sawtooth", "FEC", "NetFile", "FPPC", "Avenue", "Street", "Boulevard"]) {
      assert.ok(!src.includes(word), `${f} names ${word}`);
    }
  }
});

test("R11 control: the imports are those in Uses (each a module this module uses, by modules.json)", () => {
  const mods = JSON.parse(readFileSync(new URL("../../../../build/modules.json", import.meta.url), "utf8")).modules;
  const uses = new Set(mods.find((m) => m.id === "register-readers").uses);
  for (const id of ["record-grammar", "civil-time", "id-spaces", "ooxml", "csv-reader"]) assert.ok(uses.has(id), id);
});
