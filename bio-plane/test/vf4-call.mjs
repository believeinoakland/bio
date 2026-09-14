#!/usr/bin/env node
/* VF-4 scratchpad caller — ONE live op, printed. Read-only unless told
   otherwise by the op itself. Never prints a credential.
   usage: node vf4-call.mjs <op> [store] [k=v ...] [--post '<json>'] [--tok admin|member|probe]  */
import { readFileSync } from "node:fs";
export function loadEnv() {
  return Object.fromEntries(readFileSync(new URL("../../.env", import.meta.url), "utf8")
    .split("\n").filter((l) => /^[A-Z0-9_]+=/.test(l)).map((l) => {
      const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }));
}
const env = loadEnv();
export const ORIGIN = `https://${env.BIO_INSTANCE}.believeinoakland.workers.dev`;
export const SECRETS = [env.BIO_ADMIN_TOKEN, env.BIO_MEMBER_TOKEN, env.CF_TOKEN,
  env.CLOUDFLARE_API_TOKEN, env.GITHUB_TOKEN, env.BIO_RELEASE_SEED, env.BIO_RATIFY_SEED].filter(Boolean);
export const redact = (s) => { let o = String(s); for (const x of SECRETS) if (x) o = o.split(x).join("<REDACTED>"); return o; };

if (import.meta.url === `file://${process.argv[1]}`) {
  const [op, store, ...rest] = process.argv.slice(2);
  let post = null, tok = env.BIO_ADMIN_TOKEN;
  const kv = [];
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--post") post = rest[++i];
    else if (rest[i] === "--tok") { const w = rest[++i]; tok = w === "member" ? env.BIO_MEMBER_TOKEN : w === "admin" ? env.BIO_ADMIN_TOKEN : w; }
    else kv.push(rest[i]);
  }
  let url = `${ORIGIN}/api/?op=${encodeURIComponent(op)}&token=${encodeURIComponent(tok)}`;
  if (store) url += `&store=${encodeURIComponent(store)}`;
  for (const p of kv) { const i = p.indexOf("="); url += `&${p.slice(0, i)}=${encodeURIComponent(p.slice(i + 1))}`; }
  const r = await fetch(url, post == null ? { cache: "no-store" }
    : { method: "POST", headers: { "content-type": "application/json" }, body: post, cache: "no-store" });
  const text = await r.text();
  console.log("HTTP", r.status);
  console.log(redact(text).slice(0, 4000));
}
