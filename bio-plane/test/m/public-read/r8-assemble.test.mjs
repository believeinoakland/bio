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
const row = (ref, sha) => ({ ref, kind: "document", sha, text_sha: null, origin: null, archived_copy: null, included: true,
                             rests_under: "load_bearing" });

/* A complete edition over F with MATERIALS more included materials, each held in the bucket under its own hash. */
function scene() {
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
  const wrap = (kind, answer = null) => async (k, v) => {
    flight[kind] += 1; peak[kind] = Math.max(peak[kind], flight[kind]); log[kind].push(k);
    try { await new Promise((r) => setTimeout(r, 4)); const r = await real[kind](k, v); return answer ? answer(r) : r; } finally { flight[kind] -= 1; }
  };
  env.PUBLISHED = { m: real.m, get: wrap("get"), head: absent ? wrap("head", () => null) : wrap("head"), put: wrap("put") };
  return { log, peak };
}

/* `fresh`: the bucket holds none of the files under the case's keys yet (every `head` answers absent), so every file is put; else
   the objects the commit already copied are found by their `head` and not put again. */
for (const fresh of [true, false]) test(`R44 G121 the case file's reads of materials and its head and put of every file run in groups of 8, and the same objects are written (${fresh ? "every file new" : "copied objects found by head"})`, async () => {
  const { w, env } = scene();
  const seeded = new Set(fresh ? [] : env.PUBLISHED.m.keys());
  const rec = recorded(env, { absent: fresh });
  const cs = w.p.caseEditionState(CASE, 1, "parks-group");
  const out = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio", cs, via: "test" });
  assert.equal(out.case_file, "built", JSON.stringify(out).slice(0, 300));
  assert.ok(out.files >= 12, `a case file of at least 12 files (${out.files})`);

  assert.ok(rec.peak.head >= 6, `head: peak concurrency at least 6 (${rec.peak.head})`);
  assert.ok(fresh ? rec.peak.put >= 6 : rec.peak.put >= 1, `put: peak concurrency at least 6 where 8 are owed (${rec.peak.put})`);
  assert.ok(rec.peak.get >= 6, `get: peak concurrency at least 6 (${rec.peak.get})`);
  for (const k of ["head", "put", "get"]) assert.ok(rec.peak[k] <= CASEFILE_GROUP, `${k}: groups of ${CASEFILE_GROUP}, never more (${rec.peak[k]})`);

  /* the same objects: every file the manifest lists, once, and the manifest's own bytes; the bucket's other keys are the seeds */
  const manifest = JSON.parse(new TextDecoder().decode(env.PUBLISHED.m.get(`bio/published/${out.manifest_sha}`)));
  const expected = new Set([...manifest.files.map((f) => `bio/published/${f.sha256}`), `bio/published/${out.manifest_sha}`]);
  const written = rec.log.put;
  assert.equal(new Set(written).size, written.length, "no object is put twice");
  assert.deepEqual([...new Set(written)].sort(), [...expected].filter((k) => !seeded.has(k)).sort(), "the golden set of keys");
  assert.deepEqual([...env.PUBLISHED.m.keys()].filter((k) => !seeded.has(k)).sort(), [...new Set(written)].sort());
  if (!fresh) assert.ok(rec.log.head.length >= written.length, "every object put was asked after by its head");
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
