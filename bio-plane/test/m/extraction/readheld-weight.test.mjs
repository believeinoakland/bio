/* extraction R80, R79 as DEC-479 (61) amends them (T53; T53-131): "Read it now" weighs Reversible and asks no reason. The earlier reading stays in the history and nothing is lost,
   so the act is graded `reversible`, not `undetermined`, and the declaration names no `reason` among the fields it accepts. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DECLARED_OPS } from "../../../src/extraction/index.mjs";

test("R80 (DEC-479 (61)): `readheld` is declared with the weight reversible, and its fields hold no reason", () => {
  const row = DECLARED_OPS.readheld;
  assert.equal(row.weight, "reversible");
  assert.equal(row.mutating, true);
  assert.deepEqual(row.fields.accepts, ["sha", "defer"]);
  assert.deepEqual(row.fields.requires, ["sha"]);
  assert.ok(!row.fields.accepts.includes("reason"), "the act asks for no reason");
});

test("R80 (control): the other declarations keep their weights; the AI's transcription stays undetermined and the reads stay reads", () => {
  assert.deepEqual([DECLARED_OPS.pagetranscribe.weight, DECLARED_OPS.reading.weight, DECLARED_OPS.pdfstructure.weight], ["undetermined", "read", "read"]);
});
