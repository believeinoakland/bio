/* intent in T41: R32 (D13, inquiry R59's warning about a person in no public role, at a promotion that states or
   revises a project's objective or condition and at R16's `adopt`; never refused, her choice recorded) and R33 (H30 (1),
   a required stage met by a records request answered that no such record exists, through the reader `actions`
   registers with `registerNoneExistsReader`, here a stand-in). Each with a negative control (K874). */
import test from "node:test";
import assert from "node:assert/strict";
import { INTENT_CHECKS, NONE_EXISTS_SAYS } from "../../../src/intent/index.mjs";
import { INQUIRY_WARNINGS } from "../../../src/inquiry/index.mjs";
import { seeded, V, MACHINE, projMd } from "./fixture.mjs";

const COND_STAGES = { progression: "proc", entity: "ENT-1", relation: "member_of",
                      required: { grade: null, stages: ["need", "award"] }, satisfied: { share: 50 } };
const warningRows = (w) => w.rows(`SELECT project_id, act, proposal_key, persons, author, choice FROM intent_person_warnings ORDER BY seq`);

/* ENT-1 the condition's entity; ENT-2 and ENT-3 stand in member_of to it, each with `need` placed and `award` not;
   ENT-4 with both placed. PERSON-1 a person in no public role, PERSON-2 one holding a public role. */
async function world() {
  const w = seeded();
  for (const id of ["ENT-1", "ENT-2", "ENT-3", "ENT-4"]) w.entity(id, "contract");
  for (const id of ["ENT-2", "ENT-3", "ENT-4"]) w.relate(id, "ENT-1", "member_of");
  w.entity("PERSON-1", "person", "Jane Roe");
  w.entity("PERSON-2", "person", "Mayor Doe");
  w.persons.set("PERSON-1", { label: "Jane Roe", public_role: false });
  w.persons.set("PERSON-2", { label: "Mayor Doe", public_role: true });
  w.define();
  for (const id of ["ENT-2", "ENT-3"]) await w.thread(id, { need: "A" });
  await w.thread("ENT-4", { need: "A", award: "A" });
  return w;
}

const set = (w, condition, extra = {}) => w.i.setCondition({ reason: "Measured by the record.", project: w.P, condition,
                                                           author: V("bob"), viewer: V("bob"), ...extra });

test("R32 setting a condition that names a person in no public role carries inquiry R59's warning, never refused; it is recorded with her choice (warned at the act, or went on having seen it)", async () => {
  const w = await world();
  const r = set(w, { ...COND_STAGES, entity: "PERSON-1", relation: null });
  assert.equal(r.ok, true, "never refused");
  assert.equal(r.warning.code, "PERSON_IN_NO_PUBLIC_ROLE");
  assert.equal(r.warning.translation, INQUIRY_WARNINGS.PERSON_IN_NO_PUBLIC_ROLE.translation, "the same warning, inquiry R59's");
  assert.deepEqual(r.warning.persons, [{ entity_id: "PERSON-1", label: "Jane Roe" }]);
  assert.equal(r.warning.choice, "warned_at_act");
  assert.equal(r.warning.act, "condition");
  assert.equal(w.fm(w.P).objective_condition.entity, "PERSON-1", "the condition was written");
  /* she saw it before the act and went on: the choice recorded so */
  const again = set(w, { ...COND_STAGES, entity: "PERSON-1", relation: null, satisfied: { share: 60 } }, { personWarningSeen: true });
  assert.equal(again.ok, true);
  assert.equal(again.warning.choice, "went_on");
  assert.deepEqual(warningRows(w).map((x) => [x.project_id, x.act, x.proposal_key, JSON.parse(x.persons)[0].entity_id, x.author, x.choice]),
    [[w.P, "condition", null, "PERSON-1", V("bob"), "warned_at_act"], [w.P, "condition", null, "PERSON-1", V("bob"), "went_on"]]);
});

test("R32 negative controls: a condition naming a person holding a public role, or no person, or its removal, carries no warning and records none", async () => {
  const w = await world();
  for (const c of [{ ...COND_STAGES, entity: "PERSON-2", relation: null }, COND_STAGES, null]) {
    const r = set(w, c);
    assert.equal(r.ok, true);
    assert.equal(r.warning, undefined, JSON.stringify(c));
  }
  assert.equal(warningRows(w).length, 0);
  /* a refused act warns of nothing and writes nothing (R2's refusals unchanged) */
  const before = w.snapshot();
  assert.equal(set(w, { ...COND_STAGES, entity: "PERSON-1", relation: null }, { reason: " " }).reason, "INTENT_NO_REASON");
  assert.deepEqual(w.snapshot(), before);
});

