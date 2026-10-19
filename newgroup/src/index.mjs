/* Part 2 of the BIO installer: the wizard Worker.
 *
 * Lives at newgroup.believeinoakland.workers.dev. Serves the wizard page,
 * receives the OAuth return, and provisions the team's instance into THEIR
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

import { WIZARD_HTML, updateHtml, publisherFooter, PROFILE_CHOICES, ASSISTANT_OFFER, SECURITY_TOOLS, pageHead, pageMark, around, SLOT,
  ASSET_PREFIX, UPDATE_WORDS, versionOk, NO_RELEASE_CHOSEN, NO_RELEASE_BEGIN, existsPanel, removePanel, removedPanel } from "./ui.mjs";
/* R72: every sentence a key holds is read by key; R66, R71: the way to Cloudflare waits out what waiting can mend. */
import { word } from "./words.mjs";
import { cf as cfCall, Session, patiently, sleep, WAIT_BOUND_MINUTES } from "./cfx.mjs";
/* R62–R65, R69, R70: what the account holds and the names a copy's parts carry. */
import { namesFor, schemeOf, SLUG_SCHEME, LEGACY_SCHEME, MARK, allCopies, inventory, freeName, readCopyFacts, describeCopy, countsViaApi, resourcesOf,
  deleteResources, takeLock, touchLock, dropLock, listScripts, listBuckets, listNamespaces, listApps, bindingsOf } from "./account.mjs";
/* R53 (DEC-122 (3); K3100): interface-assets' stylesheet and faces, carried in this bundle and served at ASSET_PREFIX. */
import { ASSET_FILES } from "../../bio-plane/src/interface-assets/index.mjs";
import { RELEASE_BINARY, RELEASE_VERSION, RELEASE_MANIFEST, RELEASE_CONTAINERS } from "./release.mjs";
import { ARMED_SIGNERS } from "./signers.mjs";
/* R38, R23 (T46): whether a container image can be pulled, and what your team's Civicsmith lacks without it; held once
   for this fleet step and the pages. */
import { imageWhy, lacksOf } from "./images.mjs";
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
     over the team's logging that R2 does not ask: the check reads the list and, refused, states itself undetermined
     with the one check the operator can make. Named here so the reason is in one place; never asked. */
  LOGPUSH_SCOPE: "account-logs.write",
  COOKIE:    "bio_wiz",
  COOKIE_MAX_AGE_S: 900,
  /* Public releases: two committed files in the repo's release/ folder on
     main, readable without any API token or rate limit. RELEASE.json names
     the version and the asset's SHA-256, and nothing fetched is ever
     installed without passing that check. */
  RELEASE_LATEST: "https://raw.githubusercontent.com/believeinoakland/bio/main/release",
  /* R61: where the parts of a release other than the newest are kept, the release's own tag (the built-in release's, when the
     repository has moved on to another). */
  RELEASE_TAGGED: (version) => `https://raw.githubusercontent.com/believeinoakland/bio/v${version}/release`,
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
  /* R33 (K3441, memory): the verified bytes ARE the release. They are never decoded into a string (a 21 MB module with a
     few non-Latin-1 characters is a 43 MB string). What is read from them (R20's limits, R15's build fields) is read here,
     as bytes, and what is kept is one Blob of them, uploaded as it is by every upload of this act (a Blob is shared, never
     copied again) and, with the hash just verified, which the read-back is compared with. The downloaded bytes are then
     let go, so the release is held once, not twice. */
  return { blob: new Blob([bytes], { type: "application/javascript+module" }), sha: got,
    limits: planeLimits(bytes), capable: reportsBuilds(bytes) };
}

/* R33 (K3441, K3442) — THE BUILT-IN RELEASE, HELD ONCE. `release.mjs` carries the signed plane as a binary string (one character
   per byte, so the engine holds it one byte each: 21 MB, where the same release as text is two bytes each, 43 MB, because
   a few characters are above 255). What an act uploads is one Blob made from it, in the one pass that turns each character
   back into its byte, and kept for every upload of the act and the isolate's life; its limits and build fields are read from
   the string as text (they are ASCII); its hash is taken from the Blob's bytes when the read-back first needs it. The bytes
   uploaded and hashed are exactly the signed release's. */
let builtInBlob = null;
function builtInRelease() {
  if (!builtInBlob) {
    const bytes = new Uint8Array(RELEASE_BINARY.length);
    for (let i = 0; i < bytes.length; i++) bytes[i] = RELEASE_BINARY.charCodeAt(i);
    builtInBlob = new Blob([bytes], { type: "application/javascript+module" });
  }
  return { blob: builtInBlob, capable: reportsBuilds(RELEASE_BINARY) };
}

/* R61: the built-in release is installed with ITS OWN signed manifest (embedded with it, `RELEASE_MANIFEST`), and its members are
   fetched from where its own release is kept: the newest release's folder when the repository still holds this release there,
   its tag's otherwise. */
const builtInBase = (repoMan) => (repoMan && String(repoMan.version) === RELEASE_VERSION ? CFG.RELEASE_LATEST : CFG.RELEASE_TAGGED(RELEASE_VERSION));

/* The installer prefers the newest verified release from the public
   repository and always has its built-in copy to stand on. It never installs
   anything that failed verification, and it always says which copy it used
   and why, in words a person can act on. */
async function selectRelease(emit) {
  await emit.step("rel", word("installer.step.release.install"));
  /* The manifest travels with the selection (IC-82): the fleet half reads
     `fleet[]`/`fleetSig` from it. null means the repository was unreachable —
     a STATED absence the fleet step reports, never rounds to "no members". */
  let man = null, said = "";
  const builtin = RELEASE_VERSION;
  try {
    man = await fetchRepoManifest();
    if (vcmp(man.version, RELEASE_VERSION) > 0) {
      const { limits: lim, ...asset } = await fetchRepoAsset(man);
      /* R20: verified bytes that state no readable limits are not used either; the built-in stands in, and the page says why. */
      if (lim.ok) {
        emit.ok("rel", ARMED_SIGNERS.length
          ? word("installer.release.newer.signed", { version: man.version, builtin })
          : word("installer.release.newer.checked", { version: man.version, builtin }));
        return { version: String(man.version), ...asset, from: "repository", man, limits: lim.limits };
      }
      said = lim.why === "none" ? word("installer.release.nolimits", { version: man.version, builtin })
        : word("installer.release.badlimits", { version: man.version, builtin });
    } else said = word("installer.release.current", { builtin });
  } catch (e) {
    /* R11: a repository that answered, but whose plane failed verification, was REACHABLE: its manifest stays, so the
       fleet step names the true reason its members are left out (they are signed against a plane this act did not
       install) rather than "not reachable". Only a repository that did not answer leaves no manifest. */
    if (!(e && (e.integrity || e.unsigned || e.signature))) man = null;
    const tail = " " + word("installer.release.fallback.tail", { builtin });
    said = e && e.integrity ? word("installer.release.fallback.integrity") + tail
      : e && e.unsigned ? word("installer.release.fallback.unsigned") + tail
      : e && e.signature ? word("installer.release.fallback.wrongsigner", { reason: e.reason || "invalid" }) + tail
      : word("installer.release.fallback.unreachable", { builtin });
  }
  /* R20: the built-in is held to the same rule. One that states no readable limits is refused by name, before any plane
     upload; the caller stops the act (`refused`) and nothing installs. */
  const lim = planeLimits(RELEASE_BINARY);
  if (!lim.ok) {
    emit.no("rel", said);
    return { refused: lim.why === "none" ? word("installer.release.refused.none", { builtin }) : word("installer.release.refused.unreadable", { builtin }) };
  }
  emit.ok("rel", said);
  return { version: RELEASE_VERSION, ...builtInRelease(), from: "built-in", man: RELEASE_MANIFEST, base: builtInBase(man), limits: lim.limits };
}

/* R55 (T48; N1047; DEC-226 (4); K3158) — THE UPDATE INSTALLS THE RELEASE CHOSEN AND NO OTHER. `V` is the version the team's
   administrator chose in Settings › Updates (`GET /update?version=<V>` through `/begin`'s cookie). The release installed is the
   repository's, when its manifest names exactly V, or the built-in one, when V is the version this installer carries. The
   repository's is held to R8's checks (its bytes hash to its manifest's `sha256`, its `sig` verifies in the release namespace
   against ARMED_SIGNERS, which are `signatures`' RELEASE_KEYS, R43) and to R20's (it states its limits). R8's "newer than the
   built-in" does not choose: V does. A release of any other version, or one failing a check, is not installed, and the answer
   says why in words; nothing is uploaded. Answers `{version, blob, capable, sha?, from, man, limits}` like selectRelease, or `{stop}`. */
async function selectChosen(emit, V) {
  await emit.step("rel", word("installer.step.release.update", { version: V }));
  const stop = (said) => { emit.no("rel"); return { stop: said }; };
  const unlimited = (lim) => stop(lim.why === "none" ? word("installer.update.stopped.nolimits", { version: V }) : word("installer.update.stopped.badlimits", { version: V }));
  let man = null, unreachable = false;
  try { man = await fetchRepoManifest(); } catch { unreachable = true; }
  const builtIn = V === RELEASE_VERSION;
  /* An update is never installed on hashes alone: with no key to verify against, nothing is a signed release. */
  if (!ARMED_SIGNERS.length) return stop(word("installer.update.stopped.nokeys", { version: V }));
  if (!builtIn) {
    if (unreachable) return stop(word("installer.update.stopped.unreachable", { version: V }));
    if (!man || String(man.version) !== V) return stop(word("installer.update.stopped.norelease", { version: V }));
    let asset;
    try { asset = await fetchRepoAsset(man); }
    catch (e) {
      return stop(e && e.integrity ? word("installer.update.stopped.integrity", { version: V })
        : e && e.unsigned ? word("installer.update.stopped.unsigned", { version: V })
        : e && e.signature ? word("installer.update.stopped.wrongsigner", { version: V })
        : word("installer.update.stopped.unreachable", { version: V }));
    }
    const { limits: lim, ...rest } = asset;
    if (!lim.ok) return unlimited(lim);
    emit.ok("rel", UPDATE_WORDS.progressVerified(V));
    return { version: V, ...rest, from: "repository", man, limits: lim.limits };
  }
  const lim = planeLimits(RELEASE_BINARY);
  if (!lim.ok) return unlimited(lim);
  emit.ok("rel", UPDATE_WORDS.progressVerified(V));
  return { version: V, ...builtInRelease(), from: "built-in", man: RELEASE_MANIFEST, base: builtInBase(man), limits: lim.limits };
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

/* R66 (F4), R71 (F6): a slow, rate-limited or transiently failed answer is waited out within the stated bound; a permission
   that has expired ends the run asking for approval again. `token` is the run's Session (cfx.mjs). */
const cf = (token, path, init = {}) => cfCall(token, path, init, CFG.API);
/* The call bound to one account, the form account.mjs takes. */
const apiOf = (token, acct) => (path, init) => cf(token, `/accounts/${acct}${path}`, init);
/* What waiting could not mend, and what asks for approval again, pass the catches of a step untouched. */
const special = (e) => !!e && (e.approveAgain === true || e.lasting === true);
/* A read the run can do without (the deployment to put back, a worker's presence for one binding): only a permission that has
   expired stops it; a failure that never mended is "not known". */
const approve = (e) => !!e && e.approveAgain === true;

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
   failing on its own earlier success. The names are the copy's own (R64, account.mjs `namesFor`). Returns the buckets
   that were already there (R69: what an earlier run left). */
async function ensureBuckets(token, acct, names) {
  const there = [];
  for (const name of [names.captures, names.published]) {
    try { await cf(token, `/accounts/${acct}/r2/buckets`, { method: "POST", body: JSON.stringify({ name }), idem: true }); }
    catch (e) { if (!/already exists/i.test(e.message)) throw e; there.push(name); }
  }
  return there;
}

/* R33 (Distribution §5, "byte-verified on read-back"; K3441): the plane's script as the account now holds it, read back and
   hashed against the release's own bytes, never believed from the upload's answer. The account answers the script
   either as the module itself or as a multipart body whose `index.mjs` part is the module (as `deploy.mjs` reads it).
   `null` when nothing readable came back: an unread script is not a matching one.

   THE HASH IS OVER THE BYTES AS DOWNLOADED. The body is never turned into a string and back: that alters bytes (WHATWG's
   "latin1" is windows-1252, which maps 0x80-0x9F to other code points, so no such hash ever matched a module holding
   them) and costs several copies of a 21 MB module, past a Worker's 128 MB. The part is found by byte offsets in the
   downloaded bytes and hashed as a view of them: the one copy held is the download itself. */
const CRLF = [13, 10], HEADER_END = [13, 10, 13, 10];
const ascii = (s) => Uint8Array.from(s, (c) => c.charCodeAt(0));
/* The first offset at or after `from` where `pat` (bytes) occurs in `hay`, or -1; the native scan finds each candidate. */
function find(hay, pat, from = 0) {
  for (let i = hay.indexOf(pat[0], from); i !== -1 && i + pat.length <= hay.length; i = hay.indexOf(pat[0], i + 1)) {
    let k = 1;
    while (k < pat.length && hay[i + k] === pat[k]) k++;
    if (k === pat.length) return i;
  }
  return -1;
}
/* The `index.mjs` part of a multipart body, as a view of `bytes`, or null. */
function multipartPart(bytes, boundary) {
  const delim = ascii("--" + boundary), next = new Uint8Array([...CRLF, ...delim]);
  for (let at = find(bytes, delim); at !== -1; ) {
    const start = at + delim.length;
    if (bytes[start] === 45 && bytes[start + 1] === 45) return null;          /* the closing delimiter */
    const head = find(bytes, HEADER_END, start);
    if (head === -1) return null;
    const headers = new TextDecoder().decode(bytes.subarray(start, head));
    const end = find(bytes, next, head + HEADER_END.length);
    if (/name="index\.mjs"/.test(headers)) return bytes.subarray(head + HEADER_END.length, end === -1 ? bytes.length : end);
    at = end === -1 ? -1 : end + CRLF.length;
  }
  return null;
}
async function scriptHash(token, acct, slug) {
  let r;
  try {
    r = await fetch(`${CFG.API}/accounts/${acct}/workers/scripts/${slug}`,
      { headers: { authorization: token.bearer, accept: "application/javascript+module" } });
  } catch { return null; }
  if (!r.ok) return null;
  const ct = r.headers.get("content-type") || "";
  let bytes = new Uint8Array(await r.arrayBuffer());
  if (/multipart/i.test(ct)) {
    const m = /boundary="?([^";]+)"?/i.exec(ct);
    if (!m) return null;
    bytes = multipartPart(bytes, m[1]);
    if (!bytes) return null;
  }
  return hex(await crypto.subtle.digest("SHA-256", bytes));
}
/* The hash of the bytes a release uploads: a repository release carries the one it was verified against; the built-in
   release's is taken from its Blob once, and kept on the release. */
async function releaseSha(release) {
  return (release.sha ??= hex(await crypto.subtle.digest("SHA-256", await release.blob.arrayBuffer())));
}
/* After a plane upload the account accepted: up to three reads, stopping at the first that matches. Answers null when the
   bytes are the release's, else the lag to name (R15's list: no success is claimed while it stands). */
