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
  confined_to     TEXT
);
CREATE INDEX IF NOT EXISTS ai_credentials_secret ON ai_credentials(secret_sha);
CREATE INDEX IF NOT EXISTS ai_credentials_principal ON ai_credentials(principal_kind, principal);

-- R22-R26 (T33-20; K1502): each member's own Claude account reference, one row per member, held only by that
-- member's own act. THE SECRET IS STORED ONLY SEALED (R23): 'sealed' is AES-256-GCM ciphertext under a key derived
-- (HKDF-SHA-256) from the Worker's seal secret with the member id as salt, so the key is never stored beside the row
-- and no other member's act reaches it; 'iv' is its nonce. No digest of the secret is kept. 'suggestions' and
-- 'standing' are the member's own switches (R25), off by default; removing the row turns both off. There is no group,
-- project or instance row (R26): 'member_id' is a member's id and nothing else. Never exported (R30).
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
CREATE TABLE IF NOT EXISTS keyed_services (
  service TEXT PRIMARY KEY,
  sealed  TEXT,
  iv      TEXT,
  is_on   INTEGER NOT NULL DEFAULT 0,
  set_by  TEXT,
  set_at  TEXT
);

-- R27 (Q1-3; K1450): the short-lived, read-only ask grant. Only the SHA-256 of the token is kept, with its member,
-- the session it was minted under (the grant ends with it) and its expiry. It is no run row, no observation row and
-- no read log. Never exported (R30).
CREATE TABLE IF NOT EXISTS ai_grants (
  grant_sha TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  session   TEXT NOT NULL,
  expires   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS ai_grants_member ON ai_grants(member_id);
`;

/* Columns a store written before they existed gains at boot: additive and nullable, never back-filled (D-85). */
export const CREDENTIALS_ADDITIVE_COLUMNS = [
  ["signers", "status_by", "TEXT"],
  ["signers", "origin", "TEXT"],
  ["signers", "registered_by", "TEXT"],
  ["signers", "status_at", "TEXT"],
  ["ai_credentials", "confined_to", "TEXT"],
];

/* R18: every table this module owns, declared exempt from purge (identity and credentials outlive a reset corpus). */
export const CREDENTIALS_EXEMPT_TABLES = ["credentials", "sessions", "bootstrap", "signers", "ai_credentials",
  "account_references", "keyed_services", "ai_grants"];

/* R30 (plan T33, Rules (6)): each table's classes for record-core's `declareTable` (its R21), declared explicitly.
   Every table is purge-exempt (R18) and never expunged. Account references, keyed-service keys, password hashes,
   sessions, AI credentials and ask grants are never exported; account references are seen by their owner alone.
   Signer keys are public halves the group already publishes (`groupkeyspublic`), so they export; the bootstrap row
   is an administrator's fact. */
const CLASSES = { purge: "exempt", expunge: "none", derive: "stored", version_chain: false };
export const CREDENTIALS_TABLES = Object.freeze([
  ["credentials", "never", "group"], ["sessions", "never", "group"], ["bootstrap", "admin-only", "group"],
  ["signers", "yes", "group"], ["ai_credentials", "never", "group"], ["account_references", "never", "owner"],
  ["keyed_services", "never", "group"], ["ai_grants", "never", "group"],
].map(([name, exp, sight]) => Object.freeze({ name, ...CLASSES, export: exp, sight })));
