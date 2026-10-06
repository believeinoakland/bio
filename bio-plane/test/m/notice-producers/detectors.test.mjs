/* R3, R7, R8, R9: money-detector "Noticed" items over the real `money-checks` (its R6–R10), on its own test world. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, shareDetector, ALICE, ADMIN_BOB } from "../money-checks/fixture.mjs";
import { producers, fresh, reader, ofKind, sentences, texts, JUDGMENT } from "./fixture.mjs";
import { TAKE_UP, NOTICED_LABEL } from "../../../src/notice-producers/index.mjs";

const NOW = "2026-10-06T12:00:00Z";
const P = "PROJ-2026-0001-alpha", Q = "PROJ-2026-0003-beta", H = "PROJ-2026-0002-hidden";
const gate = (w, d, rate) => w.c.recordGate({ detectorId: d.detector_id, version: d.version, goldSet: "desk gold set", falseAlarmRate: rate, by: ADMIN_BOB });

/* Two payees, one with 80% of the paid amounts (past the stated half), the detector run; `hidden` files the second
   payee's fact in a project alice is not in. */
function setup({ hidden = false } = {}) {
  const w = world();
  w.member("carol");
  w.project(P, ["alice", "carol"]);
  if (hidden) { w.project(H, ["bob"]); w.bundle("INFO-2026-0001-secret", "information", H); }
  w.entityAs("ENT-2026-0010", "institution");
  w.entityAs("ENT-2026-0011", "institution");
  w.factAs("MNY-2026-f1", { to: "ENT-2026-0010", amount: "800" });
  w.factAs("MNY-2026-f2", { to: "ENT-2026-0011", amount: "200", ...(hidden ? { bundle: "INFO-2026-0001-secret", by: ADMIN_BOB } : {}) });
  const d = w.c.defineDetector(shareDetector());
  w.c.runDetectors({ budgetMs: 10_000 });
  const n = producers(w.host, { membership: w.membership, moneyChecks: w.c });
  return { w, d, ...reader(n) };
}

test("R3 R9: no item before a rate is recorded, nor above 20%; at or under 20% one FINDING money-detector-noticed per result, keyed by detector and result, labelled the machine's", () => {
  const { w, d, read } = setup();
  assert.deepEqual(ofKind(read("alice", { now: NOW }), "money-detector-noticed"), []);
  gate(w, d, "0.21");
  assert.deepEqual(ofKind(read("alice", { now: NOW }), "money-detector-noticed"), []);
  gate(w, d, "0.20");
  const items = ofKind(read("alice", { now: NOW }), "money-detector-noticed");
  assert.equal(items.length, 1);
  const x = w.c.noticed({ project: P, viewer: ALICE }).items[0];
  const it = items[0];
  assert.equal(it.id, `FINDING::money-detector-noticed::${x.detector_id}::${x.result_id}`);
  assert.equal(it.class, "FINDING");
  assert.equal(it.label, NOTICED_LABEL);
  assert.equal(it.layer, "hypothesis");
  assert.equal(it.by, "the machine's");
  assert.deepEqual(it.recipients, ["alice"]);
  assert.deepEqual(it.case.ancestors.map((a) => a.id), [P]);
});

test("R3: detail, label and words as R2's: its denominator and derivation stated, the subject a pattern over facts, no judgment of anyone", () => {
  const { w, d, read } = setup();
  gate(w, d, 0.1);
  const it = ofKind(read("alice", { now: NOW }), "money-detector-noticed")[0];
  assert.equal(it.basis.denominator.value, "1000");
  assert.equal(it.basis.numerator.value, "800");
  assert.match(it.detail, /800 of 1000/);
  assert.equal(it.basis.derivation.method, "bio-calc/1");
  assert.ok(it.basis.inputs.length > 0 && it.basis.inputs.every((i) => i.fact_id), "each input cited");
  assert.notEqual(it.subject.kind, "person");
  assert.equal(it.subject.about.kind, "pattern");
  for (const s of sentences(it)) assert.doesNotMatch(s, JUDGMENT, s);
});

