/* case-account, T45: a carried outcome judged as a statement is (R6's amendment; N855 (6c); Actions D6c; l8 doubt 8) and
   a counsel matter never read as evidence outside it (R14; N892; Actions D4; v0.2 rule 15), driven at the module's
   interface: `accountJudged` and `citedFor` as `publishCase` asks them, and `advocacyCheck` (R13).

   N901 (J1 (c), B2): case-disclosures R30 hands R6's `cited` (`{holdings, rules, looks}`) to case-checker's
   `checkAccount` unchanged, whose `cited` is a list, so through the real modules today every cite reads unread and a
   statement's figure arm never runs. The arms that need the cites read are therefore driven through `fixedDisclosures`:
   the real case-disclosures R30, handed the same holdings translated into `checkAccount`'s own list, as N901's fix will
   hand them. What case-account itself does (the rows, the outcomes named, the counsel refusal, the holdings) is
   asserted on what it hands over and answers, never on that translation. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, sha } from "./fixture.mjs";
import { CASE_ACCOUNT_CHECKS, COUNSEL_MATTER } from "../../../src/case-account/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q", QC = "INQ-2026-0007-c", DC = "INFO-2026-0007-c";
const CASE = "CASE-2026-0001", PAID = "CNT-2026-0001", PAIDC = "CNT-2026-0007";
const NONE = { statement: [], subject_justification: [], excluded: [], what_changed: [] };
const finding = (ref) => ({ kind: "finding", ref, ord: null });
const passage = (ref) => ({ kind: "passage", ref, ord: null });

/* the holdings, as N901's fix would hand them to checkAccount: `[{kind, ref, ord?, text}]` */
const asList = (holdings) => holdings.map((h) => {
  const m = /^(finding|leg|passage|material):(.+?)(?:#(\d+))?$/.exec(h.address);
  return { kind: m[1], ref: m[2], ...(m[3] ? { ord: Number(m[3]) } : {}), text: h.quote };
});
const fixedDisclosures = (w) => (a) => w.disclosures.accountJudged({ ...a, cited: asList(a.cited.holdings) });

function setup() {
  const w = world();
  for (const m of ["alice", "bo", "cy"]) w.member(m);
  w.doc(DOC, `bytes of ${DOC}`, { units: ["The fund paid $40,000 on 3 March 2026."] });
  w.passage(PAID, sha(`bytes of ${DOC}`), DOC, 1);
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  w.published(CASE, P);
  /* a counsel matter alice and bo sit in, holding a finding and a document with a passage */
  const C = w.project("Counsel", "alice");
  w.join(C, "bo");
  w.doc(DC, `bytes of ${DC}`, { units: ["Counsel's note: the fund paid $40,000."] });
  w.passage(PAIDC, sha(`bytes of ${DC}`), DC, 1);
  w.finding(QC, [{ target: DC }]);
  for (const id of [QC, DC]) w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, C, id);
  return { w, P, C };
}
const args = (over = {}) => ({ sentences: [{ text: "The fund paid $40,000.", cites: [passage(PAID)], bias_statement: null }],
  statementCites: NONE, drafted: null, statement: "It covers the payment.", justification: null, excluded: [], changed: null,
  prepared: [], reached: { materials: [] }, lens: null, caseId: CASE, viewer: V("alice"), ...over });

/* ---------------------------------------------------------------- R6: carried outcomes */

test("R6 (T45; D6c, D63; case-grammar R23 as amended): accountJudged takes outcomes [{outcome, text, cites}] and builds one row per outcome after the four statements, kind outcome, with its cites, began_as member, naming its outcome, handed to case-disclosures R30 among the statements; absent outcomes leave the rows and results as before; it writes nothing", () => {
  const { w } = setup();
  w.judgeAccount = () => ({ ok: true, refusals: [] });
  const snap = w.snapshot();
  const base = w.cacc.accountJudged(args());
  const outcomes = [{ outcome: "OUT-1", text: "The fund repaid the money on 9 May 2026.", cites: [passage(PAID)] },
                    { outcome: "OUT-2", text: "The office published both reports.", cites: [] }];
  const r = w.cacc.accountJudged(args({ outcomes, changed: { ok: true, text: "Outcomes added." } }));
  assert.deepEqual(r.rows.map((x) => [x.ord, x.kind, x.outcome ?? null]), [[1, "account", null], [2, "statement", null],
    [3, "what_changed", null], [4, "outcome", "OUT-1"], [5, "outcome", "OUT-2"]]);
  assert.deepEqual(r.rows.slice(3).map((x) => [x.text, x.cites, x.began_as, x.draft, x.bias_statement]), [
    [outcomes[0].text, [passage(PAID)], "member", null, null], [outcomes[1].text, [], "member", null, null]]);
  assert.deepEqual(w.judged.at(-1).statements.map((x) => x.kind), ["statement", "what_changed", "outcome", "outcome"]);
  assert.deepEqual([...r.results.keys()], [1, 2, 3, 4, 5]);
  /* negative control: absent, null and [] read as none, rows and results as before */
  for (const none of [undefined, null, []]) {
    const n = w.cacc.accountJudged(args({ outcomes: none }));
    assert.deepEqual([n.rows, [...n.results.entries()], n.refusals], [base.rows, [...base.results.entries()], base.refusals]);
  }
  assert.deepEqual(w.snapshot(), snap, "writes nothing");
});

