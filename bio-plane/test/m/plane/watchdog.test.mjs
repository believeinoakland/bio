/* plane R79, R80 (fix round 6, G1; K4565, K4566, K4570; scheduler R28, R29): THE SECOND CLOCK. The Worker's `scheduled` handler, once a
   cycle, asks each of the two objects (`bio`, `scratch`) to `watchdog(at)`, bounded, and throws when any failed; the object's
   `watchdog` is the scheduler's `watch(at)`; `owedwork` shows an administrator what the watchdog saw. Handler tests run with a
   scripted STORE binding; the object's own through the real `Store`. The scheduler's `watch` and `health` (SCHEDULER #39, B3, B4)
   are read from the tranche: until they merge, the tests that reach them are RED BY NAME. */
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { store } from "./fixture.mjs";

const mod = await import("../../../src/plane/watchdog.mjs").catch(() => ({}));
const entry = await import("../../../src/plane/index.mjs");

/* a STORE binding that answers `watchdog(at)` for each name from `answers[name]`, and records every stub it hands out */
function binding(answers) {
  const stubs = [], calls = [];
  const STORE = {
    idFromName: (n) => ({ n }),
    get: (id) => { const stub = { id: id.n, watchdog: (at) => { calls.push([id.n, at]); return answers[id.n](at); } }; stubs.push(stub); return stub; },
  };
  return { env: { STORE }, stubs, calls };
}
const ok = () => ({ alarm_at: null, last_run: null, running_since: null, rearmed: false, why: null });
const controller = (scheduledTime = Date.parse("2026-10-22T16:00:00Z")) => ({ cron: "*/5 * * * *", scheduledTime });
const logged = () => { const m = mock.method(console, "error", () => {}); return { lines: () => m.mock.calls.map((c) => c.arguments[0]), stop: () => m.mock.restore() }; };

test("R79: `scheduled` is the Worker's second export beside `fetch`, and is the handler of watchdog.mjs", () => {
  assert.equal(typeof entry.default.scheduled, "function");
  assert.equal(typeof mod.watchdog, "function", "watchdog.mjs exports `watchdog(controller, env)`");
  assert.deepEqual(Object.keys(entry.default).sort(), ["fetch", "scheduled"]);
});

test("R79: each of the two objects, `bio` then `scratch`, is asked once through a fresh stub, with the time the cron was scheduled for; every answer sound: it returns and says nothing", async () => {
  const w = binding({ bio: ok, scratch: ok });
  const log = logged();
  try {
    assert.equal(mod.WATCHDOG_BOUND_MS, 10_000);
    assert.deepEqual([...mod.WATCHDOG_OBJECTS], ["bio", "scratch"]);
    const c = controller();
    await entry.default.scheduled(c, w.env, { waitUntil() { throw new Error("no waitUntil work"); } });
    assert.deepEqual(w.calls, [["bio", c.scheduledTime], ["scratch", c.scheduledTime]]);
    assert.equal(w.stubs.length, 2, "a fresh stub for each");
    assert.notEqual(w.stubs[0], w.stubs[1]);
    assert.deepEqual(log.lines(), [], "a quiet success");
  } finally { log.stop(); }
});

test("R79: an object that throws is recorded in one structured line, the second is still asked, and the handler then throws so the run is a failed one", async () => {
  const w = binding({ bio: () => { throw new Error("the stub is broken"); }, scratch: ok });
  const log = logged();
  try {
    await assert.rejects(() => mod.watchdog(controller(), w.env), /bio/);
    assert.deepEqual(w.calls.map((c) => c[0]), ["bio", "scratch"], "both tried");
    assert.equal(log.lines().length, 1, "one line");
    const line = JSON.parse(log.lines()[0]);
    assert.deepEqual(line.failed.map((f) => f.object), ["bio"]);
    assert.equal(line.scheduledTime, controller().scheduledTime);
    assert.match(line.failed[0].message, /the stub is broken/);
  } finally { log.stop(); }
  /* control: the same handler with both sound does not throw */
  const fine = binding({ bio: ok, scratch: ok });
  await mod.watchdog(controller(), fine.env);
});

