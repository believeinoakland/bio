#!/usr/bin/env node
/* FL-1 diagnostic — TWO things the first two passes proved I could not assume.
 *
 * (1) CAN A WORKER REACH ANOTHER WORKER ON THIS ACCOUNT'S *.workers.dev NAME?
 *     Pass 2's wait/agent arms returned in ~50 ms when they should have taken
 *     50 s, which means the subrequest was not doing what it looked like. Find
 *     out WHAT the responder actually answered instead of assuming.
 * (2) HOW IS A FRESH SCRIPT ATTRIBUTABLE ON THE BILLING SURFACE?
 *     Pass 1: `scriptName_in` returned rows whose scriptName dimension was
 *     "__unknown__". Pass 2: an exact `scriptName` filter returned NOTHING.
 *     Establish which handle actually works — name, tag, or time window.
 *
 * Deploys two throwaway scripts and deletes them. Token never printed.
 * usage:  node bio-plane/test/fl1-attribution-diag.mjs
 */
import { creds, gql } from "./fl1-billing-surface-check.mjs";

const { tok: TOK, acct: ACCT } = creds();
const base = `https://api.cloudflare.com/client/v4/accounts/${ACCT}`;
const AUTH = { authorization: `Bearer ${TOK}` };
const PROTECT = new Set(["biosmoke7", "civicos", "newgroup", "pdf-worker"]);
const R = "fl1diag-responder", C = "fl1diag-caller";
for (const n of [R, C]) if (PROTECT.has(n)) { console.error("name collision"); process.exit(1); }

async function api(method, path, opt = {}) {
  const r = await fetch(base + path, { method, headers: { ...AUTH, ...(opt.headers || {}) }, body: opt.body });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch {}
  return { status: r.status, success: j?.success, result: j?.result, errors: j?.errors };
}
function form(source, meta) {
  const fd = new FormData();
  fd.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
  fd.append("index.mjs", new Blob([source], { type: "application/javascript+module" }), "index.mjs");
  return fd;
}
const sub = (n, on) => api("POST", `/workers/scripts/${n}/subdomain`, {
  headers: { "content-type": "application/json" }, body: JSON.stringify({ enabled: on, previews_enabled: false }) });

const responderSrc = `export default { async fetch(request) {
  const d = Number(new URL(request.url).searchParams.get("delay") || "0");
  if (d > 0) await new Promise((s) => setTimeout(s, d));
  return new Response(JSON.stringify({ marker: "fl1diag", delayed: d }),
    { headers: { "content-type": "application/json" } }); } };`;

/* The caller tries BOTH routes to the same responder: the public workers.dev
 * URL and a SERVICE BINDING, and reports exactly what each answered. */
const callerSrc = `export default { async fetch(request, env) {
  const out = {};
  const t1 = Date.now();
  try { const r = await fetch(env.URL + "?delay=1500", { cache: "no-store" });
        const t = await r.text();
        out.public_url = { status: r.status, ms: Date.now() - t1, first: t.slice(0, 120) }; }
  catch (e) { out.public_url = { threw: e.name, ms: Date.now() - t1 }; }
  const t2 = Date.now();
  try { const r = await env.RESP.fetch("https://r.invalid/?delay=1500");
        const t = await r.text();
        out.service_binding = { status: r.status, ms: Date.now() - t2, first: t.slice(0, 120) }; }
  catch (e) { out.service_binding = { threw: e.name, ms: Date.now() - t2 }; }
  return new Response(JSON.stringify(out), { headers: { "content-type": "application/json" } }); } };`;

const made = [];
try {
  const a = await api("PUT", `/workers/scripts/${R}`, { body: form(responderSrc,
    { main_module: "index.mjs", compatibility_date: "2026-07-01" }) });
  if (!a.success) throw new Error("responder: " + JSON.stringify(a.errors));
  made.push(R); await sub(R, true);
  const zone = (await api("GET", "/workers/subdomain")).result?.subdomain;
  const RURL = `https://${R}.${zone}.workers.dev/`;

  const b = await api("PUT", `/workers/scripts/${C}`, { body: form(callerSrc,
    { main_module: "index.mjs", compatibility_date: "2026-07-01",
      bindings: [{ type: "service", name: "RESP", service: R },
                 { type: "plain_text", name: "URL", text: RURL }] }) });
  if (!b.success) throw new Error("caller: " + JSON.stringify(b.errors));
  made.push(C); await sub(C, true);

  console.log("== waiting for both routes to serve ==");
  const CURL = `https://${C}.${zone}.workers.dev/`;
  let direct = null;
  for (let i = 0; i < 40; i++) {
    await new Promise((s) => setTimeout(s, 5000));
    try { const r = await fetch(RURL + "?delay=0", { cache: "no-store" });
          if (r.ok) { direct = await r.json(); break; } } catch {}
  }
  console.log("  responder reachable from THIS MACHINE:", JSON.stringify(direct));

  let res = null;
  for (let i = 0; i < 40; i++) {
    await new Promise((s) => setTimeout(s, 5000));
    try { const r = await fetch(CURL, { cache: "no-store" });
          if (r.ok) { res = await r.json(); break; } } catch {}
  }
  console.log("\n== (1) WHAT A WORKER SEES ==");
  console.log(JSON.stringify(res, null, 2));

  /* (2) attribution: the caller has now been invoked. Try every handle. */
  console.log("\n== (2) attribution handles (after ingestion) ==");
  const from = new Date(Date.now() - 30 * 60_000).toISOString().replace(/\.\d+Z$/, "Z");
  const to = new Date(Date.now() + 60_000).toISOString().replace(/\.\d+Z$/, "Z");
  const QALL = `query($a:String!,$f:Time!,$t:Time!){ viewer{ accounts(filter:{accountTag:$a}){
    workersInvocationsAdaptive(limit:100, filter:{datetime_geq:$f, datetime_leq:$t}){
      sum{ cpuTimeUs requests } dimensions{ scriptName scriptTag status } } } } }`;
  for (let i = 0; i < 20; i++) {
    await new Promise((s) => setTimeout(s, 20000));
    const r = await gql(TOK, QALL, { a: ACCT, f: from, t: to });
    const rows = r.body?.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive || [];
    console.log(`  poll ${i + 1}: ${rows.length} row(s) account-wide`);
    if (rows.length) {
      console.log("  " + JSON.stringify(rows, null, 2).replace(/\n/g, "\n  "));
      break;
    }
  }
} catch (e) {
  console.log("aborted:", e.message);
} finally {
  for (const n of made) { await sub(n, false).catch(() => {}); await api("DELETE", `/workers/scripts/${n}?force=true`); }
  const names = ((await api("GET", "/workers/scripts")).result || []).map((w) => w.id);
  console.log("\nscripts now:", JSON.stringify(names));
}
