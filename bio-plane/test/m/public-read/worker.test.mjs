/* public-read — the Worker half: the public bytes read (R5, with D-613 and D-734), the case container (R6) and the
   in-band quartet (R7). Copied from `test/m/publication/worker.test.mjs` and renamed (publication R13, R15, R16 are this
   module's R5, R6, R7, K651). The files it drives (`publication/worker.mjs`, `container.mjs`, `inband.mjs`) join this
   module's paths at `publication`'s merge. The control plane's helpers are bound as the plane binds them, and the
   published store's Durable Object is played by the plane store's op map, its part here (`publicationOps` with this
   module's `publicReadOps` beside it, as `plane/store.mjs` spreads them), over the real store side. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket, V, SIG, NOW, sha } from "./fixture.mjs";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer, publishedStoreAbsent, noPublishedPart,
         publishedObjectMissing } from "../../../src/publication/worker.mjs";
import { rowOf } from "../../../src/public-read/checks.mjs";
import { serialiseContainer, containerEntries, CONTAINER_MAX_BYTES, layoutOf } from "../../../src/container.mjs";
import { inbandQuartet, canonicalBytes, floorsOf, INBAND_FORMAT } from "../../../src/inband.mjs";
import { readContainer, readPart, crc32 } from "../../../src/ooxml.mjs";


class StoreSilent extends Error { constructor(op) { super(op); this.op = op; } }
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, StoreSilent, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});

const call = async (w, env, op, q, opts) => {
  const url = new URL(`https://plane/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  return publishedRoutes({ op, url, env, stub: stubOf(w, opts) });
};

const F = "INQ-2026-0001";
/* CASE-2026-0001 edition 1 over F, ratified and published; F's bundle.md in the published bucket under its sha. */
function publishedCase() {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F);
  const pin = w.head(F);
  w.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: F, version_sha: pin }],
                                   strength: [{ target: F, axis: "capture", grade: "B" }] });
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] });
  const text = w.text(F);
  w.signFinding(F, { shas: [{ sha256: pin, path: "bundle.md", kind: "bundle", bytes: Buffer.byteLength(text) }] });
  const env = { PUBLISHED: bucket() };
  env.PUBLISHED.m.set(`bio/published/${pin}`, new TextEncoder().encode(text));
  return { w, env, pin, proj, text };
}

test("R5 publishedbytes answers bytes by hash only, and each failure by its governed code and status", async () => {
  const { w, env, pin, text } = publishedCase();
  const bad = await call(w, env, "publishedbytes", { sha256: "NOT-A-HASH" });
  assert.equal(bad.status, 400);
  assert.equal((await bad.json()).reason, "REQUIRED_ARGUMENT_MISSING");
  const ok = await call(w, env, "publishedbytes", { sha256: pin });
  assert.equal(ok.status, 200);
  assert.equal(await ok.text(), text);
  assert.equal(ok.headers.get("x-published-kind"), "bundle");
  /* never published and never existed: one answer (C-98.1) */
  const none = await call(w, env, "publishedbytes", { sha256: "0".repeat(64) });
  assert.equal(none.status, 404);
  const noneBody = await none.json();
  assert.deepEqual([noneBody.reason, noneBody.check, noneBody.translation], ["NO_PUBLISHED_PART", "C-98.1", rowOf("NO_PUBLISHED_PART").translation]);
  w.inquiry("INQ-2026-0002");
  const working = w.head("INQ-2026-0002");
  assert.deepEqual(await (await call(w, env, "publishedbytes", { sha256: working })).json(), { ...noneBody, sha256: working },
                   "working bytes answer exactly as bytes that never existed");
  /* published, and the bound store holds no bytes (C-98.2) */
  env.PUBLISHED.m.clear();
  const missing = await call(w, env, "publishedbytes", { sha256: pin });
  assert.equal(missing.status, 404);
  assert.deepEqual((({ reason, check }) => [reason, check])(await missing.json()), ["OBJECT_MISSING", "C-98.2"]);
  /* no published store bound at all (C-68.5) */
  const unbound = await call(w, {}, "publishedbytes", { sha256: pin });
  assert.equal(unbound.status, 503);
  const ub = await unbound.json();
  assert.deepEqual([ub.reason, ub.check, ub.translation], ["NO_PUBLISHED_STORE", "C-68.5", rowOf("NO_PUBLISHED_STORE").translation]);
  assert.deepEqual(publishedStoreAbsent({ PUBLISHED: { get() {} } }), null);
  assert.deepEqual(publishedObjectMissing().check, "C-98.2");
  /* N297: the governed site answers the refusal itself (the verdict reader judges it); its one caller wraps it, 404 */
  assert.deepEqual(noPublishedPart("x"), { ...noneBody, sha256: "x" });
  assert.equal(noPublishedPart("x").ok, false);
  /* a part asked as a container (C-98.3) */
  env.PUBLISHED.m.set(`bio/published/${pin}`, new TextEncoder().encode(text));
  const notc = await call(w, env, "publishedbytes", { sha256: pin, format: "zip" });
  assert.equal(notc.status, 400);
  assert.deepEqual((({ reason, check }) => [reason, check])(await notc.json()), ["NOT_A_CONTAINER", "C-98.3"]);
  /* a store that does not answer is a silence, never a claim */
  assert.equal((await call(w, env, "publishedbytes", { sha256: pin }, { silent: true })).status, 502);
});

