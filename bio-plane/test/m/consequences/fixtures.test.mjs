/* consequences' published fixtures (fix round 10): each is called and its answer checked against the real module's
   (R13, R20), so a user module takes the answer and not a copy of it. */
import test from "node:test";
import assert from "node:assert/strict";
import { consequencesOfRefusal, successRecordRead } from "./fixtures.mjs";

test("R13 consequencesOfRefusal: a determination conformance holds none of is refused NO_SUCH_DETERMINATION, naming it", () => {
  const f = consequencesOfRefusal();
  assert.equal(f.answer.ok, false);
  assert.equal(f.answer.reason, "NO_SUCH_DETERMINATION");
  assert.equal(JSON.stringify(f.answer).includes(f.determination), true, JSON.stringify(f.answer));
});

test("R20 successRecordRead: an id no record holds is refused NO_SUCH_SUCCESS_RECORD; a stored record reads as it was written", () => {
  const f = successRecordRead();
  assert.deepEqual([f.absent.ok, f.absent.reason], [false, "NO_SUCH_SUCCESS_RECORD"]);
  assert.equal(f.read.ok, true, JSON.stringify(f.read));
  assert.equal(f.read.success.id, f.id);
  assert.equal(f.read.success.statement, "The City published the report");
  assert.equal(f.read.success.superseded_by ?? null, null);
});
