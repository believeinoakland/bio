/* case-account: the system's drafts of a case's account (R1, R2, R3) and the cases they may be proposed for (R10),
   ported from case-authoring's `account.test.mjs` 165–195 and 255–267 (`build/extraction/case-account-split.md` §6) and
   driven at the module's interface. Each refusal has its negative control: the same call made well-formed is stored. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, T0 } from "./fixture.mjs";
import { CaseAccount, ACCOUNT_FRAMINGS, ACCOUNT_DRAFT_MAX, ACCOUNT_DRAFTS_MAX, ACCOUNT_SENTENCES_MAX, COMPLETENESS_MAX }
  from "../../../src/case-account/index.mjs";
import { proposalLabel } from "../../../src/record-grammar/index.mjs";
import { mintExhausted } from "../../../src/record-core/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q";
const RUN = "RUN-2026-0001", CASE = "CASE-2026-0001", PREP = "CASE-2026-0002";
const AI = "class:ai";

function setup(opts) {
  const w = world(opts);
  for (const m of ["alice", "bo", "cy"]) w.member(m);
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  w.join(P, "bo");
  w.runs.set(RUN, { status: "running" });
  w.published(CASE, P);
  w.prepared(PREP, P);
  return { w, P };
}
const propose = (w, a) => w.cacc.accountPropose({ case: CASE, framing: "time_order", text: "First the award.", run: RUN,
                                                   proposedBy: AI, viewer: AI, ...a });

test("R1 (D56): accountPropose stores the system's draft of a published case's account in one framing, under a minted opaque ACD id (record-grammar R55, through record-core's allocId), labelled through record-grammar's proposalLabel(by, \"case_account\") (its R54) — machine work for a machine, a draft for a member, never the case's account — and answers {ok, draft, next}", () => {
  const { w } = setup();
  const d1 = propose(w, {});
  assert.equal(d1.ok, true, JSON.stringify(d1));
  assert.match(d1.draft.id, /^ACD-2026-[a-z0-9]{16}$/, "opaque, from the act's year");
  assert.ok(w.row(`SELECT 1 AS x FROM minted_ids WHERE id=? AND source='opaque'`, d1.draft.id), "recorded in record-core's ledger");
  assert.deepEqual(d1.draft, { id: d1.draft.id, case: CASE, kind: "case_account", framing: "time_order", text: "First the award.",
                               flags: null, run: RUN, label: proposalLabel(AI, "case_account"), at: w.clock.ms });
  assert.deepEqual([d1.draft.label.machine_work, d1.draft.label.state], [true, "machine_proposed"]);
  assert.match(d1.draft.label.says, /machine work/);
  assert.match(d1.draft.label.says, /never be the case's account/);
  assert.match(d1.next, new RegExp(`accountDraft: "${d1.draft.id}"`));
  /* a member's draft is labelled a member's; one with no proposer says the record does not say who */
  const d2 = propose(w, { framing: "by_rule", proposedBy: "bo", viewer: V("bo") });
  assert.deepEqual(d2.draft.label, proposalLabel("bo", "case_account"));
  assert.deepEqual([d2.draft.label.machine_work, d2.draft.label.state], [false, "member_proposed"]);
  assert.deepEqual(propose(w, { framing: "by_question", proposedBy: "  " }).draft.label, proposalLabel(null, "case_account"));
  /* every framing; a draft of the most characters allowed */
  assert.deepEqual(ACCOUNT_FRAMINGS, ["time_order", "by_question", "by_rule"]);
  for (const framing of ACCOUNT_FRAMINGS) assert.equal(propose(w, { framing }).ok, true, framing);
  assert.equal(propose(w, { text: "x".repeat(ACCOUNT_DRAFT_MAX) }).ok, true, "at the bound");
  /* the drafts are distinct rows, append-only */
  assert.equal(new Set(w.rows(`SELECT draft_id FROM account_drafts`).map((r) => r.draft_id)).size, w.count("account_drafts"));
});

