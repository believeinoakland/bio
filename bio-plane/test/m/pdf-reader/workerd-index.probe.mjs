/* pdf-reader R42/R37 (fix round 5, E2): the smallest V8 old space in which `reading-pipeline`'s `read` of a PDF completes
 * under workerd, with the text units budgeted as the index path of `extraction` budgets them (PROBE_BUDGET bytes, default
 * 2 MiB, CAPTURE_TEXT_CAPTURE_BOUND; "Infinity" for the unbudgeted read R42's rule was measured with). A probe, not a test
 * (it boots workerd and takes minutes):
 *   node workerd-index.probe.mjs <dir> dense:<pages>:<lines> | small:<annots|tagged> | file:<path> ...
 * The object's need is that old space + the file's bytes, under 128 MB less the plane's own baseline (20 MB, K4530). */
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, statSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, basename } from "node:path";
import { densePdf } from "./dense.mjs";
import { smallObjectsPdf } from "./smallobjects.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const [dir, ...specs] = process.argv.slice(2);
if (!dir || !specs.length) { console.error("usage: workerd-index.probe.mjs <dir> dense:<pages>:<lines> | small:<shape> | file:<path>..."); process.exit(2); }
const BUDGET = process.env.PROBE_BUDGET ?? String(2 * 1024 * 1024);
const BIN = here("../../../node_modules/.bin/");
mkdirSync(join(dir, "pdfs"), { recursive: true });
writeFileSync(join(dir, "worker.mjs"), `
import { read } from ${JSON.stringify(here("../../../src/reading-pipeline/index.mjs"))};
import { registerDoctype } from ${JSON.stringify(here("../../../../docprofile/registry.mjs"))};
import { registerDoctypes } from ${JSON.stringify(here("../../../../doctypes/index.mjs"))};
registerDoctypes(registerDoctype);
export default { async fetch(req, env) {
  const u = new URL(req.url);
  if (u.pathname === "/idle") return Response.json({ ok: true });
  const f = u.searchParams.get("f");
  const evidence = { async get() { const r = await env.DISK.fetch("http://disk/" + f); return { arrayBuffer: () => r.arrayBuffer() }; },
                     async head() { return { size: 1 }; } };
  const document = { file: "x", locator: "https://a.example/x.pdf", retrieved: "2026-09-27T00:00:00Z",
    profile: { profiled_from_text: false, format: { format: "pdf", confidence: "certain", signals: [] } },
    provenance_chain: [{ who: "t", asserts: "served", via: "direct", bound: false }],
    capture: { sha256: "a".repeat(64), bytes: 1, content_type: "application/pdf", transport: { http_headers: [] } } };
  const made = await read(document, { evidence, env: {}, storeName: "bio", unitsBudget: ${BUDGET === "Infinity" ? "Infinity" : Number(BUDGET)} });
  return Response.json({ ok: true, found: made.reading.found, failure: made.reading.failure ?? null, pages: made.reading.page_count ?? null, units: (made.text_units || []).length });
} };`);
execFileSync(BIN + "esbuild", [join(dir, "worker.mjs"), "--bundle", "--format=esm", "--platform=neutral", "--main-fields=module,main",
  "--conditions=workerd,worker,import", "--external:node:*", `--outfile=${join(dir, "worker.bundle.mjs")}`, "--log-level=warning"]);

async function run(file, oldSpaceMB) {
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
    return await fetch(`http://127.0.0.1:${port}/?f=${file}`).then((x) => x.json()).catch(() => null);
  } finally { p.kill("SIGKILL"); }
}
for (const spec of specs) {
  const [kind, a, b] = spec.split(":");
  let file;
  if (kind === "dense") { file = `d${a}-${b}.pdf`; writeFileSync(join(dir, "pdfs", file), densePdf({ pages: Number(a), linesPerPage: Number(b) })); }
  else if (kind === "small") { file = `s-${a}.pdf`; writeFileSync(join(dir, "pdfs", file), smallObjectsPdf(a)); }
  else { file = basename(spec.slice(5)); copyFileSync(spec.slice(5), join(dir, "pdfs", file)); }
  let lo = 16, hi = Number(process.env.PROBE_HI || 320);
  const top = await run(file, hi);
  if (!top || !top.ok) { console.log(`${file}: does not complete even with ${hi} MB of old space`); continue; }
  while (hi - lo > 4) { const mid = (lo + hi) >> 1; const r = await run(file, mid); if (r && r.ok) hi = mid; else lo = mid; }
  const mb = statSync(join(dir, "pdfs", file)).size / 1048576;
  console.log(`${file}: ${top.pages} pages, ${mb.toFixed(1)} MB, found ${top.found}${top.failure ? " (" + top.failure + ")" : ""}, ${top.units} units: completes from ${hi} MB of old space; + bytes ~ ${(hi + mb).toFixed(0)} MB (object 128, less 20 for the plane)`);
}