async function readBack(token, acct, slug, release) {
  const want = await releaseSha(release);
  let got = null;
  for (let i = 0; i < 3; i++) {
    got = await scriptHash(token, acct, slug);
    if (got === want) return null;
    if (i < 2) await new Promise((res) => setTimeout(res, 1500));
  }
  return got === null
    ? `the software your Cloudflare account holds for your team's Civicsmith could not be read back, so it is not confirmed to be the ${release.version} release's own bytes`
    : `the software your Cloudflare account holds for your team's Civicsmith is not the ${release.version} release's own bytes (read back, it hashes to ${got.slice(0, 16)}…; the release hashes to ${want.slice(0, 16)}…)`;
}

/* `source` is the module as text, or already a Blob (a repository release, R33: made once, shared by every upload). */
function uploadForm(meta, source) {
  const fd = new FormData();
  fd.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
  fd.append("index.mjs", source instanceof Blob ? source : new Blob([source], { type: "application/javascript+module" }), "index.mjs");
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
/* R64: the binding's TARGET is the member's Worker under the copy's own names (`names.member`), its NAME the plane's own. */
const memberBindings = (members = [], names) => [...BINDING_OF]
  .filter(([member]) => members.includes(member))
  .map(([member, name]) => ({ type: "service", name, service: names.member(member) }));

/* Which bindable members this account already holds. A lookup that fails for any reason other than "not found" is
   read as NOT PRESENT for this PUT — binding a worker whose existence is unestablished is the refusal above — and
   step 3 binds whatever step 2 then uploads. */
async function membersPresent(token, acct, names) {
  const present = [];
  for (const member of BINDING_OF.keys()) {
    try { if (await scriptExists(token, acct, names.member(member))) present.push(member); }
    catch (e) { if (approve(e)) throw e; /* unestablished: not bound */ }
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

/* R36 (K1502, K1755) — THE INSTALLER BINDS NO CLAUDE CREDENTIAL. The team's Anthropic API key, when the group chooses
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
    const list = s.bindings.filter((b) => b && typeof b.name === "string");
    const map = new Map(list.map((b) => [b.name, b.type]));
    map.list = list;
    return map;
  } catch (e) { if (special(e)) throw e; return null; }
}

/* R37 and R17 (T36; N711, N721; DEC-172) — THE BINDINGS NO INSTALLER WRITES ANY MORE. The install takes no choice about
   the assistant (its two settings are made in your team's Civicsmith at its setup, setup-page R18) and generates no
   shared member key (R9). An update leaves neither behind, as it leaves no INSTANCE_CLAUDE_TOKEN (R36): each held
   before the update is removed, a secret by its own deletion and a plain value by the update's upload (which keeps no
   plain value it does not restate), and a refused deletion is named. `RETIRED_BINDINGS` is every such name, with the
   suffix of the `installer.keys.retired.*` key that says what it was. */
export const ASSISTANT_BINDING = "ASSISTANT_ENABLED";
export const MEMBER_BINDING = "MEMBER_TOKEN";
export const RETIRED_BINDINGS = Object.freeze([
  [RETIRED_CLAUDE_BINDING, "claude"],
  [MEMBER_BINDING, "member"],
  [ASSISTANT_BINDING, "assistant"],
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
/* `source` is the module as text, or as bytes (a release's verified download, which is never decoded to text: R33); the
   statements are found the same way in both. */
const QUOTES = new Set([34, 39, 96]);                      /* " ' ` */
const STATEMENT_STOP = new Set([34, 39, 96, 92, 10]);      /* a quote, a backslash, a newline end a statement's text */
function statementsInBytes(bytes, tag) {
  const pat = ascii(tag), bodies = new Set();
  for (let i = find(bytes, pat); i !== -1; i = find(bytes, pat, i + 1)) {
    const q = i > 0 ? bytes[i - 1] : -1, from = i + pat.length;
    if (!QUOTES.has(q) || bytes[from] !== 32) continue;
    let k = from;
    while (k < bytes.length && !STATEMENT_STOP.has(bytes[k])) k++;
    if (bytes[k] === q) bodies.add(new TextDecoder().decode(bytes.subarray(from, k)));
  }
  return bodies;
}
function statedLimits(source, tag) {
  const isBytes = source instanceof Uint8Array;
  if (typeof source !== "string" && !isBytes) return { ok: false, why: "none" };
  let bodies = new Set();
  if (isBytes) bodies = statementsInBytes(source, tag);
  else {
    const re = new RegExp("([\"'`])" + tag.replace("/", "\\/") + "( [^\"'`\\\\\\n]*)\\1", "g");
    for (const m of source.matchAll(re)) bodies.add(m[2]);
  }
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
const LIMITS_NOT_STATED = { none: "states no limits for your team's Civicsmith to run under",
  unreadable: "states the limits your team's Civicsmith runs under unreadably" };

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
  if (mode === "update") return word("installer.profiles.refused.update");
  if (!Array.isArray(v)) return word("installer.profiles.refused.notalist");
  const bad = v.filter((id) => typeof id !== "string" || !HELD_CHOICES.has(id));
  if (bad.length) return word("installer.profiles.refused.unknown", { list: bad.map((x) => JSON.stringify(x)).join(", ") });
  if (new Set(v).size !== v.length) return word("installer.profiles.refused.twice");
  return null;
}

/* `opts.noSelf` exists for ONE reason: an install PUT names a service binding to
   the script the same PUT creates, and nothing here can prove Cloudflare accepts
   that self-reference without a real install, which is deploy-gated. So the
   install degrades rather than failing — see the retry in runInstall. */
async function uploadInstall(token, acct, slug, secrets, release, opts = {}) {
  const names = opts.names;
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
      { type: "r2_bucket", name: "CAPTURES", bucket_name: names.captures },
      { type: "r2_bucket", name: "PUBLISHED", bucket_name: names.published },
      ...(opts.noSelf ? [] : [selfBinding(slug)]),
      /* DIST-11 (IC-252): the Browser Rendering binding D-64's render arm looks for. On every Workers tier, so an
         install is never refused over it; the plane reports it as a binding whose in-plane driver is not built. */
      BROWSER_BINDING,
      /* DIST-6: the members this account already holds (none on a fresh account — see BINDING_OF). */
      ...memberBindings(opts.members, names),
    ],
    /* SQLite backend is the irreversible choice, made correctly, once. */
    migrations: { new_tag: "v1", new_sqlite_classes: ["Store"] },
  };
  return cf(token, `/accounts/${acct}/workers/scripts/${slug}`,
    { method: "PUT", body: uploadForm(meta, release.blob) });
}

/* The update path. No fork, no CI/CD: the wizard re-uploads the current
   release into the existing script. keep_bindings preserves the instance's
   secrets, its Durable Object, and its buckets exactly as they are; VERSION
   is supplied fresh. No migrations field, because the Store class already
   exists and its storage backend never changes. Updates therefore cannot
   touch passwords or the record, and the success page says so. */
async function uploadUpdate(token, acct, slug, withR2, release, opts = {}) {
  const names = opts.names;
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
        { type: "r2_bucket", name: "CAPTURES", bucket_name: names.captures },
        { type: "r2_bucket", name: "PUBLISHED", bucket_name: names.published },
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
      ...memberBindings(opts.members, names),
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
      /* R69: a run that resumes an install it did not finish cannot know the credentials the earlier run generated (they are
         never readable), so it states the ones it has just generated; they replace the kept ones of the same name. */
      ...(opts.secrets ? [
        { type: "secret_text", name: "ADMIN_TOKEN", text: opts.secrets.boot },
        { type: "secret_text", name: "PROBE_TOKEN", text: opts.secrets.probe },
        { type: "secret_text", name: SEAL_BINDING, text: opts.secrets.seal },
      ] : []),
      { type: "secret_text", name: "DAEMON_TOKEN", text: opts.daemon || opts.secrets?.daemon || rand(32) },
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
    { method: "PUT", body: uploadForm(meta, release.blob) });
}


/* ---------------------------------------------------- the fleet (IC-82/D-297) */

/* A part's module type maps to the upload content type. COPY-NEVER-DEFAULT on
   the verifier side too: a type this map does not know refuses that member by
   name rather than guessing — an inferred loader is the 3607b5c defect
   arriving inside a team's account. */
const PART_MIME = { CompiledWasm: "application/wasm", Data: "application/octet-stream",
                    Text: "text/plain", ESModule: "application/javascript+module" };

/* R71 (F5): the software source (the public release repository) is waited on like Cloudflare's API: a slow or unavailable
   answer (5xx, rate limit, no answer) is retried within the bound and then ends the run with `screen.install.stopped.source`,
   BEFORE anything is created; an answer that is not transient (not found, bytes that fail their hash) is the member's own
   refusal, as before. `onWait` draws the wait. */
export class SourceUnavailable extends Error {
  constructor(what, cause) { super(`${what}: ${cause.message}`); this.source = true; this.cause = cause; }
}
async function fetchVerified(url, wantSha, what, onWait = null) {
  let bytes;
  try {
    bytes = await patiently(async () => {
      let r;
      try { r = await fetch(url, { redirect: "follow", headers: relHeaders }); }
      catch (e) { throw Object.assign(new Error(what + " " + String(e && e.message || e)), { network: true }); }
      if (!r.ok) throw Object.assign(new Error(what + " http " + r.status), { status: r.status });
      return new Uint8Array(await r.arrayBuffer());
    }, { onWait });
  } catch (e) { if (e && e.lasting) throw new SourceUnavailable(what, e); throw e; }
  const got = hex(await crypto.subtle.digest("SHA-256", bytes));
  if (got !== wantSha) throw new Error(what + " failed its integrity check");
  return bytes;
}

/* R59 (T50; N1162; K3704; `agent-worker` R91, R109 and its configuration): the Durable Objects agent-worker holds of its own,
   bound and migrated by the install and the update: `SEGMENTS` (class `SegmentDriver`, migration `v1`), so a run's segment
   outlives the request that started it, and `CHECKS` (class `CheckRecord`, migration `v2`), the member's check record. The
   migrations are the member's own configuration's, in its order, each a tag with the class it creates. */
export const MEMBER_OBJECTS = Object.freeze({
  "agent-worker": Object.freeze({
    bindings: Object.freeze([{ name: "SEGMENTS", class_name: "SegmentDriver" }, { name: "CHECKS", class_name: "CheckRecord" }]),
    migrations: Object.freeze([{ tag: "v1", classes: ["SegmentDriver"] }, { tag: "v2", classes: ["CheckRecord"] }]),
  }),
});
/* The migration a member's upload carries, given the tag the script holds now (null: it holds none): every step after that
   tag, in order, in one `steps` list ending at the last tag; nothing when it already holds the last. */
export function objectMigrations(member, heldTag) {
  const o = MEMBER_OBJECTS[member];
  if (!o) return null;
  const at = heldTag ? o.migrations.findIndex((x) => x.tag === heldTag) : -1;
  const rest = o.migrations.slice(at + 1);
  if (!rest.length) return null;
  return { ...(heldTag ? { old_tag: heldTag } : {}), new_tag: rest.at(-1).tag, steps: rest.map((x) => ({ new_sqlite_classes: [...x.classes] })) };
}
const objectBindings = (member) => (MEMBER_OBJECTS[member]?.bindings || []).map((b) => ({ type: "durable_object_namespace", name: b.name, class_name: b.class_name }));

async function uploadMember(token, acct, slug, m, version, bundle, partBytes, extra = {}) {
  const names = extra.names;
  /* R59: the member's own Durable Objects (agent-worker), migrated from the tag the script holds. */
  const held = extra.heldTag ?? null;
  const migrations = extra.migrations ?? objectMigrations(m.member, held);
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
         over the network; it is the name the group chose. R64: another member is the Worker under this copy's names. */
      ...(m.services || []).map((sv) => ({ type: "service", name: sv.binding,
        service: sv.service === "bio-plane" ? slug : (extra.fleet && extra.fleet.has(sv.service) ? names.member(sv.service) : sv.service) })),
      /* R59 (agent-worker's own objects). */
      ...objectBindings(m.member),
      /* R38: a container member's Durable Object class, bound cross-script into each member its descriptor names. */
      ...(extra.bindings || []),
    ],
    /* R38: a container member's class is created by its first upload's migration, and never restated after it. */
    ...(extra.migrations ? { migrations: extra.migrations } : migrations ? { migrations } : {}),
  };
  const fd = new FormData();
  fd.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
  fd.append("index.mjs", new Blob([bundle], { type: "application/javascript+module" }), "index.mjs");
  /* A container or Worker descriptor is read here, never uploaded as a module. */
  for (const p of (m.parts || []).filter((pp) => !DESCRIPTOR_PARTS.has(pp.type))) {
    fd.append(p.path, new Blob([partBytes[p.path]], { type: PART_MIME[p.type] }), p.path);
  }
  return cf(token, `/accounts/${acct}/workers/scripts/${names.member(m.member)}`, { method: "PUT", body: fd });
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
 * is on Workers Paid (R6), and every descriptor names an image the default scheduling policy can pull, pinned by digest
 * (images.mjs; T46: one it cannot pull is named "not yet published where your Cloudflare account can pull it"). Then:
 * the Worker is uploaded (with its classes' migration when the script is new, and bound to each class it reaches
 * itself), the Containers application of each class is created for that class's namespace with its image, or, when it
 * exists, rolled out to the image; and each other member a descriptor names is uploaded with a cross-script binding to
 * the class. Any condition failing leaves the member out, named with what the copy then lacks (images.mjs, CONTAINER_LACKS): the
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
/* R57: what a container member left out then lacks, said after its reason; nothing for a member the assistant does not need. */
const withLacks = (m, why) => { const l = containerPartsOf(m).length ? lacksOf(m.member) : ""; return l ? `${why}; ${l}` : why; };
const CLASS_NAME = /^[A-Za-z_$][A-Za-z0-9_$]{0,63}$/;
const BINDING_NAME = /^[A-Z][A-Z0-9_]{0,63}$/;
const INSTANCE_TYPE = /^[a-z][a-z0-9-]{0,31}$/;
const CLASS_PATH = /^container\/([A-Za-z_$][A-Za-z0-9_$]{0,63})\.json$/;

/* The descriptor, read and checked; `{ok: true, d}` or `{ok: false, why}` in words. */
export function containerDescriptor(bytes) {
  let d;
  try { d = JSON.parse(new TextDecoder().decode(bytes)); } catch { return { ok: false, why: "its container description does not parse" }; }
  if (!d || typeof d !== "object" || Array.isArray(d)) return { ok: false, why: "its container description is not an object" };
  if (typeof d.class_name !== "string" || !CLASS_NAME.test(d.class_name)) return { ok: false, why: "its container description names no class" };
  /* R38 (T46): an image the account cannot pull, or one not pinned by digest, is said in words a group can read. */
  const imageNot = imageWhy(d.image);
  if (imageNot) return { ok: false, why: imageNot };
  if (d.scheduling_policy !== "default") return { ok: false, why: "its scheduling policy is not the default one" };
  if (!Number.isInteger(d.max_instances) || d.max_instances < 1 || d.max_instances > 1000)
    return { ok: false, why: "its container description states no maximum number of instances" };
  /* R60 (T50; N1170; `bundler` R33): the size the member's configuration declares, passed on as stated; none stated, none sent. */
  if (d.instance_type !== undefined && (typeof d.instance_type !== "string" || !INSTANCE_TYPE.test(d.instance_type)))
    return { ok: false, why: "its container description states its size unreadably" };
  const bind = d.bind === undefined ? [] : d.bind;
  if (!Array.isArray(bind) || !bind.every((b) => b && typeof b.member === "string" && b.member
      && typeof b.binding === "string" && BINDING_NAME.test(b.binding)))
    return { ok: false, why: "its container description names its bindings unreadably" };
  return { ok: true, d: { class_name: d.class_name, image: d.image, max_instances: d.max_instances, bind,
    ...(d.instance_type === undefined ? {} : { instance_type: d.instance_type }) } };
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

/* The Containers application for one class's namespace, created with the image, or rolled out to it. The application is named
   under the copy's own names (R64: a member with one class by the member and the slug, with several by member, class and slug).
   R60: the size the descriptor states is passed per class, to the create call and to a rollout. R68 (S11): the image the
   platform then holds for the application is read back and compared with the digest the release names; where it is another
   (a rollout answered "no changes" and kept the old one), one further rollout is asked, and an image still another is
   returned as a lag, never success. Answers `{action, lag}`, `lag` null when the image deployed is the release's. */
async function placeContainer(token, acct, m, d, appName, names) {
  const spaces = await cf(token, `/accounts/${acct}/workers/durable_objects/namespaces?per_page=1000`);
  const script = names.member(m.member);
  const ns = (Array.isArray(spaces) ? spaces : []).find((n) => n && n.script === script && n.class === d.class_name);
  if (!ns || !ns.id) throw new Error("its Durable Object class " + d.class_name + " was not found after the upload");
  const apps = await cf(token, `/accounts/${acct}/containers/applications`);
  const app = (Array.isArray(apps) ? apps : []).find((a) => a && a.name === appName);
  const config = { image: d.image, ...(d.instance_type ? { instance_type: d.instance_type } : {}) };
  const rollout = (id) => cf(token, `/accounts/${acct}/containers/applications/${id}/rollouts`, { method: "POST", body: JSON.stringify({
    description: "Civicsmith installer: " + appName, strategy: "rolling", kind: "full_auto", step_percentage: 100,
    target_configuration: config }) });
  const deployed = async (id) => { try { return (await cf(token, `/accounts/${acct}/containers/applications/${id}`))?.configuration?.image ?? null; }
    catch (e) { if (special(e)) throw e; return null; } };
  let id, action;
  if (!app) {
    const made = await cf(token, `/accounts/${acct}/containers/applications`, { method: "POST", body: JSON.stringify({
      name: appName, scheduling_policy: "default", instances: 0, max_instances: d.max_instances,
      configuration: config, durable_objects: { namespace_id: ns.id } }) });
    id = made && made.id; action = "created";
  } else { id = app.id; await rollout(id); action = "rolled out"; }
  if (!id) return { action, lag: null };
  let got = await deployed(id);
  if (got !== d.image && action === "rolled out") { await rollout(id); got = await deployed(id); }
  const short = (x) => (x ? x.slice(x.indexOf("@") + 1, x.indexOf("@") + 20) + "…" : "no image");
  return { action, lag: got === d.image ? null
    : `the container ${appName} of your team's Civicsmith still runs ${got ? "another image (" + short(got) + ")" : "an image that could not be read"}, not the one this release names (${short(d.image)})` };
}

/* R44: a member's scheduled triggers, set exactly as its `Worker` part states them. */
async function setSchedules(token, acct, script, crons) {
  return cf(token, `/accounts/${acct}/workers/scripts/${script}/schedules`,
    { method: "PUT", body: JSON.stringify(crons.map((cron) => ({ cron }))) });
}

/* R61, R71 — THE FLEET OF THE RELEASE R8 CHOSE, VERIFIED AND FETCHED IN FULL BEFORE ANYTHING IS CREATED.
 *
 * Every part comes from ONE release's own signed fleet statement: the plane just chosen, and the statement its own manifest
 * carries (the built-in release carries its own, embedded with it and signed with it: `RELEASE_MANIFEST`), never the plane of
 * one release paired with the statement of another (S3). The statement is rebuilt from the manifest and verified in the fleet
 * namespace, its plane must be the plane this act installs and its version this release's, and each member's bundle and
 * parts are fetched and hashed against it. A source that is slow or down is waited on and then named (`SourceUnavailable`,
 * F5): the caller stops with nothing created. What cannot be loaded for one member leaves that member out, named (R11).
 * Answers `{skip}` (a sentence saying why no member is installed this time) or `{members, fleet}`. */
async function loadFleet(release, onWait = null) {
  const man = release.man;
  if (!man) return { skip: "The public repository was not reachable, so no capability workers were "
    + "installed this time. Your team's Civicsmith works without them; the next update adds them." };
  if (!Array.isArray(man.fleet) || man.fleet.length === 0 || !man.fleetSig) return { skip: "This release names no capability workers, so there was nothing further "
    + "to install. Said explicitly rather than assumed: absence of members in the manifest "
    + "is a fact about the release, not about your team's Civicsmith." };
  if (!ARMED_SIGNERS.length) return { skip: "This installer carries no signing key, so the capability workers "
    + "(which install only under a verified fleet signature) were left out. Your team's "
    + "Civicsmith itself installed normally." };
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
    return { skip: "The release names capability workers but its manifest does not state "
      + "how they are uploaded (" + String(e.message).replace(/^REFUSED \[[A-Z_]+\]: /, "")
      + ") — so none were installed. Your team's Civicsmith itself installed normally; a corrected "
      + "release fixes this at the next update." };
  }
  const v = await verifySshsig(man.fleetSig, new TextEncoder().encode(payload), NS_FLEET, ARMED_SIGNERS);
  if (!v.ok) return { skip: "The fleet signature did not verify (" + (v.reason || "invalid") + "), so no "
    + "capability workers were installed. Your team's Civicsmith itself installed normally and is safe." };
  /* The pairing (R61): the signed statement names the plane these members were built against, and it must be the plane
     THIS act just installs, of this release's version. */
  const planeSha = await releaseSha(release);
  if (planeSha !== man.sha256 || String(man.version) !== String(release.version)) return { skip: "The capability workers are signed against a different release of Civicsmith than the one being "
    + "installed, so no capability workers were installed. The next update, fetching both halves together, adds them." };
  /* R38: container members first, because a member bound to a container's class is refused while the class is not there. */
  const fleet = [...man.fleet].sort((a, b) => (containerPartsOf(b).length ? 1 : 0) - (containerPartsOf(a).length ? 1 : 0));
  const base = release.base || CFG.RELEASE_LATEST;
  const members = [];
  for (const m of fleet) {
    try {
      const badType = (m.parts || []).find((pp) => !PART_MIME[pp.type] && !DESCRIPTOR_PARTS.has(pp.type));
      if (badType) throw new Error("part " + badType.path + " has module type '" + badType.type
        + "' this installer does not know — refusing to guess a loader");
      const box = containerPartsOf(m);
      const workerParts = (m.parts || []).filter((pp) => pp.type === WORKER_PART);
      if (workerParts.length > 1) throw new Error("it carries more than one Worker description");
      const bundle = await fetchVerified(base + "/" + m.asset, m.sha256, m.member, onWait);
      /* R39: read from the verified bytes; a statement that cannot be read leaves this member out, named. */
      const stated = memberLimits(bundle);
      if (!stated.ok) throw new Error(stated.why);
      const partBytes = {};
      for (const pp of m.parts || []) {
        partBytes[pp.path] = await fetchVerified(base + "/" + m.member + "/" + pp.path, pp.sha256, m.member + " " + pp.path, onWait);
      }
      /* R44, R45: the member's own buckets, schedule and private-network binding, as its signed `Worker` part states them. */
      let own = { r2_buckets: [], crons: [] };
      if (workerParts.length) {
        const w = workerDescriptor(partBytes[workerParts[0].path]);
        if (!w.ok) throw new Error(w.why);
        own = w.d;
      }
      let classes = null;
      if (box.length) {
        const read = containerClasses(box, (path) => partBytes[path]);
        if (!read.ok) throw new Error(read.why);
        classes = read.classes;
      }
      members.push({ m, box, bundle, limits: stated.limits, partBytes, own, classes, workerPart: workerParts.length > 0 });
    } catch (e) {
      if (e && (e.source || e.approveAgain)) throw e;
      members.push({ m, error: String(e && e.message || e) });
    }
  }
  return { members, fleet: new Set(man.fleet.map((x) => x.member)) };
}

/* Install (or refresh — the PUT is the same act) every member `loadFleet` verified. DEGRADES PER MEMBER, never fails the
   install: a team's plane must not be lost over a member it can add at the next update, and what was left out is SAID
   (D-115's "quietly doing less" is the defect; the cure is the saying, not the refusing). `ctx.vpc`: the Workers VPC service
   the operator named (R45), or none. `ctx.names`: the copy's names (R64). Answers `{done, left, imageLags, completed}`. */
async function installFleet(emit, token, acct, slug, release, loaded, ctx = {}) {
  await emit.step("fleet", "Installing the capability workers beside your team's Civicsmith");
  if (loaded.skip) { emit.ok("fleet", loaded.skip); return; }
  const names = ctx.names;
  const man = release.man;
  const done = [], left = [], notes = [], imageLags = [], completed = [];
  const classOf = new Map();
  let conditions = null, leftover = false, vpcTaken = false;
  const scripts = await listScripts(apiOf(token, acct)).catch((e) => { if (approve(e)) throw e; return new Map(); });
  for (const L of loaded.members) {
    const m = L.m;
    /* R15, R38 (K3793): a container member that never reached its upload (its image not pullable or not pinned, no Containers
       scope, not Workers Paid, a part missing or unreadable) is LEFT OUT, named here with why and what the copy lacks; it is
       not a failed upload and the verdict does not wait on it (`out`). A member whose upload was attempted and failed is. */
    const isContainer = containerPartsOf(m).length > 0;
    if (L.error) { left.push({ member: m.member, why: withLacks(m, L.error), ...(isContainer ? { out: true } : {}) }); continue; }
    let uploaded = false, attempted = false;
    try {
      const { box, bundle, limits, partBytes, own, classes } = L;
      /* Said once the member is installed (a member left out is named with its own reason). */
      const lacking = !L.workerPart && WORKER_PART_LACKS[m.member] ? `${m.member}: ${WORKER_PART_LACKS[m.member]}` : null;
      const ownBindings = own.r2_buckets.map((b) => ({ type: "r2_bucket", name: b.binding, bucket_name: names.role(b.bucket) }));
      const vpcBindings = vpcServiceOk(ctx.vpc) && m.member === VPC_MEMBER ? [{ type: "vpc_service", name: VPC_BINDING, service_id: ctx.vpc }] : [];
      const heldTag = scripts.get(names.member(m.member))?.migration_tag ?? null;
      const send = (extra) => uploadMember(token, acct, slug, m, String(man.version), bundle, partBytes,
        { ...extra, names, fleet: loaded.fleet, heldTag });
      /* R45: a VPC binding refused (the permission may not reach the service, or the id names none) leaves out that
         binding alone, named; the member is uploaded again without it. */
      const upload = async (extra) => {
        const bindings = [...(extra.bindings || []), ...ownBindings];
        if (!vpcBindings.length) return send({ ...extra, bindings });
        try {
          await send({ ...extra, bindings: [...bindings, ...vpcBindings] });
          vpcTaken = true;
          notes.push(`${m.member} is connected to the Workers VPC service you named (${VPC_BINDING})`);
        } catch (e) {
          if (special(e)) throw e;
          await send({ ...extra, bindings });
          vpcTaken = true;
          notes.push(`${m.member} could not be connected to the Workers VPC service you named (Cloudflare said: ${e.message}), so it `
            + "was installed without it, and a security tool reached through a tunnel answers REACH_NOT_BOUND until the updater connects it");
        }
      };
      const schedule = async () => {
        if (!own.crons.length) return;
        try { await setSchedules(token, acct, names.member(m.member), own.crons); }
        catch (e) { if (special(e)) throw e; notes.push(`${m.member} was installed, but its schedule (${own.crons.join("; ")}) could not be set (Cloudflare said: ${e.message}); the next update sets it`); }
      };
      if (scripts.has(names.member(m.member))) completed.push(m.member);
      if (!box.length) {
        attempted = true;
        await upload({ bindings: classOf.get(m.member), limits });
        uploaded = true;
        await schedule();
        done.push(m.member);
        if (lacking) notes.push(lacking);
        continue;
      }
      const multi = box.length > 1;
      /* A class bound into its own member is bound in that member's own upload (no script name); one bound into
         another member is bound cross-script into it, after its class exists. */
      const binds = () => { for (const d of classes) for (const b of d.bind) if (b.member !== m.member)
        classOf.set(b.member, [...(classOf.get(b.member) || []),
          { type: "durable_object_namespace", name: b.binding, class_name: d.class_name, script_name: names.member(m.member) }]); };
      const selfBinds = classes.flatMap((d) => d.bind.filter((b) => b.member === m.member)
        .map((b) => ({ type: "durable_object_namespace", name: b.binding, class_name: d.class_name })));
      const fresh = !scripts.has(names.member(m.member));
      conditions ??= await containerConditions(token, acct, ctx);
      leftover = !!conditions.leftover;
      if (!conditions.ok) {
        /* Left out this time; a container an earlier act installed keeps serving, so its bindings are restated (a
           member re-uploaded without one would lose it). */
        if (!fresh) binds();
        throw new Error(conditions.why);
      }
      attempted = true;
      await upload({ limits, bindings: [...(classOf.get(m.member) || []), ...selfBinds],
        ...(fresh ? { migrations: { new_tag: "v1", new_sqlite_classes: classes.map((d) => d.class_name) } } : {}) });
      uploaded = true;
      for (const d of classes) {
        const placed = await placeContainer(token, acct, m, d, names.app(m.member, d.class_name, multi), names);
        if (placed.lag) imageLags.push(placed.lag);
      }
      await schedule();
      binds();
      done.push(m.member);
      if (lacking) notes.push(lacking);
    } catch (e) {
      if (special(e)) throw e;
      left.push({ member: m.member, why: withLacks(m, String(e && e.message || e)), ...(isContainer && !attempted ? { out: true } : {}) });
    }
  }
  /* R45: a VPC service named that no member installed here takes is said, never dropped in silence. */
  if (vpcServiceOk(ctx.vpc) && !vpcTaken)
    notes.push(`the Workers VPC service you named was not connected: ${VPC_MEMBER} was not installed this time, so a tool reached `
      + "through a tunnel answers REACH_NOT_BOUND in your team's Civicsmith until the updater connects it");
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
      + ". Your team's Civicsmith works without them; the next update retries exactly this step." + noteText + probeNote);
  }
  /* D-116: WHICH members this act uploaded, so the verify step can require each of them to answer THROUGH the plane's
     binding. Every early return above uploads nothing and returns undefined, which the caller reads as none. */
  return { done, left, imageLags, completed };
}

