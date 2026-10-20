/* screens-action T51 fix round, the matter's entries R36, R45, R50, R51 (DEC-374, DEC-376): what is available by tier drawn row by row;
   the matter redrawn by what the record answers (no determination yet; recording and revising a determination); consequences recorded and
   revised, addressed, a success; the escalation's attach, hold, pause, resume and response. Every act sends the fields its owner declares
   (the harness checks each request against `DECLARED_OPS`), every sentence is a key read through W/PAGE. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ops, press, last, ok, refused, button, choose, W, PAGE, DATA_PLANE, DET, ESC, ESCALATION, STATUS_NONE, PROJECT, ACTION_ID, READER, DETERMINATION, ACTIONS } from "./page.mjs";

const AT = `/app/matter/${DET}~${ESC}`;
const BARE = `/app/matter/${DET}`;
const REACH = { assistantstate: ok({ on: true }), accountreference: ok({ held: true }) };
const NONE = { ...DATA_PLANE, determinations: ok({ ok: true, items: [], cursor: null, truncated: false }) };
const STANDARDS = ok({ ok: true, items: [{ id: "STD-1", cite: "Lease §7.2" }, { id: "STD-9", cite: "Lease §9.1" }], truncated: false });
const PUBLISHED = { publishedlist: ok({ bundles: [], cases: [{ case_id: "CASE-1", edition: 1 }, { case_id: "CASE-1", edition: 2 }] }),
  publishedcase: ok({ ok: true, findings: [{ bundle_id: "FND-1", title: "Rents rose without a vote" }, { bundle_id: "FND-2", title: "The shortfall was not reported" }] }) };
const QUESTIONS = ok({ ok: true, project: PROJECT, items: [{ inquiry: "INQ-1", title: "Did the adjustments cause the higher rent?" }], cursor: null });
/** What the act sent less the reason the shell asks of a reasoned act (it is no field of the screen). */
const sent = (p, op) => { const { reason, ...rest } = last(p, op).body; return rest; };
const STAGE = (n, o = {}) => ({ ...DATA_PLANE, escalation: ok({ ...ESCALATION, stage: n, ...o }) });

// R36
test("R36: what is available by tier draws one row per kind of the answer {kinds, determinations, says}, never one blank row", async () => {
  const kinds = [{ kind: "complaint", label: "Complaint to the auditor", tier: 1, words: "tier one words" }, { kind: "grand_jury", label: null, tier: 3, words: "tier three words" }];
  const p = await open(AT, STAGE(5, { available: { ok: true, determination: DET, kinds, determinations: [], says: "the kinds the profile lists" } }));
  const t = text(p);
  assert.ok(t.includes(W("screen.matter.available")));
  const rows = main(p).querySelectorAll(".cs-row").map((r) => text(p, r));
  assert.ok(rows.some((r) => r.includes("Complaint to the auditor") && r.includes("tier one words")), "the labelled kind");
  assert.ok(rows.some((r) => r.includes("grand_jury") && r.includes("tier three words")), "the kind with no label is named by its kind");
  const blank = main(p).querySelectorAll(".cs-row").filter((r) => text(p, r) === "");
  assert.equal(blank.length, 0, "no blank row");
  // control: no `available` at all: no such section
  const q = await open(AT, STAGE(5));
  assert.ok(!text(q).includes(W("screen.matter.available")));
  // control: the answer that lists no kind says so in its own words and draws no row for it
  const r = await open(AT, STAGE(5, { available: { state: "undetermined", says: "the profile names none" } }));
  assert.ok(text(r).includes("the profile names none") && !text(r).includes(W("screen.matter.available")));
});

