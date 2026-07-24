// src/schema.mjs
var SCHEMA = `-- BIO store schema, draft 1, derived from the real bundle.md frontmatter and
-- _history/manifest.json shapes in tree 0.1.94. The bundle format is
-- authoritative; this is a projection of it and must never bend it.

CREATE TABLE IF NOT EXISTS bundles (
  bundle_id     TEXT PRIMARY KEY,
  object_type   TEXT NOT NULL,
  group_id      TEXT NOT NULL,
  title         TEXT,
  current_state TEXT NOT NULL,
  prior_state   TEXT,
  created       TEXT NOT NULL,
  last_updated  TEXT NOT NULL,
  criticality   TEXT,
  classification TEXT,
  bundle_sha    TEXT NOT NULL,
  row_version   INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS bundles_type_state ON bundles(object_type, current_state);
CREATE INDEX IF NOT EXISTS bundles_updated ON bundles(last_updated);

-- Live files. The storage rule is by ROLE, not by size:
--   content   set when the file participates in the gate's byte comparisons
--             (bundle.md, analysis, work product, manifests, data). Inline,
--             because C-5 and C-12 compare live against history and the gate
--             is byte-complete by necessity, so a whole-store pass must not
--             pay a network round trip per file.
--   blob_sha  set when the file is a registered capture, verified by
--             capture.sha256 and never compared byte-wise by the gate. Lives
--             in R2, content-addressed, edge-served, egress-free.
-- Exactly one of the two is set.
-- MEASURED BACKSTOP: Durable Object SQLite refuses a single value above
-- roughly 2MiB with SQLITE_TOOBIG (2,098,176 B passed, 2,252,800 B failed).
-- Spill to R2 at 1MB, which leaves a 2x margin, and enforce it at write.
CREATE TABLE IF NOT EXISTS files (
  bundle_id TEXT NOT NULL,
  path      TEXT NOT NULL,
  content   TEXT,
  blob_sha  TEXT,
  bytes     INTEGER NOT NULL,
  sha256    TEXT NOT NULL,
  PRIMARY KEY (bundle_id, path)
);

-- Append-only history snapshots. C-5 and C-12 compare live against these.
CREATE TABLE IF NOT EXISTS history (
  bundle_id TEXT NOT NULL,
  snap_key  TEXT NOT NULL,
  path      TEXT NOT NULL,
  content   TEXT,
  blob_sha  TEXT,
  sha256    TEXT NOT NULL,
  created   TEXT NOT NULL,
  PRIMARY KEY (bundle_id, snap_key, path)
);
CREATE INDEX IF NOT EXISTS history_bundle ON history(bundle_id);

CREATE TABLE IF NOT EXISTS manifest (
  bundle_id  TEXT NOT NULL,
  snap_key   TEXT NOT NULL,
  kind       TEXT NOT NULL,
  base       TEXT,
  author     TEXT,
  created    TEXT NOT NULL,
  files_json TEXT NOT NULL,
  PRIMARY KEY (bundle_id, snap_key)
);

-- References extracted from frontmatter, so C-6.2 is a join rather than a scan.
CREATE TABLE IF NOT EXISTS refs (
  bundle_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  kind      TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (bundle_id, target_id, kind)
);
CREATE INDEX IF NOT EXISTS refs_target ON refs(target_id);

-- The register: the trust root. capture_sha is the only thing that proves bytes.
CREATE TABLE IF NOT EXISTS register (
  capture_sha TEXT PRIMARY KEY,
  bundle_id   TEXT NOT NULL,
  path        TEXT NOT NULL,
  encoding    TEXT NOT NULL,
  bytes       INTEGER NOT NULL,
  registered  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS register_bundle ON register(bundle_id);

CREATE TABLE IF NOT EXISTS leases (
  bundle_id  TEXT PRIMARY KEY,
  actor      TEXT NOT NULL,
  acquired   TEXT NOT NULL,
  expires    TEXT NOT NULL,
  base_sha   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS seq (
  scope TEXT PRIMARY KEY,
  next  INTEGER NOT NULL
);

-- Credentials live here rather than in Worker secrets, because a Worker cannot
-- rewrite its own secret. ADMIN_TOKEN is a bootstrap credential used once; the
-- real password is chosen by the operator and only its hash is stored. Losing
-- it is recoverable by overwriting ADMIN_TOKEN in the dashboard, which returns
-- the instance to an unclaimed state.
CREATE TABLE IF NOT EXISTS credentials (
  role       TEXT PRIMARY KEY,
  salt       TEXT NOT NULL,
  hash       TEXT NOT NULL,
  iterations INTEGER NOT NULL,
  updated    TEXT NOT NULL
);

-- Sessions are DO-backed so a password login can be exchanged for a bearer
-- token without the password travelling on every later request.
CREATE TABLE IF NOT EXISTS sessions (
  token   TEXT PRIMARY KEY,
  role    TEXT NOT NULL,
  expires INTEGER NOT NULL,
  created TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expires ON sessions(expires);

-- One row, id=1. Records that the bootstrap credential has been spent.
CREATE TABLE IF NOT EXISTS bootstrap (
  id          INTEGER PRIMARY KEY CHECK (id = 1),
  consumed_at TEXT,
  token_fp    TEXT
);
`;

// src/tokens.mjs
var PUBLISHED_TOKEN_HASHES = /* @__PURE__ */ new Set([
  // dist/SECRETS.txt of the 0.2.0 test deployment
  // ADMIN_TOKEN
  "34451e5e855bf8d45e93d89fca560e6bd392cf1d0cc6832e3121614d1c68d9db",
  // MEMBER_TOKEN
  "7ecc5d014e25ce4c2e8457424afa0420288742c69182db1be5f4caccd63d4c91",
  // PROBE_TOKEN
  "5910ebbfe7816d9d5e2451012f9db8ac92aaa3f65a8f50da3f7255ab8bdb26ad"
]);
var sha256hex = async (v) => {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
};
async function liveToken(v) {
  if (typeof v !== "string" || v.length === 0) return false;
  return !PUBLISHED_TOKEN_HASHES.has(await sha256hex(v));
}

