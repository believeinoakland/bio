/* bias's tables (requirements: `build/requirements/bias.md`, R30): the statements projected from each bias set, the
 * adoptions that put a set in force, and the bias debt (the debts, the sweep's place, the settlements). Moved from
 * `schema.mjs` at the module's extraction (T5-7; Bob's ruling 3, "each module owns its tables"). The plane's boot
 * creates them through this module's `migrate()` (R45), which runs this text. */
export const BIAS_TABLES = Object.freeze(["bias_statements", "bias_adoptions", "bias_debts", "bias_debt_sweeps",
                                          "bias_debt_settlements"]);

/* R45 (N343): the columns a store created before them lacks, `[table, column, declaration]`, added by `migrate()`
   before the schema text runs. Never filled for a row already held: a debt settled before `settled_kind` was kept
   reads its kind as undetermined (R36), and an adoption made before its reason was required (R12, DEC-88) keeps
   none, NULL, rather than a reason nobody gave. */
export const BIAS_ADDITIVE_COLUMNS = Object.freeze([Object.freeze(["bias_debts", "settled_kind", "TEXT"]),
                                                   Object.freeze(["bias_adoptions", "reason", "TEXT"])]);

export const BIAS_SCHEMA = `-- PL-12 / D-84: THE BIAS SET'S STATEMENTS, a PROJECTION of the bundle's own
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
-- Carries bundle_id, so it clears in BOTH purge arms (D-113): this module
-- declares it to record-core's purge, and R30's test
-- (test/m/bias/adopt-manifest.test.mjs) holds both arms.
CREATE TABLE IF NOT EXISTS bias_statements (
  bundle_id     TEXT NOT NULL,   -- the bias bundle
  ord           INTEGER NOT NULL,-- position in statements[], the addressable slot
  statement_id  TEXT NOT NULL,   -- stable within the bundle, and what an override names
  kind          TEXT NOT NULL,   -- scrutiny | inference | pattern (the closed set of three)
  subject       TEXT NOT NULL,   -- an ENT- id, a subject registry key (safeguard 4)
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
--
-- 'reason' is DEC-88's: the adopter's own words on why this lens is adopted,
-- required at the act (C-26.21) and replaced with the row on a re-adoption.
-- NULL only on an adoption made before it was required (migrated forward, R45).
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
  reason        TEXT,            -- DEC-88: the adopter's reason, required at the act (C-26.21)
  PRIMARY KEY (scope_type, scope_id, bundle_id)
);
CREATE INDEX IF NOT EXISTS bias_adoptions_scope ON bias_adoptions(scope_type, scope_id);
CREATE INDEX IF NOT EXISTS bias_adoptions_bundle ON bias_adoptions(bundle_id);

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
  cleared_at    TEXT,
  settled_kind  TEXT             -- which act settled it (REC-207), NULL while open and on a debt settled before it was kept
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

-- REC-207 (BIO_Declared_Bias_v0_1.md, "Bias debt, and HUNCH DEBT", BOB #32's ruling of 2026-09-23 23:42Z):
-- WHAT SETTLED A BIAS-DEBT OBLIGATION, ONE APPEND-ONLY ROW PER SETTLING ACT. Three acts settle a debt and each is
-- RECORDED, and none clears it silently. Before this table the only settlement was the lens moving back and it wrote
-- a timestamp on bias_debts and nothing else, so a reader who came later could see THAT the obligation had gone and
-- never WHY -- which is the record saying less than it knows.
-- kind is one of three words. lens_returned is the sweep reading moved false again, derived, with no member behind
-- it. rerun is a run that NAMES the indebted run as the one it re-runs, CLOSED under the lens in force, where by_run
-- is that run and lens_now is the sha it ran under. resolved is a member's authored act with a REQUIRED stated
-- reason, where actor is that member.
-- APPEND-ONLY BY USE, not by a trigger. Nothing in the store updates or deletes a row here, and a debt raised again
-- after a settlement (the lens moved once more) writes a FURTHER row rather than editing this one, so the sequence
-- IS the history. seq orders and keys it, and a settlement is never addressed by anything but its run and its seq.
-- actor is NULL for lens_returned, because a sweep is not a person and attributing it to one would be an invented
-- attribution, and reason is NULL for the two acts that state their ground in the record rather than in words.
-- A run is purged only by the whole-store arm, which takes this with it, beside bias_debts.
CREATE TABLE IF NOT EXISTS bias_debt_settlements (
  seq        INTEGER PRIMARY KEY,
  run        TEXT NOT NULL,
  kind       TEXT NOT NULL CHECK (kind IN ('lens_returned','rerun','resolved')),
  at         TEXT NOT NULL,
  actor      TEXT,
  reason     TEXT,
  by_run     TEXT,
  lens_then  TEXT,
  lens_now   TEXT
);
CREATE INDEX IF NOT EXISTS bias_debt_settlements_run ON bias_debt_settlements(run, seq);
`;
