#!/usr/bin/env node
/* VF-4 helper: read a worker's BINDING NAMES and types from the account, and
   list the account's scripts. Never prints a value (the API returns none for
   secret_text). Read-only: GET only, nothing is configured. */
import { readFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(new URL("../../.env", import.meta.url), "utf8")
  .split("\n").filter((l) => /^[A-Z0-9_]+=/.test(l)).map((l) => {
    const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  }));
const H = { authorization: `Bearer ${env.CF_TOKEN}` };
const base = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCT}/workers`;
console.log("account:", env.CF_ACCT);

if (process.argv[2] === "--list") {
  const r = await fetch(`${base}/scripts`, { headers: H });
  const j = await r.json();
  console.log("http", r.status, "success", j.success);
  for (const s of j.result || []) console.log("  script:", s.id, "modified", s.modified_on);
} else {
  const script = process.argv[2];
  const r = await fetch(`${base}/scripts/${script}/bindings`, { headers: H });
  const j = await r.json();
  console.log("script:", script, "http", r.status, "success", j.success);
  if (j.errors?.length) console.log("errors:", JSON.stringify(j.errors));
  for (const b of j.result || []) {
    const safe = { name: b.name, type: b.type };
    if (b.service) safe.service = b.service;
    if (b.class_name) safe.class_name = b.class_name;
    if (b.bucket_name) safe.bucket_name = b.bucket_name;
    if (b.type === "plain_text") safe.text = b.text;   // vars only, never secrets
    console.log("  ", JSON.stringify(safe));
  }
}
