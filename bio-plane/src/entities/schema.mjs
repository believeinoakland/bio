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
  at          TEXT,
  sector      TEXT
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
-- evidentiary, and sits outside the section 8.1 grade; the enforcement is structural. It never resolves a reference;
-- explore may walk it as a hop marked "declared, not evidenced" at the lowest grade (K1487, R47). R8: withdrawn, never
-- deleted.
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
-- R48 (T33-25): both ends indexed WITH the key a page continues from, so one end's relations are read in relation_id
-- order, a page at a time, by an index seek on either end (connection-grammar's neighbours, R47).
CREATE INDEX IF NOT EXISTS entity_relations_from_id ON entity_relations(from_entity, relation_id);
CREATE INDEX IF NOT EXISTS entity_relations_to_id ON entity_relations(to_entity, relation_id);
-- R42 (K1453; T33-25): AN ORGANISATION'S SECTOR, its history. entities.sector holds the current value (an organisation
-- kind's; NULL for every other kind, and for an organisation registered before T33, which reads 'undetermined'); every
-- set or correction appends one row here with the value it replaced, so an earlier value is never erased (R8's pattern).
CREATE TABLE IF NOT EXISTS entity_sectors (
  seq       INTEGER PRIMARY KEY,
  entity_id TEXT NOT NULL,
  sector    TEXT NOT NULL,
  prior     TEXT,
  note      TEXT NOT NULL,
  set_by    TEXT,
  at        TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS entity_sectors_entity ON entity_sectors(entity_id, seq);
-- R43, R44 (B1a.3, A ORG; T33-25): SCHEME IDENTIFIERS. One row per identifier an entity holds in a scheme of the active
-- profiles' identifier_schemes (jurisdictions R52), in the scheme's space and form (id-spaces), compared on its NORMAL
-- form. scope is '' for a profile scheme; for the reserved scheme 'proceeding' (R45) it is the forum's entity id, so a
-- number is taken only within its forum. valid is civil-time's validity value as JSON, or NULL (unstated). basis is
-- the cited source or the system rule (K1443), as text or JSON. Withdrawn, never deleted (R8's pattern). The value
-- index serves R9's identifier tier and R44's lookup.
CREATE TABLE IF NOT EXISTS entity_identifiers (
  entity_id        TEXT NOT NULL,
  scheme           TEXT NOT NULL,
  scope            TEXT NOT NULL DEFAULT '',
  space            TEXT NOT NULL,
  form             TEXT NOT NULL,
  id               TEXT NOT NULL,
  normal           TEXT NOT NULL,
  valid            TEXT,
  basis            TEXT NOT NULL,
  held_by          TEXT,
  at               TEXT NOT NULL,
  withdrawn_by     TEXT,
  withdrawn_at     TEXT,
  withdrawn_reason TEXT,
  PRIMARY KEY (entity_id, scheme, scope, normal)
);
CREATE INDEX IF NOT EXISTS entity_identifiers_value ON entity_identifiers(space, normal);
CREATE INDEX IF NOT EXISTS entity_identifiers_scheme ON entity_identifiers(scheme, scope, normal);
-- R45, R46 (C1, K1452, K1443; T33-25): A PROCEEDING'S FACET, one row per entity of kind 'proceeding': its forum (a
-- registered entity), the forum's kind, the proceeding kind (jurisdictions R51) and its number as the forum writes it,
-- with the normal form the identifier holds. basis_capture and basis_extent (content's canonical extent) name the
-- passage a machine registration read the number from (R46), NULL for a member's own registration. A renumbering is a
-- withdrawal and a new identifier, never an edit of this row. Status as of a date is events', never stored here.
CREATE TABLE IF NOT EXISTS entity_proceedings (
  entity_id     TEXT PRIMARY KEY,
  forum         TEXT NOT NULL,
  forum_kind    TEXT NOT NULL,
  kind          TEXT NOT NULL,
  number        TEXT NOT NULL,
  normal        TEXT NOT NULL,
  basis_capture TEXT,
  basis_extent  TEXT,
  at            TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS entity_proceedings_forum ON entity_proceedings(forum, normal);
-- THE RESOLUTIONS (FW-7): one reading reference matched to one registry entity, with the METHOD declared as the
-- section 8.1 grade. A, B, C are the recogniser's (the reference, its key, its label matched an alias); D is a
-- member's testimony, never the machine's. established is derived from the grade at the write (1 for A and B), so
-- a C can never be read back as established. Keyed (capture_sha, ref, entity_id): a stronger re-resolution RAISES
-- in place (raised_from), never a second row and never a downgrade (R10). Keyed to its bundle, so the per-bundle
-- purge clears it too (R30). A stated read contract (R35, N135): capture_sha, bundle_id, ref, entity_id, grade,
-- established (1 exactly when isEstablished holds of grade, R34); so are entities' entity_id and at (N110).
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
-- R38 (N345, DEC-76 item 3): A REPORT THAT A RESOLUTION MATCHED THE WRONG SUBJECT. Appended, never edited: a report
-- moves nothing (the grade, the resolution and every connection stay), it is read beside the resolution it names
-- (capture_sha, ref, entity_id), so a member can re-resolve. source_module/source_id name what raised it (a
-- contradiction candidate) or are both NULL for a member's own report; reported_by is the control plane's stamp (R4).
-- One report per (resolution, reported_by, source): a repeat writes nothing. Keyed to its bundle (R30).
CREATE TABLE IF NOT EXISTS resolution_defects (
  defect_id     INTEGER PRIMARY KEY,
  capture_sha   TEXT NOT NULL,
  bundle_id     TEXT NOT NULL,
  ref           TEXT NOT NULL,
  entity_id     TEXT NOT NULL,
  reason        TEXT NOT NULL,
  source_module TEXT,
  source_id     TEXT,
  reported_by   TEXT,
  at            TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS resolution_defects_key ON resolution_defects(capture_sha, ref, entity_id);
CREATE INDEX IF NOT EXISTS resolution_defects_entity ON resolution_defects(entity_id, at);
CREATE INDEX IF NOT EXISTS resolution_defects_bundle ON resolution_defects(bundle_id);
`;

/* R39 (N351): a machine resolution's matched string, folded (extraction's term fold), so the resolutions resting on
   one withdrawn name are read by an index at a stated bound rather than folded row by row. Added by `migrate` after
   the schema, with its index, and filled once for the rows a store held before it; NULL for testimony (R8). */
export const BASIS_NORM_COLUMN = Object.freeze(["resolutions", "basis_norm"]);
export const BASIS_NORM_INDEX = "CREATE INDEX IF NOT EXISTS resolutions_entity_basis ON resolutions(entity_id, basis_norm)";

/* R42 (T33-25): the sector column a store written before T33 lacks; its organisations read 'undetermined'. */
export const SECTOR_COLUMN = Object.freeze(["entities", "sector"]);

/* R8: the columns a store written before K106 lacks. */
export const WITHDRAWAL_COLUMNS = Object.freeze([
  ["entity_aliases", "withdrawn_by"], ["entity_aliases", "withdrawn_at"], ["entity_aliases", "withdrawn_reason"],
  ["entity_relations", "withdrawn_by"], ["entity_relations", "withdrawn_at"], ["entity_relations", "withdrawn_reason"],
]);
