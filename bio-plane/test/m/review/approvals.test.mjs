/* review: approvals before signing (R30–R32; D60) and the review comments a case carries (R33; D61). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, P, Q, V, SECRET, NOW, sha } from "./fixture.mjs";
import { REVIEW_COPY_CHECKS, APPROVERS_MAX, APPROVAL_REASON_MAX, REVIEW_LIST_MAX, noReviewCopy } from "../../../src/review/index.mjs";
import { MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";
import { reviewCommentsLines, CASE_DOCUMENT_FORMAT } from "../../../src/case-grammar/index.mjs";
import { approvalsRead } from "../../../src/ratification/refusals.mjs";

const DEAD = JSON.stringify(noReviewCopy());
const refused = (r, code) => {
  const row = REVIEW_COPY_CHECKS[code];
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 300));
  assert.deepEqual([r.reason, r.code, r.check, r.translation], [code, code, row.check, row.translation]);
  assert.equal(typeof r.detail, "string");
};
const CASE = "CASE-2026-0001";

test("R30: an active administrator sets the approval rule, null turns it off (the default), each set appended with who and when", () => {
  const w = standard();
  w.member("gone", "admin", "revoked");
  w.member("old", "member", "revoked");
  assert.equal(w.r.approvalRule(), null, "the default: no rule, so a group of one is never blocked");
  /* not an administrator: membership's one answer (its R84, C-96.1), nothing written */
  for (const by of ["ann", "out", null, "", "class:admin", "gone"]) {
    const r = w.r.approvalRuleSet({ approvers: ["ann"], by });
    assert.deepEqual([r.ok, r.code, r.check], [false, "NOT_AN_ADMIN", MEMBERSHIP_CHECKS.NOT_AN_ADMIN.check], String(by));
  }
  /* a list that is not one or more active members, at most 50 */
  const many = Array.from({ length: APPROVERS_MAX + 1 }, (_, i) => `m${i}`);
  for (const m of many) w.member(m);
  for (const approvers of [[], undefined, "ann", ["nobody"], ["ann", ""], ["ann", 7], ["old"], many])
    refused(w.r.approvalRuleSet({ approvers, by: "adm" }), "APPROVAL_RULE_BAD_APPROVERS");
  assert.equal(w.count("approval_rules"), 0, "a refused set writes nothing");
  /* set: de-duplicated in order, stated */
  const s = w.r.approvalRuleSet({ approvers: [" ann ", "ivy", "ann"], by: "adm" });
  assert.deepEqual([s.ok, s.approvers, s.set_by, s.set_at], [true, ["ann", "ivy"], "adm", NOW]);
  assert.deepEqual(w.r.approvalRule(), { approvers: ["ann", "ivy"], set_by: "adm", set_at: NOW });
  assert.equal(w.r.approvalRuleSet({ approvers: many.slice(0, APPROVERS_MAX), by: "adm" }).ok, true, "exactly 50 accepted");
  /* null turns it off; set again, in force again; every set kept */
  w.clock.now = "2026-09-28T02:00:00.000Z";
  const off = w.r.approvalRuleSet({ approvers: null, by: "adm" });
  assert.deepEqual([off.ok, off.approvers], [true, null]);
  assert.match(off.stated, /requires no approvals/);
  assert.equal(w.r.approvalRule(), null);
  w.clock.now = "2026-09-28T03:00:00.000Z";
  w.r.approvalRuleSet({ approvers: ["bea"], by: "adm" });
  assert.deepEqual(w.r.approvalRule().approvers, ["bea"]);
  assert.deepEqual(w.rows(`SELECT approvers, set_by, set_at FROM approval_rules ORDER BY seq`).map((r) => [r.approvers, r.set_by, r.set_at]),
    [['["ann","ivy"]', "adm", NOW], [JSON.stringify(many.slice(0, APPROVERS_MAX)), "adm", NOW],
     [null, "adm", "2026-09-28T02:00:00.000Z"], ['["bea"]', "adm", "2026-09-28T03:00:00.000Z"]], "appended, never replaced");
});

