/* case-authoring: the case's account and what travels with it (T41; N820; D56, D57, D60, D61, D63; K2528, K2531, K2533,
   K2536) — the account and the statements judged against what they cite and written as case-grammar R23's block (R63),
   the system's drafts of it (R64), the authored fields and no other (R65), the reviewers' comments the publisher chooses
   (R66), the pre-flight's account and approvals steps (R67, R68). case-disclosures R30's judgment is the real one unless
   a test sets `w.judgeAccount`; review's reader (R66) and ratification's `approvalsInForce` (R68) are stand-ins the test
   registers, as review and ratification fill them. Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED, WHAT_CHANGED } from "./fixture.mjs";
import { caseAuthoringOps, ACCOUNT_FRAMINGS, AUTHORED_FIELDS, ACT_FIELDS } from "../../../src/case-authoring/index.mjs";
import { accountOf, reviewCommentsOf, approvalsOf, approvalSubjectSha, ACCOUNT_HEAD } from "../../../src/case-grammar/index.mjs";
import { SHARED_ACT_CHECKS, ACCEPT_MUST_REAUTHOR } from "../../../src/record-grammar/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";
const RUN = "RUN-2026-0001";
/* an edition above 1 states its completeness afresh (R10) and what changed (R38) */
const FRESH = { statement: "It does not cover the later amendments to the award.",
                subjectJustification: "The award is public, and the question is whether its terms were kept.",
                biasAcknowledgement: "We still read the minutes as the account of the meeting, as of this edition.",
                excluded: [{ description: "the amendments, which this edition names", reason: "not yet obtained" }],
                whatChanged: WHAT_CHANGED };
const SENTENCES = [
  { text: "The council awarded the contract on 3 March.", cites: [{ kind: "finding", ref: Q }] },
  { text: "The award followed the minutes.", cites: [{ kind: "leg", ref: Q, ord: 1 }] },
  { text: "We read the minutes as the authoritative account.", cites: [], bias_statement: "s1" },
];

function setup(opts) {
  const w = world(opts);
  for (const m of ["alice", "bo", "cy"]) w.member(m);
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  w.finding(Q2, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q, Q2]);
  w.join(P, "bo");
  w.runs.set(RUN, { status: "running", principal: "agent" });
  return { w, P };
}
const docOf = (w, r) => w.row(`SELECT doc_sha, text FROM case_documents WHERE case_id=? AND edition=?`, r.caseId, r.edition);
/* R18: one act run inside a transaction the test rolls back, answering what it answered, the document it stored and the
   acceptances it recorded, so several acts may prepare the same edition in turn (R8 refuses a second preparation). */
const ROLL = Symbol("rollback");
function tried(w, act) {
  let out = null;
  try {
    w.record.transact(() => {
      const r = act();
      out = { r, doc: r && r.ok ? docOf(w, r) : null, acceptances: w.rows(`SELECT draft_id, form, record FROM account_acceptances ORDER BY seq`) };
      throw ROLL;
    });
  } catch (e) { if (e !== ROLL) throw e; }
  return out;
}
/* a published first edition, so a second may carry an account drafted for the case */
function published(w, P) {
  const one = w.publish(P, "alice", [Q]);
  assert.equal(one.ok, true, JSON.stringify(one).slice(0, 300));
  w.ratify(one);
  return one;
}

/* ---------------------------------------------------------------- R63 */

