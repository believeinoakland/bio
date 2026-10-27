#!/usr/bin/env node
/* PROTOTYPE, branch proto/levels-2-3 ONLY (never merged to main or a tranche): deploy the plane Worker `plat-s1` and
 * nothing else, REPLACING ONLY THE SCRIPT'S CODE.
 *
 * Why not deploy.mjs: it derives its bindings from bio-plane/wrangler.jsonc, which names the SHARED buckets and the
 * SHARED fleet members. An installer copy (`plat-s1`) has per-slug buckets and members, so deploy.mjs would rebind
 * them to the shared ones (build/plan/beta/platform/study/second-copy-options.md, option C blocker). This script
 * derives NOTHING from the config: the bindings, vars, compatibility settings, limits, observability and placement
 * it sends are the live Worker's own, read back from Cloudflare (GET only) just before the upload.
 *
 *   - `plain_text`, `service`, `r2_bucket`, `browser` and every other class whose value is readable are re-sent
 *     verbatim from the live settings.
 *   - `secret_text`, `secret_key` and `durable_object_namespace` are never readable (or must not be re-sent), so they are
 *     NOT in `bindings`; `keep_bindings` names their classes and Cloudflare keeps them. No `migrations` field is sent.
 *   - the cron schedules are read before, and if a raw script PUT changed them they are PUT back and read back.
 *

 * --set-var NAME=VALUE (repeatable) adds or overrides a plain_text var; NAME must match /^PROTO_[A-Z0-9_]+$/, anything else is refused.
 * usage, from bio-plane/ (an asset is a built plane bundle: `node scripts/bundles.mjs` makes dist/bio-plane.bundled.mjs):
 *   node scripts/deploy-plane-only.mjs plat-s1 dist/bio-plane.bundled.mjs --dry-run        (read-only; mandatory first)
 *   CONFIRM_PLAT_S1_PLANE_ONLY=yes node scripts/deploy-plane-only.mjs plat-s1 dist/bio-plane.bundled.mjs
 * env: CF_TOKEN or CLOUDFLARE_API_TOKEN; CF_ACCT or CLOUDFLARE_ACCOUNT_ID (must be the account below).
 * A real run needs the token scope Workers Scripts Write; --dry-run only reads. Secret values are never printed. */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ACCOUNT = "20b533579290b9b93168345edd3b7f72", WORKER = "plat-s1";
const ARGS = process.argv.slice(2), DRY = ARGS.includes("--dry-run");
/* --set-var NAME=VALUE (repeatable): add or override a plain_text var; only PROTO_* names are allowed */
const SET_VARS = new Map(), POSITIONAL = [];
for (let i = 0; i < ARGS.length; i++) {
  if (ARGS[i] === "--set-var") {
    const kv = ARGS[++i] ?? "", eq = kv.indexOf("=");
    const k = eq > 0 ? kv.slice(0, eq) : kv, v = eq > 0 ? kv.slice(eq + 1) : "";
    if (eq < 1 || !/^PROTO_[A-Z0-9_]+$/.test(k)) { console.error(`REFUSED [BAD_SET_VAR]: --set-var takes NAME=VALUE with NAME matching /^PROTO_[A-Z0-9_]+$/; got \`${k}\`.\nNothing was uploaded.`); process.exit(1); }
    SET_VARS.set(k, v);
  } else if (!ARGS[i].startsWith("--")) POSITIONAL.push(ARGS[i]);
}
const [name, assetPath] = POSITIONAL;
const TOKEN = process.env.CF_TOKEN || process.env.CLOUDFLARE_API_TOKEN, ACCT = process.env.CF_ACCT || process.env.CLOUDFLARE_ACCOUNT_ID;
const refuse = (code, why) => { console.error(`REFUSED [${code}]: ${why}\nNothing was uploaded.`); process.exit(1); };