test("R31: a named approver who may see the case's project approves one document at its approval digest (K2528); CASE_NOT_AN_APPROVER otherwise; a later document needs a new approval", () => {
  const w = standard();
  w.publishedCase(CASE, P, 1);
  const textA = `---\ncase: ${CASE}\napproval_rule:\n  approvers: [ann]\n---\ndoc A`;
  const A = w.caseDocument(CASE, 2, { text: textA });
  const approve = (by, extra = {}) => w.r.caseApprove({ case: CASE, edition: 2, docSha: A, by, ...extra });
  /* no rule: nobody is an approver */
  refused(approve("ann"), "CASE_NOT_AN_APPROVER");
  w.r.approvalRuleSet({ approvers: ["ann", "ivy", "out", "adm", "quinn"], by: "adm" });
  /* not named, named without sight of hidden P (D54: an administrator neither invited nor joined), a machine, no
     such case, and no case: one answer, byte-identical */
  const no = [approve("bea"), approve("out"), approve("adm"), approve("quinn"), approve("class:admin"), approve(null),
              w.r.caseApprove({ case: "CASE-2026-0404", edition: 1, docSha: A, by: "ann" }),
              w.r.caseApprove({ edition: 2, docSha: A, by: "ann" })];
  for (const r of no) refused(r, "CASE_NOT_AN_APPROVER");
  assert.equal(new Set(no.map((r) => JSON.stringify(r))).size, 1, "no oracle for which condition held");
  /* the document: a doc_sha not held at that case edition, malformed, or an edition that is not one */
  /* the stored doc_sha is not the approval digest (K2528): it names nothing to approve */
  const stored = w.row(`SELECT doc_sha FROM case_documents WHERE case_id=? AND edition=2`, CASE).doc_sha;
  assert.notEqual(stored, A);
  for (const [edition, docSha] of [[2, sha("doc B")], [2, stored], [1, A], [2, "x"], [2, A.toUpperCase()], [0, A], ["two", A], [null, A]])
    refused(w.r.caseApprove({ case: CASE, edition, docSha, by: "ann" }), "APPROVAL_NO_SUCH_DOCUMENT");
  refused(w.r.caseApprove({ case: CASE, edition: 2, docSha: "x", by: "bea" }), "CASE_NOT_AN_APPROVER");  // the approver first
  /* the reason: trimmed, at most 4,000 */
  refused(approve("ann", { reason: "r".repeat(APPROVAL_REASON_MAX + 1) }), "APPROVAL_REASON_TOO_LONG");
  assert.equal(w.count("case_approvals"), 0, "a refused approval writes nothing");
  const a = approve("ann", { reason: `  ${"r".repeat(APPROVAL_REASON_MAX)}  ` });
  assert.deepEqual([a.ok, a.existed, a.case, a.edition, a.docSha, a.by, a.reason, a.at],
    [true, false, CASE, 2, A, "ann", "r".repeat(APPROVAL_REASON_MAX), NOW]);
  /* a repeat answers the first, unchanged */
  w.clock.now = "2026-09-28T05:00:00.000Z";
  const again = approve("ann", { reason: "another" });
  assert.deepEqual([again.existed, again.at, again.reason], [true, NOW, "r".repeat(APPROVAL_REASON_MAX)]);
  /* an invited participant may see P; and an administrator once P is discoverable (the D54 control) */
  assert.deepEqual([approve("ivy").ok, approve("ivy").existed], [true, true]);
  w.discoverable(P, "ann");
  assert.equal(approve("adm").ok, true);
  assert.deepEqual(w.r.approvalsOf({ case: CASE, edition: 2, docSha: A }).map((x) => [x.by, x.reason]),
    [["ann", "r".repeat(APPROVAL_REASON_MAX)], ["ivy", null], ["adm", null]]);
  /* K2528: the digest is the same whatever the approvals block holds, so the approval holds once it is written */
  for (const text of [`---\ncase: ${CASE}\n---\ndoc A`,
                      `---\ncase: ${CASE}\napproval_rule:\n  approvers: [ann]\napprovals:\n  - by: ann\n---\ndoc A`]) {
    assert.equal(w.caseDocument(CASE, 2, { text }), A);
    assert.equal(approve("ann").existed, true, "the same document, its approvals block rewritten");
  }
  /* a later document (another digest) has no approval until it is given again */
  const B = w.caseDocument(CASE, 2, { text: `---\ncase: ${CASE}\n---\ndoc B` });
  assert.deepEqual(w.r.approvalsOf({ case: CASE, edition: 2, docSha: B }), []);
  assert.equal(w.r.caseApprove({ case: CASE, edition: 2, docSha: B, by: "ann" }).existed, false);
  assert.deepEqual(w.r.approvalsOf({ case: CASE, edition: 2, docSha: B }).map((x) => x.by), ["ann"]);
  /* an approver struck from the rule approves no more */
  w.r.approvalRuleSet({ approvers: ["ivy"], by: "adm" });
  refused(w.r.caseApprove({ case: CASE, edition: 2, docSha: B, by: "ann" }), "CASE_NOT_AN_APPROVER");
});

