/* reading-pipeline G68 (fix round 7), platform check L: what each tick of a large capture costs when `read` runs as the plane's object runs
 * it, under workerd, in the object's heap. A probe, not a test (no `.test.mjs`: it boots workerd and takes minutes):
 *   node tick-work.probe.mjs <dir> csv|text|pdf <bytes-or-pages> [oldSpaceMB=112]
 * It writes a capture of that shape to <dir>/objects, bundles `read` with esbuild, serves it from workerd with the object behind a disk
 * service (fetched into the isolate by HTTP Range, as an R2 ranged `get` is), and asks for the pieces one request at a time, each
 * handed the cursor the one before answered, in one isolate with `--max-old-space-size=<oldSpaceMB>`. For every tick it prints the
 * wall time as the harness sees it (workerd freezes Date.now() in the object, R-CLOCK), the bytes the store handed out, the units and
 * the words of the piece, and the cursor's kind; and at the end the totals. The pieces are then compared with the same capture read
 * in the isolate in one piece. Recorded in build/jobs/T51/reading-pipeline.md. */
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { csvText } from "./g48-cases.mjs";
import { synthPdf } from "./bigpdf.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const [dir, kind, amount, mb = "112"] = process.argv.slice(2);
if (!dir || !["csv", "text", "pdf"].includes(kind) || !amount) { console.error("usage: tick-work.probe.mjs <dir> csv|text|pdf <bytes|pages> [oldSpaceMB]"); process.exit(2); }
const BIN = here("../../../node_modules/.bin/");
mkdirSync(join(dir, "objects"), { recursive: true });

const bytes = kind === "csv" ? Buffer.from(csvText(Number(amount), { exact: false }))
  : kind === "text" ? Buffer.from(Array.from({ length: Math.ceil(Number(amount) / 100) }, (_, i) => `line ${String(i).padStart(6, "0")} ` + "council-minutes ".repeat(5).padEnd(87, ".")).join("\n"))
  : Buffer.from(synthPdf({ pages: Number(amount), linesPerPage: 40, targetBytes: Number(process.env.PDF_BYTES || 0) }));
const digest = createHash("sha256").update(bytes).digest("hex");
writeFileSync(join(dir, "objects", digest), bytes);
const ct = kind === "csv" ? "text/csv" : kind === "text" ? "text/plain" : "application/pdf";
const format = kind === "csv" ? "csv" : kind === "text" ? "undetermined" : "pdf";

writeFileSync(join(dir, "worker.mjs"), `
import { read } from ${JSON.stringify(here("../../../src/reading-pipeline/index.mjs"))};
import { registerDoctype } from ${JSON.stringify(here("../../../../docprofile/registry.mjs"))};
import { registerDoctypes } from ${JSON.stringify(here("../../../../doctypes/index.mjs"))};
registerDoctypes(registerDoctype);
const size = ${bytes.length};
let served = 0;
export default { async fetch(req, env) {
  const u = new URL(req.url);
  if (u.pathname === "/idle") return Response.json({ ok: true });
  const evidence = {
    async head() { return { size }; },
    async get(d, options) {
      const r = options && options.range ? { offset: options.range.offset, length: Math.min(options.range.length, size - options.range.offset) } : null;
      const res = await env.DISK.fetch("http://disk/${digest}", r ? { headers: { range: "bytes=" + r.offset + "-" + (r.offset + r.length - 1) } } : {});
      const buf = await res.arrayBuffer();
      served += buf.byteLength;
      return { size, arrayBuffer: async () => buf };
    } };
  const document = { file: "x", locator: "https://a.example/x", retrieved: "2026-09-27T00:00:00Z",
    profile: { profiled_from_text: ${kind !== "pdf"}, format: { format: ${JSON.stringify(format)}, confidence: "certain", signals: [] } },
    provenance_chain: [{ who: "t", asserts: "served", via: "direct", bound: false }],
    capture: { sha256: ${JSON.stringify(digest)}, bytes: size, content_type: ${JSON.stringify(ct)}, transport: { http_headers: [] } } };
  const cursor = u.searchParams.get("cursor") || null;
  const all = u.searchParams.get("all") === "1";
  const before = served;
  const made = await read(document, { evidence, env: {}, storeName: "bio", cursor, unitsBudget: all ? Infinity : 512 * 1024,
                                      ...(all ? { maxUnits: 1e9, rangePages: 1e9 } : {}) });
  const k = made.cursor ? JSON.parse(atob(made.cursor.replace(/-/g, "+").replace(/_/g, "/"))).k : null;
  return Response.json({ ok: true, more: made.more ?? null, cursor: made.cursor ?? null, k, served: served - before,
    failure: made.reading ? (made.reading.failure ?? null) : null, refused: made.refused ?? null,
    units: (made.text_units || []).length, words: made.piece ? made.piece.words : null,
    sha: JSON.stringify(made.text_units || []).length, through: made.read_through ?? null, total: made.total ?? null });
} };`);
execFileSync(BIN + "esbuild", [join(dir, "worker.mjs"), "--bundle", "--format=esm", "--platform=neutral", "--main-fields=module,main",
  "--conditions=workerd,worker,import", "--external:node:*", `--outfile=${join(dir, "worker.bundle.mjs")}`, "--log-level=warning"]);

