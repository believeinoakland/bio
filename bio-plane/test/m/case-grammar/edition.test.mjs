/* case-grammar at its interface: R8, what changed in an edition, and R9, the lens it was produced under, written by
   the line builders and read back, each with its negative controls; R1, a `/5` document stating every block at once,
   the earlier blocks unchanged; R3, the acknowledgement locator untouched by R8's `statement_sha`. Driven on the bytes
   alone. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import { WHAT_CHANGED_HEAD, WHAT_CHANGED_ORIGINS, whatChangedText, whatChangedBlockLines, whatChangedSectionLines,
         whatChangedOf, LENS_HEAD, LENS_STATEMENT_FIELDS, LENS_CITATION_FIELDS, LENS_KIND_WORDS, LENS_CLOSING_SENTENCES,
         LENS_NONE_SENTENCE, LENS_UNDETERMINED_SENTENCE, lensStatementKey, lensBlockLines, lensSectionLines, lensOf,
         editionStatementsOf, captureBlockLines, sourceBlockLines, caseDocumentBlocks, caseTensionsOf,
         caseDocumentStatesMemberBlocks, caseDocumentRequiresDisclosures, caseDocumentRequiresV4Disclosures,
         caseDocumentRequiresTensionSection, signedCitations, SECTIONS, attributionFrontmatterLines,
         attributionBodyLines } from "../../../src/case-grammar/index.mjs";
import { doc, tensionLines, sha, NOW, V } from "./helpers.mjs";

const V5 = "bio-case-document/5";
const OLDER = ["bio-case-document/4", "bio-case-document/3", "bio-case-document/2", "bio-case-document/1", null];
const read = (text) => { const p = parseFrontmatter(text); return { fm: p.data, body: p.body }; };
const STATEMENT = "Two findings were added: the 2019 minutes and the vendor's reply.\n\nWe changed the scope because "
  + "\"the reply\" named a second contract.";

/* ===== R8 ===== */

const wcDoc = (given, format = V5, { block = true, section = true } = {}) =>
  doc(format, block ? whatChangedBlockLines(given) : [],
      ["", ...(section ? whatChangedSectionLines(given.statement) : []), "## Scope", "", "The question.", ""]);

test("R8 the what_changed block and its section round-trip: statement_sha is the SHA-256 of the section's text, and all three origins' values read back", () => {
  assert.equal(WHAT_CHANGED_HEAD, "## What Changed in This Edition, and Why");
  assert.deepEqual([...WHAT_CHANGED_ORIGINS], ["member", "machine_draft"]);
  const member = wcDoc({ statement: STATEMENT, began_as: "member", draft: "DRAFT-1", adopted_as_drafted: true });
  const { fm, body } = read(member);
  assert.deepEqual(Object.keys(fm.what_changed), ["statement_sha", "began_as", "draft", "adopted_as_drafted"]);
  assert.equal(fm.what_changed.statement_sha, sha(STATEMENT), "the SHA-256 of the section's text");
  assert.equal(body.includes(`${WHAT_CHANGED_HEAD}\n\n${STATEMENT}\n\n## Scope`), true, "the statement is the section's text");
  assert.deepEqual(whatChangedOf(fm, body), { statement: STATEMENT, began_as: "member", draft: null, adopted_as_drafted: null },
                   "a statement begun by the member names no draft and no adoption");
  for (const adopted of [true, false]) {
    const m = read(wcDoc({ statement: STATEMENT, began_as: "machine_draft", draft: "RUN-2026-0007", adopted_as_drafted: adopted }));
    assert.deepEqual(whatChangedOf(m.fm, m.body),
                     { statement: STATEMENT, began_as: "machine_draft", draft: "RUN-2026-0007", adopted_as_drafted: adopted });
  }
  /* the text the section holds: line breaks made \n, trailing spaces and outer blank lines dropped, a heading escaped */
  const ragged = "\r\n\r\nFirst line.   \r\n## not a heading\r\n  # nor this\r\nLast.\n\n";
  assert.equal(whatChangedText(ragged), "First line.\n\\## not a heading\n\\# nor this\nLast.");
  const r = read(wcDoc({ statement: ragged, began_as: "member" }));
  assert.deepEqual(whatChangedOf(r.fm, r.body).statement, whatChangedText(ragged), "a heading-like line cannot end the section");
  assert.equal(r.fm.what_changed.statement_sha, sha(whatChangedText(ragged)));
  /* the statement may be read from the whole text too */
  assert.deepEqual(editionStatementsOf(member).what_changed, whatChangedOf(fm, body));
});

