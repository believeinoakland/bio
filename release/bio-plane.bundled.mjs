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

-- ---- write arc ----

-- Members. Each member signs in with their own password (stored in
-- credentials under role 'member:<member_id>', which is why sessions and
-- credentials needed no schema change). invite_hash is the SHA-256 of a
-- one-time enrollment code; it is cleared the moment the member enrolls, so
-- a leaked invite cannot re-enroll an active member.
CREATE TABLE IF NOT EXISTS members (
  member_id   TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'member',
  status      TEXT NOT NULL DEFAULT 'invited',
  invite_hash TEXT,
  created     TEXT NOT NULL,
  updated     TEXT NOT NULL
);

-- Registered signing keys, the plane's projection of the member key
-- registry. key_b64 is the bare base64 of the OpenSSH wire public key, the
-- exact bytes an SSHSIG embeds, so matching is byte equality.
CREATE TABLE IF NOT EXISTS signers (
  key_b64   TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  comment   TEXT,
  status    TEXT NOT NULL DEFAULT 'active',
  added     TEXT NOT NULL
);

-- The published projection: the ONLY tables the public doorbell reads.
-- Nothing lands here except through ratification, so answering a public
-- query from these tables can never leak working material. published_shas
-- is append-only across re-ratifications: a hash once published stays
-- verifiable forever, which is what a document holder needs.
CREATE TABLE IF NOT EXISTS published_bundles (
  bundle_id       TEXT PRIMARY KEY,
  bundle_sha      TEXT NOT NULL,
  ratified_at     TEXT NOT NULL,
  attestor_key    TEXT NOT NULL,
  attestor_member TEXT,
  gate_version    TEXT NOT NULL,
  sig_armored     TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS published_shas (
  sha256    TEXT NOT NULL,
  bundle_id TEXT NOT NULL,
  path      TEXT NOT NULL,
  kind      TEXT NOT NULL,
  bytes     INTEGER,
  published TEXT NOT NULL,
  PRIMARY KEY (sha256, bundle_id, path)
);
CREATE INDEX IF NOT EXISTS published_shas_sha ON published_shas(sha256);

-- The knock: quarantined public intake. Payload bytes live in R2 under
-- <store>/inbox/<sha256> when R2 is configured, else inline here (small
-- only). Nothing reads this table except member review; nothing here
-- touches the record until a member pulls it through the gate.
CREATE TABLE IF NOT EXISTS inbox (
  knock_id    TEXT PRIMARY KEY,
  sha256      TEXT NOT NULL,
  bytes       INTEGER NOT NULL,
  content     TEXT,
  in_r2       INTEGER NOT NULL DEFAULT 0,
  note        TEXT,
  contact     TEXT,
  received    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new',
  resolved    TEXT,
  resolved_by TEXT
);
CREATE INDEX IF NOT EXISTS inbox_status ON inbox(status);

-- Fixed-window knock rate accounting. Rows are pruned as windows pass.
CREATE TABLE IF NOT EXISTS knock_rate (
  bucket TEXT PRIMARY KEY,
  count  INTEGER NOT NULL
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
  <p>This copy is claimed. Members sign in with their own name and password.
  Leave the name empty to sign in as the administrator.</p>
  <label for="lwho">Your member name</label>
  <input id="lwho" autocomplete="username" placeholder="leave empty for administrator">
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
  <div class="actions" style="margin:22px 0 6px">
    <button id="go-browse">Browse the record</button>
    <button id="go-new">Add something new</button>
    <button id="go-inbox">Review the inbox</button>
    <button id="go-members" hidden>Members and keys</button>
  </div>
  <h2>What this page is, and is not</h2>
  <p>This page opens the record for reading, takes in new material, and
  publishes what the group has ratified. Signing in with a password lets you
  write into the working record. Publishing something to the world needs more
  than a password: it needs a signature from a key the group has registered,
  which you make on the signing page and paste in. Deleting anything is not
  possible from here at all.</p>
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
  <div id="b-ratify"></div>
</section>

<section id="s-new">
  <p class="crumb"><a class="crumb-home">This copy</a> &rsaquo; New</p>
  <h1>Add something new</h1>
  <p class="small">This creates a bundle in the working record. Nothing here is
  public: the working record has never been published and cannot be read by
  anyone without a password.</p>
  <label for="n-type">What kind of thing is this?</label>
  <select id="n-type">
    <option value="information">Information</option>
    <option value="problem">Problem</option>
    <option value="project">Project</option>
    <option value="action">Action</option>
  </select>
  <label for="n-title">Title</label>
  <input id="n-title" placeholder="what this is about">
  <label for="n-body">What do you know?</label>
  <textarea id="n-body" rows="14" placeholder="Write it plainly. Markdown headings and lists work."></textarea>
  <div class="actions" style="margin-top:16px"><button id="n-save">Create it</button></div>
  <p class="err" id="n-err"></p>
</section>

<section id="s-edit">
  <p class="crumb"><a class="crumb-home">This copy</a> &rsaquo; <a id="e-back">Bundle</a> &rsaquo; Edit</p>
  <h1>Revise this</h1>
  <p class="small">Saving adds a revision. The version you are replacing stays in
  the history forever; nothing is overwritten and nothing is lost.</p>
  <div class="card"><div class="kv"><span class="k">Bundle</span><span class="v mono" id="e-id"></span></div></div>
  <label for="e-body">The record</label>
  <textarea id="e-body" rows="20" spellcheck="false"></textarea>
  <div class="actions" style="margin-top:16px"><button id="e-save">Save a revision</button></div>
  <p class="err" id="e-err"></p>
</section>

<section id="s-inbox">
  <p class="crumb"><a class="crumb-home">This copy</a> &rsaquo; Inbox</p>
  <h1>The inbox</h1>
  <p class="small">Material left by people outside the group. Nothing here is part
  of the record, and nothing here has been examined. Treat every item as
  unverified until the group has checked it.</p>
  <div id="inbox-body"><p class="small">Loading&hellip;</p></div>
</section>

<section id="s-members">
  <p class="crumb"><a class="crumb-home">This copy</a> &rsaquo; Members</p>
  <h1>Members and keys</h1>
  <p class="small">Members sign in with their own name and password. Registered
  keys are what allow a member to publish; a password alone never can.</p>
  <h2>Members</h2>
  <div class="card" id="m-list"></div>
  <label for="m-id">Add a member (lowercase letters, digits, dashes)</label>
  <input id="m-id" placeholder="ruth">
  <label for="m-name">Their full name</label>
  <input id="m-name" placeholder="Ruth">
  <div class="actions" style="margin-top:12px"><button id="m-add">Invite them</button></div>
  <p class="err" id="m-err"></p>
  <div id="m-invite"></div>
  <h2>Registered keys</h2>
  <div class="card" id="k-list"></div>
  <label for="k-key">Public key from the signing page</label>
  <textarea id="k-key" rows="3" placeholder="ssh-ed25519 AAAA... bio-ratify" spellcheck="false"></textarea>
  <label for="k-who">Belongs to which member</label>
  <input id="k-who" placeholder="ruth">
  <div class="actions" style="margin-top:12px"><button id="k-add">Register this key</button></div>
  <p class="err" id="k-err"></p>
</section>

<section id="s-enroll">
  <h1>Set your password</h1>
  <p>You were invited to this group. Choose a password and your account is live.</p>
  <label for="en-id">Your member name</label>
  <input id="en-id">
  <label for="en-inv">The invitation code you were given</label>
  <input id="en-inv" spellcheck="false">
  <label for="en-pw">Choose a password (12 characters or more)</label>
  <input id="en-pw" type="password" autocomplete="new-password">
  <div class="actions" style="margin-top:12px"><button id="en-go">Set it</button></div>
  <p class="err" id="en-err"></p>
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
      WHO = saved.w || "admin";
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
    const who = $("#lwho").value.trim();
    const role = who ? "member:" + who : "admin";
    const l = await api("login", { role, password: $("#lpw").value });
    if (!l.result || !l.result.ok) {
      e.textContent = l.result && l.result.reason === "NO_SUCH_ROLE"
        ? "No member by that name has set a password on this copy yet."
        : "That name and password were not accepted."; return; }
    WHO = who || "admin";
    const b = await api("bootstrap");
    panel(l.result, b.consumedAt);
  } catch(err){ e.textContent = "Sign-in did not go through: " + err.message; }
  finally { $("#do-login").disabled = false; }
});
let SESSION = null;
let WHO = "admin";
function panel(login, claimedAt){
  if (login && login.token) {
    SESSION = login.token;
    try { sessionStorage.setItem("bio-session", JSON.stringify({ t: login.token, e: login.expires || 0, c: claimedAt || "", w: WHO })); } catch {}
  }
  $("#go-members").hidden = WHO !== "admin";
  $("#panel-lede").textContent = WHO === "admin"
    ? "Signed in as administrator." : "Signed in as " + WHO + ".";
  $("#p-version").textContent = window.__ver || "unknown";
  $("#p-claimed").textContent = claimedAt ? new Date(claimedAt).toLocaleString() : "just now";
  $("#p-roles").textContent = WHO;
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
  ratifyPanel(id, liveText, revText !== null);

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

/* ---- publishing: the one action a password alone cannot take ----
   Ratifying copies this exact revision into the published record, where
   anyone can check a hash against it. It needs a signature made with a
   registered key, so the authority to publish is held by people, not by
   whoever is holding a session. */
async function ratifyPanel(id, liveText, historical){
  const box = $("#b-ratify");
  if (historical) { box.innerHTML = ""; return; }
  const sha = await sha256Text(liveText);
  box.innerHTML = "<h2>Publish this</h2>"
    + '<p class="small">Publishing puts this revision where the public can verify it by hash. '
    + "It cannot be undone: a published hash answers forever, even after later revisions.</p>"
    + '<div class="card"><div class="kv"><span class="k">Bundle</span><span class="v mono">'+escH(id)+"</span></div>"
    + '<div class="kv"><span class="k">This revision</span><span class="v mono">'+escH(sha)+"</span></div></div>"
    + '<p class="small">On the signing page, choose Sign a ratification, paste those two values, '
    + "and paste what it gives you here.</p>"
    + '<textarea id="r-sig" rows="6" spellcheck="false" placeholder="-----BEGIN SSH SIGNATURE-----"></textarea>'
    + '<div class="actions" style="margin-top:12px"><button id="r-go">Publish it</button>'
    + ' <button id="r-edit">Revise instead</button></div><p class="err" id="r-err"></p>';
  $("#r-edit").addEventListener("click", ()=>openEdit(id, liveText));
  $("#r-go").addEventListener("click", async ()=>{
    const e = $("#r-err"); e.textContent = "";
    const sig = $("#r-sig").value.trim();
    if (!sig) { e.textContent = "Paste the signature from the signing page."; return; }
    $("#r-go").disabled = true;
    try {
      const r = await post("ratify", { bundleId: id, expectedSha: sha, sig });
      if (r.ok) {
        box.innerHTML = '<div class="okbox"><p style="margin:0">Published, attested by '
          + escH(r.attestor||"a registered key") + ". " + escH(r.published.shas)
          + " hashes are now publicly verifiable.</p></div>";
        return; }
      e.textContent = ratifyWhy(r);
    } catch(err){ e.textContent = "That did not go through: " + err.message; }
    finally { const g=$("#r-go"); if (g) g.disabled = false; }
  });
}
function ratifyWhy(r){
  const why = r.reason || r.error || "unknown";
  if (why === "RATIFY_STALE") return "Someone saved a newer revision while you were signing. Reload this bundle and sign the new hash.";
  if (why === "NO_SIGNERS") return "No keys are registered on this copy yet, so nothing can be published. An administrator registers keys under Members and keys.";
  if (why === "SIG_UNKNOWN_KEY") return "That signature was made with a key this group has not registered, or one that has been revoked.";
  if (why === "SIG_BAD_SIGNATURE") return "That signature does not match this bundle and hash. Sign the exact values shown above.";
  if (why === "SIG_NAMESPACE") return "That signature was made for something other than ratification. Use the Sign a ratification tab.";
  if (why === "MALFORMED") return "That does not look like a signature. Copy the whole block, including the BEGIN and END lines.";
  if (why === "GATE_REFUSED") return "The checks refused this bundle: "
    + (r.findings||[]).map(f=>f.check + (f.where ? " (" + f.where + ")" : "")).join(", ")
    + ". Publishing is blocked until those are fixed.";
  return "Refused: " + why;
}

/* ---- intake: writing into the working record from this page ----
   Every write below goes through the same gated API a machine caller uses.
   Authorship is stamped by the server from the session, so nothing typed
   here can claim to be someone else. */
const NL = String.fromCharCode(10);
const PREFIX = { information:"INFO", problem:"PROB", project:"PROJ", action:"ACTN" };
const FIRST_STATE = { information:"collected", problem:"forming", project:"forming", action:"forming" };
const post = async (op, body)=>{
  const r = await fetch("/api/?op="+op+"&token="+encodeURIComponent(SESSION),
    { method:"POST", body: JSON.stringify(body) });
  if (r.status === 401) { SESSION=null; try{sessionStorage.removeItem("bio-session");}catch{}; show("#s-login"); throw new Error("signed out"); }
  return r.json();
};
const sha256Text = async (text)=>{
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("");
};
const stamp = ()=>{
  const d = new Date().toISOString().replace(/[-:]/g,"").split(".")[0] + "Z";
  let r = ""; const h = "0123456789abcdef";
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  for (const x of bytes) r += h[x>>4] + h[x&15];
  return d + "_" + r;
};
const mdFor = (id, type, state, title, body)=>
  ["---","id: "+id,"object_type: "+type,"current_state: "+state,"title: "+title,"---","","## Summary","",body,""].join(NL);

/* ---- create ---- */
$("#go-new").addEventListener("click", ()=>{ $("#n-err").textContent=""; show("#s-new"); });
$("#n-save").addEventListener("click", async ()=>{
  const e = $("#n-err"); e.textContent = "";
  const type = $("#n-type").value, title = $("#n-title").value.trim(), body = $("#n-body").value.trim();
  if (!title) { e.textContent = "Give it a title."; return; }
  if (!body) { e.textContent = "Write something in the body."; return; }
  $("#n-save").disabled = true;
  try {
    const year = String(new Date().getFullYear());
    const a = await rec("allocid", { prefix: PREFIX[type], year });
    const id = a.result.id + "-" + title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40);
    const state = FIRST_STATE[type];
    const text = mdFor(id, type, state, title, body);
    const now = new Date().toISOString();
    const r = await post("promote", {
      bundleId: id, base: null, snapKey: stamp(), author: WHO,
      meta: { object_type:type, group:"believe-in-oakland", title, current_state:state, created:now, last_updated:now },
      files: [{ path:"bundle.md", text, bytes:text.length, sha256: await sha256Text(text) }],
      refs: [], register: [],
    });
    if (!r.result || !r.result.ok) { e.textContent = "Refused: " + ((r.result&&r.result.reason)||r.error||"unknown"); return; }
    $("#n-title").value = ""; $("#n-body").value = "";
    openBundle(id);
  } catch(err){ e.textContent = "That did not go through: " + err.message; }
  finally { $("#n-save").disabled = false; }
});

