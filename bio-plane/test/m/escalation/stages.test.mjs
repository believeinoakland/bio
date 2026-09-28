/* escalation: each stage's act and trigger (R5–R8, R11, R12), attaching (R9), evaluating (R10), advancing and
   declining (R13). Every arm drives its trigger from the record alone, with the clock seam (`nowMs`) moved across a
   deadline where the trigger is a clock. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, toStage, V, MACHINE, OFFICE, DAY, ms } from "./fixture.mjs";

const read = (w, nowMs) => w.esc.escalationRead({ id: w.E, viewer: V("bob"), ...(nowMs ? { nowMs } : {}) });
const edge = (r, to) => r.triggers.find((t) => t.to === to);
const adv = (w, to, extra = {}) => w.esc.escalationAdvance({ id: w.E, to, reason: `to ${to}`, author: V("bob"), viewer: V("bob"), ...extra });
const attach = (w, action, extra = {}) => w.esc.escalationAttach({ id: w.E, action, author: V("bob"), viewer: V("bob"), ...extra });
const evaluate = (w, extra) => w.esc.escalationEvaluate({ id: w.E, author: V("bob"), viewer: V("bob"), reason: "Read it.", ...extra });

test("R5 stage 2's act is a breach action attached at stage 2; its trigger to 3 is a sent entry in that action's ledger, first met at the entry's date; a sent entry on an action not attached here does not meet it", () => {
  const w = seeded();
  opened(w);
  adv(w, 2);
  let r = read(w);
  assert.deepEqual([edge(r, 3).met, r.proposed.length], [false, 0]);
  assert.match(edge(r, 3).missing, /no breach action is attached at stage 2/);
  /* an action resting on the determination but not attached: its sent entry does not count */
  const other = w.action({ project: w.P, restsOn: [w.D] });
  w.correspond(other, "sent", "2026-09-01");
  const n = w.action({ project: w.P, restsOn: [w.D], counterparty: { state: "named", ...OFFICE.clerk } });
  assert.equal(attach(w, n).ok, true);
  r = read(w);
  assert.equal(edge(r, 3).met, false);
  assert.match(edge(r, 3).missing, /no notification action attached at stage 2 has a sent entry/);
  /* a received entry alone is not a sending */
  w.correspond(n, "received", "2026-09-02");
  assert.equal(edge(read(w), 3).met, false);
  w.correspond(n, "sent", "2026-09-03");
  r = read(w);
  assert.deepEqual([edge(r, 3).met, edge(r, 3).instant, edge(r, 3).ids], [true, "2026-09-03T00:00:00Z", [n, `${n}#1`]]);
  assert.deepEqual(r.proposed.map((p) => [p.from, p.to]), [[2, 3]]);
  assert.equal(adv(w, 3).ok, true);
  assert.equal(read(w).stage, 3);
});

