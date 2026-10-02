/* provenance: the Worker arm of op=registeraudit (R8, R9; `ops.mjs`, moved out of legacy-index at T18), driven with a
   stand-in store, evidence bucket and envelope helpers, as the control plane hands them in; and the ops map the
   composition root spreads (R53), driven over the real modules with the query the control plane stamps. op=attest's
   arm and the three route arms are `attestation`'s and `provenance-routes`' since N512. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, evidence, V } from "./fixture.mjs";
import * as OPS from "../../../src/provenance/ops.mjs";

const { registerAuditOp, provenanceOps } = OPS;

/* The control plane's helpers, each recording what it was asked. */
function helpers(calls = []) {
  return {
    json: (body, status = 200) => ({ body, status }),
    doAnswer: async (p) => p,
    storeSilent: (op, correlation) => { calls.push(["silent", op, correlation ?? null]); return { silent: op }; },
    storeRefusal: (out) => { calls.push(["refused", out.reason]); return { refused: out.reason }; },
    storageAbsent: (op, error) => { calls.push(["absent", op, error]); return { absent: op }; },
    captureKey: (store, s) => `${store}/captures/${s}`,
    storeName: "bio", cls: "admin",
  };
}
const storeAnswering = (answer, seen = []) => ({ fetch: async (url) => { seen.push(String(url)); return answer(String(url)); } });

test("R8, R9: op=registeraudit probes each unresolved row in the working bucket under the store's key, and relays silence and refusal", async () => {
  const held = sha("held whole");
  const rows = { total: 2, live: 0, superseded: 0, historical: 0, orphan: 0,
    unresolved: [{ capture_sha: held, bundle_id: "B", path: "p", bytes: Buffer.byteLength("held whole"), class: "unresolved" },
                 { capture_sha: sha("absent"), bundle_id: "B", path: "q", bytes: 6, class: "unresolved" }] };
  const bucket = evidence({ [`bio/captures/${held}`]: "held whole" });
  const seen = [];
  const out = await registerAuditOp({ CAPTURES: bucket }, storeAnswering(() => ({ answered: true, result: rows }), seen), helpers());
  assert.deepEqual(seen, ["http://do/registeraudit"]);
  assert.equal(out.status, 200);
  assert.deepEqual([out.body.ok, out.body.store, out.body.tokenClass], [true, "bio", "admin"]);
  assert.deepEqual([out.body.result.captured, out.body.result.unbacked, out.body.result.sound, out.body.result.probed],
                   [1, 1, false, true]);
  assert.deepEqual(bucket.calls.filter(([k]) => k === "head").map(([, key]) => key),
                   [`bio/captures/${held}`, `bio/captures/${sha("absent")}`], "the bucket is asked under the store's key");
  /* No bucket bound: every unresolved row unbacked, and the report says it could not probe (R9). */
  const bare = await registerAuditOp({}, storeAnswering(() => ({ answered: true, result: rows })), helpers());
  assert.deepEqual([bare.body.result.probed, bare.body.result.sound, bare.body.result.unbacked], [false, false, 2]);
  /* The store refused, was silent, or answered nothing: relayed, never a verdict. */
  const calls = [];
  assert.deepEqual(await registerAuditOp({}, storeAnswering(() => ({ refused: true, reason: "X" })), helpers(calls)), { refused: "X" });
  assert.deepEqual(await registerAuditOp({}, storeAnswering(() => ({ answered: false, correlation: "c1" })), helpers(calls)),
                   { silent: "registeraudit" });
  assert.deepEqual(await registerAuditOp({}, storeAnswering(() => ({ answered: true, result: null })), helpers(calls)),
                   { silent: "registeraudit" });
  assert.deepEqual(calls, [["refused", "X"], ["silent", "registeraudit", "c1"], ["silent", "registeraudit", null]]);
});

/* ===================================================================== R53: provenanceOps */

const ops = (w, query = "", body = null, opts) => provenanceOps(w.prov, new URL(`http://do/?${query}`), body, opts);
const qs = (o) => new URLSearchParams(o).toString();