test("R63 (D56; K2531, K2533): publishCase hands case-disclosures R30 every sentence of the account and the four statements as case-grammar R23's rows, with what they cite as the viewer reads it, the lens, the members' conclusions, the flags and the viewer, after R55's judgments; writes R23's block and the account's section; negative control: no account, no section, the statements still judged and written", () => {
  const { w, P } = setup();
  w.judgeAccount = () => ({ ok: true, refusals: [] });
  const r = w.publish(P, "alice", [Q], { account: SENTENCES, statementCites: { statement: [{ kind: "finding", ref: Q }] } });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  assert.equal(w.judged.length, 1, "asked once");
  const a = w.judged[0];
  const rows = [
    { ord: 1, text: SENTENCES[0].text, cites: [{ kind: "finding", ref: Q, ord: null }], kind: "account", bias_statement: null, began_as: "member", draft: null },
    { ord: 2, text: SENTENCES[1].text, cites: [{ kind: "leg", ref: Q, ord: 1 }], kind: "account", bias_statement: null, began_as: "member", draft: null },
    { ord: 3, text: SENTENCES[2].text, cites: [], kind: "account", bias_statement: "s1", began_as: "member", draft: null }];
  assert.deepEqual(a.account, rows);
  assert.deepEqual(a.statements.map((x) => [x.ord, x.kind, x.text, x.cites]), [
    [4, "statement", AUTHORED.statement, [{ kind: "finding", ref: Q, ord: null }]],
    [5, "subject_justification", AUTHORED.subjectJustification, []]], "a first edition carries no what-changed row");
  /* what is cited, as the viewer reads it: one holding per cite, addressed kind:ref (#ord for a leg) */
  assert.deepEqual(a.cited.holdings.map((h) => h.address), [`finding:${Q}`, `leg:${Q}#1`]);
  assert.equal(a.cited.holdings[0].quote, w.text(Q), "the finding's own text");
  assert.equal(JSON.parse(a.cited.holdings[1].quote).target_id, DOC, "the leg as its basis states it");
  assert.deepEqual([a.cited.rules, a.cited.looks], [[], []]);
  assert.deepEqual(a.conclusions.map((c) => [c.finding, c.legs.length]), [[Q, 1]]);
  assert.deepEqual([a.flags, a.viewer, a.lens.in_force], [[], V("alice"), false]);
  /* the document: R23's block, read back by case-grammar's reader, and the account printed in the body */
  const doc = docOf(w, r);
  assert.deepEqual(accountOf(w.fm(doc.text)).map((x) => [x.ord, x.kind, x.text]),
    [...rows.map((x) => [x.ord, x.kind, x.text]), [4, "statement", AUTHORED.statement], [5, "subject_justification", AUTHORED.subjectJustification]]);
  assert.ok(doc.text.includes(`${ACCOUNT_HEAD}\n\n${SENTENCES[0].text}\n`), "the account's section");
  assert.deepEqual([r.account.sentences.length, r.account.draft, r.account.form], [3, null, null]);
  /* negative control: no account — no section, no answer key; the statements' rows still judged and written */
  const w2 = setup().w; w2.judgeAccount = () => ({ ok: true, refusals: [] });
  const P2 = w2.rows(`SELECT bundle_id FROM bundles WHERE object_type='project'`)[0].bundle_id;
  const none = w2.publish(P2, "alice", [Q]);
  assert.equal(none.ok, true);
  assert.equal("account" in none, false);
  assert.equal(w2.judged[0].account.length, 0);
  assert.equal(docOf(w2, none).text.includes(ACCOUNT_HEAD), false);
  assert.deepEqual(accountOf(w2.fm(docOf(w2, none).text)).map((x) => x.kind), ["statement", "subject_justification"]);
});

test("R63: case-disclosures R30's first refusal is op=publish's answer and nothing is written; a judgment that answers no list fails closed (ACCOUNT_CHECK_UNDETERMINED); the pre-flight lists every R30 refusal, the first as first and the rest among blockers, and reads them itself when op=publish refuses earlier", () => {
  const { w, P } = setup();
  const R1 = { ok: false, reason: "ACCOUNT_FACT_NOT_IN_CITED", code: "ACCOUNT_FACT_NOT_IN_CITED", sentences: [1] };
  const R2 = { ok: false, reason: "ACCOUNT_FLAG_UNANSWERED", code: "ACCOUNT_FLAG_UNANSWERED", sentences: [2] };
  w.judgeAccount = () => ({ ok: true, refusals: [R1, R2] });
  const before = w.count("case_documents");
  assert.deepEqual(w.publish(P, "alice", [Q], { account: SENTENCES }), R1);
  assert.equal(w.count("case_documents"), before, "nothing written");
  const args = { ...AUTHORED, project: P, targets: [Q], roles: { [Q]: "load_bearing" }, viewer: V("alice"), author: "alice",
                 account: SENTENCES };
  const pre = w.ca.publishPreflight(args);
  assert.deepEqual(pre.first, R1);
  assert.ok(pre.blockers.some((b) => b.reason === "ACCOUNT_FLAG_UNANSWERED"), "the rest among blockers");
  assert.equal(pre.ready, false);
  /* refused earlier: the pre-flight's own read still lists both */
  const early = w.ca.publishPreflight({ ...args, account: [...SENTENCES], subjectPosition: "nonsense" });
  assert.equal(early.first.reason, "NO_SUBJECT_POSITION");
  assert.deepEqual(early.blockers.filter((b) => b.reason.startsWith("ACCOUNT_")).map((b) => b.reason),
                   ["ACCOUNT_FACT_NOT_IN_CITED", "ACCOUNT_FLAG_UNANSWERED"], "read by the pre-flight itself");
  /* fail closed: a list not answered, or a throw */
  for (const judge of [() => ({}), () => { throw new Error("down"); }]) {
    w.judgeAccount = judge;
    const r = w.publish(P, "alice", [Q], { account: SENTENCES });
    assert.deepEqual([r.ok, r.reason], [false, "ACCOUNT_CHECK_UNDETERMINED"]);
  }
  assert.equal(w.count("case_documents"), before);
  /* negative control: an empty list publishes */
  w.judgeAccount = () => ({ ok: true, refusals: [] });
  assert.equal(w.publish(P, "alice", [Q], { account: SENTENCES }).ok, true);
});

