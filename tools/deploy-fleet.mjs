#!/usr/bin/env node
/* Deploy ONE fleet member to ONE instance, with every binding target TEMPLATED
 * from that instance's slug.
 *
 * WHY THIS EXISTS AND WHY IT IS NOT `bio-plane/scripts/deploy.mjs`.
 * That script deploys the PLANE. It sends a hardcoded binding list and a
 * `keep_bindings` tuned to the plane's own shape, and it refuses `civicos` and
 * `pdf-worker` BY NAME (D-201) because pointing it at another worker deletes
 * bindings that worker needs. `kickoffs/DIST-NEXT.md` tells the next session "if
 * you deploy a fleet member, do not reach for deploy.mjs" — and until now that
 * sentence named no alternative, which is a rule without a mechanism. This is
 * the mechanism.
 *
 * THE DEFECT IT EXISTS TO FIX, measured 2026-08-10 and re-measured 2026-09-10:
 * `agent-worker/wrangler.jsonc` declares `service PLANE -> "bio-plane"`, and
 * NO WORKER IS EVER DEPLOYED UNDER THE NAME `bio-plane`. The plane's worker name
 * is the INSTANCE name (D-102): the smoke instance is `biosmoke7` and a group's
 * instance is named by the group. So Cloudflare refuses the deploy outright —
 *
 *     Service binding 'PLANE' references Worker 'bio-plane' which was not found
 *     [code: 10143]
 *
 * — which is D-292. The fix is NOT to write `biosmoke7` into the tracked config:
 * that hardcodes the smoke instance into a file meant to be installed into
 * arbitrary group accounts, which is the same defect inverted. The fix is to
 * SUBSTITUTE the instance slug at deploy time, which is what this does.
 *
 * WHY IT SHELLS OUT TO WRANGLER INSTEAD OF PUTTING BYTES LIKE deploy.mjs DOES,
 * and this is a constraint rather than a preference. `agent-worker/wrangler.jsonc`
 * records a deliberate FLEET decision at its `main` key: THE SOURCE DEPLOYS, NOT
 * A BUNDLE, because a committed bundle is "a second place its version lives and a
 * committed artifact that can drift from its source (D-106's class)". The member
 * is three modules (`index.mjs` imports `./harness.mjs` and `./subsession.mjs`),
 * so a raw REST upload of one part cannot resolve them — a REST deployer would
 * therefore FORCE a build step and silently reverse FLEET's decision. Wrangler
 * bundles from source at deploy, so routing through it keeps that decision
 * intact. The generated config below is a TEMP FILE, deleted in a finally, and
 * the tracked config is never written to.
 *
 * (The INSTALLER cannot do any of this — it is a Worker and cannot run wrangler,
 * so DS-1's installer half needs a bundled, hashed, signed asset per member in
 * the release. That is a release-format change and is where FLEET's no-build-step
 * decision has to be revisited deliberately, with FLEET told. It is NOT decided
 * here; see D-297.)
 *
 * usage:
 *   node tools/deploy-fleet.mjs <member> --instance <slug>
 *   node tools/deploy-fleet.mjs agent-worker --instance biosmoke7 --dry-run
 */
import { readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(n); return i === -1 ? null : (argv[i + 1] ?? ""); };
const DRY = argv.includes("--dry-run");
const member = argv.find((a) => !a.startsWith("--") && argv[argv.indexOf(a) - 1] !== "--instance");
const instance = flag("--instance");

/* The placeholder every fleet config names, and the reason this tool exists. It
   is a NAME IN A FILE and never a worker in an account. */
const PHANTOM = "bio-plane";

const die = (code, msg, detail) => {
  console.error(`REFUSED [${code}]: ${msg}`);
  if (detail) console.error(detail);
  process.exit(1);
};

if (!member) die("NO_MEMBER", "name the fleet member to deploy.",
  "usage: node tools/deploy-fleet.mjs <member> --instance <slug>");
if (!instance) die("NO_INSTANCE",
  "--instance is required and has NO DEFAULT, deliberately.",
  "A default would be a hardcoded instance name, which is the defect (D-292) this tool exists to fix.");

