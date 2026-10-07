/* calibration: the words members read (DEC-149; plan T35-23, the L1–L7 sweep's seven rows for this module,
   `build/plan/draft-T35-dec149-l1-l7.md`), requirement-named tests at the module's interface. Each test names the
   requirement whose answer carries the string, and the sweep's row; each pins the string whole as members read it.
   The rule: the group's own Civicsmith is "your group's Civicsmith", never "instance", "plane", "copy" or "server";
   field and identifier names stay. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calibrationOf, calibrationOps, cadenceSentence, drifted, nextProbeDue, DRIFT, CALIBRATION_CHECKS }
  from "../../../src/calibration/index.mjs";
import { storage } from "./storage.mjs";

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2026, 8, 1);
const WHO = { principal: "member:m1" };
const probe = (over = {}) => ({ engine: "pdfjs", version: "4.0", at: "2026-09-01T00:00:00Z", cap: "B",
  probe_id: "P-1", probe_inputs: { corpus: "c1" }, scores: { cer: 0.02 }, ...over });
const fresh = () => { const clock = { t: T0 }; return { clock, c: calibrationOf({ storage: storage() }, { now: () => clock.t }) }; };

/* What DEC-149 retires, for the group's own Civicsmith. */
const RETIRED = /\binstances?\b|\bplanes?\b|\bcop(y|ies)\b|\bservers?\b/i;
const CADENCE = "one probe per calibratable engine every 30 day(s), which your group's Civicsmith runs on its own account";

test("R3 R6: the cadence's sentence says your group's Civicsmith runs the probe on its own account (DEC-149; T35-23, calibration.mjs:126)", () => {
  assert.equal(cadenceSentence(), CADENCE);
  assert.equal(cadenceSentence(7 * DAY),
    "one probe per calibratable engine every 7 day(s), which your group's Civicsmith runs on its own account");
  assert.equal(nextProbeDue({ lastAt: 0 }).why, `the declared cadence, ${CADENCE}`);
  assert.doesNotMatch(cadenceSentence(), RETIRED);
});

test("R2: a better measurement's why names your group's Civicsmith as the one that would be claiming (DEC-149; T35-23, calibration.mjs:287)", () => {
  assert.equal(drifted(DRIFT.BETTER).why,
    "this engine now measures BETTER. Nothing is raised and nothing moves: a grade rises only by an authored act, "
    + "so an automatic upgrade here would be your group's Civicsmith making a claim nobody authored (DEC-4)");
  for (const v of [...Object.values(DRIFT), "sideways"]) assert.doesNotMatch(drifted(v).why, RETIRED, String(v));
});

test("R12 R4: with no listener, calibrationRecord's why says no module derives obligations in your group's Civicsmith (DEC-149; T35-23, calibration/index.mjs:269)", () => {
  const { c } = fresh();
  const r = c.calibrationRecord(probe(), WHO);
  assert.equal(r.why,
    "CAL-1 records what probe P-1 measured of pdfjs 4.0 on 2026-09-01T00:00:00Z: fidelity B. "
    + drifted(DRIFT.SAME).why
    + ". No module derives obligations from calibrations in your group's Civicsmith, so none are named here "
    + "(null, not none found)");
  assert.doesNotMatch(r.why, RETIRED);
});

test("R6: calibrations' why counts the engines your group's Civicsmith probes, with the cadence (DEC-149; T35-23, calibration/index.mjs:301)", async () => {
  const { c } = fresh();
  await c.calibrationSubjectRegister({ engine: "pdfjs", probe_id: "P-1" });
  await c.calibrationSubjectRegister({ engine: "ocr", probe_id: "P-2" });
  const r = calibrationOps(c, new URL("http://x/?op=calibrations"), null).calibrations();
  assert.equal(r.why, `your group's Civicsmith probes 2 engine(s) — ${CADENCE}`);
  assert.equal(r.cadence, CADENCE);
  assert.doesNotMatch(r.why, RETIRED);
});

test("R6 R9: calibrations' why with no engine registered names your group's Civicsmith (DEC-149; T35-23, calibration/index.mjs:302)", () => {
  const { c } = fresh();
  const r = c.calibrations();
  assert.equal(r.why, "no engine is registered for calibration in your group's Civicsmith, so no probe is scheduled "
    + "and this consumer holds no alarm at all");
  assert.doesNotMatch(r.why, RETIRED);
});