test("R5 the container form: MANIFEST_UNREADABLE, PART_MISSING and DUPLICATE_PATH at 409 (D-613), CONTAINER_TOO_LARGE past 64 MiB", async () => {
  const { w, env, pin } = publishedCase();
  const put = (manifest, raw = null) => {
    const bytes = raw || new TextEncoder().encode(JSON.stringify(manifest));
    const s = sha(Buffer.from(bytes));
    w.p.recordCaseManifest({ caseId: "CASE-2026-0001", edition: 1, manifest: manifest || { x: 1 }, manifestSha: s });
    env.PUBLISHED.m.set(`bio/published/${s}`, bytes);
    return s;
  };
  const unreadable = put(null, new TextEncoder().encode("not json"));
  const u = await call(w, env, "publishedbytes", { sha256: unreadable, format: "zip" });
  assert.equal(u.status, 500);
  assert.deepEqual((({ reason, check }) => [reason, check])(await u.json()), ["MANIFEST_UNREADABLE", "C-98.4"]);
  /* each further manifest needs its own case edition: a manifest is recorded once */
  const second = (manifest) => {
    const n = w.count("published_cases") + 1;
    w.st.sql.exec(`INSERT INTO published_cases (case_id, edition, opened) VALUES ('CASE-2026-0001', ?, ?)`, n, NOW);
    const bytes = new TextEncoder().encode(JSON.stringify(manifest));
    const s = sha(Buffer.from(bytes));
    assert.equal(w.p.recordCaseManifest({ caseId: "CASE-2026-0001", edition: n, manifest, manifestSha: s }).ok, true);
    env.PUBLISHED.m.set(`bio/published/${s}`, bytes);
    return s;
  };
  const hole = second({ case: "C", parts: [{ path: "a", sha256: "9".repeat(64) }] });
  const h = await call(w, env, "publishedbytes", { sha256: hole, format: "zip" });
  assert.equal(h.status, 409);
  const hb = await h.json();
  assert.deepEqual([hb.reason, hb.check, hb.translation], ["PART_MISSING", "C-98.5", rowOf("PART_MISSING").translation]);
  const dup = second({ case: "C", parts: [{ path: "a", sha256: pin }, { path: "a", sha256: pin }] });
  const d = await call(w, env, "publishedbytes", { sha256: dup, format: "zip" });
  assert.equal(d.status, 409, "D-613: a name used twice is a conflict, never too large");
  const db = await d.json();
  assert.deepEqual([db.reason, db.check, db.translation], ["DUPLICATE_PATH", "C-98.6", rowOf("DUPLICATE_PATH").translation]);
  assert.equal(CONTAINER_MAX_BYTES, 64 * 1024 * 1024);
  const big = serialiseContainer([{ name: "a", bytes: new Uint8Array(100) }], { maxBytes: 50 });
  assert.deepEqual([big.ok, big.reason, rowOf(big.reason).check], [false, "CONTAINER_TOO_LARGE", "C-98.7"]);
});

test("R5 a ratified case document's hash is served from its signed text, re-hashed; bytes that do not hash to it are refused by name (D-734)", async () => {
  const { w, env } = publishedCase();
  const doc = w.row(`SELECT doc_sha, text FROM case_documents`);
  const r = await call(w, env, "publishedbytes", { sha256: doc.doc_sha });
  assert.equal(r.status, 200);
  assert.equal(await r.text(), doc.text);
  assert.equal(r.headers.get("x-published-kind"), "case_document");
  w.st.sql.exec(`UPDATE case_documents SET text=text || 'x'`);
  const bad = await call(w, env, "publishedbytes", { sha256: doc.doc_sha });
  assert.equal(bad.status, 500);
  const bb = await bad.json();
  assert.deepEqual([bb.reason, bb.check, bb.translation], ["CASE_DOCUMENT_UNSERVABLE", "C-98.9", rowOf("CASE_DOCUMENT_UNSERVABLE").translation]);
});

test("R5 publishedcase renders each finding from its published bytes, never the working record, and states a missing body by its code", async () => {
  const { w, env, pin } = publishedCase();
  const r = await call(w, env, "publishedcase", { id: "CASE-2026-0001" });
  assert.equal(r.status, 200);
  const c = await r.json();
  assert.equal(c.findings[0].body.state, "published");
  assert.equal(c.findings[0].body.from_sha, pin);
  assert.equal(c.findings[0].bytes, `op=publishedbytes&sha256=${pin}`);
  assert.equal("strength" in c, false);
  const nf = await call(w, env, "publishedcase", { id: "NOPE" });
  assert.equal(nf.status, 404);
  assert.equal((await nf.json()).check, "C-98.8");
  assert.equal((await call(w, env, "publishedcase", {})).status, 400);
  env.PUBLISHED.m.clear();
  const miss = await (await call(w, env, "publishedcase", { id: "CASE-2026-0001" })).json();
  assert.deepEqual([miss.findings[0].body.state, miss.findings[0].body.reason, miss.findings[0].body.check],
                   ["unavailable", "OBJECT_MISSING", "C-98.2"]);
  const unb = await (await call(w, {}, "publishedcase", { id: "CASE-2026-0001" })).json();
  assert.deepEqual([unb.findings[0].body.reason, unb.findings[0].body.check], ["NO_PUBLISHED_STORE", "C-68.5"]);
});

