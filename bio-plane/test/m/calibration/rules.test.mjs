/* calibration: the pure rules (R1–R3) and the refusal rows (R14), requirement-named tests at the module's interface
   (build/requirements/calibration.md). Each test names the requirement ids it checks in its title. No storage. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { BASIS_GRADES } from "../../../checks/bio-checks.mjs";
import { checkCalibration, checkSignal, compare, drifted, nextProbeDue, cadenceSentence, DRIFT, PROBE_REQUIRED,
         CALIBRATION_CADENCE_MS, CALIBRATION_CHECKS } from "../../../src/calibration/index.mjs";

const DAY = 24 * 60 * 60 * 1000;
const cal = (over = {}) => ({ calibration_id: "CAL-1", engine: "pdfjs", version: "4.0", at: "2026-09-01T00:00:00Z",
  cap: "B", probe_id: "P-1", probe_inputs: { corpus: "c1" }, scores: { cer: 0.02 }, measured_by: "member:m1", ...over });

/* A refusal carries its catalogue row whole (R14). */
function refused(r, code) {
  assert.ok(r && r.ok === false, `refused ${code}`);
  assert.equal(r.code, code);
  assert.equal(r.check, CALIBRATION_CHECKS[code].check);
  assert.equal(r.translation, CALIBRATION_CHECKS[code].translation);
  assert.ok(typeof r.detail === "string" && r.detail.length > 0);
}

test("R1 R14: checkCalibration accepts a whole measurement, and a null cap, and every BASIS_GRADES letter", () => {
  assert.equal(checkCalibration(cal()), null);
  assert.equal(checkCalibration(cal({ cap: null })), null, "a null cap is legal");
  assert.equal(checkCalibration(cal({ cap: undefined })), null, "an absent cap is undetermined");
  for (const g of BASIS_GRADES) assert.equal(checkCalibration(cal({ cap: g })), null, g);
  assert.equal(checkCalibration(cal({ probe_inputs: "corpus c1", scores: "cer 0.02" })), null, "stated as text");
});

test("R1 R14: checkCalibration refuses CAL_SHAPE (C-42.1) for a non-object or a cap off the scale", () => {
  for (const v of [null, undefined, 7, "CAL", [], [cal()]]) refused(checkCalibration(v), "CAL_SHAPE");
  for (const c of ["E", "a", "b", "", 1, "AA", {}]) refused(checkCalibration(cal({ cap: c })), "CAL_SHAPE");
});

test("R1 R14: checkCalibration refuses CAL_UNNAMED (C-42.2) without both engine and version", () => {
  for (const over of [{ engine: undefined }, { engine: "" }, { engine: "  " }, { engine: 3 },
                      { version: undefined }, { version: "" }, { version: " " }, { version: 4 },
                      { engine: "", version: "" }])
    refused(checkCalibration(cal(over)), "CAL_UNNAMED");
});

test("R1 R14: checkCalibration refuses CAL_UNDATED (C-42.3) without the date the probe ran", () => {
  for (const at of [undefined, null, "", "   ", 1759000000000]) refused(checkCalibration(cal({ at })), "CAL_UNDATED");
});

test("R1 R14: checkCalibration refuses CAL_NO_PROBE (C-42.4) without a probe id, non-empty inputs and scores", () => {
  assert.deepEqual(PROBE_REQUIRED, ["probe_id", "probe_inputs", "scores"]);
  for (const field of PROBE_REQUIRED)
    for (const v of [undefined, null, "", "  ", {}, [], 0])
      refused(checkCalibration(cal({ [field]: v })), "CAL_NO_PROBE");
});

test("R2: compare is on caps — first is same, lost bound worse, gained bound better, two nulls same", () => {
  assert.equal(compare(cal(), null), DRIFT.SAME, "no previous");
  assert.equal(compare(cal(), undefined), DRIFT.SAME);
  for (const [i, a] of BASIS_GRADES.entries())
    for (const [j, b] of BASIS_GRADES.entries())
      assert.equal(compare(cal({ cap: a }), cal({ cap: b })), i === j ? DRIFT.SAME : i > j ? DRIFT.WORSE : DRIFT.BETTER,
                   `${b} -> ${a}`);
  for (const g of BASIS_GRADES) {
    assert.equal(compare(cal({ cap: null }), cal({ cap: g })), DRIFT.WORSE, `${g} -> null loses the bound`);
    assert.equal(compare(cal({ cap: g }), cal({ cap: null })), DRIFT.BETTER, `null -> ${g} gains one`);
  }
  assert.equal(compare(cal({ cap: null }), cal({ cap: null })), DRIFT.SAME);
});

test("R2: compare is incomparable for a malformed calibration on either side, or another engine", () => {
  assert.equal(compare(cal({ engine: "" }), cal()), DRIFT.INCOMPARABLE);
  assert.equal(compare(null, cal()), DRIFT.INCOMPARABLE);
  assert.equal(compare(cal(), cal({ scores: {} })), DRIFT.INCOMPARABLE);
  assert.equal(compare(cal(), { engine: "pdfjs" }), DRIFT.INCOMPARABLE);
  assert.equal(compare(cal({ engine: "tesseract", cap: "D" }), cal({ cap: "A" })), DRIFT.INCOMPARABLE);
});

