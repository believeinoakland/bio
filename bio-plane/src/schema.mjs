export const SCHEMA = `-- BIO store schema, draft 1, derived from the real bundle.md frontmatter and
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

-- What this RUNTIME was observed to allow, as opposed to what we choose to
-- spend. Cloudflare's per-invocation subrequest limit differs by account, can
-- change on either plan without notice, and is not documented anywhere this
-- code can read, so the only honest source for it is having been refused.
--
-- previous and moved_at exist because a ceiling that MOVES is itself a fact the
-- instance should notice: an upgraded plan and a tightened platform look
-- identical in a single scalar, and telling them apart needs the history.
--
-- samples drives re-probing. Once a value has been confirmed enough times the
-- instance deliberately runs without a ceiling again, because a limit only ever
-- learned downward would leave an upgraded account capped forever.
CREATE TABLE IF NOT EXISTS capture_limits (
  runtime     TEXT PRIMARY KEY,
  observed    INTEGER NOT NULL,
  observed_at TEXT NOT NULL,
  first_seen  TEXT NOT NULL,
  samples     INTEGER NOT NULL DEFAULT 1,
  since_probe INTEGER NOT NULL DEFAULT 0,
  previous    INTEGER,
  moved_at    TEXT
);
-- What a HOST has served, across every document captured from it.
--
-- Bytes were always shared: captures are content-addressed, so one stylesheet
-- occupies one R2 object however many documents reference it. FETCHES were not,
-- and fetches are the scarce thing. On a Legistar page roughly forty of the
-- forty-five available subrequests go to site-wide chrome that will be
-- byte-identical on the next document captured from that host.
--
-- stable_since is the last time the sha CHANGED, not the last time it was seen,
-- because "unchanged for three months" and "not looked at for three months" are
-- different facts and only the first licenses reuse.
--
-- The same table answers chrome detection. An address referenced by fifteen of
-- fifteen captured documents on a host is the site's; one referenced by a single
-- document is that document's own. That works on sites that never write a <nav>
-- element, which is most municipal sites.
CREATE TABLE IF NOT EXISTS site_assets (
  host         TEXT NOT NULL,
  address_norm TEXT NOT NULL,
  address      TEXT NOT NULL,
  sha256       TEXT NOT NULL,
  content_type TEXT,
  bytes        INTEGER NOT NULL DEFAULT 0,
  kind         TEXT,
  first_seen   TEXT NOT NULL,
  last_seen    TEXT NOT NULL,
  last_fetched TEXT NOT NULL,
  stable_since TEXT NOT NULL,
  changes      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (host, address_norm)
);
CREATE INDEX IF NOT EXISTS site_assets_host ON site_assets(host);
CREATE INDEX IF NOT EXISTS site_assets_sha ON site_assets(sha256);

-- One row per (asset, document). Gives an exact distinct-document count rather
-- than an incrementing counter that double-counts a re-capture, and it is what
-- makes post-hoc verification possible: when an asset's sha later changes, the
-- documents that REUSED the old bytes are exactly the rows here with reused=1.
CREATE TABLE IF NOT EXISTS site_asset_refs (
  host         TEXT NOT NULL,
  address_norm TEXT NOT NULL,
  primary_sha  TEXT NOT NULL,
  at           TEXT NOT NULL,
  reused       INTEGER NOT NULL DEFAULT 0,
  sha256       TEXT NOT NULL,
  PRIMARY KEY (host, address_norm, primary_sha)
);
CREATE INDEX IF NOT EXISTS site_asset_refs_doc ON site_asset_refs(primary_sha);
-- A capture that ran out of subrequest budget, waiting for another tick.
--
-- SCRATCH, not record. The intake doctrine says no intake path writes live
-- state, and that keeps holding: this is a work list with an expiry, it names
-- no bundle, and acquire still returns a provenance document and promotes
-- nothing. The primary capture is complete from the first tick and its bytes
-- are already in the store; what is outstanding here is only support material.
--
-- The primary HTML is deliberately NOT stored here. It is in the store under
-- primary_sha, and a copy in session state would be a second, unverified copy
-- of evidence sitting somewhere nothing checks.
CREATE TABLE IF NOT EXISTS capture_sessions (
  session     TEXT PRIMARY KEY,
  locator     TEXT NOT NULL,
  primary_sha TEXT NOT NULL,
  primary_file TEXT NOT NULL,
  base        TEXT NOT NULL,
  created     TEXT NOT NULL,
  updated     TEXT NOT NULL,
  expires     TEXT NOT NULL,
  ticks       INTEGER NOT NULL DEFAULT 1,
  state       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS capture_sessions_expires ON capture_sessions(expires);
-- Links a captured document made, and what they resolve to.
--
-- Address-keyed, which refs is not: refs is bundle-to-bundle and answers a
-- different question. An UNRESOLVED link has no canonical target and cannot be
-- a citation at all, because C-6.1 rightly refuses a locator as a
-- references[].target. Resolution is the act that makes a link expressible as
-- an edge: once the store holds a capture of the address, there is a canonical
-- ID to point at, and the address rides along as a comment string.
--
-- address_norm is stored ALONGSIDE address, never instead of it, because a
-- normalisation rule that later proves wrong must be re-derivable and a
-- normalisation MISS looks exactly like "not captured".
--
-- The verdict is about CONTEMPORANEITY: whether the capture the store holds of
-- the target is the version the source was pointing at on the day this document
-- was captured. It is three-valued on purpose. undetermined is the resting
-- state and the expected common case, because Last-Modified is absent from most
-- dynamic pages, wrong on many others, and reset by deployments that changed
-- nothing. A binary design silently sorts every undetermined link into one
-- bucket or the other and both errors are bad.
CREATE TABLE IF NOT EXISTS links (
  source_bundle  TEXT,
  source_capture TEXT NOT NULL,
  link_ref       TEXT NOT NULL,
  address        TEXT NOT NULL,
  address_norm   TEXT NOT NULL,
  partition      TEXT NOT NULL,
  origin         TEXT,
  chrome         INTEGER NOT NULL DEFAULT 0,
  captured_at    TEXT NOT NULL,
  first_seen     TEXT NOT NULL,
  PRIMARY KEY (source_capture, link_ref, address_norm)
);
CREATE INDEX IF NOT EXISTS links_target ON links(address_norm);
CREATE INDEX IF NOT EXISTS links_source ON links(source_bundle);

-- The verdict, APPENDED and dated, never overwritten. A verdict that changed is
-- itself a fact about the record, for the same reason state history is
-- append-only: the current answer is the newest row, and the older rows are how
-- anyone can tell whether it was always this answer.
CREATE TABLE IF NOT EXISTS link_verdicts (
  source_capture TEXT NOT NULL,
  address_norm   TEXT NOT NULL,
  verdict        TEXT NOT NULL,
  basis          TEXT NOT NULL,
  target_bundle  TEXT,
  target_capture TEXT,
  at             TEXT NOT NULL,
  detail         TEXT,
  PRIMARY KEY (source_capture, address_norm, at)
);
CREATE INDEX IF NOT EXISTS link_verdicts_pair ON link_verdicts(source_capture, address_norm);
-- Which ADDRESSES the record has captured, and when. The register is keyed by
-- capture hash and carries no locator, so nothing could answer "does the store
-- hold a capture of https://..." without this. One row per (address, capture),
-- because the point is precisely that an address is captured repeatedly over
-- time and the versions are what a contemporaneity verdict compares.
-- One row per (address, DISTINCT BYTES), carrying the INTERVAL over which those
-- bytes were seen served rather than a single date. That interval is the whole
-- point: identical bytes observed on both sides of another document's retrieval
-- prove the target did not change across it, which settles contemporaneity
-- outright and needs no timestamp from the source that anyone has to trust. A
-- first draft keyed rows by (address, sha) and kept only the earliest date,
-- which threw away exactly the evidence the verdict is built on.
CREATE TABLE IF NOT EXISTS captured_locators (
  address_norm    TEXT NOT NULL,
  address         TEXT NOT NULL,
  capture_sha     TEXT NOT NULL,
  first_retrieved TEXT NOT NULL,
  last_retrieved  TEXT NOT NULL,
  observations    INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (address_norm, capture_sha)
);
CREATE INDEX IF NOT EXISTS captured_locators_addr ON captured_locators(address_norm, first_retrieved);
`;
