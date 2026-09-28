/* monitoring's tables (requirements: `build/requirements/monitoring.md`, R21, R13, R41; K4). Moved from `schema.mjs`
 * (legacy-store) with their comments. All three are DERIVED and declared to record-core's purge (K23, R41):
 * `monitor_fired` by `subject`; `monitor_tick_epoch` and `monitor_address_type` only by a whole-store purge, an
 * address outliving any one version. */

export const MONITORING_SCHEMA = `
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
CREATE INDEX IF NOT EXISTS monitor_address_type_raw ON monitor_address_type(address);`;

/** R41: this module's tables, as record-core's purge declaration names them. */
export const MONITORING_TABLES = Object.freeze([
  { name: "monitor_fired", keys: ["subject"] },
  { name: "monitor_tick_epoch", keys: [] },
  { name: "monitor_address_type", keys: [] },
]);

/** Which purge declaration names one of this module's tables (record-core R21). */
export function monitoringOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return MONITORING_TABLES.some((x) => x.name === name);
}

export function migrateMonitoring(sql) {
  const bare = MONITORING_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