/* ---- revise ---- */
let EDIT_ID = null;
async function openEdit(id, text){
  EDIT_ID = id; $("#e-err").textContent = "";
  $("#e-id").textContent = id; $("#e-body").value = text;
  show("#s-edit");
}
$("#e-back").addEventListener("click", ()=>openBundle(EDIT_ID));
$("#e-save").addEventListener("click", async ()=>{
  const e = $("#e-err"); e.textContent = "";
  const text = $("#e-body").value;
  const fmv = splitFm(text).fm;
  if (!fmv.id) { e.textContent = "The record must keep its heading block, including its id line."; return; }
  $("#e-save").disabled = true;
  try {
    const lease = await rec("lease", { id: EDIT_ID });
    if (!lease.result || lease.result.ok === false) {
      e.textContent = "Someone else is editing this right now (" + (lease.result&&lease.result.heldBy) + ")."; return; }
    const now = new Date().toISOString();
    const r = await post("promote", {
      bundleId: EDIT_ID, base: lease.result.baseSha, snapKey: stamp(), author: WHO,
      meta: { object_type: fmv.object_type, group:"believe-in-oakland", title: fmv.title || EDIT_ID,
              current_state: fmv.current_state, created: now, last_updated: now },
      files: [{ path:"bundle.md", text, bytes:text.length, sha256: await sha256Text(text) }],
      refs: [], register: [],
    });
    if (!r.result || !r.result.ok) {
      e.textContent = r.result && r.result.reason === "STALE"
        ? "Someone saved a newer version while you were writing. Open it again and redo your change."
        : "Refused: " + ((r.result&&r.result.reason)||r.error||"unknown");
      return; }
    openBundle(EDIT_ID);
  } catch(err){ e.textContent = "That did not go through: " + err.message; }
  finally { $("#e-save").disabled = false; }
});