test("R3 R7: only to members of that project who may see every input; one resting on a hidden project's fact reaches no outsider and is counted nowhere", () => {
  const { w, d, read } = setup({ hidden: true });
  gate(w, d, 0.1);
  const r = read("alice", { now: NOW });
  assert.deepEqual(ofKind(r, "money-detector-noticed"), []);
  assert.ok(!texts(r).some((t) => t.includes(H) || t.includes(w.id("MNY-2026-f2"))), "nothing names the hidden project or its fact");
  assert.deepEqual(r.facts.money_detector, { truncated: false });
  /* the control: an administrator who joins the project sees every input, so receives it */
  w.st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES (?,?,?,?,?)`, P, "bob", "joined", NOW, NOW);
  assert.equal(ofKind(read("bob", { now: NOW }), "money-detector-noticed").length, 1);
});

test("R3: switched off for a project, a detector raises nothing there; a member of no project, a machine and no member receive none", () => {
  const { w, d, read } = setup();
  gate(w, d, 0.1);
  w.project(Q, ["carol"]);
  assert.deepEqual(ofKind(read("carol", { now: NOW }), "money-detector-noticed")[0].basis.projects, [P, Q]);
  w.c.switchDetector({ detectorId: d.detector_id, project: P, on: false, by: ALICE });
  assert.deepEqual(ofKind(read("alice", { now: NOW }), "money-detector-noticed"), []);
  assert.deepEqual(ofKind(read("carol", { now: NOW }), "money-detector-noticed")[0].basis.projects, [Q]);
  w.member("dave");
  assert.deepEqual(read("dave", { now: NOW }).items, []);
  assert.deepEqual(read("class:daemon", { viewer: "class:daemon" }).items, []);
  assert.deepEqual(read(null).items, []);
});

test("R3: raised once per result (the same key on every read); it leaves when the result no longer holds", () => {
  const { w, d, read } = setup();
  gate(w, d, 0.1);
  const a = ofKind(read("alice", { now: NOW }), "money-detector-noticed").map((i) => i.id);
  assert.deepEqual(ofKind(read("alice", { now: NOW }), "money-detector-noticed").map((i) => i.id), a);
  /* a new version is ungated until its own rate is recorded */
  w.c.defineDetector(shareDetector({ detectorId: d.detector_id }));
  w.c.runDetectors({ budgetMs: 10_000 });
  assert.deepEqual(ofKind(read("alice", { now: NOW }), "money-detector-noticed"), []);
});

test("R8: a detector item offers only taking it up; never a citation; the read writes nothing", () => {
  const { w, d, read } = setup();
  gate(w, d, 0.1);
  const before = w.snapshot();
  const it = ofKind(read("alice", { now: NOW }), "money-detector-noticed")[0];
  assert.deepEqual(w.snapshot(), before);
  assert.deepEqual(it.options, [TAKE_UP]);
});

test("R9: a second guard: a result whose gate is absent or above 20% is never raised, whatever the provider answers", () => {
  const { w } = setup();
  for (const g of [undefined, null, {}, { false_alarm_rate: "0.5" }, { false_alarm_rate: "x" }, { false_alarm_rate: "0.2" }]) {
    const n = fresh(w.host, { membership: w.membership, moneyChecks: { noticed: ({ project }) => ({ ok: true, project, truncated: false,
      items: [{ result_id: "r1", detector_id: "md-x", version: 1, label: "Noticed", subject: { kind: "pattern" }, inputs: [], at: NOW, gate: g }] }) } });
    const got = ofKind(reader(n).read("alice", { now: NOW }), "money-detector-noticed");
    assert.equal(got.length, g && g.false_alarm_rate === "0.2" ? 1 : 0, JSON.stringify(g));
  }
});
