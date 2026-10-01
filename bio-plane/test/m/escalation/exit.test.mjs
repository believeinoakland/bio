/* escalation: ending (R14), suspending and resuming (R15), what monitoring and queue-producers read (R16), and a
   determination's escalations for action-plans (R22). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, toStage, V, MACHINE, ms } from "./fixture.mjs";
import { noSuchDetermination } from "../../../src/conformance/index.mjs";

const end = (w, extra = {}) => w.esc.escalationEnd({ id: w.E, author: V("bob"), viewer: V("bob"), ...extra });
const actOf = (w) => w.determinations.get(w.D).act.id;
const bothCompliant = [{ standard: "STD-2026-0001-a", outcome: "compliant" }, { standard: "STD-2026-0002-b", outcome: "compliant" }];

test("R14 escalationEnd refuses MACHINE_CANNOT_END, NO_SUCH_ESCALATION, COMPLIANCE_NOT_RESTORED (naming the ids) unless every pursued standard has a live compliant determination of the same act recorded after it opened, CONSEQUENCES_NOT_ADDRESSED or CONSEQUENCES_UNDETERMINED unless consequences.addressed for its determination, superseded or not, is addressed; otherwise ended with who and when, never reopened", () => {
  const w = seeded();
  w.clock.now = "2026-09-20T00:00:00Z";
  opened(w);
  assert.equal(end(w, { author: MACHINE, id: "ESC-none" }).reason, "MACHINE_CANNOT_END");
  assert.equal(end(w, { author: "" }).reason, "MACHINE_CANNOT_END");
  assert.equal(end(w, { id: "ESC-2026-0999-escalation" }).reason, "NO_SUCH_ESCALATION");
  assert.equal(end(w, { author: V("carol"), viewer: V("carol") }).reason, "NO_SUCH_ESCALATION");
  /* consequences addressed, compliance failing alone, each way */
  w.addressedBy.set(w.D, { state: "addressed", parts: [{ id: "CONS-2026-0001-p" }] });
  const refusedCompliance = () => { const r = end(w); assert.equal(r.reason, "COMPLIANCE_NOT_RESTORED"); return r; };
  let r = refusedCompliance();
  assert.deepEqual(r.standards.map((s) => [s.standard, s.met]), [["STD-2026-0001-a", false], ["STD-2026-0002-b", false]]);
  /* recorded before the escalation opened */
  w.determine({ project: w.P, act: actOf(w), outcomes: bothCompliant, at: "2026-09-19T00:00:00Z" });
  refusedCompliance();
  /* another act */
  w.determine({ project: w.P, act: "ACT-2026-0777", outcomes: bothCompliant, at: "2026-09-21T00:00:00Z" });
  refusedCompliance();
  /* superseded */
  const sup = w.determine({ project: w.P, act: actOf(w), outcomes: bothCompliant, at: "2026-09-21T00:00:00Z", supersededBy: "CONF-x" });
  void sup;
  refusedCompliance();
  /* one standard only: named */
  const one = w.determine({ project: w.P, act: actOf(w), outcomes: [{ standard: "STD-2026-0001-a", outcome: "compliant" },
    { standard: "STD-2026-0002-b", outcome: "noncompliant" }], at: "2026-09-21T00:00:00Z" });
  r = refusedCompliance();
  assert.deepEqual(r.ids, [one]);
  assert.match(r.detail, /STD-2026-0002-b/);
  /* a later determination restores the other */
  const two = w.determine({ project: w.P, act: actOf(w), outcomes: [{ standard: "STD-2026-0002-b", outcome: "compliant" }],
                           at: "2026-09-22T00:00:00Z" });
  /* compliance met; consequences failing alone, each way */
  w.addressedBy.set(w.D, { state: "not_addressed", parts: [{ id: "CONS-2026-0001-p" }] });
  r = end(w);
  assert.deepEqual([r.reason, r.ids], ["CONSEQUENCES_NOT_ADDRESSED", ["CONS-2026-0001-p"]]);
  w.addressedBy.delete(w.D);
  r = end(w);
  assert.equal(r.reason, "CONSEQUENCES_UNDETERMINED", "no consequence recorded (K172)");
  assert.match(r.detail, /no consequence recorded/);
  w.addressedBy.set(w.D, { state: "undetermined", parts: [{ id: "CONS-2026-0002-p" }] });
  assert.equal(end(w).reason, "CONSEQUENCES_UNDETERMINED");
  /* the escalation's own determination, superseded (by the compliant ones, say), is still what consequences reads */
  w.supersede(w.D, two);
  w.addressedBy.set(w.D, { state: "addressed", parts: [{ id: "CONS-2026-0001-p" }] });
  const before = w.count("escalation_moves");
  w.clock.now = "2026-09-25T00:00:00Z";
  r = end(w);
  assert.deepEqual([r.ok, r.state, r.ended_by, r.at], [true, "ended", V("bob"), "2026-09-25T00:00:00Z"]);
  assert.deepEqual(r.compliance.sort(), [one, two].sort());
  assert.equal(w.calls.addressed.at(-1).determination, w.D);
  assert.equal(w.count("escalation_moves"), before + 1);
  const read = w.esc.escalationRead({ id: w.E, viewer: V("bob") });
  assert.deepEqual([read.state, read.ended.at], ["ended", "2026-09-25T00:00:00Z"]);
  /* never reopened */
  assert.equal(end(w).reason, "ALREADY_ENDED");
  assert.equal(w.esc.escalationResume({ id: w.E, author: V("bob"), viewer: V("bob") }).reason, "ESCALATION_ENDED");
  assert.equal(w.esc.escalationSuspend({ id: w.E, reason: "x", author: V("bob"), viewer: V("bob") }).reason, "ESCALATION_ENDED");
  assert.equal(w.esc.escalationAdvance({ id: w.E, to: 2, reason: "x", author: V("bob"), viewer: V("bob") }).reason, "NOT_OPEN");
  assert.equal(w.fm(w.E).current_state, "ended");
});

