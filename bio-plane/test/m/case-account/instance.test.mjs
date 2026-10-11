/* case-account: the instance (R12; K61), its tables' purge declaration (R8; K23) and its outward words (R11), driven at
   the module's interface: `caseAccountOf`, `caseAccountOwns`, record-core's `declaredTables` and `purge`, and every
   service's answer. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, T0 } from "./fixture.mjs";
import { CaseAccount, caseAccountOf, caseAccountOwns, CASE_ACCOUNT_TABLES, CASE_ACCOUNT_SCHEMA, reviewCommentBodyLines }
  from "../../../src/case-account/index.mjs";
import { inquiryOf } from "../../../src/inquiry/index.mjs";
import { caseDisclosuresOf } from "../../../src/case-disclosures/index.mjs";
import { projectRosterOf } from "../../../src/project-roster/index.mjs";
import { basisVersionsOf } from "../../../src/basis-versions/index.mjs";
import { checkAccount } from "../../../src/case-checker/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q", RUN = "RUN-2026-0001", CASE = "CASE-2026-0001";
const AI = "class:ai";

function setup(opts) {
  const w = world(opts);
  for (const m of ["alice", "bo"]) w.member(m);
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  w.runs.set(RUN, { status: "running" });
  w.published(CASE, P);
  return { w, P };
}

test("R12 (K61): caseAccountOf answers the one instance for a host, every caller for the same host the same one, another host its own; deps not given are reached lazily on the host (inquiry, case-disclosures, membership, and since T45 project-roster, basis-versions and case-checker's checkAccount)", () => {
  const { w } = setup();
  assert.equal(caseAccountOf(w.host), w.cacc);
  assert.equal(caseAccountOf(w.host, { runs: null }), w.cacc, "later deps change nothing");
  const other = world();
  assert.notEqual(other.cacc, w.cacc);
  /* lazily reached: a host given no deps reaches the one instance of each on that host */
  const bare = world({ create: false });
  const c = caseAccountOf(bare.host);
  assert.equal(c.inquiry, inquiryOf(bare.host));
  assert.equal(c.disclosures, caseDisclosuresOf(bare.host));
  assert.equal(c.membership, bare.membership);
  assert.equal(c.record, bare.record);
  assert.equal(c.roster, projectRosterOf(bare.host));
  assert.equal(c.versions, basisVersionsOf(bare.host));
  assert.equal(c.checker.checkAccount, checkAccount);
});

