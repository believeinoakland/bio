/* scheduler — T39-15 (R25; N806, K2333): the consumer `document-copy`, after `file-reputation`, calling case-carriage's
   `copyBatch({})` (its R15), its due and wake `copyWake(now)` asked afresh at every firing, arm and start, its answer
   under `doccopy` (R2); and its registration with `case-carriage.onCopyWork` (its R17), whose call arms the alarm (R9).
   The first tests drive a stand-in shaped as case-carriage states its services (`fixture.mjs`); the last drive the real
   `case-carriage` in its own test world (`test/m/case-carriage/fixture.mjs`), `doc-clean` running for real. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as scheduler from "../../../src/scheduler/index.mjs";
import { world, storage, writes, NOW, COPY_CONSUMER } from "./fixture.mjs";
import { world as ccWorld, sha, NOW as CC_NOW } from "../case-carriage/fixture.mjs";
import { pdf } from "../doc-clean/fixtures.mjs";
import { DOCUMENT_COPY_RETRY_MS } from "../../../src/case-carriage/index.mjs";

const { SCHEDULER_ORDER, SCHEDULER_KEYS, RANKED, DAILY, ALWAYS_DUE, SCHED_GRACE_MS, Scheduler, schedulerOf } = scheduler;
const DC = "document-copy";
const called = (calls, m) => calls.filter(([x]) => x === m).map(([, a]) => a);
const settle = () => new Promise((r) => setTimeout(r, 0));
const iso = (ms) => new Date(ms).toISOString();
const ANSWER = { ok: true, copied: 2, clean: 1, public: 0, refused: 1, failed: 0, remaining: 3 };

/* ---- the registry (R5, R2) ---- */

test("R25, R5, R2: document-copy stands after file-reputation and before R26's question-explore (T41), answering under doccopy; given its now alone, never daily nor always due; without case-carriage it is absent", () => {
  assert.equal(COPY_CONSUMER, DC, "the fixture's name is the module's");
  assert.equal(SCHEDULER_ORDER.indexOf("question-explore"), SCHEDULER_ORDER.indexOf(DC) + 1);
  assert.equal(SCHEDULER_ORDER.indexOf(DC), SCHEDULER_ORDER.indexOf("file-reputation") + 1);
  assert.equal(SCHEDULER_KEYS[DC], "doccopy");
  assert.deepEqual([RANKED.includes(DC), DAILY.includes(DC), ALWAYS_DUE.includes(DC)], [false, false, false]);
  const names = world({}, null, { daily: true, files: true, copies: true }).s.consumers();
  assert.deepEqual(names.slice(-2), ["file-reputation", DC]);
  assert.deepEqual(world({}, null, { copies: true }).s.consumers().at(-1), DC, "no file-safety or question-explorer owner: last of those present");
  assert.equal(world().s.consumers().includes(DC), false, "no case-carriage owner: absent");
  assert.deepEqual(new Scheduler({ storage: storage(), owners: { caseCarriage: () => world({}, null, { copies: true }).o.caseCarriage } }).consumers(), [DC]);
});

/* ---- the tick ---- */

test("R25, R1, R2: due, it calls exactly copyBatch({}) once, awaited, its answer under doccopy as given; nothing names a member or a file; not due, it is absent and copyBatch is not called", async () => {
  const { s, calls } = world({ [DC]: { wake: NOW, tick: () => new Promise((ok) => setTimeout(() => ok(ANSWER), 5)) } });
  const r = await s.onAlarm(NOW + 100);
  assert.deepEqual(r.doccopy, ANSWER, "awaited inside the alarm");
  assert.deepEqual(called(calls, "caseCarriage.copyBatch"), [{}], "copyBatch({}), once");
  assert.doesNotMatch(JSON.stringify(called(calls, "caseCarriage.copyBatch")), /member|file|capture|viewer|name|by/i);
  const quiet = world({ [DC]: { wake: null } });
  const q = await quiet.s.onAlarm(NOW);
  assert.equal("doccopy" in q, false, "nothing queued: absent");
  assert.deepEqual(called(quiet.calls, "caseCarriage.copyBatch"), []);
});

/* ---- due and wake: copyWake(now), asked afresh ---- */

