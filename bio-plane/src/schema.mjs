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
-- strength is BOTH frozen axis objects (never two letters -- unrated and
-- undetermined are different frozen facts, and C-21.2 compares per axis
-- against the right one); required is DEC-17's declared bar as it stood,
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
CREATE TABLE IF NOT EXISTS published_bundles (
  bundle_id       TEXT NOT NULL,
  edition         INTEGER NOT NULL,
  title           TEXT,
  bundle_sha      TEXT NOT NULL,
  ratified_at     TEXT NOT NULL,
  attestor_key    TEXT NOT NULL,
  attestor_member TEXT,
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
-- reasons about; retrieval_locator carries what was actually fetched. For a
-- direct capture they are the same string. For an archive capture the document
-- address is the CDX original field through our own normaliser and the
-- retrieval locator is the archive's replay address, and conflating them is
-- how a provenance difference gets reported as a change.
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
-- CONSTRUCTS Step 3 (FW-5): READINGS ARE PERSISTED. A reading is what a content
-- type's parse() found in a captured document -- its entities plus document-level
-- facts (BIO_Content_Framework_v0_10.md:480). op=acquire runs the resolved
-- doctype's reader over the captured text and carries the reading on the acquire
-- document; op=promote DERIVES it from data/provenance.json and persists it here,
-- in the SAME transaction that writes the register row and the refs projection it
-- sits beside -- the same discipline refs follow, so the table is a projection of
-- the document rather than a second place to state it. One row per captured
-- document, keyed by the capture identity (register.capture_sha, I1 section 1).
-- found is 0 for a FAILED or EMPTY reading, recorded HONESTLY as such: a reader
-- that finds nothing is a failed reader, never an emptied document (framework:489),
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
  at             TEXT
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
CREATE TABLE IF NOT EXISTS reading_refs (
  capture_sha  TEXT NOT NULL,
  bundle_id    TEXT NOT NULL,
  ref          TEXT NOT NULL,
  ref_kind     TEXT,
  ref_key      TEXT,
  label        TEXT,
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
-- which OUTLIVES any document that mentions it (framework:247) and, in the doctrine,
-- a SUBJECT a bias statement addresses (safeguard 4). It is RESOLVED across
-- documents, not extracted from one (framework:251); that resolution -- matching a
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
-- ("asserted with no captured basis") is the category error D-83 names explicitly:
-- it is not weak evidence, it is not evidence at all. The enforcement is structural
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
--   D -- asserted with no captured basis: member TESTIMONY, recorded with an author and
--        a date. The RECOGNISER never mints a D (op=resolve produces only A/B/C); the
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
-- asserted_by is THREE-VALUED and is NOT the grade (framework:554 -- the author says WHO
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
  PRIMARY KEY (a_capture_sha, b_capture_sha, entity_id)
);
CREATE INDEX IF NOT EXISTS connections_entity ON connections(entity_id);
CREATE INDEX IF NOT EXISTS connections_a ON connections(a_capture_sha);
CREATE INDEX IF NOT EXISTS connections_b ON connections(b_capture_sha);
CREATE INDEX IF NOT EXISTS connections_a_bundle ON connections(a_bundle_id);
CREATE INDEX IF NOT EXISTS connections_b_bundle ON connections(b_bundle_id);
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
  PRIMARY KEY (progression_key, stage_key)
);
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
-- to pass a gate. grade_axis is the axis the grade is ON (capture or
-- connection), recorded on the leg because it is NOT derivable from
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
  grade_axis   TEXT,            -- 'capture' | 'connection': the axis the grade is on
  grade_source TEXT,            -- 'resolution' | 'testimony' | 'hunch' | 'inherited' | 'capture'
                                -- GRADE_SOURCES in checks/bio-checks.mjs is the authority (DEC-15)
                                -- this line named only the first three until 2026-08-08, REC-68
                                -- the last two arrived with REC-31/DEC-21 and were never added here
                                -- hygiene.test.mjs now DRIVES this list against the export, because
                                -- hand-typing a vocabulary is how it went stale in the first place
  note         TEXT,
  at           TEXT,
  ground       TEXT,            -- REC-42: the OR branch this leg belongs to. NULL = the implicit single ground (AND)
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
CREATE TABLE IF NOT EXISTS published_cases (
  case_id      TEXT NOT NULL,
  edition      INTEGER NOT NULL,
  scope        TEXT,
  completeness TEXT,
  bias_acknowledgement TEXT,
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
CREATE TABLE IF NOT EXISTS published_case_members (
  case_id   TEXT NOT NULL,
  edition   INTEGER NOT NULL,
  ord       INTEGER NOT NULL,
  bundle_id TEXT NOT NULL,
  PRIMARY KEY (case_id, edition, bundle_id)
);
CREATE INDEX IF NOT EXISTS published_case_members_bundle ON published_case_members(bundle_id);
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
  stopped_at            TEXT
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
CREATE TABLE IF NOT EXISTS ai_run_log (
  run        TEXT NOT NULL,
  seq        INTEGER NOT NULL,
  at         TEXT NOT NULL,
  level      TEXT NOT NULL,
  subject    TEXT,
  state      TEXT NOT NULL,
  governed   INTEGER NOT NULL DEFAULT 0,
  condition  TEXT,
  bound      TEXT,
  terminal   INTEGER NOT NULL DEFAULT 0,
  detail     TEXT,
  PRIMARY KEY (run, seq)
);
CREATE INDEX IF NOT EXISTS ai_run_log_terminal ON ai_run_log(run, terminal);

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
  grade_axis   TEXT,             -- 'capture' | 'connection'
  grade_source TEXT,             -- 'resolution' | 'capture' | 'testimony' | 'hunch' | 'inherited'
  note         TEXT,
  at           TEXT,
  ground       TEXT NOT NULL,    -- the branch of the argument. NOT NULL: the partition is TOTAL on a version
  PRIMARY KEY (bundle_id, name, ord)
);
-- The reverse index inquiry_basis_target is for, one level up: "which VERSIONS
-- rest on this document" is what a re-evaluation has to ask once an inquiry
-- carries alternatives, and the answer must not be a scan of every leg of every
-- version of every inquiry.
CREATE INDEX IF NOT EXISTS inquiry_basis_version_legs_target ON inquiry_basis_version_legs(target_id);
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
  bundle_sha    TEXT NOT NULL,   -- THE PIN: the revision adopted, never re-read
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
  revoked_by      TEXT
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
CREATE TABLE IF NOT EXISTS reading_text_source (
  capture_sha    TEXT PRIMARY KEY,
  bundle_id      TEXT NOT NULL,
  transcribed    INTEGER NOT NULL DEFAULT 0,
  terminal_step  TEXT,
  engines        TEXT,    -- JSON array of engine names the chain runs through
  derivation_cap TEXT,    -- a BASIS_GRADES letter, or NULL for undetermined
  steps          INTEGER NOT NULL DEFAULT 0,
  chain          TEXT     -- the chain itself, so a reader needs no second lookup
);
CREATE INDEX IF NOT EXISTS reading_text_source_bundle ON reading_text_source(bundle_id);
CREATE INDEX IF NOT EXISTS reading_text_source_kind
  ON reading_text_source(transcribed, terminal_step);

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
