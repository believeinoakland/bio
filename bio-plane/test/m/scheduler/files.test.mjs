/* scheduler — T36 (T36-29; N707, rev. 2 §4; K1913, K1929, K2129): the four consumers of `file-safety` (R24), after
   `dated-waits`, each calling its owner's service, its answer under its R2 key: `file-scan` (file-safety R4) at its first
   firing, then a day from its last tick, and at the next firing while `remaining`; `file-render` (its R12) and
   `file-deeper` (its R36) at every firing, with a wake five minutes after a tick that left work; `file-forward` (its R35)
   once each whole UTC hour over the period since its last call answered `ok`. The first tests drive a stand-in shaped
   as file-safety states its services; the last drive the real `file-safety` in its own test world. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCHEDULER_ORDER, SCHEDULER_KEYS, RANKED, DAILY, ALWAYS_DUE, FILE_SAFETY_CONSUMERS, FILE_SCAN_EVERY_MS,
         FILE_SAFETY_POLL_MS, Scheduler, schedulerOf } from "../../../src/scheduler/index.mjs";
import { world, storage, writes, NOW, FILE_CONSUMERS } from "./fixture.mjs";
import { world as fsWorld, pdf } from "../file-safety/fixture.mjs";

const FOUR = ["file-scan", "file-render", "file-deeper", "file-forward"];
const KEYS = ["filescan", "filerender", "filedeeper", "fileforward"];
const H = 3_600_000, DAY = 86_400_000, POLL = 300_000;
const iso = (ms) => new Date(ms).toISOString();
/* NOW is 2026-09-28T12:00:00Z, a whole hour */
const HOUR = Math.floor(NOW / H) * H;
const called = (calls, m) => calls.filter(([x]) => x === m).map(([, a]) => a);
const idle = { "file-scan": { tick: { ok: true, scanned: 0, found: 0, not_scanned: 0, remaining: 0 } } };

/* ---- the registry ---- */

test("R24, R5, R2: the four stand after dated-waits, in R24's order, each answering under its own key; without file-safety they are absent", () => {
  assert.deepEqual([...FILE_SAFETY_CONSUMERS], FOUR);
  assert.deepEqual([...FILE_CONSUMERS], FOUR, "the fixture's list is the module's");
  assert.deepEqual(SCHEDULER_ORDER.slice(SCHEDULER_ORDER.indexOf("dated-waits")), ["dated-waits", ...FOUR]);
  assert.deepEqual(FOUR.map((n) => SCHEDULER_KEYS[n]), KEYS);
  for (const n of FOUR) {
    assert.equal(RANKED.includes(n), false, `${n}: given its now alone`);
    assert.equal(DAILY.includes(n), false, `${n}: no local day of R21's`);
    assert.equal(ALWAYS_DUE.includes(n), false, `${n}: R6's five are unchanged`);
  }
  const { s } = world({}, null, { daily: true, files: true });
  const names = s.consumers();
  assert.deepEqual(names.slice(names.indexOf("dated-waits")), ["dated-waits", ...FOUR]);
  assert.deepEqual(world().s.consumers().filter((n) => FOUR.includes(n)), [], "no file-safety owner: none of the four");
  assert.deepEqual(new Scheduler({ storage: storage(), owners: {} }).consumers(), []);
});

test("R24, R8: the plane hands the file-safety owner after construction (hand, or schedulerOf's deps.fileSafety); the four then join, an owner already held is kept", async () => {
  const w = world({}, null, { files: true });
  const s = new Scheduler({ storage: storage(), owners: {} });
  assert.deepEqual(s.consumers(), []);
  assert.deepEqual(s.hand({ fileSafety: w.o.fileSafety }), { ok: true, handed: ["fileSafety"] }, "an instance");
  assert.deepEqual(s.consumers(), FOUR);
  assert.deepEqual(s.hand({ fileSafety: () => null }), { ok: true, handed: [] }, "already held: kept");
  assert.deepEqual(s.hand(null), { ok: true, handed: [] });
  const r = await s.onAlarm(NOW);
  for (const k of KEYS) assert.equal(typeof r[k], "object", `${k}: the handed owner ticked`);
  /* schedulerOf: a test's owners, then the plane's hand on the instance already made */
  const ctx = { storage: storage() };
  const made = schedulerOf(ctx, null, { owners: {} });
  assert.deepEqual(made.consumers(), []);
  assert.equal(schedulerOf(ctx, null, { fileSafety: () => w.o.fileSafety }), made, "the one scheduler of the object");
  assert.deepEqual(made.consumers(), FOUR);
});