test("R63: the account's and the statements' citations are shaped before anything is read — BAD_ACCOUNT names the sentence and field, BAD_STATEMENT_CITES the statement; a cite the viewer cannot read has no holding; negative control: well-formed cites publish", () => {
  const { w, P } = setup();
  w.judgeAccount = () => ({ ok: true, refusals: [] });
  const bad = [
    [{ account: "a story" }, "BAD_ACCOUNT", "account"],
    [{ account: [{ text: "", cites: [] }] }, "BAD_ACCOUNT", "account[0].text"],
    [{ account: [{ text: "Two\nlines.", cites: [] }] }, "BAD_ACCOUNT", "account[0].text"],
    [{ account: [{ text: "A.", cites: [{ kind: "rumour", ref: Q }] }] }, "BAD_ACCOUNT", "account[0].cites"],
    [{ account: [{ text: "A.", cites: [{ kind: "leg", ref: Q }] }] }, "BAD_ACCOUNT", "account[0].cites"],
    [{ account: [{ text: "A.", cites: [], context: "the backstory" }] }, "BAD_ACCOUNT", "account[0].context"],
    [{ statementCites: { story: [] } }, "BAD_STATEMENT_CITES", "statementCites.story"],
    [{ statementCites: { excluded: [[], []] } }, "BAD_STATEMENT_CITES", "statementCites.excluded"],
  ];
  for (const [over, reason, field] of bad) {
    const r = w.publish(P, "alice", [Q], over);
    assert.deepEqual([r.ok, r.reason, r.field], [false, reason, field], JSON.stringify(over));
  }
  assert.equal(w.judged.length, 0, "asked of nobody");
  /* a finding the viewer cannot see is cited: it has no holding, so the sentence rests on nothing read */
  const H = w.project("Hidden", "cy", [Q2]);
  void H;
  const hidden = "INQ-2026-0009-h";
  w.finding(hidden, [{ target: DOC }], { lines: [] });
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, H, hidden);
  const r = w.publish(P, "alice", [Q], { account: [{ text: "It rests elsewhere.", cites: [{ kind: "finding", ref: hidden }] }] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(w.judged.at(-1).cited.holdings, [], "no holding for what the viewer cannot read");
});

/* ---------------------------------------------------------------- R64 */

test("R64 (D56; K2536): accountPropose stores the system's draft of the account in a framing, labelled machine work, and accountDrafts lists the case's drafts oldest first; refusals in order — NO_SUCH_CASE (unseen and absent alike), BAD_ACCOUNT_DRAFT, BAD_ACCOUNT_FRAMING, NO_SUCH_RUN — each writing nothing; a draft is never the account", () => {
  const { w, P } = setup();
  const one = published(w, P);
  const before = w.count("account_drafts");
  const refusals = [
    [{ case: "CASE-2026-9999", framing: "time_order", text: "x", run: RUN, viewer: "class:ai" }, "NO_SUCH_CASE"],
    [{ case: one.caseId, framing: "time_order", text: "x", run: RUN, viewer: V("cy") }, "NO_SUCH_CASE"],
    [{ case: one.caseId, kind: "story", framing: "time_order", text: "x", run: RUN, viewer: "class:ai" }, "BAD_ACCOUNT_DRAFT"],
    [{ case: one.caseId, framing: "chronological", text: "x", run: RUN, viewer: "class:ai" }, "BAD_ACCOUNT_FRAMING"],
    [{ case: one.caseId, framing: "time_order", text: "  ", run: RUN, viewer: "class:ai" }, "BAD_ACCOUNT_DRAFT"],
    [{ case: one.caseId, framing: "time_order", text: "x".repeat(8001), run: RUN, viewer: "class:ai" }, "BAD_ACCOUNT_DRAFT"],
    [{ case: one.caseId, kind: "account_check", flags: [], run: RUN, viewer: "class:ai" }, "BAD_ACCOUNT_DRAFT"],
    [{ case: one.caseId, framing: "time_order", text: "x", run: "RUN-2026-0404", viewer: "class:ai" }, "NO_SUCH_RUN"],
  ];
  for (const [a, reason] of refusals) assert.equal(w.ca.accountPropose({ proposedBy: "class:ai", ...a }).reason, reason, JSON.stringify(a));
  assert.equal(w.count("account_drafts"), before, "nothing written");
  assert.equal(w.ca.accountDrafts({ case: one.caseId, viewer: V("cy") }).reason, "NO_SUCH_CASE");
  const d1 = w.ca.accountPropose({ case: one.caseId, framing: "time_order", text: "First the award, then the minutes.",
                                   run: RUN, proposedBy: "class:ai", viewer: "class:ai" });
  assert.equal(d1.ok, true, JSON.stringify(d1));
  assert.deepEqual([d1.draft.kind, d1.draft.framing, d1.draft.label.machine_work, d1.draft.label.state], ["case_account", "time_order", true, "machine_proposed"]);
  assert.match(d1.draft.label.says, /machine work/);
  const d2 = w.ca.accountPropose({ case: one.caseId, framing: "by_rule", text: "By the rule: the award was public.", run: RUN,
                                   proposedBy: "bo", viewer: V("bo") });
  assert.deepEqual([d2.draft.label.machine_work, d2.draft.label.state], [false, "member_proposed"]);
  const list = w.ca.accountDrafts({ case: one.caseId, viewer: V("alice") });
  assert.deepEqual(list.drafts.map((d) => [d.id, d.framing]), [[d1.draft.id, "time_order"], [d2.draft.id, "by_rule"]]);
  assert.deepEqual(ACCOUNT_FRAMINGS, ["time_order", "by_question", "by_rule"]);
  /* never the account: a draft proposed is in no document */
  assert.equal(docOf(w, one).text.includes("First the award"), false);
});

test("R64 (record-grammar R52): a member writes the account from a draft — edited, its rows began_as machine_draft with the draft named and the acceptance recorded in its one shape; own_instead, her own words with the acceptance recorded; as proposed (the draft's words unchanged, or the form given) refused ACCEPT_MUST_REAUTHOR, the shared row; a draft not of this case NO_SUCH_ACCOUNT_DRAFT; negative control: from nothing, began_as member and no acceptance", () => {
  const { w, P } = setup();
  w.judgeAccount = () => ({ ok: true, refusals: [] });
  const one = published(w, P);
  const DRAFT = "The council awarded the contract on 3 March. The award followed the minutes.";
  const d = w.ca.accountPropose({ case: one.caseId, framing: "time_order", text: DRAFT, run: RUN, proposedBy: "class:ai", viewer: "class:ai" }).draft;
  const second = (over) => tried(w, () => w.publish(P, "alice", [Q2], { ...FRESH, caseId: one.caseId, ...over }));
  const before = w.count("case_documents");
  /* as proposed: the draft's own words (the form derived, or given as edited), or the form named */
  for (const accountDraft of [d.id, { draft: d.id, form: "edited" }]) {
    const { r } = second({ account: SENTENCES.slice(0, 2), accountDraft });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, ACCEPT_MUST_REAUTHOR, ACCEPT_MUST_REAUTHOR,
      SHARED_ACT_CHECKS.ACCEPT_MUST_REAUTHOR.check, SHARED_ACT_CHECKS.ACCEPT_MUST_REAUTHOR.translation], JSON.stringify(accountDraft));
  }
  assert.equal(second({ account: [{ text: "Mine.", cites: [] }], accountDraft: { draft: d.id, form: "as_proposed" } }).r.reason,
               ACCEPT_MUST_REAUTHOR, "the form named");
  assert.equal(second({ account: SENTENCES, accountDraft: "ACD-2026-0404" }).r.reason, "NO_SUCH_ACCOUNT_DRAFT");
  assert.equal(second({ accountDraft: d.id }).r.reason, "BAD_ACCOUNT", "a draft named for no account");
  assert.equal(second({ account: SENTENCES, accountDraft: { draft: d.id, form: "copied" } }).r.reason, "BAD_ACCOUNT");
  assert.equal(w.count("case_documents"), before, "nothing written");
  /* edited */
  const edited = second({ account: SENTENCES, accountDraft: d.id });
  assert.equal(edited.r.ok, true, JSON.stringify(edited.r).slice(0, 300));
  assert.deepEqual(accountOf(w.fm(edited.doc.text)).filter((x) => x.kind === "account").map((x) => [x.began_as, x.draft]),
    SENTENCES.map(() => ["machine_draft", d.id]));
  assert.deepEqual([edited.r.account.draft, edited.r.account.form], [d.id, "edited"]);
  assert.deepEqual(edited.acceptances.map((x) => [x.draft_id, x.form]), [[d.id, "edited"]]);
  assert.deepEqual(JSON.parse(edited.acceptances[0].record), { proposal: d.id, form: "edited", by: "alice", at: edited.r.at,
                                                               kind: "case_account" });
  /* own_instead: her words, not the draft's */
  const own = second({ account: SENTENCES, accountDraft: { draft: d.id, form: "own_instead" } });
  assert.equal(own.r.ok, true, JSON.stringify(own.r).slice(0, 300));
  assert.deepEqual(accountOf(w.fm(own.doc.text)).filter((x) => x.kind === "account").map((x) => [x.began_as, x.draft]),
    SENTENCES.map(() => ["member", null]));
  assert.deepEqual(own.acceptances.map((x) => x.form), ["own_instead"]);
  /* negative control: from nothing */
  const mine = second({ account: SENTENCES });
  assert.deepEqual([mine.r.ok, mine.acceptances.length], [true, 0]);
  assert.deepEqual(accountOf(w.fm(mine.doc.text)).filter((x) => x.kind === "account").map((x) => x.began_as), SENTENCES.map(() => "member"));
});

