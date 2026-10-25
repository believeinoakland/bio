/* store-assembly's copy of plane's test. R70 (proposed, fix round 6, G54; K4426, K4565, K4566, K4571), THE CASE-FILE SWEEP IS A REGISTERED CONSUMER OF THE PLANE'S ALARM: a complete, signed edition whose case file was not built
   (4783 and 6227 on biosmoke8) is owed, and the object's own alarm builds it, two editions a tick, never the same one twice, retried by a backoff when its assembly fails, re-derived at a restart.
   The REAL `Store` and scheduler over the real modules, every edition laid by the modules' own commits (`g54-seed.mjs`), the real assembly through `ratificationWorker`; the bucket and the
   stub are the object's own. Red on the tree before the providers (ratification's `caseFileSweep`/`caseFileWake`, publication's columns and owed read): nothing registers the sweep, so no alarm
   builds an edition. Time is the scheduler's `at` (R-CLOCK: no wall-time claim). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store } from "./alarmed-store.mjs";
import { multipartBucket } from "../record-core/storage.mjs";
import { publicationOf } from "../../../src/publication/index.mjs";
import { schedulerOf } from "../../../src/scheduler/index.mjs";
import { seedEdition, completeEdition, stateOf, NOW } from "./g54-seed.mjs";
import { PUBLISHED_STORE } from "../../../src/control-plane/index.mjs";
import { json, doAnswer, storeSilent, storeRefusal, requiredArgument, STORE_SILENT_REASON, STORE_SILENT_DETAIL } from "../../../src/answer-envelope/index.mjs";
import { bindPublishedPlane } from "../../../src/publication/worker.mjs";

/* the Worker's module binds the published plane (`bindPublishedPlane`) as plane's `index.mjs` does when it loads in the isolate that holds the object; store-assembly has no Worker, so the test binds it the same way */
bindPublishedPlane({ json, doAnswer, storeSilent, storeRefusal, requiredArgument, STORE_SILENT_REASON, STORE_SILENT_DETAIL, PUBLISHED_STORE });

const T0 = Date.parse(NOW);
const MIN = 60_000;
const worldOf = async (db, env = { CAPTURES: multipartBucket(), PUBLISHED: multipartBucket(), INSTANCE_NAME: "town" }) => {
  const x = await store({ ...(db ? { db } : {}), env });
  return { x, env, ctx: x.ctx };
};
const editions = async (w, n, base = 4780) => {
  const out = [];
  for (let i = 0; i < n; i++) { const s = await seedEdition(w.ctx, `CASE-2026-${base + i}`); await completeEdition(w.ctx, w.env, s); out.push(s); }
  return out;
};
const built = (w, s) => { const st = stateOf(w.ctx, s); return !!(st && st.complete && st.manifest_sha); };
const caseFileRow = (w, s) => [...w.ctx.storage.sql.exec(`SELECT * FROM published_cases WHERE case_id=? AND edition=?`, s.caseId, s.edition)][0];
const sweepAnswer = (a) => (a && typeof a === "object" ? a.casefilesweep : undefined);

test("R70 G54: the sweep is a scheduler consumer of the plane's, registered before the scheduler's start", async () => {
  const w = await worldOf();
  const names = schedulerOf(w.ctx, w.env).registry(null).map((r) => r.name);
  assert.ok(names.includes("casefile-sweep"), `registered consumers: ${names.join(", ")}`);
  assert.ok(names.indexOf("casefile-sweep") > names.indexOf("pending-work"), "after pending-work");
});

