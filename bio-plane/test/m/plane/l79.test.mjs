/* plane R79, R80 (fix round 6, G1; K4566, K4570), the platform check L: on workerd under Miniflare, the Worker's real `scheduled` handler
   over the real Durable Object. An object that owes work and has lost its alarm is healed by the cron's call; a double fire and a
   fire twenty minutes late change nothing further; a restart over the same storage (the deploy's) then a fire runs the work once;
   an object held for longer than the bound makes the handler return inside its bound, failed, with the second object still
   asked; a member never sees a stall, an administrator does. The numbers are printed. The scheduler's `watch` and `health`
   (SCHEDULER #39) must be merged: until then these are RED BY NAME. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";

const ENTRY = fileURLToPath(new URL("./l79-entry.mjs", import.meta.url));
const persist = mkdtempSync(join(tmpdir(), "plane-l79-"));
const boot = () => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Watched", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "l79", VERSION: "test", ADMIN_TOKEN: "adm-l79", MEMBER_TOKEN: "mem-l79", DAEMON_TOKEN: "dmn-l79", PROBE_TOKEN: "prb-l79" },
  durableObjectsPersist: persist,
});
let mf = boot();
after(() => mf.dispose());
const stub = async (name = "bio") => { const ns = await mf.getDurableObjectNamespace("STORE"); return ns.get(ns.idFromName(name)); };
const ask = async (path, name = "bio") => { const r = await (await stub(name)).fetch(`http://do/l79/${path}`); const t = await r.text(); assert.equal(r.status, 200, t); return JSON.parse(t); };
const fire = async (scheduledTime = Date.now()) => (await mf.getWorker()).scheduled({ cron: "*/5 * * * *", scheduledTime: new Date(scheduledTime) });
const owed = async (viewer) => (await (await (await stub()).fetch(`http://do/owedwork?viewer=${viewer}`)).json());
const until = async (fn, ms = 30_000) => { const t0 = Date.now(); for (let v = await fn(); ; v = await fn()) { if (v) return Date.now() - t0; if (Date.now() - t0 > ms) throw new Error("timed out"); await new Promise((r) => setTimeout(r, 100)); } };
const D = "c".repeat(64);

test("R79 L: an object that owes work and has lost its alarm runs nothing on its own; the cron's call sets the alarm and the row runs, once; a second fire, and one twenty minutes late, run nothing more", async () => {
  await ask(`owe?sha=${D}`);
  let s = await ask("state");
  assert.equal(s.alarm, null, "no alarm");
  assert.equal(s.pending.length, 1);
  await new Promise((r) => setTimeout(r, 1500));
  s = await ask("state");
  assert.deepEqual([s.pending.length, s.readHeld], [1, 0], "left alone, it does not heal: the premise");
  const at = Date.now();
  const first = await fire(at);
  assert.equal(first.outcome, "ok");
  const took = await until(async () => (await ask("state")).pending.length === 0);
  console.log(`# L79: no alarm, one row owed; the watchdog fired and the row had run ${took} ms after it returned`);
  s = await ask("state");
  assert.equal(s.readHeld, 1, "run once");
  assert.equal(s.health.watchdog_seen, at, "the object recorded the fire");
  assert.equal((await fire(at)).outcome, "ok");
  assert.equal((await fire(Date.now() - 20 * 60_000)).outcome, "ok");
  await new Promise((r) => setTimeout(r, 500));
  s = await ask("state");
  assert.equal(s.readHeld, 1, "a double fire and a late one run nothing more");
  assert.equal(s.health.watchdog_seen, at, "never backwards");
  /* the scratch object was asked too: it too recorded the fire */
  assert.equal((await ask("state", "scratch")).health.watchdog_seen, at);
});

test("R80 L: an administrator's `owedwork`, asked of the object, carries what the watchdog saw, and a member's carries none of it", async () => {
  const admin = (await owed("class:admin")).result;
  for (const k of ["last_run", "alarm_at", "stale", "oldest_overdue", "watchdog_seen"]) assert.ok(k in admin, k);
  assert.equal(typeof admin.watchdog_seen, "number");
  const member = (await owed("member:ann")).result;
  assert.deepEqual(Object.keys(member).sort(), ["ok", "owed"]);
});

test("R79 L: a restart over the same storage (the deploy's), then a fire: the row owed is read once in all, and the second boot's fire is a sound one", async () => {
  const sha = "b".repeat(64);
  await ask(`owe?sha=${sha}`);
  await mf.dispose();
  mf = boot();
  /* the restart re-derives the alarm from the ledger (the scheduler's start) and the row is read by it; the watchdog then has nothing to do */
  await until(async () => (await ask("state")).pending.length === 0);
  const before = (await ask("state")).readHeld;
  const at = Date.now();
  assert.equal((await fire(at)).outcome, "ok");
  await new Promise((r) => setTimeout(r, 500));
  const s = await ask("state");
  assert.equal(s.readHeld, before, "the fire after the restart reads nothing again");
  assert.equal(s.health.watchdog_seen, at);
});

test("R79 L: an object held for fourteen seconds (every other call waits behind it): the handler returns inside its bound, failed, and the second object was still asked", async () => {
  const held = (await stub()).fetch("http://do/l79/hold?ms=14000").then((r) => r.text(), () => null);
  await new Promise((r) => setTimeout(r, 500));
  const at = Date.now();
  const t0 = Date.now();
  const r = await fire(at);
  const took = Date.now() - t0;
  console.log(`# L79: object busy 14 s; the watchdog returned after ${took} ms, outcome ${r.outcome}`);
  assert.equal(r.outcome, "exception", "a failed run is what Cron Events record");
  assert.ok(took >= 9_500 && took < 12_500, `bounded at 10 s (${took} ms)`);
  assert.equal((await ask("state", "scratch")).health.watchdog_seen, at, "scratch was asked");
  await held;
  /* the call that waited behind the hold is answered when it ends; the object is sound, and the next cycle's fire is */
  assert.equal((await fire(Date.now())).outcome, "ok", "and the next cycle is sound");
});

test("R79 L: an alarm seeded in the past on workerd: observed, then the fire leaves the object with its work done and an alarm that is not in the past", async () => {
  const sha = "a".repeat(64);
  await ask(`owe?sha=${sha}`);
  const seeded = await ask(`alarm-at?at=${Date.now() - 3 * 3_600_000}`);
  await new Promise((r) => setTimeout(r, 1500));
  const mid = await ask("state");
  console.log(`# L79: past alarm seeded at ${seeded.alarm}; after 1.5 s the row ${mid.pending.length ? "was NOT" : "was"} run by the platform, alarm now ${mid.alarm}`);
  assert.equal((await fire(Date.now())).outcome, "ok");
  await until(async () => (await ask("state")).pending.length === 0);
  const s = await ask("state");
  assert.ok(s.alarm === null || s.alarm > Date.now() - 5000, "no alarm left in the past");
});
