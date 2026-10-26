/* reading-pipeline R40 for a PDF (fix round 6, G26), platform check L: the pieces of a large text-layer PDF under workerd, in the
 * object's memory. A probe, not a test (no `.test.mjs`: it boots workerd and takes minutes):
 *   node pdf-pieces.probe.mjs <dir> <file.pdf> [ballast_mb...]
 * It bundles `read` as the plane's object runs it with esbuild, serves it from workerd with the file behind a disk service
 * (fetched into the isolate as an R2 get is), reads the whole file piece by piece as extraction asks (2 MiB, 4,096 units) with a
 * `ballast_mb` megabytes of live heap standing in for the plane's own modules (the plane idles at 73-103 MB, diagnosis-R6-memory;
 * this module may not import the plane, so the L run over the real plane modules is the plane job's), and finds by bisection the
 * smallest V8 old-space (`--max-old-space-size`) in which every piece completes and the pages add up. The bytes ride beside the
 * heap as array buffers: the object needs that heap + the file's size, under 128 MB. One line per ballast. Wall time outside
 * the isolate. Recorded in build/jobs/T51/reading-pipeline.md. */
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, statSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, basename } from "node:path";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const [dir, file, ...ballasts] = process.argv.slice(2);
if (!dir || !file) { console.error("usage: pdf-pieces.probe.mjs <dir> <file.pdf> [ballast_mb...]"); process.exit(2); }
const BIN = here("../../../node_modules/.bin/");
mkdirSync(join(dir, "pdfs"), { recursive: true });
const name = basename(file);
copyFileSync(file, join(dir, "pdfs", name));
writeFileSync(join(dir, "worker.mjs"), `
import { read } from ${JSON.stringify(here("../../../src/reading-pipeline/index.mjs"))};
import { registerDoctype } from ${JSON.stringify(here("../../../../docprofile/registry.mjs"))};
import { registerDoctypes } from ${JSON.stringify(here("../../../../doctypes/index.mjs"))};
registerDoctypes(registerDoctype);
let ballast = null;
export default { async fetch(req, env) {
  const u = new URL(req.url);
  if (u.pathname === "/idle") return Response.json({ ok: true });
  const mb = Number(u.searchParams.get("ballast")) || 0;
  ballast = Array.from({ length: mb * 16384 }, (_, i) => ({ i, s: "x" + i }));   /* about 64 B an entry */
  const f = u.searchParams.get("f");
  const evidence = { async get() { const r = await env.DISK.fetch("http://disk/" + f); return { arrayBuffer: () => r.arrayBuffer() }; },
                     async head() { return { size: 1 }; } };
  const document = { file: "x", locator: "https://a.example/x.pdf", retrieved: "2026-09-27T00:00:00Z",
    profile: { profiled_from_text: false, format: { format: "pdf", confidence: "certain", signals: [] } },
    provenance_chain: [{ who: "t", asserts: "served", via: "direct", bound: false }],
    capture: { sha256: "a".repeat(64), bytes: 1, content_type: "application/pdf", transport: { http_headers: [] } } };
  let cursor = null, pieces = 0, units = 0, pages = null;
  for (let g = 0; g < 400; g++) {
    const made = await read(document, { evidence, env: {}, storeName: "bio", cursor, unitsBudget: 2097152, maxUnits: 4096 });
    if (made.refused) return Response.json({ ok: false, refused: made.refused.code });
    pieces++; units += (made.text_units || []).length; if (made.reading) pages = made.reading.page_count;
    if (made.more !== true) break;
    cursor = made.cursor;
  }
  return Response.json({ ok: true, pieces, units, pages, ballast: ballast.length });
} };`);
execFileSync(BIN + "esbuild", [join(dir, "worker.mjs"), "--bundle", "--format=esm", "--platform=neutral", "--main-fields=module,main",
  "--conditions=workerd,worker,import", "--external:node:*", `--outfile=${join(dir, "worker.bundle.mjs")}`, "--log-level=warning"]);

async function run(oldSpaceMB, ballast) {
  const port = 19000 + Math.floor(Math.random() * 900);
  writeFileSync(join(dir, "config.capnp"), `using Workerd = import "/workerd/workerd.capnp";
const config :Workerd.Config = (
  services = [(name = "main", worker = .w), (name = "disk", disk = (path = ${JSON.stringify(join(dir, "pdfs"))}, writable = false))],
  sockets = [(name = "http", address = "127.0.0.1:${port}", http = (), service = "main")],
  v8Flags = ["--max-old-space-size=${oldSpaceMB}"]);
const w :Workerd.Worker = (modules = [(name = "worker", esModule = embed "worker.bundle.mjs")],
  compatibilityDate = "2026-07-01", compatibilityFlags = ["nodejs_compat"], bindings = [(name = "DISK", service = "disk")]);
`);
  const p = spawn(BIN + "workerd", ["serve", join(dir, "config.capnp")], { stdio: "ignore" });
  try {
    let up = false;
    for (let i = 0; i < 60 && !up; i++) { try { up = (await fetch(`http://127.0.0.1:${port}/idle`)).ok; } catch { await new Promise((r) => setTimeout(r, 200)); } }
    if (!up) return null;
    const t0 = Date.now();
    const r = await fetch(`http://127.0.0.1:${port}/?f=${name}&ballast=${ballast}`).then((x) => x.json()).catch(() => null);
    return r && r.ok && r.pages ? { ...r, ms: Date.now() - t0 } : null;
  } finally { p.kill("SIGKILL"); }
}
const mb = statSync(join(dir, "pdfs", name)).size / 1048576;
for (const ballast of (ballasts.length ? ballasts : ["0"]).map(Number)) {
  let lo = 16, hi = Number(process.env.PROBE_HI || 320), best = await run(hi, ballast);
  if (!best) { console.log(`${name}: ballast ${ballast} MB: does not complete even with ${hi} MB of old space`); continue; }
  while (hi - lo > 4) { const mid = (lo + hi) >> 1; const r = await run(mid, ballast); if (r) { hi = mid; best = r; } else lo = mid; }
  console.log(`${name}: ${mb.toFixed(1)} MB file, ballast ${ballast} MB: ${best.pieces} pieces, ${best.units}/${best.pages} pages, completes from ${hi} MB of old space; heap + bytes ~ ${(hi + mb).toFixed(0)} MB (object limit 128); ${best.ms} ms in one request`);
}
