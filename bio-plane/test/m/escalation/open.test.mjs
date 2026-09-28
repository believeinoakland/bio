/* escalation: opening one (R1), reading it (R2, R3's shape) and the stage-1 trigger (R4). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, V, MACHINE, OFFICE, DAY, ms } from "./fixture.mjs";

test("R1 refusals in order: MACHINE_CANNOT_OPEN, NO_SUCH_DETERMINATION (absent and invisible one answer), DETERMINATION_SUPERSEDED, NOT_NONCOMPLIANT, NOT_A_PARTICIPANT, ALREADY_OPEN (named); otherwise open at stage 1 recording the noncompliant standards pursued, who and when; any joined member may open", () => {
  const w = seeded();
  w.member("dave");
  w.join(w.P, "dave", "invited");
  const before = w.snapshot();
  const open = (a) => w.esc.escalationOpen({ determination: w.D, author: V("bob"), viewer: V("bob"), ...a });
  /* machine or empty author, asked first (even of an absent determination) */
  for (const author of ["", "  ", MACHINE, "token:run-1", "ai", undefined])
    assert.equal(open({ author, determination: "CONF-none" }).reason, "MACHINE_CANNOT_OPEN", String(author));
  /* absent and invisible: one answer */
  const absent = open({ determination: "CONF-2026-0404-none" });
  const unseen = w.esc.escalationOpen({ determination: w.D, author: V("carol"), viewer: V("carol") });
  assert.equal(absent.reason, "NO_SUCH_DETERMINATION");
  assert.deepEqual(unseen, absent, "a determination the viewer may not see is answered exactly as an absent one");
  assert.equal(open({ determination: undefined }).reason, "NO_SUCH_DETERMINATION");
  /* superseded, before noncompliance and participation */
  const S = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0001-a", outcome: "compliant" }], supersededBy: "CONF-x" });
  assert.equal(w.esc.escalationOpen({ determination: S, author: V("dave"), viewer: V("dave") }).reason, "DETERMINATION_SUPERSEDED");
  /* no standard noncompliant (compliant and unclear only), before participation */
  const C = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0001-a", outcome: "compliant" }, { standard: "STD-2026-0002-b", outcome: "unclear" }] });
  assert.equal(w.esc.escalationOpen({ determination: C, author: V("dave"), viewer: V("dave") }).reason, "NOT_NONCOMPLIANT");
  /* an invited (not joined) participant sees the determination and may not open */
  const np = w.esc.escalationOpen({ determination: w.D, author: V("dave"), viewer: V("dave") });
  assert.equal(np.reason, "NOT_A_PARTICIPANT");
  assert.equal(np.project, w.P);
  assert.deepEqual(w.snapshot(), before, "no refusal writes anything");
  /* a joined member who is not an owner opens it */
  const r = open();
  assert.equal(r.ok, true);
  assert.equal(r.stage, 1);
  assert.match(r.id, /^ESC-2026-\d{4}-escalation$/);
  assert.deepEqual(r.standards, ["STD-2026-0001-a", "STD-2026-0002-b"], "only the noncompliant standards are pursued");
  assert.equal(r.opened_by, V("bob"));
  assert.equal(r.at, w.clock.now);
  assert.ok(Array.isArray(r.proposed));
  const read = w.esc.escalationRead({ id: r.id, viewer: V("bob") });
  assert.deepEqual([read.state, read.stage, read.opened_by, read.opened_at, read.standards],
                   ["open", 1, V("bob"), w.clock.now, ["STD-2026-0001-a", "STD-2026-0002-b"]]);
  assert.deepEqual(read.history.map((h) => [h.kind, h.author, h.at]), [["open", V("bob"), w.clock.now]]);
  /* one open or suspended escalation per determination, named */
  const again = w.esc.escalationOpen({ determination: w.D, author: V("alice"), viewer: V("alice") });
  assert.equal(again.reason, "ALREADY_OPEN");
  assert.equal(again.escalation, r.id);
  assert.equal(w.esc.escalationSuspend({ id: r.id, reason: "Waiting.", author: V("bob"), viewer: V("bob") }).ok, true);
  assert.equal(w.esc.escalationOpen({ determination: w.D, author: V("alice"), viewer: V("alice") }).reason, "ALREADY_OPEN",
               "a suspended escalation is still the determination's one");
  /* the owner may open one too (any joined member): a second determination */
  const D2 = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0009-z", outcome: "noncompliant" }] });
  assert.equal(w.esc.escalationOpen({ determination: D2, author: V("alice"), viewer: V("alice") }).ok, true);
});

