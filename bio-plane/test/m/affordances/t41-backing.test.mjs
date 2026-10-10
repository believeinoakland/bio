/* affordances: R19's backing for every op op-grades' `t41.mjs` grades `reasoned` (its R30; K2560, K2569, K2570), each
   driven at its owning module's own interface over that module's own fixture, as t36-backing.test.mjs drives T36's: called
   well-formed but without its authored reason, it is refused with its owner's code, which is in JUSTIFICATION_REFUSALS;
   called with it, it is accepted. The last test holds the list driven here to the ops `t41.mjs` grades `reasoned`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { JUSTIFICATION_REFUSALS, RUNGS } from "../../../src/op-grades/index.mjs";
import { T41_RUNGS } from "../../../src/op-grades/t41.mjs";

/* Each op driven below, by its owner; the last test holds this list to t41.mjs. */
const DRIVEN = ["projectaikeepaway", "milestoneremove", "milestoneitemremove", "projectclosewithgaps", "hypothesissetaside",
  "guidereview", "guideretire", "stepaccept"];

/* The backing of one op: graded `reasoned`; without its reason refused with `code`, in the family; with it accepted. */
function backed(op, code, refused, accepted) {
  assert.ok(DRIVEN.includes(op), op);
  assert.equal(RUNGS[op], "reasoned", op);
  const got = refused?.code ?? refused?.reason;
  assert.notEqual(refused?.ok, true, `${op}: accepted without its reason: ${JSON.stringify(refused).slice(0, 300)}`);
  assert.equal(got, code, `${op}: ${JSON.stringify(refused).slice(0, 300)}`);
  assert.ok(JUSTIFICATION_REFUSALS.includes(got), `${op}: ${got} is not in JUSTIFICATION_REFUSALS`);
  assert.equal(accepted?.ok, true, `${op}: refused with its reason: ${JSON.stringify(accepted).slice(0, 300)}`);
}

/* ---- credentials (R57) ---- */
import * as crFix from "../credentials/fixture.mjs";

test("R19: credentials' projectaikeepaway, graded `reasoned` (op-grades R30), is refused when turned on without its "
   + "reason with AI_KEEP_AWAY_NO_REASON (credentials R57, R51's rule), in JUSTIFICATION_REFUSALS, and accepted with it", async () => {
  const w = await crFix.world().group("ann", "bob");
  w.project("P", "ann");
  const set = (x) => w.c.projectAiKeepAwaySet({ project: "P", on: true, by: "ann", ...x });
  backed("projectaikeepaway", "AI_KEEP_AWAY_NO_REASON", set({ reason: "  " }), set({ reason: "The case's papers are sealed." }));
});

/* ---- investigation (R1, R18) ---- */
import * as invFix from "../investigation/fixture.mjs";

test("R19: investigation's milestoneremove and milestoneitemremove, graded `reasoned` (op-grades R30), are refused "
   + "without their reason with INVESTIGATION_NO_REASON (investigation R1), in JUSTIFICATION_REFUSALS, and accepted with it", () => {
  const w = invFix.world();
  const { ANN, P1, Q1 } = invFix;
  const { milestone } = w.inv.milestoneSet({ project: P1, name: "Council vote", date: "2026-11-14", waitsOn: [Q1], by: ANN });
  const item = (x) => w.inv.milestoneItemRemove({ milestone, item: Q1, by: ANN, ...x });
  backed("milestoneitemremove", "INVESTIGATION_NO_REASON", item({ reason: "" }), item({ reason: "We set this question aside." }));
  const remove = (x) => w.inv.milestoneRemove({ milestone, by: ANN, ...x });
  backed("milestoneremove", "INVESTIGATION_NO_REASON", remove({ reason: " " }), remove({ reason: "The meeting moved." }));
});

