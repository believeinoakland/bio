/* Part 2 of the BIO installer: the wizard Worker.
 *
 * Lives at newgroup.believeinoakland.workers.dev. Serves the wizard page,
 * receives the OAuth return, and provisions the group's instance into THEIR
 * Cloudflare account, server-side. Server-side because it must be: the
 * management API answers no CORS preflight, so a browser can never call it
 * with an Authorization header. Tested twice; do not re-test hoping for a
 * different answer.
 *
 * Custody of the access token, and the guarantees this file keeps:
 *   - The token is scoped to exactly five permissions (R2), granted on a consent
 *     screen the user reads, revocable from their dashboard, short-lived.
 *   - It exists in a local variable for the seconds provisioning takes. This
 *     Worker has NO storage bindings of any kind, so there is nowhere to
 *     write it even by mistake. Statelessness is structural, not promised.
 *   - It is never echoed into HTML, logs, or error text. The test suite
 *     asserts its absence from every byte this Worker emits.
 *
 * The one failure we cannot put a sentence on screen for: a redirect URL
 * mismatch fails on Cloudflare's side before the user ever returns here.
 * REDIRECT below must remain character-identical to the URL registered on
 * the OAuth client. When the domain moves, add the new URL alongside the old
 * on the client, deploy, verify a real run, then remove the old.
 */

import { WIZARD_HTML, UPDATE_HTML, PAGE_CSS, PRODUCT, publisherFooter, PROFILE_CHOICES, ASSISTANT_OFFER, SECURITY_TOOLS } from "./ui.mjs";
import { RELEASE_SOURCE, RELEASE_VERSION } from "./release.mjs";
import { ARMED_SIGNERS } from "./signers.mjs";
/* One verifier, shared with the plane. The installer and the instance
   agree on what a valid signature is because they run the same code. */
import { verifySshsig, NS_RELEASE, NS_FLEET, fleetStatement } from "../../bio-plane/src/sshsig.mjs";
/* R30 (N234): the slug grammar and the member binding names are instance-setup's, imported, never copied. R34 (DEC-109):
   so is the block on who controls the copy, which the claim page shows in the same words (instance-setup R47). */
import { GROUP_SLUG_RE, FLEET_BINDINGS, hostingControlBlock } from "../../bio-plane/src/setup-fleet.mjs";

export const CFG = {
  CLIENT_ID: "1c2fdba3fc71cf88d26fcd7b90df95de",
  AUTHORIZE: "https://dash.cloudflare.com/oauth2/auth",
  TOKEN:     "https://dash.cloudflare.com/oauth2/token",
  API:       "https://api.cloudflare.com/client/v4",
  REDIRECT:  "https://newgroup.believeinoakland.workers.dev/callback",
  /* Exactly the scopes registered on the OAuth client, nothing more. R2 (M-Q8): the fourth is the Containers write
     scope, by the id Cloudflare's scope list gives it (`GET /client/v4/oauth/scopes`, read 2026-10-06: "Workers
     Containers Write", `containers.write`); it is asked so a container member can be installed (R38), and a group
     re-consents to it at its first update after T33 (R17). The fifth (T36, K2155) is "Connectivity Directory Bind",
     `connectivity-directory.bind` (the same list, read 2026-10-08), which binding a Workers VPC service needs (R45). */
  SCOPES:    ["workers-scripts.write", "workers-r2.write", "account-settings.read", "containers.write", "connectivity-directory.bind"],
  /* R46 (K2155): every Logpush API call, the job list included, needs "Logs Write" (`account-logs.write`), a write power
     over the group's logging that R2 does not ask: the check reads the list and, refused, states itself undetermined
     with the one check the operator can make. Named here so the reason is in one place; never asked. */
  LOGPUSH_SCOPE: "account-logs.write",
  COOKIE:    "bio_wiz",
  COOKIE_MAX_AGE_S: 900,
  /* Public releases: two committed files in the repo's release/ folder on
     main, readable without any API token or rate limit. RELEASE.json names
     the version and the asset's SHA-256, and nothing fetched is ever
     installed without passing that check. */
  RELEASE_LATEST: "https://raw.githubusercontent.com/believeinoakland/bio/main/release",
};

/* ---------------------------------------------------------- release source */

const hex = (buf) => [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, "0")).join("");
const vcmp = (a, b) => {
  const A = String(a).split(".").map(Number), B = String(b).split(".").map(Number);
  for (let i = 0; i < 3; i++) { const d = (A[i] || 0) - (B[i] || 0); if (d) return d; }
  return 0;
};

/* The keys this installer trusts to have signed a release live in
 * `signers.mjs`, so the embed step can verify the built-in copy against the
 * SAME list without importing the module it generates (2026-09-18, DIST). */
export { ARMED_SIGNERS };

const relHeaders = { "user-agent": "bio-installer" };
async function fetchRepoManifest() {
  const rj = await fetch(CFG.RELEASE_LATEST + "/RELEASE.json", { redirect: "follow", headers: relHeaders });
  if (!rj.ok) throw new Error("manifest http " + rj.status);
  return rj.json();
}
async function fetchRepoAsset(man) {
  const ra = await fetch(CFG.RELEASE_LATEST + "/" + (man.asset || "bio-plane.bundled.mjs"), { redirect: "follow", headers: relHeaders });
  if (!ra.ok) throw new Error("asset http " + ra.status);
  const bytes = new Uint8Array(await ra.arrayBuffer());
  const got = hex(await crypto.subtle.digest("SHA-256", bytes));
  if (got !== man.sha256) {
    const e = new Error("integrity"); e.integrity = true; throw e;
  }
  if (ARMED_SIGNERS.length) {
    if (typeof man.sig !== "string" || !man.sig.trim()) {
      const e = new Error("unsigned"); e.unsigned = true; throw e;
    }
    const v = await verifySshsig(man.sig, bytes, NS_RELEASE, ARMED_SIGNERS);
    if (!v.ok) {
      const e = new Error("signature"); e.signature = true; e.reason = v.reason; throw e;
    }
  }
  return new TextDecoder().decode(bytes);
}

/* The installer prefers the newest verified release from the public
   repository and always has its built-in copy to stand on. It never installs
   anything that failed verification, and it always says which copy it used
   and why, in words a person can act on. */
async function selectRelease(emit) {
  emit.step("rel", "Checking the public repository for the newest release");
  /* The manifest travels with the selection (IC-82): the fleet half reads
     `fleet[]`/`fleetSig` from it. null means the repository was unreachable —
     a STATED absence the fleet step reports, never rounds to "no members". */
  let man = null, said = "";
  try {
    man = await fetchRepoManifest();
    if (vcmp(man.version, RELEASE_VERSION) > 0) {
      const source = await fetchRepoAsset(man);
      /* R20: verified bytes that state no readable limits are not used either; the built-in stands in, and the page says why. */
      const lim = planeLimits(source);
      if (lim.ok) {
        emit.ok("rel", "The repository has " + man.version + ", newer than the built-in "
          + RELEASE_VERSION + ". "
          + (ARMED_SIGNERS.length
              ? "It carries a valid signature from a key this installer trusts, so that is what installs."
              : "Its integrity checked out, so that is what installs."));
        return { version: String(man.version), source, from: "repository", man, limits: lim.limits };
      }
      said = "The repository has " + man.version + ", but it " + LIMITS_NOT_STATED[lim.why]
        + (lim.detail ? " (" + lim.detail + ")" : "") + ", so it was NOT used. The installer's own built-in release ("
        + RELEASE_VERSION + ") installs instead.";
    } else said = "The built-in release (" + RELEASE_VERSION + ") is current.";
  } catch (e) {
    /* R11: a repository that answered, but whose plane failed verification, was REACHABLE: its manifest stays, so the
       fleet step names the true reason its members are left out (they are signed against a plane this act did not
       install) rather than "not reachable". Only a repository that did not answer leaves no manifest. */
    if (!(e && (e.integrity || e.unsigned || e.signature))) man = null;
    const fallback = " The installer's own built-in release (" + RELEASE_VERSION
      + ") installs instead, which is safe. This is worth mentioning to the publisher of " + PRODUCT + " releases.";
    said = (
      e && e.integrity
        ? "The repository's copy did not pass its integrity check, so it was NOT used." + fallback
      : e && e.unsigned
        ? "The repository's copy carries no signature, and this installer only accepts signed releases, "
          + "so it was NOT used." + fallback
      : e && e.signature
        ? "The repository's copy is signed, but not by a key this installer trusts (" + (e.reason || "invalid")
          + "), so it was NOT used." + fallback
        : "The public repository was not reachable just now, so the built-in release ("
          + RELEASE_VERSION + ") is used. That is fine.");
  }
  /* R20: the built-in is held to the same rule. One that states no readable limits is refused by name, before any plane
     upload; the caller stops the act (`refused`) and nothing installs. */
  const lim = planeLimits(RELEASE_SOURCE);
  if (!lim.ok) {
    emit.no("rel", said);
    return { refused: "This installer's built-in release (" + RELEASE_VERSION + ") " + LIMITS_NOT_STATED[lim.why]
      + (lim.detail ? " (" + lim.detail + ")" : "") + ". The limits your group's Civicsmith runs under are a decision the signed release states, and "
      + "this installer holds no value of its own to send in their place." };
  }
  emit.ok("rel", said);
  return { version: RELEASE_VERSION, source: RELEASE_SOURCE, from: "built-in", man, limits: lim.limits };
}

/* ------------------------------------------------------------------ utils */

const enc = new TextEncoder();
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)))
  .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const rand = (n) => b64url(crypto.getRandomValues(new Uint8Array(n)));
const s256 = async (s) => b64url(await crypto.subtle.digest("SHA-256", enc.encode(s)));

const json = (o, status = 200, headers = {}) =>
  new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", ...headers } });
const html = (s, status = 200, headers = {}) =>
  new Response(s, { status, headers: { "content-type": "text/html; charset=utf-8", ...headers } });

/* Only what the browser will render as text gets escaped. Secrets we
   generate are base64url and need no escaping, but error detail from the
   management API is arbitrary text and goes through here. */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const slugOk = (s) => typeof s === "string" && GROUP_SLUG_RE.test(s) && s !== "newgroup";

