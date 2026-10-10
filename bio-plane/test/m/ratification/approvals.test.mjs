/* ratification R49, R50 (T41; D60, N820): the group's approvals before signing. A reader of the approval rule and the
   approvals given (`review` R32's, a stand-in the test controls) is registered once (R50); with a rule naming approvers,
   `op=caseratify`, `op=publishat`, the pre-flight (R18) and the scheduled publisher (R42) refuse APPROVAL_MISSING
   (C-58.11) after CASE_RATIFY_STALE while an approver has not approved the document at its `doc_sha`; with no rule
   nothing is asked; and R42's `checked` records the approvals, so a changed one stops a waiting edition. Each arm has its
   negative control (K874). Driven at the module's interface, over the real publication and the module's own case,
   signature and gate. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, plane, newKey, signCase, cleanCase, fmText, CASE_BODY, V, SILENT } from "./fixture.mjs";
import { caseRatifyOp, publishAtOp } from "../../../src/ratification/ops.mjs";
import { caseConclusionRowLines, rowOf, RATIFY_SCOPE_CHECKS } from "../../../src/ratification/index.mjs";

const Q1 = "INQ-2026-0001-first", CASE = "CASE-2026-0001";
const OWN = { version: "first", claim: "the council approved it", falsifier: "f", falsifier_override: null,
              by: "member:alice", at: "2026-09-27T10:00:00Z" };
const AT = { date: "2026-10-09", time: "09:30" };
const LATER = "2026-10-09T13:30:00.000Z";

/* A /6 case document Alice (the project's owner, with an attesting key) may sign, stored unsigned; publish-schedule as
   a stand-in; a hold reader; and, unless `reader` is false, an approval reader answering `w.rule` and `w.given`. */
async function setup({ reader = true } = {}) {
  const scheduled = [];
  const ps = { registerScheduledPublisher: () => ({ ok: true }), scheduledEditions: () => ({ editions: [], cursor: null }),
               scheduleEdition: (a) => (scheduled.push(a), { ok: true, case: a.case, edition: a.edition, state: "waiting",
                                                            at: { ...a.at, zone: "America/Halifax" }, publish_at: LATER }) };
  const w = world({ schedule: ps });
  const key = await newKey();
  w.member("alice", { signer: key }); w.member("bo"); w.member("cy");
  const P = w.project("Team", "alice", { joined: ["bo", "cy"] });
  w.inquiry(Q1);
  w.bv.conc.set(w.key(P, Q1), OWN);
  const conc = w.r.caseConclusionFor(P, Q1, V("alice"), "open");
  const doc = cleanCase({ caseId: CASE, edition: 1, project: P, members: [{ id: Q1, pin: w.sha(Q1) }] });
  const text = fmText(doc, { raw: ["case_conclusions:", ...caseConclusionRowLines(Q1, conc)], body: CASE_BODY });
  const docSha = w.caseDoc(CASE, 1, text);
  assert.equal(docSha, createHash("sha256").update(text, "utf8").digest("hex"));
  w.pub.facts.set(`${CASE}#1`, { ok: true, doc: { case_id: CASE, edition: 1, doc_sha: docSha, text },
                                 attribution: { reached: [], legacy: [], stated: [], current: [] },
                                 signers: w.credentials.attestingKeys(), memberBasis: null, priorCase: null });
  w.publication.stampsOf = () => ({ ok: true, stamps: [] });
  w.r.registerHoldReader({ holdsOn: () => ({ held: false }) });
  const sig = await signCase(key, CASE, 1, docSha);
  w.rule = { approvers: ["member:bo", "cy"] };
  w.given = [];
  const asked = [];
  if (reader)
    assert.deepEqual(w.r.registerApprovalReader({
      rule: () => (typeof w.rule === "function" ? w.rule() : w.rule),
      approvals: (a) => (asked.push(a), typeof w.given === "function" ? w.given(a) : w.given.filter((x) => x.docSha === a.docSha)) }),
      { ok: true });
  const req = { caseId: CASE, edition: 1, expectedSha: docSha, sig };
  const op = async (fn, b, o = {}) => { const p = plane(w, o); const res = await fn(p.request(b), p.stub, p.ctx); return { ...res, p }; };
  const body = { caseId: CASE, edition: 1, docSha, sigArmored: sig, attestorKey: key.keyB64, attestorMember: "alice",
                 gateVersion: "g1", deliveredBy: "member:alice", at: AT };
  const entry = (checked) => ({ case: CASE, edition: 1, doc_sha: docSha, signature: sig, signer: "alice",
                                delivered_by: "member:alice", at: { ...AT, zone: "America/Halifax" }, publish_at: LATER,
                                state: "waiting", checked });
  const approve = (...who) => { w.given = [...w.given, ...who.map((by) => ({ by: V(by), at: "2026-10-08T00:00:00Z", docSha }))]; };
  return { w, P, key, docSha, sig, text, req, op, body, entry, scheduled, asked, approve };
}

