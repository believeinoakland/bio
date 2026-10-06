/* money-checks R8, R9, R10, R13, R14: gates, and what is shown: only results of gated, switched-on detector versions,
   to a viewer who may see every input, labelled the machine's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, shareDetector, ALICE, ADMIN_BOB, FORBIDDEN, texts } from "./fixture.mjs";

const P = "PROJ-2026-0001-alpha";
function seeded() {
  const w = world();
  w.project(P, ["alice", "bob"]);
  w.entity("ENT-2026-0010", "institution");
  w.entity("ENT-2026-0011", "institution");
  w.fact("MNY-2026-f1", { to: "ENT-2026-0010", amount: "800" });
  w.fact("MNY-2026-f2", { to: "ENT-2026-0011", amount: "200" });
  const d = w.c.defineDetector(shareDetector());
  w.c.runDetectors({ budgetMs: 10_000 });
  return { w, d };
}
const gate = (w, d, rate, by = ADMIN_BOB) => w.c.recordGate({ detectorId: d.detector_id, version: d.version, goldSet: "desk gold set 1", falseAlarmRate: rate, by });

test("R8: recordGate records a version's rate with who and when; refusals", () => {
  const { w, d } = seeded();
  assert.equal(w.c.recordGate({ detectorId: d.detector_id, version: 1, goldSet: "g", falseAlarmRate: 0.1, by: ALICE }).reason, "NOT_AN_ADMIN");
  assert.equal(w.c.recordGate({ detectorId: d.detector_id, version: 9, goldSet: "g", falseAlarmRate: 0.1, by: ADMIN_BOB }).reason, "NO_SUCH_DETECTOR");
  assert.equal(gate(w, { ...d, detector_id: "" }, 0.1).reason, "NO_SUCH_DETECTOR");
  assert.equal(w.c.recordGate({ detectorId: d.detector_id, version: 1, goldSet: " ", falseAlarmRate: 0.1, by: ADMIN_BOB }).reason, "NO_GOLD_SET");
  for (const bad of [1.5, -0.1, "x", "1e-3", null]) assert.equal(gate(w, d, bad).reason, "BAD_RATE", String(bad));
  assert.equal(w.count("money_detector_gates"), 0);
  for (const ok of [0, 1, "0.2"]) assert.equal(gate(w, d, ok).ok, true);
  const g = w.c.detectors({ viewer: ALICE }).detectors.find((x) => x.detector_id === d.detector_id).versions[0];
  assert.equal(g.gates.length, 3);
  assert.equal(g.gate.false_alarm_rate, "0.2");
  assert.equal(g.gate.by, ADMIN_BOB);
  assert.equal(g.gate.shown, true);
});

test("R9: nothing is shown before a rate is recorded, or above 20%; at or under 20% the result is shown, labelled the machine's", () => {
  const { w, d } = seeded();
  assert.deepEqual(w.c.noticed({ project: P, viewer: ALICE }).items, []);
  gate(w, d, "0.21");
  assert.deepEqual(w.c.noticed({ project: P, viewer: ALICE }).items, []);
  gate(w, d, "0.20");
  const r = w.c.noticed({ project: P, viewer: ALICE });
  assert.equal(r.items.length, 1);
  const it = r.items[0];
  assert.equal(it.label, "Noticed");
  assert.equal(it.by, "the machine");
  assert.equal(it.kind, "signal");
  assert.equal(it.layer, "hypothesis");
  assert.equal(it.derivation.method, "bio-calc/1");
  assert.equal(it.numerator.value, "800");
  assert.equal(it.denominator.value, "1000");
  assert.equal(it.gate.false_alarm_rate, "0.20");
  /* a new version is ungated until its own rate is recorded */
  w.c.defineDetector(shareDetector({ detectorId: d.detector_id }));
  w.c.runDetectors({ budgetMs: 10_000 });
  assert.deepEqual(w.c.noticed({ project: P, viewer: ALICE }).items, []);
});