test("R64, R8 (K2540): a first edition's account is drafted on its unsigned preparation and taken up by preparing it again, which replaces the preparation; negative control: a case with neither preparation nor publication has no drafts (NO_SUCH_CASE)", () => {
  const { w, P } = setup();
  w.judgeAccount = () => ({ ok: true, refusals: [] });
  assert.equal(w.ca.accountPropose({ case: "CASE-2026-0001", framing: "time_order", text: "x", run: RUN, proposedBy: "class:ai",
                                     viewer: "class:ai" }).reason, "NO_SUCH_CASE");
  const first = w.publish(P, "alice", [Q]);
  const d = w.ca.accountPropose({ case: first.caseId, framing: "time_order", text: "A draft of what happened.", run: RUN,
                                  proposedBy: "class:ai", viewer: "class:ai" });
  assert.equal(d.ok, true, JSON.stringify(d));
  const again = w.publish(P, "alice", [Q], { account: SENTENCES, accountDraft: d.draft.id });
  assert.deepEqual([again.ok, again.caseId, again.edition, again.account.form], [true, first.caseId, 1, "edited"],
                   JSON.stringify(again).slice(0, 300));
  assert.equal(w.count("case_documents"), 1, "the preparation replaced");
  assert.deepEqual(accountOf(w.fm(docOf(w, again).text)).filter((x) => x.kind === "account").map((x) => x.draft),
                   SENTENCES.map(() => d.draft.id));
});

