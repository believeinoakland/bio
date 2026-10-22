/* reading-pipeline R40 (fix round 6, G13), platform check L: what one piece of a large text costs under workerd, in the
 * object's memory and time. A probe, not a test (no `.test.mjs`: it boots workerd and takes minutes):
 *   node text-pieces.probe.mjs <dir> <megabytes>...        (a size may be fractional; 24 is the ceiling, 24 MiB)
 * It writes <dir>/texts/t<MB>.txt (lines of exactly 100 bytes with their break, the last "ENDMARKER"), bundles `read` as the
 * plane's object runs it with esbuild, serves it from workerd with the bytes behind a disk service (fetched into the isolate
 * as an R2 get is), and for each size and each kind of call (the FIRST piece, which is the reading with its totals; a piece
 * in the MIDDLE and the LAST, each a continuation from a cursor) finds by bisection the smallest V8 old-space
 * (`--max-old-space-size`) in which the call completes and the answer is right (its first unit's text, the units' count,
 * and for the last piece ENDMARKER and `more: false`), then times it at a generous heap, wall clock outside the isolate
 * (workerd freezes the clock during synchronous work, so inside it time reads as nothing). The bytes ride beside the
 * heap as array buffers, so the object's need is that heap + the file's size, to be held under 128 MB. Prints one line per
 * call. Recorded in build/jobs/T51/reading-pipeline.md. */
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const [dir, ...sizes] = process.argv.slice(2);
if (!dir || !sizes.length) { console.error("usage: text-pieces.probe.mjs <dir> <megabytes>..."); process.exit(2); }
const BIN = here("../../../node_modules/.bin/");
const BUDGET = 2 * 1024 * 1024, MAX_UNITS = 4096;
mkdirSync(join(dir, "texts"), { recursive: true });
writeFileSync(join(dir, "worker.mjs"), `
import { read } from ${JSON.stringify(here("../../../src/reading-pipeline/index.mjs"))};
import { registerDoctype } from ${JSON.stringify(here("../../../../docprofile/registry.mjs"))};
import { registerDoctypes } from ${JSON.stringify(here("../../../../doctypes/index.mjs"))};
registerDoctypes(registerDoctype);
export default { async fetch(req, env) {
  const u = new URL(req.url);
  if (u.pathname === "/idle") return Response.json({ ok: true });
  const f = u.searchParams.get("f"), size = Number(u.searchParams.get("size")), at = Number(u.searchParams.get("at"));
  const evidence = { async get() { const r = await env.DISK.fetch("http://disk/" + f); return { arrayBuffer: () => r.arrayBuffer() }; },
                     async head() { return { size }; } };
  const sha = "a".repeat(64);
  const document = { file: "x", locator: "https://a.example/x.txt", retrieved: "2026-09-27T00:00:00Z",
    profile: { profiled_from_text: true, format: { format: "undetermined", confidence: "none", signals: [] } },
    provenance_chain: [{ who: "t", asserts: "served", via: "direct", bound: false }],
    capture: { sha256: sha, bytes: size, content_type: "text/plain", transport: { http_headers: [] } } };
  const cursor = at < 0 ? null : { sha256: sha, chars: size, offset: at * 100, para: at };
  const made = await read(document, { evidence, env: {}, storeName: "bio", unitsBudget: ${BUDGET},
                                      pieces: { cursor, maxUnits: ${MAX_UNITS} } });
  const units = made.text_units || [];
  return Response.json({ ok: !made.refused, refused: made.refused || null, units: units.length, first: units[0] && units[0].text,
                         lastText: units.length ? units[units.length - 1].text : null, more: made.piece && made.piece.more,
                         hasReading: !!made.reading, found: made.reading ? made.reading.found : null });
} };`);
execFileSync(BIN + "esbuild", [join(dir, "worker.mjs"), "--bundle", "--format=esm", "--platform=neutral", "--main-fields=module,main",
  "--conditions=workerd,worker,import", "--external:node:*", `--outfile=${join(dir, "worker.bundle.mjs")}`, "--log-level=warning"]);

const lineOf = (i) => `line ${String(i).padStart(6, "0")} ` + "council-minutes ".repeat(5).padEnd(87, ".");

async function call(file, size, at, oldSpaceMB) {
  const port = 19000 + Math.floor(Math.random() * 900);
  writeFileSync(join(dir, "config.capnp"), `using Workerd = import "/workerd/workerd.capnp";
const config :Workerd.Config = (
  services = [(name = "main", worker = .w), (name = "disk", disk = (path = ${JSON.stringify(join(dir, "texts"))}, writable = false))],
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
    const r = await fetch(`http://127.0.0.1:${port}/?f=${file}&size=${size}&at=${at}`).then((x) => x.json()).catch(() => null);
    return r ? { ...r, ms: Date.now() - t0 } : null;
  } finally { p.kill("SIGKILL"); }
}

for (const mb of sizes) {
  const bytes = Math.round(Number(mb) * 1048576);
  const n = Math.floor(bytes / 100) - 1;               /* lines before ENDMARKER; the last line is ENDMARKER, padded to 100 */
  const lines = new Array(n + 1);
  for (let i = 0; i < n; i++) lines[i] = lineOf(i);
  lines[n] = "ENDMARKER".padEnd(bytes - n * 100 - (n ? 0 : 0), " ");
  const file = `t${mb}.txt`;
  writeFileSync(join(dir, "texts", file), lines.join("\n"));
  const size = statSync(join(dir, "texts", file)).size;
  const lastAt = Math.floor(n / MAX_UNITS) * MAX_UNITS;
  for (const [what, at, right] of [
    ["first piece (the reading, with its totals)", -1, (r) => r.hasReading && r.units === MAX_UNITS && r.first === lineOf(0) && r.more === true],
    ["a piece in the middle (continuation)", Math.floor(n / 2 / MAX_UNITS) * MAX_UNITS, (r) => !r.hasReading && r.units === MAX_UNITS && r.more === true],
    ["the last piece (continuation)", lastAt, (r) => !r.hasReading && r.lastText === "ENDMARKER" && r.more === false]]) {
    const good = (r) => !!(r && r.ok && right(r));
    let lo = 16, hi = Number(process.env.PROBE_HI || 320);
    const top = await call(file, size, at, hi);
    if (!good(top)) { console.log(`${mb} MB ${what}: does not complete even with ${hi} MB of old space (${JSON.stringify(top)})`); continue; }
    while (hi - lo > 4) { const mid = (lo + hi) >> 1; if (good(await call(file, size, at, mid))) hi = mid; else lo = mid; }
    const t = await call(file, size, at, 320);
    console.log(`${mb} MB (${size} B) ${what}: completes from ${hi} MB of old space; heap + bytes ~ ${(hi + size / 1048576).toFixed(0)} MB (object limit 128); ${t.ms} ms wall incl. workerd start`);
  }
}