// R45
test("R45 (b): a matter with no determination yet draws each act that needs one as unavailable, saying why, and offers to record a determination", async () => {
  const p = await open(`/app/matter/${PROJECT}`, NONE);
  assert.equal(p.byOp("determinations")[0].query.project, PROJECT);
  const t = text(p);
  for (const k of ["screen.matter.your_team_has_not_yet_said_whether", "screen.matter.what_a_breach_did_and_every_stage", "screen.matter.needs_a_recorded_determination_that_the_act",
    "screen.matter.saying_what_the_breach_did", "screen.matter.needs_the_same_determination", "screen.matter.attaching_an_action_holding_at_a_stage",
    "screen.matter.needs_an_escalation_which_needs_the_same", "act.escalationopen.label.matter"]) assert.ok(t.includes(W(k)), k);
  assert.deepEqual(ops(p).filter((o) => o !== "writinghelp"), ["determine"], "the escalation's acts are not drawn, only the way to a determination");
  // control: with a determination held there is no such list
  const q = await open(`/app/matter/${PROJECT}`, { ...DATA_PLANE, determinations: ok({ ok: true, items: [{ id: DET, project: PROJECT, act: { event: "The 2024 rent adjustment" } }] }) });
  assert.ok(!text(q).includes(W("screen.matter.needs_the_same_determination")));
  assert.ok(main(q).querySelector(`a[href="/app/matter/${encodeURIComponent(DET)}"]`));
});

test("R45 (c): recording a determination sends exactly what `determine` declares: the act, the findings it rests on, the rule, what it requires and what was done, the outcome, the question when unclear, the cause", async () => {
  const p = await open(`/app/matter/${PROJECT}`, { ...NONE, standards: STANDARDS, ...PUBLISHED, determine: ok({ ok: true, id: DET }) });
  assert.ok(!main(p).querySelector("#mt-d-why"), "a first determination replaces nothing");
  // the rules come from `standards`, the findings from the published cases' own findings
  assert.equal(p.byOp("standards").length, 1);
  assert.deepEqual(p.byOp("publishedcase").map((r) => r.query.edition), ["2"], "each case's latest edition, once");
  assert.ok(main(p).querySelector("#mt-d-std option[value='STD-9']"));
  assert.ok(text(p).includes("Rents rose without a vote"));
  await press(p, "determine", { reason: "recorded", values: { "mt-d-event": "EVT-1", "mt-d-role": "City Administrator", "mt-d-body": "City of Oakland", "mt-d-evidence": "CAP-1, CAP-2",
    "mt-d-findings-0": true, "mt-d-std": "STD-1", "mt-d-req": "a council vote", "mt-d-did": "no vote was held", "mt-d-rd": "diverges", "mt-d-out-2": true, "mt-d-q": "Was there a vote?", "mt-d-cause": "a rushed signing" } });
  const b = last(p, "determine").body;
  assert.deepEqual(b.act, { event: "EVT-1", actor: { role: "City Administrator", body: "City of Oakland" }, evidence: ["CAP-1", "CAP-2"] });
  assert.deepEqual(b.findings, [{ finding: "FND-1" }]);
  assert.deepEqual(b.standards, [{ standard: "STD-1", outcome: "unclear" }]);
  assert.deepEqual(b.rows, [{ standard: "STD-1", requires: "a council vote", did: "no vote was held", reading: "diverges" }]);
  assert.deepEqual(b.questions, [{ question: "Was there a vote?" }]);
  assert.deepEqual(b.cause, { statement: "a rushed signing", evidence: ["CAP-1", "CAP-2"] });
  assert.equal(b.project, PROJECT);
  assert.ok(!("supersedes" in b), "control: nothing superseded");
});