test("R70 G54: complete editions with no case file are built by the alarm, two a tick, and a second alarm does nothing", { timeout: 300_000 }, async () => {
  const w = await worldOf(), es = await editions(w, 3);
  for (const s of es) assert.equal(built(w, s), false, "complete, no case file (4783's shape)");
  const putsBefore = w.env.PUBLISHED.state.uploaded.length;
  let ans = await w.x.s.onAlarm(T0 + 10 * MIN);
  assert.equal(es.filter((s) => built(w, s)).length, 2, "two editions a tick");
  assert.ok(sweepAnswer(ans) && sweepAnswer(ans).finished >= 2, `the tick answers finished for a built edition: ${JSON.stringify(ans)}`);
  ans = await w.x.s.onAlarm(T0 + 11 * MIN);
  assert.equal(es.filter((s) => built(w, s)).length, 3, "the third waits one tick, then builds (R27's hold never strands it)");
  const heldAfter = [...w.env.PUBLISHED.held.keys()].length;
  ans = await w.x.s.onAlarm(T0 + 12 * MIN);
  assert.equal([...w.env.PUBLISHED.held.keys()].length, heldAfter, "a third alarm writes nothing");
  assert.ok(!sweepAnswer(ans) || (sweepAnswer(ans).asked ?? 0) === 0, `nothing is asked: ${JSON.stringify(sweepAnswer(ans))}`);
  void putsBefore;
});

test("R70 G54: an assembly that fails once is recorded failed and retried after its backoff; the ledger's row states it (the reader's `publishedcase` answer is the Worker's, read in g54-l.test.mjs)", { timeout: 300_000 }, async () => {
  const w = await worldOf(), [s] = await editions(w, 1, 4790);
  const realPut = w.env.PUBLISHED.put.bind(w.env.PUBLISHED); let failed = 0;
  w.env.PUBLISHED.put = async (k, v, o) => { if (failed++ === 0 && /bio\/published\//.test(k)) throw new Error("bucket refused (injected)"); return realPut(k, v, o); };
  await w.x.s.onAlarm(T0 + 10 * MIN);
  assert.equal(built(w, s), false, "the failed assembly built nothing");
  const row = caseFileRow(w, s);
  assert.equal(row.casefile_state, "failed", JSON.stringify(row));
  assert.ok(row.casefile_attempts >= 1);
  /* the ledger stamps an attempt with the object's clock, so the retries are asked at instants after that stamp */
  await w.x.s.onAlarm(Date.now() + 5_000);
  assert.equal(built(w, s), false, "inside the backoff nothing is retried");
  await w.x.s.onAlarm(Date.now() + 2 * MIN);
  assert.equal(built(w, s), true, "after the backoff it is built");
  assert.equal(caseFileRow(w, s).casefile_state, "built");
});

test("R70 G54: a store with nothing owed gives the sweep no wake, and a restart re-derives the alarm of an owed edition", { timeout: 300_000 }, async () => {
  const w = await worldOf();
  const sweep = (ww) => schedulerOf(ww.ctx, ww.env).registry(null).find((r) => r.name === "casefile-sweep");
  assert.ok(sweep(w), "registered");
  assert.equal(await sweep(w).wake(T0 + 10 * MIN), null, "nothing owed, no wake");
  assert.equal(await sweep(w).due(T0 + 10 * MIN), null);
  const [s] = await editions(w, 1, 4795);
  assert.equal(built(w, s), false);
  const w2 = await worldOf(w.x.db, w.env);   /* a restart: a new object over the same storage and the same buckets */
  assert.ok(Number.isFinite(await sweep(w2).wake(T0 + 10 * MIN)), "the sweep wants a wake for the owed edition");
  assert.ok(Number.isFinite(await w2.ctx.storage.getAlarm()), "the alarm is armed at the start");
  await w2.x.s.onAlarm(T0 + 10 * MIN);
  assert.equal(built(w2, s), true);
});

test("R70 G54: scheduler needs no change: the sweep's answer arrives under its own key beside the other consumers' in the tick's answer", { timeout: 300_000 }, async () => {
  const w = await worldOf(); await editions(w, 1, 4799);
  const ans = await w.x.s.onAlarm(T0 + 10 * MIN);
  assert.ok(ans && typeof ans === "object" && "casefilesweep" in ans, `tick answer keys: ${Object.keys(ans || {}).join(", ")}`);
  assert.ok("swept" in ans && "monitor" in ans, "the other consumers' keys stand");
});