if (!name || !assetPath) { console.error("usage: node scripts/deploy-plane-only.mjs plat-s1 <bundle> [--set-var PROTO_X=V ...] [--dry-run]"); process.exit(2); }
if (name !== WORKER) refuse("WRONG_WORKER", `this script deploys \`${WORKER}\` only; got \`${name}\`.`);
if (ACCT !== ACCOUNT) refuse("WRONG_ACCOUNT", `account ${ACCOUNT} only; the environment names ${ACCT ? ACCT : "none"}.`);
if (!TOKEN) refuse("NO_TOKEN", "CF_TOKEN or CLOUDFLARE_API_TOKEN is not set.");
if (!DRY && process.env.CONFIRM_PLAT_S1_PLANE_ONLY !== "yes")
  refuse("NOT_CONFIRMED", "a real run needs CONFIRM_PLAT_S1_PLANE_ONLY=yes in the environment. Run with --dry-run to see what would be sent.");

const api = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/workers/scripts/${WORKER}`;
const auth = { authorization: `Bearer ${TOKEN}` };
async function get(path, accept) {
  const r = await fetch(api + path, { headers: accept ? { ...auth, accept } : auth });
  return r;
}
async function getJson(path) {
  let r;
  try { r = await get(path); } catch (e) { return { err: (e && e.message) || String(e) }; }
  if (r.status === 404) return { absent: true };
  let j = null; try { j = await r.json(); } catch { /* below */ }
  if (!r.ok || !j || j.success === false) return { err: `HTTP ${r.status}` };
  return { result: j.result };
}

const source = readFileSync(assetPath);
const want = createHash("sha256").update(source).digest("hex");

const live = await getJson("/settings");
if (live.absent) refuse("NOT_DEPLOYED", `\`${WORKER}\` does not exist on the account: this script replaces the code of a Worker that exists, it creates none.`);
if (live.err) refuse("SETTINGS_UNREADABLE", `could not read the live settings (${live.err}); a deploy that cannot see them could delete bindings.`);
const S = live.result;
const liveBindings = Array.isArray(S.bindings) ? S.bindings : [];
if (!liveBindings.length) refuse("NO_LIVE_BINDINGS", "the live Worker reports no bindings; refusing to send an empty set.");

/* classes Cloudflare keeps for us and that cannot (or must not) be re-sent */
const KEPT_CLASSES = ["secret_text", "secret_key", "durable_object_namespace"];
const sent = liveBindings.filter((b) => b && !KEPT_CLASSES.includes(b.type)).map((b) => (b.type === "plain_text" && SET_VARS.has(b.name)) ? { ...b, text: SET_VARS.get(b.name) } : b);
const setNotes = [];
for (const [k, v] of SET_VARS) {
  const clash = liveBindings.find((b) => b && b.name === k && b.type !== "plain_text");
  if (clash) refuse("SET_VAR_CLASH", `${k} is a live ${clash.type} binding, not a plain_text var; it will not be overridden.`);
  const was = liveBindings.find((b) => b && b.name === k && b.type === "plain_text");
  if (!was) sent.push({ type: "plain_text", name: k, text: v });
  setNotes.push(`${was ? "OVERRIDE" : "ADD"}      ${k} = ${JSON.stringify(v)}${was ? "  (live: " + JSON.stringify(was.text) + ")" : ""}`);
}
const keptBindings = liveBindings.filter((b) => b && KEPT_CLASSES.includes(b.type));
const keep_bindings = [...new Set(keptBindings.map((b) => b.type))];
for (const b of keptBindings) if (b.type === "durable_object_namespace" && !b.class_name) refuse("DO_UNREADABLE", `binding ${b.name} has no class_name in the live settings.`);

const meta = { main_module: "index.mjs", keep_bindings, bindings: sent };
for (const k of ["compatibility_date", "compatibility_flags", "limits", "observability", "placement", "tail_consumers", "usage_model", "logpush"])
  if (S[k] !== undefined && S[k] !== null) meta[k] = S[k];
if (!meta.compatibility_date) refuse("NO_COMPAT_DATE", "the live settings state no compatibility_date.");

const sch = await getJson("/schedules");
if (sch.err) refuse("SCHEDULES_UNREADABLE", `could not read the live schedules (${sch.err}).`);
const crons = sch.result && Array.isArray(sch.result.schedules) ? sch.result.schedules.map((x) => x.cron) : [];