test("R45 (d): revising a determination names the one it replaces, opens with its values, and says why in the reason; the earlier is not edited", async () => {
  const p = await open(AT, { ...DATA_PLANE, standards: STANDARDS, ...PUBLISHED, determine: ok({ ok: true, id: "CONF-2026-9999999999999999-determination" }) });
  assert.ok(!ops(p).includes("determine"), "the form is opened by the member's choice");
  await choose(p, "mt-mode", "determine");
  assert.ok(text(p).includes(W("screen.matter.the_earlier_determination_stays_readable_with_a")));
  assert.equal(main(p).querySelector("#mt-d-event").value, "The 2024 rent adjustment");
  assert.equal(main(p).querySelector("#mt-d-role").value, "City Administrator");
  assert.equal(main(p).querySelector("#mt-d-req").value, "a council vote");
  assert.ok(button(p, "determine").textContent.includes(W("screen.matter.record_the_revised_determination")));
  await press(p, "determine", { reason: "the first rule did not bind the office", values: { "mt-d-out-1": false, "mt-d-out-0": true } });
  const b = last(p, "determine").body;
  assert.equal(b.supersedes, DET);
  assert.equal(b.reason, "the first rule did not bind the office");
  assert.deepEqual(b.standards, [{ standard: "STD-1", outcome: "compliant" }]);
  assert.equal(b.act.event, "The 2024 rent adjustment");
  // control: a first determination is plain
  const q = await open(`/app/matter/${PROJECT}`, { ...NONE, determine: ok({ ok: true, id: DET }) });
  assert.ok(button(q, "determine").textContent.includes(W("act.determine.label.matter")));
});

test("R45: the determination's refusals are drawn by their words (refusal.<CODE>); control: a recorded one draws none", async () => {
  for (const code of ["NO_FINDINGS", "ACT_INCOMPLETE", "UNCLEAR_NO_QUESTION", "STANDARD_NOT_IN_FORCE", "STANDARD_NOT_BINDING", "CONFORMANCE_NO_REASON", "DETERMINATION_SUPERSEDED"]) {
    const p = await open(AT, { ...DATA_PLANE, determine: refused(code, "the owner's own sentence") });
    await choose(p, "mt-mode", "determine");
    const b = await press(p, "determine", { reason: "x" });
    const beside = text(p, p.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`));
    assert.ok(beside.includes(W(`refusal.${code}`)), code);
    assert.ok(!beside.includes("the owner's own sentence"), code);
  }
  const p = await open(AT, { ...DATA_PLANE, determine: ok({ ok: true, id: DET }) });
  await choose(p, "mt-mode", "determine");
  const b = await press(p, "determine", { reason: "x" });
  assert.ok(!text(p, p.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`)).includes(W("refusal.NO_FINDINGS")));
});

test("R45: a member who may not act reads the read-only sentence and is offered no form and no act", async () => {
  for (const path of [AT, `/app/matter/${PROJECT}`]) {
    const p = await open(path, { ...NONE, ...DATA_PLANE, determinations: NONE.determinations, whoami: ok(READER) });
    assert.deepEqual(ops(p), []);
    assert.ok(!main(p).querySelector("#mt-mode") && !main(p).querySelector("#mt-d-req"));
    assert.ok(text(p).includes(W("shell.readonly", { noun: W("shell.readonly.noun.matter"), members: W("shell.readonly.members") })));
  }
});

test("R45: a determination already replaced is read and offers no form to record, revise or add to", async () => {
  const p = await open(BARE, { ...DATA_PLANE, determination: ok({ ...DETERMINATION, live: false }) });
  assert.ok(!main(p).querySelector("#mt-mode"), "nothing to choose: every form works on the live determination");
  assert.ok(text(p).includes(W("screen.matter.notlive")));
  // control: the live one offers its forms
  const q = await open(BARE, DATA_PLANE);
  assert.ok(main(q).querySelector("#mt-mode option[value='determine']"));
});