test("R24, R2: each consumer calls exactly its owner's service, with nothing naming a viewer, a member or a file; its answer is the owner's, under its key", async () => {
  const answers = { "file-scan": { ok: true, scanned: 2, found: 0, not_scanned: 0, remaining: 0 },
    "file-render": { ok: true, rendered: 1, failed: 0, none: 0, data: 0, copies: { made: 0, failed: 0 }, remaining: 0 },
    "file-deeper": { ok: true, started: 0, polled: 0, done: [], running: 0, queued: 0 },
    "file-forward": { ok: true, sent: [], failed: [] } };
  const { s, calls } = world(Object.fromEntries(FOUR.map((n) => [n, { tick: answers[n] }])));
  const r = await s.onAlarm(NOW);
  FOUR.forEach((n, i) => assert.deepEqual(r[KEYS[i]], answers[n], n));
  assert.deepEqual(called(calls, "fileSafety.scanBatch"), [{ at: iso(NOW) }], "scanBatch({at: now})");
  assert.deepEqual(called(calls, "fileSafety.renderBatch"), [{}], "renderBatch({})");
  assert.deepEqual(called(calls, "fileSafety.deeperBatch"), [{}], "deeperBatch({})");
  assert.deepEqual(called(calls, "fileSafety.forwardSecurityCounts"), [{ from: iso(HOUR - H), to: iso(HOUR) }],
    "forwardSecurityCounts({from, to}): at its first, the hour before");
  assert.equal(calls.filter(([m]) => m.startsWith("fileSafety.")).length, 4, "no other service of file-safety is called");
  assert.doesNotMatch(JSON.stringify(calls.filter(([m]) => m.startsWith("fileSafety.")).map(([, a]) => a)), /viewer|member|capture|file|name|by/i,
    "the arguments carry no viewer, member or file");
});

/* ---- file-scan ---- */

test("R24: file-scan is due at its first firing, then once a day from its last tick, and wants its wake at that day", async () => {
  const { s, st, calls } = world({ ...idle, "file-render": {}, "file-deeper": {}, "file-forward": {} });
  assert.equal(await s.arm(NOW), NOW, "none kept: due at once");
  const r = await s.onAlarm(NOW);
  assert.ok("filescan" in r);
  assert.equal(r.nextAt, NOW + FILE_SCAN_EVERY_MS, "the next day, a day from its last tick");
  assert.equal(FILE_SCAN_EVERY_MS, 86_400_000, "file-safety R4's daily, carried by K2129");
  for (const t of [NOW + 1, NOW + H, NOW + DAY - 251]) assert.equal("filescan" in (await s.onAlarm(t)), false, `not again at +${t - NOW}`);
  assert.equal(st.alarm, NOW + DAY);
  const next = await s.onAlarm(NOW + DAY - 250);
  assert.ok("filescan" in next, "due within the grace of its day (R1)");
  assert.deepEqual(called(calls, "fileSafety.scanBatch").map((a) => a.at), [iso(NOW), iso(NOW + DAY - 250)]);
  assert.equal(next.nextAt, NOW + DAY - 250 + DAY, "a day from that tick");
});

test("R24: while file-scan's last answer stated remaining above 0 it is due again at the next firing, and stops when none remain", async () => {
  const answers = [{ ok: true, scanned: 50, found: 0, not_scanned: 0, remaining: 7 }, { ok: true, scanned: 7, found: 0, not_scanned: 0, remaining: 0 }];
  const { s, calls } = world({ "file-scan": { tick: () => answers.shift() } });
  const r1 = await s.onAlarm(NOW);
  assert.equal(r1.filescan.remaining, 7);
  assert.equal(r1.nextAt, NOW + DAY, "its own wake stays the day: the next firing is any consumer's");
  const r2 = await s.onAlarm(NOW + 60_000);
  assert.equal(r2.filescan.remaining, 0, "the next firing scanned the rest");
  assert.equal("filescan" in (await s.onAlarm(NOW + 120_000)), false, "none remaining: not due again before its day");
  assert.equal(called(calls, "fileSafety.scanBatch").length, 2);
  assert.equal((await s.arm(NOW + 120_000)), NOW + 60_000 + DAY, "a day from its last tick");
});

