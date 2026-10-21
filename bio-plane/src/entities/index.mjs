/* entities (layer 5): the entity axis and the bias doctrine's subject registry, one construct (Framework §13;
   `build/requirements/entities.md`). The registry (R1–R8), the recogniser and testimony (R9–R13), the reverse
   reads (R14–R16), the name lookup (R17–R19), the identifier-space judgement (R20–R25) and the defect report (R38),
   each collection keyed on one entity bounded (R39), reached through
   `entitiesOf(ctx)` (K61); the grade order (R33–R34) and the one `NO_SUCH_ENTITY` answer (R36, `noSuchEntity`) are
   module-level, as are the one `NO_ENTITY` answer (R37, `noEntity`) and, since T48, the one `NOT_A_PROCEEDING` answer
   (R53, `notAProceeding`). R35's read contract is the `entities` and
   `resolutions` columns `schema.mjs` names; the ops map (R40, `entitiesOps`) and the count figures (R41) close it.
   T35 (T35-27): the sector list is jurisdictions' `SECTORS` (R50), and `entitiesOfKind` reads the group's entities of
   one kind (R51); `namingIn` answers R17's candidates for every entity of some kinds over named captures in one read
   (R52). T50 (T50-59): a `body` or `institution` may carry a `forum_kind` (R54), and `aliasesOf` (R55) and `labelsOf`
   (R56) are the in-process reads retrieval and explore make of the registry; R35 now states the `label` column.
   T51 (T51-30): a resolution says how it was matched (`matched_by`, R58) and `resolutionsFor` answers what the document
   names (`names`); `onlyByIdentifier` (R57), `subjectsNamed` (R59) and `similarSubjects` (R60) are the reads the graph,
   Find's subject route and the near-match check make; a naming candidate carries its `page` (R61).
   T51 fix round 3 (C64; DEC-401, DEC-402): an office a member names carries `named_by_member` until an administrator
   confirms it (R63), and `confirmOffice` (`op=officeconfirm`) is that confirm (R64).
   Moved from `store.mjs` (the registry, the recogniser, the name lookup, `idMatch`, their dispatch), the check
   catalogue (C-91, now `checks.mjs`; the shared act rows and the grade list are `record-grammar`'s, read from there)
   and `schema.mjs` (the four tables, now `schema.mjs` here), with the rows this job applied named at their sites.
   It derives no connection: that is `connections`'. */
import { recordOf, perItem } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, GATE_MARK, listenerRefusal, MODULE_ORDER, notAnAdmin } from "../membership/index.mjs";
import { normAlias, labelTerms, noSha } from "../extraction/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { spaces as idSpaces, recognise as recogniseId, parcelStanding, systemOf, judgePair } from "../idspaces.mjs";
import { combine, SECTORS, FORUM_KINDS } from "../../../jurisdictions/index.mjs";
import { word, localize } from "../setup-words/index.mjs";
import { SHARED_ACT_CHECKS } from "../record-grammar/acts.mjs";
import { BASIS_GRADES } from "../record-grammar/grades.mjs";
import { MACHINE_CLASS_PREFIX } from "../record-grammar/actors.mjs";
import { registerOwner, BOUNDS, DECLARED_LABEL, LOWEST_GRADE } from "../connection-grammar/index.mjs";
import { validAt, compare as compareTimes, reasonText } from "../civil-time/index.mjs";
import { checkContentExtent, canonicalExtent, describeExtent, CONTENT_EXTENT_DOCUMENT_ONLY } from "../content/index.mjs";
import { ENTITIES_SCHEMA, WITHDRAWAL_COLUMNS, BASIS_NORM_COLUMN, BASIS_NORM_INDEX, SECTOR_COLUMN, FORUM_KIND_COLUMN, MATCHED_BY_COLUMN, MATCHED_BY, OFFICE_MARK_COLUMNS } from "./schema.mjs";
import { IDSPACE_CHECKS, ENTITY_CHECKS, idspaceRefusal } from "./checks.mjs";

export { IDSPACE_CHECKS, ENTITY_CHECKS, ENTITIES_SCHEMA };
export { WORD_KEYS } from "./words.mjs";
/* R58 (T51): the five ways a resolution's grade is reached, `schema.mjs`' list. */
export { MATCHED_BY };
/* R50 (K1902 (2)): the one sector list is `jurisdictions`' `SECTORS` (its R64); this module holds no copy and exports
   that same frozen list, so a reader of either name reads one list. */
export { SECTORS };
/* R54 (T50): the forum kinds are `jurisdictions`' `FORUM_KINDS` (its R51, R94), the one list; this module holds no copy. */
export { FORUM_KINDS };

/* R7 (REC-35, N13): the closed kind vocabulary, the UNION of safeguard 4's four SUBJECT kinds and the framework's
   entity kinds (D-83 reconciles the two doctrines this one axis serves), with `program`, `place` and `proceeding`
   (K1441, T33-25). Introducing a kind is a doctrine change, not a write. `affordances` publishes these arrays and
   re-exports them from here (N13). */
export const ENTITY_KINDS = Object.freeze(["source", "institution", "office", "movement",
  "person", "body", "ordinance", "parcel", "contract", "fund", "program", "place", "proceeding"]);
/* The three DECLARED-relation predicates safeguard 4 names, and only these. */
export const RELATION_KINDS = Object.freeze(["proxy_for", "member_of", "overlaps"]);
/* R42 (K1453): the organisation kinds, which carry a sector ("organisations of every kind"; an office is a post, not an
   organisation); the closed sector list is jurisdictions' (R50). An organisation whose sector nobody has stated reads
   `undetermined`. */
export const ORGANISATION_KINDS = Object.freeze(["institution", "body", "movement"]);
export const SECTOR_UNDETERMINED = "undetermined";
/* R45: the reserved scheme a proceeding's number is held under, in the profile `proceeding` space, scoped by its forum. */
export const PROCEEDING_SCHEME = "proceeding";
/* R47 (K1487, K1486): this module as a connection owner of its three declared kinds. Until the design stream gives the
   members' words, each kind's word is the relation's own name (the requirements' Suggestions, T33). */
export const CONNECTION_OWNER = "entities";
export const CONNECTION_KINDS = Object.freeze(RELATION_KINDS.map((kind) =>
  Object.freeze({ kind, word: kind.replace(/_/g, " "), class: "declared" })));
/* R47 (N560, K1563 (2); connection-grammar R9): what this owner declares to the conformance battery. Its kinds are
   undated (a relation holds no dates, so none is in or out at a date) and group-wide (the registry is the group's, C6,
   K1489, so no item is fenced from one member); the battery answers those two checks `inapplicable`, never failed. */
export const CONNECTION_DECLARES = Object.freeze({ undated: true, group_wide: true });

/* R33 (REC-51, K76 (3), K147): the grade rank DERIVED from the catalogue's own strongest-first order, never
   restated; a higher number is a stronger grade, and a value that is no grade has no rank. Read by `connections`,
   `progressions`, `bias` and the earned-basis registry. */
export const gradeRank = Object.freeze(Object.fromEntries(BASIS_GRADES.map((g, i) => [g, BASIS_GRADES.length - i])));
/* R34: established is a PROPERTY OF THE GRADE (R10, R27): A and B rest on a captured identifier at both ends; C is
   correspondence awaiting a member's confirmation; D is bare testimony. */
export const isEstablished = (grade) => grade === "A" || grade === "B";

/* REC-60 / D-225: the meaning-layer bound (R14, R15). Neither figure is new: 500 is `op=readingname`'s ceiling and
   the query language's LIMIT_MAX, 5000 is `op=list`'s. No cursor is minted (REC-55): a cut caller raises `limit`. */
export const MEANING_LIMIT_DEFAULT = 500;
export const MEANING_LIMIT_MAX = 5000;
/* R17 (REC-57): the name lookup's bound. */
export const NAMING_LIMIT_DEFAULT = 100;
export const NAMING_LIMIT_MAX = 500;
/* R52 (K1972): the captures one `namingIn` looks in, at most, and its page of candidates by default. */
export const NAMING_IN_CAPTURES_MAX = 200;
export const NAMING_IN_LIMIT_DEFAULT = 200;
/* R51 (N699, K1881): the page of the group's entities of one kind. */
export const KIND_LIMIT_DEFAULT = 100;
export const KIND_LIMIT_MAX = 500;
/* R54 (T50; N1190): the entity kinds that may carry a forum kind, a court, commission, grand jury or auditor being a body
   or an institution. */
export const FORUM_ENTITY_KINDS = Object.freeze(["body", "institution"]);
/* R55 (T50; N1193): the page of standing aliases `aliasesOf` answers. */
export const ALIASES_LIMIT_DEFAULT = 1000;
export const ALIASES_LIMIT_MAX = 5000;
/* R56 (T50; N1086): the most entity ids one `labelsOf` is asked for. */
export const LABELS_IDS_MAX = 500;
/* R57 (T51; N1207): the most entity ids one `onlyByIdentifier` is asked for. */
export const ONLY_BY_IDENTIFIER_IDS_MAX = 500;
/* R59 (T51; DEC-330 A15): the page of subjects Find's subject route answers. */
export const SUBJECTS_LIMIT_DEFAULT = 50;
export const SUBJECTS_LIMIT_MAX = 200;
/* R60 (T51; DEC-330 A51): the page of near matches, and the fewest characters a fold has for a spelling difference to count. */
export const SIMILAR_LIMIT_DEFAULT = 10;
export const SIMILAR_LIMIT_MAX = 50;
export const SIMILAR_SPELLING_MIN = 6;
/* R22: the most addresses read per capture to judge its system. */
export const IDMATCH_ADDRESS_LIMIT = 32;
/* R8: a withdrawal's stated reason, at most. */
export const WITHDRAW_REASON_MAX = 2000;
/* R39 (N351, K477): the bound on each collection keyed on one entity that R5 and R8's alias withdrawal answer (its
   aliases, its relations, its defect reports, the resolutions resting on a withdrawn name), and on one resolution's
   reports (R38). Meaning-bounds' default, not a new figure; `truncated` is measured by reading one past. */
export const ENTITY_COLLECTION_LIMIT = 500;
/* R39 (K433, K485): an entity's relations are bounded higher, at the walk bound `intent`'s R4 reads through R5. */
export const ENTITY_RELATIONS_LIMIT = 1000;
/* R38: a defect report's reason, at most. */
export const DEFECT_REASON_MAX = 2000;

/* R30 (K23), R49: the tables this module owns. The registry is instance-scoped (whole-store purge only); resolutions and
   their defect reports are keyed to their bundle by `bundle_id`. */
export const REGISTRY_TABLES = Object.freeze(["entity_sectors", "entity_identifiers", "entity_proceedings",
  "entity_relations", "entity_aliases", "entities"]);
export const ENTITIES_TABLES = Object.freeze(["resolution_defects", "resolutions", ...REGISTRY_TABLES]);
/* R49 (plan T33, Rules (6); DEC-112, B0.13): every table declared explicitly through `record-core.declareTable` (its
   R21). The registry is group-wide (C6, K1489) and exported (B0.13), cleared by the whole-store purge only (R30, `keys:
   []`); a sector change appends to its history and never overwrites it. The resolutions and their reports are keyed to
   their bundle, with the classes `declarePurge`'s default form gives them. */
export const TABLE_DECLARATIONS = Object.freeze([
  ...["resolution_defects", "resolutions"].map((name) => Object.freeze({ name, purge: "clear", expunge: "none",
    export: "admin-only", sight: "bundle", derive: "stored", version_chain: false })),
  ...REGISTRY_TABLES.map((name) => Object.freeze({ name, keys: Object.freeze([]), purge: "clear", expunge: "none",
    export: "yes", sight: "group", derive: "stored", version_chain: name === "entity_sectors" })),
]);

/* R11 (C-75): the set form's identity groups, as `affordances`' `resolve` set act states them. */
const RESOLVE_ITEM_KEYS = [["captureSha"], ["captureSha", "ref"]];
const RESOLVE_SHARED_KEYS = ["ref"];

/* R36 (N208, K231, K275): THE ONE ANSWER TO ONE CONDITION, no entity with the id `entityId` is registered (R7's `has`
   is false). Every act of any module that answers that condition answers through here (this module's R2, R3, R12 and
   R17, progressions' R6 and R14, intent), so `NO_SUCH_ENTITY` is minted at one site and its one row is this module's
   (C-91.4). The detail is one fixed sentence, the same for every caller. `extra` adds a caller's own fields (such as
   `end` for R3) beside these and never replaces one of them. Writes nothing and never throws. */
const NO_SUCH_ENTITY_DETAIL = "no entity with that id is registered in the subject registry; an entity is registered "
  + "with op=entitycreate before anything can name it";
const NO_SUCH_ENTITY_FIXED = new Set(["ok", "reason", "code", "check", "translation", "entity_id", "detail"]);

export function noSuchEntity(entityId, extra = null) {
  let own = [];
  try {
    if (extra && typeof extra === "object" && !Array.isArray(extra))
      own = Object.entries(extra).filter(([k]) => !NO_SUCH_ENTITY_FIXED.has(k));
  } catch { own = []; }
  /* DEC-49 REGION is-entity-registered */
  const row = ENTITY_CHECKS.NO_SUCH_ENTITY;
  return { ok: false, reason: "NO_SUCH_ENTITY", code: "NO_SUCH_ENTITY", check: row.check,
           translation: row.translation, entity_id: entityId ?? null, ...Object.fromEntries(own),
           detail: NO_SUCH_ENTITY_DETAIL };
  /* END DEC-49 REGION is-entity-registered */
}

/* R37 (N285, K275, K343): THE ONE ANSWER TO ONE CONDITION, a request names no entity id (absent, not a string, or
   empty). Every act of any module that answers that condition answers through here (this module's R2, R5, R12, R15,
   R17 and alias withdrawal, connections' R1, progressions' R6, R9, R14 and R15), so `NO_ENTITY` is minted at one site
   and its one row is this module's (C-91.5). `detail` is the caller's sentence naming what the id was for, else the
   fixed default. Writes nothing and never throws. */
export const NO_ENTITY_DETAIL = "this request is about one registered subject, named by its entity id, and none was named";

export function noEntity(detail = null) {
  /* DEC-49 REGION is-entity-named */
  const row = ENTITY_CHECKS.NO_ENTITY;
  return { ok: false, reason: "NO_ENTITY", code: "NO_ENTITY", check: row.check, translation: row.translation,
           detail: typeof detail === "string" && detail.trim() ? detail : NO_ENTITY_DETAIL };
  /* END DEC-49 REGION is-entity-named */
}

/* R53 (T48; K231, K275, K3207): THE ONE ANSWER TO ONE CONDITION, an entity is registered but is not of kind `proceeding`.
   Every act of any module that refuses a non-proceeding answers through here (events' R34, lines' R13, actions' R65,
   following's R29), so `NOT_A_PROCEEDING` is minted at one site and its one row is this module's (C-91.9). `detail` is
   the caller's sentence naming what was asked of a proceeding, else the fixed default; `extra` adds a caller's own
   fields (such as `entity_id` or `kind`) beside these and never replaces one of them (R36's rule). Writes nothing and
   never throws. */
export const NOT_A_PROCEEDING_DETAIL = "this is asked of an entity of kind proceeding, and the entity named is of another kind";
const NOT_A_PROCEEDING_FIXED = new Set(["ok", "reason", "code", "check", "translation", "detail"]);

export function notAProceeding(detail = null, extra = null) {
  let own = [];
  try {
    if (extra && typeof extra === "object" && !Array.isArray(extra))
      own = Object.entries(extra).filter(([k]) => !NOT_A_PROCEEDING_FIXED.has(k));
  } catch { own = []; }
  /* DEC-49 REGION is-proceeding-kind */
  const row = ENTITY_CHECKS.NOT_A_PROCEEDING;
  return { ok: false, reason: "NOT_A_PROCEEDING", code: "NOT_A_PROCEEDING", check: row.check,
           translation: row.translation, ...Object.fromEntries(own),
           detail: typeof detail === "string" && detail.trim() ? detail : NOT_A_PROCEEDING_DETAIL };
  /* END DEC-49 REGION is-proceeding-kind */
}

/* R2, R60 (REC-64/C-33.25): THE ONE ANSWER TO ONE CONDITION, a name that folds to nothing, so `NO_ALIAS` is minted at one
   site, this module's own row. `detail` is the caller's sentence. Writes nothing and never throws. */
function noAlias(detail) {
  /* DEC-49 REGION is-alias-named — REC-64/C-33.25, this module's row; N126: the whole refusal. */
  const row = ENTITY_CHECKS.NO_ALIAS;
  return { ok: false, reason: "NO_ALIAS", code: "NO_ALIAS", check: row.check, translation: row.translation, detail };
  /* END DEC-49 REGION is-alias-named */
}

/* The label as kept (R1): trimmed, whitespace collapsed, at most 200 characters. */
const cleanLabel = (s) => String(s ?? "").trim().replace(/\s+/g, " ").slice(0, 200);

/* R42: the two sector refusals, each writing nothing. */
const notAnOrganisation = (kind) => ({ ok: false, reason: "NOT_AN_ORGANISATION", kind,
  detail: localize("entities.index.a_sector_is_held_only", "a sector is held only by an organisation ({ORGANISATION_KINDS}); a {kind} carries none. Nothing was written.", { ORGANISATION_KINDS: String(ORGANISATION_KINDS.join(", ")), kind: String(kind) }) });
const unknownSector = (sector) => ({ ok: false, reason: "UNKNOWN_SECTOR", sector: typeof sector === "string" ? sector.slice(0, 80) : null,
  sectors: [...SECTORS], detail: localize("entities.index.a_sector_is_one_of", "a sector is one of {SECTORS}. Nothing was written.", { SECTORS: String(SECTORS.join(", ")) }) });

/* R54: the two forum-kind refusals, each answered before an id is allocated and writing nothing. */
const forumKindNotForKind = (kind) => ({ ok: false, reason: "FORUM_KIND_NOT_FOR_KIND", kind,
  detail: localize("entities.index.a_forum_kind_is_held", "a forum kind is held only by an entity of kind {FORUM_ENTITY_KINDS}; a {kind} carries none. Nothing was written.", { FORUM_ENTITY_KINDS: String(FORUM_ENTITY_KINDS.join(" or ")), kind: String(kind) }) });
const unknownForumKind = (value) => ({ ok: false, reason: "UNKNOWN_FORUM_KIND", forum_kind: typeof value === "string" ? value.slice(0, 80) : null,
  forum_kinds: [...FORUM_KINDS], detail: localize("entities.index.a_forum_kind_is_one", "a forum kind is one of {FORUM_KINDS}. Nothing was written.", { FORUM_KINDS: String(FORUM_KINDS.join(", ")) }) });

/* R43: civil-time's validity value, judged as that module reads it: an object stating `from` and `to` (null is "not
   stated") and a precision of its four, whose bounds civil-time can read (a probe that refuses or throws is not one). */
const PRECISIONS = Object.freeze(["day", "minute", "second", "edtf"]);
function validityError(valid, view) {
  if (valid === null || typeof valid !== "object" || Array.isArray(valid)) return "a validity is {from, to, precision, zone}";
  if (!("from" in valid) || !("to" in valid)) return "a validity states both from and to (null where a bound is not stated)";
  if (!PRECISIONS.includes(valid.precision)) return `a validity's precision is one of ${PRECISIONS.join(", ")}`;
  if (valid.zone !== undefined && valid.zone !== null && typeof valid.zone !== "string") return "a validity's zone is an IANA name";
  let probe;
  try { probe = validAt({ valid }, "2000-01-01T00:00:00Z", { view }); } catch (e) { return String(e && e.message || e); }
  return probe && typeof probe === "object" && probe.refused ? `${probe.refused}: ${probe.why}` : null;
}
/* R43: whether two validities may overlap. Unstated (null) on either side, an open bound, a bound given by an event, or
   a comparison civil-time leaves undetermined all overlap: only one validity ending wholly before the other starts is
   apart. */
function validitiesOverlap(a, b, zone) {
  if (!a || !b) return true;
  const at = (v, end) => (typeof v[end] === "string" ? { value: v[end], precision: v.precision || "day", zone: v.zone || zone } : null);
  const before = (x, y) => { if (!x || !y || !x.zone || !y.zone) return false; try { return compareTimes(x, y) === "before"; } catch { return false; } };
  return !(before(at(a, "to"), at(b, "from")) || before(at(b, "to"), at(a, "from")));
}
/* R43, R45: an identifier that has the shape of no form of its scheme's space (id-spaces), naming the field. */
function identifierNotInSpace(view, sch, field) {
  const S = idSpaces(view).find((x) => x.space === sch.space);
  const forms = S ? S.forms.map((f) => f.form).filter((f) => !sch.form || f === sch.form) : [];
  return { ok: false, reason: "IDENTIFIER_NOT_IN_SPACE", field, scheme: sch.scheme, space: sch.space, forms,
           detail: localize("entities.index.the_field_has_the_shape", "the {field} has the shape of no form of the {v1} space{v2}{v3}. Nothing was written.", { field: String(field), v1: String(S ? S.label : sch.space), v2: String(sch.form ? localize("entities.index.the_scheme_names_form", " the scheme names ({form})", { form: String(sch.form) }) : ""), v3: String(forms.length ? "" : "; your team's active jurisdiction profiles give it no form") }) };
}
/* R43, R45: another entity holds the scheme identifier with a validity that overlaps or is unstated. */
const identifierTaken = (scheme, normal, holder) => ({ ok: false, reason: "IDENTIFIER_TAKEN", scheme, normal, holder,
  detail: localize("entities.index.holder_already_holds_scheme_normal", "{holder} already holds {scheme} {normal} with a validity that overlaps or is unstated. Nothing was written.", { holder: String(holder), scheme: String(scheme), normal: String(normal) }) });