test("R19: investigation's projectclosewithgaps, graded `reasoned` (op-grades R30), is refused without its enumerated "
   + "reason with CLOSE_BAD_REASON (investigation R18), in JUSTIFICATION_REFUSALS, and accepted with one", () => {
  const { ANN, P1, Q1, projectMd } = invFix;
  const w = invFix.world();
  w.end(w.step());
  w.progress.set(P1, { ok: true, project: P1, objective: "Know whether the award was proper", computable: true,
                       condition: { progression: "PRG-1", required: { grade: "B" }, satisfied: { share: 100 } }, satisfied: false,
                       matched: 2, meeting: 1, short: [], undetermined: [] });
  /* a project the record holds, so its close is a revision through promotion (investigation's own quiet.test.mjs) */
  const made = w.promotion.promote({ base: null, snapKey: "k-close", author: ANN, meta: { object_type: "project" },
    files: [{ path: "bundle.md", text: projectMd(null, "The Closing Project").split("\n").filter((l) => !l.startsWith("id:")).join("\n") }] });
  assert.equal(made.ok, true, JSON.stringify(made).slice(0, 300));
  const P = made.bundleId;
  w.participant(P, "ann", { owner: true });
  w.drawn.set(P, [{ inquiry: Q1 }]);
  w.gapsOf.set(P, []);
  const close = (x) => w.inv.projectCloseWithGaps({ project: P, by: ANN, ...x });
  backed("projectclosewithgaps", "CLOSE_BAD_REASON", close({}), close({ reason: "abandoned", note: "Nothing is left to try." }));
});

/* ---- hypotheses (R18) ---- */
import * as hyFix from "../hypotheses/fixture.mjs";

test("R19: hypotheses' hypothesissetaside, graded `reasoned` (op-grades R30), is refused without the member's reason "
   + "with PROPOSAL_NO_REASON (hypotheses R18), in JUSTIFICATION_REFUSALS, and accepted with it", () => {
  const w = hyFix.world();
  w.bundle(hyFix.INQ);
  const p = w.h.hypothesisPropose({ inquiry: hyFix.INQ, kind: "relation", statement: "E1 and E2 share an officer.",
    about: { from: hyFix.E1, to: hyFix.E2 }, how: "Two filings name the same treasurer.", false_alarm_rate: 0.12, run: "RUN-7" });
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  const aside = (x) => w.h.hypothesisSetAside({ proposal: p.proposal, by: hyFix.ANN, ...x });
  backed("hypothesissetaside", "PROPOSAL_NO_REASON", aside({ reason: "" }), aside({ reason: "The treasurer is a different person." }));
});

/* ---- reading-guides (R3, R7) ---- */
import * as rgFix from "../reading-guides/fixture.mjs";

test("R19: reading-guides' guidereview and guideretire, graded `reasoned` (op-grades R30), are refused without their "
   + "reason with GUIDE_REASON_MISSING (reading-guides R3, R7), in JUSTIFICATION_REFUSALS, and accepted with it", () => {
  const w = rgFix.world();
  const id = w.draft();
  const review = (x) => w.g.guideReview({ guide: id, verdict: "refuse", by: rgFix.BOB, ...x });
  backed("guidereview", "GUIDE_REASON_MISSING", review({}), review({ reason: "The second item is too vague." }));
  const grp = w.groupGuide();
  const retire = (x) => w.g.guideRetire({ guide: grp, by: rgFix.BOB, ...x });
  backed("guideretire", "GUIDE_REASON_MISSING", retire({ reason: "" }), retire({ reason: "No longer read." }));
});

/* ---- steps (R24) ---- */
import * as stepsFix from "../steps/fixture.mjs";

test("R19: steps' stepaccept, graded `reasoned` (op-grades R30), is refused when a proposal is set aside for the member's "
   + "own step without her reason with STEP_BAD_TEXT (steps R24, triage's shape), in JUSTIFICATION_REFUSALS, and accepted "
   + "with it", () => {
  const w = stepsFix.world();
  w.runs();
  const proposal = w.s.stepPropose({ place: { questions: [stepsFix.Q] }, work: "Call the vendor", why: "y", run: "RUN-1",
                                     by: stepsFix.AI }).proposal;
  const own = (x) => w.s.stepAccept({ proposal, form: "own_instead", work: "Visit the office", by: stepsFix.ANN, ...x });
  backed("stepaccept", "STEP_BAD_TEXT", own({}), own({ reason: "A call will not get the file." }));
});

/* ---- the list ---- */
test("R19: every op op-grades' t41.mjs grades `reasoned` is driven here", () => {
  const graded = Object.keys(T41_RUNGS).filter((op) => T41_RUNGS[op] === "reasoned").sort();
  assert.deepEqual([...new Set(DRIVEN)].sort(), graded);
});
