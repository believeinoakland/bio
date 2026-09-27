/* host-governor's one table (R24), moved from the legacy schema text (T4-1, K72 (3)). The legacy schema interpolates
 * it where the DDL stood, as it does record-core's; `HostGovernor#migrate` runs it too, so the module stands up on
 * its own storage. SQL comments are `--` lines, dropped before the statements run. */
export const HOST_GOVERNOR_SCHEMA = `
-- D-95: the per-host request governor. Our APPETITE is a configured constant
-- because it is ours; their CAPACITY is discovered by being refused and
-- recorded, following the pattern capture_limits proved for the subrequest
-- ceiling. It lives in the Durable Object because the object serialises, which
-- makes one token bucket globally correct for the instance for free; a bucket
-- in Worker memory governs nothing because every invocation is independent.
-- appetite_per_min NULL means the configured default (a CHOSEN constant,
-- recorded in the MEASUREMENTS ledger, never a finding). cooloff_until is how a 429 or
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
