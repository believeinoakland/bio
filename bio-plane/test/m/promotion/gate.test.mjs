/* promotion's gate — requirement-named tests (build/requirements/promotion.md R27–R29, R33, R34). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { runGate, runCaseGate, CATALOG_VERSION, GATE_VERSION, ROW_CENSUS } from "../../../src/promotion/index.mjs";
import { checkBundle, parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import { doc, T0, makePromotion } from "./fixtures.mjs";

const ID = "INFO-2026-0001-report";
const hex = (b) => createHash("sha256").update(b).digest("hex");
const md = (over = {}) => doc({ id: ID, object_type: "information", schema: "information@1", title: "A report",
  current_state: "collected", prior_state: null, created: T0, last_updated: T0, group: "test-group", ...over });
const base = (image, over = {}) => ({ bundleId: ID, image, knownIds: new Set([ID]), hasCapture: async () => ({ present: true }),
  registers: [], releaseRegistry: null, publishedRegistry: null, publishedCaseRegistry: null, earnedRegistry: null, ...over });

/* What record-grammar's checkBundle says about the same image, as R27 defines the inputs (no grammars passed). */
async function catalogue(image, knownIds = new Set([ID])) {
  const files = new Map(), elided = new Set();
  for (const [p, v] of Object.entries(image)) {
    if (typeof v === "string") files.set(p, v);
    else elided.add(p);
  }
  const { findings } = await checkBundle({ folderName: ID, files, elidedPaths: elided,
    sha256: async (v) => hex(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)),
    sha512: async (b) => new Uint8Array(createHash("sha512").update(b).digest()),
    resolveTarget: (id) => knownIds.has(id), releaseRegistry: null, publishedRegistry: null,
    publishedCaseRegistry: null, earnedRegistry: null });
  return findings;
}

test("R27: runGate runs checkBundle over the image: text entries are files, blob references are elided and never read, knownIds resolves references", async () => {
  const images = [
    { "bundle.md": md() },
    { "bundle.md": md({ id: "INFO-2026-0009-other" }) },
    { "bundle.md": md({ current_state: "nonsense" }) },
    { "bundle.md": md(), "data/cap.pdf": { blobSha: "a".repeat(64), bytes: 10 } },
    { "bundle.md": "no front matter" },
  ];
  for (const image of images) {
    const want = (await catalogue(image)).filter((f) => f.severity === "error").map((f) => [f.check, f.message]);
    const got = await runGate(base(image));
    assert.deepEqual(got.findings.map((f) => [f.check, f.detail]), want);
  }
  /* A blob entry counts for existence: its bytes are not fetched (the value is never read as bytes). */
  const blobProbe = { get blobSha() { throw new Error("read"); } };
  const r = await runGate(base({ "bundle.md": md(), "data/cap.pdf": blobProbe }));
  assert.equal(typeof r.ok, "boolean");
  /* knownIds answers whether a reference resolves, exactly as the catalogue is asked it. */
  const ref = { "bundle.md": md().replace("group: test-group", "group: test-group\nreferences:\n  - target: INFO-2026-0002-other\n    rel: cites\n    status: confirmed") };
  for (const known of [new Set([ID]), new Set([ID, "INFO-2026-0002-other"])]) {
    const want = (await catalogue(ref, known)).filter((f) => f.severity === "error").map((f) => [f.check, f.message]);
    assert.deepEqual((await runGate(base(ref, { knownIds: known }))).findings.map((f) => [f.check, f.detail]), want);
  }
  const unresolved = (await runGate(base(ref))).findings.length;
  const resolved = (await runGate(base(ref, { knownIds: new Set([ID, "INFO-2026-0002-other"]) }))).findings.length;
  assert.ok(unresolved > resolved, "an unresolved reference is a finding the resolved one is not");
});

