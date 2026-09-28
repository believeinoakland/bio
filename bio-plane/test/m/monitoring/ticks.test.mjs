/* monitoring R19–R25 and R45: the services the scheduler calls (`cadenceDue/Wake/Tick`, `archiveDue/Wake/Tick`), the
   idempotence key, re-entrance, the credential, and the tick's source outcome. `env.SELF` is a stand-in for the
   instance's own Worker: `op=monitor` runs this module's `monitor` (as the Worker forwards it), `op=acquire` answers
   in capture's shape. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { world, serve, DAEMON, NOW_MS } from "./fixture.mjs";
import { MONITOR_NO_LIVE_CREDENTIAL, MONITOR_CADENCE_DELAY_MS, MONITOR_TICK_MS, MONITOR_CADENCE_BATCH, MONITOR_TICK_BATCH }
  from "../../../src/monitoring/index.mjs";

const HOUR = 3600000, DAY = 24 * HOUR;
const LIVE = "live-daemon-token-for-monitoring-tests-0001";
/* A credential the gate refuses: a value published in this repository (tokens.mjs, publication is revocation). */
const secret = (name) => readFileSync(fileURLToPath(new URL("../../../dist/SECRETS.txt", import.meta.url)), "utf8")
  .split("\n").find((x) => x.startsWith(name + "=")).split("=")[1].trim();

/* The instance's own Worker. `acquire` maps an address to an answer (default: a grade-C capture). */
function self(w, { acquire = {}, hold = null } = {}) {
  const calls = [];
  return {
    calls,
    async fetch(req) {
      const u = new URL(req.url);
      const body = await req.json();
      calls.push({ op: u.searchParams.get("op"), token: u.searchParams.get("token"), body });
      if (hold) await hold.promise;
      if (u.searchParams.get("op") === "monitor") {
        const r = await w.m.monitor({ bundleId: body.bundleId, viewer: DAEMON, actorClass: "machine", actor: DAEMON });
        return new Response(JSON.stringify(r.body), { status: r.status });
      }
      const a = acquire[body.address];
      if (a instanceof Error) throw a;
      return new Response(JSON.stringify(a ?? { ok: true, document: { capture: { grade: "C", sha256: "c".repeat(64) },
                                                                    provenance_chain: [{}, {}] } }));
    },
  };
}
const configured = (w, o) => { w.m.env.SELF = self(w, o); w.m.env.DAEMON_TOKEN = LIVE; return w.m.env.SELF; };
/* An address made fallback-eligible by capture's own record (three counted failures). */
const failing = async (w, addr, n = 3, at = "2026-09-20T00:00:00Z") => {
  for (let i = 0; i < n; i++) await w.capture.recordSourceOutcome({ addressNorm: addr, outcome: "fetch_failed", at });
};
const iso = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, "Z");