/* STRUCTURAL: this tool deploys FLEET MEMBERS. Membership is decided by the
   member's own marker file (D-117), not by a name list here, so it cannot be
   pointed at the plane, at `civicos`, or at `newgroup` even by mistake — the
   mirror of deploy.mjs's NOT_A_PLANE refusal, from the other side. */
const memberDir = join(ROOT, member);
if (!existsSync(join(memberDir, "fleet-member.json"))) {
  die("NOT_A_FLEET_MEMBER",
    `"${member}" carries no fleet-member.json, so it is not a fleet member.`,
    "The plane is deployed with bio-plane/scripts/deploy.mjs (baton-gated) and the UI with\n" +
    "civicos-ui/deploy-ui.mjs. This tool deploys only members that declare themselves one.");
}

/* JSONC, and the comment stripper is STRING-AWARE. A naive /\/\/.*$/ strip
   corrupts any config holding a URL, and these configs hold several. */
function stripJsonc(text) {
  let out = "", inStr = false, quote = "", inLine = false, inBlock = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (inLine) { if (c === "\n") { inLine = false; out += c; } continue; }
    if (inBlock) { if (c === "*" && n === "/") { inBlock = false; i++; } continue; }
    if (inStr) {
      out += c;
      if (c === "\\") { out += text[++i] ?? ""; continue; }
      if (c === quote) inStr = false;
      continue;
    }
    if (c === '"' || c === "'") { inStr = true; quote = c; out += c; continue; }
    if (c === "/" && n === "/") { inLine = true; i++; continue; }
    if (c === "/" && n === "*") { inBlock = true; i++; continue; }
    out += c;
  }
  return out;
}

const cfgPath = join(memberDir, "wrangler.jsonc");
if (!existsSync(cfgPath)) die("NO_CONFIG", `"${member}" has no wrangler.jsonc.`);
let cfg;
try { cfg = JSON.parse(stripJsonc(readFileSync(cfgPath, "utf8"))); }
catch (e) { die("UNPARSEABLE_CONFIG", `${member}/wrangler.jsonc did not parse.`, String(e.message)); }

/* THE TEMPLATING, and it is the whole point. Every service target equal to the
   phantom becomes the instance slug. A target that is NOT the phantom is left
   exactly as written — this tool substitutes one known placeholder and never
   guesses at a name somebody meant on purpose. */
const substituted = [];
for (const svc of cfg.services || []) {
  if (svc.service === PHANTOM) {
    svc.service = instance;
    substituted.push(`${svc.binding} -> ${instance}  (was the phantom "${PHANTOM}")`);
  } else {
    substituted.push(`${svc.binding} -> ${svc.service}  (left as written)`);
  }
}

console.log(`member   : ${member}`);
console.log(`instance : ${instance}`);
console.log(`account  : ${cfg.account_id || "(not pinned — wrangler will choose, which CLAUDE.md forbids)"}`);
console.log("bindings :");
for (const line of substituted) console.log(`   ${line}`);
if (!substituted.length) console.log("   (none declared)");

if (!cfg.account_id) {
  die("ACCOUNT_NOT_PINNED",
    `${member}/wrangler.jsonc does not pin account_id.`,
    "With no pin the MACHINE's OAuth session decides where this goes, and this machine\n" +
    "defaults to the neo persona. A deploy would SUCCEED into the wrong account with no\n" +
    "error to notice (CLAUDE.md, measured 2026-07-31).");
}

/* PRE-FLIGHT: every service target must EXIST, checked before the upload rather
   than discovered as Cloudflare's 10143. This is D-292 turned from a note into a
   guard: the refusal names the missing worker and what to do, instead of a
   vendor error code the reader has to decode. */
const TOKEN = process.env.CF_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
if (!TOKEN) die("NO_TOKEN", "CF_TOKEN / CLOUDFLARE_API_TOKEN is not set.", "It lives in .env; do not print it.");

