/* case-authoring R56 (C:A-15; DEC-76.4; D370; K1448, K1570, K1594, K1633, K1634): the calculations and workbooks a
   case's findings rest on, recomputed and read before the act (the async gather), judged in R55's order, refused only
   when a load-bearing one differs or is unbound and is not disclosed, and written into the `calculations:` block with
   each one's state and the owner's words. `calculations` and `workbooks` are stand-ins at their ruled interfaces
   (calculations R8–R10, workbooks R2–R5), each answering the shapes the real modules answer; a finding's `calculation`
   leg (inquiry-grammar R14) is given through case-authoring's view of inquiry, since inquiry's gate does not yet admit
   one at promotion (reported to BOB). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED, WHAT_CHANGED } from "./fixture.mjs";
import { caseAuthoringOps, PUBLISH_ACT_CHECKS, CALCULATION_STATE_WORDS, DISCLOSED_WITHOUT_WORDS }
  from "../../../src/case-authoring/index.mjs";
import { calculationsOf } from "../../../src/case-grammar/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q", Q3 = "INQ-2026-0003-q";
const C1 = "CALC-2026-0001", C2 = "CALC-2026-0002";
const TABLE = "a".repeat(64);
const WORDS = "The council's own total omits the late invoices; we disclose the difference.";

/* calculations at its interface: `state` per calc is `agrees`, `differs`, `unbound` or `hidden`; `calls` records each. */
function calculationsStandIn(state, calls = []) {
  const read = async ({ calcId, viewer }) => {
    calls.push({ read: calcId, viewer });
    if (state[calcId] === "hidden" || !(calcId in state)) return { ok: true, found: false, calc_id: calcId };
    return { ok: true, found: true, calc_id: calcId, result_key: `key-${calcId}`, method_version: "bio-calc/1",
      calculation: { calc_id: calcId, recipe: { steps: [{ id: "t", op: "sum" }], output: "t" }, method_version: "bio-calc/1",
                     result_key: `key-${calcId}`, results: { t: { value: "12", precision: "exact" } } },
      /* C2 rests on a table alone; C1 also on a typed value, whose hash `read` does not state */
      inputs: calcId === C2 ? [{ name: "ledger", table: TABLE }] : [{ name: "ledger", table: TABLE }, { name: "rate", value: "0.5" }],
      grade: { inputs: [{ name: "ledger", kind: "table", grade: "B" },
                        { name: "rate", kind: "value", grade: "D", ...(state[calcId] === "unbound" ? { unbound: true } : {}) }] } };
  };
  const recompute = async ({ calcId }) => {
    calls.push({ recompute: calcId });
    return { ok: true, calc_id: calcId, agrees: state[calcId] !== "differs", results: {} };
  };
  return { read, recompute };
}

/* Q rests on DOC and C1; Q2 rests on Q3, which rests on C2 (a chain through an inquiry leg). */
function setup({ state = { [C1]: "differs", [C2]: "agrees" }, workbooks = null, legs = null } = {}) {
  const calls = [];
  const extra = legs || { [Q]: [C1], [Q3]: [C2] };
  const inquiry = (real) => new Proxy(real, { get: (t, k) => (k === "basisFor"
    ? (id, o) => { const b = t.basisFor(id, o); const more = (extra[id] || []).map((c, i) => ({ ord: 100 + i, target_id: c,
        target_type: "calculation", role: "supports" })); return b && b.ok !== false ? { ...b, legs: [...b.legs, ...more] } : b; }
    : typeof t[k] === "function" ? t[k].bind(t) : t[k]) });
  const w = world({ inquiry, deps: { calculations: calculationsStandIn(state, calls),
                                     workbooks: workbooks || { readWorkbook: async () => ({ ok: true, found: false }) } } });
  w.member("alice");
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  w.finding(Q3, [{ target: DOC }]);
  w.finding(Q2, [{ target: Q3 }]);
  const P = w.project("Team", "alice", [Q, Q2]);
  return { w, P, calls };
}
const op = (w, P, body, name = "publishcase") => caseAuthoringOps(w.ca,
  new URL(`http://do/${name}?author=alice&viewer=${encodeURIComponent(V("alice"))}&project=${P}`),
  { ...AUTHORED, whatChanged: WHAT_CHANGED, ...body })[name]();
