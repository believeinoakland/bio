/* entities' tables (K4, layers.md ruling 3), moved from `schema.mjs` with their reasons. Created by `migrate`
   (index.mjs) at every boot, idempotently; the withdrawal columns (R8, K106) are added to a store written before them. */
export const ENTITIES_SCHEMA = `
-- THE SUBJECT REGISTRY, which IS the framework's entity axis (FW-6). Built ONCE (D-83): the bias doctrine's
-- subject registry (BIO_Declared_Bias_v0_1.md safeguard 4) and the framework's entity axis
-- (BIO_Content_Framework_v0_10.md section 3, section 13) are the SAME construct. An ENTITY is a thing the case is
-- about which OUTLIVES any document that mentions it; it is RESOLVED across documents, never extracted from one.
-- kind is validated at the write path against the closed union vocabulary (ENTITY_KINDS). entity_id is the
-- allocated key an entry is read BY; declared_by and at record who fixed the entry and when (R4). Instance-scoped:
-- cleared by the whole-store purge only (R30).
CREATE TABLE IF NOT EXISTS entities (
  entity_id   TEXT PRIMARY KEY,
  kind        TEXT NOT NULL,
  label       TEXT NOT NULL,
  note        TEXT,
  declared_by TEXT,
  at          TEXT
);
CREATE INDEX IF NOT EXISTS entities_kind ON entities(kind);
-- ALIASES are FIRST-CLASS and per entity (safeguard 4). The canonical label is also an alias (canonical=1).
-- alias_norm is extraction's term fold, so the alias index and the reading's name terms fold identically. The
-- PRIMARY KEY makes one entity carry a fold once; the same fold may recur across DIFFERENT entities (an ambiguous
-- name), and nothing pretends the ambiguity away. R8 (K106): an alias is WITHDRAWN, never deleted: the three
-- withdrawn_* columns say who withdrew it, when and why, and a withdrawn alias matches nothing new.
CREATE TABLE IF NOT EXISTS entity_aliases (
  entity_id        TEXT NOT NULL,
  alias            TEXT NOT NULL,
  alias_norm       TEXT NOT NULL,
  canonical        INTEGER NOT NULL DEFAULT 0,
  declared_by      TEXT,
  at               TEXT,
  withdrawn_by     TEXT,
  withdrawn_at     TEXT,
  withdrawn_reason TEXT,
  PRIMARY KEY (entity_id, alias_norm)
);
CREATE INDEX IF NOT EXISTS entity_aliases_norm ON entity_aliases(alias_norm);
CREATE INDEX IF NOT EXISTS entity_aliases_entity ON entity_aliases(entity_id);
-- DECLARED RELATIONS: proxy_for, member_of, overlaps (safeguard 4), each justified and cited like a pattern
-- statement. THERE IS DELIBERATELY NO GRADE COLUMN (D-83, R26): a declared relation is CONSTITUTIVE, not
-- evidentiary, and sits outside the section 8.1 grade; the enforcement is structural. R8: withdrawn, never deleted.
CREATE TABLE IF NOT EXISTS entity_relations (
  relation_id      TEXT PRIMARY KEY,
  from_entity      TEXT NOT NULL,
  to_entity        TEXT NOT NULL,
  relation         TEXT NOT NULL,
  justification    TEXT NOT NULL,
  citation         TEXT NOT NULL,
  declared_by      TEXT,
  at               TEXT,
  withdrawn_by     TEXT,
  withdrawn_at     TEXT,
  withdrawn_reason TEXT
);
CREATE INDEX IF NOT EXISTS entity_relations_from ON entity_relations(from_entity);
CREATE INDEX IF NOT EXISTS entity_relations_to ON entity_relations(to_entity);
-- THE RESOLUTIONS (FW-7): one reading reference matched to one registry entity, with the METHOD declared as the
-- section 8.1 grade. A, B, C are the recogniser's (the reference, its key, its label matched an alias); D is a
-- member's testimony, never the machine's. established is derived from the grade at the write (1 for A and B), so
-- a C can never be read back as established. Keyed (capture_sha, ref, entity_id): a stronger re-resolution RAISES
-- in place (raised_from), never a second row and never a downgrade (R10). Keyed to its bundle, so the per-bundle
-- purge clears it too (R30). A stated read contract (the Suggestions): capture_sha, bundle_id, ref, entity_id,
-- grade, established.
CREATE TABLE IF NOT EXISTS resolutions (
  capture_sha  TEXT NOT NULL,
  bundle_id    TEXT NOT NULL,
  ref          TEXT NOT NULL,
  entity_id    TEXT NOT NULL,
  grade        TEXT NOT NULL,
  method       TEXT NOT NULL,
  basis        TEXT,
  established  INTEGER NOT NULL DEFAULT 0,
  raised_from  TEXT,
  resolved_by  TEXT,
  at           TEXT,
  PRIMARY KEY (capture_sha, ref, entity_id)
);
CREATE INDEX IF NOT EXISTS resolutions_entity ON resolutions(entity_id);
-- D-222 (ii) / PL-8: grade as a filter (resolves:C, resolves:>=B), covering with bundle_id; measured 2026-08-07
-- (test/meaning-index-probe.mjs): -41% at 20,000 and 100,000 bundles for resolves:C.
CREATE INDEX IF NOT EXISTS resolutions_grade ON resolutions(grade, bundle_id);
CREATE INDEX IF NOT EXISTS resolutions_capture ON resolutions(capture_sha);
CREATE INDEX IF NOT EXISTS resolutions_bundle ON resolutions(bundle_id);
`;

/* R8: the columns a store written before K106 lacks. */
export const WITHDRAWAL_COLUMNS = Object.freeze([
  ["entity_aliases", "withdrawn_by"], ["entity_aliases", "withdrawn_at"], ["entity_aliases", "withdrawn_reason"],
  ["entity_relations", "withdrawn_by"], ["entity_relations", "withdrawn_at"], ["entity_relations", "withdrawn_reason"],
]);
