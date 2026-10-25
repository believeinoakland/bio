/* The fixtures strength publishes (fixtures.mjs): each is called here and checked against the real answer. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { gradingFactsUnread, strengthBarSet, strengthOfNoId, testimonyCorroboration } from "./fixtures.mjs";
import { ADMIN, REASON } from "./fixture.mjs";

test("fixture gradingFactsUnread: an inquiry nobody holds is NO_SUCH_BUNDLE naming the target, never NO_SUCH_INQUIRY", () => {
  const r = gradingFactsUnread();
  assert.equal(r.ok, false);
  assert.equal(r.reason, "NO_SUCH_BUNDLE");
  assert.equal(r.target, "INQ-2026-9999-a");
});

test("fixture strengthBarSet: the ok answer carries the group, the bar and the stamped author", () => {
  const r = strengthBarSet();
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.capture, "B");
  assert.equal(r.connection, "C");
  assert.equal(r.author, ADMIN);
  assert.equal(r.reason, REASON);
  for (const k of ["group", "at"]) assert.ok(k in r, k);
});

test("fixture strengthOfNoId: the NO_ID refusal", () => {
  const r = strengthOfNoId();
  assert.equal(r.ok, false);
  assert.equal(r.reason, "NO_ID");
});

test("fixture testimonyCorroboration: a question resting on no testimony answers ok with no legs", () => {
  const r = testimonyCorroboration();
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual(r.legs, []);
});