test("R24, R3: a refusal (SCANNER_ABSENT) is file-scan's answer and keeps its daily cadence; a tick that throws is answered {error} and counts as run, so the alarm never spins", async () => {
  const refusal = { ok: false, code: "SCANNER_ABSENT", reason: "SCANNER_ABSENT", detail: "No scanner is bound beside this copy. No note was written." };
  const { s, st, set } = world({ "file-scan": { tick: refusal } });
  const r = await s.onAlarm(NOW);
  assert.deepEqual(r.filescan, refusal, "the tick's answer");
  assert.deepEqual([r.nextAt, st.alarm], [NOW + DAY, NOW + DAY], "kept its cadence");
  set["file-scan"].throws = "tick";
  const broke = await s.onAlarm(NOW + DAY);
  assert.deepEqual(broke.filescan, { error: "file-scan tick broke" });
  assert.deepEqual([broke.nextAt, st.alarm], [NOW + 2 * DAY, NOW + 2 * DAY], "tried again the next day, not at once");
});

/* ---- file-render, file-deeper ---- */

test("R24: file-render and file-deeper are due at every firing, each calling its owner's batch", async () => {
  const { s, calls } = world({ "file-render": {}, "file-deeper": {} });
  for (const t of [NOW, NOW + 1, NOW + 777, NOW + 2 * DAY]) {
    const r = await s.onAlarm(t);
    assert.ok("filerender" in r && "filedeeper" in r, `${t - NOW}`);
  }
  assert.equal(called(calls, "fileSafety.renderBatch").length, 4);
  assert.equal(called(calls, "fileSafety.deeperBatch").length, 4);
});

test("R24: file-render wants a wake five minutes after a tick whose answer left work (remaining above 0, or a safe copy made or failed, which may leave more queued), else none of its own", async () => {
  assert.equal(FILE_SAFETY_POLL_MS, 300_000, "file-safety R36's every few minutes, carried by K2129");
  const none = { ok: true, rendered: 0, failed: 0, none: 0, data: 0, copies: { made: 0, failed: 0 }, remaining: 0 };
  for (const [what, left, wants] of [["remaining above 0", { ...none, rendered: 20, remaining: 3 }, true],
                                     ["a safe copy made", { ...none, copies: { made: 2, failed: 0 } }, true],
                                     ["a safe copy failed", { ...none, copies: { made: 0, failed: 1 } }, true],
                                     ["a safe copy stated queued", { ...none, copies: { made: 0, failed: 0, queued: 4 } }, true],
                                     ["nothing left", none, false]]) {
    const { s, st } = world({ ...idle, "file-render": { tick: left } });
    const r = await s.onAlarm(NOW);
    assert.equal(r.nextAt, wants ? NOW + POLL : NOW + DAY, what);
    assert.equal(st.alarm, r.nextAt, what);
  }
  /* the poll fires, finds nothing left, and the wake goes */
  const answers = [{ ...none, rendered: 20, remaining: 3 }, { ...none, rendered: 3 }];
  const { s } = world({ ...idle, "file-render": { tick: () => answers.shift() } });
  assert.equal((await s.onAlarm(NOW)).nextAt, NOW + POLL);
  assert.equal((await s.onAlarm(NOW + POLL)).nextAt, NOW + DAY, "the queue empty: only file-scan's day remains");
});

test("R24: file-deeper wants a wake five minutes after a tick while checks are queued or running (or either count is unknown), else none of its own", async () => {
  const base = { ok: true, started: 0, polled: 0, done: [] };
  for (const [what, ans, wants] of [["queued", { ...base, queued: 1, running: 0 }, true], ["running", { ...base, queued: 0, running: 2 }, true],
                                    ["queued unknown", { ...base, queued: null, running: 0 }, true],
                                    ["running unknown", { ...base, queued: 0, running: null }, true],
                                    ["none", { ...base, queued: 0, running: 0 }, false]]) {
    const { s } = world({ ...idle, "file-deeper": { tick: ans } });
    assert.equal((await s.onAlarm(NOW)).nextAt, wants ? NOW + POLL : NOW + DAY, what);
  }
  /* polling every five minutes while a sandbox runs, stopping when none does */
  const answers = [{ ...base, queued: 1, running: 0 }, { ...base, started: 1, queued: 0, running: 1 }, { ...base, polled: 1, done: [{}], queued: 0, running: 0 }];
  const { s, calls } = world({ ...idle, "file-deeper": { tick: () => answers.shift() } });
  let at = NOW;
  const chain = [];
  for (let i = 0; i < 5 && at !== NOW + DAY; i++) { chain.push(at); at = (await s.onAlarm(at)).nextAt; }
  assert.deepEqual(chain, [NOW, NOW + POLL, NOW + 2 * POLL]);
  assert.equal(at, NOW + DAY, "done: no wake of its own");
  assert.equal(called(calls, "fileSafety.deeperBatch").length, 3);
});

