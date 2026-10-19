/* case-account T51 (N1223; DEC-327; the words rule, K3930; setup-words R13, R14): R17, the member-facing sentences by key.
   Each listed refusal answers `word` of its key with its fills, the signed reviewers' section is byte-identical to what
   every earlier edition was signed with (K1333), and the module's source answers no sentence of its own but its two
   start-up wiring errors. Each with its negative control (K874). A test here never holds a sentence's text. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { world, V } from "./fixture.mjs";
import { accountShaped, reviewCommentBodyLines, REVIEW_COMMENTS_INCLUDED_MAX, ACCOUNT_SENTENCES_MAX, ACCOUNT_CITES_MAX,
         COMPLETENESS_MAX } from "../../../src/case-account/index.mjs";
import { word, hasWord } from "../../../src/setup-words/index.mjs";

const Q = "INQ-2026-0001-q", DOC = "INFO-2026-0001-a", RUN = "RUN-2026-0001", CASE = "CASE-2026-0001", AI = "class:ai";
const SRC = join(dirname(fileURLToPath(import.meta.url)), "../../../src/case-account");

/* every key R17 names */
const KEYS = ["refusal.BAD_ACCOUNT.list", "refusal.BAD_ACCOUNT.toomany", "refusal.BAD_ACCOUNT.sentence", "refusal.BAD_ACCOUNT.extra",
  "refusal.BAD_ACCOUNT.text", "refusal.BAD_ACCOUNT.cites", "refusal.BAD_ACCOUNT.bias", "refusal.BAD_STATEMENT_CITES",
  "refusal.BAD_STATEMENT_CITES.nostatement", "refusal.BAD_STATEMENT_CITES.excluded", "refusal.BAD_STATEMENT_CITES.citelist",
  "refusal.ACCEPT_MUST_REAUTHOR.account", "refusal.ACCOUNT_CITES_COUNSEL_MATTER.sentence", "refusal.ACCOUNT_CHECK_UNDETERMINED",
  "refusal.MACHINE_CANNOT_CHECK_ADVOCACY", "refusal.ADVOCACY_NOT_OWN_PROJECT", "refusal.BAD_REVIEW_COMMENTS",
  "refusal.REVIEW_COMMENTS_UNREAD", "refusal.REVIEW_COMMENT_NOT_FOUND", "refusal.NO_SUCH_CASE", "refusal.NO_SUCH_RUN"];

function setup() {
  const w = world();
  for (const m of ["alice", "bo"]) w.member(m);
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  w.join(P, "bo");
  w.runs.set(RUN, { status: "running" });
  w.published(CASE, P);
  const MINE = w.project("Mine", "alice");
  w.scope(MINE, "own");
  return { w, P, MINE };
}

test("R17 (DEC-327): every key it names is held by the list, and the account's shape refuses in the key's words with the sentence's number and the bounds filled; control: a well-formed account and statement cites are no refusal", () => {
  for (const k of KEYS) assert.equal(hasWord(k), true, k);
  const s = (o) => ({ text: "A.", cites: [], ...o });
  const said = (account, sc, count = 1) => accountShaped(account, sc, count).detail;
  assert.equal(said("x"), word("refusal.BAD_ACCOUNT.list"));
  assert.equal(said(Array.from({ length: ACCOUNT_SENTENCES_MAX + 1 }, () => s())), word("refusal.BAD_ACCOUNT.toomany", { max: String(ACCOUNT_SENTENCES_MAX) }));
  assert.equal(said([s(), null]), word("refusal.BAD_ACCOUNT.sentence", { n: "2" }));
  assert.equal(said([s(), s({ context: "x" })]), word("refusal.BAD_ACCOUNT.extra", { n: "2" }));
  assert.equal(said([s({ text: " " })]), word("refusal.BAD_ACCOUNT.text", { n: "1", max: String(COMPLETENESS_MAX) }));
  assert.equal(said([s(), s(), s({ cites: "Q" })]), word("refusal.BAD_ACCOUNT.cites", { n: "3", max: String(ACCOUNT_CITES_MAX) }));
  assert.equal(said([s({ bias_statement: "a\nb" })]), word("refusal.BAD_ACCOUNT.bias", { n: "1" }));
  assert.equal(said(null, []), word("refusal.BAD_STATEMENT_CITES"));
  assert.equal(said(null, { story: [] }), word("refusal.BAD_STATEMENT_CITES.nostatement", { part: "story" }));
  assert.equal(said(null, { excluded: "x" }), word("refusal.BAD_STATEMENT_CITES.excluded"));
  assert.equal(said(null, { excluded: [[], []] }), word("refusal.BAD_STATEMENT_CITES.excluded"));
  assert.equal(said(null, { what_changed: "Q" }), word("refusal.BAD_STATEMENT_CITES.citelist", { part: "what changed" }));
  assert.equal(said(null, { excluded: [[{ kind: "rumour", ref: Q }]] }), word("refusal.BAD_STATEMENT_CITES.citelist", { part: "excluded" }));
  assert.equal(accountShaped([s()], { statement: [{ kind: "finding", ref: Q }] }).ok, true, "control: well-formed");
});