/* R44: one held identifier as it is read. */
const identifierView = (r) => ({ scheme: r.scheme, ...(r.scope ? { forum: r.scope } : {}), space: r.space, form: r.form, id: r.id,
  normal: r.normal, valid: parseJson(r.valid), basis: parseJson(r.basis), by: r.held_by, at: r.at,
  withdrawn: r.withdrawn_at ? { by: r.withdrawn_by, at: r.withdrawn_at, reason: r.withdrawn_reason } : null });
/* R45, R46: a proceeding's facet as it is read, with the passage a registration read its number from. */
const proceedingView = (p) => ({ forum: p.forum, forum_kind: p.forum_kind, number: p.number, kind: p.kind,
  basis: p.basis_capture ? { capture_sha: p.basis_capture, extent: parseJson(p.basis_extent) } : null });
/* The view's time zone, or null (jurisdictions R41). */
const viewZone = (view) => (view && view.time_zone && typeof view.time_zone.value === "string" ? view.time_zone.value : null);
const parseJson = (s) => { if (s == null) return null; try { return JSON.parse(s); } catch { return s; } };
const isMachine = (by) => typeof by === "string" && by.startsWith(MACHINE_CLASS_PREFIX);

/* D-484: the governed site for an act that rests on nothing (C-33.40) or names no source (C-33.41): record-grammar's
   shared act rows (`SHARED_ACT_CHECKS`, K765), never a second sentence. C-33.25 (no alias) is this module's own row
   (`ENTITY_CHECKS`). */
function actShapeRefusal(code, detail, extra = {}) {
  const row = SHARED_ACT_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`entities: ${code} has no SHARED_ACT_CHECKS row with a canned translation (DEC-49)`);
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...extra };
}

/* REC-40 / REC-77: HOW a registered name corresponded (R17) — which of the reading's three strings carried it, and
   whether it was the WHOLE of that string. A description, never a grade: the grade comes from the recogniser. The
   rank follows the recogniser's tier order, and the two partials share one band ordered by measured selectivity. */
const CORRESPONDENCE = {
  ref:   { whole: "reference",     part: "name_in_reference" },
  key:   { whole: "reference_key", part: "name_in_reference" },
  label: { whole: "name",          part: "name_in_label" },
};
const CORRESPONDENCE_RANK = ["reference", "reference_key", "name", "name_in_reference", "name_in_label"];
const PARTIAL = new Set(Object.values(CORRESPONDENCE).map((s) => s.part));
const PARTIAL_BAND = CORRESPONDENCE_RANK.filter((c) => !PARTIAL.has(c)).length;
/* REC-77: THE ONE ORDERING, for the per-reference merge and the final sort alike; a partial with no selectivity (a
   corpus of one) sorts as the least selective of its band, never promoted on a number that does not exist. */
function candOrderCmp(x, y) {
  const band = (c) => (PARTIAL.has(c.correspondence) ? PARTIAL_BAND : CORRESPONDENCE_RANK.indexOf(c.correspondence));
  const sel = (c) => (c.selectivity && c.selectivity.value != null ? c.selectivity.value : -1);
  const b = band(x) - band(y);
  if (b) return b;
  return band(x) === PARTIAL_BAND ? sel(y) - sel(x) : 0;
}
/* REC-77: a partial match is evidence about THIS reference only in so far as it does not hold of every reference on
   offer. `corpus > 1` is not a threshold: with one reference selectivity is undefined, and undefined never withholds. */
const isUninformative = (reach, corpus) => corpus > 1 && reach >= corpus;

/* REC-40: THE ONE STATEMENT the name lookup runs, over extraction's reading tables (`reading_ref_terms`,
   `reading_refs`, `readings`). Grouped by (capture, ref, SRC): the HAVING is a subset test, so a name is never
   satisfied by one word of the label and one of the reference. `term IN (...)` with a HAVING count, not INTERSECT
   (D-36: a compound SELECT meets an undocumented ceiling near five arms in workerd). `namingPlan` explains THIS text. */
function refTermsSql(nTerms, gateSql) {
  return `SELECT t.capture_sha, t.ref, t.src, t.bundle_id, rr.ref_kind, rr.ref_key, rr.label, r.content_type, rr.pos_kind, rr.pos
            FROM reading_ref_terms t
            JOIN reading_refs rr ON rr.capture_sha = t.capture_sha AND rr.ref = t.ref AND rr.seq = 0
            LEFT JOIN readings r ON r.capture_sha = t.capture_sha
           WHERE t.term IN (${new Array(nTerms).fill("?").join(",")}) AND (${gateSql})
           GROUP BY t.capture_sha, t.ref, t.src
          HAVING COUNT(DISTINCT t.term) = ?
           ORDER BY t.bundle_id, t.capture_sha, t.ref, t.src
           LIMIT ?`;
}
/* R61 (T51; N1236): the page a reader sees (the first page 1) on which a reference sits, from its first place's position
   (`extraction`'s `reading_refs` `pos_kind` and `pos`: a pdf page is held as an index from 0); null where the reading
   cannot say, never the whole document and never guessed. */
function pageOf(posKind, pos) {
  if (posKind !== "pdf-page" || typeof pos !== "string") return null;
  try { const p = JSON.parse(pos).page; return Number.isInteger(p) && p >= 0 ? p + 1 : null; } catch { return null; }
}
/* R60 (T51): whether two folds differ by one inserted, deleted or replaced character, or one swap of adjacent characters. */
function oneEdit(a, b) {
  if (a === b || Math.abs(a.length - b.length) > 1) return false;
  if (a.length === b.length) {
    const at = []; for (let i = 0; i < a.length && at.length < 3; i++) if (a[i] !== b[i]) at.push(i);
    return at.length === 1 || (at.length === 2 && at[1] === at[0] + 1 && a[at[0]] === b[at[1]] && a[at[1]] === b[at[0]]);
  }
  const [s, l] = a.length < b.length ? [a, b] : [b, a];
  let i = 0; while (i < s.length && s[i] === l[i]) i++;
  return s.slice(i) === l.slice(i + 1);
}
/* R60: the closeness of one name to another by their folds: `same`, `contains` or `spelling`, else null. */
const CLOSENESS = Object.freeze(["same", "contains", "spelling"]);
function closeness(nameFold, nameTerms, otherFold, otherTerms) {
  if (!nameFold || !otherFold) return null;
  if (nameFold === otherFold) return "same";
  const [short, long] = nameTerms.length <= otherTerms.length ? [nameTerms, otherTerms] : [otherTerms, nameTerms];
  if (short.length >= 2 && short.every((t) => long.includes(t))) return "contains";
  if (nameFold.length >= SIMILAR_SPELLING_MIN && otherFold.length >= SIMILAR_SPELLING_MIN && oneEdit(nameFold, otherFold)) return "spelling";
  return null;
}

/* REC-77: how many references an alias reaches per source — the lookup itself wrapped and counted, never a twin. */
const refReachSql = (nTerms, gateSql) => `SELECT src, COUNT(*) AS n FROM (${refTermsSql(nTerms, gateSql)}) GROUP BY src`;

const instances = new WeakMap();

/** K61: the one Entities for this object's storage. `opts` is read on the first call only: `record`
 *  (`recordOf(ctx)`), `membership` (`membershipOf(ctx)`), `provenance` (`provenanceOf(ctx)`, reached on first use),
 *  `now` (a clock). A test may pass its own. */
export function entitiesOf(ctx, opts = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let e = instances.get(storage);
  if (!e) {
    const record = opts.record ?? recordOf(ctx);
    e = new Entities(storage, { ...opts, record, membership: opts.membership ?? membershipOf(ctx, { record }),
                                provenance: opts.provenance ?? (() => provenanceOf(ctx)) });
    instances.set(storage, e);
    registerFigures(e, record);
    opened = opened === null ? e : AMBIGUOUS;
  }
  return e;
}

/* R47 (B1a.3, K1487; connection-grammar R2, R6; K1563 (1)): this module registers ONCE, at load, in the plane's default
   owner registry, as the owner of its three declared kinds. The registry is process-wide, so the read takes the
   optional `host` the registry passes through unchanged (explore passes it) and answers from that host's instance;
   without one, from the isolate's one instance; with none open, or more than one, it is refused
   `OWNER_HOST_AMBIGUOUS`, never answered from a guess. `OWNER_REGISTRATION` is the registry's answer. */
const AMBIGUOUS = Symbol(word("entities.symbol.text"));
let opened = null;
export const OWNER_REGISTRATION = registerOwner({ owner: CONNECTION_OWNER, kinds: CONNECTION_KINDS.map((k) => ({ ...k })),
  neighbours: ({ host = null, ...a } = {}) => {
    const e = host ? entitiesOf(host) : opened instanceof Entities ? opened : null;
    return e ? e.neighbours(a) : { refused: "OWNER_HOST_AMBIGUOUS", why: opened === AMBIGUOUS
      ? "more than one subject registry is open in this process and the read names no host, so which one is meant is not settled"
      : "no subject registry is open in this process and the read names no host" };
  } });

/** R41: this module's figures for `op=stats` and purge's proof, registered with record-core's `registerCounts` (its
 *  R63) once per storage, when the instance is first made. A record with no seam (a test's stand-in) is left alone; a
 *  refusal (another module reporting one of these figures, or entities registering twice) is a defect of the wiring
 *  and throws. */
function registerFigures(e, record) {
  if (!record || typeof record.registerCounts !== "function") return;
  const answer = record.registerCounts("entities", [...Entities.COUNT_KEYS], (hid) => e.counts(hid));
  if (answer && answer.ok === false)
    throw new Error(`entities: record-core refused its figures: ${answer.reason}${answer.heldBy ? ` (held by ${answer.heldBy})` : ""}`);
}

export class Entities {
  #sql; #storage; #record; #membership; #provenance; #now;
  #onResolved = []; #onAttempt = []; #declared = false;

  constructor(storage, { record, membership = null, provenance = null, now = null } = {}) {
    this.#storage = storage;
    this.#sql = storage.sql;
    this.#record = record;
    this.#membership = membership;
    this.#provenance = provenance;
    this.#now = typeof now === "function" ? now : () => new Date().toISOString();
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }
  #cols(t) { return this.#rows(`PRAGMA table_info(${t})`).map((r) => r.name); }
  #prov() { return typeof this.#provenance === "function" ? (this.#provenance = this.#provenance()) : this.#provenance; }

  /* ---- boot (K4) ---- */

