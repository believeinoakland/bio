/* case-authoring: an edition of the case waiting to be published at a set time (R58, R59; N681, K1833, DEC-147). The
   edition waits through publish-schedule's real `scheduleEdition` (its R1), is cancelled through its `publishAtCancel`
   (its R3), and is read by `publishCase` and `acknowledgeStatement` through its `waitingEditionOf` (its R7; N823, K2438). The group's
   zone is the test profile's (`jurisdictions` R41). Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, WHAT_CHANGED } from "./fixture.mjs";
import { CASE_DERIVATION_CHECKS, STATEMENT_ACK_CHECKS, caseAuthoringOps } from "../../../src/case-authoring/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b";
const Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q", Q3 = "INQ-2026-0003-q";
const AT = { date: "2026-10-01", time: "09:00" };
const WORDS = "I read what this case leaves out and agree it is stated.";
/* an edition above 1 states its completeness afresh (R10) and what changed (R38) */
const FRESH = { statement: "It does not cover the later amendments to the award.",
                subjectJustification: "The award is public, and the question is whether its terms were kept.",
                biasAcknowledgement: "We still read the minutes as the account of the meeting, as of this edition.",
                excluded: [{ description: "the amendments, which this edition names", reason: "not yet obtained" }],
                whatChanged: WHAT_CHANGED };

function setup() {
  const w = world();
  for (const m of ["alice", "bo", "cy"]) w.member(m);
  w.doc(DOC); w.doc(DOC2);
  w.finding(Q, [{ target: DOC }]);
  w.finding(Q2, [{ target: DOC2 }]);
  w.finding(Q3, [{ target: DOC2 }]);
  const A = w.project("A", "alice", [Q, Q2]);
  w.join(A, "bo");
  assert.equal(w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "admin").ok, true);
  return { w, A };
}
const docOf = (w, c, e) => w.row(`SELECT doc_sha, text, sig_armored FROM case_documents WHERE case_id=? AND edition=?`, c, e);
/* ratification's op=publishat, played: the edition signed and set to wait (publish-schedule R1) */
const wait = (w, c, e) => {
  const r = w.record.transact(() => w.publishSchedule.scheduleEdition({ case: c, edition: e, docSha: docOf(w, c, e).doc_sha,
    signature: `sig-${c}-${e}`, signer: "alice", deliveredBy: V("alice"), at: AT, checked: { sources: [], ties: [], holds: [] },
    by: V("alice") }));
  assert.equal(r.ok, true, JSON.stringify(r));
  return r;
};
const cancel = (w, c, e) => assert.equal(w.publishSchedule.publishAtCancel({ case: c, edition: e, by: V("alice") }).ok, true);
const carries = (r, key, family = CASE_DERIVATION_CHECKS) => assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
  [false, key, key, family[key].check, family[key].translation]);

test("R58: publishCase refuses CASE_EDITION_WAITING (C-44.6) while an edition of the case R7 resolves waits, naming the waiting edition and its at (date, time and zone), whether the case is derived from the members' preparation or named; nothing is written and no id is drawn; once the waiting one is cancelled the act goes on and replaces the preparation (R8, K2540)", () => {
  const { w, A } = setup();
  /* a first edition, prepared and waiting: the case is the one the members' own preparation names (R7's third route) */
  const one = w.publish(A, "alice", [Q]);
  assert.equal(one.ok, true, JSON.stringify(one));
  const set = wait(w, one.caseId, 1);
  const before = w.snapshot();
  const r = w.publish(A, "alice", [Q]);
  carries(r, "CASE_EDITION_WAITING");
  assert.equal(r.check, "C-44.6");
  assert.deepEqual([r.caseId, r.edition, r.at, r.publish_at], [one.caseId, 1, set.at, set.publish_at]);
  assert.deepEqual(r.at, { date: AT.date, time: AT.time, zone: "America/Halifax" }, "the date and time set, with its zone");
  assert.match(r.detail, /2026-10-01 at 09:00 \(America\/Halifax\)/);
  assert.deepEqual(w.snapshot(), before, "nothing written, no id drawn");
  /* R7's own refusal comes first: a named case not yet published is NO_SUCH_CASE, its waiting edition never named */
  const named = w.publish(A, "alice", [Q], { caseId: one.caseId });
  assert.equal(named.reason, "NO_SUCH_CASE");
  /* a minted case (newCase) has no waiting edition */
  const fresh = w.publish(A, "alice", [Q2], { newCase: true });
  assert.equal(fresh.ok, true, "a case of its own, minted, waits on nothing");
  assert.notEqual(fresh.caseId, one.caseId);
  /* cancelled: its document is again an unsigned preparation (publish-schedule R3), so nothing waits and the act goes on:
     a preparation of this same case edition is replaced by the new one (R8, K2540) */
  cancel(w, one.caseId, 1);
  const again = w.publish(A, "alice", [Q]);
  assert.deepEqual([again.ok, again.caseId, again.edition], [true, one.caseId, 1], JSON.stringify(again).slice(0, 300));
  /* negative control: R8 still refuses a preparation of another case over the same bytes */
  const other = w.publish(A, "alice", [Q], { newCase: true });
  assert.deepEqual([other.reason, other.recorded_by], ["ALREADY_A_CASE_MEMBER",
    [{ case_id: one.caseId, edition: 1, state: "prepared" }]]);
});

