/* case-account: taking a draft up (R4), the account's shape (R5), its judgment against what it cites (R6), and the
   services' transaction (R9), ported from case-authoring's `account.test.mjs` 64–161 and 197–253 (the arms that drive
   op=publish stay there, proving its R69; `build/extraction/case-account-split.md` §6) and driven at this module's
   interface, as `publishCase` asks it. case-disclosures R30 is the real one unless a test sets `w.judgeAccount`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, sha } from "./fixture.mjs";
import { CaseAccount, accountShaped, ACCOUNT_SENTENCES_MAX, ACCOUNT_CITES_MAX, COMPLETENESS_MAX, ACCOUNT_ACCEPT_KIND }
  from "../../../src/case-account/index.mjs";
import { SHARED_ACT_CHECKS, ACCEPT_MUST_REAUTHOR, ACCEPTANCE_FORMS, acceptanceRecord } from "../../../src/record-grammar/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";
const RUN = "RUN-2026-0001", CASE = "CASE-2026-0001", OTHER = "CASE-2026-0002";
const AI = "class:ai";
const DRAFT = "The council awarded the contract on 3 March. The award followed the minutes.";
const SENTENCES = [
  { text: "The council awarded the contract on 3 March.", cites: [{ kind: "finding", ref: Q, ord: null }], bias_statement: null },
  { text: "The award followed the minutes.", cites: [{ kind: "leg", ref: Q, ord: 1 }], bias_statement: null },
  { text: "We read the minutes as the authoritative account.", cites: [], bias_statement: "s1" },
];
const NONE = { statement: [], subject_justification: [], excluded: [], what_changed: [] };

function setup(opts) {
  const w = world(opts);
  for (const m of ["alice", "bo", "cy"]) w.member(m);
  w.doc(DOC, `bytes of ${DOC}`, { units: ["The council met on 3 March.", "It awarded the contract."] });
  w.finding(Q, [{ target: DOC }]);
  w.finding(Q2, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q, Q2]);
  w.join(P, "bo");
  w.runs.set(RUN, { status: "running" });
  w.published(CASE, P);
  w.published(OTHER, P);
  const draft = (text = DRAFT, c = CASE) => w.cacc.accountPropose({ case: c, framing: "time_order", text, run: RUN, proposedBy: AI,
                                                                    viewer: AI }).draft;
  return { w, P, draft };
}
/* what publishCase hands R6, as case-authoring R63 reads it */
const prepared = [{ id: Q, conclusion: { claim: { text: "the award followed the minutes", state: "concluded" } } }];
const judgeArgs = (over = {}) => ({ sentences: SENTENCES, statementCites: NONE, drafted: null, statement: "It covers the award.",
  justification: "The award is public.", excluded: [], changed: null, prepared, reached: { materials: [] }, lens: { in_force: false },
  caseId: CASE, viewer: V("alice"), ...over });

/* ---------------------------------------------------------------- R4 */

test("R4 (D56; record-grammar R52): accountDraftJudged reads the draft an account began as — none named answers nulls; an id or {draft, form} answers {ok, draft, framing, form}, the form own_instead when given so, edited when the words changed, else the form given; it writes nothing", () => {
  const { w, draft } = setup();
  const d = draft();
  const snap = w.snapshot();
  for (const none of [null, undefined, ""]) assert.deepEqual(w.cacc.accountDraftJudged(none, CASE, SENTENCES),
                                                               { ok: true, draft: null, framing: null, form: null });
  assert.deepEqual(w.cacc.accountDraftJudged(d.id, CASE, SENTENCES), { ok: true, draft: d.id, framing: "time_order", form: "edited" });
  assert.deepEqual(w.cacc.accountDraftJudged(` ${d.id} `, CASE, SENTENCES).draft, d.id);
  assert.deepEqual(w.cacc.accountDraftJudged({ draft: d.id, form: "own_instead" }, CASE, SENTENCES).form, "own_instead");
  /* own_instead even when the words are the draft's: she says they are her own */
  assert.equal(w.cacc.accountDraftJudged({ draft: d.id, form: "own_instead" }, CASE, [{ text: DRAFT, cites: [] }]).form, "own_instead");
  assert.equal(w.cacc.accountDraftJudged({ draft: d.id, form: "edited" }, CASE, SENTENCES).form, "edited");
  for (const form of ACCEPTANCE_FORMS.filter((f) => !["as_proposed", "own_instead", "edited"].includes(f)))
    assert.equal(w.cacc.accountDraftJudged({ draft: d.id, form }, CASE, SENTENCES).form, form);
  assert.deepEqual(w.snapshot(), snap, "writes nothing");
});