test("R2 R13: drifted raises an obligation only for worse, and regrades is false on every branch", () => {
  assert.deepEqual(Object.values(DRIFT).sort(), ["better", "incomparable", "same", "worse"]);
  for (const v of [...Object.values(DRIFT), "sideways", null, undefined, 0]) {
    const d = drifted(v);
    assert.equal(d.raises_obligation, v === DRIFT.WORSE, String(v));
    assert.equal(d.regrades, false, String(v));
    assert.equal(d.verdict, Object.values(DRIFT).includes(v) ? v : DRIFT.INCOMPARABLE);
    assert.ok(d.why.length > 0);
  }
});

test("R3: nextProbeDue is at once for a never-probed engine, else never later than lastAt + 30 days", () => {
  assert.equal(CALIBRATION_CADENCE_MS, 30 * DAY);
  for (const lastAt of [null, undefined, NaN, "2026-09-01"]) {
    const d = nextProbeDue({ lastAt });
    assert.equal(d.at, 0, `never probed (${String(lastAt)}) is due at once`);
    assert.equal(d.from, "never-probed");
  }
  assert.equal(nextProbeDue().at, 0);
  const L = Date.UTC(2026, 8, 1);
  const plain = nextProbeDue({ lastAt: L });
  assert.equal(plain.at, L + CALIBRATION_CADENCE_MS);
  assert.equal(plain.cadence_at, L + CALIBRATION_CADENCE_MS);
  assert.equal(plain.from, "cadence");
  assert.equal(nextProbeDue({ lastAt: L, cadenceMs: 7 * DAY }).at, L + 7 * DAY);
  assert.match(cadenceSentence(), /every 30 day/);
});

test("R3: a signal can only bring the probe forward, never push it out", () => {
  const L = Date.UTC(2026, 8, 1), C = L + CALIBRATION_CADENCE_MS;
  assert.equal(nextProbeDue({ lastAt: L, signals: [{ probe_by: L + DAY }] }).at, L + DAY);
  assert.equal(nextProbeDue({ lastAt: L, signals: [{ probe_by: L + DAY }] }).from, "signal");
  assert.equal(nextProbeDue({ lastAt: L, signals: [{ probe_by: C + DAY }] }).at, C, "a later signal is no push");
  assert.equal(nextProbeDue({ lastAt: L, signals: [{ probe_by: 0 }] }).at, 0, "a past signal asks for now");
  assert.equal(nextProbeDue({ lastAt: L, signals: [{ probe_by: L + 5 * DAY }, { probe_by: L + 2 * DAY },
                                                   { probe_by: C + 9 * DAY }] }).at, L + 2 * DAY, "the earliest wins");
  assert.equal(nextProbeDue({ lastAt: L, signals: [null, {}, { probe_by: "soon" }, 5] }).at, C, "malformed ignored");
  assert.equal(nextProbeDue({ lastAt: L, signals: "x" }).at, C);
  for (let i = 0; i < 500; i++) {
    const signals = Array.from({ length: i % 5 }, (_, k) => ({ probe_by: L + ((i * 7919 + k * 104729) % 90) * DAY - 30 * DAY }));
    const d = nextProbeDue({ lastAt: L, signals });
    assert.ok(d.at <= C, "never later than the cadence");
    assert.equal(d.at, Math.min(C, ...signals.map((s) => s.probe_by)));
  }
});

test("R3 R14: checkSignal refuses a malformed signal CAL_SIGNAL_SHAPE (C-42.5) and one claiming a measurement (C-42.6)", () => {
  assert.equal(checkSignal({ engine: "pdfjs", source: "release notes" }), null);
  for (const s of [null, undefined, "x", [], { source: "notes" }, { engine: "", source: "notes" },
                   { engine: "pdfjs" }, { engine: "pdfjs", source: "  " }, { engine: 1, source: "n" }])
    refused(checkSignal(s), "CAL_SIGNAL_SHAPE");
  for (const over of [{ cap: "A" }, { cap: null }, { scores: {} }, { scores: { cer: 0.1 } }, { cap: "B", scores: 1 }])
    refused(checkSignal({ engine: "pdfjs", source: "notes", ...over }), "CAL_SIGNAL_CLAIMS_MEASUREMENT");
});

test("R14: the family's rows are C-42.1–C-42.10, one code one row, each with a translation", () => {
  const want = { CAL_SHAPE: "C-42.1", CAL_UNNAMED: "C-42.2", CAL_UNDATED: "C-42.3", CAL_NO_PROBE: "C-42.4",
                 CAL_SIGNAL_SHAPE: "C-42.5", CAL_SIGNAL_CLAIMS_MEASUREMENT: "C-42.6", CAL_CANNOT_REGRADE: "C-42.7",
                 CAL_UNATTRIBUTED: "C-42.8", CAL_SUBJECT_UNNAMED: "C-42.9", CAL_SUBJECT_NO_PROBE: "C-42.10" };
  assert.deepEqual(Object.fromEntries(Object.entries(CALIBRATION_CHECKS).map(([k, v]) => [k, v.check])), want);
  for (const [k, v] of Object.entries(CALIBRATION_CHECKS)) {
    assert.ok(typeof v.translation === "string" && v.translation.length > 40, k);
    assert.ok(typeof v.where === "string" && v.where.length > 0, k);
  }
});

test("R5 R14: checkCalibration refuses a measurement naming no one who ran it CAL_UNATTRIBUTED (C-42.8)", () => {
  for (const measured_by of [undefined, null, "", "   ", 7]) refused(checkCalibration(cal({ measured_by })), "CAL_UNATTRIBUTED");
});