test("R6 stage 3's trigger to 4: after the sent entry a received or no_response entry, or the clock's earliest pending entry past at nowMs (actions R12's rule; first met the day after its date); a stage-3 action with no clock entry never triggers by time, and the read says so", () => {
  /* a reply */
  for (const direction of ["received", "no_response"]) {
    const w = seeded();
    const n = toStage(w, 3);
    assert.equal(edge(read(w), 4).met, false);
    w.correspond(n, direction, "2026-09-09");
    const r = read(w);
    assert.deepEqual([edge(r, 4).met, edge(r, 4).instant, edge(r, 4).ids], [true, "2026-09-09T00:00:00Z", [n, `${n}#0`, `${n}#1`]], direction);
  }
  /* a received entry before the sent entry is not a reply to it */
  {
    const w = seeded();
    opened(w); adv(w, 2);
    const n = w.action({ project: w.P, restsOn: [w.D] });
    attach(w, n);
    w.correspond(n, "received", "2026-08-30");
    w.correspond(n, "sent", "2026-09-02");
    adv(w, 3);
    assert.equal(edge(read(w, ms("2026-12-01T00:00:00Z")), 4).met, false);
  }
  /* the clock: pending entry dated 2026-09-20 (and a later one); met from 2026-09-21T00:00Z, not a moment before */
  {
    const w = seeded();
    opened(w); adv(w, 2);
    const n = w.action({ project: w.P, restsOn: [w.D], clock: [{ date: "2026-10-30" }, { date: "2026-09-20" }, { date: "2026-09-01", status: "met" }] });
    attach(w, n);
    w.correspond(n, "sent", "2026-09-02");
    adv(w, 3);
    const before = read(w, ms("2026-09-20T23:59:59Z"));
    assert.equal(edge(before, 4).met, false);
    assert.deepEqual(before.notes, []);
    const after = read(w, ms("2026-09-21T00:00:00Z"));
    assert.deepEqual([edge(after, 4).met, edge(after, 4).instant, edge(after, 4).ids], [true, "2026-09-21T00:00:00Z", [n]]);
    assert.equal(after.proposed[0].age_ms, 0);
    assert.equal(read(w, ms("2026-09-23T00:00:00Z")).proposed[0].age_ms, 2 * DAY);
    /* a reply before the deadline is met first: the earliest alternative */
    w.correspond(n, "received", "2026-09-15");
    assert.equal(edge(read(w, ms("2026-09-25T00:00:00Z")), 4).instant, "2026-09-15T00:00:00Z");
  }
  /* no clock entry: never by time, and said */
  {
    const w = seeded();
    const n = toStage(w, 3);
    const r = read(w, ms("2030-01-01T00:00:00Z"));
    assert.equal(edge(r, 4).met, false);
    assert.equal(r.notes.length, 1);
    assert.equal(r.notes[0].action, n);
    assert.match(r.notes[0].says, /never triggers by time/);
  }
});

test("R7 stage 4: its act is a member's evaluation; to 5 and to 7 when the latest evaluation since entering stage 4 reads denied, partial or none, first met at the evaluation; complied proposes no stage and points at R14; partial is recorded and neither stops the clock nor ends the escalation", () => {
  for (const reading of ["denied", "partial", "none"]) {
    const w = seeded();
    const n = toStage(w, 4);
    let r = read(w);
    assert.deepEqual([edge(r, 5).met, edge(r, 7).met], [false, false]);
    w.clock.now = "2026-09-28T02:00:00Z";
    const ev = evaluate(w, reading === "none" ? { reading } : { reading, response: { action: n, ord: w.R } });
    assert.equal(ev.ok, true, reading);
    r = read(w);
    assert.deepEqual(r.proposed.map((p) => [p.from, p.to, p.instant]), [[4, 5, "2026-09-28T02:00:00Z"], [4, 7, "2026-09-28T02:00:00Z"]], reading);
    if (reading === "partial") {
      assert.match(ev.says, /does not stop the clock or end the escalation/);
      assert.equal(r.state, "open");
      assert.equal(w.esc.escalationEnd({ id: w.E, author: V("bob"), viewer: V("bob") }).reason, "COMPLIANCE_NOT_RESTORED");
    }
  }
  const w = seeded();
  const n = toStage(w, 4);
  const ev = evaluate(w, { reading: "complied", response: { action: n, ord: w.R } });
  assert.match(ev.says, /Compliance is restored only by a live compliant determination/);
  const r = read(w);
  assert.deepEqual(r.proposed, []);
  assert.match(edge(r, 5).missing, /complied/);
  assert.match(edge(r, 5).missing, /escalationEnd/);
  /* the latest is in force: a later denial proposes again */
  w.clock.now = "2026-09-28T03:00:00Z";
  evaluate(w, { reading: "denied", response: { action: n, ord: w.R } });
  assert.deepEqual(read(w).proposed.map((p) => p.to), [5, 7]);
});

