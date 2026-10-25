/* plane R24 (b2) (fix round 10, G5; K5050), the platform check L: A FILED 7.9 MB TEXT MUST NOT STALL THE OBJECT'S NEXT REQUESTS. With the reading owner's `readHeld` STUBBED to answer at once (`r10-entry.mjs`, so the
   reading is not the stall), the first firings of the object's alarm after a filing stalled a probing `whoami` 267 ms (0.5 MB), 476 ms (3 MB) and 627-697 ms (7.9 MB): size-proportional, so work on the
   document's bytes in the firing's other consumers. On workerd under Miniflare, the plane's own Worker and `Store` with the REAL alarm: a 7.9 MB text is uploaded through the real door (`POST /api?op=captureupload`)
   and filed, then a member's `whoami` is asked every 20 ms for 2 s; the longest answer (the test's own clock, outside the object, R-CLOCK) is under 150 ms. A control: the same probes before anything is filed. RED BY NAME
   until the module the profile names is fixed (see the job record). Heavy: run alone. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { textBytes } from "./r8-wave-kit.mjs";

const ENTRY = fileURLToPath(new URL("./r10-entry.mjs", import.meta.url));
const TEXT_BYTES = 7_900_060, BAR_MS = 150, PROBE_EVERY_MS = 20, PROBE_FOR_MS = Number(process.env.R10_PROBE_FOR_MS || 2_000);
const clean = (sha) => ({ capture_sha: sha, tool: "clamav", engine: "clamav", engine_version: "1.0", signatures: { main: 62, daily: 27000, bytecode: 335, published: "2026-10-08T00:00:00Z" },
  scanned_at: new Date().toISOString(), result: "clean", findings: [], latency_ms: 1 });

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Stalled", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "town", VERSION: "test", ADMIN_TOKEN: "adm-r10", DAEMON_TOKEN: "dmn-r10", PROBE_TOKEN: "prb-r10" },
  durableObjectsPersist: mkdtempSync(join(tmpdir(), "plane-r10-stall-")),
  serviceBindings: { FILE_SCANNER: async (req) => {   /* answers at once: the scan is not the stall either */
    const u = new URL(req.url), body = req.method === "POST" ? await req.json() : null;
    if (u.pathname === "/scan") return new Response(JSON.stringify({ ok: true, verdicts: body.targets.map((t) => clean(t.capture_sha)) }), { headers: { "content-type": "application/json" } });
    if (u.pathname === "/render") return new Response(JSON.stringify({ ok: false, code: "NOT_RENDERED" }), { status: 422, headers: { "content-type": "application/json" } });
    return new Response(JSON.stringify({ ok: true, name: "file-scanner", version: "1.0.0" }), { headers: { "content-type": "application/json" } });
  } },
});
after(() => mf.dispose());
const stub = async () => { const ns = await mf.getDurableObjectNamespace("STORE"); return ns.get(ns.idFromName("bio")); };
const tokenOf = async (s) => (await (await s.fetch("http://do/r8/session?as=member")).json()).token;

/** `whoami` asked every PROBE_EVERY_MS for PROBE_FOR_MS: the answers' durations by the test's own clock, and their statuses */
async function probe(token) {
  const out = [], began = Date.now(), end = began + PROBE_FOR_MS;
  while (Date.now() < end) {
    const t0 = Date.now(), r = await mf.dispatchFetch("http://plane/api/?op=whoami", { headers: { authorization: `Bearer ${token}` } });
    await r.arrayBuffer();
    out.push({ ms: Date.now() - t0, status: r.status, at: t0 - began });
    await new Promise((res) => setTimeout(res, PROBE_EVERY_MS));
  }
  return out;
}
const longest = (ps) => Math.max(...ps.map((p) => p.ms));

test("R24 b2 L (control): before anything is filed, a member's whoami asked every 20 ms for 2 s answers 200 each time and none waits as long as the bar", { timeout: 300_000 }, async () => {
  const s = await stub();
  await s.fetch("http://do/r10/stub?mode=read");
  const ps = await probe(await tokenOf(s));
  console.log(`# R24 b2 control: ${ps.length} probes, longest ${longest(ps)} ms`);
  assert.ok(ps.every((p) => p.status === 200), JSON.stringify(ps.filter((p) => p.status !== 200)));
  assert.ok(longest(ps) < BAR_MS, `the longest idle whoami was ${longest(ps)} ms`);
});

test("R24 b2 L (HEAVY: run alone): with the reading stubbed to answer at once, a 7.9 MB text uploaded and filed stalls no whoami asked every 20 ms for 2 s beyond 150 ms", { timeout: 600_000 }, async () => {
  const s = await stub();
  await s.fetch("http://do/r10/stub?mode=read");
  const token = await tokenOf(s);
  const r = await mf.dispatchFetch(`http://plane/api?op=captureupload&statement=${encodeURIComponent("the clerk's minutes")}&name=minutes.txt&type=text%2Fplain`,
    { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/octet-stream" }, body: textBytes(TEXT_BYTES) });
  const j = await r.json(); assert.equal(r.status, 200, JSON.stringify(j).slice(0, 300));
  const up = j.result ?? j;
  assert.ok(up.ok !== false, JSON.stringify(up).slice(0, 300));
  const filed = await (await s.fetch("http://do/r8/file", { method: "POST", body: JSON.stringify({ document: up.document, sha: up.capture.sha256, bytes: up.capture.bytes }) })).json();
  assert.equal(filed.ok, true, JSON.stringify(filed).slice(0, 300));
  const ps = await probe(token);
  console.log(`# R24 b2 the copy of the filed text: ${JSON.stringify(await (await s.fetch(`http://do/r10/copy?sha=${up.capture.sha256}`)).json())}`);
  const slow = ps.filter((p) => p.ms >= BAR_MS);
  console.log(`# R24 b2 7.9 MB: ${ps.length} probes, longest ${longest(ps)} ms, over the bar ${slow.length}: ${JSON.stringify(slow.slice(0, 6))}`);
  assert.ok(ps.every((p) => p.status === 200), JSON.stringify(ps.filter((p) => p.status !== 200)));
  assert.ok(longest(ps) < BAR_MS, `the longest whoami after the filing was ${longest(ps)} ms (the bar is ${BAR_MS} ms)`);
});
