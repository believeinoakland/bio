/* membership's tables (R114, R115, R120): the project tables this module owns, split from the schema that held the members'
 * tables too (T51, CR-4; the members' are `member-roster`'s `schema.mjs`), and the additive columns an older store gains at
 * boot. `Membership#migrate` runs it after `member-roster`'s. SQL comments are `--` lines, dropped before the statements run. */
export const MEMBERSHIP_PROJECT_SCHEMA = `
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
-- rule is stated: Membership#reindexProjectSight is the one statement that computes a row here, and Membership#sight
-- READS this table through visibilityOf rather than reading the act log. That is what lets the directory's
-- candidate query bound IN SQL: before this table, sight was a JS predicate the directory had to ask about
-- every project in the group one at a time, so the number of statements grew with the record even though
-- each was bounded, and REC-149's first attempt to put the rule in the directory's own SQL instead put
-- "no act = hidden" in a SECOND place -- caught by its own default-discoverable control arm, which flipped
-- the default while the directory did not move.
--
-- DERIVED, AND IT SAYS SO: every row is recomputed from project_visibility and bundles at every boot
-- (Membership#migrate, the #seedMintLedger precedent), at every promotion of a bundle, and at every
-- owner's act. Nothing here is authored, so drift cannot survive a restart, and the act log stays the
-- record. Keyed on project_id, a bundle id, so both purge arms clear it with the project (the
-- project_participants precedent).
-- THE ROW IS THE PROJECT AND ITS SETTING AND NOTHING ELSE. No date: a projection needs none, the act log
-- above carries every date there is, and a column that moved on each recompute would make an UNCHANGED boot
-- rewrite every row with different bytes -- which is a RESTART PLUS A PURE READ MOVING A TABLE, and a live
-- verification's no-write claim rests on the tables reading the same before and after, so the derivation is
-- idempotent at the byte instead (test/m/membership/t19-enrol-boot.test.mjs holds a second boot's rows unchanged).
CREATE TABLE IF NOT EXISTS project_sight (
  project_id TEXT PRIMARY KEY,
  setting    TEXT NOT NULL CHECK (setting IN ('discoverable','hidden'))
);
CREATE INDEX IF NOT EXISTS project_sight_setting ON project_sight(setting, project_id);
-- =========================================================================

-- T38 (N783, K2270): project_join_requests, project_owner_votes and project_owner_decisions are project-roster's.
-- Project participation, Membership Architecture v2 section 7. Keyed on member_id and not on handle: a handle is
-- what the RECORD shows and is the member's own, and keying participation on a display name would make the graph
-- depend on a field the member picked. Invitations arrive BY handle (7.2) and are resolved here.
--   state   'invited'  invited, not joined: view rights only (7.5)
--           'joined'   full visibility, subject to capabilities
--           'leaving'  a joined member unchecked the box (7.6). A REQUEST, not a removal: they keep their
--                      position until an OWNER removes them (7.7, as amended by v2 section 11 item 5).
--   owner   the owner flag (7.1, 7.10).
CREATE TABLE IF NOT EXISTS project_participants (
  project_id TEXT NOT NULL,
  member_id  TEXT NOT NULL,
  state      TEXT NOT NULL,
  owner      INTEGER NOT NULL DEFAULT 0,
  -- R65: the order in which the member became an owner, a counter per project (NULL for a non-owner, and for an
  -- owner row written before this column, which orders first, by created).
  owner_order INTEGER,
  invited_by TEXT,
  comment    TEXT,
  created    TEXT NOT NULL,
  updated    TEXT NOT NULL,
  -- R127 (K2404; T40): the instant the row last became 'joined', written by the act that joins (a project's creation
  -- for its founding owner); NULL for a row joined before T40, never back-filled.
  joined_at  TEXT,
  PRIMARY KEY (project_id, member_id)
);
CREATE INDEX IF NOT EXISTS pp_member ON project_participants(member_id);

-- R63 (Bob, 2026-09-26): EVERY REMOVAL AN OWNER MAKES, KEPT, with who removed whom, when, and the owner's reason;
-- every participant of the project reads it. Append-only.
CREATE TABLE IF NOT EXISTS project_removals (
  seq        INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  member_id  TEXT NOT NULL,
  removed_by TEXT NOT NULL,
  comment    TEXT,
  at         TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS project_removals_project ON project_removals(project_id, seq);
`;

/* Columns a store written before they existed gains at boot: additive and nullable, never back-filled (D-85). */
export const MEMBERSHIP_ADDITIVE_COLUMNS = [
  ["project_participants", "owner_order", "INTEGER"],
  ["project_participants", "joined_at", "TEXT"],
];

/* R115 (T38): participation, visibility and the sight index, with R36's removals; the owner votes, decisions and requests
   to join are `project-roster`'s, declared by it (its R18). */
export const MEMBERSHIP_PROJECT_TABLES = ["project_participants", "project_removals", "project_visibility", "project_sight"];
