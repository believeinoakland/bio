import { RECORD_SCHEMA } from "./record-core/index.mjs";
import { PROVENANCE_SCHEMA } from "./provenance/schema.mjs";
import { HOST_GOVERNOR_SCHEMA } from "./host-governor/schema.mjs";
import { CALIBRATION_SCHEMA } from "./calibration/schema.mjs";
import { BIAS_SCHEMA } from "./bias/schema.mjs";
import { AI_RUNS_SCHEMA } from "./ai-runs/schema.mjs";
export const SCHEMA = `-- BIO store schema, draft 1, derived from the real bundle.md frontmatter and
-- _history/manifest.json shapes in tree 0.1.94. The bundle format is
-- authoritative; this is a projection of it and must never bend it.

${RECORD_SCHEMA}


-- The register, the acquisition receipts (captured_locators) and the route marks are provenance's tables,
-- defined with their reasons in src/provenance/schema.mjs (R41, R48).
${PROVENANCE_SCHEMA}

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
-- that tick's retry rather than a fresh one. It is deleted when a tick ACCOUNTS
-- FOR EVERY ELIGIBLE SUBJECT ITSELF -- nothing failed AND nothing was skipped --
-- which is what lets the NEXT cadence really re-check.
-- D-518, 2026-09-24: the second half of that condition is a CORRECTION. This line
-- read "when a tick completes with nothing failed", and so did the code, which
-- deleted the row on a tick that fired nothing and only SKIPPED subjects an
-- earlier unfinished tick had claimed. That tick learned nothing, and dropping the
-- row let the next wake mint a fresh epoch and re-fire an address that already
-- succeeded, inflating captured_locators.observations -- corroboration nobody
-- produced. The release is now the spent-epoch rule alone, one whole cadence on.
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

${AI_RUNS_SCHEMA}

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

${BIAS_SCHEMA}



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

${CALIBRATION_SCHEMA}

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
-- =========================================================================

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
-- =========================================================================

-- =========================================================================

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

-- REC-191: THE CONTENT TYPE A MONITOR TICK LAST READ AT AN ADDRESS, which is what
-- the cadence plan falls back on when no version authored a frequency (the
-- contract sets the check frequency, BIO_Content_Framework section 6, and
-- CONTRACT_FREQUENCY gives it an interval). op=monitor determines the type on
-- every tick and, until this table, told only its caller -- so a document
-- stating no frequency read UNSCHEDULED in the plan though the tick had answered
-- it by its contract (D-65's worker finding a).
-- Keyed on the NORMALISED address, which is the key captured_locators and the
-- version chain use, so every version at one address shares one reading. The raw
-- address is kept beside it because a bundle with no captured address is matched
-- on its own source.locator, which is raw.
-- A row is replaced only by a tick that DETERMINED a contract, or when none is
-- held: an unreachable source says nothing about what the document is, so it
-- must not erase what an earlier tick read. content_type and contract NULL is a
-- tick that read the address and could not say, with basis saying why.
-- DERIVED from ticks over the corpus: a whole-store purge clears it. A per-bundle
-- purge does not, because an address outlives any one of its versions, the same
-- reasoning as source_reachability.
CREATE TABLE IF NOT EXISTS monitor_address_type (
  address_norm  TEXT PRIMARY KEY,
  address       TEXT NOT NULL,   -- the locator as the ticked document states it
  content_type  TEXT,            -- the doctype key, NULL when undetermined or a shell
  confidence    TEXT,
  contract      TEXT,            -- substance, membership or unmonitorable, NULL when undetermined
  basis         TEXT,            -- why no type was read, when none was
  read_at       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS monitor_address_type_raw ON monitor_address_type(address);

${HOST_GOVERNOR_SCHEMA}
`;
