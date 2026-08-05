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

/* ---- D-201: this script deploys THE PLANE, and nothing else ----
 *
 * The metadata below is the plane's: it declares VERSION, INSTANCE_NAME and the
 * two R2 buckets, and its keep_bindings is ["secret_text",
 * "durable_object_namespace"] — which does NOT include `service`. Point this at
 * a worker whose bindings are a different shape and the PUT does not merely
 * deploy the wrong code, it DELETES the bindings that made that worker work.
 *
 * `civicos`, the UI worker, has exactly ONE binding — `service PLANE ->
 * biosmoke7` — and it is what makes /api reach the plane at all. Deploying it
 * through this script would drop that binding and leave the site serving HTML
 * whose every request fails. Until now the only thing standing between that and
 * a live outage was that nobody had tried it, and an earlier comment here said
 * the UI "is not gated" — true about the BATON, and readable as permission.
 *
 * A slug ALLOWLIST is not available: plane instances are named by the groups
 * that install them, so their slugs are arbitrary by design and cannot be
 * enumerated here. What CAN be enumerated is the workers in this project that
 * are known NOT to be planes, each with its own deploy path.
 */
const NOT_A_PLANE = {
  civicos: "the UI worker. Its only binding is `service PLANE -> biosmoke7`, which this " +
           "script's keep_bindings would delete. Deploy it with civicos-ui/deploy-ui.mjs, " +
           "which carries the UI's own metadata and the same read-back-and-hash discipline.",
  "pdf-worker": "a fleet member, not a plane. It reads R2 CAPTURES, holds no PUBLISHED " +
                "binding and no Durable Object, and writes nothing — this script's metadata " +
                "would bind it all three. Build it with pdf-worker/scripts/build.mjs.",
};

if (Object.hasOwn(NOT_A_PLANE, slug)) {
  console.error(`REFUSING: \`${slug}\` is not a plane, and this script deploys the plane's metadata.`);
  console.error(`  ${NOT_A_PLANE[slug]}`);
  console.error("");
  console.error("This refusal is D-201. The hazard is not the wrong code — it is that the PUT");
  console.error("carries this script's bindings, so bindings the target worker needs and the");
  console.error("plane does not are DELETED. Verifying the bytes afterwards would pass.");
  process.exit(3);
}

/* Everything that reaches here is a plane, and a plane release is indivisible,
   so the baton gates all of it. */
const GATED = true;

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


/* ---- D-108: the bytes landing is not the same as the new build serving ----
 *
 * Verifying the deployed script proves the BYTES are right. It says nothing
 * about which build is answering requests, and on 2026-07-31 those came apart
 * visibly: seconds after a byte-identical verification of 0.52.0, `/version`
 * answered 0.51.0, two probes were answered by the previous build and a third
 * by the new one. The rollout is PER-ISOLATE AND NOT ATOMIC, so a verification
 * issued in that window can receive a MIX and reach opposite conclusions about
 * the same property.
 *
 * That nearly produced a false security finding: a probe appeared to show new
 * code honouring a forged locator, when the old code was answering.
 *
 * So this waits for the instance to actually SERVE the version before the
 * script reports done. It is not a pass/fail on the deploy, because the deploy
 * succeeded: it is a gate on believing anything measured afterwards. A
 * non-answer is reported loudly rather than silently tolerated, because the
 * whole point is to stop the next person trusting a probe too early.
 */
async function workersSubdomain() {
  try {
    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCT}/workers/subdomain`,
      { headers: { authorization: `Bearer ${TOKEN}` } });
    if (!r.ok) return null;
    const j = await r.json();
    return j && j.success && j.result ? j.result.subdomain : null;
  } catch { return null; }
}

async function confirmServing(want) {
  const sub = await workersSubdomain();
  if (!sub) {
    console.log("rollout: could not learn the workers.dev subdomain, so which build is SERVING is unconfirmed.");
    console.log("         The bytes are verified. Do not measure behaviour until /version answers " + want + ".");
    return;
  }
  const url = `https://${slug}.${sub}.workers.dev/version`;
  const t0 = Date.now();
  for (let attempt = 1; attempt <= 15; attempt++) {
    let seen = null;
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (r.ok) seen = (await r.text()).trim();
    } catch { /* mid-rollout a request can simply fail; that is not an answer either */ }
    if (seen === want) {
      console.log(`rollout: serving ${want} after ${Math.round((Date.now() - t0) / 1000)}s (${attempt} check${attempt === 1 ? "" : "s"})`);
      /* Said even on success, because /version is served by the WORKER and the
         Durable Object is a separate cycle: an op routed into the DO can still
         answer from the previous route map for a while after this line prints. */
      console.log("         NOTE: this confirms the Worker. Ops routed into the Durable Object");
      console.log("         (anything reaching op= handlers backed by the store) may lag briefly.");
      return;
    }
    if (attempt === 1) console.log(`rollout: serving ${seen || "(no answer)"}, waiting for ${want}…`);
    await new Promise((s) => setTimeout(s, 4000));
  }
  console.log("");
  console.log(`  !! ROLLOUT NOT CONFIRMED after 60s: /version still does not answer ${want}.`);
  console.log("  !! The signed bytes ARE deployed; this is about which build is answering.");
  console.log("  !! DO NOT verify behaviour yet. A probe now can be answered by the previous");
  console.log("  !! build and look exactly like a defect in the new one (D-108).");
  console.log("");
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
  /* `service` is here for the reason D-201 exists: a binding class this script
     neither SENDS nor KEEPS is silently DELETED on every deploy. D-202 measured
     the consequence on the live plane — `wrangler.jsonc` declares PDF_WORKER and
     SELF, and biosmoke7 has NEITHER, because every deploy has gone through this
     script. Keeping them is the protective half and changes nothing today (there
     are none live to keep); SENDING them is a behavioural change that would arm
     the monitoring consumers, and it is deliberately NOT made here. See D-202. */
  keep_bindings: ["secret_text", "durable_object_namespace", "service"],
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
if (before === want) {
  console.log("already byte-identical to the signed asset; nothing to do");
  await confirmServing(version);
  process.exit(0);
}

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
  if (now === want) {
    console.log(`verified: deployed bytes are hash-identical to the signed asset`);
    await confirmServing(version);
    process.exit(0);
  }
  console.log(`  not yet: deployed ${now ? now.slice(0, 16) + "\u2026" : "(unreadable)"}`);
  if (attempt < 4) await new Promise((s) => setTimeout(s, 6000 * attempt));
}

console.error("REFUSING TO REPORT SUCCESS: the deployed bytes never matched the signed asset.");
console.error("The instance is running whatever it was running before. Nothing was half-applied:");
console.error("a script upload either replaces the module or does not.");
process.exit(1);
