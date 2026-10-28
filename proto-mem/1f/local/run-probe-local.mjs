#!/usr/bin/env node
/* proto-mem/1f (THROWAWAY): LOCAL run of the PROBE Worker (probe/src/routes.mjs through probe/src/local.mjs) in workerd via Miniflare 4.20260722 on this machine.
   What it shows: that the deployable probe's routes work, and what the L1 byte pass / R2-to-process transfer cost on a LOCAL workerd with LOCAL disk R2. What it cannot show: a Cloudflare container's start,
   its network path, R2 latency, request-body caps, the 128 MB isolate limit (not enforced locally), billing. Every number is LOCAL, not platform.
   node run-probe-local.mjs --what=bytepass --fix=/home/user/fix1f --out=../results/l1-bytepass-local.json [--only=REGEX] [--max-mib=120]
   node run-probe-local.mjs --what=transfer --out=../results/pm17-transfer-local.json [--sizes=10,50,100]
   node run-probe-local.mjs --what=reader --fix=... --out=... [--only=REGEX]      the probe's /reader route against the vendored reader server (Worker-side readAll/windows + readRecords) */
import { Miniflare } from "../../../bio-plane/node_modules/miniflare/dist/src/index.js";
import { build } from "../../../bio-plane/node_modules/esbuild/lib/main.js";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, statSync, rmSync, readdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { createServer } from "node:net";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { treeOf } from "./proc-tree.mjs";
import { specOf } from "../cases.mjs";
const here = dirname(fileURLToPath(import.meta.url));
const a = Object.fromEntries(process.argv.slice(2).map((x) => { const [k, ...v] = x.replace(/^--/, "").split("="); return [k, v.join("=") || "1"]; }));
const fix = a.fix || "/home/user/fix1f", only = a.only ? new RegExp(a.only) : null, what = a.what || "bytepass";
const TOKEN = randomBytes(24).toString("hex");   /* local throwaway, never printed */
const dist = join(here, "dist"); mkdirSync(dist, { recursive: true });
await build({ entryPoints: [join(here, "../probe/src/local.mjs")], bundle: true, format: "esm", platform: "neutral", target: "es2022", outfile: join(dist, "probe-local.mjs"), logLevel: "error", mainFields: ["module", "main"] });
const script = readFileSync(join(dist, "probe-local.mjs"), "utf8");
const freePort = () => new Promise((res) => { const s = createServer().listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); }); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rssOf = (pid) => { try { return Number(readFileSync(`/proc/${pid}/status`, "utf8").match(/^VmRSS:\s+(\d+) kB/m)[1]) / 1024; } catch { return 0; } };
const hwmReset = (pid) => { try { writeFileSync(`/proc/${pid}/clear_refs`, "5"); return true; } catch { return false; } };
const hwmOf = (pid) => { try { return Number(readFileSync(`/proc/${pid}/status`, "utf8").match(/^VmHWM:\s+(\d+) kB/m)[1]) / 1024; } catch { return 0; } };
const workerdPids = () => treeOf(process.pid).filter((p) => { try { return /workerd/.test(readFileSync(`/proc/${p}/cmdline`, "utf8").split("\0")[0]); } catch { return false; } });
const r1 = (x) => Math.round(x * 10) / 10;
async function boot(persist, env = {}) {
  const port = await freePort(); const mf = new Miniflare({ log: undefined, host: "127.0.0.1", port, workers: [{ name: "probe", modules: true, script, scriptPath: join(dist, "probe-local.mjs"), modulesRoot: "/", compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    bindings: { PROBE_TOKEN: TOKEN, LOCAL_TEST: "1", PROBE_NAME: "local", PROBE_MAX_GEN: String(700 * 1048576), ...env }, r2Buckets: ["PROBE_R2"], outboundService: async (req) => { const h = new URL(req.url).hostname; if (h !== "127.0.0.1") return new Response("no network", { status: 599 }); try { const r = await fetch(req.url, { method: req.method, headers: req.headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body, duplex: "half" }); return new Response(r.body, { status: r.status, headers: r.headers }); } catch (e) { return new Response("local forward failed: " + String(e.cause?.message || e.message), { status: 598 }); } } }], r2Persist: persist + "/r2" });
  await mf.ready; mf.__port = port; return mf;
}
const call = async (mf, path, init = {}) => { const t0 = performance.now(); const r = await mf.dispatchFetch("http://probe.local" + path, { ...init, headers: { authorization: "Bearer " + TOKEN, ...(init.headers || {}) } }); const text = await r.text(); let body; try { body = JSON.parse(text); } catch { body = text.slice(0, 300); } return { status: r.status, client_wall_ms: Math.round(performance.now() - t0), body }; };
async function measured(mf, fn) {
  const pids = workerdPids(); const sums = () => pids.reduce((s, p) => s + rssOf(p), 0);
  await sleep(500); const base = sums(); pids.forEach(hwmReset); let peak = base; const iv = setInterval(() => { peak = Math.max(peak, sums()); }, 5);
  const v = await fn(); clearInterval(iv); peak = Math.max(peak, sums()); const hwm = pids.reduce((s, p) => s + hwmOf(p), 0);
  return { value: v, workerd_processes: pids.length, rss_before_mb: r1(base), rss_peak_sampled_mb: r1(peak), rss_hwm_sum_mb: r1(hwm), peak_above_before_mb: r1(Math.max(peak, hwm) - base) };
}
const out = { when: new Date().toISOString(), label: "LOCAL, not platform", what, command: `node proto-mem/1f/local/run-probe-local.mjs ${process.argv.slice(2).join(" ")}`, miniflare: "4.20260722.0 (workerd 1.20260722.1 per proto-mem/README.md)", node: process.version, results: [] };
const save = () => writeFileSync(a.out, JSON.stringify(out, null, 1));

