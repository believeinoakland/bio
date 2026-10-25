/* plane R87 (T51 fix round 6, G54), the platform check L (G54 (4)): on workerd under Miniflare, the plane's REAL `Store` (scheduler and the registered `casefile-sweep`), a real Durable Object, real R2 buckets and
   the real storage (`g54-l-entry.mjs`). The object's own alarm handler builds the case file of a complete edition that has none; a bucket `put` that throws, or throws only for the manifest's bytes, is
   recorded and healed by a later tick; an object killed in the middle of a sweep is restarted over the same storage and owes the edition again after its backoff; an edition whose caller disconnects after
   the commit is completed by the sweep; an edition of about 500 files and 40 MB is built at the real limits. Counts, not times (R-CLOCK). The figures are printed. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";

const ENTRY = fileURLToPath(new URL("./g54-l-entry.mjs", import.meta.url));
const PERSIST = mkdtempSync(join(tmpdir(), "plane-g54-"));
const boot = () => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "G54Plane", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"], bindings: { INSTANCE_NAME: "g54", VERSION: "test" },
  durableObjectsPersist: PERSIST, r2Persist: join(PERSIST, "r2"),
});
let mf = boot();
after(() => mf.dispose());
const stub = async () => { const ns = await mf.getDurableObjectNamespace("STORE"); return ns.get(ns.idFromName("bio")); };
const doAsk = async (path) => { const r = await (await stub()).fetch(`http://do/${path}`); const t = await r.text(); assert.equal(r.status, 200, t); return JSON.parse(t); };
const workerAsk = async (path, init) => { const r = await mf.dispatchFetch(`http://plane/g54w/${path}`, init); const t = await r.text(); assert.equal(r.status, 200, t); return JSON.parse(t); };
const FAR = () => Date.now() + 30 * 86_400_000;   /* the alarm's instant, after any backoff (the ledger stamps attempts with the object's clock) */
const alarm = (at = FAR()) => doAsk(`g54p/alarm?at=${at}`);
const fin = (t) => (t.sweep ? t.sweep.finished : 0), asked = (t) => (t.sweep ? t.sweep.asked : 0);   /* the sweep is not in the answer of a tick that did not run it */
const state = (s) => doAsk(`g54/state?case=${s.caseId}&edition=1`);

let nth = 0;
async function seeded(extra = "") {
  const caseId = `CASE-2026-${String(5100 + ++nth)}`;
  const s = await doAsk(`g54/seed?case=${caseId}&edition=1${extra}`);
  return { ...s, caseId };
}
const completed = async (s, { disarm = false } = {}) => { await doAsk(`g54/finding?finding=${s.finding}${disarm ? "&disarm=1" : ""}`); const st = await state(s); assert.deepEqual([st.complete, st.manifest_sha], [true, null], "complete, no case file (4783's shape)"); return st; };
const drain = async () => { await doAsk("g54p/bucket?mode=none"); for (let i = 0; i < 40; i++) { const t = await alarm(); if (!asked(t)) return; } };

test("R87 G54 L: the object's own alarm handler builds the case file of each complete edition that has none, two a tick; a second and a third alarm do nothing", { timeout: 240_000 }, async () => {
  await drain();
  const a = await seeded(), b = await seeded(), c = await seeded();
  for (const e of [a, b, c]) await completed(e);
  const w = await doAsk("g54p/wake");
  assert.ok(Number.isFinite(w.alarm), `the alarm is armed for the owed editions (${w.alarm})`);
  const t1 = await alarm();
  console.log(`# G54 L alarm 1: keys ${t1.keys.length}, sweep ${JSON.stringify(t1.sweep).slice(0, 220)}`);
  assert.ok(t1.keys.includes("casefilesweep"), "the sweep's answer is in the tick's answer");
  assert.equal(t1.sweep.finished, 2, "two editions a tick");
  assert.equal((await state(c)).manifest_sha, null, "the third waits");
  const t2 = await alarm();
  assert.equal(t2.sweep.finished, 1, "R27's hold did not strand the third");
  for (const e of [a, b, c]) assert.match(String((await state(e)).manifest_sha), /^[0-9a-f]{64}$/);
  const t3 = await alarm();
  assert.equal(asked(t3), 0, "idempotent: nothing owed, nothing asked");
});

test("R87 G54 L: a bucket put that throws once, and one that throws only for the manifest's bytes, are recorded and healed by the tick after the backoff", { timeout: 240_000 }, async () => {
  await drain();
  for (const mode of ["put_throws_once", "manifest_put_throws_once"]) {
    const s = await seeded();
    await completed(s);
    await doAsk(`g54p/bucket?mode=${mode}`);
    const t1 = await alarm(Date.now() + 200_000);   /* just past the first-attempt grace of the edition (it was committed in 2026-10-22) */
    const st1 = await state(s);
    console.log(`# G54 L ${mode}: tick 1 ${JSON.stringify(t1.sweep).slice(0, 160)}; ledger ${JSON.stringify(st1.ledger).slice(0, 200)}; manifest_sha ${st1.manifest_sha ? "set" : "null"}`);
    assert.equal(fin(t1), 0);
    assert.equal(st1.ledger.state, "failed");
    const soon = await alarm(Date.now());
    assert.equal(fin(soon), 0, "inside its backoff nothing is retried");
    const later = await alarm();
    assert.equal(fin(later), 1, "built once its backoff has passed");
    const st2 = await state(s);
    assert.match(String(st2.manifest_sha), /^[0-9a-f]{64}$/);
    assert.equal(st2.ledger.state, "built");
  }
});