test("R28: every registered capture must be present: missing, wrong size, parts missing or unverified are refused by name; a rejected probe rejects", async () => {
  const image = { "bundle.md": md() };
  const reg = [{ path: "data/cap.pdf", capture_sha: "c".repeat(64), bytes: 10 }];
  const run = (probe) => runGate(base(image, { registers: reg, hasCapture: async () => probe }));
  const codes = async (probe) => (await run(probe)).findings.map((f) => f.check).filter((c) => c.startsWith("PLANE_"));
  assert.deepEqual(await codes({ present: true, bytes: 10 }), []);
  assert.deepEqual(await codes({ present: false }), ["PLANE_MISSING_BYTES"]);
  assert.deepEqual(await codes({ present: true, bytes: 11 }), ["PLANE_SIZE"]);
  assert.deepEqual(await codes({ present: false, heldInParts: true }), ["PLANE_HELD_IN_PARTS"]);
  const part = (file, bytes) => ({ file, sha256: hex(file), bytes });
  const named = [part("p1", 4), part("p2", 6)];
  assert.deepEqual(await codes({ present: false, parts: { named, missing: [], disagree: [], unverified: [] } }), []);
  assert.deepEqual(await codes({ present: false, parts: { named, missing: [named[1]], disagree: [], unverified: [] } }), ["PLANE_PART_MISSING"]);
  assert.deepEqual(await codes({ present: false, parts: { named, missing: [], disagree: [named[0]], unverified: [] } }), ["PLANE_PART_UNVERIFIED"]);
  assert.deepEqual(await codes({ present: false, parts: { named, missing: [], disagree: [], unverified: [named[0]] } }), ["PLANE_PART_UNVERIFIED"]);
  assert.deepEqual(await codes({ present: false, parts: { named: [part("p1", 4)], missing: [], disagree: [], unverified: [] } }), ["PLANE_PART_UNVERIFIED"]);
  assert.deepEqual(await codes({ present: false, parts: { named, missing: [], disagree: [], unverified: [], why: "no bucket" } }), ["PLANE_PART_UNVERIFIED"]);
  const missing = (await run({ present: false, parts: { named, missing: [named[1]], disagree: [], unverified: [] } })).findings.find((f) => f.check === "PLANE_PART_MISSING");
  assert.deepEqual(missing.where.missing_parts, [named[1]]);
  await assert.rejects(runGate(base(image, { registers: reg, hasCapture: async () => { throw new Error("probe failed"); } })));
});

test("R29: ok is false exactly when an error finding exists; findings hold only errors, shaped {check, detail, repairs?, where?}; warnings counts the rest", async () => {
  for (const image of [{ "bundle.md": md() }, { "bundle.md": md({ id: "INFO-2026-0009-other" }) }]) {
    const all = await catalogue(image);
    const r = await runGate(base(image));
    const errors = all.filter((f) => f.severity === "error");
    assert.equal(r.ok, errors.length === 0);
    assert.equal(r.findings.length, errors.length);
    assert.equal(r.warnings, all.length - errors.length);
    assert.equal(r.gateVersion, GATE_VERSION);
    for (const f of r.findings) {
      assert.deepEqual(Object.keys(f).filter((k) => !["check", "detail", "repairs", "where"].includes(k)), []);
      assert.equal(typeof f.check, "string");
    }
  }
  const missing = await runGate(base({ "bundle.md": md() }, { registers: [{ path: "x", capture_sha: "d".repeat(64) }],
    hasCapture: async () => ({ present: false }) }));
  assert.equal(missing.ok, false);
});