const readCookie = (req, name) => {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(/;\s*/)) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i) === name) return part.slice(i + 1);
  }
  return null;
};
const setCookie = (v, maxAge) =>
  `${CFG.COOKIE}=${v}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;

/* ---------------------------------------------------- management API glue */

async function exchange(code, verifier) {
  const body = new URLSearchParams({
    grant_type: "authorization_code", code, redirect_uri: CFG.REDIRECT,
    client_id: CFG.CLIENT_ID, code_verifier: verifier,
  });
  const r = await fetch(CFG.TOKEN, { method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token)
    throw new Error(j.error_description || j.error || `HTTP ${r.status}`);
  /* R38: the scopes the operator actually granted, as the token response states them (null when it states none). */
  return { token: j.access_token, scope: typeof j.scope === "string" ? j.scope : null };
}

async function cf(token, path, init = {}) {
  const r = await fetch(CFG.API + path, { ...init, headers: {
    authorization: "Bearer " + token,
    ...(init.body instanceof FormData ? {} : { "content-type": "application/json" }),
    ...(init.headers || {}) } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.success === false) {
    const e = new Error(j.errors?.[0]?.message || `HTTP ${r.status}`);
    e.code = j.errors?.[0]?.code;
    e.status = r.status;
    throw e;
  }
  return j.result;
}

async function scriptExists(token, acct, slug) {
  try { await cf(token, `/accounts/${acct}/workers/scripts/${slug}/settings`); return true; }
  catch (e) { if (e.status === 404) return false; throw e; }
}

/* DIST-3 / DEC-42: Workers Paid IS a requirement, and the plan is established
   by PROVOKING the platform, never by reading a plan field — a field is a
   claim, a refusal is a measurement (the 2026-07-31 BOB session measured the
   provocation and free-tier-fleet-probe.mjs reproduces it). A PUT carrying
   `limits.cpu_ms` is refused on Free with code 100328 and accepted on Paid.
   The probe script is a throwaway with a fixed recognisable name, deleted on
   the spot; a fixed name means a re-run converges on any leftover instead of
   accumulating strays. Three honest answers and no fourth: "free", "paid",
   or "unknown" with the reason — an unverified plan is not a verified one. */
const PLAN_PROBE = "bio-plan-probe";
async function establishPlan(token, acct) {
  const meta = { main_module: "index.mjs", compatibility_date: "2026-07-01",
                 limits: { cpu_ms: 50000 } };
  const src = 'export default { async fetch() { return new Response("bio plan probe"); } };';
  try {
    await cf(token, `/accounts/${acct}/workers/scripts/${PLAN_PROBE}`,
      { method: "PUT", body: uploadForm(meta, src) });
  } catch (e) {
    if (e.code === 100328) return { plan: "free" };
    return { plan: "unknown", detail: e.message };
  }
  let leftover = false;
  try { await cf(token, `/accounts/${acct}/workers/scripts/${PLAN_PROBE}?force=true`,
    { method: "DELETE" }); }
  catch { leftover = true; /* stated to the operator, not swallowed */ }
  return { plan: "paid", leftover };
}

/* Both buckets or neither: the fence is a pair. "Already exists" counts as
   created, so a re-run after a mid-flight failure converges instead of
   failing on its own earlier success. */
const BUCKETS = ["bio-captures", "bio-published"];
async function ensureBuckets(token, acct) {
  for (const name of BUCKETS) {
    try { await cf(token, `/accounts/${acct}/r2/buckets`, {
      method: "POST", body: JSON.stringify({ name }) }); }
    catch (e) { if (!/already exists/i.test(e.message)) throw e; }
  }
}

/* R32 (K102): until installs are isolated (R24), ONE COPY PER ACCOUNT. A copy is the plane with its two evidence buckets
   and its fleet workers, and every one of them has a fixed name today, so a second install into an account that holds a
   copy would share its buckets and overwrite its members. `copyHeld` reads, creating nothing, which of those parts the
   account already holds, and names each. A lookup that fails for any reason other than "not found" THROWS: an absence
   not established is not established, and the caller refuses (as R5 refuses a failed lookup). `members` are the fleet
   workers to look for: instance-setup's FLEET_BINDINGS at `fresh`, and any further member the chosen release names. */
async function bucketExists(token, acct, name) {
  try { await cf(token, `/accounts/${acct}/r2/buckets/${name}`); return true; }
  catch (e) { if (e.status === 404) return false; throw e; }
}
async function copyHeld(token, acct, { buckets = true, members = [] } = {}) {
  const held = [];
  if (buckets) for (const name of BUCKETS) if (await bucketExists(token, acct, name)) held.push(`the evidence bucket ${name}`);
  for (const member of members) if (await scriptExists(token, acct, member)) held.push(`the capability worker ${member}`);
  return held;
}
const ONE_COPY = `One installation of ${PRODUCT} per Cloudflare account is supported for now`;

/* R33 (Distribution §5, "byte-verified on read-back"): the plane's script as the account now holds it, read back and
   hashed against the release's own bytes, never believed from the upload's answer. The account answers the script
   either as the module itself or as a multipart body whose `index.mjs` part is the module (as `deploy.mjs` reads it).
   `null` when nothing readable came back: an unread script is not a matching one. */
async function scriptHash(token, acct, slug) {
  let r;
  try {
    r = await fetch(`${CFG.API}/accounts/${acct}/workers/scripts/${slug}`,
      { headers: { authorization: "Bearer " + token, accept: "application/javascript+module" } });
  } catch { return null; }
  if (!r.ok) return null;
  const ct = r.headers.get("content-type") || "";
  let bytes = new Uint8Array(await r.arrayBuffer());
  if (/multipart/i.test(ct)) {
    const m = /boundary="?([^";]+)"?/i.exec(ct);
    if (!m) return null;
    const text = new TextDecoder("latin1").decode(bytes);
    const part = text.split("--" + m[1]).find((p) => /name="index\.mjs"/.test(p.slice(0, p.indexOf("\r\n\r\n"))));
    if (!part) return null;
    const body = part.slice(part.indexOf("\r\n\r\n") + 4).replace(/\r\n$/, "");
    bytes = Uint8Array.from(body, (c) => c.charCodeAt(0));
  }
  return hex(await crypto.subtle.digest("SHA-256", bytes));
}
/* After a plane upload the account accepted: up to three reads, stopping at the first that matches. Answers null when the
   bytes are the release's, else the lag to name (R15's list: no success is claimed while it stands). */
async function readBack(token, acct, slug, release) {
  const want = hex(await crypto.subtle.digest("SHA-256", enc.encode(release.source)));
  let got = null;
  for (let i = 0; i < 3; i++) {
    got = await scriptHash(token, acct, slug);
    if (got === want) return null;
    if (i < 2) await new Promise((res) => setTimeout(res, 1500));
  }
  return got === null
    ? `the software your Cloudflare account holds for your group's Civicsmith could not be read back, so it is not confirmed to be the ${release.version} release's own bytes`
    : `the software your Cloudflare account holds for your group's Civicsmith is not the ${release.version} release's own bytes (read back, it hashes to ${got.slice(0, 16)}…; the release hashes to ${want.slice(0, 16)}…)`;
}

function uploadForm(meta, source) {
  const fd = new FormData();
  fd.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
  fd.append("index.mjs", new Blob([source], { type: "application/javascript+module" }), "index.mjs");
  return fd;
}

/* REC-26 / D-102 again: the instance name IS the worker name, so a Worker's
   binding to ITSELF names the same `slug` the group already chose. This is what
   the plane's `#monitorConfigured()` looks for, and without it BOTH monitoring
   consumers — CAP-3's archive fallback and REC-26's monitor cadence — contribute
   no wake and hold no alarm: built, tested, and wired to nothing on every
   installed instance (MACHINE-PROCESSES.md §0). A loopback service binding is the
   only way a Durable Object can reach its own control plane, which is how those
   consumers fire the SAME ops a caller uses (D-112: one path, no drift).

   THE CREDENTIAL, decided 2026-08-04 (DIST-1) and deliberately NOT a new secret:
   the plane's `#monitorToken()` is `env.MONITOR_TOKEN || env.ADMIN_TOKEN`, but its
   `classify()` recognises only the binding credentials it names (ADMIN_TOKEN, PROBE_TOKEN, DAEMON_TOKEN; no
   MEMBER_TOKEN since N711: the shared member key is retired, R9, and members sign in with their own sessions). Binding a
   MONITOR_TOKEN here — and nothing else — would make every tick SELECT a token the
   plane then refuses, while `#monitorConfigured()` stayed true: an armed alarm
   firing 401s forever, which is worse than the ADMIN_TOKEN it replaced. The scoped
   credential was a DELEGATION to RECORD (2026-08-04 DIST → RECORD) that landed as
   REC-33: classify() now recognises DAEMON_TOKEN as the daemon class, reaching
   exactly two ops, and #monitorToken() prefers it. So the constraint above is
   satisfied in the required order and BOTH upload paths bind DAEMON_TOKEN below
   (DIST-2). The ADMIN_TOKEN fallback remains in the plane until DEC-43's
   retirement conditions are measured (DIST-4's count); an instance that never
   updates keeps monitoring on ADMIN_TOKEN, which is exactly the population that
   report exists to name. */
const selfBinding = (slug) => ({ type: "service", name: "SELF", service: slug });
/* DIST-11 (IC-252's owed act): the Browser Rendering binding, the same name the plane's `wrangler.jsonc` declares. */
export const BROWSER_BINDING = Object.freeze({ type: "browser", name: "BROWSER" });

/* DIST-6 — THE PLANE IS BOUND TO THE FLEET MEMBERS INSTALLED BESIDE IT (`BIO_Distribution_v0_1.md` §2, §4).
 *
 * Until DIST-6 both upload paths below bound the plane its buckets, its secrets and SELF and NOTHING ELSE, so on a
 * group's own copy `installFleet` uploaded pdf-worker, ocr-worker and agent-worker and the plane could reach none of
 * them: tier-2/3 extraction and the assistant member did nothing there (found by D-116's worker, 2026-09-23; D-116's
 * verify step read each member UNBOUND). The binding NAMES are the plane's own, instance-setup's `FLEET_BINDINGS`,
 * imported (R30); the TARGET is the script name `installFleet` uploads each member under (`m.member`), never the
 * plane's slug and never a name in a file. A member absent from that list (a release naming a member the plane does not
 * call) is uploaded and not bound.
 *
 * THE ORDER, and the evidence it rests on. Cloudflare REFUSES an upload whose service binding names a worker that does
 * not exist — measured here, not read in a vendor page: `bio-plane/scripts/deploy-fleet.mjs` records the refusal
 * ("Service binding 'PLANE' references Worker 'bio-plane' which was not found [code: 10143]"), measured 2026-08-10
 * and re-measured 2026-09-10. And agent-worker's own manifest binds PLANE -> the plane's slug. So the fleet and the
 * plane bind EACH OTHER, and neither can be uploaded first holding a binding to the other on a fresh account: members
 * first would be refused on agent-worker's PLANE exactly as the plane-first upload would be refused on AGENT_WORKER.
 * The order that needs no assumption about binding to a missing worker is therefore THREE acts:
 *   1. the plane, bound only to the members the account ALREADY holds (`membersPresent`; none on a fresh account);
 *   2. the members (`installFleet`), whose PLANE binding now resolves;
 *   3. the plane RE-PUT, bound to every member now present (`bindMembers`) — only when step 2 added one.
 * Step 1 binding what already exists is what keeps an UPDATE from un-binding a working copy's members for the
 * duration of the update, or for good when the fleet step cannot run (the repository unreachable): `service` is not
 * in `keep_bindings`, so a member not restated in a PUT is a member dropped. */
const BINDING_OF = new Map(FLEET_BINDINGS);
const memberBindings = (members = []) => [...BINDING_OF]
  .filter(([member]) => members.includes(member))
  .map(([member, name]) => ({ type: "service", name, service: member }));

/* Which bindable members this account already holds. A lookup that fails for any reason other than "not found" is
   read as NOT PRESENT for this PUT — binding a worker whose existence is unestablished is the refusal above — and
   step 3 binds whatever step 2 then uploads. */
async function membersPresent(token, acct) {
  const present = [];
  for (const member of BINDING_OF.keys()) {
    try { if (await scriptExists(token, acct, member)) present.push(member); } catch { /* unestablished: not bound */ }
  }
  return present;
}

/* DIST-9 — THE INSTANCE'S ORGANISATION `ai` CREDENTIAL (D-260, BOB #22; `BIO_Distribution_v0_1.md` §6 and
 * `BIO_Assistant_and_AI_Roles_v0_1.md` §6). Since D-260 the plane READS the Worker secret `INSTANCE_AI_TOKEN`
 * (`bio-plane/src/tokens.mjs`) and, with it, re-enters the woken runs that credential opened; without it every wake
 * entry says NO_INSTANCE_AI_CREDENTIAL. The installer CARRIES it, "as DAEMON_TOKEN is" — and differs from DAEMON_TOKEN
 * in the one way that matters: it NEVER GENERATES ONE. A DAEMON_TOKEN is the installer's own credential, spent only by
 * the plane over SELF, so minting it here is correct. An `ai` credential is a MEMBER's act (DEC-55 (3), DS-3): it is
 * minted on the copy by `op=aicredentialmint`, which records its principal, and a value invented here would be resolved
 * against no row and name no principal — a secret that claims to be a credential and is not one. So: a value the
 * operator supplies is bound; none supplied binds nothing and the page SAYS so (an absence not stated is
 * indistinguishable from one nobody checked). The value is never printed on any page. It rides from `/begin` to
 * `/callback` in the same HttpOnly, Secure, SameSite=Lax cookie as the PKCE verifier, which this browser alone holds and
 * the callback clears. */
export const INSTANCE_AI_BINDING = "INSTANCE_AI_TOKEN";
const INSTANCE_AI_RE = /^[\x21-\x7e]{16,512}$/;
export const instanceAiOk = (v) => typeof v === "string" && INSTANCE_AI_RE.test(v);
const instanceAiBinding = (v) => instanceAiOk(v) ? [{ type: "secret_text", name: INSTANCE_AI_BINDING, text: v }] : [];

/* K1541 (B1) — THE SEAL SECRET. `credentials` seals each member's own Claude account or API key under a key it derives
 * from the Worker secret ACCOUNT_SEAL_SECRET; unbound, a member cannot connect one (ACCOUNT_SEAL_UNAVAILABLE). The
 * install generates it with the other credentials and never shows it (no person ever spends it). An update NEVER
 * restates it over one the copy holds: a new value would make every reference already sealed unreadable. So an update
 * binds a fresh one only when the script's own settings show the copy holds none, and sends nothing when they cannot
 * be read (the page says which). */
export const SEAL_BINDING = "ACCOUNT_SEAL_SECRET";
const sealBinding = (v) => typeof v === "string" && v ? [{ type: "secret_text", name: SEAL_BINDING, text: v }] : [];

/* R36 (K1502, K1755) — THE INSTALLER BINDS NO CLAUDE CREDENTIAL. The group's Anthropic API key, when the group chooses
 * one, is set inside the copy by an administrator (`credentials`' sealed table), and a member's own account is connected
 * there by the member. Nothing here takes, generates, binds or shows one, and an update removes the binding a copy
 * installed before K1502 may hold (keep_bindings would otherwise keep it). */
export const RETIRED_CLAUDE_BINDING = "INSTANCE_CLAUDE_TOKEN";

/* The bindings the copy's plane script holds, read from its settings, as a map from name to type (names and types
   only: a secret's value is never readable). null when the settings cannot be read or state no bindings: unknown,
   never "none". */
async function heldBindings(token, acct, slug) {
  try {
    const s = await cf(token, `/accounts/${acct}/workers/scripts/${slug}/settings`);
    if (!s || !Array.isArray(s.bindings)) return null;
    return new Map(s.bindings.filter((b) => b && typeof b.name === "string").map((b) => [b.name, b.type]));
  } catch { return null; }
}

/* R37 and R17 (T36; N711, N721; DEC-172) — THE BINDINGS NO INSTALLER WRITES ANY MORE. The install takes no choice about
   the assistant (its two settings are made in your group's Civicsmith at its setup, setup-page R18) and generates no
   shared member key (R9). An update leaves neither behind, as it leaves no INSTANCE_CLAUDE_TOKEN (R36): each held
   before the update is removed, a secret by its own deletion and a plain value by the update's upload (which keeps no
   plain value it does not restate), and a refused deletion is named. `RETIRED_BINDINGS` is every such name, with what
   the page says it was. */
export const ASSISTANT_BINDING = "ASSISTANT_ENABLED";
export const MEMBER_BINDING = "MEMBER_TOKEN";
export const RETIRED_BINDINGS = Object.freeze([
  [RETIRED_CLAUDE_BINDING, "the Claude credential an earlier installer bound into your group's Civicsmith"],
  [MEMBER_BINDING, "the shared member key an earlier installer bound into your group's Civicsmith (members now sign in with their own sessions)"],
  [ASSISTANT_BINDING, "the assistant choice an earlier installer bound into your group's Civicsmith (the assistant's settings are made inside it, at its setup)"],
]);

/* R47 (T36; N745, K2038) — THE COPY'S OWN HOSTS. `OWN_HOSTS`, plain text, the host names the copy answers at,
   comma-separated, so it knows its own hosts before a group domain is claimed (plane R28). Today that is its workers.dev
   address (R14), the only address this installer gives it. Written only once that address is enabled: the install's
   last plane upload, after `addr`, carries it, and an update restates it from the address it finds (plain values are
   not kept by an update's upload). No address, no binding, and the page says so. */
export const OWN_HOSTS_BINDING = "OWN_HOSTS";
const ownHostsBinding = (hosts) => Array.isArray(hosts) && hosts.length
  ? [{ type: "plain_text", name: OWN_HOSTS_BINDING, text: hosts.join(",") }] : [];
const hostOf = (base) => { try { return base ? new URL(base).host : null; } catch { return null; } };

/* R20 (DIST-15, N336) — THE PLANE'S LIMITS, AS THE SIGNED RELEASE STATES THEM.
 *
 * DIST-7 sent a constant pinned to the plane's config, so an installer installing a later release with another ceiling
 * still sent its own. Now the plane's code states its limits (control-plane's statement, equal to `bio-plane/wrangler.jsonc`'s
 * `limits`), so the bundle a release signs carries them, and this reads them from the bytes R8 chose and verified: the
 * installer holds no value of its own. The statement is a string literal, `bio-plane-limits/1 key=n …`, because a bundler
 * rewrites numbers, renames constants and changes quotes, and a string's text survives all three; the bundle cannot be
 * executed here (a Worker imports no string), so it is read as text. Nothing is added to the fleet statement: the
 * limits ride inside the plane bytes the release signature and the fleet statement's plane hash already cover, so an
 * older installer still verifies the fleet signature of a release that carries them.
 *
 * `{ok: true, limits}`; or `{ok: false, why: "none"}` (no statement); or `{ok: false, why: "unreadable", detail}` (two
 * different statements, or one not of the form). */
/* One reader for both statements: the plane's (`bio-plane-limits/1`, R20) and a fleet member's (`bio-member-limits/1`,
   R39). The tag is matched as a whole quoted string, so neither statement is ever read as the other. */
function statedLimits(source, tag) {
  if (typeof source !== "string") return { ok: false, why: "none" };
  const bodies = new Set();
  const re = new RegExp("([\"'`])" + tag.replace("/", "\\/") + "( [^\"'`\\\\\\n]*)\\1", "g");
  for (const m of source.matchAll(re)) bodies.add(m[2]);
  if (bodies.size === 0) return { ok: false, why: "none" };
  if (bodies.size > 1) return { ok: false, why: "unreadable", detail: "it states them " + bodies.size + " different ways" };
  const [body] = bodies;
  const limits = {};
  let last = "";
  for (const part of body.slice(1).split(" ")) {
    const kv = /^([a-z][a-z0-9_]*)=([1-9][0-9]{0,8})$/.exec(part);
    if (!kv || kv[1] <= last) return { ok: false, why: "unreadable",
      detail: `"${tag}${body}" is not one key=number per limit, keys sorted` };
    limits[(last = kv[1])] = Number(kv[2]);
  }
  return { ok: true, limits: Object.freeze(limits) };
}
export const planeLimits = (source) => statedLimits(source, "bio-plane-limits/1");
const LIMITS_NOT_STATED = { none: "states no limits for your group's Civicsmith to run under",
  unreadable: "states the limits your group's Civicsmith runs under unreadably" };

/* R39 (N621; K1686, K1731; `sheet-worker` R17) — A FLEET MEMBER'S LIMITS, AS ITS SIGNED BUNDLE STATES THEM. A member's
   bundle, fetched and hashed against the fleet statement (R11), may state its own limits as one string
   `bio-member-limits/1 key=n …`, read exactly as R20 reads the plane's. `{ok: true, limits}` (null when it states none:
   uploaded with none, as before), or `{ok: false, why}` in words (the member is left out, named). Nothing is added to the
   fleet statement: the limits ride inside the member bytes the statement's hash already covers. */
export function memberLimits(bytes) {
  const source = typeof bytes === "string" ? bytes : new TextDecoder().decode(bytes);
  const lim = statedLimits(source, "bio-member-limits/1");
  if (lim.ok) return lim;
  if (lim.why === "none") return { ok: true, limits: null };
  return { ok: false, why: "its bundle states its limits unreadably (" + lim.detail + ")" };
}

/* R21 (N10): the jurisdiction profiles the operator chose, in the order chosen, bound for the copy to record at its first
   boot (instance-setup R13). None chosen binds nothing, and R13 then records nothing. An update never sends it: only
   the install's own two plane uploads (the install PUT and its step-3 re-PUT, whose update shape keeps no `plain_text`,
   and which may precede the store's first boot) carry it. */
export const PROFILES_BINDING = "JURISDICTION_PROFILES";
const HELD_CHOICES = new Set(PROFILE_CHOICES.map((p) => p.id));
const profilesBinding = (ids) => Array.isArray(ids) && ids.length
  ? [{ type: "plain_text", name: PROFILES_BINDING, text: ids.join(",") }] : [];
/* The refusal for a `profiles` value /begin cannot bind, or null. */
function profilesRefusal(v, mode) {
  if (v === undefined) return null;
  if (mode === "update") return "An update never changes which jurisdiction profiles your group's Civicsmith reads; an administrator changes them on its setup page.";
  if (!Array.isArray(v)) return "The jurisdiction profiles must be a list of the profiles offered.";
  const bad = v.filter((id) => typeof id !== "string" || !HELD_CHOICES.has(id));
  if (bad.length) return "Not a jurisdiction profile this installer offers: " + bad.map((x) => JSON.stringify(x)).join(", ") + ".";
  if (new Set(v).size !== v.length) return "A jurisdiction profile was chosen twice.";
  return null;
}

/* `opts.noSelf` exists for ONE reason: an install PUT names a service binding to
   the script the same PUT creates, and nothing here can prove Cloudflare accepts
   that self-reference without a real install, which is deploy-gated. So the
   install degrades rather than failing — see the retry in runInstall. */
async function uploadInstall(token, acct, slug, secrets, release, opts = {}) {
  const meta = {
    main_module: "index.mjs",
    compatibility_date: "2026-07-01",
    compatibility_flags: ["nodejs_compat"],
    /* R20: the plane's limits exactly as the release R8 chose states them (selectRelease), never a value of our own. */
    limits: { ...release.limits },
    bindings: [
      { type: "durable_object_namespace", name: "STORE", class_name: "Store" },
      { type: "plain_text", name: "VERSION", text: release.version },
      /* D-102: the instance name IS the worker name. The group already chose it
         here as `slug`, so there is nothing further to ask them; binding it is
         what puts a real name in the user-agent instead of "unnamed", and it
         means the name a third party sees is the same one the operator types
         into a URL. One source of truth, no second name to drift out of sync. */
      { type: "plain_text", name: "INSTANCE_NAME", text: slug },
      { type: "secret_text", name: "ADMIN_TOKEN", text: secrets.boot },
      /* R9 (T36; N711, K1936 Q3): no MEMBER_TOKEN. The shared member key is retired; members sign in with their own
         sessions, and admission refuses a member bearer by name. */
      { type: "secret_text", name: "PROBE_TOKEN", text: secrets.probe },
      /* DIST-2 (REC-33's follow-on): the scoped monitoring credential. The
         plane's #monitorToken() is DAEMON_TOKEN || ADMIN_TOKEN and classify()
         already recognises the class — DIST-1's ordering constraint is
         satisfied in this direction, so binding it here narrows the daemon
         from the root-of-trust ADMIN_TOKEN to a credential that can reach
         exactly two ops. Deliberately NOT on the success panel: no human ever
         spends this value — the plane spends it over SELF — and a credential
         displayed is a credential that can leak for no gain. The ADMIN_TOKEN
         fallback stays until DEC-43's retirement conditions are measured. */
      { type: "secret_text", name: "DAEMON_TOKEN", text: secrets.daemon },
      /* DIST-9 (D-260's deploy half): the organisation `ai` credential, ONLY when the operator supplied one. */
      ...instanceAiBinding(secrets.instanceAi),
      /* K1541: the seal secret members' own account references are sealed under; never shown. */
      ...sealBinding(secrets.seal),
      /* R21: the chosen jurisdiction profiles, only when some were chosen. */
      ...profilesBinding(opts.profiles),
      { type: "r2_bucket", name: "CAPTURES", bucket_name: "bio-captures" },
      { type: "r2_bucket", name: "PUBLISHED", bucket_name: "bio-published" },
      ...(opts.noSelf ? [] : [selfBinding(slug)]),
      /* DIST-11 (IC-252): the Browser Rendering binding D-64's render arm looks for. On every Workers tier, so an
         install is never refused over it; the plane reports it as a binding whose in-plane driver is not built. */
      BROWSER_BINDING,
      /* DIST-6: the members this account already holds (none on a fresh account — see BINDING_OF). */
      ...memberBindings(opts.members),
    ],
    /* SQLite backend is the irreversible choice, made correctly, once. */
    migrations: { new_tag: "v1", new_sqlite_classes: ["Store"] },
  };
  return cf(token, `/accounts/${acct}/workers/scripts/${slug}`,
    { method: "PUT", body: uploadForm(meta, release.source) });
}

/* The update path. No fork, no CI/CD: the wizard re-uploads the current
   release into the existing script. keep_bindings preserves the instance's
   secrets, its Durable Object, and its buckets exactly as they are; VERSION
   is supplied fresh. No migrations field, because the Store class already
   exists and its storage backend never changes. Updates therefore cannot
   touch passwords or the record, and the success page says so. */
async function uploadUpdate(token, acct, slug, withR2, release, opts = {}) {
  /* When the account's storage is available the update binds it explicitly,
     which quietly completes any copy installed before storage became a
     requirement. When it is not, the update proceeds the old way, keeping
     whatever bindings exist: an update must never be refused over storage. */
  const meta = {
    main_module: "index.mjs",
    compatibility_date: "2026-07-01",
    compatibility_flags: ["nodejs_compat"],
    /* R20: as on install; restated every update, because a copy installed before DIST-7 has no limit to keep. */
    limits: { ...release.limits },
    bindings: [
      { type: "plain_text", name: "VERSION", text: release.version },
      /* D-102: bound on UPDATE as well as install, which is what retro-names
         every copy installed before this existed. Those instances advertise
         "unnamed" today; their next update fixes it with no action from the
         operator. Same reasoning as the R2 binding below: an update quietly
         completes what an older install left out. */
      { type: "plain_text", name: "INSTANCE_NAME", text: slug },
      ...(withR2 ? [
        { type: "r2_bucket", name: "CAPTURES", bucket_name: "bio-captures" },
        { type: "r2_bucket", name: "PUBLISHED", bucket_name: "bio-published" },
      ] : []),
      /* REC-26: bound on UPDATE as well as install, and for the same reason as
         INSTANCE_NAME above — every copy installed before this existed has no
         SELF binding, so its monitoring consumers are dormant right now, and its
         next update arms them with no action from the operator. Unlike the
         INSTANCE_NAME case there is nothing cosmetic about it: an instance
         without this binding never re-checks a source it was asked to monitor. */
      /* `opts.noSelf` only on the install's step-3 re-PUT of a copy whose install already had SELF refused
         (runInstall's retry): that re-PUT restates exactly what the install achieved plus the members, so a SELF
         refusal cannot also cost the copy its members. An update never passes it. */
      ...(opts.noSelf ? [] : [selfBinding(slug)]),
      /* DIST-6: the fleet members, by the same healing shape as SELF — an update of a copy installed without them
         gains them (step 3 of the order at BINDING_OF), and one that has them keeps them (step 1). */
      ...memberBindings(opts.members),
      /* DIST-11: restated on every update, because `browser` is not in keep_bindings below — an update that did not
         name it would DROP it from a copy that holds it, and one installed before DIST-11 gains it here. */
      BROWSER_BINDING,
      /* DIST-2: bound on UPDATE as well, same healing shape as SELF above — an
         instance installed before the daemon class existed has no DAEMON_TOKEN
         and keep_bindings cannot create what was never there, so without this
         line that instance monitors on the root-of-trust ADMIN_TOKEN forever
         (DEC-43's silent licence, and DIST-4's report is what will count who
         is still doing it). A FRESH value on every update is deliberate and
         harmless: nothing outside the worker's own env ever holds this
         credential, so there is no holder to invalidate. The three group
         passwords still travel ONLY by keep_bindings below — this metadata
         cannot restate values it never sees. An explicit binding replacing the
         kept one of the same name is the API's contract; the next gated real
         update run is where that is read back rather than trusted. */
      { type: "secret_text", name: "DAEMON_TOKEN", text: opts.daemon || rand(32) },
      /* DIST-9: restated ONLY when the operator supplied a value on this run. When none is supplied nothing is sent,
         and a value the copy already holds is KEPT by keep_bindings (secret_text) — an update neither sets nor clears
         it. Unlike DAEMON_TOKEN above there is NO `|| rand(32)` here, and there must never be one: see
         instanceAiBinding. */
      ...instanceAiBinding(opts.instanceAi),
      /* K1541: only when the copy is known to hold none (runUpdate reads its settings); never over one it holds. */
      ...sealBinding(opts.seal),
      /* R21: restated only by the install's step-3 re-PUT (see PROFILES_BINDING); an update never passes it. */
      ...profilesBinding(opts.profiles),
      /* R47: the copy's own hosts, restated on every upload of this shape that knows them (an install's last upload,
         after its address is enabled; an update, from the address it found). */
      ...ownHostsBinding(opts.ownHosts),
    ],
    /* `service` is deliberately NOT in keep_bindings: the line above binds it
       explicitly, and an explicit binding is what heals the older copies that
       have none — inheritance cannot create what was never there. THE COROLLARY
       IS A TRAP: if the explicit binding above is ever removed, "service" MUST be
       added here in the same change, or an update will silently DELETE the
       binding from a working instance and re-inert its monitoring. */
    keep_bindings: ["secret_text", "durable_object_namespace", ...(withR2 ? [] : ["r2_bucket"])],
  };
  return cf(token, `/accounts/${acct}/workers/scripts/${slug}`,
    { method: "PUT", body: uploadForm(meta, release.source) });
}


/* ---------------------------------------------------- the fleet (IC-82/D-297) */

/* A part's module type maps to the upload content type. COPY-NEVER-DEFAULT on
   the verifier side too: a type this map does not know refuses that member by
   name rather than guessing — an inferred loader is the 3607b5c defect
   arriving inside a group's account. */
const PART_MIME = { CompiledWasm: "application/wasm", Data: "application/octet-stream",
                    Text: "text/plain", ESModule: "application/javascript+module" };

async function fetchVerified(url, wantSha, what) {
  const r = await fetch(url, { redirect: "follow", headers: relHeaders });
  if (!r.ok) throw new Error(what + " http " + r.status);
  const bytes = new Uint8Array(await r.arrayBuffer());
  const got = hex(await crypto.subtle.digest("SHA-256", bytes));
  if (got !== wantSha) throw new Error(what + " failed its integrity check");
  return bytes;
}

async function uploadMember(token, acct, slug, m, version, bundle, partBytes, extra = {}) {
  const meta = {
    main_module: "index.mjs",
    /* COPIED from the signed manifest, which copied it from the member's own
       config at cut time (IC-82). Nothing here is defaulted. */
    compatibility_date: m.compat.date,
    ...(m.compat.flags.length ? { compatibility_flags: m.compat.flags } : {}),
    /* R39: the member's own limits, exactly as its signed bundle states them; none stated, none sent. */
    ...(extra.limits ? { limits: { ...extra.limits } } : {}),
    bindings: [
      { type: "plain_text", name: "VERSION", text: version },
      /* D-292: the manifest carries the phantom exactly as the config wrote
         it, and the SLUG is substituted here — the same selfBinding shape the
         plane's own install has used since 2026-08-05. The slug never arrives
         over the network; it is the name the group chose. */
      ...(m.services || []).map((sv) => ({ type: "service", name: sv.binding,
        service: sv.service === "bio-plane" ? slug : sv.service })),
      /* R38: a container member's Durable Object class, bound cross-script into each member its descriptor names. */
      ...(extra.bindings || []),
    ],
    /* R38: a container member's class is created by its first upload's migration, and never restated after it. */
    ...(extra.migrations ? { migrations: extra.migrations } : {}),
  };
  const fd = new FormData();
  fd.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
  fd.append("index.mjs", new Blob([bundle], { type: "application/javascript+module" }), "index.mjs");
  /* A container or Worker descriptor is read here, never uploaded as a module. */
  for (const p of (m.parts || []).filter((pp) => !DESCRIPTOR_PARTS.has(pp.type))) {
    fd.append(p.path, new Blob([partBytes[p.path]], { type: PART_MIME[p.type] }), p.path);
  }
  return cf(token, `/accounts/${acct}/workers/scripts/${m.member}`, { method: "PUT", body: fd });
}

/* R38 (M-Q8) — THE CONTAINER MEMBER (agent-runner: Claude Code in a container, a member's own subscription path;
 * file-scanner: ClamAV and the safe view, two containers, T36).
 *
 * The signed fleet statement (`bio-release-fleet/2`) has no image field, and adding one would make every older
 * installer's rebuilt statement disagree with the signature. So a container member is an ordinary member (its asset is
 * the Worker that exports the Container Durable Object classes, K1615) carrying one more part of type `Container` per
 * class: a JSON descriptor, fetched and hashed like any part, which the fleet signature therefore covers:
 *   {class_name, image: "<repository>@sha256:<64 hex>", scheduling_policy: "default", max_instances, bind: [{member, binding}]}
 * One class is the part `container.json`, as before; two or more (T36, bundler R25) are `container/<class_name>.json`
 * each, the path naming the class its descriptor names. An older installer meets a part type it does not know and
 * leaves that one member out by name (R11's rule).
 *
 * It installs only when all of these hold: the permission granted carries the Containers write scope (R2), the account
 * is on Workers Paid (R6), and every descriptor names a public registry image pinned by digest under the default
 * scheduling policy (the Cloudflare registry is the `durable_object` policy's, which this installer never uses). Then:
 * the Worker is uploaded (with its classes' migration when the script is new, and bound to each class it reaches
 * itself), the Containers application of each class is created for that class's namespace with its image, or, when it
 * exists, rolled out to the image; and each other member a descriptor names is uploaded with a cross-script binding to
 * the class. Any condition failing leaves the member out, named with what the copy then lacks (CONTAINER_LACKS): the
 * install never fails over it. The Containers API calls are wrangler's own (`/accounts/<id>/containers/applications`,
 * `…/rollouts`); like the install's SELF binding, they are confirmed only by a real install, which is deploy-gated. */
export const CONTAINER_PART = "Container";
/* R44 (T36; K2155, N772): a member's own bucket bindings and scheduled triggers, which the fleet statement's `services`
   cannot carry, ride as one more signed part of type `Worker` (`worker.json`, bundler's), read like a container's
   descriptor:
     {r2_buckets: [{binding, bucket: "captures" | "published"}], crons: ["<five fields>"]}
   A bucket is named by its role and bound to the copy's own bucket of that role. A member without the part gets
   neither, as before, and the page names what it then lacks. */
export const WORKER_PART = "Worker";
const DESCRIPTOR_PARTS = new Set([CONTAINER_PART, WORKER_PART]);
const containerPartsOf = (m) => (m.parts || []).filter((pp) => pp.type === CONTAINER_PART);
/* Public registries the default policy pulls from: Docker Hub, Amazon ECR, Google Artifact Registry. */
const PUBLIC_IMAGE = /^(?:docker\.io|registry-1\.docker\.io|[0-9]{12}\.dkr\.ecr\.[a-z0-9-]+\.amazonaws\.com|[a-z0-9-]+-docker\.pkg\.dev)\/[a-z0-9._/-]+@sha256:[0-9a-f]{64}$/;
const CLASS_NAME = /^[A-Za-z_$][A-Za-z0-9_$]{0,63}$/;
const BINDING_NAME = /^[A-Z][A-Z0-9_]{0,63}$/;
const CLASS_PATH = /^container\/([A-Za-z_$][A-Za-z0-9_$]{0,63})\.json$/;

/* R38 (T36): what the copy lacks while a container member is left out, said beside its reason. */
const CONTAINER_LACKS = Object.freeze({
  "agent-runner": "your group's Civicsmith offers the assistant only through an API key (a member's own, or your group's) until it is installed",
  "file-scanner": "your group's Civicsmith has no file scanner and no safe view until it is installed: files are kept and shown but not "
    + "scanned, and a high-risk file opens only in its safe view once one can be made",
});
const lacksOf = (member) => CONTAINER_LACKS[member] || "what it provides is missing from your group's Civicsmith until it is installed";

/* The descriptor, read and checked; `{ok: true, d}` or `{ok: false, why}` in words. */
export function containerDescriptor(bytes) {
  let d;
  try { d = JSON.parse(new TextDecoder().decode(bytes)); } catch { return { ok: false, why: "its container description does not parse" }; }
  if (!d || typeof d !== "object" || Array.isArray(d)) return { ok: false, why: "its container description is not an object" };
  if (typeof d.class_name !== "string" || !CLASS_NAME.test(d.class_name)) return { ok: false, why: "its container description names no class" };
  if (typeof d.image !== "string" || !PUBLIC_IMAGE.test(d.image))
    return { ok: false, why: "its image is not a public registry image pinned by its sha256 digest" };
  if (d.scheduling_policy !== "default") return { ok: false, why: "its scheduling policy is not the default one" };
  if (!Number.isInteger(d.max_instances) || d.max_instances < 1 || d.max_instances > 1000)
    return { ok: false, why: "its container description states no maximum number of instances" };
  const bind = d.bind === undefined ? [] : d.bind;
  if (!Array.isArray(bind) || !bind.every((b) => b && typeof b.member === "string" && b.member
      && typeof b.binding === "string" && BINDING_NAME.test(b.binding)))
    return { ok: false, why: "its container description names its bindings unreadably" };
  return { ok: true, d: { class_name: d.class_name, image: d.image, max_instances: d.max_instances, bind } };
}

/* R38 (T36): every class a container member carries, one descriptor per `Container` part; `{ok: true, classes}` or
   `{ok: false, why}`. With two or more, each part's path names its class and the class names differ; any part that
   does not read leaves the whole member out (a member missing a part its statement names never reaches here: the
   part's fetch fails first). Each class's why names the class. */
export function containerClasses(parts, bytesOf) {
  if (parts.length === 1) return ((r) => r.ok ? { ok: true, classes: [r.d] } : r)(containerDescriptor(bytesOf(parts[0].path)));
  const classes = [];
  for (const p of parts) {
    const at = CLASS_PATH.exec(p.path);
    if (!at) return { ok: false, why: `its container part ${p.path} is not named for its class (container/<class_name>.json)` };
    const r = containerDescriptor(bytesOf(p.path));
    if (!r.ok) return { ok: false, why: `${r.why} (class ${at[1]})` };
    if (r.d.class_name !== at[1]) return { ok: false, why: `its container part ${p.path} describes the class ${r.d.class_name}` };
    if (classes.some((c) => c.class_name === r.d.class_name)) return { ok: false, why: `it describes the class ${r.d.class_name} twice` };
    classes.push(r.d);
  }
  return { ok: true, classes };
}

/* R44 (T36): the `Worker` part, read and checked; `{ok: true, d}` or `{ok: false, why}` in words. */
const BUCKET_ROLES = Object.freeze({ captures: "bio-captures", published: "bio-published" });
const CRON = /^(?:[0-9*,/?LW#A-Za-z-]+\s){4}[0-9*,/?LW#A-Za-z-]+$/;
export function workerDescriptor(bytes) {
  let d;
  try { d = JSON.parse(new TextDecoder().decode(bytes)); } catch { return { ok: false, why: "its Worker description does not parse" }; }
  if (!d || typeof d !== "object" || Array.isArray(d)) return { ok: false, why: "its Worker description is not an object" };
  const list = (k) => d[k] === undefined ? [] : d[k];
  const r2 = list("r2_buckets"), crons = list("crons");
  if (!Array.isArray(r2) || !r2.every((b) => b && typeof b.binding === "string" && BINDING_NAME.test(b.binding) && Object.hasOwn(BUCKET_ROLES, b.bucket)))
    return { ok: false, why: "its Worker description names its buckets unreadably" };
  if (!Array.isArray(crons) || crons.length > 3 || !crons.every((c) => typeof c === "string" && CRON.test(c)))
    return { ok: false, why: "its Worker description states its schedule unreadably" };
  return { ok: true, d: { r2_buckets: r2.map(({ binding, bucket }) => ({ binding, bucket })), crons: [...crons] } };
}

/* R44 (T36): what file-scanner then lacks, when its release carries no `Worker` part. */
const WORKER_PART_LACKS = Object.freeze({
  "file-scanner": "its release does not yet state its bucket and its daily schedule, so it was installed without them: it cannot read "
    + "captured files or refresh its virus signatures, and files are not scanned until a release that states them is installed",
});

/* R45 (T36; K1946 T4): the member a tool reached through a tunnel is called through, and the binding name it reads the
   operator's Workers VPC service by, as R45 names them. */
export const VPC_MEMBER = "file-scanner";
export const VPC_BINDING = "SECURITY_VPC";

/* R45 (T36): a Workers VPC service is named by its id, 32 hexadecimal digits with or without the dashes of a UUID. */
const VPC_ID = /^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;
export const vpcServiceOk = (v) => typeof v === "string" && VPC_ID.test(v);

/* Whether this act may install a container (R38's first two conditions), asked once, only when the release names one.
   `scope` is what the token response stated (null: it stated none, and one read of the Containers API decides). On an
   update the plan is established here as R6 establishes it, and a Free or unknown answer only leaves the container out:
   an update never grows a refusal. */
async function containerConditions(token, acct, { scope, plan }) {
  if (scope !== null && scope !== undefined) {
    if (!scope.split(/[\s,]+/).includes("containers.write"))
      return { ok: false, why: "the permission you approved does not include Workers Containers" };
  } else {
    try { await cf(token, `/accounts/${acct}/containers/applications`); }
    catch (e) { return { ok: false, why: "the permission you approved could not be shown to include Workers Containers (" + e.message + ")" }; }
  }
  let p = plan;
  if (!p) {
    try { p = await establishPlan(token, acct); } catch (e) { p = { plan: "unknown", detail: e.message }; }
  }
  if (p.plan === "free") return { ok: false, why: "your account is on Workers Free, and containers need Workers Paid" };
  if (p.plan !== "paid") return { ok: false, why: "your account's Workers plan could not be verified (" + (p.detail || "no answer") + ")" };
  return { ok: true, leftover: !!p.leftover };
}

/* The Containers application for one class's namespace, created with the image, or rolled out to it. A member with one
   class names its application by the member, as before; with several, each is the member's name and its class's. */
async function placeContainer(token, acct, m, d, appName) {
  const spaces = await cf(token, `/accounts/${acct}/workers/durable_objects/namespaces?per_page=1000`);
  const ns = (Array.isArray(spaces) ? spaces : []).find((n) => n && n.script === m.member && n.class === d.class_name);
  if (!ns || !ns.id) throw new Error("its Durable Object class " + d.class_name + " was not found after the upload");
  const apps = await cf(token, `/accounts/${acct}/containers/applications`);
  const app = (Array.isArray(apps) ? apps : []).find((a) => a && a.name === appName);
  if (!app) {
    await cf(token, `/accounts/${acct}/containers/applications`, { method: "POST", body: JSON.stringify({
      name: appName, scheduling_policy: "default", instances: 0, max_instances: d.max_instances,
      configuration: { image: d.image }, durable_objects: { namespace_id: ns.id } }) });
    return "created";
  }
  await cf(token, `/accounts/${acct}/containers/applications/${app.id}/rollouts`, { method: "POST", body: JSON.stringify({
    description: "Civicsmith installer: " + appName, strategy: "rolling", kind: "full_auto", step_percentage: 100,
    target_configuration: { image: d.image } }) });
  return "rolled out";
}

/* R44: a member's scheduled triggers, set exactly as its `Worker` part states them. */
async function setSchedules(token, acct, member, crons) {
  return cf(token, `/accounts/${acct}/workers/scripts/${member}/schedules`,
    { method: "PUT", body: JSON.stringify(crons.map((cron) => ({ cron }))) });
}

/* Install (or refresh — the PUT is the same act) every member the release
   names. DEGRADES PER MEMBER, never fails the install: a group's plane must
   not be lost over a member it can add at the next update, and what was left
   out is SAID (D-115's "quietly doing less" is the defect; the cure is the
   saying, not the refusing). `ctx.vpc`: the Workers VPC service the operator named (R45), or none. */
async function installFleet(emit, token, acct, slug, release, ctx = {}) {
  emit.step("fleet", "Installing the capability workers beside your group's Civicsmith");
  const man = release.man;
  if (!man) {
    emit.ok("fleet", "The public repository was not reachable, so no capability workers were "
      + "installed this time. Your group's Civicsmith works without them; the next update adds them.");
    return;
  }
  if (!Array.isArray(man.fleet) || man.fleet.length === 0 || !man.fleetSig) {
    emit.ok("fleet", "This release names no capability workers, so there was nothing further "
      + "to install. Said explicitly rather than assumed: absence of members in the manifest "
      + "is a fact about the release, not about your group's Civicsmith.");
    return;
  }
  if (!ARMED_SIGNERS.length) {
    emit.ok("fleet", "This installer carries no signing key, so the capability workers "
      + "(which install only under a verified fleet signature) were left out. Your group's "
      + "Civicsmith itself installed normally.");
    return;
  }
  /* The statement is REBUILT from the manifest by the same function that
     produced it at the cut — producer/verifier agreement, and the /2 facts
     (compat, part types) are required by construction: a manifest stripped of
     them, or a pre-/2 manifest, refuses BY NAME right here. */
  let payload;
  try {
    payload = fleetStatement({ version: man.version,
      plane: { sha256: man.sha256, bytes: man.bytes, asset: man.asset || "bio-plane.bundled.mjs" },
      members: man.fleet });
  } catch (e) {
    emit.ok("fleet", "The release names capability workers but its manifest does not state "
      + "how they are uploaded (" + String(e.message).replace(/^REFUSED \[[A-Z_]+\]: /, "")
      + ") — so none were installed. Your group's Civicsmith itself installed normally; a corrected "
      + "release fixes this at the next update.");
    return;
  }
  const v = await verifySshsig(man.fleetSig, new TextEncoder().encode(payload), NS_FLEET, ARMED_SIGNERS);
  if (!v.ok) {
    emit.ok("fleet", "The fleet signature did not verify (" + (v.reason || "invalid") + "), so no "
      + "capability workers were installed. Your group's Civicsmith itself installed normally and is safe.");
    return;
  }
  /* The pairing: the signed statement names the plane these members were built
     against, and it must be the plane THIS act just installed. */
  const planeSha = hex(await crypto.subtle.digest("SHA-256", enc.encode(release.source)));
  if (planeSha !== man.sha256) {
    emit.ok("fleet", "The capability workers are signed against a different release of Civicsmith than the one just "
      + "installed (the installer used its built-in copy), so no capability workers were "
      + "installed. The next update, fetching both halves together, adds them.");
    return;
  }
  const done = [], left = [], notes = [];
  /* R38: container members first, because a member bound to a container's class is refused while the class is not
     there; `classOf` collects, per member, the class bindings it then receives. */
  const fleet = [...man.fleet].sort((a, b) => (containerPartsOf(b).length ? 1 : 0) - (containerPartsOf(a).length ? 1 : 0));
  const classOf = new Map();
  let conditions = null, leftover = false, vpcTaken = false;
  for (const m of fleet) {
    try {
      const badType = (m.parts || []).find((pp) => !PART_MIME[pp.type] && !DESCRIPTOR_PARTS.has(pp.type));
      if (badType) throw new Error("part " + badType.path + " has module type '" + badType.type
        + "' this installer does not know — refusing to guess a loader");
      const box = containerPartsOf(m);
      const workerParts = (m.parts || []).filter((pp) => pp.type === WORKER_PART);
      if (workerParts.length > 1) throw new Error("it carries more than one Worker description");
      const bundle = await fetchVerified(CFG.RELEASE_LATEST + "/" + m.asset, m.sha256, m.member);
      /* R39: read from the verified bytes; a statement that cannot be read leaves this member out, named. */
      const stated = memberLimits(bundle);
      if (!stated.ok) throw new Error(stated.why);
      const limits = stated.limits;
      const partBytes = {};
      for (const pp of m.parts || []) {
        partBytes[pp.path] = await fetchVerified(
          CFG.RELEASE_LATEST + "/" + m.member + "/" + pp.path, pp.sha256, m.member + " " + pp.path);
      }
      /* R44, R45: the member's own buckets, schedule and private-network binding, as its signed `Worker` part states them. */
      let own = { r2_buckets: [], crons: [] };
      if (workerParts.length) {
        const w = workerDescriptor(partBytes[workerParts[0].path]);
        if (!w.ok) throw new Error(w.why);
        own = w.d;
      }
      /* Said once the member is installed (a member left out is named with its own reason). */
      const lacking = !workerParts.length && WORKER_PART_LACKS[m.member] ? `${m.member}: ${WORKER_PART_LACKS[m.member]}` : null;
      const ownBindings = own.r2_buckets.map((b) => ({ type: "r2_bucket", name: b.binding, bucket_name: BUCKET_ROLES[b.bucket] }));
      const vpcBindings = vpcServiceOk(ctx.vpc) && m.member === VPC_MEMBER ? [{ type: "vpc_service", name: VPC_BINDING, service_id: ctx.vpc }] : [];
      /* R45: a VPC binding refused (the permission may not reach the service, or the id names none) leaves out that
         binding alone, named; the member is uploaded again without it. */
      const upload = async (extra) => {
        const bindings = [...(extra.bindings || []), ...ownBindings];
        if (!vpcBindings.length) return uploadMember(token, acct, slug, m, String(man.version), bundle, partBytes, { ...extra, bindings });
        try {
          await uploadMember(token, acct, slug, m, String(man.version), bundle, partBytes, { ...extra, bindings: [...bindings, ...vpcBindings] });
          vpcTaken = true;
          notes.push(`${m.member} is connected to the Workers VPC service you named (${VPC_BINDING})`);
        } catch (e) {
          await uploadMember(token, acct, slug, m, String(man.version), bundle, partBytes, { ...extra, bindings });
          vpcTaken = true;
          notes.push(`${m.member} could not be connected to the Workers VPC service you named (Cloudflare said: ${e.message}), so it `
            + "was installed without it, and a security tool reached through a tunnel answers REACH_NOT_BOUND until the updater connects it");
        }
      };
      const schedule = async () => {
        if (!own.crons.length) return;
        try { await setSchedules(token, acct, m.member, own.crons); }
        catch (e) { notes.push(`${m.member} was installed, but its schedule (${own.crons.join("; ")}) could not be set (Cloudflare said: ${e.message}); the next update sets it`); }
      };
      if (!box.length) {
        await upload({ bindings: classOf.get(m.member), limits });
        await schedule();
        done.push(m.member);
        if (lacking) notes.push(lacking);
        continue;
      }
      const read = containerClasses(box, (path) => partBytes[path]);
      if (!read.ok) throw new Error(read.why);
      const classes = read.classes;
      const multi = box.length > 1;
      /* A class bound into its own member is bound in that member's own upload (no script name); one bound into
         another member is bound cross-script into it, after its class exists. */
      const binds = () => { for (const d of classes) for (const b of d.bind) if (b.member !== m.member)
        classOf.set(b.member, [...(classOf.get(b.member) || []),
          { type: "durable_object_namespace", name: b.binding, class_name: d.class_name, script_name: m.member }]); };
      const selfBinds = classes.flatMap((d) => d.bind.filter((b) => b.member === m.member)
        .map((b) => ({ type: "durable_object_namespace", name: b.binding, class_name: d.class_name })));
      const fresh = !(await scriptExists(token, acct, m.member));
      conditions ??= await containerConditions(token, acct, ctx);
      leftover = !!conditions.leftover;
      if (!conditions.ok) {
        /* Left out this time; a container an earlier act installed keeps serving, so its bindings are restated (a
           member re-uploaded without one would lose it). */
        if (!fresh) binds();
        throw new Error(conditions.why);
      }
      await upload({ limits, bindings: [...(classOf.get(m.member) || []), ...selfBinds],
        ...(fresh ? { migrations: { new_tag: "v1", new_sqlite_classes: classes.map((d) => d.class_name) } } : {}) });
      for (const d of classes) await placeContainer(token, acct, m, d, multi ? `${m.member}-${d.class_name.toLowerCase()}` : m.member);
      await schedule();
      binds();
      done.push(m.member);
      if (lacking) notes.push(lacking);
    } catch (e) {
      left.push({ member: m.member, why: String(e && e.message || e)
        + (containerPartsOf(m).length ? "; " + lacksOf(m.member) : "") });
    }
  }
  /* R45: a VPC service named that no member installed here takes is said, never dropped in silence. */
  if (vpcServiceOk(ctx.vpc) && !vpcTaken)
    notes.push(`the Workers VPC service you named was not connected: ${VPC_MEMBER} was not installed this time, so a tool reached `
      + "through a tunnel answers REACH_NOT_BOUND in your group's Civicsmith until the updater connects it");
  const probeNote = leftover ? " One cleanup note: the tiny probe script \"" + PLAN_PROBE + "\" could not be deleted "
    + "automatically — it is harmless, and you can remove it from Workers & Pages any time." : "";
  /* Each note begins with a member's name or a capital, as written; a name is never re-cased. */
  const noteText = notes.length ? " " + notes.map((n) => (/^[a-z]+-[a-z]/.test(n) ? n : n[0].toUpperCase() + n.slice(1)) + ".").join(" ") : "";
  if (left.length === 0) {
    emit.ok("fleet", "All " + done.length + " capability workers installed and verified: "
      + done.join(", ") + "." + noteText + probeNote);
  } else {
    emit.ok("fleet", (done.length ? done.length + " capability worker(s) installed (" + done.join(", ") + "); " : "")
      + left.length + " left out: "
      + left.map((l) => l.member + " (" + l.why + ")").join("; ")
      + ". Your group's Civicsmith works without them; the next update retries exactly this step." + noteText + probeNote);
  }
  /* D-116: WHICH members this act uploaded, so the verify step can require each of them to answer THROUGH the plane's
     binding. Every early return above uploads nothing and returns undefined, which the caller reads as none. */
  return { done, left };
}

/* DIST-6, step 3 of the order at BINDING_OF: RE-PUT the plane bound to every bindable member now present — those
   bound at step 1 and those `installFleet` just uploaded. The re-PUT takes the UPDATE's shape on both paths (no
   `migrations`, the group's passwords and the Durable Object kept by `keep_bindings`), because that is the shape
   already proven against an existing script on every update; an install's own shape would restate its `v1` migration
   against a script that already carries it, which nothing here has established Cloudflare accepts. Nothing to add ->
   no PUT. A refusal DEGRADES, never fails the act: the members stay installed, the step is marked, and the verify step
   names each member the plane cannot reach (servingVerdict) — never a success over it. */
async function bindMembers(emit, token, acct, slug, release, already, fleet, opts) {
  const want = [...BINDING_OF.keys()]
    .filter((m) => already.includes(m) || (fleet?.done || []).includes(m));
  const added = want.filter((m) => !already.includes(m));
  /* R47: on the install, this is also the upload that first tells the copy its own hosts, so it runs when they are
     known even with no member to add. An update states them in its own upload, and restates them here. */
  const hosts = opts.writeHosts && Array.isArray(opts.ownHosts) && opts.ownHosts.length ? opts.ownHosts : null;
  if (added.length === 0 && !hosts) return { bound: already, unbound: [] };
  emit.step("bind", added.length ? "Connecting your group's Civicsmith to its capability workers"
    : "Telling your group's Civicsmith its own address");
  try {
    await uploadUpdate(token, acct, slug, opts.withR2, release,
      { members: want, daemon: opts.daemon, noSelf: opts.noSelf, profiles: opts.profiles, ownHosts: opts.ownHosts });
    emit.ok("bind", [added.length ? "Your group's Civicsmith is connected to " + added.join(", ") + "." : "",
      hosts ? "Your group's Civicsmith now knows its own address (" + hosts.join(", ") + "), which it reads as its own." : ""]
      .filter(Boolean).join(" "));
    return { bound: want, unbound: [], put: true, hosts: !!hosts };
  } catch (e) {
    emit.no("bind", [added.length ? "The capability workers were installed, but connecting your group's Civicsmith to them was refused ("
      + added.join(", ") + "). Your group's Civicsmith works without them; running the updater connects them." : "",
      hosts ? "Telling your group's Civicsmith its own address was refused, so it does not know it yet; running the updater tells it." : "",
      "(Cloudflare said: " + e.message + ")"].filter(Boolean).join(" "));
    return { bound: already, unbound: added, hosts: false };
  }
}

async function ensureSubdomain(token, acct, slug) {
  let sub = null;
  try { sub = (await cf(token, `/accounts/${acct}/workers/subdomain`))?.subdomain || null; }
  catch (e) { if (e.status !== 404) throw e; }
  let registered = null;
  if (!sub) {
    /* A fresh account has no workers.dev prefix. The prefix is account-wide
       and permanent in practice (changing it later breaks every URL already
       issued), so derive it from the name the user chose and SAY SO on the
       page rather than choosing silently. */
    const candidates = [slug, `${slug}-${rand(3).toLowerCase().replace(/[^a-z0-9]/g, "x").slice(0, 4)}`];
    for (const c of candidates) {
      try {
        await cf(token, `/accounts/${acct}/workers/subdomain`,
          { method: "PUT", body: JSON.stringify({ subdomain: c }) });
        sub = c; registered = c; break;
      } catch (e) { if (!/taken|exists|unavailable/i.test(e.message)) throw e; }
    }
    if (!sub) throw new Error("no workers.dev prefix is set on this account and the names tried were taken");
  }
  await cf(token, `/accounts/${acct}/workers/scripts/${slug}/subdomain`,
    { method: "POST", body: JSON.stringify({ enabled: true }) });
  return { sub, registered };
}

/* R15 (T35; F1, K1874): the probe credential travels only in the request's `Authorization: Bearer` header, the form
   admission R20 reads first, so it is in no address this installer makes, logs or shows. */
async function verifyInstall(base, probe) {
  for (let i = 0; i < 10; i++) {
    try {
      const r = await fetch(`${base}/api/?op=selftest`, { headers: { authorization: "Bearer " + probe } });
      const j = await r.json();
      if (j.ok === true && j.bindings?.STORE === true) return j;
    } catch {}
    await new Promise((res) => setTimeout(res, 3000));
  }
  return null;
}

/* D-116 — WHAT EACH PART OF THE COPY ACTUALLY SERVES, NOT WHAT WAS UPLOADED (`BIO_Distribution_v0_1.md` §6, §8;
 * `CLAUDE.md` §5: a deploy verified is not a build serving).
 *
 * `op=bootstrap`'s `version` is the ROUTING isolate's build. Until D-116 that was the only thing this checked, so an
 * update whose Durable Object — the part holding the record — still ran the previous build, or whose capability
 * worker never took the new one, reported "Updated" all the same. A plane carrying D-116 answers three readings,
 * each from where it runs: `version` (the isolate), `storeVersion` (the DO's own env, never the isolate's), and on
 * `members=1`, `memberVersions` (each member's own `/version`, asked THROUGH the plane's binding). Every one must
 * equal the release, and the one that does not is NAMED; the update and the install do not report success until
 * none lags.
 *
 * WHETHER THE RELEASE CAN ANSWER is read from the plane bytes this act uploaded (`reportsBuilds`), never from a
 * version number: a release cut before D-116 landed has neither field in its source, so its store's build and its
 * members' are UNDETERMINED and the page says so in the same breath as the isolate's confirmation (UNDETERMINED_BUILDS)
 * — never a silent "confirmed", and never a refusal for lacking a field that release could not have. A plane that SHOULD answer and does not is a lag, not an absence:
 * after uploading a release that carries the fields, a reply without `storeVersion` is a DO still on older code. */
const BUILD_FIELDS = ["storeVersion", "memberVersions"];
export function reportsBuilds(source) {
  return typeof source === "string" && BUILD_FIELDS.every((f) => new RegExp("\\b" + f + "\\b").test(source));
}

/* DIST-6: `failed` is the members the fleet step could NOT upload ({member, why}). A member the plane binds whose upload
   failed is named here whatever the plane answers, because the plane's own reading of it (UNBOUND, or a previous
   build) cannot say that THIS act tried and failed — and on a release that cannot report members it is the only
   place the failure reaches the verdict. A member the plane does not bind is named at the fleet step and not here. */
const failedLags = (failed = []) => failed.filter((l) => l && BINDING_OF.has(l.member))
  .map((l) => `the capability worker ${l.member} could not be installed, so your group's Civicsmith has no ${BINDING_OF.get(l.member)}`
    + ` connection to use (${l.why})`);

function servingVerdict(j, want, installed, capable, failed = []) {
  const lags = [];
  if (!j || typeof j !== "object") {
    lags.push("the address of your group's Civicsmith did not answer", ...failedLags(failed));
    return { confirmed: false, lags, capable };
  }
  if (j.version !== want) lags.push(`the address of your group's Civicsmith answers ${j.version ? j.version : "with no version"}`);
  lags.push(...failedLags(failed));
  if (!capable) return { confirmed: lags.length === 0, lags, capable };
  if (!("storeVersion" in j)) lags.push("the record store of your group's Civicsmith has not reported its version, so it is still running a release from before this one");
  else if (j.storeVersion === null) lags.push("the record store of your group's Civicsmith cannot say which version it runs");
  else if (j.storeVersion !== want) lags.push(`the record store of your group's Civicsmith still runs ${j.storeVersion}`);
  const mv = j.memberVersions;
  if (!mv || typeof mv !== "object") {
    lags.push("your group's Civicsmith did not report its capability workers");
  } else {
    for (const [name, st] of Object.entries(mv)) {
      const s = st && st.state;
      if (s === "SERVING" && st.version !== want) lags.push(`the capability worker ${name} still runs ${st.version}`);
      else if (s === "MISNAMED") lags.push(`the connection of your group's Civicsmith to ${name} reaches a different worker (${st.name || "unnamed"})`);
      else if (s === "SILENT") lags.push(`your group's Civicsmith cannot get an answer from the capability worker ${name}`
        + (installed.includes(name) ? ", which this step installed" : ""));
      else if (s === "UNBOUND" && installed.includes(name))
        lags.push(`the capability worker ${name} was installed, but your group's Civicsmith holds no connection to it, so it cannot use it`);
    }
    for (const name of installed)
      if (!(name in mv)) lags.push(`the capability worker ${name} was installed, but your group's Civicsmith does not know it`);
  }
  return { confirmed: lags.length === 0, lags, capable };
}

async function verifyServing(base, want, installed, capable, failed = [], tries = 5) {
  let last = null;
  for (let i = 0; i < tries; i++) {
    let j = null;
    try { j = await (await fetch(`${base}/api/?op=bootstrap&members=1`)).json(); } catch {}
    last = servingVerdict(j, want, installed, capable, failed);
    if (last.confirmed) return last;
    if (i < tries - 1) await new Promise((res) => setTimeout(res, 2500));
  }
  return last;
}

/* R33 with R15: the read-back's lags join the serving verdict's, first; a verdict with any is never confirmed. With no
   serving verdict (the address unread) the read-back's lags still make one, so a mismatch is always named. */
function withByteLags(verdict, byteLags, capable) {
  if (!byteLags.length) return verdict;
  if (!verdict) return { confirmed: false, lags: [...byteLags], capable };
  return { ...verdict, confirmed: false, lags: [...byteLags, ...verdict.lags] };
}

/* R46 (T36; K1892 "no log", K1946 T8) — NO LOG OF WHO OPENED WHICH FILE.
 *
 * A Logpush job over `workers_trace_events` keeps a record of each request a Worker serves, and a request for a file
 * names the file and its caller: on the copy's Workers that would be a log of who opened which file, which K1892 rules
 * out. Before `verify` can succeed, the account's Logpush jobs are listed, and each job over that dataset whose filter
 * does not exclude every one of the copy's Workers (the plane and its members, by script name) is named as a failure;
 * no success is claimed while one is. A filter excludes them only when, read as Logpush's filter grammar, its `where`
 * (alone, or one condition of a top-level `and`) is a `ScriptName` condition that leaves every one of them out:
 * `!in` or `!eq` naming them all, or `in` or `eq` naming none of them. Anything else, a filter that does not parse
 * included, does not exclude them. A list the permission cannot read leaves the check UNDETERMINED, said so, never
 * passed (CFG.LOGPUSH_SCOPE: every Logpush API call needs "Logs Write", which R2 does not ask). */
export const PER_REQUEST_DATASET = "workers_trace_events";
export function filterExcludes(filter, names) {
  if (filter === null || filter === undefined || filter === "") return false;
  let f;
  try { f = typeof filter === "string" ? JSON.parse(filter) : filter; } catch { return false; }
  const w = f && typeof f === "object" ? f.where : null;
  if (!w || typeof w !== "object") return false;
  const conds = typeof w.key === "string" ? [w] : Array.isArray(w.and) ? w.and : [];
  return conds.some((c) => {
    if (!c || c.key !== "ScriptName") return false;
    const vals = (Array.isArray(c.value) ? c.value : [c.value]).map(String);
    const op = String(c.operator);
    if (op === "!in" || op === "!eq") return names.every((n) => vals.includes(n));
    if (op === "in" || op === "eq") return names.every((n) => !vals.includes(n));
    return false;
  });
}
async function logpushCheck(token, acct, names) {
  let jobs;
  try { jobs = await cf(token, `/accounts/${acct}/logpush/jobs`); }
  catch (e) { return { state: "undetermined", why: e.message }; }
  if (!Array.isArray(jobs)) return { state: "undetermined", why: "the list came back unreadable" };
  const named = jobs.filter((j) => j && j.dataset === PER_REQUEST_DATASET && !filterExcludes(j.filter, names));
  return named.length ? { state: "named", jobs: named } : { state: "clear" };
}
const logLag = (j, names) => `the Logpush job ${JSON.stringify(String(j.name || "(unnamed)"))} (id ${j.id ?? "unknown"}${j.enabled === false ? ", paused" : ""}) `
  + `keeps a record of each request to your group's Civicsmith (its dataset is ${PER_REQUEST_DATASET}, and its filter does not leave out `
  + `${names.join(", ")}), which would be a log of who opened which file: delete it, or give it a filter that leaves those Workers out`;
/* The step itself: listed, said, and its named jobs returned as lags for the verdict (R15's rule: no success over one). */
async function logsStep(emit, token, acct, names) {
  emit.step("logs", "Checking that no log on your account records who opened which file");
  const r = await logpushCheck(token, acct, names);
  if (r.state === "clear") {
    emit.ok("logs", "No Logpush job on your Cloudflare account keeps a record of each request to your group's Civicsmith.");
    return [];
  }
  if (r.state === "undetermined") {
    emit.no("logs", "Undetermined: the installer could not read your account's Logpush jobs (Cloudflare said: " + r.why + "), so it cannot "
      + "say whether one keeps a record of each request to your group's Civicsmith, which would be a log of who opened which file. "
      + "To check it yourself: in the Cloudflare dashboard, open Analytics & Logs, then Logpush, and look for a job over "
      + "Workers Trace Events; none should cover " + names.join(", ") + ".");
    return [];
  }
  const lags = r.jobs.map((j) => logLag(j, names));
  emit.no("logs", (lags.length === 1 ? "A Logpush job on your Cloudflare account" : lags.length + " Logpush jobs on your Cloudflare account")
    + " would keep a log of who opened which file: " + lags.join("; ") + ".");
  return lags;
}

const lagList = (v) => `<ul>${v.lags.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`;
const UNDETERMINED_BUILDS = "This release cannot report which version the record store of your group's Civicsmith or its capability "
  + "workers are running, so only its address was checked; those parts are not confirmed either way.";

/* -------------------------------------------------------- the progress page
   The callback streams HTML: the shell renders immediately, then each
   provisioning step lands as a small script as it completes. Live progress
   with the token never leaving this Worker, and nothing to poll. */

function progressShell(title, slug) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(title)}</title><style>${PAGE_CSS}</style></head><body><main>
<p class="eyebrow">${PRODUCT} &middot; installer</p>
<h1>${esc(title)}</h1>
<p class="small">For the group <b class="mono" id="group">${esc(slug)}</b>. Leave this page open. This usually takes under a minute.</p>
<div id="log" class="log"></div>
<div id="fail" class="notice" hidden><h2 id="fail-h"></h2><p id="fail-p"></p><p class="small mono" id="fail-d"></p></div>
<div id="done" hidden></div>
${publisherFooter()}
<script>
const $=s=>document.querySelector(s);const rows={};
function step(id,label){const d=document.createElement("div");d.className="row go";d.id="r-"+id;
 d.innerHTML='<span class="dot"></span><span></span>';d.lastChild.textContent=label;$("#log").appendChild(d);rows[id]=d;}
function ok(id,label){const d=rows[id];if(!d)return;d.className="row ok";if(label)d.lastChild.textContent=label;}
function no(id,label){const d=rows[id];if(!d)return;d.className="row no";if(label)d.lastChild.textContent=label;}
function fail(h,p,d){$("#fail").hidden=false;$("#fail-h").textContent=h;$("#fail-p").textContent=p;$("#fail-d").textContent=d||"";}
function done(html){$("#done").innerHTML=html;$("#done").hidden=false;
 document.querySelectorAll("[data-copy]").forEach(b=>b.addEventListener("click",async()=>{
  await navigator.clipboard.writeText(document.getElementById(b.dataset.copy).textContent);
  const t=b.textContent;b.textContent="Copied";setTimeout(()=>b.textContent=t,1400);}));
 const h=$("#handover");if(h)h.addEventListener("click",()=>{location.href=h.dataset.url+"#boot="+encodeURIComponent(document.getElementById("out-boot").textContent);});}
</script>`;
}

/* R19: every value streamed into a <script> is JSON with `<`, `>`, `&` and the two JavaScript line separators escaped,
   so text from the management API (an error message, an account's name) can never close the script element it rides
   in; the page then sets it as text, never as markup. */
const jsLit = (v) => JSON.stringify(v).replace(/[<>&\u2028\u2029]/g,
  (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"));
const jsStr = (s) => jsLit(String(s ?? ""));

function streamPage(headers, shell, run) {
  const { readable, writable } = new TransformStream();
  const w = writable.getWriter();
  const write = (s) => w.write(enc.encode(s));
  const emit = {
    step: (id, label) => write(`<script>step(${jsStr(id)},${jsStr(label)})</script>\n`),
    ok:   (id, label) => write(`<script>ok(${jsStr(id)}${label ? "," + jsStr(label) : ""})</script>\n`),
    no:   (id, label) => write(`<script>no(${jsStr(id)}${label ? "," + jsStr(label) : ""})</script>\n`),
    fail: (h, p, d)   => write(`<script>no();fail(${jsStr(h)},${jsStr(p)},${jsStr(d)})</script>\n`),
    done: (inner)     => write(`<script>done(${jsLit(inner)})</script>\n`),
  };
  (async () => {
    await write(shell);
    try { await run(emit); }
    catch (e) {
      await emit.fail("Something went wrong that this page did not anticipate",
        "The step in progress did not finish. Nothing secret was stored anywhere.",
        String(e && e.message || e));
    }
    await write("</body></html>");
    await w.close();
  })();
  return new Response(readable, { headers: { "content-type": "text/html; charset=utf-8", ...headers } });
}

/* ---------------------------------------------------------- provisioning */

/* DIST-9: say which way the organisation `ai` credential went — never its value. */
function instanceAiNotice(emit, mode, carried) {
  emit.step("ai", "Your organisation's AI credential");
  if (carried) return emit.ok("ai", "The organisation AI credential you gave was stored in your group's Civicsmith as a secret "
    + "(it is not shown here). It uses it to resume assistant runs that credential opened.");
  emit.ok("ai", mode === "update"
    ? "No organisation AI credential was given, so none was sent. One your group's Civicsmith already holds is kept unchanged; "
      + "this installer never creates one."
    : "No organisation AI credential was given, so your group's Civicsmith has none: it will not resume paused assistant runs on its "
      + "own. A member mints one inside your group's Civicsmith; running the updater with it adds it. This installer never creates one.");
}

/* K1541, R36 and R17 (T36) on an update: the seal secret added only where none was held, and every retired binding an
   earlier installer left (RETIRED_BINDINGS: a group-wide Claude credential, the shared member key, the assistant choice)
   removed. Each outcome is said; an unread settings page is said as unread, never as "none". */
const cap = (x) => x[0].toUpperCase() + x.slice(1);
async function accountSecretsNotice(emit, token, acct, slug, held, seal) {
  emit.step("keys", "Your members' own accounts, and what earlier installers left behind");
  if (!held) return emit.no("keys", "The settings of your group's Civicsmith could not be read, so the installer could not tell whether it "
    + "holds the secret that seals each member's own Claude account or API key, or anything an earlier installer bound that is now "
    + "retired (a group-wide Claude credential, the shared member key, the assistant choice). Nothing was sent or removed. "
    + "Running this update again checks once more.");
  const said = [seal
    ? "Your group's Civicsmith now holds the secret that seals each member's own Claude account or API key (it is not shown here)."
    : "Your group's Civicsmith already held the secret that seals each member's own Claude account or API key; it is kept unchanged."];
  let ok = true;
  for (const [name, what] of RETIRED_BINDINGS) {
    const type = held.get(name);
    if (!type) continue;
    /* A plain value is not kept by the update's upload, which did not restate it: it is gone already. */
    if (type !== "secret_text") { said.push(cap(what) + " was removed by this update: the installer binds none now."); continue; }
    try {
      await cf(token, `/accounts/${acct}/workers/scripts/${slug}/secrets/${name}`, { method: "DELETE" });
      said.push(cap(what) + " was removed: the installer binds none now.");
    } catch (e) {
      ok = false;
      said.push(cap(what) + " is still held, and removing it was refused (Cloudflare said: "
        + e.message + "). Remove the secret " + name + " from your worker's settings on Cloudflare.");
    }
  }
  said.push(ASSISTANT_OWN_ACCOUNTS);
  return ok ? emit.ok("keys", said.join(" ")) : emit.no("keys", said.join(" "));
}

/* R37 (T36; N721, DEC-172; K1957): the installer takes no choice about the assistant and binds no Claude credential
   (R36); the page says where its two settings are made, in the install page's own words (ui.mjs, ASSISTANT_OFFER). */
export const ASSISTANT_OWN_ACCOUNTS = ASSISTANT_OFFER.replace(/\s+/g, " ").trim();
function assistantNotice(emit) {
  emit.step("assist", "The assistant");
  emit.ok("assist", ASSISTANT_OWN_ACCOUNTS);
}

/* R32's refusal, before anything is created: what the account holds, by name, and the two ways on. */
function oneCopyRefusal(emit, held) {
  return emit.fail(`Your Cloudflare account already holds an installation of ${PRODUCT}`,
    `${ONE_COPY}: this account already holds ${held.join(", ")}, and a second installation beside them would share or `
    + "overwrite them. Nothing was created or changed, so there is nothing to clean up.",
    "To continue: install your group's Civicsmith into a Cloudflare account that holds no installation of it, or, if this "
    + "account's installation is your group's, bring it up to the current release with the update option instead.");
}

async function runInstall(emit, code, saved) {
  const slug = saved.slug;
  let token, scope;

  emit.step("auth", "Confirming your permission with Cloudflare");
  try { ({ token, scope } = await exchange(code, saved.v)); emit.ok("auth"); }
  catch (e) {
    emit.no("auth");
    return emit.fail("Cloudflare did not confirm the permission",
      "The sign-in came back but the final handshake failed, so nothing was created.",
      "Detail: " + e.message);
  }

  emit.step("acct", "Finding your account");
  let acct;
  try {
    const accts = await cf(token, "/accounts");
    if (!accts?.length) throw new Error("no accounts on this sign-in");
    acct = accts[0];
    emit.ok("acct", `Using the account "${acct.name}"`);
  } catch (e) {
    emit.no("acct");
    return emit.fail("Could not read your account",
      "Permission was granted but the account list came back empty or refused. Nothing was created.",
      "Detail: " + e.message);
  }

  emit.step("fresh", "Checking the name is free and your account holds no other installation");
  try {
    if (await scriptExists(token, acct.id, slug)) {
      emit.no("fresh");
      return emit.fail(`An installation named "${slug}" already exists on your account`,
        "Nothing was changed. If you meant to update it to the current release, go back and choose the update option instead.",
        "");
    }
    /* R32: the evidence buckets and the fleet workers the plane binds, read before anything is created. */
    const held = await copyHeld(token, acct.id, { members: [...BINDING_OF.keys()] });
    if (held.length) { emit.no("fresh"); return oneCopyRefusal(emit, held); }
    emit.ok("fresh");
  } catch (e) {
    emit.no("fresh");
    return emit.fail("Could not check your account",
      "The check for an existing installation failed, so to be safe nothing was created.",
      "Detail: " + e.message);
  }

  /* R20 with R4: the release is chosen before the first thing this flow creates (the plan probe, then the buckets), so a
     release that states no readable limits refuses the install while there is genuinely nothing to clean up. */
  const release = await selectRelease(emit);
  if (release.refused) {
    return emit.fail("This installer cannot say which limits your group's Civicsmith runs under",
      "Nothing was created, so there is nothing to clean up. " + release.refused,
      `This is for the publisher of ${PRODUCT} releases to fix with a release that states them; try again after the next release.`);
  }
  /* R32, the rest of the fleet: a member the chosen release names beyond those `fresh` looked for is looked for now,
     still before the plan probe creates anything. */
  const further = (Array.isArray(release.man?.fleet) ? release.man.fleet : [])
    .map((m) => m && m.member).filter((m) => typeof m === "string" && !BINDING_OF.has(m));
  if (further.length) {
    let held;
    try { held = await copyHeld(token, acct.id, { buckets: false, members: [...new Set(further)] }); }
    catch (e) {
      emit.no("fresh");
      return emit.fail("Could not check your account",
        "The check for another installation's capability workers failed, so to be safe nothing was created.", "Detail: " + e.message);
    }
    if (held.length) { emit.no("fresh"); return oneCopyRefusal(emit, held); }
  }

  /* DIST-3 / DEC-42: the plan check comes BEFORE the first thing this flow
     creates (the buckets, one step down), so a Free-plan account is refused
     while there is genuinely nothing to clean up. Refusing IS the fix: the
     D-106 failure this guards is a group getting something quietly different
     from every description of it — a copy that looks installed and degrades
     under load it was told it could carry. */
  emit.step("plan", "Checking your account's Workers plan");
  let planAnswer;
  try { planAnswer = await establishPlan(token, acct.id); }
  catch (e) { planAnswer = { plan: "unknown", detail: e.message }; }
  if (planAnswer.plan === "free") {
    emit.no("plan");
    return emit.fail("The Workers Paid plan is needed first",
      "Your group's Civicsmith runs on Cloudflare Workers, and the work it does — reading captured documents, "
      + "assembling evidence, answering members — needs the processing allowance that comes with "
      + "Cloudflare's Workers Paid plan ($5/month), paid with a payment method on the account, which "
      + "the evidence storage this installer sets up needs as well. Installing without it would hand "
      + "you an installation that looks right and quietly fails under real work, which is worse than this "
      + "message. Nothing was installed, so there is nothing to clean up.",
      "To continue: sign in at dash.cloudflare.com with this same account, open Workers & Pages, "
      + "choose Plans, enable Workers Paid, then come back here and run the installer again.");
  }
  if (planAnswer.plan === "unknown") {
    emit.no("plan");
    return emit.fail("Could not verify your account's Workers plan",
      "The check that establishes your plan did not get a readable answer, and an unverified "
      + "plan is not a verified one — installing anyway could hand you an installation that quietly "
      + "degrades. Nothing was installed, so there is nothing to clean up.",
      "This is usually temporary: run the installer again in a minute. (Cloudflare said: "
      + planAnswer.detail + ")");
  }
  emit.ok("plan", "Workers Paid confirmed"
    + (planAnswer.leftover
        ? ". One cleanup note: the tiny probe script \"" + PLAN_PROBE + "\" could not be deleted "
          + "automatically — it is harmless, and you can remove it from Workers & Pages any time."
        : ""));

  /* Evidence storage is part of what a group's copy IS: captured documents,
     web pages, and their timestamp certificates live there. Real groups are
     not tech-savvy, so a copy without storage is not a lighter copy, it is a
     broken promise discovered later. If storage cannot be created, nothing
     is installed, and the page explains the one Cloudflare prerequisite in
     plain terms. */
  emit.step("r2", "Setting up your evidence storage");
  try { await ensureBuckets(token, acct.id); emit.ok("r2"); }
  catch (e) {
    emit.no("r2");
    return emit.fail("One Cloudflare setting is needed first",
      "Your group's Civicsmith keeps captured documents (PDFs, web pages, timestamp certificates) in Cloudflare's file "
      + "storage, and Cloudflare requires a payment method on the account before that storage can be turned "
      + "on. Usage at a community group's size stays inside the free tier; the card is Cloudflare's "
      + "requirement, not a charge. Nothing was installed, so there is nothing to clean up.",
      "To continue: sign in at dash.cloudflare.com with this same account, open Billing, add a card or "
      + "PayPal, then come back here and run the installer again. (Cloudflare said: " + e.message + ")");
  }

  emit.step("gen", "Generating your credentials");
  /* R9 (T36): four credentials; no shared member key. */
  const secrets = { boot: rand(32), probe: rand(32), daemon: rand(32), seal: rand(32),
                    ...(instanceAiOk(saved.ai) ? { instanceAi: saved.ai } : {}) };
  emit.ok("gen");

  /* DIST-6, step 1: bind only the members this account already holds (see BINDING_OF for the order). */
  const present = await membersPresent(token, acct.id);
  const profiles = Array.isArray(saved.p) && !profilesRefusal(saved.p, "install") ? saved.p : [];
  let selfRefused = false;
  emit.step("install", "Installing the software into your account");
  try { await uploadInstall(token, acct.id, slug, secrets, release, { members: present, profiles }); emit.ok("install"); }
  catch (e) {
    /* An install carries a service binding to the script this very upload
       creates. That self-reference cannot be rehearsed here — the only way to
       know Cloudflare accepts it is a real install, which is deploy-gated — so
       the ONE thing it must not do is cost a group their copy. Retry once
       without it: a copy that installs and monitors nothing is recoverable (the
       update path binds SELF, so their next update arms it), and a copy that
       never installed is not. Same doctrine as the storage arm of the update:
       an install is never refused over something it can complete later. */
    let degraded = false;
    try { await uploadInstall(token, acct.id, slug, secrets, release, { noSelf: true, members: present, profiles }); degraded = true; }
    catch { /* the original refusal is the one worth reporting */ }
    selfRefused = degraded;
    if (!degraded) {
      emit.no("install");
      return emit.fail("The software did not install",
        "Your account was reachable but the install was refused, so there is nothing left behind to clean up.",
        "Detail: " + e.message);
    }
    emit.ok("install", "Your group's Civicsmith is installed. One optional part — the part that lets it re-check "
      + "documents on its own schedule — was refused by Cloudflare and was left out, so nothing else "
      + "was held up. Running the updater later turns it on. (Cloudflare said: "
      + e.message + ")");
  }

  /* R33: the plane just uploaded, read back and hashed against the release; a mismatch is a lag the verdict names. */
  const byteLags = [];
  const readBackInto = async () => { const lag = await readBack(token, acct.id, slug, release);
    if (lag && !byteLags.includes(lag)) byteLags.push(lag); };
  await readBackInto();

  /* IC-82/D-297: the fleet rides the same act. Per-member degradation lives
     inside installFleet — it never fails the install. */
  /* R38: the plan was confirmed Paid at `plan`; the scope is what the permission granted. R45: the VPC service named. */
  const fleet = await installFleet(emit, token, acct.id, slug, release, { scope, plan: { plan: "paid" }, vpc: saved.vpc });

  /* R14, then R47: the address is enabled before the plane's last upload, so that upload can tell the copy its own
     hosts; with no address the copy is told none, and the page says so. */
  emit.step("addr", "Turning on your web address");
  let base = null, addrError = null;
  try {
    const { sub, registered } = await ensureSubdomain(token, acct.id, slug);
    base = `https://${slug}.${sub}.workers.dev`;
    emit.ok("addr", registered
      ? `Your account had no web address prefix yet, so it is now "${registered}". Every future worker on this account shares that prefix.`
      : undefined);
  } catch (e) { addrError = e; emit.no("addr"); }
  const ownHosts = base ? [hostOf(base)] : null;

  /* DIST-6, step 3: the plane re-PUT bound to every member now present, and (R47) to its own hosts. The buckets exist
     (the r2 step refuses the install otherwise), the DAEMON_TOKEN restated is the one just generated, and SELF is
     restated only if the install kept it. */
  const bound = await bindMembers(emit, token, acct.id, slug, release, present, fleet,
    { withR2: true, daemon: secrets.daemon, noSelf: selfRefused, profiles, ownHosts, writeHosts: true });
  if (bound.put) await readBackInto();
  /* DIST-9: told only AFTER the upload that carried it succeeded — never "stored" ahead of the act. */
  instanceAiNotice(emit, "install", !!secrets.instanceAi);
  assistantNotice(emit);

  if (addrError) {
    return emit.fail("Your group's Civicsmith installed but has no address yet",
      "The software is on your account. Only the public web address failed, which is fixable from the "
      + "Cloudflare dashboard under Workers, without starting over. Until it has one, your group's Civicsmith is not told an "
      + "address of its own; running the updater once the address works tells it.",
      "Detail: " + addrError.message);
  }

  /* R46: before `verify` can succeed, no Logpush job may keep a record of each request to the copy's Workers. */
  const logLags = await logsStep(emit, token, acct.id, copyWorkers(slug, release));

  emit.step("verify", "Checking that it answers");
  const st = await verifyInstall(base, secrets.probe);
  /* D-116: answering is not serving. Once the address answers, each part's OWN build is read back — the record
     store's, and each capability worker's through the plane's binding — and a part that is not on this release is
     named. A release that cannot report those builds says so (UNDETERMINED_BUILDS) rather than claiming them. */
  const capable = reportsBuilds(release.source);
  /* An install has always taken the selftest as its "answers"; a release that cannot report builds adds nothing to
     read, so the verdict is the selftest's plus the stated undetermined remainder — no new refusal is invented. */
  /* DIST-6: a bindable member whose upload failed is a lag on either branch, never a success over it. */
  const failed = fleet?.left || [];
  const served = !st ? null
    : capable ? await verifyServing(base, release.version, fleet?.done || [], capable, failed)
    : ((lags) => ({ confirmed: lags.length === 0, lags, capable: false }))(failedLags(failed));
  /* R33's read-back and R46's named jobs: each a lag, and no success while one stands. */
  const verdict = withByteLags(served, [...byteLags, ...logLags], capable);
  if (st && verdict.confirmed) emit.ok("verify", capable ? undefined : "Your group's Civicsmith answers. " + UNDETERMINED_BUILDS);
  else if (st) emit.no("verify", "Your group's Civicsmith answers, but not everything is confirmed yet: the list below names what is not");
  else emit.no("verify");

  emit.done(successPanel(base, secrets, !!st, verdict, saved.vpc));
}