test("R19 the cadence tick: inert unless configured; due while a subject is due; wake now + 1 s, else next, else null; at most 50 by R1–R10; its answer", async () => {
  const w = world();
  const id = "INFO-2026-0300-due";
  const loc = "https://records.example.org/due.txt";
  w.monitored(id, loc, "due-v1", { freq: "daily" });
  w.net.routes[loc] = serve("due-v1");
  /* not configured: inert */
  assert.equal(w.m.cadenceDue(NOW_MS), null);
  assert.equal(w.m.cadenceWake(NOW_MS), null);
  assert.deepEqual(await w.m.cadenceTick(NOW_MS), { configured: false });
  const s = configured(w);
  assert.equal(w.m.cadenceDue(NOW_MS), NOW_MS);
  assert.equal(w.m.cadenceWake(NOW_MS), NOW_MS + MONITOR_CADENCE_DELAY_MS);
  const t = await w.m.cadenceTick(NOW_MS);
  assert.deepEqual(Object.keys(t).sort(), ["addresses", "at", "candidates", "configured", "epoch", "failed", "monitored", "next",
                                           "skipped", "ticked", "unscheduled"].sort());
  assert.deepEqual([t.configured, t.at, t.candidates, t.ticked.length, t.failed.length], [true, iso(NOW_MS), 1, 1, 0]);
  assert.deepEqual([t.ticked[0].bundle, t.ticked[0].frequency, t.ticked[0].status, t.ticked[0].reeval_raised],
                   [id, "daily", "unchanged", false]);
  assert.ok("versions" in t.ticked[0] && "frequency_source" in t.ticked[0], "each entry carries its address's account (R15)");
  assert.deepEqual(s.calls.map((c) => [c.op, c.token, c.body.bundleId]), [["monitor", LIVE, id]]);
  /* checked: not due until last check + interval; wake is `next` */
  const last = Date.parse(w.fm(id).monitoring.last_checked);
  assert.equal(w.m.cadenceDue(NOW_MS + HOUR), null);
  assert.equal(w.m.cadenceWake(NOW_MS + HOUR), last + DAY);
  /* nothing monitored: null */
  const e = world();
  configured(e);
  assert.equal(e.m.cadenceWake(NOW_MS), null);
  /* the batch bound */
  assert.equal(MONITOR_CADENCE_BATCH, 50);
  const many = world();
  for (let i = 0; i < 52; i++) many.monitored(`INFO-2026-${String(4000 + i)}-many`, `https://m.example.org/${i}`, `many-${i}`, { freq: "daily" });
  const ms = configured(many);
  many.m.env.SELF = { fetch: async (req) => { ms.calls.push((await req.json()).bundleId); return new Response(JSON.stringify({ ok: true, status: "unchanged" })); } };
  const mt = await many.m.cadenceTick(NOW_MS);
  assert.deepEqual([mt.candidates, mt.ticked.length], [52, 50]);
});

test("R20 the archive tick: inert unless configured; due every firing; wake now + interval while a failing run reaches the floor; fires eligible addresses oldest first through acquire's archive arm naming only the address", async () => {
  const w = world();
  assert.equal(w.m.archiveDue(NOW_MS), NOW_MS);
  assert.deepEqual(await w.m.archiveTick(NOW_MS), { configured: false });
  assert.equal(w.m.archiveWake(NOW_MS), null);
  const s = configured(w);
  assert.equal(w.m.archiveWake(NOW_MS), null, "nothing failing");
  await failing(w, "https://gone.example.org/b", 1);
  assert.equal(w.m.archiveWake(NOW_MS), null, "one unretried failure is below the floor");
  await failing(w, "https://gone.example.org/b", 1);
  assert.equal(w.m.archiveWake(NOW_MS), NOW_MS + MONITOR_TICK_MS, "at the floor (2 by default)");
  w.m.env.MONITOR_TICK_MS = "60000";
  assert.equal(w.m.archiveWake(NOW_MS), NOW_MS + 60000, "a binding may set the interval");
  delete w.m.env.MONITOR_TICK_MS;
  await failing(w, "https://gone.example.org/a", 3, "2026-09-10T00:00:00Z");
  await failing(w, "https://gone.example.org/b", 1);
  const t = await w.m.archiveTick(NOW_MS);
  assert.deepEqual(Object.keys(t).sort(), ["at", "checked", "configured", "eligible", "epoch", "failed", "fired", "skipped"].sort());
  assert.deepEqual(t.eligible, ["https://gone.example.org/a", "https://gone.example.org/b"], "oldest failing run first");
  assert.deepEqual(t.fired, [{ address: "https://gone.example.org/a", grade: "C", hops: 2 }, { address: "https://gone.example.org/b", grade: "C", hops: 2 }]);
  assert.deepEqual(s.calls.map((c) => [c.op, c.token, JSON.stringify(c.body)]),
    [["acquire", LIVE, '{"via":"archive.org","address":"https://gone.example.org/a"}'],
     ["acquire", LIVE, '{"via":"archive.org","address":"https://gone.example.org/b"}']]);
  /* it records nothing about the source itself */
  assert.equal(w.capture.sourceReachability({ addressNorm: "https://gone.example.org/a" }).consecutive_failures, 3);
  assert.equal(MONITOR_TICK_BATCH, 50);
});