test("R8 stage 5: breach actions attached here with their filings or counsel packets (filings.filingsFor); what is available listed through filings.availableActions for the determination; to 6 when an attached action's ledger holds a sent entry; to 7 from the evaluation in force", () => {
  const w = seeded();
  toStage(w, 5);
  let r = read(w);
  assert.deepEqual(w.calls.availableActions.at(-1), { determination: w.D, viewer: V("bob") });
  assert.deepEqual(r.available.kinds.map((k) => [k.kind, k.tier]), [["complaint", 1], ["lawsuit", 3]]);
  assert.equal(edge(r, 6).met, false);
  assert.match(edge(r, 6).missing, /no breach action is attached at stage 5/);
  assert.deepEqual([edge(r, 7).met, edge(r, 7).ids], [true, [`${w.E}/evaluation/6`]], "to 7 from the evaluation in force");
  const a5 = w.action({ project: w.P, restsOn: [w.D] });
  assert.equal(attach(w, a5).stage, 5);
  r = read(w);
  const item = r.actions.find((a) => a.action === a5);
  assert.deepEqual([item.stage, item.filings.drafts.map((d) => d.id)], [5, [`FD-${a5}`]]);
  assert.deepEqual(w.calls.filingsFor.at(-1), { action: a5, viewer: V("bob") });
  assert.equal(edge(r, 6).met, false);
  /* the notification action's own sent entry (stage 2) does not meet stage 5's trigger */
  assert.ok(w.ledgers.get(w.N).some((e) => e.direction === "sent"));
  w.correspond(a5, "sent", "2026-09-16");
  r = read(w);
  assert.deepEqual([edge(r, 6).met, edge(r, 6).instant, edge(r, 6).ids], [true, "2026-09-16T00:00:00Z", [a5, `${a5}#0`]]);
  assert.deepEqual(r.proposed.map((p) => p.to).sort(), [6, 7]);
  /* the available block is read when the providers answer none: undetermined, said */
  w.stand.filings.availableActions = () => ({ ok: false, reason: "NO_SUCH_DETERMINATION" });
  assert.equal(read(w).available.state, "undetermined");
});

test("R9 escalationAttach refuses in order MACHINE_CANNOT_ATTACH, NO_SUCH_ESCALATION, NO_SUCH_ACTION, NOT_A_BREACH_ACTION, STAGE_TAKES_NO_ACTION (stages 1, 3, 4, 6), ALREADY_ATTACHED; an action attaches to one escalation at one stage, at stage 2, 5 or 7", () => {
  const w = seeded();
  opened(w);
  const good = w.action({ project: w.P, restsOn: [w.D] });
  const noBreach = w.action({ project: w.P, breach: false, restsOn: [w.D] });
  const noLeg = w.action({ project: w.P, restsOn: [] });
  const otherLeg = w.action({ project: w.P, restsOn: ["CONF-2026-0777-other"] });
  const before = w.snapshot();
  assert.equal(attach(w, "ACTN-none", { author: MACHINE, id: "ESC-none" }).reason, "MACHINE_CANNOT_ATTACH");
  assert.equal(attach(w, good, { author: "" }).reason, "MACHINE_CANNOT_ATTACH");
  assert.equal(attach(w, "ACTN-none", { id: "ESC-2026-0999-escalation" }).reason, "NO_SUCH_ESCALATION");
  assert.equal(attach(w, good, { author: V("carol"), viewer: V("carol") }).reason, "NO_SUCH_ESCALATION", "invisible is absent");
  assert.equal(attach(w, "ACTN-2026-0999-none").reason, "NO_SUCH_ACTION");
  assert.equal(attach(w, w.P).reason, "NO_SUCH_ACTION", "not an action");
  w.actionHidden.add(good);
  assert.equal(attach(w, good).reason, "NO_SUCH_ACTION", "an action the viewer may not see");
  w.actionHidden.delete(good);
  for (const a of [noBreach, noLeg, otherLeg]) assert.equal(attach(w, a).reason, "NOT_A_BREACH_ACTION", a);
  assert.equal(attach(w, good).reason, "STAGE_TAKES_NO_ACTION", "stage 1");
  assert.deepEqual(w.snapshot(), before, "no refusal writes anything");
  adv(w, 2);
  const r = attach(w, good);
  assert.deepEqual([r.ok, r.stage, r.action], [true, 2, good]);
  assert.equal(attach(w, good).reason, "ALREADY_ATTACHED");
  /* another escalation of another determination cannot take it either */
  const D2 = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }] });
  const o2 = w.esc.escalationOpen({ determination: D2, author: V("bob"), viewer: V("bob") });
  const both = w.action({ project: w.P, restsOn: [w.D, D2] });
  w.esc.escalationAdvance({ id: o2.id, to: 2, reason: "Go.", author: V("bob"), viewer: V("bob") });
  assert.equal(attach(w, both).ok, true);
  assert.equal(w.esc.escalationAttach({ id: o2.id, action: both, author: V("bob"), viewer: V("bob") }).reason, "ALREADY_ATTACHED");
  /* stages 3, 4 and 6 take none */
  for (const stage of [3, 4, 6]) {
    const x = seeded();
    toStage(x, stage);
    const a = x.action({ project: x.P, restsOn: [x.D] });
    assert.equal(x.esc.escalationAttach({ id: x.E, action: a, author: V("bob"), viewer: V("bob") }).reason, "STAGE_TAKES_NO_ACTION", `stage ${stage}`);
  }
  /* the read lists each attached action once, at its stage */
  assert.deepEqual(read(w).actions.map((a) => [a.action, a.stage]), [[good, 2], [both, 2]]);
});