// R50
test("R50: what the breach did is recorded with the rule it breached, who was affected, what it is measured in, the period and how it is known; each act sends its declared fields", async () => {
  const p = await open(AT, { ...DATA_PLANE, projectquestions: QUESTIONS, consequencerecord: ok({ ok: true, id: "C-3" }) });
  await choose(p, "mt-mode", "consequencerecord");
  assert.deepEqual(main(p).querySelectorAll("#mt-c-std option").map((o) => o.value), ["STD-1"], "only a rule found noncompliant");
  assert.ok(main(p).querySelector("#mt-c-cause option[value='INQ-1']"), "the question showing the harm follows is picked from the project's questions");
  assert.equal(p.byOp("projectquestions")[0].query.project, PROJECT);
  await press(p, "consequencerecord", { reason: "recorded", values: { "mt-c-kind": "class", "mt-c-desc": "Households that paid the higher rent", "mt-c-unit": "money", "mt-c-amt": "$38,000",
    "mt-c-from": "2024-01-01", "mt-c-to": "2026-09-30", "mt-c-basis-0": false, "mt-c-basis-1": true, "mt-c-rat": "from the rent roll", "mt-c-cause": "INQ-1" } });
  assert.deepEqual(sent(p, "consequencerecord"), { determination: DET, standard: "STD-1", affected: { kind: "class", description: "Households that paid the higher rent" },
    period: { from: "2024-01-01", to: "2026-09-30" }, measure: { unit: "money", value: "38000" }, basis: { rationale: "from the rent roll", rests_on: [] }, causation: "INQ-1" });
  // a range, and a part not yet known
  await press(p, "consequencerecord", { reason: "recorded", values: { "mt-c-amt": "100 to 200", "mt-c-basis-0": false, "mt-c-basis-1": false, "mt-c-basis-2": true, "mt-c-cause": "" } });
  const b = sent(p, "consequencerecord");
  assert.deepEqual(b.measure, { unit: "money", range: { low: "100", high: "200" } });
  assert.deepEqual(b.basis, { why: "not_assessed" });
  assert.ok(!("causation" in b), "control: no question, no causation");
  // control: a determination with no noncompliant rule offers no such form
  const q = await open(AT, { ...DATA_PLANE, determination: ok({ ...DETERMINATION, standards: [{ ...DETERMINATION.standards[1] }] }) });
  assert.ok(!main(q).querySelector("#mt-mode option[value='consequencerecord']"));
});