test("R15 escalationSuspend (a member, with a reason) stops proposals being reported as due and the read says it is suspended and since when, its clocks running on; escalationResume restores it at the same stage; neither ends it", () => {
  const w = seeded();
  toStage(w, 3);
  w.correspond(w.N, "received", "2026-09-09");
  assert.equal(w.esc.escalationsDue({ nowMs: ms("2026-09-29T00:00:00Z"), viewer: V("bob") }).items.length, 1);
  const s = (extra) => w.esc.escalationSuspend({ id: w.E, reason: "Waiting on counsel.", author: V("bob"), viewer: V("bob"), ...extra });
  assert.equal(s({ author: MACHINE }).reason, "MACHINE_CANNOT_SUSPEND");
  assert.equal(s({ id: "ESC-2026-0999-escalation" }).reason, "NO_SUCH_ESCALATION");
  assert.equal(s({ reason: "" }).reason, "ESCALATION_NO_REASON");
  assert.equal(s({ reason: "x".repeat(2001) }).reason, "ESCALATION_NO_REASON");
  w.clock.now = "2026-09-28T09:00:00Z";
  const r = s({});
  assert.deepEqual([r.ok, r.state, r.stage], [true, "suspended", 3]);
  assert.match(r.says, /not ended/);
  assert.equal(s({}).reason, "ALREADY_SUSPENDED");
  const read = w.esc.escalationRead({ id: w.E, nowMs: ms("2026-09-29T00:00:00Z"), viewer: V("bob") });
  assert.deepEqual([read.state, read.stage, read.suspended.since], ["suspended", 3, "2026-09-28T09:00:00Z"]);
  assert.equal(read.proposed.length, 1, "the record still proposes; it is not reported as due");
  assert.equal(read.exit.compliance.state, "not_met", "suspension answers nothing about the exit");
  assert.deepEqual(w.esc.escalationsDue({ nowMs: ms("2026-09-29T00:00:00Z"), viewer: V("bob") }).items, []);
  /* the determination is still the one escalation's */
  assert.equal(w.esc.escalationOpen({ determination: w.D, author: V("bob"), viewer: V("bob") }).reason, "ALREADY_OPEN");
  const res = (extra) => w.esc.escalationResume({ id: w.E, author: V("bob"), viewer: V("bob"), ...extra });
  assert.equal(res({ author: MACHINE }).reason, "MACHINE_CANNOT_RESUME");
  assert.equal(res({ author: V("carol"), viewer: V("carol") }).reason, "NO_SUCH_ESCALATION");
  w.clock.now = "2026-09-28T10:00:00Z";
  const back = res({});
  assert.deepEqual([back.ok, back.state, back.stage], [true, "open", 3]);
  assert.equal(res({}).reason, "NOT_SUSPENDED");
  assert.equal(w.esc.escalationsDue({ nowMs: ms("2026-09-29T00:00:00Z"), viewer: V("bob") }).items.length, 1);
  assert.deepEqual(w.fm(w.E).state_history.map((h) => [h.from_state, h.to_state]), [["open", "suspended"], ["suspended", "open"]]);
  /* ended from suspended only through R14's conditions */
  s({});
  assert.equal(w.esc.escalationEnd({ id: w.E, author: V("bob"), viewer: V("bob") }).reason, "COMPLIANCE_NOT_RESTORED");
});