/* R46: the copy's Workers, by script name: the plane, and every member it binds or the release names. */
function copyWorkers(slug, release) {
  const names = [slug, ...BINDING_OF.keys()];
  for (const m of Array.isArray(release.man?.fleet) ? release.man.fleet : []) if (m && typeof m.member === "string") names.push(m.member);
  return [...new Set(names)];
}

const NO_KEY = `No one else holds a key to it, the publisher of ${PRODUCT} releases included.`;
/* R45 (T36): the security-tools paragraph of the final panel and the update's last screen: where the organization's own
   tools are added (setup-page R30), that the installer takes none, and what the operator's VPC choice did. */
function securityToolsNote(vpc) {
  return `<div class="card" id="security-tools"><p style="margin:0">${esc(SECURITY_TOOLS.replace(/\s+/g, " ").trim())} ${vpcServiceOk(vpc)
    ? "You named a Workers VPC service, so the installer connected the file scanner to it where it could (the capability workers step says whether it did)."
    : "You named no Workers VPC service, so none is connected: a tool reached through a tunnel answers REACH_NOT_BOUND in your group&#39;s Civicsmith until the updater is run with one."}</p></div>`;
}
function successPanel(base, secrets, verified, verdict = null, vpc = null) {
  const lagging = !!(verdict && !verdict.confirmed);
  const head = verified && !lagging
    ? `<b>Your group's Civicsmith is running.</b> It lives in your
Cloudflare account, under your control. ${NO_KEY}`
      + (verdict && !verdict.capable ? ` ${esc(UNDETERMINED_BUILDS)}` : "")
    : lagging
    ? `<b>Your group's Civicsmith is installed${verified ? " and answering" : ""}, but not everything about it is confirmed yet.</b>
${verified ? "When it was last asked:" : "Its new address has not woken up yet, and:"}${lagList(verdict)}Save the credentials below now either way. It lives in your Cloudflare
account, under your control. ${NO_KEY}`
    : `<b>Your group's Civicsmith is installed. Its new address has not woken up yet.</b> Brand-new
addresses can take a few minutes to start answering; everything else finished. Save the
credentials below now, then open your address. It lives in your Cloudflare account, under
your control. ${NO_KEY}`;
  return `<div class="${lagging ? "notice" : "okbox"}"><p style="margin:0">${head}</p></div>
<div class="card">
 <div class="kv"><span class="k">Your address</span><span class="v" id="out-url">${esc(base)}</span><button class="copy" data-copy="out-url">Copy</button></div>
 <div class="kv"><span class="k">One-time password</span><span class="v" id="out-boot">${secrets.boot}</span><button class="copy" data-copy="out-boot">Copy</button></div>
 <div class="kv"><span class="k">Probe credential</span><span class="v" id="out-probe">${secrets.probe}</span><button class="copy" data-copy="out-probe">Copy</button></div>
</div>
<p><b>Save the probe credential in a password manager now.</b> This page is the only time it is
shown. The one-time password is spent in the next step, where you choose a real password. There is
no shared member credential: each member signs in with their own account.</p>
${securityToolsNote(vpc)}
${/* R34 (DEC-109, K1038): before the hand-over to where the founder chooses a password, who really controls the copy, in
   instance-setup's words; nothing asks for or records an acknowledgement of it. */ hostingControlBlock("notice")}
<div class="actions"><button id="handover" data-url="${esc(base)}/">Go to your group&#39;s Civicsmith and finish setup</button></div>`;
}