/* DIST-6, step 3 of the order at BINDING_OF: RE-PUT the plane bound to every bindable member now present — those
   bound at step 1 and those `installFleet` just uploaded. The re-PUT takes the UPDATE's shape on both paths (no
   `migrations`, the team's passwords and the Durable Object kept by `keep_bindings`), because that is the shape
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
  await emit.step("bind", added.length ? "Connecting your team's Civicsmith to its capability workers"
    : "Telling your team's Civicsmith its own address");
  try {
    await uploadUpdate(token, acct, slug, opts.withR2, release,
      { members: want, daemon: opts.daemon, noSelf: opts.noSelf, profiles: opts.profiles, ownHosts: opts.ownHosts, names: opts.names });
    emit.ok("bind", [added.length ? "Your team's Civicsmith is connected to " + added.join(", ") + "." : "",
      hosts ? "Your team's Civicsmith now knows its own address (" + hosts.join(", ") + "), which it reads as its own." : ""]
      .filter(Boolean).join(" "));
    return { bound: want, unbound: [], put: true, hosts: !!hosts };
  } catch (e) {
    emit.no("bind", [added.length ? "The capability workers were installed, but connecting your team's Civicsmith to them was refused ("
      + added.join(", ") + "). Your team's Civicsmith works without them; running the updater connects them." : "",
      hosts ? "Telling your team's Civicsmith its own address was refused, so it does not know it yet; running the updater tells it." : "",
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
/* R66 (S5, S8): a new address takes a while to wake, so the check waits for it within the stated bound, drawing the wait,
   and never reports a not-yet-ready address as failed before the bound has passed. The wait is counted in nominal seconds. */