/* the display: a secret_text has no value to print; any other class shows only what its class points at.
   A plain_text's text is a configuration var, not a credential, and is shown. */
const show = (b) => {
  if (b.type === "plain_text") return `plain_text  ${b.name} = ${JSON.stringify(b.text)}`;
  if (b.type === "service") return `service     ${b.name} -> ${b.service}${b.entrypoint ? "#" + b.entrypoint : ""}${b.environment ? " (" + b.environment + ")" : ""}`;
  if (b.type === "r2_bucket") return `r2_bucket   ${b.name} -> ${b.bucket_name}`;
  if (b.type === "durable_object_namespace") return `durable_object_namespace ${b.name} -> ${b.class_name}${b.script_name ? " @" + b.script_name : ""}  [KEPT by Cloudflare, not sent]`;
  if (b.type === "secret_text" || b.type === "secret_key") return `${b.type} ${b.name}  [KEPT by Cloudflare, value never read]`;
  return `${b.type} ${b.name}${b.namespace_id ? " -> " + b.namespace_id : ""}`;
};

let beforeHash = null;
try {
  const r = await get("", "application/javascript+module");
  if (r.ok) {
    const ct = r.headers.get("content-type") || "";
    let body = Buffer.from(await r.arrayBuffer());
    if (/multipart/i.test(ct)) {
      const m = /boundary=(.+)$/i.exec(ct);
      const part = m && body.toString("binary").split("--" + m[1].replace(/"/g, "")).find((p) => /index\.mjs/.test(p));
      if (part) body = Buffer.from(part.slice(part.indexOf("\r\n\r\n") + 4).replace(/\r\n$/, ""), "binary");
      else body = null;
    }
    if (body) beforeHash = createHash("sha256").update(body).digest("hex");
  }
} catch { /* unreadable */ }

console.log(`worker   : ${WORKER}   account: ${ACCOUNT}   mode: ${DRY ? "DRY RUN (read-only)" : "REAL"}`);
console.log(`code     : live ${beforeHash ? beforeHash.slice(0, 16) + "…" : "(unreadable)"}  ->  new ${want.slice(0, 16)}…  (${source.length} bytes from ${assetPath})`);
console.log(`settings : compatibility_date=${meta.compatibility_date} flags=${JSON.stringify(meta.compatibility_flags ?? [])} limits=${JSON.stringify(meta.limits ?? null)} observability=${JSON.stringify(meta.observability ?? null)} placement=${JSON.stringify(meta.placement ?? null)}`);
console.log(`keep_bindings: ${JSON.stringify(keep_bindings)}   migrations: none sent`);
console.log(`\nbindings the upload would SEND (${sent.length}):`);
for (const b of sent) console.log("  " + show(b) + (SET_VARS.has(b.name) && b.type === "plain_text" ? "   <- --set-var" : ""));
if (setNotes.length) { console.log(`\n--set-var changes (${setNotes.length}):`); for (const n of setNotes) console.log("  " + n); }
console.log(`\nbindings KEPT by Cloudflare, not sent (${keptBindings.length}):`);
for (const b of keptBindings) console.log("  " + show(b));
/* diff: every live binding is either sent verbatim or kept; compare the sent set to the live set by exact content */
const key = (b) => JSON.stringify(Object.fromEntries(Object.entries(b).sort()));
const liveKeys = new Set(liveBindings.map(key)), sentKeys = new Set([...sent, ...keptBindings].map(key));
const added = [...sentKeys].filter((k) => !liveKeys.has(k)), removed = [...liveKeys].filter((k) => !sentKeys.has(k));
console.log(`\ndiff vs live bindings: ${added.length} added, ${removed.length} removed, ${liveBindings.length - removed.length} identical (sent + kept = ${sent.length + keptBindings.length} of live ${liveBindings.length})`);
for (const k of added) console.log("  + " + show(JSON.parse(k)));
for (const k of removed) console.log("  - " + show(JSON.parse(k)));
console.log(`schedules: live ${crons.length ? crons.join(" | ") : "none"}; after the upload they are read again and, if changed, PUT back to exactly these`);
const expectedChanges = SET_VARS.size; /* each --set-var is one added line, plus one removed line if it overrides a live var */
const overrides = [...SET_VARS.keys()].filter((k) => liveBindings.some((b) => b && b.name === k && b.type === "plain_text")).length;
if (added.length !== expectedChanges || removed.length !== overrides) refuse("DIFF_NOT_EMPTY", "the bindings to send differ from the live ones; that is a bug of this script.");

if (DRY) { console.log("\n--dry-run: nothing was uploaded."); process.exit(0); }

let ok = false;
for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
  const fd = new FormData();
  fd.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
  fd.append("index.mjs", new Blob([source], { type: "application/javascript+module" }), "index.mjs");
  try {
    const r = await fetch(api, { method: "PUT", headers: auth, body: fd });
    console.log(`attempt ${attempt}: http ${r.status}`);
  } catch (e) { console.log(`attempt ${attempt}: request failed (${(e && e.message) || e})`); }
  /* the answer is not evidence: read the script back and compare hashes */
  try {
    const r = await get("", "application/javascript+module");
    const ct = r.headers.get("content-type") || "";
    let body = Buffer.from(await r.arrayBuffer());
    if (/multipart/i.test(ct)) {
      const m = /boundary=(.+)$/i.exec(ct);
      const part = m && body.toString("binary").split("--" + m[1].replace(/"/g, "")).find((p) => /index\.mjs/.test(p));
      body = part ? Buffer.from(part.slice(part.indexOf("\r\n\r\n") + 4).replace(/\r\n$/, ""), "binary") : Buffer.alloc(0);
    }
    ok = createHash("sha256").update(body).digest("hex") === want;
  } catch { /* unreadable is not a match */ }
  if (!ok && attempt < 3) await new Promise((s) => setTimeout(s, 6000 * attempt));
}
if (!ok) { console.error("REFUSING TO REPORT SUCCESS: the deployed bytes never matched the asset."); process.exit(1); }
console.log("verified: deployed bytes are hash-identical to the asset");

/* settings read back: every live binding class/name still there, with the same target */
const after = await getJson("/settings");
if (after.err || !after.result) { console.error(`UNVERIFIED: could not read the settings back (${after.err}).`); process.exit(1); }
const nowKeys = new Set((after.result.bindings || []).filter((b) => !KEPT_CLASSES.includes(b.type)).map(key));
const lost = sent.filter((b) => !nowKeys.has(key(b)));
const keptNow = new Set((after.result.bindings || []).map((b) => `${b.type}:${b.name}`));
const keptLost = keptBindings.filter((b) => !keptNow.has(`${b.type}:${b.name}`));
if (lost.length || keptLost.length) {
  console.error(`BINDINGS CHANGED after the upload: not as before: ${[...lost, ...keptLost].map((b) => `${b.type} ${b.name}`).join(", ")}`);
  process.exit(1);
}
console.log(`verified: all ${liveBindings.length} bindings present as before (${keptBindings.length} kept, ${sent.length} resent)`);

const sNow = await getJson("/schedules");
const nowCrons = sNow.result && Array.isArray(sNow.result.schedules) ? sNow.result.schedules.map((x) => x.cron) : null;
if (!nowCrons || nowCrons.join("|") !== crons.join("|")) {
  console.log(`schedules changed by the upload (${nowCrons ? nowCrons.join(" | ") || "none" : "unreadable"}); putting back ${crons.join(" | ") || "none"} …`);
  const r = await fetch(api + "/schedules", { method: "PUT", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify(crons.map((cron) => ({ cron }))) });
  const again = await getJson("/schedules");
  const got = again.result && Array.isArray(again.result.schedules) ? again.result.schedules.map((x) => x.cron) : null;
  if (!r.ok || !got || got.join("|") !== crons.join("|")) { console.error("SCHEDULES NOT RESTORED: check them by hand."); process.exit(1); }
}
console.log(`verified: schedules ${crons.length ? crons.join(" | ") : "none"}`);
console.log("done. Ops routed into the Durable Object may lag briefly behind the Worker.");
