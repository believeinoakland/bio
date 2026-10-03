/* case-grammar at its interface: R6, undetermined is stated and never filled, across every reader; R7, no place is
   named in the module's behaviour or outward text. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as CG from "../../../src/case-grammar/index.mjs";
import { doc, tensionLines, sha, NOW } from "./helpers.mjs";
import { caseFileFixture } from "./casefile-fixture.mjs";

const OLDER = ["bio-case-document/4", "bio-case-document/3", "bio-case-document/2", "bio-case-document/1"];

test("R6 undetermined is stated and never filled: an older document's citations, blocks and tensions, and a /5 document silent about a block or an acknowledgement", () => {
  for (const format of OLDER) {
    const text = doc(format, [...CG.captureBlockLines([{ capture: sha("x") }]), ...CG.sourceBlockLines([]),
                              ...tensionLines({ rows: [] })]);
    if (format !== "bio-case-document/4") {
      const c = CG.signedCitations(text);
      assert.deepEqual([c.state, c.rows, c.stated], ["undetermined", null, CG.CITATIONS_UNDETERMINED_SENTENCE]);
    }
    const b = CG.caseDocumentBlocks(text);
    assert.deepEqual([b.captures, b.sources, b.detail], [null, null, CG.BLOCKS_PREDATE_SENTENCE], "never a filled or empty block");
    const t = CG.caseTensionsOf(text);
    assert.deepEqual([t.tensions, t.highlighted, t.unread, t.detail], [null, null, null, CG.TENSIONS_PREDATE_SENTENCE]);
  }
  /* a /5 capture the block is silent about acknowledging carries no acknowledgement, and no filled value */
  const silent = CG.caseDocumentBlocks(doc("bio-case-document/5", [
    "captures:", `  - capture: "${sha("x")}"`, "    member: INQ-2026-0001", "sources: []"]));
  assert.equal("acknowledgement" in silent.captures[0], false);
  assert.deepEqual([silent.captures[0].grade, silent.captures[0].co_attested, silent.captures[0].late,
                    silent.captures[0].self_attested_only, silent.captures[0].timestamp_at], [null, null, null, null, null]);
  /* a /5 acknowledgement with a field unwritten reads that field null, never a default */
  const partial = CG.caseDocumentBlocks(doc("bio-case-document/5", [
    "captures:", `  - capture: "${sha("x")}"`, "    acknowledged_by: member:olive", "sources: []"]));
  assert.deepEqual(partial.captures[0].acknowledgement, { reason: null, acknowledged_by: "member:olive", at: null, sentence: null });
  assert.equal(CG.BLOCK_UNREADABLE_SENTENCE.includes("undetermined"), true);
  assert.equal(CG.TENSIONS_UNREADABLE_SENTENCE.includes("undetermined"), true);
});

test("R7 no place is named in this module's behaviour or outward text", () => {
  const rows = [{ observation: "INFO-2026-0099-o", level: "group", shown: "g", chosen_at_edition: 1 },
                { observation: "INFO-2026-0098-o", level: null, why: "none chosen" }];
  const outward = JSON.stringify([
    Object.fromEntries(Object.entries(CG).filter(([, v]) => typeof v !== "function")),
    CG.attributionBodyLines(rows), CG.attributionFrontmatterLines(rows), CG.signedCitations(null),
    CG.caseDocumentBlocks(null), CG.caseDocumentBlocks(doc("bio-case-document/5")), CG.caseTensionsOf(null),
    CG.caseTensionsOf(doc("bio-case-document/5")), CG.sourceStatement({ kind: "name", recorded: false }),
    CG.sourceStatement({ kind: "pseudonym_link" }), CG.unnamedSourceStatement({ capture: sha("x"), received: NOW }),
    CG.unnamedSourceStatement(), CG.publishedGraphEdges({ references: [{ target: "T" }], division_parent: "P" }),
    CG.whatChangedSectionLines("s"), CG.whatChangedBlockLines({ statement: "s", began_as: "member" }),
    CG.workingOnLines("NOTE-2026-0001"), CG.workingOnOf({ format: "bio-case-document/5", working_on: "NOTE-2026-0001" }),
    CG.withheldSourceStatement(), CG.methodOf({ format: "bio-case-document/6", method: {} }),
    CG.caseFileManifestCheck({}), CG.caseFileManifestCheck(null), caseFileFixture().manifest,
    caseFileFixture().files.get("complete-edition.html"), CG.completeEditionOf(null),
    ...[["load_bearing", { capture: "B" }], ["supporting", { connection: "C" }], [null, { capture: "B" }], ["load_bearing", null]]
      .map(([role, bar]) => CG.standingOf({ role, bar, pair: { capture: "C" } })),
    ...[true, false, null].map((inForce) => CG.lensSectionLines({ statements: [{ kind: "scrutiny" }, { kind: "inference" },
                                                                             { kind: "pattern", citations: [{}] }], inForce })),
  ]);
  for (const place of ["Oakland", "California", "Alameda", "Berkeley", "San Francisco", "Sacramento", "Brown Act", "CPRA",
                       "United States", "County", "City of"])
    assert.equal(outward.includes(place), false, `names ${place}`);
});
