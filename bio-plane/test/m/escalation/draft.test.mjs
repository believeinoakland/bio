/* escalation: the opening reason pre-assembled from the determination's record (R29; DEC-89 with Bob's addition),
   driven at the module's interface over the fixture's stand-ins, with negative controls. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, world, opened, V, MACHINE, OFFICE, ms } from "./fixture.mjs";
import { JUDGMENT_KEYS, REASON_MAX } from "../../../src/escalation/index.mjs";
import { proposalLabel } from "../../../src/record-grammar/index.mjs";

const draftOf = (w, extra = {}) => w.esc.escalationReasonDraft({ determination: w.D, viewer: V("bob"), ...extra });
const D_LINE = (D) => `Determination ${D} finds the act noncompliant with 2 standards: STD-2026-0001-a, STD-2026-0002-b.`;
const ACT_LINE = 'The act determined (ACT-2026-0001): "the act", by Town Clerk, City of Port Ellery, on 2026-09-01.';
const STD_LINE = (s) => `Standard ${s} is breached: it requires "what ${s} requires"; the act did "what the act did" `
  + "(reading: diverges; content c1). It was in force at the act's date.";

/** Every key, at any depth, of an answer. */
function keysOf(v, out = new Set()) {
  if (Array.isArray(v)) for (const x of v) keysOf(x, out);
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) { out.add(k); keysOf(x, out); }
  return out;
}