const WAKE_EVERY_S = 3;
async function verifyInstall(base, probe, onWait = null) {
  const bound = WAIT_BOUND_MINUTES * 60;
  for (let waited = 0; ; waited += WAKE_EVERY_S) {
    try {
      const r = await fetch(`${base}/api/?op=selftest`, { headers: { authorization: "Bearer " + probe } });
      const j = await r.json();
      if (j.ok === true && j.bindings?.STORE === true) return j;
    } catch {}
    if (waited >= bound) return null;
    if (onWait && waited % 30 === 0) await onWait(waited === 0 ? 0 : 1, bound);
    await sleep(WAKE_EVERY_S * 1000);
  }
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
const WORD_BYTE = (b) => (b >= 48 && b <= 57) || (b >= 65 && b <= 90) || b === 95 || (b >= 97 && b <= 122);
const hasWord = (bytes, word) => {
  const pat = ascii(word);
  for (let i = find(bytes, pat); i !== -1; i = find(bytes, pat, i + 1))
    if (!(i > 0 && WORD_BYTE(bytes[i - 1])) && !(i + pat.length < bytes.length && WORD_BYTE(bytes[i + pat.length]))) return true;
  return false;
};
export function reportsBuilds(source) {
  if (source instanceof Uint8Array) return BUILD_FIELDS.every((f) => hasWord(source, f));
  return typeof source === "string" && BUILD_FIELDS.every((f) => new RegExp("\\b" + f + "\\b").test(source));
}

/* DIST-6: `failed` is the members the fleet step could NOT upload ({member, why}). A member the plane binds whose upload
   failed is named here whatever the plane answers, because the plane's own reading of it (UNBOUND, or a previous
   build) cannot say that THIS act tried and failed — and on a release that cannot report members it is the only
   place the failure reaches the verdict. A member the plane does not bind is named at the fleet step and not here. A member
   R38 left out (`out`: its upload was never attempted) is named at the fleet step, never a lag here (R15; K3793). */
const failedLags = (failed = []) => failed.filter((l) => l && !l.out && BINDING_OF.has(l.member))
  .map((l) => `the capability worker ${l.member} could not be installed, so your team's Civicsmith has no ${BINDING_OF.get(l.member)}`
    + ` connection to use (${l.why})`);

function servingVerdict(j, want, installed, capable, failed = []) {
  const lags = [];
  if (!j || typeof j !== "object") {
    lags.push("the address of your team's Civicsmith did not answer", ...failedLags(failed));
    return { confirmed: false, lags, capable };
  }
  if (j.version !== want) lags.push(`the address of your team's Civicsmith answers ${j.version ? j.version : "with no version"}`);
  lags.push(...failedLags(failed));
  if (!capable) return { confirmed: lags.length === 0, lags, capable };
  if (!("storeVersion" in j)) lags.push("the record store of your team's Civicsmith has not reported its version, so it is still running a release from before this one");
  else if (j.storeVersion === null) lags.push("the record store of your team's Civicsmith cannot say which version it runs");
  else if (j.storeVersion !== want) lags.push(`the record store of your team's Civicsmith still runs ${j.storeVersion}`);
  const mv = j.memberVersions;
  if (!mv || typeof mv !== "object") {
    lags.push("your team's Civicsmith did not report its capability workers");
  } else {
    for (const [name, st] of Object.entries(mv)) {
      const s = st && st.state;
      if (s === "SERVING" && st.version !== want) lags.push(`the capability worker ${name} still runs ${st.version}`);
      else if (s === "MISNAMED") lags.push(`the connection of your team's Civicsmith to ${name} reaches a different worker (${st.name || "unnamed"})`);
      else if (s === "SILENT") lags.push(`your team's Civicsmith cannot get an answer from the capability worker ${name}`
        + (installed.includes(name) ? ", which this step installed" : ""));
      else if (s === "UNBOUND" && installed.includes(name))
        lags.push(`the capability worker ${name} was installed, but your team's Civicsmith holds no connection to it, so it cannot use it`);
    }
    for (const name of installed)
      if (!(name in mv)) lags.push(`the capability worker ${name} was installed, but your team's Civicsmith does not know it`);
  }
  return { confirmed: lags.length === 0, lags, capable };
}

async function verifyServing(base, want, installed, capable, failed = [], onWait = null) {
  const bound = WAIT_BOUND_MINUTES * 60, every = 2.5;
  let last = null;
  for (let waited = 0; ; waited += every) {
    let j = null;
    try { j = await (await fetch(`${base}/api/?op=bootstrap&members=1`)).json(); } catch {}
    last = servingVerdict(j, want, installed, capable, failed);
    if (last.confirmed || waited >= bound) return last;
    if (onWait && waited % 30 === 0) await onWait(waited === 0 ? 0 : 1, bound);
    await sleep(every * 1000);
  }
}

/* R67 (S9): the new version has to answer at all. Waits within the stated bound; answers the reply or null. */
async function waitForAnswer(base, onWait = null) {
  const bound = WAIT_BOUND_MINUTES * 60, every = 2.5;
  for (let waited = 0; ; waited += every) {
    try { const r = await fetch(`${base}/api/?op=bootstrap`); if (r.ok) { const j = await r.json(); if (j && typeof j === "object") return j; } } catch {}
    if (waited >= bound) return null;
    if (onWait && waited % 30 === 0) await onWait(waited === 0 ? 0 : 1, bound);
    await sleep(every * 1000);
  }
}
/* The version a Worker runs now, as its deployments list names it (newest first), or null when that cannot be read. */
async function currentDeployment(token, acct, slug) {
  try {
    const r = await cf(token, `/accounts/${acct}/workers/scripts/${slug}/deployments`);
    const list = Array.isArray(r) ? r : Array.isArray(r?.deployments) ? r.deployments : [];
    return list[0]?.versions?.[0]?.version_id ?? null;
  } catch (e) { if (approve(e)) throw e; return null; }
}
/* Puts that version back, at 100%. true when Cloudflare accepted it. */
async function rollBack(token, acct, slug, versionId) {
  try {
    await cf(token, `/accounts/${acct}/workers/scripts/${slug}/deployments`, { method: "POST", idem: true,
      body: JSON.stringify({ strategy: "percentage", versions: [{ percentage: 100, version_id: versionId }] }) });
    return true;
  } catch (e) { if (approve(e)) throw e; return false; }
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
  + `keeps a record of each request to your team's Civicsmith (its dataset is ${PER_REQUEST_DATASET}, and its filter does not leave out `
  + `${names.join(", ")}), which would be a log of who opened which file: delete it, or give it a filter that leaves those Workers out`;
/* The step itself: listed, said, and its named jobs returned as lags for the verdict (R15's rule: no success over one). */
async function logsStep(emit, token, acct, names) {
  await emit.step("logs", "Checking that no log on your account records who opened which file");
  const r = await logpushCheck(token, acct, names);
  if (r.state === "clear") {
    emit.ok("logs", "No Logpush job on your Cloudflare account keeps a record of each request to your team's Civicsmith.");
    return { lags: [], state: r.state };
  }
  if (r.state === "undetermined") {
    emit.no("logs", "Undetermined: the installer could not read your account's Logpush jobs (Cloudflare said: " + r.why + "), so it cannot "
      + "say whether one keeps a record of each request to your team's Civicsmith, which would be a log of who opened which file. "
      + "To check it yourself: in the Cloudflare dashboard, open Analytics & Logs, then Logpush, and look for a job over "
      + "Workers Trace Events; none should cover " + names.join(", ") + ".");
    return { lags: [], state: r.state };
  }
  const lags = r.jobs.map((j) => logLag(j, names));
  emit.no("logs", (lags.length === 1 ? "A Logpush job on your Cloudflare account" : lags.length + " Logpush jobs on your Cloudflare account")
    + " would keep a log of who opened which file: " + lags.join("; ") + ".");
  return { lags, state: r.state };
}

const lagList = (v) => `<ul>${v.lags.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`;
const UNDETERMINED_BUILDS = word("installer.verify.undetermined");

/* -------------------------------------------------------- the progress page
   The callback streams HTML: the shell renders immediately, then each
   provisioning step lands as a small script as it starts and as it ends. Live progress
   with the token never leaving this Worker, and nothing to poll.

   R51 (DEC-201 (4)): one plain line per step, drawn as it starts and redrawn as it ends (`cs-row`, its state in a word
   beside it). A stop (R75) is one sentence by key, which says the cause, what was or was not changed ("nothing was
   created", R4; the copy keeps running as it was, R52) and what to do; the step it stopped at (the line in progress,
   carried as `fail`'s third argument) is named beside it. The shell holds exactly one script, before every streamed one. */

const STATE_WORD = Object.freeze({ go: word("installer.state.go"), ok: word("installer.state.ok"), no: word("installer.state.no") });
function progressShell(title, slug, retry = null) {
  return `${pageHead(title, { noindex: true })}
<body class="cs"><main class="cs-frame ng">
${pageMark()}
<h1>${esc(title)}</h1>
<p class="small">${around(word("installer.progress.forteam", { name: SLOT }), `<b class="mono" id="group">${esc(slug)}</b>`)}</p>
<p class="small" id="says" hidden></p>
<div id="log" class="cs-sheet ng-log"></div>
<p class="small" id="waiting" role="status" hidden></p>
<div id="fail" class="ng-stop" role="alert" hidden><p id="fail-p"></p><p id="fail-d"></p><p class="small" id="fail-s"></p>${retry
  ? `<div class="ng-acts" id="fail-acts"><a class="cs-btn" data-tone="primary" id="try-again" href="${esc(retry)}">${esc(UPDATE_WORDS.tryAgain)}</a></div>` : ""}</div>
<div id="done" class="ng-stage" hidden></div>
${publisherFooter()}
<script>
const $=s=>document.querySelector(s);const rows={};const W=${JSON.stringify(STATE_WORD)};
function mark(d,r,label){d.dataset.r=r;d.firstChild.textContent=W[r];if(label)d.children[1].textContent=label;}
function step(id,label){const d=document.createElement("div");d.className="cs-row";d.id="r-"+id;
 d.innerHTML='<span class="mk"></span><span></span><span></span>';mark(d,"go",label);$("#log").appendChild(d);rows[id]=d;}
function says(t){$("#says").textContent=t;$("#says").hidden=false;}
function waiting(t){$("#waiting").textContent=t;$("#waiting").hidden=false;}
function ok(id,label){const d=rows[id];if(d){mark(d,"ok",label);$("#waiting").hidden=true;}}
function no(id,label){const d=rows[id];if(d)mark(d,"no",label);}
function fail(p,d,s){$("#waiting").hidden=true;$("#fail").hidden=false;$("#fail-p").textContent=p;$("#fail-d").textContent=d||"";$("#fail-s").textContent=s||"";}
async function go(body,err){try{const r=await fetch("/begin",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
 const j=await r.json();if(!j.ok){err.textContent=j.error||"";return;}location.href=j.authorize;}catch(e){err.textContent=String(e.message||e);}}
const slugify=v=>v.toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40);
function wire(){
 const E=id=>document.getElementById(id);
 document.querySelectorAll("[data-begin]").forEach(b=>b.addEventListener("click",()=>{
  const err=E("begin-err")||b;const body=JSON.parse(b.dataset.begin);
  if(b.dataset.slugFrom){body.slug=slugify(E(b.dataset.slugFrom).value);const d=E("alongside-dialog");
   if(body.slug.length<3){err.textContent="";return;}
   if(d){E("alongside-name").textContent=body.slug;d.dataset.body=JSON.stringify(body);d.showModal();return;}}
  if(b.dataset.typedFrom)body.typed=E(b.dataset.typedFrom).value.trim();
  go(body,err);}));
 const y=E("alongside-yes");if(y)y.addEventListener("click",()=>{const d=E("alongside-dialog");d.close();go(JSON.parse(d.dataset.body),E("begin-err"));});
 const n=E("alongside-no");if(n)n.addEventListener("click",()=>E("alongside-dialog").close());
 const t=E("typed"),c=E("confirm-remove");
 if(t&&c){c.disabled=true;t.addEventListener("input",()=>{c.disabled=t.value.trim()!==c.dataset.slug;});}}
function done(html){$("#done").innerHTML=html;$("#done").hidden=false;wire();
 document.querySelectorAll("[data-copy]").forEach(b=>b.addEventListener("click",async()=>{
  await navigator.clipboard.writeText(document.getElementById(b.dataset.copy).textContent);
  const t=b.textContent;b.textContent=${jsLit(word("installer.copy.done"))};setTimeout(()=>b.textContent=t,1400);}));
 const h=$("#handover");if(h)h.addEventListener("click",()=>{location.href=h.dataset.url+"#boot="+encodeURIComponent(document.getElementById("out-boot").textContent);});}
</script>`;
}

/* R19: every value streamed into a <script> is JSON with `<`, `>`, `&` and the two JavaScript line separators escaped,
   so text from the management API (an error message, an account's name) can never close the script element it rides
   in; the page then sets it as text, never as markup. */
const jsLit = (v) => JSON.stringify(v).replace(/[<>&\u2028\u2029]/g,
  (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"));
const jsStr = (s) => jsLit(String(s ?? ""));

function streamPage(headers, shell, run, again = null) {
  const { readable, writable } = new TransformStream();
  const w = writable.getWriter();
  const write = (s) => w.write(enc.encode(s));
  /* R51: the line in progress, which a stop names. */
  const lines = new Map();
  let current = null;
  const emit = {
    step: (id, label) => { lines.set(id, label); current = id;
      return write(`<script>step(${jsStr(id)},${jsStr(label)})</script>\n`); },
    ok:   (id, label) => { if (label) lines.set(id, label);
      return write(`<script>ok(${jsStr(id)}${label ? "," + jsStr(label) : ""})</script>\n`); },
    no:   (id, label) => { if (label) lines.set(id, label);
      return write(`<script>no(${jsStr(id)}${label ? "," + jsStr(label) : ""})</script>\n`); },
    /* `at`: the step a stop names when it is not the line in progress (a stop said after later lines were drawn). */
    fail: (said, d = "", at = current) => write(`<script>no();fail(${jsStr(said)},${jsStr(d)},${jsStr(at && lines.get(at) ? word("installer.stopped.at", { step: lines.get(at) }) : "")})</script>\n`),
    says: (text)      => write(`<script>says(${jsStr(text)})</script>\n`),
    /* R66: the line drawn while a wait on Cloudflare or the address goes on. */
    wait: (text)      => write(`<script>waiting(${jsStr(text)})</script>\n`),
    done: (inner)     => write(`<script>done(${jsLit(inner)})</script>\n`),
  };
  (async () => {
    await write(shell);
    try { await run(emit); }
    catch (e) {
      /* R71 (F6): a permission that expired or was revoked asks for approval again, and the run continues from where it
         stopped (R69). R66: what waiting did not mend is a lasting failure, named, with one action. */
      if (e && e.approveAgain && again) {
        await emit.fail(word("screen.install.approveagain"));
        await emit.done(approvePanel(again));
      } else if (e && e.lasting) {
        await emit.fail(word("screen.install.stopped.lasting"), word("screen.install.stopped.lasting.do"));
      } else if (e && e.source) {
        await emit.fail(word("screen.install.stopped.source"), word("screen.install.stopped.source.do"));
      } else
      await emit.fail(word("installer.stopped.unexpected", { said: String(e && e.message || e) }));
    }
    await write("</body></html>");
    await w.close();
  })();
  return new Response(readable, { headers: { "content-type": "text/html; charset=utf-8", ...headers } });
}

/* R71 (F6): the one act of the page that asks for approval again: a new `POST /begin` carrying what the run was, after which
   the run continues from where it stopped. It carries the choices the run held, never a credential. */
function approvePanel(body) {
  const label = body.mode === "update" ? word("act.bootstrap.label.update") : word("act.bootstrap.label.install");
  return `<div class="ng-acts"><button class="cs-btn" data-tone="primary" data-begin="${esc(JSON.stringify(body))}">${esc(label)}</button></div><p class="err" id="begin-err" role="alert"></p>`;
}

/* ---------------------------------------------------------- provisioning */


/* DIST-9: say which way the organisation `ai` credential went — never its value. */
async function instanceAiNotice(emit, mode, carried) {
  await emit.step("ai", word("installer.step.aikey"));
  if (carried) return emit.ok("ai", word("installer.ai.given"));
  emit.ok("ai", mode === "update" ? word("installer.ai.none.update") : word("installer.ai.none.install"));
}

/* K1541, R36 and R17 (T36) on an update: the seal secret added only where none was held, and every retired binding an
   earlier installer left (RETIRED_BINDINGS: a team-wide Claude credential, the shared member key, the assistant choice)
   removed. Each outcome is said; an unread settings page is said as unread, never as "none". */
async function accountSecretsNotice(emit, token, acct, slug, held, seal) {
  await emit.step("keys", word("installer.step.memberkeys"));
  if (!held) return emit.no("keys", word("installer.keys.unread"));
  const said = [seal ? word("installer.keys.sealed.new") : word("installer.keys.sealed.kept")];
  let ok = true;
  for (const [name, kind] of RETIRED_BINDINGS) {
    const type = held.get(name);
    if (!type) continue;
    const what = word(`installer.keys.retired.${kind}`);
    /* A plain value is not kept by the update's upload, which did not restate it: it is gone already. */
    if (type !== "secret_text") { said.push(word("installer.keys.retired.gone", { what })); continue; }
    try {
      await cf(token, `/accounts/${acct}/workers/scripts/${slug}/secrets/${name}`, { method: "DELETE" });
      said.push(word("installer.keys.retired.removed", { what }));
    } catch (e) {
      ok = false;
      said.push(word("installer.keys.retired.refused", { what, said: e.message, name }));
    }
  }
  said.push(ASSISTANT_OWN_ACCOUNTS);
  return ok ? emit.ok("keys", said.join(" ")) : emit.no("keys", said.join(" "));
}

/* R37 (T36; N721, DEC-172; K1957): the installer takes no choice about the assistant and binds no Claude credential
   (R36); the page says where its two settings are made, in the install page's own words (ui.mjs, ASSISTANT_OFFER). */
export const ASSISTANT_OWN_ACCOUNTS = ASSISTANT_OFFER.replace(/\s+/g, " ").trim();
async function assistantNotice(emit) {
  await emit.step("assist", word("installer.step.assistant"));
  emit.ok("assist", ASSISTANT_OWN_ACCOUNTS);
}

/* ----------------------------------------------------------- what is missing is found first (R70; F2, F3, F7) */

/* F3: the account limits the install could run into, with the number of each the install needs. The ceilings are Cloudflare's
   published defaults for a Workers Paid account; they are stated here once, with what the install needs of each. */
const ACCOUNT_LIMITS = Object.freeze({
  workers: { ceiling: 500, need: 1 + RELEASE_MANIFEST.fleet.length + 2 },
  classes: { ceiling: 500, need: 1 + 2 + RELEASE_CONTAINERS.length },
  buckets: { ceiling: 1000, need: 2 },
  containers: { ceiling: 100, need: RELEASE_CONTAINERS.length },
});
async function limitReached(api) {
  const [scripts, spaces, buckets, apps] = await Promise.all([listScripts(api), listNamespaces(api), listBuckets(api), listApps(api).catch((e) => { if (special(e)) throw e; return []; })]);
  const have = { workers: scripts.size, classes: spaces.length, buckets: buckets.length, containers: apps.length };
  for (const [k, l] of Object.entries(ACCOUNT_LIMITS)) if (have[k] + l.need > l.ceiling) return word(`installer.limit.${k}.${l.ceiling === 1 ? "one" : "other"}`, { n: l.ceiling });
  return null;
}
/* F2: whether Containers are turned on for the account. The platform answers a list of applications when they are, and a
   refusal naming the setting when they are not; any other refusal is not read as "off". */
const CONTAINERS_OFF = /(containers?\b.*\b(not|isn'?t|aren'?t)\b.*\benabled|\benable\b.*\bcontainers?|containers?\b.*\bdisabled)/i;
async function containersOn(api) {
  try { await api("/containers/applications"); return true; }
  catch (e) { if (special(e)) throw e; return !CONTAINERS_OFF.test(e.message || ""); }
}

/* The release version an update from the "already holds a copy" page installs: the repository's newest when it is newer than
   the built-in, else the built-in (the update itself verifies it, R55). */
async function newestVersion() {
  try { const man = await patiently(async () => { const r = await fetch(CFG.RELEASE_LATEST + "/RELEASE.json", { redirect: "follow", headers: relHeaders });
      if (!r.ok) throw Object.assign(new Error("manifest http " + r.status), { status: r.status }); return r.json(); }, { minutes: 0.2 });
    if (man && versionOk(String(man.version)) && vcmp(man.version, RELEASE_VERSION) > 0) return String(man.version);
  } catch { /* the built-in stands */ }
  return RELEASE_VERSION;
}
const memberNamesOf = (release) => [...new Set([...BINDING_OF.keys(), ...RELEASE_MANIFEST.fleet.map((m) => m.member),
  ...(Array.isArray(release?.man?.fleet) ? release.man.fleet.map((m) => m && m.member).filter((m) => typeof m === "string") : [])])];

/* R62, R63: what the account already holds, drawn: each copy by its own worker's answers (stored nowhere), and the installer's
   own counts where the worker states none. */
async function describeHeld(token, acct, inv, memberNames, only = null) {
  const api = apiOf(token, acct);
  let prefix = null;
  try { prefix = (await cf(token, `/accounts/${acct}/workers/subdomain`))?.subdomain || null; } catch (e) { if (special(e)) throw e; }
  const [spaces, apps] = await Promise.all([listNamespaces(api), listApps(api).catch((e) => { if (special(e)) throw e; return []; })]);
  const out = [];
  for (const copy of allCopies(inv)) {
    if (only && copy.slug !== only) continue;
    const address = copy.plane && prefix ? `https://${copy.slug}.${prefix}.workers.dev` : null;
    const facts = await readCopyFacts(address);
    const fallback = ["projects", "documents", "published", "members"].some((k) => facts[k].known) ? null
      : await countsViaApi(api, copy, memberNames, inv.scripts, spaces, apps);
    out.push({ ...describeCopy(copy, address, facts, fallback), plane: copy.plane, team: facts.team.known ? facts.team.value : null });
  }
  return out;
}

/* ---------------------------------------------------------------- the install */

async function runInstall(emit0, code, saved) {
  const guard = { drop: null };
  try { return await installRun(emit0, code, saved, guard); }
  finally { if (guard.drop) await guard.drop(); }
}

async function installRun(emit0, code, saved, guard) {
  const slug = saved.slug;
  const alongside = saved.al === 1;
  const names = namesFor(slug, SLUG_SCHEME);
  let token, scope, api;
  /* R66: a wait on Cloudflare is drawn once as it begins, and the lock (R69) is touched with it. */
  const onWait = async (waited) => {
    if (api) touchLock(api, saved.lock.id).catch(() => {});
    if (waited === 0) await emit0.wait(word("screen.install.progress.retrying", { minutes: WAIT_BOUND_MINUTES }));
  };
  const emit = { ...emit0, step: async (id, label) => { if (api) await touchLock(api, saved.lock.id).catch(() => {}); return emit0.step(id, label); } };

  await emit.step("auth", word("installer.step.auth"));
  try { const ex = await exchange(code, saved.v); token = new Session(ex.token, onWait); scope = ex.scope; emit.ok("auth"); }
  catch (e) {
    emit.no("auth");
    return emit.fail(word("installer.install.stopped.permission", { said: e.message }));
  }

  await emit.step("acct", word("installer.step.acct"));
  let acct;
  try {
    const accts = await cf(token, "/accounts");
    if (!accts?.length) throw new Error(word("installer.account.none"));
    acct = accts[0];
    emit.ok("acct", word("installer.account.using", { account: acct.name }));
  } catch (e) {
    if (special(e)) throw e;
    emit.no("acct");
    return emit.fail(word("installer.install.stopped.account", { said: e.message }));
  }
  api = apiOf(token, acct.id);

  /* R69 (F9): one run at a time. */
  try {
    if (!(await takeLock(api, saved.lock))) return emit.fail(word("installer.stopped.running"));
    guard.drop = () => dropLock(api);
  } catch (e) { if (special(e)) throw e; /* a lock that cannot be taken is not a reason to refuse the install */ }

  /* R62, R64, R69, R70 (F7): what the account already holds, read before anything is created. */
  await emit.step("fresh", word("installer.step.fresh"));
  const memberNames = memberNamesOf(null);
  let resumed = false;
  try {
    const inv = await inventory(api, memberNames);
    const ours = inv.planes.find((p) => p.slug === slug);
    const partial = inv.orphans.slugged.has(slug);
    const taken = new Set([...inv.scripts.keys(), ...inv.planes.map((p) => p.slug), ...inv.orphans.slugged.keys()]);
    const nametaken = () => { const free = freeName(slug, taken, slugOk);
      emit.no("fresh");
      return emit.fail(word("screen.install.stopped.nametaken", { name: slug }), free ? word("screen.install.stopped.nametaken.do", { free }) : ""); };
    /* A Worker by this name that is not a Civicsmith's (the lookup, R5: one that fails is a refusal, caught below). */
    if (!ours && (inv.scripts.has(slug) || await scriptExists(token, acct.id, slug))) return nametaken();
    if (ours && ours.finished) {
      if (alongside) return nametaken();                                 /* R64: a name a copy already holds */
    } else if (ours || partial) resumed = true;                          /* R69: begun here under this name, not finished */
    if (!resumed && !alongside && (inv.planes.length || inv.orphans.legacy.length || inv.orphans.slugged.size)) {
      /* R62: nothing is created or changed; the page offers the three ways on. */
      emit.no("fresh", word("screen.install.stopped.exists"));
      const held = await describeHeld(token, acct.id, inv, memberNames);
      return emit.done(existsPanel({ copies: held, version: await newestVersion(), slug }));
    }
    emit.ok("fresh", alongside ? word("installer.install.fresh.alongside") : word("screen.install.progress.single"));
  } catch (e) {
    if (special(e)) throw e;
    emit.no("fresh");
    return emit.fail(word("installer.install.stopped.lookup", { said: e.message }));
  }
  if (resumed) await emit.says(word("screen.install.resumed"));

  /* R70, R6 (DIST-3 / DEC-42): the plan check comes BEFORE the first thing this flow creates (the buckets, below), so a
     Free-plan account is refused while there is genuinely nothing to clean up. Refusing IS the fix: the D-106 failure this
     guards is a group getting something quietly different from every description of it — a copy that looks installed and
     degrades under load it was told it could carry. */
  await emit.step("plan", word("installer.step.plan"));
  let planAnswer;
  try { planAnswer = await establishPlan(token, acct.id); }
  catch (e) { if (special(e)) throw e; planAnswer = { plan: "unknown", detail: e.message }; }
  if (planAnswer.plan === "free") {
    emit.no("plan");
    return emit.fail(word("screen.install.stopped.plan") + " " + word("installer.install.stopped.plan.why"), word("screen.install.stopped.plan.do"));
  }
  if (planAnswer.plan === "unknown") {
    emit.no("plan");
    return emit.fail(word("installer.install.stopped.planunknown", { said: planAnswer.detail }));
  }
  emit.ok("plan", word("screen.install.progress.plan") + (planAnswer.leftover ? ". " + word("installer.probe.leftover", { name: PLAN_PROBE }) : ""));

  /* R70 (F2, F3): Containers on, and no account limit in the way, before anything is created. */
  await emit.step("room", word("installer.step.room"));
  try {
    if (!(await containersOn(api))) {
      emit.no("room");
      return emit.fail(word("screen.install.stopped.containers"), word("screen.install.stopped.containers.do"));
    }
    const limit = await limitReached(api);
    if (limit) {
      emit.no("room");
      return emit.fail(word("screen.install.stopped.limit", { limit }), word("screen.install.stopped.limit.do"));
    }
    emit.ok("room");
  } catch (e) {
    if (special(e)) throw e;
    emit.no("room");
    return emit.fail(word("installer.install.stopped.lookup", { said: e.message }));
  }


  /* R20 with R4: the release is chosen before the first thing this flow creates, so a release that states no readable limits
     refuses the install while there is genuinely nothing to clean up. */
  const release = await selectRelease(emit);
  if (release.refused) {
    return emit.fail(word("installer.install.stopped.nolimits", { refusal: release.refused }));
  }
  /* R71 (F5), R61: the whole fleet of this release verified and fetched now; a source that stays down ends the run here. */
  let loaded;
  try { loaded = await loadFleet(release, onWait); }
  catch (e) {
    if (e && e.source) return emit.fail(word("screen.install.stopped.source"), word("screen.install.stopped.source.do"));
    throw e;
  }

  /* Evidence storage is part of what a team's copy IS: captured documents, web pages, and their timestamp certificates
     live there. If storage cannot be created, nothing is installed, and the page explains the one Cloudflare prerequisite in
     plain terms. */
  await emit.step("r2", word("installer.step.storage"));
  const completed = [];
  try { const there = await ensureBuckets(token, acct.id, names); if (there.length) completed.push(word("installer.partial.what.storage")); emit.ok("r2", word("screen.install.progress.storage")); }
  catch (e) {
    if (special(e)) throw e;
    emit.no("r2");
    return emit.fail(word("installer.install.stopped.storage", { said: e.message }));
  }

  await emit.step("gen", word("installer.step.credentials"));
  /* R9 (T36): four credentials; no shared member key. */
  const secrets = { boot: rand(32), probe: rand(32), daemon: rand(32), seal: rand(32),
                    ...(instanceAiOk(saved.ai) ? { instanceAi: saved.ai } : {}) };
  emit.ok("gen");

  /* DIST-6, step 1: bind only the members this account already holds (see BINDING_OF for the order). */
  const present = await membersPresent(token, acct.id, names);
  if (present.length) completed.push(present.length === 1 ? word("installer.partial.what.programs.one") : word("installer.partial.what.programs.other", { n: present.length }));
  const profiles = Array.isArray(saved.p) && !profilesRefusal(saved.p, "install") ? saved.p : [];
  let selfRefused = false;
  await emit.step("install", word("screen.install.progress.placing"));
  /* R67, R69: the plane is uploaded unless the account already holds exactly this release's deployed state (its bytes, its
     bindings); bytes that match with a binding missing are uploaded, never skipped (S7). */
  const held = (await bindingsOf(api, slug));
  const sync = held ? await planeInSync(token, acct.id, slug, release, held, { names, members: present, profiles }) : false;
  try {
    if (held && sync) {
      completed.push(word("installer.partial.what.software"));
      await rotateSecrets(token, acct.id, slug, secrets, held);
      emit.ok("install", word("installer.install.inplace"));
    } else if (held) {
      completed.push(word("installer.partial.what.connections"));
      await uploadUpdate(token, acct.id, slug, true, release, { names, members: present, secrets, profiles });
      emit.ok("install");
    } else {
      await uploadInstall(token, acct.id, slug, secrets, release, { members: present, profiles, names });
      emit.ok("install");
    }
  } catch (e) {
    if (special(e)) throw e;
    /* An install carries a service binding to the script this very upload
       creates. That self-reference cannot be rehearsed here — the only way to
       know Cloudflare accepts it is a real install, which is deploy-gated — so
       the ONE thing it must not do is cost a team their copy. Retry once
       without it: a copy that installs and monitors nothing is recoverable (the
       update path binds SELF, so their next update arms it), and a copy that
       never installed is not. Same doctrine as the storage arm of the update:
       an install is never refused over something it can complete later. */
    let degraded = false;
    try {
      if (held) await uploadUpdate(token, acct.id, slug, true, release, { names, members: present, secrets, profiles, noSelf: true });
      else await uploadInstall(token, acct.id, slug, secrets, release, { noSelf: true, members: present, profiles, names });
      degraded = true;
    } catch (e2) { if (special(e2)) throw e2; /* the original refusal is the one worth reporting */ }
    selfRefused = degraded;
    if (!degraded) {
      emit.no("install");
      return emit.fail(word("installer.install.stopped.refused", { said: e.message }));
    }
    emit.ok("install", word("installer.install.noschedule", { said: e.message }));
  }

  /* R33: the plane just uploaded, read back and hashed against the release; a mismatch is a lag the verdict names. */
  const byteLags = [];
  const readBackInto = async () => { const lag = await readBack(token, acct.id, slug, release);
    if (lag && !byteLags.includes(lag)) byteLags.push(lag); };
  await readBackInto();

  /* IC-82/D-297: the fleet rides the same act. Per-member degradation lives inside installFleet — it never fails the install. */
  const fleet = await installFleet(emit, token, acct.id, slug, release, loaded, { scope, plan: { plan: "paid" }, vpc: saved.vpc, names });
  if (fleet) completed.push(...fleet.completed.filter((m) => !present.includes(m)).map((name) => word("installer.partial.what.helper", { name })));

  /* R14, then R47: the address is enabled before the plane's last upload, so that upload can tell the copy its own
     hosts; with no address the copy is told none, and the page says so. */
  await emit.step("addr", word("installer.step.address.install"));
  let base = null, addrError = null;
  try {
    const { sub, registered } = await ensureSubdomain(token, acct.id, slug);
    base = `https://${slug}.${sub}.workers.dev`;
    emit.ok("addr", registered ? word("installer.address.prefix", { prefix: registered }) : word("screen.install.progress.address"));
  } catch (e) { if (special(e)) throw e; addrError = e; emit.no("addr"); }
  const ownHosts = base ? [hostOf(base)] : null;

  /* DIST-6, step 3: the plane re-PUT bound to every member now present, and (R47) to its own hosts. The buckets exist
     (the r2 step refuses the install otherwise), the DAEMON_TOKEN restated is the one just generated, and SELF is
     restated only if the install kept it. */
  const bound = await bindMembers(emit, token, acct.id, slug, release, present, fleet,
    { withR2: true, daemon: secrets.daemon, noSelf: selfRefused, profiles, ownHosts, writeHosts: true, names });
  if (bound.put) await readBackInto();
  /* DIST-9: told only AFTER the upload that carried it succeeded — never "stored" ahead of the act. */
  await instanceAiNotice(emit, "install", !!secrets.instanceAi);
  await assistantNotice(emit);

  if (addrError) {
    return emit.fail(word("installer.install.stopped.noaddress", { said: addrError.message }), "", "addr");
  }

  /* R69 (F8): what an earlier run left, completed, said. */
  if (resumed && completed.length) await emit.says(word("installer.partial.completed", { what: [...new Set(completed)].join(", ") }));

  /* R46: before `verify` can succeed, no Logpush job may keep a record of each request to the copy's Workers. */
  const logs = await logsStep(emit, token, acct.id, copyWorkers(slug, release, names));
  const logLags = logs.lags;

  await emit.step("verify", word("screen.install.progress.answers"));
  const st = await verifyInstall(base, secrets.probe, onWait);
  /* D-116: answering is not serving. Once the address answers, each part's OWN build is read back — the record
     store's, and each capability worker's through the plane's binding — and a part that is not on this release is
     named. A release that cannot report those builds says so (UNDETERMINED_BUILDS) rather than claiming them. */
  const capable = release.capable;
  /* An install has always taken the selftest as its "answers"; a release that cannot report builds adds nothing to
     read, so the verdict is the selftest's plus the stated undetermined remainder — no new refusal is invented. */
  /* DIST-6: a bindable member whose upload failed is a lag on either branch, never a success over it. */
  const failed = fleet?.left || [];
  const served = !st ? null
    : capable ? await verifyServing(base, release.version, fleet?.done || [], capable, failed, onWait)
    : ((lags) => ({ confirmed: lags.length === 0, lags, capable: false }))(failedLags(failed));
  /* R33's read-back, R46's named jobs and R68's container images: each a lag, and no success while one stands. */
  const verdict = withByteLags(served, [...byteLags, ...logLags, ...(fleet?.imageLags || [])], capable);
  if (st && verdict.confirmed) emit.ok("verify", capable ? undefined : word("installer.verify.answers") + " " + UNDETERMINED_BUILDS);
  else if (st) emit.no("verify", word("installer.verify.unconfirmed"));
  else emit.no("verify", word("screen.install.stopped.lasting") + " " + word("screen.install.stopped.lasting.do"));

  /* R78: with the address answering, the installer records the team's short name itself; where it could not, the telling is drawn (R18). */
  const recorded = st ? await recordTeam(emit, base, secrets.boot, slug) : "refused";
  const told = recorded === "recorded" ? "" : groupNotice("refused", slug);

  /* R51: the checks the finished panel shows, each as it came out. */
  const servingLags = served ? served.lags.length : null;
  const checks = [
    { r: st ? "ok" : "no", text: st ? word("screen.install.ready.answers") + "." : word("installer.check.noanswer") },
    !st ? { r: "no", text: word("installer.check.builds.notchecked") }
      : !capable ? { r: "und", text: word("installer.check.builds.undetermined") }
      : servingLags === 0 ? { r: "ok", text: word("installer.check.builds.all", { version: release.version }) }
      : { r: "no", text: word("installer.check.builds.some") },
    { r: byteLags.length ? "no" : "ok", text: byteLags.length ? word("installer.check.bytes.no") : word("installer.check.bytes.ok", { version: release.version }) },
    { r: logs.state === "clear" ? "ok" : logs.state === "named" ? "no" : "und",
      text: logs.state === "clear" ? word("screen.install.ready.nolog") + "."
        : logs.state === "named" ? word("installer.check.log.no")
        : word("installer.check.log.undetermined") },
  ];
  /* R61: every part and its version, from the one release's own statement. */
  const parts = [{ name: "civicsmith", version: release.version }, ...((fleet?.done || []).map((m) => ({ name: m, version: String(release.man?.version ?? release.version) })))];
  /* R69 (K3747): the mark written last. Without it a later run takes this copy for one this installer did not finish. */
  let markLag = null;
  try { await putSecret(token, acct.id, slug, MARK, release.version); }
  catch (e) { if (approve(e)) throw e; markLag = word("installer.mark.failed", { said: e.message }); }
  emit.done(successPanel(base, secrets, !!st, verdict, saved.vpc, checks, parts, markLag ? [markLag] : [], told));
}

/* R67 — IS THE PLANE ALREADY AS THIS RELEASE WANTS IT? "Already done" is judged by the whole deployed state: the bytes the
   account holds hash to the release's, the VERSION is the release's, and every binding the install would send is there with
   the kind it would send; any one missing and the plane is uploaded, bytes identical or not (S7). Secrets cannot be read, so a
   secret counts by its name. */
async function planeInSync(token, acct, slug, release, held, { names, members, profiles }) {
  const have = new Map(held.map((b) => [b.name, b]));
  const wants = [["STORE", "durable_object_namespace"], ["VERSION", "plain_text"], ["INSTANCE_NAME", "plain_text"], ["ADMIN_TOKEN", "secret_text"],
    ["PROBE_TOKEN", "secret_text"], ["DAEMON_TOKEN", "secret_text"], [SEAL_BINDING, "secret_text"], ["CAPTURES", "r2_bucket"], ["PUBLISHED", "r2_bucket"],
    ["SELF", "service"], ["BROWSER", "browser"], ...memberBindings(members, names).map((b) => [b.name, "service"]),
    ...(profiles.length ? [[PROFILES_BINDING, "plain_text"]] : [])];
  for (const [name, type] of wants) if (have.get(name)?.type !== type) return false;
  if (have.get("VERSION")?.text !== release.version) return false;
  if (have.get("CAPTURES")?.bucket_name !== names.captures || have.get("PUBLISHED")?.bucket_name !== names.published) return false;
  for (const b of memberBindings(members, names)) if (have.get(b.name)?.service !== b.service) return false;
  return (await scriptHash(token, acct, slug)) === (await releaseSha(release));
}
/* A secret set on its own, without an upload (R69: a run that resumes states the credentials it has just generated). */
async function putSecret(token, acct, slug, name, text) {
  return cf(token, `/accounts/${acct}/workers/scripts/${slug}/secrets`, { method: "PUT", body: JSON.stringify({ name, text, type: "secret_text" }) });
}
async function rotateSecrets(token, acct, slug, secrets, held) {
  for (const [name, text] of [["ADMIN_TOKEN", secrets.boot], ["PROBE_TOKEN", secrets.probe], ["DAEMON_TOKEN", secrets.daemon]]) await putSecret(token, acct, slug, name, text);
  if (!held.some((b) => b.name === SEAL_BINDING)) await putSecret(token, acct, slug, SEAL_BINDING, secrets.seal);
}

/* R46: the copy's Workers, by script name: the plane, and every member it binds or the release names. */
function copyWorkers(slug, release, names) {
  const out = [slug, ...BINDING_OF.keys()].map((n) => (n === slug ? n : names.member(n)));
  for (const m of Array.isArray(release.man?.fleet) ? release.man.fleet : []) if (m && typeof m.member === "string") out.push(names.member(m.member));
  return [...new Set(out)];
}

const NO_KEY = word("installer.success.nokey");
/* R45 (T36): the security-tools paragraph of the final panel and the update's last screen: where the organization's own
   tools are added (setup-page R30), that the installer takes none, and what the operator's VPC choice did. */
function securityToolsNote(vpc) {
  return `<div class="card" id="security-tools"><p style="margin:0">${esc(SECURITY_TOOLS.replace(/\s+/g, " ").trim())} ${esc(vpcServiceOk(vpc)
    ? word("installer.security.note.named")
    : word("installer.security.note.none"))}</p></div>`;
}
/* R51 (DEC-201 (4)): the finished panel. What the checks found (R15's head and lags, then each check as a line), the
   one-time password and the address, once, the probe key folded behind "most teams never need it", R45's security-tools
   note, R34's block, and the hand-over to `<address>/app/setup#boot=<password>` (screens-entry's setup reads it there;
   the page's script reads the password from `out-boot` at the click, so it is written into the page once). */
const CHECK_WORD = Object.freeze({ ok: word("installer.check.passed"), no: word("installer.check.notyet"), und: word("installer.check.undetermined") });
const checkRows = (checks) => `<h2 id="checks-heading">${esc(word("installer.checks.heading"))}</h2><div class="cs-sheet ng-log" id="checks">${checks.map((c) =>
  `<div class="cs-row" data-r="${c.r === "und" ? "go" : c.r}"><span class="mk">${CHECK_WORD[c.r]}</span><span>${esc(c.text)}</span><span></span></div>`).join("")}</div>`;
export const HANDOVER_PATH = "/app/setup";
function successPanel(base, secrets, verified, verdict = null, vpc = null, checks = [], parts = [], notes = [], told = "") {
  const lagging = !!(verdict && !verdict.confirmed);
  const lives = word("installer.success.lives");
  const head = verified && !lagging
    ? `<b>${esc(word("installer.success.running"))}</b> ${esc(word("screen.install.ready.sub"))} ${esc(lives)} ${esc(NO_KEY)}`
      + (verdict && !verdict.capable ? ` ${esc(UNDETERMINED_BUILDS)}` : "")
    : lagging
    ? `<b>${esc(verified ? word("installer.success.lagging.answering") : word("installer.success.lagging"))}</b>
${esc(verified ? word("installer.success.lagging.asked") : word("installer.success.lagging.asleep"))}${lagList(verdict)}${esc(word("installer.success.save"))} ${esc(lives)} ${esc(NO_KEY)}`
    : `<b>${esc(word("installer.success.asleep"))}</b> ${esc(word("installer.success.asleep.why"))} ${esc(lives)} ${esc(NO_KEY)}`;
  return `<h2>${esc(verified && !lagging ? word("installer.success.title.ready") : word("installer.success.title.installed"))}</h2>
<div class="${lagging ? "notice" : "okbox"}"><p>${head}</p></div>
${checks.length ? checkRows(checks) : ""}
${parts.length ? partRows(parts) : ""}
${notes.map((n) => `<div class="notice"><p>${esc(n)}</p></div>`).join("")}
${told}
<section class="cs-section ng-sec" id="one-time">
<h2 id="otp-head">${esc(word("screen.install.otp.head"))}</h2>
<p id="otp-what">${esc(word("screen.install.otp.what"))}</p>
<div class="card">
 <div class="kv"><span class="k">${esc(word("installer.success.otp"))}</span><span class="v" id="out-boot">${secrets.boot}</span><button class="copy" data-copy="out-boot">${esc(word("installer.success.copy"))}</button></div>
 <div class="kv"><span class="k">${esc(word("installer.success.address"))}</span><span class="v" id="out-url">${esc(base)}</span><button class="copy" data-copy="out-url">${esc(word("installer.success.copy"))}</button></div>
</div>
<p class="help" id="otp-help">${esc(word("screen.install.otp.help"))}</p>
<p class="help">${esc(word("screen.install.address.help"))}</p>
</section>
<details class="ng-fold" id="probe-fold"><summary>${esc(word("screen.install.probe.summary"))}</summary>
<div class="card"><div class="kv"><span class="k">${esc(word("installer.success.probe"))}</span><span class="v" id="out-probe">${secrets.probe}</span><button class="copy" data-copy="out-probe">${esc(word("screen.install.probe.copy"))}</button></div></div>
<p class="help">${esc(word("screen.install.probe.help"))}</p></details>
${securityToolsNote(vpc)}
${/* R34 (DEC-109, K1038): before the hand-over to where the founder chooses a password, who really controls your team's
   Civicsmith, in instance-setup's words; nothing asks for or records an acknowledgement of it. */ hostingControlBlock("notice", { deployer: true })}
<p class="small">${esc(word("screen.install.ready.note"))}</p>
<div class="ng-acts"><button id="handover" class="cs-btn" data-tone="primary" data-url="${esc(base)}${HANDOVER_PATH}">${esc(word("screen.install.continue"))}</button></div>`;
}

/* R61: every part the release installed, with its version, from the release's own statement. */
const partRows = (parts) => `<h2 id="parts-heading">${esc(word("installer.parts.heading"))}</h2><div class="cs-sheet ng-log" id="parts">${parts.map((p) =>
  `<div class="cs-row" data-r="ok"><span class="mk"></span><span class="mono">${esc(p.name)} ${esc(p.version)}</span><span></span></div>`).join("")}</div>`;

/* D-436 / IC-172, R18, R78 — RECORDING WHICH TEAM PRODUCES THE RECORD, AND WHAT IS SAID WHEN IT IS NOT RECORDED.
 *
 * A copy records its producing team ONCE: at its store's first boot, from the INSTANCE_NAME `uploadInstall` binds in the
 * same PUT that creates the worker, or, for a store that already held a record when the value arrived, by one act of its
 * root of trust, op=instancegroupseed (the ADMIN_TOKEN credential held in the hosting account: no session of any role
 * reaches it, `UNATTENDED_BY_DECISION`). A run that holds the ADMIN_TOKEN it generated (an install, a resumed install: R9, R69)
 * makes that act itself with the run's own short name (R78, K3868); an update binds no new ADMIN_TOKEN (it would re-arm the
 * claim step, Membership §4.6, §9, K3892), so it reads what the copy records, with no credential (op=instancegroup answers
 * the public projection), and tells the operator when the copy records none (R18). The telling is drawn only for a copy the
 * run could not record, and says to run the installer again: it records the name it was installed under. */
const FIRST_GROUP_RELEASE = "0.71.0";
const SEMVER = /^\d+\.\d+\.\d+$/;
/* What an update says of the team's recording: nothing when the copy records a group; the telling when it records none, or
   when the read was not answered. `recorded` is `readGroup`'s answer. `before` (the version read before the upload) says which
   paragraph explains it. */
function groupUnrecorded(recorded, before) {
  if (recorded === "recorded") return null;
  if (recorded === "unread" || before === null || !SEMVER.test(String(before))) return "unknown";
  return vcmp(before, FIRST_GROUP_RELEASE) < 0 ? "certain" : "unknown";
}
function groupNotice(kind, slug, before) {
  if (!kind) return "";
  const why = kind === "certain" ? word("installer.team.unrecorded.certain", { before, first: FIRST_GROUP_RELEASE })
    : kind === "unknown" ? word("installer.team.unrecorded.unknown", { first: FIRST_GROUP_RELEASE }) : "";
  return `<div class="notice" id="team-unrecorded"><p style="margin:0 0 .6em"><b>${esc(word("installer.team.unrecorded.head"))}</b></p>
<p>${esc(why ? why + " " : "")}${esc(word("installer.team.unrecorded.effect"))}</p>
<p>${esc(word("installer.team.unrecorded.how"))}</p>
<p class="small">${esc(word("installer.team.unrecorded.suggest", { slug }))}</p></div>`;
}

/* R78 (K3868, K3878): the copy's own answer about its producing team, read with `Authorization: Bearer` only when a
   credential is given (never in an address, R15, `admission` R20). "recorded" (a group), "none" (`group: null`), or
   "unread" (no address, no answer, an answer that is no object). */
async function readGroup(base, credential = null) {
  if (!base) return "unread";
  try {
    const r = await fetch(`${base}/api/?op=instancegroup`, credential ? { headers: { authorization: `Bearer ${credential}` } } : undefined);
    const j = await r.json();
    if (!r.ok || !j || typeof j !== "object") return "unread";
    return typeof j.group === "string" && j.group ? "recorded" : j.group === null ? "none" : "unread";
  } catch { return "unread"; }
}
/* R78: the install's step that records the short name. Already recorded: nothing is done and nothing is said. */
async function recordTeam(emit, base, boot, slug) {
  const seen = await readGroup(base, boot);
  if (seen === "recorded") return "recorded";
  await emit.step("record", word("installer.step.record"));
  let said = null;
  if (seen === "unread") said = word("installer.fact.unknown.silent");
  else {
    try {
      const r = await fetch(`${base}/api/?op=instancegroupseed`, { method: "POST",
        headers: { authorization: `Bearer ${boot}`, "content-type": "application/json" }, body: JSON.stringify({ slug }) });
      const j = await r.json().catch(() => null);
      if (!j || !(j.ok === true || j.code === "GROUP_ALREADY_RECORDED")) said = String((j && (j.code || j.error || j.detail)) || r.status);
    } catch (e) { said = String(e && e.message || e); }
  }
  if (said === null && (await readGroup(base, boot)) !== "recorded") said = word("installer.fact.unknown.silent");
  if (said === null) { emit.ok("record", word("installer.step.record.done", { slug })); return "recorded"; }
  emit.no("record", word("installer.step.record.refused", { slug, said }));
  return "refused";
}

/* R52 (DEC-201 (8)): the version before and after, as two lines, on the update's last screen; the version before is the
   one `op=bootstrap` answered before the upload (R17), or said unread. */
function versionLines(before, after) {
  const signed = ARMED_SIGNERS.length ? word("installer.update.after.signed") : "";
  const bold = (v) => `<b class="id">${esc(v)}</b>`;
  return `<div class="cs-sheet ng-log" id="versions">`
    + `<div class="cs-row" data-r="ok"><span class="mk">${esc(word("installer.update.label.before"))}</span><span>${before
      ? around(word("installer.update.before.known", { version: SLOT }), bold(before))
      : esc(word("installer.update.before.unknown"))}</span><span></span></div>`
    + `<div class="cs-row" data-r="ok"><span class="mk">${esc(word("installer.update.label.after"))}</span><span>${around(word("installer.update.after", { version: SLOT, signed: "\u0002" }), bold(after)).replace("\u0002", esc(signed))}</span><span></span></div></div>`;
}

async function runUpdate(emit0, code, saved) {
  const guard = { drop: null };
  try { return await updateRun(emit0, code, saved, guard); }
  finally { if (guard.drop) await guard.drop(); }
}

async function updateRun(emit00, code, saved, guard) {
  const slug = saved.slug, V = saved.r;
  let api;
  /* R66: a wait is drawn once as it begins, and the lock (R69) is touched with it. */
  const onWait = async (waited) => {
    if (api) touchLock(api, saved.lock.id).catch(() => {});
    if (waited === 0) await emit00.wait(word("screen.install.progress.retrying", { minutes: WAIT_BOUND_MINUTES }));
  };
  const emit = { ...emit00, step: async (id, label) => { if (api) await touchLock(api, saved.lock.id).catch(() => {}); return emit00.step(id, label); } };
  /* R52, R55, R75: every stop of an update is one sentence by key, and each says that your team's Civicsmith keeps running as it
     was, before its upload changed anything. */
  const stopped = (said, d = "") => emit.fail(said, d);
  let token, scope;

  await emit.step("auth", word("installer.step.auth"));
  try { const ex = await exchange(code, saved.v); token = new Session(ex.token, onWait); scope = ex.scope; emit.ok("auth"); }
  catch (e) {
    emit.no("auth");
    return stopped(word("installer.update.stopped.permission", { said: e.message }));
  }

  await emit.step("acct", word("installer.step.acct"));
  let acct;
  try {
    const accts = await cf(token, "/accounts");
    if (!accts?.length) throw new Error(word("installer.account.none"));
    acct = accts[0];
    emit.ok("acct", word("installer.account.using", { account: acct.name }));
  } catch (e) {
    if (special(e)) throw e;
    emit.no("acct");
    return stopped(word("installer.update.stopped.account", { said: e.message }));
  }
  api = apiOf(token, acct.id);

  /* R69 (F9): one run at a time. */
  try {
    if (!(await takeLock(api, saved.lock))) return stopped(word("installer.stopped.running"));
    guard.drop = () => dropLock(api);
  } catch (e) { if (special(e)) throw e; }

  await emit.step("find", word("installer.step.find", { slug }));
  try {
    if (!(await scriptExists(token, acct.id, slug))) {
      emit.no("find");
      return stopped(word("installer.update.stopped.noteam", { slug }));
    }
    emit.ok("find");
  } catch (e) {
    if (special(e)) throw e;
    emit.no("find");
    return stopped(word("installer.update.stopped.lookup", { said: e.message }));
  }

  /* R64: a copy installed under the fixed names keeps them; any other is named by its slug. Its own plane's bindings say which. */
  const held = await heldBindings(token, acct.id, slug);
  let scheme = held ? schemeOf(held.list, slug) : null;
  if (!scheme) {
    /* Its plane's bindings do not say (an older copy, or settings that do not answer): the fixed names, when the account holds
       any of them and none of this slug's; this slug's otherwise. */
    try {
      const [scripts, buckets] = await Promise.all([listScripts(apiOf(token, acct.id)), listBuckets(apiOf(token, acct.id))]);
      const members = [...BINDING_OF.keys()];
      const legacy = members.some((m) => scripts.has(m)) || buckets.includes("bio-captures");
      const slugged = members.some((m) => scripts.has(`${m}-${slug}`)) || buckets.includes(`bio-captures-${slug}`);
      scheme = legacy && !slugged ? LEGACY_SCHEME : SLUG_SCHEME;
    } catch (e) { if (approve(e)) throw e; scheme = SLUG_SCHEME; }
  }
  const names = namesFor(slug, scheme);

  /* R55: the release chosen, and no other; any failure of its checks is a stop, and nothing is uploaded. */
  const release = await selectChosen(emit, V);
  if (release.stop) return stopped(release.stop);
  /* R71 (F5), R61: the whole fleet of this release fetched and verified before the upload; a source that stays down stops the
     update with nothing changed. */
  let loaded;
  try { loaded = await loadFleet(release, onWait); }
  catch (e) {
    if (e && e.source) return stopped(word("screen.install.stopped.source"), word("screen.install.stopped.source.do"));
    throw e;
  }

  /* What is it running now? Asked before the upload, so an update that changes
     nothing can say so instead of reading as a success. A no-op reported as
     "Updated to X" is worse than a plain refusal: the operator believes the
     work happened and moves on. Observed live on 2026-07-24, a 0.3.10 over
     0.3.10 update where the only honest line was easy to skim past. */
  let before = null, sub0 = null;
  await emit.step("read", word("installer.step.read"));
  try {
    sub0 = (await cf(token, `/accounts/${acct.id}/workers/subdomain`))?.subdomain || null;
    if (sub0) {
      const r = await fetch(`https://${slug}.${sub0}.workers.dev/api/?op=bootstrap`);
      if (r.ok) before = (await r.json())?.version || null;
    }
  } catch { /* not knowing is fine; it only costs the comparison */ }
  if (before !== null && !SEMVER.test(String(before))) before = null;
  if (before) emit.ok("read", UPDATE_WORDS.progressRead(before));
  else emit.no("read", word("installer.update.read.failed", { version: release.version }));
  const beforeText = before || word("installer.update.unread");
  await emit.says(UPDATE_WORDS.progressSays(beforeText, release.version, acct.name));
  const noop = before !== null && before === release.version;

  /* R17: the buckets are created where possible. After every check that can stop the update (R55), so a stop changes nothing. */
  let withR2 = false;
  try { await ensureBuckets(token, acct.id, names); withR2 = true; } catch (e) { if (special(e)) throw e; }
  /* R47: the copy's own hosts, restated from the address found; none found, none written (and the page says so). */
  const ownHosts = sub0 ? [`${slug}.${sub0}.workers.dev`] : null;

  await emit.step("up", noop ? word("installer.step.same", { version: release.version }) : UPDATE_WORDS.progressPlacing(release.version));
  /* DIST-6, step 1: restate the members the account already holds, so the update never un-binds a working copy's
     members — not for its duration, and not for good when the fleet step below cannot run. */
  const present = await membersPresent(token, acct.id, names);
  const instanceAi = instanceAiOk(saved.ai) ? saved.ai : undefined;
  /* K1541, R36 and R17: which bindings the copy holds (`held`, read before the upload, by name and type). */
  const seal = held && held.get(SEAL_BINDING) !== "secret_text" ? rand(32) : undefined;
  /* R67: the deployment the copy runs now, so an update whose new version never answers can put it back. */
  const previous = await currentDeployment(token, acct.id, slug);
  try { await uploadUpdate(token, acct.id, slug, withR2, release, { members: present, instanceAi, seal, ownHosts, names }); emit.ok("up"); }
  catch (e) {
    if (special(e)) throw e;
    emit.no("up");
    return stopped(word("installer.update.stopped", { version: beforeText }), word("installer.cfsaid", { said: e.message }));
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
  const fleet = await installFleet(emit, token, acct.id, slug, release, loaded, { scope, vpc: saved.vpc, names });
  /* DIST-6, step 3: this is what gives a copy installed WITHOUT member bindings its bindings. */
  const bound = await bindMembers(emit, token, acct.id, slug, release, present, fleet, { withR2, ownHosts, names });
  if (bound.put) await readBackInto();
  await instanceAiNotice(emit, "update", !!instanceAi);
  await accountSecretsNotice(emit, token, acct.id, slug, held, seal);

  await emit.step("addr", word("installer.step.address.update"));
  let base = null;
  try {
    const sub = (await cf(token, `/accounts/${acct.id}/workers/subdomain`))?.subdomain;
    if (sub) base = `https://${slug}.${sub}.workers.dev`;
  } catch { /* said below: an address not found is not told to the copy */ }
  emit.ok("addr", ownHosts ? word("installer.update.address.found", { hosts: ownHosts.join(", ") }) : word("installer.update.address.none"));

  /* R46: as on install, before `verify` can succeed. */
  const logs = await logsStep(emit, token, acct.id, copyWorkers(slug, release, names));
  const logLags = [...logs.lags, ...(fleet?.imageLags || [])];

  /* D-116: confirmed means EVERY part answers the release — the address, the record store, and each capability
     worker through the plane's binding (verifyServing). The patient tone stays, because a rollout genuinely takes
     minutes; what goes is reporting an update as done while a named part still runs the old build. */
  const capable = release.capable;
  let verdict = null;
  if (base) {
    await emit.step("verify", UPDATE_WORDS.progressAnswers);
    /* R67 (S9): the new version has to answer at all. An address that gives no answer for the whole bound, after an upload that
       changed the copy, puts the previous deployment back and stops, saying so. */
    const answered = await waitForAnswer(base, onWait);
    if (!answered && previous && !noop) {
      const back = await rollBack(token, acct.id, slug, previous);
      emit.no("verify");
      return back ? stopped(word("installer.update.stopped.noanswer", { version: beforeText }))
        : stopped(word("screen.install.stopped.lasting"), word("screen.install.stopped.lasting.do"));
    }
    verdict = withByteLags(await verifyServing(base, release.version, fleet?.done || [], capable, fleet?.left || [], onWait),
      [...byteLags, ...logLags], capable);
    if (verdict.confirmed) emit.ok("verify", capable ? undefined : word("installer.update.verify.answers", { version: release.version }) + " " + UNDETERMINED_BUILDS);
    else emit.no("verify", word("installer.update.verify.unconfirmed"));
  }
  /* R33: with no address to ask, a read-back lag is still named, and no success is claimed over it. */
  if (!verdict) verdict = withByteLags(null, [...byteLags, ...logLags], capable);
  const confirmed = !!(verdict && verdict.confirmed);
  const lagging = !!(verdict && !verdict.confirmed);

  /* R18, R78: this run holds no credential to record the team's short name with (an update binds no new ADMIN_TOKEN, K3892), so it
     reads what the copy records and tells the operator when it records none, or when the copy did not answer. */
  const told = groupNotice(groupUnrecorded(await readGroup(base), before), slug, before);

  const version = release.version;
  emit.done(versionLines(before, version) + (noop
    ? `<div class="notice"><p style="margin:0"><b>${esc(word("installer.update.noop.head", { running: UPDATE_WORDS.running(version), version }))}</b>
${esc(word("installer.update.noop.body", { version }))}</p></div>`
      + (lagging ? `<div class="notice"><p style="margin:0">${esc(word("installer.update.lagging.noop", { version }))}</p>${lagList(verdict)}</div>` : "")
    : (lagging
    /* D-116: the upload happened, and is said; an UPDATE is not claimed while a named part runs another build. */
    ? `<div class="notice"><p style="margin:0"><b>${esc(before ? word("installer.update.lagging.head.over", { version, before }) : word("installer.update.lagging.head", { version }))}</b>
${esc(word("installer.update.lagging.body"))}</p>
${lagList(verdict)}<p>${esc(word("installer.update.lagging.after"))}</p></div>`
    /* R55: finished, in `installer.update.done.*`: the release now running, what is as it was, and the way back. Said only
       once every part answers the release (a part not yet confirmed is the notice above, never this). */
    : `<div class="okbox" id="update-done"><h2 style="margin:0">${esc(UPDATE_WORDS.doneTitle)}</h2>
<p style="margin:0">${esc(UPDATE_WORDS.doneSays(version, beforeText))}</p>
<p style="margin:0">${confirmed
  ? esc(UPDATE_WORDS.doneAnswers(version)) + ". " + (capable ? esc(word("installer.update.done.allanswer", { version })) : esc(UNDETERMINED_BUILDS))
  : esc(word("installer.update.done.unconfirmed", { version }))}</p>
<p style="margin:0">${esc(UPDATE_WORDS.doneKept)}.</p>
<p style="margin:0" class="small">${esc(UPDATE_WORDS.doneNote(version))}</p></div>`)
    + told
    + securityToolsNote(saved.vpc)
    + (base ? `<div class="ng-acts"><a class="cs-btn" data-tone="primary" id="update-back" href="${esc(base)}/">${esc(UPDATE_WORDS.back)}</a></div>` : "")));
}

/* ------------------------------------------------------- R65: removal, guided, confirmed, complete */

/* `installremove`: what removing the copy at `slug` would delete, drawn and not done. The holdings are read as R63 reads them
   (the copy's own worker, else the installer's counts from Cloudflare's API), so the page lists what the exists page showed. */
async function runRemoveView(emit, code, saved) {
  const slug = saved.slug;
  let token, acct;
  await emit.step("auth", word("installer.step.auth"));
  try { const ex = await exchange(code, saved.v); token = new Session(ex.token); emit.ok("auth"); }
  catch (e) { emit.no("auth"); return emit.fail(word("installer.remove.refused.permission", { said: e.message })); }
  await emit.step("acct", word("installer.step.acct"));
  try { const accts = await cf(token, "/accounts"); if (!accts?.length) throw new Error(word("installer.account.none")); acct = accts[0]; emit.ok("acct", word("installer.account.using", { account: acct.name })); }
  catch (e) { if (special(e)) throw e; emit.no("acct"); return emit.fail(word("installer.remove.refused.account", { said: e.message })); }
  await emit.step("read", word("installer.step.remove.read"));
  let held;
  try {
    const memberNames = memberNamesOf(null);
    const inv = await inventory(apiOf(token, acct.id), memberNames);
    held = (await describeHeld(token, acct.id, inv, memberNames, slug))[0] || null;
    if (!held) { emit.no("read"); return emit.fail(word("installer.remove.refused.none", { slug })); }
  } catch (e) {
    if (special(e)) throw e;
    emit.no("read");
    return emit.fail(word("installer.remove.refused.lookup", { said: e.message }));
  }
  emit.ok("read");
  emit.done(removePanel({ copy: held, slug }));
}

/* `installremoveconfirm`: deletes every resource the copy holds in the account, each named as it goes, and, when the account is
   clear, offers the new install (a new consent). Only the typed short name reaches here (checked at /begin and again here). */
async function runRemoveRun(emit, code, saved) {
  const guard = { drop: null };
  try { return await runRemove(emit, code, saved, guard); }
  finally { if (guard.drop) await guard.drop(); }
}
async function runRemove(emit0, code, saved, guard) {
  const slug = saved.slug;
  let token, acct, api;
  const emit = { ...emit0, step: async (id, label) => { if (api) await touchLock(api, saved.lock.id).catch(() => {}); return emit0.step(id, label); } };
  await emit.step("auth", word("installer.step.auth"));
  try { const ex = await exchange(code, saved.v); token = new Session(ex.token); emit.ok("auth"); }
  catch (e) { emit.no("auth"); return emit.fail(word("installer.remove.refused.permission", { said: e.message })); }
  await emit.step("acct", word("installer.step.acct"));
  try { const accts = await cf(token, "/accounts"); if (!accts?.length) throw new Error(word("installer.account.none")); acct = accts[0]; emit.ok("acct", word("installer.account.using", { account: acct.name })); }
  catch (e) { if (special(e)) throw e; emit.no("acct"); return emit.fail(word("installer.remove.refused.account", { said: e.message })); }
  api = apiOf(token, acct.id);
  if (saved.ty !== slug) return emit.fail(word("installer.remove.refused.typed", { slug }));
  try {
    if (!(await takeLock(api, saved.lock))) return emit.fail(word("installer.remove.refused.running"));
    guard.drop = () => dropLock(api);
  } catch (e) { if (special(e)) throw e; }
  await emit.step("list", word("installer.step.remove.list"));
  let resources;
  try {
    const memberNames = memberNamesOf(null);
    const inv = await inventory(api, memberNames);
    const copy = allCopies(inv).find((c) => c.slug === slug);
    if (!copy) { emit.no("list"); return emit.fail(word("installer.remove.refused.none", { slug })); }
    resources = await resourcesOf(api, copy, memberNames);
    emit.ok("list");
  } catch (e) {
    if (special(e)) throw e;
    emit.no("list");
    return emit.fail(word("installer.remove.refused.lookup", { said: e.message }));
  }
  let n = 0;
  try {
    await deleteResources(api, resources, async (r) => {
      const id = "del" + (++n), name = r.name;
      await emit.step(id, r.kind === "app" ? word("installer.step.remove.app", { name }) : r.kind === "worker" ? word("installer.step.remove.worker", { name })
        : word("installer.step.remove.bucket", { name }));
      return emit.ok(id, word("installer.remove.progress", { what: name }));
    });
  } catch (e) {
    if (special(e)) throw e;
    return emit.fail(word("installer.remove.refused.remains", { remaining: (e.remaining || []).join(", ") }), word("installer.cfsaid", { said: e.message }));
  }
  emit.done(removedPanel({ team: slug, done: n }));
}

/* ---------------------------------------------------------------- routes */

/* R53 (DEC-122 (3); K3100): one of interface-assets' files (ASSET_FILES: the stylesheet, the icons, the 15 faces and their
   licences), as its own bytes and type, cacheable for good (each is frozen at ASSETS_COMMIT); null for any other name.
   Nothing is read or stored: the bytes are this bundle's. */
const ASSET_BYTES = new Map();
export function assetResponse(name) {
  if (!Object.hasOwn(ASSET_FILES, name)) return null;
  const f = ASSET_FILES[name];
  if (!ASSET_BYTES.has(name))
    ASSET_BYTES.set(name, f.encoding === "base64" ? Uint8Array.from(atob(f.body), (c) => c.charCodeAt(0)) : enc.encode(f.body));
  const type = /^text\//.test(f.type) || f.type === "image/svg+xml" ? `${f.type}; charset=utf-8` : f.type;
  return new Response(ASSET_BYTES.get(name), { headers: { "content-type": type,
    "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff" } });
}

export default {
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "GET" && (url.pathname === "/" || url.pathname === ""))
      return html(WIZARD_HTML);

    /* R55: `version` alone is read from the address, and only in the form a release's version has; nothing else, and no
       credential, is read from it. Any other value draws the page that says no release was chosen. */
    if (req.method === "GET" && url.pathname === "/update")
      return html(updateHtml(url.searchParams.get("version")));

    /* R53 (and R1's one further route): interface-assets' files, byte for byte, at the path the stylesheet names them by. */
    if (req.method === "GET" && url.pathname.startsWith(ASSET_PREFIX)) {
      const served = assetResponse(url.pathname.slice(ASSET_PREFIX.length));
      if (served) return served;
    }

    /* Begin: validate, mint PKCE, park it in an HttpOnly cookie, hand the
       browser the authorize URL. The verifier belongs to this browser and
       only ever travels back to this same origin. */
    if (req.method === "POST" && url.pathname === "/begin") {
      const body = await req.json().catch(() => ({}));
      const mode = ["update", "remove", "removeconfirm"].includes(body.mode) ? body.mode : "install";
      /* R2: a slug is a string in the grammar; a number or anything else is refused, never coerced into one. */
      const slug = typeof body.slug === "string" ? body.slug.trim() : "";
      if (!slugOk(slug))
        return json({ ok: false, error: word("installer.begin.slug") }, 400);
      /* R55: an update is of the one release chosen, V of `signatures`' R47 form; none, or any other value, is refused by
         name before any sign-in. An install takes no version. */
      const chosen = typeof body.version === "string" ? body.version : "";
      /* R65: a removal is confirmed by the short name typed, exactly; any other draws nothing and deletes nothing. */
      if (mode === "removeconfirm" && body.typed !== slug)
        return json({ ok: false, error: word("installer.remove.refused.typed", { slug }) }, 400);
      if (mode === "update" && !versionOk(chosen))
        return json({ ok: false, error: NO_RELEASE_CHOSEN + " " + NO_RELEASE_BEGIN }, 400);
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
        return json({ ok: false, error: word("installer.begin.ai") }, 400);
      /* R21: the chosen jurisdiction profiles (install only), refused by name when not offered, never silently dropped. */
      const profilesWhy = profilesRefusal(body.profiles, mode);
      if (profilesWhy) return json({ ok: false, error: profilesWhy }, 400);
      const p = Array.isArray(body.profiles) && body.profiles.length ? body.profiles : null;
      /* R45 (T36): the Workers VPC service the operator names for a tool reached through a tunnel, optional on the install
         and the update alike; a value present but not a service id is refused by name, never dropped. */
      const vpc = typeof body.securityVpc === "string" ? body.securityVpc.trim().toLowerCase() : "";
      if (vpc && !vpcServiceOk(vpc))
        return json({ ok: false, error: word("installer.begin.vpc") }, 400);
      /* R36, R37 (T36): nothing else /begin is sent is kept: no field carries a Claude credential, and the install takes no
         choice about the assistant (an `assistant` field is taken nowhere). */
      const cookie = b64url(enc.encode(JSON.stringify({ v, s, slug, mode, t: Date.now(), ...(ai ? { ai } : {}), ...(p ? { p } : {}),
        ...(vpc ? { vpc } : {}), ...(mode === "update" ? { r: chosen } : {}),
        ...(mode === "install" && body.alongside === true ? { al: 1 } : {}), ...(mode === "removeconfirm" ? { ty: body.typed } : {}),
        ...(typeof body.lock === "string" && /^[0-9A-Za-z_-]{6,64}$/.test(body.lock) ? { lk: body.lock } : {}) })));
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
        return html(plainPage(word("installer.callback.denied.title"),
          word("installer.callback.denied.what"),
          url.searchParams.get("error_description") || err, saved?.slug), 200, clear);

      if (!code || !saved || saved.s !== state
          || typeof saved.t !== "number" || Date.now() - saved.t > CFG.COOKIE_MAX_AGE_S * 1000)
        return html(plainPage(word("installer.callback.unverified.title"),
          word("installer.callback.unverified.what"), ""), 200, clear);

      /* R55: a cookie that names no release for an update is not one /begin wrote. */
      if (saved.mode === "update" && !versionOk(saved.r))
        return html(plainPage(NO_RELEASE_CHOSEN, word("installer.update.nothing.changed") + " " + NO_RELEASE_BEGIN, ""), 200, clear);

      const title = saved.mode === "update" ? UPDATE_WORDS.progressTitle
        : saved.mode === "remove" ? word("screen.install.remove.title") : saved.mode === "removeconfirm" ? word("installer.remove.running.title")
        : word("screen.install.progress.title");
      /* R69, R71: this run's own place on the account's lock, and the run it continues when the founder approved again. */
      saved.lock = { id: rand(8), again: typeof saved.lk === "string" && /^[0-9A-Za-z_-]{6,64}$/.test(saved.lk) ? saved.lk : null };
      /* R71 (F6): what a new approval begins again, never a credential. */
      const again = { slug: saved.slug, mode: saved.mode, lock: saved.lock.id, ...(saved.mode === "update" ? { version: saved.r } : {}),
        ...(saved.al === 1 ? { alongside: true } : {}), ...(saved.p ? { profiles: saved.p } : {}), ...(saved.vpc ? { securityVpc: saved.vpc } : {}),
        ...(saved.mode === "removeconfirm" ? { typed: saved.ty } : {}) };
      return streamPage(clear, progressShell(title, saved.slug, saved.mode === "update" ? `/update?version=${saved.r}` : null),
        (emit) => saved.mode === "update" ? runUpdate(emit, code, saved)
          : saved.mode === "remove" ? runRemoveView(emit, code, saved)
          : saved.mode === "removeconfirm" ? runRemoveRun(emit, code, saved)
          : runInstall(emit, code, saved), again);
    }

    return html(plainPage(word("installer.notfound.title"), word("installer.notfound.what"), ""), 404);
  },
};

/* R22: a refusal page names Civicsmith (PRODUCT), and the group by the name it chose when this browser's request carried
   one; before a group has chosen a name (the 404, an unverifiable return) it speaks to "your team". */
function plainPage(head, what, detail, slug) {
  const group = typeof slug === "string" && slugOk(slug)
    ? around(word("installer.plain.forteam", { name: SLOT }), `<b class="mono" id="group">${esc(slug)}</b>`) : esc(word("installer.plain.team"));
  return `${pageHead(head, { noindex: true })}
<body class="cs"><main class="cs-frame ng">
${pageMark()}
<h1>${esc(head)}</h1><p>${esc(what)}</p>
${detail ? `<p class="small mono">${esc(detail)}</p>` : ""}
<p class="small">${group}</p>
<div class="ng-acts"><a class="cs-btn" href="/">${esc(word("installer.plain.back"))}</a></div>
${publisherFooter()}
</main></body></html>`;
}