test("R25, R1, R15: its due and wake are both copyWake(now): due within the grace of that instant, the alarm at it when it is the earliest, none when it is null; an answer that is not an instant in ms is none", async () => {
  const W = NOW + 300_000;
  const { s, st, calls } = world({ [DC]: { wake: W } });
  assert.equal(await s.arm(NOW), W, "armed at copyWake's instant");
  assert.equal(st.alarm, W);
  assert.equal("doccopy" in (await s.onAlarm(W - SCHED_GRACE_MS - 1)), false, "not due before it, beyond the grace");
  assert.ok("doccopy" in (await s.onAlarm(W - SCHED_GRACE_MS)), "due within the grace");
  assert.ok(called(calls, "caseCarriage.copyWake").every((a) => typeof a === "number"), "asked with now in ms");
  const none = world({ [DC]: { wake: null } });
  assert.equal(await none.s.arm(NOW), null);
  const r = await none.s.onAlarm(NOW);
  assert.deepEqual([r.nextAt, none.st.alarm], [null, null], "nothing queued: no alarm (R15)");
  for (const odd of [iso(NOW), "soon", true, NaN, {}]) {
    const o = world({ [DC]: { wake: odd } });
    assert.equal(await o.s.arm(NOW), null, String(odd));
    assert.equal("doccopy" in (await o.s.onAlarm(NOW)), false, String(odd));
  }
});

test("R25, R7, R11, R18: copyWake is asked afresh at every firing, arm and start, each with its now; a wake case-carriage moves is followed at once; nothing but the alarm is ever written or read for it", async () => {
  let at = NOW + 5000;
  const { s, st, calls } = world({ [DC]: { wake: () => at, tick: { ok: true, copied: 1, clean: 0, public: 0, refused: 0, failed: 0, remaining: 0 } } });
  assert.equal(await s.start(NOW), NOW + 5000, "the start re-derives it from case-carriage's tables (R11)");
  at = NOW + 2000;
  assert.equal(await s.arm(NOW + 1), NOW + 2000, "arm follows the earlier wake");
  assert.ok("doccopy" in (await s.onAlarm(NOW + 2000)));
  at = NOW + 2000 + DOCUMENT_COPY_RETRY_MS;   /* a failed read: retried at its time, case-carriage's own (R7) */
  const r = await s.onAlarm(NOW + 2001);
  assert.equal("doccopy" in r, false);
  assert.equal(r.nextAt, NOW + 2000 + DOCUMENT_COPY_RETRY_MS, "the reconcile sets it outright");
  for (const t of [NOW, NOW + 1, NOW + 2000, NOW + 2001]) assert.ok(called(calls, "caseCarriage.copyWake").includes(t), `asked at ${t}`);
  assert.deepEqual(st.log.filter(([m]) => m === "get" || m === "put"), [], "no value read or written for it");
  assert.deepEqual([...new Set(writes(st).map(([m]) => m))], ["setAlarm"]);
  const numbers = Object.entries(scheduler).filter(([, v]) => typeof v === "number").map(([k]) => k).sort();
  assert.deepEqual(numbers, ["DETECTORS_BUDGET_MS", "SCHED_GRACE_MS"], "no instant or interval of this module's for it (R7)");
});

test("R25, R3: a refusal case-carriage answers (DOCUMENT_COPY_NO_STORE) is the tick's answer; a copyWake or copyBatch that throws is answered {error} under doccopy, every other consumer still ticks and the reconcile runs", async () => {
  const refusal = { ok: false, code: "DOCUMENT_COPY_NO_STORE", check: "C-141.11", detail: "no evidence store" };
  const { s } = world({ [DC]: { wake: NOW, tick: refusal } });
  assert.deepEqual((await s.onAlarm(NOW)).doccopy, refusal);
  for (const what of ["wake", "tick"]) {
    let ran = false;   /* file-reputation due now, then wanting NOW + 700 */
    const w = world({ [DC]: { wake: NOW, throws: what },
                      "file-reputation": { wake: () => (ran ? NOW + 700 : NOW), tick: () => { ran = true; return { ok: true }; } } });
    const r = await w.s.onAlarm(NOW);
    assert.deepEqual(r.doccopy, { error: `document-copy ${what} broke` }, what);
    assert.deepEqual(r.filereputation, { ok: true }, `${what}: file-reputation still ticked`);
    assert.equal(r.nextAt, what === "wake" ? NOW + 700 : NOW, `${what}: the reconcile ran, a throwing wake wanting nothing`);
  }
});

/* ---- onCopyWork (case-carriage R17), R9's notice ---- */