const committed = (w) => w.count("published_cases");

test("R49, R14: APPROVAL_MISSING is C-58.11 in this module's C-58 family, with its translation and its one minting site", () => {
  assert.deepEqual(RATIFY_SCOPE_CHECKS.APPROVAL_MISSING.check, "C-58.11");
  assert.equal(RATIFY_SCOPE_CHECKS.APPROVAL_MISSING.where, "src/ratification/refusals.mjs approvalMissingRefusal > is-approval-missing");
  assert.equal(rowOf("APPROVAL_MISSING").translation,
    "This case edition can't be signed yet: the group requires named members to approve a case before it is signed, and "
    + "some of them have not approved this version of it. They are named. Ask them to approve it, then sign. Nothing was signed.");
});

test("R50: the approval reader is registered once at start; a second is refused APPROVAL_READER_DECLARED, a malformed one MALFORMED, and the first stays the one read", async () => {
  const s = await setup();
  assert.equal(s.w.r.registerApprovalReader({ rule: () => null, approvals: () => [] }).reason, "APPROVAL_READER_DECLARED");
  const fresh = await setup({ reader: false });
  assert.equal(fresh.w.r.registerApprovalReader({ rule: () => null }).reason, "MALFORMED");
  assert.equal(fresh.w.r.registerApprovalReader(null).reason, "MALFORMED");
  assert.equal(fresh.w.r.registerApprovalReader({ rule: () => null, approvals: () => [] }).ok, true);
  const res = await s.op(caseRatifyOp, s.req);
  assert.equal(res.body.reason, "APPROVAL_MISSING", "the first reader's rule is the one in force");
});

test("R50, R49: with no approval reader registered, or a rule naming nobody, no rule is in force: op=caseratify commits and nothing is asked", async () => {
  const none = await setup({ reader: false });
  const a = await none.op(caseRatifyOp, none.req);
  assert.equal(a.status, 200, JSON.stringify(a.body));
  assert.equal(committed(none.w), 1);
  const off = await setup();
  off.w.rule = null;
  const b = await off.op(caseRatifyOp, off.req);
  assert.equal(b.status, 200, JSON.stringify(b.body));
  assert.deepEqual(off.asked, [], "no approvals asked with no rule");
  const empty = await setup();
  empty.w.rule = { approvers: [] };
  assert.equal((await empty.op(caseRatifyOp, empty.req)).status, 200);
});

test("R49: op=caseratify refuses APPROVAL_MISSING (C-58.11) naming each approver who has not approved this document at its doc_sha, nothing written; an approval of another doc_sha does not count; with every approval it commits (negative control)", async () => {
  const s = await setup();
  s.approve("bo");
  s.w.given = [...s.w.given, { by: "member:cy", at: "2026-10-01T00:00:00Z", docSha: "e".repeat(64) }];
  const r = await s.op(caseRatifyOp, s.req);
  assert.equal(r.status, 409, JSON.stringify(r.body));
  assert.deepEqual([r.body.reason, r.body.code, r.body.check, r.body.translation],
                   ["APPROVAL_MISSING", "APPROVAL_MISSING", "C-58.11", rowOf("APPROVAL_MISSING").translation]);
  assert.deepEqual([r.body.approvers, r.body.missing, r.body.docSha], [["bo", "cy"], ["cy"], s.docSha]);
  assert.deepEqual(s.asked.at(-1), { case: CASE, edition: 1, docSha: s.docSha }, "asked at the stored document's doc_sha");
  assert.deepEqual(r.p.fetched, ["casedocfacts", "casetestimony", "caseapproval"], "refused before the gate and the commit");
  assert.equal(committed(s.w), 0);
  s.approve("cy");
  const ok = await s.op(caseRatifyOp, s.req);
  assert.equal(ok.status, 200, JSON.stringify(ok.body));
  assert.equal(committed(s.w), 1);
});

