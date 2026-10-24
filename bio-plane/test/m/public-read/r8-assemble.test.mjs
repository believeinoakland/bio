/* public-read — R44 (fix round 8, G121; `build/plan/fix-round-8-T51.md`): the case file is assembled in groups. One
   `caseratify` of the smallest case made 38 R2 calls inside the act, one at a time: each file a `head` then a `put`, each
   material read after the last. The assembly now runs the reads of materials, and the `head` and `put` of every file, in
   groups of 8 and writes the same objects. Every case here is the real commit (`publication`), the real store and the real
   assembly (`assembleCaseContainer`); the bucket stand-in records the start and end of each call and answers after a wait,
   as R2 does, so a call issued after another has ended is seen as depth. A count of calls and of concurrency, never a time
   taken inside the object (R-CLOCK). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, stubOf, bucket } from "./fixture.mjs";
import { bindPublishedPlane, assembleCaseContainer } from "../../../src/publication/worker.mjs";
import { buildCaseFile, CASEFILE_GROUP } from "../../../src/public-read/casefile.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});
const enc = (s) => new TextEncoder().encode(s);
const hex = (b) => createHash("sha256").update(b).digest("hex");
const CASE = "CASE-2026-0001", F = "INQ-2026-0001", DOC = "INFO-2026-0001-minutes";
const MATERIALS = 10;   // with the case's own files, well over 12 files
const NONE = 0;         // the walker's one-finding case: no material but the one document
const row = (ref, sha) => ({ ref, kind: "document", sha, text_sha: null, origin: null, archived_copy: null, included: true,
                             rests_under: "load_bearing" });

/* A complete edition over F with MATERIALS more included materials, each held in the bucket under its own hash. */
function scene(MATERIALS = 10) {
  const w = world(), env = { PUBLISHED: bucket() };
  w.doc(DOC);
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F, { legs: [{ target: DOC }] });
  const pin = w.head(F);
  const sha = w.row(`SELECT capture_sha FROM register WHERE bundle_id=?`, DOC).capture_sha;
  const extra = Array.from({ length: MATERIALS }, (_, i) => {
    const bytes = enc(`material number ${i} of the case`);
    env.PUBLISHED.m.set(`bio/published/${hex(bytes)}`, bytes);
    return row(`INFO-2026-01${String(i).padStart(2, "0")}-extra`, hex(bytes));
  });
  w.prepare(CASE, 1, { format: "bio-case-document/7", project: proj, roles: [{ target: F, version_sha: pin }], materials: [row(DOC, sha), ...extra] });
  assert.equal(w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] }).ok, true);
  assert.equal(w.signFinding(F).ok, true);
  env.PUBLISHED.m.set(`bio/published/${pin}`, enc(w.text(F)));
  env.PUBLISHED.m.set(`bio/published/${sha}`, enc(`the text of ${DOC}`));
  return { w, env };
}

/* The bucket, instrumented: every `get`, `head` and `put` waits a few milliseconds and is recorded with the number of calls
   of its kind in flight at its start. `heldAt` is the in-flight count at the peak. */
function recorded(env, { absent = false } = {}) {
  const real = env.PUBLISHED, log = { get: [], head: [], put: [] }, flight = { get: 0, head: 0, put: 0 }, peak = { get: 0, head: 0, put: 0 };
  /* `levels`: a call's level is one more than the deepest call that had ended when it started, so a call that waited for
     another to end sits below it and calls issued together share a level: the longest awaited chain of R2 calls is the top level. */
  let ended = 0, depth = 0;
  const wrap = (kind, answer = null) => async (k, v) => {
    flight[kind] += 1; peak[kind] = Math.max(peak[kind], flight[kind]); log[kind].push(k);
    const level = ended + 1; depth = Math.max(depth, level);
    try { await new Promise((r) => setTimeout(r, 4)); const r = await real[kind](k, v); return answer ? answer(r) : r; } finally { flight[kind] -= 1; ended = Math.max(ended, level); }
  };
  env.PUBLISHED = { m: real.m, get: wrap("get"), head: absent ? wrap("head", () => null) : wrap("head"), put: wrap("put") };
  return { log, peak, depth: () => depth };
}

/* `fresh`: the bucket holds none of the files under the case's keys yet (every `head` answers absent), so every file is put; else
   the objects the commit already copied are found by their `head` and not put again. */
