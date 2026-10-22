/* reading-pipeline R37 (F10), step 0: how large a whole PDF `read` holds within the object's 128 MB, measured under workerd.
 * A probe, not a test (no `.test.mjs`: it boots workerd and takes minutes): `node workerd-ceiling.probe.mjs <dir> <file>...`
 * where <dir> is a scratch directory and each <file> a name in <dir>/pdfs (write them with `bigpdf.mjs`'s synthPdf).
 * It bundles `read` (as the plane's object runs it) with esbuild, serves it from workerd with the document's bytes behind a
 * disk service (fetched into the isolate as an R2 get is), and for each file finds by bisection the smallest V8 old-space
 * (`--max-old-space-size`) in which the read completes. The bytes ride beside the heap as array buffers, so the object's
 * need is that heap + the file's size, to be held under 128 MB (less the plane's own baseline). Prints one line per file.
 * Recorded in build/jobs/T51/cause-reading-4.md; WHOLE_READ_MAX in index.mjs is chosen from it. */
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const [dir, ...files] = process.argv.slice(2);
if (!dir || !files.length) { console.error("usage: workerd-ceiling.probe.mjs <dir> <pdf file in <dir>/pdfs>..."); process.exit(2); }
const BIN = here("../../../node_modules/.bin/");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "worker.mjs"), `
import { read } from ${JSON.stringify(here("../../../src/reading-pipeline/index.mjs"))};
import { registerDoctype } from ${JSON.stringify(here("../../../../docprofile/registry.mjs"))};
import { registerDoctypes } from ${JSON.stringify(here("../../../../doctypes/index.mjs"))};
registerDoctypes(registerDoctype);
export default { async fetch(req, env) {
  const u = new URL(req.url);
  if (u.pathname === "/idle") return Response.json({ ok: true });
  const f = u.searchParams.get("f"), size = Number(u.searchParams.get("size"));
  const evidence = { async get() { const r = await env.DISK.fetch("http://disk/" + f); return { arrayBuffer: () => r.arrayBuffer() }; },
                     async head() { return { size: 1 }; } };
  const document = { file: "x", locator: "https://a.example/x.pdf", retrieved: "2026-09-27T00:00:00Z",
    profile: { profiled_from_text: false, format: { format: "pdf", confidence: "certain", signals: [] } },
    provenance_chain: [{ who: "t", asserts: "served", via: "direct", bound: false }],
    capture: { sha256: "a".repeat(64), bytes: 1, content_type: "application/pdf", transport: { http_headers: [] } } };
  const made = await read(document, { evidence, env: {}, storeName: "bio", unitsBudget: Infinity });
  return Response.json({ ok: true, found: made.reading.found, failure: made.reading.failure ?? null, pages: made.reading.page_count, units: (made.text_units || []).length });
} };`);
execFileSync(BIN + "esbuild", [join(dir, "worker.mjs"), "--bundle", "--format=esm", "--platform=neutral", "--main-fields=module,main",
  "--conditions=workerd,worker,import", "--external:node:*", `--outfile=${join(dir, "worker.bundle.mjs")}`, "--log-level=warning"]);

async function survives(file, oldSpaceMB) {
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
    if (!up) return false;
    const size = statSync(join(dir, "pdfs", file)).size;
    const r = await fetch(`http://127.0.0.1:${port}/?f=${file}&size=${size}`).then((x) => x.json()).catch(() => null);
    if (process.env.PROBE_DEBUG) console.error(oldSpaceMB, JSON.stringify(r)); return !!(r && r.ok && r.pages);
  } finally { p.kill("SIGKILL"); }
}
for (const f of files) {
  let lo = 24, hi = Number(process.env.PROBE_HI || 320);
  if (!(await survives(f, hi))) { console.log(`${f}: does not complete even with ${hi} MB of old space`); continue; }
  while (hi - lo > 6) { const mid = (lo + hi) >> 1; if (await survives(f, mid)) hi = mid; else lo = mid; }
  const mb = statSync(join(dir, "pdfs", f)).size / 1048576;
  console.log(`${f}: ${mb.toFixed(1)} MB file, completes from ${hi} MB of old space; heap + bytes ~ ${(hi + mb).toFixed(0)} MB (object limit 128)`);
}