test("R6 the container is a stored ZIP, fixed timestamps, manifest at its root and each part under the root, the same manifest giving the same bytes; assembled once; recordCaseManifest refuses", async () => {
  const { w, env, pin, text } = publishedCase();
  const cs = w.p.caseEditionState("CASE-2026-0001", 1, "test-group");
  assert.equal(cs.complete, true);
  const out = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio", cs, via: "test" });
  assert.equal(out.findings, 1);
  assert.equal(w.row(`SELECT manifest_sha FROM published_cases`).manifest_sha, out.manifest_sha);
  assert.equal(out.inband.hash.sha256, out.manifest_sha);
  const manifest = JSON.parse(w.row(`SELECT manifest FROM published_cases`).manifest);
  assert.equal(manifest.format, "bio-case-container/6");
  assert.equal(manifest.case_document.doc_sha, w.row(`SELECT doc_sha FROM case_documents`).doc_sha);
  assert.equal("strength" in manifest, false, "no case-level strength in the artifact that travels (R11)");
  const zipOf = async () => {
    const r = await call(w, env, "publishedbytes", { sha256: out.manifest_sha, format: "zip" });
    assert.equal(r.status, 200);
    return new Uint8Array(await r.arrayBuffer());
  };
  const a = await zipOf(), b = await zipOf();
  assert.deepEqual(a, b, "the same manifest and parts give the same bytes");
  const zc = await readContainer(a);
  assert.equal(zc.ok, true);
  assert.deepEqual(zc.entries.map((e) => e.name), ["MANIFEST.json", `CASE-2026-0001/${F}/bundle.md`]);
  assert.ok(zc.entries.every((e) => e.method === 0), "stored, never deflated");
  const part = await readPart(a, zc, `CASE-2026-0001/${F}/bundle.md`);
  assert.equal(new TextDecoder().decode(part.bytes), text);
  /* fixed timestamps: the DOS date of 1980-01-01 in every local header */
  const view = new DataView(a.buffer, a.byteOffset);
  assert.deepEqual([view.getUint16(10, true), view.getUint16(12, true)], [0, 0x0021]);
  assert.equal(layoutOf(manifest).root, "CASE-2026-0001/");
  /* recorded once: the same manifest again is fine, another is refused */
  assert.equal(w.p.recordCaseManifest({ caseId: "CASE-2026-0001", edition: 1, manifest, manifestSha: out.manifest_sha }).ok, true);
  assert.equal(w.p.recordCaseManifest({ caseId: "CASE-2026-0001", edition: 1, manifest, manifestSha: "e".repeat(64) }).reason, "MANIFEST_EXISTS");
  assert.equal(w.p.recordCaseManifest({ caseId: "CASE-2026-0001", edition: 9, manifest, manifestSha: "e".repeat(64) }).reason, "NO_SUCH_CASE_EDITION");
  assert.equal(w.p.recordCaseManifest({ caseId: "CASE-2026-0001" }).reason, "MALFORMED");
  assert.equal(typeof crc32(new Uint8Array([1])), "number");
});

test("R7 inbandQuartet answers the format, the hash over JSON.stringify(subject, null, 1) as UTF-8, the date, the author and both floors", async () => {
  const subject = { b: 1, a: "é" };
  const { bytes, quartet } = await inbandQuartet({ subject, over: "the thing", date: NOW, author: "olive",
                                                   bar: { declared: true, capture: "B", connection: "null" } });
  assert.equal(INBAND_FORMAT, "bio-inband/1");
  assert.deepEqual(bytes, new TextEncoder().encode(JSON.stringify(subject, null, 1)));
  assert.deepEqual(canonicalBytes(subject), bytes);
  assert.deepEqual([quartet.format, quartet.hash.sha256, quartet.hash.bytes, quartet.hash.over, quartet.date, quartet.author],
                   ["bio-inband/1", sha(Buffer.from(bytes)), bytes.length, "the thing", NOW, "olive"]);
  assert.deepEqual([quartet.floors.capture, quartet.floors.connection, quartet.floors.declared], ["B", null, true]);
  const none = floorsOf(null);
  assert.deepEqual([none.capture, none.connection, none.declared], [null, null, false]);
  assert.match(none.detail, /NO FLOOR IS DECLARED/, "no declared bar says so in words");
  const q2 = (await inbandQuartet({ subject: {}, over: "x" })).quartet;
  assert.deepEqual([q2.date, q2.author], [null, null]);
});
