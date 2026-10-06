/* case-authoring (T34-48; N664, DEC-149, K1799): every member-facing string this module writes that called the group's
   Civicsmith "this instance", "this copy", "this plane" or "the plane" says "your group's Civicsmith", or, in the case
   document (which a reader outside the group also reads), is worded so it needs no name. Each changed string is driven
   through the module's interface and named here; model- and operator-facing text and comments are not asked. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED, T0, readingLines, currentLines } from "./fixture.mjs";
import { caseAuthoringOps, PUBLISH_ACT_CHECKS, CASE_DERIVATION_CHECKS, STATEMENT_ACK_CHECKS, caseDocumentText,
         searchedSection } from "../../../src/case-authoring/index.mjs";
import { calculationBodyLines } from "../../../src/case-authoring/document.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q", C1 = "CALC-2026-0001";
const ALICE = "member:alice";
const YOURS = "your group's Civicsmith";
/* the names DEC-149 retires for the group's Civicsmith, in any of this module's member-facing words */
const RETIRED = /\b(this|the) (plane|instance|copy)\b|\binstance statement\b/i;
const says = (text, ...wanted) => { for (const s of wanted) assert.ok(String(text).includes(s), `says: ${s}`);
                                    assert.doesNotMatch(String(text), RETIRED); };

function setup(opts) {
  const w = world(opts);
  for (const m of ["alice", "bo"]) w.member(m);
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  w.join(P, "bo");
  return { w, P };
}
const docText = (w, r) => w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, r.caseId, r.edition).text;

test("R29, R56 (DEC-149): C-136.1's translation and CALCULATION_NOT_DISCLOSED's detail say a calculation differs when your group's Civicsmith recomputes it", async () => {
  says(PUBLISH_ACT_CHECKS.CALCULATION_NOT_DISCLOSED.translation,
    `gives a different result when ${YOURS} recomputes it, or rests on a figure typed in without a source`);
  /* the refusal, through op=publish, over a calculation that differs on recompute (calculations at its interface) */
  const calculations = {
    read: async ({ calcId }) => ({ ok: true, found: true, calc_id: calcId, method_version: "bio-calc/1",
      calculation: { calc_id: calcId, recipe: { steps: [{ id: "t", op: "sum" }], output: "t" }, method_version: "bio-calc/1",
                     results: {}, inputs: [{ name: "ledger", kind: "table", sha: "a".repeat(64) }] },
      inputs: [{ name: "ledger", table: "a".repeat(64) }], grade: { inputs: [] } }),
    recompute: async ({ calcId }) => ({ ok: true, calc_id: calcId, agrees: false }) };
  const inquiry = (real) => new Proxy(real, { get: (t, k) => (k === "basisFor"
    ? (id, o) => { const b = t.basisFor(id, o); return b && b.ok !== false && id === Q
        ? { ...b, legs: [...b.legs, { ord: 100, target_id: C1, target_type: "calculation", role: "supports" }] } : b; }
    : typeof t[k] === "function" ? t[k].bind(t) : t[k]) });
  const { w, P } = setup({ inquiry, deps: { calculations, workbooks: { readWorkbook: async () => ({ ok: true, found: false }) } } });
  const r = await caseAuthoringOps(w.ca, new URL(`http://do/publishcase?author=alice&viewer=${encodeURIComponent(V("alice"))}&project=${P}`),
    { ...AUTHORED, targets: [Q], roles: { [Q]: "load_bearing" } }).publishcase();
  assert.deepEqual([r.reason, r.translation], ["CALCULATION_NOT_DISCLOSED", PUBLISH_ACT_CHECKS.CALCULATION_NOT_DISCLOSED.translation]);
  says(r.detail, `a calculation that gives a different result when ${YOURS} recomputes it`);
});

test("R3 (DEC-149): NO_SCOPE's detail says a scope your group's Civicsmith wrote is not a scope the group made", () => {
  const { w, P } = setup();
  const r = w.publish(P, "alice", [Q], { scope: "" });
  assert.equal(r.reason, "NO_SCOPE");
  says(r.detail, `a scope ${YOURS} wrote is not a scope the group made`);
});

test("R4 (DEC-149): NOT_CONCLUDED's detail for an undetermined stance says the project's latest entry names an act your group's Civicsmith does not know", () => {
  const w = world();
  w.member("alice"); w.doc(DOC);
  w.finding(Q, [{ target: DOC }], { state: "open", lines: readingLines("first", [DOC]) });
  const P = w.project("Team", "alice", [Q], { extra: [...currentLines(Q), "conclusions:", `  - inquiry: "${Q}"`,
    `    act: "reconsidered"`, `    at: "${T0}"`, `    by: "${ALICE}"`] });
  const r = w.publish(P, "alice", [Q]);
  assert.deepEqual([r.reason, r.why], ["NOT_CONCLUDED", "project_stance_undetermined"]);
  says(r.detail, `latest entry about this question names an act ${YOURS} does not know`);
});