const port = 19000 + Math.floor(Math.random() * 900);
writeFileSync(join(dir, "config.capnp"), `using Workerd = import "/workerd/workerd.capnp";
const config :Workerd.Config = (
  services = [(name = "main", worker = .w), (name = "disk", disk = (path = ${JSON.stringify(join(dir, "objects"))}, writable = false))],
  sockets = [(name = "http", address = "127.0.0.1:${port}", http = (), service = "main")],
  v8Flags = ["--max-old-space-size=${mb}"]);
const w :Workerd.Worker = (modules = [(name = "worker", esModule = embed "worker.bundle.mjs")],
  compatibilityDate = "2026-07-01", compatibilityFlags = ["nodejs_compat"], bindings = [(name = "DISK", service = "disk")]);
`);
const p = spawn(BIN + "workerd", ["serve", join(dir, "config.capnp")], { stdio: "ignore" });
try {
  let up = false;
  for (let i = 0; i < 60 && !up; i++) { try { up = (await fetch(`http://127.0.0.1:${port}/idle`)).ok; } catch { await new Promise((r) => setTimeout(r, 200)); } }
  if (!up) throw new Error("workerd did not start");
  console.log(`${kind}: ${(bytes.length / 1048576).toFixed(2)} MiB object, old space ${mb} MB`);
  let cursor = null, n = 0, totalMs = 0, totalServed = 0, units = 0, words = 0, worst = 0;
  for (; n < 2000; n++) {
    const t0 = Date.now();
    const r = await fetch(`http://127.0.0.1:${port}/?${cursor ? "cursor=" + encodeURIComponent(cursor) : ""}`).then((x) => x.json()).catch((e) => ({ error: String(e) }));
    const ms = Date.now() - t0;
    if (!r.ok) { console.log(`tick ${n}: FAILED (${r.error || JSON.stringify(r)})`); process.exitCode = 1; break; }
    if (r.refused || r.failure) { console.log(`tick ${n}: refused/failed ${JSON.stringify(r)}`); process.exitCode = 1; break; }
    totalMs += ms; totalServed += r.served; units += r.units; words += r.words ?? 0; worst = Math.max(worst, ms);
    if (n < 4 || r.more !== true) console.log(`tick ${n}: ${ms} ms, store ${(r.served / 1048576).toFixed(2)} MiB, ${r.units} units, ${r.words} words, cursor ${r.k}, through ${r.through}/${r.total}`);
    if (r.more !== true) break;
    cursor = r.cursor;
  }
  const one = await fetch(`http://127.0.0.1:${port}/?all=1`).then((x) => x.json());
  console.log(`${n + 1} ticks: ${totalMs} ms in all, the slowest ${worst} ms, store ${(totalServed / 1048576).toFixed(1)} MiB in all (the object is ${(bytes.length / 1048576).toFixed(1)}), ${units} units, ${words} words; the one-piece read: ${one.units} units, ${one.words} words`);
  if (one.units !== units || one.words !== words) { console.log("MISMATCH with the one-piece read"); process.exitCode = 1; }
} finally { p.kill("SIGKILL"); }
