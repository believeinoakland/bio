/* extraction: its share of three legacy suites (`build/jobs/T17/legacy-tests.md`'s CONVERT rows), at the module's
   interface. `test/calibration.test.mjs`: the drift obligation's superseded and current calibration, its absences,
   and `derivation_cap` unchanged after a worse and a better calibration (R38–R40, R44), with calibration itself.
   `test/readingname.test.mjs`: the name-term backfill (R37) re-deriving every source, the identifier tiers included
   (R19, R59). `test/extractrun.test.mjs`: `mintRatio` and the rest of R41–R43 that rules.test.mjs does not assert.
   The old suites are kept (K619 (3)); each test names its requirement ids and the old suite. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle } from "./fixture.mjs";
import { labelTerms, refTermSources } from "../../../src/extraction/index.mjs";
import { EXTRACT_RUN_MODE, PROPOSED_READING_CEILING, proposedReadingGrade, checkProposedRef, proposalChain, mintRatio }
  from "../../../src/extractrun.mjs";
import { appendStep, derivationCap, layerChain } from "../../../src/textchain.mjs";

const S1 = "1".repeat(64), S2 = "2".repeat(64), S3 = "3".repeat(64);

/* ---- calibration.test.mjs ---- */
const probe = (over) => ({ engine: "pdfjs", version: "4.2.67", at: "2026-09-01T00:00:00Z", cap: "C", probe_id: "P-1",
                           probe_inputs: { corpus: "synthetic" }, scores: { cer: 0.02 }, measured_by: "m", ...over });
const ocr = (engine, version, cal) => [{ step: "pixels", cap: "C", measured_by: "m", ...(cal ? { calibration: cal } : {}) },
                                       { step: "ocr", engine, version, cap: "C", measured_by: "m", ...(cal ? { calibration: cal } : {}) }];

test("R39 R38 R40 R44 (calibration.test.mjs clause (d)): with calibration itself, a worse measurement's obligation names exactly the transcription bound to the superseded calibration, both calibrations named; the same engine on no calibration and another engine's calibration are not named; regraded 0 and no derivation_cap moves", () => {
  const w = fresh({ cal: "module" });
  bundle(w.s, "B-1");
  const first = w.cal.calibrationRecord(probe(), { principal: "member:m1" });
  assert.equal(first.ok, true);
  w.x.writeReading({ bundleId: "B-1", captureSha: S1, reading: { entities: [], at: "a", text_source: ocr("pdfjs", "4.2.67", first.calibration_id) } });
  w.x.writeReading({ bundleId: "B-1", captureSha: S2, reading: { entities: [], at: "a", text_source: ocr("pdfjs", "4.2.67", null) } });
  w.x.writeReading({ bundleId: "B-1", captureSha: S3, reading: { entities: [], at: "a", text_source: ocr("tesseract", "5.3.4", "CAL-999") } });
  const caps = () => w.x.transcribedDocuments({ viewer: "class:admin" }).documents.map((d) => [d.capture_sha, d.derivation_cap]);
  const capsBefore = caps();
  assert.deepEqual(capsBefore, [[S1, "C"], [S2, "C"], [S3, "C"]]);

  const second = w.cal.calibrationRecord(probe({ at: "2026-10-01T00:00:00Z", cap: "D", scores: { cer: 0.31 } }), { principal: "member:m1" });
  assert.deepEqual([second.supersedes, second.drift.verdict, second.regraded], [first.calibration_id, "worse", 0]);
  const drift = w.x.calibrationDrift({ viewer: "class:admin" });
  assert.deepEqual(drift.obligations.map((o) => [o.capture_sha, o.superseded_calibration, o.current_calibration, o.cap_when_graded, o.cap_now_measured, o.regraded]),
                   [[S1, first.calibration_id, second.calibration_id, "C", "D", false]]);
  assert.deepEqual(drift.obligations[0].reeval, { flag: true, since: "2026-10-01T00:00:00Z", source: "calibration" });
  assert.equal(drift.regraded, 0);
  assert.deepEqual(second.obligations, drift.obligations, "R40: the echo is op=calibrationdrift's rows");
  assert.deepEqual(caps(), capsBefore, "R44 (DEC-4): no derivation_cap moved, bound or unbound");

  /* a better measurement raises nothing, re-grades nothing, and the standing obligation stays the worse one's */
  const third = w.cal.calibrationRecord(probe({ at: "2026-11-01T00:00:00Z", cap: "B", scores: { cer: 0.005 } }), { principal: "member:m1" });
  assert.deepEqual([third.drift.verdict, third.obligations, third.regraded], ["better", [], 0]);
  const drift2 = w.x.calibrationDrift({ viewer: "class:admin" });
  assert.deepEqual(drift2.obligations.map((o) => [o.superseded_calibration, o.current_calibration]), [[first.calibration_id, second.calibration_id]]);
  assert.deepEqual(caps(), capsBefore);
});