test("R4: refusals in order, each writing nothing — BAD_ACCOUNT naming the field (a name not a non-blank string, a form not one of ACCEPTANCE_FORMS, a draft named for an act that writes no account), NO_SUCH_ACCOUNT_DRAFT (not a case_account draft of this case), ACCEPT_MUST_REAUTHOR as record-grammar's one shared row (the words unchanged, white space aside, or the form as_proposed given); negative control: edited words are taken up", () => {
  const { w, draft } = setup();
  const d = draft();
  const other = draft("Another case's draft.", OTHER);
  const check = w.cacc.accountPropose({ case: CASE, kind: "account_check", run: RUN, proposedBy: AI, viewer: AI,
                                        flags: [{ ord: 1, text: "Not cited.", cites: [] }] }).draft;
  const snap = w.snapshot();
  const bad = [
    [{ draft: "" }, SENTENCES, "accountDraft"], [{ draft: 7 }, SENTENCES, "accountDraft"], [["x"], SENTENCES, "accountDraft"],
    [{ form: "edited" }, SENTENCES, "accountDraft"],
    [{ draft: d.id, form: "copied" }, SENTENCES, "accountDraft.form"],
    [d.id, [], "accountDraft"], [{ draft: d.id, form: "copied" }, [], "accountDraft.form"],
  ];
  for (const [named, sentences, field] of bad) {
    const r = w.cacc.accountDraftJudged(named, CASE, sentences);
    assert.deepEqual([r.ok, r.reason, r.field], [false, "BAD_ACCOUNT", field], JSON.stringify(named));
  }
  for (const named of ["ACD-2026-0404", other.id, check.id]) {
    const r = w.cacc.accountDraftJudged(named, CASE, SENTENCES);
    assert.deepEqual([r.ok, r.reason, r.caseId, r.draft], [false, "NO_SUCH_ACCOUNT_DRAFT", CASE, named], named);
  }
  /* as proposed: the draft's own words (white space aside), derived or given as edited; or the form named */
  const row = SHARED_ACT_CHECKS[ACCEPT_MUST_REAUTHOR];
  for (const [named, sentences] of [[d.id, [{ text: "The council awarded the contract on 3 March.", cites: [] },
                                            { text: "The   award followed the minutes. ", cites: [] }]],
                                    [{ draft: d.id, form: "edited" }, [{ text: DRAFT, cites: [] }]],
                                    [{ draft: d.id, form: "as_proposed" }, [{ text: "Mine.", cites: [] }]]]) {
    const r = w.cacc.accountDraftJudged(named, CASE, sentences);
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.draft, r.caseId],
                     [false, ACCEPT_MUST_REAUTHOR, ACCEPT_MUST_REAUTHOR, row.check, row.translation, d.id, CASE], JSON.stringify(named));
    assert.match(r.detail, /Nothing was written\./);
  }
  assert.deepEqual(w.snapshot(), snap, "nothing written");
  /* negative control */
  assert.equal(w.cacc.accountDraftJudged(d.id, CASE, [{ text: "The council awarded it in March, as the minutes say.", cites: [] }]).ok, true);
});

