/* The `door-helpers` contract (fix round 10, K5044 (5)): one contract for the helpers the doors share, merged from relay-helpers,
   envelope-helpers, required-argument and door-answers. Each value is stated here as data, which the users' hand-built values
   must equal, and built by the real function on the same inputs; where the real answer differs, the real one wins. R1 (the
   JSON answer), R2 (the row decoration), R3 (the store's silence and refusal), R8 (the rows C-69.1, C-69.2 and C-61.1). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M } from "./load.mjs";
import { refusedAnswer } from "./fixtures.mjs";

// fixtures-run: capture door-helpers
// fixtures-run: doorbell door-helpers
// fixtures-run: connections door-helpers
// fixtures-run: public-read door-helpers
// fixtures-run: ratification door-helpers
// fixtures-run: case-disclosures door-helpers
// fixtures-run: affordances door-helpers

const UUID = "0f8fad5b-d9cb-469f-a165-70867728950e";

test("R1, R3: json answers the body compact, as JSON, at the status, with the open origin", async () => {
  const r = M.json({ a: 1 }, 200);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("content-type"), "application/json");
  assert.equal(r.headers.get("access-control-allow-origin"), "*");
  assert.deepEqual(await r.json(), { a: 1 });
});

test("R3: doAnswer reads a store answer as the data contract says: answered, refused, or silent with or without a correlation", async () => {
  const answered = await M.doAnswer(new Response(JSON.stringify({ ok: true, result: { a: 1 } }), { status: 200 }));
  assert.deepEqual(answered, { answered: true, result: { a: 1 }, reply: { status: 200, body: { ok: true, result: { a: 1 } } } });

  assert.deepEqual(await refusedAnswer(),
    { answered: false, refused: true, result: undefined, reply: { status: 400, body: { ok: false, reason: "BAD_JSON", detail: "d" } } });

  assert.deepEqual(await M.doAnswer(new Response("<html>", { status: 200 })), { answered: false, result: undefined });

  const internal = JSON.stringify({ ok: false, reason: "STORE_INTERNAL_ERROR", correlation: UUID });
  assert.deepEqual(await M.doAnswer(new Response(internal, { status: 500 })), { answered: false, result: undefined, correlation: UUID });
});

test("R3: storeRefusal relays the store's own refusal at its status, with what the relay adds", async () => {
  const r = M.storeRefusal(await refusedAnswer(), { op: "knock" });
  assert.equal(r.status, 400);
  assert.deepEqual(await r.json(), { ok: false, reason: "BAD_JSON", detail: "d", op: "knock" });
});

test("R3, R8: storeSilent answers 502 STORE_DID_NOT_ANSWER, with its code, op, detail, check, translation and correlation", async () => {
  const r = M.storeSilent("publishedcase", UUID);
  assert.equal(r.status, 502);
  assert.deepEqual(await r.json(), {
    ok: false, reason: "STORE_DID_NOT_ANSWER", code: "STORE_DID_NOT_ANSWER", check: "C-69.2",
    translation: M.DISPATCH_CHECKS.STORE_DID_NOT_ANSWER.translation, op: "publishedcase",
    detail: M.STORE_SILENT_DETAIL, correlation: UUID,
  });
});

test("R8: the UNKNOWN_OP row, as the relay carries it, is its code, check and translation (C-69.1)", () => {
  const row = M.dispatchRow("UNKNOWN_OP");
  assert.deepEqual(row, { code: "UNKNOWN_OP", check: "C-69.1", translation: M.DISPATCH_CHECKS.UNKNOWN_OP.translation });
  /* control: a relay's `reason` is the code the row names, so the relayed `reason` and `code` agree */
  assert.equal({ reason: "UNKNOWN_OP", ...row }.code, "UNKNOWN_OP");
});

test("R8: requiredArgument answers REQUIRED_ARGUMENT_MISSING with the real row's code, check, translation and detail (C-61.1)", () => {
  const r = M.requiredArgument("publish", "case", "{case}", "bad");
  const { detail, ...rest } = r;
  assert.deepEqual(rest, {
    ok: false, reason: "REQUIRED_ARGUMENT_MISSING", code: "REQUIRED_ARGUMENT_MISSING", check: "C-61.1",
    translation: M.REQUIRED_ARGUMENT_CHECKS.REQUIRED_ARGUMENT_MISSING.translation,
    error: "bad", op: "publish", argument: "case", shape: "{case}",
  });
  assert.equal(typeof detail, "string");
  assert.ok(detail.includes("publish") && detail.includes("case"));
  /* control: the op named is the one given */
  assert.equal(M.requiredArgument("other", "case", "{case}", "bad").op, "other");
});