test("R53: six route arms, each a function of no arguments, keyed by op name; the route arms and op=attest are not this module's", () => {
  const w = world();
  const map = ops(w);
  assert.deepEqual(Object.keys(map).sort(), ["homecensus", "recordcapturedlocator", "registeraudit", "registerholds",
    "testify", "versionchain"]);
  /* N512: `provenancechain`, `provenanceroute` and `provenanceroutes` are provenance-routes' map, and op=attest's
     Worker arm attestation's; this module's ops export the map and op=registeraudit's arm only. */
  assert.deepEqual(Object.keys(OPS).sort(), ["provenanceOps", "registerAuditOp"]);
  for (const [k, f] of Object.entries(map)) assert.deepEqual([typeof f, f.length], ["function", 0], k);
  /* Building the map runs nothing. */
  const before = w.snapshot();
  ops(w, qs({ author: V("ruth") }), { words: "w", observedAt: "2026-09-20" });
  assert.deepEqual(w.snapshot(), before);
});

test("R53: testify takes words, observedAt and title from the body, the author from the query's stamp, and every body spelling of an author as the claim C-53.2 refuses", () => {
  const w = world({ now: "2026-09-27T03:00:00.000Z" });
  /* The author is the stamp, never the body. */
  const t = ops(w, qs({ author: V("ruth") }), { words: "I saw it.", observedAt: "2026-09-20", title: "Seen" }).testify();
  assert.equal(t.ok, true, JSON.stringify(t));
  assert.deepEqual([t.author, w.head(t.bundle_id).title, t.observed_at], [V("ruth"), "Seen", "2026-09-20"]);
  /* Every spelling, a falsy value included; the first in the list's order is the one named. */
  for (const k of ["author", "observer", "authoredBy", "authored_by", "by", "member", "memberId"])
    for (const v of ["mallory", V("ruth"), "", 0, false]) {
      const r = ops(w, qs({ author: V("ruth") }), { words: "w", observedAt: "2026-09-20", [k]: v }).testify();
      assert.deepEqual([r.reason, r.check], ["TESTIMONY_AUTHOR_SUPPLIED", "C-53.2"], `${k}=${JSON.stringify(v)}`);
    }
  const first = ops(w, qs({ author: V("ruth") }), { words: "w", observedAt: "2026-09-20", memberId: "z", observer: "y" }).testify();
  assert.match(first.detail, /"y"/, "observer comes before memberId");
  /* null or undefined under a spelling is no claim. */
  const none = ops(w, qs({ author: V("sam") }), { words: "Again.", observedAt: "2026-09-20", author: null, by: undefined }).testify();
  assert.equal(none.ok, true, JSON.stringify(none));
  /* No query author is no member; no body is no words. */
  assert.equal(ops(w, "", { words: "w", observedAt: "2026-09-20" }).testify().reason, "TESTIMONY_NOT_A_MEMBER");
  assert.equal(ops(w, qs({ author: V("ruth") }), null).testify().reason, "TESTIMONY_NO_WORDS");
});

test("R53: versionchain, homecensus, registerholds and registeraudit read the query and answer what their services answer", () => {
  const w = world();
  const a = w.cap("a"), b = w.cap("b");
  w.promoteInfo("INFO-2026-0001-a", { captures: [a] });
  w.promoteInfo("INFO-2026-0002-b", { captures: [b] });
  w.prov.recordReceipt({ addressNorm: "e.org/d", captureSha: a.sha, retrieved: "2026-09-27T01:00:00Z" });
  w.prov.recordReceipt({ addressNorm: "e.org/d", captureSha: b.sha, retrieved: "2026-09-27T02:00:00Z" });
  const vq = { address: "e.org/d", at: b.sha, limit: "1", offset: "1", viewer: V("x") };
  assert.deepEqual(ops(w, qs(vq)).versionchain(),
                   w.prov.versionChain({ addressNorm: "e.org/d", at: b.sha, limit: "1", offset: "1", viewer: V("x") }));
  assert.equal(ops(w, qs(vq)).versionchain().predecessor.capture_sha, a.sha);
  assert.equal(ops(w, qs({ address: "e.org/d" })).versionchain().total, 0, "no viewer stamped sees nothing");
  assert.equal(ops(w, qs({ viewer: V("x") })).versionchain().reason, "VERSION_CHAIN_NO_ADDRESS");
  assert.deepEqual(ops(w, qs({ limit: "0" })).homecensus(), w.prov.homeCensus({ limit: "0" }));
  assert.deepEqual(ops(w).homecensus(), w.prov.homeCensus({ limit: null }));
  assert.deepEqual(ops(w, qs({ sha256: `sha256:${a.sha.toUpperCase()}`, bundle: "INFO-2026-0001-a" })).registerholds(),
                   { ok: true, sha: a.sha, asked: true, parts: { state: "none" }, registered: true, acquired: true });
  assert.deepEqual(ops(w).registerholds(), { ok: true, sha: null, asked: false, registered: null, acquired: null });
  assert.deepEqual(ops(w, qs({ sha256: a.sha })).registeraudit(), w.prov.registerRows());
});

