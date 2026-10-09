/* reading-guides: a member's draft (R2), review (R3), retirement (R7) and the machine's proposal, kept apart (R12). */
import test from "node:test";
import assert from "node:assert/strict";
import { isGuideId } from "../../../src/record-grammar/ids.mjs";
import { GUIDE_PROPOSAL_STATES, guideProposalLabel, REASON_MAX, RUN_MAX } from "../../../src/reading-guides/index.mjs";
import { world, row, item, ITEMS, ANN, BOB, CY, REV, BOSS, MACHINE } from "./fixture.mjs";

test("R2 a member's draft is usable by its author at once, with its kind, items and history", () => {
  const w = world();
  const r = w.g.guideDraft({ kind: "staff_report", items: [{ label: " Fiscal ", look_for: " Look for the fiscal impact " }], by: ANN });
  assert.equal(r.ok, true);
  assert.ok(isGuideId(r.guide), r.guide);
  assert.equal(r.state, "usable_by_author");
  const read = w.g.guideRead({ guide: r.guide, viewer: ANN });
  assert.deepEqual(read.guide, { id: r.guide, kind: "staff_report", origin: "group", items: [{ label: "Fiscal", look_for: "Look for the fiscal impact" }],
    state: "usable_by_author", author: "ann", reviewed_by: null, based_on: null, offered_by: null });
  assert.deepEqual(read.history.map((h) => [h.act, h.state, h.by]), [["draft", "usable_by_author", "ann"]]);
  assert.equal(w.g.guideFor({ kind: "staff_report", viewer: ANN }).guide.id, r.guide, "usable by its author at once");
  /* the founder and an administrator are members too */
  assert.equal(w.g.guideDraft({ kind: "policy", items: ITEMS, by: BOSS }).ok, true);
});

test("R2 refusals in order, each with its row: the member, the kind, the items, the basis (negative control each)", () => {
  const w = world();
  for (const by of [MACHINE, "", undefined, REV, "member:nobody", "stranger", "class:daemon"])
    row(w.g.guideDraft({ kind: "nope", items: [], by }), "GUIDE_MEMBER_ACT");
  for (const kind of ["court_order", "", null, "Staff_Report", 7]) row(w.g.guideDraft({ kind, items: [], by: ANN }), "GUIDE_KIND_UNKNOWN");
  row(w.g.guideDraft({ kind: "staff_report", items: [], by: ANN }), "GUIDE_ITEMS_REFUSED");
  row(w.g.guideDraft({ kind: "staff_report", items: [item("L", "Ask the model")], by: ANN }), "GUIDE_CARRIES_CONDUCT");
  for (const based_on of ["GUD-2026-aaaaaaaaaaaaaaaa", "sha256:00", 3, "guide"])
    row(w.g.guideDraft({ kind: "staff_report", items: ITEMS, based_on, by: ANN }), "GUIDE_BASED_ON_UNKNOWN");
  assert.equal(w.count("reading_guides"), 0, "nothing was written");
  /* the controls: a held guide, a proposal, null and "" as no basis */
  const base = w.draft();
  const p = w.g.guidePropose({ kind: "staff_report", items: ITEMS, run: "RUN-1", by: MACHINE }).proposal;
  for (const based_on of [base, p, null, ""]) assert.equal(w.g.guideDraft({ kind: "staff_report", items: ITEMS, based_on, by: BOB }).ok, true);
  assert.equal(w.g.guideRead({ guide: w.rows(`SELECT guide_id FROM reading_guides WHERE based_on=?`, p)[0].guide_id }).guide.based_on, p);
});

test("R3 another member's approval makes it the group's; history kept", () => {
  const w = world();
  const id = w.draft();
  const r = w.g.guideReview({ guide: id, verdict: "approve", by: BOB });
  assert.deepEqual({ ...r, at: undefined }, { ok: true, guide: id, verdict: "approve", state: "group", at: undefined });
  const read = w.g.guideRead({ guide: id });
  assert.equal(read.guide.state, "group");
  assert.equal(read.guide.reviewed_by, "bob");
  assert.deepEqual(read.history.map((h) => [h.act, h.state, h.by, h.reason]), [["draft", "usable_by_author", "ann", null], ["approve", "group", "bob", null]]);
  assert.equal(w.g.guideFor({ kind: "staff_report", viewer: CY }).guide.id, id, "the group's now");
});