test("R64, R63 (K2536): accountPropose takes kind account_check with flags in place of text, labelled machine work and listed; publishCase hands R30 the flags of every account_check draft proposed after the account draft it names, or all of them with none named, in proposal order", () => {
  const { w, P } = setup();
  w.judgeAccount = () => ({ ok: true, refusals: [] });
  const one = published(w, P);
  const flag = (text) => w.ca.accountPropose({ case: one.caseId, kind: "account_check", run: RUN, proposedBy: "class:ai",
    viewer: "class:ai", flags: [{ ord: 1, text, cites: [] }] });
  const f1 = flag("The date is not in what this sentence cites.");
  assert.deepEqual([f1.ok, f1.draft.kind, f1.draft.text, f1.draft.label.machine_work], [true, "account_check", null, true]);
  const d = w.ca.accountPropose({ case: one.caseId, framing: "by_question", text: "A draft.", run: RUN, proposedBy: "class:ai",
                                  viewer: "class:ai" }).draft;
  flag("The award date is not cited.");
  assert.deepEqual(w.ca.accountDrafts({ case: one.caseId, viewer: V("alice") }).drafts.map((x) => x.kind),
                   ["account_check", "case_account", "account_check"]);
  const second = (over) => tried(w, () => w.publish(P, "alice", [Q2], { ...FRESH, caseId: one.caseId, account: SENTENCES, ...over })).r;
  assert.equal(second({}).ok, true);
  assert.deepEqual(w.judged.at(-1).flags.map((x) => x.text), ["The date is not in what this sentence cites.", "The award date is not cited."],
                   "with none named, all of them");
  assert.equal(second({ accountDraft: d.id }).ok, true);
  assert.deepEqual(w.judged.at(-1).flags, [{ kind: "account_check", ord: 1, text: "The award date is not cited.", cites: [] }],
                   "only those after the draft named");
});

/* ---------------------------------------------------------------- R65 */