test("R2 the read derives each edge's trigger at nowMs (the caller's, else the instance clock), naming the ids that meet it or what is missing; proposed carries the instant first met (a record date, never the read time) and its age; nothing is stored, so a later read proposes more; NO_SUCH_ESCALATION for absent and invisible alike", () => {
  const w = seeded();
  opened(w);
  w.esc.escalationAdvance({ id: w.E, to: 2, reason: "Notify.", author: V("bob"), viewer: V("bob") });
  const n = w.action({ project: w.P, restsOn: [w.D] });
  w.esc.escalationAttach({ id: w.E, action: n, author: V("bob"), viewer: V("bob") });
  w.correspond(n, "sent", "2026-09-02");
  w.esc.escalationAdvance({ id: w.E, to: 3, reason: "Sent.", author: V("bob"), viewer: V("bob") });
  /* stage 3: nothing has come back yet */
  const at19 = w.esc.escalationRead({ id: w.E, nowMs: ms("2026-09-19T12:00:00Z"), viewer: V("bob") });
  assert.equal(at19.triggers.length, 1);
  assert.deepEqual([at19.triggers[0].from, at19.triggers[0].to, at19.triggers[0].met], [3, 4, false]);
  assert.match(at19.triggers[0].missing, /no reply/);
  assert.deepEqual(at19.proposed, []);
  assert.equal(at19.as_of, "2026-09-19T12:00:00Z");
  /* a reply arrives: the same read at the same instant now proposes 3→4, first met at the reply's date */
  w.correspond(n, "received", "2026-09-12");
  const later = w.esc.escalationRead({ id: w.E, nowMs: ms("2026-09-19T12:00:00Z"), viewer: V("bob") });
  assert.equal(later.proposed.length, 1);
  const p = later.proposed[0];
  assert.deepEqual([p.from, p.to, p.stage, p.instant], [3, 4, "response_evaluation", "2026-09-12T00:00:00Z"]);
  assert.deepEqual(p.ids, [n, `${n}#0`, `${n}#1`]);
  assert.equal(p.age_ms, ms("2026-09-19T12:00:00Z") - ms("2026-09-12T00:00:00Z"), "the age is a fact of the record");
  const read2 = w.esc.escalationRead({ id: w.E, nowMs: ms("2026-09-29T00:00:00Z"), viewer: V("bob") });
  assert.equal(read2.proposed[0].instant, p.instant, "the instant does not move with the read time");
  assert.equal(read2.proposed[0].age_ms, ms("2026-09-29T00:00:00Z") - ms("2026-09-12T00:00:00Z"));
  /* the instance clock when the caller gives none */
  w.clock.now = "2026-09-30T00:00:00Z";
  const dflt = w.esc.escalationRead({ id: w.E, viewer: V("bob") });
  assert.equal(dflt.as_of, "2026-09-30T00:00:00Z");
  assert.equal(dflt.proposed[0].age_ms, ms("2026-09-30T00:00:00Z") - ms("2026-09-12T00:00:00Z"));
  /* reading stores nothing */
  const snap = w.snapshot();
  w.esc.escalationRead({ id: w.E, viewer: V("bob") });
  assert.deepEqual(w.snapshot(), snap);
  /* the answer's shape */
  for (const k of ["id", "state", "stage", "history", "standards", "actions", "triggers", "proposed", "exit"]) assert.ok(k in dflt, k);
  /* absent and invisible: one answer */
  const absent = w.esc.escalationRead({ id: "ESC-2026-0999-escalation", viewer: V("bob") });
  const unseen = w.esc.escalationRead({ id: w.E, viewer: V("carol") });
  assert.equal(absent.reason, "NO_SUCH_ESCALATION");
  assert.deepEqual(unseen, absent);
  assert.deepEqual(w.esc.escalationRead({ id: undefined, viewer: V("bob") }), absent);
});

