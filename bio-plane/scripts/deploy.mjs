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
 * The old process's release-baton gate (`--thread`, `--force-without-baton`,
 * reading `docs/development/kickoffs/BATON.md` from `main`) was removed with that
 * process's tooling in T19 (K648, K749): who cuts a release is the process's
 * question, not this script's.
 *
 * usage (bundler R17, R18), from bio-plane/:
 *   CF_TOKEN=... CF_ACCT=... node scripts/deploy.mjs <slug> <version> <asset>
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolveVersion } from "./resolve-version.mjs";

const [slug, version, assetPath] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const TOKEN = process.env.CF_TOKEN, ACCT = process.env.CF_ACCT;
if (!slug || !version || !assetPath || !TOKEN || !ACCT) {
  console.error("usage: CF_TOKEN=... CF_ACCT=... node scripts/deploy.mjs <slug> <version> <asset>");
  process.exit(2);
}

/* DS-2 / D-116: THE VERSION AUTHORITY SPANS THE FLEET, CHECKED BEFORE ANYTHING
   ELSE HAPPENS.
   This script takes the version as a POSITIONAL ARGUMENT, which means that until
   now the operator's typing was the only thing deciding what a deploy claimed to
   be — nothing compared it to what the repository declares, and nothing compared
   the plane's declaration to the fleet's. Measured 2026-09-11, five of the six
   declaring sites disagreed with the authority and no instrument said so.
   Two refusals, and they are different failures:
     - the TREE disagrees with itself (a member behind or ahead of the plane), or
     - the ARGUMENT disagrees with the tree, which is a typo about to be signed. */
{
  const r = resolveVersion();
  if (!r.ok) {
    console.error("REFUSED [VERSION_SKEW]: the fleet does not agree on one version, so this");
    console.error("deploy cannot say what it is deploying.");
    console.error(`  authority: bio-plane/package.json = ${JSON.stringify(r.version)}`);
    for (const f of r.findings) console.error("  - " + f);
    process.exit(1);
  }
  if (version !== r.version) {
    console.error("REFUSED [VERSION_ARGUMENT_DISAGREES]: the version on the command line is not");
    console.error("the version this tree declares.");
    console.error(`  argument : ${JSON.stringify(version)}`);
    console.error(`  declared : ${JSON.stringify(r.version)}  (bio-plane/package.json, the authority)`);
    console.error("  A deploy stamps VERSION into the worker's bindings and the rollout gate then");
    console.error("  waits for that string to SERVE. A typo here does not fail loudly: it deploys,");
    console.error("  serves a version nothing else in the repository claims, and the next reader");
    console.error("  cannot tell which bytes are running. Fix the argument, or bump the tree.");
    process.exit(1);
  }
  console.log(`version: ${r.version} — plane and ${r.sites.length - 2} fleet site(s) agree`);
}

