/* case-grammar at its interface: R17, the `grading_facts:` and `passages:` blocks a `/6` document signs per finding,
   written and read back exactly, with their negative controls, and `extractedTextOf`, the one extracted text; R14 reads
   a finding's chain from the signed blocks as it reads the per-finding files. Driven on the bytes alone. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter, canonicalJson } from "../../../src/record-grammar/index.mjs";
import * as CG from "../../../src/case-grammar/index.mjs";
import { doc, sha } from "./helpers.mjs";
import { caseFileFixture, editionInput, LEGS, PASSAGES, A, B, C } from "./casefile-fixture.mjs";

const V6 = "bio-case-document/6";
const OLDER = ["bio-case-document/5", "bio-case-document/4", "bio-case-document/3", "bio-case-document/2",
               "bio-case-document/1", null];
const fmOf = (text) => { const p = parseFrontmatter(text); assert.deepEqual(p.findings, [], "the grammar reads every line"); return p.data; };
const full = (fields, r) => Object.fromEntries(fields.map((f) => [f, r[f] ?? null]));

/* Values no front-matter line may fold: quotes of both kinds, a backslash, a line break, a comment mark, an apostrophe
   before a comment mark, unicode. */
const HARD = "It's \"final\" \\ here # not a comment\nsecond line 'quoted' — é";

test("R17 the grading_facts: block round-trips every leg of every finding exactly, strength R35's fields, lists and maps as canonical JSON, each finding's rows in ord order", () => {
  assert.deepEqual([...CG.GRADING_FACT_FIELDS], ["finding", "ord", "target", "kind", "role", "grade", "grade_axis",
    "grade_source", "ground", "target_edition", "answer", "origins", "origins_complete", "captures", "author_key"]);
  const rows = [
    ...LEGS,
    { finding: C, ord: 2, target: "INFO-2026-0005-x", kind: "document", role: "supports", grade: "C", grade_axis: "connection",
      grade_source: "resolution", ground: HARD, target_edition: null, answer: null, origins: [HARD, "b"], origins_complete: false,
      captures: [], author_key: HARD },
    { finding: C, ord: 1, target: "imported:abc/INQ-1", kind: "imported", role: "supports", target_edition: 3,
      answer: { connection: { grade: "C", state: "graded" }, capture: { grade: null, state: "undetermined" } } },
  ];
  const lines = CG.gradingFactsLines(rows);
  assert.equal(lines.includes(`    origins: '${canonicalJson([HARD, "b"]).replace(/'/g, "\\u0027")}'`), true, "a list is its canonical JSON in one quoted value");
  const back = CG.gradingFactsOf(fmOf(doc(V6, lines)));
  assert.deepEqual(Object.keys(back), [A, B, C], "findings in the order they first appear");
  assert.deepEqual(back[A], LEGS.filter((l) => l.finding === A).map((l) => full(CG.GRADING_FACT_FIELDS, l)));
  assert.deepEqual(back[B], LEGS.filter((l) => l.finding === B).map((l) => full(CG.GRADING_FACT_FIELDS, l)));
  assert.deepEqual(back[C], [full(CG.GRADING_FACT_FIELDS, rows[rows.length - 1]), full(CG.GRADING_FACT_FIELDS, rows[rows.length - 2])],
                   "in ord order, every value exactly as handed");
  assert.equal(back[C][1].ground, HARD);
  assert.equal(back[C][0].answer.connection.grade, "C");
  /* flat rows */
  assert.deepEqual(fmOf(doc(V6, lines)).grading_facts.map((r) => Object.keys(r)), rows.map(() => [...CG.GRADING_FACT_FIELDS]));
});

test("R17 K1317 the passages: block round-trips each relied-on passage exactly, with its chain (null when none), its extent in canonical form and its quoted text byte for byte", () => {
  assert.deepEqual([...CG.PASSAGE_FIELDS], ["finding", "ord", "content_id", "capture_sha", "extent", "chain", "quoted"]);
  const rows = [...PASSAGES,
    { finding: A, ord: 0, content_id: sha("p0"), capture_sha: sha("cap"), extent: { start: 1, end: 2 },
      chain: [{ op: "ocr", sha: sha("o") }, { op: "slice", at: [1, 2] }], quoted: HARD }];
  const back = CG.passagesOf(fmOf(doc(V6, CG.passagesLines(rows))));
  assert.deepEqual(back, { [A]: [full(CG.PASSAGE_FIELDS, rows[1]), full(CG.PASSAGE_FIELDS, rows[0])] });
  assert.equal(back[A][0].quoted, HARD, "the quoted text is the exact text, so it is found where it is said to be");
  assert.equal(back[A][1].chain, null, "no chain reads null");
  assert.equal(CG.passagesLines(rows).includes(`    extent: '${canonicalJson({ end: 2, start: 1 })}'`), true, "canonical form");
});

