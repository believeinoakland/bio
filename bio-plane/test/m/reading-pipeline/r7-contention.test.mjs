/* reading-pipeline G82 (fix round 7; PLANE #54's L run), the platform check L for this module's share: DOES A PIECE HOLD THE OBJECT'S ONE
   THREAD? On workerd under Miniflare, `r7-contention-entry.mjs` runs this module's `read` for a tick over a capture held in R2 (a ranged `get`
   as record-core's evidence store gives it), and while the ticks run, one after another to the end of the capture, twelve cheap requests are asked
   at a time, over and over, each timed by THIS TEST's clock outside the object (R-CLOCK: no clock inside the object counts compute). A cheap request
   waits for the longest stretch of a tick without a yield (every request shares the isolate's one thread). The cheap read's p95 is asserted under 500 ms, at
   the three shapes PLANE #54 named: a 12 MiB CSV, a 17 MiB CSV (csv-reader's stated bound) and a 21 MB PDF. The figures are printed.
   The p95 is what is asserted for the CSVs and the PDF (the longest wait is printed; for a 12 MB text it is asserted too, G88, below): the longest wait at a first tick is the one stretch of csv-reader's `text` over a
   17 MiB body (about 0.7 s in node, which cannot be cut from here: provider requested in J30) and of pdf-reader's open of a PDF; a 12 MB
   text, which has neither, still shows a longest wait near 0.5 s in Miniflare, the R2 stand-in's own copy of the object included. HEAVY: run alone, five times. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { csvText } from "./g48-cases.mjs";
import { synthPdf } from "./bigpdf.mjs";
import { plainText, minutesText } from "./r7-texts.mjs";

const ENTRY = fileURLToPath(new URL("./r7-contention-entry.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"], r2Buckets: ["CAPTURES"],
});
after(() => mf.dispose());
const BAR_MS = 500, BURST = 12;
/* THE MACHINE'S SPEED, MEASURED IN THE SAME RUN (K4966: a wall-clock bar measures the machine unless the machine is measured beside it). `/spin` is a fixed amount of CPU work held in one stretch with no yield (the object's own thread, as a tick holds it);
   quiet, on the machine the figures here were taken on, it takes `SPIN_QUIET_MS`. It is asked, by this test's clock outside the object, three times before the ticks and three times after (the first of all, which warms the isolate, not counted), and the slowest is what
   one stretch of that length takes while this run goes on: `slow` is that over the quiet figure, never under 1. A cheap read waits for one stretch of a tick, so the bar is the stated 500 ms of a quiet machine times `slow`: on a busy machine the same
   stretch of work takes longer by the factor the control shows, and on a quiet one `slow` is 1 and the bar is 500 ms as before. Both are printed. */
const SPIN_QUIET_MS = 430;
const spin = async () => { const t = performance.now(); await (await mf.dispatchFetch("http://x/spin")).json(); return performance.now() - t; };
const spins = async (n) => { const a = []; for (let i = 0; i < n; i++) a.push(await spin()); return Math.max(...a); };
const barOf = (m) => BAR_MS * m.slow;
const pct = (a, q) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
const cheap = async () => { const t = performance.now(); const r = await mf.dispatchFetch("http://x/cheap"); await r.json(); return performance.now() - t; };

async function measure(label, kind, bytes) {
  const sha = createHash("sha256").update(bytes).digest("hex");
  const put = await mf.dispatchFetch(`http://x/put?sha=${sha}`, { method: "POST", body: bytes });
  assert.equal((await put.json()).ok, true);
  await cheap();
  await spin();
  const spinBefore = await spins(3);
  const idle = []; for (let i = 0; i < 4; i++) idle.push(...await Promise.all(Array.from({ length: BURST }, cheap)));
  /* the control: the wait of the same twelve cheap reads while the bucket stand-in alone reads the whole object (no read of this module's) */
  const ctl = [];
  { let d = false; const g = (async () => { for (let i = 0; i < 3; i++) await (await mf.dispatchFetch(`http://x/rawget?sha=${sha}`)).json(); d = true; })();
    while (!d) { ctl.push(...await Promise.all(Array.from({ length: BURST }, cheap))); await new Promise((r) => setTimeout(r, 5)); } await g; }
  console.log(`# G82 L control ${label}: while the bucket stand-in alone reads the whole object three times: cheap read p95 ${pct(ctl, .95).toFixed(0)} max ${Math.max(...ctl).toFixed(0)} ms`);
  const waits = [], ticks = [], store = [];
  let cursor = "", done = false;
  const reader = (async () => {
    for (let n = 0; n < 2000 && !done; n++) {
      const t = performance.now();
      const r = await (await mf.dispatchFetch(`http://x/tick?sha=${sha}&bytes=${bytes.length}&kind=${kind}&cursor=${encodeURIComponent(cursor)}`)).json();
      ticks.push(performance.now() - t); store.push(r.served);
      assert.equal(r.failure, null, JSON.stringify(r));
      assert.equal(r.refused, null, JSON.stringify(r));
      if (r.more !== true) break;
      cursor = r.cursor;
    }
    done = true;
  })();
  while (!done) { waits.push(...await Promise.all(Array.from({ length: BURST }, cheap))); await new Promise((r) => setTimeout(r, 10)); }
  await reader;
  const slow = Math.max(1, Math.max(spinBefore, await spins(3)) / SPIN_QUIET_MS);
  console.log(`# G82 L ${label} machine: the control spin (a fixed stretch, ${SPIN_QUIET_MS} ms quiet) took at most ${(slow * SPIN_QUIET_MS).toFixed(0)} ms: slow x${slow.toFixed(2)}, the bar ${(BAR_MS * slow).toFixed(0)} ms`);
  console.log(`# G82 L ${label} (${(bytes.length / 1048576).toFixed(1)} MiB, ${ticks.length} ticks): cheap read idle p95 ${pct(idle, .95).toFixed(0)} ms; while the ticks run p50 ${pct(waits, .5).toFixed(0)} p95 ${pct(waits, .95).toFixed(0)} max ${Math.max(...waits).toFixed(0)} ms (n=${waits.length}); ticks: first ${ticks[0].toFixed(0)} ms (store ${(store[0] / 1048576).toFixed(1)} MiB), the rest at most ${Math.max(...ticks.slice(1)).toFixed(0)} ms (store at most ${(Math.max(...store.slice(1)) / 1048576).toFixed(1)} MiB)`);
  return { waits, controlMax: Math.max(...ctl), slow };
}