test("R16 escalationsDue lists every open escalation with a proposed edge not advanced or declined since its trigger was met, with the edge, instant and age, the escalation's project and the member who opened it, oldest first, at most 500 with truncated stated; suspended, ended and unseen ones are left out", () => {
  const w = seeded();
  const at = ms("2026-10-01T00:00:00Z");
  /* three escalations whose 1→2 triggers were first met at different times */
  const ids = [];
  for (const [i, when] of [["2026-09-10T00:00:00Z"], ["2026-09-05T00:00:00Z"], ["2026-09-07T00:00:00Z"]].entries()) {
    const D = w.determine({ project: w.P, at: when[0], outcomes: [{ standard: `STD-2026-000${i}-s`, outcome: "noncompliant" }] });
    ids.push(w.esc.escalationOpen({ determination: D, author: V("bob"), viewer: V("bob") }).id);
  }
  /* one with no proposal (no office) */
  const Dq = w.determine({ project: w.P, actor: {}, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }] });
  w.esc.escalationOpen({ determination: Dq, author: V("bob"), viewer: V("bob") });
  let due = w.esc.escalationsDue({ nowMs: at, viewer: V("bob") });
  assert.deepEqual(due.items.map((x) => [x.id, x.from, x.to, x.instant]),
    [[ids[1], 1, 2, "2026-09-05T00:00:00Z"], [ids[2], 1, 2, "2026-09-07T00:00:00Z"], [ids[0], 1, 2, "2026-09-10T00:00:00Z"]]);
  assert.equal(due.items[0].age_ms, at - ms("2026-09-05T00:00:00Z"));
  assert.equal(due.truncated, false);
  assert.equal(due.items[0].by, "protocol");
  /* each item names the escalation's project and the member who opened it */
  assert.deepEqual(due.items.map((x) => [x.project, x.opened_by]), [[w.P, V("bob")], [w.P, V("bob")], [w.P, V("bob")]]);
  const Da = w.determine({ project: w.P, at: "2026-09-01T00:00:00Z", outcomes: [{ standard: "STD-2026-0009-c", outcome: "noncompliant" }] });
  const byAlice = w.esc.escalationOpen({ determination: Da, author: V("alice"), viewer: V("alice") }).id;
  const first = w.esc.escalationsDue({ nowMs: at, viewer: V("bob") }).items[0];
  assert.deepEqual([first.id, first.project, first.opened_by], [byAlice, w.P, V("alice")]);
  w.esc.escalationSuspend({ id: byAlice, reason: "Not ours to chase now.", author: V("alice"), viewer: V("alice") });
  /* a decline since met takes it off; a later trigger instant than the decline would bring it back (not here) */
  w.esc.escalationDecline({ id: ids[1], to: 2, reason: "Not yet.", author: V("bob"), viewer: V("bob") });
  /* an advance takes it off (its next edge is not met) */
  w.esc.escalationAdvance({ id: ids[2], to: 2, reason: "Go.", author: V("bob"), viewer: V("bob") });
  due = w.esc.escalationsDue({ nowMs: at, viewer: V("bob") });
  assert.deepEqual(due.items.map((x) => x.id), [ids[0]]);
  /* suspended and ended are left out; an unseen one is left out */
  w.esc.escalationSuspend({ id: ids[0], reason: "Hold.", author: V("bob"), viewer: V("bob") });
  assert.deepEqual(w.esc.escalationsDue({ nowMs: at, viewer: V("bob") }).items, []);
  w.esc.escalationResume({ id: ids[0], author: V("bob"), viewer: V("bob") });
  assert.deepEqual(w.esc.escalationsDue({ nowMs: at, viewer: V("carol") }).items, []);
  /* a limit, and the 500 bound */
  for (let i = 0; i < 3; i++) {
    const D = w.determine({ project: w.P, outcomes: [{ standard: `STD-2026-01${i}0-s`, outcome: "noncompliant" }] });
    w.esc.escalationOpen({ determination: D, author: V("bob"), viewer: V("bob") });
  }
  const two = w.esc.escalationsDue({ nowMs: at, limit: 2, viewer: V("bob") });
  assert.deepEqual([two.items.length, two.truncated, two.limit], [2, true, 2]);
  assert.equal(w.esc.escalationsDue({ nowMs: at, limit: 10000, viewer: V("bob") }).limit, 500);
  const big = seeded();
  for (let i = 0; i < 501; i++) {
    const D = big.determine({ project: big.P, outcomes: [{ standard: `STD-2026-${String(i).padStart(4, "0")}-s`, outcome: "noncompliant" }] });
    big.esc.escalationOpen({ determination: D, author: V("bob"), viewer: V("bob") });
  }
  const all = big.esc.escalationsDue({ nowMs: at, viewer: V("bob") });
  assert.deepEqual([all.items.length, all.truncated], [500, true]);
});

