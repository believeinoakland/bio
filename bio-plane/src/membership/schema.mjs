/* membership's tables (R57–R59): the DDL this module owns, moved from the legacy schema text and the legacy
 * store's constructor (T3-2), and the additive columns an older store gains at boot. `Membership#migrate` runs
 * it. SQL comments are `--` lines, dropped before the statements run. */
export const MEMBERSHIP_SCHEMA = `
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
  -- group. See docs/architecture/BIO_Membership_Architecture_v2.md section 3.
  cover       TEXT NOT NULL,
  -- The HANDLE the member chooses at enrolment, what the RECORD shows; unique (members_handle).
  handle      TEXT,
  role        TEXT NOT NULL DEFAULT 'member',
  status      TEXT NOT NULL DEFAULT 'invited',
  invite_hash TEXT,
  -- Capabilities, section 5: a JSON array of CAPABILITIES words; administer is never one of them.
  capabilities TEXT,
  created     TEXT NOT NULL,
  updated     TEXT NOT NULL,
  -- R58: the actor whose act caused the latest status transition; NULL reads 'not recorded', never back-filled.
  status_by   TEXT,
  -- D-134: who invited the member (server-stamped); NULL reads 'not recorded'.
  invited_by  TEXT,
  -- R19 (section 3, "Pairing"): whether this member's cover-and-handle pairing is published, the member's or an
  -- administrator's per-member decision. 0 until one of them publishes it.
  pairing_published INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS members_handle ON members(handle) WHERE handle IS NOT NULL;

-- Registered signing keys, the plane's projection of the member key
-- registry. key_b64 is the bare base64 of the OpenSSH wire public key, the
-- exact bytes an SSHSIG embeds, so matching is byte equality.
CREATE TABLE IF NOT EXISTS signers (
  key_b64   TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  comment   TEXT,
  status    TEXT NOT NULL DEFAULT 'active',
  added     TEXT NOT NULL,
  -- REC-159: the administrator whose act last set the key's status; NULL reads 'not recorded'.
  status_by TEXT
);

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

-- REC-150 (Membership Architecture v2 section 7, item 7.14, "The request to join", BOB #16): a member outside a
-- DISCOVERABLE project asks to be added. ONE ROW PER REQUEST, and the record is APPEND-ONLY AT THE FIELD: the
-- asking fields (project, member, the name the member was shown, the comment, the date) are written once at the
-- ask and never touched, and the closing fields (state, closed_by, closed_comment, closed_at) are written ONCE,
-- by the one statement that moves an OPEN row to a terminal state -- every closing UPDATE carries
-- WHERE state = 'open', so a closed row is never rewritten and nothing is ever deleted but by purge.
-- project_name is the name AS SHOWN when the member asked: after a project goes HIDDEN the requester keeps sight
-- of their own request, which names only what they already saw, so it must not read the live title.
-- AT MOST ONE OPEN REQUEST PER MEMBER PER PROJECT is the partial unique index below, held by the schema and
-- asked again by the store (which refuses by name before the index would). Keyed on project_id, a bundle id, so
-- both purge arms clear it with the project (the project_visibility precedent).
CREATE TABLE IF NOT EXISTS project_join_requests (
  seq            INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id     TEXT NOT NULL,
  member_id      TEXT NOT NULL,
  project_name   TEXT,
  comment        TEXT,
  asked_at       TEXT NOT NULL,
  state          TEXT NOT NULL CHECK (state IN ('open','withdrawn','granted','declined','lapsed')),
  closed_by      TEXT,
  closed_comment TEXT,
  closed_at      TEXT
);
CREATE INDEX IF NOT EXISTS project_join_requests_project ON project_join_requests(project_id, seq);
CREATE INDEX IF NOT EXISTS project_join_requests_member ON project_join_requests(member_id, project_id, seq);
CREATE UNIQUE INDEX IF NOT EXISTS project_join_requests_one_open
  ON project_join_requests(project_id, member_id) WHERE state = 'open';
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
  PRIMARY KEY (project_id, member_id)
);
CREATE INDEX IF NOT EXISTS pp_member ON project_participants(member_id);

-- Section 1.3, declared expertise and confirmed licenses. An EVENT LOG, not a status column, because withdrawal
-- supersedes rather than overwrites (R23). It gates nothing (R24). The v1.4 members.expertise column it
-- replaced is dropped (K57).
CREATE TABLE IF NOT EXISTS member_expertise (
  seq       INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id TEXT NOT NULL,
  label     TEXT NOT NULL,
  event     TEXT NOT NULL,
  actor     TEXT NOT NULL,
  created   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS mx_member ON member_expertise(member_id, label);

-- Section 7.10 owner governance: the OPEN votes, one row per voter per proposal. Separate from admin_votes
-- because the arithmetic differs at two and sharing the table would invite sharing the tally. A carried
-- decision's votes are copied into project_owner_decisions (R42) and then cleared, so a later proposal about
-- the same member starts from no votes.
CREATE TABLE IF NOT EXISTS project_owner_votes (
  project_id TEXT NOT NULL,
  kind       TEXT NOT NULL,
  target     TEXT NOT NULL,
  voter      TEXT NOT NULL,
  reason     TEXT,
  created    TEXT NOT NULL,
  PRIMARY KEY (project_id, kind, target, voter)
);

-- R42 (sections 7.10, 7.13): EVERY OWNERSHIP DECISION, KEPT. One row per carried addition, removal or rescue,
-- naming its deciders and their reasons (JSON arrays), append-only; every participant of the project reads it.
CREATE TABLE IF NOT EXISTS project_owner_decisions (
  seq        INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  kind       TEXT NOT NULL CHECK (kind IN ('add','remove','rescue')),
  target     TEXT NOT NULL,
  deciders   TEXT NOT NULL,
  reasons    TEXT NOT NULL,
  at         TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS project_owner_decisions_project ON project_owner_decisions(project_id, seq);

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

-- Administrator governance, section 4.7. Every vote is a row, so the record of WHO decided and WHY survives the
-- decision; a spent proposal keeps its votes.
--   kind  'add'     an endorsement; addition needs the consensus of every existing administrator
--         'remove'  a vote to eject; removal needs a majority of ALL administrators, the target counted
CREATE TABLE IF NOT EXISTS admin_votes (
  kind      TEXT NOT NULL,
  target    TEXT NOT NULL,
  voter     TEXT NOT NULL,
  reason    TEXT,
  created   TEXT NOT NULL,
  PRIMARY KEY (kind, target, voter)
);

-- R11 (section 4.8): WHO HOLDS HOSTING ACCESS, as the group recorded it when asked. Append-only; the latest row
-- is the current answer. Exempt from purge with the members' family.
CREATE TABLE IF NOT EXISTS hosting_access (
  seq         INTEGER PRIMARY KEY AUTOINCREMENT,
  holders     TEXT NOT NULL,
  note        TEXT,
  recorded_by TEXT NOT NULL,
  at          TEXT NOT NULL
);
`;

/* Columns a store written before they existed gains at boot: additive and nullable, never back-filled (D-85).
   `members.cover` was `members.name` before 2026-07-24 and is renamed first. */
export const MEMBERSHIP_ADDITIVE_COLUMNS = [
  ["members", "handle", "TEXT"],
  ["members", "capabilities", "TEXT"],
  ["members", "status_by", "TEXT"],
  ["members", "invited_by", "TEXT"],
  ["members", "pairing_published", "INTEGER NOT NULL DEFAULT 0"],
  ["project_participants", "owner_order", "INTEGER"],
  ["signers", "status_by", "TEXT"],
  ["ai_credentials", "confined_to", "TEXT"],
];

/* R59: the tables purge never clears (identity, credentials, governance) and those keyed by project, cleared
   with it. */
export const MEMBERSHIP_EXEMPT_TABLES = ["credentials", "sessions", "bootstrap", "members", "signers", "ai_credentials",
  "member_expertise", "admin_votes", "hosting_access"];
export const MEMBERSHIP_PROJECT_TABLES = ["project_participants", "project_owner_votes", "project_owner_decisions",
  "project_removals", "project_visibility", "project_sight", "project_join_requests"];