test("R58: a further edition of a published case is refused while its next edition waits, named by caseId or derived from the members' published case, before R8 and before anything is written; published, the edition after it is prepared", () => {
  const { w, A } = setup();
  const one = w.publish(A, "alice", [Q]);
  w.ratify(one);
  /* edition 2, over another finding, prepared and set to wait */
  const two = w.publish(A, "alice", [Q2], { ...FRESH, caseId: one.caseId });
  assert.deepEqual([two.ok, two.edition], [true, 2], JSON.stringify(two));
  const set = wait(w, one.caseId, 2);
  const before = w.snapshot();
  /* named, and derived from the case the first edition's member serves */
  for (const [targets, over] of [[[Q2], { caseId: one.caseId }], [[Q], {}]]) {
    const r = w.publish(A, "alice", targets, { ...FRESH, ...over });
    carries(r, "CASE_EDITION_WAITING");
    assert.deepEqual([r.caseId, r.edition, r.at, r.publish_at], [one.caseId, 2, set.at, set.publish_at]);
  }
  assert.deepEqual(w.snapshot(), before, "nothing written, no id drawn");
  /* the waiting edition's document is untouched by the refused act */
  assert.equal(docOf(w, one.caseId, 2).doc_sha, two.caseDocument.doc_sha);
  /* stopped or published, nothing waits: publish-schedule's R7 answers null and the act goes on to R8's own judgment */
  w.st.sql.exec(`UPDATE scheduled_editions SET state='published' WHERE case_id=? AND edition=2`, one.caseId);
  w.ratify({ caseId: one.caseId, edition: 2 });
  const three = w.publish(A, "alice", [Q3], { ...FRESH, caseId: one.caseId, statement: "It does not cover the 2027 award.",
    subjectJustification: "The award is public, and its terms are what is asked about, as of edition 3.",
    biasAcknowledgement: "We read the minutes as the account of the meeting, as of edition 3.",
    excluded: [{ description: "the 2027 award", reason: "not yet made" }] });
  assert.deepEqual([three.ok, three.edition], [true, 3], JSON.stringify(three).slice(0, 300));
});

test("R58: a case another project prepared is not answered with its waiting edition: R7's CASE_BELONGS_TO_ANOTHER_PROJECT refuses it, naming no edition and no time", () => {
  const { w, A } = setup();
  const one = w.publish(A, "alice", [Q]);
  w.ratify(one);
  const two = w.publish(A, "alice", [Q2], { ...FRESH, caseId: one.caseId });
  assert.equal(two.ok, true, JSON.stringify(two));
  wait(w, one.caseId, 2);
  const B = w.project("B", "cy", [Q3]);
  const r = w.publish(B, "cy", [Q3], { caseId: one.caseId });
  assert.equal(r.reason, "CASE_BELONGS_TO_ANOTHER_PROJECT");
  assert.equal(JSON.stringify(r).includes(AT.date), false, "the waiting time is never named to another project");
});