test("R4, R9: acceptanceRecorded writes one acceptance in record-grammar R52's one shape (kind case_account) with the case, edition, draft and form, through record-core's transact, so inside a caller's rolled-back transaction it leaves no row; with no draft named it writes nothing; append-only", () => {
  const { w, draft } = setup();
  const d = draft();
  const at = "2026-09-28T01:00:00Z";
  const before = w.snapshot();
  for (const drafted of [null, undefined, { draft: null, form: null }])
    assert.deepEqual(w.cacc.acceptanceRecorded({ caseId: CASE, edition: 2, drafted, by: "alice", at }), { ok: true, acceptance: null });
  assert.deepEqual(w.snapshot(), before, "no draft named: nothing written");
  /* inside a caller's transaction that rolls back */
  const ROLL = Symbol("rollback");
  try { w.record.transact(() => { w.cacc.acceptanceRecorded({ caseId: CASE, edition: 2, drafted: { draft: d.id, form: "edited" }, by: "alice", at }); throw ROLL; }); }
  catch (e) { if (e !== ROLL) throw e; }
  assert.equal(w.count("account_acceptances"), 0, "rolled back with the caller");
  const r = w.cacc.acceptanceRecorded({ caseId: CASE, edition: 2, drafted: { draft: d.id, form: "edited" }, by: "alice", at });
  const shape = acceptanceRecord({ proposal: d.id, form: "edited", by: "alice", at, kind: ACCOUNT_ACCEPT_KIND });
  assert.deepEqual(r, { ok: true, acceptance: shape });
  w.cacc.acceptanceRecorded({ caseId: CASE, edition: 3, drafted: { draft: d.id, form: "own_instead" }, by: "bo", at });
  assert.deepEqual(w.rows(`SELECT case_id, edition, draft_id, form, record, at FROM account_acceptances ORDER BY seq`), [
    { case_id: CASE, edition: 2, draft_id: d.id, form: "edited", record: JSON.stringify(shape), at },
    { case_id: CASE, edition: 3, draft_id: d.id, form: "own_instead",
      record: JSON.stringify({ proposal: d.id, form: "own_instead", by: "bo", at, kind: "case_account" }), at }]);
});

/* ---------------------------------------------------------------- R5 */