async function scriptExists(slug) {
  const r = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${cfg.account_id}/workers/scripts/${slug}/settings`,
    { headers: { authorization: `Bearer ${TOKEN}` } });
  if (r.status === 404) return false;
  if (!r.ok) throw new Error(`checking ${slug}: http ${r.status}`);
  return true;
}

for (const svc of cfg.services || []) {
  let ok;
  try { ok = await scriptExists(svc.service); }
  catch (e) { die("PREFLIGHT_UNREADABLE", `could not check whether "${svc.service}" exists.`, String(e.message)); }
  if (!ok) {
    die("BINDING_TARGET_MISSING",
      `binding ${svc.binding} points at "${svc.service}", which does not exist in this account.`,
      svc.service === instance
        ? `The instance "${instance}" is not deployed. Deploy the plane first —\n` +
          "a fleet member binds to a plane that is already there."
        : `That name was left as written because it is not the phantom "${PHANTOM}".\n` +
          "Either it is a typo, or that worker has to be deployed first.");
  }
  console.log(`preflight: ${svc.service} exists`);
}

if (DRY) { console.log("\n--dry-run: nothing was deployed."); process.exit(0); }

/* The generated config is a TEMP FILE beside the member's own, so wrangler
   resolves `main` relative to the same directory. The tracked config is never
   written to — hardcoding the instance into it is the defect inverted. */
const genPath = join(memberDir, ".wrangler.deploy.generated.json");
let status = 1;
try {
  writeFileSync(genPath, JSON.stringify(cfg, null, 2) + "\n");
  console.log(`\ngenerated: ${member}/.wrangler.deploy.generated.json (temporary)`);
  /* Wrangler is a devDependency of `bio-plane` ONLY — no fleet member installs
     it, and none should: a second copy is a second version to drift. So the
     binary is resolved by PATH rather than by `npx`, which searches the CWD's
     own node_modules and fails from a member directory with
     "npx canceled due to missing packages" (measured 2026-09-10, this tool's
     first real run). The CWD still has to be the member's directory so wrangler
     resolves `main` and the module graph from there. */
  const wrangler = join(ROOT, "bio-plane", "node_modules", ".bin", "wrangler");
  if (!existsSync(wrangler)) {
    throw new Error(`wrangler not found at ${wrangler} — run npm ci in bio-plane/ first ` +
      "(a fresh worktree has no node_modules; CLAUDE.md's measured trap).");
  }
  execFileSync(wrangler, ["deploy", "-c", genPath],
    { cwd: memberDir, stdio: "inherit", env: { ...process.env, CLOUDFLARE_API_TOKEN: TOKEN } });
  status = 0;
} catch (e) {
  console.error(`\nwrangler deploy FAILED: ${e.message}`);
} finally {
  rmSync(genPath, { force: true });
  console.log("generated config removed");
}
if (status !== 0) process.exit(status);

/* A DEPLOY VERIFIED IS NOT A BUILD SERVING (CLAUDE.md, D-108). deploy.mjs waits
   for /version and so does this — the fleet members answer the same shape. */
async function subdomain() {
  try {
    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfg.account_id}/workers/subdomain`,
      { headers: { authorization: `Bearer ${TOKEN}` } });
    if (!r.ok) return null;
    const j = await r.json();
    return j?.success ? j.result?.subdomain ?? null : null;
  } catch { return null; }
}

const want = String(cfg.vars?.VERSION ?? "");
const sub = await subdomain();
if (!sub || !want) {
  console.log("rollout: cannot confirm what is SERVING (no subdomain or no declared VERSION).");
  console.log("         The deploy reported success. Do not measure behaviour yet.");
  process.exit(0);
}
const url = `https://${member}.${sub}.workers.dev/version`;
const t0 = Date.now();
for (let attempt = 1; attempt <= 15; attempt++) {
  let seen = null;
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (r.ok) { const j = await r.json().catch(() => null); seen = j?.version ?? null; }
  } catch { /* mid-rollout a request can simply fail; that is not an answer */ }
  if (seen === want) {
    console.log(`rollout: ${member} serving ${want} after ${Math.round((Date.now() - t0) / 1000)}s`);
    process.exit(0);
  }
  if (attempt === 1) console.log(`rollout: serving ${seen ?? "(no answer)"}, waiting for ${want}…`);
  await new Promise((s) => setTimeout(s, 4000));
}
console.log(`\n  !! ROLLOUT NOT CONFIRMED after 60s: ${url} does not answer ${want}.`);
console.log("  !! The deploy succeeded; this is about which build is answering. Do not measure yet.");
process.exit(0);
