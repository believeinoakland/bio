/* pdf-reader R43 (fix round 6, G26): the smallest V8 old space in which `extractPdfRange` reads a whole PDF N pages a call
 * under workerd (every range in turn, the file's bytes held once beside), a probe, not a test (it boots workerd):
 *   node workerd-range.probe.mjs <dir> <pdf path> [pagesPerCall=100]
 * The object's need is that old space + the file's bytes, under 128 MB less the plane's own baseline. */
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, statSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, basename } from "node:path";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const [dir, path, n = "100"] = process.argv.slice(2);
if (!dir || !path) { console.error("usage: workerd-range.probe.mjs <dir> <pdf> [pages per call]"); process.exit(2); }
const BIN = here("../../../node_modules/.bin/");
mkdirSync(join(dir, "pdfs"), { recursive: true });
writeFileSync(join(dir, "worker.mjs"), `
import { extractPdfRange } from ${JSON.stringify(here("../../../src/pdfstructure.mjs"))};
export default { async fetch(req, env) {
  const u = new URL(req.url);
  if (u.pathname === "/idle") return Response.json({ ok: true });
  const r = await env.DISK.fetch("http://disk/" + u.searchParams.get("f"));
  const bytes = new Uint8Array(await r.arrayBuffer());
  const count = Number(u.searchParams.get("n"));
  let pages = 0, chars = 0, slowest = 0, calls = 0;
  for (let from = 0; ; from += count) {
    const t0 = Date.now();
    const x = await extractPdfRange(bytes, { from, count });
    slowest = Math.max(slowest, Date.now() - t0); calls++;
    pages = x.pages; chars += x.text.counts.chars;
    if (x.count === 0 || from + count >= x.pages) break;
  }
  return Response.json({ ok: true, pages, chars, calls, slowest });
} };`);
execFileSync(BIN + "esbuild", [join(dir, "worker.mjs"), "--bundle", "--format=esm", "--platform=neutral", "--main-fields=module,main",
  "--conditions=workerd,worker,import", "--external:node:*", `--outfile=${join(dir, "worker.bundle.mjs")}`, "--log-level=warning"]);
const file = basename(path);
copyFileSync(path, join(dir, "pdfs", file));
async function run(oldSpaceMB) {
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
    return await fetch(`http://127.0.0.1:${port}/?f=${file}&n=${n}`).then((x) => x.json()).catch(() => null);
  } finally { p.kill("SIGKILL"); }
}
let lo = 16, hi = Number(process.env.PROBE_HI || 320);
const top = await run(hi);
if (!top || !top.ok) { console.log(`${file}: does not complete even with ${hi} MB of old space`); process.exit(1); }
while (hi - lo > 4) { const mid = (lo + hi) >> 1; const r = await run(mid); if (r && r.ok) hi = mid; else lo = mid; }
const mb = statSync(join(dir, "pdfs", file)).size / 1048576;
console.log(`${file}: ${top.pages} pages, ${mb.toFixed(1)} MB, ${top.calls} calls of ${n}, slowest ${top.slowest} ms, ${top.chars} chars: completes from ${hi} MB of old space; + bytes ~ ${(hi + mb).toFixed(0)} MB (object 128, less 20 for the plane: 108)`);