test("R24, R3: a refusal (RENDERER_ABSENT) is file-render's answer and keeps its cadence (the poll its last answer asked for); a throw is answered {error} and the poll it kept stands, never at once", async () => {
  const refusal = { ok: false, code: "RENDERER_ABSENT", reason: "RENDERER_ABSENT", detail: "No safe-view maker is bound beside this copy. Nothing was rendered." };
  const left = { ok: true, rendered: 20, failed: 0, none: 0, data: 0, copies: { made: 0, failed: 0 }, remaining: 5 };
  const answers = [left, refusal];
  const { s, set } = world({ ...idle, "file-render": { tick: () => answers.shift() } });
  assert.equal((await s.onAlarm(NOW)).nextAt, NOW + POLL);
  const r = await s.onAlarm(NOW + POLL);
  assert.deepEqual(r.filerender, refusal);
  assert.equal(r.nextAt, NOW + 2 * POLL, "work was left before the refusal: still polled");
  set["file-render"].throws = "tick";
  const broke = await s.onAlarm(NOW + 2 * POLL);
  assert.deepEqual(broke.filerender, { error: "file-render tick broke" });
  assert.equal(broke.nextAt, NOW + 3 * POLL, "a poll after the throw, not at once");
  /* a refusal with no work known left: no wake of its own */
  const quiet = world({ ...idle, "file-render": { tick: refusal } });
  assert.equal((await quiet.s.onAlarm(NOW)).nextAt, NOW + DAY);
});

/* ---- file-forward ---- */

test("R24: file-forward sends each whole UTC hour once, from the to of its last ok call to the start of the hour; no period twice", async () => {
  const { s, calls } = world({ ...idle, "file-forward": { tick: { ok: true, sent: ["log-1"], failed: [] } } });
  const r1 = await s.onAlarm(NOW + 10 * 60_000);
  assert.deepEqual(r1.fileforward, { ok: true, sent: ["log-1"], failed: [] });
  assert.equal(r1.nextAt, HOUR + H, "a log tool named: its wake the next whole hour");
  assert.equal("fileforward" in (await s.onAlarm(HOUR + 50 * 60_000)), false, "the same hour: not again");
  assert.equal("fileforward" in (await s.onAlarm(HOUR + H - 250)), false, "never before the hour, the grace notwithstanding");
  const r2 = await s.onAlarm(HOUR + H);
  assert.ok("fileforward" in r2, "the first firing at the hour");
  await s.onAlarm(HOUR + 3 * H + 17);   /* two hours without a firing */
  assert.deepEqual(called(calls, "fileSafety.forwardSecurityCounts"), [
    { from: iso(HOUR - H), to: iso(HOUR) }, { from: iso(HOUR), to: iso(HOUR + H) }, { from: iso(HOUR + H), to: iso(HOUR + 3 * H) }],
    "each period follows the last, none sent twice, none skipped");
});

