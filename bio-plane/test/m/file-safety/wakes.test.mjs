/* file-safety R39, R40 (N762; K2129, K2153): its own cadences, each batch's instant read from its own kept state, and the
   arming notice a later module registers for. At the module's interface, over the scripted scanner (fixture.mjs) and a
   clock the test moves; an instant is epoch milliseconds, as the scheduler's own `due(now)` reads it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, pdf, sha, T0, DAY } from "./fixture.mjs";
import { FileSafety, FILE_SAFETY_POLL_MS, REPUTATION_REFRESH_MS, RESCAN_INTERVAL_MS, FILE_WORK_BATCHES } from "../../../src/file-safety/index.mjs";

const HOUR = 3_600_000;
const POLL = FILE_SAFETY_POLL_MS;
/* A second instance on the same storage: a restart. */
const restarted = (w) => new FileSafety({ sql: w.st.sql, record: w.record, membership: w.membership, credentials: w.credentials,
  provenance: w.prov, acquisition: w.acq, env: w.env, now: () => w.clock.now });
const settle = () => new Promise((r) => setImmediate(r));

test("R39: scanWake answers null with no scanner bound or no file held; now while the last scanBatch answered remaining above 0; else the earliest instant a file falls due (R4), a newly queued file at once (never before now), a file the last batch could not resolve no sooner than a poll after it; kept across a restart; it writes nothing and never throws", async () => {
  const none = world({ bound: false });
  await none.capture(pdf(false, "n"));
  assert.equal(none.fs.scanWake(T0), null, "no scanner bound");
  let verdict = () => ({ result: "clean" });
  const w = world({ scan: { clamav: (s) => verdict(s) } });
  assert.equal(w.fs.scanWake(T0), null, "no file held");
  const a = await w.capture(pdf(false, "a"));
  assert.equal(w.fs.scanWake(w.clock.now), w.clock.now, "a newly queued file: at once");
  assert.equal(w.fs.scanWake(new Date(w.clock.now).toISOString()), w.clock.now, "now as an ISO instant too");
  w.tick(10 * 60_000);
  assert.equal(w.fs.scanWake(w.clock.now), w.clock.now, "due since it was queued: never before now");
  /* scanned clean: next due a week after its scan */
  await w.fs.scanBatch({});
  const scannedAt = w.clock.now;
  assert.equal(w.fs.scanWake(w.clock.now), scannedAt + RESCAN_INTERVAL_MS);
  /* a file queued after the last batch: at once */
  w.tick(HOUR);
  const b = await w.capture(pdf(false, "b"));
  assert.equal(w.fs.scanWake(w.clock.now), w.clock.now);
  /* a batch that leaves files (remaining above 0): now, whatever else is due */
  const c = await w.capture(pdf(false, "c"));
  const left = await w.fs.scanBatch({ limit: 1 });
  assert.equal(left.remaining, 1);
  w.tick(1000);
  assert.equal(w.fs.scanWake(w.clock.now), w.clock.now);
  await w.fs.scanBatch({});
  const lastRun = w.clock.now;
  assert.equal(w.fs.scanWake(w.clock.now), scannedAt + RESCAN_INTERVAL_MS, "the earliest due: a's re-scan");
  /* a file the scanner cannot read stays due (R4), retried a poll after the batch, not at every wake */
  verdict = (s) => (s === sha(pdf(false, "big")) ? { result: "not_scanned", reason: "TOO_LARGE" } : { result: "clean" });
  w.tick(1000);
  const big = await w.capture(pdf(false, "big"));
  await w.fs.scanBatch({});
  const run = w.clock.now;
  assert.equal(w.fs.scanWake(run), run + POLL);
  w.tick(POLL + 1);
  assert.equal(w.fs.scanWake(w.clock.now), w.clock.now, "past the poll: now");
  /* a batch the scanner refuses counts as run: its files are retried a poll later */
  verdict = () => "fail";
  await w.fs.scanBatch({});
  const refusedRun = w.clock.now;
  assert.equal(w.fs.scanWake(refusedRun), refusedRun + POLL);
  /* kept across a restart: a new instance reads the same instants */
  assert.equal(restarted(w).scanWake(refusedRun), refusedRun + POLL);
  /* writes nothing; never throws */
  const tables = JSON.stringify(w.tables());
  for (const t of [refusedRun, refusedRun + DAY]) w.fs.scanWake(t);
  assert.equal(JSON.stringify(w.tables()), tables);
  for (const bad of [undefined, null, "not an instant", NaN, {}]) assert.equal(w.fs.scanWake(bad), null, String(bad));
  w.exec("DROP TABLE fs_files");
  assert.equal(w.fs.scanWake(refusedRun), null);
  assert.ok(a && b && c && big && lastRun);
});