test("R3 a refusal keeps it its author's, with the reason; it may be reviewed again", () => {
  const w = world();
  const id = w.draft();
  const r = w.g.guideReview({ guide: id, verdict: "refuse", reason: "the second item is too vague", by: BOB });
  assert.equal(r.ok, true);
  assert.equal(r.state, "usable_by_author");
  const read = w.g.guideRead({ guide: id });
  assert.equal(read.guide.state, "usable_by_author");
  assert.deepEqual(read.history.at(-1), { act: "refuse", state: "usable_by_author", by: "bob", reason: "the second item is too vague", at: read.history.at(-1).at });
  assert.equal(w.g.guideFor({ kind: "staff_report", viewer: CY }).guide, null, "not the group's");
  assert.equal(w.g.guideFor({ kind: "staff_report", viewer: ANN }).guide.id, id, "still its author's");
  assert.equal(w.g.guideReview({ guide: id, verdict: "approve", by: CY }).state, "group");
});

test("R3 refusals in order, each with its row (negative control each)", () => {
  const w = world();
  const id = w.draft();
  row(w.g.guideReview({ guide: id, verdict: "approve", by: MACHINE }), "GUIDE_MEMBER_ACT");
  row(w.g.guideReview({ guide: id, verdict: "approve", by: REV }), "GUIDE_MEMBER_ACT");
  row(w.g.guideReview({ guide: "GUD-2026-aaaaaaaaaaaaaaaa", verdict: "approve", by: BOB }), "NO_SUCH_GUIDE");
  row(w.g.guideReview({ guide: "nope", verdict: "approve", by: BOB }), "NO_SUCH_GUIDE");
  row(w.g.guideReview({ guide: id, verdict: "approve", by: ANN }), "GUIDE_REVIEW_BY_AUTHOR");
  for (const verdict of ["accept", "", undefined, "APPROVE"]) row(w.g.guideReview({ guide: id, verdict, by: BOB }), "GUIDE_VERDICT_UNKNOWN");
  for (const reason of [undefined, " ", "x".repeat(REASON_MAX + 1)]) row(w.g.guideReview({ guide: id, verdict: "refuse", reason, by: BOB }), "GUIDE_REASON_MISSING");
  row(w.g.guideReview({ guide: id, verdict: "approve", reason: "x".repeat(REASON_MAX + 1), by: BOB }), "GUIDE_REASON_MISSING");
  assert.equal(w.g.guideRead({ guide: id }).history.length, 1, "nothing was written");
  assert.equal(w.g.guideReview({ guide: id, verdict: "refuse", reason: "x".repeat(REASON_MAX), by: BOB }).ok, true, "control");
  assert.equal(w.g.guideReview({ guide: id, verdict: "approve", by: BOSS }).ok, true, "control: an administrator reviews");
  row(w.g.guideReview({ guide: id, verdict: "approve", by: CY }), "GUIDE_NOT_REVIEWABLE");
  w.g.guideRetire({ guide: id, reason: "replaced", by: BOB });
  row(w.g.guideReview({ guide: id, verdict: "approve", by: CY }), "GUIDE_RETIRED");
});

test("R7 retiring: its author retires a guide of its own; a group's guide, any active member but its author", () => {
  const w = world();
  const own = w.draft();
  row(w.g.guideRetire({ guide: own, reason: "r", by: BOB }), "GUIDE_RETIRE_NOT_APPROVER");
  assert.deepEqual({ ...w.g.guideRetire({ guide: own, reason: "superseded", by: ANN }), at: undefined }, { ok: true, guide: own, state: "retired", at: undefined });
  const grp = w.groupGuide();
  row(w.g.guideRetire({ guide: grp, reason: "r", by: ANN }), "GUIDE_RETIRE_NOT_APPROVER");
  assert.equal(w.g.guideRetire({ guide: grp, reason: "no longer read", by: CY }).ok, true);
  /* retired guides stay readable, with their history; nothing is deleted */
  for (const id of [own, grp]) {
    const r = w.g.guideRead({ guide: id, viewer: ANN });
    assert.equal(r.guide.state, "retired");
    assert.equal(r.history.at(-1).act, "retire");
  }
  assert.equal(w.count("reading_guides"), 2);
  assert.equal(w.g.guidesOf({ state: "retired", viewer: ANN }).guides.length, 2);
  /* and no longer in force */
  assert.equal(w.g.guideFor({ kind: "staff_report", viewer: ANN }).guide, null);
});

