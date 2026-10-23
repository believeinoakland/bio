/* plane R93 (fix round 7, G82; K4426 (4); diagnosis-R7-screens.md S4), the platform check L: DOES THE READING TICK HOLD THE OBJECT'S ONE THREAD, AND WHO OWNS THE STRETCH?
   On workerd under Miniflare, the plane's own Worker and `Store` (`r7-contention-entry.mjs`): a file is held as the capture screen files one and its
   reading is owed to the ledger, whose own alarm reads it piece by piece; while it does, twelve cheap reads (`op=whoami`, the real door) are asked at a
   time, over and over, and each is timed by THIS TEST's clock outside the object (R-CLOCK: no clock inside the object counts compute).
   Two measures are made. (1) The CONTROL: the reading owner is a stub that answers at once, so what runs is the plane's own consumer and alarm
   and nothing of a read: the cheap read's p95 is asserted under 500 ms. That is the plane's share, and it is held. (2) The REAL reads (a 12 MiB CSV, the
   17 MiB stated bound, a 21 MB PDF): the p95 and the longest wait are PRINTED, not asserted: the stretch is `readHeld`'s own (reading-pipeline's piece), a
   module this one does not own, so the assertion waits for the owner L names (G82's rule). On local workerd every isolate shares one thread, so a
   request that never enters the object (`/version`) waits as long: the number shows the longest stretch without a yield, which the object's own
   requests wait behind in production too. HEAVY: run alone, five times (a timing assertion on a shared host is flake-prone). */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { synthPdf } from "../extraction/bigpdf.mjs";

const ENTRY = fileURLToPath(new URL("./r7-contention-entry.mjs", import.meta.url));
const boot = () => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Contended", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "town", VERSION: "test", ADMIN_TOKEN: "adm-r7", DAEMON_TOKEN: "dmn-r7", PROBE_TOKEN: "prb-r7" },
  durableObjectsPersist: mkdtempSync(join(tmpdir(), "plane-r7-")),
  /* the OCR member, answering after 25 s (G67's L: the scan ticks of 29-31 s were the member's wait) */
  serviceBindings: { OCR_WORKER: async () => { await new Promise((r) => setTimeout(r, OCR_MS)); return new Response("page 1 read"); } },
});
const OCR_MS = 25_000;
const BAR_MS = 500, BURST = 12;
const pct = (a, q) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };

/** one cheap read through the real door, timed by this test's clock */
async function cheap(mf) {
  const t = performance.now();
  const r = await mf.dispatchFetch("http://x/api/?op=whoami", { headers: { authorization: "Bearer adm-r7" } });
  const body = await r.json();
  assert.equal(body.ok, true);
  return performance.now() - t;
}
/** twelve at a time, over and over, until the object owes nothing; the waits, the seconds it took, and the ledger's last run */
async function whileReading(mf, stub, sha) {
  const waits = [], t0 = performance.now();
  for (;;) {
    waits.push(...await Promise.all(Array.from({ length: BURST }, () => cheap(mf))));
    const s = await (await stub.fetch(`http://do/r7/state?sha=${sha}`)).json();
    await new Promise((r) => setTimeout(r, 25));
    if (s.pending.length === 0) return { waits, seconds: (performance.now() - t0) / 1000, last: s.last };
    assert.ok(performance.now() - t0 < 600_000, "the reading did not end in ten minutes");
  }
}
const line = (label, idle, w) => `# R93 L ${label}: cheap read idle p95 ${pct(idle, .95).toFixed(0)} ms; while the tick runs p50 ${pct(w.waits, .5).toFixed(0)} p95 ${pct(w.waits, .95).toFixed(0)} max ${Math.max(...w.waits).toFixed(0)} ms (n=${w.waits.length}, ${w.seconds.toFixed(1)} s); last run ${JSON.stringify(w.last.map((l) => [l.kind, l.outcome, l.last_ms, l.own_ms, l.wait_ms]))}`;

const mf = boot();
after(() => mf.dispose());
const ns = await mf.getDurableObjectNamespace("STORE");
const stub = ns.get(ns.idFromName("bio"));
const seed = async (name, body) => (await stub.fetch(`http://do/r7/seed?case=${name}`, body ? { method: "POST", body } : undefined)).json();
const owe = async (sha) => (await stub.fetch(`http://do/r7/owe?sha=${sha}`)).json();
await cheap(mf);   /* the Worker and the object warm */
const idle = []; for (let i = 0; i < 5; i++) idle.push(...await Promise.all(Array.from({ length: BURST }, () => cheap(mf))));

test("R93 (G82) L control: while the plane's own consumer and alarm run a reading whose owner answers at once, twelve cheap reads through the real door wait under 500 ms at p95", { timeout: 300_000 }, async () => {
  await stub.fetch("http://do/r7/stub");
  const held = await seed("csv2");
  await owe(held.sha);
  const w = await whileReading(mf, stub, held.sha);
  console.log(line("control (stub owner)", idle, w));
  assert.ok(pct(w.waits, .95) < BAR_MS, `p95 ${pct(w.waits, .95).toFixed(0)} ms`);
  assert.equal(w.last.length, 1);
  assert.equal(w.last[0].outcome, "finished");
});

/* the real reads: reported, not asserted against the bar (the stretch is reading-pipeline's); each must end, and state its own time (R91) */
for (const [name, label] of [["csv12", "a 12 MiB CSV"], ["csvmax", "the 17 MiB CSV (csv-reader's stated bound)"], ["pdf21", "a 21 MB PDF (1,300 pages)"]]) {
  test(`R93 (G82) L: ${label} is read by the object's own alarm to its end; the cheap read's wait while it does is reported`, { timeout: 900_000 }, async () => {
    const body = name === "pdf21" ? new Uint8Array(synthPdf({ pages: 1300, linesPerPage: 120, targetBytes: 21_000_000 })) : null;
    /* a file already read (the control's) is another digest in the same object: the cases differ in size and shape */
    const held = await seed(name, body);
    await stub.fetch("http://do/r7/real");   /* the real owner back */
    await owe(held.sha);
    const w = await whileReading(mf, stub, held.sha);
    console.log(line(label, idle, w));
    assert.equal(w.last.length, 1);
    assert.equal(w.last[0].outcome, "finished");
    assert.ok(w.last[0].own_ms + w.last[0].wait_ms === w.last[0].last_ms);
    assert.equal(w.last[0].last_mem, null, "workerd reports no memory: NULL, never 0 (R92)");
  });
}

test("R91 (G67) L: an `ocr` row whose owner awaits the OCR member's 25 s answer states the wait apart: `wait_ms` is the member's, `own_ms` is the row's, over the real service binding", { timeout: 120_000 }, async () => {
  const sha = "e".repeat(64);
  await stub.fetch(`http://do/r7/ocr?sha=${sha}`);
  const w = await whileReading(mf, stub, sha);
  const [last] = w.last;
  console.log(line("an ocr row awaiting the member for 25 s", idle, w));
  assert.equal(last.kind, "ocr");
  assert.equal(last.outcome, "finished");
  assert.ok(last.wait_ms >= OCR_MS - 1000 && last.wait_ms <= OCR_MS + 3000, `wait_ms ${last.wait_ms}`);
  assert.ok(last.own_ms < 2000, `own_ms ${last.own_ms}: the 10 s bar is the row's own`);
  assert.equal(last.last_ms, last.own_ms + last.wait_ms);
  /* the object's other requests were not held by the member's wait: the cheap reads stayed under the bar while it ran */
  assert.ok(pct(w.waits, .95) < BAR_MS, `p95 ${pct(w.waits, .95).toFixed(0)} ms`);
});