/* D-436 / IC-172 — THE ONE ACT AN UPDATE LEAVES TO THE OPERATOR: recording which group produces the record.
 *
 * A copy records its producing group ONCE: at its store's first boot, from the INSTANCE_NAME `uploadInstall`
 * binds in the same PUT that creates the worker (so a copy installed on a release carrying IC-172 records it
 * with nobody's act), or, for a store that already held a record when the value arrived, by one act of its
 * root of trust, op=instancegroupseed. THIS INSTALLER NEVER PERFORMS THAT ACT (D-436's decision (b); BOB #24
 * confirmed an automatic seed is not ruled in): which group produces a record is a person's to say, and a
 * copy's worker name need not be its group's slug. So an update TELLS the operator, and never seeds.
 *
 * WHY IT TELLS FROM THE RULE AND NOT FROM A READ (DIST #4, 2026-09-22, refining DIST #3's route of 2026-09-21
 * in CLAIMS.md). That route read op=instancegroup after the update. The op answers the admin, member and probe
 * classes only (its OPS row, today `op-declarations`' `bio-plane/src/op-declarations/index.mjs`), and an update holds none of them: it holds the operator's
 * Cloudflare permission, and a copy's secrets are write-only there. What an update CAN read, with no credential,
 * is op=bootstrap's version BEFORE the upload (`before` below) — and a copy that ran a release older than
 * FIRST_GROUP_RELEASE records no group after this update, by the rule itself: its store already held the schema,
 * and no older release had the op to seed it. That case is told plainly. When the version before is unknown the
 * telling is conditional and says why. When the copy already ran FIRST_GROUP_RELEASE or later nothing is said:
 * the update that crossed the line told it then, and a copy installed since recorded its group at first boot. */