test("R7 refusals, each with its row (negative control each)", () => {
  const w = world();
  const id = w.groupGuide();
  row(w.g.guideRetire({ guide: id, reason: "r", by: MACHINE }), "GUIDE_MEMBER_ACT");
  row(w.g.guideRetire({ guide: "GUD-2026-aaaaaaaaaaaaaaaa", reason: "r", by: BOB }), "NO_SUCH_GUIDE");
  row(w.g.guideRetire({ guide: id, reason: "r", by: ANN }), "GUIDE_RETIRE_NOT_APPROVER");
  for (const reason of [undefined, "", "x".repeat(REASON_MAX + 1)]) row(w.g.guideRetire({ guide: id, reason, by: BOB }), "GUIDE_REASON_MISSING");
  assert.equal(w.g.guideRetire({ guide: id, reason: "x".repeat(REASON_MAX), by: BOB }).ok, true, "control");
  row(w.g.guideRetire({ guide: id, reason: "again", by: CY }), "GUIDE_RETIRED");
});

test("R12 a machine's proposal is stored apart, labelled, and is no guide until a member's R2 act names it", () => {
  const w = world();
  const r = w.g.guidePropose({ kind: "meeting_agenda", items: ITEMS, run: "RUN-2026-0001", by: MACHINE });
  assert.equal(r.ok, true);
  assert.ok(isGuideId(r.proposal));
  assert.deepEqual(r.label, { by: MACHINE, state: "machine_proposed", machine_work: true, says: GUIDE_PROPOSAL_STATES.machine_proposed });
  assert.equal(w.count("reading_guides"), 0, "no guide");
  assert.equal(w.g.guideFor({ kind: "meeting_agenda", viewer: ANN }).guide, null);
  assert.equal(w.g.guidesOf({ viewer: ANN }).guides.length, 0);
  row(w.g.guideRead({ guide: r.proposal, viewer: ANN }), "NO_SUCH_GUIDE");
  row(w.g.guideReview({ guide: r.proposal, verdict: "approve", by: BOB }), "NO_SUCH_GUIDE");
  const listed = w.g.guideProposals({ viewer: ANN });
  assert.deepEqual(listed.proposals.map((p) => [p.proposal, p.kind, p.run, p.label.machine_work]), [[r.proposal, "meeting_agenda", "RUN-2026-0001", true]]);
  assert.deepEqual(listed.proposals[0].items, ITEMS);
  /* a member takes it up */
  const d = w.g.guideDraft({ kind: "meeting_agenda", items: ITEMS, based_on: r.proposal, by: ANN });
  assert.equal(d.ok, true);
  assert.equal(w.g.guideRead({ guide: d.guide }).guide.based_on, r.proposal);
  assert.equal(w.g.guideProposals({ viewer: ANN }).proposals.length, 1, "the proposal stays");
});

test("R12 refusals, each with its row: a member proposing, no run, a kind, the items (negative control each)", () => {
  const w = world();
  for (const by of [ANN, BOSS, "", undefined]) row(w.g.guidePropose({ kind: "x", items: [], run: "", by }), "GUIDE_PROPOSAL_NOT_MACHINE");
  for (const run of [undefined, " ", "r".repeat(RUN_MAX + 1)]) row(w.g.guidePropose({ kind: "x", items: [], run, by: MACHINE }), "GUIDE_RUN_MISSING");
  row(w.g.guidePropose({ kind: "x", items: ITEMS, run: "R", by: MACHINE }), "GUIDE_KIND_UNKNOWN");
  row(w.g.guidePropose({ kind: "policy", items: [item("L", "Search the archive")], run: "R", by: MACHINE }), "GUIDE_CARRIES_CONDUCT");
  assert.equal(w.count("reading_guide_proposals"), 0);
  assert.equal(w.g.guidePropose({ kind: "policy", items: ITEMS, run: "r".repeat(RUN_MAX), by: MACHINE }).ok, true, "control");
  /* a machine never drafts, reviews or approves (R2) */
  row(w.g.guideDraft({ kind: "policy", items: ITEMS, by: MACHINE }), "GUIDE_MEMBER_ACT");
  const id = w.draft();
  row(w.g.guideReview({ guide: id, verdict: "approve", by: MACHINE }), "GUIDE_MEMBER_ACT");
});

test("R12 the label's three states, as record-grammar's proposalLabel shapes them", () => {
  assert.deepEqual(Object.keys(GUIDE_PROPOSAL_STATES), ["machine_proposed", "member_proposed", "unstated"]);
  assert.ok(Object.isFrozen(GUIDE_PROPOSAL_STATES));
  assert.equal(guideProposalLabel(MACHINE).state, "machine_proposed");
  assert.deepEqual(guideProposalLabel(ANN), { by: ANN, state: "member_proposed", machine_work: false, says: GUIDE_PROPOSAL_STATES.member_proposed });
  assert.deepEqual(guideProposalLabel(undefined), { by: null, state: "unstated", machine_work: false, says: GUIDE_PROPOSAL_STATES.unstated });
});
