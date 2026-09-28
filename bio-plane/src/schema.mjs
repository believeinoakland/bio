import { RECORD_SCHEMA } from "./record-core/index.mjs";
import { PROVENANCE_SCHEMA } from "./provenance/schema.mjs";
import { HOST_GOVERNOR_SCHEMA } from "./host-governor/schema.mjs";
import { CALIBRATION_SCHEMA } from "./calibration/schema.mjs";
import { BIAS_SCHEMA } from "./bias/schema.mjs";
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
  -- REC-217 / BIO_Publication_v0_1.md section 3 rule 13 (BOB #33, 2026-09-24 19:14Z): THE DRAFT THE PUBLISHER
  -- NAMED as this case edition's draft at op=publish (draft=), or NULL where none was named. The link is an ACT:
  -- its author is authored_by and its time authored_at, the publisher and the moment of the same op=publish, and
  -- the document's own bytes state it in words. Readings taken through this draft bind to this case edition.
  -- NULL on a row written before this column is MEASURED, not back-filled: no act could name a draft until now.
  draft_id        TEXT,
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

-- MK-7 / MEMBER-KNOWLEDGE-DESIGN.md section 4.2-4.6: THE ATTRIBUTION ACT. One row per
-- (case edition, observation): the level the observation's AUTHOR chose for what that edition's
-- published case document shows of them. Written only by op=attribute, taken by the author and by
-- nobody else, never prefilled (no row is "unchosen", and a case document cannot be ratified
-- while any observation it reaches is unchosen). A later edition INHERITS the latest earlier
-- edition's row until the author acts again (section 4.3). chosen_by is the server-stamped author.
-- There is deliberately NO column that could hold an off-the-record source's identity: that
-- anonymity is a structural absence (section 4), and hygiene would see a column added here.
-- bundle_id is the OBSERVATION, so the rows ride the purge TABLES list in both arms (D-113): an
-- attribution outliving its observation would attach to whatever bundle was next allocated its id.
CREATE TABLE IF NOT EXISTS observation_attributions (
  case_id    TEXT NOT NULL,
  edition    INTEGER NOT NULL,
  bundle_id  TEXT NOT NULL,     -- the observation (an authored INFO bundle)
  level      TEXT NOT NULL CHECK (level IN ('group','project','cover','name')),
  chosen_by  TEXT NOT NULL,     -- the observation's author, stamped from the signed-in session
  chosen_at  TEXT NOT NULL,
  PRIMARY KEY (case_id, edition, bundle_id)
);
CREATE INDEX IF NOT EXISTS observation_attributions_bundle ON observation_attributions(bundle_id);
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