test("R50: a recorded part is revised with the reason, only what was changed sent; control: the reason is the member's own", async () => {
  const p = await open(AT, { ...DATA_PLANE, consequencerevise: ok({ ok: true, id: "C-4" }) });
  await choose(p, "mt-mode", "consequencerevise");
  assert.deepEqual(main(p).querySelectorAll("#mt-r-part option").map((o) => o.value), ["C-1", "C-2"]);
  await press(p, "consequencerevise", { values: { "mt-r-part": "C-1", "mt-r-amt": "41000", "mt-r-why": "the schedules were corrected" } });
  assert.deepEqual(last(p, "consequencerevise").body, { id: "C-1", reason: "the schedules were corrected", measure: { unit: "money", value: "41000" } });
  await press(p, "consequencerevise", { values: { "mt-r-part": "C-2", "mt-r-amt": "", "mt-r-desc": "Households on the rent roll", "mt-r-why": "named them" } });
  assert.deepEqual(last(p, "consequencerevise").body, { id: "C-2", reason: "named them", affected: { kind: "program", description: "Households on the rent roll" } });
  // control: no reason, nothing sent
  const n = p.byOp("consequencerevise").length;
  await press(p, "consequencerevise", { values: { "mt-r-why": "" } });
  assert.equal(p.byOp("consequencerevise").length, n);
  for (const code of ["ALREADY_SUPERSEDED", "CONSEQUENCE_NOT_NONCOMPLIANT", "MEASURE_INVALID", "PERIOD_INVALID"]) {
    const q = await open(AT, { ...DATA_PLANE, consequencerevise: refused(code, "the owner's own sentence") });
    await choose(q, "mt-mode", "consequencerevise");
    const b = await press(q, "consequencerevise", { values: { "mt-r-why": "x" } });
    const beside = text(q, q.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`));
    assert.ok(beside.includes(W(`refusal.${code}`)), code);
  }
});

test("R50: whether a part was addressed is recorded with its evidence, its reason and, for an addressed one, in what way; control: a part not addressed names no way", async () => {
  const p = await open(AT, { ...DATA_PLANE, addressedrecord: ok({ ok: true }) });
  await choose(p, "mt-mode", "addressedrecord");
  await press(p, "addressedrecord", { values: { "mt-a-part": "C-1", "mt-a-state-0": true, "mt-a-words-1": true, "mt-a-ev": "DOC-1 DOC-2", "mt-a-why": "the city refunded it" } });
  assert.deepEqual(last(p, "addressedrecord").body, { id: "C-1", state: "addressed", evidence: ["DOC-1", "DOC-2"], reason: "the city refunded it", words: ["mitigated"] });
  await press(p, "addressedrecord", { values: { "mt-a-state-0": false, "mt-a-state-1": true, "mt-a-why": "nothing was refunded" } });
  const b = last(p, "addressedrecord").body;
  assert.equal(b.state, "not_addressed");
  assert.ok(!("words" in b));
  for (const code of ["ADDRESSED_NO_EVIDENCE", "ADDRESSED_NO_REASON", "ADDRESSED_WORD_REFUSED", "ADDRESSED_NO_PERCENTAGE"]) {
    const q = await open(AT, { ...DATA_PLANE, addressedrecord: refused(code, "the owner's own sentence") });
    await choose(q, "mt-mode", "addressedrecord");
    const r = await press(q, "addressedrecord", { values: { "mt-a-why": "x" } });
    assert.ok(text(q, q.root().querySelector(`[data-slot="${r.getAttribute("data-ai")}"]`)).includes(W(`refusal.${code}`)), code);
  }
});

test("R50: a success is recognised with what changed, when, the evidence, the order of events and, if said, the cause; control: the optional ones left out are not sent", async () => {
  const p = await open(AT, { ...DATA_PLANE, successrecord: ok({ ok: true, id: "SUC-2026-0001" }) });
  await choose(p, "mt-mode", "successrecord");
  await press(p, "successrecord", { reason: "recorded", values: { "mt-s-st": "The city refunded the rent.", "mt-s-on": "2026-10-01", "mt-s-ev": "DOC-9", "mt-s-seq": "We wrote on September 3.", "mt-s-cause": "our letter and the audit" } });
  assert.deepEqual(sent(p, "successrecord"), { project: PROJECT, statement: "The city refunded the rent.", changed_on: "2026-10-01", evidence: ["DOC-9"],
    sequence: "We wrote on September 3.", cause: { statement: "our letter and the audit", evidence: ["DOC-9"] } });
  await press(p, "successrecord", { reason: "recorded", values: { "mt-s-seq": "", "mt-s-cause": "" } });
  const b = sent(p, "successrecord");
  assert.ok(!("sequence" in b) && !("cause" in b));
  for (const code of ["SUCCESS_NO_EVIDENCE", "SUCCESS_BAD_DATE", "SUCCESS_CAUSE_OWN_ACT_ONLY", "SUCCESS_NO_STATEMENT"]) {
    const q = await open(AT, { ...DATA_PLANE, successrecord: refused(code, "the owner's own sentence") });
    await choose(q, "mt-mode", "successrecord");
    const r = await press(q, "successrecord", { reason: "x" });
    assert.ok(text(q, q.root().querySelector(`[data-slot="${r.getAttribute("data-ai")}"]`)).includes(W(`refusal.${code}`)), code);
  }
});

test("R50: ending an escalation is refused in words while compliance is not restored or the consequences are undetermined or not addressed; control: an ended one draws no refusal", async () => {
  for (const code of ["COMPLIANCE_NOT_RESTORED", "CONSEQUENCES_UNDETERMINED", "CONSEQUENCES_NOT_ADDRESSED"]) {
    const p = await open(AT, { ...DATA_PLANE, escalationend: refused(code, "the owner's own sentence") });
    const b = await press(p, "escalationend", { confirm: true });
    const beside = text(p, p.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`));
    assert.ok(beside.includes(W(`refusal.${code}`)), code);
    assert.ok(!beside.includes("the owner's own sentence"), code);
  }
  const p = await open(AT, { ...DATA_PLANE, escalationend: ok({}) });
  const b = await press(p, "escalationend", { confirm: true });
  const beside = text(p, p.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`));
  for (const code of ["COMPLIANCE_NOT_RESTORED", "CONSEQUENCES_UNDETERMINED", "CONSEQUENCES_NOT_ADDRESSED"]) assert.ok(!beside.includes(W(`refusal.${code}`)), code);
});

// R51
test("R51: an action is attached to the stage with the member's reason, picked from the determination's actions; at the political accountability stage with its purpose and the rules it seeks enforced", async () => {
  const p = await open(AT, { ...DATA_PLANE, actions: ok(ACTIONS), escalationattach: ok({ ok: true }) });
  await choose(p, "mt-mode", "escalationattach");
  assert.equal(p.byOp("actions")[0].query.determination, DET);
  assert.ok(main(p).querySelector(`#mt-t-act option[value='${ACTION_ID}']`));
  assert.ok(!main(p).querySelector("#mt-t-purpose"), "no purpose before the political accountability stage");
  await press(p, "escalationattach", { values: { "mt-t-act": ACTION_ID, "mt-t-why": "it states the breach" } });
  assert.deepEqual(last(p, "escalationattach").body, { id: ESC, action: ACTION_ID, reason: "it states the breach" });
  const q = await open(AT, { ...STAGE(7), actions: ok(ACTIONS), escalationattach: ok({ ok: true }) });
  await choose(q, "mt-mode", "escalationattach");
  assert.deepEqual(main(q).querySelectorAll("#mt-t-purpose option").map((o) => o.value), ["official_request", "oversight_request", "audit_request", "testimony", "enforcing_legislation"]);
  await press(q, "escalationattach", { values: { "mt-t-act": ACTION_ID, "mt-t-why": "asks the council to act", "mt-t-purpose": "oversight_request" } });
  assert.deepEqual(last(q, "escalationattach").body, { id: ESC, action: ACTION_ID, reason: "asks the council to act", purpose: "oversight_request", standards: ["STD-1"] });
  for (const code of ["NOT_THE_BREACH", "ALREADY_ATTACHED", "NOT_ACCOUNTABILITY", "COUNTERPARTY_NOT_ELECTED", "ESCALATION_NO_REASON"]) {
    const r = await open(AT, { ...DATA_PLANE, actions: ok(ACTIONS), escalationattach: refused(code, "the owner's own sentence") });
    await choose(r, "mt-mode", "escalationattach");
    const b = await press(r, "escalationattach", { values: { "mt-t-why": "x" } });
    assert.ok(text(r, r.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`)).includes(W(`refusal.${code}`)), code);
  }
});

test("R51: 'Hold at this stage, with a reason' and 'Decline to escalate' are two acts: holding names the stage proposed and keeps the escalation open; declining names the determination", async () => {
  const p = await open(AT, { ...DATA_PLANE, escalationdecline: ok({ ok: true }), declinetoescalate: ok({}) });
  assert.equal(W("act.escalationdecline.label.matter") === W("act.declinetoescalate.label.matter"), false, "two words");
  await choose(p, "mt-mode", "escalationdecline");
  assert.ok(button(p, "escalationdecline").textContent.includes(W("act.escalationdecline.label.matter")));
  assert.ok(!ops(p).includes("declinetoescalate"), "an open escalation is not declined");
  await press(p, "escalationdecline", { values: { "mt-h-why": "we wait for the reply" } });
  assert.deepEqual(last(p, "escalationdecline").body, { id: ESC, to: 3, reason: "we wait for the reply" });
  // control: with nothing proposed there is nothing to hold at
  const q = await open(AT, { ...DATA_PLANE, escalation: ok({ ...ESCALATION, proposed: [] }) });
  assert.ok(!main(q).querySelector("#mt-mode option[value='escalationdecline']"));
  // and with no escalation the matter offers declining, never holding
  const r = await open(BARE, { ...DATA_PLANE, escalationstatus: ok(STATUS_NONE), declinetoescalate: ok({}) });
  assert.ok(ops(r).includes("declinetoescalate") && !ops(r).includes("escalationdecline"));
  for (const code of ["EDGE_NOT_PROPOSED", "NOT_OPEN", "ESCALATION_NO_REASON"]) {
    const s = await open(AT, { ...DATA_PLANE, escalationdecline: refused(code, "the owner's own sentence") });
    await choose(s, "mt-mode", "escalationdecline");
    const b = await press(s, "escalationdecline", { values: { "mt-h-why": "x" } });
    assert.ok(text(s, s.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`)).includes(W(`refusal.${code}`)), code);
  }
});