test("R1: refusals in order — NO_SUCH_CASE, BAD_ACCOUNT_DRAFT (an unknown kind, a text not a string, blank or over 8,000 characters), BAD_ACCOUNT_FRAMING naming the allowed, NO_SUCH_RUN — each writing nothing; MINT_EXHAUSTED through record-core's mintExhausted when no id is free, nothing written; negative control: each made well-formed is stored", () => {
  const { w } = setup();
  const before = w.snapshot();
  const cases = [
    [{ case: "CASE-2026-9999", kind: "story", text: "", framing: "x", run: "nope" }, "NO_SUCH_CASE"],
    [{ kind: "story", text: "", framing: "x", run: "nope" }, "BAD_ACCOUNT_DRAFT", "kind"],
    [{ text: 7, framing: "x", run: "nope" }, "BAD_ACCOUNT_DRAFT", "text"],
    [{ text: undefined, framing: "x" }, "BAD_ACCOUNT_DRAFT", "text"],
    [{ text: "   ", framing: "x", run: "nope" }, "BAD_ACCOUNT_DRAFT", "text"],
    [{ text: "x".repeat(ACCOUNT_DRAFT_MAX + 1), framing: "x", run: "nope" }, "BAD_ACCOUNT_DRAFT", "text"],
    [{ framing: "chronological", run: "nope" }, "BAD_ACCOUNT_FRAMING"],
    [{ framing: null }, "BAD_ACCOUNT_FRAMING"],
    [{ run: "RUN-2026-0404" }, "NO_SUCH_RUN"],
    [{ run: null }, "NO_SUCH_RUN"],
    [{ viewer: "nobody", proposedBy: "nobody" }, "NO_SUCH_CASE"],
  ];
  for (const [a, reason, field] of cases) {
    const r = propose(w, a);
    assert.deepEqual([r.ok, r.reason], [false, reason], JSON.stringify(a));
    if (field) assert.equal(r.field, field);
    assert.match(r.detail, /Nothing was written\./);
  }
  const framing = propose(w, { framing: "chronological" });
  assert.deepEqual(framing.allowed, ACCOUNT_FRAMINGS);
  assert.deepEqual(w.snapshot(), before, "nothing written by any refusal");
  /* no free id: record-core R62's one answer, nothing written */
  const tight = new Proxy(w.record, { get: (t, p) => (p === "allocId" ? (prefix) => mintExhausted(prefix)
    : typeof t[p] === "function" ? t[p].bind(t) : t[p]) });
  const c = new CaseAccount({ storage: w.st, record: tight, runs: w.deps.runs, now: w.deps.now });
  assert.deepEqual(c.accountPropose({ case: CASE, framing: "time_order", text: "x", run: RUN, proposedBy: AI, viewer: AI }),
                   mintExhausted("ACD"));
  assert.deepEqual(w.snapshot(), before, "nothing written when no id is free");
  /* negative control: each refused call, its one fault mended, is stored */
  /* every fault of each refused call mended, the rest of the call kept */
  const mended = [
    { case: CASE, kind: "case_account", text: "Words.", framing: "by_rule", run: RUN },
    { kind: "case_account", text: "Words.", framing: "by_rule", run: RUN },
    { text: "Seven.", framing: "by_rule", run: RUN }, { text: "Words.", framing: "by_rule" },
    { text: "Words.", framing: "by_rule", run: RUN }, { text: "x".repeat(ACCOUNT_DRAFT_MAX), framing: "by_rule", run: RUN },
    { framing: "by_question", run: RUN }, { framing: "by_question" }, { run: RUN }, { run: RUN },
    { viewer: V("bo"), proposedBy: "bo" }];
  cases.forEach(([a], i) => {
    const r = propose(w, { ...a, ...mended[i] });
    assert.equal(r.ok, true, `${JSON.stringify(a).slice(0, 80)} mended: ${JSON.stringify(r).slice(0, 200)}`);
  });
  assert.equal(w.count("account_drafts"), cases.length);
});

