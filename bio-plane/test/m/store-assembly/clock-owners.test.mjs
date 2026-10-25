/* store-assembly R5 (fix round 10; K5200 item 99 (2); `diagnosis-R10-k5200.md` A3; STORE-REQUEST #6 J17 (3a')): THE COMPOSITION HANDS THE STORE'S CLOCK TO EVERY OWNER THAT
   STAMPS TIME. Pinned at `WORLD_NOW` and moved only by `tick` (R93), a world's every recorded instant is the pinned one: ai-use's, file-safety's, capture's,
   corpus-export's, action-clocks', action-plans' and filings'. Each case has a negative control on the wall clock (it names the day the wall says, which is
   never the pinned day), and was red before the assembly handed the clock (K874). Each owner is reached through its own service on the world's instance
   (`xOf(world.ctx)`), as the route map reaches it, so no route has handed it an environment first. */
import { test } from "node:test";
import assert from "node:assert/strict";

const { storeWorld, WORLD_NOW } = await import("./world.mjs");
const { assembleStore } = await import("../../../src/store-assembly/index.mjs");
const { aiUseOf } = await import("../../../src/ai-use/index.mjs");
const { captureOf } = await import("../../../src/capture/index.mjs");
const { actionClocksOf } = await import("../../../src/action-clocks/index.mjs");
const { actionPlansOf } = await import("../../../src/action-plans/index.mjs");
const { filingsOf } = await import("../../../src/filings/index.mjs");
const { promotionOf } = await import("../../../src/promotion/index.mjs");
const { recordOf } = await import("../../../src/record-core/index.mjs");
const { usage } = await import("../ai-use/fixture.mjs");
const { actionMd, CP, CLK } = await import("../action-clocks/fixture.mjs");

const iso = (ms) => new Date(ms).toISOString();
const second = (ms) => iso(ms).replace(/\.\d+Z$/, "Z");
const PINNED_DAY = iso(WORLD_NOW).slice(0, 10);
const url = (op, q = {}) => { const u = new URL(`http://do/${op}`); for (const [k, v] of Object.entries(q)) u.searchParams.set(k, v); return u; };
/** The wall's day is not the pinned day, or a case could pass on the wrong clock. */
const wallIsNotPinned = () => assert.notEqual(new Date().toISOString().slice(0, 10), PINNED_DAY, "control: the wall clock does not stand on the pinned day");

test("R5 (K5200): ai-use's first construction takes the store's clock: a limit set and a use counted on a pinned world read the pin, and `tick` moves them; with the clock unpinned the wall answers", async () => {
  wallIsNotPinned();
  const w = await storeWorld();
  const use = aiUseOf(w.ctx);   /* the assembly's own instance, before any route has handed it an environment */
  const set = use.aiLimitSet({ owner: "group", scope: "overall", unit: "calls", period: "day", amount: 5, by: "admin" });
  assert.equal(set.ok, true, JSON.stringify(set));
  assert.equal(set.set_at, second(WORLD_NOW), "the limit's instant is the pin");
  const counted = use.countUsage({ owner: "group", member: "admin", use: "ask", mode: "ask", model: "m", usage: usage(10, 0, null), calls: 1, act: "run-clock-1" });
  assert.equal(counted.ok, true, JSON.stringify(counted));
  assert.equal(counted.day, PINNED_DAY, "the day it counts under is the pin's");
  assert.equal([...w.sql.exec("SELECT first_at FROM ai_use_acts WHERE act = 'run-clock-1'")][0].first_at, second(WORLD_NOW));
  await w.tick(60_000);
  assert.equal(use.aiLimitSet({ owner: "group", scope: "overall", unit: "calls", period: "day", amount: 6, by: "admin" }).set_at, second(WORLD_NOW + 60_000), "moved by tick");
  /* control: unpinned, the wall answers */
  const bare = await storeWorld({ now: undefined, env: {} });
  delete bare.env.BIO_NOW_MS;
  const before = Date.now() - 1000;
  const wall = Date.parse(aiUseOf(bare.ctx).aiLimitSet({ owner: "group", scope: "ask", unit: "calls", period: "day", amount: 7, by: "admin" }).set_at);
  assert.ok(wall >= before && wall <= Date.now() + 1000 && wall > WORLD_NOW + 86_400_000, `control: no pin, the wall clock (${iso(wall)})`);
});

