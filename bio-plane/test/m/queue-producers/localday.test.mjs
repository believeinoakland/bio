/* R36 and R25 (C-3b; K1444 (iii); DEC-110 (1); T45, K2781 (1)): since T45 the Action layer's dated items (was R15, R16,
   R18, R21) are action-producers', which carries both rules for them (its R18, R20), and this module derives no day of
   its own. Driven at feedItems' interface in a zone west of UTC at the day boundary, where the UTC day and the local day
   differ (the read's instant, 2026-09-01T00:00:00Z, is 2026-08-31 17:00 in Los Angeles), and with no zone held: every item
   this module produces is the same whatever zone the instance holds, none counts days or is dated at a UTC midnight, R37's
   time is the one set and never converted, and none carries `due`; an item action-producers answers keeps its own. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso, said, atWord, DOCKET } from "./world.mjs";

const LA = "America/Los_Angeles";
const placeOf = (zone) => () => (zone === null ? { time_zone: null } : { time_zone: { value: zone, status: "ruled", basis: "TEST" } });

/* Every producer of this module answering something (its own kinds; machinery-producers', whose days are its R10, answer
   nothing here), and an action-producers item carrying its own `due`. */
function dated(zone) {
  const IMP = "c".repeat(64);
  const w = world({
    actions: { place: placeOf(zone) },
    bias: { uncleared: ({ limit }) => ({ limit, truncated: false,
      debts: [{ run: "r1", context_type: "inquiry", context_id: "INQ-S", recipients: [], raised: iso(NOW - 10) }] }) },
    progressions: { proposalsFeed: () => ({ instances: [], dispositions: [], proposals: [
      { key: "p::s", progression_key: "p", progression_label: "P", stage_key: "s", stage_label: "S", required: "always",
        definition_version: 1, n: 1, kinds: ["missing_predecessor"], grade: null, grade_determined: false, overdue: false,
        overdue_count: 0, surfaced_by: "machine", prior_disposition: null, instances: [{ progression_key: "p", entity_id: "E" }] }] }) },
    corpusExport: { exportLog: () => ({ ok: true, limit: 200, truncated: false,
      exports: [{ seq: 1, at: "2026-08-31T23:30:00Z", scope: "working-corpus", bundles: 1, files: 1, note: null }] }) },
    reevaluation: { notices: () => ({ ok: true, limit: 1000, truncated: false, notices: [
      { notice: "RN-1", holder: "INQ-S", target: "INF-1", grade: "affected", raised_at: "2026-08-31T03:00:00Z", state: "open" }] }),
      correctedDependents: () => ({ ok: true, entries: [], truncated: false, cursor: null }),
      docketDependents: () => ({ ok: true, truncated: false, cursor: null, entries: [
        { dependent: "INQ-S", entry: "CASE-W#3", kind: "withdrawal", case: "CASE-W", since: "2026-08-31T06:00:00Z", withdrawn_editions: [1], legs: [] }] }),
      citedCaseDependents: () => ({ ok: true, truncated: false, cursor: null, entries: [
        { dependent: "INQ-S", move: "IMM-1", import: IMP, group: "g2", case: "CASE-I", kind: "edition", edition: 2, seq: 1, date: "2026-08-31",
          since: "2026-08-31T07:30:00Z", what_changed: "c", key_listed: true, taken_back: null, legs: [{ cited_edition: 1 }] }] }) },
    caseImport: { watchItems: () => ({ entries: [{ import: IMP, group: "g2", case: "CASE-I", set_by: "alice", seq: 3, kind: "response",
      edition: 2, date: "2026-08-31", key_listed: true, move: false, taken_back: null, seen_at: "2026-08-31T05:00:00Z" }], refused: [], unreadable: [] }) },
    docket: { coreDue: () => DOCKET.due },
    publishSchedule: { scheduledEditions: () => ({ ok: true, limit: 500, cursor: null, editions: [
      { case: "CASE-SW", edition: 1, project: "PRJ-A", state: "waiting", signer: "K", set_by: "alice", signed_at: "2026-08-31T04:00:00Z",
        at: { date: "2026-09-01", time: "09:30", zone: LA }, publish_at: "2026-09-01T16:30:00Z", moves: [], outcome_at: null, reasons: null }] }) },
    actionProducers: { actionItems: () => ({ facts: {}, items: [
      { id: "CONDITION::action-clock-overdue::ACT-1::0", class: "CONDITION", kind: "action-clock-overdue", case: { state: "determined", ancestors: [] },
        due: "2026-08-29", subject: { kind: "action", id: "ACT-1" }, summary: "s", detail: "d", basis: { source: "x", zone },
        age: { state: "determined", since: "2026-08-30T07:00:00Z", ms: 1, days: 1 }, options: [] }] }) },
  });
  w.member("alice", { role: "admin" });
  w.bundle("INQ-S", "inquiry"); w.bundle("INF-1"); w.bundle("PRJ-A", "project");
  w.join("PRJ-A", "alice", { owner: true }); w.cite("PRJ-A", "INQ-S"); w.leg("INQ-S", "INF-1");
  w.run(`INSERT INTO progression_instances VALUES ('p','E','s','c1','INF-1')`);
  w.run(`INSERT INTO cases (case_id, project_id) VALUES (?, 'PRJ-A')`, DOCKET.case);
  return w;
}
const ours = (r) => r.items.filter((i) => i.kind !== "action-clock-overdue");