test("R39: renderWake answers null while no file's view and no safe copy is queued, else the later of now and the last renderBatch plus FILE_SAFETY_POLL_MS (now before any); deeperWake null while no check is queued or running, else the earliest of the last deeperBatch plus the poll for a queued check and each running sandbox's next poll, never before now, and the last deeperBatch plus the poll while its checks cannot be read; each kept across a restart, writes nothing and never throws", async () => {
  const w = world({ scan: { polls: 3 } });
  /* render */
  assert.equal(w.fs.renderWake(T0), null);
  const s1 = await w.capture(pdf(false, "r1")); w.tick(1000);
  await w.capture(pdf(false, "r2"));
  assert.equal(w.fs.renderWake(w.clock.now), w.clock.now, "queued, never rendered: now");
  await w.fs.renderBatch({ limit: 1 });
  const rendered = w.clock.now;
  assert.equal(w.fs.renderWake(rendered), rendered + POLL);
  assert.equal(w.fs.renderWake(rendered + 2 * POLL), rendered + 2 * POLL, "the later of now and the poll");
  assert.equal(restarted(w).renderWake(rendered), rendered + POLL, "kept across a restart");
  w.tick(POLL);
  await w.fs.renderBatch({});
  assert.equal(w.fs.renderWake(w.clock.now), null, "nothing queued");
  /* a safe copy queued alone keeps it */
  const ct = await w.tool("glasswall-halo", { config: { host: "halo.example.org" } });
  w.exec("UPDATE fs_tools SET use = 'routine' WHERE tool_id = ?", ct);
  w.exec("INSERT INTO fs_copies (capture_sha, state, queued_at) VALUES (?, 'queued', '2026-10-08T12:00:00Z')", s1);
  assert.equal(w.fs.renderWake(w.clock.now), w.clock.now + POLL);
  /* deeper */
  assert.equal(w.fs.deeperWake(w.clock.now), null);
  await w.tool("joe-sandbox");
  const d1 = await w.capture(pdf(true, "d1"));
  w.fs.requestDeeperCheck({ captureSha: d1, viewer: "member:m1" });
  assert.equal(w.fs.deeperWake(w.clock.now), w.clock.now, "queued, never run: now");
  await w.fs.deeperBatch({});
  const started = w.clock.now;
  assert.equal(w.fs.deeperWake(started), started + 60_000, "the running sandbox's next poll (poll_after_ms)");
  const d2 = await w.capture(pdf(true, "d2"));
  w.fs.requestDeeperCheck({ captureSha: d2, viewer: "member:m1" });
  assert.equal(w.fs.deeperWake(started), started + 60_000, "the earliest: the sandbox's poll before the batch's");
  w.exec("UPDATE fs_deeper SET pending = json_set(pending, '$[0].next_at', ?) WHERE state = 'running'", started + 2 * POLL);
  assert.equal(w.fs.deeperWake(started), started + POLL, "the earliest: a queued check's poll");
  assert.equal(w.fs.deeperWake(started + 3 * POLL), started + 3 * POLL, "never before now");
  assert.equal(restarted(w).deeperWake(started), started + POLL, "kept across a restart");
  /* unreadable: a poll after the last batch, so a passing fault does not strand the checks */
  w.tick(1000);
  w.exec("UPDATE fs_deeper SET pending = 'x' WHERE state = 'running'");
  const u = await w.fs.deeperBatch({});
  assert.equal(u.code, "DEEPER_CHECKS_UNREADABLE");
  assert.equal(w.fs.deeperWake(w.clock.now), w.clock.now + POLL);
  w.exec("DROP TABLE fs_deeper");
  assert.equal(w.fs.deeperWake(w.clock.now), w.clock.now + POLL, "never throws");
  /* writes nothing */
  const tables = JSON.stringify(w.exec("SELECT * FROM fs_wakes"));
  w.fs.renderWake(w.clock.now); w.fs.deeperWake(w.clock.now);
  assert.equal(JSON.stringify(w.exec("SELECT * FROM fs_wakes")), tables);
  for (const bad of [undefined, "x"]) { assert.equal(w.fs.renderWake(bad), null); assert.equal(w.fs.deeperWake(bad), null); }
});