const roles = (lb, sup = []) => Object.fromEntries([...lb.map((t) => [t, "load_bearing"]), ...sup.map((t) => [t, "supporting"])]);
const docOf = (w, r) => w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, r.caseId, r.edition).text;
const bodyOf = (text) => text.slice(text.indexOf("\n---\n", 4) + 5);
/* the block read back through case-grammar's one reading of it (its R18) */
const calcs = (w, r) => calculationsOf(w.fm(docOf(w, r)));

test("R56: op=publish recomputes and reads each calculation a member's chain reaches (through inquiry legs) before the act; a load-bearing one that differs and is not listed is CALCULATION_NOT_DISCLOSED with its row C-136.1, naming each calculation, its state and members, and nothing is written", async () => {
  const { w, P, calls } = setup({ state: { [C1]: "differs", [C2]: "differs" } });
  const before = w.snapshot();
  const r = await op(w, P, { targets: [Q, Q2], roles: roles([Q, Q2]) });
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "CALCULATION_NOT_DISCLOSED",
    "CALCULATION_NOT_DISCLOSED", "C-136.1", PUBLISH_ACT_CHECKS.CALCULATION_NOT_DISCLOSED.translation]);
  assert.deepEqual(r.calculations, [{ calc: C1, members: [Q], recompute: "differs" }, { calc: C2, members: [Q2], recompute: "differs" }]);
  assert.deepEqual(w.snapshot(), before, "no id drawn, nothing written");
  assert.deepEqual(calls.filter((c) => c.recompute).map((c) => c.recompute), [C1, C2], "recomputed at publication (calculations R8)");
  assert.ok(calls.filter((c) => c.read).every((c) => c.viewer === V("alice")), "read as the publisher sees it");
  /* negative control: each listed, with the owner's words, and it publishes, the block stating what it discloses */
  const ok = await op(w, P, { targets: [Q, Q2], roles: roles([Q, Q2]),
                              calculationsDisclosed: [{ calc: C1, words: WORDS }, { calc: C2 }] });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  const rows = calcs(w, ok);
  assert.deepEqual(rows.map((x) => [x.calc, x.recompute, x.disclosed]),
    [[C1, "differs", WORDS], [C2, "differs", DISCLOSED_WITHOUT_WORDS]], "listed with no words still reads as disclosed");
  assert.deepEqual(rows.map((x) => [x.method_version, x.recipe]), [["bio-calc/1", { steps: [{ id: "t", op: "sum" }], output: "t" }],
    ["bio-calc/1", { steps: [{ id: "t", op: "sum" }], output: "t" }]]);
  assert.deepEqual(rows[1].inputs, { ledger: TABLE }, "each input by name and SHA-256");
  assert.match(rows[1].result_key, /^[0-9a-f]{64}$/, "keyed by case-grammar from the row it writes");
  assert.deepEqual([rows[0].inputs, rows[0].result_key], [null, null], "an input whose hash read does not state: undetermined (J3 (2))");
  assert.deepEqual(rows[0].results, { t: { value: "12", precision: "exact" } });
  const body = bodyOf(docOf(w, ok));
  assert.ok(body.includes(`- ${C1}: ${CALCULATION_STATE_WORDS.differs}. Disclosed by the group: ${WORDS}`));
});

test("R56: a load-bearing calculation with an unbound input (calculations R9's grade facts) is unbound, and needs disclosure as one that differs; a differing state outranks unbound", async () => {
  const { w, P } = setup({ state: { [C1]: "unbound", [C2]: "agrees" } });
  const r = await op(w, P, { targets: [Q], roles: roles([Q]) });
  assert.deepEqual([r.reason, r.calculations], ["CALCULATION_NOT_DISCLOSED", [{ calc: C1, members: [Q], recompute: "unbound" }]]);
  const ok = await op(w, P, { targets: [Q], roles: roles([Q]), calculationsDisclosed: [{ calc: C1, words: "typed from the minutes" }] });
  assert.deepEqual(calcs(w, ok).map((x) => [x.recompute, x.disclosed]), [["unbound", "typed from the minutes"]]);
});