test("R33: runCaseGate runs the case catalogue it is given with the facts supplied, R29's shape, and never throws", () => {
  const fms = [{}, { schema: "bio-case-document/5", case_id: "CASE-2026-0001" }, parseFrontmatter(md()).data];
  /* A catalogue answering errors with and without repairs, and warnings; the gate reports only the errors. */
  const catalogue = (fm, c) => [
    ...(fm.case_id ? [] : [{ check: "C-41.1", severity: "error", message: "no case_id", repairs: ["state it"] }]),
    ...(c.body === null ? [{ check: "C-3.1", severity: "error", message: "no body" }] : []),
    ...(c.priorCase ? [{ check: "C-21.1", severity: "warn", message: "prior asserted" }] : []),
    { check: "C-41.2", severity: "info", message: "read" }];
  for (const fm of fms) {
    for (const facts of [{}, { priorCase: null, body: "x", memberBasis: null }, { priorCase: { assertions: [] }, memberBasis: { A: [] } }]) {
      const ctx = { caseId: "CASE-2026-0001", edition: 1, fm, ...facts };
      const calls = [];
      const r = runCaseGate(ctx, (f, c) => { calls.push([f, c]); return catalogue(f, c); });
      /* Asked once, over the front matter, with the facts the document cannot carry about itself (null when absent). */
      assert.deepEqual(calls, [[fm, { caseId: ctx.caseId, edition: ctx.edition, priorCase: ctx.priorCase || null,
                                      body: ctx.body ?? null, memberBasis: ctx.memberBasis ?? null }]]);
      const all = catalogue(fm, calls[0][1]);
      const errors = all.filter((f) => f.severity === "error");
      assert.deepEqual(r, { gateVersion: GATE_VERSION, ok: errors.length === 0,
        findings: errors.map((f) => ({ check: f.check, detail: f.message, ...(f.repairs ? { repairs: f.repairs } : {}) })),
        warnings: all.length - errors.length });
    }
  }
});

test("R33 (K529): with no catalogue registered, runCaseGate runs no fallback and answers C-102.9 CASE_CATALOGUE_FAILED as R29's verdict, fail closed", () => {
  /* A document every catalogue would pass is not passed when nothing judges it. */
  for (const args of [{ caseId: "CASE-2026-0001", edition: 1, fm: { schema: "bio-case-document/5", case_id: "CASE-2026-0001" },
                        priorCase: null }, {}, undefined]) {
    for (const none of [undefined, null, "checkCaseDocument", {}]) {
      const r = runCaseGate(args, none);
      /* R29's shape, whole (K534): a verdict, its one finding naming C-102.9's code; no warnings; the one GATE_VERSION. */
      assert.deepEqual(Object.keys(r), ["gateVersion", "ok", "findings", "warnings"]);
      assert.deepEqual([r.ok, r.gateVersion, r.warnings], [false, GATE_VERSION, 0]);
      assert.deepEqual(r.findings.map((f) => [Object.keys(f), f.check]), [[["check", "detail"], "CASE_CATALOGUE_FAILED"]]);
      assert.match(r.findings[0].detail, /no case-document catalogue is registered/);
    }
  }
});

test("R34: GATE_VERSION contains CATALOG_VERSION and both gates report the same GATE_VERSION", async () => {
  assert.match(CATALOG_VERSION, /^\d+\.\d+\.\d+$/);
  assert.ok(GATE_VERSION.includes(CATALOG_VERSION));
  const a = await runGate(base({ "bundle.md": md() }));
  const b = runCaseGate({ caseId: "CASE-2026-0001", edition: 1, fm: {}, priorCase: null });
  assert.equal(a.gateVersion, b.gateVersion);
  assert.equal(a.gateVersion, GATE_VERSION);
  /* The promotion instance's case gate, before and after a catalogue is registered with it (R47), reports it too. */
  const { p } = makePromotion();
  const args = { caseId: "CASE-2026-0001", edition: 1, fm: {}, priorCase: null };
  assert.equal(p.runCaseGate(args).gateVersion, GATE_VERSION);
  p.registerCaseCatalogue("ratification", () => []);
  assert.equal(p.runCaseGate(args).gateVersion, GATE_VERSION);
  /* The census moves with the stamp: it names the version it was stamped with (R50). */
  assert.equal(ROW_CENSUS.version, CATALOG_VERSION);
});