test("R10 escalationEvaluate refuses in order MACHINE_CANNOT_EVALUATE, NO_SUCH_ESCALATION, NOT_IN_EVALUATION, READING_UNKNOWN, NO_SUCH_RESPONSE, RESPONSE_FOR_NONE, NO_REASON (1-2,000 characters); evaluations are append-only and the latest is in force", () => {
  const w = seeded();
  const n = toStage(w, 3);
  const resp = { action: n, ord: 1 };
  w.correspond(n, "received", "2026-09-10");
  const ok = { reading: "denied", response: resp, reason: "No." };
  assert.equal(evaluate(w, { ...ok, author: MACHINE, id: "ESC-none" }).reason, "MACHINE_CANNOT_EVALUATE");
  assert.equal(evaluate(w, { ...ok, id: "ESC-2026-0999-escalation" }).reason, "NO_SUCH_ESCALATION");
  assert.equal(evaluate(w, { ...ok, author: V("carol"), viewer: V("carol") }).reason, "NO_SUCH_ESCALATION");
  assert.equal(evaluate(w, { ...ok, reading: "nonsense" }).reason, "NOT_IN_EVALUATION", "stage 3");
  adv(w, 4);
  assert.equal(evaluate(w, { ...ok, reading: "nonsense", response: { action: "x", ord: 9 } }).reason, "READING_UNKNOWN");
  assert.equal(evaluate(w, { ...ok, reading: "Denied" }).reason, "READING_UNKNOWN");
  assert.equal(evaluate(w, { ...ok, response: { action: n, ord: 0 } }).reason, "NO_SUCH_RESPONSE", "a sent entry is not a response");
  assert.equal(evaluate(w, { ...ok, response: { action: n, ord: 7 } }).reason, "NO_SUCH_RESPONSE");
  const loose = w.action({ project: w.P, restsOn: [w.D] });
  w.correspond(loose, "received", "2026-09-10");
  assert.equal(evaluate(w, { ...ok, response: { action: loose, ord: 0 } }).reason, "NO_SUCH_RESPONSE", "not an attached action");
  assert.equal(evaluate(w, { ...ok, response: undefined }).reason, "NO_SUCH_RESPONSE", "denied names its response");
  assert.equal(evaluate(w, { ...ok, reading: "none", response: { action: n, ord: 9 } }).reason, "NO_SUCH_RESPONSE");
  assert.equal(evaluate(w, { ...ok, reading: "none" }).reason, "RESPONSE_FOR_NONE");
  assert.equal(evaluate(w, { ...ok, reason: "  " }).reason, "NO_REASON");
  assert.equal(evaluate(w, { ...ok, reason: "x".repeat(2001) }).reason, "NO_REASON");
  assert.equal(w.count("escalation_evaluations"), 0);
  const a = evaluate(w, { ...ok, reason: "x".repeat(2000) });
  assert.deepEqual([a.ok, a.reading, a.response], [true, "denied", resp]);
  w.clock.now = "2026-09-28T05:00:00Z";
  const b = evaluate(w, { reading: "none", reason: "Nothing came back." });
  assert.equal(b.ok, true);
  w.clock.now = "2026-09-28T06:00:00Z";
  const c = evaluate(w, { reading: "complied", response: resp, reason: "They did it." });
  const evs = read(w).evaluations;
  assert.deepEqual(evs.map((v) => [v.reading, v.author, v.at]), [["denied", V("bob"), "2026-09-28T01:00:00Z"],
    ["none", V("bob"), "2026-09-28T05:00:00Z"], ["complied", V("bob"), "2026-09-28T06:00:00Z"]]);
  assert.equal(evs[1].response, null);
  assert.deepEqual(read(w).proposed, [], "the latest, complied, is in force");
  void c;
});

