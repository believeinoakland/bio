/* public-read — calculations in a published case (T33-65; C:A-15, C:A-12; K1448): R26 (`publishedCase` answers each
   calculation the signed document carries, every output a computed fact with its denominator beside it, the publisher's
   disclosure beside a differing or unbound one, nothing recomputed at the read) and R23's calculation clause (the case
   file carries each calculation and every input it names, by the hash the row states). The `calculations:` block is read
   through `case-grammar.calculationsOf` (its R18), injected here as a reader of one front-matter line until
   case-grammar's T33-60 merges and these tests re-point at its writer (K1563 (1)). Each claim has its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { publishedSix, sha } from "./fixture.mjs";
import { buildCaseFile } from "../../../src/public-read/casefile.mjs";
import { COMPUTED_FACT, CALC_DISCLOSED_SENTENCE, CALC_UNDISCLOSED_SENTENCE, SHARE_NO_DENOMINATOR_SENTENCE }
  from "../../../src/public-read/index.mjs";

const CG = { calculationsOf: (fm) => (fm && fm.x_calculations ? JSON.parse(fm.x_calculations) : []),
             timelineOf: () => null };
const line = (rows) => `x_calculations: '${JSON.stringify(rows)}'`;
const H = (c) => c.repeat(64);
const SHARE = { calc: "CALC-2026-0001", recipe: JSON.stringify({ method: "bio-calc/1", question: "How many contracts are at grade B?" }),
  inputs: [{ name: "contracts", sha256: H("a") }], method_version: "bio-calc/1@1",
  results: { at_b: { numerator: "41", denominator: "58", value: "0.706896551724" }, rows: "58" },
  result_key: H("1"), recompute: "agrees", disclosed: null };
const DIFFERS = { calc: "CALC-2026-0002", recipe: JSON.stringify({ method: "bio-calc/1" }),
  inputs: [{ name: "payments", sha256: H("b") }, { name: "contracts", sha256: H("a") }], method_version: "bio-calc/1@1",
  results: { late: { op: "share", value: "0.5" }, by_dept: [{ numerator: "3", denominator: "4", value: "0.75" }, "12"] },
  result_key: H("2"), recompute: "differs", disclosed: "Two payments were re-dated after we computed this; the share shown is the one we signed." };
const UNBOUND = { ...DIFFERS, calc: "CALC-2026-0003", results: { total: "9" }, recompute: "unbound", disclosed: null, result_key: H("3") };

test("R26 publishedCase answers each calculation the signed document carries: its question, its outputs by key each labelled a computed fact, a share with its numerator and denominator beside it, its method version and recompute status", () => {
  const { w } = publishedSix({ extra: [line([SHARE])], caseGrammar: CG });
  const c = w.read("publishedcase", { id: "CASE-2026-0001" });
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
  assert.equal(c.calculations.length, 1);
  const k = c.calculations[0];
  assert.deepEqual([k.calc, k.question, k.method_version, k.recompute, k.result_key, k.label],
    ["CALC-2026-0001", "How many contracts are at grade B?", "bio-calc/1@1", "agrees", H("1"), COMPUTED_FACT]);
  assert.deepEqual(k.outputs.map((o) => o.key), ["at_b", "rows"], "every output, by key");
  const share = k.outputs[0];
  assert.deepEqual([share.numerator, share.denominator, share.label], ["41", "58", COMPUTED_FACT],
    "the denominator beside the share, never a share alone");
  assert.deepEqual(share.result, SHARE.results.at_b, "the result as signed");
  assert.deepEqual([k.outputs[1].result, k.outputs[1].label], ["58", COMPUTED_FACT], "a count is a computed fact too");
  assert.equal(k.disclosed, null);
  assert.equal(Object.hasOwn(k, "disclosure_detail"), false, "an agreeing calculation needs no disclosure");
  /* no output and no calculation is called a finding, a breach or a violation (D275) */
  assert.doesNotMatch(JSON.stringify(c.calculations), /finding|breach|violation/i);
});

test("R26 a differing or unbound calculation is answered with the publisher's disclosure in their words beside it, or the statement that the document states none; a share whose row states no denominator answers it undetermined", () => {
  const { w } = publishedSix({ extra: [line([DIFFERS, UNBOUND])], caseGrammar: CG });
  const [d, u] = w.read("publishedcase", { id: "CASE-2026-0001" }).calculations;
  assert.deepEqual([d.recompute, d.disclosed, d.disclosure_detail], ["differs", DIFFERS.disclosed, CALC_DISCLOSED_SENTENCE]);
  assert.deepEqual([u.recompute, u.disclosed, u.disclosure_detail], ["unbound", null, CALC_UNDISCLOSED_SENTENCE]);
  const late = d.outputs.find((o) => o.key === "late");
  assert.deepEqual([late.denominator, late.denominator_detail], [null, SHARE_NO_DENOMINATOR_SENTENCE],
    "a share with no denominator is never served as a bare share");
  const groups = d.outputs.find((o) => o.key === "by_dept");
  assert.deepEqual(groups.groups.map((g) => [g.denominator ?? null, g.label]), [["4", COMPUTED_FACT], [null, COMPUTED_FACT]]);
  assert.equal(groups.groups[1].result, "12");
});