test("R17 (DEC-327): the drafts and the judgment refuse in the key's words — NO_SUCH_CASE, NO_SUCH_RUN, ACCEPT_MUST_REAUTHOR, ACCOUNT_CHECK_UNDETERMINED (a throw's diagnostic is not in them); control: a draft that exists and a judgment that answers are no refusal", () => {
  const { w } = setup();
  const propose = (a) => w.cacc.accountPropose({ case: CASE, framing: "time_order", text: "First the award.", run: RUN, proposedBy: AI, viewer: AI, ...a });
  assert.equal(propose({ case: "CASE-2026-9999" }).detail, word("refusal.NO_SUCH_CASE"));
  assert.equal(w.cacc.accountDrafts({ case: "CASE-2026-9999", viewer: V("alice") }).detail, word("refusal.NO_SUCH_CASE"));
  assert.equal(propose({ run: "RUN-2026-0404" }).detail, word("refusal.NO_SUCH_RUN"));
  const d = propose({}).draft;
  assert.equal(propose({}).ok, true, "control: the run exists");
  assert.equal(w.cacc.accountDraftJudged(d.id, CASE, [{ text: "First the award.", cites: [] }]).detail,
               word("refusal.ACCEPT_MUST_REAUTHOR.account"));
  assert.equal(w.cacc.accountDraftJudged(d.id, CASE, [{ text: "The award came first.", cites: [] }]).ok, true, "control: edited words are taken up");
  const args = { sentences: [{ text: "A.", cites: [], bias_statement: null }], statementCites: null, drafted: null, statement: null,
                 justification: null, excluded: [], changed: null, prepared: [], reached: null, lens: null, caseId: CASE, viewer: V("alice") };
  w.judgeAccount = () => { throw new Error("down"); };
  assert.equal(w.cacc.accountJudged(args).refusal.detail, word("refusal.ACCOUNT_CHECK_UNDETERMINED"));
  w.judgeAccount = () => ({ ok: true, refusals: [] });
  assert.equal(w.cacc.accountJudged(args).refusal, null, "control: an answered judgment is no refusal");
});