test("R3 exit answers R14's two conditions apart, each met, not_met or undetermined with its ids and why, never composed into a score", () => {
  const w = seeded();
  opened(w);
  const x = (viewer = V("bob")) => w.esc.escalationRead({ id: w.E, viewer }).exit;
  const states = ["met", "not_met", "undetermined"];
  /* nothing recorded: compliance not met, consequences undetermined ("no consequence recorded") */
  let e = x();
  assert.deepEqual(Object.keys(e).filter((k) => k !== "says").sort(), ["compliance", "consequences"]);
  assert.equal(e.compliance.state, "not_met");
  assert.equal(e.consequences.state, "undetermined");
  assert.match(e.consequences.why, /no consequence recorded/);
  for (const c of [e.compliance, e.consequences]) {
    assert.ok(states.includes(c.state));
    assert.ok(Array.isArray(c.ids));
    assert.equal(typeof c.why, "string");
  }
  /* compliance met on its own, consequences not addressed */
  w.clock.now = "2026-10-01T00:00:00Z";
  const C = w.determine({ project: w.P, act: w.determinations.get(w.D).act.id, outcomes: [
    { standard: "STD-2026-0001-a", outcome: "compliant" }, { standard: "STD-2026-0002-b", outcome: "compliant" }] });
  w.addressedBy.set(w.D, { state: "not_addressed", parts: [{ id: "CONS-2026-0001-part" }] });
  e = x();
  assert.deepEqual([e.compliance.state, e.compliance.ids], ["met", [C, C]]);
  assert.deepEqual([e.consequences.state, e.consequences.ids], ["not_met", ["CONS-2026-0001-part"]]);
  w.addressedBy.set(w.D, { state: "addressed", parts: [{ id: "CONS-2026-0001-part" }] });
  assert.equal(x().consequences.state, "met");
  w.addressedBy.set(w.D, { state: "undetermined", parts: [{ id: "CONS-2026-0002-part" }] });
  assert.equal(x().consequences.state, "undetermined");
  /* no key composes the two */
  const flat = JSON.stringify(x());
  for (const k of ["score", "overall", "total", "significance", "progress"]) assert.ok(!flat.includes(`"${k}"`), k);
  /* a determination with no act id: compliance undetermined, with why */
  const D3 = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0005-e", outcome: "noncompliant" }] });
  w.determinations.get(D3).act.id = null;
  const r = w.esc.escalationOpen({ determination: D3, author: V("bob"), viewer: V("bob") });
  const e3 = w.esc.escalationRead({ id: r.id, viewer: V("bob") }).exit;
  assert.equal(e3.compliance.state, "undetermined");
  assert.match(e3.compliance.why, /no act id/);
});

test("R4 stage 1 is entered by opening; its trigger to 2 is a live determination whose act's actor is an office (role and body), first met at the determination's time, and it names what is missing otherwise", () => {
  const w = seeded();
  w.determinations.get(w.D).at = "2026-09-05T10:00:00Z";
  const r = opened(w);
  assert.equal(r.stage, 1);
  assert.deepEqual(r.proposed.map((p) => [p.from, p.to, p.instant, p.ids]), [[1, 2, "2026-09-05T10:00:00Z", [w.D]]]);
  /* superseded after opening: the trigger is no longer met */
  w.supersede(w.D);
  const s = w.esc.escalationRead({ id: w.E, viewer: V("bob") });
  assert.deepEqual([s.triggers[0].met, s.proposed.length], [false, 0]);
  assert.match(s.triggers[0].missing, /superseded/);
  assert.equal(w.esc.escalationAdvance({ id: w.E, to: 2, reason: "Go.", author: V("bob"), viewer: V("bob") }).reason, "TRIGGER_NOT_MET");
  /* an act whose actor names no office: no addressee */
  for (const actor of [{ role: "", body: "A body" }, { role: "A role", body: " " }, {}]) {
    const D = w.determine({ project: w.P, actor, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }] });
    const o = w.esc.escalationOpen({ determination: D, author: V("bob"), viewer: V("bob") });
    assert.equal(o.ok, true);
    assert.deepEqual(o.proposed, []);
    const t = w.esc.escalationRead({ id: o.id, viewer: V("bob") }).triggers[0];
    assert.equal(t.met, false);
    assert.match(t.missing, /names no office/);
  }
  /* the acts of stage 1 are the published findings and the determination: nothing is attached at stage 1 */
  const D5 = w.determine({ project: w.P, actor: OFFICE.board, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }] });
  const o5 = w.esc.escalationOpen({ determination: D5, author: V("bob"), viewer: V("bob") });
  const a = w.action({ project: w.P, restsOn: [D5] });
  assert.equal(w.esc.escalationAttach({ id: o5.id, action: a, author: V("bob"), viewer: V("bob") }).reason, "STAGE_TAKES_NO_ACTION");
  void DAY;
});