test("R11 stage 6 is entered from 5 and has no act of its own; its trigger to 4 is a received entry on an attached action recorded after the latest evaluation", () => {
  const w = seeded();
  toStage(w, 6);
  let r = read(w);
  assert.deepEqual([r.stage, r.stage_name], [6, "sustained_attention"]);
  assert.equal(edge(r, 4).met, false);
  /* the reply already evaluated (recorded before the evaluation) does not count */
  assert.ok(w.ledgers.get(w.N).some((e) => e.direction === "received"));
  /* a received entry recorded after the latest evaluation, on the stage-5 action */
  w.correspond(w.A5, "received", "2026-09-29", "2026-09-29T09:00:00Z");
  r = read(w);
  assert.deepEqual([edge(r, 4).met, edge(r, 4).instant, edge(r, 4).ids], [true, "2026-09-29T00:00:00Z", [w.A5, `${w.A5}#1`]]);
  w.clock.now = "2026-09-29T10:00:00Z";
  assert.equal(adv(w, 4).ok, true);
  /* back in stage 4, the earlier denial is not this round's evaluation */
  r = read(w);
  assert.equal(r.stage, 4);
  assert.deepEqual(r.proposed, []);
  assert.match(edge(r, 5).missing, /no evaluation since the escalation entered stage 4/);
  /* stage 6 is entered only from 5 */
  const x = seeded();
  toStage(x, 4);
  const e4 = x.esc.escalationEvaluate({ id: x.E, response: { action: x.N, ord: x.R }, reading: "denied", reason: "No.", author: V("bob"), viewer: V("bob") });
  assert.equal(e4.ok, true);
  assert.equal(x.esc.escalationAdvance({ id: x.E, to: 6, reason: "Go.", author: V("bob"), viewer: V("bob") }).reason, "ILLEGAL_STAGE");
});

