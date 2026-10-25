/* store-door's published fixtures (fixtures.mjs), each called and compared with the real answer it stands for, and the
 * contract `store-replies` (K5044 (5)): the store's own replies as `dispatch(req, store)` gives them, stated as data and
 * checked against the real code. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { internalErrorAnswer } from "./fixtures.mjs";
import { D, UUID, go, quietly } from "./harness.mjs";
import { DISPATCH_CHECKS } from "../../../src/answer-envelope/checks.mjs";

test("fixtures internalErrorAnswer R6: the real dispatch over a throwing route is a 500 STORE_INTERNAL_ERROR with a fresh UUID correlation and its row, and no thrown text; overrides replace fields", async () => {
  const a = await internalErrorAnswer(), b = await internalErrorAnswer();
  for (const x of [a, b]) {
    assert.deepEqual([x.ok, x.reason, x.code, x.check], [false, "STORE_INTERNAL_ERROR", "STORE_INTERNAL_ERROR", "C-69.4"]);
    assert.match(x.correlation, UUID);
    assert.equal(x.translation, DISPATCH_CHECKS.STORE_INTERNAL_ERROR.translation);
    assert.doesNotMatch(JSON.stringify(x), /secret-value|store\.mjs|Error:/);
  }
  assert.notEqual(a.correlation, b.correlation, "control: each answer has its own id");
  const store = { routes: () => ({ boom: () => { throw new Error("x"); } }) };
  const { value: res } = await quietly(() => D.dispatch(new Request("http://do/boom"), store));
  assert.equal(res.status, 500);
  const o = await internalErrorAnswer({ correlation: "x<script>", reason: "OTHER" });
  assert.deepEqual([o.correlation, o.reason, o.code], ["x<script>", "OTHER", "STORE_INTERNAL_ERROR"], "negative controls override");
});

// fixtures-run: host-governor store-replies
// fixtures-run: capture store-replies
// fixtures-run: doorbell store-replies
// fixtures-run: extraction store-replies
// fixtures-run: connections store-replies
// fixtures-run: publication store-replies
// fixtures-run: public-read store-replies
// fixtures-run: ratification store-replies
// fixtures-run: monitoring store-replies
// fixtures-run: translations store-replies
// fixtures-run: instance-setup store-replies
test("fixtures-contract store-replies R1 R6 R19: the store's own replies are the following, as the real dispatch gives them", async () => {
  const STORE_REPLIES = {
    badJson: { status: 400, body: { ok: false, reason: "BAD_JSON", detail: "the request body is not valid JSON" } },
    unknownOp: { status: 400, body: { ok: false, error: "unknown op: nope" } },
    internalError: { status: 500, body: { ok: false, error: "internal error", reason: "STORE_INTERNAL_ERROR", code: "STORE_INTERNAL_ERROR",
      check: "C-69.4", translation: DISPATCH_CHECKS.STORE_INTERNAL_ERROR.translation, correlation: "<uuid>" } },
    answered: { status: 200, body: { ok: true, result: { n: 1 } } },
  };
  const store = { routes: () => ({ ok: () => ({ n: 1 }), boom: () => { throw new Error("secret-value /srv/store.mjs:1"); } }) };
  const withUuid = (j) => (j.correlation === undefined ? j : (assert.match(j.correlation, UUID), { ...j, correlation: "<uuid>" }));
  const seen = async (path, init) => { const { status, json } = await go(store, path, init); return { status, body: withUuid(json) }; };
  assert.deepEqual(await seen("ok", { method: "POST", body: "{not json" }), STORE_REPLIES.badJson);
  assert.deepEqual(await seen("nope"), STORE_REPLIES.unknownOp);
  assert.deepEqual((await quietly(() => seen("boom"))).value, STORE_REPLIES.internalError);
  assert.deepEqual(await seen("ok"), STORE_REPLIES.answered);
  /* the store gives no 413, 503 or bare stack: a throw is never answered with its text, and a body too large or a busy
     store is one of the replies above (users' PAYLOAD_TOO_LARGE, OVERLOADED, STORE_BUSY take STORE_INTERNAL_ERROR or BAD_JSON) */
  const thrown = (await quietly(() => seen("boom"))).value;
  assert.equal(thrown.body.error, "internal error");
  assert.doesNotMatch(JSON.stringify(thrown), /secret-value|store\.mjs/);
});