test("R50: ROW_CENSUS is a frozen {version, rows, digest}: the stamp's CATALOG_VERSION, a count of rows and a lowercase SHA-256", () => {
  assert.ok(Object.isFrozen(ROW_CENSUS));
  assert.deepEqual(Object.keys(ROW_CENSUS).sort(), ["digest", "rows", "version"]);
  assert.equal(ROW_CENSUS.version, CATALOG_VERSION);
  assert.ok(Number.isSafeInteger(ROW_CENSUS.rows) && ROW_CENSUS.rows > 0, String(ROW_CENSUS.rows));
  assert.match(ROW_CENSUS.digest, /^[0-9a-f]{64}$/);
  /* A frozen pin: no caller can move it. */
  assert.throws(() => { ROW_CENSUS.rows = 0; }, TypeError);
  assert.equal(Object.getOwnPropertyDescriptor(ROW_CENSUS, "rows").writable, false);
});


test("R27 (§1b): the gate passes the registered grammars to the catalogue: a grammar claiming an arm runs in its place, one claiming none runs after, and the findings are the catalogue's own with the same grammars", async () => {
  const image = { "bundle.md": md({ source_status: "nonsense" }) };
  const claim = { module: "capture", ids: ["C-2.7"],
                  arm: (ctx, findings) => { findings.push({ check: "C-2.7", severity: "error", message: "from capture's grammar" }); } };
  const extra = { module: "later", ids: ["C-999.1"],
                  arm: (ctx, findings) => { findings.push({ check: "C-999.1", severity: "error", message: `after, over ${ctx.folderName}` }); } };
  const catalogueWith = async (grammars) => {
    const files = new Map(Object.entries(image));
    const { findings } = await checkBundle({ folderName: ID, files, elidedPaths: new Set(),
      sha256: async (v) => hex(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)),
      sha512: async (b) => new Uint8Array(createHash("sha512").update(b).digest()),
      resolveTarget: (id) => id === ID, releaseRegistry: null, publishedRegistry: null, publishedCaseRegistry: null,
      earnedRegistry: null }, { grammars });
    return findings.filter((f) => f.severity === "error").map((f) => [f.check, f.message]);
  };
  /* C-2.7's slot is capture's grammar, which every product caller registers (K767): the test registers a grammar in
     that slot, as capture does, and never leans on the catalogue's held copy, which fills the slot only for a caller
     registering none. (This module's tests cannot import capture, a later layer, so `claim` stands in for it.) */
  const builtIn = (await runGate(base(image))).findings.map((f) => [f.check, f.detail]);
  /* Through promotion's instance: the record's registrations, and no caller's. */
  const { p, record } = makePromotion();
  record.grammarList = [claim, extra];
  const got = (await p.runGate(base(image, { grammars: [] }))).findings.map((f) => [f.check, f.detail]);
  assert.deepEqual(got, (await catalogueWith([claim, extra])).concat(
    (await runGate(base(image))).findings.filter((f) => !f.check.startsWith("C-")).map((f) => [f.check, f.detail])));
  const c27 = got.filter(([c]) => c === "C-2.7");
  assert.deepEqual(c27, [["C-2.7", "from capture's grammar"]], "the built-in arm is skipped, never run twice");
  assert.deepEqual(got.filter(([c]) => c === "C-999.1"), [["C-999.1", `after, over ${ID}`]]);
  /* With none registered, the instance's gate is the built-in catalogue's. */
  record.grammarList = [];
  assert.deepEqual((await p.runGate(base(image))).findings.map((f) => [f.check, f.detail]), builtIn);
  /* A grammar that throws judged nothing: one error naming its module, ok false, never a pass or a throw out (R37). */
  record.grammarList = [{ module: "capture", ids: ["C-2.7"], arm: () => { throw new Error("arm broke"); } }];
  const broke = await p.runGate(base(image));
  assert.equal(broke.ok, false);
  assert.deepEqual(broke.findings.filter((f) => f.check === "capture").map((f) => /capture's grammar threw on .*arm broke/.test(f.detail)), [true]);
  assert.equal(broke.findings.some((f) => f.check === "C-2.7"), false, "the built-in arm does not run in its place");
  /* A record that cannot answer its registrations rejects the gate: an unread list is never read as empty (R37). */
  record.grammars = () => { throw new Error("registrations unreadable"); };
  await assert.rejects(p.runGate(base(image)), /registrations unreadable/);
});