test("R3 R14 a provider this host does not have is never read as met or empty: the read and every act that needs it answer PROVIDER_UNAVAILABLE naming it, and nothing is written", () => {
  for (const missing of ["conformance", "consequences", "actions", "filings"]) {
    const w = seeded();
    toStage(w, 5);
    delete w.esc.deps[missing];
    const before = w.snapshot();
    const answers = [w.esc.escalationRead({ id: w.E, viewer: V("bob") }),
      missing === "actions" ? w.esc.escalationAttach({ id: w.E, action: w.N, author: V("bob"), viewer: V("bob") })
        : missing === "conformance" ? w.esc.escalationOpen({ determination: w.D, author: V("alice"), viewer: V("alice") })
        : missing === "consequences" ? w.esc.escalationEnd({ id: w.E, author: V("bob"), viewer: V("bob") }) : null].filter(Boolean);
    /* escalationEnd asks compliance before consequences, so with consequences absent only the read is asked */
    for (const r of answers.slice(0, missing === "consequences" ? 1 : 2))
      assert.deepEqual([r.reason, r.provider, r.check], ["PROVIDER_UNAVAILABLE", missing, "C-116.44"], missing);
    assert.deepEqual(w.snapshot(), before, missing);
  }
});

test("R3 R14 consequences, merged (K250), is reached through consequencesModule on the same host when not given: with no consequence recorded the exit reads undetermined and escalationEnd answers CONSEQUENCES_UNDETERMINED from the real module", () => {
  const w = seeded({ omit: ["consequences"] });
  w.clock.now = "2026-09-20T00:00:00Z";
  opened(w);
  const x = w.esc.escalationRead({ id: w.E, viewer: V("bob") }).exit.consequences;
  assert.deepEqual([x.state, x.ids, x.why], ["undetermined", [], "no consequence recorded"]);
  w.determine({ project: w.P, act: actOf(w), outcomes: bothCompliant, at: "2026-09-21T00:00:00Z" });
  const r = end(w);
  assert.equal(r.reason, "CONSEQUENCES_UNDETERMINED");
  assert.equal(w.count("consequence_parts") >= 0, true, "the real module's tables exist on this host");
});

