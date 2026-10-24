/* plane R105 G123g (fix round 9; plan section 3, job 20; diagnosis-R8-speed.md C, 3; K4811 (7)), the platform check L: THE OBJECT STATES WHAT A TICK COST. Home takes 7.7 s and Queue 8.3 s beside a running
   tick against 2.2-3.9 s idle (G117) and the cause is not known: the instruments that name it ride the deploy. Product code in the object keeps an event-loop lag meter for the duration of a tick (a 10 ms
   interval, `max_stretch_ms`) and states, for each tick, `rows_read`, `rows_written` and `units`, NULL when unmeasured, never zero (R-CLOCK: none is a time read from the object's own clock).
   On workerd under Miniflare, with the REAL alarm (`r8-wave-kit.mjs`: the plane's own Store behind the counting door, a member's file uploaded and filed by her own acts), a 12 MB text is read by the
   object's alarm; the administrator's `owedwork&sha=` (R80) states the ledger's last runs, and the last run of the row states the four figures. The figure is PRINTED for the 12 MB text, not asserted
   (diagnosis: "the value printed (not asserted)"); that the field exists and is a number or NULL is.
   RED BY NAME until plane-2 (job 37) merges the instruments: today the run states `last_ms`, `own_ms`, `wait_ms` and `last_mem` and no stretch, no rows, no units. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { startWorld, textBytes } from "./r8-wave-kit.mjs";

const FIGURES = ["max_stretch_ms", "rows_read", "rows_written", "units"];
const world = await startWorld({ tag: "r8lag" });
after(() => world.kit.mf.dispose());
const up = await world.upload(textBytes(12_000_060), "minutes.txt", "text/plain");
const filed = await world.file(up);

test("R105 G123g L: the ledger's last run of a 12 MB text, read by the object's alarm, states max_stretch_ms, rows_read, rows_written and units, each a number or NULL (red: no field)", { timeout: 600_000 }, async () => {
  const last = await world.untilRun(filed.sha);
  assert.ok(last.length >= 1, "the alarm ran the reading's tick");
  const run = last.find((l) => l.kind === "reading") || last[0];
  const missing = FIGURES.filter((k) => !Object.hasOwn(run, k));
  console.log(`# R105 G123g L: the last run of the 12 MB text: ${JSON.stringify(Object.fromEntries(["kind", "outcome", "last_ms", ...FIGURES].map((k) => [k, run[k]])))}`);
  assert.deepEqual(missing, [], `the run states no ${missing.join(", ")}: ${JSON.stringify(run)}`);
  for (const k of FIGURES) assert.ok(run[k] === null || (Number.isFinite(run[k]) && run[k] >= 0), `${k} is NULL or a non-negative number: ${run[k]}`);
});

test("R105 G123g L (control): `last_mem` is still NULL under workerd, never 0 (R92), and the figures the instruments add do not replace the row's own times", { timeout: 600_000 }, async () => {
  const last = await world.untilRun(filed.sha);
  const run = last.find((l) => l.kind === "reading") || last[0];
  assert.equal(run.last_mem, null, "workerd reports no memory: NULL");
  assert.equal(run.last_ms, run.own_ms + run.wait_ms, "the row's time is its own plus its waits (R91)");
});