test("R24: after a refused call (FORWARD_PERIOD_INVALID) the next hour sends from the to of the last ok call, so nothing is lost and nothing sent twice; never more than 24 hours back", async () => {
  const refusal = { ok: false, code: "FORWARD_PERIOD_INVALID", reason: "FORWARD_PERIOD_INVALID", detail: "The counts could not be built. Nothing was sent." };
  const answers = [{ ok: true, sent: ["log-1"], failed: [] }, refusal, { ok: true, sent: ["log-1"], failed: [] }];
  const { s, calls, set } = world({ ...idle, "file-forward": { tick: () => answers.shift() ?? { ok: true, sent: ["log-1"], failed: [] } } });
  await s.onAlarm(NOW);
  const r = await s.onAlarm(HOUR + H);
  assert.deepEqual(r.fileforward, refusal, "the refusal is the tick's answer");
  assert.equal(r.nextAt, HOUR + 2 * H, "and it keeps its hourly cadence");
  await s.onAlarm(HOUR + 2 * H);
  const sent = called(calls, "fileSafety.forwardSecurityCounts");
  assert.deepEqual(sent[1], { from: iso(HOUR), to: iso(HOUR + H) });
  assert.deepEqual(sent[2], { from: iso(HOUR), to: iso(HOUR + 2 * H) }, "the refused hour sent with the next");
  /* two days without a firing: the period starts no more than a day back */
  await s.onAlarm(HOUR + 50 * H);
  assert.deepEqual(called(calls, "fileSafety.forwardSecurityCounts")[3], { from: iso(HOUR + 26 * H), to: iso(HOUR + 50 * H) });
  set["file-forward"].throws = "tick";
  const broke = await s.onAlarm(HOUR + 51 * H);
  assert.deepEqual(broke.fileforward, { error: "file-forward tick broke" });
  assert.equal(broke.nextAt, HOUR + 52 * H, "the hour counted as tried: the next hour, never at once");
  assert.equal("fileforward" in (await s.onAlarm(HOUR + 51 * H + 1000)), false);
});

test("R24, R15: file-forward wants a wake only while its last answer named a log tool (sent or failed); with none on it has no wake of its own and is due at the first firing after the next hour", async () => {
  for (const [what, ans, wants] of [["sent", { ok: true, sent: ["log-1"], failed: [] }, true],
                                    ["failed", { ok: true, sent: [], failed: [{ tool_id: "log-1", code: "SERVICE_UNREACHABLE" }] }, true],
                                    ["no log tool on", { ok: true, sent: [], failed: [] }, false]]) {
    const { s } = world({ ...idle, "file-forward": { tick: ans } });
    assert.equal((await s.onAlarm(NOW)).nextAt, wants ? HOUR + H : NOW + DAY, what);
  }
  const { s, calls } = world({ ...idle, "file-forward": { tick: { ok: true, sent: [], failed: [] } } });
  await s.onAlarm(NOW);
  await s.onAlarm(NOW + DAY);   /* file-scan's day: the first firing after the next hour */
  assert.deepEqual(called(calls, "fileSafety.forwardSecurityCounts")[1], { from: iso(HOUR), to: iso(HOUR + DAY) });
});

/* ---- the invariants over the four ---- */

test("R24, R15: when every consumer answers no work and no log tool is on, only file-scan's daily wake stays", async () => {
  const { s, st } = world({}, null, { files: true });
  const r = await s.onAlarm(NOW);
  for (const k of KEYS) assert.ok(k in r, `${k}: its first firing`);
  assert.deepEqual([r.nextAt, st.alarm], [NOW + DAY, NOW + DAY]);
  assert.equal(await s.arm(NOW + 1000), NOW + DAY);
});

test("R24, R11, R18: the instants each keeps are the storage value sched_files, never a table; a restarted instance re-derives its wakes from them, and with none kept each is due at once", async () => {
  const st = storage();
  const set = { "file-scan": { tick: { ok: true, remaining: 0 } }, "file-render": { tick: { ok: true, remaining: 2, copies: { made: 0, failed: 0 } } },
                "file-deeper": {}, "file-forward": { tick: { ok: true, sent: ["log-1"], failed: [] } } };
  const a = world(set, null, { st });
  assert.equal(await a.s.start(NOW), NOW, "none kept: due at once");
  await a.s.onAlarm(NOW);
  assert.deepEqual(st.kv.get("sched_files"), {
    "file-scan": { last: NOW, more: false }, "file-render": { last: NOW, more: true }, "file-deeper": { last: NOW, more: false },
    "file-forward": { hour: HOUR, to: HOUR, log: true } });
  const touched = new Set(st.log.filter(([m]) => m === "put" || m === "get").map(([m, k]) => `${m}:${k}`));
  assert.deepEqual([...touched].sort(), ["get:sched_files", "put:sched_files"]);
  /* a fresh instance over the same storage: the wakes re-derived; nothing run again before its time */
  st.alarm = null;
  const b = world(set, null, { st });
  assert.equal(await b.s.start(NOW + 1000), NOW + POLL, "the render poll its last answer asked for");
  const r = await b.s.onAlarm(NOW + 1000);
  assert.equal("filescan" in r, false, "scanned today: not again");
  assert.equal("fileforward" in r, false, "this hour sent: not again");
  assert.equal(b.calls.filter(([m]) => m === "fileSafety.scanBatch" || m === "fileSafety.forwardSecurityCounts").length, 0);
  /* a storage holding the alarm alone keeps the state for the instance */
  const bare = storage(); delete bare.get; delete bare.put;
  const c = world(set, null, { st: bare });
  assert.ok("filescan" in (await c.s.onAlarm(NOW)));
  assert.equal("filescan" in (await c.s.onAlarm(NOW + 1000)), false);
  /* without file-safety, nothing is read or written for the four */
  const d = world({}, null);
  await d.s.onAlarm(NOW); await d.s.arm(NOW); await d.s.start(NOW);
  assert.deepEqual(d.st.log.filter(([m]) => m === "get" || m === "put"), []);
});

