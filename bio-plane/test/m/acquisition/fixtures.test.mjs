/* acquisition's published fixtures (fixtures.mjs), each called and compared with the real answer it stands for. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { acquireRefusals, archiveAnswer, archiveNotHeld, keyedServiceOff, notHeldRange, owedFetchAnswer, owedRunAnswer } from "./fixtures.mjs";
import { DELIVERY_FINAL } from "../../../src/acquisition/index.mjs";

test("fixtures acquireRefusals: the real acquire answers 502 SOURCE_REFUSED with the source's status, 502 FETCH_FAILED, and 409 NOT_ELIGIBLE for the archive arm; an unknown kind throws", async () => {
  const sr = await acquireRefusals({ kind: "source_refused" });
  assert.deepEqual([sr.status, sr.body.ok, sr.body.reason, sr.body.status], [502, false, "SOURCE_REFUSED", 410]);
  const ff = await acquireRefusals({ kind: "fetch_failed" });
  assert.deepEqual([ff.status, ff.body.ok, ff.body.reason], [502, false, "FETCH_FAILED"]);
  const ne = await acquireRefusals({ kind: "not_eligible" });
  assert.deepEqual([ne.status, ne.body.ok, ne.body.reason, ne.body.reachability.fallback_eligible], [409, false, "NOT_ELIGIBLE", false]);
  await assert.rejects(() => acquireRefusals({ kind: "nope" }), /no refusal kind/);
});

test("fixtures archiveAnswer R39 R41: the real acquire over a generated archive answers its document and the unpack of each member, sized as the caller states", async () => {
  const a = await archiveAnswer({ memberBytes: [300, 500, 700] });
  assert.equal(a.status, 200);
  assert.deepEqual([a.body.ok, a.body.existed, a.body.unpack.ok, a.body.unpack.complete], [true, false, true, true]);
  assert.equal(a.body.unpack.archive.sha256, a.body.document.capture.sha256);
  assert.deepEqual(a.body.unpack.documents.map((d) => d.capture.bytes), [300, 500, 700]);
  assert.deepEqual(a.body.unpack.documents.map((d) => d.container.path), ["m001.txt", "m002.txt", "m003.txt"]);
});

test("fixtures archiveNotHeld R38: unpack of an archive this capture does not hold is ARCHIVE_NOT_HELD with its row", async () => {
  const r = await archiveNotHeld();
  assert.deepEqual([r.ok, r.reason, r.code, r.check], [false, "ARCHIVE_NOT_HELD", "ARCHIVE_NOT_HELD", "C-139.1"]);
  assert.equal(r.archive.length, 64);
  assert.notEqual((await archiveNotHeld({ archiveSha: "b".repeat(64) })).archive, r.archive);
});

test("fixtures keyedServiceOff R36 R37: a citation lookup for a team that holds no key is KEYED_SERVICE_OFF for courtlistener, credentials' own row", async () => {
  const r = await keyedServiceOff();
  assert.deepEqual([r.ok, r.reason, r.code, r.service, r.check], [false, "KEYED_SERVICE_OFF", "KEYED_SERVICE_OFF", "courtlistener", "C-96.21"]);
});

test("fixtures notHeldRange R113: a range of a digest the store holds nothing of is {ok: false, reason: NOT_HELD}", async () => {
  assert.deepEqual(await notHeldRange(), { ok: false, reason: "NOT_HELD" });
});

test("fixtures owedFetchAnswer R105 R111 R116: a parked fetch run by the alarm ends done, goes again with the reason kept, ends with no session, or ends final with a refusal's facts", async () => {
  assert.deepEqual(await owedFetchAnswer({ kind: "done" }), { ok: true, done: true });
  assert.deepEqual(await owedFetchAnswer({ kind: "outstanding" }), { ok: true, done: false, outstanding: 1, reason: "DELIVERY_FAILED" });
  assert.deepEqual(await owedFetchAnswer({ kind: "gone" }), { ok: true, done: true, reason: "NO_SUCH_SESSION" });
  const held = await owedFetchAnswer({ kind: "final" });
  assert.deepEqual([held.ok, held.done, held.final, held.reason], [true, true, true, "CAPTURE_HELD_BY_ANOTHER_BUNDLE"]);
  assert.deepEqual(Object.keys(held.detail).sort(), ["capture_sha", "holder", "kind"]);
  for (const reason of DELIVERY_FINAL.filter((r) => r !== "CAPTURE_HELD_BY_ANOTHER_BUNDLE")) {
    const f = await owedFetchAnswer({ kind: "final", reason });
    assert.deepEqual([f.done, f.final, f.reason, "detail" in f], [true, true, reason, false]);
  }
  const sr = await owedFetchAnswer({ kind: "final", reason: "SOURCE_REFUSED" });
  assert.deepEqual([sr.done, sr.final, sr.reason], [true, true, "SOURCE_REFUSED"]);
  await assert.rejects(() => owedFetchAnswer({ kind: "final", reason: "NOT_A_FINAL" }), /no final reason/);
  await assert.rejects(() => owedFetchAnswer({ kind: "nope" }), /no kind/);
});

test("fixtures owedRunAnswer R100 R104 R111 R118: a pending render run by the alarm ends done, goes again, or ends final (the render failed or no page, or the delivery refused for good)", async () => {
  assert.deepEqual(await owedRunAnswer({ kind: "done" }), { ok: true, done: true });
  assert.deepEqual(await owedRunAnswer({ kind: "outstanding" }), { ok: true, done: false, outstanding: 1, reason: "DELIVERY_FAILED" });
  const failed = await owedRunAnswer({ kind: "final", reason: "RENDER_FAILED" });
  assert.deepEqual([failed.done, failed.final, failed.reason, typeof failed.detail], [true, true, "RENDER_FAILED", "string"]);
  const nap = await owedRunAnswer({ kind: "final", reason: "RENDER_NOT_A_PAGE" });
  assert.deepEqual([nap.done, nap.final, nap.reason], [true, true, "RENDER_NOT_A_PAGE"]);
  const held = await owedRunAnswer({ kind: "final", reason: "CAPTURE_HELD_BY_ANOTHER_BUNDLE" });
  assert.deepEqual([held.done, held.final, held.reason, Object.keys(held.detail).sort()], [true, true, "CAPTURE_HELD_BY_ANOTHER_BUNDLE", ["capture_sha", "holder", "kind"]]);
  const big = await owedRunAnswer({ kind: "final", reason: "TOO_LARGE" });
  assert.deepEqual([big.final, big.reason], [true, "TOO_LARGE"]);
});