test("R65 (D57, D63): the authored fields are exactly the four statements, the scope, the bias acknowledgement and the account; any other field is refused CASE_FIELD_NOT_ALLOWED naming it, after R3's other refusals and before anything is read, through the op as directly; a field sent undefined is no field; negative control: every known field publishes", async () => {
  const { w, P } = setup();
  assert.deepEqual(AUTHORED_FIELDS, ["statement", "subjectJustification", "excluded", "whatChanged", "scope", "biasAcknowledgement",
                                     "account", "statementCites"]);
  const before = w.count("case_documents");
  const r = w.publish(P, "alice", [Q], { story: "It began on a rainy morning.", humanInterest: "her family" });
  assert.deepEqual([r.ok, r.reason, r.fields], [false, "CASE_FIELD_NOT_ALLOWED", ["humanInterest", "story"]]);
  assert.match(r.detail, /humanInterest, story: a case carries no field of that name/);
  /* R3's own refusals come first */
  assert.equal(w.publish(P, "alice", [Q], { story: "x", statement: "" }).reason, "NO_STATEMENT");
  /* through the op: a body's field is the caller's, refused alike */
  const url = new URL(`http://do/publishcase?author=alice&viewer=${encodeURIComponent(V("alice"))}&project=${P}`);
  const viaOp = await caseAuthoringOps(w.ca, url, { ...AUTHORED, targets: [Q], roles: { [Q]: "load_bearing" }, context: "x" }).publishcase();
  assert.deepEqual([viaOp.reason, viaOp.fields], ["CASE_FIELD_NOT_ALLOWED", ["context"]]);
  assert.equal(w.count("case_documents"), before, "nothing written");
  /* undefined is no field; every known field is accepted */
  assert.equal(w.publish(P, "alice", [Q], { story: undefined }).ok, true);
  const known = new Set([...AUTHORED_FIELDS, ...ACT_FIELDS]);
  for (const k of ["tieAttested", "peopleBases", "calculationsDisclosed", "tensionsDisclosed", "selfAttested", "flagsDisclosed",
                   "accountDraft", "reviewComments", "statementCites", "subjectPosition"]) assert.ok(known.has(k), k);
});

/* ---------------------------------------------------------------- R66 */

