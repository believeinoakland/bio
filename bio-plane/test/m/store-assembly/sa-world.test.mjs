/* store-assembly R90–R94 (K5046 (d), (g); K5052 (7)): the world `storeWorld()` publishes, at its interface. The console line
   R91 asks for is caught as the file's first world is made. */
import { test } from "node:test";
import assert from "node:assert/strict";

const said = [];
const log = console.log;
console.log = (...a) => { said.push(a.join(" ")); log(...a); };
const { storeWorld, WORLD_NOW, WORLD_PASSWORD, WORLD_FOUNDER_HANDLE } = await import("./world.mjs");
const { credentialsOf } = await import("../../../src/credentials/index.mjs");
const { membershipOf } = await import("../../../src/membership/index.mjs");
const { schedulerOf } = await import("../../../src/scheduler/index.mjs");
const { instanceSetupOf } = await import("../../../src/setup.mjs");
const first = await storeWorld({ claimed: false });
console.log = log;

const answer = async (res) => ({ status: res.status, json: await res.json() });

test("R90: a world is the real store over node:sqlite, migrated, instance-setup started, holding store, ctx, sql and env; an owner's instance is xOf(world.ctx)", async () => {
  const w = await storeWorld();
  for (const k of ["routes", "dispatch", "namespace", "nowMs", "read"]) assert.equal(typeof w.store[k], "function", k);
  assert.equal(typeof w.sql.exec, "function");
  const tables = [...w.sql.exec("SELECT name FROM sqlite_master WHERE type='table'")].map((r) => r.name);
  for (const t of ["bundles", "members", "keeps_pending", "credentials"]) assert.ok(tables.includes(t), t);
  /* instance-setup started: a second start on this storage starts nothing */
  const again = await instanceSetupOf(w.ctx, w.env).start();
  assert.equal(again.started, false);
  /* the instance the store answers with is xOf(world.ctx): the founder the claim made is the one credentials holds */
  assert.equal(credentialsOf(w.ctx).bootstrapState(null).claimed, true);
  assert.equal(membershipOf(w.ctx).founderHandle(), WORLD_FOUNDER_HANDLE);
  /* env: STORE answering idFromName, CAPTURES a bucket, the pinned clock */
  assert.equal(w.env.STORE.idFromName("bio"), "bio");
  await w.env.CAPTURES.put("k", "bytes");
  assert.equal(await (await w.env.CAPTURES.get("k")).text(), "bytes");
  assert.equal((await w.env.CAPTURES.get("k", { range: { offset: 1, length: 2 } })).size, 5);
  assert.equal(await (await w.env.CAPTURES.get("k", { range: { offset: 1, length: 2 } })).text(), "yt");
  assert.equal(w.env.BIO_NOW_MS, WORLD_NOW);
});

test("R90: claimed: false gives an unclaimed instance; any binding the test hands in reaches env", async () => {
  const w = await storeWorld({ claimed: false, env: { FILE_SCANNER: { fetch: async () => new Response("{}") } } });
  assert.equal(w.claimed, false);
  assert.equal(w.password, null);
  assert.equal(credentialsOf(w.ctx).bootstrapState(null).claimed, false);
  assert.equal(typeof w.env.FILE_SCANNER.fetch, "function");
  assert.equal(w.env.AGENT_WORKER, undefined, "AGENT_WORKER unbound unless handed (R49)");
});

test("R91: built once for the file and copied for each test: two worlds share no row, the copy is faster than the base, and the file says both", async () => {
  const a = await storeWorld({ claimed: false }), b = await storeWorld({ claimed: false });
  await a.claim({ password: "a-founder-passphrase" });
  assert.equal(credentialsOf(a.ctx).bootstrapState(null).claimed, true);
  assert.equal(credentialsOf(b.ctx).bootstrapState(null).claimed, false, "an act in one world is invisible in the other");
  assert.notEqual(a.ctx, b.ctx);
  assert.notEqual(a.db, b.db);
  assert.notEqual(credentialsOf(a.ctx), credentialsOf(b.ctx), "no module instance is shared");
  /* control: a world made after another's acts holds the base's rows */
  const c = await storeWorld({ claimed: false });
  assert.equal(credentialsOf(c.ctx).bootstrapState(null).claimed, false);
  assert.ok(c.timing.copy < c.timing.base, `copy ${c.timing.copy} ms < base ${c.timing.base} ms`);
  const lines = said.filter((l) => l.startsWith("storeWorld: "));
  assert.equal(lines.length, 1, "printed once for the file");
  assert.match(lines[0], /^storeWorld: base \d+ ms, copy \d+ ms$/);
  assert.equal(first.claimed, false);
});

test("R92: claim makes the founder through the store's own claim route, a second claim is refused, and send passes a store request to dispatch", async () => {
  const w = await storeWorld({ claimed: false });
  const r = await w.claim({ password: "a-new-founder-pass", handle: "rosa" });
  assert.equal(r.ok, true);
  assert.equal(r.role, "admin");
  assert.equal(r.handle, "rosa");
  assert.equal(w.password, "a-new-founder-pass");
  await assert.rejects(w.claim({ password: "another-founder-pass" }), /ALREADY_CLAIMED/);
  /* send: the store's own answer, the route through store-door's frame */
  const a = await answer(await w.send({ url: "http://x/coarchivestate" }));
  assert.equal(a.status, 200);
  assert.equal(a.json.ok, true);
  assert.deepEqual(a.json.result, JSON.parse(JSON.stringify(w.store.read("coarchivestate", {}))));
  const unknown = await answer(await w.send({ url: "http://x/nosuchop", body: { x: 1 } }));
  assert.equal(unknown.status, 400);
  /* the claimed world's founder was claimed with the stated password */
  const c = await storeWorld();
  assert.equal(c.password, WORLD_PASSWORD);
  assert.equal(c.founder.handle, WORLD_FOUNDER_HANDLE);
});