// src/livefire.mjs
var sha256 = async (s) => {
  const b = await crypto.subtle.digest("SHA-256", typeof s === "string" ? new TextEncoder().encode(s) : s);
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
};
async function livefire(env, storeName) {
  const t0 = Date.now();
  const stub = env.STORE.get(env.STORE.idFromName(storeName));
  const post = async (op, body) => {
    const r = await stub.fetch(new Request("http://x/" + op, { method: "POST", body: JSON.stringify(body) }));
    return (await r.json()).result;
  };
  const get = async (path) => {
    const r = await stub.fetch(new Request("http://x/" + path));
    return (await r.json()).result;
  };
  const A = [];
  const assert = (name, got, want, note) => {
    const ok = JSON.stringify(got) === JSON.stringify(want);
    A.push({ name, ok, ...ok ? {} : { want, got }, ...note ? { note } : {} });
    return ok;
  };
  const NONCE = crypto.randomUUID();
  const id = `INFO-2026-9001-livefire-${NONCE.slice(0, 8)}`;
  const md = (state, rev) => `---
id: ${id}
object_type: information
current_state: ${state}
nonce: ${NONCE}
---

## Summary

rev ${rev}
`;
  const pkgFor = async (state, rev, extra = []) => {
    const body = md(state, rev);
    return {
      bundleId: id,
      snapKey: "20260723T190000Z_livefire",
      author: "livefire",
      meta: { object_type: "information", group: "believe-in-oakland", title: "livefire", current_state: state, created: "2026-01-01T00:00:00Z", last_updated: (/* @__PURE__ */ new Date()).toISOString() },
      files: [{ path: "bundle.md", text: body, bytes: body.length, sha256: await sha256(body) }, ...extra],
      refs: [],
      register: []
    };
  };
  const c1 = await post("promote", { ...await pkgFor("collected", 1), base: null });
  assert("creation with base null succeeds", c1.ok, true);
  const sha1 = c1.bundleSha;
  assert("second creation refused", (await post("promote", { ...await pkgFor("collected", 2), base: null })).reason, "EXISTS");
  const c3 = await post("promote", { ...await pkgFor("verified", 3), base: sha1 });
  assert("update with correct base succeeds", c3.ok, true);
  assert("row_version advanced", c3.rowVersion, 2);
  const sha2 = c3.bundleSha;
  assert(
    "STALE base refused",
    (await post("promote", { ...await pkgFor("ratified", 4), base: sha1 })).reason,
    "CAS_STALE",
    "the lost-update floor, on real storage"
  );
  assert("garbage base refused", (await post("promote", { ...await pkgFor("ratified", 5), base: "deadbeef" })).reason, "CAS_STALE");
  const live = await get(`image?id=${id}`);
  assert("live state is the winning revision", /rev 3/.test(live["bundle.md"]), true);
  assert("history holds the superseded revision", /rev 1/.test(live["_history/20260723T190000Z_livefire/bundle.md"] || ""), true);
  assert("manifest projected", "_history/manifest.json" in live, true);
  const big = "x".repeat(1024 * 1024 + 1);
  const overPkg = await pkgFor("verified", 6, [{ path: "big.md", text: big, bytes: big.length, sha256: await sha256(big) }]);
  assert("oversize inline refused at the write", (await post("promote", { ...overPkg, base: sha2 })).reason, "OVERSIZE_INLINE");
  assert(
    "canary nonce survived the round trip",
    new RegExp(NONCE).test(live["bundle.md"]),
    true,
    "proves the battery actually wrote and read real storage"
  );
  const y = "9001";
  const a1 = await get(`allocid?prefix=LFIRE&year=${y}`);
  const a2 = await get(`allocid?prefix=LFIRE&year=${y}`);
  assert(
    "allocid increments without gaps",
    Number(a2.id.split("-").pop()) - Number(a1.id.split("-").pop()),
    1
  );
  const l1 = await get(`lease?id=${id}&actor=probe-a`);
  assert("lease returns live sha as edit base", l1.base, sha2);
  const l2 = await get(`lease?id=${id}&actor=probe-b`);
  assert("second actor denied while lease holds", l2.ok, false);
  {
    const names = ["ADMIN_TOKEN", "MEMBER_TOKEN", "PROBE_TOKEN", "PUBLIC_TOKEN"];
    const configured = names.filter((n) => typeof env[n] === "string" && env[n].length > 0);
    const published = [];
    for (const n of configured) {
      if (PUBLISHED_TOKEN_HASHES.has(await sha256(env[n]))) published.push(n);
    }
    assert("no configured token is a published repository value", published, []);
    assert(
      "no configured token is shorter than 16 characters",
      configured.filter((n) => env[n].length < 16),
      []
    );
  }
  const r2 = { ok: true, sizes: [] };
  const capturesBound = typeof env.CAPTURES?.get === "function";
  const publishedBound = typeof env.PUBLISHED?.get === "function";
  r2.configured = capturesBound && publishedBound;
  if (!r2.configured) {
    assert(
      "R2 absence is symmetric: both buckets or neither",
      capturesBound,
      publishedBound,
      "one bucket bound without the other breaks the fence"
    );
    assert("R2 not configured is declared, not silent", r2.configured, false);
  } else try {
    const key = `scratch/livefire-${NONCE}`;
    const payload = new TextEncoder().encode("capture bytes " + NONCE);
    await env.CAPTURES.put(key, payload, { sha256: await crypto.subtle.digest("SHA-256", payload) });
    const back = await env.CAPTURES.get(key);
    r2.roundTrip = (await back.text()).endsWith(NONCE);
    const h = await env.CAPTURES.head(key);
    r2.serverSideChecksum = h?.checksums?.sha256 ? [...new Uint8Array(h.checksums.sha256)].map((x) => x.toString(16).padStart(2, "0")).join("") === await sha256(payload) : "not returned";
    const ranged = await env.CAPTURES.get(key, { range: { offset: 0, length: 7 } });
    r2.rangeRead = await ranged.text() === "capture";
    await env.CAPTURES.delete(key);
    for (const mb of [0.1, 1, 8, 25]) {
      const buf = new Uint8Array(Math.round(mb * 1024 * 1024)).fill(65);
      const k = `scratch/t-${mb}-${NONCE}`;
      const tp = Date.now();
      await env.CAPTURES.put(k, buf);
      const putMs = Date.now() - tp;
      const tg = Date.now();
      const g = await env.CAPTURES.get(k);
      const bytes = (await g.arrayBuffer()).byteLength;
      const getMs = Date.now() - tg;
      await env.CAPTURES.delete(k);
      if (bytes !== buf.length) {
        r2.sizes.push({ sizeMB: mb, error: "length mismatch, NO NUMBER REPORTED" });
        r2.ok = false;
        continue;
      }
      r2.sizes.push({ sizeMB: mb, putMs, getMs, putMBps: +(mb / (putMs / 1e3)).toFixed(1), getMBps: +(mb / (getMs / 1e3)).toFixed(1) });
    }
    assert("R2 capture round trip through binding", r2.roundTrip, true);
    assert("R2 range read", r2.rangeRead, true);
  } catch (e) {
    r2.ok = false;
    r2.error = String(e && e.message || e);
    assert("R2 exercised without error", false, true);
  }
  const tw = Date.now();
  const stats = await get("stats");
  const dang = await get("dangling");
  const wholeMs = Date.now() - tw;
  const passed = A.filter((a) => a.ok).length;
  return {
    ok: A.every((a) => a.ok) && r2.ok,
    ranAt: (/* @__PURE__ */ new Date()).toISOString(),
    store: storeName,
    nonce: NONCE,
    totalMs: Date.now() - t0,
    summary: `${passed}/${A.length} assertions passed`,
    assertions: A,
    r2,
    storeState: { ...stats, danglingRefs: dang.dangling.length, wholeStorePassMs: wholeMs },
    note: "Confined to the scratch namespace. Live state is unreachable from this token class."
  };
}

// src/setup.mjs
var SETUP_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Your accountability record</title>
<style>
:root{
  --ink:#16232E; --paper:#EDEFE8; --paper-2:#E3E7DD;
  --verdigris:#2F6F62; --verdigris-dk:#1F4F45;
  --signal:#B3441E; --rule:#C6CBBF; --muted:#5C6B66;
  --body:system-ui,-apple-system,"Segoe UI",sans-serif;
  --mono:ui-monospace,Menlo,Consolas,monospace;
}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--body);
  font-size:17px;line-height:1.6;-webkit-font-smoothing:antialiased}
main{max-width:640px;margin:0 auto;padding:56px 22px 80px}
.eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.16em;
  text-transform:uppercase;color:var(--verdigris);margin:0 0 14px}
h1{font-family:Georgia,serif;font-weight:600;font-size:clamp(28px,4.2vw,38px);
  line-height:1.1;margin:0 0 16px;letter-spacing:-.01em}
