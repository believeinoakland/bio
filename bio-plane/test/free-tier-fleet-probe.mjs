#!/usr/bin/env node
/* CPDF-7 / D-118 reproduction probe — NOT part of the battery.
 *
 * Answers, by MEASUREMENT against the project's own Cloudflare account and its
 * own egress (not by reading a pricing page): is this account on Workers Free,
 * and does Free permit a SECOND Worker script + a SERVICE BINDING between two
 * Workers, and what does a cross-Worker call cost? Full writeup and the numbers
 * are in docs/development/MEASUREMENTS.md (the 2026-07-31 CPDF-7 section).
 *
 * It deploys THROWAWAY Workers (cpdf7-probe-*), measures, and DELETES them in a
 * finally, confirming teardown by re-listing scripts. It never touches the real
 * scripts (biosmoke7, civicos, newgroup) — their names are a hard guard — and
 * attaches no R2 binding. The token is read from .env (CLOUDFLARE_API_TOKEN, or
 * CF_TOKEN) and CF_ACCT, and is NEVER printed.
 *
 * usage:  node bio-plane/test/free-tier-fleet-probe.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

function loadEnv() {
  const merged = { ...process.env };
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 6; i++) {
    const p = join(dir, ".env");
    if (existsSync(p)) {
      for (const line of readFileSync(p, "utf8").split("\n")) {
        const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line);
        if (m && merged[m[1]] === undefined) merged[m[1]] = m[2];
      }
      break;
    }
    dir = dirname(dir);
  }
  return merged;
}

const env = loadEnv();
const TOK = env.CLOUDFLARE_API_TOKEN || env.CF_TOKEN;
const ACCT = env.CF_ACCT || env.CLOUDFLARE_ACCOUNT_ID || "20b533579290b9b93168345edd3b7f72";
if (!TOK) { console.error("no CLOUDFLARE_API_TOKEN / CF_TOKEN in env or .env"); process.exit(2); }

const base = `https://api.cloudflare.com/client/v4/accounts/${ACCT}`;
const AUTH = { authorization: `Bearer ${TOK}` };
const CALLEE = "cpdf7-probe-callee";
const CALLER = "cpdf7-probe-caller";
const CPUNAME = "cpdf7-cpu-probe";
const PROBE = randomBytes(16).toString("hex");

const PROTECT = new Set(["biosmoke7", "civicos", "newgroup"]);
for (const n of [CALLEE, CALLER, CPUNAME]) {
  if (PROTECT.has(n)) { console.error(`refuse: throwaway name ${n} collides with a real script`); process.exit(1); }
}

async function api(method, path, opt = {}) {
  const r = await fetch(base + path, { method, headers: { ...AUTH, ...(opt.headers || {}) }, body: opt.body });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch {}
  return { status: r.status, ok: r.ok, success: j?.success, result: j?.result, errors: j?.errors };
}
function upload(source, meta) {
  const fd = new FormData();
  fd.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
  fd.append("index.mjs", new Blob([source], { type: "application/javascript+module" }), "index.mjs");
  return fd;
}
async function del(name) {
  const d = await api("DELETE", `/workers/scripts/${name}?force=true`);
  console.log(`  DELETE ${name}: status ${d.status} success ${d.success}`);
}

const calleeSrc = `export default { async fetch() {
  return new Response(JSON.stringify({ marker: "cpdf7-callee", ts: Date.now() }),
    { headers: { "content-type": "application/json" } }); } };`;
const callerSrc = `export default { async fetch(request, env) {
  if (request.headers.get("x-probe") !== env.PROBE) return new Response("no", { status: 404 });
  const n = Math.min(50, Math.max(1, Number(new URL(request.url).searchParams.get("n") || "20")));
  const per = []; let last = null; const t0 = Date.now();
  for (let i = 0; i < n; i++) { const a = Date.now();
    const r = await env.CALLEE.fetch("https://callee.invalid/"); last = await r.json(); per.push(Date.now() - a); }
  return new Response(JSON.stringify({ n, total_ms: Date.now() - t0, per_call_ms: per, callee: last }),
    { headers: { "content-type": "application/json" } }); } };`;

const findings = {};
const made = { callee: false, caller: false, sub: false };

try {
  console.log("== plan probe: try to set limits.cpu_ms above the Free ceiling ==");
  const cpu = await api("PUT", `/workers/scripts/${CPUNAME}`, {
    body: upload("export default { async fetch(){ return new Response('ok'); } };",
      { main_module: "index.mjs", compatibility_date: "2026-07-01", limits: { cpu_ms: 50000 } }),
  });
  findings.plan = cpu.success
    ? { plan: "PAID-consistent", note: "cpu_ms=50000 accepted" }
    : { plan: "FREE", evidence: cpu.errors };
  console.log(`  deploy w/ cpu_ms=50000: status ${cpu.status} success ${cpu.success}` +
    (cpu.errors?.length ? " -> " + JSON.stringify(cpu.errors) : ""));
  if (cpu.success) await del(CPUNAME);

  console.log("== second script ==");
  const c1 = await api("PUT", `/workers/scripts/${CALLEE}`, {
    body: upload(calleeSrc, { main_module: "index.mjs", compatibility_date: "2026-07-01" }),
  });
  made.callee = c1.success;
  findings.secondScript = { permitted: c1.success, errors: c1.success ? undefined : c1.errors };
  console.log(`  deploy callee: status ${c1.status} success ${c1.success}`);
  if (!c1.success) throw new Error("callee deploy failed");

  console.log("== service binding ==");
  const c2 = await api("PUT", `/workers/scripts/${CALLER}`, {
    body: upload(callerSrc, {
      main_module: "index.mjs", compatibility_date: "2026-07-01",
      bindings: [{ type: "service", name: "CALLEE", service: CALLEE }, { type: "plain_text", name: "PROBE", text: PROBE }],
    }),
  });
  made.caller = c2.success;
  findings.serviceBinding = { deploy_permitted: c2.success, errors: c2.success ? undefined : c2.errors };
  console.log(`  deploy caller+binding: status ${c2.status} success ${c2.success}`);
  if (!c2.success) throw new Error("caller deploy failed");

  const sub = await api("POST", `/workers/scripts/${CALLER}/subdomain`, {
    headers: { "content-type": "application/json" }, body: JSON.stringify({ enabled: true, previews_enabled: false }),
  });
  made.sub = sub.success;
  const zone = (await api("GET", "/workers/subdomain")).result?.subdomain;
  const url = `https://${CALLER}.${zone}.workers.dev/?n=25`;

  console.log("== cross-worker call (waiting for rollout) ==");
  let m = null, tries = 0;
  for (tries = 1; tries <= 20; tries++) {
    await new Promise((s) => setTimeout(s, 3000));
    let r; try { r = await fetch(url, { headers: { "x-probe": PROBE }, cache: "no-store" }); } catch { continue; }
    if (!r.ok) continue;
    const j = await r.json();
    if (j?.callee?.marker === "cpdf7-callee") { m = j; break; }
  }
  if (m) {
    const s = m.per_call_ms.slice().sort((a, b) => a - b);
    findings.crossWorkerCall = { invoked: true, n: m.n, total_ms: m.total_ms,
      median_ms: s[s.length >> 1], min_ms: s[0], max_ms: s[s.length - 1],
      note: "wall-clock across the binding, caller-side; NOT Worker CPU" };
    console.log("  MEASURED:", JSON.stringify(findings.crossWorkerCall));
  } else { findings.crossWorkerCall = { invoked: false, tries }; console.log("  not captured after", tries, "tries"); }
} catch (e) {
  console.log("aborted:", e.message);
} finally {
  console.log("== teardown ==");
  if (made.sub) await api("POST", `/workers/scripts/${CALLER}/subdomain`,
    { headers: { "content-type": "application/json" }, body: JSON.stringify({ enabled: false, previews_enabled: false }) });
  await del(CALLER); await del(CALLEE); await del(CPUNAME);
  const names = ((await api("GET", "/workers/scripts")).result || []).map((w) => w.id);
  findings.teardownConfirmed = ![CALLEE, CALLER, CPUNAME].some((n) => names.includes(n));
  console.log("  scripts now:", JSON.stringify(names), "| teardown confirmed:", findings.teardownConfirmed);
}
console.log("\n== FINDINGS ==\n" + JSON.stringify(findings, null, 2));
