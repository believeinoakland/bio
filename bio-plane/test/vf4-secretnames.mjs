#!/usr/bin/env node
/* VF-4 helper: list the SECRET NAMES bound to a worker in the account, never a
   value. Names only; the API does not return values at all. */
import { readFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(new URL("../../.env", import.meta.url), "utf8")
  .split("\n").filter((l) => /^[A-Z0-9_]+=/.test(l)).map((l) => {
    const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  }));
const script = process.argv[2];
const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCT}/workers/scripts/${script}/secrets`,
  { headers: { authorization: `Bearer ${env.CF_TOKEN}` } });
const j = await r.json();
console.log("account:", env.CF_ACCT, "script:", script, "http:", r.status, "success:", j.success);
if (j.errors?.length) console.log("errors:", JSON.stringify(j.errors));
for (const s of j.result || []) console.log("  secret:", s.name, s.type || "");
