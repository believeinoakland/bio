/* plane R28b (fix round 10, G5; K5057; `store-assembly` R78, was R105; the code is the plane's until Wave B): THE TIMER-FREE WORK FIGURE, at the module's interface, over the real `Store` on the suite's storage. Beside the lag meter
   (`max_stretch_ms`, which a 10 ms timer cannot beat inside a stretch that never yields, so a pass of that kind answered NULL: 65 of 69 zero-time rows live), a reading's run states the most statements it ran between two
   turns of the event loop, `max_run_statements`: non-NULL for any pass that ran a statement, a stretch that never yields counted whole, a yield ending the count; a row keeps the largest over all its runs, so a later and
   smaller pass does not lower it; NULL when no statement was measured, never zero. The reading owner is a scripted double of the reader contract (`readHeld`) that runs the statements the test says. The real
   alarm on workerd with a 7.9 MB text is `r10-lag-figure.test.mjs`. */
import "../../../src/plane/register.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { store } from "./fixture.mjs";
import { bucketStandIn } from "../case-carriage/fixture.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { pendingOf } from "../../../src/plane/pending.mjs";

const sha = (b) => createHash("sha256").update(b).digest("hex");
const yields = () => new Promise((r) => setTimeout(r, 1));   /* a turn of the event loop */
async function world(readAnswer) {
  const x = await store({ env: { CAPTURES: bucketStandIn() } });
  // fixtures-own: synthetic the reader is a driver that runs a stated number of statements in a stated number of stretches; the figure under test is the plane's count of them, not anything the answer says
  extractionOf(x.ctx).readHeld = readAnswer;
  x.jobs = pendingOf(x.ctx);
  x.runs = (d) => x.jobs.ledgerLast({ sha: d }).filter((l) => l.kind === "reading");
  x.fire = (at) => x.s.onAlarm(at);
  x.statements = (n) => { for (let i = 0; i < n; i++) x.ctx.storage.sql.exec("SELECT 1 AS one"); };
  return x;
}

test("R78 R28b: a pass that runs 1,500 statements and never yields states them all, where the lag meter's stretch has nothing to say", async () => {
  let x;
  x = await world(async () => { x.statements(1_500); return { ok: true, read: true, counters: { written: 4_096 } }; });
  const d = sha("a pass that never yields");
  x.jobs.registerJob({ kind: "reading", sha: d });
  await x.fire(Date.now() + 1_000);
  const [last] = x.runs(d);
  assert.ok(last, "the pass was recorded");
  assert.ok(Number.isInteger(last.max_run_statements) && last.max_run_statements >= 1_500, `max_run_statements ${last.max_run_statements}`);
  assert.equal(last.units, 4_096);
});

test("R78 R28b: a yield ends the count: two stretches of 700 statements with a turn of the event loop between them state 700 and not 1,400", async () => {
  let x;
  x = await world(async () => { x.statements(700); await yields(); x.statements(700); return { ok: true, read: true, counters: { written: 1 } }; });
  const d = sha("a pass that yields once");
  x.jobs.registerJob({ kind: "reading", sha: d });
  await x.fire(Date.now() + 1_000);
  const [last] = x.runs(d);
  assert.ok(last.max_run_statements >= 700 && last.max_run_statements < 1_000, `max_run_statements ${last.max_run_statements}`);
});

test("R78 R28b: a row keeps the largest figure over all its runs: a later and smaller pass does not lower it", async () => {
  let x, pass = 0;
  x = await world(async () => { pass++; x.statements(pass === 1 ? 1_200 : 30); return pass < 3 ? { ok: true, read: false, more: true, counters: { written: pass } } : { ok: true, read: true, counters: { written: 9 } }; });
  const d = sha("a reading of three passes");
  x.jobs.registerJob({ kind: "reading", sha: d });
  const seen = [];
  for (let i = 0; i < 3; i++) { await x.fire(Date.now() + 1_000 + i * 7_200_000); seen.push(x.runs(d)[0] && x.runs(d)[0].max_run_statements); }
  assert.equal(pass, 3, "three passes were made");
  assert.ok(seen[0] >= 1_200, `the first pass ${seen[0]}`);
  assert.deepEqual(seen.slice(1).map((v) => v >= seen[0]), [true, true], `the figure after each later and smaller pass: ${JSON.stringify(seen)}`);
});

test("R78 R28b (control): a pass that only waits (NO_HOME) states its few statements; a row that ran none is NULL, never zero", async () => {
  let x;
  x = await world(async () => ({ ok: true, read: false, why: "NO_HOME" }));
  const d = sha("a capture with no home yet");
  x.jobs.registerJob({ kind: "reading", sha: d });
  await x.fire(Date.now() + 1_000);
  const [last] = x.runs(d);
  assert.ok(last, "the waiting pass was recorded");
  assert.ok(last.max_run_statements === null || (last.max_run_statements >= 1 && last.max_run_statements < 100), `a waiting pass ran few statements: ${last.max_run_statements}`);
  /* an unmeasured run: the row noted at its end as `final` states no figure at all */
  const y = await world(async () => ({ ok: true, read: true }));
  const e = sha("a row ended without a run");
  y.ctx.storage.sql.exec(`INSERT INTO keeps_last (sha, kind, outcome, at) VALUES (?, 'reading', 'final', 1)`, e);
  assert.equal(y.runs(e)[0].max_run_statements, null);
});