test("R25, R9, R17: it registers once with case-carriage's onCopyWork, as scheduler; each call arms the alarm at once at copyWake's instant, never pushes it later, runs no batch and writes nothing but the alarm", async () => {
  const { s, st, calls, set, o } = world({ [DC]: { wake: null } });
  const out = s.listenTo({ caseCarriage: o.caseCarriage });
  assert.deepEqual(out.caseCarriage, { ok: true, module: "scheduler" });
  assert.deepEqual(called(calls, "caseCarriage.onCopyWork"), ["scheduler"]);
  assert.equal(o.caseCarriage.listeners.length, 1);
  assert.deepEqual(s.faults(), []);
  assert.equal(await s.start(NOW), null, "idle: no alarm");
  st.log.length = 0;
  const t0 = Date.now();
  set[DC].wake = (now) => now;   /* a member document queued, untried: copyWake answers now */
  const armed = await o.caseCarriage.listeners[0]({ at: t0 });
  assert.ok(armed >= t0 && armed <= Date.now(), `armed at once: ${armed}`);
  assert.equal(st.alarm, armed);
  assert.deepEqual(writes(st), [["setAlarm", armed]], "the alarm alone");
  set[DC].wake = armed + 60_000;
  await o.caseCarriage.listeners[0]({ at: armed + 60_000 });
  assert.equal(st.alarm, armed, "never pushed later (R4)");
  assert.deepEqual(called(calls, "caseCarriage.copyBatch"), [], "no batch ran on the notice");
  /* a storage that fails the arm is never thrown into case-carriage's act */
  const w2 = world({ [DC]: { wake: NOW } });
  const broken = new Scheduler({ storage: { ...storage(), getAlarm: async () => { throw new Error("storage gone"); } },
                                 owners: { caseCarriage: () => w2.o.caseCarriage } });
  broken.listenTo({ caseCarriage: w2.o.caseCarriage });
  assert.equal(await w2.o.caseCarriage.listeners[0]({ at: NOW }), null);
});

test("R25, R1: an onCopyWork call made inside a firing arms nothing of its own: the firing's reconcile stands", async () => {
  let queued = false;
  const { s, st, o } = world({ "file-scan": { wake: () => (queued ? null : NOW),
    tick: async () => { queued = true; return { ok: true, told: (await o.caseCarriage.listeners[0]({ at: NOW + 9 })) ?? null }; } },
    [DC]: { wake: () => (queued ? NOW + 9_000 : null) } });
  s.listenTo({ caseCarriage: o.caseCarriage });
  st.log.length = 0;
  const r = await s.onAlarm(NOW);
  assert.equal(r.filescan.told, null, "the notice inside the firing armed nothing");
  assert.deepEqual(writes(st), [["setAlarm", NOW + 9_000]], "one alarm write, the reconcile's");
  assert.equal(st.log.filter(([m]) => m === "getAlarm").length, 0, "no arm's reconcile beside the firing's");
});

test("R25, R23: a refused onCopyWork registration (LISTENER_DECLARED, LISTENER_MALFORMED) is a start-up fault in faults(), never ignored; the consumer still runs", async () => {
  for (const code of ["LISTENER_DECLARED", "LISTENER_MALFORMED"]) {
    const refusal = { ok: false, code, detail: "refused" };
    const { s, o } = world({ [DC]: { wake: NOW }, "copy-work": { tick: refusal } });
    assert.deepEqual(s.listenTo({ caseCarriage: o.caseCarriage }).caseCarriage, refusal, "the owner's answer, as given");
    assert.deepEqual(s.faults(), [{ notice: "caseCarriage", reason: code, detail: "refused" }], code);
    assert.ok("doccopy" in (await s.onAlarm(NOW)), `${code}: the consumer stands`);
  }
});

test("R25: schedulerOf builds the consumer over the host's one case-carriage and registers its notice at start, once", () => {
  const w = world({}, null, { copies: true });
  const ctx = { storage: storage() };
  const s = schedulerOf(ctx, null, { owners: { caseCarriage: () => w.o.caseCarriage } });
  assert.deepEqual(s.consumers(), [DC]);
  assert.equal(schedulerOf(ctx, null), s, "the one scheduler of the object");
});

/* ---- against the real case-carriage (its own test world) ---- */

/* A document a member supplied (as case-carriage's own documents test supplies one): its bytes only in the evidence
   store, registered on its own bundle as a PDF, arriving by a knock (`doorbell`), so case-carriage R15 queues it. */
function supplied(w, id, bytes) {
  const b = Buffer.from(bytes), s = sha(b);
  w.doc(id, { text: `the page about ${id}` });
  const path = "snapshots/file.pdf";
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, ?, 'binary', ?, ?)`,
                s, id, path, b.length, CC_NOW);
  w.st.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, ?, NULL, ?, ?, ?)`, id, path, s, b.length, s);
  w.st.sql.exec(`UPDATE files SET content=? WHERE bundle_id=? AND path='data/provenance.json'`,
    JSON.stringify({ documents: [{ file: path, capture: { method: "acquire", sha256: s, encoding: "binary", bytes: b.length, content_type: "application/pdf" } }] }), id);
  w.evidence.held.set(s, b);
  w.receipt(s, "doorbell");
  return s;
}