test("R17 negative controls: no block, an older format, odd input and odd values read null, never filled; an empty block reads empty; the writers never throw", () => {
  for (const [lines, of, key] of [[CG.gradingFactsLines, CG.gradingFactsOf, "grading_facts"], [CG.passagesLines, CG.passagesOf, "passages"]]) {
    assert.deepEqual(lines([]), [`${key}: []`]);
    assert.deepEqual(lines([null, 7, "x"]), [`${key}: []`]);
    for (const odd of [null, undefined, 7, "x", {}]) assert.deepEqual(lines(odd), [`${key}: []`]);
    assert.deepEqual(of(fmOf(doc(V6, lines([])))), {});
    assert.equal(of(fmOf(doc(V6))), null, "a /6 document without the block");
    for (const format of OLDER) assert.equal(of(fmOf(doc(format, lines([{ finding: A, ord: 1 }])))), null, `format ${format}`);
    for (const odd of [null, undefined, 7, "x", {}, [], { get format() { throw new Error("boom"); } },
                       { format: V6, get [key]() { throw new Error("boom"); } }])
      assert.equal(of(odd), null);
  }
  /* a value not written by the writer reads null, never guessed; a row with no finding is not any finding's */
  const odd = CG.gradingFactsOf({ format: V6, grading_facts: [{ finding: '"F"', ord: 1, target: "unquoted", grade: '"B' },
                                                              { ord: 2, target: '"x"' }, null] });
  assert.deepEqual(odd, { F: [{ ...full(CG.GRADING_FACT_FIELDS, {}), finding: "F", ord: 1 }] });
  /* a value canonical JSON cannot spell is written null */
  const cyclic = {}; cyclic.self = cyclic;
  assert.equal(CG.gradingFactsLines([{ finding: A, ord: 1, answer: cyclic }]).includes("    answer: null"), true);
});

test("R17 extractedTextOf is the one extracted text: the canonical JSON of the units in seq order, each {extent, ref, text}; text_sha is its SHA-256", () => {
  const units = [{ seq: 2, extent: { page: 2 }, ref: "u2", text: "second", extra: "dropped" },
                 { seq: 1, extent: { page: 1 }, ref: "u1", text: HARD },
                 { seq: 2, extent: { page: 3 }, ref: "u3", text: "tie, after u2" },
                 { seq: 0, ref: "u0" }, null, 7];
  const text = CG.extractedTextOf(units);
  assert.equal(text, canonicalJson([{ extent: null, ref: "u0", text: null }, { extent: { page: 1 }, ref: "u1", text: HARD },
                                    { extent: { page: 2 }, ref: "u2", text: "second" }, { extent: { page: 3 }, ref: "u3", text: "tie, after u2" }]));
  assert.equal(sha(CG.extractedTextOf([units[3], units[0], units[1], units[2]])), sha(text),
               "units handed in another order, ties kept in order, give the same text and text_sha");
  assert.notEqual(CG.extractedTextOf([units[2], units[0], units[1], units[3]]), text, "two units at one seq keep the order given");
  assert.equal(CG.extractedTextOf([]), "[]");
  for (const odd of [null, undefined, 7, "x", {}]) assert.equal(CG.extractedTextOf(odd), null);
  /* pure */
  const before = JSON.stringify(units);
  CG.extractedTextOf(units);
  assert.equal(JSON.stringify(units), before);
});

test("R17 R14 the complete edition reads each finding's chain and passages from the signed blocks, as it reads them from the per-finding files", () => {
  const signed = caseFileFixture();
  const files = caseFileFixture({ blocks: false });
  const findings = (cf) => { const h = CG.completeEditionOf(editionInput(cf.manifest, cf.files)); return h.slice(h.indexOf("<h2>2. "), h.indexOf("<h2>3. ")); };
  assert.equal(findings(signed), findings(files));
  assert.equal(findings(signed).includes("It&#39;s &quot;final&quot; # here"), true, "the passage as signed, escaped");
  /* the signed block wins over a file that disagrees with it */
  const tampered = new Map(signed.files);
  tampered.set(CG.caseFilePath("passages", A), JSON.stringify([{ quoted: "A FORGED PASSAGE" }]));
  assert.equal(findings({ manifest: signed.manifest, files: tampered }), findings(signed));
});