test("R12, R8, R13: at its creation it creates account_drafts and account_acceptances with case-authoring's DDL (CREATE TABLE IF NOT EXISTS), so a running store's drafts and acceptances are kept with no data move, and (T45) advocacy_checks, and declares all three whole to record-core's purge under case-account (R13: the advocacy checks as working material, R8's form); a whole-store purge clears them; caseAccountOwns names them; negative control: a host that never creates it holds neither table nor declaration", () => {
  const w = world({ create: false });
  assert.equal(w.row(`SELECT name FROM sqlite_master WHERE name='account_drafts'`), null);
  assert.deepEqual(w.record.declaredTables().filter((d) => /^account_/.test(d.name)), [], "not declared before creation");
  /* a running store: the tables as case-authoring created them, with rows */
  for (const s of CASE_ACCOUNT_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";"))
    if (s.trim()) w.st.db.exec(s);
  w.st.sql.exec(`INSERT INTO account_drafts (draft_id, case_id, kind, framing, text, run, label, at)
                 VALUES ('ACD-2026-0042', ?, 'case_account', 'by_rule', 'Old.', ?, '{}', ?)`, CASE, RUN, T0);
  w.st.sql.exec(`INSERT INTO account_acceptances (case_id, edition, draft_id, form, record, at) VALUES (?, 2, 'ACD-2026-0042', 'edited', '{}', ?)`, CASE, T0);
  const kept = w.snapshot();
  const c = caseAccountOf(w.host, w.deps);
  assert.deepEqual([kept.account_drafts, kept.account_acceptances], [w.snapshot().account_drafts, w.snapshot().account_acceptances], "kept");
  const declared = w.record.declaredTables().filter((d) => d.module === "case-account");
  assert.deepEqual(declared.map((d) => [d.name, d.purge, d.keys]), [["account_drafts", "clear", []], ["account_acceptances", "clear", []],
                                                                     ["advocacy_checks", "clear", []]]);
  assert.deepEqual(CASE_ACCOUNT_TABLES.map((t) => t.name), ["account_drafts", "account_acceptances", "advocacy_checks"]);
  assert.deepEqual(["account_drafts", { name: "account_acceptances" }, "advocacy_checks", "account_check", null, "statement_acknowledgements"].map(caseAccountOwns),
                   [true, true, true, false, false, false]);
  /* a second creation on the host creates and declares nothing again */
  assert.equal(caseAccountOf(w.host), c);
  assert.equal(w.record.declaredTables().filter((d) => d.module === "case-account").length, 3);
  /* the whole-store purge clears all three */
  w.st.sql.exec(`INSERT INTO advocacy_checks (project_id, author, sentences, result, at) VALUES ('PROJ-2026-0001-x', 'alice', '[]', '[]', ?)`, T0);
  w.record.purge();
  assert.deepEqual([w.count("account_drafts"), w.count("account_acceptances"), w.count("advocacy_checks")], [0, 0, 0]);
  /* negative control: a fresh host, never created */
  const none = world({ create: false });
  assert.equal(none.row(`SELECT name FROM sqlite_master WHERE name='account_acceptances'`), null);
});

test("R12: no service throws on another module's failed read — a run read, a basis read, a judgment, a review-comments read or publication's tables that fail are answered as R1–R7 state", () => {
  const boom = () => { throw new Error("down"); };
  const { w } = setup();
  const { w: w2 } = setup();
  /* a run read that throws: NO_SUCH_RUN */
  const runsDown = new CaseAccount({ storage: w.st, record: w.record, runs: { runFor: boom }, now: w.deps.now });
  assert.equal(runsDown.accountPropose({ case: CASE, framing: "by_rule", text: "x", run: RUN, proposedBy: AI, viewer: AI }).reason, "NO_SUCH_RUN");
  /* a basis read and a judgment that throw: no legs, no holding, ACCOUNT_CHECK_UNDETERMINED */
  const down = new CaseAccount({ storage: w.st, record: w.record, inquiry: { basisFor: boom },
    disclosures: { accountJudged: boom }, now: w.deps.now });
  const judged = down.accountJudged({ sentences: [{ text: "A.", cites: [{ kind: "leg", ref: Q, ord: 1 }] }], statementCites: null,
    statement: "S.", prepared: [{ id: Q }], reached: null, lens: null, caseId: CASE, viewer: V("alice") });
  assert.equal(judged.refusal.reason, "ACCOUNT_CHECK_UNDETERMINED");
  assert.deepEqual(down.citedFor(judged.rows, [], null, V("alice")).holdings, []);
  /* a reader that throws: REVIEW_COMMENTS_UNREAD when chosen, undetermined when not */
  down.registerReviewComments(boom);
  assert.equal(down.reviewCommentsChosen({ included: ["RVC-1"] }, CASE, 1, V("alice"), null).reason, "REVIEW_COMMENTS_UNREAD");
  assert.equal(down.reviewCommentsChosen(null, CASE, 1, V("alice"), null).left_out, null);
  /* publication's tables unreadable: NO_SUCH_CASE, as R10 answers an absent case */
  const absent = JSON.stringify(w2.cacc.accountDrafts({ case: "CASE-2026-9999", viewer: V("alice") }));
  w2.st.db.exec(`DROP TABLE cases`);
  assert.equal(JSON.stringify(w2.cacc.accountDrafts({ case: CASE, viewer: V("alice") })), absent);
  assert.equal(JSON.stringify(w2.cacc.accountPropose({ case: CASE, framing: "by_rule", text: "x", run: RUN, proposedBy: AI, viewer: AI })), absent);
  /* negative control: the same calls with the reads working */
  assert.equal(w.cacc.accountPropose({ case: CASE, framing: "by_rule", text: "x", run: RUN, proposedBy: AI, viewer: AI }).ok, true);
});

