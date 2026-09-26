/* record-core: the DDL of the module's own tables (bundles, files, history, manifest, leases,
   seq, minted_ids, settings). The legacy schema interpolates it until it is divided. Whole-line
   `--` comments only and no semicolon inside a comment: the store strips comment lines and splits
   the text on semicolons. */
export const RECORD_SCHEMA = `CREATE TABLE IF NOT EXISTS bundles (
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
  row_version   INTEGER NOT NULL DEFAULT 1,
  -- The project the bundle belongs to, as its committer named it (R33, R34).
  project       TEXT
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

-- D-432, Membership v2 section 7: THE OPAQUE MINTER'S MEMORY, beside the counter's.
-- seq is why allocid never reissues an identifier that has already existed -- a
-- purge keeps it. The gated prefixes (PROJ, CASE, DRAFT, RVG, TASK) have no counter:
-- record-core mintOpaqueId draws their four digits from the CSPRNG, and it checked each
-- draw only against the LIVE rows of its kind, which a purge deletes. So an id could
-- be drawn again after a purge, and a citation of the purged object would silently
-- resolve to the NEW one. Every id the minter hands out is recorded here, and every
-- draw asks this table as well as the live rows.
-- EXEMPT FROM op=purge, IN BOTH ARMS, ON SEQ'S REASONING. The standing rule that a
-- DERIVED table is named in purge does not reach it: nothing here is derived from
-- the corpus, and clearing it is the defect it closes. hygiene.test.mjs lists it
-- among the purge exemptions, beside seq.
-- Written in the minting act's own transaction, never one of its own, so an act that
-- rolls back (the review copy's dry run of the publish gates) takes its row back with
-- it. Seeded at every boot by record-core seedMintLedger from the live rows of each gated
-- kind, and from the range seq says the counter issued for a prefix with no tail.
-- READ BY NO ROUTE, and never counted or listed: a count of these ids is how many
-- gated objects were ever minted, hidden ones included (BOB #16).
--   source   'mint'     drawn and handed out by record-core mintOpaqueId
--            'live'     learned at boot from a live row of its kind
--            'counter'  learned at boot from seq, an id the counter issued before REC-151
CREATE TABLE IF NOT EXISTS minted_ids (
  id           TEXT PRIMARY KEY,
  recorded_at  TEXT NOT NULL,
  source       TEXT NOT NULL
);

-- R25: the instance settings, as named values. APPEND-ONLY: one row per act of
-- setting, the value in force the latest row for its name, so who set what and
-- when is kept. Exempt from purge (R23). value is JSON.
CREATE TABLE IF NOT EXISTS settings (
  name    TEXT NOT NULL,
  value   TEXT NOT NULL,
  set_by  TEXT NOT NULL,
  set_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS settings_name ON settings(name);
`;
