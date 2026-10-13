/* case-inputs R4 (was case-authoring R59; N681, N823; K1833, DEC-147): an edition of the case waiting to be published at a
   set time is signed for `acknowledgeStatement`. The edition waits through publish-schedule's real `scheduleEdition` (its
   R1), is cancelled through its `publishAtCancel` (its R3), and is read through its `waitingEditionOf` (its R7). The
   group's zone is the test profile's (`jurisdictions` R41). Copied from case-authoring's waiting.test.mjs (its R59 arms);
   its R58 arms stay there. Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, WORDS } from "./fixture.mjs";
import { STATEMENT_ACK_CHECKS } from "../../../src/case-inputs/index.mjs";

const AT = { date: "2026-10-01", time: "09:00" };

function setup() {
  const w = world();
  for (const m of ["alice", "bo", "cy"]) w.member(m);
  const A = w.project("A", "alice");
  w.join(A, "bo");
  assert.equal(w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "admin").ok, true);
  return { w, A };
}
/* ratification's op=publishat, played: the edition signed and set to wait (publish-schedule R1) */
const wait = (w, c, e) => {
  const r = w.record.transact(() => w.publishSchedule.scheduleEdition({ case: c, edition: e, docSha: w.docOf(c, e).doc_sha,
    signature: `sig-${c}-${e}`, signer: "alice", deliveredBy: V("alice"), at: AT, checked: { sources: [], ties: [], holds: [] },
    by: V("alice") }));
  assert.equal(r.ok, true, JSON.stringify(r));
  return r;
};
const cancel = (w, c, e) => assert.equal(w.publishSchedule.publishAtCancel({ case: c, edition: e, by: V("alice") }).ok, true);
const carries = (r, key) => assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
  [false, key, key, STATEMENT_ACK_CHECKS[key].check, STATEMENT_ACK_CHECKS[key].translation], JSON.stringify(r).slice(0, 300));

test("R4: on the case door a document publish-schedule holds waiting is signed: STATEMENT_ACK_ALREADY_SIGNED (C-82.3), in R1's order (no subject first; an outsider the dead answer), nothing written or re-authored; cancelled, it is again an unsigned preparation, acknowledged and re-authored", () => {
  const { w, A } = setup();
  const one = w.prepare(A, "alice");
  wait(w, one.caseId, 1);
  assert.equal(w.publishSchedule.waitingEditionOf(one.caseId).edition, 1);
  const sha = w.docOf(one.caseId, 1).doc_sha;
  const before = w.snapshot();
  const r = w.ci.acknowledgeStatement({ viewer: V("bo"), caseId: one.caseId, edition: 1, reason: WORDS });
  carries(r, "STATEMENT_ACK_ALREADY_SIGNED");
  assert.deepEqual([r.caseId, r.edition], [one.caseId, 1]);
  assert.match(r.detail, /waiting to be published/);
  /* R1's order: C-82.2 before it; one without standing answers the dead answer before it */
  carries(w.ci.acknowledgeStatement({ viewer: V("bo"), caseId: one.caseId, reason: WORDS }), "STATEMENT_ACK_NO_SUBJECT");
  assert.equal(w.ci.acknowledgeStatement({ viewer: V("zed"), caseId: one.caseId, edition: 1, reason: WORDS }).reason,
               "NO_REVIEW_COPY");
  /* the publisher's own, and one with no words, are still refused as signed: C-82.3 is asked before C-82.6 and C-82.8 */
  carries(w.ci.acknowledgeStatement({ viewer: V("alice"), caseId: one.caseId, edition: 1 }), "STATEMENT_ACK_ALREADY_SIGNED");
  assert.deepEqual(w.snapshot(), before, "nothing written, nothing re-authored");
  assert.equal(w.docOf(one.caseId, 1).doc_sha, sha);
  /* cancelled: again a preparation (publish-schedule R3), acknowledged and its list re-authored, so its hash moves */
  cancel(w, one.caseId, 1);
  assert.equal(w.publishSchedule.waitingEditionOf(one.caseId), null);
  const ok = w.ci.acknowledgeStatement({ viewer: V("bo"), caseId: one.caseId, edition: 1, reason: WORDS });
  assert.equal(ok.ok, true, JSON.stringify(ok));
  assert.equal(ok.case_documents[0].reauthored, true);
  assert.notEqual(w.docOf(one.caseId, 1).doc_sha, sha);
});

test("R4: a draft named for an edition that waits reaches no unsigned document: the reading is recorded at the draft, the waiting document is not re-authored, and its link states the edition signed; cancelled, the same reading's link states it unsigned", () => {
  const { w, A } = setup();
  w.draft("DRAFT-2026-0001", A, { statement: "It does not cover the award's later amendments." }, { statementBy: "alice" });
  const one = w.prepare(A, "alice", { draft: "DRAFT-2026-0001" });
  wait(w, one.caseId, 1);
  const sha = w.docOf(one.caseId, 1).doc_sha;
  const r = w.ci.acknowledgeStatement({ viewer: V("bo"), draft: "DRAFT-2026-0001", reason: WORDS });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual(r.case_documents, [], "no document re-authored");
  assert.deepEqual([r.draft_link.case_id, r.draft_link.edition, r.draft_link.signed], [one.caseId, 1, true]);
  assert.match(r.listed, /already SIGNED/);
  assert.equal(w.docOf(one.caseId, 1).doc_sha, sha);
  /* control: cancelled, the edition is a preparation again, and the link says so */
  cancel(w, one.caseId, 1);
  const again = w.ci.acknowledgeStatement({ viewer: V("bo"), draft: "DRAFT-2026-0001", reason: WORDS });
  assert.deepEqual([again.existed, again.draft_link.signed], [true, false]);
  assert.match(again.listed, /now lists this reading/);
});

test("R4: only the waiting edition is signed: another edition of the same case, prepared and unsigned, is acknowledged as one", () => {
  const { w, A } = setup();
  const one = w.prepare(A, "alice");
  w.ratify(one, A);
  w.prepare(A, "alice", { caseId: one.caseId, edition: 2, statement: "It does not cover the 2027 award." });
  wait(w, one.caseId, 2);
  carries(w.ci.acknowledgeStatement({ viewer: V("bo"), caseId: one.caseId, edition: 2, reason: WORDS }), "STATEMENT_ACK_ALREADY_SIGNED");
  /* edition 1 is ratified, so signed for its own reason; a third edition prepared beside it is not waiting */
  carries(w.ci.acknowledgeStatement({ viewer: V("bo"), caseId: one.caseId, edition: 1, reason: WORDS }), "STATEMENT_ACK_ALREADY_SIGNED");
  w.prepare(A, "alice", { caseId: one.caseId, edition: 3, statement: "It does not cover the 2028 award." });
  const three = w.ci.acknowledgeStatement({ viewer: V("bo"), caseId: one.caseId, edition: 3, reason: WORDS });
  assert.deepEqual([three.ok, three.case_documents[0].reauthored], [true, true]);
});