test("R53: recordcapturedlocator takes the listeners' context out of the body and reports what the observer's listener did", () => {
  const w = world({ order: [] });
  const heard = [];
  w.prov.onReceipt("observation-log", (e) => { heard.push(e); return e.context.observe === false ? { ok: false, reason: "NOT_LOOKED" } : { written: true }; });
  w.prov.onReceipt("monitoring", () => ({ written: true }));
  const body = { address: "https://e.org/a", addressNorm: "e.org/a", captureSha: sha("a"), retrieved: "2026-09-27T01:00:00Z",
                 retrievalLocator: "https://e.org/a?x", via: "direct", authorityKind: "run", authority: "RUN-1", actor: "member:ruth" };
  const r = ops(w, "", body, { observer: "observation-log" }).recordcapturedlocator();
  assert.deepEqual(r, { recorded: true, address_norm: "e.org/a", via: "direct", observation: "new",
                        observation_written: true, observation_refused: null });
  /* The context taken out (its defaults where the body gives none), the rest the receipt. */
  assert.deepEqual(heard[0].context, { authorityKind: "run", authority: "RUN-1", actorClass: "plane", actor: "member:ruth", observe: true });
  assert.deepEqual({ ...w.row(`SELECT * FROM captured_locators`) }, { address_norm: "e.org/a", address: "https://e.org/a",
    capture_sha: sha("a"), via: "direct", retrieval_locator: "https://e.org/a?x", first_retrieved: "2026-09-27T01:00:00Z",
    last_retrieved: "2026-09-27T01:00:00Z", observations: 1 });
  /* The observer's refusal is reported as it answered; nothing written is reported false. */
  const refused = ops(w, "", { ...body, observe: false, actorClass: "member" }, { observer: "observation-log" }).recordcapturedlocator();
  assert.deepEqual([refused.recorded, refused.observation, refused.observation_written, refused.observation_refused],
                   [true, "unchanged", false, { ok: false, reason: "NOT_LOOKED" }]);
  assert.deepEqual(heard[1].context, { authorityKind: "run", authority: "RUN-1", actorClass: "member", actor: "member:ruth", observe: false });
  /* Another module's outcome is not the observer's: with no observer named, or one that did not listen, nothing is reported written. */
  assert.deepEqual(ops(w, "", body).recordcapturedlocator().observation_written, false);
  assert.deepEqual(ops(w, "", body, { observer: "capture" }).recordcapturedlocator().observation_written, false);
  /* An observer whose listener threw: not written, not refused. */
  const w2 = world();
  w2.prov.onReceipt("observation-log", () => { throw new Error("boom"); });
  assert.deepEqual(ops(w2, "", body, { observer: "observation-log" }).recordcapturedlocator(),
                   { recorded: true, address_norm: "e.org/a", via: "direct", observation: "new",
                     observation_written: false, observation_refused: null });
  /* Unrecorded answers as recordReceipt does, and writes nothing; no body is an empty one. */
  const n = w.count("captured_locators");
  assert.deepEqual(ops(w, "", { captureSha: sha("x") }, { observer: "observation-log" }).recordcapturedlocator(), { recorded: false });
  assert.deepEqual(ops(w, "", null, { observer: "observation-log" }).recordcapturedlocator(), { recorded: false });
  assert.equal(w.count("captured_locators"), n);
});