test("R56 (D370): no other state refuses — an agreeing calculation, a supporting member's differing one, and one listed that needs no disclosure all publish, each written with disclosed null; a calculation the viewer may not see is neither recomputed, judged nor written (calculations R10)", async () => {
  const { w, P, calls } = setup({ state: { [C1]: "agrees", [C2]: "differs" } });
  const r = await op(w, P, { targets: [Q, Q2], roles: roles([Q], [Q2]), calculationsDisclosed: [{ calc: C1, words: "fine" }] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(calcs(w, r).map((x) => [x.calc, x.recompute, x.disclosed]),
    [[C1, "agrees", null], [C2, "differs", null]]);
  const h = setup({ state: { [C1]: "hidden", [C2]: "agrees" } });
  const r2 = await op(h.w, h.P, { targets: [Q], roles: roles([Q]) });
  assert.equal(r2.ok, true, JSON.stringify(r2).slice(0, 300));
  assert.deepEqual(calcs(h.w, r2), [], "withheld whole: not written");
  assert.deepEqual(h.calls.filter((c) => c.recompute), [], "never recomputed");
  void calls;
});

test("R56: publishCase run without the gathered facts (a caller's own transaction, as review runs it) answers CALCULATIONS_UNREAD for a chain that reaches a calculation, never reading it as agreeing; with no calculation reached it needs none", async () => {
  const { w, P } = setup({ state: { [C1]: "agrees", [C2]: "agrees" } });
  const before = w.snapshot();
  const args = { ...AUTHORED, whatChanged: WHAT_CHANGED, project: P, targets: [Q], roles: roles([Q]), viewer: V("alice"), author: "alice" };
  const r = w.ca.publishCase(args);
  assert.deepEqual([r.ok, r.reason, r.calculations], [false, "CALCULATIONS_UNREAD", [C1]]);
  assert.deepEqual(w.snapshot(), before);
  const ok = w.ca.publishCase(args, await w.ca.calculationsAtPublication(args));
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  /* negative control: a finding whose chain reaches none */
  const n = setup({ legs: {} });
  assert.equal(n.w.ca.publishCase({ ...args, project: n.P }).ok, true);
});

test("R56: calculationsDisclosed absent or null is none; a list that is not one, an entry naming no calculation, or words outside the grammar is R3's BAD_COMPLETENESS naming the field, before anything is written", async () => {
  const { w, P } = setup({ state: { [C1]: "agrees", [C2]: "agrees" } });
  for (const [list, field] of [["x", "calculationsDisclosed"], [[C1], "calculationsDisclosed[0]"], [[{ words: "w" }], "calculationsDisclosed[0]"],
                               [[{ calc: C1, words: 5 }], "calculationsDisclosed[0].words"],
                               [[{ calc: C1, words: 'a "q"' }], "calculationsDisclosed[0].words"],
                               [[{ calc: C1, words: "x".repeat(2001) }], "calculationsDisclosed[0].words"]]) {
    const r = await op(w, P, { targets: [Q], roles: roles([Q]), calculationsDisclosed: list });
    assert.deepEqual([r.reason, r.field], ["BAD_COMPLETENESS", field], JSON.stringify(list).slice(0, 40));
  }
  for (const none of [null, undefined]) {
    const f = setup({ state: { [C1]: "agrees", [C2]: "agrees" } });
    assert.equal((await op(f.w, f.P, { targets: [Q], roles: roles([Q]), calculationsDisclosed: none })).ok, true);
  }
});

test("R56 (K1570, K1594): a workbook among the captures a member rests on is read through workbooks.readWorkbook and never recomputed; one that differs (its latest recompute, or a binding) or has an unbound input needs disclosure when load-bearing; one not recomputed here is written so and never refuses", async () => {
  const asked = [];
  const answer = { status: "differs", binding: true, bound: true };
  const workbooks = { readWorkbook: async ({ captureSha, project, viewer }) => {
    asked.push({ captureSha, project, viewer });
    return { ok: true, workbook: { capture_sha: captureSha, project },
             bindings: [{ binding_id: 1, agrees: answer.binding }], inputs: [{ cell: "A1", bound: answer.bound }],
             recompute: { status: answer.status, engine: "IronCalc", engine_version: "0.5" } };
  }, recompute: () => { throw new Error("never recomputed here"); } };
  const { w, P } = setup({ state: {}, legs: {}, workbooks });
  const cap = w.head(DOC) && w.row(`SELECT capture_sha FROM register WHERE bundle_id=?`, DOC).capture_sha;
  const r = await op(w, P, { targets: [Q], roles: roles([Q]) });
  assert.deepEqual([r.reason, r.calculations], ["CALCULATION_NOT_DISCLOSED", [{ calc: cap, members: [Q], recompute: "differs" }]]);
  assert.deepEqual(asked[0], { captureSha: cap, project: P, viewer: V("alice") });
  Object.assign(answer, { status: "agrees", binding: false });
  assert.equal((await op(w, P, { targets: [Q], roles: roles([Q]) })).calculations[0].recompute, "differs", "a differing binding");
  Object.assign(answer, { status: "agrees", binding: true, bound: false });
  assert.equal((await op(w, P, { targets: [Q], roles: roles([Q]) })).calculations[0].recompute, "unbound");
  Object.assign(answer, { status: "not recomputed here", binding: true, bound: true });
  const ok = await op(w, P, { targets: [Q], roles: roles([Q]) });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  const row = calcs(w, ok)[0];
  /* case-grammar R18's fourth status, a workbook not recomputed here (K1639 (3), K1642), never a gate */
  assert.deepEqual([row.calc, row.recompute, row.disclosed, row.method_version], [cap, "not_recomputed", null, "IronCalc 0.5"]);
  assert.ok(bodyOf(docOf(w, ok)).includes(`- ${cap}: ${CALCULATION_STATE_WORDS.not_recomputed}.`));
});

test("R56, R55: the calculations judgment is asked after case-disclosures' flags and before the people the case names (R55's order): a case refused on both answers the calculation first", async () => {
  const { w, P } = setup({ state: { [C1]: "differs", [C2]: "agrees" } });
  const person = w.entities.createEntity({ kind: "person", label: "Pat Example", note: "registered by the test", declaredBy: V("alice") });
  assert.equal(person.ok, true);
  const statement = `It does not cover what ${person.entity_id} said afterwards.`;
  const r = await op(w, P, { targets: [Q], roles: roles([Q]), statement });
  assert.equal(r.reason, "CALCULATION_NOT_DISCLOSED");
  const r2 = await op(w, P, { targets: [Q], roles: roles([Q]), statement, calculationsDisclosed: [{ calc: C1 }] });
  assert.equal(r2.reason, "PERSON_BASIS_UNRECORDED");
});

test("R34: the pre-flight (op=publishpreflight, which gathers as op=publish does) answers R56's refusal as first exactly as op=publish gives it, lists it among blockers when op=publish refuses earlier, and writes nothing of the case", async () => {
  const { w, P } = setup({ state: { [C1]: "differs", [C2]: "agrees" } });
  const before = w.snapshot();
  const pre = await op(w, P, { targets: [Q], roles: roles([Q]) }, "publishpreflight");
  const pub = await op(w, P, { targets: [Q], roles: roles([Q]) });
  assert.deepEqual(pre.first, pub);
  assert.equal(pre.ready, false);
  assert.deepEqual(w.snapshot(), before, "neither wrote");
  /* an earlier refusal (R6's bar): the calculation is still a blocker */
  const P2 = w.project("Barred", "alice", [Q], { extra: ["required_strength:", "  capture: A"] });
  const pre2 = await op(w, P2, { targets: [Q], roles: roles([Q]) }, "publishpreflight");
  assert.equal(pre2.first.reason, "BELOW_PROJECT_STRENGTH");
  assert.ok(pre2.blockers.some((b) => b.reason === "CALCULATION_NOT_DISCLOSED"), JSON.stringify(pre2.blockers).slice(0, 300));
});

test("R56: the gather answers nothing for an act R1, R2 or R4 refuses first, so the act answers that refusal and nothing is recomputed", async () => {
  const { w, P, calls } = setup();
  for (const a of [{ author: "class:daemon" }, { author: "alice", project: null }, { author: "alice", project: P, targets: ["INQ-2026-0404-x"] }]) {
    const f = await w.ca.calculationsAtPublication({ viewer: V("alice"), targets: [Q], project: P, ...a });
    assert.deepEqual(f, { calculations: [], workbooks: [] });
  }
  assert.deepEqual(calls, []);
});