for (const fresh of [true, false]) test(`R44 G121 the case file's reads of materials and its head and put of every file run in groups of 8, and the same objects are written (${fresh ? "every file new" : "copied objects found by head"})`, async () => {
  const { w, env } = scene();
  const seeded = new Set(fresh ? [] : env.PUBLISHED.m.keys()), initial = new Set(env.PUBLISHED.m.keys());
  const rec = recorded(env, { absent: fresh });
  const cs = w.p.caseEditionState(CASE, 1, "parks-group");
  const out = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio", cs, via: "test" });
  assert.equal(out.case_file, "built", JSON.stringify(out).slice(0, 300));
  assert.ok(out.files >= 12, `a case file of at least 12 files (${out.files})`);

  assert.ok(rec.peak.put >= 1, `put: the files owed are put (${rec.peak.put})`);
  assert.ok(rec.peak.get >= 6, `get: peak concurrency at least 6 (${rec.peak.get})`);
  for (const k of ["head", "put", "get"]) assert.ok(rec.peak[k] <= CASEFILE_GROUP, `${k}: groups of ${CASEFILE_GROUP}, never more (${rec.peak[k]})`);

  /* the same objects: every file the manifest lists, once, and the manifest's own bytes; the bucket's other keys are the seeds */
  const manifest = JSON.parse(new TextDecoder().decode(env.PUBLISHED.m.get(`bio/published/${out.manifest_sha}`)));
  const expected = new Set([...manifest.files.map((f) => `bio/published/${f.sha256}`), `bio/published/${out.manifest_sha}`]);
  const written = rec.log.put;
  assert.equal(new Set(written).size, written.length, "no object is put twice");
  /* an object read from the bucket at its hash is held there (G121b), whatever a `head` would say; every other small file is put
     by its hash, the bytes under a held key being the same bytes (G121b: no `head` before the put) */
  const read = new Set(rec.log.get);
  assert.deepEqual([...new Set(written)].sort(), [...expected].filter((k) => !read.has(k)).sort(), "the golden set of keys");
  assert.deepEqual([...env.PUBLISHED.m.keys()].filter((k) => !initial.has(k)).sort(), [...new Set(written)].filter((k) => !initial.has(k)).sort());
  assert.ok(manifest.files.every((f) => env.PUBLISHED.m.has(`bio/published/${f.sha256}`)), "every file the manifest lists is held");
});

/* G121b (K4850; re-walk 8 B, `assemble;dur` 1.7-2.3 s): the awaited chain of R2 calls. Counted, never timed (R-CLOCK): the
   level of a call is one more than the deepest call that had ended when it started. Today: reads in groups, then a `head`
   and a `put` of each group of files, then the manifest's `head` and `put` after it is recorded, 7 levels on this case. */
for (const [name, materials] of [["the walker's one-finding case", NONE], ["a case of twelve files and more", 10]]) test(`R44 G121b the case file's awaited chain of R2 calls is what its data dependencies require, ${name}`, async () => {
  const { w, env } = scene(materials);
  const rec = recorded(env, { absent: true });
  const cs = w.p.caseEditionState(CASE, 1, "parks-group");
  const out = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio", cs, via: "test" });
  assert.equal(out.case_file, "built", JSON.stringify(out).slice(0, 300));
  /* one level to read what the case holds, one to write what it derives and its manifest together */
  assert.ok(rec.depth() <= 3, `at most 3 levels of awaited R2 calls (${rec.depth()})`);
  const manifest = JSON.parse(new TextDecoder().decode(env.PUBLISHED.m.get(`bio/published/${out.manifest_sha}`)));
  assert.ok(manifest.files.every((f) => env.PUBLISHED.m.has(`bio/published/${f.sha256}`)), "every file the manifest lists is held");
  for (const k of ["head", "put", "get"]) assert.ok(rec.peak[k] <= CASEFILE_GROUP, `${k}: never more than ${CASEFILE_GROUP} at once (${rec.peak[k]})`);
});

test("R44 G121b an object the assembly read from the bucket at its hash is neither asked after nor written again", async () => {
  const { w, env } = scene(10);
  const rec = recorded(env, { absent: true });
  const cs = w.p.caseEditionState(CASE, 1, "parks-group");
  const before = new Set(env.PUBLISHED.m.keys());
  const out = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio", cs, via: "test" });
  assert.equal(out.case_file, "built");
  for (const k of rec.log.get) {
    assert.ok(!rec.log.put.includes(k), `${k} was read and is not written`);
    assert.ok(!rec.log.head.includes(k), `${k} was read and is not asked after`);
  }
  assert.ok(rec.log.get.length >= 11, "the materials were read");
  assert.deepEqual([...env.PUBLISHED.m.keys()].filter((k) => !before.has(k)).sort(), [...new Set(rec.log.put)].filter((k) => !before.has(k)).sort());
});