test("R22 escalationsFor answers every escalation of a determination the viewer may see, oldest first, each with its id, state and stage; an absent or invisible determination answers NO_SUCH_DETERMINATION (conformance.noSuchDetermination); one with none answers items []; it writes nothing", () => {
  const w = seeded();
  const forD = (extra = {}) => w.esc.escalationsFor({ determination: w.D, viewer: V("bob"), ...extra });
  /* none yet */
  let r = forD();
  assert.deepEqual([r.ok, r.determination, r.items], [true, w.D, []]);
  /* absent, invisible and unnamed are conformance's one answer, the id as asked */
  assert.deepEqual(w.esc.escalationsFor({ determination: "CONF-2026-0999-none", viewer: V("bob") }), noSuchDetermination("CONF-2026-0999-none"));
  assert.deepEqual(forD({ viewer: V("carol") }), noSuchDetermination(w.D));
  assert.deepEqual(w.esc.escalationsFor({ viewer: V("bob") }), noSuchDetermination(null));
  assert.equal(forD({ viewer: V("carol") }).reason, "NO_SUCH_DETERMINATION");
  /* the first, driven to stage 4 and ended; then a second opened, at stage 1 */
  w.clock.now = "2026-09-20T00:00:00Z";
  toStage(w, 2);
  const first = w.E;
  w.esc.escalationSuspend({ id: first, reason: "Hold.", author: V("bob"), viewer: V("bob") });
  r = forD();
  assert.deepEqual(r.items.map((x) => [x.id, x.state, x.stage, x.stage_name]), [[first, "suspended", 2, "notification"]]);
  assert.deepEqual([r.items[0].opened_by, r.items[0].opened_at], [V("bob"), "2026-09-20T00:00:00Z"]);
  /* ended, by its two conditions */
  w.esc.escalationResume({ id: first, author: V("bob"), viewer: V("bob") });
  w.determine({ project: w.P, act: actOf(w), outcomes: bothCompliant, at: "2026-09-21T00:00:00Z" });
  w.addressedBy.set(w.D, { state: "addressed", parts: [{ id: "CONS-2026-0001-p" }] });
  w.clock.now = "2026-09-22T00:00:00Z";
  assert.equal(end(w).ok, true);
  w.clock.now = "2026-09-23T00:00:00Z";
  const second = w.esc.escalationOpen({ determination: w.D, author: V("alice"), viewer: V("alice") }).id;
  const before = w.snapshot();
  r = forD();
  assert.deepEqual(r.items.map((x) => [x.id, x.state, x.stage]), [[first, "ended", 2], [second, "open", 1]]);
  assert.equal(r.items.filter((x) => x.state !== "ended").length, 1, "at most one open or suspended (R1's ALREADY_OPEN)");
  /* a superseded determination still answers its escalations */
  w.supersede(w.D);
  assert.deepEqual(forD().items.map((x) => x.id), [first, second]);
  /* another determination's escalations are not among them */
  const D2 = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }] });
  const o2 = w.esc.escalationOpen({ determination: D2, author: V("bob"), viewer: V("bob") }).id;
  assert.deepEqual(w.esc.escalationsFor({ determination: D2, viewer: V("bob") }).items.map((x) => x.id), [o2]);
  /* no read writes anything (the open of D2 aside) */
  const after = w.snapshot();
  for (const t of ["escalations", "escalation_moves", "escalation_attachments", "escalation_evaluations", "escalation_declines"])
    assert.equal(JSON.parse(after[t]).filter((x) => x.escalation_id !== o2).length, JSON.parse(before[t]).length, t);
  /* a provider absent answers PROVIDER_UNAVAILABLE, never an empty list */
  delete w.esc.deps.conformance;
  assert.deepEqual([forD().reason, forD().provider], ["PROVIDER_UNAVAILABLE", "conformance"]);
});
