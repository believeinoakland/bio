/* promotion's gate — requirement-named tests (build/requirements/promotion.md R27–R29, R33, R34). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { runGate, runCaseGate, CATALOG_VERSION, GATE_VERSION } from "../../../src/promotion/index.mjs";
import { checkBundle, checkCaseDocument, parseFrontmatter } from "../../../checks/bio-checks.mjs";
import { doc, T0 } from "./fixtures.mjs";

const ID = "INFO-2026-0001-report";
const hex = (b) => createHash("sha256").update(b).digest("hex");
const md = (over = {}) => doc({ id: ID, object_type: "information", schema: "information@1", title: "A report",
  current_state: "collected", prior_state: null, created: T0, last_updated: T0, group: "test-group", ...over });
const base = (image, over = {}) => ({ bundleId: ID, image, knownIds: new Set([ID]), hasCapture: async () => ({ present: true }),
  registers: [], releaseRegistry: null, publishedRegistry: null, publishedCaseRegistry: null, earnedRegistry: null, ...over });

/* What the catalogue itself says about the same image, as R27 defines the inputs. */
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

test("R27: runGate runs the whole bundle catalogue over the image: text entries are files, blob references are elided and never read, knownIds resolves references", async () => {
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

test("R33: runCaseGate runs the case catalogue with the facts supplied, R29's shape, and never throws", () => {
  const fms = [{}, { schema: "bio-case-document/4", case_id: "CASE-2026-0001" }, parseFrontmatter(md()).data];
  for (const fm of fms) {
    for (const facts of [{}, { priorCase: null, body: "x", memberBasis: null }, { priorCase: { assertions: [] } }]) {
      const ctx = { caseId: "CASE-2026-0001", edition: 1, fm, ...facts };
      const all = checkCaseDocument(fm, { caseId: ctx.caseId, edition: ctx.edition, priorCase: ctx.priorCase || null,
                                          body: ctx.body ?? null, memberBasis: ctx.memberBasis ?? null });
      const r = runCaseGate(ctx);
      const errors = all.filter((f) => f.severity === "error");
      assert.deepEqual(r.findings.map((f) => [f.check, f.detail]), errors.map((f) => [f.check, f.message]));
      assert.equal(r.ok, errors.length === 0);
      assert.equal(r.warnings, all.length - errors.length);
      assert.equal(r.gateVersion, GATE_VERSION);
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
});