if (what === "bytepass") {
  const files = readFileSync(join(fix, "MANIFEST.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).filter((m) => m.token && m.kind && !m.fmt && (!only || only.test(m.file)) && m.bytes <= Number(a["max-mib"] || 120) * 1048576);
  const persist = mkdtempSync(join(tmpdir(), "p1f-")); let mf = await boot(persist); const bucket = await mf.getR2Bucket("PROBE_R2");
  for (const m of files) await bucket.put(m.file.split("/").pop(), readFileSync(m.file));
  await mf.dispose();
  for (const m of files) for (const mode of ["windows", "stream"]) {
    const key = m.file.split("/").pop(); mf = await boot(persist); await call(mf, "/health");
    const r = await measured(mf, () => call(mf, `/bytepass?key=${encodeURIComponent(key)}&mode=${mode}&token=${encodeURIComponent(m.token)}`)); const b = r.value.body;
    out.results.push({ key, kind: m.kind, enc: m.enc, mode, file_bytes: m.bytes, expect_rows: m.rows, completed: !!(b && b.ok), sha_match: b && b.sha256 === m.sha256, newlines: b && b.newlines, token_found: b && b.token_found_at != null, windows: b && b.windows,
      client_wall_ms: r.value.client_wall_ms, worker_perf_now_ms: b && b.worker_perf_now_ms, workerd_processes: r.workerd_processes, rss_before_mb: r.rss_before_mb, rss_peak_mb: r1(Math.max(r.rss_peak_sampled_mb, r.rss_hwm_sum_mb)), peak_above_before_mb: r.peak_above_before_mb });
    console.error(key, mode, "->", r.value.client_wall_ms, "ms, +", r.peak_above_before_mb, "MB"); await mf.dispose(); save();
  }
  rmSync(persist, { recursive: true, force: true });
} else if (what === "transfer" || what === "reader") {
  const sinkPort = await freePort(), readerPort = await freePort();
  const sink = spawn(process.execPath, [join(here, "../probe/image-min/server.mjs")], { env: { ...process.env, PORT: String(sinkPort), HOST: "127.0.0.1" }, stdio: "ignore" });
  const rd = spawn(process.execPath, [join(here, "serve.mjs")], { env: { ...process.env, PORT: String(readerPort) }, stdio: "ignore" });
  for (let i = 0; i < 100; i++) { try { await fetch(`http://127.0.0.1:${sinkPort}/ping`); await fetch(`http://127.0.0.1:${readerPort}/nothing`); break; } catch { await sleep(50); } }
  const persist = mkdtempSync(join(tmpdir(), "p1f-")); let mf = await boot(persist, { SINK_URL: `http://127.0.0.1:${sinkPort}`, SINK_URL_READER: `http://127.0.0.1:${readerPort}` });
  if (what === "transfer") {
    const sizes = String(a.sizes || "10,50,100").split(",").map(Number);
    for (const mib of sizes) out.results.push({ step: "gen", mib, ...(await call(mf, `/gen?key=r${mib}mib&bytes=${mib * 1048576}&kind=random&salt=${mib}`)) });
    await mf.dispose(); mf = await boot(persist, { SINK_URL: `http://127.0.0.1:${sinkPort}`, SINK_URL_READER: `http://127.0.0.1:${readerPort}` });
    const urlBase = `http://127.0.0.1:${mf.__port}/r2obj?key=`;
    for (const mib of sizes) for (const route of ["push&mode=stream", "push&mode=windows", "pull"]) for (let i = 0; i < 3; i++) {
      const [r, extra] = route.split("&"); const pull = r === "pull" ? `&urlBase=${encodeURIComponent(urlBase)}` : "";
      const m = await measured(mf, () => call(mf, `/${r}?which=min&inst=i0&key=r${mib}mib${extra ? "&" + extra : ""}${pull}`));
      const b = m.value.body; out.results.push({ step: route, mib, i, ok: b && b.ok, client_wall_ms: m.value.client_wall_ms, container_first_byte_ms: b?.container?.first_byte_ms, container_total_ms: b?.container?.total_ms, container_bytes: b?.container?.bytes, sha256: (b?.container?.sha256 || "").slice(0, 16), sink_rss_mb: b?.container?.rss_mb,
        mb_per_s_client: b?.container?.bytes ? r1(b.container.bytes / 1048576 / (m.value.client_wall_ms / 1000)) : null, workerd_peak_above_before_mb: m.peak_above_before_mb, error: b && b.ok === false ? b : undefined });
      console.error(route, mib, i, m.value.client_wall_ms, "ms"); save();
    }
  } else {
    const files = readdirSync(fix).filter((f) => specOf(f) && (!only || only.test(f))).sort(); const bucket = await mf.getR2Bucket("PROBE_R2");
    for (const f of files) await bucket.put(f, readFileSync(join(fix, f))); await mf.dispose();
    for (const f of files) {
      const s = specOf(f); mf = await boot(persist, { SINK_URL: `http://127.0.0.1:${sinkPort}`, SINK_URL_READER: `http://127.0.0.1:${readerPort}` }); await call(mf, "/health");
      const q = new URLSearchParams({ key: f, kind: s.kind, ...(s.to ? { to: s.to } : {}), ...(s.route === "archive" ? { name: f } : {}) });
      const m = await measured(mf, () => call(mf, `/reader/${s.route}?${q}`, { method: "POST" })); const b = m.value.body;
      out.results.push({ key: f, set: s.set, route: s.route, kind: s.kind, file_bytes: statSync(join(fix, f)).size, http: m.value.status, outcome: b?.refusal ? `refused:${b.refusal.code}` : b?.error ? `error:${b.error}` : b?.ok ? "completed" : "failed", client_wall_ms: m.value.client_wall_ms, worker_r2_read_all_ms: b?.r2_read_all_ms, first_record_ms: b?.first_record_ms, total_ms: b?.total_ms, records: b?.records, payload_bytes: b?.payload_bytes, refusal: b?.refusal, workerd_peak_above_before_mb: m.peak_above_before_mb, workerd_rss_peak_mb: r1(Math.max(m.rss_peak_sampled_mb, m.rss_hwm_sum_mb)) });
      console.error(f, m.value.client_wall_ms, "ms +", m.peak_above_before_mb, "MB"); await mf.dispose(); save();
    }
  }
  sink.kill("SIGKILL"); rd.kill("SIGKILL"); await mf.dispose().catch(() => {}); rmSync(persist, { recursive: true, force: true });
}
save(); console.error("wrote", a.out); process.exit(0);