test("R44 G121b a file put that fails stops the case file before anything is recorded, at the bucket_put step; a manifest put that fails, at manifest_put, after the record", async () => {
  for (const [which, step] of [["file", "bucket_put"], ["manifest", "manifest_put"]]) {
    const { w, env } = scene(0);
    const real = env.PUBLISHED.put.bind(env.PUBLISHED);
    const cs = w.p.caseEditionState(CASE, 1, "parks-group");
    let recorded = false;
    const stub = stubOf(w), fetch = stub.fetch.bind(stub);
    stub.fetch = (req, init) => { if (String(typeof req === "string" ? req : req.url).includes("recordcasemanifest")) recorded = true; return fetch(req, init); };
    env.PUBLISHED.put = async (k, v) => {
      const text = new TextDecoder().decode(v);
      let isManifest = false;
      try { const m = JSON.parse(text); isManifest = Array.isArray(m.files) && Array.isArray(m.parts); } catch { /* not JSON: a file */ }
      if ((which === "manifest") === !!isManifest) throw new Error("bucket write refused");
      return real(k, v);
    };
    const out = await assembleCaseContainer({ env, stub, storeName: "bio", cs, via: "test" });
    assert.equal(out.ok, false, which);
    assert.equal(out.step, step, which);
    assert.equal(out.code, "BUCKET_FAILED", which);
    if (which === "file") assert.equal(recorded, false, "nothing is recorded over files that were not put");
  }
});

test("R44 G121 buildCaseFile reads its materials in groups of 8 and answers what the one-at-a-time read answered", async () => {
  const { w, env } = scene();
  const facts = (await (await stubOf(w).fetch(`http://do/casefilefacts?caseId=${CASE}&edition=1`)).json()).result;
  const plain = async (sha) => { const o = await env.PUBLISHED.get(`bio/published/${sha}`); return o ? new Uint8Array(await o.arrayBuffer()) : null; };
  let flight = 0, peak = 0, calls = 0;
  const slow = async (sha) => { calls += 1; flight += 1; peak = Math.max(peak, flight); try { await new Promise((r) => setTimeout(r, 4)); return await plain(sha); } finally { flight -= 1; } };
  const grouped = await buildCaseFile({ facts, group: "parks-group", read: slow });
  let seq = 0; const one = async (sha) => { seq += 1; return plain(sha); };
  const sequential = await buildCaseFile({ facts, group: "parks-group", read: one });
  assert.equal(grouped.ok, true);
  assert.ok(peak >= 6 && peak <= CASEFILE_GROUP, `read concurrency between 6 and ${CASEFILE_GROUP} (${peak})`);
  assert.ok(calls <= seq, `no read the one-at-a-time assembly did not make (${calls} against ${seq})`);
  assert.deepEqual(grouped.manifest, sequential.manifest);
  assert.deepEqual(grouped.unheld, sequential.unheld);
  assert.deepEqual(grouped.files.map((f) => [f.path, f.sha256, f.part]), sequential.files.map((f) => [f.path, f.sha256, f.part]));
});

test("R44 G121 a read that throws still stops the assembly at the build step, as the one-at-a-time read did", async () => {
  const { w, env } = scene();
  const real = env.PUBLISHED.get.bind(env.PUBLISHED);
  const sha = hex(enc("material number 3 of the case"));
  env.PUBLISHED.get = async (k) => { if (k === `bio/published/${sha}`) throw new Error("bucket read refused"); return real(k); };
  const cs = w.p.caseEditionState(CASE, 1, "parks-group");
  const out = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio", cs, via: "test" });
  assert.equal(out.ok, false);
  assert.equal(out.case_file, undefined);
  assert.equal(out.step, "build");
  assert.equal(out.code, "UNKNOWN");
});

test("R44 G121b a sliding window runs at most 8 at once, starts the next as one ends, answers in the items' order, and starts nothing after a failure", async () => {
  const { inWindow } = await import("../../../src/public-read/casefile.mjs");
  let flight = 0, peak = 0;
  const started = [];
  const out = await inWindow(Array.from({ length: 20 }, (_, i) => i), async (i) => {
    started.push(i); flight += 1; peak = Math.max(peak, flight);
    try { await new Promise((r) => setTimeout(r, i % 3 === 0 ? 8 : 2)); return i * 2; } finally { flight -= 1; }
  });
  assert.equal(peak, CASEFILE_GROUP);
  assert.deepEqual(out.map((r) => r.value), Array.from({ length: 20 }, (_, i) => i * 2));
  assert.deepEqual(started, [...started].sort((a, b) => a - b), "in order of start");
  const failed = await inWindow(Array.from({ length: 30 }, (_, i) => i), async (i) => { await new Promise((r) => setTimeout(r, 2)); if (i === 3) throw new Error("no"); });
  assert.equal(failed[3].status, "rejected");
  assert.ok(failed.filter((r) => r).length < 30, "no call is started after one failed");
});
