/* Fix round 10 (K5175), citeimported: the answer case-import publishes in fixtures.mjs is citation's real door answer over
   this module's real accepted import. Each check reads the answer the module's own data gives. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { citeimportedAnswer } from "./fixtures.mjs";
import { F1, F2 } from "./fixture.mjs";

test("R16 citeimported: the published answer is citation's door answer that cites this import's accepted finding at the edition shown, with the acceptance as case-import states it", async () => {
  const { answer, ref, import: importId, finding, edition } = await citeimportedAnswer();
  assert.equal(answer.ok, true, "the citation is made");
  assert.deepEqual(answer.cited, [ref], "the citation names the imported finding reference case-import builds");
  assert.deepEqual(answer.legs, [{ target: ref, target_edition: 1, role: "supports" }], "the leg rests on the edition shown");
  assert.deepEqual([finding, edition, answer.role], [F1, 1, "supports"]);
  assert.equal(answer.origin.group, "source-group", "the origin is the imported group's case");
  assert.equal(answer.origin.finding, F1, "the origin is the accepted finding");
  assert.deepEqual(answer.origin.acceptance, { by: "alice", at: "2026-10-03T12:00:00Z", reason: "We recreated it whole." },
    "the acceptance is the one case-import recorded");
  assert.equal(answer.origin.openFlags, 0, "nothing flagged");
  assert.ok(importId, "the import id is the module's own");
});

test("R16 citeimported (control): a finding this import never accepted is refused, so no citation is made", async () => {
  const { answer } = await citeimportedAnswer({ finding: F2 });
  assert.equal(answer.ok, false, "control: an unaccepted finding is not cited");
});