test("R39 (T38): renderWake answers null with no renderer bound (the scanner binding, as renderBatch refuses RENDERER_ABSENT), as scanWake does with no scanner, while a view is queued; with a renderer bound and a view queued, an instant", async () => {
  const none = world({ bound: false });
  await none.capture(pdf(false, "unbound"));
  assert.ok(none.row("SELECT 1 AS x FROM fs_files WHERE render_state = 'queued'"), "a view is queued");
  assert.equal(none.fs.renderWake(T0), null, "no renderer bound: null");
  assert.equal(none.fs.scanWake(T0), null, "as the scan wake with no scanner");
  assert.equal((await none.fs.renderBatch({})).code, "RENDERER_ABSENT");
  assert.equal(none.fs.renderWake(T0 + POLL), null, "still null after the refused batch");
  none.exec("INSERT INTO fs_copies (capture_sha, state, queued_at) VALUES (?, 'queued', '2026-10-08T12:00:00Z')", sha(pdf(false, "unbound")));
  assert.equal(none.fs.renderWake(T0), null, "a safe copy queued too: null");
  const bound = world();
  await bound.capture(pdf(false, "bound"));
  assert.equal(bound.fs.renderWake(T0), T0, "a renderer bound, a view queued: an instant");
});

test("R39: forwardWake answers null while no log tool is on, else the start of the first whole UTC hour after the end of the last period forwarded with ok (at the first, the start of the current hour); reputationWake null while no url_reputation tool with a local list is on, else its last refresh that answered ok plus REPUTATION_REFRESH_MS, or now when none has (a failed try retried no sooner than a poll after it); each kept across a restart, writes nothing and never throws", async () => {
  let gwr = () => ({ ok: true, list_version: "v", fetched_at: "x" });
  const w = world({ scan: { refresh: { "google-web-risk": () => gwr(), "cloudflare-intel": () => ({ ok: false, code: "NO_LOCAL_LIST" }) } } });
  w.clock.now = T0 + 20 * 60_000;   /* 12:20 */
  /* forward */
  assert.equal(w.fs.forwardWake(w.clock.now), null, "no log tool on");
  await w.tool("splunk-hec", { config: { host: "splunk.example.org" } });
  assert.equal(w.fs.forwardWake(w.clock.now), T0, "at the first: the current hour's start");
  await w.fs.forwardSecurityCounts({});
  assert.equal(w.fs.forwardWake(w.clock.now), T0 + HOUR, "forwarded to 12:00: next at 13:00");
  w.clock.now = T0 + HOUR + 60_000;
  await w.fs.forwardSecurityCounts({});
  assert.equal(w.fs.forwardWake(w.clock.now), T0 + 2 * HOUR);
  assert.equal(restarted(w).forwardWake(w.clock.now), T0 + 2 * HOUR, "kept across a restart");
  /* reputation */
  assert.equal(w.fs.reputationWake(w.clock.now), null, "no reputation tool on");
  const cf = await w.tool("cloudflare-intel", { credentials: { api_token: "t" }, config: { account_id: "a" } });
  assert.equal(w.fs.reputationWake(w.clock.now), w.clock.now, "on, never refreshed: now");
  await w.fs.refreshReputationLists({});
  assert.equal(w.fs.reputationWake(w.clock.now), null, "its only tool has no local list");
  const g = await w.tool("google-web-risk", { credentials: { api_key: "k" } });
  assert.equal(w.fs.reputationWake(w.clock.now), w.clock.now);
  const ok = w.clock.now;
  await w.fs.refreshReputationLists({});
  assert.equal(w.fs.reputationWake(w.clock.now), ok + REPUTATION_REFRESH_MS);
  assert.equal(restarted(w).reputationWake(w.clock.now), ok + REPUTATION_REFRESH_MS, "kept across a restart");
  /* a failed refresh: due (ok + 6 h has passed), but no sooner than a poll after the failed try */
  w.tick(REPUTATION_REFRESH_MS + 1);
  gwr = () => ({ ok: false, error: "LIST_UNREADABLE" });
  await w.fs.refreshReputationLists({});
  const tried = w.clock.now;
  assert.equal(w.fs.reputationWake(tried), tried + POLL);
  assert.equal(w.fs.reputationWake(tried + 2 * POLL), tried + 2 * POLL);
  /* tested again, the tool with no local list is asked again */
  await w.fs.securityToolTest({ toolId: cf, by: "boss" });
  assert.equal(w.fs.reputationWake(tried), tried, "asked again at once");
  /* writes nothing; never throws */
  const kept = JSON.stringify(w.exec("SELECT * FROM fs_wakes"));
  w.fs.forwardWake(tried); w.fs.reputationWake(tried);
  assert.equal(JSON.stringify(w.exec("SELECT * FROM fs_wakes")), kept);
  for (const bad of [undefined, "x"]) { assert.equal(w.fs.forwardWake(bad), null); assert.equal(w.fs.reputationWake(bad), null); }
  w.exec("DROP TABLE fs_tools");
  assert.equal(w.fs.forwardWake(tried), null); assert.equal(w.fs.reputationWake(tried), null);
  assert.ok(g);
});