test("R32: at start the rule and approvals are registered once with ratification's approval reader (its R50)", () => {
  const w = standard();
  assert.equal(w.ratification.readers.length, 1);
  const [reader] = w.ratification.readers;
  assert.deepEqual(Object.keys(reader).sort(), ["approvals", "rule"]);
  assert.equal(reader.rule(), null, "no rule in force by default");
  w.publishedCase(CASE, P, 1);
  const A = w.caseDocument(CASE, 2);
  w.r.approvalRuleSet({ approvers: ["ann", "bea"], by: "adm" });
  assert.deepEqual(reader.rule(), { approvers: ["ann", "bea"], set_by: "adm", set_at: NOW });
  w.r.caseApprove({ case: CASE, edition: 2, docSha: A, by: "bea", reason: "read it" });
  assert.deepEqual(reader.approvals({ case: CASE, edition: 2, docSha: A }), [{ by: "bea", at: NOW, reason: "read it" }]);
  /* negative controls: another document, another edition, another case read none */
  for (const args of [{ case: CASE, edition: 2, docSha: sha("other") }, { case: CASE, edition: 3, docSha: A },
                      { case: "CASE-2026-0002", edition: 2, docSha: A }])
    assert.deepEqual(reader.approvals(args), [], JSON.stringify(args));
  /* read as ratification reads it (its R50's `approvalsRead`, K2548): bea's given, ann's missing; then ann's given */
  assert.deepEqual(approvalsRead(reader, { caseId: CASE, edition: 2, docSha: A }),
    { approvers: ["ann", "bea"], approvals: [{ by: "bea", at: NOW }], missing: ["ann"] });
  w.r.caseApprove({ case: CASE, edition: 2, docSha: A, by: "ann" });
  assert.deepEqual(approvalsRead(reader, { caseId: CASE, edition: 2, docSha: A }).missing, []);
  assert.deepEqual(approvalsRead(reader, { caseId: CASE, edition: 2, docSha: sha("other") }).missing, ["ann", "bea"],
    "another digest: every approver missing");
  w.r.approvalRuleSet({ approvers: null, by: "adm" });
  assert.equal(reader.rule(), null, "turned off");
  assert.equal(approvalsRead(reader, { caseId: CASE, edition: 2, docSha: A }), null, "no rule in force: nothing asked");
});

/* R33's world: CASE of P at edition 1; draft A names it (so stands at edition 2), draft B asks for a new case, a draft
   of Q; ivy and a recipient comment on A, ann on B, quinn on Q's. */
function commented() {
  const w = standard();
  w.publishedCase(CASE, P, 1);
  const A = w.r.act({ act: "draft", author: "ann", project: P, statement: "S", caseId: CASE });
  const B = w.r.act({ act: "draft", author: "ann", project: P, statement: "S", newCase: true });
  const Qd = w.r.act({ act: "draft", author: "quinn", project: Q, statement: "S" });
  w.r.act({ act: "grant", author: "ann", draft: A.draftId, recipient: "The Reporter", secretSha: SECRET(1) });
  const c = {
    ivy1: w.r.comment({ draft: A.draftId, viewer: V("ivy"), text: "first" }).comment,
    rec: w.r.comment({ secretSha: SECRET(1), bySecret: true, text: "from outside" }).comment,
    ivy2: w.r.comment({ draft: A.draftId, viewer: V("ivy"), text: "second" }).comment,
    ann: w.r.comment({ draft: B.draftId, viewer: V("ann"), text: "on the new case" }).comment,
    quinn: w.r.comment({ draft: Qd.draftId, viewer: V("quinn"), text: "elsewhere" }).comment,
  };
  return { w, A, B, Qd, c };
}

