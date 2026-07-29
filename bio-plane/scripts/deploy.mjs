#!/usr/bin/env node
/* Deploy a signed release to a Worker, and believe only the bytes.
 *
 * The lesson this encodes was learned the hard way on 2026-07-28: a deploy
 * returned an HTML error page instead of JSON, the script threw while parsing
 * it, and the instance was still running the previous version. A retry
 * succeeded. The tempting conclusion was "do not retry after an unexpected
 * response". That is the wrong lesson.
 *
 * The right one is that the API's answer is not evidence either way. A success
 * response can precede a rollout that has not happened yet; an HTML error page
 * can be a gateway hiccup in front of an upload that landed. So this never
 * reports success from what the API said. It reads the script BACK from the
 * account, hashes it, and compares against the signed asset. That comparison is
 * the only thing here that decides anything, and it is equally capable of
 * catching a silent failure and a silent success.
 *
 * Retrying is therefore safe rather than reckless: a PUT of a whole script is
 * idempotent, and the verification runs regardless of how many attempts it took
 * or what any of them claimed.
 *
 * usage: CF_TOKEN=... CF_ACCT=... node deploy.mjs <slug> <version> <asset>
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const [slug, version, assetPath] = process.argv.slice(2);
const TOKEN = process.env.CF_TOKEN, ACCT = process.env.CF_ACCT;
if (!slug || !version || !assetPath || !TOKEN || !ACCT) {
  console.error("usage: CF_TOKEN=... CF_ACCT=... node deploy.mjs <slug> <version> <asset>");
  process.exit(2);
}

const source = readFileSync(assetPath, "utf8");
const want = createHash("sha256").update(readFileSync(assetPath)).digest("hex");
const api = `https://api.cloudflare.com/client/v4/accounts/${ACCT}/workers/scripts/${slug}`;

/* keep_bindings preserves the instance's secrets and its Durable Object
   namespace. There is deliberately NO migrations field: the class already
   exists, and re-sending new_sqlite_classes at a live store is how a record
   gets endangered. */
const meta = {
  main_module: "index.mjs",
  compatibility_date: "2026-07-01",
  compatibility_flags: ["nodejs_compat"],
  bindings: [
    { type: "plain_text", name: "VERSION", text: version },
    { type: "r2_bucket", name: "CAPTURES", bucket_name: "bio-captures" },
    { type: "r2_bucket", name: "PUBLISHED", bucket_name: "bio-published" },
  ],
  keep_bindings: ["secret_text", "durable_object_namespace"],
};

async function deployed() {
  const r = await fetch(api, { headers: { authorization: `Bearer ${TOKEN}`, accept: "application/javascript+module" } });
  if (!r.ok) return null;
  const ct = r.headers.get("content-type") || "";
  const body = Buffer.from(await r.arrayBuffer());
  let script = body;
  if (/multipart/i.test(ct)) {
    const m = /boundary=(.+)$/i.exec(ct);
    if (!m) return null;
    const parts = body.toString("binary").split("--" + m[1].replace(/"/g, "")).filter((p) => /index\.mjs/.test(p));
    if (!parts.length) return null;
    const at = parts[0].indexOf("\r\n\r\n");
    script = Buffer.from(parts[0].slice(at + 4).replace(/\r\n$/, ""), "binary");
  }
  return createHash("sha256").update(script).digest("hex");
}

const before = await deployed();
console.log(`before: ${before ? before.slice(0, 16) + "\u2026" : "(unreadable)"}`);
console.log(`signed: ${want.slice(0, 16)}\u2026  ${version}  ${source.length} bytes`);
if (before === want) { console.log("already byte-identical to the signed asset; nothing to do"); process.exit(0); }

for (let attempt = 1; attempt <= 4; attempt++) {
  const fd = new FormData();
  fd.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
  fd.append("index.mjs", new Blob([source], { type: "application/javascript+module" }), "index.mjs");
  const r = await fetch(api, { method: "PUT", headers: { authorization: `Bearer ${TOKEN}` }, body: fd });
  const ct = r.headers.get("content-type") || "";
  const text = await r.text();
  /* Reported, never believed. Both branches fall through to the same check. */
  if (ct.includes("json")) {
    let j = null; try { j = JSON.parse(text); } catch { /* claimed JSON, was not */ }
    console.log(`attempt ${attempt}: http ${r.status}, api says ${j ? j.success : "unparseable"}`
      + (j && !j.success ? " " + JSON.stringify(j.errors).slice(0, 200) : ""));
  } else {
    console.log(`attempt ${attempt}: http ${r.status}, non-JSON (${ct || "no type"}), ${text.length} bytes`);
    console.log("  " + text.replace(/\s+/g, " ").slice(0, 180));
  }

  const now = await deployed();
  if (now === want) { console.log(`verified: deployed bytes are hash-identical to the signed asset`); process.exit(0); }
  console.log(`  not yet: deployed ${now ? now.slice(0, 16) + "\u2026" : "(unreadable)"}`);
  if (attempt < 4) await new Promise((s) => setTimeout(s, 6000 * attempt));
}

console.error("REFUSING TO REPORT SUCCESS: the deployed bytes never matched the signed asset.");
console.error("The instance is running whatever it was running before. Nothing was half-applied:");
console.error("a script upload either replaces the module or does not.");
process.exit(1);