test("R8 R6 negative controls: no block and no section, a /4 or older document, and odd input answer null; a section that does not hash to the block's sha is undetermined; never throws", () => {
  const plain = read(doc(V5));
  assert.equal(whatChangedOf(plain.fm, plain.body), null, "a /5 document carrying neither");
  for (const format of OLDER) {
    const o = read(wcDoc({ statement: STATEMENT, began_as: "member" }, format));
    assert.equal(whatChangedOf(o.fm, o.body), null, `format ${format}`);
  }
  /* the section edited after the block was written: the sha no longer holds, so the statement is not answered */
  const edited = wcDoc({ statement: STATEMENT, began_as: "member" }).replace("Two findings", "Three findings");
  const e = read(edited);
  assert.deepEqual(whatChangedOf(e.fm, e.body), { statement: null, began_as: "member", draft: null, adopted_as_drafted: null });
  const noSection = read(wcDoc({ statement: STATEMENT, began_as: "member" }, V5, { section: false }));
  assert.equal(whatChangedOf(noSection.fm, noSection.body).statement, null, "a block with no section states no statement");
  const noBlock = read(wcDoc({ statement: STATEMENT }, V5, { block: false }));
  assert.deepEqual(whatChangedOf(noBlock.fm, noBlock.body),
                   { statement: STATEMENT, began_as: null, draft: null, adopted_as_drafted: null }, "never filled");
  const tampered = read(doc(V5, ["what_changed:", `  statement_sha: "${sha("x")}"`, "  began_as: machine_draft",
                                 "  draft: null", "  adopted_as_drafted: maybe"]));
  assert.deepEqual(whatChangedOf(tampered.fm, tampered.body),
                   { statement: null, began_as: "machine_draft", draft: null, adopted_as_drafted: null });
  for (const [fm, body] of [[null, null], [undefined, "x"], [7, 7], [{ format: V5 }, { toString() { throw new Error("boom"); } }],
                            [{ get format() { throw new Error("boom"); } }, ""], [{ format: V5, what_changed: [] }, ""]])
    assert.doesNotThrow(() => whatChangedOf(fm, body));
  assert.equal(whatChangedOf({ format: V5, what_changed: [] }, ""), null, "a list is not the block");
  assert.deepEqual(editionStatementsOf({ toString() { throw new Error("boom"); } }), { what_changed: null, lens: null });
  assert.deepEqual(whatChangedSectionLines(""), [WHAT_CHANGED_HEAD, "", ""]);
  assert.deepEqual(whatChangedBlockLines().slice(2), ["  began_as: null", "  draft: null", "  adopted_as_drafted: null"]);
});

/* ===== R9 ===== */

const SECRET = "SRC-THE-WITHHELD-ONE";
const LENS = [
  { bundle: "BIAS-2026-0001-instance", id: "s1", kind: "scrutiny", subject: "ENT-2026-0001", text: "Vendor filings need a second source.",
    justification: "Two of its filings were \"corrected\"\nlater.", citations: ["INFO-2026-0003-minutes",
      { citation: "https://example.org/report", printed: true }, { citation: SECRET, printed: false }, { citation: SECRET + "-2" }] },
  { bundle: "BIAS-2026-0001-instance", id: "s2", kind: "inference", subject: "ENT-2026-0002", text: "No intent is drawn from silence.",
    justification: "Silence has many causes.", citations: [] },
  { bundle: "BIAS-2026-0002-project", id: "s1", kind: "pattern", subject: "ENT-2026-0003", text: "The board defers late items.",
    justification: "Seen in six agendas.", citations: ["INFO-2026-0009-agenda"] },
];
const lensDoc = (statements, format = V5) => doc(format, lensBlockLines(statements),
  ["", ...lensSectionLines({ acknowledgement: "We weighed this lens against the new findings.", statements }), "## Scope", ""]);