test("R5 (D56; K2533): accountShaped answers {ok, sentences, statementCites} or the first refusal naming the field, writing nothing — BAD_ACCOUNT (not a list, over 200 sentences, a sentence not an object or with another field, text not one line of at most 2,000, cites not at most 50 well-formed cites, a bias_statement blank, long or holding a quote, backslash or line break) and BAD_STATEMENT_CITES; absent read as none; the instance answers as the export; negative control: well-formed shapes pass, trimmed", () => {
  const { w } = setup();
  const s = (o) => ({ text: "A.", cites: [], ...o });
  const many = (n, f) => Array.from({ length: n }, (_, i) => f(i));
  const bad = [
    ["a story", null, "BAD_ACCOUNT", "account"], [{}, null, "BAD_ACCOUNT", "account"],
    [many(ACCOUNT_SENTENCES_MAX + 1, () => s()), null, "BAD_ACCOUNT", "account"],
    [[null], null, "BAD_ACCOUNT", "account[0]"], [[["A."]], null, "BAD_ACCOUNT", "account[0]"],
    [[s({ context: "the backstory" })], null, "BAD_ACCOUNT", "account[0].context"],
    [[s({ text: "" })], null, "BAD_ACCOUNT", "account[0].text"], [[s({ text: "  " })], null, "BAD_ACCOUNT", "account[0].text"],
    [[s({ text: 7 })], null, "BAD_ACCOUNT", "account[0].text"], [[s({ text: "Two\nlines." })], null, "BAD_ACCOUNT", "account[0].text"],
    [[s({ text: "x".repeat(COMPLETENESS_MAX + 1) })], null, "BAD_ACCOUNT", "account[0].text"],
    [[s({ cites: "Q" })], null, "BAD_ACCOUNT", "account[0].cites"],
    [[s({ cites: many(ACCOUNT_CITES_MAX + 1, () => ({ kind: "finding", ref: Q })) })], null, "BAD_ACCOUNT", "account[0].cites"],
    [[s({ cites: [{ kind: "rumour", ref: Q }] })], null, "BAD_ACCOUNT", "account[0].cites"],
    [[s({ cites: [{ kind: "leg", ref: Q }] })], null, "BAD_ACCOUNT", "account[0].cites"],
    [[s({ cites: [{ kind: "leg", ref: Q, ord: 0 }] })], null, "BAD_ACCOUNT", "account[0].cites"],
    [[s({ cites: [{ kind: "finding", ref: Q, ord: 1 }] })], null, "BAD_ACCOUNT", "account[0].cites"],
    [[s({ cites: [{ kind: "finding", ref: "" }] })], null, "BAD_ACCOUNT", "account[0].cites"],
    [[s({ cites: [{ kind: "finding", ref: "x".repeat(201) }] })], null, "BAD_ACCOUNT", "account[0].cites"],
    [[s({ cites: [{ kind: "finding", ref: 'a"b' }] })], null, "BAD_ACCOUNT", "account[0].cites"],
    [[s({ cites: [{ kind: "finding", ref: "a\\b" }] })], null, "BAD_ACCOUNT", "account[0].cites"],
    [[s({ cites: [null] })], null, "BAD_ACCOUNT", "account[0].cites"],
    [[s({ bias_statement: " " })], null, "BAD_ACCOUNT", "account[0].bias_statement"],
    [[s({ bias_statement: "x".repeat(201) })], null, "BAD_ACCOUNT", "account[0].bias_statement"],
    [[s({ bias_statement: "a\nb" })], null, "BAD_ACCOUNT", "account[0].bias_statement"],
    [[s({ bias_statement: 'a"b' })], null, "BAD_ACCOUNT", "account[0].bias_statement"],
    [null, "x", "BAD_STATEMENT_CITES", "statementCites"], [null, [], "BAD_STATEMENT_CITES", "statementCites"],
    [null, { story: [] }, "BAD_STATEMENT_CITES", "statementCites.story"],
    [null, { statement: "Q" }, "BAD_STATEMENT_CITES", "statementCites.statement"],
    [null, { what_changed: [{ kind: "rumour", ref: Q }] }, "BAD_STATEMENT_CITES", "statementCites.what_changed"],
    [null, { excluded: [[], []] }, "BAD_STATEMENT_CITES", "statementCites.excluded"],
    [null, { excluded: "x" }, "BAD_STATEMENT_CITES", "statementCites.excluded"],
  ];
  const snap = w.snapshot();
  for (const [account, sc, reason, field] of bad) {
    const r = accountShaped(account, sc, 1);
    assert.deepEqual([r.ok, r.reason, r.field], [false, reason, field], JSON.stringify([account, sc]).slice(0, 100));
    assert.match(r.detail, /Nothing was written\./);
    assert.deepEqual(w.cacc.accountShaped(account, sc, 1), r, "the instance answers as the export");
  }
  assert.equal(accountShaped(null, { excluded: [[{ kind: "finding", ref: Q }]] }, 1).ok, true, "one list per exclusion row, at most excludedCount");
  assert.equal(accountShaped(null, { excluded: [[]] }).reason, "BAD_STATEMENT_CITES", "excludedCount defaults to none");
  assert.deepEqual(w.snapshot(), snap, "writes nothing");
  /* negative control: absent is none; well-formed at the bounds; trimmed */
  assert.deepEqual(accountShaped(undefined, undefined), { ok: true, sentences: [], statementCites: NONE });
  const good = accountShaped([{ text: " The award. ", cites: [{ kind: "finding", ref: ` ${Q} ` }, { kind: "leg", ref: Q, ord: 2 },
    { kind: "passage", ref: "CNT-1" }, { kind: "material", ref: "m1", ord: null }], bias_statement: " s1 ", extra: undefined },
    { text: "x".repeat(COMPLETENESS_MAX), cites: many(ACCOUNT_CITES_MAX, () => ({ kind: "finding", ref: Q })) }],
    { statement: [{ kind: "finding", ref: Q }], subject_justification: undefined, excluded: [[{ kind: "leg", ref: Q, ord: 1 }]],
      what_changed: [] }, 1);
  assert.equal(good.ok, true, JSON.stringify(good).slice(0, 200));
  assert.deepEqual(good.sentences[0], { text: "The award.", cites: [{ kind: "finding", ref: Q, ord: null }, { kind: "leg", ref: Q, ord: 2 },
    { kind: "passage", ref: "CNT-1", ord: null }, { kind: "material", ref: "m1", ord: null }], bias_statement: "s1" });
  assert.deepEqual(good.statementCites, { statement: [{ kind: "finding", ref: Q, ord: null }], subject_justification: [],
                                          excluded: [[{ kind: "leg", ref: Q, ord: 1 }]], what_changed: [] });
  assert.equal(accountShaped(many(ACCOUNT_SENTENCES_MAX, () => s())).ok, true, "200 sentences");
});

/* ---------------------------------------------------------------- R6 */