const FIRST_GROUP_RELEASE = "0.71.0";
const SEMVER = /^\d+\.\d+\.\d+$/;
function groupUnrecorded(before, releaseVersion, noop) {
  if (noop || vcmp(releaseVersion, FIRST_GROUP_RELEASE) < 0) return null;
  if (before === null || !SEMVER.test(String(before))) return "unknown";
  return vcmp(before, FIRST_GROUP_RELEASE) < 0 ? "certain" : null;
}
function groupNotice(kind, slug, before, base) {
  if (!kind) return "";
  const at = base ? esc(base) : "the address of your group&#39;s Civicsmith";
  const why = kind === "certain"
    ? `Your group&#39;s Civicsmith ran ${esc(before)} before this update, and an installation that held a record before ${FIRST_GROUP_RELEASE}
does not know which group produces it: it records that once, and one that already held a record when the
value arrived is not given a name nobody told it.`
    : `The installer could not read which version your group&#39;s Civicsmith ran before this update, so it cannot tell whether this
applies to you. It does if it held a record before ${FIRST_GROUP_RELEASE}: it then does not know which
group produces its record, and is not given a name nobody told it.`;
  return `<div class="notice"><p style="margin:0 0 .6em"><b>One thing this update does not do for you: record which
group produces your record.</b></p>
<p>${why} Until it is recorded, your group&#39;s Civicsmith refuses the writes that must name their producing group &mdash; testimony,
the setup page&#39;s saves, and a new document that names none &mdash; with <span class="mono">GROUP_UNDETERMINED</span>.
A document that states its own group is kept as it says, and nothing already in your record changes.</p>
<p>To record it, send one request carrying the ADMIN_TOKEN of your group&#39;s Civicsmith (the one-time password the installer showed you,
if you kept it; otherwise put a new ADMIN_TOKEN value in your worker&#39;s settings on Cloudflare, which also starts the
claim step over) in its header, never in the address: <span class="mono">POST ${at}/api/?op=instancegroupseed</span> with the
header <span class="mono">Authorization: Bearer &hellip;</span> and the body
<span class="mono">{"slug":"your-group-slug"}</span>, then the same request with <span class="mono">&amp;store=scratch</span>
added to the address, for your scratch record. Each records it once and never again, so check the spelling first;
<span class="mono">op=instancegroup</span> shows what is recorded.</p>
<p class="small">A suggestion, not a default: your group&#39;s Civicsmith was installed under the name <span class="mono">${esc(slug)}</span>.
Your group&#39;s slug may differ from it: the name an installation is given and the name of the group producing its record need not be
the same. The installer does not record it for you: which group produces your record is yours to say.</p></div>`;
}