/* ---- readingname.test.mjs, the backfill ---- */
const E = (kind, key, label, ref = `${kind}:${key}`, source = null, occurrences) =>
  ({ kind, key, label, facts: {}, ref, source, ...(occurrences ? { occurrences } : {}) });
const page = (p) => ({ kind: "pdf-page", ref: `p${p}`, page: p, rect: null });
const all = (w, t, order) => w.rows(`SELECT * FROM ${t} ORDER BY ${order}`);
const TERMS_ORDER = "capture_sha, ref, src, term";

test("R37 R19 R59 (readingname.test.mjs, the backfill): cleared name terms are re-derived by reindexNames from the stored references alone, every source (ref, key, label) exactly as the writer wrote them, a label-less reference's identifier terms included, no document re-read", () => {
  const w = fresh();
  bundle(w.s, "B-1"); bundle(w.s, "B-2");
  w.x.writeReading({ bundleId: "B-1", captureSha: S1, reading: { entities: [
    E("legislation", "26-0867", "Operational Agreement Between City Of Oakland And Alameda County For", undefined, page(0), [page(0), page(3)]),
    E("contract", "26-0955", null, "contract:26-0955"),
    E(null, "SOLO", null, "Solo") ], at: "a" } });
  w.x.writeReading({ bundleId: "B-2", captureSha: S2, reading: { entities: [
    E("legislation", "26-0817", "Construction Resource Center Grant Agreement For Mentor-Protégé Program") ], at: "a" } });
  /* what the writer wrote is exactly labelTerms of each source (R59) */
  const expected = [];
  for (const r of w.rows(`SELECT capture_sha, bundle_id, ref, ref_key, label FROM reading_refs WHERE seq = 0`))
    for (const [src, text] of refTermSources(r))
      for (const term of labelTerms(text)) expected.push({ capture_sha: r.capture_sha, bundle_id: r.bundle_id, ref: r.ref, src, term });
  const key = (x) => [x.capture_sha, x.ref, x.src, x.term].join("\u0000");
  expected.sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
  const written = all(w, "reading_ref_terms", TERMS_ORDER);
  assert.deepEqual(written.map((x) => ({ ...x })), expected);
  assert.deepEqual(written.filter((x) => x.ref === "contract:26-0955").map((x) => [x.src, x.term]),
                   [["key", "0955"], ["key", "26"], ["ref", "0955"], ["ref", "26"], ["ref", "contract"]], "the identifier tier of a reference with no label");
  assert.ok(written.some((x) => x.term === "protégé"), "diacritics not folded");

  const others = ["readings", "reading_refs", "reading_history", "reading_text_source", "capture_text"]
    .map((t) => all(w, t, "rowid"));

  /* a per-capture clear takes that capture's terms alone */
  const one = w.x.readingTermsClear({ captureSha: S2 });
  assert.deepEqual({ ...one }, { ok: true, cleared: S2, remaining: written.filter((x) => x.capture_sha === S1).length });
  const back2 = w.x.reindexNames({ limit: 500 });
  assert.deepEqual([back2.ok, back2.indexed, back2.remaining], [true, 1, 0]);

  const cleared = w.x.readingTermsClear({});
  assert.deepEqual([cleared.ok, cleared.remaining], [true, 0]);
  assert.equal(w.rows(`SELECT * FROM reading_ref_terms`).length, 0);
  const re = w.x.reindexNames({ limit: 500 });
  assert.deepEqual([re.ok, re.indexed, re.remaining], [true, 4, 0], "one per stored reference, whatever its occurrences");
  assert.deepEqual(all(w, "reading_ref_terms", TERMS_ORDER), written, "the backfill writes exactly what the writer wrote");
  assert.deepEqual(["readings", "reading_refs", "reading_history", "reading_text_source", "capture_text"].map((t) => all(w, t, "rowid")), others,
                   "no document re-read: nothing but the name terms written");
  /* references that already hold terms are not rewritten */
  const again = w.x.reindexNames({ limit: 500 });
  assert.deepEqual([again.indexed, again.remaining], [0, 0]);
});