test("R40: onFileWork(module, fn) registers once (a second by one module LISTENER_DECLARED, a fn that is no function LISTENER_MALFORMED, through membership's listenerRefusal); after an act commits that gives a batch work sooner than its last answer (a receipt queued, a deeper check queued, a safe copy queued, a tool switched on) every listener is called once with {batch, at}, at that batch's R39 instant; a listener that throws or rejects changes nothing; no call names a member, a file or a viewer", async () => {
  const w = world();
  for (const [m, fn, code] of [["", () => {}, "LISTENER_MALFORMED"], ["scheduler", "not a function", "LISTENER_MALFORMED"]]) {
    const r = w.fs.onFileWork(m, fn);
    assert.deepEqual([r.ok, r.code], [false, code]);
  }
  const heard = [];
  assert.deepEqual(w.fs.onFileWork("scheduler", (e) => heard.push(e)), { ok: true, module: "scheduler" });
  const again = w.fs.onFileWork("scheduler", () => {});
  assert.deepEqual([again.ok, again.code, again.module], [false, "LISTENER_DECLARED", "scheduler"]);
  const other = [];
  w.fs.onFileWork("thrower", () => { throw new Error("boom"); });
  w.fs.onFileWork("rejecter", async () => { throw new Error("later boom"); });
  w.fs.onFileWork("notices", (e) => other.push(e));
  /* a receipt: after the commit, not inside it; scan at once and render at its instant */
  let inside = null;
  const r = w.record.transact(() => {
    const x = w.prov.recordReceipt({ address: "https://files.example/a", addressNorm: "https://files.example/a", captureSha: sha("bytes a"),
                                    retrieved: "2026-10-08T12:00:00Z", via: "direct" });
    inside = heard.length;
    return x;
  });
  await settle();
  assert.equal(r.recorded, true, "a throwing listener changes nothing of the act");
  assert.equal(inside, 0, "nothing is called inside the act");
  assert.deepEqual(heard, [{ batch: "scan", at: T0 }, { batch: "render", at: T0 }]);
  assert.deepEqual(other, heard, "every listener, the throwing ones notwithstanding");
  for (const e of heard) assert.deepEqual(Object.keys(e), ["batch", "at"], "no member, file or viewer");
  /* a rolled-back act calls no one */
  w.record.transact(() => { w.prov.recordReceipt({ address: "https://files.example/b", addressNorm: "https://files.example/b", captureSha: sha("bytes b"),
                                                   retrieved: "2026-10-08T12:00:00Z", via: "direct" }); return { ok: false }; });
  await settle();
  assert.equal(heard.length, 2);
  /* not sooner than the last answer: a second receipt in the same instant calls no one */
  await w.capture(pdf(false, "c2"));
  await settle();
  assert.equal(heard.length, 2);
  /* after a batch moves the answer later, a new receipt is sooner again */
  await w.fs.scanBatch({}); await w.fs.renderBatch({});
  assert.equal(w.fs.scanWake(w.clock.now) > w.clock.now, true, "as the scheduler asks after a tick");
  assert.equal(w.fs.renderWake(w.clock.now), null);
  w.tick(1000);
  await w.capture(pdf(false, "c3"));
  await settle();
  assert.deepEqual(heard.slice(2).map((e) => e.batch), ["scan", "render"]);
  assert.deepEqual(heard.slice(2).map((e) => e.at), [w.clock.now, w.fs.renderWake(w.clock.now)]);
  /* a tool switched on: a log tool's forward, a reputation tool's refresh */
  heard.length = 0;
  await w.tool("splunk-hec", { config: { host: "splunk.example.org" } });
  await w.tool("google-web-risk", { credentials: { api_key: "k" } });
  await settle();
  assert.deepEqual(heard, [{ batch: "forward", at: Math.floor(w.clock.now / 3_600_000) * 3_600_000 }, { batch: "reputation", at: w.clock.now }]);
  /* a deeper check queued */
  heard.length = 0;
  await w.tool("scanii");
  const d = await w.capture(pdf(true, "deep"));
  await settle(); heard.length = 0;
  w.fs.requestDeeperCheck({ captureSha: d, viewer: "member:m1" });
  await settle();
  assert.deepEqual(heard, [{ batch: "deeper", at: w.fs.deeperWake(w.clock.now) }]);
  /* a safe copy queued by a routine CDR tool: the render batch */
  heard.length = 0;
  const ct = await w.tool("glasswall-halo", { config: { host: "halo.example.org" } });
  w.exec("UPDATE fs_tools SET use = 'routine' WHERE tool_id = ?", ct);
  await w.fs.renderBatch({});
  assert.equal(w.fs.renderWake(w.clock.now), null, "as the scheduler asks after a tick");
  w.tick(POLL + 1);
  const q = await w.capture(pdf(false, "copied"));
  await settle();
  assert.ok(w.row("SELECT 1 AS x FROM fs_copies WHERE capture_sha = ? AND state = 'queued'", q));
  assert.ok(heard.some((e) => e.batch === "render"));
  assert.ok(FILE_WORK_BATCHES.includes("render") && FILE_WORK_BATCHES.length === 5);
  assert.doesNotMatch(JSON.stringify([...heard, ...other]), /m1|boss|member|[0-9a-f]{64}/, "no member, file or viewer");
});