test("R5 (K5200): file-safety and capture take the store's clock: a file queued for the scan, and a parted upload begun, on a pinned world carry the pin, and `tick` moves them", async () => {
  wallIsNotPinned();
  const w = await storeWorld();
  const bytes = new TextEncoder().encode("the clerk's minutes, uploaded\n".repeat(20));
  const up = await captureOf(w.ctx).uploadCapture({ bytes, statement: "handed to me at the meeting", name: "minutes.txt", type: "text/plain", by: "member:ann" });
  assert.equal(up.ok, true, JSON.stringify(up).slice(0, 300));
  const queuedAt = (sha) => [...w.sql.exec("SELECT queued_at FROM fs_files WHERE capture_sha = ?", sha)][0].queued_at;
  assert.equal(queuedAt(up.capture.sha256), iso(WORLD_NOW), "file-safety queues the file at the pin, to the millisecond");
  const begin = (n) => captureOf(w.ctx).beginPartedUpload({ sha256: String(n).repeat(64), bytes: 40_000_000, statement: "a long recording", name: "r.wav", type: "audio/wav", by: "member:ann" });
  const began = await begin(1);
  assert.equal(began.ok, true, JSON.stringify(began));
  assert.equal(began.created, second(WORLD_NOW), "capture begins the upload at the pin");
  assert.ok(Date.parse(began.expires) > WORLD_NOW && Date.parse(began.expires) < WORLD_NOW + 31 * 86_400_000, "and its window runs from the pin, not from the wall");
  await w.tick(90_000);
  const again = await captureOf(w.ctx).uploadCapture({ bytes: new TextEncoder().encode("a second upload\n".repeat(20)), statement: "and another", name: "more.txt", type: "text/plain", by: "member:ann" });
  assert.equal(queuedAt(again.capture.sha256), iso(WORLD_NOW + 90_000), "file-safety: moved by tick");
  assert.equal((await begin(2)).created, second(WORLD_NOW + 90_000), "capture: moved by tick");
});

test("R5 (K5200): corpus-export takes the store's clock through publication: an export on a pinned world is logged at the pin, and `exportlog` reads it back", async () => {
  wallIsNotPinned();
  const w = await storeWorld();
  const made = await w.store.routes(url("export", { viewer: "admin" }), null).export();
  assert.equal(made.ok, true);
  assert.equal(made.at, iso(WORLD_NOW), "the manifest's instant is the pin");
  const log = await w.store.routes(url("exportlog", { viewer: "admin" }), null).exportlog();
  assert.equal(log.ok, true);
  assert.deepEqual(log.exports.map((r) => r.at), [iso(WORLD_NOW)], "and the log row's");
  await w.tick(5_000);
  assert.equal((await w.store.routes(url("export", { viewer: "admin" }), null).export()).at, iso(WORLD_NOW + 5_000), "moved by tick");
});

test("R5 (K5200; diagnosis A3): action-clocks takes the store's clock: on a pinned world `remindersfor` is judged on the pinned day, and a reminder is set at the pin, `tick` moving both", async () => {
  wallIsNotPinned();
  const w = await storeWorld();
  recordOf(w.ctx).setSetting("jurisdiction_profiles", ["test-port-ellery"], "member:admin");
  w.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated) VALUES ('alice','c','h_alice','member','active','["contribute"]','t','t')`);
  const A = "ACTN-2026-0001-a", M = "member:alice";
  const made = promotionOf(w.ctx).promote({ bundleId: A, base: null, snapKey: "k1", author: M, files: [{ path: "bundle.md",
    text: actionMd(A, [...CP, "action_kind: records_request", "clock:", ...CLK("2026-09-01"), ...CLK("2026-12-01")]) }], meta: { object_type: "action" } });
  assert.equal(made.ok, true, JSON.stringify(made).slice(0, 300));
  const route = (op, body, q) => w.store.routes(url(op, { author: M, viewer: M, ...q }), body ?? null)[op]();
  assert.equal((await route("reminderset", { target: A, entry: 1, on: "2026-11-20" })).ok, true);
  const read = await route("remindersfor", null, { action: A });
  assert.equal(read.ok, true, JSON.stringify(read));
  assert.equal(read.as_of, PINNED_DAY, "the day the reminders are judged on is the pin's");
  assert.equal(read.reminders[0].set_at, second(WORLD_NOW), "and the reminder was set at the pin");
  await w.tick(3 * 86_400_000);
  const later = await route("remindersfor", null, { action: A });
  assert.equal(later.as_of, iso(WORLD_NOW + 3 * 86_400_000).slice(0, 10), "moved by tick");
});

test("R5 (K5200; diagnosis A3): action-plans and filings take the store's clock: each instance's instants read the pin to the second, and two plans opened a minute apart tell their instants apart", async () => {
  wallIsNotPinned();
  const w = await storeWorld();
  assert.equal(actionPlansOf(w.ctx).now(), second(WORLD_NOW), "a plan is opened at the pin");
  assert.equal(filingsOf(w.ctx).now(), second(WORLD_NOW), "a filing's draft is stamped at the pin");
  await w.tick(60_000);
  assert.equal(actionPlansOf(w.ctx).now(), second(WORLD_NOW + 60_000), "action-plans: moved by tick, so a second plan's `opened_at` is later");
  assert.equal(filingsOf(w.ctx).now(), second(WORLD_NOW + 60_000), "filings: moved by tick");
});

test("R1 R5 (K5200): a second assembly over one storage hands capture the same clock: capture refuses a different `now` (its R58), so the assembly refuses nothing and builds nothing twice, and capture's clock stays the store's", async () => {
  const w = await storeWorld();
  assert.equal(captureOf(w.ctx).clock(), WORLD_NOW, "capture reads the pin");
  const again = assembleStore(w.ctx, w.env);   /* the Durable Object class's construction over a storage the world already assembled */
  assert.equal(typeof again.dispatch, "function");
  assert.equal(captureOf(w.ctx).clock(), WORLD_NOW, "and it still does");
  w.env.BIO_NOW_MS = WORLD_NOW + 1_000;
  assert.equal(captureOf(w.ctx).clock(), WORLD_NOW + 1_000, "the latest environment given is the clock's: a tick moves it");
});
