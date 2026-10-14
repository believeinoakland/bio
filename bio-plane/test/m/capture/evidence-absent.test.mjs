/* capture R63 (N285, K275, N347): `evidenceAbsent`, the one answer to "no evidence object is held under a digest", minted
   at one site with its own row (C-118.1) under its own code, `EVIDENCE_NOT_HELD`, and R21's get answering through it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { bucket, fresh, sha } from "./fixture.mjs";
import { captureOps } from "../../../src/capture/index.mjs";
import { evidenceAbsent, captureObjectOp, captureOp } from "../../../src/capture/ops.mjs";
import { CAPTURE_CHECKS } from "../../../src/capture/checks.mjs";

const TRANSLATION = "The record holds no stored copy of a document under this fingerprint.";
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });

test("R63 (N347): evidenceAbsent answers 404 with ok false, reason and code EVIDENCE_NOT_HELD, its own row's check and translation, the digest and the store", () => {
  const d = sha("absent");
  const a = evidenceAbsent(d, "bio");
  assert.equal(a.status, 404);
  assert.deepEqual(a.body, { ok: false, reason: "EVIDENCE_NOT_HELD", code: "EVIDENCE_NOT_HELD", check: "C-118.1", translation: TRANSLATION,
                             sha256: d, store: "bio" });
});

test("R63 (N347): its one row is in capture's own table under EVIDENCE_NOT_HELD, C-118.1 with its number and translation kept, its where naming evidenceAbsent; no NOT_FOUND key remains", () => {
  const row = CAPTURE_CHECKS.EVIDENCE_NOT_HELD;
  assert.equal(CAPTURE_CHECKS.NOT_FOUND, undefined, "the generic key is gone");
  assert.deepEqual(Object.keys(CAPTURE_CHECKS).sort(), ["ACCOUNT_NO_TEXT", "EVIDENCE_NOT_HELD", "MACHINE_CANNOT_SET_ASIDE",
                                                      "NOT_THE_CAPTURING_ACTOR", "SET_ASIDE_NO_REASON", "UPLOAD_NO_STATEMENT"],
                   "C-118.1, .5, .6, .8, .9, .10 (N364 .5, .6; K1019 .8, .9; R86 .10); .2, .3, .4, .7 are doorbell's (T43, N849)");
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
  assert.deepEqual(a.body, { ok: false, reason: "EVIDENCE_NOT_HELD", code: "EVIDENCE_NOT_HELD", check: "C-118.1", translation: TRANSLATION,
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
                     [false, "EVIDENCE_NOT_HELD", "EVIDENCE_NOT_HELD", "C-118.1", TRANSLATION]);
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

/* N1062 (K3227; replaces N347's sweep of the plane's source text): R63's one refusal, tested at every interface of this
   module that answers "no evidence object is held under a digest". `extraction` R31 answers through the same function and
   is tested at its own interface (`m/extraction`); no path answers under the generic `NOT_FOUND` word. */
test("R63 R21 R68 (N347, N1062): every path of capture that finds no evidence object held answers evidenceAbsent's one body, EVIDENCE_NOT_HELD under C-118.1 with its translation, and none answers NOT_FOUND: op=capture's get (a range too), op=capture through captureOp, reattest as a service and as op=reattest, with an evidence store and with none", async () => {
  const d = sha("never stored"), b = bucket();
  const h = { json, storageAbsent: () => json({}, 503), requiredArgument: () => ({}), key: (x) => `bio/captures/${x}`, storeName: "bio", cls: "member" };
  const answers = [];
  const get = (extra = {}) => new Request(`https://p/?op=capture&sha256=${d}`, extra);
  const url = new URL(`https://p/?op=capture&sha256=${d}`);
  const viaObject = await captureObjectOp(get(), url, { CAPTURES: b }, h);
  answers.push(["captureObjectOp get", viaObject.status, await viaObject.json(), { tokenClass: "member" }]);
  const ranged = await captureObjectOp(get({ headers: { range: "bytes=0-9" } }), url, { CAPTURES: b }, h);
  answers.push(["captureObjectOp ranged get", ranged.status, await ranged.json(), { tokenClass: "member" }]);
  const viaOp = await captureOp("capture", get(), url, { CAPTURES: b }, () => null, h);
  answers.push(["captureOp op=capture", viaOp.status, await viaOp.json(), { tokenClass: "member" }]);
  const withStore = fresh({ evidence: bucket() });
  const noStore = fresh({});
  for (const [name, f] of [["reattest with a store", withStore], ["reattest with no store", noStore]]) {
    const r = await f.c.reattest({ captureSha: d });
    answers.push([name, 404, r, { status: 404 }]);
  }
  const route = await captureOps(withStore.c, new URL(`http://x/reattest?by=m1`), { captureSha: d }, withStore.c.env).reattest();
  answers.push(["op=reattest route", 404, route, { status: 404 }]);
  assert.equal(answers.length, 6);
  for (const [name, status, body, extra] of answers) {
    const want = evidenceAbsent(d, "bio", extra);
    assert.equal(status, 404, name);
    assert.equal(body.reason, "EVIDENCE_NOT_HELD", name);
    assert.deepEqual([body.ok, body.code, body.check, body.translation, body.sha256], [false, "EVIDENCE_NOT_HELD", "C-118.1", TRANSLATION, d], name);
    assert.deepEqual(body, want.body, `${name}: exactly evidenceAbsent's body, a caller's own fields beside it`);
    assert.notEqual(body.reason, "NOT_FOUND", name);
    assert.notEqual(body.code, "NOT_FOUND", name);
  }
  /* controls: an object that is held is not refused, and a refusal of another kind keeps its own reason */
  const held = bucket();
  held.held.set(`bio/captures/${d}`, new TextEncoder().encode("bytes"));
  const ok = await captureObjectOp(get(), url, { CAPTURES: held }, h);
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get("x-capture-sha256"), d);
  assert.equal((await withStore.c.reattest({ captureSha: "not a digest" })).reason, "BAD_SHA", "another refusal keeps its own reason");
  assert.equal(b.calls.filter((c) => c[0] === "put").length, 0, "nothing written");
});
