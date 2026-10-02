/* extraction: the pure rules (R41–R43 in `extractrun.mjs`; R38 in `drift.mjs`) and the drift reads (R39, R40) at the
   module's interface, with the invariants they carry (R44, R48, R50). `readingprov.mjs`' rules are `reading-pipeline`'s
   since N513 (its R18, R19), and their cases moved with them. Each test names the requirement ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, calibration } from "./fixture.mjs";
import { driftObligations } from "../../../src/extraction/drift.mjs";
import { EXTRACT_RUN_MODE, EXTRACT_FUNCTIONS, checkExtractFunction, checkExtractVersion, proposedReadingGrade, checkProposedRef,
         proposalChain, mintRatio } from "../../../src/extractrun.mjs";
import { layerChain } from "../../../src/textchain.mjs";

const cal = (id, cap, at = "2026-09-01") => ({ calibration_id: id, engine: "tess", version: "5", at, cap, probe_id: "p", probe_inputs: ["x"], scores: [1], measured_by: "m" });

test("R38 R44: driftObligations names exactly the transcriptions bound to a calibration a worse one superseded, with both caps, the reeval flag and regraded false, sorted; nothing bound to a better, unsuperseded or absent calibration", () => {
  const worse = { superseded: cal("CAL-1", "B"), current: cal("CAL-2", "C", "2026-09-20"), verdict: "worse" };
  const better = { superseded: cal("CAL-3", "C"), current: cal("CAL-4", "B"), verdict: "better" };
  const bound = [{ id: "z", calibration_id: "CAL-1" }, { id: "a", calibration_id: "CAL-1" }, { id: "b", calibration_id: "CAL-3" },
                 { id: "c", calibration_id: "CAL-9" }, { id: "d", calibration_id: null }];
  const out = driftObligations([worse, better], bound);
  assert.deepEqual(out.map((o) => o.id), ["a", "z"]);
  assert.deepEqual([out[0].cap_when_graded, out[0].cap_now_measured, out[0].regraded], ["B", "C", false]);
  assert.deepEqual(out[0].reeval, { flag: true, since: "2026-09-20", source: "calibration" });
  assert.match(out[0].why, /NOTHING HAS BEEN RE-GRADED/);
});

test("R39 R48 R44: calibrationDrift derives on read over calibration's worse supersessions and the text-source rows naming a calibration, stores nothing, withholds hidden bundles, reads at most 5,000 rows with truncated, and answers regraded 0", async () => {
  const c = calibration({ worse: [{ superseded: cal("CAL-1", "B"), current: cal("CAL-2", "C"), verdict: "worse" }] });
  const w = fresh({ cal: c });
  bundle(w.s, "B-1"); bundle(w.s, "PROJ-1", { type: "project" });
  const chain = [{ step: "pixels", cap: "B", measured_by: "m", calibration: "CAL-1" },
                 { step: "ocr", engine: "tess", version: "5", cap: "B", measured_by: "m", calibration: "CAL-1" }];
  for (const [b, s] of [["B-1", "1".repeat(64)], ["PROJ-1", "2".repeat(64)]])
    w.x.writeReading({ bundleId: b, captureSha: s, reading: { entities: [], at: "a", text_source: chain } });
  const tablesBefore = w.rows(`SELECT count(*) n FROM sqlite_master`)[0].n;
  const seen = w.x.calibrationDrift({ viewer: "member:outsider" });
  assert.deepEqual([seen.count, seen.obligations[0].bundle_id, seen.regraded, seen.limit, seen.truncated], [1, "B-1", 0, 5000, false]);
  assert.equal(w.x.calibrationDrift({ viewer: "class:admin" }).count, 2);
  assert.equal(w.x.calibrationDrift({ engine: "other", viewer: "class:admin" }).count, 0);
  assert.equal(w.rows(`SELECT count(*) n FROM sqlite_master`)[0].n, tablesBefore, "nothing stored");
  const none = fresh({ cal: calibration() }).x.calibrationDrift({ viewer: "class:admin" });
  assert.deepEqual([none.count, none.regraded], [0, 0]);
});

test("R40: registered with calibration.onCalibration, the listener returns R39's obligations for the superseded calibration alone, unfiltered by viewer, with truncated; otherwise empty; it writes nothing, so the echo equals op=calibrationdrift's rows", async () => {
  const c = calibration({ worse: [{ superseded: cal("CAL-1", "B"), current: cal("CAL-2", "C"), verdict: "worse" },
                                  { superseded: cal("CAL-5", "B"), current: cal("CAL-6", "C"), verdict: "worse" }] });
  const w = fresh({ cal: c });
  assert.deepEqual(c.listeners.map((l) => l.module), ["extraction"]);
  bundle(w.s, "PROJ-1", { type: "project" });
  for (const [s, id] of [["1".repeat(64), "CAL-1"], ["2".repeat(64), "CAL-5"]])
    w.x.writeReading({ bundleId: "PROJ-1", captureSha: s, reading: { entities: [], at: "a",
      text_source: [{ step: "pixels", cap: "B", measured_by: "m", calibration: id }, { step: "ocr", engine: "tess", version: "5", cap: "B", measured_by: "m", calibration: id }] } });
  const [echo] = c.fire({ calibration_id: "CAL-2", engine: "tess", version: "5", supersedes: "CAL-1", drift: { verdict: "worse", raises_obligation: true, regrades: false } });
  assert.deepEqual(echo.obligations.map((o) => o.capture_sha), ["1".repeat(64)], "the superseded calibration alone, a hidden project's row included");
  assert.equal(echo.truncated, false);
  const drift = w.x.calibrationDrift({ viewer: "class:admin" }).obligations.filter((o) => o.superseded_calibration === "CAL-1");
  assert.deepEqual(echo.obligations, drift);
  const [same] = c.fire({ supersedes: "CAL-1", drift: { verdict: "same", raises_obligation: false } });
  assert.deepEqual(same, { obligations: [], truncated: false });
});

test("R40 R39: with calibration itself, op=calibrate's echo of a worse measurement is exactly op=calibrationdrift's rows for the superseded calibration, and nothing is re-graded", async () => {
  const w = fresh({ cal: "module" });
  bundle(w.s, "B-1");
  const probe = (over) => ({ engine: "tess", version: "5", at: "2026-09-01T00:00:00Z", cap: "B", probe_id: "P-1",
                             probe_inputs: { corpus: "c" }, scores: { cer: 0.02 }, ...over });
  const first = w.cal.calibrationRecord(probe(), { principal: "member:m1" });
  assert.equal(first.ok, true);
  assert.deepEqual(first.obligations, []);
  const id = first.calibration_id;
  w.x.writeReading({ bundleId: "B-1", captureSha: "1".repeat(64), reading: { entities: [], at: "a",
    text_source: [{ step: "pixels", cap: "B", measured_by: "m", calibration: id }, { step: "ocr", engine: "tess", version: "5", cap: "B", measured_by: "m", calibration: id }] } });
  const worse = w.cal.calibrationRecord(probe({ at: "2026-09-10T00:00:00Z", cap: "C" }), { principal: "member:m1" });
  assert.equal(worse.drift.raises_obligation, true);
  assert.equal(worse.obligations_raised, 1);
  assert.deepEqual(worse.obligations, w.x.calibrationDrift({ viewer: "class:admin" }).obligations);
  assert.equal(worse.regraded, 0);
  assert.equal(worse.obligations_truncated, false, "R40's truncated reaches op=calibrate's answer (K137)");
  const better = w.cal.calibrationRecord(probe({ at: "2026-09-20T00:00:00Z", cap: "A" }), { principal: "member:m1" });
  assert.deepEqual(better.obligations, []);
});

test("R41: the EXTRACT role's vocabulary: its run mode, the functions something emits, and the refusals of an unknown function and a missing version", () => {
  assert.equal(EXTRACT_RUN_MODE, "extract");
  assert.deepEqual(Object.keys(EXTRACT_FUNCTIONS), ["propose-reading"]);
  assert.equal(checkExtractFunction(undefined).reason, "NO_FUNCTION");
  assert.equal(checkExtractFunction("invent").reason, "UNKNOWN_FUNCTION");
  assert.equal(checkExtractFunction("propose-reading"), null);
  assert.equal(checkExtractVersion("").reason, "NO_FUNCTION_VERSION");
  assert.equal(checkExtractVersion("1"), null);
});

test("R42 R44: a proposed reading's grade is computed, never taken: kind and key B, a label alone C, nothing null, the sentence from the letter; the refusals of a malformed, graded, unreferenced, empty or unplaceable proposal, and nothing ever earns above B", () => {
  const b = proposedReadingGrade({ refKind: "meeting", refKey: "1" });
  assert.equal(b.grade, "B");
  assert.match(b.why, /^earned B/);
  for (const [e, g, w] of [[{ label: "Council" }, "C", /^earned C/], [{}, null, /^earned nothing/]])
    { const x = proposedReadingGrade(e); assert.equal(x.grade, g); assert.match(x.why, w); }
  const r = (e) => { const x = checkProposedRef(e); return x && x.reason; };
  assert.equal(r(null), "PROPOSAL_SHAPE");
  assert.equal(r({ ref: "m:1", refKind: "m", refKey: "1", grade: "A" }), "GRADE_OFFERED");
  assert.equal(r({ refKind: "m", refKey: "1" }), "PROPOSAL_NO_REF");
  assert.equal(r({ ref: "x:" }), "PROPOSAL_NAMES_NOTHING");
  assert.equal(r({ ref: "m:1", refKind: "m", refKey: "1", source: { kind: "pdf-page" } }), "PROPOSAL_POSITION");
  assert.equal(r({ ref: "m:1", refKind: "m", refKey: "1" }), null);
  /* PROPOSAL_ABOVE_CEILING: no proposal earns stronger than B, whatever it carries */
  for (const e of [{ refKind: "a", refKey: "b", label: "c", kind: "x", key: "y", ref: "a:b" }, { refKind: "a", refKey: "b", source_assigned: true }])
    assert.ok(["B", "C", null].includes(proposedReadingGrade(e).grade));
});

