/* queue's tables (requirements: `build/requirements/queue.md`, R36): the personal half (`queue_state`,
 * `queue_item_mutes`) and the project-scoped dispositions (`finding_dispositions`). Moved from the legacy store's
 * `schema.mjs` at the module's extraction (T12; K4, "each module owns its tables"), which interpolated this text until
 * it was retired (T19); `queueOf(ctx).migrate()` creates them, run by the plane's migration pass (plane R3). The
 * inbox's `tasks` is `tasks`' (its R8; N363). */
export const QUEUE_TABLES = Object.freeze(["queue_state", "queue_item_mutes", "finding_dispositions"]);

/** A table in a purge list (a name, or `{name, …}`) that is one of queue's. */
export const queueOwns = (t) => QUEUE_TABLES.includes(typeof t === "string" ? t : t && t.name);

export const QUEUE_SCHEMA = `-- REC-21: the PERSONAL half of the queue, and it is a SEPARATE TABLE on
-- purpose. The record half of an item's state lives on the EVENT (DEC-16: a
-- task's status, a proposal's disposition), so one member's resolution clears
-- every member's queue. This table holds what must NOT work that way: what one
-- member has chosen not to be told about. Muting is PERSONAL; dismissing is a
-- RECORD ACT; they are never one control (D-125), and keeping them in two
-- tables with two doctrines is how that survives the next person who
-- implements a delete button.
--
-- muted_kinds is a sorted comma-separated set and MAY CONTAIN NO OBLIGATION
-- KIND (CONDITION and, since D-125, FINDING kinds; R31). A CONDITION is a fact about our own machinery; an OBLIGATION is
-- something a named person must do for the record to proceed, and tasks
-- carries no per-member mute, so a muted obligation would leave the record
-- believing a question reached a person it cannot reach. The fence is at the
-- ONE write (queue/index.mjs queueMute, over queuestate.mjs's catalogue), because a
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
-- BOTH purge arms via a DELETE keyed on it (D-113); test/m/queue/invariants.test.mjs'
-- R36 test holds that.
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
-- the ONE write (queue/index.mjs queueMute) for queue_state's reason. It is personal
-- state, not corpus-derived, and it is keyed on no bundle id, so it clears in
-- the whole-store purge arm only (D-113).
CREATE TABLE IF NOT EXISTS queue_item_mutes (
  member_id   TEXT NOT NULL,
  item_id     TEXT NOT NULL,
  item_class  TEXT NOT NULL,
  muted_at    TEXT NOT NULL,
  PRIMARY KEY (member_id, item_id)
);

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
-- queue-producers/index.mjs #findingsStanceDiverged already enforces by refusing to offer
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
-- silent-leftover, held by test/m/queue/invariants.test.mjs' R36 test.
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
-- and the old airuns.test.mjs's index-reader ratchet (deleted in T20) FAILED THE BUILD
-- naming them, because nothing filters on either leading column: op=queue reads this
-- table WHOLE, exactly as proposalsFeed reads the other one, and the upsert seeks the
-- primary key. An index with no statement behind it is an access path built for a
-- question no op asks. Add one WITH the statement that reads it.
`;