test("R33: reviewCommentsFor lists the comments on a case edition's review copies for the publisher's choice, fenced as R9, writing nothing", () => {
  const { w, A, B, c } = commented();
  /* each comment keeps the identity its draft stood at */
  assert.deepEqual(w.rows(`SELECT comment_id, case_id, edition FROM review_comments ORDER BY comment_id`)
    .map((r) => [r.case_id, r.edition]), [[CASE, 2], [CASE, 2], [CASE, 2], [null, 1], [null, 1]]);
  const before = w.snapshot();
  const l = w.r.reviewCommentsFor({ case: CASE, edition: 2, viewer: V("ann") });
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  assert.deepEqual([l.ok, l.kind, l.case, l.edition, l.draft, l.count, l.truncated, l.limit],
    [true, "review-comments", CASE, 2, null, 3, false, REVIEW_LIST_MAX]);
  assert.deepEqual(l.comments, [
    { comment_id: c.ivy1.comment_id, draft_id: A.draftId, reviewer: "ivy", reviewer_kind: "member", text: "first", at: NOW },
    { comment_id: c.rec.comment_id, draft_id: A.draftId, reviewer: "The Reporter", reviewer_kind: "recipient", text: "from outside", at: NOW },
    { comment_id: c.ivy2.comment_id, draft_id: A.draftId, reviewer: "ivy", reviewer_kind: "member", text: "second", at: NOW }]);
  /* a new case's copies are reached through the draft publishCase names */
  const nb = w.r.reviewCommentsFor({ case: "CASE-2026-0002", edition: 1, viewer: V("ann"), draft: B.draftId });
  assert.deepEqual(nb.comments.map((x) => x.text), ["on the new case"]);
  assert.deepEqual(w.r.reviewCommentsFor({ case: CASE, edition: 2, viewer: V("ann"), draft: A.draftId }).comments.map((x) => x.text),
    ["first", "from outside", "second"], "the named case's draft adds nothing twice");
  /* comments made at an earlier identity stay that edition's: edition 2 is published, A moves to 3 */
  w.publishedCase(CASE, P, 2);
  w.r.comment({ draft: A.draftId, viewer: V("ivy"), text: "on edition 3" });
  assert.equal(w.r.reviewCommentsFor({ case: CASE, edition: 2, viewer: V("ann") }).count, 3);
  assert.deepEqual(w.r.reviewCommentsFor({ case: CASE, edition: 3, viewer: V("ann") }).comments.map((x) => x.text), ["on edition 3"]);
  /* the cap */
  const cut = w.r.reviewCommentsFor({ case: CASE, edition: 2, viewer: V("ann"), limit: "2" });
  assert.deepEqual([cut.count, cut.truncated, cut.limit], [2, true, 2]);
  /* the fence: an outsider, Q's owner, an administrator outside hidden P (D54), no viewer, a draft not held, a case
     not held: the dead answer, byte-identical */
  for (const r of [w.r.reviewCommentsFor({ case: CASE, edition: 2, viewer: V("out") }),
                   w.r.reviewCommentsFor({ case: CASE, edition: 2, viewer: V("quinn") }),
                   w.r.reviewCommentsFor({ case: CASE, edition: 2, viewer: V("adm") }),
                   w.r.reviewCommentsFor({ case: CASE, edition: 2 }),
                   w.r.reviewCommentsFor({ case: CASE, edition: 2, viewer: V("ann"), draft: "DRAFT-2026-9999" }),
                   w.r.reviewCommentsFor({ case: "CASE-2026-0404", edition: 1, viewer: V("ann") }),
                   w.r.reviewCommentsFor({ viewer: V("ann") })])
    assert.equal(JSON.stringify(r), DEAD);
  /* negative control: once P is discoverable the administrator reads them */
  w.discoverable(P, "ann");
  assert.equal(w.r.reviewCommentsFor({ case: CASE, edition: 2, viewer: V("adm") }).count, 3);
});

