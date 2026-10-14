/* screens-action R6 (and R7 on `matter`): one government act's determination, consequences and escalation. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ops, press, last, ok, button, DATA_PLANE, DET, ESC, ESCALATION, STATUS_NONE, CONSEQUENCES } from "./page.mjs";

const AT = `/app/matter/${DET}~${ESC}`;
const BARE = `/app/matter/${DET}`;

test("R6: the determination: each standard, what it requires and what the act did, its outcome, compliant recorded with the same care as noncompliant", async () => {
  const p = await open(AT, DATA_PLANE);
  assert.equal(p.byOp("determination")[0].query.id, DET);
  const t = text(p);
  for (const s of ["The 2024 rent adjustment", "by City Administrator, City", "requires: a council vote · the act did: adjusted without a vote", "noncompliant",
    "requires: notice within 30 days · the act did: noticed on day 21", "compliant", "A compliant outcome is recorded with the same care"]) assert.ok(t.includes(s), s);
});

test("R6: the consequences: who or what, the measure and how it is known; an undetermined measure never read as zero, people counted as a class", async () => {
  const p = await open(AT, DATA_PLANE);
  assert.equal(p.byOp("consequencesof")[0].query.determination, DET);
  const t = text(p);
  assert.match(t, /Tenants of the district · class/);
  assert.match(t, /38000 USD/);
  assert.match(t, /The repair program · programundetermined/);
  assert.doesNotMatch(t, /The repair program[^U]*\b0\b/);
  assert.match(t, /Undetermined is never read as zero. People are counted as a class/);
  const q = await open(AT, { ...DATA_PLANE, consequencesof: ok({ ...CONSEQUENCES, parts: [] }) });
  // R14: no consequence at all: the section is not drawn, nor its note about zero
  assert.doesNotMatch(text(q), /Consequences|Not yet addressed|never read as zero/);
});

test("R6: the escalation: the seven stages, the proposed next stage and its trigger, what ends it, the actions attached; its acts by its state", async () => {
  const p = await open(AT, { ...DATA_PLANE, escalationadvance: ok({}), escalationstoppursuing: ok({}) });
  assert.equal(p.byOp("escalation")[0].query.id, ESC);
  const t = text(p);
  for (const s of ["1 Documentation", "2 Notification", "3 Clock starts", "4 Public", "5 Formal", "6 Political", "7 Legal",
    "Proposed: stage 3 Clock starts. The system proposes; a member decides. · its trigger was met 5 days ago", "It ends only when both hold",
    "compliance restored · no live compliant determination", "consequences addressed · not every part addressed", "at stage 2 Notification"]) assert.ok(t.includes(s), s);
  assert.equal(main(p).querySelector('[aria-current="step"]').textContent, "2 Notification");
  assert.ok(main(p).querySelector('a[href^="/app/action/ACTN-"]'));
  assert.deepEqual(ops(p), ["escalationadvance", "escalationend", "escalationstoppursuing"]);
  assert.match(button(p, "escalationadvance").textContent, /Advance to stage 3/);
  await press(p, "escalationadvance", { reason: "no reply" });
  assert.deepEqual(last(p, "escalationadvance").body, { id: ESC, to: 3, reason: "no reply" });
  await press(p, "escalationstoppursuing", { reason: "the group moved on" });
  assert.deepEqual(last(p, "escalationstoppursuing").body, { id: ESC, reason: "the group moved on" });
});

test("R6: 'End' is terminal: its dialog states what ending does, and nothing is sent before the confirm", async () => {
  const p = await open(AT, { ...DATA_PLANE, escalationend: ok({}) });
  const b = button(p, "escalationend");
  await p.click(b);
  assert.equal(p.byOp("escalationend").length, 0);
  assert.match(text(p, p.root().querySelector('[role="dialog"]')), /Ends the escalation, with how it ended/);
  await press(p, b, { confirm: true });
  assert.deepEqual(last(p, "escalationend").body, { id: ESC });
});

test("R6: a stopped escalation offers 'Reopen where it stopped' with a reason, and nothing else", async () => {
  const p = await open(AT, { ...DATA_PLANE, escalation: ok({ ...ESCALATION, state: "stopped_pursuing" }), escalationreopen: ok({}) });
  assert.deepEqual(ops(p), ["escalationreopen"]);
  await press(p, "escalationreopen", { reason: "a new reply" });
  assert.deepEqual(last(p, "escalationreopen").body, { id: ESC, reason: "a new reply" });
});

test("R6: with no escalation, 'Open an escalation' and 'Decline to escalate, with a reason'; opening one opens the matter at it", async () => {
  const p = await open(BARE, { ...DATA_PLANE, escalationstatus: ok(STATUS_NONE), escalationopen: ok({ id: ESC, stage: 1 }), declinetoescalate: ok({}) });
  assert.equal(p.byOp("escalation").length, 0);
  assert.deepEqual(ops(p), ["escalationopen", "declinetoescalate"]);
  await press(p, "declinetoescalate", { reason: "not worth it yet" });
  assert.deepEqual(last(p, "declinetoescalate").body, { determination: DET, reason: "not worth it yet" });
  await press(p, "escalationopen", { reason: "they ignored the notice" });
  assert.deepEqual(last(p, "escalationopen").body, { determination: DET, reason: "they ignored the notice" });
  assert.equal(p.location.pathname, `/app/matter/${encodeURIComponent(DET + "~" + ESC)}`);
});

test("R6: an escalation already open is linked from the bare matter, which offers no second opening", async () => {
  const p = await open(BARE, DATA_PLANE);
  assert.deepEqual(ops(p), []);
  assert.ok(main(p).querySelector(`a[href="/app/matter/${encodeURIComponent(DET + "~" + ESC)}"]`));
});

test("R6: the legal tools a stage makes available are listed as facts from the profile, never as advice", async () => {
  const p = await open(AT, { ...DATA_PLANE, escalation: ok({ ...ESCALATION, stage: 5, available: [{ label: "Complaint to the civil grand jury" }] }) });
  assert.match(text(p), /Available at this stage, from the profile, as facts. Nothing here is a recommendation/);
  assert.match(text(p), /Complaint to the civil grand jury/);
});