test("R17 (DEC-327): the reviewers' comments and a member's own text refuse in the key's words — BAD_REVIEW_COMMENTS with the bound, REVIEW_COMMENTS_UNREAD, REVIEW_COMMENT_NOT_FOUND, MACHINE_CANNOT_CHECK_ADVOCACY, ADVOCACY_NOT_OWN_PROJECT; control: the same acts well-formed answer ok", () => {
  const { w, P, MINE } = setup();
  let read = () => [{ comment_id: "RVC-1", reviewer: "bo", text: "Fine.", at: "2026-09-27T10:00:00Z" }];
  w.cacc.registerReviewComments(() => read());
  const chosen = (rc) => w.cacc.reviewCommentsChosen(rc, CASE, 2, V("alice"), null);
  assert.equal(chosen({ included: "x" }).detail, word("refusal.BAD_REVIEW_COMMENTS", { max: String(REVIEW_COMMENTS_INCLUDED_MAX) }));
  assert.equal(chosen({ included: ["RVC-9"] }).detail, word("refusal.REVIEW_COMMENT_NOT_FOUND"));
  assert.equal(chosen({ included: ["RVC-1"] }).ok, true, "control: a found id is carried");
  read = () => null;
  assert.equal(chosen({ included: ["RVC-1"] }).detail, word("refusal.REVIEW_COMMENTS_UNREAD"));
  const text = [{ text: "The council met.", cites: [] }];
  assert.equal(w.cacc.advocacyCheck({ author: null, project: MINE, sentences: text, viewer: V("alice") }).detail,
               word("refusal.MACHINE_CANNOT_CHECK_ADVOCACY"));
  assert.equal(w.cacc.advocacyCheck({ author: V("alice"), project: P, sentences: text, viewer: V("alice") }).detail,
               word("refusal.ADVOCACY_NOT_OWN_PROJECT"));
  assert.equal(w.cacc.advocacyCheck({ author: V("alice"), project: MINE, sentences: text, viewer: V("alice") }).ok, true, "control: her own project");
});

test("R17 (DEC-327; K1333) the signed reviewers' section is byte-identical to what every earlier edition was signed with: its SHA-256 for each case is recorded and never regenerated, the left-out count and the two placeholders read from their frozen rows; control: a changed byte changes the digest", () => {
  const digest = (given) => createHash("sha256").update(reviewCommentBodyLines(given).join("\n")).digest("hex");
  assert.equal(digest({ comments: [{ reviewer: "bo", text: "The dates\nhold.", at: "2026-09-27T10:00:00Z" }, { reviewer: null, text: "Fine.", at: null }], left_out: 1 }),
               "d93104f663ba5510b6f475ed87c67538d85dc35cb12d8f6961f73f649cc750b4", "one left out, both placeholders");
  assert.equal(digest({ comments: [{ reviewer: "the auditor", text: "I object to the scope.", at: "2026-09-27T11:00:00Z" }], left_out: 3 }),
               "401e3de30c16e395597c9107b089e7abd3cbe769e1891f8a9d2844cf2b88eaef", "several left out");
  assert.equal(digest({ comments: [], left_out: 0 }), "7aba3b80f7e2a65f6384e39750a12d1070c618f467fafdae5603b8ca0ce8dc3f", "none carried, none left out");
  assert.equal(digest({ comments: [], left_out: null }), "b0d3c1212665ee35d202f0e1e0cdb20197746cabdf33e3b5ce46cbd794c32588", "count undetermined");
  assert.notEqual(digest({ comments: [], left_out: 2 }), digest({ comments: [], left_out: 3 }), "control: the count is in the digest");
  /* the frozen rows are the signed bytes' words */
  for (const k of ["case-account.document.left_out.one", "case-account.document.left_out.other", "case-account.document.reviewer.unknown",
                   "case-account.document.date.unknown"]) assert.equal(hasWord(k), true, k);
});

test("R17 (DEC-327) control: no refusal here answers a sentence of its own but the two start-up wiring errors (MALFORMED, REVIEW_COMMENTS_DECLARED) — every `detail:` in the source is read by `word` or `localize`, a scan; negative control: the scan sees a planted sentence", () => {
  const spoken = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
  const literals = (t) => [...spoken(t).matchAll(/\bdetail:\s*(["'`])/g)].length;
  const index = readFileSync(join(SRC, "index.mjs"), "utf8");
  assert.equal(literals(index), 2, "the two inline wiring errors");
  assert.equal(literals(readFileSync(join(SRC, "checks.mjs"), "utf8")), 0);
  assert.equal(literals(`${index}\nconst r = { detail: "a sentence of its own" };`), 3, "negative control: a planted sentence is seen");
});