/* ---- extractrun.test.mjs ---- */
test("R43 (extractrun.test.mjs §5): mintRatio answers ratio null when nothing was minted, saying so as an absence, else cited over minted with the uncited count", () => {
  for (const m of [mintRatio({}), mintRatio({ minted: 0, cited: 0 }), mintRatio()]) {
    assert.deepEqual([m.minted, m.cited, m.uncited, m.ratio], [0, 0, 0, null]);
    assert.match(m.says, /nothing to measure/);
    assert.match(m.says, /absence and not a clean result/);
  }
  const cited = mintRatio({ minted: 0, cited: 2 });
  assert.equal(cited.ratio, null, "nothing minted is null whatever was cited");
  assert.deepEqual((({ minted, cited, uncited, ratio }) => ({ minted, cited, uncited, ratio }))(mintRatio({ minted: 3, cited: 0 })),
                   { minted: 3, cited: 0, uncited: 3, ratio: 0 }, "zero cited of some minted is a ratio of 0, not null");
  assert.deepEqual((({ minted, cited, uncited, ratio }) => ({ minted, cited, uncited, ratio }))(mintRatio({ minted: 3, cited: 2 })),
                   { minted: 3, cited: 2, uncited: 1, ratio: 2 / 3 });
  assert.notEqual(mintRatio({}).says, mintRatio({ minted: 3, cited: 0 }).says, "the absence and the zero never read alike");
});

test("R43 R44 (extractrun.test.mjs §1, §6): proposalChain appends exactly ai(fn, version, cap) with the chain's derivation cap; a weaker cap is accepted; appendStep's refusal is returned unchanged; CAP_NOT_A_GRADE over a valid chain; NO_CAPTURE_CHAIN for none", () => {
  const CHAIN = layerChain({ tier: 1, container: "pdf", cap: "C", measured_by: "m" });
  const weaker = proposalChain(CHAIN, { fn: "propose-reading", version: " 1 ", cap: "D" });
  assert.deepEqual(weaker, { ok: true, chain: [...CHAIN, { step: "ai", engine: "propose-reading", version: "1", cap: "D" }],
                             cap: derivationCap(weaker.chain) });
  assert.equal(weaker.cap, "D");
  const kept = proposalChain(CHAIN, { fn: "propose-reading", version: "1" });
  assert.deepEqual(kept.chain.at(-1), { step: "ai", engine: "propose-reading", version: "1", cap: null });
  const stronger = proposalChain(CHAIN, { fn: "propose-reading", version: "1", cap: "A" });
  assert.deepEqual(stronger, { ok: false, ...appendStep(CHAIN, { step: "ai", engine: "propose-reading", version: "1", cap: "A" }) });
  assert.equal(proposalChain(CHAIN, { fn: "propose-reading", version: "1", cap: "Z" }).reason, "CAP_NOT_A_GRADE");
  const none = proposalChain(null, { fn: "propose-reading", version: "1" });
  assert.deepEqual([none.ok, none.reason], [false, "NO_CAPTURE_CHAIN"]);
  assert.equal(proposalChain([], { fn: "propose-reading", version: "1" }).reason, "NO_CAPTURE_CHAIN");
});

test("R41 R42 (extractrun.test.mjs §0, §2): the run mode is extract; the ceiling is B, a property of the grader: kind and key earn B even with a label, a label alone C, nothing null; a well-formed reference passes checkProposedRef", () => {
  assert.equal(EXTRACT_RUN_MODE, "extract");
  assert.deepEqual([PROPOSED_READING_CEILING,
                    proposedReadingGrade({ refKind: "contract", refKey: "C-1", label: "anything" }).grade,
                    proposedReadingGrade({ label: "a name" }).grade,
                    proposedReadingGrade({}).grade], ["B", "B", "C", null]);
  assert.equal(checkProposedRef({ ref: "x:1", refKind: "x", refKey: "1" }), null);
});