async function runUpdate(emit, code, saved) {
  const slug = saved.slug;
  let token, scope;

  emit.step("auth", "Confirming your permission with Cloudflare");
  try { ({ token, scope } = await exchange(code, saved.v)); emit.ok("auth"); }
  catch (e) {
    emit.no("auth");
    return emit.fail("Cloudflare did not confirm the permission",
      "The sign-in came back but the final handshake failed. Your group's Civicsmith is untouched.",
      "Detail: " + e.message);
  }

  emit.step("acct", "Finding your account");
  let acct;
  try {
    const accts = await cf(token, "/accounts");
    if (!accts?.length) throw new Error("no accounts on this sign-in");
    acct = accts[0];
    emit.ok("acct", `Using the account "${acct.name}"`);
  } catch (e) {
    emit.no("acct");
    return emit.fail("Could not read your account",
      "Permission was granted but the account list came back empty or refused. Your group's Civicsmith is untouched.",
      "Detail: " + e.message);
  }

  emit.step("find", `Finding your group's Civicsmith, installed as "${slug}"`);
  try {
    if (!(await scriptExists(token, acct.id, slug))) {
      emit.no("find");
      return emit.fail(`No installation named "${slug}" exists on your account`,
        "Nothing was changed. Check the name against your address: it is the first part, before the first dot.",
        "");
    }
    emit.ok("find");
  } catch (e) {
    emit.no("find");
    return emit.fail("Could not check your account",
      "The lookup failed, so to be safe nothing was changed.",
      "Detail: " + e.message);
  }

  let withR2 = false;
  try { await ensureBuckets(token, acct.id); withR2 = true; } catch {}

  const release = await selectRelease(emit);
  if (release.refused) {
    return emit.fail("This update cannot say which limits your group's Civicsmith runs under",
      "Your group's Civicsmith is still running the version it had before. Nothing about it changed. " + release.refused,
      `This is for the publisher of ${PRODUCT} releases to fix with a release that states them; try again after the next release.`);
  }

  /* What is it running now? Asked before the upload, so an update that changes
     nothing can say so instead of reading as a success. A no-op reported as
     "Updated to X" is worse than a plain refusal: the operator believes the
     work happened and moves on. Observed live on 2026-07-24, a 0.3.10 over
     0.3.10 update where the only honest line was easy to skim past. */
  let before = null, sub0 = null;
  try {
    sub0 = (await cf(token, `/accounts/${acct.id}/workers/subdomain`))?.subdomain || null;
    if (sub0) {
      const r = await fetch(`https://${slug}.${sub0}.workers.dev/api/?op=bootstrap`);
      if (r.ok) before = (await r.json())?.version || null;
    }
  } catch { /* not knowing is fine; it only costs the comparison */ }
  const noop = before !== null && before === release.version;
  /* R47: the copy's own hosts, restated from the address found; none found, none written (and the page says so). */
  const ownHosts = sub0 ? [`${slug}.${sub0}.workers.dev`] : null;

  emit.step("up", noop
    ? `Your group's Civicsmith already runs ${release.version}. Re-uploading the same version`
    : before
      ? `Updating the software from ${before} to ${release.version}`
      : `Updating the software to ${release.version}`);
  /* DIST-6, step 1: restate the members the account already holds, so the update never un-binds a working copy's
     members — not for its duration, and not for good when the fleet step below cannot run. */
  const present = await membersPresent(token, acct.id);
  const instanceAi = instanceAiOk(saved.ai) ? saved.ai : undefined;
  /* K1541, R36 and R17: which bindings the copy holds, by name and type, read before the upload. */
  const held = await heldBindings(token, acct.id, slug);
  const seal = held && held.get(SEAL_BINDING) !== "secret_text" ? rand(32) : undefined;
  try { await uploadUpdate(token, acct.id, slug, withR2, release, { members: present, instanceAi, seal, ownHosts }); emit.ok("up"); }
  catch (e) {
    emit.no("up");
    return emit.fail("The update was refused",
      "Your group's Civicsmith is still running the version it had before. Nothing about it changed.",
      "Detail: " + e.message);
  }

  /* R33: as on install, the uploaded plane is read back and hashed against the release. */
  const byteLags = [];
  const readBackInto = async () => { const lag = await readBack(token, acct.id, slug, release);
    if (lag && !byteLags.includes(lag)) byteLags.push(lag); };
  await readBackInto();

  /* The update path installs OR refreshes the members — the PUT is the same
     act, and this is what heals a copy installed before the fleet existed
     (the SELF-binding precedent, now for whole workers). */
  /* R38 with R17: no plan is known on an update; it is established only if a container member would install. */
  const fleet = await installFleet(emit, token, acct.id, slug, release, { scope, vpc: saved.vpc });
  /* DIST-6, step 3: this is what gives a copy installed WITHOUT member bindings its bindings. */
  const bound = await bindMembers(emit, token, acct.id, slug, release, present, fleet, { withR2, ownHosts });
  if (bound.put) await readBackInto();
  instanceAiNotice(emit, "update", !!instanceAi);
  await accountSecretsNotice(emit, token, acct.id, slug, held, seal);

  emit.step("addr", "Finding the address of your group's Civicsmith");
  let base = null;
  try {
    const sub = (await cf(token, `/accounts/${acct.id}/workers/subdomain`))?.subdomain;
    if (sub) base = `https://${slug}.${sub}.workers.dev`;
  } catch { /* said below: an address not found is not told to the copy */ }
  emit.ok("addr", ownHosts
    ? `Your group's Civicsmith is at ${ownHosts.join(", ")}, and this update told it that address is its own.`
    : "No web address was found for your group's Civicsmith, so it was not told one of its own. Once its address works, "
      + "running this update again tells it.");

  /* R46: as on install, before `verify` can succeed. */
  const logLags = await logsStep(emit, token, acct.id, copyWorkers(slug, release));

  /* D-116: confirmed means EVERY part answers the release — the address, the record store, and each capability
     worker through the plane's binding (verifyServing). The patient tone stays, because a rollout genuinely takes
     minutes; what goes is reporting an update as done while a named part still runs the old build. */
  const capable = reportsBuilds(release.source);
  let verdict = null;
  if (base) {
    emit.step("verify", "Checking the new version answers");
    verdict = withByteLags(await verifyServing(base, release.version, fleet?.done || [], capable, fleet?.left || []),
      [...byteLags, ...logLags], capable);
    if (verdict.confirmed) emit.ok("verify", capable ? undefined : "The address of your group's Civicsmith answers " + release.version
      + ". " + UNDETERMINED_BUILDS);
    else emit.no("verify", "Not everything about your group's Civicsmith is confirmed yet: the list below names what is not. A part "
      + "still running the old version is normal for a few minutes after an update.");
  }
  /* R33: with no address to ask, a read-back lag is still named, and no success is claimed over it. */
  if (!verdict) verdict = withByteLags(null, [...byteLags, ...logLags], capable);
  const confirmed = !!(verdict && verdict.confirmed);
  const lagging = !!(verdict && !verdict.confirmed);

  /* D-436: told, never done — see FIRST_GROUP_RELEASE above. */
  const told = groupNotice(groupUnrecorded(before, release.version, noop), slug, before, base);

  emit.done(noop
    ? `<div class="notice"><p style="margin:0"><b>Nothing changed: your group&#39;s Civicsmith was already running ${esc(release.version)}.</b>
The upload succeeded, but it replaced that version with the same version, so this update moved nothing.
If you expected something newer, the installer had nothing newer to give: it uses the newest release it can
verify, and that is ${esc(release.version)}. Check that a newer release has actually been published before
running this again.</p></div>`
      + (lagging ? `<div class="notice"><p style="margin:0">Not everything about your group&#39;s Civicsmith running ${esc(release.version)} is confirmed:</p>${lagList(verdict)}</div>` : "")
    : (lagging
    /* D-116: the upload happened, and is said; an UPDATE is not claimed while a named part runs another build. */
    ? `<div class="notice"><p style="margin:0"><b>Uploaded ${esc(release.version)}${before ? " over " + esc(before) : ""}; not yet confirmed.</b>
The upload finished, but not everything about your group&#39;s Civicsmith running the new version is confirmed:</p>
${lagList(verdict)}<p>A part can take a few minutes to start running a new version after an update, so
open your group&#39;s Civicsmith a little later and check again; if the same part is still named, run this update again. Your
passwords, your credentials, and everything in the record are exactly as they were. Updates never touch them.</p></div>`
    : `<div class="okbox"><p style="margin:0"><b>Updated ${before ? "from " + esc(before) + " " : ""}to ${esc(release.version)}.</b>
${confirmed
  ? (capable ? "Every part of your group's Civicsmith answers " + esc(release.version) + ": its address, its record store, and each capability worker it is connected to."
             : "The new version is answering. " + esc(UNDETERMINED_BUILDS))
  : "The upload finished successfully. The address can take a few minutes to start serving the new version, so open your group's Civicsmith a little later and its page will show " + esc(release.version) + "."}
Your passwords, your credentials, and everything in the record are exactly as they were.
Updates never touch them.</p></div>`)
    + told
    + securityToolsNote(saved.vpc)
    + (base ? `<div class="actions"><a class="btnlink" href="${esc(base)}/">Open your group&#39;s Civicsmith</a></div>` : ""));
}