test("R21 a retry never fires a subject twice; an open epoch is reused while fresh and replaced after; a tick closes its epoch only when nothing failed and nothing was skipped", async () => {
  const w = world();
  const s = configured(w, { acquire: { "https://gone.example.org/b": new Error("worker unreachable") } });
  await failing(w, "https://gone.example.org/a", 3, "2026-09-10T00:00:00Z");
  await failing(w, "https://gone.example.org/b", 3, "2026-09-11T00:00:00Z");
  const t1 = await w.m.archiveTick(NOW_MS);
  assert.deepEqual([t1.fired.map((f) => f.address), t1.failed.map((f) => f.address)], [["https://gone.example.org/a"], ["https://gone.example.org/b"]]);
  /* the retry, inside the interval: the same epoch; the success is skipped, the failure re-attempted */
  const t2 = await w.m.archiveTick(NOW_MS + 60000);
  assert.equal(t2.epoch, t1.epoch);
  assert.deepEqual([t2.skipped, t2.fired.length, t2.failed.map((f) => f.address)], [["https://gone.example.org/a", "https://gone.example.org/b"], 0, []]);
  assert.equal(s.calls.filter((c) => c.body.address === "https://gone.example.org/a").length, 1, "never fired twice");
  /* D-518: a tick that only skipped finished nothing, so the epoch stays open */
  const t3 = await w.m.archiveTick(NOW_MS + 120000);
  assert.equal(t3.epoch, t1.epoch);
  assert.equal(s.calls.filter((c) => c.body.address === "https://gone.example.org/a").length, 1);
  /* past the interval the epoch is spent: a fresh one drops every other's claims */
  const t4 = await w.m.archiveTick(NOW_MS + MONITOR_TICK_MS + 1);
  assert.notEqual(t4.epoch, t1.epoch);
  assert.equal(t4.fired.length + t4.failed.length, 2);
  /* a clean tick closes its epoch: the next is fresh */
  const c = world();
  configured(c);
  await failing(c, "https://gone.example.org/z", 3);
  const k1 = await c.m.archiveTick(NOW_MS);
  const k2 = await c.m.archiveTick(NOW_MS + 1000);
  assert.notEqual(k2.epoch, k1.epoch);
  assert.deepEqual(k2.skipped, []);
  /* the cadence tick: one hour */
  const cd = world();
  const loc = "https://records.example.org/c.txt";
  cd.monitored("INFO-2026-0310-c", loc, "c-v1", { freq: "hourly" });
  cd.net.routes[loc] = serve("c-v1");
  cd.m.env.SELF = { fetch: async () => { throw new Error("down"); } };
  cd.m.env.DAEMON_TOKEN = LIVE;
  const c1 = await cd.m.cadenceTick(NOW_MS);
  assert.equal(c1.failed.length, 1);
  const c2 = await cd.m.cadenceTick(NOW_MS + HOUR - 1);
  assert.deepEqual([c2.epoch, c2.skipped], [c1.epoch, ["INFO-2026-0310-c"]]);
  const c3 = await cd.m.cadenceTick(NOW_MS + HOUR + 1);
  assert.notEqual(c3.epoch, c1.epoch);
});

test("R22 a tick is not re-entrant: one called while the same tick runs answers busy and does nothing", async () => {
  const w = world();
  let release;
  const hold = { promise: new Promise((r) => { release = r; }) };
  const s = configured(w, { hold });
  await failing(w, "https://gone.example.org/a", 3);
  const first = w.m.archiveTick(NOW_MS);
  await new Promise((r) => setTimeout(r, 10));
  const second = await w.m.archiveTick(NOW_MS);
  assert.deepEqual(second, { configured: true, busy: true, checked: 0, eligible: [], fired: [], failed: [], skipped: [] });
  const loc = "https://records.example.org/busy.txt";
  w.monitored("INFO-2026-0320-busy", loc, "busy-v1", { freq: "daily" });
  w.net.routes[loc] = serve("busy-v1");
  const c1 = w.m.cadenceTick(NOW_MS);
  await new Promise((r) => setTimeout(r, 10));
  const c2 = await w.m.cadenceTick(NOW_MS);
  assert.deepEqual(c2, { configured: true, busy: true, candidates: 0, ticked: [], skipped: [], failed: [], unscheduled: [] });
  release();
  assert.equal((await first).fired.length, 1);
  assert.equal((await c1).ticked.length, 1);
  assert.equal(s.calls.length, 2, "the busy calls did nothing");
});