test("G82 L: while a 12 MiB CSV is read tick by tick, twelve cheap reads at a time wait under 500 ms at p95", { timeout: 600_000 }, async () => {
  const m = await measure("a 12 MiB CSV", "csv", Buffer.from(csvText(12 * 1048576, { exact: false })));
  assert.ok(pct(m.waits, .95) < barOf(m), `p95 ${pct(m.waits, .95).toFixed(0)} ms, bar ${barOf(m).toFixed(0)} ms (slow x${m.slow.toFixed(2)})`);
});
test("G82 L: the 17 MiB CSV (csv-reader's stated bound)", { timeout: 600_000 }, async () => {
  const m = await measure("the 17 MiB CSV", "csv", Buffer.from(csvText(17 * 1048576 - 8192, { exact: false })));
  assert.ok(pct(m.waits, .95) < barOf(m), `p95 ${pct(m.waits, .95).toFixed(0)} ms, bar ${barOf(m).toFixed(0)} ms (slow x${m.slow.toFixed(2)})`);
});
/* G88 (fix round 7; R42): the longest wait, not only the p95, is asserted for a 12 MB text: the longest wait less the control's (the bucket stand-in's own
   copy of the object, printed above as the control) under the bar. Missed before because the test asserted the p95 and printed the longest: one
   second-long stretch among hundreds of samples barely moves the p95. */
const assertLongest = (label, { waits, controlMax, slow }) => {
  const max = Math.max(...waits);
  console.log(`# G88 L ${label}: longest cheap-read wait ${max.toFixed(0)} ms, control (rawget) max ${controlMax.toFixed(0)} ms, difference ${(max - controlMax).toFixed(0)} ms (bar ${(BAR_MS * slow).toFixed(0)})`);
  assert.ok(max - controlMax < BAR_MS * slow, `longest wait ${max.toFixed(0)} ms less the control ${controlMax.toFixed(0)} ms`);
};
test("G82 L, G88 R42: a 12 MB text - the p95 and the longest wait (less the control's) under 500 ms", { timeout: 600_000 }, async () => {
  const m = await measure("a 12 MB text", "text", Buffer.from(plainText()));
  assert.ok(pct(m.waits, .95) < barOf(m), `p95 ${pct(m.waits, .95).toFixed(0)} ms, bar ${barOf(m).toFixed(0)} ms (slow x${m.slow.toFixed(2)})`);
  assertLongest("a 12 MB text", m);
});
test("G88 R42: a 12 MB minutes-like text a real type reads (its parse included) - the p95 and the longest wait (less the control's) under 500 ms", { timeout: 600_000 }, async () => {
  const m = await measure("a 12 MB minutes text", "text", Buffer.from(minutesText()));
  assert.ok(pct(m.waits, .95) < barOf(m), `p95 ${pct(m.waits, .95).toFixed(0)} ms, bar ${barOf(m).toFixed(0)} ms (slow x${m.slow.toFixed(2)})`);
  assertLongest("a 12 MB minutes text", m);
});
/* G88 residual (K4768's ruling: stated, measured, not built): the read admits a text up to WHOLE_READ_MAX = 24 MiB, where one `detect` (regulation's) alone is
   one stretch of about 0.5-0.7 s. Printed, not asserted. */
test("G88 residual: a 24 MiB text - the longest wait is printed (stated, not built)", { timeout: 600_000 }, async () => {
  const m = await measure("a 24 MiB text", "text", Buffer.from(plainText(24 * 1048576 - 4096)));
  const max = Math.max(...m.waits);
  console.log(`# G88 L residual a 24 MiB text: longest cheap-read wait ${max.toFixed(0)} ms, control max ${m.controlMax.toFixed(0)} ms, difference ${(max - m.controlMax).toFixed(0)} ms (p95 ${pct(m.waits, .95).toFixed(0)})`);
});
test("G82 L: a 21 MB PDF (1,300 pages)", { timeout: 900_000 }, async () => {
  const m = await measure("a 21 MB PDF", "pdf", Buffer.from(synthPdf({ pages: 1300, linesPerPage: 120, targetBytes: 21_000_000 })));
  assert.ok(pct(m.waits, .95) < barOf(m), `p95 ${pct(m.waits, .95).toFixed(0)} ms, bar ${barOf(m).toFixed(0)} ms (slow x${m.slow.toFixed(2)})`);
});