test("R6 (D56–D58, D63; K2531, K2533): accountJudged builds case-grammar R23's rows — the account in order (began_as machine_draft with its draft when R4's form is edited, else member), then statement, subject_justification, one excluded row per exclusion as the body prints it and what_changed, each with its cites, a blank one left out — and hands case-disclosures R30 them, what they cite as the viewer reads it, the lens, the members' conclusions, the flags after the draft and the viewer; it writes nothing", () => {
  const { w, draft } = setup();
  const d = draft();
  w.cacc.accountPropose({ case: CASE, kind: "account_check", run: RUN, proposedBy: AI, viewer: AI, flags: [{ ord: 2, text: "Not cited.", cites: [] }] });
  w.judgeAccount = () => ({ ok: true, refusals: [] });
  const snap = w.snapshot();
  const sc = { statement: [{ kind: "finding", ref: Q2, ord: null }], subject_justification: [], excluded: [[], [{ kind: "finding", ref: Q, ord: null }]],
               what_changed: [{ kind: "leg", ref: Q, ord: 1 }] };
  const excluded = [{ description: "the amendments", reason: "not yet obtained" }, { target: Q2, description: "", reason: "out of scope" }];
  const r = w.cacc.accountJudged(judgeArgs({ statementCites: sc, drafted: { draft: d.id, form: "edited" }, excluded,
    changed: { ok: true, text: "The amendments are now excluded.", began_as: "machine_draft", draft: "WCD-2026-0001" } }));
  const machine = { began_as: "machine_draft", draft: d.id }, member = { began_as: "member", draft: null };
  const rows = [
    { ord: 1, text: SENTENCES[0].text, cites: SENTENCES[0].cites, kind: "account", bias_statement: null, ...machine },
    { ord: 2, text: SENTENCES[1].text, cites: SENTENCES[1].cites, kind: "account", bias_statement: null, ...machine },
    { ord: 3, text: SENTENCES[2].text, cites: [], kind: "account", bias_statement: "s1", ...machine },
    { ord: 4, text: "It covers the award.", cites: sc.statement, kind: "statement", bias_statement: null, ...member },
    { ord: 5, text: "The award is public.", cites: [], kind: "subject_justification", bias_statement: null, ...member },
    { ord: 6, text: "the amendments: not yet obtained", cites: [], kind: "excluded", bias_statement: null, ...member },
    { ord: 7, text: `${Q2} — (named above): out of scope`, cites: sc.excluded[1], kind: "excluded", bias_statement: null, ...member },
    { ord: 8, text: "The amendments are now excluded.", cites: sc.what_changed, kind: "what_changed", bias_statement: null,
      began_as: "machine_draft", draft: "WCD-2026-0001" }];
  assert.deepEqual(r.rows, rows);
  const a = w.judged.at(-1);
  assert.deepEqual(a.account, rows.slice(0, 3));
  assert.deepEqual(a.statements, rows.slice(3));
  assert.deepEqual(a.cited.holdings.map((h) => h.address), [`finding:${Q}`, `leg:${Q}#1`, `finding:${Q2}`]);
  assert.equal(a.cited.holdings[0].quote, w.text(Q), "a finding's own text");
  assert.equal(JSON.parse(a.cited.holdings[1].quote).target_id, DOC, "a leg as its basis states it");
  assert.deepEqual([a.cited.rules, a.cited.looks], [[], []]);
  assert.deepEqual(a.conclusions, [{ finding: Q, claim: "the award followed the minutes", claim_state: "concluded",
                                     legs: w.inquiry.basisFor(Q).legs.map((l, k) => ({ ...l, ord: k + 1 })) }], "legs numbered as leg cites are (K2965)");
  assert.deepEqual(a.flags, [{ kind: "account_check", ord: 2, text: "Not cited.", cites: [] }], "the flags after the draft");
  assert.deepEqual([a.lens, a.viewer], [{ in_force: false }, V("alice")]);
  assert.deepEqual([r.refusals, r.refusal, r.flags], [[], null, a.flags]);
  assert.deepEqual([...r.results.entries()], rows.map((x) => [x.ord, []]));
  assert.deepEqual(w.snapshot(), snap, "writes nothing");
  /* negative control: from nothing and own_instead, every row began as the member's; no draft named, all the flags; a
     blank statement and an edition with no what-changed carry no row; no case named, no flags */
  for (const drafted of [null, { draft: d.id, form: "own_instead" }]) {
    const m = w.cacc.accountJudged(judgeArgs({ drafted, justification: "  " }));
    assert.deepEqual(m.rows.map((x) => [x.kind, x.began_as, x.draft]), [["account", "member", null], ["account", "member", null],
      ["account", "member", null], ["statement", "member", null]]);
  }
  assert.equal(w.judged.at(-1).flags.length, 1);
  assert.deepEqual(w.cacc.accountJudged(judgeArgs({ caseId: null })).flags, []);
  assert.deepEqual(w.cacc.accountJudged(judgeArgs({ changed: { ok: false } })).rows.at(-1).kind, "subject_justification");
});