test("R93: the clock is pinned at WORLD_NOW (or the test's now) and moves only by tick, which runs the scheduler's firing at the new instant", async () => {
  const w = await storeWorld();
  assert.equal(w.store.nowMs(null), WORLD_NOW);
  assert.equal(w.now(), WORLD_NOW);
  const later = await storeWorld({ now: WORLD_NOW + 86_400_000 });
  assert.equal(later.store.nowMs(null), WORLD_NOW + 86_400_000);
  /* a reminder due in an hour, as a consumer registered with the world's scheduler: asked at each firing, it fires only once
     the world's clock has passed its instant */
  const due = WORLD_NOW + 3_600_000, fired = [];
  schedulerOf(w.ctx, w.env).register("store-assembly-test", { name: "reminder-test", key: "remindertest",
    due: (now) => (now >= due && !fired.length ? now : null), wake: () => (fired.length ? null : due),
    tick: async (now) => { fired.push(now); return { remindertest: { fired: true } }; } });
  await w.tick(0);
  await w.tick(3_599_999);
  assert.deepEqual(fired, [], "not before the hour");
  assert.equal(w.now(), WORLD_NOW + 3_599_999);
  await w.tick(1);
  assert.deepEqual(fired, [due], "at the hour, through the real firing");
  assert.equal(w.store.nowMs(null), due, "every module's clock is the moved one");
  await assert.rejects(w.tick(-1));
});

test("R94: the network refuses every outbound address as an unreachable network does until the test scripts one; a world's database is reachable by no other", async () => {
  const w = await storeWorld();
  await assert.rejects(fetch("https://example.invalid/x"), (e) => e instanceof TypeError && /fetch failed/.test(e.message));
  w.script("https://tsa.example/", async () => new Response("stamped", { status: 200 }));
  assert.equal(await (await fetch("https://tsa.example/stamp")).text(), "stamped");
  await assert.rejects(fetch("https://other.example/"), TypeError, "a script answers only what it names");
  /* a row inserted through one world's sql (a state no act makes) is in that world alone */
  const v = await storeWorld();
  w.sql.exec("INSERT INTO keeps_last (sha, kind, outcome, at) VALUES ('x', 'keep', 'finished', 1)");
  assert.equal([...w.sql.exec("SELECT count(*) c FROM keeps_last")][0].c, 1);
  assert.equal([...v.sql.exec("SELECT count(*) c FROM keeps_last")][0].c, 0);
});

test("R93: an owed row comes due by the passage of the world's time: registered at the pinned instant, backed off from it, asked again only once tick has moved past its due", async () => {
  const w = await storeWorld();
  const sha = "d".repeat(64);
  const added = await answer(await w.send({ url: `http://x/pendingadd?kind=reading&sha=${sha}`, method: "POST", body: {} }));
  assert.equal(added.json.ok, true, JSON.stringify(added.json));
  const rowOf = () => [...w.sql.exec("SELECT registered_at, due_at, attempts, last_why FROM keeps_pending WHERE sha=? AND kind='reading'", sha)][0];
  assert.equal(rowOf().registered_at, WORLD_NOW, "stamped with the world's clock");
  await w.tick(0);
  const after = rowOf();
  assert.equal(after.attempts, 1, "asked at the first firing");
  assert.ok(after.due_at > WORLD_NOW, "backed off from the pinned instant");
  const wait = after.due_at - w.now();
  await w.tick(wait - 1);
  assert.equal(rowOf().attempts, 1, "not asked before its due");
  await w.tick(1);
  assert.equal(rowOf().attempts, 2, "asked again once the clock reaches its due");
});

test("R71 (K5132): under a pinned instance clock a run's measured times are still its work: own_ms is non-zero for an owner that works 30 ms, while its row's instants are the pinned clock's", async () => {
  const { storage } = await import("./fixture.mjs");
  const { pendingOf } = await import("../../../src/store-assembly/pending.mjs");
  const st = storage();
  const pinned = WORLD_NOW;
  /* the reading's owner works 30 ms and answers what extraction's `readHeld` answers for a reading done (its published fixture) */
  const { readHeldAnswer: { read: readDone } } = await import("../extraction/fixtures.mjs");
  const busy = async () => { const until = performance.now() + 30; while (performance.now() < until) { /* real work */ } return readDone(); };
  const ledger = pendingOf(st.ctx, { now: () => pinned, workers: { reading: busy } });
  ledger.migrate();
  const sha = "e".repeat(64);
  assert.equal(ledger.registerJob({ kind: "reading", sha }).ok, true);
  await ledger.consumer().tick(pinned);
  const [last] = ledger.ledgerLast({ sha });
  assert.equal(last.outcome, "finished");
  assert.ok(last.own_ms >= 25, `own_ms ${last.own_ms} measures the work`);
  assert.ok(last.last_ms >= last.own_ms);
  const row = ledger.jobRow({ sha, kind: "reading" });
  assert.equal(row.registered_at, pinned, "the row's instants are the instance clock's");
  assert.equal(row.ended_at, pinned);
});