test("R49: APPROVAL_MISSING comes after CASE_RATIFY_STALE and before NO_SIGNERS, SIG_<reason> and GATE_REFUSED", async () => {
  const s = await setup();
  const stale = await s.op(caseRatifyOp, { ...s.req, expectedSha: "e".repeat(64) });
  assert.equal(stale.body.reason, "CASE_RATIFY_STALE", "the stale document is answered first");
  const facts = s.w.pub.facts.get(`${CASE}#1`);
  const signers = facts.signers; facts.signers = [];
  assert.equal((await s.op(caseRatifyOp, s.req)).body.reason, "APPROVAL_MISSING", "before NO_SIGNERS");
  facts.signers = signers;
  assert.equal((await s.op(caseRatifyOp, { ...s.req, sig: await signCase(await newKey(), CASE, 1, s.docSha) })).body.reason,
               "APPROVAL_MISSING", "before the signature is weighed");
  /* negative control: approved, the later refusals answer as before */
  s.approve("bo", "cy");
  facts.signers = [];
  assert.equal((await s.op(caseRatifyOp, s.req)).body.reason, "NO_SIGNERS");
  facts.signers = signers;
});

test("R49: approvals that cannot be read refuse the act APPROVAL_MISSING naming that, never sign it unchecked; a silent store refuses; the readable control commits", async () => {
  const s = await setup();
  s.w.given = () => { throw new Error("the review store fell over"); };
  const r = await s.op(caseRatifyOp, s.req);
  assert.deepEqual([r.status, r.body.reason, r.body.missing], [409, "APPROVAL_MISSING", null]);
  assert.match(r.body.detail, /could not be read.*the review store fell over/);
  s.w.rule = { approvers: "bo" };
  assert.equal((await s.op(caseRatifyOp, s.req)).body.reason, "APPROVAL_MISSING", "a malformed rule is unreadable");
  s.w.rule = { approvers: ["bo"] };
  s.w.given = () => ({ approvals: [{ by: "member:bo", at: "2026-10-08T00:00:00Z" }] });
  const p = plane(s.w);
  s.w.ops.caseapproval = () => SILENT;
  const silent = await caseRatifyOp(p.request(s.req), p.stub, p.ctx);
  assert.deepEqual([silent.status, silent.body.op], [502, "caseratify/approval"]);
  assert.equal(committed(s.w), 0);
  delete s.w.ops.caseapproval;
  const ok = await s.op(caseRatifyOp, s.req);
  assert.equal(ok.status, 200, JSON.stringify(ok.body));
});

test("R49, R40: op=publishat answers APPROVAL_MISSING byte-identical to op=caseratify, nothing set to wait; approved, it is set to wait", async () => {
  const s = await setup();
  const a = await s.op(publishAtOp, { ...s.req, at: AT }), b = await s.op(caseRatifyOp, s.req);
  assert.deepEqual([a.status, a.body], [b.status, b.body]);
  assert.equal(a.body.reason, "APPROVAL_MISSING");
  assert.deepEqual(s.scheduled, []);
  s.approve("bo", "cy");
  const ok = await s.op(publishAtOp, { ...s.req, at: AT });
  assert.equal(ok.status, 200, JSON.stringify(ok.body));
  assert.equal(s.scheduled.length, 1);
  assert.deepEqual(JSON.parse(s.scheduled[0].checked.approvals),
    { rule: { approvers: ["bo", "cy"] }, approvals: [{ at: "2026-10-08T00:00:00Z", by: "bo" }, { at: "2026-10-08T00:00:00Z", by: "cy" }] },
    "R50: checked records the rule and the approvals given");
  assert.equal(committed(s.w), 0);
});

test("R49, R18: the pre-flight answers APPROVAL_MISSING among its refusals, the act's own, over the text's own sha, after C-58.5 and before NO_ATTESTING_KEY; with every approval it is ready; approvals unread make it PREFLIGHT_UNDETERMINED", async () => {
  const s = await setup();
  const pre = s.w.r.caseRatifyPreflight({ text: s.text, signer: "bo", viewer: V("bo") });
  assert.equal(pre.ok, true);
  assert.equal(pre.ready, false);
  assert.deepEqual(pre.refusals.map((r) => r.reason), ["APPROVAL_MISSING", "NO_ATTESTING_KEY", "CASE_SIGNER_NOT_AN_OWNER"]);
  const act = await s.op(caseRatifyOp, s.req);
  const { store, tokenClass, ...actOwn } = act.body;
  assert.deepEqual(pre.refusals[0], actOwn, "byte-identical to the act's own refusal");
  assert.deepEqual(s.asked.at(0), { case: CASE, edition: 1, docSha: s.docSha }, "asked at the text's own sha");
  s.approve("bo", "cy");
  const ready = s.w.r.caseRatifyPreflight({ text: s.text, signer: "alice", viewer: V("alice") });
  assert.deepEqual([ready.ready, ready.refusals], [true, []]);
  s.w.rule = () => { throw new Error("unread"); };
  assert.equal(s.w.r.caseRatifyPreflight({ text: s.text, signer: "alice", viewer: V("alice") }).reason, "PREFLIGHT_UNDETERMINED");
  s.w.rule = null;
  assert.equal(s.w.r.caseRatifyPreflight({ text: s.text, signer: "alice", viewer: V("alice") }).ready, true, "no rule: nothing asked");
});