test("R58, R34: publishPreflight answers CASE_EDITION_WAITING first, exactly as op=publish would, and writes nothing; op=publish answers it through its op", async () => {
  const { w, A } = setup();
  const one = w.publish(A, "alice", [Q]);
  wait(w, one.caseId, 1);
  const args = { scope: "Whether the contract was awarded as the minutes say.",
                 statement: "It does not cover the award's later amendments.", subjectPosition: "not_sought",
                 subjectJustification: "The award is a public record and the question is whether it was followed.",
                 biasAcknowledgement: "We read the minutes as the authoritative account of the meeting.", excluded: [],
                 tieAttested: true, project: A, targets: [Q], roles: { [Q]: "load_bearing" }, viewer: V("alice"), author: "alice" };
  /* the op first: its gather creates the workbooks module's tables on first use, empty (not this act's write) */
  const url = new URL(`http://do/x?viewer=${encodeURIComponent(V("alice"))}&author=alice&project=${A}`);
  const viaOp = await caseAuthoringOps(w.ca, url, { ...args, viewer: undefined, author: undefined, project: undefined }).publishcase();
  carries(viaOp, "CASE_EDITION_WAITING");
  const before = w.snapshot();
  const act = w.ca.publishCase(args);
  const pre = w.ca.publishPreflight(args);
  assert.deepEqual(pre.first, act);
  carries(pre.first, "CASE_EDITION_WAITING");
  assert.equal(pre.ready, false);
  assert.deepEqual(w.snapshot(), before);
});

test("R59: on the case door a document publish-schedule holds waiting is signed: STATEMENT_ACK_ALREADY_SIGNED (C-82.3), in R19's order (no subject first; an outsider the dead answer), nothing written or re-authored; cancelled, it is acknowledged as an unsigned preparation and re-authored", () => {
  const { w, A } = setup();
  const one = w.publish(A, "alice", [Q]);
  wait(w, one.caseId, 1);
  const sha = docOf(w, one.caseId, 1).doc_sha;
  const before = w.snapshot();
  const r = w.ca.acknowledgeStatement({ viewer: V("bo"), caseId: one.caseId, edition: 1, reason: WORDS });
  carries(r, "STATEMENT_ACK_ALREADY_SIGNED", STATEMENT_ACK_CHECKS);
  assert.deepEqual([r.caseId, r.edition], [one.caseId, 1]);
  assert.match(r.detail, /waiting to be published/);
  /* R19's order: C-82.2 before it; one without standing answers the dead answer before it */
  carries(w.ca.acknowledgeStatement({ viewer: V("bo"), caseId: one.caseId, reason: WORDS }), "STATEMENT_ACK_NO_SUBJECT",
          STATEMENT_ACK_CHECKS);
  assert.equal(w.ca.acknowledgeStatement({ viewer: V("zed"), caseId: one.caseId, edition: 1, reason: WORDS }).reason,
               "NO_REVIEW_COPY");
  assert.deepEqual(w.snapshot(), before, "nothing written, nothing re-authored");
  assert.equal(docOf(w, one.caseId, 1).doc_sha, sha);
  /* cancelled: again a preparation (publish-schedule R3), acknowledged and its list re-authored, so its hash moves */
  cancel(w, one.caseId, 1);
  const ok = w.ca.acknowledgeStatement({ viewer: V("bo"), caseId: one.caseId, edition: 1, reason: WORDS });
  assert.equal(ok.ok, true, JSON.stringify(ok));
  assert.equal(ok.case_documents[0].reauthored, true);
  assert.notEqual(docOf(w, one.caseId, 1).doc_sha, sha);
});

test("R59: a draft named for an edition that waits reaches no unsigned document: the reading is recorded at the draft, the waiting document is not re-authored, and its link states the edition signed", () => {
  const { w, A } = setup();
  w.draft("DRAFT-2026-0001", A, { statement: "It does not cover the award's later amendments." }, { statementBy: "alice" });
  const one = w.publish(A, "alice", [Q], { draft: "DRAFT-2026-0001" });
  assert.equal(one.ok, true, JSON.stringify(one));
  wait(w, one.caseId, 1);
  const sha = docOf(w, one.caseId, 1).doc_sha;
  const r = w.ca.acknowledgeStatement({ viewer: V("bo"), draft: "DRAFT-2026-0001", reason: WORDS });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual(r.case_documents, [], "no document re-authored");
  assert.equal(r.draft_link.signed, true);
  assert.match(r.listed, /already SIGNED/);
  assert.equal(docOf(w, one.caseId, 1).doc_sha, sha);
});