test("R36: this module derives no day of its own: every item it produces is the same whatever zone the instance holds (west of UTC at the day boundary, UTC, none), none counts days, and none is dated at a UTC midnight", () => {
  const la = dated(LA).read("alice"), utc = dated("UTC").read("alice"), none = dated(null).read("alice");
  assert.ok(ours(la).length >= 9, `the fixture is live: ${ours(la).map((i) => i.kind).join(", ")}`);
  assert.deepEqual(ours(utc), ours(la), "the instance's zone moves nothing this module answers");
  assert.deepEqual(ours(none), ours(la), "and with no zone held, nothing is withheld or undetermined for want of one");
  for (const it of ours(la)) {
    assert.equal("days" in (it.age || {}), false, `${it.id}: no day is counted here`);
    assert.notEqual(it.age.reason, "zone_undetermined", it.id);
    if (it.age.state === "determined")
      assert.ok(it.age.since === undefined || !/T00:00:00Z$/.test(it.age.since), `${it.id}: aged from a fact's own instant, never a UTC midnight`);
  }
  /* the negative control: the check catches a day counted on the UTC midnight */
  assert.match("2026-08-30T00:00:00Z", /T00:00:00Z$/);
  /* R37: the time is the one set, in the group's zone, never the UTC instant it maps to */
  const sched = byId(la)["CONDITION::edition-scheduled::CASE-SW@1"];
  assert.equal(sched.summary, said("queue.edition-scheduled.summary", { when: atWord("2026-09-01", 9, 30), case: "CASE-SW", edition: 1 }));
  assert.doesNotMatch(`${sched.summary} ${sched.detail}`, /4:30 PM|T16|UTC/);
  assert.match(sched.detail, /America\/Los_Angeles/);
});

test("R25 (DEC-110 (1); T45): no item this module produces carries `due`; an item action-producers answers keeps its own, untouched", () => {
  for (const zone of [LA, null]) {
    const r = dated(zone).read("alice");
    for (const it of ours(r)) assert.equal("due" in it, false, `${zone}: ${it.id} carries no due`);
    const theirs = byId(r)["CONDITION::action-clock-overdue::ACT-1::0"];
    assert.equal(theirs.due, "2026-08-29", "action-producers' own due (its R18), passed through as it answered it");
    assert.deepEqual(theirs.basis.zone, zone, "nothing of it is re-read here");
  }
});
