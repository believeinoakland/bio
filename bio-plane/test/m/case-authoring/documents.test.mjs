/* case-authoring (T39; N806; K2333, K2374): a member document a case rests on, over the real case-disclosures (its R6,
   R7, R22) with case-carriage's `documentCopy` (its R16) answered as each test sets it (`w.copies`). R55: `publishCase`
   answers the first refusal of the first step that refuses, so case-disclosures R6's DOCUMENT_COPY_UNDETERMINED,
   DOCUMENT_COPY_PENDING and DOCUMENT_NOT_CLEANABLE reach `op=publish`'s answer exactly as case-disclosures answers them,
   and the act writes nothing (R18), not even the copy's queueing that R16's read makes inside the act's transaction.
   R34's pre-flight answers each `first`. R14: a document carried as its cleaned copy is stated so in `materials:`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { CASE_DISCLOSURE_CHECKS } from "../../../src/case-authoring/index.mjs";
import { materialsOf } from "../../../src/case-grammar/index.mjs";
import { COPY_CLEANED_LABEL } from "../../../src/case-carriage/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b";
const Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";
const COPY = "c".repeat(64);
const ANSWERS = {
  public: { state: "public", copy: null, refused: null },
  clean: { state: "clean", copy: null, refused: null },
  copy: { state: "copy", copy: COPY, refused: null },
  refused: { state: "refused", copy: null, refused: { code: "PDF_ENCRYPTED", detail: "the file is encrypted" } },
  undetermined: { state: "undetermined", copy: null, refused: null },
};
const ratified = (real) => new Proxy(real, { get: (t, p) => (p === "caseRatifyPreflight"
  ? () => ({ ok: true, ready: true, refusals: [] }) : typeof t[p] === "function" ? t[p].bind(t) : t[p]) });

/* Q rests on DOC, Q2 on DOC2. `copies` maps a document to its R16 state: "pending" is answered as R16 answers a member
   document neither queued nor derived, queueing it (a row of the test's `copy_queue`, standing for case-carriage's
   queue) in the caller's transaction; "unread" is a read that throws; any other key of ANSWERS is that answer. */
function setup(copies = {}) {
  const w = world({ ratification: ratified });
  w.member("alice");
  w.st.db.exec(`CREATE TABLE copy_queue (capture_sha TEXT PRIMARY KEY)`);
  const shas = { [DOC]: w.doc(DOC), [DOC2]: w.doc(DOC2) };
  for (const [ref, state] of Object.entries(copies))
    w.copies.set(shas[ref], state === "pending"
      ? (sha) => { w.st.sql.exec(`INSERT OR IGNORE INTO copy_queue (capture_sha) VALUES (?)`, sha);
                   return { state: "pending", copy: null, refused: null }; }
      : state === "unread" ? () => { throw new Error("the copies table could not be read"); }
      : ANSWERS[state]);
  w.finding(Q, [{ target: DOC }]);
  w.finding(Q2, [{ target: DOC2 }]);
  const P = w.project("Team", "alice", [Q, Q2]);
  return { w, P, shas };
}
const args = (P, targets, roles) => ({ project: P, targets, viewer: V("alice"), author: "alice", scope: "s",
  statement: "It does not cover the amendments.", subjectPosition: "not_sought", subjectJustification: "A public record.",
  biasAcknowledgement: "We read the minutes as the account.", excluded: [], tieAttested: true,
  roles: roles || Object.fromEntries(targets.map((t) => [t, "load_bearing"])) });