  /** This module's tables at every boot, idempotent: the schema, R8's withdrawal columns on a store written before
   *  them, and the purge declaration (R30) once. */
  migrate() {
    const bare = ENTITIES_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const st of bare.split(";")) { const t = st.trim(); if (t) this.#sql.exec(t); }
    for (const [table, column] of [...WITHDRAWAL_COLUMNS, SECTOR_COLUMN, FORUM_KIND_COLUMN])
      if (!this.#cols(table).includes(column)) this.#sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} TEXT`);
    /* R63, R64: the office mark, absent from a store written before it (those offices read unmarked). */
    for (const [table, column, type] of OFFICE_MARK_COLUMNS)
      if (!this.#cols(table).includes(column)) this.#sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    /* R39: the folded basis, filled once for the machine resolutions of a store written before it. */
    const [bt, bc] = BASIS_NORM_COLUMN;
    if (!this.#cols(bt).includes(bc)) {
      this.#sql.exec(`ALTER TABLE ${bt} ADD COLUMN ${bc} TEXT`);
      for (const r of this.#rows(`SELECT capture_sha, ref, entity_id, basis FROM resolutions WHERE grade <> 'D' AND basis IS NOT NULL`))
        this.#sql.exec(`UPDATE resolutions SET basis_norm=? WHERE capture_sha=? AND ref=? AND entity_id=?`,
                       normAlias(r.basis) || null, r.capture_sha, r.ref, r.entity_id);
    }
    this.#sql.exec(BASIS_NORM_INDEX);
    /* R58: how each resolution was matched, filled once for a store written before it from the tier its method sentence
       names (the sentences `recogniseTier`, `#identifierHits` and `testify` write); a sentence of none of them stays null. */
    const [mt, mc] = MATCHED_BY_COLUMN;
    if (!this.#cols(mt).includes(mc)) {
      this.#sql.exec(`ALTER TABLE ${mt} ADD COLUMN ${mc} TEXT`);
      this.#sql.exec(`UPDATE ${mt} SET ${mc} = CASE
          WHEN method LIKE 'scheme identifier --%' THEN 'identifier'
          WHEN method LIKE 'source identifier in content --%' THEN 'reference_key'
          WHEN method LIKE 'source identifier --%' THEN 'reference'
          WHEN method LIKE 'correspondence --%' THEN 'label'
          WHEN method LIKE 'testimony --%' THEN 'testimony' END`);
    }
    this.declareTables();
  }

  /** R49, R30 (K23, record-core R21/R46): every table declared explicitly with its classes (`TABLE_DECLARATIONS`):
   *  `resolutions` and `resolution_defects` keyed to their bundle; the registry cleared by the whole-store purge only.
   *  Once per instance. */
  declareTables() {
    if (this.#declared) return { ok: true, already: true };
    const r = this.#record.declareTable("entities", TABLE_DECLARATIONS.map((d) => ({ ...d, ...(d.keys ? { keys: [...d.keys] } : {}) })));
    if (r && r.ok) this.#declared = true;
    return r;
  }
  /** The name this module's purge declaration had before R49; the same act. */
  declarePurge() { return this.declareTables(); }

  /* ---- the figures (R41; record-core R63) ---- */

  /** R41: the figures `registerCounts` asks for, in this order. */
  static COUNT_KEYS = Object.freeze(["entities", "entityAliases", "entityRelations", "resolutions"]);

  /** R41: `entities`, `entityAliases` and `entityRelations` (the registry's rows, none keyed on a bundle, so `hid`
   *  leaves none out) and `resolutions` (keyed on `bundle_id`: with `hid`, `{sql, args}` naming the bundles the caller
   *  may not see, a row whose bundle is in it is left out and a row naming none is counted), as the legacy store's
   *  `#counts` took them. A figure that cannot be read is null, never zero. Synchronous; writes nothing; never throws. */
  counts(hid = null) {
    let gate = null;
    try { if (hid && typeof hid === "object" && typeof hid.sql === "string") gate = { sql: hid.sql, args: Array.isArray(hid.args) ? hid.args : [] }; }
    catch { gate = null; }
    const n = (table, key = null) => {
      try {
        const cond = key && gate ? ` WHERE COALESCE(${key}, '') NOT IN ${gate.sql}` : "";
        const v = Number(this.#one(`SELECT count(*) AS c FROM ${table}${cond}`, ...(cond ? gate.args : [])).c);
        return Number.isFinite(v) ? v : null;
      } catch { return null; }
    };
    return { entities: n("entities"), entityAliases: n("entity_aliases"), entityRelations: n("entity_relations"),
             resolutions: n("resolutions", "bundle_id") };
  }

  /* ---- sight (membership R43; R18, R22, R32) ---- */

  /* The viewer gate compiled into a statement over a QUALIFIED bundle column: a machine sees everything, an absent
     or unrecognised viewer nothing, a member through membership's predicate over record-core's `bundles` (its R37).
     A NULL column names no bundle and passes; one naming a bundle that is gone is withheld (fail closed). */
  #gate(col, viewer) {
    const g = viewerPredicate(viewer);
    if (g.scope === "member") return { sql: `${GATE_MARK} 1=1`, args: [] };
    if (g.scope === "DENY") return { sql: g.sql, args: [] };
    return { sql: `${GATE_MARK} (${col} IS NULL OR EXISTS (SELECT 1 FROM bundles b WHERE b.bundle_id = ${col} AND (${g.sql})))`,
             args: g.args };
  }
  /* The same question of one id: passes a visible id through, `null` for one the viewer may not see. */
  #redactor(viewer) {
    const g = viewerPredicate(viewer);
    if (g.scope === "member") return (id) => id ?? null;
    if (g.scope === "DENY") return (id) => (id ? null : id ?? null);
    const memo = new Map();
    return (id) => {
      if (!id) return id ?? null;
      if (!memo.has(id))
        memo.set(id, this.#membership && typeof this.#membership.inSight === "function"
          ? this.#membership.inSight(id, viewer)
          : !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${g.sql})`, id, ...g.args));
      return memo.get(id) ? id : null;
    };
  }

  /* ===================================================================== *
   * THE REGISTRY (FW-6; R1–R8). An entity is a subject the record is about; it has first-class ALIASES and
   * DECLARED RELATIONS. A declared relation is CONSTITUTIVE, not evidentiary (D-83): it carries a justification
   * and a citation like a pattern statement and NO grade — there is no field to carry one (R26).
   * ===================================================================== */

  /** R1: a registry entry, its canonical label seeded as an alias and every other distinct folded alias attached
   *  in the SAME transaction, so an entity is never nameless-but-for-its-id even for an instant. It carries the
   *  declarer's note (DEC-88): who or what it is and why it is registered. R4: `declaredBy` is the control plane's
   *  stamp. */
  createEntity({ kind, label, note = null, aliases = [], declaredBy = null, sector, proceeding, forum_kind } = {}) {
    return this.#create({ kind, label, note, aliases, declaredBy, sector, proceeding, forumKind: forum_kind, basis: null });
  }

  /* R1, R42, R45, R46: the one creation path; `basis` is R46's `{captureSha, extent}` for a registration read from a
     capture, else null. Every refusal is answered before an id is allocated. */
  #create({ kind, label, note, aliases, declaredBy, sector, proceeding, forumKind, basis }) {
    const k = typeof kind === "string" ? kind.trim().toLowerCase() : "";
    if (!k) return { ok: false, reason: "NO_KIND", detail: localize("entities.index.an_entity_needs_a_kind", "an entity needs a kind: one of {ENTITY_KINDS}", { ENTITY_KINDS: String(ENTITY_KINDS.join(", ")) }) };
    if (!ENTITY_KINDS.includes(k))
      return { ok: false, reason: "UNKNOWN_KIND", kind: k,
        detail: localize("entities.index.the_subject_registry_admits_a", "the subject registry admits a closed kind vocabulary (D-83 reconciles safeguard 4 with the framework's entity axis): one of {ENTITY_KINDS}. Introducing a new kind is a doctrine change, not a write.", { ENTITY_KINDS: String(ENTITY_KINDS.join(", ")) }) };
    /* R45: a proceeding's label is composed from its facet, never a caller's (so never a caption); a label the caller
       gives is kept as one more alias. */
    const isProceeding = k === "proceeding";
    const lab = isProceeding ? "proceeding" : cleanLabel(label);
    /* DEC-49 REGION is-entity-labelled — R1 (N285): the registry's own code and row (C-91.6). */
    if (!lab) {
      const row = ENTITY_CHECKS.ENTITY_NO_LABEL;
      return { ok: false, reason: "ENTITY_NO_LABEL", code: "ENTITY_NO_LABEL", check: row.check, translation: row.translation,
               detail: localize("entities.index.an_entity_needs_a_canonical", "an entity needs a canonical label, such as 'City Clerk'") };
    }
    /* END DEC-49 REGION is-entity-labelled */
    /* DEC-49 REGION is-entity-noted — R1 (DEC-88, K1025): the declarer's note, its own row (C-91.8); asked before the
       transaction, so a refusal allocates no id and writes no entity and no alias. */
    if (typeof note !== "string" || !note.trim()) {
      const row = ENTITY_CHECKS.ENTITY_NO_NOTE;
      return { ok: false, reason: "ENTITY_NO_NOTE", code: "ENTITY_NO_NOTE", check: row.check, translation: row.translation,
               detail: localize("entities.index.an_entity_needs_a_note", "an entity needs a note in the declarer's own words saying who or what it is and why it is registered") };
    }
    /* END DEC-49 REGION is-entity-noted */
    /* R42: a sector only for an organisation kind; absent there, held undetermined, never guessed. */
    const isOrg = ORGANISATION_KINDS.includes(k);
    if (sector !== undefined && sector !== null && !isOrg) return notAnOrganisation(k);
    if (isOrg && sector !== undefined && sector !== null && !SECTORS.includes(sector)) return unknownSector(sector);
    const sec = isOrg ? (sector == null ? SECTOR_UNDETERMINED : sector) : null;
    /* R54: a forum kind only for a body or an institution, one of jurisdictions' list; absent, none is held (never
       guessed, never `other`). */
    const hasForumKind = forumKind !== undefined && forumKind !== null;
    if (hasForumKind && !FORUM_ENTITY_KINDS.includes(k)) return forumKindNotForKind(k);
    if (hasForumKind && !FORUM_KINDS.includes(forumKind)) return unknownForumKind(forumKind);
    const fk = hasForumKind ? forumKind : null;
    /* R45: the facet, judged whole before anything is allocated. */
    let facet = null;
    if (isProceeding) {
      facet = this.#proceedingFacet(proceeding);
      if (!facet.ok) return facet;
    }
    const extra = [...(isProceeding ? [facet.number] : []),
                   ...(isProceeding && typeof label === "string" && cleanLabel(label) ? [label] : []),
                   ...(Array.isArray(aliases) ? aliases : [])];
    const name = isProceeding ? facet.label : lab;
    const at = this.#now();
    const by = declaredBy == null ? null : String(declaredBy);
    /* R63: an office a member who is not an administrator registers is marked until an administrator confirms it; one an
       administrator or a machine registers is not. Which screen may send the act is the door's (`op-grades`), not asked here. */
    const marked = k === "office" ? (by !== null && !isMachine(by) && !this.#administers(by) ? 1 : 0) : null;
    return this.#record.transact(() => {
      const { id } = this.#record.allocId("ENT", at.slice(0, 4));
      this.#sql.exec(`INSERT INTO entities (entity_id,kind,label,note,declared_by,at,sector,forum_kind,named_by_member) VALUES (?,?,?,?,?,?,?,?,?)`,
                     id, k, name, note.slice(0, 2000), by, at, sec, fk, marked);
      const seen = new Set();
      const put = (alias, canonical) => {
        const norm = normAlias(alias);
        if (!norm || seen.has(norm)) return;
        seen.add(norm);
        this.#sql.exec(`INSERT OR IGNORE INTO entity_aliases (entity_id,alias,alias_norm,canonical,declared_by,at)
                        VALUES (?,?,?,?,?,?)`, id, cleanLabel(alias), norm, canonical ? 1 : 0, by, at);
      };
      put(name, true);
      for (const a of extra) put(a, false);
      if (facet) {
        const basisCapture = basis ? basis.captureSha : null, basisExtent = basis ? canonicalExtent(basis.extent) : null;
        this.#sql.exec(`INSERT INTO entity_proceedings (entity_id,forum,forum_kind,kind,number,normal,basis_capture,basis_extent,at)
                        VALUES (?,?,?,?,?,?,?,?,?)`, id, facet.forum, facet.forum_kind, facet.kind, facet.number, facet.normal,
                       basisCapture, basisExtent, at);
        this.#sql.exec(`INSERT INTO entity_identifiers (entity_id,scheme,scope,space,form,id,normal,valid,basis,held_by,at)
                        VALUES (?,?,?,?,?,?,?,?,?,?,?)`, id, PROCEEDING_SCHEME, facet.forum, "proceeding", facet.form,
                       facet.number, facet.normal, null,
                       basis ? JSON.stringify({ capture_sha: basisCapture, extent: JSON.parse(basisExtent) })
                             : localize("entities.index.the_number_number_as_forum", "the number {number} as {forum_label} writes it", { number: String(facet.number), forum_label: String(facet.forum_label) }), by, at);
      }
      const count = this.#one(`SELECT count(*) AS c FROM entity_aliases WHERE entity_id=?`, id).c;
      return { ok: true, entity_id: id, kind: k, label: name, alias_count: Number(count), at,
               ...(isOrg ? { sector: sec } : {}),
               ...(FORUM_ENTITY_KINDS.includes(k) ? { forum_kind: fk } : {}),
               ...(facet ? { proceeding: { forum: facet.forum, forum_kind: facet.forum_kind, number: facet.number, kind: facet.kind } } : {}) };
    });
  }

  /** R2: an alias attached after the fact, exactly as it can be given at creation. The same fold may be held by
   *  different entities; nothing refuses an ambiguous name. A withdrawn alias (R8) still holds its fold on the
   *  entity, so re-adding it answers ALREADY_ALIASED, saying it is withdrawn: nothing is deleted. */
  addAlias({ entityId, alias, declaredBy = null } = {}) {
    if (typeof entityId !== "string" || !entityId)
      return noEntity("an alias is attached to an entity by its id");
    const norm = normAlias(alias);
    if (!norm)
      return noAlias(localize("entities.index.an_alias_needs_a_name", "an alias needs a name: the one given folds to nothing (it is empty, or only whitespace), so there is nothing a document could be matched by. Nothing was written."));
    if (!this.has(entityId)) return noSuchEntity(entityId);
    const dup = this.#one(`SELECT alias, withdrawn_at FROM entity_aliases WHERE entity_id=? AND alias_norm=?`, entityId, norm);
    if (dup) return { ok: false, reason: "ALREADY_ALIASED", entity_id: entityId, alias: dup.alias,
                      ...(dup.withdrawn_at ? { withdrawn: true,
                        detail: localize("entities.index.this_entity_held_that_name", "this entity held that name and it was withdrawn; a withdrawn name stays on the record as withdrawn") } : {}) };
    const at = this.#now();
    this.#sql.exec(`INSERT INTO entity_aliases (entity_id,alias,alias_norm,canonical,declared_by,at) VALUES (?,?,?,?,?,?)`,
                   entityId, cleanLabel(alias), norm, 0, declaredBy == null ? null : String(declaredBy), at);
    return { ok: true, entity_id: entityId, alias: cleanLabel(alias), at };
  }

  /** R3: a CONSTITUTIVE relation between two registered entries, justified AND cited (safeguard 4). No grade
   *  argument and no grade stored (D-83, R26). */
  declareRelation({ fromEntity, toEntity, relation, justification, citation, declaredBy = null } = {}) {
    const rel = typeof relation === "string" ? relation.trim().toLowerCase() : "";
    if (!RELATION_KINDS.includes(rel))
      return { ok: false, reason: "UNKNOWN_RELATION", relation: rel,
        detail: localize("entities.index.a_declared_relation_is_one", "a declared relation is one of {RELATION_KINDS} (safeguard 4). A connection grade is NOT a relation kind: a declared relation is constitutive, not evidentiary, and carries no grade (D-83).", { RELATION_KINDS: String(RELATION_KINDS.join(", ")) }) };
    if (typeof fromEntity !== "string" || !fromEntity || typeof toEntity !== "string" || !toEntity)
      return { ok: false, reason: "NO_ENDS", detail: localize("entities.index.a_relation_names_two_entities", "a relation names two entities by id: fromEntity and toEntity") };
    if (fromEntity === toEntity) return { ok: false, reason: "SELF_RELATION", detail: localize("entities.index.a_relation_is_between_two", "a relation is between two distinct entities") };
    const just = typeof justification === "string" ? justification.trim() : "";
    const cite = typeof citation === "string" ? citation.trim() : "";
    if (!just) return { ok: false, reason: "NO_JUSTIFICATION",
      detail: localize("entities.index.a_declared_relation_carries_a", "a declared relation carries a justification, like a pattern statement (safeguard 4)") };
    if (!cite) return actShapeRefusal("NO_CITATION", localize("entities.index.a_declared_relation_carries_a_2", "a declared relation carries a citation, like a pattern statement (safeguard 4)"));
    if (!this.has(fromEntity)) return noSuchEntity(fromEntity, { end: "from" });
    if (!this.has(toEntity)) return noSuchEntity(toEntity, { end: "to" });
    const at = this.#now();
    const by = declaredBy == null ? null : String(declaredBy);
    return this.#record.transact(() => {
      const { id } = this.#record.allocId("REL", at.slice(0, 4));
      this.#sql.exec(`INSERT INTO entity_relations (relation_id,from_entity,to_entity,relation,justification,citation,declared_by,at)
                      VALUES (?,?,?,?,?,?,?,?)`, id, fromEntity, toEntity, rel, just.slice(0, 4000), cite.slice(0, 2000), by, at);
      return { ok: true, relation_id: id, relation: rel, from_entity: fromEntity, to_entity: toEntity,
               justification: just.slice(0, 4000), citation: cite.slice(0, 2000), declared_by: by, at };
    });
  }

  /** R5: an entry BY KEY, with its aliases (canonical first; each withdrawn one shown as withdrawn, R8) and every
   *  declared relation it is an end of, oldest first, each with its direction and none with a grade. */
  readEntity({ entityId, viewer = null } = {}) {
    if (typeof entityId !== "string" || !entityId)
      return noEntity("an entity is read by its id (op=entity&id=ENT-...)");
    const e = this.#one(`SELECT entity_id, kind, label, note, declared_by, at, sector, forum_kind, named_by_member, confirmed_by, confirmed_at FROM entities WHERE entity_id=?`, entityId);
    if (!e) return { ok: true, found: false, entity_id: entityId, entity: null };
    return { ok: true, found: true, entity: this.#entityView(e, this.#redactor(viewer)) };
  }

  /** R6: every entity holding the alias's fold through a live alias, in id order; an ambiguity is kept, never
   *  resolved. A name that folds to nothing answers `count: 0`. */
  entitiesByAlias({ alias, viewer = null } = {}) {
    const norm = normAlias(alias);
    if (!norm) return { ok: true, alias: typeof alias === "string" ? alias : null, count: 0, entities: [] };
    const hits = this.#rows(
      `SELECT DISTINCT e.entity_id, e.kind, e.label, e.note, e.declared_by, e.at, e.sector, e.forum_kind, e.named_by_member, e.confirmed_by, e.confirmed_at
         FROM entity_aliases a JOIN entities e ON e.entity_id = a.entity_id
        WHERE a.alias_norm=? AND a.withdrawn_at IS NULL ORDER BY e.entity_id`, norm);
    const keep = this.#redactor(viewer);
    return { ok: true, alias, alias_norm: norm, count: hits.length, entities: hits.map((e) => this.#entityView(e, keep)) };
  }

  /** R6: one declared relation by its id; it has a justification and a citation and no grade key (D-83). */
  readRelation({ relationId } = {}) {
    if (typeof relationId !== "string" || !relationId)
      return { ok: false, reason: "NO_RELATION", detail: "a relation is read by its id (op=relation&id=REL-...)" };
    const r = this.#one(`SELECT * FROM entity_relations WHERE relation_id=?`, relationId);
    if (!r) return { ok: true, found: false, relation_id: relationId, relation: null };
    return { ok: true, found: true, relation: this.#relationView(r) };
  }

  /** R7: whether the registry holds the id. */
  has(entityId) {
    return typeof entityId === "string" && !!entityId && !!this.#one(`SELECT 1 AS x FROM entities WHERE entity_id=?`, entityId);
  }
  /** R7: the closed lists `affordances` publishes. */
  kinds() { return [...ENTITY_KINDS]; }
  relationKinds() { return [...RELATION_KINDS]; }

  /** R51 (N699, K1867): the group's registered entities of one kind, a page at a time in `entity_id` order after
   *  `after`, so `setup-page` lists every office the group holds. Refuses `NO_KIND`, `UNKNOWN_KIND` (as R1), then
   *  `VIEWER_MISSING` (as R47). The registry is group-wide (C6, K1489): every viewer `membership.viewerPredicate`
   *  recognises sees every entity of the kind, and one it does not answers none. One indexed read (`entities_kind`),
   *  `truncated` by reading one past. R54 (T50): an optional `forum_kind`, one value or a list of `FORUM_KINDS`, lists
   *  only the entities carrying one of them (a value outside the list is refused `UNKNOWN_FORUM_KIND`, before the viewer
   *  is asked), and each item of an organisation kind answers its own (`null` when none). Writes nothing and never throws. */
  entitiesOfKind({ kind, limit = null, after = null, viewer, forum_kind = null } = {}) {
    try {
      const k = typeof kind === "string" ? kind.trim().toLowerCase() : "";
      if (!k) return { ok: false, reason: "NO_KIND", detail: localize("entities.index.a_kind_is_named_one", "a kind is named: one of {ENTITY_KINDS}. Nothing was read.", { ENTITY_KINDS: String(ENTITY_KINDS.join(", ")) }) };
      if (!ENTITY_KINDS.includes(k))
        return { ok: false, reason: "UNKNOWN_KIND", kind: k.slice(0, 80), kinds: [...ENTITY_KINDS],
                 detail: localize("entities.index.the_subject_registry_admits_a_2", "the subject registry admits a closed kind vocabulary: one of {ENTITY_KINDS}. Nothing was read.", { ENTITY_KINDS: String(ENTITY_KINDS.join(", ")) }) };
      /* R54: an absent filter, or an empty list, is no filter. */
      const wanted = forum_kind === undefined || forum_kind === null ? [] : Array.isArray(forum_kind) ? forum_kind : [forum_kind];
      for (const f of wanted)
        if (!FORUM_KINDS.includes(f)) return unknownForumKind(f);
      const forums = [...new Set(wanted)];
      if (viewer === undefined || viewer === null || viewer === "")
        return { ok: false, reason: "VIEWER_MISSING",
                 detail: word("duties.why.read_names_member") };
      const n = Number(limit);
      const cap = limit == null || limit === "" || !Number.isFinite(n) ? KIND_LIMIT_DEFAULT
        : Math.max(1, Math.min(Math.trunc(n), KIND_LIMIT_MAX));
      const from = typeof after === "string" ? after : "";
      const empty = { ok: true, kind: k, entities: [], count: 0, limit: cap, truncated: false, next: null };
      if (viewerPredicate(viewer).scope === "DENY") return empty;
      const isOrg = ORGANISATION_KINDS.includes(k);
      const rows = this.#rows(`SELECT entity_id, kind, label, note, declared_by, at, sector, forum_kind, named_by_member, confirmed_by FROM entities
                                WHERE kind=? AND entity_id > ?${forums.length ? ` AND forum_kind IN (${forums.map(() => "?").join(",")})` : ""}
                                ORDER BY entity_id LIMIT ?`, k, from, ...forums, cap + 1);
      const truncated = rows.length > cap;
      const page = truncated ? rows.slice(0, cap) : rows;
      const entities = page.map((e) => ({ entity_id: e.entity_id, kind: e.kind, label: e.label, note: e.note,
        ...(isOrg ? { sector: e.sector || SECTOR_UNDETERMINED, forum_kind: e.forum_kind ?? null } : {}),
        ...(k === "office" ? { named_by_member: !!e.named_by_member, confirmed_by: e.confirmed_by ?? null } : {}),
        declared_by: e.declared_by, at: e.at }));
      return { ...empty, entities, count: entities.length, truncated,
               next: truncated ? entities[entities.length - 1].entity_id : null };
    } catch (err) {
      return { ok: false, reason: "UNREADABLE", detail: localize("entities.index.the_registry_could_not_be", "the registry could not be read: {String}", { String: String(String(err && err.message || err).slice(0, 200)) }) };
    }
  }

  /** R55 (T50; N1193; amends R17): the standing (not withdrawn) aliases of the registered entities of the given kinds,
   *  `[{entity_id, kind, label, alias}]` in entity id then alias order (the alias's fold), so `retrieval` has a followed
   *  person's or office's names in one read. `kinds` is one kind or a list, each refused as R51 refuses it (`NO_KIND`,
   *  `UNKNOWN_KIND`). `limit` is clamped to 1-5,000 (default 1,000) and published; `truncated` by reading one past;
   *  `next` is the cursor to pass as `after` (`<entity_id>|<fold>`; a bare entity id continues after that entity). The
   *  registry is group-wide (C6): a viewer `membership` recognises sees every alias, one it does not none. An in-process
   *  read, not an op. Writes nothing and never throws. */
  aliasesOf({ kinds, limit = null, after = null, viewer } = {}) {
    try {
      const want = this.#kindsWanted(kinds);
      if (!Array.isArray(want)) return want;
      const n = Number(limit);
      const cap = limit == null || limit === "" || !Number.isFinite(n) ? ALIASES_LIMIT_DEFAULT
        : Math.max(1, Math.min(Math.trunc(n), ALIASES_LIMIT_MAX));
      const empty = { ok: true, aliases: [], limit: cap, truncated: false, next: null };
      if (viewerPredicate(viewer).scope === "DENY") return empty;
      const cursor = typeof after === "string" ? after : "";
      const bar = cursor.indexOf("|");
      const [afterEntity, afterNorm] = bar === -1 ? [cursor, null] : [cursor.slice(0, bar), cursor.slice(bar + 1)];
      const rows = this.#rows(`SELECT a.entity_id, e.kind, e.label, a.alias, a.alias_norm
                                 FROM entity_aliases a JOIN entities e ON e.entity_id = a.entity_id
                                WHERE e.kind IN (${want.map(() => "?").join(",")}) AND a.withdrawn_at IS NULL
                                  AND (${afterNorm === null ? "a.entity_id > ?" : "a.entity_id > ? OR (a.entity_id = ? AND a.alias_norm > ?)"})
                                ORDER BY a.entity_id, a.alias_norm LIMIT ?`,
                              ...want, ...(afterNorm === null ? [afterEntity] : [afterEntity, afterEntity, afterNorm]), cap + 1);
      const truncated = rows.length > cap;
      const page = truncated ? rows.slice(0, cap) : rows;
      const last = page[page.length - 1];
      return { ...empty, aliases: page.map((r) => ({ entity_id: r.entity_id, kind: r.kind, label: r.label, alias: r.alias })),
               truncated, next: truncated ? `${last.entity_id}|${last.alias_norm}` : null };
    } catch (err) {
      return { ok: false, reason: "UNREADABLE", detail: localize("entities.index.the_registry_could_not_be_2", "the registry could not be read: {String}", { String: String(String(err && err.message || err).slice(0, 200)) }) };
    }
  }

  /* R51, R52, R55: the kinds a read names, one or a list, each refused as R1 refuses a kind; the list as asked, distinct. */
  #kindsWanted(kinds) {
    const ks = Array.isArray(kinds) ? kinds : kinds == null ? [] : [kinds];
    const none = { ok: false, reason: "NO_KIND", detail: localize("entities.index.a_kind_is_named_one_2", "a kind is named: one of {ENTITY_KINDS}. Nothing was read.", { ENTITY_KINDS: String(ENTITY_KINDS.join(", ")) }) };
    if (!ks.length) return none;
    const want = [];
    for (const kind of ks) {
      const k = typeof kind === "string" ? kind.trim().toLowerCase() : "";
      if (!k) return none;
      if (!ENTITY_KINDS.includes(k))
        return { ok: false, reason: "UNKNOWN_KIND", kind: k.slice(0, 80), kinds: [...ENTITY_KINDS],
                 detail: localize("entities.index.the_subject_registry_admits_a_3", "the subject registry admits a closed kind vocabulary: one of {ENTITY_KINDS}. Nothing was read.", { ENTITY_KINDS: String(ENTITY_KINDS.join(", ")) }) };
      if (!want.includes(k)) want.push(k);
    }
    return want;
  }

  /** R56 (T50; N1086; amends R5): the canonical label and kind of each of at most 500 entity ids, in one bounded read:
   *  `labels` maps each id as asked to `{label, kind}`, or `null` for an id no entity holds (or that is not a string).
   *  More than 500 ids are refused `TOO_MANY_IDS`; ids that are not a list, `NO_ENTITY`. A viewer `membership` does not
   *  recognise is answered every one `null`. An in-process read, not an op. Writes nothing and never throws. */
  labelsOf({ ids, viewer } = {}) {
    try {
      if (!Array.isArray(ids)) return noEntity(localize("entities.index.labels_are_read_for_entity", "labels are read for entity ids, a list of them"));
      if (ids.length > LABELS_IDS_MAX)
        return { ok: false, reason: "TOO_MANY_IDS", count: ids.length, max: LABELS_IDS_MAX,
                 detail: localize("entities.index.labels_are_read_for_at", "labels are read for at most {LABELS_IDS_MAX} entity ids at once; {length} were named. Nothing was read.", { LABELS_IDS_MAX: String(LABELS_IDS_MAX), length: String(ids.length) }) };
      const asked = ids.filter((id) => typeof id === "string" && id);
      const found = new Map();
      if (asked.length && viewerPredicate(viewer).scope !== "DENY") {
        const uniq = [...new Set(asked)];
        for (const r of this.#rows(`SELECT entity_id, kind, label FROM entities WHERE entity_id IN (${uniq.map(() => "?").join(",")})`, ...uniq))
          found.set(r.entity_id, { label: r.label, kind: r.kind });
      }
      const labels = Object.fromEntries(ids.filter((id) => typeof id === "string").map((id) => [id, found.get(id) ?? null]));
      return { ok: true, labels, count: Object.keys(labels).length };
    } catch (err) {
      return { ok: false, reason: "UNREADABLE", detail: localize("entities.index.the_registry_could_not_be_3", "the registry could not be read: {String}", { String: String(String(err && err.message || err).slice(0, 200)) }) };
    }
  }

  /** R57 (T51; N1207, K3665, DEC-308 (3); `op=entityidonly`): for at most 500 entity ids, how many documents name each
   *  only by an identifier, `[{entity_id, documents}]`, so the graph's unnamed node draws its sentence with the count. A
   *  capture counts for an entity when the viewer may see it (R32), one of its resolutions to the entity was matched by
   *  `identifier` (R58) and none by `reference`, `reference_key` or `label`; testimony neither counts nor disqualifies, a
   *  resolution held before `matched_by` (null) is neither, and a capture counts once. Reads only the resolutions held.
   *  `NO_ENTITY` for no ids, `TOO_MANY_IDS` beyond 500; a viewer `membership` does not recognise is answered every one 0.
   *  Writes nothing and never throws. */
  onlyByIdentifier({ ids, viewer } = {}) {
    try {
      const asked = Array.isArray(ids) ? [...new Set(ids.filter((id) => typeof id === "string" && id))] : [];
      if (!asked.length) return noEntity(localize("entities.index.the_documents_naming_a_subject", "the documents naming a subject only by an identifier are counted for entity ids, a list of them"));
      if (ids.length > ONLY_BY_IDENTIFIER_IDS_MAX)
        return { ok: false, reason: "TOO_MANY_IDS", count: ids.length, max: ONLY_BY_IDENTIFIER_IDS_MAX,
                 detail: localize("entities.index.documents_are_counted_for_at", "documents are counted for at most {ONLY_BY_IDENTIFIER_IDS_MAX} entity ids at once; {length} were named. Nothing was read.", { ONLY_BY_IDENTIFIER_IDS_MAX: String(ONLY_BY_IDENTIFIER_IDS_MAX), length: String(ids.length) }) };
      const deny = viewerPredicate(viewer).scope === "DENY";
      const g = this.#gate("r.bundle_id", viewer), x = this.#gate("x.bundle_id", viewer);
      const entities = asked.map((entityId) => ({ entity_id: entityId, documents: deny ? 0 : Number(this.#one(
        `SELECT COUNT(DISTINCT r.capture_sha) AS n FROM resolutions r
          WHERE r.entity_id=? AND r.matched_by='identifier' AND (${g.sql})
            AND NOT EXISTS (SELECT 1 FROM resolutions x WHERE x.capture_sha = r.capture_sha AND x.entity_id = r.entity_id
                              AND x.matched_by IN ('reference','reference_key','label') AND (${x.sql}))`,
        entityId, ...g.args, ...x.args).n) }));
      return { ok: true, entities, count: entities.length };
    } catch (err) {
      return { ok: false, reason: "UNREADABLE", detail: localize("entities.index.the_resolutions_could_not_be", "the resolutions could not be read: {String}", { String: String(String(err && err.message || err).slice(0, 200)) }) };
    }
  }

  /** R59 (T51; DEC-330 A15; `op=subjectsnamed`): Find's subjects route, answered apart from the text and passage routes:
   *  the registered entities of the given `kinds` (any kind when none is given) whose label or a standing alias carries every
   *  term of `q` (R17's fold and term bounds), each `{entity_id, kind, label, note, matched, documents}`, `matched` the label
   *  or alias that carried the terms and `documents` the distinct captures the viewer may see resolving to the entity.
   *  `count` is the whole number of subjects matching; the page is `limit` (1-200, default 50) after `after` (the previous
   *  `next`), ordered by label fold then entity id, never ranked. `NO_QUERY` for a `q` that folds to no term; a kind is
   *  refused as R51 refuses it; a viewer `membership` does not recognise answers `count: 0`. The registry is read whole
   *  (it is the group's, a few thousand rows at most) because no index serves a term test over names. Writes nothing and
   *  never throws. */
  subjectsNamed({ q, kinds = null, limit = null, after = null, viewer } = {}) {
    try {
      const terms = typeof q === "string" ? labelTerms(q) : [];
      if (!terms.length) return { ok: false, reason: "NO_QUERY",
        detail: localize("entities.index.a_subject_is_looked_for", "a subject is looked for by words of its name, and the query given folds to none. Nothing was read.") };
      const asked = Array.isArray(kinds) ? kinds : kinds == null || kinds === "" ? [] : [kinds];
      const want = asked.length ? this.#kindsWanted(asked) : [...ENTITY_KINDS];
      if (!Array.isArray(want)) return want;
      const n = Number(limit);
      const cap = limit == null || limit === "" || !Number.isFinite(n) ? SUBJECTS_LIMIT_DEFAULT : Math.max(1, Math.min(Math.trunc(n), SUBJECTS_LIMIT_MAX));
      const empty = { ok: true, q, kinds: want, subjects: [], count: 0, limit: cap, truncated: false, next: null };
      if (viewerPredicate(viewer).scope === "DENY") return empty;
      const carries = (name) => { const have = labelTerms(name); return terms.every((t) => have.includes(t)); };
      const marks = want.map(() => "?").join(",");
      const aliasOf = new Map();
      for (const a of this.#rows(`SELECT a.entity_id, a.alias FROM entity_aliases a JOIN entities e ON e.entity_id = a.entity_id
                                   WHERE e.kind IN (${marks}) AND a.withdrawn_at IS NULL ORDER BY a.entity_id, a.alias_norm`, ...want)) {
        if (!aliasOf.has(a.entity_id)) aliasOf.set(a.entity_id, []);
        aliasOf.get(a.entity_id).push(a.alias);
      }
      const hits = [];
      for (const e of this.#rows(`SELECT entity_id, kind, label, note FROM entities WHERE kind IN (${marks})`, ...want)) {
        const matched = carries(e.label) ? e.label : (aliasOf.get(e.entity_id) || []).find(carries);
        if (matched !== undefined) hits.push({ ...e, matched, fold: normAlias(e.label) });
      }
      hits.sort((x, y) => (x.fold < y.fold ? -1 : x.fold > y.fold ? 1 : x.entity_id < y.entity_id ? -1 : x.entity_id > y.entity_id ? 1 : 0));
      const cursor = typeof after === "string" ? after : "";
      const bar = cursor.lastIndexOf("|");
      const [afterFold, afterId] = bar === -1 ? [cursor, ""] : [cursor.slice(0, bar), cursor.slice(bar + 1)];
      const rest = cursor ? hits.filter((h) => h.fold > afterFold || (h.fold === afterFold && h.entity_id > afterId)) : hits;
      const truncated = rest.length > cap;
      const page = truncated ? rest.slice(0, cap) : rest;
      const g = this.#gate("r.bundle_id", viewer);
      const subjects = page.map((h) => ({ entity_id: h.entity_id, kind: h.kind, label: h.label, note: h.note, matched: h.matched,
        documents: Number(this.#one(`SELECT COUNT(DISTINCT r.capture_sha) AS n FROM resolutions r WHERE r.entity_id=? AND (${g.sql})`,
                                    h.entity_id, ...g.args).n) }));
      const last = page[page.length - 1];
      return { ...empty, subjects, count: hits.length, truncated, next: truncated ? `${last.fold}|${last.entity_id}` : null };
    } catch (err) {
      return { ok: false, reason: "UNREADABLE", detail: localize("entities.index.the_registry_could_not_be_4", "the registry could not be read: {String}", { String: String(String(err && err.message || err).slice(0, 200)) }) };
    }
  }

  /** R60 (T51; DEC-330 A51; `op=entitysimilar`): the near-match check made before `createEntity`: the registered entities
   *  of any kind (`kind` narrows) whose label or a standing alias is close to `name`, each `{entity_id, kind, label, note,
   *  alias, closeness}`, `alias` the name that is close and `closeness` `same` (equal folds), `contains` (the distinct
   *  terms of one name include all those of the other, the shorter having two or more) or `spelling` (folds of six or more
   *  characters one edit apart), a fact and no score. The entity's closest name is the one reported. Ordered `same`,
   *  `contains`, `spelling`, then label fold, then entity id; `limit` 1-50 (default 10), `truncated` by reading one past.
   *  `NO_ALIAS` for a name that folds to nothing (R2's); a kind is refused as R51 refuses it; a viewer `membership` does not
   *  recognise answers none. Refuses nothing else: whether to register is the member's. Writes nothing and never throws. */
  similarSubjects({ name, kind = null, limit = null, viewer } = {}) {
    try {
      const fold = normAlias(name);
      if (!fold) return noAlias(localize("entities.index.a_near_match_is_looked", "a near match is looked for by a name, and the one given folds to nothing (it is empty, or only whitespace). Nothing was read."));
      const want = kind == null || kind === "" ? [...ENTITY_KINDS] : this.#kindsWanted([kind]);
      if (!Array.isArray(want)) return want;
      const n = Number(limit);
      const cap = limit == null || limit === "" || !Number.isFinite(n) ? SIMILAR_LIMIT_DEFAULT : Math.max(1, Math.min(Math.trunc(n), SIMILAR_LIMIT_MAX));
      const empty = { ok: true, name: cleanLabel(name), kinds: want, similar: [], count: 0, limit: cap, truncated: false };
      if (viewerPredicate(viewer).scope === "DENY") return empty;
      const terms = labelTerms(name);
      const marks = want.map(() => "?").join(",");
      const aliasOf = new Map();
      for (const a of this.#rows(`SELECT a.entity_id, a.alias FROM entity_aliases a JOIN entities e ON e.entity_id = a.entity_id
                                   WHERE e.kind IN (${marks}) AND a.withdrawn_at IS NULL ORDER BY a.entity_id, a.alias_norm`, ...want)) {
        if (!aliasOf.has(a.entity_id)) aliasOf.set(a.entity_id, []);
        aliasOf.get(a.entity_id).push(a.alias);
      }
      const found = [];
      for (const e of this.#rows(`SELECT entity_id, kind, label, note FROM entities WHERE kind IN (${marks})`, ...want)) {
        let best = null;
        for (const other of [e.label, ...(aliasOf.get(e.entity_id) || [])]) {
          const c = closeness(fold, terms, normAlias(other), labelTerms(other));
          if (c && (best === null || CLOSENESS.indexOf(c) < CLOSENESS.indexOf(best.closeness))) best = { alias: other, closeness: c };
        }
        if (best) found.push({ entity_id: e.entity_id, kind: e.kind, label: e.label, note: e.note, alias: best.alias, closeness: best.closeness });
      }
      const byLabel = (x, y) => { const a = normAlias(x.label), b = normAlias(y.label); return a < b ? -1 : a > b ? 1 : 0; };
      found.sort((x, y) => (CLOSENESS.indexOf(x.closeness) - CLOSENESS.indexOf(y.closeness)) || byLabel(x, y)
                           || (x.entity_id < y.entity_id ? -1 : x.entity_id > y.entity_id ? 1 : 0));
      const truncated = found.length > cap;
      const similar = truncated ? found.slice(0, cap) : found;
      return { ...empty, similar, count: similar.length, truncated };
    } catch (err) {
      return { ok: false, reason: "UNREADABLE", detail: localize("entities.index.the_registry_could_not_be_5", "the registry could not be read: {String}", { String: String(String(err && err.message || err).slice(0, 200)) }) };
    }
  }

  /* R63, R64: whether `by` is an active administrator (membership's R64; a machine class or an unknown id is none). */
  #administers(by) {
    try { return !!this.#membership && typeof this.#membership.isAdministrator === "function" && this.#membership.isAdministrator(by) === true; }
    catch { return false; }
  }

  /** R64 (T51 fix round 3; C64; DEC-401, DEC-402; `op=officeconfirm`): an administrator confirms an office a member named
   *  (R63): the mark is cleared, who confirmed it and when are kept, and nothing else of the office changes. Refusals, in
   *  order, each writing nothing: `NO_ENTITY` (R37), `NO_SUCH_ENTITY` (R36), `NOT_AN_ADMIN` (membership's, a machine class
   *  included), `NOT_AN_OFFICE`, `NOT_NAMED_BY_A_MEMBER`; a repeat answers `already: true`, whoever repeats it. `by` is the
   *  control plane's stamp (R4). */
  confirmOffice({ entityId, by = null } = {}) {
    if (typeof entityId !== "string" || !entityId)
      return noEntity(localize("entities.index.an_office_is_confirmed_by", "an office a member named is confirmed by its entity id"));
    const e = this.#one(`SELECT kind, named_by_member, confirmed_by, confirmed_at FROM entities WHERE entity_id=?`, entityId);
    if (!e) return noSuchEntity(entityId);
    const who = by == null ? null : String(by);
    if (!who || !this.#administers(who))
      return notAnAdmin(who, localize("entities.index.confirming_an_office_a_member", "confirming an office a member named"));
    if (e.kind !== "office")
      return { ok: false, reason: "NOT_AN_OFFICE", entity_id: entityId, kind: e.kind,
               detail: localize("entities.index.only_an_office_a_member", "only an office a member named is confirmed, and this subject is a {kind}. Nothing was changed.", { kind: String(e.kind) }) };
    if (e.confirmed_by && !e.named_by_member)
      return { ok: true, already: true, entity_id: entityId, named_by_member: false, confirmed_by: e.confirmed_by, at: e.confirmed_at };
    if (!e.named_by_member)
      return { ok: false, reason: "NOT_NAMED_BY_A_MEMBER", entity_id: entityId,
               detail: localize("entities.index.this_office_was_not_named", "this office was not named by a member, so there is nothing to confirm. Nothing was changed.") };
    const at = this.#now();
    this.#sql.exec(`UPDATE entities SET named_by_member=0, confirmed_by=?, confirmed_at=? WHERE entity_id=?`, who, at, entityId);
    return { ok: true, entity_id: entityId, named_by_member: false, confirmed_by: who, at };
  }

  /** R8 (K106): a mistaken alias withdrawn, never erased. Hidden from every new match and from R6; still listed
   *  by R5, shown as withdrawn with who, when and why. A repeat answers `already: true` and writes nothing. */
  withdrawAlias({ entityId, alias, reason, withdrawnBy = null } = {}) {
    if (typeof entityId !== "string" || !entityId)
      return noEntity("an alias is withdrawn from an entity named by its id");
    const norm = normAlias(alias);
    const why = typeof reason === "string" ? reason.trim().slice(0, WITHDRAW_REASON_MAX) : "";
    if (!why) return { ok: false, reason: "NO_REASON",
      detail: localize("entities.index.a_withdrawal_says_why_the", "a withdrawal says why the name was wrong; it is kept beside the name for as long as the record lasts") };
    /* A name that folds to nothing is held by no entity, so it answers as an absent one. */
    const a = norm ? this.#one(`SELECT alias, withdrawn_by, withdrawn_at, withdrawn_reason FROM entity_aliases
                                 WHERE entity_id=? AND alias_norm=?`, entityId, norm) : null;
    if (!a) return { ok: false, reason: "NO_SUCH_ALIAS", entity_id: entityId, alias: alias == null ? null : String(alias),
      detail: localize("entities.index.this_entity_holds_no_such", "this entity holds no such name, so there is nothing to withdraw") };
    if (a.withdrawn_at)
      return { ok: true, already: true, entity_id: entityId, alias: a.alias,
               withdrawn: { by: a.withdrawn_by, at: a.withdrawn_at, reason: a.withdrawn_reason } };
    const at = this.#now();
    const by = withdrawnBy == null ? null : String(withdrawnBy);
    this.#sql.exec(`UPDATE entity_aliases SET withdrawn_by=?, withdrawn_at=?, withdrawn_reason=?
                     WHERE entity_id=? AND alias_norm=?`, by, at, why, entityId, norm);
    const resting = this.#restingOn(entityId, norm);
    return { ok: true, entity_id: entityId, alias: a.alias, withdrawn: { by, at, reason: why },
             resolutions_resting: resting.rows, resolutions_resting_truncated: resting.truncated,
             limit: ENTITY_COLLECTION_LIMIT,
             detail: localize("entities.index.the_name_matches_nothing_new", "the name matches nothing new and no longer finds this entity; resolutions already made through it are kept and marked as resting on a withdrawn name, so a member can re-resolve them") };
  }

  /** R8: a withdrawn relation remains and reads as withdrawn, with who, when and why. */
  withdrawRelation({ relationId, reason, withdrawnBy = null } = {}) {
    if (typeof relationId !== "string" || !relationId)
      return { ok: false, reason: "NO_RELATION", detail: localize("entities.index.a_relation_is_withdrawn_by", "a relation is withdrawn by its id") };
    const why = typeof reason === "string" ? reason.trim().slice(0, WITHDRAW_REASON_MAX) : "";
    if (!why) return { ok: false, reason: "NO_REASON",
      detail: localize("entities.index.a_withdrawal_says_why_the_2", "a withdrawal says why the relation was wrong; it is kept beside it for as long as the record lasts") };
    const r = this.#one(`SELECT * FROM entity_relations WHERE relation_id=?`, relationId);
    if (!r) return { ok: false, reason: "NO_SUCH_RELATION", relation_id: relationId };
    if (r.withdrawn_at) return { ok: true, already: true, relation: this.#relationView(r) };
    const at = this.#now();
    const by = withdrawnBy == null ? null : String(withdrawnBy);
    this.#sql.exec(`UPDATE entity_relations SET withdrawn_by=?, withdrawn_at=?, withdrawn_reason=? WHERE relation_id=?`,
                   by, at, why, relationId);
    return { ok: true, relation: this.#relationView(this.#one(`SELECT * FROM entity_relations WHERE relation_id=?`, relationId)) };
  }

  /* ===================================================================== *
   * T33 (T33-25): SECTOR (R42), SCHEME IDENTIFIERS (R43, R44), THE PROCEEDING FACET (R45, R46), THE CONNECTION OWNER
   * (R47, R48). Every authorship field is the control plane's stamp (R4, R28); nothing is erased (R8's pattern).
   * ===================================================================== */

  /** R42: the closed sector list `affordances` publishes. */
  sectors() { return [...SECTORS]; }

  /** R42: an organisation's sector set or corrected by a stamped act; the value it replaces is kept in its history. A
   *  repeat of the value held answers `already: true` and writes nothing. */
  setSector({ entityId, sector, note, by = null } = {}) {
    if (typeof entityId !== "string" || !entityId) return noEntity("a sector is set on an organisation named by its id");
    const e = this.#one(`SELECT kind, sector FROM entities WHERE entity_id=?`, entityId);
    if (!e) return noSuchEntity(entityId);
    if (!ORGANISATION_KINDS.includes(e.kind)) return notAnOrganisation(e.kind);
    if (!SECTORS.includes(sector)) return unknownSector(sector);
    const why = typeof note === "string" ? note.trim().slice(0, WITHDRAW_REASON_MAX) : "";
    if (!why) return { ok: false, reason: "NO_REASON",
      detail: localize("entities.index.a_sector_is_set_with", "a sector is set with a note saying why; it is kept beside the value for as long as the record lasts. Nothing was written.") };
    const prior = e.sector || SECTOR_UNDETERMINED;
    if (prior === sector) return { ok: true, already: true, entity_id: entityId, sector };
    const at = this.#now();
    const who = by == null ? null : String(by);
    return this.#record.transact(() => {
      this.#sql.exec(`UPDATE entities SET sector=? WHERE entity_id=?`, sector, entityId);
      this.#sql.exec(`INSERT INTO entity_sectors (entity_id,sector,prior,note,set_by,at) VALUES (?,?,?,?,?,?)`,
                     entityId, sector, prior, why, who, at);
      return { ok: true, entity_id: entityId, sector, prior, note: why, by: who, at };
    });
  }

  /* R43, R45: the scheme an identifier is in, from the active profiles' `identifier_schemes` (jurisdictions R52), or the
     reserved proceeding scheme over the profile `proceeding` space. */
  #schemeOf(view, scheme) {
    if (scheme === PROCEEDING_SCHEME) return { scheme, space: "proceeding", form: null, entity_kinds: ["proceeding"], systems: [] };
    const all = Array.isArray(view.identifier_schemes) ? view.identifier_schemes : [];
    return all.find((s) => s && typeof s === "object" && s.scheme === scheme) || null;
  }
  /* R43: one value in a scheme's space and, where the scheme names one, its form; null when it has neither shape. */
  static #inScheme(view, sch, id) {
    const rec = recogniseId(view, sch.space, id);
    return rec && (!sch.form || rec.form === sch.form) ? rec : null;
  }

  /** R43 (`op=entityidentify`): a scheme identifier held on an entity. */
  addIdentifier({ entityId, scheme, id, valid = null, basis, by = null } = {}) {
    if (typeof entityId !== "string" || !entityId) return noEntity("an identifier is held on an entity named by its id");
    const ent = this.#one(`SELECT kind FROM entities WHERE entity_id=?`, entityId);
    if (!ent) return noSuchEntity(entityId);
    const view = this.view();
    const schemes = (Array.isArray(view.identifier_schemes) ? view.identifier_schemes : []).filter((s) => s && typeof s.scheme === "string");
    const sch = typeof scheme === "string" && scheme !== PROCEEDING_SCHEME ? this.#schemeOf(view, scheme) : null;
    if (!sch) return { ok: false, reason: "UNKNOWN_SCHEME", scheme: typeof scheme === "string" ? scheme.slice(0, 80) : null,
      schemes: schemes.map((s) => s.scheme),
      detail: localize("entities.index.an_identifier_is_held_in", "an identifier is held in a scheme your team's active jurisdiction profiles name{v1}. Nothing was written.", { v1: String(schemes.length ? `: one of ${schemes.map((s) => s.scheme).join(", ")}` : "; they name none") }) };
    const kinds = Array.isArray(sch.entity_kinds) ? sch.entity_kinds : [];
    if (!kinds.includes(ent.kind)) return { ok: false, reason: "SCHEME_NOT_FOR_KIND", scheme: sch.scheme, kind: ent.kind,
      entity_kinds: [...kinds], detail: localize("entities.index.the_scheme_scheme_identifies_v1", "the scheme {scheme} identifies {v1}, not a {kind}. Nothing was written.", { scheme: String(sch.scheme), v1: String(kinds.join(", ") || "no kind"), kind: String(ent.kind) }) };
    const rec = Entities.#inScheme(view, sch, id);
    if (!rec) return identifierNotInSpace(view, sch, "id");
    if (valid !== null && valid !== undefined) {
      const bad = validityError(valid, view);
      if (bad) return { ok: false, reason: "BAD_VALIDITY", detail: localize("entities.index.bad_nothing_was_written", "{bad}. Nothing was written.", { bad: String(bad) }) };
    }
    const who = by == null ? null : String(by);
    const b = this.#identifierBasis(sch, basis, who);
    if (!b.ok) return b;
    return this.#holdIdentifier({ entityId, scheme: sch.scheme, scope: "", rec, valid: valid ?? null, basis: b.text, by: who, zone: viewZone(view) });
  }

  /* R43 (K1443): a member's basis is a cited source (non-empty text) or a system's row; a machine holds an identifier
     only from a system rule, `{system, row}`, the system one that issues or lists the scheme. */
  #identifierBasis(sch, basis, by) {
    const systems = Array.isArray(sch.systems) ? sch.systems : [];
    const row = basis && typeof basis === "object" && typeof basis.system === "string" && basis.system.trim()
      && (typeof basis.row === "string" ? basis.row.trim() : Number.isFinite(basis.row)) ? basis : null;
    if (isMachine(by)) {
      if (row && systems.includes(row.system.trim()))
        return { ok: true, text: JSON.stringify({ system: row.system.trim(), row: typeof row.row === "string" ? row.row.trim() : row.row }) };
      return actShapeRefusal("NO_BASIS", localize("entities.index.a_machine_holds_an_identifier", "a machine holds an identifier only from a system rule: basis {system, row}, the system one that issues or lists the scheme ({systems}), the row its own (K1443)", { systems: String(systems.join(", ") || "the scheme names none") }));
    }
    if (row) return { ok: true, text: JSON.stringify({ system: row.system.trim(), row: typeof row.row === "string" ? row.row.trim() : row.row }) };
    const text = typeof basis === "string" ? basis.trim().slice(0, 2000) : "";
    if (!text) return actShapeRefusal("NO_BASIS", localize("entities.index.an_identifier_is_held_on", "an identifier is held on its cited source or a system's own row"));
    return { ok: true, text };
  }

  /* R43: hold one identifier, or answer the repeat or the holder that takes it, in one transaction. */
  #holdIdentifier({ entityId, scheme, scope, rec, valid, basis, by, zone }) {
    return this.#record.transact(() => {
      const mine = this.#one(`SELECT id, withdrawn_at FROM entity_identifiers WHERE entity_id=? AND scheme=? AND scope=? AND normal=?`,
                             entityId, scheme, scope, rec.normal);
      if (mine) return { ok: true, already: true, entity_id: entityId, scheme, id: mine.id, normal: rec.normal,
                         ...(mine.withdrawn_at ? { withdrawn: true,
                           detail: localize("entities.index.this_entity_held_that_identifier", "this entity held that identifier and it was withdrawn; it stays on the record as withdrawn") } : {}) };
      const taken = this.#rows(`SELECT entity_id, valid FROM entity_identifiers WHERE scheme=? AND scope=? AND normal=?
                                  AND entity_id<>? AND withdrawn_at IS NULL ORDER BY entity_id`, scheme, scope, rec.normal, entityId)
        .find((r) => validitiesOverlap(valid, parseJson(r.valid), zone));
      if (taken) return identifierTaken(scheme, rec.normal, taken.entity_id);
      const at = this.#now();
      this.#sql.exec(`INSERT INTO entity_identifiers (entity_id,scheme,scope,space,form,id,normal,valid,basis,held_by,at)
                      VALUES (?,?,?,?,?,?,?,?,?,?,?)`, entityId, scheme, scope, rec.space, rec.form, rec.value, rec.normal,
                     valid == null ? null : JSON.stringify(valid), basis, by, at);
      return { ok: true, entity_id: entityId, scheme, id: rec.value, normal: rec.normal, space: rec.space, form: rec.form,
               valid: valid ?? null, basis: parseJson(basis), by, at };
    });
  }

  /** R43: an identifier withdrawn as R8 withdraws an alias: it matches nothing new and stays listed, withdrawn. */
  withdrawIdentifier({ entityId, scheme, id, reason, by = null } = {}) {
    if (typeof entityId !== "string" || !entityId) return noEntity("an identifier is withdrawn from an entity named by its id");
    const why = typeof reason === "string" ? reason.trim().slice(0, WITHDRAW_REASON_MAX) : "";
    if (!why) return { ok: false, reason: "NO_REASON",
      detail: localize("entities.index.a_withdrawal_says_why_the_3", "a withdrawal says why the identifier was wrong; it is kept beside it for as long as the record lasts") };
    const view = this.view();
    const sch = typeof scheme === "string" ? this.#schemeOf(view, scheme) : null;
    const rec = sch ? Entities.#inScheme(view, sch, id) : null;
    const raw = typeof id === "string" || typeof id === "number" ? String(id).trim() : "";
    const r = typeof scheme === "string" ? this.#one(`SELECT * FROM entity_identifiers WHERE entity_id=? AND scheme=? AND (normal=? OR id=?)
                                                       ORDER BY scope LIMIT 1`, entityId, scheme, rec ? rec.normal : raw, raw) : null;
    if (!r) return { ok: false, reason: "NO_SUCH_IDENTIFIER", entity_id: entityId, scheme: typeof scheme === "string" ? scheme : null,
      detail: localize("entities.index.this_entity_holds_no_such_2", "this entity holds no such identifier, so there is nothing to withdraw") };
    if (r.withdrawn_at) return { ok: true, already: true, identifier: identifierView(r) };
    const at = this.#now();
    const who = by == null ? null : String(by);
    this.#sql.exec(`UPDATE entity_identifiers SET withdrawn_by=?, withdrawn_at=?, withdrawn_reason=?
                     WHERE entity_id=? AND scheme=? AND scope=? AND normal=?`, who, at, why, r.entity_id, r.scheme, r.scope, r.normal);
    return { ok: true, identifier: identifierView({ ...r, withdrawn_by: who, withdrawn_at: at, withdrawn_reason: why }),
             detail: localize("entities.index.the_identifier_matches_nothing", "the identifier matches nothing new; resolutions already made through it are kept") };
  }

  /** R44: an entity's identifiers, oldest first, withdrawn ones marked, at most the bound (R39's pattern). Never throws. */
  identifiersOf(entityId) {
    try {
      if (typeof entityId !== "string" || !entityId) return noEntity("identifiers are read for an entity named by its id");
      const got = this.#bounded(ENTITY_COLLECTION_LIMIT, `SELECT * FROM entity_identifiers WHERE entity_id=? ORDER BY at, scheme, normal`, entityId);
      return { ok: true, entity_id: entityId, identifiers: got.rows.map(identifierView), limit: ENTITY_COLLECTION_LIMIT, truncated: got.truncated };
    } catch (err) {
      return { ok: false, reason: "UNREADABLE", detail: localize("entities.index.the_identifiers_could_not_be", "the identifiers could not be read: {String}", { String: String(String(err && err.message || err).slice(0, 200)) }) };
    }
  }

  /** R44: the one entity holding a scheme identifier in its normal form, valid at `at` when given; `null` when none
   *  does; undetermined, with why and the candidates, when the validity or more than one holder leaves it open. Never
   *  throws. */
  entityByIdentifier({ scheme, id, at = null } = {}) {
    try {
      const view = this.view();
      const sch = typeof scheme === "string" ? this.#schemeOf(view, scheme) : null;
      const rec = sch ? Entities.#inScheme(view, sch, id) : null;
      if (!rec) return null;
      let held = this.#rows(`SELECT i.*, e.kind, e.label FROM entity_identifiers i JOIN entities e ON e.entity_id = i.entity_id
                              WHERE i.scheme=? AND i.normal=? AND i.form=? AND i.withdrawn_at IS NULL ORDER BY i.entity_id, i.scope`,
                            sch.scheme, rec.normal, rec.form).map((r) => ({ r, v: at == null ? "in" : this.#validOn(parseJson(r.valid), at, view) }));
      held = held.filter((h) => h.v !== "out");
      if (!held.length) return null;
      const ids = [...new Set(held.map((h) => h.r.entity_id))];
      if (ids.length > 1) return { undetermined: true, candidates: ids,
        why: word("entities.why.entity_holds_meant", { scheme: sch.scheme, normal: rec.normal,
                                                           date: at == null ? "" : ` ${word("entities.why.date")}` }) };
      const h = held[0];
      const out = { entity_id: h.r.entity_id, kind: h.r.kind, label: h.r.label, ...identifierView(h.r) };
      return h.v === "in" ? out : { ...out, undetermined: true, why: h.v.why };
    } catch {
      return null;
    }
  }

  /* R9, R44: a held validity on one date: `in` when none is stated, else civil-time's answer (its undetermined kept). */
  #validOn(valid, at, view) {
    if (!valid) return "in";
    try { return validAt({ valid }, at, { view }); } catch (e) { return { undetermined: true, why: String(e && e.message || e) }; }
  }

  /* R45: the facet of a proceeding, judged in the order R45 states, before anything is written. */
  #proceedingFacet(p) {
    const f = p && typeof p === "object" && !Array.isArray(p) ? p : {};
    for (const field of ["forum", "kind", "number"])
      if (!(typeof f[field] === "string" ? f[field].trim() : typeof f[field] === "number" ? String(f[field]) : ""))
        return { ok: false, reason: "PROCEEDING_FACET_MISSING", field,
                 detail: localize("entities.index.a_proceeding_is_registered_facet", "a proceeding is registered with its facet {forum, kind, number}, and it names no {field}. Nothing was written.", { field: String(field) }) };
    const forum = this.#one(`SELECT entity_id, label FROM entities WHERE entity_id=?`, f.forum.trim());
    if (!forum) return noSuchEntity(f.forum.trim(), { field: "forum" });
    const view = this.view();
    const kinds = (Array.isArray(view.proceeding_kinds) ? view.proceeding_kinds : []).filter((k) => k && typeof k.kind === "string");
    const pk = kinds.find((k) => k.kind === f.kind.trim());
    if (!pk) return { ok: false, reason: "PROCEEDING_KIND_UNKNOWN", kind: f.kind.trim().slice(0, 80), kinds: kinds.map((k) => k.kind),
      detail: localize("entities.index.a_proceedings_kind_is_one", "a proceeding's kind is one your team's active jurisdiction profiles name{v1}. Nothing was written.", { v1: String(kinds.length ? `: one of ${kinds.map((k) => k.kind).join(", ")}` : "; they name none") }) };
    const sch = this.#schemeOf(view, PROCEEDING_SCHEME);
    const rec = Entities.#inScheme(view, sch, f.number);
    if (!rec) return identifierNotInSpace(view, sch, "number");
    const other = this.#one(`SELECT entity_id FROM entity_identifiers WHERE scheme=? AND scope=? AND normal=? AND withdrawn_at IS NULL`,
                            PROCEEDING_SCHEME, forum.entity_id, rec.normal);
    if (other) return identifierTaken(PROCEEDING_SCHEME, rec.normal, other.entity_id);
    const kindLabel = typeof pk.label === "string" && pk.label.trim() ? pk.label.trim() : pk.kind;
    return { ok: true, forum: forum.entity_id, forum_label: forum.label, forum_kind: pk.forum_kind, kind: pk.kind,
             number: rec.value, normal: rec.normal, form: rec.form,
             label: cleanLabel(`${forum.label}, ${rec.value}, ${kindLabel}`) };
  }

  /** R45: a proceeding's facet `{forum, forum_kind, number, kind}`, or null for any other kind (or none). Never throws. */
  proceedingOf(entityId) {
    try {
      const p = typeof entityId === "string" && entityId
        ? this.#one(`SELECT forum, forum_kind, number, kind, basis_capture, basis_extent FROM entity_proceedings WHERE entity_id=?`, entityId) : null;
      return p ? proceedingView(p) : null;
    } catch { return null; }
  }

  /** R46 (K1443): a proceeding registered from a captured register row or caption, attributed to whoever is stamped
   *  and shown for review; the passage stating the number is its basis. A forum already holding the number answers that
   *  entity, `existed: true`, adding the caption as an alias when it is new. */
  registerProceeding({ captureSha, extent, forum, number, kind, caption = null, declaredBy = null, viewer = null } = {}) {
    if (typeof captureSha !== "string" || !captureSha)
      return noSha("a proceeding is registered from a captured document, named by its capture sha256");
    const bad = checkContentExtent(extent, CONTENT_EXTENT_DOCUMENT_ONLY);
    if (bad) return { reason: bad.code, ...bad };
    for (const field of ["forum", "kind", "number"])
      if (!(typeof { forum, kind, number }[field] === "string" && { forum, kind, number }[field].trim()))
        return { ok: false, reason: "PROCEEDING_FACET_MISSING", field,
                 detail: localize("entities.index.a_proceeding_is_registered_facet", "a proceeding is registered with its facet {forum, kind, number}, and it names no {field}. Nothing was written.", { field: String(field) }) };
    const sha = captureSha.trim().toLowerCase();
    const g = viewerPredicate(viewer ?? declaredBy);
    const held = /^[0-9a-f]{64}$/.test(sha)
      ? this.#one(`SELECT r.capture_sha FROM register r JOIN bundles b ON b.bundle_id = r.bundle_id WHERE r.capture_sha = ? AND (${g.sql})`, sha, ...g.args)
      : null;
    if (!held) return { ok: false, reason: "NO_SUCH_REFERENCE", capture_sha: captureSha,
      detail: localize("entities.index.no_captured_document_the_record", "no captured document the record holds and you can see has that digest, so nothing can be read from it. Nothing was written.") };
    /* R45's refusals first; a forum already holding the number is R46's `existed`, never a refusal. */
    const facet = this.#proceedingFacet({ forum, kind, number });
    if (!facet.ok && facet.reason === "IDENTIFIER_TAKEN") {
      const add = typeof caption === "string" && normAlias(caption) ? this.addAlias({ entityId: facet.holder, alias: caption, declaredBy }) : null;
      return { ok: true, existed: true, entity_id: facet.holder, caption_added: !!(add && add.ok), proceeding: this.proceedingOf(facet.holder) };
    }
    if (!facet.ok) return facet;
    const note = cleanLabel(word("entities.clean_label.registered_captured_document",
                                 { sha, extent: describeExtent(extent), number: facet.number }));
    const made = this.#create({ kind: "proceeding", note, aliases: typeof caption === "string" ? [caption] : [], declaredBy,
                                proceeding: { forum, kind, number }, basis: { captureSha: sha, extent } });
    return made.ok ? { ...made, existed: false, basis: { capture_sha: sha, extent: JSON.parse(canonicalExtent(extent)) } } : made;
  }

  /** R47, R48 (connection-grammar R6–R8): the relations, not withdrawn, with `node` at one end, in the connection shape:
   *  each declared, at the lowest grade, its evidence the citation as declared, its validity unstated (so undetermined at
   *  every date, and marked so). Group-wide (C6, K1489): a member viewer sees every relation, an unrecognised one none,
   *  a missing one is refused. One indexed read per end, a page at a time in relation-id order with `next`; a node over
   *  the hub bound is named `hub` with no items. Writes nothing. */
  neighbours({ node, kinds, at = null, page = null, viewer, scope = null } = {}) {
    if (viewer === undefined || viewer === null || viewer === "")
      return { refused: "VIEWER_MISSING", why: word("duties.why.read_names_member") };
    const want = Array.isArray(kinds) ? RELATION_KINDS.filter((k) => kinds.includes(k)) : [...RELATION_KINDS];
    if (typeof node !== "string" || !node || !want.length || viewerPredicate(viewer).scope === "DENY") return { items: [] };
    const inKinds = `relation IN (${want.map(() => "?").join(",")})`;
    const live = `withdrawn_at IS NULL AND ${inKinds}`;
    const size = Number(this.#one(`SELECT count(*) AS n FROM entity_relations WHERE from_entity=? AND ${live}`, node, ...want).n)
               + Number(this.#one(`SELECT count(*) AS n FROM entity_relations WHERE to_entity=? AND ${live}`, node, ...want).n);
    if (size > BOUNDS.hub)
      return { items: [], hub: { set_size: size, why: word("entities.why.subject_end_declared", { size, hub: BOUNDS.hub }) } };
    const after = page && typeof page === "object" && typeof page.after === "string" ? page.after : "";
    const rows = this.#rows(`SELECT * FROM (SELECT * FROM entity_relations WHERE from_entity=? AND ${live} AND relation_id > ?
                             UNION ALL SELECT * FROM entity_relations WHERE to_entity=? AND ${live} AND relation_id > ?)
                             ORDER BY relation_id LIMIT ?`, node, ...want, after, node, ...want, after, BOUNDS.fanout + 1);
    const more = rows.length > BOUNDS.fanout;
    const view = this.view();
    const zone = viewZone(view) || "UTC";
    const items = (more ? rows.slice(0, BOUNDS.fanout) : rows).map((r) => {
      const c = { id: r.relation_id, from: r.from_entity, to: r.to_entity, kind: r.relation, owner: CONNECTION_OWNER,
                  valid: { from: null, to: null, precision: "day", zone },
                  evidence: [{ source: r.citation, justification: r.justification }],
                  grade: { assertion: LOWEST_GRADE, ends: [LOWEST_GRADE, LOWEST_GRADE] }, derived: null,
                  label: DECLARED_LABEL, declared_by: r.declared_by, declared_at: r.at };
      const v = this.#validOn(c.valid, at, view);
      return v === "in" ? c : v === "out" ? null : { ...c, undetermined: { why: v.why || word("entities.why.relation_states_dates") } };
    }).filter(Boolean);
    return { items, ...(more ? { next: { after: items[items.length - 1].id } } : {}) };
  }

  /* R8, R39: the entity's recogniser resolutions resting on this fold, by capture then reference, at most the bound,
     `truncated` by reading one past. Only the digest and the reference: what the record read stays visible (R32). */
  #restingOn(entityId, norm) {
    const rows = this.#rows(`SELECT capture_sha, ref, grade FROM resolutions
                              WHERE entity_id=? AND basis_norm=? AND grade <> 'D' ORDER BY capture_sha, ref LIMIT ?`,
                            entityId, norm, ENTITY_COLLECTION_LIMIT + 1);
    const truncated = rows.length > ENTITY_COLLECTION_LIMIT;
    return { rows: (truncated ? rows.slice(0, ENTITY_COLLECTION_LIMIT) : rows)
               .map((r) => ({ capture_sha: r.capture_sha, ref: r.ref, grade: r.grade })), truncated };
  }

  #relationView(r, from = null) {
    return { relation_id: r.relation_id, relation: r.relation, from_entity: r.from_entity, to_entity: r.to_entity,
             ...(from ? { direction: r.from_entity === from ? "out" : "in" } : {}),
             justification: r.justification, citation: r.citation, declared_by: r.declared_by, at: r.at,
             withdrawn: r.withdrawn_at ? { by: r.withdrawn_by, at: r.withdrawn_at, reason: r.withdrawn_reason } : null };
  }

  /* R39: one collection keyed on one entity, at most `max` in its stated order, `truncated` by reading one past. */
  #bounded(max, q, ...a) {
    const rows = this.#rows(`${q} LIMIT ?`, ...a, max + 1);
    const truncated = rows.length > max;
    return { rows: truncated ? rows.slice(0, max) : rows, truncated };
  }

  /* R5, R39, R38: the entity with its aliases (canonical first), the relations it is an end of (oldest first, at most
     1,000) and the defect reports on its resolutions (oldest first), the others at most 500; `keep` is the viewer's redactor (R32). */
  #entityView(e, keep) {
    const al = this.#bounded(ENTITY_COLLECTION_LIMIT,
      `SELECT alias, canonical, declared_by, at, withdrawn_by, withdrawn_at, withdrawn_reason FROM entity_aliases
        WHERE entity_id=? ORDER BY canonical DESC, alias`, e.entity_id);
    const aliases = al.rows.map((a) => ({
        alias: a.alias, canonical: !!a.canonical, declared_by: a.declared_by, at: a.at,
        withdrawn: a.withdrawn_at ? { by: a.withdrawn_by, at: a.withdrawn_at, reason: a.withdrawn_reason } : null }));
    const rel = this.#bounded(ENTITY_RELATIONS_LIMIT,
      `SELECT * FROM entity_relations WHERE from_entity=? OR to_entity=? ORDER BY at, relation_id`, e.entity_id, e.entity_id);
    const relations = rel.rows.map((r) => this.#relationView(r, e.entity_id));
    const def = this.#bounded(ENTITY_COLLECTION_LIMIT,
      `SELECT capture_sha, bundle_id, ref, reason, source_module, source_id, reported_by, at FROM resolution_defects
        WHERE entity_id=? ORDER BY at, defect_id`, e.entity_id);
    const defects = def.rows.map((d) => ({ capture_sha: d.capture_sha, ref: d.ref, ...Entities.#defectView(d, keep) }));
    /* R42, R44, R45 (T33-25): the sector and its history, the identifiers, the proceeding facet. */
    const isOrg = ORGANISATION_KINDS.includes(e.kind);
    const sec = isOrg ? this.#bounded(ENTITY_COLLECTION_LIMIT,
      `SELECT sector, prior, note, set_by, at FROM entity_sectors WHERE entity_id=? ORDER BY seq`, e.entity_id) : { rows: [], truncated: false };
    const ids = this.#bounded(ENTITY_COLLECTION_LIMIT, `SELECT * FROM entity_identifiers WHERE entity_id=? ORDER BY at, scheme, normal`, e.entity_id);
    return { entity_id: e.entity_id, kind: e.kind, label: e.label, note: e.note,
             declared_by: e.declared_by, at: e.at,
             sector: isOrg ? e.sector || SECTOR_UNDETERMINED : null,
             forum_kind: FORUM_ENTITY_KINDS.includes(e.kind) ? e.forum_kind ?? null : null,
             named_by_member: e.kind === "office" ? !!e.named_by_member : null,
             confirmed_by: e.kind === "office" ? e.confirmed_by ?? null : null,
             confirmed_at: e.kind === "office" ? e.confirmed_at ?? null : null,
             sector_history: sec.rows.map((h) => ({ sector: h.sector, prior: h.prior, note: h.note, by: h.set_by, at: h.at })),
             identifiers: ids.rows.map(identifierView),
             proceeding: e.kind === "proceeding" ? this.proceedingOf(e.entity_id) : null,
             aliases, relations, defects, defect_count: defects.length,
             limit: ENTITY_COLLECTION_LIMIT, relations_limit: ENTITY_RELATIONS_LIMIT, aliases_truncated: al.truncated, relations_truncated: rel.truncated,
             defects_truncated: def.truncated, sector_history_truncated: sec.truncated, identifiers_truncated: ids.truncated };
  }

  /* R38, R32: one report as it is read, `by` withheld where its document sits out of the viewer's sight. */
  static #defectView(d, keep) {
    const hidden = !!d.bundle_id && keep(d.bundle_id) == null;
    return { reason: d.reason, source: d.source_module == null ? null : { module: d.source_module, id: d.source_id },
             by: hidden ? null : d.reported_by, at: d.at };
  }

  /* ===================================================================== *
   * THE RECOGNISER (FW-7; R9–R13). A RESOLUTION matches one reading reference to a registry entity and DECLARES
   * THE METHOD, which IS the section 8.1 grade: A the reference, B its key, C its label matched an alias. Never
   * a D (testimony is a member's), never through a declared relation (R26), never a fall-through (R9).
   * ===================================================================== */

  /* The recogniser's one matching primitive: every entity holding the fold through a LIVE alias (R8). */
  #entitiesByNorm(norm) {
    if (!norm) return [];
    return this.#rows(`SELECT DISTINCT entity_id FROM entity_aliases WHERE alias_norm=? AND withdrawn_at IS NULL
                        ORDER BY entity_id`, norm).map((r) => r.entity_id);
  }

  /* R9 (T33-25): what the identifier tier reads, once per resolve or lookup: the view, the spaces a held identifier can
     be in (none when the registry holds none, so the tier costs nothing then), and each capture's retrieval instant
     (the earliest the record located its bytes at, provenance R48; else its register entry), memoised. */
  #idContext() {
    const view = this.view();
    const any = !!this.#one(`SELECT 1 AS x FROM entity_identifiers WHERE withdrawn_at IS NULL LIMIT 1`);
    const schemeSpaces = (Array.isArray(view.identifier_schemes) ? view.identifier_schemes : [])
      .filter((x) => x && typeof x.space === "string").map((x) => x.space);
    const instants = new Map();
    const instant = (sha) => {
      if (!instants.has(sha)) {
        let t = null;
        try {
          t = this.#one(`SELECT MIN(first_retrieved) AS t FROM captured_locators WHERE capture_sha=?`, sha)?.t
            ?? this.#one(`SELECT registered AS t FROM register WHERE capture_sha=? ORDER BY registered LIMIT 1`, sha)?.t ?? null;
        } catch { t = null; }
        instants.set(sha, t);
      }
      return instants.get(sha);
    };
    return { view, spaces: any ? [...new Set([...schemeSpaces, "proceeding"])] : [], instant };
  }

  /* R9's identifier tier: every entity holding, not withdrawn, a scheme identifier equal (space, form, normal form) to
     the reference or its key as id-spaces recognises it, whose validity is not `out` at the capture's retrieval
     instant; entity id -> {basis, method}, the basis naming the scheme. */
  #identifierHits(rr, ctx) {
    const out = new Map();
    const values = [...new Set([rr.ref, rr.ref_key].filter((v) => typeof v === "string" && v.trim()))];
    for (const value of values) for (const space of ctx.spaces) {
      const rec = recogniseId(ctx.view, space, value);
      if (!rec) continue;
      const when = ctx.instant(rr.capture_sha);
      for (const row of this.#rows(`SELECT entity_id, scheme, valid FROM entity_identifiers
                                     WHERE space=? AND normal=? AND form=? AND withdrawn_at IS NULL ORDER BY entity_id, scheme`,
                                   space, rec.normal, rec.form)) {
        if (out.has(row.entity_id)) continue;
        const valid = parseJson(row.valid);
        const v = valid && when ? this.#validOn(valid, when, ctx.view) : valid ? { why: word("entities.why.capture_retrieval_instant") } : "in";
        if (v === "out") continue;
        out.set(row.entity_id, { basis: `${row.scheme} ${rec.normal}`,
          method: localize("entities.index.scheme_identifier_the_reference_v1", "scheme identifier -- the reference {v1}'{value}' is {normal} in the {space} space ({form}), an identifier this entity holds in the scheme {scheme}{v2}", { v1: String(value === rr.ref ? "" : "key "), value: String(value), normal: String(rec.normal), space: String(space), form: String(rec.form), scheme: String(row.scheme), v2: String(v === "in" ? (valid ? ", valid when the document was retrieved" : "") : localize("entities.index.its_validity_then_is_undetermined", "; its validity then is undetermined ({why})", { why: String(reasonText(v.why)) })) }) });
      }
    }
    return out;
  }

  /** R9: THE TIER DECISION, for the recogniser and for R17's `grade_if_resolved`, the SAME code: if any entity
   *  matches at A, nothing is recorded at B or C for that reference at all, including for another entity. `ctx` is
   *  `#idContext`'s, made once by a caller that decides many references. */
  recogniseTier(rr, ctx = null) {
    const refNorm = normAlias(rr.ref);
    const keyNorm = rr.ref_key == null ? "" : normAlias(rr.ref_key);
    const labelNorm = rr.label == null ? "" : normAlias(rr.label);
    const ic = ctx || this.#idContext();
    const ids = ic.spaces.length ? this.#identifierHits(rr, ic) : new Map();
    const a = this.#entitiesByNorm(refNorm);
    if (ids.size || a.length) return { grade: "A", hits: [...new Set([...ids.keys(), ...a])].sort(), per: ids, basis: rr.ref,
      method: localize("entities.index.source_identifier_the_references_composite", "source identifier -- the reference's composite key '{ref}' matched a registered identifier of the entity exactly; the source names this subject by this key, both ends captured", { ref: String(rr.ref) }) };
    const b = keyNorm && keyNorm !== refNorm ? this.#entitiesByNorm(keyNorm) : [];
    if (b.length) return { grade: "B", hits: b, basis: rr.ref_key,
      method: localize("entities.index.source_identifier_in_content_the", "source identifier in content -- the reference's key '{ref_key}' matched a registered identifier of the entity exactly at both ends", { ref_key: String(rr.ref_key) }) };
    const c = labelNorm ? this.#entitiesByNorm(labelNorm) : [];
    if (c.length) return { grade: "C", hits: c, basis: rr.label,
      method: localize("entities.index.correspondence_the_references_name_label", "correspondence -- the reference's name '{label}' matched an entity alias by name; plausible, never established, flagged for a member to confirm", { label: String(rr.label) }) };
    return { grade: null, hits: [], basis: null, method: null };
  }

  /* R10: the improvable-grade rule, inside the caller's transaction. A stronger grade raises in place
     (`raised_from`); an equal or weaker one is kept; a grade never falls. R13: each insert or raise runs the
     `onResolved` listeners. */
  #upsert({ captureSha, bundleId, ref, entityId, grade, method, basis, resolvedBy, matchedBy }) {
    const at = this.#now();
    const est = isEstablished(grade) ? 1 : 0;
    const b = basis == null ? null : String(basis).slice(0, 400);
    /* R39: the fold of the matched string, for a machine resolution only (testimony matched no name, R8). */
    const bn = grade === "D" || b == null ? null : normAlias(b) || null;
    const by = resolvedBy == null ? null : String(resolvedBy).slice(0, 200);
    const existing = this.#one(`SELECT grade, matched_by FROM resolutions WHERE capture_sha=? AND ref=? AND entity_id=?`, captureSha, ref, entityId);
    if (existing && !(gradeRank[grade] > (gradeRank[existing.grade] || 0)))
      return { capture_sha: captureSha, bundle_id: bundleId, ref, entity_id: entityId, grade: existing.grade,
               matched_by: existing.matched_by ?? null,
               established: isEstablished(existing.grade), needs_confirmation: existing.grade === "C", raised: false, kept: true };
    /* R58: how the grade was reached travels with the resolution; a raise takes the stronger resolution's. */
    const mb = MATCHED_BY.includes(matchedBy) ? matchedBy : null;
    if (!existing)
      this.#sql.exec(`INSERT INTO resolutions (capture_sha,bundle_id,ref,entity_id,grade,method,basis,basis_norm,established,raised_from,resolved_by,at,matched_by)
                      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, captureSha, bundleId, ref, entityId, grade, method, b, bn, est, null, by, at, mb);
    else
      this.#sql.exec(`UPDATE resolutions SET grade=?, method=?, basis=?, basis_norm=?, established=?, raised_from=?, resolved_by=?, at=?, matched_by=?
                       WHERE capture_sha=? AND ref=? AND entity_id=?`,
                     grade, method, b, bn, est, existing.grade, by, at, mb, captureSha, ref, entityId);
    const raised = !!existing;
    for (const l of this.#onResolved) l.fn({ entityId, captureSha, ref, grade, raised });
    return { capture_sha: captureSha, bundle_id: bundleId, ref, entity_id: entityId, grade, method, basis: b, matched_by: mb,
             established: !!est, needs_confirmation: grade === "C", raised,
             ...(raised ? { raised_from: existing.grade } : {}), resolved_by: by, at };
  }

  /** R11: the recogniser over a captured document's references (all of them, or `ref`), in one transaction; with
   *  `items`, the per-item set form (C-75), each item by the same code the single form runs. */
  resolve({ captureSha, ref = null, resolvedBy = null, items } = {}) {
    if (items !== undefined)
      return perItem("resolve", { items, ref }, { resolvedBy }, (b) => this.#resolveOne(b),
                     { itemKeys: RESOLVE_ITEM_KEYS, sharedKeys: RESOLVE_SHARED_KEYS });
    return this.#resolveOne({ captureSha, ref, resolvedBy });
  }

  #resolveOne({ captureSha, ref = null, resolvedBy = null } = {}) {
    if (typeof captureSha !== "string" || !captureSha)
      return noSha("a resolution is over a captured document, named by its capture sha256");
    let refs;
    if (ref != null) {
      if (typeof ref !== "string" || !ref)
        return { ok: false, reason: "NO_REF", detail: localize("entities.index.resolve_a_single_reference", "resolve a single reference by its raw kind:key, or omit ref to resolve all") };
      const one = this.#one(`SELECT capture_sha, bundle_id, ref, ref_kind, ref_key, label FROM reading_refs
                              WHERE capture_sha=? AND ref=? AND seq=0`, captureSha, ref);
      if (!one) return { ok: false, reason: "NO_SUCH_REFERENCE", capture_sha: captureSha, ref,
        detail: localize("entities.index.this_captured_document_s_reading", "this captured document's reading carries no such reference (nothing to resolve)") };
      refs = [one];
    } else {
      /* D-454: seq 0 — a resolution is of the REFERENCE, and its occurrences are one reference. */
      refs = this.#rows(`SELECT capture_sha, bundle_id, ref, ref_kind, ref_key, label FROM reading_refs
                          WHERE capture_sha=? AND seq=0 ORDER BY ref`, captureSha);
    }
    const resolved = [], unresolved = [];
    const ctx = this.#idContext();
    this.#record.transact(() => {
      for (const rr of refs) {
        const tier = this.recogniseTier(rr, ctx);
        const matches = tier.hits.map((entityId) => {
          const own = tier.per && tier.per.get(entityId);
          return this.#upsert({ captureSha: rr.capture_sha, bundleId: rr.bundle_id, ref: rr.ref, entityId, grade: tier.grade,
                                method: own ? own.method : tier.method, basis: own ? own.basis : tier.basis, resolvedBy,
                                matchedBy: own ? "identifier" : tier.grade === "A" ? "reference" : tier.grade === "B" ? "reference_key" : "label" });
        });
        /* REC-95 (R13): one attempt per reference, matched or not, in the same transaction; what was tried is the
           row's own fields, the recogniser's cascade order. */
        const considered = [rr.ref ? word("entities.considered.composite_key") : null, rr.ref_key ? word("entities.considered.source_key") : null,
                            rr.label ? "the name" : null].filter(Boolean).join(", ") || null;
        for (const l of this.#onAttempt)
          l.fn({ captureSha: rr.capture_sha, bundleId: rr.bundle_id, ref: rr.ref, matches, considered, resolvedBy });
        if (!matches.length) { unresolved.push({ ref: rr.ref, kind: rr.ref_kind, key: rr.ref_key, label: rr.label }); continue; }
        resolved.push(...matches);
      }
      return { ok: true };
    });
    return { ok: true, capture_sha: captureSha, references: refs.length,
             resolved_count: resolved.length, unresolved_count: unresolved.length, resolved, unresolved };
  }

  /** R12: a member's grade-D TESTIMONY that a document concerns an entity — the ONLY path a D enters. Both ends
   *  must exist; it never lowers a stronger resolution (R10). `resolvedBy` is the control plane's stamp. */
  testify({ captureSha, ref, entityId, basis, resolvedBy = null } = {}) {
    if (typeof captureSha !== "string" || !captureSha)
      return noSha("testimony is about a captured document, named by its capture sha256");
    if (typeof ref !== "string" || !ref)
      return { ok: false, reason: "NO_REF", detail: localize("entities.index.testimony_names_the_raw", "testimony names the raw reference (kind:key) the document carries") };
    if (typeof entityId !== "string" || !entityId)
      return noEntity("testimony names the entity the reference concerns, by id");
    const b = typeof basis === "string" ? basis.trim() : "";
    if (!b) return actShapeRefusal("NO_BASIS", localize("entities.index.grade_d_is_recorded", "grade D is recorded testimony: it carries the member's stated basis, with an author and a date"));
    const rr = this.#one(`SELECT bundle_id FROM reading_refs WHERE capture_sha=? AND ref=? AND seq=0`, captureSha, ref);
    if (!rr) return { ok: false, reason: "NO_SUCH_REFERENCE", capture_sha: captureSha, ref,
      detail: localize("entities.index.this_captured_document_s_reading_2", "this captured document's reading carries no such reference to testify about") };
    if (!this.has(entityId)) return noSuchEntity(entityId);
    /* D-219: what grade D lacks is a captured DOCUMENT, not a basis. */
    const method = localize("entities.index.testimony_asserted_by_v1_on", "testimony -- asserted by {v1} on the member's stated basis, with no captured document (framework 8.1 grade D)", { v1: String(resolvedBy || "a member") });
    const m = this.#record.transact(() => this.#upsert({
      captureSha, bundleId: rr.bundle_id, ref, entityId, grade: "D", method, basis: b, resolvedBy, matchedBy: "testimony" }));
    return { ok: true, grade_declared: "D", ...m };
  }

  /** R13 (K31's pattern): a later module's work on each inserted or raised resolution, inside the transaction. */
  onResolved(module, fn) { return this.#listen(this.#onResolved, module, fn); }
  /** R13: a later module's work on each reference tried, matched or not, inside the transaction. */
  onResolveAttempt(module, fn) { return this.#listen(this.#onAttempt, module, fn); }
  /* N202: a malformed or repeated registration is refused by membership's `listenerRefusal` (its R81), the one site
     of LISTENER_MALFORMED and LISTENER_DECLARED; the listeners run in the modules' total order (`MODULE_ORDER`, its
     R83; a module not in it last, in the order it registered), whatever order they registered in. */
  #listen(list, module, fn) {
    const refused = listenerRefusal(list, module, fn);
    if (refused) return refused;
    list.push({ module, fn, seq: list.length });
    const rank = (m) => { const i = MODULE_ORDER.indexOf(m); return i === -1 ? Infinity : i; };
    list.sort((a, b) => (rank(a.module) - rank(b.module)) || (a.seq - b.seq));
    return { ok: true };
  }

  /* ===================================================================== *
   * THE DEFECT REPORT (R38; N345, DEC-76 item 3). A report that a resolution matched the wrong subject. IT MOVES
   * NOTHING: the grade (R27), the resolution and every connection stay; the report is read beside the resolution
   * (R5, R14, R15), so a member can re-resolve (R8's pattern).
   * ===================================================================== */

  /** R38. `by` is the control plane's stamp (R4); `source` is `{module, id}` (what raised the report, such as a
   *  contradiction candidate) or null for a member's own report; a value without both strings is read as null. */
  reportResolutionDefect({ captureSha, ref, entityId, reason, source = null, by = null } = {}) {
    if (typeof captureSha !== "string" || !captureSha)
      return noSha("a defect report names the resolution's captured document, by its capture sha256");
    if (typeof ref !== "string" || !ref)
      return { ok: false, reason: "NO_REF", detail: localize("entities.index.a_defect_report_names", "a defect report names the resolution's raw reference (kind:key)") };
    if (typeof entityId !== "string" || !entityId)
      return noEntity("a defect report names the subject the reference was resolved to, by its entity id");
    const why = typeof reason === "string" ? reason.trim().slice(0, DEFECT_REASON_MAX) : "";
    if (!why) return { ok: false, reason: "NO_REASON",
      detail: localize("entities.index.a_defect_report_says_why", "a defect report says why the match is wrong; it is kept beside the resolution for as long as the record lasts") };
    const held = this.#one(`SELECT bundle_id FROM resolutions WHERE capture_sha=? AND ref=? AND entity_id=?`, captureSha, ref, entityId);
    /* DEC-49 REGION is-resolution-held — R29 (C-91.7). */
    if (!held) {
      const row = ENTITY_CHECKS.NO_SUCH_RESOLUTION;
      return { ok: false, reason: "NO_SUCH_RESOLUTION", code: "NO_SUCH_RESOLUTION", check: row.check,
               translation: row.translation, capture_sha: captureSha, ref, entity_id: entityId,
               detail: localize("entities.index.no_resolution_of_that", "no resolution of that reference of that captured document to that entity is held") };
    }
    /* END DEC-49 REGION is-resolution-held */
    const src = source && typeof source === "object" && typeof source.module === "string" && source.module.trim()
      && typeof source.id === "string" && source.id.trim()
      ? { module: source.module.trim().slice(0, 200), id: source.id.trim().slice(0, 200) } : null;
    const reporter = by == null ? null : String(by).slice(0, 200);
    const key = [captureSha, ref, entityId];
    return this.#record.transact(() => {
      const prior = this.#one(`SELECT reason, source_module, source_id, reported_by, at FROM resolution_defects
                                WHERE capture_sha=? AND ref=? AND entity_id=? AND reported_by IS ? AND source_module IS ?
                                  AND source_id IS ? ORDER BY defect_id LIMIT 1`,
                              ...key, reporter, src ? src.module : null, src ? src.id : null);
      const count = () => Number(this.#one(`SELECT COUNT(*) AS n FROM resolution_defects WHERE capture_sha=? AND ref=? AND entity_id=?`, ...key).n);
      const answer = { ok: true, capture_sha: captureSha, ref, entity_id: entityId };
      if (prior)
        return { ...answer, already: true, defect: Entities.#defectView({ ...prior, bundle_id: null }, (id) => id), defect_count: count() };
      const at = this.#now();
      this.#sql.exec(`INSERT INTO resolution_defects (capture_sha,bundle_id,ref,entity_id,reason,source_module,source_id,reported_by,at)
                      VALUES (?,?,?,?,?,?,?,?,?)`, captureSha, held.bundle_id, ref, entityId, why,
                     src ? src.module : null, src ? src.id : null, reporter, at);
      return { ...answer, defect: { reason: why, source: src, by: reporter, at }, defect_count: count(),
               detail: localize("entities.index.the_report_is_kept", "the report is kept beside the resolution; the grade, the resolution and every connection are unchanged") };
    });
  }

  /* R38, R14, R15: the reports on the resolutions `scanSql` names (a statement answering capture_sha, ref, entity_id),
     keyed `capture\0ref\0entity`: each resolution's reports oldest first, at most the bound, and its whole count. */
  #defectsOf(scanSql, args, keep) {
    const out = new Map();
    const rows = this.#rows(
      `SELECT * FROM (SELECT d.capture_sha, d.bundle_id, d.ref, d.entity_id, d.reason, d.source_module, d.source_id,
                             d.reported_by, d.at,
                             ROW_NUMBER() OVER (PARTITION BY d.capture_sha, d.ref, d.entity_id ORDER BY d.at, d.defect_id) AS rn,
                             COUNT(*) OVER (PARTITION BY d.capture_sha, d.ref, d.entity_id) AS n
                        FROM resolution_defects d
                        JOIN (${scanSql}) p ON p.capture_sha = d.capture_sha AND p.ref = d.ref AND p.entity_id = d.entity_id)
        WHERE rn <= ? ORDER BY capture_sha, ref, entity_id, rn`, ...args, ENTITY_COLLECTION_LIMIT);
    for (const d of rows) {
      const k = `${d.capture_sha}\u0000${d.ref}\u0000${d.entity_id}`;
      if (!out.has(k)) out.set(k, { defects: [], defect_count: Number(d.n) });
      out.get(k).defects.push(Entities.#defectView(d, keep));
    }
    return out;
  }
  static #defectsFor(map, r) {
    const d = map.get(`${r.capture_sha}\u0000${r.ref}\u0000${r.entity_id}`);
    return d ? { defects: d.defects, defect_count: d.defect_count } : { defects: [], defect_count: 0 };
  }

  /* ===================================================================== *
   * THE REVERSE READS (R14–R16). R32 (K102): a document's digest and what the record read from it stay
   * visible; the project that holds it, its id and its members' acts are hidden — `bundle_id`, `resolved_by` and
   * a testimony's testifier are withheld for a document the viewer may not see.
   * ===================================================================== */

  /* The testimony method with the testifier withheld (R32). */
  static #TESTIMONY_WITHHELD = localize("entities.index.testimony_withheld", "testimony -- asserted by a member on the member's stated basis, with no captured document (framework 8.1 grade D); who testified is withheld, because the document sits where you cannot see");

  #withdrawnNames(entityIds) {
    const out = new Map();
    for (const id of new Set(entityIds)) {
      const rows = this.#rows(`SELECT alias, alias_norm, withdrawn_at FROM entity_aliases WHERE entity_id=? AND withdrawn_at IS NOT NULL`, id);
      if (rows.length) out.set(id, new Map(rows.map((r) => [r.alias_norm, r])));
    }
    return out;
  }
  /* R8: a machine resolution whose matched string is a withdrawn name of its entity rests on a withdrawn name. */
  static #restsOn(withdrawn, r) {
    if (r.grade === "D" || r.basis == null) return null;   /* testimony matched no name */
    const w = withdrawn.get(r.entity_id);
    const hit = w && w.get(normAlias(r.basis));
    return hit ? { alias: hit.alias, withdrawn_at: hit.withdrawn_at } : null;
  }

  #clamp(limit) { return Math.max(1, Math.min(Number(limit) || MEANING_LIMIT_DEFAULT, MEANING_LIMIT_MAX)); }

  /** R14: a capture's resolutions, ordered by reference then entity, bounded, `truncated` measured by reading one
   *  more; R32's withholding; R8's `withdrawn_name`; R38's reports beside each; R58's `matched_by` on each and `names`,
   *  what the document names, one entry per entity its resolutions name. */
  resolutionsFor({ captureSha, limit = null, viewer = null } = {}) {
    if (typeof captureSha !== "string" || !captureSha)
      return noSha("resolutions are read for a captured document, by its capture sha256");
    const cap = this.#clamp(limit);
    const scan = `SELECT capture_sha, bundle_id, ref, entity_id, grade, method, basis, established, raised_from, resolved_by, at, matched_by
                    FROM resolutions WHERE capture_sha=? ORDER BY ref, entity_id LIMIT ?`;
    const rows = this.#rows(scan, captureSha, cap + 1);
    const truncated = rows.length > cap;
    const page = truncated ? rows.slice(0, cap) : rows;
    const keep = this.#redactor(viewer);
    const withdrawn = this.#withdrawnNames(page.map((r) => r.entity_id));
    const defects = this.#defectsOf(scan, [captureSha, cap], keep);
    const names = this.#namesOf(captureSha, cap);
    const unresolved = this.#unresolvedOf(captureSha, cap);
    return { ok: true, capture_sha: captureSha, count: page.length, limit: cap, truncated,
             names: names.names, names_truncated: names.truncated,
             unresolved: unresolved.unresolved, unresolved_truncated: unresolved.truncated,
             resolutions: page.map((r) => {
               const bundle = keep(r.bundle_id), hidden = !!r.bundle_id && bundle == null;
               return { capture_sha: r.capture_sha, bundle_id: bundle, ref: r.ref, entity_id: r.entity_id,
                        grade: r.grade, matched_by: r.matched_by ?? null, established: !!r.established, needs_confirmation: r.grade === "C",
                        method: hidden && r.grade === "D" ? Entities.#TESTIMONY_WITHHELD : r.method, basis: r.basis,
                        raised_from: r.raised_from, resolved_by: hidden ? null : r.resolved_by, at: r.at,
                        withdrawn_name: Entities.#restsOn(withdrawn, r), ...Entities.#defectsFor(defects, r) };
             }) };
  }

  /* R14: the names the reading found that no entity resolution holds: the capture's references (each at its first place)
     with no resolution row, in reading order (the order the reading wrote them), `{ref, label, page}` (`page` as R61, null
     where the reading cannot say), at most `cap`, `truncated` by reading one past. */
  #unresolvedOf(captureSha, cap) {
    const rows = this.#rows(`SELECT rr.ref, rr.label, rr.pos_kind, rr.pos FROM reading_refs rr
                              WHERE rr.capture_sha=? AND rr.seq=0
                                AND NOT EXISTS (SELECT 1 FROM resolutions r WHERE r.capture_sha = rr.capture_sha AND r.ref = rr.ref)
                              ORDER BY rr.rowid LIMIT ?`, captureSha, cap + 1);
    return { truncated: rows.length > cap,
             unresolved: rows.slice(0, cap).map((r) => ({ ref: r.ref, label: r.label ?? null, page: pageOf(r.pos_kind, r.pos) })) };
  }

  /* R58: what a capture names, one entry per entity its resolutions name: the strongest resolution's grade and
     `matched_by` (a tie at one grade takes the way a name is least in doubt, `MATCHED_BY`'s order), `mentions` the distinct
     references resolving to the entity, `label` and `kind` as R56 reads them (`null` when the entity holds none), strongest
     grade first, then label fold, then entity id; at most `cap`, `truncated` when more remain. One read of the capture's
     resolutions with the registry joined in. */
  #namesOf(captureSha, cap) {
    const by = new Map();
    for (const r of this.#rows(`SELECT r.entity_id, r.ref, r.grade, r.matched_by, e.kind, e.label
                                  FROM resolutions r LEFT JOIN entities e ON e.entity_id = r.entity_id
                                 WHERE r.capture_sha=? ORDER BY r.entity_id, r.ref`, captureSha)) {
      let n = by.get(r.entity_id);
      if (!n) by.set(r.entity_id, n = { entity_id: r.entity_id, label: r.label ?? null, kind: r.kind ?? null,
                                        grade: r.grade, matched_by: r.matched_by ?? null, refs: new Set() });
      n.refs.add(r.ref);
      const stronger = (gradeRank[r.grade] || 0) - (gradeRank[n.grade] || 0);
      const rank = (m) => { const i = MATCHED_BY.indexOf(m); return i === -1 ? MATCHED_BY.length : i; };
      if (stronger > 0 || (stronger === 0 && rank(r.matched_by) < rank(n.matched_by))) { n.grade = r.grade; n.matched_by = r.matched_by ?? null; }
    }
    const fold = (n) => (n.label == null ? null : normAlias(n.label));
    const all = [...by.values()].sort((x, y) => ((gradeRank[y.grade] || 0) - (gradeRank[x.grade] || 0))
      || ((fold(x) === null) - (fold(y) === null)) || (fold(x) < fold(y) ? -1 : fold(x) > fold(y) ? 1 : 0)
      || (x.entity_id < y.entity_id ? -1 : x.entity_id > y.entity_id ? 1 : 0));
    return { truncated: all.length > cap, names: all.slice(0, cap).map((n) => ({ entity_id: n.entity_id, label: n.label, kind: n.kind,
      grade: n.grade, established: isEstablished(n.grade), needs_confirmation: n.grade === "C", matched_by: n.matched_by, mentions: n.refs.size })) };
  }

  /* R15, R16: the per-capture collapse, keeping each capture's strongest resolution. It joins on entity_id ONLY:
     a declared relation is NEVER traversed (D-83, R26). */
  static #collapse(rows) {
    const byCapture = new Map();
    for (const r of rows) {
      const cur = byCapture.get(r.capture_sha);
      if (!cur || gradeRank[r.grade] > gradeRank[cur.grade]) byCapture.set(r.capture_sha, r);
    }
    return byCapture;
  }

  /** R15: THE REVERSE INDEX — one entry per capture resolving to the entity, carrying its strongest resolution;
   *  bounded over the resolution rows the join reads (`limit`, `resolution_count`, `truncated`). */
  concerns({ entityId, limit = null, viewer = null } = {}) {
    if (typeof entityId !== "string" || !entityId)
      return noEntity("the reverse index answers by entity id (op=concerns&id=ENT-...)");
    const keep = this.#redactor(viewer);
    const ent = this.#one(`SELECT entity_id, kind, label FROM entities WHERE entity_id=?`, entityId);
    const cap = this.#clamp(limit);
    const scanSql = `SELECT capture_sha, bundle_id, ref, entity_id, grade, method, basis, established, at
                       FROM resolutions WHERE entity_id=? ORDER BY grade, bundle_id, capture_sha LIMIT ?`;
    const scan = this.#rows(scanSql, entityId, cap + 1);
    const truncated = scan.length > cap;
    const rows = truncated ? scan.slice(0, cap) : scan;
    const withdrawn = this.#withdrawnNames([entityId]);
    const defects = this.#defectsOf(scanSql, [entityId, cap], keep);
    const documents = [...Entities.#collapse(rows).values()].map((r) => {
      const bundle = keep(r.bundle_id), hidden = !!r.bundle_id && bundle == null;
      return { capture_sha: r.capture_sha, bundle_id: bundle, ref: r.ref, grade: r.grade, established: !!r.established,
               needs_confirmation: r.grade === "C", method: hidden && r.grade === "D" ? Entities.#TESTIMONY_WITHHELD : r.method,
               at: r.at, withdrawn_name: Entities.#restsOn(withdrawn, r), ...Entities.#defectsFor(defects, r) };
    });
    return { ok: true, entity_id: entityId, found: !!ent,
             entity: ent ? { entity_id: ent.entity_id, kind: ent.kind, label: ent.label } : null,
             count: documents.length, resolution_count: rows.length, documents, limit: cap, truncated };
  }

  /** R16: the same collapse, unbounded and unfiltered, for `connections`, `progressions` and the earned-basis
   *  registry: capture → `{capture_sha, bundle_id, grade}`. */
  strongestByCapture(entityId) {
    const rows = this.#rows(`SELECT capture_sha, bundle_id, grade FROM resolutions WHERE entity_id=? ORDER BY capture_sha`, String(entityId ?? ""));
    const out = new Map();
    for (const [k, r] of Entities.#collapse(rows)) out.set(k, { capture_sha: r.capture_sha, bundle_id: r.bundle_id, grade: r.grade });
    return out;
  }

  /* ===================================================================== *
   * THE NAME LOOKUP (REC-36, REC-40, REC-57, REC-77; R17–R19). IT OFFERS CANDIDATES AND ESTABLISHES NOTHING: no
   * resolution is written and no grade minted. Alias-joined (only a REGISTERED name reaches an abbreviation), over
   * extraction's term index, one statement per alias. GATED AND THE ROW WITHHELD (R18): a candidate is an offer to
   * act on a document, and no count of what was withheld is reported, because that count is the leak.
   * ===================================================================== */

  /** R17, R18. */
  namingDocuments({ entityId = null, limit = NAMING_LIMIT_DEFAULT, viewer = null } = {}) {
    if (typeof entityId !== "string" || !entityId)
      return noEntity(localize("entities.index.the_name_lookup_is_over", "the name lookup is over a REGISTERED subject, named by its id (op=readingname&entity=ENT-...). It reads the registry's own aliases, which is the only thing that reaches a name a document abbreviates."));
    const ent = this.#one(`SELECT entity_id, kind, label FROM entities WHERE entity_id=?`, entityId);
    if (!ent) return noSuchEntity(entityId);
    const aliases = this.#rows(`SELECT alias, alias_norm, canonical FROM entity_aliases WHERE entity_id=? AND withdrawn_at IS NULL
                                 ORDER BY canonical DESC, alias_norm`, entityId);
    const cap = Math.max(1, Math.min(Number(limit) || NAMING_LIMIT_DEFAULT, NAMING_LIMIT_MAX));
    const gate = this.#gate("t.bundle_id", viewer);
    /* REC-77: the corpus THIS READER can see, per source, once — the denominator of every selectivity figure. */
    let corpusBySrc = null;
    const source = {
      matches: (terms) => this.#rows(refTermsSql(terms.length, gate.sql), ...terms, ...gate.args, terms.length, cap),
      /* REC-77: how far this alias reaches, per source, UNCAPPED (`LIMIT -1`, SQLite's no-limit). */
      reach: (terms) => new Map(this.#rows(refReachSql(terms.length, gate.sql), ...terms, ...gate.args, terms.length, -1)
        .map((row) => [row.src, Number(row.n) || 0])),
      corpus: (src) => {
        if (corpusBySrc === null) {
          corpusBySrc = new Map();
          for (const row of this.#rows(`SELECT src, COUNT(*) AS n FROM (SELECT DISTINCT t.capture_sha, t.ref, t.src AS src
                                          FROM reading_ref_terms t WHERE (${gate.sql})) GROUP BY src`, ...gate.args))
            corpusBySrc.set(row.src, Number(row.n) || 0);
        }
        return corpusBySrc.get(src) || 0;
      },
    };
    const got = this.#namingCandidates(entityId, aliases, source, cap, new Map());
    const documents = got.merged.slice(0, cap);
    const truncated = got.merged.length > cap || got.aliasPageFilled;
    return {
      ok: true, entity_id: ent.entity_id, entity_label: ent.label, entity_kind: ent.kind,
      names_used: got.names_used, names_unusable: got.unusable, names_uninformative: got.uninformative,
      count: documents.length, documents, limit: cap, truncated,
      detail: localize("entities.index.these_are_candidates_not_resolutions", "these are CANDIDATES, not resolutions: a document whose reading carries this subject's name — as the reference the source assigned, as that reference's key, or as the name the reading recorded — offered for a member to confirm. Nothing here is established and no grade is minted by asking: op=resolve is the only thing that grades, and 'grade_if_resolved' says what it would mint, or null where the name merely sits inside a longer string and it would mint nothing. A document that carries this subject in words the reading recorded in none of those three, or under a spelling none of its registered names reaches, is still not here, and its absence says nothing about whether it exists.{v1}", { v1: String(truncated ? localize("entities.index.this_is_the_first_list_floor", " THIS IS THE FIRST {cap} AND NOT ALL OF THEM: the answer was cut at the bound this op applied, so a count taken from this list is a floor and never a total.", { cap: String(cap) }) : "") }),
    };
  }

  /* R17, R52: THE ONE CANDIDATE RULE, for one entity's live aliases over a `source` of reference matches: `matches(terms)`
     the (capture, ref, src) groups carrying every term, in (bundle, capture, ref, src) order, at most `cap`; `reach(terms)`
     their uncapped count per src; `corpus(src)` the references the reader can see at that src. R17 reads it from SQL over
     the whole corpus, R52 from one read of the named captures, so both answer by the same code. `tiers` memoises R9's
     tier per reference and may be shared across entities (the tier is the reference's, not the entity's). */
  #namingCandidates(entityId, aliases, source, cap, tiers) {
    const found = new Map(), unusable = [], uninformative = [], uninformativeSeen = new Set();
    let aliasPageFilled = false, idCtx = null;
    for (const a of aliases) {
      const terms = labelTerms(a.alias);
      if (!terms.length) { unusable.push(a.alias); continue; }
      const rows = source.matches(terms);
      if (rows.length >= cap) aliasPageFilled = true;
      const reach = source.reach(terms);
      const uninformativeSrc = new Set([...reach].filter(([src, n]) => isUninformative(n, source.corpus(src))).map(([src]) => src));
      for (const r of rows) {
        const srcText = r.src === "ref" ? r.ref : r.src === "key" ? r.ref_key : r.label;
        const whole = normAlias(srcText) === a.alias_norm;
        const correspondence = CORRESPONDENCE[r.src][whole ? "whole" : "part"];
        /* REC-77: the gate bites only the partial tiers; a whole match is never withheld. */
        if (!whole && uninformativeSrc.has(r.src)) {
          const mark = `${a.alias}\u0000${r.src}`;
          if (!uninformativeSeen.has(mark)) {
            uninformativeSeen.add(mark);
            uninformative.push({ alias: a.alias, source: r.src, reaches: reach.get(r.src) || 0, corpus: source.corpus(r.src) });
          }
          continue;
        }
        const reachN = reach.get(r.src) || 0, corpusN = source.corpus(r.src);
        const selectivity = whole ? null : { source: r.src, reaches: reachN, corpus: corpusN,
                                             value: corpusN > 1 ? Number((1 - reachN / corpusN).toFixed(4)) : null };
        /* THE GRADE COMES FROM THE RECOGNISER ITSELF (R9's cascade), memoised per reference. */
        const tk = `${r.capture_sha}\u0000${r.ref}`;
        let tier = tiers.get(tk);
        if (!tier) { tier = this.recogniseTier(r, idCtx ??= this.#idContext()); tiers.set(tk, tier); }
        const gradeIf = tier.hits.includes(entityId) ? tier.grade : null;
        const where = word(r.src === "ref" ? "entities.text.carries_reference" : r.src === "key" ? "entities.text.carries_reference_key"
                                                                             : "entities.text.labels_reference");
        const cand = {
          capture_sha: r.capture_sha, bundle_id: r.bundle_id, ref: r.ref, kind: r.ref_kind, key: r.ref_key, label: r.label,
          content_type: r.content_type, page: pageOf(r.pos_kind, r.pos), matched_alias: a.alias, canonical_name: !!a.canonical,
          correspondence, matched_on: r.src, selectivity, grade_if_resolved: gradeIf,
          detail: (whole
            ? localize("entities.index.this_document_s_reading_is", "this document's reading {where} '{srcText}', which is this subject's name '{alias}'", { where: String(where), srcText: String(srcText), alias: String(a.alias) })
            : localize("entities.index.this_document_s_reading_carries", "this document's reading {where} '{srcText}', which carries every word of this subject's name '{alias}'", { where: String(where), srcText: String(srcText), alias: String(a.alias) }))
            + (whole && gradeIf == null
              ? localize("entities.index.resolving_this_document_would_record", "; resolving this document would record nothing here, because a stronger identifier on this same reference resolves first") : "")
            + (selectivity && selectivity.value != null
              ? localize("entities.index.that_name_reaches", "; that name reaches {reaches} of the {corpus} references this reader can see at this source", { reaches: String(selectivity.reaches), corpus: String(selectivity.corpus) }) : ""),
        };
        const prev = found.get(tk);
        if (!prev || candOrderCmp(cand, prev) < 0) found.set(tk, cand);
      }
    }
    const merged = [...found.values()].sort((x, y) => candOrderCmp(x, y)
      || String(x.bundle_id).localeCompare(String(y.bundle_id))
      || String(x.capture_sha).localeCompare(String(y.capture_sha))
      || String(x.ref).localeCompare(String(y.ref)));
    return { merged, unusable, uninformative, aliasPageFilled, names_used: aliases.length - unusable.length };
  }

  /** R52 (T35; K1972): R17's candidates for every registered entity of `kinds` over the references of `captureShas`
   *  only, from one bounded read of those captures' term rows (the viewer's gate inside it, so a capture the viewer may
   *  not see is in no figure). Each entity is answered by R17's own candidate rule (`#namingCandidates`) over that
   *  read, the corpus being the named captures' references, so the answer is what R17 would answer were those captures
   *  the whole corpus: entities in id order, each in R17's order, the whole cut at `limit` (1–500, default 200) with
   *  `truncated` by reading one past. Writes nothing. */
  namingIn({ captureShas, kinds, limit = null, viewer = null } = {}) {
    const ks = Array.isArray(kinds) ? kinds : kinds == null ? [] : [kinds];
    const want = [];
    if (!ks.length) return { ok: false, reason: "NO_KIND", detail: localize("entities.index.a_kind_is_named_one_3", "a kind is named: one of {ENTITY_KINDS}. Nothing was read.", { ENTITY_KINDS: String(ENTITY_KINDS.join(", ")) }) };
    for (const kind of ks) {
      const k = typeof kind === "string" ? kind.trim().toLowerCase() : "";
      if (!k) return { ok: false, reason: "NO_KIND", detail: localize("entities.index.a_kind_is_named_one_4", "a kind is named: one of {ENTITY_KINDS}. Nothing was read.", { ENTITY_KINDS: String(ENTITY_KINDS.join(", ")) }) };
      if (!ENTITY_KINDS.includes(k))
        return { ok: false, reason: "UNKNOWN_KIND", kind: k.slice(0, 80), kinds: [...ENTITY_KINDS],
                 detail: localize("entities.index.the_subject_registry_admits_a_4", "the subject registry admits a closed kind vocabulary: one of {ENTITY_KINDS}. Nothing was read.", { ENTITY_KINDS: String(ENTITY_KINDS.join(", ")) }) };
      if (!want.includes(k)) want.push(k);
    }
    const shas = [...new Set((Array.isArray(captureShas) ? captureShas : [])
      .map((x) => (typeof x === "string" ? x.trim().toLowerCase() : "")).filter(Boolean))];
    if (!shas.length) return noSha("the name lookup is over named captured documents, each by its capture sha256");
    if (shas.length > NAMING_IN_CAPTURES_MAX)
      return { ok: false, reason: "TOO_MANY_CAPTURES", count: shas.length, max: NAMING_IN_CAPTURES_MAX,
               detail: localize("entities.index.at_most_naming_in_captures", "at most {NAMING_IN_CAPTURES_MAX} captured documents are looked in at once; {length} were named. Nothing was read.", { NAMING_IN_CAPTURES_MAX: String(NAMING_IN_CAPTURES_MAX), length: String(shas.length) }) };
    const n = Number(limit);
    const cap = limit == null || limit === "" || !Number.isFinite(n) ? NAMING_IN_LIMIT_DEFAULT
      : Math.max(1, Math.min(Math.trunc(n), NAMING_LIMIT_MAX));
    const gate = this.#gate("t.bundle_id", viewer);
    /* THE ONE READ: every term row of the named captures the viewer may see, with its reference's first place. */
    const terms = this.#rows(`SELECT t.capture_sha, t.ref, t.src, t.term, t.bundle_id, rr.ref_kind, rr.ref_key, rr.label,
                                     r.content_type, rr.pos_kind, rr.pos, rr.ref IS NOT NULL AS placed
                                FROM reading_ref_terms t
                                LEFT JOIN reading_refs rr ON rr.capture_sha = t.capture_sha AND rr.ref = t.ref AND rr.seq = 0
                                LEFT JOIN readings r ON r.capture_sha = t.capture_sha
                               WHERE t.capture_sha IN (${shas.map(() => "?").join(",")}) AND (${gate.sql})`,
                             ...shas, ...gate.args);
    const groups = new Map();
    for (const t of terms) {
      const key = `${t.capture_sha}\u0000${t.ref}\u0000${t.src}`;
      let g = groups.get(key);
      if (!g) groups.set(key, g = { row: t, terms: new Set() });
      g.terms.add(t.term);
    }
    const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
    const all = [...groups.values()].sort((x, y) => cmp(x.row.bundle_id, y.row.bundle_id) || cmp(x.row.capture_sha, y.row.capture_sha)
                                                    || cmp(x.row.ref, y.row.ref) || cmp(x.row.src, y.row.src));
    const corpus = new Map();
    for (const g of all) corpus.set(g.row.src, (corpus.get(g.row.src) || 0) + 1);
    const matching = (ts) => all.filter((g) => ts.every((x) => g.terms.has(x)));
    const shape = (g) => ({ capture_sha: g.row.capture_sha, ref: g.row.ref, src: g.row.src, bundle_id: g.row.bundle_id,
                            ref_kind: g.row.ref_kind, ref_key: g.row.ref_key, label: g.row.label, content_type: g.row.content_type,
                            pos_kind: g.row.pos_kind, pos: g.row.pos });
    const source = {
      matches: (ts) => matching(ts).filter((g) => g.row.placed).map(shape),
      reach: (ts) => { const m = new Map(); for (const g of matching(ts).filter((x) => x.row.placed)) m.set(g.row.src, (m.get(g.row.src) || 0) + 1); return m; },
      corpus: (src) => corpus.get(src) || 0,
    };
    const ents = this.#rows(`SELECT entity_id, kind, label FROM entities WHERE kind IN (${want.map(() => "?").join(",")}) ORDER BY entity_id`, ...want);
    const aliasRows = this.#rows(`SELECT a.entity_id, a.alias, a.alias_norm, a.canonical FROM entity_aliases a JOIN entities e ON e.entity_id = a.entity_id
                                   WHERE e.kind IN (${want.map(() => "?").join(",")}) AND a.withdrawn_at IS NULL
                                   ORDER BY a.entity_id, a.canonical DESC, a.alias_norm`, ...want);
    const aliasesOf = new Map();
    for (const a of aliasRows) { if (!aliasesOf.has(a.entity_id)) aliasesOf.set(a.entity_id, []); aliasesOf.get(a.entity_id).push(a); }
    const tiers = new Map(), candidates = [], entities = [];
    for (const e of ents) {
      const got = this.#namingCandidates(e.entity_id, aliasesOf.get(e.entity_id) || [], source, Infinity, tiers);
      for (const c of got.merged) if (candidates.length <= cap) candidates.push({ entity_id: e.entity_id, ...c });
      entities.push({ entity_id: e.entity_id, entity_label: e.label, entity_kind: e.kind, names_used: got.names_used,
                      names_unusable: got.unusable, names_uninformative: got.uninformative, count: got.merged.length });
    }
    const truncated = candidates.length > cap;
    const page = truncated ? candidates.slice(0, cap) : candidates;
    return { ok: true, kinds: want, captures: shas.length, entities, candidates: page, count: page.length,
             limit: cap, truncated,
             detail: localize("entities.index.these_are_candidates_not_resolutions_2", "these are CANDIDATES, not resolutions, for every registered subject of these kinds, looked for only in the named captured documents you can see; each is what the name lookup for that one subject would offer were these documents all there is, and nothing is established or graded by asking{v1}", { v1: String(truncated ? localize("entities.index.this_is_the_first_namingin_floor", ". THIS IS THE FIRST {cap} AND NOT ALL OF THEM, so a count taken from it is a floor.", { cap: String(cap) }) : "") }) };
  }

  /** R19 (N4): the query plan of R17's lookup, so a test can assert the term index CARRIES it. With no terms it
   *  takes the active profiles' `search_terms`; with none held it answers undetermined, never a default. */
  namingPlan(terms = null) {
    let t = Array.isArray(terms) ? terms.map((s) => String(s ?? "").trim()).filter(Boolean) : [];
    let from = "caller";
    if (!t.length) {
      from = "profiles";
      const view = this.view();
      t = [...new Set((Array.isArray(view.search_terms) ? view.search_terms : [])
        .flatMap((s) => labelTerms(s && s.term)))];
      if (!t.length)
        return { ok: true, determined: false, from, terms: [], sql: null, plan: null,
                 why: word("entities.why.terms_given_group") };
    }
    t = t.slice(0, 24);
    const sql = refTermsSql(t.length, "1=1");
    return { ok: true, determined: true, from, terms: t, sql,
             plan: this.#rows(localize("entities.index.explain_query_plan_sql", "EXPLAIN QUERY PLAN {sql}", { sql: String(sql) }), ...t, t.length, NAMING_LIMIT_DEFAULT).map((r) => r.detail) };
  }

  /* ===================================================================== *
   * THE IDENTIFIER-SPACE JUDGEMENT (REC-203; R20–R25), `BIO_Content_Framework_v0_10.md` §8.3: through `id-spaces`'
   * view-first services over the active profiles' view (N6). THE SYSTEM OF EACH END IS READ FROM THE RECORD, never
   * taken from the request: a member's declared origin first (R23, REC-225), else every address the record located
   * the capture at. THE REFERENT READING is the caller's, and the answer says so. WRITES NOTHING.
   * ===================================================================== */

  /** R20 (N6; record-core R26): `jurisdictions.combine` of the instance's `jurisdiction_profiles`; an instance
   *  holding none has an empty view, over which every local fact is undetermined (jurisdictions R16). */
  view() {
    const ids = this.#record && typeof this.#record.getSetting === "function" ? this.#record.getSetting("jurisdiction_profiles") : null;
    const c = combine(Array.isArray(ids) ? ids : []);
    return c && c.ok ? { ...c.view, conflicts: Array.isArray(c.conflicts) ? c.conflicts : [] } : { conflicts: [] };
  }

  /* R22: a capture the record holds (its register home, provenance R48) and the viewer can see, with every address
     the record located it at (`captured_locators`, provenance R48), at most IDMATCH_ADDRESS_LIMIT, one more read
     so a cut is measured. null for an absent or invisible capture, answered alike. */
  #heldCapture(sha, viewer) {
    const k = typeof sha === "string" ? sha.trim().toLowerCase() : "";
    if (!/^[0-9a-f]{64}$/.test(k)) return null;
    const g = viewerPredicate(viewer);
    const r = this.#one(`SELECT r.capture_sha, r.bundle_id FROM register r JOIN bundles b ON b.bundle_id = r.bundle_id
                          WHERE r.capture_sha = ? AND (${g.sql})`, k, ...g.args);
    if (!r) return null;
    const rows = this.#rows(`SELECT DISTINCT address FROM captured_locators WHERE capture_sha = ? ORDER BY address LIMIT ?`,
                            k, IDMATCH_ADDRESS_LIMIT + 1);
    return { capture: k, bundleId: r.bundle_id, addresses: rows.slice(0, IDMATCH_ADDRESS_LIMIT).map((x) => x.address),
             truncated: rows.length > IDMATCH_ADDRESS_LIMIT };
  }

  /* R23 then R22: the system one end was published by. A declared origin names a system of the view by its origin
     or its name when it matches one, else stands as the member declared it. */
  #systemFor(view, held) {
    const p = this.#prov();
    const declared = p && typeof p.originOf === "function" ? p.originOf(held.bundleId) : null;
    if (declared && typeof declared.system === "string" && declared.system) {
      const want = declared.system.trim().toLowerCase();
      const s = (Array.isArray(view.systems) ? view.systems : []).find((x) => x && typeof x.origin === "string"
        && (x.origin.toLowerCase() === want || (typeof x.name === "string" && x.name.toLowerCase() === want)));
      return { origin: s ? s.origin : declared.system, name: s && typeof s.name === "string" ? s.name : declared.system,
               republication: s ? s.republishes === true : false, provenance_stated: s ? s.provenance_stated !== false : true,
               basis: s ? s.basis ?? null : null, from: "declared", declared: { by: declared.by, at: declared.at } };
    }
    if (held.truncated)
      return { origin: null, from: "addresses",
               why: word("entities.why.record_holds_addresses", { idmatch_address_limit: IDMATCH_ADDRESS_LIMIT }) };
    return { ...systemOf(view, held.addresses), from: "addresses" };
  }

  /** R20–R25. */
  idMatch({ space = null, a = null, b = null, aCapture = null, bCapture = null, aName = null, bName = null,
            referent = null, viewer = null } = {}) {
    const view = this.view();
    const all = idSpaces(view);
    const sp = typeof space === "string" ? space.trim().toLowerCase() : "";
    const S = all.find((s) => s.space === sp);
    const profiles = Array.isArray(view.profiles) ? view.profiles : [];
    /* DEC-49 REGION is-idspace-unknown */
    if (!S)
      return idspaceRefusal("IDSPACE_UNKNOWN", { spaces: all.map((s) => s.space),
        detail: localize("entities.index.space_must_be_one_of", "space must be one of {map}", { map: String(all.map((s) => s.space).join(", ")) }) });
    /* END DEC-49 REGION is-idspace-unknown */
    const pair = b != null && String(b).trim() !== "";
    const ra = recogniseId(view, sp, a);
    const rb = pair ? recogniseId(view, sp, b) : null;
    /* DEC-49 REGION is-idspace-value-shape */
    if (!ra || (pair && !rb))
      return idspaceRefusal("IDSPACE_VALUE_NOT_IN_SPACE", { space: sp, forms: S.forms.map((f) => f.form), profiles,
        detail: localize("entities.index.v1_has_the_shape_of", "{v1} has the shape of no form of the {label}{v2}", { v1: String(!ra ? "a" : "b"), label: String(S.label), v2: String(S.forms.length ? "" : "; your team's active jurisdiction profiles give this space no form") }) });
    /* END DEC-49 REGION is-idspace-value-shape */
    /* R21: no assessor vintage is held in the record, so a parcel's standing is judged over none and reads
       UNDETERMINED saying so — never "no such parcel". */
    const shown = (r) => ({ value: r.value, form: r.form, normal: r.normal,
                            ...(r.kind !== undefined ? { kind: r.kind } : {}), ...(r.reach ? { reach: r.reach } : {}),
                            ...(sp === "parcel" ? { standing: parcelStanding(r.normal, {}) } : {}) });
    if (!pair) return { ok: true, space: sp, label: S.label, profiles, evidence: false, a: shown(ra) };
    const heldA = this.#heldCapture(aCapture, viewer), heldB = this.#heldCapture(bCapture, viewer);
    /* DEC-49 REGION is-idspace-capture */
    if (!heldA || !heldB)
      return idspaceRefusal("IDSPACE_CAPTURE_NOT_HELD", {
        detail: localize("entities.index.v1_names_no_captured_document", "{v1} names no captured document this record holds that you can see", { v1: String(!heldA ? "a_capture" : "b_capture") }) });
    /* END DEC-49 REGION is-idspace-capture */
    const reading = referent === "agrees" || referent === "disagrees" ? referent : null;
    const endA = { rec: ra, system: this.#systemFor(view, heldA), name: aName };
    const endB = { rec: rb, system: this.#systemFor(view, heldB), name: bName };
    const j = judgePair(view, sp, endA, endB, reading);
    const sys = (s) => (s.origin
      ? { origin: s.origin, name: s.name, republication: s.republication, provenance_stated: s.provenance_stated,
          basis: s.basis ?? null, from: s.from, ...(s.declared ? { declared: s.declared } : {}) }
      : { origin: null, from: s.from, why: s.why });
    return { ok: true, space: sp, label: S.label, profiles, evidence: false, ...j,
             referent_reading: reading ? word("entities.referent_reading") : null,
             limit: IDMATCH_ADDRESS_LIMIT, a_truncated: heldA.truncated, b_truncated: heldB.truncated,
             a: { ...shown(ra), capture: heldA.capture, system: sys(endA.system), ...(sp === "fund" ? { name: aName ?? null } : {}) },
             b: { ...shown(rb), capture: heldB.capture, system: sys(endB.system), ...(sp === "fund" ? { name: bName ?? null } : {}) } };
  }
}

/* R40 (K3, K718): the Durable Object routes this module answers, as entries of the plane's op map (`plane`'s
   `src/plane/store.mjs` spreads them in). `url` carries the control plane's stamps (`viewer`); `body` the parsed body, whose
   `declaredBy`, `resolvedBy`, `withdrawnBy` and `by` (R38) the control plane stamps (R4). The connection sweep is armed
   on R13's `onResolved` by `scheduler` (its R9, K714), not here. */
export function entitiesOps(e, url, body) {
  const q = (k) => url.searchParams.get(k);
  return {
    readingname: () => e.namingDocuments({ entityId: q("entity"), limit: q("limit"), viewer: q("viewer") }),
    readingnameplan: () => e.namingPlan((q("terms") || "").split(",").map((s) => s.trim()).filter(Boolean)),
    entitycreate: () => e.createEntity(body || {}),
    entityalias: () => e.addAlias(body || {}),
    relationdeclare: () => e.declareRelation(body || {}),
    aliaswithdraw: () => e.withdrawAlias(body || {}),
    relationwithdraw: () => e.withdrawRelation(body || {}),
    resolutiondefect: () => e.reportResolutionDefect(body || {}),
    /* R11, R12: the recogniser and the member's grade-D testimony, the request's body as given. */
    resolve: () => e.resolve(body || {}),
    resolvetestify: () => e.testify(body || {}),
    /* R64 (T51 fix round 3): an administrator confirms an office a member named; `by` is the control plane's stamp (R4). */
    officeconfirm: () => e.confirmOffice(body || {}),
    /* R43 (T33-25): a scheme identifier held on an entity, its `by` the control plane's stamp (R4). */
    entityidentify: () => e.addIdentifier(body || {}),
    entity: () => e.readEntity({ entityId: q("id"), viewer: q("viewer") }),
    entitybyalias: () => e.entitiesByAlias({ alias: q("alias"), viewer: q("viewer") }),
    /* R51 (N699): the group's entities of one kind, paged; `op-declarations` and `control-plane` route it as a member read. */
    /* R54 (T50): `forum_kind`, one value or a comma-separated list, filters to the entities carrying one of them. */
    entitieskind: () => e.entitiesOfKind({ kind: q("kind"), limit: q("limit"), after: q("after"), viewer: q("viewer"),
                                           forum_kind: (q("forum_kind") || "").split(",").map((v) => v.trim()).filter(Boolean) }),
    /* R57 (T51): `ids`, a comma-separated list of entity ids. */
    entityidonly: () => e.onlyByIdentifier({ ids: (q("ids") || "").split(",").map((v) => v.trim()).filter(Boolean), viewer: q("viewer") }),
    /* R59 (T51): Find's subject route; `kinds`, a comma-separated list, narrows it. */
    subjectsnamed: () => e.subjectsNamed({ q: q("q"), kinds: (q("kinds") || "").split(",").map((v) => v.trim()).filter(Boolean),
                                           limit: q("limit"), after: q("after"), viewer: q("viewer") }),
    /* R60 (T51): the near-match check made before `entitycreate`. */
    entitysimilar: () => e.similarSubjects({ name: q("name"), kind: q("kind"), limit: q("limit"), viewer: q("viewer") }),
    relation: () => e.readRelation({ relationId: q("id") }),
    resolutions: () => e.resolutionsFor({ captureSha: q("sha256"), limit: q("limit"), viewer: q("viewer") }),
    concerns: () => e.concerns({ entityId: q("id"), limit: q("limit"), viewer: q("viewer") }),
    idmatch: () => e.idMatch({ space: q("space"), a: q("a"), b: q("b"), aCapture: q("a_capture"), bCapture: q("b_capture"),
                               aName: q("a_name"), bName: q("b_name"), referent: q("referent"), viewer: q("viewer") }),
  };
}

/* R62 (T51; K4168; op-declarations R80, op-grades R49): the ops this module serves that the screens send, declared by their owner beside
   the ops map: each row's class, weight and description are the op's existing rows', its fields are what the arm reads. */
export const DECLARED_OPS = Object.freeze({
  entitycreate: { classes: ["admin","member","probe"], mutating: true, weight: "reasoned", description: localize("entities.declared.entitycreate", "registry write, keyed by entity: registers a subject with the declarer's note on who or what it is and why it belongs in the registry, now required (entities R1, C-91.8; DEC-88: `reasoned`)"),
    fields: { accepts: ["kind","label","note","aliases","sector","proceeding","forum_kind"], requires: ["kind","label","note"] } },
  entityalias: { classes: ["admin","member","probe"], mutating: true, weight: "reversible", description: localize("entities.declared.entityalias", "registry write, keyed by entity"),
    fields: { accepts: ["entityId","alias"], requires: ["entityId","alias"] } },
  aliaswithdraw: { classes: ["admin","member","probe"], mutating: true, weight: "reasoned", description: localize("entities.declared.aliaswithdraw", "registry correction, keyed by (entity, alias): withdraws a mistaken alias with a reason and keeps it, shown as withdrawn"),
    fields: { accepts: ["entityId","alias","reason"], requires: ["entityId","alias","reason"] } },
  relationdeclare: { classes: ["admin","member","probe"], mutating: true, weight: "reasoned", description: localize("entities.declared.relationdeclare", "registry write, keyed by entity pair"),
    fields: { accepts: ["fromEntity","toEntity","relation","justification","citation"], requires: ["fromEntity","toEntity","relation","justification","citation"] } },
  resolve: { classes: ["admin","member","probe"], mutating: true, weight: "reasoned", description: localize("entities.declared.resolve", "recogniser write, keyed by capture sha"),
    fields: { accepts: ["captureSha","ref","items"], requires: [["captureSha","items"]] } },
  resolvetestify: { classes: ["admin","member","probe"], mutating: true, weight: "reasoned", description: localize("entities.declared.resolvetestify", "recogniser testimony, keyed by capture sha"),
    fields: { accepts: ["captureSha","ref","entityId","basis"], requires: ["captureSha","ref","entityId","basis"] } },
  resolutiondefect: { classes: ["admin","member","probe"], mutating: true, weight: "reasoned", description: localize("entities.declared.resolutiondefect", "registry correction, keyed by a resolution: reports with a reason that a recogniser's resolution paired a reference with the wrong entity, and changes no resolution"),
    fields: { accepts: ["captureSha","ref","entityId","reason","source"], requires: ["captureSha","ref","entityId","reason"] } },
  /* R62 (T51 fix round 3; C64; DEC-401, DEC-402): the administrator's confirm of an office a member named (R64). A member reaches the
     arm and is refused `NOT_AN_ADMIN` by it, as at memberAdd; `by` is the control plane's stamp, not an accept. */
  officeconfirm: { classes: ["admin","member","probe"], mutating: true, weight: "reversible", description: localize("entities.declared.officeconfirm", "registry write, keyed by entity: an administrator confirms an office a member named from a request, clearing its mark"),
    fields: { accepts: ["entityId"], requires: ["entityId"] } },
  /* R62 (T51; K4243; op-declarations R80, op-grades R49): a read, so its class and mutating are the hand row's. `alias` is what the
     arm reads; a call without it answers `count: 0`, not a refusal, so no field is required. */
  entitybyalias: { classes: ["admin","member","probe"], mutating: false, weight: "read", description: localize("entities.declared.entitybyalias", "read: the entities holding an alias's fold through a live alias, keyed by alias; writes nothing"),
    fields: { accepts: ["alias"], requires: [] } },
  /* R62 (T51; K4243, K4337): the document screen sends it for what the reading named and left unmatched (R14's `unresolved`).
     A read, so its class and mutating are the hand row's; without `sha256` it is refused `NO_SHA`. */
  resolutions: { classes: ["admin","member","probe"], mutating: false, weight: "read", description: localize("entities.declared.resolutions", "read: a captured document's resolutions, the names it carries and the references no subject holds, keyed by capture sha"),
    fields: { accepts: ["sha256","limit"], requires: ["sha256"] } },
});