test("R51: pausing sends the reason; a paused escalation proposes nothing and is resumed, the reason optional; each only in its own state", async () => {
  const p = await open(AT, { ...DATA_PLANE, escalationsuspend: ok({}) });
  await choose(p, "mt-mode", "escalationsuspend");
  await press(p, "escalationsuspend", { values: { "mt-p-why": "the office asked for a month" } });
  assert.deepEqual(last(p, "escalationsuspend").body, { id: ESC, reason: "the office asked for a month" });
  assert.ok(!main(p).querySelector("#mt-mode option[value='escalationresume']"), "control: an open escalation is not resumed");
  const q = await open(AT, { ...DATA_PLANE, escalation: ok({ ...ESCALATION, state: "suspended", proposed: [] }), escalationresume: ok({}) });
  assert.ok(text(q).includes(W("screen.matter.escstate.suspended")));
  assert.ok(!main(q).querySelector("#mt-mode option[value='escalationsuspend']"), "control: a paused one is not paused again");
  await choose(q, "mt-mode", "escalationresume");
  await press(q, "escalationresume", { values: { "mt-u-why": "" } });
  assert.deepEqual(last(q, "escalationresume").body, { id: ESC }, "no reason: none sent");
  await press(q, "escalationresume", { values: { "mt-u-why": "the month is over" } });
  assert.deepEqual(last(q, "escalationresume").body, { id: ESC, reason: "the month is over" });
  for (const [op, code, state] of [["escalationsuspend", "ALREADY_SUSPENDED", "open"], ["escalationresume", "NOT_SUSPENDED", "suspended"]]) {
    const r = await open(AT, { ...DATA_PLANE, escalation: ok({ ...ESCALATION, state }), [op]: refused(code, "the owner's own sentence") });
    await choose(r, "mt-mode", op);
    const b = await press(r, op, { values: op === "escalationsuspend" ? { "mt-p-why": "x" } : {} });
    assert.ok(text(r, r.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`)).includes(W(`refusal.${code}`)), code);
  }
});

test("R51: the government's response is read at the response evaluation stage, from the replies received on the attached actions, with a reading and a reason", async () => {
  const action = ok({ ...DATA_PLANE.action.json.result, correspondence: [{ ord: 1, direction: "sent", at: "2026-10-02", party: "Office of the City Clerk" }, { ord: 2, direction: "received", at: "2026-10-15", party: "Office of the City Clerk" }] });
  const four = { ...STAGE(4), action, escalationevaluate: ok({ ok: true }) };
  const p = await open(AT, four);
  assert.equal(p.byOp("action").length, 0, "nothing is read before the form is opened");
  await choose(p, "mt-mode", "escalationevaluate");
  assert.equal(p.byOp("action")[0].query.id, ACTION_ID, "the attached action's replies");
  assert.deepEqual(main(p).querySelectorAll("#mt-e-resp option").map((o) => o.value), ["none", `${ACTION_ID}|2`]);
  await press(p, "escalationevaluate", { values: { "mt-e-resp": `${ACTION_ID}|2`, "mt-e-read": "partial", "mt-e-why": "it answers one of three requests" } });
  assert.deepEqual(last(p, "escalationevaluate").body, { id: ESC, reading: "partial", reason: "it answers one of three requests", response: { action: ACTION_ID, ord: 2 } });
  await press(p, "escalationevaluate", { values: { "mt-e-resp": "none", "mt-e-read": "none", "mt-e-why": "nothing by the deadline" } });
  assert.deepEqual(last(p, "escalationevaluate").body, { id: ESC, reading: "none", reason: "nothing by the deadline" });
  // control: not at the stage, no such form
  const q = await open(AT, DATA_PLANE);
  assert.ok(!main(q).querySelector("#mt-mode option[value='escalationevaluate']"));
  for (const code of ["NOT_IN_EVALUATION", "NO_SUCH_RESPONSE", "ESCALATION_NO_REASON"]) {
    const r = await open(AT, { ...four, escalationevaluate: refused(code, "the owner's own sentence") });
    await choose(r, "mt-mode", "escalationevaluate");
    const b = await press(r, "escalationevaluate", { values: { "mt-e-why": "x" } });
    assert.ok(text(r, r.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`)).includes(W(`refusal.${code}`)), code);
  }
});