test("R9 R5: a detector switched off for the project shows nothing there", () => {
  const { w, d } = seeded();
  gate(w, d, 0.1);
  w.c.switchDetector({ detectorId: d.detector_id, project: P, on: false, by: ALICE });
  assert.deepEqual(w.c.noticed({ project: P, viewer: ALICE }).items, []);
  w.c.switchDetector({ detectorId: d.detector_id, project: P, on: true, by: ALICE });
  assert.equal(w.c.noticed({ project: P, viewer: ALICE }).items.length, 1);
});

test("R9: bounded 1–500 with truncated; refusals", () => {
  const w = world();
  w.project(P, ["alice"]);
  for (let i = 0; i < 4; i++) { w.entity(`ENT-2026-002${i}`, "institution"); w.fact(`MNY-2026-g${i}`, { to: `ENT-2026-002${i}`, amount: "100" }); }
  const d = w.c.defineDetector(shareDetector({ parameters: [{ name: "share", value: "0.1", citation: "x" }] }));
  w.c.runDetectors({ budgetMs: 10_000 });
  gate(w, d, 0);
  const r = w.c.noticed({ project: P, viewer: ALICE, limit: 3 });
  assert.equal(r.items.length, 3);
  assert.equal(r.truncated, true);
  assert.equal(w.c.noticed({ project: P, viewer: ALICE, limit: 4 }).truncated, false);
  assert.equal(w.c.noticed({ project: P, viewer: ALICE }).items.length, 4);
  for (const bad of [0, 501, "x", 2.5]) assert.equal(w.c.noticed({ project: P, viewer: ALICE, limit: bad }).reason, "BAD_LIMIT");
  assert.equal(w.c.noticed({ project: "", viewer: ALICE }).reason, "NO_PROJECT");
  assert.equal(w.c.noticed({ project: "PROJ-2026-0404-none", viewer: ALICE }).reason, "NO_SUCH_PROJECT");
});

test("R13: a result is answered only to a viewer who may see every input; one inside a hidden project stays fenced and uncounted", () => {
  const w = world();
  w.project(P, ["alice", "carol"]);
  w.project("PROJ-2026-0002-hidden", ["bob"]);
  w.member("carol");
  w.bundle("INFO-2026-0001-secret", "information", "PROJ-2026-0002-hidden");
  w.entity("ENT-2026-0010", "institution");
  w.entity("ENT-2026-0011", "institution");
  w.fact("MNY-2026-f1", { to: "ENT-2026-0010", amount: "800" });
  w.fact("MNY-2026-f2", { to: "ENT-2026-0011", amount: "200", bundle: "INFO-2026-0001-secret" });
  const d = w.c.defineDetector(shareDetector());
  w.c.runDetectors({ budgetMs: 10_000 });
  gate(w, d, 0.1);
  const alice = w.c.noticed({ project: P, viewer: ALICE });
  assert.deepEqual(alice.items, []);
  assert.equal(alice.truncated, false);
  assert.equal(JSON.stringify(alice).includes("MNY-2026-f2"), false);
  /* an administrator sees every bundle (membership R43) and so every input */
  assert.equal(w.c.noticed({ project: P, viewer: ADMIN_BOB }).items.length, 1);
});

test("R10 R14: a shown result is never a fact, never on a person or entity, and says no verdict", () => {
  const { w, d } = seeded();
  gate(w, d, 0.1);
  const before = w.snapshot();
  const r = w.c.noticed({ project: P, viewer: ALICE });
  assert.deepEqual(w.snapshot(), before);
  const all = texts(r).join(" ");
  assert.doesNotMatch(all, FORBIDDEN);
  assert.doesNotMatch(all, /oakland/i);
  assert.notEqual(r.items[0].kind, "fact");
  assert.equal(r.items[0].subject.kind, "pattern");
  /* every detector text too, and every refusal sentence */
  assert.doesNotMatch(texts(w.c.detectors({ viewer: ALICE })).join(" "), FORBIDDEN);
});