/* ---- the inbox ---- */
$("#go-inbox").addEventListener("click", openInbox);
async function openInbox(){
  show("#s-inbox");
  const r = await rec("inbox");
  const rows = (r.result && r.result.inbox) || [];
  if (!rows.length) { $("#inbox-body").innerHTML = '<p class="small">Nothing has been left at the door.</p>'; return; }
  $("#inbox-body").innerHTML = rows.map(k=>
    '<div class="card"><div class="kv"><span class="k mono">'+escH(k.knock_id)+'</span><span class="v">'
    + chip(k.status) + ' <span class="dim">' + fmtWhen(k.received) + "</span></span></div>"
    + '<div class="kv"><span class="k">Hash</span><span class="v mono">'+escH(k.sha256)+"</span></div>"
    + '<div class="kv"><span class="k">Size</span><span class="v">'+escH(k.bytes)+" bytes</span></div>"
    + (k.note ? '<div class="kv"><span class="k">Note</span><span class="v">'+escH(k.note)+"</span></div>" : "")
    + (k.contact ? '<div class="kv"><span class="k">Contact</span><span class="v">'+escH(k.contact)+"</span></div>" : "")
    + (k.resolved_by ? '<div class="kv"><span class="k">Handled by</span><span class="v">'+escH(k.resolved_by)+"</span></div>" : "")
    + '<div class="actions" style="margin-top:10px">'
    + '<button class="ibtn" data-id="'+escH(k.knock_id)+'" data-to="pulled">Mark as taken up</button> '
    + '<button class="ibtn" data-id="'+escH(k.knock_id)+'" data-to="discarded">Set aside</button></div></div>').join("");
  document.querySelectorAll("#inbox-body .ibtn").forEach(b=>b.addEventListener("click", async ()=>{
    await post("inboxresolve", { knockId: b.dataset.id, status: b.dataset.to });
    openInbox();
  }));
}

/* ---- members and keys ---- */
$("#go-members").addEventListener("click", openMembers);
async function openMembers(){
  show("#s-members"); $("#m-err").textContent=""; $("#k-err").textContent="";
  const m = await rec("memberlist");
  const rows = (m.result && m.result.members) || [];
  $("#m-list").innerHTML = rows.length ? rows.map(x=>
    '<div class="kv"><span class="k mono">'+escH(x.member_id)+'</span><span class="v">'
    + escH(x.name||"") + " " + chip(x.status)
    + (x.invite_pending ? ' <span class="dim">invitation not used yet</span>' : "")
    + ' <button class="mbtn" data-id="'+escH(x.member_id)+'" data-to="'
    + (x.status==="revoked"?"active":"revoked") + '">'
    + (x.status==="revoked"?"reinstate":"revoke") + "</button></span></div>").join("")
    : '<p class="small" style="margin:0">No members yet.</p>';
  document.querySelectorAll("#m-list .mbtn").forEach(b=>b.addEventListener("click", async ()=>{
    await post("memberset", { memberId: b.dataset.id, status: b.dataset.to }); openMembers();
  }));
  const k = await rec("signerlist");
  const keys = (k.result && k.result.signers) || [];
  $("#k-list").innerHTML = keys.length ? keys.map(x=>
    '<div class="kv"><span class="k">'+escH(x.member_id)+'</span><span class="v"><span class="mono dim">'
    + escH(String(x.key_b64).slice(0,24)) + "&hellip;</span> " + chip(x.status)
    + ' <button class="kbtn" data-key="'+escH(x.key_b64)+'" data-to="'
    + (x.status==="revoked"?"active":"revoked") + '">'
    + (x.status==="revoked"?"reinstate":"revoke") + "</button></span></div>").join("")
    : '<p class="small" style="margin:0">No keys registered. Until a key is registered, nothing can be published.</p>';
  document.querySelectorAll("#k-list .kbtn").forEach(b=>b.addEventListener("click", async ()=>{
    await post("signerset", { keyB64: b.dataset.key, status: b.dataset.to }); openMembers();
  }));
}
$("#m-add").addEventListener("click", async ()=>{
  const e = $("#m-err"); e.textContent = ""; $("#m-invite").innerHTML = "";
  const r = await post("memberadd", { memberId: $("#m-id").value.trim(), name: $("#m-name").value.trim() });
  if (!r.result || !r.result.ok) { e.textContent = "Refused: " + ((r.result&&r.result.reason)||r.error||"unknown"); return; }
  $("#m-invite").innerHTML = '<div class="okbox"><p style="margin:0">Give '
    + escH($("#m-id").value.trim()) + ' this invitation code. It works once and is not shown again.</p>'
    + '<p class="mono" style="margin:8px 0 0">' + escH(r.result.invite) + "</p></div>";
  $("#m-id").value = ""; $("#m-name").value = "";
  openMembers();
});
$("#k-add").addEventListener("click", async ()=>{
  const e = $("#k-err"); e.textContent = "";
  const r = await post("signeradd", { keyB64: $("#k-key").value.trim(), memberId: $("#k-who").value.trim() });
  if (!r.result || !r.result.ok) {
    e.textContent = r.result && r.result.reason === "BAD_KEY"
      ? "That is not a public key this system can read. Copy the whole line from the signing page."
      : "Refused: " + ((r.result&&r.result.reason)||r.error||"unknown");
    return; }
  $("#k-key").value = ""; $("#k-who").value = ""; openMembers();
});