test("R12 stage 7, entered from 4 or 5: each attachment states one accountability purpose and at least one pursued standard; NOT_ACCOUNTABILITY, NOT_THE_BREACH, COUNTERPARTY_NOT_ELECTED (official_request to an office marked not elected), COUNTERPARTY_NOT_OVERSIGHT (oversight or audit request to one marked not oversight); where the profile says nothing it lands and the read states it undetermined; trigger to 4 as R11's", () => {
  const w = seeded();
  toStage(w, 7);
  assert.equal(read(w).stage_name, "political_accountability");
  const act = (office) => w.action({ project: w.P, restsOn: [w.D], counterparty: { state: "named", ...office } });
  const std = ["STD-2026-0001-a"];
  /* purposes outside the five, or none */
  for (const purpose of [undefined, "", "policy_advocacy", "candidate_support", "Official_request"])
    assert.equal(attach(w, act(OFFICE.board), { purpose, standards: std }).reason, "NOT_ACCOUNTABILITY", String(purpose));
  /* standards: none, empty, or one the escalation does not pursue (STD-3 is compliant, STD-9 unknown) */
  for (const standards of [undefined, [], ["STD-2026-0003-c"], ["STD-2026-0001-a", "STD-2026-0009-z"]])
    assert.equal(attach(w, act(OFFICE.board), { purpose: "testimony", standards }).reason, "NOT_THE_BREACH", JSON.stringify(standards));
  /* elected: the clerk's office is marked not elected */
  assert.equal(attach(w, act(OFFICE.clerk), { purpose: "official_request", standards: std }).reason, "COUNTERPARTY_NOT_ELECTED");
  /* oversight: the harbour board is marked not an oversight body */
  for (const purpose of ["oversight_request", "audit_request"])
    assert.equal(attach(w, act(OFFICE.harbour), { purpose, standards: std }).reason, "COUNTERPARTY_NOT_OVERSIGHT", purpose);
  assert.equal(w.count("escalation_attachments"), 1, "only the notification action is attached");
  /* each purpose lands where the profile allows it */
  const landed = {
    official_request: act(OFFICE.board), oversight_request: act(OFFICE.examiner), audit_request: act(OFFICE.examiner),
    testimony: act(OFFICE.clerk), enforcing_legislation: act(OFFICE.harbour),
  };
  for (const [purpose, a] of Object.entries(landed)) {
    const r = attach(w, a, { purpose, standards: ["STD-2026-0002-b", "STD-2026-0002-b"] });
    assert.deepEqual([r.ok, r.stage, r.purpose, r.standards], [true, 7, purpose, ["STD-2026-0002-b"]], purpose);
  }
  /* the profile silent: lands, and the read states the election or oversight undetermined */
  const silentElected = act(OFFICE.unlisted);
  const silentOversight = act(OFFICE.board);
  assert.equal(attach(w, silentElected, { purpose: "official_request", standards: std }).ok, true);
  assert.equal(attach(w, silentOversight, { purpose: "audit_request", standards: std }).ok, true);
  const items = read(w).actions;
  const it = (a) => items.find((x) => x.action === a);
  assert.equal(it(silentElected).election.state, "undetermined");
  assert.equal(it(silentOversight).oversight.state, "undetermined");
  assert.equal(it(landed.official_request).election, undefined, "an office the profile marks elected is not undetermined");
  assert.equal(it(landed.audit_request).oversight, undefined);
  assert.deepEqual([it(landed.testimony).purpose, it(landed.testimony).standards], ["testimony", ["STD-2026-0002-b"]]);
  /* with no profile active, every election and oversight is undetermined, and nothing is refused on it */
  w.record.setSetting("jurisdiction_profiles", [], "test");
  const none = act(OFFICE.clerk);
  assert.equal(attach(w, none, { purpose: "official_request", standards: std }).ok, true);
  assert.equal(read(w).actions.find((x) => x.action === none).election.state, "undetermined");
  /* trigger to 4: a received entry recorded after the latest evaluation */
  assert.equal(edge(read(w), 4).met, false);
  w.correspond(landed.testimony, "received", "2026-10-02", "2026-10-02T12:00:00Z");
  const r = read(w);
  assert.deepEqual([edge(r, 4).met, edge(r, 4).ids], [true, [landed.testimony, `${landed.testimony}#0`]]);
  /* entered from 5 too */
  const x = seeded();
  toStage(x, 5);
  assert.equal(x.esc.escalationAdvance({ id: x.E, to: 7, reason: "Go.", author: V("bob"), viewer: V("bob") }).ok, true);
});