/* ---------------------------------------------------------------- routes */

export default {
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "GET" && (url.pathname === "/" || url.pathname === ""))
      return html(WIZARD_HTML);

    if (req.method === "GET" && url.pathname === "/update")
      return html(UPDATE_HTML);

    /* Begin: validate, mint PKCE, park it in an HttpOnly cookie, hand the
       browser the authorize URL. The verifier belongs to this browser and
       only ever travels back to this same origin. */
    if (req.method === "POST" && url.pathname === "/begin") {
      const body = await req.json().catch(() => ({}));
      const mode = body.mode === "update" ? "update" : "install";
      /* R2: a slug is a string in the grammar; a number or anything else is refused, never coerced into one. */
      const slug = typeof body.slug === "string" ? body.slug.trim() : "";
      if (!slugOk(slug))
        return json({ ok: false, error: "The name needs 3 to 40 characters: lower-case letters, digits, and hyphens, starting and ending with a letter or digit." }, 400);
      const v = rand(32), s = rand(16);
      const q = new URLSearchParams({
        response_type: "code", client_id: CFG.CLIENT_ID, redirect_uri: CFG.REDIRECT,
        scope: CFG.SCOPES.join(" "), state: s,
        code_challenge: await s256(v), code_challenge_method: "S256",
      });
      /* DIST-9: an OPTIONAL organisation `ai` credential. Absent or empty is the normal case; a value that is present
         but not credential-shaped is REFUSED by name here, before any sign-in, rather than silently dropped. */
      const ai = typeof body.instanceAi === "string" ? body.instanceAi.trim() : "";
      if (ai && !instanceAiOk(ai))
        return json({ ok: false, error: "The organisation AI credential does not look like one: paste it exactly as it was shown when it was minted (16 to 512 characters, no spaces), or leave the box empty." }, 400);
      /* R21: the chosen jurisdiction profiles (install only), refused by name when not offered, never silently dropped. */
      const profilesWhy = profilesRefusal(body.profiles, mode);
      if (profilesWhy) return json({ ok: false, error: profilesWhy }, 400);
      const p = Array.isArray(body.profiles) && body.profiles.length ? body.profiles : null;
      /* R45 (T36): the Workers VPC service the operator names for a tool reached through a tunnel, optional on the install
         and the update alike; a value present but not a service id is refused by name, never dropped. */
      const vpc = typeof body.securityVpc === "string" ? body.securityVpc.trim().toLowerCase() : "";
      if (vpc && !vpcServiceOk(vpc))
        return json({ ok: false, error: "The Workers VPC service does not look like one: paste its ID as Cloudflare shows it (32 hexadecimal digits, with or without dashes), or leave the box empty." }, 400);
      /* R36, R37 (T36): nothing else /begin is sent is kept: no field carries a Claude credential, and the install takes no
         choice about the assistant (an `assistant` field is taken nowhere). */
      const cookie = b64url(enc.encode(JSON.stringify({ v, s, slug, mode, t: Date.now(), ...(ai ? { ai } : {}), ...(p ? { p } : {}),
        ...(vpc ? { vpc } : {}) })));
      return json({ ok: true, authorize: `${CFG.AUTHORIZE}?${q}` }, 200,
        { "set-cookie": setCookie(cookie, CFG.COOKIE_MAX_AGE_S) });
    }

    /* The return address. Only Cloudflare sends anyone here. */
    if (req.method === "GET" && url.pathname === "/callback") {
      const clear = { "set-cookie": setCookie("deleted", 0) };
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const err = url.searchParams.get("error");

      let saved = null;
      const raw = readCookie(req, CFG.COOKIE);
      if (raw) {
        try { saved = JSON.parse(new TextDecoder().decode(
          Uint8Array.from(atob(raw.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)))); }
        catch { saved = null; }
      }

      if (err)
        return html(plainPage("Permission was not granted",
          "Cloudflare did not approve the request, so nothing was created.",
          url.searchParams.get("error_description") || err, saved?.slug), 200, clear);

      if (!code || !saved || saved.s !== state
          || typeof saved.t !== "number" || Date.now() - saved.t > CFG.COOKIE_MAX_AGE_S * 1000)
        return html(plainPage("This sign-in could not be verified",
          "The reply from Cloudflare does not match a request this browser made recently. Nothing was created. "
          + "Start again from the beginning, in this same tab.", ""), 200, clear);

      const title = saved.mode === "update" ? "Updating your group's Civicsmith" : "Setting up your group's Civicsmith";
      return streamPage(clear, progressShell(title, saved.slug),
        (emit) => saved.mode === "update" ? runUpdate(emit, code, saved) : runInstall(emit, code, saved));
    }

    return html(plainPage("Nothing lives at this address",
      "The installer starts at the front page.", ""), 404);
  },
};

/* R22: a refusal page names Civicsmith (PRODUCT), and the group by the name it chose when this browser's request carried
   one; before a group has chosen a name (the 404, an unverifiable return) it speaks to "your group". */
function plainPage(head, what, detail, slug) {
  const group = typeof slug === "string" && slugOk(slug)
    ? `For the group <b class="mono" id="group">${esc(slug)}</b>.` : `Setting up your group&#39;s ${PRODUCT}.`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(head)}</title><style>${PAGE_CSS}</style></head><body><main>
<p class="eyebrow">${PRODUCT} &middot; installer</p>
<h1>${esc(head)}</h1><p>${esc(what)}</p>
${detail ? `<p class="small mono">${esc(detail)}</p>` : ""}
<p class="small">${group}</p>
<p><a href="/">Back to the start</a></p>
${publisherFooter()}
</main></body></html>`;
}