const SUPPORTING = { [Q]: "load_bearing", [Q2]: "supporting" };
const rowsOf = (w, r) => Object.fromEntries(materialsOf(w.fm(w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`,
  r.caseId, r.edition).text)).materials.map((m) => [m.ref, m]));
/* the refusal as case-disclosures R22's table holds it: its code, its check and its translation */
function refused(r, code) {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 400));
  assert.deepEqual([r.reason, r.code, r.check, r.translation],
    [code, code, CASE_DISCLOSURE_CHECKS[code].check, CASE_DISCLOSURE_CHECKS[code].translation]);
}
test("R55, R18: a load-bearing member document whose publication copy is still being made — case-disclosures R6's DOCUMENT_COPY_PENDING, naming the document and each load-bearing member — is op=publish's answer exactly and the pre-flight's first (R34); the act writes nothing, R16's queueing taken back with it; a supporting member's only is listed included: false and publishes", () => {
  const { w, P, shas } = setup({ [DOC]: "pending" });
  const before = w.snapshot();
  const pub = w.ca.publishCase(args(P, [Q]));
  refused(pub, "DOCUMENT_COPY_PENDING");
  assert.deepEqual([pub.pending, pub.document], [[{ target: Q, materials: [{ ref: DOC, sha: shas[DOC] }] }], DOC]);
  assert.deepEqual(w.snapshot(), before, "nothing written: the queueing made inside the act is taken back with it");
  const pre = w.ca.publishPreflight(args(P, [Q]));
  assert.deepEqual([pre.first, pre.ready, pre.blockers], [pub, false, []]);
  assert.deepEqual(w.snapshot(), before);
  /* negative control: only a supporting member reaches it, so it is listed, not carried, and never refused */
  const sup = setup({ [DOC2]: "pending" });
  const ok = sup.w.ca.publishCase(args(sup.P, [Q, Q2], SUPPORTING));
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 400));
  const rows = rowsOf(sup.w, ok);
  assert.deepEqual([rows[DOC2].sha, rows[DOC2].included, rows[DOC2].obscured], [sup.shas[DOC2], false, null]);
  assert.deepEqual([rows[DOC].included, rows[DOC].obscured], [true, null]);
  assert.equal(sup.w.count("copy_queue"), 1, "an act that commits keeps R16's queueing");
});

test("R55, R18: a load-bearing member document doc-clean refused — case-disclosures R6's DOCUMENT_NOT_CLEANABLE, naming the document, each load-bearing member and doc-clean's code — is op=publish's answer exactly and the pre-flight's first (R34), writing nothing; a supporting member's only is listed included: false and publishes", () => {
  const { w, P, shas } = setup({ [DOC]: "refused" });
  const before = w.snapshot();
  const pub = w.ca.publishCase(args(P, [Q]));
  refused(pub, "DOCUMENT_NOT_CLEANABLE");
  assert.deepEqual([pub.not_cleanable, pub.document],
    [[{ target: Q, materials: [{ ref: DOC, sha: shas[DOC], refused: "PDF_ENCRYPTED" }] }], DOC]);
  assert.deepEqual(w.snapshot(), before, "nothing written");
  const pre = w.ca.publishPreflight(args(P, [Q]));
  assert.deepEqual([pre.first, pre.ready, pre.blockers], [pub, false, []]);
  assert.deepEqual(w.snapshot(), before);
  /* negative control: supporting only */
  const sup = setup({ [DOC2]: "refused" });
  const ok = sup.w.ca.publishCase(args(sup.P, [Q, Q2], SUPPORTING));
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 400));
  const rows = rowsOf(sup.w, ok);
  assert.deepEqual([rows[DOC2].included, rows[DOC2].obscured], [false, null]);
});

test("R55, R18: a member document whose copy's state cannot be read — R16's undetermined, or a read that throws — is case-disclosures R6's DOCUMENT_COPY_UNDETERMINED, naming the document and the members reaching it, whichever chain reaches it (fail closed): op=publish's answer exactly and the pre-flight's first (R34), writing nothing", () => {
  for (const state of ["undetermined", "unread"]) {
    for (const [roles, target] of [[undefined, Q], [SUPPORTING, Q2]]) {
      const ref = target === Q ? DOC : DOC2;
      const { w, P, shas } = setup({ [ref]: state });
      const before = w.snapshot();
      const pub = w.ca.publishCase(args(P, [Q, Q2], roles));
      refused(pub, "DOCUMENT_COPY_UNDETERMINED");
      assert.deepEqual(pub.undetermined.map((u) => [u.ref, u.sha, u.members]), [[ref, shas[ref], [target]]], `${state}, ${target}`);
      assert.equal(typeof pub.undetermined[0].why, "string");
      assert.equal(pub.document, ref);
      assert.deepEqual(w.snapshot(), before, "nothing written");
      const pre = w.ca.publishPreflight(args(P, [Q, Q2], roles));
      assert.deepEqual([pre.first, pre.ready, pre.blockers], [pub, false, []]);
    }
  }
});

test("R55: case-disclosures R6's document refusals reach op=publish in R6's order — undetermined, then pending, then not cleanable — the first answered and the rest among the pre-flight's blockers (R34); an earlier step's refusal (the bar, R6) comes first with every document refusal among blockers", () => {
  const w = world({ ratification: ratified });
  w.member("alice");
  const D3 = "INFO-2026-0003-c", Q3 = "INQ-2026-0003-q";
  const s1 = w.doc(DOC), s2 = w.doc(DOC2), s3 = w.doc(D3);
  w.copies.set(s1, ANSWERS.refused);
  w.copies.set(s2, { state: "pending", copy: null, refused: null });
  w.copies.set(s3, ANSWERS.undetermined);
  w.finding(Q, [{ target: DOC }]); w.finding(Q2, [{ target: DOC2 }]); w.finding(Q3, [{ target: D3 }]);
  const P = w.project("Team", "alice", [Q, Q2, Q3]);
  const pub = w.ca.publishCase(args(P, [Q, Q2, Q3]));
  refused(pub, "DOCUMENT_COPY_UNDETERMINED");
  const pre = w.ca.publishPreflight(args(P, [Q, Q2, Q3]));
  assert.deepEqual(pre.first, pub);
  assert.deepEqual(pre.blockers.map((b) => b.reason), ["DOCUMENT_COPY_PENDING", "DOCUMENT_NOT_CLEANABLE"]);
  /* the bar refuses first: every document refusal is a blocker, in R6's order */
  const low = world({ ratification: ratified });
  low.member("alice");
  low.copies.set(low.doc(DOC), { state: "pending", copy: null, refused: null });
  low.finding(Q, [{ target: DOC }]);
  const LP = low.project("Team", "alice", [Q], { extra: ["required_strength:", "  capture: A"] });
  const early = low.ca.publishPreflight(args(LP, [Q]));
  assert.equal(early.first.reason, "BELOW_PROJECT_STRENGTH");
  assert.deepEqual(early.blockers.map((b) => b.reason), ["DOCUMENT_COPY_PENDING"]);
  assert.equal(low.ca.publishCase(args(LP, [Q])).reason, "BELOW_PROJECT_STRENGTH");
});

test("R14: a member document carried as its cleaned copy is stated so — its materials: row included: false with obscured: {copy, label}, the copy's SHA-256 and case-carriage's COPY_CLEANED_LABEL, its sha the original's — and the document stores it unsigned; a document fetched by this copy (public) or carrying no details (clean) travels whole with obscured null", () => {
  for (const other of ["public", "clean"]) {
    const { w, P, shas } = setup({ [DOC]: "copy", [DOC2]: other });
    const r = w.ca.publishCase(args(P, [Q, Q2]));
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
    const rows = rowsOf(w, r);
    assert.deepEqual([rows[DOC].sha, rows[DOC].included, rows[DOC].obscured],
      [shas[DOC], false, { copy: COPY, label: COPY_CLEANED_LABEL }]);
    assert.deepEqual([rows[DOC2].sha, rows[DOC2].included, rows[DOC2].obscured], [shas[DOC2], true, null], other);
    assert.equal(w.row(`SELECT sig_armored FROM case_documents WHERE case_id=?`, r.caseId).sig_armored, null, "stored unsigned");
  }
});