/* SAY WHAT GOES OUT, because an absence that is not stated is indistinguishable
   from one nobody checked. A deploy never carries a Claude credential (K1502):
   an INSTANCE_CLAUDE_TOKEN left in the operator's environment is named as
   ignored, never sent. The values themselves are never printed. */
{
  if (typeof process.env.INSTANCE_CLAUDE_TOKEN === "string" && process.env.INSTANCE_CLAUDE_TOKEN.length > 0)
    console.log("INSTANCE_CLAUDE_TOKEN is set in this environment and IGNORED — a deploy never carries a"
      + " Claude credential (K1502); it is not sent.");
  /* DIST-9 (D-260's deploy half): the organisation `ai` credential rides the same way, and is never generated —
     a member mints it on the instance (DS-3). */
  const hasAi = typeof process.env.INSTANCE_AI_TOKEN === "string" && process.env.INSTANCE_AI_TOKEN.length > 0;
  console.log(hasAi
    ? "instance ai: INSTANCE_AI_TOKEN present in this environment — it will be SENT and will replace whatever"
      + " the instance holds (value not printed; confirmed by the wake entry, not by this line)"
    : "instance ai: INSTANCE_AI_TOKEN not in this environment — NOT sent. Any value already on the instance is"
      + " KEPT (keep_bindings: secret_text); without one, every wake says NO_INSTANCE_AI_CREDENTIAL.");
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
 * a live outage was that nobody had tried it.
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
                "would bind it all three. Deploy it with scripts/deploy-fleet.mjs.",
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

/* D-202 CLOSED HERE, 2026-09-14: the binding list DERIVES from wrangler.jsonc
   with the slug substituted (D-292), instead of living as a second hand-carried
   copy in this file — the two had no mechanism keeping them equal and measured
   unequal for a month (biosmoke7: zero service bindings against four declared).
   The derivation is `derive-bindings.mjs`, pure and test-driven (bundler R13–R15); it refuses
   any config binding class it does not carry, so the deletion-through-omission
   this file was bitten by cannot recur silently.
   BEHAVIOURAL CHANGE, MADE DELIBERATELY AND WITH THE OWNERS TOLD (delegations
   to RECORD and CAPTURE in CLAIMS.md, 2026-09-14): the first deploy through
   this derivation SENDS the config's service bindings — SELF arms REC-26's
   monitor cadence and CAP-3's archive fallback on the deployed instance, and
   the fleet bindings arm the plane's Tier-3 paths. The targets are
   pre-flighted below so a missing worker is OUR refusal, not code 10143. */
import { deriveBindings, serviceTargets, deriveLimits, limitsReadBack } from "./derive-bindings.mjs";
import { parseJsonc } from "./jsonc.mjs";   /* R11: the module's one reader */
const wranglerCfg = parseJsonc(
  readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8"), "bio-plane/wrangler.jsonc");
const meta = {
  main_module: "index.mjs",
  compatibility_date: wranglerCfg.compatibility_date,
  compatibility_flags: wranglerCfg.compatibility_flags || [],
  /* The organisation `ai` credential rides the environment, never printed; no
     Claude credential is ever derived (K1502). */
  bindings: deriveBindings(wranglerCfg, {
    slug, version,
    instanceAiToken: process.env.INSTANCE_AI_TOKEN || undefined,
  }),
  keep_bindings: ["secret_text", "durable_object_namespace", "service"],
  /* D-54: the subrequest ceiling the config states with its reason, never the
     platform's default of the month. deriveLimits REFUSES a config without it,
     before anything is uploaded. */
  limits: deriveLimits(wranglerCfg),
};

/* D-54's read-back: the deployed script's settings, asked of the account. */
async function settingsNow() {
  try {
    const r = await fetch(`${api}/settings`, { headers: { authorization: `Bearer ${TOKEN}` } });
    if (!r.ok) return null;
    const j = await r.json();
    return j && j.success ? j.result : null;
  } catch { return null; }
}

/* Pre-flight every derived service target (except the self-reference, which
   this very PUT creates) so the refusal names the missing worker. */
for (const target of serviceTargets(meta.bindings, slug)) {
  let r;
  try {
    r = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCT}/workers/scripts/${target}/settings`,
      { headers: { authorization: `Bearer ${TOKEN}` } });
  } catch (e) {
    /* A request that never answered establishes nothing either (R17). */
    console.error(`REFUSED [PREFLIGHT_UNREADABLE]: could not establish whether service target "${target}" exists (${(e && e.message) || e}); an unverified target is not a verified one.`);
    process.exit(1);
  }
  if (r.status === 404) {
    console.error(`REFUSED [BINDING_TARGET_MISSING]: the derived bindings target worker "${target}",`);
    console.error(`which does not exist on this account. Deploy the fleet member first`);
    console.error(`(node scripts/deploy-fleet.mjs ${target} --instance ${slug}), then deploy the plane.`);
    process.exit(1);
  }
  if (!r.ok) {
    console.error(`REFUSED [PREFLIGHT_UNREADABLE]: could not establish whether service target "${target}" exists (HTTP ${r.status}); an unverified target is not a verified one.`);
    process.exit(1);
  }
}

async function deployed() {
  let r;
  try { r = await fetch(api, { headers: { authorization: `Bearer ${TOKEN}`, accept: "application/javascript+module" } }); }
  catch { return null; }   /* unreadable is not a match */
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
  /* Bytes matching is HALF the question — found live on the 0.58.0 cut,
     2026-09-14, the first release whose plane bytes were identical to the
     previous version's. A deploy also carries METADATA (the VERSION var, the
     derived bindings), and skipping on byte-identity alone left /version
     answering 0.57.0 forever while the rollout gate waited for a build that
     was never sent. Byte-identical + already SERVING the target version is
     "nothing to do"; byte-identical alone is a metadata deploy and proceeds. */
  const sub = await workersSubdomain();
  let serving = null;
  if (sub) {
    try { serving = (await (await fetch(`https://${slug}.${sub}.workers.dev/version`)).text()).trim(); }
    catch { /* unknown is not "already done" */ }
  }
  /* D-54: and the limits must already read back, or the metadata is not ours. */
  const lim = limitsReadBack(await settingsNow(), meta.limits);
  if (serving === version && lim.verdict === "MATCH") {
    console.log(`already byte-identical AND serving ${version} AND ${lim.why}; nothing to do`);
    process.exit(0);
  }
  if (serving === version) console.log(`bytes identical and serving ${version}, but limits: ${lim.verdict} (${lim.why}) — a METADATA deploy proceeds.`);
  console.log(`bytes are identical but the instance serves ${serving ?? "(unreadable)"} — a METADATA deploy proceeds (VERSION var, derived bindings).`);
}

for (let attempt = 1; attempt <= 4; attempt++) {
  const fd = new FormData();
  fd.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
  fd.append("index.mjs", new Blob([source], { type: "application/javascript+module" }), "index.mjs");
  let r = null, text = "";
  try { r = await fetch(api, { method: "PUT", headers: { authorization: `Bearer ${TOKEN}` }, body: fd }); text = await r.text(); }
  catch (e) { console.log(`attempt ${attempt}: the upload request failed (${(e && e.message) || e})`); }
  const ct = r ? r.headers.get("content-type") || "" : "";
  /* Reported, never believed. Every branch falls through to the same check. */
  if (!r) { /* said above */ }
  else if (ct.includes("json")) {
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
    /* D-54: the limit is read back, never believed from the PUT. A value that is
       not ours refuses success; a settings answer that does not state it is
       UNDETERMINED and said so, never counted as a match. */
    const lim = limitsReadBack(await settingsNow(), meta.limits);
    if (lim.verdict === "MISMATCH") {
      console.error(`REFUSING TO REPORT SUCCESS [LIMITS_MISMATCH]: ${lim.why}. The bytes are deployed; the ceiling is not the config's.`);
      process.exit(1);
    }
    console.log(lim.verdict === "MATCH"
      ? `verified: ${lim.why}`
      : `limits: UNDETERMINED — ${lim.why}. The ceiling sent (${meta.limits.subrequests}) is NOT confirmed; establish it before stating it.`);
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