test("R79: an object that never answers is given the bound, then recorded busy; the second is still asked; the handler returns within the bound plus a little and throws; a late rejection of the hung call is no unhandled rejection", async () => {
  const unhandled = [];
  const onUnhandled = (e) => unhandled.push(e);
  process.on("unhandledRejection", onUnhandled);
  const w = binding({ bio: () => new Promise((_, reject) => setTimeout(() => reject(new Error("late")), 150)), scratch: ok });
  const log = logged();
  try {
    const t0 = Date.now();
    await assert.rejects(() => mod.watchdog(controller(), w.env, { bound: 40 }), /bio/);
    assert.ok(Date.now() - t0 < 120, `bounded (${Date.now() - t0} ms)`);
    assert.deepEqual(w.calls.map((c) => c[0]), ["bio", "scratch"]);
    const line = JSON.parse(log.lines()[0]);
    assert.deepEqual(line.failed.map((f) => [f.object, f.why]), [["bio", "busy"]]);
    await new Promise((r) => setTimeout(r, 300));
    assert.deepEqual(unhandled, [], "the hung call's later rejection is caught");
  } finally { log.stop(); process.off("unhandledRejection", onUnhandled); }
});

test("R79: an answer that is not an object (nothing, a string) is a broken answer and a failure; both broken: both recorded, one line", async () => {
  for (const bad of [undefined, null, "fine", 7]) {
    const w = binding({ bio: () => bad, scratch: () => bad });
    const log = logged();
    try {
      await assert.rejects(() => mod.watchdog(controller(), w.env), /bio/, String(bad));
      assert.equal(log.lines().length, 1);
      assert.deepEqual(JSON.parse(log.lines()[0]).failed.map((f) => [f.object, f.why]), [["bio", "broken"], ["scratch", "broken"]]);
    } finally { log.stop(); }
  }
});

test("R79: no STORE binding, and a binding whose stub lacks the call, are failures of their own, not a crash: the handler throws after one line", async () => {
  for (const env of [{}, { STORE: { idFromName: (n) => n, get: () => ({}) } }, { STORE: { idFromName: () => { throw new Error("no id"); }, get: () => ({}) } }]) {
    const log = logged();
    try {
      await assert.rejects(() => mod.watchdog(controller(), env));
      assert.equal(log.lines().length, 1);
    } finally { log.stop(); }
  }
});

test("R79: `wrangler.jsonc` holds exactly one cron trigger, `*/5 * * * *`", () => {
  const text = readFileSync(fileURLToPath(new URL("../../../wrangler.jsonc", import.meta.url)), "utf8")
    .split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");
  const config = JSON.parse(text);
  assert.deepEqual(config.triggers, { crons: ["*/5 * * * *"] });
});

/* ---- the object's own: the real Store, over a storage whose alarm is a variable ---- */
const D = "d".repeat(64);
const oldRow = (x, due, sha = D) => x.ctx.storage.sql.exec(
  `INSERT INTO keeps_pending (sha, kind, parts, detail, attempts, registered_at, due_at) VALUES (?, 'reading', '[]', '{}', 0, ?, ?)`, sha, due, due);
async function owedWorld({ alarm = null } = {}) {
  const x = await store({});
  let sets = 0;
  const set = x.ctx.storage.setAlarm;
  x.ctx.storage.setAlarm = async (t) => { sets++; return set(t); };
  x.asked = [];
  const { extractionOf } = await import("../../../src/extraction/index.mjs");
  const { readHeldAnswer } = await import("../extraction/fixtures.mjs");
  const readDone = await readHeldAnswer.read();   /* extraction's published read-to-its-end answer, made by its real reader */
  // fixtures-own: harness a recorder of what the ledger asks the reading owner, answering extraction's published read-to-its-end answer: "no work ran" is read from the record, the answer is the owner's own
  extractionOf(x.ctx).readHeld = async (a) => { x.asked.push(a); return readDone; };
  await x.ctx.storage.deleteAlarm();
  if (alarm !== null) await x.ctx.storage.setAlarm(alarm);
  sets = 0;
  x.sets = () => sets;
  return x;
}

test("R79 (scheduler R29): `Store.watchdog(at)` sets the alarm of an object that owes work and has none, records what it saw, and runs no work and reads no row", async () => {
  const x = await owedWorld();
  const now = Date.now(), at = now - 1000;
  oldRow(x, now - 20 * 60_000);
  assert.equal(await x.ctx.storage.getAlarm(), null);
  const said = await x.s.watchdog(at);
  assert.equal(said.rearmed, true);
  const alarm = await x.ctx.storage.getAlarm();
  assert.ok(alarm !== null && alarm >= now - 1000 && alarm <= Date.now() + 1000, "the alarm is set, at about now");
  assert.deepEqual(x.asked, [], "no work ran");
  const [row] = [...x.ctx.storage.sql.exec(`SELECT attempts, started_at FROM keeps_pending`)];
  assert.deepEqual([row.attempts, row.started_at], [0, null], "the ledger was not touched");
  assert.equal((await (await x.fetch("/owedwork?viewer=class:admin")).json()).result.watchdog_seen, at);
  /* the alarm that is set runs the row, which is the whole point */
  await x.s.onAlarm(Date.now() + 1000);
  assert.equal(x.asked.length, 1);
});