test("R9 the lens blocks round-trip in the document's order: each statement with its printed citations, and withheld counting exactly its unprinted ones", () => {
  assert.deepEqual([...LENS_STATEMENT_FIELDS], ["bundle", "id", "kind", "subject", "text", "justification", "withheld"]);
  assert.deepEqual([...LENS_CITATION_FIELDS], ["statement", "citation"]);
  const text = lensDoc(LENS);
  const { fm } = read(text);
  assert.deepEqual(fm.lens_statements.map((r) => Object.keys(r)), LENS.map(() => [...LENS_STATEMENT_FIELDS]), "flat rows");
  assert.deepEqual(fm.lens_citations.map((r) => Object.keys(r)), fm.lens_citations.map(() => [...LENS_CITATION_FIELDS]));
  const lens = lensOf(fm);
  assert.deepEqual(lens, { statements: [
    { bundle: "BIAS-2026-0001-instance", id: "s1", kind: "scrutiny", subject: "ENT-2026-0001",
      text: "Vendor filings need a second source.", justification: "Two of its filings were 'corrected' later.",
      withheld: 2, citations: ["INFO-2026-0003-minutes", "https://example.org/report"] },
    { bundle: "BIAS-2026-0001-instance", id: "s2", kind: "inference", subject: "ENT-2026-0002",
      text: "No intent is drawn from silence.", justification: "Silence has many causes.", withheld: 0, citations: [] },
    { bundle: "BIAS-2026-0002-project", id: "s1", kind: "pattern", subject: "ENT-2026-0003",
      text: "The board defers late items.", justification: "Seen in six agendas.", withheld: 0,
      citations: ["INFO-2026-0009-agenda"] }] });
  /* a statement id is stable only within its bundle: two bundles' `s1` keep their own citations */
  assert.deepEqual(fm.lens_citations.map((c) => c.statement), [lensStatementKey("BIAS-2026-0001-instance", "s1"),
    lensStatementKey("BIAS-2026-0001-instance", "s1"), lensStatementKey("BIAS-2026-0002-project", "s1")]);
  /* withheld is the number of unprinted citations, per statement, whatever else is handed */
  for (const [i, s] of LENS.entries())
    assert.equal(lens.statements[i].withheld + lens.statements[i].citations.length, s.citations.length);
  assert.deepEqual(editionStatementsOf(text).lens, lens);
});

test("R9 a withheld citation is counted and never named: not in the bytes, not in the answer", () => {
  const text = lensDoc(LENS);
  assert.equal(text.includes(SECRET), false, "nothing in the document names a withheld citation");
  assert.equal(JSON.stringify(lensOf(read(text).fm)).includes(SECRET), false);
  assert.match(text, /Citations withheld: 2 \(which ones is not stated\)/);
  /* negative control: printed, the same citation is named */
  const shown = lensDoc([{ ...LENS[0], citations: [{ citation: SECRET, printed: true }] }]);
  assert.equal(shown.includes(SECRET), true);
  assert.equal(lensOf(read(shown).fm).statements[0].withheld, 0);
});

test("R9 N524 the section: the acknowledgement first, each statement's kind in plain words, its subject and text, then justification, printed citations and withheld count beneath, and the two sentences verbatim (the first Bob's, DEC-117), once", () => {
  assert.equal(LENS_HEAD, "## The Lens This Case Was Produced Under");
  assert.deepEqual({ ...LENS_KIND_WORDS }, {
    scrutiny: "a source this group checks more closely before relying on it",
    inference: "an inference this group allows or refuses to draw",
    pattern: "a pattern this group has evidence an institution or source follows" });
  assert.deepEqual([...LENS_CLOSING_SENTENCES], [
    "Everyone who investigates looks through a lens: what they care about and expect to find. An undeclared lens is the most dangerous kind.",
    "This group declares its lens, with its reasons and its evidence, so that you can weigh its findings knowing how it looked at the material."]);
  const lines = lensSectionLines({ acknowledgement: "Ours.", statements: LENS });
  assert.equal(lines[0], LENS_HEAD);
  assert.equal(lines[2], "**The publisher's acknowledgement.** Ours.", "the acknowledgement first");
  const body = lines.join("\n");
  for (const words of Object.values(LENS_KIND_WORDS)) assert.equal(body.includes(words), true, words);
  assert.deepEqual(lines.slice(6, 10), [
    "1. **a source this group checks more closely before relying on it** (`scrutiny`), on ENT-2026-0001: Vendor filings need a second source.",
    "   - Justification: Two of its filings were 'corrected' later.",
    "   - Evidence: INFO-2026-0003-minutes; https://example.org/report",
    "   - Citations withheld: 2 (which ones is not stated)"]);
  assert.deepEqual(lines.slice(11, 15).slice(1), ["   - Justification: Silence has many causes.", "   - Evidence: none printed",
                                                  "   - Citations withheld: none"]);
  for (const s of LENS_CLOSING_SENTENCES) assert.equal(body.split(s).length - 1, 1, "verbatim, once");
  assert.deepEqual(lines.slice(-4), [LENS_CLOSING_SENTENCES[0], "", LENS_CLOSING_SENTENCES[1], ""], "the two sentences close it");
  assert.equal(lines.slice(1).some((l) => l.startsWith("## ")), false, "nothing inside the section ends it");
  assert.equal(lensSectionLines({ statements: [] })[2], "**The publisher's acknowledgement.** No acknowledgement is stated.");
});

