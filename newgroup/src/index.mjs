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
 *   - The token is scoped to exactly three permissions, granted on a consent
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

import { WIZARD_HTML, UPDATE_HTML, PAGE_CSS } from "./ui.mjs";
import { RELEASE_SOURCE, RELEASE_VERSION } from "./release.mjs";
/* One verifier, shared with the plane. The installer and the instance
   agree on what a valid signature is because they run the same code. */
import { verifySshsig, NS_RELEASE } from "../../bio-plane/src/sshsig.mjs";

export const CFG = {
  CLIENT_ID: "1c2fdba3fc71cf88d26fcd7b90df95de",
  AUTHORIZE: "https://dash.cloudflare.com/oauth2/auth",
  TOKEN:     "https://dash.cloudflare.com/oauth2/token",
  API:       "https://api.cloudflare.com/client/v4",
  REDIRECT:  "https://newgroup.believeinoakland.workers.dev/callback",
  /* Exactly the scopes registered on the OAuth client, nothing more. */
  SCOPES:    ["workers-scripts.write", "workers-r2.write", "account-settings.read"],
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

/* The keys this installer will trust to have signed a release.
 *
 * A hash in RELEASE.json proves the bytes were not corrupted in transit.
 * It proves nothing about who put them there: whoever can write the
 * repository can write both the asset and the hash of the asset. A
 * signature is the part that names a person, and the only copy of the
 * public key that matters is this one, compiled into the installer the
 * group is already trusting to touch their account.
 *
 * Empty means unarmed: the installer verifies hashes, notes plainly that
 * releases are not yet signed, and installs. Once a key is listed, an
 * unsigned or wrongly signed repository release is refused outright and
 * the built-in copy installs instead. Adding the first key is a
 * deliberate act by the maintainer, not a default. */
export const ARMED_SIGNERS = [
  "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGfzETopBeZe5mbD7ukYwaZczyBPjJ4S3sX+Ly3rN3Vl bio-release",
];

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
  try {
    const man = await fetchRepoManifest();
    if (vcmp(man.version, RELEASE_VERSION) > 0) {
      const source = await fetchRepoAsset(man);
      emit.ok("rel", "The repository has " + man.version + ", newer than the built-in "
        + RELEASE_VERSION + ". "
        + (ARMED_SIGNERS.length
            ? "It carries a valid signature from a key this installer trusts, so that is what installs."
            : "Its integrity checked out, so that is what installs."));
      return { version: String(man.version), source, from: "repository" };
    }
    emit.ok("rel", "The built-in release (" + RELEASE_VERSION + ") is current.");
  } catch (e) {
    const fallback = " The installer's own built-in release (" + RELEASE_VERSION
      + ") installs instead, which is safe. This is worth mentioning to Believe in Oakland.";
    emit.ok("rel",
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
  return { version: RELEASE_VERSION, source: RELEASE_SOURCE, from: "built-in" };
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

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;
const slugOk = (s) => typeof s === "string" && SLUG_RE.test(s) && s !== "newgroup";

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
  return j.access_token;
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
async function ensureBuckets(token, acct) {
  for (const name of ["bio-captures", "bio-published"]) {
    try { await cf(token, `/accounts/${acct}/r2/buckets`, {
      method: "POST", body: JSON.stringify({ name }) }); }
    catch (e) { if (!/already exists/i.test(e.message)) throw e; }
  }
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
   `classify()` recognises only ADMIN_TOKEN / MEMBER_TOKEN / PROBE_TOKEN. Binding a
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

/* `opts.noSelf` exists for ONE reason: an install PUT names a service binding to
   the script the same PUT creates, and nothing here can prove Cloudflare accepts
   that self-reference without a real install, which is deploy-gated. So the
   install degrades rather than failing — see the retry in runInstall. */
async function uploadInstall(token, acct, slug, secrets, release, opts = {}) {
  const meta = {
    main_module: "index.mjs",
    compatibility_date: "2026-07-01",
    compatibility_flags: ["nodejs_compat"],
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
      { type: "secret_text", name: "MEMBER_TOKEN", text: secrets.member },
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
      { type: "r2_bucket", name: "CAPTURES", bucket_name: "bio-captures" },
      { type: "r2_bucket", name: "PUBLISHED", bucket_name: "bio-published" },
      ...(opts.noSelf ? [] : [selfBinding(slug)]),
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
async function uploadUpdate(token, acct, slug, withR2, release) {
  /* When the account's storage is available the update binds it explicitly,
     which quietly completes any copy installed before storage became a
     requirement. When it is not, the update proceeds the old way, keeping
     whatever bindings exist: an update must never be refused over storage. */
  const meta = {
    main_module: "index.mjs",
    compatibility_date: "2026-07-01",
    compatibility_flags: ["nodejs_compat"],
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
      selfBinding(slug),
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
      { type: "secret_text", name: "DAEMON_TOKEN", text: rand(32) },
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

async function verifyInstall(base, probe) {
  for (let i = 0; i < 10; i++) {
    try {
      const r = await fetch(`${base}/api/?op=selftest&token=${probe}`);
      const j = await r.json();
      if (j.ok === true && j.bindings?.STORE === true) return j;
    } catch {}
    await new Promise((res) => setTimeout(res, 3000));
  }
  return null;
}

async function verifyUpdate(base, wantVersion) {
  for (let i = 0; i < 5; i++) {
    try {
      const r = await fetch(`${base}/api/?op=bootstrap`);
      const j = await r.json();
      if (j.version === wantVersion) return j;
    } catch {}
    await new Promise((res) => setTimeout(res, 2500));
  }
  return null;
}

/* -------------------------------------------------------- the progress page
   The callback streams HTML: the shell renders immediately, then each
   provisioning step lands as a small script as it completes. Live progress
   with the token never leaving this Worker, and nothing to poll. */

function progressShell(title, slug) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(title)}</title><style>${PAGE_CSS}</style></head><body><main>
<p class="eyebrow">Believe in Oakland &middot; installer</p>
<h1>${esc(title)}</h1>
<p class="small">Reference: <span class="mono">${esc(slug)}</span>. Leave this page open. This usually takes under a minute.</p>
<div id="log" class="log"></div>
<div id="fail" class="notice" hidden><h2 id="fail-h"></h2><p id="fail-p"></p><p class="small mono" id="fail-d"></p></div>
<div id="done" hidden></div>
<script>
const $=s=>document.querySelector(s);const rows={};
function step(id,label){const d=document.createElement("div");d.className="row go";d.id="r-"+id;
 d.innerHTML='<span class="dot"></span><span></span>';d.lastChild.textContent=label;$("#log").appendChild(d);rows[id]=d;}
function ok(id,label){const d=rows[id];if(!d)return;d.className="row ok";if(label)d.lastChild.textContent=label;}
function no(id){const d=rows[id];if(!d)return;d.className="row no";}
function fail(h,p,d){$("#fail").hidden=false;$("#fail-h").textContent=h;$("#fail-p").textContent=p;$("#fail-d").textContent=d||"";}
function done(html){$("#done").innerHTML=html;$("#done").hidden=false;
 document.querySelectorAll("[data-copy]").forEach(b=>b.addEventListener("click",async()=>{
  await navigator.clipboard.writeText(document.getElementById(b.dataset.copy).textContent);
  const t=b.textContent;b.textContent="Copied";setTimeout(()=>b.textContent=t,1400);}));
 const h=$("#handover");if(h)h.addEventListener("click",()=>{location.href=h.dataset.url+"#boot="+encodeURIComponent(document.getElementById("out-boot").textContent);});}
</script>`;
}

const jsStr = (s) => JSON.stringify(String(s ?? ""));

function streamPage(headers, shell, run) {
  const { readable, writable } = new TransformStream();
  const w = writable.getWriter();
  const write = (s) => w.write(enc.encode(s));
  const emit = {
    step: (id, label) => write(`<script>step(${jsStr(id)},${jsStr(label)})</script>\n`),
    ok:   (id, label) => write(`<script>ok(${jsStr(id)}${label ? "," + jsStr(label) : ""})</script>\n`),
    no:   (id)        => write(`<script>no(${jsStr(id)})</script>\n`),
    fail: (h, p, d)   => write(`<script>no();fail(${jsStr(h)},${jsStr(p)},${jsStr(d)})</script>\n`),
    done: (inner)     => write(`<script>done(${JSON.stringify(inner)})</script>\n`),
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

async function runInstall(emit, code, saved) {
  const slug = saved.slug;
  let token;

  emit.step("auth", "Confirming your permission with Cloudflare");
  try { token = await exchange(code, saved.v); emit.ok("auth"); }
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

  emit.step("fresh", "Checking the name is free on your account");
  try {
    if (await scriptExists(token, acct.id, slug)) {
      emit.no("fresh");
      return emit.fail(`A copy named "${slug}" already exists on your account`,
        "Nothing was changed. If you meant to update it to the current release, go back and choose the update option instead.",
        "");
    }
    emit.ok("fresh");
  } catch (e) {
    emit.no("fresh");
    return emit.fail("Could not check your account",
      "The check for an existing copy failed, so to be safe nothing was created.",
      "Detail: " + e.message);
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
      "Your copy runs on Cloudflare Workers, and the work it does — reading captured documents, "
      + "assembling evidence, answering members — needs the processing allowance that comes with "
      + "Cloudflare's Workers Paid plan ($5/month). Your account already has a payment method for "
      + "the storage this installer sets up, so this is $5 a month on a card Cloudflare already "
      + "has, not a new kind of commitment. Installing without it would hand you a copy that looks "
      + "right and quietly fails under real work, which is worse than this message. "
      + "Nothing was installed, so there is nothing to clean up.",
      "To continue: sign in at dash.cloudflare.com with this same account, open Workers & Pages, "
      + "choose Plans, enable Workers Paid, then come back here and run the installer again.");
  }
  if (planAnswer.plan === "unknown") {
    emit.no("plan");
    return emit.fail("Could not verify your account's Workers plan",
      "The check that establishes your plan did not get a readable answer, and an unverified "
      + "plan is not a verified one — installing anyway could hand you a copy that quietly "
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
      "Your copy keeps captured documents (PDFs, web pages, timestamp certificates) in Cloudflare's file "
      + "storage, and Cloudflare requires a payment method on the account before that storage can be turned "
      + "on. Usage at a community group's size stays inside the free tier; the card is Cloudflare's "
      + "requirement, not a charge. Nothing was installed, so there is nothing to clean up.",
      "To continue: sign in at dash.cloudflare.com with this same account, open Billing, add a card or "
      + "PayPal, then come back here and run the installer again. (Cloudflare said: " + e.message + ")");
  }

  const release = await selectRelease(emit);

  emit.step("gen", "Generating your credentials");
  const secrets = { boot: rand(32), member: rand(32), probe: rand(32), daemon: rand(32) };
  emit.ok("gen");

  emit.step("install", "Installing the software into your account");
  try { await uploadInstall(token, acct.id, slug, secrets, release); emit.ok("install"); }
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
    try { await uploadInstall(token, acct.id, slug, secrets, release, { noSelf: true }); degraded = true; }
    catch { /* the original refusal is the one worth reporting */ }
    if (!degraded) {
      emit.no("install");
      return emit.fail("The software did not install",
        "Your account was reachable but the install was refused, so there is nothing left behind to clean up.",
        "Detail: " + e.message);
    }
    emit.ok("install", "Your copy is installed. One optional part — the part that lets it re-check "
      + "documents on its own schedule — was refused by Cloudflare and was left out, so nothing else "
      + "was held up. Running the updater on this copy later turns it on. (Cloudflare said: "
      + e.message + ")");
  }

  emit.step("addr", "Turning on your web address");
  let base;
  try {
    const { sub, registered } = await ensureSubdomain(token, acct.id, slug);
    base = `https://${slug}.${sub}.workers.dev`;
    emit.ok("addr", registered
      ? `Your account had no web address prefix yet, so it is now "${registered}". Every future worker on this account shares that prefix.`
      : undefined);
  } catch (e) {
    emit.no("addr");
    return emit.fail("Your copy installed but has no address yet",
      "The software is on your account. Only the public web address failed, which is fixable from the "
      + "Cloudflare dashboard under Workers, without starting over.",
      "Detail: " + e.message);
  }

  emit.step("verify", "Checking that it answers");
  const st = await verifyInstall(base, secrets.probe);
  if (st) emit.ok("verify");
  else emit.no("verify");

  emit.done(successPanel(base, secrets, !!st));
}

function successPanel(base, secrets, verified) {
  const head = verified
    ? `<b>Your copy is running.</b> It lives in your
Cloudflare account, under your control. Believe in Oakland holds no key to it.`
    : `<b>Your copy is installed. Its new address has not woken up yet.</b> Brand-new
addresses can take a few minutes to start answering; everything else finished. Save the
credentials below now, then open your address. It lives in your Cloudflare account, under
your control. Believe in Oakland holds no key to it.`;
  return `<div class="okbox"><p style="margin:0">${head}</p></div>
<div class="card">
 <div class="kv"><span class="k">Your address</span><span class="v" id="out-url">${esc(base)}</span><button class="copy" data-copy="out-url">Copy</button></div>
 <div class="kv"><span class="k">One-time password</span><span class="v" id="out-boot">${secrets.boot}</span><button class="copy" data-copy="out-boot">Copy</button></div>
 <div class="kv"><span class="k">Member credential</span><span class="v" id="out-member">${secrets.member}</span><button class="copy" data-copy="out-member">Copy</button></div>
 <div class="kv"><span class="k">Probe credential</span><span class="v" id="out-probe">${secrets.probe}</span><button class="copy" data-copy="out-probe">Copy</button></div>
</div>
<p><b>Save the member and probe credentials in a password manager now.</b> This page is the
only time they are shown. The one-time password is spent in the next step, where you choose
a real password.</p>
<p class="small">If you lose the password you choose next, you are not locked out: replacing
the ADMIN_TOKEN value in your worker's Cloudflare settings starts the claim step over. Your
Cloudflare sign-in is the way back in.</p>
<div class="actions"><button id="handover" data-url="${esc(base)}/">Go to my copy and finish setup</button></div>`;
}

async function runUpdate(emit, code, saved) {
  const slug = saved.slug;
  let token;

  emit.step("auth", "Confirming your permission with Cloudflare");
  try { token = await exchange(code, saved.v); emit.ok("auth"); }
  catch (e) {
    emit.no("auth");
    return emit.fail("Cloudflare did not confirm the permission",
      "The sign-in came back but the final handshake failed. Your existing copy is untouched.",
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
      "Permission was granted but the account list came back empty or refused. Your existing copy is untouched.",
      "Detail: " + e.message);
  }

  emit.step("find", `Finding your copy named "${slug}"`);
  try {
    if (!(await scriptExists(token, acct.id, slug))) {
      emit.no("find");
      return emit.fail(`No copy named "${slug}" exists on your account`,
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

  /* What is it running now? Asked before the upload, so an update that changes
     nothing can say so instead of reading as a success. A no-op reported as
     "Updated to X" is worse than a plain refusal: the operator believes the
     work happened and moves on. Observed live on 2026-07-24, a 0.3.10 over
     0.3.10 update where the only honest line was easy to skim past. */
  let before = null;
  try {
    const sub0 = (await cf(token, `/accounts/${acct.id}/workers/subdomain`))?.subdomain;
    if (sub0) {
      const r = await fetch(`https://${slug}.${sub0}.workers.dev/api/?op=bootstrap`);
      if (r.ok) before = (await r.json())?.version || null;
    }
  } catch { /* not knowing is fine; it only costs the comparison */ }
  const noop = before !== null && before === release.version;

  emit.step("up", noop
    ? `Your copy already runs ${release.version}. Re-uploading the same version`
    : before
      ? `Updating the software from ${before} to ${release.version}`
      : `Updating the software to ${release.version}`);
  try { await uploadUpdate(token, acct.id, slug, withR2, release); emit.ok("up"); }
  catch (e) {
    emit.no("up");
    return emit.fail("The update was refused",
      "Your copy is still running the version it had before. Nothing about it changed.",
      "Detail: " + e.message);
  }

  emit.step("addr", "Finding your copy's address");
  let base = null;
  try {
    const sub = (await cf(token, `/accounts/${acct.id}/workers/subdomain`))?.subdomain;
    if (sub) base = `https://${slug}.${sub}.workers.dev`;
    emit.ok("addr");
  } catch { emit.ok("addr"); }

  let confirmed = false;
  if (base) {
    emit.step("verify", "Checking the new version answers");
    confirmed = !!(await verifyUpdate(base, release.version));
    emit.ok("verify", confirmed ? undefined
      : "The address has not started answering with the new version yet. That is normal for a few "
      + "minutes after an update and nothing needs fixing.");
  }

  emit.done(noop
    ? `<div class="notice"><p style="margin:0"><b>Nothing changed: your copy was already running ${esc(release.version)}.</b>
The upload succeeded, but it replaced that version with the same version, so this update moved nothing.
If you expected something newer, the installer had nothing newer to give: it uses the newest release it can
verify, and that is ${esc(release.version)}. Check that a newer release has actually been published before
running this again.</p></div>`
    : `<div class="okbox"><p style="margin:0"><b>Updated ${before ? "from " + esc(before) + " " : ""}to ${esc(release.version)}.</b>
${confirmed ? "The new version is answering."
  : "The upload finished successfully. The address can take a few minutes to start serving the new version, so open your copy a little later and its page will show " + esc(release.version) + "."}
Your passwords, your credentials, and everything in the record are exactly as they were.
Updates never touch them.</p></div>`
    + (base ? `<div class="actions"><a class="btnlink" href="${esc(base)}/">Open your copy</a></div>` : ""));
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
      const slug = String(body.slug || "").trim();
      if (!slugOk(slug))
        return json({ ok: false, error: "The name needs 3 to 40 characters: lower-case letters, digits, and hyphens, starting and ending with a letter or digit." }, 400);
      const v = rand(32), s = rand(16);
      const q = new URLSearchParams({
        response_type: "code", client_id: CFG.CLIENT_ID, redirect_uri: CFG.REDIRECT,
        scope: CFG.SCOPES.join(" "), state: s,
        code_challenge: await s256(v), code_challenge_method: "S256",
      });
      const cookie = b64url(enc.encode(JSON.stringify({ v, s, slug, mode, t: Date.now() })));
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
          url.searchParams.get("error_description") || err), 200, clear);

      if (!code || !saved || saved.s !== state
          || typeof saved.t !== "number" || Date.now() - saved.t > CFG.COOKIE_MAX_AGE_S * 1000)
        return html(plainPage("This sign-in could not be verified",
          "The reply from Cloudflare does not match a request this browser made recently. Nothing was created. "
          + "Start again from the beginning, in this same tab.", ""), 200, clear);

      const title = saved.mode === "update" ? "Updating your copy" : "Setting up your copy";
      return streamPage(clear, progressShell(title, saved.slug),
        (emit) => saved.mode === "update" ? runUpdate(emit, code, saved) : runInstall(emit, code, saved));
    }

    return html(plainPage("Nothing lives at this address",
      "The installer starts at the front page.", ""), 404);
  },
};

function plainPage(head, what, detail) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(head)}</title><style>${PAGE_CSS}</style></head><body><main>
<p class="eyebrow">Believe in Oakland &middot; installer</p>
<h1>${esc(head)}</h1><p>${esc(what)}</p>
${detail ? `<p class="small mono">${esc(detail)}</p>` : ""}
<p><a href="/">Back to the start</a></p>
</main></body></html>`;
}