test("R49, R50, R42: at its time an approval withdrawn since signing stops the waiting edition: APPROVAL_MISSING as a SCHEDULED_CHECK_REFUSED cause and the changed approvals named; nothing committed; unchanged, it publishes (negative control)", async () => {
  const s = await setup();
  s.approve("bo", "cy");
  assert.equal((await s.op(publishAtOp, { ...s.req, at: AT })).status, 200);
  const checked = s.scheduled[0].checked;
  s.w.given = s.w.given.filter((x) => x.by !== "member:cy");
  const out = await s.w.r.publishScheduled(s.entry(checked), LATER);
  assert.deepEqual(out.stopped.map((x) => [x.code, x.check, x.cause.code]),
                   [["SCHEDULED_CHECK_REFUSED", "C-58.10", "APPROVAL_MISSING"], ["SCHEDULED_CHECK_REFUSED", "C-58.10", "APPROVALS_CHANGED"]]);
  assert.equal(out.stopped[0].cause.translation, rowOf("APPROVAL_MISSING").translation);
  assert.deepEqual(out.stopped[1].changed, [{ was: { approval: { at: "2026-10-08T00:00:00Z", by: "cy" } } }]);
  assert.equal(committed(s.w), 0);
  s.approve("cy");
  assert.equal((await s.w.r.publishScheduled(s.entry(checked), LATER)).published, true);
});

test("R50, R42: a changed approval that still meets the rule (one more approver approving) stops the waiting edition as SCHEDULED_CHECK_REFUSED APPROVALS_CHANGED; a changed rule does too", async () => {
  const s = await setup();
  s.w.rule = { approvers: ["bo"] };
  s.approve("bo");
  assert.equal((await s.op(publishAtOp, { ...s.req, at: AT })).status, 200);
  const checked = s.scheduled[0].checked;
  s.approve("cy");
  let out = await s.w.r.publishScheduled(s.entry(checked), LATER);
  assert.deepEqual(out.stopped.map((x) => [x.code, x.cause.code]), [["SCHEDULED_CHECK_REFUSED", "APPROVALS_CHANGED"]]);
  assert.deepEqual(out.stopped[0].changed, [{ now: { approval: { at: "2026-10-08T00:00:00Z", by: "cy" } } }]);
  s.w.given = s.w.given.filter((x) => x.by !== "member:cy");
  s.w.rule = null;
  out = await s.w.r.publishScheduled(s.entry(checked), LATER);
  assert.deepEqual(out.stopped.map((x) => x.cause.code), ["APPROVALS_CHANGED"], "the rule turned off since signing");
  assert.equal(committed(s.w), 0);
  s.w.rule = { approvers: ["bo"] };
  assert.equal((await s.w.r.publishScheduled(s.entry(checked), LATER)).published, true, "as signed, it publishes");
});

test("R50, R42: an edition signed before checked recorded approvals is read as no rule: with no rule now it publishes, with a rule now it stops; approvals unread at the time stop it UNREADABLE", async () => {
  const s = await setup();
  s.w.rule = null;
  assert.equal((await s.op(publishAtOp, { ...s.req, at: AT })).status, 200);
  const { approvals, ...older } = s.scheduled[0].checked;
  assert.deepEqual(JSON.parse(approvals), { rule: null, approvals: [] });
  s.w.rule = () => { throw new Error("unread"); };
  let out = await s.w.r.publishScheduled(s.entry(older), LATER);
  assert.ok(out.stopped.every((x) => x.cause.code === "UNREADABLE"), JSON.stringify(out));
  assert.ok(out.stopped.length >= 1);
  s.w.rule = { approvers: ["bo"] };
  out = await s.w.r.publishScheduled(s.entry(older), LATER);
  assert.deepEqual(out.stopped.map((x) => x.cause.code), ["APPROVAL_MISSING", "APPROVALS_CHANGED"]);
  assert.equal(committed(s.w), 0);
  s.w.rule = null;
  assert.equal((await s.w.r.publishScheduled(s.entry(older), LATER)).published, true);
});