test("R32 a promotion that states a project's objective (its creation) or revises it, naming a person in no public role, carries the warning, never refused; one leaving the objective and condition alone asks nothing", async () => {
  const w = await world();
  const made = w.promotion.promote({ base: null, snapKey: "t41-1", author: V("bob"), ownerMemberId: "bob",
    files: [{ path: "bundle.md", text: projMd("Roe review", "Find out what Jane Roe was paid.") }], meta: { object_type: "project" } });
  assert.equal(made.ok, true, "never refused");
  assert.equal(made.warning.code, "PERSON_IN_NO_PUBLIC_ROLE");
  assert.equal(made.warning.act, "objective");
  assert.deepEqual(made.warning.persons.map((p) => p.entity_id), ["PERSON-1"]);
  const Q = made.bundleId;
  /* a revision leaving the objective alone: nothing asked, nothing recorded */
  const n = warningRows(w).length;
  const kept = w.revise(Q, w.text(Q).replace("## Objective", "## Objective\n\nStill finding out."), V("bob"));
  assert.equal(kept.ok, true);
  assert.equal(kept.warning, undefined);
  assert.equal(warningRows(w).length, n);
  /* a revision of the objective, the package saying she saw the warning before the act */
  const revised = w.revise(Q, w.text(Q).replace(/^objective: .*$/m, 'objective: "Find out who paid Jane Roe."'), V("bob"),
                           { personWarningSeen: true });
  assert.equal(revised.ok, true);
  assert.equal(revised.warning.choice, "went_on");
  /* negative controls: an objective naming a person holding a public role, or no person, carries no warning */
  for (const objective of ["Find out what Mayor Doe signed.", "Find out what happened."]) {
    const r = w.revise(Q, w.text(Q).replace(/^objective: .*$/m, `objective: "${objective}"`), V("bob"));
    assert.equal(r.ok, true);
    assert.equal(r.warning, undefined, objective);
  }
  assert.deepEqual(warningRows(w).map((x) => [x.project_id, x.act, x.choice]),
                   [[Q, "objective", "warned_at_act"], [Q, "objective", "went_on"]]);
});

test("R32 R16 adopting a proposal that names a person in no public role carries the warning, never refused, recorded with the proposal and her choice; one naming no such person carries none", async () => {
  const w = await world();
  w.i.registerSource("tips", () => [
    { key: "roe", kind: "lead", grade: "C", basis: { entity: "PERSON-1" }, instances: [] },
    { key: "mayor", kind: "lead", grade: "C", basis: { entity: "PERSON-2" }, instances: [{ entity_id: "ENT-2" }] },
    { key: "seen", kind: "lead", grade: "C", basis: {}, instances: [{ entity_id: "PERSON-1" }] },
  ]);
  const adopt = (key, extra = {}) => w.i.triage({ proposal: `tips::${key}`, act: "adopt", project: w.P, author: V("bob"),
                                                  viewer: V("bob"), ...extra });
  const r = adopt("roe");
  assert.equal(r.ok, true, "never refused");
  assert.equal(r.warning.code, "PERSON_IN_NO_PUBLIC_ROLE");
  assert.equal(r.warning.act, "adopt");
  assert.equal(r.warning.choice, "warned_at_act");
  const seen = adopt("seen", { personWarningSeen: true });
  assert.equal(seen.ok, true);
  assert.equal(seen.warning.choice, "went_on", "an instance's entity is asked too");
  /* negative control */
  const mayor = adopt("mayor");
  assert.equal(mayor.ok, true);
  assert.equal(mayor.warning, undefined);
  assert.deepEqual(warningRows(w).map((x) => [x.project_id, x.act, x.proposal_key, x.choice]),
                   [[w.P, "adopt", "tips::roe", "warned_at_act"], [w.P, "adopt", "tips::seen", "went_on"]]);
  /* the other acts are not R32's: deferring one naming her asks nothing */
  w.i.registerSource("more", () => [{ key: "roe2", kind: "lead", basis: { entity: "PERSON-1" } }]);
  const d = w.i.triage({ proposal: "more::roe2", act: "defer", reason: "later", project: w.P, author: V("bob"), viewer: V("bob") });
  assert.equal(d.ok, true);
  assert.equal(d.warning, undefined);
});

test("R33 registerNoneExistsReader registers once a function; anything else, or a second, is refused with its row", async () => {
  const w = await world();
  const bad = w.i.registerNoneExistsReader("not a function");
  assert.equal(bad.ok, false);
  assert.equal(bad.reason, "NONE_EXISTS_READER_MALFORMED");
  assert.equal(bad.check, INTENT_CHECKS.NONE_EXISTS_READER_MALFORMED.check);
  assert.equal(w.i.registerNoneExistsReader(() => []).ok, true);
  const twice = w.i.registerNoneExistsReader(() => []);
  assert.equal(twice.reason, "NONE_EXISTS_READER_DECLARED");
  assert.ok(twice.translation);
});

