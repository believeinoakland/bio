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
 * It also refuses to deploy unless the calling thread HOLDS THE RELEASE BATON.
 * Two threads cutting a plane release at once produces two tags claiming one
 * version and a RELEASE.json whose signature matches neither deployed artifact,
 * and that failure is invisible to git: both threads can push cleanly and still
 * have raced, because a tag and a version bump are additions rather than
 * conflicts. A rejected push does not catch it, so something else has to.
 *
 * The baton is read from the REMOTE, never the working tree. A thread could edit
 * its local copy to grant itself the baton; what matters is what the other
 * threads can see. It fails CLOSED: if the baton cannot be fetched the deploy is
 * refused, because proceeding blind is precisely the coordination failure this
 * exists to prevent.
 *
 * usage: CF_TOKEN=... CF_ACCT=... node deploy.mjs <slug> <version> <asset>
 *          --thread <NAME>
 *          [--force-without-baton "<reason>"]
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const argv = process.argv.slice(2);
const flag = (name) => { const i = argv.indexOf(name); return i === -1 ? null : (argv[i + 1] ?? ""); };
const positional = argv.filter((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1].startsWith("--")));
const [slug, version, assetPath] = positional;
const thread = flag("--thread");
const forced = argv.includes("--force-without-baton") ? flag("--force-without-baton") : null;
const TOKEN = process.env.CF_TOKEN, ACCT = process.env.CF_ACCT;
if (!slug || !version || !assetPath || !TOKEN || !ACCT) {
  console.error("usage: CF_TOKEN=... CF_ACCT=... node deploy.mjs <slug> <version> <asset> --thread <NAME>");
  console.error("       [--force-without-baton \"<reason>\"]");
  process.exit(2);
}

const BATON_URL = "https://raw.githubusercontent.com/believeinoakland/bio/main/docs/development/kickoffs/BATON.md";

/** Read the holder off the remote. Returns null when it cannot be determined,
 *  which is treated as a refusal rather than as permission. */
async function batonHolder() {
  const r = await fetch(BATON_URL, { cache: "no-store" });
  if (!r.ok) return { error: `baton unreadable: HTTP ${r.status}` };
  const text = await r.text();
  const block = /BATON-STATE([\s\S]*?)END-BATON-STATE/.exec(text);
  if (!block) return { error: "baton file has no BATON-STATE block" };
  const holder = /^\s*holder:\s*(\S+)/m.exec(block[1]);
  const since = /^\s*since:\s*(\S+)/m.exec(block[1]);
  if (!holder) return { error: "baton block names no holder" };
  return { holder: holder[1], since: since ? since[1] : null };
}

/* The UI worker carries no version number in the shared repo and contends for
   nothing, so it is not gated. Only a plane release is indivisible. */
const GATED = slug !== "civicos";

if (GATED) {
  if (forced !== null) {
    if (!forced.trim()) {
      console.error("--force-without-baton requires a reason, in quotes, and it will be printed.");
      process.exit(2);
    }
    console.error("");
    console.error("  !! DEPLOYING WITHOUT THE BATON");
    console.error(`  !! reason: ${forced}`);
    console.error("  !! Record this in docs/development/kickoffs/BATON.md under Log,");
    console.error("  !! with the date, the thread and this reason.");
    console.error("");
  } else {
    if (!thread) {
      console.error("REFUSING: --thread <NAME> is required for a plane release.");
      console.error("The baton names one thread at a time; see docs/development/kickoffs/BATON.md");
      process.exit(3);
    }
    let b;
    try { b = await batonHolder(); }
    catch (e) { b = { error: `baton unreachable: ${(e && e.message) || e}` }; }
    if (b.error) {
      console.error(`REFUSING: ${b.error}`);
      console.error("The baton is read from the remote and this check fails CLOSED: proceeding blind");
      console.error("is the coordination failure the baton exists to prevent. Use");
      console.error('--force-without-baton "<reason>" if you are certain, and log it.');
      process.exit(3);
    }
    if (b.holder !== thread) {
      console.error(`REFUSING: the release baton is held by ${b.holder}${b.since ? ` since ${b.since}` : ""}, not by ${thread}.`);
      console.error("Two threads cutting a plane release at once produces two tags claiming one");
      console.error("version and a RELEASE.json matching neither artifact, and git will not catch it.");
      console.error("Ask Bob to pass the baton, or wait. See docs/development/kickoffs/BATON.md");
      process.exit(3);
    }
    console.log(`baton: held by ${thread}${b.since ? ` since ${b.since}` : ""}`);
  }
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
    /* The agent's instance component, so a third party can throttle one
       operator instead of a provider. Bound at deploy from the slug because a
       worker cannot learn its own name; found live on 2026-07-30 advertising
       "instance unnamed" through two releases. */
    { type: "plain_text", name: "INSTANCE_NAME", text: slug },
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
