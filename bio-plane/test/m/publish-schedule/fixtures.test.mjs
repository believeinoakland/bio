/* publish-schedule's published fixture `scheduleRefusals` (K4990, K4993, K5044): the real answers of R1's time refusals,
 * each made when the fixture runs. This test calls it and checks the real answer of each refusal. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { scheduleRefusals } from "./fixtures.mjs";

const AT_UTC = "2026-10-01T12:00:00Z";   /* 09:00 in Halifax, ADT */

test("R1 scheduleRefusals gives the real refusal of each time code: PUBLISH_AT_MALFORMED, PUBLISH_AT_NO_ZONE, PUBLISH_AT_PAST, and PUBLISH_AT_ALREADY_SET with the waiting entry", () => {
  const r = scheduleRefusals();
  assert.deepEqual(Object.keys(r).sort(), ["PUBLISH_AT_ALREADY_SET", "PUBLISH_AT_MALFORMED", "PUBLISH_AT_NO_ZONE", "PUBLISH_AT_PAST"]);
  for (const [code, answer] of Object.entries(r)) {
    assert.equal(answer.ok, false, code);
    assert.equal(answer.reason, code, code);
  }
  assert.equal(typeof r.PUBLISH_AT_MALFORMED.detail, "string", "a member's words name the time's shape");
  assert.equal(typeof r.PUBLISH_AT_NO_ZONE.detail, "string", "a team with no zone is refused, never read as UTC");
  assert.deepEqual([r.PUBLISH_AT_PAST.publish_at, r.PUBLISH_AT_PAST.at.date, r.PUBLISH_AT_PAST.at.time],
                   ["2026-09-28T00:59:00Z", "2026-09-27", "21:59"], "a time not after now answers the instant it was read at");
  assert.equal(r.PUBLISH_AT_ALREADY_SET.caseId, "CASE-2026-0001");
  assert.equal(r.PUBLISH_AT_ALREADY_SET.waiting.state, "waiting");
  assert.equal(r.PUBLISH_AT_ALREADY_SET.waiting.publish_at, AT_UTC, "it names the time already set, not the one refused");
});