test("R29 the draft states, part by part and each part naming the record id it was assembled from, the determination and each noncompliant standard it pursues with that standard's basis (never the compliant one), the act determined, each action resting on the determination with its clock entries, and each consequence recorded on it; the text is the parts in order and nothing else", () => {
  const w = seeded();
  const A = w.action({ project: w.P, restsOn: [w.D], counterparty: { state: "named", ...OFFICE.board },
                       clock: [{ text: "reply due", date: "2026-10-20", basis: "the records rule" }] });
  w.action({ project: w.P, restsOn: ["CONF-2026-0999-determination"] });
  w.parts.set(w.D, [
    { id: "CONS-2026-0001-part", determination: w.D, standard: "STD-2026-0001-a", affected: { kind: "fund", description: "the parks fund" },
      measure: { unit: "money", currency: "USD", value: 12000 }, period: { from: "2026-01-01", to: "2026-06-30" }, state: "assessed",
      causation: { state: "unproven" } },
    { id: "CONS-2026-0002-part", determination: w.D, standard: "STD-2026-0002-b", affected: { kind: "class", description: "renters" },
      measure: { unit: "count", range: { low: 10, high: 40 } }, period: { from: "2026-02-01", to: "2026-03-01" }, state: "computed",
      causation: { state: "established" } },
    { id: "CONS-2026-0003-part", determination: w.D, standard: "STD-2026-0002-b", affected: { kind: "service", description: "the library" },
      measure: null, period: { from: "2026-02-01", to: "2026-03-01" }, state: "undetermined",
      undetermined: { why: "the figure is not in the record" }, causation: { state: "unproven" } },
  ]);
  const r = draftOf(w, { nowMs: ms("2026-10-01T12:00:00Z") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  const expected = [
    [w.D, D_LINE(w.D)],
    ["ACT-2026-0001", ACT_LINE],
    ["STD-2026-0001-a", STD_LINE("STD-2026-0001-a")],
    ["STD-2026-0002-b", STD_LINE("STD-2026-0002-b")],
    [A, `Action ${A} (request_for_comment) rests on the determination, addressed to Selectboard, Port Ellery Selectboard; its state is active.`],
    [A, `Action ${A}'s clock entry "reply due" is due 2026-10-20, on the basis "the records rule", pending.`],
    ["CONS-2026-0001-part", 'Consequence CONS-2026-0001-part (standard STD-2026-0001-a): it affects "the parks fund" (fund); its measure is '
      + "12000 money (USD), from 2026-01-01 to 2026-06-30; it is assessed, and its causation is unproven."],
    ["CONS-2026-0002-part", 'Consequence CONS-2026-0002-part (standard STD-2026-0002-b): it affects "renters" (class); its measure is '
      + "10 to 40 count, from 2026-02-01 to 2026-03-01; it is computed, and its causation is established."],
    ["CONS-2026-0003-part", 'Consequence CONS-2026-0003-part (standard STD-2026-0002-b): it affects "the library" (service); its measure '
      + "is undetermined (the figure is not in the record), from 2026-02-01 to 2026-03-01; it is undetermined, and its causation is unproven."],
  ];
  assert.deepEqual(r.parts.map((p) => [p.id, p.text]), expected);
  assert.equal(r.text, expected.map(([, t]) => t).join("\n"));
  assert.deepEqual([r.determination, r.as_of, r.length, r.reason_max], [w.D, "2026-10-01T12:00:00Z", [...r.text].length, REASON_MAX]);
  assert.ok(!r.text.includes("STD-2026-0003-c"), "the compliant standard is not pursued, so not stated");
  assert.ok(!r.text.includes("CONF-2026-0999"), "an action resting on another determination is not stated");
  /* the reads named, each asked for this viewer */
  assert.deepEqual(w.calls.consequencesOf, [{ determination: w.D, viewer: V("bob") }]);
  assert.deepEqual(w.calls.actionsFor.map((c) => [c.determination, c.viewer]), [[w.D, V("bob")]]);

  /* negative control: with no action and no consequence recorded, each is stated as none recorded, named by the
     determination */
  const v = seeded();
  const none = draftOf(v);
  assert.deepEqual(none.parts.slice(4).map((p) => [p.id, p.text]), [
    [v.D, "No action resting on the determination is recorded."],
    [v.D, "No consequence of the breach is recorded on the determination."]]);
});

test("R29 what could not be read is stated undetermined, never filled: the actions or the consequences unreadable, a standard with no basis in the read, its being in force undetermined, an act with no description, office or date, an action with no counterparty office or no clock, a clock entry missing its text, date, basis or status, a consequence part missing its affected, measure, period or state", () => {
  const w = world();
  for (const m of ["alice", "bob"]) w.member(m);
  w.P = w.project("Budget watch", "alice");
  w.join(w.P, "bob");
  w.D = w.determine({ project: w.P, actor: { role: "", body: "" }, outcomes: [
    { standard: "STD-a", outcome: "noncompliant", rows: [] },
    { standard: "STD-b", outcome: "noncompliant", in_force: "undetermined", in_force_why: "on 2026-09-01: the record does not decide it",
      disagreement: "every row reads aligns, and the member's outcome is noncompliant",
      rows: [{ requires: "", did: "notice given late", reading: "aligns", content: [] }] }] });
  const d = w.determinations.get(w.D);
  d.act = { id: null, description: "", actor: {}, evidence: [] };
  const A = w.action({ project: w.P, restsOn: [w.D], counterparty: { state: "unknown" } });
  const B = w.action({ project: w.P, restsOn: [w.D], clock: [{ text: "", date: "2026-10-01", basis: "", status: "" }] });
  w.parts.set(w.D, [{ id: "CONS-x", determination: w.D, standard: null, affected: {}, measure: { unit: "money", value: 5 }, period: null,
                      state: null, causation: {} }]);
  const r = draftOf(w);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  assert.deepEqual(r.parts.map((p) => [p.id, p.text]), [
    [w.D, `Determination ${w.D} finds the act noncompliant with 2 standards: STD-a, STD-b.`],
    [w.D, "The act determined: its description could not be read (undetermined), by an office the record does not name "
      + "(undetermined), at a date the record does not state (undetermined)."],
    ["STD-a", "Standard STD-a is breached: its basis in the determination could not be read (undetermined)."],
    ["STD-b", 'Standard STD-b is breached: it requires what the record does not state (undetermined); the act did "notice given late" '
      + "(reading: aligns). Whether it was in force at the act's date is undetermined (on 2026-09-01: the record does not decide it). "
      + "The determination states: every row reads aligns, and the member's outcome is noncompliant."],
    [A, `Action ${A} (request_for_comment) rests on the determination, addressed to an office the record does not name (undetermined); its state is active.`],
    [A, `Action ${A} states no clock entry.`],
    [B, `Action ${B} (request_for_comment) rests on the determination, addressed to Town Clerk, City of Port Ellery; its state is active.`],
    [B, `Action ${B}'s clock entry (its text undetermined) is due 2026-10-01, on the basis the record does not state (undetermined), `
      + "its status undetermined."],
    ["CONS-x", "Consequence CONS-x: it affects what the record does not state (undetermined); its measure is 5 money, over a period the "
      + "record does not state (undetermined); it is of a state the record does not state (undetermined), and its causation is undetermined."],
  ]);

  /* the actions and the consequences unreadable: each stated undetermined, named by the determination; nothing in
     their place */
  w.stand.actions.actionsFor = () => ({ ok: false, reason: "UNAVAILABLE" });
  w.stand.consequences.consequencesOf = () => ({ ok: false, reason: "UNAVAILABLE" });
  const u = draftOf(w);
  assert.deepEqual(u.parts.slice(4).map((p) => [p.id, p.text]), [
    [w.D, "The actions resting on the determination could not be read (undetermined)."],
    [w.D, "The consequences of the breach could not be read (undetermined)."]]);
  /* a provider absent altogether answers PROVIDER_UNAVAILABLE, never a draft in part */
  const x = seeded();
  delete x.esc.deps.consequences;
  const pu = draftOf(x);
  assert.deepEqual([pu.ok, pu.reason, pu.provider], [false, "PROVIDER_UNAVAILABLE", "consequences"]);
});

test("R29 an action resting on the determination that the viewer may not see is left out whole: no id, no clock, no count; a viewer who may see it is answered it", () => {
  const w = seeded();
  const seen = w.action({ project: w.P, restsOn: [w.D] });
  const hidden = w.action({ project: w.P, restsOn: [w.D], clock: [{ date: "2026-09-10", text: "reply due" }] });
  w.actionHidden.add(hidden);
  const bob = draftOf(w, { nowMs: ms("2026-10-01T00:00:00Z") });
  assert.equal(bob.ok, true);
  assert.ok(!bob.text.includes(hidden) && !bob.parts.some((p) => p.id === hidden), "withheld whole");
  assert.ok(!bob.text.includes("2026-09-10"), "its clock with it");
  assert.deepEqual(bob.parts.filter((p) => p.id.startsWith("ACTN-")).map((p) => p.id), [seen, seen]);
  /* negative control: alice may see it, and is answered it with its passed date */
  const alice = w.esc.escalationReasonDraft({ determination: w.D, nowMs: ms("2026-10-01T00:00:00Z"), viewer: V("alice") });
  assert.deepEqual(alice.parts.filter((p) => p.id === hidden).map((p) => p.text), [
    `Action ${hidden} (request_for_comment) rests on the determination, addressed to Town Clerk, City of Port Ellery; its state is active.`,
    `Action ${hidden}'s clock entry "reply due" is due 2026-09-10, on the basis "the rule", pending.`,
    `The date 2026-09-10 on action ${hidden} passed without a response: the entry is still pending on 2026-10-01.`]);
  /* one actionsFor lists but actionRead refuses is left out the same way */
  const u = seeded();
  const only = u.action({ project: u.P, restsOn: [u.D] });
  const read = u.stand.actions.actionRead;
  u.stand.actions.actionRead = (a) => (a.id === only && a.now !== undefined ? { ok: false, reason: "NO_SUCH_BUNDLE" } : read(a));
  assert.deepEqual(draftOf(u).parts.slice(4).map((p) => p.text), ["No action resting on the determination is recorded.",
    "No consequence of the breach is recorded on the determination."]);
});

test("R29 every date passed without a response is read at nowMs by actions R12's rule: a pending entry is past once the UTC day after its date has begun, at the caller's nowMs, else the instance clock; an entry that is not pending, or due later, is never stated passed", () => {
  const w = seeded();
  const A = w.action({ project: w.P, restsOn: [w.D], clock: [
    { text: "reply due", date: "2026-09-20", basis: "the records rule" },
    { text: "second reply due", date: "2026-09-25", basis: "the records rule" },
    { text: "answered", date: "2026-09-01", basis: "the records rule", status: "met" }] });
  const passed = (r) => r.parts.filter((p) => p.text.startsWith("The date ")).map((p) => [p.id, p.text]);
  /* at the end of the 20th it has not passed; at the start of the 21st it has; the met entry never does */
  assert.deepEqual(passed(draftOf(w, { nowMs: ms("2026-09-20T23:59:59Z") })), []);
  assert.deepEqual(passed(draftOf(w, { nowMs: ms("2026-09-21T00:00:00Z") })),
                   [[A, `The date 2026-09-20 on action ${A} passed without a response: the entry is still pending on 2026-09-21.`]]);
  assert.deepEqual(passed(draftOf(w, { nowMs: ms("2026-09-26T00:00:00Z") })), [
    [A, `The date 2026-09-20 on action ${A} passed without a response: the entry is still pending on 2026-09-26.`],
    [A, `The date 2026-09-25 on action ${A} passed without a response: the entry is still pending on 2026-09-26.`]]);
  /* each clock entry stated, the met one with its status */
  assert.ok(draftOf(w).text.includes(`Action ${A}'s clock entry "answered" is due 2026-09-01, on the basis "the records rule", met.`));
  /* no nowMs: the instance clock, whatever it is when asked */
  w.clock.now = "2026-09-20T12:00:00Z";
  assert.deepEqual([passed(draftOf(w)), draftOf(w).as_of], [[], "2026-09-20T12:00:00Z"]);
  w.clock.now = "2026-09-22T00:00:00Z";
  assert.deepEqual(passed(draftOf(w)).length, 1);
  /* actionRead is asked at the same instant */
  assert.equal(w.calls.actionRead.at(-1).now, ms("2026-09-22T00:00:00Z"));
});

test("R29 R17 the draft is labelled machine work through record-grammar's proposalLabel for escalation_reason, in the state machine_proposed, and writes nothing; it is never a reason until a member sends it, as offered or edited, as R1's reason, recorded as the member's own", () => {
  const w = seeded();
  w.action({ project: w.P, restsOn: [w.D], clock: [{ date: "2026-09-10" }] });
  const before = w.snapshot();
  const r = draftOf(w);
  assert.deepEqual(r.label, proposalLabel("system", "escalation_reason"));
  assert.deepEqual([r.label.state, r.label.machine_work], ["machine_proposed", true]);
  assert.match(r.label.says, /machine work/);
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  assert.equal(w.count("escalations"), 0);
  /* it is offered, never sent: the status reads neither, and no escalation exists until a member opens one */
  assert.equal(w.esc.escalationStatus({ determination: w.D, viewer: V("bob") }).status, "neither");
  /* a member sends it as offered: the reason recorded is theirs, attributed to them, the draft's words as sent */
  const o = w.esc.escalationOpen({ determination: w.D, reason: r.text, author: V("bob"), viewer: V("bob") });
  assert.equal(o.ok, true, JSON.stringify(o).slice(0, 300));
  const read = w.esc.escalationRead({ id: o.id, viewer: V("bob") });
  assert.deepEqual([read.opened_reason, read.opened_by, read.history[0].author, read.history[0].reason],
                   [r.text, V("bob"), V("bob"), r.text]);
  assert.ok(!("label" in read.history[0]) && !("draft" in read.history[0]), "the recorded reason carries no machine label");
  /* or edited: what the member sends is what is recorded */
  const v = seeded();
  const edited = `${draftOf(v).text}\nWe raise it because the notice never came.`;
  const o2 = v.esc.escalationOpen({ determination: v.D, reason: edited, author: V("alice"), viewer: V("alice") });
  assert.equal(v.esc.escalationRead({ id: o2.id, viewer: V("alice") }).opened_reason, edited);
  /* a machine may read the draft but never send it */
  assert.equal(v.esc.escalationOpen({ determination: v.D, reason: draftOf(v).text, author: MACHINE, viewer: MACHINE }).reason,
               "MACHINE_CANNOT_OPEN");
  /* the draft stays offered with an escalation open: it is not R1's ALREADY_OPEN, which asks of an opening */
  assert.equal(draftOf(v).ok, true);
});

test("R29 refusals, as R1 asks them and answered exactly as R1 answers them: NO_SUCH_DETERMINATION (absent and unseen one answer), DETERMINATION_SUPERSEDED, NOT_NONCOMPLIANT; each writes nothing; a live noncompliant determination is answered, by any viewer who may see it, joined or not", () => {
  const w = seeded();
  w.member("dave");
  w.join(w.P, "dave", "invited");
  const before = w.snapshot();
  const both = (determination, who = "bob") => [
    w.esc.escalationReasonDraft({ determination, viewer: V(who) }),
    w.esc.escalationOpen({ determination, reason: "Worth pursuing.", author: V(who), viewer: V(who) })];
  const same = (determination, code, who) => {
    const [draft, open] = both(determination, who);
    assert.equal(draft.reason, code, String(determination));
    assert.deepEqual(draft, open, `${code}: R1's own answer`);
  };
  same("CONF-2026-0404-none", "NO_SUCH_DETERMINATION");
  same(undefined, "NO_SUCH_DETERMINATION");
  same(w.D, "NO_SUCH_DETERMINATION", "carol");
  assert.deepEqual({ ...w.esc.escalationReasonDraft({ determination: w.D, viewer: V("carol") }), determination: null },
                   { ...w.esc.escalationReasonDraft({ determination: "CONF-2026-0404-none", viewer: V("carol") }), determination: null },
                   "unseen is answered as absent");
  const S = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }], supersededBy: "CONF-x" });
  same(S, "DETERMINATION_SUPERSEDED");
  const C = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0003-c", outcome: "compliant" }, { standard: "STD-2026-0004-d", outcome: "unclear" }] });
  same(C, "NOT_NONCOMPLIANT");
  assert.deepEqual(w.snapshot(), before, "no refusal writes anything");
  /* negative controls: the live noncompliant determination is answered; the invited member dave, who may see it but may
     not open (ESCALATION_NOT_A_PARTICIPANT), is offered it: the draft asks only R1's three conditions on the determination */
  assert.equal(draftOf(w).ok, true);
  assert.equal(w.esc.escalationOpen({ determination: w.D, reason: "x", author: V("dave"), viewer: V("dave") }).reason,
               "ESCALATION_NOT_A_PARTICIPANT");
  assert.equal(w.esc.escalationReasonDraft({ determination: w.D, viewer: V("dave") }).ok, true);
});