test.todo("R23 the ticks call R1–R10 and capture.acquire in process and spend no credential (not yet met: K102, K259; the ticks fire over the instance's Worker, N222)");
test.todo("R45 monitoring runs wherever a document asks, with no binding or credential a condition of it; an administrator's pause is stated on every tick (not yet met: K102, K259; waits on R23 and R30, N222)");

test("R24 configured means a self binding and a bound daemon or administrator credential; a fire spends only a credential the gate admits, else fails that subject by name", async () => {
  const w = world();
  const loc = "https://records.example.org/cred.txt";
  w.monitored("INFO-2026-0330-cred", loc, "cred-v1", { freq: "daily" });
  w.net.routes[loc] = serve("cred-v1");
  assert.equal(w.m.configured(), false);
  w.m.env.SELF = self(w);
  assert.equal(w.m.configured(), false, "no credential bound");
  w.m.env.ADMIN_TOKEN = LIVE;
  assert.equal(w.m.configured(), true, "the administrator's credential");
  delete w.m.env.ADMIN_TOKEN;
  w.m.env.DAEMON_TOKEN = LIVE;
  assert.equal(w.m.configured(), true);
  delete w.m.env.SELF;
  assert.equal(w.m.configured(), false, "no self binding");
  /* the daemon's first, then the administrator's; a published value is not live */
  const dead = secret("ADMIN_TOKEN"), deadToo = secret("MEMBER_TOKEN");
  w.m.env.SELF = self(w);
  Object.assign(w.m.env, { DAEMON_TOKEN: dead, ADMIN_TOKEN: LIVE + "-admin" });
  await w.m.cadenceTick(NOW_MS);
  assert.equal(w.m.env.SELF.calls.at(-1).token, LIVE + "-admin");
  Object.assign(w.m.env, { DAEMON_TOKEN: dead, ADMIN_TOKEN: deadToo });
  w.st.sql.exec(`UPDATE bundles SET monitor_last_checked=NULL`);
  const t = await w.m.cadenceTick(NOW_MS + 2 * HOUR);
  assert.equal(t.configured, true, "bound, so configured");
  assert.deepEqual(t.failed.map((f) => f.reason), [MONITOR_NO_LIVE_CREDENTIAL]);
  await failing(w, "https://gone.example.org/q", 3);
  const a = await w.m.archiveTick(NOW_MS);
  assert.deepEqual(a.failed, [{ address: "https://gone.example.org/q", reason: MONITOR_NO_LIVE_CREDENTIAL }]);
});

test("R25 each tick's outcome is recorded with capture's reachability: success, refused, a failed fetch; governed apart", async () => {
  const w = world();
  const loc = "https://records.example.org/reach.txt";
  const id = "INFO-2026-0340-reach";
  w.monitored(id, loc, "reach-v1");
  const reach = () => w.capture.sourceReachability({ addressNorm: loc });
  w.net.routes[loc] = serve("x", "text/plain", 404);
  await w.m.monitor({ bundleId: id, viewer: DAEMON });
  w.net.routes[loc] = serve("x", "text/plain", 500);
  await w.m.monitor({ bundleId: id, viewer: DAEMON });
  w.net.routes[loc] = new Error("reset");
  await w.m.monitor({ bundleId: id, viewer: DAEMON });
  const r = reach();
  assert.equal(r.consecutive_failures, 3);
  assert.equal(r.fallback_eligible, true, "a monitored source that stops answering reaches the fallback");
  w.gov.refuse.push("records.example.org");
  await w.m.monitor({ bundleId: id, viewer: DAEMON });
  assert.equal(reach().consecutive_failures, 3, "a governed refusal never counts as the source failing");
  w.gov.refuse.length = 0;
  w.net.routes[loc] = serve("reach-v1");
  await w.m.monitor({ bundleId: id, viewer: DAEMON });
  assert.equal(reach().consecutive_failures, 0, "a success resets the run");
});
