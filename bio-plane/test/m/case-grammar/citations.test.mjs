/* case-grammar at its interface: R4, the citations a signed document carries, with R6's undetermined statement, and
   R5, the edge set a finding rests on (D-431; the arms `ratify-authority.test.mjs` §8 pins). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { signedCitations, CITATIONS_UNDETERMINED_SENTENCE, publishedGraphEdges } from "../../../src/case-grammar/index.mjs";
import { doc, sha } from "./helpers.mjs";

const citations = (rows) => ["case_citations:", ...rows.flatMap((c) => [`  - target: ${c.target}`,
  `    version: ${c.version}`, ...(c.capture !== undefined ? [`    capture: ${c.capture ?? "null"}`] : [])])];
const ROWS = [{ target: "INFO-2026-0001-minutes", version: "pinned", capture: sha("bytes") },
              { target: "INFO-2026-0002-agenda", version: "only_capture", capture: null }];

test("R4 a /5 or /4 document carrying case_citations answers them as signed", () => {
  for (const format of ["bio-case-document/5", "bio-case-document/4"])
    assert.deepEqual(signedCitations(doc(format, citations(ROWS))), { state: "signed", rows: ROWS.map((r) => ({ ...r })) });
  assert.deepEqual(signedCitations(doc("bio-case-document/4", ["case_citations: []"])), { state: "signed", rows: [] });
});

test("R4 R6 every other document states its citation versions undetermined, never filled: /3 and older, a /4 without the list, and anything unreadable", () => {
  const undetermined = { state: "undetermined", rows: null, stated: CITATIONS_UNDETERMINED_SENTENCE };
  assert.equal(CITATIONS_UNDETERMINED_SENTENCE, "version undetermined (signed before capture pins): this document was "
    + "signed before a case's citation edges were pinned to the capture they were made against, and it carries neither");
  for (const format of ["bio-case-document/3", "bio-case-document/2", "bio-case-document/1", null])
    assert.deepEqual(signedCitations(doc(format, citations(ROWS))), undetermined, `format ${format}`);
  assert.deepEqual(signedCitations(doc("bio-case-document/4")), undetermined);
  assert.deepEqual(signedCitations(doc("bio-case-document/5", ["case_citations: none"])), undetermined);
  for (const odd of [null, undefined, "", 7, "not a document", {}, { toString() { throw new Error("boom"); } }])
    assert.deepEqual(signedCitations(odd), undetermined);
});

test("R5 every references[] entry naming a string target is a serve edge, its rel the kind (cites when none); division disclosures are name-only", () => {
  const fm = {
    references: [{ target: "INFO-2026-0001-a", rel: "cites" }, { target: "INFO-2026-0002-b", rel: "relates_to" },
                 { target: "INFO-2026-0003-c" }, { target: "INFO-2026-0004-d", rel: "" }, { target: 7 }, null, "INFO-x"],
    division_parent: "INQ-2026-0001",
    division_siblings: ["INQ-2026-0002", "", 3, "INQ-2026-0003"],
  };
  assert.deepEqual(publishedGraphEdges(fm), [
    { to: "INFO-2026-0001-a", kind: "cites", disclosure: "serve" },
    { to: "INFO-2026-0002-b", kind: "relates_to", disclosure: "serve" },
    { to: "INFO-2026-0003-c", kind: "cites", disclosure: "serve" },
    { to: "INFO-2026-0004-d", kind: "cites", disclosure: "serve" },
    { to: "INQ-2026-0001", kind: "division_parent", disclosure: "name" },
    { to: "INQ-2026-0002", kind: "division_sibling", disclosure: "name" },
    { to: "INQ-2026-0003", kind: "division_sibling", disclosure: "name" },
  ]);
  /* a finding rests on exactly its serve edges' targets: a relates_to counts, a division disclosure never does */
  const restsOn = publishedGraphEdges(fm).filter((e) => e.disclosure === "serve").map((e) => e.to);
  assert.deepEqual(restsOn, ["INFO-2026-0001-a", "INFO-2026-0002-b", "INFO-2026-0003-c", "INFO-2026-0004-d"]);
  assert.deepEqual(publishedGraphEdges({ division_parent: "null", division_siblings: "INQ-2026-0002" }), []);
  assert.deepEqual(publishedGraphEdges({ division_parent: 5, references: "x" }), []);
});

test("R5 no front matter answers [], and it never throws", () => {
  for (const odd of [null, undefined, 7, "fm", {}, [], { get references() { throw new Error("boom"); } }])
    assert.deepEqual(publishedGraphEdges(odd), []);
  const fm = { references: [{ target: "INFO-2026-0001-a" }] };
  assert.deepEqual(publishedGraphEdges(fm), publishedGraphEdges(fm), "pure");
  assert.deepEqual(fm, { references: [{ target: "INFO-2026-0001-a" }] });
});
