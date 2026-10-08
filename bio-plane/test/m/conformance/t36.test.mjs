/* T36-43 (N736; K2021, K2063, K2129): R27 reads `standards`' `bindsAt`, which reads its R20 as R51 amends it, so a
   standard with no stated end, known in force through a date (`standards` R50), binds the body up to that date and no
   further. Each test drives conformance at its interface, over the real standards (its `inForceThroughRecord`,
   `inForceThroughWithdraw`, `bindsAt` and `inForceAt`), entities and events. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { scene, V } from "./fixture.mjs";
import { CONFORMANCE_CHECKS } from "../../../src/conformance/index.mjs";

const refused = (r, code) => {
  assert.equal(r.ok, false, `expected ${code}, got ${JSON.stringify(r).slice(0, 300)}`);
  assert.equal(r.reason, code);
  if (CONFORMANCE_CHECKS[code]) assert.equal(r.check, CONFORMANCE_CHECKS[code].check);
};
const nothing = (w, fn) => { const before = w.snapshot(); const r = fn(); assert.deepEqual(w.snapshot(), before, "nothing written"); return r; };

const D = "2026-03-02";
const NEXT = "2026-03-03";

/* A scene with a standard the Parks Department issued, its period's end not stated (a null `to`), and a member's record
   that it is known in force through D, from a passage of a held capture (an upload: no receipt, `checked: "stated"`).
   The scene's act is dated D; `actAt(day)` is the same act's kind dated another day. */
function throughScene() {
  const s = scene();
  const { w } = s;
  const open = w.standard("Parks Code 12.08.040", { period: { from: "2020-01-01", to: null } });
  const portal = w.evidence("INFO-2026-0801-portal", "the code as published, current through 2 March 2026");
  const rec = w.standards.inForceThroughRecord({ standard: open, through: D,
    source: { captureSha: portal.cap.sha, extent: { kind: "pdf-page", page: 1 } },
    reason: "The city's code portal shows this section current through 2 March.", author: V("olive"), viewer: V("olive") });
  assert.equal(rec.ok, true, JSON.stringify(rec).slice(0, 300));
  const actAt = (day) => w.event(s.ev, { date: day });
  const det = (outcome, over = {}) => s.input({
    standards: [{ standard: open, outcome }],
    rows: [{ ...s.input().rows[0], standard: open, reading: outcome === "compliant" ? "aligns" : "diverges" }],
    ...over });
  const at = (day, outcome) => det(outcome, { act: { ...s.input().act, event: day === D ? s.act : actAt(day) } });
  return { ...s, open, portal, rec: rec.record, det, at, actAt };
}

test("R27 R3: a determination noncompliant against a standard with no stated end, on an act within a member's record that it is known in force through a date, reads it binding the body and is accepted; R3 reads it in force, naming the record", () => {
  const { w, open, rec, at } = throughScene();
  assert.equal(rec.through, D);
  assert.equal(rec.checked, "stated");
  /* standards' own answers, which R27 and R3 read */
  assert.equal(w.standards.bindsAt({ standard: open, body: "Parks Department", date: D, viewer: V("olive") }).state, "binds");
  const d = w.c.determine(at(D, "noncompliant"));
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 400));
  const [s] = d.standards;
  assert.deepEqual([s.standard, s.outcome, s.body, s.binds, s.label, s.binds_rests_on],
    [open, "noncompliant", "Parks Department", true, "Standard · binds Parks Department", [{ issuer: "Parks Department" }]]);
  assert.match(s.binds_why, /in force on 2026-03-02/);
  /* R3: in force on the act's day, from the record, nothing stated beside it */
  assert.deepEqual([s.in_force, s.in_force_why], ["in_force", null]);
  assert.match(w.standards.inForceAt({ standard: open, date: D, viewer: V("olive") }).why ?? "", /known in force through 2026-03-02/);
  /* the read answers the same as the act did */
  assert.deepEqual(w.c.determinationRead({ id: d.id, viewer: V("pat") }).standards, d.standards);
  assert.match(w.text(d.id), /Standard · binds Parks Department/);
});