test("R26 nothing is recomputed at the read: a stored result is served exactly as signed, even one that does not follow from its numbers; a document without the block answers an empty list", () => {
  const wrong = { ...SHARE, results: { at_b: { numerator: "41", denominator: "58", value: "0.99" } } };
  const { w } = publishedSix({ extra: [line([wrong])], caseGrammar: CG });
  assert.equal(w.read("publishedcase", { id: "CASE-2026-0001" }).calculations[0].outputs[0].result.value, "0.99",
    "the checker recomputes (case-checker), the read never does");
  const none = publishedSix({ caseGrammar: CG }).w.read("publishedcase", { id: "CASE-2026-0001" });
  assert.deepEqual(none.calculations, []);
});

test("R23 the case file's facts carry each calculation the block lists, with every input it names by the row's hash", () => {
  const { w } = publishedSix({ extra: [line([SHARE, DIFFERS])], caseGrammar: CG });
  const f = w.read("casefilefacts", { caseId: "CASE-2026-0001", edition: 1 });
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  assert.deepEqual(f.calculations.map((c) => [c.row.calc, c.inputs.map((i) => i.sha)]),
    [["CALC-2026-0001", [H("a")]], ["CALC-2026-0002", [H("b"), H("a")]]]);
  const none = publishedSix({ caseGrammar: CG }).w.read("casefilefacts", { caseId: "CASE-2026-0001", edition: 1 });
  assert.deepEqual(none.calculations, []);
});

test("R23 the case file carries each calculation as its row and each input once, at the hash the row states; an input not held at that hash is named unheld, never carried under a wrong name", async () => {
  const enc = (s) => new TextEncoder().encode(s);
  const A = enc("contract,grade\n1,B\n"), B = enc("payment,date\n1,2026-01-02\n");
  const rows = [{ ...SHARE, inputs: [{ name: "contracts", sha256: sha(A) }] },
                { ...DIFFERS, inputs: [{ name: "payments", sha256: sha(B) }, { name: "contracts", sha256: sha(A) }] },
                { ...UNBOUND, inputs: [{ name: "gone", sha256: H("e") }, { name: "wrong", sha256: H("f") }] }];
  const docText = "---\nformat: bio-case-document/6\n---\n";
  const facts = { case: "CASE-2026-0001", edition: 1,
    document: { doc_sha: sha(enc(docText)), text: docText, sig_armored: "sig", key_b64: null },
    findings: [], grading: {}, passages: {}, materials: [], attestations: [],
    calculations: rows.map((row) => ({ row, inputs: row.inputs.map((i) => ({ sha: i.sha256, text: null })) })) };
  const bucket = new Map([[sha(A), A], [sha(B), B], [H("f"), enc("not these bytes")]]);
  const pathOf = (kind, key) => (kind === "calculation" ? `calculations/${key}/calculation.json`
    : kind === "calculation_input" ? `calculations/inputs/${key}` : (kind === "case_document" ? "case.md"
    : kind === "case_signature" ? "case.md.sig" : kind === "complete_edition" ? "complete-edition.html" : null));
  const built = await buildCaseFile({ facts, read: async (s) => bucket.get(s) ?? null, pathOf });
  assert.equal(built.ok, true, JSON.stringify(built).slice(0, 300));
  const calcs = built.files.filter((f) => f.kind === "calculation");
  assert.deepEqual(calcs.map((f) => f.path).sort(), rows.map((r) => `calculations/${r.calc}/calculation.json`).sort());
  for (const f of calcs) {
    const row = rows.find((r) => f.path.includes(r.calc));
    assert.deepEqual(JSON.parse(new TextDecoder().decode(f.content)), row, "the row, whole");
  }
  const inputs = built.files.filter((f) => f.kind === "calculation_input");
  assert.deepEqual(inputs.map((f) => f.sha256).sort(), [sha(A), sha(B)].sort(), "each held input once, at its own hash");
  for (const f of inputs) assert.equal(sha(f.content), f.sha256);
  assert.deepEqual(built.unheld.filter((u) => u.what === "calculation_input").map((u) => [u.ref, u.sha]),
    [["CALC-2026-0003", H("e")], ["CALC-2026-0003", H("f")]],
    "an input never captured and one whose bytes are another hash's are named, not carried");
  /* every carried file is listed in the manifest, nothing left out */
  assert.deepEqual(built.manifest.files.map((f) => f.path).sort(), built.files.map((f) => f.path).sort());
});