test("R2 (K2536): accountPropose takes kind account_check with flags [{ord, text, cites}] in place of text and framing, labelled proposalLabel(by, \"account_check\"); flags not a list of 1 to 200 entries, or an entry without a whole ord of at least 1, words on one line of at most 2,000 characters or cites in R5's shape, are BAD_ACCOUNT_DRAFT naming the entry, nothing written; accountFlags answers those proposed after the named draft (all with none named), in proposal order, writing nothing", () => {
  const { w } = setup();
  const flag = (flags, a = {}) => w.cacc.accountPropose({ case: CASE, kind: "account_check", run: RUN, proposedBy: AI, viewer: AI, flags, ...a });
  const ok1 = { ord: 1, text: "The date is not in what this sentence cites.", cites: [] };
  const before = w.count("account_drafts");
  const bad = [
    [undefined, "flags"], [[], "flags"], ["a flag", "flags"],
    [Array.from({ length: ACCOUNT_SENTENCES_MAX + 1 }, (_, i) => ({ ...ok1, ord: i + 1 })), "flags"],
    [[ok1, null], "flags[1]"], [[{ ...ok1, ord: 0 }], "flags[0]"], [[{ ...ok1, ord: 1.5 }], "flags[0]"],
    [[{ ...ok1, text: " " }], "flags[0]"], [[{ ...ok1, text: "Two\nlines." }], "flags[0]"],
    [[{ ...ok1, text: "x".repeat(COMPLETENESS_MAX + 1) }], "flags[0]"],
    [[{ ...ok1, cites: [{ kind: "rumour", ref: Q }] }], "flags[0]"], [[{ ...ok1, cites: [{ kind: "leg", ref: Q }] }], "flags[0]"],
    [[{ ...ok1, cites: "Q" }], "flags[0]"],
  ];
  for (const [flags, field] of bad) {
    const r = flag(flags);
    assert.deepEqual([r.ok, r.reason, r.field], [false, "BAD_ACCOUNT_DRAFT", field], JSON.stringify(flags)?.slice(0, 80));
  }
  /* in R1's place among R1's refusals: after NO_SUCH_CASE, before NO_SUCH_RUN */
  assert.equal(flag([], { case: "CASE-2026-9999" }).reason, "NO_SUCH_CASE");
  assert.equal(flag([], { run: "RUN-2026-0404" }).reason, "BAD_ACCOUNT_DRAFT");
  assert.equal(flag([ok1], { run: "RUN-2026-0404" }).reason, "NO_SUCH_RUN");
  assert.equal(w.count("account_drafts"), before, "nothing written");
  /* negative control: well-formed flags are stored, at the bounds */
  const f1 = flag([ok1, { ord: 2, text: "x".repeat(COMPLETENESS_MAX), cites: [{ kind: "leg", ref: Q, ord: 1 }] }]);
  assert.equal(f1.ok, true, JSON.stringify(f1));
  assert.deepEqual([f1.draft.kind, f1.draft.text, f1.draft.framing], ["account_check", null, null]);
  assert.deepEqual(f1.draft.flags, [{ ord: 1, text: ok1.text, cites: [] },
                                    { ord: 2, text: "x".repeat(COMPLETENESS_MAX), cites: [{ kind: "leg", ref: Q, ord: 1 }] }]);
  assert.deepEqual(f1.draft.label, proposalLabel(AI, "account_check"));
  assert.match(f1.draft.label.says, /machine work/);
  assert.match(f1.next, /answers each flag/);
  /* accountFlags: all with none named, only those after the draft named, in proposal order */
  const d = propose(w, {}).draft;
  flag([{ ord: 3, text: "The award date is not cited.", cites: [{ kind: "finding", ref: Q }] }]);
  const snap = w.snapshot();
  assert.deepEqual(w.cacc.accountFlags(CASE).map((x) => x.ord), [1, 2, 3]);
  assert.deepEqual(w.cacc.accountFlags(CASE, d.id), [{ kind: "account_check", ord: 3, text: "The award date is not cited.",
                                                       cites: [{ kind: "finding", ref: Q, ord: null }] }]);
  assert.deepEqual(w.cacc.accountFlags(PREP), [], "another case's flags are not this case's");
  assert.deepEqual(w.snapshot(), snap, "accountFlags writes nothing");
  /* listed by R3 */
  assert.deepEqual(w.cacc.accountDrafts({ case: CASE, viewer: V("alice") }).drafts.map((x) => x.kind),
                   ["account_check", "case_account", "account_check"]);
});

