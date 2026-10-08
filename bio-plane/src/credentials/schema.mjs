/* credentials' tables (R18): the DDL this module owns, copied from `membership/schema.mjs` at the split (K617, K637),
 * and the additive columns an older store gains at boot. `Credentials#migrate` runs it. SQL comments are `--` lines,
 * dropped before the statements run. */
export const CREDENTIALS_SCHEMA = `
-- Credentials live here rather than in Worker secrets, because a Worker cannot
-- rewrite its own secret. ADMIN_TOKEN is a bootstrap credential used once; the
-- real password is chosen by the operator and only its hash is stored. Losing
-- it is recoverable by overwriting ADMIN_TOKEN in the dashboard, which returns
-- the instance to an unclaimed state. A member's password is stored under the
-- role 'member:<member_id>'.
CREATE TABLE IF NOT EXISTS credentials (
  role       TEXT PRIMARY KEY,
  salt       TEXT NOT NULL,
  hash       TEXT NOT NULL,
  iterations INTEGER NOT NULL,
  updated    TEXT NOT NULL
);

-- Sessions are DO-backed so a password login can be exchanged for a bearer
-- token without the password travelling on every later request.
-- R40 (F13): a session is held only as the SHA-256 of its token, 'token_sha';
-- the token itself is answered once, by login, and stored nowhere. A store
-- whose sessions were held as tokens is carried over as their digests at boot
-- (Credentials#migrate), so they stay live and no token stays stored.
CREATE TABLE IF NOT EXISTS sessions (
  token_sha TEXT PRIMARY KEY,
  role      TEXT NOT NULL,
  expires   INTEGER NOT NULL,
  created   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expires ON sessions(expires);
CREATE INDEX IF NOT EXISTS sessions_role ON sessions(role);

-- One row, id=1. Records that the bootstrap credential has been spent.
CREATE TABLE IF NOT EXISTS bootstrap (
  id          INTEGER PRIMARY KEY CHECK (id = 1),
  consumed_at TEXT,
  token_fp    TEXT
);

-- Registered signing keys, the plane's projection of the member key
-- registry. key_b64 is the bare base64 of the OpenSSH wire public key, the
-- exact bytes an SSHSIG embeds, so matching is byte equality. member_id names
-- a member of membership's roster, read through its services (R8, R11).
CREATE TABLE IF NOT EXISTS signers (
  key_b64   TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  comment   TEXT,
  status    TEXT NOT NULL DEFAULT 'active',
  added     TEXT NOT NULL,
  -- REC-159: the actor whose act last set the key's status; NULL reads 'not recorded'.
  status_by TEXT,
  -- R8 (N364, DEC-80 item 4): how the key was registered, 'admin' by an administrator (R6) or 'self' by its own
  -- member from a signed-in session (R9), and who registered it. A row written before these columns was
  -- registered by R6, the only door there was, so a NULL origin reads 'admin'; NULL registered_by reads
  -- 'not recorded'. Neither is back-filled. attests never reads origin (R19).
  origin    TEXT,
  registered_by TEXT,
  -- R21 (N505): the instant the key's status last changed: set at first registration (R6, R9) and at each act that
  -- changes it (R6's re-activation, R7, R10, R16), never by one that leaves it as it was. A row written before this
  -- column existed has NULL, read as not recorded: it may have changed status after it was registered, so 'added'
  -- would state a false instant for it. Never back-filled.
  status_at TEXT
);
CREATE INDEX IF NOT EXISTS signers_member ON signers(member_id);

-- PL-11 / IS-5 / D-199: THE ai CREDENTIAL'S DECLARED TASK SCOPE, AND THE
-- WHOLE REASON IT IS A TABLE RATHER THAN A BINDING.
--
-- The four token classes -- admin, member, probe, daemon -- are ENV BINDINGS:
-- an operator sets a value in the hosting dashboard and the plane compares
-- against it, a settings row by another name, which D-199 (2) rules out for
-- this one class (DEC-17's reasoning: a settings row "would be a way to change
-- the standard with nothing to read afterwards"). A presented ai token resolves
-- HERE, against a row a member wrote: who minted it, when, for whom, and what
-- it may do. Amending the reach is another row with a name against it.
--
-- THE VALUE IS NEVER STORED. 'token_id' is the IDENTITY, a short public name
-- the record can print, an act can cite and a member can revoke; 'secret_sha'
-- is the SHA-256 of the presented value, which a lookup compares.
--
-- BOTH PRINCIPAL KINDS ARE LEGITIMATE AND CARRY DIFFERENT ACCOUNTABILITY, which
-- is why 'principal_kind' is not nullable (D-199 (4), DEC-55 det 4): an
-- ORGANISATION-scoped key acts for the group, a MEMBER-scoped key is
-- attributable to that member. 'principal' IS THE VIEWER the plane stamps on
-- this credential's reads, so who is behind it and what it may read are one
-- string.
--
-- 'scope_writes' is a JSON array of op names, arriving already judged at the
-- mint edge (the control plane's ops table is the only thing that knows which
-- ops a member reaches); the declared writes narrow that floor, never widen it.
--
-- NOT PURGED (R18): this is identity, and a whole-store purge that cleared it
-- would revoke every agent's authority as a side effect of resetting the corpus.
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
  -- D-463: the namespace this credential is confined to for its whole life ('scratch'), or NULL for one that is
  -- not confined. It arrives already judged at the mint edge (the control plane owns the namespaces). NULLABLE AND
  -- NEVER BACK-FILLED: a credential minted before this column existed was minted unconfined, and NULL is that fact.
  confined_to     TEXT,
  -- R42 (F15): the instant the credential expires, whole days after it was minted (1 to 365, 90 by default). A
  -- credential minted before this column existed is given 90 days after the migration that adds it (K1934 (5)).
  expires_at      TEXT
);
CREATE INDEX IF NOT EXISTS ai_credentials_secret ON ai_credentials(secret_sha);
CREATE INDEX IF NOT EXISTS ai_credentials_principal ON ai_credentials(principal_kind, principal);

-- R22-R25 (T33-20; K1502): each member's own Claude account reference, one row per member, held only by that
-- member's own act. THE SECRET IS STORED ONLY SEALED (R23): 'sealed' is AES-256-GCM ciphertext under a key derived
-- (HKDF-SHA-256) from the Worker's seal secret with the member id as salt, so the key is never stored beside the row
-- and no other member's act reaches it; 'iv' is its nonce. No digest of the secret is kept. 'suggestions' and
-- 'standing' are the member's own switches (R25), off by default; removing the row turns both off. 'member_id' is a
-- member's id and nothing else: the group's key is its own table (R33). Never exported (R30).
CREATE TABLE IF NOT EXISTS account_references (
  member_id   TEXT PRIMARY KEY,
  kind        TEXT NOT NULL,
  sealed      TEXT NOT NULL,
  iv          TEXT NOT NULL,
  set_at      TEXT NOT NULL,
  suggestions INTEGER NOT NULL DEFAULT 0,
  standing    INTEGER NOT NULL DEFAULT 0
);

-- R29 (K1449): the group's own key for one keyed outside service, set by an administrator, sealed as above (salt
-- 'group:<service>'), off by default and off while no key is held. Never exported (R30).
-- (T36; K1946 T1) 'service' is 'courtlistener' or 'security:<tool_id>', each outside security tool's credentials
-- (file-safety R28). 'form' is 'key' for one key, or 'fields' for a set of named fields held as one value (sealed as
-- its JSON, under the kind 'fields'); a row written before the column has NULL, read as 'key' (the only form there
-- was), never back-filled. A set with no key deletes the row: the key is gone and the service off (file-safety R30).
CREATE TABLE IF NOT EXISTS keyed_services (
  service TEXT PRIMARY KEY,
  sealed  TEXT,
  iv      TEXT,
  is_on   INTEGER NOT NULL DEFAULT 0,
  set_by  TEXT,
  set_at  TEXT,
  form    TEXT
);

-- R27 (Q1-3; K1450): the short-lived, read-only ask grant. Only the SHA-256 of the token is kept, with its member,
-- the session it was minted under (the grant ends with it; R40: the session's digest, never its token) and its expiry. It is no run row, no observation row and
-- no read log. Never exported (R30).
-- R32 (N580; K1481, K1609): a standing question's grant is held here too, 'kind' 'standing' and 'session' empty: the
-- scheduler acts with no session, so it ends at its time, or at once when its member is revoked (R16) or removes
-- their reference (R22). An ask's grant is 'kind' 'ask'; a row written before the column existed has NULL, read as
-- an ask's (the only kind there was), never back-filled.
CREATE TABLE IF NOT EXISTS ai_grants (
  grant_sha TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  session   TEXT NOT NULL,
  expires   INTEGER NOT NULL,
  kind      TEXT
);
CREATE INDEX IF NOT EXISTS ai_grants_member ON ai_grants(member_id);

-- R33, R34, R37 (K1755, K1757): the group's one Anthropic API key, one row (id=1), set, switched and removed only by
-- an active administrator. Sealed as a reference is (R23), under the copy rather than a member: 'sealed' is AES-256-GCM
-- ciphertext under a key derived from the Worker's seal secret with 'group-key:anthropic' as salt; no digest is kept.
-- 'is_on' is off when the key is first set and off by default; 'suggestions' and 'standing' are the group key's own
-- switches (R37), off by default, both turned off when the key is removed. 'set_by' and 'set_at' name the act that set
-- the key held now. Never exported (R30, R34).
CREATE TABLE IF NOT EXISTS group_key (
  id          INTEGER PRIMARY KEY CHECK (id = 1),
  sealed      TEXT,
  iv          TEXT,
  is_on       INTEGER NOT NULL DEFAULT 0,
  set_by      TEXT,
  set_at      TEXT,
  suggestions INTEGER NOT NULL DEFAULT 0,
  standing    INTEGER NOT NULL DEFAULT 0
);

-- R33: each act on the group key, recorded with its administrator and instant, never the key: 'act' is 'set',
-- 'remove', 'switch' (detail 'on' or 'off') or 'switch:<name>' (R37; detail 'on' or 'off'). Never exported.
CREATE TABLE IF NOT EXISTS group_key_acts (
  seq    INTEGER PRIMARY KEY AUTOINCREMENT,
  act    TEXT NOT NULL,
  detail TEXT,
  actor  TEXT NOT NULL,
  at     TEXT NOT NULL
);

-- R36: the members who have read the group key's notice, each by their own act, with its instant. Seen by its member
-- alone; never exported.
CREATE TABLE IF NOT EXISTS group_key_notices (
  member_id TEXT PRIMARY KEY,
  seen_at   TEXT NOT NULL
);

-- R38 (F3; K1881): the sign-in window. Refused sign-ins, claims and recoveries, counted per source and per role in
-- 10-minute windows ('win' the window's number since the epoch), the current window and the one before it kept for
-- the two-bucket estimate. 'kind' is 'source' or 'role'; 'key' is a keyed digest (R44's key) of the caller's source
-- fingerprint or of the role asked, so no row names an address or a role. Never exported (R30).
CREATE TABLE IF NOT EXISTS signin_window (
  kind  TEXT NOT NULL,
  key   TEXT NOT NULL,
  win   INTEGER NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (kind, key, win)
);

-- R44 (N703; DEC-165, DEC-166): the security tally. COUNTS ONLY: a kind, an hour (whole hours since the epoch, UTC)
-- and Cloudflare's two-letter country label ('' when none or not yet placed), and how many. No address,
-- fingerprint, handle, role, op, path, time within the hour or content. Counts older than 90 days are dropped.
CREATE TABLE IF NOT EXISTS security_counts (
  kind    TEXT NOT NULL,
  hour    INTEGER NOT NULL,
  country TEXT NOT NULL,
  count   INTEGER NOT NULL,
  PRIMARY KEY (kind, hour, country)
);

-- R44 (DEC-166's place rule): a refused sign-in, claim or recovery this module counts is counted at once without a
-- place; its country waits here, named only by a keyed digest of its role, until an hour has passed with no
-- successful sign-in or recovery under that role (then it is placed and the row dropped) or one follows within the
-- hour (then the row is dropped and the count is never placed). A pause (R38's 'rate') waiting here is also what
-- makes a success within the hour a 'through'.
CREATE TABLE IF NOT EXISTS security_pending (
  seq     INTEGER PRIMARY KEY AUTOINCREMENT,
  kind    TEXT NOT NULL,
  hour    INTEGER NOT NULL,
  country TEXT,
  role    TEXT NOT NULL,
  at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS security_pending_role ON security_pending(role);
CREATE INDEX IF NOT EXISTS security_pending_at ON security_pending(at);

-- R38, R44: the key the window's and the tally's digests are made under (HMAC-SHA-256), 256 random bits generated
-- once, answered by no op, never exported, exempt from purge (capture R56's pattern, a key of this module's own).
CREATE TABLE IF NOT EXISTS security_key (
  id      INTEGER PRIMARY KEY CHECK (id = 1),
  key_hex TEXT NOT NULL,
  created TEXT NOT NULL
);

-- R46 (K1888): administrators' one-time recovery codes. Only each code's SHA-256 is kept, with the role it recovers,
-- when it was issued and when it was spent (by a recovery, a new issue, or the member's revocation).
CREATE TABLE IF NOT EXISTS recovery_codes (
  code_sha  TEXT PRIMARY KEY,
  role      TEXT NOT NULL,
  issued_at TEXT NOT NULL,
  spent_at  TEXT
);
CREATE INDEX IF NOT EXISTS recovery_codes_role ON recovery_codes(role);

-- R47: each recovery, with its role and instant; never the code.
CREATE TABLE IF NOT EXISTS recoveries (
  seq  INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL,
  at   TEXT NOT NULL
);

-- R51, R52 (DEC-172; K1957): the group's setting that keeps its material away from every assistant. Each set is
-- appended, never replacing an earlier one: 'is_on', the administrator's 'reason' in their own words (NULL when none
-- was given), who set it ('set_by', the administrator's id) and when. The latest row is the setting; with none it is
-- off. Read by every active member (R52); never a secret, so exported to administrators only, as 'bootstrap' is.
CREATE TABLE IF NOT EXISTS ai_keep_away (
  seq    INTEGER PRIMARY KEY AUTOINCREMENT,
  is_on  INTEGER NOT NULL,
  reason TEXT,
  set_by TEXT NOT NULL,
  set_at TEXT NOT NULL
);

-- R43 (DEC-156; K1819): that a member is connected through their own Claude subscription, and since when. A FACT
-- ONLY: no login, no code from Anthropic's page, no token and no digest of any of them; the sign-in lives in the
-- member's own agent-runner container, where the Claude Code binary wrote it. Seen by its member alone.
CREATE TABLE IF NOT EXISTS subscription_connections (
  member_id TEXT PRIMARY KEY,
  since     TEXT NOT NULL
);
`;