test("R43 R44: proposalChain appends ai(fn, version) through appendStep, refusing no capture chain and a cap that is not a grade, an absent cap undetermined; mintRatio null when nothing minted, else cited over minted", () => {
  const base = layerChain({ tier: 1, container: "pdf", cap: null, measured_by: "u" });
  const ok = proposalChain(base, { fn: "propose-reading", version: "1" });
  assert.equal(ok.ok, true);
  assert.equal(ok.chain[ok.chain.length - 1].step, "ai");
  assert.equal(ok.chain[ok.chain.length - 1].cap, null);
  assert.equal(proposalChain(null, { fn: "propose-reading", version: "1" }).reason, "NO_CAPTURE_CHAIN");
  assert.equal(proposalChain(base, { fn: "propose-reading", version: "1", cap: "Z" }).reason, "CAP_NOT_A_GRADE");
  assert.equal(proposalChain(base, { fn: "x", version: "1" }).reason, "UNKNOWN_FUNCTION");
  const strong = proposalChain(layerChain({ tier: 1, container: "pdf", cap: "C", measured_by: "m" }), { fn: "propose-reading", version: "1", cap: "A" });
  assert.equal(strong.ok, false, "appendStep's refusal returned: a step may not claim more than the chain it extends");
  assert.equal(mintRatio({ minted: 0, cited: 0 }).ratio, null);
  assert.deepEqual([mintRatio({ minted: 4, cited: 1 }).ratio, mintRatio({ minted: 4, cited: 1 }).uncited], [0.25, 3]);
});

test("R50: nothing this module says in its drift obligations, reads or refusals names a place", async () => {
  const c = calibration({ worse: [{ superseded: cal("CAL-1", "B"), current: cal("CAL-2", "C"), verdict: "worse" }] });
  const w = fresh({ cal: c });
  bundle(w.s, "B-1");
  w.x.writeReading({ bundleId: "B-1", captureSha: "1".repeat(64), reading: { entities: [], at: "a",
    text_source: [{ step: "pixels", cap: "B", measured_by: "m", calibration: "CAL-1" }, { step: "ocr", engine: "tess", version: "5", cap: "B", measured_by: "m", calibration: "CAL-1" }] } });
  const said = JSON.stringify([w.x.calibrationDrift({ viewer: "class:admin" }), w.x.readingFor("1".repeat(64)),
                               await w.x.pdfStructure({ ocr: "x", sha: "1".repeat(64) }), w.x.unitsOf("1".repeat(64))]);
  assert.doesNotMatch(said, /oakland|alameda|legistar/i);
});
