/* F5: the live shape. The wedged object's alarm was killed 7 times (platform maximum) at ~05:57-06:03 and is no longer run; the platform keeps
   it, so getAlarm answers its time T (= the oldest row's due_at, the moment it was armed for). The platform runs an alarm only when setAlarm
   is called afresh. A deploy (new construction: start()), a new registration (arm()) and every later request reconcile "only pulled earlier". */
const ROOT = process.env.ROOT;
await import(`${ROOT}/src/plane/register.mjs`);
const { test } = await import("node:test");
const assert = (await import("node:assert/strict")).default;
const { DatabaseSync } = await import("node:sqlite");
const { createHash } = await import("node:crypto");
const { store } = await import(`${ROOT}/test/m/plane/fixture.mjs`);
const { bucketStandIn } = await import(`${ROOT}/test/m/case-carriage/fixture.mjs`);
const { extractionOf } = await import(`${ROOT}/src/extraction/index.mjs`);
const sha = (b) => createHash("sha256").update(b).digest("hex");
const OLD = `CREATE TABLE keeps_pending (sha TEXT NOT NULL, kind TEXT NOT NULL, parts TEXT NOT NULL DEFAULT '[]', detail TEXT NOT NULL DEFAULT '{}',
  attempts INTEGER NOT NULL DEFAULT 0, registered_at INTEGER NOT NULL, due_at INTEGER NOT NULL, last_try INTEGER, last_why TEXT, final_why TEXT, PRIMARY KEY (sha, kind))`;

test("F5: a stale past alarm the platform no longer runs is re-armed by the object's start and by a new registration, and the fresh row runs", async () => {
  const db = new DatabaseSync(":memory:");
  const kv = new Map();                                    // the object's key-value storage (the daily consumers' record), shared by both constructions
  const kvOn = (ctx) => { ctx.storage.get = async (k) => kv.get(k); ctx.storage.put = async (k, v) => { kv.set(k, structuredClone(v)); }; };
  { const first = await store({ db, env: { CAPTURES: bucketStandIn() }, before: kvOn }); await first.s.onAlarm(); }   // today's daily passes done, as on the live copy by 05:44
  db.exec(`DROP TABLE keeps_pending`);
  db.exec(OLD);
  const T = Date.now() - 7 * 3600e3;                       // 0111's due_at: what the alarm was set for
  const ins = db.prepare(`INSERT INTO keeps_pending (sha,kind,attempts,registered_at,due_at,last_try,last_why) VALUES (?,?,?,?,?,?,?)`);
  ins.run(sha("0111"), "reading", 0, T - 1105, T, T - 1083, "NO_HOME");
  ["0116", "0117", "0121", "0125", "0127"].forEach((n, i) => ins.run(sha(n), "reading", 0, T + 900e3 + i, T + 900e3 + i, null, null));
  let alarm = T, sets = [], fireable = false;
  const x = await store({ db, env: { CAPTURES: bucketStandIn() }, before: (ctx) => {
    kvOn(ctx);
    ctx.storage.getAlarm = async () => alarm;             // the stale alarm, still reported
    ctx.storage.setAlarm = async (t) => { sets.push(t); alarm = t; fireable = true; };
    ctx.storage.deleteAlarm = async () => { alarm = null; };
  } });
  const asked = [];
  extractionOf(x.ctx).readHeld = async (a) => { asked.push(a.sha); return { ok: true, read: true }; };
  await x.call(`/pendingadd?kind=reading&sha=${sha("fresh")}`);   // a member's capture owes a reading
  const { schedulerOf } = await import(`${ROOT}/src/scheduler/index.mjs`); await schedulerOf(x.ctx, x.env).arm();
  console.log("setAlarm calls after start + pendingadd + arm:", sets.length, sets.map((t) => Math.round((t - Date.now()) / 1000) + " s from now"));
  assert.ok(sets.length > 0, "the alarm was re-set to a time the platform will run");
  assert.ok(fireable);
  // the platform now runs it
  let n = 0;
  while (fireable && n++ < 10) { fireable = false; await x.s.onAlarm(); }
  assert.ok(asked.includes(sha("fresh")), "the fresh row ran");
});