test("R66 (D61; K2483): with no reader registered no comment travels and the count left out is stated undetermined; review's reader, registered once, is asked {case, edition, viewer, draft}; the chosen comments go into case-grammar R25's block and the body, the count left out stated; an objection not chosen does not travel; refusals REVIEW_COMMENT_NOT_FOUND, REVIEW_COMMENTS_UNREAD, BAD_REVIEW_COMMENTS write nothing; a second registration REVIEW_COMMENTS_DECLARED", () => {
  const { w, P } = setup();
  const act = (over) => tried(w, () => w.publish(P, "alice", [Q], over));
  const none = act({ reviewComments: { included: ["RVC-1"] } });
  assert.equal(none.r.ok, true, JSON.stringify(none.r).slice(0, 300));
  assert.deepEqual(reviewCommentsOf(w.fm(none.doc.text)), { comments: [], left_out: null });
  assert.match(none.doc.text, /How many comments were left out is undetermined/);
  /* review's reader (its R33), a stand-in */
  const asked = [];
  const ROWS = [{ comment_id: "RVC-1", draft_id: "DRAFT-1", reviewer: "bo", reviewer_kind: "member", text: "The dates hold.", at: "2026-09-27T10:00:00Z" },
                { comment_id: "RVC-2", draft_id: "DRAFT-1", reviewer: "the auditor", reviewer_kind: "recipient", text: "I object to the scope.", at: "2026-09-27T11:00:00Z" },
                { comment_id: "RVC-3", draft_id: "DRAFT-1", reviewer: "cy", reviewer_kind: "member", text: "Fine.", at: "2026-09-27T12:00:00Z" }];
  let answer = () => ROWS;
  assert.equal(w.ca.registerReviewComments((a) => { asked.push(a); return answer(); }).ok, true);
  assert.equal(w.ca.registerReviewComments(() => []).reason, "REVIEW_COMMENTS_DECLARED");
  assert.equal(setup().w.ca.registerReviewComments("not a function").reason, "MALFORMED");
  const before = w.count("case_documents");
  assert.deepEqual([act({ reviewComments: { included: ["RVC-9"] } }).r.reason, act({ reviewComments: ["RVC-1"] }).r.reason,
                    act({ reviewComments: { included: [""] } }).r.reason],
                   ["REVIEW_COMMENT_NOT_FOUND", "BAD_REVIEW_COMMENTS", "BAD_REVIEW_COMMENTS"]);
  answer = () => { throw new Error("down"); };
  assert.equal(act({ reviewComments: { included: ["RVC-1"] } }).r.reason, "REVIEW_COMMENTS_UNREAD");
  assert.equal(w.count("case_documents"), before, "nothing written");
  /* unread with nothing chosen: no comment, the count undetermined, the act goes on */
  const quiet = act({});
  assert.deepEqual([quiet.r.ok, reviewCommentsOf(w.fm(quiet.doc.text)).left_out], [true, null]);
  answer = () => ROWS;
  const { r, doc } = act({ reviewComments: { included: ["RVC-3", "RVC-1"] } });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(asked.at(-1), { case: r.caseId, edition: 1, viewer: V("alice"), draft: null });
  assert.deepEqual(reviewCommentsOf(w.fm(doc.text)), { comments: [{ reviewer: "bo", text: "The dates hold.", at: "2026-09-27T10:00:00Z" },
                                                                  { reviewer: "cy", text: "Fine.", at: "2026-09-27T12:00:00Z" }], left_out: 1 });
  assert.equal(doc.text.includes("I object to the scope."), false, "an objection not chosen does not travel");
  assert.match(doc.text, /## What Reviewers Said[\s\S]*- bo, on 2026-09-27T10:00:00Z: The dates hold\.[\s\S]*1 comment was left out\./);
  assert.deepEqual(r.review_comments, { included: 2, left_out: 1 });
  /* a list cut at its bound: the count left out is undetermined */
  answer = () => ({ comments: [ROWS[0]], truncated: true });
  assert.equal(reviewCommentsOf(w.fm(act({ reviewComments: { included: ["RVC-1"] } }).doc.text)).left_out, null);
});

/* ---------------------------------------------------------------- R67, R68 */

test("R67 (D56): the pre-flight's step \"the account\" gives each sentence with its citations, its check result (the codes case-disclosures R30 names it under, else passed) and, for a sentence begun from a system draft, the draft and its framing; negative control: refused before the account is read, the step says not reached", () => {
  const { w, P } = setup();
  const one = published(w, P);
  const d = w.ca.accountPropose({ case: one.caseId, framing: "by_question", text: "Draft words.", run: RUN, proposedBy: "class:ai",
                                  viewer: "class:ai" }).draft;
  w.judgeAccount = () => ({ ok: true, refusals: [] });
  const args = { ...AUTHORED, ...FRESH, tieAttested: true, project: P, targets: [Q2], roles: { [Q2]: "load_bearing" }, caseId: one.caseId,
                 viewer: V("alice"), author: "alice", account: SENTENCES, accountDraft: d.id };
  const pre = w.ca.publishPreflight(args);
  const step = pre.steps.find((x) => x.name === "the account");
  assert.equal(step.step, 6);
  assert.deepEqual(step.sentences.filter((x) => x.kind === "account").map((x) => [x.ord, x.text, x.cites.length, x.result, x.draft, x.framing]),
    SENTENCES.map((x, i) => [i + 1, x.text, x.cites.length, "passed", d.id, "by_question"]));
  assert.deepEqual(step.sentences.filter((x) => x.kind !== "account").map((x) => x.kind),
                   ["statement", "subject_justification", "excluded", "what_changed"]);
  /* each sentence's codes, as R30 names it */
  w.judgeAccount = () => ({ ok: true, refusals: [{ ok: false, reason: "ACCOUNT_CLAIM_NOT_BIAS", code: "ACCOUNT_CLAIM_NOT_BIAS", sentences: [{ ord: 3 }] }] });
  const flagged = w.ca.publishPreflight(args).steps.find((x) => x.name === "the account");
  assert.deepEqual(flagged.sentences.slice(0, 3).map((x) => x.result), ["passed", "passed", ["ACCOUNT_CLAIM_NOT_BIAS"]]);
  /* refused before any member is read */
  const no = w.ca.publishPreflight({ ...args, project: "PROJ-2026-9999-none" });
  assert.match(no.steps.find((x) => x.name === "the account").stated, /^not reached/);
});

test("R68 (D60; K2528, K2533): publishCase writes case-grammar R26's block — the rule in force and the approvals held for the document's approval digest, read through ratification.approvalsInForce — and the pre-flight's approvals step lists those required and given and APPROVAL_MISSING among blockers while any is missing (once, whoever reads it); the digest is the same before and after the block; negative controls: no rule, no block and nothing asked; approvals unreadable is itself a blocker", () => {
  let rule = null, given = [], unreadable = false, ratifyRefusals = [];
  const digests = [];
  const ratWrap = (r) => new Proxy(r, { get: (t, p) => (p === "approvalsInForce"
    ? ({ docSha }) => { digests.push(docSha); if (unreadable) return { ok: false };
                        const missing = rule ? rule.approvers.filter((m) => !given.some((g) => g.by === m)) : [];
                        return { rule, approvals: given, missing }; }
    : p === "caseRatifyPreflight" ? () => ({ ok: true, ready: !ratifyRefusals.length, refusals: ratifyRefusals })
    : typeof t[p] === "function" ? t[p].bind(t) : t[p]) });
  const { w, P } = setup({ ratification: ratWrap });
  const args = { ...AUTHORED, project: P, targets: [Q], roles: { [Q]: "load_bearing" }, viewer: V("alice"), author: "alice" };
  /* no rule: no block, nothing missing, ready */
  const plain = tried(w, () => w.publish(P, "alice", [Q]));
  assert.equal(approvalsOf(w.fm(plain.doc.text)), null);
  assert.equal("approvals" in plain.r, false);
  const ok = w.ca.publishPreflight(args);
  assert.deepEqual([ok.ready, ok.steps.find((x) => x.name === "approvals").required], [true, []]);
  /* a rule naming bo and cy, bo's approval held */
  rule = { approvers: ["bo", "cy"], set_by: "root", set_at: "2026-09-26T00:00:00Z" };
  given = [{ by: "bo", at: "2026-09-27T09:00:00Z" }];
  const { r, doc: stored } = tried(w, () => w.publish(P, "alice", [Q]));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const doc = stored.text;
  assert.deepEqual(approvalsOf(w.fm(doc)), { rule, approvals: given });
  assert.deepEqual(r.approvals, { rule, given, missing: ["cy"] });
  assert.equal(digests.at(-1), approvalSubjectSha(doc), "the digest asked is the document's own, without the block");
  assert.notEqual(digests.at(-1), stored.doc_sha);
  const pre = w.ca.publishPreflight(args);
  const step = pre.steps.find((x) => x.name === "approvals");
  assert.deepEqual([step.required, step.given, step.missing], [["bo", "cy"], given, ["cy"]]);
  assert.match(step.says, /prepared again/);
  assert.deepEqual(pre.blockers.filter((b) => b.reason === "APPROVAL_MISSING").map((b) => b.missing), [["cy"]]);
  assert.equal(pre.ready, false);
  /* ratification's list carrying it: listed once, as ratification answers it */
  ratifyRefusals = [{ ok: false, reason: "APPROVAL_MISSING", code: "APPROVAL_MISSING", check: "C-58.11", missing: ["cy"] }];
  assert.deepEqual(w.ca.publishPreflight(args).blockers.filter((b) => b.reason === "APPROVAL_MISSING"), ratifyRefusals);
  ratifyRefusals = [];
  /* every approval given: nothing missing */
  given = [{ by: "bo", at: "2026-09-27T09:00:00Z" }, { by: "cy", at: "2026-09-27T09:30:00Z" }];
  assert.deepEqual(w.ca.publishPreflight(args).blockers.filter((b) => b.reason === "APPROVAL_MISSING"), []);
  /* unreadable: a blocker, and no block */
  unreadable = true;
  const un = w.ca.publishPreflight(args);
  assert.deepEqual(un.blockers.filter((b) => b.reason === "APPROVAL_MISSING").map((b) => b.missing), [null]);
  assert.match(un.steps.find((x) => x.name === "approvals").stated, /could not be read/);
});

test("R68 (K2548): against the real ratification, an approval reader registered as review registers it (ratification R50) is read through approvalsInForce at the document's approval digest: the rule written into R26's block, the missing approver named in the approvals step and APPROVAL_MISSING among blockers; negative control: once given at that digest, nothing missing", () => {
  const { w, P } = setup();
  const given = [];
  assert.equal(w.ratification.registerApprovalReader({ rule: () => ({ approvers: ["bo"], set_by: "root", set_at: "2026-09-26T00:00:00Z" }),
    approvals: ({ docSha }) => given.filter((g) => g.docSha === docSha).map(({ by, at }) => ({ by, at })) }).ok, true);
  const args = { ...AUTHORED, project: P, targets: [Q], roles: { [Q]: "load_bearing" }, viewer: V("alice"), author: "alice" };
  /* prepared for real, so the pre-flight below prepares this same case edition again (R8, K2540) and its digest */
  const r = w.publish(P, "alice", [Q]);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const first = { doc: docOf(w, r) };
  assert.deepEqual(approvalsOf(w.fm(first.doc.text)).rule.approvers, ["bo"]);
  const pre = w.ca.publishPreflight(args);
  assert.deepEqual(pre.steps.find((x) => x.name === "approvals").missing, ["bo"]);
  assert.equal(pre.blockers.filter((b) => b.reason === "APPROVAL_MISSING").length, 1);
  /* bo approves this version (its approval digest): nothing is missing */
  given.push({ docSha: approvalSubjectSha(first.doc.text), by: "bo", at: "2026-09-27T09:00:00Z" });
  const after = w.ca.publishPreflight(args);
  assert.deepEqual(after.steps.find((x) => x.name === "approvals").missing, []);
  assert.deepEqual(after.steps.find((x) => x.name === "approvals").given.map((g) => g.by), ["bo"]);
});