test("R13 escalationAdvance refuses MACHINE_CANNOT_ADVANCE, NO_SUCH_ESCALATION, NOT_OPEN, NO_REASON, ILLEGAL_STAGE (with the legal ones), TRIGGER_NOT_MET (naming what is missing), else appends {from, to, reason, author, at, trigger ids}; escalationDecline records a member's choice not to advance with the same refusals and NOT_PROPOSED, and the proposal stays with its age and the declines", () => {
  const w = seeded();
  opened(w);
  const ok = { to: 2, reason: "The office is named." };
  assert.equal(adv(w, 2, { author: MACHINE, id: "ESC-none" }).reason, "MACHINE_CANNOT_ADVANCE");
  assert.equal(adv(w, 2, { id: "ESC-2026-0999-escalation" }).reason, "NO_SUCH_ESCALATION");
  assert.equal(adv(w, 2, { author: V("carol"), viewer: V("carol") }).reason, "NO_SUCH_ESCALATION");
  w.esc.escalationSuspend({ id: w.E, reason: "Hold.", author: V("bob"), viewer: V("bob") });
  const no = adv(w, 9, { reason: "" });
  assert.deepEqual([no.reason, no.state], ["NOT_OPEN", "suspended"]);
  w.esc.escalationResume({ id: w.E, author: V("bob"), viewer: V("bob") });
  assert.equal(adv(w, 9, { reason: " " }).reason, "NO_REASON");
  assert.equal(adv(w, 9, { reason: "x".repeat(2001) }).reason, "NO_REASON");
  for (const to of [3, 7, 1, 9, "clock", null]) {
    const r = adv(w, to, { reason: "Why." });
    assert.deepEqual([r.reason, r.legal], ["ILLEGAL_STAGE", [2]], String(to));
  }
  /* the trigger unmet: the actor names no office */
  const D2 = w.determine({ project: w.P, actor: { role: "", body: "" }, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }] });
  const o2 = w.esc.escalationOpen({ determination: D2, author: V("bob"), viewer: V("bob") });
  const tn = w.esc.escalationAdvance({ id: o2.id, to: 2, reason: "Go.", author: V("bob"), viewer: V("bob") });
  assert.equal(tn.reason, "TRIGGER_NOT_MET");
  assert.match(tn.missing, /names no office/);
  const td = w.esc.escalationDecline({ id: o2.id, to: 2, reason: "Not now.", author: V("bob"), viewer: V("bob") });
  assert.equal(td.reason, "NOT_PROPOSED");
  /* decline: same refusals */
  const dec = (extra) => w.esc.escalationDecline({ id: w.E, to: 2, reason: "Not yet.", author: V("alice"), viewer: V("alice"), ...extra });
  assert.equal(dec({ author: MACHINE, id: "ESC-none" }).reason, "MACHINE_CANNOT_DECLINE");
  assert.equal(dec({ id: "ESC-2026-0999-escalation" }).reason, "NO_SUCH_ESCALATION");
  assert.equal(dec({ reason: "" }).reason, "NO_REASON");
  assert.equal(dec({ to: 4 }).reason, "ILLEGAL_STAGE");
  /* a decline, twice, by different members: the proposal stays, with its age and the declines */
  w.clock.now = "2026-09-28T04:00:00Z";
  assert.equal(dec({}).ok, true);
  w.clock.now = "2026-09-28T05:00:00Z";
  assert.equal(dec({ author: V("bob"), viewer: V("bob"), reason: "Still not." }).ok, true);
  const r = read(w, ms("2026-09-28T06:00:00Z"));
  assert.equal(r.proposed.length, 1);
  assert.deepEqual(r.proposed[0].declines.map((d) => [d.from, d.to, d.reason, d.author, d.at]),
    [[1, 2, "Not yet.", V("alice"), "2026-09-28T04:00:00Z"], [1, 2, "Still not.", V("bob"), "2026-09-28T05:00:00Z"]]);
  assert.ok(r.proposed[0].age_ms > 0);
  assert.equal(r.stage, 1, "a decline moves nothing");
  /* the advance */
  w.clock.now = "2026-09-28T07:00:00Z";
  const a = adv(w, 2, { reason: ok.reason });
  assert.deepEqual([a.ok, a.from, a.to, a.reason, a.author, a.at], [true, 1, 2, ok.reason, V("bob"), "2026-09-28T07:00:00Z"]);
  assert.deepEqual(a.trigger.ids, [w.D]);
  const h = read(w).history.find((x) => x.kind === "advance");
  assert.deepEqual([h.from, h.to, h.reason, h.author, h.at, h.trigger.ids], [1, 2, ok.reason, V("bob"), "2026-09-28T07:00:00Z", [w.D]]);
  /* a stage name is accepted as the edge's target */
  const n = w.action({ project: w.P, restsOn: [w.D] });
  attach(w, n);
  w.correspond(n, "sent", "2026-09-02");
  assert.equal(adv(w, "clock").to, 3);
});
