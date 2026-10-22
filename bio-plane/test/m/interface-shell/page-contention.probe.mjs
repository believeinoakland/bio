/* interface-shell R126 (fix round 6, G30; B-21; plan rule 4), platform check L: what the front page costs a Worker that is also taking an upload, on
 * workerd. A probe, not a test (no `.test.mjs`: it boots workerd and takes a minute):
 *   node page-contention.probe.mjs <dir> [<path of an interface-shell index.mjs to measure, default this module's>]
 * It bundles the module with the real screens of the nine modules and the plane's registration of the owners' declarations
 * (`plane/register.mjs`), serves, from one isolate, the three routes control-plane's door gives the page: `GET /` (what `page()` does: the
 * script's hash for the page policy, then the page), the versioned script, and a body drained as `captureupload` drains one; then times, on
 * the wall clock OUTSIDE the isolate (workerd freezes the clock during synchronous work, so inside it reads as nothing: R-CLOCK), the first
 * `GET /` of a release (the build), the same idle, and ten `GET /` with ten script fetches while a 20 MB body is being sent. Prints one line
 * per measure. Recorded in build/jobs/T51/interface-shell.md: before (the module at `tranche/T51`) and after. */
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const [dir, shellIndex = here("../../../src/interface-shell/index.mjs")] = process.argv.slice(2);
if (!dir) { console.error("usage: page-contention.probe.mjs <dir> [<interface-shell index.mjs>]"); process.exit(2); }
mkdirSync(dir, { recursive: true });
const MODS = ["screens-settings", "screens-intake", "screens-daily", "screens-inquiry", "screens-entry", "screens-wizards", "screens-investigate", "screens-publish", "screens-action"];
writeFileSync(join(dir, "worker.mjs"), `
import ${JSON.stringify(here("../../../src/plane/register.mjs"))};
import { interfacePage, interfaceScript, interfaceScriptHash, scriptPath } from ${JSON.stringify(shellIndex)};
${MODS.map((m, i) => `import * as m${i} from ${JSON.stringify(here(`../../../src/${m}/index.mjs`))};`).join("\n")}
const mods = [${MODS.map((m, i) => `m${i}`).join(", ")}];
const SCREENS = Object.freeze(mods.flatMap((m) => m.SCREENS));
const GUIDE = mods.map((m) => m.GUIDE).find(Boolean);
const options = () => ({ guide: GUIDE, version: "r6", testInstance: false });
export default { async fetch(req) {
  const u = new URL(req.url);
  if (u.pathname === "/idle") return Response.json({ ok: true });
  if (u.pathname === "/") {
    const hash = interfaceScriptHash(SCREENS, options());
    const html = interfacePage(SCREENS, options());
    return new Response(html, { headers: { "content-type": "text/html", "x-script-hash": hash } });
  }
  if (u.pathname === scriptPath("r6")) return new Response(interfaceScript(SCREENS, options()), { headers: { "content-type": "text/javascript" } });
  if (u.pathname === "/upload") { let n = 0; for await (const c of req.body) n += c.length; return Response.json({ bytes: n }); }
  return new Response("no", { status: 404 });
} };`);
const BIN = here("../../../node_modules/.bin/");
execFileSync(BIN + "esbuild", [join(dir, "worker.mjs"), "--bundle", "--format=esm", "--platform=neutral", "--main-fields=module,main",
  "--conditions=workerd,worker,import", "--external:node:*", "--external:cloudflare:*", `--outfile=${join(dir, "worker.bundle.mjs")}`, "--log-level=warning"]);
const port = 19000 + Math.floor(Math.random() * 900);
writeFileSync(join(dir, "config.capnp"), `using Workerd = import "/workerd/workerd.capnp";
const config :Workerd.Config = (
  services = [(name = "main", worker = .w)],
  sockets = [(name = "http", address = "127.0.0.1:${port}", http = (), service = "main")],
  v8Flags = ["--max-old-space-size=128"]);
const w :Workerd.Worker = (modules = [(name = "worker", esModule = embed "worker.bundle.mjs")],
  compatibilityDate = "2026-07-01", compatibilityFlags = ["nodejs_compat"]);
`);
const child = spawn(BIN + "workerd", ["serve", join(dir, "config.capnp")], { stdio: "ignore" });
const base = `http://127.0.0.1:${port}`;
const timed = async (path) => { const t = performance.now(); const r = await fetch(base + path); const text = await r.text(); return { ms: performance.now() - t, status: r.status, bytes: text.length }; };
const stat = (xs) => { const s = xs.map((x) => x.ms).sort((a, b) => a - b); return `median ${s[s.length >> 1].toFixed(0)} ms, max ${s[s.length - 1].toFixed(0)} ms`; };
try {
  let up = false;
  for (let i = 0; i < 100 && !up; i++) { try { up = (await fetch(base + "/idle")).ok; } catch { await new Promise((r) => setTimeout(r, 200)); } }
  if (!up) throw new Error("workerd did not start");
  const first = await timed("/");
  console.log(`first GET / of a release (the build): ${first.ms.toFixed(0)} ms, ${first.status}, ${first.bytes} bytes`);
  const idle = []; for (let i = 0; i < 20; i++) idle.push(await timed("/"));
  console.log(`20 GET / idle, one at a time: ${stat(idle)}`);
  /* a 20 MB body sent in 1 MiB chunks, the way a browser sends an upload; ten pages and ten script fetches while it is going */
  const chunk = new Uint8Array(1 << 20);
  let sent = 0;
  const body = new ReadableStream({ async pull(c) { if (sent >= 20) return c.close(); c.enqueue(chunk); sent++; await new Promise((r) => setTimeout(r, 20)); } });
  const upload = fetch(base + "/upload", { method: "POST", body, duplex: "half" }).then((r) => r.json());
  await new Promise((r) => setTimeout(r, 100));
  const [pages, scripts] = await Promise.all([Promise.all(Array.from({ length: 10 }, () => timed("/"))), Promise.all(Array.from({ length: 10 }, () => timed("/app/shell-r6.js")))]);
  const done = await upload;
  console.log(`10 GET / during a ${(done.bytes / 1048576).toFixed(0)} MB upload: ${stat(pages)} (bar: HTML under 2000 ms)`);
  console.log(`10 script fetches during it: ${stat(scripts)} (bar: under 5000 ms)`);
} finally { child.kill("SIGKILL"); }
