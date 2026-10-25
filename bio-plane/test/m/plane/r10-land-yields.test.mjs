/* plane R24 (b) (fix round 10, G5; walk D2b; `diagnosis-R10-d.md` section 3; K5057; extraction's `indexUnits`), the platform check L: A TICK THAT LANDS ITS UNITS MUST YIELD BETWEEN BATCHES. `indexUnits` landed a tick's 4,096 units (8,386 statements) in one
   synchronous stretch, and a request that arrived during it waited for all of it: a 7.9 MB text read by the real alarm kept twelve `whoami` through the real door waiting p95 279 and 298 ms, max 639 and 640 ms (two runs).
   On workerd under Miniflare, the plane's own Worker and `Store` with the REAL alarm and the real reading owner (`r8-headofline-entry.mjs`, the world of `r10-lag-figure.test.mjs`): a 7.9 MB text is uploaded through the real door and
   filed as the capture screen files it, and the object's own alarm reads it, tick by tick; twelve `whoami` through the real door are asked at a time, over and over, until the reading has ended, and each is timed by THIS TEST's
   clock outside the object (R-CLOCK). The p95 is under 100 ms and the longest under 250 ms (the figure K4770 quoted for a 12 MiB read after the yields, 85 ms and 250 ms). The CONTROL is R93's own (`r7-contention.test.mjs`: the
   owner stubbed, the plane's share under 500 ms), kept. RED BY NAME until extraction's job merges (`indexUnits` yields between batches). HEAVY: run alone. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { textBytes } from "./r8-wave-kit.mjs";

const ENTRY = fileURLToPath(new URL("./r8-headofline-entry.mjs", import.meta.url));
const ADMIN = "adm-r10y", P95_MS = 100, MAX_MS = 250, BURST = 12;
const clean = (sha) => ({ capture_sha: sha, tool: "clamav", engine: "clamav", engine_version: "1.0", signatures: { main: 62, daily: 27000, bytecode: 335, published: "2026-10-08T00:00:00Z" },
  scanned_at: new Date().toISOString(), result: "clean", findings: [], latency_ms: 1 });
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Headline", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "town", VERSION: "test", ADMIN_TOKEN: ADMIN, DAEMON_TOKEN: "dmn-r10y", PROBE_TOKEN: "prb-r10y" },
  durableObjectsPersist: mkdtempSync(join(tmpdir(), "plane-r10-land-")),
  serviceBindings: { FILE_SCANNER: async (req) => {
    const u = new URL(req.url), body = req.method === "POST" ? await req.json() : null;
    if (u.pathname === "/scan") return new Response(JSON.stringify({ ok: true, verdicts: body.targets.map((t) => clean(t.capture_sha)) }), { headers: { "content-type": "application/json" } });
    if (u.pathname === "/render") return new Response(JSON.stringify({ ok: false, code: "NOT_RENDERED" }), { status: 422, headers: { "content-type": "application/json" } });
    return new Response(JSON.stringify({ ok: true, name: "file-scanner", version: "1.0.0" }), { headers: { "content-type": "application/json" } });
  } },
});
after(() => mf.dispose());
const pct = (a, q) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
const cheap = async () => {
  const t = performance.now();
  const r = await mf.dispatchFetch("http://plane/api/?op=whoami", { headers: { authorization: `Bearer ${ADMIN}` } });
  const body = await r.json();
  assert.equal(body.ok, true);
  return performance.now() - t;
};

test("R24 b L (HEAVY: run alone): a 7.9 MB text read by the object's own alarm keeps twelve whoami through the real door under 100 ms at p95 and 250 ms at most", { timeout: 900_000 }, async () => {
  const ns = await mf.getDurableObjectNamespace("STORE"), stub = ns.get(ns.idFromName("bio"));
  await cheap();   /* the Worker and the object warm */
  const token = (await (await stub.fetch("http://do/r8/session?as=member")).json()).token;
  const r = await mf.dispatchFetch(`http://plane/api?op=captureupload&statement=${encodeURIComponent("the clerk's minutes")}&name=minutes.txt&type=text%2Fplain`,
    { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/octet-stream" }, body: textBytes(7_900_060) });
  const j = await r.json(); assert.equal(r.status, 200, JSON.stringify(j).slice(0, 300));
  const up = j.result ?? j; assert.ok(up.ok !== false, JSON.stringify(up).slice(0, 300));
  const filed = await (await stub.fetch("http://do/r8/file", { method: "POST", body: JSON.stringify({ document: up.document, sha: up.capture.sha256, bytes: up.capture.bytes }) })).json();
  assert.equal(filed.ok, true, JSON.stringify(filed).slice(0, 300));
  const founder = (await (await stub.fetch("http://do/r8/session?as=founder")).json()).token;
  const sha = up.capture.sha256, waits = [], t0 = performance.now();
  for (;;) {
    waits.push(...await Promise.all(Array.from({ length: BURST }, () => cheap())));
    const r2 = await mf.dispatchFetch(`http://plane/api/?op=owedwork&sha=${sha}`, { headers: { authorization: `Bearer ${founder}` } });
    const body = (await r2.json()), b = body.result ?? body, last = (b.last || []).find((l) => l.kind === "reading");
    await new Promise((res) => setTimeout(res, 25));
    if (last && last.outcome === "finished") break;
    assert.ok(performance.now() - t0 < 600_000, "the reading did not end in ten minutes");
  }
  console.log(`# R24 b L: a 7.9 MB text read by the real alarm: twelve whoami at a time, n=${waits.length}, p50 ${pct(waits, .5).toFixed(0)} p95 ${pct(waits, .95).toFixed(0)} max ${Math.max(...waits).toFixed(0)} ms`);
  assert.ok(pct(waits, .95) < P95_MS, `p95 ${pct(waits, .95).toFixed(0)} ms (the bar is ${P95_MS})`);
  assert.ok(Math.max(...waits) < MAX_MS, `the longest ${Math.max(...waits).toFixed(0)} ms (the bar is ${MAX_MS})`);
});