/* Columns a store written before they existed gains at boot: additive and nullable, never back-filled (D-85). */
export const CREDENTIALS_ADDITIVE_COLUMNS = [
  ["signers", "status_by", "TEXT"],
  ["signers", "origin", "TEXT"],
  ["signers", "registered_by", "TEXT"],
  ["signers", "status_at", "TEXT"],
  ["ai_credentials", "confined_to", "TEXT"],
  ["ai_grants", "kind", "TEXT"],
  ["ai_credentials", "expires_at", "TEXT"],
  ["keyed_services", "form", "TEXT"],
];

/* R18: every table this module owns, declared exempt from purge (identity and credentials outlive a reset corpus). */
export const CREDENTIALS_EXEMPT_TABLES = ["credentials", "sessions", "bootstrap", "signers", "ai_credentials",
  "account_references", "keyed_services", "ai_grants", "group_key", "group_key_acts", "group_key_notices",
  "signin_window", "security_counts", "security_pending", "security_key", "recovery_codes", "recoveries",
  "subscription_connections", "ai_keep_away"];

/* R30 (plan T33, Rules (6)): each table's classes for record-core's `declareTable` (its R21), declared explicitly.
   Every table is purge-exempt (R18) and never expunged. Account references, keyed-service keys, password hashes,
   sessions, AI credentials, ask grants, the group key with its acts and its notices are never exported; account
   references and a member's notice are seen by their owner alone. Signer keys are public halves the group already
   publishes (`groupkeyspublic`), so they export; the bootstrap row is an administrator's fact. The group key's
   tables are `sight: "group"`: record-core's R21 offers no administrator sight, and no read answers the key whatever
   its sight; `groupKeyState` answers its state to administrators alone (R34; K1760). T35's tables (R30) are declared
   the same way, never exported: the sign-in window, the tally with its waiting places and its key, and the recovery
   codes and recoveries are the group's (the tally's reading is administrators' alone, R45's own); a member's connected
   subscription is its owner's. (T36) The keep-away setting (R51, R52) is the group's, read by every member, and
   exported to administrators only. */
const CLASSES = { purge: "exempt", expunge: "none", derive: "stored", version_chain: false };
export const CREDENTIALS_TABLES = Object.freeze([
  ["credentials", "never", "group"], ["sessions", "never", "group"], ["bootstrap", "admin-only", "group"],
  ["signers", "yes", "group"], ["ai_credentials", "never", "group"], ["account_references", "never", "owner"],
  ["keyed_services", "never", "group"], ["ai_grants", "never", "group"], ["group_key", "never", "group"],
  ["group_key_acts", "never", "group"], ["group_key_notices", "never", "owner"],
  ["signin_window", "never", "group"], ["security_counts", "never", "group"], ["security_pending", "never", "group"],
  ["security_key", "never", "group"], ["recovery_codes", "never", "group"], ["recoveries", "never", "group"],
  ["subscription_connections", "never", "owner"], ["ai_keep_away", "admin-only", "group"],
].map(([name, exp, sight]) => Object.freeze({ name, ...CLASSES, export: exp, sight })));