test("R51: stages are named in words, never shown by number: the ladder and the forms of each stage draw the stage's own word", async () => {
  for (const n of [1, 2, 3, 4, 5, 6, 7]) {
    const p = await open(AT, { ...STAGE(n), action: ok({ ...DATA_PLANE.action.json.result }), actions: ok(ACTIONS) });
    assert.equal(main(p).querySelector('[aria-current="step"]').textContent, W(`screen.matter.stage.${n}`));
    for (const mode of main(p).querySelectorAll("#mt-mode option").map((o) => o.value).filter((v) => v.startsWith("escalation"))) {
      await choose(p, "mt-mode", mode);
      const t = text(p);
      const form = t.slice(t.lastIndexOf(W("screen.matter.where_this_matter_stands")));
      assert.doesNotMatch(form, /[Ss]tage \d/, `${mode} at stage ${n}`);
    }
  }
});

test("R45, R50, R51: the matter's acts are the registry's; each form's act is drawn only for a member who may do it", async () => {
  const p = await open(AT, { ...DATA_PLANE, standards: STANDARDS, projectquestions: QUESTIONS, actions: ok(ACTIONS) });
  const offered = main(p).querySelectorAll("#mt-mode option").map((o) => o.value).filter(Boolean);
  assert.deepEqual(offered, ["determine", "consequencerecord", "consequencerevise", "addressedrecord", "successrecord", "escalationattach", "escalationdecline", "escalationsuspend"]);
  const r = await open(AT, { ...DATA_PLANE, whoami: ok(READER) });
  assert.equal(main(r).querySelectorAll("#mt-mode option").length, 0);
});