test("R6 (T45): an outcome is judged as a statement is — an outcome whose text states a figure not in what it cites is answered ACCOUNT_FACT_NOT_IN_CITED naming the outcome (`outcomes` on the refusal, its row's code in results); control: the same act without it answers as before; an outcome citing nothing is not refused for citing nothing (a statement's sentence may cite nothing); one this module cannot read is handed on and refused by case-disclosures, never passed over", () => {
  const { w } = setup();
  w.judgeAccount = fixedDisclosures(w);
  const without = w.cacc.accountJudged(args());
  assert.equal(without.refusals.some((x) => x.code === "ACCOUNT_FACT_NOT_IN_CITED"), false, JSON.stringify(without.refusals));
  const r = w.cacc.accountJudged(args({ outcomes: [{ outcome: "OUT-1", text: "The fund repaid $55,000.", cites: [passage(PAID)] }] }));
  const fact = r.refusals.find((x) => x.code === "ACCOUNT_FACT_NOT_IN_CITED");
  assert.ok(fact, JSON.stringify(r.refusals));
  assert.deepEqual(fact.outcomes, ["OUT-1"]);
  assert.deepEqual(fact.sentences.map((x) => [x.ord, x.kind]), [[3, "outcome"]]);
  assert.deepEqual(r.results.get(3), ["ACCOUNT_FACT_NOT_IN_CITED"]);
  assert.deepEqual([r.results.get(1), r.results.get(2)], [[], []]);
  /* the same figure as the passage holds stands */
  const same = w.cacc.accountJudged(args({ outcomes: [{ outcome: "OUT-1", text: "The fund repaid $40,000.", cites: [passage(PAID)] }] }));
  assert.deepEqual(same.results.get(3), []);
  /* citing nothing: judged as a statement, not refused as an account sentence */
  const bare = w.cacc.accountJudged(args({ outcomes: [{ outcome: "OUT-2", text: "The office published both reports.", cites: [] }] }));
  assert.deepEqual(bare.results.get(3), []);
  /* unreadable entries are handed on, and refused */
  for (const bad of [[{ outcome: "OUT-3", text: "  ", cites: [] }], [{ outcome: "OUT-4", text: "Words.", cites: "x" }], ["a story"]]) {
    const u = w.cacc.accountJudged(args({ outcomes: bad }));
    assert.equal(u.refusal && u.refusal.reason, "BAD_COMPLETENESS", JSON.stringify(bad));
  }
});

/* ---------------------------------------------------------------- R14: counsel matters */

