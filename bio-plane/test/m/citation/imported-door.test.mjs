/* citation R18 (K5131; WALK-FINAL-09 row R169): THE WALKER'S CASE THROUGH THE REAL DOOR. A joined member sends `citeimported` and `withdrawimported`
   to the real plane; the door stamps `author` and `viewer` from her session, so the act reaches the op and is never answered
   MACHINE_CANNOT_CITE_IMPORTED (R16, R17). The question and the member are made by the member's own acts (control-plane's seam kit). The finding
   named here is not another team's accepted one, so the op answers its own refusal after the member check: the proof is that it got that far. */
import "../../sandbox.mjs";
import test, { after } from "node:test";
import assert from "node:assert/strict";
import { makeKit } from "../control-plane/r8-kit.mjs";
import { importedFindingRef } from "../../../src/inquiry-grammar/index.mjs";

const kit = makeKit({ tag: "cit-door" });
after(() => kit.mf.dispose());

const IMP = "c".repeat(64), FIND = "INFO-2026-0007-x";
const refused = (r) => (r && r.result && r.result.reason) || (r && r.reason) || null;

async function seat(tag) {
  const { auth } = await kit.ownerOf("ann");
  const project = await kit.projectOf(auth, `A project that rests its question on another team's finding (${tag})`);
  const inquiry = await kit.questionOf(auth, project, "Did the other team's audit hold for our case?");
  return { auth, inquiry };
}

test("R18: citeimported sent by a joined member reaches the op through the door, never MACHINE_CANNOT_CITE_IMPORTED", async () => {
  const { auth, inquiry } = await seat("cite");
  const r = (await kit.post(auth, "citeimported", {}, { inquiry, import: IMP, finding: FIND, edition: "3", role: "supports" })).body;
  assert.notEqual(refused(r), "MACHINE_CANNOT_CITE_IMPORTED", JSON.stringify(r).slice(0, 400));
  /* the op's own next refusal: this team has not accepted that edition, so the write is refused inside BASIS_REFUSED (R16) */
  assert.equal(refused(r), "BASIS_REFUSED", "a refusal of the op's own: " + JSON.stringify(r).slice(0, 400));
});

test("R18: withdrawimported sent by a joined member reaches the op through the door, never MACHINE_CANNOT_CITE_IMPORTED", async () => {
  const { auth, inquiry } = await seat("withdraw");
  const r = (await kit.post(auth, "withdrawimported", {}, { inquiry, import: IMP, finding: FIND, reason: "the case was re-opened" })).body;
  assert.notEqual(refused(r), "MACHINE_CANNOT_CITE_IMPORTED", JSON.stringify(r).slice(0, 400));
  assert.equal(refused(r), "NOT_CITED", "the question rests on no such leg, the op's own refusal: " + JSON.stringify(r).slice(0, 400));
  assert.ok(importedFindingRef(IMP, FIND));
});