test("R27: noncompliant on an act the day after the recorded through date is STANDARD_NOT_BINDING (C-113.32), bindingness undetermined, its detail saying no end is stated, writing nothing; noncompliant on an act within it is the negative control", () => {
  const { w, open, at } = throughScene();
  assert.equal(w.standards.bindsAt({ standard: open, body: "Parks Department", date: NEXT, viewer: V("olive") }).state, "undetermined");
  const asked = at(NEXT, "noncompliant");
  const r = nothing(w, () => w.c.determine(asked));
  refused(r, "STANDARD_NOT_BINDING");
  assert.deepEqual([r.standard, r.body, r.binds], [open, "Parks Department", "undetermined"]);
  assert.match(r.detail, /undetermined/);
  assert.match(r.detail, /does not state when it ceased to be in force/);
  assert.equal(CONFORMANCE_CHECKS.STANDARD_NOT_BINDING.check, "C-113.32");
  /* the negative control: the same standard and outcome on the act at the through date */
  assert.equal(w.c.determine(at(D, "noncompliant")).ok, true);
  /* a later record through a later date settles it: the act the day after then binds, and is recorded */
  const later = w.evidence("INFO-2026-0802-portal", "the code as published, current through 30 June 2026");
  const rec2 = w.standards.inForceThroughRecord({ standard: open, through: "2026-06-30",
    source: { captureSha: later.cap.sha, extent: { kind: "pdf-page", page: 1 } },
    reason: "The portal now shows the section current through 30 June.", author: V("olive"), viewer: V("olive") });
  assert.equal(rec2.ok, true, JSON.stringify(rec2).slice(0, 300));
  const settled = w.c.determine(asked);
  assert.deepEqual([settled.ok, settled.standards[0].binds], [true, true], JSON.stringify(settled).slice(0, 300));
});

test("R27: once the member's record is withdrawn, noncompliant on the act at the through date is STANDARD_NOT_BINDING again, bindingness undetermined, writing nothing; a determination made before the withdrawal stands as recorded", () => {
  const { w, open, rec, at } = throughScene();
  const before = w.c.determine(at(D, "noncompliant"));
  assert.equal(before.ok, true, JSON.stringify(before).slice(0, 300));
  const wd = w.standards.inForceThroughWithdraw({ record: rec.id, reason: "The portal page was a cached copy.",
                                                 author: V("olive"), viewer: V("olive") });
  assert.equal(wd.ok, true, JSON.stringify(wd).slice(0, 300));
  assert.equal(w.standards.bindsAt({ standard: open, body: "Parks Department", date: D, viewer: V("olive") }).state, "undetermined");
  const r = nothing(w, () => w.c.determine(at(D, "noncompliant")));
  refused(r, "STANDARD_NOT_BINDING");
  assert.deepEqual([r.standard, r.body, r.binds], [open, "Parks Department", "undetermined"]);
  assert.match(r.detail, /does not state when it ceased to be in force/);
  /* the determination recorded while the record stood is unchanged: R27's bindingness is held as read */
  const read = w.c.determinationRead({ id: before.id, viewer: V("pat") });
  assert.deepEqual([read.standards[0].binds, read.standards[0].label], [true, "Standard · binds Parks Department"]);
});

test("R3 R27: a compliant determination on the act the day after the through date is accepted, the standard's force stated undetermined beside it with its reason (no end is stated: the record does not state when it ceased to be in force) and its bindingness undetermined, never refused STANDARD_NOT_IN_FORCE", () => {
  const { w, open, at } = throughScene();
  for (const outcome of ["compliant", "unclear"]) {
    const asked = at(NEXT, outcome);
    if (outcome === "unclear") asked.questions = [{ question: "Was the section still in force on 3 March?" }];
    const d = w.c.determine(asked);
    assert.equal(d.ok, true, `${outcome}: ${JSON.stringify(d).slice(0, 400)}`);
    const [s] = d.standards;
    assert.deepEqual([s.outcome, s.in_force, s.binds, s.label], [outcome, "undetermined", "undetermined", "Whether this binds Parks Department is not recorded"]);
    assert.match(s.in_force_why, /2026-03-03/);
    assert.match(s.in_force_why, /does not state when it ceased to be in force/);
    assert.deepEqual(w.c.determinationRead({ id: d.id, viewer: V("pat") }).standards[0].in_force_why, s.in_force_why);
    assert.match(w.text(d.id), /whether it was in force is undetermined/);
  }
  /* within the record, the same compliant determination reads it in force, nothing stated beside it */
  const within = w.c.determine(at(D, "compliant"));
  assert.deepEqual([within.ok, within.standards[0].in_force, within.standards[0].in_force_why], [true, "in_force", null]);
});
