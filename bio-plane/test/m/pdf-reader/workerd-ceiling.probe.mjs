/* pdf-reader R42, step 0: the smallest V8 old space in which `extractPdfStructure` completes under workerd, for synthetic
 * text PDFs of stated pages and bytes (dense.mjs). A probe, not a test (it boots workerd and takes minutes):
 *   node workerd-ceiling.probe.mjs <dir> <pages>:<lines>:<padToBytes> ...
 * Each file is written to <dir>/pdfs and served by a disk service (fetched into the isolate as a store get is); the bundle
 * is built with esbuild; the smallest `--max-old-space-size` (MB) in which the read completes is found by bisection, and
 * one line per file prints pages, file MB and that heap; the object's need is that heap + the file's bytes, under 128 MB
 * less the plane's own baseline. The numbers are recorded in build/jobs/T51/pdf-reader.md. */
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { densePdf } from "./dense.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const [dir, ...specs] = process.argv.slice(2);
if (!dir || !specs.length) { console.error("usage: workerd-ceiling.probe.mjs <dir> <pages>:<lines>:<padTo>..."); process.exit(2); }
const BIN = here("../../../node_modules/.bin/");
mkdirSync(join(dir, "pdfs"), { recursive: true });
writeFileSync(join(dir, "worker.mjs"), `
import { extractPdfStructure } from ${JSON.stringify(here("../../../src/pdfstructure.mjs"))};
export default { async fetch(req, env) {
  const u = new URL(req.url);
  if (u.pathname === "/idle") return Response.json({ ok: true });
  const r = await env.DISK.fetch("http://disk/" + u.searchParams.get("f"));
  const bytes = new Uint8Array(await r.arrayBuffer());
  const st = await extractPdfStructure(bytes);
  return Response.json({ ok: true, answered: st.ok, pages: st.pages ?? null, reason: st.reason ?? null });
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
    const r = await fetch(`http://127.0.0.1:${port}/?f=${file}`).then((x) => x.json()).catch(() => null);
    if (process.env.PROBE_DEBUG) console.error(oldSpaceMB, JSON.stringify(r));
    return !!(r && r.ok && r.answered !== undefined);
  } finally { p.kill("SIGKILL"); }
}
for (const spec of specs) {
  const [pages, lines, padTo] = spec.split(":").map(Number);
  const file = `p${pages}-${lines}-${padTo || 0}.pdf`;
  writeFileSync(join(dir, "pdfs", file), densePdf({ pages, linesPerPage: lines, padTo: padTo || 0 }));
  let lo = 16, hi = Number(process.env.PROBE_HI || 320);
  if (!(await survives(file, hi))) { console.log(`${file}: does not complete even with ${hi} MB of old space`); continue; }
  while (hi - lo > 4) { const mid = (lo + hi) >> 1; if (await survives(file, mid)) hi = mid; else lo = mid; }
  const mb = statSync(join(dir, "pdfs", file)).size / 1048576;
  console.log(`${pages} pages, ${mb.toFixed(1)} MB file: completes from ${hi} MB of old space; heap + bytes ~ ${(hi + mb).toFixed(0)} MB (object limit 128)`);
}