test("R14 (T45; N892; v0.2 rule 15): a cite naming a finding, a leg, a passage or a material held in a counsel matter other than the case's owning project has no holding (citedFor), and every sentence citing one is refused ACCOUNT_CITES_COUNSEL_MATTER (C-153.1) naming it and the cite, first among R6's refusals, its code in results; controls: the same cites into a project of scope none, and into the case's own project, are read as before", () => {
  const { w, P, C } = setup();
  w.scope(C, COUNSEL_MATTER);
  w.judgeAccount = () => ({ ok: true, refusals: [] });
  const sentences = [{ text: "Counsel found the payment.", cites: [finding(QC), { kind: "leg", ref: QC, ord: 1 }], bias_statement: null },
                     { text: "The fund paid $40,000.", cites: [passage(PAIDC), { kind: "material", ref: DC, ord: null }], bias_statement: null },
                     { text: "The fund paid $40,000.", cites: [passage(PAID)], bias_statement: null }];
  const reached = { materials: [{ ref: DC, sha: sha(`bytes of ${DC}`) }] };
  const snap = w.snapshot();
  const r = w.cacc.accountJudged(args({ sentences, reached }));
  const row = CASE_ACCOUNT_CHECKS.ACCOUNT_CITES_COUNSEL_MATTER;
  assert.deepEqual([r.refusal.ok, r.refusal.reason, r.refusal.code, r.refusal.check, r.refusal.translation],
                   [false, "ACCOUNT_CITES_COUNSEL_MATTER", "ACCOUNT_CITES_COUNSEL_MATTER", row.check, row.translation]);
  assert.equal(row.translation, "This sentence cites something from a counsel matter, which is never used as evidence outside it. "
    + "Cite something else, or leave it out. Nothing was written.");
  assert.deepEqual(r.refusal.sentences.map((x) => [x.ord, x.cites]), [[1, [`finding:${QC}`, `leg:${QC}#1`]],
    [2, [`passage:${PAIDC}`, `material:${DC}`]]]);
  assert.deepEqual([r.results.get(1), r.results.get(2), r.results.get(3)],
                   [["ACCOUNT_CITES_COUNSEL_MATTER"], ["ACCOUNT_CITES_COUNSEL_MATTER"], []]);
  assert.deepEqual(w.judged.at(-1).cited.holdings.map((h) => h.address), [`passage:${PAID}`], "no holding for the counsel matter's");
  assert.deepEqual(w.cacc.citedFor(sentences, [], reached, V("alice"), P).holdings.map((h) => h.address), [`passage:${PAID}`]);
  assert.deepEqual(w.snapshot(), snap, "writes nothing");
  /* control: the act's own project is read as before (a case of the counsel matter itself) */
  w.published("CASE-2026-0002", C);
  const own = w.cacc.accountJudged(args({ sentences, reached, caseId: "CASE-2026-0002" }));
  assert.equal(own.refusals.length, 0, JSON.stringify(own.refusals));
  assert.equal(w.judged.at(-1).cited.holdings.length, 5);
  assert.equal(w.cacc.citedFor(sentences, [], reached, V("alice"), C).holdings.length, 5);
  /* control: scope none, read as before */
  w.scope(C, "none");
  const none = w.cacc.accountJudged(args({ sentences, reached }));
  assert.equal(none.refusals.length, 0);
  assert.equal(w.judged.at(-1).cited.holdings.length, 5);
});

test("R14: a viewer who cannot see the counsel matter is told nothing of it — its cites have no holding, as any unseen cite, and no counsel refusal names them; the judgment's refusals follow the counsel refusal unchanged, and a judgment undetermined still carries it", () => {
  const { w, C } = setup();
  w.scope(C, COUNSEL_MATTER);
  const sentences = [{ text: "Counsel found the payment.", cites: [finding(QC)], bias_statement: null }];
  w.judgeAccount = () => ({ ok: true, refusals: [] });
  const cy = w.cacc.accountJudged(args({ sentences, viewer: V("cy") }));
  assert.deepEqual([cy.refusals, w.judged.at(-1).cited.holdings], [[], []]);
  assert.equal(JSON.stringify(cy).includes("counsel"), false);
  /* the counsel refusal first, the judgment's after it */
  const J = { ok: false, reason: "ACCOUNT_SENTENCE_UNSUPPORTED", code: "ACCOUNT_SENTENCE_UNSUPPORTED", sentences: [{ ord: 1 }] };
  w.judgeAccount = () => ({ ok: true, refusals: [J] });
  assert.deepEqual(w.cacc.accountJudged(args({ sentences })).refusals.map((x) => x.code), ["ACCOUNT_CITES_COUNSEL_MATTER", J.code]);
  w.judgeAccount = () => { throw new Error("down"); };
  assert.deepEqual(w.cacc.accountJudged(args({ sentences })).refusals.map((x) => x.code),
                   ["ACCOUNT_CITES_COUNSEL_MATTER", "ACCOUNT_CHECK_UNDETERMINED"]);
});

test("R14, R13: in a member's own text a cite into a counsel matter other than their own project is not_supported with ACCOUNT_CITES_COUNSEL_MATTER naming the cite (counsel), never read; control: the same cite with the matter's scope none is read as before", () => {
  const { w, C } = setup();
  const MINE = w.project("Mine", "alice");
  w.scope(MINE, "own");
  w.scope(C, COUNSEL_MATTER);
  const sentences = [{ text: "The fund paid $40,000.", cites: [passage(PAIDC)] }];
  const r = w.cacc.advocacyCheck({ project: MINE, sentences, author: V("alice"), viewer: V("alice") });
  assert.deepEqual(r.sentences[0], { ord: 1, result: "not_supported",
    codes: ["ACCOUNT_CITES_COUNSEL_MATTER", "ACCOUNT_SENTENCE_UNSUPPORTED"], findings: [], counsel: [`passage:${PAIDC}`] });
  w.scope(C, "none");
  const n = w.cacc.advocacyCheck({ project: MINE, sentences, author: V("alice"), viewer: V("alice") });
  assert.deepEqual([n.sentences[0].result, n.sentences[0].codes, "counsel" in n.sentences[0]], ["supported", [], false]);
});