test("R87 G54 L: an object killed in the middle of a sweep is restarted over the same storage: the edition is `building` (counted as an attempt), owed again after its backoff, and built", { timeout: 300_000 }, async () => {
  await drain();
  const s = await seeded("&materials=3&kib=64");
  await completed(s);
  await doAsk("g54p/bucket?mode=hang_after&n=2");
  const pending = alarm(Date.now() + 200_000).catch((e) => e);
  let st = await state(s);
  for (let i = 0; i < 200 && st.ledger.state !== "building"; i++) { await new Promise((r) => setTimeout(r, 50)); st = await state(s); }
  assert.equal(st.ledger.state, "building", "the sweep recorded the attempt before it began");
  assert.ok(st.ledger.attempts >= 1);
  await mf.dispose();   /* the kill */
  await pending;
  mf = boot();
  st = await state(s);
  console.log(`# G54 L kill: after the restart the edition is ${st.ledger.state}, attempts ${st.ledger.attempts}, manifest_sha ${st.manifest_sha ? "set (over bytes the kill left unstored)" : "null"}`);
  assert.equal(st.ledger.state, "building");
  assert.ok(st.ledger.attempts >= 1, "a building left by a kill is an attempt");
  /* the manifest may already be recorded over bytes never stored (the second candidate of step 0): the edition is owed all the same */
  const w = await doAsk("g54p/wake");
  assert.ok(Number.isFinite(w.alarm), `the restart re-derived an alarm for the owed edition (${w.alarm})`);
  const t = await alarm();
  assert.equal(fin(t), 1, JSON.stringify(t.sweep));
  assert.equal((await state(s)).ledger.state, "built");
});

test("R87 G54 L: an edition whose caller disconnects after the commit is completed by the sweep if the request did not", { timeout: 240_000 }, async () => {
  await drain();
  const s = await seeded();
  const ctl = new AbortController();
  const pending = mf.dispatchFetch(`http://plane/g54w/complete?case=${s.caseId}&finding=${s.finding}&wait=2500`, { signal: ctl.signal }).catch((e) => e);
  let st = await state(s);
  for (let i = 0; i < 100 && !st.complete; i++) { await new Promise((r) => setTimeout(r, 50)); st = await state(s); }
  assert.equal(st.complete, true, "the commit landed");
  ctl.abort();
  await pending;
  await new Promise((r) => setTimeout(r, 3500));
  const after = await state(s);
  console.log(`# G54 L disconnect: after the caller left, manifest_sha ${after.manifest_sha ? "set" : "null"}, ledger ${after.ledger.state}`);
  await alarm();
  const done = await state(s);
  assert.match(String(done.manifest_sha), /^[0-9a-f]{64}$/, "built, by the request or by the sweep");
});

test("R87 G54 L (measure): an edition of about 500 files and 40 MB of material is built by one tick of the object's alarm at the real limits, without a memory kill; the bucket's counts are printed", { timeout: 480_000 }, async () => {
  await drain();
  const s = await seeded("&materials=250&kib=160");
  await completed(s, { disarm: true });   /* the build is the tick asked for below, not one the runtime fires beside it (a 9 s sweep of 40 MB on a slow machine meets the next request and the tick's counts are the other tick's) */
  await doAsk("g54p/bucket?mode=count");
  const t = await alarm();
  const st = await state(s);
  console.log(`# G54 L measure: tick ${JSON.stringify(t.sweep).slice(0, 300)}; the bucket was asked get ${t.counts.get}, head ${t.counts.head}, put ${t.counts.put}, bytes read ${t.counts.bytes}; ledger ${st.ledger.state}, objects ${st.objects}`);
  assert.equal(t.sweep.finished, 1, JSON.stringify(t.sweep));
  assert.match(String(st.manifest_sha), /^[0-9a-f]{64}$/);
  assert.equal(st.ledger.state, "built");
  assert.ok(t.sweep.files >= 500, `every document and every text is a file (${t.sweep.files})`);
});

test("R87 G54 L: the reader's `publishedcase` (the Worker's public door, the object's ledger) states the case file: being_prepared before, retrying with its code after a recorded failure, built after the sweep; it never carries a step, an error or a detail", { timeout: 240_000 }, async () => {
  await drain();
  const s = await seeded();
  await completed(s);
  const read = async () => { const r = await mf.dispatchFetch(`http://plane/api?op=publishedcase&id=${s.caseId}`); const t = await r.text(); assert.equal(r.status, 200, t); return JSON.parse(t); };
  const cf = async () => { const j = await read(); return j.result ? j.result.case_file ?? (j.result.verification && j.result.verification.case_file) : j.case_file; };
  const before = await cf();
  console.log(`# G54 L publishedcase before: ${JSON.stringify(before)}`);
  assert.equal(before && before.state, "being_prepared");
  await doAsk("g54p/bucket?mode=put_throws_once");
  await alarm(Date.now() + 200_000);
  const failed = await cf();
  console.log(`# G54 L publishedcase after a recorded failure: ${JSON.stringify(failed)}`);
  assert.equal(failed.state, "retrying");
  assert.equal(failed.code, "BUCKET_FAILED");
  for (const k of ["step", "error", "detail", "why"]) assert.equal(k in failed, false, `${k} stays in the row and the log`);
  assert.ok(!JSON.stringify(await read()).includes("injected"), "the thrown message is not in the public answer");
  await alarm();
  const builtNow = await cf();
  console.log(`# G54 L publishedcase after the sweep: ${JSON.stringify(builtNow)}`);
  assert.equal(builtNow.state, "built");
});