test("R11: no place is named in the module's behaviour or outward text — every answer, refusal, label, next step and body line its services give (R13's since T45) names no jurisdiction; negative control: the check finds a place name planted in an answer", () => {
  const { w, P } = setup();
  w.cacc.registerReviewComments(() => [{ comment_id: "RVC-1", reviewer: "bo", text: "Fine.", at: T0 }]);
  w.judgeAccount = () => ({ ok: true, refusals: [] });
  const d = w.cacc.accountPropose({ case: CASE, framing: "by_rule", text: "Words.", run: RUN, proposedBy: AI, viewer: AI });
  const answers = [
    d, w.cacc.accountPropose({ case: CASE, kind: "account_check", flags: [{ ord: 1, text: "Not cited.", cites: [] }], run: RUN, proposedBy: "bo", viewer: V("bo") }),
    w.cacc.accountPropose({ case: CASE, framing: "by_rule", text: "Words.", run: RUN, proposedBy: null, viewer: AI }),
    ...[{ case: "CASE-2026-9999" }, { kind: "x" }, { framing: "x" }, { run: "x" }].map((a) =>
      w.cacc.accountPropose({ case: CASE, framing: "by_rule", text: "Words.", run: RUN, proposedBy: AI, viewer: AI, ...a })),
    w.cacc.accountDrafts({ case: CASE, viewer: V("alice") }),
    w.cacc.accountDraftJudged("ACD-2026-0404", CASE, [{ text: "A." }]), w.cacc.accountDraftJudged(d.draft.id, CASE, [{ text: "Words." }]),
    w.cacc.accountDraftJudged({ draft: d.draft.id, form: "x" }, CASE, [{ text: "A." }]),
    w.cacc.accountShaped("x"), w.cacc.accountShaped(null, { x: [] }),
    w.cacc.reviewCommentsChosen({ included: ["RVC-9"] }, CASE, 1, V("alice"), null), w.cacc.reviewCommentsChosen("x", CASE, 1, V("alice"), null),
    w.cacc.registerReviewComments(() => []), w.cacc.registerReviewComments(7),
    reviewCommentBodyLines({ comments: [], left_out: 1 }), reviewCommentBodyLines({ comments: [], left_out: null }),
  ];
  /* (T45) R13's answers: each refusal, a check and the list */
  const MINE = w.project("Mine", "alice");
  w.scope(MINE, "own");
  for (const a of [{ author: null }, { project: "PROJ-2026-9999-x" }, { project: P }, { sentences: "x" }, {}])
    answers.push(w.cacc.advocacyCheck({ project: MINE, sentences: [{ text: "Mine.", cites: [] }], author: V("alice"), viewer: V("alice"), ...a }));
  answers.push(w.cacc.advocacyChecksOf({ project: MINE, viewer: V("alice") }), w.cacc.advocacyChecksOf({ project: MINE, viewer: V("bo") }));
  w.judgeAccount = () => null;
  answers.push(w.cacc.accountJudged({ sentences: [{ text: "A.", cites: [] }], caseId: CASE, prepared: [], viewer: V("alice") }));
  const PLACES = /\b(Oakland|Alameda|California|Berkeley|county of|city of)\b/i;
  const text = JSON.stringify(answers);
  assert.equal(PLACES.test(text), false, text.match(PLACES)?.[0]);
  /* negative control */
  assert.equal(PLACES.test(JSON.stringify([...answers, { detail: "the City of Oakland" }])), true);
});
