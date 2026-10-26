/* The fixtures project-roster publishes (`fixtures.mjs`), each called here and its real answer checked: a user's test takes the answer from
   the fixture, and this is what shows the fixture's answer is the module's own. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as fx from "./fixtures.mjs";

const instant = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/;

test("R44 R9 (fixture declinedRequest): the requester's directory row carries the declined request with the owner's word, and null for no word", async () => {
  const r = await fx.declinedRequest({ comment: "Come back in spring." });
  assert.deepEqual(Object.keys(r).sort(), ["asked", "closed", "closed_comment", "state"]);
  assert.deepEqual([r.state, r.closed_comment], ["declined", "Come back in spring."]);
  assert.match(r.asked, instant);
  assert.match(r.closed, instant);
  assert.equal((await fx.declinedRequest({ comment: null })).closed_comment, null);
});

test("R44 (fixture answeredRequests): the owner's answered list, newest first, each row {projectId, name, requester, answer, comment, closed}", async () => {
  const got = await fx.answeredRequests();
  assert.deepEqual([got.ok, got.count, got.truncated], [true, 2, false]);
  assert.deepEqual(got.answered.map((x) => [x.projectId, x.name, x.requester, x.answer, x.comment]),
    [["PROJ-D", "Discoverable D", { member: "dee", handle: "dee" }, "granted", null],
     ["PROJ-D", "Discoverable D", { member: "cal", handle: "cal" }, "declined", "Not yet."]]);
  for (const x of got.answered) assert.match(x.closed, instant);
});

test("R44 (fixture answeredRequestsHidden): a member removed from the project reads nothing of it, the answer an empty list", async () => {
  const got = await fx.answeredRequestsHidden();
  assert.deepEqual([got.ok, got.answered, got.count, got.truncated], [true, [], 0, false]);
});
