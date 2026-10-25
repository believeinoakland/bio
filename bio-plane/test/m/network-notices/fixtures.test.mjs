/* network-notices' published fixtures (fixtures.mjs): each answer is the real module's refusal, checked at the module's
   interface, and an answer the module would not give is never published. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { noticePrepareRefusal, NOTICE_PREPARE_REFUSAL_CODES } from "./fixtures.mjs";
import { NETWORK_NOTICE_CHECKS } from "../../../src/network-notices/index.mjs";

test("R1 noticePrepareRefusal answers, for each published code, the real refusal with its check and translation", async () => {
  assert.deepEqual(NOTICE_PREPARE_REFUSAL_CODES, ["NOTICE_ALREADY_OPEN", "NOTICE_SINCE_BEFORE_PROJECT", "NOTICE_NO_GROUP_SLUG",
    "NOTICE_NO_INSTANCE_KEY", "NOTICE_PROJECT_CLOSED", "NOTICE_SINCE_IN_FUTURE", "NOTICE_WORDING_MALFORMED"]);
  for (const code of NOTICE_PREPARE_REFUSAL_CODES) {
    const r = await noticePrepareRefusal(code);
    assert.equal(r.ok, false, code);
    assert.equal(r.reason, code);
    assert.equal(r.code, code);
    assert.equal(r.check, NETWORK_NOTICE_CHECKS[code].check, code);
    assert.equal(r.translation, NETWORK_NOTICE_CHECKS[code].translation, code);
  }
});

test("R1 noticePrepareRefusal carries the answer's own fields: the project's creation date and the open notice's id", async () => {
  const back = await noticePrepareRefusal("NOTICE_SINCE_BEFORE_PROJECT");
  assert.equal(back.project_created, "2026-01-05");
  const open = await noticePrepareRefusal("NOTICE_ALREADY_OPEN");
  assert.match(open.notice, /^NOTE-2026-\d{4}$/);
});

test("R1 noticePrepareRefusal answers each call afresh, the same refusal every time, and refuses to invent one the module does not give", async () => {
  assert.deepEqual(await noticePrepareRefusal("NOTICE_WORDING_MALFORMED"), await noticePrepareRefusal("NOTICE_WORDING_MALFORMED"));
  await assert.rejects(() => noticePrepareRefusal("NOTICE_NOT_A_CODE"), /no noticeprepare refusal is published as NOTICE_NOT_A_CODE/);
  /* a code the module answers from another op is not this fixture's: posting's stale answer is not prepare's */
  await assert.rejects(() => noticePrepareRefusal("NOTICE_STALE"), /no noticeprepare refusal is published as NOTICE_STALE/);
});
