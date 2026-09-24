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
  registered  TEXT NOT NULL,
  -- MK-1 / D-184 / IC-134 (MEMBER-KNOWLEDGE-DESIGN.md section 2). 1 when these
  -- bytes are a MEMBER'S OWN WORDS authored through op=testify, never a capture
  -- of something published. ONLY the testimony path writes 1, and promote's
  -- fence (C-53.8) refuses the flag on any document it did not write, so a
  -- caller cannot set it and cannot clear it. 0 is the true value for every row
  -- that existed before this column did, because no authored bundle could.
  authored    INTEGER NOT NULL DEFAULT 0,
  -- The member who authored the words, STAMPED by the plane from the session
  -- and never taken from the caller. NULL on every row that is not authored.
  author      TEXT,
  -- When the member says they OBSERVED it, which is THEIR statement. The
  -- record's own time of writing is registered above, and the two are kept
  -- apart as correspondence keeps them. NULL on every row that is not authored.
  observed_at TEXT
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

-- D-432, Membership v2 section 7: THE OPAQUE MINTER'S MEMORY, beside the counter's.
-- seq is why allocid never reissues an identifier that has already existed -- a
-- purge keeps it. The gated prefixes (PROJ, CASE, DRAFT, RVG, TASK) have no counter:
-- Store#mintOpaqueId draws their four digits from the CSPRNG, and it checked each
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
-- it. Seeded at every boot by Store#seedMintLedger from the live rows of each gated
-- kind, and from the range seq says the counter issued for a prefix with no tail.
-- READ BY NO ROUTE, and never counted or listed: a count of these ids is how many
-- gated objects were ever minted, hidden ones included (BOB #16).
--   source   'mint'     drawn and handed out by Store#mintOpaqueId
--            'live'     learned at boot from a live row of its kind
--            'counter'  learned at boot from seq, an id the counter issued before REC-151
CREATE TABLE IF NOT EXISTS minted_ids (
  id           TEXT PRIMARY KEY,
  recorded_at  TEXT NOT NULL,
  source       TEXT NOT NULL
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

-- D-436 (State Rules v1.5 section 3.1, the core field group): THE PRODUCING GROUP'S SLUG,
-- ONE VALUE FOR THE WHOLE INSTANCE. Every bundle this instance writes names it as its
-- group, in the bytes that get signed, and nothing else may supply that name: not a
-- literal in the code, and not a deploy-time variable, which a redeploy could move
-- silently. One row, id=1, WRITTEN ONCE: every writer is an INSERT that does nothing on
-- conflict, and no statement anywhere updates or deletes it.
--   source  'bootstrap'  recorded at the store's FIRST BOOT (the migrate pass that finds no
--                        bundles table), from the slug the installer bound as INSTANCE_NAME,
--                        the worker name the group chose (D-102), read at that moment only
--           'seed'       recorded once by op=instancegroupseed, the root of trust's act, on a
--                        store that already held the schema when this table arrived
--   recorded_by  NULL for bootstrap, the server-stamped credential for a seed
-- EXEMPT FROM op=purge, in both arms: identity, not derived from the corpus, in the family
-- of bootstrap and seq. hygiene.test.mjs lists it among the purge exemptions.
CREATE TABLE IF NOT EXISTS instance_group (
  id           INTEGER PRIMARY KEY CHECK (id = 1),
  slug         TEXT NOT NULL,
  recorded_at  TEXT NOT NULL,
  source       TEXT NOT NULL,
  recorded_by  TEXT
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
--
-- REC-14 / DEC-12: KEYED (bundle_id, edition) AND APPENDING. The table used
-- to be keyed on bundle_id and to UPSERT, so re-ratifying destroyed the prior
-- signature, attestor, time and gate version (D-144) while published_shas
-- accumulated -- the code split against itself, and neither branch of the
-- terminality question. Bob's ruling makes the append RIGHT and the upsert
-- merely not yet edition-aware: an edition is a SEPARATE DOCUMENT, edition 2
-- joins edition 1 rather than overwriting it, and a reader who relied on
-- edition 1's hash is not betrayed because edition 1 still answers, still
-- carries its own attestation and its own date, and still says what it said.
--
-- title is the ONE deliberate divergence from DATA-MODEL.md 2.4.4, so the
-- public index is not N+1. The frozen columns after it are what the group
-- SIGNED, kept beside the signature rather than only inside the bytes:
-- strength is the frozen axis OBJECTS, one per axis of Store.STRENGTH_AXES --
-- capture and connection always, and testimony only when it carries something
-- (MK-2 / IC-142, corrected from "BOTH" by D-423) -- never letters: unrated and
-- undetermined are different frozen facts, and C-21.2 compares per axis
-- against the right one. required is DEC-17's declared bar as it stood,
-- null meaning ABSENT and gating nothing.
--
-- REC-44 / DEC-44 / D-187: THIS ROW IS A **FINDING**, NOT A CASE, and the
-- correction is that it was only ever a case by assumption. A published case
-- is a CONTAINER OVER ONE OR MORE FINDINGS scoped to the project's own
-- question; the FINDING stays the unit of truth and the CASE becomes the unit
-- of publication. So THREE things left this table and went to
-- published_cases, and each one left for the same reason -- it is a fact
-- about the CASE and would otherwise be stated once per member finding, which
-- is D-21's second place to state one fact:
--   completeness  the assertion C-21.1 compares the next edition against.
--                 C-21.1 is now PER CASE PER EDITION; C-21.2's per-axis
--                 inheritance stays PER FINDING and reads strength below.
--                 The two live at different altitudes and collapsing them is
--                 exactly what DEC-44 forbids.
--   manifest      DEC-34's signed hash manifest, which now describes the
--   manifest_sha  WHOLE case -- every member finding's parts, every member's
--                 own signature -- because a stranger holding the container
--                 must be able to check every finding the case rests on
--                 without contacting this instance (DEC-44 determination 3).
-- edition here IS the CASE edition the finding was published in, not a
-- number of its own: editions are over the CONTAINER (DEC-12, unchanged by
-- DEC-44 and given its natural home by it).
--
-- parts is WHAT THIS SIGNED EDITION OF THIS FINDING CONSISTS OF -- the path,
-- sha256, kind and byte length of every file, as hashed at ratification. It is
-- a column rather than a query over published_shas because published_shas is
-- append-only ACROSS editions on purpose (a hash once published answers
-- forever), so it cannot say which parts belong to WHICH edition, and the case
-- container needs exactly that: assembling edition N of a case means gathering
-- edition N's parts from every member, including members ratified minutes
-- earlier. Nothing else holds it.
--
-- REC-128 (BOB #14, the honesty half of D-421): attestor_member is who SIGNED,
-- taken from the signature. delivered_by is who DELIVERED it, taken from the
-- authenticated session that performed the act -- member:<id>, or founder for
-- the instance founder's password session. They are two facts and neither is
-- ever copied from the other. NULL is a row written before the column existed
-- and reads back as UNDETERMINED, stated, and is never back-filled from the signer.
-- case_documents carries the same column for op=caseratify, for the same reason.
CREATE TABLE IF NOT EXISTS published_bundles (
  bundle_id       TEXT NOT NULL,
  edition         INTEGER NOT NULL,
  title           TEXT,
  bundle_sha      TEXT NOT NULL,
  ratified_at     TEXT NOT NULL,
  attestor_key    TEXT NOT NULL,
  attestor_member TEXT,
  delivered_by    TEXT,            -- REC-128 WHO DELIVERED, from the session. NULL means not recorded, never the signer
  gate_version    TEXT NOT NULL,
  sig_armored     TEXT NOT NULL,
  strength        TEXT,
  required        TEXT,
  parts           TEXT,
  PRIMARY KEY (bundle_id, edition)
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
-- different facts. Neither licenses reuse. RECENCY OF FETCH does - last_fetched,
-- the last time the source was actually seen serving these bytes, within the
-- freshness window - together with a furniture kind and at least two distinct
-- PAGES on the host (reuseDecision in subresources.mjs). A stability gate was
-- measured live in 0.40.0 and reused nothing, so stable_since is a secondary
-- confidence signal and keeps its own job in nav-change evidence.
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
  last_fetched_by TEXT,
  PRIMARY KEY (host, address_norm)
);
CREATE INDEX IF NOT EXISTS site_assets_host ON site_assets(host);
CREATE INDEX IF NOT EXISTS site_assets_sha ON site_assets(sha256);

-- One row per (asset, primary capture). It replaces an incrementing counter, and
-- it is what makes post-hoc verification possible: when an asset's sha later
-- changes, the captures that REUSED the old bytes are exactly the rows here with
-- reused=1. primary_sha is the content hash of a CAPTURE, not a page: a page
-- whose bytes changed between two captures has two rows. So the distinct-document
-- count joins primary_sha to captured_locators and counts document ADDRESSES
-- (siteAssets and siteChrome in store.mjs, CAP-13), and a primary with no locator
-- row is counted apart as undetermined rather than as a page.
--
-- CAP-14 (CAPTURE-SCALING.md, Job one, RULED 2026-09-21 by BOB #21): a reused
-- part names the capture whose FETCH served its bytes. site_assets.last_fetched_by
-- is the primary capture sha whose fetch set last_fetched, written beside it on
-- every fetched observation and never moved by a reuse. A reusing capture's row
-- here keeps it as reused_from, taken from the capture's own observation so the
-- manifest and the store cannot disagree, and reusedParts reads it from THIS row,
-- never from site_assets, whose value a later fetch moves. Both are NULLABLE and
-- NEVER BACK-FILLED: a reuse recorded before the build is UNDETERMINED as to its
-- source, and matching a ref row at against last_fetched would prove nothing
-- (both whole seconds, and a ref row is overwritten in place).
CREATE TABLE IF NOT EXISTS site_asset_refs (
  host         TEXT NOT NULL,
  address_norm TEXT NOT NULL,
  primary_sha  TEXT NOT NULL,
  at           TEXT NOT NULL,
  reused       INTEGER NOT NULL DEFAULT 0,
  sha256       TEXT NOT NULL,
  reused_from  TEXT,
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
  -- Two keys, deliberately. address_norm identifies the RESOURCE and is what
  -- resolution matches against captured_locators; the server never sees a
  -- fragment, so it has none. citation_norm identifies the CITATION and keeps
  -- the fragment, because scientific and legal practice cite ELEMENTS and BIO
  -- citations support element references: a link to #findings and a link to
  -- #methodology in one report are two citations, and a single key made them
  -- indistinguishable.
  address_norm   TEXT NOT NULL,
  citation_norm  TEXT NOT NULL,
  fragment       TEXT,
  partition      TEXT NOT NULL,
  origin         TEXT,
  chrome         INTEGER NOT NULL DEFAULT 0,
  captured_at    TEXT NOT NULL,
  first_seen     TEXT NOT NULL,
  PRIMARY KEY (source_capture, link_ref, citation_norm)
);
CREATE INDEX IF NOT EXISTS links_citation ON links(citation_norm);
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
-- D-96: via names the SOURCE of an observation, because once an alternative
-- source counts as a re-fetch for monitoring (RULED, AUTHORITY-AND-TRUST.md),
-- archive bytes and live bytes must never be compared as one observation
-- stream. Two sources agreeing is STRONGER evidence than one source repeating;
-- two sources disagreeing is not evidence of change at all. The bracket arm
-- cannot tell those apart without knowing which is which, so via is part of
-- the KEY: an archive observation of the same bytes is a different fact from a
-- direct one, not a repeat of it.
--
-- The address columns carry the DOCUMENT ADDRESS, the address the record
-- reasons about; retrieval_locator carries what was actually fetched. For an
-- archive capture the document address is the CDX original field through our own
-- normaliser and the retrieval locator is the archive's replay address, and
-- conflating them is how a provenance difference gets reported as a change.
--
-- CORRECTED 2026-09-14 BY CAP-8, AND THE OLD SENTENCE IS SAID RATHER THAN
-- DELETED. This read "For a direct capture they are the same string", and that
-- was true of every capture the plane could make until Bob ruled that a link to
-- a Google Drive file KEEPS THE LINK while the harvest is the OpenDocument
-- export. A Drive capture is via 'direct' -- we asked Google and Google answered
-- us, with nobody in between -- and its two addresses differ anyway: the address
-- columns hold the Drive link the source page carried, and retrieval_locator
-- holds the export address the plane composed from the file id and the kind.
-- So via no longer tells a reader whether the two are equal, and a reader that
-- wants the document address must read it here rather than infer it. IC-85.
CREATE TABLE IF NOT EXISTS captured_locators (
  address_norm      TEXT NOT NULL,
  address           TEXT NOT NULL,
  capture_sha       TEXT NOT NULL,
  via               TEXT NOT NULL DEFAULT 'direct',
  retrieval_locator TEXT,
  first_retrieved   TEXT NOT NULL,
  last_retrieved    TEXT NOT NULL,
  observations      INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (address_norm, capture_sha, via)
);
CREATE INDEX IF NOT EXISTS captured_locators_addr ON captured_locators(address_norm, first_retrieved);
-- CAP-13: the page count in siteAssets and siteChrome joins on capture_sha.
CREATE INDEX IF NOT EXISTS captured_locators_sha ON captured_locators(capture_sha);
-- What the runtime was observed to COST and to ALLOW, measured rather than
-- assumed. capture_limits holds ceilings found by being refused; this holds
-- consumption found by measuring, which is a different kind of fact and the only
-- kind available for CPU.
--
-- Exceeding the CPU limit TERMINATES the isolate: there is no catchable error,
-- so no invocation can ever record its own death. Consumption is therefore
-- measured on every real run and the ceiling is found by a stepped probe whose
-- checkpoints survive the kill. peak_ms is the worst single run seen, which is
-- the number that matters for headroom; a mean would hide the run that dies.
CREATE TABLE IF NOT EXISTS runtime_observations (
  metric     TEXT PRIMARY KEY,
  peak_ms    REAL NOT NULL,
  peak_at    TEXT NOT NULL,
  peak_detail TEXT,
  last_ms    REAL NOT NULL,
  last_at    TEXT NOT NULL,
  samples    INTEGER NOT NULL DEFAULT 1,
  total_ms   REAL NOT NULL DEFAULT 0
);

-- The stepped CPU probe's durable trail. One row per step COMPLETED, so if the
-- isolate is killed during step N the table shows N-1 and the next probe knows
-- the ceiling lies between them. Nothing here is buffered until the end of the
-- request, on purpose: a buffered checkpoint is exactly the record that would be
-- lost at the moment it became interesting.
CREATE TABLE IF NOT EXISTS cpu_probe (
  step        INTEGER PRIMARY KEY,
  elapsed_ms  REAL NOT NULL,
  iterations  INTEGER NOT NULL,
  at          TEXT NOT NULL
);

-- ---- D-98: the task inbox, and the queue that makes auto-creation safe ----

-- THE PRODUCER/CONSUMER BOUNDARY, and it is a safety property rather than a
-- transport detail. Bob RULED that an undetermined-authority capture creates a
-- task automatically at capture. If the capture path wrote the task directly
-- then a leaked capture credential could put arbitrary assignees, forged
-- history and chosen subjects in front of a member. It cannot: the capture path
-- reaches only this table, every field here is already bounded at enqueue, and
-- nothing here names an assignee, a status or an actor because those are not
-- the producer's to say.
--
-- A table rather than a Cloudflare Queue, deliberately. Everything stays inside
-- the Durable Object and therefore inside the audit model, which is the same
-- reasoning that keeps the store in the DO. A Queue would buy cross-instance
-- fan-out that a sovereign single-instance record does not want.
--
-- Keyed on (kind, capture_sha) so a noisy re-capture loop cannot flood the
-- queue: re-enqueuing the same capture is a no-op, and the consumer folds the
-- event into the open task rather than spawning a duplicate. capture_sha and
-- NOT a bundle id, because at the moment of capture no bundle exists yet: the
-- consumer resolves the sha through the register once the capture is filed, and
-- an event whose capture has not been promoted simply waits.
CREATE TABLE IF NOT EXISTS task_queue (
  kind        TEXT NOT NULL,
  capture_sha TEXT NOT NULL,
  subject     TEXT NOT NULL,
  locator     TEXT,
  enqueued    TEXT NOT NULL,
  attempts    INTEGER NOT NULL DEFAULT 0,
  last_try    TEXT,
  PRIMARY KEY (kind, capture_sha)
);

-- The inbox itself, the tasks array of data/inbox.json persisted. WORKING store
-- only: an inbox is the group talking to itself about what it has NOT
-- established, which is the opposite of ratified public material, so it never
-- crosses the publication fence.
--
-- history is a JSON array, append-only by the write path, shaped exactly like a
-- member_expertise row (at, event, actor). Who a task was taken FROM is as much
-- a fact as who holds it now, so a forward appends and never rewrites.
CREATE TABLE IF NOT EXISTS tasks (
  id            TEXT PRIMARY KEY,
  kind          TEXT NOT NULL,
  refers_to     TEXT NOT NULL,
  capture_sha   TEXT,
  subject_text  TEXT NOT NULL,
  subject_desc  TEXT,
  locators      TEXT,
  assignee      TEXT NOT NULL,
  assignee_role TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'open',
  created       TEXT NOT NULL,
  resolved_at   TEXT,
  history       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS tasks_assignee ON tasks(assignee, status);
CREATE INDEX IF NOT EXISTS tasks_refers ON tasks(refers_to);
-- The RULED dedup, enforced by the store rather than remembered by the writer:
-- one LIVE task per (refers_to, kind). Live means open OR forwarded, and the
-- distinction matters: a forwarded task is still somebody's work, so excluding
-- it here would let a re-capture spawn a second task for a subject already in
-- flight, which is the flood the dedup exists to prevent. Only 'resolved' is
-- exempt, because a subject that comes back undetermined after being resolved
-- is genuinely new and not a duplicate of a closed one.
CREATE UNIQUE INDEX IF NOT EXISTS tasks_live_unique ON tasks(refers_to, kind) WHERE status IN ('open', 'forwarded');

-- ---- D-104: source reachability, and what may NOT count as a failure ----

-- The counter the archive fallback will consume. Built BEFORE the fallback
-- exists, and built to exclude governed refusals from the first line, because
-- discovering the exclusion after a spurious fallback would mean we had already
-- fetched from the Internet Archive because WE paced ourselves.
--
-- The distinction this table exists to hold: an outcome the SOURCE produced (a
-- real 4xx or 5xx from the origin, a network failure reaching it) is evidence
-- about the source. Our own governor declining to ask is not evidence about
-- anything except our politeness. Only the first kind moves
-- consecutive_failures.
--
-- governed_refusals is counted anyway, in its own column, rather than dropped.
-- A number that is deliberately excluded from a decision should still be
-- visible, or the exclusion cannot be audited and a future reader cannot tell a
-- source nobody could reach from a source nobody asked.
--
-- Keyed on address_norm, the same normalised document address captured_locators
-- keys on, so reachability is a property of the DOCUMENT rather than of a host:
-- one page can be gone while the rest of a site answers.
CREATE TABLE IF NOT EXISTS source_reachability (
  address_norm         TEXT PRIMARY KEY,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  attempts             INTEGER NOT NULL DEFAULT 0,
  failures_total       INTEGER NOT NULL DEFAULT 0,
  governed_refusals    INTEGER NOT NULL DEFAULT 0,
  last_success         TEXT,
  last_failure         TEXT,
  last_outcome         TEXT,
  last_status          INTEGER,
  first_failure_since  TEXT,
  updated_at           TEXT
);
CREATE INDEX IF NOT EXISTS source_reach_failing ON source_reachability(consecutive_failures);

-- CAP-4: the verdict on a REUSED subresource, APPENDED and dated, never
-- overwritten, the same append-only discipline link_verdicts follows and for the
-- same reason: a verdict that changed is itself a fact about the record, so the
-- current answer is the newest row and the older rows are how anyone tells
-- whether it was always this answer.
--
-- Two producers write here, and the phase column says which. POSTHOC detection
-- is free and unconditional (CAPTURE-SCALING item 6a): when a later direct
-- capture of a host fetches an asset whose bytes differ from the stored ones,
-- every earlier capture that REUSED the old bytes is named here as 'changed' at
-- zero request cost. RATIFY re-fetches every reused part with a PLAIN GET
-- (item 6b/6c) -- our own SHA-256 over what we received is the evidence, where a
-- 304 would be only the origin's assertion -- and records one of four outcomes:
--   confirmed      the re-fetch matched the reused bytes; the strongest claim.
--   changed        the source now serves something else; ratified with the bytes
--                  captured on the day, the divergence a dated fact.
--   unavailable    the source no longer answers; ratified with the bytes
--                  captured, the record now holding what nobody can re-fetch.
--   not_attempted  the invocation's re-fetch budget (the calibrated capture_limits
--                  ceiling, item 6d) could not reach this part; recorded WITH its
--                  reason, never silently omitted.
-- All four are valid ratifications. What is forbidden is ratifying with a reused
-- part and saying nothing: the mandatory part is the ATTEMPT and the RECORD, not
-- the agreement. source_capture is the primary_sha of the capture that reused the
-- part; bundle_id is set for a ratify verdict and null for a posthoc one, which
-- happens at capture time when no bundle exists yet.
CREATE TABLE IF NOT EXISTS reuse_verdicts (
  source_capture TEXT NOT NULL,
  bundle_id      TEXT,
  host           TEXT NOT NULL,
  address_norm   TEXT NOT NULL,
  phase          TEXT NOT NULL,
  verdict        TEXT NOT NULL,
  reused_sha     TEXT NOT NULL,
  observed_sha   TEXT,
  basis          TEXT NOT NULL,
  at             TEXT NOT NULL,
  PRIMARY KEY (source_capture, address_norm, phase, at)
);
CREATE INDEX IF NOT EXISTS reuse_verdicts_bundle ON reuse_verdicts(bundle_id);
CREATE INDEX IF NOT EXISTS reuse_verdicts_pair ON reuse_verdicts(source_capture, address_norm);
-- 2026-09-14, REC-81: every citation into the content framework in this file names a
-- SECTION rather than a line. The line numbers they carried went stale the moment the
-- framework gained front matter -- 89 lines, measured -- and CORPUS-STANDARD.md
-- section 4.6 rules that a citation into a design document names the SECTION.
-- CONSTRUCTS Step 3 (FW-5): READINGS ARE PERSISTED. A reading is what a content
-- type's parse() found in a captured document -- its entities plus document-level
-- facts (BIO_Content_Framework_v0_10.md §7). op=acquire runs the resolved
-- doctype's reader over the captured text and carries the reading on the acquire
-- document; op=promote DERIVES it from data/provenance.json and persists it here,
-- in the SAME transaction that writes the register row and the refs projection it
-- sits beside -- the same discipline refs follow, so the table is a projection of
-- the document rather than a second place to state it. One row per captured
-- document, keyed by the capture identity (register.capture_sha, I1 section 1).
-- found is 0 for a FAILED or EMPTY reading, recorded HONESTLY as such: a reader
-- that finds nothing is a failed reader, never an emptied document (framework §7),
-- so an empty reading is a fact about the reader and is never backfilled with
-- invented entities. reading holds the whole reading as JSON. DERIVED from the
-- corpus, so a whole-store purge clears it (D-113).
CREATE TABLE IF NOT EXISTS readings (
  capture_sha    TEXT PRIMARY KEY,
  bundle_id      TEXT NOT NULL,
  content_type   TEXT,
  reader_version INTEGER,
  found          INTEGER NOT NULL DEFAULT 0,
  entity_count   INTEGER NOT NULL DEFAULT 0,
  reading        TEXT NOT NULL,
  at             TEXT,
  -- D-440 (EXTRACTION-BREADTH-DESIGN.md section 3.2). The capture's FORMAT key as
  -- its provenance document's profile recorded it (detectFormat, magic bytes
  -- first and the declared Content-Type second), projected at op=promote from the
  -- SAME data/provenance.json the reading is. It answers one question, asked by
  -- contentContextFor: is this capture an office container, whose own bytes can
  -- hold an embedded media part. NULLABLE AND NEVER BACK-FILLED: NULL means the
  -- provenance document carried no format, and the reader falls back to the
  -- reading's own text_container, then states the kind UNDETERMINED.
  capture_format TEXT
);
CREATE INDEX IF NOT EXISTS readings_bundle ON readings(bundle_id);
-- The entity-reference index: one row per entity a reading carries, keyed by the
-- reference AS IT APPEARS in the reading -- the raw, source-assigned kind:key (an
-- id in a URL is a key, a position in a list is not), e.g. meeting:2101. It is NOT
-- a canonical entity id: resolving a reference to a canonical entity, and the
-- subject registry, are Step 4 / D-83 and are deliberately not built here. This is
-- what makes "which documents' readings carry this reference" one indexed lookup,
-- the reverse index Step 4 consumes. Also DERIVED from the corpus; a whole-store
-- purge clears it (D-113).
-- FW-17 / IC-86: WHERE THE REFERENCE WAS READ, in IC-1's element-reference
-- vocabulary and no other. The three columns move together -- a row has all
-- three or none -- so a half-written position can never read as a whole one.
-- NULL IS A STATEMENT AND NOT A DEFAULT: it means THIS READING CANNOT SAY WHERE,
-- never that the whole document was meant. A member's citation naming no part
-- means the whole document (Bob, 2026-09-14, 5.3), and that is a member's act of
-- citation, not a reader's silence -- collapsing the two would let a reader's
-- shortcoming read as a member's choice. The reading's own basis says WHOSE
-- absence it is, so the null is never bare.
-- The column arrives WITH its writer (schema.mjs's own standing rule): the
-- agenda reader emits a position and op=promote projects it in the same landing.
CREATE TABLE IF NOT EXISTS reading_refs (
  capture_sha  TEXT NOT NULL,
  bundle_id    TEXT NOT NULL,
  ref          TEXT NOT NULL,
  ref_kind     TEXT,
  ref_key      TEXT,
  label        TEXT,
  pos_kind     TEXT,   -- IC-1's discriminator: pdf-page | sheet-cell | slide-shape | doc-para
  pos          TEXT,   -- the per-arm fields as canonical JSON, key-ordered so two reads of one place compare equal
  pos_ref      TEXT,   -- IC-1's REQUIRED human form, produced by the container that knows it
  PRIMARY KEY (capture_sha, ref)
);
CREATE INDEX IF NOT EXISTS reading_refs_ref ON reading_refs(ref);
CREATE INDEX IF NOT EXISTS reading_refs_bundle ON reading_refs(bundle_id);
-- REC-36: the NAME index -- one row per normalised TERM of a reference's label,
-- which is what makes the framework section 8.1 GRADE-C tier (a document that
-- mentions a subject by NAME, carrying no reference the source assigned) an
-- indexed lookup instead of a corpus scan. Before this, reading_refs had an index
-- on ref and none on label, so a name-only mention was unreachable from any
-- member surface and REC-18's earned grades were bounded to exact references.
--
-- WHY TERMS AND NOT A NORMALISED LABEL COLUMN, and it is MEASURED, not preferred
-- (MEASUREMENTS.md 2026-08-04, REC-36; instrument test/label-variance-probe.mjs).
-- Over the one real captured document this repository holds -- a 33-page Oakland
-- Legistar agenda read by the real doctype -- a subject name was the WHOLE label
-- in 0 of 41 labels against 33 names taken from the document itself. The label is
-- the document ITEM's title ("Contract Agreement For James Beere As Oakland Police
-- Chief"), and the name is EMBEDDED in it. A column holding the normalised whole
-- label, however carefully folded, would have answered nothing. Requiring every
-- term of a name to be present found 15 -- exactly what a substring scan found --
-- so the indexable form loses nothing against the scan it replaces, at a measured
-- 305 rows for that whole document.
--
-- term is the case-folded, whitespace-collapsed, punctuation-split form produced
-- by the SAME normaliser entity_aliases.alias_norm keys on (Store labelTerms over
-- normAlias). One function, so the two sides of the join cannot drift; a term
-- projection that folded differently from the alias index would silently stop
-- matching and nothing would fail.
--
-- bundle_id is carried so the D-15 viewer gate applies IN SQL at the lookup --
-- a candidate the viewer may not see is not a candidate and its row is withheld,
-- not merely redacted. DERIVED from the corpus like readings/reading_refs, so a
-- whole-store purge clears it (D-113) and a re-promotion replaces it.
-- REC-40: THE SAME INDEX NOW CARRIES THREE TERM SOURCES, AND src IS PART OF
-- THE KEY. REC-36 indexed the label alone, which made op=readingname answer on
-- the NAME a reading recorded while op=readingref answered on the REFERENCE
-- STRING -- so the framework 8.1 A and B tiers (a document whose reference, or
-- whose reference KEY, is spelled like a subject's registered name) were
-- proposable only by a caller who already knew the exact string to ask for, and
-- after UI-26 traded away the per-name loop they were proposable from no surface
-- at all. #recognise reads THREE strings and grades them A (ref), B (ref_key)
-- and C (label); an index carrying one of the three answers one of the three.
--
-- WHY THE SAME TABLE AND NOT A SIBLING, by this project's own test (D4 as REC-42
-- and REC-44 applied it): a term of an identifier needs NO ORDINAL of its own --
-- it is keyed by exactly what a label term is keyed by, it has no ordering, no
-- lifecycle and no identity apart from the reading_refs row it is derived from
-- and dies with -- and NO QUERY IS KEYED ON IT SEPARATELY. There is one question
-- ("every term of this registered name present within one reference's one
-- source") and REC-40's whole requirement is that ONE call answer every tier, so
-- a second table would force either a UNION of two compound arms -- toward D-36's
-- five-compound workerd ceiling -- or two statements, which is the N-call shape
-- this item exists to remove.
--
-- WHY src IS IN THE PRIMARY KEY, and it is a CORRECTNESS requirement rather
-- than a way of labelling the answer: the lookup is a SUBSET test (every term of
-- the name present in one group). If the label's terms and the reference's terms
-- shared a group, a registered name could be satisfied by a MIX -- one word taken
-- from the document's title and another from its reference string -- manufacturing
-- a correspondence that NEITHER string made. That puts a wrong subject on a
-- document, which is the direction the diacritic decision below already refuses
-- to take. So the group is (capture_sha, ref, src) and a mixed match is
-- structurally impossible rather than filtered out afterwards.
--
-- src is label, ref or key, and key is written only when the reference
-- key normalises to something different from the whole reference -- the same
-- guard #recognise applies before it considers the B tier, so the index and
-- the recogniser cannot disagree about whether a B tier exists.
CREATE TABLE IF NOT EXISTS reading_ref_terms (
  capture_sha  TEXT NOT NULL,
  bundle_id    TEXT NOT NULL,
  ref          TEXT NOT NULL,
  src          TEXT NOT NULL,
  term         TEXT NOT NULL,
  PRIMARY KEY (capture_sha, ref, src, term)
);
CREATE INDEX IF NOT EXISTS reading_ref_terms_term ON reading_ref_terms(term);
CREATE INDEX IF NOT EXISTS reading_ref_terms_bundle ON reading_ref_terms(bundle_id);
-- CONSTRUCTS Step 4, SLICE A (FW-6): the SUBJECT REGISTRY, which IS the framework's
-- entity axis. Built ONCE (D-83): the bias doctrine's subject registry
-- (BIO_Declared_Bias_v0_1.md safeguard 4) and the framework's entity axis
-- (BIO_Content_Framework_v0_10.md section 8) are the SAME construct, and the live
-- risk D-83 names is building them twice. An ENTITY is a thing the case is about
-- which OUTLIVES any document that mentions it (framework §3) and, in the doctrine,
-- a SUBJECT a bias statement addresses (safeguard 4). It is RESOLVED across
-- documents, not extracted from one (framework §3); that resolution -- matching a
-- reading_refs reference (FW-5) to an entry here -- is the NEXT slice, not this one.
--
-- kind: safeguard 4 names four SUBJECT kinds (source, institution, office,
-- movement); the framework's entity axis names more (person, body, ordinance,
-- parcel, contract, fund). The vocabulary here is their UNION and is validated at
-- the write path (store.createEntity KNOWN_KINDS), because a registry admitting only
-- the four could not carry the ordinance or contract the framework must graph, and
-- D-83 says the construct is built ONCE. Whether a bias STATEMENT may take a person
-- or an ordinance as its subject -- or only the four named kinds -- is the reviewable
-- question DEC-6 leaves open for Bob; the registry admits the kind either way, so
-- nothing is blocked on the answer.
--
-- entity_id is the allocated canonical key an entry is retrieved BY (op=entity);
-- label is its canonical name; declared_by and at record who fixed the entry and
-- when, because an entity here is a member-declared act, not a corpus derivation.
-- Unlike readings/reading_refs this is FIRST-CLASS, member-declared state, not a
-- projection of the corpus -- but op=purge is the scratch-reset tool, so a
-- whole-store purge clears it like selections and every other instance-scoped table
-- (D-113); a per-bundle purge deliberately leaves it, as it has no bundle_id.
CREATE TABLE IF NOT EXISTS entities (
  entity_id   TEXT PRIMARY KEY,
  kind        TEXT NOT NULL,
  label       TEXT NOT NULL,
  note        TEXT,
  declared_by TEXT,
  at          TEXT
);
CREATE INDEX IF NOT EXISTS entities_kind ON entities(kind);
-- ALIASES are FIRST-CLASS and per entity (safeguard 4). An entry is retrievable by
-- any of its names, not only its canonical one, so an entity's canonical label is
-- ALSO seeded here as an alias (canonical=1) and op=entitybyalias finds it. alias is
-- the name as declared; alias_norm is the case-folded, whitespace-collapsed form the
-- reverse lookup keys on. The PRIMARY KEY makes one entity carry a normalised name
-- once; the same alias_norm may recur across DIFFERENT entities (a genuinely
-- ambiguous name), and op=entitybyalias returns every match rather than pretending
-- the ambiguity away. Cleared by a whole-store purge with its entity (D-113).
CREATE TABLE IF NOT EXISTS entity_aliases (
  entity_id   TEXT NOT NULL,
  alias       TEXT NOT NULL,
  alias_norm  TEXT NOT NULL,
  canonical   INTEGER NOT NULL DEFAULT 0,
  declared_by TEXT,
  at          TEXT,
  PRIMARY KEY (entity_id, alias_norm)
);
CREATE INDEX IF NOT EXISTS entity_aliases_norm ON entity_aliases(alias_norm);
CREATE INDEX IF NOT EXISTS entity_aliases_entity ON entity_aliases(entity_id);
-- DECLARED RELATIONS between entries: proxy_for, member_of, overlaps (safeguard 4),
-- each carrying a justification and a citation "like a pattern statement" -- the
-- statement anatomy of BIO_Declared_Bias_v0_1.md (a required justification, a
-- citation), both NOT NULL here so a relation cannot be declared un-justified or
-- un-cited, exactly as safeguard 4 requires ("each relation justified and citable").
--
-- THERE IS DELIBERATELY NO GRADE COLUMN, and its ABSENCE is the point (D-83). A
-- declared relation is CONSTITUTIVE, not evidentiary: the group is FIXING what its
-- own statements mean, not claiming something checkable about the world. So it sits
-- OUTSIDE the framework's section 8.1 A-to-D connection grade, which states how a
-- connection's provenance was ESTABLISHED. Grading a constitutive relation Grade D
-- ("asserted on the member's stated basis, with no captured document") is the
-- category error D-83 names explicitly: it is not weak evidence, it is not
-- evidence at all. The enforcement is structural
-- -- there is simply no field to carry a grade -- rather than a convention a later
-- writer could forget; entityregistry.test.mjs asserts a read relation exposes none.
-- Constitutive, member-declared, first-class; cleared by a whole-store purge (D-113).
CREATE TABLE IF NOT EXISTS entity_relations (
  relation_id   TEXT PRIMARY KEY,
  from_entity   TEXT NOT NULL,
  to_entity     TEXT NOT NULL,
  relation      TEXT NOT NULL,
  justification TEXT NOT NULL,
  citation      TEXT NOT NULL,
  declared_by   TEXT,
  at            TEXT
);
CREATE INDEX IF NOT EXISTS entity_relations_from ON entity_relations(from_entity);
CREATE INDEX IF NOT EXISTS entity_relations_to ON entity_relations(to_entity);
-- CONSTRUCTS Step 4, SLICE B (FW-7): the RESOLUTIONS. A resolution is the RECOGNISER's
-- act of matching one raw reading_refs reference (FW-5, a source-assigned kind:key
-- carried by a captured document's reading) to a registry ENTITY (FW-6), and DECLARING
-- THE METHOD -- which IS the framework's section 8.1 connection grade. It is what turns
-- "which documents carry this raw reference" (FW-5's reverse index over the unresolved
-- kind:key) into "every document that concerns this ENTITY" (the reverse index this
-- table delivers), the single largest manual task the framework removes.
--
-- grade states HOW the reference was matched, and NOTHING else (framework 8.1):
--   A -- the source's own identifier: the reference is the source's composite key
--        (kind:key), matched exactly to a registered identifier of the entity, at both
--        ends captured+hashed. The publisher names this subject by this key.
--   B -- an identifier the source USES, matched exactly in captured content at both
--        ends: the bare key matched a registered identifier, but not as the source's
--        own composite addressing key.
--   C -- correspondence, not identity: a name/title matched an entity ALIAS. Plausible,
--        NEVER presented as established, and FLAGGED for a member to confirm (an
--        equality that costs nothing to produce is not evidence, CLAUDE.md).
--   D -- asserted on the member's stated basis, with no captured document: member
--        TESTIMONY, recorded with an author, a date and the basis stated (D-219).
--        The RECOGNISER never mints a D (op=resolve produces only A/B/C), the
--        model holds it so a member can testify (op=resolvetestify), never the machine.
-- established is derived from grade at write time -- 1 for A/B, 0 for C/D -- so a C can
-- NEVER be read back as established (the column carries the flag structurally, not by a
-- caller's restraint). needs_confirmation is the read-side face of a C.
--
-- Grade is IMPROVABLE (framework 8.1: a C becomes B when a shared identifier is later
-- found in both ends, A when the source links them). The row is keyed
-- (capture_sha, ref, entity_id) so a RE-resolution that finds a stronger basis RAISES
-- the grade+method IN PLACE (raised_from records the prior grade), never a second row
-- and never a downgrade -- the resolution is not frozen. A DECLARED relation (FW-6) is
-- constitutive, sits OUTSIDE this grade, and is NEVER traversed to resolve a reference:
-- the recogniser matches a reference to an entity's own aliases only, never THROUGH a
-- proxy_for/member_of/overlaps edge.
--
-- DERIVED from the corpus (keyed by a capture and carrying its bundle_id), so a
-- whole-store purge AND a per-bundle purge clear it (D-113); it is in op=purge's TABLES.
CREATE TABLE IF NOT EXISTS resolutions (
  capture_sha  TEXT NOT NULL,
  bundle_id    TEXT NOT NULL,
  ref          TEXT NOT NULL,
  entity_id    TEXT NOT NULL,
  grade        TEXT NOT NULL,
  method       TEXT NOT NULL,
  basis        TEXT,
  established  INTEGER NOT NULL DEFAULT 0,
  raised_from  TEXT,
  resolved_by  TEXT,
  at           TEXT,
  PRIMARY KEY (capture_sha, ref, entity_id)
);
CREATE INDEX IF NOT EXISTS resolutions_entity ON resolutions(entity_id);
-- D-222 (ii) / PL-8: GRADE BECOMES A FILTER. The C tier above is explicitly "FLAGGED
-- for a member to confirm" and nothing in the record could enumerate the flagged set --
-- a queue of work the system creates and cannot list. resolves:C is that question and
-- resolves:>=B is its range form; bundle_id is in the index so both seeks are COVERING.
-- MEASURED 2026-08-07 (test/meaning-index-probe.mjs):
--   resolves:C     14.35 ms -> 8.45 ms at 20,000 bundles   (-41.1%)
--                  83.74 ms -> 48.65 ms at 100,000 bundles (-41.9%)
--   resolves:>=B   -20.9% / -20.4%
-- This table is the largest of the three (one row per reference per entity, five per
-- bundle in the probe's proportions), which is why the saving here is the one that
-- still matters in absolute milliseconds at scale.
-- NO INDEX ON connections(grade), stated rather than left: D-222 named it beside this
-- one, and no arm in this compiler reads it -- concerns joins resolutions, which is the
-- base relation a connection is DERIVED from (both ends of every connection have a
-- resolution row for the shared entity, which meaningquery.test.mjs demonstrates rather
-- than assumes). An index nothing queries is write cost on D-224's k(k-1)/2 curve for
-- no read at all. It is earned when an arm reads it.
CREATE INDEX IF NOT EXISTS resolutions_grade ON resolutions(grade, bundle_id);
CREATE INDEX IF NOT EXISTS resolutions_capture ON resolutions(capture_sha);
CREATE INDEX IF NOT EXISTS resolutions_bundle ON resolutions(bundle_id);
-- CONSTRUCTS Step 5, SLICE A (FW-8): CONNECTIONS AS DATA, carrying a GRADE (D-67
-- storage + D-72 grade). A connection links TWO captured documents that resolve to
-- the SAME registry entity: two documents concerning one subject is the raw material
-- of a connection (framework section 8). It is DERIVED from resolutions (FW-7) -- built
-- UNDER the reverse-index join documentsConcerning already makes, not a parallel path.
--
-- The connection's GRADE is the framework section 8.1 method-as-grade FW-7 computes per
-- resolution, applied to the two-node base case of section 8.2's "a progression instance
-- inherits the WEAKEST connection grade along its chain": a connection's grade is the
-- WEAKER of how its two ends resolved to the shared entity. a_grade / b_grade record how
-- each end resolved (the strongest resolution of that capture to that entity); grade is
-- min(a_grade, b_grade) by section-8.1 rank (A strongest .. D weakest). A case is only as
-- strong as its weakest link, so a connection is no stronger than its weaker end.
-- established is DERIVED from the WEAKER grade (1 only when BOTH ends are A/B), so a
-- connection resting on a C correspondence at either end can NEVER read back as
-- established -- the section-8.1 rule that an equality costing nothing is not evidence,
-- enforced structurally at both ends.
--
-- asserted_by is THREE-VALUED and is NOT the grade (framework §8.1 -- the author says WHO
-- claims the connection, the grade says WHAT would be needed to CHECK it). Domain:
--   'system' -- the framework INFERRED the connection from the two resolutions (what
--              op=connect writes: the rule is the system's, even if an underlying
--              resolution was a member's grade-D testimony);
--   'source' -- the source itself linked the two documents (a links_to edge, asserted_by
--              source; NOT produced here -- reserved so a source-asserted connection is a
--              distinct fact, not a repeat of a system inference);
--   'member' -- a member asserted the connection directly (reserved for slice B).
-- Only 'system' is written in slice A; the column carries the axis so the three authors
-- of a connection stay distinct from its grade, as D-67 requires.
--
-- Keyed (a_capture_sha, b_capture_sha, entity_id) with the pair stored in canonical
-- order (a_capture_sha < b_capture_sha), so (X,Y) and (Y,X) are ONE connection, never
-- two. A re-derivation after a resolution's grade is RAISED (FW-7 grade is improvable)
-- upserts the connection IN PLACE, so a connection is improvable too. DERIVED from the
-- corpus and carrying BOTH ends' bundle ids, so a per-bundle purge (EITHER end matches)
-- and a whole-store purge both clear it (D-113); op=purge deletes it explicitly in both
-- arms (it has no single bundle_id, so it is NOT in purge's bundle_id TABLES list).
-- PROGRESSION INSTANCES -- an actual N-stage chain of real documents threaded by an
-- entity, and weakest-grade inheritance along a chain longer than two -- are SLICE B;
-- this table is the two-node base case only.
-- FW-17 / D-161 / Bob's 5.4, 2026-09-14: THE DETERMINING REFERENCE PAIR.
-- Both documents refer to the ordinance -- that is how each was identified -- so
-- the connection points at the SPECIFIC REFERENCE IN EACH, and not at all the
-- supporting mentions. The pair is the reference on each side that DETERMINED
-- the grade: the strongest resolution of that capture to the entity, which is
-- the same collapse op=concerns and op=connect already make, so the pair can
-- never disagree with the grade beside it.
-- Until FW-17 this row kept the two grades and threw the references away, which
-- is what made following a connection land a reader on a whole document (D-161,
-- Part II section 17's REFER row).
-- THE POSITION HALF IS NULLABLE AND ITS ABSENCE IS THE POINT. a_ref/b_ref are
-- recoverable from resolutions today; the POSITIONS come from reading_refs and
-- exist only where the reader could say where (FW-17's first half, IC-86). A
-- pair with no positions is a real pair that cannot place itself, and a portion
-- leg asking it for a connection grade gets UNDETERMINED and STATED -- per pair,
-- never assumed for the connection as a whole.
-- REC-120 / D-161 act (2), 2026-09-18: THE PAIR SAYS HOW IT WAS SELECTED, because
-- it is the STRONGEST-GRADED mention and not the ON-POINT one Bob ruled (5.4 second
-- pass, FW-21 measured M-51). pair_rule names the selection and its tie-break
-- ('strongest-graded/first-reference-by-sort'). NULL on a row derived before REC-120,
-- whose ties went to the scan's row order -- not a basis, and stated as such by the
-- read rather than backfilled, since the rule that produced it cannot be recovered.
CREATE TABLE IF NOT EXISTS connections (
  a_capture_sha TEXT NOT NULL,
  b_capture_sha TEXT NOT NULL,
  entity_id     TEXT NOT NULL,
  a_bundle_id   TEXT NOT NULL,
  b_bundle_id   TEXT NOT NULL,
  a_grade       TEXT NOT NULL,
  b_grade       TEXT NOT NULL,
  grade         TEXT NOT NULL,
  established   INTEGER NOT NULL DEFAULT 0,
  asserted_by   TEXT NOT NULL,
  basis         TEXT,
  at            TEXT,
  a_ref         TEXT,  -- the determining reference on end A, AS IT APPEARED (Ord. No. 13,579)
  a_pos_kind    TEXT,  -- and WHERE it was read, in IC-1's vocabulary. NULL = the reading could not say
  a_pos         TEXT,
  a_pos_ref     TEXT,
  b_ref         TEXT,  -- the same three facts for end B
  b_pos_kind    TEXT,
  b_pos         TEXT,
  b_pos_ref     TEXT,
  pair_rule     TEXT,  -- REC-120: HOW the pair was selected. NULL = derived before REC-120, when ties went to scan order
  PRIMARY KEY (a_capture_sha, b_capture_sha, entity_id)
);
CREATE INDEX IF NOT EXISTS connections_entity ON connections(entity_id);
CREATE INDEX IF NOT EXISTS connections_a ON connections(a_capture_sha);
CREATE INDEX IF NOT EXISTS connections_b ON connections(b_capture_sha);
CREATE INDEX IF NOT EXISTS connections_a_bundle ON connections(a_bundle_id);
CREATE INDEX IF NOT EXISTS connections_b_bundle ON connections(b_bundle_id);
-- REC-122 / D-161 act (3) / IC-232, 2026-09-23: A MEMBER'S CHOICE OF THE ON-POINT
-- MENTION on one end of a connection (Bob's 5.4 second pass: specificity is worked
-- for, not merely permitted). The connection's own pair stays the machine's
-- strongest-graded selection and is NEVER rewritten by a choice -- a re-derivation
-- would overwrite it, and the machine's selection and a member's judgment are two
-- facts. So the choice lives beside the row, keyed by the connection's own primary
-- key plus the END ('a' or 'b') it is about, and names the mention by its reference
-- exactly as the reading recorded it (resolutions.ref). APPEND-ONLY: a re-choice
-- stamps superseded_at on the current row and writes a new one, so the old is
-- retained (REC-86's rule). superseded_at NULL = the current choice. The two bundle
-- ids are carried so a per-bundle purge clears a choice with the connection it is
-- about (D-113). No position is stored: WHERE the mention was read is the reading's
-- fact (reading_refs), read at answer time, so a choice cannot freeze a position the
-- record later corrects.
CREATE TABLE IF NOT EXISTS connection_pair_choices (
  choice_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  a_capture_sha TEXT NOT NULL,
  b_capture_sha TEXT NOT NULL,
  entity_id     TEXT NOT NULL,
  side          TEXT NOT NULL,  -- which end the choice is about, a or b
  ref           TEXT NOT NULL,  -- the chosen mention, as resolutions.ref holds it
  a_bundle_id   TEXT,
  b_bundle_id   TEXT,
  chosen_by     TEXT NOT NULL,  -- the member, stamped by the control plane
  at            TEXT NOT NULL,
  superseded_at TEXT            -- NULL = current, else when a later choice replaced it
);
CREATE INDEX IF NOT EXISTS connection_pair_choices_end ON connection_pair_choices(a_capture_sha, b_capture_sha, entity_id, side);
-- CONSTRUCTS Step 5, SLICE A (FW-8): the PROGRESSION DEFINITION as data (framework
-- section 8.2, "generalises the connection table rather than sitting beside it"). A
-- definition is a named ordered set of STAGES with the rules a progression's junction
-- checks need: after, cardinality, interval, required-ness. This is DATA in the record,
-- not cases in a switch, so the set can be authored and (later) edited through a UI.
-- BOTH of Bob's example progressions must be expressible as rows here -- the meeting
-- chain (meeting -> agenda -> minutes) AND the procurement chain (need -> award ->
-- signed contract) -- or the generalisation has not been made (the acceptance).
--
-- A progression definition is a CLAIM the group is making about how its institutions
-- OUGHT to behave (framework 8.1's connection-table note 3), so it is FIRST-CLASS
-- member-declared state carrying its author and date -- like the subject registry
-- (entities), NOT a projection of the corpus. So a whole-store purge (the scratch-reset
-- tool) clears it, but a per-bundle purge leaves it (it has no bundle_id). The connection
-- table above is the TWO-STAGE case of this one (framework: "a connection row is a
-- progression of two stages; nothing needs both"); they are one construct at two
-- generalities, not two tables beside each other.
CREATE TABLE IF NOT EXISTS progression_defs (
  progression_key TEXT PRIMARY KEY,
  label           TEXT NOT NULL,
  note            TEXT,
  declared_by     TEXT,
  at              TEXT
);
-- The ordered STAGES of a progression definition. after_stage names the stage this one
-- PRESUPPOSES (framework 8.2: "read forwards it predicts; read backwards it accuses" --
-- the MISSING PREDECESSOR is slice B), NULL for the first stage. cardinality is 1 / 0..1
-- / 0..n (an RFP has many responses; an award has one contract). within_interval is the
-- clock that makes an absence OVERDUE rather than pending (NULL = no clock). required is
-- always / usually / sometimes / never / unless_exception (a lawful skip needs an
-- exception document -- slice B). stage_no is the ordinal, so the stages read in order
-- without depending on after_stage forming a single line (a real chain can branch).
-- Keyed (progression_key, stage_key). Cleared with its definition by a whole-store purge.
CREATE TABLE IF NOT EXISTS progression_stages (
  progression_key TEXT NOT NULL,
  stage_key       TEXT NOT NULL,
  stage_no        INTEGER NOT NULL,
  label           TEXT,
  after_stage     TEXT,
  cardinality     TEXT NOT NULL,
  within_interval TEXT,
  required        TEXT NOT NULL,
  PRIMARY KEY (progression_key, stage_key)
);
CREATE INDEX IF NOT EXISTS progression_stages_key ON progression_stages(progression_key);
-- D-128 (framework 8.2, The declared flow and its revisions, BOB #27 2026-09-22): a definition is
-- APPEND-ONLY. The two tables above are the CURRENT version, the one every instance and finding
-- is derived against, and these two hold EVERY version ever declared, never updated and never
-- deleted but by a whole-store purge. A revision writes version N+1 carrying its author, date and
-- BASIS (the member's statement and a citation, the anatomy an exception document carries); the
-- prior version stands and reads back through op=progression with version=N. A definition
-- declared before D-128 has no rows here -- the store reads it as version 1 with its basis NOT
-- RECORDED, and its first revision writes that version here first, verbatim from the tables above.
-- basis_statement and basis_citation are NULL when the declaring member stated none, which only a
-- FIRST version may do; a revision is refused without both.
CREATE TABLE IF NOT EXISTS progression_def_versions (
  progression_key TEXT NOT NULL,
  version         INTEGER NOT NULL,
  label           TEXT NOT NULL,
  note            TEXT,
  declared_by     TEXT,
  at              TEXT,
  basis_statement TEXT,
  basis_citation  TEXT,
  PRIMARY KEY (progression_key, version)
);
CREATE TABLE IF NOT EXISTS progression_stage_versions (
  progression_key TEXT NOT NULL,
  version         INTEGER NOT NULL,
  stage_key       TEXT NOT NULL,
  stage_no        INTEGER NOT NULL,
  label           TEXT,
  after_stage     TEXT,
  cardinality     TEXT NOT NULL,
  within_interval TEXT,
  required        TEXT NOT NULL,
  PRIMARY KEY (progression_key, version, stage_key)
);
-- CONSTRUCTS Step 5, SLICE B (FW-9): a PROGRESSION INSTANCE -- an actual N-stage chain of
-- REAL captured documents threaded through a definition's stages by a THREADING ENTITY (a
-- contract number, a project id, a fund). Framework 8.2: "an instance of a progression is
-- assembled by following an entity" -- which is why the entity axis is Step 4 and this is
-- Step 5. Each row is ONE captured document placed at ONE stage of ONE instance; the
-- instance is all rows sharing (progression_key, entity_id). The INSTANCE GRADE (the
-- weakest connection along the chain, framework 8.2's D-73 pair->chain generalised beyond
-- FW-8's two-node base case) and the MISSING-PREDECESSOR findings are DERIVED on read from
-- these rows plus the definition -- NEVER stored as a grade that could go stale, so an
-- instance read reflects the live definition and the documents still held (undetermined is
-- honest; a grade is never invented). grade here is the DOCUMENT's own end-grade: the
-- STRONGEST 8.1 resolution of THIS capture to the threading entity (the same collapse
-- op=concerns and op=connect make), so a placement records how well its document is tied to
-- the subject, and the chain math takes the weaker end of each consecutive pair.
--
-- A placement is only admitted for a document that ACTUALLY resolves to the threading
-- entity (FW-7): a document that does not concern the entity cannot be threaded on it (an
-- equality a caller can hand us is one a caller can invent). Which STAGE a document fills is
-- the member's authored judgment (this document is the award, that one the contract), so
-- threaded_by is stamped server-side; the GRADE is the record's, never the caller's.
--
-- DERIVED-from-the-corpus and carrying bundle_id, so it clears in BOTH purge arms exactly
-- as resolutions do (it is in op=purge's TABLES): a per-bundle purge removes that document's
-- placements and the instance honestly re-reads with that stage now unfilled, and a
-- whole-store purge takes them all (D-113). EXCEPTION documents that discharge a lawful
-- skip, JUNCTION checks as findings, and the SCHEDULED task that walks this table for
-- missing predecessors are DEFERRED past FW-9.
CREATE TABLE IF NOT EXISTS progression_instances (
  progression_key TEXT NOT NULL,
  entity_id       TEXT NOT NULL,
  stage_key       TEXT NOT NULL,
  capture_sha     TEXT NOT NULL,
  bundle_id       TEXT NOT NULL,
  grade           TEXT NOT NULL,
  threaded_by     TEXT,
  at              TEXT,
  PRIMARY KEY (progression_key, entity_id, stage_key, capture_sha)
);
CREATE INDEX IF NOT EXISTS progression_instances_key ON progression_instances(progression_key, entity_id);
CREATE INDEX IF NOT EXISTS progression_instances_bundle ON progression_instances(bundle_id);
CREATE INDEX IF NOT EXISTS progression_instances_capture ON progression_instances(capture_sha);
-- CONSTRUCTS Step 5, SLICE C (FW-10): an EXCEPTION DOCUMENT that discharges a LEGITIMATE SKIP
-- (framework 8.2: "a sole-source award skips the solicitation stage lawfully ... a skipped
-- stage with no exception document is [a finding]. The table records which document discharges
-- which skip"). A row is a REAL captured document, threaded onto ONE progression instance and
-- NAMING the ONE stage it discharges, carrying a reason and a citation -- the justification an
-- institution is supposed to publish for the skip, the same statement anatomy FW-8's declared
-- relations carry (justification + citation, both NOT NULL). Keyed
-- (progression_key, entity_id, stage_key, capture_sha) so a stage may be discharged by several
-- documents and re-recording the same document at a stage UPSERTS in place.
--
-- A discharge must be EARNED, enforced by the write path (op=discharge), never by a caller's
-- bare assertion (an equality a caller can hand us is one a caller can invent): the document
-- must ACTUALLY resolve to the threading entity (FW-7) -- refused NOT_CONCERNED otherwise, the
-- same gate op=thread uses -- and must name a REAL stage of the definition (BAD_STAGE
-- otherwise). Whether the discharge APPLIES is derived ON READ in #assembleInstance: only a
-- REQUIRED stage that is actually MISSING is discharged (rendered a distinct "discharged"
-- state carrying this reason/citation, never a gap and never silently absent); an exception
-- naming a stage that is not missing discharges nothing (the stage is present, so there is no
-- skip to discharge). Derived findings inform, they do not decide -- so this table stores the
-- documents, not a stored "discharged" boolean that could go stale against the live placements.
--
-- DERIVED-from-the-corpus and carrying bundle_id, so it clears in BOTH purge arms exactly as
-- progression_instances do (it is in op=purge's TABLES): a per-bundle purge removes that
-- document's discharges and the stage honestly re-reads as an undischarged gap; a whole-store
-- purge takes them all (D-113). JUNCTION checks as findings and the SCHEDULED walking-task are
-- DEFERRED past FW-10.
CREATE TABLE IF NOT EXISTS progression_exceptions (
  progression_key TEXT NOT NULL,
  entity_id       TEXT NOT NULL,
  stage_key       TEXT NOT NULL,
  capture_sha     TEXT NOT NULL,
  bundle_id       TEXT NOT NULL,
  reason          TEXT NOT NULL,
  citation        TEXT NOT NULL,
  declared_by     TEXT,
  at              TEXT,
  PRIMARY KEY (progression_key, entity_id, stage_key, capture_sha)
);
CREATE INDEX IF NOT EXISTS progression_exceptions_key ON progression_exceptions(progression_key, entity_id);
CREATE INDEX IF NOT EXISTS progression_exceptions_bundle ON progression_exceptions(bundle_id);
CREATE INDEX IF NOT EXISTS progression_exceptions_capture ON progression_exceptions(capture_sha);
-- REC-5 / D-122: the CONNECTION-DERIVE DIRTY-SET. A bounded work-queue of the
-- entities whose resolutions have changed since their connections were last
-- derived, so the scheduled connection-derive sweep (a consumer on REC-1's DO
-- alarm) re-derives only what moved rather than re-deriving the whole store every
-- tick. It is a WATERMARK, not a second source of truth: the connections it
-- produces are DERIVED from resolutions exactly as op=connect derives them, and a
-- dirty row that is lost only costs one skipped re-derivation, while a spurious
-- one costs one idempotent no-op re-derivation -- both harmless, which is why a
-- transient set is safe here where the record proper never is.
--
-- Stamped at op=resolve / op=resolvetestify, and ONLY when a resolution is
-- INSERTED or RAISED in grade (a kept idempotent re-resolve changes nothing, so
-- it dirties nothing). Keyed by entity_id, so many resolutions touching one
-- entity collapse to ONE pending row and the sweep is bounded by the count of
-- DISTINCT changed entities, not by resolve volume. The sweep deletes a row once
-- it has derived that entity's connections; when the set empties the consumer's
-- wake goes null and the alarm self-terminates.
--
-- DERIVED from the corpus (an entity is dirty only because a captured document
-- resolved to it), so a whole-store purge clears it -- op=purge deletes it in the
-- whole-store arm (D-113; hygiene.test.mjs holds the list). It has no bundle_id
-- and is a transient queue, so a per-bundle purge leaves it: at worst a stale
-- entity_id triggers one harmless idempotent re-derivation on the next tick.
CREATE TABLE IF NOT EXISTS connection_dirty (
  entity_id  TEXT PRIMARY KEY,
  stamped_at TEXT
);
CREATE INDEX IF NOT EXISTS connection_dirty_stamped ON connection_dirty(stamped_at);
-- REC-7 / D-79: the PROPOSAL-DISPOSITION store. A derived proposal (REC-6's
-- op=proposals: one missing-predecessor finding per (progression_key, stage_key),
-- aggregated across the instances that fire it) is NOT a bundle, so a member who
-- defers or dismisses it has nowhere to land a disposition -- op=dispose disposes
-- a focus BUNDLE (a handle + a state), and declining a proposal must NOT mint a
-- bundle, because declining is not authoring (D-79). This table is that home: it
-- records that a member aged the record's own question, keyed by the SAME identity
-- REC-6 aggregates by, so the disposition attaches to the proposal and not to any
-- one instance beneath it.
--
-- D-79's AGE RATHER THAN VANISH: a machine-surfaced finding nobody has acted on
-- moves to deferred/dismissed with the reason recorded, never silently
-- disappearing, because a finding that disappears is indistinguishable from one
-- never made -- and that rule does not relax because the finder was a machine.
-- This row IS the ageing: op=proposals reads it, filters the aged proposal out of
-- the OPEN feed, and returns it alongside so the decision stays on the record.
-- state is 'deferred' (parked, returnable) or 'dismissed' (declined); both age the
-- proposal out of open. A re-disposition UPSERTS on the (progression_key,
-- stage_key) key -- the same proposal re-decided keeps ONE row, re-triageable,
-- never a second. decided_by is the deciding member, STAMPED server-side (never
-- the caller's word). A re-fired proposal whose gap still exists but was dismissed
-- stays dismissed with its reason until this row changes: the key is the identity,
-- not the instance set, so a wider gap does not silently resurrect it.
--
-- Member-authored state (a member's decision), not a projection of the corpus --
-- like the registry and the progression definitions above -- but op=purge is the
-- scratch-reset tool, so a whole-store purge that reported scope ALL while leaving
-- dispositions is the D-113 silent-leftover: cleared in the whole-store arm only,
-- left by a per-bundle purge (it has no bundle_id). hygiene.test.mjs asserts this
-- against schema.mjs.
CREATE TABLE IF NOT EXISTS proposal_dispositions (
  progression_key TEXT NOT NULL,
  stage_key       TEXT NOT NULL,
  state           TEXT NOT NULL,
  reason          TEXT NOT NULL,
  decided_by      TEXT,
  at              TEXT,
  definition_version INTEGER,   -- REC-184: the progression definition version the decision was taken against
  PRIMARY KEY (progression_key, stage_key)
);
-- REC-184 (framework 8.2, The declared flow and its revisions): definition_version is the version of
-- the progression definition CURRENT when the member decided, stamped by the store and never the
-- caller's word. A decision applies only to the version it was taken against -- once the definition
-- is revised the proposal is OPEN again, with the earlier decision published beside it, because a
-- decision the record applies to a definition nobody judged is the record claiming more than it
-- holds. NULLABLE AND NEVER BACK-FILLED: a row written before this column existed recorded no
-- version, and the only value a backfill could reach for is the current one, which is the claim
-- this column exists to test. NULL reads back as not recorded, stated, and such a row governs
-- only while the definition has not been declared again since the decision was taken (the
-- definition's own at against the row's at) -- the version stays unknown, the ORDER is recorded.
CREATE INDEX IF NOT EXISTS proposal_dispositions_at ON proposal_dispositions(at);
-- REC-11 / DATA-MODEL D4: the INQUIRY BASIS -- the legs an inquiry rests on,
-- and invariant 7's storage: a leg whose role is cuts_against is a ROW, so a
-- rendering cannot quietly drop the evidence that argues the other way.
--
-- DERIVED from bundle.md's basis[] frontmatter, written whole at op=promote in
-- the SAME transaction as refs by the same delete-then-insert discipline, so it
-- is a projection of the document and never a second place to state it (D-21).
-- A separate table rather than columns on refs, and that is D4's ruling, not
-- taste: refs' PK has no ordinal, so one document could not be cited for two
-- legs, and a nullable grade on the universal edge projection would create a
-- place to put a grade on edges that must not carry one -- the category error
-- entity_relations refuses structurally above.
--
-- target_id is an INFO- bundle OR another inquiry (INQ-, or a legacy PROB-/
-- FOCUS- id) -- the self-reference IS basis recursion and needs no other
-- mechanism. The basis graph over inquiry-typed legs is a DAG, enforced at the
-- WRITE: op=promote refuses a write whose target would close a cycle, naming
-- the path (before REC-11 the record's only acyclicity protection was a side
-- effect of op=cite refusing non-information members).
--
-- grade is NULLABLE and NULL means undetermined and STATED -- never invented
-- to pass a gate. grade_axis is the axis the grade is ON (capture,
-- connection or testimony -- GRADE_AXES in checks/bio-checks.mjs is the
-- authority, and testimony joined it with MK-2 / IC-142, a leg on a member's
-- authored bundle, graded at TESTIMONY_GRADE and no other letter), recorded
-- on the leg because it is NOT derivable from
-- target_type: a connection grade legitimately sits on an INFO- leg. One
-- column, not two grade columns, because a leg asserts ONE grade for ONE
-- reason (RECONCILED R2). grade_source is resolution (earned, REC-18's path),
-- testimony (a member's signed grade-D account), or hunch (DEC-15): an
-- authored connection grade, the ONLY authored grade permitted above D,
-- requiring an author and a date in the document, visible as a hunch from the
-- moment it is made, and HUNCH DEBT until cleared (BIO_Declared_Bias_v0_1.md).
-- D-188 / DEC-46 (d): HUNCH DEBT, not "bias debt". A hunch is the ONE kind of
-- declared bias that DISQUALIFIES publication (DEC-20); ordinary bias debt is
-- DISCLOSED and travels with the published case. Calling this "bias debt" is
-- what made Bob re-read his own ruling as a contradiction on 2026-08-04.
--
-- inquiry_basis_target is the reverse index: "which inquiries rest on this
-- document" (E2, and REC-17's re-evaluation obligation) is ONE indexed lookup.
-- Cleared in BOTH purge arms via the TABLES list (D-113); hygiene.test.mjs
-- holds that list against this file.
--
-- REC-42 / DEC-32: the ground column IS THE RELATIONSHIP BETWEEN LEGS, one
-- nullable column rather than a table because a leg belongs to exactly ONE
-- ground and the leg row is already keyed (bundle_id, ord). Legs sharing a
-- ground are AND-related (the basis is no stronger than the weakest of them);
-- the grounds themselves are OR-related (the basis is as strong as its
-- STRONGEST ground). NULL IS THE IMPLICIT SINGLE GROUND and it is the DEFAULT
-- ON PURPOSE: every leg written before this column existed reads NULL, lands in
-- one ground, and derives exactly the weakest-leg answer it derived before.
-- Bob's ruling (DEC-32): "sometimes the weakest is the claim's strength, and
-- other times it's not. The difference is really whether the relationship
-- between legs is AND or OR."
--
-- THE ATTRIBUTION IS NOT PROJECTED HERE, and that is the deliberate half. A
-- ground's claim to be INDEPENDENTLY SUFFICIENT is asserted per ground, by a
-- named member, in bundle.md's grounds[] block -- one row per label carrying
-- asserted_by and at. It is per (bundle_id, ground), so a column here would
-- state it once per LEG: a second place for one fact to be written, which is
-- what D-21 forbids and what the ordinal above exists to avoid. It is not a
-- second TABLE either, because nothing asks the record a question keyed on it:
-- the assertion is enforced at BOTH gates by one catalog function
-- (checkInquiryBasis, REC-11's precedent) and frozen into the ratified bytes at
-- publication, which is where a reader checks it. If a query ever needs "which
-- grounds did this member assert", THAT is when the table is earned.
CREATE TABLE IF NOT EXISTS inquiry_basis (
  bundle_id    TEXT NOT NULL,   -- the inquiry
  ord          INTEGER NOT NULL,-- position in basis[], so a leg is addressable
  target_id    TEXT NOT NULL,   -- an INFO- or an INQ-/PROB-/FOCUS- bundle
  target_type  TEXT NOT NULL,   -- 'information' | 'inquiry', denormalised for the walk
  role         TEXT NOT NULL,   -- 'supports' | 'cuts_against'
  grade        TEXT,            -- A|B|C|D, NULL = undetermined and STATED as such
  grade_axis   TEXT,            -- 'capture' | 'connection' | 'testimony': the axis the grade is on
                                -- GRADE_AXES in checks/bio-checks.mjs is the authority (MK-2 / IC-142)
                                -- this line named only the first two until 2026-09-23, D-423
                                -- hygiene.test.mjs DRIVES it against the export, as REC-68 did for grade_source
  grade_source TEXT,            -- 'resolution' | 'testimony' | 'hunch' | 'inherited' | 'capture'
                                -- GRADE_SOURCES in checks/bio-checks.mjs is the authority (DEC-15)
                                -- this line named only the first three until 2026-08-08, REC-68
                                -- the last two arrived with REC-31/DEC-21 and were never added here
                                -- hygiene.test.mjs now DRIVES this list against the export, because
                                -- hand-typing a vocabulary is how it went stale in the first place
  note         TEXT,
  at           TEXT,
  ground       TEXT,            -- REC-42: the OR branch this leg belongs to. NULL = the implicit single ground (AND)
  -- REC-82 / IC-83 / DEC-23: WHAT PART OF THE DOCUMENT THIS LEG RESTS ON. The
  -- content row is the leg's REFERENT and the bundle its CONTAINER, so
  -- target_id above does NOT move -- the compiler still joins through
  -- bundle_id as it does everywhere (D-222 rule). NULLABLE while I5 is
  -- CHANGING at 1.11.0, and NOT NULL is the IC's own SETTLED condition rather
  -- than this landing's: a leg promoted before REC-82 existed named no extent,
  -- and it is BACKFILLED to its document-extent row on first read rather than
  -- migrated, because the id is a hash and the row is therefore derivable at
  -- any time from the capture it cites (no allocator, so no backfill pass).
  content_id   TEXT,
  PRIMARY KEY (bundle_id, ord)
);
CREATE INDEX IF NOT EXISTS inquiry_basis_target ON inquiry_basis(target_id);
CREATE INDEX IF NOT EXISTS inquiry_basis_bundle ON inquiry_basis(bundle_id);
-- D-223 / PL-8: the index the HUNCH DEBT question reads. leg:hunch compiles to
-- SELECT bundle_id FROM inquiry_basis WHERE grade_source = ?, and bundle_id is in the
-- index so the seek is COVERING -- it never touches the table. It is the RARE-VALUE
-- case an index is for: a hunch is debt, so a corpus where hunches were common is a
-- corpus nobody would publish from, and a scan pays the whole basis to find the few.
-- MEASURED 2026-08-07 (test/meaning-index-probe.mjs, node:sqlite, the statements DRIVEN
-- out of compile() and the OTHER indexes DRIVEN out of schema.mjs AND store.mjs rather
-- than typed -- the first version of that probe hand-wrote them, missed bundles_fts_id
-- because it is created in store.mjs's migration, and reported a 97% saving from an
-- index the product has had for months):
--   leg:hunch  0.241 ms -> 0.145 ms at 20,000 bundles  (-39.8%)
--              0.969 ms -> 0.440 ms at 100,000 bundles (-54.6%)
-- The proportion GROWS with the corpus, which is the property being bought: the seek is
-- O(matching legs) and the scan is O(all legs).
-- NO INDEX ON role, and that is the recorded answer rather than an omission: the same
-- probe measured inquiry_basis(role, bundle_id) as a candidate at -9.1% / -10.1%, which
-- is a write cost on every leg of every promote for a read saving inside the noise.
-- role has two values, so the seek reads half the table and the scan reads all of it --
-- an index is worth least exactly where the value is commonest. If a member's question
-- ever makes cuts_against legs the hot path, the probe is here to re-run.
CREATE INDEX IF NOT EXISTS inquiry_basis_grade_source ON inquiry_basis(grade_source, bundle_id);
-- REC-90 -- THE content:cited PREDICATE'S OWN INDEX, AND THIS ONE IS NOT A TUNING
-- CHOICE. content:cited and content:uncited ask whether ANY leg rests on a content
-- row, which is an EXISTS over this column for every candidate row -- O(content
-- rows x legs) without it. MEASURED 2026-09-15 (M-23, test/content-index-probe.mjs)
-- at 20,000 bundles / 40,002 content rows / 31,200 legs, 9 reps:
--   content:uncited  31,614.512 ms -> 9.028 ms  (-100.0%)
--   content:cited    27,292.571 ms -> 11.881 ms (-100.0%)
-- A THIRTY-ONE-SECOND read behind a surface any member can call, against a measured
-- noise floor of 20.5%. That is REC-66 / D-227's amplification class arriving at a
-- new door, not a percentage worth weighing: without these two indexes the op does
-- not answer, it times out. The version-leg table gets the same index for the same
-- predicate, because content:cited asks BOTH tables -- a version leg cites content
-- exactly as a live leg does, and asking only the live one would report a passage
-- as uncited while a recorded version of a basis rests on it.
CREATE INDEX IF NOT EXISTS inquiry_basis_content ON inquiry_basis(content_id);
-- REC-21: the PERSONAL half of the queue, and it is a SEPARATE TABLE on
-- purpose. The record half of an item's state lives on the EVENT (DEC-16: a
-- task's status, a proposal's disposition), so one member's resolution clears
-- every member's queue. This table holds what must NOT work that way: what one
-- member has chosen not to be told about. Muting is PERSONAL; dismissing is a
-- RECORD ACT; they are never one control (D-125), and keeping them in two
-- tables with two doctrines is how that survives the next person who
-- implements a delete button.
--
-- muted_kinds is a sorted comma-separated set and MAY CONTAIN CONDITION KINDS
-- ONLY. A CONDITION is a fact about our own machinery; an OBLIGATION is
-- something a named person must do for the record to proceed, and tasks
-- carries no per-member mute, so a muted obligation would leave the record
-- believing a question reached a person it cannot reach. The fence is at the
-- ONE write (store.mjs queueMute, over queuestate.mjs's catalogue), because a
-- CHECK constraint here could not name the vocabulary and a second copy of the
-- rule is a second place for it to drift.
--
-- The set is the kinds PRESENT WHEN THE MUTE WAS MADE, which is why this is a
-- set of kinds and not a boolean on the case: a new kind on a muted case is not
-- in the set and still reaches the member.
--
-- snoozed_until is an instant the MEMBER chose. There is no default: P-87 says
-- re-notify at the stage's OWN declared interval and never on a global one, so
-- there is no instance-wide snooze constant anywhere in this plane and a snooze
-- with no instant is refused rather than filled in. last_seen is the anchor a
-- re-notify clock reads.
--
-- case_id IS a bundle id (an inquiry or a project), so this table clears in
-- BOTH purge arms via a DELETE keyed on it (D-113); hygiene.test.mjs holds that
-- against this file.
CREATE TABLE IF NOT EXISTS queue_state (
  member_id     TEXT NOT NULL,
  case_id       TEXT NOT NULL,
  muted_kinds   TEXT,
  snoozed_until TEXT,
  last_seen     TEXT,
  PRIMARY KEY (member_id, case_id)
);
CREATE INDEX IF NOT EXISTS queue_state_member ON queue_state(member_id);
CREATE INDEX IF NOT EXISTS queue_state_case ON queue_state(case_id);
-- D-125 (DEC-10 (b), RULED 2026-09-22 by BOB #26) and D-170 (BOB #29, 2026-09-23):
-- the PER-ITEM personal mute. One row is one member choosing not to be told
-- about ONE queue item, keyed on the item's own stable id (the id op=queue
-- publishes: FINDING::<progression>::<stage> is the key proposal_dispositions
-- already uses, and CONDITION::governor-holding-host::<host> names the host).
-- It is keyed on the MEMBER, so it moves no other member's list, and it writes
-- no disposition: a finding leaves the team's list only by the authored act.
-- item_class is FINDING or CONDITION and never OBLIGATION -- the fence is at
-- the ONE write (store.mjs queueMute) for queue_state's reason. It is personal
-- state, not corpus-derived, and it is keyed on no bundle id, so it clears in
-- the whole-store purge arm only (D-113).
CREATE TABLE IF NOT EXISTS queue_item_mutes (
  member_id   TEXT NOT NULL,
  item_id     TEXT NOT NULL,
  item_class  TEXT NOT NULL,
  muted_at    TEXT NOT NULL,
  PRIMARY KEY (member_id, item_id)
);
-- REC-14 / C-9: what a published case says it does NOT cover. A projection of
-- the completeness_excluded[] block in bundle.md, exactly as inquiry_basis is
-- of basis[] -- the BYTES make the assertion storable and signable, and only
-- this INDEXED projection makes it AUDITABLE. "Which published cases excluded
-- this document" is invariant 7's only mechanical enforcement point at the
-- case level, and without the index on target_id it cannot be asked at all.
--
-- target_id is NULLABLE and every row carries target_id OR prose, NEVER
-- NEITHER (RECONCILED C-9, the capture-or-testify structure REC-24 uses for
-- correspondence). An exclusion may legitimately name something that is not in
-- the record -- "a records request to the City Clerk is still outstanding" is
-- a real exclusion with no id to point at -- so a NOT NULL target would force
-- the member to either invent a referent or say nothing. description and
-- reason are both NOT NULL: WHAT was left out and WHY are two different
-- statements and one does not stand in for the other.
--
-- edition is the edition of the document this projection was taken from, so an
-- auditor reading a row knows which assertion it is. It is NOT in the key: the
-- bytes hold every edition's assertion forever, and this table holds the LIVE
-- document's, re-projected whole on every promotion like every other
-- projection here. Cleared in BOTH purge arms (D-113).
CREATE TABLE IF NOT EXISTS inquiry_exclusions (
  bundle_id   TEXT NOT NULL,
  ord         INTEGER NOT NULL,
  edition     INTEGER,
  target_id   TEXT,
  description TEXT NOT NULL,
  reason      TEXT NOT NULL,
  author      TEXT NOT NULL,
  at          TEXT NOT NULL,
  PRIMARY KEY (bundle_id, ord)
);
CREATE INDEX IF NOT EXISTS inquiry_exclusions_target ON inquiry_exclusions(target_id);
-- REC-14 / DEC-17 as amended: the GROUP's default required evidentiary
-- strength, which a project may then override in its own bundle.md. A PAIR
-- (capture, connection) per R2 and never a scalar, because a single letter
-- would re-collapse the two axes in the one field a reader is most likely to
-- quote.
--
-- It is a DECLARATION BY THE GROUP ABOUT ITS OWN WORK, not a system rule and
-- not a property of any reader: nobody's standard is set by who they are
-- (AUDIENCES 5). An ABSENT declaration gates nothing and the published case
-- SAYS SO -- an absent bar is not a bar of zero and must never render as one.
-- Governance, not corpus: like members and signers it survives a whole-store
-- purge, and hygiene.test.mjs carries that exemption with its reason.
CREATE TABLE IF NOT EXISTS group_strength_bar (
  group_id   TEXT PRIMARY KEY,
  capture    TEXT,
  connection TEXT,
  author     TEXT NOT NULL,
  at         TEXT NOT NULL
);
-- REC-22 / R4: the PUBLISHED GRAPH. One row per edge OUT of a published
-- bundle, written by the publishing act (Store.publish, the committer op=ratify
-- calls) from the RATIFIED BYTES' own references[] and division disclosure --
-- never from a caller and never from the working refs table, which changes
-- under the published record every time somebody promotes.
--
-- TWO DISCLOSURE CLASSES, and the distinction is the whole table:
--
--   serve  the target is ITSELF published, so the public surface may hand over
--          its edition, its title and its bundle_sha, and a reader can fetch
--          those bytes by hash. Restricted to published targets, which is what
--          stops the published graph naming working material.
--   name   the id may be NAMED and nothing more. R4's disclosure obligation --
--          "a published child names its parent and its siblings" -- lands here,
--          and it had to: a divided parent is TERMINAL and can never be
--          published, and a sibling may not be, so BUILD-ORDER's original
--          "restricted to targets that are themselves published" made R4's
--          disclosure impossible on the exact surface R4 was written for
--          (RECONCILED R4-e/R4-g). A name row carries an id and nothing else --
--          no title, no state, no sha, nothing fetchable.
--
-- The published column is the instant the edge was published, exactly as in
-- published_shas. The PK is (from_bundle, to_bundle, kind) as specified, so a
-- second edition re-asserting the same edge is idempotent rather than doubled;
-- the class of an existing row is refreshed on re-publication, because whether
-- a target is published is a fact about the record and not about the edition.
--
-- DERIVED, and therefore in BOTH arms of op=purge (D-113) unlike its published
-- siblings: every row here is recomputable from bytes that answer forever
-- (published_shas keeps the case's own bundle.md, which carries references[]
-- and the division disclosure inside the hash the group signed), so a purge
-- that cleared it destroys an index and never a fact. published_bundles and
-- published_shas are exempt precisely because nothing else holds what they hold.
CREATE TABLE IF NOT EXISTS published_edges (
  from_bundle TEXT NOT NULL,
  to_bundle   TEXT NOT NULL,
  kind        TEXT NOT NULL,
  disclosure  TEXT NOT NULL,
  published   TEXT NOT NULL,
  PRIMARY KEY (from_bundle, to_bundle, kind)
);
CREATE INDEX IF NOT EXISTS published_edges_to ON published_edges(to_bundle);
-- REC-44 / DEC-44 / D-187: THE PUBLISHED CASE, which is the object this record
-- always meant and never had. A case is a CONTAINER OVER ONE OR MORE FINDINGS,
-- scoped to the project's own question. Before this table a case WAS an
-- inquiry, and nobody chose that: it was assumed by every item in the chain,
-- and DEC-32 closed the only escape (a parent inquiry citing children would
-- collapse several propositions into one conclusion with one falsifier, the
-- overclaim DEC-32 exists to prevent).
--
-- THE IDENTITY IS DISTINCT FROM A BUNDLE ID, ALWAYS, including for the
-- one-finding case DEC-44 determination 5 keeps legal. Reusing the member's
-- bundle id when there happens to be one member is exactly the conflation
-- D-187 records: it would make ?id= ambiguous at the public read path and it
-- would make the shape depend on the arity, so the degenerate case would stop
-- being degenerate the moment a second finding joined. The id is minted by
-- op=publish (CASE-<year>-<seq>, through allocId like every other minted
-- identifier) and then CARRIED IN THE SIGNED BYTES of every member finding, so
-- a case identity can never be claimed at the commit that was not inside the
-- hash the member signed -- the rule DEC-12 already imposes on the edition.
--
-- WHAT IS AUTHORED HERE, and both are authored per CASE per EDITION:
--   scope         DEC-44 determination 2 -- Bob's "sufficient scope to address
--                 all issues that brought the various inquiries together".
--                 NEVER derived from the findings' titles. It sits BESIDE the
--                 completeness assertion and does not replace it: completeness
--                 says what was left OUT, scope says what the case is ABOUT,
--                 and a reader needs both because they are not the same claim.
--   completeness  REC-14's assertion, moved up one altitude. C-21.1's
--                 byte-check compares THIS against the previous edition of
--                 THIS CASE. The scope statement is deliberately NOT under
--                 that byte-check, and the reasoning is at C-21.1's site.
--   bias_acknowledgement
--                 REC-47 / DEC-46 (a). The publisher's AUTHORED acknowledgement
--                 of the bias this edition's case was produced under -- fresh
--                 per edition, never prefilled, and UNDER C-21.1's byte-check
--                 alongside completeness rather than exempt alongside scope.
--                 The discriminator between the two rules is recorded once, at
--                 C-21.1's site, because these three fields now sit side by
--                 side under two different rules and the next reader will ask.
--                 DEC-20 is why this is a DISCLOSURE and not a gate: ordinary
--                 declared bias never blocks publication and travels with every
--                 published case. Only an uncleared HUNCH disqualifies, and
--                 that refusal is publishpreflight's (UNCLEARED_HUNCH), not
--                 this column's. This field states the lens; it never judges it.
--                 The bias MANIFEST -- computed and stamped, DEC-46's other
--                 half -- is NOT here and is not built: the bias object type
--                 is still absent from the check catalogue (D-84), so no
--                 bundle exists to compute one from. The two are different
--                 things travelling together, and only the AUTHORED half of
--                 the pair can be built today.
--
-- ratified_at is NULL until the edition is COMPLETE -- until every member
-- finding has been ratified. That is a real state and it is stated rather than
-- hidden: each finding carries its own signature over its own bytes (the
-- finding is the unit of truth), so a case edition exists from the first
-- ratification and can only be SERVED as a container once the last one lands.
-- CASE-5 / DEC-72 clause 2 ADDS bar -- THE STANDARD OF EVIDENCE, STORED WHERE
-- IT IS A PROPERTY OF. Bob: "the bar -- that is, the standard of evidence -- is
-- a property of a project, not an inquiry or claim", told to the publishing act
-- at act time. CASE-2 computed it correctly and then had nowhere case-side to
-- put it, so the only place it was reachable was published_bundles.required --
-- once PER MEMBER.
--
-- THAT IS NOT A TIDINESS COMPLAINT AND THE DEFECT IT LEAVES IS REACHABLE. The
-- bar is read from the publishing project AT ACT TIME and members ratify at
-- DIFFERENT times, so a project whose bar moved between the first member's
-- ratification and the last one gave a single case edition TWO standards of
-- evidence, each stamped into different members' signed bytes, with nothing in
-- the plane noticing. Stored here it is ONE fact about the case, committed from
-- the signed bytes like the scope beside it and under the SAME divergence
-- refusal (CASE_ASSERTION_DIVERGED) -- so two members who signed different bars
-- are refused rather than reconciled.
--
-- JSON, matching the shape op=publish already stamps into every member's
-- required_strength block: declared, source, project, capture, connection,
-- detail. Not six columns, because it is ONE authored answer read at ONE
-- instant, and splitting it would let five sixths of a bar be written.
--
-- NULLABLE, and NULL is the honest answer for every edition published before
-- this column existed. A backfill from any member's required would look
-- defensible and would be an invention: it would assert that the case was held
-- to that standard when what the record actually holds is one member's stamp,
-- and where the two members disagree the backfill would have to choose which
-- disagreement to publish as the group's.
CREATE TABLE IF NOT EXISTS published_cases (
  case_id      TEXT NOT NULL,
  edition      INTEGER NOT NULL,
  scope        TEXT,
  completeness TEXT,
  bias_acknowledgement TEXT,
  bar          TEXT,               -- the CASE's standard of evidence, as JSON. NULL = none recorded, and STATED
  opened       TEXT NOT NULL,
  ratified_at  TEXT,
  manifest_sha TEXT,
  manifest     TEXT,
  PRIMARY KEY (case_id, edition)
);
-- The case -> findings MEMBERSHIP, as DECLARED in every member's own ratified
-- bytes. published_bundles holds the RATIFIED SUBSET; this holds the whole set,
-- and the difference between them is what "this edition is not complete yet"
-- means. That difference is also why this is a TABLE rather than a derived
-- query over published_bundles, and it earns itself on the D4/REC-42 test
-- twice over: it needs an ORDINAL (the order the member published the findings
-- in is the order the container's parts[] and every rendering take, and it is
-- authored rather than alphabetical), and it answers a query keyed on it in
-- BOTH directions -- "which findings are in this case edition" (assembling the
-- container) and "which case does this finding belong to" (the public read
-- path resolving a finding id, which is why bundle_id is indexed).
-- CASE-1 / DEC-72 ADDS THE TWO FACTS A MEMBERSHIP ROW WAS MISSING: WHICH VERSION
-- OF THE FINDING IS IN THE CASE, AND WHAT THE PUBLISHER SAID IT WAS DOING THERE.
-- The design's member is (finding id, version hash, role, ordinal); before this
-- item the first and the last were here and the middle two were not.
--
-- version_sha -- CLAUSE 3, publication pins versions LIKE A COMMIT. Bob: "Once
--   published, the act of changing the findings (or any claims of any of the
--   findings) results in the changed version becoming a new version." The pin is
--   the finding's own bundle_sha, which is the hash the member SIGNED, so the
--   member row names a version by the same identity the signature covers.
--   NO SECOND COLUMN FOR THE MEMBER'S OWN EDITION NUMBER, deliberately: a
--   version is identified by its hash, and published_bundles is keyed
--   (bundle_id, edition), so resolving a pin is a PK-prefix seek on that
--   finding's own handful of editions rather than a scan. A stored edition
--   number beside the hash would be a second way to say the same thing, and the
--   two would eventually disagree. It also names the conflation the artifact
--   flip removes: before CASE-5 #caseEditionState read published_bundles at the
--   CASE'S edition number, which is only correct while one case owns one finding.
--   CASE-5 LANDED THAT FLIP 2026-09-10 -- resolution is now BY THIS COLUMN, and
--   the old predicate survives ONLY as the fallback for a row written before
--   CASE-3, whose pin is honestly NULL. edition on this table is the CASE'S
--   and a member's own edition is published_bundles', and after the flip the two
--   genuinely differ: a finding joining a case at that case's edition 2 having
--   published once before is at ITS OWN edition 1 inside the case's edition 2.
--
-- role -- CLAUSE 4, and it is AUTHORED BY THE PUBLISHER, never derived. Bob:
--   "All load-bearing findings of a case being published must meet the necessary
--   bar. Other findings/claims that don't meet the bar can be a part of the
--   published work, though they aren't presented as load-bearing." Two values and
--   nothing else: 'load_bearing' and 'supporting'. Spelled snake_case to match
--   every other closed vocabulary in this schema ('cuts_against' is the exact
--   precedent -- a hyphenated English term stored with an underscore), and the
--   spelling is fixed HERE so CASE-2 and CASE-6 do not each invent a third.
--
-- BOTH ARE NULLABLE AND THERE IS NO DEFAULT ON EITHER, WHICH IS THE WHOLE
-- DISCIPLINE OF THIS PAIR. Rows written before DEC-72 pinned no version and
-- carry no authored designation, and NULL states exactly that -- the same answer
-- inquiry_basis_versions.affirmed_parts gives, and for the same reason: a
-- DEFAULT of 'supporting' would mean a member could be designated by OMISSION,
-- and a default of 'load_bearing' would have the record assert that evidence
-- meets a bar nobody claimed it met. A designation that can happen without an
-- act is not authored. CASE-2 makes both REQUIRED AT THE DOOR, where a refusal
-- can name what is missing, rather than here where a constraint would only
-- break the shipped ratify path.
CREATE TABLE IF NOT EXISTS published_case_members (
  case_id     TEXT NOT NULL,
  edition     INTEGER NOT NULL,   -- the CASE's edition, never the member's
  ord         INTEGER NOT NULL,
  bundle_id   TEXT NOT NULL,
  version_sha TEXT,               -- the member finding's pinned bundle_sha. NULL = not pinned, and STATED
  role        TEXT,               -- 'load_bearing' | 'supporting'. NULL = nobody authored one, and STATED
  PRIMARY KEY (case_id, edition, bundle_id)
);
CREATE INDEX IF NOT EXISTS published_case_members_bundle ON published_case_members(bundle_id);
-- CASE-1 / DEC-72: THE CASE IDENTITY, AND WHOSE PRODUCTION THE CASE IS.
--
-- Bob, 2026-08-10, ruling the model this table exists to make structural: a case
-- is A PRODUCTION OF A PROJECT -- its own object, a set of finding-versions plus
-- the publishing project, published by a project OWNER against THAT PROJECT'S bar
-- at act time. The design is CASE-AS-PRODUCTION.md and it is the authority.
--
-- WHY THIS IS A THIRD TABLE RATHER THAN A COLUMN ON published_cases, and it is
-- the one structural decision in this item. published_cases is keyed
-- (case_id, edition). A project_id on THAT row would be a project per EDITION,
-- which permits edition 1 to be project A's production and edition 2 to be
-- project B's -- and under DEC-72 that is not a case with two editions, it is
-- two different productions wearing one identity. The bar is read from the
-- publishing project at act time, so a case whose owner can change between
-- editions is a case whose STANDARD OF EVIDENCE can change without anyone
-- authoring the change. One row per case_id makes that unrepresentable rather
-- than merely discouraged.
--
-- project_id IS NOT NULL, AND THE ABSENCE OF A ROW IS THE HONEST STATEMENT FOR
-- EVERY CASE PUBLISHED BEFORE THIS MODEL. DEC-72 removes the project-less
-- publication path outright, so a row here that named no project would be
-- exactly the shape the ruling deletes. Cases already in published_cases were
-- published under the pre-DEC-72 model and genuinely have no owning project;
-- they get NO ROW HERE, and a reader asking whose production such a case was is
-- answered "undetermined" by the missing row rather than by a NULL that would
-- read as a project the record lost. Backfilling a project would be inventing an
-- attribution to get past a gate, which this record refuses everywhere else.
-- The constraint is affordable here precisely BECAUSE the table is new: the two
-- columns this item adds to published_case_members are nullable for the mirror
-- reason -- their rows already exist and honestly lack the fact.
--
-- WHO WRITES IT: CASE-2, which is where publishCase() first takes a publishing
-- project and an owner-only fence. CASE-1 builds the object and writes no row,
-- so op=export answers project_id NULL for every case in the store today and
-- says so. That is a stated state of the record, not a gap in the answer.
--
-- THERE IS DELIBERATELY NO opened_by. The act's author belongs to the ACT, and
-- the act that mints this identity is the publication of an edition, which
-- published_cases already carries. A second author column here would be a second
-- authority for one fact, which is how the drift this repo keeps finding starts.
--
-- AND THERE IS DELIBERATELY NO INDEX ON project_id YET. "Which cases does this
-- project own" is clause 6's query and it is CASE-2's and CASE-6's to ask -- an
-- index declared before any statement filters on it is REC-69's own class, an
-- access path built for a question no op asks. It belongs in the commit that
-- brings its reader.
CREATE TABLE IF NOT EXISTS cases (
  case_id    TEXT PRIMARY KEY,  -- one identity, invariant across every edition
  project_id TEXT NOT NULL,     -- the OWNING project. Its bar is the case's bar, read at act time
  opened     TEXT NOT NULL      -- the instant this identity came into being
);
-- CASE-5b / DEC-72: THE CASE DOCUMENT -- THE THING A MEMBER SIGNS WHEN WHAT IS
-- BEING ASSERTED IS THE CASE'S OWN, AND NOT ANY ONE FINDING'S.
--
-- WHY IT EXISTS, and the reason is a wall CASE-5 measured rather than a feature
-- anyone wanted. Every case fact this plane commits is committed FROM THE SIGNED
-- BYTES AND FROM NOTHING ELSE (#publishEdges' doctrine). Until this table the
-- only signed bytes in the system were a FINDING's, so op=publish stamped the
-- case's scope, roster, partition, bias acknowledgement and bar into EVERY
-- member's frontmatter -- N copies of one fact, each inside a different
-- signature, held together by four divergence refusals. A finding's bytes could
-- not stop naming a case, because there was no signature over a case for those
-- facts to move to.
--
-- THE CONSTRAINT THAT SHAPED IT is the container manifest's own sentence: a
-- case-level signature would be a signature over SOMETHING NOBODY REVIEWED. So
-- what is stored here is not a synthesised summary of the roster. It is the
-- publisher's own authored assertions, written once, in the words they authored
-- them in at the ceremony -- the scope, the completeness statement, the
-- exclusions and their reasons, the subject position and its justification, the
-- bias acknowledgement, the load-bearing partition, the bar -- assembled into a
-- document a member reads whole and signs. Every sentence in it was typed by a
-- person at op=publish. The roster appears because a partition needs targets,
-- and it appears WITH THE PINS, which is clause 3's freeze stated where the
-- freeze is actually asserted.
--
-- doc_sha IS THE IDENTITY THE SIGNATURE COVERS, and text is kept beside it so
-- the document can be re-read and re-verified without this instance being
-- trusted to re-render it. Rendering it twice is exactly the equality that costs
-- nothing to produce, so the bytes are stored rather than recomputed.
--
-- sig_armored / attestor_key / attestor_member / gate_version / ratified_at ARE
-- ALL NULL UNTIL op=caseratify LANDS, and that window is a real state which is
-- STATED rather than hidden: between op=publish and the case ratification the
-- case is AUTHORED AND UNSIGNED, and nothing case-side is committed while they
-- are NULL. That is the whole fence -- the store refuses CASE_UNSIGNED rather
-- than writing a case row from a request, which is the attribution class this
-- record refuses everywhere else.
--
-- ONE ROW PER (case_id, edition). An edition is a separate document and answers
-- forever, exactly as published_cases' own key says.
CREATE TABLE IF NOT EXISTS case_documents (
  case_id         TEXT NOT NULL,
  edition         INTEGER NOT NULL,
  doc_sha         TEXT NOT NULL,   -- sha256 of text. The identity the signature covers
  text            TEXT NOT NULL,   -- the authored document itself, stored not recomputed
  authored_at     TEXT NOT NULL,
  authored_by     TEXT,            -- the member who drove op=publish
  sig_armored     TEXT,            -- NULL until op=caseratify. NULL means AUTHORED AND UNSIGNED
  attestor_key    TEXT,
  attestor_member TEXT,
  delivered_by    TEXT,            -- REC-128 WHO DELIVERED, from the session. NULL means not recorded, never the signer
  gate_version    TEXT,
  ratified_at     TEXT,
  PRIMARY KEY (case_id, edition)
);
-- D-442 / BIO_Publication_v0_1.md section 3 rule 12: WHICH CASES EXCLUDED THIS DOCUMENT, projected
-- from the CASE DOCUMENT. inquiry_exclusions answered it from a FINDING's own completeness_excluded,
-- which op=publish's promotion wrote there -- and rule 12 stops that promotion, so a case published
-- under it states its exclusions once, in its document, and nowhere in any member. Without this
-- projection op=excludedby would silently stop naming every case published after rule 12, which is
-- a reader left on the old bytes. DERIVED from case_documents.text, re-projected whole for a
-- (case_id, edition) whenever op=publish authors or re-authors that document, and never touched
-- after it is signed (the document can no longer change). Kept for EVERY edition: a case that
-- excluded a document at edition 1 has still excluded it there, whatever edition 2 says.
-- description and reason are NOT NULL for inquiry_exclusions' own reason. The whole-store purge
-- clears the rows of every UNRATIFIED document with the document itself (D-113), and keeps a
-- ratified document's for case_documents' own reason.
-- ONE ROW PER (case edition, MEMBER, exclusion row): an excluded document is reported on each member
-- finding of the case, as inquiry_exclusions always reported it, and the member, its own edition
-- and the publishing project are columns so op=excludedby answers in ONE indexed, gated statement
-- with no read per row (derivation-bounds' class).
CREATE TABLE IF NOT EXISTS case_exclusions (
  case_id        TEXT NOT NULL,
  edition        INTEGER NOT NULL,
  bundle_id      TEXT NOT NULL,
  ord            INTEGER NOT NULL,
  member_edition INTEGER,
  project_id     TEXT,
  target_id      TEXT,
  description    TEXT NOT NULL,
  reason         TEXT NOT NULL,
  author         TEXT NOT NULL,
  at             TEXT NOT NULL,
  PRIMARY KEY (case_id, edition, bundle_id, ord)
);
CREATE INDEX IF NOT EXISTS case_exclusions_target ON case_exclusions(target_id);
-- REC-26 / MACHINE-PROCESSES.md risk 2: the IDEMPOTENCE KEY for the two periodic
-- consumers that FIRE something (CAP-3's archive-monitor and REC-26's
-- monitor-cadence). It exists because a retry is not free here: an archive
-- fallback that succeeds calls recordCapturedLocator, which on conflict does
-- observations = observations + 1, and a run of observations across an interval
-- is the PRIMARY contemporaneity route (LINK-FIDELITY.md). So an alarm retry
-- that re-fires an address that already succeeded MANUFACTURES CORROBORATION —
-- three retries of one observation produce three observations. That is the
-- standing rule "an equality or an outcome that costs nothing to produce is not
-- evidence" landing in a table, not an optimisation.
--
-- One row per (consumer, subject) fired within one TICK EPOCH. The row is written
-- BEFORE the expensive act — taskEnqueue's producer-first dedup pattern — so a
-- subject that was fired and then lost to a throw is still recorded as fired.
CREATE TABLE IF NOT EXISTS monitor_fired (
  consumer  TEXT    NOT NULL,
  subject   TEXT    NOT NULL,
  epoch     INTEGER NOT NULL,
  fired_at  TEXT    NOT NULL,
  PRIMARY KEY (consumer, subject, epoch)
);
CREATE INDEX IF NOT EXISTS monitor_fired_epoch ON monitor_fired(consumer, epoch);

-- The OPEN tick per consumer, and it is the half that makes the key above work
-- across an alarm retry. A retry arrives with a NEW Date.now(), so now cannot
-- identify the tick; the epoch has to be remembered. A row here means "a tick
-- started and did not finish cleanly", so the next tick REUSES its epoch and is
-- that tick's retry rather than a fresh one. It is deleted when a tick completes
-- with nothing failed, which is what lets the NEXT cadence really re-check.
CREATE TABLE IF NOT EXISTS monitor_tick_epoch (
  consumer   TEXT PRIMARY KEY,
  epoch      INTEGER NOT NULL,
  opened_at  TEXT NOT NULL
);

-- REC-24 (a): WHY AN ACTION EXISTS, and it is DELIBERATELY inquiry_basis's
-- shape rather than a new one. Read from the action it is *why we are asking*;
-- read from the case it is *what we did about it*. One table, one grammar, one
-- projection discipline: a projection of the action document's own
-- action_basis[] block, re-projected WHOLE on every promotion, never a second
-- place the relationship is stated (D-21).
--
-- kind is 'rests_on' (this action is built on that finding) or 'advances'
-- (this action pursues that question). TWO kinds and not one, because the
-- difference is what DEC-13 rides on: a request_for_comment names THE SPECIFIC
-- INQUIRIES IT DISCLOSED as advances legs, so "we contacted them" and "we put
-- these four claims to them" are different rows in the record rather than the
-- same sentence. The Columbia review of Rolling Stone identified a comment
-- request made WITHOUT SPECIFICS as the central failure; this column is where
-- the specifics live.
--
-- It is ALSO where DEC-14's outcome/impact line is drawn. A recorded
-- consequence is an OUTCOME by default and needs nothing here; promoting it to
-- an IMPACT claim requires a rests_on leg pointing at evidence that is NOT
-- our own action and NOT a document this action's own correspondence produced.
-- Absent that, the claim is RECORDED and its state is unproven — a stated
-- state on the R1 shape, never a fifth grade and never a low one.
--
-- action_basis_target is the reverse index: "which actions rest on this
-- finding" is ONE indexed lookup, exactly as inquiry_basis_target is for
-- questions. Cleared in BOTH purge arms via the TABLES list (D-113);
-- hygiene.test.mjs holds that list against this file.
CREATE TABLE IF NOT EXISTS action_basis (
  bundle_id   TEXT NOT NULL,   -- the action
  ord         INTEGER NOT NULL,-- position in action_basis[], so a leg is addressable
  target_id   TEXT NOT NULL,   -- an INFO- or an INQ-/PROB-/FOCUS- bundle
  target_type TEXT NOT NULL,   -- denormalised from the id prefix through the catalog's map
  kind        TEXT NOT NULL,   -- 'rests_on' | 'advances'
  note        TEXT,
  at          TEXT,            -- the document's own authored date, never a server stamp
  PRIMARY KEY (bundle_id, ord)
);
CREATE INDEX IF NOT EXISTS action_basis_target ON action_basis(target_id);
CREATE INDEX IF NOT EXISTS action_basis_bundle ON action_basis(bundle_id);

-- REC-24 (b): THE CORRESPONDENCE LEDGER — what we sent, what came back, and
-- what did NOT come back. A projection of a new frontmatter correspondence[]
-- block exactly as refs is of references[]: re-projected whole on every
-- promotion, appended to by op=actioncorrespond and NEVER rewritten, because a
-- correspondence entry that changed is itself a fact rather than a correction.
--
-- THE CAPTURE-OR-TESTIFY CHOICE IS STRUCTURAL, and it is the reason two of
-- these columns are nullable rather than one being NOT NULL. An entry carries
-- either an artifact_sha that resolves in register — the bytes, hashed, the
-- thing we can prove later — OR an account with an author, which is a
-- member's dated testimony that this exchange happened. NEVER NEITHER (an
-- entry standing for nothing) and NEVER BOTH (bytes and a paraphrase of the
-- same exchange competing to be the record; DEC-13 is explicit that what comes
-- back is CAPTURED, not summarised). C-2.10 enforces the choice over the
-- document and promote enforces the RESOLUTION of the sha, which only the store
-- can see. This is inquiry_exclusions' target-or-prose structure one construct
-- over.
--
-- direction is 'sent', 'received', or 'no_response'. The third is not a
-- bookkeeping convenience: DEC-13 rules that a refusal to reply is a dated
-- first-party fact about the body and frequently the more useful one, so it is
-- RECORDED with its date rather than left as an absence a reader has to infer.
-- A no_response entry is testimony by construction — there are no bytes to
-- hash when nothing arrived — and takes the account/author arm.
--
-- author is SERVER-STAMPED at index.mjs from the authenticated session, like
-- every other authorship in this plane: who put a testimonial account on the
-- record is part of the record, and a caller naming it would be a caller
-- signing as somebody else. recorded_at is when the entry was written; at is
-- when the exchange HAPPENED, and they are different facts.
--
-- artifact_bundle_id is resolved from the register at projection time, so the
-- ledger can name the INFO- bundle a captured reply became without the document
-- restating it. Cleared in BOTH purge arms via the TABLES list (D-113).
CREATE TABLE IF NOT EXISTS correspondence (
  bundle_id          TEXT NOT NULL,   -- the action
  ord                INTEGER NOT NULL,-- position in correspondence[], append-only
  direction          TEXT NOT NULL,   -- 'sent' | 'received' | 'no_response'
  at                 TEXT NOT NULL,   -- when the exchange happened (authored)
  medium             TEXT,
  party              TEXT,
  artifact_bundle_id TEXT,            -- resolved from register, NULL for testimony
  artifact_sha       TEXT,            -- the capture, XOR account/author below
  account            TEXT,
  author             TEXT,            -- server-stamped, required with account
  recorded_at        TEXT,
  PRIMARY KEY (bundle_id, ord)
);
CREATE INDEX IF NOT EXISTS correspondence_artifact ON correspondence(artifact_sha);
CREATE INDEX IF NOT EXISTS correspondence_bundle ON correspondence(bundle_id);

-- D-148: A FEE QUOTE IS EVIDENCE (BIO_Case_Making_v0_1.md section 2, Bob 2026-09-22).
-- A received correspondence entry may carry a QUOTE - the amount and currency
-- as quoted, the stated basis verbatim, and the ord of the sent entry it
-- answers; a later quote may name the quote it revises, and a waiver is a
-- revision to zero with BOTH entries standing. This table is a PROJECTION of
-- those entry keys, written in promote's transaction by the same
-- delete-then-insert as correspondence above, never a second place to state a
-- quote (D-21). It exists so a read can set quotes side by side by
-- counterparty and by request with an index rather than a walk of every
-- action's bytes.
--
-- amount is the text AS QUOTED and value is its parse, so ordering never
-- rewrites what the body said. counterparty is the action's own
-- counterparty.name, denormalised at projection and NULL when the action
-- states its counterparty undetermined - such a quote is still read by its
-- request. The record asserts only what was quoted, by whom, when, for which
-- request: no column here judges a quote (DEC-24). Cleared in BOTH purge arms
-- via the TABLES list (D-113).
CREATE TABLE IF NOT EXISTS action_quotes (
  bundle_id    TEXT NOT NULL,   -- the action
  ord          INTEGER NOT NULL,-- the received entry carrying the quote
  amount       TEXT NOT NULL,   -- as quoted
  value        REAL,            -- amount parsed, for setting side by side
  currency     TEXT NOT NULL,   -- as quoted, never inferred
  basis        TEXT,            -- verbatim, NULL when none was recorded
  answers_ord  INTEGER NOT NULL,-- the sent entry it answers
  revises_ord  INTEGER,         -- the earlier quote it revises, if any
  counterparty TEXT,            -- the action's counterparty.name, NULL if undetermined
  at           TEXT NOT NULL,   -- when the quote was received (authored)
  PRIMARY KEY (bundle_id, ord)
);
CREATE INDEX IF NOT EXISTS action_quotes_counterparty ON action_quotes(counterparty);

-- IS-6 / INVESTIGATIVE-SESSION.md §11: THE RUN IS AN OBJECT, and it is built on
-- the capture_sessions shape above rather than on a new one — "SCRATCH, not
-- record… a work list with an expiry": ticks, an expiry, opaque state,
-- resumable across invocations. Every column beyond that shape is one §11 or
-- §14b.6 names, and each is here because a version is only interpretable
-- against the conditions it was formed under.
--
-- THE LEASE IS THE HEARTBEAT AND 'expires' IS IT. A run extends it on every
-- tick. A run that is KILLED extends nothing, so the lease lapses and the
-- ai-run-reap scheduler consumer terminates it — which is how the observation
-- log gets its terminal entry for a run that never ran its own exit path. That
-- is the whole of §14b.6's guarantee and the reason this column is not merely a
-- TTL for tidiness.
--
-- TWO PRINCIPALS, NEVER ONE (§14a, DEC-27(b), DEC-55.4). 'principal_plane' is
-- the plane credential ('token:<class>' or a member id); 'principal_claude' is
-- WHICH LEVEL of the Claude-account cascade paid — member, then project, then
-- instance. They are two different principals and an act must say both. NEITHER
-- IS EVER A TOKEN VALUE: 'principal_claude_ref' is a label the operator
-- configured, not a secret, and nothing in the plane writes a credential here.
--
-- NO TRANSCRIPT COLUMN, AND THAT IS DEC-61 (Bob, 2026-08-06). The model's
-- reasoning is DEVICE-LOCAL, TTL'd and deleted at publication, and never in the
-- record store. 'state' is the run's resumable SCRATCH — its work list — and
-- the observation log below is a structured account of where the search went.
-- Neither is a transcript, and there is no column here one could be put in.
CREATE TABLE IF NOT EXISTS ai_runs (
  run                   TEXT PRIMARY KEY,
  status                TEXT NOT NULL DEFAULT 'running',
  label                 TEXT,
  mode                  TEXT,
  context_type          TEXT NOT NULL,
  context_id            TEXT NOT NULL,
  principal_plane       TEXT NOT NULL,
  principal_claude      TEXT NOT NULL,
  principal_claude_ref  TEXT,
  skill_version         TEXT,
  bias_manifest         TEXT,
  standard_pair         TEXT,
  created               TEXT NOT NULL,
  updated               TEXT NOT NULL,
  expires               TEXT NOT NULL,
  ticks                 INTEGER NOT NULL DEFAULT 1,
  state                 TEXT NOT NULL,
  stopped_bound         TEXT,
  stopped_condition     TEXT,
  stopped_at            TEXT,
  lens_at_open          TEXT
);
CREATE INDEX IF NOT EXISTS ai_runs_expires ON ai_runs(status, expires);
CREATE INDEX IF NOT EXISTS ai_runs_context ON ai_runs(context_id);

-- §14b.6's budget, ONE ROW PER BOUND, with its live consumption beside it.
-- Rows rather than columns because F11 (§19, carried by UI-38) requires the
-- surface to render the budget and its consumption while the run is live, and
-- its renderers are field-name-blind — they walk what the record published. A
-- bound added later is a row, and nothing on any surface moves.
--
-- BOTH NUMBERS ARE STORED. UI-38 derives nothing and its suite fails any
-- arithmetic in the rendered output, so the record must publish 'allowed' and
-- 'consumed' separately; a percentage or a remainder computed here would only
-- move the same defect one layer down.
CREATE TABLE IF NOT EXISTS ai_run_bounds (
  run       TEXT NOT NULL,
  bound     TEXT NOT NULL,
  allowed   INTEGER NOT NULL,
  consumed  INTEGER NOT NULL DEFAULT 0,
  unit      TEXT,
  PRIMARY KEY (run, bound)
);

-- D-85 (INVESTIGATIVE-SESSION.md section 11 item 5, rule 2, BOB #25, 2026-09-21): AN ASSISTANT OPENS A
-- QUESTION ONLY INSIDE A RUN. When an 'ai' credential creates an inquiry it names a RUNNING run whose
-- principal it is, and the plane records the link HERE, keyed by the new inquiry. It is an INSTANCE row and
-- never a line in the inquiry's signed bytes: the run is scratch and is never published, and a pointer in
-- published bytes that no reader can resolve is not provenance. One row per inquiry (an inquiry is created
-- once). Its principal is the control plane's stamp for the credential that created it, never a field it sent.
-- The column is named bundle_id so the row rides purge's TABLES list and clears in BOTH arms (D-113).
-- NO index beyond the key: every reader asks by the inquiry.
CREATE TABLE IF NOT EXISTS inquiry_run_surfacings (
  bundle_id  TEXT PRIMARY KEY,
  run        TEXT NOT NULL,
  principal  TEXT NOT NULL,
  at         TEXT NOT NULL
);

-- REC-173 (INVESTIGATIVE-SESSION.md section 11 item 5, A MIGRATION IS A REPLAY, NOT A SURFACING, BOB #30,
-- 2026-09-23): the inquiries whose CREATION was a server-verified MIGRATION REPLAY. The control plane admits one
-- only for the ADMIN class and only when the drive-provenance capture it names is registered, held, and lists this
-- bundle id and this bundle.md SHA-256. Such a question was surfaced in the Drive era, not on this plane, so no run
-- is recorded for it and its read says so in words (not recorded, migrated from the Drive era) rather than guessing.
-- An INSTANCE row, never a line in the question's bytes, which are the Drive era's verbatim. capture_sha is the
-- provenance capture, promotion_key the preserved Drive promotion whose record listed the bytes. One row per
-- inquiry, written in the creation's own transaction. Named bundle_id so it rides purge's TABLES list and clears in
-- BOTH arms (D-113). NO index beyond the key: the one reader asks by the inquiry.
CREATE TABLE IF NOT EXISTS inquiry_migration_replays (
  bundle_id      TEXT PRIMARY KEY,
  capture_sha    TEXT NOT NULL,
  promotion_key  TEXT,
  at             TEXT NOT NULL
);

-- THE OBSERVATION LOG (§11). Where the run searched across the four levels,
-- what it established, where it STOPPED and why. APPEND-ONLY: 'seq' is
-- monotonic per run and no row is ever updated, because a resumed run reads its
-- own log and continues (§14b.7) and a log that can be rewritten is not
-- evidence of anything.
--
-- IT IS NEVER WRITTEN INTO bundle.md. §11: "the observation log cannot live in
-- bundle.md, which is written only on success — the log's whole value is the
-- failure path." C-22.6 refuses an entry that names a bundle at the one append
-- site, so the separation is enforced where the write happens rather than
-- asserted about every reader.
--
-- 'state' is D-129's vocabulary and the column is deliberately not an enum in
-- SQL: the refusal is C-22.1 in airun.mjs, where it can NAME the five legal
-- values and say why. A CHECK constraint here would refuse with a SQLite error
-- nobody can translate, which is precisely what DEC-49 exists to prevent.
--
-- 'governed' is D-104's split as a stored fact: 1 means OUR pacing held us,
-- which is a fact about us and never about the source. C-22.2 refuses any
-- definitive state on a governed row.
-- REC-93 / IC-92, 2026-09-14: ai_run_log STOOD HERE AND IS NOW THE
-- observations TABLE further down this file. OBSERVATION-LOG-DESIGN.md
-- section 4.4 folds it: its rows are rows of that table with
-- authority_kind = run, and store.mjs #migrate copies every existing row across
-- and then DROPS the old table. The CREATE is removed rather than left standing
-- because an idempotent create would rebuild an empty ai_run_log on the next
-- boot and put the store straight back into the two-tables state section 4.4
-- forbids -- one fact, two writers, which is the D-164 failure this design
-- names. op=airunlog reads through unchanged, so I3 does not move.
--
-- THE WORDING OF THE LINE ABOVE IS LOAD-BEARING AND IS NOT A STYLE CHOICE: it
-- first read "because CREATE TABLE IF NOT EXISTS would rebuild ...", and
-- hygiene.test.mjs harvests table names out of this file by that exact literal,
-- so the sentence DESCRIBING the removal was itself parsed as a table named
-- "would" and failed the D-113 purge census. Measured, not reasoned -- the scan
-- cannot tell prose from schema, so prose here does not spell the phrase.

-- =========================================================================
-- PL-1 / IS-1 -- BASIS VERSIONS (INVESTIGATIVE-SESSION.md section 6).
--
-- An inquiry's basis supports many VERSIONS, each a complete alternative
-- account of the support for the inquiry's claim rather than a patch to
-- another one. Section 5: the composition is the unit of meaning, so the composition
-- is the unit of change.
--
-- THESE TWO TABLES ARE PROJECTIONS AND NOT A SECOND PLACE TO STATE A FACT
-- (D-21), and that distinction is the whole of the item's trap. The AUTHORITY
-- is bundle.md's own basis_versions[] block, exactly as basis[] is the
-- authority inquiry_basis projects. Both tables are written delete-then-insert
-- inside op=promote's ONE transaction, beside the inquiry_basis projection they
-- sit next to, and NOTHING ELSE IN THE PLANE INSERTS INTO EITHER OF THEM. A
-- directly-written version table -- one an op could append to without a
-- promotion -- is the second-place-to-state-a-fact D-21 forbids by name, and
-- test/versions.test.mjs pins the write-site count at one over the real source
-- rather than trusting this comment.
--
-- WHY TWO TABLES AND NOT ONE. A version has ONE description, ONE relationship,
-- ONE state; it has MANY legs. That is the same shape as bundles/inquiry_basis
-- one level down, and collapsing it would either repeat the description on
-- every leg row (D-21 again, retail) or hide the legs in a JSON blob that no
-- index can reach and no query can ask a question of.
--
-- composition IS SERVER-COMPUTED AND THE DOCUMENT NEVER CARRIES IT. It is the
-- version's frozen composition CANONICALISED -- name, description, claim,
-- relationship, derived_from, the grounds rows and every leg field, in a fixed
-- order with a fixed separator -- and it is what section 6 rule 3's FREEZE
-- compares on: a promotion re-offering an existing name with a different
-- composition is REFUSED (C-25.11), so editing produces a NEW version derived
-- from the old one rather than moving the old one underneath whoever is reading
-- it. It is computed here and not accepted from the caller for CLAUDE.md's
-- standing reason: a value a caller can hand us is a value a caller can invent,
-- and a freeze checked against a caller-supplied digest freezes nothing.
--
-- IT IS THE COMPOSITION ITSELF AND NOT A DIGEST OF IT, which is a deliberate
-- choice with two reasons and one cost. (1) op=promote is SYNCHRONOUS and this
-- plane's sha256 is crypto.subtle's, which is not; reaching for a hand-rolled
-- synchronous hash to fill that gap would put a collision argument underneath a
-- rule whose entire job is that two members comparing a version are comparing
-- the same thing. (2) A byte comparison of the composition can NAME WHAT
-- CHANGED, and the refusal does -- a digest comparison can only say that
-- something did, which is the shape of gate that leaves a member to re-derive
-- what the store already knows. The cost is storage, and it is small: a
-- composition is the version's own fields, which the record is holding in
-- bundle.md anyway.
--
-- WHAT IS DELIBERATELY *NOT* IN THE COMPOSITION: state, hidden, at, author and
-- run. A version's STATE moves -- suggested/considering/accepted/rejected are
-- IS-2's six member acts -- and the PRUNE flag moves, because prune HIDES and
-- never deletes (D-214, DEC-29(b)). Freezing those would freeze the state
-- machine shut. The composition is what a member compares when they compare two
-- versions; the rest is what happened TO it.
--
-- run HAS NO FOREIGN KEY AND THAT IS SECTION 14b.7, not an omission. "A version
-- SURVIVES the death of the run that proposed it -- identity is not the run's."
-- ai_runs is SCRATCH with an expiry (section 11, modelled on capture_sessions); the
-- version is RECORD. So the column names the run and nothing joins on it being
-- alive, promote does not resolve it, and a version whose run has been reaped
-- reads whole with the run still named. That is a STATED departure from the
-- resolve-or-refuse posture every other id-bearing field here takes
-- (subject_entity, action_basis targets, supersedes) -- taken because the
-- alternative makes version identity a child of a scratch row's lifetime, which
-- is precisely what section 14b.7 refuses.
--
-- ground IS NOT NULL ON A VERSION LEG, deliberately unlike inquiry_basis.ground
-- one level down. There, NULL is the implicit single ground -- the right
-- default for every leg written before REC-42 existed. A version has no such
-- history: section 3 requires the version to CARRY the ground partition and the AND/OR
-- relationship, because "a version that is a flat leg set cannot express
-- plurality" and "a version with no relationship field would re-ship the flat-AND
-- basis REC-42 corrected" (SWEEP C5). The partition is therefore TOTAL on every
-- version and the column says so in SQL.
--
-- NO extent COLUMN, and it is stated rather than left to be noticed. D-164 is
-- UNLANDED: legs address WHOLE BUNDLES today. A nullable extent column nothing
-- writes would be the record advertising a precision it does not have -- a
-- reader would take its absence for "the whole document was meant" rather than
-- "this record cannot say". When D-164 lands, the column arrives with a writer.
--
-- CITATION RE-POINTED 2026-09-14 (CPDF-17). THE AUTHORITY ON THIS ABSENCE IS NOW
-- PART II of docs/architecture/BIO_Content_Framework_v0_10.md, and it is cited by
-- SECTION rather than by line so it cannot go stale the way a line number does:
-- section 15's "content-extent primitive" row, which grades the whole primitive
-- DESIGNED-not-built and PARKED, and section 17's REFER-document and REFER-content
-- rows, both of which quote THESE FIVE LINES as the standing evidence that a basis
-- leg cannot record an extent. It is here because a paragraph that states an
-- absence and points nowhere leaves the next reader to re-derive whether the
-- absence is still real.
--
-- AND BY SECTION FOR A MEASURED REASON, NOT A STYLISTIC ONE. The LINE citations
-- that stood elsewhere in this file -- the ones spelled as the framework prefix
-- followed by a bare line number -- were EARLY BY 89 LINES, and they FAILED
-- SILENTLY: the line still existed and carried unrelated prose, so a reader who
-- followed one was misinformed rather than stopped. REC-81 converted every one of
-- them to a SECTION citation on 2026-09-14, here and at the seven sites elsewhere
-- in bio-plane/src and INTERFACES.md, so none is left to enumerate.
--
-- THE OFFSET IS 89, AND THIS PARAGRAPH FIRST CARRIED 84. The wrong figure is named
-- rather than quietly swapped, because a hand-carried number going stale is this
-- project's most-repeated finding and a silent correction teaches nobody. Measured
-- 2026-09-14 by REC-81 against the pre-front-matter text at 3f5e833: EVERY Part I
-- heading moved by exactly 89 lines (section 1 from 98 to 187, section 3 from 230
-- to 319, section 7 from 476 to 565, section 8.1 from 535 to 624), and an alignment
-- sweep over the first 300 body lines matched 283 of them at +89 against 11 at +84,
-- which is the rate at which blank lines agree by accident. The two Part II pointers this item
-- adds cannot decay the way a line number does, which is the argument for the
-- form and the reason CORPUS-STANDARD.md now rules it.
--
-- BOTH TABLES CARRY bundle_id AND BOTH ARE IN op=purge's TABLES LIST (D-113).
-- A whole-store purge reporting scope ALL while an inquiry's alternative
-- accounts survived is the silent leftover that list exists to prevent, and
-- hygiene.test.mjs holds the list against this file.
CREATE TABLE IF NOT EXISTS inquiry_basis_versions (
  bundle_id     TEXT NOT NULL,    -- the inquiry whose basis this is a version of
  name          TEXT NOT NULL,    -- UNIQUE PER INQUIRY (section 6 rule 2) -- the primary key says so
  ord           INTEGER NOT NULL, -- position in basis_versions[], so the order authored is readable
  description   TEXT NOT NULL,    -- REQUIRED (section 6 rule 1): held to a commit message's standard
  relationship  TEXT NOT NULL,    -- 'and' | 'or': the composition this version ASSERTS, checked against the partition
  state         TEXT NOT NULL,    -- suggested | considering | accepted | rejected (section 6 rule 4 -- IS-2 owns the transitions)
  -- PL-2 / IS-2: WHO moved this reading, WHEN, and WHY. Three additive nullable
  -- columns and NO fourth table, deliberately. D-214 requires that the acts
  -- PERSIST -- a member who turns down every suggestion running against their
  -- thesis is visible only if the acts do -- and these three make that visible
  -- at the grain the rule is about, because a version is never deleted and
  -- hiding one is not deleting it either. A separate act LEDGER would be a third
  -- table carrying versions of a basis, which PL-1 pinned at exactly two, and
  -- the intermediate moves it would hold are already in the append-only history
  -- of bundle.md.
  -- OUTSIDE THE FROZEN COMPOSITION, exactly as state and hidden are, and for the
  -- same reason -- see the composition note above. Freezing what happened TO a
  -- version would freeze the state machine shut before it existed.
  state_by      TEXT,             -- the NAMED MEMBER who moved it. Never a machine identity
  state_at      TEXT,
  state_reason  TEXT,             -- REQUIRED entering considering or rejected (section 6 rule 4)
  -- D-271 / DEC-32 clause 4: WHAT THE ACCEPTING MEMBER AFFIRMED, not merely THAT
  -- they affirmed. The ruling's anti-gaming keystone is that independent
  -- sufficiency must be affirmatively claimed PER PART, so strengthening a
  -- finding by repackaging costs an act carrying a member's name and can never
  -- happen by omission or by default. A boolean here would record a signature on
  -- a blank page: a later reader could not tell an affirmation that covered the
  -- whole reading from one that covered a single part, which is the distinction
  -- clause 7 makes them responsible for checking. So this holds the PART NAMES,
  -- tab-separated, exactly as the member sent them and in the record's own order.
  -- NULL on every version nobody has accepted and on every accept of a reading
  -- declaring one part, where there is nothing to affirm independence BETWEEN --
  -- and NULL is the honest answer in both cases rather than an empty string that
  -- would read as an affirmation naming nothing.
  -- OUTSIDE THE FROZEN COMPOSITION, exactly as state and state_by are, and for
  -- the same reason: it is something that happened TO a version, not anything the
  -- version SAYS, and freezing it would freeze the accept shut.
  affirmed_parts TEXT,
  derived_from  TEXT,             -- the version NAME this was derived from. NULL = composed fresh (section 6 rule 3a)
  hidden        INTEGER NOT NULL DEFAULT 0,  -- the PRUNE flag. Hiding is not deleting: the row stays and stays queryable
  -- PL-3 / IS-4: WHICH OF SECTION 9'S FIVE KINDS this version is, when a run
  -- proposed it. NULL on every version a member composed by hand, and NULL is
  -- the honest answer there rather than a default -- a member's own reading is
  -- not a suggestion of any kind. INSIDE the frozen composition and only when
  -- present, so a version carrying no kind composes byte-identically to what
  -- PL-1 froze and a kinded one cannot have its kind edited afterwards.
  kind          TEXT,
  claim         TEXT,             -- D-217b: a reworded claim carried AS A VERSION rather than as a new inquiry
  run           TEXT,             -- the run that proposed it. NO foreign key -- see 14b.7 above
  author        TEXT,
  at            TEXT,
  regroup_by    TEXT,             -- DEC-50 / section 6.7: a derivation that REGROUPS the partition is an attributed act
  regroup_at    TEXT,
  regroup_note  TEXT,
  composition   TEXT NOT NULL,    -- server-computed canonical composition. The freeze compares it BYTE FOR BYTE
  leg_count     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (bundle_id, name)
);
-- "which versions did this run propose" is 14b.7's own question asked from the
-- other side, and it is the one query that reads across inquiries.
CREATE INDEX IF NOT EXISTS inquiry_basis_versions_run ON inquiry_basis_versions(run);
-- The derivation TREE (section 6 rule 3a). Children of a version are read by (inquiry,
-- parent name), which is the walk the prune offer and the diff surface both make.
CREATE INDEX IF NOT EXISTS inquiry_basis_versions_derived ON inquiry_basis_versions(bundle_id, derived_from);

CREATE TABLE IF NOT EXISTS inquiry_basis_version_legs (
  bundle_id    TEXT NOT NULL,
  name         TEXT NOT NULL,    -- the version this leg belongs to
  ord          INTEGER NOT NULL, -- position in the version's legs[], so a leg is ADDRESSABLE (D4's reasoning)
  target_id    TEXT NOT NULL,
  target_type  TEXT NOT NULL,    -- 'information' | 'inquiry' and NOTHING ELSE (D-184 / C-2.8)
  role         TEXT NOT NULL,    -- 'supports' | 'cuts_against'
  grade        TEXT,             -- A|B|C|D, NULL = undetermined and STATED as such
  grade_axis   TEXT,             -- 'capture' | 'connection' | 'testimony' -- GRADE_AXES is the authority (D-423)
  grade_source TEXT,             -- 'resolution' | 'capture' | 'testimony' | 'hunch' | 'inherited'
  note         TEXT,
  at           TEXT,
  ground       TEXT NOT NULL,    -- the branch of the argument. NOT NULL: the partition is TOTAL on a version
  -- REC-82 / IC-83: the version leg's referent, on inquiry_basis.content_id's
  -- exact terms. The column arrived at REC-82 WITHOUT its writer, deliberately,
  -- and REC-84 / IC-84 (2) IS THAT WRITER: promote mints or finds the row per
  -- version leg through the SAME plan and the SAME content address the live
  -- basis uses, so one passage cited by a version leg and by a basis leg is ONE
  -- row by construction and there is no second allocator.
  -- NULL IS STILL A FIRST-CLASS ANSWER AND IT IS THREE DIFFERENT FACTS, each
  -- stated by the reads rather than collapsed. One, the leg rests on an INQUIRY
  -- (no capture and no part to point at, DEC-21). Two, the record holds no bytes
  -- of the information object. Three, the row is a REPLAY of a leg written under
  -- rules that did not exist, for which nothing is minted retroactively.
  -- A version leg with no stated extent is a WHOLE-DOCUMENT reference (Bob's
  -- 5.3, no unstated) and mints the document-extent row, exactly as a basis leg
  -- does. Part II section 14.4 is the doctrine and section 18 piece 1 the design.
  -- NO SEMICOLON MAY APPEAR IN THIS COMMENT -- migrate splits the schema on it.
  content_id   TEXT,
  PRIMARY KEY (bundle_id, name, ord)
);
-- The reverse index inquiry_basis_target is for, one level up: "which VERSIONS
-- rest on this document" is what a re-evaluation has to ask once an inquiry
-- carries alternatives, and the answer must not be a scan of every leg of every
-- version of every inquiry.
CREATE INDEX IF NOT EXISTS inquiry_basis_version_legs_target ON inquiry_basis_version_legs(target_id);
-- REC-90: the other half of content:cited's EXISTS. See the measurement recorded
-- beside inquiry_basis_content above -- the two indexes are one decision.
CREATE INDEX IF NOT EXISTS inquiry_basis_version_legs_content ON inquiry_basis_version_legs(content_id);
-- =========================================================================

-- PL-12 / D-84: THE BIAS SET'S STATEMENTS, a PROJECTION of the bundle's own
-- statements[] frontmatter and never a second authority. Exactly the sense
-- inquiry_basis is a projection of basis[] (D-21: one place to state a fact),
-- written inside promote's transaction and rewritten whole on every revision,
-- so the document and this table cannot drift.
--
-- WHY IT EXISTS AT ALL, since the bytes already carry it: the EFFECTIVE SET is
-- a computation over several bundles at once — instance statements at pinned
-- revisions, minus project nullifications of unlocked statements, plus project
-- replacements and additions — and computing that by re-parsing every adopted
-- bundle's markdown on every read would make the manifest too expensive to be
-- carried by every run, which is the one thing it must be.
--
-- 'nullifies' is safeguard 1's mechanism: a project statement that loosens an
-- instance statement IS an override whatever it calls itself, and must NAME the
-- statement it loosens. The column is what makes the override visible as a diff
-- rather than as an argument about intent. 'locked' binds PROJECTS only — the
-- instance may amend or retire its own locked statements through its documented
-- adoption process.
--
-- Carries bundle_id, so it clears in BOTH purge arms via the TABLES list
-- (D-113); hygiene.test.mjs holds that list against this file.
CREATE TABLE IF NOT EXISTS bias_statements (
  bundle_id     TEXT NOT NULL,   -- the bias bundle
  ord           INTEGER NOT NULL,-- position in statements[], the addressable slot
  statement_id  TEXT NOT NULL,   -- stable within the bundle, and what an override names
  kind          TEXT NOT NULL,   -- scrutiny | inference | pattern (the closed set of three)
  subject       TEXT NOT NULL,   -- ENT-YYYY-NNNN, a subject registry key (safeguard 4)
  text          TEXT NOT NULL,
  justification TEXT NOT NULL,
  citations     TEXT,            -- JSON array, required for kind=pattern to leave draft
  locked        INTEGER NOT NULL DEFAULT 0,
  nullifies     TEXT,            -- the instance statement id this override names
  PRIMARY KEY (bundle_id, ord)
);
CREATE INDEX IF NOT EXISTS bias_statements_subject ON bias_statements(subject);
CREATE INDEX IF NOT EXISTS bias_statements_id ON bias_statements(bundle_id, statement_id);

-- PL-12 / DEC-54 (c) and (d): THE ADOPTION, which is the authored act and the
-- PIN in one row. A row here is the ONLY thing that puts a bias set in force.
--
-- WHY IT IS A TABLE AND NOT A STATE ALONE. The state says the set is adopted;
-- this says BY WHOM, WHEN, AT WHICH REVISION and OVER WHAT. 'bundle_sha' is the
-- revision pinned at the authored moment — DEC-12's edition pattern at a third
-- altitude — so a case published under this lens stays checkable after the
-- bundle moves on. 'author' is a member id and is stamped by the control plane
-- from the SESSION: a machine credential holds no name and cannot adopt
-- (C-26.9), because adoption without a name is how "we follow BBC standards"
-- becomes true of a group in which nobody agreed to anything.
--
-- 'source_url', 'retrieved' and 'source_sha256' are DEC-54 (d)'s pin for an
-- INHALED policy, copied here from the bundle's frontmatter at adoption time
-- rather than read live. Copied, deliberately: an external policy MOVES, and a
-- pin that re-reads the bundle would follow it. NULL on a natively authored
-- set, which is the honest value — there is no external source to pin.
--
-- scope_type is 'instance' or 'project'. An instance row carries scope_id ''
-- because there is one instance; a project row carries the project's bundle id,
-- which is why the per-bundle purge arm clears by scope_id as well as by
-- bundle_id (the project_participants precedent).
CREATE TABLE IF NOT EXISTS bias_adoptions (
  scope_type    TEXT NOT NULL,   -- 'instance' | 'project'
  scope_id      TEXT NOT NULL,   -- empty for instance, the project bundle id otherwise
  bundle_id     TEXT NOT NULL,   -- the bias bundle adopted
  bundle_sha    TEXT NOT NULL,   -- THE PIN: the revision adopted, never re-read, and moved to the adopted sha by promote (REC-187)
  author        TEXT NOT NULL,   -- the member who adopted it, server-stamped
  at            TEXT NOT NULL,
  source_url    TEXT,            -- DEC-54 (d), for an inhaled policy
  retrieved     TEXT,
  source_sha256 TEXT,
  PRIMARY KEY (scope_type, scope_id, bundle_id)
);
CREATE INDEX IF NOT EXISTS bias_adoptions_scope ON bias_adoptions(scope_type, scope_id);
CREATE INDEX IF NOT EXISTS bias_adoptions_bundle ON bias_adoptions(bundle_id);

-- PL-3 / IS-4 / F10 -- THE REFUSED SUBMISSION, KEPT SO A VERBATIM RESUBMIT IS A
-- STRUCTURAL NO-OP. F10 rules that the design says how the plane REFUSES and
-- never how a run must RESPOND, so a retry loop that resends the identical
-- submission would otherwise be caught only by the budget -- and the budget is
-- the backstop, not the mechanism. This table makes the second submission
-- change nothing at all: no re-evaluation, no write, no tick.
--
-- THE KEY IS THE SUBMISSION ITSELF, BYTE FOR BYTE, AND NOT A HASH. That is
-- PL-1's own reasoning transplanted: a hand-rolled synchronous hash would put a
-- collision argument underneath a mechanism that decides whether a caller is
-- told the truth about its own submission, and the composition is bounded
-- already because the endpoint caps a version's legs.
--
-- base_sha IS PART OF THE IDENTITY, and it is what stops the key going stale
-- into a false refusal. "Verbatim resubmit" means NOTHING HAS CHANGED --
-- neither the submission nor the document it would be written into. The moment
-- the inquiry moves, the same submission is a different question and is
-- evaluated again.
--
-- SCRATCH-CLASS, in capture_sessions' and ai_runs' family and NOT record: it
-- holds no member act, nothing derived from one, and nothing a case is built
-- on. Its name deliberately carries no "version" substring -- PL-1 pinned the
-- tables carrying versions of a basis at exactly two, and this carries
-- refusals.
CREATE TABLE IF NOT EXISTS suggest_refusals (
  target      TEXT NOT NULL,      -- the inquiry the submission was aimed at
  submission  TEXT NOT NULL,      -- the canonical submission, compared BYTE FOR BYTE
  base_sha    TEXT NOT NULL,      -- the inquiry's bundle_sha when the refusal was made
  code        TEXT NOT NULL,      -- the DEC-49 wire code that was returned
  payload     TEXT NOT NULL,      -- the refusal, verbatim, so the resubmit answers identically
  first_at    TEXT NOT NULL,
  last_at     TEXT NOT NULL,
  repeats     INTEGER NOT NULL DEFAULT 0,  -- how many verbatim resubmits this refusal has absorbed
  PRIMARY KEY (target, base_sha, submission)
);
CREATE INDEX IF NOT EXISTS suggest_refusals_target ON suggest_refusals(target);

-- PL-4 / IS-4 / SWEEP section 4b.1: THE CAPTURE-REQUEST DOOR.
--
-- THE AI DOES NOT CAPTURE. IT REQUESTS, AND THE DAEMON CAPTURES. That is the
-- structural gate DEC-47 kept when it withdrew the authorisation gate, and this
-- table IS the gate: a row here is an ASK, it carries no bytes, no sha and no
-- provenance, and nothing that writes it can fetch anything. The daemon drains
-- it, and DEC-47's conduct rules are enforced at that drain and nowhere else.
--
-- WHY A TABLE RATHER THAN A CONTROL-PLANE ENQUEUE. index.mjs deliberately omits
-- taskenqueue from the OPS table, with the reasoning written into the table
-- itself: no control-plane route may put an event in the queue on its own
-- account. A scoped enqueue op would have crossed that. The table keeps the door
-- the OPS comment closed still closed, keeps the daemon the sole fetcher, and
-- gives DEC-47's conduct ONE enforcement point.
--
-- SCRATCH-CLASS, in capture_sessions' and ai_runs' family and NOT record. It
-- holds no member act, nothing derived from one, and nothing a case is built on:
-- it is a work list with an expiry. The CAPTURE it produces is record and lands
-- exactly where the daemon's captures always have, at collected and never
-- higher.
--
-- BOTH PRINCIPALS ARE COLUMNS AND NEITHER IS NULLABLE (DEC-27(b), DEC-55.4).
-- They are COPIED FROM THE RUN at the request rather than resolved at the drain,
-- because a run is scratch with an expiry and the attribution must survive it:
-- an act attributable only while the run that asked is still alive is an act
-- nobody can account for afterwards. A record naming ONE of the two is the
-- defect DEC-27(b) names, so the drain refuses to compose an attribution that
-- cannot state both.
--
-- host IS DERIVED AT THE WRITE and stored, so the drain's rate rule reads one
-- column instead of re-parsing a locator inside the enforcement point. A URL
-- this plane cannot parse never becomes a row at all.
--
-- state IS THE FENCE AS WELL AS THE LIFECYCLE. requested -> draining -> captured
-- is the only route to bytes, and draining is set by the drain alone, inside the
-- tick that then fetches. op=acquire admits the capture-request arm only for a
-- row in draining, so a control-plane caller holding a real request id still
-- cannot make the plane fetch for it: the AI capturing directly rather than
-- requesting is refused by that shape and not by a class list.
CREATE TABLE IF NOT EXISTS capture_requests (
  request           TEXT PRIMARY KEY,
  run               TEXT NOT NULL,    -- the run that asked. NO FOREIGN KEY, section 14b.7's rule for versions applied one level down
  target            TEXT NOT NULL,    -- the inquiry the run is working under: a bundle id, which is what purge's per-bundle arm can find
  address           TEXT NOT NULL,    -- the public https locator asked for
  host              TEXT NOT NULL,    -- derived at the write from address
  purpose           TEXT NOT NULL,    -- the user-agent purpose token this fetch will carry
  ua_mode           TEXT NOT NULL,    -- civicos, or member-browser (BOB-3, permitted for public documents)
  principal_plane   TEXT NOT NULL,    -- copied from the run: whose scope the writes ran under
  principal_claude  TEXT NOT NULL,    -- copied from the run: WHICH LEVEL of the cascade paid
  state             TEXT NOT NULL,    -- requested | draining | captured | refused
  code              TEXT,             -- the DEC-49 wire code, when the drain refused or held this row
  detail            TEXT,             -- what the drain said, so a held row explains itself without a second call
  capture_sha       TEXT,             -- what the daemon captured. WRITTEN BY THE DRAIN ONLY
  attempts          INTEGER NOT NULL DEFAULT 0,
  requested_at      TEXT NOT NULL,
  updated           TEXT NOT NULL,
  expires           TEXT NOT NULL,
  captured_at       TEXT,
  -- PL-15 / D-213: THE OTHER QUESTION. NULL on every ordinary request, and NULL
  -- is the honest answer there rather than a default -- a capture asked for
  -- under the question the run is working bears on that question and on nothing
  -- else until somebody says otherwise.
  --
  -- WHEN IT IS SET it names a DIFFERENT inquiry from 'target': the run met
  -- evidence for question B while working question A, and this column is the
  -- observation. 'target' stays A, because the request is still accountable to
  -- the question it was made under, while THIS column names what the evidence
  -- is ABOUT. The two may never be equal, and the door refuses that rather than
  -- storing a lead that leads back where it started.
  --
  -- IT IS A SECOND BUNDLE ID ON THIS ROW, which is why purge's PER-BUNDLE arm
  -- gained a predicate for it in the same turn. The whole-store arm already
  -- clears the table, while the per-bundle arm matched 'target' only, so purging
  -- inquiry B would have left a lead standing that points at a question no
  -- longer in the store -- D-113's class arriving through a column instead of
  -- through a table, and invisible to hygiene's structural check for exactly
  -- that reason.
  lead_inquiry      TEXT,
  -- FL-4 / IS-9 / section 14b.3: WHEN THE RUN WAS WOKEN FOR THIS COMPLETION,
  -- and NULL means the daemon has answered and the run has not been told yet.
  --
  -- IT IS ON THE REQUEST AND NOT ON THE RUN, because the thing that completes is
  -- a request and a run may be waiting on several. A flag on the run would make
  -- "this run has been woken" true while a second request was still owed an
  -- answer, and the wake would be consumed by the first completion to land.
  --
  -- AN INSTANT RATHER THAN A FLAG, on the same reasoning captured_at carries:
  -- the record can then say WHEN the run was told, which is what makes a lease
  -- extension accountable to something rather than an unexplained clock move.
  --
  -- NULL IS THE HONEST DEFAULT AND IT INVENTS NOTHING. A row written before this
  -- column existed was never woken -- nothing existed to wake it -- and the
  -- consumer's own predicate requires the run to still be running, so a request
  -- belonging to a run that has already ended is never woken retroactively.
  run_woken_at      TEXT
);
CREATE INDEX IF NOT EXISTS capture_requests_state ON capture_requests(state, requested_at);
CREATE INDEX IF NOT EXISTS capture_requests_target ON capture_requests(target);
CREATE INDEX IF NOT EXISTS capture_requests_run ON capture_requests(run);

-- PL-11 / IS-5 / D-199: THE ai CREDENTIAL'S DECLARED TASK SCOPE, AND THE
-- WHOLE REASON IT IS A TABLE RATHER THAN A BINDING.
--
-- The four existing token classes -- admin, member, probe, daemon -- are ENV
-- BINDINGS. An operator sets a value in the hosting dashboard and the plane
-- compares against it. That is a settings row by another name, and D-199 (2)
-- rules it out for this one class, transplanting DEC-17's reasoning verbatim: a
-- settings row "would be a way to change the standard with nothing to read
-- afterwards", and what an AI credential may reach is exactly the thing that
-- must be amendable only as an authored, dated, on-the-record act.
--
-- So this class does not appear in classify()'s binding cascade at all. A
-- presented ai token resolves HERE, against a row a member wrote, and the row
-- says who minted it, when, for whom, and what it may do. Amending the reach
-- means writing another row with a name against it. There is nowhere to change
-- it quietly.
--
-- THE VALUE IS NEVER STORED. 'token_id' is the IDENTITY -- a short public name
-- the record can print, the act can cite and a member can revoke -- and
-- 'secret_sha' is the SHA-256 of the presented value, which is what a lookup
-- compares. Neither is the credential, and tokens.mjs's publication denylist is
-- therefore not the only thing standing between this table and a leak.
--
-- BOTH PRINCIPAL KINDS ARE LEGITIMATE AND THEY CARRY DIFFERENT ACCOUNTABILITY,
-- WHICH IS WHY 'principal_kind' IS NOT NULLABLE (D-199 (4), DEC-55 det 4). An
-- ORGANISATION-scoped key acts for the group with nobody individual behind it;
-- a MEMBER-scoped key is attributable to that member. An act must say which,
-- and the difference is not decorative: 'principal' IS THE VIEWER the plane
-- stamps on this credential's reads, so a member-scoped key sees exactly what
-- that member sees (viewerPredicate's participation filter applies to it) and
-- an organisation-scoped one sees what any instance-level credential sees. The
-- record's answer to "who is behind this" and the record's answer to "what may
-- it read" are the same string, so they cannot drift apart.
--
-- 'scope_writes' IS A JSON ARRAY OF OP NAMES AND IT IS NOT THE FENCE. The fence
-- is a SHAPE, checked at the gate on every call: an ai credential is admitted
-- only to an op a MEMBER can reach, which is a predicate over index.mjs's OPS
-- table rather than a list anybody maintains. op=capturerequestdrain carries no
-- member class by construction (PL-4: "a member reaching for it by hand would
-- be a person doing the daemon's job"), so it can never be authored into any
-- scope, and adding "ai" to its class list would not admit it either. The
-- declared writes NARROW that floor; they cannot widen it.
--
-- NOT PURGED. This is identity, in credentials' and members' family, and a
-- whole-store purge that cleared it would revoke every agent's authority as a
-- side effect of resetting the corpus -- the DIST-1 armed-alarm trap arriving
-- through the reaper. The exemption is stated in hygiene.test.mjs with that
-- reason, not merely allowed.
CREATE TABLE IF NOT EXISTS ai_credentials (
  token_id        TEXT PRIMARY KEY, -- the public IDENTITY of the credential. NEVER its value
  secret_sha      TEXT NOT NULL,    -- SHA-256 of the presented value. NEVER its value
  principal_kind  TEXT NOT NULL,    -- organisation | member. D-199 (4): an act says which
  principal       TEXT NOT NULL,    -- the stamped viewer: class:ai for an org key, member:<id> for a member key
  task_scope      TEXT NOT NULL,    -- the declared scope name, e.g. investigative
  scope_writes    TEXT NOT NULL,    -- JSON array of op names this scope may MUTATE. reads are the floor
  scope_note      TEXT NOT NULL,    -- what the authoring member said this credential is for
  minted_by       TEXT NOT NULL,    -- the MEMBER who minted it. D-199 (3): never a machine
  minted_at       TEXT NOT NULL,
  revoked_at      TEXT,
  revoked_by      TEXT,
  -- D-463: THE NAMESPACE THIS CREDENTIAL IS CONFINED TO FOR ITS WHOLE LIFE, or NULL for
  -- a credential that is not confined. The only value it may hold is 'scratch'. The name
  -- bio is not a confinement but the default, and a row saying so would be a sentence in
  -- the record that fences nothing -- D-199 (2)'s whole complaint about a settings row,
  -- arriving one column over. The vocabulary is NOT restated here: index.mjs owns
  -- NAMESPACES and judges the value at the mint edge (aiConfinementDeclaration), the way
  -- scope_writes arrives already judged by aiScopeDeclaration, because a second copy
  -- of the namespace set is the third unsynchronised answer REC-46 spent an item removing.
  --
  -- NULLABLE AND NEVER BACK-FILLED. A credential minted before this column existed was
  -- minted unconfined, and NULL is that fact rather than an absence of one: the only other
  -- value a backfill could reach for is 'scratch', which would silently narrow authorities
  -- members already granted. What reads it is one gate at the front door
  -- (confinedNamespaceGate), and an unconfined credential meets no gate at all.
  confined_to     TEXT
);
CREATE INDEX IF NOT EXISTS ai_credentials_secret ON ai_credentials(secret_sha);
CREATE INDEX IF NOT EXISTS ai_credentials_principal ON ai_credentials(principal_kind, principal);

-- REC-63 / DEC-56 / D-204: THE STANDING MARKER. When a document's provenance
-- ROUTE cannot be shown, the record carries that fact BESIDE the state rather
-- than un-saying the verification. Bob ruled the principle across DEC-56/57/58
-- on 2026-08-06: ACT, AND SAY WHAT YOU COULD NOT ESTABLISH.
--
-- WHY A ROW HERE AND NOT A FIELD IN THE BUNDLE'S OWN BYTES, which is the first
-- question a reader will ask. Writing the marker into data/provenance.json
-- would change the bundle_sha of a VERIFIED document, so the doubt about the
-- bytes would alter the bytes -- and it would be a second claim nobody made,
-- which is the same reasoning provenanceChainRebuild already gives for leaving
-- bundle.md alone. The marker is a statement by THIS INSTANCE about its own
-- evidence, so it lives where the instance's other statements live.
--
-- APPEND-ONLY, AND THAT IS DEC-19. Correction moves FORWARD: a route later
-- shown is a NEW row saying so, never a delete of the row that said it could
-- not be. The current finding is the row with the highest 'seq' for a bundle,
-- and the ones before it stay readable.
--
-- 'finding' IS D-129's VOCABULARY, taken from airun.mjs's OBSERVATION_STATES
-- rather than invented here, because this record already has words for which
-- absence it met: NEVER_LOOKED is the ABSENCE OF A ROW and is never stored,
-- LOOKED_INDETERMINATE is the marker itself (we looked and cannot tell), and
-- PRESENT is an assessment that found the route showable. LOOKED_ABSENT is
-- deliberately unreachable here: it would assert the bytes have no route, and
-- every captured byte came from somewhere -- what we cannot show is OUR
-- EVIDENCE of it, which is a statement about us.
--
-- 'state_at' RECORDS THE STATE THE DOCUMENT SAT IN WHEN THE MARKER WAS MADE,
-- because the marker's whole point is that the state STANDS while the doubt is
-- carried: a reader of the history has to be able to see that the two disagreed
-- ON PURPOSE and that nothing moved the document.
CREATE TABLE IF NOT EXISTS provenance_route_marks (
  bundle_id      TEXT    NOT NULL,
  seq            INTEGER NOT NULL, -- MAX+1 per bundle. The highest is the current finding
  at             TEXT    NOT NULL,
  by             TEXT    NOT NULL, -- the MEMBER who made the assessment. Never a machine
  finding        TEXT    NOT NULL, -- LOOKED_INDETERMINATE (the marker) | PRESENT
  state_at       TEXT    NOT NULL, -- current_state at the moment of marking
  register_state TEXT    NOT NULL, -- readable | absent | unparsable | no_documents | empty
  undetermined   INTEGER NOT NULL, -- documents whose route could not be shown
  documents_n    INTEGER NOT NULL, -- documents the register named at all
  documents      TEXT    NOT NULL, -- JSON per-document outcomes, so the marker says WHICH
  PRIMARY KEY (bundle_id, seq)
);
-- =========================================================================
-- REC-112, 2026-09-17 -- THIS INDEX HAS NO READER, AND IT IS KEPT ON PURPOSE.
--
-- WHAT IT WAITS FOR: a READ op answering the question no op asks --
-- "which documents in this instance carry a standing LOOKED_INDETERMINATE
-- marker". All four SQL readers of this table key on bundle_id and seq and
-- classify in JS, so a group asking where its own record's provenance is
-- doubted must page the whole store and count for itself. The route act is
-- registered mutating:true in index.mjs -- a WRITE. There is no read.
--
-- IT IS NOT DEAD WEIGHT AND IT IS NOT MIS-SPECIFIED, and that is MEASURED
-- rather than read off the SQL (EXPLAIN QUERY PLAN, sqlite3 3.51.0, no
-- ANALYZE, which is this plane's live condition because nothing here ever
-- runs one). MEASUREMENTS.md M-41 carries the plans in full:
--   the four existing readers     -- every one uses the PRIMARY KEY autoindex,
--                                    none touches this index, and DROPPING it
--                                    leaves all four plans IDENTICAL
--   finding = ?                   -- SEARCH USING INDEX (finding=?)
--   finding = ? AND bundle_id > ? -- SEARCH USING INDEX (finding=? AND
--                                    bundle_id>?) -- BOTH columns, which is
--                                    this plane's after-cursor paging shape
--   COUNT over finding = ?        -- COVERING INDEX
-- The second column is therefore not decoration: whoever declared this knew
-- the intended reader's PAGING shape. That is evidence of a SPECIFIC reader
-- rather than a speculative index, and it is why the act was to row the
-- reader rather than to delete the declaration.
--
-- DELETING IT WAS CONSIDERED AND REFUSED. REC-92 withdrew a chain_kind index
-- a few hundred lines down on REC-12's rule -- an index nobody seeks on is
-- cost with no reader -- but that precedent governs ADDING one, not removing
-- one a dated delegation has pointed at for 39 days. Removing this would take
-- the airuns sweep's unread roster DOWN by one for a reason that is not the
-- plane getting better, which is the one direction that ratchet must never
-- move, and it would delete the very artifact that made the sweep find this
-- owed act at all. The write cost is one row per member assessment, on an
-- append-only table a member writes by hand.
--
-- THE INTENT SURVIVES IN THREE PLACES AND THIS IS THE THIRD, so the index is
-- NOT the only evidence of it: CLAIMS.md carries REC-69's DELEGATION of
-- 2026-08-09 naming the question verbatim and re-affirmed open by M0-37 on
-- 2026-09-16, airuns.test.mjs carries it on the unread roster AND pins it BY
-- NAME, and the declaration is here.
--
-- DO NOT REFLOW THE TWO LINES BELOW. test/nc-rec69-selects.mjs patches them as
-- EXACT STRING LITERALS to arm two negative controls, so a whitespace change
-- makes those arms match zero times and PASS while testing nothing.
-- =========================================================================
CREATE INDEX IF NOT EXISTS provenance_route_marks_finding
  ON provenance_route_marks(finding, bundle_id);

-- CPDF-10: TEXT ATTESTATIONS. A member says they compared a document's text
-- against the image of the page and it matches, OVER A STATED EXTENT.
--
-- FIRST-CLASS, MEMBER-DECLARED STATE, not a projection. Nothing derives this
-- and nothing can re-derive it: it is a person's testimony, so a re-promotion
-- must not rebuild it and a reader must not be able to mint it. That is the
-- resolutions precedent rather than the readings one, and it is why this table
-- is written by its own act and not by promote.
--
-- WHY THE EXTENT IS THREE COLUMNS AND NOT A BLOB. extent_kind / extent_page /
-- extent_rect are separate because COVERAGE IS A QUERY: "does any attestation
-- cover this leg's region" is asked per leg, and an extent locked inside JSON
-- would make that a scan the store cannot index. The rect is JSON because it is
-- four numbers read as a unit and never compared column-wise in SQL.
--
-- attestor is a MEMBER ID and never a machine stamp. The act refuses a machine
-- credential before it reaches here (C-35.10), and this column carrying a
-- token: prefix would mean that fence had been bypassed.
--
-- bundle_id rides so a purge takes it in BOTH arms (D-113). It is the bundle
-- the capture is filed in at the moment of attesting.
CREATE TABLE IF NOT EXISTS text_attestations (
  capture_sha  TEXT    NOT NULL,
  bundle_id    TEXT,
  attestor     TEXT    NOT NULL, -- a member id, never a machine stamp
  at           TEXT    NOT NULL,
  extent_kind  TEXT    NOT NULL, -- region, page or document
  extent_page  INTEGER,          -- NULL for a document extent
  extent_rect  TEXT,             -- JSON [x0,y0,x1,y1], NULL unless kind=region
  note         TEXT,
  chain        TEXT,             -- the chain AS IT STOOD when attested
  PRIMARY KEY (capture_sha, attestor, extent_kind, extent_page, extent_rect)
);
CREATE INDEX IF NOT EXISTS text_attestations_capture ON text_attestations(capture_sha);
CREATE INDEX IF NOT EXISTS text_attestations_bundle ON text_attestations(bundle_id);

-- CPDF-10: the TRANSCRIPTION PROVENANCE PROJECTION -- what a reading's text
-- chain says, in columns, so an OCR'd document is distinguishable from a
-- published text layer by a QUERY and not only by reading a JSON blob.
--
-- DERIVED from the reading exactly as reading_refs is, rebuilt in the same
-- transaction, and cleared by a purge in both arms (D-113). Nothing here is a
-- second authority: every column is computed from the stored chain by
-- textchain.mjs, so this table can be dropped and rebuilt and cannot disagree
-- with the reading it projects.
--
-- transcribed is the headline: 1 when some machine derived this text, which is
-- TRUE FOR A TEXT LAYER TOO -- a layer is somebody else's transcription that we
-- decode faithfully (CPDF-9 measured ABBYY FineReader in 3 of 14 recent
-- Legistar attachments). terminal_step names the last thing that touched it.
-- derivation_cap is the weakest link over the chain's derivation steps and is
-- NULL when no step carries a measured fidelity -- undetermined, stated.
--
-- CITATION RE-POINTED 2026-09-14 (CPDF-17). PART II section 15 of
-- docs/architecture/BIO_Content_Framework_v0_10.md inventories this projection as
-- the "transcription chain" form of content and is the authority on it, cited by
-- SECTION and not by line. It records what is BUILT here and, in the same row,
-- what is NOT, which this header does not say and a reader should not have to
-- discover: the ai(function, version) step is a legal shape of the chain that
-- nothing in the tree emits, a chain is per CAPTURE with page-scoped parts only
-- for a MIXED document (D-252), and the OCR member's per-line region provenance
-- reaches the reading while no edge reads it. For why the form is a SECTION and
-- not a line, and for the Part I citations in this file that REC-81 converted to
-- sections on 2026-09-14, see the no-extent block above.
CREATE TABLE IF NOT EXISTS reading_text_source (
  capture_sha    TEXT PRIMARY KEY,
  bundle_id      TEXT NOT NULL,
  transcribed    INTEGER NOT NULL DEFAULT 0,
  terminal_step  TEXT,
  engines        TEXT,    -- JSON array of engine names the chain runs through
  derivation_cap TEXT,    -- a BASIS_GRADES letter, or NULL for undetermined
  steps          INTEGER NOT NULL DEFAULT 0,
  chain          TEXT,    -- the chain itself, so a reader needs no second lookup
  -- CPDF-13 / D-253: the CALIBRATION IDS this chain's steps reference, JSON
  -- array. DERIVED from the chain by calibrationsOf() like every other column
  -- here, so it cannot disagree with the chain it projects.
  --
  -- IT IS HERE SO THE DRIFT HANDLER'S QUESTION IS A QUERY. "Which
  -- transcriptions rest on calibration CAL-n" over a JSON blob is a full scan of
  -- every reading in the store; over this column it is one indexed read. The
  -- obligation itself is still DERIVED and stored nowhere (REC-17's rule) --
  -- what is projected here is the BINDING, which is a fact about the chain, not
  -- a verdict about the document.
  --
  -- NULL means the chain names no calibration, which is the pre-CPDF-13 shape
  -- and is legal: it says this text never rested on a measurement this record
  -- holds, which is a different statement from resting on one that moved.
  calibrations   TEXT
);
CREATE INDEX IF NOT EXISTS reading_text_source_cal ON reading_text_source(calibrations);
CREATE INDEX IF NOT EXISTS reading_text_source_bundle ON reading_text_source(bundle_id);
CREATE INDEX IF NOT EXISTS reading_text_source_kind
  ON reading_text_source(transcribed, terminal_step);

-- D-266 / IC-60: THE JUDGMENT-LAYER DISPOSITION, AND IT IS A SECOND TABLE
-- RATHER THAN A WIDER PRIMARY KEY ON THE ONE ABOVE -- WHICH IS THE WHOLE ITEM.
--
-- A DISMISSAL IS SCOPED TO THE KEY'S OWN SUBJECT (the ruling, 2026-08-10, made
-- by the repository rather than by Bob). DEC-16's instance-wide clearing is
-- instance-wide BECAUSE ITS SUBJECT IS: a progression-stage finding is a fact
-- about the SHARED record, so one act clearing it under every case is dedup and
-- not judgment-suppression. A STANCE is expressly one project's own property
-- (section 7, D-216), a dismissal is a judgment-layer act, and R5 makes forks at
-- the judgment layer legitimate. So one team's dismissal of a stance-scoped
-- finding governs THAT TEAM'S feed and nothing else -- exactly the boundary
-- store.mjs #findingsStanceDiverged already enforces by refusing to offer
-- op=versioncurrent across projects.
--
-- WIDENING proposal_dispositions' OWN KEY WOULD HAVE ERASED THAT DISTINCTION,
-- and the distinction IS the item. Its key stays (progression_key, stage_key)
-- and stays instance-wide; this table is where the OTHER subject lives. Nothing
-- migrates: no disposition has ever been recorded for the stance-scoped kinds.
--
-- finding_id is the QUEUE ITEM'S OWN id, in the feed's own spelling
-- (FINDING::kind::...), so the act and the feed name one identity written by two
-- producers that never consult each other -- the same pin IC-53 put on the other
-- shape one field over. kind is carried for reading, never keyed on: a list of
-- slugs goes stale the wave a fourth non-derived finding is minted, and the
-- property this act keys on is carrying no progression stage rather than being
-- named in a list.
--
-- Member-authored state, like proposal_dispositions above, and cleared by the
-- WHOLE-STORE arm of op=purge only (it has no bundle_id) -- the D-113
-- silent-leftover, asserted against this file by hygiene.test.mjs.
CREATE TABLE IF NOT EXISTS finding_dispositions (
  project_id TEXT NOT NULL,
  finding_id TEXT NOT NULL,
  kind       TEXT,
  state      TEXT NOT NULL,
  reason     TEXT NOT NULL,
  decided_by TEXT,
  at         TEXT,
  PRIMARY KEY (project_id, finding_id)
);
-- NO SECONDARY INDEX, AND THAT IS A MEASUREMENT RATHER THAN AN OVERSIGHT. Two were
-- written here first -- on finding_id and on at, mirroring proposal_dispositions --
-- and airuns.test.mjs's index-reader ratchet FAILED THE BUILD naming them, because
-- nothing filters on either leading column: op=queue reads this table WHOLE, exactly
-- as proposalsFeed reads the other one, and the upsert seeks the primary key. An index
-- with no statement behind it is an access path built for a question no op asks, which
-- is the finding that ratchet exists to hold. Add one WITH the statement that reads it.

-- CASE-4 / DEC-72: THE REVISION FLAG. A CASE EDITION FROZE A MEMBER AT A HASH,
-- AND THAT MEMBER HAS SINCE MINTED A NEW VERSION.
--
-- The design (CASE-AS-PRODUCTION.md, "Revised findings vs the cases containing
-- them"): a case is a frozen, signed edition, honest as of its date. When a
-- member finding is later revised, the containing cases are FLAGGED, never
-- silently updated and never automatically re-published -- the cascade doctrine
-- one level up. New editions are each owning project's deliberate act.
--
-- WHY A TABLE AND NOT A DERIVED READ, WHICH IS THE ONE STRUCTURAL DECISION HERE.
-- The condition itself IS derivable: CASE-5 unslaved the member's edition from
-- the case's and made a member resolve BY ITS PIN, so "this case's pin is no
-- longer this finding's current version" is one comparison over columns that
-- already exist. A derived answer was written first and is wrong for exactly one
-- reason: IT CLEARS ITSELF. Revert the finding to the pinned bytes, or let the
-- pin and the head agree again by any route, and the derived flag vanishes with
-- nobody having acted -- which is D-79's ruling one altitude up. A finding that
-- disappears is indistinguishable from one that was never made, and a flag that
-- stops being raised is indistinguishable from a project that dealt with it. So
-- the OBSERVATION is derived (from the pin, and from no second mechanism) and
-- the FLAG is written down, once, at the moment the revision mints.
--
-- SET-BUT-NEVER-CLEAR IS LITERAL. No statement anywhere DELETES a row here. An
-- owning project that acts ADDS the discharge to the row it discharges
-- (acted_at / acted_by / acted_edition), so the record holds both the flag and
-- what was done about it, in the order it happened. A row with acted_at NULL is
-- outstanding; a row with acted_at set is history, and history is not absence.
--
-- THE ACT THAT DISCHARGES IS A NEW RATIFIED EDITION OF THAT CASE, and it is
-- deliberately an act that ALREADY EXISTS rather than a new acknowledgement op.
-- The design names it: "New editions are each owning project's deliberate act."
-- It is also the only discharge available without walking into CASE-5b's wall --
-- every case fact this plane commits is committed FROM THE SIGNED BYTES, and a
-- bare acknowledgement op would commit a case-level assertion from an unsigned
-- request. A ratified edition is signed, so the discharge rests on a signature
-- exactly as the flag's pin does.
--
-- SCOPED TO case_id, WHICH IS D-266's RULING ARRIVING HERE: a disposition is
-- scoped to the key's own subject. A case is ONE project's production (cases is
-- keyed on case_id alone, CASE-1's sharpest call), so a project acting on ITS
-- case discharges rows carrying that case_id and reaches no other project's.
-- Where several cases containing revised members are owned by several projects,
-- one project acting leaves every other project's rows outstanding -- and that
-- is structural here rather than a rule somebody has to remember, because the
-- discharge statement's WHERE clause names case_id and nothing wider.
--
-- pinned_sha is the hash the case COMMITTED TO (published_case_members.version_sha
-- as it stood) and revised_sha is the version that superseded it as the finding's
-- head. Both are stored rather than re-read: the roster row can be re-pinned by a
-- later edition, and a flag that re-read the pin would silently re-describe what
-- it was raised about.
--
-- Keyed (case_id, edition, bundle_id, revised_sha) so a member that revises
-- three times against one frozen edition raises three rows and not one -- each
-- revision is its own fact, and collapsing them would let the second and third
-- vanish into the first.
--
-- DERIVED FROM NOTHING, so it is not rebuilt by a projection pass; it is a
-- record of events. It carries a bundle_id, so it is cleared by BOTH arms of
-- op=purge -- the D-113 silent-leftover, asserted against this file by
-- hygiene.test.mjs.
CREATE TABLE IF NOT EXISTS case_revision_flags (
  case_id       TEXT NOT NULL,
  edition       INTEGER NOT NULL,  -- the CASE edition whose roster froze the pin
  bundle_id     TEXT NOT NULL,     -- the member finding that revised
  pinned_sha    TEXT NOT NULL,     -- what the case committed to
  revised_sha   TEXT NOT NULL,     -- the version that superseded it
  project_id    TEXT,              -- the OWNING project that must act. NULL for a pre-DEC-72 case, and STATED
  since         TEXT NOT NULL,
  acted_at      TEXT,              -- NULL while the flag stands. NEVER set back to NULL, and the row is never deleted
  acted_by      TEXT,              -- the member whose act discharged it
  acted_edition INTEGER,           -- the CASE edition that act published
  PRIMARY KEY (case_id, edition, bundle_id, revised_sha)
);
-- Outstanding-by-member is the question op=caseflags asks with a bundle_id, and
-- it is the only filter whose leading column is not the primary key's. The index
-- arrives WITH that statement, which is the rule the finding_dispositions comment
-- above had to learn by failing the build.
CREATE INDEX IF NOT EXISTS case_revision_flags_bundle ON case_revision_flags(bundle_id);

-- CPDF-13 / D-183 / D-253: THE CALIBRATION -- a dated, identified fidelity
-- measurement of a named derivation engine and version, stored WITH the probe
-- inputs and the scores that produced it.
--
-- THE INPUTS AND THE SCORES ARE COLUMNS RATHER THAN PROSE, and that is the
-- item. CPDF-10 shaped measured_by as a free STRING -- today
-- "MEASUREMENTS.md 2026-08-03 (CPDF-9)" -- which is better than a bare letter
-- and is still not a binding: nothing checks the pointer resolves, and nothing
-- can answer "which transcriptions rest on a measurement that has been
-- superseded". A row here is that answer's other half.
--
-- superseded_by IS THE ONLY MUTABLE COLUMN and it is set ONCE, when a later
-- probe of the same engine lands. Nothing else is ever updated: a calibration
-- is a record of a measurement that was taken, and a measurement does not
-- change after the fact. That is append-only history for the same reason the
-- record's own is.
--
-- cap NULL IS A REAL ANSWER, NOT A GAP. A probe that ran and could not
-- establish a fidelity letter measured something: that this engine's fidelity
-- is UNDETERMINED, on that date, by that probe. Recording it is strictly better
-- than recording nothing, because it is DATED.
CREATE TABLE IF NOT EXISTS calibrations (
  calibration_id TEXT PRIMARY KEY,   -- CAL-<n>, minted by the store, never by a caller
  engine         TEXT NOT NULL,      -- the derivation engine measured
  version        TEXT NOT NULL,      -- ITS version. An external service retrains under one name
  at             TEXT NOT NULL,      -- the date the PROBE RAN, never the date an announcement landed
  at_ms          INTEGER NOT NULL,   -- the same instant, for the scheduler's cadence arithmetic
  cap            TEXT,               -- a BASIS_GRADES letter, or NULL for undetermined -- STATED
  probe_id       TEXT NOT NULL,      -- which probe produced this
  probe_inputs   TEXT NOT NULL,      -- JSON. WHAT the probe was given -- two runs of one probe over
                                     -- different corpora are two measurements wearing one name
  scores         TEXT NOT NULL,      -- JSON. What came back. Stored so a later reader can disagree
  measured_by    TEXT NOT NULL,      -- who or what ran the probe
  -- WHICH CALIBRATION REPLACED THIS ONE. Set ONCE.
  --
  -- IT IS replaced_by AND NOT superseded_by, AND THAT IS A DELIBERATE
  -- NAMING CONSTRAINT RATHER THAN A PREFERENCE. D-221's version-chain pin
  -- (test/versionchain.test.mjs section 2) sweeps the WHOLE schema for any
  -- stored pointer from one version to another -- supersede/superseded_by/
  -- predecessor/previous_version and their family -- because the thesis of that
  -- item is that a document's version history is DERIVED from captures and is
  -- never an edge somebody wrote down. That pin is total on purpose and this
  -- column set it off.
  --
  -- THE PIN IS RIGHT AND WAS NOT NARROWED. A calibration is a measurement of an
  -- ENGINE, not a version of a DOCUMENT, so the two constructs have nothing to
  -- do with each other -- but loosening a total sweep to admit a lookalike is
  -- how a guard stops being total, and the next stored pointer would arrive
  -- through the hole this one made. The word moves instead, and this comment is
  -- here so a later reader knows the relationship is real and why it is spelled
  -- this way rather than concluding the author did not know the usual word.
  replaced_by    TEXT,
  drift          TEXT,               -- the verdict AT SUPERSESSION: worse, better, same, incomparable
  note           TEXT
);
CREATE INDEX IF NOT EXISTS calibrations_engine ON calibrations(engine, version, at_ms);
-- "which calibrations have been superseded by a WORSE one" is the drift
-- handler's whole question, and it is an indexed lookup rather than a scan.
CREATE INDEX IF NOT EXISTS calibrations_drift ON calibrations(drift, replaced_by);

-- CPDF-13: THE CALIBRATABLE ENGINES THIS INSTANCE ACTUALLY HAS.
--
-- The scheduler consumer reads THIS, and an instance with no row here holds NO
-- ALARM AT ALL -- which is the self-termination property REC-1 prized and the
-- reason this feature costs an idle instance exactly zero. A group that never
-- turns on a derivation engine never pays for a probe of one.
--
-- ONE PROBE PER SUBJECT PER CADENCE, on the instance's OWN account, against the
-- free allocation. That is stated in SCHEDULER.md and in calibration.mjs's
-- header as well as here, because a cost a group discovers by being billed for
-- it is a cost the plan failed to state.
CREATE TABLE IF NOT EXISTS calibration_subjects (
  engine         TEXT PRIMARY KEY,   -- the engine this instance can probe
  version        TEXT,               -- the version currently installed. NULL until a probe names one
  probe_id       TEXT NOT NULL,      -- the probe to run for it
  registered_at  TEXT NOT NULL,
  last_probe_ms  INTEGER,            -- when a probe LAST RAN. NULL means never -- due immediately
  enabled        INTEGER NOT NULL DEFAULT 1
);

-- CPDF-13, clause (e): THE ANNOUNCEMENT WATCH, WHICH MAY ONLY ACCELERATE.
--
-- A signal is somebody ELSE'S statement about their own product and the record
-- keeps it as exactly that. It carries NO cap and NO scores -- checkSignal
-- refuses one that does -- and the ONE thing it can do is pull probe_by
-- earlier than the cadence would. It may never stand in for a probe and it may
-- never itself change a grade.
--
-- AND THE ABSENCE OF A SIGNAL DOES NOTHING AT ALL. There is deliberately no
-- column here that could push a probe OUT: absence of an announcement is not
-- evidence of no change, and a silent retrain under an unchanged version string
-- is the exact failure DEC-35 named when it argued against Textract.
CREATE TABLE IF NOT EXISTS calibration_signals (
  signal_id      TEXT PRIMARY KEY,
  engine         TEXT NOT NULL,
  source         TEXT NOT NULL,      -- WHERE it was observed. A claim, attributed to its claimant
  observed_at    TEXT NOT NULL,
  probe_by_ms    INTEGER NOT NULL,   -- the instant this asks the next probe to happen BY
  detail         TEXT,
  consumed_at    TEXT                -- set when a probe ran after it. A spent signal accelerates nothing
);
CREATE INDEX IF NOT EXISTS calibration_signals_engine
  ON calibration_signals(engine, consumed_at, probe_by_ms);

-- =========================================================================
-- REC-82 / IC-83 / DEC-23 / D-164 -- CONTENT: A REFERENCE TO A PART OF A
-- DOCUMENT, UP TO AND INCLUDING THE WHOLE DOCUMENT.
--
-- Bob's definition, ruled as DEC-23: documents are what is HARVESTED, content
-- is what is EXTRACTED, and meaning derives from both. Until this table every
-- edge in the record addressed a BUNDLE -- so a leg citing one paragraph of a
-- 300-page budget book and a leg citing the whole book were the same row, and
-- the address IC-1 already emits was consumed by no edge at all (D-164).
--
-- CONTENT-ADDRESSED, AND THAT IS THE WHOLE MECHANISM (the design study's option
-- (c)). content_id = sha256(capture_sha, the CANONICAL extent, the chain as it
-- stood at mint), so two members who cite the same passage of the same bytes
-- under the same transcription get ONE row BY CONSTRUCTION. There is no
-- allocator, no dedup pass and nothing to reconcile -- and, the other half of
-- the same property, a leg can name a row before it exists, because the id is
-- derivable from the citation alone.
--
-- ROWS ARE FIRST-CLASS, NEVER DERIVED. An edge depends on one, so a row is NOT
-- rewritten by re-promotion and is NEVER DELETED when the capture is re-read:
-- a better engine moves the chain, which makes the row a reference to a
-- transcription that no longer stands, and the honest record of that is
-- stale=1 with the row and its edges still resolving and SAYING SO. Deleting it
-- would break an authored citation to make a projection tidy. This is
-- text_attestations' own stale rule (CPDF-10) applied one construct along, and
-- it is D-183's asymmetric rule: nothing re-grades on its own.
--
-- WHY A DERIVED TABLE IS STILL PURGED. It is not derived -- but it carries
-- bundle_id, so it rides op=purge's TABLES list and clears in BOTH arms
-- (D-113). A whole-store purge reporting scope ALL while content rows stood
-- would leave addresses into documents nobody holds, and a later bundle
-- allocated a colliding id would inherit somebody else's citations.
--
-- THE EXTENT GRAMMAR IS IC-1'S, UNIFIED WITH ATTESTATION'S, AND NOT A THIRD
-- ONE. extent_kind is IC-1's five arms (document | pdf-page | sheet-cell |
-- slide-shape | doc-para) read together with textchain.mjs's EXTENT_KINDS
-- (document | page | region) -- one vocabulary, one checker, one covers() per
-- arm, because D-164's lesson is that solving one problem twice produces two
-- answers that disagree. dom is REFUSED BY NAME (C-45.4) until CONTENT-HTML
-- produces one: a kind nothing can evaluate must not quietly read as covering
-- anything. REC-82 lands the WRITER on the pdf-page and document arms only --
-- the other three arms' covers is REC-85 -- and the column admits them now so
-- that landing is a writer and not a migration.
--
-- page_count IS THE STORED PAGE SET, AND IT IS WHY THE OUT-OF-RANGE REFUSAL CAN
-- FIRE AT ALL. IC-83 requires the page count be stored on mint. Nothing in this
-- plane persists a capture page count today (the design study says so in its
-- own words: "needs a stored page count -- absent today"), so this column holds
-- what the record COULD see when the row was minted: the page set D-252's
-- scoped derivation steps name, unioned with the pages any attestation covers.
-- NULL means the record held no page set for that capture at mint -- which is
-- UNDETERMINED and STATED, never a permission and never a refusal: refusing
-- every page citation on a document whose page set the record does not know
-- would be a fence tighter than its rule. D-345 is the row that closes the gap
-- by persisting I2's page count at acquire, which is CAPTURE's path.
CREATE TABLE IF NOT EXISTS content (
  content_id     TEXT PRIMARY KEY,  -- sha256 over capture_sha + canonical extent + chain
  capture_sha    TEXT NOT NULL,     -- the document. The register's trust root
  bundle_id      TEXT NOT NULL,     -- purge, and the compiler's join (D-222)
  extent_kind    TEXT NOT NULL,     -- document | pdf-page | sheet-cell | slide-shape | doc-para | sheet-range | doc-table | image (the last three FW-19)
  extent         TEXT NOT NULL,     -- the per-arm fields as canonical JSON
  ref            TEXT NOT NULL,     -- IC-1's REQUIRED human form, e.g. page 14, top half
  chain          TEXT,              -- the transcription chain over the extent, as it stood at mint
  derivation_cap TEXT,              -- min over the chain's derivation steps over THIS extent. NULL = undetermined, STATED
  page_count     INTEGER,           -- the page set the record held at mint. NULL = undetermined, STATED
  minted_by      TEXT NOT NULL,     -- a member id, 'plane', or a machine credential (5.7, DEC-24 rule 3)
  at             TEXT NOT NULL,
  stale          INTEGER NOT NULL DEFAULT 0, -- the capture's chain moved since mint. The row and its edges still resolve
  cited_as       TEXT    NOT NULL DEFAULT 'text', -- FW-19 / IC-125: text | bytes. bytes = an image cited as itself, so chain and cap are NULL by meaning and never undetermined
  chain_kind     TEXT GENERATED ALWAYS AS (json_extract(chain, '$[#-1].step')) VIRTUAL  -- REC-104. the LAST step kind of chain, derived by the engine and never written. See the index block below
);
-- The two reads this table exists to answer, and neither may be a scan. By
-- CAPTURE: which passages of this document has anybody cited (the content axis
-- of the four-level search), and the read that marks rows stale when a capture
-- is re-read. By BUNDLE: purge's per-bundle arm, and the compiler's join.
CREATE INDEX IF NOT EXISTS content_capture ON content(capture_sha);
CREATE INDEX IF NOT EXISTS content_bundle ON content(bundle_id);
-- REC-90 / CONTENT-SEARCH-DESIGN.md section 4.2 -- THE FILTERED COLUMNS OF THE
-- content: ARM. Each compiles to SELECT bundle_id FROM content WHERE <col> = ?,
-- and bundle_id is the second key column so every seek is COVERING: it never
-- touches the table. inquiry_basis_grade_source above is the precedent and this
-- is the same decision taken the same way -- MEASURED, and the measurement is
-- what chose which columns appear here.
--
-- MEASURED 2026-09-15 (test/content-index-probe.mjs, node:sqlite, the statements
-- DRIVEN out of compile() and every OTHER index DRIVEN out of schema.mjs AND
-- store.mjs rather than typed). MEASUREMENTS.md M-23 (filed as M-21, renumbered
-- at integration -- corrected here by REC-104) carries both corpus sizes,
-- the instrument, the synthetic proportions and what the instrument cannot see.
-- At 20,000 bundles / 40,002 content rows, 9 reps:
--   content:pdf-page          4.007 ms -> 2.062 ms  (-48.5%)
--   content:document          5.391 ms -> 3.276 ms  (-39.2%)   the COMMON value
--   content:stale             2.335 ms -> 0.924 ms  (-60.4%)
--   content:machine           3.625 ms -> 2.291 ms  (-36.8%)
--   content:plane             4.369 ms -> 2.726 ms  (-37.6%)
--   content:cap=undetermined  3.284 ms -> 2.194 ms  (-33.2%)
--   content:cap<C             4.907 ms -> 3.742 ms  (-23.8%)
-- AGAINST A MEASURED NOISE FLOOR OF 20.5%, which is the swing on content:ocr --
-- a query NO index in the candidate set can touch, because it filters on a JSON
-- parse of the chain column. Every figure above clears it. THE SMALLER CORPUS
-- SAID OTHERWISE FOR extent_kind (+1.6% at 5,000 bundles) and the larger one
-- overturned it, which is exactly why two sizes were measured: the quantity being
-- bought is the PROPORTION, and it grows with the corpus.
--
-- THE WRITE COST IS NOT inquiry_basis's, AND THAT ASYMMETRY IS THE REST OF THE
-- DECISION. Every op=promote of an inquiry delete-then-inserts its basis rows, so
-- an index there is re-written on every promotion. A content row is INSERT OR
-- IGNORE'd ONCE and is never rewritten and never deleted (the rule at the head of
-- this block), so each index here is one B-tree insert per mint and nothing on
-- re-promotion. An index is cheaper on this table than on any other in the store.
CREATE INDEX IF NOT EXISTS content_extent_kind ON content(extent_kind, bundle_id);
CREATE INDEX IF NOT EXISTS content_stale ON content(stale, bundle_id);
CREATE INDEX IF NOT EXISTS content_minted_by ON content(minted_by, bundle_id);
CREATE INDEX IF NOT EXISTS content_derivation_cap ON content(derivation_cap, bundle_id);
-- REC-104 -- content:chain ANSWERS OFF A COLUMN, AND THE READ-TIME PARSE IS RETIRED.
-- Until REC-104 the chain filter compiled to a JSON parse of the whole chain on
-- every row it looked at -- an expression no ordinary index can serve, and the
-- SLOWEST single-column filter on this table (M-23). REC-90 reported it as a
-- DESIGN GAP against section 4.2, because section 4.1 gives capture_text a
-- chain_kind COLUMN for the identical question. REC-104 gives content the same.
--
-- IT IS A GENERATED COLUMN, AND THAT IS THE DECISION RATHER THAN A DETAIL. The
-- row asked that a stale chain_kind be impossible by construction or refused by
-- name, and a generated column is the first: the engine computes it from chain
-- in the same statement that writes chain, an INSERT or UPDATE that names it is
-- REFUSED by SQLite itself, and there is ONE definition of the last step in the
-- whole plane -- the expression on the column line above. A plain column written
-- by mintContent would have needed a second definition in JS, a backfill that is
-- a third, and a promise that no later writer forgets it. VIRTUAL rather than
-- STORED because SQLite cannot ADD a STORED column to an existing table, and a
-- fresh store and a migrated one must have the same shape (store.mjs #migrate
-- adds it to a table created before REC-104, reading THIS line to do so). The
-- index below stores the value, so the filter seeks it and parses nothing at read.
--
-- undetermined STAYS ON chain (chain IS NULL): it asks whether the record holds
-- a chain AT ALL, which is not the same question as a chain with no last step.
CREATE INDEX IF NOT EXISTS content_chain_kind ON content(chain_kind, bundle_id);
-- =========================================================================

-- =========================================================================
-- REC-93 / IC-92 -- THE OBSERVATION LOG (OBSERVATION-LOG-DESIGN.md section 3).
--
-- AN OBSERVATION IS AN APPEND-ONLY EVENT ABOUT LOOKING. We fetched and it was
-- unchanged. We fetched and it had changed. We looked and it was gone. We
-- looked and could not tell. We searched for a thing a member named and found
-- nothing. It is SEPARATE FROM THE RECORD and that separation is the one
-- architectural decision STORE-AS-CACHE.md settles: the record is write-once,
-- content-addressed and never evicts, so folding a failed look into it makes
-- every failed look either a phantom capture or nothing at all. This table is
-- what lets ABSENCE BE RECORDED rather than retried away, at the cost of one
-- row and zero record bytes -- the WARC revisit economy.
--
-- ONE TABLE FOR EVERY LEVEL, and that is a decision rather than a convenience.
-- A log per level is the D-164 failure (built three times, drifts) arriving in
-- the coverage record, so internet, document, content and meaning share this
-- shape. REC-94, REC-95 and REC-96 write into THIS table at THIS vocabulary.
--
-- WHAT IT IS NOT: a transcript (DEC-61 puts those device-local and out of the
-- store entirely), a measurement of our own runtime (runtime_observations
-- measures what WE cost and stays where it is), a capture (a look that produced
-- bytes POINTS AT the capture through result_ref and is not one), or a member
-- browsing (section 4.6 -- a member ad hoc search is never an observation, and
-- that provisional is enforced by there being no writer for it).
--
-- THE STATE COLUMN IS DELIBERATELY NOT A SQL ENUM, and no CHECK constraint
-- appears anywhere below. The refusal lives in code, in airun.mjs
-- checkObservation, where it can NAME the legal values and say why -- ai_run_log
-- above made the same choice for the same reason, and DEC-49 is what it is for:
-- a SQLite constraint error refuses with a sentence nobody can translate.
--
-- THE FOLD. ai_run_log IS THIS TABLE. Its rows are rows here with
-- authority_kind = run, and #migrate copies them across and drops the old table,
-- because two writers for one fact is what section 4.4 forbids. op=airunlog
-- reads through the (authority_kind, authority, seq) index and answers in its
-- existing envelope, so I3 does not change shape.
--
-- seq IS STORE-WIDE and never reused, so the order of two looks at different
-- levels is a fact the table holds rather than one a reader reconstructs. A run
-- own ordering is the seq order WITHIN its authority.
--
-- NULLABILITY, and one column deviates from the design with its reason here
-- rather than silently: section 3 writes subject as NOT NULL, but ai_run_log --
-- the design own precedent and first consumer -- has always permitted a row with
-- no subject, and section 4.4 requires those rows to fold in and read back
-- UNCHANGED. A NOT NULL here would force the fold to INVENT a subject, which is
-- the record claiming more than it can support. So the column is nullable in
-- SQL and the requirement is enforced at the one append site, where it can name
-- what is missing -- exactly the argument the state column already makes one
-- paragraph up. Reported as a DESIGN GAP against section 3.
CREATE TABLE IF NOT EXISTS observation_log (
  seq            INTEGER PRIMARY KEY,  -- monotonic, store-wide, never reused
  at             TEXT NOT NULL,
  actor_class    TEXT NOT NULL,     -- plane | machine | member
  actor          TEXT,              -- a machine credential or a member id. NULL is the plane own scheduler
  authority_kind TEXT NOT NULL,     -- run | sweep | link | ratify | acquire | extract | derive | lead | objective
  authority      TEXT,              -- the run id, the sweep request id, the document a link came from, the lead id
  level          TEXT NOT NULL,     -- internet | document | content | meaning
  subject_kind   TEXT NOT NULL,     -- address | capture | extent | entity | description | unstated
  subject        TEXT,              -- the normalised address, the capture_sha, the canonical extent, the entity id, or a member words. See the nullability note above
  state          TEXT NOT NULL,     -- LOOKED_ABSENT | LOOKED_INDETERMINATE | partial | PRESENT. NEVER_LOOKED is the ABSENCE of a row
  governed       INTEGER NOT NULL DEFAULT 0,
  condition      TEXT,              -- queuestate.mjs vocabulary, and no new words
  bound          TEXT,              -- which bound stopped it, if one did
  terminal       INTEGER NOT NULL DEFAULT 0,
  result_kind    TEXT,              -- capture | content | entity | reading | observation (a rollup, REC-100). What the look produced, if anything
  result_ref     TEXT,              -- THE BACK-REFERENCE: the capture_sha, content_id, entity id
  detail         TEXT               -- unchanged | changed | the reason | the reader name
);
-- The three reads this table exists to answer, and none of them may be a scan.
-- THE FRONTIER (section 5) is the latest row per level/subject_kind/subject --
-- a VIEW and never a second table -- so that index leads with exactly that key
-- and ends on seq, which is what makes "the latest row per subject" an index
-- walk. THE RUN READ-THROUGH is op=airunlog after the fold, and it is why the
-- second index exists at all: without it the fold would turn a primary-key read
-- into a table scan, which is how a fold quietly becomes a regression. THE
-- TALLIES are the per-level counts a completeness statement is computed from.
CREATE INDEX IF NOT EXISTS observation_log_frontier ON observation_log(level, subject_kind, subject, seq);
CREATE INDEX IF NOT EXISTS observation_log_authority ON observation_log(authority_kind, authority, seq);
CREATE INDEX IF NOT EXISTS observation_log_tally ON observation_log(level, state, seq);
-- SK-8 / EXTRACTION-BREADTH-DESIGN.md section 4's THIRD production row, placed by
-- BIO_Assistant_and_AI_Roles_v0_1.md section 7.3: A PROPOSED READING -- entities
-- and facts the registered readers did not find, proposed by an EXTRACT run
-- inside DEC-62's run object, carrying the ai(function, version) step this
-- record designed at CPDF-10 and nothing emitted until now.
--
-- WHY IT IS NOT readings / reading_refs, AND THE REASON IS STRUCTURAL RATHER
-- THAN TIDINESS. Section 7.3 (6): an uncited machine-minted row is a PROPOSAL,
-- "never counted as extraction coverage". Those three tables ARE the extraction
-- coverage -- op=readingref, op=readingname, the recogniser and every earned
-- connection tier read them -- so a machine's proposal written there would count
-- as coverage BY CONSTRUCTION, and no label on top could undo a count that was
-- already wrong. The separation is the mechanism, not a convention somebody has
-- to remember. The corollary is the same reasoning inverted and it is in
-- extractrun.mjs's header: the ai step is NOT on a minted content row's chain,
-- because the content id is hash(capture, extent, chain) and changing it is
-- exactly how a member's later citation would stop FINDING the machine's row.
--
-- chain IS THE PROPOSAL'S OWN CHAIN: the capture's chain with one ai step
-- appended through textchain's appendStep, so rule 2 (every derivation weakens)
-- is enforced by the module that owns it and TEXT_CHAIN_STRENGTHENS is the
-- refusal a caller earns. cap is the chain's computed derivation cap and NULL
-- means UNDETERMINED and STATED -- no calibration of any propose-reading
-- function exists, so the honest step carries no letter.
--
-- earned is B or C and is COMPUTED from what the reference NAMES, never
-- offered by the caller (DEC-24 rule 3 -- a caller that offers one is refused by
-- name at the door). There is no route to A: A is what a reference the SOURCE
-- assigned is worth, and a machine that read a string out of prose did not get
-- one.
--
-- The three position columns are reading_refs' own, in IC-1's vocabulary and no
-- other, moving together exactly as they do there: a row has all three or none,
-- and NULL means THIS PROPOSAL CANNOT SAY WHERE rather than that the whole
-- document was meant.
--
-- content_id is the passage this proposal made citable, present exactly when
-- the run minted one through SK-7's door (op=contentmint's store half) -- which
-- needs a readable position, since a passage with no extent is the whole
-- document and minting that per reference would manufacture nothing useful.
-- NULL is the ordinary case and is not a failure.
--
-- DERIVED-BUT-AUTHORED, and purge treats it as instance-scoped state: a
-- per-bundle purge clears this document's proposals and a whole-store purge
-- clears them all (D-113), because a proposal that outlived the document it
-- points at would resolve to nothing.
CREATE TABLE IF NOT EXISTS proposed_readings (
  run          TEXT NOT NULL,     -- the ai_runs row this was produced inside. The bound lives there
  capture_sha  TEXT NOT NULL,     -- the text that was read
  bundle_id    TEXT NOT NULL,     -- purge, and the D-15 viewer join
  ref          TEXT NOT NULL,     -- the reference AS IT APPEARS, reading_refs' own key
  ref_kind     TEXT,              -- the source-assigned kind, when the proposal names an identifier
  ref_key      TEXT,              -- and its key. Both present is what earns B
  label        TEXT,              -- the name, when that is all the proposal has. Earns C
  fn           TEXT NOT NULL,     -- the ai step's function: EXTRACT_FUNCTIONS' key, carried in step.engine
  fn_version   TEXT NOT NULL,     -- and its version. A proposal nobody can re-run is one nobody can check
  chain        TEXT NOT NULL,     -- the capture's chain with the ai step appended, canonical JSON
  cap          TEXT,              -- the chain's derivation cap. NULL = undetermined, STATED
  earned       TEXT NOT NULL,     -- B or C, COMPUTED from what the reference names. Never A
  pos_kind     TEXT,              -- IC-1's discriminator: pdf-page | sheet-cell | slide-shape | doc-para
  pos          TEXT,              -- the per-arm fields as canonical JSON, key-ordered
  pos_ref      TEXT,              -- IC-1's REQUIRED human form, produced by the container that knows it
  content_id   TEXT,              -- the passage this made citable, when one was minted. NULL is ordinary
  proposed_by  TEXT NOT NULL,     -- the machine credential, stamped server-side. Never a caller's word
  at           TEXT NOT NULL,
  PRIMARY KEY (run, capture_sha, ref)
);
-- By BUNDLE: purge's per-bundle arm and the read a member asks of a document.
-- By RUN: the run's own productions, which is what the bound is a bound ON.
CREATE INDEX IF NOT EXISTS proposed_readings_bundle ON proposed_readings(bundle_id);
CREATE INDEX IF NOT EXISTS proposed_readings_run ON proposed_readings(run);
-- =========================================================================

-- REC-91 / CONTENT-SEARCH-DESIGN.md section 4.1 -- THE TEXT INDEX, one row per
-- INDEXED UNIT of one capture's text under its CURRENT chain. This is the
-- content level of the four-level search (Part II section 14.3): bundles_fts
-- indexes the GROUP'S OWN NOTES about a document, and until this table existed
-- nothing indexed what the document SAYS, so a group that captured five hundred
-- agenda packets could search its notes about them and not the packets.
--
-- ONE UNIT PER ELEMENT REFERENCE, which is section 3's option (iii) and the
-- reason this is a table rather than one more column feed into bundles_fts.
-- Pouring document text into bundles_fts.body would truncate a 400-page packet
-- at page ~40 against TEXT_CAP and would land a reader on a DOCUMENT -- the
-- anchor found and then thrown away, which is D-161's failure one axis over.
-- Here the unit's address IS a content extent, so a hit is a mintable row's
-- identity without minting it (section 4.5, IC-83's lazy mint).
--
-- THE EXTENT IS THE SAME CANONICAL FORM THE content TABLE HASHES OVER, produced
-- by canonicalExtent in bio-checks.mjs and never re-spelled here. That is what
-- makes contentIdFor(capture_sha, extent, chain) computable AT HIT TIME, which
-- is the whole of section 4.5: a search returns an ADDRESS a member may cite,
-- and searching mints nothing.
--
-- chain_kind IS A COLUMN AND NOT A PARSE, so "every OCR'd unit" is a predicate.
-- It holds the LAST step kind of the chain that produced this unit (layer, ocr,
-- member). Section 4.2 asks the identical question of the content table, whose
-- chain column holds the WHOLE chain as JSON, and that filter measured as the
-- slowest on the table at M-23 -- so the column here is the same question
-- answered the cheap way, and the difference is stated in SEARCH's own
-- Incomplete list rather than left for a reader to notice.
--
-- truncated IS PER UNIT AND NEVER A SILENT PREFIX (M5's rule, section 2): a
-- unit stored to the bound says so, and rows=passage carries the flag. The
-- per-capture bound is a different metric and is NOT a column here at all -- it
-- is the indexed observation, written per capture into observation_log, so that
-- not extracted, extracted but over the bound, and extracted and indexed are one
-- vocabulary in one place (section 4.3).
--
-- WHAT HAS NO UNIT ARM AND IS THEREFORE ABSENT RATHER THAN EMPTY: a WORKBOOK
-- (a cell is not a passage, and the sheet-range extent arm landed with FW-19 but no unit writer uses it -- written before
-- that, when EXTRACTION-BREADTH section 3.2 had not landed -- 288 workbooks in M-20 census hold
-- 72,651,441 bytes of text over 1,056 sheets and not one indexable unit), and
-- HTML (no dom producer, Part II section 15). Neither is scored zero: the
-- capture's indexed observation says none with the reason.
--
-- DERIVED, AND PURGED ON BOTH ARMS. It carries bundle_id -- the document this
-- text is of -- so it rides purge's TABLES list. Text is a PROJECTION and is
-- re-derived rather than versioned (section 4.1): when the chain moves, the
-- capture's previous rows are DELETED and rewritten, so a revised chain never
-- leaves a unit claiming an engine that did not produce it. A content row is
-- the opposite and is never rewritten -- an authored edge holds it, and a
-- re-extraction marks it stale (REC-82).
CREATE TABLE IF NOT EXISTS capture_text (
  capture_sha  TEXT    NOT NULL,   -- the document. The register's trust root
  bundle_id    TEXT    NOT NULL,   -- the join every query arm makes (section 2)
  extent_kind  TEXT    NOT NULL,   -- pdf-page | doc-para | slide-shape. sheet-range once a unit writer uses the FW-19 arm
  extent       TEXT    NOT NULL,   -- canonicalExtent's output. The SAME bytes the content address is taken over
  ref          TEXT    NOT NULL,   -- IC-1's required human form, from describeExtent
  seq          INTEGER NOT NULL,   -- reading order within the capture, so a partial index is a PREFIX and says so
  text         TEXT    NOT NULL,   -- the unit's text, capped per unit at TEXT_CAP (section 4.3)
  truncated    INTEGER NOT NULL DEFAULT 0,
  chain_kind   TEXT    NOT NULL,   -- the chain's LAST step kind, so an engine is a predicate
  PRIMARY KEY (capture_sha, extent_kind, extent)
);
-- By BUNDLE: the join every arm makes, and purge's per-bundle arm.
CREATE INDEX IF NOT EXISTS capture_text_bundle ON capture_text(bundle_id);
-- AND NOT BY CHAIN KIND, WHICH THIS ITEM DECLARED AND THEN WITHDREW ON THE
-- REPOSITORY'S OWN RULE. "Every OCR'd unit below cap C" is one of the three
-- questions Part II section 17 names as unanswerable, and it is a predicate only
-- if such an index exists -- so one was written here. The airuns suite sweep
-- then named it on the roster of ACCESS PATHS NO OP ASKS FOR, correctly: the op
-- that would read it is REC-92's passage: arm and it does not exist. REC-12's
-- rule is already recorded a few hundred lines up in store.mjs for three
-- other columns -- *an index nobody seeks on is cost with no reader* -- and the
-- index's cost here is per UNIT rather than per bundle, which is the grain that
-- made this whole table worth measuring.
-- THE HONEST MOVE IS TO LET THE READER BRING IT. The alternative was to raise
-- that sweep's CEILING by one on a promise, and a ceiling raised for a reader
-- that might arrive is a ceiling that stops meaning anything. M-23's 31.6
-- SECONDS against 9 ms is a real measurement of a DIFFERENT table's column under
-- a query that exists; quoting it for a query nobody has written would be
-- borrowing evidence rather than having it. REC-92 adds the index with its own
-- measurement, the way REC-90 did for the content table.
-- =========================================================================

-- =========================================================================
-- REC-87 / IC-128 -- TRANSCRIBE (Bob's 5.2). A member selects a portion of a
-- document and types what it says. The PORTION is a content row (content_id
-- is the hash of the capture, the canonical extent and a chain whose one step
-- is typed(member) carrying the digest of the text), so the row says WHERE and
-- WHO. This table holds the one thing a content row has no column for -- the
-- TEXT the member typed -- keyed by that row.
--
-- ONE ROW PER CONTENT ROW, AND NEVER REWRITTEN. The digest is in the chain and
-- the chain is in the id, so different text is a different row by construction
-- and a re-typing of the same text by the same member finds the same row. The
-- write is INSERT OR IGNORE, on the content table's own rule.
--
-- NOT DERIVED, AND PURGED. A member's typing is authored and nothing re-derives
-- it, but it carries bundle_id, so it rides op=purge's TABLES list and clears
-- in both arms (D-113) with the content rows it describes.
CREATE TABLE IF NOT EXISTS transcriptions (
  content_id   TEXT PRIMARY KEY,  -- the content row the member minted by typing
  capture_sha  TEXT NOT NULL,     -- the exact copy the text was typed from
  bundle_id    TEXT NOT NULL,     -- purge, and the viewer gate
  transcriber  TEXT NOT NULL,     -- a member id, never a machine stamp (C-52.1)
  text         TEXT NOT NULL,     -- what the member typed, byte for byte
  text_sha256  TEXT NOT NULL,     -- the digest the chain step carries
  at           TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS transcriptions_bundle ON transcriptions(bundle_id);
-- By CAPTURE: the stale pass excludes a capture's transcriptions on every
-- re-read, and that exclusion must be a seek rather than a scan.
CREATE INDEX IF NOT EXISTS transcriptions_capture ON transcriptions(capture_sha, content_id);
-- A SECOND MEMBER'S ATTESTATION OF ONE TRANSCRIPTION. Separate from
-- text_attestations and on purpose: those attest the CAPTURE's machine text
-- over an extent, and an attestation of a member's typing is testimony about
-- DIFFERENT text. Folding them together would let a check of the OCR raise a
-- member's typing, or the reverse. The transcriber is never an attestor here
-- (C-52.9, refused at the act and excluded again at every read).
CREATE TABLE IF NOT EXISTS transcription_attestations (
  content_id   TEXT NOT NULL,
  bundle_id    TEXT NOT NULL,     -- purge
  attestor     TEXT NOT NULL,     -- a member id, never a machine stamp (C-35.10)
  at           TEXT NOT NULL,
  note         TEXT,
  PRIMARY KEY (content_id, attestor)
);
CREATE INDEX IF NOT EXISTS transcription_attestations_bundle ON transcription_attestations(bundle_id);
-- =========================================================================
-- MK-4 / IC-135 / D-194 -- THE LEAD. MEMBER-KNOWLEDGE-DESIGN.md section 5: the
-- same member knowledge BEFORE the search. I was told the contract was amended,
-- look at the Clerk March agenda. An AUTHORED ROW and NEVER EVIDENCE.
--
-- WHY A TABLE OF ITS OWN AND NOT A CONTENT ROW OR A BUNDLE. Everything a basis
-- leg can cite is a bundle or a content row. A lead stored as either would be an
-- unlabelled observation a member could cite as evidence, which is the one thing
-- section 5 rules it is not. So it lives here, under an id (LEAD-...) that no leg
-- grammar accepts, and C-54.1 refuses it BY NAME at every leg grammar as well.
--
-- FOLLOWING A LEAD IS A LOOK, and the look is NOT stored here. It is a row of
-- observation_log with authority_kind = lead and authority = lead_id (section 5,
-- OBSERVATION-LOG-DESIGN.md section 4.5). Nothing is written to the log when a
-- lead is AUTHORED: nobody has looked yet, and NEVER_LOOKED is never stored.
--
-- NO bundle_id, BY THE DESIGN'S FIELD LIST. So a per-bundle purge leaves it and
-- the whole-store purge clears it (D-113). Visibility is the AUTHOR's (a
-- provisional, stated in store.mjs leadRead) because no bundle scopes it.
CREATE TABLE IF NOT EXISTS leads (
  lead_id   TEXT PRIMARY KEY,   -- LEAD-YYYY-MMDD-hex, minted by the plane
  author    TEXT NOT NULL,      -- a member id, server-stamped, never a machine (C-54.2)
  words     TEXT NOT NULL,      -- the member words AS WRITTEN, never paraphrased
  locator   TEXT,               -- an optional place to look the member suggests. NULL = none suggested
  at        TEXT NOT NULL       -- when the record received the lead
);
CREATE INDEX IF NOT EXISTS leads_author ON leads(author, at);
-- A LEAD SHARED TO A PROJECT. RULED 2026-09-18 by BOB #14 on MK-4's design gap: a
-- lead is visible to its AUTHOR, to a project's participants ONLY after the author
-- SHARES it to that project, to a machine credential only within the scope a member
-- minted for it, and to nobody else. The share is an AUTHORED, DATED act and this
-- row is it. Never rewritten: sharing twice finds the same row.
-- bundle_id IS THE PROJECT, named so it rides op=purge TABLES list and clears in
-- BOTH arms (D-113) -- a share outliving its project would admit whoever holds that
-- id next.
CREATE TABLE IF NOT EXISTS lead_shares (
  lead_id    TEXT NOT NULL,
  bundle_id  TEXT NOT NULL,     -- the PROJECT the lead is shared to
  sharer     TEXT NOT NULL,     -- the lead author, server-stamped (C-54.10)
  at         TEXT NOT NULL,
  PRIMARY KEY (lead_id, bundle_id)
);
CREATE INDEX IF NOT EXISTS lead_shares_bundle ON lead_shares(bundle_id);
-- =========================================================================

-- REC-126 / DEC-31 / IC-146: THE REVIEW COPY, BIO_Publication_v0_1.md section 6A.
-- An addressed act BESIDE publish that NEVER LEAVES THE INSTANCE. Three tables,
-- and none of them is a bucket: the grant is a capability over the private
-- store, never a third place bytes live (6A.2, never a bucket).
--
-- case_drafts IS THE PRODUCTION (6A.4, gap 3): a DRAFT case, identified BEFORE
-- the publish gates run, holding the arguments op=publish would take as JSON.
-- It is MUTABLE (Bob, 2026-09-17: only a real publish is not) and it is working
-- data, so a whole-store purge clears it. case_id is the existing case the draft
-- would be the next edition of, or NULL for a new case, whose identity is minted
-- only by publication. The EDITION is not stored: it is read from the published
-- record every time it is asked, which is what lets a grant bound to one edition
-- die when that edition is signed.
CREATE TABLE IF NOT EXISTS case_drafts (
  draft_id    TEXT PRIMARY KEY,   -- DRAFT-YYYY-NNNN, allocated by the draft act
  project_id  TEXT NOT NULL,      -- the producing project, whose OWNER authors the draft
  case_id     TEXT,               -- the existing case named, or NULL for a new case
  params      TEXT NOT NULL,      -- JSON of the op=publish arguments, the project excepted
  created_by  TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  updated_by  TEXT NOT NULL,      -- the editor the dry run of the publish gates acts as
  updated_at  TEXT NOT NULL,
  -- REC-193 / BIO_Publication_v0_1.md section 3 rule 13 (BOB #32, 2026-09-23): WHO WROTE THE EXCLUSION
  -- STATEMENT'S CURRENT BYTES. Stamped by the SERVER at the draft write that changes the statement text and
  -- left alone by every other edit, so an editor who rewrites another section does not become the statement's
  -- author -- which is what updated_by, the last editor of ANY field, said when op=statementack read it.
  -- NULLABLE AND NEVER BACK-FILLED: a draft written before this column existed recorded no writer, and the
  -- only value a backfill could reach for is updated_by, the very value this column exists to stop standing
  -- in for one. NULL reads back as UNDETERMINED, stated, and op=statementack refuses by name rather than
  -- guess. Nothing about publication turns on it: rule 11 never refuses a case for want of an acknowledgement.
  statement_by TEXT
);
CREATE INDEX IF NOT EXISTS case_drafts_project ON case_drafts(project_id);

-- THE GRANT (6A.2): scoped to ONE production, revocable, read-and-comment,
-- attributed. Its READ SECRET is generated at the edge and this table holds only
-- its SHA-256, never the value -- the ai_credentials shape. It is BOUND TO ONE
-- CASE EDITION: case_id and edition are the draft's identity at the moment of
-- issue, and a grant whose draft no longer stands at that edition is dead
-- exactly as a revoked one is. The recipient is a LABEL the issuer typed, never
-- a member -- a grant is not an account, not membership, not a weaker member.
CREATE TABLE IF NOT EXISTS review_grants (
  grant_id    TEXT PRIMARY KEY,   -- RVG-YYYY-NNNN, the public identity. NEVER the secret
  draft_id    TEXT NOT NULL,
  case_id     TEXT,               -- the case edition bound at issue, NULL for a new case
  edition     INTEGER NOT NULL,
  recipient   TEXT NOT NULL,      -- to whom, as the issuer named them
  secret_sha  TEXT NOT NULL UNIQUE, -- SHA-256 of the read secret. NEVER its value
  issued_by   TEXT NOT NULL,
  issued_at   TEXT NOT NULL,
  revoked_by  TEXT,
  revoked_at  TEXT
);
CREATE INDEX IF NOT EXISTS review_grants_draft ON review_grants(draft_id);

-- THE COMMENT: attributed, and a recipient's comment is a RECIPIENT's. author is
-- the grant id for a recipient and the member id for a member, and author_kind
-- says which, so no reader can take one for the other.
CREATE TABLE IF NOT EXISTS review_comments (
  comment_id  INTEGER PRIMARY KEY AUTOINCREMENT,
  draft_id    TEXT NOT NULL,
  author_kind TEXT NOT NULL CHECK (author_kind IN ('recipient','member')),
  author      TEXT NOT NULL,
  grant_id    TEXT,               -- the grant that admitted a recipient, NULL for a member
  text        TEXT NOT NULL,
  at          TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS review_comments_draft ON review_comments(draft_id);

-- D-150 / BIO_Publication_v0_1.md section 3 rule 11: THE EXCLUSION STATEMENT'S ACKNOWLEDGEMENTS.
-- One row per act: a SECOND person's reading of ONE statement text, by a joined participant of the
-- producing project (acknowledger = the member id) or a review-copy recipient through a live grant
-- (acknowledger = the grant id, recipient = the grant's label). statement_sha is the SHA-256 of the
-- statement as the case document prints it, so an edited statement is a different sentence and its
-- old acknowledgements match nothing. case_id and edition are the case identity the statement stood
-- at: a draft's, read from the published record (case_id NULL for a new case), or an unsigned case
-- document's. op=publish lists the matching rows in the signed completeness block, or states that
-- nobody but the author acknowledged it; nothing reads this table as a gate. Working data: a
-- whole-store purge clears it, and a signed document keeps its own list in its signed bytes.
CREATE TABLE IF NOT EXISTS statement_acknowledgements (
  ack_id            INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id        TEXT NOT NULL,
  case_id           TEXT,
  edition           INTEGER NOT NULL,
  statement_sha     TEXT NOT NULL,
  draft_id          TEXT,               -- the draft read, when acknowledged through one
  acknowledger_kind TEXT NOT NULL CHECK (acknowledger_kind IN ('participant','recipient')),
  acknowledger      TEXT NOT NULL,
  recipient         TEXT,               -- the grant's addressee label, for a recipient
  at                TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS statement_acknowledgements_statement
  ON statement_acknowledgements(project_id, statement_sha, edition);
-- =========================================================================

-- REC-164: THE PUBLISHING GROUP'S DISPLAY NAME AND ITS DOMAIN (BIO_Publication_v0_1.md
-- section 7 points 2 and 3). Two durable values, each with a dated history: a value is
-- the LATEST row for its field, and no statement updates or deletes a row, so every
-- revision stays readable with its date and the administrator who made it.
--   field             'display_name' or 'domain'
--   set_by            the member the control plane stamped from the signed-in session,
--                     never a caller's statement, never a bearer
--   instance_address  a domain row only: the origin the administrator's session reached,
--                     stamped by the control plane, which the well-known file must name
-- EXEMPT FROM op=purge, in both arms: identity, not derived from the corpus, the family
-- of instance_group. hygiene.test.mjs lists both tables among the purge exemptions.
CREATE TABLE IF NOT EXISTS group_identity_history (
  seq               INTEGER PRIMARY KEY AUTOINCREMENT,
  field             TEXT NOT NULL CHECK (field IN ('display_name','domain')),
  value             TEXT NOT NULL,
  set_at            TEXT NOT NULL,
  set_by            TEXT NOT NULL,
  instance_address  TEXT
);
-- Every verdict on a claimed domain, dated. The public read shows a domain only while
-- the latest verdict for the CURRENT claim is 'verified'. 'undetermined' is the fourth
-- word, and it is not one of the design's three: the governor holding the host, a fetch
-- that did not complete, or an answer that is neither a file nor its absence says
-- nothing about the domain, so it is recorded as what it is and never as 'absent'.
--   trigger  'set' (the administrator's act) or 'alarm' (the reconciling re-check)
CREATE TABLE IF NOT EXISTS group_domain_checks (
  seq         INTEGER PRIMARY KEY AUTOINCREMENT,
  domain      TEXT NOT NULL,
  verdict     TEXT NOT NULL CHECK (verdict IN ('verified','absent','mismatched','undetermined')),
  checked_at  TEXT NOT NULL,
  trigger     TEXT NOT NULL,
  status      INTEGER,
  detail      TEXT
);
-- REC-149 (Membership Architecture v2 section 7, item 7.14, BOB #16 from Bob's
-- ruling of 2026-09-18, "each project chooses"): DISCOVERABLE or HIDDEN, as an
-- OWNER'S RECORDED ACT and never a field of the project document, because a
-- joined participant may revise that document and would then set an owner's
-- choice. APPEND-ONLY, one row per act, the current setting is the LATEST row
-- (highest seq for the project). A project with NO row reads HIDDEN: every
-- project that existed before this table was created under section 7.9's
-- promise that the uninvited see not its existence, and no migration writes a
-- row for any of them. Keyed on project_id, a bundle id, so both purge arms
-- clear it with the project (the project_participants precedent).
CREATE TABLE IF NOT EXISTS project_visibility (
  seq        INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  setting    TEXT NOT NULL CHECK (setting IN ('discoverable','hidden')),
  set_by     TEXT NOT NULL,       -- the owner who set it, a member id
  reason     TEXT,                -- optional, the owner's own words
  at         TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS project_visibility_project ON project_visibility(project_id, seq);

-- D-497 (Membership Architecture v2 section 7, item 7.14, "The directory"; SCHEDULER #17's finding carried
-- forward from D-479): THE SIGHT INDEX. One row per PROJECT, holding the setting that project_visibility's
-- acts DERIVE -- the latest act, and HIDDEN where the owners have never acted. It is not a second place the
-- rule is stated: Store#reindexProjectSight is the one statement that computes a row here, and Store#sight
-- READS this table through #visibilityOf rather than reading the act log. That is what lets the directory's
-- candidate query bound IN SQL: before this table, sight was a JS predicate the directory had to ask about
-- every project in the group one at a time, so the number of statements grew with the record even though
-- each was bounded, and REC-149's first attempt to put the rule in the directory's own SQL instead put
-- "no act = hidden" in a SECOND place -- caught by its own default-discoverable control arm, which flipped
-- the default while the directory did not move.
--
-- DERIVED, AND IT SAYS SO: every row is recomputed from project_visibility and bundles at every boot
-- (Store#seedProjectSight, the #seedMintLedger precedent), at every promotion of a bundle, and at every
-- owner's act. Nothing here is authored, so drift cannot survive a restart, and the act log stays the
-- record. Keyed on project_id, a bundle id, so both purge arms clear it with the project (the
-- project_participants precedent).
-- THE ROW IS THE PROJECT AND ITS SETTING AND NOTHING ELSE. No date: a projection needs none, the act log
-- above carries every date there is, and a column that moved on each recompute would make an UNCHANGED boot
-- rewrite every row with different bytes -- which is a RESTART PLUS A PURE READ MOVING A TABLE, and is what
-- versionnotice.test.mjs's no-write WITNESS refuses. That witness is the guarantee a live verification's
-- no-write claim rests on, so the derivation is idempotent at the byte instead.
CREATE TABLE IF NOT EXISTS project_sight (
  project_id TEXT PRIMARY KEY,
  setting    TEXT NOT NULL CHECK (setting IN ('discoverable','hidden'))
);
CREATE INDEX IF NOT EXISTS project_sight_setting ON project_sight(setting, project_id);
-- =========================================================================

-- D-86 (NOTIFICATIONS.md, The catalogue: a re-run owed after a lens change, an OBLIGATION, DISCLOSED and never
-- blocking, DEC-20, with BIO_Content_Framework_v0_10.md section 13): the BIAS DEBT a run carries once the lens it
-- was formed under has moved. ONE ROW PER RUN, keyed by the run and nothing else, so the sweep is idempotent by
-- construction: a second alarm tick finds the row and writes nothing new. Written ONLY by the bias-debt consumer
-- on the one alarm, from the answer aiRunRead publishes (its bias block: moved, moved_basis, the two hashes) and
-- never from a second comparison. lens_then is the side the comparison was against (the lens at the open for a
-- recorded open, else the manifest the run was handed), lens_now the lens at the sweep, NULL where none is in
-- force. cleared_at is set, never a DELETE, when a later sweep reads moved false again: the obligation leaves the
-- queue and the row keeps what was observed. recipients is a JSON array of member ids, each one checked through
-- the run's own read gate at the sweep. A run is purged only by the whole-store arm, which takes this with it.
CREATE TABLE IF NOT EXISTS bias_debts (
  run           TEXT PRIMARY KEY,
  context_type  TEXT NOT NULL,
  context_id    TEXT NOT NULL,
  moved_basis   TEXT,
  lens_then     TEXT,
  lens_now      TEXT,
  recipients    TEXT NOT NULL,
  raised        TEXT NOT NULL,
  observed      TEXT NOT NULL,
  cleared_at    TEXT
);
-- D-86: the sweep's own place in its work. fingerprint is the lens-input fingerprint the LAST COMPLETE sweep read
-- (every adoption with its bundle's current sha and state), so an alarm with no lens change asks nothing of any
-- run. target and cursor carry a sweep that spans several ticks, restarted from the top when the lens moves again.
CREATE TABLE IF NOT EXISTS bias_debt_sweeps (
  k            TEXT PRIMARY KEY,
  fingerprint  TEXT,
  target       TEXT,
  cursor       TEXT NOT NULL DEFAULT '',
  at           TEXT NOT NULL
);

-- D-162 / IC-241 -- THE THEME. BIO_Content_Framework_v0_10.md section 8.4, Bob's
-- ruling of 2026-09-21: a connection through an IDEA, fenced four ways. Declared
-- by a MEMBER (the declarer is stamped and shown on every reading), it carries
-- its TEST, a sentence a document or a passage passes or fails, membership is a
-- member's act and a machine's proposal is a HUNCH until a member confirms it,
-- and it is NEVER the basis of a claim (C-81.1 at every leg grammar).
--
-- WHY A TABLE OF ITS OWN AND NOT AN ENTITY. The entity registry holds NAMED
-- things a source's own words can be resolved to, and anything in it is a
-- subject a connection can run through at grade A to C. A theme is one member's
-- lens, visibly theirs, so it lives here under a THEME- id that no leg grammar
-- accepts and that ENTITY_KINDS does not contain -- the eleventh-entity-kind
-- liar is refused by shape as well as by name.
--
-- NO bundle_id: a theme is about no one document, so a per-bundle purge leaves
-- it and the whole-store purge clears it (D-113). Never rewritten: a changed
-- idea is a new theme, since a placement was judged against THIS test.
CREATE TABLE IF NOT EXISTS themes (
  theme_id     TEXT PRIMARY KEY,   -- THEME-YYYY-MMDD-hex, minted by the plane
  declared_by  TEXT NOT NULL,      -- a member id, server-stamped, never a machine (C-81.2)
  name         TEXT NOT NULL,      -- the idea in the declarer words, as written
  test         TEXT NOT NULL,      -- the inclusion criterion, as written (C-81.3)
  at           TEXT NOT NULL
);
-- A DOCUMENT OR A PASSAGE IN A THEME, graded like any connection (section 8.1).
-- state member: a MEMBER placed or confirmed it, grade D -- asserted on that
-- member stated judgement that it passes the test, with an author and a date.
-- state hunch: PROPOSED (by a machine, or a member proposing rather than
-- placing), grade C -- correspondence, never established, flagged for a member
-- to confirm, and NEVER counted as membership. A confirmation turns the row to
-- member and KEEPS who proposed it, so the record says the machine saw it first.
-- target is a bundle id (target_kind document) or a content id (content),
-- bundle_id is the DOCUMENT either way, so every read gates it by the viewer
-- and a per-bundle purge takes the placement with its document (D-113).
CREATE TABLE IF NOT EXISTS theme_placements (
  theme_id     TEXT NOT NULL,
  target       TEXT NOT NULL,
  target_kind  TEXT NOT NULL CHECK (target_kind IN ('document','content')),
  bundle_id    TEXT NOT NULL,
  state        TEXT NOT NULL CHECK (state IN ('hunch','member')),
  grade        TEXT NOT NULL CHECK (grade IN ('C','D')),
  proposed_by  TEXT,               -- who proposed it as a hunch, NULL when a member placed it outright
  proposed_at  TEXT,
  proposal_note TEXT,
  placed_by    TEXT,               -- the member who placed or confirmed it, NULL while a hunch
  placed_at    TEXT,
  placement_note TEXT,
  PRIMARY KEY (theme_id, target)
);
CREATE INDEX IF NOT EXISTS theme_placements_bundle ON theme_placements(bundle_id);
-- =========================================================================

-- D-64: the instance's DAILY RENDER ALLOWANCE, spent by the render arm of
-- op=acquire (CLIENT-RENDERED.md, RULED 2026-09-23 by BOB #32 item 3). One row
-- per UTC day. spent_ms is browser time the renderer REPORTED, so it is the
-- renderer's claim summed, not a platform meter. deferred counts the renders
-- this instance declined because the allowance was spent: a deferral is a
-- recorded fact, never a silent fall-back to filing the shell as the content.
-- An operational fact about this instance, not corpus-derived.
-- D-492: reserved_ms is browser time COMMITTED to renders now in flight and not
-- yet reported. spent_ms alone could not bound the allowance, because a render
-- runs in the Worker and reports its cost afterwards, so every render in flight
-- at once was admitted against one spent_ms. A render reserves its maximum cost
-- at admission and releases the reservation when it reports, so the figure the
-- admission test reads is spent_ms + reserved_ms. A render that never reports
-- stays charged for the day: the allowance is then UNDER-used, which is the
-- direction that cannot overrun. Added to an existing store by the additive
-- pass in store.mjs #migrate, so a store written before D-492 reads 0.
CREATE TABLE IF NOT EXISTS render_allowance (
  day        TEXT PRIMARY KEY,
  spent_ms   INTEGER NOT NULL DEFAULT 0,
  reserved_ms INTEGER NOT NULL DEFAULT 0,
  renders    INTEGER NOT NULL DEFAULT 0,
  deferred   INTEGER NOT NULL DEFAULT 0,
  last_at    TEXT NOT NULL
);

-- REC-195 (D-149's remaining half, BIO_Case_Making_v0_1.md §2): A MACHINE'S
-- PROPOSAL OF THE LAWS GOVERNING AN ACTION, STORED APART FROM THE MEMBER'S LIST.
--
-- D-149: *the machine may propose the list from the counterparty, labelled as
-- machine work, and never sets it*. THE WHOLE POINT OF THIS TABLE IS THE WORD
-- APART. The member's list lives in the action's own frontmatter
-- (governing_laws[], set by op=actionlaws and by nothing else, C-73.1), and a
-- proposal that shared that home would BE the list the moment anything read the
-- document -- the overclaim this row exists to refuse. So a proposal is not a
-- projection of the bytes, nothing writes it into them, and no read composes the
-- two: op=projection's action block serves governing_laws and
-- governing_laws_proposals as two separate answers, each saying whose it is.
--
-- KEYED (bundle_id, proposed_by, ord): ONE STANDING PROPOSAL PER PROPOSER, its
-- citations ordered as proposed. A proposer restating replaces its own rows and
-- nobody else's, which is themes' hunch discipline one construct over: the
-- record keeps who proposed what, and two machines proposing different lists is
-- two proposals rather than one overwriting the other.
--
-- NOTHING HERE IS DERIVED FROM THE COUNTERPARTY BY THIS PLANE. The proposer
-- supplies the citations and the levels, and the plane stores them under that
-- proposer's name and encodes no law's rules (D-149), which is why there is no
-- column mapping an agency to a law.
--
-- Carries bundle_id, so it clears in BOTH purge arms through the TABLES list
-- (D-113), and hygiene.test.mjs holds that list against this file. A proposal
-- outliving the action it was made against would attach itself to whatever
-- bundle was next allocated that id -- somebody else's request wearing a
-- machine's citations.
CREATE TABLE IF NOT EXISTS action_law_proposals (
  bundle_id   TEXT NOT NULL,   -- the action
  proposed_by TEXT NOT NULL,   -- the control plane's stamp: class:<cls>, class:ai/<tokenId>, or a member handle
  ord         INTEGER NOT NULL,-- position in the proposed list
  level       TEXT NOT NULL,   -- one of LAW_LEVELS, judged before the write
  citation    TEXT NOT NULL,   -- as the proposer wrote it, and never parsed for a rule
  proposed_at TEXT NOT NULL,
  PRIMARY KEY (bundle_id, proposed_by, ord)
);

-- D-95: the per-host request governor. Our APPETITE is a configured constant
-- because it is ours; their CAPACITY is discovered by being refused and
-- recorded, following the pattern capture_limits proved for the subrequest
-- ceiling. It lives in the Durable Object because the object serialises, which
-- makes one token bucket globally correct for the instance for free; a bucket
-- in Worker memory governs nothing because every invocation is independent.
-- appetite_per_min NULL means the configured default (a CHOSEN constant,
-- recorded in MEASUREMENTS.md, never a finding). cooloff_until is how a 429 or
-- a refusal overrides the bucket entirely: while it is in the future, no token
-- balance admits anything to that host. refusals counts CONSECUTIVE refusals
-- and decays to zero on success, so the cool-off escalates the way the
-- counterparty's own escalation does and resets when they relent.
CREATE TABLE IF NOT EXISTS host_governor (
  host                TEXT PRIMARY KEY,
  appetite_per_min    REAL,
  tokens              REAL    NOT NULL DEFAULT 0,
  refilled_at         INTEGER NOT NULL DEFAULT 0,
  last_grant_at       INTEGER NOT NULL DEFAULT 0,
  cooloff_until       INTEGER NOT NULL DEFAULT 0,
  refusals            INTEGER NOT NULL DEFAULT 0,
  last_refusal_at     INTEGER,
  last_refusal_status INTEGER,
  granted             INTEGER NOT NULL DEFAULT 0,
  refused_total       INTEGER NOT NULL DEFAULT 0,
  updated_at          TEXT
);
`;
