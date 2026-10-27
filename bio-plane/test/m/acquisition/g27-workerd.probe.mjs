/* acquisition R5 (fix round 6, G27), the platform check (L): the smallest V8 old space in which an object that began a render it did not wait
 * for survives the render's reply coming back and then the work that follows it (the door's read of the kept capture). A probe, not a test (it
 * boots workerd and takes minutes):
 *   node g27-workerd.probe.mjs <dir> [<srcRoot> [<replyMiB> [<laterMiB>]]]
 * Raw workerd with `v8Flags = ["--max-old-space-size=N"]` (local workerd enforces no memory limit of its own, diagnosis-R6-G4.md): the plane's
 * `acquire` is bundled with esbuild from `<srcRoot>/acquisition/index.mjs` (default: this checkout's `bio-plane/src`; pass another checkout's
 * `bio-plane/src` to measure the code before the fix) over a small stand-in for the capture store. A renderer service streams a reply of
 * `<replyMiB>` (default 42) MiB of body text from disk; the member's request waits 20 ms for it, answers, and ends; the reply returns; the
 * object then holds `<laterMiB>` (default 40) MiB of live data, standing for the read that follows. N is bisected for the smallest old
 * space in which this completes. Numbers are recorded in build/jobs/T51/acquisition.md. */
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const [dir, srcArg, replyArg, laterArg] = process.argv.slice(2);
if (!dir) { console.error("usage: g27-workerd.probe.mjs <dir> [<srcRoot> [<replyMiB> [<laterMiB>]]]"); process.exit(2); }
const SRC = resolve(srcArg || here("../../../src"));
const REPLY_MIB = Number(replyArg || 42), LATER_MIB = Number(laterArg || 40);
const BIN = here("../../../node_modules/.bin/");
mkdirSync(join(dir, "disk"), { recursive: true });

/* the renderer's reply: the page, and bodies of 7 MiB each as base64 text, written once and streamed from disk */
{
  const bodies = Math.max(1, Math.round(REPLY_MIB / 7));
  const parts = [`{"ok":true,"html":"<!doctype html><html><head><title>t</title></head><body><p>rendered</p></body></html>","elapsed_ms":9,"engine":"Chrome","engine_version":"1","viewport":{"width":1280,"height":800},"dpr":1,"locale":"en-US","timezone":"UTC","navigated_to":"https://r.example/p","status":200,"scripts":[],"wait":{"asked":{"until":"networkidle","timeout_ms":15000},"fired":"networkidle"},"requests":[`];
  for (let i = 0; i < bodies; i++) parts.push(`${i ? "," : ""}{"url":"https://r.example/a${i}.bin","type":"image","outcome":"completed","body_base64":"${Buffer.alloc(7 * 1024 * 1024, i + 1).toString("base64")}"}`);
  parts.push("]}");
  writeFileSync(join(dir, "disk", "reply.json"), parts.join(""));
}

