/* workbooks: the method note (R10), the second member's check (R11), not a gate (R16), and what is computed and stored
   (R17). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, xlsx, V, MACHINE } from "./fixture.mjs";
import { xlsxEntry } from "../../../src/formats-xlsx.mjs";
import { zipStored } from "../../../src/workbooks/xlsxwrite.mjs";

const codeOf = (r) => (r && r.ok === false ? r.reason : "ok");
const NOTE = { purpose: "The cost of the service per resident.", sources: ["the FY2025 adopted budget", "the census"],
               steps: "Sum the three lines; divide by residents.", limitations: "One year; the census is a 2020 count." };

test("R10 recordMethodNote requires each field (NO_PURPOSE, NO_SOURCES, NO_STEPS, NO_LIMITATIONS); a new note supersedes the last and every note is kept with who and when", async () => {
  const w = await seeded();
  const before = w.snapshot();
  const order = [["purpose", "NO_PURPOSE"], ["sources", "NO_SOURCES"], ["steps", "NO_STEPS"], ["limitations", "NO_LIMITATIONS"]];
  const call = { ...w.at, purpose: " ", sources: [], steps: "", limitations: null, by: V("bob") };
  for (const [field, code] of order) {
    assert.equal(codeOf(await w.wb.recordMethodNote(call)), code, field);
    call[field] = NOTE[field];
  }
  for (const sources of [undefined, "", [" "], [null]]) assert.equal(codeOf(await w.wb.recordMethodNote({ ...w.at, ...NOTE, sources, by: V("bob") })), "NO_SOURCES");
  assert.deepEqual(w.snapshot(), before, "a refused note writes nothing");
  w.clock.now = "2026-10-06T08:00:00.000Z";
  assert.equal((await w.wb.recordMethodNote({ ...w.at, ...NOTE, by: V("bob") })).ok, true);
  w.clock.now = "2026-10-06T09:00:00.000Z";
  assert.equal((await w.wb.recordMethodNote({ ...w.at, ...NOTE, sources: "the FY2026 budget", limitations: "Two years.", by: V("carol") })).ok, true);
  const notes = (await w.wb.readWorkbook({ ...w.at, viewer: V("bob") })).method_notes;
  assert.equal(notes.length, 2, "every note kept");
  assert.deepEqual(notes.map((n) => [n.by, n.at, n.current]), [[V("bob"), "2026-10-06T08:00:00.000Z", false], [V("carol"), "2026-10-06T09:00:00.000Z", true]]);
  assert.deepEqual(notes[0].sources, NOTE.sources);
  assert.deepEqual(notes[1].sources, ["the FY2026 budget"]);
  assert.equal(notes[1].limitations, "Two years.");
});

test("R11 recordCheck is refused SELF_CHECK for the workbook's author and UNKNOWN_OUTCOME outside agrees, disagrees, could_not_check; a check is disclosed on every read with who and when; nothing refuses, waits or warns for want of one", async () => {
  const w = await seeded();
  const plain = await w.wb.readWorkbook({ ...w.at, viewer: V("bob") });
  assert.deepEqual(plain.checks, [], "no check: the read answers as fully");
  assert.ok(!/check/i.test(JSON.stringify({ ...plain, checks: undefined, grade_facts: undefined })), "no warning for want of one");
  assert.equal(codeOf(await w.wb.recordCheck({ ...w.at, outcome: "agrees", by: V("bob") })), "SELF_CHECK");
  for (const outcome of ["ok", "", undefined, "AGREES"]) assert.equal(codeOf(await w.wb.recordCheck({ ...w.at, outcome, by: V("carol") })), "UNKNOWN_OUTCOME");
  w.clock.now = "2026-10-06T10:00:00.000Z";
  for (const outcome of ["agrees", "disagrees", "could_not_check"])
    assert.equal((await w.wb.recordCheck({ ...w.at, outcome, note: outcome === "disagrees" ? "B4 should be 99.95" : undefined, by: V("carol") })).ok, true);
  assert.equal((await w.wb.recordCheck({ ...w.at, outcome: "agrees", by: V("alice") })).ok, true, "an administrator who is not the author");
  for (const viewer of [V("bob"), V("carol"), MACHINE]) {
    const checks = (await w.wb.readWorkbook({ ...w.at, viewer })).checks;
    assert.deepEqual(checks.map((c) => [c.outcome, c.by, c.at]), [["agrees", V("carol"), "2026-10-06T10:00:00.000Z"],
      ["disagrees", V("carol"), "2026-10-06T10:00:00.000Z"], ["could_not_check", V("carol"), "2026-10-06T10:00:00.000Z"],
      ["agrees", V("alice"), "2026-10-06T10:00:00.000Z"]]);
    assert.equal(checks[1].note, "B4 should be 99.95");
  }
});

test("R16 not a gate: with a differing recompute, lint findings, unbound inputs and no second check, every act of this module and of others still answers as it would without them", async () => {
  const w = await seeded({ recompute: async () => ({ ok: true, engine: "ironcalc", engine_version: "x", cells: [
    { source: { ref: "Model!B5" }, value: 1599, type: "number", volatile: false },
    { source: { ref: "Model!B6" }, value: 1, type: "number", volatile: false }] }) });
  const t = await w.table([["amount", "number"]], [["1"]]);
  assert.equal((await w.wb.recompute({ ...w.at, by: V("bob") })).recompute.status, "differs");
  assert.ok((await w.wb.lint({ ...w.at, viewer: V("bob") })).findings.length > 0);
  assert.equal((await w.wb.bind({ ...w.at, range: "Model!B2", input: { table: t, range: "A1" }, by: V("bob") })).binding.agrees, false);
  /* this module's own acts and reads proceed */
  assert.equal((await w.wb.recordMethodNote({ ...w.at, ...NOTE, by: V("bob") })).ok, true);
  assert.equal((await w.wb.readWorkbook({ ...w.at, viewer: V("carol") })).ok, true);
  assert.equal((await w.wb.recompute({ ...w.at, by: V("bob") })).ok, true);
  /* other modules' acts proceed: a capture promoted into the project, a passage minted, a project made, a workbook added */
  const doc = w.capture("another document", { project: w.P });
  const m = w.content.mint({ bundleId: doc.bundleId, captureSha: doc.capSha, extent: { kind: "pdf-page", page: 0 }, mintedBy: V("bob") });
  assert.equal(m.ok, true);
  assert.ok(w.project("Next", "carol"));
  const cap = w.capture(xlsx([{ name: "S", cells: { A1: { n: "1" }, Z9: { s: `${Math.random()}` } } }])).capSha;
  assert.equal((await w.wb.addWorkbook({ captureSha: cap, question: "q", period: "p", project: w.P, by: V("bob") })).ok, true);
  /* no answer of this module states a gate */
  const read = JSON.stringify(await w.wb.readWorkbook({ ...w.at, viewer: V("bob") }));
  assert.ok(!/"(blocked|gate|refuse[sd]?|warning)"/i.test(read));
  /* it registers no step, listener or store gate with record-core: its declarations are its tables alone */
  for (const table of ["workbooks", "workbook_cells", "workbook_bindings", "workbook_recomputes"])
    assert.equal(w.record.storeGate("workbooks", table, {}, "insert"), null);
});