test("R8: a registered subject's why says it is registered in your group's Civicsmith (DEC-149; T35-23, calibration/index.mjs:391)", async () => {
  const { c, clock } = fresh();
  const never = await c.calibrationSubjectRegister({ engine: "pdfjs", probe_id: "P-1" });
  assert.equal(never.why, "pdfjs is registered for calibration in your group's Civicsmith. Registering is not measuring: "
    + "no fidelity is claimed for it and nothing rests on it until a probe runs. Nothing has ever probed it, so a probe "
    + `is due immediately — ${CADENCE}`);
  c.calibrationRecord(probe(), WHO);
  clock.t = T0 + DAY;
  const probed = await c.calibrationSubjectRegister({ engine: "pdfjs", probe_id: "P-2" });
  assert.equal(probed.why, "pdfjs is registered for calibration in your group's Civicsmith. Registering is not measuring: "
    + "no fidelity is claimed for it and nothing rests on it until a probe runs. The next probe is due at its own "
    + `cadence — ${CADENCE}`);
  for (const r of [never, probed]) assert.doesNotMatch(r.why, RETIRED);
});

test("R9: the tick's why says your group's Civicsmith runs no derivation engine of its own (DEC-149; T35-23, calibration/index.mjs:436)", async () => {
  const { c } = fresh();
  await c.calibrationSubjectRegister({ engine: "pdfjs", probe_id: "P-1" });
  await c.calibrationSubjectRegister({ engine: "ocr", probe_id: "P-2" });
  const t = c.calibrationTick(T0);
  assert.equal(t.why, "2 engine(s) are due a calibration probe. Your group's Civicsmith runs no derivation engine of "
    + "its own, so the probe is OWED and not RUN — and the record says owed rather than quietly treating the last "
    + "measurement as current");
  assert.doesNotMatch(t.why, RETIRED);
});

test("R2 R3 R4 R6 R7 R8 R9 R12 R14: no text this module answers calls the group's Civicsmith an instance, plane, copy or server (DEC-149; T35-23)", async () => {
  const texts = [];
  const walk = (v) => { if (typeof v === "string") texts.push(v); else if (v && typeof v === "object") Object.values(v).forEach(walk); };
  const { c, clock } = fresh();
  walk(CALIBRATION_CHECKS);
  walk(c.calibrations()); walk(c.calibrationTick(T0));
  walk(await c.calibrationSubjectRegister({ engine: "pdfjs", probe_id: "P-1" }));
  walk(await c.calibrationSubjectRegister({}));
  walk(await c.calibrationSubjectRegister({ engine: "pdfjs" }));
  walk(await c.calibrationSignalRecord({ engine: "pdfjs", source: "notes" }));
  walk(await c.calibrationSignalRecord({ engine: "nobody", source: "notes" }));
  walk(await c.calibrationSignalRecord({ engine: "pdfjs" }));
  walk(await c.calibrationSignalRecord({ engine: "pdfjs", source: "n", cap: "A" }));
  walk(c.calibrationTick(T0));
  walk(c.calibrationRecord(probe({ cap: "A" }), WHO)); clock.t += DAY;
  walk(c.calibrationRecord(probe({ cap: "C", at: "2026-09-02" }), WHO)); clock.t += DAY;
  walk(c.calibrationRecord(probe({ cap: "A", at: "2026-09-03" }), WHO));
  for (const bad of [{ regrade: true }, { engine: "" }, { at: " ", cap: "Z" }, { cap: "Z" }, { scores: {} }])
    walk(c.calibrationRecord(probe(bad), WHO));
  walk(c.calibrationRecord(probe(), {}));
  c.onCalibration("extraction", () => []);
  walk(c.calibrationRecord(probe({ engine: "t", cap: null }), WHO));
  walk(c.calibrations()); walk(c.worseSupersessions());
  for (const v of [...Object.values(DRIFT), "sideways"]) walk(drifted(v));
  walk(nextProbeDue()); walk(nextProbeDue({ lastAt: T0 })); walk(nextProbeDue({ lastAt: T0, signals: [{ probe_by: T0 }] }));
  assert.ok(texts.length > 60);
  for (const t of texts) assert.doesNotMatch(t, RETIRED, t);
});
