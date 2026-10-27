/* answer-envelope's published fixtures (fixtures.mjs, fix round 10 batch 4): each is made by the real code, and each
   test calls it and checks the real answer. R3 (the store's silence and refusal), R8 (the rows C-69.2 and C-61.1). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M } from "./load.mjs";
import { planeHelpers, refusedAnswer, storeSilent, storeSilentParsed } from "./fixtures.mjs";

test("R3, R8: planeHelpers is the real helpers, the very functions the plane binds, and the silence's constants", () => {
  assert.equal(planeHelpers.json, M.json);
  assert.equal(planeHelpers.doAnswer, M.doAnswer);
  assert.equal(planeHelpers.storeSilent, M.storeSilent);
  assert.equal(planeHelpers.requiredArgument, M.requiredArgument);
  assert.equal(planeHelpers.StoreSilent, M.StoreSilent);
  assert.equal(planeHelpers.STORE_SILENT_REASON, "STORE_DID_NOT_ANSWER");
  assert.equal(planeHelpers.STORE_SILENT_DETAIL, M.STORE_SILENT_DETAIL);
  /* control: the helpers are not stand-ins; a silence built by the bound storeSilent is the real 502 */
  assert.equal(planeHelpers.storeSilent("publishedcase").status, 502);
});

test("R3: refusedAnswer is the real doAnswer's answer to a store's refusal, a fresh value on every call", async () => {
  const a = await refusedAnswer();
  assert.deepEqual(a, { answered: false, refused: true, result: undefined,
    reply: { status: 400, body: { ok: false, reason: "BAD_JSON", detail: "d" } } });
  const b = await refusedAnswer();
  assert.notEqual(a, b);
  assert.deepEqual(a, b);
  /* control: a store answer with `ok: true` is an answer, not a refusal */
  const ok = await M.doAnswer(new Response(JSON.stringify({ ok: true, result: 1 }), { status: 200 }));
  assert.equal(ok.refused, undefined);
  assert.equal(ok.answered, true);
});

test("R3, R8: storeSilent is the real 502 STORE_DID_NOT_ANSWER for the op, a Response each call, and storeSilentParsed reads its body", async () => {
  const r = storeSilent("publishedcase");
  assert.equal(r.status, 502);
  const body = await r.json();
  assert.equal(body.ok, false);
  assert.equal(body.reason, "STORE_DID_NOT_ANSWER");
  assert.equal(body.code, "STORE_DID_NOT_ANSWER");
  assert.equal(body.check, "C-69.2");
  assert.equal(body.op, "publishedcase");
  const parsed = await storeSilentParsed("verify");
  assert.equal(parsed.status, 502);
  assert.equal(parsed.body.op, "verify");
  assert.equal(parsed.body.check, "C-69.2");
  /* control: the op is the one named, not a fixed string */
  assert.notEqual(parsed.body.op, body.op);
});