test("R17 no macro is run, no external link followed, no formula evaluated here: the cells held are the file's own, every number recorded by a recompute is the engine's or the file's, and nothing is fetched", async () => {
  /* a workbook carrying a VBA project and an external reference */
  const base = xlsx([{ name: "S", cells: { A1: { n: "2" }, A2: { f: "A1*3", v: "7" }, A3: { f: "[1]Other!A1", v: "5" }, Z9: { s: `${Math.random()}` } } }]);
  const entries = await unzip(base);
  entries.push(["xl/vbaProject.bin", new Uint8Array([1, 2, 3])]);
  const bytes = zipStored(entries);
  const fetched = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (u) => { fetched.push(String(u)); throw new Error("no network in this module"); };
  try {
    const w = await seeded({ recompute: async () => ({ ok: true, engine: "ironcalc", engine_version: "x", macros_present: true, cells: [
      { source: { ref: "S!A2" }, value: 6, type: "number", volatile: false }] }) }, bytes);
    /* the cells held are exactly office-readers' cells */
    const t = await xlsxEntry.text(bytes);
    const want = t.sheets.flatMap((s) => s.cells.map((c) => [s.name, c.source.cell, c.type, c.value, c.formula, c.cached]));
    const held = w.rows(`SELECT sheet, cell, type, value, formula, cached FROM workbook_cells ORDER BY r, c`).map((r) => Object.values(r));
    assert.deepEqual(held.sort(), want.sort());
    assert.equal(w.rows(`SELECT cached FROM workbook_cells WHERE cell='A2'`)[0].cached, "7", "the file's cached 7 kept, never recomputed to 6 here");
    const r = (await w.wb.recompute({ ...w.at, by: V("bob") })).recompute;
    assert.deepEqual(r.differing, [{ cell: "S!A2", cached: "7", cached_type: "number", engine_value: 6, engine_type: "number" }]);
    assert.equal(r.counts.not_recomputed, 1, "the external reference is the engine's to refuse, never followed here");
    const read = await w.wb.readWorkbook({ ...w.at, viewer: V("bob") });
    assert.equal(read.recompute.differing[0].engine_value, 6);
    assert.deepEqual(fetched, [], "nothing fetched");
  } finally { globalThis.fetch = realFetch; }
});

/* The entries of a stored zip (the fixture's own), as [name, bytes]. */
async function unzip(bytes) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out = [];
  let at = 0;
  while (dv.getUint32(at, true) === 0x04034b50) {
    const size = dv.getUint32(at + 18, true), nameLen = dv.getUint16(at + 26, true), extra = dv.getUint16(at + 28, true);
    const name = new TextDecoder().decode(bytes.subarray(at + 30, at + 30 + nameLen));
    const start = at + 30 + nameLen + extra;
    out.push([name, bytes.slice(start, start + size)]);
    at = start + size;
  }
  return out;
}