/* ---- enrolment, for an invited member with no password yet ---- */
$("#en-go").addEventListener("click", async ()=>{
  const e = $("#en-err"); e.textContent = "";
  const r = await api("enroll", { memberId: $("#en-id").value.trim(),
    invite: $("#en-inv").value.trim(), password: $("#en-pw").value });
  if (!r.result || !r.result.ok) {
    e.textContent = r.result && r.result.reason === "PASSWORD_TOO_SHORT"
      ? "The password needs at least 12 characters."
      : "That invitation was not accepted. Check the name and the code.";
    return; }
  $("#lwho").value = $("#en-id").value.trim(); $("#lpw").value = "";
  show("#s-login");
});
document.querySelectorAll(".crumb-home").forEach(a=>a.addEventListener("click", ()=>{
  document.querySelector("main").classList.remove("wide"); show("#s-panel"); }));

state();
</script>
</body>
</html>`;

// src/gate.mjs
var GATE_VERSION = "plane-gate/0.1";
var sha256hex2 = async (s) => {
  const b = await crypto.subtle.digest(
    "SHA-256",
    typeof s === "string" ? new TextEncoder().encode(s) : s
  );
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
};
function parseFrontmatter(text) {
  const m = String(text || "").match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return fm;
}
async function runGate({ bundleId, row, image, manifest, history, registers, dangling, hasCapture }) {
  const findings = [];
  const refuse = (check, detail, where) => findings.push({ check, detail, ...where ? { where } : {} });
  if (!image || !image["bundle.md"] || typeof image["bundle.md"] !== "string")
    refuse("G1_BUNDLE_MD", "bundle.md is missing or not inline");
  else {
    const fm = parseFrontmatter(image["bundle.md"]);
    if (!fm) refuse("G1_FRONTMATTER", "bundle.md has no parseable frontmatter");
    else {
      if (fm.id !== bundleId)
        refuse("G1_ID", `frontmatter id ${JSON.stringify(fm.id)} does not match bundle ${bundleId}`);
      if (row && fm.object_type !== row.object_type)
        refuse("G1_TYPE", `frontmatter object_type ${JSON.stringify(fm.object_type)} does not match the row ${JSON.stringify(row.object_type)}`);
      if (row && fm.current_state !== row.current_state)
        refuse("G1_STATE", `frontmatter current_state ${JSON.stringify(fm.current_state)} does not match the row ${JSON.stringify(row.current_state)}`);
    }
  }
  const liveShas = {};
  for (const [path, v] of Object.entries(image || {})) {
    if (path.startsWith("_history/")) continue;
    if (typeof v === "string") liveShas[path] = await sha256hex2(v);
  }
  if (row && liveShas["bundle.md"] && liveShas["bundle.md"] !== row.bundle_sha)
    refuse(
      "G2_LIVE_SHA",
      "live bundle.md does not hash to the recorded bundle_sha",
      { want: row.bundle_sha, got: liveShas["bundle.md"] }
    );
  const histSha = new Map(history.map((h) => [h.snap_key, h.sha256]));
  for (const m of manifest) {
    const snap = histSha.get(m.snap_key);
    if (snap === void 0)
      refuse("G3_CHAIN_SNAPSHOT", `manifest entry ${m.snap_key} has no bundle.md snapshot`);
    else if (m.base !== snap)
      refuse(
        "G3_CHAIN_BASE",
        `manifest entry ${m.snap_key} base does not match its snapshot`,
        { base: m.base, snapshot: snap }
      );
  }
  const regBySha = new Map(registers.map((r) => [r.capture_sha, r]));
  for (const [path, v] of Object.entries(image || {})) {
    if (path.startsWith("_history/") || typeof v === "string") continue;
    const reg = regBySha.get(v.blobSha ?? v.sha256);
    if (!reg) {
      refuse("G4_UNREGISTERED", `live blob file has no register row`, { path });
      continue;
    }
    const probe = await hasCapture(reg.capture_sha);
    if (!probe.present)
      refuse("G4_MISSING_BYTES", `registered capture is absent from the working bucket`, { path, sha256: reg.capture_sha });
    else if (typeof reg.bytes === "number" && probe.bytes !== reg.bytes)
      refuse("G4_SIZE", `capture bytes differ from the register`, { path, want: reg.bytes, got: probe.bytes });
  }
  for (const target of dangling)
    refuse("G5_DANGLING_REF", `reference target does not exist`, { target });
  return { gateVersion: GATE_VERSION, ok: findings.length === 0, findings };
}

// src/sshsig.mjs
var te = new TextEncoder();
var b64ToBytes = (b64) => {
  const bin = atob(b64.replace(/\s+/g, ""));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};
var bytesToB64 = (bytes) => {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
};
var Rd = class {
  constructor(buf) {
    this.b = buf;
    this.o = 0;
  }
  bytes(n) {
    if (this.o + n > this.b.length) throw new Error("sshsig: truncated");
    const v = this.b.slice(this.o, this.o + n);
    this.o += n;
    return v;
  }
  u32() {
    const b = this.bytes(4);
    return (b[0] << 24 | b[1] << 16 | b[2] << 8 | b[3]) >>> 0;
  }
  str() {
    return this.bytes(this.u32());
  }
  done() {
    return this.o === this.b.length;
  }
};
var wStr = (bytes) => {
  const out = new Uint8Array(4 + bytes.length);
  new DataView(out.buffer).setUint32(0, bytes.length);
  out.set(bytes, 4);
  return out;
};
var cat = (...parts) => {
  const n = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
};
function parsePubkeyLine(line) {
  const m = String(line || "").trim().split(/\s+/);
  if (m.length < 2) throw new Error("pubkey: not an OpenSSH public key line");
  const [keyType, b64] = m;
  if (keyType !== "ssh-ed25519") throw new Error("pubkey: only ssh-ed25519 is supported, got " + keyType);
  const blob = b64ToBytes(b64);
  const r = new Rd(blob);
  const t = new TextDecoder().decode(r.str());
  if (t !== "ssh-ed25519") throw new Error("pubkey: wire type mismatch");
  const raw = r.str();
  if (raw.length !== 32) throw new Error("pubkey: ed25519 key must be 32 bytes");
  return { keyType, raw, b64, comment: m.slice(2).join(" ") };
}
function wirePubkey(raw) {
  return cat(wStr(te.encode("ssh-ed25519")), wStr(raw));
}
function normalizeKey(entry) {
  const toks = String(entry || "").trim().split(/\s+/);
  const i = toks.indexOf("ssh-ed25519");
  const b64 = i >= 0 ? toks[i + 1] : toks.length === 1 ? toks[0] : null;
  if (!b64 || !b64.startsWith("AAAA")) return null;
  try {
    return parsePubkeyLine("ssh-ed25519 " + b64).b64;
  } catch {
    return null;
  }
}
var dearmor = (text) => {
  const m = String(text || "").match(
    /-----BEGIN SSH SIGNATURE-----\s*([\s\S]*?)\s*-----END SSH SIGNATURE-----/
  );
  if (!m) throw new Error("sshsig: missing armor");
  return b64ToBytes(m[1]);
};
function parseSshsig(armored) {
  const blob = dearmor(armored);
  const r = new Rd(blob);
  const magic = new TextDecoder().decode(r.bytes(6));
  if (magic !== "SSHSIG") throw new Error("sshsig: bad magic");
  const version = r.u32();
  if (version !== 1) throw new Error("sshsig: unsupported version " + version);
  const pubkeyBlob = r.str();
  const namespace = new TextDecoder().decode(r.str());
  const reserved = r.str();
  const hashAlg = new TextDecoder().decode(r.str());
  const sigBlob = r.str();
  const pr = new Rd(pubkeyBlob);
  const keyType = new TextDecoder().decode(pr.str());
  if (keyType !== "ssh-ed25519") throw new Error("sshsig: only ssh-ed25519 keys are supported");
  const pubRaw = pr.str();
  if (pubRaw.length !== 32) throw new Error("sshsig: bad ed25519 key length");
  const sr = new Rd(sigBlob);
  const sigType = new TextDecoder().decode(sr.str());
  if (sigType !== "ssh-ed25519") throw new Error("sshsig: signature type mismatch");
  const sigRaw = sr.str();
  if (sigRaw.length !== 64) throw new Error("sshsig: bad ed25519 signature length");
  if (hashAlg !== "sha512" && hashAlg !== "sha256")
    throw new Error("sshsig: unsupported hash " + hashAlg);
  return {
    version,
    namespace,
    hashAlg,
    reserved,
    pubRaw,
    pubkeyBlob,
    sigRaw,
    pubB64: bytesToB64(wirePubkey(pubRaw))
  };
}
async function verifySshsig(armored, message, expectNamespace, allowedKeys) {
  let p;
  try {
    p = parseSshsig(armored);
  } catch (e) {
    return { ok: false, reason: "MALFORMED", detail: String(e.message || e) };
  }
  if (p.namespace !== expectNamespace)
    return { ok: false, reason: "NAMESPACE", expected: expectNamespace, got: p.namespace };
  const allowed = (allowedKeys || []).map(normalizeKey).filter(Boolean);
  if (!allowed.includes(p.pubB64))
    return { ok: false, reason: "UNKNOWN_KEY", keyB64: p.pubB64 };
  const hash = await crypto.subtle.digest(p.hashAlg === "sha512" ? "SHA-512" : "SHA-256", message);
  const signed = cat(
    te.encode("SSHSIG"),
    wStr(te.encode(p.namespace)),
    wStr(p.reserved),
    wStr(te.encode(p.hashAlg)),
    wStr(new Uint8Array(hash))
  );
  let key;
  try {
    key = await crypto.subtle.importKey("raw", p.pubRaw, { name: "Ed25519" }, false, ["verify"]);
  } catch (e) {
    return { ok: false, reason: "CRYPTO_UNAVAILABLE", detail: String(e.message || e) };
  }
  const good = await crypto.subtle.verify({ name: "Ed25519" }, key, p.sigRaw, signed);
  return good ? { ok: true, keyB64: p.pubB64, namespace: p.namespace } : { ok: false, reason: "BAD_SIGNATURE", keyB64: p.pubB64 };
}
var NS_RATIFY = "bio-ratify";
var ratifyStatement = (bundleId, bundleSha) => te.encode(`bio-ratify ${bundleId} ${bundleSha}
`);

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
  /* ---- members: each person their own credential, admin-invited ----
  
       The invite is spent exactly like the bootstrap credential is spent: its
       hash is cleared on enrollment, so possession of an old invite buys
       nothing against an enrolled member. Passwords live only as PBKDF2
       hashes under credentials role 'member:<id>'. */
  async memberAdd({ memberId, name, role = "member" } = {}) {
    if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(memberId || ""))
      return { ok: false, reason: "BAD_MEMBER_ID", detail: "lowercase letters, digits and dashes, 2 to 41 characters" };
    if (!name || typeof name !== "string")
      return { ok: false, reason: "NO_NAME" };
    if (this.#one(`SELECT member_id FROM members WHERE member_id=?`, memberId))
      return { ok: false, reason: "EXISTS", memberId };
    const invite = _Store.#rand(16);
    const hash = await _Store.#sha256(invite);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.sql.exec(
      `INSERT INTO members (member_id,name,role,status,invite_hash,created,updated) VALUES (?,?,?,?,?,?,?)`,
      memberId,
      name,
      role === "admin" ? "admin" : "member",
      "invited",
      hash,
      now,
      now
    );
    return { ok: true, memberId, invite };
  }
  async enroll({ memberId, invite, password } = {}) {
    const m = this.#one(`SELECT status, invite_hash FROM members WHERE member_id=?`, memberId);
    if (!m) return { ok: false, reason: "NO_SUCH_MEMBER" };
    if (m.status === "revoked") return { ok: false, reason: "REVOKED" };
    if (!m.invite_hash) return { ok: false, reason: "ALREADY_ENROLLED" };
    if (!invite || await _Store.#sha256(invite) !== m.invite_hash)
      return { ok: false, reason: "BAD_INVITE" };
    if (typeof password !== "string" || password.length < 12)
      return { ok: false, reason: "PASSWORD_TOO_SHORT", minimum: 12 };
    await this.setPassword({ role: `member:${memberId}`, password });
    this.sql.exec(
      `UPDATE members SET status='active', invite_hash=NULL, updated=? WHERE member_id=?`,
      (/* @__PURE__ */ new Date()).toISOString(),
      memberId
    );
    return { ok: true, memberId };
  }
  memberList() {
    return { members: this.#rows(
      `SELECT member_id, name, role, status, created, updated,
              CASE WHEN invite_hash IS NULL THEN 0 ELSE 1 END AS invite_pending
       FROM members ORDER BY member_id`
    ) };
  }
  memberSet({ memberId, status } = {}) {
    if (!["active", "revoked"].includes(status)) return { ok: false, reason: "BAD_STATUS" };
    const m = this.#one(`SELECT status FROM members WHERE member_id=?`, memberId);
    if (!m) return { ok: false, reason: "NO_SUCH_MEMBER" };
    this.sql.exec(
      `UPDATE members SET status=?, updated=? WHERE member_id=?`,
      status,
      (/* @__PURE__ */ new Date()).toISOString(),
      memberId
    );
    if (status === "revoked") {
      this.sql.exec(`DELETE FROM sessions WHERE role=?`, `member:${memberId}`);
      this.sql.exec(`UPDATE signers SET status='revoked' WHERE member_id=?`, memberId);
    }
    return { ok: true, memberId, status };
  }
  /* ---- signers: the registered-key projection ---- */
  signerAdd({ keyB64, memberId, comment } = {}) {
    if (!keyB64 || !/^AAAA[A-Za-z0-9+/=]+$/.test(keyB64))
      return { ok: false, reason: "BAD_KEY", detail: "expected the base64 field of an ssh-ed25519 public key" };
    if (!this.#one(`SELECT member_id FROM members WHERE member_id=?`, memberId))
      return { ok: false, reason: "NO_SUCH_MEMBER" };
    this.sql.exec(
      `INSERT INTO signers (key_b64,member_id,comment,status,added) VALUES (?,?,?,'active',?)
       ON CONFLICT(key_b64) DO UPDATE SET member_id=excluded.member_id,
         comment=excluded.comment, status='active'`,
      keyB64,
      memberId,
      comment ?? null,
      (/* @__PURE__ */ new Date()).toISOString()
    );
    return { ok: true, keyB64, memberId };
  }
  signerList() {
    return { signers: this.#rows(`SELECT key_b64, member_id, comment, status, added FROM signers ORDER BY added`) };
  }
  signerSet({ keyB64, status } = {}) {
    if (!["active", "revoked"].includes(status)) return { ok: false, reason: "BAD_STATUS" };
    if (!this.#one(`SELECT key_b64 FROM signers WHERE key_b64=?`, keyB64))
      return { ok: false, reason: "NO_SUCH_KEY" };
    this.sql.exec(`UPDATE signers SET status=? WHERE key_b64=?`, status, keyB64);
    return { ok: true, keyB64, status };
  }
  /* ---- ratification support: facts out, published rows in ----
  
       The gate and the signature check run at the control plane, which also
       owns all R2 traffic. This store only hands out the facts and commits
       the published rows in one transaction. */
  gateFacts(bundleId) {
    const row = this.#one(
      `SELECT bundle_id, object_type, current_state, bundle_sha FROM bundles WHERE bundle_id=?`,
      bundleId
    );
    if (!row) return { ok: false, reason: "ABSENT", bundleId };
    return {
      ok: true,
      row,
      manifest: this.#rows(`SELECT snap_key, kind, base, created FROM manifest WHERE bundle_id=? ORDER BY created`, bundleId),
      history: this.#rows(`SELECT snap_key, sha256 FROM history WHERE bundle_id=? AND path='bundle.md'`, bundleId),
      registers: this.#rows(`SELECT capture_sha, path, bytes FROM register WHERE bundle_id=?`, bundleId),
      dangling: this.#rows(
        `SELECT r.target_id FROM refs r LEFT JOIN bundles b ON b.bundle_id=r.target_id
         WHERE r.bundle_id=? AND b.bundle_id IS NULL`,
        bundleId
      ).map((r) => r.target_id),
      signers: this.#rows(
        `SELECT s.key_b64, s.member_id FROM signers s
         JOIN members m ON m.member_id=s.member_id
         WHERE s.status='active' AND m.status='active'`
      )
    };
  }
  publish({ bundleId, bundleSha, attestorKey, attestorMember, gateVersion, sigArmored, shas } = {}) {
    if (!bundleId || !bundleSha || !attestorKey || !gateVersion || !sigArmored || !Array.isArray(shas))
      return { ok: false, reason: "MALFORMED" };
    return this.ctx.storage.transactionSync(() => {
      const cur = this.#one(`SELECT bundle_sha FROM published_bundles WHERE bundle_id=?`, bundleId);
      const existed = !!(cur && cur.bundle_sha === bundleSha);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      this.sql.exec(
        `INSERT INTO published_bundles (bundle_id,bundle_sha,ratified_at,attestor_key,attestor_member,gate_version,sig_armored)
         VALUES (?,?,?,?,?,?,?)
         ON CONFLICT(bundle_id) DO UPDATE SET bundle_sha=excluded.bundle_sha,
           ratified_at=excluded.ratified_at, attestor_key=excluded.attestor_key,
           attestor_member=excluded.attestor_member, gate_version=excluded.gate_version,
           sig_armored=excluded.sig_armored`,
        bundleId,
        bundleSha,
        now,
        attestorKey,
        attestorMember ?? null,
        gateVersion,
        sigArmored
      );
      for (const s of shas)
        this.sql.exec(
          `INSERT INTO published_shas (sha256,bundle_id,path,kind,bytes,published) VALUES (?,?,?,?,?,?)
           ON CONFLICT(sha256,bundle_id,path) DO NOTHING`,
          s.sha256,
          bundleId,
          s.path,
          s.kind,
          s.bytes ?? null,
          now
        );
      return { ok: true, bundleId, bundleSha, existed, ratifiedAt: now };
    });
  }
  /* ---- the doorbell, store side ---- */
  /* 7a: answers ONLY from the published projection. Working material is not
     consulted, so there is nothing to leak: a hash that was never ratified
     is indistinguishable from a hash that never existed. */
  verifySha(sha) {
    const matches = this.#rows(
      `SELECT bundle_id, path, kind, published FROM published_shas WHERE sha256=? ORDER BY published`,
      sha
    );
    return { published: matches.length > 0, sha256: sha, matches };
  }
  publishedList() {
    return { bundles: this.#rows(
      `SELECT bundle_id, bundle_sha, ratified_at, attestor_member, gate_version FROM published_bundles ORDER BY bundle_id`
    ) };
  }
  /* 7b: the knock. Rate accounting and the row land in one transaction, so
     an attacker cannot slip past the caps on a race. The worst case is by
     construction a full inbox. */
  knock({
    knockId,
    sha256: sha2562,
    bytes,
    content,
    inR2,
    note,
    contact,
    ipBucket,
    globalBucket,
    perIpLimit,
    globalLimit
  } = {}) {
    return this.ctx.storage.transactionSync(() => {
      const cnt = (b) => this.#one(`SELECT count FROM knock_rate WHERE bucket=?`, b)?.count || 0;
      if (cnt(ipBucket) >= perIpLimit) return { ok: false, reason: "RATE_IP" };
      if (cnt(globalBucket) >= globalLimit) return { ok: false, reason: "RATE_GLOBAL" };
      for (const b of [ipBucket, globalBucket])
        this.sql.exec(`INSERT INTO knock_rate (bucket,count) VALUES (?,1)
                       ON CONFLICT(bucket) DO UPDATE SET count=count+1`, b);
      const win = globalBucket.split(":").pop();
      this.sql.exec(`DELETE FROM knock_rate WHERE bucket NOT LIKE '%:' || ?`, win);
      this.sql.exec(
        `INSERT INTO inbox (knock_id,sha256,bytes,content,in_r2,note,contact,received,status)
         VALUES (?,?,?,?,?,?,?,?,'new')`,
        knockId,
        sha2562,
        bytes,
        content ?? null,
        inR2 ? 1 : 0,
        (note || "").slice(0, 2e3),
        (contact || "").slice(0, 300),
        (/* @__PURE__ */ new Date()).toISOString()
      );
      return { ok: true, knockId, sha256: sha2562, bytes };
    });
  }
  inboxList(status) {
    return { inbox: this.#rows(
      `SELECT knock_id, sha256, bytes, in_r2, note, contact, received, status, resolved, resolved_by
       FROM inbox ${status ? "WHERE status=?" : ""} ORDER BY received DESC`,
      ...status ? [status] : []
    ) };
  }
  inboxGet(knockId) {
    const r = this.#one(`SELECT knock_id, sha256, bytes, content, in_r2, note, contact, received, status FROM inbox WHERE knock_id=?`, knockId);
    return r ? { ok: true, item: r } : { ok: false, reason: "NOT_FOUND" };
  }
  inboxResolve({ knockId, status, by } = {}) {
    if (!["pulled", "discarded", "new"].includes(status)) return { ok: false, reason: "BAD_STATUS" };
    const r = this.#one(`SELECT knock_id FROM inbox WHERE knock_id=?`, knockId);
    if (!r) return { ok: false, reason: "NOT_FOUND" };
    this.sql.exec(
      `UPDATE inbox SET status=?, resolved=?, resolved_by=? WHERE knock_id=?`,
      status,
      (/* @__PURE__ */ new Date()).toISOString(),
      by ?? null,
      knockId
    );
    return { ok: true, knockId, status };
  }
  static async #sha256(v) {
    const b = await crypto.subtle.digest("SHA-256", _Store.#enc.encode(v));
    return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
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
        login: async () => {
          const role = body?.role || "admin";
          if (role.startsWith("member:")) {
            const m = this.#one(`SELECT status FROM members WHERE member_id=?`, role.slice(7));
            if (!m || m.status !== "active") return { ok: false, reason: "NO_SUCH_ROLE" };
          }
          return this.login(body || {});
        },
        memberadd: () => this.memberAdd(body || {}),
        enroll: () => this.enroll(body || {}),
        memberlist: () => this.memberList(),
        memberset: () => this.memberSet(body || {}),
        signeradd: () => this.signerAdd(body || {}),
        signerlist: () => this.signerList(),
        signerset: () => this.signerSet(body || {}),
        gatefacts: () => this.gateFacts(url.searchParams.get("id")),
        publish: () => this.publish(body || {}),
        verify: () => this.verifySha((url.searchParams.get("sha256") || "").toLowerCase()),
        publishedlist: () => this.publishedList(),
        knock: () => this.knock(body || {}),
        inboxlist: () => this.inboxList(url.searchParams.get("status") || null),
        inboxget: () => this.inboxGet(url.searchParams.get("id")),
        inboxresolve: () => this.inboxResolve(body || {}),
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
  /* Write arc. Ratification's authority is the SSHSIG itself, checked
     against the registered signers; the token or session only reaches the
     surface. Member and signer administration is admin-only. Probe class
     reaches everything so the whole write arc is exercisable against
     scratch, whose Durable Object is a different instance with its own
     member tables, so scratch enrollment can never touch the live roster. */
  ratify: { classes: ["admin", "member", "probe"], mutating: true },
  publishedlist: { classes: ["admin", "member", "probe", "public"], mutating: false },
  inbox: { classes: ["admin", "member", "probe"], mutating: false },
  inboxget: { classes: ["admin", "member", "probe"], mutating: false },
  inboxresolve: { classes: ["admin", "member", "probe"], mutating: true },
  memberadd: { classes: ["admin", "probe"], mutating: true },
  memberlist: { classes: ["admin", "member", "probe"], mutating: false },
  memberset: { classes: ["admin", "probe"], mutating: true },
  signeradd: { classes: ["admin", "probe"], mutating: true },
  signerlist: { classes: ["admin", "member", "probe"], mutating: false },
  signerset: { classes: ["admin", "probe"], mutating: true },
  /* The bootstrap trio and the doorbell are the unauthenticated surface.
     Each enforces its own gate: bootstrap reveals nothing but
     claimed/unclaimed, claim requires the bootstrap secret and refuses once
     spent, login requires the password, enroll requires a live one-time
     invite. verify answers only from the published projection, which has
     never seen unratified material, so there is nothing to leak. knock
     lands in a quarantined inbox, size-capped and rate-limited; the worst
     case under attack is a full inbox. */
  bootstrap: { classes: null, mutating: false },
  claim: { classes: null, mutating: true },
  login: { classes: null, mutating: false },
  enroll: { classes: null, mutating: true },
  verify: { classes: null, mutating: false },
  knock: { classes: null, mutating: true }
};
var SESSION_OPS = {
  member: /* @__PURE__ */ new Set([
    "promote",
    "lease",
    "allocid",
    "capture",
    "ratify",
    "inbox",
    "inboxget",
    "inboxresolve"
  ]),
  admin: /* @__PURE__ */ new Set([
    "promote",
    "lease",
    "allocid",
    "capture",
    "ratify",
    "inbox",
    "inboxget",
    "inboxresolve",
    "memberadd",
    "memberset",
    "signeradd",
    "signerset"
  ])
};
var KNOCK = {
  windowMs: 10 * 60 * 1e3,
  perIp: 12,
  // knocks per source per window
  global: 300,
  // knocks per instance per window; bounds hostile R2 writes
  maxBytes: 8 * 1024 * 1024,
  // with R2: enough for a captured PDF
  maxInline: 64 * 1024
  // without R2: inline into the DO, small only
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
      if (op === "enroll") {
        const body2 = await req.json().catch(() => ({}));
        const r2 = await stub2.fetch(new Request("http://do/enroll", {
          method: "POST",
          body: JSON.stringify(body2)
        }));
        return json(await r2.json(), 200);
      }
      if (op === "verify") {
        const sha = (url.searchParams.get("sha256") || "").toLowerCase();
        if (!/^[0-9a-f]{64}$/.test(sha))
          return json({ ok: false, error: "verify requires sha256=<64 lowercase hex>" }, 400);
        const r2 = await stub2.fetch(new Request(`http://do/verify?sha256=${sha}`));
        const out2 = await r2.json();
        return json({ ok: true, ...out2.result }, 200);
      }
      if (op === "knock") {
        if (req.method !== "POST") return json({ ok: false, error: "knock is a POST" }, 405);
        const raw = await req.arrayBuffer();
        if (raw.byteLength > KNOCK.maxBytes + 4096)
          return json({ ok: false, reason: "TOO_LARGE", maxBytes: KNOCK.maxBytes }, 413);
        let body2;
        try {
          body2 = JSON.parse(new TextDecoder().decode(raw));
        } catch {
          body2 = null;
        }
        if (!body2 || typeof body2.contentB64 !== "string" && typeof body2.contentText !== "string")
          return json({ ok: false, error: "knock requires contentB64 or contentText, plus optional note and contact" }, 400);
        let bytes;
        try {
          bytes = body2.contentB64 !== void 0 ? Uint8Array.from(atob(body2.contentB64), (c) => c.charCodeAt(0)) : new TextEncoder().encode(body2.contentText);
        } catch {
          return json({ ok: false, error: "contentB64 is not valid base64" }, 400);
        }
        if (bytes.length === 0) return json({ ok: false, reason: "EMPTY" }, 400);
        const r2 = typeof env.CAPTURES?.put === "function";
        const cap = r2 ? KNOCK.maxBytes : KNOCK.maxInline;
        if (bytes.length > cap)
          return json({
            ok: false,
            reason: "TOO_LARGE",
            maxBytes: cap,
            detail: r2 ? void 0 : "this instance stores knocks inline; large material needs its evidence storage configured"
          }, 413);
        const sha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map((x) => x.toString(16).padStart(2, "0")).join("");
        const win = Math.floor(Date.now() / KNOCK.windowMs);
        const ipHash = await fingerprint(req.headers.get("cf-connecting-ip") || "unknown") || "unknown";
        const knockId = `KNOCK-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 8)}`;
        const rec = await (await stub2.fetch(new Request("http://do/knock", {
          method: "POST",
          body: JSON.stringify({
            knockId,
            sha256: sha,
            bytes: bytes.length,
            content: r2 ? null : new TextDecoder().decode(bytes),
            inR2: r2,
            note: body2.note,
            contact: body2.contact,
            ipBucket: `ip:${ipHash}:${win}`,
            globalBucket: `all:${win}`,
            perIpLimit: KNOCK.perIp,
            globalLimit: KNOCK.global
          })
        }))).json();
        if (!rec.result?.ok) return json({ ok: false, ...rec.result }, 429);
        if (r2) await env.CAPTURES.put(
          `bio/inbox/${sha}`,
          bytes,
          { sha256: await crypto.subtle.digest("SHA-256", bytes) }
        );
        return json({
          ok: true,
          knockId,
          sha256: sha,
          bytes: bytes.length,
          received: "Your material is in the group's inbox awaiting member review."
        }, 200);
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
    let sessMember = null;
    if (!cls) {
      const t = url.searchParams.get("token");
      if (t && /^[0-9a-f]{64}$/.test(t)) {
        const st = env.STORE.get(env.STORE.idFromName("bio"));
        const r = await (await st.fetch(`http://do/session?t=${t}`)).json();
        const sess = r?.result?.session;
        if (sess) {
          const kind = sess.role === "admin" ? "admin" : "member";
          if (spec.mutating && !(op === "capture" && req.method === "GET") && !SESSION_OPS[kind].has(op))
            return json({ ok: false, error: "this operation requires a machine credential, not a signed-in session", op }, 403);
          cls = kind;
          sessMember = sess.role.startsWith("member:") ? sess.role.slice(7) : sess.role;
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
    if (op === "ratify") {
      const body2 = await req.json().catch(() => null);
      if (!body2?.bundleId || !body2?.expectedSha || typeof body2?.sig !== "string")
        return json({ ok: false, reason: "MALFORMED", detail: "ratify requires bundleId, expectedSha, and sig (armored SSH signature)" }, 400);
      const facts = (await (await stub.fetch(`http://do/gatefacts?id=${encodeURIComponent(body2.bundleId)}`)).json()).result;
      if (!facts.ok) return json({ ...facts, store: storeName, tokenClass: cls }, 404);
      if (facts.row.bundle_sha !== body2.expectedSha)
        return json({
          ok: false,
          reason: "RATIFY_STALE",
          detail: "the bundle has changed since it was reviewed; read it again and re-sign",
          expected: facts.row.bundle_sha,
          got: body2.expectedSha,
          store: storeName,
          tokenClass: cls
        }, 409);
      if (!facts.signers.length)
        return json({
          ok: false,
          reason: "NO_SIGNERS",
          detail: "no active registered signing keys; an admin must register a member key before anything can be ratified",
          store: storeName,
          tokenClass: cls
        }, 409);
      const sv = await verifySshsig(
        body2.sig,
        ratifyStatement(body2.bundleId, body2.expectedSha),
        NS_RATIFY,
        facts.signers.map((s) => s.key_b64)
      );
      if (!sv.ok)
        return json({
          ok: false,
          reason: "SIG_" + sv.reason,
          ...sv.keyB64 ? { keyB64: sv.keyB64 } : {},
          ...sv.detail ? { detail: sv.detail } : {},
          store: storeName,
          tokenClass: cls
        }, 403);
      const attestor = facts.signers.find((s) => s.key_b64 === sv.keyB64);
      const image = (await (await stub.fetch(`http://do/image?id=${encodeURIComponent(body2.bundleId)}`)).json()).result;
      const r2 = typeof env.CAPTURES?.head === "function";
      const gate = await runGate({
        bundleId: body2.bundleId,
        row: facts.row,
        image,
        manifest: facts.manifest,
        history: facts.history,
        registers: facts.registers,
        dangling: facts.dangling,
        hasCapture: async (sha) => {
          if (!r2) return { present: false, bytes: 0 };
          const h = await env.CAPTURES.head(`${storeName}/captures/${sha}`);
          return h ? { present: true, bytes: h.size } : { present: false, bytes: 0 };
        }
      });
      if (!gate.ok)
        return json({
          ok: false,
          reason: "GATE_REFUSED",
          gateVersion: gate.gateVersion,
          findings: gate.findings,
          store: storeName,
          tokenClass: cls
        }, 409);
      const shas = [];
      for (const [path2, v] of Object.entries(image)) {
        if (path2.startsWith("_history/")) continue;
        if (typeof v === "string") {
          const sha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v)))].map((x) => x.toString(16).padStart(2, "0")).join("");
          shas.push({
            sha256: sha,
            path: path2,
            kind: path2 === "bundle.md" ? "bundle" : "file",
            bytes: new TextEncoder().encode(v).length,
            text: v
          });
        } else {
          shas.push({ sha256: v.blobSha, path: path2, kind: "capture" });
        }
      }
      const pub = (await (await stub.fetch(new Request("http://do/publish", {
        method: "POST",
        body: JSON.stringify({
          bundleId: body2.bundleId,
          bundleSha: body2.expectedSha,
          attestorKey: sv.keyB64,
          attestorMember: attestor?.member_id ?? sessMember,
          gateVersion: gate.gateVersion,
          sigArmored: body2.sig,
          shas: shas.map(({ text, ...s }) => s)
        })
      }))).json()).result;
      if (!pub?.ok) return json({ ok: false, reason: "PUBLISH_FAILED", detail: pub, store: storeName, tokenClass: cls }, 500);
      let copied = 0, present = 0, r2state = "not configured";
      if (typeof env.PUBLISHED?.put === "function" && r2) {
        r2state = "ok";
        for (const s of shas) {
          const key = `${storeName}/published/${s.sha256}`;
          if (await env.PUBLISHED.head(key)) {
            present++;
            continue;
          }
          if (s.kind === "capture") {
            const obj = await env.CAPTURES.get(`${storeName}/captures/${s.sha256}`);
            if (!obj) {
              r2state = "INCOMPLETE: capture vanished between gate and copy";
              continue;
            }
            await env.PUBLISHED.put(key, obj.body);
          } else {
            await env.PUBLISHED.put(key, new TextEncoder().encode(s.text));
          }
          copied++;
        }
      }
      return json({
        ok: true,
        bundleId: body2.bundleId,
        bundleSha: body2.expectedSha,
        existed: pub.existed,
        ratifiedAt: pub.ratifiedAt,
        attestor: attestor?.member_id ?? null,
        gateVersion: gate.gateVersion,
        published: { shas: shas.length, copied, alreadyPresent: present, r2: r2state },
        store: storeName,
        tokenClass: cls
      }, 200);
    }
    const DO_PATH = { inbox: "inboxlist", memberlist: "memberlist", signerlist: "signerlist" };
    const inner = new URL("http://x/" + (DO_PATH[op] || op));
    for (const [k, v] of url.searchParams) if (k !== "token" && k !== "op") inner.searchParams.set(k, v);
    if (viaSession && op === "lease") inner.searchParams.set("actor", sessMember);
    let passBody = req.method === "POST" ? await req.text() : void 0;
    if (viaSession && op === "promote" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.author = sessMember;
        passBody = JSON.stringify(b);
      } catch {
      }
    }
    if (op === "inboxresolve" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.by = viaSession ? sessMember : `token:${cls}`;
        passBody = JSON.stringify(b);
      } catch {
      }
    }
    const res = await stub.fetch(new Request(inner, { method: req.method, body: passBody }));
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