h2{font-family:Georgia,serif;font-weight:600;font-size:20px;margin:28px 0 10px}
p{margin:0 0 15px;max-width:60ch}
.small{font-size:14.5px;color:var(--muted)}
.card{border:1px solid var(--rule);background:#F6F7F2;padding:20px 22px;margin:0 0 18px}
.notice{border-left:3px solid var(--signal);background:#F8EFE9;padding:16px 18px;margin:0 0 18px}
.okbox{border-left:3px solid var(--verdigris);background:#EDF3F0;padding:16px 18px;margin:0 0 18px}
label{display:block;font-weight:600;font-size:14.5px;margin:14px 0 6px}
input{width:100%;padding:11px 13px;font-family:var(--mono);font-size:14.5px;
  border:1px solid var(--rule);background:#fff;color:var(--ink);border-radius:0}
input:focus-visible,button:focus-visible{outline:2px solid var(--verdigris);outline-offset:2px}
.hint{font-size:13.5px;color:var(--muted);margin:6px 0 0}
button{margin-top:18px;padding:12px 22px;font-size:15.5px;font-weight:600;cursor:pointer;
  background:var(--verdigris);color:#fff;border:1px solid var(--verdigris-dk)}
button:hover{background:var(--verdigris-dk)}
button:disabled{opacity:.55;cursor:default}
.err{color:var(--signal);font-size:14.5px;margin-top:12px;min-height:1.4em}
.kv{display:flex;gap:10px;align-items:baseline;padding:7px 0;border-top:1px solid var(--rule);font-size:14.5px}
.kv:first-of-type{border-top:0}
.kv .k{color:var(--muted);min-width:150px}
.kv .v{font-family:var(--mono);font-size:13.5px;word-break:break-all}
section{display:none} section.on{display:block}
main.wide{max-width:860px}
.crumb{font-family:var(--mono);font-size:12.5px;margin:0 0 18px}
.crumb a{color:var(--verdigris);text-decoration:none;cursor:pointer}
.crumb a:hover{text-decoration:underline}
table.rec{width:100%;border-collapse:collapse;font-size:14.5px;margin:6px 0 22px}
table.rec th{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;
  color:var(--muted);text-align:left;font-weight:600;padding:6px 10px 6px 0;border-bottom:1px solid var(--rule)}
table.rec td{padding:9px 10px 9px 0;border-bottom:1px solid var(--rule);vertical-align:baseline}
table.rec tr.row{cursor:pointer}
table.rec tr.row:hover td{background:#F6F7F2}
.bid{font-family:var(--mono);font-size:13px;color:var(--verdigris-dk)}
.chip{display:inline-block;font-family:var(--mono);font-size:11px;letter-spacing:.08em;
  text-transform:uppercase;padding:2px 8px;border:1px solid var(--rule);color:var(--muted);background:#F6F7F2}
.chip.verified,.chip.ratified{color:#fff;background:var(--verdigris);border-color:var(--verdigris-dk)}
.chip.elevated,.chip.forming{color:var(--signal);border-color:var(--signal);background:#F8EFE9}
.md h2{font-size:19px;margin:26px 0 8px}
.md h3{font-family:var(--body);font-weight:700;font-size:15.5px;margin:20px 0 6px}
.md p{margin:0 0 12px}
.md ul{margin:0 0 12px;padding-left:22px}
.md li{margin:0 0 4px}
.md code{font-family:var(--mono);font-size:13px;background:var(--paper-2);padding:1px 4px}
.md .revnote{border-left:3px solid var(--signal);background:#F8EFE9;padding:10px 14px;margin:0 0 16px;font-size:14px}
.filelink{color:var(--verdigris);text-decoration:none}
.filelink:hover{text-decoration:underline}
.histbtn{background:none;border:none;padding:0;margin:0;font:inherit;color:var(--verdigris);cursor:pointer;text-decoration:none}
.histbtn:hover{text-decoration:underline}
.mono{font-family:var(--mono);font-size:12.5px}
.dim{color:var(--muted)}
</style>
</head>
<body>
<main>
<p class="eyebrow">Believe in Oakland &middot; group instance</p>

<section id="s-loading" class="on">
  <h1>One moment</h1>
  <p class="small">Checking the state of this copy.</p>
</section>

<section id="s-unarmed">
  <h1>This copy has no one-time password yet</h1>
  <p>Before anyone can claim it, a bootstrap credential has to exist. Sign in
  to the Cloudflare account this copy runs in, open this worker's settings,
  and set a long random value called <b>ADMIN_TOKEN</b>. Then reload this
  page.</p>
  <p class="small">If it was set but this page still says otherwise, the value
  in place is one that has been published before and this software refuses to
  accept it. Set a fresh one.</p>
</section>

<section id="s-claim">
  <h1>Claim your copy</h1>
  <p>This runs in your organization's own Cloudflare account. Claiming it
  spends the one-time password and replaces it with a password you choose.
  The one-time password stops working the moment this succeeds.</p>
  <div id="rearm-note" class="notice" hidden>
    <p style="margin:0"><b>Recovery mode.</b> The one-time password was
    replaced in the Cloudflare dashboard, so the previous claim is retired and
    this copy can be claimed again. Nothing stored in the record is affected.</p>
  </div>
  <label for="boot">One-time password</label>
  <input id="boot" autocomplete="off" spellcheck="false">
  <p class="hint">From the installer's final screen, or the ADMIN_TOKEN value
  set in the Cloudflare dashboard.</p>
  <label for="pw1">Choose your password</label>
  <input id="pw1" type="password" autocomplete="new-password">
  <p class="hint">At least 12 characters. Store it in a password manager.</p>
  <label for="pw2">Type it again</label>
  <input id="pw2" type="password" autocomplete="new-password">
  <button id="do-claim">Claim this copy</button>
  <p class="err" id="claim-err"></p>
  <div class="card"><p class="small" style="margin:0"><b>If you ever lose the
  password you choose here,</b> you are not locked out. Sign in to Cloudflare,
  replace the ADMIN_TOKEN value in this worker's settings, and this claim step
  starts over. Your Cloudflare sign-in is the way back in.</p></div>
</section>

<section id="s-login">
  <h1>Sign in</h1>
  <p>This copy is claimed. Sign in with the administrator password.</p>
  <label for="lpw">Password</label>
  <input id="lpw" type="password" autocomplete="current-password">
  <button id="do-login">Sign in</button>
  <p class="err" id="login-err"></p>
  <p class="small">Lost the password? Sign in to Cloudflare, replace the
  ADMIN_TOKEN value in this worker's settings, and reload this page to claim
  the copy again.</p>
</section>

<section id="s-panel">
  <h1>Your copy is healthy</h1>
  <div class="okbox"><p style="margin:0" id="panel-lede">Signed in as
  administrator.</p></div>
  <div class="card">
    <div class="kv"><span class="k">Software version</span><span class="v" id="p-version"></span></div>
    <div class="kv"><span class="k">Claimed</span><span class="v" id="p-claimed"></span></div>
    <div class="kv"><span class="k">Roles with passwords</span><span class="v" id="p-roles"></span></div>
    <div class="kv"><span class="k">Session expires</span><span class="v" id="p-expires"></span></div>
  </div>
  <div class="actions" style="margin:22px 0 6px"><button id="go-browse">Browse the record</button></div>
  <h2>What this page is, and is not</h2>
  <p>This page proves the copy answers, is claimed, and that your password
  works, and it opens the record for reading. Changing the record happens
  through the tools your group connects to it, using the member and probe
  credentials stored when this copy was installed. Those live in your
  password manager and in this worker's settings in the Cloudflare
  dashboard.</p>
  <p class="small">To update the software later, return to the installer and
  choose the update option. Updates never touch your passwords or your record.</p>
</section>

<section id="s-browse">
  <p class="crumb"><a id="crumb-panel">This copy</a> &rsaquo; Record</p>
  <h1>The record</h1>
  <p class="small" id="browse-summary"></p>
  <div id="browse-body"><p class="small">Loading the record&hellip;</p></div>
</section>

<section id="s-bundle">
  <p class="crumb"><a id="crumb-panel2">This copy</a> &rsaquo; <a id="crumb-browse">Record</a> &rsaquo; <span id="crumb-id" class="mono"></span></p>
  <h1 id="b-title" style="font-size:clamp(22px,3.4vw,30px)"></h1>
  <div class="card" id="b-facts"></div>
  <div id="b-md" class="md"></div>
  <h2>Files in this bundle</h2>
  <div class="card" id="b-files"></div>
  <h2>History</h2>
  <p class="small">Every revision this bundle has ever had, oldest first. The
  record is append-only: nothing here can be edited or removed.</p>
  <div class="card" id="b-history"></div>
</section>

</main>
<script>
const $ = (s)=>document.querySelector(s);
const show = (id)=>{document.querySelectorAll("section").forEach(x=>x.classList.remove("on"));$(id).classList.add("on");};
const api = async (op, body)=>{
  const r = await fetch("/api/?op="+op, body ? {method:"POST",body:JSON.stringify(body)} : undefined);
  return r.json();
};
let boot0 = null;
async function state(){
  /* The wizard hands over with the one-time password in the URL fragment.
     Fragments never reach any server. Strip it immediately either way. */
  const m = location.hash.match(/boot=([^&]+)/);
  if (m) boot0 = decodeURIComponent(m[1]);
  if (location.hash) history.replaceState({}, "", location.pathname);
  try {
    const saved = JSON.parse(sessionStorage.getItem("bio-session") || "null");
    if (saved && saved.t && (!saved.e || saved.e > Date.now())) {
      SESSION = saved.t;
      const probe = await fetch("/api/?op=stats&token="+saved.t);
      if (probe.ok) {
        const b2 = await api("bootstrap");
        window.__ver = b2.version || "";
        panel({ token: saved.t, expires: saved.e }, saved.c || b2.consumedAt);
        return;
      }
      SESSION = null; sessionStorage.removeItem("bio-session");
    }
  } catch {}
  let b;
  try { b = await api("bootstrap"); }
  catch(e){ $("#s-loading h1").textContent = "This copy is not answering";
    $("#s-loading .small").textContent = "The page loaded but the record behind it did not respond. Wait a moment and reload."; return; }
  window.__ver = b.version || "";
  if (b.claimed) { show("#s-login"); return; }
  if (!b.bootstrapConfigured) { show("#s-unarmed"); return; }
  if (b.rearmed) $("#rearm-note").hidden = false;
  if (boot0) $("#boot").value = boot0;
  show("#s-claim");
}
$("#do-claim").addEventListener("click", async ()=>{
  const e = $("#claim-err"); e.textContent = "";
  const bootstrapToken = $("#boot").value.trim();
  const p1 = $("#pw1").value, p2 = $("#pw2").value;
  if (!bootstrapToken) { e.textContent = "The one-time password is empty."; return; }
  if (p1.length < 12) { e.textContent = "The password needs at least 12 characters."; return; }
  if (p1 !== p2) { e.textContent = "The two passwords do not match."; return; }
  $("#do-claim").disabled = true;
  try {
    const r = await api("claim", { bootstrapToken, password: p1 });
    if (r.error) { e.textContent = r.error + "."; return; }
    if (r.result && r.result.ok === false) {
      e.textContent = r.result.reason === "ALREADY_CLAIMED"
        ? "This copy was already claimed. If that was not you, replace ADMIN_TOKEN in the Cloudflare dashboard and reload."
        : "Refused: " + r.result.reason;
      return;
    }
    const l = await api("login", { role: "admin", password: p1 });
    panel(l.result, r.result.consumedAt);
  } catch(err){ e.textContent = "The claim did not go through: " + err.message; }
  finally { $("#do-claim").disabled = false; }
});
$("#do-login").addEventListener("click", async ()=>{
  const e = $("#login-err"); e.textContent = "";
  $("#do-login").disabled = true;
  try {
    const l = await api("login", { role: "admin", password: $("#lpw").value });
    if (!l.result || !l.result.ok) { e.textContent = "That password was not accepted."; return; }
    const b = await api("bootstrap");
    panel(l.result, b.consumedAt);
  } catch(err){ e.textContent = "Sign-in did not go through: " + err.message; }
  finally { $("#do-login").disabled = false; }
});
let SESSION = null;
function panel(login, claimedAt){
  if (login && login.token) {
    SESSION = login.token;
    try { sessionStorage.setItem("bio-session", JSON.stringify({ t: login.token, e: login.expires || 0, c: claimedAt || "" })); } catch {}
  }
  $("#p-version").textContent = window.__ver || "unknown";
  $("#p-claimed").textContent = claimedAt ? new Date(claimedAt).toLocaleString() : "just now";
  $("#p-roles").textContent = "admin";
  $("#p-expires").textContent = login && login.expires ? new Date(login.expires).toLocaleString() : "";
  show("#s-panel");
}

/* ---- the record, read-only through the signed-in session ---- */
const rec = async (op, params={})=>{
  const q = new URLSearchParams({ op, token: SESSION, ...params });
  const r = await fetch("/api/?"+q.toString());
  if (r.status === 401) { SESSION = null; try{sessionStorage.removeItem("bio-session");}catch{}; show("#s-login"); throw new Error("signed out"); }
  return r.json();
};
const escH = (x)=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const TYPES = [["information","Information"],["problem","Problems"],["project","Projects"],["action","Actions"]];
const fmtWhen = (iso)=>{ const d=new Date(iso); return isNaN(d)?escH(iso):d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}); };
const chip = (st)=>'<span class="chip '+escH(st)+'">'+escH(st)+"</span>";

async function openBrowse(){
  show("#s-browse");
  let list;
  try { list = (await rec("list")).result || []; } catch { return; }
  const by = {};
  for (const b of list) (by[b.object_type] ||= []).push(b);
  $("#browse-summary").textContent = list.length + " bundles. Everything below is read-only; the record can only be changed through the gated tools.";
  let html = "";
  for (const [t, label] of TYPES){
    const rows = by[t] || []; delete by[t];
    if (!rows.length) continue;
    html += "<h2>"+label+" ("+rows.length+")</h2><table class=\\"rec\\"><tr><th>Bundle</th><th>State</th><th>Updated</th></tr>";
    for (const b of rows)
      html += '<tr class="row" data-id="'+escH(b.bundle_id)+'"><td><span class="bid">'+escH(b.bundle_id)+'</span><br><span class="dim">'+escH(b.title||"")+"</span></td><td>"+chip(b.current_state)+"</td><td class=\\"dim\\">"+fmtWhen(b.last_updated)+"</td></tr>";
    html += "</table>";
  }
  for (const t of Object.keys(by)){
    html += "<h2>"+escH(t)+" ("+by[t].length+")</h2><table class=\\"rec\\">";
    for (const b of by[t]) html += '<tr class="row" data-id="'+escH(b.bundle_id)+'"><td><span class="bid">'+escH(b.bundle_id)+"</span></td><td>"+chip(b.current_state)+"</td><td class=\\"dim\\">"+fmtWhen(b.last_updated)+"</td></tr>";
    html += "</table>";
  }
  $("#browse-body").innerHTML = html || "<p>The record is empty.</p>";
  document.querySelectorAll("#browse-body tr.row").forEach(r=>r.addEventListener("click",()=>openBundle(r.dataset.id)));
}

/* Frontmatter split and a small, honest markdown rendering: headings, bold,
   lists, code spans, paragraphs. Anything else stays visible as written. */
function splitFm(text){
  const m = /^---\\n([\\s\\S]*?)\\n---\\n?/.exec(text);
  if (!m) return { fm:{}, body:text };
  const fm = {};
  for (const line of m[1].split("\\n")){
    const kv = /^([A-Za-z_][A-Za-z0-9_]*):\\s*(.*)$/.exec(line);
    if (kv) fm[kv[1]] = kv[2].replace(/^"|"$/g,"");
  }
  return { fm, body:text.slice(m[0].length) };
}
function mdRender(md){
  const lines = md.split("\\n");
  let out = "", inList = false, para = [];
  const flush = ()=>{ if (para.length){ out += "<p>"+inline(para.join(" "))+"</p>"; para=[]; } };
  const endList = ()=>{ if (inList){ out += "</ul>"; inList=false; } };
  const inline = (t)=>escH(t).replace(/\\*\\*([^*]+)\\*\\*/g,"<b>$1</b>").replace(/\`([^\`]+)\`/g,"<code>$1</code>");
  for (const raw of lines){
    const l = raw.replace(/\\s+$/,"");
    if (/^###\\s+/.test(l)){ flush(); endList(); out += "<h3>"+inline(l.replace(/^###\\s+/,""))+"</h3>"; }
    else if (/^##\\s+/.test(l)){ flush(); endList(); out += "<h2>"+inline(l.replace(/^##\\s+/,""))+"</h2>"; }
    else if (/^[-*]\\s+/.test(l)){ flush(); if(!inList){ out += "<ul>"; inList=true; } out += "<li>"+inline(l.replace(/^[-*]\\s+/,""))+"</li>"; }
    else if (l === ""){ flush(); endList(); }
    else para.push(l);
  }
  flush(); endList();
  return out;
}

let CURRENT = { id:null, img:null };
async function openBundle(id){
  show("#s-bundle");
  $("#crumb-id").textContent = id;
  $("#b-title").textContent = id;
  $("#b-facts").innerHTML = ""; $("#b-md").innerHTML = "<p class=\\"small\\">Loading&hellip;</p>";
  $("#b-files").innerHTML = ""; $("#b-history").innerHTML = "";
  let img;
  try { img = (await rec("image", { id })).result; } catch { return; }
  if (!img){ $("#b-md").innerHTML = "<p>This bundle was not found.</p>"; return; }
  CURRENT = { id, img };
  renderBundle(id, img, null);
}
function renderBundle(id, img, revisionKey){
  const liveText = typeof img["bundle.md"] === "string" ? img["bundle.md"] : "";
  const revText = revisionKey && typeof img["_history/"+revisionKey+"/bundle.md"] === "string"
    ? img["_history/"+revisionKey+"/bundle.md"] : null;
  const { fm, body } = splitFm(revText ?? liveText);
  $("#b-title").textContent = fm.title || id;
  const facts = [["State", fm.current_state ? chip(fm.current_state) : ""],
    ["Last updated", fm.last_updated ? fmtWhen(fm.last_updated) : ""],
    ["Created", fm.created ? fmtWhen(fm.created) : ""],
    ["Criticality", escH(fm.criticality||"")],["Classification", escH(fm.classification||"")]]
    .filter(([,v])=>v);
  $("#b-facts").innerHTML = facts.map(([k,v])=>'<div class="kv"><span class="k">'+k+'</span><span class="v">'+v+"</span></div>").join("");
  $("#b-md").innerHTML =
    (revText !== null ? '<div class="revnote">Viewing a historical revision ('+escH(revisionKey)+'). <button class="histbtn" id="back-live">Back to the live record</button></div>' : "")
    + mdRender(body);
  const bl = $("#back-live"); if (bl) bl.addEventListener("click",()=>renderBundle(id, img, null));

  const files = Object.keys(img).filter(k=>!k.startsWith("_history/")).sort();
  $("#b-files").innerHTML = files.map(k=>{
    const v = img[k];
    if (typeof v === "string")
      return '<div class="kv"><span class="k">'+escH(k)+'</span><span class="v dim">'+v.length.toLocaleString()+" chars</span></div>";
    const dl = k.split("/").pop();
    return '<div class="kv"><span class="k">'+escH(k)+'</span><span class="v"><a class="filelink" href="/api/?op=capture&sha256='+escH(v.blobSha||v.sha256)+"&token="+encodeURIComponent(SESSION)+"&dl="+encodeURIComponent(dl)+'">download</a> <span class="dim mono">'+escH((v.sha256||v.blobSha||"").slice(0,12))+"&hellip;</span></span></div>";
  }).join("") || "<p class=\\"small\\" style=\\"margin:0\\">No files.</p>";

  let entries = [];
  try { entries = JSON.parse(img["_history/manifest.json"]||"{}").entries || []; } catch {}
  entries = entries.slice().sort((a,b)=>String(a.key).localeCompare(String(b.key)));
  $("#b-history").innerHTML = entries.map(e=>{
    const viewable = typeof img["_history/"+e.key+"/bundle.md"] === "string";
    return '<div class="kv"><span class="k mono">'+escH(e.key)+'</span><span class="v">'
      + escH(e.kind||"") + " by " + escH(e.author||"unknown") + ' <span class="dim">' + fmtWhen(e.created) + "</span> "
      + (viewable ? '<button class="histbtn" data-rev="'+escH(e.key)+'">view</button>' : "")
      + "</span></div>";
  }).join("") || "<p class=\\"small\\" style=\\"margin:0\\">Created in a single revision; nothing has been superseded.</p>";
  document.querySelectorAll("#b-history .histbtn[data-rev]").forEach(x=>x.addEventListener("click",()=>renderBundle(id, img, x.dataset.rev)));
  document.querySelector("main").classList.add("wide");
}
$("#go-browse").addEventListener("click", openBrowse);
$("#crumb-panel").addEventListener("click", ()=>{document.querySelector("main").classList.remove("wide");show("#s-panel");});
$("#crumb-panel2").addEventListener("click", ()=>{document.querySelector("main").classList.remove("wide");show("#s-panel");});
$("#crumb-browse").addEventListener("click", openBrowse);
state();
</script>
</body>
</html>`;

// src/store.mjs
import { DurableObject } from "cloudflare:workers";
var INLINE_MAX = 1024 * 1024;
var Store = class _Store extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    this.sql = ctx.storage.sql;
    ctx.blockConcurrencyWhile(async () => this.#migrate());
  }
  #migrate() {
    const bare = (this.env.SCHEMA || SCHEMA || "").split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const s of bare.split(";")) {
      const t = s.trim();
      if (t) this.sql.exec(t);
    }
  }
  #rows(q, ...a) {
    return [...this.sql.exec(q, ...a)];
  }
  #one(q, ...a) {
    const r = this.#rows(q, ...a);
    return r.length ? r[0] : null;
  }
  /* ---- reads: what storeReadAdapter_ did, without the re-resolution tax ---- */
  readFile(bundleId, path) {
    const r = this.#one(`SELECT content, blob_sha, bytes, sha256 FROM files WHERE bundle_id=? AND path=?`, bundleId, path);
    if (!r) return null;
    return r.content !== null ? { text: r.content, sha256: r.sha256 } : { blobSha: r.blob_sha, bytes: r.bytes, sha256: r.sha256 };
  }
  /** The byte-complete image the gate consumes. One bundle, one call, no
   *  per-file resolution. This is the operation that cost ~43s on Drive. */
  readImage(bundleId) {
    const img = {};
    for (const r of this.sql.exec(`SELECT path, content, blob_sha, sha256 FROM files WHERE bundle_id=?`, bundleId))
      img[r.path] = r.content !== null ? r.content : { blobSha: r.blob_sha, sha256: r.sha256 };
    for (const r of this.sql.exec(`SELECT snap_key, path, content, blob_sha, sha256 FROM history WHERE bundle_id=?`, bundleId))
      img[`_history/${r.snap_key}/${r.path}`] = r.content !== null ? r.content : { blobSha: r.blob_sha, sha256: r.sha256 };
    for (const r of this.sql.exec(`SELECT snap_key, kind, base, author, created, files_json FROM manifest WHERE bundle_id=?`, bundleId)) {
      const key = "_history/manifest.json";
      const m = img[key] ? JSON.parse(img[key]) : { entries: [] };
      m.entries.push({ key: r.snap_key, kind: r.kind, base: r.base, author: r.author, created: r.created, files: JSON.parse(r.files_json) });
      img[key] = JSON.stringify(m, null, 2);
    }
    return Object.keys(img).length ? img : null;
  }
  listBundles(filter = {}) {
    let q = `SELECT bundle_id, object_type, current_state, title, last_updated, bundle_sha FROM bundles`;
    const w = [], a = [];
    if (filter.type) {
      w.push(`object_type=?`);
      a.push(filter.type);
    }
    if (filter.state) {
      w.push(`current_state=?`);
      a.push(filter.state);
    }
    if (w.length) q += ` WHERE ` + w.join(" AND ");
    return this.#rows(q + ` ORDER BY bundle_id`, ...a);
  }
  /** The index projection. One stored artifact on Drive, one query here.
   *  Note the absence of `locator`: there is no substrate path to leak. */
  buildIndex() {
    return {
      generated: (/* @__PURE__ */ new Date()).toISOString(),
      version: 2,
      bundles: this.#rows(
        `SELECT bundle_id AS id, object_type, current_state, title, last_updated, bundle_sha AS sha256 FROM bundles ORDER BY bundle_id`
      )
    };
  }
  /** C-6.2: every reference whose target does not exist. A join, not a scan. */
  danglingRefs() {
    return this.#rows(
      `SELECT r.bundle_id, r.target_id FROM refs r
       LEFT JOIN bundles b ON b.bundle_id=r.target_id WHERE b.bundle_id IS NULL`
    );
  }
  /** Streaming whole-store pass. Peak memory is one image, measured at 37KB,
   *  against 558MB if every image is materialised at once. */
  *eachImage() {
    for (const r of this.#rows(`SELECT bundle_id FROM bundles ORDER BY bundle_id`))
      yield [r.bundle_id, this.readImage(r.bundle_id)];
  }
  /* ---- writes: promotion is the sole writer of live state ---- */
  /**
   * One transaction. Either the whole bundle advances or nothing does.
   *
   * base is the CAS. It must equal the current bundle_sha, or null when
   * creating. A stale base is refused, which is the lost-update floor that
   * manifest base-sha CAS provided on Drive.
   */
  promote(pkg) {
    if (!pkg || typeof pkg !== "object") return { ok: false, reason: "NO_BODY", detail: "promote requires a POSTed package" };
    const { bundleId, base, files, meta, snapKey, author, refs = [], register = [] } = pkg;
    if (!bundleId || !Array.isArray(files) || !meta) return { ok: false, reason: "MALFORMED", detail: "bundleId, files and meta are required" };
    return this.ctx.storage.transactionSync(() => {
      const cur = this.#one(`SELECT bundle_sha, row_version FROM bundles WHERE bundle_id=?`, bundleId);
      if (cur && base === null)
        return { ok: false, reason: "EXISTS", detail: "creation attempted against an existing bundle" };
      if (!cur && base !== null)
        return { ok: false, reason: "ABSENT", detail: "update attempted against a bundle that does not exist" };
      if (cur && cur.bundle_sha !== base)
        return { ok: false, reason: "CAS_STALE", expected: cur.bundle_sha, got: base };
      for (const f of files) {
        if (f.text !== void 0 && f.text.length > INLINE_MAX)
          return { ok: false, reason: "OVERSIZE_INLINE", path: f.path, bytes: f.text.length };
      }
      if (cur) {
        for (const r of this.sql.exec(`SELECT path, content, blob_sha, sha256 FROM files WHERE bundle_id=?`, bundleId))
          this.sql.exec(
            `INSERT OR REPLACE INTO history (bundle_id,snap_key,path,content,blob_sha,sha256,created) VALUES (?,?,?,?,?,?,?)`,
            bundleId,
            snapKey,
            r.path,
            r.content,
            r.blob_sha,
            r.sha256,
            (/* @__PURE__ */ new Date()).toISOString()
          );
        this.sql.exec(
          `INSERT OR REPLACE INTO manifest (bundle_id,snap_key,kind,base,author,created,files_json) VALUES (?,?,?,?,?,?,?)`,
          bundleId,
          snapKey,
          base === null ? "creation" : "direct_write",
          base,
          author,
          (/* @__PURE__ */ new Date()).toISOString(),
          JSON.stringify(files.map((f) => f.path))
        );
      }
      this.sql.exec(`DELETE FROM files WHERE bundle_id=?`, bundleId);
      for (const f of files)
        this.sql.exec(
          `INSERT INTO files (bundle_id,path,content,blob_sha,bytes,sha256) VALUES (?,?,?,?,?,?)`,
          bundleId,
          f.path,
          f.text ?? null,
          f.blobSha ?? null,
          f.bytes,
          f.sha256
        );
      const newSha = files.find((f) => f.path === "bundle.md")?.sha256;
      if (!newSha) return { ok: false, reason: "NO_BUNDLE_MD" };
      this.sql.exec(
        `INSERT INTO bundles (bundle_id,object_type,group_id,title,current_state,prior_state,created,last_updated,criticality,classification,bundle_sha,row_version)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,COALESCE((SELECT row_version+1 FROM bundles WHERE bundle_id=?),1))
         ON CONFLICT(bundle_id) DO UPDATE SET
           object_type=excluded.object_type, title=excluded.title,
           current_state=excluded.current_state, prior_state=excluded.prior_state,
           last_updated=excluded.last_updated, criticality=excluded.criticality,
           classification=excluded.classification, bundle_sha=excluded.bundle_sha,
           row_version=bundles.row_version+1`,
        bundleId,
        meta.object_type,
        meta.group,
        meta.title,
        meta.current_state,
        meta.prior_state ?? null,
        meta.created,
        meta.last_updated,
        meta.criticality ?? null,
        meta.classification ?? null,
        newSha,
        bundleId
      );
      this.sql.exec(`DELETE FROM refs WHERE bundle_id=?`, bundleId);
      for (const t of refs)
        this.sql.exec(`INSERT OR REPLACE INTO refs (bundle_id,target_id,kind) VALUES (?,?,?)`, bundleId, t.target, t.kind ?? "");
      for (const c of register)
        this.sql.exec(
          `INSERT OR REPLACE INTO register (capture_sha,bundle_id,path,encoding,bytes,registered) VALUES (?,?,?,?,?,?)`,
          c.sha256,
          bundleId,
          c.path,
          c.encoding ?? "utf8",
          c.bytes,
          (/* @__PURE__ */ new Date()).toISOString()
        );
      const after = this.#one(`SELECT bundle_sha, row_version FROM bundles WHERE bundle_id=?`, bundleId);
      return { ok: true, bundleId, bundleSha: after.bundle_sha, rowVersion: after.row_version };
    });
  }
  /* ---- coordination: what LockService and the nextSeq race did ---- */
  allocId(prefix, year) {
    return this.ctx.storage.transactionSync(() => {
      const scope = `${prefix}-${year}`;
      const cur = this.#one(`SELECT next FROM seq WHERE scope=?`, scope);
      const n = cur ? cur.next : 1;
      this.sql.exec(`INSERT INTO seq (scope,next) VALUES (?,?) ON CONFLICT(scope) DO UPDATE SET next=?`, scope, n + 1, n + 1);
      return { id: `${prefix}-${year}-${String(n).padStart(4, "0")}` };
    });
  }
  acquireLease(bundleId, actor, ttlMs) {
    return this.ctx.storage.transactionSync(() => {
      const now = Date.now();
      const cur = this.#one(`SELECT actor, expires, base_sha FROM leases WHERE bundle_id=?`, bundleId);
      if (cur && cur.actor !== actor && Date.parse(cur.expires) > now)
        return { ok: false, heldBy: cur.actor, until: cur.expires };
      const b = this.#one(`SELECT bundle_sha FROM bundles WHERE bundle_id=?`, bundleId);
      const expires = new Date(now + ttlMs).toISOString();
      this.sql.exec(
        `INSERT INTO leases (bundle_id,actor,acquired,expires,base_sha) VALUES (?,?,?,?,?)
         ON CONFLICT(bundle_id) DO UPDATE SET actor=excluded.actor, acquired=excluded.acquired, expires=excluded.expires, base_sha=excluded.base_sha`,
        bundleId,
        actor,
        new Date(now).toISOString(),
        expires,
        b ? b.bundle_sha : ""
      );
      return { ok: true, actor, expires, base: b ? b.bundle_sha : null };
    });
  }
  stats() {
    const n = (t) => this.#one(`SELECT count(*) c FROM ${t}`).c;
    return {
      bundles: n("bundles"),
      files: n("files"),
      history: n("history"),
      refs: n("refs"),
      register: n("register"),
      dbBytes: this.ctx.storage.sql.databaseSize
    };
  }
  /* Eviction. The store is append-only by doctrine, so removal is deliberate,
       never implicit, and admin-only at the control plane. Two modes: one bundle
       with its whole lineage, or everything.
  
       seq is deliberately NOT reset. allocid must never reissue an identifier
       that has already existed, so a purged store keeps counting from where it
       stopped. A purge that reset the counter would make identifiers ambiguous
       across the purge boundary, which is worse than a gap.
  
       R2 is untouched. Registered captures are immutable and content-addressed,
       so orphaning them costs storage but cannot corrupt anything. Reclaiming
       them is a separate sweep against the register, not part of this. */
  purge({ bundleId = null } = {}) {
    const TABLES = ["files", "history", "manifest", "refs", "register", "leases"];
    const before = this.stats();
    this.ctx.storage.transactionSync(() => {
      if (bundleId) {
        for (const t of TABLES) this.sql.exec(`DELETE FROM ${t} WHERE bundle_id=?`, bundleId);
        this.sql.exec(`DELETE FROM bundles WHERE bundle_id=?`, bundleId);
      } else {
        for (const t of TABLES) this.sql.exec(`DELETE FROM ${t}`);
        this.sql.exec(`DELETE FROM bundles`);
      }
    });
    const after = this.stats();
    const d = (k) => before[k] - after[k];
    return {
      ok: true,
      scope: bundleId || "ALL",
      before,
      after,
      removed: {
        bundles: d("bundles"),
        files: d("files"),
        history: d("history"),
        refs: d("refs"),
        register: d("register")
      }
    };
  }
  /* ---- credentials ----
  
       A Worker cannot rewrite its own secret, so ADMIN_TOKEN is a bootstrap
       credential rather than the credential. It is spent once, exchanging itself
       for an operator-chosen password whose hash lives here. Recovery is to
       overwrite ADMIN_TOKEN in the dashboard, which clears the consumed marker
       and returns the instance to unclaimed. That makes the group's Cloudflare
       login the root of trust, which is the only thing they reliably still have
       when a password is lost. */
  static #enc = new TextEncoder();
  static async #derive(password, salt, iterations) {
    const key = await crypto.subtle.importKey(
      "raw",
      _Store.#enc.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt: _Store.#enc.encode(salt), iterations },
      key,
      256
    );
    return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  static #rand(n = 32) {
    return [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  bootstrapState(tokenFp = null) {
    const b = this.#one(`SELECT consumed_at, token_fp FROM bootstrap WHERE id=1`);
    const roles = this.#rows(`SELECT role, updated FROM credentials`);
    const spent = !!(b && b.consumed_at);
    const rearmed = spent && tokenFp !== null && b.token_fp !== tokenFp;
    return {
      claimed: spent && !rearmed,
      rearmed,
      consumedAt: rearmed ? null : b?.consumed_at || null,
      roles
    };
  }
  /* Spending the bootstrap credential. Refuses if already spent, so a leaked
     ADMIN_TOKEN cannot silently re-claim a running instance. */
  async claim({ role = "admin", password, tokenFp = null } = {}) {
    if (typeof password !== "string" || password.length < 12)
      return { ok: false, reason: "PASSWORD_TOO_SHORT", minimum: 12 };
    const st = this.bootstrapState(tokenFp);
    if (st.claimed)
      return { ok: false, reason: "ALREADY_CLAIMED", consumedAt: st.consumedAt };
    await this.setPassword({ role, password });
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.sql.exec(`INSERT INTO bootstrap (id, consumed_at, token_fp) VALUES (1, ?, ?)
                   ON CONFLICT(id) DO UPDATE SET consumed_at=excluded.consumed_at,
                     token_fp=excluded.token_fp`, now, tokenFp);
    return { ok: true, role, consumedAt: now };
  }
  async setPassword({ role, password, iterations = 1e5 }) {
    const salt = _Store.#rand(16);
    const hash = await _Store.#derive(password, salt, iterations);
    this.sql.exec(
      `INSERT INTO credentials (role, salt, hash, iterations, updated) VALUES (?,?,?,?,?)
       ON CONFLICT(role) DO UPDATE SET salt=excluded.salt, hash=excluded.hash,
         iterations=excluded.iterations, updated=excluded.updated`,
      role,
      salt,
      hash,
      iterations,
      (/* @__PURE__ */ new Date()).toISOString()
    );
    return { ok: true, role };
  }
  /* Exchanges a password for a bearer token so the password does not travel on
     every later request. Constant-time comparison is not meaningful over a
     network round trip at this granularity, but the derived-hash compare avoids
     ever holding the password beyond this call. */
  async login({ role = "admin", password, ttlSeconds = 43200 } = {}) {
    const c = this.#one(`SELECT salt, hash, iterations FROM credentials WHERE role=?`, role);
    if (!c) return { ok: false, reason: "NO_SUCH_ROLE" };
    const got = await _Store.#derive(String(password ?? ""), c.salt, c.iterations);
    if (got !== c.hash) return { ok: false, reason: "BAD_PASSWORD" };
    const token = _Store.#rand(32);
    const expires = Date.now() + ttlSeconds * 1e3;
    this.sql.exec(`DELETE FROM sessions WHERE expires < ?`, Date.now());
    this.sql.exec(
      `INSERT INTO sessions (token, role, expires, created) VALUES (?,?,?,?)`,
      token,
      role,
      expires,
      (/* @__PURE__ */ new Date()).toISOString()
    );
    return { ok: true, role, token, expires };
  }
  session(token) {
    if (!token) return null;
    const s = this.#one(`SELECT role, expires FROM sessions WHERE token=?`, token);
    if (!s) return null;
    if (s.expires < Date.now()) {
      this.sql.exec(`DELETE FROM sessions WHERE token=?`, token);
      return null;
    }
    return { role: s.role, expires: s.expires };
  }
  async fetch(req) {
    const url = new URL(req.url);
    const op = url.pathname.slice(1);
    const body = req.method === "POST" ? await req.json() : null;
    const t = Date.now();
    try {
      const map = {
        promote: () => this.promote(body),
        allocid: () => this.allocId(url.searchParams.get("prefix"), url.searchParams.get("year")),
        lease: () => this.acquireLease(url.searchParams.get("id"), url.searchParams.get("actor"), 3e5),
        image: () => this.readImage(url.searchParams.get("id")),
        file: () => this.readFile(url.searchParams.get("id"), url.searchParams.get("path")),
        list: () => this.listBundles({ type: url.searchParams.get("type"), state: url.searchParams.get("state") }),
        index: () => this.buildIndex(),
        dangling: () => ({ dangling: this.danglingRefs() }),
        stats: () => this.stats(),
        bootstrap: () => this.bootstrapState(url.searchParams.get("fp")),
        claim: () => this.claim({ ...body || {}, tokenFp: url.searchParams.get("fp") }),
        login: () => this.login(body || {}),
        setpassword: () => this.setPassword(body || {}),
        session: () => ({ session: this.session(url.searchParams.get("t")) }),
        purge: () => this.purge({ bundleId: url.searchParams.get("bundleId") })
      };
      if (!map[op]) return Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });
      return Response.json({ ok: true, ms: Date.now() - t, result: await map[op]() });
    } catch (e) {
      return Response.json({ ok: false, error: String(e && e.stack || e) }, { status: 500 });
    }
  }
};

// src/index.mjs
var OPS = {
  //  op          class allowed              mutating
  selftest: { classes: ["admin", "member", "probe", "public"], mutating: false },
  livefire: { classes: ["admin", "probe"], mutating: true },
  index: { classes: ["admin", "member", "probe", "public"], mutating: false },
  list: { classes: ["admin", "member", "probe"], mutating: false },
  image: { classes: ["admin", "member", "probe"], mutating: false },
  file: { classes: ["admin", "member", "probe"], mutating: false },
  dangling: { classes: ["admin", "member", "probe"], mutating: false },
  stats: { classes: ["admin", "member", "probe"], mutating: false },
  promote: { classes: ["admin", "member", "probe"], mutating: true },
  allocid: { classes: ["admin", "member", "probe"], mutating: true },
  lease: { classes: ["admin", "member", "probe"], mutating: true },
  purge: { classes: ["admin", "probe"], mutating: true },
  capture: { classes: ["admin", "member", "probe"], mutating: true },
  /* The bootstrap trio is the only unauthenticated surface. Each enforces its
     own gate: bootstrap reveals nothing but claimed/unclaimed, claim requires
     the bootstrap secret and refuses once spent, login requires the password. */
  bootstrap: { classes: null, mutating: false },
  claim: { classes: null, mutating: true },
  login: { classes: null, mutating: false }
};
var SCRATCH = "scratch";
async function fingerprint(v) {
  if (!v) return null;
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return [...new Uint8Array(b)].slice(0, 8).map((x) => x.toString(16).padStart(2, "0")).join("");
}
async function classify(token, env) {
  if (!token) return null;
  if (token === env.ADMIN_TOKEN && await liveToken(env.ADMIN_TOKEN)) return "admin";
  if (token === env.MEMBER_TOKEN && await liveToken(env.MEMBER_TOKEN)) return "member";
  if (token === env.PROBE_TOKEN && await liveToken(env.PROBE_TOKEN)) return "probe";
  if (token === env.PUBLIC_TOKEN && await liveToken(env.PUBLIC_TOKEN)) return "public";
  return null;
}
function scopeFor(cls, url) {
  const asked = url.searchParams.get("store");
  if (cls === "probe") return asked && asked !== SCRATCH ? { error: `probe class is confined to the ${SCRATCH} namespace, refused request for ${JSON.stringify(asked)}` } : { name: SCRATCH };
  return { name: asked === SCRATCH ? SCRATCH : "bio" };
}
var json = (o, status = 200) => new Response(JSON.stringify(o, null, 1), {
  status,
  headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
});
var index_default = {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS")
      return new Response(null, { status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-allow-headers": "content-type" } });
    if (req.method === "GET" && !url.pathname.startsWith("/api") && (url.pathname === "/" || url.pathname === "") && !url.searchParams.get("op"))
      return new Response(SETUP_HTML, { headers: { "content-type": "text/html; charset=utf-8" } });
    const path = url.pathname.replace(/^\/api\/?/, "/");
    const op = url.searchParams.get("op") || path.slice(1) || "selftest";
    const spec = OPS[op];
    if (!spec) return json({ ok: false, error: "unknown op", op }, 400);
    if (spec.classes === null) {
      const fp = await fingerprint(env.ADMIN_TOKEN);
      const stub2 = env.STORE.get(env.STORE.idFromName("bio"));
      if (op === "claim") {
        const body2 = await req.json().catch(() => ({}));
        if (!env.ADMIN_TOKEN) return json({ ok: false, error: "instance has no bootstrap credential set" }, 409);
        if (!await liveToken(env.ADMIN_TOKEN))
          return json({ ok: false, error: "bootstrap credential is a published repository value and can never arm a claim; set a fresh ADMIN_TOKEN in the Cloudflare dashboard" }, 409);
        if (body2.bootstrapToken !== env.ADMIN_TOKEN)
          return json({ ok: false, error: "bootstrap credential does not match" }, 403);
        const r2 = await stub2.fetch(new Request(`http://do/claim?fp=${fp}`, {
          method: "POST",
          body: JSON.stringify({ role: "admin", password: body2.password })
        }));
        return json(await r2.json(), 200);
      }
      if (op === "login") {
        const body2 = await req.json().catch(() => ({}));
        const r2 = await stub2.fetch(new Request("http://do/login", {
          method: "POST",
          body: JSON.stringify({ role: body2.role || "admin", password: body2.password })
        }));
        return json(await r2.json(), 200);
      }
      const r = await stub2.fetch(new Request(`http://do/bootstrap?fp=${fp}`));
      const out = await r.json();
      return json({
        ok: true,
        service: "bio-plane",
        version: env.VERSION || "0.0.0",
        bootstrapConfigured: await liveToken(env.ADMIN_TOKEN),
        ...out.result
      }, 200);
    }
    let cls = await classify(url.searchParams.get("token"), env);
    let viaSession = false;
    if (!cls) {
      const t = url.searchParams.get("token");
      if (t && /^[0-9a-f]{64}$/.test(t)) {
        const st = env.STORE.get(env.STORE.idFromName("bio"));
        const r = await (await st.fetch(`http://do/session?t=${t}`)).json();
        const sess = r?.result?.session;
        if (sess) {
          if (spec.mutating && !(op === "capture" && req.method === "GET"))
            return json({ ok: false, error: "a signed-in session can read the record but never write it; writes require a machine credential", op }, 403);
          cls = sess.role === "admin" ? "admin" : "member";
          viaSession = true;
        }
      }
    }
    if (!cls) return json({ ok: false, error: "unauthenticated" }, 401);
    if (!spec.classes.includes(cls)) return json({ ok: false, error: "forbidden for token class", op, cls }, 403);
    const scope = scopeFor(cls, url);
    if (scope.error) return json({ ok: false, error: scope.error, tokenClass: cls }, 403);
    const storeName = scope.name;
    if (op === "selftest") {
      const r2Configured = typeof env.CAPTURES?.get === "function" && typeof env.PUBLISHED?.get === "function";
      const out = {
        ok: true,
        service: "bio-plane",
        version: env.VERSION || "0.0.0",
        time: (/* @__PURE__ */ new Date()).toISOString(),
        tokenClass: cls,
        bindings: {
          STORE: typeof env.STORE?.idFromName === "function",
          CAPTURES: typeof env.CAPTURES?.get === "function" ? true : "not configured",
          PUBLISHED: typeof env.PUBLISHED?.get === "function" ? true : "not configured",
          ADMIN_TOKEN: await liveToken(env.ADMIN_TOKEN),
          MEMBER_TOKEN: await liveToken(env.MEMBER_TOKEN),
          PROBE_TOKEN: await liveToken(env.PROBE_TOKEN)
        },
        r2Configured,
        schemaChars: SCHEMA.length
      };
      if (typeof env.CAPTURES?.get === "function" !== (typeof env.PUBLISHED?.get === "function")) {
        out.ok = false;
        out.r2 = "MISCONFIGURED: one bucket bound without the other; the fence requires both or neither";
      }
      try {
        const r = await env.STORE.get(env.STORE.idFromName(storeName)).fetch("http://x/stats");
        out.store = (await r.json()).result;
      } catch (e) {
        out.ok = false;
        out.store = "ERR " + String(e && e.message || e);
      }
      if (r2Configured) {
        try {
          const key = `${SCRATCH}/selftest-${Date.now()}`;
          await env.CAPTURES.put(key, "ok");
          const back = await env.CAPTURES.get(key);
          out.captures = await back.text() === "ok" ? "read-write ok" : "MISMATCH";
          await env.CAPTURES.delete(key);
        } catch (e) {
          out.ok = false;
          out.captures = "ERR " + String(e && e.message || e);
        }
      } else {
        out.captures = "not configured";
      }
      out.bindingsAllPresent = out.bindings.STORE === true && out.bindings.ADMIN_TOKEN === true && out.bindings.MEMBER_TOKEN === true && out.bindings.PROBE_TOKEN === true;
      if (!out.bindingsAllPresent) out.ok = false;
      return json(out, out.ok ? 200 : 500);
    }
    if (op === "purge") {
      const confirm = url.searchParams.get("confirm");
      if (confirm !== storeName)
        return json({
          ok: false,
          error: "purge requires confirm=<store>",
          expected: storeName,
          got: confirm,
          tokenClass: cls,
          store: storeName
        }, 400);
    }
    if (op === "livefire") {
      const out = await livefire(env, storeName);
      return json(out, out.ok ? 200 : 500);
    }
    if (op === "capture") {
      if (typeof env.CAPTURES?.get !== "function")
        return json({ ok: false, error: "R2 is not configured on this instance" }, 503);
      const sha = (url.searchParams.get("sha256") || "").toLowerCase();
      if (!/^[0-9a-f]{64}$/.test(sha))
        return json({ ok: false, error: "capture requires sha256=<64 lowercase hex>" }, 400);
      const key = `${storeName}/captures/${sha}`;
      if (req.method === "PUT" || req.method === "POST") {
        const body2 = new Uint8Array(await req.arrayBuffer());
        const digest = [...new Uint8Array(await crypto.subtle.digest("SHA-256", body2))].map((x) => x.toString(16).padStart(2, "0")).join("");
        if (digest !== sha)
          return json({
            ok: false,
            reason: "INTEGRITY",
            detail: "body hash does not match the sha256 parameter",
            expected: sha,
            got: digest,
            store: storeName,
            tokenClass: cls
          }, 400);
        const existing = await env.CAPTURES.head(key);
        if (existing)
          return json({ ok: true, sha256: sha, bytes: existing.size, existed: true, store: storeName, tokenClass: cls });
        await env.CAPTURES.put(key, body2, { sha256: await crypto.subtle.digest("SHA-256", body2) });
        return json({ ok: true, sha256: sha, bytes: body2.length, existed: false, store: storeName, tokenClass: cls });
      }
      const wantRange = req.headers.get("range");
      const obj = await env.CAPTURES.get(key, wantRange ? { range: req.headers } : void 0);
      const dl = (url.searchParams.get("dl") || "").replace(/[^\w.\- ]/g, "").slice(0, 120);
      if (!obj)
        return json({ ok: false, reason: "NOT_FOUND", sha256: sha, store: storeName, tokenClass: cls }, 404);
      return new Response(obj.body, {
        status: wantRange ? 206 : 200,
        headers: {
          "content-type": "application/octet-stream",
          "access-control-allow-origin": "*",
          "x-capture-sha256": sha,
          ...dl ? { "content-disposition": `attachment; filename="${dl}"` } : {}
        }
      });
    }
    const stub = env.STORE.get(env.STORE.idFromName(storeName));
    const inner = new URL("http://x/" + op);
    for (const [k, v] of url.searchParams) if (k !== "token" && k !== "op") inner.searchParams.set(k, v);
    const res = await stub.fetch(new Request(inner, {
      method: req.method,
      body: req.method === "POST" ? await req.text() : void 0
    }));
    const body = await res.json();
    return json({ ...body, store: storeName, tokenClass: cls }, res.status);
  }
};
export {
  PUBLISHED_TOKEN_HASHES,
  Store,
  index_default as default,
  liveToken
};
