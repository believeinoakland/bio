/* escalation: ending (R14), suspending and resuming (R15), and what monitoring reads (R16). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, toStage, V, MACHINE, ms } from "./fixture.mjs";

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
  assert.equal(s({ reason: "" }).reason, "NO_REASON");
  assert.equal(s({ reason: "x".repeat(2001) }).reason, "NO_REASON");
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

test("R16 escalationsDue lists every open escalation with a proposed edge not advanced or declined since its trigger was met, with the edge, instant and age, oldest first, at most 500 with truncated stated; suspended, ended and unseen ones are left out", () => {
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

test("R3 R14 a provider this host was not given is never read as met or empty: the read and every act that needs it answer PROVIDER_UNAVAILABLE naming it, and nothing is written", () => {
  for (const missing of ["filings"]) {
    const w = seeded({ omit: [missing] });
    const before = w.snapshot();
    const tried = [];
    const o = w.esc.escalationOpen({ determination: w.D, author: V("bob"), viewer: V("bob") });
    tried.push(o);
    if (o.ok) {
      w.E = o.id;
      tried.push(w.esc.escalationEnd({ id: w.E, author: V("bob"), viewer: V("bob") }));
      if (missing === "actions") {
        /* actions is read once an action is named or attached */
        assert.equal(w.esc.escalationAdvance({ id: w.E, to: 2, reason: "Go.", author: V("bob"), viewer: V("bob") }).ok, true);
        const snap = w.snapshot();
        const r = w.esc.escalationAttach({ id: w.E, action: "ACTN-2026-0001-act", author: V("bob"), viewer: V("bob") });
        assert.deepEqual([r.reason, r.provider], ["PROVIDER_UNAVAILABLE", "actions"]);
        assert.deepEqual(w.snapshot(), snap);
        continue;
      }
      if (missing === "filings") {
        /* filings is read at stage 5 only: every earlier read and act answers without it */
        assert.equal(w.esc.escalationRead({ id: w.E, viewer: V("bob") }).ok, true);
        continue;
      }
      tried.push(w.esc.escalationRead({ id: w.E, viewer: V("bob") }));
      assert.equal(tried.at(-1).reason, "PROVIDER_UNAVAILABLE", `${missing}: the read`);
    } else assert.deepEqual(w.snapshot(), before, missing);
    const r = tried.find((x) => x.reason === "PROVIDER_UNAVAILABLE");
    assert.ok(r, missing);
    assert.deepEqual([r.reason, r.provider, r.check], ["PROVIDER_UNAVAILABLE", missing, "C-116.44"], missing);
  }
  /* filings absent at stage 5: the read refuses rather than listing nothing available */
  const w = seeded();
  toStage(w, 5);
  w.stand.filings.availableActions = undefined;
  delete w.esc.deps.filings;
  const r = w.esc.escalationRead({ id: w.E, viewer: V("bob") });
  assert.deepEqual([r.reason, r.provider], ["PROVIDER_UNAVAILABLE", "filings"]);
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