test("R29 R19 no answer of the draft carries a significance, severity, priority, urgency, rank or score, as a key or in its words, refused or answered", () => {
  const w = seeded();
  w.action({ project: w.P, restsOn: [w.D], clock: [{ date: "2026-09-10" }] });
  w.parts.set(w.D, [{ id: "CONS-1", standard: "STD-2026-0001-a", affected: { kind: "fund", description: "a fund" },
                      measure: { unit: "money", value: 1 }, period: { from: "2026-01-01", to: "2026-02-01" }, state: "assessed",
                      causation: { state: "unproven" } }]);
  const answers = [draftOf(w), draftOf(w, { nowMs: ms("2026-12-01T00:00:00Z") }), draftOf(w, { significance: "high", score: 9 }),
                   w.esc.escalationReasonDraft({ determination: "CONF-none", viewer: V("bob") })];
  for (const a of answers) {
    const keys = keysOf(a);
    for (const k of JUDGMENT_KEYS) assert.ok(!keys.has(k), `${k} in ${JSON.stringify(a).slice(0, 200)}`);
  }
  for (const a of answers.slice(0, 3))
    assert.doesNotMatch(a.text, /significan|severe|severity|priorit|urgen|\brank|score|serious|important/i);
  assert.deepEqual(answers[2], answers[0], "a judged input is ignored: it changes nothing in the answer");
});
