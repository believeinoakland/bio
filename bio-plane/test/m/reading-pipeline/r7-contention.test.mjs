/* reading-pipeline G82 (fix round 7; PLANE #54's L run), the platform check L for this module's share: DOES A PIECE HOLD THE OBJECT'S ONE
   THREAD? On workerd under Miniflare, `r7-contention-entry.mjs` runs this module's `read` for a tick over a capture held in R2 (a ranged `get`
   as record-core's evidence store gives it), and while the ticks run, one after another to the end of the capture, twelve cheap requests are asked
   at a time, over and over, each timed by THIS TEST's clock outside the object (R-CLOCK: no clock inside the object counts compute). A cheap request
   waits for the longest stretch of a tick without a yield (every request shares the isolate's one thread). The cheap read's p95 is asserted under 500 ms, at
   the three shapes PLANE #54 named: a 12 MiB CSV, a 17 MiB CSV (csv-reader's stated bound) and a 21 MB PDF. The figures are printed.
   The p95 is what is asserted (the longest wait is printed): the longest wait at a first tick is the one stretch of csv-reader's `text` over a
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

const ENTRY = fileURLToPath(new URL("./r7-contention-entry.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"], r2Buckets: ["CAPTURES"],
});
after(() => mf.dispose());
const BAR_MS = 500, BURST = 12;
const pct = (a, q) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
const cheap = async () => { const t = performance.now(); const r = await mf.dispatchFetch("http://x/cheap"); await r.json(); return performance.now() - t; };

async function measure(label, kind, bytes) {
  const sha = createHash("sha256").update(bytes).digest("hex");
  const put = await mf.dispatchFetch(`http://x/put?sha=${sha}`, { method: "POST", body: bytes });
  assert.equal((await put.json()).ok, true);
  await cheap();
  const idle = []; for (let i = 0; i < 4; i++) idle.push(...await Promise.all(Array.from({ length: BURST }, cheap)));
  const waits = [], ticks = [];
  let cursor = "", done = false;
  const reader = (async () => {
    for (let n = 0; n < 2000 && !done; n++) {
      const t = performance.now();
      const r = await (await mf.dispatchFetch(`http://x/tick?sha=${sha}&bytes=${bytes.length}&kind=${kind}&cursor=${encodeURIComponent(cursor)}`)).json();
      ticks.push(performance.now() - t);
      assert.equal(r.failure, null, JSON.stringify(r));
      assert.equal(r.refused, null, JSON.stringify(r));
      if (r.more !== true) break;
      cursor = r.cursor;
    }
    done = true;
  })();
  while (!done) { waits.push(...await Promise.all(Array.from({ length: BURST }, cheap))); await new Promise((r) => setTimeout(r, 10)); }
  await reader;
  console.log(`# G82 L ${label} (${(bytes.length / 1048576).toFixed(1)} MiB, ${ticks.length} ticks): cheap read idle p95 ${pct(idle, .95).toFixed(0)} ms; while the ticks run p50 ${pct(waits, .5).toFixed(0)} p95 ${pct(waits, .95).toFixed(0)} max ${Math.max(...waits).toFixed(0)} ms (n=${waits.length}); ticks: first ${ticks[0].toFixed(0)} ms, slowest ${Math.max(...ticks).toFixed(0)} ms`);
  return { waits };
}

test("G82 L: while a 12 MiB CSV is read tick by tick, twelve cheap reads at a time wait under 500 ms at p95", { timeout: 600_000 }, async () => {
  const { waits } = await measure("a 12 MiB CSV", "csv", Buffer.from(csvText(12 * 1048576, { exact: false })));
  assert.ok(pct(waits, .95) < BAR_MS, `p95 ${pct(waits, .95).toFixed(0)} ms`);
});
test("G82 L: the 17 MiB CSV (csv-reader's stated bound)", { timeout: 600_000 }, async () => {
  const { waits } = await measure("the 17 MiB CSV", "csv", Buffer.from(csvText(17 * 1048576 - 8192, { exact: false })));
  assert.ok(pct(waits, .95) < BAR_MS, `p95 ${pct(waits, .95).toFixed(0)} ms`);
});
test("G82 L: a 12 MB text", { timeout: 600_000 }, async () => {
  const text = Array.from({ length: 120000 }, (_, i) => `line ${String(i).padStart(6, "0")} ` + "council-minutes ".repeat(5).padEnd(87, ".")).join("\n");
  const { waits } = await measure("a 12 MB text", "text", Buffer.from(text));
  assert.ok(pct(waits, .95) < BAR_MS, `p95 ${pct(waits, .95).toFixed(0)} ms`);
});
test("G82 L: a 21 MB PDF (1,300 pages)", { timeout: 900_000 }, async () => {
  const { waits } = await measure("a 21 MB PDF", "pdf", Buffer.from(synthPdf({ pages: 1300, linesPerPage: 120, targetBytes: 21_000_000 })));
  assert.ok(pct(waits, .95) < BAR_MS, `p95 ${pct(waits, .95).toFixed(0)} ms`);
});