test("R33: registered at start with case-authoring's registerReviewComments (its R66), once, answering reviewCommentsFor", () => {
  const { w, B } = commented();
  assert.equal(w.caseAuthoring.reviewComments.length, 1);
  const [fn] = w.caseAuthoring.reviewComments;
  for (const args of [{ case: CASE, edition: 2, viewer: V("ann") }, { case: null, edition: 1, viewer: V("ed"), draft: B.draftId },
                      { case: CASE, edition: 2, viewer: V("out") }])
    assert.deepEqual(fn(args), w.r.reviewCommentsFor(args), JSON.stringify(args));
});

test("R33: after publication each member reviewer whose comments were left out is told once; a recipient is not; an unreadable block tells nobody", () => {
  const { w, B, c } = commented();
  const left = (m) => w.r.reviewCommentsLeftOut({ viewer: V(m) });
  /* nothing published yet: nothing to tell */
  assert.deepEqual(left("ivy").items, []);
  /* edition 2 prepared and unsigned, then published: its block carries ivy's first comment and the recipient's */
  /* the document's block as case-grammar R25 writes it */
  const block = (rows) => ["---", `format: ${CASE_DOCUMENT_FORMAT}`, ...reviewCommentsLines({ comments: rows, left_out: null }),
                           "---", ""].join("\n");
  const carry = (x) => ({ reviewer: x.author_kind === "recipient" ? "The Reporter" : x.author, text: x.text, at: x.at });
  w.caseDocument(CASE, 2, { text: block([carry(c.ivy1), carry(c.rec)]) });
  w.publishedCase(CASE, P, 2);
  assert.deepEqual(left("ivy").items, [], "an unsigned document is not a publication");
  w.caseDocument(CASE, 2, { text: block([carry(c.ivy1), carry(c.rec)]), signed: true });
  const before = w.snapshot();
  const ivy = left("ivy");
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  assert.deepEqual(ivy.items, [{ key: `FINDING::review-comment-left-out::${CASE}::2::ivy`, case: CASE, edition: 2, project: P,
                                 left_out: 1, comments: [c.ivy2.comment_id] }]);
  assert.deepEqual(left("ivy").items, ivy.items, "the same key every read: told once");
  /* nobody else: ann made no comment on edition 2; a recipient is no member; a machine or no viewer reads none */
  assert.deepEqual(left("ann").items, []);
  for (const viewer of [null, "", "class:admin", "The Reporter", "member:"])
    assert.deepEqual(w.r.reviewCommentsLeftOut({ viewer }).items, [], String(viewer));
  /* negative control: every comment carried, no item */
  w.caseDocument(CASE, 2, { text: block([carry(c.ivy1), carry(c.ivy2)]), signed: true });
  assert.deepEqual(left("ivy").items, []);
  /* a new case reached through the draft its document names: B's comment by ann, left out */
  w.publishedCase("CASE-2026-0002", P, 1);
  w.caseDocument("CASE-2026-0002", 1, { text: block([]), draft: B.draftId, signed: true });
  assert.deepEqual(left("ann").items.map((i) => [i.case, i.edition, i.left_out, i.comments]),
    [["CASE-2026-0002", 1, 1, [c.ann.comment_id]]]);
  /* a document without the block (and one of a format before it) cannot say what was left out: undetermined, nobody told */
  w.caseDocument("CASE-2026-0002", 1, { text: `---\nformat: ${CASE_DOCUMENT_FORMAT}\n---\nno block`, draft: B.draftId, signed: true });
  const u = left("ann");
  assert.deepEqual([u.items, u.undetermined], [[], 1]);
  w.caseDocument("CASE-2026-0002", 1, { text: block([]).replace(/^format: .*\n/m, ""), draft: B.draftId, signed: true });
  assert.deepEqual([left("ann").items, left("ann").undetermined], [[], 1], "no format: before the block existed");
  /* a comment from before identities were recorded belongs to no case edition */
  w.st.sql.exec(`UPDATE review_comments SET edition=NULL, case_id=NULL WHERE comment_id=?`, c.ivy2.comment_id);
  w.caseDocument(CASE, 2, { text: block([]), signed: true });
  assert.deepEqual(left("ivy").items.map((i) => i.comments), [[c.ivy1.comment_id]]);
});