test("R19 (DEC-149): STATEMENT_ACK_AUTHOR_UNDETERMINED's detail (C-82.7) says the draft was written before your group's Civicsmith stamped an author, and that your group's Civicsmith cannot tell whether you are the first reader; its translation and every other row of this module's three families name no retired word", () => {
  const { w, P } = setup();
  w.draft("DRAFT-2026-0001", P, { statement: "A sentence nobody signed for." }, { statementBy: null });
  const r = w.ca.acknowledgeStatement({ viewer: V("bo"), draft: "DRAFT-2026-0001", reason: "I read it." });
  assert.equal(r.reason, "STATEMENT_ACK_AUTHOR_UNDETERMINED");
  says(r.detail, `it was written before ${YOURS} stamped one`, `and ${YOURS} cannot tell here whether you are the first`);
  /* every row of this module's own three families */
  for (const row of [...Object.values(PUBLISH_ACT_CHECKS), ...Object.values(CASE_DERIVATION_CHECKS),
                     ...Object.values(STATEMENT_ACK_CHECKS)])
    assert.doesNotMatch(row.translation, RETIRED, row.check);
});

test("R21, R14 (DEC-149): the statement's writer, stated in the case document — a named draft or a draft from before authors were recorded, and drafts whose arguments cannot be read — needs no name for the group's Civicsmith", () => {
  /* a named draft that records no author */
  const a = setup();
  a.w.draft("DRAFT-2026-0001", a.P, { statement: AUTHORED.statement }, { statementBy: null });
  const named = a.w.publish(a.P, "alice", [Q], { draft: "DRAFT-2026-0001" });
  assert.equal(named.completeness.statement_by, null);
  says(named.completeness.statement_by_stated, "it was written before drafts recorded their authors");
  says(docText(a.w, named).split("**Who wrote this statement.**")[1].split("\n")[0], "before drafts recorded their authors");
  /* a draft holding the sentence that records no author, none named */
  const b = setup();
  b.w.draft("DRAFT-2026-0001", b.P, { statement: AUTHORED.statement }, { statementBy: null });
  const unrecorded = b.w.publish(b.P, "alice", [Q]);
  says(unrecorded.completeness.statement_by_stated, "records no author — it was written before drafts recorded their authors — so who");
  /* a draft at this identity whose arguments will not parse */
  const c = setup();
  c.w.st.sql.exec(`INSERT INTO case_drafts (draft_id, project_id, case_id, params, created_by, created_at, updated_by,
                   updated_at, statement_by) VALUES ('DRAFT-2026-0009', ?, NULL, '{not json', 'bo', ?, 'bo', ?, 'bo')`, c.P, T0, T0);
  const unreadable = c.w.publish(c.P, "alice", [Q]);
  assert.equal(unreadable.completeness.statement_by, null);
  says(unreadable.completeness.statement_by_stated, "(DRAFT-2026-0009) hold arguments that cannot be read, so whether this");
});

test("R14, R56 (DEC-149): the case document's Bias Manifest section (in force with an override refused, and none in force) and its calculations section need no name for the group's Civicsmith", () => {
  const lens = { in_force: true, statements_sha: "f".repeat(64), lock_violations: [{ id: "s1" }], pins_proposed: [],
                 bundles: [{ bundle_id: "BIAS-2026-0001-lens", revision: "a".repeat(64), scope: "instance" }] };
  const { w, P } = setup({ deps: { bias: { biasManifest: () => lens } } });
  const on = w.publish(P, "alice", [Q]);
  assert.equal(on.ok, true, JSON.stringify(on).slice(0, 300));
  const section = (t) => t.slice(t.indexOf("## Bias Manifest"), t.indexOf("## Citations"));
  says(section(docText(w, on)), `when it was published, computed then and frozen here`,
    "1 project override(s) named a LOCKED group-wide statement and were refused their effect; the group-wide statement stands");
  const off = setup();
  const none = off.w.publish(off.P, "alice", [Q]);
  says(section(docText(off.w, none)), "no bias set stood adopted for the group or this project");
  /* the calculations section, as the document writes it */
  says(calculationBodyLines([{ calc: C1, recompute: "agrees", disclosed: null }]).join("\n"),
    "Each calculation below was recomputed when the case was published, never on a later read.");
  /* the same words through the document writer itself */
  const text = caseDocumentText({ caseId: "CASE-2026-0001", edition: 1, project: P, scope: "s", bias: "b",
    bar: w.strength.projectBar(P), roster: [Q], roles: [{ target: Q, role: "load_bearing" }], pins: new Map([[Q, "p"]]),
    statement: "st", position: "not_sought", justification: "j", excluded: [], author: "alice", at: "t",
    searched: searchedSection({ at: "t", subjectSource: "case_basis", levels: [] }), frozen: new Map(),
    calculations: [{ calc: C1, recompute: "differs", disclosed: "ours" }] });
  says(text.slice(text.indexOf("## Calculations This Case Rests On")), "was recomputed when the case was published");
});