test("R9 R6 with no manifest in force the section states that none was, the blocks are empty and read back empty; undetermined is stated; a document without the blocks, a /4 document and odd input answer null", () => {
  const none = lensSectionLines({ acknowledgement: "Ours.", statements: [], inForce: false });
  assert.deepEqual(none, [LENS_HEAD, "", "**The publisher's acknowledgement.** Ours.", "", LENS_NONE_SENTENCE, "",
                          LENS_CLOSING_SENTENCES[0], "", LENS_CLOSING_SENTENCES[1], ""]);
  assert.match(LENS_NONE_SENTENCE, /^No manifest was in force when this case was published/);
  assert.deepEqual(lensBlockLines([]), ["lens_statements: []", "lens_citations: []"]);
  assert.deepEqual(lensOf(read(doc(V5, lensBlockLines([]))).fm), { statements: [] });
  const und = lensSectionLines({ acknowledgement: "Ours.", inForce: null, stated: "the pinned revision's bytes are missing" });
  assert.equal(und[4], `${LENS_UNDETERMINED_SENTENCE}: the pinned revision's bytes are missing.`);
  assert.equal(lensSectionLines({ inForce: null })[4], `${LENS_UNDETERMINED_SENTENCE}.`);
  assert.equal(lensOf(read(doc(V5)).fm), null, "a /5 document without the blocks");
  for (const format of OLDER) assert.equal(lensOf(read(lensDoc(LENS, format)).fm), null, `format ${format}`);
  const odd = lensOf({ format: V5, lens_statements: [{ bundle: "B", id: "x", withheld: "two" }, null, 7],
                       lens_citations: [{ statement: "B#x" }, { statement: "B#y", citation: "Z" }, null] });
  assert.deepEqual(odd, { statements: [{ bundle: "B", id: "x", kind: null, subject: null, text: null, justification: null,
                                          withheld: null, citations: [] }] }, "a withheld that is not a count is undetermined");
  for (const fm of [null, undefined, 7, "x", {}, [], { get format() { throw new Error("boom"); } },
                    { format: V5, get lens_statements() { throw new Error("boom"); } }])
    assert.equal(lensOf(fm), null);
  assert.deepEqual(lensBlockLines(null), ["lens_statements: []", "lens_citations: []"]);
  assert.deepEqual(lensBlockLines([null, 7]), ["lens_statements: []", "lens_citations: []"]);
});

/* ===== R1: a /5 document stating every block ===== */