test("R33 R4 R6 an instance short of a required stage meets it when the record holds a records request for that stage answered that no such record exists, stated beside it with the first answer's action; met is computed on every read, never declared", async () => {
  const w = await world();
  assert.equal(set(w, COND_STAGES).ok, true);
  const answers = new Map([["proc|ENT-2|award", [{ action: "ACT-2026-0001-records", ord: 3, at: "2026-09-20T00:00:00Z" },
                                                 { action: "ACT-2026-0002-records", ord: 1, at: "2026-09-21T00:00:00Z" }]]]);
  const asked = [];
  w.i.registerNoneExistsReader((q) => { asked.push(q); return answers.get(`${q.progression}|${q.entity}|${q.stage}`) ?? []; });
  const r = w.i.progress({ project: w.P, viewer: V("bob") });
  const meeting = r.instances.meeting.map((x) => x.entity_id).sort();
  assert.deepEqual(meeting, ["ENT-2", "ENT-4"], "ENT-2's award met by the answer");
  assert.deepEqual(r.instances.meeting.find((x) => x.entity_id === "ENT-2").none_exists,
                   [{ stage: "award", action: "ACT-2026-0001-records", ord: 3, at: "2026-09-20T00:00:00Z", says: NONE_EXISTS_SAYS }]);
  assert.equal(NONE_EXISTS_SAYS, "answered: none exists");
  assert.equal(r.instances.meeting.find((x) => x.entity_id === "ENT-4").none_exists, undefined, "a placed stage is not asked");
  /* negative control: ENT-3, whose request the reader does not answer, stays short of award */
  assert.deepEqual(r.short.map((x) => [x.entity_id, x.why]), [["ENT-3", { stages_missing: ["award"] }]]);
  assert.ok(asked.some((q) => q.entity === "ENT-3" && q.stage === "award" && q.viewer === V("bob")));
  assert.ok(!asked.some((q) => q.stage === "need"), "only a required stage not placed is asked");
  assert.deepEqual(w.i.gaps({ project: w.P, viewer: V("bob") }).gaps.map((g) => g.basis.entity), ["ENT-3"]);
  /* computed, never declared: a read writes nothing, and when the record no longer answers so, the stage is short again */
  const snap = w.snapshot();
  w.i.progress({ project: w.P, viewer: V("bob") });
  assert.deepEqual(w.snapshot(), snap);
  answers.clear();
  const after = w.i.progress({ project: w.P, viewer: V("bob") });
  assert.deepEqual(after.short.map((x) => x.entity_id).sort(), ["ENT-2", "ENT-3"]);
});

test("R33 negative controls: with no reader registered, or one answering [], or one that throws or answers no action, no stage is met this way; a required grade is still the record's", async () => {
  const none = await world();
  assert.equal(set(none, COND_STAGES).ok, true);
  assert.deepEqual(none.i.progress({ project: none.P, viewer: V("bob") }).short.map((x) => x.entity_id).sort(), ["ENT-2", "ENT-3"]);
  for (const reader of [() => [], () => { throw new Error("down"); }, () => [{ ord: 1 }], () => "yes"]) {
    const w = await world();
    assert.equal(set(w, COND_STAGES).ok, true);
    w.i.registerNoneExistsReader(reader);
    const r = w.i.progress({ project: w.P, viewer: V("bob") });
    assert.deepEqual(r.short.map((x) => x.entity_id).sort(), ["ENT-2", "ENT-3"], String(reader));
    assert.ok(!r.short.some((x) => "none_exists" in x));
  }
  /* a stage met by an answer places no document, so a required grade over fewer than two placed stages is undetermined,
     never meeting */
  const w = await world();
  assert.equal(set(w, { ...COND_STAGES, required: { grade: "B", stages: ["need", "award"] } }).ok, true);
  w.i.registerNoneExistsReader((q) => (q.entity === "ENT-2" ? [{ action: "ACT-1", ord: 1, at: null }] : []));
  const r = w.i.progress({ project: w.P, viewer: V("bob") });
  const e2 = r.undetermined.find((x) => x.entity_id === "ENT-2");
  assert.ok(e2, "undetermined, not meeting");
  assert.equal(e2.none_exists[0].action, "ACT-1");
  assert.ok(!r.instances.meeting.some((x) => x.entity_id === "ENT-2"));
});

test("R33 R7 R28 the stage met this way changes what watchSet and servesOf read through the same measure, under their own sight", async () => {
  const w = await world();
  assert.equal(set(w, COND_STAGES).ok, true);
  const before = w.i.watchSet({ project: w.P });
  const viewers = [];
  w.i.registerNoneExistsReader((q) => { viewers.push(q.viewer); return q.entity === "ENT-2" ? [{ action: "ACT-1", ord: 1, at: null }] : []; });
  const after = w.i.watchSet({ project: w.P });
  assert.deepEqual(after.entities, before.entities, "the condition's entities are what it reads, met or not");
  assert.ok(viewers.includes(null), "watchSet reads as the plane, no viewer");
  viewers.length = 0;
  w.i.servesOf({ bundles: ["INFO-ENT-2-need"] });
  assert.ok(viewers.includes("class:daemon"), "servesOf reads under the plane's sight");
  /* a machine's act is still refused before anything is asked (R2) */
  assert.equal(set(w, COND_STAGES, { author: MACHINE }).reason, "MACHINE_CANNOT_SET_OBJECTIVE");
});