test("R3: accountDrafts lists the case's drafts of both kinds, oldest first, each {id, kind, framing, text, flags, run, label, at}, at most 500 with truncated when there are more; a label already stored keeps the words it was stored with; NO_SUCH_CASE as R1 answers it; it writes nothing", () => {
  const { w } = setup();
  /* a draft stored before the split, its four-digit id (record-grammar R55's legacy form) and its old label words */
  const OLD = { by: AI, state: "machine_proposed", machine_work: true, says: "the old words, as they were stored" };
  w.st.sql.exec(`INSERT INTO account_drafts (draft_id, case_id, kind, framing, text, flags, run, proposed_by, label, at)
                 VALUES ('ACD-2026-0042', ?, 'case_account', 'by_rule', 'Old.', NULL, ?, ?, ?, ?)`, CASE, RUN, AI, JSON.stringify(OLD), T0);
  const d = propose(w, {}).draft;
  const snap = w.snapshot();
  const list = w.cacc.accountDrafts({ case: CASE, viewer: V("bo") });
  assert.deepEqual(list, { ok: true, case: CASE, truncated: false, drafts: [
    { id: "ACD-2026-0042", kind: "case_account", framing: "by_rule", text: "Old.", flags: null, run: RUN, label: OLD, at: T0 },
    { id: d.id, kind: "case_account", framing: "time_order", text: "First the award.", flags: null, run: RUN, label: d.label, at: d.at }] });
  assert.deepEqual(w.snapshot(), snap, "writes nothing");
  assert.equal(w.cacc.accountDrafts({ case: CASE, viewer: V("cy") }).reason, "NO_SUCH_CASE");
  assert.equal(w.cacc.accountDrafts({ case: "CASE-2026-9999", viewer: V("alice") }).reason, "NO_SUCH_CASE");
  /* the bound: 500 listed and truncated past it; negative control: exactly 500 is not truncated */
  for (let i = w.count("account_drafts"); i < ACCOUNT_DRAFTS_MAX; i++)
    w.st.sql.exec(`INSERT INTO account_drafts (draft_id, case_id, kind, framing, text, run, label, at)
                   VALUES (?, ?, 'case_account', 'by_rule', 'x', ?, ?, ?)`, `ACD-2026-${String(1000 + i)}`, CASE, RUN, JSON.stringify(OLD), T0);
  const full = w.cacc.accountDrafts({ case: CASE, viewer: V("alice") });
  assert.deepEqual([full.drafts.length, full.truncated], [ACCOUNT_DRAFTS_MAX, false]);
  propose(w, {});
  const over = w.cacc.accountDrafts({ case: CASE, viewer: V("alice") });
  assert.deepEqual([over.drafts.length, over.truncated, over.drafts[0].id], [ACCOUNT_DRAFTS_MAX, true, "ACD-2026-0042"]);
});

test("R10: a case neither published nor prepared unsigned, and a case whose project the viewer cannot see, answer accountPropose and accountDrafts alike, byte for byte; a prepared unsigned case is drafted for and listed; negative control: the project's members see it", () => {
  const { w, P } = setup();
  const SIGNED = "CASE-2026-0003";
  w.prepared(SIGNED, P, { signed: true });
  const HIDDEN = w.project("Hidden", "cy");
  w.published("CASE-2026-0004", HIDDEN);
  const answers = (c, viewer) => [JSON.stringify(propose(w, { case: c, viewer })), JSON.stringify(w.cacc.accountDrafts({ case: c, viewer }))];
  const absent = answers("CASE-2026-9999", V("alice"));
  assert.match(absent[0], /NO_SUCH_CASE/);
  for (const [c, viewer] of [[CASE, V("cy")], [PREP, V("cy")], ["CASE-2026-0004", V("alice")], [SIGNED, V("alice")], ["", V("alice")],
                             [null, V("alice")], [CASE, null], [CASE, "nobody"]])
    assert.deepEqual(answers(c, viewer), absent, `${c} as ${viewer}`);
  assert.equal(w.count("account_drafts"), 0, "nothing written");
  /* negative control: seen by its members and the machine, published or prepared */
  for (const [c, viewer] of [[CASE, V("alice")], [CASE, V("bo")], [PREP, V("bo")], [PREP, AI], ["CASE-2026-0004", V("cy")]]) {
    assert.equal(propose(w, { case: c, viewer }).ok, true, `${c} as ${viewer}`);
    assert.equal(w.cacc.accountDrafts({ case: c, viewer }).ok, true);
  }
});
