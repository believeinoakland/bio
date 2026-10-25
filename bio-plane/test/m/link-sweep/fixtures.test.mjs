/* link-sweep's published fixtures (T51 fix round 10; K4990, K4993): each is called and its answer checked against the real
   module's read of the same sweep (R13, R14), so a user module takes the answer and not a copy of it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { FIXTURE_LIST, sweepsetAnswer, sweepratifyAnswer, sweepratifyNotOwner } from "./fixtures.mjs";

const SWEEP = `${FIXTURE_LIST}#council-minutes`;

test("R13 sweepsetAnswer: a member's define answers ok with the minted id, unratified, and the sweep reads back as that answer", async () => {
  const f = await sweepsetAnswer();
  assert.equal(f.answer.ok, true, JSON.stringify(f.answer));
  assert.equal(f.answer.sweep, SWEEP);
  assert.equal(f.answer.ratified, false, "written unratified");
  assert.deepEqual(f.read.map((x) => [x.sweep, x.ratified]), [[SWEEP, false]], "the real read holds the sweep the answer names");
  assert.equal(f.read[0].definition, f.answer.definition, "the definition answered is the one held");
});

test("R13 sweepsetAnswer is the real code's: called again it answers the same, from a fresh world each time", async () => {
  assert.deepEqual(await sweepsetAnswer(), await sweepsetAnswer());
});

test("R14 sweepratifyAnswer: the owner's ratify answers ok, ratified, by the owner, and the sweep reads back ratified and due", async () => {
  const f = await sweepratifyAnswer();
  assert.equal(f.sweep, SWEEP);
  assert.deepEqual(f.answer, { ok: true, sweep: SWEEP, ratified: true, ratified_by: "member:alice",
    ratified_at: f.read[0].ratified_at, due: true, next: null }, JSON.stringify(f.answer));
  assert.equal(f.read[0].ratified, true);
  assert.equal(f.read[0].due, true, "R4: a ratified sweep is due at the next tick");
  assert.equal(f.read[0].ratified_by, f.answer.ratified_by);
});

test("R14 sweepratifyNotOwner: a joined member who owns nothing is refused SWEEP_RATIFY_NOT_AN_OWNER, naming the member, and the sweep stays unratified", async () => {
  const f = await sweepratifyNotOwner();
  assert.equal(f.answer.ok, false, JSON.stringify(f.answer));
  assert.equal(f.answer.reason, "SWEEP_RATIFY_NOT_AN_OWNER");
  assert.equal(f.answer.code, "SWEEP_RATIFY_NOT_AN_OWNER");
  assert.ok(f.answer.detail.includes("bob"), f.answer.detail);
  assert.deepEqual(f.read.map((x) => [x.sweep, x.ratified]), [[SWEEP, false]], "nothing was written");
});
