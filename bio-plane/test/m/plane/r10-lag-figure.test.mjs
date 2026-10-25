/* plane R28b (fix round 10, G5; walk D4: the lag meter is blind where it matters; K5057; `store-assembly` R78, was R105; the code is the plane's until Wave B), the platform check L: A TIMER-FREE WORK FIGURE.
   `openInstruments`' 10 ms timer cannot fire inside a stretch that never yields, so a pass that held the thread answered `max_stretch_ms` NULL (live: 65 of 69 zero-time rows), and `noteLast` kept only the last run
   of a row, so the finishing pass overwrote the one that mattered. Beside the lag meter the object states `max_run_statements`, the most statements a reading's run ran between two turns of the event loop. On workerd
   under Miniflare, the plane's own Worker and `Store` with the REAL alarm (`r8-headofline-entry.mjs`): a 7.9 MB text is uploaded through the real door, filed, and read by the object's alarm, tick by tick; the
   administrator's `owedwork&sha=` is read after each pass and at the end. The row states `max_run_statements`, non-NULL and above 1,000 for the pass that wrote a tick's units; it is the maximum over the row's runs,
   so it is still there, and never lower, after the finishing pass; control: a pass that only waits (`NO_HOME`, the capture not yet filed) states its few statements. The figure is printed beside the DO analytics'
   alarm CPU for the platform check P (a 12 MB text read after the fix: the figure and the analytics agree in order of magnitude). Counts only (R-CLOCK). Heavy: run alone. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { textBytes } from "./r8-wave-kit.mjs";

const ENTRY = fileURLToPath(new URL("./r8-headofline-entry.mjs", import.meta.url));
const ADMIN = "adm-r10-lag";
const clean = (sha) => ({ capture_sha: sha, tool: "clamav", engine: "clamav", engine_version: "1.0", signatures: { main: 62, daily: 27000, bytecode: 335, published: "2026-10-08T00:00:00Z" },
  scanned_at: new Date().toISOString(), result: "clean", findings: [], latency_ms: 1 });
const live = [];
after(() => Promise.all(live.map((m) => m.dispose().catch(() => {}))));

function world() {
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Headline", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { INSTANCE_NAME: "town", VERSION: "test", ADMIN_TOKEN: ADMIN, DAEMON_TOKEN: "dmn-r10", PROBE_TOKEN: "prb-r10" },
    durableObjectsPersist: mkdtempSync(join(tmpdir(), "plane-r10-lag-")),
    serviceBindings: { FILE_SCANNER: async (req) => {
      const u = new URL(req.url), body = req.method === "POST" ? await req.json() : null;
      if (u.pathname === "/scan") return new Response(JSON.stringify({ ok: true, verdicts: body.targets.map((t) => clean(t.capture_sha)) }), { headers: { "content-type": "application/json" } });
      return new Response(JSON.stringify({ ok: true, name: "file-scanner", version: "1.0.0" }), { headers: { "content-type": "application/json" } });
    } },
  });
  live.push(mf);
  const bind = async () => { const ns = await mf.getDurableObjectNamespace("STORE"); return ns.get(ns.idFromName("bio")); };
  return { mf, bind };
}
const sessionOf = async (stub, as = "member") => (await (await stub.fetch(`http://do/r8/session?as=${as}`)).json()).token;
async function upload(mf, stub, bytes) {
  const token = await sessionOf(stub);
  const r = await mf.dispatchFetch(`http://plane/api?op=captureupload&statement=${encodeURIComponent("the clerk's minutes")}&name=minutes.txt&type=text%2Fplain`,
    { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/octet-stream" }, body: textBytes(bytes) });
  const j = await r.json(); assert.equal(r.status, 200, JSON.stringify(j).slice(0, 300));
  const up = j.result ?? j; assert.ok(up.ok !== false, JSON.stringify(up).slice(0, 300));
  return up;
}
const file = async (stub, up) => {   /* what the capture screen does after an upload: the document is filed, so the reading has a home */
  const filed = await (await stub.fetch("http://do/r8/file", { method: "POST", body: JSON.stringify({ document: up.document, sha: up.capture.sha256, bytes: up.capture.bytes }) })).json();
  assert.equal(filed.ok, true, JSON.stringify(filed).slice(0, 300));
};
const reading = async (mf, token, sha) => {
  const r = await mf.dispatchFetch(`http://plane/api/?op=owedwork&sha=${sha}`, { headers: { authorization: `Bearer ${token}` } });
  const j = await r.json(), body = j.result ?? j;
  return { owed: (body.owed || []).filter((e) => e.kind === "reading"), last: (body.last || []).find((l) => l.kind === "reading") || null };
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("R78 R28b L (control): a pass that only waits, the capture not yet filed (NO_HOME), states its few statements, never NULL and never a thousand", { timeout: 300_000 }, async () => {
  const w = world(), stub = await w.bind();
  const up = await upload(w.mf, stub, 1_000_060);
  const sha = up.capture.sha256, founder = await sessionOf(stub, "founder");
  let seen = null;
  for (let i = 0; i < 240 && !seen; i++) { const r = await reading(w.mf, founder, sha); if (r.last) seen = r.last; else await sleep(250); }
  assert.ok(seen, "the alarm ran a pass of the unfiled capture");
  console.log(`# R28b control (a waiting pass): ${JSON.stringify(seen)}`);
  assert.ok(Number.isInteger(seen.max_run_statements) && seen.max_run_statements >= 1, `a pass that ran statements states them: ${seen.max_run_statements}`);
  assert.ok(seen.max_run_statements < 1_000, `a pass that only waits ran few statements: ${seen.max_run_statements}`);
});

test("R78 R28b L (HEAVY: run alone): a 7.9 MB text read by the real alarm states max_run_statements above 1,000 for the pass that wrote a tick's units, and keeps the maximum over its runs after the finishing pass", { timeout: 900_000 }, async () => {
  const w = world(), stub = await w.bind();
  const up = await upload(w.mf, stub, 7_900_060);
  await file(stub, up);
  const sha = up.capture.sha256, founder = await sessionOf(stub, "founder");
  const seen = [];   /* one entry for each distinct run (its `at`) the polls caught */
  let end = null;
  for (let i = 0; i < 2_400 && !end; i++) {
    const r = await reading(w.mf, founder, sha);
    if (r.last && !seen.some((s) => s.at === r.last.at)) seen.push(r.last);
    if (r.last && r.last.outcome === "finished") end = r.last;
    else await sleep(250);
  }
  assert.ok(end, "the reading ran to its end");
  console.log(`# R28b 7.9 MB: ${seen.length} runs seen; ${JSON.stringify(seen.map((s) => [s.outcome, s.units, s.rows_written, s.max_stretch_ms, s.max_run_statements]))}`);
  const figures = seen.map((s) => s.max_run_statements);
  assert.ok(figures.every((f) => Number.isInteger(f) && f >= 1), `every run that ran a statement states one: ${JSON.stringify(figures)}`);
  /* a tick's units are rows (`rows_written`, the platform's cursor count; `units` is stated only by owners that state them) */
  const wrote = seen.filter((s) => (Number.isFinite(s.units) && s.units >= 1_000) || (Number.isFinite(s.rows_written) && s.rows_written >= 1_000));
  assert.ok(wrote.length >= 1, `a pass that wrote a tick's units was seen: ${JSON.stringify(seen.map((s) => [s.units, s.rows_written]))}`);
  for (const s of wrote) assert.ok(s.max_run_statements > 1_000, `the pass that wrote ${s.units ?? s.rows_written} ran ${s.max_run_statements} statements between yields`);
  assert.deepEqual(figures.map((f, i) => (i === 0 ? true : f >= figures[i - 1])), figures.map(() => true), `the row never lowers its figure: ${JSON.stringify(figures)}`);
  assert.ok(end.max_run_statements > 1_000, `after the finishing pass the row still states the maximum over its runs (${end.max_run_statements}); the finishing pass wrote ${end.rows_written} rows`);
  assert.equal(end.max_run_statements, Math.max(...figures), "the figure at the end is the largest seen");
});