function realScheduler() {
  const w = ccWorld();
  const st = storage();
  const s = new Scheduler({ storage: st, owners: { caseCarriage: () => w.cc } });
  assert.deepEqual(s.listenTo({ caseCarriage: w.cc }).caseCarriage, { ok: true, module: "scheduler" });
  assert.deepEqual(s.faults(), [], "the real onCopyWork took the listener");
  return { w, st, s };
}

test("R25, R9: against the real case-carriage, a member document queued on an idle instance arms the alarm at once through onCopyWork; the firing copies it through copyBatch; then nothing is queued, so no alarm is held", async () => {
  const { w, st, s } = realScheduler();
  const T = Date.parse(CC_NOW);
  assert.equal(await s.start(T), null, "nothing queued: no wake");
  const t0 = Date.now();
  const knock = supplied(w, "INFO-2026-0101-sched", pdf());
  await settle();
  assert.ok(st.alarm !== null && st.alarm >= t0 && st.alarm <= Date.now(), `armed at once, on the runtime's clock: ${st.alarm}`);
  const r = await s.onAlarm(T);
  assert.deepEqual(r.doccopy, { ok: true, copied: 1, clean: 0, public: 0, refused: 0, failed: 0, remaining: 0 }, JSON.stringify(r.doccopy));
  assert.equal(w.cc.documentCopy(knock).state, "copy", "the copy derived");
  assert.deepEqual([w.cc.copyWake(T), r.nextAt, st.alarm], [null, null, null], "nothing queued: the alarm self-terminates (R15)");
  assert.equal("doccopy" in (await s.onAlarm(T + 1000)), false, "not due again");
});

test("R25, R7, R11: against the real case-carriage, a failed read of the evidence store leaves the document queued and the alarm at its retry instant, case-carriage's own, never at once; a restarted scheduler re-derives that instant from case-carriage's tables, and the retry copies it", async () => {
  const { w, st, s } = realScheduler();
  const T = Date.parse(CC_NOW);
  const knock = supplied(w, "INFO-2026-0102-sched", pdf());
  w.evidence.held.delete(knock);
  const r = await s.onAlarm(T);
  assert.equal(r.doccopy.failed, 1, JSON.stringify(r.doccopy));
  assert.equal(r.nextAt, T + DOCUMENT_COPY_RETRY_MS, "its last try plus the retry: no spin");
  assert.equal("doccopy" in (await s.onAlarm(T + 1000)), false, "not before its time");
  st.alarm = null;
  const fresh = new Scheduler({ storage: st, owners: { caseCarriage: () => w.cc } });
  assert.equal(await fresh.start(T + 2000), T + DOCUMENT_COPY_RETRY_MS, "the lost alarm re-derived at start");
  w.evidence.held.set(knock, Buffer.from(pdf()));
  w.clock.now = iso(T + DOCUMENT_COPY_RETRY_MS);
  const again = await fresh.onAlarm(T + DOCUMENT_COPY_RETRY_MS);
  assert.equal(again.doccopy.copied, 1, JSON.stringify(again.doccopy));
  assert.equal(again.nextAt, null);
});

/* Re-stated at T41-49 (K2534, K2380): with no evidence store bound case-carriage's `copyWake` answers null (nothing can
   be copied), so the consumer is not due, wants no wake and never ticks; the refusal DOCUMENT_COPY_NO_STORE is
   case-carriage's answer to a batch, which this module passes as given (the stand-in test of R25, R3 above). */
test("R25, R15: against the real case-carriage with no evidence store bound, copyWake answers null, so document-copy is not due, wants no wake and nothing is derived; bound again, the same firing copies it", async () => {
  const { w, st, s } = realScheduler();
  const T = Date.parse(CC_NOW);
  const knock = supplied(w, "INFO-2026-0103-sched", pdf());
  const bound = w.record.evidenceStore;
  w.record.evidenceStore = () => null;
  assert.equal(w.cc.copyWake(T), null);
  const r = await s.onAlarm(T);
  assert.equal("doccopy" in r, false, "not due: no tick");
  assert.deepEqual([r.nextAt, st.alarm], [null, null], "no wake held for it (R15)");
  assert.equal(w.cc.documentCopy(knock).state, "pending", "nothing derived");
  /* Negative control: the store bound again, the document is due and the firing copies it. */
  w.record.evidenceStore = bound;
  const again = await s.onAlarm(T);
  assert.equal(again.doccopy.copied, 1, JSON.stringify(again.doccopy));
  assert.equal(w.cc.documentCopy(knock).state, "copy");
});
