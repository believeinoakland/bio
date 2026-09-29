/* capture R63 (N285, K275): `evidenceAbsent`, the one answer to "no evidence object is held under a digest", minted at
   one site with its own row (C-118.1), and R21's get answering through it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { bucket, sha } from "./fixture.mjs";
import { evidenceAbsent, captureObjectOp } from "../../../src/capture/ops.mjs";
import { CAPTURE_CHECKS } from "../../../src/capture/checks.mjs";

const TRANSLATION = "The record holds no stored copy of a document under this fingerprint.";
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });

test("R63: evidenceAbsent answers 404 with ok false, reason and code NOT_FOUND, its own row's check and translation, the digest and the store", () => {
  const d = sha("absent");
  const a = evidenceAbsent(d, "bio");
  assert.equal(a.status, 404);
  assert.deepEqual(a.body, { ok: false, reason: "NOT_FOUND", code: "NOT_FOUND", check: "C-118.1", translation: TRANSLATION,
                             sha256: d, store: "bio" });
});

test("R63: its one row is in capture's own table, its where naming evidenceAbsent, with the worded translation", () => {
  const row = CAPTURE_CHECKS.NOT_FOUND;
  assert.equal(row.check, "C-118.1");
  assert.equal(row.translation, TRANSLATION);
  assert.match(row.where, /^src\/capture\/ops\.mjs evidenceAbsent > /);
  assert.equal(Object.isFrozen(CAPTURE_CHECKS) && Object.isFrozen(row), true);
  assert.equal(Object.values(CAPTURE_CHECKS).filter((r) => r.check === "C-118.1").length, 1, "one row for the condition");
});

test("R63: extra adds a caller's fields and never replaces the fixed ones", () => {
  const d = sha("x");
  const a = evidenceAbsent(d, "bio", { tokenClass: "member", detail: "d", ok: true, reason: "OTHER", code: "OTHER",
                                       check: "C-1.1", translation: "t", sha256: "f".repeat(64), store: "elsewhere" });
  assert.deepEqual(a.body, { ok: false, reason: "NOT_FOUND", code: "NOT_FOUND", check: "C-118.1", translation: TRANSLATION,
                             sha256: d, store: "bio", tokenClass: "member", detail: "d" });
  assert.equal(a.status, 404);
});

test("R63: it never throws and writes nothing, whatever it is handed", () => {
  const hostile = new Proxy({}, { ownKeys() { throw new Error("boom"); } });
  const getter = Object.defineProperty({}, "x", { enumerable: true, get() { throw new Error("boom"); } });
  for (const [s, st, extra] of [[undefined, undefined, undefined], [null, null, null], [42, {}, []], ["", "", "str"],
                                ["a".repeat(64), "bio", hostile], ["a".repeat(64), "bio", getter]]) {
    const a = evidenceAbsent(s, st, extra);
    assert.equal(a.status, 404);
    assert.deepEqual([a.body.ok, a.body.reason, a.body.code, a.body.check, a.body.translation],
                     [false, "NOT_FOUND", "NOT_FOUND", "C-118.1", TRANSLATION]);
    assert.equal(a.body.sha256, s ?? null);
  }
  /* a pure function: two calls agree, and no store is reachable from its arguments */
  assert.deepEqual(evidenceAbsent("b".repeat(64), "bio"), evidenceAbsent("b".repeat(64), "bio"));
});

test("R63 R21: op=capture's get of an absent object answers through evidenceAbsent, exactly its body and status, with the caller class beside", async () => {
  const b = bucket();
  const h = { json, storageAbsent: () => json({}, 503), requiredArgument: () => ({}), key: (s) => `bio/captures/${s}`,
              storeName: "bio", cls: "member" };
  const d = sha("none");
  const r = await captureObjectOp(new Request(`https://p/?op=capture&sha256=${d}`), new URL(`https://p/?op=capture&sha256=${d}`),
                                  { CAPTURES: b }, h);
  const want = evidenceAbsent(d, "bio", { tokenClass: "member" });
  assert.equal(r.status, want.status);
  assert.deepEqual(await r.json(), want.body);
  assert.equal(b.calls.filter((c) => c[0] === "put").length, 0, "nothing written");
});
