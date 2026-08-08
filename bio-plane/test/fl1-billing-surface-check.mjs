#!/usr/bin/env node
/* FL-1 step 0 — CAN THE PLATFORM'S OBSERVED BILLING SURFACE BE READ AT ALL?
 *
 * FL-1's control is that the number may NOT come from the Worker's own clock
 * (D-56: Cloudflare freezes Date.now() during synchronous execution, so an
 * in-Worker millisecond is a fabrication — see src/cpu.mjs). So before anything
 * is deployed, establish whether the account's billing/analytics surface is
 * reachable with the token this project holds. If it is not, FL-1 reports NO
 * NUMBER and says exactly what is needed, rather than deriving one.
 *
 * Reads the token from .env and NEVER prints it. Deploys nothing. Read-only.
 *
 * usage:  node bio-plane/test/fl1-billing-surface-check.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function loadEnv() {
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

export const ACCT_PINNED = "20b533579290b9b93168345edd3b7f72";

export function creds() {
  const env = loadEnv();
  const tok = env.CLOUDFLARE_API_TOKEN || env.CF_TOKEN;
  const acct = env.CF_ACCT || env.CLOUDFLARE_ACCOUNT_ID || ACCT_PINNED;
  if (!tok) { console.error("no CLOUDFLARE_API_TOKEN / CF_TOKEN in env or .env"); process.exit(2); }
  if (acct !== ACCT_PINNED) {
    console.error(`refuse: account ${acct} is not this project's pinned account`);
    process.exit(1);
  }
  return { tok, acct, env };
}

/** POST to the Cloudflare GraphQL analytics endpoint. Returns parsed body.
 *  The token is used, never printed; an error body is returned as data so the
 *  caller can report WHAT THE SERVICE SAID rather than a paraphrase. */
export async function gql(tok, query, variables) {
  const r = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: { authorization: `Bearer ${tok}`, "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const t = await r.text();
  let j = null; try { j = JSON.parse(t); } catch {}
  return { status: r.status, body: j, raw: j ? null : t.slice(0, 400) };
}

const Q_ACCOUNT = `query($a:String!){ viewer { accounts(filter:{accountTag:$a}) { accountTag } } }`;

const Q_WORKERS = `query($a:String!,$from:Time!,$to:Time!){
  viewer { accounts(filter:{accountTag:$a}) {
    workersInvocationsAdaptive(limit:100, filter:{datetime_geq:$from, datetime_leq:$to}) {
      sum { requests errors subrequests }
      quantiles { cpuTimeP50 cpuTimeP99 wallTimeP50 wallTimeP99 }
      dimensions { scriptName status }
    } } } }`;

const Q_DO_STORAGE = `query($a:String!,$from:Date!,$to:Date!){
  viewer { accounts(filter:{accountTag:$a}) {
    durableObjectsStorageGroups(limit:100, filter:{date_geq:$from, date_leq:$to}) {
      max { storedBytes }
      dimensions { date }
    } } } }`;

const Q_DO_INVOCATIONS = `query($a:String!,$from:Time!,$to:Time!){
  viewer { accounts(filter:{accountTag:$a}) {
    durableObjectsInvocationsAdaptiveGroups(limit:100, filter:{datetime_geq:$from, datetime_leq:$to}) {
      sum { requests errors }
      quantiles { responseBodySizeP50 wallTimeP50 wallTimeP99 }
      dimensions { scriptName }
    } } } }`;

async function main() {
  const { tok, acct } = creds();
  const to = new Date();
  const from = new Date(to.getTime() - 24 * 3600 * 1000);
  const iso = (d) => d.toISOString().replace(/\.\d+Z$/, "Z");
  const day = (d) => d.toISOString().slice(0, 10);

  const out = {};
  const probes = [
    ["account_visible", Q_ACCOUNT, { a: acct }],
    ["workersInvocationsAdaptive", Q_WORKERS, { a: acct, from: iso(from), to: iso(to) }],
    ["durableObjectsStorageGroups", Q_DO_STORAGE, { a: acct, from: day(from), to: day(to) }],
    ["durableObjectsInvocationsAdaptiveGroups", Q_DO_INVOCATIONS, { a: acct, from: iso(from), to: iso(to) }],
  ];
  for (const [name, q, v] of probes) {
    const r = await gql(tok, q, v);
    const errs = r.body?.errors;
    const data = r.body?.data?.viewer?.accounts;
    out[name] = {
      http: r.status,
      readable: !errs && Array.isArray(data) && data.length > 0,
      service_said: errs ? errs.map((e) => e.message) : undefined,
      sample: errs ? undefined : JSON.stringify(data).slice(0, 900),
    };
    console.log(`\n== ${name} ==`);
    console.log(JSON.stringify(out[name], null, 2));
  }
  console.log("\n== VERDICT ==");
  console.log(out.workersInvocationsAdaptive.readable
    ? "BILLING SURFACE READABLE — a deployed probe's cpuTime can be read from the platform."
    : "BILLING SURFACE NOT READABLE with this token. FL-1 must report NO NUMBER.");
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