test("R1 a /5 document states every block at once, each read back by its own reader, the three format predicates unchanged; R3 the acknowledgement run is not R8's statement_sha", () => {
  const CAP = sha("the knocked bytes");
  const fmLines = [
    "completeness:", "  author: member:olive", "  statement_sha: abc", "  acknowledged: 0", "completeness_excluded:",
    ...whatChangedBlockLines({ statement: STATEMENT, began_as: "member" }),
    ...attributionFrontmatterLines([{ observation: "INFO-2026-0099-o" }]),
    ...captureBlockLines([{ capture: CAP, member: "INQ-2026-0001", grade: "B", accounts: [{ by: V("olive"), at: NOW, text: "t", signature: "s" }] }]),
    ...sourceBlockLines([{ capture: CAP, stated: "name: Pat", basis: "consent" }]),
    ...tensionLines({ rows: [] }),
    ...lensBlockLines(LENS),
    "case_citations: []"];
  const bodyLines = ["", ...whatChangedSectionLines(STATEMENT), "## Scope", "", "The question.", "",
    "**Who else read this statement.** Nobody yet.", "",
    ...attributionBodyLines([{ observation: "INFO-2026-0099-o", level: null, why: "none" }]),
    ...lensSectionLines({ acknowledgement: "Ours.", statements: LENS }),
    "## What Was Searched", "", "Everything.", ""];
  const text = doc(V5, fmLines, bodyLines);
  const { fm, body } = read(text);
  assert.equal(parseFrontmatter(text).findings.length, 0, "the grammar reads every line");
  assert.deepEqual([caseDocumentStatesMemberBlocks(fm), caseDocumentRequiresDisclosures(fm),
                    caseDocumentRequiresV4Disclosures(fm), caseDocumentRequiresTensionSection(fm)], [true, true, true, true]);
  assert.equal(whatChangedOf(fm, body).statement, STATEMENT);
  assert.equal(lensOf(fm).statements.length, 3);
  const blocks = caseDocumentBlocks(text);
  assert.deepEqual([blocks.detail, blocks.captures.length, blocks.captures[0].accounts[0].text, blocks.sources.length],
                   [null, 1, "t", 1], "the earlier blocks unchanged");
  assert.deepEqual([caseTensionsOf(text).detail, caseTensionsOf(text).tensions], [null, []]);
  assert.deepEqual(signedCitations(text), { state: "signed", rows: [] });
  /* R3: the acknowledgement run starts at completeness's statement_sha, before and after the block is added */
  const lines = text.split("\n");
  const ack = SECTIONS.acknowledgements(lines);
  assert.equal(lines[ack.f0], "  statement_sha: abc");
  assert.equal(lines[ack.f1], "completeness_excluded:");
  /* negative control: with R8's block above completeness, the run still starts at completeness's own line */
  const above = ["---", `format: ${V5}`, ...whatChangedBlockLines({ statement: "x", began_as: "member" }),
    "completeness:", "  statement_sha: abc", "completeness_excluded:", "---", "", "**Who else read this statement.** No.", "",
    "## What Was Searched", ""];
  assert.deepEqual(SECTIONS.acknowledgements(above), { f0: above.indexOf("  statement_sha: abc"),
    f1: above.indexOf("completeness_excluded:"), b0: above.indexOf("**Who else read this statement.** No."),
    b1: above.indexOf("## What Was Searched") - 1 });
  assert.equal(SECTIONS.acknowledgements(above.filter((l) => l !== "  statement_sha: abc")), null,
               "R8's statement_sha is never taken for the acknowledgement list's");
  assert.equal(SECTIONS.attribution(lines) !== null, true);
});

test("R3 R8 a 'What changed' statement whose words begin a line as the acknowledgement run does is never taken for that run, so re-authoring the acknowledgements cannot splice over it", () => {
  const WHO = "**Who else read this statement.**";
  const statement = `${WHO} We asked two members to check it.\n  statement_sha: not the list's`;
  const lines = ["---", `format: ${V5}`, ...whatChangedBlockLines({ statement, began_as: "member" }),
    "completeness:", "  statement_sha: abc", "completeness_excluded:", "---", "", ...whatChangedSectionLines(statement),
    "## Scope", "", "The question.", "", `${WHO} Nobody yet.`, "", "## What Was Searched", ""];
  const ack = SECTIONS.acknowledgements(lines);
  assert.deepEqual(ack, { f0: lines.indexOf("  statement_sha: abc"), f1: lines.indexOf("completeness_excluded:"),
                          b0: lines.indexOf(`${WHO} Nobody yet.`), b1: lines.indexOf("## What Was Searched") - 1 });
  /* splicing the acknowledgement runs leaves the statement, and its sha, as signed */
  const spliced = [...lines.slice(0, ack.f0), "  statement_sha: def", ...lines.slice(ack.f1, ack.b0), `${WHO} Two read it.`,
                   ...lines.slice(ack.b1)];
  const { fm, body } = read(spliced.join("\n"));
  assert.equal(whatChangedOf(fm, body).statement, whatChangedText(statement));
  /* negative control: without the acknowledgement's own line, the statement's line is not taken in its place */
  assert.equal(SECTIONS.acknowledgements(lines.filter((l) => l !== `${WHO} Nobody yet.`)), null);
  /* and the same words outside R8's section are the run, as before */
  const outside = lines.map((l) => (l === WHAT_CHANGED_HEAD ? "## Earlier Notes" : l));
  assert.equal(SECTIONS.acknowledgements(outside).b0, outside.findIndex((l) => l.startsWith(WHO)));
});