test("R6: citedFor holds what the viewer reads — a finding's live text, a leg as inquiry.basisFor states it, a passage's indexed text at its extent (content R45, extraction R58), a material's indexed text — one holding per distinct cite; a cite the viewer cannot see, or naming nothing held, has no holding", () => {
  const { w } = setup();
  const capture = sha(`bytes of ${DOC}`);
  w.passage("CNT-2026-0001", capture, DOC, 2);
  w.passage("CNT-2026-0002", capture, "INFO-2026-0404-x", 1);
  const H = w.project("Hidden", "cy");
  const hidden = "INQ-2026-0009-h";
  w.finding(hidden, [{ target: DOC }]);
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, H, hidden);
  const cite = (kind, ref, ord = null) => ({ kind, ref, ord });
  const rows = [{ cites: [cite("finding", Q), cite("finding", Q), cite("leg", Q, 1), cite("leg", Q, 9), cite("passage", "CNT-2026-0001"),
                          cite("passage", "CNT-2026-0002"), cite("passage", "CNT-2026-9999"), cite("material", "m1"), cite("material", "m2"),
                          cite("finding", hidden), cite("leg", hidden, 1), cite("finding", "INQ-2026-0404-z")] }];
  const reached = { materials: [{ ref: "m1", sha: capture }, { ref: "m2", sha: "0".repeat(64) }] };
  const snap = w.snapshot();
  const held = w.cacc.citedFor(rows, prepared, reached, V("alice"));
  assert.deepEqual(held.holdings, [
    { address: `finding:${Q}`, quote: w.text(Q) },
    { address: `leg:${Q}#1`, quote: JSON.stringify(w.inquiry.basisFor(Q).legs[0]) },
    { address: "passage:CNT-2026-0001", quote: "It awarded the contract." },
    { address: "material:m1", quote: "The council met on 3 March.\nIt awarded the contract." }]);
  assert.deepEqual([held.rules, held.looks], [[], []]);
  /* the hidden project's members read it */
  assert.deepEqual(w.cacc.citedFor(rows, prepared, reached, V("cy")).holdings.map((h) => h.address).filter((x) => x.includes(hidden)),
                   [`finding:${hidden}`, `leg:${hidden}#1`]);
  /* a viewer who sees nothing holds nothing but the materials the caller reached */
  assert.deepEqual(w.cacc.citedFor(rows, prepared, reached, "nobody").holdings.map((h) => h.address), ["material:m1"]);
  assert.deepEqual(w.snapshot(), snap, "writes nothing");
});

