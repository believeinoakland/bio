/* screens-action T51 fix round, the matter's entries R36, R45, R50, R51 (DEC-374, DEC-376): what is available by tier drawn row by row;
   the matter redrawn by what the record answers (no determination yet; recording and revising a determination); consequences recorded and
   revised, addressed, a success; the escalation's attach, hold, pause, resume and response. Every act sends the fields its owner declares
   (the harness checks each request against `DECLARED_OPS`), every sentence is a key read through W/PAGE. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ops, press, last, ok, refused, button, choose, W, PAGE, DATA_PLANE, DET, ESC, ESCALATION, STATUS_NONE, PROJECT, ACTION_ID, READER, ACTIONS } from "./page.mjs";

const AT = `/app/matter/${DET}~${ESC}`;
const BARE = `/app/matter/${DET}`;
const REACH = { assistantstate: ok({ on: true }), accountreference: ok({ held: true }) };
const NONE = { ...DATA_PLANE, determinations: ok({ ok: true, items: [], cursor: null, truncated: false }) };
const STANDARDS = ok({ ok: true, items: [{ id: "STD-1", cite: "Lease §7.2" }, { id: "STD-9", cite: "Lease §9.1" }], truncated: false });
const PUBLISHED = { publishedlist: ok({ bundles: [], cases: [{ case_id: "CASE-1", edition: 1 }, { case_id: "CASE-1", edition: 2 }] }),
  publishedcase: ok({ ok: true, findings: [{ bundle_id: "FND-1", title: "Rents rose without a vote" }, { bundle_id: "FND-2", title: "The shortfall was not reported" }] }) };
const QUESTIONS = ok({ ok: true, project: PROJECT, items: [{ inquiry: "INQ-1", title: "Did the adjustments cause the higher rent?" }], cursor: null });
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
