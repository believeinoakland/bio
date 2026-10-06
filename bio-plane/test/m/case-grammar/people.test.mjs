/* case-grammar at its interface: R21, the case document's `people:` and `member_ties:` blocks (K1816, `case-disclosures`
   R28's spelling, moved here): written flat and read back exactly, the bytes pinned both ways to `case-disclosures`'
   spelling as it stood before the move, with their negative controls. Driven on the bytes alone. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import * as CG from "../../../src/case-grammar/index.mjs";
import { doc } from "./helpers.mjs";

const fmOf = (text) => { const p = parseFrontmatter(text); assert.deepEqual(p.findings, [], "the grammar reads every line"); return p.data; };

const PEOPLE = [
  { person: "ENT-2026-0001", places: "statement s1; claim INQ-2026-0001-a", basis: "tie", citation: "line LIN-2026-0001", words: null },
  { person: "ENT-2026-0002", places: "timeline TL-1", basis: "private_party", citation: null, words: "Named as the landlord." },
];
const TIES = [
  { row: "attestation", signer: "member:olive", at: "2026-10-06T00:00:00Z", entity: null, kind: null, level: "name", shown: "olive" },
  { row: "tie", signer: null, at: null, entity: "ENT-2026-0003", kind: "employer", level: "group", shown: null },
];
/* The bytes `case-disclosures`' `peopleLines` and `memberTieLines` wrote for these rows before the move (K1816). */
const PEOPLE_BYTES = ["people:",
  "  - person: ENT-2026-0001", '    places: "statement s1; claim INQ-2026-0001-a"', "    basis: tie",
  '    citation: "line LIN-2026-0001"', "    words: null",
  "  - person: ENT-2026-0002", '    places: "timeline TL-1"', "    basis: private_party", "    citation: null",
  '    words: "Named as the landlord."'];
const TIE_BYTES = ["member_ties:",
  "  - row: attestation", '    signer: "member:olive"', '    at: "2026-10-06T00:00:00Z"', "    entity: null", "    kind: null",
  "    level: name", '    shown: "olive"',
  "  - row: tie", "    signer: null", "    at: null", "    entity: ENT-2026-0003", "    kind: employer", "    level: group",
  "    shown: null"];

test("R21 the people: and member_ties: blocks are spelled byte for byte as case-disclosures R28 spelled them, and those bytes read back as the rows: one document of each block, both ways", () => {
  assert.deepEqual([...CG.PEOPLE_FIELDS], ["person", "places", "basis", "citation", "words"]);
  assert.deepEqual([...CG.MEMBER_TIE_FIELDS], ["row", "signer", "at", "entity", "kind", "level", "shown"]);
  /* rows to bytes */
  assert.deepEqual(CG.peopleLines(PEOPLE), PEOPLE_BYTES);
  assert.deepEqual(CG.memberTieLines(TIES), TIE_BYTES);
  /* bytes to rows: each document alone, and both in one */
  assert.deepEqual(CG.peopleOf(fmOf(doc(CG.CASE_DOCUMENT_FORMAT, PEOPLE_BYTES))), PEOPLE);
  assert.deepEqual(CG.memberTiesOf(fmOf(doc(CG.CASE_DOCUMENT_FORMAT, TIE_BYTES))), TIES);
  const both = fmOf(doc(CG.CASE_DOCUMENT_FORMAT, [...PEOPLE_BYTES, ...TIE_BYTES]));
  assert.deepEqual([CG.peopleOf(both), CG.memberTiesOf(both)], [PEOPLE, TIES]);
  /* flat rows */
  assert.deepEqual(both.people.map((r) => Object.keys(r)), PEOPLE.map(() => [...CG.PEOPLE_FIELDS]));
  assert.deepEqual(both.member_ties.map((r) => Object.keys(r)), TIES.map(() => [...CG.MEMBER_TIE_FIELDS]));
});

test("R21 every field reads back a string or null: a quote, backslash or line break in a quoted value is made safe on one line; a value written bare reads as its string; a field not handed is null", () => {
  const odd = [{ person: "ENT-2026-0009", places: 'statement "s1"\nclaim c\\2', basis: "consent", citation: "capture  x ", words: 7 }];
  assert.deepEqual(CG.peopleOf(fmOf(doc(CG.CASE_DOCUMENT_FORMAT, CG.peopleLines(odd)))),
                   [{ person: "ENT-2026-0009", places: "statement 's1' claim c'2", basis: "consent", citation: "capture  x", words: "7" }]);
  assert.deepEqual(CG.memberTiesOf(fmOf(doc(CG.CASE_DOCUMENT_FORMAT, CG.memberTieLines([{ row: "tie", level: 2 }])))),
                   [{ row: "tie", signer: null, at: null, entity: null, kind: null, level: "2", shown: null }]);
  /* read from front matter another hand parsed: numbers, booleans and absent fields */
  assert.deepEqual(CG.memberTiesOf({ member_ties: [{ row: "tie", entity: 3, kind: true }, null, 7, ["x"]] }),
                   [{ row: "tie", signer: null, at: null, entity: "3", kind: "true", level: null, shown: null }]);
  for (const r of [...CG.peopleOf(fmOf(doc(null, PEOPLE_BYTES))), ...CG.memberTiesOf(fmOf(doc(null, TIE_BYTES)))])
    for (const v of Object.values(r)) assert.equal(v === null || typeof v === "string", true);
});

test("R21 R6 negative controls: a document without the blocks, empty blocks and odd input read back as empty lists; the writers never throw and write no row that is not an object", () => {
  assert.deepEqual([CG.peopleLines([]), CG.memberTieLines([])], [["people:"], ["member_ties:"]], "an empty block is its key alone");
  for (const odd of [null, undefined, 7, "x", {}, [null, 7, "x", ["a"]]])
    assert.deepEqual([CG.peopleLines(odd), CG.memberTieLines(odd)], [["people:"], ["member_ties:"]]);
  /* a row that cannot be spelled is not written; the others are */
  const bad = { person: { toString() { throw new Error("boom"); } } };
  assert.deepEqual(CG.peopleLines([bad, PEOPLE[0]]), PEOPLE_BYTES.slice(0, 6));
  const empty = fmOf(doc(CG.CASE_DOCUMENT_FORMAT, [...CG.peopleLines([]), ...CG.memberTieLines([])]));
  assert.deepEqual([CG.peopleOf(empty), CG.memberTiesOf(empty)], [[], []], "empty blocks read back empty");
  assert.deepEqual([CG.peopleOf(fmOf(doc(CG.CASE_DOCUMENT_FORMAT))), CG.memberTiesOf(fmOf(doc(CG.CASE_DOCUMENT_FORMAT)))], [[], []],
                   "a document without them");
  for (const odd of [null, undefined, 7, "x", {}, [], { people: "x", member_ties: 7 },
                     { get people() { throw new Error("boom"); }, get member_ties() { throw new Error("boom"); } },
                     { people: [{ person: { toString() { throw new Error("boom"); } } }] }])
    assert.deepEqual([CG.peopleOf(odd), CG.memberTiesOf(odd)], [[], []]);
  /* pure: the same answer twice, the front matter untouched */
  const fm = fmOf(doc(CG.CASE_DOCUMENT_FORMAT, [...PEOPLE_BYTES, ...TIE_BYTES]));
  const before = JSON.stringify(fm);
  assert.deepEqual([CG.peopleOf(fm), CG.memberTiesOf(fm)], [CG.peopleOf(fm), CG.memberTiesOf(fm)]);
  assert.equal(JSON.stringify(fm), before);
});