test("R79 (scheduler R29): a spent alarm, long past and never run, is set afresh; a live one in the future with a fresh run is left alone, and the watchdog still records that it came", async () => {
  const spent = await owedWorld({ alarm: Date.now() - 3 * 3_600_000 });
  oldRow(spent, Date.now() - 4 * 3_600_000);
  const a = await spent.s.watchdog(Date.now());
  assert.equal(a.rearmed, true);
  assert.ok((await spent.ctx.storage.getAlarm()) > Date.now() - 5000, "set afresh, not left in the past");

  /* an object that has just run its alarm, with its next one ahead: the daily passes done, so no work is owed */
  const live = await owedWorld();
  await live.s.onAlarm(Date.now());
  await live.ctx.storage.setAlarm(Date.now() + 60_000);
  const base = live.sets();
  const at = Date.now() - 500;
  const b = await live.s.watchdog(at);
  assert.equal(b.rearmed, false);
  assert.equal(live.sets(), base, "nothing set");
  const seen = (await (await live.fetch("/owedwork?viewer=class:admin")).json()).result;
  assert.equal(seen.watchdog_seen, at, "recorded though nothing was done");
  /* a second fire, and one 20 minutes late, change nothing further */
  await live.s.watchdog(at);
  await live.s.watchdog(Date.now() - 20 * 60_000);
  assert.equal(live.sets(), base);
  assert.equal((await (await live.fetch("/owedwork?viewer=class:admin")).json()).result.watchdog_seen, at, "never backwards");
});

test("R80: `owedwork` gives an administrator `last_run`, `alarm_at`, `stale`, `oldest_overdue` and `watchdog_seen`, with and without a digest; a member gets the counts or the entries and none of them; reading it re-arms nothing", async () => {
  const x = await owedWorld();
  const due = Date.now() - 20 * 60_000;
  oldRow(x, due);
  const ask = async (q) => (await (await x.fetch(`/owedwork?${q}`)).json()).result;
  /* R103 (fix round 9, G94): `watchdog_ran` and `running_since` beside R80's five, an administrator's only */
  const FIELDS = ["alarm_at", "last_run", "oldest_overdue", "running_since", "stale", "watchdog_ran", "watchdog_seen"];
  const admin = await ask("viewer=class:admin");
  assert.deepEqual(Object.keys(admin).filter((k) => FIELDS.includes(k)).sort(), FIELDS);
  assert.deepEqual([admin.last_run, admin.watchdog_seen, admin.running_since], [null, null, null]);
  /* R102: the request's frame looked at the lost alarm once and armed it, before the read answered */
  assert.equal(typeof admin.alarm_at, "number", "the frame's heal armed the lost alarm (R102)");
  assert.ok(admin.oldest_overdue !== null && admin.oldest_overdue <= due, "the earliest wake that has come: the ledger's row or an earlier consumer's");
  assert.equal(admin.stale, true, "work owed for over two cycles and no run");
  assert.deepEqual(admin.owed, { reading: { owed: 1, final: 0 } });
  const adminSha = await ask(`viewer=class:admin&sha=${D}`);
  assert.deepEqual(Object.keys(adminSha).filter((k) => FIELDS.includes(k)).sort(), FIELDS);
  assert.equal(adminSha.owed.length, 1);
  /* an administrator member: the session of a member whose role is `admin` (membership R64) */
  const sql = x.ctx.storage.sql;
  sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated) VALUES ('ada', 'Cover ada', 'h_ada', 'admin', 'active', '["contribute"]', 't', 't')`);
  sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated) VALUES ('ann', 'Cover ann', 'h_ann', 'member', 'active', '["contribute"]', 't', 't')`);
  const ada = await ask("viewer=member:ada");
  assert.deepEqual(Object.keys(ada).filter((k) => FIELDS.includes(k)).sort(), FIELDS, "an enrolled administrator");
  /* a member: the counts, the entries, and nothing of the stall; a caller's own `cls` makes no administrator */
  for (const q of ["viewer=member:ann", "viewer=member:ann&cls=admin", `viewer=member:ann&sha=${D}`, "viewer=class:member", "viewer=member:nobody", ""]) {
    const m = await ask(q);
    assert.deepEqual(Object.keys(m).filter((k) => FIELDS.includes(k)), [], q);
  }
  /* the reads themselves arm nothing: the one alarm set is the frame's single look in five seconds (R102), whatever the number of reads */
  assert.equal(x.sets(), 1, "one look in five seconds, by the frame; the reads are read-only");
  assert.deepEqual(x.asked, []);
});