writeFileSync(join(dir, "worker.mjs"), `
import { acquire } from ${JSON.stringify(join(SRC, "acquisition/index.mjs"))};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SHELL = "<!doctype html><html><head><title>t</title></head><body><div id=app></div></body></html>";
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");

/* the evidence store: bytes in a map (array buffers are outside the old space this probe limits) */
function evidence() {
  const held = new Map();
  return {
    held,
    async head(k) { return held.has(k) ? { key: k, size: held.get(k).length } : null; },
    async get(k, o) { if (!held.has(k)) return null; const b = o && o.range ? held.get(k).slice(o.range.offset, o.range.offset + o.range.length) : held.get(k);
      return { key: k, size: b.length, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.length) }; },
    async put(k, bytes) { held.set(k, new Uint8Array(bytes)); return { key: k }; },
  };
}
function store(env) {
  const ev = evidence(), sessions = new Map(), spends = [];
  return {
    spends, env, governor: null, provenance: null, ev,
    core: { evidenceStore: () => ev, getSetting: () => null },
    async recordSourceOutcome() { return { ok: true }; },
    sourceReachability() { return { fallback_eligible: false }; },
    saveCaptureSession(s) { sessions.set(s.session, s); return { session: s.session, saved: true, ticks: 1 }; },
    loadCaptureSession({ session }) { const s = sessions.get(session); return s ? { session, found: true, ...s } : { session, found: false }; },
    dropCaptureSession({ session }) { sessions.delete(session); return { dropped: true }; },
    liveCaptureSessions() { return []; },
    renderAdmit() { return { state: "admitted", slot: "s1" }; },
    renderSpend(x) { spends.push(x); return {}; },
    recordValidators() { return { recorded: true }; },
    validatorsOf() { return null; },
    recordCaptureActor() { return { recorded: true }; },
    recordLateAttestations() { return { recorded: true }; },
    async taskEnqueue() { return { ok: true }; },
    captureLimit() { return { observed: null, probeDue: true }; },
    recordCaptureLimit() { return {}; },
    siteAssets() { return { assets: {} }; },
    recordSiteAssets() { return {}; },
    recordLinks() { return {}; },
    subresourceStaggerMs() { return 0; },
    async emit() { return []; },
  };
}

const realFetch = globalThis.fetch;
globalThis.fetch = async (u, init) => {
  const url = String(u && u.url ? u.url : u);
  if (url === "https://r.example/p") return new Response(SHELL, { headers: { "content-type": "text/html; charset=utf-8" } });
  if (url.startsWith("https://r.example/")) return new Response("x", { status: 404 });
  return new Response("down", { status: 503 });   // the timestamp authorities and the co-archive: down, at once
};

let kept = null;
export default { async fetch(req, env) {
  const u = new URL(req.url);
  if (u.pathname === "/idle") return Response.json({ ok: true });
  const cap = store({ INSTANCE_NAME: "probe", VERSION: "0", RENDERER: env.RENDERER });
  const first = await acquire(cap, { locator: "https://r.example/p", render: true },
    { cls: "member", member: true, sessMember: "m1", storeName: "bio", renderWaitMs: 20, owedLater: async () => ({ ok: true }) });
  if (!first.body || first.body.render?.state !== "pending") return Response.json({ ok: false, why: "not deferred", status: first.status });
  /* the request has ended; the render returns (its charge is reported when it does) */
  for (let i = 0; i < 600 && !cap.spends.length; i++) await sleep(10);
  await sleep(1500);
  /* the read that follows: live data in the old space */
  const later = [];
  for (let i = 0; i < ${LATER_MIB}; i++) later.push(new Array(131072).fill(i + 0.5));
  kept = later;
  return Response.json({ ok: true, rendered: cap.spends.length, later: later.length });
} };
`);
writeFileSync(join(dir, "renderer.mjs"), `export default { async fetch(req, env) { await new Promise((r) => setTimeout(r, 100)); return env.DISK.fetch("http://disk/reply.json"); } };`);
for (const w of ["worker", "renderer"])
  execFileSync(BIN + "esbuild", [join(dir, `${w}.mjs`), "--bundle", "--format=esm", "--platform=neutral", "--main-fields=module,main",
    "--conditions=workerd,worker,import", "--external:node:*", `--outfile=${join(dir, `${w}.bundle.mjs`)}`, "--log-level=error"]);

async function survives(oldSpaceMB) {
  const port = 19000 + Math.floor(Math.random() * 900);
  writeFileSync(join(dir, "config.capnp"), `using Workerd = import "/workerd/workerd.capnp";
const config :Workerd.Config = (
  services = [(name = "main", worker = .w), (name = "renderer", worker = .r), (name = "disk", disk = (path = ${JSON.stringify(join(dir, "disk"))}, writable = false))],
  sockets = [(name = "http", address = "127.0.0.1:${port}", http = (), service = "main")],
  v8Flags = ["--max-old-space-size=${oldSpaceMB}"]);
const w :Workerd.Worker = (modules = [(name = "worker", esModule = embed "worker.bundle.mjs")],
  compatibilityDate = "2026-07-01", compatibilityFlags = ["nodejs_compat"], bindings = [(name = "RENDERER", service = "renderer")]);
const r :Workerd.Worker = (modules = [(name = "renderer", esModule = embed "renderer.bundle.mjs")],
  compatibilityDate = "2026-07-01", compatibilityFlags = ["nodejs_compat"], bindings = [(name = "DISK", service = "disk")]);
`);
  const p = spawn(BIN + "workerd", ["serve", join(dir, "config.capnp")], { stdio: "ignore" });
  try {
    let up = false;
    for (let i = 0; i < 60 && !up; i++) { try { up = (await fetch(`http://127.0.0.1:${port}/idle`)).ok; } catch { await new Promise((r) => setTimeout(r, 200)); } }
    if (!up) return false;
    const r = await fetch(`http://127.0.0.1:${port}/go`).then((x) => x.json()).catch(() => null);
    if (process.env.PROBE_DEBUG) console.error(oldSpaceMB, JSON.stringify(r));
    return !!(r && r.ok === true && r.later > 0);
  } finally { p.kill("SIGKILL"); }
}

let lo = 16, hi = Number(process.env.PROBE_HI || 512);
if (!(await survives(hi))) { console.log(`${SRC}: does not complete even with ${hi} MB of old space`); process.exit(1); }
while (hi - lo > 4) { const mid = (lo + hi) >> 1; if (await survives(mid)) hi = mid; else lo = mid; }
console.log(`${SRC}: reply ${REPLY_MIB} MiB, then ${LATER_MIB} MiB of live data: completes from ${hi} MB of old space`);
rmSync(join(dir, "config.capnp"), { force: true });