test("R24, R17, R4: arm and start run none of the four and write nothing but the alarm", async () => {
  const { s, st, calls } = world({}, null, { files: true });
  await s.arm(NOW);
  await s.start(NOW);
  assert.deepEqual(calls.filter(([m]) => m.startsWith("fileSafety.")), []);
  assert.deepEqual(writes(st), [["setAlarm", NOW]]);
});

test("R24 (K1892, K1929): nothing the four keep or answer names who opened a file", async () => {
  const { s, st } = world({}, null, { files: true });
  const r = await s.onAlarm(NOW);
  for (const x of [JSON.stringify(st.kv.get("sched_files")), JSON.stringify(KEYS.map((k) => r[k]))])
    assert.doesNotMatch(x, /member|viewer|opened|by"|capture_sha|captureSha/i, x);
});

/* ---- against the real file-safety (its own test world, `test/m/file-safety/fixture.mjs`) ---- */

test("R24: against the real file-safety, the first firing scans the held files, renders their safe views, starts no deeper check and forwards the hour's counts to no log tool; the next day re-scans none (a week's ClamAV note is fresh), and the alarm holds file-scan's day alone", async () => {
  const w = fsWorld();
  for (let i = 1; i <= 3; i++) { await w.capture(pdf(false, `sched-${i}`)); w.tick(1000); }
  const st = storage();
  const s = new Scheduler({ storage: st, owners: { fileSafety: () => w.fs } });
  const T = w.clock.now;
  assert.equal(await s.arm(T), T, "none kept: wanted at once");
  const r = await s.onAlarm(T);
  assert.deepEqual([r.filescan.ok, r.filescan.scanned, r.filescan.remaining], [true, 3, 0], JSON.stringify(r.filescan));
  assert.equal(w.calls("/scan").length, 1, "one batch to the scanner");
  assert.equal(r.filerender.ok, true, JSON.stringify(r.filerender));
  assert.equal(r.filerender.remaining, 0);
  assert.deepEqual([r.filedeeper.queued, r.filedeeper.running], [0, 0]);
  assert.deepEqual([r.fileforward.ok, r.fileforward.sent, r.fileforward.failed], [true, [], []], JSON.stringify(r.fileforward));
  const hour = Math.floor(T / H) * H;
  assert.deepEqual(r.fileforward.record.period, { from: iso(hour - H), to: iso(hour) });
  assert.equal(r.nextAt, T + DAY, "no work left, no log tool on: file-scan's day alone (R15)");
  w.clock.now = T + DAY;
  const next = await s.onAlarm(T + DAY);
  assert.deepEqual([next.filescan.scanned, next.filescan.remaining], [0, 0], "scanned yesterday: not due for a week (file-safety R4)");
  assert.deepEqual(next.fileforward.record.period, { from: iso(hour), to: iso(Math.floor((T + DAY) / H) * H) });
});

test("R24: against the real file-safety with no scanner bound, file-scan answers SCANNER_ABSENT and file-render RENDERER_ABSENT, each the tick's answer, and each keeps its cadence", async () => {
  const w = fsWorld({ bound: false });
  await w.capture(pdf(false, "sched-unbound"));
  const s = new Scheduler({ storage: storage(), owners: { fileSafety: () => w.fs } });
  const r = await s.onAlarm(w.clock.now);
  assert.equal(r.filescan.code, "SCANNER_ABSENT");
  assert.equal(r.filerender.code, "RENDERER_ABSENT");
  assert.equal(r.nextAt, w.clock.now + DAY, "the day's re-try, never at once");
});