test("R45, R50, R51 (writinghelp): the helper is drawn beside each field the design marks for it only while the assistant is reachable, and sends the words typed", async () => {
  const plane = { ...DATA_PLANE, writinghelp: ok({ ok: true, text: "A clearer sentence." }) };
  const off = await open(AT, plane);
  for (const mode of ["determine", "consequencerecord", "consequencerevise", "addressedrecord", "successrecord", "escalationattach", "escalationdecline", "escalationsuspend"]) {
    await choose(off, "mt-mode", mode);
    assert.ok(!ops(off).includes("writinghelp"), `${mode}: not while the assistant is unreachable`);
  }
  const on = await open(AT, { ...plane, ...REACH });
  const want = { determine: 4, consequencerecord: 2, consequencerevise: 1, addressedrecord: 1, successrecord: 3, escalationattach: 1, escalationdecline: 1, escalationsuspend: 1 };
  for (const [mode, n] of Object.entries(want)) {
    await choose(on, "mt-mode", mode);
    assert.equal(ops(on).filter((o) => o === "writinghelp").length, n, mode);
  }
  await choose(on, "mt-mode", "escalationdecline");
  await press(on, "writinghelp", { values: { "mt-h-why": "we wait" } });
  assert.equal(last(on, "writinghelp").body.told, "we wait");
  assert.equal(last(on, "writinghelp").body.field, "reason");
  assert.equal(main(on).querySelector("#mt-h-why").value, "A clearer sentence.");
});
