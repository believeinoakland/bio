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
  -- Who wrote it and what operation they claim. C-20.1 keys entirely off these
  -- two: a promotion marked mechanical is held to the field set its named
  -- operation declares, and one that names no registered operation is refused.
  -- Null for a hand-authored promotion, which is the common case and is not
  -- held to any envelope beyond the ordinary checks.
  writer     TEXT,
  operation  TEXT,
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
  -- A COVER, not a name. It is the label an administrator uses to tell
  -- participants apart, and it is explicitly NOT a claim about who someone is
  -- in the world. The word matters: a field called "name" invites an
  -- administrator to type a legal name, and the cover-and-handle split exists
  -- precisely so that a roster seized or subpoenaed does not deanonymise the
  -- group. See docs/architecture/BIO_Membership_Architecture_v1.md section 3.
  cover       TEXT NOT NULL,
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
  assert("history holds the superseded revision", /rev 1/.test(live["_history/bundle_20260723T190000Z_livefire.md"] || ""), true);
  assert(
    "the verbatim promotion record is projected",
    "_history/promotion_20260723T190000Z_livefire.json" in live,
    true,
    "classifyDivergence and C-20.1 both read these records; without them the checks are unreachable, not passing"
  );
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
    const names = ["ADMIN_TOKEN", "MEMBER_TOKEN", "PROBE_TOKEN"];
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

// checks/bio-checks.mjs
var BUNDLE_ID_RE = /^(INFO|PROB|PROJ|ACTN)-\d{4}-\d{4}-[a-z0-9]+(-[a-z0-9]+)*$/;
var ANN_ID_RE = /^(INFO|PROB|PROJ|ACTN)-\d{4}-\d{4}-[a-z0-9]+(-[a-z0-9]+)*\.ann-\d{8}T\d{6}Z-[a-z0-9]+(-[a-z0-9]+)*$/;
var FILENAME_RE = /^[A-Za-z0-9._-]+$/;
var ISO_TS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
var OBJECT_TYPES = { INFO: "information", PROB: "problem", PROJ: "project", ACTN: "action" };
var CORE_FIELDS = [
  "id",
  "object_type",
  "schema",
  "title",
  "current_state",
  "prior_state",
  "created",
  "last_updated",
  "produced_by",
  "group",
  "references",
  "state_history",
  "annotations_open",
  "reeval_pending",
  "visuals"
];
var FORBIDDEN_ALIASES = {
  status: "current_state",
  state: "current_state",
  pipeline_state: "current_state",
  verdict: "current_state",
  type: "object_type",
  updated: "last_updated",
  modified: "last_updated"
};
var HEADINGS = {
  information: ["## Summary", "## Provenance Notes", "## Session Log", "## Review Notes"],
  problem: ["## Statement", "## Why It Matters", "## Open Questions", "## Session Log", "## Review Notes"],
  project: ["## Thesis Summary", "## Open Questions", "## Ruled Out", "## Session Log", "## Review Notes"],
  action: ["## Plan", "## Status", "## Correspondence", "## Session Log", "## Review Notes"]
};
var STATES = {
  information: {
    legal: ["collected", "verified", "retired"],
    edges: { collected: ["verified"], verified: ["retired"], retired: [] }
  },
  problem: {
    legal: ["surfaced", "elevated", "deferred", "dismissed"],
    edges: {
      surfaced: ["elevated", "deferred", "dismissed"],
      deferred: ["surfaced", "elevated", "dismissed"],
      dismissed: ["surfaced", "elevated", "deferred"],
      elevated: []
    }
  },
  project: {
    legal: ["forming", "investigating", "matured", "closed"],
    edges: {
      forming: ["investigating", "closed"],
      investigating: ["matured", "closed"],
      matured: ["closed"],
      closed: ["investigating"]
    }
  },
  action: {
    legal: ["planned", "active", "awaiting_response", "resolved", "abandoned"],
    edges: {
      planned: ["active", "abandoned"],
      active: ["awaiting_response", "resolved", "abandoned"],
      awaiting_response: ["active", "resolved", "abandoned"],
      resolved: [],
      abandoned: []
    }
  }
};
function f(check, severity, message, repairs) {
  const out = { check, severity, message };
  if (repairs) {
    out.repairable = true;
    out.repairs = repairs;
  }
  return out;
}
function stripComment(raw) {
  let inS = false, inD = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === "'" && !inD) inS = !inS;
    else if (c === '"' && !inS) inD = !inD;
    else if (c === "#" && !inS && !inD && (i === 0 || raw[i - 1] === " ")) return raw.slice(0, i);
  }
  return raw;
}
function parseScalar(raw) {
  let v = stripComment(raw).trim();
  if (v === "") return "";
  if (v === "null" || v === "~") return null;
  if (v === "true") return true;
  if (v === "false") return false;
  if (v.startsWith('"') && v.endsWith('"') || v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
  if (v.startsWith("[") && v.endsWith("]")) {
    const inner = v.slice(1, -1).trim();
    if (inner === "") return [];
    return inner.split(",").map((s) => parseScalar(s));
  }
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
  return v;
}
function parseFrontmatter(text) {
  const findings = [];
  const lines = text.split(/\r?\n/);
  if (lines[0] !== "---") {
    findings.push(f("C-2.1", "error", "bundle.md does not begin with a --- frontmatter fence"));
    return { data: null, findings, body: text };
  }
  let end = -1;
  for (let i = 1; i < lines.length; i++) if (lines[i] === "---") {
    end = i;
    break;
  }
  if (end === -1) {
    findings.push(f("C-2.1", "error", "frontmatter fence is never closed"));
    return { data: null, findings, body: text };
  }
  const data = {};
  let topKey = null;
  let topMode = null;
  let curElem = null;
  const keyLine = /^([A-Za-z_][A-Za-z0-9_]*):(.*)$/;
  const indKeyLine = /^( +)([A-Za-z_][A-Za-z0-9_]*):(.*)$/;
  const itemLine = /^( +)- (.*)$/;
  for (let n = 1; n < end; n++) {
    const line = lines[n];
    const stripped = stripComment(line);
    if (stripped.trim() === "") continue;
    let m;
    if (m = keyLine.exec(line)) {
      const key = m[1];
      const rest = m[2];
      topKey = null;
      topMode = null;
      curElem = null;
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        findings.push(f("C-2.1", "error", `duplicate top-level key '${key}' at line ${n + 1}`));
      }
      if (stripComment(rest).trim() === "") {
        topKey = key;
        data[key] = void 0;
      } else {
        data[key] = parseScalar(rest);
      }
    } else if (m = itemLine.exec(line)) {
      const indent = m[1].length;
      const rest = m[2];
      if (!topKey) {
        findings.push(f("C-2.1", "error", `array item outside any block at line ${n + 1}`));
        continue;
      }
      if (indent !== 2) findings.push(f("C-2.1", "error", `array item indented ${indent} (expected 2) at line ${n + 1}`));
      if (topMode === null) {
        topMode = "array";
        data[topKey] = [];
      }
      if (topMode !== "array") {
        findings.push(f("C-2.1", "error", `array item inside a map block '${topKey}' at line ${n + 1}`));
        continue;
      }
      const km = /^([A-Za-z_][A-Za-z0-9_]*):(.*)$/.exec(rest);
      if (km && stripComment(km[2]).trim() !== "") {
        curElem = {};
        curElem[km[1]] = parseScalar(km[2]);
        data[topKey].push(curElem);
      } else {
        curElem = null;
        data[topKey].push(parseScalar(rest));
      }
    } else if (m = indKeyLine.exec(line)) {
      const indent = m[1].length;
      const key = m[2];
      const rest = m[3];
      const isCore = CORE_FIELDS.includes(key) || key in FORBIDDEN_ALIASES;
      if (topKey && topMode === null && indent === 2) {
        topMode = "map";
        data[topKey] = {};
        data[topKey][key] = parseScalar(rest);
      } else if (topKey && topMode === "map" && indent === 2) {
        data[topKey][key] = parseScalar(rest);
      } else if (topKey && topMode === "array" && curElem && indent === 4) {
        curElem[key] = parseScalar(rest);
      } else {
        if (isCore) {
          findings.push(f(
            "C-2.4",
            "error",
            `top-level key '${key}' is buried by stray indentation at line ${n + 1} and will not register`,
            [`re-indent '${key}' to column 0`]
          ));
          data[key] = parseScalar(rest);
        } else {
          findings.push(f("C-2.1", "error", `key '${key}' indented ${indent} does not fit the restricted grammar at line ${n + 1}`));
        }
      }
    } else {
      findings.push(f("C-2.1", "error", `line ${n + 1} does not fit the restricted grammar: ${line.slice(0, 60)}`));
    }
  }
  for (const k of Object.keys(data)) if (data[k] === void 0) data[k] = [];
  return { data, findings, body: lines.slice(end + 1).join("\n") };
}
function asText(v) {
  if (typeof v === "string") return v;
  return new TextDecoder().decode(v);
}
function hasFile_(ctx, path) {
  return ctx.files.has(path) || ctx.elided && ctx.elided.has(path);
}
function checkIdentity(ctx, findings) {
  const id = ctx.fm?.id;
  if (typeof id !== "string" || !BUNDLE_ID_RE.test(id)) {
    findings.push(f("C-1.2", "error", `frontmatter id '${id}' does not match the canonical ID grammar`));
  }
  if (typeof id === "string" && id !== ctx.folderName) {
    findings.push(f(
      "C-1.1",
      "error",
      `folder name '${ctx.folderName}' does not equal frontmatter id '${id}'`,
      ["restore folder name from frontmatter id", "restore frontmatter id from folder name if history confirms it"]
    ));
  }
  const seen = /* @__PURE__ */ new Set();
  for (const path of ctx.files.keys()) {
    if (!path.startsWith("annotations/")) continue;
    const name = path.slice("annotations/".length);
    if (!name.endsWith(".json")) {
      findings.push(f("C-1.3", "error", `annotation file '${name}' is not a .json record`));
      continue;
    }
    let rec;
    try {
      rec = JSON.parse(asText(ctx.files.get(path)));
    } catch {
      findings.push(f("C-1.3", "error", `annotation record '${name}' does not parse`));
      continue;
    }
    const rid = rec.id;
    if (typeof rid !== "string" || !ANN_ID_RE.test(rid)) {
      findings.push(f("C-1.3", "error", `annotation id '${rid}' does not match the v1.1 timestamp-author grammar`));
      continue;
    }
    if (!rid.startsWith(ctx.folderName + ".ann-")) {
      findings.push(f("C-1.3", "error", `annotation '${rid}' does not belong to parent '${ctx.folderName}'`));
    }
    const expectedFile = rid.slice(ctx.folderName.length + 1) + ".json";
    if (name !== expectedFile) {
      findings.push(f("C-1.3", "error", `annotation file '${name}' does not match its id (expected '${expectedFile}')`));
    }
    if (seen.has(rid)) {
      findings.push(f("C-1.3", "error", `duplicate annotation id '${rid}'`, ["adjust the later record timestamp suffix by one second, logged"]));
    }
    seen.add(rid);
  }
  let pending = 0;
  for (const path of ctx.files.keys()) {
    if (!path.startsWith("annotations/") || !path.endsWith(".json")) continue;
    try {
      if (JSON.parse(asText(ctx.files.get(path))).state === "pending") pending++;
    } catch {
    }
  }
  if (ctx.fm && typeof ctx.fm.annotations_open === "number" && ctx.fm.annotations_open !== pending) {
    findings.push(f("C-1.3", "warn", `annotations_open is ${ctx.fm.annotations_open} but ${pending} annotation record(s) are pending`, ["refresh annotations_open on the next write"]));
  }
}
function checkFrontmatterContract(ctx, findings) {
  const fm = ctx.fm;
  if (!fm) return;
  for (const key of CORE_FIELDS) {
    if (!(key in fm)) findings.push(f("C-2.2", "error", `required core field '${key}' is missing`));
  }
  for (const [alias, canonical] of Object.entries(FORBIDDEN_ALIASES)) {
    if (alias in fm) findings.push(f("C-2.3", "error", `forbidden alias '${alias}' present (canonical name is '${canonical}')`, [`rename '${alias}' to '${canonical}'`]));
  }
  const ot = fm.object_type;
  if (!Object.values(OBJECT_TYPES).includes(ot)) {
    findings.push(f("C-2.5", "error", `object_type '${ot}' is not a known type`));
  } else {
    const prefix = fm.id && String(fm.id).slice(0, 4);
    const wantType = OBJECT_TYPES[prefix];
    if (wantType && wantType !== ot) findings.push(f("C-2.5", "error", `id prefix '${prefix}' implies '${wantType}' but object_type is '${ot}'`));
    const schema = fm.schema;
    const sm = typeof schema === "string" && /^([a-z]+)@(\d+)$/.exec(schema);
    if (!sm) findings.push(f("C-2.5", "error", `schema stamp '${schema}' is not of the form <type>@<n>`));
    else {
      if (sm[1] !== ot) findings.push(f("C-2.5", "error", `schema stamp '${schema}' does not match object_type '${ot}'`));
      if (!ctx.knownSchemas.includes(schema)) findings.push(f("C-2.5", "error", `schema version '${schema}' is not known to this check catalog`));
    }
  }
  for (const key of ["created", "last_updated"]) {
    if (typeof fm[key] === "string" && !ISO_TS_RE.test(fm[key])) {
      findings.push(f("C-2.6", "error", `${key} '${fm[key]}' is not ISO 8601 UTC (YYYY-MM-DDTHH:MM:SSZ)`));
    }
  }
  if (fm.produced_by && typeof fm.produced_by === "object") {
    if (!fm.produced_by.mode) findings.push(f("C-2.2", "error", "produced_by.mode is missing"));
    if (!fm.produced_by.capability_tier) findings.push(f("C-2.2", "error", "produced_by.capability_tier is missing"));
  }
  checkReevalPending(ctx, findings);
}
var REEVAL_SOURCES = ["deletion", "source_status", "wp_retraction", "annotation"];
function checkReevalPending(ctx, findings) {
  const rp = ctx.fm?.reeval_pending;
  if (rp === void 0) return;
  const ageDays = ctx.maxReevalAgeDays ?? 30;
  if (typeof rp === "boolean") {
    if (rp === true) {
      findings.push(f(
        "C-10.1",
        "warn",
        "reeval_pending is a legacy boolean true with no since/source; staleness cannot be checked",
        ["migrate reeval_pending to {flag, since, source}"]
      ));
    }
    return;
  }
  if (typeof rp !== "object") {
    findings.push(f("C-10.1", "error", `reeval_pending must be a {flag, since, source} record or boolean, got ${typeof rp}`));
    return;
  }
  if (typeof rp.flag !== "boolean") {
    findings.push(f("C-10.1", "error", "reeval_pending.flag must be boolean"));
    return;
  }
  if (rp.flag === false) {
    if (rp.since != null || rp.source != null) {
      findings.push(f(
        "C-10.1",
        "warn",
        "reeval_pending.flag is false but since/source are not null",
        ["reset since and source to null when clearing the flag"]
      ));
    }
    return;
  }
  if (!ISO_TS_RE.test(rp.since || "")) {
    findings.push(f(
      "C-10.1",
      "error",
      "reeval_pending.flag is true but since is not an ISO-8601 UTC instant",
      ["stamp since with the cascade event time"]
    ));
  } else {
    const ageMs = (ctx.nowMs ?? Date.now()) - Date.parse(rp.since);
    if (ageMs > ageDays * 864e5) {
      findings.push(f(
        "C-10.1",
        "info",
        `reeval_pending set ${Math.floor(ageMs / 864e5)}d ago (policy age ${ageDays}d) with no recorded re-evaluation`,
        ["perform and record the re-evaluation", "record an explicit accept-risk note (policy permitting)"]
      ));
    }
  }
  if (!REEVAL_SOURCES.includes(rp.source)) {
    findings.push(f("C-10.1", "error", `reeval_pending.source '${rp.source}' is not one of: ${REEVAL_SOURCES.join(", ")}`));
  }
}
function checkHeadings(ctx, findings) {
  const ot = ctx.fm?.object_type;
  const required = HEADINGS[ot];
  if (!required) return;
  const present = (ctx.body.match(/^## .*$/gm) || []).map((h) => h.trimEnd());
  for (const h of required) {
    if (!present.includes(h)) findings.push(f("C-3.1", "error", `required heading '${h}' is missing`, [`insert canonical heading '${h}' with empty body`]));
  }
  for (const h of present) {
    if (!required.includes(h)) findings.push(f("C-3.1", "error", `heading '${h}' is not in the canonical set for ${ot}`, ["rename to the canonical heading, preserving body"]));
  }
}
function checkStateLegality(ctx, findings) {
  const ot = ctx.fm?.object_type;
  const spec = STATES[ot];
  if (!spec) return;
  const cur = ctx.fm.current_state;
  if (!spec.legal.includes(cur)) {
    findings.push(f("C-4.1", "error", `current_state '${cur}' is not legal for ${ot} (legal: ${spec.legal.join(", ")})`));
  }
  const hist = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];
  let prevTs = null;
  for (let i = 0; i < hist.length; i++) {
    const e = hist[i];
    if (typeof e !== "object" || e === null) {
      findings.push(f("C-4.2", "error", `state_history[${i}] is not an object`));
      continue;
    }
    for (const k of ["timestamp", "from_state", "to_state", "blurb", "author"]) {
      if (!(k in e)) findings.push(f("C-4.2", "error", `state_history[${i}] missing '${k}'`));
    }
    if (typeof e.timestamp === "string" && !ISO_TS_RE.test(e.timestamp)) {
      findings.push(f("C-2.6", "error", `state_history[${i}].timestamp '${e.timestamp}' is not ISO 8601 UTC`));
    }
    if (prevTs && e.timestamp && e.timestamp < prevTs) {
      findings.push(f("C-4.2", "error", `state_history[${i}] is out of chronological order`));
    }
    prevTs = e.timestamp || prevTs;
    const edges = spec.edges[e.from_state];
    if (edges && !edges.includes(e.to_state)) {
      findings.push(f("C-4.2", "error", `transition ${e.from_state} -> ${e.to_state} is not a legal ${ot} edge`));
    }
  }
  if (hist.length > 0) {
    const last = hist[hist.length - 1];
    if (last.to_state !== cur) findings.push(f("C-4.2", "error", `current_state '${cur}' disagrees with last transition to '${last.to_state}'`));
    if (ctx.fm.prior_state !== last.from_state) findings.push(f("C-4.2", "error", `prior_state '${ctx.fm.prior_state}' disagrees with last transition from '${last.from_state}'`));
  } else if (ctx.fm.prior_state !== null && ctx.fm.prior_state !== void 0) {
    findings.push(f("C-4.2", "error", `prior_state is '${ctx.fm.prior_state}' but state_history is empty (expected null)`));
  }
}
function checkWriteCompleteness(ctx, findings) {
  const fm = ctx.fm;
  if (!fm) return;
  if (typeof fm.created === "string" && typeof fm.last_updated === "string" && fm.last_updated < fm.created) {
    findings.push(f("C-13.1", "error", `last_updated '${fm.last_updated}' precedes created '${fm.created}'`));
  }
  const hist = Array.isArray(fm.state_history) ? fm.state_history : [];
  if (hist.length > 0) {
    const newest = hist[hist.length - 1].timestamp;
    if (typeof newest === "string" && typeof fm.last_updated === "string" && fm.last_updated < newest) {
      findings.push(f("C-13.1", "error", `last_updated precedes the newest state_history timestamp '${newest}'`));
    }
  }
  if (typeof fm.created === "string" && typeof fm.last_updated === "string" && fm.last_updated > fm.created) {
    const idx = ctx.body.indexOf("## Session Log");
    const section = idx >= 0 ? ctx.body.slice(idx, ctx.body.indexOf("\n## ", idx + 1) === -1 ? void 0 : ctx.body.indexOf("\n## ", idx + 1)) : "";
    if (!/^### Session /m.test(section)) {
      findings.push(f("C-13.2", "error", "bundle has been updated but carries no Session Log entry", ["append the missing Session Log entry naming the gap"]));
    }
  }
}
function checkFormatHygiene(ctx, findings) {
  const escapeRe = /\\[#*_\-\[\]!~&]/;
  for (const [path, content] of ctx.files) {
    const name = path.split("/").pop() || path;
    if (!FILENAME_RE.test(name) || name.includes(" ") || !name.includes(".") || !/\.[a-z0-9]+$/.test(name)) {
      findings.push(f("C-14.2", "error", `filename '${path}' violates the naming rule`, ["rename file and update references"]));
    }
    if (name.endsWith(".md")) {
      const text = asText(content);
      const m = escapeRe.exec(text);
      if (m) findings.push(f("C-14.1", "error", `escaped markdown character '${m[0]}' in ${path}`, ["normalize to clean markdown"]));
    }
    if (name.endsWith(".json")) {
      try {
        JSON.parse(asText(content));
      } catch {
        findings.push(f("C-14.3", "error", `${path} does not parse as JSON`, ["restore from history"]));
      }
    }
  }
  const visuals = Array.isArray(ctx.fm?.visuals) ? ctx.fm.visuals : [];
  const svgOnDisk = [...ctx.files.keys()].filter((p) => !p.includes("/") && p.endsWith(".svg"));
  for (const v of visuals) {
    if (typeof v !== "object" || !v.file || !v.description) {
      findings.push(f("C-14.4", "error", `visuals entry ${JSON.stringify(v).slice(0, 50)} lacks file+description`));
      continue;
    }
    if (!ctx.files.has(v.file)) findings.push(f("C-14.4", "error", `visuals entry '${v.file}' has no file on disk`));
  }
  for (const svg of svgOnDisk) {
    if (!visuals.some((v) => v && v.file === svg)) {
      findings.push(f("C-14.4", "error", `svg '${svg}' on disk is absent from the visuals array`));
    }
  }
}
async function checkQueueAndBase(ctx, findings) {
  const staleMs = 10 * 60 * 1e3;
  const gateMarkerStaleMs = 48 * 60 * 60 * 1e3;
  for (const p of ctx.files.keys()) {
    const gm = /^GATE_PASSED-[0-9a-f]{8}\.json$/.exec(p);
    const lm = gm ? null : /^LEASE-[A-Za-z0-9][A-Za-z0-9-]{0,63}\.json$/.exec(p);
    const m = gm || lm ? null : /^(PROMOTING|PRESENCE)-.+\.json$/.exec(p);
    if (!gm && !lm && !m) continue;
    let stale;
    if (lm) {
      let expires = null;
      try {
        expires = Date.parse(JSON.parse(asText(ctx.files.get(p))).expires || "");
      } catch {
      }
      stale = expires === null || Number.isNaN(expires) || (ctx.nowMs ?? Date.now()) > expires;
    } else {
      const windowMs = gm ? gateMarkerStaleMs : staleMs;
      let ts = null;
      try {
        const rec = JSON.parse(asText(ctx.files.get(p)));
        ts = Date.parse(rec.ts || rec["started-at"] || rec.started_at || "");
      } catch {
      }
      stale = ts === null || Number.isNaN(ts) || (ctx.nowMs ?? Date.now()) - ts > windowMs;
    }
    if (stale) {
      findings.push(f("C-16.5", "info", `stale advisory artifact '${p}' (crashed or ended actor)`, ["delete the stale claim or presence marker"]));
    }
  }
  const manifestRaw = ctx.files.get("PENDING_PROMOTION.json");
  const pendingFiles = [...ctx.files.keys()].filter((p) => p.endsWith(".pending"));
  if (!manifestRaw) {
    for (const p of pendingFiles) {
      findings.push(f("C-16.4", "error", `orphaned pending file '${p}' with no manifest`, ["complete consumption: archive manifest, delete consumed files (idempotent)"]));
    }
    return;
  }
  let man;
  try {
    man = JSON.parse(asText(manifestRaw));
  } catch {
    findings.push(f("C-16.1", "error", "PENDING_PROMOTION.json does not parse"));
    return;
  }
  for (const k of ["target", "base", "files", "created", "author", "skill_version"]) {
    if (!(k in man)) findings.push(f("C-16.1", "error", `manifest missing '${k}'`));
  }
  if (man.target && man.target !== ctx.folderName) {
    findings.push(f("C-16.1", "error", `manifest target '${man.target}' does not match bundle '${ctx.folderName}'`));
  }
  const listed = /* @__PURE__ */ new Set();
  if (Array.isArray(man.files)) {
    for (const entry of man.files) {
      if (!entry || !entry.name || !entry.sha256) {
        findings.push(f("C-16.1", "error", `manifest files entry ${JSON.stringify(entry)} lacks name+sha256`));
        continue;
      }
      listed.add(entry.name + ".pending");
      const pending = ctx.files.get(entry.name + ".pending");
      if (!pending) {
        findings.push(f("C-16.2", "error", `package file '${entry.name}.pending' listed in manifest is missing`, ["discard the package with a finding to the producing author", "re-produce the package from the originating session outputs"]));
        continue;
      }
      const hash = await ctx.sha256(pending);
      if (hash !== entry.sha256) {
        findings.push(f("C-16.2", "error", `hash mismatch on '${entry.name}.pending' (manifest ${String(entry.sha256).slice(0, 12)}\u2026, actual ${hash.slice(0, 12)}\u2026)`, ["discard the package (never promote)", "re-produce the package"]));
      }
    }
  }
  for (const p of pendingFiles) {
    if (!listed.has(p)) findings.push(f("C-16.4", "error", `pending file '${p}' is not listed in the manifest`, ["complete consumption or discard with reason"]));
  }
  if (typeof man.created === "string" && ISO_TS_RE.test(man.created)) {
    const ageDays = ((ctx.nowMs ?? Date.now()) - Date.parse(man.created)) / 864e5;
    if (ageDays > ctx.maxPackageAgeDays) {
      findings.push(f("C-16.3", "warn", `pending package is ${Math.floor(ageDays)} days old (policy ${ctx.maxPackageAgeDays})`, ["promote now", "discard with reason if superseded, preserving the manifest as a record"]));
    }
  } else {
    findings.push(f("C-16.1", "error", `manifest created '${man.created}' is not ISO 8601 UTC`));
  }
  const live = ctx.files.get("bundle.md");
  if (live && typeof man.base === "string") {
    const liveHash = await ctx.sha256(live);
    if (liveHash === man.base) {
      findings.push(f("C-17.1", "info", "pending package base matches live bundle.md: fast-forward eligible"));
    } else {
      findings.push(f("C-17.1", "warn", `pending package base ${String(man.base).slice(0, 12)}\u2026 does not match live bundle.md ${liveHash.slice(0, 12)}\u2026: divergence`, ["rebase via a reconciliation session", "supersede: human selects one, the other preserved as a diverged branch in _history", "apply-disjoint if file sets prove disjoint (requires history manifests)"]));
      const cls = classifyDivergence(man, ctx.files);
      if (cls.rung === "disjoint-auto") {
        findings.push(f("C-17.2", "info", `divergence classified disjoint-auto: base found in history at ${cls.baseKey}; intervening promotion(s) [${cls.intervening.join(", ")}] touched {${[...cls.interveningFiles].join(", ")}}, package touches {${man.files.map((e) => e.name).join(", ")}}, sets disjoint; apply in sequence recording both bases`, ["apply-disjoint: promote in sequence, recording base and applied-over in the history manifest entry"]));
      } else {
        findings.push(f("C-17.2", "warn", `divergence classified adjudicated: ${cls.reason}`, ["rebase via a reconciliation session", "supersede: human selects one, the other preserved as a diverged branch in _history", "apply-disjoint only if re-examination shows the overlap illusory"]));
      }
    }
  }
}
function classifyDivergence(man, files) {
  const histRaw = files.get("_history/manifest.json");
  if (histRaw == null) return { rung: "adjudicated", reason: "no history manifest: disjointness unverifiable" };
  let hist;
  try {
    hist = JSON.parse(typeof histRaw === "string" ? histRaw : new TextDecoder().decode(histRaw));
  } catch {
    return { rung: "adjudicated", reason: "history manifest unreadable" };
  }
  const entries = Array.isArray(hist.entries) ? [...hist.entries].sort((a, b) => a.key < b.key ? -1 : 1) : [];
  if (entries.length === 0) return { rung: "adjudicated", reason: "history manifest has no entries" };
  let start = -1;
  let anchor = null;
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].base === man.base) {
      start = i;
      anchor = `before ${entries[i].key}`;
    }
  }
  let recordGap = false;
  for (let i = 0; i < entries.length; i++) {
    const recRaw = files.get(`_history/promotion_${entries[i].key}.json`);
    if (recRaw == null) {
      recordGap = true;
      continue;
    }
    try {
      const rec = JSON.parse(typeof recRaw === "string" ? recRaw : new TextDecoder().decode(recRaw));
      const b = Array.isArray(rec.files) ? rec.files.find((x) => x.name === "bundle.md") : null;
      if (b && b.sha256 === man.base && i + 1 > start) {
        start = i + 1;
        anchor = `after ${entries[i].key}`;
      }
    } catch {
      recordGap = true;
    }
  }
  if (start === -1) {
    return { rung: "adjudicated", reason: recordGap ? "package base not found in recorded history (and some promotion records are missing or unreadable: chain incomplete)" : "package base not found anywhere in recorded history" };
  }
  const intervening = entries.slice(start);
  if (intervening.length === 0) return { rung: "adjudicated", reason: "base resolves to the chain tail yet live differs: unrecorded live edit" };
  const interveningFiles = /* @__PURE__ */ new Set();
  for (const e of intervening) for (const n of e.files || []) interveningFiles.add(n);
  const overlap = man.files.map((e) => e.name).filter((n) => interveningFiles.has(n));
  if (overlap.length > 0) return { rung: "adjudicated", reason: `overlapping substantive divergence on {${overlap.join(", ")}}`, interveningFiles };
  return { rung: "disjoint-auto", baseKey: anchor, intervening: intervening.map((e) => e.key), interveningFiles };
}
function canonicalJson(v) {
  if (Array.isArray(v)) return "[" + v.map(canonicalJson).join(",") + "]";
  if (v !== null && typeof v === "object") {
    return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canonicalJson(v[k])).join(",") + "}";
  }
  return JSON.stringify(v);
}
var INFO_ENUMS = {
  criticality: ["crucial", "supporting"],
  classification: ["fact", "analysis", "judgment"],
  source_status: ["unchanged", "modified", "removed"]
};
var MONITOR_FREQ = ["hourly", "daily", "weekly", "monthly", "per_meeting", "none"];
var CONTENT_HASH_RE = /^sha256:[0-9a-f]{64}$/;
async function checkInformationExtension(ctx, findings) {
  if (ctx.fm?.object_type !== "information") return;
  const fm = ctx.fm;
  for (const [field, legal] of Object.entries(INFO_ENUMS)) {
    if (!legal.includes(fm[field])) {
      findings.push(f("C-2.7", "error", `${field} '${fm[field]}' is not one of: ${legal.join(", ")}`));
    }
  }
  const src = fm.source;
  if (!src || typeof src !== "object") findings.push(f("C-2.7", "error", "source block is missing"));
  else for (const k of ["locator", "authority", "retrieved"]) {
    if (!src[k]) findings.push(f("C-2.7", "error", `source.${k} is missing`));
  }
  const mon = fm.monitoring;
  if (!mon || typeof mon !== "object") findings.push(f("C-2.7", "error", "monitoring block is missing"));
  else {
    if (typeof mon.enabled !== "boolean") findings.push(f("C-2.7", "error", `monitoring.enabled '${mon.enabled}' is not boolean`));
    if (!MONITOR_FREQ.includes(mon.frequency)) findings.push(f("C-2.7", "error", `monitoring.frequency '${mon.frequency}' is not one of: ${MONITOR_FREQ.join(", ")}`));
  }
  const ch = fm.content_hash;
  const chOk = typeof ch === "string" && CONTENT_HASH_RE.test(ch);
  if (ch !== void 0 && ch !== null && ch !== "" && !chOk) {
    findings.push(f("C-2.7", "error", `content_hash '${String(ch).slice(0, 24)}\u2026' is not sha256:<64 hex>`));
  }
  const dsRaw = ctx.files.get("data/dataset.json");
  if (dsRaw && chOk) {
    try {
      const canon = canonicalJson(JSON.parse(asText(dsRaw)));
      const actual = "sha256:" + await ctx.sha256(canon);
      if (actual !== ch) {
        findings.push(f(
          "C-2.7",
          "error",
          `content_hash does not match the canonicalized data/dataset.json (declared ${ch.slice(7, 19)}\u2026, actual ${actual.slice(7, 19)}\u2026)`,
          ["refresh content_hash and append a change record", "restore data/dataset.json from history"]
        ));
      }
    } catch {
    }
  }
  if (fm.current_state === "verified") {
    if (!chOk) findings.push(f("C-2.7", "error", "verified state requires a well-formed content_hash"));
    if (!dsRaw) findings.push(f("C-2.7", "error", "verified state requires data/dataset.json"));
    const hasSnap = [...ctx.files.keys()].some((p) => p.startsWith("snapshots/")) || ctx.elided && [...ctx.elided].some((p) => p.startsWith("snapshots/"));
    if (!hasSnap) findings.push(f("C-2.7", "error", "verified state requires at least one file in snapshots/"));
  }
  const chRaw = ctx.files.get("data/changes.json");
  if (chRaw) {
    try {
      const recs = JSON.parse(asText(chRaw));
      const arr = recs && Array.isArray(recs.records) ? recs.records : null;
      if (!arr) findings.push(f("C-2.7", "error", 'data/changes.json must be {"records": [...]}'));
      else for (let i = 0; i < arr.length; i++) {
        const r = arr[i];
        if (!r || !ISO_TS_RE.test(r.detected || "") || !["modified", "removed", "corrected"].includes(r.kind) || !r.summary) {
          findings.push(f("C-2.7", "error", `changes.json records[${i}] lacks detected/kind/summary in the required shape`));
        }
      }
    } catch {
    }
  }
}
var REL_VOCAB = ["cites", "relates_to", "elevated_into", "initiates", "derived_from", "supersedes", "corroborates"];
var EDGE_STATUS = ["proposed", "confirmed", "severed"];
function sectionText(body, heading) {
  const idx = body.indexOf(heading);
  if (idx < 0) return null;
  const next = body.indexOf("\n## ", idx + 1);
  return body.slice(idx, next === -1 ? void 0 : next);
}
var NON_MEMBER_AUTHORS = ["claude", "pwa-client", "daemon", "sweep", "session", "accelerator", "apps-script", "system", "agent", "ai"];
var CAPTURE_GRADES = ["A", "B", "C"];
var ACTOR_CLASSES = ["daemon", "session", "member"];
var ORIGIN_KINDS = ["named_request", "sweep", "member"];
function checkReleaseAuthority(ctx, findings) {
  if (ctx.fm?.object_type !== "information") return;
  const raw = ctx.files.get("data/provenance.json");
  if (!raw) return;
  let reg;
  try {
    reg = JSON.parse(asText(raw));
  } catch {
    return;
  }
  const docs = reg && Array.isArray(reg.documents) ? reg.documents : null;
  if (!docs) {
    findings.push(f("C-18.1", "error", 'data/provenance.json must be {"documents": [...]} (the intake provenance register)'));
    return;
  }
  let sweepOrigin = false;
  docs.forEach((d, i) => {
    if (!d || typeof d !== "object") {
      findings.push(f("C-18.1", "error", `provenance documents[${i}] is not an object`));
      return;
    }
    for (const k of ["file", "locator", "authority", "retrieved"]) {
      if (!d[k]) findings.push(f("C-18.1", "error", `provenance documents[${i}] missing '${k}'`));
    }
    if (d.file && !hasFile_(ctx, String(d.file)) && !Array.isArray(d.parts)) {
      findings.push(f("C-18.1", "error", `provenance documents[${i}] names '${d.file}' which does not exist in the bundle`));
    }
    const cap = d.capture;
    if (!cap || typeof cap !== "object") findings.push(f("C-18.1", "error", `provenance documents[${i}] missing capture block`));
    else {
      if (!cap.method) findings.push(f("C-18.1", "error", `provenance documents[${i}].capture missing 'method'`));
      if (!CAPTURE_GRADES.includes(cap.grade)) findings.push(f("C-18.1", "error", `provenance documents[${i}].capture.grade '${cap.grade}' is not one of: ${CAPTURE_GRADES.join(", ")}`));
      if (!ACTOR_CLASSES.includes(cap.actor_class)) findings.push(f("C-18.1", "error", `provenance documents[${i}].capture.actor_class '${cap.actor_class}' is not one of: ${ACTOR_CLASSES.join(", ")}`));
    }
    const or = d.origin;
    if (!or || typeof or !== "object" || !ORIGIN_KINDS.includes(or.kind)) {
      findings.push(f("C-18.1", "error", `provenance documents[${i}].origin.kind must be one of: ${ORIGIN_KINDS.join(", ")}`));
    } else if (or.kind === "sweep") {
      sweepOrigin = true;
      if (!or.matched_sweep) findings.push(f("C-18.1", "error", `provenance documents[${i}].origin (sweep) missing 'matched_sweep'`));
      if (!or.deeming_actor) findings.push(f("C-18.1", "error", `provenance documents[${i}].origin (sweep) missing 'deeming_actor'`));
    }
  });
  const hist = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];
  const releases = hist.filter((e) => e && e.from_state === "collected" && e.to_state === "verified");
  for (const e of releases) {
    const a = String(e.author || "").toLowerCase();
    if (!a || NON_MEMBER_AUTHORS.includes(a)) {
      findings.push(f(
        "C-18.1",
        "error",
        `collected -> verified transition authored by '${e.author}': release is a named member's decision, never a surface or AI identity (intake doctrine 4a)`,
        ["a named member re-makes the release decision and records the transition under their identity", "return the bundle to collected pending member ratification"]
      ));
    }
  }
  const everVerified = ctx.fm.current_state === "verified" || hist.some((e) => e && e.to_state === "verified");
  const memberRelease = releases.some((e) => {
    const a = String(e.author || "").toLowerCase();
    return a && !NON_MEMBER_AUTHORS.includes(a);
  });
  if (sweepOrigin && everVerified && !memberRelease) {
    findings.push(f(
      "C-18.1",
      "error",
      "sweep-origin intake lands at collected, never higher: verified requires per-document human ratification, a member-authored collected -> verified transition (intake doctrine Section 4)",
      ["set current_state to collected pending ratification", "a named member ratifies and records the collected -> verified transition"]
    ));
  }
}
function latestHistorySnapshot(ctx) {
  const snaps = [...ctx.files.keys()].filter((p) => /^_history\/bundle_.*\.md$/.test(p)).sort();
  return snaps.length ? snaps[snaps.length - 1] : null;
}
function checkAppendOnly(ctx, findings) {
  const snapPath = latestHistorySnapshot(ctx);
  if (!snapPath || !ctx.fm) return;
  const snap = parseFrontmatter(asText(ctx.files.get(snapPath)));
  if (!snap.data) return;
  const prior = Array.isArray(snap.data.state_history) ? snap.data.state_history : [];
  const live = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];
  if (live.length < prior.length) {
    findings.push(f("C-5.1", "error", `state_history shrank from ${prior.length} to ${live.length} entries vs. the latest snapshot`, ["restore from _history and re-append new material"]));
  } else {
    for (let i = 0; i < prior.length; i++) {
      if (JSON.stringify(prior[i]) !== JSON.stringify(live[i])) {
        findings.push(f("C-5.1", "error", `state_history[${i}] was modified retroactively (append-only surface)`, ["restore from _history and re-append new material"]));
        break;
      }
    }
  }
  const rn = sectionText(snap.body, "## Review Notes");
  if (rn && rn.trim() !== "## Review Notes" && !ctx.body.includes(rn.trimEnd())) {
    findings.push(f("C-5.1", "error", "Review Notes content from the prior version is missing or altered (verbatim-immutable)", ["restore from _history and re-append new material", "record a tamper finding if history lacks the original"]));
  }
  const priorLog = sectionText(snap.body, "## Session Log") || "";
  for (const header of priorLog.match(/^### Session .*$/gm) || []) {
    if (!ctx.body.includes(header)) {
      findings.push(f("C-5.1", "error", `Session Log entry '${header.slice(0, 60)}' from the prior version is missing (append-only surface)`, ["restore from _history and re-append new material"]));
    }
  }
  const chSnaps = [...ctx.files.keys()].filter((p) => /^_history\/data\/changes_.*\.json$/.test(p)).sort();
  const liveCh = ctx.files.get("data/changes.json");
  if (chSnaps.length && liveCh) {
    try {
      const priorRecs = JSON.parse(asText(ctx.files.get(chSnaps[chSnaps.length - 1]))).records || [];
      const liveRecs = JSON.parse(asText(liveCh)).records || [];
      if (liveRecs.length < priorRecs.length || JSON.stringify(liveRecs.slice(0, priorRecs.length)) !== JSON.stringify(priorRecs)) {
        findings.push(f("C-5.1", "error", "data/changes.json records were mutated or removed (append-only surface)", ["restore from _history and re-append new material"]));
      }
    } catch {
    }
  }
}
function checkReferences(ctx, findings) {
  const refs = Array.isArray(ctx.fm?.references) ? ctx.fm.references : [];
  for (let i = 0; i < refs.length; i++) {
    const r = refs[i];
    if (typeof r !== "object" || r === null) {
      findings.push(f("C-6.1", "error", `references[${i}] is not an object`));
      continue;
    }
    if (!REL_VOCAB.includes(r.rel)) findings.push(f("C-6.1", "error", `references[${i}].rel '${r.rel}' is not in the closed vocabulary`, ["map to the nearest vocabulary value", "sever with reason"]));
    if (!EDGE_STATUS.includes(r.status)) findings.push(f("C-6.1", "error", `references[${i}].status '${r.status}' is not one of: ${EDGE_STATUS.join(", ")}`));
    const t = r.target;
    if (typeof t !== "string" || /:\/\/|[/\\]|drive\.google/i.test(t)) {
      findings.push(f("C-6.1", "error", `references[${i}].target '${String(t).slice(0, 40)}' looks like a substrate locator; targets are canonical IDs only`));
    } else if (!BUNDLE_ID_RE.test(t)) {
      findings.push(f("C-6.1", "error", `references[${i}].target '${t}' does not match the canonical ID grammar`));
    } else if (ctx.resolveTarget) {
      if (!ctx.resolveTarget(t)) {
        findings.push(f("C-6.2", "error", `references[${i}].target '${t}' does not resolve in the store`, ["restore target from history", "re-point to the successor object (derived_from chain)", "sever the edge with a reason note"]));
      }
    }
  }
  if (ctx.fm?.object_type === "problem" && ctx.fm.current_state === "elevated") {
    if (!refs.some((r) => r && r.rel === "elevated_into")) {
      findings.push(f("C-6.3", "error", "an elevated Problem must carry at least one 'elevated_into' reference"));
    }
  }
  if (ctx.fm?.workproduct_state === "distributed") {
    const hasDist = [...ctx.files.keys()].some((p) => p.startsWith("distributions/"));
    if (!hasDist) findings.push(f("C-6.3", "error", "workproduct_state is distributed but distributions/ is empty"));
  }
}
function checkHistoryCoherence(ctx, findings) {
  const histFiles = [...ctx.files.keys()].filter((p) => p.startsWith("_history/"));
  const manRaw = ctx.files.get("_history/manifest.json");
  if (!manRaw) {
    if (histFiles.length) findings.push(f("C-12.1", "error", "_history contains files but no manifest.json", ["rebuild manifest entry from surviving files"]));
    return;
  }
  let man;
  try {
    man = JSON.parse(asText(manRaw));
  } catch {
    findings.push(f("C-12.1", "error", "_history/manifest.json does not parse", ["rebuild manifest entry from surviving files"]));
    return;
  }
  const entries = Array.isArray(man.entries) ? man.entries : [];
  const keys = /* @__PURE__ */ new Set();
  let prevKey = "";
  const bundleMdCreated = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    for (const k of ["key", "kind", "created", "files"]) if (!(k in (e || {}))) findings.push(f("C-12.1", "error", `manifest entry[${i}] missing '${k}'`));
    if (e?.key) {
      if (keys.has(e.key)) findings.push(f("C-12.1", "error", `duplicate manifest key '${e.key}'`));
      if (e.key < prevKey) findings.push(f("C-12.1", "error", `manifest keys out of order at '${e.key}'`));
      keys.add(e.key);
      prevKey = e.key;
    }
    if (typeof e?.created === "string" && Array.isArray(e?.snapshotted) && e.snapshotted.includes("bundle.md")) {
      bundleMdCreated.push(e.created);
    }
    if (e?.kind === "promotion" && e.key && !ctx.files.has(`_history/promotion_${e.key}.json`)) {
      findings.push(f("C-12.2", "error", `promotion record for '${e.key}' is missing`, ["rebuild manifest entry from surviving files", "record a history-loss finding and re-snapshot current state"]));
    }
    if (Array.isArray(e?.snapshotted)) {
      for (const name of e.snapshotted) {
        const dot = name.lastIndexOf(".");
        const snapPath = `_history/${name.slice(0, dot)}_${e.key}${name.slice(dot)}`;
        if (!hasFile_(ctx, snapPath)) {
          findings.push(f("C-12.2", "error", `snapshot '${snapPath}' recorded in manifest entry '${e.key}' is missing`, ["record a history-loss finding and re-snapshot current state"]));
        }
      }
    }
  }
  const REFUSAL_RECORD = /^_history\/refused_(\d{8}T\d{6}Z_[0-9a-f]{8,64}|unknown_[0-9a-f]{8,64}|[^/]*nomanifest)\.json$/;
  const REFUSAL_PAYLOAD = /^_history\/refused_(\d{8}T\d{6}Z_[0-9a-f]{8,64}|unknown_[0-9a-f]{8,64}|[^/]*nomanifest)\//;
  for (const p of histFiles) {
    if (p === "_history/manifest.json") continue;
    const rec = REFUSAL_RECORD.exec(p);
    if (rec) {
      let parsed = null;
      try {
        parsed = JSON.parse(asText(ctx.files.get(p)));
      } catch {
      }
      if (!parsed || !parsed.outcome) {
        findings.push(f(
          "C-12.2",
          "error",
          `refusal record '${p}' does not parse or names no outcome`,
          ["restore the refusal record from history", "remove the unexplained refusal artifacts"]
        ));
      }
      continue;
    }
    const pay = REFUSAL_PAYLOAD.exec(p);
    if (pay) {
      const sibling = `_history/refused_${pay[1]}.json`;
      if (!ctx.files.has(sibling)) {
        findings.push(f(
          "C-12.2",
          "error",
          `preserved refusal payload '${p}' has no refusal record at '${sibling}'`,
          ["restore the refusal record", "remove the orphaned preserved payload"]
        ));
      }
      continue;
    }
    const m = /_((?:\d{8}T\d{6}Z)_[0-9a-f]{8})\./.exec(p) || /^_history\/promotion_(.+)\.json$/.exec(p);
    const key = m ? m[1] : null;
    if (!key || !keys.has(key)) {
      findings.push(f("C-12.2", "error", `history file '${p}' maps to no manifest entry`, ["rebuild manifest entry from surviving files"]));
    }
  }
  const sorted = bundleMdCreated.slice().sort();
  sorted.pop();
  const newestPrior = sorted.length ? sorted[sorted.length - 1] : "";
  if (typeof ctx.fm?.last_updated === "string" && newestPrior && ctx.fm.last_updated < newestPrior) {
    findings.push(f(
      "C-12.1",
      "error",
      `live last_updated '${ctx.fm.last_updated}' precedes an earlier history entry '${newestPrior}': the live bundle.md is older than a version already superseded`,
      ["restore the newer bundle.md from history", "correct last_updated to reflect the live content"]
    ));
  }
}
function checkRecheckCoverage(ctx, findings) {
  if (ctx.fm?.object_type !== "problem") return;
  const rts = Array.isArray(ctx.fm.recheck_triggers) ? ctx.fm.recheck_triggers : [];
  if (rts.length === 0) {
    findings.push(f("C-15.1", "error", "every Problem, in every disposition including dismissed, carries at least one recheck trigger", ["author a trigger, dual-audience shape, dated when time-bound"]));
    return;
  }
  for (let i = 0; i < rts.length; i++) {
    const t = rts[i];
    if (typeof t !== "object" || !t?.text || !t?.description) {
      findings.push(f("C-15.1", "error", `recheck_triggers[${i}] lacks the dual-audience {text, description} shape`));
    } else if (t.date !== void 0 && !/^\d{4}-\d{2}-\d{2}$/.test(String(t.date))) {
      findings.push(f("C-15.1", "error", `recheck_triggers[${i}].date '${t.date}' is not YYYY-MM-DD`));
    }
  }
}
var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function checkProblemExtension(ctx, findings) {
  if (ctx.fm?.object_type !== "problem") return;
  const fm = ctx.fm;
  if (!["agent", "human"].includes(fm.surfaced_by)) {
    findings.push(f("C-2.8", "error", `surfaced_by '${fm.surfaced_by}' is not one of: agent, human`));
  }
  if (["deferred", "dismissed"].includes(fm.current_state)) {
    if (typeof fm.disposition_reason !== "string" || fm.disposition_reason.trim() === "") {
      findings.push(f("C-2.8", "error", `${fm.current_state} state requires a non-empty disposition_reason`));
    }
  }
}
function checkProjectExtension(ctx, findings) {
  if (ctx.fm?.object_type !== "project") return;
  const fm = ctx.fm;
  if (typeof fm.objective !== "string" || fm.objective.trim() === "") {
    findings.push(f("C-2.9", "error", "objective is missing or empty"));
  }
  const WS = ["draft", "internally_checked", "externally_compliant", "distributed"];
  if (fm.workproduct_state !== void 0 && fm.workproduct_state !== null && !WS.includes(fm.workproduct_state)) {
    findings.push(f("C-2.9", "error", `workproduct_state '${fm.workproduct_state}' is not one of: ${WS.join(", ")}`));
  }
  const evals = Array.isArray(fm.evaluations) ? fm.evaluations : [];
  for (let i = 0; i < evals.length; i++) {
    const e = evals[i];
    if (!e || !["compliance", "argument"].includes(e.kind) || !["internal", "external"].includes(e.strictness) || !["pass", "findings"].includes(e.result) || !ISO_TS_RE.test(e.timestamp || "")) {
      findings.push(f("C-2.9", "error", `evaluations[${i}] lacks the required kind/strictness/result/timestamp shape`));
    } else if (e.result === "findings" && !e.findings_ref) {
      findings.push(f("C-2.9", "error", `evaluations[${i}] result is findings but findings_ref is empty`));
    }
  }
  if (fm.current_state === "closed" && !["resolved", "superseded", "abandoned"].includes(fm.closed_reason)) {
    findings.push(f("C-2.9", "error", `closed state requires closed_reason in: resolved, superseded, abandoned`));
  }
  const ws = fm.workproduct_state;
  const passed = (kind, stricts) => evals.some((e) => e && e.kind === kind && e.result === "pass" && stricts.includes(e.strictness));
  if (["internally_checked", "externally_compliant", "distributed"].includes(ws)) {
    for (const kind of ["compliance", "argument"]) {
      if (!passed(kind, ["internal", "external"])) {
        findings.push(f(
          "C-9.1",
          "error",
          `workproduct_state '${ws}' requires a passing ${kind} evaluation (internal strictness or better)`,
          ["run the missing evaluation", "demote workproduct_state to the highest earned rung"]
        ));
      }
    }
  }
  if (["externally_compliant", "distributed"].includes(ws)) {
    for (const kind of ["compliance", "argument"]) {
      if (!passed(kind, ["external"])) {
        findings.push(f(
          "C-9.1",
          "error",
          `workproduct_state '${ws}' requires a passing external-strictness ${kind} evaluation`,
          ["run the missing evaluation", "demote workproduct_state to the highest earned rung"]
        ));
      }
    }
  }
}
function checkCitationRegister(ctx, findings) {
  const raw = ctx.files.get("data/citations.json");
  if (!raw) return;
  let reg;
  try {
    reg = JSON.parse(asText(raw));
  } catch {
    return;
  }
  const claims = Array.isArray(reg?.claims) ? reg.claims : null;
  if (!claims) {
    findings.push(f("C-8.1", "error", 'data/citations.json must be {"claims": [...]}'));
    return;
  }
  for (let i = 0; i < claims.length; i++) {
    const c = claims[i];
    if (!c || !c.claim_id || !c.claim || !Array.isArray(c.cites) || c.cites.length === 0 || !c.snapshot || !DATE_RE.test(c.as_of || "")) {
      findings.push(f(
        "C-8.1",
        "error",
        `citations claims[${i}] lacks claim_id/claim/cites[]/snapshot/as_of`,
        ["supply keys resolving to an Information object", "demote claim to commentary", "move claim to Open Questions"]
      ));
      continue;
    }
    if (!CONTENT_HASH_RE.test(c.hash || "")) {
      findings.push(f("C-8.1", "error", `citations ${c.claim_id}: hash '${String(c.hash).slice(0, 20)}' is not sha256:<64 hex>`));
    }
    for (const t of c.cites) {
      if (!BUNDLE_ID_RE.test(t)) {
        findings.push(f("C-8.1", "error", `citations ${c.claim_id}: cite '${t}' is not a canonical ID`));
      } else if (ctx.resolveTarget && !ctx.resolveTarget(t)) {
        findings.push(f(
          "C-8.1",
          "error",
          `citations ${c.claim_id}: cite '${t}' does not resolve in the store`,
          ["supply keys resolving to an Information object", "demote claim to commentary", "move claim to Open Questions"]
        ));
      }
    }
  }
}
function checkActionExtension(ctx, findings) {
  if (ctx.fm?.object_type !== "action") return;
  const fm = ctx.fm;
  const KINDS = ["cpra_request", "grand_jury", "controller_referral", "public_comment", "media", "litigation_support", "other"];
  if (!KINDS.includes(fm.action_kind)) findings.push(f("C-2.10", "error", `action_kind '${fm.action_kind}' is not in the suite`));
  if (![1, 2, 3].includes(fm.risk_tier)) findings.push(f("C-2.10", "error", `risk_tier '${fm.risk_tier}' is not 1, 2, or 3`));
  if (typeof fm.counterparty !== "string" || fm.counterparty.trim() === "") {
    findings.push(f("C-2.10", "error", "counterparty is missing or empty"));
  }
  if (fm.current_state === "resolved" && !["complied", "denied", "escalated", "withdrawn"].includes(fm.resolution)) {
    findings.push(f("C-2.10", "error", "resolved state requires resolution in: complied, denied, escalated, withdrawn"));
  }
  const clock = Array.isArray(fm.clock) ? fm.clock : [];
  const today = new Date(ctx.nowMs ?? Date.now()).toISOString().slice(0, 10);
  const STATUSES = ["pending", "met", "overdue", "waived"];
  for (let i = 0; i < clock.length; i++) {
    const e = clock[i];
    if (!e || !e.text || !e.description) {
      findings.push(f("C-11.1", "error", `clock[${i}] lacks the dual-audience {text, description} shape`));
      continue;
    }
    if (!DATE_RE.test(e.date || "")) findings.push(f("C-11.1", "error", `clock[${i}].date '${e.date}' is not YYYY-MM-DD`));
    if (typeof e.basis !== "string" || e.basis.trim() === "") {
      findings.push(f("C-11.1", "error", `clock[${i}] has no basis (the statute, order, or commitment the date derives from)`, ["supply basis"]));
    }
    if (!STATUSES.includes(e.status)) findings.push(f("C-11.1", "error", `clock[${i}].status '${e.status}' is not one of: ${STATUSES.join(", ")}`));
    if (DATE_RE.test(e.date || "") && e.date < today && e.status === "pending") {
      findings.push(f(
        "C-11.1",
        "error",
        `clock[${i}] '${e.text}' is silently past-due (${e.date} < today, status still pending)`,
        ["mark overdue", "mark met", "mark waived with reason"]
      ));
    }
  }
}
function checkDeletionRecords(ctx, findings) {
  const raw = ctx.files.get("data/deletions.json");
  if (!raw) return;
  let del;
  try {
    del = JSON.parse(asText(raw));
  } catch {
    return;
  }
  const recs = Array.isArray(del?.records) ? del.records : null;
  if (!recs) {
    findings.push(f("C-7.1", "error", 'data/deletions.json must be {"records": [...]}'));
    return;
  }
  for (let i = 0; i < recs.length; i++) {
    const r = recs[i];
    if (!r || !ISO_TS_RE.test(r.timestamp || "") || typeof r.reason !== "string" || r.reason.trim() === "" || !Array.isArray(r.items) || r.items.length === 0 || !r.preserved_to) {
      findings.push(f(
        "C-7.1",
        "error",
        `deletions records[${i}] lacks timestamp/reason/items[]/preserved_to`,
        ["restore removed material", "convert to a gated deletion retroactively: reason, preservation, cascade"]
      ));
    }
  }
}
function isPublicHttpsLocator(url) {
  if (typeof url !== "string" || !/^https:\/\//.test(url)) return false;
  const m = /^https:\/\/([^/?#]+)/.exec(url);
  if (!m) return false;
  const hostport = m[1];
  if (hostport.indexOf("@") !== -1) return false;
  const host = hostport.split(":")[0].toLowerCase();
  if (host === "localhost" || host.charAt(0) === "[") return false;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return false;
  if (host.indexOf(".") === -1) return false;
  return true;
}
var GATH_ID_RE = /^GATH-\d{4}-\d{4}-[a-z0-9]+(-[a-z0-9]+)*$/;
var CRITICALITY_ENUM = ["crucial", "supporting"];
var CADENCE_ENUM = ["hourly", "daily", "weekly", "monthly", "none"];
var GATH_STATUS_ENUM = ["open", "captured", "retired"];
function checkRegisterIntegrity(ctx, findings) {
  if (ctx.fm?.object_type !== "information") return;
  const raw = ctx.files.get("data/provenance.json");
  if (!raw) return;
  let reg;
  try {
    reg = JSON.parse(asText(raw));
  } catch {
    return;
  }
  const docs = reg && Array.isArray(reg.documents) ? reg.documents : null;
  if (!docs) return;
  const byHash = {};
  for (let i = 0; i < docs.length; i++) {
    const h = docs[i] && docs[i].capture && docs[i].capture.sha256;
    if (!h) continue;
    (byHash[h] = byHash[h] || []).push(i);
  }
  for (const h of Object.keys(byHash)) {
    if (byHash[h].length > 1) {
      findings.push(f(
        "C-18.3",
        "error",
        `capture hash ${h.slice(0, 16)}\u2026 appears in ${byHash[h].length} register documents (indices ${byHash[h].join(", ")}); identical content is corroboration on one entry, never duplicate review items`,
        ["fold the duplicates into corroborations[] on the earliest entry", "if the captures genuinely differ, correct the recorded hashes"]
      ));
    }
  }
  if (ctx.fm.criticality === "crucial") {
    for (let i = 0; i < docs.length; i++) {
      const d = docs[i];
      if (!d || typeof d !== "object") continue;
      if (!d.co_archive && !d.timestamp) {
        findings.push(f(
          "C-18.4",
          "warn",
          `crucial-criticality document[${i}] (${d.file || "?"}) carries neither co_archive nor timestamp; a reviewing member must verify co-attestation before release (F4)`,
          ["attach a co-archive or trusted timestamp", "record the verified provenance in Review Notes at ratification"]
        ));
      }
    }
  }
}
var CAPTURE_ENCODINGS = ["utf8", "base64", "binary"];
var HIST_TS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
var RAW_SHA_RE = /^[0-9a-f]{64}$/;
function b64ToBytes(s) {
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const clean = String(s).replace(/[\s=]+/g, "");
  const out = new Uint8Array(Math.floor(clean.length * 3 / 4));
  let o = 0, buf = 0, bits = 0;
  for (let i = 0; i < clean.length; i++) {
    const v = A.indexOf(clean[i]);
    if (v === -1) throw new Error("invalid base64 at position " + i);
    buf = buf << 6 | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[o++] = buf >> bits & 255;
    }
  }
  return out.subarray(0, o);
}
function createSha256() {
  const K = [
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ];
  let h0 = 1779033703 | 0, h1 = 3144134277 | 0, h2 = 1013904242 | 0, h3 = 2773480762 | 0;
  let h4 = 1359893119 | 0, h5 = 2600822924 | 0, h6 = 528734635 | 0, h7 = 1541459225 | 0;
  const buf = new Uint8Array(64);
  const w = new Int32Array(64);
  let bufLen = 0;
  let total = 0;
  let finalized = false;
  function compress(bytes, off) {
    for (let i = 0; i < 16; i++) {
      w[i] = bytes[off] << 24 | bytes[off + 1] << 16 | bytes[off + 2] << 8 | bytes[off + 3];
      off += 4;
    }
    for (let i = 16; i < 64; i++) {
      const x = w[i - 15], y = w[i - 2];
      const s0 = (x >>> 7 | x << 25) ^ (x >>> 18 | x << 14) ^ x >>> 3;
      const s1 = (y >>> 17 | y << 15) ^ (y >>> 19 | y << 13) ^ y >>> 10;
      w[i] = w[i - 16] + s0 + w[i - 7] + s1 | 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f2 = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
      const ch = e & f2 ^ ~e & g;
      const t1 = h + S1 + ch + K[i] + w[i] | 0;
      const S0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
      const maj = a & b ^ a & c ^ b & c;
      const t2 = S0 + maj | 0;
      h = g;
      g = f2;
      f2 = e;
      e = d + t1 | 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 | 0;
    }
    h0 = h0 + a | 0;
    h1 = h1 + b | 0;
    h2 = h2 + c | 0;
    h3 = h3 + d | 0;
    h4 = h4 + e | 0;
    h5 = h5 + f2 | 0;
    h6 = h6 + g | 0;
    h7 = h7 + h | 0;
  }
  return {
    /** Feed a chunk of bytes. Chainable. */
    update(chunk) {
      if (finalized) throw new Error("sha256 stream already finalized");
      let c = chunk;
      if (!(c instanceof Uint8Array)) c = Uint8Array.from(c);
      let i = 0;
      const n = c.length;
      total += n;
      if (bufLen > 0) {
        while (bufLen < 64 && i < n) buf[bufLen++] = c[i++];
        if (bufLen === 64) {
          compress(buf, 0);
          bufLen = 0;
        }
      }
      while (n - i >= 64) {
        compress(c, i);
        i += 64;
      }
      while (i < n) buf[bufLen++] = c[i++];
      return this;
    },
    /** Finalize and return the lowercase hex digest. */
    hex() {
      if (finalized) throw new Error("sha256 stream already finalized");
      finalized = true;
      const bitHi = Math.floor(total / 536870912);
      const bitLo = total % 536870912 * 8;
      buf[bufLen++] = 128;
      if (bufLen > 56) {
        while (bufLen < 64) buf[bufLen++] = 0;
        compress(buf, 0);
        bufLen = 0;
      }
      while (bufLen < 56) buf[bufLen++] = 0;
      buf[56] = bitHi >>> 24 & 255;
      buf[57] = bitHi >>> 16 & 255;
      buf[58] = bitHi >>> 8 & 255;
      buf[59] = bitHi & 255;
      buf[60] = bitLo >>> 24 & 255;
      buf[61] = bitLo >>> 16 & 255;
      buf[62] = bitLo >>> 8 & 255;
      buf[63] = bitLo & 255;
      compress(buf, 0);
      let out = "";
      const H = [h0, h1, h2, h3, h4, h5, h6, h7];
      for (let i = 0; i < 8; i++) {
        const v = H[i] >>> 0;
        out += ("00000000" + v.toString(16)).slice(-8);
      }
      return out;
    }
  };
}
function storedToHashable(v, encoding) {
  if (encoding === "base64") return b64ToBytes(asText(v));
  return v;
}
async function checkInfo2Contract(ctx, findings) {
  if (ctx.fm?.object_type !== "information" || ctx.fm?.schema !== "information@2") return;
  const raw = ctx.files.get("data/provenance.json");
  if (!raw) {
    findings.push(f("C-18.1", "error", "information@2 requires data/provenance.json: the schema bump makes the intake provenance register mandatory"));
    return;
  }
  let reg;
  try {
    reg = JSON.parse(asText(raw));
  } catch {
    return;
  }
  const docs = reg && Array.isArray(reg.documents) ? reg.documents : null;
  if (!docs) return;
  for (let i = 0; i < docs.length; i++) {
    const d = docs[i];
    if (!d || typeof d !== "object") continue;
    const cap = d.capture && typeof d.capture === "object" ? d.capture : {};
    if (!CAPTURE_ENCODINGS.includes(cap.encoding)) {
      findings.push(f("C-18.1", "error", `provenance documents[${i}].capture.encoding '${cap.encoding}' is not one of: ${CAPTURE_ENCODINGS.join(", ")} (@2)`));
    }
    const or = d.origin && typeof d.origin === "object" ? d.origin : {};
    if (or.kind === "member") {
      if (cap.actor_class !== "member") {
        findings.push(f("C-18.1", "error", `provenance documents[${i}]: member-origin capture must record actor_class 'member' (@2)`));
      }
      const c = d.custody;
      if (!c || typeof c !== "object") {
        findings.push(f("C-18.1", "error", `provenance documents[${i}]: member-origin document missing custody block {holder, obtained, setting, attestation} (doctrine 3a) (@2)`));
      } else {
        for (const k of ["holder", "setting", "attestation"]) {
          if (!c[k]) findings.push(f("C-18.1", "error", `provenance documents[${i}].custody missing '${k}' (@2)`));
        }
        if (!HIST_TS_RE.test(c.obtained || "")) {
          findings.push(f("C-18.1", "error", `provenance documents[${i}].custody.obtained '${c.obtained}' is not YYYY-MM-DDTHH:MM:SSZ (@2)`));
        }
      }
      if (d.attestation_attempts === void 0) {
        findings.push(f("C-18.1", "error", `provenance documents[${i}]: member-origin document missing attestation_attempts; the 7.7 asymmetry is recorded honestly, attempted false with the reason in note (@2)`));
      }
    }
    if (d.attestation_attempts !== void 0) {
      if (!Array.isArray(d.attestation_attempts)) {
        findings.push(f("C-18.1", "error", `provenance documents[${i}].attestation_attempts must be an array (@2)`));
      } else {
        d.attestation_attempts.forEach((a, j) => {
          if (!a || typeof a !== "object" || !a.service || typeof a.attempted !== "boolean" || typeof a.ok !== "boolean") {
            findings.push(f("C-18.1", "error", `provenance documents[${i}].attestation_attempts[${j}] lacks the {service, attempted, ok} shape (@2)`));
          }
        });
      }
    }
    if (d.parts !== void 0) {
      if (!Array.isArray(d.parts) || !d.parts.length) {
        findings.push(f("C-18.1", "error", `provenance documents[${i}].parts must be a nonempty array (@2)`));
      } else {
        if (!RAW_SHA_RE.test(cap.sha256 || "")) {
          findings.push(f("C-18.1", "error", `provenance documents[${i}]: parts require capture.sha256 over the reassembled whole (@2)`));
        }
        d.parts.forEach((p, j) => {
          if (!p || typeof p !== "object" || !p.file || !RAW_SHA_RE.test(p.sha256 || "") || !(Number.isInteger(p.bytes) && p.bytes > 0)) {
            findings.push(f("C-18.1", "error", `provenance documents[${i}].parts[${j}] lacks the {file, sha256, bytes} shape (@2)`));
          } else if (!hasFile_(ctx, String(p.file))) {
            findings.push(f("C-18.1", "error", `provenance documents[${i}].parts[${j}] names '${p.file}' which does not exist in the bundle (@2)`));
          }
        });
      }
    }
    if (d.derived !== void 0) {
      const dv = d.derived;
      const shapeOk = dv && typeof dv === "object" && dv.transform && dv.reason && (dv.from_file || dv.from_ref);
      if (!shapeOk) {
        findings.push(f("C-18.1", "error", `provenance documents[${i}].derived lacks the {transform, reason, from_file|from_ref} shape (doctrine 4a) (@2)`));
      } else if (dv.from_file && !hasFile_(ctx, String(dv.from_file))) {
        findings.push(f("C-18.1", "error", `provenance documents[${i}].derived.from_file '${dv.from_file}' does not exist in the bundle (@2)`));
      }
    }
  }
  if (reg.releases !== void 0) {
    if (!Array.isArray(reg.releases)) {
      findings.push(f("C-18.1", "error", "provenance releases must be an array (@2)"));
    } else {
      reg.releases.forEach((r, i) => {
        if (!r || typeof r !== "object" || !HIST_TS_RE.test(r.transition || "") || !r.author) {
          findings.push(f("C-18.1", "error", `provenance releases[${i}] lacks the {transition, author} shape (@2)`));
          return;
        }
        if (r.signature_file) {
          if (!hasFile_(ctx, String(r.signature_file))) {
            findings.push(f("C-18.1", "error", `provenance releases[${i}].signature_file '${r.signature_file}' does not exist in the bundle (@2)`));
          }
          if (!r.signer) findings.push(f("C-18.1", "error", `provenance releases[${i}] carries a signature_file but no signer (@2)`));
          if (r.namespace !== "bio-release") {
            findings.push(f("C-18.1", "error", `provenance releases[${i}].namespace '${r.namespace}' must be 'bio-release' (ssh-keygen -Y namespace discipline) (@2)`));
          }
        }
      });
    }
  }
  const hist = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];
  const rels = Array.isArray(reg.releases) ? reg.releases : [];
  for (const e of hist) {
    if (!e || e.from_state !== "collected" || e.to_state !== "verified") continue;
    const signed = rels.some((r) => r && r.transition === e.timestamp && r.signature_file);
    if (!signed) {
      findings.push(f(
        "C-18.7",
        "warn",
        `collected -> verified transition at ${e.timestamp} has no signed release record; the target mechanism is a detached SSH signature over the transition record (ssh-keygen -Y sign, namespace bio-release; doctrine 4a)`,
        ["sign the transition record and add the releases[] entry with signature_file, signer, namespace", "record the interim member review of the release log in Review Notes"]
      ));
    }
  }
  for (let i = 0; i < docs.length; i++) {
    const d = docs[i];
    if (!d || typeof d !== "object") continue;
    const cap = d.capture && typeof d.capture === "object" ? d.capture : {};
    if (!RAW_SHA_RE.test(cap.sha256 || "") || !CAPTURE_ENCODINGS.includes(cap.encoding)) continue;
    let hashable = null;
    let actual = null;
    try {
      if (Array.isArray(d.parts) && d.parts.length && d.parts.every((p) => p && p.file && ctx.files.has(String(p.file)))) {
        const stored = d.parts.map((p) => ctx.files.get(String(p.file)));
        const textStored = (v) => cap.encoding !== "base64" && typeof v === "string";
        if (stored.every((v) => textStored(v))) {
          hashable = stored.join("");
        } else if (stored.every((v) => !textStored(v))) {
          const h = createSha256();
          for (const v of stored) h.update(cap.encoding === "base64" ? b64ToBytes(asText(v)) : v);
          actual = h.hex();
        } else {
          throw new Error("parts mix text and binary storage");
        }
      } else if (d.file && ctx.files.has(String(d.file))) {
        hashable = storedToHashable(ctx.files.get(String(d.file)), cap.encoding);
      }
    } catch (err) {
      findings.push(f("C-18.6", "error", `provenance documents[${i}]: stored content could not be decoded for hash verification (${err && err.message}) (@2)`));
      continue;
    }
    if (actual === null) {
      if (hashable === null) continue;
      actual = await ctx.sha256(hashable);
    }
    if (actual !== cap.sha256) {
      findings.push(f(
        "C-18.6",
        "error",
        `provenance documents[${i}]: stored bytes hash ${actual.slice(0, 12)}\u2026 but the register records ${String(cap.sha256).slice(0, 12)}\u2026; silent content mutation fails the gate (@2)`,
        ["restore the capture from history", "correct the register only if the recorded hash was wrong at intake, with a Session Log entry"]
      ));
    }
  }
}
function checkGatheringGrammar(ctx, findings) {
  const raw = ctx.files.get("data/gathering.json");
  if (!raw) return;
  let g;
  try {
    g = JSON.parse(asText(raw));
  } catch {
    return;
  }
  if (typeof g !== "object" || g === null || Array.isArray(g)) {
    findings.push(f("C-18.5", "error", "data/gathering.json must be a JSON object"));
    return;
  }
  if (g.daemon !== void 0) {
    const dmn = g.daemon;
    if (typeof dmn !== "object" || dmn === null || Array.isArray(dmn)) {
      findings.push(f("C-18.5", "error", "gathering.json daemon block must be an object"));
    } else {
      if (typeof dmn.enabled !== "boolean") findings.push(f("C-18.5", "error", "gathering.json daemon.enabled must be boolean"));
      for (const bk of ["tick_budget", "sweep_budget"]) {
        if (dmn[bk] !== void 0 && !(Number.isInteger(dmn[bk]) && dmn[bk] >= 0)) {
          findings.push(f("C-18.5", "error", `gathering.json daemon.${bk} must be a non-negative integer`));
        }
      }
    }
  }
  const reqs = Array.isArray(g.requests) ? g.requests : [];
  for (let i = 0; i < reqs.length; i++) {
    const r = reqs[i];
    if (typeof r !== "object" || r === null) {
      findings.push(f("C-18.5", "error", `gathering.json requests[${i}] is not an object`));
      continue;
    }
    if (!GATH_ID_RE.test(r.id || "")) findings.push(f("C-18.5", "error", `gathering.json requests[${i}].id '${r.id}' does not match the GATH grammar`));
    const tgt = r.target;
    if (!tgt || typeof tgt !== "object") findings.push(f("C-18.5", "error", `gathering.json requests[${i}] missing target block`));
    else {
      if (typeof tgt.text !== "string" || tgt.text.length === 0 || tgt.text.length > 200 || /[\r\n]/.test(tgt.text)) {
        findings.push(f("C-18.5", "error", `gathering.json requests[${i}].target.text must be a nonempty single-line string under 200 chars`));
      }
      if (tgt.description !== void 0 && (typeof tgt.description !== "string" || tgt.description.length > 2e3)) {
        findings.push(f("C-18.5", "error", `gathering.json requests[${i}].target.description must be a string under 2000 chars`));
      }
    }
    const locs = Array.isArray(r.locators) ? r.locators : null;
    if (!locs || locs.length === 0) findings.push(f("C-18.5", "error", `gathering.json requests[${i}].locators must be a nonempty array`));
    else for (let L = 0; L < locs.length; L++) {
      if (!isPublicHttpsLocator(locs[L])) findings.push(f("C-18.5", "error", `gathering.json requests[${i}].locators[${L}] '${String(locs[L]).slice(0, 40)}' is not an https public-host locator`));
    }
    if (typeof r.authority !== "string" || r.authority.trim() === "") findings.push(f("C-18.5", "error", `gathering.json requests[${i}].authority must be a nonempty string`));
    if (!CRITICALITY_ENUM.includes(r.criticality)) findings.push(f("C-18.5", "error", `gathering.json requests[${i}].criticality must be one of: ${CRITICALITY_ENUM.join(", ")}`));
    if (r.cadence !== void 0 && !CADENCE_ENUM.includes(r.cadence)) findings.push(f("C-18.5", "error", `gathering.json requests[${i}].cadence must be one of: ${CADENCE_ENUM.join(", ")}`));
    if (!GATH_STATUS_ENUM.includes(r.status)) findings.push(f("C-18.5", "error", `gathering.json requests[${i}].status must be one of: ${GATH_STATUS_ENUM.join(", ")}`));
    if (r.planted !== void 0 && !ISO_TS_RE.test(r.planted)) findings.push(f("C-18.5", "error", `gathering.json requests[${i}].planted must be an ISO 8601 UTC instant`));
  }
  const sweeps = Array.isArray(g.sweeps) ? g.sweeps : [];
  for (let i = 0; i < sweeps.length; i++) {
    const s = sweeps[i];
    if (typeof s !== "object" || s === null) {
      findings.push(f("C-18.5", "error", `gathering.json sweeps[${i}] is not an object`));
      continue;
    }
    if (typeof s.id !== "string" || s.id.trim() === "") findings.push(f("C-18.5", "error", `gathering.json sweeps[${i}].id must be a nonempty string`));
    if (s.ratified !== void 0 && typeof s.ratified !== "boolean") findings.push(f("C-18.5", "error", `gathering.json sweeps[${i}].ratified must be boolean`));
    if (s.sources !== void 0) {
      if (!Array.isArray(s.sources)) findings.push(f("C-18.5", "error", `gathering.json sweeps[${i}].sources must be an array`));
      else for (let L = 0; L < s.sources.length; L++) if (!isPublicHttpsLocator(s.sources[L])) findings.push(f("C-18.5", "error", `gathering.json sweeps[${i}].sources[${L}] is not an https public-host locator`));
    }
  }
}
var MECHANICAL_FIELD_SETS = {
  "monitor-tick": ["source_status", "monitoring.last_checked", "reeval_pending.flag", "reeval_pending.since", "reeval_pending.source", "last_updated"],
  "sweep": [],
  "deadline-recheck": ["clock[].status", "last_updated"],
  "member-attest": ["last_updated"]
};
var MECHANICAL_APPEND_FILES = ["data/changes.json", "data/provenance.json"];
function flattenFm(fm) {
  const out = {};
  if (!fm || typeof fm !== "object") return out;
  for (const k of Object.keys(fm)) {
    const v = fm[k];
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      for (const c of Object.keys(v)) out[k + "." + c] = canonicalJson(v[c]);
    } else {
      out[k] = canonicalJson(v);
    }
  }
  return out;
}
function fmDiffPaths(prevFm, nextFm) {
  const changed = /* @__PURE__ */ new Set();
  const a = flattenFm(prevFm), b = flattenFm(nextFm);
  const keys = /* @__PURE__ */ new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if (k === "clock") {
      const pc = Array.isArray(prevFm.clock) ? prevFm.clock : [];
      const nc = Array.isArray(nextFm.clock) ? nextFm.clock : [];
      const n = Math.max(pc.length, nc.length);
      for (let i = 0; i < n; i++) {
        const pe = pc[i] || {}, ne = nc[i] || {};
        for (const field of /* @__PURE__ */ new Set([...Object.keys(pe), ...Object.keys(ne)])) {
          if (canonicalJson(pe[field]) !== canonicalJson(ne[field])) changed.add("clock[]." + field);
        }
      }
      continue;
    }
    if (a[k] !== b[k]) changed.add(k);
  }
  return changed;
}
function bodySections(body) {
  const out = {};
  const re = /^## .*$/gm;
  let m, starts = [];
  while ((m = re.exec(body)) !== null) starts.push({ h: m[0].trimEnd(), i: m.index });
  for (let i = 0; i < starts.length; i++) {
    const end = i + 1 < starts.length ? starts[i + 1].i : body.length;
    out[starts[i].h] = body.slice(starts[i].i, end);
  }
  return out;
}
async function checkMechanicalConformance(ctx, findings) {
  const manRaw = ctx.files.get("_history/manifest.json");
  if (!manRaw) return;
  let man;
  try {
    man = JSON.parse(asText(manRaw));
  } catch {
    return;
  }
  const entries = Array.isArray(man.entries) ? [...man.entries].sort((a, b) => a.key < b.key ? -1 : 1) : [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (!e || e.kind !== "promotion" || !e.key) continue;
    const recRaw = ctx.files.get(`_history/promotion_${e.key}.json`);
    if (!recRaw) continue;
    let rec;
    try {
      rec = JSON.parse(asText(recRaw));
    } catch {
      continue;
    }
    const man2 = rec.manifest || rec;
    const writer = man2.writer || rec.writer;
    if (writer !== "mechanical") continue;
    const op = man2.operation || rec.operation;
    if (!op || !(op in MECHANICAL_FIELD_SETS)) {
      findings.push(f(
        "C-20.1",
        "error",
        `history entry '${e.key}' is marked mechanical but names undeclared operation '${op}'`,
        ["a mechanical promotion must name a registered operation", "if hand-authored, remove the mechanical marker"]
      ));
      continue;
    }
    const preSnapPath = `_history/bundle_${e.key}.md`;
    const preSnap = ctx.files.has(preSnapPath) ? ctx.files.get(preSnapPath) : null;
    const base = man2.base;
    const isCreation = base === EMPTY_STRING_SHA || preSnap === null;
    let postRaw = null, postUnknowable = false;
    for (let j = i + 1; j < entries.length; j++) {
      const p = `_history/bundle_${entries[j].key}.md`;
      if (ctx.files.has(p)) {
        postRaw = ctx.files.get(p);
        break;
      }
      if ((entries[j].files || []).includes("bundle.md")) {
        postUnknowable = true;
        break;
      }
    }
    if (postRaw === null && !postUnknowable) {
      const liveRaw = ctx.files.get("bundle.md");
      if (liveRaw) {
        const rb = Array.isArray(man2.files) ? man2.files.find((x) => x.name === "bundle.md") : null;
        if (rb && rb.sha256) {
          const liveHash = await ctx.sha256(liveRaw);
          if (liveHash === rb.sha256) postRaw = liveRaw;
          else postUnknowable = true;
        } else {
          postRaw = liveRaw;
        }
      }
    }
    if (!postRaw) continue;
    const post = parseFrontmatter(asText(postRaw));
    if (isCreation) {
      if (post.data && post.data.current_state && post.data.current_state !== "collected" && post.data.object_type === "information") {
        findings.push(f(
          "C-20.1",
          "error",
          `mechanical creation '${e.key}' lands at '${post.data.current_state}', not collected (daemon creations never elevate)`,
          ["re-produce the creation at collected", "if a member released it, the release transition must be a separate member-authored promotion"]
        ));
      }
      continue;
    }
    const prev = parseFrontmatter(asText(preSnap));
    const allowed = new Set(MECHANICAL_FIELD_SETS[op]);
    const changed = fmDiffPaths(prev.data || {}, post.data || {});
    for (const path of changed) {
      if (!allowed.has(path)) {
        findings.push(f(
          "C-20.1",
          "error",
          `mechanical '${op}' promotion '${e.key}' changed frontmatter '${path}', outside its declared field set {${[...allowed].join(", ")}}`,
          ["revert the out-of-envelope change", "if the change is legitimate, it belongs to a member-authored promotion, not a mechanical one"]
        ));
      }
    }
    const prevSec = bodySections(prev.body || ""), postSec = bodySections(post.body || "");
    for (const h of /* @__PURE__ */ new Set([...Object.keys(prevSec), ...Object.keys(postSec)])) {
      if (h === "## Session Log") continue;
      if ((prevSec[h] || "") !== (postSec[h] || "")) {
        findings.push(f(
          "C-20.1",
          "error",
          `mechanical '${op}' promotion '${e.key}' changed body section '${h}'; a mechanical writer touches only the Session Log`,
          ["revert the body change outside the Session Log"]
        ));
      }
    }
    const touched = Array.isArray(man2.files) ? man2.files.map((x) => x.name) : [];
    for (const name of touched) {
      const ok = name === "bundle.md" || name.startsWith("snapshots/") || MECHANICAL_APPEND_FILES.includes(name);
      if (!ok) {
        findings.push(f(
          "C-20.1",
          "error",
          `mechanical '${op}' promotion '${e.key}' wrote '${name}', outside the mechanical envelope (bundle.md, snapshots/, ${MECHANICAL_APPEND_FILES.join(", ")})`,
          ["revert the out-of-envelope write"]
        ));
      }
    }
  }
}
var EMPTY_STRING_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
var D2 = new Float64Array([
  61785,
  9906,
  39828,
  60374,
  45398,
  33411,
  5274,
  224,
  53552,
  61171,
  33010,
  6542,
  64743,
  22239,
  55772,
  9222
]);
var DD = new Float64Array([
  30883,
  4953,
  19914,
  30187,
  55467,
  16705,
  2637,
  112,
  59544,
  30585,
  16505,
  36039,
  65139,
  11119,
  27886,
  20995
]);
var GF0 = new Float64Array(16);
var GF1 = (() => {
  const g = new Float64Array(16);
  g[0] = 1;
  return g;
})();
var I25 = new Float64Array([
  41136,
  18958,
  6951,
  50414,
  58488,
  44335,
  6150,
  12099,
  55207,
  15867,
  153,
  11085,
  57099,
  20417,
  9344,
  11139
]);
var BX = new Float64Array([
  54554,
  36645,
  11616,
  51542,
  42930,
  38181,
  51040,
  26924,
  56412,
  64982,
  57905,
  49316,
  21502,
  52590,
  14035,
  8553
]);
var BY = new Float64Array([
  26200,
  26214,
  26214,
  26214,
  26214,
  26214,
  26214,
  26214,
  26214,
  26214,
  26214,
  26214,
  26214,
  26214,
  26214,
  26214
]);
var ORDER_L = new Float64Array([
  237,
  211,
  245,
  92,
  26,
  99,
  18,
  88,
  214,
  156,
  247,
  162,
  222,
  249,
  222,
  20,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  16
]);
function gf(init) {
  const r = new Float64Array(16);
  if (init) for (let i = 0; i < init.length; i++) r[i] = init[i];
  return r;
}
function fAdd(o, a, b) {
  for (let i = 0; i < 16; i++) o[i] = a[i] + b[i];
}
function fSub(o, a, b) {
  for (let i = 0; i < 16; i++) o[i] = a[i] - b[i];
}
function car25519(o) {
  let c = 1, v;
  for (let i = 0; i < 16; i++) {
    v = o[i] + c + 65535;
    c = Math.floor(v / 65536);
    o[i] = v - c * 65536;
  }
  o[0] += c - 1 + 37 * (c - 1);
}
function fMul(o, a, b) {
  const t = new Float64Array(31);
  for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) t[i + j] += a[i] * b[j];
  for (let i = 0; i < 15; i++) t[i] += 38 * t[i + 16];
  for (let i = 0; i < 16; i++) o[i] = t[i];
  car25519(o);
  car25519(o);
}
function fSq(o, a) {
  fMul(o, a, a);
}
function sel25519(p, q, b) {
  const c = ~(b - 1);
  for (let i = 0; i < 16; i++) {
    const t = c & (p[i] ^ q[i]);
    p[i] ^= t;
    q[i] ^= t;
  }
}
function pack25519(o, n) {
  const m = gf(), t = gf();
  for (let i = 0; i < 16; i++) t[i] = n[i];
  car25519(t);
  car25519(t);
  car25519(t);
  for (let j = 0; j < 2; j++) {
    m[0] = t[0] - 65517;
    for (let i = 1; i < 15; i++) {
      m[i] = t[i] - 65535 - (m[i - 1] >> 16 & 1);
      m[i - 1] &= 65535;
    }
    m[15] = t[15] - 32767 - (m[14] >> 16 & 1);
    const b = m[15] >> 16 & 1;
    m[14] &= 65535;
    sel25519(t, m, 1 - b);
  }
  for (let i = 0; i < 16; i++) {
    o[2 * i] = t[i] & 255;
    o[2 * i + 1] = t[i] >> 8;
  }
}
function neq25519(a, b) {
  const c = new Uint8Array(32), d = new Uint8Array(32);
  pack25519(c, a);
  pack25519(d, b);
  let diff = 0;
  for (let i = 0; i < 32; i++) diff |= c[i] ^ d[i];
  return (1 & diff - 1 >>> 8) - 1;
}
function par25519(a) {
  const d = new Uint8Array(32);
  pack25519(d, a);
  return d[0] & 1;
}
function unpack25519(o, n) {
  for (let i = 0; i < 16; i++) o[i] = n[2 * i] + (n[2 * i + 1] << 8);
  o[15] &= 32767;
}
function inv25519(o, i) {
  const c = gf();
  for (let a = 0; a < 16; a++) c[a] = i[a];
  for (let a = 253; a >= 0; a--) {
    fSq(c, c);
    if (a !== 2 && a !== 4) fMul(c, c, i);
  }
  for (let a = 0; a < 16; a++) o[a] = c[a];
}
function pow2523(o, i) {
  const c = gf();
  for (let a = 0; a < 16; a++) c[a] = i[a];
  for (let a = 250; a >= 0; a--) {
    fSq(c, c);
    if (a !== 1) fMul(c, c, i);
  }
  for (let a = 0; a < 16; a++) o[a] = c[a];
}
function edAdd(p, q) {
  const a = gf(), b = gf(), c = gf(), d = gf(), e = gf(), f2 = gf(), g = gf(), h = gf(), t = gf();
  fSub(a, p[1], p[0]);
  fSub(t, q[1], q[0]);
  fMul(a, a, t);
  fAdd(b, p[0], p[1]);
  fAdd(t, q[0], q[1]);
  fMul(b, b, t);
  fMul(c, p[3], q[3]);
  fMul(c, c, D2);
  fMul(d, p[2], q[2]);
  fAdd(d, d, d);
  fSub(e, b, a);
  fSub(f2, d, c);
  fAdd(g, d, c);
  fAdd(h, b, a);
  fMul(p[0], e, f2);
  fMul(p[1], h, g);
  fMul(p[2], g, f2);
  fMul(p[3], e, h);
}
function cswap(p, q, b) {
  for (let i = 0; i < 4; i++) sel25519(p[i], q[i], b);
}
function scalarmult(p, q, s) {
  for (let i = 0; i < 16; i++) {
    p[0][i] = GF0[i];
    p[1][i] = GF1[i];
    p[2][i] = GF1[i];
    p[3][i] = GF0[i];
  }
  for (let i = 255; i >= 0; --i) {
    const b = s[i / 8 | 0] >> (i & 7) & 1;
    cswap(p, q, b);
    edAdd(q, p);
    edAdd(p, p);
    cswap(p, q, b);
  }
}
function scalarbase(p, s) {
  const q = [gf(), gf(), gf(), gf()];
  for (let i = 0; i < 16; i++) {
    q[0][i] = BX[i];
    q[1][i] = BY[i];
    q[2][i] = GF1[i];
  }
  fMul(q[3], BX, BY);
  scalarmult(p, q, s);
}
function unpackneg(r, p) {
  const t = gf(), chk = gf(), num = gf(), den = gf(), den2 = gf(), den4 = gf(), den6 = gf();
  for (let i = 0; i < 16; i++) {
    r[2][i] = GF1[i];
  }
  unpack25519(r[1], p);
  fSq(num, r[1]);
  fMul(den, num, DD);
  fSub(num, num, r[2]);
  fAdd(den, r[2], den);
  fSq(den2, den);
  fSq(den4, den2);
  fMul(den6, den4, den2);
  fMul(t, den6, num);
  fMul(t, t, den);
  pow2523(t, t);
  fMul(t, t, num);
  fMul(t, t, den);
  fMul(t, t, den);
  fMul(r[0], t, den);
  fSq(chk, r[0]);
  fMul(chk, chk, den);
  if (neq25519(chk, num)) fMul(r[0], r[0], I25);
  fSq(chk, r[0]);
  fMul(chk, chk, den);
  if (neq25519(chk, num)) return -1;
  if (par25519(r[0]) === p[31] >> 7) fSub(r[0], GF0, r[0]);
  fMul(r[3], r[0], r[1]);
  return 0;
}
function modL(r, x) {
  let carry;
  for (let i = 63; i >= 32; --i) {
    carry = 0;
    let j = i - 32;
    for (; j < i - 12; ++j) {
      x[j] += carry - 16 * x[i] * ORDER_L[j - (i - 32)];
      carry = Math.floor((x[j] + 128) / 256);
      x[j] -= carry * 256;
    }
    x[j] += carry;
    x[i] = 0;
  }
  carry = 0;
  for (let j = 0; j < 32; j++) {
    x[j] += carry - (x[31] >> 4) * ORDER_L[j];
    carry = x[j] >> 8;
    x[j] &= 255;
  }
  for (let j = 0; j < 32; j++) x[j] -= carry * ORDER_L[j];
  for (let i = 0; i < 32; i++) {
    x[i + 1] += x[i] >> 8;
    r[i] = x[i] & 255;
  }
}
function reduce(r) {
  const x = new Float64Array(64);
  for (let i = 0; i < 64; i++) x[i] = r[i];
  for (let i = 0; i < 64; i++) r[i] = 0;
  modL(r, x);
}
async function ed25519Verify(sig, msg, pub, sha512) {
  if (!(sig && sig.length === 64) || !(pub && pub.length === 32)) return false;
  const p = [gf(), gf(), gf(), gf()], q = [gf(), gf(), gf(), gf()];
  if (unpackneg(q, pub)) return false;
  for (let i = 31; i >= 0; i--) {
    if (sig[32 + i] > ORDER_L[i]) return false;
    if (sig[32 + i] < ORDER_L[i]) break;
    if (i === 0) return false;
  }
  const pre = new Uint8Array(64 + msg.length);
  pre.set(sig.subarray(0, 32), 0);
  pre.set(pub, 32);
  pre.set(msg, 64);
  const h = await sha512(pre);
  const k = new Uint8Array(64);
  k.set(h);
  reduce(k);
  scalarmult(p, q, k);
  const s = new Uint8Array(32);
  s.set(sig.subarray(32, 64));
  const t = [gf(), gf(), gf(), gf()];
  scalarbase(t, s);
  edAdd(p, t);
  const packed = new Uint8Array(32);
  packEdwards(packed, p);
  let diff = 0;
  for (let i = 0; i < 32; i++) diff |= packed[i] ^ sig[i];
  return diff === 0;
}
function packEdwards(r, p) {
  const tx = gf(), ty = gf(), zi = gf();
  inv25519(zi, p[2]);
  fMul(tx, p[0], zi);
  fMul(ty, p[1], zi);
  pack25519(r, ty);
  r[31] ^= par25519(tx) << 7;
}
function be32(b, o) {
  return (b[o] << 24 | b[o + 1] << 16 | b[o + 2] << 8 | b[o + 3]) >>> 0;
}
function sshStr(b, o) {
  if (o + 4 > b.length) throw new Error("sshsig: truncated length prefix");
  const n = be32(b, o);
  if (o + 4 + n > b.length) throw new Error("sshsig: string overruns buffer");
  return [b.subarray(o + 4, o + 4 + n), o + 4 + n];
}
function encStr(bytes) {
  const out = new Uint8Array(4 + bytes.length);
  out[0] = bytes.length >>> 24 & 255;
  out[1] = bytes.length >>> 16 & 255;
  out[2] = bytes.length >>> 8 & 255;
  out[3] = bytes.length & 255;
  out.set(bytes, 4);
  return out;
}
function ascii(u8) {
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return s;
}
var SSHSIG_BEGIN = "-----BEGIN SSH SIGNATURE-----";
var SSHSIG_END = "-----END SSH SIGNATURE-----";
function parseSshSig(armored) {
  const text = String(armored || "").trim();
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l !== "");
  if (lines.length < 3 || lines[0] !== SSHSIG_BEGIN || lines[lines.length - 1] !== SSHSIG_END) {
    throw new Error("sshsig: missing or malformed PEM armor");
  }
  const b64 = lines.slice(1, -1).join("");
  const blob = b64ToBytes(b64);
  if (blob.length < 10) throw new Error("sshsig: blob too short");
  if (ascii(blob.subarray(0, 6)) !== "SSHSIG") throw new Error("sshsig: bad magic preamble");
  let o = 6;
  const version = be32(blob, o);
  o += 4;
  if (version !== 1) throw new Error("sshsig: unsupported version " + version);
  let pkField, nsField, rsvField, haField, sigField;
  [pkField, o] = sshStr(blob, o);
  [nsField, o] = sshStr(blob, o);
  [rsvField, o] = sshStr(blob, o);
  [haField, o] = sshStr(blob, o);
  [sigField, o] = sshStr(blob, o);
  if (o !== blob.length) throw new Error("sshsig: trailing bytes after signature field");
  let kt, publicKey, p = 0;
  [kt, p] = sshStr(pkField, 0);
  [publicKey] = sshStr(pkField, p);
  let st, signature;
  p = 0;
  [st, p] = sshStr(sigField, 0);
  [signature] = sshStr(sigField, p);
  return {
    keyType: ascii(kt),
    publicKey,
    namespace: ascii(nsField),
    reserved: rsvField,
    hashAlgorithm: ascii(haField),
    sigType: ascii(st),
    signature
  };
}
function sshsigSignedBlob(namespace, reserved, hashAlgorithm, messageHash) {
  const enc = (s) => {
    const u = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255;
    return u;
  };
  const parts = [
    enc("SSHSIG"),
    encStr(enc(namespace)),
    encStr(reserved),
    encStr(enc(hashAlgorithm)),
    encStr(messageHash)
  ];
  let n = 0;
  for (const p of parts) n += p.length;
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}
var SIGNER_TS_RE = /^(\d{4})(\d{2})(\d{2})(?:(\d{2})(\d{2})(?:(\d{2}))?)?Z?$/;
function parseSignerTimestamp(v) {
  const m = SIGNER_TS_RE.exec(String(v || "").replace(/^"|"$/g, ""));
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}T${m[4] || "00"}:${m[5] || "00"}:${m[6] || "00"}Z`;
}
function parseAllowedSigners(text) {
  const entries = [];
  const lines = String(text || "").split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "" || line.charAt(0) === "#") continue;
    const toks = line.split(/\s+/);
    if (toks.length < 3) {
      entries.push({ line: i + 1, error: "too few fields" });
      continue;
    }
    const principals = toks[0].split(",").filter(Boolean);
    let ki = 1;
    const options = {};
    while (ki < toks.length && !/^(ssh-|ecdsa-|sk-)/.test(toks[ki])) {
      const t = toks[ki];
      const eq = t.indexOf("=");
      if (eq === -1) options[t.toLowerCase()] = true;
      else options[t.slice(0, eq).toLowerCase()] = t.slice(eq + 1).replace(/^"|"$/g, "");
      ki++;
    }
    if (ki + 1 >= toks.length) {
      entries.push({ line: i + 1, error: "no key found" });
      continue;
    }
    const keyType = toks[ki];
    const keyB64 = toks[ki + 1];
    const comment = toks.slice(ki + 2).join(" ");
    let keyBytes = null, err = null;
    try {
      const blob = b64ToBytes(keyB64);
      let t2, p = 0;
      [t2, p] = sshStr(blob, 0);
      if (ascii(t2) !== keyType) throw new Error("key type mismatch inside blob");
      [keyBytes] = sshStr(blob, p);
    } catch (e) {
      err = "unparsable key: " + (e && e.message);
    }
    entries.push({
      line: i + 1,
      principals,
      options,
      keyType,
      keyB64,
      comment,
      keyBytes,
      error: err,
      validAfter: options["valid-after"] ? parseSignerTimestamp(options["valid-after"]) : null,
      validBefore: options["valid-before"] ? parseSignerTimestamp(options["valid-before"]) : null
    });
  }
  return entries;
}
function signerKeysAt(entries, principal, atIso) {
  const out = [];
  for (const e of entries) {
    if (e.error || !e.principals) continue;
    if (e.principals.indexOf(principal) === -1) continue;
    if (e.validAfter && atIso < e.validAfter) continue;
    if (e.validBefore && atIso >= e.validBefore) continue;
    out.push(e);
  }
  return out;
}
async function verifyReleaseSignature(opts) {
  const { armored, message, signersText, namespace, at, sha512 } = opts;
  let sig;
  try {
    sig = parseSshSig(armored);
  } catch (e) {
    return { ok: false, reason: "unparsable", detail: e && e.message };
  }
  if (sig.keyType !== "ssh-ed25519" || sig.sigType !== "ssh-ed25519") {
    return { ok: false, reason: "unsupported_key_type", detail: sig.keyType };
  }
  if (sig.namespace !== namespace) {
    return { ok: false, reason: "namespace_mismatch", detail: sig.namespace };
  }
  if (sig.hashAlgorithm !== "sha512") {
    return { ok: false, reason: "unsupported_hash", detail: sig.hashAlgorithm };
  }
  const entries = parseAllowedSigners(signersText);
  const candidates = signerKeysAt(entries, opts.principal, at);
  if (candidates.length === 0) {
    return { ok: false, reason: "no_valid_key_for_principal", detail: opts.principal };
  }
  let matched = null;
  for (const c of candidates) {
    if (!c.keyBytes || c.keyBytes.length !== sig.publicKey.length) continue;
    let same = true;
    for (let i = 0; i < c.keyBytes.length; i++) if (c.keyBytes[i] !== sig.publicKey[i]) {
      same = false;
      break;
    }
    if (same) {
      matched = c;
      break;
    }
  }
  if (!matched) return { ok: false, reason: "key_not_registered_for_principal", detail: opts.principal };
  const mh = await sha512(message);
  const signed = sshsigSignedBlob(sig.namespace, sig.reserved, sig.hashAlgorithm, mh);
  const good = await ed25519Verify(sig.signature, signed, sig.publicKey, sha512);
  return good ? { ok: true, principal: opts.principal, line: matched.line } : { ok: false, reason: "bad_signature" };
}
function releaseMessage(fields) {
  return canonicalJson({
    v: "bio-release/1",
    bundle: fields.bundle,
    transition: fields.transition,
    from_state: fields.from_state,
    to_state: fields.to_state,
    signer: fields.signer,
    bundle_md_sha256: fields.bundle_md_sha256,
    registry_sha256: fields.registry_sha256
  });
}
function normalizeRootKey(k) {
  const v = String(k || "").trim();
  if (v === "") return v;
  if (/^(ssh-|ecdsa-|sk-)/.test(v)) return v;
  return "ssh-ed25519 " + v.split(/\s+/)[0];
}
async function verifyRegistryRoot(reg, sha512) {
  if (!reg) return { trusted: false, reason: "registry_absent" };
  const enforce = reg.rootEnforceFrom || null;
  if (!reg.rootSignature) {
    return enforce ? { trusted: false, reason: "root_signature_missing" } : { trusted: true, reason: "root_not_enforced" };
  }
  const keys = Array.isArray(reg.rootKeys) ? reg.rootKeys : [];
  if (keys.length === 0) {
    return enforce ? { trusted: false, reason: "no_pinned_root_keys" } : { trusted: true, reason: "root_not_enforced" };
  }
  const signersText = keys.map((k) => `operator ${normalizeRootKey(k)}`).join("\n");
  const enc = (s) => {
    const u = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255;
    return u;
  };
  const r = await verifyReleaseSignature({
    armored: reg.rootSignature,
    message: enc(reg.signers),
    signersText,
    namespace: reg.rootNamespace || "bio-registry",
    principal: "operator",
    at: enforce || "9999-12-31T23:59:59Z",
    sha512
  });
  if (r.ok) return { trusted: true, reason: "root_verified" };
  return enforce ? { trusted: false, reason: "root_signature_invalid:" + r.reason } : { trusted: true, reason: "root_invalid_but_not_enforced:" + r.reason };
}
async function checkReleaseSignature(ctx, findings) {
  if (ctx.fm?.object_type !== "information") return;
  const regAny = ctx.releaseRegistry || null;
  if (regAny && regAny.unavailable) {
    findings.push(f(
      "C-18.8",
      "error",
      `the key registry is declared present but unreadable at this call site (${regAny.reason || "no reason given"}); the gate cannot check signatures and will not pass them`,
      ["restore access to the registry bundle", "do not promote until the registry reads"]
    ));
    return;
  }
  if (ctx.fm?.schema !== "information@2") {
    const migration0 = regAny && regAny.migrationInstant ? regAny.migrationInstant : null;
    if (!migration0) return;
    const hist0 = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];
    const post0 = hist0.filter((e) => e && e.from_state === "collected" && e.to_state === "verified" && e.timestamp && e.timestamp >= migration0);
    for (const e of post0) {
      findings.push(f(
        "C-18.8",
        "error",
        `release at ${e.timestamp} is at or after the migration instant ${migration0}, but this bundle is ${ctx.fm.schema || "a pre-contract schema"}: the signed release register exists only at information@2, so this ratification cannot carry a signature the gate can check`,
        [
          "migrate the bundle to information@2, then sign the transition and add the releases[] entry",
          "return the bundle to collected pending a signed ratification"
        ]
      ));
    }
    return;
  }
  const hist = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];
  const releases = hist.filter((e) => e && e.from_state === "collected" && e.to_state === "verified");
  if (releases.length === 0) return;
  const reg = ctx.releaseRegistry || null;
  const migration = reg && reg.migrationInstant ? reg.migrationInstant : null;
  const post = releases.filter((e) => migration && e.timestamp >= migration);
  if (post.length === 0) return;
  const root = await verifyRegistryRoot(reg, ctx.sha512);
  if (!root.trusted) {
    findings.push(f(
      "C-18.8",
      "error",
      `the key registry does not prove itself (${root.reason}); it is treated as absent, so no principal in it resolves`,
      ["restore the registry root signature", "sign the registry with a pinned root key", "clear root.enforce_from only with a recorded reason"]
    ));
    return;
  }
  const rawReg = ctx.files.get("data/provenance.json");
  let rels = [];
  if (rawReg) {
    try {
      const p = JSON.parse(asText(rawReg));
      rels = Array.isArray(p.releases) ? p.releases : [];
    } catch {
    }
  }
  const bundleMd = ctx.files.get("bundle.md");
  const bundleSha = bundleMd ? await ctx.sha256(bundleMd) : null;
  for (const e of post) {
    const rec = rels.find((r) => r && r.transition === e.timestamp);
    if (!rec || !rec.signature_file) {
      findings.push(f(
        "C-18.8",
        "error",
        `release at ${e.timestamp} is at or after the migration instant ${migration} and carries no signed release record`,
        ["sign the transition and add the releases[] entry", "return the bundle to collected pending a signed ratification"]
      ));
      continue;
    }
    const author = String(e.author || "");
    if (String(rec.signer || "") !== author) {
      findings.push(f(
        "C-18.8",
        "error",
        `release at ${e.timestamp}: signer '${rec.signer}' does not equal transition author '${author}'`,
        ["record the release under one identity"]
      ));
      continue;
    }
    if (NON_MEMBER_AUTHORS.includes(author.toLowerCase())) {
      findings.push(f("C-18.8", "error", `release at ${e.timestamp} is authored by '${author}', a surface or AI identity, never a release author`));
      continue;
    }
    const wantNs = reg.namespace || "bio-release";
    if (rec.namespace !== wantNs) {
      findings.push(f("C-18.8", "error", `release at ${e.timestamp}: namespace '${rec.namespace}' is not the registry namespace '${wantNs}'`));
      continue;
    }
    const armored = ctx.files.get(String(rec.signature_file));
    if (armored == null) {
      findings.push(f("C-18.8", "error", `release at ${e.timestamp}: signature file '${rec.signature_file}' holds no bytes at the gate`));
      continue;
    }
    if (rec.registry_sha256 && reg.sha256 && rec.registry_sha256 !== reg.sha256) {
      findings.push(f(
        "C-18.8",
        "warn",
        `release at ${e.timestamp} records registry ${String(rec.registry_sha256).slice(0, 12)}\u2026 but the registry in force is ${String(reg.sha256).slice(0, 12)}\u2026; the usual cause is signing against a stale mirror`,
        ["re-verify against the recorded registry version out of the registry bundle history"]
      ));
    }
    const msg = releaseMessage({
      bundle: ctx.folderName,
      transition: e.timestamp,
      from_state: e.from_state,
      to_state: e.to_state,
      signer: rec.signer,
      bundle_md_sha256: bundleSha,
      registry_sha256: rec.registry_sha256 || reg.sha256
    });
    const enc = (s) => {
      const u = new Uint8Array(s.length);
      for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255;
      return u;
    };
    const v = await verifyReleaseSignature({
      armored: asText(armored),
      message: enc(msg),
      signersText: reg.signers,
      namespace: wantNs,
      principal: rec.signer,
      at: e.timestamp,
      sha512: ctx.sha512
    });
    if (!v.ok) {
      findings.push(f(
        "C-18.8",
        "error",
        `release at ${e.timestamp} does not verify (${v.reason}) for signer '${rec.signer}'`,
        ["re-sign the transition over the exact released bundle.md", "confirm the signer key is registered and valid at the transition instant"]
      ));
    }
  }
}
async function checkBundle(input, opts = {}) {
  const findings = [];
  const bundleRaw = input.files.get("bundle.md");
  const ctx = {
    folderName: input.folderName,
    files: input.files,
    // 1.13.0 (three-tier read model): paths known to exist in the
    // authoritative store but whose bytes the caller deliberately did not
    // carry (a tier-scoped client mirror eliding snapshots/ and _history/).
    // Presence assertions ("this registered path must exist") consult
    // files UNION elided via hasFile_; byte checks (hashing, parsing,
    // history audits) stay files-only and skip elided content exactly as
    // they skip absent content, so nothing is ever verified against bytes
    // the caller does not hold. The gate and cli pass nothing here and are
    // byte-complete as before.
    elided: input.elidedPaths instanceof Set ? input.elidedPaths : new Set(Array.isArray(input.elidedPaths) ? input.elidedPaths : []),
    sha256: input.sha256,
    nowMs: input.nowMs,
    maxPackageAgeDays: input.maxPackageAgeDays ?? 14,
    maxReevalAgeDays: input.maxReevalAgeDays ?? 30,
    knownSchemas: opts.knownSchemas ?? ["information@1", "information@2", "problem@1", "project@1", "action@1"],
    resolveTarget: input.resolveTarget,
    // D2.3: the key registry, injected exactly like resolveTarget. Absent
    // is legal and means pre-migration behavior; absent WITH a
    // post-migration release is an error, never a skip.
    releaseRegistry: input.releaseRegistry || null,
    sha512: input.sha512 || null,
    fm: null,
    body: ""
  };
  if (!bundleRaw) {
    findings.push(f("C-13.1", "error", "bundle.md is missing"));
  } else {
    const parsed = parseFrontmatter(asText(bundleRaw));
    findings.push(...parsed.findings);
    ctx.fm = parsed.data;
    ctx.body = parsed.body;
    checkIdentity(ctx, findings);
    checkFrontmatterContract(ctx, findings);
    checkHeadings(ctx, findings);
    checkStateLegality(ctx, findings);
    checkWriteCompleteness(ctx, findings);
    await checkInformationExtension(ctx, findings);
    checkReleaseAuthority(ctx, findings);
    checkRegisterIntegrity(ctx, findings);
    await checkInfo2Contract(ctx, findings);
    await checkReleaseSignature(ctx, findings);
    checkGatheringGrammar(ctx, findings);
    await checkMechanicalConformance(ctx, findings);
    checkReferences(ctx, findings);
    checkRecheckCoverage(ctx, findings);
    checkProblemExtension(ctx, findings);
    checkProjectExtension(ctx, findings);
    checkActionExtension(ctx, findings);
    checkCitationRegister(ctx, findings);
    checkDeletionRecords(ctx, findings);
    checkAppendOnly(ctx, findings);
    checkHistoryCoherence(ctx, findings);
  }
  checkFormatHygiene(ctx, findings);
  await checkQueueAndBase(ctx, findings);
  const pass = !findings.some((x) => x.severity === "error");
  return { pass, findings };
}

// src/setup.mjs
var FIRST_STATE_JSON = JSON.stringify(
  Object.fromEntries(Object.entries(STATES).map(([t, s]) => [t, s.legal[0]]))
);
var HEADINGS_JSON = JSON.stringify(HEADINGS);
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
  <div id="n-src">
    <div class="card">
      <p style="margin:0 0 10px"><b>Is there a document behind this?</b> Give its web address and
      this copy will fetch it, hash it at the moment it arrives, keep the bytes, and record where
      it came from. Leave both blank if you are writing down something you know rather than
      capturing something published.</p>
      <label for="n-loc">Web address of the document</label>
      <input id="n-loc" placeholder="https://..." spellcheck="false">
      <p class="hint">Must be an https address on a public site. This copy will not fetch anything else.</p>
      <label for="n-auth">Who issued it?</label>
      <input id="n-auth" placeholder="City Auditor, Public Works Department, a named newspaper">
      <p class="hint">Who issued the document and how faithfully it was captured are two separate
      claims. Both get recorded, and neither stands in for the other.</p>
      <label style="display:flex;gap:8px;align-items:flex-start;font-weight:400;margin-top:14px">
        <input type="checkbox" id="n-arch" style="width:auto;margin-top:4px">
        <span>Also ask a public web archive to keep its own copy.
        <span class="dim">This is stronger evidence, because an archive nobody in this group controls
        can show what the page said. It is also public: anyone watching that archive can see that
        someone asked for this page. Leave it off if being seen to look would matter.</span></span>
      </label>
    </div>
  </div>
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
  <p class="small">Members sign in with a handle they choose and a password they
  choose. You assign each one a cover, which is the label you tell them apart by
  and is not a legal name. Only administrators see cover and handle together, and
  publishing the pairing is a separate decision either of you can make. Registered
  keys are what allow a member to publish; a password alone never can.</p>
  <h2>Members</h2>
  <div class="card" id="m-list"></div>
  <label for="m-id">Add a member: the name they will sign in with</label>
  <input id="m-id">
  <p class="hint">Lowercase, no spaces. Anything you type is tidied to fit.</p>
  <label for="m-name">A cover to tell them apart by</label>
  <input id="m-name">
  <p class="hint">This is a label for your own use, not a legal name, and it is not
  a form to fill in truthfully. "The CPA from Tuesday" and "volunteer-7" are as
  valid as anything else. Only administrators ever see it, and only they can see
  which handle it belongs to. If your group is working under any real pressure,
  choose covers that would tell an outsider nothing.</p>
  <div class="actions" style="margin-top:12px"><button id="m-add">Invite them</button></div>
  <p class="err" id="m-err"></p>
  <div id="m-invite"></div>
  <h2>Registered keys</h2>
  <div class="card" id="k-list"></div>
  <div class="card">
    <p style="margin:0 0 10px"><b>Where a key comes from.</b> Each member makes their own
    on this copy's signing page. It runs entirely in their browser and sends nothing
    anywhere. It gives them two things: a private key they keep, and a public key they
    hand to you for this box. You cannot sign anything with what goes in this box, which
    is why it is safe to email it or read it aloud.</p>
    <p style="margin:0"><a class="filelink" id="k-open" href="/sign" target="_blank" rel="noopener">Open the signing page</a>
    &middot; on it, press <b>Generate my keys</b>, then copy the <b>ratification</b> public key.</p>
  </div>
  <label for="k-key">Their ratification public key</label>
  <textarea id="k-key" rows="3" spellcheck="false"></textarea>
  <p class="hint">One line. It starts with <span class="mono">ssh-ed25519</span> and ends with
  <span class="mono">bio-ratify</span>.</p>
  <div id="k-read"></div>
  <label for="k-who">Belongs to which member</label>
  <input id="k-who">
  <div class="actions" style="margin-top:12px"><button id="k-add">Register this key</button></div>
  <p class="err" id="k-err"></p>
</section>

<section id="s-enroll">
  <h1>Join this group</h1>
  <p id="en-lede">You were invited. Choose the name the record will show, and a password.</p>
  <div class="card" id="en-who" hidden></div>
  <label for="en-handle">Your handle</label>
  <input id="en-handle" spellcheck="false" placeholder="lowercase letters, digits and dashes">
  <p class="hint">This is what the record shows: the author of anything you write, and the
  name other members see. It is yours, not the label the administrator used to invite you.</p>
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
  const inv = location.hash.match(/invite=([^&]+)/);
  if (inv) {
    /* An invited member arrives by link. The code rides the fragment, which
       never reaches any server, and is stripped immediately either way. The
       screen this reveals existed since 0.4.0 with nothing able to show it
       (DEBT D-14). */
    /* The token IS the credential and carries nothing else. The previous link
       was memberId:code, so anyone who saw a leaked or archived one learned who
       had been invited. */
    INVITE = decodeURIComponent(inv[1]);
    history.replaceState({}, "", location.pathname);
    const look = await api("invitelook", { invite: INVITE });
    if (!look.result || !look.result.ok) {
      $("#en-lede").textContent = "This invitation link is not live. An invitation is used up the "
        + "moment someone joins with it. Ask whoever invited you for a new one.";
      document.querySelectorAll("#s-enroll label, #s-enroll input, #s-enroll .hint, #en-go")
        .forEach((x) => { x.hidden = true; });
      show("#s-enroll"); return;
    }
    const w = look.result;
    $("#en-who").hidden = false;
    $("#en-who").innerHTML = '<div class="kv"><span class="k">Invited as</span><span class="v">'
      + escH(w.cover) + '</span></div>'
      + '<div class="kv"><span class="k">Role</span><span class="v">' + escH(w.role) + '</span></div>'
      + '<div class="kv"><span class="k">You can</span><span class="v">'
      + escH((w.capabilities || []).join(", ") || "read") + '</span></div>';
    show("#s-enroll"); return;
  }
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
let INVITE = null;
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
  /* Canonical snapshot path: the key lives in the filename, not a directory. */
  const revPath = revisionKey ? "_history/bundle_"+revisionKey+".md" : null;
  const revText = revPath && typeof img[revPath] === "string" ? img[revPath] : null;
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
    const viewable = typeof img["_history/bundle_"+e.key+".md"] === "string";
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
    + '<p class="small">Open the <a class="filelink" href="/sign" target="_blank" rel="noopener">signing page</a>, '
    + "unlock your key, choose Sign a ratification, paste in those two values, and paste what it "
    + "hands back into the box below.</p>"
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
/* From the check catalog, not from memory. */
const FIRST_STATE = ${FIRST_STATE_JSON};
const HEADINGS = ${HEADINGS_JSON};
/* information@1 for typed intake, deliberately. The @2 contract makes the
   intake provenance register mandatory (C-18.1), and a register describes
   captured DOCUMENTS: locator, authority, capture method, grade, hash. A member
   typing what they know has no document, so @2 would demand a register with
   nothing honest to put in it. Material arriving WITH a document is @2 and
   carries custody, which is the capture path (PLAN.md S-5), not this one. */
/* information@1 for a member writing down what they know, because the @2
   contract makes the intake provenance register mandatory and a register
   describes captured DOCUMENTS. The moment a document IS captured the bundle is
   @2 and carries the register, which is the honest distinction rather than a
   version preference. */
const SCHEMA_OF = { information:"information@1", problem:"problem@1", project:"project@1", action:"action@1" };
const schemaFor = (type, hasDoc)=> type === "information" && hasDoc ? "information@2" : SCHEMA_OF[type];
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
/* A conformant bundle.md. Fifteen core fields, because C-2.2 fires once per
   missing one and the previous version wrote four; the canonical heading set for
   the type, because C-3.1 refuses both a missing heading and an unexpected one;
   and the per-type extension fields each type's own check requires. The first
   prose section carries what the member wrote, and the rest are present and
   empty, which is what the catalog asks for. */
const mdFor = (id, type, state, title, body, now, hasDoc)=>{
  const fm = ["---","id: "+id,"object_type: "+type,"schema: "+schemaFor(type, hasDoc),
    "title: "+JSON.stringify(title),"current_state: "+state,"prior_state: null",
    "created: "+now,"last_updated: "+now,
    "produced_by:","  mode: assisted","  capability_tier: session",
    "group: believe-in-oakland","references: []","state_history: []",
    "annotations_open: 0","reeval_pending:","  flag: false","  since: null",
    "  source: null","visuals: []"];
  if (type === "information") fm.push(
    "criticality: supporting","classification: fact","source_status: unchanged",
    "source:","  locator: in hand","  authority: member-entered","  retrieved: "+now,
    "monitoring:","  enabled: false","  frequency: none");
  if (type === "problem") fm.push(
    "surfaced_by: human","recheck_triggers:","  - text: Revisit this",
    "    description: A member set no specific trigger at creation; replace this with a real one.");
  if (type === "project") fm.push("objective: "+JSON.stringify(title));
  if (type === "action") fm.push(
    "action_kind: other","risk_tier: 1","counterparty: to be named");
  fm.push("---","");
  const heads = HEADINGS[type] || ["## Summary"];
  const out = fm.slice();
  heads.forEach((h,i)=>{ out.push(h,""); if (i===0) out.push(body,""); });
  return out.join(NL);
};

/* The bundle's files, with the captured document beside the record and the
   provenance register naming it. C-18.1 wants the register to point at a file
   that exists in the bundle, so the document is registered as a blob reference
   and the register entry names the same path. */
async function docFiles(text, doc, textSha){
  const files = [{ path:"bundle.md", text, bytes:text.length, sha256:textSha }];
  if (!doc) return files;
  const prov = JSON.stringify({ documents: [doc] }, null, 1);
  files.push({ path:"data/provenance.json", text: prov, bytes: prov.length,
               sha256: await sha256Text(prov) });
  if (Array.isArray(doc.parts) && doc.parts.length) {
    /* A parted document has no single file: each part is registered separately
       and the catalog verifies the whole by streaming them. Registering a
       phantom whole would name bytes the store does not hold. */
    for (const p of doc.parts)
      files.push({ path: p.file, blobSha: p.sha256, sha256: p.sha256, bytes: p.bytes });
  } else {
    files.push({ path: doc.file, blobSha: doc.capture.sha256, sha256: doc.capture.sha256,
                 bytes: doc.capture.bytes });
  }
  /* The timestamp token is evidence too, so it lives in the bundle rather than
     only in the store. A token nobody can find is a token nobody will check. */
  for (const a of (doc.attestations || []))
    files.push({ path: a.file, blobSha: a.sha256, sha256: a.sha256, bytes: a.bytes });
  return files;
}
function acquireWhy(a){
  const why = a.reason || a.error || "unknown";
  if (why === "BAD_LOCATOR") return "That address cannot be fetched. It must be an https address on a public site: not a plain http address, not an address on this machine, and not one carrying a username or password.";
  if (why === "NO_AUTHORITY") return "Say who issued the document.";
  if (why === "SOURCE_REFUSED") return "The site answered with an error (" + a.status + "). The address may be wrong, or the document may no longer be published there.";
  if (why === "FETCH_FAILED") return "The site could not be reached just now. Nothing was written.";
  if (why === "EMPTY") return "The site returned an empty document, so there was nothing to keep.";
  if (why === "TOO_LARGE") return "That document is too large to capture this way (" + a.bytes + " bytes). Large documents are captured in parts.";
  return "The document could not be captured: " + why;
}

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
    const now = new Date().toISOString().split(".")[0] + "Z";
    /* Capture first, because a failed fetch should not leave a half-made bundle
       in the record. If the document cannot be had, nothing is written and the
       member is told what the source did. */
    const loc = ($("#n-loc") ? $("#n-loc").value.trim() : "");
    const auth = ($("#n-auth") ? $("#n-auth").value.trim() : "");
    let doc = null;
    if (loc) {
      if (!auth) { e.textContent = "Say who issued the document as well as where it lives."; return; }
      const acq = await post("acquire", { locator: loc, authority: auth });
      if (!acq.ok) { e.textContent = acquireWhy(acq); return; }
      doc = acq.document;
      /* Co-attestation happens now, while the capture is fresh, because a
         timestamp is a claim about WHEN and one obtained later says less. A
         failure here does not stop the bundle: the attempts are recorded either
         way, and a register showing a failed attempt is a different and more
         honest claim than one showing none. */
      const wantArchive = !!($("#n-arch") && $("#n-arch").checked);
      const att = await post("attest", { sha256: doc.capture.sha256, locator: loc, archive: wantArchive });
      doc.attestation_attempts = (att.attempts || []);
      if (att.attestation) doc.attestations = [att.attestation];
      if (att.archive) doc.co_archive = att.archive;
    }
    const text = mdFor(id, type, state, title, body, now, !!doc);
    const r = await post("promote", {
      bundleId: id, base: null, snapKey: stamp(), author: WHO,
      meta: { object_type:type, group:"believe-in-oakland", title, current_state:state, created:now, last_updated:now },
      files: await docFiles(text, doc, await sha256Text(text)),
      register: doc ? [...(Array.isArray(doc.parts) && doc.parts.length
                        ? doc.parts.map((p) => ({ sha256: p.sha256, path: p.file,
                                                  encoding: "binary", bytes: p.bytes }))
                        : [{ sha256: doc.capture.sha256, path: doc.file,
                             encoding: doc.capture.encoding, bytes: doc.capture.bytes }]),
                       ...(doc.attestations || []).map((a) => ({
                         sha256: a.sha256, path: a.file, encoding: "binary", bytes: a.bytes }))] : [],
    });
    if (!r.result || !r.result.ok) { e.textContent = "Refused: " + ((r.result&&r.result.reason)||r.error||"unknown"); return; }
    $("#n-title").value = ""; $("#n-body").value = "";
    if ($("#n-loc")) { $("#n-loc").value = ""; $("#n-auth").value = ""; }
    openBundle(id);
  } catch(err){ e.textContent = "That did not go through: " + err.message; }
  finally { $("#n-save").disabled = false; }
});

/* ---- revise ---- */
let EDIT_ID = null;
let EDIT_IMAGE = null;
async function openEdit(id, text){
  EDIT_ID = id; $("#e-err").textContent = "";
  $("#e-id").textContent = id; $("#e-body").value = text;
  show("#s-edit");
}
$("#e-back").addEventListener("click", ()=>openBundle(EDIT_ID));
/* Prepare a revision. Pure, so it can be tested against the check catalog
   without a browser.
 *
 * Three things the catalog requires of any revision, none of which the earlier
 * save path did:
 *   last_updated moves, in the DOCUMENT and not only in the promote metadata,
 *     because C-12.1 and C-13.1 read the frontmatter and nothing else;
 *   created is PRESERVED, because overwriting it with the save time destroys
 *     when the thing was actually created and no history holds it elsewhere;
 *   a Session Log entry is appended, because C-13.2 refuses a bundle whose
 *     last_updated moved with nothing recorded, and C-5.1 refuses one whose
 *     prior entries went missing, so the entry is added rather than replacing.
 */
function reviseText(text, who, now){
  const parts = splitFm(text);
  const lines = text.split(NL);
  let out = [], inFm = false, seenFence = 0, wroteUpdated = false;
  for (const line of lines){
    if (line === "---" && seenFence < 2){ seenFence++; inFm = seenFence === 1; out.push(line); continue; }
    if (seenFence === 1 && /^last_updated:/.test(line)){ out.push("last_updated: " + now); wroteUpdated = true; continue; }
    if (seenFence === 1 && /^created:/.test(line) && parts.fm.created){ out.push("created: " + parts.fm.created); continue; }
    out.push(line);
  }
  if (!wroteUpdated){
    /* No last_updated at all: put one at the end of the frontmatter rather than
       silently leaving the document unable to pass C-2.2. */
    const at = out.lastIndexOf("---");
    if (at > 0) out.splice(at, 0, "last_updated: " + now);
  }
  let body = out.join(NL);
  const entry = ["### Session " + now, "", "Revised by " + who + ".", ""].join(NL);
  const i = body.indexOf("## Session Log");
  if (i < 0){
    body = body + NL + "## Session Log" + NL + NL + entry;
  } else {
    /* Insert at the END of the Session Log section, before whatever heading
       follows it, so earlier entries keep their order and their place. */
    const rest = body.indexOf(NL + "## ", i + 1);
    const cut = rest === -1 ? body.length : rest + 1;
    body = body.slice(0, cut) + entry + body.slice(cut);
  }
  return body;
}

/* Every file the bundle has, other than the one being edited, handed back
   unchanged. promote writes a whole image, so a save that mentions only
   bundle.md deletes the provenance register and every capture beside it. */
async function carryForward(id, exclude){
  const img = (await rec("image", { id })).result || {};
  const out = [];
  for (const [path, v] of Object.entries(img)){
    if (path === exclude || path.indexOf("_history/") === 0) continue;
    if (typeof v === "string") out.push({ path, text: v, bytes: v.length, sha256: await sha256Text(v) });
    else out.push({ path, blobSha: v.blobSha, sha256: v.sha256, bytes: v.bytes });
  }
  return out;
}
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
    const now = new Date().toISOString().split(".")[0] + "Z";
    const revised = reviseText(text, WHO, now);
    const r = await post("promote", {
      /* The lease returns a field named base. Reading baseSha sent undefined,
         which the store correctly refused as a stale write, so no revision
         through this page had ever succeeded. */
      bundleId: EDIT_ID, base: lease.result.base, snapKey: stamp(), author: WHO,
      meta: { object_type: fmv.object_type, group:"believe-in-oakland", title: fmv.title || EDIT_ID,
              current_state: fmv.current_state, created: fmv.created || now, last_updated: now },
      files: [{ path:"bundle.md", text: revised, bytes: revised.length, sha256: await sha256Text(revised) },
              ...(await carryForward(EDIT_ID, "bundle.md"))],
      register: [],
    });
    if (!r.result || !r.result.ok) {
      const why = (r.result && r.result.reason) || r.error || "unknown";
      if (why === "FILES_DROPPED") {
        e.textContent = "Saving would have removed files this bundle holds ("
          + (r.result.paths || []).join(", ") + "). Nothing was saved.";
        return; }
      e.textContent = (why === "CAS_STALE" || why === "STALE")
        ? "Someone saved a newer version while you were writing. Open it again and redo your change."
        : "Refused: " + why;
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
    + escH(x.cover||"") + " " + chip(x.status)
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
function memberWhy(res, wanted){
  const why = (res && res.reason) || "unknown";
  if (why === "BAD_MEMBER_ID") return "A member name is lowercase letters, digits and dashes, at least two characters. "
    + (wanted ? "Try " + wanted + "." : "");
  if (why === "NO_COVER") return "Give a cover as well as a sign-in name: a label you will recognise them by. It does not have to be their real name.";
  if (why === "EXISTS") return "There is already a member with that name.";
  if (why === "NO_SUCH_MEMBER") return "There is no member by that name. Add them first, then register their key.";
  return "Refused: " + why;
}
$("#m-add").addEventListener("click", async ()=>{
  const e = $("#m-err"); e.textContent = ""; $("#m-invite").innerHTML = "";
  const wanted = $("#m-id").value.trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  $("#m-id").value = wanted;
  const r = await post("memberadd", { memberId: wanted, cover: $("#m-name").value.trim() });
  if (!r.result || !r.result.ok) { e.textContent = memberWhy(r.result, wanted); return; }
  /* A link, not a bare code. The code rides the URL fragment, which never
     reaches any server, and the enrolment screen it opens had no reachable
     path at all before this (DEBT D-14). */
  /* The token alone. Nothing about who it addresses rides in the URL, so a
     leaked or archived link reveals neither the group nor the invitee, and it
     resolves to nothing once it has been used. */
  const link = location.origin + location.pathname + "#invite="
    + encodeURIComponent(r.result.invite);
  $("#m-invite").innerHTML = '<div class="okbox"><p style="margin:0">Send '
    + escH(wanted) + ' this link. It works once, it is not shown again, and it '
    + 'goes nowhere after it has been used.</p>'
    + '<p class="mono" style="margin:8px 0 0;word-break:break-all">' + escH(link) + "</p></div>";
  $("#m-id").value = ""; $("#m-name").value = "";
  openMembers();
});
/* Echo the pasted key back in words. A person pasting 80 opaque characters
   deserves to be told what the machine thinks they just handed it, BEFORE
   they commit it. */
function describeKey(line){
  const t = String(line||"").trim().split(" ").filter(function(x){ return x; });
  if (t.length < 2 || t[0] !== "ssh-ed25519" || !/^AAAA/.test(t[1]))
    return { ok:false, why:"That does not look like a public key line. It should be one line starting with ssh-ed25519." };
  const label = t.slice(2).join(" ");
  if (label === "bio-release")
    return { ok:false, why:"That is the RELEASE key, which signs software. This box wants the ratification key, the one labelled bio-ratify." };
  return { ok:true, label: label || "(no label)", fp: t[1].slice(0,16) };
}
$("#k-key").addEventListener("input", ()=>{
  const v = $("#k-key").value.trim();
  if (!v) { $("#k-read").innerHTML = ""; return; }
  const d = describeKey(v);
  $("#k-read").innerHTML = d.ok
    ? '<p class="small" style="color:var(--verdigris-dk)">Reads as a ratification key labelled <b>'
      + escH(d.label) + '</b>, beginning <span class="mono">' + escH(d.fp) + "</span>.</p>"
    : '<p class="err" style="min-height:0">' + escH(d.why) + "</p>";
});
$("#k-add").addEventListener("click", async ()=>{
  const e = $("#k-err"); e.textContent = "";
  const d = describeKey($("#k-key").value);
  if (!d.ok) { e.textContent = d.why; return; }
  const r = await post("signeradd", { keyB64: $("#k-key").value.trim(),
    memberId: $("#k-who").value.trim().toLowerCase() });
  if (!r.result || !r.result.ok) {
    e.textContent = r.result && r.result.reason === "BAD_KEY"
      ? "That is not a public key this system can read. Copy the whole line from the signing page."
      : memberWhy(r.result);
    return; }
  $("#k-key").value = ""; $("#k-who").value = ""; openMembers();
});

/* ---- enrolment, for an invited member with no password yet ---- */
$("#en-go").addEventListener("click", async ()=>{
  const e = $("#en-err"); e.textContent = "";
  const r = await api("enroll", { invite: INVITE,
    handle: $("#en-handle").value.trim().toLowerCase(), password: $("#en-pw").value });
  if (!r.result || !r.result.ok) {
    const why = r.result && r.result.reason;
    e.textContent = why === "PASSWORD_TOO_SHORT" ? "The password needs at least 12 characters."
      : why === "HANDLE_TAKEN" ? "Someone already uses that handle. Choose another."
      : why === "NO_HANDLE" ? "Choose a handle. It is the name the record will show."
      : why === "BAD_HANDLE" ? "A handle is lowercase letters, digits and dashes, at least two characters."
      : "This invitation link is not live. Ask whoever invited you for a new one.";
    return; }
  $("#lwho").value = r.result.memberId; $("#lpw").value = "";
  show("#s-login");
});
document.querySelectorAll(".crumb-home").forEach(a=>a.addEventListener("click", ()=>{
  document.querySelector("main").classList.remove("wide"); show("#s-panel"); }));

state();
</script>
</body>
</html>`;

// src/signpage.mjs
var SIGN_HTML = '<!doctype html>\n<meta charset="utf-8">\n<title>BIO signing keys</title>\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<!--\n  Signing keys that never leave the person holding them.\n\n  This page is one file with no network access of any kind: no scripts\n  loaded, no fonts fetched, no data sent anywhere. Open it from a local\n  copy. Everything it does happens in the browser tab.\n\n  It produces SSHSIG signatures, the same format `ssh-keygen -Y sign`\n  emits, so anything signed here can be verified by anyone with stock\n  OpenSSH and no BIO code:\n\n      ssh-keygen -Y verify -f allowed_signers -I <you> \\\n                 -n bio-release -s file.sig < file\n\n  Two keys, because they do different jobs. The release key signs the\n  software that installs into other people\'s accounts and is used a few\n  times a year. The ratification key attests documents and is used\n  constantly. Keeping routine use away from the supply-chain key is the\n  reason they are separate.\n-->\n<style>\n  :root {\n    --ink: #16171a; --dim: #5c6069; --line: #d9dce1; --bg: #fbfbfc;\n    --accent: #1c4f8b; --accent-dark: #163f70; --warn: #8a4b00;\n    --good: #15603a; --bad: #93231d; --soft: #f1f3f6;\n  }\n  * { box-sizing: border-box; }\n  body { margin: 0; background: var(--bg); color: var(--ink);\n         font: 15px/1.55 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }\n  main { max-width: 780px; margin: 0 auto; padding: 32px 20px 80px; }\n  h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: -0.01em; }\n  .sub { color: var(--dim); margin: 0 0 28px; }\n  section { background: #fff; border: 1px solid var(--line); border-radius: 10px;\n            padding: 20px; margin: 0 0 18px; }\n  h2 { font-size: 15px; margin: 0 0 10px; text-transform: uppercase;\n       letter-spacing: 0.06em; color: var(--dim); font-weight: 600; }\n  p { margin: 0 0 12px; }\n  label { display: block; font-weight: 600; margin: 0 0 5px; font-size: 13px; }\n  input, textarea { width: 100%; font: 13px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;\n                    padding: 9px 10px; border: 1px solid var(--line); border-radius: 6px;\n                    background: #fff; color: var(--ink); }\n  textarea { resize: vertical; }\n  button { font: inherit; font-weight: 600; padding: 9px 16px; border-radius: 6px;\n           border: 1px solid var(--accent); background: var(--accent); color: #fff;\n           cursor: pointer; }\n  button:hover { background: var(--accent-dark); }\n  button.ghost { background: #fff; color: var(--accent); }\n  button.ghost:hover { background: var(--soft); }\n  button:disabled { opacity: .45; cursor: default; background: var(--accent); }\n  button.big { font-size: 17px; padding: 14px 26px; width: 100%; }\n  .stack > * + * { margin-top: 14px; }\n  .keybox { border: 1px solid var(--line); border-radius: 8px; padding: 12px; background: var(--soft); }\n  .keybox .top { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px; }\n  .keybox label { margin: 0; }\n  .keybox textarea { background: #fff; }\n  .copy { padding: 4px 12px; font-size: 12px; }\n  .note { color: var(--dim); font-size: 13px; margin: 0; }\n  .warn { color: var(--warn); }\n  .good { color: var(--good); }\n  .bad { color: var(--bad); }\n  .tabs { display: flex; gap: 8px; margin: 0 0 18px; flex-wrap: wrap; }\n  .tabs button { background: #fff; color: var(--dim); border-color: var(--line); }\n  .tabs button[aria-pressed="true"] { background: var(--ink); color: #fff; border-color: var(--ink); }\n  .hide { display: none; }\n  code { background: var(--soft); padding: 1px 5px; border-radius: 4px; font-size: 13px;\n         word-break: break-all; }\n  .status { font-size: 13px; padding: 8px 10px; border-radius: 6px; background: var(--soft); }\n  .row { display: flex; gap: 10px; flex-wrap: wrap; }\n  .row button { flex: 1 1 auto; }\n  details { margin-top: 6px; }\n  summary { cursor: pointer; font-size: 13px; color: var(--dim); font-weight: 600; }\n</style>\n\n<main>\n  <h1>BIO signing keys</h1>\n  <p class="sub">Runs entirely in this tab. Nothing is sent anywhere.</p>\n\n  <div class="tabs">\n    <button id="tab-keys" aria-pressed="true">Keys</button>\n    <button id="tab-release" aria-pressed="false">Sign a release</button>\n    <button id="tab-ratify" aria-pressed="false">Sign a ratification</button>\n  </div>\n\n  <!-- -------------------------------------------------------------- keys -->\n  <div id="pane-keys">\n    <section>\n      <h2>Make your keys</h2>\n      <p>One press makes both keys. Copy the two public keys into the session, and keep\n         the private keys wherever you keep things.</p>\n      <button id="gen" class="big">Generate my keys</button>\n      <div id="gen-out" class="stack" style="margin-top:18px"></div>\n    </section>\n\n    <section>\n      <h2>Load a key you already have</h2>\n      <p class="note">Paste a private key from a previous run. The key says which job it is for,\n         so there is nothing to choose.</p>\n      <div class="stack">\n        <textarea id="load-blob" rows="3" placeholder="BIOKEY-RAW1....." spellcheck="false"></textarea>\n        <div class="row">\n          <button id="load">Load this key</button>\n          <button id="forget" class="ghost">Forget everything</button>\n        </div>\n      </div>\n      <details>\n        <summary>This key is protected with a passphrase</summary>\n        <div class="stack" style="margin-top:10px">\n          <input id="load-pass" type="password" autocomplete="current-password" placeholder="passphrase">\n        </div>\n      </details>\n      <div id="load-out" style="margin-top:12px"></div>\n    </section>\n  </div>\n\n  <!-- ----------------------------------------------------------- release -->\n  <div id="pane-release" class="hide">\n    <section>\n      <h2>Sign a release</h2>\n      <p>Choose the release asset (<code>bio-plane.bundled.mjs</code>). The signature covers the\n         exact bytes of that file, so a rebuilt asset needs a new signature.</p>\n      <div class="stack">\n        <div id="rel-key" class="status">No release key loaded.</div>\n        <input id="rel-file" type="file">\n        <button id="rel-sign" disabled>Sign these bytes</button>\n      </div>\n      <div class="stack" id="rel-out" style="margin-top:16px"></div>\n    </section>\n  </div>\n\n  <!-- ------------------------------------------------------------ ratify -->\n  <div id="pane-ratify" class="hide">\n    <section>\n      <h2>Sign a ratification</h2>\n      <p>Copy the bundle id and its current hash from the instance page. The signature covers\n         both, so it authorizes publishing that exact revision and no other.</p>\n      <div class="stack">\n        <div id="rat-key" class="status">No ratification key loaded.</div>\n        <div><label for="rat-id">Bundle id</label>\n          <input id="rat-id" placeholder="INFO-2026-5460-sewer-fund-transfers" spellcheck="false"></div>\n        <div><label for="rat-sha">Bundle hash</label>\n          <input id="rat-sha" placeholder="64 hex characters" spellcheck="false"></div>\n        <button id="rat-sign" disabled>Sign this ratification</button>\n      </div>\n      <div class="stack" id="rat-out" style="margin-top:16px"></div>\n    </section>\n  </div>\n</main>\n\n<script>\n/* ------------------------------------------------------------- helpers */\nconst $ = (id) => document.getElementById(id);\nconst enc = new TextEncoder();\nconst u8 = (...a) => { let n = 0; for (const p of a) n += p.length;\n  const o = new Uint8Array(n); let i = 0; for (const p of a) { o.set(p, i); i += p.length; } return o; };\nconst b64 = (bytes) => { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); };\nconst unb64 = (s) => Uint8Array.from(atob(s.replace(/\\s+/g, "")), (c) => c.charCodeAt(0));\nconst hex = (buf) => [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, "0")).join("");\n\n/* SSH wire encoding: a string is its length as a big-endian uint32, then bytes. */\nconst u32 = (n) => new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);\nconst sshStr = (v) => { const b = typeof v === "string" ? enc.encode(v) : v; return u8(u32(b.length), b); };\n\n/* An ssh-ed25519 public key on the wire, and its authorized_keys line. */\nconst wirePubkey = (raw32) => u8(sshStr("ssh-ed25519"), sshStr(raw32));\nconst pubLine = (raw32, comment) => `ssh-ed25519 ${b64(wirePubkey(raw32))} ${comment}`;\n\n/* What ssh-keygen actually signs: SSHSIG | namespace | reserved | hash alg | H(message).\n   The outer armor wraps a blob that repeats the public key and namespace so a\n   verifier can identify the signer without being told. */\nasync function sshsig(privKey, raw32, namespace, message) {\n  const h = new Uint8Array(await crypto.subtle.digest("SHA-512", message));\n  const signed = u8(enc.encode("SSHSIG"), sshStr(namespace), sshStr(""), sshStr("sha512"), sshStr(h));\n  const sig = new Uint8Array(await crypto.subtle.sign("Ed25519", privKey, signed));\n  const blob = u8(enc.encode("SSHSIG"), u32(1), sshStr(wirePubkey(raw32)),\n                  sshStr(namespace), sshStr(""), sshStr("sha512"),\n                  sshStr(u8(sshStr("ssh-ed25519"), sshStr(sig))));\n  const body = b64(blob).replace(/(.{70})/g, "$1\\n");\n  return `-----BEGIN SSH SIGNATURE-----\\n${body}\\n-----END SSH SIGNATURE-----\\n`;\n}\n\n/* WebCrypto has no seed-to-public-key call, so the public half is read out of a\n   JWK export of the same seed. Ed25519 takes PKCS#8, which for a raw seed is the\n   fixed 16-byte prefix every Ed25519 PKCS#8 key shares, followed by the seed. */\nconst PKCS8_HEAD = new Uint8Array([0x30,0x2e,0x02,0x01,0x00,0x30,0x05,0x06,0x03,0x2b,0x65,0x70,0x04,0x22,0x04,0x20]);\nasync function keysFromSeed(seed32) {\n  const pkcs8 = u8(PKCS8_HEAD, seed32);\n  const priv = await crypto.subtle.importKey("pkcs8", pkcs8, { name: "Ed25519" }, false, ["sign"]);\n  const jwk = await crypto.subtle.exportKey("jwk",\n    await crypto.subtle.importKey("pkcs8", pkcs8, { name: "Ed25519" }, true, ["sign"]));\n  const raw32 = unb64(jwk.x.replace(/-/g, "+").replace(/_/g, "/"));\n  return { priv, raw32 };\n}\n\n/* The two jobs, and the only two labels this page uses. A private key carries\n   its own label, so loading one never asks which job it belongs to. */\nconst JOBS = {\n  "bio-release": { slot: "release", title: "Release key", what: "signs the software installer" },\n  "bio-ratify":  { slot: "ratify",  title: "Ratification key", what: "attests documents for publishing" },\n};\n\n/* Private key formats. Raw is the default: a development key is disposable and a\n   passphrase on it is ceremony without a threat. The wrapped form exists for\n   production keys and is recognised automatically on load. */\nconst rawKeyString = (label, seed) => `BIOKEY-RAW1.${label}.${b64(seed)}`;\n\nconst KDF_ITER = 600000;\nasync function wrapKey(seed32, pass, label) {\n  const salt = crypto.getRandomValues(new Uint8Array(16));\n  const iv = crypto.getRandomValues(new Uint8Array(12));\n  const base = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]);\n  const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: KDF_ITER, hash: "SHA-256" },\n    base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);\n  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, seed32));\n  return ["BIOKEY1", label, b64(salt), b64(iv), b64(ct), KDF_ITER].join(".");\n}\n\nasync function parseKeyString(blob, pass) {\n  const s = (blob || "").trim();\n  if (s.startsWith("BIOKEY-RAW1.")) {\n    const [, label, seed] = s.split(".");\n    if (!JOBS[label]) throw new Error("that key does not name a job this page knows");\n    return { label, seed: unb64(seed) };\n  }\n  if (s.startsWith("BIOKEY1.")) {\n    const [, label, salt, iv, ct, iter] = s.split(".");\n    if (!JOBS[label]) throw new Error("that key does not name a job this page knows");\n    if (!pass) throw new Error("that key is protected with a passphrase; open the passphrase box below");\n    const base = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]);\n    const key = await crypto.subtle.deriveKey(\n      { name: "PBKDF2", salt: unb64(salt), iterations: Number(iter), hash: "SHA-256" },\n      base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);\n    try {\n      const seed = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, key, unb64(ct)));\n      return { label, seed };\n    } catch { throw new Error("wrong passphrase, or the key was altered"); }\n  }\n  throw new Error("that does not look like a BIO private key");\n}\n\n/* ---------------------------------------------------------------- state */\nconst KEYS = { release: null, ratify: null };   /* { priv, raw32, label } */\n\nfunction armed() {\n  for (const [slot, elId, what] of [["release", "rel-key", "release"], ["ratify", "rat-key", "ratification"]]) {\n    const k = KEYS[slot];\n    $(elId).innerHTML = k\n      ? `<span class="good">Signing as</span> <code>${pubLine(k.raw32, k.label)}</code>`\n      : `No ${what} key loaded. Make one on the Keys tab.`;\n  }\n  $("rel-sign").disabled = !KEYS.release;\n  $("rat-sign").disabled = !KEYS.ratify;\n}\n\nasync function useSeed(label, seed) {\n  const { priv, raw32 } = await keysFromSeed(seed);\n  KEYS[JOBS[label].slot] = { priv, raw32, label };\n  armed();\n  return { priv, raw32 };\n}\n\n/* ---------------------------------------------------- copyable text block */\nlet boxSeq = 0;\nfunction copyBox(labelText, value, hint) {\n  const id = "box" + (++boxSeq);\n  const rows = value.split("\\n").length > 3 ? 7 : 2;\n  return `<div class="keybox">\n    <div class="top"><label for="${id}">${labelText}</label>\n      <button class="copy ghost" data-copy="${id}">Copy</button></div>\n    <textarea id="${id}" rows="${rows}" readonly spellcheck="false">${value.replace(/</g, "&lt;")}</textarea>\n    ${hint ? `<p class="note" style="margin-top:6px">${hint}</p>` : ""}\n  </div>`;\n}\n\n/* Clipboard, with a fallback because a page opened from disk cannot always\n   reach the async clipboard API. */\nasync function copyText(text) {\n  try { await navigator.clipboard.writeText(text); return true; } catch {}\n  try {\n    const ta = document.createElement("textarea");\n    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";\n    document.body.appendChild(ta); ta.select();\n    const ok = document.execCommand("copy");\n    document.body.removeChild(ta);\n    return ok;\n  } catch { return false; }\n}\ndocument.addEventListener("click", async (e) => {\n  const btn = e.target.closest ? e.target.closest("[data-copy]") : null;\n  if (!btn) return;\n  const src = $(btn.getAttribute("data-copy"));\n  const ok = await copyText(src ? src.value : "");\n  const was = btn.textContent;\n  btn.textContent = ok ? "Copied" : "Press Ctrl+C";\n  setTimeout(() => { btn.textContent = was; }, 1400);\n});\n\n/* ------------------------------------------------------------------ tabs */\nconst PANES = [["tab-keys", "pane-keys"], ["tab-release", "pane-release"], ["tab-ratify", "pane-ratify"]];\nfor (const [btn, pane] of PANES) {\n  $(btn).onclick = () => {\n    for (const [b, p] of PANES) {\n      $(b).setAttribute("aria-pressed", String(b === btn));\n      $(p).classList.toggle("hide", p !== pane);\n    }\n  };\n}\n\n/* -------------------------------------------------------------- generate */\nfunction keyReport(made) {\n  return Object.entries(made)\n    .map(([l, m]) => `# ${JOBS[l].title} (${JOBS[l].what})\\npublic:  ${m.pub}\\nprivate: ${m.priv}`)\n    .join("\\n\\n") + "\\n";\n}\n\nasync function generateAll() {\n  const made = {};\n  for (const label of Object.keys(JOBS)) {\n    const seed = crypto.getRandomValues(new Uint8Array(32));\n    const { raw32 } = await useSeed(label, seed);\n    made[label] = { pub: pubLine(raw32, label), priv: rawKeyString(label, seed) };\n  }\n  return made;\n}\n\n$("gen").onclick = async () => {\n  const made = await generateAll();\n  const bothPub = Object.values(made).map((m) => m.pub).join("\\n");\n  const all = keyReport(made);\n\n  $("gen-out").innerHTML =\n    copyBox("Both public keys: paste these into the session", bothPub,\n            "Public keys are public by design. This is the only thing that needs to leave this page.")\n    + `<div class="row">\n         <button id="copy-all">Copy everything, keys and all</button>\n         <button id="dl" class="ghost">Download as a file</button>\n       </div>`\n    + Object.entries(made).map(([l, m]) =>\n        copyBox(`${JOBS[l].title}: private, keep this`, m.priv,\n                `Paste this back into "Load a key you already have" next time you sign. This one ${JOBS[l].what}.`)).join("")\n    + `<p class="note">These are development keys with no passphrase. When BIO goes to real groups,\n         generate fresh keys and protect them. Nothing here carries over.</p>`;\n\n  $("copy-all").onclick = async (e) => {\n    const ok = await copyText(all);\n    e.target.textContent = ok ? "Copied" : "Use the boxes below instead";\n    setTimeout(() => { e.target.textContent = "Copy everything, keys and all"; }, 1400);\n  };\n  $("dl").onclick = () => {\n    const url = URL.createObjectURL(new Blob([all], { type: "text/plain" }));\n    const a = document.createElement("a");\n    a.href = url; a.download = "bio-signing-keys.txt";\n    document.body.appendChild(a); a.click(); document.body.removeChild(a);\n    URL.revokeObjectURL(url);\n  };\n};\n\n/* ------------------------------------------------------------------ load */\n$("load").onclick = async () => {\n  try {\n    const { label, seed } = await parseKeyString($("load-blob").value, $("load-pass").value);\n    const { raw32 } = await useSeed(label, seed);\n    $("load-pass").value = "";\n    $("load-out").innerHTML =\n      `<p class="good">${JOBS[label].title} loaded.</p><p class="note"><code>${pubLine(raw32, label)}</code></p>`;\n  } catch (e) {\n    $("load-out").innerHTML = `<p class="bad">${String(e.message || e)}</p>`;\n  }\n};\n$("forget").onclick = () => {\n  KEYS.release = null; KEYS.ratify = null; armed();\n  for (const id of ["load-blob", "load-pass"]) $(id).value = "";\n  for (const id of ["gen-out", "rel-out", "rat-out"]) $(id).innerHTML = "";\n  $("load-out").innerHTML = `<p class="note">Forgotten. Nothing signing-related is left in this tab.</p>`;\n};\n\n/* -------------------------------------------------------- sign a release */\n$("rel-sign").onclick = async () => {\n  const f = $("rel-file").files[0];\n  if (!f) return ($("rel-out").innerHTML = `<p class="warn">Choose the release asset first.</p>`);\n  const k = KEYS.release;\n  const bytes = new Uint8Array(await f.arrayBuffer());\n  const sha = hex(await crypto.subtle.digest("SHA-256", bytes));\n  const sig = await sshsig(k.priv, k.raw32, "bio-release", bytes);\n  const manifest = JSON.stringify({ sha256: sha, sig, signer: pubLine(k.raw32, k.label) }, null, 1);\n  $("rel-out").innerHTML = copyBox(\n    `Signature for ${f.name}: paste this into the session`, manifest,\n    `Covers ${bytes.length} bytes hashing to <code>${sha}</code>.`);\n};\n\n/* ----------------------------------------------------- sign a ratification */\n$("rat-sign").onclick = async () => {\n  const id = $("rat-id").value.trim(), sha = $("rat-sha").value.trim().toLowerCase();\n  if (!id) return ($("rat-out").innerHTML = `<p class="warn">Paste the bundle id.</p>`);\n  if (!/^[0-9a-f]{64}$/.test(sha)) return ($("rat-out").innerHTML = `<p class="warn">The bundle hash is 64 hex characters.</p>`);\n  const k = KEYS.ratify;\n  const sig = await sshsig(k.priv, k.raw32, "bio-ratify", enc.encode(`bio-ratify ${id} ${sha}\\n`));\n  $("rat-out").innerHTML = copyBox(\n    "Signature: paste this into the ratify box on the instance page", sig,\n    `Authorizes publishing <code>${id}</code> at exactly that hash. If the bundle changes before\n     you submit it, the instance refuses this signature and you sign the new hash.`);\n};\n\narmed();\n</script>\n';

// src/gate.mjs
var CATALOG_VERSION = "1.16.5";
var GATE_VERSION = `plane-gate/1.0 (bio-checks ${CATALOG_VERSION})`;
var hex = (buf) => [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, "0")).join("");
var te = new TextEncoder();
async function runGate({ bundleId, image, knownIds, hasCapture, registers, releaseRegistry }) {
  const files = /* @__PURE__ */ new Map(), elided = /* @__PURE__ */ new Set();
  for (const [path, v] of Object.entries(image || {})) {
    if (typeof v === "string") files.set(path, v);
    else elided.add(path);
  }
  const { findings } = await checkBundle({
    folderName: bundleId,
    files,
    elidedPaths: elided,
    sha256: async (v) => hex(await crypto.subtle.digest("SHA-256", typeof v === "string" ? te.encode(v) : v)),
    sha512: async (b) => new Uint8Array(await crypto.subtle.digest("SHA-512", b)),
    resolveTarget: (id) => knownIds.has(id),
    releaseRegistry: releaseRegistry || null
  });
  const errors = findings.filter((f2) => f2.severity === "error").map((f2) => ({ check: f2.check, detail: f2.message, ...f2.repairs ? { repairs: f2.repairs } : {} }));
  for (const r of registers || []) {
    const probe = await hasCapture(r.capture_sha);
    if (!probe.present)
      errors.push({
        check: "PLANE_MISSING_BYTES",
        detail: `registered capture is absent from the working bucket`,
        where: { path: r.path, sha256: r.capture_sha }
      });
    else if (typeof r.bytes === "number" && probe.bytes !== r.bytes)
      errors.push({
        check: "PLANE_SIZE",
        detail: `capture bytes differ from the register`,
        where: { path: r.path, want: r.bytes, got: probe.bytes }
      });
  }
  return {
    gateVersion: GATE_VERSION,
    ok: errors.length === 0,
    findings: errors,
    warnings: findings.filter((f2) => f2.severity !== "error").length
  };
}

// src/sshsig.mjs
var te2 = new TextEncoder();
var b64ToBytes2 = (b64) => {
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
  const blob = b64ToBytes2(b64);
  const r = new Rd(blob);
  const t = new TextDecoder().decode(r.str());
  if (t !== "ssh-ed25519") throw new Error("pubkey: wire type mismatch");
  const raw = r.str();
  if (raw.length !== 32) throw new Error("pubkey: ed25519 key must be 32 bytes");
  return { keyType, raw, b64, comment: m.slice(2).join(" ") };
}
function wirePubkey(raw) {
  return cat(wStr(te2.encode("ssh-ed25519")), wStr(raw));
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
  return b64ToBytes2(m[1]);
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
    te2.encode("SSHSIG"),
    wStr(te2.encode(p.namespace)),
    wStr(p.reserved),
    wStr(te2.encode(p.hashAlg)),
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
var ratifyStatement = (bundleId, bundleSha) => te2.encode(`bio-ratify ${bundleId} ${bundleSha}
`);

// src/tsa.mjs
var cat2 = (...parts) => {
  let n = 0;
  for (const p of parts) n += p.length;
  const out = new Uint8Array(n);
  let i = 0;
  for (const p of parts) {
    out.set(p, i);
    i += p.length;
  }
  return out;
};
function derLen(n) {
  if (n < 128) return new Uint8Array([n]);
  const bytes = [];
  for (let v = n; v > 0; v = Math.floor(v / 256)) bytes.unshift(v % 256);
  return new Uint8Array([128 | bytes.length, ...bytes]);
}
var tlv = (tag, body) => cat2(new Uint8Array([tag]), derLen(body.length), body);
var derSequence = (...items) => tlv(48, cat2(...items));
var derOctetString = (bytes) => tlv(4, bytes);
var derNull = () => new Uint8Array([5, 0]);
var derBoolean = (v) => new Uint8Array([1, 1, v ? 255 : 0]);
function derInteger(bytes) {
  let i = 0;
  while (i < bytes.length - 1 && bytes[i] === 0 && (bytes[i + 1] & 128) === 0) i++;
  const trimmed = bytes.slice(i);
  return tlv(2, trimmed[0] & 128 ? cat2(new Uint8Array([0]), trimmed) : trimmed);
}
var derIntegerSmall = (n) => derInteger(new Uint8Array([n]));
var OID_SHA256 = new Uint8Array([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, 1]);
var hexToBytes = (hex2) => {
  const out = new Uint8Array(hex2.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex2.substr(i * 2, 2), 16);
  return out;
};
function timestampRequest(sha256Hex, nonceBytes) {
  const nonce = nonceBytes || crypto.getRandomValues(new Uint8Array(8));
  return {
    der: derSequence(
      derIntegerSmall(1),
      derSequence(derSequence(OID_SHA256, derNull()), derOctetString(hexToBytes(sha256Hex))),
      derInteger(nonce),
      derBoolean(true)
    ),
    nonce
  };
}
function readTlv(bytes, at) {
  if (at + 2 > bytes.length) return null;
  const tag = bytes[at];
  let i = at + 1, length = bytes[i++];
  if (length & 128) {
    const count = length & 127;
    if (count === 0 || i + count > bytes.length) return null;
    length = 0;
    for (let k = 0; k < count; k++) length = length * 256 + bytes[i++];
  }
  if (i + length > bytes.length) return null;
  return { tag, value: bytes.subarray(i, i + length), end: i + length, headerEnd: i };
}
function parseTimestampResponse(bytes, expectDigestHex) {
  const outer = readTlv(bytes, 0);
  if (!outer || outer.tag !== 48) return { ok: false, reason: "MALFORMED" };
  const info = readTlv(outer.value, 0);
  if (!info || info.tag !== 48) return { ok: false, reason: "MALFORMED" };
  const statusTlv = readTlv(info.value, 0);
  if (!statusTlv || statusTlv.tag !== 2) return { ok: false, reason: "MALFORMED" };
  let status = 0;
  for (const b of statusTlv.value) status = status * 256 + b;
  if (status !== 0 && status !== 1) return { ok: false, reason: "REJECTED", status };
  const token = readTlv(outer.value, info.end);
  if (!token || token.tag !== 48) return { ok: false, reason: "NO_TOKEN", status };
  const tokenBytes = outer.value.subarray(info.end, token.end);
  if (expectDigestHex) {
    const want = hexToBytes(expectDigestHex);
    let found = false;
    outer: for (let i = 0; i + want.length <= tokenBytes.length; i++) {
      for (let k = 0; k < want.length; k++) if (tokenBytes[i + k] !== want[k]) continue outer;
      found = true;
      break;
    }
    if (!found) return { ok: false, reason: "NOT_BOUND", status };
  }
  return { ok: true, status, token: tokenBytes };
}
var TSA_ENDPOINTS = [
  "http://timestamp.digicert.com",
  "http://timestamp.sectigo.com",
  "http://rfc3161.ai.moda"
];
var TSA_CONTENT_TYPE = "application/timestamp-query";
var TSA_ACCEPT = "application/timestamp-reply";
var ARCHIVE_SAVE_BASE = "https://web.archive.org/save/";
var ARCHIVE_SERVICE = "web.archive.org/save (anonymous)";
function archiveLocatorFrom(res, requested) {
  const loc = res.headers.get("content-location") || res.headers.get("location") || "";
  if (/^\/web\/\d+/.test(loc)) return "https://web.archive.org" + loc;
  if (/^https?:\/\/web\.archive\.org\/web\/\d+/.test(loc)) return loc;
  if (/^https?:\/\/web\.archive\.org\/web\/\d+/.test(res.url || "")) return res.url;
  return null;
}

// src/store.mjs
import { DurableObject } from "cloudflare:workers";

// src/query.mjs
var FIELDS = {
  id: { col: "bundle_id", type: "text" },
  type: { col: "object_type", type: "text", lower: true },
  group: { col: "group_id", type: "text", lower: true },
  title: { col: "title", type: "text", fts: "title" },
  state: { col: "current_state", type: "text", lower: true },
  prior: { col: "prior_state", type: "text", lower: true },
  created: { col: "created", type: "time" },
  updated: { col: "last_updated", type: "time" },
  criticality: { col: "criticality", type: "text", lower: true },
  classification: { col: "classification", type: "text", lower: true },
  sha: { col: "bundle_sha", type: "text", lower: true },
  schema: { col: "schema_id", type: "text", lower: true },
  mode: { col: "produced_mode", type: "text", lower: true },
  tier: { col: "capability_tier", type: "text", lower: true },
  locator: { col: "source_locator", type: "text", fts: "locator" },
  authority: { col: "source_authority", type: "text", fts: "authority" },
  retrieved: { col: "source_retrieved", type: "time" },
  status: { col: "source_status", type: "text", lower: true },
  hash: { col: "content_hash", type: "text", lower: true },
  monitored: { col: "monitor_enabled", type: "bool" },
  frequency: { col: "monitor_frequency", type: "text", lower: true },
  checked: { col: "monitor_last_checked", type: "time" },
  annotations: { col: "annotations_open", type: "number" },
  reeval: { col: "reeval_flag", type: "bool" },
  since: { col: "reeval_since", type: "time" },
  reevalsource: { col: "reeval_source", type: "text", lower: true }
};
var FTS_COLUMNS = ["title", "body", "meta", "locator", "authority"];
var SORTABLE = { relevance: null, ...Object.fromEntries(
  Object.entries(FIELDS).map(([k, f2]) => [k, f2.col])
) };
var DEFAULT_FACETS = ["type", "state", "criticality", "classification", "schema", "status"];
var GATE_MARK = "/*viewer-gate*/";
function viewerPredicate(viewer) {
  const v = typeof viewer === "string" ? viewer : "";
  const m = /^(class:(admin|member|probe)|member:([A-Za-z0-9._:-]{1,128})|admin)$/.exec(v);
  if (!m) return { sql: `${GATE_MARK} 0=1`, args: [], viewer: null, scope: "DENY" };
  const memberId = m[3] || null;
  if (!memberId) return { sql: `${GATE_MARK} 1=1`, args: [], viewer: v, scope: "member" };
  return {
    sql: `${GATE_MARK} (b.object_type <> 'project' OR EXISTS (
             SELECT 1 FROM project_participants pp
             WHERE pp.project_id = b.bundle_id AND pp.member_id = ?)
           OR EXISTS (
             SELECT 1 FROM members am
             WHERE am.member_id = ? AND am.role = 'admin' AND am.status = 'active'))`,
    args: [memberId, memberId],
    viewer: v,
    scope: "participant"
  };
}
var TEXT_PATHS = /\.(md|txt)$/i;
var TEXT_CAP = 128 * 1024;
function textOf(bundleId, files) {
  const list = (files || []).map((f2) => ({ path: f2.path, text: typeof f2.text === "string" ? f2.text : typeof f2.content === "string" ? f2.content : null }));
  const md = list.find((f2) => f2.path === "bundle.md");
  let fm = null, prose = "";
  if (md && md.text !== null) {
    let p = null;
    try {
      p = parseFrontmatter(md.text);
    } catch {
      p = null;
    }
    fm = p?.data ?? null;
    prose = typeof p?.body === "string" ? p.body : md.text;
  }
  const bits = [];
  const walk = (v) => {
    if (v === null || v === void 0) return;
    if (Array.isArray(v)) {
      for (const x of v) walk(x);
      return;
    }
    if (typeof v === "object") {
      for (const [k, val] of Object.entries(v)) {
        bits.push(k);
        walk(val);
      }
      return;
    }
    bits.push(String(v));
  };
  walk(fm);
  const others = list.filter((f2) => f2.path !== "bundle.md" && f2.text !== null && TEXT_PATHS.test(f2.path)).sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  const cap = (s) => String(s ?? "").slice(0, TEXT_CAP);
  const nested = (block, key) => {
    const b = fm && typeof fm === "object" ? fm[block] : null;
    return b && typeof b === "object" && !Array.isArray(b) && b[key] != null ? String(b[key]) : "";
  };
  return {
    title: cap(fm && fm.title != null ? String(fm.title) : ""),
    body: cap([prose, ...others.map((f2) => f2.path + "\n" + f2.text)].join("\n\n")),
    /* The identifier is folded into `meta` so pasting a bundle id into the
       search bar finds the bundle, which is the first thing anyone tries. */
    meta: cap([String(bundleId), ...bits].join(" ")),
    locator: cap(nested("source", "locator")),
    authority: cap(nested("source", "authority"))
  };
}
var OPERATORS = { AND: "and", OR: "or", NOT: "not" };
function tokenize(input) {
  const src = String(input ?? "");
  const out = [];
  let i = 0;
  const isSpace = (c) => c === " " || c === "	" || c === "\n" || c === "\r";
  const readValue = () => {
    if (src[i] === '"') {
      i++;
      let s2 = "";
      while (i < src.length && src[i] !== '"') s2 += src[i++];
      i++;
      return { text: s2, quoted: true };
    }
    let s = "";
    while (i < src.length && !isSpace(src[i]) && src[i] !== "(" && src[i] !== ")") s += src[i++];
    return { text: s, quoted: false };
  };
  while (i < src.length) {
    const c = src[i];
    if (isSpace(c)) {
      i++;
      continue;
    }
    if (c === "(") {
      out.push({ k: "(" });
      i++;
      continue;
    }
    if (c === ")") {
      out.push({ k: ")" });
      i++;
      continue;
    }
    if (c === "-" && i + 1 < src.length && !isSpace(src[i + 1])) {
      out.push({ k: "not" });
      i++;
      continue;
    }
    const start = i;
    const first = readValue();
    if (!first.quoted && first.text.includes(":")) {
      const at = first.text.indexOf(":");
      const field = first.text.slice(0, at);
      let rest = first.text.slice(at + 1);
      if (rest === "" && src[i] === '"') {
        i = start + at + 1;
        rest = readValue().text;
        out.push({ k: "sel", field, value: rest, quoted: true });
        continue;
      }
      out.push({ k: "sel", field, value: rest, quoted: false });
      continue;
    }
    if (!first.quoted && OPERATORS[first.text.toUpperCase()] && first.text === first.text.toUpperCase()) {
      out.push({ k: OPERATORS[first.text.toUpperCase()] });
      continue;
    }
    if (first.text !== "") out.push({ k: "term", value: first.text, quoted: first.quoted });
  }
  return out;
}
function parseTokens(tokens, implicitOp, ctx) {
  let p = 0;
  const peek = () => tokens[p];
  const eat = () => tokens[p++];
  const primary = () => {
    const t = peek();
    if (!t) return null;
    if (t.k === "(") {
      eat();
      const e = orExpr();
      if (peek()?.k === ")") eat();
      else ctx.warnings.push("unclosed parenthesis; read to the end of the query");
      return e;
    }
    if (t.k === ")") return null;
    if (t.k === "and" || t.k === "or") {
      eat();
      return primary();
    }
    if (t.k === "not") {
      eat();
      const k = unary();
      return k ? { op: "not", kid: k } : null;
    }
    if (t.k === "term") {
      eat();
      return textAtom(null, t.value, t.quoted, ctx);
    }
    if (t.k === "sel") {
      eat();
      return selector(t, ctx);
    }
    eat();
    return null;
  };
  const unary = () => primary();
  const andExpr = () => {
    const kids = [];
    for (; ; ) {
      const t = peek();
      if (!t || t.k === ")") break;
      if (t.k === "or") break;
      if (t.k === "and") {
        eat();
        continue;
      }
      const k = unary();
      if (k) kids.push(k);
      else if (!peek() || peek()?.k === ")") break;
    }
    if (!kids.length) return null;
    if (kids.length === 1) return kids[0];
    return { op: implicitOp, kids };
  };
  const orExpr = () => {
    const kids = [];
    for (; ; ) {
      const k = andExpr();
      if (k) kids.push(k);
      if (peek()?.k === "or") {
        eat();
        continue;
      }
      break;
    }
    if (!kids.length) return null;
    if (kids.length === 1) return kids[0];
    return { op: "or", kids };
  };
  const ast = orExpr();
  return ast;
}
function textAtom(column, value, quoted, ctx) {
  let v = value;
  let prefix = false;
  if (!quoted && v.endsWith("*") && v.length > 1) {
    prefix = true;
    v = v.slice(0, -1);
  }
  if (v === "") return null;
  if (!/[\p{L}\p{N}]/u.test(v)) return null;
  const atom = { op: "text", column, value: v, phrase: quoted && /\s/.test(v), prefix };
  ctx.textAtoms.push(atom);
  return atom;
}
var CMP = [[">=", ">="], ["<=", "<="], [">", ">"], ["<", "<"]];
function selector(tok, ctx) {
  const name = tok.field.toLowerCase();
  if (name === "has") {
    const f3 = FIELDS[String(tok.value).toLowerCase()];
    if (!f3) {
      ctx.warnings.push(`has: unknown field ${JSON.stringify(tok.value)}`);
      return null;
    }
    return { op: "meta", col: f3.col, cmp: "present", value: null };
  }
  if (name === "sort") {
    applySort(tok.value, ctx);
    return null;
  }
  if (name === "text") return textAtom(null, tok.value, tok.quoted, ctx);
  if (name === "fm") {
    const at = tok.value.indexOf("=");
    const path = at < 0 ? tok.value : tok.value.slice(0, at);
    const val = at < 0 ? null : tok.value.slice(at + 1);
    if (!/^[A-Za-z0-9_.[\]]{1,120}$/.test(path)) {
      ctx.warnings.push(`fm: path ${JSON.stringify(path)} is not a frontmatter path`);
      return null;
    }
    return val === null ? { op: "meta", json: "$." + path, cmp: "present", value: null } : { op: "meta", json: "$." + path, cmp: "=", value: val };
  }
  const f2 = FIELDS[name];
  if (!f2) {
    ctx.warnings.push(`unknown field ${JSON.stringify(tok.field)}; read as free text`);
    return textAtom(null, `${tok.field} ${tok.value}`.trim(), true, ctx);
  }
  let raw = String(tok.value);
  const range = raw.split("..");
  if (range.length === 2 && range[0] !== "" && range[1] !== "" && (f2.type === "time" || f2.type === "number")) {
    return { op: "and", kids: [
      { op: "meta", col: f2.col, cmp: ">=", value: coerce(f2, range[0]) },
      { op: "meta", col: f2.col, cmp: "<=", value: coerce(f2, range[1]) }
    ] };
  }
  for (const [lead, cmp] of CMP)
    if (raw.startsWith(lead)) return { op: "meta", col: f2.col, cmp, value: coerce(f2, raw.slice(lead.length)) };
  if (raw === "" || raw === "*") return { op: "meta", col: f2.col, cmp: "present", value: null };
  if (f2.fts) return textAtom(f2.fts, raw, tok.quoted, ctx);
  return { op: "meta", col: f2.col, cmp: "=", value: coerce(f2, raw) };
}
function coerce(f2, v) {
  if (f2.type === "number") {
    const n = Number(v);
    return Number.isFinite(n) ? n : v;
  }
  if (f2.type === "bool") return /^(1|true|yes|y|on)$/i.test(v) ? 1 : /^(0|false|no|n|off)$/i.test(v) ? 0 : v;
  return f2.lower ? String(v).toLowerCase() : String(v);
}
function applySort(spec, ctx) {
  let s = String(spec || "");
  let dir = null;
  if (s.startsWith("-")) {
    dir = "DESC";
    s = s.slice(1);
  }
  const [name, tail] = s.split(":");
  if (tail) dir = /^d/i.test(tail) ? "DESC" : "ASC";
  const key = String(name || "").toLowerCase();
  if (!(key in SORTABLE)) {
    ctx.warnings.push(`sort: unknown field ${JSON.stringify(name)}`);
    return;
  }
  ctx.sort = { field: key, dir: dir || (key === "relevance" ? "ASC" : "DESC") };
}
var ftsLiteral = (s) => `"${String(s).replace(/"/g, '""')}"`;
function ftsAtom(a) {
  const lit = ftsLiteral(a.value) + (a.prefix ? "*" : "");
  return a.column ? `{${a.column}} : ${lit}` : lit;
}
function ftsExpr(node) {
  if (!node) return null;
  if (node.op === "text") return ftsAtom(node);
  if (node.op === "not") return null;
  if (node.op === "or") {
    const parts = node.kids.map(ftsExpr);
    if (parts.some((x) => x === null)) return null;
    return "(" + parts.join(" OR ") + ")";
  }
  if (node.op === "and") {
    const pos = [], neg = [];
    for (const k of node.kids) {
      if (k.op === "not") {
        const e2 = ftsExpr(k.kid);
        if (e2 === null) return null;
        neg.push(e2);
      } else {
        const e2 = ftsExpr(k);
        if (e2 === null) return null;
        pos.push(e2);
      }
    }
    if (!pos.length) return null;
    let e = "(" + pos.join(" AND ") + ")";
    for (const n of neg) e = `(${e} NOT ${n})`;
    return e;
  }
  return null;
}
function rankExpr(atoms) {
  if (!atoms.length) return null;
  const seen = /* @__PURE__ */ new Set(), parts = [];
  for (const a of atoms) {
    const e = ftsAtom(a);
    if (!seen.has(e)) {
      seen.add(e);
      parts.push(e);
    }
  }
  return parts.length === 1 ? parts[0] : "(" + parts.join(" OR ") + ")";
}
var ALL = `SELECT fts_id AS fid FROM bundles WHERE fts_id IS NOT NULL`;
var MAX_COMPOUND = 4;
function chain(op, parts) {
  if (!parts.length) return { sql: ALL, args: [], compound: false };
  if (parts.length === 1) return { sql: parts[0].sql, args: parts[0].args, compound: !!parts[0].compound };
  if (parts.length <= MAX_COMPOUND)
    return { sql: parts.map((p) => p.sql).join(` ${op} `), args: parts.flatMap((p) => p.args), compound: true };
  const groups = [];
  for (let i = 0; i < parts.length; i += MAX_COMPOUND) groups.push(parts.slice(i, i + MAX_COMPOUND));
  return chain(op, groups.map((g) => {
    const c = chain(op, g);
    return { sql: c.compound ? `SELECT fid FROM (${c.sql})` : c.sql, args: c.args, compound: false };
  }));
}
function metaSql(node) {
  const lhs = node.json ? `json_extract(fm_json, ?)` : node.col;
  const args = node.json ? [node.json] : [];
  if (node.cmp === "present")
    return {
      sql: `SELECT fts_id AS fid FROM bundles WHERE fts_id IS NOT NULL AND ${lhs} IS NOT NULL AND ${lhs} <> ''`,
      args: node.json ? [node.json, node.json] : []
    };
  return {
    sql: `SELECT fts_id AS fid FROM bundles WHERE fts_id IS NOT NULL AND ${lhs} ${node.cmp} ?`,
    args: [...args, node.value]
  };
}
function setSql(node) {
  if (!node) return { sql: ALL, args: [], compound: false };
  const fe = ftsExpr(node);
  if (fe !== null)
    return { sql: `SELECT rowid AS fid FROM bundles_fts WHERE bundles_fts MATCH ?`, args: [fe], compound: false };
  if (node.op === "meta") return { ...metaSql(node), compound: false };
  if (node.op === "text")
    return { sql: `SELECT rowid AS fid FROM bundles_fts WHERE bundles_fts MATCH ?`, args: [ftsAtom(node)], compound: false };
  if (node.op === "not") {
    const inner = operand(setSql(node.kid));
    return { sql: `${ALL} EXCEPT ${inner.sql}`, args: inner.args, compound: true };
  }
  if (node.op === "or")
    return chain("UNION", node.kids.map((k) => operand(setSql(k))));
  if (node.op === "and") {
    const pos = node.kids.filter((k) => k.op !== "not");
    const neg = node.kids.filter((k) => k.op === "not").map((k) => k.kid);
    const posChain = chain("INTERSECT", (pos.length ? pos : [null]).map((k) => operand(setSql(k))));
    if (!neg.length) return posChain;
    const head = {
      sql: posChain.compound ? `SELECT fid FROM (${posChain.sql})` : posChain.sql,
      args: posChain.args,
      compound: false
    };
    return chain("EXCEPT", [head, ...neg.map((n) => operand(setSql(n)))]);
  }
  return { sql: ALL, args: [], compound: false };
}
var operand = (s) => s.compound ? { sql: `SELECT fid FROM (${s.sql})`, args: s.args } : { sql: s.sql, args: s.args };
var PROVENANCE_COLS = [
  "bundle_id",
  "object_type",
  "group_id",
  "title",
  "current_state",
  "prior_state",
  "created",
  "last_updated",
  "criticality",
  "classification",
  "bundle_sha",
  "schema_id",
  "produced_mode",
  "capability_tier",
  "source_locator",
  "source_authority",
  "source_retrieved",
  "source_status",
  "content_hash",
  "monitor_enabled",
  "monitor_frequency",
  "monitor_last_checked",
  "annotations_open",
  "reeval_flag",
  "reeval_since",
  "reeval_source"
];
var LIMIT_DEFAULT = 50;
var LIMIT_MAX = 500;
var IDS_MAX = 5e4;
function compile({
  q = "",
  viewer = null,
  sort = null,
  dir = null,
  limit = LIMIT_DEFAULT,
  offset = 0,
  ids = null,
  facets = null,
  implicitOp = "and",
  snippetChars = 12
} = {}) {
  const ctx = { warnings: [], textAtoms: [], sort: null };
  const ast = parseTokens(tokenize(q), implicitOp === "or" ? "or" : "and", ctx);
  if (sort && sort in SORTABLE) ctx.sort = { field: sort, dir: /^d/i.test(dir || "") ? "DESC" : dir ? "ASC" : sort === "relevance" ? "ASC" : "DESC" };
  const gate = viewerPredicate(viewer);
  const rank = rankExpr(ctx.textAtoms);
  const set = setSql(ast);
  const widenable = implicitOp !== "or" && ast?.op === "and" && Array.isArray(ast.kids) && ast.kids.length > 1;
  const lim = Math.max(1, Math.min(LIMIT_MAX, Math.floor(Number(limit) || LIMIT_DEFAULT)));
  const off = Math.max(0, Math.floor(Number(offset) || 0));
  const cte = (withRanked) => {
    const idArm = Array.isArray(ids) && ids.length ? { sql: `SELECT fts_id AS fid FROM bundles WHERE bundle_id IN (${ids.map(() => "?").join(",")})`, args: ids } : null;
    const parts = [`hits(fid) AS (${set.sql})`];
    if (idArm) {
      parts.push(`picked(fid) AS (${idArm.sql})`);
      parts.push(`scope(fid) AS (SELECT fid FROM hits INTERSECT SELECT fid FROM picked)`);
    } else {
      parts.push(`scope(fid) AS (SELECT fid FROM hits)`);
    }
    const args = [...set.args, ...idArm ? idArm.args : []];
    if (withRanked && rank) {
      parts.push(`ranked(fid, score, snip) AS (SELECT rowid AS fid, bm25(bundles_fts) AS score, snippet(bundles_fts, -1, '[', ']', '\u2026', ?) AS snip FROM bundles_fts WHERE bundles_fts MATCH ?)`);
      args.push(Math.max(4, Math.min(64, Math.floor(snippetChars))), rank);
    }
    return { sql: "WITH " + parts.join(",\n     "), args };
  };
  const sortField = ctx.sort?.field || (rank ? "relevance" : "updated");
  const sortDir = ctx.sort?.dir || (sortField === "relevance" ? "ASC" : "DESC");
  let order;
  if (sortField === "relevance" && rank) order = `COALESCE(r.score, 0) ${sortDir}, b.bundle_id ASC`;
  else if (sortField === "relevance") order = `b.last_updated DESC, b.bundle_id ASC`;
  else {
    const col = `b.${SORTABLE[sortField]}`;
    order = `(${col} IS NULL) ASC, ${col} ${sortDir}, b.bundle_id ASC`;
  }
  const cols = PROVENANCE_COLS.map((c) => `b.${c}`).join(", ");
  const joinRanked = rank ? ` LEFT JOIN ranked r ON r.fid = s.fid` : "";
  const scored = rank ? `, r.score AS score, r.snip AS snippet` : `, NULL AS score, NULL AS snippet`;
  const page = () => {
    const c = cte(true);
    return { sql: `${c.sql}
SELECT ${cols}${scored} FROM scope s JOIN bundles b ON b.fts_id = s.fid${joinRanked}
WHERE ${gate.sql}
ORDER BY ${order} LIMIT ? OFFSET ?`, args: [...c.args, ...gate.args, lim, off] };
  };
  const count = () => {
    const c = cte(false);
    return {
      sql: `${c.sql}
SELECT count(*) AS n FROM scope s JOIN bundles b ON b.fts_id = s.fid WHERE ${gate.sql}`,
      args: [...c.args, ...gate.args]
    };
  };
  const idsStmt = () => {
    const c = cte(true);
    return { sql: `${c.sql}
SELECT b.bundle_id FROM scope s JOIN bundles b ON b.fts_id = s.fid${joinRanked}
WHERE ${gate.sql}
ORDER BY ${order} LIMIT ?`, args: [...c.args, ...gate.args, IDS_MAX] };
  };
  const snapshot = () => {
    const c = cte(true);
    return { sql: `${c.sql}
SELECT b.bundle_id, b.bundle_sha FROM scope s JOIN bundles b ON b.fts_id = s.fid${joinRanked}
WHERE ${gate.sql}
ORDER BY ${order} LIMIT ?`, args: [...c.args, ...gate.args, IDS_MAX] };
  };
  const facetList = (Array.isArray(facets) && facets.length ? facets : DEFAULT_FACETS).map((f2) => String(f2).toLowerCase()).filter((f2) => f2 in FIELDS);
  const facets_ = () => {
    if (!facetList.length) return [];
    const out = [];
    for (let i = 0; i < facetList.length; i += MAX_COMPOUND) {
      const group = facetList.slice(i, i + MAX_COMPOUND);
      const c = cte(false);
      const arms = group.map((name) => {
        const f2 = FIELDS[name];
        return `SELECT '${name}' AS field, b.${f2.col} AS value, count(*) AS n
  FROM scope s JOIN bundles b ON b.fts_id = s.fid
  WHERE ${gate.sql} AND b.${f2.col} IS NOT NULL GROUP BY b.${f2.col}`;
      });
      out.push({
        sql: `${c.sql.replace("hits(fid) AS (", "hits(fid) AS MATERIALIZED (")}
` + arms.join("\nUNION ALL\n") + `
ORDER BY field ASC, n DESC, value ASC`,
        args: [...c.args, ...group.flatMap(() => gate.args)]
      });
    }
    return out;
  };
  const facetScan = () => {
    if (!facetList.length) return null;
    const c = cte(false);
    const sel = facetList.map((n) => `b.${FIELDS[n].col}`).join(", ");
    return {
      sql: `${c.sql}
SELECT ${sel} FROM scope s JOIN bundles b ON b.fts_id = s.fid
WHERE ${gate.sql}`,
      args: [...c.args, ...gate.args]
    };
  };
  return {
    ast,
    warnings: ctx.warnings,
    gate: gate.scope,
    viewer: gate.viewer,
    sort: { field: sortField, dir: sortDir },
    limit: lim,
    offset: off,
    match: rank,
    terms: ctx.textAtoms.map((a) => a.value),
    widenable,
    facetFields: facetList,
    facetCols: facetList.map((n) => FIELDS[n].col),
    restricted: Array.isArray(ids) && ids.length > 0,
    statements: { page, count, ids: idsStmt, snapshot, facets: facets_, facetScan }
  };
}

// src/store.mjs
var EMPTY_STRING_SHA2 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
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
    const memberCols = [...this.sql.exec(`PRAGMA table_info(members)`)].map((r) => r.name);
    if (memberCols.includes("name") && !memberCols.includes("cover"))
      this.sql.exec(`ALTER TABLE members RENAME COLUMN name TO cover`);
    for (const [table, column, decl] of [
      /* The membership model's member half. A COVER is what an administrator
         calls someone in the roster; a HANDLE is what the member chooses at
         enrolment and what the RECORD shows. Two names assigned by two parties
         for two purposes, and only administrators see them together
         (Membership Architecture section 3). Additive and nullable, so a member
         enrolled before handles existed simply has none until they choose one. */
      ["members", "handle", "TEXT"],
      /* Capabilities, section 5. Stored as a JSON array rather than a column
         apiece because the set is expected to grow and a column per capability
         is a migration per capability. `administer` is deliberately NOT in this
         list even though it is a capability: it is granted and removed only by
         the section 4 process, never by editing a field. */
      ["members", "capabilities", "TEXT"],
      /* Declared expertise, section 1.3: metadata that informs humans and gates
         nothing. Recorded here so it cannot drift into being consulted. */
      ["members", "expertise", "TEXT"],
      ["manifest", "writer", "TEXT"],
      ["manifest", "operation", "TEXT"],
      /* S-10 step 1: the metadata projection the retrieval surface filters and
         sorts on. Probe 2 (development/RETRIEVAL-SUBSTRATE.md) measured that the
         original nine columns cover about half of what real frontmatter carries,
         and that typed indexed columns beat a facet table by roughly 9x on write
         cost and 5.5x on space while never being slower. So: a column for every
         field the UX filters on, and fm_json for the per-schema tail, since
         information@1, information@2, problem@1 and project@1 carry different
         field sets and more versions are coming. All nullable and additive, so
         an older row simply has an empty projection until the backfill below
         re-derives it from bundle.md. */
      ["bundles", "schema_id", "TEXT"],
      ["bundles", "produced_mode", "TEXT"],
      ["bundles", "capability_tier", "TEXT"],
      ["bundles", "source_locator", "TEXT"],
      ["bundles", "source_authority", "TEXT"],
      ["bundles", "source_retrieved", "TEXT"],
      ["bundles", "source_status", "TEXT"],
      ["bundles", "content_hash", "TEXT"],
      ["bundles", "monitor_enabled", "INTEGER"],
      ["bundles", "monitor_frequency", "TEXT"],
      ["bundles", "monitor_last_checked", "TEXT"],
      ["bundles", "annotations_open", "INTEGER"],
      ["bundles", "reeval_flag", "INTEGER"],
      ["bundles", "reeval_since", "TEXT"],
      ["bundles", "reeval_source", "TEXT"],
      ["bundles", "fm_json", "TEXT"],
      /* S-10 step 2: the row key the text index is aligned on. FTS5 addresses
         rows by integer rowid, and probe 2 chose an integer join over a string
         join for text-plus-metadata queries, so a bundle needs a stable integer
         of its own. NOT the table's implicit rowid: that is an implementation
         detail SQLite is entitled to renumber, and an index keyed on a number
         the engine may change is an index that can silently point at the wrong
         document. */
      ["bundles", "fts_id", "INTEGER"]
    ]) {
      const have = [...this.sql.exec(`PRAGMA table_info(${table})`)].some((r) => r.name === column);
      if (!have) this.sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
    }
    for (const c of [
      "schema_id",
      "produced_mode",
      "source_authority",
      "source_status",
      "monitor_frequency",
      "reeval_flag",
      "annotations_open"
    ])
      this.sql.exec(`CREATE INDEX IF NOT EXISTS bundles_${c} ON bundles(${c})`);
    this.sql.exec(`CREATE UNIQUE INDEX IF NOT EXISTS bundles_fts_id ON bundles(fts_id)`);
    this.sql.exec(
      `CREATE VIRTUAL TABLE IF NOT EXISTS bundles_fts USING fts5(
         ${FTS_COLUMNS.join(", ")}, tokenize='unicode61')`
    );
    this.sql.exec(`CREATE UNIQUE INDEX IF NOT EXISTS members_handle ON members(handle) WHERE handle IS NOT NULL`);
    this.sql.exec(
      `CREATE TABLE IF NOT EXISTS project_participants (
         project_id TEXT NOT NULL,
         member_id  TEXT NOT NULL,
         state      TEXT NOT NULL,
         owner      INTEGER NOT NULL DEFAULT 0,
         invited_by TEXT,
         comment    TEXT,
         created    TEXT NOT NULL,
         updated    TEXT NOT NULL,
         PRIMARY KEY (project_id, member_id)
       )`
    );
    this.sql.exec(`CREATE INDEX IF NOT EXISTS pp_member ON project_participants(member_id)`);
    this.sql.exec(
      `CREATE TABLE IF NOT EXISTS admin_votes (
         kind      TEXT NOT NULL,
         target    TEXT NOT NULL,
         voter     TEXT NOT NULL,
         reason    TEXT,
         created   TEXT NOT NULL,
         PRIMARY KEY (kind, target, voter)
       )`
    );
    this.sql.exec(
      `CREATE TABLE IF NOT EXISTS selections (
         handle     TEXT PRIMARY KEY,
         owner      TEXT NOT NULL,
         kind       TEXT NOT NULL,
         q          TEXT NOT NULL,
         sort_field TEXT, sort_dir TEXT,
         created    TEXT NOT NULL,
         touched    TEXT NOT NULL,
         expires    TEXT NOT NULL,
         n          INTEGER NOT NULL,
         digest     TEXT NOT NULL
       )`
    );
    this.sql.exec(`CREATE INDEX IF NOT EXISTS selections_owner ON selections(owner)`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS selections_expires ON selections(expires)`);
    this.sql.exec(
      `CREATE TABLE IF NOT EXISTS selection_items (
         handle     TEXT NOT NULL,
         ord        INTEGER NOT NULL,
         bundle_id  TEXT NOT NULL,
         bundle_sha TEXT NOT NULL,
         PRIMARY KEY (handle, ord)
       )`
    );
    this.#backfillProjection(500);
  }
  /* The projection derived from a bundle.md, using the CATALOG'S OWN parser so
     the store's view and the checker's view cannot disagree about what the
     document says. Returns nulls rather than guesses when frontmatter does not
     parse: a wrong value in a filterable column is worse than an absent one,
     because a filter silently under-reports and the member cannot tell. */
  static projectionOf(bundleMdText) {
    const empty = {
      schema_id: null,
      produced_mode: null,
      capability_tier: null,
      source_locator: null,
      source_authority: null,
      source_retrieved: null,
      source_status: null,
      content_hash: null,
      monitor_enabled: null,
      monitor_frequency: null,
      monitor_last_checked: null,
      annotations_open: null,
      reeval_flag: null,
      reeval_since: null,
      reeval_source: null,
      fm_json: null
    };
    if (typeof bundleMdText !== "string") return empty;
    let fm = null;
    try {
      fm = parseFrontmatter(bundleMdText).data;
    } catch {
      return empty;
    }
    if (!fm || typeof fm !== "object") return empty;
    const s = (v) => typeof v === "string" && v !== "" ? v : v === 0 ? "0" : v == null ? null : String(v);
    const nested = (block, key) => {
      const b = fm[block];
      return b && typeof b === "object" && !Array.isArray(b) ? b[key] : void 0;
    };
    const bool = (v) => v === true ? 1 : v === false ? 0 : null;
    const num = (v) => typeof v === "number" && Number.isFinite(v) ? v : null;
    const rp = fm.reeval_pending;
    const rpObj = rp && typeof rp === "object" && !Array.isArray(rp);
    return {
      schema_id: s(fm.schema),
      produced_mode: s(nested("produced_by", "mode")),
      capability_tier: s(nested("produced_by", "capability_tier")),
      source_locator: s(nested("source", "locator")),
      source_authority: s(nested("source", "authority")),
      source_retrieved: s(nested("source", "retrieved")),
      source_status: s(fm.source_status),
      content_hash: s(fm.content_hash),
      monitor_enabled: bool(nested("monitoring", "enabled")),
      monitor_frequency: s(nested("monitoring", "frequency")),
      monitor_last_checked: s(nested("monitoring", "last_checked")),
      annotations_open: num(fm.annotations_open),
      reeval_flag: rpObj ? bool(rp.flag) : bool(rp),
      reeval_since: rpObj ? s(rp.since) : null,
      reeval_source: rpObj ? s(rp.source) : null,
      fm_json: JSON.stringify(fm)
    };
  }
  static PROJECTION_COLS = [
    "schema_id",
    "produced_mode",
    "capability_tier",
    "source_locator",
    "source_authority",
    "source_retrieved",
    "source_status",
    "content_hash",
    "monitor_enabled",
    "monitor_frequency",
    "monitor_last_checked",
    "annotations_open",
    "reeval_flag",
    "reeval_since",
    "reeval_source",
    "fm_json"
  ];
  /* Write the projection for one bundle. Called inside promote's transaction, so
     the projection can never be a revision behind the document. */
  #writeProjection(bundleId, bundleMdText) {
    const p = _Store.projectionOf(bundleMdText);
    const set = _Store.PROJECTION_COLS.map((c) => `${c}=?`).join(", ");
    this.sql.exec(
      `UPDATE bundles SET ${set} WHERE bundle_id=?`,
      ..._Store.PROJECTION_COLS.map((c) => p[c]),
      bundleId
    );
    return p;
  }
  /* The integer the text index is keyed on. Allocated once per bundle and never
     reassigned while the bundle exists, so a revision replaces its own index row
     rather than orphaning one. MAX+1 rather than a sequence because it is
     allocated inside promote's transaction, and a Durable Object runs one
     transaction at a time, so there is no race to lose. */
  #ftsIdFor(bundleId) {
    const cur = this.#one(`SELECT fts_id FROM bundles WHERE bundle_id=?`, bundleId);
    if (cur && cur.fts_id !== null && cur.fts_id !== void 0) return cur.fts_id;
    const next = (this.#one(`SELECT COALESCE(MAX(fts_id), 0) AS m FROM bundles`).m || 0) + 1;
    this.sql.exec(`UPDATE bundles SET fts_id=? WHERE bundle_id=?`, next, bundleId);
    return next;
  }
  /* Delete-then-insert rather than an FTS5 UPDATE, because a revision can change
     which files exist and an in-place update of a virtual table row is the shape
     that leaves stale terms behind. Called inside promote's transaction, so the
     text index cannot be a revision behind the corpus. */
  #writeText(bundleId, files) {
    const fid = this.#ftsIdFor(bundleId);
    const t = textOf(bundleId, files);
    this.sql.exec(`DELETE FROM bundles_fts WHERE rowid=?`, fid);
    this.sql.exec(
      `INSERT INTO bundles_fts (rowid, ${FTS_COLUMNS.join(", ")}) VALUES (?, ${FTS_COLUMNS.map(() => "?").join(", ")})`,
      fid,
      ...FTS_COLUMNS.map((c) => t[c])
    );
    return { fts_id: fid, chars: FTS_COLUMNS.reduce((n, c) => n + t[c].length, 0) };
  }
  #filesOf(bundleId) {
    return this.#rows(`SELECT path, content FROM files WHERE bundle_id=?`, bundleId).map((r) => ({ path: r.path, text: r.content }));
  }
  /* One backfill for both derived structures. A row is stale if it has no
     projection or no text index, which covers a row written before either
     existed and a row whose index was cleared for repair. Bounded per pass
     because a Durable Object has a CPU budget: a large store finishes over
     successive constructions rather than timing out on one. */
  #backfillProjection(limit) {
    const stale = this.#rows(
      `SELECT bundle_id, fm_json IS NULL AS need_proj, fts_id IS NULL AS need_text
         FROM bundles WHERE fm_json IS NULL OR fts_id IS NULL ORDER BY bundle_id LIMIT ?`,
      limit
    );
    let n = 0, t = 0;
    for (const r of stale) {
      const files = this.#filesOf(r.bundle_id);
      const md = files.find((f2) => f2.path === "bundle.md");
      if (!md || md.text === null) continue;
      if (r.need_proj) {
        this.#writeProjection(r.bundle_id, md.text);
        n++;
      }
      if (r.need_text) {
        this.#writeText(r.bundle_id, files);
        t++;
      }
    }
    return {
      reprojected: n,
      reindexed: t,
      remaining: this.#one(`SELECT count(*) c FROM bundles WHERE fm_json IS NULL OR fts_id IS NULL`).c
    };
  }
  /** Re-derive the projection and the text index for rows that lack one. Exposed
   *  because a deploy runs the bounded pass once at construction and a large
   *  store may need more than one. Idempotent: a row that has both is left
   *  alone. */
  reproject({ limit = 500 } = {}) {
    return this.#backfillProjection(limit);
  }
  /** The projected metadata for one bundle, or a json_extract query over the
   *  per-schema tail. This is what the retrieval compiler will filter on. */
  projection({ bundleId = null, jsonPath = null, jsonEquals = null, limit = 200 } = {}) {
    const cols = [
      "bundle_id",
      "object_type",
      "group_id",
      "title",
      "current_state",
      "prior_state",
      "created",
      "last_updated",
      "criticality",
      "classification",
      "bundle_sha",
      ..._Store.PROJECTION_COLS
    ].join(", ");
    if (bundleId) return this.#one(`SELECT ${cols} FROM bundles WHERE bundle_id=?`, bundleId);
    if (jsonPath !== null && jsonEquals !== null)
      return this.#rows(
        `SELECT ${cols} FROM bundles WHERE json_extract(fm_json, ?) = ? ORDER BY bundle_id LIMIT ?`,
        jsonPath,
        jsonEquals,
        limit
      );
    return this.#rows(`SELECT ${cols} FROM bundles ORDER BY bundle_id LIMIT ?`, limit);
  }
  /** EXPLAIN QUERY PLAN for representative filters, so a test can assert the
   *  index is USED rather than trusting that creating it was enough. */
  projectionPlan() {
    const out = {};
    for (const c of ["source_status", "produced_mode", "schema_id", "reeval_flag"])
      out[c] = this.#rows(`EXPLAIN QUERY PLAN SELECT bundle_id FROM bundles WHERE ${c} = ?`, "x").map((r) => r.detail);
    return out;
  }
  /** Test and repair support: clear a projection so the backfill path can be
   *  exercised against a row that looks like it predates the columns. */
  projectionClear({ bundleId = null, text = true } = {}) {
    const set = _Store.PROJECTION_COLS.map((c) => `${c}=NULL`).join(", ");
    if (bundleId) this.sql.exec(`UPDATE bundles SET ${set} WHERE bundle_id=?`, bundleId);
    else this.sql.exec(`UPDATE bundles SET ${set}`);
    if (text) {
      if (bundleId) {
        const r = this.#one(`SELECT fts_id FROM bundles WHERE bundle_id=?`, bundleId);
        if (r && r.fts_id != null) this.sql.exec(`DELETE FROM bundles_fts WHERE rowid=?`, r.fts_id);
        this.sql.exec(`UPDATE bundles SET fts_id=NULL WHERE bundle_id=?`, bundleId);
      } else {
        this.sql.exec(`DELETE FROM bundles_fts`);
        this.sql.exec(`UPDATE bundles SET fts_id=NULL`);
      }
    }
    return { ok: true, scope: bundleId || "ALL", text };
  }
  /* ---- S-10 step 3: the retrieval surface ----
   *
   * Five verbs, one call, run where the data is, which is the shape D-26 chose.
   *   search  the query string, compiled by query.mjs
   *   filter  selectors in that same string, plus facet counts to drive a sidebar
   *   list    every hit arrives with full provenance, per Bob's decision
   *   sort    any projected field, always with the declared id tiebreak
   *   select  mode=ids returns the WHOLE set, which is a different request
   *
   * The store builds no SQL. Every statement comes from compile(), and this
   * method refuses to execute one that does not carry the viewer gate, so a
   * query path that skipped D-15's single compilation point fails loudly instead
   * of quietly returning more than the viewer may see.
   */
  #runQuery(stmt, tally) {
    if (!stmt || typeof stmt.sql !== "string" || !stmt.sql.includes(GATE_MARK))
      throw new Error("REFUSED: a retrieval statement reached the store without the viewer visibility gate (D-15)");
    tally.applied++;
    return this.#rows(stmt.sql, ...stmt.args);
  }
  search(input = {}) {
    const mode = input.mode === "ids" ? "ids" : input.mode === "count" ? "count" : "page";
    const plan = compile(input);
    const tally = { applied: 0 };
    const total = this.#runQuery(plan.statements.count(), tally)[0]?.n ?? 0;
    const out = {
      query: {
        q: String(input.q ?? ""),
        terms: plan.terms,
        match: plan.match,
        sort: plan.sort,
        warnings: plan.warnings,
        mode
      },
      /* The gate is reported, not assumed. `scope` is DENY when the caller
         presented no recognisable viewer, which is the fail-closed answer, and
         `applied` counts the statements that carried the gate. */
      gate: { scope: plan.gate, applied: 0 },
      total,
      limit: plan.limit,
      offset: plan.offset
    };
    if (mode === "page") {
      out.hits = this.#runQuery(plan.statements.page(), tally);
    } else if (mode === "ids") {
      const ids = this.#runQuery(plan.statements.ids(), tally).map((r) => r.bundle_id);
      out.ids = ids;
      out.truncated = ids.length >= IDS_MAX;
    }
    if (input.facets !== false && mode !== "count") {
      out.facets = this.#facetCounts(plan, tally, input.facetMode);
    }
    out.widen = null;
    if (total === 0 && plan.widenable && input.widen !== false) {
      const or = compile({ ...input, implicitOp: "or" });
      const n = this.#runQuery(or.statements.count(), tally)[0]?.n ?? 0;
      if (n > 0) out.widen = {
        interpretation: "OR",
        total: n,
        q: String(input.q ?? ""),
        detail: "no bundle matches all of these terms; this many match any of them"
      };
    }
    out.gate.applied = tally.applied;
    return out;
  }
  /** The fields the surface knows, so a UI can build its own controls from the
   *  plane's vocabulary rather than a copy of it that drifts. */
  searchFields() {
    return {
      fields: Object.fromEntries(Object.entries(FIELDS).map(([k, f2]) => [k, { type: f2.type, freeText: !!f2.fts, column: f2.col }])),
      ftsColumns: FTS_COLUMNS,
      defaultFacets: DEFAULT_FACETS,
      idsMax: IDS_MAX,
      syntax: [
        "bare words are AND, ranked by relevance",
        '"quoted phrase" is one unit',
        "term* is a prefix match",
        "-term and NOT term exclude",
        "OR and parentheses nest",
        "field:value filters; free-text fields (title, locator, authority) match text, enumerations match exactly",
        "field:>value, field:<value, field:a..b compare and range",
        "has:field asks whether the field carries any value",
        "fm:path and fm:path=value reach frontmatter no column projects",
        "sort:field and sort:-field order the result"
      ]
    };
  }
  /** The verifier for the claim that the index cannot diverge from the corpus.
   *
   *  "Maintained in the same transaction" is a design, and a design is not a
   *  measurement. This re-derives the expected text row for every bundle from
   *  the stored files and compares it against what the index actually holds,
   *  which is the only thing that can tell the difference between an index that
   *  cannot diverge and one that has not diverged yet. Paginated and resumable
   *  by cursor, the same shape as the conformance audit. */
  searchIndexCheck({ after = "", limit = 200 } = {}) {
    const cap = Math.max(1, Math.min(1e3, Math.floor(Number(limit) || 200)));
    const rows = this.#rows(
      `SELECT bundle_id, fts_id FROM bundles WHERE bundle_id > ? ORDER BY bundle_id LIMIT ?`,
      after,
      cap
    );
    const findings = [];
    for (const r of rows) {
      if (r.fts_id === null || r.fts_id === void 0) {
        findings.push({ bundleId: r.bundle_id, finding: "NO_FTS_ID", detail: "the bundle has no text index key" });
        continue;
      }
      const have = this.#one(
        `SELECT ${FTS_COLUMNS.join(", ")} FROM bundles_fts WHERE rowid=?`,
        r.fts_id
      );
      if (!have) {
        findings.push({ bundleId: r.bundle_id, finding: "NO_INDEX_ROW", ftsId: r.fts_id });
        continue;
      }
      const want = textOf(r.bundle_id, this.#filesOf(r.bundle_id));
      const bad = FTS_COLUMNS.filter((c) => String(have[c] ?? "") !== String(want[c] ?? ""));
      if (bad.length)
        findings.push({
          bundleId: r.bundle_id,
          finding: "DIVERGED",
          columns: bad,
          chars: Object.fromEntries(bad.map((c) => [c, [String(have[c] ?? "").length, String(want[c] ?? "").length]]))
        });
    }
    const orphans = this.#rows(
      `SELECT rowid AS fts_id FROM bundles_fts WHERE rowid NOT IN (SELECT fts_id FROM bundles WHERE fts_id IS NOT NULL) LIMIT 100`
    ).map((r) => r.fts_id);
    const last = rows.length ? rows[rows.length - 1].bundle_id : null;
    return {
      checked: rows.length,
      findings,
      orphans,
      counts: {
        bundles: this.#one(`SELECT count(*) c FROM bundles`).c,
        indexed: this.#one(`SELECT count(*) c FROM bundles_fts`).c,
        keyed: this.#one(`SELECT count(*) c FROM bundles WHERE fts_id IS NOT NULL`).c
      },
      cursor: rows.length === cap ? last : null,
      ok: findings.length === 0 && orphans.length === 0
    };
  }
  /* ---- S-10 step 5: selections ----
   *
   * KEEP-ALIVE, 300 seconds, refreshed on read. The same number and the same
   * shape as `leases`, deliberately: a Worker holds no connection, so a closed
   * tab is unobservable and the plane can only require proof of life. A view
   * that is still on screen keeps its selection alive by using it; one that is
   * gone stops paying. Bob's decision, 2026-07-25, explicitly provisional: only
   * operational experience will say whether 300s is right.
   */
  static SELECTION_TTL_MS = 3e5;
  static SELECTION_MAX_ITEMS = 1e4;
  // an enumeration above this is REFUSED, never downgraded
  static SELECTION_MAX_PER_OWNER = 32;
  /* MEASURED, and lower than SQLite's documented default by two orders of
     magnitude: workerd refuses a statement binding more than about 100
     variables. Binary-searched through this exact code path on 2026-07-25, where
     the largest id list that compiled was 99, with the gate, ranking and limit
     arguments sharing the same budget. 64 leaves headroom for arguments a future
     CTE arm adds without silently reintroducing the failure. Found by the scale
     bench and not by the suite, because no test had ever enumerated more than a
     handful of ids; test/selection.test.mjs now crosses the boundary on purpose. */
  static SELECTION_ID_CHUNK = 64;
  /* Citing writes one frontmatter entry per cited record into a single
     bundle.md, so the number of edges a Project can carry is bounded by
     INLINE_MAX and NOT by SELECTION_MAX_ITEMS. The two were set independently
     and they collide: a maximum legal enumeration of 10,000 produces a
     1,070,846-byte document against a 1,048,576-byte ceiling. MEASURED at 83
     bytes per edge for the reference block at a 25-character bundle id
     (2026-07-25, test/cite-scale.mjs); used only to tell an operator roughly how
     many would fit, never to decide the refusal, which is made on the real
     encoded length. */
  static CITE_EDGE_BYTES = 83;
  /* How many ids a Session Log entry names before it summarises. Bounded for
     the same reason the audit bounds its offender list. */
  static CITE_LOG_SAMPLE = 20;
  #sweepSelections() {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const dead = this.#rows(`SELECT handle FROM selections WHERE expires < ?`, now).map((r) => r.handle);
    for (const h of dead) {
      this.sql.exec(`DELETE FROM selection_items WHERE handle=?`, h);
      this.sql.exec(`DELETE FROM selections WHERE handle=?`, h);
    }
    return dead.length;
  }
  /* The alarm is the backstop for the case the lazy sweep cannot cover: a member
     makes a selection and never comes back, so no later call arrives to clean up
     behind them. Rescheduled while any selection is live and left unset when
     none is, so an idle instance carries no timer. */
  async #armSweep() {
    const live = this.#one(`SELECT count(*) c FROM selections`).c;
    const at = await this.ctx.storage.getAlarm();
    if (live > 0 && at === null)
      await this.ctx.storage.setAlarm(Date.now() + _Store.SELECTION_TTL_MS + 3e4);
  }
  async alarm() {
    this.#sweepSelections();
    if (this.#one(`SELECT count(*) c FROM selections`).c > 0)
      await this.ctx.storage.setAlarm(Date.now() + _Store.SELECTION_TTL_MS + 3e4);
  }
  static #digestOf(ids) {
    let h1 = 2166136261, h2 = 16777619;
    for (const s of ids) for (let i = 0; i < s.length; i++) {
      h1 = Math.imul(h1 ^ s.charCodeAt(i), 16777619) >>> 0;
      h2 = Math.imul(h2 + s.charCodeAt(i) + i, 2246822507) >>> 0;
    }
    return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
  }
  /** Create a selection. `kind` is decided by what the caller supplied, not by
   *  size: an explicit id list is an enumeration, a bare query is a query
   *  selection. Bob settled that select-all means the query, 2026-07-25. */
  async selectionCreate({
    q = "",
    viewer = null,
    owner = null,
    sort = null,
    dir = null,
    ids = null,
    kind = null
  } = {}) {
    if (!owner) return { ok: false, reason: "NO_OWNER", detail: "a selection is owned by the credential that made it" };
    this.#sweepSelections();
    const wanted = kind || (Array.isArray(ids) && ids.length ? "enumerated" : "query");
    if (wanted !== "query" && wanted !== "enumerated")
      return { ok: false, reason: "BAD_KIND", detail: "a selection is 'query' or 'enumerated'" };
    const tally = { applied: 0 };
    let members = [];
    if (wanted === "enumerated") {
      const list = [...new Set((ids || []).map(String))];
      if (!list.length) return { ok: false, reason: "EMPTY", detail: "an enumerated selection needs at least one id" };
      if (list.length > _Store.SELECTION_MAX_ITEMS)
        return {
          ok: false,
          reason: "TOO_LARGE",
          limit: _Store.SELECTION_MAX_ITEMS,
          got: list.length,
          detail: "an enumeration this large is refused rather than quietly turned into a query selection, because that would change what the operator's click meant. Select by query instead."
        };
      for (let i = 0; i < list.length; i += _Store.SELECTION_ID_CHUNK) {
        const plan = compile({ q, viewer, sort, dir, ids: list.slice(i, i + _Store.SELECTION_ID_CHUNK) });
        members.push(...this.#runQuery(plan.statements.snapshot(), tally));
      }
    } else {
      const plan = compile({ q, viewer, sort, dir });
      members = this.#runQuery(plan.statements.snapshot(), tally);
    }
    const handle = "sel-" + _Store.#rand(12);
    const now = /* @__PURE__ */ new Date();
    const rec = {
      handle,
      owner,
      kind: wanted,
      q: String(q ?? ""),
      sort_field: sort || null,
      sort_dir: dir || null,
      created: now.toISOString(),
      touched: now.toISOString(),
      expires: new Date(now.getTime() + _Store.SELECTION_TTL_MS).toISOString(),
      n: members.length,
      digest: _Store.#digestOf(members.map((m) => m.bundle_id))
    };
    this.ctx.storage.transactionSync(() => {
      const mine = this.#rows(`SELECT handle FROM selections WHERE owner=? ORDER BY created`, owner);
      for (const old of mine.slice(0, Math.max(0, mine.length + 1 - _Store.SELECTION_MAX_PER_OWNER))) {
        this.sql.exec(`DELETE FROM selection_items WHERE handle=?`, old.handle);
        this.sql.exec(`DELETE FROM selections WHERE handle=?`, old.handle);
      }
      this.sql.exec(
        `INSERT INTO selections (handle,owner,kind,q,sort_field,sort_dir,created,touched,expires,n,digest)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        rec.handle,
        rec.owner,
        rec.kind,
        rec.q,
        rec.sort_field,
        rec.sort_dir,
        rec.created,
        rec.touched,
        rec.expires,
        rec.n,
        rec.digest
      );
      if (rec.kind === "enumerated")
        members.forEach((m, i) => this.sql.exec(
          `INSERT INTO selection_items (handle,ord,bundle_id,bundle_sha) VALUES (?,?,?,?)`,
          rec.handle,
          i,
          m.bundle_id,
          m.bundle_sha
        ));
    });
    await this.#armSweep();
    return {
      ok: true,
      handle: rec.handle,
      kind: rec.kind,
      n: rec.n,
      q: rec.q,
      expires: rec.expires,
      ttlSeconds: _Store.SELECTION_TTL_MS / 1e3,
      gate: { applied: tally.applied }
    };
  }
  /* How a revision is classified. The manifest already records who wrote a
     revision and what operation they claimed, so a monitor tick can be told
     apart from a member rewriting the analysis without inventing a second
     record of the same fact. */
  #revisionKind(bundleId) {
    const m = this.#one(
      `SELECT writer, operation FROM manifest WHERE bundle_id=? ORDER BY created DESC, snap_key DESC LIMIT 1`,
      bundleId
    );
    if (!m) return { class: "unknown" };
    return m.writer === "mechanical" ? { class: "mechanical", operation: m.operation || null } : { class: "authored" };
  }
  /** Resolve a selection to its current membership, with a drift report.
   *
   *  `weight` is the ACTION's weight, and it decides what drift means:
   *    report   the action proceeds and says what moved. Citing Information in
   *             a Project is this: the operator's intent survives a source
   *             having been re-captured.
   *    refuse   the action stops and the operator looks again. Anything that
   *             changes state is this, because a state transition landing on a
   *             set the operator did not see is exactly the accountability
   *             failure the record exists to prevent.
   *  Bob's decision, 2026-07-25. */
  selectionResolve({ handle, viewer = null, owner = null, weight = "report" } = {}) {
    this.#sweepSelections();
    const sel = this.#one(`SELECT * FROM selections WHERE handle=?`, handle);
    if (!sel) return { ok: false, reason: "NO_SUCH_SELECTION", detail: "unknown, released, or expired" };
    if (!owner || sel.owner !== owner)
      return { ok: false, reason: "NOT_YOURS", detail: "a selection is readable only by the credential that made it" };
    const now = /* @__PURE__ */ new Date();
    this.sql.exec(
      `UPDATE selections SET touched=?, expires=? WHERE handle=?`,
      now.toISOString(),
      new Date(now.getTime() + _Store.SELECTION_TTL_MS).toISOString(),
      handle
    );
    const tally = { applied: 0 };
    const drift = { revised: [], purged: [], hidden: [], added: 0, removed: 0, kind: sel.kind };
    let members;
    if (sel.kind === "enumerated") {
      const stored = this.#rows(
        `SELECT ord, bundle_id, bundle_sha FROM selection_items WHERE handle=? ORDER BY ord`,
        handle
      );
      const visible = /* @__PURE__ */ new Map();
      const idList = stored.map((r) => r.bundle_id);
      for (let i = 0; i < idList.length; i += _Store.SELECTION_ID_CHUNK) {
        const plan = compile({ q: "", viewer, sort: sel.sort_field, dir: sel.sort_dir, ids: idList.slice(i, i + _Store.SELECTION_ID_CHUNK) });
        for (const r of this.#runQuery(plan.statements.snapshot(), tally)) visible.set(r.bundle_id, r.bundle_sha);
      }
      members = [];
      for (const s of stored) {
        if (!visible.has(s.bundle_id)) {
          const exists = this.#one(`SELECT bundle_id FROM bundles WHERE bundle_id=?`, s.bundle_id);
          (exists ? drift.hidden : drift.purged).push(s.bundle_id);
          continue;
        }
        const nowSha = visible.get(s.bundle_id);
        if (nowSha !== s.bundle_sha)
          drift.revised.push({ bundleId: s.bundle_id, was: s.bundle_sha, now: nowSha, ...this.#revisionKind(s.bundle_id) });
        members.push({ bundle_id: s.bundle_id, bundle_sha: nowSha });
      }
      drift.removed = drift.purged.length + drift.hidden.length;
    } else {
      const plan = compile({ q: sel.q, viewer, sort: sel.sort_field, dir: sel.sort_dir });
      members = this.#runQuery(plan.statements.snapshot(), tally);
      const digest = _Store.#digestOf(members.map((m) => m.bundle_id));
      if (digest !== sel.digest) {
        drift.added = Math.max(0, members.length - sel.n);
        drift.removed = Math.max(0, sel.n - members.length);
        drift.digestChanged = true;
        drift.detail = "the criterion now answers differently; which rows moved is not recoverable because a query selection stores the criterion rather than the rows";
      }
    }
    const moved = drift.revised.length + drift.removed + drift.added > 0;
    const stopped = moved && weight === "refuse";
    return {
      ok: !stopped,
      handle,
      kind: sel.kind,
      q: sel.q,
      owner: sel.owner,
      n: members.length,
      snapshotN: sel.n,
      weight,
      moved,
      ...stopped ? {
        reason: "SET_MOVED",
        detail: "this action changes state, so it will not run against a set that moved since it was selected. Look at the selection again and re-select."
      } : {},
      drift,
      members: stopped ? [] : members.map((m) => m.bundle_id),
      expires: new Date(now.getTime() + _Store.SELECTION_TTL_MS).toISOString(),
      gate: { applied: tally.applied }
    };
  }
  selectionList({ owner = null } = {}) {
    this.#sweepSelections();
    if (!owner) return { ok: false, reason: "NO_OWNER" };
    return {
      ok: true,
      ttlSeconds: _Store.SELECTION_TTL_MS / 1e3,
      selections: this.#rows(
        `SELECT handle, kind, q, n, created, touched, expires FROM selections WHERE owner=? ORDER BY created DESC`,
        owner
      ),
      caps: { maxItems: _Store.SELECTION_MAX_ITEMS, maxPerOwner: _Store.SELECTION_MAX_PER_OWNER },
      bytes: this.#one(`SELECT COALESCE(SUM(length(bundle_id)+length(bundle_sha)+8), 0) b FROM selection_items`).b
    };
  }
  selectionRelease({ handle = null, owner = null } = {}) {
    if (!owner) return { ok: false, reason: "NO_OWNER" };
    const sel = handle ? this.#one(`SELECT owner FROM selections WHERE handle=?`, handle) : null;
    if (handle && (!sel || sel.owner !== owner)) return { ok: false, reason: "NOT_YOURS" };
    const before = this.#one(`SELECT count(*) c FROM selections WHERE owner=?`, owner).c;
    this.ctx.storage.transactionSync(() => {
      if (handle) {
        this.sql.exec(`DELETE FROM selection_items WHERE handle=?`, handle);
        this.sql.exec(`DELETE FROM selections WHERE handle=?`, handle);
      } else {
        for (const r of this.#rows(`SELECT handle FROM selections WHERE owner=?`, owner))
          this.sql.exec(`DELETE FROM selection_items WHERE handle=?`, r.handle);
        this.sql.exec(`DELETE FROM selections WHERE owner=?`, owner);
      }
    });
    return { ok: true, released: before - this.#one(`SELECT count(*) c FROM selections WHERE owner=?`, owner).c };
  }
  /* Facet counts, two ways, because which is faster is a measurement (D-32).
   *
   *   scan     ONE statement returning the facet columns of every row in scope,
   *            tallied into a hash map per field here. No aggregation and no
   *            sort in SQLite. Cost tracks the number of rows in scope.
   *   groupby  the compound UNION ALL of GROUP BY arms. SQLite aggregates and
   *            sorts; cost tracks rows scanned plus a sort per field, and the
   *            RESULT is bounded by distinct values rather than by rows.
   *
   * `scan` is the default because the bench measures it faster on every shape at
   * 20,000 bundles, most decisively on the sidebar over the whole corpus, which
   * was the worst shape in the release. Both are kept and both are asserted to
   * agree exactly in test/search.test.mjs: an optimisation that disagrees with
   * the thing it replaces is not an optimisation, and this is the same standard
   * op=audit is held to against an outside pass.
   */
  static FACET_MODE_DEFAULT = "scan";
  #facetCounts(plan, tally, mode) {
    const use = mode === "groupby" || mode === "scan" ? mode : _Store.FACET_MODE_DEFAULT;
    const out = Object.fromEntries(plan.facetFields.map((f2) => [f2, []]));
    if (!plan.facetFields.length) return out;
    if (use === "groupby") {
      for (const stmt2 of plan.statements.facets())
        for (const r of this.#runQuery(stmt2, tally))
          (out[r.field] ||= []).push({ value: r.value, n: r.n });
      return out;
    }
    const stmt = plan.statements.facetScan();
    if (!stmt) return out;
    const rows = this.#runQuery(stmt, tally);
    const cols = plan.facetCols;
    const tallies = plan.facetFields.map(() => /* @__PURE__ */ new Map());
    for (const row of rows) {
      for (let i = 0; i < cols.length; i++) {
        const v = row[cols[i]];
        if (v === null || v === void 0) continue;
        const m = tallies[i];
        m.set(v, (m.get(v) || 0) + 1);
      }
    }
    plan.facetFields.forEach((name, i) => {
      out[name] = [...tallies[i].entries()].map(([value, n]) => ({ value, n })).sort((a, b) => b.n - a.n || (a.value < b.value ? -1 : a.value > b.value ? 1 : 0));
    });
    return out;
  }
  /* ---- the first STATE-CHANGING actions to refer to a selection ----
   *
   * SEVERING and REINSTATING a citation, both at weight `refuse`.
   *
   * `cite` shipped in 0.18.0 at weight `report` and left the refusing arm of
   * `selectionResolve` with no caller. These are its first, and they are the
   * right ones for two reasons. They genuinely change recorded state, so drift
   * must stop them: a state transition landing on a set the operator did not see
   * is the accountability failure the record exists to prevent. And they close a
   * hole `cite` opened, because until now an edge could be created and never
   * withdrawn, which makes a citation list an accumulation rather than a record
   * of what the group currently relies on.
   *
   * SEVERING IS NOT DELETION. The edge stays, with its target and rel intact,
   * and only its status changes. That is the same doctrine that greys a
   * dismissed Problem rather than removing it, and it is what makes a severance
   * auditable: a reader can see that the group once relied on this and stopped,
   * and why.
   *
   * A REASON IS REQUIRED by both. The catalog's own remediation for a bad edge
   * is "sever with reason" (C-6.1) and State Rules 5.1 has a human confirming or
   * severing what an agent proposed. A severance with no reason is an
   * unexplained deletion wearing a status field.
   */
  static EDGE_REASON_MAX = 160;
  static EDGE_NOTE_MAX = 480;
  /** Move `cites` edges between statuses for every member of a selection.
   *
   *  One method for both directions because they are the same operation over the
   *  same grammar, and two copies of a frontmatter splice is how the two
   *  reference sources drifted apart in the first place (D-21). */
  #edgeTransition({
    project,
    handle,
    viewer,
    owner,
    reason,
    author,
    from,
    to,
    verb,
    resultKey
  }) {
    const sel = this.selectionResolve({ handle, viewer, owner, weight: "refuse" });
    if (!sel.ok) return sel;
    const p = this.#one(`SELECT bundle_id, object_type, bundle_sha FROM bundles WHERE bundle_id=?`, project);
    if (!p) return { ok: false, reason: "NO_SUCH_PROJECT", project };
    if (p.object_type !== "project")
      return {
        ok: false,
        reason: "NOT_A_PROJECT",
        project,
        got: p.object_type,
        detail: "cites lives on the citing object and this action edits a Project's edges"
      };
    const why = String(reason ?? "").trim();
    if (!why)
      return {
        ok: false,
        reason: "NO_REASON",
        detail: `${verb} an edge records WHY. The catalog's own remediation for a bad reference is "sever with reason", and an edge moved with no reason is an unexplained change wearing a status field.`
      };
    if (why.length > _Store.EDGE_REASON_MAX || /["\\\r\n]/.test(why))
      return {
        ok: false,
        reason: "BAD_REASON",
        detail: `a reason is at most ${_Store.EDGE_REASON_MAX} characters and cannot contain a quote, a backslash, or a newline: the restricted frontmatter grammar has no escapes, so those would reshape the document rather than appear in it`
      };
    if (!sel.members.length)
      return {
        ok: false,
        reason: "EMPTY_SELECTION",
        project,
        handle,
        drift: sel.drift,
        detail: "this selection resolves to no members, so there is nothing to move. It may have named ids that do not exist, or its members may have been purged or hidden since it was made."
      };
    const offenders = [];
    for (const id of sel.members) {
      const b = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, id);
      if (!b || b.object_type !== "information") offenders.push(id);
    }
    if (offenders.length)
      return {
        ok: false,
        reason: "NOT_INFORMATION",
        project,
        handle,
        offenders: offenders.sort(),
        detail: "these members of the selection are not Information, so they carry no citation edge to move. The whole call is refused rather than narrowed."
      };
    const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, project);
    if (!liveMd || typeof liveMd.content !== "string") return { ok: false, reason: "NO_BUNDLE_MD", project };
    const parsed = parseFrontmatter(liveMd.content);
    if (!parsed.data) return { ok: false, reason: "UNPARSEABLE_FRONTMATTER", project };
    const current = /* @__PURE__ */ new Map();
    for (const r of Array.isArray(parsed.data.references) ? parsed.data.references : [])
      if (r && typeof r === "object" && r.rel === "cites" && typeof r.target === "string")
        current.set(r.target, r);
    const wrong = [];
    for (const id of sel.members) {
      const e = current.get(id);
      if (!e || !from.includes(e.status)) wrong.push(id);
    }
    if (wrong.length)
      return {
        ok: false,
        reason: from.includes("severed") ? "NOT_SEVERED" : "NOT_CITED",
        project,
        handle,
        offenders: wrong.sort(),
        drift: sel.drift,
        detail: `${verb} requires an edge currently in ${from.map((s) => `'${s}'`).join(" or ")}. These targets are not, so the whole call is refused: a batch that moved only the eligible members would be a state change the operator did not ask for.`
      };
    const when = (/* @__PURE__ */ new Date()).toISOString().replace(/\.\d+Z$/, "Z");
    const changes = /* @__PURE__ */ new Map();
    for (const id of sel.members) {
      const prev = String(current.get(id).note ?? "");
      let note = (prev ? prev + " | " : "") + `${verb} ${when}: ${why}`;
      if (note.length > _Store.EDGE_NOTE_MAX) note = note.slice(note.length - _Store.EDGE_NOTE_MAX);
      changes.set(id, { status: to, note });
    }
    const spliced = _Store.#spliceEdgeStatus(liveMd.content, changes);
    if (!spliced)
      return {
        ok: false,
        reason: "UNSPLICEABLE_REFERENCES",
        project,
        detail: "the references block is not in a shape this grammar can edit in place"
      };
    let text = _Store.#setScalar(spliced, "last_updated", `"${when}"`);
    const ids = [...sel.members].sort();
    const shown = ids.slice(0, _Store.CITE_LOG_SAMPLE);
    const listed = shown.join(", ") + (ids.length > shown.length ? `, and ${ids.length - shown.length} more` : "");
    const entry = `### Session ${when} | ${verb} ${ids.length} citation${ids.length === 1 ? "" : "s"} | ${author || "member"}
Trigger: selection ${handle}
Changes: cites edges to ${listed} moved to '${to}'. Reason: ${why}.
`;
    const at = text.indexOf("## Session Log");
    if (at < 0) text += "\n## Session Log\n\n" + entry;
    else {
      const nxt = text.indexOf("\n## ", at + 1);
      const cut = nxt === -1 ? text.length : nxt + 1;
      text = text.slice(0, cut) + entry + "\n" + text.slice(cut);
    }
    const carried = [];
    for (const r of this.sql.exec(
      `SELECT path, content, blob_sha, sha256, bytes FROM files WHERE bundle_id=? AND path<>'bundle.md'`,
      project
    ))
      carried.push(r.content !== null ? { path: r.path, text: r.content, bytes: r.bytes, sha256: r.sha256 } : { path: r.path, blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes });
    const bytes = new TextEncoder().encode(text);
    if (bytes.length > INLINE_MAX)
      return {
        ok: false,
        reason: "CITATION_TOO_LARGE",
        project,
        bytes: bytes.length,
        limit: INLINE_MAX,
        detail: "the reasons appended to these edges would push bundle.md past the 1MB inline limit"
      };
    const fm = parsed.data;
    const promoted = this.promote({
      bundleId: project,
      base: p.bundle_sha,
      snapKey: `${when.replace(/[-:]/g, "")}_${_Store.#rand(4)}`,
      author: author || "member",
      files: [
        { path: "bundle.md", text, bytes: bytes.length, sha256: createSha256().update(bytes).hex() },
        ...carried
      ],
      meta: {
        object_type: "project",
        group: fm.group || "believe-in-oakland",
        title: fm.title,
        current_state: fm.current_state,
        prior_state: fm.prior_state ?? null,
        created: fm.created,
        last_updated: when,
        criticality: fm.criticality ?? null,
        classification: fm.classification ?? null
      }
    });
    if (!promoted.ok) return { ...promoted, project, handle, drift: sel.drift };
    return {
      ok: true,
      project,
      handle,
      weight: "refuse",
      moved: sel.moved,
      drift: sel.drift,
      /* `why` and NOT `reason`: every refusal in this file returns a
         REASON CODE under that name, and returning the operator's prose
         under the same key made a success indistinguishable from a
         refusal to any caller checking `reason`. The suite caught it. */
      [resultKey]: ids,
      why,
      from,
      to,
      bundleSha: promoted.bundleSha,
      rowVersion: promoted.rowVersion,
      gate: sel.gate
    };
  }
  sever({ project, handle, viewer = null, owner = null, reason = "", author = null } = {}) {
    return this.#edgeTransition({
      project,
      handle,
      viewer,
      owner,
      reason,
      author,
      from: ["confirmed", "proposed"],
      to: "severed",
      verb: "Severed",
      resultKey: "severed"
    });
  }
  reinstate({ project, handle, viewer = null, owner = null, reason = "", author = null } = {}) {
    return this.#edgeTransition({
      project,
      handle,
      viewer,
      owner,
      reason,
      author,
      from: ["severed"],
      to: "confirmed",
      verb: "Reinstated",
      resultKey: "reinstated"
    });
  }
  /* Rewrite the `status` and `note` of specific `cites` entries in place,
     touching nothing else. Walks the references block entry by entry, tracking
     which target the current entry belongs to, and edits only the two lines of
     the entries named in `changes`. An entry whose note line is absent gains
     one, because the reason has to land somewhere. */
  static #spliceEdgeStatus(text, changes) {
    const lines = text.split("\n");
    if (lines[0] !== "---") return null;
    const end = lines.indexOf("---", 1);
    if (end === -1) return null;
    let ref = -1;
    for (let i = 1; i < end; i++) if (/^references:/.test(lines[i])) {
      ref = i;
      break;
    }
    if (ref === -1) return null;
    const starts = [];
    for (let i = ref + 1; i < end; i++) {
      if (/^ {2}- /.test(lines[i])) starts.push(i);
      else if (!/^\s/.test(lines[i]) && lines[i].trim() !== "") break;
    }
    if (!starts.length) return null;
    const blockEnd = (() => {
      let last = ref;
      for (let i = ref + 1; i < end; i++) {
        if (lines[i].trim() === "") continue;
        if (/^\s/.test(lines[i])) {
          last = i;
          continue;
        }
        break;
      }
      return last;
    })();
    const out = lines.slice();
    let applied = 0;
    for (let s = 0; s < starts.length; s++) {
      const from = starts[s], to = (s + 1 < starts.length ? starts[s + 1] : blockEnd + 1) - 1;
      let target = null;
      for (let i = from; i <= to; i++) {
        const m = /^\s*(?:- )?target:\s*(.+?)\s*$/.exec(lines[i]);
        if (m) {
          target = m[1].replace(/^["']|["']$/g, "");
          break;
        }
      }
      if (!target || !changes.has(target)) continue;
      const ch = changes.get(target);
      let sawNote = false, statusLine = -1;
      for (let i = from; i <= to; i++) {
        if (/^\s*(?:- )?status:/.test(lines[i])) {
          out[i] = "    status: " + ch.status;
          statusLine = i;
        }
        if (/^\s*(?:- )?note:/.test(lines[i])) {
          out[i] = `    note: "${ch.note}"`;
          sawNote = true;
        }
      }
      if (statusLine === -1) return null;
      if (!sawNote) out[statusLine] = out[statusLine] + `
    note: "${ch.note}"`;
      applied++;
    }
    return applied === changes.size ? out.join("\n") : null;
  }
  /* ---- the first action that refers to a selection ----
   *
   * CITING INFORMATION IN A PROJECT, at weight `report`.
   *
   * `selectionResolve` shipped in 0.17.0 with no caller. This is its first, and
   * citing was chosen for it because it ADDS references rather than moving
   * state: drift is survivable, so the reporting arm of the gate gets exercised
   * before anything can be broken by it. The refusing arm gets its first caller
   * from the first state-changing action, deliberately not this one.
   *
   * WEIGHT IS NOT A PARAMETER. It is `report` because of what this action IS,
   * and the op reads no weight from the caller. A caller that could choose the
   * weight would make the whole distinction advisory.
   *
   * Citing writes the edge into bundle.md and promotes, because `refs` is a
   * PROJECTION re-derived from frontmatter inside promote's transaction and
   * promote refuses a refs field in the payload outright (D-21). The document is
   * authoritative; there is no second place to state an edge.
   *
   * Fully synchronous, and that is load-bearing rather than incidental. The
   * catalog's own sha256 is pure JS, so nothing between resolving the selection
   * and committing the promotion awaits, and a Durable Object is single
   * threaded: no other write can interleave. The CAS is still passed and still
   * checked, but it is a backstop here rather than the only guard.
   */
  cite({
    project = null,
    handle = null,
    viewer = null,
    owner = null,
    note = "",
    author = null
  } = {}) {
    const sel = this.selectionResolve({ handle, viewer, owner, weight: "report" });
    if (!sel.ok) return sel;
    const p = this.#one(`SELECT bundle_id, object_type, bundle_sha FROM bundles WHERE bundle_id=?`, project);
    if (!p) return {
      ok: false,
      reason: "NO_SUCH_PROJECT",
      project,
      detail: "the citing object must exist before it can cite anything"
    };
    if (p.object_type !== "project")
      return {
        ok: false,
        reason: "NOT_A_PROJECT",
        project,
        got: p.object_type,
        detail: "cites lives on the citing object and this action cites INTO a Project (State Rules 5.2)"
      };
    const nt = String(note ?? "");
    if (nt.length > 200 || /["\\\r\n]/.test(nt))
      return {
        ok: false,
        reason: "BAD_NOTE",
        detail: "a note is at most 200 characters and cannot contain a quote, a backslash, or a newline"
      };
    const offenders = [];
    for (const id of sel.members) {
      const b = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, id);
      if (!b || b.object_type !== "information") offenders.push(id);
    }
    if (offenders.length)
      return {
        ok: false,
        reason: "NOT_INFORMATION",
        project,
        handle,
        offenders: offenders.sort(),
        drift: sel.drift,
        detail: "citing Information means Information. These members of the selection are not, and the whole call is refused rather than narrowed to the ones that are."
      };
    const liveMd = this.#one(`SELECT content, sha256 FROM files WHERE bundle_id=? AND path='bundle.md'`, project);
    if (!liveMd || typeof liveMd.content !== "string")
      return { ok: false, reason: "NO_BUNDLE_MD", project };
    const parsed = parseFrontmatter(liveMd.content);
    if (!parsed.data)
      return {
        ok: false,
        reason: "UNPARSEABLE_FRONTMATTER",
        project,
        detail: "the project's own bundle.md does not parse under the restricted grammar"
      };
    const existing = Array.isArray(parsed.data.references) ? parsed.data.references : [];
    const byTarget = /* @__PURE__ */ new Map();
    for (const r of existing)
      if (r && typeof r === "object" && r.rel === "cites" && typeof r.target === "string")
        byTarget.set(r.target, r.status);
    const severed = [], already = [], add = [];
    for (const id of sel.members) {
      const st = byTarget.get(id);
      if (st === "severed") severed.push(id);
      else if (st !== void 0) already.push(id);
      else add.push(id);
    }
    if (severed.length)
      return {
        ok: false,
        reason: "SEVERED_EDGE",
        project,
        handle,
        offenders: severed.sort(),
        drift: sel.drift,
        detail: "these targets already carry a SEVERED cites edge, which is a recorded decision to cut the dependency, not the absence of one. Citing neither reverses it silently nor skips past it. Reinstating a severance is a separate action that records its own reason."
      };
    const when = (/* @__PURE__ */ new Date()).toISOString().replace(/\.\d+Z$/, "Z");
    if (!sel.members.length)
      return {
        ok: false,
        reason: "EMPTY_SELECTION",
        project,
        handle,
        drift: sel.drift,
        detail: "this selection resolves to no members, so there is nothing to cite. It may have named ids that do not exist, or its members may have been purged or hidden since it was made."
      };
    if (!add.length)
      return {
        ok: true,
        project,
        handle,
        weight: "report",
        moved: sel.moved,
        drift: sel.drift,
        cited: [],
        alreadyCited: already.sort(),
        severed: [],
        bundleSha: p.bundle_sha,
        rowVersion: null,
        detail: "every member of the selection was already cited; nothing was written"
      };
    const spliced = _Store.#spliceReferences(
      liveMd.content,
      add.map((target) => ({ rel: "cites", target, status: "confirmed", note: nt }))
    );
    if (!spliced)
      return {
        ok: false,
        reason: "UNSPLICEABLE_REFERENCES",
        project,
        detail: "the project's references block is not in a shape this grammar can extend in place. Citing edits only that block and never rewrites the rest of the document."
      };
    let text = _Store.#setScalar(spliced, "last_updated", `"${when}"`);
    const shown = add.slice(0, _Store.CITE_LOG_SAMPLE);
    const listed = shown.join(", ") + (add.length > shown.length ? `, and ${add.length - shown.length} more` : "");
    const entry = `### Session ${when} | Cited ${add.length} Information record${add.length === 1 ? "" : "s"} | ${author || "member"}
Trigger: selection ${handle}${sel.moved ? " (the set had moved since it was made; citing is report-weight and proceeded)" : ""}
Changes: cites edges added to ${listed}.${nt ? ` Note: ${nt}.` : ""}
`;
    const at = text.indexOf("## Session Log");
    if (at < 0) text += "\n## Session Log\n\n" + entry;
    else {
      const nxt = text.indexOf("\n## ", at + 1);
      const cut = nxt === -1 ? text.length : nxt + 1;
      text = text.slice(0, cut) + entry + "\n" + text.slice(cut);
    }
    const carried = [];
    for (const r of this.sql.exec(
      `SELECT path, content, blob_sha, sha256, bytes FROM files WHERE bundle_id=? AND path<>'bundle.md'`,
      project
    ))
      carried.push(r.content !== null ? { path: r.path, text: r.content, bytes: r.bytes, sha256: r.sha256 } : { path: r.path, blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes });
    const bytes = new TextEncoder().encode(text);
    if (bytes.length > INLINE_MAX) {
      const overhead = bytes.length - add.length * _Store.CITE_EDGE_BYTES;
      return {
        ok: false,
        reason: "CITATION_TOO_LARGE",
        project,
        handle,
        drift: sel.drift,
        requested: add.length,
        bytes: bytes.length,
        limit: INLINE_MAX,
        roomFor: Math.max(0, Math.floor((INLINE_MAX - overhead) / _Store.CITE_EDGE_BYTES)),
        detail: "citing this many records at once would push the Project's bundle.md past the 1MB inline limit. Every edge is written into the document, so the ceiling is on edges in one Project, not on the size of a selection. Cite in smaller batches; nothing has been written."
      };
    }
    const textSha = createSha256().update(bytes).hex();
    const fm = parsed.data;
    const promoted = this.promote({
      bundleId: project,
      base: p.bundle_sha,
      snapKey: `${when.replace(/[-:]/g, "")}_${_Store.#rand(4)}`,
      author: author || "member",
      files: [{ path: "bundle.md", text, bytes: bytes.length, sha256: textSha }, ...carried],
      meta: {
        object_type: "project",
        group: fm.group || "believe-in-oakland",
        title: fm.title,
        current_state: fm.current_state,
        prior_state: fm.prior_state ?? null,
        created: fm.created,
        last_updated: when,
        criticality: fm.criticality ?? null,
        classification: fm.classification ?? null
      }
    });
    if (!promoted.ok) return { ...promoted, project, handle, drift: sel.drift };
    return {
      ok: true,
      project,
      handle,
      weight: "report",
      moved: sel.moved,
      drift: sel.drift,
      cited: add.slice().sort(),
      alreadyCited: already.sort(),
      severed: [],
      bundleSha: promoted.bundleSha,
      rowVersion: promoted.rowVersion,
      gate: sel.gate,
      expires: sel.expires
    };
  }
  /* Rewrite ONE column-0 scalar inside the frontmatter, leaving every other
     byte alone. Line-oriented on purpose: the same approach the monitor takes,
     and the reason is that this repo has no frontmatter SERIALIZER, only a
     parser. Re-emitting a parsed document would reorder keys, drop comments and
     renormalise quoting across the whole file to change one field. */
  static #setScalar(text, key, value) {
    const lines = text.split("\n");
    const end = lines.indexOf("---", 1);
    for (let i = 1; i < (end === -1 ? lines.length : end); i++) {
      if (lines[i].startsWith(key + ":")) {
        lines[i] = `${key}: ${value}`;
        return lines.join("\n");
      }
    }
    return text;
  }
  /* Splice new entries into the `references` block, touching nothing else.
   *
   * Three shapes are reachable in the corpus and all three are handled: an
   * inline empty `references: []`, a populated block, and a document with no
   * references key at all. A key whose value is any OTHER inline scalar is
   * refused by returning null rather than guessed at, because the restricted
   * grammar cannot express an inline array of objects and a wrong guess would
   * corrupt the document silently. */
  static #spliceReferences(text, additions) {
    const lines = text.split("\n");
    if (lines[0] !== "---") return null;
    const end = lines.indexOf("---", 1);
    if (end === -1) return null;
    const block = additions.map((a) => `  - rel: ${a.rel}
    target: ${a.target}
    status: ${a.status}
    note: "${a.note ?? ""}"`);
    let ref = -1;
    for (let i = 1; i < end; i++) if (/^references:/.test(lines[i])) {
      ref = i;
      break;
    }
    if (ref === -1)
      return [...lines.slice(0, end), "references:", ...block, ...lines.slice(end)].join("\n");
    const rest = lines[ref].slice("references:".length).trim();
    if (rest === "[]")
      return [...lines.slice(0, ref), "references:", ...block, ...lines.slice(ref + 1)].join("\n");
    if (rest !== "") return null;
    let last = ref;
    for (let i = ref + 1; i < end; i++) {
      if (lines[i].trim() === "") continue;
      if (/^\s/.test(lines[i])) {
        last = i;
        continue;
      }
      break;
    }
    return [...lines.slice(0, last + 1), ...block, ...lines.slice(last + 1)].join("\n");
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
  /** The canonical snapshot path for a file archived under a snapshot key.
   *
   *  The key goes in the FILENAME, not in a directory: `bundle.md` archived
   *  under key K is `_history/bundle_K.md`, and `data/changes.json` is
   *  `_history/data/changes_K.json`. This is not a style choice. The bundle
   *  format is authoritative (see schema.mjs line 3) and the check catalog
   *  parses exactly this shape, so a directory-per-key projection makes every
   *  snapshot in every bundle unaccountable to C-12.2 while losing no bytes.
   *  That is precisely what happened: 168 findings across 30 bundles, all of
   *  them this one mistake, invisible until the catalog could be run. */
  static snapPath(path, snapKey) {
    const cut = path.lastIndexOf("/");
    const dir = cut === -1 ? "" : path.slice(0, cut + 1);
    const name = cut === -1 ? path : path.slice(cut + 1);
    const dot = name.lastIndexOf(".");
    return dot === -1 ? `_history/${dir}${name}_${snapKey}` : `_history/${dir}${name.slice(0, dot)}_${snapKey}${name.slice(dot)}`;
  }
  /* A whole-store conformance pass, run WHERE THE DATA IS.
   *
   * The benchmark that produced this: gating 20,000 bundles from outside costs
   * about 2,060 seconds on the deployed plane and 63 locally, and roughly 97% of
   * the difference is one network round trip per image. The store and the checks
   * are not the constraint; fetching bundles one at a time is. The catalog is a
   * pure function over an injected filesystem and the images are already here, so
   * the pass belongs here too.
   *
   * Paginated rather than exhaustive, because a Durable Object has a CPU budget
   * and 20,000 bundles is about 63 seconds of work. A page of a few hundred is
   * well inside it, and a hundred calls instead of twenty thousand captures
   * essentially all of the benefit. The cursor is the last bundle id seen, so a
   * pass is resumable and does not depend on a snapshot of the store.
   *
   * Blob-backed files are declared elided, exactly as the gate does: existence
   * assertions see them, byte checks skip them, and capture integrity was proven
   * at write time by the capture op rather than re-proven here.
   */
  async auditPass({ after = "", limit = 200 } = {}) {
    const cap = Math.max(1, Math.min(1e3, Number(limit) || 200));
    const known = new Set(this.#rows(`SELECT bundle_id FROM bundles`).map((r) => r.bundle_id));
    const page = this.#rows(
      `SELECT bundle_id FROM bundles WHERE bundle_id > ? ORDER BY bundle_id LIMIT ?`,
      after,
      cap
    );
    const hex2 = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
    const te3 = new TextEncoder();
    const sha2562 = async (v) => hex2(await crypto.subtle.digest("SHA-256", typeof v === "string" ? te3.encode(v) : v));
    const sha512 = async (b) => new Uint8Array(await crypto.subtle.digest("SHA-512", b));
    const tally = {};
    const offenders = [];
    let clean = 0, withErrors = 0;
    for (const row of page) {
      const img = this.readImage(row.bundle_id) || {};
      const files = /* @__PURE__ */ new Map(), elided = /* @__PURE__ */ new Set();
      for (const [path, v] of Object.entries(img)) {
        if (typeof v === "string") files.set(path, v);
        else elided.add(path);
      }
      const { findings } = await checkBundle({
        folderName: row.bundle_id,
        files,
        elidedPaths: elided,
        sha256: sha2562,
        sha512,
        resolveTarget: (id) => known.has(id)
      });
      const errs = findings.filter((f2) => f2.severity === "error");
      if (!errs.length) {
        clean++;
        continue;
      }
      withErrors++;
      for (const e of errs) tally[e.check] = (tally[e.check] || 0) + 1;
      if (offenders.length < 20)
        offenders.push({
          bundleId: row.bundle_id,
          errors: errs.slice(0, 5).map((e) => ({ check: e.check, detail: e.message }))
        });
    }
    const last = page.length ? page[page.length - 1].bundle_id : after;
    return {
      ok: true,
      checked: page.length,
      clean,
      withErrors,
      tally,
      offenders,
      cursor: page.length === cap ? last : null,
      total: known.size
    };
  }
  /** The byte-complete image the gate consumes. One bundle, one call, no
   *  per-file resolution. This is the operation that cost ~43s on Drive.
   *
   *  Projects three things the catalog requires and an earlier version of this
   *  method did not: canonical snapshot paths, a verbatim promotion record per
   *  manifest entry, and the manifest's own entries. The promotion record is
   *  load-bearing beyond its own check: classifyDivergence reconstructs the
   *  bundle.md hash chain from the per-file sha256 lists inside it, and C-20.1
   *  uses it to establish what a mechanical writer actually changed. Without
   *  the records both are unreachable rather than passing. */
  readImage(bundleId) {
    const img = {};
    for (const r of this.sql.exec(`SELECT path, content, blob_sha, sha256, bytes FROM files WHERE bundle_id=?`, bundleId))
      img[r.path] = r.content !== null ? r.content : { blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes };
    const snapFiles = /* @__PURE__ */ new Map();
    for (const r of this.sql.exec(`SELECT snap_key, path, content, blob_sha, sha256 FROM history WHERE bundle_id=?`, bundleId)) {
      img[_Store.snapPath(r.path, r.snap_key)] = r.content !== null ? r.content : { blobSha: r.blob_sha, sha256: r.sha256 };
      if (!snapFiles.has(r.snap_key)) snapFiles.set(r.snap_key, []);
      snapFiles.get(r.snap_key).push({ name: r.path, sha256: r.sha256 });
    }
    const entries = [];
    for (const r of this.sql.exec(`SELECT snap_key, kind, base, author, created, files_json, writer, operation FROM manifest WHERE bundle_id=?`, bundleId)) {
      const written = JSON.parse(r.files_json);
      const writtenPairs = written.map((f2) => typeof f2 === "string" ? { name: f2, sha256: null } : f2);
      const files = writtenPairs.map((f2) => f2.name);
      const snapshotted = (snapFiles.get(r.snap_key) || []).map((f2) => f2.name);
      entries.push({
        key: r.snap_key,
        kind: r.kind,
        base: r.base,
        author: r.author,
        created: r.created,
        files,
        snapshotted,
        ...r.writer ? { writer: r.writer, operation: r.operation } : {}
      });
      img[`_history/promotion_${r.snap_key}.json`] = JSON.stringify({
        target: bundleId,
        base: r.base,
        files: writtenPairs,
        created: r.created,
        author: r.author,
        skill_version: "bio-plane",
        /* C-20.1 reads the writer and operation from HERE, not from the
           manifest, so a mechanical claim that is not in the promotion record is
           a claim the auditor never sees. */
        ...r.writer ? { writer: r.writer, operation: r.operation } : {}
      }, null, 2);
    }
    if (entries.length) {
      entries.sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
      img["_history/manifest.json"] = JSON.stringify({ entries }, null, 2);
    }
    return Object.keys(img).length ? img : null;
  }
  /* Every bundle, or a page of them.
   *
   * Measured: 81ms at 5,000 bundles and 434ms at 20,000, which is honestly linear
   * and about two seconds at 100,000. It returned everything because nothing had
   * ever needed less, and a caller that wants everything can still have it, since
   * breaking that would break the browser, the audit, and the migration verifier
   * at once.
   *
   * So paging is OPT-IN and shaped like the audit's: a cursor that is the last
   * identifier seen, which makes it resumable and independent of any snapshot of
   * the store. A caller that passes no limit gets what it always got. */
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
    if (filter.after) {
      w.push(`bundle_id > ?`);
      a.push(filter.after);
    }
    if (w.length) q += ` WHERE ` + w.join(" AND ");
    q += ` ORDER BY bundle_id`;
    const limit = Number(filter.limit);
    if (!Number.isFinite(limit) || limit <= 0) return this.#rows(q, ...a);
    const cap = Math.min(5e3, Math.floor(limit));
    const rows = this.#rows(q + ` LIMIT ?`, ...a, cap);
    return {
      bundles: rows,
      cursor: rows.length === cap ? rows[rows.length - 1].bundle_id : null,
      total: this.#one(`SELECT COUNT(*) AS n FROM bundles`).n
    };
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
    const { bundleId, base, files, meta, snapKey, author, register = [] } = pkg;
    const writer = pkg.writer === "mechanical" ? "mechanical" : null;
    const operation = writer ? pkg.operation : null;
    if (writer && !(operation in MECHANICAL_FIELD_SETS))
      return {
        ok: false,
        reason: "UNDECLARED_OPERATION",
        detail: `a mechanical promotion names one of: ${Object.keys(MECHANICAL_FIELD_SETS).join(", ")}`,
        got: operation ?? null
      };
    if (Array.isArray(pkg.refs) && pkg.refs.length)
      return {
        ok: false,
        reason: "REFS_IN_PAYLOAD",
        detail: "references are read from bundle.md frontmatter, not from the promote payload; remove the refs field"
      };
    if (!bundleId || !Array.isArray(files) || !meta) return { ok: false, reason: "MALFORMED", detail: "bundleId, files and meta are required" };
    return this.ctx.storage.transactionSync(() => {
      const cur = this.#one(`SELECT bundle_sha, row_version FROM bundles WHERE bundle_id=?`, bundleId);
      if (cur && base === null)
        return { ok: false, reason: "EXISTS", detail: "creation attempted against an existing bundle" };
      if (!cur && base !== null)
        return { ok: false, reason: "ABSENT", detail: "update attempted against a bundle that does not exist" };
      if (cur && cur.bundle_sha !== base)
        return { ok: false, reason: "CAS_STALE", expected: cur.bundle_sha, got: base };
      for (const f2 of files) {
        if (f2.text !== void 0 && f2.text.length > INLINE_MAX)
          return { ok: false, reason: "OVERSIZE_INLINE", path: f2.path, bytes: f2.text.length };
      }
      const gj = pkg.replay ? null : files.find((f2) => f2.path === "data/gathering.json");
      if (gj && typeof gj.text === "string") {
        const gf2 = [];
        checkGatheringGrammar({ files: /* @__PURE__ */ new Map([["data/gathering.json", gj.text]]) }, gf2);
        const errs = gf2.filter((x) => x.severity === "error");
        if (errs.length)
          return {
            ok: false,
            reason: "GATHERING_REFUSED",
            findings: errs.map((x) => ({ check: x.check, detail: x.message }))
          };
      }
      if (!cur) {
        this.sql.exec(
          `INSERT OR REPLACE INTO manifest (bundle_id,snap_key,kind,base,author,created,files_json,writer,operation) VALUES (?,?,?,?,?,?,?,?,?)`,
          bundleId,
          snapKey,
          pkg.replay ? "promotion-replay" : "promotion",
          EMPTY_STRING_SHA2,
          author,
          meta.last_updated || (/* @__PURE__ */ new Date()).toISOString(),
          JSON.stringify(files.map((f2) => ({ name: f2.path, sha256: f2.sha256 }))),
          writer,
          operation
        );
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
          `INSERT OR REPLACE INTO manifest (bundle_id,snap_key,kind,base,author,created,files_json,writer,operation) VALUES (?,?,?,?,?,?,?,?,?)`,
          /* The catalog switches on kind === 'promotion' (C-12.2, C-20.1), so
             that is the vocabulary. A creation is still distinguishable, by a
             base equal to the empty-string SHA, which is how the accelerator
             recorded it and how C-20.1 recognises one. */
          bundleId,
          snapKey,
          pkg.replay ? "promotion-replay" : "promotion",
          base,
          author,
          /* The revision's own time, never the server's wall clock. C-12.1
             compares live last_updated against earlier entries' created, and a
             signed ratification legitimately backdates last_updated to the
             transition instant. Stamping server time here made that comparison
             fail on honest content. */
          meta.last_updated || (/* @__PURE__ */ new Date()).toISOString(),
          JSON.stringify(files.map((f2) => ({ name: f2.path, sha256: f2.sha256 }))),
          writer,
          operation
        );
      }
      if (cur && !pkg.replay) {
        const had = new Set(this.#rows(`SELECT path FROM files WHERE bundle_id=?`, bundleId).map((r) => r.path));
        const now2 = new Set(files.map((f2) => f2.path));
        const declared = new Set(Array.isArray(pkg.drop) ? pkg.drop : []);
        const dropped = [...had].filter((p) => !now2.has(p) && !declared.has(p));
        if (dropped.length)
          return {
            ok: false,
            reason: "FILES_DROPPED",
            paths: dropped.sort(),
            detail: "this promotion would remove files the previous revision had. Carry them forward, or name them in drop[] to delete them on purpose."
          };
      }
      this.sql.exec(`DELETE FROM files WHERE bundle_id=?`, bundleId);
      for (const f2 of files)
        this.sql.exec(
          `INSERT INTO files (bundle_id,path,content,blob_sha,bytes,sha256) VALUES (?,?,?,?,?,?)`,
          bundleId,
          f2.path,
          f2.text ?? null,
          f2.blobSha ?? null,
          f2.bytes,
          f2.sha256
        );
      const newSha = files.find((f2) => f2.path === "bundle.md")?.sha256;
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
      const md = files.find((f2) => f2.path === "bundle.md");
      const fmRefs = md && typeof md.text === "string" ? parseFrontmatter(md.text).data?.references ?? [] : [];
      for (const t of Array.isArray(fmRefs) ? fmRefs : []) {
        if (!t || typeof t !== "object" || typeof t.target !== "string") continue;
        this.sql.exec(
          `INSERT OR REPLACE INTO refs (bundle_id,target_id,kind) VALUES (?,?,?)`,
          bundleId,
          t.target,
          typeof t.rel === "string" ? t.rel : ""
        );
      }
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
      const bundleMd = files.find((f2) => f2.path === "bundle.md");
      this.#writeProjection(bundleId, bundleMd?.text ?? null);
      this.#writeText(bundleId, files);
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
      indexed: n("bundles_fts"),
      selections: n("selections"),
      selectionItems: n("selection_items"),
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
        const r = this.#one(`SELECT fts_id FROM bundles WHERE bundle_id=?`, bundleId);
        if (r && r.fts_id != null) this.sql.exec(`DELETE FROM bundles_fts WHERE rowid=?`, r.fts_id);
        for (const t of TABLES) this.sql.exec(`DELETE FROM ${t} WHERE bundle_id=?`, bundleId);
        this.sql.exec(`DELETE FROM bundles WHERE bundle_id=?`, bundleId);
      } else {
        this.sql.exec(`DELETE FROM bundles_fts`);
        for (const t of TABLES) this.sql.exec(`DELETE FROM ${t}`);
        this.sql.exec(`DELETE FROM bundles`);
        this.sql.exec(`DELETE FROM selection_items`);
        this.sql.exec(`DELETE FROM selections`);
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
  /* Why is a register row unreferenced? (D-9)
   *
   * The register maps a capture's sha to the bundle and path it was intake for.
   * Nothing could read it until 0.22.0, so the 30 unreferenced rows on the live
   * record were explained only by a guess.
   *
   * THE FIRST VERSION OF THIS LOOKED IN TWO OF THE THREE PLACES BYTES CAN LIVE.
   * It checked `files` and `history` and called everything else "dropped", which
   * produced a confident and wrong finding: that the Apps Script migration could
   * not be audited from the record it produced. The bytes were in R2 the whole
   * time. `migrate.mjs` says so in its own header, carrying Drive provenance
   * "verbatim as a registered drive-provenance capture, so the Drive era remains
   * inspectable without polluting the live file image", which is precisely what
   * the two-bucket design is for.
   *
   * So this returns rows and their capture hashes, and the CONTROL PLANE probes
   * `bio-captures` to finish the classification, exactly as the ratify path does
   * with `hasCapture`. The Durable Object does not know its own store name and
   * R2 keys are `<store>/captures/<sha>`, so the probe cannot honestly be done
   * from in here.
   *
   *   live        the capture's bytes are the current file at that path
   *   superseded  the path is still there carrying different bytes now
   *   historical  not live anywhere, but present in history
   *   unresolved  in neither, so the control plane must ask R2 before this row
   *               can be called sound or broken
   */
  registerAudit() {
    const rows = this.#rows(`SELECT capture_sha, bundle_id, path, encoding, bytes, registered FROM register`);
    const out = { total: rows.length, live: 0, superseded: 0, historical: 0, orphan: 0, unresolved: [] };
    for (const r of rows) {
      if (!this.#one(`SELECT bundle_id FROM bundles WHERE bundle_id=?`, r.bundle_id)) {
        out.orphan++;
        out.unresolved.push({ ...r, class: "orphan" });
        continue;
      }
      const here = this.#one(`SELECT sha256 FROM files WHERE bundle_id=? AND path=?`, r.bundle_id, r.path);
      if (here && here.sha256 === r.capture_sha) {
        out.live++;
        continue;
      }
      if (this.#one(`SELECT sha256 FROM history WHERE bundle_id=? AND sha256=? LIMIT 1`, r.bundle_id, r.capture_sha)) {
        out.historical++;
        continue;
      }
      if (here) {
        out.superseded++;
        continue;
      }
      out.unresolved.push({ ...r, class: "unresolved" });
    }
    return { ok: true, ...out, needsCaptureProbe: out.unresolved.length };
  }
  /* ---- project participation, Architecture section 7 ----
   *
   * The evidence corpus stays shared: Information and Problems remain visible to
   * the group generally, because compartmenting evidence would fracture the
   * thing the record exists to be. What participation scopes is the group's
   * THINKING, which is the material with strategic value before publication.
   */
  #memberByHandle(handle) {
    return this.#one(`SELECT member_id, handle, status FROM members WHERE handle=?`, handle);
  }
  #participation(projectId, memberId) {
    return this.#one(
      `SELECT state, owner FROM project_participants WHERE project_id=? AND member_id=?`,
      projectId,
      memberId
    );
  }
  #isAdminMember(memberId) {
    if (memberId === _Store.ROOT_ADMIN) return true;
    const m = this.#one(`SELECT role, status FROM members WHERE member_id=?`, memberId);
    return !!m && m.role === "admin" && m.status === "active";
  }
  /** 7.1: the creator is the owner. Called when a project bundle is promoted by
   *  an identified member; a project created by a machine credential has no
   *  owner row, which is honest rather than inventing one. */
  projectClaimOwner({ projectId, memberId } = {}) {
    const b = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, projectId);
    if (!b) return { ok: false, reason: "NO_SUCH_PROJECT" };
    if (b.object_type !== "project") return { ok: false, reason: "NOT_A_PROJECT" };
    if (this.#one(`SELECT member_id FROM project_participants WHERE project_id=? AND owner=1`, projectId))
      return { ok: false, reason: "OWNED" };
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.sql.exec(
      `INSERT OR REPLACE INTO project_participants (project_id,member_id,state,owner,invited_by,created,updated)
       VALUES (?,?,'joined',1,NULL,?,?)`,
      projectId,
      memberId,
      now,
      now
    );
    return { ok: true, projectId, owner: memberId };
  }
  /** 7.2: the owner invites by handle. Administrators may also invite, because
   *  7.7 already gives them authority over participation. */
  projectInvite({ projectId, handle, by } = {}) {
    const b = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, projectId);
    if (!b) return { ok: false, reason: "NO_SUCH_PROJECT" };
    if (b.object_type !== "project") return { ok: false, reason: "NOT_A_PROJECT" };
    const mine = this.#participation(projectId, by);
    if (!(mine && mine.owner) && !this.#isAdminMember(by))
      return {
        ok: false,
        reason: "NOT_THE_OWNER",
        detail: "the project's owner invites participants, and an administrator may. Nobody else."
      };
    const target = this.#memberByHandle(handle);
    if (!target) return { ok: false, reason: "NO_SUCH_HANDLE", handle };
    if (target.status !== "active") return { ok: false, reason: "NOT_ACTIVE", handle };
    if (this.#participation(projectId, target.member_id))
      return { ok: false, reason: "ALREADY_A_PARTICIPANT", handle };
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.sql.exec(
      `INSERT INTO project_participants (project_id,member_id,state,owner,invited_by,created,updated)
       VALUES (?,?,'invited',0,?,?,?)`,
      projectId,
      target.member_id,
      by,
      now,
      now
    );
    return { ok: true, projectId, handle, state: "invited" };
  }
  /** 7.4: joining is selecting the checkbox. There is no acceptance ceremony. */
  projectJoin({ projectId, by } = {}) {
    const p = this.#participation(projectId, by);
    if (!p) return {
      ok: false,
      reason: "NOT_INVITED",
      detail: "a member joins a project they were invited to. Being uninvited is not a refusal you can see."
    };
    this.sql.exec(
      `UPDATE project_participants SET state='joined', comment=NULL, updated=? WHERE project_id=? AND member_id=?`,
      (/* @__PURE__ */ new Date()).toISOString(),
      projectId,
      by
    );
    return { ok: true, projectId, state: "joined" };
  }
  /** 7.6: unchecking the box is a REQUEST to leave. It greys the checkmark and
   *  removes nobody, because 7.7 gives removal to administrators alone. */
  projectLeave({ projectId, by, comment = null } = {}) {
    const p = this.#participation(projectId, by);
    if (!p) return { ok: false, reason: "NOT_A_PARTICIPANT" };
    if (p.state !== "joined") return { ok: false, reason: "NOT_JOINED", state: p.state };
    const c = comment === null ? null : String(comment).slice(0, 280);
    this.sql.exec(
      `UPDATE project_participants SET state='leaving', comment=?, updated=? WHERE project_id=? AND member_id=?`,
      c,
      (/* @__PURE__ */ new Date()).toISOString(),
      projectId,
      by
    );
    return {
      ok: true,
      projectId,
      state: "leaving",
      comment: c,
      detail: "recorded as a request to leave. An administrator removes participants; this does not."
    };
  }
  /** 7.7: only an administrator removes a participant, request outstanding or
   *  not. Project owners invite; they do not remove. That keeps authority over
   *  people with the custodial role rather than distributing it into content
   *  work. */
  projectRemove({ projectId, handle, by, comment = null } = {}) {
    if (!this.#isAdminMember(by))
      return {
        ok: false,
        reason: "ADMIN_ONLY",
        detail: "only an administrator removes a participant from a project. Owners invite; they do not remove, so authority over people stays with the custodial role."
      };
    const target = this.#memberByHandle(handle);
    if (!target) return { ok: false, reason: "NO_SUCH_HANDLE", handle };
    const p = this.#participation(projectId, target.member_id);
    if (!p) return { ok: false, reason: "NOT_A_PARTICIPANT", handle };
    if (p.owner) return {
      ok: false,
      reason: "OWNER",
      detail: "the project's owner cannot be removed from it by this action"
    };
    this.sql.exec(`DELETE FROM project_participants WHERE project_id=? AND member_id=?`, projectId, target.member_id);
    return { ok: true, projectId, handle, removed: true, comment: comment === null ? null : String(comment).slice(0, 280) };
  }
  /** 7.8: every participant sees the handles of all other participants, and an
   *  administrator sees all of them. A non-participant sees nothing, and is told
   *  the same thing whether the project exists or not, because 7.9 says an
   *  uninvited member cannot see that a project EXISTS. */
  projectParticipants({ projectId, by } = {}) {
    const mine = this.#participation(projectId, by);
    if (!mine && !this.#isAdminMember(by))
      return {
        ok: false,
        reason: "NO_SUCH_PROJECT",
        detail: "no project by that identifier is visible to you. An uninvited member cannot see that a project exists, so this is the same answer as for one that does not."
      };
    return { ok: true, projectId, participants: this.#rows(
      `SELECT m.handle, p.state, p.owner, p.comment, p.created
       FROM project_participants p JOIN members m ON m.member_id = p.member_id
       WHERE p.project_id=? ORDER BY p.owner DESC, m.handle`,
      projectId
    ) };
  }
  /* ---- the membership model's member half, Architecture sections 3 to 6 ----
   *
   * The arithmetic of section 4.7 lives in ONE place, `adminArithmetic`, and
   * every rule below reads it rather than restating it. The table in the
   * architecture document is the specification and `test/membership.test.mjs`
   * asserts it row by row, because this is the part of the design that is cheap
   * to get subtly wrong and expensive to discover wrong.
   */
  static CAPABILITIES = ["contribute", "publish", "create_projects"];
  /** Removal takes a MAJORITY OF ALL ADMINISTRATORS, counting the target in the
   *  denominator but not letting them vote, and ties do not eject.
   *
   *  That one sentence is what makes removal impossible at two without needing a
   *  special case, demands unanimity while the group is small enough for
   *  unanimity to be reasonable, and loosens as the group grows. A lone captured
   *  administrator can never eject anyone at any size. It fails only to a
   *  colluding majority, and nothing survives a colluding majority. */
  static adminMath(n) {
    const votesNeeded = Math.floor(n / 2) + 1;
    const eligibleVoters = Math.max(0, n - 1);
    return { administrators: n, votesNeeded, eligibleVoters, possible: votesNeeded <= eligibleVoters };
  }
  /** The table, computed rather than transcribed, so the code and the document
   *  cannot drift. Exposed as an op because a UI must be able to tell a group
   *  what it would take BEFORE they start a removal. */
  adminArithmetic() {
    const table = [];
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) table.push(_Store.adminMath(n));
    return { ok: true, table, live: _Store.adminMath(this.#activeAdmins().length) };
  }
  /* Who counts as an administrator.
   *
   * The FOUNDING administrator has no members row. They claimed the instance by
   * spending ADMIN_TOKEN, which is what 4.1 describes: the solo participant is
   * the administrator, and the whole membership apparatus stays invisible until
   * a second person exists. Counting only member rows made a claimed instance
   * with one invited administrator look like a group of one, so the second
   * invitation was issued unilaterally when it should have needed consensus.
   * Found by the existing members suite failing, not by the new one.
   *
   * The founder is named `admin`, the credentials role they hold, and they
   * cannot be removed by vote: per 4.6 the holders of ADMIN_TOKEN are the root
   * of trust and every rule in the membership model sits beneath them.
   * Membership does not and cannot constrain them, and an interface that
   * implied otherwise would be lying. */
  static ROOT_ADMIN = "admin";
  #activeAdmins() {
    const rows = this.#rows(`SELECT member_id FROM members WHERE role='admin' AND status='active'`).map((r) => r.member_id);
    const claimed = !!this.#one(`SELECT role FROM credentials WHERE role=?`, _Store.ROOT_ADMIN);
    return claimed ? [_Store.ROOT_ADMIN, ...rows] : rows;
  }
  #capsOf(row) {
    try {
      const v = JSON.parse(row.capabilities || "[]");
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }
  /** Set a member's capabilities. NOT a route to administrator status: that is
   *  granted and removed only by the section 4 process, and 4.4 says no
   *  administrator may strip another, so this refuses to touch either side of
   *  that line. */
  memberCaps({ memberId, capabilities } = {}) {
    const m = this.#one(`SELECT member_id, role FROM members WHERE member_id=?`, memberId);
    if (!m) return { ok: false, reason: "NO_SUCH_MEMBER" };
    const want = Array.isArray(capabilities) ? capabilities : null;
    if (!want) return { ok: false, reason: "BAD_CAPABILITY", detail: "capabilities is an array" };
    if (want.includes("administer") || m.role === "admin")
      return {
        ok: false,
        reason: "NOT_A_CAPABILITY_GRANT",
        detail: "administrator status is granted and removed only by the section 4 process, never by editing a field. 4.4: no administrator may strip another."
      };
    const bad = want.filter((c) => !_Store.CAPABILITIES.includes(c));
    if (bad.length) return { ok: false, reason: "BAD_CAPABILITY", got: bad, known: _Store.CAPABILITIES };
    this.sql.exec(
      `UPDATE members SET capabilities=?, updated=? WHERE member_id=?`,
      JSON.stringify(want),
      (/* @__PURE__ */ new Date()).toISOString(),
      memberId
    );
    return { ok: true, memberId, capabilities: want };
  }
  /** Endorse a proposed administrator. Addition above the second requires the
   *  CONSENSUS of every existing administrator, and that is the load-bearing
   *  half of 4.7: without it a captured administrator recruits confederates and
   *  manufactures the majority that ejects the honest ones. */
  async adminEndorse({ memberId, by } = {}) {
    const m = this.#one(`SELECT member_id, status, role FROM members WHERE member_id=?`, memberId);
    if (!m) return { ok: false, reason: "NO_SUCH_MEMBER" };
    if (m.status !== "proposed") return { ok: false, reason: "NOT_PROPOSED", status: m.status };
    const admins = this.#activeAdmins();
    if (!by || !admins.includes(by)) return { ok: false, reason: "NOT_AN_ADMIN", by };
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.sql.exec(
      `INSERT OR REPLACE INTO admin_votes (kind,target,voter,reason,created) VALUES ('add',?,?,?,?)`,
      memberId,
      by,
      null,
      now
    );
    const have = this.#rows(`SELECT voter FROM admin_votes WHERE kind='add' AND target=?`, memberId).map((r) => r.voter).filter((v) => admins.includes(v));
    const awaiting = admins.filter((a) => !have.includes(a));
    if (awaiting.length)
      return {
        ok: false,
        reason: "CONSENSUS_REQUIRED",
        memberId,
        have: have.sort(),
        awaiting: awaiting.sort(),
        detail: "every existing administrator must endorse an addition beyond the second"
      };
    const invite = _Store.#rand(16);
    const hash = await _Store.#sha256(invite);
    this.sql.exec(
      `UPDATE members SET status='invited', invite_hash=?, updated=? WHERE member_id=?`,
      hash,
      now,
      memberId
    );
    return { ok: true, memberId, invite, endorsedBy: have.sort() };
  }
  /** Vote to remove an administrator. Section 4.7. */
  adminRemove({ memberId, by, reason } = {}) {
    if (memberId === _Store.ROOT_ADMIN)
      return {
        ok: false,
        reason: "ROOT_OF_TRUST",
        detail: "the founding administrator holds ADMIN_TOKEN and cannot be removed from inside the application. Whoever can set ADMIN_TOKEN can take the group over, and there is no arrangement in which nobody holds that power, because the instance runs in somebody's hosting account. The remedy is at the hosting account, not here (section 4.6)."
      };
    const m = this.#one(`SELECT member_id, role, status FROM members WHERE member_id=?`, memberId);
    if (!m) return { ok: false, reason: "NO_SUCH_MEMBER" };
    if (m.role !== "admin") return { ok: false, reason: "NOT_AN_ADMIN", detail: "this member is not an administrator" };
    const admins = this.#activeAdmins();
    if (memberId === by) return {
      ok: false,
      reason: "TARGET_CANNOT_VOTE",
      detail: "the target is counted in the denominator but does not vote"
    };
    if (!by || !admins.includes(by)) return { ok: false, reason: "NOT_AN_ADMIN", by };
    const why = String(reason ?? "").trim();
    if (!why) return { ok: false, reason: "NO_REASON", detail: "removals are recorded with a reason" };
    const math = _Store.adminMath(admins.length);
    if (!math.possible)
      return {
        ok: false,
        reason: "IMPOSSIBLE_AT_TWO",
        ...math,
        detail: `removal takes ${math.votesNeeded} of ${math.administrators} administrators and only ${math.eligibleVoters} may vote, so it cannot be carried. That is the rule working, not a defect: a lone administrator must never be able to eject the other.`
      };
    if (this.#one(`SELECT voter FROM admin_votes WHERE kind='remove' AND target=? AND voter=?`, memberId, by))
      return { ok: false, reason: "ALREADY_VOTED", by };
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.sql.exec(
      `INSERT INTO admin_votes (kind,target,voter,reason,created) VALUES ('remove',?,?,?,?)`,
      memberId,
      by,
      why,
      now
    );
    const votes = this.#rows(`SELECT voter, reason FROM admin_votes WHERE kind='remove' AND target=?`, memberId).filter((v) => admins.includes(v.voter) && v.voter !== memberId);
    if (votes.length < math.votesNeeded)
      return {
        ok: false,
        reason: "VOTES_SHORT",
        memberId,
        have: votes.length,
        need: math.votesNeeded,
        ...math,
        deciders: votes.map((v) => v.voter).sort()
      };
    this.sql.exec(`UPDATE members SET status='revoked', updated=? WHERE member_id=?`, now, memberId);
    this.sql.exec(`DELETE FROM sessions WHERE role=?`, `member:${memberId}`);
    this.sql.exec(`UPDATE signers SET status='revoked' WHERE member_id=?`, memberId);
    return {
      ok: true,
      memberId,
      removed: true,
      ...math,
      deciders: votes.map((v) => v.voter).sort(),
      reasons: votes.map((v) => v.reason).filter(Boolean),
      alsoDo: "removing an administrator in the application is half of an ejection. The other half is rotating ADMIN_TOKEN and reviewing hosting-account membership (4.8)."
    };
  }
  async memberAdd({
    memberId,
    cover,
    name,
    role = "member",
    capabilities = null,
    expertise = null,
    by = null
  } = {}) {
    const label = typeof cover === "string" && cover.trim() ? cover : name;
    if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(memberId || ""))
      return { ok: false, reason: "BAD_MEMBER_ID", detail: "lowercase letters, digits and dashes, 2 to 41 characters" };
    if (!label || typeof label !== "string")
      return {
        ok: false,
        reason: "NO_COVER",
        detail: "a cover is the label you use to tell participants apart; it need not be, and often should not be, a legal name"
      };
    if (this.#one(`SELECT member_id FROM members WHERE member_id=?`, memberId))
      return { ok: false, reason: "EXISTS", memberId };
    const wantAdmin = role === "admin";
    const admins = this.#activeAdmins();
    if (!wantAdmin && admins.length < 2)
      return {
        ok: false,
        reason: "ADMINS_FIRST",
        administrators: admins.length,
        detail: "the second member of a group must be an administrator, and there are no ordinary members until two exist. Administrative access is shared among at least two people so that losing one person does not lose the group."
      };
    const caps = Array.isArray(capabilities) ? capabilities.filter((c) => _Store.CAPABILITIES.includes(c)) : ["contribute"];
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (wantAdmin && admins.length >= 2) {
      this.sql.exec(
        `INSERT INTO members (member_id,cover,handle,role,status,invite_hash,capabilities,expertise,created,updated)
         VALUES (?,?,NULL,'admin','proposed',NULL,?,?,?,?)`,
        memberId,
        label,
        JSON.stringify(caps),
        expertise ?? null,
        now,
        now
      );
      if (by && admins.includes(by))
        this.sql.exec(
          `INSERT OR REPLACE INTO admin_votes (kind,target,voter,reason,created) VALUES ('add',?,?,NULL,?)`,
          memberId,
          by,
          now
        );
      const have = this.#rows(`SELECT voter FROM admin_votes WHERE kind='add' AND target=?`, memberId).map((r) => r.voter).filter((v) => admins.includes(v));
      return {
        ok: false,
        reason: "CONSENSUS_REQUIRED",
        memberId,
        proposed: true,
        have: have.sort(),
        awaiting: admins.filter((a) => !have.includes(a)).sort(),
        detail: "adding an administrator beyond the second requires the consensus of every existing administrator. No invitation is issued until they have all endorsed it."
      };
    }
    const invite = _Store.#rand(16);
    const hash = await _Store.#sha256(invite);
    this.sql.exec(
      `INSERT INTO members (member_id,cover,handle,role,status,invite_hash,capabilities,expertise,created,updated)
       VALUES (?,?,NULL,?,?,?,?,?,?,?)`,
      memberId,
      label,
      wantAdmin ? "admin" : "member",
      "invited",
      hash,
      JSON.stringify(caps),
      expertise ?? null,
      now,
      now
    );
    return { ok: true, memberId, invite, role: wantAdmin ? "admin" : "member", capabilities: caps };
  }
  /* An invitation is a BURNER: the token in the URL is the whole credential, and
   * after use the URL resolves to nothing and carries no record of what it
   * formerly addressed (Membership Architecture section 6).
   *
   * The previous scheme put `<memberId>:<code>` in the link, so anyone who saw a
   * leaked or archived one learned who had been invited. The token is now opaque
   * and the member id is never in it, never returned by this lookup, and never
   * needed to enrol.
   *
   * A SPENT token and a token that never existed return byte-identical answers.
   * That is the security property and not tidiness: a response distinguishing
   * them would confirm to whoever found the archived link that it had once
   * addressed somebody real, which is exactly what the burner is for. */
  static #INVITE_MISS = {
    ok: false,
    reason: "NO_SUCH_INVITATION",
    detail: "this invitation is not live. An invitation is spent the moment it is used, and a spent one cannot be told apart from one that never existed."
  };
  async #invited(invite) {
    if (typeof invite !== "string" || !/^[0-9a-f]{16,64}$/.test(invite)) return null;
    const hash = await _Store.#sha256(invite);
    return this.#one(
      `SELECT member_id, cover, role, status, capabilities, expertise
       FROM members WHERE invite_hash=? AND status='invited'`,
      hash
    );
  }
  /** What a burner URL resolves to. Unauthenticated by necessity: the invitee
   *  holds no credential yet, which is what the invitation is for. */
  async inviteLook({ invite } = {}) {
    const m = await this.#invited(invite);
    if (!m) return { ..._Store.#INVITE_MISS };
    return {
      ok: true,
      cover: m.cover,
      role: m.role,
      capabilities: this.#capsOf(m),
      expertise: m.expertise ?? null
    };
  }
  async enroll({ invite, handle, password } = {}) {
    const m = await this.#invited(invite);
    if (!m) return { ..._Store.#INVITE_MISS };
    const h = String(handle ?? "").trim();
    if (!h) return {
      ok: false,
      reason: "NO_HANDLE",
      detail: "choose a handle. It is what the record shows: the author of a promotion, the attestor of a ratification, the participant list of a project. It is yours, not the label the administrator used to invite you."
    };
    if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(h))
      return { ok: false, reason: "BAD_HANDLE", detail: "lowercase letters, digits and dashes, 2 to 41 characters" };
    if (this.#one(`SELECT member_id FROM members WHERE handle=? AND member_id<>?`, h, m.member_id))
      return { ok: false, reason: "HANDLE_TAKEN", handle: h };
    if (typeof password !== "string" || password.length < 12)
      return { ok: false, reason: "PASSWORD_TOO_SHORT", minimum: 12 };
    await this.setPassword({ role: `member:${m.member_id}`, password });
    this.sql.exec(
      `UPDATE members SET status='active', handle=?, invite_hash=NULL, updated=? WHERE member_id=?`,
      h,
      (/* @__PURE__ */ new Date()).toISOString(),
      m.member_id
    );
    return { ok: true, memberId: m.member_id, handle: h };
  }
  memberList() {
    return { members: this.#rows(
      `SELECT member_id, cover, handle, role, status, capabilities, expertise, created, updated,
              CASE WHEN invite_hash IS NULL THEN 0 ELSE 1 END AS invite_pending
       FROM members ORDER BY member_id`
    ).map((r) => ({ ...r, capabilities: this.#capsOf(r) })) };
  }
  memberSet({ memberId, status } = {}) {
    if (!["active", "revoked"].includes(status)) return { ok: false, reason: "BAD_STATUS" };
    const m = this.#one(`SELECT status, role FROM members WHERE member_id=?`, memberId);
    if (!m) return { ok: false, reason: "NO_SUCH_MEMBER" };
    if (m.role === "admin" && status === "revoked")
      return {
        ok: false,
        reason: "ADMIN_REQUIRES_VOTE",
        detail: "an administrator is removed by a majority of all administrators, counting the target in the denominator but not letting them vote (section 4.7). No administrator may strip another unilaterally."
      };
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
  /* Facts ratify needs that are not in the image: the row for its CAS check and
     the active signer set. The manifest, history, and dangling-ref lists are
     still returned because the migrate tool and the older gate consumed them;
     plane-gate/1.0 reads all of that out of the image instead, since the catalog
     wants the bundle as a filesystem rather than as query results. */
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
    let body = null;
    if (req.method === "POST") {
      const raw = await req.text();
      if (raw.trim() !== "") {
        try {
          body = JSON.parse(raw);
        } catch {
          return Response.json({
            ok: false,
            reason: "BAD_JSON",
            detail: "the request body is not valid JSON"
          }, { status: 400 });
        }
      }
    }
    const t = Date.now();
    try {
      const map = {
        promote: () => this.promote(body),
        allocid: () => this.allocId(url.searchParams.get("prefix"), url.searchParams.get("year")),
        lease: () => this.acquireLease(url.searchParams.get("id"), url.searchParams.get("actor"), 3e5),
        image: () => this.readImage(url.searchParams.get("id")),
        file: () => this.readFile(url.searchParams.get("id"), url.searchParams.get("path")),
        list: () => this.listBundles({
          type: url.searchParams.get("type"),
          state: url.searchParams.get("state"),
          after: url.searchParams.get("after") || null,
          limit: url.searchParams.get("limit")
        }),
        index: () => this.buildIndex(),
        projection: () => this.projection({
          bundleId: url.searchParams.get("id"),
          jsonPath: url.searchParams.get("jsonPath"),
          jsonEquals: url.searchParams.get("jsonEquals")
        }),
        /* Retrieval. `viewer` is stamped by the control plane and is never taken
           from the caller's own parameters there; here it is simply read, and an
           absent one compiles to the deny predicate. */
        search: () => this.search({
          q: url.searchParams.get("q") ?? "",
          viewer: url.searchParams.get("viewer"),
          sort: url.searchParams.get("sort"),
          dir: url.searchParams.get("dir"),
          limit: url.searchParams.get("limit"),
          offset: url.searchParams.get("offset"),
          mode: url.searchParams.get("mode"),
          facets: url.searchParams.get("facets") === "none" ? false : url.searchParams.get("facets") ? url.searchParams.get("facets").split(",") : null,
          /* D-32. Which facet strategy ran, so the bench can drive BOTH through
             the real op rather than measuring a copy of the code. Not a tuning
             knob for callers: absent means the default, and the two are asserted
             to agree exactly. */
          facetMode: url.searchParams.get("facetmode"),
          widen: url.searchParams.get("widen") !== "0",
          snippetChars: Number(url.searchParams.get("snippet")) || 12
        }),
        searchfields: () => this.searchFields(),
        /* Selections. `viewer` and `owner` are both stamped by the control plane
           from the authenticated credential and are never taken from the
           caller's own parameters there. */
        select: () => this.selectionCreate({
          q: url.searchParams.get("q") ?? "",
          viewer: url.searchParams.get("viewer"),
          owner: url.searchParams.get("owner"),
          sort: url.searchParams.get("sort"),
          dir: url.searchParams.get("dir"),
          kind: url.searchParams.get("kind"),
          ids: Array.isArray(body?.ids) ? body.ids : null
        }),
        selection: () => this.selectionResolve({
          handle: url.searchParams.get("handle"),
          viewer: url.searchParams.get("viewer"),
          owner: url.searchParams.get("owner"),
          weight: url.searchParams.get("weight") === "refuse" ? "refuse" : "report"
        }),
        /* The first action that refers to a selection. `weight` is deliberately
           NOT read from the query string: citing is report-weight because of
           what it is, and a caller that could choose would make the weight
           distinction advisory. `author` is stamped by the control plane. */
        cite: () => this.cite({
          project: url.searchParams.get("project"),
          handle: url.searchParams.get("handle"),
          viewer: url.searchParams.get("viewer"),
          owner: url.searchParams.get("owner"),
          note: url.searchParams.get("note") ?? "",
          author: url.searchParams.get("author")
        }),
        /* The first STATE-CHANGING actions to refer to a selection, and the
           first callers of selectionResolve's refusing arm. Weight is not read
           from the caller here either. */
        sever: () => this.sever({
          project: url.searchParams.get("project"),
          handle: url.searchParams.get("handle"),
          viewer: url.searchParams.get("viewer"),
          owner: url.searchParams.get("owner"),
          reason: url.searchParams.get("reason") ?? "",
          author: url.searchParams.get("author")
        }),
        reinstate: () => this.reinstate({
          project: url.searchParams.get("project"),
          handle: url.searchParams.get("handle"),
          viewer: url.searchParams.get("viewer"),
          owner: url.searchParams.get("owner"),
          reason: url.searchParams.get("reason") ?? "",
          author: url.searchParams.get("author")
        }),
        selectionlist: () => this.selectionList({ owner: url.searchParams.get("owner") }),
        selectionrelease: () => this.selectionRelease({
          handle: url.searchParams.get("handle"),
          owner: url.searchParams.get("owner")
        }),
        searchindexcheck: () => this.searchIndexCheck({
          after: url.searchParams.get("after") || "",
          limit: url.searchParams.get("limit")
        }),
        projectionplan: () => this.projectionPlan(),
        projectionclear: () => this.projectionClear(body || {}),
        reproject: () => this.reproject(body || {}),
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
        invitelook: () => this.inviteLook(body || {}),
        memberlist: () => this.memberList(),
        memberset: () => this.memberSet(body || {}),
        /* The membership model's member half. All admin-only at the control
           plane: memberlist pairs cover with handle, which only an
           administrator sees, and the rest are section 4 governance. */
        membercaps: () => this.memberCaps(body || {}),
        adminendorse: () => this.adminEndorse(body || {}),
        adminremove: () => this.adminRemove(body || {}),
        adminarith: () => this.adminArithmetic(),
        projectclaimowner: () => this.projectClaimOwner(body || {}),
        projectinvite: () => this.projectInvite({
          projectId: url.searchParams.get("projectId"),
          handle: url.searchParams.get("handle"),
          by: url.searchParams.get("by")
        }),
        projectjoin: () => this.projectJoin({
          projectId: url.searchParams.get("projectId"),
          by: url.searchParams.get("by")
        }),
        projectleave: () => this.projectLeave({
          projectId: url.searchParams.get("projectId"),
          by: url.searchParams.get("by"),
          comment: url.searchParams.get("comment")
        }),
        projectremove: () => this.projectRemove({
          projectId: url.searchParams.get("projectId"),
          handle: url.searchParams.get("handle"),
          by: url.searchParams.get("by"),
          comment: url.searchParams.get("comment")
        }),
        projectparticipants: () => this.projectParticipants({
          projectId: url.searchParams.get("projectId"),
          by: url.searchParams.get("by")
        }),
        registeraudit: () => this.registerAudit(),
        signeradd: () => this.signerAdd(body || {}),
        signerlist: () => this.signerList(),
        signerset: () => this.signerSet(body || {}),
        gatefacts: () => this.gateFacts(url.searchParams.get("id")),
        audit: () => this.auditPass({
          after: url.searchParams.get("after") || "",
          limit: url.searchParams.get("limit")
        }),
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
  selftest: { classes: ["admin", "member", "probe"], mutating: false },
  livefire: { classes: ["admin", "probe"], mutating: true },
  /* op=index reads the `bundles` table, which is WORKING corpus, so it is not a
     published-scope read and the public class must not have it. A title is the
     leak that matters: it names what the group is looking into, and the state
     says how far along they are, both before there is anything to answer. The
     public surface for a listing is `publishedlist`, which reads the projection
     that has never held unratified material. Asserted in test/fence.test.mjs. */
  index: { classes: ["admin", "member", "probe"], mutating: false },
  /* S-10 step 1. The metadata projection the retrieval surface filters and sorts
     on, including source.locator and source.authority, which Bob settled as
     searchable. Working corpus, so member class and above, never public: the
     same fence that governs op=index governs this. */
  projection: { classes: ["admin", "member", "probe"], mutating: false },
  reproject: { classes: ["admin", "probe"], mutating: true },
  /* S-10 steps 2 to 4: the retrieval surface. It reads the WORKING corpus, so it
     is member class and above and never public, exactly like op=index and
     op=projection. There is no public token class to grant it to and there must
     never be one: a search result carries titles, states, locators and
     authorities, which together name what the group is looking into and how far
     along it is, before there is anything to answer.
     `viewer` is stamped below from the authenticated identity and a
     caller-supplied value is overwritten, because the D-15 visibility gate is
     only a gate if the caller cannot choose whose view it compiles. */
  search: { classes: ["admin", "member", "probe"], mutating: false },
  /* The vocabulary of the query language, so a UI builds its controls from the
     plane rather than from a copy that drifts. Working-corpus field names, so
     the same fence applies. */
  searchfields: { classes: ["admin", "member", "probe"], mutating: false },
  /* The verifier for "the index cannot diverge from the corpus": it re-derives
     the expected text row for every bundle and compares. Read-only. */
  searchindexcheck: { classes: ["admin", "member", "probe"], mutating: false },
  /* S-10 step 5. A selection is a server-side construct so the set an operator
     selected is the set an action lands on. Two kinds: a QUERY selection, where
     the operator picked a criterion and the current answer to it is the correct
     set by definition, and an ENUMERATED one, where they picked specific items
     and membership is frozen. `select` is mutating because it writes a snapshot;
     it writes nothing about the corpus and a probe-class caller is still
     confined to scratch. */
  select: { classes: ["admin", "member", "probe"], mutating: true },
  selection: { classes: ["admin", "member", "probe"], mutating: false },
  selectionlist: { classes: ["admin", "member", "probe"], mutating: false },
  selectionrelease: { classes: ["admin", "member", "probe"], mutating: true },
  /* The first action that refers to a selection: citing Information in a
     Project, at weight `report`. Mutating, because it promotes the Project with
     the new edges written into its bundle.md; `refs` is a projection of that
     document and is never written directly (D-21). Member class and above like
     every other reader of the working corpus, and there is no public class to
     grant it to. */
  cite: { classes: ["admin", "member", "probe"], mutating: true },
  /* S-11 step 2: the first STATE-CHANGING actions to refer to a selection, and
     therefore the first callers of selectionResolve's REFUSING arm. Severing
     withdraws a citation without deleting it and reinstating restores one; both
     require a reason, because the catalog's own remediation for a bad reference
     is "sever with reason" and an edge moved with no reason is an unexplained
     change wearing a status field. */
  sever: { classes: ["admin", "member", "probe"], mutating: true },
  reinstate: { classes: ["admin", "member", "probe"], mutating: true },
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
  /* Acquisition: the fetch layer the intake doctrine calls M2'. It writes bytes
     and no bundle state, because the doctrine is explicit that no intake path
     writes live state and the daemon and the member are writers like any other. */
  acquire: { classes: ["admin", "member", "probe"], mutating: true },
  /* Co-attestation. Asks a timestamp authority to attest that a capture existed
     at a claimed instant, which is the one part of provenance a group cannot
     fabricate for itself. */
  attest: { classes: ["admin", "member", "probe"], mutating: true },
  /* The monitor. Checks whether a monitored source still serves what was
     captured and records the answer as a mechanical monitor-tick, inside the
     field set C-20.1 holds that operation to. */
  monitor: { classes: ["admin", "member", "probe"], mutating: true },
  /* A conformance pass over the whole store, run inside the Durable Object where
     the images already are. Read-only, paginated, and resumable by cursor. */
  audit: { classes: ["admin", "member", "probe"], mutating: false },
  /* Write arc. Ratification's authority is the SSHSIG itself, checked
     against the registered signers; the token or session only reaches the
     surface. Member and signer administration is admin-only. Probe class
     reaches everything so the whole write arc is exercisable against
     scratch, whose Durable Object is a different instance with its own
     member tables, so scratch enrollment can never touch the live roster. */
  ratify: { classes: ["admin", "member", "probe"], mutating: true },
  publishedlist: { classes: ["admin", "member", "probe"], mutating: false },
  inbox: { classes: ["admin", "member", "probe"], mutating: false },
  inboxget: { classes: ["admin", "member", "probe"], mutating: false },
  inboxresolve: { classes: ["admin", "member", "probe"], mutating: true },
  memberadd: { classes: ["admin", "probe"], mutating: true },
  memberlist: { classes: ["admin", "member", "probe"], mutating: false },
  memberset: { classes: ["admin", "probe"], mutating: true },
  /* The membership model's member half. All admin-only: memberlist pairs cover
     with handle and only administrators see those together (section 3), and the
     rest is section 4 governance. `adminarith` is a read of the rule itself, so
     a UI can tell a group what a removal would take before they begin one. */
  membercaps: { classes: ["admin", "probe"], mutating: true },
  adminendorse: { classes: ["admin", "probe"], mutating: true },
  adminremove: { classes: ["admin", "probe"], mutating: true },
  adminarith: { classes: ["admin", "member", "probe"], mutating: false },
  /* D-9: why a register row is unreferenced. A read that classifies every row
     against what the store actually holds, so the 20 unexplained rows on the
     live instance stop being a plausible story and become a measured one.
     Admin, because the register is intake provenance for the working corpus. */
  registeraudit: { classes: ["admin", "probe"], mutating: false },
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
  /* What a burner URL resolves to. Unauthenticated by necessity: the invitee
     holds no credential yet, which is the whole point of an invitation. It
     answers only for a LIVE invitation, and a spent token is indistinguishable
     from one that never existed, so it leaks nothing about who was invited. */
  invitelook: { classes: null, mutating: false },
  verify: { classes: null, mutating: false },
  knock: { classes: null, mutating: true }
};
var RETRIEVAL_READS = ["search", "searchfields", "searchindexcheck", "selection", "selectionlist"];
var EDGE_ACTIONS = ["cite", "sever", "reinstate"];
var SESSION_OPS = {
  member: /* @__PURE__ */ new Set([
    "promote",
    "lease",
    "allocid",
    "capture",
    "acquire",
    "attest",
    "monitor",
    "ratify",
    "inbox",
    "inboxget",
    "inboxresolve",
    "audit",
    "select",
    "selectionrelease",
    ...RETRIEVAL_READS,
    ...EDGE_ACTIONS
  ]),
  admin: /* @__PURE__ */ new Set([
    "promote",
    "lease",
    "allocid",
    "capture",
    "acquire",
    "attest",
    "monitor",
    "ratify",
    "inbox",
    "inboxget",
    "inboxresolve",
    "audit",
    "select",
    "selectionrelease",
    ...RETRIEVAL_READS,
    ...EDGE_ACTIONS,
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
    if (req.method === "GET" && (url.pathname === "/version" || url.pathname === "/version/"))
      return new Response(
        (env.VERSION || "0.0.0") + "\n",
        { headers: {
          "content-type": "text/plain; charset=utf-8",
          "access-control-allow-origin": "*"
        } }
      );
    if (req.method === "GET" && (url.pathname === "/sign" || url.pathname === "/sign/"))
      return new Response(SIGN_HTML, { headers: { "content-type": "text/html; charset=utf-8" } });
    if (req.method === "GET" && !url.pathname.startsWith("/api") && (url.pathname === "/" || url.pathname === "") && !url.searchParams.get("op"))
      return new Response(SETUP_HTML, { headers: { "content-type": "text/html; charset=utf-8" } });
    const path = url.pathname.replace(/^\/api\/?/, "/");
    const op = url.searchParams.get("op") || path.slice(1) || "selftest";
    const spec = OPS[op];
    if (!spec) return json({ ok: false, error: "unknown op", op }, 400);
    if (spec.classes === null) {
      const fp = await fingerprint(env.ADMIN_TOKEN);
      const stub2 = env.STORE.get(env.STORE.idFromName("bio"));
      const invStub = url.searchParams.get("store") === SCRATCH ? env.STORE.get(env.STORE.idFromName(SCRATCH)) : stub2;
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
      if (op === "invitelook") {
        const body2 = await req.json().catch(() => ({}));
        const r2 = await invStub.fetch(new Request("http://do/invitelook", {
          method: "POST",
          body: JSON.stringify(body2)
        }));
        return json(await r2.json(), 200);
      }
      if (op === "enroll") {
        const body2 = await req.json().catch(() => ({}));
        const r2 = await invStub.fetch(new Request("http://do/enroll", {
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
    if (op === "registeraudit") {
      const st = env.STORE.get(env.STORE.idFromName(storeName));
      const r = (await (await st.fetch("http://do/registeraudit")).json()).result;
      const canProbe = typeof env.CAPTURES?.head === "function";
      const captured = [], unbacked = [], mismatched = [];
      for (const row of r.unresolved) {
        if (row.class === "orphan") {
          unbacked.push({ ...row, why: "the bundle itself is absent" });
          continue;
        }
        if (!canProbe) {
          unbacked.push({ ...row, why: "no capture bucket is configured to check" });
          continue;
        }
        const h = await env.CAPTURES.head(`${storeName}/captures/${row.capture_sha}`);
        if (!h) unbacked.push({ ...row, why: "no bytes in the working bucket" });
        else if (typeof row.bytes === "number" && h.size !== row.bytes)
          mismatched.push({ ...row, registered: row.bytes, stored: h.size });
        else captured.push(row);
      }
      return json({ ok: true, result: {
        total: r.total,
        live: r.live,
        superseded: r.superseded,
        historical: r.historical,
        captured: captured.length,
        mismatched: mismatched.length,
        unbacked: unbacked.length,
        sound: unbacked.length === 0 && mismatched.length === 0,
        probed: canProbe,
        detail: "captured means the bytes are not in the bundle image but ARE in the working bucket, which is the deliberate pattern migrate.mjs uses and what the two-bucket design exists for. unbacked is the only broken state, and mismatched means the register and the stored object disagree about size.",
        sample: [...unbacked, ...mismatched].slice(0, 40)
      }, store: storeName, tokenClass: cls }, 200);
    }
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
    if (op === "acquire") {
      if (req.method !== "POST") return json({ ok: false, error: "acquire is a POST" }, 405);
      if (typeof env.CAPTURES?.put !== "function")
        return json({ ok: false, error: "this instance has no evidence storage configured" }, 503);
      const body2 = await req.json().catch(() => null);
      const locator = body2?.locator;
      if (typeof locator !== "string" || !isPublicHttpsLocator(locator))
        return json({
          ok: false,
          reason: "BAD_LOCATOR",
          detail: "a locator must be https on a public host: no bare IP address, no localhost, no credentials in the address"
        }, 400);
      if (typeof body2?.authority !== "string" || !body2.authority.trim())
        return json({
          ok: false,
          reason: "NO_AUTHORITY",
          detail: "record who issued the document; the capture chain and the source are separate claims and both are named"
        }, 400);
      const retrieved = (/* @__PURE__ */ new Date()).toISOString().split(".")[0] + "Z";
      let res2;
      try {
        res2 = await fetch(locator, { redirect: "follow", headers: { "user-agent": "bio-acquire" } });
      } catch (e) {
        return json({ ok: false, reason: "FETCH_FAILED", detail: String(e && e.message || e), locator }, 502);
      }
      if (!res2.ok)
        return json({ ok: false, reason: "SOURCE_REFUSED", status: res2.status, locator }, 502);
      const PART = 8 * 1024 * 1024;
      const MAX = 256 * 1024 * 1024;
      const whole = createSha256();
      const parts = [];
      let total = 0, held = [], heldBytes = 0, oversize = false;
      const flush = async () => {
        if (!heldBytes) return;
        const buf = new Uint8Array(heldBytes);
        let at = 0;
        for (const c of held) {
          buf.set(c, at);
          at += c.length;
        }
        held = [];
        heldBytes = 0;
        const d = await crypto.subtle.digest("SHA-256", buf);
        const psha = [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("");
        if (!await env.CAPTURES.head(`${storeName}/captures/${psha}`))
          await env.CAPTURES.put(`${storeName}/captures/${psha}`, buf, { sha256: d });
        parts.push({ sha256: psha, bytes: buf.length });
      };
      const reader = res2.body && res2.body.getReader ? res2.body.getReader() : null;
      if (!reader) return json({ ok: false, reason: "NO_BODY", locator }, 502);
      for (; ; ) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.length;
        if (total > MAX) {
          oversize = true;
          break;
        }
        whole.update(value);
        held.push(value);
        heldBytes += value.length;
        if (heldBytes >= PART) await flush();
      }
      if (oversize) {
        try {
          await reader.cancel();
        } catch {
        }
        return json({
          ok: false,
          reason: "TOO_LARGE",
          bytes: total,
          maxBytes: MAX,
          detail: "the document exceeds what this surface will capture even in parts"
        }, 413);
      }
      await flush();
      if (total === 0) return json({ ok: false, reason: "EMPTY", locator }, 502);
      const sha = whole.hex();
      let existed = false, multipart = parts.length > 1;
      if (!multipart) {
        const only = parts[0];
        if (only.sha256 !== sha) {
          return json({
            ok: false,
            reason: "HASH_DISAGREEMENT",
            detail: "the incremental hash and the block hash of the same bytes differ"
          }, 500);
        }
        existed = !!await env.CAPTURES.head(`${storeName}/captures/${sha}`);
      }
      const ct = (res2.headers.get("content-type") || "").split(";")[0].trim();
      const name = (body2.file || locator.split("/").pop() || "capture").replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 100) || "capture";
      return json({
        ok: true,
        existed,
        document: {
          file: `snapshots/${name}`,
          locator,
          authority: body2.authority.trim(),
          retrieved,
          capture: {
            method: multipart ? `bio-plane acquire, https fetch, streamed in ${parts.length} parts, hashed at receipt` : "bio-plane acquire, https fetch, hashed at receipt",
            grade: "B",
            actor_class: viaSession ? "member" : cls === "probe" ? "session" : "daemon",
            /* Over the reassembled whole, which is what C-18.1 requires of a
               parted document and what C-18.6 checks by streaming the parts. */
            sha256: sha,
            encoding: "binary",
            bytes: total,
            ...ct ? { content_type: ct } : {}
          },
          ...multipart ? { parts: parts.map((p, i) => ({
            file: `snapshots/${name}.part${String(i).padStart(3, "0")}`,
            sha256: p.sha256,
            bytes: p.bytes
          })) } : {},
          origin: {
            kind: body2.matchedSweep ? "sweep" : "named_request",
            ...body2.matchedSweep ? { matched_sweep: body2.matchedSweep, deeming_actor: sessMember || cls } : {}
          },
          attestation_attempts: []
        },
        ...multipart ? { parts: parts.length } : {},
        note: "Grade B: bytes as fetched, hashed at receipt. Grade A needs a chain-of-custody web archive, which this surface cannot produce. Co-attestation raises B toward evidentiary weight.",
        store: storeName,
        tokenClass: cls
      }, 200);
    }
    if (op === "attest") {
      if (req.method !== "POST") return json({ ok: false, error: "attest is a POST" }, 405);
      if (typeof env.CAPTURES?.put !== "function")
        return json({ ok: false, error: "this instance has no evidence storage configured" }, 503);
      const body2 = await req.json().catch(() => null);
      const sha = typeof body2?.sha256 === "string" ? body2.sha256.toLowerCase() : "";
      if (!/^[0-9a-f]{64}$/.test(sha))
        return json({ ok: false, reason: "BAD_SHA", detail: "attest takes the sha256 of a capture already in the store" }, 400);
      if (!await env.CAPTURES.head(`${storeName}/captures/${sha}`))
        return json({
          ok: false,
          reason: "NO_SUCH_CAPTURE",
          detail: "nothing in this store has that hash; capture the document before attesting it"
        }, 404);
      const attempts = [];
      let token = null, tokenSha = null, service = null;
      for (const endpoint of TSA_ENDPOINTS) {
        const attempted = (/* @__PURE__ */ new Date()).toISOString().split(".")[0] + "Z";
        try {
          const { der } = timestampRequest(sha);
          const res2 = await fetch(endpoint, {
            method: "POST",
            body: der,
            headers: { "content-type": TSA_CONTENT_TYPE, accept: TSA_ACCEPT }
          });
          if (!res2.ok) {
            attempts.push({ service: endpoint, attempted, ok: false, note: `http ${res2.status}` });
            continue;
          }
          const parsed = parseTimestampResponse(new Uint8Array(await res2.arrayBuffer()), sha);
          if (!parsed.ok) {
            attempts.push({ service: endpoint, attempted, ok: false, note: parsed.reason });
            continue;
          }
          const digest = await crypto.subtle.digest("SHA-256", parsed.token);
          tokenSha = [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, "0")).join("");
          await env.CAPTURES.put(`${storeName}/captures/${tokenSha}`, parsed.token, { sha256: digest });
          token = parsed.token;
          service = endpoint;
          attempts.push({
            service: endpoint,
            attempted,
            ok: true,
            kind: "rfc3161",
            token_sha256: tokenSha,
            token_bytes: parsed.token.length
          });
          break;
        } catch (e) {
          attempts.push({ service: endpoint, attempted, ok: false, note: String(e && e.message || e).slice(0, 120) });
        }
      }
      let archive = null;
      if (body2.archive === true) {
        const attempted = (/* @__PURE__ */ new Date()).toISOString().split(".")[0] + "Z";
        const locator = typeof body2.locator === "string" ? body2.locator : "";
        if (!isPublicHttpsLocator(locator)) {
          attempts.push({
            service: ARCHIVE_SERVICE,
            attempted,
            ok: false,
            note: "no public https locator to archive"
          });
        } else {
          try {
            const res2 = await fetch(ARCHIVE_SAVE_BASE + locator, { redirect: "follow" });
            const archived = archiveLocatorFrom(res2, locator);
            if (res2.ok && archived) {
              archive = { service: ARCHIVE_SERVICE, locator: archived };
              attempts.push({
                service: ARCHIVE_SERVICE,
                attempted,
                ok: true,
                kind: "co-archive",
                archived_locator: archived
              });
            } else {
              attempts.push({
                service: ARCHIVE_SERVICE,
                attempted,
                ok: false,
                note: res2.ok ? "archived but returned no locator" : `http ${res2.status}`
              });
            }
          } catch (e) {
            attempts.push({
              service: ARCHIVE_SERVICE,
              attempted,
              ok: false,
              note: String(e && e.message || e).slice(0, 120)
            });
          }
        }
      }
      return json({
        ok: !!token,
        attempts,
        ...archive ? { archive } : {},
        ...token ? {
          attestation: {
            file: `snapshots/timestamp-${tokenSha.slice(0, 12)}.tsr`,
            kind: "rfc3161",
            service,
            sha256: tokenSha,
            bytes: token.length,
            over: sha
          },
          note: "A trusted timestamp over the capture hash. Anyone can check it with openssl ts -verify against the authority's certificate; this plane obtains and stores it, and does not claim to have verified the signature."
        } : {
          reason: "NO_ATTESTATION",
          note: "Every attempt was recorded. A register showing a failed attempt and one showing no attempt are different claims, so the failures above belong in the document rather than being dropped."
        },
        store: storeName,
        tokenClass: cls
      }, token ? 200 : 502);
    }
    if (op === "monitor") {
      if (req.method !== "POST") return json({ ok: false, error: "monitor is a POST" }, 405);
      const body2 = await req.json().catch(() => null);
      const bundleId = body2?.bundleId;
      if (typeof bundleId !== "string" || !bundleId)
        return json({ ok: false, error: "monitor needs a bundleId" }, 400);
      const stub0 = env.STORE.get(env.STORE.idFromName(storeName));
      const img = (await (await stub0.fetch(`http://do/image?id=${encodeURIComponent(bundleId)}`)).json()).result;
      if (!img || typeof img["bundle.md"] !== "string")
        return json({ ok: false, reason: "ABSENT", bundleId }, 404);
      const live = img["bundle.md"];
      const fm = parseFrontmatter(live).data || {};
      if (!fm.monitoring || fm.monitoring.enabled !== true)
        return json({
          ok: false,
          reason: "NOT_MONITORED",
          detail: "this bundle does not ask to be monitored"
        }, 409);
      const locator = fm.source?.locator;
      if (typeof locator !== "string" || !isPublicHttpsLocator(locator))
        return json({
          ok: false,
          reason: "NO_LOCATOR",
          detail: "monitoring needs a public https locator in source.locator"
        }, 409);
      let baseline = null;
      try {
        const reg = JSON.parse(img["data/provenance.json"] || "{}");
        const match = (reg.documents || []).find((d) => d && d.locator === locator);
        baseline = match?.capture?.sha256 || null;
      } catch {
      }
      const checked = (/* @__PURE__ */ new Date()).toISOString().split(".")[0] + "Z";
      let status = null, note = null, seen = null;
      try {
        const res2 = await fetch(locator, { redirect: "follow", headers: { "user-agent": "bio-monitor" } });
        if (res2.status === 404 || res2.status === 410) {
          status = "removed";
          note = `the source answered ${res2.status}`;
        } else if (!res2.ok) {
          note = `the source answered ${res2.status}`;
        } else {
          const bytes = new Uint8Array(await res2.arrayBuffer());
          const d = await crypto.subtle.digest("SHA-256", bytes);
          seen = [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("");
          if (!baseline) note = "no captured baseline to compare against; recorded the check only";
          else if (seen === baseline) {
            status = "unchanged";
            note = "the source still serves the captured bytes";
          } else {
            status = "modified";
            note = "the source no longer serves the captured bytes";
          }
        }
      } catch (e) {
        note = "the source could not be reached: " + String(e && e.message || e).slice(0, 90);
      }
      const flags = status === "modified" || status === "removed";
      const out = [];
      let fence = 0, inMon = false, inRe = false;
      for (const line of live.split("\n")) {
        if (line === "---" && fence < 2) {
          fence++;
          inMon = inRe = false;
          out.push(line);
          continue;
        }
        if (fence === 1) {
          if (/^[a-zA-Z_]/.test(line)) {
            inMon = /^monitoring:/.test(line);
            inRe = /^reeval_pending:/.test(line);
          }
          if (status && /^source_status:/.test(line)) {
            out.push("source_status: " + status);
            continue;
          }
          if (/^last_updated:/.test(line)) {
            out.push("last_updated: " + checked);
            continue;
          }
          if (inMon && /^\s+last_checked:/.test(line)) {
            out.push("  last_checked: " + checked);
            continue;
          }
          if (inRe && flags && /^\s+flag:/.test(line)) {
            out.push("  flag: true");
            continue;
          }
          if (inRe && flags && /^\s+since:/.test(line)) {
            out.push("  since: " + checked);
            continue;
          }
          if (inRe && flags && /^\s+source:/.test(line)) {
            out.push("  source: source_status");
            continue;
          }
        }
        out.push(line);
      }
      let text = out.join("\n");
      if (!/^\s+last_checked:/m.test(text) && /^monitoring:/m.test(text))
        text = text.replace(/^monitoring:/m, "monitoring:\n  last_checked: " + checked);
      const entry = "### Session " + checked + "\n\nMonitor tick: " + (note || "checked") + "\n";
      const at = text.indexOf("## Session Log");
      if (at < 0) text += "\n## Session Log\n\n" + entry;
      else {
        const nxt = text.indexOf("\n## ", at + 1);
        const cut = nxt === -1 ? text.length : nxt + 1;
        text = text.slice(0, cut) + entry + "\n" + text.slice(cut);
      }
      const carried = [];
      for (const [path2, v] of Object.entries(img)) {
        if (path2 === "bundle.md" || path2.startsWith("_history/")) continue;
        if (typeof v === "string") {
          const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
          carried.push({
            path: path2,
            text: v,
            bytes: v.length,
            sha256: [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("")
          });
        } else carried.push({ path: path2, blobSha: v.blobSha, sha256: v.sha256, bytes: v.bytes });
      }
      const liveSha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(live)))].map((x) => x.toString(16).padStart(2, "0")).join("");
      const textSha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)))].map((x) => x.toString(16).padStart(2, "0")).join("");
      const stamp = checked.replace(/[-:]/g, "") + "_" + [...crypto.getRandomValues(new Uint8Array(4))].map((x) => x.toString(16).padStart(2, "0")).join("");
      const promoted = await (await stub0.fetch("http://do/promote", { method: "POST", body: JSON.stringify({
        bundleId,
        base: liveSha,
        snapKey: stamp,
        author: "bio-monitor",
        writer: "mechanical",
        operation: "monitor-tick",
        meta: {
          object_type: fm.object_type,
          group: fm.group || "believe-in-oakland",
          title: fm.title,
          current_state: fm.current_state,
          prior_state: fm.prior_state ?? null,
          created: fm.created,
          last_updated: checked
        },
        /* Every OTHER file carried forward untouched. promote writes a whole
           image, so a writer that mentions one file deletes the rest: the first
           version of this tick removed the provenance register, which took the
           monitoring baseline with it and left an information@2 bundle with no
           register at all. A mechanical writer silently destroying evidence is
           the worst thing in this system, and the shape of promote made it the
           DEFAULT behaviour of a careless caller. */
        files: [
          { path: "bundle.md", text, bytes: text.length, sha256: textSha },
          ...carried
        ],
        register: []
      }) })).json();
      return json({
        ok: !!promoted.result?.ok,
        checked,
        status,
        note,
        baseline,
        seen,
        reeval_raised: flags,
        ...promoted.result?.ok ? { revision: promoted.result.bundleSha } : { reason: promoted.result?.reason, detail: promoted.result?.detail },
        note2: "A tick records that the source moved. It does not capture the new version: what a change MEANS is not a mechanical judgement.",
        store: storeName,
        tokenClass: cls
      }, promoted.result?.ok ? 200 : 409);
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
      const known = new Set(((await (await stub.fetch("http://do/list")).json()).result || []).map((b) => b.bundle_id));
      const gate = await runGate({
        bundleId: body2.bundleId,
        image,
        knownIds: known,
        registers: facts.registers,
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
    if (op === "search" || op === "select" || op === "selection" || EDGE_ACTIONS.includes(op)) {
      inner.searchParams.set("viewer", viaSession ? `member:${sessMember}` : `class:${cls}`);
    }
    if (op === "select" || op === "selection" || op === "selectionlist" || op === "selectionrelease" || EDGE_ACTIONS.includes(op))
      inner.searchParams.set("owner", viaSession ? `member:${sessMember}` : `class:${cls}`);
    if (EDGE_ACTIONS.includes(op))
      inner.searchParams.set("author", viaSession ? sessMember : `token:${cls}`);
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