test("R6: case-disclosures R30's answer is accountJudged's — results map each row's ord to the codes naming it, refusal the first — against the real case-disclosures too; a judgment that throws or answers no list is ACCOUNT_CHECK_UNDETERMINED (fail closed); negative control: an empty list passes every row", () => {
  const { w } = setup();
  const R1 = { ok: false, reason: "ACCOUNT_FACT_NOT_IN_CITED", code: "ACCOUNT_FACT_NOT_IN_CITED", sentences: [1, { ord: 3 }] };
  const R2 = { ok: false, reason: "ACCOUNT_FLAG_UNANSWERED", ord: 2 };
  w.judgeAccount = () => ({ ok: true, refusals: [R1, null, R2] });
  const r = w.cacc.accountJudged(judgeArgs());
  assert.deepEqual([r.refusals, r.refusal], [[R1, R2], R1]);
  assert.deepEqual([...r.results.entries()], [[1, ["ACCOUNT_FACT_NOT_IN_CITED"]], [2, ["ACCOUNT_FLAG_UNANSWERED"]],
    [3, ["ACCOUNT_FACT_NOT_IN_CITED"]], [4, []], [5, []]]);
  for (const judge of [() => ({}), () => null, () => ({ refusals: "none" }), () => { throw new Error("down"); }]) {
    w.judgeAccount = judge;
    const u = w.cacc.accountJudged(judgeArgs());
    assert.deepEqual([u.refusals.length, u.refusal.ok, u.refusal.reason, u.refusal.code],
                     [1, false, "ACCOUNT_CHECK_UNDETERMINED", "ACCOUNT_CHECK_UNDETERMINED"]);
    assert.match(u.refusal.detail, /could not be checked against what it cites[\s\S]*Nothing was written\./);
  }
  assert.match(w.cacc.accountJudged(judgeArgs()).refusal.detail, /\(down\)/, "the throw's words named");
  /* negative control */
  w.judgeAccount = () => ({ ok: true, refusals: [] });
  assert.equal(w.cacc.accountJudged(judgeArgs()).refusal, null);
  /* the real case-disclosures R30: its refusals are answered as accountJudged's, each row's codes from them */
  w.judgeAccount = null;
  const real = w.cacc.accountJudged(judgeArgs());
  assert.ok(Array.isArray(real.refusals));
  const direct = w.disclosures.accountJudged({ account: real.rows.filter((x) => x.kind === "account"),
    statements: real.rows.filter((x) => x.kind !== "account"), cited: w.judged.at(-1).cited, lens: { in_force: false },
    conclusions: w.judged.at(-1).conclusions, flags: [], viewer: V("alice") });
  assert.deepEqual(real.refusals, direct.refusals.filter((x) => x && typeof x === "object"));
  assert.equal(real.refusal, real.refusals[0] ?? null);
});

/* ---------------------------------------------------------------- R9 */

test("R9: R4–R7's services answer synchronously (never a Promise), the judgments write nothing, and every write (R1, R2, R4's acceptanceRecorded) is made through record-core's transact, so one made inside a caller's transaction rolls back with it", () => {
  const { w, draft } = setup();
  const d = draft();
  w.judgeAccount = () => ({ ok: true, refusals: [] });
  const answers = [w.cacc.accountDraftJudged(d.id, CASE, SENTENCES), w.cacc.accountShaped(SENTENCES, null),
    w.cacc.accountJudged(judgeArgs()), w.cacc.citedFor([], [], null, V("alice")), w.cacc.accountFlags(CASE),
    w.cacc.reviewCommentsChosen(null, CASE, 1, V("alice"), null), w.cacc.registerReviewComments(() => []),
    w.cacc.acceptanceRecorded({ caseId: CASE, edition: 2, drafted: null, by: "alice", at: "2026-09-28T01:00:00Z" })];
  for (const a of answers) assert.equal(a instanceof Promise || typeof a?.then === "function", false);
  /* writes made inside a caller's transaction that rolls back leave nothing; record-core's transact is the door */
  let calls = 0;
  const counted = new Proxy(w.record, { get: (t, p) => (p === "transact" ? (fn) => { calls++; return t.transact(fn); }
    : typeof t[p] === "function" ? t[p].bind(t) : t[p]) });
  const c = new CaseAccount({ storage: w.st, record: counted, runs: w.deps.runs, now: w.deps.now });
  const before = w.snapshot();
  const ROLL = Symbol("rollback");
  try {
    w.record.transact(() => {
      assert.equal(c.accountPropose({ case: CASE, framing: "by_rule", text: "Words.", run: RUN, proposedBy: AI, viewer: AI }).ok, true);
      assert.equal(c.accountPropose({ case: CASE, kind: "account_check", flags: [{ ord: 1, text: "Not cited.", cites: [] }], run: RUN,
                                      proposedBy: AI, viewer: AI }).ok, true);
      c.acceptanceRecorded({ caseId: CASE, edition: 2, drafted: { draft: d.id, form: "edited" }, by: "alice", at: "2026-09-28T01:00:00Z" });
      throw ROLL;
    });
  } catch (e) { if (e !== ROLL) throw e; }
  assert.equal(calls, 3, "each write through transact");
  assert.deepEqual(w.snapshot(), before, "rolled back with the caller, the minted ids with them");
});
